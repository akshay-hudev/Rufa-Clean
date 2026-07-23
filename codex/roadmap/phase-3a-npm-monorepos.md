# Phase 3A — npm Monorepos

This document defines the planned scope, capability boundaries, evidence
requirements, tests, stop conditions, and completion criteria for Phase 3A of
DCAv2.

Phase 3A extends the supported TypeScript workflow from a single npm package to
bounded npm workspace repositories.

It introduces workspace discovery, package graph construction,
cross-workspace reference analysis, package-aware coverage, and isolated
remediation.

This phase does not establish universal monorepo support.

This roadmap file does not authorize implementation, repository access,
credential use, dependency installation, database changes, remediation,
publication, or destructive operations.

Execution authority is governed by:

- `AGENTS.md`;
- `codex/core/01-instruction-precedence.md`;
- `codex/core/03-safety-invariants.md`;
- `codex/core/05-phase-authorization-protocol.md`;
- `codex/authorizations/current-phase-authorization.yaml`;
- the latest explicit human authorization.

---

## 1. Phase identity

```yaml
phase:
  id: phase-3a-npm-monorepos
  name: npm Monorepos
  roadmap_order: 3A
  default_status: inactive
  implementation_authorized_by_this_file: false
```

The phase becomes active only when the current authorization record explicitly
identifies `phase-3a-npm-monorepos` as active.

---

## 2. Primary objective

The primary objective is to support a bounded npm workspace repository while
preserving package-level and workspace-level evidence quality.

The phase should implement and validate:

1. npm workspace detection.
2. Workspace-root discovery.
3. Package discovery.
4. Canonical package identity.
5. Package graph construction.
6. Source, test, and generated-root discovery per package.
7. Cross-workspace reference analysis.
8. Package exports and path-alias handling.
9. TypeScript project-reference handling.
10. Package-aware evidence normalization.
11. Package-aware coverage.
12. Partial workspace failure handling.
13. Package-specific baseline and post-change gates.
14. Isolated remediation within the authorized package.
15. Aggregate reporting for the repository.
16. Trusted draft publication when separately authorized.

---

## 3. Intended capability

The intended capability is conceptually:

```text
Analyze a qualified npm workspace repository, determine whether a supported
private TypeScript function is referenced anywhere within the authorized
workspace graph, and safely remediate it only when all required package and
workspace coverage is complete.
```

The capability must remain constrained by:

- supported npm versions;
- supported lockfile versions;
- supported workspace declaration forms;
- supported TypeScript versions;
- supported package graph semantics;
- supported import and export behavior;
- supported project-reference behavior;
- supported path-alias behavior;
- complete required workspace coverage;
- exact finding reproduction;
- package-specific verification;
- repository-level verification where required;
- runner security;
- trusted publication controls.

---

## 4. Phase prerequisites

Phase 3A should not begin until Phase 2 can reliably:

- validate canonical repository identity;
- resolve an immutable source commit;
- detect npm as the package manager;
- detect that workspaces are present;
- distinguish single-package and workspace profiles;
- discover source, test, and generated roots;
- resolve required project-local tools;
- map repository commands to approved structured commands;
- evaluate baseline readiness;
- route unsupported workspace repositories safely;
- preserve qualification freshness.

Unresolved Phase 2 limitations must remain explicit.

---

## 5. Non-goals

Phase 3A does not, by default, include:

- pnpm workspaces;
- Yarn workspaces;
- Yarn Plug'n'Play;
- polyrepo analysis;
- cross-repository package consumers;
- arbitrary nested workspace systems;
- arbitrary task-runner support;
- every TypeScript project-reference pattern;
- every path-alias pattern;
- framework-specific liveness conventions;
- public package API removal;
- published package consumer discovery;
- JavaScript-only monorepos;
- Python monorepos;
- mixed-language remediation;
- dependency removal;
- package deletion;
- workspace deletion;
- automatic package configuration changes;
- automatic remediation authorization;
- direct default-branch publication;
- pull-request merge;
- enterprise-scale validation.

Unsupported behavior must produce an explicit safe status.

---

## 6. Authorization prerequisites

The active Phase 3A authorization must identify applicable:

- local repository scope;
- external repository scope;
- immutable source revisions;
- workspace and package scope;
- files permitted for modification;
- test files permitted for modification;
- dependency-manifest permission;
- lockfile permission;
- migration permission;
- database-operation permission;
- runner-image permission;
- command-registry permission;
- network access;
- package-registry access;
- credential capabilities;
- remediation permission;
- publication permission;
- external cleanup permission;
- destructive-operation permission;
- required tests;
- stop conditions;
- expiration or completion boundary.

Permission to analyze one workspace package does not automatically authorize
modification of every package.

Missing permissions default to denial.

---

## 7. Required phase outputs

Phase 3A should produce applicable:

- npm workspace repository profile;
- workspace-discovery capability;
- package-inventory capability;
- package graph;
- package dependency-edge model;
- package-root model;
- package-aware source inventory;
- cross-workspace reference evidence;
- package export evidence;
- TypeScript project-reference evidence;
- path-alias evidence;
- workspace coverage profile;
- package-specific qualification results;
- package-specific baseline results;
- aggregate repository baseline result;
- isolated remediation workflow;
- package-aware patch validation;
- additive database migrations;
- audit events;
- phase test manifest;
- capability-matrix updates;
- security-control updates;
- phase-completion report;
- updated execution state.

---

## 8. Capability identifiers

Phase 3A should define or update capability identifiers such as:

```text
repository.npm-workspace.qualify.v1
workspace.npm.discover.v1
workspace.npm.package-inventory.v1
workspace.npm.package-graph.v1
workspace.npm.package-roots.v1
analysis.typescript.cross-workspace-references.v1
analysis.typescript.package-exports.v1
analysis.typescript.project-references.v1
analysis.typescript.path-aliases.v1
coverage.typescript.npm-workspace.v1
verification.npm-workspace.package-gates.v1
verification.npm-workspace.aggregate-gates.v1
remediation.typescript.npm-workspace.private-function-delete.v1
```

