# Enterprise Dead Code Platform: Pre-Implementation Engineering Review
### Build vs. Buy vs. Integrate vs. Kill — Final Review Before Development Begins

## How to read this document

The five whitepapers are research inputs, not a spec. Several of them independently reinvent things that already exist as mature open source (SCIP indexers, Glean, OpenTelemetry, Neo4j), and several propose custom engineering (pointer analysis, custom parsers, a bespoke graph query language, autonomous codemod bots) that would burn months of effort for marginal or negative return. My job here is to say, capability by capability: is this commodity, is this differentiated, and where does *our* engineering budget actually need to go.

**Bottom line up front:** the defensible IP in this product is not parsing, not graph storage, not tracing — all of that is solved, boring infrastructure available as OSS. The IP is (1) the **cross-source evidence fusion and confidence model** that turns five noisy, contradictory signals into a single auditable "safe to delete" recommendation, and (2) the **integration glue** — the specific adapters, framework-convention plugins, and workflow (PR bot, ticketing, review UI) that make the fused graph actually actionable inside a real engineering org. Everything else should be bought, wrapped, or explicitly deferred.

---

## 1. Parsing, AST construction, symbol/type resolution

**Problem it solves:** turning source text into structured facts (definitions, references, types, imports) per language.

**Does mature OSS solve it?** Completely, and this is not close.

