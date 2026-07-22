# DCAv2 Roadmap Overview

This document defines the planned sequence for evolving DCAv2 from its current
implementation into a broader evidence-driven dead-code analysis and
remediation platform.

The roadmap describes possible future work.

It does not authorize:

- starting a phase;
- modifying source code;
- installing dependencies;
- accessing repositories;
- using credentials;
- executing external operations;
- remediating findings;
- publishing branches or pull requests;
- changing infrastructure;
- changing governance.

Execution authority is governed by:

- `AGENTS.md`;
- `codex/core/01-instruction-precedence.md`;
- `codex/core/03-safety-invariants.md`;
- `codex/core/05-phase-authorization-protocol.md`;
- `codex/authorizations/current-phase-authorization.yaml`;
- the latest explicit human authorization.

---

## 1. Product direction

DCAv2 is intended to become an evidence-driven platform for detecting,
explaining, reviewing, and safely remediating dead code across enterprise
software systems.

The roadmap expands capability incrementally across:

- single-package repositories;
- monorepos;
- multiple package managers;
- TypeScript and Python;
- additional languages;
- cross-repository analysis;
- service contracts;
- runtime and infrastructure evidence;
- organization-wide campaigns;
- representative scale.

The roadmap must preserve conservative classification and remediation behavior
throughout this expansion.

---

## 2. Roadmap principles

Every phase must follow these principles:

- evolve the existing system rather than replace it wholesale;
- reconcile current behavior before expanding scope;
- add one bounded capability group at a time;
- preserve evidence provenance;
- preserve explicit coverage accounting;
- treat unknown scope as incomplete;
- separate analysis from human disposition;
- separate human disposition from remediation authorization;
- reproduce exact findings before modification;
- run baseline and post-change gates;
- generate deterministic patches;
- publish only through the trusted publisher;
- create draft pull requests only;
- preserve append-only audit history;
- validate security controls rather than assuming them;
- reuse proven tools before building large custom subsystems;
- report unsupported and unavailable behavior explicitly;
- distinguish functional support from scale validation.

---

## 3. Roadmap and authorization separation

A roadmap phase is not active merely because:

- it appears in this document;
- an earlier phase completed;
- implementation files exist;
- tests exist;
- credentials are available;
- a defect is known;
- work remains unfinished;
- a continuation prompt references the phase;
- an execution-state file mentions the phase.

A phase may begin only when the current authorization record identifies it as
active and permits the required work.

When authorization is inactive, expired, revoked, missing, or ambiguous, DCAv2
must stop before implementation or external execution.

---

## 4. Phase model

The roadmap is divided into the following phases:

| Phase | Name | Primary objective |
|---|---|---|
| 0 | Current-System Reconciliation | Establish verified current state and repair only authorized foundational defects |
| 1 | TypeScript Vertical Slice | Complete one narrow evidence-to-draft-PR workflow |
| 2 | Qualification and Configuration | Make repository readiness and required setup explicit |
| 3A | npm Monorepos | Support bounded npm workspace analysis |
| 3B | pnpm | Add pnpm-specific workspace and install behavior |
| 3C | Yarn | Add Yarn Classic, Berry, and Plug'n'Play incrementally |
| 3D | TSX and Frameworks | Add syntax and framework convention support |
| 4 | Python | Add conservative Python evidence and classification |
| 5 | Additional Language | Add one evidence-backed additional language |
| 6 | Cross-Repository Analysis | Model references and consumers across repositories |
| 7 | Contracts and Microservices | Add service-contract and distributed consumer evidence |
| 8 | Infrastructure and Runtime | Add deployment, infrastructure, and runtime signals |
| 9 | Campaigns and Control Plane | Coordinate organization-wide analysis and review |
| 10 | Scale Validation | Validate representative enterprise workloads and operations |

Each phase has a separate detailed roadmap file.

---

## 5. Phase granularity

Phases must remain small enough to:

- define exact authorization;
- identify affected capabilities;
- identify permitted repositories;
- identify permitted files;
- identify required tests;
- define completion criteria;
- stop safely when blocked;
- produce a reviewable report.

A broad roadmap phase may be divided further when implementation reveals
independent capability or risk boundaries.

Phase subdivision does not require changing the product mission.

