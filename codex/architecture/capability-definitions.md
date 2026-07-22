# Capability Definitions

This document defines how DCAv2 describes, implements, validates, and reports
product capabilities.

Capabilities must be reported as narrowly scoped, independently testable
behaviors.

Broad labels such as “TypeScript support,” “monorepo support,” or “microservice
support” are insufficient unless they are decomposed into explicit capability
dimensions.

This document must be applied together with:

- `codex/core/02-product-contract.md`;
- `codex/core/04-accuracy-and-evidence-policy.md`;
- `codex/core/10-reporting-and-state-policy.md`;
- `codex/architecture/current-system-contract.md`;
- `codex/architecture/evidence-model.md`;
- `codex/architecture/coverage-model.md`;
- `codex/architecture/classification-policy.md`;
- `codex/architecture/remediation-policy.md`;
- `codex/engineering/testing-policy.md`.

---

## 1. Core principle

A capability exists only when its required behavior has been implemented and
validated.

The existence of any of the following is insufficient by itself:

- an interface;
- a type;
- an enum;
- a database table;
- an API route;
- a command;
- a configuration option;
- a placeholder adapter;
- a roadmap entry;
- documentation describing intended behavior;
- a third-party tool dependency;
- one successful fixture.

Capability claims must describe exactly what DCAv2 can do, under which
conditions, with which limitations, and with what evidence.

---

## 2. Capability dimensions

DCAv2 capabilities should be described across applicable dimensions including:

- language;
- language version;
- repository shape;
- package manager;
- build system;
- framework;
- symbol type;
- evidence type;
- analysis scope;
- coverage profile;
- transformation type;
- verification gate;
- provider;
- runtime environment;
- scale boundary;
- security profile.

A capability declaration must avoid hiding unsupported combinations.

For example, support for private TypeScript functions in one npm package does
not establish support for:

- exported functions;
- overloaded methods;
- decorators;
- dynamic imports;
- pnpm workspaces;
- Yarn Plug'n'Play;
- monorepos;
- cross-repository references;
- safe source transformation;
- publication.

---

## 3. Capability identity

Every capability should have a stable identifier.

Recommended format:

```text
<domain>.<subject>.<operation>.<version>
```

Examples:

```text
repository.typescript.qualify.v1
analysis.typescript.private-function.references.v1
coverage.npm-workspace.complete.v1
classification.typescript.private-function.v1
remediation.typescript.private-function-delete.v1
publication.github.draft-pull-request.v1
audit.postgresql.hash-chain.v1
```

A capability identifier must not change merely because descriptive wording is
improved.

A material semantic change requires a new version.

---

## 4. Capability definition structure

Each capability definition should identify:

- capability ID;
- capability version;
- domain;
- status;
- objective;
- supported inputs;
- unsupported inputs;
- preconditions;
- outputs;
- failure states;
- security requirements;
- evidence requirements;
- coverage requirements;
- tests;
- fixtures;
- known limitations;
- scale limits;
- dependencies;
- applicable policies;
- implementation location;
- last verified time.

A capability definition must be specific enough for another engineer to
determine whether a reported scenario is supported.

---

## 5. Capability domains

DCAv2 capability domains include:

1. Repository discovery.
2. Repository access.
3. Repository qualification.
4. Source acquisition.
5. Workspace and package discovery.
6. Source and symbol inventory.
7. Reference analysis.
8. Evidence normalization.
9. Coverage evaluation.
10. Classification.
11. Human review.
12. Remediation authorization.
13. Finding reproduction.
14. Source transformation.
15. Verification.
16. Trusted publication.
17. Audit.
18. Reporting.
19. Security isolation.
20. Scale and campaign management.

Capabilities from different domains must not be combined into one unsupported
claim.

---

## 6. Capability status model

Every capability must use one primary status.

Supported statuses are:

