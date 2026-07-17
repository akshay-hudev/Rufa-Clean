# Enterprise Dead Code Detection and Safe Removal: An Engineering Whitepaper

## Abstract

Determining that a piece of code is truly unused in an enterprise system is not a parsing problem — it is a whole-organization reachability problem spanning source code, build systems, package registries, service meshes, infrastructure manifests, and production runtime behavior. This whitepaper presents an architecture, algorithmic foundation, and confidence model for building a production-grade dead code detection and safe-removal platform at the scale of hundreds of repositories and thousands of microservices.

---

## 1. Problem Definition: Why Enterprise Dead Code Detection Is Hard

A single-repository dead-code tool (e.g. a linter flagging an unused local variable) solves a *closed-world* problem: every caller of a symbol is visible in the same compilation unit. Enterprise systems are an *open-world* problem: the set of callers is distributed across repositories, processes, and time, and is often not statically enumerable at all.

### 1.1 Structural sources of difficulty

- **Monorepos**: thousands of packages with internal path-based imports, build-tool-specific resolution (Bazel, Nx, Turborepo, Buck2), and code shared through workspace protocols rather than semantic versioning. A symbol may look "unreferenced" to a naive grep but be wired through a build graph the analyzer never parsed.
- **Polyrepos**: the opposite failure mode — the code *is* referenced, but only from a separate repository that the analyzer never scanned. Any single-repo tool will produce a false positive for every symbol exported for external consumption.
- **Shared libraries / internal packages**: published to an internal registry (Artifactory, Nexus, GitHub Packages, internal npm/PyPI mirrors). Usage is determined by *who has this in their manifest and actually imports it*, not by repository topology.
- **Generated clients**: OpenAPI/gRPC/GraphQL-generated SDKs create call edges that don't exist as literal source text — the "caller" is a code generator template, and the real caller is whoever invokes the generated method, possibly in a language the server-side analyzer doesn't parse.
- **Reflection**: `Class.forName`, `getattr`, `__import__`, C# `Activator.CreateInstance`, Java annotation processors — the call target is a runtime string, not a static reference. A symbol invoked exclusively via reflection has zero static call edges and is a guaranteed false positive for pure static tools.
- **Dependency injection (DI)**: Spring, Guice, NestJS, .NET DI containers wire concrete implementations to interfaces via configuration, annotations, or convention (e.g., "any class ending in `*ServiceImpl` implementing `*Service`"). The static call graph shows the interface used, not the implementation; the implementation looks dead.
- **Plugin systems**: code loaded by name from a manifest or directory scan at runtime (webpack loaders, VS Code extensions, Terraform providers). No static edge exists between host and plugin.
- **Configuration-driven execution**: YAML/JSON config selects a strategy class or handler by string key. The binding lives in data, not code.
- **Event-driven systems**: a Kafka consumer's "caller" is a topic name declared in a completely different service's producer code, possibly in another language, possibly in another repository.
- **Distributed microservices**: an HTTP handler's only "caller" may be an external client the organization doesn't control, or a mobile app shipped years ago and still in the wild — meaning the endpoint is used but will never appear in any repository.
- **Dynamic loading**: `require()` with a computed path, `importlib`, dynamic `System.Reflection.Assembly.Load`, feature-flagged code paths that are live in production for 1% of traffic.
- **Runtime-discovered dependencies**: service discovery, service mesh routing rules, and dynamic DNS mean "is this service called" is a fact about the network, not the code.

### 1.2 Why conventional static analysis tools fail

Conventional tools (ts-prune, Vulture, most IDE "unused symbol" warnings) are built on a **closed-world assumption**: the analyzer assumes it has seen every possible caller. This assumption is approximately true inside one file and increasingly false as scope widens:

| Scope | Closed-world validity |
|---|---|
| Single file | High |
| Single package | Medium-high |
| Single repository | Medium (fails on DI, reflection, generated code) |
| Organization (polyrepo) | Low (fails on cross-repo, registry-published, config-driven) |
| Organization + runtime | Requires hybrid static+dynamic evidence |

The core failure mode is that static analyzers treat **absence of a static edge as proof of absence of use**, when in an enterprise system absence of a static edge is only evidence of absence, and often weak evidence at that. The single research question of this whitepaper — "how do we determine, with the highest possible confidence, that code is truly unused" — is fundamentally a problem of **combining many weak, partial, sometimes-contradictory evidence sources into a calibrated confidence score**, not a problem of building a more complete parser.

---

## 2. Existing Tools: Architecture and Comparative Analysis

### 2.1 Knip (JavaScript/TypeScript)

**Architecture**: whole-project static analyzer built on the TypeScript compiler API (or a custom fast parser for JS). Builds a project-wide module graph starting from configured entry files, then performs reachability analysis over `import`/`export` statements, plus dedicated "plugins" that understand ~100 framework/tool conventions (Next.js pages, Vite config keys, ESLint config keys, package.json script references, etc.).

**Algorithm**: entry-point-seeded reachability over the ES module graph, augmented with plugin-specific root-set expansion (e.g., "every file under `pages/` is implicitly an entry point in Next.js").

**Strengths**: excellent false-positive suppression for JS/TS ecosystem conventions; detects unused files, exports, dependencies, and duplicate exports in one pass; incremental via caching of the module graph.