---

## 6. Phase ordering

The default phase order is sequential.

A later phase should not begin when it depends on unresolved required behavior
from an earlier phase.

A later phase may proceed before every optional earlier capability is complete
only when:

- the dependency relationship is understood;
- required earlier capabilities are functional;
- deferred behavior is explicit;
- the current authorization permits the later phase;
- the later phase does not rely on unsupported assumptions.

Phase order may be changed only through an explicit human decision and updated
authorization.

---

## 7. Phase completion does not imply universal support

Completion of a phase means only that its explicit authorized objectives and
required tests were satisfied.

For example:

- Phase 1 completion does not imply complete TypeScript support.
- Phase 3A completion does not imply all monorepo support.
- Phase 4 completion does not imply all Python frameworks are supported.
- Phase 6 completion does not imply all cross-repository consumers are known.
- Phase 10 completion does not imply unlimited enterprise scale.

Capability reports must retain exact boundaries.

---

## 8. Capability progression

Capabilities should normally progress through statuses such as:

```text
planned
  ↓
placeholder
  ↓
experimental
  ↓
functional
  ↓
scale_validated
```

Other valid outcomes include:

- `detection_only`;
- `partially_supported`;
- `blocked`;
- `unsupported`;
- `broken`;
- `unknown`;
- `deprecated`.

A phase report must state actual resulting capability status.

It must not report the intended target status when implementation or tests did
not establish it.

---

## 9. Required phase inputs

Before a phase begins, its authorization should identify:

- phase ID;
- phase objective;
- start and completion boundary;
- repository scope;
- file scope;
- permitted commands;
- permitted dependencies;
- permitted network access;
- permitted credentials;
- permitted database operations;
- permitted external operations;
- remediation permission;
- publication permission;
- destructive-operation permission;
- required tests;
- stop conditions;
- human approver;
- expiration or completion condition.

Missing permissions default to denial.

---

## 10. Required phase outputs

Every phase should produce applicable:

- implementation changes;
- migrations;
- test manifests;
- test results;
- capability-matrix updates;
- architecture decisions;
- tool decisions;
- security-control results;
- phase-completion report;
- updated execution state;
- continuation information;
- explicit blocker records.

Reports must distinguish:

- implemented from planned;
- tested from assumed;
- passed from unavailable;
- functional from scale-validated;
- local from external;
- detection from remediation;
- remediation from publication.

---

## 11. Common completion requirements

A phase may be complete only when applicable:

1. The authorized objective is satisfied.
2. Required implementation exists.
3. Required positive tests pass.
4. Required negative tests pass.
5. Required failure tests pass.
6. Required security controls pass.
7. Required migration tests pass.
8. Required cleanup completes.
9. Unsupported cases are explicit.
10. Capability statuses are updated truthfully.
11. Audit and reporting records are complete.
12. No unresolved blocker contradicts completion.
13. Authorization remained valid through the work.

A phase-specific roadmap may add stricter requirements.

---

## 12. Common stop conditions

Work must stop when applicable:

- authorization is missing;
- authorization expires;
- authorization is revoked;
- requested work exceeds phase scope;
- a prohibited repository is encountered;
- repository identity cannot be established;
- a required credential is unavailable;
- a required security control fails;
- runner containment is uncertain;
- trusted publisher isolation is uncertain;
- a required test is unavailable;
- a destructive operation would be required without permission;
- a governance conflict is discovered;
- secret exposure is suspected;
- external state becomes unknown and cannot be reconciled safely.

Stopping is a correct result when continuation would be unsafe or unauthorized.

---

## 13. Phase 0 — Current-System Reconciliation

Detailed file:

`codex/roadmap/phase-0-reconciliation.md`

Primary objective:

- establish an evidence-backed inventory of the current DCAv2 implementation;
- reconcile documentation, schemas, migrations, tests, and executable behavior;
- identify functional, partial, placeholder, broken, unsupported, and unknown
  capabilities;
- repair only narrowly authorized foundational defects.

Expected areas include:

- current architecture;
- repository state;
- database schema and migrations;
- controller, runner, and publisher boundaries;
- command execution;
- TypeScript workflow;
- audit behavior;
- capability reporting;
- known fixture behavior;
- test infrastructure.

