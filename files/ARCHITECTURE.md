# ARCHITECTURE.md

This document describes **how the system currently works**. It is written in the present tense and describes current truth, not history — if something changes, this file changes with it in the same commit. For *why* a given approach was chosen over an alternative, see `DECISIONS.md`. For *what to build next*, see `STATUS.md`.

---

## 1. System overview

The platform determines, with an auditable confidence score, whether a given piece of code is truly unused across an enterprise's repositories, services, and infrastructure — and turns high-confidence findings into human-reviewed removal proposals. It never deletes or merges anything autonomously.

The system works by treating "is this used" as a graph reachability question over a **unified dependency graph** populated from five independent evidence sources: static code analysis, cross-repository symbol resolution, declared package dependencies, infrastructure wiring, and production runtime observation. A dedicated **confidence engine** fuses these into a single score and tier per candidate symbol, with a full audit trail back to the evidence that produced it.

```
   [static code]      [cross-repo refs]     [package registries]
        |                    |                       |
   indexer-runner       glean-adapter          registry-crawler
        |                    |                       |
   scip-normalizer           |                       |
        \____________________|_______________________/
                             |
                      unified-graph (Postgres)
                             |
        _____________________|_____________________
       |                     |                      |
 infra-extractor      runtime-collector      framework-plugins
       |                     |                      |
        \____________________|_____________________/
                             |
                    evidence-collector
                             |
                    confidence-engine  ---> DECISIONS.md-governed invariants apply here
                             |
              ______________ |_______________
             |                              |
      reporting-engine                     cli
             |
          pr-bot  (opens PRs only — never merges; see AGENTS.md §1)
```

---

## 2. Components

Each entry gives responsibility, public interface, dependencies, inputs/outputs, and the OSS-vs-custom split. This section is the canonical reference — service/library code should link back here rather than re-describing itself.

### 2.1 `indexer-runner`
- **Responsibility:** invokes the correct SCIP indexer per language, validates output, stores raw SCIP artifacts.
- **Interface:** `run_index(repo_id, commit_sha, language) -> IndexArtifact{scip_path, status, error?}`; `supported_languages() -> [Language]`.
- **Depends on:** nothing upstream; called by `ingestion-orchestrator`.
- **In / out:** repo checkout at a commit → SCIP protobuf index file + status record.
- **OSS:** `scip-typescript`, `scip-python`, `scip-java`, `scip-go`, `scip-clang` (invoked as subprocesses).
- **Custom:** per-language subprocess wrapper (timeout/retry, output validation), language-detection fallback.

### 2.2 `scip-normalizer`
- **Responsibility:** lifts SCIP protobuf output into the unified graph schema (§3), tagged with repo/package/version provenance.
- **Interface:** `normalize(scip_index_path, repo_id, commit_sha) -> GraphDelta{nodes[], edges[]}`.
- **Depends on:** `indexer-runner` (upstream), `unified-graph` (downstream).
- **In / out:** SCIP file → `GraphDelta`.
- **OSS:** official SCIP protobuf schema/bindings for parsing.
- **Custom:** all SCIP-symbol-ID → canonical Package/Repo/Version identity mapping.

### 2.3 `glean-adapter`
- **Responsibility:** feeds normalized facts into Glean; exposes cross-repo "who references symbol X" queries.
- **Interface:** `ingest(scip_index_path, repo_id) -> IngestResult`; `find_references(symbol_id) -> [Reference{repo_id, file, line, symbol_id}]`.
- **Depends on:** Glean server (external, self-hosted). Consumed by `evidence-collector`.
- **In / out:** SCIP index files → reference lists per symbol.
- **OSS:** Glean (`facebookincubator/glean`) — server, Angle query language, native SCIP/LSIF ingestion.
- **Custom:** thin client wrapper; Angle query templates for our specific cross-repo/version question.
- **Status note:** this integration is a designated go/no-go checkpoint (see `DECISIONS.md`). Fallback if it fails: cross-repo resolution directly against `unified-graph` using `registry-crawler` declared-dependency edges as the primary signal.