- `planned`;
- `placeholder`;
- `experimental`;
- `functional`;
- `scale_validated`;
- `detection_only`;
- `partially_supported`;
- `blocked`;
- `deprecated`;
- `unsupported`;
- `broken`;
- `unknown`.

---

## 7. `planned`

A capability is `planned` when it appears in an authorized product roadmap but
has not been implemented.

A planned capability may have:

- requirements;
- design notes;
- schemas;
- proposed adapters;
- proposed tests.

It must not be reported as available.

Roadmap presence does not authorize implementation.

---

## 8. `placeholder`

A capability is `placeholder` when structural elements exist but operational
behavior is incomplete.

Examples include:

- an adapter interface without a working adapter;
- a database table with no execution path;
- an API endpoint returning a fixed response;
- a command that reports “not implemented”;
- a provider abstraction supported only by mocks.

A placeholder must not be reported as experimental or functional support.

---

## 9. `experimental`

A capability is `experimental` when:

- working behavior exists;
- some positive tests pass;
- important limitations remain;
- production safety or completeness is not established;
- interfaces or behavior may still change.

Experimental support must clearly identify:

- supported scenarios;
- unsupported scenarios;
- missing negative tests;
- missing security controls;
- missing scale validation;
- data migration risk;
- operational limitations.

Experimental support must not be used for automatic remediation unless an
explicit policy permits the exact scenario.

---

## 10. `functional`

A capability is `functional` only when:

- implementation exists;
- required positive tests pass;
- required negative tests pass;
- failure behavior is tested;
- unsupported behavior is explicit;
- applicable security controls are tested;
- applicable evidence and coverage semantics are implemented;
- required documentation matches behavior;
- applicable migration paths are tested;
- the capability works outside one hardcoded fixture.

Functional support does not imply scale validation.

---

## 11. `scale_validated`

A capability is `scale_validated` when it is already functional and has been
tested against representative scale.

Scale validation should include applicable measurements such as:

- repository size;
- file count;
- symbol count;
- package count;
- workspace count;
- repository count;
- analyzer duration;
- memory use;
- CPU use;
- disk use;
- artifact size;
- database growth;
- query latency;
- concurrent jobs;
- failure recovery;
- rate-limit behavior.

Scale validation must state the tested boundaries.

It must not imply unlimited capacity.

---

## 12. `detection_only`

A capability is `detection_only` when DCAv2 can collect evidence or create a
finding but cannot safely remediate the result.

Detection-only status may apply when:

- classification is supported but transformation is not;
- transformation exists but verification is insufficient;
- public consumer scope is incomplete;
- the symbol shape is not safely rewritable;
- trusted publication is unavailable;
- remediation policy intentionally prohibits the case.

Detection-only findings must not enter ordinary automatic remediation.

---

## 13. `partially_supported`

A capability is `partially_supported` when meaningful subsets work but the
declared scope is not complete.

The declaration must identify:

- supported subsets;
- unsupported subsets;
- failure behavior;
- whether unsupported cases are detected safely;
- whether partial results affect coverage;
- whether the capability is eligible for production use.

“Partial support” must not be used without describing the exact boundary.

---

## 14. `blocked`

A capability is `blocked` when implementation or validation cannot continue
because of a known dependency or decision.

A blocked capability must identify:

- blocker;
- affected requirement;
- current implementation state;
- required human decision or external dependency;
- safe next action.

A blocker must not be reported as successful completion.

---

## 15. `deprecated`

A capability is `deprecated` when it remains operational temporarily but should
not be used for new workflows.

A deprecated capability must identify:

- replacement;
- deprecation reason;
- compatibility period;
- migration path;
- removal conditions;
- affected users or data.

Deprecation does not authorize immediate removal.

---

## 16. `unsupported`

A capability is `unsupported` when DCAv2 does not implement the required
behavior safely.

Unsupported inputs must produce an explicit non-success result.

They must not:

