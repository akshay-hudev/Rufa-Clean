You are the principal engineer responsible for evolving DCAv2 into a secure,
auditable, production-capable enterprise dead-code detection, analysis and
safe-remediation platform.

Work directly in the existing repository:

/Users/apple/Desktop/Akshay@goAI/DCAv2

This is an existing functioning codebase.

Do not rewrite it from scratch.

Inspect the actual repository, production code, migrations, tests and Git history
before making assumptions. Preserve valid existing implementation and improve it
incrementally.

Do not begin with another general architecture review.

Do not merely write plans, interfaces, TODOs or placeholder implementations.
Implement working functionality, run tests, fix failures, update documentation
and produce an evidence-backed final handoff.

This document is:

1. the product and safety contract;
2. the long-term architecture roadmap;
3. the implementation order;
4. the acceptance criteria.

============================================================
1. PRODUCT MISSION
============================================================

DCAv2 must become an evidence-driven platform that can detect, analyze, explain
and safely remediate dead code across:

- single-package repositories;
- multi-package repositories;
- monorepos;
- polyrepo organizations;
- shared libraries;
- internal package registries;
- generated clients;
- distributed microservices;
- build graphs;
- infrastructure;
- deployment configurations;
- runtime-observed systems.

The system must:

1. Discover authorized repositories and packages.
2. Resolve each analyzed source revision to an immutable commit.
3. Qualify the repository before expensive analysis.
4. Discover workspaces, packages, build targets, source roots and test roots.
5. Run appropriate analyzers through versioned adapters.
6. Normalize evidence from multiple tools.
7. Record what was successfully analyzed.
8. Record what was unavailable, excluded, unsupported or failed.
9. Classify findings conservatively.
10. Explain every finding without requiring direct database inspection.
11. Require explicit human disposition.
12. Require separate remediation authorization.
13. Reproduce the exact finding before changing source.
14. Run untrusted repository activity in an isolated runner.
15. Apply only an explicitly supported and authorized transformation.
16. Run baseline and post-change verification.
17. Validate the expected changed-file set.
18. Produce a deterministic content-addressed patch.
19. Revalidate the patch at a trusted publication boundary.
20. Create a draft pull request.
21. Never merge automatically.
22. Never push directly to the default branch.
23. Preserve an append-only, tamper-evident audit trail.
24. Support safe retries and idempotency.
25. Fail safely when certainty or coverage is insufficient.

A machine-generated finding must never directly authorize source modification.

============================================================
2. ACCURACY CONTRACT
============================================================

Enterprise dead-code analysis is an open-world problem.

The system must never claim perfect or universal certainty.

A reference may exist through:

- another repository;
- an old deployed version;
- an internal or external package consumer;
- an external customer;
- generated client code;
- reflection;
- decorators;
- annotations;
- dependency injection;
- plugin registration;
- dynamic imports;
- string-based registration;
- feature flags;
- runtime configuration;
- REST;
- GraphQL;
- gRPC;
- Kafka;
- RabbitMQ;
- NATS;
- scheduled jobs;
- infrastructure wiring;
- service meshes;
- API gateways;
- production runtime activity.

Therefore:

- absence of a discovered reference is not automatically proof of non-use;
- missing coverage is not evidence of deadness;
- analyzer failure is not evidence of deadness;
- missing runtime telemetry is not evidence of deadness;
- unavailable consumer repositories must remain visible;
- external public consumers make the usage universe incomplete;
- positive liveness evidence dominates weak absence evidence;
- contradictory evidence must remain contradictory;
- unknown must remain unknown.

Required machine classifications include:

- candidate_dead;
- live_evidence_present;
- test_only;
- inconclusive;
- conflicting;
- unsupported;
- stale;
- failed.

The platform must prefer a safe inconclusive result over an unsafe dead-code
claim.

============================================================
3. CURRENT IMPLEMENTATION: EVOLVE, DO NOT REBUILD
============================================================

The repository already contains substantial implementation, including some
combination of:

- GitHub App discovery;
- repository classification;
- source acquisition;
- Tree-sitter symbol extraction;
- Knip;
- Vulture;
- SCIP TypeScript;
- same-repository references;
- partial cross-repository references;
- PostgreSQL evidence persistence;
- confidence logic;
- human review state;
- Docker isolation;
- PolyglotPiranha transformations;
- freshness checks;
- baseline and post-change gates;
- patch hashing;
- GitHub draft-PR creation;
- removal auditing;
- hostile-repository tests;
- integration fixtures.

Inspect the current HEAD to determine precisely which capabilities exist and
which are working.

Production code, tests and migrations are more authoritative than potentially
outdated README or STATUS files.

Preserve useful implementation and tested safety behavior.

Do not remove or rewrite working modules without evidence that replacement is
necessary.

Preserve a modular-monolith control plane unless measured operational evidence
requires a different deployment boundary.

Keep PostgreSQL as the primary system of record unless reproducible benchmarks
demonstrate a real limitation.

Do not introduce a graph database merely because the domain contains graphs.

Do not create a large microservice architecture merely because the product
analyzes microservices.

============================================================
4. EXPLICIT NON-GOALS
============================================================

Do not implement or integrate:

- PRPilot;
- PRPilot-specific APIs;
- PRPilot-specific schemas;
- PRPilot-specific workflow logic;
- PRPilot-specific authentication;
- automatic merge;
- direct default-branch pushes;
- unreviewed remediation;
- machine-authorized deletion;
- a custom universal compiler;
- a custom universal parser;
- a custom universal SSA platform;
- a custom universal whole-program pointer-analysis engine;
- a graph database without benchmark evidence;
- Kafka, RabbitMQ or Redis solely for architectural appearance;
- a separate frontend implementation of business logic;
- destructive automatic microservice retirement;
- automatic deletion of production infrastructure;
- automatic deletion of databases, topics, queues, secrets, DNS or data.

There must be no PRPilot integration anywhere in the completed project.

============================================================
5. REUSE-FIRST, BUILD-LAST POLICY
============================================================

DCAv2 follows a reuse-first engineering policy.

Before implementing any substantial:

- parser;
- compiler frontend;
- semantic indexer;
- dependency graph extractor;
- package-manager integration;
- build-system integration;
- framework convention engine;
- contract parser;
- infrastructure parser;
- runtime collector;
- codemod engine;
- transformation engine;
- security scanner;
- job scheduler;
- artifact format;

perform the following:

1. Inspect existing DCAv2 code for reusable functionality.
2. Research maintained open-source or official ecosystem tools.
3. Use official documentation, repositories and licenses.
4. Evaluate:
   - capability fit;
   - precision;
   - supported versions;
   - language and framework support;
   - maintenance activity;
   - machine-readable output;
   - determinism;
   - performance;
   - extensibility;
   - security implications;
   - execution requirements;
   - commercial-use restrictions;
   - hosted-service restrictions;
   - redistribution restrictions;
   - integration complexity;
   - operational complexity.
5. Prefer wrapping or composing a suitable tool over reimplementing its core
   functionality.
6. Build custom functionality only when:
   - no suitable maintained tool exists;
   - licensing prevents intended use;
   - the available tool cannot meet a required safety property;
   - output cannot provide required provenance;
   - deterministic execution cannot be achieved;
   - performance is proven insufficient;
   - the functionality is a unique DCAv2 policy or trust-boundary concern.

