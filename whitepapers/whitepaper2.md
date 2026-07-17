# Whitepaper2
Enterprise-Grade Dead Code Detection and Safe Code Removal: Architecture, Algorithms, and Systems Design

1. The Enterprise Dead Code Problem

In large-scale engineering organizations, software systems evolve into highly complex webs of execution. As codebases scale, they accumulate significant technical debt in the form of unused modules, obsolete public interfaces, and orphaned services [cite: 1, 2, 3]. This code represents a major tax on organizations, inflating build and deployment sizes, increasing security exposure to unpatched transitive vulnerabilities, and reducing developer efficiency by forcing engineers to reason about dead logic [cite: 1, 2, 4, 5, 6].

However, identifying and safely removing dead code across an enterprise estate of hundreds of repositories and thousands of microservices is a remarkably difficult task [cite: 7, 8, 9].

```
+-------------------------------------------------------------------------+
|                  THE ENTERPRISE EXECUTION DISCONNECT                    |
+-------------------------------------------------------------------------+
|                                                                         |
|  [ Static Compiling Code ]                                              |
|         |                                                               |
|         |  -- (Bypassed by) --> Reflection, Dynamic Class Loading       |
|         v                                                               |
|  { Topological Fracture }                                                |
|         |                                                               |
|         |  -- (Decoupled by) --> REST, GraphQL, gRPC API Calls          |
|         v                                                               |
|  [ Dynamic Production Runtime ]                                         |
|                                                                         |
+-------------------------------------------------------------------------+
```

Determining with absolute confidence that a segment of code is completely unused is challenging because of several structural characteristics of modern software architecture:

- **Monorepos and Polyrepos:** Large organizations often split their codebases between multi-project monorepos and thousands of polyrepos [cite: 7, 8]. This division makes it difficult to map dependencies globally. A public helper function inside a utility library may appear completely unused within its local repository, but actually serves as a critical dependency for multiple downstream applications in other repositories [cite: 7, 10, 11, 12].
- **Shared Libraries and Internal Registries:** Shared utilities are packaged and published to internal registries (such as private npm, Maven, or PyPI registries) [cite: 13]. Conventional analysis tools evaluate these libraries in isolation [cite: 11]. Because they lack access to the global consumer graph, they must conservatively assume that every public export is active [cite: 4, 10, 11, 14].
- **Generated SDKs and Clients:** Modern microservices use codegen tools to compile client stubs and software development kits (SDKs) from OpenAPI, Protobuf, or GraphQL schemas [cite: 7, 8, 15]. This generation process creates a complex web of code paths that are statically referenced by compilation targets but may be completely uninvoked in actual production workflows [cite: 7, 16].
- **Reflection, Dependency Injection, and Plugins:** Enterprise frameworks rely heavily on Dependency Injection (DI) and inversion-of-control containers [cite: 7, 9]. During bootstrap, frameworks dynamically discover, instantiate, and execute classes using metadata annotations, string-based reflection, or dynamic plugin loaders [cite: 7, 9, 16]. Static compilers see zero call-graph edges to these classes, frequently leading to false-positive dead code flags [cite: 7, 9, 16].
- **Configuration-Driven Execution:** Systems often configure active execution pathways outside the compiled source code, using YAML, JSON, or database-driven settings [cite: 7, 9]. If a code path is statically reachable but its runtime configuration flag has been set to false for years, the path is functionally dead but invisible to static compilers [cite: 3, 16, 17].
- **Event-Driven Architectures:** In decoupled microservice architectures, communication occurs asynchronously via brokers like Kafka, RabbitMQ, or NATS [cite: 18]. This asynchronous processing creates a topological gap in static call graphs: the edge terminates at a message publishing point and resumes inside an independent consumer handler, bypassing static reference validation [cite: 15, 18].
- **Decoupled Microservices:** The global execution path of a user request is distributed across network boundaries using REST, GraphQL, or gRPC endpoints [cite: 18, 19]. No single-language compiler-aware tool can map the connection between a client request and its corresponding service handler across different processes and programming languages [cite: 7, 8, 15].
- **Dynamic Loading and Runtime Discovery:** Applications dynamically load modules at runtime using constructs like JavaScript’s dynamic `import()` or Java’s dynamic class loading [cite: 7, 20]. Because these targets are resolved dynamically at runtime, they cannot be traced through ahead-of-time static analysis [cite: 9, 11, 20].

Conventional static analysis tools generally fail when applied to this problem at enterprise scale. Most traditional linters, compilers, and IDE analysis engines operate strictly within single-file or single-project boundaries [cite: 1, 11, 21]. They trace localized variables and private functions but are blind to the global topological connections of the system [cite: 14, 21, 22].

Furthermore, static tools are designed to evaluate potential call paths rather than actual production usage [cite: 21, 22, 23]. To safely remove code without introducing regressions, an enterprise platform must bridge static program analysis, infrastructure configurations, and dynamic runtime telemetry [cite: 9, 21, 22].

---

2. Evaluation of Existing Code Analysis Paradigms

Several tools have been developed to address code analysis, dependency management, and dead code identification. Designing a robust enterprise architecture requires evaluating the design choices, parsing approaches, and operational boundaries of these existing tools.

Knip

Knip is a static analysis tool designed for the JavaScript and TypeScript ecosystems [cite: 10, 16, 24]. Under the hood, it uses the native TypeScript Compiler API to construct an import-export graph across defined entry points [cite: 11, 20]. Knip identifies unused files, exports, types, and dependencies [cite: 11, 24, 25].

Its primary strength lies in its extensive plugin architecture, which recognizes framework-specific entry points and dynamic configuration files (such as Next.js pages or Vitest setups) that would otherwise be flagged as dead [cite: 11, 25].

However, Knip is constrained to local workspaces or monorepos; it cannot natively resolve references from external private consumers across independent repositories or track actual runtime behavior [cite: 11, 12, 20].

ts-prune

ts-prune is a focused static analysis utility developed to identify unused exports within TypeScript projects [cite: 12, 16]. It processes source files via the TypeScript compiler API, scanning for exported symbols with zero local references [cite: 12, 16].

While highly performant, ts-prune is archived and lacks support for monorepos, dynamic framework configs, and test-suite awareness [cite: 11, 24]. It does not attempt whole-program dependency or runtime execution checks, limiting its utility in large-scale enterprise environments [cite: 12, 24].

Vulture

Vulture is an open-source static analysis tool for Python codebases [cite: 7, 16, 26]. It utilizes Python's built-in `ast` module to build lists of defined classes, functions, and variables, alongside a list of referenced names [cite: 26].

By calculating the set difference between defined and referenced symbols, Vulture highlights potential dead code [cite: 26].

Because Python is a highly dynamic language, Vulture is susceptible to high false-positive rates [cite: 16, 26]. Code invoked via string reflection, dynamic attributes, or test harnesses is frequently misidentified as unused [cite: 16, 26], requiring manual exclusion lists and configuration helpers.

Repowise

Repowise is an AGPL-3.0 open-source code intelligence engine that parses source code across 14 languages [cite: 7, 27]. It uses the tree-sitter parser to construct an interactive structural dependency graph of the codebase [cite: 7, 27, 28].

Rather than focusing solely on static imports, Repowise integrates Git history analysis to compute code ownership, maintainer churn, and "co-change partners"—files that frequently change together in Git commits without direct structural references [cite: 27]. Its `get_dead_code` engine applies NetworkX graph algorithms, including PageRank and community detection, to identify isolated subgraphs [cite: 7, 28, 29].

However, Repowise is designed primarily to provide contextual intelligence to AI agents via the Model Context Protocol (MCP) [cite: 7, 28, 30]. It does not incorporate dynamic production runtime telemetry or parse cross-repository infrastructure configurations [cite: 31].

vFunction

vFunction is an AI-driven architectural modernization and observability platform [cite: 32]. Its design combines static code analysis with dynamic JVM runtime profiling to identify technical debt, circular dependencies, domain boundaries, and "zombie code" (legacy methods and classes that compile but are never executed) [cite: 21, 22, 32].

vFunction attaches an agent to the running JVM, capturing method invocation pathways under production traffic [cite: 21, 22]. By overlaying these dynamic execution flows onto the static call graph, vFunction isolates unused classes and methods [cite: 21, 22].

Its primary focus is architectural refactoring and microservice extraction rather than automated safe code removal within continuous integration loops [cite: 33, 34, 35].

CodeAnt

CodeAnt is an agentic code review and compliance platform designed to run in CI/CD pipelines, Git hooks, or IDE environments [cite: 36, 37]. It combines a deterministic rule engine running over 30,000 checks in 30+ languages with generative AI to identify code quality issues, security vulnerabilities, duplicate code, and dead code [cite: 38, 39].

When CodeAnt identifies dead code, it generates confidence scores and recommends automated refactoring [cite: 39].

While CodeAnt provides real-time developer feedback, its dead-code detection relies on localized AST parsing and pattern matching, lacking whole-system semantic indexing or multi-repository dependency context [cite: 39, 40].

Scavenger

Scavenger is an open-source, production-grade runtime dead code analysis platform built by Naver, directly inspired by the Codekvast project [cite: 41, 42]. Scavenger is explicitly designed to identify methods and classes that compile but are never executed in real-world deployment [cite: 41, 43].

It attaches a lightweight dynamic agent to the JVM, which records method execution timestamps with minimal performance overhead (~15 nanoseconds per invocation) [cite: 41, 43].

The agent periodically streams this telemetry to a centralized collector server, which aggregates the data in a relational store (such as MySQL or Vitess) [cite: 41, 44]. Developers can then generate "invocation snapshots" over extended execution windows (e.g., 90 to 180 days) to identify unused classes and methods [cite: 41].

The primary limitation of Scavenger is its tight coupling to specific runtime environments (JVM and beta-stage Python agents) [cite: 41]. It lacks static symbol verification, multi-repo config tracing, or cross-language reference resolution.

Riftmap

Riftmap is a developer tool and SaaS platform specializing in cross-repository dependency mapping and change blast-radius analysis [cite: 8, 45, 46]. Riftmap operates under the paradigm of "parsed, not inferred" dependency mapping [cite: 47, 48]. It connects to GitHub or GitLab organizations using read-only tokens, shallowly clones all repositories, and parses configuration manifests across 12 distinct infrastructure and language ecosystems [cite: 8, 49].

Riftmap extracts edges at the infrastructure layer: Terraform module sources with Git ref pins, Dockerfile `FROM` instructions with build-argument evaluation, Helm chart dependencies, Kubernetes/Kustomize declarations, and CI/CD workflow templates [cite: 8, 15, 49]. It resolves these parsed references to construct a unified multi-repo artifact dependency graph [cite: 48, 49].

Riftmap is a symbol-agnostic tool; it maps dependencies at the repository and artifact boundary rather than resolving class- or method-level code symbols [cite: 15, 48].

Meta SCARF and Google Sensenmann

Within hyperscale engineering environments, proprietary frameworks have been constructed to handle dead code removal automatically.