Phase 0 must not become a general product expansion phase.

---

## 14. Known TypeScript runner defect

A previously observed TypeScript remediation attempt failed because the isolated
runner could not locate `tsc`, even though TypeScript was declared as a
development dependency in the fixture.

Phase 0 should determine whether the failure is caused by:

- dependency installation;
- lifecycle-script policy;
- package-manager behavior;
- workspace mounting;
- executable resolution;
- `PATH` construction;
- command definition;
- runner-image contents;
- fixture configuration;
- another reproducible cause.

The defect must not be described as fixed until reproduced, corrected, and
tested inside the approved runner.

The roadmap does not itself authorize that repair.

---

## 15. Phase 1 — TypeScript Vertical Slice

Detailed file:

`codex/roadmap/phase-1-typescript-vertical-slice.md`

Primary objective:

Deliver one narrow, end-to-end TypeScript capability covering:

1. Repository qualification.
2. Immutable source acquisition.
3. Source and symbol discovery.
4. Evidence collection.
5. Coverage evaluation.
6. Deterministic classification.
7. Human disposition.
8. Separate remediation authorization.
9. Exact finding reproduction.
10. Baseline gates.
11. Structured transformation.
12. Post-change gates.
13. Deterministic patch creation.
14. Trusted draft pull-request publication when separately authorized.

The initial supported symbol shape should remain narrow, such as a private
TypeScript function in a qualified single-package npm repository.

Broader TypeScript claims must remain unsupported or experimental.

---

## 16. Phase 1 fixture expectations

Phase 1 should use more than one fixture shape before claiming functional
support.

Fixture variation should include applicable:

- repository name;
- owner;
- source path;
- symbol name;
- formatting;
- declaration position;
- package configuration;
- test layout;
- positive and negative reference cases.

Production code must not branch on fixture-specific names or commits.

An authorized external fixture may supplement synthetic fixtures but must not
become the only proof of general behavior.

---

## 17. Phase 2 — Qualification and Configuration

Detailed file:

`codex/roadmap/phase-2-qualification-and-configuration.md`

Primary objective:

Make repository readiness explicit before analysis or remediation.

Expected capabilities include:

- language detection;
- package-manager detection;
- workspace detection;
- source-root discovery;
- test-root discovery;
- generated-root discovery;
- build and test command discovery;
- required tool detection;
- configuration requirement reporting;
- baseline-state reporting;
- immutable revision resolution;
- supported and unsupported repository-shape reporting.

Qualification must distinguish:

- ready;
- ready with limited gates;
- configuration required;
- baseline broken;
- unsupported;
- inaccessible;
- failed.

---

## 18. Phase 3A — npm Monorepos

Detailed file:

`codex/roadmap/phase-3a-npm-monorepos.md`

Primary objective:

Add bounded support for npm workspaces.

Expected capability areas include:

- workspace discovery;
- package graph construction;
- cross-workspace references;
- package exports;
- path aliases;
- TypeScript project references;
- package-specific commands;
- aggregate coverage;
- partial workspace failure;
- remediation isolation.

Completion must not imply pnpm, Yarn, arbitrary build-system, or unlimited
monorepo support.

---

## 19. Phase 3B — pnpm

Detailed file:

`codex/roadmap/phase-3b-pnpm.md`

Primary objective:

Add pnpm-specific behavior without assuming npm workspace semantics are
identical.

Expected capability areas include:

- `pnpm-workspace.yaml`;
- pnpm lockfiles;
- workspace graph behavior;
- filtered commands;
- content-addressable storage implications;
- lifecycle-script handling;
- private registry behavior;
- dependency cache behavior;
- deterministic installation;
- isolated verification.

pnpm support must be capability-tested separately.

---

## 20. Phase 3C — Yarn

Detailed file:

`codex/roadmap/phase-3c-yarn.md`

Primary objective:

Add Yarn support incrementally.

Support should be divided into:

- Yarn Classic;
- Yarn Berry with `node_modules`;
- Yarn Plug'n'Play.

Each mode must have separate capability status.

Plug'n'Play support must not be inferred from successful Yarn Classic behavior.

---

## 21. Phase 3D — TSX and Frameworks

Detailed file:

`codex/roadmap/phase-3d-tsx-and-frameworks.md`

Primary objective:

Expand TypeScript and JavaScript analysis to selected syntax and framework
conventions.

Potential areas include:

- TSX and JSX;
- component references;
- route registration;
- dependency injection;
- decorators;
- plugin discovery;
- scheduled jobs;
- event handlers;
- framework entry points;
- serialization hooks.

Each framework convention must produce explicit evidence and coverage behavior.

Framework presence alone must not cause a finding to be treated as live or dead
without a supported rule.

---

## 22. Phase 4 — Python

Detailed file:

`codex/roadmap/phase-4-python.md`

Primary objective:

Introduce conservative Python evidence and classification.

Potential reusable components include:

- Python AST facilities;
- language-server or semantic tooling;
- Vulture;
- framework-specific adapters.

Expected areas include:

- module discovery;
- function and class inventory;
- imports;
- references;
- tests;
- package entry points;
- decorators;
- reflection;
- dynamic imports;
- framework registration;
- detection-only transformations initially.

Python's dynamic behavior must reduce certainty when unresolved.

---

## 23. Phase 5 — Additional Language

Detailed file:

`codex/roadmap/phase-5-additional-language.md`

Primary objective:

Add one additional language selected through evidence-based evaluation.

The selection should consider:

- user demand;
- repository prevalence;
- parser maturity;
- semantic-index availability;
- reference-analysis quality;
- framework complexity;
- transformation safety;
- licensing;
- maintenance;
- runner compatibility.

The phase should add one language rather than claiming generic polyglot support.

---

## 24. Phase 6 — Cross-Repository Analysis

Detailed file:

`codex/roadmap/phase-6-cross-repository.md`

Primary objective:

Model evidence and consumer scope across repository boundaries.

Expected areas include:

- repository identity;
- organization inventory;
- immutable source snapshots;
- package publication metadata;
- dependency relationships;
- shared semantic indexes;
- consumer discovery;
- missing-repository behavior;
- stale-repository behavior;
- permission boundaries;
- cross-repository coverage.

Unknown or inaccessible repositories must keep affected findings inconclusive.

Cross-repository absence must not be treated as proof of non-use.

---

## 25. Phase 7 — Contracts and Microservices

Detailed file:

`codex/roadmap/phase-7-contracts-and-microservices.md`

Primary objective:

Add bounded evidence for distributed service consumers that may not appear as
source-level references.

Potential evidence sources include:

- OpenAPI;
- Protobuf;
- GraphQL schemas;
- message schemas;
- topic and queue configuration;
- route registration;
- service manifests;
- generated clients;
- deployment metadata.

Contract evidence must distinguish:

- declaration;
- publication;
- generation;
- configured consumer;
- observed runtime consumer;
- unknown external consumer.

This phase should remain detection-focused until remediation safety is proven.

---

## 26. Phase 8 — Infrastructure and Runtime

Detailed file:

`codex/roadmap/phase-8-infrastructure-and-runtime.md`

Primary objective:

Add non-source evidence from infrastructure and authorized runtime observation.

Potential areas include:

- deployment manifests;
- container configuration;
- infrastructure-as-code;
- scheduled tasks;
- environment-specific entry points;
- feature flags;
- runtime traces;
- service telemetry;
- route observations;
- message consumption;
- dynamic loading.

Runtime absence is not proof of dead code unless:

- the observation window is defined;
- coverage is sufficient;
- environments are known;
- sampling limitations are explicit;
- contradictory evidence is absent;
- the applicable classification profile permits the conclusion.

---

## 27. Phase 9 — Campaigns and Control Plane

Detailed file:

`codex/roadmap/phase-9-campaigns-and-control-plane.md`

Primary objective:

Coordinate analysis and review across many repositories without weakening
repository-level safety.

Expected areas include:

- repository campaigns;
- scheduling;
- prioritization;
- tenant-scoped queues;
- capability-aware routing;
- review workflows;
- remediation queues;
- authorization tracking;
- audit queries;
- dashboards;
- rate limits;
- failure isolation;
- partial campaign completion.

A campaign must not create broad remediation or publication authority.

Each finding remains subject to its own evidence, coverage, disposition, and
authorization requirements.