For every significant custom implementation, create an ADR documenting:

- required capability;
- existing tools evaluated;
- reasons each was accepted or rejected;
- license findings;
- security findings;
- benchmark or fixture evidence;
- minimum custom scope;
- future replacement strategy.

Do not duplicate mature compiler, parser, package-manager or build-tool
functionality merely for architectural control.

DCAv2 should primarily own:

- evidence normalization;
- provenance;
- coverage;
- analysis epochs;
- contradiction handling;
- deterministic classification policy;
- human review;
- remediation authorization;
- trust-boundary enforcement;
- patch verification;
- publication safety;
- audit history;
- organization-wide evidence correlation.

Third-party tools should primarily supply:

- parsing;
- symbol extraction;
- semantic indexing;
- reference extraction;
- project discovery;
- workspace discovery;
- framework conventions;
- build graphs;
- package graphs;
- contract parsing;
- infrastructure parsing;
- runtime observations;
- structural transformations;
- native verification commands.

No third-party tool’s final “dead” result is authoritative.

Normalize its raw evidence and apply DCAv2 policy independently.

============================================================
6. TOOL AND LICENSE GOVERNANCE
============================================================

Create and maintain:

docs/tooling-and-licenses.md

For every bundled, optional or evaluated tool, record:

- name;
- official source;
- version;
- executable hash or container digest;
- SPDX license where available;
- commercial-use conditions;
- hosted-service conditions;
- redistribution conditions;
- supported languages;
- supported repository types;
- capability supplied;
- required network access;
- required credentials;
- whether repository code is executed;
- machine-readable output;
- determinism;
- known false positives;
- known false negatives;
- failure behavior;
- provenance produced;
- adapter tests;
- whether it affects:
  - inventory;
  - candidate generation;
  - classification;
  - remediation eligibility;
  - transformation;
  - verification;
  - diagnostics only.

Verify licenses from current official sources at implementation time.

Do not rely on historical whitepaper claims about current licenses.

Commercial or source-available tools must remain optional unless a customer has
the necessary license.

Core safety must not depend on a commercial license.

============================================================
7. CORE TOOL STRATEGY
============================================================

Preserve or build versioned adapters around appropriate existing tools.

Core current tools:

- GitHub App and Octokit for GitHub integration;
- Git for source acquisition and patch workflows;
- PostgreSQL for the system of record;
- Docker/BuildKit for the current isolated runner;
- Tree-sitter for broad syntactic inventory;
- SCIP for normalized semantic definitions and references;
- scip-typescript for TypeScript/JavaScript semantic indexing;
- Knip for JavaScript/TypeScript project-level evidence;
- Vulture for Python heuristic evidence;
- PolyglotPiranha for supported rule-driven transformations;
- native package managers;
- native build and test tools;
- OpenTelemetry for future runtime evidence;
- mature parsers for OpenAPI, Protobuf, GraphQL, YAML, JSON and HCL;
- Git history and CODEOWNERS metadata.

Tool roles:

Tree-sitter:
- syntactic inventory;
- exact declaration ranges;
- source structure;
- not semantic truth.

SCIP:
- semantic definitions;
- semantic references;
- normalized symbol identity;
- not a complete dead-code policy engine.

Knip:
- JS/TS entry points;
- workspaces;
- unused files;
- unused exports;
- unused dependencies;
- unused devDependencies;
- unused types;
- scripts;
- framework/plugin conventions;
- supplemental evidence only;
- never an authorization system.

Vulture:
- Python candidate evidence;
- retain its native confidence and finding type;
- do not convert its heuristic confidence directly into DCAv2 authorization.

PolyglotPiranha:
- tested transformation backend;
- never a detector;
- never a policy engine;
- never an authorization engine.

============================================================
8. CONDITIONAL OPEN-SOURCE TOOLS
============================================================

Evaluate these through adapters only when they close a measured gap:

- OpenRewrite for JVM and supported structured-data transformations;
- ast-grep for bounded structural search and tested rewrites;
- jscodeshift;
- Recast;
- ts-morph;
- TypeScript compiler transformations;
- Semgrep for supplemental patterns and framework/config evidence;
- CodeQL for licensed language-specific semantic/data-flow evidence;
- Depwire for optional structural and blast-radius diagnostics;
- Oxc for high-performance JS/TS parsing where justified;
- Glean for future large-scale fact storage only after benchmarks;
- Scavenger or Codekvast for JVM runtime observations;
- Bazel query/cquery;
- Nx project graph;
- Turborepo metadata;
- Maven project models;
- Gradle tooling models;
- Syft;
- CycloneDX tooling;
- gVisor;
- Kata Containers;
- Firecracker or equivalent microVM isolation;
- Open Policy Agent only when external policy evaluation is actually required.

Every conditional adoption requires:

- an ADR;
- current license review;
- security review;
- fixtures;
- measured benefit;
- fallback behavior;
- explicit capability documentation.

Do not use:

- ts-prune as a primary TS engine when stronger maintained tools are available;
- Knip --fix as remediation authorization;
- arbitrary npx downloads of trusted tools during an analysis run;
- an analyzer solely because it has a high tool-count or marketing value.

============================================================
9. STRICT PHASE-BY-PHASE EXECUTION
============================================================

This document defines the complete product roadmap, architecture, safety
requirements and long-term acceptance criteria.

However, you are authorized to implement only ONE phase at a time.

You may implement only the phase explicitly authorized in the latest valid
human authorization message.

The operating guide itself does not authorize a phase.

A phase is complete only when:

1. Every requirement listed for that phase is implemented.
2. No requirement is replaced by a placeholder, stub, TODO or documentation-only
   claim.
3. Relevant unit tests pass.
4. Relevant integration tests pass.
5. TypeScript compilation passes.
6. The complete regular test suite passes.
7. Relevant PostgreSQL migration tests pass.
8. Relevant Docker tests pass.
9. Relevant hostile-repository tests pass.
10. git diff --check passes.
11. Documentation accurately reflects the implementation.
12. Known limitations are explicitly recorded.
13. No credentials, containers, workspaces or temporary databases remain.
14. The repository is left in a coherent, reviewable state.
15. All changes are summarized with exact files and commits.

Do not start the next phase automatically after completing the current phase.

At the end of the current phase:

1. Stop implementation.
2. Provide the phase completion report.
3. State whether every acceptance criterion passed.
4. Clearly identify anything incomplete.
5. Provide the exact commands and test results.
6. Update CODEX_EXECUTION_STATE.md.
7. Provide a proposed continuation prompt for the next phase.
8. Wait for explicit human authorization before starting the next phase.

The next phase may begin only after the user explicitly states:

“Phase N is approved. Proceed with Phase N+1.”

Do not interpret silence, successful tests, prior roadmap text or broad project
authorization as permission to continue.

If the current phase cannot be fully completed:

1. Do not start the next phase.
2. Stop at a safe point.
3. Explain the blocker.
4. Preserve passing behavior.
5. Record the exact remaining work.
6. Provide commands for reproducing the blocker.
7. Wait for human direction.

Never claim a phase is complete merely because:

- interfaces were created;
- database tables were added;
- documentation was written;
- tests were skipped;
- external credentials were unavailable;
- a fixture passed through hardcoded logic;
- a feature was marked experimental;
- implementation was deferred to another phase.