**Weaknesses**: single-language (JS/TS ecosystem only); no cross-repository awareness beyond `package.json` dependency declarations; no runtime validation; monorepo support depends on correctly configuring every workspace's entry points, which is a manual, error-prone step at scale.

### 2.2 ts-prune (TypeScript)

**Architecture**: much simpler than Knip — walks the TypeScript AST via the compiler API and flags exported symbols with no import site found anywhere in the configured project.

**Algorithm**: pure static reference counting on exports; no configurable root-set expansion, no plugin system.

**Strengths**: minimal setup, fast, good first-pass signal.

**Weaknesses**: extremely high false-positive rate for any symbol consumed externally, via barrel re-exports, or via dynamic import — the tool has effectively been superseded by Knip for this reason and is frequently cited primarily as a cautionary example of naive export-counting. No plugin model, no cross-repo model, no runtime model.

### 2.3 Vulture (Python)

**Architecture**: AST-based static analyzer that tracks defined-vs-used names across a Python project, with a **confidence percentage per finding** — an important precedent for this whitepaper's confidence model.

**Algorithm**: name-usage counting with heuristics for common false-positive patterns (test fixtures, `__all__`, decorators); ships a "whitelist" mechanism where users hand-annotate known dynamically-used symbols to suppress recurring false positives.

**Strengths**: the per-finding confidence score is exactly the right idea, just scoped only to lexical/heuristic signals rather than multi-source evidence; whitelisting is a pragmatic, low-tech way to encode tribal knowledge about reflection/DI usage.