---

## 28. Phase 10 — Scale Validation

Detailed file:

`codex/roadmap/phase-10-scale-validation.md`

Primary objective:

Validate already functional capabilities against representative enterprise
workloads.

Scale validation should measure applicable:

- repository count;
- monorepo size;
- file count;
- symbol count;
- workspace count;
- evidence volume;
- finding volume;
- tenant count;
- concurrency;
- database growth;
- query latency;
- runner throughput;
- artifact size;
- provider rate limits;
- failure recovery;
- cleanup behavior;
- operational cost.

Phase 10 must not be used to conceal missing functional correctness.

Only already functional capability scopes should be presented as
scale-validation candidates.

---

## 29. Detection and remediation progression

New language, repository-shape, framework, contract, runtime, and
cross-repository capabilities should usually progress through:

1. Inventory.
2. Evidence collection.
3. Coverage reporting.
4. Conservative classification.
5. Detection-only review.
6. Exact reproduction.
7. Structured transformation.
8. Verification.
9. Trusted draft publication.

A phase may stop at detection-only support when transformation or verification
is not safe.

Detection-only completion is valid when declared explicitly.

---

## 30. Remediation boundaries

A finding may enter remediation only when applicable:

- the finding identity is exact;
- source identity is immutable;
- evidence is current;
- required coverage is complete;
- no dominant liveness evidence exists;
- classification is supported;
- a human has confirmed the finding;
- separate remediation authorization exists;
- transformation is supported;
- baseline gates are available;
- post-change gates are available;
- the runner is isolated;
- the publisher is separated.

A roadmap phase must not weaken these requirements to demonstrate progress.

---

## 31. Publication boundaries

External publication must always remain:

- finding-specific;
- repository-specific;
- source-commit-specific;
- patch-specific;
- authorization-specific;
- credential-scoped;
- idempotent;
- audited.

The permitted publication result is:

- a dedicated branch;
- a draft pull request.

The roadmap does not include automatic merge, auto-merge, direct default-branch
push, or automatic ready-for-review transitions.

---

## 32. Tooling strategy

Each phase must evaluate existing tools before building equivalent custom
behavior.

Potential tools include:

- Tree-sitter;
- SCIP;
- `scip-typescript`;
- Knip;
- Vulture;
- PolyglotPiranha;
- language compilers;
- package-manager APIs;
- provider APIs;
- PostgreSQL capabilities.

A tool must not become mandatory until applicable:

- functional evaluation;
- license review;
- security review;
- provenance review;
- adapter design;
- failure tests;
- capability tests;
- replacement planning;

are complete.

---

## 33. Tool availability

When a required tool is unavailable:

- report the tool as unavailable;
- report the affected command;
- report the affected test;
- reduce coverage;
- block dependent completion;
- do not substitute an undeclared host-global executable;
- do not skip the gate;
- do not claim the capability is functional.

Infrastructure limitations must remain visible in phase reports.

---

## 34. Licensing uncertainty

When a candidate tool's license cannot be verified:

- do not make it mandatory;
- do not distribute it;
- do not claim approval;
- mark the adoption decision blocked or experimental;
- record the missing information;
- evaluate alternatives.

A roadmap reference to a tool is not license approval.

---

## 35. Database evolution

Every phase affecting persistence must follow:

`codex/engineering/database-evolution-policy.md`

Required behavior includes:

- additive migrations;
- immutable historical migrations;
- upgrade testing;
- fresh-install testing;
- tenant isolation;
- historical-data preservation;
- forward recovery where rollback is unsafe;
- audit compatibility.

A phase must not rewrite old migrations to simplify its implementation.

---

## 36. Structured execution

Every phase introducing executable operations must follow:

`codex/engineering/structured-command-policy.md`

Commands must use:

- stable command identities;
- structured arguments;
- explicit trust zones;
- environment allowlists;
- network profiles;
- filesystem profiles;
- timeouts;
- resource limits;
- bounded output;
- explicit failure statuses.

Generated arbitrary shell text must not be executed.

---

## 37. Runner security

Every phase executing repository-controlled content must follow:

`codex/engineering/runner-security-controls.md`

A required runner control that is unavailable or unverified blocks affected
production capability.