The final identifiers may differ if the capability schema requires another
naming convention.

Every identifier must remain narrow, stable, versioned, and testable.

---

## 9. Supported repository profile

The initial supported npm workspace profile should require:

- one Git repository;
- one root npm package;
- one supported npm lockfile;
- one supported workspace declaration;
- a finite discoverable set of workspace packages;
- supported TypeScript projects;
- deterministic dependency installation;
- resolvable package-local tools;
- no required pnpm or Yarn behavior;
- no inaccessible workspace package;
- no unsupported nested workspace boundary;
- no unresolved external package consumer required for the finding;
- available required package and repository gates.

A repository outside this profile must not be forced through the workflow.

---

## 10. Workspace qualification statuses

Workspace qualification should use explicit statuses such as:

- `ready`;
- `ready_with_limited_packages`;
- `configuration_required`;
- `baseline_broken`;
- `partially_supported`;
- `unsupported`;
- `inaccessible`;
- `failed`;
- `stale`;
- `security_blocked`;
- `authorization_rejected`.

A workspace repository must not be reported as fully ready when any required
package is unavailable, unsupported, failed, or unqualified.

---

## 11. `ready`

A workspace repository is `ready` only when:

- repository identity is verified;
- immutable source resolution succeeds;
- npm workspace structure is supported;
- all required workspace packages are discovered;
- package identities are unambiguous;
- the package graph is complete for the supported profile;
- required TypeScript projects are supported;
- required tools are available;
- required commands are mapped;
- required baseline gates are available;
- required security controls are enforced;
- no required package remains failed, inaccessible, or unsupported.

`Ready` does not authorize remediation or publication.

---

## 12. `ready_with_limited_packages`

A repository may be `ready_with_limited_packages` only when:

- unsupported or excluded packages are explicitly identified;
- those packages cannot contain relevant evidence for the requested capability;
- the workspace coverage profile permits the exclusion;
- detection or remediation boundaries are explicit;
- no required package is omitted.

If an unsupported package may reference the target symbol or package, the
finding must remain inconclusive.

This status must not be used to hide partial required coverage.

---

## 13. Workspace declaration discovery

Workspace discovery should inspect applicable trusted observations from:

- the root `package.json`;
- supported workspace declaration forms;
- the npm lockfile;
- package manifests;
- trusted repository configuration;
- normalized filesystem discovery.

Repository documentation may provide supporting context but must not be the
authoritative workspace definition.

Every discovery source must retain provenance.

---

## 14. Workspace declaration forms

The supported workspace declaration forms must be explicit.

Qualification should record:

- declaration location;
- declaration syntax;
- workspace patterns;
- exclusions where supported;
- normalized patterns;
- configuration digest;
- profile version.

An unknown or unsupported declaration form must produce
`configuration_required` or `unsupported`.

It must not be interpreted approximately.

---

## 15. Workspace-pattern validation

Workspace patterns must be validated before filesystem traversal.

Validation must reject or constrain applicable:

- absolute paths;
- parent-directory traversal;
- null bytes;
- unsupported glob syntax;
- symbolic-link escapes;
- patterns outside the repository;
- unbounded recursive traversal;
- patterns that include dependency caches;
- patterns that include prohibited host paths.

Pattern expansion must remain repository-scoped and bounded.

---

## 16. Package discovery

For every workspace package, DCAv2 should retain:

- package ID;
- repository ID;
- source snapshot ID;
- workspace root;
- repository-relative package root;
- manifest path;
- package name;
- package version;
- private status;
- package type;
- workspace membership source;
- language profile;
- TypeScript configuration;
- source roots;
- test roots;
- generated roots;
- support status.

Package identity must not rely only on package name.

---

## 17. Canonical package identity

A package identity should bind applicable:

- repository identity;
- source commit;
- package root;
- manifest occurrence;
- package name;
- workspace profile;
- package-content digest.

Two packages with the same display name but different roots must remain
distinct.

A package that moves to a new root should receive a new source occurrence even
when its package name remains unchanged.

---

## 18. Duplicate package names

Duplicate package names must be detected.

Qualification must not silently select one package when several packages declare
the same name.

A duplicate may produce:

- `configuration_required`;
- `unsupported`;
- `failed`;

depending on the profile and whether identity remains unambiguous.

The package graph must not collapse duplicate package names into one node.

---

## 19. Root package

The repository root package must be represented explicitly.

The root package may be:

- a workspace coordinator only;
- a build package;
- an application package;
- a publishable package;
- a private package;
- a package containing source.

Root-package behavior must not be inferred solely from its location.

Its dependencies, scripts, source roots, and gates must be modeled like other
packages where applicable.

---

## 20. Nested package manifests

Package manifests may exist outside the declared workspace set.

Qualification must distinguish:

- declared workspace package;
- nested fixture package;
- example package;
- generated package;
- vendored package;
- dependency package;
- unknown package-like directory.

Undeclared package manifests must not automatically become workspace members.

When an undeclared package may contain relevant source or consumers, coverage
must account for it explicitly.

---

## 21. Nested workspaces

Nested workspace roots require explicit support.

Phase 3A should initially reject or require configuration for workspace
structures in which:

- a workspace package declares another independent workspace;
- multiple root workspace definitions overlap;
- package ownership is ambiguous;
- nested lockfiles alter dependency resolution;
- commands require separate installation roots.

Nested workspaces must not be flattened silently.

---

## 22. Lockfile validation

The npm lockfile must be validated for:

- supported lockfile version;
- root package identity;
- workspace package entries;
- package locations;
- resolved dependency relationships;
- integrity metadata where available;
- consistency with manifests;
- consistency with workspace declarations.

A malformed, stale, or conflicting required lockfile must produce an explicit
qualification result.

---

## 23. Manifest and lockfile consistency

Qualification should detect applicable inconsistencies such as:

- workspace package missing from the lockfile;
- lockfile package missing from declared workspaces;
- dependency declaration missing from resolved lockfile state;
- package version mismatch;
- package root mismatch;
- unsupported lockfile entry;
- multiple lockfiles;
- lockfile modified by an unapproved installation.

