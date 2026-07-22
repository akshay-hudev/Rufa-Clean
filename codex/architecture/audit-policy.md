# Audit Policy

This document defines the architecture and integrity requirements for recording
security-relevant, analysis-relevant, remediation-relevant, and
publication-relevant events in DCAv2.

The audit system must preserve enough information to reconstruct:

- what occurred;
- when it occurred;
- who or what initiated it;
- which authorization applied;
- which repository and source snapshot were involved;
- which evidence and coverage were used;
- which policy versions applied;
- which tests and gates ran;
- which external operations occurred;
- whether cleanup completed;
- whether failures or security incidents occurred.

Audit history is descriptive evidence.

It does not authorize future work, remediation, publication, or destructive
operations.

This document must be applied together with:

- `codex/core/03-safety-invariants.md`;
- `codex/core/05-phase-authorization-protocol.md`;
- `codex/core/08-secret-handling-policy.md`;
- `codex/core/10-reporting-and-state-policy.md`;
- `codex/architecture/evidence-model.md`;
- `codex/architecture/remediation-policy.md`;
- `codex/architecture/trusted-publisher-policy.md`.

---

## 1. Core principles

The DCAv2 audit system must be:

- append-only;
- tamper-evident;
- attributable;
- tenant-scoped;
- time-aware;
- source-bound;
- authorization-aware;
- policy-versioned;
- failure-preserving;
- independently verifiable where practical;
- free of secret values;
- resistant to silent historical rewriting.

DCAv2 must not claim that audit data is tamper-proof.

The system may claim tamper evidence only to the extent demonstrated by its
implemented integrity controls and executed tests.

---

## 2. Audit records are not authority

Audit records describe actions and decisions that occurred.

They must not:

- authorize a phase;
- authorize repository access;
- authorize remediation;
- authorize publication;
- renew expired authorization;
- override the prohibited-repository policy;
- weaken a permanent safety invariant;
- create a human disposition;
- create remediation approval through inference.

A historical event stating that an operation was approved does not prove that a
current operation remains authorized.

Current authorization must always be revalidated independently.

---

## 3. Append-only history

Finalized audit events must not be:

- updated in place;
- deleted;
- reordered;
- silently replaced;
- rewritten to conceal failure;
- rewritten to match newer policy;
- modified after a correction.

Corrections must be represented as new audit events.

A correction event must identify:

- the event being corrected;
- the reason for correction;
- the corrected interpretation;
- the actor making the correction;
- the correction time;
- the applicable authorization.

The original event must remain available.

---

## 4. Audit event categories

The audit model should support event categories including:

- authorization;
- governance;
- repository access;
- source acquisition;
- qualification;
- analysis;
- evidence;
- coverage;
- classification;
- human review;
- remediation;
- verification;
- publication;
- external operation;
- credential capability;
- security control;
- cleanup;
- incident;
- reporting;
- system administration.

Categories are organizational metadata.

They must not replace precise event types.

---

## 5. Required audit event types

Initial event types should include applicable records such as:

### Authorization

- `phase_authorization_recorded`;
- `phase_authorization_validated`;
- `phase_authorization_rejected`;
- `phase_authorization_expired`;
- `phase_authorization_revoked`;
- `remediation_authorization_recorded`;
- `remediation_authorization_validated`;
- `remediation_authorization_rejected`;
- `remediation_authorization_revoked`.

### Governance

- `governance_integrity_recorded`;
- `governance_integrity_verified`;
- `governance_integrity_failed`;
- `governance_change_authorized`;
- `governance_change_applied`.

### Repository access

- `repository_access_requested`;
- `repository_access_allowed`;
- `repository_access_denied`;
- `prohibited_repository_excluded`;
- `repository_identity_validated`;
- `repository_identity_rejected`.

### Source acquisition

- `source_acquisition_started`;
- `source_acquisition_completed`;
- `source_acquisition_failed`;
- `source_snapshot_created`;
- `source_snapshot_verified`;
- `source_snapshot_stale`.

### Analysis

- `analysis_epoch_created`;
- `analysis_started`;
- `analyzer_run_started`;
- `analyzer_run_completed`;
- `analyzer_run_failed`;
- `analyzer_run_timed_out`;
- `analysis_completed`;
- `analysis_failed`.

### Evidence and coverage

