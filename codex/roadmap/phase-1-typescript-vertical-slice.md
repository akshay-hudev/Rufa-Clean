# Phase 1 — TypeScript Vertical Slice

This document defines the planned scope, capability boundaries, evidence
requirements, tests, stop conditions, and completion criteria for Phase 1 of
DCAv2.

Phase 1 delivers one narrow, evidence-driven TypeScript workflow from repository
qualification through verified local remediation and, only when separately
authorized, trusted draft pull-request publication.

Phase 1 is intentionally narrow.

It does not establish complete TypeScript, JavaScript, monorepo, framework,
cross-repository, or enterprise-scale support.

This roadmap file does not authorize implementation, repository access,
credential use, remediation, external publication, or destructive operations.

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
  id: phase-1-typescript-vertical-slice
  name: TypeScript Vertical Slice
  roadmap_order: 1
  default_status: inactive
  implementation_authorized_by_this_file: false
```

The phase becomes active only when the current authorization record explicitly
identifies `phase-1-typescript-vertical-slice` as active.

---

## 2. Primary objective

The primary objective is to implement and validate one complete, narrow
TypeScript workflow covering:

1. Repository qualification.
2. Immutable source acquisition.
3. Source and symbol inventory.
4. Reference and liveness evidence collection.
5. Explicit coverage evaluation.
6. Deterministic classification.
7. Human disposition.
8. Separate remediation authorization.
9. Exact finding reproduction.
10. Baseline verification gates.
11. Structured source transformation.
12. Changed-file validation.
13. Post-change verification gates.
14. Deterministic patch generation.
15. Trusted draft publication when separately authorized.
16. Append-only audit and truthful reporting.

The initial target should be a private TypeScript function in a qualified
single-package npm repository.

---

## 3. Intended initial capability

The intended initial capability is conceptually:

```text
Detect, explain, review, reproduce, and safely remove one unreferenced private
TypeScript function from a qualified single-package npm repository.
```

The capability must remain constrained by:

- supported TypeScript versions;
- supported source shapes;
- supported package-manager behavior;
- supported compiler configuration;
- supported evidence types;
- complete required coverage;
- explicit human disposition;
- separate remediation authorization;
- supported transformation shape;
- available baseline and post-change gates;
- runner security;
- trusted publication controls.

A successful example must not be generalized beyond the tested capability
boundary.

---

## 4. Non-goals

Phase 1 does not, by default, include:

- exported-function removal;
- public API removal;
- class removal;
- interface removal;
- type-alias removal;
- overloaded-method removal;
- decorator-aware removal;
- TSX or JSX support;
- JavaScript-only repositories;
- npm workspaces;
- pnpm;
- Yarn;
- monorepos;
- framework-specific entry-point analysis;
- dynamic import resolution beyond the supported profile;
- reflection-complete analysis;
- generated-code remediation;
- cross-repository consumer discovery;
- runtime telemetry;
- microservice contract analysis;
- organization-wide campaigns;
- automatic approval;
- automatic remediation authorization;
- automatic publication;
- automatic merge;
- direct default-branch push;
- production-scale validation.

Unsupported cases must return an explicit safe status.

---

## 5. Phase prerequisites

Phase 1 should not begin until Phase 0 has established enough verified current
state to define the vertical slice safely.

Expected prerequisites include:

- current architecture is inventoried;
- trust boundaries are understood;
- current migrations are known;
- current command execution is understood;
- runner controls have explicit statuses;
- publisher behavior has an explicit status;
- current TypeScript behavior is characterized;
- required test infrastructure is identified;
- known foundational blockers are recorded;
- the isolated TypeScript toolchain can be resolved or fails explicitly;
- capability and security-control matrices exist or can be completed safely.

An unresolved prerequisite must be represented as a blocker.

---

## 6. Authorization prerequisites

The active Phase 1 authorization must identify applicable:

- local repository scope;
- source files permitted for modification;
- test files permitted for modification;
- migration permission;
- dependency-manifest permission;
- lockfile permission;
- runner-image permission;
- command-registry permission;
- network access;
- package-registry access;
- external fixture repositories;
- immutable fixture revisions;
- credential capabilities;
- database operations;
- remediation permission;
- publication permission;
- external cleanup permission;
- destructive-operation permission;
- required tests;
- stop conditions;
- expiration or completion boundary.

Missing permissions default to denial.

---

## 7. Required phase outputs

Phase 1 should produce applicable:

- TypeScript qualification capability;
- TypeScript symbol inventory capability;
- TypeScript reference-evidence capability;
- coverage profile for the supported finding type;
- deterministic classification profile;
- human-disposition records;
- separate remediation-authorization records;
- exact reproduction validation;
- baseline-gate records;
- structured transformation implementation;
- post-change-gate records;
- deterministic patch records;
- trusted publication request contract;
- draft pull-request publication support when authorized;
- additive database migrations;
- test manifest updates;
- security-control evidence;
- capability-matrix updates;
- phase-completion report;
- updated execution state.

Every output must remain bounded to the authorized capability.

---

## 8. Capability identifiers

Phase 1 should define or update capability identifiers such as:

```text
repository.typescript-single-package-npm.qualify.v1
source.typescript.snapshot.acquire.v1
inventory.typescript.private-function.v1
analysis.typescript.private-function.references.v1
coverage.typescript.private-function.single-package.v1
classification.typescript.private-function.v1
review.finding.human-disposition.v1
authorization.remediation.finding-specific.v1
reproduction.typescript.private-function.v1
remediation.typescript.private-function-delete.v1
verification.typescript.npm-gates.v1
patch.git-diff.deterministic.v1
publication.github.draft-pull-request.v1
```

The final identifiers may differ if the capability schema requires another
naming convention.

Every identifier must remain stable, versioned, and narrowly scoped.

---

## 9. Supported repository profile

The initial supported repository profile should require:

- one Git repository;
- one npm package;
- one supported TypeScript project;
- one supported lockfile;
- an immutable source commit;
- source files within configured roots;
- a discoverable TypeScript configuration;
- a supported compiler version;
- a deterministic dependency-install path;
- no required cross-repository consumer discovery;
- no unsupported workspace structure;
- no unresolved generated-source dependency;
- no unsupported framework registration affecting the finding;
- available required verification commands.

Repositories outside this profile must not be forced through the workflow.

---

## 10. Repository qualification result

Qualification should return an explicit result such as:

- `ready`;
- `ready_with_limited_gates`;
- `configuration_required`;
- `baseline_broken`;
- `unsupported`;
- `inaccessible`;
- `failed`.

A result of `ready_with_limited_gates` must identify:

- unavailable gates;
- coverage impact;
- remediation impact;
- whether detection-only analysis remains permitted.

A repository must not enter remediation unless all required remediation gates
are available.

---

## 11. Repository identity

Every workflow must bind to a canonical repository identity.

Applicable identity fields include:

- provider;
- account or installation;
- repository owner;
- repository name;
- canonical full name;
- repository ID when available;
- default branch;
- immutable source commit.

Display names and local directory names must not replace canonical provider
identity.

Repository identity must be revalidated before any external write.

---

## 12. Repository-access policy

Before source acquisition, DCAv2 must validate:

- active phase authorization;
- repository-access policy;
- prohibited-repository policy;
- requested operation;
- provider identity;
- account or installation scope;
- repository identity;
- credential capability;
- network profile.

Denylist evaluation must occur before content retrieval.

A denied repository must not proceed to metadata expansion, clone, fetch,
qualification, analysis, remediation, or publication.

---

## 13. Immutable source acquisition

Source acquisition must resolve and retain an immutable commit identity.

The source snapshot should record:

- repository identity;
- requested revision;
- resolved commit;
- acquisition method;
- acquisition time;
- Git-object verification;
- source digest where applicable;
- acquisition status;
- runner or controller component;
- network profile;
- credential capability without value.

Analysis must not bind only to a mutable branch name.

---

## 14. Source snapshot immutability

An analysis source snapshot must not change after evidence collection begins.

If source contents change:

- create a new source snapshot;
- create a new analysis epoch;
- invalidate dependent evidence as required;
- recalculate coverage;
- reclassify findings;
- require new reproduction before remediation.

A modified workspace must not retain the identity of the original immutable
snapshot.

---

## 15. Source-root discovery

Qualification should identify:

- project root;
- source roots;
- test roots;
- generated roots;
- excluded roots;
- configuration roots;
- package root;
- TypeScript configuration path.

Every root should be repository-relative and normalized.

Unknown or inaccessible roots must reduce coverage.

Generated roots must not be remediated unless generated-source policy explicitly
permits it.

---

## 16. TypeScript configuration

The TypeScript adapter should record applicable:

- configuration file;
- configuration digest;
- extended configuration files;
- include patterns;
- exclude patterns;
- files list;
- compiler options;
- path aliases;
- module resolution;
- project references;
- source map settings;
- declaration settings;
- incremental settings.

Executable configuration must run only inside the untrusted runner.

Unsupported configuration behavior must remain explicit.

---

## 17. TypeScript version

The supported TypeScript version range must be explicit.

Every analysis and verification record should identify:

- requested TypeScript version;
- resolved TypeScript version;
- package identity;
- executable path;
- package-manager resolution method;
- adapter version.

DCAv2 must not silently use a host-global compiler when the project compiler is
unavailable.

A version outside the supported range must produce `unsupported` or
`configuration_required`.

---

## 18. Dependency installation

When dependency installation is required, the command must define:

- npm version;
- lockfile requirement;
- immutable or locked installation behavior;
- development-dependency policy;
- lifecycle-script policy;
- registry profile;
- cache profile;
- working directory;
- timeout;
- resource limits;
- output limits;
- expected file changes;
- cleanup.

Installation failure must remain distinct from analyzer or compiler failure.

---

## 19. Lifecycle-script policy

Package lifecycle scripts are repository-controlled code.

The qualification and runner profile must state whether lifecycle scripts are:

- disabled;
- permitted;
- selectively permitted;
- required but unavailable.

When scripts are disabled, resulting compatibility limitations must be reported.

When scripts are enabled, they must execute only in the untrusted runner under
the approved network, filesystem, credential, and resource controls.

---

## 20. Package-local executable resolution

Project tools should be resolved through the approved package-local mechanism.

The executor must verify:

- package installation completed;
- expected package exists;
- expected executable exists;
- executable belongs to the expected package version;
- working directory is correct;
- environment is sanitized;
- no host-global fallback occurred.

A missing executable must return an explicit unavailable or
configuration-required result.

---

## 21. Symbol inventory

The TypeScript inventory must identify supported declarations accurately.

For a private function, retain applicable:

- symbol ID;
- repository ID;
- source snapshot ID;
- analysis epoch ID;
- file path;
- declaration occurrence;
- symbol name;
- symbol kind;
- container;
- export status;
- visibility;
- syntax shape;
- semantic identity;
- content digest.

Symbol identity must not depend only on the function name.

---

## 22. Initial supported symbol shape

The initial supported transformation shape should be narrow.

A supported private function may require:

- a standalone function declaration;
- no export modifier;
- no declaration merging;
- no overload signatures;
- no decorator;
- no generated-source marker;
- no unsupported syntax wrapper;
- no required side effect at declaration time;
- an exact semantic definition;
- a transformation rule supporting the syntax.

Every unsupported shape must fail safely before source modification.

---

## 23. Excluded symbol shapes

Phase 1 should initially exclude applicable:

- exported functions;
- default exports;
- namespace members;
- overloaded functions;
- methods;
- accessors;
- constructors;
- callbacks registered through unsupported conventions;
- functions referenced through unresolved reflection;
- generated declarations;
- ambient declarations;
- declaration-file symbols;
- framework-discovered entry points;
- symbols with ambiguous semantic identity.

Exclusion must be explicit in capability and finding output.

---

## 24. Reference evidence

Reference analysis should produce normalized evidence rather than a single
unqualified count.

Applicable evidence may include:

- semantic call reference;
- semantic value reference;
- import reference;
- export reference;
- test reference;
- textual candidate reference;
- configuration reference;
- unresolved dynamic candidate;
- framework registration;
- declaration-only occurrence.

Each evidence item must retain provenance and source occurrence.

---

## 25. Semantic evidence preference

Semantic reference evidence should be preferred over raw textual search for
authoritative conclusions.

Textual search may provide:

- candidate discovery;
- contradiction detection;
- unsupported dynamic-use hints;
- diagnostic context.

A textual absence must not be treated as complete semantic absence.

A textual match must not automatically be treated as a resolved semantic
reference.

---

## 26. Tool reuse

Phase 1 should evaluate existing tools before implementing complex language
semantics manually.

Potential reusable components include:

- the TypeScript compiler API;
- SCIP;
- `scip-typescript`;
- Tree-sitter;
- Knip;
- structured transformation tools.

A tool may be adopted only after applicable:

- functional-fit review;
- license review;
- security review;
- provenance review;
- output-contract review;
- failure testing;
- adapter design;
- replacement planning.

The roadmap mention of a tool is not approval.

---

## 27. Tool roles

Each adopted tool must have one explicit role.

Examples include:

- TypeScript compiler API for semantic symbol resolution;
- SCIP for normalized semantic-index interchange;
- Tree-sitter for syntax occurrence support;
- Knip as supporting unused-code evidence;
- a structured transformation engine for syntax-safe deletion.

No external tool may directly determine:

- human disposition;
- remediation authorization;
- publication authorization;
- safety policy;
- final classification outside DCAv2 policy.

---

## 28. Evidence normalization

Tool output must be normalized into the DCAv2 evidence model.

Normalization must preserve:

- producer;
- producer version;
- adapter version;
- source snapshot;
- configuration digest;
- source occurrence;
- evidence type;
- polarity;
- strength;
- correlation;
- ambiguity;
- raw artifact digest;
- execution status.

Normalization must not upgrade heuristic output into semantic certainty.

---

## 29. Evidence freshness

Evidence must become stale when applicable:

- source commit changes;
- relevant file content changes;
- analyzer version changes;
- adapter semantics change;
- configuration changes;
- source roots change;
- package graph changes;
- supported scope changes;
- evidence canonicalization changes.

Stale evidence must not satisfy remediation prerequisites.

---

## 30. Evidence contradictions

Contradictory evidence must remain visible.

Examples include:

- one analyzer reports no references;
- semantic indexing reports a reference;
- textual search finds an unresolved dynamic use;
- runtime or configuration evidence indicates liveness;
- coverage for a relevant scope fails.

Dominant liveness evidence must prevent a dead-code conclusion under the
applicable classification profile.

Contradictions must not be hidden through tool voting.

---

## 31. Coverage profile

Phase 1 must define a coverage profile for the supported finding type.

The profile should identify required dimensions such as:

- source-root discovery;
- TypeScript file discovery;
- declaration inventory;
- semantic reference analysis;
- import and export analysis;
- test-scope analysis;
- configuration-scope analysis;
- dynamic-use checks;
- generated-source checks;
- public-consumer checks within the supported repository profile.

Every dimension must have an explicit status.

---

## 32. Coverage statuses

Coverage statuses should include:

- `complete`;
- `partial`;
- `failed`;
- `unsupported`;
- `unavailable`;
- `excluded`;
- `stale`;
- `not_applicable`.

Only `complete` may satisfy a required coverage dimension.

An excluded scope may satisfy coverage only when the exclusion is authorized by
the profile and cannot contain relevant liveness evidence.

---

## 33. Coverage digest

The completed coverage state should have a deterministic digest.

The digest should bind applicable:

- coverage profile version;
- source snapshot;
- discovered scopes;
- analyzed scopes;
- excluded scopes;
- failed scopes;
- unsupported scopes;
- analyzer identities;
- configuration identities;
- completion statuses.

Changing required coverage must invalidate remediation eligibility.

---

## 34. Classification profile

Phase 1 must define a deterministic classification profile for the supported
private-function finding.

The profile should specify:

- required evidence;
- required coverage;
- dominant liveness evidence;
- contradictory evidence behavior;
- unsupported behavior;
- stale behavior;
- explanation structure;
- remediation-review eligibility.

The classification engine must not infer universal deadness from one analyzer's
absence result.

---

## 35. Classification outcomes

Applicable classification outcomes may include:

- `live`;
- `candidate_dead`;
- `inconclusive`;
- `unsupported`;
- `failed`;
- `stale`.

`candidate_dead` should require:

- exact supported finding shape;
- current source identity;
- complete required coverage;
- absence of dominant liveness evidence;
- absence of unresolved contradictions that block the profile;
- successful required analyzers;
- deterministic explanation.

A classification is not a human disposition.

---

## 36. Classification explanation

Every classification should explain:

- finding identity;
- source identity;
- supported profile;
- evidence considered;
- coverage considered;
- liveness evidence;
- absence evidence;
- contradictions;
- exclusions;
- unsupported scope;
- policy version;
- resulting status;
- remediation-review eligibility.

The explanation must remain bounded and reproducible.

---

## 37. Human disposition

A human reviewer may record a disposition such as:

- `confirmed_dead`;
- `confirmed_live`;
- `needs_investigation`;
- `rejected`;
- `revoked`;
- `superseded`.

The disposition must bind to:

- finding ID;
- repository;
- source snapshot;
- classification identity;
- evidence digest;
- coverage digest;
- human actor;
- timestamp;
- review note when applicable.

A human disposition must remain separate from remediation authorization.

---

## 38. Disposition staleness

A human disposition may become stale when:

- source identity changes;
- finding identity changes;
- evidence digest changes materially;
- coverage digest changes materially;
- dominant liveness evidence appears;
- classification profile changes materially.

Stale disposition must not authorize remediation.

A new review may supersede the old disposition while preserving history.

---

## 39. Remediation authorization

Remediation authorization must be an explicit separate record.

It should bind to:

- authorization ID;
- finding ID;
- repository identity;
- source commit;
- human disposition ID;
- evidence digest;
- coverage digest;
- classification profile;
- transformation ID;
- permitted changed files;
- permitted commands;
- permitted gates;
- expiration or completion boundary;
- human authorizer.

The authorization must not be inferred from `confirmed_dead`.

---

## 40. Remediation authorization statuses

Applicable statuses include:

- `proposed`;
- `active`;
- `expired`;
- `revoked`;
- `completed`;
- `rejected`;
- `stale`.

Only a current `active` authorization may permit the exact remediation attempt.

Any identity mismatch must block source modification.

---

## 41. Exact finding reproduction

Before transformation, the remediation workflow must reproduce the exact
finding from a clean authorized source snapshot.

Reproduction must validate:

- repository identity;
- source commit;
- file path;
- source occurrence;
- symbol identity;
- symbol kind;
- syntax shape;
- content digest;
- classification profile;
- evidence digest;
- coverage digest;
- human disposition;
- remediation authorization.

A similar symbol with the same name is insufficient.

---

## 42. Reproduction failure

Reproduction must fail when applicable:

- source commit changed;
- file changed;
- symbol moved ambiguously;
- symbol identity changed;
- declaration shape changed;
- new reference appeared;
- positive liveness appeared;
- coverage became partial;
- analyzer failed;
- evidence became stale;
- authorization expired;
- authorization was revoked.

A reproduction failure must not trigger an approximate transformation.

---

## 43. Baseline gates

Before changing source, Phase 1 must run all required baseline gates.

Applicable gates may include:

- dependency installation;
- TypeScript parsing;
- type checking;
- compilation;
- build;
- lint;
- unit tests;
- integration tests;
- generated-artifact checks;
- repository-status checks;
- secret checks.

The qualification profile must identify which gates are required.

A required unavailable gate blocks remediation.

---

## 44. Baseline result

Every baseline gate must record:

- gate ID;
- command ID;
- command version;
- source commit;
- runner profile;
- tool versions;
- configuration digest;
- start and completion times;
- status;
- exit code;
- bounded artifacts;
- limitations.

A baseline failure must not be hidden by later post-change success.

Repositories with accepted pre-existing failures require an explicit comparison
policy and authorization.

---

## 45. Structured transformation

Source modification must use a structured transformation.

The transformation must bind to:

- transformation ID;
- transformation version;
- language;
- supported syntax shape;
- finding ID;
- source occurrence;
- expected rewrite count;
- permitted files;
- source digest;
- deterministic configuration.

Plain textual deletion must not be used when syntax or semantic ambiguity
exists.

---

## 46. Rewrite-count validation

The transformation must define an expected rewrite count.

The operation must fail when:

- no target is rewritten;
- more than the expected target is rewritten;
- the target identity differs;
- unrelated declarations are changed;
- unsupported syntax is encountered.

A nominally successful tool exit does not satisfy rewrite validation.

---

## 47. Changed-file validation

After transformation, DCAv2 must calculate the exact changed-file set.

Validation must include:

- added files;
- modified files;
- deleted files;
- renamed files;
- file modes;
- symbolic links;
- binary files;
- repository-relative paths;
- content hashes.

Unexpected files must cause failure.

Phase 1 should normally permit only the exact source file containing the
authorized private function, unless test or generated-file updates are
explicitly authorized.

---

## 48. Deterministic transformation

Equivalent authorized inputs should produce the same semantic patch.

Determinism tests should control:

- source commit;
- transformation version;
- tool version;
- configuration;
- file ordering;
- locale;
- temporary paths;
- line endings where supported;
- formatter behavior.

The patch digest must exclude irrelevant environmental variation.

---

## 49. Transformation idempotency

Reapplying the transformation to the already transformed source should not
produce additional unintended changes.

The expected second application may be:

- no-op success;
- explicit target-not-found status;
- explicit already-applied status.

The behavior must be defined and tested.

Repeated execution must not remove additional similarly named symbols.

---

## 50. Post-change gates

After transformation, Phase 1 must run the required post-change gates using the
same or a stricter environment than the baseline.

Applicable gates include:

- parsing;
- type checking;
- compilation;
- build;
- lint;
- unit tests;
- integration tests;
- generated-artifact checks;
- changed-file validation;
- patch stability;
- secret scanning.

Every required gate must pass.

---

## 51. Baseline comparison

The workflow must compare baseline and post-change results.

The comparison should identify:

- newly introduced failures;
- resolved pre-existing failures;
- unchanged pre-existing failures;
- unavailable gates;
- changed diagnostics;
- changed test counts;
- changed artifacts;
- changed performance where material.

A post-change result must not be accepted merely because its exit code matches a
failing baseline.

The permitted comparison behavior must be defined by policy.

---

## 52. Patch generation

After successful verification, DCAv2 may generate a deterministic patch.

The patch record should include:

- repository identity;
- base commit;
- finding ID;
- remediation attempt ID;
- transformation ID;
- changed files;
- patch format;
- patch size;
- patch hash;
- source hashes before and after;
- gate-result identities;
- secret-scan result;
- creation time.

Patch generation does not authorize publication.

---

## 53. Patch validation

Before publication eligibility, trusted validation must confirm:

- patch parses;
- base commit matches;
- repository matches;
- changed files match authorization;
- no path traversal exists;
- no unexpected file mode exists;
- no unexpected symbolic link exists;
- no unsupported binary change exists;
- patch hash matches;
- gate results match;
- patch contains no detected synthetic or real secret indicators;
- finding and remediation identities match.

Any mismatch must block publication.

---

## 54. Patch staleness

A patch becomes stale when applicable:

- base commit changes;
- repository changes;
- finding identity changes;
- human disposition is revoked;
- remediation authorization expires;
- evidence digest changes;
- coverage digest changes;
- required gate results expire under policy;
- patch content changes;
- changed-file set changes.

A stale patch must be regenerated and reverified.

---

## 55. Trusted publisher handoff

The runner must not publish the patch.

The trusted controller may create a structured publication request containing
applicable:

- request ID;
- tenant;
- authorization IDs;
- repository identity;
- base commit;
- finding ID;
- disposition ID;
- remediation-attempt ID;
- evidence digest;
- coverage digest;
- transformation ID;
- patch artifact;
- patch hash;
- changed files;
- gate results;
- requested branch;
- requested draft title and description;
- idempotency identity;
- request digest.

The trusted publisher must validate every security-sensitive field.

---

## 56. Publication authorization

Publication requires explicit permission separate from:

- analysis authorization;
- human disposition;
- remediation authorization;
- successful local patch generation.

The authorization must identify:

- provider;
- repository;
- permitted branch behavior;
- permitted external operation;
- credential capability;
- draft-only requirement;
- expiration or completion boundary;
- cleanup permission when applicable.

No publication permission may be inferred from available credentials.

---

## 57. Draft-only publication

The permitted Phase 1 publication result is:

- one dedicated non-default branch;
- one draft pull request.

The publisher must prohibit:

- direct default-branch push;
- force push unless an exceptional approved idempotency design requires a
  narrowly scoped safe operation;
- merge;
- auto-merge;
- approval;
- ready-for-review transition;
- branch-protection bypass;
- repository-settings changes;
- repository deletion.

The pull request must remain draft after creation.

---

## 58. Branch naming

Branch naming should be deterministic, bounded, and provider-safe.

The name may incorporate non-sensitive identifiers such as:

- DCAv2 prefix;
- finding identity fragment;
- remediation-attempt identity fragment.

It must not contain:

- secret values;
- arbitrary source content;
- unbounded symbol names;
- credentials;
- unsafe path characters.

The branch must never equal the default branch.

---

## 59. Publication idempotency

The publication workflow must define idempotent behavior.

A stable publication identity should bind to:

- repository;
- base commit;
- finding;
- remediation attempt;
- patch hash;
- requested operation.

Retries must not create uncontrolled duplicate branches or pull requests.

The publisher should reconcile existing provider state before retrying an
operation whose result is unknown.

---

## 60. Partial publication state

The publisher must represent partial states such as:

- branch created but push failed;
- push completed but pull-request response was lost;
- draft pull request created but local audit persistence failed;
- provider timeout after possible write;
- existing branch contains a different patch;
- existing pull request is not draft.

Partial state must not be collapsed into generic failure.

The workflow must reconcile external state before retrying.

---

## 61. Publication content

The draft pull-request description should include bounded, reviewable
information such as:

- finding summary;
- source commit;
- classification explanation;
- human disposition reference;
- remediation authorization reference;
- changed files;
- baseline gates;
- post-change gates;
- known limitations;
- generated-by notice;
- manual review requirement.

It must not include:

- secret values;
- unbounded logs;
- full environment dumps;
- unsupported certainty claims;
- instructions to merge automatically.

---

## 62. Git-hook suppression

Trusted source acquisition and publication must suppress repository-controlled
Git hooks.

The publisher must not load:

- repository hooks;
- user-global hooks;
- credential helpers from repository configuration;
- unsafe Git aliases;
- repository-provided external helpers.

Git-hook suppression must be tested with harmless synthetic hooks.

---

## 63. Trusted publisher source state

The trusted publisher must not publish directly from the runner workspace.

It should:

1. Revalidate repository policy.
2. Reacquire or reconstruct a clean source state.
3. Check out the exact authorized base commit.
4. Disable hooks and unsafe configuration.
5. Apply the verified patch.
6. Validate changed files.
7. Validate the resulting patch hash.
8. Create the dedicated branch.
9. Push only the dedicated branch.
10. Create the draft pull request.
11. Record external identifiers.
12. Clean the trusted workspace.

This independent reconstruction reduces trust in runner-generated filesystem
state.

---

## 64. Audit requirements

Phase 1 must produce audit events for applicable:

- repository access decision;
- source acquisition;
- analysis epoch;
- analyzer execution;
- evidence persistence;
- coverage completion;
- classification;
- human disposition;
- remediation authorization;
- reproduction;
- baseline gates;
- transformation;
- changed-file validation;
- post-change gates;
- patch creation;
- publication request;
- branch creation;
- draft pull-request creation;
- failure;
- retry;
- cleanup;
- security incident.

The runner must not write authoritative audit events directly.

---

## 65. Database evolution

Any Phase 1 persistence changes must use additive ordered migrations.

Potential persisted concepts include:

- analysis epochs;
- evidence items;
- coverage records;
- finding classifications;
- human dispositions;
- remediation authorizations;
- remediation attempts;
- gate results;
- patch artifacts;
- publication requests;
- publication results;
- audit events.

Existing migrations must not be rewritten.

Upgrade testing must start from a representative existing database, not only an
empty database.

---

## 66. Historical records

Phase 1 must preserve historical records when:

- a classification changes;
- a disposition is superseded;
- an authorization expires;
- a remediation attempt fails;
- a patch becomes stale;
- publication partially succeeds;
- a later retry succeeds.

Current-state projections may change.

Historical evidence and decisions must remain attributable and reconstructable.

---

## 67. Runner profile

Repository-controlled commands must execute in an approved runner profile.

The profile should enforce applicable:

- non-root execution;
- no privileged mode;
- capability restrictions;
- no Docker socket;
- no host network;
- no trusted credentials;
- explicit environment allowlist;
- explicit filesystem mounts;
- bounded writable storage;
- network disabled or allowlisted;
- CPU limit;
- memory limit;
- process limit;
- timeout;
- output limit;
- process-tree cleanup;
- workspace cleanup.

Unavailable required controls block production remediation capability.

---

## 68. Network profiles

Phase 1 should use the narrowest network profile for each stage.

Examples include:

- source acquisition with provider read-only access;
- dependency installation with registry-only access;
- analysis with network disabled;
- baseline and post-change gates with network disabled unless explicitly
  required;
- trusted publication with provider-publish-only access.

Network capability must not persist across stages unnecessarily.

---

## 69. Credential boundaries

Credential capabilities must remain separated.

Examples include:

- repository read credential;
- package-registry read credential;
- database application credential;
- trusted publisher credential.

The runner must never receive:

- trusted publisher credentials;
- controller database credentials;
- unrelated provider credentials;
- production secrets.

Credentials must be short-lived and narrowly scoped where supported.

---

## 70. Secret scanning

Phase 1 should scan applicable:

- changed files;
- generated patch;
- publication text;
- bounded artifacts.

Secret scanning is a defensive signal.

A scanner pass must not be reported as proof that no secret exists.

A suspected secret must block publication and trigger review.

---

## 71. Prompt-injection resistance

Phase 1 must treat instructions found in repository content, analyzer output,
test output, commit messages, and generated artifacts as untrusted data.

Such instructions must not:

- broaden repository scope;
- select arbitrary commands;
- request credentials;
- weaken coverage;
- change classification policy;
- create human disposition;
- create remediation authorization;
- trigger publication;
- alter draft-only restrictions;
- modify governance.

Hostile prompt-injection fixtures should validate this behavior.

---

## 72. Phase 1 test manifest

Phase 1 tests must be defined in:

`codex/tests/phase-1-tests.yaml`

The manifest must conform to:

`codex/tests/phase-test-manifest.schema.json`

The manifest must identify concrete required and conditional test IDs.

The phrase “run relevant tests” is insufficient.

---

## 73. Minimum qualification tests

Phase 1 qualification tests should cover:

- supported single-package npm repository;
- missing `package.json`;
- missing lockfile;
- unsupported lockfile;
- missing TypeScript configuration;
- unsupported TypeScript version;
- missing compiler executable;
- malformed configuration;
- workspace repository detected;
- generated-only target;
- baseline command unavailable;
- inaccessible repository;
- repository identity and requested target role;
- immutable revision failure.

Every result must map to an explicit qualification status.

---

## 74. Minimum inventory tests

Inventory tests should cover:

- supported standalone private function;
- same name in different files;
- same name in different scopes;
- exported function;
- overloaded function;
- method;
- declaration file;
- generated source;
- malformed source;
- unsupported syntax;
- symbol moved between analyses.

Symbol identity must remain stable for unchanged supported declarations and
change when semantic identity changes.

---

## 75. Minimum evidence tests

Evidence tests should cover:

- direct call reference;
- value reference;
- import reference;
- export reference;
- test-only reference;
- textual false positive;
- comment-only occurrence;
- string-only occurrence;
- unresolved dynamic access;
- configuration reference;
- analyzer failure;
- malformed analyzer output;
- stale analyzer result;
- contradictory tools.

Evidence provenance and polarity must be validated.

---

## 76. Minimum coverage tests

Coverage tests should cover:

- all required scopes complete;
- source discovery partial;
- analyzer failure;
- unsupported file;
- excluded generated source;
- missing configuration scope;
- stale coverage;
- additional relevant file discovered;
- inaccessible required scope;
- unsupported dynamic behavior.

Incomplete required coverage must block `candidate_dead` and remediation.

---

## 77. Minimum classification tests

Classification tests should verify:

- complete absence evidence produces `candidate_dead` only under the supported
  profile;
- direct liveness produces `live`;
- test liveness follows the configured policy;
- positive evidence dominates absence evidence;
- incomplete coverage produces `inconclusive`;
- unsupported shape produces `unsupported`;
- analyzer failure produces `failed` or `inconclusive`;
- stale evidence produces `stale`;
- tool count does not act as majority voting;
- input ordering does not change the result.

---

## 78. Minimum disposition tests

Disposition tests should cover:

- record `confirmed_dead`;
- record `confirmed_live`;
- reject missing actor;
- reject wrong finding;
- reject stale classification;
- revoke disposition;
- supersede disposition;
- preserve historical disposition;
- prevent disposition from creating remediation authority.

---

## 79. Minimum remediation-authorization tests

Authorization tests should cover:

- exact valid authorization;
- missing authorization;
- expired authorization;
- revoked authorization;
- wrong repository;
- wrong commit;
- wrong finding;
- wrong evidence digest;
- wrong coverage digest;
- wrong transformation;
- changed-file scope mismatch;
- missing human disposition;
- stale human disposition;
- authorization reuse after completion.

Every mismatch must deny remediation.

---

## 80. Minimum reproduction tests

Reproduction tests should cover:

- exact finding reproduced;
- same name but different symbol;
- file changed;
- symbol moved ambiguously;
- new reference added;
- coverage reduced;
- analyzer fails;
- evidence digest changes;
- coverage digest changes;
- authorization expires;
- source commit changes;
- unsupported syntax appears.

Approximate reproduction must never proceed to transformation.

---

## 81. Minimum baseline-gate tests

Baseline tests should cover:

- successful type check;
- successful build;
- successful test run;
- compiler missing;
- dependencies missing;
- install failure;
- timeout;
- resource exhaustion;
- malformed test result;
- pre-existing failure;
- unavailable optional gate;
- unavailable required gate.

Required unavailable or failed gates must block remediation.

---

## 82. Minimum transformation tests

Transformation tests should cover:

- exact supported function removal;
- zero rewrites;
- multiple rewrites;
- same function name in another scope;
- overloaded function;
- exported function;
- malformed source;
- formatting stability;
- deterministic output;
- idempotent second application;
- unexpected changed file;
- symbolic-link target;
- generated source;
- binary file rejection.

---

## 83. Minimum post-change tests

Post-change tests should verify:

- parsing succeeds;
- type checking succeeds;
- build succeeds;
- required tests succeed;
- no new diagnostics appear;
- changed files remain authorized;
- patch is stable;
- repeated patch generation is deterministic;
- secret scan does not detect synthetic canary leakage;
- cleanup completes.

---

## 84. Minimum publisher tests

Publisher tests should cover:

- valid authenticated request;
- missing authorization;
- expired authorization;
- denylisted repository;
- wrong repository;
- stale base commit;
- wrong patch hash;
- unexpected changed file;
- branch equals default branch;
- Git hook present;
- existing matching branch;
- existing conflicting branch;
- provider timeout after push;
- provider timeout after pull-request creation;
- pull request created as draft;
- merge attempt rejected;
- auto-merge attempt rejected;
- runner credential cannot publish.

Live provider tests require separate authorization.

---

## 85. Minimum audit tests

Audit tests should cover:

- every material stage emits an event;
- failure events remain visible;
- retries create new attempt events;
- human disposition and remediation authorization are separate;
- event mutation is rejected where enforced;
- tenant isolation;
- secret redaction;
- external-operation identity;
- partial publication state;
- cleanup failure;
- projection rebuild.

---

## 86. Minimum hostile tests

Hostile tests should attempt to:

- read synthetic controller credentials;
- read synthetic publisher credentials;
- access the Docker socket;
- access the host filesystem;
- access an unrelated workspace;
- reach cloud metadata;
- reach unauthorized network destinations;
- leave background processes;
- exhaust process limits;
- exhaust memory;
- fill disk;
- emit excessive output;
- create unsafe patch paths;
- execute Git hooks;
- inject instructions into logs;
- alter publication-request data.

Required hostile tests must pass before production remediation or publication
capability is functional.

---

## 87. Fixture strategy

Phase 1 should use:

- synthetic positive fixtures;
- synthetic negative fixtures;
- synthetic hostile fixtures;
- at least one alternate generalization fixture;
- an external fixture only when explicitly authorized.

Fixtures should vary applicable:

- repository name;
- owner;
- function name;
- source path;
- formatting;
- declaration location;
- test layout;
- TypeScript version within the supported range.

Production code must not contain fixture-specific branches.

---

## 88. External fixture publication

An authorized external fixture may be used to validate live draft publication
only when the authorization identifies:

- exact repository;
- exact commit;
- exact finding;
- permitted branch;
- provider credential capability;
- remediation permission;
- publication permission;
- draft-only behavior;
- retained external state;
- cleanup permission;
- test IDs.

Previous access or previous test history is not current authorization.

---

## 89. Capability acceptance criteria

The initial TypeScript vertical-slice capability may become `functional` only
when:

1. Qualification is deterministic.
2. Immutable source acquisition works.
3. Supported symbol identity is exact.
4. Reference evidence is normalized and reproducible.
5. Required coverage can become complete.
6. Liveness evidence dominates absence evidence.
7. Classification is deterministic.
8. Human disposition is separate.
9. Remediation authorization is separate.
10. Exact reproduction is enforced.
11. Required baseline gates pass.
12. Transformation is structured.
13. Rewrite count is validated.
14. Changed files are validated.
15. Required post-change gates pass.
16. Patch generation is deterministic.
17. Runner controls pass.
18. Required migrations pass.
19. Required tests pass.
20. Fixture-specific hardcoding is absent.

Publication capability has separate acceptance criteria.

---

## 90. Publication capability acceptance criteria

GitHub draft-publication capability may become `functional` only when:

- repository identity is validated;
- denylist policy is enforced;
- base commit is validated;
- finding and authorization identities are validated;
- patch hash is validated;
- changed files are validated;
- Git hooks are suppressed;
- publisher credentials are isolated;
- only a dedicated branch can be pushed;
- direct default-branch push is blocked;
- pull requests are created as draft;
- merge and auto-merge are blocked;
- idempotent retry works;
- partial-state reconciliation works;
- audit events are recorded;
- required mock, sandbox, or authorized live tests pass.

Without authorized live provider validation, the status must remain bounded,
such as experimental or mock-validated.

---

## 91. Detection-only outcome

Phase 1 may validly complete with detection-only support when:

- evidence, coverage, and classification are functional;
- remediation remains unsafe or unavailable;
- the phase authorization or completion criteria permit detection-only scope;
- unsupported remediation behavior is explicit;
- no publication capability is claimed.

Detection-only status must not be represented as complete remediation support.

---

## 92. Blocked outcome

Phase 1 must remain blocked when applicable:

- project compiler cannot be resolved safely;
- required runner controls fail;
- required baseline gates are unavailable;
- required post-change gates are unavailable;
- symbol identity is ambiguous;
- required coverage cannot become complete;
- transformation is nondeterministic;
- changed-file validation is incomplete;
- database migration fails;
- human disposition is not separate;
- remediation authorization is not separate;
- publisher isolation fails;
- required tests fail or are unavailable;
- licensing blocks a mandatory tool;
- authorization expires.

A blocked outcome must identify the exact safe next action.

---

## 93. Phase completion criteria

Phase 1 may be reported complete only when all applicable criteria are
satisfied:

1. The authorized objective is implemented.
2. Supported repository scope is explicit.
3. Unsupported repository scope is explicit.
4. Supported symbol shape is explicit.
5. Unsupported symbol shapes are explicit.
6. Evidence provenance is complete.
7. Required coverage is explicit and tested.
8. Classification invariants pass.
9. Human disposition is separate.
10. Remediation authorization is separate.
11. Exact reproduction is enforced.
12. Required baseline gates pass.
13. Structured transformation passes.
14. Changed-file validation passes.
15. Required post-change gates pass.
16. Patch determinism passes.
17. Runner security tests pass.
18. Database migration tests pass.
19. Required Phase 1 tests pass.
20. Triggered conditional tests pass.
21. Capability statuses are updated truthfully.
22. Security-control matrix is updated.
23. Phase report is complete.
24. Execution state is updated.
25. No unresolved blocker contradicts completion.

Publication is required only when the active Phase 1 authorization and test
manifest explicitly include it.

---

## 94. Phase report

The Phase 1 completion report should include:

- authorization identity;
- objective;
- source commit before and after;
- worktree state;
- files changed;
- migrations;
- dependencies;
- tool decisions;
- supported TypeScript version;
- supported repository profile;
- supported symbol shape;
- evidence types;
- coverage profile;
- classification profile;
- disposition behavior;
- remediation-authorization behavior;
- reproduction behavior;
- baseline gates;
- transformation;
- changed files;
- post-change gates;
- patch identity;
- publication result;
- security controls;
- tests;
- fixtures;
- capability-status changes;
- limitations;
- blockers;
- external resources;
- cleanup;
- next safe action.

The report must distinguish local patch success from external draft publication.

---

## 95. External state reporting

When external publication occurs, the report should identify:

- provider;
- repository;
- base commit;
- branch name;
- draft pull-request identifier;
- draft status;
- idempotency identity;
- operation status;
- retained external resources;
- cleanup permission;
- cleanup result.

It must not include credentials or credential-bearing URLs.

A draft pull request must not be described as merged or approved.

---

## 96. Execution-state handoff

The Phase 1 handoff should identify:

- phase status;
- authorization status;
- source commit;
- current worktree state;
- supported capabilities;
- blocked capabilities;
- test manifest;
- test results;
- security-control results;
- migrations;
- external operations;
- retained external state;
- cleanup state;
- next human decision.

The handoff must not authorize Phase 2.

---

## 97. Transition to Phase 2

Phase 2 may be proposed when Phase 1 has established a narrow vertical slice and
revealed which repository configuration and readiness checks require broader
product support.

Before Phase 2 begins:

1. Finalize the Phase 1 report.
2. Update execution state.
3. Stop Phase 1 implementation.
4. Present actual capability statuses.
5. Record Phase 1 limitations.
6. Prepare a Phase 2 authorization.
7. Obtain explicit human approval.

Phase 2 must not start automatically.

---

## 98. Phase stop conditions

Work must stop when:

- Phase 1 authorization is inactive;
- authorization expires;
- authorization is revoked;
- repository scope is exceeded;
- an excluded repository target operation is requested;
- a required credential is unavailable;
- a required network operation is unauthorized;
- a required tool's license is unresolved;
- runner containment fails;
- publisher isolation fails;
- a required test fails or is unavailable;
- exact finding reproduction fails;
- required coverage becomes incomplete;
- dominant liveness evidence appears;
- human disposition is absent or stale;
- remediation authorization is absent or stale;
- changed files exceed authorization;
- secret exposure is suspected;
- local user work cannot be preserved;
- external state becomes unknown and cannot be reconciled safely.

Stopping must be recorded truthfully.

---

## 99. Fail-safe behavior

When TypeScript semantics, source identity, evidence, coverage, authorization,
transformation, verification, or publication state cannot be established
confidently:

- do not classify the finding as safely removable;
- do not create human disposition automatically;
- do not infer remediation authorization;
- do not modify source;
- do not generate a publication-eligible patch;
- do not push a branch;
- do not create a pull request;
- preserve available evidence;
- return an explicit incomplete, unsupported, failed, stale, or blocked status;
- identify the exact missing requirement.

Uncertainty must reduce remediation and publication authority.

---

## 100. Document integrity

This roadmap file must not be modified during Phase 1 implementation unless
roadmap or governance modification is explicitly authorized.

Changes require:

1. Identification of the Phase 1 planning problem.
2. Review against the roadmap overview.
3. Review against permanent safety invariants.
4. Review of evidence, coverage, and classification implications.
5. Review of remediation and publication implications.
6. Review of authorization and testing impact.
7. Updated Phase 1 test manifest where applicable.
8. Updated capability and security-control definitions where applicable.
9. A reviewable governance commit.
10. An ADR when the change alters long-lived TypeScript, transformation,
    publication, or trust-boundary semantics.

This roadmap must not be weakened to make incomplete evidence, missing gates,
unsafe transformation, failed tests, or unauthorized publication appear
acceptable.