### 2.4 `registry-crawler`
- **Responsibility:** discovers declared dependencies across the org via internal package registries and repo manifests; produces declared-dependency edges and version-alignment data.
- **Interface:** `crawl_registry(registry_config) -> [DeclaredDependency{consumer_repo, producer_package, version_range}]`; `crawl_manifests(repo_id) -> [ManifestDependency]`.
- **Depends on:** nothing upstream; feeds `unified-graph` and `evidence-collector`.
- **In / out:** registry API config + manifest files → declared-dependency edges with version metadata.
- **OSS:** existing registry client libraries per ecosystem (Artifactory, npm, PyPI, Maven).
- **Custom:** package-name normalization/join logic mapping registry names to canonical Package node identity.

### 2.5 `runtime-collector`
- **Responsibility:** ingests OpenTelemetry span data; aggregates per-symbol "last observed" timestamps with configurable decay.
- **Interface:** `ingest_otel_batch(spans[]) -> void`; `get_last_observed(symbol_id, window_days) -> ObservationRecord{last_seen, frequency, window_coverage}`.
- **Depends on:** OTel Collector (external). Feeds `evidence-collector`.
- **In / out:** OTel spans (OTLP) → per-symbol observation records.
- **OSS:** OpenTelemetry Collector + SDKs. Optional: Codekvast-style JVM bytecode agent, only if method-level granularity is demonstrated necessary (see `DECISIONS.md`).
- **Custom:** span-attribute-to-symbol-ID mapping; aggregation/decay computation; low-frequency-pattern handling (absence is not evidence until the observation window is long enough).

### 2.6 `infra-extractor`
- **Responsibility:** parses Kubernetes/Helm/Terraform/Docker/CI manifests into infra-resource nodes and wiring edges.
- **Interface:** `extract_k8s(manifest_path) -> [InfraEdge]`; `extract_terraform(plan_json) -> [InfraEdge]`; `extract_dockerfile(path) -> {entrypoint, image_labels}`.
- **Depends on:** nothing upstream; feeds `unified-graph`.
- **In / out:** raw IaC files or `terraform show -json` output → InfraResource nodes and `deploys`/`routes_to` edges.
- **OSS:** `client-go` schemas, Terraform's HCL/JSON plan format, Helm Go SDK.
- **Custom:** image-tag → repo correlation join (relies on the `org.opencontainers.image.source` label convention where adopted; heuristic fallback otherwise — see `DECISIONS.md`).

### 2.7 `unified-graph`
- **Responsibility:** the single system of record for all nodes/edges; owns the Postgres schema, upsert semantics, and the standard query set.
- **Interface:** `upsert(GraphDelta) -> void`; `reverse_reachable_from(root_set) -> Set[NodeId]`; `blast_radius(node_id) -> [NodeId]`; `get_node(node_id) -> Node`; `get_edges(node_id, direction, type?) -> [Edge]`.
- **Depends on:** Postgres. Consumed by every producer component and by `confidence-engine`.
- **In / out:** `GraphDelta` batches → query results.
- **OSS:** Postgres (recursive CTEs for reachability). No ORM assumed.
- **Custom:** schema (§3), reachability queries, content-hash-based upsert/versioning so re-indexing an unchanged file is a no-op.
- **Status note:** whether Postgres alone suffices at full org scale, versus needing a graph-native extension or engine, is an open question gated on a benchmark (see `DECISIONS.md`). Do not add a graph database speculatively.

### 2.8 `evidence-collector`
- **Responsibility:** for a given candidate symbol, fans out to every evidence producer and assembles a single `EvidenceBundle`.
- **Interface:** `collect(symbol_id) -> EvidenceBundle{static_edges[], cross_repo_refs[], infra_edges[], runtime_obs, historical}`.
- **Depends on:** `unified-graph`, `glean-adapter`, `runtime-collector`.
- **In / out:** symbol ID → `EvidenceBundle`.
- **OSS:** none — pure orchestration.
- **Custom:** all of it, but it is thin fan-out/fan-in, not novel logic.