- `evidence_persisted`;
- `evidence_invalidated`;
- `coverage_recorded`;
- `coverage_completed`;
- `coverage_partial`;
- `coverage_failed`;
- `coverage_stale`.

### Classification

- `classification_created`;
- `classification_superseded`;
- `classification_stale`;
- `classification_failed`.

### Human review

- `human_disposition_recorded`;
- `human_disposition_revoked`;
- `human_disposition_superseded`.

### Remediation

- `remediation_requested`;
- `remediation_validation_started`;
- `finding_reproduced`;
- `finding_reproduction_failed`;
- `baseline_gate_started`;
- `baseline_gate_completed`;
- `transformation_started`;
- `transformation_completed`;
- `transformation_failed`;
- `changed_files_validated`;
- `changed_files_rejected`;
- `post_change_gate_started`;
- `post_change_gate_completed`;
- `patch_created`;
- `patch_verified`;
- `remediation_completed`;
- `remediation_failed`;
- `remediation_stale`;
- `remediation_revoked`.

### Publication

- `publication_requested`;
- `publication_validated`;
- `publication_rejected`;
- `publication_branch_created`;
- `publication_push_completed`;
- `draft_pull_request_created`;
- `publication_partially_completed`;
- `publication_failed`.

### Security and cleanup

- `security_control_evaluated`;
- `prompt_injection_detected`;
- `secret_exposure_suspected`;
- `containment_failure_suspected`;
- `containment_failure_confirmed`;
- `cleanup_started`;
- `cleanup_completed`;
- `cleanup_failed`.

New event types must be additive and versioned.

---

## 6. Audit event structure

Every audit event should contain the following fields.

### Event identity

- event ID;
- event type;
- event category;
- schema version;
- event version.

### Tenant identity

- account ID;
- tenant ID when applicable;
- provider connection ID when applicable.

### Actor identity

- actor type;
- actor ID;
- authenticated principal;
- component identity;
- service identity when applicable.

### Authorization context

- phase-authorization ID;
- remediation-authorization ID when applicable;
- human-disposition ID when applicable;
- external-operation authorization when applicable.

### Subject identity

- repository ID;
- source snapshot ID;
- analysis epoch ID;
- finding ID;
- remediation-attempt ID;
- publication-request ID;
- external resource ID;
- security-control ID.

Only relevant fields need to be populated.

### Event result

- status;
- result code;
- failure category;
- bounded human-readable summary;
- structured details reference.

### Integrity fields

- previous event hash;
- event hash;
- integrity-chain ID;
- canonicalization version;
- hash algorithm;
- optional signature or anchor reference.

### Time fields

- occurred at;
- recorded at;
- source timestamp when externally supplied;
- clock-source metadata when applicable.

---

## 7. Event identifiers

Audit event identifiers must be globally unique within the applicable DCAv2
deployment.

An event ID should be:

- opaque;
- collision-resistant;
- independent of database row order;
- safe for logs and reports;
- free of secret or sensitive source content.

Event IDs must not embed:

- credentials;
- source code;
- repository secrets;
- user data;
- authentication headers.

A database sequence alone may be used for local ordering but should not be the
only globally meaningful event identity.

---

## 8. Actor identity

Every event must identify the actor or component responsible for the recorded
action.

Actor types may include:

- `human_operator`;
- `codex_agent`;
- `trusted_controller`;
- `untrusted_runner`;
- `trusted_publisher`;
- `system_job`;
- `external_provider`;
- `administrator`.

The event should distinguish:

- who requested the action;
- which component executed it;
- which authenticated identity was used;
- which human authorization applied.

An analyzer, repository, or tool output must not be represented as an
authoritative human actor.

---

## 9. Causal relationships

Audit events should support causal relationships.

Applicable fields may include:

- parent event ID;
- initiating event ID;
- request event ID;
- attempt event ID;
- caused-by event ID;
- supersedes event ID;
- corrects event ID.

For example:

- a publication request may be caused by a verified remediation event;
- a remediation event may be caused by a current human disposition;
- an analyzer failure may cause partial coverage;
- a governance integrity failure may cause execution to stop.

Causal links must not be inferred solely from timestamps when stronger identity
is available.

---

## 10. Correlation identifiers

Long-running workflows should use stable correlation identifiers.

Examples include:

- analysis epoch ID;
- runner job ID;
- finding ID;
- remediation-attempt ID;
- publication-request ID;
- external-operation ID;
- phase execution ID.