Only completed, tested and documented functionality counts toward phase
completion.

============================================================
10. IMMEDIATE DEFECT: ISOLATED TYPESCRIPT DEPENDENCY
============================================================

Fix the current isolated-runner defect before expanding scope.

Observed behavior:

- the target repository declares and locks TypeScript;
- a clean host npm ci installs node_modules/.bin/tsc;
- isolated remediation reports tsc: not found.

Do not keep modifying the external fixture to hide a DCAv2 defect.

Create a local hermetic fixture that reproduces it.

Inside the exact isolated environment used for remediation, capture:

- resolved commit;
- package.json dependencies;
- package.json devDependencies;
- package scripts;
- package-lock hash;
- Node version;
- npm version;
- exact installation command;
- NODE_ENV;
- NPM_CONFIG_PRODUCTION;
- NPM_CONFIG_OMIT;
- lowercase npm variants;
- npm config get omit;
- npm config get production;
- npm ls typescript;
- node_modules/.bin listing;
- node_modules ownership;
- node_modules permissions;
- installation workspace;
- gate workspace;
- container identity;
- mount configuration;
- whether node_modules is deleted, hidden, copied, replaced or shadowed.

Correct the generic root cause.

Requirements:

- frozen lockfile installation;
- include development dependencies when required by typecheck/build/test;
- clear inherited production-only configuration;
- no host-global tsc;
- no host-global project tool;
- no unsafe dynamic trusted-tool download;
- install and verification use the intended isolated workspace;
- runner image is rebuilt;
- immutable image digest is resolved and persisted;
- regression test covers TypeScript in devDependencies;
- regression test covers production-only npm environment variables;
- regression test covers missing lockfile;
- regression test covers stale lockfile;
- regression test covers workspace mismatch;
- Docker-backed integration tests pass.

============================================================
11. TRUST BOUNDARIES
============================================================

Maintain three separate security boundaries.

A. Trusted controller

Responsible for:

- credentials;
- configuration;
- policy;
- database access;
- job orchestration;
- review;
- authorization;
- audit.

B. Untrusted execution runner

Responsible for:

- repository-controlled installation;
- analyzers requiring repository contents;
- typecheck;
- build;
- lint;
- tests;
- transformations;
- optional service startup;
- optional health checks.

C. Trusted publisher

Responsible for:

- authenticated Git operations;
- branch creation;
- patch application;
- final revalidation;
- draft PR creation.

The untrusted runner must never receive:

- GitHub App private keys;
- GitHub installation tokens;
- database credentials;
- publisher credentials;
- host SSH credentials;
- cloud credentials;
- Docker socket access;
- unrelated host environment variables;
- control-plane secrets.

============================================================
12. ISOLATED RUNNER SECURITY
============================================================

Treat all repositories as untrusted, including private and internal repositories.

The runner must enforce:

- ephemeral workspace;
- fresh environment for every job;
- digest-pinned image;
- non-root user;
- dropped Linux capabilities;
- no privileged mode;
- no Docker socket;
- explicit environment allowlist;
- read-only root filesystem where practical;
- read-only staged source;
- separate writable working copy;
- CPU limit;
- memory limit;
- disk limit;
- file-count limit where possible;
- PID limit;
- output-size limit;
- hard timeout;
- process-group termination;
- forced cleanup;
- denied cloud metadata access;
- denied arbitrary internet access;
- separately controlled dependency-install network phase;
- registry allowlist or approved proxy;
- no credential-bearing Git remote;
- no persisted unsafe Git configuration;
- symlink-escape protection;
- path-traversal protection;
- bounded and redacted logs.

Create a runner protocol abstraction so future implementations may use:

- hardened containers;
- sandboxed containers;
- microVMs;
- customer-hosted runners;
- customer-VPC runners.

Do not change the backend without benchmarks and an ADR.

An unrestricted runner result must never be silently treated as equivalent to a
hardened result.

Record the execution security profile with every analyzer and gate result.

============================================================
13. HOSTILE-REPOSITORY TESTS
============================================================

Maintain fixtures that attempt:

- environment-secret theft;
- GitHub-token access;
- database access;
- host-file access;
- Docker-socket access;
- cloud metadata access;
- arbitrary egress;
- DNS egress where applicable;
- symlink escape;
- path traversal;
- malicious .npmrc;
- package lifecycle scripts;
- malicious package-manager configuration;
- malicious build scripts;
- malicious test scripts;
- Git config persistence;
- fork bombs;
- PID exhaustion;
- CPU exhaustion;
- memory exhaustion;
- disk exhaustion;
- file-count exhaustion;
- output flooding;
- timeout evasion;
- child/grandchild persistence;
- signal-handling abuse;
- retained container creation;
- retained workspace creation.

Security fixtures must exercise the same runner path used in production.

============================================================
14. REPOSITORY QUALIFICATION
============================================================

Implement qualification before candidate classification.

Persist:

- account/tenant;
- provider;
- repository identity;
- default branch;
- requested revision;
- immutable commit;
- source hash when practical;
- language composition;
- package managers;
- lockfiles;
- workspaces;
- package roots;
- build targets;
- project configurations;
- tsconfig/jsconfig roots;
- Python project roots;
- generated directories;
- vendored directories;
- source roots;
- test roots;
- framework indicators;
- package publication status;
- install strategy;
- typecheck strategy;
- build strategy;
- lint strategy;
- test strategy;
- service-start strategy;
- health-check strategy;
- environment requirements;
- network requirements;
- unsupported features;
- missing requirements;
- coverage limitations.

Qualification outcomes:

- ready;
- ready_with_limited_gates;
- configuration_required;
- baseline_broken;
- unsupported;
- inaccessible;
- failed.

A missing test command is not a passed test.

A baseline-broken repository is not an analyzer failure.

One repository failure must not fail a multi-repository campaign.

Qualification output must provide actionable remediation information.

============================================================
15. STRUCTURED COMMAND MODEL
============================================================

Do not execute arbitrary host shell strings.

Represent commands using structured records:

- executable;
- argument array;
- working directory;
- package/build adapter;
- allowed environment variables;
- timeout;
- network policy;
- resource profile;
- expected artifacts;
- gate type.

Invoke package.json scripts only through the selected package-manager adapter and
inside the isolated runner.

Version repository configuration.

Support safe overrides for:

- package roots;
- source roots;
- test roots;
- generated paths;
- install;
- typecheck;
- build;
- lint;
- unit tests;
- integration tests;
- service startup;
- health check;
- entry points;
- registry hosts;
- environment allowlist;
- resource limits.

Reject unsafe working directories, executables or argument structures.

============================================================
16. PACKAGE-MANAGER AND BUILD ADAPTERS
============================================================

Implement adapters rather than scattered conditional logic.

Required Node adapters:

- npm with package-lock.json;
- pnpm with pnpm-lock.yaml;
- Yarn with yarn.lock.

Required Python adapters:

- pip requirements;
- Poetry;
- uv where safely testable.

Inventory-driven later adapters:

- Maven;
- Gradle;
- Bazel;
- Go modules;
- Cargo.

Each adapter must define:

- discovery;
- version detection;
- package-root semantics;
- workspace semantics;
- lockfile validation;
- frozen installation;
- development-dependency behavior;
- lifecycle-script policy;
- registry/network behavior;
- cache strategy;
- tool-version capture;
- failure classification;
- cleanup;
- test fixtures.

