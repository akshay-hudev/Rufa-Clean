# Phase 9 — Campaigns and Control Plane

This document defines the planned scope, capability boundaries, safety
requirements, tests, stop conditions, and completion criteria for Phase 9 of
DCAv2.

Phase 9 introduces controlled orchestration across repositories, services,
contracts, environments, evidence sources, and authorized remediation
workflows.

The control plane coordinates work. It does not create authority.

A campaign, queue entry, workflow state, generated recommendation, continuation
record, scheduled refresh, or prior approval must never grant permission to:

- access another repository;
- access another tenant;
- access production systems;
- retrieve credentials;
- modify source;
- modify infrastructure;
- publish a branch or pull request;
- merge a pull request;
- delete a resource;
- continue into another phase.

Every operation remains subject to current policy, current authorization,
current evidence, current coverage, and exact target identity.

This roadmap file does not authorize implementation, repository access,
credential use, database changes, campaign execution, remediation,
publication, infrastructure operations, or destructive operations.

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
  id: phase-9-campaigns-and-control-plane
  name: Campaigns and Control Plane
  roadmap_order: 9
  default_status: inactive
  implementation_authorized_by_this_file: false
```

The phase becomes active only when the current authorization record explicitly
identifies `phase-9-campaigns-and-control-plane` as active.

---

## 2. Primary objective

The primary objective is to coordinate bounded, policy-governed DCAv2 work at a
larger organizational scope.

The phase should implement and validate applicable:

1. Campaign identity.
2. Campaign scope.
3. Campaign authorization binding.
4. Trusted control-plane orchestration.
5. Tenant-scoped work queues.
6. Deterministic workflow state machines.
7. Repository, service, contract, and environment selection.
8. Job creation and deduplication.
9. Job leasing and worker ownership.
10. Safe retries.
11. Idempotency.
12. Concurrency controls.
13. Provider and registry rate-limit controls.
14. Resource and cost budgets.
15. Priority and fairness controls.
16. Evidence-refresh workflows.
17. Qualification workflows.
18. Analysis workflows.
19. Human-review workflows.
20. Remediation-preparation workflows.
21. Publication-request workflows.
22. Pause, resume, cancel, and stop behavior.
23. Failure isolation.
24. Staleness propagation.
25. Campaign-level coverage aggregation.
26. Campaign-level reporting.
27. Append-only audit.
28. Tenant isolation.
29. Security incident controls.
30. Truthful execution-state handoff.

The control plane should coordinate only capabilities already established by
earlier phases.

---

## 3. Intended capability

The intended capability is conceptually:

```text
Create one bounded campaign over an explicitly authorized target set, schedule
and execute supported DCAv2 operations through trusted orchestration and
isolated workers, preserve per-target evidence and failure states, route
findings for human review, and prevent remediation or publication unless each
finding has current independent authorization.
```

The capability must remain constrained by:

- one tenant;
- one active campaign authorization;
- supported target-universe types;
- supported capability versions;
- explicit operation types;
- explicit repository and system policies;
- explicit resource limits;
- exact work-item identity;
- current evidence and coverage;
- current human disposition;
- separate remediation authorization;
- separate publication authorization;
- trusted control-plane boundaries;
- isolated runner boundaries;
- append-only audit;
- deterministic state transitions.

---

## 4. Phase prerequisites

Phase 9 should not begin until earlier phases have established or bounded:

- repository qualification;
- immutable source identity;
- package and symbol identity;
- cross-repository universes;
- service and contract identity;
- infrastructure and runtime identities;
- evidence normalization;
- open-world coverage;
- deterministic classification;
- human disposition;
- separate remediation authorization;
- exact finding reproduction;
- target and consumer verification;
- trusted publication;
- runner isolation;
- additive database evolution;
- append-only audit;
- tenant isolation;
- capability reporting;
- security-control reporting.

The control plane must use these existing contracts rather than redefining them
implicitly.

---

## 5. Non-goals

Phase 9 does not, by default, include:

- universal enterprise automation;
- unrestricted organization enumeration;
- unrestricted production access;
- unrestricted remediation;
- automatic human disposition;
- automatic remediation authorization;
- automatic publication authorization;
- direct default-branch pushes;
- automatic pull-request readiness;
- pull-request merge;
- auto-merge;
- deployment;
- infrastructure apply;
- feature-flag modification;
- package publication;
- contract publication;
- queue or topic deletion;
- database-schema deletion;
- repository deletion;
- provider-setting changes;
- campaign-generated policy changes;
- self-modifying authorization;
- self-expanding target scope;
- continuous operation without bounded authorization;
- unlimited retries;
- unlimited concurrency;
- unlimited cost;
- enterprise-scale proof.

Scale validation belongs to Phase 10.

---

## 6. Authorization prerequisites

The active Phase 9 authorization must identify applicable:

- tenant;
- campaign type;
- campaign purpose;
- target-universe type;
- repository scope;
- service scope;
- contract scope;
- environment scope;
- provider scope;
- allowed capability IDs;
- allowed operation types;
- external metadata operations;
- source-read operations;
- dependency-installation operations;
- analysis operations;
- runtime-read operations;
- database operations;
- migration operations;
- remediation-preparation operations;
- remediation operations;
- publication-request operations;
- publication operations;
- infrastructure operations;
- destructive operations;
- credential capabilities;
- network destinations;
- concurrency limits;
- rate limits;
- cost limits;
- storage limits;
- retention;
- campaign start boundary;
- campaign completion or expiration boundary;
- required tests;
- stop conditions;
- human authorizer.

A campaign must not infer permissions from its title, description, target list,
or requested capability.

Missing permissions default to denial.

---

## 7. Required phase outputs

Phase 9 should produce applicable:

- campaign model;
- campaign authorization binding;
- campaign target-set model;
- workflow definitions;
- work-item model;
- job queue;
- leasing model;
- retry model;
- idempotency model;
- capability-dispatch registry;
- policy-decision records;
- concurrency controls;
- rate-limit controls;
- resource budgets;
- cost budgets;
- review queues;
- remediation request queues;
- publication request queues;
- campaign coverage aggregation;
- campaign status summaries;
- security incident controls;
- additive database migrations;
- audit events;
- phase test manifest;
- capability-matrix updates;
- security-control updates;
- phase-completion report;
- updated execution state.

---

## 8. Capability identifiers

Phase 9 should define or update capability identifiers such as:

```text
campaign.create.v1
campaign.scope.resolve.v1
campaign.authorize.v1
campaign.pause.v1
campaign.resume.v1
campaign.cancel.v1
campaign.complete.v1
control-plane.capability-dispatch.v1
control-plane.policy-evaluate.v1
queue.tenant-scoped.v1
queue.job-lease.v1
queue.job-retry.v1
queue.job-deduplicate.v1
workflow.state-machine.v1
workflow.evidence-refresh.v1
workflow.qualification.v1
workflow.analysis.v1
workflow.human-review.v1
workflow.remediation-request.v1
workflow.publication-request.v1
budget.resource-enforce.v1
budget.cost-enforce.v1
coverage.campaign.aggregate.v1
report.campaign.status.v1
```

Every capability identifier must remain narrow, stable, versioned, and
testable.

---

## 9. Trusted control-plane boundary

The control plane is trusted orchestration code.

It may:

- validate authorization;
- evaluate policy;
- create bounded work items;
- select approved capability implementations;
- allocate isolated workers;
- verify structured results;
- update trusted projections;
- route findings for human review;
- request trusted publication.

It must not:

- execute repository code directly;
- execute build tools directly;
- import executable repository configuration;
- run analyzers in the controller process;
- expose trusted credentials to workers;
- bypass the publisher;
- infer human approval;
- widen campaign scope;
- alter governance automatically.

Repository-controlled execution remains inside untrusted runners.

---

## 10. Campaign identity

A campaign identity should bind:

- campaign ID;
- tenant;
- campaign type;
- campaign purpose;
- authorization ID;
- creator;
- creation time;
- target-universe identity;
- capability set;
- policy version;
- workflow version;
- budget profile;
- status;
- campaign digest.

Campaign names and descriptions are display metadata only.

They must not serve as authorization or identity.

---

## 11. Campaign types

Potential campaign types include:

- repository qualification;
- evidence refresh;
- language analysis;
- cross-repository consumer analysis;
- contract analysis;
- runtime evidence refresh;
- finding revalidation;
- human-review preparation;
- remediation-candidate preparation;
- verification-only;
- publication-request preparation.

Each campaign type must define:

- supported targets;
- allowed operations;
- required inputs;
- workflow states;
- required coverage;
- permitted outputs;
- prohibited side effects;
- completion semantics.

---

## 12. Campaign scope

Campaign scope should bind applicable:

- repository universe;
- service universe;
- contract universe;
- environment universe;
- explicit target inclusions;
- explicit exclusions;
- prohibited targets;
- source revisions;
- capability versions;
- time boundaries;
- environment boundaries;
- operation boundaries;
- scope digest.

A campaign must never add a target because repository content requests it.

---

## 13. Scope resolution

Scope resolution should produce:

- requested targets;
- authorized targets;
- denied targets;
- prohibited targets;
- inaccessible targets;
- unsupported targets;
- ambiguous targets;
- stale targets;
- resolution evidence;
- resolution status;
- target-set digest.

Only authorized targets may produce executable work items.

Denied or prohibited targets must remain visible in campaign reporting.

---

## 14. Scope immutability

A campaign's authorized target set should be immutable after activation unless a
new authorization explicitly permits a scope revision.

A scope revision should create:

- a new scope version;
- a new scope digest;
- an authorization link;
- a change reason;
- added targets;
- removed targets;
- affected work items;
- staleness decisions;
- audit events.

A worker result must bind to the scope version under which it was created.

---

## 15. Campaign statuses

Campaign statuses should include:

- `draft`;
- `awaiting_authorization`;
- `authorized`;
- `queued`;
- `running`;
- `paused`;
- `blocked`;
- `cancelling`;
- `cancelled`;
- `completed`;
- `completed_with_failures`;
- `failed`;
- `expired`;
- `revoked`;
- `stale`;
- `security_stopped`.

Status transitions must follow a versioned deterministic state machine.

---

## 16. Campaign state transitions

Every campaign transition should validate:

- current state;
- requested transition;
- actor;
- authorization;
- policy;
- unresolved security incidents;
- active leases;
- pending external operations;
- cleanup state;
- transition reason.

Invalid transitions must be rejected.

A completed, cancelled, expired, or revoked campaign must not resume without a
new authorized campaign identity.

---

## 17. Work-item identity

A work item should bind:

- work-item ID;
- tenant;
- campaign ID;
- target identity;
- target revision;
- capability ID;
- capability version;
- operation type;
- required inputs;
- policy digest;
- authorization digest;
- scope digest;
- dependency identities;
- idempotency key;
- priority;
- state;
- creation time.

Two work items with different target revisions must remain distinct.

---

## 18. Work-item states

Work-item states should include:

- `planned`;
- `policy_pending`;
- `authorized`;
- `queued`;
- `leased`;
- `running`;
- `succeeded`;
- `succeeded_with_limitations`;
- `blocked`;
- `failed`;
- `retry_pending`;
- `cancel_pending`;
- `cancelled`;
- `expired`;
- `stale`;
- `security_stopped`;
- `superseded`.

A successful process exit does not automatically produce `succeeded`.

Structured result validation must complete first.

---

## 19. Work-item dependencies

Work items may depend on:

- repository inventory;
- source acquisition;
- qualification;
- package graph;
- semantic index;
- coverage record;
- contract inventory;
- runtime evidence;
- human disposition;
- remediation authorization;
- verification results.

Dependency edges must identify:

- prerequisite work item;
- required result type;
- required freshness;
- failure behavior;
- invalidation behavior.

A failed prerequisite must not become an empty successful input.

---

## 20. Deterministic workflow definitions

Every workflow should define:

- workflow ID;
- workflow version;
- supported campaign type;
- states;
- transitions;
- prerequisites;
- capability dispatches;
- expected structured outputs;
- retry classes;
- terminal states;
- cleanup requirements;
- audit events;
- human decision points.

Workflow definitions are trusted governance-controlled code.

Repository content must not define or modify them.

---

## 21. Capability dispatch

The control plane should dispatch only registered capabilities.

A dispatch decision should validate:

- capability ID;
- capability version;
- campaign authorization;
- target profile;
- repository-access policy;
- prohibited-target policy;
- runner profile;
- credential capability;
- network profile;
- resource budget;
- required tests;
- current capability status.

An experimental or blocked capability must not be dispatched as functional.

---

## 22. Policy evaluation

Policy must be evaluated:

- when a campaign is created;
- when scope is resolved;
- before a work item is queued;
- before a job is leased;
- before credentials are issued;
- before an external read;
- before remediation;
- before publication;
- before retry;
- after authorization changes;
- after policy changes;
- after target identity changes.

Cached policy decisions require explicit freshness and invalidation rules.

---

## 23. Policy decision record

A policy decision should bind:

- tenant;
- campaign;
- work item;
- target;
- operation;
- authorization;
- policy versions;
- prohibited-target result;
- credential capability;
- network profile;
- decision;
- reason;
- decision time;
- decision digest.

Policy denial must remain distinguishable from technical failure.

---

## 24. Tenant-scoped queues

Every queue must be tenant-scoped.

The queue design must prevent one tenant from:

- reading another tenant's work;
- leasing another tenant's work;
- changing another tenant's priority;
- observing another tenant's target identities;
- accessing another tenant's results;
- consuming another tenant's budgets;
- triggering another tenant's retries.

Shared queue infrastructure must preserve logical and cryptographic isolation
where required.

---

## 25. Queue types

Potential queue types include:

- metadata inventory;
- source acquisition;
- qualification;
- analysis;
- evidence normalization;
- coverage aggregation;
- human review;
- remediation preparation;
- verification;
- publication request;
- cleanup;
- incident response.

A publication request must not share an execution path that gives untrusted
workers publisher credentials.

---

## 26. Job leasing

A lease should bind:

- job ID;
- work-item ID;
- tenant;
- worker identity;
- runner profile;
- lease start;
- lease expiration;
- heartbeat policy;
- attempt number;
- capability version;
- authorization digest;
- policy digest.

Only one active valid lease should own a non-parallelizable work item.

Expired workers must not commit results without lease revalidation.

---

## 27. Lease expiration

When a lease expires, the control plane should determine whether the job:

- never started;
- is still running;
- completed but failed to report;
- produced partial external state;
- requires cleanup;
- may be retried;
- must be reconciled manually;
- must remain blocked.

A lease timeout must not automatically trigger duplicate publication or
remediation.

---

## 28. Worker identity

A worker identity should bind:

- tenant scope;
- worker pool;
- runner image;
- runner version;
- capability set;
- security profile;
- start time;
- health state;
- credential capability;
- current lease.

Workers must not claim unsupported capabilities dynamically.

Repository content must not register a worker or capability.

---

## 29. Heartbeats

Heartbeats should report bounded operational state such as:

- lease identity;
- current stage;
- elapsed time;
- resource usage;
- output size;
- cancellation acknowledgement;
- cleanup state.

Heartbeats must not contain:

- secret values;
- full environment dumps;
- unbounded logs;
- repository instructions;
- raw customer data.

A missing heartbeat must not be interpreted as safe job completion.

---

## 30. Idempotency

Every externally meaningful operation must have an idempotency identity.

Applicable operations include:

- repository inventory;
- source acquisition;
- index generation;
- finding creation;
- disposition recording;
- remediation attempt creation;
- branch creation;
- draft pull-request creation;
- cleanup request.

The idempotency key should bind the exact target, operation, authorization, and
input state.

---

## 31. Deduplication

Deduplication should prevent unnecessary duplicate work while preserving
distinct identities.

Work must not be deduplicated when any material input differs, including:

- tenant;
- repository;
- source commit;
- package or module;
- capability version;
- configuration digest;
- evidence inputs;
- policy version;
- authorization;
- target universe;
- environment;
- observation window.

Display-name equality is insufficient.

---

## 32. Retry classifications

Failures should be classified as:

- transient;
- rate-limited;
- credential-refreshable;
- resource-limited;
- timeout;
- deterministic input failure;
- unsupported;
- policy-denied;
- authorization-expired;
- security incident;
- external-state-unknown;
- cleanup-required;
- non-retryable.

Retry behavior must depend on the failure class.

---

## 33. Retry policy

A retry policy should define:

- maximum attempts;
- backoff;
- jitter;
- retry window;
- capability-specific rules;
- rate-limit handling;
- authorization revalidation;
- policy revalidation;
- target-freshness revalidation;
- external-state reconciliation;
- cleanup prerequisites.

Retries must never bypass a changed authorization or policy decision.

---

## 34. Retry safety

A job may be retried only when:

- its operation is idempotent;
- or external state has been reconciled;
- authorization remains current;
- policy remains current;
- target identity remains current;
- required cleanup completed;
- no security incident remains unresolved.

Unknown external publication state must block automatic retry.

---

## 35. Failure isolation

One target failure must not corrupt unrelated target state.

Failure isolation should preserve:

- target-specific status;
- work-item result;
- logs and artifacts;
- coverage impact;
- retry decision;
- cleanup state;
- campaign aggregate impact.

One repository failure must not become a campaign-wide claim of absence.

---

## 36. Concurrency controls

Concurrency limits should exist at applicable levels:

- global system;
- tenant;
- campaign;
- provider;
- repository;
- environment;
- registry;
- worker pool;
- capability;
- external system.

Concurrency must account for:

- provider rate limits;
- repository lock contention;
- database capacity;
- runner capacity;
- cost;
- security;
- target-specific serialization.

---

## 37. Repository serialization

Some operations should be serialized per repository and revision, including
applicable:

- remediation;
- changed-file validation;
- branch creation;
- draft pull-request publication;
- cleanup of publication state.

Independent read-only analyses may run concurrently when the profile permits.

Two remediation attempts must not modify the same authorized source state
concurrently.

---

## 38. Provider rate limits

The control plane should coordinate provider limits across campaigns.

It should record:

- provider;
- credential capability;
- operation type;
- current allowance;
- reset time;
- request cost;
- campaign consumption;
- tenant consumption;
- retry time;
- affected work items.

Provider rate limiting must produce delayed or partial status rather than false
completion.

---

## 39. Resource budgets

A resource budget may define:

- CPU time;
- memory;
- disk;
- process count;
- worker count;
- database writes;
- artifact storage;
- network transfer;
- output size;
- execution duration.

Budgets should exist at:

- job level;
- campaign level;
- tenant level;
- system level.

Exceeding a hard budget must stop further work safely.

---

## 40. Cost budgets

A campaign may define cost boundaries for applicable:

- cloud runners;
- provider API use;
- telemetry queries;
- test environments;
- artifact storage;
- external services;
- model usage;
- package downloads;
- database growth.

The control plane must not create paid resources or exceed authorized cost
boundaries silently.

Estimated and actual cost should remain distinct.

---

## 41. Priority

Priority may consider trusted factors such as:

- explicit operator priority;
- security impact;
- campaign deadline;
- repository criticality;
- cost;
- freshness;
- blocked dependent work;
- human-review readiness.

Repository content must not set trusted priority.

Priority must not bypass authorization, fairness, or safety controls.

---

## 42. Fairness

Queue scheduling should prevent one campaign or tenant from monopolizing shared
capacity.

Fairness controls may include:

- per-tenant concurrency limits;
- weighted fair queues;
- aging;
- provider-specific quotas;
- reserved capacity;
- bounded priority escalation.

Fairness must not expose one tenant's workload metadata to another tenant.

---

## 43. Campaign pause

Pausing a campaign should:

- stop creating new executable jobs;
- prevent new leases where appropriate;
- preserve completed results;
- request safe interruption of interruptible jobs;
- allow mandatory cleanup;
- preserve external-state reconciliation;
- record the actor and reason.

Pause must not revoke existing external side effects automatically.

---

## 44. Campaign resume

Resume should require:

- campaign remains authorized;
- authorization has not expired;
- policy remains valid;
- target scope remains current;
- security incidents are resolved;
- stale prerequisites are refreshed;
- external state is reconciled;
- budgets permit continuation.

A cancelled, completed, expired, or revoked campaign must not resume under the
same identity.

---

## 45. Campaign cancellation

Cancellation should:

- stop new work;
- revoke unissued capability credentials;
- request cancellation of active jobs;
- preserve mandatory cleanup;
- prevent remediation and publication not already committed;
- reconcile external state;
- preserve audit history;
- produce a truthful terminal status.

Cancellation must not delete evidence or audit history.

---

## 46. Emergency stop

The control plane should support an emergency stop for conditions such as:

- suspected credential exposure;
- tenant-isolation failure;
- excluded repository target operation;
- unexpected production access;
- publisher boundary violation;
- uncontrolled cost growth;
- widespread runner escape;
- audit integrity failure;
- unknown destructive side effect.

Emergency stop should prevent new work globally or within the affected scope.

Mandatory containment and cleanup may continue through separately trusted
paths.

---

## 47. Security incident state

A security incident should bind:

- incident ID;
- tenant or global scope;
- detection time;
- affected campaigns;
- affected jobs;
- affected credentials;
- affected external systems;
- containment actions;
- credential revocation state;
- cleanup state;
- investigation state;
- resolution authority.

Campaigns affected by an unresolved incident should become
`security_stopped`.

---

## 48. Evidence-refresh campaigns

An evidence-refresh campaign may update:

- source inventory;
- package graphs;
- semantic indexes;
- contract inventories;
- repository universes;
- consumer sets;
- runtime evidence;
- coverage records.

It must not automatically:

- change human disposition;
- authorize remediation;
- publish source;
- delete stale evidence.

Older evidence should remain historically interpretable.

---

## 49. Finding revalidation

A finding-revalidation workflow should determine whether a finding is:

- current;
- stale;
- superseded;
- live;
- still a candidate;
- inconclusive;
- unsupported;
- failed;
- access-blocked.

Revalidation must use current source and required evidence identities.

A stale finding must not remain remediation-eligible.

---

## 50. Human-review queue

A human-review queue should contain only bounded review records.

A review record should identify:

- finding;
- target identity;
- source revision;
- classification;
- explanation;
- evidence digest;
- coverage digest;
- limitations;
- required human decision;
- current authorization status;
- staleness status.

The queue must not present an inconclusive finding as confirmed dead.

---

## 51. Human-review decisions

Supported decisions may include:

- `confirmed_dead`;
- `confirmed_live`;
- `needs_investigation`;
- `defer`;
- `reject`;
- `supersede`.

Every decision should bind:

- human actor;
- finding identity;
- source revision;
- evidence digest;
- coverage digest;
- decision time;
- rationale;
- expiration or staleness behavior.

A review decision does not authorize remediation.

---

## 52. Remediation-request workflow

A remediation request should be created only after:

- a current eligible finding exists;
- human disposition is current;
- required coverage is complete;
- the target shape is supported;
- required capability is functional;
- no dominant liveness evidence exists.

The request should identify the exact authorization still required.

It must not create that authorization itself.

---

## 53. Remediation campaign boundaries

A campaign may coordinate several independently authorized remediation attempts,
but every attempt must retain:

- finding-specific disposition;
- finding-specific remediation authorization;
- exact source revision;
- exact transformation;
- exact changed-file scope;
- exact required gates;
- exact publication permission.

One broad campaign approval must not substitute for finding-specific controls
unless the authorization protocol explicitly defines a reviewed bounded batch
with equivalent exactness.

---

## 54. Batch authorization

A future batch authorization may be supported only when it identifies:

- exact target set;
- exact source revisions;
- exact finding IDs;
- exact transformation profile;
- exact changed-file constraints;
- exact verification requirements;
- exact expiration;
- exact maximum operation count;
- exact publication behavior.

An open-ended authorization such as `remediate all dead code` is invalid.

---

## 55. Publication-request workflow

A publication request should bind:

- target repository;
- base commit;
- finding;
- disposition;
- remediation authorization;
- patch hash;
- changed files;
- verification results;
- publisher capability;
- branch policy;
- draft-only requirement;
- idempotency identity.

The control plane may request publication.

Only the trusted publisher may perform it.

---

## 56. Publisher isolation

The trusted publisher must remain separate from:

- campaign workers;
- repository analyzers;
- build runners;
- test runners;
- infrastructure collectors;
- runtime collectors;
- workflow definitions supplied by repository content.

Campaign orchestration must not cause publisher credentials to enter an
untrusted runner.

---

## 57. Campaign-level coverage

Campaign coverage should aggregate target-level coverage without hiding
failures.

It should identify:

- targets requested;
- targets authorized;
- targets prohibited;
- targets inaccessible;
- targets unsupported;
- targets stale;
- targets completed;
- targets partially completed;
- targets failed;
- coverage dimensions;
- unresolved scopes;
- aggregate limitations.

A campaign completion percentage is not sufficient by itself.

---

## 58. Coverage aggregation rules

Campaign aggregation must preserve:

- target-specific status;
- capability-specific status;
- failure categories;
- access failures;
- policy denials;
- unsupported profiles;
- stale evidence;
- incomplete consumer scope;
- incomplete runtime scope;
- unavailable gates.

A failed target must not be represented as having no findings.

---

## 59. Campaign coverage digest

A deterministic campaign coverage digest should bind:

- campaign identity;
- scope version;
- authorization digest;
- policy digest;
- target identities;
- target revisions;
- capability versions;
- target coverage digests;
- failed targets;
- inaccessible targets;
- prohibited targets;
- unsupported targets;
- aggregate statuses.

Changing any material target or input must invalidate the digest.

---

## 60. Campaign completion

A campaign may complete as:

- `completed`;
- `completed_with_failures`;
- `blocked`;
- `failed`;
- `cancelled`;
- `expired`;
- `revoked`;
- `security_stopped`.

`Completed` requires every required target and workflow to satisfy the active
completion policy.

A campaign with required failed targets must not be reported simply as
completed.

---

## 61. Completion policy

The completion policy should define:

- required target statuses;
- allowed partial statuses;
- allowed exclusions;
- prohibited-target treatment;
- access-denied treatment;
- retry exhaustion behavior;
- human-review requirements;
- remediation requirements;
- publication requirements;
- cleanup requirements;
- report requirements.

The policy must be explicit and versioned.

---

## 62. Campaign reporting

Campaign reports should include:

- campaign identity;
- authorization identity;
- purpose;
- scope;
- target-universe identity;
- capabilities used;
- workflow versions;
- targets by status;
- findings by classification;
- evidence freshness;
- coverage limitations;
- human-review state;
- remediation requests;
- remediation results;
- publication requests;
- publication results;
- failures;
- retries;
- rate limits;
- resource use;
- cost;
- security events;
- cleanup state;
- next safe action.

Reports must not turn partial campaign success into a universal capability
claim.

---

## 63. Bounded reporting

Campaign reports should avoid exposing:

- full private source;
- secret values;
- full environment dumps;
- raw telemetry;
- unrestricted logs;
- customer data;
- unnecessary contract contents;
- credentials;
- provider tokens;
- unbounded diagnostics.

Reports should link to bounded internal artifacts by identity rather than
embedding sensitive content.

---

## 64. Notifications

Notifications may report trusted control-plane events such as:

- campaign awaiting authorization;
- campaign blocked;
- human review required;
- campaign paused;
- campaign completed;
- security stop;
- cost threshold reached;
- publication request awaiting approval.

Notification delivery must not:

- authorize an operation;
- contain secret values;
- expose another tenant's data;
- trigger remediation automatically;
- trigger publication automatically.

---

## 65. Database evolution

Phase 9 may persist concepts such as:

- campaigns;
- campaign scope versions;
- target sets;
- workflows;
- workflow versions;
- work items;
- work-item dependencies;
- queue records;
- leases;
- heartbeats;
- retry attempts;
- policy decisions;
- budgets;
- cost records;
- human-review queues;
- remediation requests;
- publication requests;
- campaign coverage;
- campaign reports;
- security incidents.

Persistence changes must use additive ordered migrations.

Historical findings, dispositions, authorizations, and audit events must remain
interpretable.

---

## 66. Durable state

Control-plane state must survive:

- controller restart;
- worker restart;
- database reconnect;
- queue reconnect;
- provider outage;
- partial job completion;
- campaign pause;
- campaign cancellation;
- retry.

Durability must not permit stale leases or stale authorization to continue
silently.

---

## 67. Projection rebuilding

Derived campaign projections should be rebuildable from authoritative records
where practical.

Rebuilding should preserve:

- append-only events;
- campaign identity;
- work-item history;
- policy decisions;
- authorization links;
- retries;
- human decisions;
- external-operation state;
- terminal statuses.

A projection rebuild must not re-execute work.

---

## 68. Audit requirements

Phase 9 should produce audit events for applicable:

- campaign drafted;
- campaign authorization requested;
- campaign authorized;
- campaign rejected;
- scope resolved;
- target allowed;
- target denied;
- prohibited target excluded;
- campaign queued;
- campaign started;
- campaign paused;
- campaign resumed;
- campaign cancelled;
- campaign expired;
- campaign revoked;
- work item created;
- work item deduplicated;
- work item queued;
- job leased;
- heartbeat received;
- lease expired;
- retry scheduled;
- retry rejected;
- budget threshold reached;
- budget exceeded;
- policy denied;
- human review requested;
- human disposition recorded;
- remediation requested;
- remediation authorized;
- publication requested;
- campaign completed;
- security stop activated;
- cleanup completed;
- cleanup failed.

Audit events must remain tenant-scoped, attributable, tamper-evident, and
secret-free.

---

## 69. Audit integrity failure

If audit integrity cannot be established:

- stop new campaign work;
- stop new remediation work;
- stop new publication work;
- preserve available state;
- revoke or suspend affected credentials where appropriate;
- record the incident through an independent trusted path if available;
- require human review before resuming.

A campaign must not continue when authoritative execution history is unreliable.

---

## 70. Tenant isolation

Campaign orchestration must enforce tenant isolation across:

- campaign definitions;
- target sets;
- queues;
- leases;
- workers;
- credentials;
- source snapshots;
- evidence;
- findings;
- review queues;
- authorizations;
- budgets;
- reports;
- audit events;
- patches;
- publication requests.

One tenant's unused capacity must not grant access to its data or credentials.

---

## 71. Role-based access

Trusted control-plane roles may include:

- campaign creator;
- campaign authorizer;
- campaign operator;
- reviewer;
- remediation authorizer;
- publication authorizer;
- security operator;
- auditor;
- read-only observer.

Role definitions must remain separate from repository content.

A user may hold several roles, but required separation of decisions must remain
enforced where policy requires it.

---

## 72. Separation of duties

The control plane should support separation between:

- campaign creation;
- campaign authorization;
- finding review;
- remediation authorization;
- publication authorization;
- security incident resolution;
- audit review.

One broad administrator role should not automatically bypass finding-specific
or publication-specific controls.

Any permitted role combination must be explicit and auditable.

---

## 73. Credential issuance

Credentials should be issued only after:

- campaign authorization validation;
- work-item policy validation;
- target identity validation;
- lease validation;
- runner-profile validation;
- operation validation;
- network-profile validation.

Credential issuance should be:

- capability-scoped;
- target-scoped;
- time-bounded;
- operation-bounded;
- revocable;
- auditable.

---

## 74. Credential revocation

Credential revocation should occur when applicable:

- lease expires;
- job completes;
- job is cancelled;
- campaign pauses;
- campaign is revoked;
- authorization expires;
- policy changes;
- security incident occurs;
- worker identity becomes unhealthy;
- target scope changes.

Revocation failure must block continued sensitive work.

---

## 75. Prompt-injection resistance

Instructions found in:

- source code;
- documentation;
- campaign target metadata;
- repository descriptions;
- provider metadata;
- job output;
- analyzer output;
- logs;
- traces;
- contracts;
- infrastructure labels;
- error messages;
- generated reports;

must remain untrusted data.

They must not:

- create campaigns;
- change campaign scope;
- change priority authoritatively;
- authorize targets;
- change budgets;
- modify workflow definitions;
- request credentials;
- mark failed jobs successful;
- create human disposition;
- authorize remediation;
- authorize publication;
- disable audit;
- resume paused campaigns;
- modify governance.

---

## 76. Secret handling

Campaign orchestration may expose secrets through:

- provider credentials;
- registry credentials;
- runner environments;
- queue payloads;
- job output;
- external-operation records;
- telemetry metadata;
- error reports;
- publication requests.

DCAv2 must:

- store credential capability rather than value;
- avoid secrets in queue payloads;
- avoid secrets in idempotency keys;
- avoid full environment dumps;
- redact credential-bearing URLs;
- bound output;
- scan exported artifacts;
- remove temporary credentials;
- prevent credentials from crossing tenant or capability boundaries.

---

## 77. Queue payload safety

Queue payloads should contain identities and bounded structured parameters.

They must not contain:

- raw credentials;
- full repository archives;
- unrestricted environment variables;
- unbounded source content;
- executable shell strings;
- human-readable instructions that workers interpret as authority;
- publisher secrets;
- controller database credentials.

Workers should resolve trusted configuration from validated internal records.

---

## 78. Structured commands

The control plane must dispatch structured command definitions rather than
repository-provided shell text.

Every dispatched command should bind:

- command ID;
- command version;
- capability ID;
- runner profile;
- working directory;
- arguments;
- environment allowlist;
- network profile;
- resource limits;
- timeout;
- output limits;
- expected artifacts;
- cleanup.

Campaign metadata must not become shell input directly.

---

## 79. Worker result validation

A worker result should be accepted only when:

- lease is valid;
- worker identity is valid;
- result schema is supported;
- target identity matches;
- source revision matches;
- capability version matches;
- authorization digest matches;
- policy digest matches;
- artifact digests validate;
- output limits were respected;
- cleanup status is known;
- no security incident invalidates the result.

Malformed or mismatched results must be rejected.

---

## 80. External-state reconciliation

Operations that may create external state require reconciliation.

Applicable state includes:

- provider branches;
- draft pull requests;
- test environments;
- temporary registries;
- temporary artifacts;
- provider comments;
- external locks.

Reconciliation should identify whether the state:

- does not exist;
- exists as expected;
- exists partially;
- exists with conflicting identity;
- is inaccessible;
- requires cleanup;
- requires human intervention.

---

## 81. Cleanup workflows

Cleanup may include:

- worker termination;
- process-tree termination;
- temporary workspace deletion;
- temporary credential removal;
- test-environment deletion;
- temporary artifact deletion;
- lease release;
- external-state reconciliation.

Cleanup must not delete:

- audit history;
- required evidence;
- human decisions;
- authorization records;
- publication history;
- retained artifacts required by policy.

---

## 82. Phase 9 test manifest

Phase 9 should receive a dedicated test manifest such as:

`codex/tests/phase-9-tests.yaml`

If introduced, the file must conform to:

`codex/tests/phase-test-manifest.schema.json`

The manifest must identify concrete required and conditional test IDs.

The phrase “run relevant tests” is insufficient.

---

## 83. Minimum campaign tests

Campaign tests should cover:

- draft campaign;
- authorized campaign;
- unauthorized campaign;
- expired authorization;
- revoked authorization;
- explicit target set;
- prohibited target;
- inaccessible target;
- unsupported target;
- scope revision;
- immutable scope version;
- campaign pause;
- campaign resume;
- campaign cancel;
- campaign completion;
- completion with failures;
- deterministic campaign digest.

---

## 84. Minimum workflow tests

Workflow tests should cover:

- valid state transitions;
- invalid transition;
- missing prerequisite;
- failed prerequisite;
- stale prerequisite;
- human decision point;
- remediation authorization point;
- publication authorization point;
- cancellation during execution;
- security stop;
- workflow version change;
- malformed workflow result;
- repository content attempting to modify workflow.

---

## 85. Minimum queue tests

Queue tests should cover:

- tenant-scoped enqueue;
- tenant-scoped lease;
- cross-tenant lease rejection;
- duplicate work-item detection;
- distinct source revisions;
- distinct capability versions;
- priority ordering;
- fairness;
- queue pause;
- queue recovery;
- database reconnect;
- worker restart;
- bounded payload validation;
- secret value rejected from payload.

---

## 86. Minimum lease tests

Lease tests should cover:

- valid lease;
- duplicate lease attempt;
- expired lease;
- heartbeat renewal;
- missing heartbeat;
- late result after expiration;
- worker crash;
- worker replacement;
- cancellation during lease;
- authorization revoked during lease;
- policy changed during lease;
- cleanup required after lease loss.

---

## 87. Minimum retry tests

Retry tests should cover:

- transient provider failure;
- rate limit;
- timeout;
- resource exhaustion;
- deterministic analyzer failure;
- policy denial;
- authorization expiration;
- security incident;
- unknown external publication state;
- cleanup failure;
- maximum attempts;
- backoff;
- target changed before retry;
- successful idempotent retry.

---

## 88. Minimum idempotency tests

Idempotency tests should cover:

- duplicate inventory request;
- duplicate source acquisition;
- duplicate finding creation;
- duplicate remediation attempt;
- duplicate publication request;
- duplicate draft pull-request request;
- changed patch hash;
- changed base commit;
- changed authorization;
- provider partial state;
- repeated cleanup;
- idempotency key collision attempt.

---

## 89. Minimum budget tests

Budget tests should cover:

- job CPU limit;
- job memory limit;
- job disk limit;
- job output limit;
- campaign worker limit;
- tenant concurrency limit;
- provider request limit;
- storage limit;
- estimated cost threshold;
- hard cost boundary;
- test-environment lifetime;
- budget increase requiring authorization;
- budget exhaustion during campaign.

---

## 90. Minimum fairness tests

Fairness tests should cover:

- two campaigns in one tenant;
- two tenants;
- high-priority work;
- aged low-priority work;
- provider-specific bottleneck;
- one campaign with many targets;
- reserved capacity;
- starvation prevention;
- campaign pause releasing capacity;
- cross-tenant metadata isolation.

---

## 91. Minimum policy tests

Policy tests should cover:

- allowed target read;
- denied target read;
- repository excluded for the requested target role;
- allowed analysis;
- denied remediation;
- allowed remediation with exact authorization;
- denied publication;
- allowed draft publication;
- default-branch rejection;
- expired policy cache;
- policy change invalidation;
- authorization change invalidation;
- repository content attempting to alter policy.

---

## 92. Minimum review-queue tests

Review tests should cover:

- eligible finding queued;
- inconclusive finding labeled correctly;
- stale finding rejected;
- live finding excluded from dead-code confirmation;
- `confirmed_dead`;
- `confirmed_live`;
- `needs_investigation`;
- decision revocation;
- decision supersession;
- wrong evidence digest;
- wrong coverage digest;
- cross-tenant review rejection;
- disposition does not create remediation authority.

---

## 93. Minimum remediation-orchestration tests

Remediation tests should cover:

- finding-specific authorization;
- missing authorization;
- broad invalid authorization;
- exact target revision;
- stale finding;
- new liveness evidence;
- target changed before execution;
- concurrent remediation rejection;
- baseline failure;
- post-change failure;
- changed-file allowlist failure;
- deterministic patch;
- remediation completion without publication;
- remediation cancellation.

---

## 94. Minimum publication-orchestration tests

Publication tests should cover:

- exact publication request;
- wrong patch hash;
- wrong base commit;
- missing verification gate;
- expired remediation authorization;
- missing publication authorization;
- repository excluded for the requested target role;
- default-branch rejection;
- draft pull-request creation;
- duplicate publication request;
- provider partial state;
- unknown external state blocks retry;
- publisher credential absent from worker;
- campaign cancellation before publication.

---

## 95. Minimum pause and cancellation tests

Pause and cancellation tests should cover:

- pause before lease;
- pause during analysis;
- pause during cleanup;
- pause before publication;
- resume after freshness validation;
- resume rejected after expiration;
- cancel queued work;
- cancel running work;
- cancellation acknowledgement;
- cleanup after cancellation;
- external state reconciliation;
- cancelled campaign cannot resume.

---

## 96. Minimum security-stop tests

Security-stop tests should cover:

- suspected credential exposure;
- excluded repository target-operation attempt;
- cross-tenant access attempt;
- publisher credential in runner;
- unexpected production access;
- audit integrity failure;
- uncontrolled cost increase;
- runner isolation failure;
- incident-scoped stop;
- global stop;
- credential revocation;
- cleanup continuation;
- human-controlled recovery.

---

## 97. Minimum migration tests

Migration tests should cover:

- fresh database;
- upgrade from Phase 8;
- existing findings;
- existing authorizations;
- campaigns;
- scope versions;
- work items;
- dependencies;
- leases;
- retries;
- budgets;
- human-review queues;
- remediation requests;
- publication requests;
- campaign coverage;
- security incidents;
- multiple tenants;
- failed migration;
- retry;
- projection rebuild;
- audit preservation.

Existing migrations must not be rewritten.

---

## 98. Minimum security tests

Security tests should cover:

- one tenant cannot view another tenant's campaign;
- one tenant cannot lease another tenant's job;
- queue payload contains no credentials;
- runner cannot access publisher credentials;
- worker cannot access controller database credentials;
- repository content cannot broaden campaign scope;
- repository content cannot change priority authoritatively;
- repository content cannot modify workflows;
- denied targets never execute;
- excluded repository target operations never begin;
- production operations remain denied by default;
- output is bounded;
- credential revocation works;
- audit events remain attributable;
- security stop prevents new work.

---

## 99. Fixture strategy

Phase 9 should use fixtures representing:

- one small qualification campaign;
- one evidence-refresh campaign;
- one multi-repository analysis campaign;
- one human-review queue;
- one remediation request;
- one draft publication request;
- one inaccessible repository;
- one repository with an excluded target role;
- one unsupported repository;
- one transient failure;
- one deterministic failure;
- one worker crash;
- one stale result;
- one rate-limited provider;
- one budget-exhausted campaign;
- one cross-tenant attack;
- one prompt-injection attempt;
- alternate tenant, campaign, repository, and finding names.

Production behavior must not contain fixture-specific branches.

---

## 100. Scale boundary

Phase 9 establishes bounded functional orchestration.

The phase report must state tested limits such as:

- tenant count;
- active campaign count;
- target count per campaign;
- work-item count;
- queue depth;
- concurrent worker count;
- provider request rate;
- lease rate;
- retry volume;
- artifact volume;
- database growth;
- report size;
- control-plane CPU and memory;
- campaign completion duration;
- estimated and actual cost.

Phase 9 must not claim enterprise-scale validation.

Enterprise-scale validation belongs to Phase 10.

---

## 101. Control-plane acceptance criteria

The control plane may become `functional` only when:

1. Campaign identity is deterministic.
2. Campaign scope is explicit and versioned.
3. Campaign authorization is current and attributable.
4. Scope cannot expand automatically.
5. Workflow definitions are trusted and versioned.
6. Capability dispatch validates current capability status.
7. Policy is evaluated at every required boundary.
8. Queues are tenant-scoped.
9. Leases prevent uncontrolled duplicate ownership.
10. Late results are rejected safely.
11. Retries are failure-class-aware.
12. Idempotency is implemented for external side effects.
13. Concurrency limits are enforced.
14. Rate limits are enforced.
15. Resource and cost budgets are enforced.
16. Pause, resume, cancel, and emergency stop are deterministic.
17. Worker results are validated structurally.
18. External state is reconciled before retry.
19. Tenant isolation passes required tests.
20. Required security, migration, and phase tests pass.

---

## 102. Campaign acceptance criteria

A campaign capability may become `functional` only when:

1. The campaign type is versioned.
2. Required target universes are explicit.
3. Every target receives an access and support status.
4. Prohibited targets are excluded before content access.
5. Required prerequisites are represented as dependencies.
6. Target failures remain visible.
7. Campaign coverage preserves unresolved scope.
8. Human review remains separate from classification.
9. Remediation authorization remains separate from disposition.
10. Publication authorization remains separate from remediation.
11. Campaign reports remain truthful and bounded.
12. Completion policy is explicit.
13. Cancellation preserves audit and mandatory cleanup.
14. Generalization beyond one fixture is demonstrated.
15. Required tests pass.

---

## 103. Remediation-orchestration acceptance criteria

Campaign-based remediation orchestration may become `functional` only when:

1. Every finding is exact and current.
2. Every human disposition is current.
3. Every remediation authorization is current.
4. Every target revision is exact.
5. Every transformation profile is supported.
6. Every changed-file scope is exact.
7. Required baseline gates pass.
8. Required post-change gates pass.
9. Concurrent target modification is prevented.
10. Patch generation is deterministic.
11. Publication remains a separate trusted operation.
12. Retry cannot duplicate external effects.
13. Campaign cancellation prevents new remediation.
14. Required security and phase tests pass.

---

## 104. Publication-orchestration acceptance criteria

Campaign-based publication requests may become `functional` only when:

1. The target repository is authorized.
2. The repository is not prohibited.
3. The exact base commit is current.
4. The exact patch hash is current.
5. The finding and disposition are current.
6. Remediation authorization is current.
7. Publication authorization is current.
8. Required gates are complete.
9. Changed files are authorized.
10. The trusted publisher performs the operation.
11. Default-branch direct push is rejected.
12. Pull requests remain draft-only.
13. Idempotent retry is implemented.
14. Unknown external state blocks automatic retry.
15. Workers never receive publisher credentials.
16. Required tests pass.

---

## 105. Detection-only outcome

Phase 9 may validly complete with orchestration limited to:

- inventory campaigns;
- qualification campaigns;
- analysis campaigns;
- evidence-refresh campaigns;
- coverage campaigns;
- human-review preparation.

Detection-only completion is valid when:

- remediation orchestration remains unavailable;
- publication orchestration remains unavailable;
- unsupported operations are explicit;
- the active authorization and test manifest define detection-only scope.

---

## 106. Partially supported outcome

Phase 9 may remain `partially_supported` when, for example:

- one campaign type is supported but another is not;
- one provider is supported but another is not;
- analysis orchestration works but remediation orchestration does not;
- remediation preparation works but publication requests do not;
- pause and cancellation work but automatic recovery remains limited;
- one cost source is measured while another is estimated;
- one worker pool is supported but another is not;
- one target-universe type is supported but another is not.

The exact unsupported dimensions must remain explicit.

---

## 107. Blocked outcome

Phase 9 must remain blocked when applicable:

- campaign authorization is missing;
- campaign scope is ambiguous;
- scope expansion cannot be prevented;
- tenant isolation fails;
- workflow identity is ambiguous;
- policy decisions are stale or unavailable;
- prohibited-target enforcement fails;
- queue ownership is unsafe;
- lease behavior permits duplicate side effects;
- retry safety cannot be established;
- publisher credentials may reach workers;
- audit integrity fails;
- resource or cost limits cannot be enforced;
- cancellation cannot stop new work;
- external state cannot be reconciled;
- required runner controls fail;
- migration tests fail;
- required tests fail or are unavailable;
- a security incident remains unresolved;
- authorization expires or is revoked.

A blocked result must identify the exact safe next action.

---

## 108. Phase completion criteria

Phase 9 may be reported complete only when all applicable criteria are
satisfied:

1. Campaign identities are deterministic.
2. Campaign types are versioned.
3. Campaign scope is explicit and versioned.
4. Authorization is bound to each campaign.
5. Scope expansion requires new authorization.
6. Target resolution preserves denied and prohibited status.
7. Trusted workflow definitions are implemented.
8. Capability dispatch is policy-governed.
9. Work-item identity is deterministic.
10. Work-item dependencies are implemented.
11. Tenant-scoped queues are implemented.
12. Job leasing is implemented.
13. Late and duplicate results are rejected safely.
14. Retry classification is implemented.
15. Idempotency is implemented for external side effects.
16. Concurrency controls are enforced.
17. Provider rate limits are enforced.
18. Resource budgets are enforced.
19. Cost budgets are enforced where applicable.
20. Priority and fairness controls are implemented.
21. Pause, resume, cancel, and emergency stop are implemented.
22. Evidence refresh preserves historical state.
23. Human review remains separate from remediation.
24. Remediation authorization remains finding-specific.
25. Publication remains trusted and separately authorized.
26. Campaign coverage preserves unresolved targets.
27. Campaign reports are truthful and bounded.
28. Cleanup and external-state reconciliation are implemented.
29. Audit events are complete and attributable.
30. Tenant isolation passes required tests.
31. Required database migrations pass.
32. Required security controls pass.
33. Required Phase 9 tests pass.
34. Triggered conditional tests pass.
35. Capability statuses are updated truthfully.
36. Security-control matrix is updated.
37. Phase report is complete.
38. Execution state is updated.
39. No unresolved blocker contradicts completion.

Detection-only completion is valid when the active authorization and test
manifest define detection-only orchestration scope.

---

## 109. Phase report

The Phase 9 completion report should include:

- authorization identity;
- objective;
- source commit before and after;
- files changed;
- migrations;
- dependencies;
- campaign types;
- workflow versions;
- target-universe types;
- campaign counts;
- target counts;
- work-item counts;
- queue behavior;
- lease behavior;
- retry behavior;
- idempotency behavior;
- policy decisions;
- concurrency limits;
- provider rate limits;
- resource budgets;
- cost budgets;
- priority and fairness behavior;
- human-review behavior;
- remediation orchestration;
- publication orchestration;
- pause and cancellation behavior;
- emergency-stop behavior;
- campaign coverage;
- campaign completion statuses;
- audit behavior;
- security controls;
- tests;
- fixtures;
- measured scale;
- measured or estimated cost;
- capability-status changes;
- limitations;
- blockers;
- cleanup;
- next safe action.

The report must not describe bounded campaign execution as enterprise-scale
autonomous operation.

---

## 110. Execution-state handoff

The Phase 9 handoff should identify:

- phase status;
- authorization status;
- source commit;
- worktree state;
- supported campaign types;
- supported target-universe types;
- supported workflow versions;
- supported worker pools;
- queue status;
- lease status;
- retry status;
- budget status;
- human-review status;
- remediation-orchestration status;
- publication-orchestration status;
- detection-only capabilities;
- unsupported orchestration scope;
- test manifest;
- test results;
- security-control results;
- migrations;
- external operations;
- retained external state;
- cleanup state;
- unresolved incidents;
- next human decision.

The handoff must not authorize Phase 10.

---

## 111. Transition to Phase 10

Phase 10 may be proposed when bounded campaigns can be executed safely and the
remaining question is whether the established capabilities operate correctly
under realistic scale, load, failure, and recovery conditions.

Before Phase 10 begins:

1. Finalize the Phase 9 report.
2. Update execution state.
3. Stop Phase 9 implementation.
4. Present actual campaign and control-plane capability statuses.
5. Record known scale and reliability limits.
6. Prepare a Phase 10 authorization.
7. Obtain explicit human approval.

Phase 10 must not start automatically.

---

## 112. Phase stop conditions

Work must stop when:

- Phase 9 authorization is inactive;
- authorization expires;
- authorization is revoked;
- tenant, provider, target, operation, or campaign scope is exceeded;
- an excluded repository target operation is requested;
- campaign scope cannot be verified;
- target identity cannot be verified;
- policy evaluation is unavailable;
- tenant isolation fails;
- queue ownership becomes ambiguous;
- lease safety cannot be established;
- duplicate external side effects are possible;
- retry safety cannot be established;
- publisher credentials may enter an untrusted runner;
- audit integrity fails;
- resource limits cannot be enforced;
- cost limits cannot be enforced;
- provider rate limits cannot be respected;
- cancellation cannot prevent new work;
- external state becomes unknown;
- cleanup cannot be performed safely;
- a security incident occurs;
- required runner controls fail;
- a destructive migration would be required without permission;
- a required test fails or is unavailable;
- local user work cannot be preserved.

Stopping must be recorded truthfully.

---

## 113. Fail-safe behavior

When campaign identity, scope, authorization, policy, queue ownership, lease
state, retry safety, idempotency, budgets, human review, remediation,
publication, audit, cleanup, or external state cannot be established
confidently:

- do not start new campaign work;
- do not expand target scope;
- do not lease sensitive jobs;
- do not issue credentials;
- do not retry external operations;
- do not mark failed work successful;
- do not hide inaccessible or prohibited targets;
- do not create human disposition automatically;
- do not infer remediation authorization;
- do not infer publication authorization;
- do not send publisher credentials to workers;
- do not publish;
- do not delete audit history;
- do not continue after a security stop;
- preserve available state;
- perform only authorized containment and cleanup;
- return an explicit partial, blocked, failed, stale, cancelled, expired,
  revoked, or security-stopped result;
- identify the exact missing requirement.

Control-plane uncertainty must reduce execution, remediation, publication, and
external-operation authority.

---

## 114. Document integrity

This roadmap file must not be modified during Phase 9 implementation unless
roadmap or governance modification is explicitly authorized.

Changes require:

1. Identification of the Phase 9 planning problem.
2. Review against the roadmap overview.
3. Review against permanent safety invariants.
4. Review of campaign-scope and authorization implications.
5. Review of workflow and policy implications.
6. Review of queue, lease, retry, and idempotency implications.
7. Review of tenant-isolation and credential implications.
8. Review of remediation and publication implications.
9. Review of audit, reporting, and cleanup implications.
10. Review of authorization and testing impact.
11. Updated Phase 9 test manifest where applicable.
12. Updated schemas or capability definitions where applicable.
13. A reviewable governance commit.
14. An ADR when the change alters long-lived campaign, queue, workflow,
    authorization, retry, publisher, or control-plane trust semantics.

This roadmap must not be weakened to make ambiguous scope, stale authorization,
unsafe retries, duplicate external effects, failed tenant isolation, missing
audit history, uncontrolled cost, failed tests, or unauthorized campaign
operations appear acceptable.