Correlation identifiers help reconstruct a workflow but do not replace event
identity.

A retry must retain the logical workflow identity while receiving its own
attempt and event identities.

---

## 11. Event ordering

Database insertion order alone must not be treated as universal event order.

Audit ordering should use:

- occurred-at time;
- recorded-at time;
- per-chain sequence where applicable;
- causal relationships;
- immutable event identity.

Events received from external systems may arrive late.

Late arrival must not cause existing events to be rewritten.

The event should preserve both:

- when the source claims the event occurred;
- when DCAv2 recorded it.

---

## 12. Timestamps

Audit timestamps should use UTC.

Recommended format:

```text
YYYY-MM-DDTHH:MM:SS.sssZ
```

Every event should record:

- `occurred_at`;
- `recorded_at`.

When the event originated externally, it may also record:

- `external_occurred_at`;
- external clock trust or precision;
- provider request identifier.

DCAv2 must not fabricate missing source timestamps.

When exact time is unavailable, the limitation must remain visible.

---

## 13. Canonical event representation

Audit integrity depends on a deterministic event representation.

Before hashing, DCAv2 must canonicalize applicable fields such as:

- field ordering;
- identifier formatting;
- timestamp formatting;
- absent optional values;
- Unicode normalization;
- path formatting;
- enumerated values;
- structured-detail ordering;
- numeric representation.

Canonicalization rules must be versioned.

Fields such as database row IDs or insertion timestamps must not affect the
semantic event hash unless explicitly part of the canonical format.

---

## 14. Event hashing

Every finalized event should have a cryptographic content hash.

The hash input should include:

- canonical event body;
- prior event hash when chained;
- integrity-chain ID;
- canonicalization version;
- schema version.

The selected hash algorithm must be:

- cryptographically appropriate;
- explicitly recorded;
- supported by the runtime;
- replaceable through a versioned migration strategy.

A hash value alone does not prove that the event was never altered.

Integrity depends on how hashes are chained, stored, protected, and verified.

---

## 15. Hash chains

Audit events should participate in an integrity chain.

A chain may be scoped by:

- tenant;
- account;
- audit partition;
- deployment;
- time period;
- event stream.

Every chained event should record:

- chain ID;
- chain sequence;
- previous event hash;
- current event hash.

The first event in a chain must use an explicit genesis representation.

Parallel event creation must use a design that prevents silent forks or records
forks explicitly.

---

## 16. Chain partitioning

A single global chain may create unnecessary contention.

DCAv2 may partition chains by a stable scope such as:

- tenant;
- account;
- monthly audit partition;
- controlled event stream.

Partitioning must not allow events to cross tenant boundaries incorrectly.

The partitioning rule must be:

- deterministic;
- documented;
- versioned;
- included in verification.

Changing the partitioning rule requires migration and integrity planning.

---

## 17. Chain checkpoints

The audit system may create periodic checkpoints.

A checkpoint should identify:

- chain ID;
- covered sequence range;
- ending event hash;
- event count;
- checkpoint time;
- verification status.

Checkpoints may support:

- faster verification;
- external anchoring;
- archival;
- recovery validation.

A checkpoint must not replace the underlying events.

---

## 18. External integrity anchors

DCAv2 may optionally anchor audit checkpoints to an independent system.

Possible mechanisms include:

- write-once object storage;
- immutable storage retention;
- signed checkpoint files;
- an independent audit service;
- externally timestamped digests.

External anchoring must be treated as an additional control.

It must not be claimed as implemented unless:

- the external system exists;
- anchoring succeeds;
- verification is tested;
- failure behavior is documented.

An unavailable anchor must not cause DCAv2 to rewrite local audit history.

---

## 19. Digital signatures

Audit checkpoints or event batches may be digitally signed.

Signing must use a trusted component and a protected key.

Signing keys must not be available to:

- analyzed repositories;
- untrusted runners;
- repository tests;
- external tools;
- publication workspaces.

A signature verifies possession of the signing key and integrity of the signed
payload.

It does not prove that the underlying event was truthful.

Truthfulness still depends on trusted event generation and validation.

---

## 20. Tamper-evidence verification

DCAv2 should support verification of:

- event canonicalization;
- event hashes;
- previous-hash links;
- chain sequence;
- checkpoint hashes;
- signatures when used;
- external anchors when used;
- missing events;
- duplicate sequence numbers;
- unexpected chain forks.

Verification results must use explicit statuses such as:

- `verified`;
- `verification_failed`;
- `incomplete`;
- `unsupported`;
- `unavailable`;
- `not_run`.

A verification failure must be treated as a security event.

---

## 21. Event finalization

Audit events may be constructed in memory or a temporary state before
finalization.

Once finalized, the event body and integrity fields must become immutable.

A finalized event must not be changed to:

- fix a spelling error;
- improve a summary;
- update a status;
- add a missing authorization;
- replace a failure with success.

Later information must be recorded through a new linked event.

---

## 22. Status changes

Long-running operations may produce several audit events.

For example:

```text
remediation_requested
remediation_validation_started
baseline_gate_started
baseline_gate_completed
transformation_started
transformation_completed
remediation_completed
```

DCAv2 should not repeatedly update one mutable audit row to represent the latest
state.

A separate operational state table may hold current state.

The append-only audit stream must preserve every material transition.

---

## 23. Current state versus audit history

DCAv2 may maintain mutable projections for efficient current-state queries.

Examples include:

- current finding classification;
- current remediation status;
- current publication status;
- current phase state;
- current authorization status.

Mutable projections must be derived from append-only authoritative records.

The projection must be rebuildable from:

- audit events;
- append-only domain records;
- deterministic projection rules.

A projection is not a substitute for audit history.

---

## 24. Database roles

The audit system should use database roles that separate:

- event insertion;
- event reading;
- integrity verification;
- projection maintenance;
- schema migration;
- administrative access.

The application role used during ordinary operation should not have permission
to:

- update finalized audit events;
- delete audit events;
- truncate audit tables;
- disable integrity triggers;
- rewrite chain sequence.

Migration or administrative roles must remain separately controlled and
audited.

---

## 25. PostgreSQL enforcement

The preferred audit persistence platform is PostgreSQL.

Where practical, PostgreSQL controls should enforce:

- append-only insertion;
- tenant scoping;
- non-null event identity;
- unique event identity;
- unique chain sequence;
- foreign-key integrity;
- immutable finalized event fields;
- event-hash presence;
- previous-hash linkage;
- controlled correction relationships.

Application-level checks alone must not be described as database-enforced
controls.

The actual enforcement status must be tested.

---

## 26. Update and delete prevention

Finalized audit tables should reject ordinary:

- `UPDATE`;
- `DELETE`;
- `TRUNCATE`.

Enforcement may use:

- role permissions;
- triggers;
- table ownership separation;
- restricted stored procedures;
- append-only database interfaces.

Tests must verify that the ordinary application role cannot mutate finalized
history.

A superuser can generally bypass database controls.

This limitation must remain explicit in the threat model.

---

## 27. Administrative actions

Administrative access to audit storage must be tightly controlled.

Material administrative actions must themselves be audited when practical.

Examples include:

- schema migration;
- retention-policy change;
- partition attachment;
- partition archival;
- integrity verification;
- backup restoration;
- role or permission change;
- anchor configuration change.

Administrative capability must not be available to the untrusted runner.

---

## 28. Audit-event insertion

Only trusted components may insert authoritative audit events.

Trusted event producers may include:

- trusted controller;
- trusted publisher;
- controlled system jobs;
- approved administrative processes.

The untrusted runner may produce structured execution results.

Those results must be validated by the trusted controller before corresponding
audit events are inserted.

Repository-controlled code must not write directly to the audit database.

---

## 29. Untrusted event content

Event summaries and details may include content derived from untrusted sources.

Such content must be:

- bounded;
- encoded safely;
- treated as data;
- redacted;
- prevented from changing event structure;
- prevented from injecting instructions;
- prevented from altering hashes outside canonical serialization.

Untrusted text must not be interpreted as authorization or trusted actor
identity.

---

## 30. Secret handling

Audit events must not contain secret values.

Prohibited audit content includes:

- access tokens;
- private keys;
- passwords;
- authentication headers;
- credential-bearing URLs;
- complete environment dumps;
- decrypted secrets;
- database connection strings containing credentials;
- sensitive source content without necessity.

Audit events may record:

- credential type;
- credential capability;
- credential status;
- whether credential use was authorized;
- whether redaction occurred.

For example:

```text
credential_type: github_app_installation_token
credential_status: available
credential_value_recorded: false
```

---

## 31. Source-content minimization

Audit events should avoid storing complete source files or patches.

Prefer storing:

- repository identity;
- source snapshot ID;
- file path;
- source occurrence;
- content hash;
- patch hash;
- controlled artifact reference;
- bounded redacted summary.

Detailed artifacts may be stored separately under controlled access when
necessary.

The audit event should retain the artifact identity and digest.

---

## 32. Prohibited-repository events

When a prohibited repository is encountered, audit only the minimum identity
needed to prove that exclusion was enforced.

A permitted record may include:

- provider;
- canonical repository full name;
- denial decision;
- policy version;
- content retrieved as `false`;
- event time.

It must not include:

- source contents;
- file lists;
- branch lists;
- commit history;
- dependency details;
- findings;
- expanded repository metadata.

---

## 33. External operation events

Every material external operation must produce an audit event.

The event should identify:

- provider;
- target identity;
- operation category;
- requested operation;
- authorization ID;
- credential type without value;
- idempotency identity;
- start time;
- completion time;
- result;
- external identifier;
- whether external state changed;
- failure category;
- retry count.

An external operation with an unknown result must not be recorded as
unsuccessful with no state change unless verified.

---

## 34. Idempotency and duplicate events

Retries must not create misleading duplicate success events.

Audit insertion should use a stable event or operation identity where duplicate
delivery is possible.

The system should distinguish:

- repeated delivery of the same event;
- a new retry attempt;
- a repeated verification;
- a separate state transition.

Deduplication must not remove legitimate repeated attempts.

A retry must have its own attempt identity and causal link.

---

## 35. Transaction boundaries

Audit events associated with a trusted state change should be committed within
a transaction boundary that avoids unrecorded state changes where practical.

Examples include:

- recording a human disposition;
- recording remediation authorization;
- creating a remediation attempt;
- updating a current-state projection;
- recording an external publication result.

External systems cannot generally participate in the same database transaction.

External writes therefore require:

- pre-operation audit intent;
- idempotency identity;
- post-operation result recording;
- partial-state handling;
- reconciliation.

---

## 36. External write reconciliation

When an external write may have succeeded but the local result is unknown,
DCAv2 must reconcile provider state.

The audit stream should record:

1. Operation requested.
2. Operation initiated.
3. Response lost or unknown.
4. Provider state queried.
5. Existing external state verified or rejected.
6. Final reconciled result.

Do not delete the intermediate uncertainty events.

---

## 37. Audit retention

Audit retention must be defined by an explicit policy.

Retention must consider:

- security investigations;
- remediation history;
- compliance;
- customer agreements;
- operational recovery;
- storage cost;
- privacy obligations;
- legal requirements.

This document does not establish a universal retention duration.

Until a retention policy is approved, audit records must not be deleted through
ordinary application workflows.

---

## 38. Archival

Audit records may be archived only through an authorized process.

Archival must preserve:

- event identity;
- tenant identity;
- canonical event body;
- event hash;
- chain links;
- checkpoint identity;
- signature or anchor references;
- schema version;
- retrieval instructions.

Archived history must remain verifiable.

Archival must not rewrite events into a representation that loses integrity
information.

---

## 39. Backup and restoration

Backups must preserve the audit chain and required relational integrity.

Restoration procedures must verify:

- event counts;
- chain continuity;
- checkpoint hashes;
- tenant partitions;
- projection rebuildability;
- schema version;
- missing or duplicated events.

A successful database restore does not by itself prove audit integrity.

Integrity verification must run after restoration.

---

## 40. Privacy and data minimization

Audit records must contain only information necessary for:

- accountability;
- security;
- reproducibility;
- incident response;
- remediation history;
- external-operation verification.

Avoid unnecessary:

- personally identifiable information;
- request bodies;
- source content;
- customer data;
- telemetry payloads;
- credentials.

Human actor records should use stable controlled identities rather than
unnecessary personal details.

---

## 41. Tenant isolation

Every audit event must belong to exactly one tenant or account scope when
multi-tenant operation exists.

Tenant isolation must apply to:

- event insertion;
- event queries;
- integrity verification;
- exports;
- archival;
- reporting;
- projections.

One tenant must not read or influence another tenant's audit history.