The workflow must not repair the lockfile automatically unless separately
authorized.

---

## 24. Package graph

The package graph must model workspace packages as distinct nodes.

Edges may include applicable:

- runtime dependency;
- development dependency;
- peer dependency;
- optional dependency;
- TypeScript project reference;
- path-alias target;
- package export consumer;
- build dependency;
- test dependency.

Each edge must retain:

- source package;
- target package;
- edge type;
- declaration occurrence;
- resolution status;
- provenance;
- freshness.

---

## 25. Dependency-edge authority

Manifest dependency declarations and resolved package-manager state provide
different evidence.

The graph should distinguish:

- declared dependency;
- resolved workspace-local dependency;
- resolved external dependency;
- unresolved dependency;
- optional dependency;
- peer relationship;
- development-only relationship.

A declared dependency must not automatically prove a source-level reference.

A source-level reference may exist even when a manifest dependency is missing
or indirect.

---

## 26. Package graph completeness

The package graph is complete only when:

- all required workspace packages are discovered;
- required manifests are readable;
- required lockfile data is valid;
- package identities are unambiguous;
- relevant local dependency edges are resolved;
- relevant project references are resolved;
- relevant path aliases are resolved;
- no required package is inaccessible or failed.

An incomplete package graph must reduce workspace coverage.

---

## 27. Package graph digest

A deterministic package graph digest should bind applicable:

- repository identity;
- source commit;
- workspace profile;
- package nodes;
- package roots;
- manifest digests;
- lockfile digest;
- dependency edges;
- project-reference edges;
- path-alias edges;
- unresolved edges;
- excluded packages.

Changing the package graph must invalidate dependent evidence, coverage, and
remediation eligibility.

---

## 28. Package-level qualification

Each workspace package should have its own qualification result.

The result should identify:

- package identity;
- language;
- TypeScript version;
- source roots;
- test roots;
- generated roots;
- tool requirements;
- commands;
- baseline gates;
- support status;
- blockers;
- coverage role.

Repository-level readiness must be derived from the required package results.

---

## 29. Package source roots

Source-root discovery must occur per package.

A package source root should bind to:

- package identity;
- repository-relative path;
- TypeScript project;
- discovery evidence;
- inclusion status;
- generated status;
- symlink status;
- support status.

A source root must not be assigned to multiple packages ambiguously.

Shared roots require explicit profile support.

---

## 30. Package test roots

Test-root discovery must preserve package context.

A test may reference:

- source in the same package;
- source in another workspace package;
- root-level shared source;
- built package outputs;
- package exports.

Cross-workspace test references may provide liveness evidence.

They must not be ignored because the consumer is not production code unless the
classification profile explicitly defines that behavior.

---

## 31. Generated roots

Generated roots should be associated with the package that produces or consumes
them.

Qualification should distinguish:

- generated source committed to the repository;
- generated source created during a build;
- declaration output;
- compiled output;
- bundled output;
- code-generation fixtures;
- dependency caches.

Generated outputs must not be analyzed as independent authored source without
an explicit evidence rule.

Generated source must not be remediated by default.

---

## 32. Shared configuration

Workspace packages may share configuration from the repository root.

Applicable shared configuration includes:

- TypeScript base configuration;
- test configuration;
- lint configuration;
- build configuration;
- path aliases;
- compiler options.

The configuration graph must retain:

- source configuration;
- extending package configuration;
- override behavior;
- digest;
- execution requirement;
- support status.

Executable shared configuration remains untrusted and must run only in the
runner.

---

## 33. TypeScript project references

Phase 3A should support a bounded subset of TypeScript project references.

The implementation should retain:

- referencing project;
- referenced project;
- configuration occurrence;
- repository-relative target;
- resolution status;
- package association;
- build-order implication;
- evidence role.

Unsupported project-reference forms must reduce coverage or produce
`unsupported`.

---

## 34. Project-reference cycles

Project-reference cycles must be detected.

A cycle may indicate:

- invalid configuration;
- unsupported build behavior;
- a repository baseline defect;
- an intentionally supported pattern.

The workflow must not invent an ordering when the project graph is cyclic.

A required unresolved cycle must block remediation readiness.

---

## 35. Path aliases

Path-alias analysis should bind aliases to:

- declaring TypeScript configuration;
- package;
- base path;
- alias pattern;
- target patterns;
- resolved files or packages;
- ambiguity status;
- profile version.

Path-alias resolution must follow the supported TypeScript configuration
semantics.

A textual alias match must not be treated as a resolved package reference.

---

## 36. Ambiguous aliases

An alias is ambiguous when it may resolve to:

- several workspace packages;
- several source files;
- generated and authored source;
- external and workspace-local packages;
- different targets under different project configurations.

Ambiguous required alias resolution must reduce coverage.

The workflow must not select the first matching target silently.

---

## 37. Package exports

Package-export analysis should identify applicable:

- export map declaration;
- exported subpaths;
- conditional exports;
- source target;
- declaration target;
- package consumer;
- support status;
- unresolved conditions.

A symbol reachable through an exported workspace package API may be live even
when no direct relative import exists.

Unsupported export conditions must reduce coverage.

---

## 38. Public package boundaries

A package may be:

- private and internal to the workspace;
- publishable;
- externally published;
- externally consumed;
- unknown.

Phase 3A may reason about consumers inside the authorized repository.

It must not treat absence of internal consumers as proof that a publishable
package API is unused externally.

Public or externally consumable symbols should remain outside automatic
remediation unless a later profile proves consumer coverage.

---

## 39. Internal package boundaries

A package marked private may still have consumers:

- elsewhere in the workspace;
- in test packages;
- in tooling packages;
- through build configuration;
- through generated code;
- through runtime registration.

Private package status does not eliminate the need for workspace-wide reference
coverage.

---

## 40. Cross-workspace source references

Cross-workspace reference analysis should identify applicable:

- package-name imports;
- package-subpath imports;
- path-alias imports;
- relative imports crossing package roots;
- TypeScript project references;
- test imports;
- configuration references;
- build references.