- fall back to an unrelated capability;
- produce incomplete evidence without warning;
- be treated as zero references;
- produce `candidate_dead`;
- enter remediation.

---

## 17. `broken`

A capability is `broken` when it is intended and previously expected to work,
but reproducible execution currently fails.

A broken capability must identify:

- reproduction command;
- expected result;
- observed result;
- affected versions;
- affected fixtures;
- severity;
- proposed repair phase.

Broken must remain distinct from unsupported.

---

## 18. `unknown`

A capability is `unknown` when its implementation or validation status has not
been established.

Unknown must be used during reconciliation when:

- code exists but behavior has not been tested;
- documentation conflicts with implementation;
- test results are unavailable;
- an external integration cannot be verified;
- security enforcement is uncertain.

Unknown must not be interpreted as functional.

---

## 19. Support layers

Capabilities should be reported across separate support layers.

Applicable layers include:

- schema support;
- interface support;
- adapter support;
- execution support;
- evidence support;
- coverage support;
- classification support;
- remediation support;
- publication support;
- security enforcement;
- scale validation.

For example, DCAv2 may have:

- schema support for runtime evidence;
- no runtime collector adapter;
- no tested runtime coverage;
- no runtime-based classification support.

The existence of an earlier layer must not imply support for a later layer.

---

## 20. Repository qualification capability

A repository-qualification capability should define support for:

- provider identity;
- immutable revision resolution;
- language detection;
- package-manager detection;
- workspace detection;
- source-root discovery;
- test-root discovery;
- generated-root detection;
- build-command discovery;
- test-command discovery;
- configuration requirements;
- baseline-state reporting.

Qualification must report explicit outcomes such as:

- `ready`;
- `ready_with_limited_gates`;
- `configuration_required`;
- `baseline_broken`;
- `unsupported`;
- `inaccessible`;
- `failed`.

One supported package manager does not establish universal qualification
support.

---

## 21. Language capability

Language support must be divided into operations.

Applicable operations include:

- file detection;
- parsing;
- declaration inventory;
- semantic definition extraction;
- semantic reference extraction;
- import analysis;
- export analysis;
- test-scope classification;
- dynamic-use detection;
- framework integration;
- classification;
- transformation;
- verification.

A language capability must identify supported language versions and syntax
features.

“TypeScript supported” is not a sufficient capability declaration.

---

## 22. Symbol capability

Capabilities should be declared per symbol or program-entity shape where
behavior differs.

Examples include:

- private function;
- exported function;
- method;
- overloaded method;
- class;
- interface;
- type alias;
- variable;
- constant;
- module;
- package export;
- route handler;
- message consumer;
- scheduled job;
- dependency.

A transformation safe for one symbol type must not be assumed safe for another.

---

## 23. Package-manager capability

Package-manager support must be reported separately for:

- npm;
- pnpm;
- Yarn Classic;
- Yarn Berry;
- Yarn Plug'n'Play;
- pip;
- Poetry;
- other future systems.

Applicable capability dimensions include:

- lockfile recognition;
- workspace discovery;
- dependency installation;
- lifecycle-script handling;
- package graph extraction;
- deterministic verification;
- dependency removal;
- registry authentication.

Support for npm workspaces does not prove pnpm or Yarn support.

---

## 24. Monorepo capability

Monorepo support must be decomposed into:

- workspace discovery;
- nested workspace discovery;
- package graph construction;
- project-reference handling;
- path-alias handling;
- package-export handling;
- cross-workspace reference analysis;
- package-specific gates;
- aggregate coverage;
- partial-failure behavior;
- remediation isolation.

Monorepo support must identify the supported package manager and build system.

A repository containing several packages is not fully supported merely because
all files can be parsed.

---

## 25. Framework capability

Framework support must be declared per convention.

Examples include:

- route registration;
- dependency-injection registration;
- decorators;
- plugin discovery;
- scheduled jobs;
- command registration;
- event handlers;
- serialization hooks;
- framework entry points.