Cross-tenant administrative reports require explicit authorization and safe
aggregation.

---

## 42. Audit queries

The audit model should support queries such as:

- Which authorization permitted this operation?
- Which repository and source commit were involved?
- Which analyzer runs contributed to this classification?
- Why did coverage become partial?
- Who confirmed the finding as dead?
- Which remediation authorization applied?
- Which baseline and post-change gates ran?
- Which patch was verified?
- Was an external branch created?
- Was a draft pull request created?
- Did a retry create duplicate external state?
- Were cleanup operations successful?
- Did governance integrity fail?
- Was a prohibited repository excluded?
- Did a containment or secret-handling incident occur?

Queries must remain tenant-scoped.

---

## 43. Audit exports

Audit export is an external data operation and requires authorization.

An export must:

- remain tenant-scoped;
- preserve event ordering and causal relationships;
- preserve integrity fields;
- identify redactions;
- exclude secret values;
- use a documented schema;
- record the export itself as an audit event when practical.

An exported audit file does not authorize the recipient to perform future
operations.

---

## 44. Audit verification jobs

Integrity verification should run:

- during security testing;
- after migrations affecting audit tables;
- after backup restoration;
- before high-assurance releases;
- periodically in production when authorized;
- after suspected tampering;
- after detected chain inconsistencies.

A verification job must record:

- verification scope;
- chain IDs;
- event ranges;
- checkpoint identities;
- verification algorithm;
- result;
- failures;
- time;
- verifier identity.

Verification results must themselves be audited.

---

## 45. Security incidents

Audit integrity failures must be treated as security incidents.

Examples include:

- event hash mismatch;
- broken previous-hash link;
- missing chain sequence;
- duplicate chain sequence;
- unauthorized update;
- unauthorized deletion;
- unexpected chain fork;
- invalid signature;
- missing external anchor;
- cross-tenant event association;
- audit role permission escalation.

When detected:

1. Stop affected high-risk operations.
2. Preserve bounded evidence.
3. Do not rewrite the affected events.
4. Record the verification failure through an independent safe path.
5. Identify the affected event range.
6. Report the incident.
7. Require human review before resuming affected workflows.

---

## 46. Availability failures

Audit insertion failure must not be silently ignored.

For security-sensitive actions, failure to persist required audit intent or
result must block the action when safe to do so.

Examples include:

- remediation authorization;
- source modification;
- publication;
- credentialed external write;
- governance change;
- destructive operation.

When an external action may already have occurred, DCAv2 must preserve the
unknown state and reconcile it.

Do not claim that an action was fully audited when persistence failed.

---

## 47. Current-state projection rebuild

Current-state projections should be reproducible from authoritative records.

Rebuild tests should verify applicable projections such as:

- current authorization status;
- current finding classification;
- current human disposition;
- current remediation status;
- current publication status;
- current cleanup status.

A projection rebuild must not change the historical audit stream.

Projection inconsistencies must be reported.

---

## 48. Database representation

The preferred persistence model is relational, append-only, and PostgreSQL
backed.

Possible structures include:

- `audit_events`;
- `audit_event_details`;
- `audit_chains`;
- `audit_checkpoints`;
- `audit_integrity_verifications`;
- `audit_corrections`;
- `audit_exports`;
- `audit_security_incidents`.

Names are illustrative until implemented through an authorized phase.

The model does not require a separate immutable ledger product unless measured
requirements justify one.

---

## 49. Suggested event fields

An audit-event table may include fields such as:

```text
event_id
tenant_id
event_type
event_category
schema_version
actor_type
actor_id
authorization_id
subject_type
subject_id
occurred_at
recorded_at
status
result_code
summary
details_reference
chain_id
chain_sequence
previous_event_hash
event_hash
canonicalization_version
hash_algorithm
parent_event_id
corrects_event_id
```

This list is illustrative.

The final schema must be introduced through additive migrations and validated
against the event contract.

---

## 50. Migration requirements

Audit-model evolution must use additive, ordered migrations.

Migration planning must consider:

- existing event hashes;
- canonicalization versions;
- chain continuity;
- tenant partitions;
- historical event schemas;
- nullable legacy fields;
- checkpoint verification;
- signature compatibility;
- projection rebuilds;
- archived data;
- backup restoration.

Existing finalized audit events must not be rewritten merely to populate a new
field.

New fields may remain null for historical events when their historical value
cannot be established safely.