Do not claim support without positive, negative and failure fixtures.

============================================================
17. SOURCE, PACKAGE, BUILD AND DEPLOYMENT MODEL
============================================================

Model the system as both containment and graph relationships.

Required concepts include:

- tenant/account;
- VCS connection;
- repository;
- repository location;
- immutable source snapshot;
- organization analysis epoch;
- document;
- document version;
- workspace;
- package;
- package version;
- build target;
- artifact;
- container image;
- deployment;
- environment;
- source occurrence;
- symbol lineage;
- semantic definition;
- reference occurrence;
- package dependency;
- repository dependency;
- contract edge;
- infrastructure edge;
- runtime observation;
- coverage assertion;
- evidence item.

Do not assume:

- one repository equals one package;
- one package equals one deployment;
- one repository equals one service;
- one symbol has one permanent identity across all history.

Containment can be hierarchical.

Dependencies and deployments form graphs.

============================================================
18. SYMBOL IDENTITY AND LINEAGE
============================================================

Use two identity layers.

Exact occurrence identity:

- tenant;
- repository;
- immutable source snapshot;
- file;
- file content hash;
- language;
- analyzer namespace;
- analyzer version;
- native semantic symbol identifier;
- source range;
- occurrence role.

Logical lineage:

- predecessor;
- successor;
- matching method;
- matching confidence;
- human-confirmed or automatic;
- moved;
- renamed;
- copied;
- split;
- merged;
- repository transfer.

Do not pretend one symbol ID remains permanently valid through arbitrary changes.

Every finding must bind to the exact occurrence and immutable source snapshot.

============================================================
19. ANALYZER-RUN PROVENANCE
============================================================

Every analyzer run must record:

- analyzer name;
- adapter version;
- analyzer version;
- executable hash or image digest;
- configuration hash;
- query/rule version;
- repository;
- source snapshot;
- workspace/package/build scope;
- start and end time;
- exit status;
- bounded output;
- warnings;
- exclusions;
- failure classification;
- security profile;
- artifact hashes;
- coverage;
- evidence produced.

Analyzer failure must never silently produce an empty successful result.

Analyzer output must be reproducible where the underlying tool permits it.

============================================================
20. ANALYZER ADAPTER MODEL
============================================================

Define stable interfaces for:

- syntactic analyzers;
- semantic indexers;
- project analyzers;
- framework convention providers;
- package graph providers;
- build graph providers;
- registry resolvers;
- contract analyzers;
- infrastructure analyzers;
- runtime evidence adapters;
- transformation engines;
- verification adapters.

Each adapter must declare:

- supported languages;
- supported project types;
- supported versions;
- required tools;
- required network;
- required credentials;
- execution trust profile;
- evidence types;
- limitations;
- failure semantics;
- fixtures.

============================================================
21. TYPESCRIPT AND JAVASCRIPT SUPPORT
============================================================

Preserve and strengthen:

- Tree-sitter inventory;
- SCIP TypeScript semantic indexing;
- Knip project analysis;
- textual auditing;
- production/test context;
- exact definition matching;
- aliases;
- destructuring;
- function values;
- callbacks;
- re-exports;
- barrel files;
- default exports;
- named exports;
- CommonJS;
- ESM;
- dynamic imports;
- exports maps;
- path aliases;
- multiple tsconfig files;
- project references;
- TSX/JSX;
- framework entry points;
- workspace boundaries.

Knip integration must persist:

- Knip version;
- configuration hash;
- enabled plugins;
- workspace configuration;
- entry points;
- unused files;
- unused exports;
- unused dependencies;
- unused devDependencies;
- unused types;
- execution status;
- exclusions;
- failure information.

Knip is supporting evidence.

Knip must not be the sole proof that a symbol is dead.

Knip auto-fix must not be used to bypass DCAv2 remediation.

Do not require Knip to detect a private top-level function when exact semantic
evidence and full coverage already satisfy the applicable policy.

Frameworks such as Next.js, React, NestJS and similar ecosystems require
framework-aware entry-point and registration handling.

Unresolved framework behavior must reduce coverage or block remediation.

============================================================
22. MONOREPO SUPPORT
============================================================

Support:

- npm workspaces;
- pnpm workspaces;
- Yarn workspaces;
- nested packages;
- multiple package roots;
- multiple tsconfig files;
- TypeScript project references;
- path aliases;
- package exports;
- cross-workspace dependencies;
- independently buildable packages;
- package-specific tests;
- package-specific gates.

Use native workspace/build metadata where possible.

Evaluate:

- Knip workspace support;
- package-manager workspace metadata;
- Nx project graph;
- Turborepo metadata;
- Bazel query/cquery;
- native TypeScript project references.

Monorepo requirements:

1. Discover all supported packages.
2. Record unsupported or skipped packages.
3. Resolve cross-package imports.
4. Resolve cross-package semantic references.
5. Run gates at the correct package/build-target scope.
6. Never declare coverage complete when relevant packages were missed.
7. Treat partial workspace coverage as inconclusive.
8. Maintain fixtures for each claimed workspace adapter.

============================================================
23. PYTHON SUPPORT
============================================================

Preserve Tree-sitter and Vulture as initial evidence.

Use Python-native ecosystem tools where they add measurable value:

- Python AST;
- Pyright;
- mypy;
- Ruff;
- pytest;
- package metadata;
- framework routing information;
- decorator metadata.

Account for:

- decorators;
- __all__;
- dynamic imports;
- getattr/setattr;
- monkey patching;
- fixtures;
- framework registration;
- CLI entry points;
- plugin entry points;
- reflection;
- test-only usage.

Advertise Python capability separately for:

- qualification;
- inventory;
- candidate generation;
- semantic references;
- framework coverage;
- safe transformation;
- verification;
- publication.

Do not claim full Python remediation support merely because Vulture produced a
finding.

Unsupported dynamic behavior must produce inconclusive or unsupported results.

============================================================
24. FUTURE LANGUAGE SUPPORT
============================================================

Select future language priority from actual repository inventory and customer
need.

Evaluate Java/JVM using:

- SCIP Java;
- Maven project models;
- Gradle tooling;
- framework metadata;
- OpenRewrite for tested transformations;
- JVM runtime evidence where justified.

Evaluate .NET, Go, Rust, C/C++, Ruby and PHP through:

- native compilers;
- native build tools;
- maintained semantic indexers;
- SCIP indexers where practical;
- maintained transformation tools.

Define language support by capability:

- qualification;
- inventory;
- candidate detection;
- semantic references;
- cross-package resolution;
- cross-repository resolution;
- framework coverage;
- runtime mapping;
- transformation;
- verification;
- publication.

Never use one binary “supported language” label.

============================================================
25. NORMALIZED EVIDENCE MODEL
============================================================

Normalize evidence including:

- syntax declaration;
- semantic definition;
- production reference;
- test reference;
- cross-package reference;
- cross-repository reference;
- import-only reference;
- function-value reference;
- callback reference;
- unknown semantic reference;
- textual occurrence;
- dynamic usage indicator;
- framework convention;
- decorator/annotation registration;
- configuration registration;
- public export;
- external API exposure;
- package publication;
- registry consumption;
- generated-code provenance;
- contract binding;
- infrastructure binding;
- deployment presence;
- runtime observation;
- feature-flag state;
- Git history;
- ownership;
- analyzer failure;
- exclusion;
- coverage assertion.