A capability must identify:

- framework;
- framework versions;
- convention supported;
- evidence emitted;
- coverage requirements;
- unresolved dynamic behavior;
- tests.

Support for one convention does not establish complete framework support.

---

## 26. Evidence capability

An evidence capability should identify:

- evidence type;
- producer;
- adapter;
- supported source scope;
- provenance fields;
- freshness behavior;
- correlation behavior;
- contradiction behavior;
- mapping behavior;
- persistence behavior;
- failure behavior.

A database enum for an evidence type does not establish evidence-collection
support.

---

## 27. Coverage capability

A coverage capability should identify:

- coverage dimension;
- discovery mechanism;
- completion requirements;
- failure statuses;
- exclusion behavior;
- aggregation rules;
- digest behavior;
- freshness behavior;
- applicable profiles;
- tests.

Coverage support must not be reported as complete when required scope discovery
is missing.

---

## 28. Classification capability

A classification capability must identify:

- applicable finding type;
- coverage profile;
- evidence types;
- dominance rules;
- blockers;
- contradiction behavior;
- freshness behavior;
- explanation behavior;
- remediation-review compatibility.

A generic classification engine does not prove that every finding profile is
supported.

Unsupported profiles must return `unsupported`.

---

## 29. Transformation capability

A transformation capability must identify:

- language;
- symbol shape;
- syntax shape;
- semantic preconditions;
- transformation engine;
- engine version;
- rule version;
- expected rewrite count;
- changed-file expectations;
- unsupported cases;
- deterministic-output behavior;
- idempotency behavior;
- baseline gates;
- post-change gates.

Detection support must not imply transformation support.

---

## 30. Verification capability

Verification capabilities should be reported per gate.

Applicable gates include:

- dependency installation;
- parsing;
- type checking;
- compilation;
- build;
- lint;
- unit testing;
- integration testing;
- service startup;
- health checks;
- generated-artifact validation;
- patch stability;
- changed-file validation;
- secret scanning.

A missing gate must be reported as unavailable or unsupported.

It must not be treated as passed.

---

## 31. Publication capability

Publication support must be reported separately for each provider.

Applicable dimensions include:

- repository identity validation;
- denylist enforcement;
- base-commit validation;
- patch-hash validation;
- changed-file validation;
- branch creation;
- commit push;
- draft pull-request creation;
- idempotent retry;
- partial-state recovery;
- credential isolation;
- audit recording.

Mocked publication support must not be reported as operational provider support.

---

## 32. Audit capability

Audit support must distinguish:

- event persistence;
- append-only application behavior;
- database-level mutation prevention;
- event hashing;
- hash chaining;
- canonicalization;
- integrity verification;
- correction records;
- tenant isolation;
- checkpoints;
- signatures;
- external anchoring;
- archival;
- projection rebuild.

A hash column alone does not establish tamper-evident audit support.

---

## 33. Security capability

Security capabilities must be reported per enforced control.

Examples include:

- non-root runner;
- restricted capabilities;
- network disabled;
- destination allowlist;
- Docker socket denied;
- host filesystem denied;
- cloud metadata denied;
- credential absence;
- output bounded;
- resource limits;
- Git hooks disabled;
- trusted publisher isolation;
- tenant isolation.

A configuration setting is not sufficient proof of enforcement.

Each control must identify its test or verification method.

---

## 34. Capability dependencies

A capability may depend on other capabilities.

For example:

```text
remediation.typescript.private-function-delete.v1
```

may depend on:

- repository qualification;
- immutable source acquisition;
- TypeScript parsing;
- semantic references;
- coverage evaluation;
- deterministic classification;
- human disposition;
- remediation authorization;
- isolated baseline gates;
- structured transformation;
- post-change verification;
- changed-file validation.

A parent capability cannot be functional when a required dependency is
unsupported, broken, or unknown.

Dependency relationships must be explicit.