Every resolved reference should retain both source and target package identity.

---

## 41. Relative imports across package roots

Relative imports crossing package boundaries may indicate:

- intentionally shared source;
- unsupported package structure;
- package encapsulation violation;
- test-only access;
- generated output access.

The workflow must identify them explicitly.

It must not assume all cross-package references use package names.

---

## 42. Import and export re-exports

Reference analysis must account for applicable:

- direct imports;
- named re-exports;
- wildcard re-exports;
- default re-exports;
- barrel modules;
- package-root exports;
- subpath exports.

A symbol re-exported through another package may be live even when direct calls
are absent.

Unsupported re-export resolution must reduce coverage.

---

## 43. Dynamic package loading

Dynamic package loading may occur through:

- dynamic imports;
- computed module names;
- runtime loaders;
- plugin systems;
- configuration-driven imports;
- dependency injection;
- framework conventions.

Unresolved dynamic loading must produce explicit uncertainty.

It must not be treated as no reference.

---

## 44. Workspace evidence

Package-aware evidence should include applicable:

- source package;
- target package;
- source file;
- target symbol;
- reference type;
- dependency-edge type;
- configuration source;
- test or production scope;
- semantic resolution;
- ambiguity;
- provenance;
- freshness.

A repository-wide reference count without package context is insufficient.

---

## 45. Evidence normalization

Tool output must be normalized into package-aware DCAv2 evidence.

Normalization must preserve:

- repository identity;
- source commit;
- workspace profile;
- package graph digest;
- source package;
- target package;
- source occurrence;
- target occurrence;
- producer;
- producer version;
- adapter version;
- evidence type;
- polarity;
- strength;
- correlation;
- ambiguity;
- raw artifact digest.

Tool-specific workspace concepts must not become authoritative policy directly.

---

## 46. Evidence freshness

Workspace evidence becomes stale when applicable:

- source commit changes;
- package manifest changes;
- lockfile changes;
- workspace declaration changes;
- package graph changes;
- TypeScript configuration changes;
- project-reference graph changes;
- path-alias configuration changes;
- package exports change;
- analyzer version changes;
- adapter semantics change;
- workspace profile changes.

Stale evidence must not satisfy classification or remediation prerequisites.

---

## 47. Workspace coverage profile

The workspace coverage profile should include required dimensions such as:

- workspace declaration discovery;
- workspace pattern expansion;
- package discovery;
- package identity;
- manifest parsing;
- lockfile validation;
- package graph construction;
- source-root discovery per package;
- test-root discovery per package;
- generated-root discovery per package;
- TypeScript project-reference resolution;
- path-alias resolution;
- package-export resolution;
- semantic reference analysis;
- dynamic-use checks;
- required package baseline readiness.

Every dimension must have an explicit status.

---

## 48. Package coverage

Each required package should have a package-coverage result.

Applicable statuses include:

- `complete`;
- `partial`;
- `failed`;
- `unsupported`;
- `unavailable`;
- `excluded`;
- `stale`;
- `not_applicable`.

A required package that is partial, failed, unsupported, unavailable, or stale
must prevent complete workspace coverage for findings it may affect.

---

## 49. Workspace coverage aggregation

Workspace coverage must be derived from package and graph coverage.

The aggregate must not be calculated as a simple percentage alone.

It should identify:

- required packages;
- completed packages;
- excluded packages;
- failed packages;
- unsupported packages;
- unresolved graph edges;
- unresolved aliases;
- unresolved exports;
- unresolved dynamic uses;
- required baseline limitations.

Any unresolved required scope must remain visible.

---

## 50. Workspace coverage digest

A deterministic workspace coverage digest should bind applicable:

- repository identity;
- source commit;
- workspace profile version;
- package graph digest;
- package coverage records;
- discovered roots;
- excluded roots;
- unresolved graph edges;
- analyzer identities;
- configuration digests;
- completion statuses.

Changing any required package or graph component must invalidate the digest.

---

## 51. Partial workspace failure

A workspace analysis may experience failure in one package while others
complete.

The result must preserve:

- completed package results;
- failed package identity;
- failure category;
- affected graph edges;
- affected findings;
- retry safety;
- aggregate coverage impact.

A failed package must not be treated as containing zero references.

---

## 52. Independent package failures

A failed package may be irrelevant to a finding only when DCAv2 can prove under
the workspace profile that the package cannot reference or expose the target.

Such proof must use:

- package graph;
- project references;
- path aliases;
- export relationships;
- source-root boundaries;
- supported dynamic-use rules.

An assumption that unrelated packages are irrelevant is insufficient.

---

## 53. Classification

The Phase 1 classification principles continue to apply.

A workspace finding may become `candidate_dead` only when:

- the symbol shape is supported;
- the target package is supported;
- repository identity is current;
- package graph identity is current;
- required workspace coverage is complete;
- required package coverage is complete;
- no dominant liveness evidence exists;
- no unresolved consumer scope remains;
- no unsupported export or alias behavior may expose the symbol;
- classification is deterministic.

A classification is not a human disposition.

---

## 54. Classification explanation

A workspace classification explanation should include:

- repository;
- source commit;
- target package;
- target symbol;
- workspace profile;
- package graph digest;
- packages analyzed;
- packages excluded;
- cross-workspace evidence;
- package export evidence;
- project-reference evidence;
- path-alias evidence;
- test evidence;
- dynamic-use uncertainty;
- coverage digest;
- policy version;
- resulting status.

The explanation must make package boundaries and incomplete scope visible.

---

## 55. Human disposition

Human disposition remains finding-specific.

The disposition must bind to:

- repository identity;
- source commit;
- target package;
- target symbol;
- package graph digest;
- evidence digest;
- workspace coverage digest;
- classification identity;
- human actor;
- timestamp.

A disposition must become stale when a relevant package or graph identity
changes materially.

---

## 56. Remediation authorization

Remediation authorization must remain separate and should bind to:

- finding ID;
- repository;
- source commit;
- target package;
- package graph digest;
- evidence digest;
- workspace coverage digest;
- human disposition;
- transformation ID;
- permitted files;
- permitted packages;
- required package gates;
- required aggregate gates;
- expiration or completion boundary.