- **tree-sitter** — incremental, error-tolerant parsers for 40+ languages, battle-tested (powers GitHub's code navigation, Neovim, Zed, Helix). Gives you a concrete syntax tree, not full symbol/type resolution.
- **Native compiler/language-service front ends** — TypeScript Compiler API, Roslyn (C#), `go/packages` + `go/types`, JavaParser/Eclipse JDT, `libcst`/`ast` (Python), Clang libtooling (C/C++). These give real symbol and type resolution, which tree-sitter alone does not.
- **SCIP indexers** (Sourcegraph, Apache-2.0 licensed, actively maintained) — `scip-typescript`, `scip-clang`, `scip-java`, `scip-python`, `scip-go`, `scip-ruby` already wrap the above compiler front ends and emit a standardized, versioned, Protobuf-based fact format with exactly the schema this platform needs (definitions, references, cross-file symbol IDs, package/version qualification).

**Recommendation: adopt SCIP wholesale as the intermediate schema and reuse existing SCIP indexers per language. Do not write a parser or a symbol resolver for any mainstream language.**

**Why:** every whitepaper (1–5) independently converges on "per-language AST + symbol resolution as the foundation," and whitepaper 4 correctly identifies that the right artifact is SCIP, not a bespoke summary format. Writing your own resolver for even one statically-typed language (correctly handling generics, overloads, interface dispatch) is a multi-month effort per language that Sourcegraph has already open-sourced and multiple companies have hardened in production. The only case for custom work here is a language with no existing SCIP indexer and no viable compiler API (rare; if it comes up, wrap tree-sitter + minimal name resolution as a stopgap, don't build a type checker).

**What we build instead:** a thin **normalization layer** that ingests SCIP indexes (whatever language/version they come from) and lifts them into our unified graph schema (Section 8 below), tagging each fact with repo, package, and version. This is days of work, not months.

---

## 2. Cross-repository symbol resolution

**Problem it solves:** knowing that a symbol exported from repo A is consumed by repo B.

**Does mature OSS solve it?** Partially — the hard part (cross-repo semantic linking) is exactly what Sourcegraph's core product does commercially, and Glean does as an open-source alternative.

- **Glean** (Meta, BSD-licensed, `facebookincubator/glean` on GitHub) — a real, usable, open-source fact store with a Datalog-style query language (Angle), built specifically for cross-repo, incremental, schema-typed code facts, and it already accepts SCIP/LSIF input for several languages (Go, Java, Rust, TypeScript) in addition to its own native indexers (C++, Python, Hack, Flow). This is precisely the "unified symbol graph across the whole org" that four of the five whitepapers describe wanting to build from scratch.
- **Sourcegraph** (commercial for enterprise self-hosted; the OSS core is limited) — the cross-repo *precise code navigation* product, but it is not a dead-code detector and its enterprise cross-repo features are licensed, not free. Treat it as a possible **complementary UI/navigation surface**, not a foundation to build on, given licensing.
- Caveat: **CodeQL** is often assumed to be a free option here (it has excellent whole-program and even some cross-database query support), but its license explicitly **prohibits use on non-open-source codebases outside of GitHub Advanced Security-licensed CI/CD** — confirmed directly in its Terms & Conditions. For an enterprise platform analyzing private code, CodeQL is off the table unless the org already pays for GitHub Advanced Security, in which case it's worth evaluating as a possible query layer rather than assuming it's free infrastructure. None of the five whitepapers flagged this licensing trap — worth calling out explicitly since it would have been an expensive mistake to discover mid-build.

**Recommendation: adopt Glean as the cross-repo fact store and query engine rather than building a custom "cross-repo resolver" component.** Feed it SCIP output from Section 1. Use Angle queries for "who references this symbol, across which repos and versions" instead of writing custom graph-traversal code for this specific question.

**Trade-off to be honest about:** Glean's native indexer coverage is narrower than SCIP's (custom indexers for some Meta-internal languages were never open-sourced), and its operational maturity outside Meta is thinner than, say, Postgres or Neo4j — expect to do real integration work and accept some rough edges. This is still far cheaper than building an equivalent fact store and Datalog-ish query engine from scratch, which is a multi-quarter systems project in its own right (this is the actual reason whitepapers describing "a global registry crawler + custom relational/vector/graph hybrid" are over-scoping: that's reinventing Glean, badly, with less time invested).

**What we build instead:** package-registry crawlers (Artifactory/Nexus/npm/PyPI/Maven mirror APIs) to establish the *declared*-dependency edges Glean can't see on its own (Glean sees code references; it doesn't know your org's registry topology), and a version-alignment layer that reconciles "dead on main" vs. "live in a still-deployed older release" — this reconciliation logic is genuinely novel and not something Glean or Sourcegraph does for you.

---

## 3. Whole-program call graph precision (CHA / RTA / pointer analysis)

**Problem it solves:** resolving virtual/polymorphic call targets so the call graph doesn't have to conservatively assume every override of an interface is live.

**Does mature OSS solve it?** Yes, per-language, and this is a place where whitepaper 4's CHA/RTA/Andersen's/Steensgaard's discussion, while academically correct, **overstates what we should actually build.**

**Critical pushback:** whole-program pointer analysis (Andersen's O(n³), or even Steensgaard's near-linear approximation) is a compiler-research-grade undertaking. No whitepaper's roadmap seriously budgets for what it costs to implement, validate, and maintain a points-to analysis correctly across a polyglot org. And it's mostly unnecessary:

- For **statically typed languages** (Java, C#, TypeScript, Go, Kotlin), production-grade whole-program call graph tools already exist and are directly reusable: **WALA** (IBM, EPL) and **Soot/SootUp** for JVM languages implement CHA and RTA (and more precise variants) as libraries you call, not algorithms you re-derive. TypeScript's own language service (`findAllReferences`, `getTypeChecker`) already resolves interface-to-implementation edges correctly enough for this use case without needing a separate points-to pass. Go's `go/types` + `golang.org/x/tools/go/callgraph` package (literally named for this) does RTA/CHA/VTA out of the box.
- For **dynamic languages** (Python, JS without types, Ruby), full pointer analysis is a research problem with poor ROI — the honest answer, which whitepaper 3 and 5 get right and whitepaper 4 underweights, is: don't chase static precision here at all; **lean on the confidence model and runtime evidence** instead of trying to statically prove reachability through duck-typed dispatch.

**Recommendation: reuse WALA/Soot for JVM, `go/callgraph` for Go, TypeScript's own compiler service for TS — do not implement CHA/RTA/Andersen's/Steensgaard's ourselves for any language.** Where no such library exists for a language in scope, fall back to CHA-equivalent conservative call resolution using existing type information from the SCIP index (over-approximate; let the confidence model, not the call graph, do the precision work), rather than writing a bespoke pointer analysis.

**Why this matters for scoping:** this single correction removes what would otherwise be one of the largest and riskiest engineering line items on the whole roadmap (a "build our own interprocedural pointer analysis" project), replacing it with library integration measured in weeks.

---

## 4. Framework/DI/reflection convention handling

**Problem it solves:** avoiding false positives when code is invoked via Spring/Guice/NestJS DI, annotation-driven routing, reflection, or plugin loading — the single largest source of enterprise false positives per every whitepaper.

**Does mature OSS solve it?** Partially, and unevenly — this is the strongest case in the whole platform for genuinely custom work, but not from-scratch custom work.

- **Knip** (JS/TS, MIT license) already ships ~100 framework/tool convention plugins (Next.js, Vite, ESLint configs, npm scripts, etc.) as a mature, actively maintained plugin library. This is directly reusable, not just as inspiration — for any org with a meaningful JS/TS footprint, **run Knip itself** as the JS/TS root-set-expansion and unused-export engine rather than reimplementing its plugin catalog. Feed its findings into our unified graph as one evidence source among several, rather than treating "rebuild what Knip does" as in scope.
- **Vulture** (Python, MIT license) — same logic: don't reimplement AST-based unused-symbol heuristics for Python; run Vulture, ingest its findings (including its native confidence percentages) as an evidence source.
- For DI-heavy JVM/.NET codebases, there is no equivalently mature single OSS tool covering Spring/Guice/.NET DI convention-to-edge synthesis at the level Knip does for JS. **This is genuinely the best-justified area for custom plugin development** — it's high-value (this is where the worst false positives come from) and not well served by an existing project.

**Recommendation: run Knip and Vulture as subprocesses/library calls for their respective ecosystems rather than reimplementing their logic; invest custom engineering specifically in a small number of high-value DI/annotation-convention plugins (Spring, ASP.NET Core, NestJS) since this is the one convention-detection gap the OSS landscape doesn't already fill well.**

**What to kill:** don't build a "framework convention plugin marketplace" architecture speculatively for frameworks nobody on the team uses yet. Build exactly the plugins the org's actual repos need, in priority order of false-positive cost, and add more only when a real false positive demonstrates the gap. This is the single biggest place all five whitepapers overengineer — proposing an extensible plugin ecosystem before there's evidence any given framework plugin is needed.

---

## 5. Infrastructure-as-code parsing (K8s, Helm, Terraform, Docker, CI/CD)

**Problem it solves:** knowing what's actually deployed/wired, since source code describes what's possible, not what's running.

**Does mature OSS solve it?** Mostly yes, at the *parsing* layer; the *correlation to code* layer is genuinely custom.

- Parsing: **Kubernetes client-go / official YAML schemas**, **HashiCorp's `hcl` + Terraform's own `terraform show -json` / plan JSON output**, **Helm's own Go SDK for template rendering**, standard Docker/Compose parsers. All mature, all free, all maintained by the platform vendors themselves — there's no reason to hand-write parsers for any of these formats.
- Correlation ("this Deployment's image was built from this repo's Dockerfile, entrypoint X") is a bespoke join across weakly-typed conventions (image tags, build args) that no OSS tool does end-to-end for you. Riftmap (referenced in whitepaper 4/1) is a commercial point solution for exactly this; there's no mature OSS equivalent doing the full join.

**Recommendation: use the official parsers/SDKs for each IaC format; build a lightweight custom correlation layer that joins container image → repo → entrypoint using image tag/label conventions (recommend requiring OCI image labels like `org.opencontainers.image.source` as an org-wide convention rather than trying to reverse-engineer this from Dockerfile heuristics alone — this is far more reliable and costs a one-line Dockerfile policy instead of fragile inference).**

**What to postpone:** service-mesh (Istio/Linkerd) and API-gateway config parsing. This is real, useful signal, but it's also low-value until Phases 4–5 land (microservice contract analysis) since infra edges are corroborating evidence for contract edges that don't exist yet. Every whitepaper's own roadmap agrees infra should come after microservice contracts — don't front-load its implementation.

---

## 6. Microservice contract analysis (REST/GraphQL/gRPC/Kafka/etc.)

**Problem it solves:** treating producer/consumer contracts (not just function calls) as reachability edges.

**Does mature OSS solve it?** The *schema parsing* is commodity; the *join logic* is custom, but simpler than the whitepapers imply.

- OpenAPI, Protobuf/gRPC, GraphQL SDL are all standard, well-specified formats with mature parser libraries in every language (`openapi-core`, `protobuf` reflection APIs, `graphql-js`/`graphql-core` schema introspection). No reason to write parsers.
- The "join producers to consumers by topic/route name" logic is inherently org-specific (it depends on your naming conventions, your schema registry, your service catalog) — this cannot be bought, but it is also not hard: it is a string/identifier join over an index, not a research problem. Don't over-architect it as a distinct "Microservice Contract Resolver" subsystem with its own storage — it's a set of edge-extraction rules feeding the same unified graph as everything else.

**Recommendation: build thin, per-protocol edge extractors (a few hundred lines each) that emit standard edges into the unified graph; do not stand up a separate resolver service or separate storage for this.** This directly contradicts the "major standalone component" framing in whitepapers 2 and 4 — it should be a graph-population job, not an architectural tier.

---

## 7. Runtime evidence collection (OpenTelemetry, profiling, logs)

**Problem it solves:** closing the gap static analysis cannot close — reflection, DI, dynamic dispatch mean some fraction of the codebase is unprovable without observing execution.

**Does mature OSS solve it?** Yes, almost entirely, and this is the clearest "do not build, integrate" case in the whole platform.

- **OpenTelemetry** is the industry-standard, vendor-neutral instrumentation and collection layer — SDKs for every mainstream language, a standard collector, standard exporters. If the org doesn't already have OTel instrumentation, that's an organizational rollout task, not something this platform should reimplement.
- For JVM specifically, **async-profiler** (continuous, low-overhead sampling profiler) and existing bytecode-instrumentation approaches (ASM/ByteBuddy, as used by the Scavenger/Codekvast lineage referenced in whitepaper 4) are mature and open source. **Do not build a custom bytecode agent from scratch** — either integrate an existing one (Codekvast is directly usable and is the actual ancestor of Naver's Scavenger) or, better, just rely on OTel spans if the org already has them, since maintaining a second, parallel low-level instrumentation mechanism is a maintenance burden for marginal precision gain over OTel + sampling profiling.

**Recommendation: integrate OpenTelemetry as the primary runtime evidence channel across all languages; add Codekvast-style bytecode agents only for JVM shops that specifically lack OTel span-level granularity for method-level (not just route-level) evidence, and only if that finer granularity is demonstrated to matter — don't build it speculatively.**

**What we build instead:** the **aggregation and decay logic** — turning a stream of spans/logs into a per-symbol "last observed" timestamp with confidence decay, and correctly handling low-frequency legitimate patterns (batch jobs, DR paths). This aggregation logic is genuinely ours to build; the collection mechanism is not.

---

## 8. Unified dependency graph: storage, schema, query

**Problem it solves:** one place where static, cross-repo, infra, contract, and runtime evidence all become edges in the same reachability question.

**Does mature OSS solve it?** The storage engine, yes. The schema and query semantics for *this specific problem*, no — that's ours, and it's the most important design surface in the system, but it's a schema/query-pattern design problem, not an infrastructure-building problem.

**Critical pushback on graph database choice:** almost every whitepaper defaults to "use a graph database" (Neo4j, JanusGraph, AWS Neptune) as though this were self-evidently correct. It's worth genuinely challenging this rather than accepting it by default.

- The actual query pattern this system needs is overwhelmingly **reverse-reachability-from-roots plus a handful of specific traversal queries** ("blast radius if I delete X," "who references this symbol"), not deep, unpredictable ad hoc graph exploration. That pattern is well served by:
  - A **relational store (Postgres) with adjacency/edge tables and recursive CTEs**, which handles bounded-depth reachability and reverse-BFS perfectly well at the scale described (millions of nodes, not billions), with the enormous practical advantage of being an operationally boring, well-understood, cheap-to-run piece of infrastructure the team already knows how to run in production, back up, and scale.
  - A dedicated graph database earns its complexity when queries are unpredictable, deeply variable-depth, and exploratory (which is Neo4j's actual sweet spot) — that's not really this workload; ours is a small, fixed set of query shapes run very often.
- Glean (Section 2) already *is* a fact store with a real query language purpose-built for code facts — there's a real argument that **Glean plus Postgres for the infra/contract/runtime layers, rather than adding a third system (Neo4j) on top of both, is lower total operational surface** than the "SQL + vector + graph, three-way hybrid" architecture multiple whitepapers propose by default without justifying why three storage systems are needed rather than two.

**Recommendation: default to Postgres (with recursive CTEs / a lightweight graph extension like AGE only if and when profiling proves recursive CTEs insufficient) for the unified graph, layered on top of Glean for the code-symbol substrate. Do not adopt a dedicated graph database (Neo4j/Neptune/JanusGraph) at the outset — treat it as a Phase 7+ scaling decision to revisit only if concrete query-latency data justifies it, not a Day 1 architectural default.** This is a direct, deliberate departure from four of the five whitepapers' default assumption, and it's the highest-leverage "kill unnecessary complexity" call in this review: it removes an entire piece of unfamiliar, harder-to-operate infrastructure from the critical path with no loss of capability at the actual target scale, and defers the decision to when real data exists to justify it.

**What we build:** the schema itself (node/edge types, provenance/confidence metadata per Section 8 of the whitepapers — that part is genuinely well-designed across all five and worth keeping largely as-is), and the specific reverse-reachability + evidence-aggregation queries, as ordinary SQL/application code rather than a bespoke query language.

---

## 9. Incremental analysis and CI integration

**Problem it solves:** making analysis fast enough to run on every PR rather than as an occasional batch job.

**Does mature OSS solve it?** The primitives yes; the orchestration is custom but small.

- Content-hash-based caching, git-diff-based change detection — these are standard patterns, not novel infrastructure; use existing build-cache libraries (e.g., Bazel's remote-cache protocol, or simply a content-addressed object store like S3/MinIO with a hash-keyed lookup) rather than designing a bespoke caching layer.
- CI orchestration: use the org's existing CI system (GitHub Actions, GitLab CI, Buildkite) as the trigger and runner; do not build a custom distributed job scheduler. Whitepaper 4's "Ingestion Controller + RabbitMQ + worker pool" design is reasonable *if* the org is already running message-queue infrastructure, but for most orgs at this stage, **a simple job queue backed by existing CI runners or a managed queue (SQS, Cloud Tasks) is sufficient and dramatically lower-maintenance than standing up and operating RabbitMQ specifically for this**. Don't introduce new message-broker infrastructure as a Day 1 dependency unless it's already a standard part of the org's stack.

**Recommendation: drive re-indexing off existing CI webhooks, use a managed queue (not a self-hosted broker) for work distribution, and scope "distributed execution" to "parallel workers reading from a managed queue" rather than a bespoke coordinator service.**

---

## 10. Confidence scoring / evidence fusion engine

**Problem it solves:** the actual research question — turning weak, partial, sometimes-contradictory evidence into an auditable recommendation.

**Does mature OSS solve it?** No — **and this is the correct place to say so, because this is the actual product.**

This is the one component across the entire platform that is genuinely novel, genuinely ours, and genuinely the reason this product would be worth building instead of gluing together Knip + Glean + OpenTelemetry and calling it done. It deserves the most design scrutiny and the least urge to copy a pattern wholesale from any one whitepaper.

**Critical review of what the whitepapers propose:**
- Whitepaper 2's noisy-OR aggregation (any single strong "alive" signal dominates regardless of how many weak "dead" signals exist) is the right shape and the right instinct — asymmetric cost of false positives should be structurally encoded, not tuned after the fact via arbitrary numeric weights.
- Whitepapers 1, 3, and 4's fixed numeric weights (e.g., "β=0.40 for runtime, α=0.20 for static reachability") should be treated as **illustrative placeholders, not specifications** — presenting invented precision like this as though it were empirically derived is exactly the kind of false confidence this review exists to catch. Don't ship fixed weights; ship a framework where the weights are configurable and, ideally, calibrated against real historical outcomes (did a similarly-scored deletion actually break something) once the org has enough deletion history to calibrate against. Before that history exists, be explicit internally and in the UI that these are defaults, not proven constants.
- No whitepaper adequately addresses what happens when evidence **conflicts strongly** (e.g., zero static reachability but active runtime traces — which does happen, via reflection). The engine needs an explicit "contradiction" state distinct from "inconclusive," since contradiction is actually a stronger signal that something in the static model is wrong (missing a plugin/DI edge) and should route to *fixing the analyzer*, not just to human review of that one symbol.

**Recommendation: build this as a small, dependency-light scoring service — deliberately simple (interpretable weighted/noisy-OR aggregation over a handful of evidence categories, full evidence trail per score) rather than reaching for a supervised ML model on day one.** A ML layer is a legitimate future enhancement once there's a labeled history of "flagged and confirmed dead" vs. "flagged and turned out live" outcomes to train on — building that model before that data exists would be modeling noise.

---

## 11. Reporting, PR bots, ticketing integration, CLI

**Problem it solves:** turning graph scores into something a human actually acts on.

**Does mature OSS solve it?** Largely yes for the plumbing, no for the workflow logic.

- PR creation, diff generation, and code-review-bot mechanics are well-trodden (GitHub/GitLab APIs, existing bot frameworks like Probot). Don't build a bespoke "Automated Codemod Engine" as a from-scratch AST-rewriting system for every language — for symbol/file deletion (the actual Phase-0-through-Phase-6 need), this is often literally "delete these lines / this file and open a PR," not a general-purpose codemod engine. Reach for a general codemod framework (e.g., `jscodeshift`/`ts-morph` for JS/TS, `libcst` for Python, `rewrite`/OpenRewrite for JVM) only where actual structural rewriting (not just deletion) is needed, and only when that need is concrete.
- Ticketing integration (Jira/Linear APIs) is commodity.

**Recommendation: for the CLI/API/reporting layer, build thin and specific — a CLI that queries the graph/confidence engine and a PR-bot that opens simple deletion diffs — rather than the "extensibility layer, plugin marketplace, full reporting engine" framing several whitepapers describe as major standalone components. This is real but small engineering effort; don't budget it as though it were comparable in scope to the confidence engine or graph schema.**

---

## 12. What should not exist at all

Being explicit about capabilities to actively cut, not just defer:

- **Autonomous deletion.** Every whitepaper correctly lands on human-in-the-loop as a permanent property, not an MVP limitation — keep this, and don't build any code path that merges a deletion without human approval, regardless of confidence score. There is no version of this product where the cost of being wrong once is worth the automation savings.
- **A bespoke graph query language.** Whitepaper 4's Cypher-style custom query examples and whitepaper 5's "graph-native index" framing both implicitly assume a purpose-built query layer. Don't build one — Glean's Angle already exists for code facts, and SQL already exists for everything else (Section 8). A third, in-house query language is pure NIH risk with no capability gain.
- **A "framework plugin marketplace" architecture built speculatively.** Build the specific plugins the org's actual stack needs (Section 4); do not architect for a hypothetical ecosystem of third-party contributed plugins before there's a single external consumer of this platform.
- **Full points-to/pointer analysis for dynamic languages.** As discussed in Section 3 — there is no cost-effective static technique here; this effort should go to the confidence model and runtime evidence instead.
- **A parallel bespoke bytecode-instrumentation agent when OTel is already sufficient.** Don't build a second observability pipeline out of technical elegance; reuse what the org already has.
- **CodeQL as a foundation**, for any org that isn't already GitHub-Advanced-Security-licensed — the licensing prohibits exactly the automated-CI use case this platform needs, and building on it without checking the license (as none of the five whitepapers did) would have been a real, discoverable-too-late mistake.

---

## 13. Revised implementation roadmap (leverage-maximizing)

This is a re-sequencing of the whitepapers' roadmaps in light of the build-vs-buy calls above — same overall shape, but with OSS integration pulled forward (since it's fast) and custom engineering concentrated where it belongs.

**Phase 0 (weeks, not quarters): Integrate, don't build.**
Stand up SCIP indexing for the org's top 2 languages using existing indexers; run Knip/Vulture as-is on JS/TS and Python repos; stand up Glean fed by SCIP output; stand up a Postgres schema for the unified graph. Ship a CLI that answers "what does static analysis say is unreferenced" by querying Glean + Postgres. This phase should be mostly integration work, not net-new algorithm work — if it isn't, something above has been over-built.

**Phase 1: Confidence engine v1.**
Build the evidence-fusion scoring service (Section 10) against the (currently static-only) evidence in the graph. Ship confidence tiers and the audit trail. This is the first genuinely custom component and should get real design time.

**Phase 2: Cross-repo + registry crawling.**
Add the package-registry crawler and version-alignment logic (Section 2) as a new evidence source into the same graph/scoring pipeline — no new architecture, just a new edge-producer.

**Phase 3: Runtime evidence via OpenTelemetry.**
Integrate OTel ingestion (Section 7) as another evidence source. This is where confidence scores materially improve; prioritize it over infra/microservice analysis if the org already has OTel deployed, since it's higher-leverage per unit effort than either.

**Phase 4: Infra + microservice contract edges.**
Add the thin per-protocol/per-IaC-format extractors (Sections 5–6) as further evidence sources into the same graph.

**Phase 5: DI/reflection convention plugins for JVM/.NET.**
The one piece of genuinely bespoke false-positive mitigation (Section 4) — do this once there's a real corpus of DI-heavy repos generating real false positives to design against, not speculatively.

**Phase 6: Workflow — PR bot, ticketing, calibration.**
Ship the action layer (Section 11) and start collecting labeled outcomes (flagged-and-confirmed vs. flagged-and-wrong) to eventually calibrate the confidence weights against real data instead of illustrative defaults.

**Deliberately deferred, not scheduled:** a dedicated graph database migration (only if Postgres query latency is actually measured to be a problem at real scale), a supervised ML confidence layer (only once outcome-labeled data exists), and any language/framework plugin not demonstrated to be needed by the org's actual repos.

---

## 14. What this changes about "competitive advantage"

If a competitor stood this up naively by literally implementing what the whitepapers describe end-to-end, they'd spend a large fraction of their engineering budget rebuilding SCIP-equivalent indexers, a Glean-equivalent fact store, a bespoke graph query language, and a custom bytecode profiler — none of which differentiates the product, all of which is available today. The actual competitive surface is: **how good is the evidence-fusion model, how well-tuned are the framework-specific false-positive plugins for the specific frameworks the target customers actually use, and how trustworthy/low-friction is the human-review workflow.** That's where design time, iteration, and calibration effort should concentrate — everything upstream of the confidence engine should be assembled from existing parts as quickly as possible specifically so that more time is available for the part that actually matters.