**Weaknesses**: no type information (Python's dynamism defeats pure AST matching on attribute access); no cross-repository or runtime awareness; confidence score is heuristic-tuned rather than derived from an evidence model.

### 2.4 Repowise, vFunction, CodeAnt, Scavenger, Riftmap

These represent the more recent "enterprise-grade" category, and — based on available public documentation — share a common architectural pattern rather than fundamentally different approaches:

- **vFunction**: primarily an *architectural observability* platform for monoliths-to-microservices decomposition; builds a static+runtime dependency graph of a large codebase (particularly Java) to identify "domains" and, as a byproduct, flags code with no incoming edges in that graph. Its main contribution to this problem space is combining static call graphs with **runtime traces** (via agents/APM integration) to validate reachability — a hybrid approach this whitepaper adopts as a core principle (Section 7).
- **Repowise / Scavenger / Riftmap / CodeAnt**: positioned as dead-code and code-health platforms that build a repository-level or organization-level dependency graph and layer git-history/ownership signals (last-modified date, commit frequency, CODEOWNERS) on top of pure reachability to prioritize *what's safe and worth removing*, not merely *what's unreferenced*. This "prioritization layer" is a second common pattern worth adopting: reachability alone answers "is this dead," but an enterprise system also needs to answer "is this worth the review risk to remove," which requires blending in code churn, ownership, and blast-radius signals.

### 2.5 Common architectural pattern across all tools

Every serious tool in this space converges on the same three-stage pipeline:

1. **Parse and build a local reference graph** (AST/module graph within a language boundary).
2. **Seed a root set** of things known to be alive (entry points, exports, framework conventions) and compute reachability from those roots.
3. **Report unreached nodes**, filtered through heuristics or whitelists to suppress known-noisy patterns (reflection, DI, dynamic dispatch).

### 2.6 Missing capabilities / opportunity space

None of the surveyed tools does all of the following simultaneously, and this is precisely the gap this whitepaper's recommended architecture (Section 12) fills:

- Cross-repository reachability grounded in actual package-registry consumption data, not just declared dependencies.
- First-class modeling of asynchronous/event-driven edges (topic producer → topic consumer) as graph edges of equal standing to function calls.
- Infrastructure-artifact-derived edges (a Terraform resource wiring a Lambda to an SQS queue *is* a reachability edge).
- A **unified, multi-language, multi-evidence-source graph** with a calibrated, evidence-weighted confidence score rather than a boolean or an ad hoc percentage.
- Runtime evidence as a first-class, continuously-refreshed input rather than a one-off validation.

---

## 3. Static Analysis Techniques

### 3.1 The pipeline, and what each stage buys you

**Lexical analysis / parsing / AST construction** are prerequisite and non-optional — every downstream technique operates on the AST. Diminishing-returns risk here is time spent on a hand-rolled parser instead of using existing compiler front ends (TypeScript compiler API, `ast`/`libcst` for Python, `go/ast`, JavaParser/Eclipse JDT, Roslyn for C#). **Recommendation: never write a parser from scratch for a mainstream language; consume the language's own compiler/type-checker front end.** This is essential not optional, because AST-only analysis (no types) cannot resolve overloaded methods, interface implementations, or generic dispatch correctly.

**Symbol resolution / name resolution** binds identifiers to declarations within scope. Essential — without it you cannot distinguish two functions named `process` in different modules.

**Type resolution** is essential in statically typed languages (Java, C#, TypeScript, Go, Rust) because it disambiguates interface-to-implementation edges, method overloading, and generic instantiation — all of which are common DI/plugin-adjacent patterns. In dynamically typed languages (Python, JS without types, Ruby), type resolution is best-effort (via inference or optional type annotations) and should be treated as a confidence-boosting signal rather than a hard requirement.

**Import resolution** — essential; must correctly follow each language/build system's module resolution algorithm (Node's `require`/ESM resolution including `exports` maps, Python's `sys.path` and package `__init__.py` semantics, Go modules, Bazel `deps`). This is where most naive tools break in monorepos, because build-tool-specific resolution (path aliases, workspace protocols) diverges from the language's own default resolution.

**Alias analysis** — tracks that `const f = obj.method; f()` is a call to `obj.method`. Complementary but important: without it, re-exported/aliased/destructured references are invisible, producing false positives (flagging `method` as dead when it's called via alias `f`). Essential for JS/TS and Python; less critical in languages that discourage first-class function aliasing as heavily.

**Control-flow graphs (CFG)** — model intraprocedural execution paths. Necessary for precise dead-code detection *within* a function (unreachable branches) but only a minor contributor to *cross-symbol* dead code detection, which is the primary enterprise concern. Treat as complementary.

**Call graphs** — the single most important artifact in this whole system. A call graph is the backbone reachability structure; almost every other technique either builds it, refines it, or supplements its edges. Essential.

**Inheritance graphs** — essential wherever the language has virtual dispatch (Java, C#, TypeScript classes, Python via duck typing at reduced confidence). Needed to resolve "is this abstract method actually called" into "is any concrete override, reached via any call to the interface, actually invoked" — a two-hop reachability question.

**Data-flow analysis** — tracks value propagation; complementary, primarily useful for resolving *which* concrete value flows into a dynamic dispatch site (e.g., resolving a string literal passed to a factory function so the analyzer can synthesize the DI/plugin edge automatically rather than relying on a whitelist).

**Pointer / alias analysis (in the compilers sense, for languages like C/C++/Go)** — determines what a pointer may reference; important for those languages specifically, lower priority for managed/GC languages where reference semantics are simpler. Complementary, high engineering cost, apply selectively (e.g., only for C/C++ modules in a polyglot enterprise, since escape analysis and precise pointer analysis are known to be expensive — often super-linear — and provide diminishing returns beyond distinguishing a handful of aliasing patterns relevant to dead-store elimination, which is largely orthogonal to "is this exported symbol used").

**Escape analysis** — determines whether a value's lifetime exceeds its allocating scope; useful for compiler optimization, low relevance to the dead-code-removal problem directly. Treat as out of scope / diminishing returns for this system.

**Interprocedural and whole-program analysis** — essential; this is precisely what elevates a per-file linter into an enterprise reachability engine. The scalability chapter (Section 9) addresses how to make whole-program analysis tractable at monorepo scale via incrementality and summarization rather than full re-analysis.

**Incremental analysis** — essential for CI/CD viability. Full whole-program analysis on every commit across a million-LOC monorepo is not economically tractable; the system must support incremental recomputation seeded from a changed-file set (see Section 9).

### 3.2 Priority ranking for implementation

1. Parsing + symbol/type/import resolution (foundation, no shortcuts).
2. Call graph + inheritance graph construction (core reachability substrate).
3. Alias analysis (precision, prevents false positives).
4. Interprocedural/whole-program reachability with incrementality (the actual product).
5. Data-flow analysis for dynamic-dispatch resolution (precision improvement, apply where cost-effective).
6. CFG-level intraprocedural dead code (nice-to-have, low marginal enterprise value).
7. Pointer/escape analysis (narrow, language-specific, apply only where the language demands it).

---

## 4. Cross-Repository Analysis

### 4.1 The core problem

A symbol exported from repository A may be consumed by repositories B, C, D — or by none. Repository A's own analyzer cannot answer this by itself; the system needs an organization-wide index.

### 4.2 Building the index

- **Workspace discovery**: enumerate every repository the organization owns (via the source-control platform's API — GitHub/GitLab org listing, Bitbucket project listing) and every workspace/package manifest within each (package.json workspaces, Cargo workspaces, Go `go.mod` modules, Maven/Gradle multi-module poms).
- **Package manager and internal registry indexing**: crawl the internal registry (Artifactory, Nexus, GitHub Packages, internal npm/PyPI/Maven mirrors) for the full dependency graph: which internal package versions does which consumer manifest declare. This produces a **declared-dependency edge** — necessary but not sufficient, since a package can be declared but not actually imported (over-declaration is common, especially after refactors).
- **Semantic indexing**: for each declared dependency, statically scan the consumer's imports to confirm the dependency is *actually referenced*, and specifically *which* exported symbols are referenced. This upgrades a repository-level edge into a **symbol-level edge**, which is what the confidence model in Section 11 actually needs.
- **Git dependencies**: some ecosystems (Go, Cargo, npm via git URLs) reference a dependency directly by commit/tag rather than through a registry; these must be discovered by parsing manifest files for `git+`/VCS-style dependency specifiers and resolving them against the org's known repository list.
- **Version alignment**: a consumer may depend on an *old* published version of a package that still contains a symbol the current `main` branch has already removed from its public API — meaning the symbol is "dead" on `main` but very much alive in what's actually deployed downstream. The analyzer must track **version-qualified** usage, not just "does anyone anywhere use this name."
- **Generated SDKs**: OpenAPI/gRPC/GraphQL-generated client packages are themselves entries in the registry index; walking their generation source (the `.proto`/OpenAPI spec) back to the server-side handler that the SDK method corresponds to reconstructs the call edge even though no literal function call exists in source form.
- **Repository identity**: normalize each repository/package to a canonical ID (not just a name, since names collide across ecosystems) so that graph nodes are unambiguous. Recommend content-addressable identity keyed on (VCS host, org, repo, and package-manager-native package name).

### 4.3 Avoiding false positives from external consumption

The dominant failure mode of naive tools here is treating "no reference found in *this* repository" as proof of deadness. Mitigation:

1. Every exported symbol from any internal package must be checked against the cross-repo semantic index **before** being flagged, not just against the local repo's call graph.
2. Public APIs published to *external* (non-org) consumers (open-source packages, public SDKs, partner-facing APIs) cannot be exhaustively indexed this way at all — the org doesn't control every consumer. These must be flagged as **"externally public — cross-repo analysis inconclusive"** and routed to a different confidence tier (Section 11) that relies on runtime/telemetry evidence (e.g., "has this public endpoint received any request from any client in 12 months") rather than a closed static answer.
3. Semver-major-version-published symbols should be held to a stricter bar (higher confidence threshold required) before recommending removal than symbols behind an internal-only registry, since the downstream blast radius is unbounded.

---

## 5. Microservice-Aware Analysis

### 5.1 The generalization: every inter-service contract is a graph edge

The unifying idea is that "is this used" generalizes beyond function calls to **any producer/consumer contract**, and each contract type has its own discovery mechanism:

| Contract type | Producer artifact | Consumer artifact | Discovery method |
|---|---|---|---|
| REST | route/handler definition | HTTP client call site or OpenAPI-generated SDK usage | route inventory (framework introspection or OpenAPI spec) cross-referenced with API gateway access logs |
| GraphQL | resolver definition | query/mutation document | static query document scanning + GraphQL server field-usage metrics (many GraphQL servers can report per-field query frequency) |
| gRPC | service method impl | stub call site | `.proto`-derived service definitions cross-referenced with generated-stub call sites, same principle as OpenAPI SDKs above |
| Kafka | producer `send`/`publish` call, topic name | consumer subscription, topic name | build a **topic registry**: every producer and consumer statically declares (or is inferred to declare) a topic name; join on topic name across the whole org's indexed repos |
| RabbitMQ/NATS/pub-sub | exchange/queue/subject publish | subscribe/bind | same topic/queue-name join strategy as Kafka |
| Webhooks | webhook registration (often in a third-party dashboard or infra config) | receiving endpoint handler | requires infrastructure/config scanning (Section 6) since the "caller" is external and not in any repo |
| Cron / scheduled workflows | scheduler config (k8s CronJob, Airflow DAG, cloud scheduler entry) | invoked job/function | infra manifest parsing joined against handler code |
| Service mesh routes | mesh routing rule (Istio VirtualService, Linkerd) | destination service | infra manifest parsing joined against service registry |
| API gateway routes | gateway route config | backend service handler | gateway config parsing joined against handler code |

### 5.2 Identifying abandonment

A topic, queue, endpoint, or job is a candidate for removal when **both** of the following hold, at high confidence:

- Static join finds no live producer/consumer/route pointing at it, **and**
- Runtime evidence (Section 7) shows zero traffic/messages/invocations over a sufficiently long trailing observation window (long enough to cover known low-frequency legitimate patterns — e.g., a monthly batch job must be observed over months, not days).

An asymmetric case worth calling out explicitly: a producer with no consumer is *not* necessarily dead (the topic may exist for future consumers, or for an out-of-org consumer); a consumer with no producer strongly suggests true deadness, since a subscription that nothing feeds is doing no useful work and its removal is comparatively low risk. This asymmetry should be encoded directly into the confidence model (Section 11) rather than treated as symmetric "any missing edge is equal evidence."

---

## 6. Infrastructure-Aware Analysis

Infrastructure-as-code artifacts encode reachability edges that never appear in application source code:

- **Kubernetes manifests / Helm charts**: a Deployment/Service/Ingress wires a container image and port to a route; a missing or zero-replica Deployment for a service is strong evidence the service itself (and everything only reachable through it) is not running in production, independent of what the source code looks like.
- **Terraform / CloudFormation**: wiring between managed cloud resources (Lambda triggers, SQS/SNS subscriptions, API Gateway integrations, IAM policies scoping who can invoke what) — these are authoritative edges for serverless and event-driven architectures where the "caller" is cloud infrastructure config rather than code.
- **Docker**: a Dockerfile's `ENTRYPOINT`/`CMD` identifies the actual root-set entry point for reachability analysis of that image's code — critical because application frameworks often have multiple possible entry points (CLI tool vs. server) and only the one actually run in the built image is truly "live."
- **OpenAPI / Protobuf**: as covered in Section 5, these are the contract source-of-truth for generated-client edge reconstruction, and additionally, a service definition entry with no corresponding route/handler in the implementation is itself a signal (either a stale spec or an unimplemented, hence dead-on-arrival, contract).
- **Package/workspace manifests**: covered in Section 4.
- **Service registries** (Consul, Eureka, cloud service mesh registries): give a *live* view of what's actually registered and receiving health checks right now, complementary to the *declared* view from k8s/Terraform.
- **CI/CD pipeline definitions**: a build/deploy pipeline that no longer references a service or that has been disabled is strong corroborating evidence that a service is abandoned; conversely, an actively-scheduled deploy pipeline is evidence of liveness even during a temporary traffic lull.

**Recommendation**: parse infrastructure artifacts into the same unified graph (Section 8) as source-code edges, tagged with a distinct edge type and source-confidence weight, rather than treating infra analysis as a separate report. Infra edges are often more reliable indicators of *actual production reality* than source code, since source code describes what's *possible*, while a Kubernetes Deployment with zero replicas or a scheduled-but-disabled CronJob describes what's *actually happening*.

---

## 7. Runtime Validation

### 7.1 Why static confidence has a ceiling

Every technique above answers "is there a possible path to this code," which is a necessary but not sufficient condition for "this code executes in practice." Reflection, DI, plugin loading, and dynamic dispatch mean static analysis alone will always retain irreducible uncertainty for a meaningful fraction of an enterprise codebase. Runtime evidence is the only way to close this gap.

### 7.2 Sources of runtime evidence

- **OpenTelemetry traces**: distributed traces naturally encode "this span (function/handler/RPC) executed, and was called by this other span" — effectively a *runtime call graph* with production-frequency counts, directly comparable against the static call graph to find static edges that are theoretically possible but empirically never traversed, or (more usefully) static nodes that have literally zero corresponding spans across the observation window.
- **Execution tracing / instrumentation / profiling**: sampling or full instrumentation profilers (e.g., continuous profiling systems) provide function-level "was this frame ever on the stack" data, which is a cheaper, coarser substitute for full distributed tracing where OTel adoption is incomplete.
- **Production logs**: structured logs that include a function/handler/route identifier can be mined the same way — presence over the observation window is evidence of liveness, and a long enough absence is evidence of the opposite, weighted appropriately for known low-frequency call patterns (Section 5.2).
- **Code coverage** (from automated test suites, *not* production): a much weaker signal — code covered by tests is not necessarily used in production, and code with no test coverage is not necessarily dead. Use coverage only as a tertiary signal, and never as sole grounds for a removal recommendation, since a large fraction of legitimately-used enterprise code has poor test coverage.

### 7.3 How runtime evidence changes confidence

Runtime evidence should never *unilaterally* override static evidence in one direction only — presence of a trace is very strong evidence of liveness (near-certain), but *absence* of a trace is only strong evidence of deadness when the observation window is long enough and covers all relevant traffic patterns (peak season, monthly/quarterly batch jobs, disaster-recovery-only code paths, admin/support tooling used rarely). Section 11 formalizes this asymmetry.

---

## 8. Unified Dependency Graph

### 8.1 Why a single unified graph, not siloed reports

Every analysis stage above (static, cross-repo, microservice, infrastructure, runtime) produces edges over the *same* underlying question — "does X depend on Y" — just from different evidence sources. Siloing them into separate reports forces a human to manually reconcile five different tools' outputs, which is precisely the toil this platform exists to eliminate. The correct architecture is **one graph, many edge types and node types, tagged with provenance and confidence per edge.**

### 8.2 Node types

- `Symbol` (function, method, class, variable, exported binding) — the finest-grained unit, tagged with language, file, repo, and version.
- `Module/File`
- `Package` (internal or external, registry-qualified with name+version)
- `Repository`
- `Service` (a deployable unit — may map to many repos/packages, or vice versa)
- `Route/Endpoint` (REST/GraphQL/gRPC)
- `Topic/Queue/Subject` (async messaging)
- `InfraResource` (k8s object, Terraform resource, CI pipeline)
- `ExternalConsumer` (opaque node representing "unknown/uncontrolled external client" — necessary so that public-API edges have somewhere to terminate rather than dangling)

### 8.3 Edge types and metadata

Every edge carries: `type` (calls, imports, implements, publishes-to, subscribes-to, routes-to, deploys, declared-dependency, generated-from), `source` (static-AST, registry-index, infra-manifest, runtime-trace, production-log), `confidence-weight` (per Section 11), `last-observed timestamp` (critical for runtime edges — an edge without a recent observation should decay in confidence over time, discussed below), and `evidence-refs` (pointer back to the raw evidence — the specific trace span, the specific import statement — for auditability, since a human reviewing a deletion recommendation needs to be able to click through and verify it, not just trust a score).

### 8.4 Graph queries and traversal

The central operation is **reverse reachability from every node to the global root set** (application entry points, public API surface, scheduled jobs, message consumers with external producers). A node with zero paths to any root, across all edge types and evidence sources, is a dead-code candidate. This is a standard graph reachability computation (BFS/DFS from roots, or more efficiently, a single reverse-BFS from every node in bulk, memoized) but must be evidence-aware: rather than a boolean "reachable/unreachable," each node accumulates the confidence-weighted evidence of all edges pointing to it, and the overall algorithm becomes a **weighted reachability / evidence-propagation problem** rather than pure boolean graph reachability (Section 11 formalizes the scoring).

### 8.5 Storage and caching

Recommend a property graph store (e.g., a graph database or a well-indexed relational schema with adjacency tables) rather than an in-memory graph recomputed from scratch, specifically because:
- The graph must survive across incremental runs (Section 9) — nodes/edges are upserted, not rebuilt.
- Queries needed by the reporting engine ("all dead symbols in package X," "blast radius if I delete Y") are graph traversal queries best served by a store with native traversal, not by ad hoc code over a flat DB.
- Edge provenance/timestamp metadata benefits from a schema that supports time-indexed queries (e.g., "last observed within 90 days") efficiently.

Caching should operate at the level of **per-file/per-package summary graphs** (see Section 9) so that a change in one file only invalidates the summaries that depend on it, not the whole-program graph.

---

## 9. Scalability

At the target scale (hundreds of repos, thousands of services, millions of LOC, dozens of languages), full whole-program re-analysis on every change is not tractable. The system must be architected around incrementality from day one.

- **Incremental indexing**: adopt a **compositional/summary-based** whole-program analysis strategy (the same principle underlying tools like Facebook/Meta's Infer and modern incremental type checkers): analyze each unit (file, module, package) independently into a *summary* (its exported symbols, its external call edges, its unresolved dynamic-dispatch sites), then compose summaries into the whole-program graph without re-analyzing unchanged units. A changed file triggers re-summarization of only that file plus re-composition of edges touching it — not a full re-analysis.
- **Distributed execution**: summarization is embarrassingly parallel (one unit at a time, no cross-unit state needed during this phase) and should be distributed across a worker fleet keyed by repo/package; only the composition/reachability phase needs a centralized (or graph-partitioned) pass.
- **Change detection**: drive incremental re-indexing off VCS webhooks (push/merge events) rather than polling, and diff against the previous commit's summary set to determine the minimal re-summarization set.
- **Graph partitioning**: partition the unified graph by "blast radius" boundaries — e.g., by internal package or by service — so that reachability computation for a change in service A doesn't require touching the full graph for unrelated service Z unless an edge actually crosses that boundary. Standard graph-partitioning heuristics (min-edge-cut across natural repo/package boundaries) apply directly, since repo/package boundaries in practice correlate strongly with low-edge-cut partitions.
- **CI integration**: expose the incremental analysis as a fast (target: single-digit minutes) CI check on pull requests that reports *newly-introduced* dead code or *newly-resolved* dead code relative to the base branch, rather than requiring a full-organization scan per PR — this is the difference between a tool developers tolerate and one they route around.
- **Performance optimization**: cache parsed ASTs and type-checker artifacts keyed by content hash (not by file path/mtime) so that identical file content across branches/commits is never re-parsed; this alone typically yields the largest wall-clock win in incremental CI systems.

---

## 10. False Positives: Sources and Mitigations

| Source | Mechanism | Mitigation |
|---|---|---|
| Reflection | string-keyed dynamic instantiation | pattern-match common reflection APIs per language and synthesize a "possible" edge to any symbol whose name matches the resolved (or unresolvable) string; if unresolvable, flag as low-confidence-unreachable rather than dead, and surface the specific call site so a human can judge it |
| Dependency injection | interface-to-impl binding via annotation/config/convention | build framework-specific plugins (analogous to Knip's plugin model) that understand each major DI framework's binding convention and synthesize the edge explicitly, rather than relying on generic heuristics |
| Framework conventions | e.g., Next.js page files, Django URL conventions, JAX-RS annotations | maintain a curated, extensible plugin library per framework that expands the root set correctly (this is precisely Knip's strongest contribution and should be adopted wholesale as a pattern) |
| Generated code | codegen produces call sites that don't textually match source templates | trace codegen provenance (which spec/template produced this file) and treat the *spec*, not the generated file, as the analysis unit where possible |
| Test-only usage | symbol only referenced from test code | tag test-only edges distinctly; a symbol reachable only from tests is a distinct confidence category ("test-only, not production-reachable") rather than either "definitely dead" or "definitely alive" |
| Public API surface | consumed by parties outside the org's visibility | route to external-telemetry-based confidence tier (Section 4.3) |
| Feature flags | code path live only behind a flag, possibly at 0% rollout currently but intended for future ramp | integrate with the feature-flag system's own state as an additional evidence source; a flag at 0% but marked "active/ramping" should suppress a dead-code flag entirely, whereas a flag marked "fully rolled out" or "archived" should be treated as strong signal for the *other* (non-flagged) branch |
| Version skew across environments | code dead in `main` but live in a still-deployed older release | track version-qualified reachability (Section 4.2) rather than single-branch reachability |
| Low-frequency legitimate calls | disaster recovery code, annual batch jobs, admin tooling | require observation windows long enough to cover known low-frequency patterns before treating runtime absence as evidence; allow explicit annotation/whitelisting for known rare paths (as Vulture does) |

---

## 11. Confidence Model

### 11.1 Design principles

1. Confidence is a **continuous, evidence-weighted score**, not a boolean, because the underlying question is fundamentally probabilistic given an open-world system.
2. Evidence sources are **not equally reliable** and must be weighted accordingly; a positive runtime trace is near-certain proof of liveness, while absence of a short-window static reference is weak evidence of deadness.
3. The model must be **asymmetric**: evidence *for* liveness should dominate evidence *for* deadness at equal magnitude, because the cost of a false "dead" (breaking production) vastly exceeds the cost of a false "alive" (a few extra lines of code retained). This asymmetry should be an explicit, tunable parameter, not an accident of implementation.
4. Every score must be **explainable and auditable** — traceable back to the specific evidence items (Section 8.3's `evidence-refs`) — since a human will ultimately approve any deletion of consequence, and "the algorithm said so" is not an acceptable justification in a production incident postmortem.

### 11.2 Evidence inputs and their weight class

| Evidence | Direction | Reliability class |
|---|---|---|
| Static call graph edge found | Alive | High |
| Static call graph edge absent, single repo only | Dead (weak) | Low |
| Cross-repo semantic index shows external symbol-level usage | Alive | High |
| Cross-repo index shows declared-but-unimported dependency | Neutral/weak dead | Low |
| Externally-public API with no cross-repo visibility | Inconclusive | N/A — route to runtime tier |
| Infra manifest shows live wiring (non-zero replicas, active route) | Alive | High |
| Infra manifest shows disabled/zero-scale resource | Dead (supporting) | Medium |
| Runtime trace/log observed within window | Alive | Very high |
| Runtime trace/log absent across a sufficiently long window covering known cycles | Dead (supporting) | Medium-high (scales with window length and traffic-pattern coverage) |
| Test-only reference | Neutral (distinct category) | N/A |
| Historical usage (was used, declining trend) | Weak dead signal, informs *trend* not current state | Low-medium |

### 11.3 Scoring approach

Recommend a **weighted evidence aggregation** rather than a black-box ML classifier as the default, specifically for auditability: compute a liveness score as a monotonic combination (e.g., noisy-OR across independent evidence sources, so that any single strong "alive" signal from a reliable source pushes the score toward alive regardless of how many weak "dead" signals exist) rather than a naive weighted sum (which allows many weak dead-signals to outvote one strong alive-signal — precisely the failure mode that produces dangerous false "dead" recommendations). A supervised model *can* be layered on top later, trained on historical "this was flagged and turned out to be actually used" incidents as negative examples, but should augment rather than replace the interpretable evidence-aggregation core, to preserve auditability.

### 11.4 Confidence tiers and recommended action

| Tier | Score range (illustrative) | Recommended action |
|---|---|---|
| **Confirmed dead** | No alive evidence from any high/very-high-reliability source; multiple medium-or-better dead-supporting sources; sufficient runtime observation window elapsed | Recommend automated PR to remove, with mandatory human review and full evidence trail attached |
| **Likely dead** | No high-reliability alive evidence; at least one medium dead-supporting source; runtime window incomplete or traffic-pattern coverage uncertain | Flag for human triage; do not auto-generate a removal PR |
| **Inconclusive** | Externally-public surface, or reflection/DI pattern unresolved, or version-skew ambiguity unresolved | Surface as "needs investigation" with the specific ambiguity called out explicitly (e.g., "public API — no external telemetry available") |
| **Likely alive** | At least one medium-reliability alive signal, no strong dead signal | Do not flag |
| **Confirmed alive** | Any high/very-high-reliability alive evidence | Never flag; exclude from all future scans until evidence changes |

Only the "Confirmed dead" tier should ever be eligible for an automated removal PR, and even then, human approval remains mandatory — this is a recommendation-engine architecture, not an autonomous-deletion architecture, precisely because production-breaking false positives are the single most damaging failure mode this platform can produce, and trust in the tool (hence its adoption) is destroyed by even one bad auto-deletion.

---

## 12. Recommended Architecture

### 12.1 Major components

1. **Language Analyzer plugins** — one per supported language, each wrapping that language's own compiler/type-checker front end (Section 3.1), producing per-unit summaries (Section 9) in a common intermediate schema.
2. **Framework Convention plugins** — per-framework root-set-expansion and DI/reflection-edge-synthesis modules (Section 10), modeled on Knip's plugin architecture, extensible so new frameworks can be added without core changes.
3. **Cross-Repository Resolver** — crawls VCS org listings and internal package registries, builds the declared-dependency and symbol-level-usage index (Section 4).
4. **Microservice Contract Resolver** — joins producer/consumer contracts across REST/GraphQL/gRPC/messaging systems by contract identity (route path, topic name, proto service) (Section 5).
5. **Infrastructure Analyzer** — parses k8s/Helm/Terraform/CloudFormation/CI manifests into infra-resource nodes and wiring edges (Section 6).
6. **Runtime Collector** — ingests OpenTelemetry traces, profiler data, and structured production logs, aggregating into per-symbol/per-route/per-topic observation windows (Section 7).
7. **Unified Graph Store** — the property graph described in Section 8, the system of record all other components write into and the reporting engine reads from.
8. **Confidence Engine** — implements the evidence-aggregation scoring model (Section 11) as a query/materialization layer over the graph store, producing per-node scores and tiers, recomputed incrementally as new evidence arrives.
9. **Reporting Engine** — turns scored nodes into human-consumable output: dashboards, PR-review-ready diffs with blast-radius summaries, and audit trails linking every recommendation back to its evidence.
10. **CLI** — developer-facing entry point for local/CI use: "what's dead in this PR's diff," "what's the blast radius if I delete X."
11. **APIs** — programmatic access for the reporting engine, custom dashboards, and integration with ticketing systems (auto-file a cleanup ticket for "Confirmed dead" findings rather than auto-deleting).
12. **Extensibility layer** — the plugin interfaces (language analyzers, framework conventions, infra parsers) are the primary extension points; new languages/frameworks/infra tools are added as plugins implementing a stable contract against the intermediate summary schema, not by modifying the core reachability/scoring engine.

### 12.2 Analysis pipeline (end to end)

```
VCS webhook / scheduled scan
        |
Language Analyzer plugins  -->  per-unit summaries (cached by content hash)
        |
Framework Convention plugins --> root-set expansion + synthesized DI/reflection edges
        |
Cross-Repo Resolver ------------> registry-derived symbol-level usage edges
        |
Microservice Contract Resolver -> producer/consumer join edges
        |
Infrastructure Analyzer --------> infra wiring edges
        |
        v
   Unified Graph Store  <-------  Runtime Collector (continuous stream, not one-shot)
        |
   Confidence Engine (evidence aggregation, per Section 11)
        |
   Reporting Engine  -->  CLI / Dashboard / Ticketing integration / PR bot
```

### 12.3 Justification of key trade-offs

- **Plugin architecture over monolithic core**: enterprise environments are irreducibly polyglot and multi-framework; a monolithic analyzer would need to special-case every language/framework in its core, becoming unmaintainable. The plugin model (proven at scale by Knip within its narrower JS/TS scope) generalizes cleanly.
- **Property graph over per-tool reports**: unifying evidence is the entire point of this system per the central research question; siloed reports cannot answer the confidence question at all, only the boolean-reachability question, which this whitepaper has shown to be insufficient.
- **Recommendation engine, not autonomous deletion**: the asymmetric cost of false positives (Section 11.1) makes full autonomy an unacceptable risk profile for a system operating on production code at this scale; human-in-the-loop is a permanent architectural property, not a temporary MVP limitation.
- **Continuous runtime collection over one-shot validation**: traffic patterns vary over time (seasonal, batch cycles); a single runtime snapshot cannot distinguish "dead" from "quiet right now," so the collector must be a standing, continuously-refreshed component, not a one-time script.

---

## 13. Implementation Roadmap

The roadmap is ordered so that each phase's output is independently useful (delivering value before the full system exists) and each phase's infrastructure is a prerequisite for the next, rather than being ordered arbitrarily by feature glamour.

**Phase 0 — Single-language, single-repo MVP.**
Build one Language Analyzer plugin (recommend starting with TypeScript or Java, given mature compiler APIs) plus basic call-graph/inheritance-graph construction and simple root-set seeding (package.json entry points / main methods). This alone reproduces roughly what Knip/ts-prune already do — justified as a starting point because it validates the summary schema and incremental-caching approach (Section 9) on a tractable scope before layering complexity, and gives an immediate, shippable CLI tool.

**Phase 1 — Monorepo support.**
Extend root-set discovery to workspace-aware resolution (Bazel/Nx/Turborepo/multi-module builds) and add the Framework Convention plugin model. This must precede cross-repo work because monorepo-scale incremental summarization/composition (Section 9) is the same mechanism cross-repo analysis will need next, just at smaller scale — solving it here first de-risks the harder cross-repo version.

**Phase 2 — Additional language plugins.**
Add 2-3 more languages (e.g., Python, Go, C#) by implementing the Language Analyzer plugin contract against the existing summary schema, proving the plugin architecture generalizes before investing in cross-repo/infra complexity that would otherwise need to be redone per language.

**Phase 3 — Cross-repository analysis.**
Build the VCS org crawler and internal registry indexer (Section 4). This must come after Phase 1's monorepo incrementality work because the composition algorithm is directly reused, just scaled to organization breadth, and because a credible confidence model (Phase 6) cannot be built without cross-repo evidence — most enterprise false positives originate here.

**Phase 4 — Microservice-aware analysis.**
Add contract-join resolvers for REST/GraphQL/gRPC/messaging (Section 5). Sequenced after cross-repo analysis because contract resolution requires the same organization-wide repository index built in Phase 3 to locate producers and consumers across services.

**Phase 5 — Infrastructure-aware analysis.**
Add infra manifest parsing (Section 6). Sequenced after microservice analysis because infra wiring edges are most valuable as *corroborating* evidence for the producer/consumer edges established in Phase 4 (e.g., confirming a Kafka consumer's deployment is actually running) — building infra analysis first, without the contract graph to attach it to, would produce disconnected, less actionable signal.

**Phase 6 — Runtime validation.**
Integrate OpenTelemetry/log-based runtime collection (Section 7) and stand up the full Confidence Engine (Section 11). This is deliberately last among the "capability" phases because it is the most operationally expensive to integrate (requires organization-wide observability buy-in) and because the evidence-aggregation model needs the full evidence taxonomy from Phases 1-5 already flowing into the graph to be meaningfully weighted — building the confidence model on partial evidence sources earlier would require redesigning it once more sources arrive.

**Phase 7 — Enterprise scalability and performance.**
Harden distributed execution, graph partitioning, and CI integration (Section 9) for full target scale (hundreds of repos, millions of LOC). Sequenced last deliberately: premature optimization of an incomplete evidence pipeline risks locking in architectural decisions before the full shape of the workload (which evidence sources dominate cost, which queries the Confidence Engine actually needs) is known from operating Phases 0-6 in practice.

**Why this order overall**: each phase either (a) proves out infrastructure the next phase directly reuses (Phase 1 → 3, Phase 2 proving plugin generality), or (b) adds an evidence source that only becomes *actionable* once the graph/contract structure it attaches to already exists (Phase 4 before 5, Phase 6 last). Reversing the order — e.g., building runtime validation before cross-repo analysis — would produce a system with rich telemetry but no way to correlate it against the organization-wide reachability question the central research question actually asks.

---

## Conclusion

The central research question — how to determine, with the highest possible confidence, that code is truly unused — cannot be answered by any single analysis technique or existing tool surveyed here. It requires treating "dependency" as a generalized concept spanning function calls, package registry consumption, service contracts, infrastructure wiring, and observed runtime behavior, unified into a single evidence graph, and scored through an asymmetric, auditable confidence model that treats false "alive" as cheap and false "dead" as expensive. The architecture and roadmap above are designed so that every phase delivers standalone value while building the substrate the next phase needs — arriving, by the final phase, at a system capable of recommending safe code removal at true enterprise scale with a defensible, evidence-backed confidence score attached to every recommendation.