Authorization for one package must not permit unrelated package modification.

---

## 57. Exact finding reproduction

Before transformation, DCAv2 must reacquire or reconstruct a clean authorized
source state and reproduce:

- repository identity;
- source commit;
- workspace declaration;
- package graph;
- target package;
- target symbol;
- source occurrence;
- evidence digest;
- workspace coverage digest;
- human disposition;
- remediation authorization.

Any relevant workspace graph change must block approximate reuse of the prior
finding.

---

## 58. Workspace installation

The supported npm workspace profile should define a deterministic root
installation strategy.

The installation command must identify:

- npm version;
- lockfile requirement;
- root working directory;
- development-dependency policy;
- lifecycle-script policy;
- registry profile;
- cache profile;
- timeout;
- resource limits;
- output limits;
- expected changed files.

A package-specific ad hoc installation must not silently produce a different
dependency graph.

---

## 59. Lifecycle scripts

Lifecycle-script behavior must be explicit for the entire workspace.

When scripts are disabled, qualification must identify packages that require
them.

When scripts are enabled:

- execution must occur only in the runner;
- network access must remain restricted;
- credentials must remain narrow;
- package scripts must not escape workspace boundaries;
- output and resources must remain bounded;
- generated changes must be tracked.

A script failure must remain package-attributable.

---

## 60. Workspace command routing

Commands should be routed explicitly to:

- repository root;
- one workspace package;
- a bounded set of workspace packages;
- the complete supported workspace.

Every command mapping must identify:

- command ID;
- package scope;
- working directory;
- npm invocation mode;
- arguments;
- environment;
- network profile;
- filesystem profile;
- timeout;
- resource limits;
- expected artifacts.

Repository content must not choose arbitrary package scope.

---

## 61. Package-specific commands

A package-specific command should bind to the canonical package identity rather
than only the package display name.

The executor must verify:

- package remains a workspace member;
- package root matches;
- command applies to the package;
- working directory is valid;
- selected package is within authorization;
- source commit is unchanged.

Duplicate or ambiguous names must cause rejection.

---

## 62. Root commands

Root-level commands may affect every package.

They require explicit scope and may include:

- dependency installation;
- aggregate build;
- aggregate tests;
- workspace-wide type checking;
- workspace graph generation.

A root command must not be treated as package-local merely because only one
finding is being remediated.

Its side effects and resource requirements must be tracked repository-wide.

---

## 63. Baseline gates

Phase 3A must define both package-specific and aggregate baseline gates.

Package-specific gates may include:

- package parsing;
- package type checking;
- package build;
- package lint;
- package unit tests.

Aggregate gates may include:

- root type checking;
- dependency graph validation;
- workspace build;
- workspace tests;
- integration tests;
- generated-artifact validation.

The profile must identify which gates are required for the target package and
which are required for the repository.

---

## 64. Gate dependency ordering

Gate execution order should respect the supported package graph.

The system should identify:

- prerequisite packages;
- dependent packages;
- build order;
- test order;
- parallel-safe packages;
- cyclic or ambiguous order.

DCAv2 must not invent a dependency order when graph resolution is incomplete.

An unresolved required order must block remediation readiness.

---

## 65. Broken package baselines

A package with a broken baseline must retain its failure.

The workflow should identify:

- package;
- failing gate;
- dependent packages;
- affected finding;
- whether detection-only analysis remains possible;
- whether aggregate verification remains possible;
- whether remediation is blocked.

A passing target-package test does not override a failing required dependent
package.

---

## 66. Structured transformation

The transformation remains finding-specific and package-specific.

It must bind to:

- target package;
- target source file;
- exact symbol occurrence;
- transformation version;
- expected rewrite count;
- permitted changed files;
- package graph digest;
- source digest;
- workspace coverage digest.

The transformation must not edit manifests, lockfiles, or unrelated packages
unless separately authorized.

---

## 67. Changed-file validation

Changed-file validation must consider the entire repository.

The validator must detect:

- changes in the target package;
- changes in other workspace packages;
- root manifest changes;
- lockfile changes;
- generated output changes;
- configuration changes;
- file-mode changes;
- symbolic-link changes;
- binary changes.

Any file outside the authorized set must cause failure.

---

## 68. Post-change gates

Post-change verification should repeat applicable package-specific and aggregate
gates.

The workflow must verify:

- target package still passes;
- dependent workspace packages still pass;
- aggregate graph remains valid;
- required root gates pass;
- no new diagnostic appears;
- no unexpected generated output appears;
- changed files remain authorized;
- patch remains deterministic.

A target-package-only pass is insufficient when other packages may consume the
changed source.

---

## 69. Dependent-package testing

The package graph should identify which packages require post-change testing.

The selected dependent set must account for applicable:

- runtime dependencies;
- development dependencies;
- TypeScript project references;
- path aliases;
- package exports;
- test consumers;
- build consumers.

The selection logic must be deterministic and included in test evidence.

Unknown dependent scope requires broader testing or blocks remediation.

---

## 70. Aggregate gate comparison

Baseline and post-change comparisons should identify:

- target package changes;
- dependent package changes;
- repository aggregate changes;
- newly introduced failures;
- unchanged pre-existing failures;
- resolved failures;
- changed test counts;
- changed build artifacts;
- unavailable gates.

A failing aggregate baseline requires explicit policy before remediation can
continue.

---

## 71. Patch generation

The patch record should include workspace-specific identity such as:

- repository;
- base commit;
- target package;
- package graph digest;
- finding;
- remediation attempt;
- transformation;
- changed files;
- package gate results;
- aggregate gate results;
- patch hash;
- workspace coverage digest;
- secret-scan result.

Patch generation does not authorize publication.

---

## 72. Publication

When separately authorized, publication must continue through the trusted
publisher.

The publisher must validate:

- repository identity;
- prohibited-repository policy;
- base commit;
- target package identity;
- package graph digest;
- finding identity;
- human disposition;
- remediation authorization;
- workspace coverage digest;
- package and aggregate gates;
- patch hash;
- repository-wide changed-file set;
- draft-only operation.