Local development success must not be represented as proof of production runner
security.

---

## 38. Testing strategy

Every phase must define its required tests before completion.

Test categories should include applicable:

- positive;
- negative;
- unsupported;
- failure;
- hostile;
- migration;
- security;
- integration;
- end-to-end;
- recovery;
- scale.

The phrase “run relevant tests” is insufficient.

The phase test manifest must identify concrete test IDs.

---

## 39. Phase test manifests

Each phase should have or extend a machine-readable test manifest under:

`codex/tests/`

A manifest should identify:

- test ID;
- capability;
- category;
- required or conditional status;
- prerequisites;
- fixture;
- command;
- expected result;
- completion impact.

An unavailable required test blocks completion.

A skipped required test blocks completion.

---

## 40. Security-control matrix

Security-related phases must update:

`codex/tests/security-control-matrix.yaml`

The matrix must distinguish:

- configured;
- enforced;
- partially enforced;
- failed;
- unavailable;
- unsupported;
- deferred;
- unverified.

Only tested `enforced` controls may satisfy required security acceptance
criteria.

---

## 41. Architecture decisions

A phase must create an ADR when it introduces a long-lived decision affecting:

- trust boundaries;
- credentials;
- persistence;
- audit identity;
- authoritative evidence formats;
- classification semantics;
- infrastructure;
- hosted services;
- core tool adoption;
- provider architecture;
- tenant isolation;
- migration strategy.

An ADR may be drafted by Codex.

Acceptance requires explicit human approval.

An accepted ADR does not authorize implementation.

---

## 42. Repository-access boundaries

Every phase involving repository access must validate:

- provider;
- account or installation;
- canonical repository identity;
- repository-access policy;
- prohibited-repository policy;
- exact source revision;
- permitted operation.

The absolute prohibited repository remains:

```text
akshay-hudev/Rufa-Clean
```

DCAv2 must not clone, fetch, inspect, qualify, analyze, modify, branch, or
publish against that repository.

Denylist validation must occur before content retrieval.

---

## 43. External fixture use

External fixtures may be used only when the phase authorization identifies:

- repository;
- immutable revision;
- permitted operations;
- credentials;
- network access;
- cleanup behavior;
- publication permission.

Broad permission to access an account does not authorize destructive or
publication operations.

Draft publication against a fixture still requires finding-specific human
disposition and separate remediation authorization.

---

## 44. Local repository safety

Roadmap work must preserve pre-existing local user work.

Without explicit authorization, Codex must not:

- hard reset;
- destructively clean;
- discard local changes;
- delete user branches;
- amend unrelated commits;
- rewrite shared history;
- replace the repository;
- modify unrelated files.

Tests and temporary work must use isolated paths where practical.

---

## 45. Governance changes

Roadmap implementation must not modify governance files unless the current
authorization explicitly permits governance work.

Implementation problems must not be solved by weakening:

- safety invariants;
- authorization rules;
- evidence requirements;
- coverage requirements;
- remediation gates;
- publication restrictions;
- testing requirements;
- reporting truthfulness.

Governance changes require separate review and a reviewable commit.

---

## 46. Blocker handling

A phase blocker must identify:

- affected objective;
- exact blocker;
- reproduction or evidence;
- affected capability;
- whether the blocker is internal or external;
- safe next action;
- required human decision;
- completion impact.

A blocker must not be hidden by:

- reducing test coverage silently;
- changing a required test to optional;
- relabeling unsupported behavior as experimental;
- broadening authorization;
- weakening a security control;
- removing a failing test.

---

## 47. Deferred work

Deferred work must be explicit.

A deferment record should identify:

- capability;
- reason;
- current status;
- dependency;
- future phase;
- risk;
- whether current functionality is affected.

Deferring optional work may be compatible with phase completion.

Deferring a required acceptance criterion blocks completion unless the human
operator explicitly changes the authorized phase scope.

---

## 48. Phase reports

Every phase report should include:

- authorization identity;
- objective;
- source commit before and after;
- files changed;
- migrations;
- dependencies;
- commands executed;
- tests;
- security controls;
- external operations;
- capability changes;
- limitations;
- blockers;
- cleanup;
- database state;
- local Git state;
- next authorized action.

Reports describe work.