Google’s Sensenmann constructs a complete build target dependency graph using Blaze (Bazel) [cite: 3]. It collects runtime liveness signals by aggregating execution logs from Google's production data centers and workstations [cite: 3]. If an internal binary target has not been executed for a defined threshold, Sensenmann propagates a "dead" signal down the build tree [cite: 3]. It automatically submits automated deletion code reviews ("changelists") to clean up the binary and its exclusive dependencies in a unified commit, successfully deleting nearly 5% of all C++ code at Google [cite: 3].

Meta’s Systematic Code and Asset Removal Framework (SCARF) operates at an even finer granularity [cite: 9, 35]. SCARF combines semantic static indexing via Glean (which extracts compiler-level facts about class hierarchies, functions, and references) with production runtime telemetry and application traffic analysis [cite: 9, 35, 50].

SCARF generates an augmented dependency graph that resolves dynamic usage patterns, such as verifying whether a specific class is ever instantiated before asserting its code pathways are dead [cite: 9]. SCARF integrates with CodemodService, an internal system that programmatically applies code changes and opens automated refactoring pull requests [cite: 9]. SCARF has scaled to process hundreds of millions of lines of code, automatically deleting over 104 million lines of code and petabytes of obsolete database columns across Meta's developer estate [cite: 9, 35, 51].

The table below summarizes the key trade-offs and architectural dimensions of these platforms:

|Tool|Focus Scope|Parsing Mechanics|Runtime Telemetry Integration|Graph Storage Strategy|Deletion Strategy|Primary Scale Limitation|
|---|---|---|---|---|---|---|
|**Knip** [cite: 11]|Local Monorepos|TS Compiler API [cite: 20]|None|In-Memory (Node.js)|Local File Deletion (`--fix`) [cite: 11]|Restricted to Node.js/TypeScript [cite: 11]|
|**ts-prune** [cite: 12]|Local Files|TS AST [cite: 16]|None|None (Linear Pass)|Terminal Output Listing|Unaware of monorepos, tests, or config [cite: 11, 24]|
|**Vulture** [cite: 26]|Single Projects|Python AST [cite: 26]|None|In-Memory Set Math|Terminal Output Listing|SUSCEPTIBLE to false-positives in dynamic code [cite: 16, 26]|
|**Repowise** [cite: 7]|Multi-Language Local|Tree-Sitter [cite: 27]|None|SQLite & NetworkX [cite: 7, 29]|MCP Agent Actions [cite: 7, 28]|Lack of dynamic runtime data [cite: 31]|
|**vFunction** [cite: 32]|Target JVM App|ASM Bytecode [cite: 22]|Dynamic JVM Agent [cite: 22]|Custom Graph Store|Refactoring To-Do Lists [cite: 33]|Manual execution of generated refactoring pathways [cite: 33]|
|**CodeAnt** [cite: 36]|Individual PRs|AST Rules [cite: 39]|None|In-Memory (Node.js)|Programmatic PR Diffs [cite: 39]|Local AST constraints [cite: 39, 40]|
|**Scavenger** [cite: 41]|Deploy JVM App|JVM ASM / Bytecode|Dynamic JVM Agent [cite: 41]|Relational (MySQL/Vitess) [cite: 41]|Manual via Snapshot API [cite: 41]|Blind to static call structures and configurations|
|**Riftmap** [cite: 8]|Multi-Repo Org|Custom Multi-Parser|None|Relational + Graph Cache|CI Gates, Blast-Radius API [cite: 45]|Symbol-agnostic; stops at file boundaries [cite: 15, 48]|
|**Meta SCARF** [cite: 9]|Whole Monorepos|Glean Indexer [cite: 35]|Dynamic production tracers [cite: 9]|Custom Graph Databases|Automated Codemod PRs [cite: 9]|Deep dependency on custom corporate libraries [cite: 9]|
|**Sensenmann** [cite: 3]|Whole Monorepos|Bazel Graph [cite: 3]|Server log tracking [cite: 3]|Build Dependency Graph|Proposed deletion changesets|Coarse-grained (target/binary level) [cite: 3]|

---

3. High-Fidelity Static Program Analysis Foundations

To construct an enterprise dead code detection system with high confidence, the platform must employ a layered, mathematically rigorous static program analysis engine. Static analysis serves as the baseline structural validator, identifying the maximum possible boundary of code reachability.

```
+-------------------------------------------------------------------------+
|                        HIGH-FIDELITY PARSING PIPELINE                   |
+-------------------------------------------------------------------------+
|                                                                         |
|  Source Files (TS/Go/C++)                                               |
|         |                                                               |
|         v                                                               |
|  Parsers (Oxc, Tree-sitter, Clang)                                      |
|         |                                                               |
|         v                                                               |
|  Abstract Syntax Tree (AST) & SSA Intermediate Representation (IR)      |
|         |                                                               |
|         v                                                               |
|  Semantic Name Resolution (Binds variable references to scopes)         |
|         |                                                               |
|         v                                                               |
|  Global Call Graph Construction (Andersen's Constraints + RTA Filters)  |
|                                                                         |
+-------------------------------------------------------------------------+
```

Parsing and Intermediate Representations (IR)

The pipeline begins by ingesting source code and parsing it into structured representations. Rather than relying on simple text grep, regex, or generic AST libraries, an enterprise-grade platform utilizes highly optimized, compiler-grade parsing frontends [cite: 20, 39, 52].

For example, the platform integrates frontends such as the Rust-based Oxc parser for JavaScript/TypeScript, the Clang frontend for C/C++, and the native `go/parser` for Go [cite: 20, 52]. These engines parse source files into high-fidelity Abstract Syntax Trees (ASTs) [cite: 53].

For multi-language support, the platform translates compiler-specific ASTs into an Intermediate Representation (IR) based on Single Static Assignment (SSA) form [cite: 54, 55]. SSA form ensures that every variable is assigned exactly once, simplifying downstream data-flow calculations [cite: 54]. The AST and SSA IR encode vital syntactic positions, including source spans, line/column metadata, and structural declarations [cite: 20, 56].

Symbol, Namespace, and Type Resolution

Once the AST and IR are constructed, the system initiates symbol resolution. This step maps raw textual identifiers to canonical, fully qualified semantic definitions [cite: 53, 57]. The resolution pipeline must execute the following operations:

- **Scope Tracing:** Tracing variable scopes through lexical blocks, closures, functions, classes, and namespaces to correctly resolve identifier shadowings.
- **Import/Export Linking:** Resolving import specifiers to target file paths, handling aliases, namespace imports (e.g., `import * as ns from 'module'`), re-exports, and default export bindings [cite: 11, 20].
- **Static Type Checking and Type Inference:** Resolving the underlying types of all expressions. This enables the platform to accurately determine the target receivers of method calls, separating overloaded functions and resolving interfaces to concrete implementations [cite: 52, 56, 58].

Call Graph Construction

The construction of a precise global call graph represents the most critical static analysis step for dead code detection [cite: 57, 58]. The call graph is a directed graph G=(V,E), where V represents the set of all program methods, and E represents potential invocation edges [cite: 58].

In object-oriented and dynamically typed languages, resolving the destination of virtual or polymorphic method calls is highly non-trivial [cite: 58, 59]. The platform implements and evaluates multiple call-graph generation algorithms, balancing computational complexity against precision:

Class Hierarchy Analysis (CHA)

CHA is a context-insensitive, flow-insensitive algorithm that resolves virtual method calls by inspecting the overall class inheritance graph [cite: 57, 58]. For a virtual call `x.foo()`, where `x` is declared as type `T`, CHA resolves the target to any overriding implementation of `foo()` in any subclass of `T`.

While CHA is highly scalable and runs in linear time O(∥V∥+∥E∥), it is extremely over-conservative [cite: 57]. It assumes that all subclasses can be instantiated, leading to a massive over-provisioning of call edges and hiding true dead code under a web of false-positive reachability paths.

Rapid Type Analysis (RTA)

RTA improves upon CHA by maintaining a globally tracked set of concretely instantiated types in the program.

During call graph construction, a virtual call `x.foo()` on a receiver of type `T` is only resolved to subclass overrides of `foo()` if those subclasses have been statically instantiated elsewhere in the program. RTA runs in linear time and eliminates call edges for uninstantiated classes.

Pointer and Points-To Analysis (Andersen vs. Steensgaard)

To achieve maximum precision, the call graph must be constructed using points-to analysis to determine which concrete objects a pointer or reference variable can reference at runtime [cite: 58, 60, 61].

- **Andersen’s Analysis:** Andersen's is an inclusion-based, flow-insensitive, context-insensitive pointer analysis [cite: 60, 61]. It models pointer assignments as constraint inclusions (e.g., p=q⟹pts(q)⊆pts(p)) and computes the points-to sets by solving a transitive closure on a directed constraint graph [cite: 58, 60, 61]. While highly precise, Andersen's analysis has a worst-case computational complexity of O(n3) where n is the number of pointer variables [cite: 60], posing scaling challenges for massive codebases.
- **Steensgaard’s Analysis:** Steensgaard's is an equality-based, unification-based algorithm [cite: 55, 61]. It models pointer assignments as structural type unification constraints (e.g., p=q⟹pts(p)=pts(q)), merging points-to sets into single equivalence classes using a union-find data structure [cite: 61]. This achieves exceptional performance with a near-linear complexity of O(nα(n)) where α is the inverse Ackermann function [cite: 61]. However, this speed comes at a heavy cost in precision: merging points-to sets creates massive, artificial equivalence classes, causing the call graph to over-resolve and assume that unrelated methods are reachable.

_Architectural Recommendation:_ For enterprise static analysis, the platform utilizes a hybrid approach: **Andersen's inclusion-based analysis** is executed with budget-constrained context-sensitivity within localized module boundaries [cite: 58, 60]. For whole-program global resolution across service boundaries, **Rapid Type Analysis (RTA)** is used to construct the macro-topology, balancing high precision with execution speed [cite: 58].

Classification of Program Analysis Techniques

To optimize resource allocation across millions of lines of code, program analysis techniques are classified based on their structural utility, execution overhead, and direct value in dead code identification:

|Analysis Technique|Value Classification|Performance Cost|Justification & Architectural Strategy|
|---|---|---|---|
|**Lexing & Parsing (AST)** [cite: 53]|**Essential**|Low (O(N))|Serves as the structural foundation. Must be implemented via highly parallel, native parsers (e.g., Oxc, tree-sitter) [cite: 20, 27].|
|**Symbol Resolution** [cite: 53]|**Essential**|Low-Medium (O(NlogN))|Essential for mapping names to scopes. Resolves imports and links variables to declaration sites [cite: 11, 20].|
|**Type & Import Resolution** [cite: 53]|**Essential**|Medium|Critical for object-oriented method resolution, interface binding, and type-safe call graph validation [cite: 56, 58].|
|**Control Flow Graph (CFG)** [cite: 53]|**Complementary**|Low (O(V+E))|Operates intraprocedurally to find unreachable code blocks positioned after unconditional returns or exits [cite: 2, 54].|
|**Rapid Type Analysis (RTA)** [cite: 57]|**Essential**|Medium|Standard method for building global call graphs. Eliminates virtual call targets belonging to uninstantiated types.|
|**Points-To / Pointer Analysis** [cite: 58]|**Complementary**|High (O(N3))|Necessary for resolving polymorphic calls and callbacks. Execution must be isolated to highly sensitive modules.|
|**Alias Analysis** [cite: 53]|**Low Value**|High|Uncovering variables pointing to identical heap locations offers marginal return for broad dead code detection.|
|**Escape Analysis** [cite: 62]|**Low Value**|High|Critical for stack allocation and lock elision [cite: 62, 63]. Offers zero direct signal for identifying unused interfaces.|
|**Interprocedural / Whole-Program** [cite: 53, 60]|**Essential**|High|Essential for tracing reachability across function boundaries and identifying public dead exports [cite: 11, 12, 57].|
|**Incremental Analysis** [cite: 64]|**Essential**|Low (O(changes))|Ensures scale. Restricts analysis to files modified in a pull request, patching the global index via delta updates [cite: 64, 65].|