The publisher must not execute workspace builds or package-manager commands.

---

## 73. Database evolution

Phase 3A may persist concepts such as:

- workspace profiles;
- workspace-discovery results;
- packages;
- package roots;
- package graph nodes;
- package graph edges;
- project-reference edges;
- alias-resolution records;
- package-export records;
- package coverage;
- workspace coverage;
- package gate results;
- aggregate gate results.

Persistence changes must use additive ordered migrations.

Historical single-package records must remain interpretable.

---

## 74. Migration compatibility

Migration testing should include:

- fresh installation;
- upgrade from the Phase 2 schema;
- existing single-package records;
- workspace repository records;
- duplicate package names;
- unresolved graph edges;
- partial package results;
- multiple tenants;
- migration failure;
- retry;
- projection rebuild;
- audit preservation.

Existing migrations must not be rewritten.

---

## 75. Audit requirements

Phase 3A should produce audit events for applicable:

- workspace qualification requested;
- workspace detected;
- package discovered;
- duplicate package rejected;
- package graph created;
- graph edge unresolved;
- package qualification completed;
- package qualification failed;
- workspace coverage completed;
- workspace coverage partial;
- package gate started;
- package gate completed;
- aggregate gate started;
- aggregate gate completed;
- cross-workspace reference recorded;
- finding classified;
- remediation reproduced;
- package-scoped transformation completed;
- unexpected file rejected;
- patch created;
- publication requested;
- cleanup completed;
- cleanup failed.

Audit events must remain tenant-scoped and secret-free.

---

## 76. Runner requirements

Workspace commands must execute in an approved untrusted runner profile.

The profile must enforce applicable:

- non-root execution;
- no privileged mode;
- no Docker socket;
- no trusted credentials;
- environment allowlisting;
- repository-scoped mounts;
- package-registry-only network when installation is required;
- network-disabled analysis and gates where possible;
- CPU limits;
- memory limits;
- process limits;
- disk limits;
- timeouts;
- output limits;
- process-tree cleanup;
- workspace cleanup.

A monorepo's larger resource requirements must not cause unbounded limits.

---

## 77. Cache isolation

Workspace dependency caches must be keyed by applicable:

- tenant;
- package manager;
- npm version;
- lockfile digest;
- operating system;
- architecture;
- registry identity;
- runner profile.

A cache must not:

- bypass lockfile verification;
- expose private packages across tenants;
- contain trusted credentials;
- override package integrity;
- become a trusted executable source without validation.

Cache poisoning tests should be included when shared caches are used.

---

## 78. Credential boundaries

Phase 3A may require:

- provider read credentials;
- private registry read credentials;
- trusted publisher credentials.

These capabilities must remain separated.

The runner must never receive trusted publisher credentials or controller
database credentials.

A root workspace install must not receive broader registry credentials than the
authorized package scopes require.

---

## 79. Prompt-injection resistance

Instructions found in:

- root documentation;
- package documentation;
- package manifests;
- workspace configuration;
- build output;
- analyzer output;
- test output;
- generated artifacts;

must remain untrusted data.

They must not:

- change package scope;
- add trusted commands;
- request credentials;
- broaden network access;
- exclude required packages;
- mark failed packages complete;
- create disposition;
- authorize remediation;
- trigger publication;
- modify governance.

---

## 80. Secret handling

Workspace repositories may contain secret-bearing configuration at root or
package scope.

DCAv2 must avoid exposing secret values through:

- package-manager configuration;
- registry URLs;
- environment files;
- command output;
- test output;
- generated artifacts;
- patches;
- publication text;
- audit events.

Synthetic secret tests should cover both root and package-level paths.

---

## 81. Phase 3A test manifest

Phase 3A should receive a dedicated test manifest such as:

`codex/tests/phase-3a-tests.yaml`

If introduced, the file must conform to:

`codex/tests/phase-test-manifest.schema.json`

The manifest must identify concrete required and conditional test IDs.

The phrase “run relevant tests” is insufficient.

---

## 82. Minimum workspace-discovery tests

Workspace-discovery tests should cover:

- supported workspace declaration;
- several workspace patterns;
- empty workspace pattern;
- unmatched pattern;
- duplicate package root;
- overlapping workspace patterns;
- nested workspace;
- package outside declared workspace;
- symbolic-link escape;
- dependency directory exclusion;
- generated package directory;
- malformed root manifest;
- conflicting lockfiles;
- alternate repository and package names.

---

## 83. Minimum package-identity tests

Package-identity tests should cover:

- unique package name and root;
- duplicate package name;
- package renamed;
- package moved;
- package manifest changed;
- root package;
- private package;
- publishable package;
- missing package name;
- malformed manifest;
- package path case variation;
- package identity across repeated analysis.

Package identity must remain deterministic.

---

## 84. Minimum graph tests

Package-graph tests should cover:

- direct workspace dependency;
- development dependency;
- peer dependency;
- optional dependency;
- root-to-package dependency;
- package-to-root dependency;
- unresolved local dependency;
- dependency cycle;
- missing package;
- duplicate package name;
- stale lockfile;
- manifest and lockfile disagreement;
- graph determinism under file-order variation.

---

## 85. Minimum project-reference tests

Project-reference tests should cover:

- direct project reference;
- transitive project reference;
- missing referenced project;
- reference outside the repository;
- reference cycle;
- package-root mismatch;
- referenced generated project;
- unsupported configuration;
- stale reference after package move;
- different path separators.

Unresolved required references must reduce coverage.

---

## 86. Minimum alias tests

Path-alias tests should cover:

- alias to same-package source;
- alias to another workspace package;
- wildcard alias;
- several targets;
- ambiguous target;
- missing target;
- target outside repository;
- generated target;
- conflicting package configurations;
- alias changed after analysis;
- textual match without semantic resolution.

---

## 87. Minimum export tests

Package-export tests should cover:

- direct package root export;
- subpath export;
- re-export;
- wildcard re-export;
- unsupported conditional export;
- missing export target;
- generated declaration target;
- private package without exports;
- publishable package with unknown external consumers;
- export changed after analysis.

