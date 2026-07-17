# Execution Blueprint: Enterprise Dead Code Detection Platform
### From Research to Implementation — Component Specs, Milestones, Repo Structure, Backlog, Risk Register

This document is the single source of truth for implementation. It assumes the prior four documents (five whitepapers, comparative evaluation, build-vs-buy analysis, technical review) as settled context and does not re-argue them. Where a decision was made previously (e.g., Postgres over Neo4j, SCIP+Glean over custom indexing, no autonomous deletion), it is treated here as fixed unless flagged in Section 5 (Risk Register) as still open.

---

## 1. Component Specifications

Each component below defines: responsibility, public interface, dependencies, inputs/outputs, OSS reuse, and custom code required. Components are named to be used verbatim in code (package/service names) later in Section 3.

### 1.1 `indexer-runner` (per-language SCIP indexing orchestrator)

- **Responsibility:** invoke the correct SCIP indexer for each file/repo, validate output, store raw SCIP index artifacts.
- **Public interface:**
  - `run_index(repo_id, commit_sha, language) -> IndexArtifact{scip_path, status, error?}`
  - `supported_languages() -> [Language]`
- **Dependencies:** none upstream (leaf component); called by `ingestion-orchestrator`.
- **Inputs:** repo checkout (shallow clone at commit SHA), language hint or auto-detection.
- **Outputs:** SCIP protobuf index file, written to content-addressed object storage; a status record (success/partial/failed + error detail).
- **OSS reused:** `scip-typescript`, `scip-python`, `scip-java`, `scip-go`, `scip-clang` (as available); each invoked as a subprocess with its native CLI.
- **Custom code:** a thin wrapper per language (subprocess invocation, timeout/retry handling, output validation against the SCIP protobuf schema); a language-detection fallback (file extension + manifest sniffing) for repos without config.

### 1.2 `scip-normalizer`

- **Responsibility:** parse SCIP protobuf output and lift it into our unified graph schema (Symbol, File, Package nodes; imports/calls/implements edges), tagged with repo/package/version provenance.
- **Public interface:**
  - `normalize(scip_index_path, repo_id, commit_sha) -> GraphDelta{nodes[], edges[]}`