Represent correlated evidence.

Do not count Tree-sitter, SCIP, Knip and grep over the same source snapshot as
four fully independent confirmations.

============================================================
26. COVERAGE
============================================================

Coverage is not ordinary positive or negative evidence.

Coverage determines whether absence-based evidence may be interpreted.

Coverage must identify:

- repositories included;
- repositories unavailable;
- commits included;
- packages included;
- packages excluded;
- files included;
- files excluded;
- generated files excluded;
- analyzer success;
- analyzer failure;
- project configurations included;
- build targets included;
- registries included;
- deployed versions included;
- contracts included;
- infrastructure sources included;
- runtime environments included;
- runtime observation windows;
- known blind spots.

Coverage must be immutable and bound to the finding.

Partial required coverage must produce inconclusive or failed classification.

============================================================
27. CLASSIFICATION POLICY
============================================================

Replace numeric additive confidence as the safety gate.

Use a deterministic evidence lattice with dominance, blocker and contradiction
rules.

Required behavior:

- an exact valid live production reference produces live_evidence_present;
- a test-only reference produces test_only unless policy says otherwise;
- positive runtime execution is a strong liveness veto for the matching
  environment/version;
- exact framework, contract or configuration registration is strong liveness
  evidence;
- analyzer failure produces failed or inconclusive;
- incomplete required coverage produces inconclusive;
- contradictory valid evidence produces conflicting;
- unsupported symbol or project shape produces unsupported;
- changed source, policy, analyzer identity, coverage or evidence produces stale;
- externally public consumption with an incomplete consumer universe produces
  inconclusive or policy-blocked;
- missing telemetry does not prove non-use;
- runtime absence requires explicit observation completeness and a sufficient
  observation period.

Numeric values may be retained only for:

- ranking;
- prioritization;
- review ordering;
- operational analytics.

Numeric confidence must never directly authorize remediation.

Label numeric scores as uncalibrated until validated against reviewed datasets.

============================================================
28. HUMAN REVIEW
============================================================

Human disposition must be append-only.

Supported dispositions:

- confirmed_dead;
- confirmed_alive;
- deferred;
- excluded;
- inconclusive.

Every decision must bind:

- finding;
- repository;
- immutable commit;
- package/workspace;
- exact occurrence;
- evidence digest;
- coverage identity;
- policy version;
- reviewer identity;
- rationale;
- timestamp.

A human disposition is not permission to modify code.

============================================================
29. REMEDIATION AUTHORIZATION
============================================================

Remediation authorization must be separate and append-only.

Supported outcomes:

- approved_for_remediation;
- rejected;
- revoked;
- expired.

Every authorization must bind:

- finding;
- human disposition;
- repository;
- immutable commit;
- package/workspace;
- exact occurrence;
- evidence digest;
- coverage identity;
- policy version;
- authorizer;
- rationale;
- timestamp.

confirmed_dead is necessary but not sufficient.

The latest valid disposition and latest valid authorization must both be checked:

- before transformation;
- immediately before publication.

A new commit, source hash, evidence digest, coverage identity or policy version
must invalidate old authorization.

Support configurable governance:

- same reviewer and authorizer allowed;
- separation of duties;
- CODEOWNER review;
- two-person approval;
- repository risk classes.

Do not infer customer approval policy.

============================================================
30. REMEDIATION WORKFLOW
============================================================

Remediation must:

1. Acquire the exact authorized source snapshot.
2. Verify repository identity.
3. Verify commit.
4. Remove authenticated remotes.
5. Remove unsafe Git configuration.
6. Verify file hashes.
7. Re-run qualification if necessary.
8. Re-run analysis independently.
9. Reproduce the exact finding.
10. Reproduce the evidence digest.
11. Verify current human disposition.
12. Verify current authorization.
13. Run baseline gates.
14. Apply one authorized transformation or an explicitly authorized batch.
15. Validate exact rewrite count.
16. Validate source range.
17. Validate changed-file allowlist.
18. Generate a deterministic patch.
19. Run post-change gates.
20. Revalidate review and authorization.
21. Verify patch stability.
22. Persist patch and SHA-256.
23. Persist gate outputs.
24. Clean all workspaces and containers.

Do not perform broad text deletion.

Do not automatically remove:

- exported/public symbols;
- generated code;
- externally consumed APIs;
- unsupported symbol shapes;
- entire services;
- infrastructure resources.

============================================================
31. TRANSFORMATION ADAPTERS
============================================================

Preserve PolyglotPiranha for already tested transformations.

Evaluate other transformation tools only where needed:

- OpenRewrite;
- ast-grep;
- TypeScript compiler transformations;
- ts-morph;
- jscodeshift;
- Recast.

Each transformation adapter must define:

- language;
- supported syntax shape;
- supported semantic shape;
- pinned version;
- rule/query hash;
- deterministic output;
- expected rewrite count;
- expected changed files;
- idempotency;
- negative fixtures;
- formatting stability;
- rollback behavior.

A transformation engine may never decide authorization.

Transformation support and detection support must be tracked independently.

============================================================
32. VERIFICATION GATES
============================================================

Represent each gate independently:

- dependency installation;
- typecheck;
- compile/build;
- lint;
- unit tests;
- integration tests;
- service startup;
- service health;
- generated-artifact verification;
- patch stability;
- changed-file verification;
- repository cleanliness;
- policy verification.

Each gate must record:

- gate type;
- structured command identity;
- working directory;
- start time;
- end time;
- duration;
- exit code;
- bounded stdout;
- bounded stderr;
- environment profile;
- tool versions;
- runner digest;
- security profile;
- failure classification.

Statuses:

- passed;
- failed;
- unavailable;
- skipped_by_policy;
- configuration_required;
- timed_out;
- resource_exceeded.

Unavailable is not passed.

Skipped is not passed.

Baseline failure blocks transformation.

Post-change failure blocks publication.

============================================================
33. TRUSTED PUBLISHER
============================================================

The untrusted runner must return only:

- structured results;
- evidence artifacts;
- gate artifacts;
- a patch artifact;
- content hashes.

The runner must not have publication credentials.

The trusted publisher must independently validate:

- account;
- repository;
- base branch;
- base commit;
- source hash;
- finding;
- exact occurrence;
- evidence digest;
- coverage;
- human disposition;
- authorization;
- policy version;
- remediation attempt;
- baseline gates;
- post-change gates;
- patch hash;
- changed files;
- publication idempotency key.

Publishing must:

- create a dedicated remediation branch;
- never directly push to the default branch;
- create a draft pull request;
- never merge;
- never enable auto-merge;
- never mark ready for review;
- be idempotent;
- return a prior safe result on retry.

When credentials are unavailable:

- preserve publication-ready remediation;
- report missing credentials accurately;
- allow later publication retry;
- do not repeat unsafe work unnecessarily;
- do not substitute unrelated credentials;
- do not claim publication succeeded.

============================================================
34. CROSS-REPOSITORY ANALYSIS
============================================================

Implement an organization analysis epoch.

An epoch must identify:

- repositories included;
- immutable commits;
- package versions;
- registries queried;
- deployed versions;
- contracts included;
- infrastructure sources included;
- runtime environments included;
- observation windows;
- unavailable repositories;
- unavailable registries;
- failed analyzers.