Unknown public consumer scope must block automatic public API remediation.

---

## 88. Minimum reference tests

Cross-workspace reference tests should cover:

- direct package import;
- subpath import;
- path-alias import;
- relative cross-package import;
- test-package import;
- build-tool import;
- re-export through another package;
- dynamic import;
- computed import;
- comment-only occurrence;
- string-only occurrence;
- analyzer failure in a consumer package;
- stale consumer package result.

---

## 89. Minimum coverage tests

Workspace coverage tests should cover:

- all packages complete;
- one required package partial;
- one required package failed;
- one unsupported but provably irrelevant package;
- one unsupported possibly relevant package;
- unresolved graph edge;
- unresolved alias;
- unresolved export;
- missing test root;
- stale package graph;
- changed workspace declaration;
- package added after analysis;
- package removed after analysis.

Complete coverage must require all relevant scope.

---

## 90. Minimum command tests

Workspace command tests should cover:

- root installation;
- package-specific command;
- aggregate command;
- duplicate package-name rejection;
- wrong package root;
- command outside authorization;
- repository script with shell metacharacters;
- unmapped script;
- missing local executable;
- host-global executable present;
- timeout;
- resource exhaustion;
- process-tree cleanup;
- unexpected file modification.

---

## 91. Minimum baseline tests

Baseline tests should cover:

- all package gates pass;
- target package fails;
- dependent package fails;
- unrelated package fails but is provably irrelevant;
- aggregate build fails;
- aggregate tests fail;
- required gate unavailable;
- optional gate unavailable;
- dependency installation fails;
- lifecycle script fails;
- lockfile changes during install;
- output truncation;
- cleanup failure.

Remediation readiness must remain conservative.

---

## 92. Minimum classification tests

Classification tests should verify:

- no references anywhere in complete workspace coverage;
- reference from same package;
- reference from another package;
- test-only cross-package reference;
- package re-export;
- path-alias reference;
- unresolved dynamic import;
- failed consumer package;
- unknown external public consumer;
- stale package graph;
- evidence input-order independence;
- positive evidence dominance.

---

## 93. Minimum remediation tests

Remediation tests should cover:

- exact target package and function;
- wrong package with same symbol name;
- package moved;
- package graph changed;
- new dependent package added;
- target file changed;
- unauthorized package file changed;
- root manifest changed;
- lockfile changed;
- dependent package gate fails after change;
- aggregate gate fails;
- deterministic patch;
- idempotent transformation;
- stale authorization.

---

## 94. Minimum publisher tests

Publisher tests should cover:

- exact target package;
- wrong package identity;
- stale package graph digest;
- stale workspace coverage digest;
- missing dependent-package gate;
- missing aggregate gate;
- unexpected root file change;
- unexpected other-package change;
- wrong patch hash;
- default-branch rejection;
- draft pull-request creation;
- idempotent retry;
- partial provider state;
- Git-hook suppression.

Live provider tests require separate authorization.

---

## 95. Minimum migration tests

Migration tests should cover:

- fresh database;
- upgrade from Phase 2;
- existing single-package findings;
- workspace packages;
- duplicate package names;
- unresolved graph edges;
- partial package coverage;
- historical classifications;
- multiple tenants;
- failed migration;
- retry;
- projection rebuild;
- audit-chain preservation.

---

## 96. Minimum security tests

Security tests should cover:

- workspace cannot access unrelated repositories;
- one package cannot escape the repository workspace;
- symbolic-link package root is rejected;
- root lifecycle script cannot access trusted credentials;
- package lifecycle script cannot access publisher credentials;
- private registry scope is enforced;
- Docker socket is unavailable;
- cloud metadata is unavailable;
- network profile is enforced;
- output is bounded;
- process limits apply across package workers;
- background processes are terminated;
- cache does not cross tenant boundaries.

---

## 97. Fixture strategy

Phase 3A should use fixtures representing:

- small supported npm workspace;
- root coordinator plus application package;
- library plus consumer package;
- test-only consumer package;
- path-alias consumer;
- project-reference graph;
- package re-export;
- duplicate package names;
- cyclic dependency graph;
- broken package baseline;
- partial package failure;
- malicious lifecycle script;
- symbolic-link escape;
- alternate repository and package names.

Production behavior must not contain fixture-specific branches.

---

## 98. Scale boundary

Phase 3A establishes functional behavior for bounded npm workspaces.

The phase report must state tested limits such as:

- package count;
- file count;
- symbol count;
- project-reference count;
- graph-edge count;
- execution duration;
- peak memory;
- disk use;
- artifact size.

Phase 3A must not claim enterprise-scale monorepo validation.

Broader scale validation belongs to Phase 10.

---

## 99. Capability acceptance criteria

The npm workspace capability may become `functional` only when:

1. Workspace discovery is deterministic.
2. Package identities are unambiguous.
3. Duplicate package names fail safely.
4. Lockfile and manifest consistency is evaluated.
5. Package graph construction is deterministic.
6. Required project references are resolved.
7. Required path aliases are resolved.
8. Required package exports are resolved.
9. Cross-workspace references preserve package context.
10. Package-level coverage is explicit.
11. Workspace-level coverage is explicit.
12. Partial package failures reduce coverage.
13. Required package baselines pass.
14. Required aggregate baselines pass.
15. Exact package-scoped reproduction is enforced.
16. Transformation remains package-scoped.
17. Repository-wide changed files are validated.
18. Dependent-package gates pass.
19. Aggregate post-change gates pass.
20. Required runner controls pass.
21. Required migrations pass.
22. Required Phase 3A tests pass.
23. Generalization beyond one fixture is demonstrated.

---

## 100. Detection-only outcome

Phase 3A may validly provide detection-only workspace support when:

- workspace discovery is functional;
- package graph construction is functional;
- cross-workspace evidence is functional;
- required coverage can be evaluated;
- classification is conservative;
- remediation gates or transformation remain unavailable;
- unsupported remediation behavior is explicit;
- the authorized scope permits detection-only completion.

