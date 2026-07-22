# Phase 3B — pnpm

This document defines the planned scope, capability boundaries, evidence
requirements, tests, stop conditions, and completion criteria for Phase 3B of
DCAv2.

Phase 3B adds bounded pnpm repository and workspace support without assuming
that npm installation, dependency layout, workspace linking, filtering, or
lockfile behavior applies unchanged.

This phase builds on the package-aware evidence and coverage model established
for npm workspaces.

It does not establish universal pnpm, monorepo, package-manager, or
enterprise-scale support.

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
  id: phase-3b-pnpm
  name: pnpm
  roadmap_order: 3B
  default_status: inactive
  implementation_authorized_by_this_file: false
```

The phase becomes active only when the current authorization record explicitly
identifies `phase-3b-pnpm` as active.

---

## 2. Primary objective

The primary objective is to support bounded pnpm repositories and pnpm
workspaces while preserving:

1. Deterministic package-manager identification.
2. Immutable source identity.
3. Workspace-package identity.
4. pnpm lockfile semantics.
5. Workspace-local dependency resolution.
6. Package graph completeness.
7. Package-aware evidence.
8. Package-aware coverage.
9. Explicit installation behavior.
10. Restricted package-registry access.
11. Safe handling of symlinked dependency layouts.
12. Package-specific and aggregate verification.
13. Exact remediation reproduction.
14. Repository-wide changed-file validation.
15. Trusted draft publication when separately authorized.

pnpm support must be validated independently from npm support.

---

## 3. Intended capability

The intended capability is conceptually:

```text
Qualify and analyze a supported pnpm repository, resolve its workspace and
dependency structure accurately, collect package-aware TypeScript evidence,
and safely remediate a supported private function only when required pnpm,
package, workspace, and verification coverage is complete.
```

The capability must remain constrained by:

- supported pnpm versions;
- supported lockfile versions;
- supported workspace declarations;
- supported dependency-linking modes;
- supported workspace protocol behavior;
- supported TypeScript versions;
- supported package graph semantics;
- complete required workspace coverage;
- deterministic installation;
- isolated runner execution;
- exact finding reproduction;
- package and repository gates;
- trusted publication boundaries.

---

## 4. Phase prerequisites

Phase 3B should not begin until Phase 3A has established or bounded:

- workspace discovery;
- canonical package identity;
- package graph construction;
- package-aware source roots;
- cross-workspace reference evidence;
- path-alias handling;
- TypeScript project-reference handling;
- package-export handling;
- package-level coverage;
- workspace-level coverage;
- package-specific command routing;
- package-specific and aggregate gates;
- package-scoped remediation;
- repository-wide changed-file validation.

Phase 2 must also be able to detect pnpm repositories explicitly without
treating them as npm repositories.

---

## 5. Non-goals

Phase 3B does not, by default, include:

- Yarn Classic;
- Yarn Berry;
- Yarn Plug'n'Play;
- arbitrary package-manager abstraction;
- every pnpm version ever released;
- every pnpm lockfile format;
- every dependency-linking mode;
- every workspace filtering expression;
- arbitrary nested workspace systems;
- arbitrary task runners;
- cross-repository package consumers;
- public API removal;
- package deletion;
- workspace deletion;
- dependency removal;
- lockfile rewriting unrelated to the authorized finding;
- automatic package-manager migration;
- automatic `npm`-to-`pnpm` conversion;
- framework-specific liveness conventions;
- mixed-language remediation;
- direct default-branch publication;
- pull-request merge;
- enterprise-scale validation.

Unsupported pnpm behavior must produce an explicit safe status.

---

## 6. Authorization prerequisites

The active Phase 3B authorization must identify applicable:

- local repository scope;
- external repository scope;
- immutable source revisions;
- workspace and package scope;
- files permitted for modification;
- manifest permission;
- lockfile permission;
- pnpm configuration permission;
- dependency-installation permission;
- lifecycle-script permission;
- migration permission;
- database-operation permission;
- runner-image permission;
- command-registry permission;
- package-registry network access;
- private-registry credential capabilities;
- cache or store permission;
- remediation permission;
- publication permission;
- external cleanup permission;
- destructive-operation permission;
- required tests;
- stop conditions;
- expiration or completion boundary.

Permission to run pnpm installation does not automatically permit manifest,
lockfile, workspace configuration, or store mutation outside the isolated job.

Missing permissions default to denial.

---

## 7. Required phase outputs

Phase 3B should produce applicable:

- pnpm repository profiles;
- pnpm workspace qualification;
- pnpm version resolution;
- pnpm lockfile parsing;
- lockfile importer modeling;
- workspace protocol resolution;
- pnpm package graph construction;
- dependency-linking-mode detection;
- symlink-aware path validation;
- package-store policy;
- pnpm command mappings;
- pnpm filtering policy;
- deterministic installation behavior;
- lifecycle-script behavior;
- private-registry behavior;
- package-aware evidence and coverage;
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

## 8. Capability identifiers

Phase 3B should define or update capability identifiers such as:

```text
repository.pnpm.qualify.v1
workspace.pnpm.discover.v1
workspace.pnpm.package-inventory.v1
workspace.pnpm.package-graph.v1
workspace.pnpm.lockfile-importers.v1
workspace.pnpm.workspace-protocol.v1
workspace.pnpm.linker-mode-detect.v1
workspace.pnpm.filter-route.v1
dependency.pnpm.install-locked.v1
dependency.pnpm.store-isolation.v1
analysis.typescript.pnpm-workspace-references.v1
coverage.typescript.pnpm-workspace.v1
verification.pnpm.package-gates.v1
verification.pnpm.aggregate-gates.v1
remediation.typescript.pnpm-workspace.private-function-delete.v1
```

The final identifiers may differ if the capability schema requires another
naming convention.

Every identifier must remain narrow, versioned, and testable.

---

## 9. Supported repository profiles

Phase 3B should define distinct profiles rather than one broad pnpm profile.

Potential initial profiles include:

- single-package pnpm TypeScript repository;
- pnpm workspace using a supported workspace configuration;
- pnpm workspace using a supported lockfile version;
- pnpm workspace using a supported dependency-linking mode;
- pnpm workspace with supported local package relationships;
- pnpm workspace with required baseline commands available.

Each profile must identify:

- supported pnpm version range;
- supported lockfile version range;
- supported Node.js version range;
- supported linking mode;
- supported workspace configuration;
- supported command behavior;
- supported registry behavior;
- known unsupported features.

---

## 10. Qualification statuses

pnpm qualification should use explicit statuses such as:

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

A pnpm repository must not be reported as ready merely because a
`pnpm-lock.yaml` file exists.

---

## 11. `ready`

A pnpm repository is `ready` only when:

- repository identity is verified;
- immutable source resolution succeeds;
- pnpm identity is unambiguous;
- pnpm version is supported;
- lockfile version is supported;
- workspace configuration is supported;
- all required packages are discovered;
- lockfile importers are resolved;
- required local dependency edges are resolved;
- linking mode is supported;
- required tools are available;
- required command mappings exist;
- required baseline gates are available;
- required security controls are enforced;
- no required package remains failed, inaccessible, or unsupported.

`Ready` does not authorize analysis, remediation, or publication.

---

## 12. pnpm identification

pnpm detection should use attributable signals such as:

- `pnpm-lock.yaml`;
- `pnpm-workspace.yaml`;
- the package-manager declaration in package metadata;
- approved Corepack or toolchain configuration;
- trusted operator configuration;
- command and lockfile compatibility evidence.

The result should identify:

- detected package manager;
- declared pnpm version;
- resolved pnpm version;
- lockfile version;
- workspace presence;
- confidence;
- conflicting indicators;
- support status.

---

## 13. Conflicting package-manager indicators

Qualification must detect conflicts such as:

- pnpm and npm lockfiles together;
- pnpm and Yarn lockfiles together;
- package metadata declares npm while pnpm files exist;
- nested packages use different package managers;
- stale package-manager migration files;
- unsupported independent installation roots.

The workflow must not select pnpm silently when material conflicts exist.

The result should be:

- `configuration_required`;
- `partially_supported`;
- or `unsupported`;

depending on the supported profile and trusted configuration.

---

## 14. pnpm version resolution

The pnpm version must be resolved deterministically.

Possible approved sources include:

- the package-manager declaration;
- an authorized Corepack configuration;
- an approved runner-image tool;
- an explicitly installed and verified tool version;
- trusted repository configuration.

The result should record:

- requested version;
- declared version;
- resolved version;
- executable identity;
- resolution method;
- compatibility status;
- mismatch status.

---

## 15. Corepack behavior

When Corepack is used, the command definition must specify:

- Corepack version or runner identity;
- whether Corepack activation is required;
- package-manager declaration requirements;
- download behavior;
- network profile;
- cache behavior;
- signature or integrity validation where supported;
- executable resolution;
- failure behavior.

Corepack must not download or activate arbitrary package-manager versions
outside the approved version policy.

---

## 16. Host-global pnpm fallback

DCAv2 must not silently use an undeclared host-global pnpm executable.

A missing project or runner-approved pnpm version must produce:

- `configuration_required`;
- `unsupported`;
- or `unavailable`.

Tests must verify that a host-global pnpm executable cannot satisfy a missing
approved tool inside the runner.

---

## 17. Lockfile identity

Every pnpm analysis should bind to the exact lockfile identity.

Applicable fields include:

- repository-relative path;
- content digest;
- lockfile format version;
- source commit;
- parser version;
- workspace profile;
- parse status;
- compatibility status.

A lockfile change must invalidate dependent package graph, qualification,
coverage, and remediation records.

---

## 18. Supported lockfile versions

Supported pnpm lockfile versions must be explicit.

For each supported version, DCAv2 should define:

- parser implementation;
- importer semantics;
- package snapshot semantics;
- workspace-link semantics;
- peer-resolution behavior;
- compatibility tests;
- known limitations.

An unknown lockfile version must not be parsed approximately.

It must produce `unsupported` or `configuration_required`.

---

## 19. Lockfile parsing

Lockfile parsing must preserve applicable:

- workspace importers;
- dependency declarations;
- resolved package snapshots;
- local workspace links;
- peer dependency context;
- optional dependencies;
- development dependencies;
- integrity metadata;
- patched or overridden dependency metadata where supported;
- unresolved entries.

Malformed lockfile output must not become an empty dependency graph.

---

## 20. Lockfile importers

pnpm lockfile importers should be modeled explicitly.

Each importer should retain:

- importer ID;
- repository-relative package root;
- associated package identity;
- manifest identity;
- dependency declarations;
- development dependencies;
- optional dependencies;
- peer-related information where represented;
- resolution status;
- provenance.

An importer must not be matched to a package only by package name.

---

## 21. Importer-to-package matching

Importer matching should use:

- normalized repository-relative path;
- workspace membership;
- manifest occurrence;
- package identity;
- source commit;
- lockfile semantics.

Qualification must detect:

- importer without workspace package;
- workspace package without importer;
- duplicate importer path;
- path normalization conflict;
- symbolic-link path;
- importer outside repository;
- stale importer after package movement.

Unresolved required importer identity must reduce package graph completeness.

---

## 22. Workspace configuration

The pnpm workspace definition should be derived from the supported workspace
configuration and verified against the lockfile and manifests.

The configuration record should retain:

- configuration path;
- content digest;
- supported schema version where applicable;
- package patterns;
- exclusions;
- additional supported configuration sections;
- parser version;
- profile version.

Unknown or executable behavior must not be inferred from documentation alone.

---

## 23. Workspace-pattern validation

Workspace patterns must remain bounded to the source snapshot.

Validation must reject or constrain:

- absolute paths;
- parent traversal;
- null bytes;
- unsupported pattern syntax;
- symbolic-link escapes;
- patterns outside the repository;
- unbounded traversal;
- dependency-store directories;
- generated cache directories;
- duplicate package roots.

Pattern expansion must be deterministic.

---

## 24. Workspace package discovery

Each discovered pnpm workspace package should retain:

- package ID;
- repository ID;
- source snapshot ID;
- package root;
- manifest path;
- package name;
- package version;
- private status;
- workspace membership evidence;
- lockfile importer identity;
- TypeScript configuration;
- source roots;
- test roots;
- generated roots;
- support status.

Package identity must remain repository- and source-specific.

---

## 25. Duplicate package identities

Qualification must detect:

- duplicate package names;
- duplicate package roots;
- two importers mapped to one package;
- one importer mapped to several packages;
- package moved without lockfile update;
- manifest identity conflict.

Ambiguous package identity must block graph completion.

The workflow must not collapse packages by display name.

---

## 26. Workspace protocol

The `workspace:` protocol and equivalent supported local-workspace references
must be modeled explicitly.

The resolver should retain:

- source package;
- target package;
- manifest occurrence;
- declared range or selector;
- resolved local package;
- compatibility result;
- fallback behavior where supported;
- lockfile representation;
- provenance.

A workspace protocol declaration is evidence of a package relationship, not
proof that a particular source symbol is referenced.

---

## 27. Workspace protocol mismatch

Qualification should detect cases such as:

- referenced workspace package is missing;
- version range does not match the local package;
- lockfile resolves externally instead of locally;
- package name is duplicated;
- package was moved;
- local link is stale;
- unsupported workspace selector syntax is used.

An unresolved required workspace relationship must reduce graph completeness.

---

## 28. Local path dependencies

pnpm repositories may use local path dependencies.

Supported local path relationships should retain:

- declaration occurrence;
- source package;
- target path;
- resolved package;
- relationship type;
- repository-boundary status;
- symlink status;
- support status.

A local dependency pointing outside the repository must not be followed without
explicit repository-access authorization and a supported cross-repository
profile.

---

## 29. Package graph

The pnpm package graph should model applicable edges such as:

- runtime dependency;
- development dependency;
- optional dependency;
- peer dependency;
- workspace protocol dependency;
- local path dependency;
- TypeScript project reference;
- path-alias relationship;
- package export consumer;
- build or test relationship.

Each edge must retain provenance and resolution status.

---

## 30. pnpm graph semantics

The graph implementation must not assume that physical `node_modules` layout is
the authoritative package graph.

Authoritative graph inputs should include:

- manifests;
- workspace configuration;
- lockfile importers;
- resolved package snapshots;
- supported workspace-local resolution;
- supported TypeScript configuration.

Filesystem layout may provide validation evidence but must not replace lockfile
and manifest semantics.

---

## 31. Peer dependencies

Peer dependency behavior may affect resolution and runtime compatibility.

The package graph should distinguish:

- declared peer dependency;
- resolved peer context;
- optional peer dependency;
- missing peer;
- conflicting peer;
- peer supplied by another workspace package;
- unsupported peer-resolution state.

A peer relationship does not automatically establish a direct source-level
reference.

However, unresolved required peer state may affect qualification and baseline
readiness.

---

## 32. Optional dependencies

Optional dependency failures must remain explicit.

Qualification should identify:

- optional dependency declaration;
- platform condition where known;
- installation result;
- package graph role;
- source reference role;
- impact on required gates.

An optional installation failure may be non-blocking only when the supported
profile proves that it cannot affect the requested capability.

---

## 33. Overrides and dependency modifications

pnpm configuration may modify dependency resolution through supported override
or patch mechanisms.

Phase 3B should detect applicable:

- dependency overrides;
- patched dependencies;
- package extensions or equivalent supported metadata;
- modified resolution;
- affected packages;
- support status.

Unknown dependency modification behavior must reduce qualification confidence.

DCAv2 must not rewrite these settings automatically.

---

## 34. Catalog or centralized version configuration

When a pnpm repository uses centralized dependency-version configuration,
support must be explicit.

Qualification should identify:

- configuration source;
- package references using it;
- resolved version;
- lockfile representation;
- parser support;
- unsupported syntax;
- graph impact.

Unknown centralized version behavior must not be treated as an ordinary
manifest version silently.

---

## 35. Dependency-linking modes

pnpm dependency-linking mode must be detected and reported.

Potential outcomes include:

- supported isolated linking;
- supported hoisted linking;
- supported alternative mode;
- unsupported mode;
- ambiguous mode;
- configuration required.

Each supported mode requires separate tests for:

- executable resolution;
- package resolution;
- symlink behavior;
- workspace linking;
- dependency visibility;
- gate execution.

---

## 36. Isolated dependency layout

For a supported isolated pnpm layout, DCAv2 should account for:

- symlinked package entries;
- virtual-store paths;
- package snapshot identities;
- workspace package links;
- executable links;
- peer-context paths;
- filesystem traversal limits.

The analyzer must not treat virtual-store package copies as authored workspace
source.

---

## 37. Hoisted dependency layout

Hoisted dependency behavior must be tested separately.

Qualification should identify:

- hoisting configuration;
- resulting executable resolution;
- dependency visibility;
- hidden undeclared dependency risk;
- workspace package resolution;
- baseline compatibility;
- support status.

Successful isolated-mode behavior must not be generalized to hoisted mode.

---

## 38. Unsupported linking modes

An unsupported dependency-linking mode must produce:

- `unsupported`;
- `configuration_required`;
- or `partially_supported`.

DCAv2 must not change the repository's linking mode automatically merely to
make analysis work.

A temporary test-only override requires explicit authorization and must not be
reported as validation of the repository's actual configuration.

---

## 39. Symlink-aware filesystem handling

pnpm commonly relies on symbolic links.

Path handling must distinguish:

- expected package-manager links;
- workspace package links;
- executable links;
- malicious links escaping the workspace;
- links into shared stores;
- links to unrelated repositories;
- links to credential paths.

Allowing expected pnpm links must not disable general symlink-escape
protection.

---

## 40. Symlink trust boundaries

The runner may follow an approved pnpm-created link only when:

- its resolved target is inside an authorized dependency or workspace area;
- the target belongs to the current job or approved read-only cache;
- tenant boundaries are preserved;
- the target is not a host credential or runtime path;
- the link type is expected under the selected profile.

Unexpected links must be rejected and reported.

---

## 41. Content-addressable store

pnpm store use must have an explicit security and isolation policy.

The policy should define:

- store location;
- read and write access;
- tenant scope;
- job scope;
- package integrity validation;
- cache key;
- retention;
- cleanup;
- private package handling;
- credential exclusion;
- poisoning response.

A shared store is a potential cross-job trust channel.

---

## 42. Store isolation

The safe default is a job-isolated or tenant-isolated store.

A shared read-only store may be considered only when:

- package integrity is verified;
- private package separation is enforced;
- untrusted jobs cannot mutate trusted entries;
- credentials are absent;
- cache poisoning is tested;
- ownership and cleanup are defined.

A store path supplied by the repository must not select an arbitrary host
directory.

---

## 43. Store mutation

Repository-controlled execution must not mutate a trusted shared store without
an approved design.

When store writes are permitted, the workflow must record:

- job;
- tenant;
- package manager version;
- lockfile digest;
- registry identity;
- package integrity;
- written entries;
- cleanup or retention behavior.

A store write failure must remain distinct from dependency-installation success.

---

## 44. Private packages

Private package handling must preserve:

- tenant isolation;
- registry scoping;
- credential minimization;
- package integrity;
- cache isolation;
- log redaction;
- artifact exclusion;
- store isolation.

Private package contents must not become visible to another tenant through a
shared store, cache, log, or artifact.

---

## 45. `.npmrc` and related configuration

pnpm may consume npm-compatible configuration.

Qualification should inspect only the configuration required to determine:

- registry destinations;
- package scopes;
- linker behavior;
- store behavior;
- lifecycle-script policy;
- strictness settings;
- supported package-manager options.

Secret-bearing values must be redacted.

Configuration files are untrusted data and must not grant network or credential
authority.

---

## 46. Credential-bearing configuration

Configuration may contain:

- authentication tokens;
- credential-bearing registry URLs;
- environment-variable references;
- certificate paths;
- private registry settings.

DCAv2 must not:

- print raw values;
- persist raw values;
- copy them into reports;
- copy them into generated configuration;
- expose them to unrelated commands;
- include them in patches.

Synthetic canary tests should validate redaction and runner isolation.

---

## 47. Deterministic installation

The supported installation workflow should use a lockfile-preserving mode that
fails when manifest and lockfile state are inconsistent.

The command definition must identify:

- pnpm version;
- Node.js version;
- source commit;
- lockfile digest;
- workspace root;
- install mode;
- lifecycle-script policy;
- dependency classes included;
- registry profile;
- store profile;
- timeout;
- resource limits;
- expected changed files.

Installation must not silently update the lockfile.

---

## 48. Lockfile mutation detection

After installation, DCAv2 must detect changes to:

- `pnpm-lock.yaml`;
- package manifests;
- workspace configuration;
- package-manager configuration;
- patch files;
- generated dependency metadata.

Unexpected mutation must produce failure.

An installation that succeeds only by rewriting the lockfile does not satisfy
locked-install readiness.

---

## 49. Offline and cache-assisted installation

Offline or cache-assisted installation may be supported when:

- every required package is available;
- integrity is verified;
- private package isolation is preserved;
- lockfile identity matches;
- store identity is controlled;
- failure behavior is explicit.

An incomplete offline store must produce an unavailable or installation-failed
result.

It must not silently access unrestricted networks.

---

## 50. Lifecycle scripts

pnpm lifecycle scripts remain arbitrary repository-controlled code.

The profile must state whether scripts are:

- disabled;
- enabled;
- selectively permitted;
- required but unsupported.

When enabled, scripts must run only in the untrusted runner with:

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

## 51. Script approval

A repository's configuration may indicate which dependencies require build
scripts, but it cannot grant trusted execution authority.

DCAv2 must determine through trusted policy whether:

- no lifecycle scripts may run;
- all required scripts may run in the runner;
- only a reviewed subset may run;
- the repository is unsupported under the current profile.

Script approval behavior must be versioned and tested.

---

## 52. Ignored or blocked build scripts

When build scripts are ignored or blocked, qualification must identify:

- affected package;
- script stage;
- expected generated output;
- tool or baseline impact;
- support status;
- whether detection-only analysis remains possible.

A missing generated native or JavaScript artifact must not be misreported as an
analyzer defect.

---

## 53. pnpm command registry

pnpm operations must map to approved structured commands.

Potential command definitions include:

- locked root installation;
- package-specific type checking;
- package-specific build;
- package-specific tests;
- recursive workspace type checking;
- recursive workspace build;
- recursive workspace tests;
- package graph inspection;
- package-manager version verification.

Every command must define arguments, scope, environment, network, filesystem,
timeouts, resources, output, and cleanup.

---

## 54. Filtered commands

pnpm filtering can select packages and dependency or dependent sets.

DCAv2 must not pass untrusted raw filter expressions directly.

A structured filter request should identify:

- canonical package IDs;
- selection direction;
- inclusion of dependencies;
- inclusion of dependents;
- changed-since behavior when supported;
- required graph digest;
- bounded result set.

The executor should derive a validated command argument from the structured
selection.

---

## 55. Filter-expression validation

Filter validation must reject or constrain:

- arbitrary shell characters;
- unbounded wildcard selection;
- packages outside authorization;
- unknown package names;
- duplicate ambiguous names;
- source-control ranges outside the approved source identity;
- selectors that include unrelated packages;
- selectors that change semantics across pnpm versions.

A raw repository-provided filter expression must remain untrusted data.

---

## 56. Canonical package selection

Filtered execution should select packages using canonical package identity.

Before execution, the system must verify:

- package remains in the workspace;
- package root matches;
- graph digest matches;
- package name is unambiguous;
- package is within authorization;
- requested dependency or dependent closure is bounded.

Name-only selection is insufficient when duplicate or ambiguous names exist.

---

## 57. Recursive commands

Recursive workspace commands may affect many packages.

A recursive command definition must identify:

- selected package set;
- graph traversal direction;
- concurrency;
- failure behavior;
- bail or continue policy;
- output aggregation;
- package-level results;
- aggregate result;
- timeout;
- resource limits.

One package's failure must not disappear inside an aggregate exit status.

---

## 58. Command concurrency

pnpm may execute package operations concurrently.

DCAv2 must bound:

- package concurrency;
- process count;
- memory;
- CPU;
- output;
- open files;
- temporary storage.

Concurrency must not cause package-result attribution loss.

A resource-exceeded aggregate run must preserve affected package statuses.

---

## 59. Package-level result attribution

Every recursive or filtered command should produce or be normalized into
package-level results.

Each result should identify:

- package ID;
- command ID;
- source commit;
- graph digest;
- start and completion times;
- status;
- exit code;
- failure category;
- bounded output artifact;
- timeout;
- resource status;
- cleanup status.

An aggregate pass must not conceal an unavailable required package result.

---

## 60. Package graph freshness

The pnpm package graph becomes stale when applicable:

- workspace configuration changes;
- lockfile changes;
- package manifest changes;
- pnpm version changes materially;
- linking mode changes;
- local path dependencies change;
- workspace protocol dependencies change;
- project references change;
- path aliases change;
- package exports change.

Stale graph state must invalidate dependent coverage and remediation records.

---

## 61. Evidence collection

TypeScript evidence must remain package-aware.

Applicable evidence should identify:

- source package;
- target package;
- source file;
- target symbol;
- reference type;
- dependency relationship;
- workspace protocol relationship;
- path-alias relationship;
- project-reference relationship;
- test or production scope;
- semantic resolution;
- ambiguity;
- provenance.

Physical dependency-store paths must not become source package identity.

---

## 62. Dependency-store exclusion

Analyzer traversal must exclude package-manager store content and installed
third-party dependency copies from authored workspace inventory unless a
specific evidence adapter requires them.

The exclusion must not hide:

- workspace package source;
- linked local package source;
- generated source required by the build;
- configuration relevant to resolution.

Store exclusion rules must be profile-specific and tested.

---

## 63. Workspace package links

Workspace package links must resolve back to canonical workspace package
identity.

The analyzer must avoid:

- analyzing the same package twice through source and linked paths;
- treating a symlink path as a distinct package;
- confusing dependency-store copies with workspace source;
- losing source occurrence identity.

Deduplication must be deterministic and provenance-preserving.

---

## 64. Evidence normalization

pnpm-specific tool output must be normalized into DCAv2 evidence.

Normalization should retain:

- repository identity;
- source commit;
- pnpm profile;
- pnpm version;
- lockfile digest;
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

pnpm-specific paths must be normalized without losing package identity.

---

## 65. Coverage profile

The pnpm workspace coverage profile should include required dimensions such as:

- package-manager identity;
- pnpm version;
- lockfile parsing;
- lockfile importer resolution;
- workspace pattern expansion;
- package discovery;
- package identity;
- workspace protocol resolution;
- local path resolution;
- package graph construction;
- dependency-linking-mode support;
- source-root discovery;
- test-root discovery;
- generated-root discovery;
- project-reference resolution;
- path-alias resolution;
- package-export resolution;
- semantic reference analysis;
- dynamic-use checks;
- package baseline readiness;
- aggregate baseline readiness.

Every required dimension must have an explicit status.

---

## 66. Coverage statuses

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

Unsupported pnpm configuration must not be represented as an excluded scope
unless the profile proves it cannot contain relevant evidence.

---

## 67. Package coverage

Each required package must receive a package-coverage result.

The result should identify:

- package ID;
- importer ID;
- source roots;
- test roots;
- generated roots;
- reference-analysis status;
- graph-edge status;
- tool status;
- baseline status;
- unresolved dynamic scope;
- completion status.

A failed importer or package analysis must not be treated as zero references.

---

## 68. Workspace coverage aggregation

Workspace coverage must be derived from:

- package graph completeness;
- importer completeness;
- package coverage;
- local dependency resolution;
- project references;
- path aliases;
- package exports;
- dynamic-use checks;
- package baselines;
- aggregate baselines.

A simple percentage is insufficient.

Every failed, unsupported, inaccessible, or stale required scope must remain
visible.

---

## 69. Coverage digest

A deterministic pnpm coverage digest should bind applicable:

- repository identity;
- source commit;
- pnpm profile;
- pnpm version;
- lockfile digest;
- workspace configuration digest;
- package graph digest;
- package coverage records;
- analyzer identities;
- linking-mode identity;
- unresolved scopes;
- completion statuses.

Changing any required input must invalidate the digest.

---

## 70. Partial installation failure

pnpm installation may fail for one dependency, package, lifecycle script, or
platform condition.

The result must preserve:

- affected package;
- dependency identity;
- failure stage;
- failure category;
- partial filesystem state;
- store state;
- lockfile mutation status;
- retry safety;
- cleanup status;
- capability impact.

Partial installation must not produce a ready qualification result.

---

## 71. Partial package execution

A recursive pnpm command may succeed for some packages and fail for others.

DCAv2 must preserve:

- each package result;
- aggregate result;
- package graph impact;
- dependent packages;
- affected findings;
- retry behavior;
- cleanup behavior.

A successful target package does not override a failing required dependent
package.

---

## 72. Classification

The existing conservative classification model continues to apply.

A pnpm workspace finding may become `candidate_dead` only when:

- the repository profile is supported;
- pnpm and lockfile identities are current;
- package graph identity is current;
- target package identity is exact;
- required package coverage is complete;
- required workspace coverage is complete;
- no dominant liveness evidence exists;
- no unresolved local dependency or workspace protocol edge may expose the
  target;
- no unsupported linking behavior affects the evidence;
- required analyzers succeeded;
- classification is deterministic.

A classification is not a human disposition.

---

## 73. Public package boundaries

A package that may be consumed outside the repository must retain unknown
external-consumer risk.

Phase 3B must not treat absence of workspace-local references as proof that a
public package API is dead.

Automatic remediation should remain limited to supported private implementation
symbols that are not part of an externally consumable contract.

---

## 74. Classification explanation

The explanation should include:

- repository;
- source commit;
- pnpm version;
- lockfile digest;
- workspace profile;
- linking mode;
- target package;
- target symbol;
- package graph digest;
- workspace protocol relationships;
- local dependency relationships;
- package export evidence;
- project-reference evidence;
- path-alias evidence;
- packages analyzed;
- packages failed or excluded;
- coverage digest;
- policy version;
- resulting status.

---

## 75. Human disposition

Human disposition remains separate from machine classification.

A disposition should bind to:

- repository;
- source commit;
- pnpm profile;
- lockfile digest;
- package graph digest;
- target package;
- finding;
- evidence digest;
- coverage digest;
- classification identity;
- human actor;
- timestamp.

A lockfile, workspace, package graph, or evidence change may make the
disposition stale.

---

## 76. Remediation authorization

Remediation authorization should bind to:

- finding ID;
- repository identity;
- source commit;
- pnpm profile;
- pnpm version;
- lockfile digest;
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

Authorization for one package must not permit unrelated package or lockfile
changes.

---

## 77. Exact finding reproduction

Before modification, DCAv2 must reproduce:

- repository identity;
- source commit;
- pnpm identity;
- pnpm version;
- lockfile identity;
- workspace configuration;
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

## 78. Baseline installation

The remediation workflow must use a clean, isolated baseline installation when
the profile requires installed dependencies.

The baseline must record:

- source commit;
- pnpm version;
- lockfile digest;
- store profile;
- registry profile;
- lifecycle-script policy;
- install status;
- changed files;
- package-level failures;
- cleanup status.

Unexpected lockfile or manifest mutation must block remediation.

---

## 79. Package baseline gates

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

## 80. Aggregate baseline gates

Aggregate gates may include:

- workspace graph validation;
- recursive type checking;
- recursive build;
- recursive tests;
- repository integration tests;
- generated-artifact validation;
- lockfile stability;
- repository-status validation.

The pnpm profile must state which aggregate gates are required.

A missing required aggregate gate blocks remediation readiness.

---

## 81. Structured transformation

The transformation remains source- and package-specific.

It must bind to:

- exact target package;
- exact source file;
- exact symbol occurrence;
- transformation version;
- source digest;
- package graph digest;
- lockfile digest;
- expected rewrite count;
- permitted changed files;
- coverage digest.

The transformation must not modify package-manager configuration, manifests,
lockfiles, patches, or unrelated packages unless separately authorized.

---

## 82. Changed-file validation

After transformation, DCAv2 must validate repository-wide changes including:

- target source file;
- other workspace files;
- manifests;
- `pnpm-lock.yaml`;
- workspace configuration;
- package-manager configuration;
- patch files;
- generated artifacts;
- file modes;
- symbolic links;
- binary files.

Any unauthorized change must cause failure.

---

## 83. Post-change installation

A second installation should not be required automatically when the source-only
transformation cannot affect dependency state.

When a post-change install is required by the profile, it must:

- use the same pnpm version;
- use the same lockfile;
- use an equivalent clean store policy;
- use the same lifecycle-script policy;
- preserve lockfile stability;
- preserve package identity;
- record changed files.

The reason for rerunning installation must be explicit.

---

## 84. Post-change package gates

Post-change package gates must rerun the required target and dependent package
checks.

The workflow must verify:

- target package passes;
- required dependencies pass where applicable;
- required dependents pass;
- project-reference consumers pass;
- path-alias consumers pass;
- package-export consumers pass;
- no new diagnostic appears;
- package-level result attribution is complete.

---

## 85. Post-change aggregate gates

Required aggregate gates must confirm:

- workspace graph remains valid;
- lockfile remains unchanged unless explicitly authorized;
- workspace configuration remains unchanged unless explicitly authorized;
- recursive build or test requirements pass;
- repository integration remains valid;
- no unexpected generated output appears;
- repository-wide changed files remain authorized.

Target-package success alone is insufficient.

---

## 86. Patch generation

The patch record should include pnpm-specific identity such as:

- repository;
- base commit;
- pnpm profile;
- pnpm version;
- lockfile digest;
- workspace configuration digest;
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

## 87. Trusted publication

When separately authorized, the trusted publisher must validate:

- repository identity;
- prohibited-repository policy;
- base commit;
- pnpm profile identity;
- lockfile digest;
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

The publisher must not run pnpm, install dependencies, execute scripts, build,
or test repository code.

---

## 88. Database evolution

Phase 3B may persist concepts such as:

- pnpm repository profiles;
- pnpm version-resolution records;
- pnpm lockfile identities;
- lockfile importer records;
- workspace protocol edges;
- local dependency edges;
- linking-mode records;
- store profiles;
- pnpm installation results;
- filtered command selections;
- package-level command results;
- pnpm coverage records.

Persistence changes must use additive ordered migrations.

Historical npm workspace records must remain interpretable.

---

## 89. Migration compatibility

Migration testing should include:

- fresh installation;
- upgrade from the Phase 3A schema;
- existing npm workspace records;
- pnpm single-package records;
- pnpm workspace records;
- unsupported lockfile versions;
- missing importer records;
- partial package results;
- multiple tenants;
- migration failure;
- retry;
- projection rebuild;
- audit preservation.

Existing migrations must not be rewritten.

---

## 90. Audit requirements

Phase 3B should produce audit events for applicable:

- pnpm qualification requested;
- pnpm version resolved;
- pnpm version rejected;
- lockfile parsed;
- lockfile rejected;
- importer discovered;
- importer mismatch detected;
- workspace package discovered;
- package graph created;
- workspace protocol edge resolved;
- workspace protocol edge failed;
- linking mode selected;
- installation started;
- installation completed;
- installation failed;
- lifecycle script blocked;
- command filter resolved;
- package gate completed;
- aggregate gate completed;
- coverage completed;
- coverage partial;
- remediation reproduced;
- transformation completed;
- unexpected lockfile change rejected;
- patch created;
- publication requested;
- cleanup completed;
- cleanup failed.

Audit events must remain tenant-scoped and secret-free.

---

## 91. Runner requirements

pnpm commands must execute in an approved untrusted runner profile.

The profile must enforce applicable:

- non-root execution;
- no privileged mode;
- no Docker socket;
- no trusted credentials;
- explicit environment allowlist;
- repository-scoped mounts;
- approved store mounts;
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

pnpm store access must not weaken filesystem isolation.

---

## 92. Network profiles

Phase 3B should use separate network profiles for applicable stages:

- provider read-only source acquisition;
- package-registry-only dependency installation;
- private-registry read-only installation;
- network-disabled analysis;
- network-disabled baseline and post-change gates where possible;
- provider-publish-only trusted publication.

Repository configuration must not broaden these profiles.

---

## 93. Credential boundaries

Credential capabilities may include:

- provider read credential;
- public or private registry read credential;
- controller database credential;
- trusted publisher credential.

The runner may receive only the minimum authorized registry capability required
for installation.

It must never receive:

- trusted publisher credentials;
- controller database credentials;
- unrelated registry credentials;
- broad cloud credentials;
- production secrets.

---

## 94. Prompt-injection resistance

Instructions found in:

- workspace configuration;
- package manifests;
- package-manager configuration;
- lifecycle scripts;
- build output;
- test output;
- package metadata;
- analyzer output;
- generated artifacts;

must remain untrusted data.

They must not:

- broaden package scope;
- alter command definitions;
- choose credentials;
- broaden registry access;
- change store policy;
- exclude required packages;
- mark installation failures as passed;
- create human disposition;
- authorize remediation;
- trigger publication;
- modify governance.

---

## 95. Secret handling

pnpm repositories may contain secret-bearing registry and certificate
configuration.

DCAv2 must prevent exposure through:

- package-manager configuration;
- command arguments;
- environment variables;
- logs;
- lockfile metadata;
- store paths;
- package caches;
- test artifacts;
- generated patches;
- publication text;
- audit events.

Synthetic credential canaries should validate redaction and isolation.

---

## 96. Phase 3B test manifest

Phase 3B should receive a dedicated test manifest such as:

`codex/tests/phase-3b-tests.yaml`

If introduced, the file must conform to:

`codex/tests/phase-test-manifest.schema.json`

The manifest must identify concrete required and conditional test IDs.

The phrase “run relevant tests” is insufficient.

---

## 97. Minimum package-manager detection tests

Detection tests should cover:

- valid pnpm repository;
- pnpm workspace;
- package-manager declaration;
- missing declaration;
- npm and pnpm lockfiles together;
- Yarn and pnpm lockfiles together;
- nested package-manager conflict;
- stale migration files;
- unsupported pnpm version;
- missing pnpm executable;
- host-global pnpm present;
- malformed package-manager declaration.

---

## 98. Minimum lockfile tests

Lockfile tests should cover:

- supported lockfile version;
- unsupported lockfile version;
- malformed YAML;
- missing importer;
- duplicate importer;
- importer outside workspace;
- stale importer after package move;
- package snapshot missing;
- local dependency mismatch;
- peer dependency context;
- optional dependency;
- override or patch metadata;
- deterministic parsing under input-order variation.

Malformed lockfiles must not produce an empty graph.

---

## 99. Minimum workspace tests

Workspace tests should cover:

- supported workspace configuration;
- several package patterns;
- unmatched package pattern;
- overlapping patterns;
- duplicate package root;
- symbolic-link escape;
- package outside workspace;
- nested workspace;
- missing workspace file;
- workspace file with unsupported syntax;
- workspace package without importer;
- importer without workspace package.

---

## 100. Minimum workspace protocol tests

Workspace protocol tests should cover:

- valid local package resolution;
- version-compatible local package;
- version mismatch;
- missing target package;
- duplicate package name;
- stale lockfile resolution;
- external resolution where local was expected;
- package moved;
- unsupported selector;
- transitive workspace dependency;
- optional workspace dependency.

---

## 101. Minimum linking-mode tests

Linking-mode tests should cover:

- supported isolated layout;
- supported hoisted layout when implemented;
- unsupported mode;
- ambiguous configuration;
- executable resolution;
- workspace package link;
- dependency-store link;
- malicious symlink escape;
- host credential symlink;
- duplicate package traversal;
- dependency-store source exclusion.

Each mode requires separate capability status.

---

## 102. Minimum store tests

Store tests should cover:

- job-isolated store;
- tenant-isolated store;
- approved read-only shared store;
- attempted cross-tenant read;
- attempted cross-tenant write;
- poisoned package entry;
- integrity mismatch;
- private package isolation;
- credential leakage into store configuration;
- store path outside authorized filesystem;
- cleanup failure;
- incomplete offline store.

---

## 103. Minimum installation tests

Installation tests should cover:

- successful locked installation;
- manifest and lockfile mismatch;
- lockfile mutation attempt;
- missing package;
- private registry unavailable;
- wrong registry credential scope;
- lifecycle script disabled;
- required lifecycle script blocked;
- lifecycle script failure;
- timeout;
- memory exhaustion;
- process exhaustion;
- disk exhaustion;
- output truncation;
- partial store state;
- cleanup failure.

---

## 104. Minimum filtered-command tests

Filtered-command tests should cover:

- one package selected;
- dependency closure selected;
- dependent closure selected;
- unknown package;
- duplicate package name;
- package outside authorization;
- unbounded wildcard;
- hostile filter characters;
- graph digest mismatch;
- package moved;
- package removed;
- package added after selection;
- deterministic selection ordering.

Raw untrusted filter text must not execute.

---

## 105. Minimum package graph tests

Graph tests should cover:

- runtime dependency;
- development dependency;
- optional dependency;
- peer dependency;
- workspace protocol dependency;
- local path dependency;
- project reference;
- path alias;
- package export consumer;
- dependency cycle;
- missing package;
- unresolved importer;
- lockfile and manifest conflict;
- graph determinism.

---

## 106. Minimum evidence tests

Evidence tests should cover:

- same-package reference;
- workspace-package reference;
- workspace protocol consumer;
- path-alias consumer;
- project-reference consumer;
- package export consumer;
- test-only consumer;
- dynamic import;
- comment-only occurrence;
- string-only occurrence;
- analyzer traversal through symlink;
- duplicate analysis through store path;
- failed consumer package;
- stale lockfile evidence.

---

## 107. Minimum coverage tests

Coverage tests should cover:

- every required importer complete;
- one importer missing;
- one package failed;
- one package unsupported;
- unsupported package provably irrelevant;
- unsupported package possibly relevant;
- unresolved workspace protocol edge;
- unresolved local path dependency;
- unsupported linking mode;
- stale package graph;
- lockfile changed after analysis;
- package added after analysis;
- private registry package unavailable.

Complete coverage must require all relevant scope.

---

## 108. Minimum baseline tests

Baseline tests should cover:

- package gates pass;
- aggregate gates pass;
- target package fails;
- dependent package fails;
- recursive command partially fails;
- installation fails;
- required lifecycle script fails;
- lockfile changes during baseline;
- required gate unavailable;
- optional gate unavailable;
- timeout;
- resource exhaustion;
- malformed package-level result;
- cleanup failure.

---

## 109. Minimum classification tests

Classification tests should verify:

- no references under complete pnpm coverage;
- same-package liveness;
- cross-package liveness;
- workspace protocol consumer;
- package export consumer;
- unresolved local path dependency;
- failed importer;
- unsupported linking mode;
- unknown external public consumer;
- stale lockfile;
- input-order independence;
- positive evidence dominance.

---

## 110. Minimum remediation tests

Remediation tests should cover:

- exact package and function;
- wrong package with same symbol name;
- lockfile changed;
- workspace configuration changed;
- package graph changed;
- new consumer package added;
- target package moved;
- unauthorized manifest change;
- unauthorized lockfile change;
- unauthorized store artifact in patch;
- dependent package gate failure;
- aggregate gate failure;
- deterministic patch;
- idempotent transformation;
- stale authorization.

---

## 111. Minimum publisher tests

Publisher tests should cover:

- exact pnpm profile;
- wrong lockfile digest;
- stale package graph digest;
- stale coverage digest;
- missing package gate;
- missing aggregate gate;
- unexpected manifest change;
- unexpected lockfile change;
- wrong patch hash;
- default-branch rejection;
- draft pull-request creation;
- idempotent retry;
- provider partial state;
- Git-hook suppression;
- publisher inability to execute pnpm.

Live provider tests require separate authorization.

---

## 112. Minimum migration tests

Migration tests should cover:

- fresh database;
- upgrade from Phase 3A;
- existing npm workspace records;
- pnpm repository records;
- lockfile identities;
- importer records;
- workspace protocol edges;
- linking-mode records;
- partial installation attempts;
- multiple tenants;
- failed migration;
- retry;
- projection rebuild;
- audit preservation.

---

## 113. Minimum security tests

Security tests should cover:

- repository cannot select an arbitrary store path;
- package-manager links cannot escape the workspace;
- lifecycle scripts cannot access publisher credentials;
- lifecycle scripts cannot access controller credentials;
- private registry scope is enforced;
- Docker socket is unavailable;
- cloud metadata is unavailable;
- network profile is enforced;
- store data does not cross tenants;
- cache poisoning is detected;
- output is bounded;
- process limits apply across recursive workers;
- background processes are terminated;
- cleanup removes temporary registry configuration.

---

## 114. Fixture strategy

Phase 3B should use fixtures representing:

- single-package pnpm TypeScript repository;
- small pnpm workspace;
- workspace protocol dependencies;
- local path dependencies;
- peer dependencies;
- optional dependencies;
- supported isolated linking;
- supported hoisted linking when implemented;
- unsupported linking mode;
- duplicate package names;
- missing lockfile importer;
- lockfile and manifest mismatch;
- private registry requirement;
- malicious lifecycle script;
- store poisoning attempt;
- symbolic-link escape;
- alternate repository and package names.

Production behavior must not contain fixture-specific branches.

---

## 115. External repository tests

External pnpm repository testing requires explicit authorization.

The authorization must identify:

- canonical repository;
- immutable revision;
- permitted source access;
- permitted dependency installation;
- permitted registry destinations;
- credential capabilities;
- permitted commands;
- runner profile;
- data retention;
- cleanup;
- remediation permission;
- publication permission.

Historical access does not constitute current authorization.

The prohibited repository must never be used.

---

## 116. Scale boundary

Phase 3B establishes bounded functional pnpm support.

The phase report must state tested limits such as:

- workspace package count;
- importer count;
- lockfile package count;
- graph-edge count;
- file count;
- symbol count;
- recursive command concurrency;
- install duration;
- analysis duration;
- peak memory;
- disk and store use;
- output size.

Phase 3B must not claim enterprise-scale pnpm validation.

Broader scale validation belongs to Phase 10.

---

## 117. Capability acceptance criteria

The pnpm capability may become `functional` only when:

1. pnpm identification is deterministic.
2. Approved pnpm version resolution is deterministic.
3. Host-global fallback is prevented.
4. Supported lockfile versions are explicit.
5. Lockfile parsing is deterministic.
6. Importer-to-package mapping is exact.
7. Workspace package discovery is deterministic.
8. Workspace protocol resolution is implemented.
9. Local dependency resolution is bounded.
10. Package graph construction is deterministic.
11. Supported linking modes are explicit.
12. Symlink handling preserves isolation.
13. Store policy preserves tenant boundaries.
14. Locked installation preserves manifests and lockfiles.
15. Lifecycle-script behavior is explicit.
16. Filtered commands use structured package selection.
17. Package-level result attribution is preserved.
18. Package and workspace coverage are explicit.
19. Partial failures reduce coverage.
20. Required package baselines pass.
21. Required aggregate baselines pass.
22. Exact reproduction includes pnpm identities.
23. Unauthorized package-manager changes are rejected.
24. Required post-change gates pass.
25. Required runner controls pass.
26. Required migrations pass.
27. Required Phase 3B tests pass.
28. Generalization beyond one fixture is demonstrated.

---

## 118. Detection-only outcome

Phase 3B may validly provide detection-only pnpm support when:

- pnpm qualification is functional;
- lockfile and workspace graph construction are functional;
- evidence and coverage can be evaluated;
- classification remains conservative;
- remediation installation or verification remains unavailable;
- unsupported remediation behavior is explicit;
- the authorized completion scope permits detection-only support.

Detection-only support must not be described as pnpm remediation support.

---

## 119. Partially supported outcome

A pnpm profile may remain `partially_supported` when:

- one linking mode is supported but another is not;
- public registry behavior is supported but private registry behavior is not;
- workspace discovery is supported but lifecycle-script requirements prevent
  remediation;
- evidence is supported but aggregate gates are unavailable;
- lockfile parsing is supported but an advanced dependency feature is not.

The exact unsupported dimensions must remain explicit.

---

## 120. Blocked outcome

Phase 3B must remain blocked when applicable:

- pnpm identity is ambiguous;
- pnpm version cannot be resolved safely;
- required lockfile version is unsupported;
- lockfile parsing fails;
- importer mapping is ambiguous;
- required workspace package is inaccessible;
- required dependency relationship is unresolved;
- linking mode is unsupported;
- symlink isolation fails;
- store tenant isolation fails;
- required private registry access is unauthorized;
- required lifecycle scripts cannot run safely;
- locked installation mutates repository state;
- required package or aggregate gate fails;
- required runner control fails;
- migration tests fail;
- tenant isolation fails;
- required tests fail or are unavailable;
- authorization expires or is revoked.

A blocked result must identify the exact safe next action.

---

## 121. Phase completion criteria

Phase 3B may be reported complete only when all applicable criteria are
satisfied:

1. pnpm qualification is implemented.
2. pnpm version resolution is implemented.
3. Host-global fallback is prevented.
4. Supported lockfile parsing is implemented.
5. Lockfile importer mapping is implemented.
6. pnpm workspace discovery is implemented.
7. Package identity is deterministic.
8. Workspace protocol resolution is implemented.
9. Local path dependency handling is bounded.
10. Package graph construction is implemented.
11. Supported linking modes are explicit.
12. Symlink handling passes required tests.
13. Store isolation passes required tests.
14. Deterministic locked installation is implemented.
15. Lifecycle-script policy is enforced.
16. Private registry handling is bounded.
17. Filtered command routing is structured.
18. Package-level command results are preserved.
19. pnpm package coverage is implemented.
20. pnpm workspace coverage is implemented.
21. Partial failures preserve uncertainty.
22. Package baseline gates are implemented.
23. Aggregate baseline gates are implemented.
24. Exact reproduction includes pnpm identities.
25. Unauthorized manifest and lockfile changes are rejected.
26. Required post-change gates pass.
27. Required database migrations pass.
28. Required security controls pass.
29. Required Phase 3B tests pass.
30. Triggered conditional tests pass.
31. Capability statuses are updated truthfully.
32. Security-control matrix is updated.
33. Phase report is complete.
34. Execution state is updated.
35. No unresolved blocker contradicts completion.

---

## 122. Phase report

The Phase 3B completion report should include:

- authorization identity;
- objective;
- source commit before and after;
- files changed;
- migrations;
- dependencies;
- Node.js version;
- pnpm versions;
- lockfile versions;
- workspace profiles;
- linking modes;
- package counts;
- importer counts;
- package graph;
- workspace protocol behavior;
- local path dependency behavior;
- store policy;
- registry behavior;
- lifecycle-script behavior;
- filtered command behavior;
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

The report must not describe bounded pnpm support as universal package-manager
or monorepo support.

---

## 123. Execution-state handoff

The Phase 3B handoff should identify:

- phase status;
- authorization status;
- source commit;
- worktree state;
- supported pnpm profiles;
- supported pnpm versions;
- supported lockfile versions;
- supported linking modes;
- unsupported pnpm features;
- package graph capability;
- store policy;
- installation capability;
- test manifest;
- test results;
- security-control results;
- migrations;
- external operations;
- retained external state;
- cleanup state;
- next human decision.

The handoff must not authorize Phase 3C.

---

## 124. Transition to Phase 3C

Phase 3C may be proposed when bounded pnpm support is established and the
qualification system can distinguish Yarn repositories and Yarn operating
modes explicitly.

Before Phase 3C begins:

1. Finalize the Phase 3B report.
2. Update execution state.
3. Stop Phase 3B implementation.
4. Present actual pnpm capability statuses.
5. Record unsupported Yarn behavior.
6. Prepare a Phase 3C authorization.
7. Obtain explicit human approval.

Phase 3C must not start automatically.

---

## 125. Phase stop conditions

Work must stop when:

- Phase 3B authorization is inactive;
- authorization expires;
- authorization is revoked;
- repository or package scope is exceeded;
- a prohibited repository is encountered;
- repository identity cannot be verified;
- immutable source resolution fails;
- pnpm identity is ambiguous;
- pnpm version cannot be resolved safely;
- required lockfile parsing fails;
- required workspace identity is ambiguous;
- package graph completeness cannot be established;
- required registry access is unauthorized;
- required credential capability is unavailable;
- required lifecycle scripts cannot run safely;
- store isolation fails;
- symlink isolation fails;
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

## 126. Fail-safe behavior

When pnpm identity, lockfile semantics, importer mapping, workspace structure,
linking mode, store isolation, dependency resolution, package graph,
qualification, coverage, baseline state, transformation, verification, or
publication state cannot be established confidently:

- do not report full pnpm support;
- do not approximate unsupported lockfile semantics;
- do not infer missing importers;
- do not follow unsafe symlinks;
- do not use arbitrary host stores;
- do not expose registry credentials;
- do not treat installation failure as empty dependency state;
- do not classify the finding as safely removable;
- do not modify source;
- do not modify manifests or lockfiles;
- do not generate a publication-eligible patch;
- do not publish;
- preserve available evidence;
- return an explicit partial, unsupported, failed, stale,
  configuration-required, or blocked result;
- identify the exact missing requirement.

pnpm uncertainty must reduce classification, remediation, and publication
authority.

---

## 127. Document integrity

This roadmap file must not be modified during Phase 3B implementation unless
roadmap or governance modification is explicitly authorized.

Changes require:

1. Identification of the Phase 3B planning problem.
2. Review against the roadmap overview.
3. Review against permanent safety invariants.
4. Review of package-manager and lockfile implications.
5. Review of workspace, graph, linking, and store implications.
6. Review of registry and credential implications.
7. Review of remediation and publication implications.
8. Review of authorization and testing impact.
9. Updated Phase 3B test manifest where applicable.
10. Updated schemas or capability definitions where applicable.
11. A reviewable governance commit.
12. An ADR when the change alters long-lived pnpm, package-store,
    dependency-linking, registry, or workspace semantics.

This roadmap must not be weakened to make unsupported lockfiles, ambiguous
importers, unsafe links, unisolated stores, broken installations, failed gates,
failed tests, or unauthorized package-manager changes appear acceptable.