### 2.9 `confidence-engine`
- **Responsibility:** converts an `EvidenceBundle` into a `ConfidenceScore` and `ConfidenceTier`, with a full audit trail and explicit contradiction detection. **This is the platform's core differentiator — everything upstream of it is assembled from existing tools; this is not.**
- **Interface:** `score(evidence_bundle) -> ScoredResult{score, tier, evidence_refs[], contradiction: bool}`; `configure_weights(weight_config) -> void`.
- **Depends on:** `evidence-collector`. Consumed by `reporting-engine` and `cli`.
- **In / out:** `EvidenceBundle` → `ScoredResult`.
- **OSS:** none — bespoke by design.
- **Custom:** the noisy-OR aggregation function (a single strong "alive" signal from a reliable source dominates regardless of how many weak "dead" signals exist — never a naive weighted sum, which would let many weak signals outvote one strong one), the asymmetric weighting (false "dead" is treated as far costlier than false "alive"), contradiction detection (static-dead + runtime-alive is flagged as a likely analyzer gap, not just averaged into a middling score), and audit-trail serialization.
- **Confidence tiers:** Confirmed Dead / Likely Dead / Inconclusive / Likely Alive / Confirmed Alive. Only **Confirmed Dead** may ever reach `pr-bot`. See `AGENTS.md` §1 for the hard invariant against bypassing this gate.
- **Weight status:** current weights are uncalibrated defaults, not empirically tuned constants. They should be labeled as such everywhere they surface (code comments, reports, CLI output) until real reviewed-outcome data justifies adjusting them (see `DECISIONS.md`).

### 2.10 Evidence-source reliability

Not all evidence is equally trustworthy. The confidence engine treats each source according to this table:

| Evidence | Direction | Reliability |
|---|---|---|
| Static call/import edge found | Alive | High |
| Static edge absent, single repo only | Dead (weak) | Low |
| Cross-repo reference found (via Glean) | Alive | High |
| Declared-but-unimported registry dependency | Weak dead | Low |
| Externally-public API, no cross-repo visibility | Inconclusive | Route to runtime tier |
| Infra manifest shows live wiring (non-zero replicas, active route) | Alive | High |
| Infra manifest shows disabled/zero-scale resource | Dead (supporting) | Medium |
| Runtime trace/log observed within window | Alive | Very high |
| Runtime trace/log absent, window long enough to cover known cycles | Dead (supporting) | Medium-high |
| Test-only reference | Neutral (distinct category, not dead or alive) | N/A |
| Historical usage trend (declining, stable, etc.) | Weak signal on trend only | Low-medium |

### 2.11 `framework-plugins`
- **Responsibility:** hosts wrapped OSS tools (Knip, Vulture) and custom DI/annotation-convention detectors (Spring, ASP.NET), all producing root-set-expansion or synthesized-liveness evidence.
- **Interface (`PluginInterface`, implemented by every concrete plugin):** `detect(repo_checkout) -> [SynthesizedEdge]`.
- **Concrete plugins:** `KnipPlugin`, `VulturePlugin`, `SpringDIPlugin`, `AspNetDIPlugin`.
- **Depends on:** nothing upstream; feeds `unified-graph` as another edge producer.
- **In / out:** repo checkout → `SynthesizedEdge` list.
- **OSS:** Knip and Vulture, invoked as subprocesses; their existing plugin/convention catalogs are reused as-is, not reimplemented.
- **Custom:** the `PluginInterface` contract itself; `SpringDIPlugin`/`AspNetDIPlugin`, which are genuinely novel engineering, deliberately scoped to only the 2–3 DI conventions actually observed in the org's repos (see `DECISIONS.md` on scope boundaries — this is the project's highest risk of unbounded scope creep).
- **Splitting note:** once this section covers more than ~5–6 plugins with meaningfully different concerns, split "how to write a plugin" into its own `docs/plugins/PLUGIN_INTERFACE.md` per `AGENTS.md`'s repository conventions. Until then, this section is the plugin contract's only home.

