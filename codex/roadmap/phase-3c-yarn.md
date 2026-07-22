# Phase 3C — Yarn

This document defines the planned scope, capability boundaries, evidence
requirements, tests, stop conditions, and completion criteria for Phase 3C of
DCAv2.

Phase 3C adds bounded Yarn support while treating materially different Yarn
operating modes as separate capabilities.

The phase must distinguish at least:

- Yarn Classic;
- Yarn Berry using `node_modules`;
- Yarn Berry using Plug'n'Play.

Successful behavior in one mode must not be generalized to another.

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
  id: phase-3c-yarn
  name: Yarn
  roadmap_order: 3C
  default_status: inactive
  implementation_authorized_by_this_file: false
```

The phase becomes active only when the current authorization record explicitly
identifies `phase-3c-yarn` as active.

---

## 2. Primary objective

The primary objective is to qualify, analyze, and verify supported Yarn
repositories while preserving:

1. Deterministic Yarn mode detection.
2. Deterministic Yarn version resolution.
3. Immutable source identity.
4. Workspace package identity.
5. Lockfile identity.
6. Package graph completeness.
7. Correct dependency-resolution semantics.
8. Mode-specific executable resolution.
9. Package-aware evidence and coverage.
10. Restricted registry and cache behavior.
11. Safe lifecycle-script execution.
12. Package-specific and aggregate verification.
13. Exact remediation reproduction.
14. Repository-wide changed-file validation.
15. Trusted draft publication when separately authorized.

Yarn support must be validated independently from npm and pnpm support.

---

## 3. Intended capability

The intended capability is conceptually:

```text
Qualify and analyze a supported Yarn repository, determine its Yarn generation
and dependency-resolution mode, construct an accurate workspace package graph,
collect package-aware TypeScript evidence, and safely remediate a supported
private function only when all required mode-specific coverage and verification
requirements are satisfied.
```

The capability must remain constrained by:

- supported Yarn generations;
- supported Yarn versions;
- supported lockfile formats;
- supported workspace declarations;
- supported linker modes;
- supported plugin requirements;
- supported cache and zero-install behavior;
- supported TypeScript versions;
- complete required workspace coverage;
- deterministic installation or dependency-state validation;
- isolated execution;
- exact finding reproduction;
- package and repository gates;
- trusted publication boundaries.

---

## 4. Phase prerequisites

Phase 3C should not begin until earlier phases have established or bounded:

- canonical repository identity;
- immutable source acquisition;
- package-manager detection;
- workspace discovery;
- package identity;
- package graph construction;
- package-aware evidence;
- package-aware coverage;
- package-specific command routing;
- package-specific and aggregate gates;
- package-scoped remediation;
- repository-wide changed-file validation;
- package-manager-specific security and cache policies.

The qualification system must be able to distinguish Yarn repositories from npm
and pnpm repositories before Phase 3C begins.

---

## 5. Separate Yarn capabilities

Phase 3C must treat these as separate capability profiles:

### Yarn Classic

Typically includes:

- Yarn 1.x;
- `yarn.lock`;
- `node_modules`;
- Classic workspace behavior;
- Classic configuration files and command semantics.

### Yarn Berry with `node_modules`

Typically includes:

- modern Yarn releases;
- `.yarnrc.yml`;
- project-local Yarn releases or Corepack resolution;
- `nodeLinker: node-modules`;
- Berry workspace and lockfile semantics.

### Yarn Berry with Plug'n'Play

Typically includes:

- modern Yarn releases;
- `.yarnrc.yml`;
- Plug'n'Play resolution;
- `.pnp.cjs` or equivalent supported loader artifacts;
- virtual filesystem or archive-backed package access;
- mode-specific tooling integration.

Each profile must have an independent support status.

---

## 6. Non-goals

Phase 3C does not, by default, include:

- universal support for every Yarn release;
- universal support for every Yarn plugin;
- every Plug'n'Play loader format;
- every Yarn linker implementation;
- every workspace tool;
- arbitrary package-manager abstraction;
- Bun or another unrelated package manager;
- cross-repository package consumers;
- public API removal;
- package deletion;
- workspace deletion;
- dependency removal;
- automatic Yarn migration;
- automatic Classic-to-Berry migration;
- automatic linker-mode conversion;
- automatic lockfile regeneration;
- automatic plugin installation;
- framework-specific liveness conventions;
- mixed-language remediation;
- direct default-branch publication;
- pull-request merge;
- enterprise-scale validation.

Unsupported Yarn behavior must produce an explicit safe status.

---

## 7. Authorization prerequisites

The active Phase 3C authorization must identify applicable:

- local repository scope;
- external repository scope;
- immutable source revisions;
- workspace and package scope;
- files permitted for modification;
- manifest permission;
- lockfile permission;
- Yarn configuration permission;
- project-local Yarn binary permission;
- plugin permission;
- dependency-installation permission;
- lifecycle-script permission;
- cache or zero-install permission;
- migration permission;
- database-operation permission;
- runner-image permission;
- command-registry permission;
- registry network access;
- private-registry credential capabilities;
- remediation permission;
- publication permission;
- external cleanup permission;
- destructive-operation permission;
- required tests;
- stop conditions;
- expiration or completion boundary.

Permission to run Yarn does not automatically permit lockfile, cache, plugin,
configuration, or linker-mode changes.

Missing permissions default to denial.

---

## 8. Required phase outputs

Phase 3C should produce applicable:

- Yarn generation detection;
- Yarn version resolution;
- Yarn Classic repository profiles;
- Yarn Berry `node_modules` profiles;
- Yarn Plug'n'Play profiles;
- Yarn lockfile parsing;
- workspace discovery;
- package graph construction;
- linker-mode detection;
- project-local binary validation;
- Corepack behavior;
- plugin inventory;
- cache and zero-install policy;
- Plug'n'Play loader validation;
- package-aware evidence and coverage;
- Yarn command mappings;
- workspace-selection policy;
- deterministic installation or dependency-state validation;
- package and aggregate baseline gates;
- package-aware remediation verification;
- additive database migrations;
- audit events;
- phase test manifest;
- capability-matrix updates;
- security-control updates;
- phase-completion report;
- updated execution state.

---

## 9. Capability identifiers

Phase 3C should define or update capability identifiers such as:

```text
repository.yarn.qualify.v1
repository.yarn-classic.qualify.v1
repository.yarn-berry-node-modules.qualify.v1
repository.yarn-berry-pnp.qualify.v1
workspace.yarn.discover.v1
workspace.yarn.package-inventory.v1
workspace.yarn.package-graph.v1
dependency.yarn.install-immutable.v1
dependency.yarn.cache-validate.v1
dependency.yarn.zero-install-validate.v1
dependency.yarn.pnp-loader-validate.v1
workspace.yarn.focus-route.v1
analysis.typescript.yarn-workspace-references.v1
coverage.typescript.yarn-workspace.v1
verification.yarn.package-gates.v1
verification.yarn.aggregate-gates.v1
remediation.typescript.yarn-workspace.private-function-delete.v1
```

The final identifiers may differ if the capability schema requires another
naming convention.

Every identifier must remain narrow, versioned, and testable.

---

## 10. Qualification statuses

Yarn qualification should use explicit statuses such as:

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

A repository must not be reported as ready merely because `yarn.lock` exists.

---

## 11. `ready`

A Yarn repository is `ready` only when:

- repository identity is verified;
- immutable source resolution succeeds;
- Yarn generation is unambiguous;
- Yarn version is supported;
- lockfile format is supported;
- workspace configuration is supported;
- linker mode is supported;
- required plugins are supported and available;
- all required packages are discovered;
- package identities are unambiguous;
- the package graph is complete;
- required tools are available;
- required command mappings exist;
- required baseline gates are available;
- required security controls are enforced;
- no required package remains failed, inaccessible, or unsupported.

`Ready` does not authorize analysis, remediation, or publication.

---

## 12. Yarn identification

Yarn detection should use attributable signals such as:

- `yarn.lock`;
- package-manager declarations;
- `.yarnrc`;
- `.yarnrc.yml`;
- project-local Yarn release configuration;
- `.yarn/releases/`;
- `.pnp.cjs`;
- `.pnp.loader.mjs`;
- `.yarn/cache/`;
- approved Corepack configuration;
- trusted operator configuration.

The result should identify:

- package manager;
- Yarn generation;
- declared version;
- resolved version;
- lockfile format;
- linker mode;
- workspace presence;
- plugin requirements;
- confidence;
- conflicting indicators;
- support status.

---

## 13. Conflicting package-manager indicators

Qualification must detect conflicts such as:

- Yarn and npm lockfiles together;
- Yarn and pnpm lockfiles together;
- package metadata declares npm or pnpm while Yarn files exist;
- Yarn Classic and Berry configuration mixed ambiguously;
- nested packages use independent package managers;
- stale package-manager migration files;
- multiple installation roots.

The workflow must not select Yarn silently when material conflicts exist.

The result should be:

- `configuration_required`;
- `partially_supported`;
- or `unsupported`;

depending on the supported profile and trusted configuration.

---

## 14. Yarn generation detection

Generation detection must be deterministic.

The implementation should distinguish:

- Yarn Classic;
- Yarn Berry;
- ambiguous or mixed state;
- unsupported future format.

Signals must be interpreted together.

For example, the presence of `.yarnrc.yml` may support a Berry conclusion, but
the complete qualification result must also account for:

- resolved Yarn version;
- project-local release configuration;
- lockfile format;
- linker mode;
- available loader artifacts;
- plugin configuration.

---

## 15. Yarn version resolution

The Yarn version must be resolved deterministically.

Approved resolution sources may include:

- package-manager declaration;
- project-local Yarn release;
- approved Corepack resolution;
- approved runner-image tool;
- trusted repository configuration.

The result should record:

- declared version;
- project-local version;
- resolved version;
- executable identity;
- resolution method;
- content digest when project-local;
- compatibility status;
- mismatch status.

---

## 16. Project-local Yarn releases

A project-local Yarn binary is repository-controlled executable content.

Before use, DCAv2 must validate:

- repository-relative configured path;
- path remains inside the source snapshot;
- file type;
- content digest;
- expected Yarn version;
- executable invocation method;
- source provenance where available;
- authorization;
- runner-only execution.

A project-local Yarn release must never execute in the trusted controller or
publisher.

---

## 17. Project-local binary mismatch

Qualification must fail safely when:

- the configured binary is missing;
- the binary path escapes the repository;
- the file digest changes after qualification;
- the reported version does not match the declared version;
- the file is malformed;
- the loader cannot execute safely;
- the path resolves through an unsafe symbolic link.

The workflow must not fall back silently to a host-global Yarn executable.

---

## 18. Corepack behavior

When Corepack is used, the command definition must specify:

- Corepack identity;
- Corepack version;
- package-manager declaration requirements;
- download behavior;
- network profile;
- cache behavior;
- integrity or signature checks where supported;
- executable resolution;
- failure behavior.

Corepack must not activate an arbitrary Yarn version outside the approved
version policy.

---

## 19. Host-global Yarn fallback

DCAv2 must not silently use an undeclared host-global Yarn executable.

A missing approved Yarn version must produce:

- `configuration_required`;
- `unsupported`;
- or `unavailable`.

Tests must verify that host-global Yarn cannot satisfy a missing approved tool
inside the runner.

---

## 20. Lockfile identity

Every Yarn analysis should bind to an exact lockfile identity.

Applicable fields include:

- repository-relative path;
- content digest;
- detected lockfile generation or format;
- source commit;
- parser version;
- Yarn version;
- repository profile;
- parse status;
- compatibility status.

A lockfile change must invalidate dependent qualification, package graph,
coverage, and remediation records.

---

## 21. Supported lockfile formats

Supported Yarn lockfile formats must be explicit.

For every supported format, DCAv2 should define:

- parser implementation;
- resolution semantics;
- workspace relationship semantics;
- peer-resolution behavior;
- compatibility tests;
- canonicalization behavior;
- known limitations.

Unknown lockfile formats must not be parsed approximately.

They must produce `unsupported` or `configuration_required`.

---

## 22. Lockfile parsing

Lockfile parsing should preserve applicable:

- package descriptors;
- package resolutions;
- checksums;
- dependency relationships;
- peer dependency context;
- optional dependencies;
- workspace references;
- virtual packages;
- patch or portal references;
- unresolved entries.

Malformed lockfile output must not become an empty dependency graph.

---

## 23. Manifest and lockfile consistency

Qualification should detect applicable inconsistencies such as:

- workspace package missing from the lockfile;
- manifest dependency absent from resolved state;
- stale resolution after manifest change;
- package-manager version mismatch;
- incompatible lockfile generation;
- duplicate or ambiguous resolution;
- lockfile modified by an unapproved command.

DCAv2 must not regenerate the lockfile automatically unless separately
authorized.

---

## 24. Workspace discovery

Workspace discovery should use applicable:

- root package metadata;
- supported workspace declaration forms;
- lockfile evidence;
- package manifests;
- trusted repository configuration;
- normalized filesystem discovery.

Every workspace package should retain:

- package ID;
- repository ID;
- source snapshot ID;
- package root;
- manifest path;
- package name;
- package version;
- private status;
- workspace membership evidence;
- source roots;
- test roots;
- generated roots;
- TypeScript configuration;
- support status.

---

## 25. Workspace-pattern validation

Workspace patterns must remain bounded to the source snapshot.

Validation must reject or constrain:

- absolute paths;
- parent-directory traversal;
- null bytes;
- unsupported pattern syntax;
- symbolic-link escapes;
- paths outside the repository;
- unbounded traversal;
- dependency-cache directories;
- generated cache directories;
- duplicate package roots.

Pattern expansion must be deterministic.

---

## 26. Canonical package identity

A package identity should bind applicable:

- repository identity;
- source commit;
- workspace profile;
- package root;
- manifest occurrence;
- package name;
- package-content digest.

Package name alone is insufficient.

Duplicate names, duplicate roots, or ambiguous workspace membership must block
package graph completion.

---

## 27. Package graph

The Yarn package graph should model applicable edges such as:

- runtime dependency;
- development dependency;
- optional dependency;
- peer dependency;
- workspace dependency;
- local path dependency;
- portal dependency;
- TypeScript project reference;
- path-alias relationship;
- package-export consumer;
- build or test dependency.

Every edge must retain:

- source package;
- target package or external resolution;
- edge type;
- declaration occurrence;
- lockfile resolution;
- provenance;
- freshness;
- support status.

---

## 28. Workspace dependency protocols

Yarn workspace-local relationships may use supported workspace selectors or
other local forms.

The resolver should retain:

- source package;
- target package;
- declaration occurrence;
- declared selector;
- resolved local package;
- version compatibility;
- lockfile representation;
- provenance;
- support status.

A local package relationship is not proof that a particular source symbol is
referenced.

---

## 29. Local path and portal dependencies

Local path or portal-style dependencies require explicit support.

Qualification must identify:

- declared path;
- resolved target;
- repository-boundary status;
- target package identity;
- symlink or live-reference semantics;
- source mutation implications;
- support status.

A target outside the authorized repository must not be followed without an
explicit cross-repository profile and authorization.

---

## 30. Peer dependencies

Peer dependency behavior must remain explicit.

The graph should distinguish:

- declared peer dependency;
- optional peer dependency;
- resolved provider;
- missing peer;
- incompatible peer;
- virtualized peer context;
- workspace-supplied peer.

A peer relationship does not automatically prove a source-level reference.

Unresolved required peer state may still block qualification or baseline
readiness.

---

## 31. Virtual packages

Modern Yarn may represent virtualized package instances for peer-resolution
contexts.

DCAv2 should distinguish:

- logical package identity;
- virtual resolution identity;
- workspace package identity;
- external dependency identity;
- peer context;
- source ownership.

Virtual package identities must not create duplicate authored workspace
packages.

Unsupported virtual-package semantics must reduce graph completeness.

---

## 32. Linker-mode detection

Yarn Berry qualification must identify the configured linker mode.

At minimum, the result should distinguish:

- `node-modules`;
- Plug'n'Play;
- unsupported linker;
- ambiguous linker;
- configuration required.

Every supported linker mode requires separate tests for:

- dependency resolution;
- executable resolution;
- workspace links;
- source discovery;
- analyzer integration;
- build and test behavior;
- filesystem isolation.

---

## 33. Yarn Classic `node_modules`

The Yarn Classic profile should define:

- supported Yarn 1.x range;
- supported lockfile behavior;
- supported workspace behavior;
- installation command;
- lifecycle-script policy;
- registry policy;
- cache policy;
- executable resolution;
- baseline-gate behavior;
- known limitations.

Classic behavior must not be inferred from Berry `node_modules` behavior or the
reverse.

---

## 34. Yarn Berry `node_modules`

The Berry `node_modules` profile should define:

- supported Yarn range;
- supported lockfile format;
- `nodeLinker: node-modules`;
- project-local or Corepack tool resolution;
- workspace graph behavior;
- installation mode;
- plugin requirements;
- cache policy;
- lifecycle-script policy;
- executable resolution;
- baseline-gate behavior.

A successful Classic repository test does not establish this capability.

---

## 35. Plug'n'Play profile

The Plug'n'Play profile should define:

- supported Yarn version range;
- supported lockfile format;
- supported PnP loader artifacts;
- loader identity;
- loader digest;
- dependency-resolution integration;
- analyzer integration;
- TypeScript integration;
- test-runner integration;
- build-tool integration;
- cache requirements;
- unplugged package requirements;
- known unsupported behavior.

Plug'n'Play must have a distinct capability status.

---

## 36. Plug'n'Play loader identity

The PnP loader is repository-derived executable configuration.

Before use, DCAv2 must validate:

- expected repository-relative path;
- source commit;
- content digest;
- generated-state consistency;
- Yarn version;
- lockfile identity;
- support status;
- runner-only execution.

The loader must not execute in the trusted controller or publisher.

---

## 37. PnP loader mismatch

Qualification must fail safely when:

- the loader is missing;
- the loader digest changes unexpectedly;
- the loader does not match the lockfile state;
- the loader path escapes the repository;
- the loader requires unsupported runtime behavior;
- the loader cannot resolve required dependencies;
- generated PnP state is stale.

DCAv2 must not silently regenerate PnP artifacts without authorization.

---

## 38. Archive-backed dependencies

Plug'n'Play may resolve dependencies from archive-backed cache entries.

DCAv2 must account for:

- archive identity;
- cache entry digest;
- read-only access;
- virtual filesystem behavior;
- analyzer compatibility;
- build-tool compatibility;
- file-watcher limitations;
- archive extraction risks.

Archive content must not be treated as authored workspace source.

---

## 39. Archive safety

Any archive extraction required for a supported tool must reject or bound:

- absolute paths;
- parent-directory traversal;
- symbolic-link escape;
- hard-link escape;
- device files;
- excessive file counts;
- excessive expanded size;
- nested archive expansion;
- unsafe file modes.

Extraction must occur in an isolated job directory.

---

## 40. Unplugged packages

Some packages may require extraction into an unplugged directory.

Qualification should identify:

- package identity;
- reason for unplugging;
- generated path;
- source lockfile state;
- cache identity;
- mutation behavior;
- support status.

Unplugged dependency content must not become authored source identity.

Unplugged directories must remain job- or tenant-isolated when generated.

---

## 41. Yarn cache

Yarn cache behavior must have an explicit policy.

The policy should define:

- cache location;
- repository-committed or external status;
- read and write permissions;
- tenant scope;
- integrity validation;
- private package handling;
- retention;
- cleanup;
- poisoning response;
- artifact limits.

A repository-controlled cache is untrusted input.

A shared external cache is a potential cross-job trust channel.

---

## 42. Zero-install repositories

A zero-install profile may be supported when the repository contains the
dependency artifacts required to run without an ordinary network installation.

Qualification must validate applicable:

- cache presence;
- cache completeness;
- lockfile identity;
- PnP loader identity;
- install-state metadata;
- project-local Yarn identity;
- archive integrity;
- private package handling;
- repository size limits;
- support status.

The presence of `.yarn/cache/` alone does not prove zero-install readiness.

---

## 43. Zero-install validation

A zero-install result is ready only when:

- required cache entries are present;
- checksums or integrity metadata validate;
- required loader artifacts are present;
- required project-local Yarn artifacts are present;
- no unauthorized network access is needed;
- required tools resolve;
- baseline gates execute successfully;
- repository state remains unchanged.

Incomplete zero-install state must produce an explicit failure or configuration
requirement.

---

## 44. Cache mutation

Repository-controlled execution must not mutate committed cache artifacts
silently.

After qualification, installation, or gates, DCAv2 must detect changes to
applicable:

- `.yarn/cache/`;
- `.yarn/install-state.gz`;
- `.pnp.cjs`;
- `.pnp.loader.mjs`;
- `.yarn/unplugged/`;
- Yarn release files;
- plugin files;
- `yarn.lock`;
- package manifests;
- `.yarnrc.yml`.

Unexpected mutation must cause failure.

---

## 45. Project-local plugins

Yarn plugins are executable or behavior-changing project content.

Qualification should inventory:

- configured plugin;
- repository-relative path;
- content digest;
- declared source;
- required capability;
- support status;
- runner-only execution requirement.

An unknown or unsupported required plugin must produce:

- `unsupported`;
- `configuration_required`;
- or `security_blocked`.

---

## 46. Plugin security

A plugin must not:

- execute in the controller;
- execute in the publisher;
- receive trusted credentials;
- broaden network access;
- modify authorization;
- suppress required failures;
- define trusted commands automatically.

Required plugins must run only in the untrusted runner under the selected
security profile.

---

## 47. Plugin compatibility

A supported plugin profile should identify:

- plugin identity;
- plugin version or digest;
- supported Yarn versions;
- affected command behavior;
- affected resolution behavior;
- output contracts;
- known limitations;
- tests.

A plugin present in one fixture must not be treated as generally supported.

---

## 48. Yarn configuration

Qualification should inspect applicable configuration such as:

- `.yarnrc`;
- `.yarnrc.yml`;
- package metadata;
- project-local release paths;
- plugin declarations;
- linker mode;
- cache behavior;
- registry scopes;
- lifecycle-script controls;
- network settings;
- supported package extensions;
- supported dependency overrides;
- checksum behavior.

Secret-bearing values must be redacted.

Repository configuration remains untrusted data.

---

## 49. Configuration precedence

Yarn repository configuration cannot override:

- permanent safety policy;
- prohibited-repository policy;
- active authorization;
- credential policy;
- network policy;
- runner policy;
- test requirements;
- publication restrictions.

A repository may describe required behavior, but trusted DCAv2 policy determines
whether that behavior is permitted and supported.

---

## 50. Registry configuration

Qualification should identify:

- default registry;
- scoped registries;
- private registries;
- authentication requirements;
- certificate requirements;
- network destinations;
- support status.

Credential values must not be copied into:

- command records;
- logs;
- reports;
- patches;
- audit events;
- generated configuration.

---

## 51. Deterministic installation

Every supported Yarn profile must define deterministic dependency-state
preparation.

For network installation profiles, the command should use a lockfile-preserving
or immutable mode appropriate to the supported Yarn generation.

The command definition must identify:

- Yarn version;
- Node.js version;
- source commit;
- lockfile digest;
- workspace root;
- linker mode;
- cache profile;
- plugin profile;
- lifecycle-script policy;
- registry profile;
- timeout;
- resource limits;
- expected changed files.

Installation must not silently regenerate the lockfile.

---

## 52. Yarn Classic installation

The Yarn Classic installation profile should define:

- supported command;
- lockfile-preservation behavior;
- offline behavior when supported;
- cache behavior;
- lifecycle-script behavior;
- workspace-root behavior;
- executable resolution;
- expected filesystem changes;
- failure mapping.

Classic installation must not be represented as immutable when the selected
command does not enforce the required consistency.

---

## 53. Yarn Berry immutable installation

The Berry installation profile should use an immutable or equivalent
lockfile-preserving behavior.

Validation must detect changes to:

- lockfile;
- cache;
- install state;
- PnP loader;
- package manifests;
- configuration;
- plugins;
- project-local Yarn releases.

Any permitted mutation must be explicitly declared by the profile and
authorization.

---

## 54. Lifecycle scripts

Yarn lifecycle scripts and package build scripts are repository- or
dependency-controlled code.

The profile must state whether scripts are:

- disabled;
- enabled;
- selectively permitted;
- required but unsupported.

When enabled, they must execute only inside the runner with:

- restricted network;
- restricted credentials;
- bounded filesystem access;
- CPU limits;
- memory limits;
- process limits;
- output limits;
- timeout;
- cleanup.

---

## 55. Script requirements

Qualification should identify packages that require build scripts or native
preparation.

For each requirement, record:

- package identity;
- script stage;
- expected artifact;
- linker-mode impact;
- analyzer impact;
- baseline impact;
- support status.

A missing generated dependency artifact must not be misclassified as an
analyzer failure or zero-reference result.

---

## 56. Workspace command routing

Yarn operations must map to approved structured commands.

Potential commands include:

- version verification;
- immutable root installation;
- zero-install validation;
- package-specific type checking;
- package-specific build;
- package-specific tests;
- workspace-wide type checking;
- workspace-wide build;
- workspace-wide tests;
- workspace focus or bounded selection;
- PnP resolution validation.

Every command must define:

- command ID;
- Yarn mode;
- package scope;
- working directory;
- arguments;
- environment;
- network profile;
- filesystem profile;
- timeout;
- resource limits;
- output limits;
- expected artifacts;
- cleanup.

---

## 57. Workspace selection

Package selection must use canonical package identities.

A structured selection should identify:

- selected packages;
- dependency closure;
- dependent closure;
- graph digest;
- authorization boundary;
- deterministic ordering;
- maximum package count.

Untrusted raw workspace-selection strings must not execute directly.

---

## 58. Focused installations or commands

When a supported Yarn mode offers focused workspace behavior, DCAv2 must define:

- selection semantics;
- dependency inclusion;
- dependent inclusion;
- resulting dependency-state changes;
- cache impact;
- lockfile impact;
- install-state impact;
- verification limitations.

A focused dependency state must not be used to claim repository-wide coverage
unless every relevant consumer remains represented.

---

## 59. Command concurrency

Workspace command concurrency must be bounded.

DCAv2 should control:

- package concurrency;
- process count;
- CPU;
- memory;
- output;
- open files;
- temporary storage;
- timeout.

Package-level result attribution must survive concurrent execution.

A resource-exceeded aggregate run must preserve affected package statuses.

---

## 60. Package-level result attribution

Every workspace-wide command should produce or be normalized into package-level
results.

Each result should identify:

- package ID;
- command ID;
- Yarn mode;
- source commit;
- package graph digest;
- start and completion times;
- status;
- exit code;
- failure category;
- bounded artifact;
- timeout;
- resource status;
- cleanup status.

An aggregate pass must not conceal an unavailable required package result.

---

## 61. TypeScript integration

The TypeScript integration must account for the selected Yarn mode.

Qualification should record:

- TypeScript package identity;
- TypeScript version;
- resolution method;
- executable method;
- configuration files;
- project references;
- path aliases;
- PnP SDK or loader requirements where applicable;
- support status.

The workflow must not use a host-global TypeScript compiler as fallback.

---

## 62. Plug'n'Play TypeScript support

PnP TypeScript support requires mode-specific validation.

The profile should define:

- how the compiler resolves dependencies;
- whether SDK-generated artifacts are required;
- whether the compiler is invoked through Yarn;
- loader requirements;
- project-local executable behavior;
- unsupported plugin or editor-only behavior;
- failure mapping.

A successful `node_modules` TypeScript run does not prove PnP TypeScript
support.

---

## 63. Analyzer integration

Every analyzer used under PnP must be tested for:

- dependency resolution;
- archive-backed files;
- virtual packages;
- workspace links;
- project-local executables;
- loader requirements;
- output path normalization;
- source ownership;
- duplicate traversal;
- failure behavior.

An analyzer incompatible with PnP must produce explicit unsupported or
unavailable coverage.

---

## 64. Dependency-source exclusion

Third-party dependency content must not become authored workspace inventory.

Exclusion rules should cover applicable:

- `node_modules`;
- Yarn cache archives;
- unplugged dependencies;
- generated SDKs;
- install-state files;
- PnP loader files;
- project-local Yarn binaries;
- plugin binaries.

The exclusion must not hide workspace package source or generated source
required by the supported profile.

---

## 65. Workspace package resolution

Workspace package references must resolve to canonical package identity.

The implementation must avoid:

- analyzing one package through several physical paths;
- treating linked package paths as separate packages;
- confusing cache archives with workspace source;
- losing source occurrence identity;
- resolving an external package when a workspace package is required.

Resolution must be deterministic and provenance-preserving.

---

## 66. Evidence collection

Yarn evidence must remain package- and mode-aware.

Applicable evidence should identify:

- source package;
- target package;
- source file;
- target symbol;
- reference type;
- dependency relationship;
- workspace relationship;
- linker mode;
- PnP resolution context where applicable;
- project-reference relationship;
- path-alias relationship;
- package-export relationship;
- test or production scope;
- semantic resolution;
- ambiguity;
- provenance.

Physical cache or virtual paths must not replace canonical package identity.

---

## 67. Evidence normalization

Yarn-specific tool output must be normalized into DCAv2 evidence.

Normalization should retain:

- repository identity;
- source commit;
- Yarn profile;
- Yarn version;
- lockfile digest;
- configuration digest;
- linker mode;
- package graph digest;
- source package;
- target package;
- source occurrence;
- target occurrence;
- producer and version;
- adapter version;
- evidence type;
- polarity;
- strength;
- ambiguity;
- raw artifact digest.

Mode-specific paths must be normalized without losing provenance.

---

## 68. Evidence freshness

Yarn evidence becomes stale when applicable:

- source commit changes;
- lockfile changes;
- Yarn version changes;
- Yarn generation changes;
- linker mode changes;
- cache identity changes;
- PnP loader changes;
- plugin configuration changes;
- workspace configuration changes;
- package manifests change;
- project references change;
- path aliases change;
- package exports change;
- analyzer version changes;
- adapter semantics change.

Stale evidence must not satisfy classification or remediation prerequisites.

---

## 69. Coverage profile

The Yarn workspace coverage profile should include required dimensions such as:

- Yarn generation;
- Yarn version;
- lockfile parsing;
- workspace discovery;
- package identity;
- package graph construction;
- linker-mode support;
- cache or zero-install validation;
- plugin support;
- loader validation for PnP;
- source-root discovery;
- test-root discovery;
- generated-root discovery;
- TypeScript integration;
- project-reference resolution;
- path-alias resolution;
- package-export resolution;
- semantic reference analysis;
- dynamic-use checks;
- package baseline readiness;
- aggregate baseline readiness.

Every required dimension must have an explicit status.

---

## 70. Coverage statuses

Coverage statuses should include:

- `complete`;
- `partial`;
- `failed`;
- `unsupported`;
- `unavailable`;
- `excluded`;
- `stale`;
- `not_applicable`.

Only `complete` may satisfy a required dimension.

Unsupported Yarn mode behavior must not be represented as excluded unless the
profile proves it cannot contain relevant evidence.

---

## 71. Package coverage

Each required package should receive a package-coverage result.

The result should identify:

- package ID;
- Yarn mode;
- source roots;
- test roots;
- generated roots;
- reference-analysis status;
- graph-edge status;
- tool status;
- loader status where applicable;
- baseline status;
- unresolved dynamic scope;
- completion status.

A failed package must not be treated as having zero references.

---

## 72. Workspace coverage aggregation

Workspace coverage must be derived from:

- package graph completeness;
- package coverage;
- linker-mode support;
- cache or zero-install readiness;
- plugin support;
- PnP loader readiness where applicable;
- project references;
- path aliases;
- package exports;
- dynamic-use checks;
- package baselines;
- aggregate baselines.

A simple package completion percentage is insufficient.

Every failed, unsupported, inaccessible, or stale required scope must remain
visible.

---

## 73. Coverage digest

A deterministic Yarn coverage digest should bind applicable:

- repository identity;
- source commit;
- Yarn profile;
- Yarn version;
- lockfile digest;
- configuration digest;
- linker mode;
- cache identity;
- loader identity;
- plugin identities;
- package graph digest;
- package coverage records;
- analyzer identities;
- unresolved scopes;
- completion statuses.

Changing any required input must invalidate the digest.

---

## 74. Partial dependency preparation failure

Dependency-state preparation may fail for:

- one package;
- one archive;
- one lifecycle script;
- one plugin;
- one loader artifact;
- one private registry request;
- one platform-specific dependency.

The result must preserve:

- affected package or artifact;
- failure stage;
- failure category;
- partial filesystem state;
- cache state;
- lockfile mutation status;
- retry safety;
- cleanup status;
- capability impact.

Partial preparation must not produce a ready qualification result.

---

## 75. Partial workspace execution

A workspace command may succeed for some packages and fail for others.

DCAv2 must preserve:

- package-level results;
- aggregate result;
- graph impact;
- dependent packages;
- affected findings;
- retry behavior;
- cleanup behavior.

A successful target package does not override a failing required dependent
package.

---

## 76. Classification

The existing conservative classification model continues to apply.

A Yarn workspace finding may become `candidate_dead` only when:

- the repository profile is supported;
- Yarn and lockfile identities are current;
- linker mode is supported;
- required plugin and loader identities are current;
- package graph identity is current;
- target package identity is exact;
- required package coverage is complete;
- required workspace coverage is complete;
- no dominant liveness evidence exists;
- no unresolved local or workspace dependency may expose the target;
- no unsupported linker or loader behavior affects the evidence;
- required analyzers succeeded;
- classification is deterministic.

A classification is not a human disposition.

---

## 77. Public package boundaries

A package that may be consumed outside the repository must retain unknown
external-consumer risk.

Phase 3C must not treat absence of workspace-local references as proof that a
public package API is dead.

Automatic remediation should remain limited to supported private implementation
symbols outside externally consumable contracts.

---

## 78. Classification explanation

The explanation should include:

- repository;
- source commit;
- Yarn generation;
- Yarn version;
- lockfile digest;
- configuration digest;
- linker mode;
- cache or zero-install status;
- loader status where applicable;
- plugin status;
- target package;
- target symbol;
- package graph digest;
- workspace relationships;
- package-export evidence;
- project-reference evidence;
- path-alias evidence;
- packages analyzed;
- packages failed or excluded;
- coverage digest;
- policy version;
- resulting status.

---

## 79. Human disposition

Human disposition remains separate from machine classification.

A disposition should bind to:

- repository;
- source commit;
- Yarn profile;
- Yarn version;
- lockfile digest;
- linker mode;
- loader identity where applicable;
- package graph digest;
- target package;
- finding;
- evidence digest;
- coverage digest;
- classification identity;
- human actor;
- timestamp.

A relevant Yarn, lockfile, linker, loader, package graph, or evidence change may
make the disposition stale.

---

## 80. Remediation authorization

Remediation authorization should bind to:

- finding ID;
- repository identity;
- source commit;
- Yarn profile;
- Yarn version;
- lockfile digest;
- linker mode;
- loader identity where applicable;
- package graph digest;
- target package;
- evidence digest;
- coverage digest;
- human disposition;
- transformation ID;
- permitted files;
- permitted packages;
- required package gates;
- required aggregate gates;
- expiration or completion boundary.

Authorization for one package must not permit unrelated cache, plugin, lockfile,
or configuration changes.

---

## 81. Exact finding reproduction

Before modification, DCAv2 must reproduce:

- repository identity;
- source commit;
- Yarn generation;
- Yarn version;
- lockfile identity;
- configuration identity;
- linker mode;
- loader identity where applicable;
- plugin identities where required;
- package graph;
- target package;
- target symbol;
- source occurrence;
- evidence digest;
- coverage digest;
- human disposition;
- remediation authorization.

Any mismatch must block transformation.

---

## 82. Baseline dependency state

The remediation workflow must begin from a clean, validated dependency state.

The baseline should record:

- source commit;
- Yarn profile;
- Yarn version;
- lockfile digest;
- linker mode;
- cache identity;
- loader identity;
- plugin identities;
- registry profile;
- lifecycle-script policy;
- preparation status;
- changed files;
- package failures;
- cleanup status.

Unexpected repository mutation must block remediation.

---

## 83. Package baseline gates

Package-specific baseline gates may include:

- parsing;
- type checking;
- compilation;
- build;
- lint;
- unit tests;
- package integration tests.

The selected package set must account for:

- target package;
- dependencies;
- dependents;
- project references;
- path-alias consumers;
- package-export consumers;
- test consumers.

Selection must be deterministic and evidence-backed.

---

## 84. Aggregate baseline gates

Aggregate gates may include:

- workspace graph validation;
- linker or loader validation;
- workspace-wide type checking;
- workspace-wide build;
- workspace-wide tests;
- repository integration tests;
- cache or zero-install validation;
- lockfile stability;
- repository-status validation.

The Yarn profile must state which aggregate gates are required.

A missing required aggregate gate blocks remediation readiness.

---

## 85. Structured transformation

The transformation remains source- and package-specific.

It must bind to:

- exact target package;
- exact source file;
- exact symbol occurrence;
- transformation version;
- source digest;
- Yarn profile;
- lockfile digest;
- linker mode;
- package graph digest;
- expected rewrite count;
- permitted changed files;
- coverage digest.

The transformation must not modify manifests, lockfiles, configuration, cache,
loader files, plugins, or unrelated packages unless separately authorized.

---

## 86. Changed-file validation

After transformation, DCAv2 must validate repository-wide changes including:

- target source file;
- other workspace files;
- package manifests;
- `yarn.lock`;
- `.yarnrc`;
- `.yarnrc.yml`;
- `.pnp.cjs`;
- `.pnp.loader.mjs`;
- `.yarn/cache/`;
- `.yarn/unplugged/`;
- `.yarn/install-state.gz`;
- project-local Yarn releases;
- plugins;
- generated artifacts;
- file modes;
- symbolic links;
- binary files.

Any unauthorized change must cause failure.

---

## 87. Post-change dependency preparation

A second installation or dependency-state preparation should not be required
automatically when the source-only transformation cannot affect dependency
state.

When the profile requires it, the post-change step must:

- use the same Yarn version;
- use the same lockfile;
- use the same linker mode;
- use an equivalent cache policy;
- use the same plugin policy;
- use the same lifecycle-script policy;
- preserve repository state;
- record changed files.

The reason for repeating dependency preparation must be explicit.

---

## 88. Post-change package gates

Post-change package gates must rerun the required target and dependent package
checks.

The workflow must verify:

- target package passes;
- required dependencies pass where applicable;
- required dependents pass;
- project-reference consumers pass;
- path-alias consumers pass;
- package-export consumers pass;
- PnP resolution still works where applicable;
- no new diagnostic appears;
- package-level result attribution is complete.

---

## 89. Post-change aggregate gates

Required aggregate gates must confirm:

- workspace graph remains valid;
- linker mode remains unchanged;
- loader state remains valid where applicable;
- lockfile remains unchanged unless explicitly authorized;
- configuration remains unchanged unless explicitly authorized;
- cache or zero-install state remains valid;
- workspace-wide build or test requirements pass;
- no unexpected generated output appears;
- repository-wide changed files remain authorized.

Target-package success alone is insufficient.

---

## 90. Patch generation

The patch record should include Yarn-specific identity such as:

- repository;
- base commit;
- Yarn profile;
- Yarn version;
- lockfile digest;
- configuration digest;
- linker mode;
- loader digest where applicable;
- plugin digests where required;
- target package;
- package graph digest;
- finding;
- remediation attempt;
- transformation;
- package gate results;
- aggregate gate results;
- changed files;
- patch hash;
- coverage digest;
- secret-scan result.

Patch generation does not authorize publication.

---

## 91. Trusted publication

When separately authorized, the trusted publisher must validate:

- repository identity;
- prohibited-repository policy;
- base commit;
- Yarn profile identity;
- lockfile digest;
- configuration digest;
- linker mode;
- loader digest where applicable;
- package graph digest;
- target package identity;
- finding identity;
- human disposition;
- remediation authorization;
- evidence and coverage digests;
- package and aggregate gates;
- patch hash;
- changed-file set;
- draft-only operation.

The publisher must not run Yarn, loaders, plugins, installation, builds, tests,
or repository scripts.

---

## 92. Database evolution

Phase 3C may persist concepts such as:

- Yarn repository profiles;
- Yarn generation records;
- Yarn version-resolution records;
- lockfile identities;
- linker-mode records;
- project-local binary identities;
- plugin identities;
- cache identities;
- zero-install validation records;
- PnP loader identities;
- dependency-preparation results;
- package-level command results;
- Yarn coverage records.

Persistence changes must use additive ordered migrations.

Historical npm and pnpm workspace records must remain interpretable.

---

## 93. Migration compatibility

Migration testing should include:

- fresh installation;
- upgrade from the Phase 3B schema;
- existing npm workspace records;
- existing pnpm workspace records;
- Yarn Classic records;
- Berry `node_modules` records;
- Plug'n'Play records;
- missing loader records;
- unsupported plugin records;
- partial package results;
- multiple tenants;
- migration failure;
- retry;
- projection rebuild;
- audit preservation.

Existing migrations must not be rewritten.

---

## 94. Audit requirements

Phase 3C should produce audit events for applicable:

- Yarn qualification requested;
- Yarn generation detected;
- Yarn version resolved;
- Yarn version rejected;
- lockfile parsed;
- lockfile rejected;
- linker mode selected;
- linker mode rejected;
- project-local Yarn validated;
- project-local Yarn rejected;
- plugin discovered;
- plugin rejected;
- cache validated;
- zero-install state validated;
- PnP loader validated;
- PnP loader rejected;
- workspace package discovered;
- package graph created;
- dependency preparation started;
- dependency preparation completed;
- dependency preparation failed;
- lifecycle script blocked;
- package gate completed;
- aggregate gate completed;
- coverage completed;
- coverage partial;
- remediation reproduced;
- transformation completed;
- unexpected repository mutation rejected;
- patch created;
- publication requested;
- cleanup completed;
- cleanup failed.

Audit events must remain tenant-scoped and secret-free.

---

## 95. Runner requirements

Yarn commands, project-local binaries, loaders, plugins, and executable
configuration must run in an approved untrusted runner profile.

The profile must enforce applicable:

- non-root execution;
- no privileged mode;
- no Docker socket;
- no trusted credentials;
- explicit environment allowlist;
- repository-scoped mounts;
- approved cache mounts;
- package-registry-only network during installation;
- network-disabled analysis and gates where possible;
- CPU limits;
- memory limits;
- process limits;
- disk limits;
- output limits;
- timeouts;
- process-tree cleanup;
- workspace cleanup.

PnP and cache access must not weaken filesystem isolation.

---

## 96. Network profiles

Phase 3C should use separate network profiles for applicable stages:

- provider read-only source acquisition;
- package-registry-only dependency installation;
- private-registry read-only installation;
- network-disabled zero-install validation;
- network-disabled analysis;
- network-disabled baseline and post-change gates where possible;
- provider-publish-only trusted publication.

Repository configuration must not broaden these profiles.

---

## 97. Credential boundaries

Credential capabilities may include:

- provider read credential;
- public or private registry read credential;
- controller database credential;
- trusted publisher credential.

The runner may receive only the minimum authorized registry capability required
for dependency preparation.

It must never receive:

- trusted publisher credentials;
- controller database credentials;
- unrelated registry credentials;
- broad cloud credentials;
- production secrets.

---

## 98. Prompt-injection resistance

Instructions found in:

- Yarn configuration;
- package manifests;
- workspace configuration;
- project-local Yarn code;
- plugins;
- lifecycle scripts;
- loader output;
- build output;
- test output;
- package metadata;
- analyzer output;
- generated artifacts;

must remain untrusted data.

They must not:

- broaden package scope;
- alter trusted command definitions;
- choose credentials;
- broaden registry access;
- change cache policy;
- change linker mode through trusted configuration;
- exclude required packages;
- mark dependency-preparation failures as passed;
- create human disposition;
- authorize remediation;
- trigger publication;
- modify governance.

---

## 99. Secret handling

Yarn repositories may contain secret-bearing registry, certificate, or plugin
configuration.

DCAv2 must prevent exposure through:

- Yarn configuration;
- command arguments;
- environment variables;
- logs;
- lockfile metadata;
- cache paths;
- archive contents;
- test artifacts;
- generated patches;
- publication text;
- audit events.

Synthetic credential canaries should validate redaction and isolation.

---

## 100. Phase 3C test manifest

Phase 3C should receive a dedicated test manifest such as:

`codex/tests/phase-3c-tests.yaml`

If introduced, the file must conform to:

`codex/tests/phase-test-manifest.schema.json`

The manifest must identify concrete required and conditional test IDs.

The phrase “run relevant tests” is insufficient.

---

## 101. Minimum package-manager detection tests

Detection tests should cover:

- valid Yarn Classic repository;
- valid Berry `node_modules` repository;
- valid Berry Plug'n'Play repository;
- package-manager declaration;
- missing declaration;
- npm and Yarn lockfiles together;
- pnpm and Yarn lockfiles together;
- mixed Classic and Berry configuration;
- nested package-manager conflict;
- unsupported Yarn version;
- missing Yarn executable;
- host-global Yarn present;
- malformed package-manager declaration.

---

## 102. Minimum version-resolution tests

Version tests should cover:

- supported project-local Yarn;
- supported Corepack resolution;
- supported runner-image Yarn;
- declared and resolved version match;
- version mismatch;
- missing project-local binary;
- project-local path escape;
- project-local digest change;
- malformed binary;
- host-global fallback attempt;
- unsupported future version;
- Corepack download denied.

---

## 103. Minimum lockfile tests

Lockfile tests should cover:

- supported Classic lockfile;
- supported Berry lockfile;
- unsupported format;
- malformed lockfile;
- missing resolution;
- duplicate resolution;
- virtual package;
- peer context;
- workspace resolution;
- local path resolution;
- patch resolution;
- deterministic parsing under input-order variation.

Malformed lockfiles must not produce an empty graph.

---

## 104. Minimum workspace tests

Workspace tests should cover:

- supported Classic workspaces;
- supported Berry workspaces;
- several package patterns;
- unmatched pattern;
- overlapping patterns;
- duplicate package root;
- duplicate package name;
- symbolic-link escape;
- package outside workspace;
- nested workspace;
- workspace package missing from lockfile;
- lockfile workspace missing from configuration.

---

## 105. Minimum linker-mode tests

Linker-mode tests should cover:

- Yarn Classic `node_modules`;
- Berry `node_modules`;
- Berry Plug'n'Play;
- unsupported linker;
- ambiguous linker;
- linker configuration changed after qualification;
- executable resolution;
- workspace package resolution;
- dependency visibility;
- symbolic-link escape;
- duplicate package traversal;
- dependency-source exclusion.

Each mode requires separate capability status.

---

## 106. Minimum PnP tests

Plug'n'Play tests should cover:

- valid loader;
- missing loader;
- stale loader;
- loader digest mismatch;
- loader path escape;
- supported archive-backed dependency;
- missing cache archive;
- corrupted cache archive;
- virtual package resolution;
- workspace package resolution;
- TypeScript resolution;
- analyzer resolution;
- build-tool resolution;
- test-runner resolution;
- unsupported tool integration.

---

## 107. Minimum cache and zero-install tests

Cache tests should cover:

- valid repository cache;
- missing required entry;
- checksum mismatch;
- archive traversal attempt;
- excessive archive expansion;
- private package isolation;
- cache mutation attempt;
- cross-tenant shared-cache read;
- cross-tenant shared-cache write;
- zero-install with network disabled;
- zero-install requiring unexpected network;
- stale install-state metadata;
- cleanup failure.

---

## 108. Minimum plugin tests

Plugin tests should cover:

- supported plugin;
- missing plugin;
- unsupported plugin;
- plugin digest change;
- plugin path escape;
- plugin attempting network access;
- plugin attempting credential access;
- plugin altering command output;
- plugin required for lockfile interpretation;
- plugin required for workspace behavior;
- plugin absent from one fixture but present in another.

---

## 109. Minimum installation tests

Installation tests should cover:

- successful Classic locked installation;
- successful Berry immutable installation;
- successful zero-install validation;
- manifest and lockfile mismatch;
- lockfile mutation attempt;
- cache mutation attempt;
- missing dependency;
- private registry unavailable;
- wrong registry credential scope;
- lifecycle scripts disabled;
- required script blocked;
- lifecycle script failure;
- timeout;
- memory exhaustion;
- process exhaustion;
- disk exhaustion;
- output truncation;
- cleanup failure.

---

## 110. Minimum workspace-selection tests

Selection tests should cover:

- one package selected;
- dependency closure selected;
- dependent closure selected;
- unknown package;
- duplicate package name;
- package outside authorization;
- unbounded wildcard;
- hostile selector characters;
- graph digest mismatch;
- package moved;
- package removed;
- package added after selection;
- deterministic selection ordering;
- focused dependency state missing a relevant consumer.

---

## 111. Minimum package graph tests

Graph tests should cover:

- runtime dependency;
- development dependency;
- optional dependency;
- peer dependency;
- workspace dependency;
- local path dependency;
- portal dependency;
- virtual package context;
- project reference;
- path alias;
- package export consumer;
- dependency cycle;
- missing package;
- lockfile and manifest conflict;
- graph determinism.

---

## 112. Minimum evidence tests

Evidence tests should cover:

- same-package reference;
- cross-workspace reference;
- workspace dependency consumer;
- path-alias consumer;
- project-reference consumer;
- package-export consumer;
- test-only consumer;
- dynamic import;
- comment-only occurrence;
- string-only occurrence;
- archive-backed dependency path;
- duplicate traversal through linked paths;
- failed consumer package;
- stale loader evidence;
- unsupported analyzer under PnP.

---

## 113. Minimum coverage tests

Coverage tests should cover:

- complete Classic workspace;
- complete Berry `node_modules` workspace;
- complete Plug'n'Play workspace;
- one package failed;
- one package unsupported;
- one unsupported package provably irrelevant;
- one unsupported package possibly relevant;
- unresolved workspace dependency;
- unsupported plugin;
- unsupported linker;
- stale loader;
- missing cache entry;
- stale package graph;
- lockfile changed after analysis;
- package added after analysis;
- private registry package unavailable.

Complete coverage must require all relevant scope.

---

## 114. Minimum baseline tests

Baseline tests should cover:

- package gates pass;
- aggregate gates pass;
- target package fails;
- dependent package fails;
- workspace command partially fails;
- dependency preparation fails;
- required plugin fails;
- PnP loader fails;
- lockfile changes during baseline;
- cache changes during baseline;
- required gate unavailable;
- optional gate unavailable;
- timeout;
- resource exhaustion;
- malformed package-level result;
- cleanup failure.

---

## 115. Minimum classification tests

Classification tests should verify:

- no references under complete Classic coverage;
- no references under complete Berry `node_modules` coverage;
- no references under complete PnP coverage;
- same-package liveness;
- cross-package liveness;
- package-export consumer;
- unresolved workspace dependency;
- failed package;
- unsupported plugin;
- unsupported linker;
- stale loader;
- unknown external public consumer;
- input-order independence;
- positive evidence dominance.

---

## 116. Minimum remediation tests

Remediation tests should cover:

- exact package and function;
- wrong package with same symbol name;
- Yarn version changed;
- lockfile changed;
- linker mode changed;
- loader changed;
- plugin changed;
- package graph changed;
- new consumer package added;
- target package moved;
- unauthorized manifest change;
- unauthorized lockfile change;
- unauthorized cache change;
- unauthorized loader change;
- dependent package gate failure;
- aggregate gate failure;
- deterministic patch;
- idempotent transformation;
- stale authorization.

---

## 117. Minimum publisher tests

Publisher tests should cover:

- exact Yarn profile;
- wrong Yarn version;
- wrong lockfile digest;
- wrong linker mode;
- stale loader digest;
- stale package graph digest;
- stale coverage digest;
- missing package gate;
- missing aggregate gate;
- unexpected configuration change;
- unexpected cache change;
- wrong patch hash;
- default-branch rejection;
- draft pull-request creation;
- idempotent retry;
- provider partial state;
- Git-hook suppression;
- publisher inability to execute Yarn or PnP loaders.

Live provider tests require separate authorization.

---

## 118. Minimum migration tests

Migration tests should cover:

- fresh database;
- upgrade from Phase 3B;
- existing npm workspace records;
- existing pnpm workspace records;
- Yarn Classic records;
- Berry `node_modules` records;
- Plug'n'Play records;
- project-local binary identities;
- plugin identities;
- cache identities;
- loader identities;
- partial dependency-preparation attempts;
- multiple tenants;
- failed migration;
- retry;
- projection rebuild;
- audit preservation.

---

## 119. Minimum security tests

Security tests should cover:

- repository cannot select an arbitrary cache path;
- project-local Yarn cannot execute outside the runner;
- plugin cannot access publisher credentials;
- plugin cannot access controller credentials;
- PnP loader cannot access trusted credentials;
- lifecycle scripts cannot access trusted credentials;
- private registry scope is enforced;
- Docker socket is unavailable;
- cloud metadata is unavailable;
- network profile is enforced;
- cache data does not cross tenants;
- archive traversal is rejected;
- output is bounded;
- process limits apply across workspace workers;
- background processes are terminated;
- cleanup removes temporary registry configuration.

---

## 120. Fixture strategy

Phase 3C should use fixtures representing:

- single-package Yarn Classic repository;
- Yarn Classic workspace;
- Berry `node_modules` workspace;
- Berry Plug'n'Play workspace;
- zero-install Plug'n'Play repository;
- project-local Yarn release;
- Corepack-resolved Yarn;
- workspace dependency;
- peer dependency with virtual package;
- local path dependency;
- portal dependency when supported;
- supported plugin;
- unsupported plugin;
- missing loader;
- corrupted cache;
- duplicate package names;
- lockfile and manifest mismatch;
- private registry requirement;
- malicious lifecycle script;
- malicious plugin;
- archive traversal attempt;
- alternate repository and package names.

Production behavior must not contain fixture-specific branches.

---

## 121. External repository tests

External Yarn repository testing requires explicit authorization.

The authorization must identify:

- canonical repository;
- immutable revision;
- permitted source access;
- permitted dependency preparation;
- permitted registry destinations;
- credential capabilities;
- permitted project-local executable use;
- permitted plugin execution;
- permitted commands;
- runner profile;
- data retention;
- cleanup;
- remediation permission;
- publication permission.

Historical access does not constitute current authorization.

The prohibited repository must never be used.

---

## 122. Scale boundary

Phase 3C establishes bounded functional Yarn support.

The phase report must state tested limits such as:

- workspace package count;
- lockfile resolution count;
- virtual package count;
- cache entry count;
- graph-edge count;
- file count;
- symbol count;
- workspace command concurrency;
- dependency-preparation duration;
- analysis duration;
- peak memory;
- disk and cache use;
- output size.

Phase 3C must not claim enterprise-scale Yarn validation.

Broader scale validation belongs to Phase 10.

---

## 123. Capability acceptance criteria

Yarn Classic capability may become `functional` only when:

1. Classic identification is deterministic.
2. Approved Yarn version resolution is deterministic.
3. Host-global fallback is prevented.
4. Supported lockfile parsing is implemented.
5. Workspace discovery is deterministic.
6. Package identity is exact.
7. Package graph construction is deterministic.
8. Deterministic installation preserves repository state.
9. Lifecycle-script behavior is explicit.
10. Package-level result attribution is preserved.
11. Package and workspace coverage are explicit.
12. Required package and aggregate gates pass.
13. Exact remediation reproduction includes Classic identities.
14. Unauthorized repository changes are rejected.
15. Required security, migration, and phase tests pass.

---

## 124. Berry `node_modules` acceptance criteria

Berry `node_modules` capability may become `functional` only when:

1. Berry generation and version are resolved deterministically.
2. Project-local or Corepack Yarn identity is validated.
3. `nodeLinker: node-modules` is detected explicitly.
4. Supported lockfile parsing is implemented.
5. Plugin requirements are explicit.
6. Immutable dependency preparation preserves repository state.
7. Executable and dependency resolution are tested.
8. Package graph and coverage are deterministic.
9. Required package and aggregate gates pass.
10. Exact remediation reproduction includes Berry and linker identities.
11. Unauthorized configuration, cache, and lockfile changes are rejected.
12. Required security, migration, and phase tests pass.

---

## 125. Plug'n'Play acceptance criteria

Plug'n'Play capability may become `functional` only when:

1. Berry generation and version are resolved deterministically.
2. Plug'n'Play mode is detected explicitly.
3. Supported loader identity is validated.
4. Supported cache state is validated.
5. Archive safety controls pass.
6. Required plugins are supported and validated.
7. TypeScript integration passes.
8. Analyzer integration passes.
9. Build and test integrations pass.
10. Workspace package resolution is deterministic.
11. Duplicate traversal is prevented.
12. Package and workspace coverage are explicit.
13. Partial loader, plugin, or cache failures reduce coverage.
14. Required package and aggregate gates pass.
15. Exact remediation reproduction includes loader and cache identities.
16. Unauthorized loader, cache, configuration, and lockfile changes are
    rejected.
17. Required security, migration, and phase tests pass.

---

## 126. Detection-only outcome

A Yarn profile may validly provide detection-only support when:

- qualification is functional;
- package graph construction is functional;
- evidence and coverage can be evaluated;
- classification remains conservative;
- dependency preparation or remediation verification remains unavailable;
- unsupported remediation behavior is explicit;
- the authorized completion scope permits detection-only support.

Detection-only support must not be described as Yarn remediation support.

---

## 127. Partially supported outcome

A Yarn capability may remain `partially_supported` when, for example:

- Classic is supported but Berry is not;
- Berry `node_modules` is supported but PnP is not;
- PnP qualification works but one analyzer remains incompatible;
- public registries are supported but private registries are not;
- zero-install validation works but ordinary installation does not;
- evidence is supported but aggregate remediation gates are unavailable;
- only a bounded plugin set is supported.

The exact unsupported dimensions must remain explicit.

---

## 128. Blocked outcome

Phase 3C must remain blocked when applicable:

- Yarn identity is ambiguous;
- Yarn generation cannot be determined safely;
- approved Yarn version cannot be resolved;
- required lockfile format is unsupported;
- lockfile parsing fails;
- workspace identity is ambiguous;
- package graph completeness cannot be established;
- required linker mode is unsupported;
- project-local Yarn validation fails;
- required plugin is unsupported;
- PnP loader validation fails;
- cache or zero-install integrity fails;
- required private registry access is unauthorized;
- required lifecycle scripts cannot run safely;
- dependency preparation mutates unauthorized files;
- required package or aggregate gate fails;
- required runner control fails;
- migration tests fail;
- tenant isolation fails;
- required tests fail or are unavailable;
- authorization expires or is revoked.

A blocked result must identify the exact safe next action.

---

## 129. Phase completion criteria

Phase 3C may be reported complete only when all applicable criteria are
satisfied:

1. Yarn generation detection is implemented.
2. Yarn version resolution is deterministic.
3. Host-global fallback is prevented.
4. Supported lockfile parsing is implemented.
5. Workspace discovery is implemented.
6. Package identity is deterministic.
7. Package graph construction is implemented.
8. Linker-mode detection is implemented.
9. Each supported Yarn mode has a separate capability status.
10. Project-local Yarn validation is implemented.
11. Corepack behavior is bounded.
12. Required plugin validation is implemented.
13. Cache and zero-install behavior are bounded.
14. PnP loader validation is implemented where applicable.
15. Archive safety tests pass where applicable.
16. Deterministic dependency preparation is implemented.
17. Lifecycle-script policy is enforced.
18. Private registry handling is bounded.
19. Structured workspace selection is implemented.
20. Package-level command results are preserved.
21. Yarn package coverage is implemented.
22. Yarn workspace coverage is implemented.
23. Partial failures preserve uncertainty.
24. Package baseline gates are implemented.
25. Aggregate baseline gates are implemented.
26. Exact reproduction includes Yarn mode identities.
27. Unauthorized lockfile, configuration, cache, loader, and plugin changes are
    rejected.
28. Required post-change gates pass.
29. Required database migrations pass.
30. Required security controls pass.
31. Required Phase 3C tests pass.
32. Triggered conditional tests pass.
33. Capability statuses are updated truthfully.
34. Security-control matrix is updated.
35. Phase report is complete.
36. Execution state is updated.
37. No unresolved blocker contradicts completion.

---

## 130. Phase report

The Phase 3C completion report should include:

- authorization identity;
- objective;
- source commit before and after;
- files changed;
- migrations;
- dependencies;
- Node.js versions;
- Yarn generations;
- Yarn versions;
- lockfile formats;
- workspace profiles;
- linker modes;
- project-local binary behavior;
- Corepack behavior;
- plugin support;
- cache policy;
- zero-install behavior;
- PnP loader behavior;
- package counts;
- package graph;
- dependency preparation;
- lifecycle-script behavior;
- registry behavior;
- workspace-selection behavior;
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

The report must not describe one supported Yarn mode as universal Yarn or
monorepo support.

---

## 131. Execution-state handoff

The Phase 3C handoff should identify:

- phase status;
- authorization status;
- source commit;
- worktree state;
- supported Yarn generations;
- supported Yarn versions;
- supported lockfile formats;
- supported linker modes;
- supported plugins;
- zero-install capability;
- PnP capability;
- unsupported Yarn features;
- package graph capability;
- dependency-preparation capability;
- test manifest;
- test results;
- security-control results;
- migrations;
- external operations;
- retained external state;
- cleanup state;
- next human decision.

The handoff must not authorize Phase 3D.

---

## 132. Transition to Phase 3D

Phase 3D may be proposed when bounded npm, pnpm, and Yarn package-manager
profiles exist and the remaining TypeScript expansion is primarily about syntax
and framework conventions.

Before Phase 3D begins:

1. Finalize the Phase 3C report.
2. Update execution state.
3. Stop Phase 3C implementation.
4. Present actual Yarn capability statuses by mode.
5. Record unsupported TSX and framework behavior.
6. Prepare a Phase 3D authorization.
7. Obtain explicit human approval.

Phase 3D must not start automatically.

---

## 133. Phase stop conditions

Work must stop when:

- Phase 3C authorization is inactive;
- authorization expires;
- authorization is revoked;
- repository or package scope is exceeded;
- a prohibited repository is encountered;
- repository identity cannot be verified;
- immutable source resolution fails;
- Yarn identity is ambiguous;
- Yarn version cannot be resolved safely;
- required lockfile parsing fails;
- required workspace identity is ambiguous;
- package graph completeness cannot be established;
- required linker mode is unsupported;
- project-local binary validation fails;
- required plugin cannot run safely;
- PnP loader validation fails;
- cache or archive integrity fails;
- required registry access is unauthorized;
- required credential capability is unavailable;
- required lifecycle scripts cannot run safely;
- required runner controls fail;
- a destructive migration would be required without permission;
- a required test fails or is unavailable;
- tenant isolation fails;
- exact finding reproduction fails;
- coverage becomes incomplete;
- dominant liveness evidence appears;
- changed files exceed authorization;
- secret exposure is suspected;
- local user work cannot be preserved;
- external state becomes unknown and cannot be reconciled safely.

Stopping must be recorded truthfully.

---

## 134. Fail-safe behavior

When Yarn identity, generation, version, lockfile semantics, workspace
structure, linker mode, plugin behavior, cache integrity, PnP loader state,
dependency resolution, package graph, qualification, coverage, baseline state,
transformation, verification, or publication state cannot be established
confidently:

- do not report full Yarn support;
- do not generalize one Yarn mode to another;
- do not approximate unsupported lockfile semantics;
- do not execute unvalidated project-local binaries;
- do not execute unsupported plugins;
- do not trust stale PnP loaders;
- do not use arbitrary host caches;
- do not expose registry credentials;
- do not treat dependency-preparation failure as empty dependency state;
- do not classify the finding as safely removable;
- do not modify source;
- do not modify manifests, lockfiles, configuration, caches, loaders, or
  plugins;
- do not generate a publication-eligible patch;
- do not publish;
- preserve available evidence;
- return an explicit partial, unsupported, failed, stale,
  configuration-required, or blocked result;
- identify the exact missing requirement.

Yarn uncertainty must reduce classification, remediation, and publication
authority.

---

## 135. Document integrity

This roadmap file must not be modified during Phase 3C implementation unless
roadmap or governance modification is explicitly authorized.

Changes require:

1. Identification of the Phase 3C planning problem.
2. Review against the roadmap overview.
3. Review against permanent safety invariants.
4. Review of package-manager, version, and lockfile implications.
5. Review of workspace, graph, linker, plugin, cache, and loader implications.
6. Review of registry and credential implications.
7. Review of remediation and publication implications.
8. Review of authorization and testing impact.
9. Updated Phase 3C test manifest where applicable.
10. Updated schemas or capability definitions where applicable.
11. A reviewable governance commit.
12. An ADR when the change alters long-lived Yarn, linker, Plug'n'Play, plugin,
    cache, registry, or workspace semantics.

This roadmap must not be weakened to make unsupported Yarn modes, ambiguous
versions, invalid loaders, unsafe plugins, corrupted caches, broken dependency
preparation, failed gates, failed tests, or unauthorized repository changes
appear acceptable.