---

4. Multi-Repository and Workspace Topology Alignment

Enterprise software is rarely contained within a single repository [cite: 8, 49]. A dead code platform must resolve symbols across a vast, dynamic web of private repositories, internal shared registries, and versioned packages [cite: 45, 56].

```
+-----------------------------------------------------------------------------------------------+
|                                    PRODUCER REPOSITORY                                        |
|  Defines Public Symbol: "UserService.deactivateAccount()"                                     |
|  Semantic SCIP Symbol ID: "scip-go npm @enterprise/user-service 1.4.2 UserService/deactivate#" |
+-----------------------------------------------------------------------------------------------+
                                               |
                                               |  Emits SCIP Index
                                               v
+-----------------------------------------------------------------------------------------------+
|                                  UNIFIED SECTOR RESOLVER                                      |
|  - Ingests SCIP indices from all organization repositories                                    |
|  - Maps symbol definitions to unique internal packages and artifact registries                |
+-----------------------------------------------------------------------------------------------+
                                               ^
                                               |  Resolves Reference Search
                                               |
+-----------------------------------------------------------------------------------------------+
|                                    CONSUMER REPOSITORY                                        |
|  Imports: "@enterprise/user-service"                                                          |
|  Invokes: "UserService.deactivateAccount()"                                                   |
|  Semantic SCIP Ref ID: "scip-go npm @enterprise/user-service 1.4.2 UserService/deactivate#"   |
+-----------------------------------------------------------------------------------------------+
```

Semantic Indexing: LSIF vs. SCIP

To navigate and map code dependencies across hundreds of repositories without local workspace setup, the platform leverages semantic indexing protocols [cite: 31, 56].

Historically, the Language Server Index Format (LSIF) was used to store precomputed code intelligence data [cite: 31, 56]. LSIF, however, exhibits severe architectural limitations: it uses a complex graph format with dynamically incrementing global integer IDs, making incremental updates nearly impossible and resulting in massive, uncompressed index files [cite: 64].

The platform standardizes on the **Source Code Intelligence Protocol (SCIP)**, developed by Sourcegraph to resolve these deficiencies [cite: 56]. SCIP provides a highly compressed, language-agnostic indexing format built on Protocol Buffers [cite: 56, 64]. Its architectural advantages include:

- **Deterministic Human-Readable Symbols:** SCIP encodes symbols as structured strings containing package ownership, version, and inline hierarchy path [cite: 56, 64]: `scip-typescript npm @enterprise/auth-sdk 2.1.0 TokenValidator#validateToken().`
- **Strict Incremental Processing:** Unlike LSIF, which requires a global graph rewrite, SCIP indexes individual files independently [cite: 64, 65]. When a developer pushes a change to a single file, the platform indexes only that file and merges its SCIP definitions into a centralized SQLite database, reducing processing overhead [cite: 52, 64, 65].
- **Compression Efficiency:** SCIP payloads are on average 4x to 5x smaller than equivalent LSIF payloads when uncompressed [cite: 52, 64].

Resolving Version Drift and Version Alignment

A major challenge in polyrepo networks is version drift [cite: 8].

For instance, Repository A defines a shared utility library. Repository B imports version `1.2.0` of this library. Repository C imports version `2.0.0-rc1`.

If a specific method in the utility library is flagged as unused by Repository B, but is heavily consumed by Repository C, a naive static analysis engine operating on Repository A's main branch might incorrectly determine the method is dead, or conversely, assume it is live across all branches [cite: 1, 8].

The platform's Multi-Repository Resolver addresses this by building a version-aware symbol matrix:

1. **Package Manifest Parsing:** The system continuously parses dependency manifests (`package.json`, `go.mod`, `Cargo.toml`, `requirements.txt`) across all repositories [cite: 8, 20, 49].
2. **Semantic Mapping:** It maps exact commit SHAs and version tags to their respective SCIP indices [cite: 45, 56].
3. **Cross-Version Reference Querying:** When evaluating if a symbol is dead in a shared repository, the resolution engine queries the global database for incoming SCIP references across all active production tags of consuming repositories [cite: 45, 56]. A symbol is only designated as a deletion candidate if it has zero incoming reference edges across all actively deployed versions of downstream projects [cite: 45, 56].

Mitigating External-Consumer False Positives

For shared internal libraries, static analysis within the producing repository will inevitably flag all public interfaces as dead because there are no local callers within the library's own codebase [cite: 4, 7, 10, 11]. The platform implements structural safety guardrails to mitigate these false positives:

- **Explicit JSDoc/Annotation Checks:** If a public symbol is marked with `@public`, `@api`, or `@internal` tags, the system adjusts its classification, recognizing the symbol as an intentionally exposed interface [cite: 10, 25].
- **Symbol Export Verification:** If a symbol is registered in a public export path of an NPM workspace package, Go module, or Python library, the platform suspends automated removal unless it can verify with absolute confidence that _no_ consuming repository in the organization registers a dependency on that parent package [cite: 1, 20, 49].
- **Shadow Workspace Synthesis:** For tightly coupled microservices, the platform programmatically synthesizes a "virtual monorepo" workspace [cite: 66]. It links local package boundaries together, allowing tools like Knip to trace references across boundaries as if they were a single project [cite: 11, 20, 66].

---

5. Microservice Boundaries and Event-Driven Mesh Analysis

In a modern enterprise architecture, the boundaries of execution are frequently crossed not by standard function calls, but by network sockets, HTTP requests, serialization envelopes, and event-driven broker queues [cite: 18, 19]. To identify dead code within microservices, the platform must bridge these network hops.

```
+-------------------------------------------------------------------------+
|                  SYNCHRONOUS SERVICE BOUNDARY MAPPING                   |
+-------------------------------------------------------------------------+
|                                                                         |
|  [ API Gateway Ingress Route: "/v1/users/{id}" ]                        |
|                         |                                               |
|                         v  (Network Route Resolution)                   |
|  [ Target Controller Class in Microservice: "UserController" ]          |
|                         |                                               |
|                         v  (Internal Call-Graph Search)                 |
|  [ Internal Application Handlers & Logic Blocks ]                       |
|                                                                         |
+-------------------------------------------------------------------------+
```

Synchronous Endpoint Mapping: OpenAPI, gRPC, and GraphQL

For synchronous communication, the platform extracts API contracts to determine endpoint liveness [cite: 36, 38, 39]:

- **REST/OpenAPI:** The system automatically parses routing frameworks in source code (e.g., Express Router, Spring Web Controllers, Go Gin Engine) to extract all defined path patterns, HTTP verbs, and corresponding controller methods [cite: 38]. It pairs this static extraction with OpenAPI/Swagger manifests generated in the build step, mapping code-level handlers directly to network endpoints [cite: 36].
- **gRPC/Protobuf:** The platform parses `.proto` service definitions and compiles them into a unified semantic map. It traces code generation patterns to identify the specific abstract base classes that implement RPC methods, mapping these implementations to the network layer [cite: 8].
- **GraphQL:** It parses schema definitions (`schema.graphql`) and traces resolving patterns [cite: 25]. The platform links GraphQL fields to their corresponding code-level "Resolver" functions.

If an API gateway configuration or service mesh manifest does not expose a route to a REST endpoint, and no internal callers are found, the platform flags both the route definition and the controller implementation class as dead code [cite: 21].

Asynchronous Event Tracing: Event-Driven Architectures

In event-driven systems using Kafka, RabbitMQ, or NATS, producers and consumers are fully decoupled, making traditional static analysis blind to transaction flows [cite: 18]. To bridge this gap, the platform implements an Event Broker Dependency Resolver:

1. **Topic Extraction:** The platform statically parses event configurations and string constants in source code to extract broker topic names and queue bindings [cite: 18]. For instance, it identifies code invocations like: `kafkaProducer.send("user.deactivated", payload)`.
2. **Schema Registry Analysis:** It integrates with schema registries (such as Confluent Schema Registry or Apicurio) to fetch the serialized Protobuf, Avro, or JSON schemas associated with each topic [cite: 8].
3. **Handler Binding:** It traces consumer subscription annotations and registration blocks in downstream codebases (e.g., Spring `@KafkaListener(topics = "user.deactivated")` or NestJS `@EventPattern('user.deactivated')`).

By mapping topics as unified nodes in the global dependency graph, the platform connects producing code pathways to consuming code handlers [cite: 18].

If a producer continues to emit to a topic, the associated consumer event handler is marked as live, even if no static code reference points to it. Conversely, if a topic is active but its payload schema has evolved in a way that renders a specific handler method incompatible, the platform flags the handler as dead or obsolete code.

Webhooks, Cron Jobs, and Orchestrated Workflows

To map dynamic or periodic execution pathways, the platform parses declarative task specifications:

- **Webhooks:** The system traces webhook endpoint registries inside third-party integration manifests (such as Stripe or GitHub event webhooks), linking the network delivery targets to local controller entry points.
- **Cron Jobs:** It extracts crontab expressions from source annotations, Kubernetes CronJob specifications, or system configuration manifests to identify the specific script files or CLI commands executed on schedule.
- **Scheduled Workflows:** The system parses orchestration engine definitions (such as Temporal, Airflow, or Camunda BPMN XMLs) to identify step handlers and task workers, linking these external steps to their compiled code handlers.

---

6. Infrastructure-as-Code (IaC) and Manifest Tracing

Declarative configurations act as the definitive link between static code modules and actual deployment [cite: 8, 49]. An enterprise platform must parse declarative infrastructure artifacts to correctly evaluate the liveness of code targets [cite: 8, 48, 49].

Infrastructure-as-Code (IaC) Parsing

The platform implements native, deterministic parsers for major IaC ecosystems to discover code-to-runtime dependencies [cite: 8, 48, 49]:

- **Dockerfiles:** The system parses Dockerfiles, extracting the default base image references, build arguments (`ARG`), environment variables (`ENV`), and execute entry points (`ENTRYPOINT`, `CMD`) [cite: 8, 15, 49]. This ensures that any script, binary, or entry point invoked at boot time is marked as statically live.
- **Terraform:** It parses Terraform configurations, resolving structural modules, variable assignments, and target container image mappings [cite: 8, 15, 49]. It normalizes Git-based Terraform source paths to identify precisely which repositories produce the underlying modules [cite: 8, 15].
- **Helm and Kubernetes Manifests:** The platform parses Helm charts and Kubernetes YAML declarations [cite: 8]. It resolves nested values-override matrices, ingress routing definitions, and container specs to extract the exact container image tags, environment configurations, and active cron job triggers [cite: 8, 15, 49].