### 2.12 `reporting-engine`
- **Responsibility:** turns `ScoredResult`s into human-consumable dashboards and PR-ready diffs.
- **Interface:** `generate_report(scope: repo|package|org) -> Report`; `generate_pr_diff(symbol_ids[]) -> DiffProposal`.
- **Depends on:** `confidence-engine`, `unified-graph`.
- **OSS:** standard web framework for the dashboard; a codemod library (`ts-morph`, `libcst`) only where actual structural rewriting — not simple deletion — is needed.
- **Custom:** report templates; diff-proposal assembly tying scores back to specific lines.

### 2.13 `pr-bot`
- **Responsibility:** opens pull requests for Confirmed Dead tier findings, with evidence trail attached. **Never merges.**
- **Interface:** `open_removal_pr(diff_proposal) -> PullRequestRef`.
- **Depends on:** `reporting-engine`; GitHub/GitLab API.
- **OSS:** official GitHub/GitLab API clients.
- **Custom:** PR body templating (evidence trail rendering), branch/commit creation. No merge capability exists in this component's code path — this is a tested invariant, not just a policy (see `AGENTS.md` §1).

### 2.14 `cli`
- **Responsibility:** developer-facing entry point for ad hoc queries ("what's dead in this diff," "blast radius of deleting X").
- **Interface:** commands mapping directly onto `unified-graph` and `confidence-engine` queries.
- **Depends on:** `unified-graph`, `confidence-engine`.
- **OSS:** standard CLI framework.
- **Custom:** command definitions and output formatting only.

### 2.15 `ingestion-orchestrator`
- **Responsibility:** receives VCS webhooks, determines the minimal re-indexing set from changed files, dispatches jobs, sequences producer components before `unified-graph` upserts.
- **Interface:** `handle_webhook(payload) -> [DispatchedJob]`; `dispatch(job) -> JobId`.
- **Depends on:** all producer components (2.1–2.6, 2.11); a managed queue (SQS/Cloud Tasks or existing CI runner queue — not a self-hosted broker).
- **Custom:** webhook parsing, changed-file-set diffing, job dispatch. No custom queue implementation.

---

## 3. Unified graph schema

### 3.1 Node types

| Node | Key attributes |
|---|---|
| `Repository` | canonical VCS URL, owning team |
| `Package` | canonical name + ecosystem, version |
| `File` | repo-relative path, language |
| `Symbol` | SCIP symbol ID, kind (function/class/method/variable), source range |
| `Route/Endpoint` | protocol (REST/GraphQL/gRPC), path or RPC method identifier |
| `Topic/Queue/Subject` | broker type, name |
| `InfraResource` | kind (k8s object, Terraform resource, CI pipeline), liveness state |
| `ExternalConsumer` | opaque placeholder for uncontrolled external clients of public APIs |

### 3.2 Edge types

`imports`, `calls`, `implements`, `extends`, `publishes-to`, `subscribes-to`, `routes-to`, `deploys`, `declared-dependency`, `generated-from`, `synthesized` (from `framework-plugins`).

Every edge additionally carries: `source` (static-AST / registry-index / infra-manifest / runtime-trace / production-log / plugin-synthesized), `confidence-weight`, `last-observed timestamp`, and `evidence-refs` (a pointer back to the raw evidence, never a copy — this is what makes `ScoredResult.evidence_refs` auditable end to end).

### 3.3 Identity and versioning

Node identity is content-hash-based where possible (a `Symbol` node's identity derives from its SCIP symbol ID plus repo/commit context) so that re-indexing an unchanged file is a genuine no-op rather than a rewrite. `Package` identity is canonicalized per-ecosystem (name + registry) to avoid cross-ecosystem name collisions (e.g., an npm `utils` and a PyPI `utils` must never resolve to the same node).

---

## 4. How this document evolves

- Edited in place, in the same change that alters a component's interface, responsibility, or the schema — never left for a separate "docs pass."
- Does not accumulate historical narration ("as of Milestone 6 we changed X") — that belongs in `DECISIONS.md`.
- The plugin section (§2.11) is designed to fission into its own document once it outgrows a single section (see the splitting note there).
- Exact confidence weights are configuration, not documentation, and are deliberately not enumerated here — only the *shape* of the scoring approach (noisy-OR, asymmetric) is documented, since the specific numbers are expected to change as real calibration data accumulates.