Cross-repository support must include:

- GitHub organization inventory;
- canonical repository identities;
- package manifests;
- internal npm registries;
- internal PyPI registries;
- internal Maven registries;
- Git dependencies;
- workspace dependencies;
- actual semantic imports;
- generated-client relationships;
- package-version alignment;
- deployed-version alignment.

Never interpret zero cross-repository references as complete absence when relevant
consumer repositories were unavailable.

For public libraries or externally consumed APIs:

- treat the consumer universe as open;
- require stronger policy;
- require runtime/deprecation evidence where appropriate;
- classify as inconclusive or policy-blocked when consumer visibility is
  insufficient.

============================================================
35. MICROSERVICE AND CONTRACT EVIDENCE
============================================================

Use thin adapters around mature parsers for:

- REST route definitions;
- OpenAPI;
- Protobuf;
- gRPC;
- GraphQL schemas;
- GraphQL operations;
- Kafka;
- RabbitMQ;
- NATS;
- CloudEvents;
- webhooks;
- cron and schedulers;
- API gateways;
- service meshes.

Model separately:

- route;
- handler;
- client;
- generated client;
- producer;
- consumer;
- topic;
- queue;
- exchange;
- subject;
- scheduler;
- job;
- external caller.

Producer-without-consumer and consumer-without-producer are not equivalent.

Contract evidence must be scoped by:

- source version;
- generated artifact version;
- deployment;
- environment;
- observation period.

============================================================
36. INFRASTRUCTURE AND DEPLOYMENT EVIDENCE
============================================================

Use mature parsers or native tools for:

- Kubernetes;
- Helm;
- Terraform/HCL;
- CloudFormation;
- Dockerfiles;
- CI/CD definitions;
- deployment manifests;
- service registries;
- image metadata;
- scheduled jobs;
- API gateway configuration;
- service mesh configuration.

Connect:

repository
→ package
→ build target
→ artifact/image
→ deployment
→ environment
→ route/job/consumer
→ runtime observation.

Infrastructure absence alone is not proof of deadness.

Track version skew between:

- source main branch;
- published package;
- built artifact;
- deployed artifact;
- consumer version.

============================================================
37. RUNTIME EVIDENCE
============================================================

Use OpenTelemetry as the preferred standard integration point.

Support runtime evidence for:

- HTTP;
- RPC;
- GraphQL where available;
- messaging;
- serverless functions;
- scheduled jobs;
- deployment resources.

Record:

- environment;
- service;
- service version;
- deployment;
- route/operation;
- topic/queue;
- observation start;
- observation end;
- first seen;
- last seen;
- count;
- sampling;
- collector identity;
- completeness;
- symbol-mapping method;
- mapping confidence.

Positive runtime observation is strong liveness evidence.

Runtime absence is unknown unless:

- the correct deployment was observed;
- the correct version was observed;
- the observation window is sufficient;
- sampling and collection completeness are known;
- low-frequency workloads are accounted for.

Do not build custom runtime agents before measuring the gap remaining after
OpenTelemetry and deployment evidence.

============================================================
38. MICROSERVICE RETIREMENT
============================================================

Source-code remediation and service retirement are different workflows.

DCAv2 may produce an evidence-backed service-retirement recommendation.

It must not automatically delete:

- deployments;
- databases;
- queues;
- topics;
- cloud resources;
- DNS;
- certificates;
- secrets;
- customer data;
- backups;
- monitoring;
- audit records.

A future service-retirement workflow must include:

1. service owner identification;
2. static dependency inventory;
3. contract consumer inventory;
4. runtime evidence;
5. data ownership;
6. retention obligations;
7. compliance review;
8. deprecation window;
9. consumer migration;
10. traffic observation;
11. operational approval;
12. security approval;
13. explicit shutdown approval;
14. separately authorized infrastructure cleanup.

Do not represent service retirement as ordinary function removal.

============================================================
39. DURABLE JOBS AND CAMPAIGNS
============================================================

Implement PostgreSQL-backed jobs first.

Job types:

- discovery;
- qualification;
- analysis;
- evidence ingestion;
- review workflow;
- remediation;
- verification;
- publication.

Required job properties:

- deterministic identity;
- idempotency;
- retry policy;
- lease;
- heartbeat;
- cancellation;
- bounded concurrency;
- per-account quota;
- priority;
- resumability;
- failure isolation;
- cleanup recovery;
- per-repository serialization where needed.

Support analysis-only campaigns across many repositories.

One repository failure must not abort the campaign.

Do not introduce an external broker until measured workload demonstrates a need.

============================================================
40. DATABASE EVOLUTION
============================================================

Use additive, ordered PostgreSQL migrations.

Requirements:

- migration numbering;
- checksums;
- advisory locking;
- safe retry;
- empty-database migration test;
- existing-database upgrade test;
- legacy record preservation;
- tenant scoping;
- idempotency keys;
- content hashes;
- audit retention;
- ON DELETE RESTRICT or explicit retention policy;
- indexes based on measured queries.

Recommended logical table families:

Tenancy and source:

- tenants/accounts;
- vcs_connections;
- repositories;
- repository_locations;
- source_snapshots;
- analysis_epochs.

Source and build:

- source_documents;
- document_versions;
- analysis_scopes;
- workspaces;
- packages;
- package_versions;
- build_targets;
- artifacts;
- deployments.

Symbols and references:

- symbol_lineages;
- symbol_occurrences;
- reference_edges.

Analysis:

- analysis_runs;
- analyzer_runs;
- coverage_assertions;
- evidence_artifacts;
- evidence_items;
- findings;
- verdicts;
- verdict_evidence.

Human decisions:

- human_reviews;
- policy_blockers;
- remediation_authorizations.

Remediation:

- remediation_attempts;
- generated_changes;
- gate_runs;
- change_requests;
- publications;
- audit_events.

Do not build a generic event-sourcing framework.

Use immutable truth tables and derived current-state views.

Keep analyzer-specific payloads in JSONB only where appropriate.

Keep core identities and policy fields in typed columns.

============================================================
41. AUDIT MODEL
============================================================

Maintain an append-only, tamper-evident audit chain.

Audit:

- discovery;
- source acquisition;
- source cleanup;
- qualification;
- analyzer execution;
- analyzer failure;
- coverage;
- evidence;
- classification;
- human review;
- authorization;
- rejection;
- revocation;
- expiration;
- remediation;
- gates;
- patch creation;
- publication;
- retry;
- cancellation;
- security-policy decision;
- cleanup;
- cleanup failure.

Audit-chain tests must verify:

- ordering;
- previous hash;
- event hash;
- tenant/account scope;
- mutation prevention;
- deletion prevention where required;
- deterministic validation.

============================================================
42. CLI
============================================================

Improve the existing CLI before building a UI.

Implement:

- boolean --help;
- global help;
- command-specific help;
- examples;
- clear missing-argument errors;
- argument type validation;
- stable JSON output;
- stable human-readable output;
- stable exit codes;
- quiet mode;
- branch-versus-commit explanation;
- no npm notice contamination of JSON when used correctly.

Commands should include:

- discover;
- qualify;
- repositories;
- packages;
- analyze;
- analysis;
- findings;
- finding;
- review;
- authorize;
- remediate;
- gates;
- publish;
- audit;
- jobs;
- campaigns;
- tools;
- capabilities;
- validate-audit.

Do not duplicate application logic inside CLI handlers.

============================================================
43. API AND USER INTERFACE
============================================================

Build a minimal authenticated control-plane API only after application services
and CLI behavior are stable.

The API must reuse:

- the same application services;
- the same policy engine;
- the same authorization checks;
- the same audit logic.

Do not create parallel business logic.

A dashboard is lower priority than correctness, API stability and operator
workflows.

When a dashboard is eventually built, it should expose:

- repository qualification;
- findings;
- evidence;
- coverage;
- contradictions;
- review;
- authorization;
- gates;
- patch;
- publication;
- audit history.

============================================================
44. OBSERVABILITY
============================================================

Add structured logging, metrics and tracing for:

- repository discovery;
- qualification success rate;
- unsupported reasons;
- baseline failure reasons;
- analyzer success;
- analyzer failure;
- candidate counts;
- coverage;
- review outcomes;
- confirmed false positives;
- remediation success;
- gate failures;
- phase durations;
- CPU use;
- memory use;
- disk use;
- queue depth;
- retries;
- cancellations;
- cleanup failures;
- publication failures.

Correlate:

tenant
→ campaign/job
→ repository
→ source snapshot
→ analysis
→ finding
→ review
→ authorization
→ remediation
→ publication.

Never log:

- installation tokens;
- private keys;
- database passwords;
- repository credentials;
- cloud credentials;
- full sensitive source content;
- unbounded subprocess output.

============================================================
45. TEST STRATEGY
============================================================

Maintain:

- unit tests;
- analyzer-adapter tests;
- parser fixtures;
- package-manager fixtures;
- database integration tests;
- migration tests;
- GitHub connector contract tests;
- Docker runner tests;
- hostile-repository tests;
- analysis tests;
- remediation tests;
- publisher tests;
- audit-chain tests;
- campaign tests;
- composed end-to-end tests.

Required fixtures include:

Core npm TypeScript:

- valid private unused function;
- used private function;
- TypeScript in devDependencies;
- missing lockfile;
- stale lockfile;
- production-only npm variables;
- failing install;
- failing baseline typecheck;
- failing baseline build;
- failing baseline tests;
- failing post-change typecheck;
- failing post-change build;
- failing post-change tests.

Reference shapes:

- direct call;
- aliased call;
- destructured call;
- callback;
- function value;
- test-only reference;
- textual/config occurrence;
- duplicate names;
- nested functions;
- exported symbols;
- re-exports;
- barrel files;
- dynamic imports;
- generated files;
- unsupported shapes.

Repository structures:

- npm workspace;
- pnpm workspace;
- Yarn workspace;
- nested package;
- multiple tsconfig files;
- project references;
- TSX framework entry;
- path aliases.

Python:

- static function;
- decorator registration;
- fixture use;
- dynamic import;
- __all__;
- framework registration.

Cross-boundary:

- cross-package consumer;
- cross-repository consumer;
- missing consumer repository;
- registry-published version;
- deployed old version;
- generated client;
- public external consumer blocker.

Governance:

- stale finding;
- changed commit;
- changed evidence;
- changed coverage;
- changed policy;
- revoked authorization;
- expired authorization;
- conflicting evidence;
- analyzer failure;
- unexpected changed file;
- zero rewrite;
- multiple rewrites;
- duplicate publication;
- concurrent publication;
- missing GitHub credentials.

Security:

- all hostile-runner cases listed previously.

Every external failure discovered must receive a local hermetic regression fixture.

============================================================
46. CAPABILITY MATRIX
============================================================

Maintain a machine-readable and documented capability matrix.

For every language, repository type and adapter, report support separately for:

- repository qualification;
- package discovery;
- workspace discovery;
- symbol inventory;
- semantic definitions;
- local references;
- cross-package references;
- cross-repository references;
- framework conventions;
- contract evidence;
- infrastructure evidence;
- runtime evidence;
- candidate classification;
- transformation;
- baseline verification;
- post-change verification;
- publication;
- service-retirement recommendation.

Never say “supported” without stating which capabilities are supported.

Do not claim monorepo, cross-repository or microservice support because an
interface or schema exists.

Support may be claimed only when:

- the adapter is implemented;
- positive fixtures pass;
- negative fixtures pass;
- incomplete-coverage fixtures pass;
- contradiction fixtures pass;
- stale-version fixtures pass;
- performance is measured;
- limitations are documented.

============================================================
47. DOCUMENTATION
============================================================

Create or reconcile:

- README.md;
- STATUS.md;
- CODEX_EXECUTION_STATE.md;
- docs/architecture.md;
- docs/security-model.md;
- docs/threat-model.md;
- docs/evidence-model.md;
- docs/coverage-model.md;
- docs/classification-policy.md;
- docs/repository-qualification.md;
- docs/tooling-and-licenses.md;
- docs/supported-repositories.md;
- docs/capability-matrix.md;
- docs/operator-guide.md;
- docs/github-app-setup.md;
- docs/deployment.md;
- docs/troubleshooting.md;
- docs/audit-model.md;
- docs/data-model.md;
- docs/roadmap.md;
- docs/service-retirement.md;
- docs/ADRs/.

Documentation must distinguish:

- implemented;
- tested;
- experimental;
- detection-only;
- classification-supported;
- remediation-supported;
- optional/licensed;
- unsupported;
- future work.

Do not use machine-specific absolute paths as the only documentation references.

============================================================
48. PHASED IMPLEMENTATION ORDER
============================================================

Complete phases in this order.

Do not begin later features before earlier safety requirements are verified.

Phase 0 — Reconcile the repository

- inspect current implementation;
- inspect current tests;
- inspect current migrations;
- reconcile README and STATUS;
- identify obsolete paths;
- quarantine unreviewed/adaptive PR paths;
- freeze baseline test results;
- create tool/license inventory;
- create execution-state document.

Phase 1 — Complete the safe TypeScript vertical slice

- reproduce and fix isolated tsc/devDependency defect;
- strengthen Docker isolation;
- add hostile-runner regression tests;
- improve CLI help and argument behavior;
- support one root npm package;
- support one package-lock.json;
- support one root tsconfig;
- support private top-level .ts functions;
- preserve Tree-sitter;
- preserve SCIP;
- preserve textual audit;
- use Knip as supplemental evidence;
- preserve separate review and authorization;
- complete deterministic remediation;
- complete baseline and post-change gates;
- complete trusted draft publication;
- verify audit chain;
- validate external disposable repository.

Phase 2 — Qualification and structured configuration

- repository qualification;
- structured command model;
- repository configuration;
- baseline outcomes;
- failure classifications;
- package-manager adapter framework.

Phase 3 — TypeScript/JavaScript repository breadth

- npm;
- pnpm;
- Yarn;
- workspaces;
- nested packages;
- multiple tsconfigs;
- project references;
- TSX/JSX;
- framework conventions;
- package graph;
- cross-package references.

Phase 4 — Python

- qualification;
- Vulture and AST evidence;
- dynamic-language blockers;
- Python verification;
- only tested narrow transformations.

Phase 5 — Inventory-driven additional language