```
+-------------------------------------------------------------------------+
|                  INFRASTRUCTURE-TO-CODE ANCHOR PATHWAY                  |
+-------------------------------------------------------------------------+
|                                                                         |
|  [ Ingress Manifest (Route: "/v1/users") ]                              |
|         |                                                               |
|         v  (Resolves To)                                                |
|  [ Service Mapping (Port: 8080) ]                                       |
|         |                                                               |
|         v  (Targets Pod)                                                |
|  [ Container Spec (Image: "gcr.io/enterprise/user-service:1.4.2") ]     |
|         |                                                               |
|         v  (Compiles From)                                              |
|  [ Dockerfile (ENTRYPOINT: ["/app/bin/user-service-binary"]) ]          |
|         |                                                               |
|         v  (Build Target Source Entry)                                  |
|  [ Go Source File ("cmd/user-service/main.go") ]                        |
|                                                                         |
+-------------------------------------------------------------------------+
```

Mapping Code Generation Patterns and Ingress Paths

By combining infrastructure manifests, the platform traces code reachability from the network edge down to individual source files:

1. **Ingress Parsing:** The system reads ingress definitions and maps public routes to target internal microservices [cite: 8, 49].
2. **Container Target Resolution:** It links internal services to their corresponding container configurations and Dockerfile contexts [cite: 8].
3. **Compilation Input Verification:** The platform reads build files (e.g., Go `go.mod`, Java Gradle/Maven, Rust `Cargo.toml`) to determine the exact source files and binaries built into the target container image [cite: 8].
4. **Liveness Verification:** By tracing this chain, the system establishes a clear line of reachability from a live public ingress route down to specific initialization methods in the application [cite: 21]. If a compiled binary or image target is completely missing from deployment schedules and Helm templates, the platform flags the entire target project as dead code [cite: 3].

---

7. Dynamic Runtime Validation and Continuous Telemetry

While static and infrastructure analyses construct a precise map of potential reachability, they cannot guarantee whether a code path is actively executed in production [cite: 22, 23]. To reach the highest possible confidence, the platform overlays static data with dynamic, continuous runtime validation [cite: 21, 22].

OpenTelemetry and Distributed Tracing Spans

The platform integrates directly with OpenTelemetry (OTel) collectors to analyze live span data under production traffic [cite: 67, 68, 69]. By processing OTel traces, the system builds an empirical distributed service map [cite: 67, 68]:

- **Trace Context Tracing:** It parses propagation headers (e.g., W3C Trace Context, Jaeger, B3) to link traces across network boundaries [cite: 19, 69].
- **Span Attribute Mapping:** The system extracts key attributes from spans, including the active HTTP routes (`http.route`), database queries (`db.statement`), and gRPC methods (`rpc.method`) [cite: 19, 67, 70].
- **Empirical Route Verification:** If a controller route like `GET /api/v1/payments` is statically declared, the platform monitors OTel spans to verify if this specific route is executed. If a route registers zero invocations over a prolonged monitoring window (e.g., 90 days), the associated controller class is flagged for deprecation [cite: 21].

```
+-------------------------------------------------------------------------+
|                      PRODUCTION RUNTIME VALIDATION                      |
+-------------------------------------------------------------------------+
|                                                                         |
|  Production Traffic Spans (OTel Collector)                              |
|         |                                                               |
|         +--> HTTP Spans: Extract `http.route`                           |
|         |                                                               |
|         +--> Bytecode Events: Method Bitmaps (Scavenger Dynamic Agent)  |
|         |                                                               |
|         v                                                               |
|  [ Unified Aggregator & Event Counter ]                                 |
|         |                                                               |
|         v                                                               |
|  [ Dynamic Carving Overlay Engine ]                                     |
|  - Overlays active runtime hits onto static call graph [20, 73]         |
|  - Identifies dead branches with high-confidence [20]                   |
|                                                                         |
+-------------------------------------------------------------------------+
```

Bytecode Profiling and Class-Loader Instrumentation

To detect unused code at a finer granularity than API routes, the platform employs a dynamic class-loader and bytecode profiling agent [cite: 22, 41, 43]. Inspired by the architecture of Scavenger and Codekvast, the agent attaches directly to the running application runtime [cite: 41, 43]:

- **Low-Overhead JVM Instrumentation:** For JVM-based applications, the agent hooks into the JVM Tool Interface (JVMTI) or utilizes bytecode manipulation libraries (such as ASM or Javassist) to modify compiled classes dynamically during class loading [cite: 41]. It injects extremely simple probe instructions at the entry boundary of every method [cite: 43]. The overhead is constrained to approximately 15 nanoseconds per invocation [cite: 43].
- **Liveness Bitmaps:** Rather than capturing verbose execution logs or full stack traces, the agent maintains an in-memory thread-safe atomic liveness bitmap [cite: 42]. Each method is assigned a unique identifier index. When a method is called, its corresponding bit is flipped to `1`.
- **Periodic Streaming:** At regular intervals (e.g., every 60 seconds), a background thread scans the bitmap, extracts the executed method signatures, resets the bitmap, and streams the invocation telemetry to the platform collector [cite: 41].

Aggregating Runtime Signals

To turn raw telemetry streams into an actionable dead code signal, the platform runs an Aggregator Engine:

1. **Deduplication:** Telemetry events from multiple container replicas are normalized and grouped by container image version and commit SHA [cite: 41, 45].
2. **Temporal Persistence:** Telemetry records are stored in high-performance timeseries indices, recording the exact timestamp of the last execution of each method signature [cite: 41].
3. **Active/Dead Carving:** By comparing these execution timestamps against the global static call graph, the system highlights nodes that are statically reachable but have zero executions in production over the tracking window (e.g., 90 days), indicating candidate dead code [cite: 21, 22].

---

8. Property Schema of the Unified Dependency Graph (UDG)

At the core of the platform is the Unified Dependency Graph (UDG), a directed property graph that models the complete structural, configuration, and runtime state of the enterprise code estate.

```
+-------------------------------------------------------------------------+
|                  UNIFIED DEPENDENCY GRAPH ENTITY RELATION               |
+-------------------------------------------------------------------------+
|                                                                         |
|  [ Artifact Node ]                                                      |
|         |                                                               |
|         +-- (Deploys) --> [ Repository Node ]                           |
|                                 |                                       |
|                                 +-- (Contains) --> [ File Node ]        |
|                                                         |               |
|                                                         +--> [ Symbol ] |
|                                                                         |
|  [ Route Node ] <------- (Routes To) ----------------------------------+ |
|                                                                         |
+-------------------------------------------------------------------------+
```

Unified Property Graph Schema

The UDG models relationship attributes and metrics directly on nodes and edges, supporting fine-grained querying.

1. Node Schemas

- **Artifact Node:**
    - `id`: Canonical URI (e.g., `docker://gcr.io/enterprise/auth-service:1.4.2`) [cite: 8, 49].
    - `type`: `Container`, `NpmPackage`, `MavenJar`, `GoBinary` [cite: 8, 48].
    - `version`: SemVer string or Git commit SHA [cite: 45].
    - `environment`: `production`, `staging` [cite: 41].
- **Repository Node:**
    - `id`: Canonical Git clone URL (e.g., `git@github.com:enterprise/auth-service.git`) [cite: 45].
    - `bus_factor`: Numeric calculated indicator [cite: 8, 27].
    - `owner_team`: Identity reference from the enterprise directory [cite: 7, 27].
- **File Node:**
    - `path`: Relative repository file path (e.g., `src/auth/validator.ts`) [cite: 20].
    - `language`: Language identifier (e.g., `typescript`, `go`, `java`) [cite: 7, 41].
- **Symbol Node:**
    - `id`: SCIP symbol ID (e.g., `scip-go npm @enterprise/auth 1.4.2 Validator#validate()`) [cite: 56, 64].
    - `kind`: `Class`, `Method`, `Interface`, `Function`, `Variable` [cite: 56].
    - `range`: Array of line/column source coordinates `[start_line, start_col, end_line, end_col]` [cite: 56].
- **Route Node:**
    - `id`: API pattern identifier (e.g., `rest://POST/api/v1/auth/login`) [cite: 38].
    - `protocol`: `REST`, `gRPC`, `GraphQL`, `KafkaTopic`, `NatsSubject` [cite: 8].
    - `schema`: Reference to registered Protobuf, Avro, or JSON payload spec [cite: 8].

2. Edge Schemas

- **CONTAINS:** Connects `Repository -> File` or `File -> Symbol`.
    - `type`: Structural.
- **IMPORTS:** Connects `File -> File`.
    - `type`: Static syntax import.
- **CALLS:** Connects `Symbol -> Symbol`.
    - `type`: Static method call dependency [cite: 57, 58].
    - `precision`: `RTA`, `Andersen`, `Dynamic` [cite: 58].
- **ROUTES_TO:** Connects `Route -> Symbol`.
    - `type`: API-to-Controller entry binding [cite: 38].
- **DEPLOYS:** Connects `Artifact -> Repository`.
    - `type`: Infrastructure deployment path [cite: 8, 49].
- **EXECUTES:** Connects `Dynamic Agent -> Symbol`.
    - `last_triggered`: Millisecond epoch timestamp of the last runtime execution hit [cite: 41].
    - `frequency_30d`: Numeric execution count over a trailing 30-day window [cite: 59].

Traversal and Query Strategies

The platform runs structural graph algorithms on the UDG to identify dead code candidates and map change impact:

1. Strongly Connected Components (SCC) and Tarjan's Algorithm

Tightly coupled classes often call each other recursively (e.g., Class A imports Class B, which imports Class A) [cite: 24]. Traditional static linters struggle to flag these cycles, as each class appears to have active callers.

The platform runs Tarjan’s algorithm on the UDG to group symbols into Strongly Connected Components (SCCs) [cite: 9]. If an isolated SCC has zero incoming edges from any external entry points, the entire block of classes is flagged for removal in a single operation [cite: 9].

2. Transitive Downstream Blast-Radius Analysis (BFS)

Before proposing the deletion of any symbol, the platform runs a Breadth-First Search (BFS) to identify the downstream impact [cite: 9, 45]:

Blast Radius(u)={v∈V∣u∗![](data:image/svg+xml;utf8,<svg%20xmlns="http://www.w3.org/2000/svg"%20width="400em"%20height="0.522em"%20viewBox="0%200%20400000%20522"%20preserveAspectRatio="xMaxYMin%20slice"><path%20d="M0%20241v40h399891c-47.3%2035.3-84%2078-110%20128%0A-16.7%2032-27.7%2063.7-33%2095%200%201.3-.2%202.7-.5%204-.3%201.3-.5%202.3-.5%203%200%207.3%206.7%2011%2020%0A%2011%208%200%2013.2-.8%2015.5-2.5%202.3-1.7%204.2-5.5%205.5-11.5%202-13.3%205.7-27%2011-41%2014.7-44.7%0A%2039-84.5%2073-119.5s73.7-60.2%20119-75.5c6-2%209-5.7%209-11s-3-9-9-11c-45.3-15.3-85%0A-40.5-119-75.5s-58.3-74.8-73-119.5c-4.7-14-8.3-27.3-11-40-1.3-6.7-3.2-10.8-5.5%0A-12.5-2.3-1.7-7.5-2.5-15.5-2.5-14%200-21%203.7-21%2011%200%202%202%2010.3%206%2025%2020.7%2083.3%2067%0A%20151.7%20139%20205zm0%200v40h399900v-40z"></path></svg>)​v}