Detection-only support must not be reported as workspace remediation support.

---

## 101. Blocked outcome

Phase 3A must remain blocked when applicable:

- workspace structure is ambiguous;
- package identity is ambiguous;
- required lockfile state is inconsistent;
- required package is inaccessible;
- required graph edge is unresolved;
- required project reference is unsupported;
- required alias is ambiguous;
- public consumer scope is unknown for a public symbol;
- package baseline is broken;
- aggregate baseline is broken;
- required runner controls fail;
- required tool licensing is unresolved;
- migration tests fail;
- tenant isolation fails;
- required tests fail or are unavailable;
- authorization expires or is revoked.

A blocked result must identify the exact safe next action.

---

## 102. Phase completion criteria

Phase 3A may be reported complete only when all applicable criteria are
satisfied:

1. npm workspace qualification is implemented.
2. Workspace discovery is implemented.
3. Package inventory is implemented.
4. Package identity is deterministic.
5. Package graph construction is implemented.
6. Lockfile consistency is evaluated.
7. Source, test, and generated roots are package-aware.
8. Project references are handled for the supported profile.
9. Path aliases are handled for the supported profile.
10. Package exports are handled for the supported profile.
11. Cross-workspace references are normalized.
12. Package coverage is implemented.
13. Workspace coverage is implemented.
14. Partial failures preserve uncertainty.
15. Package baseline gates are implemented.
16. Aggregate baseline gates are implemented.
17. Exact reproduction is package-aware.
18. Transformation is package-scoped.
19. Repository-wide changed-file validation passes.
20. Dependent-package post-change gates pass.
21. Aggregate post-change gates pass.
22. Required database migrations pass.
23. Required security controls pass.
24. Required Phase 3A tests pass.
25. Triggered conditional tests pass.
26. Capability statuses are updated truthfully.
27. Security-control matrix is updated.
28. Phase report is complete.
29. Execution state is updated.
30. No unresolved blocker contradicts completion.

---

## 103. Phase report

The Phase 3A completion report should include:

- authorization identity;
- objective;
- source commit before and after;
- files changed;
- migrations;
- dependencies;
- npm version;
- lockfile versions;
- workspace profile;
- package count;
- package identities;
- package graph;
- project-reference support;
- path-alias support;
- package-export support;
- cross-workspace evidence;
- package coverage;
- workspace coverage;
- package baselines;
- aggregate baselines;
- remediation result;
- changed files;
- post-change gates;
- patch identity;
- publication result;
- security controls;
- tests;
- fixtures;
- measured scale;
- capability-status changes;
- limitations;
- blockers;
- cleanup;
- next safe action.

The report must not describe npm workspace support as universal monorepo
support.

---

## 104. Execution-state handoff

The Phase 3A handoff should identify:

- phase status;
- authorization status;
- source commit;
- worktree state;
- supported npm workspace profile;
- unsupported workspace forms;
- package graph capability;
- project-reference capability;
- path-alias capability;
- package-export capability;
- test manifest;
- test results;
- security-control results;
- migrations;
- external operations;
- retained external state;
- cleanup state;
- next human decision.

The handoff must not authorize Phase 3B.

---

## 105. Transition to Phase 3B

Phase 3B may be proposed when npm workspace support is bounded and the
qualification system can detect pnpm repositories explicitly.

Before Phase 3B begins:

1. Finalize the Phase 3A report.
2. Update execution state.
3. Stop Phase 3A implementation.
4. Present actual npm workspace capability statuses.
5. Record unsupported pnpm behavior.
6. Prepare a Phase 3B authorization.
7. Obtain explicit human approval.

Phase 3B must not start automatically.

---

## 106. Phase stop conditions

Work must stop when:

- Phase 3A authorization is inactive;
- authorization expires;
- authorization is revoked;
- repository or package scope is exceeded;
- an excluded repository target operation is requested;
- repository identity cannot be verified;
- immutable source resolution fails;
- workspace identity is ambiguous;
- package graph completeness cannot be established;
- required package access is unavailable;
- required tool licensing is unresolved;
- required registry access is unauthorized;
- required runner controls fail;
- a destructive migration would be required without permission;
- a required test fails or is unavailable;
- tenant isolation fails;
- exact finding reproduction fails;
- workspace coverage becomes incomplete;
- dominant liveness evidence appears;
- changed files exceed package or repository authorization;
- secret exposure is suspected;
- local user work cannot be preserved;
- external state becomes unknown and cannot be reconciled safely.

Stopping must be recorded truthfully.

---

## 107. Fail-safe behavior

When workspace structure, package identity, graph completeness, reference
resolution, coverage, baseline state, remediation authorization, transformation,
verification, or publication state cannot be established confidently:

- do not report complete workspace support;
- do not treat failed packages as empty;
- do not exclude possibly relevant packages;
- do not infer package relationships;
- do not classify the finding as safely removable;
- do not modify source;
- do not change manifests or lockfiles;
- do not generate a publication-eligible patch;
- do not publish;
- preserve available evidence;
- return an explicit partial, unsupported, failed, stale, configuration-required,
  or blocked result;
- identify the exact missing requirement.

Workspace uncertainty must reduce classification, remediation, and publication
authority.

---

## 108. Document integrity

This roadmap file must not be modified during Phase 3A implementation unless
roadmap or governance modification is explicitly authorized.

Changes require:

1. Identification of the Phase 3A planning problem.
2. Review against the roadmap overview.
3. Review against permanent safety invariants.
4. Review of workspace and package-identity implications.
5. Review of graph, evidence, and coverage implications.
6. Review of remediation and publication implications.
7. Review of authorization and testing impact.
8. Updated Phase 3A test manifest where applicable.
9. Updated schemas or capability definitions where applicable.
10. A reviewable governance commit.
11. An ADR when the change alters long-lived workspace, package graph,
    cross-package evidence, or remediation semantics.

This roadmap must not be weakened to make incomplete workspace discovery,
failed packages, unresolved graph edges, broken gates, failed tests, or unsafe
cross-package remediation appear acceptable.