They do not authorize continuation.

---

## 49. Execution state

`CODEX_EXECUTION_STATE.md` should contain the current bounded continuation
state.

It should identify:

- active or inactive status;
- active phase when authorized;
- authorization ID;
- completed work;
- current blocker;
- test status;
- repository state;
- external state;
- cleanup state;
- safe next action.

The execution-state file must not grant authority.

When no phase is active, that status must remain explicit.

---

## 50. Phase handoff

A phase handoff should provide enough information for a new operator or Codex
session to continue without relying on private memory.

The handoff should identify:

- applicable governance;
- current authorization;
- implementation state;
- relevant files;
- tests executed;
- failures;
- fixtures;
- external operations;
- retained resources;
- next safe command or decision.

The handoff must not contain secret values.

---

## 51. No automatic continuation

Completing one phase must not automatically start the next phase.

After phase completion:

1. Finalize the phase report.
2. Update execution state.
3. Stop implementation.
4. Present actual capability status.
5. Await explicit human authorization for the next phase.

Remaining time, context, or available credentials do not authorize continuation.

---

## 52. Roadmap revision

The roadmap may be revised when:

- current-system reconciliation changes assumptions;
- capability dependencies differ from expectations;
- security review requires stronger boundaries;
- tool evaluation rejects an intended dependency;
- licensing blocks adoption;
- user priorities change;
- representative fixtures reveal missing intermediate phases;
- scale data changes sequencing.

Roadmap revision requires explicit governance authorization.

A roadmap revision must not rewrite historical phase reports.

---

## 53. Phase splitting

A phase should be split when it contains independent work with materially
different:

- trust boundaries;
- languages;
- package managers;
- providers;
- dependencies;
- migrations;
- test infrastructure;
- security risks;
- completion criteria.

Phase 3 is intentionally divided into 3A through 3D to avoid claiming universal
monorepo support from one broad implementation effort.

Future phases may be subdivided similarly.

---

## 54. Phase merging

Phases should not be merged solely to reduce reporting overhead.

A phase merge is appropriate only when:

- objectives are tightly coupled;
- authorization remains precise;
- test criteria remain clear;
- stop conditions remain enforceable;
- review remains manageable.

Broad merged phases increase the risk of ambiguous authority and incomplete
reporting.

---

## 55. Roadmap success criteria

The roadmap succeeds when DCAv2 can expand supported scope while preserving:

- conservative conclusions;
- explicit uncertainty;
- complete provenance;
- coverage accountability;
- human control;
- deterministic remediation;
- trusted publication boundaries;
- tenant isolation;
- tamper-evident audit;
- reproducible tests;
- bounded capability claims.

Success is not measured only by the number of languages, repositories, or
findings processed.

Safety, explainability, and evidence quality remain product requirements.

---

## 56. Prohibited roadmap interpretations

The roadmap must not be interpreted as permission to:

- finish the entire project;
- implement all listed phases;
- access every repository;
- test against prohibited repositories;
- install every named tool;
- use every available credential;
- remediate every confirmed finding;
- publish every patch;
- merge pull requests;
- change production infrastructure;
- rewrite migrations;
- weaken tests to reach completion.

Every actual operation remains governed by current authorization.

---

## 57. Fail-safe behavior

When roadmap scope, phase dependencies, authorization, capability status, or
completion criteria are uncertain:

- do not start implementation;
- do not infer the active phase;
- do not broaden the current phase;
- do not access external repositories;
- do not use credentials;
- do not perform publication;
- preserve the verified current state;
- record the uncertainty;
- request the specific human decision required.

Roadmap uncertainty must reduce execution authority.

---

## 58. Document integrity

This document must not be modified during implementation unless roadmap or
governance modification is explicitly authorized.

Changes require:

1. Identification of the roadmap problem.
2. Review against the product contract.
3. Review against permanent safety invariants.
4. Review of phase dependency and authorization impact.
5. Review of test and capability implications.
6. Updated phase roadmap files where applicable.
7. Updated schemas or authorization templates where applicable.
8. A reviewable governance commit.
9. An ADR when the change alters long-lived architecture sequencing or product
   boundaries.

This roadmap must not be changed to make unauthorized work appear permitted or
incomplete capability appear complete.