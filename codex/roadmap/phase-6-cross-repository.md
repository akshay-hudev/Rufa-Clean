# Phase 6 — Cross-Repository Analysis

This document defines the planned scope, capability boundaries, evidence
requirements, tests, stop conditions, and completion criteria for Phase 6 of
DCAv2.

Phase 6 extends evidence collection across authorized repository boundaries.

Its purpose is to discover consumers, references, exports, package relationships,
and other liveness evidence that cannot be established from one repository
alone.

Cross-repository absence must never be treated as proof of non-use unless the
required repository universe is explicitly defined, accessible, current, and
covered by the active profile.

An inaccessible, missing, stale, unsupported, or unauthorized repository must
preserve uncertainty for every finding it may affect.

This roadmap file does not authorize implementation, repository access,
credential use, organization enumeration, dependency installation, database
changes, remediation, publication, or destructive operations.

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
  id: phase-6-cross-repository
  name: Cross-Repository Analysis
  roadmap_order: 6
  default_status: inactive
  implementation_authorized_by_this_file: false
```

The phase becomes active only when the current authorization record explicitly
identifies `phase-6-cross-repository` as active.

---

## 2. Primary objective

The primary objective is to model liveness evidence across a bounded,
authorized set of repositories.

The phase should implement and validate applicable:

1. Repository-universe definition.
2. Canonical repository inventory.
3. Repository-access decisions.
4. Prohibited-repository exclusion before content retrieval.
5. Immutable repository snapshot sets.
6. Repository relationship discovery.
7. Package and artifact identity across repositories.
8. Published package metadata.
9. Cross-repository dependency edges.
10. Cross-repository semantic references.
11. Cross-repository configuration references.
12. Consumer discovery.
13. Repository-level failure and access accounting.
14. Cross-repository coverage.
15. Conservative classification.
16. Finding-specific human disposition.
17. Separate remediation authorization.
18. Exact cross-repository reproduction.
19. Target-repository verification.
20. Consumer verification where required and authorized.
21. Trusted draft publication when separately authorized.
22. Append-only audit and truthful reporting.

Phase 6 should remain detection-focused until cross-repository remediation safety
is proven.

---

## 3. Intended capability

The intended capability is conceptually:

```text
Analyze one supported target repository together with a bounded authorized set
of possible consumer repositories, determine whether a supported symbol or
package surface is referenced across that set, and preserve uncertainty whenever
the possible consumer universe is incomplete.
```

The capability must remain constrained by:

- authorized provider scope;
- authorized accounts or installations;
- authorized repositories;
- immutable repository revisions;
- repository-inventory completeness;
- supported languages;
- supported package and artifact ecosystems;
- supported semantic-index formats;
- supported dependency relationships;
- supported configuration references;
- explicit repository-universe coverage;
- exact finding identity;
- current evidence and coverage;
- current human disposition;
- separate remediation authorization;
- required target and consumer verification;
- runner security;
- trusted publication controls.

A successful analysis of several repositories must not be described as complete
organization-wide coverage unless the selected repository universe is proven
complete for the active profile.

---

## 4. Phase prerequisites

Phase 6 should not begin until earlier phases have established or bounded:

- canonical repository identity;
- immutable source acquisition;
- repository qualification;
- package and module identity;
- source and symbol identity;
- evidence normalization;
- coverage accounting;
- language-specific semantic references;
- monorepo package graphs;
- package-manager-specific dependency behavior;
- human disposition;
- separate remediation authorization;
- exact finding reproduction;
- baseline and post-change verification;
- trusted publisher separation;
- additive database evolution;
- capability reporting;
- security-control reporting.

At least one language profile should be functional enough to produce stable
repository-local symbol and reference identities before cross-repository
aggregation begins.

---

## 5. Non-goals

Phase 6 does not, by default, include:

- unrestricted organization-wide crawling;
- unrestricted account enumeration;
- automatic access to every repository;
- public internet source-code discovery;
- external customer repository discovery;
- universal package-registry analysis;
- universal artifact-registry analysis;
- runtime telemetry;
- microservice contract analysis;
- message-bus consumer analysis;
- production deployment analysis;
- infrastructure-as-code analysis;
- automatic multi-repository remediation;
- coordinated changes across several repositories;
- automatic dependency upgrades;
- package-version publication;
- automatic release creation;
- automatic branch creation in consumer repositories;
- automatic pull requests in consumer repositories;
- public API removal;
- direct default-branch publication;
- pull-request merge;
- organization-wide campaign orchestration;
- enterprise-scale validation.

Contract, service, runtime, infrastructure, and campaign behavior belongs to
later phases.

---

## 6. Authorization prerequisites

The active Phase 6 authorization must identify applicable:

- provider;
- account or installation scope;
- organization or owner scope;
- explicitly permitted repositories;
- repository-discovery permission;
- metadata-access permission;
- source-access permission;
- immutable revisions;
- target repository;
- possible consumer repositories;
- excluded repositories;
- repository-operation types;
- language profiles;
- package and artifact profiles;
- semantic-index permissions;
- dependency-installation permission;
- build and test permission;
- network access;
- provider credential capabilities;
- package-registry credential capabilities;
- database operations;
- migrations;
- remediation permission;
- target-repository publication permission;
- consumer-repository modification permission;
- external cleanup permission;
- destructive-operation permission;
- required tests;
- stop conditions;
- expiration or completion boundary.

Broad provider access does not authorize every repository operation.

Missing permissions default to denial.

---

## 7. Required phase outputs

Phase 6 should produce applicable:

- repository-universe model;
- repository-inventory records;
- repository-access decision records;
- repository snapshot-set model;
- repository relationship graph;
- package and artifact identities across repositories;
- source-publication relationships;
- dependency graph across repositories;
- semantic-index ingestion;
- cross-repository reference evidence;
- cross-repository configuration evidence;
- consumer discovery results;
- repository failure and freshness records;
- cross-repository coverage profiles;
- cross-repository classification profiles;
- exact reproduction rules;
- target and consumer verification profiles;
- additive database migrations;
- audit events;
- phase test manifest;
- capability-matrix updates;
- security-control updates;
- phase-completion report;
- updated execution state.

---

## 8. Capability identifiers

Phase 6 should define or update capability identifiers such as:

```text
repository.universe.define.v1
repository.inventory.provider.v1
repository.access.evaluate.v1
repository.snapshot-set.create.v1
repository.relationship-graph.v1
artifact.source-repository-map.v1
package.cross-repository.identity.v1
dependency.cross-repository.resolve.v1
semantic-index.cross-repository.ingest.v1
analysis.cross-repository.references.v1
analysis.cross-repository.configuration-consumers.v1
analysis.cross-repository.package-consumers.v1
coverage.cross-repository.consumer-universe.v1
classification.cross-repository.v1
reproduction.cross-repository.finding.v1
verification.cross-repository.consumer-set.v1
```

Language- and ecosystem-specific identifiers should remain explicit.

Examples include:

```text
analysis.typescript.cross-repository-package-consumers.v1
analysis.python.cross-repository-package-consumers.v1
analysis.scip.cross-repository-references.v1
```

Every identifier must remain narrow, versioned, and testable.

---

## 9. Repository universe

A repository universe is the bounded set of repositories considered relevant to
one cross-repository analysis.

The universe should identify:

- universe ID;
- tenant;
- provider;
- account or installation;
- organization or owner scope;
- repository selection rule;
- explicit inclusions;
- explicit exclusions;
- prohibited repositories;
- target repository;
- possible consumer repositories;
- selection time;
- authorization identity;
- universe version;
- universe digest;
- completeness claim;
- known limitations.

The repository universe must never be inferred solely from repositories that
happen to be locally available.

---

## 10. Universe types

Phase 6 may support bounded universe types such as:

- explicit repository list;
- authorized provider installation repository set;
- authorized organization repository set;
- package-consumer repository set;
- dependency-graph-derived repository set;
- trusted operator-curated repository set.

Each type must have separate completeness semantics.

A curated list may be useful but must not be described as organization-complete
unless completeness is proven.

---

## 11. Explicit repository-list universe

An explicit repository-list universe should record:

- every repository identity;
- source of the list;
- human authorizer;
- inclusion reason;
- exclusion reason;
- expected consumer relevance;
- access status;
- immutable revision selection policy.

The list may be complete only for the declared bounded purpose.

It must not imply that no unlisted repositories exist.

---

## 12. Provider installation universe

A provider installation may expose a set of repositories.

Qualification should identify:

- installation identity;
- account identity;
- repository pagination state;
- repository count;
- accessible repositories;
- inaccessible repositories;
- suspended or archived repositories;
- forks;
- templates;
- mirrors;
- disabled repositories;
- enumeration time;
- provider response identity.

Provider installation access must still be filtered through DCAv2 repository
policy and the prohibited-repository policy.

---

## 13. Organization repository universe

An organization-scoped universe requires explicit authorization to enumerate
organization repositories.

The inventory should preserve:

- organization identity;
- enumeration method;
- pagination completeness;
- provider rate-limit status;
- archived repositories;
- private repositories;
- internal repositories;
- public repositories;
- forks;
- mirrors;
- inaccessible repositories;
- repositories excluded by policy;
- repositories denied by the prohibited list.

A partial provider response must not become a complete organization inventory.

---

## 14. Repository inventory

Every inventoried repository should retain applicable:

- canonical repository ID;
- provider;
- account or installation;
- owner;
- name;
- canonical full name;
- visibility;
- archived status;
- fork status;
- mirror status;
- default branch;
- primary language as provider metadata only;
- access status;
- policy status;
- prohibited status;
- inventory time;
- metadata digest.

Provider metadata must not replace source qualification.

---

## 15. Inventory freshness

Repository inventory becomes stale when applicable:

- provider installation scope changes;
- organization membership changes;
- repository visibility changes;
- repositories are added or removed;
- access permissions change;
- enumeration pagination was incomplete;
- inventory retention exceeds the profile freshness window;
- provider metadata semantics change.

Stale inventory must not satisfy a current completeness claim.

---

## 16. Inventory completeness

Inventory completeness should use statuses such as:

- `complete`;
- `partial`;
- `failed`;
- `unauthorized`;
- `rate_limited`;
- `stale`;
- `unsupported`;
- `unknown`.

Only `complete` may satisfy a repository-universe dimension that requires full
provider or organization enumeration.

A rate-limited or partially paginated result must remain incomplete.

---

## 17. Prohibited-repository enforcement

The prohibited-repository policy must be evaluated before content retrieval.

The absolute prohibited repository remains:

```text
akshay-hudev/Rufa-Clean
```

DCAv2 must not:

- clone it;
- fetch it;
- inspect its branches;
- inspect its commits;
- inspect its files;
- qualify it;
- analyze it;
- index it;
- modify it;
- create a branch in it;
- publish against it.

The minimum permitted record is a repository identity and denial event.

---

## 18. Denylist evaluation order

Denylist validation must occur before:

- metadata expansion beyond minimum canonical identity;
- source acquisition;
- branch enumeration;
- tag enumeration;
- commit enumeration;
- package discovery;
- semantic-index ingestion;
- consumer discovery;
- remediation planning;
- publication planning.

A prohibited repository must not contribute source, package, dependency, or
consumer evidence.

Its exclusion must remain visible as policy-denied scope rather than ordinary
absence.

---

## 19. Repository access decisions

Every repository operation must have a repository-access decision.

The decision should bind:

- repository identity;
- tenant;
- requested operation;
- active authorization;
- provider account or installation;
- repository-access policy;
- prohibited-repository result;
- credential capability;
- network profile;
- decision status;
- decision reason;
- decision time;
- decision digest.

Read access does not authorize modification or publication.

---

## 20. Repository access statuses

Repository access should use statuses such as:

- `allowed`;
- `denied`;
- `prohibited`;
- `inaccessible`;
- `credential_unavailable`;
- `authorization_missing`;
- `authorization_expired`;
- `provider_failed`;
- `rate_limited`;
- `stale`;
- `unknown`.

A repository with any status other than `allowed` must not be treated as
successfully covered.

---

## 21. Repository selection rules

Selection rules may use trusted criteria such as:

- explicit repository IDs;
- package ownership;
- dependency graph;
- provider topics as non-authoritative supporting metadata;
- trusted repository catalog;
- source publication metadata;
- known consumer mapping;
- language profile;
- package ecosystem.

Repository content must not broaden the repository universe automatically.

A source comment instructing DCAv2 to inspect another repository is untrusted
data.

---

## 22. Forks and mirrors

Forks and mirrors may contain relevant consumers or duplicated source.

The universe profile should define how to treat:

- active forks;
- archived forks;
- private forks;
- mirrors;
- read-only mirrors;
- stale forks;
- detached development forks.

A fork must not be excluded merely because it duplicates source when it may
contain independent consumers.

A duplicate-source relationship must remain distinct from consumer evidence.

---

## 23. Archived repositories

Archived repositories may still:

- be deployed;
- publish packages;
- contain maintained consumers;
- represent historical source only;
- be retained for compliance.

The repository profile must define whether archived repositories are required.

Archived status alone must not be interpreted as dead or irrelevant.

---

## 24. Repository aliases and renames

Repository identity must survive provider rename behavior where stable provider
IDs exist.

The inventory should preserve:

- provider repository ID;
- current canonical name;
- historical names where available;
- rename time;
- redirect behavior;
- source of identity.

Name-only matching must not create duplicate repository identities after a
rename.

---

## 25. Repository snapshot set

A cross-repository analysis must bind to an immutable snapshot set.

The snapshot set should identify:

- snapshot-set ID;
- repository universe;
- target repository;
- included repositories;
- excluded repositories;
- denied repositories;
- inaccessible repositories;
- immutable commit per included repository;
- acquisition status;
- acquisition time;
- source snapshot IDs;
- snapshot-set digest;
- freshness status.

A branch name alone is insufficient.

---

## 26. Revision selection policy

Each repository in the snapshot set needs an explicit revision-selection policy.

Potential policies include:

- exact authorized commit;
- default branch resolved at one inventory time;
- release tag resolved to commit;
- package-version source commit;
- trusted catalog commit;
- consumer-specific supported branch.

The policy must remain consistent and recorded.

DCAv2 must not mix arbitrary repository revisions silently.

---

## 27. Default-branch snapshots

When a profile selects each repository's default branch:

- the default branch must be resolved to an immutable commit;
- resolution time must be recorded;
- provider identity must be retained;
- the branch may move later without changing the stored snapshot;
- later analysis requires freshness evaluation.

A set of independently resolved commits represents one cross-repository
analysis epoch, not a globally atomic organization snapshot.

This limitation must remain explicit.

---

## 28. Snapshot atomicity

Most providers cannot provide a truly atomic snapshot across many repositories.

The snapshot-set record must state:

- repository resolution order;
- start time;
- completion time;
- per-repository resolution time;
- repositories changed during acquisition where detectable;
- consistency limitations.

A non-atomic snapshot must not be described as an exact organization state at
one instant.

---

## 29. Snapshot-set freshness

A snapshot set becomes stale when applicable:

- the target repository changes;
- a required consumer repository changes;
- repository access changes;
- a repository is added to the authorized universe;
- a repository is removed from the authorized universe;
- dependency metadata changes;
- package publication changes;
- repository selection rules change;
- semantic-index rules change;
- the freshness window expires.

Stale snapshot sets must not satisfy remediation prerequisites.

---

## 30. Source acquisition

Each repository source snapshot must be acquired through an approved read
operation.

Source acquisition should record:

- repository identity;
- requested revision;
- resolved commit;
- provider credential capability;
- acquisition command;
- network profile;
- source digest where applicable;
- acquisition status;
- cleanup status.

Source acquisition must not use publisher credentials.

---

## 31. Source acquisition isolation

Repositories should be acquired into isolated, repository-specific paths.

The acquisition process must prevent:

- path collision;
- repository-name collision;
- symbolic-link escape;
- Git alternates pointing to unauthorized objects;
- unsafe submodule traversal;
- credential persistence;
- Git-hook execution;
- cross-tenant cache leakage.

Repository paths must derive from canonical internal IDs rather than untrusted
names alone.

---

## 32. Git submodules

Submodules may cross repository boundaries.

Qualification should identify:

- submodule declaration;
- submodule URL;
- canonical repository identity where resolvable;
- pinned commit;
- authorization status;
- prohibited status;
- access status;
- inclusion in the repository universe;
- source acquisition status.

A submodule must not be fetched automatically without its own repository-access
decision.

An inaccessible relevant submodule must reduce coverage.

---

## 33. Git subtree and vendored copies

A repository may contain copied source from another repository.

The system should distinguish:

- Git submodule;
- subtree;
- vendored copy;
- generated copy;
- mirror;
- ordinary duplicated source.

A vendored copy may provide local liveness evidence but must not be treated as a
live connection to the source repository automatically.

---

## 34. Repository relationship graph

The repository relationship graph should model applicable relationships such as:

- source publishes package;
- repository consumes package;
- repository contains workspace package;
- repository generates client from another repository;
- repository vendors another repository;
- repository mirrors another repository;
- repository references another repository in build configuration;
- repository contains submodule;
- repository depends on released artifact;
- repository consumes source revision directly.

Every edge must retain provenance and resolution status.

---

## 35. Relationship edge identity

A repository relationship edge should include:

- source repository;
- target repository;
- relationship type;
- package or artifact identity;
- declaration occurrence;
- resolved version or revision;
- environment scope;
- producer;
- producer version;
- confidence;
- freshness;
- ambiguity.

A textual repository-name mention must not become an authoritative dependency
edge.

---

## 36. Package identity across repositories

A cross-repository package identity should bind applicable:

- ecosystem;
- registry;
- package scope;
- package name;
- package namespace;
- source repository;
- source package root;
- published versions;
- source commit mapping;
- package metadata digest;
- visibility;
- support status.

Package name alone may be ambiguous across registries or private scopes.

---

## 37. Artifact identity

An artifact identity may include:

- ecosystem;
- registry;
- artifact name;
- version;
- digest;
- source repository;
- source commit;
- build identity;
- publication time;
- provenance;
- support status.

A version string without registry and digest context may be insufficient.

Phase 6 should not assume every artifact version maps uniquely to one source
commit unless that mapping is verified.

---

## 38. Source-to-artifact mapping

Source-to-artifact mapping may use applicable:

- trusted release metadata;
- package publication metadata;
- source repository metadata;
- build provenance;
- signed attestations;
- tags as supporting evidence;
- lockfile-integrated source references;
- trusted operator mapping.

An unverified tag-name convention must not establish an authoritative source
commit.

Ambiguous mappings must remain explicit.

---

## 39. Published package metadata

Published package metadata may provide:

- package version;
- source repository URL;
- distribution digest;
- dependency metadata;
- publication time;
- entry points;
- export surface;
- language version;
- source-map reference;
- provenance.

Registry metadata is external input and must be validated, bounded, and treated
as untrusted data.

---

## 40. Registry access

Package-registry access requires:

- authorized destination;
- package scope;
- credential capability;
- network profile;
- rate-limit handling;
- response-size limits;
- metadata-validation rules;
- audit recording.

Registry credentials must not be exposed to repository-controlled commands
unless separately required for an approved installation stage.

---

## 41. Dependency edges across repositories

Cross-repository dependency edges may derive from:

- package manifests;
- lockfiles;
- project files;
- build configuration;
- package publication metadata;
- source-revision dependencies;
- local path references;
- generated client relationships;
- trusted catalogs.

The edge should distinguish:

- declared dependency;
- resolved dependency;
- optional dependency;
- development dependency;
- peer dependency;
- test dependency;
- build dependency;
- source dependency;
- generated-client dependency.

---

## 42. Dependency version ranges

A consumer may declare a version range rather than one exact version.

The relationship model should retain:

- declared range;
- resolved version in the consumer snapshot;
- lockfile identity;
- registry identity;
- source mapping status;
- compatibility uncertainty;
- update policy where known.

A consumer using an older released version may not reference the target
repository's current source.

The classification profile must account for this distinction.

---

## 43. Unlocked dependencies

A repository without a resolved lockfile may not establish an exact dependency
version.

The result should identify:

- declared range;
- possible versions;
- installation-time variability;
- registry state;
- environment-specific resolution;
- coverage impact.

An unlocked relevant dependency must not be treated as one exact consumer state
without further evidence.

---

## 44. Source-revision dependencies

Some consumers depend directly on:

- Git repository;
- branch;
- tag;
- commit;
- archive URL;
- local path.

The resolver should retain:

- declared source;
- canonical repository identity;
- requested revision;
- resolved commit when available;
- authorization status;
- integrity information;
- access status.

A mutable branch dependency must remain freshness-sensitive.

---

## 45. Cross-repository semantic indexes

Semantic indexes may provide normalized symbol and reference data across
repositories.

Potential formats include:

- SCIP;
- language-server indexes;
- compiler-generated indexes;
- other versioned semantic formats.

Each ingested index must bind to:

- repository;
- source commit;
- language profile;
- producer;
- producer version;
- configuration;
- index format version;
- artifact digest;
- generation status;
- coverage status.

---

## 46. Semantic-index trust

A semantic index is untrusted derived evidence.

The trusted controller must validate:

- schema;
- format version;
- repository identity;
- source commit;
- path normalization;
- symbol identities;
- reference locations;
- artifact size;
- duplicate records;
- malformed records;
- unsupported features.

Index content must not grant authorization or execute commands.

---

## 47. Semantic-index generation

When indexes are generated by DCAv2:

- generation must occur in the untrusted runner;
- each repository must use an approved profile;
- dependency preparation must be separately authorized;
- tool versions must be fixed;
- network access must be bounded;
- output must be bounded;
- generation failures must remain repository-specific;
- cleanup must be verified.

A failed index generation must not become an empty index.

---

## 48. Precomputed indexes

Precomputed indexes may be ingested only when their provenance is sufficient.

The record should identify:

- source;
- repository;
- source commit;
- generator;
- generator version;
- generation time;
- signer or attestation where available;
- artifact digest;
- trust status;
- freshness.

An index with unknown source commit cannot satisfy exact coverage.

---

## 49. Symbol identity across repositories

Cross-repository symbol identity should preserve:

- source repository;
- source commit;
- package or module;
- source file;
- source occurrence;
- semantic symbol identity;
- export or visibility state;
- artifact version where relevant;
- language profile.

Symbols with similar qualified names in different repositories must remain
distinct.

---

## 50. Cross-repository references

A cross-repository reference should identify:

- consumer repository;
- consumer commit;
- consumer package or module;
- source occurrence;
- target repository;
- target package or artifact;
- target symbol when resolvable;
- target artifact version;
- reference type;
- resolution method;
- confidence;
- ambiguity;
- producer;
- freshness.

A package-level dependency is not automatically a symbol-level reference.

---

## 51. Reference resolution levels

Cross-repository evidence should distinguish:

- repository-level relationship;
- package-level dependency;
- module-level import;
- symbol-level reference;
- public-surface exposure;
- configuration-level reference;
- generated-client relationship;
- unresolved candidate.

Only exact supported resolution should become authoritative symbol-level
liveness evidence.

---

## 52. Package-level consumer evidence

Package-level consumer evidence may prove that a repository consumes a package
without proving that it uses one particular symbol.

This evidence should affect:

- repository-universe selection;
- public-surface risk;
- consumer verification selection;
- coverage requirements.

It should not become a direct symbol reference without additional resolution.

---

## 53. Public-surface exposure

A target symbol may be exposed through:

- package exports;
- module exports;
- public classes;
- public interfaces;
- stubs;
- generated declarations;
- package entry points;
- registry metadata;
- documentation as supporting evidence.

A public symbol with unknown external consumers must not become
remediation-eligible based only on authorized repository absence.

---

## 54. Internal-symbol boundary

Phase 6 should initially focus on symbols whose external consumer scope can be
bounded.

Examples include:

- private implementation symbol;
- unexported package symbol;
- internal package member;
- repository-private helper.

Even internal symbols may have cross-repository consumers through unsupported
reflection, generated code, or source copying.

The active profile must explain why external symbol access is impossible or
covered.

---

## 55. Configuration references across repositories

A consumer repository may refer to a target through:

- package name;
- module path;
- class name;
- function name;
- generated-client configuration;
- build configuration;
- plugin configuration;
- dependency-injection configuration;
- source repository URL;
- artifact coordinates.

Every supported configuration adapter must define exact resolution behavior.

A textual name match alone is insufficient.

---

## 56. Generated client relationships

One repository may generate client code from another repository's source or
artifact.

Phase 6 may record:

- generator repository;
- source repository;
- source artifact;
- generated output repository;
- generation command identity;
- artifact version;
- source commit;
- generated output identity;
- freshness.

Detailed service-contract semantics belong to Phase 7.

A generated-client relationship alone may still indicate consumer relevance.

---

## 57. Cross-repository tests as evidence

Consumer tests may provide liveness or compatibility evidence.

The record should identify:

- consumer repository;
- consumer commit;
- target artifact version;
- selected tests;
- environment;
- result;
- limitations;
- freshness.

A passing consumer test against an older package version does not prove
compatibility with a target-source deletion unless the tested artifact includes
that deletion.

---

## 58. Repository-local failures

Each repository analysis may independently produce:

- success;
- partial success;
- unsupported;
- inaccessible;
- failed;
- timed out;
- resource exceeded;
- stale;
- unauthorized.

The cross-repository aggregate must preserve every repository result.

A failed repository must not be treated as having no references.

---

## 59. Partial universe failure

A cross-repository analysis may complete for some repositories and fail for
others.

The result must preserve:

- completed repositories;
- failed repositories;
- inaccessible repositories;
- denied repositories;
- prohibited repositories;
- unsupported repositories;
- stale repositories;
- affected relationships;
- affected findings;
- retry safety;
- aggregate coverage impact.

Partial success must not become complete universe coverage.

---

## 60. Proving irrelevance

A repository may be excluded from a finding's required consumer set only when
the active profile can prove it cannot contain a relevant consumer.

Possible evidence includes:

- no dependency path to the target package;
- incompatible language or ecosystem;
- repository archived and outside the declared supported deployment universe
  under an approved profile;
- package graph proves isolation;
- trusted catalog marks the repository outside the target product boundary;
- repository contains no supported consumer surface after complete
  qualification.

Convenience, naming, or provider language metadata is insufficient.

---

## 61. Consumer-set derivation

The required consumer set should be derived deterministically from:

- repository universe;
- package and artifact identity;
- dependency graph;
- source-revision dependencies;
- generated-client relationships;
- configuration references;
- trusted catalog relationships;
- profile-specific public-surface rules.

The derivation should produce:

- included consumers;
- excluded repositories;
- exclusion proof;
- unresolved candidates;
- failed candidates;
- consumer-set digest.

---

## 62. Consumer-set statuses

Consumer-set entries should use statuses such as:

- `required`;
- `confirmed_consumer`;
- `possible_consumer`;
- `proven_irrelevant`;
- `inaccessible`;
- `unauthorized`;
- `unsupported`;
- `failed`;
- `stale`;
- `prohibited`;
- `unknown`.

Only `proven_irrelevant` may safely remove an authorized repository from the
required consumer analysis set.

---

## 63. Consumer-set freshness

A consumer set becomes stale when applicable:

- repository inventory changes;
- dependency graph changes;
- package publication changes;
- repository access changes;
- consumer manifests change;
- lockfiles change;
- target exports change;
- trusted catalog changes;
- selection rules change.

Stale consumer sets must not support remediation.

---

## 64. Cross-repository evidence model

Cross-repository evidence should retain applicable:

- target repository;
- target commit;
- target package or module;
- target symbol;
- consumer repository;
- consumer commit;
- consumer package or module;
- source occurrence;
- relationship type;
- artifact version;
- evidence type;
- polarity;
- strength;
- ambiguity;
- producer;
- producer version;
- adapter version;
- configuration identity;
- freshness;
- raw artifact digest.

Evidence must remain tenant-scoped.

---

## 65. Evidence polarity

Cross-repository evidence may be:

- positive liveness;
- negative absence within one repository;
- supporting relationship;
- ambiguous;
- contradictory;
- unsupported;
- failed.

Positive exact consumer evidence must dominate absence evidence.

Repository-local absence must not be promoted to universe-wide absence without
complete cross-repository coverage.

---

## 66. Evidence freshness

Cross-repository evidence becomes stale when applicable:

- target source changes;
- consumer source changes;
- artifact mapping changes;
- lockfile changes;
- package graph changes;
- semantic-index producer changes;
- index format changes;
- configuration changes;
- repository inventory changes;
- access scope changes;
- adapter semantics change.

Stale consumer evidence must not satisfy remediation prerequisites.

---

## 67. Cross-repository coverage profile

A cross-repository coverage profile should define required dimensions such as:

- repository-universe completeness;
- repository-access evaluation;
- prohibited-repository exclusion;
- immutable snapshot-set creation;
- target repository qualification;
- consumer repository qualification;
- package and artifact identity;
- source-to-artifact mapping;
- dependency graph completeness;
- semantic-index completeness;
- configuration-reference coverage;
- public-surface coverage;
- generated-client relationship coverage;
- repository failure accounting;
- freshness;
- required consumer verification availability.

Every dimension must have an explicit status.

---

## 68. Coverage statuses

Cross-repository coverage should use statuses such as:

- `complete`;
- `partial`;
- `failed`;
- `unsupported`;
- `unavailable`;
- `unauthorized`;
- `prohibited`;
- `excluded`;
- `stale`;
- `not_applicable`;
- `unknown`.

Only `complete` may satisfy a required dimension.

A policy-prohibited repository is not equivalent to a successfully analyzed
repository.

---

## 69. Repository coverage records

Each repository should have a coverage record identifying:

- repository identity;
- selected commit;
- access status;
- qualification status;
- language profiles;
- package and module discovery;
- semantic-index status;
- dependency-analysis status;
- configuration-analysis status;
- source-reference status;
- public-surface relevance;
- consumer relevance;
- completion status.

A repository-level failure must remain visible in aggregate coverage.

---

## 70. Universe coverage aggregation

Universe coverage should derive from:

- inventory completeness;
- snapshot-set completeness;
- repository access;
- repository qualification;
- relationship graph completeness;
- consumer-set derivation;
- repository-level coverage;
- package and artifact resolution;
- semantic-index coverage;
- configuration coverage;
- public-surface coverage;
- freshness.

A simple repository completion percentage is insufficient.

---

## 71. Cross-repository coverage digest

A deterministic coverage digest should bind applicable:

- repository-universe identity;
- authorization identity;
- inventory digest;
- snapshot-set digest;
- repository identities and commits;
- package and artifact identities;
- relationship graph digest;
- consumer-set digest;
- repository coverage records;
- semantic-index identities;
- configuration digests;
- failed and inaccessible scope;
- excluded scope;
- completion statuses.

Changing any required repository or identity must invalidate the digest.

---

## 72. Open-world behavior

Cross-repository analysis is open-world by default.

Unknown scope may include:

- repositories outside the authorized provider installation;
- inaccessible private repositories;
- external customers;
- public package consumers;
- forks;
- copied source;
- unregistered consumers;
- locally installed scripts;
- generated clients;
- runtime-loaded plugins;
- source-revision dependencies;
- untracked package registries.

Unknown relevant scope must prevent unsafe public-surface or cross-repository
dead-code conclusions.

---

## 73. Classification profile

A cross-repository classification profile must remain narrow.

A finding may become `candidate_dead` only when:

- the target symbol shape is supported;
- target repository identity is current;
- target source commit is current;
- required repository universe is defined;
- repository inventory is complete for that profile;
- required repositories are authorized and accessible;
- required snapshot set is current;
- required consumer set is complete;
- required repository coverage is complete;
- package and artifact mappings are current;
- no positive consumer evidence exists;
- no unresolved possible consumer remains;
- no public or external-consumer uncertainty affects the target;
- required analyzers succeeded;
- classification is deterministic.

A classification is not a human disposition.

---

## 74. Public API classification

Phase 6 should not initially classify public APIs as safely dead merely because
authorized internal repositories contain no references.

Public API analysis requires a profile that establishes the complete relevant
consumer universe.

Without that proof, the result should be:

- `inconclusive`;
- `detection_only`;
- or `unsupported`.

External publication metadata and public package availability should increase,
not reduce, consumer uncertainty.

---

## 75. Internal package classification

A repository-internal or organization-internal package symbol may be eligible
for stronger conclusions when:

- visibility is bounded;
- package publication is private;
- authorized repository inventory is complete;
- all permitted consumers are covered;
- no external distribution exists;
- no inaccessible consumer remains;
- no relevant source-revision dependency remains;
- no runtime or contract evidence belongs to a later phase.

The exact boundary must be documented in the profile.

---

## 76. Classification outcomes

Applicable outcomes may include:

- `live`;
- `candidate_dead`;
- `inconclusive`;
- `detection_only`;
- `unsupported`;
- `failed`;
- `stale`;
- `access_blocked`.

`Access_blocked` should preserve the fact that authorization or repository
access prevented required analysis.

---

## 77. Classification explanation

The explanation should include:

- target repository;
- target commit;
- target package or module;
- target symbol;
- repository-universe identity;
- inventory completeness;
- snapshot-set identity;
- required consumer set;
- repositories analyzed;
- repositories inaccessible;
- repositories unauthorized;
- repositories prohibited;
- repositories unsupported;
- package and artifact mappings;
- dependency evidence;
- semantic references;
- configuration references;
- public-surface evidence;
- unresolved consumer scope;
- coverage digest;
- policy version;
- resulting status.

The explanation must make incomplete repository scope visible.

---

## 78. Human disposition

Human disposition remains finding-specific and separate from machine
classification.

A cross-repository disposition should bind to:

- finding ID;
- target repository;
- target commit;
- target symbol;
- repository-universe ID;
- snapshot-set ID;
- consumer-set digest;
- evidence digest;
- coverage digest;
- classification identity;
- human actor;
- timestamp.

A material repository, consumer, evidence, inventory, or coverage change may
make the disposition stale.

---

## 79. Remediation authorization

Remediation authorization must remain separate and should bind to:

- authorization ID;
- finding ID;
- target repository;
- target commit;
- target package or module;
- target symbol;
- repository-universe ID;
- snapshot-set digest;
- consumer-set digest;
- evidence digest;
- coverage digest;
- human disposition;
- transformation ID;
- permitted target files;
- permitted target repository;
- consumer verification plan;
- publication permission;
- expiration or completion boundary;
- human authorizer.

Authorization to modify the target repository must not permit consumer
repository changes.

---

## 80. Default remediation boundary

Phase 6 should default to:

- detection-only cross-repository evidence;
- target-repository-only remediation;
- no consumer-repository source modification;
- no coordinated multi-repository patch;
- no package publication;
- no dependency update.

Target-repository remediation may proceed only when the selected profile proves
that consumer coverage and verification are sufficient.

---

## 81. Exact cross-repository reproduction

Before target modification, DCAv2 must reproduce:

- target repository identity;
- target source commit;
- target finding identity;
- repository-universe identity;
- repository inventory;
- snapshot-set identity;
- every required repository commit;
- package and artifact mappings;
- relationship graph;
- consumer set;
- cross-repository evidence digest;
- cross-repository coverage digest;
- human disposition;
- remediation authorization.

Any material mismatch must block transformation.

---

## 82. Reproduction failure

Reproduction must fail when applicable:

- target source changed;
- required consumer repository changed;
- repository inventory changed;
- a new repository entered the universe;
- repository access changed;
- a consumer manifest changed;
- a consumer lockfile changed;
- package publication changed;
- package exports changed;
- a new semantic reference appeared;
- consumer set changed;
- coverage became partial;
- authorization expired;
- disposition became stale.

Approximate reuse of a prior cross-repository finding must not proceed.

---

## 83. Target baseline gates

Target-repository baseline gates should continue to follow the language and
repository profile.

Applicable gates include:

- dependency preparation;
- parsing;
- type checking;
- compilation;
- build;
- lint;
- tests;
- package validation;
- generated-artifact validation;
- repository-status validation.

Every required target gate must pass or satisfy an explicitly authorized
pre-existing-failure policy.

---

## 84. Consumer verification plan

The remediation authorization should define whether consumer verification is:

- required for every confirmed consumer;
- required for all possible consumers;
- required for a graph-derived dependent set;
- unavailable;
- not applicable under a proven internal-symbol profile.

The plan should identify:

- consumer repositories;
- consumer commits;
- target artifact or source representation;
- selected commands;
- dependency substitution method;
- expected results;
- security profile;
- cleanup.

An undefined consumer verification plan must not be assumed sufficient.

---

## 85. Consumer verification strategies

Potential bounded strategies include:

- static consumer reanalysis against the changed target surface;
- consumer compilation against a locally built candidate artifact;
- consumer tests against a candidate artifact;
- source-level substitution in an isolated workspace;
- package override in an isolated dependency environment;
- compatibility checks against generated declarations.

Each strategy requires a versioned profile and tests.

Phase 6 must not alter committed consumer manifests or lockfiles merely for
verification unless explicitly authorized.

---

## 86. Candidate artifact verification

When a target repository produces a package or artifact, DCAv2 may build a
candidate artifact in the untrusted runner.

The record should identify:

- target source commit;
- patched source digest;
- build command;
- toolchain;
- artifact identity;
- artifact digest;
- package metadata;
- generated declarations;
- build result;
- secret-scan result;
- retention policy.

Building an artifact does not authorize publishing it.

---

## 87. Consumer dependency substitution

A consumer verification profile may temporarily substitute the target
dependency inside an isolated workspace.

The substitution must:

- remain job-local;
- avoid external publication;
- avoid committing consumer changes;
- preserve original manifests and lockfiles;
- record generated temporary changes;
- use an approved structured command;
- remain within authorization;
- be fully cleaned after verification.

Temporary substitution must not be confused with a source remediation patch.

---

## 88. Consumer verification limitations

Consumer verification may remain incomplete when:

- consumer dependencies cannot be installed;
- required credentials are unavailable;
- consumer baseline is broken;
- consumer tests require unavailable services;
- target artifact cannot be substituted safely;
- consumer uses an unsupported package-manager profile;
- consumer requires another platform;
- consumer source changed;
- consumer repository is inaccessible.

An unavailable required consumer gate blocks remediation.

---

## 89. Consumer baseline

Before testing a candidate target change, the consumer's unchanged baseline
should be recorded.

The baseline should identify:

- consumer repository;
- consumer commit;
- dependency version;
- environment;
- commands;
- existing failures;
- unavailable gates;
- result identity.

Candidate verification must not conceal a failing consumer baseline.

---

## 90. Consumer post-change comparison

The comparison should identify:

- newly introduced compile failures;
- newly introduced type failures;
- newly introduced test failures;
- changed generated declarations;
- changed package-resolution behavior;
- changed diagnostics;
- unchanged pre-existing failures;
- unavailable gates.

A matching aggregate exit code is insufficient when diagnostics changed
materially.

---

## 91. Structured transformation

The target transformation must follow the selected language profile.

It must bind to:

- target repository;
- target commit;
- target finding;
- source occurrence;
- transformation version;
- expected rewrite count;
- permitted files;
- source digest;
- repository-universe digest;
- consumer-set digest;
- cross-repository coverage digest.

The transformation must not modify consumer repositories.

---

## 92. Changed-file validation

Changed-file validation must apply to the target repository.

The validator must detect:

- added files;
- modified files;
- deleted files;
- renamed files;
- file modes;
- symbolic links;
- binary files;
- manifests;
- lockfiles;
- generated files;
- configuration;
- repository-relative paths;
- content hashes.

Any file outside the target authorization must cause failure.

---

## 93. Post-change target gates

After transformation, all required target-repository gates must pass.

The workflow must verify:

- target source remains valid;
- required type or compiler checks pass;
- target tests pass;
- package build passes where required;
- exports remain valid;
- generated metadata remains consistent;
- changed files remain authorized;
- patch remains deterministic.

---

## 94. Post-change consumer gates

Required consumer gates must run against the verified candidate target state.

The result should preserve:

- consumer repository;
- consumer commit;
- target candidate artifact or source digest;
- substitution profile;
- commands;
- baseline comparison;
- status;
- limitations;
- cleanup.

A consumer gate against the old target artifact does not validate the candidate
change.

---

## 95. Patch generation

The target patch record should include:

- target repository;
- target base commit;
- target package or module;
- target finding;
- repository-universe ID;
- inventory digest;
- snapshot-set digest;
- relationship-graph digest;
- consumer-set digest;
- evidence digest;
- coverage digest;
- target gate results;
- consumer gate results;
- transformation ID;
- changed files;
- patch hash;
- secret-scan result.

Patch generation does not authorize publication.

---

## 96. Trusted publication

When separately authorized, publication must continue through the trusted
publisher for the target repository only.

The publisher must validate:

- target repository identity;
- prohibited-repository policy;
- target base commit;
- finding identity;
- human disposition;
- remediation authorization;
- repository-universe identity;
- snapshot-set digest;
- consumer-set digest;
- evidence and coverage digests;
- target gate results;
- required consumer gate results;
- patch hash;
- changed-file set;
- branch policy;
- draft-only operation;
- idempotency identity.

The publisher must not access or modify consumer repositories.

---

## 97. Consumer repository publication

Creating branches or pull requests in consumer repositories is outside the
default Phase 6 scope.

Such operations require:

- separate finding or compatibility issue;
- separate repository-specific authorization;
- separate patch;
- separate verification;
- separate trusted publication request;
- separate audit trail.

One target remediation authorization must not authorize a coordinated
multi-repository change.

---

## 98. Package publication

Publishing a candidate package or artifact is outside the default Phase 6
scope.

DCAv2 must not:

- publish package versions;
- overwrite package versions;
- create releases;
- upload artifacts to production registries;
- change distribution tags;
- sign release artifacts;

without a separately defined and authorized capability.

Local candidate artifacts must remain isolated and non-production.

---

## 99. Database evolution

Phase 6 may persist concepts such as:

- repository universes;
- repository inventory attempts;
- repository access decisions;
- repository snapshot sets;
- repository relationships;
- package and artifact identities;
- source-to-artifact mappings;
- dependency edges;
- semantic-index artifacts;
- cross-repository references;
- consumer sets;
- repository coverage records;
- cross-repository coverage;
- consumer verification plans;
- consumer gate results.

Persistence changes must use additive ordered migrations.

Historical single-repository findings must remain interpretable.

---

## 100. Migration compatibility

Migration testing should include:

- fresh installation;
- upgrade from the Phase 5 schema;
- existing single-repository findings;
- repository universe records;
- inventory records;
- partial inventory attempts;
- access-denied repositories;
- prohibited-repository records;
- snapshot sets;
- relationship edges;
- package mappings;
- semantic indexes;
- consumer sets;
- partial cross-repository coverage;
- multiple tenants;
- migration failure;
- retry;
- projection rebuild;
- audit preservation.

Existing migrations must not be rewritten.

---

## 101. Audit requirements

Phase 6 should produce audit events for applicable:

- repository universe proposed;
- repository universe authorized;
- repository inventory started;
- repository inventory completed;
- inventory partial;
- repository access allowed;
- repository access denied;
- prohibited repository excluded;
- repository snapshot resolved;
- repository snapshot failed;
- snapshot set created;
- package mapping created;
- package mapping ambiguous;
- relationship edge created;
- semantic index generated;
- semantic index ingested;
- semantic index rejected;
- consumer discovered;
- possible consumer recorded;
- consumer proven irrelevant;
- repository coverage completed;
- repository coverage failed;
- cross-repository coverage completed;
- cross-repository coverage partial;
- finding classified;
- human disposition recorded;
- remediation authorized;
- finding reproduced;
- target gate completed;
- consumer gate completed;
- target transformation completed;
- patch created;
- publication requested;
- cleanup completed;
- cleanup failed.

Audit events must remain tenant-scoped and secret-free.

---

## 102. Tenant isolation

Repository universes, indexes, package graphs, and consumer sets must be
tenant-scoped.

One tenant must not access or derive information from another tenant's:

- repository inventory;
- source snapshots;
- semantic indexes;
- private package metadata;
- dependency graphs;
- findings;
- credentials;
- authorization;
- consumer verification results;
- artifacts.

Shared public metadata must still retain source and access classification.

---

## 103. Credential boundaries

Credential capabilities may include:

- provider repository-read credential;
- provider metadata credential;
- private package-registry read credential;
- controller database credential;
- trusted publisher credential.

The untrusted runner may receive only the minimum authorized read capability
required for one stage.

It must never receive:

- trusted publisher credentials;
- controller database credentials;
- unrelated provider credentials;
- credentials for repositories outside the selected universe;
- broad cloud credentials;
- production application secrets.

---

## 104. Provider rate limits

Provider enumeration and source acquisition must account for rate limits.

The system should record:

- provider;
- operation;
- request count;
- remaining allowance where available;
- reset time where available;
- retry policy;
- partial pagination state;
- affected repositories;
- completion impact.

Rate limiting must not produce a complete inventory result.

---

## 105. Pagination

Every paginated provider operation must preserve:

- page identity;
- continuation token or equivalent;
- items received;
- duplicate detection;
- completion status;
- failure status;
- retry state.

A first page must never be treated as the full repository universe.

Pagination tokens and provider responses must be bounded and treated as
untrusted input.

---

## 106. Network profiles

Phase 6 should use separate network profiles for applicable stages:

- provider metadata enumeration;
- provider read-only source acquisition;
- package-registry metadata access;
- dependency installation for one repository;
- network-disabled semantic analysis;
- network-disabled index normalization;
- local candidate-artifact consumer testing;
- provider-publish-only trusted target publication.

Repository content must not broaden network access.

---

## 107. Runner requirements

Repository-controlled source, configuration, analyzers, dependency installers,
builds, tests, and semantic-index generators must execute in approved untrusted
runner profiles.

The profiles must enforce applicable:

- non-root execution;
- no privileged mode;
- no Docker socket;
- no trusted credentials;
- explicit environment allowlist;
- repository-specific mounts;
- no write access across repository workspaces;
- approved cache mounts;
- bounded network access;
- CPU limits;
- memory limits;
- process limits;
- disk limits;
- output limits;
- timeouts;
- process-tree cleanup;
- workspace cleanup.

One repository's commands must not access another repository's writable
workspace unless a dedicated consumer-verification profile permits a bounded
read-only or temporary-artifact relationship.

---

## 108. Repository workspace isolation

Each repository analysis should use a separate workspace identity.

The system must prevent:

- path collision;
- environment leakage;
- cache leakage;
- process leakage;
- file modification across repositories;
- source-index mixing;
- Git credential mixing;
- result attribution loss.

Cross-repository evidence should be joined through structured records rather
than arbitrary shared filesystem access.

---

## 109. Cross-repository cache policy

Shared caches may include:

- Git object cache;
- package cache;
- semantic-index cache;
- tool cache;
- build cache.

Every cache must define:

- tenant scope;
- repository scope;
- key;
- read and write permissions;
- integrity validation;
- private-data handling;
- retention;
- cleanup;
- poisoning response.

A cache must not bypass repository access policy or source identity validation.

---

## 110. Git object reuse

Git object reuse may improve acquisition performance but can create repository
and tenant trust risks.

A supported design must ensure:

- canonical object identity;
- repository authorization;
- no credential persistence;
- no unauthorized object discovery;
- no cross-tenant private object exposure;
- no unsafe Git alternates;
- immutable object validation;
- cleanup or retention policy.

Without these controls, repository acquisition should remain isolated.

---

## 111. Semantic-index storage

Semantic indexes may contain private source structure and symbol names.

Storage must enforce:

- tenant isolation;
- repository isolation;
- source-commit identity;
- encryption requirements where applicable;
- bounded retention;
- access control;
- deletion policy consistent with audit and data policy;
- secret redaction where practical;
- artifact integrity.

Index artifacts must not be exposed as public reports.

---

## 112. Prompt-injection resistance

Instructions found in:

- source comments;
- repository documentation;
- package metadata;
- semantic-index strings;
- provider descriptions;
- repository topics;
- commit messages;
- build output;
- test output;
- generated artifacts;
- package-registry metadata;

must remain untrusted data.

They must not:

- broaden the repository universe;
- authorize another repository;
- override the denylist;
- select credentials;
- add network destinations;
- add trusted commands;
- exclude failed repositories;
- mark partial inventory complete;
- create human disposition;
- authorize remediation;
- trigger publication;
- modify governance.

---

## 113. Secret handling

Cross-repository analysis increases the risk of secret exposure through:

- provider remote URLs;
- private package configuration;
- dependency URLs;
- repository metadata;
- semantic indexes;
- build logs;
- test logs;
- generated artifacts;
- source maps;
- patches;
- publication text;
- audit events.

DCAv2 must:

- use synthetic secrets for tests;
- redact credential-bearing URLs;
- avoid full environment dumps;
- bound logs;
- isolate credentials by repository and stage;
- scan exported artifacts as defense in depth;
- remove temporary credential files;
- record only credential capability, never value.

---

## 114. Phase 6 test manifest

Phase 6 should receive a dedicated test manifest such as:

`codex/tests/phase-6-tests.yaml`

If introduced, the file must conform to:

`codex/tests/phase-test-manifest.schema.json`

The manifest must identify concrete required and conditional test IDs.

The phrase “run relevant tests” is insufficient.

---

## 115. Minimum repository-universe tests

Universe tests should cover:

- explicit repository list;
- authorized provider installation set;
- organization enumeration when authorized;
- incomplete pagination;
- provider rate limiting;
- inaccessible repository;
- archived repository;
- fork;
- mirror;
- renamed repository;
- repository added after inventory;
- repository removed after inventory;
- prohibited repository identity;
- universe digest determinism.

---

## 116. Minimum access-policy tests

Access tests should cover:

- authorized read;
- unauthorized read;
- expired authorization;
- wrong provider account;
- wrong installation;
- repository outside universe;
- prohibited repository;
- credential unavailable;
- metadata allowed but source denied;
- source allowed but publication denied;
- repository rename;
- case normalization;
- minimum denial audit content.

Denylist tests must not retrieve prohibited content.

---

## 117. Minimum snapshot-set tests

Snapshot tests should cover:

- exact commit per repository;
- default branch resolved to commit;
- tag resolved to commit;
- repository changed during acquisition;
- missing commit;
- shallow-fetch limitation;
- partial acquisition;
- stale repository snapshot;
- repository added after snapshot;
- duplicate repository identity;
- deterministic snapshot-set digest;
- non-atomic resolution reporting.

---

## 118. Minimum submodule tests

Submodule tests should cover:

- authorized submodule;
- unauthorized submodule;
- prohibited submodule;
- missing submodule commit;
- mutable submodule branch configuration;
- relative URL;
- credential-bearing URL;
- nested submodule;
- submodule path escape;
- submodule repository renamed;
- submodule content not fetched after denial.

---

## 119. Minimum package-mapping tests

Package-mapping tests should cover:

- one package maps to one source repository;
- several packages map to one repository;
- one package name exists in several registries;
- ambiguous repository URL;
- tag matches version but commit differs;
- verified source provenance;
- missing source mapping;
- private package;
- public package;
- package moved between repositories;
- stale publication metadata;
- deterministic mapping digest.

---

## 120. Minimum dependency-edge tests

Dependency tests should cover:

- exact locked dependency;
- version range with resolved lockfile version;
- unlocked dependency;
- development dependency;
- test dependency;
- optional dependency;
- peer dependency;
- source-revision dependency;
- local path dependency;
- package renamed;
- registry changed;
- dependency removed after analysis;
- dependency added after analysis.

---

## 121. Minimum semantic-index tests

Semantic-index tests should cover:

- valid supported index;
- wrong repository identity;
- wrong source commit;
- unsupported format version;
- malformed symbol identity;
- path traversal in indexed path;
- oversized index;
- duplicate references;
- missing files;
- partial generation;
- analyzer crash;
- empty successful repository;
- failed generation represented as empty output;
- stale index;
- deterministic normalization.

---

## 122. Minimum consumer-discovery tests

Consumer tests should cover:

- exact symbol reference from another repository;
- package dependency without symbol reference;
- module import;
- re-export;
- configuration reference;
- generated-client relationship;
- source-revision dependency;
- test-only consumer;
- development-only consumer;
- optional consumer;
- inaccessible possible consumer;
- unsupported possible consumer;
- repository proven irrelevant;
- new consumer added after classification.

---

## 123. Minimum public-surface tests

Public-surface tests should cover:

- private internal symbol;
- unexported package symbol;
- exported symbol;
- package entry point;
- public class member;
- generated declaration;
- public stub;
- public package with no authorized consumers;
- private package with complete authorized consumers;
- externally published package;
- unknown registry consumers;
- public symbol removed from source after stale review.

---

## 124. Minimum coverage tests

Coverage tests should cover:

- complete explicit universe;
- incomplete provider enumeration;
- inaccessible required repository;
- unauthorized required repository;
- prohibited repository;
- unsupported required repository;
- failed semantic index;
- stale repository snapshot;
- stale package mapping;
- unresolved possible consumer;
- repository proven irrelevant;
- new repository added;
- dependency graph changed;
- consumer set changed;
- public external consumer uncertainty.

Complete coverage must require every relevant dimension.

---

## 125. Minimum classification tests

Classification tests should verify:

- exact cross-repository reference produces `live`;
- package-level consumer without symbol reference remains supporting evidence;
- complete private internal universe permits candidate evaluation;
- inaccessible possible consumer produces inconclusive;
- unauthorized possible consumer produces access-blocked or inconclusive;
- prohibited repository scope remains visible;
- public package with unknown consumers remains inconclusive;
- failed repository analysis does not produce absence;
- stale inventory produces stale classification;
- new consumer invalidates prior classification;
- positive evidence dominance;
- input-order independence.

---

## 126. Minimum disposition tests

Disposition tests should cover:

- `confirmed_dead`;
- `confirmed_live`;
- `needs_investigation`;
- repository-universe mismatch;
- snapshot-set mismatch;
- consumer-set mismatch;
- stale coverage rejection;
- inventory changed;
- revocation;
- supersession;
- history preservation;
- prevention of automatic remediation authority.

---

## 127. Minimum remediation-authorization tests

Authorization tests should cover:

- exact valid target authorization;
- missing authorization;
- expired authorization;
- revoked authorization;
- wrong target repository;
- wrong target commit;
- wrong repository universe;
- wrong snapshot set;
- wrong consumer set;
- wrong evidence digest;
- wrong coverage digest;
- wrong transformation;
- unauthorized consumer modification;
- missing consumer verification plan;
- stale disposition;
- reuse after completion.

Every mismatch must deny remediation.

---

## 128. Minimum reproduction tests

Reproduction tests should cover:

- exact repository set reproduced;
- target repository changed;
- consumer repository changed;
- new repository added;
- repository removed;
- inventory access changed;
- package mapping changed;
- dependency version changed;
- semantic index changed;
- new reference appeared;
- consumer set changed;
- coverage reduced;
- authorization expired.

Approximate cross-repository reproduction must never proceed.

---

## 129. Minimum consumer-verification tests

Consumer verification tests should cover:

- static reanalysis succeeds;
- candidate artifact builds;
- consumer baseline passes;
- consumer candidate test passes;
- consumer baseline fails;
- candidate introduces compile failure;
- candidate introduces test failure;
- dependency substitution changes committed files unexpectedly;
- lockfile restoration succeeds;
- private registry unavailable;
- consumer environment unsupported;
- consumer source changed;
- cleanup failure;
- target candidate artifact digest mismatch.

---

## 130. Minimum remediation tests

Remediation tests should cover:

- exact target symbol removal;
- consumer repository remains read-only;
- target changed-file allowlist;
- consumer manifest not committed;
- consumer lockfile not committed;
- new consumer discovered after review;
- target package export changed unexpectedly;
- target gate failure;
- consumer gate failure;
- incomplete consumer verification;
- deterministic patch;
- idempotent transformation;
- stale cross-repository authorization.

---

## 131. Minimum publisher tests

Publisher tests should cover:

- exact target repository;
- wrong repository universe;
- stale snapshot-set digest;
- stale consumer-set digest;
- missing target gate;
- missing required consumer gate;
- unexpected target manifest change;
- wrong patch hash;
- default-branch rejection;
- draft pull-request creation;
- no consumer repository publication;
- idempotent retry;
- provider partial state;
- Git-hook suppression;
- publisher inability to execute repository tools.

Live provider tests require separate authorization.

---

## 132. Minimum migration tests

Migration tests should cover:

- fresh database;
- upgrade from Phase 5;
- existing single-repository findings;
- repository universes;
- inventory attempts;
- partial inventories;
- access decisions;
- prohibited repository events;
- snapshot sets;
- package mappings;
- relationship edges;
- semantic indexes;
- consumer sets;
- partial cross-repository coverage;
- consumer gate results;
- multiple tenants;
- failed migration;
- retry;
- projection rebuild;
- audit preservation.

---

## 133. Minimum security tests

Security tests should cover:

- one repository cannot read another repository's writable workspace;
- one tenant cannot read another tenant's inventory;
- one tenant cannot read another tenant's semantic indexes;
- provider credential scope is enforced;
- package-registry credential scope is enforced;
- prohibited repository content is never retrieved;
- Git submodule policy is enforced;
- unsafe Git alternates are rejected;
- semantic-index path traversal is rejected;
- Docker socket is unavailable;
- cloud metadata is unavailable;
- network destinations are bounded;
- output is bounded;
- repository workers are resource-limited;
- background processes are terminated;
- caches do not expose private repository objects across tenants.

---

## 134. Fixture strategy

Phase 6 should use fixtures representing:

- target library repository;
- one direct consumer repository;
- one transitive consumer repository;
- one package-level dependency without symbol use;
- one test-only consumer;
- one optional consumer;
- one irrelevant repository;
- one inaccessible possible consumer;
- one unsupported possible consumer;
- one archived consumer;
- one fork;
- one renamed repository;
- one source-revision dependency;
- one generated-client relationship;
- one malformed semantic index;
- one malicious submodule;
- alternate repository, package, and symbol names.

Production behavior must not contain fixture-specific branches.

---

## 135. External repository testing

Every external repository test requires explicit authorization.

The authorization must identify:

- provider;
- canonical repository;
- immutable revision;
- permitted operation;
- source-access permission;
- semantic-index permission;
- dependency-installation permission;
- build and test permission;
- credential capability;
- network profile;
- data retention;
- cleanup;
- remediation permission;
- publication permission.

Historical access does not constitute current authorization.

Broad account access does not authorize modification or publication.

---

## 136. Known authorized fixture handling

A previously used fixture may be included only when the active authorization
identifies:

- exact canonical repository;
- exact immutable commit;
- exact permitted operations;
- runner profile;
- credential capability;
- cleanup;
- remediation permission;
- publication permission.

Prior successful access or prior repository knowledge must not substitute for
current authorization.

---

## 137. Scale boundary

Phase 6 establishes bounded functional cross-repository analysis.

The phase report must state tested limits such as:

- repository count;
- package count;
- artifact count;
- semantic-index size;
- symbol count;
- reference-edge count;
- dependency-edge count;
- consumer count;
- provider request count;
- acquisition duration;
- analysis duration;
- peak memory;
- disk use;
- database growth;
- artifact size.

Phase 6 must not claim organization-wide enterprise-scale validation.

Broader scale validation belongs to Phase 10.

---

## 138. Detection capability acceptance criteria

Cross-repository detection may become `functional` only when:

1. Repository universes are explicit and versioned.
2. Repository access is evaluated per operation.
3. Prohibited repositories are excluded before content access.
4. Inventory completeness is explicit.
5. Pagination and rate limits preserve partial status.
6. Repository snapshot sets use immutable commits.
7. Snapshot non-atomicity is reported.
8. Package and artifact identities are deterministic.
9. Source-to-artifact mappings preserve ambiguity.
10. Repository relationship graphs are deterministic.
11. Semantic-index ingestion validates identity and schema.
12. Consumer discovery preserves repository context.
13. Failed repositories do not become absence evidence.
14. Required consumer sets are derived deterministically.
15. Cross-repository coverage is explicit.
16. Open-world uncertainty is preserved.
17. Classification is deterministic and conservative.
18. Generalization beyond one fixture is demonstrated.
19. Required security, migration, and phase tests pass.

---

## 139. Remediation capability acceptance criteria

Target-repository remediation under cross-repository coverage may become
`functional` only when:

1. The target symbol shape is supported.
2. The required repository universe is current.
3. Required inventory is complete.
4. Required repository access is current.
5. Required snapshot set is current.
6. Package and artifact mappings are current.
7. Required consumer set is complete.
8. Required repository coverage is complete.
9. No unresolved external consumer scope affects the target.
10. Human disposition is current.
11. Separate remediation authorization is current.
12. Exact cross-repository reproduction succeeds.
13. Required target baseline gates pass.
14. Required consumer baselines are recorded.
15. Required candidate consumer gates pass.
16. Consumer repositories remain unmodified.
17. Structured target transformation is deterministic.
18. Target changed files are within authorization.
19. Required target post-change gates pass.
20. Patch generation is deterministic.
21. Required runner controls pass.
22. Required migration and phase tests pass.

---

## 140. Detection-only outcome

Phase 6 may validly complete with detection-only support when:

- repository inventory is implemented;
- snapshot sets are implemented;
- repository relationships are implemented;
- consumer discovery is implemented;
- cross-repository coverage is implemented;
- classifications remain conservative;
- consumer verification or remediation remains unavailable;
- unsupported remediation behavior is explicit;
- the active completion scope permits detection-only support.

Detection-only cross-repository support is a valid bounded capability.

---

## 141. Partially supported outcome

Cross-repository capability may remain `partially_supported` when, for example:

- explicit repository lists are supported but organization enumeration is not;
- one provider is supported but another is not;
- one package ecosystem is supported but another is not;
- package-level consumers are supported but symbol-level indexes are not;
- source repositories are mapped but artifact provenance remains partial;
- detection works but consumer verification does not;
- private repositories are supported but public external consumers remain
  unknown;
- one language index is supported but another is not.

The exact unsupported dimensions must remain explicit.

---

## 142. Blocked outcome

Phase 6 must remain blocked when applicable:

- repository universe is ambiguous;
- required provider enumeration is incomplete;
- repository authorization is missing;
- a prohibited repository would need to be accessed;
- immutable snapshot-set construction fails;
- required repository is inaccessible;
- required repository is unsupported;
- package or artifact identity is ambiguous;
- source-to-artifact mapping is unresolved;
- required semantic index fails;
- required consumer set is incomplete;
- public external consumer scope is unknown;
- required consumer verification is unavailable;
- required runner control fails;
- migration tests fail;
- tenant isolation fails;
- required tests fail or are unavailable;
- exact cross-repository reproduction fails;
- dominant liveness evidence appears;
- authorization expires or is revoked.

A blocked result must identify the exact safe next action.

---

## 143. Phase completion criteria

Phase 6 may be reported complete only when all applicable criteria are
satisfied:

1. Repository-universe definitions are implemented.
2. Repository inventory is implemented for the authorized provider scope.
3. Pagination and rate-limit behavior are explicit.
4. Repository access decisions are operation-specific.
5. Prohibited-repository enforcement is tested before content access.
6. Immutable repository snapshot sets are implemented.
7. Snapshot non-atomicity is reported.
8. Repository relationship graphs are implemented.
9. Package and artifact identities are deterministic.
10. Source-to-artifact mapping preserves uncertainty.
11. Cross-repository dependency edges are implemented.
12. Semantic-index ingestion is validated.
13. Cross-repository references preserve exact provenance.
14. Consumer-set derivation is deterministic.
15. Repository-level failures preserve uncertainty.
16. Cross-repository coverage is implemented.
17. Open-world consumer scope is explicit.
18. Classification is deterministic and conservative.
19. Human disposition remains separate.
20. Remediation authorization remains separate.
21. Exact reproduction includes the complete repository set.
22. Target baseline gates are implemented.
23. Required consumer verification is implemented when remediation is included.
24. Consumer repositories remain unmodified by default.
25. Target transformation remains narrowly scoped.
26. Target changed-file validation passes.
27. Required target and consumer post-change gates pass.
28. Required database migrations pass.
29. Required security controls pass.
30. Required Phase 6 tests pass.
31. Triggered conditional tests pass.
32. Capability statuses are updated truthfully.
33. Security-control matrix is updated.
34. Phase report is complete.
35. Execution state is updated.
36. No unresolved blocker contradicts completion.

Detection-only completion is valid when the active authorization and test
manifest define detection-only scope.

---

## 144. Phase report

The Phase 6 completion report should include:

- authorization identity;
- objective;
- source commit before and after;
- files changed;
- migrations;
- dependencies;
- provider profiles;
- repository-universe types;
- repository inventory results;
- pagination and rate-limit results;
- repository access decisions;
- prohibited-repository validation;
- snapshot-set behavior;
- repository counts;
- package and artifact mappings;
- relationship graph;
- semantic-index formats;
- consumer-discovery behavior;
- consumer-set derivation;
- inaccessible repositories;
- unsupported repositories;
- prohibited repositories;
- repository coverage;
- cross-repository coverage;
- classification behavior;
- target baseline gates;
- consumer verification;
- remediation result;
- target changed files;
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

The report must not describe a bounded repository set as complete global
consumer coverage.

---

## 145. Execution-state handoff

The Phase 6 handoff should identify:

- phase status;
- authorization status;
- source commit;
- worktree state;
- supported provider scopes;
- supported repository-universe types;
- supported package ecosystems;
- supported semantic-index formats;
- repository inventory status;
- snapshot-set status;
- relationship-graph status;
- consumer-discovery status;
- detection-only capabilities;
- remediation-supported capabilities;
- unresolved external consumer scope;
- test manifest;
- test results;
- security-control results;
- migrations;
- external operations;
- retained external state;
- cleanup state;
- next human decision.

The handoff must not authorize Phase 7.

---

## 146. Transition to Phase 7

Phase 7 may be proposed when source, package, artifact, and semantic consumer
relationships are bounded and the remaining liveness gaps involve service
contracts, message schemas, or distributed runtime consumers.

Before Phase 7 begins:

1. Finalize the Phase 6 report.
2. Update execution state.
3. Stop Phase 6 implementation.
4. Present actual cross-repository capability statuses.
5. Record unresolved contract and microservice behavior.
6. Prepare a Phase 7 authorization.
7. Obtain explicit human approval.

Phase 7 must not start automatically.

---

## 147. Phase stop conditions

Work must stop when:

- Phase 6 authorization is inactive;
- authorization expires;
- authorization is revoked;
- provider, organization, repository, or operation scope is exceeded;
- a prohibited repository is encountered;
- prohibited-repository identity cannot be evaluated safely;
- repository inventory is incomplete when completeness is required;
- pagination fails;
- provider rate limits prevent required inventory;
- repository identity cannot be verified;
- immutable source resolution fails;
- required repository access is unavailable;
- required package or artifact mapping is ambiguous;
- required semantic-index generation or ingestion fails;
- required consumer set cannot be completed;
- public external consumer scope remains unresolved;
- required consumer verification cannot run;
- required runner controls fail;
- a destructive migration would be required without permission;
- a required test fails or is unavailable;
- tenant isolation fails;
- exact cross-repository reproduction fails;
- coverage becomes incomplete;
- dominant liveness evidence appears;
- target changed files exceed authorization;
- a consumer repository would need modification without authorization;
- secret exposure is suspected;
- local user work cannot be preserved;
- external state becomes unknown and cannot be reconciled safely.

Stopping must be recorded truthfully.

---

## 148. Fail-safe behavior

When repository universe, inventory, access, snapshot identity, package mapping,
artifact provenance, dependency relationships, semantic indexes, consumer set,
public-surface scope, evidence, coverage, verification, remediation, or
publication state cannot be established confidently:

- do not report complete cross-repository support;
- do not access unauthorized repositories;
- do not access prohibited repositories;
- do not treat inaccessible repositories as empty;
- do not treat partial pagination as complete;
- do not infer package source from names alone;
- do not infer symbol absence from package-level dependency data;
- do not treat failed indexes as empty indexes;
- do not treat unknown public consumers as absent;
- do not create human disposition automatically;
- do not infer remediation authorization;
- do not modify consumer repositories;
- do not publish package artifacts;
- do not generate a publication-eligible target patch;
- do not publish;
- preserve available evidence;
- return an explicit partial, access-blocked, detection-only, unsupported,
  failed, stale, configuration-required, or blocked result;
- identify the exact missing requirement.

Cross-repository uncertainty must reduce classification, remediation, and
publication authority.

---

## 149. Document integrity

This roadmap file must not be modified during Phase 6 implementation unless
roadmap or governance modification is explicitly authorized.

Changes require:

1. Identification of the Phase 6 planning problem.
2. Review against the roadmap overview.
3. Review against permanent safety invariants.
4. Review of repository-access and denylist implications.
5. Review of repository-inventory and snapshot semantics.
6. Review of package, artifact, and semantic-index implications.
7. Review of consumer-set and coverage implications.
8. Review of remediation and consumer-verification implications.
9. Review of publication implications.
10. Review of authorization and testing impact.
11. Updated Phase 6 test manifest where applicable.
12. Updated schemas or capability definitions where applicable.
13. A reviewable governance commit.
14. An ADR when the change alters long-lived repository-universe,
    source-to-artifact, semantic-index, consumer-set, or cross-repository
    remediation semantics.

This roadmap must not be weakened to make incomplete repository inventories,
inaccessible consumers, unresolved package mappings, failed indexes, incomplete
coverage, failed tests, or unauthorized repository operations appear
acceptable.