---

## 35. Capability prerequisites

A capability definition should identify environmental prerequisites such as:

- supported operating system;
- Docker availability;
- PostgreSQL availability;
- package-manager version;
- compiler version;
- network access;
- registry access;
- credentials;
- repository configuration;
- runtime telemetry;
- provider API support.

A missing prerequisite must produce an explicit result.

It must not silently change the capability behavior.

---

## 36. Capability failure behavior

Every capability must define safe failure behavior.

Possible failure outcomes include:

- `failed`;
- `timed_out`;
- `resource_exceeded`;
- `unavailable`;
- `configuration_required`;
- `unsupported`;
- `partial`;
- `stale`;
- `blocked_by_policy`.

Failure behavior must specify:

- whether partial artifacts are retained;
- whether coverage becomes incomplete;
- whether classification is blocked;
- whether remediation is blocked;
- whether retry is safe;
- whether cleanup is required.

---

## 37. Capability tests

A functional capability must have tests covering applicable:

- positive case;
- negative case;
- unsupported case;
- failure case;
- timeout case;
- malformed-output case;
- stale-input case;
- incomplete-coverage case;
- contradiction case;
- authorization-denied case;
- tenant-isolation case;
- secret-handling case;
- cleanup case.

The exact required test set depends on the capability domain.

A capability must not be declared functional based only on its happy path.

---

## 38. Fixture requirements

Fixtures must be designed to validate general behavior rather than hardcoded
special cases.

Each fixture should identify:

- capability under test;
- repository shape;
- language and version;
- package manager;
- intended positive behavior;
- intended negative behavior;
- expected evidence;
- expected coverage;
- expected classification;
- expected failure status;
- expected transformation when applicable.

Production code must not branch on fixture-specific repository names, commit
hashes, file paths, or symbol names.

---

## 39. Generalization tests

A capability intended for general use should be validated against more than one
fixture shape.

Generalization checks may vary:

- symbol name;
- file path;
- repository name;
- package name;
- declaration position;
- formatting;
- project structure;
- package-manager configuration;
- source commit;
- test layout.

The purpose is to demonstrate that behavior is not tied to one prepared
fixture.

---

## 40. Negative capability claims

DCAv2 must state what it does not support.

Examples include:

- dynamic reflection unresolved;
- public package consumers unknown;
- Yarn Plug'n'Play unsupported;
- generated code not safely transformable;
- runtime absence not sufficient;
- cross-language references incomplete;
- repository-scale limit not measured;
- draft publication unavailable without credentials.

Explicit non-support is preferable to unsafe implicit behavior.

---

## 41. Functional support criteria

A capability may be marked `functional` only when all required criteria are
satisfied.

At minimum:

1. Implementation exists.
2. Public or internal interface is complete.
3. Required tests pass.
4. Failure behavior is explicit.
5. Unsupported inputs are rejected safely.
6. Relevant security controls are enforced and tested.
7. Evidence and coverage semantics are correct.
8. Output is explainable.
9. Migrations are tested when persistence changes.
10. Documentation matches implementation.
11. No fixture-specific bypass is present.
12. Required cleanup is verified.

Any unsatisfied required criterion prevents functional status.

---

## 42. Scale-validation criteria

A functional capability may be marked `scale_validated` only when:

- representative workloads are defined;
- benchmark methodology is documented;
- resource measurements are captured;
- test environments are described;
- concurrency is tested where relevant;
- failure thresholds are measured;
- database impact is measured;
- timeouts and limits are configured;
- results are reproducible enough for review;
- known limits are documented.

A large synthetic input alone is not complete scale validation.

---

## 43. Performance measurements

Performance reports should include applicable:

- source size;
- file count;
- package count;
- workspace count;
- symbol count;
- evidence count;
- repository count;
- execution duration;
- peak memory;
- CPU time;
- disk usage;
- database rows;
- artifact size;
- network requests;
- retries;
- concurrency.