This traversal maps every transitive consumer dependency across the entire system [cite: 9, 45].

If a symbol targeted for deletion is found to have active incoming call edges from production-active repositories, the system halts automated removal and alerts code owners [cite: 9, 45].

3. Graph Query Language (Cypher Pattern)

The platform uses Cypher pattern queries to identify candidate dead API endpoints and orphaned controller classes:

```
MATCH (route:Route)
WHERE NOT (route)<-[:ROUTES_TO]-(:Artifact {environment: "production"})
MATCH (route)-[:ROUTES_TO]->(controller:Symbol)
OPTIONAL MATCH (controller)-[:CALLS*1..]->(handler:Symbol)
RETURN route.id, controller.id, collect(handler.id)
```

This query identifies all API controller endpoints that are not bound to any container active in production, tracing the orphaned handlers that can be safely removed.

---

9. Scalability, Parallelism, and Distributed Architecture

Analyzing millions of lines of code across thousands of microservices requires a highly scalable, distributed platform design [cite: 9]. The system is built around an asynchronous, event-driven processing model to handle enterprise-scale workloads without impacting developer velocity.

```
+-------------------------------------------------------------------------+
|                  DISTRIBUTED SCANNING PIPELINE                          |
+-------------------------------------------------------------------------+
|                                                                         |
|  GitHub / GitLab PR Event (Webhook)                                     |
|         |                                                               |
|         v                                                               |
|  [ Ingestion Controller ]                                               |
|         |                                                               |
|         +--> Enqueues task to RabbitMQ [114]                            |
|         |                                                               |
|         v                                                               |
|  [ Distributed Worker Pools ] (Shallow clones files [37, 81])           |
|         |                                                               |
|         +--> Compiles AST [56] & Emits local SCIP delta [65, 77]         |
|         |                                                               |
|         v                                                               |
|  [ Global Adjacency Database ] (Surgically patches graph index [65])    |
|                                                                         |
+-------------------------------------------------------------------------+
```

Incremental Scaling with O(changes) Complexity

Traditional static code analysis engines scale with O(N) complexity, where N represents the total size of the codebase [cite: 50]. This approach is unsustainable for massive codebases, as a minor edit can trigger hours of re-indexing [cite: 50].

The platform’s processing pipeline achieves O(C) complexity, where C represents the set of changed files in a pull request [cite: 50, 64, 65]:

1. **VCS Webhooks:** The platform intercepts commit events via VCS webhooks [cite: 27, 45, 49, 71].
2. **Shallow File Clones:** Workers clone only the changed files from a branch, avoiding the overhead of downloading full Git histories [cite: 49].
3. **SCIP Delta Indexing:** Language-specific indexers compile SCIP snapshots for the changed files in isolation [cite: 52, 64, 65].
4. **Surgical Graph Patching:** The central coordinator reads the file-level SCIP deltas, removes old edges linked to the modified files, and inserts the new parsed edges into the global graph database, updating the index in constant time [cite: 64, 65].

Distributed Task Distribution and Worker Partitioning

The platform partitions scanning workloads using a distributed task architecture:

- **Broker Middleware:** Tasks are managed using a reliable broker like RabbitMQ or Redis [cite: 13, 25].
- **Worker Groups:** Indexing jobs are routed to target worker groups optimized for specific language parsing tasks (e.g., Rust-based workers for Oxc/TypeScript parsing, Go-based workers for Protobuf/Go parsing) [cite: 20, 52].
- **Caching Strategy:** Workers cache compilation stubs and intermediate manifests locally, avoiding the overhead of fetching external package registries on every run.

Target Performance SLA Thresholds

To prevent pipeline bottlenecks, the platform implements a tiered performance strategy:

- **Pre-commit hook:** A localized CLI validates file changes locally in less than 2 seconds [cite: 17, 30].
- **Pull Request Gate:** The platform computes cross-repository reference analysis and displays downstream blast-radius metrics in less than 90 seconds [cite: 8, 27, 45].
- **Estate-Wide Evaluation:** A complete system traversal and dynamic carving overlay runs asynchronously once a week to calculate global centrality metrics and generate automated cleanup pull requests [cite: 9, 16].

---

10. False Positive Mitigation Strategies

The primary challenge for any automated code removal system is preventing false positives [cite: 10, 11, 23]. Flagging dynamically invoked code as dead can lead to compilation failures or runtime regressions [cite: 7, 11]. The platform implements layered mitigation strategies to address these edge cases:

Framework Conventions and Annotations

Modern frameworks rely on dynamic registration patterns [cite: 4, 9, 11]. The platform uses framework-specific rules to identify these entry points:

- **Dependency Injection Container Scans:** The platform parses annotations (such as Spring’s `@Component`, NestJS’s `@Injectable()`, or Go's Wire binding declarations) to identify active DI-managed classes, marking them as live.
- **Public API Export Mapping:** Symbols registered in public export structures (such as NPM `package.json` exports or Go package-level APIs) are flagged to prevent automated deletion unless it can be verified that no consuming applications register a dependency on that parent library [cite: 1, 20, 49].
- **Test-Suite Awareness:** Test helpers and mock directories are parsed as valid test-suite entry points [cite: 10, 24, 25]. Public symbols called within tests are marked as "test-active" rather than "production-active" [cite: 10]. This classification allows the platform to safely identify symbols that are only used in tests and are dead in production workflows [cite: 10].

Code Reflection Hooks

To prevent false-positive flags on code called dynamically via reflection or string parsing, the platform implements dynamic reflection hooks [cite: 9, 72]:

- **Identifier Tracking:** If a dynamic pattern such as Java's `Class.forName()`, Python's `getattr()`, or JavaScript's runtime index lookup `obj[key]` is detected on an object, the platform flags the target class [cite: 9, 20, 26].
- **String Constant Matching:** The platform scans string constants in the file to identify text matches with the target class's method names [cite: 9].
- **Safe Suppressions:** If a method name matches a string constant in a file containing reflection calls, the method is marked as "potentially dynamic" and excluded from automated removal [cite: 9].

```
+-------------------------------------------------------------------------+
|                  DYNAMIC RUNTIME FALLBACK INTERCEPT                     |
+-------------------------------------------------------------------------+
|                                                                         |
|  [ Compiled Source File ]                                               |
|         |                                                               |
|         +-- (Method deleted but called dynamically) --> [ Runtime Stub ]|
|                                                                |        |
|                                                                v        |
|                                                      [ Alert Platform ] |
|                                                                |        |
|                                                                v        |
|                                                      [ Dynamic Import ] |
|                                                                |        |
|                                                                v        |
|                                                      [ Resume Execution]|
|                                                                         |
+-------------------------------------------------------------------------+
```

Runtime Fallback Shields

For critical runtime environments, the platform avoids outright code deletion [cite: 72]. Instead, it uses a lazy-loading fallback shield during code cleanup [cite: 72]:

1. **Stub Injection:** The automated refactoring tool deletes the suspect method body and replaces it with a dynamic lazy-loader fallback stub [cite: 72].
2. **Runtime Interception:** If a false positive occurs and the method is executed, the stub catches the call, registers a dynamic import exception with the platform, and dynamically fetches the original method payload from an enterprise fallback registry [cite: 72].
3. **Execution Continuation:** The application compiles and executes the method body on the fly, preventing a production crash while alerting developers to adjust the platform's detection rules [cite: 72].

---

11. Multi-Dimensional Confidence Scoring Engine

To determine if a symbol is truly dead and safe to remove, the platform executes a multi-dimensional confidence engine. The engine calculates a mathematical confidence score CS(u) for every node u in the UDG, combining inputs from static, structural, dynamic, and historical telemetry layers.

Mathematical Formulation

Let u be a symbol node in the Unified Dependency Graph. The confidence score CS(u)∈[0,1] represents the _confidence that symbol_ u _is dead and safe to remove_.

CS(u)=ϕ(u)×[α(1−S(u))+β(1−R(u))+γ(1−C(u))+δ(1−I(u))+θH(u)]

Where:

- ϕ(u)∈{0,1} is a binary safety gate. ϕ(u)=0 if u contains explicit preservation attributes (e.g., JSDoc `@public`, custom `@keep` annotations, or is listed in dynamic configuration glob rules), forcing CS(u)=0 (the symbol must be kept) [cite: 10, 25].
- S(u)∈[0,1] is the **Static Reachability Index**, representing the normalized topological distance from the nearest system entry point in the static call graph [cite: 57, 58]. If a symbol has direct static paths from main runtime entry points, S(u)→1. If it is isolated, S(u)=0.
- R(u)∈[0,1] is the **Dynamic Runtime Utilization Metric**, representing the frequency and recency of method execution events captured via bytecode profiling or tracing over an observation window T (e.g., 90 days) [cite: 21, 41, 67]. It decays exponentially based on elapsed time since the last recorded execution:

R(u)=e−λ(T−tlast​(u))

If the method has never been called, R(u)=0 [cite: 21, 41].

- C(u)∈[0,1] is the **Cross-Repository Consumption Metric**, measuring incoming reference edges from external repositories in the global SCIP index [cite: 56]. If u is heavily imported by external projects, C(u)→1.
- I(u)∈{0,1} is the **Infrastructure Binding Indicator**. I(u)=1 if the symbol's compiled container, binary, or entry point is referenced in any active IaC template, configuration manifest, or API route [cite: 8, 48, 49].
- H(u)∈[0,1] is the **Historical Inactivity Index**. This reflects the age and Git commit history of the file containing u [cite: 27]. If a file has not been touched in a year and has high code complexity and churn metrics, it represents a stable legacy codebase, indicating that a lack of dynamic execution is highly indicative of true dead code [cite: 27, 31].
- α,β,γ,δ,θ are normalized configuration weights such that:

α+β+γ+δ+θ=1

Typical enterprise defaults are: β=0.40 (dynamic execution), α=0.20 (static reachability), γ=0.20 (cross-repo), δ=0.10 (infrastructure alignment), and θ=0.10 (history).

Confidence Levels and Actions

Based on the derived CS(u) score, the platform categorizes symbols into distinct confidence levels and executes corresponding remediation paths:

|Confidence Range|Classification|Safety Description|Actionable Strategy|
|---|---|---|---|
|0.90≤CS(u)≤1.00|**Proven Dead**|Zero static call paths, zero dynamic execution records, and no active infrastructure references over 90+ days [cite: 3, 21, 22].|**Auto-Delete:** Trigger automated codemods, delete the symbol, and open an automated pull request [cite: 9].|
|0.70≤CS(u)<0.90|**High Confidence**|Unused in production, but defined in a public export path or internal package layout [cite: 4, 10, 11].|**Trigger Review:** Open a pull request requesting manual engineering validation, tagging code owners [cite: 9, 27].|
|0.40≤CS(u)<0.70|**Suspicious**|No recent production execution, but static analysis detects a dynamic framework or reflection fallback pattern [cite: 7, 9].|**Activate Telemetry:** Inject focused logging tracers to capture edge execution pathways [cite: 21].|
|0.00≤CS(u)<0.40|**Live**|Statically reachable or dynamically active in production traces [cite: 21, 22].|**Keep:** Maintain code pathways; suppress dead code alerts.|

---

12. Recommended Target Architecture

This section details today's best engineering architecture for an enterprise-grade dead code detection and safe code removal platform.

```
+-------------------------------------------------------------------------------------------------------------------------+
|                                              ENTERPRISE CENTRAL COORDINATOR                                             |
+-------------------------------------------------------------------------------------------------------------------------+
|                                                                                                                         |
|    [ VCS Hook Ingest Controller ] ---> Queue Broker (RabbitMQ) ---> [ Worker Pool (Oxc/Tree-Sitter SCIP Indexers) ]     |
|                                                                                           |                             |
|                                                                                           v                             |
|    [ Telemetry Router (OTel / ASM Agents) ] ---> Dynamic Timeseries DB                    |                             |
|                                                        |                                  v                             |
|                                                        +-------> [ CENTRAL UDG GRAPH DATABASE ] <------- [ IaC Engine ] |
|                                                                             |                                           |
|                                                                             v                                           |
|                                                                 [ COGNITIVE SCORING ENGINE ]                            |
|                                                                             |                                           |
|                                                                             v                                           |
|                                                                 [ AUTOMATED CODEMOD ENGINE ]                            |
|                                                                             |                                           |
|                                                                             v                                           |
|                                                                 [ Automated Pull Request ]                              |
|                                                                                                                         |
+-------------------------------------------------------------------------------------------------------------------------+
```

Component Architecture

1. Ingestion Control and Processing Queue

The entry point of the platform is an asynchronous webhook controller that integrates with enterprise VCS systems (GitHub Enterprise / GitLab) [cite: 27, 45, 49, 71]. It parses commit changes, filter patterns, and schedules tasks to a partitioned queuing system managed by RabbitMQ [cite: 13].

2. Local Language Parsers and SCIP Indexers

Lightweight, containerized workers fetch target codebase changes using shallow clones [cite: 49]. Workers process files in parallel using Rust-based Oxc and tree-sitter frontends, producing localized SCIP indexes that map definitions, references, and ranges [cite: 20, 27, 56].

3. Infrastructure Manifest and IaC Engine

An infrastructure parsing pipeline maps deployment, containerization, and networking rules [cite: 8, 49]. It parses Helm templates, Terraform module variables, and ingress route rules to generate UDG dependency mappings [cite: 8, 15, 49].

4. Central Graph Store and Unified Indexer

- **Primary Relational Store:** PostgreSQL is selected as the primary relational index registry, paired with Redis for dynamic telemetry caching [cite: 25, 41].
- **Graph Engine:** Neo4j or AWS Neptune is integrated as the dedicated graph engine to store UDG nodes and edges, running structural traversals and centrality calculations [cite: 7, 8, 29].

5. Dynamic Runtime Telemetry Router

The collector engine interfaces with production infrastructure to aggregate telemetry [cite: 41, 68]:

- **Distributed Tracing Spans:** Captures OpenTelemetry endpoints and API route executions [cite: 67, 68].
- **Bytecode Profiling Agents:** JVM and Python runtime profiling agents stream method liveness bitmaps, indicating actual method utilization over time [cite: 41, 43].

6. Cognitive Scoring and Code Actions Engine

Once the weekly estate-wide evaluation triggers, this engine calculates confidence scores CS(u) across all symbols in the graph.

Symbols scoring above 0.90 are sent to the Automated Codemod Engine, which uses AST-rewrite libraries to safely strip the dead code, replace methods with lazy runtime fallback stubs, compile change commits, and open pull requests for team validation [cite: 9, 72].

Structural Trade-offs and Architectural Rationalization

Designing a production-grade enterprise platform requires balancing key system-level trade-offs:

1. Graph Storage: Hybrid (PostgreSQL + Neo4j) vs. Pure Graph DB

- **Trade-off:** Graph databases are optimized for deep traversals but suffer from slower attribute writes and lack rich relational schemas [cite: 8].
- **Justification:** The platform selects a hybrid model. PostgreSQL stores symbol tables and metadata attributes due to its indexing performance and transactional ACID guarantees [cite: 41, 65]. Adjacency records are compiled into a graph cached in Neo4j to execute traversal and centrality calculations, balancing storage efficiency with query speed [cite: 8, 65].

2. Instrumentation: Bytecode Modification vs. OpenTelemetry Tracing

- **Trade-off:** Bytecode modification traces execution down to individual methods but introduces runtime overhead [cite: 22, 43]. OpenTelemetry tracing is highly scalable but operates primarily at network and route boundaries [cite: 19, 67, 68].
- **Justification:** The platform combines both approaches [cite: 21, 22]. Bytecode modification is used on internal, business-critical systems to trace method execution [cite: 41, 43]. For distributed, cloud-native services, OpenTelemetry traces API and route boundaries, mapping endpoint utilization without introducing runtime overhead [cite: 67, 68].

3. Parsing Strategy: Tree-Sitter vs. Language Compiler APIs

- **Trade-off:** Compiler APIs provide type checking and symbol resolution but are slow and resource-intensive [cite: 11, 73]. Tree-sitter is exceptionally fast but lacks native type-checking [cite: 27].
- **Justification:** The system uses tree-sitter for rapid initial structural index generation across multi-language codebases [cite: 7, 27]. For high-precision languages (such as TypeScript or C++), the platform uses compiler-grade indexers (e.g., `scip-typescript` or `scip-clang`) during CI gates to generate type-accurate SCIP indices, balancing indexing speed with symbol precision [cite: 52, 73].

---

13. Phased Strategic Execution Roadmap

Deploying an enterprise-grade platform across an entire corporate engineering estate must be executed in progressive, value-driven phases [cite: 33]. This ensures that teams build confidence in the system’s checks and establish appropriate guardrails before activating automated, wide-scale deletions [cite: 10, 11].

```
+---------------------------------------------------------------------------------------------------+
|  PHASE 1: Workspace Static Baselines                                                              |
|  - Set up Knip / Vulture in individual monorepos and microservice codebases [1, 6].                |
|  - Enforce static analysis of unused files, local exports, and dead dependencies in CI [6, 11].   |
+---------------------------------------------------------------------------------------------------+
                                                 |
                                                 v
+---------------------------------------------------------------------------------------------------+
|  PHASE 2: Semantic Indexing and Cross-Repo Lookup                                                |
|  - Introduce SCIP indexers inside PR workflows to compile symbolic structural maps [63, 74].      |
|  - Build the Multi-Repository Resolver to handle references across private package boundaries [63].|
+---------------------------------------------------------------------------------------------------+
                                                 |
                                                 v
+---------------------------------------------------------------------------------------------------+
|  PHASE 3: Infrastructure and Manifest Synthesis                                                   |
|  - Incorporate Riftmap-style parsing for Terraform modules, Dockerfiles, and Helm templates [35, 37].|
|  - Map IaC triggers and API gateway configurations directly to codebase controllers [29, 35].     |
+---------------------------------------------------------------------------------------------------+
                                                 |
                                                 v
+---------------------------------------------------------------------------------------------------+
|  PHASE 4: Production Runtime Telemetry Integration                                                |
|  - Deploy lightweight JVM and Python bytecode profiling agents inside staging/production [25, 46]. |
|  - Map real-time method invocations and compile empirical distributed tracing service maps [104].  |
+---------------------------------------------------------------------------------------------------+
                                                 |
                                                 v
+---------------------------------------------------------------------------------------------------+
|  PHASE 5: Unified Confidence Scoring and CI gates                                                 |
|  - Activate the multi-dimensional CS(u) calculation, combining static, dynamic, & historical data.|
|  - Enforce PR-bot gates to block merging changes that introduce high-risk dependency drifts [2].  |
+---------------------------------------------------------------------------------------------------+
                                                 |
                                                 v
+---------------------------------------------------------------------------------------------------+
|  PHASE 6: Automated Deletion and Fallback Guardrails                                              |
|  - Trigger automated codemod deletions for components with proven dead scores (CS(u) >= 0.90) [93].|
|  - Wrap automated deletions with dynamic lazy-loading runtime stubs for safety [88].              |
+---------------------------------------------------------------------------------------------------+
```

Architectural Justifications for Sequencing

The strategic sequencing of the roadmap is designed to minimize risk and establish confidence across development teams:

- **Static Before Dynamic:** Setting up local static baselines (Phase 1) and semantic indexing (Phase 2) requires no dynamic runtime access or infrastructure modifications [cite: 23, 56]. This allows the platform to generate immediate value by identifying unused files and exports within isolated workspaces [cite: 4, 10, 11].
- **Infrastructure Before Profiling:** Parsing IaC configs (Phase 3) is a low-risk, static operation that maps service entry points [cite: 8, 49]. This validation ensures that the system understands the macro-topology of deployments before deploying dynamic profiling agents [cite: 21].
- **Telemetry Aggregation Window:** Profiling agents (Phase 4) are deployed but restricted to data collection for a 30-to-60-day stabilization window [cite: 21]. This measurement period ensures that infrequent or seasonal code paths (e.g., quarterly accounting tasks or annual tax operations) are captured, minimizing false positives [cite: 23, 42].
- **Incremental Scoring to Automated Codemod:** Transitioning from passive confidence scoring (Phase 5) to automated deletion (Phase 6) occurs only after the scoring thresholds have stabilized and safety-net runtime stubs are active, ensuring safe code removal without organizational friction [cite: 9, 72].

---

1. Finding unused and ghost dependencies with Knip - LogRocket Blog, [https://blog.logrocket.com/finding-unused-and-ghost-dependencies-with-knip/](https://www.google.com/url?sa=E&q=https%3A%2F%2Fblog.logrocket.com%2Ffinding-unused-and-ghost-dependencies-with-knip%2F)
2. Guide to Dead Code Identification and Removal 2026 | Penser, [https://pensero.ai/blog/dead-code](https://www.google.com/url?sa=E&q=https%3A%2F%2Fpensero.ai%2Fblog%2Fdead-code)
3. Sensenmann: Code Deletion at Scale - Google Testing Blog, [https://testing.googleblog.com/2023/04/sensenmann-code-deletion-at-scale.html](https://www.google.com/url?sa=E&q=https%3A%2F%2Ftesting.googleblog.com%2F2023%2F04%2Fsensenmann-code-deletion-at-scale.html)
4. Using Knip to find dead code in a high-traffic git repo | Programming, [https://madelinemiller.dev/blog/knip-dead-code/](https://www.google.com/url?sa=E&q=https%3A%2F%2Fmadelinemiller.dev%2Fblog%2Fknip-dead-code%2F)
5. A Multi-Study Investigation Into Dead Code - W&M Computer Science, [https://www.cs.wm.edu/~denys/pubs/TSE%2718-DeadCode.pdf](https://www.google.com/url?sa=E&q=https%3A%2F%2Fwww.cs.wm.edu%2F~denys%2Fpubs%2FTSE%252718-DeadCode.pdf)
6. ericrkuo/DeadCodeRemover: A static program analysis tool to remove dead code - GitHub, [https://github.com/ericrkuo/DeadCodeRemover](https://www.google.com/url?sa=E&q=https%3A%2F%2Fgithub.com%2Fericrkuo%2FDeadCodeRemover)
7. Best Dead Code Detection Tools (Open Source and Commercial), [https://repowise.dev/blog/comparisons/best-dead-code-detection-tools](https://www.google.com/url?sa=E&q=https%3A%2F%2Frepowise.dev%2Fblog%2Fcomparisons%2Fbest-dead-code-detection-tools)
8. Riftmap — Know what breaks before you break it, [https://riftmap.dev/](https://www.google.com/url?sa=E&q=https%3A%2F%2Friftmap.dev%2F)
9. Automating dead code cleanup - Engineering at Meta - Facebook, [https://engineering.fb.com/2023/10/24/data-infrastructure/automating-dead-code-cleanup/](https://www.google.com/url?sa=E&q=https%3A%2F%2Fengineering.fb.com%2F2023%2F10%2F24%2Fdata-infrastructure%2Fautomating-dead-code-cleanup%2F)
10. Efficiently cleaning a TypeScript project: Knip + AI agent workflow | 56kode, [https://www.56kode.com/posts/clean-typescript-project-knip-ai-workflow/](https://www.google.com/url?sa=E&q=https%3A%2F%2Fwww.56kode.com%2Fposts%2Fclean-typescript-project-knip-ai-workflow%2F)
11. Removing Unused Files and Dependencies with Knip - OpenReplay Blog, [https://blog.openreplay.com/remove-unused-files-dependencies-knip/](https://www.google.com/url?sa=E&q=https%3A%2F%2Fblog.openreplay.com%2Fremove-unused-files-dependencies-knip%2F)
12. Comparison & Migration | Knip, [https://knip.dev/explanations/comparison-and-migration](https://www.google.com/url?sa=E&q=https%3A%2F%2Fknip.dev%2Fexplanations%2Fcomparison-and-migration)
13. Package Firewall - Endor Labs, [https://www.endorlabs.com/package-firewall](https://www.google.com/url?sa=E&q=https%3A%2F%2Fwww.endorlabs.com%2Fpackage-firewall)
14. How to detect dead code in a frontend project - LogRocket Blog, [https://blog.logrocket.com/how-detect-dead-code-frontend-project/](https://www.google.com/url?sa=E&q=https%3A%2F%2Fblog.logrocket.com%2Fhow-detect-dead-code-frontend-project%2F)
15. Symbol graphs and artifact graphs: why Sourcegraph stops where infrastructure starts, [https://riftmap.dev/blog/symbol-graphs-and-artifact-graphs/](https://www.google.com/url?sa=E&q=https%3A%2F%2Friftmap.dev%2Fblog%2Fsymbol-graphs-and-artifact-graphs%2F)
16. Dead Code Detection: Your Codebase Has More Than You Think - FlagShark, [https://flagshark.com/blog/dead-code-detection-codebase-more-than-you-think/](https://www.google.com/url?sa=E&q=https%3A%2F%2Fflagshark.com%2Fblog%2Fdead-code-detection-codebase-more-than-you-think%2F)
17. I Built an AI-Powered Dead Code Detector for VS Code - DEV Community, [https://dev.to/naimulkarim/i-built-an-ai-powered-dead-code-detector-for-vs-code-and-it-goes-way-beyond-unused-imports-50dc](https://www.google.com/url?sa=E&q=https%3A%2F%2Fdev.to%2Fnaimulkarim%2Fi-built-an-ai-powered-dead-code-detector-for-vs-code-and-it-goes-way-beyond-unused-imports-50dc)
18. AI coding agents need cross-repo context. The teams running them at scale are already building it themselves. | Riftmap Blog, [https://riftmap.dev/blog/ai-coding-agents-need-cross-repo-context/](https://www.google.com/url?sa=E&q=https%3A%2F%2Friftmap.dev%2Fblog%2Fai-coding-agents-need-cross-repo-context%2F)
19. Distributed Tracing: Tutorial & Best Practices - Multiplayer.app, [https://www.multiplayer.app/observability-framework/distributed-tracing/](https://www.google.com/url?sa=E&q=https%3A%2F%2Fwww.multiplayer.app%2Fobservability-framework%2Fdistributed-tracing%2F)
20. Dead code analysis - fallow: codebase intelligence for TypeScript and JavaScript, [https://fallow.mintlify.app/analysis/dead-code](https://www.google.com/url?sa=E&q=https%3A%2F%2Ffallow.mintlify.app%2Fanalysis%2Fdead-code)
21. What Architects Should Know about Zombie Code - vFunction, [https://vfunction.com/blog/what-architects-should-know-about-zombie-code/](https://www.google.com/url?sa=E&q=https%3A%2F%2Fvfunction.com%2Fblog%2Fwhat-architects-should-know-about-zombie-code%2F)
22. Exposing dead code: strategies for detection and elimination - vFunction, [https://vfunction.com/blog/dead-code/](https://www.google.com/url?sa=E&q=https%3A%2F%2Fvfunction.com%2Fblog%2Fdead-code%2F)
23. Static Code Analysis: The Complete Guide to Getting Started with SCA - Splunk, [https://www.splunk.com/en_us/blog/learn/static-code-analysis.html](https://www.google.com/url?sa=E&q=https%3A%2F%2Fwww.splunk.com%2Fen_us%2Fblog%2Flearn%2Fstatic-code-analysis.html)
24. Recommendation Update: ✂️ Use knip to detect dead code and types - Effective TypeScript, [https://effectivetypescript.com/2023/07/29/knip/](https://www.google.com/url?sa=E&q=https%3A%2F%2Feffectivetypescript.com%2F2023%2F07%2F29%2Fknip%2F)
25. Knip - Unused Code Detection - Shopsys Platform Docs, [https://docs.shopsys.com/en/19.0/storefront/knip/](https://www.google.com/url?sa=E&q=https%3A%2F%2Fdocs.shopsys.com%2Fen%2F19.0%2Fstorefront%2Fknip%2F)
26. Vulture, the scavenger of dead Python code. | Devsprint 2019 - PyCon India 2025, [https://in.pycon.org/cfp/devsprint-2019/proposals/vulture-the-scavenger-of-dead-python-code~bDy5d/](https://www.google.com/url?sa=E&q=https%3A%2F%2Fin.pycon.org%2Fcfp%2Fdevsprint-2019%2Fproposals%2Fvulture-the-scavenger-of-dead-python-code~bDy5d%2F)
27. repowise — codebase intelligence that compounds AI velocity, [https://repowise.dev/](https://www.google.com/url?sa=E&q=https%3A%2F%2Frepowise.dev%2F)
28. Built a CLI that indexes codebases dependency graphs, dead code, git intelligence, wiki generation : r/ClaudeAI - Reddit, [https://www.reddit.com/r/ClaudeAI/comments/1sadkqu/built_a_cli_that_indexes_codebases_dependency/](https://www.google.com/url?sa=E&q=https%3A%2F%2Fwww.reddit.com%2Fr%2FClaudeAI%2Fcomments%2F1sadkqu%2Fbuilt_a_cli_that_indexes_codebases_dependency%2F)
29. How to Build Repository-Level Code Intelligence with Repowise Using Graph Analysis, Dead-Code Detection, Decisions, and AI Context - MarkTechPost, [https://www.marktechpost.com/2026/05/15/how-to-build-repository-level-code-intelligence-with-repowise-using-graph-analysis-dead-code-detection-decisions-and-ai-context/](https://www.google.com/url?sa=E&q=https%3A%2F%2Fwww.marktechpost.com%2F2026%2F05%2F15%2Fhow-to-build-repository-level-code-intelligence-with-repowise-using-graph-analysis-dead-code-detection-decisions-and-ai-context%2F)
30. Your vibe coded repo is rotting. I built an open source MCP to show Claude Code exactly where : r/vibecoding - Reddit, [https://www.reddit.com/r/vibecoding/comments/1tgvood/your_vibe_coded_repo_is_rotting_i_built_an_open/](https://www.google.com/url?sa=E&q=https%3A%2F%2Fwww.reddit.com%2Fr%2Fvibecoding%2Fcomments%2F1tgvood%2Fyour_vibe_coded_repo_is_rotting_i_built_an_open%2F)
31. repowise vs Sourcegraph: Documentation + Intelligence, Not Just Search, [https://www.repowise.dev/blog/comparisons/repowise-vs-sourcegraph](https://www.google.com/url?sa=E&q=https%3A%2F%2Fwww.repowise.dev%2Fblog%2Fcomparisons%2Frepowise-vs-sourcegraph)
32. 3238 – vFunction Architectural Modernization Platform - CODiE Awards -, [https://codie.secure-platform.com/site/gallery/rounds/13/details/6281](https://www.google.com/url?sa=E&q=https%3A%2F%2Fcodie.secure-platform.com%2Fsite%2Fgallery%2Frounds%2F13%2Fdetails%2F6281)
33. The next phase of architectural modernization: Agents - vFunction, [https://vfunction.com/blog/architectural-modernization-agents-2026/](https://www.google.com/url?sa=E&q=https%3A%2F%2Fvfunction.com%2Fblog%2Farchitectural-modernization-agents-2026%2F)
34. vFunction Code Copy feature, [https://vfunction.com/platform/code-copy/](https://www.google.com/url?sa=E&q=https%3A%2F%2Fvfunction.com%2Fplatform%2Fcode-copy%2F)
35. Automating data removal - Engineering at Meta - Facebook, [https://engineering.fb.com/2023/10/31/data-infrastructure/automating-data-removal/](https://www.google.com/url?sa=E&q=https%3A%2F%2Fengineering.fb.com%2F2023%2F10%2F31%2Fdata-infrastructure%2Fautomating-data-removal%2F)
36. CodeAnt AI - CodeAnt AI, [https://docs.codeant.ai/](https://www.google.com/url?sa=E&q=https%3A%2F%2Fdocs.codeant.ai%2F)
37. CodeAnt-AI/skills - GitHub, [https://github.com/CodeAnt-AI/skills](https://www.google.com/url?sa=E&q=https%3A%2F%2Fgithub.com%2FCodeAnt-AI%2Fskills)
38. Rules - CodeAnt AI, [https://docs.codeant.ai/pull_request/customize/rules](https://www.google.com/url?sa=E&q=https%3A%2F%2Fdocs.codeant.ai%2Fpull_request%2Fcustomize%2Frules)
39. CodeAnt AI : AI Code Reviewer - Product Hunt, [https://www.producthunt.com/products/codeant-ai](https://www.google.com/url?sa=E&q=https%3A%2F%2Fwww.producthunt.com%2Fproducts%2Fcodeant-ai)
40. Should you use CodeAnt AI?. No. Please don't. | by Dicta P - Medium, [https://medium.com/@dicta.oblong.0p/should-you-use-codeant-ai-5a86de0b0f2e](https://www.google.com/url?sa=E&q=https%3A%2F%2Fmedium.com%2F%40dicta.oblong.0p%2Fshould-you-use-codeant-ai-5a86de0b0f2e)
41. GitHub - naver/scavenger: A runtime dead code analysis tool, [https://github.com/naver/scavenger](https://www.google.com/url?sa=E&q=https%3A%2F%2Fgithub.com%2Fnaver%2Fscavenger)
42. Software to find dead code during runtime in Java?, [https://softwarerecs.stackexchange.com/questions/90971/software-to-find-dead-code-during-runtime-in-java](https://www.google.com/url?sa=E&q=https%3A%2F%2Fsoftwarerecs.stackexchange.com%2Fquestions%2F90971%2Fsoftware-to-find-dead-code-during-runtime-in-java)
43. crispab/codekvast: Codekvast, the Truly Dead Code Detector · GitHub - GitHub, [https://github.com/crispab/codekvast](https://www.google.com/url?sa=E&q=https%3A%2F%2Fgithub.com%2Fcrispab%2Fcodekvast)
44. [SpringBoot] Scavenger 적용기 (데드코드 분석 툴) - DOTELOPER - 티스토리, [https://doteloper.tistory.com/109](https://www.google.com/url?sa=E&q=https%3A%2F%2Fdoteloper.tistory.com%2F109)
45. Riftmap for AI coding agents — the cross-repo graph as a tool call, [https://riftmap.dev/for-agents/](https://www.google.com/url?sa=E&q=https%3A%2F%2Friftmap.dev%2Ffor-agents%2F)
46. Gemnasium vs Riftmap — Know what breaks before you break it - StackShare, [https://stackshare.io/gemnasium/vs/riftmap-know-what-breaks-before-you-break-it](https://www.google.com/url?sa=E&q=https%3A%2F%2Fstackshare.io%2Fgemnasium%2Fvs%2Friftmap-know-what-breaks-before-you-break-it)
47. Declared, inferred, registered: the three ways a tool knows a cross-repo dependency exists | Riftmap Blog, [https://riftmap.dev/blog/declared-inferred-registered/](https://www.google.com/url?sa=E&q=https%3A%2F%2Friftmap.dev%2Fblog%2Fdeclared-inferred-registered%2F)
48. Artifact Dependency Graph: What It Is — and Isn't | Riftmap, [https://riftmap.dev/what-is-an-artifact-dependency-graph/](https://www.google.com/url?sa=E&q=https%3A%2F%2Friftmap.dev%2Fwhat-is-an-artifact-dependency-graph%2F)
49. Cross-Repo Dependency Mapping: What It Is & How It Works - Riftmap, [https://riftmap.dev/what-is-cross-repo-dependency-mapping/](https://www.google.com/url?sa=E&q=https%3A%2F%2Friftmap.dev%2Fwhat-is-cross-repo-dependency-mapping%2F)
50. Indexing code at scale with Glean - Engineering at Meta - Facebook, [https://engineering.fb.com/2024/12/19/developer-tools/glean-open-source-code-indexing/](https://www.google.com/url?sa=E&q=https%3A%2F%2Fengineering.fb.com%2F2024%2F12%2F19%2Fdeveloper-tools%2Fglean-open-source-code-indexing%2F)
51. Dead Code Removal at Meta: Automatically Deleting Millions of Lines of Code and Petabytes of Deprecated Data | Department of Computer Science and Technology, [https://www.cst.cam.ac.uk/seminars/list/209674](https://www.google.com/url?sa=E&q=https%3A%2F%2Fwww.cst.cam.ac.uk%2Fseminars%2Flist%2F209674)
52. Announcing scip-clang: a new SCIP indexer for C and C++ - Sourcegraph, [https://sourcegraph.com/blog/announcing-scip-clang](https://www.google.com/url?sa=E&q=https%3A%2F%2Fsourcegraph.com%2Fblog%2Fannouncing-scip-clang)
53. Static Analysis with MoonBit: From Simple Language Analysis to MCIL, [https://www.moonbitlang.com/blog/moonbit-static-analysis](https://www.google.com/url?sa=E&q=https%3A%2F%2Fwww.moonbitlang.com%2Fblog%2Fmoonbit-static-analysis)
54. Dead-code elimination - Wikipedia, [https://en.wikipedia.org/wiki/Dead-code_elimination](https://www.google.com/url?sa=E&q=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FDead-code_elimination)
55. SkipFlow: Improving the Precision of Points-to Analysis using Primitive Values and Predicate Edges - Oracle Labs, [https://labs.oracle.com/pls/apex/f?p=LABS:0:110663912262527:APPLICATION_PROCESS=GETDOC_INLINE:::DOC_ID:4573](https://www.google.com/url?sa=E&q=https%3A%2F%2Flabs.oracle.com%2Fpls%2Fapex%2Ff%3Fp%3DLABS%3A0%3A110663912262527%3AAPPLICATION_PROCESS%3DGETDOC_INLINE%3A%3A%3ADOC_ID%3A4573)
56. Cross-repository code navigation - Sourcegraph, [https://sourcegraph.com/blog/cross-repository-code-navigation](https://www.google.com/url?sa=E&q=https%3A%2F%2Fsourcegraph.com%2Fblog%2Fcross-repository-code-navigation)
57. Advanced analysis techniques | Moderne Docs, [https://docs.moderne.io/openrewrite-advanced-program-analysis/advanced-analysis-techniques/](https://www.google.com/url?sa=E&q=https%3A%2F%2Fdocs.moderne.io%2Fopenrewrite-advanced-program-analysis%2Fadvanced-analysis-techniques%2F)
58. Context-Sensitive Pointer Analysis for ArkTS - arXiv, [https://arxiv.org/html/2602.00457](https://www.google.com/url?sa=E&q=https%3A%2F%2Farxiv.org%2Fhtml%2F2602.00457)
59. Comparing Points-to Static Analysis with Runtime Recorded Profiling Data, [https://www.unibw.de/ucsrl/pubs/pppj14.pdf](https://www.google.com/url?sa=E&q=https%3A%2F%2Fwww.unibw.de%2Fucsrl%2Fpubs%2Fpppj14.pdf)
60. Points-to analysis for Java based on annotated constraints - Rutgers University, [https://scholarship.libraries.rutgers.edu/view/pdfCoverPage?instCode=01RUT_INST&filePid=13643493490004646&download=true](https://www.google.com/url?sa=E&q=https%3A%2F%2Fscholarship.libraries.rutgers.edu%2Fview%2FpdfCoverPage%3FinstCode%3D01RUT_INST%26filePid%3D13643493490004646%26download%3Dtrue)
61. A Literature Review - Pointer Analysis - CSE CGI Server, [https://cgi.cse.unsw.edu.au/~ysui/Researchfile/literature_review.pdf](https://www.google.com/url?sa=E&q=https%3A%2F%2Fcgi.cse.unsw.edu.au%2F~ysui%2FResearchfile%2Fliterature_review.pdf)
62. Compositional Pointer and Escape Analysis for Java Programs - ResearchGate, [https://www.researchgate.net/publication/2891110_Compositional_Pointer_and_Escape_Analysis_for_Java_Programs](https://www.google.com/url?sa=E&q=https%3A%2F%2Fwww.researchgate.net%2Fpublication%2F2891110_Compositional_Pointer_and_Escape_Analysis_for_Java_Programs)
63. 99 The Perfect Getaway: Using Escape Analysis in Embedded Real-Time Systems, [https://www4.cs.fau.de/~isa/a99-stilkerich.pdf](https://www.google.com/url?sa=E&q=https%3A%2F%2Fwww4.cs.fau.de%2F~isa%2Fa99-stilkerich.pdf)
64. SCIP - a better code indexing format than LSIF - Sourcegraph, [https://sourcegraph.com/blog/announcing-scip](https://www.google.com/url?sa=E&q=https%3A%2F%2Fsourcegraph.com%2Fblog%2Fannouncing-scip)
65. CKB — A code intelligence server written in Go (SCIP-based, 80+ query tools via MCP) : r/golang - Reddit, [https://www.reddit.com/r/golang/comments/1qkmug3/ckb_a_code_intelligence_server_written_in_go/](https://www.google.com/url?sa=E&q=https%3A%2F%2Fwww.reddit.com%2Fr%2Fgolang%2Fcomments%2F1qkmug3%2Fckb_a_code_intelligence_server_written_in_go%2F)
66. Feature Request: Cross-Repository Context for Copilot (Web ↔ Microservice) · community · Discussion #189213 - GitHub, [https://github.com/orgs/community/discussions/189213](https://www.google.com/url?sa=E&q=https%3A%2F%2Fgithub.com%2Forgs%2Fcommunity%2Fdiscussions%2F189213)
67. Distributed Tracing: From 100% Error Rate to Root Cause in 60 Seconds - DEV Community, [https://dev.to/uptrace/distributed-tracing-from-100-error-rate-to-root-cause-in-60-seconds-c56](https://www.google.com/url?sa=E&q=https%3A%2F%2Fdev.to%2Fuptrace%2Fdistributed-tracing-from-100-error-rate-to-root-cause-in-60-seconds-c56)
68. Implementing distributed tracing - Splunk Lantern, [https://lantern.splunk.com/Observability_Use_Cases/Optimize_Costs/Implementing_distributed_tracing](https://www.google.com/url?sa=E&q=https%3A%2F%2Flantern.splunk.com%2FObservability_Use_Cases%2FOptimize_Costs%2FImplementing_distributed_tracing)
69. OpenTelemetry & Jaeger — Distributed Tracing for Microservices: A Hands-On Deep Dive, [https://medium.com/@bavicnative/opentelemetry-jaeger-distributed-tracing-for-microservices-a-hands-on-deep-dive-8ef2ab526213](https://www.google.com/url?sa=E&q=https%3A%2F%2Fmedium.com%2F%40bavicnative%2Fopentelemetry-jaeger-distributed-tracing-for-microservices-a-hands-on-deep-dive-8ef2ab526213)
70. Distributed Tracing in Microservices: A Comprehensive Guide - Dataversity, [https://www.dataversity.net/articles/distributed-tracing-in-microservices-a-comprehensive-guide/](https://www.google.com/url?sa=E&q=https%3A%2F%2Fwww.dataversity.net%2Farticles%2Fdistributed-tracing-in-microservices-a-comprehensive-guide%2F)
71. Dead Code Shouldn't Exist: How We Removed 28k Lines of Code, One Knip at a Time, [https://gitnation.com/contents/dead-code-shouldnt-exist-how-we-removed-28k-lines-of-code-one-knip-at-a-time](https://www.google.com/url?sa=E&q=https%3A%2F%2Fgitnation.com%2Fcontents%2Fdead-code-shouldnt-exist-how-we-removed-28k-lines-of-code-one-knip-at-a-time)
72. JavaScript Dead Code Identification, Elimination, and Empirical Assessment, [https://www.computer.org/csdl/journal/ts/2023/07/10108937/1MDGlfpbCo0](https://www.google.com/url?sa=E&q=https%3A%2F%2Fwww.computer.org%2Fcsdl%2Fjournal%2Fts%2F2023%2F07%2F10108937%2F1MDGlfpbCo0)
73. scip-typescript: a new TypeScript and JavaScript indexer - Sourcegraph, [https://sourcegraph.com/blog/announcing-scip-typescript](https://www.google.com/url?sa=E&q=https%3A%2F%2Fsourcegraph.com%2Fblog%2Fannouncing-scip-typescript)