- choose Java/JVM or another language from actual inventory;
- reuse compiler/indexer/build ecosystems;
- evaluate OpenRewrite where appropriate;
- implement fixtures before claiming support.

Phase 6 — Cross-repository and registry evidence

- analysis epochs;
- organization repository inventory;
- package registries;
- version-qualified consumers;
- actual symbol imports;
- generated clients;
- deployed-version alignment;
- incomplete-universe handling.

Phase 7 — Contracts and microservices

- REST;
- OpenAPI;
- GraphQL;
- gRPC;
- messaging;
- schedulers;
- producer/consumer graphs;
- external-client blockers.

Phase 8 — Infrastructure and runtime

- Kubernetes;
- Helm;
- Terraform;
- CloudFormation;
- Docker;
- CI/CD;
- deployment versions;
- OpenTelemetry;
- observation completeness.

Phase 9 — Durable campaigns and control plane

- PostgreSQL jobs;
- concurrency;
- retries;
- cancellation;
- quotas;
- authenticated API;
- policy roles;
- observability;
- deployment packaging.

Phase 10 — Scale and security validation

- benchmark representative monorepos;
- benchmark cross-repository epochs;
- benchmark PostgreSQL graph queries;
- benchmark analyzer cost;
- benchmark artifact storage;
- benchmark runner isolation;
- introduce additional infrastructure only when evidence justifies it.

Do not mark a phase complete merely because types, interfaces or database tables
were added.

============================================================
49. AUTHORIZED EXTERNAL VALIDATION
============================================================

No external repository may be accessed, modified, branched or published to
unless the current human authorization message explicitly identifies:

- repository;
- allowed revision or branch;
- allowed operation;
- whether read, analysis, remediation and publication are permitted;
- whether draft PR creation is permitted;
- authorization expiry or execution scope.

A repository named in documentation is a known fixture, not active
authorization.

Before every external operation:

1. Resolve main to an immutable commit.
2. Report the commit.
3. Confirm repository access.
4. Confirm DCAv2 branch and working tree.
5. Confirm database connectivity.
6. Confirm exact runner image digest.
7. Run analysis before remediation.

Expected fixture intent:

- one intentionally unused private top-level TypeScript function named
  normalizeLegacyReference;
- used/exported functions must remain untouched;
- clean frozen install must pass;
- typecheck must pass;
- build must pass;
- tests must pass.

Do not hardcode the repository or symbol into product logic.

Do not access another external repository without explicit authorization.

When the external commit changes:

- create a new analysis;
- create a new finding;
- require fresh review;
- require fresh authorization.

For the authorized repository:

- never push directly to main;
- never merge;
- only create a draft PR;
- modify only the authorized occurrence;
- verify main remains unchanged.

If GitHub App write credentials are absent:

- perform all safe local verification;
- persist publication-ready state;
- report the missing credential requirement;
- do not claim a PR exists.

============================================================
50. DEFINITION OF DONE
============================================================

The project is complete for the declared enterprise MVP only when:

- existing implementation has been evolved rather than needlessly replaced;
- current runner defects are generically fixed;
- hostile repository execution cannot access platform credentials;
- existing tests pass;
- new tests pass;
- migrations pass from an empty database;
- migrations preserve existing records;
- repository qualification exists;
- package-manager behavior is explicit;
- unsupported repositories fail safely;
- analyzer runs have immutable provenance;
- coverage is explicit and immutable;
- contradictions are explicit;
- numeric confidence is not the authorization gate;
- human review and authorization remain separate;
- stale review/authorization is rejected;
- exact finding reproduction occurs before modification;
- baseline gates are trustworthy;
- post-change gates are trustworthy;
- patches are deterministic;
- patches are content-addressed;
- unexpected changed files block publication;
- trusted publication independently revalidates the result;
- publication is idempotent;
- no automatic merge path exists;
- no direct default-branch push path exists;
- campaign repository failures are isolated;
- audit chains validate;
- cleanup is verified;
- tool licenses are documented;
- optional licensed tools are non-mandatory;
- actual supported capabilities are documented;
- unsupported cases are documented;
- monorepo claims are fixture-backed;
- cross-repository claims are epoch-backed;
- microservice claims are contract/deployment/runtime scoped;
- service retirement remains a separately authorized workflow;
- a real draft PR is created against the authorized disposable repository when
  valid credentials are available;
- the draft PR changes only the authorized occurrence;
- the PR remains draft;
- main remains unchanged.

Do not claim perfect dead-code certainty.

Do not claim universal language, framework, monorepo or microservice support.

The final product must be honest about incomplete evidence.

============================================================
51. FINAL HANDOFF FORMAT
============================================================

At completion provide:

1. Executive summary.
2. Current architecture.
3. Existing capabilities preserved.
4. Major defects found.
5. Root cause of the isolated TypeScript failure.
6. Exact generic fix.
7. Open-source tools reused.
8. Open-source tools evaluated but rejected.
9. Custom implementations and their ADRs.
10. Tool license matrix.
11. Supported repository matrix.
12. Supported language capability matrix.
13. Monorepo capability matrix.
14. Cross-repository capability matrix.
15. Microservice capability matrix.
16. Unsupported cases.
17. Evidence model.
18. Coverage model.
19. Classification policy.
20. Database migrations.
21. Security controls.
22. Runner backend and digest.
23. Hostile-repository test results.
24. Full test results with exact counts.
25. Migration test results.
26. Benchmark results.
27. Qualification fixture results.
28. Cross-repository epoch validation results.
29. Runtime/contract/infrastructure validation results.
30. External GitHub integration result.
31. Draft PR URL when created.
32. Confirmation that no merge occurred.
33. Confirmation that main was not directly modified.
34. Confirmation that no unauthorized repository was accessed.
35. Changed-file summary.
36. Commit summary.
37. Deployment instructions.
38. Operator workflow.
39. Known limitations.
40. Remaining product decisions.
41. Recommended next hardening work.
42. Confirmation that no temporary containers remain.
43. Confirmation that no temporary workspaces remain.
44. Confirmation that no temporary databases remain.
45. Confirmation that no credentials were persisted.

============================================================
52. CURRENT PHASE AUTHORIZATION
============================================================

This operating guide defines the complete product roadmap, architecture,
security requirements and acceptance criteria.

It does not authorize implementation of every phase.

The phase currently authorized for implementation must be provided explicitly
by the human operator in the Codex conversation.

Codex must:

1. Read this operating guide completely.
2. Read CODEX_EXECUTION_STATE.md when it exists.
3. Identify the phase explicitly authorized in the latest human instruction.
4. Implement only that phase.
5. Apply the requirements in this guide only to the extent required by the
   authorized phase.
6. Treat later sections as roadmap constraints, not implementation permission.
7. Stop after the authorized phase.
8. Provide a phase completion report.
9. Update CODEX_EXECUTION_STATE.md.
10. Wait for explicit approval before starting another phase.

No phase is authorized when the human instruction does not clearly identify it.

The next phase may begin only after the human operator explicitly states:

“Phase N is approved. Proceed with Phase N+1.”

Do not infer authorization from:

- the existence of this operating guide;
- the phased roadmap;
- prior broad project authorization;
- successful tests;
- completion of the previous phase;
- documentation describing a later phase;
- available credentials;
- remaining context or execution time.

Do not begin implementation until a phase-specific authorization is supplied in
the Codex conversation.