Measurements must state:

- hardware or environment;
- tool versions;
- runner profile;
- dataset or fixture;
- warm or cold cache;
- number of runs;
- variability.

Do not report benchmark estimates as measured results.

---

## 44. Capability matrix

DCAv2 should maintain a machine-readable capability matrix.

Each row should include:

- capability ID;
- status;
- supported scope;
- implementation location;
- test manifest;
- last successful verification;
- scale-validation status;
- known limitations;
- blocking dependencies;
- applicable roadmap phase.

The matrix must be derived from verified state.

It must not be manually inflated to match roadmap goals.

---

## 45. Human-readable capability report

A human-readable capability report should answer:

- What works?
- For which languages and repository shapes?
- Which exact evidence is collected?
- Which coverage profiles are implemented?
- Which classifications are supported?
- Which transformations are supported?
- Which verification gates are enforced?
- Which providers can publish drafts?
- Which security controls are enforced?
- What remains experimental, partial, broken, or unsupported?
- What scale has been tested?

Broad marketing statements should be replaced by explicit capability tables.

---

## 46. Capability status transitions

Valid status transitions may include:

```text
planned → placeholder
placeholder → experimental
experimental → functional
functional → scale_validated
functional → broken
experimental → blocked
functional → deprecated
deprecated → unsupported
unknown → verified status
```

A status transition must be evidence-backed.

A capability must not move directly from planned to scale-validated without
implementing and validating the intermediate requirements.

---

## 47. Capability regression

A previously functional capability may become `broken` or
`partially_supported`.

Regression triggers include:

- tool incompatibility;
- dependency upgrade;
- provider API change;
- new failing tests;
- security-control failure;
- unsupported language-version change;
- migration failure;
- stale external integration;
- runner-image change.

Capability reporting must reflect current verified behavior rather than its
historical best status.

---

## 48. Capability deprecation

Deprecating a capability requires:

- reason;
- replacement capability;
- migration path;
- affected users or integrations;
- compatibility period;
- telemetry or usage evidence where applicable;
- removal phase;
- approval when external behavior changes.

Deprecation does not authorize destructive removal of data or external
resources.

---

## 49. Capability versioning

A new capability version is required when a material change affects:

- supported input;
- output contract;
- evidence semantics;
- coverage requirements;
- classification behavior;
- transformation behavior;
- security boundary;
- failure behavior;
- digest identity;
- publication behavior.

Backward-compatible implementation fixes may retain the existing capability
version when semantics remain unchanged.

---

## 50. Tool-backed capabilities

When a capability depends on a third-party tool, the capability definition must
identify:

- tool name;
- tool version;
- adapter version;
- license status;
- supported input scope;
- output semantics;
- known tool limitations;
- failure behavior;
- fallback behavior;
- replacement strategy.

The capability belongs to DCAv2 only when DCAv2 correctly integrates,
normalizes, validates, and reports the tool's behavior.

Installing a tool does not establish the capability.

---

## 51. License uncertainty

A tool-backed capability must not be marked functional when mandatory tool
licensing remains unverified.

When license information cannot be established:

- mark the dependency decision as blocked or unverified;
- do not distribute the tool;
- do not make it a mandatory product dependency;
- record the required legal or licensing review;
- evaluate alternatives.

License uncertainty must not be concealed in capability reporting.

---

## 52. Capability and roadmap relationship

Roadmap phases may introduce or improve capabilities.

The roadmap should identify:

- target capability IDs;
- intended starting status;
- intended ending status;
- required fixtures;
- required security controls;
- scale-validation expectations;
- acceptance criteria.

A phase may complete with some capabilities intentionally remaining
experimental, detection-only, or unsupported when the phase specification says
so.

The phase report must state the actual resulting status.

---

## 53. Capability and authorization relationship

Capability definitions do not authorize execution.

A capability marked functional does not automatically authorize:

- use against an external repository;
- use of credentials;
- remediation;
- publication;
- destructive operations;
- starting a roadmap phase.

Every operation still requires current applicable authorization.

---

## 54. Capability and coverage relationship

A capability may be operational while coverage for a specific finding remains
incomplete.

For example:

- semantic reference extraction may be functional;
- a relevant workspace may be unavailable;
- cross-repository coverage may therefore be incomplete;
- the finding must remain inconclusive.

Capability availability does not guarantee that every execution satisfies its
coverage requirements.

---

## 55. Capability and security relationship

A capability requiring a security control cannot be functional when the control
is unavailable or unverified.

Examples include:

- repository build capability requires isolated execution;
- remediation capability requires credential-free runner execution;
- publication capability requires trusted publisher isolation;
- audit capability requires append-only enforcement;
- multi-tenant capability requires tenant isolation.

Security requirements must be part of capability acceptance criteria.

---

## 56. Capability and scale relationship

Functional support and scale validation are separate.

A capability may work correctly for:

- one repository;
- one package;
- a small symbol graph;
- one analysis job.

It must not be described as enterprise-scale until representative organization,
monorepo, database, concurrency, and resource behavior has been measured.

Scale limits must remain explicit.

---

## 57. Current-system reconciliation

Phase 0 must assign evidence-backed statuses to existing capabilities.

The reconciliation should identify:

- implemented capabilities;
- partially implemented capabilities;
- placeholders;
- broken behavior;
- unknown behavior;
- undocumented capabilities;
- stale documentation;
- fixture-specific behavior;
- missing tests;
- missing security validation.

The current capability matrix must reflect executable behavior rather than
roadmap intent.

---

## 58. Reporting requirements

Every phase report affecting capabilities must state:

- capability IDs changed;
- previous statuses;
- resulting statuses;
- implementation evidence;
- tests executed;
- security controls validated;
- fixtures used;
- scale validation performed;
- remaining limitations;
- blockers;
- unsupported cases.

A status change must not be reported without supporting evidence.

---

## 59. Completion claims

A phase must not claim that a capability is complete because:

- code compiles;
- an interface exists;
- one positive test passes;
- documentation was added;
- a dependency was installed;
- a database migration succeeded;
- a mock provider returned success;
- a fixture-specific path worked.

Completion requires the capability's explicit acceptance criteria.

---

## 60. Testing-policy integration

Each capability should reference test identifiers in the applicable phase test
manifest.

Tests should be categorized as:

- required;
- conditional;
- security;
- integration;
- migration;
- hostile;
- scale;
- manual verification.

An unavailable required test blocks functional status.

A skipped required test must not be counted as passed.

---

## 61. Capability evidence record

A capability-status decision should retain evidence including:

- source commit;
- implementation paths;
- test commands;
- test results;
- fixture identities;
- tool versions;
- runner profile;
- security-control results;
- migration results;
- benchmark results;
- reviewer or approver when required;
- decision time.

Historical capability decisions should remain auditable.

---

## 62. Fail-safe behavior

When capability status cannot be established confidently:

- use `unknown`;
- do not advertise support;
- do not route production work to the capability;
- do not permit it to satisfy required coverage;
- do not authorize remediation through it;
- preserve available test and implementation evidence;
- identify the validation still required.

Capability uncertainty must reduce operational claims.

---

## 63. Document integrity

This document must not be modified during implementation unless architecture or
governance modification is explicitly authorized.

Changes require:

1. Identification of the capability-definition problem.
2. Review against the product contract.
3. Review of evidence, coverage, classification, and remediation impact.
4. Review of reporting and testing implications.
5. Updated capability schemas or matrices.
6. Updated fixtures and status-transition tests.
7. A reviewable architecture commit.
8. An ADR when the change alters long-lived capability identity, status, or
   completion semantics.

Capability definitions must not be weakened to make incomplete work appear
functional or scale-validated.