---

## 51. Canonicalization migration

A canonicalization change may alter event hashes.

Such a change requires an explicit compatibility design.

Options may include:

- retaining the original hash and canonicalization version;
- beginning a new integrity chain;
- creating a signed transition checkpoint;
- preserving both old and new verification methods.

Historical event hashes must not be silently recalculated and overwritten.

---

## 52. Hash-algorithm migration

Changing the hash algorithm requires:

- an explicit algorithm version;
- a transition point;
- preserved historical hashes;
- a verifiable link between old and new chains;
- updated verification tooling;
- migration tests;
- rollback or recovery planning.

The previous hash algorithm must not be described as broken without evidence.

---

## 53. Testing requirements

Audit tests should cover:

- event insertion;
- event finalization;
- event hash generation;
- deterministic canonicalization;
- previous-hash linkage;
- genesis events;
- chain sequence enforcement;
- parallel insertion;
- duplicate delivery;
- retry attempts;
- correction events;
- mutation rejection;
- deletion rejection;
- truncate rejection;
- tenant isolation;
- secret redaction;
- prohibited-repository minimization;
- external-operation partial state;
- integrity verification;
- broken-chain detection;
- invalid signature detection when signing exists;
- checkpoint verification;
- projection rebuild;
- migration from an existing database;
- backup restoration verification;
- audit insertion failure.

Tests must use synthetic actors, repositories, credentials, and events.

---

## 54. Database-permission tests

Tests should verify that the ordinary application role cannot:

- update finalized events;
- delete finalized events;
- truncate audit tables;
- alter chain sequence;
- replace event hashes;
- disable integrity enforcement;
- read another tenant's events;
- assume the migration role.

Tests must report the exact database role and enforcement mechanism.

A passing application-level test does not prove database-level enforcement.

---

## 55. Integrity invariant tests

Where practical, invariant tests should verify:

- changing any canonical event field changes the event hash;
- changing event order breaks chain verification;
- deleting a chained event is detectable;
- inserting an event between finalized events is detectable;
- replacing an event is detectable;
- correcting an event preserves the original;
- events from another tenant cannot enter the chain;
- duplicate delivery does not create duplicate logical events;
- verification is deterministic;
- secret values never enter the canonical event body.

---

## 56. Capability reporting

Audit support must be reported by control.

Relevant capabilities include:

- append-only application behavior;
- database update prevention;
- database delete prevention;
- hash generation;
- hash chaining;
- canonicalization;
- checkpoints;
- signatures;
- external anchoring;
- tenant isolation;
- correction records;
- projection rebuild;
- backup verification;
- archival verification;
- hostile mutation testing.

Support statuses must distinguish:

- implemented and tested;
- implemented but unverified;
- partially enforced;
- unavailable;
- deferred;
- unsupported.

A hash column alone does not constitute tamper-evident audit support.

---

## 57. Reporting requirements

Phase reports involving audit work must identify:

- event types implemented;
- schema changes;
- database roles;
- append-only controls;
- integrity algorithms;
- chain partitioning;
- verification tests;
- correction behavior;
- tenant-isolation tests;
- secret-redaction tests;
- migration tests;
- known limitations;
- controls not implemented.

Claims must remain bounded to executed tests and the documented threat model.

---

## 58. Fail-safe behavior

When audit integrity cannot be established:

- do not rewrite history;
- do not delete suspect events;
- do not claim successful verification;
- do not continue high-risk publication or destructive operations when audit is
  required;
- preserve bounded evidence;
- record the failure through an independent safe mechanism when available;
- report the affected scope;
- require human review.

Audit uncertainty must reduce operational authority.

---

## 59. Policy integrity

This document must not be modified during implementation unless architecture or
governance modification is explicitly authorized.

Changes require:

1. Identification of the audit problem.
2. Review against permanent safety invariants.
3. Review of authorization and tenant implications.
4. Review of secret and privacy implications.
5. Review of integrity-chain compatibility.
6. Migration planning.
7. Updated mutation and verification tests.
8. Updated schemas.
9. A reviewable architecture commit.
10. An ADR when the change alters long-lived event identity, canonicalization,
    integrity-chain, signature, retention, or trust semantics.

This policy must not be weakened to simplify database operations, conceal
failures, permit historical rewriting, or make unsupported tamper-evidence
claims.