- **Dependencies:** `indexer-runner` (upstream producer), `graph-writer` (downstream consumer).
- **Inputs:** SCIP protobuf file.
- **Outputs:** `GraphDelta` — a batch of typed node/edge upserts in our schema (Section 1.7).
- **OSS reused:** official SCIP protobuf definitions/bindings (`sourcegraph/scip` proto schema) for parsing.
- **Custom code:** all of the SCIP → unified-schema mapping logic (this is genuinely ours — SCIP's symbol-ID string format needs to be parsed into our Package/Repo/Version node identity scheme).

### 1.3 `glean-adapter`

- **Responsibility:** feed normalized SCIP facts into Glean (as an additional cross-repo symbol substrate) and expose an Angle-query wrapper for "who references symbol X" queries.
- **Public interface:**
  - `ingest(scip_index_path, repo_id) -> IngestResult`
  - `find_references(symbol_id) -> [Reference{repo_id, file, line, symbol_id}]`
- **Dependencies:** Glean server (external service, self-hosted); consumed by `evidence-collector`.
- **Inputs:** SCIP index files (Glean has native SCIP/LSIF ingestion for supported languages).
- **Outputs:** reference lists per symbol.
- **OSS reused:** Glean (`facebookincubator/glean`) — server, Angle query language, SCIP ingestion path.
- **Custom code:** thin client wrapper; Angle query templates for our specific "who references X across repos/versions" question.

### 1.4 `registry-crawler`

- **Responsibility:** discover declared dependencies across the org by crawling internal package registries and repo manifests; produce declared-dependency edges and version-alignment data.
- **Public interface:**
  - `crawl_registry(registry_config) -> [DeclaredDependency{consumer_repo, producer_package, version_range}]`
  - `crawl_manifests(repo_id) -> [ManifestDependency]`
- **Dependencies:** none upstream; feeds `graph-writer` and `evidence-collector`.
- **Inputs:** registry API credentials/config (Artifactory, Nexus, npm/PyPI/Maven mirror endpoints), repo manifest files (`package.json`, `go.mod`, `pom.xml`, etc.).
- **Outputs:** declared-dependency edges with version metadata.
- **OSS reused:** existing client libraries per registry type (`artifactory-python`, `pynpm`, Maven resolver libraries) — no custom registry protocol implementation.
- **Custom code:** manifest parsers only for formats without a good existing library (rare); the join/normalization logic mapping registry package names to our canonical Package node identity.

### 1.5 `runtime-collector`

- **Responsibility:** ingest OpenTelemetry trace/span data (and optionally JVM bytecode-agent liveness bitmaps for orgs that need method-level granularity) and aggregate into per-symbol "last observed" timestamps with configurable decay.
- **Public interface:**
  - `ingest_otel_batch(spans[]) -> void`
  - `get_last_observed(symbol_id, window_days) -> ObservationRecord{last_seen, frequency, window_coverage}`
- **Dependencies:** OTel Collector (external, existing org infra or newly deployed); feeds `evidence-collector`.
- **Inputs:** OTel spans (via OTLP), optionally Codekvast-style JVM agent liveness events.
- **Outputs:** per-symbol observation records.
- **OSS reused:** OpenTelemetry Collector + SDKs; Codekvast (optional, JVM-only, only if method-level granularity is demonstrated necessary — see Risk Register 5.3).
- **Custom code:** span-attribute-to-symbol-ID mapping (route → handler symbol, RPC method → implementation symbol); the aggregation/decay computation; low-frequency-pattern handling (don't treat absence as evidence until window ≥ configured minimum).

### 1.6 `infra-extractor`

- **Responsibility:** parse Kubernetes/Helm/Terraform/Docker/CI manifests and emit infra-wiring edges (image → repo, deployment replica count, entrypoint).
- **Public interface:**
  - `extract_k8s(manifest_path) -> [InfraEdge]`
  - `extract_terraform(plan_json) -> [InfraEdge]`
  - `extract_dockerfile(path) -> {entrypoint, image_labels}`
- **Dependencies:** none upstream; feeds `graph-writer`.
- **Inputs:** raw IaC files or `terraform show -json` plan output.
- **Outputs:** InfraResource nodes and `deploys`/`routes_to` edges.
- **OSS reused:** `client-go` schemas (K8s), Terraform's own JSON plan format + `hcl` parser, Helm Go SDK for template rendering.
- **Custom code:** the image-tag → repo correlation join (recommend requiring OCI `org.opencontainers.image.source` labels as an org convention rather than heuristic inference — see Risk Register 5.4); per-format edge-extraction glue.

### 1.7 `unified-graph` (schema + storage + query library)

- **Responsibility:** the single system of record for all nodes/edges from every producer above; owns the Postgres schema, upsert semantics, and the standard query set (reverse reachability, blast radius).
- **Public interface:**
  - `upsert(GraphDelta) -> void`
  - `reverse_reachable_from(root_set) -> Set[NodeId]` (bulk, memoized)
  - `blast_radius(node_id) -> [NodeId]` (forward BFS of dependents)
  - `get_node(node_id) -> Node`, `get_edges(node_id, direction, type?) -> [Edge]`
- **Dependencies:** Postgres (or Postgres + AGE extension if/when justified — see Risk Register 5.1); consumed by every producer component above and by `confidence-engine`.
- **Inputs:** `GraphDelta` batches from all producers.
- **Outputs:** query results as above.
- **OSS reused:** Postgres itself; no ORM assumed — recommend hand-written SQL with recursive CTEs for reachability queries, wrapped in a typed query library (e.g., `sqlc`-generated or equivalent for the implementation language) for compile-time safety.
- **Custom code:** the schema (node/edge tables, JSONB metadata columns for per-type attributes, indexes for reverse-reachability performance), the recursive-CTE reachability queries, the upsert/versioning logic (content-hash-based node identity so re-indexing an unchanged file is a no-op).

### 1.8 `evidence-collector`

- **Responsibility:** the join layer — for a given candidate symbol, gather all evidence (static reachability from `unified-graph`, cross-repo references from `glean-adapter`, declared/version-aligned usage from `registry-crawler` output, infra wiring from `infra-extractor` output, runtime observations from `runtime-collector`) into a single `EvidenceBundle`.
- **Public interface:**
  - `collect(symbol_id) -> EvidenceBundle{static_edges[], cross_repo_refs[], infra_edges[], runtime_obs, historical}`
- **Dependencies:** `unified-graph`, `glean-adapter`, `runtime-collector`.
- **Inputs:** a symbol ID.
- **Outputs:** `EvidenceBundle`.
- **OSS reused:** none directly — pure orchestration.
- **Custom code:** all of it, but it's a thin fan-out/fan-in over the other components' APIs, not novel logic.

### 1.9 `confidence-engine` (the core differentiator — see build-vs-buy Section 10)

- **Responsibility:** convert an `EvidenceBundle` into a `ConfidenceScore` (0–1) and `ConfidenceTier` (Confirmed Dead / Likely Dead / Inconclusive / Likely Alive / Confirmed Alive), with a full audit trail back to source evidence; detect and flag contradictions explicitly.
- **Public interface:**
  - `score(evidence_bundle) -> ScoredResult{score, tier, evidence_refs[], contradiction: bool}`
  - `configure_weights(weight_config) -> void` (org-tunable, versioned)
- **Dependencies:** `evidence-collector` (upstream), `reporting-engine` and `cli` (downstream consumers).
- **Inputs:** `EvidenceBundle`.
- **Outputs:** `ScoredResult`.
- **OSS reused:** none — this is bespoke logic by design.
- **Custom code:** the noisy-OR aggregation function, the asymmetric weighting scheme, the contradiction-detection logic (static-dead + runtime-alive → flag as "analyzer gap," not just low confidence), the audit-trail serialization. This is the single component warranting the most design review, pairing, and test coverage in the entire project.

### 1.10 `framework-plugins` (Knip/Vulture wrappers + custom DI plugins)

- **Responsibility:** run existing tools for JS/TS and Python, and host custom DI/annotation-convention detectors for JVM/.NET, producing root-set-expansion and synthesized-edge evidence.
- **Public interface:**
  - `PluginInterface { detect(repo_checkout) -> [SynthesizedEdge] }` — a stable interface all plugins (wrapped OSS or custom) implement.
  - Concrete implementations: `KnipPlugin`, `VulturePlugin`, `SpringDIPlugin`, `AspNetDIPlugin`.
- **Dependencies:** none upstream; feeds `graph-writer` as another edge producer.
- **Inputs:** repo checkout.
- **Outputs:** `SynthesizedEdge` list (e.g., "interface X implemented-and-live-via-DI by class Y").
- **OSS reused:** Knip, Vulture, invoked as subprocesses; output parsed from their JSON/text report formats.
- **Custom code:** the `PluginInterface` contract itself; `SpringDIPlugin`/`AspNetDIPlugin` (annotation/attribute scanning — real, non-trivial custom work, scoped narrowly per Milestone 7).

### 1.11 `reporting-engine`

- **Responsibility:** turn `ScoredResult`s into human-consumable output — dashboard views, PR-ready diffs, audit trail links.
- **Public interface:**
  - `generate_report(scope: repo|package|org) -> Report`
  - `generate_pr_diff(symbol_ids[]) -> DiffProposal`
- **Dependencies:** `confidence-engine`, `unified-graph`.
- **Inputs:** a query scope.
- **Outputs:** rendered report (web view) or diff proposal object.
- **OSS reused:** standard web framework for the dashboard; a codemod library only where needed (`ts-morph`, `libcst`) for actual line removal, not custom AST rewriting.
- **Custom code:** report templates, diff-proposal assembly logic tying scores back to specific lines.

### 1.12 `pr-bot`

- **Responsibility:** open pull requests for "Confirmed Dead" tier findings, attach evidence trail, request human review; never merges automatically.
- **Public interface:**
  - `open_removal_pr(diff_proposal) -> PullRequestRef`
- **Dependencies:** `reporting-engine`; GitHub/GitLab API.
- **Inputs:** `DiffProposal`.
- **Outputs:** created PR reference.
- **OSS reused:** GitHub/GitLab official API clients; `probot`-style bot scaffolding if on GitHub.
- **Custom code:** PR body templating (evidence trail rendering), branch/commit creation logic.

### 1.13 `cli`

- **Responsibility:** developer-facing entry point — "what's dead in this diff," "what's the blast radius of deleting X," ad hoc queries.
- **Public interface:** command-line commands mapping directly to `unified-graph` and `confidence-engine` queries.
- **Dependencies:** `unified-graph`, `confidence-engine`.
- **OSS reused:** standard CLI framework for the implementation language.
- **Custom code:** command definitions and output formatting only.

### 1.14 `ingestion-orchestrator`

- **Responsibility:** the scheduling/coordination layer — receives VCS webhooks, determines the minimal re-indexing set (changed files/repos), dispatches jobs to a queue, and sequences the producer components (1.1–1.6) followed by `graph-writer` upserts.
- **Public interface:**
  - `handle_webhook(payload) -> [DispatchedJob]`
  - `dispatch(job) -> JobId`
- **Dependencies:** all producer components (1.1–1.6); a managed queue (SQS/Cloud Tasks or existing CI runner queue — not a self-hosted broker, per build-vs-buy Section 9).
- **Custom code:** webhook parsing, changed-file-set diffing, job dispatch logic. No custom queue implementation.

---

## 2. Milestones

Each milestone is independently buildable and testable, ships working functionality, and minimizes forward dependency (later milestones depend on earlier ones; earlier milestones never assume later ones exist).

### Milestone 0 — Single-repo, single-language static reachability CLI

- **Objective:** prove the SCIP → graph → query pipeline end to end on one language, one repo, with a CLI answering "what's unreferenced here."
- **Deliverables:** `indexer-runner` (TypeScript only), `scip-normalizer`, `unified-graph` (Postgres schema v1: File/Symbol nodes, imports/calls edges only), `cli` with a single `find-unreferenced` command.
- **Dependencies:** none (first milestone).
- **Complexity:** Medium (schema design is the hard part; SCIP indexer invocation is straightforward).
- **Risks:** SCIP symbol-ID parsing edge cases (re-exports, ambient declarations) could under- or over-count references. Mitigate with a test corpus of known-tricky TS patterns (barrel files, `export *`, namespace merging).
- **Testing strategy:** golden-file tests — a fixture TS repo with known dead/live symbols, asserting the CLI output matches exactly.
- **Definition of done:** running the CLI against the fixture repo and against one real internal TS repo produces a reviewed-correct unreferenced-symbol list with zero known false negatives on the fixture set.

### Milestone 1 — Multi-language support (add Python, Go, Java)

- **Objective:** generalize `indexer-runner`/`scip-normalizer` beyond TypeScript.
- **Deliverables:** language-specific indexer wrappers for Python (`scip-python`), Go (`scip-go`), Java (`scip-java`); schema extended for cross-language Package nodes.
- **Dependencies:** Milestone 0.
- **Complexity:** Low-Medium per language (each is "wrap another CLI"), but nonzero — expect SCIP output quality to vary per indexer's maturity.
- **Risks:** `scip-python`/`scip-go` maturity may lag `scip-typescript`; validate each against its own fixture corpus before trusting it in the same pipeline.
- **Testing strategy:** per-language golden-file fixture repos, same pattern as Milestone 0.
- **Definition of done:** all four languages produce correct `find-unreferenced` output on their respective fixtures; CLI works against a real polyglot repo.

### Milestone 2 — Monorepo/workspace-aware root-set discovery

- **Objective:** correctly handle workspace protocols (npm workspaces, Go modules, Maven multi-module) so entry-point/root-set discovery doesn't produce false positives in monorepos.
- **Deliverables:** workspace manifest parsers feeding root-set configuration into `unified-graph` queries.
- **Dependencies:** Milestone 1.
- **Complexity:** Medium.
- **Risks:** every workspace tool has its own resolution quirks (path aliases, hoisting); scope explicitly to the 2–3 workspace tools actually in use at the org, not a generic solution.
- **Testing strategy:** fixture monorepo per workspace tool in scope.
- **Definition of done:** zero false positives on the fixture monorepos attributable to workspace-resolution gaps.

### Milestone 3 — Framework plugins (Knip + Vulture integration)

- **Objective:** wire `framework-plugins` (Section 1.10) for JS/TS and Python as additional edge producers, cutting the dominant false-positive source for those ecosystems.
- **Deliverables:** `KnipPlugin`, `VulturePlugin` wrappers; `PluginInterface` contract defined and stable.
- **Dependencies:** Milestone 1.
- **Complexity:** Low (subprocess wrapping + output parsing).
- **Risks:** Knip/Vulture config drift (org repos may lack correct Knip config) — treat missing/incomplete config as a data-quality issue to flag, not a platform bug.
- **Testing strategy:** run against fixture repos with known DI/dynamic-export patterns; assert previously-false-positive symbols are now correctly suppressed.
- **Definition of done:** demonstrated reduction in false positives on a curated "known tricky" fixture set, measured before/after.

### Milestone 4 — Glean integration + cross-repo references

- **Objective:** stand up Glean, feed it SCIP output, and answer "is this symbol referenced anywhere in the org" across ≥2 repos.
- **Deliverables:** `glean-adapter`, Glean server deployment (containerized), integration into `evidence-collector` (first version — static-only evidence at this point).
- **Dependencies:** Milestone 1 (needs multi-repo SCIP output to be meaningful).
- **Complexity:** Medium-High (Glean operational maturity is the main unknown — see Risk Register 5.2).
- **Risks:** Glean's non-Meta operational track record is thin; budget time for rough edges in deployment/ops, not just integration code.
- **Testing strategy:** two fixture repos, one consuming a symbol from the other; assert cross-repo reference is found and a same-named-but-unrelated symbol in a third repo is not falsely matched.
- **Definition of done:** cross-repo reference query returns correct results on the two/three-repo fixture set and on one real pair of internal repos with a known shared library relationship.

### Milestone 5 — Confidence engine v1 (static evidence only)

- **Objective:** ship the first version of the actual differentiator, scoring purely on static + cross-repo evidence gathered so far.
- **Deliverables:** `confidence-engine` with noisy-OR aggregation, configurable weights, tier classification, audit trail; `evidence-collector` v1.
- **Dependencies:** Milestones 1–4.
- **Complexity:** Medium (the algorithm is simple; the audit-trail plumbing and contradiction detection require care).
- **Risks:** default weights are illustrative, not calibrated (flagged explicitly in UI/docs) — do not let this milestone slip waiting for calibration data that doesn't exist yet.
- **Testing strategy:** unit tests per evidence-combination scenario (single strong-alive signal overriding many weak-dead signals; contradiction detection triggering correctly); a labeled fixture set of symbols with known ground truth (dead/alive) scored and checked against expected tier.
- **Definition of done:** all evidence-combination unit tests pass; fixture set scoring matches expected tiers with zero "Confirmed Dead" false positives (this tier's false-positive rate is the one number that matters most at this stage).

### Milestone 6 — Registry crawler + version alignment

- **Objective:** add declared-dependency and version-skew evidence to the graph and confidence engine.
- **Deliverables:** `registry-crawler` for the org's actual registries (start with whichever 1–2 the org actually runs); version-alignment logic in `evidence-collector`.
- **Dependencies:** Milestone 5 (needs the confidence engine to consume the new evidence type meaningfully).
- **Complexity:** Medium.
- **Risks:** registry API rate limits/auth complexity; package name normalization across ecosystems is fiddly.
- **Testing strategy:** fixture registry (mocked API) with known declared-but-unused and declared-and-used dependencies; assert correct edge classification.
- **Definition of done:** correct declared-dependency edges produced against the fixture registry and against one real internal registry, with version-skew case (old version still consumed downstream) correctly detected in a constructed test scenario.

### Milestone 7 — DI/reflection convention plugins (JVM/.NET)

- **Objective:** close the largest remaining false-positive gap for DI-heavy codebases.
- **Deliverables:** `SpringDIPlugin` (annotation-based bean detection → synthesized edges), `AspNetDIPlugin` if .NET is in scope for the org.
- **Dependencies:** Milestone 3 (plugin interface established there).
- **Complexity:** Medium-High (this is genuinely novel engineering, not integration).
- **Risks:** DI convention coverage is inherently incomplete (custom/unusual DI patterns will still slip through) — scope explicitly to the top 2–3 conventions observed in the org's actual repos, document known gaps rather than claiming completeness.
- **Testing strategy:** fixture Spring/ASP.NET repos with known DI-only-reachable classes; assert these are no longer flagged as dead.
- **Definition of done:** zero false positives on the DI fixture set for the specific conventions in scope; documented list of out-of-scope conventions.

### Milestone 8 — Infrastructure extraction

- **Objective:** add IaC-derived infra-wiring evidence.
- **Deliverables:** `infra-extractor` for Kubernetes + Docker (start with these two; Terraform/Helm as a follow-on within the same milestone if time permits, else split).
- **Dependencies:** Milestone 5.
- **Complexity:** Medium.
- **Risks:** image-tag-to-repo correlation reliability depends on the org adopting the OCI label convention (Risk Register 5.4) — if the org can't adopt it, this milestone's accuracy ceiling drops and that should be flagged, not silently accepted.
- **Testing strategy:** fixture K8s manifests + Dockerfiles with known live/scaled-to-zero deployments; assert correct InfraResource liveness classification.
- **Definition of done:** correct infra-liveness edges on fixture manifests and on the org's actual K8s cluster for a sample namespace.

### Milestone 9 — Microservice contract edges (REST/gRPC first)

- **Objective:** add producer/consumer contract evidence for the org's dominant protocol(s).
- **Deliverables:** OpenAPI-based REST edge extractor; gRPC/Protobuf edge extractor. GraphQL/Kafka deferred to a follow-on milestone if not immediately needed.
- **Dependencies:** Milestone 8 (infra edges are corroborating evidence for contract edges, per the sequencing rationale in the whitepapers, retained here).
- **Complexity:** Medium.
- **Risks:** route/RPC-method-to-handler-symbol mapping requires framework-specific knowledge (similar shape to Milestone 3/7 work).
- **Testing strategy:** fixture services with a known abandoned endpoint (no caller anywhere) and a known live one; assert correct classification.
- **Definition of done:** correct classification on fixture services; validated against at least one real abandoned endpoint the org already knows about (if one is known) as a sanity check.

### Milestone 10 — Runtime evidence via OpenTelemetry

- **Objective:** add the highest-leverage remaining evidence source.
- **Deliverables:** `runtime-collector` OTel ingestion, span-to-symbol mapping for at least REST routes (extend to RPC methods as time permits), aggregation/decay logic.
- **Dependencies:** Milestone 9 (route/RPC-to-symbol mapping reused from contract extraction).
- **Complexity:** Medium-High (mapping fidelity is the hard part; ingestion itself is standard OTel plumbing).
- **Risks:** observation-window sufficiency (Risk Register 5.5) — a short window will produce false "dead" signals for legitimately low-frequency code paths.
- **Testing strategy:** synthetic OTel span stream against fixture symbols; assert correct last-observed aggregation and correct decay behavior over simulated time.
- **Definition of done:** correct aggregation on synthetic spans; validated against real OTel data from one org service with known traffic patterns (spot-check against a route known to be actively hit).

### Milestone 11 — Reporting, PR bot, CI integration

- **Objective:** ship the action layer — make findings actionable.
- **Deliverables:** `reporting-engine` (dashboard + diff proposals), `pr-bot`, CI webhook integration via `ingestion-orchestrator`.
- **Dependencies:** Milestone 10 (needs full evidence pipeline to produce trustworthy "Confirmed Dead" tier results before opening real PRs).
- **Complexity:** Medium.
- **Risks:** PR-bot output must never merge automatically — enforce this as a hard invariant with a test that specifically asserts no merge capability exists in the bot's code path, not just a policy statement.
- **Testing strategy:** end-to-end test — fixture repo with a Confirmed Dead symbol, assert a PR is opened with correct diff and evidence trail, and assert no auto-merge occurs under any configuration.
- **Definition of done:** full pipeline (webhook → indexing → scoring → PR) runs on a real internal repo in a staging environment, producing at least one correct, human-approvable removal PR.

### Milestone 12 — Scale hardening (incremental indexing, caching, partitioning)

- **Objective:** validate and optimize for the org's real scale (hundreds of repos).
- **Deliverables:** content-hash-based caching for indexing, incremental re-computation on changed-file sets only, query-performance validation for `unified-graph` reachability queries at real data volume.
- **Dependencies:** Milestone 11 (needs the full pipeline running in production to have real load data to optimize against).
- **Complexity:** Medium-High.
- **Risks:** this is exactly where the Postgres-vs-graph-database decision (Risk Register 5.1) gets tested against real numbers — treat this milestone as the designated checkpoint for that decision, not an assumption to revisit earlier.
- **Testing strategy:** load testing against a synthetic graph at target scale (hundreds of repos' worth of nodes/edges); latency benchmarks for the standard query set.
- **Definition of done:** reverse-reachability and blast-radius queries complete within an agreed SLA (e.g., PR-gate queries under 90 seconds) at full org scale in a load test.

---

## 3. Repository Structure

```
dead-code-platform/
├── README.md                          # architecture overview, links to all design docs
├── docs/
│   ├── architecture/
│   │   ├── unified-graph-schema.md    # node/edge types, ERD
│   │   ├── confidence-model.md        # scoring algorithm, weight config, worked examples
│   │   ├── decision-log.md            # ADRs: Postgres-over-Neo4j, SCIP+Glean, etc.
│   │   └── evidence-sources.md        # per-source semantics and reliability class
│   ├── plugins/
│   │   └── writing-a-plugin.md        # PluginInterface contract + example
│   ├── runbooks/
│   │   ├── glean-operations.md
│   │   └── incident-response.md
│   └── milestones/                    # one file per milestone, living status doc
│
├── services/                          # deployable, independently-runnable services
│   ├── ingestion-orchestrator/
│   ├── indexer-runner/
│   ├── glean-adapter/
│   ├── runtime-collector/
│   ├── confidence-engine/
│   ├── reporting-engine/
│   └── pr-bot/
│
├── libs/                               # shared libraries, imported by services + cli
│   ├── graph-schema/                  # typed node/edge definitions, shared across all producers
│   ├── unified-graph/                 # Postgres access layer, migrations, query library
│   ├── scip-normalizer/
│   ├── registry-crawler/
│   ├── infra-extractor/
│   ├── evidence-collector/
│   └── plugin-sdk/                    # PluginInterface + test harness for plugin authors
│
├── plugins/                           # concrete plugin implementations, one dir each
│   ├── knip-plugin/
│   ├── vulture-plugin/
│   ├── spring-di-plugin/
│   └── aspnet-di-plugin/
│
├── cli/
│   └── deadcode-cli/
│
├── fixtures/                           # golden-file test repos, one per language/pattern
│   ├── ts-monorepo-basic/
│   ├── ts-tricky-exports/
│   ├── python-dynamic-imports/
│   ├── go-multi-module/
│   ├── java-spring-di/
│   └── k8s-terraform-samples/
│
├── infra/                              # deployment configs for our own services
│   ├── docker-compose.dev.yml
│   ├── k8s/
│   └── terraform/
│
└── scripts/
    ├── seed-fixtures.sh
    └── run-integration-suite.sh
```

**Rationale:**
- `services/` vs `libs/` split matters: services are deployable units with their own lifecycle; libs are shared code with no independent runtime. This prevents the common failure mode of turning every component from Section 1 into an over-networked microservice — several Section-1 "components" (e.g., `scip-normalizer`, `unified-graph`, `evidence-collector`) are libraries, not services, and should be imported in-process by whichever service needs them, not deployed separately.
- `plugins/` is separate from `libs/plugin-sdk` deliberately, so the interface contract and its implementations can version independently and a plugin author (internal or eventually external) only needs to depend on `plugin-sdk`, not the whole monorepo.
- `fixtures/` is first-class and versioned alongside code, not an afterthought — every milestone's Definition of Done depends on a specific fixture, so fixtures are load-bearing test infrastructure.
- `docs/architecture/decision-log.md` is where the build-vs-buy calls get recorded as ADRs (Architecture Decision Records) so future engineers don't relitigate "why Postgres not Neo4j" without reading the reasoning first.

---

## 4. Engineering Backlog

Tasks are scoped to be completable by a single agent/engineer in one session (roughly a few hours of focused work each). Each has objective, expected inputs/outputs, acceptance criteria, and dependencies.

### Milestone 0 tasks

**T0.1 — Define unified graph schema v1 (File, Symbol nodes; imports/calls edges)**
- Objective: write the Postgres migration for the initial schema.
- Inputs: node/edge type list from Component Spec 1.7.
- Outputs: SQL migration file creating `nodes`, `edges` tables with JSONB metadata columns, appropriate indexes for reverse-adjacency lookup.
- Acceptance criteria: migration applies cleanly on a fresh Postgres instance; a manually-inserted sample graph (5 nodes, 4 edges) can be queried for reverse-reachability via a hand-written recursive CTE.
- Dependencies: none.

**T0.2 — Implement `indexer-runner` for TypeScript**
- Objective: wrap `scip-typescript` CLI invocation.
- Inputs: repo path, tsconfig location.
- Outputs: SCIP index file path + status record.
- Acceptance criteria: running against `fixtures/ts-monorepo-basic` produces a valid SCIP file (parseable by the SCIP protobuf schema) with no errors.
- Dependencies: T0.1 not required (independent).

**T0.3 — Implement `scip-normalizer`**
- Objective: parse SCIP output into `GraphDelta`.
- Inputs: SCIP file from T0.2.
- Outputs: `GraphDelta` (nodes/edges matching T0.1 schema).
- Acceptance criteria: normalizing the fixture SCIP file produces the expected node/edge count (asserted against a hand-verified fixture manifest file listing expected symbols).
- Dependencies: T0.1, T0.2.

**T0.4 — Implement `unified-graph` upsert + reverse-reachability query**
- Objective: write the query library functions `upsert(GraphDelta)` and `reverse_reachable_from(roots)`.
- Inputs: `GraphDelta` from T0.3.
- Outputs: populated Postgres tables; a function returning the set of unreachable symbols given a root set.
- Acceptance criteria: against the fixture repo, the returned unreachable-symbol set exactly matches a hand-labeled expected list committed alongside the fixture.
- Dependencies: T0.1, T0.3.

**T0.5 — Build `find-unreferenced` CLI command**
- Objective: wire T0.2–T0.4 into a runnable CLI command.
- Inputs: a repo path argument.
- Outputs: printed list of unreferenced symbols.
- Acceptance criteria: running `deadcode-cli find-unreferenced fixtures/ts-monorepo-basic` produces output matching the hand-labeled expected list, exactly.
- Dependencies: T0.1–T0.4.

**T0.6 — Golden-file test harness**
- Objective: create the reusable test pattern (fixture repo + expected-output file + assertion runner) used by every subsequent milestone's fixtures.
- Inputs: none (infrastructure task).
- Outputs: a test runner script/framework that other fixtures can plug into.
- Acceptance criteria: T0.5's test can be expressed using this harness and passes in CI.
- Dependencies: T0.5.

### Milestone 1 tasks (repeat per language; shown once for Python, replicate pattern for Go/Java)

**T1.1 — Implement `indexer-runner` for Python (`scip-python`)**
- Objective/Inputs/Outputs: mirror T0.2 for Python.
- Acceptance criteria: valid SCIP output against `fixtures/python-dynamic-imports`.
- Dependencies: T0.2 (pattern reuse, not a hard code dependency).

**T1.2 — Extend `scip-normalizer` for cross-language Package node identity**
- Objective: ensure normalized output correctly tags nodes with a canonical Package identity that disambiguates same-named packages across ecosystems.
- Inputs: SCIP output from multiple languages.
- Outputs: updated `GraphDelta` producer logic.
- Acceptance criteria: a constructed test with a Python package and a JS package both named `utils` produces distinct Package nodes, verified by ID inspection.
- Dependencies: T0.3, T1.1.

**T1.3 — Fixture repo: Python dynamic-import tricky cases**
- Objective: build the fixture repo itself (`__import__`, `getattr`-based dispatch) with hand-labeled expected output (including known-unresolvable cases explicitly marked "inconclusive," not silently wrong).
- Acceptance criteria: fixture is reviewed by a second engineer for correctness of hand-labels before being used to gate any milestone.
- Dependencies: none.

*(Go and Java tasks follow the identical T1.1–T1.3 pattern against their respective indexers and fixtures.)*

### Milestone 3 tasks

**T3.1 — Define `PluginInterface` contract in `plugin-sdk`**
- Objective: write the interface (language-appropriate — abstract class/protocol/trait) and a test harness that validates any implementation against a contract test suite.
- Inputs: Component Spec 1.10.
- Outputs: interface definition + contract test suite (runnable against any implementation).
- Acceptance criteria: a trivial no-op plugin implementation passes the contract test suite.
- Dependencies: none.

**T3.2 — Implement `KnipPlugin`**
- Objective: subprocess-invoke Knip, parse its JSON report, map to `SynthesizedEdge`.
- Inputs: repo checkout with Knip config.
- Outputs: `SynthesizedEdge` list.
- Acceptance criteria: passes the T3.1 contract suite; against a fixture repo with a Next.js page (Knip-recognized convention), the page's handler is correctly marked live via a synthesized edge.
- Dependencies: T3.1.

**T3.3 — Implement `VulturePlugin`**
- Objective/Inputs/Outputs: mirror T3.2 for Vulture.
- Acceptance criteria: passes contract suite; against `fixtures/python-dynamic-imports`, previously-false-positive symbols (from Milestone 1 baseline) are now suppressed or reclassified as lower-confidence rather than confidently dead.
- Dependencies: T3.1, T1.3 (uses that fixture).

### Milestone 4 tasks

**T4.1 — Deploy Glean server in dev environment**
- Objective: stand up Glean via its official Docker image against a minimal test corpus.
- Inputs: Glean's own quickstart configuration.
- Outputs: a running Glean instance reachable from dev tooling.
- Acceptance criteria: the Glean demo query from its own documentation returns expected results against the test corpus.
- Dependencies: none.

**T4.2 — Implement `glean-adapter` ingest path**
- Objective: feed SCIP output (from T0.2-equivalent for whichever fixture repos are in scope) into Glean.
- Inputs: SCIP files.
- Outputs: ingested facts queryable in Glean.
- Acceptance criteria: an Angle query for a known symbol in the ingested fixture returns the expected reference list.
- Dependencies: T4.1, T0.2 (or language-equivalent).

**T4.3 — Implement `find_references` cross-repo query**
- Objective: wrap the Angle query pattern needed for "who references symbol X across repos."
- Inputs: symbol ID.
- Outputs: reference list with repo attribution.
- Acceptance criteria: against a two-repo fixture (one exporting, one consuming a specific symbol), the query correctly attributes the reference to the consuming repo, and a same-named-unrelated symbol in a third fixture repo is correctly excluded.
- Dependencies: T4.2.

### Milestone 5 tasks

**T5.1 — Define `EvidenceBundle` and `ScoredResult` data structures**
- Objective: formalize the types used across `evidence-collector` and `confidence-engine`.
- Inputs: Component Specs 1.8–1.9.
- Outputs: type definitions (shared library).
- Acceptance criteria: types compile/typecheck and are used by both downstream tasks below without modification.
- Dependencies: none.

**T5.2 — Implement `evidence-collector.collect()` (static + cross-repo only)**
- Objective: fan out to `unified-graph` and `glean-adapter`, assemble an `EvidenceBundle`.
- Inputs: symbol ID.
- Outputs: `EvidenceBundle`.
- Acceptance criteria: for a known fixture symbol, the assembled bundle contains exactly the expected static and cross-repo evidence entries.
- Dependencies: T5.1, T0.4, T4.3.

**T5.3 — Implement noisy-OR aggregation core**
- Objective: write the scoring function itself, in isolation, unit-testable without any live data dependency.
- Inputs: a synthetic `EvidenceBundle`.
- Outputs: `score` (float) and `tier`.
- Acceptance criteria: a table-driven unit test suite covering: (a) single strong-alive signal overrides many weak-dead signals, (b) all-weak-dead-no-alive produces high dead confidence, (c) contradictory strong signals in both directions trigger `contradiction: true` rather than an averaged score. All cases must pass.
- Dependencies: T5.1.

**T5.4 — Implement audit-trail serialization**
- Objective: ensure every `ScoredResult` carries a human-readable trace back to the specific evidence items that produced it.
- Inputs: `EvidenceBundle` + computed score.
- Outputs: `evidence_refs[]` populated with pointers (not copies) to source evidence.
- Acceptance criteria: given a scored result, a reviewer can follow `evidence_refs` to the exact SCIP reference, Angle query result, or runtime span that justified the score, verified manually against one worked example.
- Dependencies: T5.2, T5.3.

*(Milestones 6–12 tasks follow the same granularity pattern: one task per producer implementation, one per integration point, one per fixture, one per test-suite addition. Full task lists for Milestones 6–12 should be generated at the start of each milestone using this same template, once the prior milestone's actual output is in hand — writing them all out now would bake in assumptions about Milestone 5's real interfaces that are better finalized after Milestone 5 ships.)*

---

## 5. Risk Register — Highest-Risk Remaining Assumptions

| # | Assumption | Why it's risky | Validation method | Recommended timing |
|---|---|---|---|---|
| 5.1 | Postgres (recursive CTEs) will perform adequately for reverse-reachability at hundreds-of-repos scale, without needing a dedicated graph database | This is the single biggest architectural bet in the build-vs-buy review, made against target scale we haven't measured yet | **Benchmark.** Build a synthetic graph generator producing realistic node/edge counts at target scale (estimate: low millions of nodes, tens of millions of edges) and measure recursive-CTE query latency directly, before committing further schema work around Postgres. | Before Milestone 12, but a lightweight version of this benchmark should be run as early as Milestone 0/1 completion, since finding out at Milestone 12 that Postgres doesn't scale would be a costly late discovery. |
| 5.2 | Glean is operationally viable outside Meta at our scale and with our language mix | Its production track record outside Meta is thin; SCIP ingestion coverage per language is uneven | **Proof of concept**, scoped exactly to Milestone 4 — if Glean proves painful to operate or its SCIP ingestion path is unreliable for our top languages, the fallback (documented now, not discovered under pressure) is to skip Glean and implement cross-repo reference lookup directly against `unified-graph` with declared-dependency edges from `registry-crawler` as the primary cross-repo signal instead. | Milestone 4 itself is the validation point — treat it explicitly as a go/no-go checkpoint, not a guaranteed-success integration task. |
| 5.3 | OpenTelemetry route/span-level evidence is sufficient, and JVM bytecode-level instrumentation (Codekvast-style) is unnecessary | If the org's OTel instrumentation is sparse (route-level only, no fine-grained spans), method-level dead code within a live route could go undetected | **Prototype.** Before committing to skip bytecode instrumentation, run a small prototype comparing OTel span coverage against a known set of methods within one live, well-instrumented service, to see whether route-level evidence actually leaves meaningful gaps at the method level in practice. | During Milestone 10, before finalizing scope — this determines whether Codekvast integration gets added to Milestone 10 or explicitly deferred. |
| 5.4 | The org can adopt an OCI image-label convention (`org.opencontainers.image.source`) to make image-to-repo correlation reliable | If the org's existing image-build pipelines can't be easily updated to add this label, infra-correlation accuracy degrades to heuristic inference, which is materially less reliable | **Direct implementation, but with a fallback path already designed**, not a separate validation phase — this is a low-cost ask (one Docker label) to raise with platform/infra teams during Milestone 8 planning; if refused, implement the heuristic fallback (image-tag/name matching) as a documented lower-confidence evidence source rather than blocking the milestone. | Confirm organizational buy-in before Milestone 8 starts; don't discover the answer mid-milestone. |
| 5.5 | A 90-day (or similar) runtime observation window is sufficient to avoid false "dead" classifications from low-frequency legitimate code paths (batch jobs, DR paths, admin tooling) | Too short a window produces dangerous false positives in the highest-consequence tier (Confirmed Dead); too long delays all value delivery | **Direct implementation with a conservative default, revisited via data.** Ship with a deliberately long default window (e.g., 180 days) and a hard requirement that "Confirmed Dead" status additionally requires zero historical Git activity in a comparable window, and revisit the window length once real "flagged and later found to be wrong" incidents (or their absence) accumulate. | Set the conservative default at Milestone 5 (confidence engine design), revisit after Milestone 11 has run in production for one full window length. |
| 5.6 | Default confidence-model weights (however chosen initially) are reasonable enough to be useful before any real calibration data exists | Illustrative weights presented with false confidence was explicitly flagged as a risk in the prior review; shipping them uncritically repeats that mistake | **Prototype + direct implementation.** Ship Milestone 5 with weights explicitly labeled "uncalibrated defaults" in every UI/report surface, and treat Milestone 6 onward as building toward Milestone 11's calibration-data collection (labeled outcomes) as the actual validation mechanism — there is no shortcut to real calibration data. | Ongoing from Milestone 5 onward; first real recalibration checkpoint after Milestone 11 has accumulated a meaningful number of human-reviewed outcomes (recommend a minimum threshold, e.g., 50+ reviewed findings, before adjusting weights based on data rather than intuition). |
| 5.7 | DI/reflection convention plugins (Milestone 7) can achieve useful coverage without becoming an open-ended, ever-expanding maintenance burden | Every enterprise codebase has some idiosyncratic DI/reflection pattern; scope creep here is the most likely single source of unbounded schedule slip in the project | **Direct implementation, tightly scoped**, with an explicit written boundary (documented in `docs/plugins/writing-a-plugin.md`) stating which conventions are in scope and treating anything else as an accepted, documented gap rather than a bug to chase. | Set the scope boundary before Milestone 7 starts, not during it. |

---

## 6. What Remains Explicitly Unresolved (by design)

Consistent with "do not redesign unless a critical flaw is found," the following are intentionally left open rather than pre-decided, because they depend on information that doesn't exist yet:

- Exact confidence-weight values (Risk 5.6) — deliberately deferred to real calibration data.
- Whether Postgres or a graph database ultimately backs `unified-graph` at full scale (Risk 5.1) — deliberately a benchmark-gated decision, not a Day 1 commitment either way.
- The final list of DI/reflection conventions supported (Risk 5.7) — deliberately scoped to "whatever the org's real repos demonstrate a need for," not enumerated speculatively.

No critical flaw was found in the prior three documents' architecture during this exercise; this blueprint operationalizes their conclusions rather than revising them.
