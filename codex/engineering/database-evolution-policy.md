# Database Evolution Policy

This document defines how DCAv2 must evolve relational database schemas,
persisted records, indexes, constraints, projections, and migration tooling.

The preferred control-plane persistence platform is PostgreSQL.

Database evolution must preserve historical evidence, auditability,
authorization boundaries, tenant isolation, and compatibility with existing
installations.

This document does not authorize database access or migration execution.

This document must be applied together with:

- `codex/core/03-safety-invariants.md`;
- `codex/core/05-phase-authorization-protocol.md`;
- `codex/core/08-secret-handling-policy.md`;
- `codex/core/10-reporting-and-state-policy.md`;
- `codex/architecture/evidence-model.md`;
- `codex/architecture/audit-policy.md`;
- `codex/engineering/adr-policy.md`;
- `codex/engineering/testing-policy.md`.

---

## 1. Core principles

Database changes must be:

- explicitly authorized;
- additive by default;
- ordered;
- reproducible;
- reviewable;
- compatible with existing installations;
- tenant-safe;
- failure-preserving;
- reversible where practical;
- recoverable where reversal is unsafe;
- tested against realistic prior schema states;
- free of secret values;
- consistent with append-only history requirements.

Existing migrations must not be rewritten merely to produce a cleaner migration
history.

---

## 2. Scope

This policy applies to:

- PostgreSQL schemas;
- tables;
- columns;
- indexes;
- constraints;
- views;
- materialized views;
- functions;
- triggers;
- roles;
- permissions;
- row-level security;
- partitions;
- sequences;
- enum types;
- migration metadata;
- data backfills;
- current-state projections;
- audit storage;
- fixture databases;
- local development databases;
- CI databases;
- production database migration plans.

It also applies to application changes that reinterpret existing persisted data.

---

## 3. Database changes require authorization

A database change must be permitted by the current phase authorization.

Authorization should identify applicable permission for:

- migration-file creation;
- schema changes;
- data backfills;
- role or permission changes;
- test-database creation;
- migration execution;
- production database access;
- destructive operations;
- audit-related changes.

Permission to modify application code does not automatically permit database
changes.

Permission to add a migration does not automatically permit executing it against
production infrastructure.

---

## 4. Migration history is immutable

A migration that has been committed, released, or may have been applied must be
treated as immutable.

Do not:

- edit its statements;
- change its ordering;
- rename it in a way that changes migration identity;
- delete it;
- reuse its version number;
- alter its checksum;
- modify it to match a new preferred schema.

Corrections must be introduced through a new ordered migration.

Formatting-only changes to historical migrations should also be avoided because
they may alter checksums or deployment behavior.

---

## 5. Additive evolution

Schema evolution should be additive whenever practical.

Preferred changes include:

- adding nullable columns;
- adding tables;
- adding indexes;
- adding constraints in a staged process;
- adding new enum alternatives carefully;
- adding new projections;
- adding replacement columns before retiring old columns;
- introducing new relationships without deleting historical data.

Destructive changes require separate justification, authorization, migration
planning, compatibility analysis, backup planning, and recovery testing.

---

## 6. Migration identity

Every migration must have a stable and unique identity.

A migration identity should include:

- monotonic sequence or timestamp;
- concise descriptive name;
- immutable filename;
- migration-framework identity where applicable.

Example:

    20260722_001_add_analysis_epochs.sql

Migration identities must not depend on local filesystem ordering alone.

Two migrations must not share the same version or ordering identity.

---

## 7. Migration ordering

Migration execution order must be deterministic.

The migration system must define:

- how ordering is calculated;
- how already-applied migrations are detected;
- how checksums are validated;
- how concurrent migration attempts are handled;
- how partial execution is represented;
- how failures are recovered.

Application startup must not silently reorder migrations.

A failed migration must not be marked as applied.

---

## 8. Migration metadata

The database should retain migration metadata including:

- migration identity;
- checksum;
- application time;
- application status;
- tool version;
- database schema version;
- execution actor or component;
- deployment or environment identity;
- failure details when applicable.

Migration metadata must not contain credentials or connection strings.

Historical migration records must not be modified to conceal failure or manual
intervention.

---

## 9. Expand-and-contract strategy

Breaking schema changes should use an expand-and-contract strategy.

A typical sequence is:

1. Add the replacement schema.
2. Deploy code capable of reading both old and new representations.
3. Write new data to the replacement representation.
4. Backfill historical data safely.
5. Verify consistency.
6. Switch reads to the replacement representation.
7. Stop writing the legacy representation.
8. Observe the system for a defined compatibility period.
9. Remove the legacy representation only through separately authorized work.

The expansion and contraction steps should normally occur in different
migrations and deployments.

---

## 10. Application compatibility

Every migration must state its compatibility expectations.

Applicable compatibility modes include:

- old application with old schema;
- new application with old schema;
- old application with expanded schema;
- new application with expanded schema;
- mixed-version deployment;
- migration worker with application traffic;
- rollback application with migrated schema.

A migration must not assume instantaneous replacement of every application
instance unless the deployment model guarantees it.

---

## 11. Forward recovery

Forward recovery is preferred when reversing a migration would destroy,
reinterpret, or corrupt data.

A forward-recovery plan should define:

- the failure being corrected;
- the corrective migration;
- compatibility during recovery;
- affected data;
- verification queries;
- application behavior before completion;
- stopping conditions.

The absence of a safe down migration must be explicit.

A misleading down migration is worse than a documented forward-only migration.

---

## 12. Rollback

Rollback may be supported when it is safe and tested.

Rollback planning must distinguish:

- application rollback;
- schema rollback;
- data rollback;
- configuration rollback;
- migration-tool rollback.

A database rollback must not:

- delete newly created authoritative history;
- rewrite audit records;
- discard human dispositions;
- discard remediation authorizations;
- remove evidence needed to explain prior decisions;
- violate tenant isolation.

Rollback procedures must be tested against representative data.

---

## 13. Destructive changes

Destructive changes include:

- dropping tables;
- dropping columns;
- deleting records;
- truncating tables;
- narrowing data types;
- removing enum values;
- changing identifiers incompatibly;
- rewriting historical audit data;
- removing tenant keys;
- disabling integrity constraints;
- irreversible bulk updates.

Destructive changes require:

1. Explicit human authorization.
2. A documented business and technical reason.
3. Impact analysis.
4. Backup and restoration planning.
5. Compatibility analysis.
6. Data-retention review.
7. Audit review.
8. Tenant-isolation review.
9. Tested recovery behavior.
10. A reviewable execution plan.

An ordinary implementation phase must not infer destructive authority.

---

## 14. Historical domain records

Historical domain records must remain attributable and reconstructable.

Examples include:

- evidence items;
- coverage records;
- classifications;
- human dispositions;
- remediation attempts;
- remediation authorizations;
- publication requests;
- publication results;
- audit events;
- external-operation records.

A migration must not rewrite historical records merely so they appear to have
been created under a newer schema or policy.

New fields may remain null for historical rows when their original values cannot
be established safely.

---

## 15. Audit tables

Audit-related schema changes require additional review.

They must preserve:

- append-only behavior;
- event identity;
- chain sequence;
- previous-event hashes;
- event hashes;
- canonicalization versions;
- correction relationships;
- tenant scope;
- verification ability;
- archival compatibility.

Historical event hashes must not be recalculated and overwritten merely because
the event schema changes.

Changes affecting canonicalization, hashing, chain partitioning, or signatures
require an ADR and explicit compatibility design.

---

## 16. Evidence and coverage digests

Migrations affecting evidence or coverage identity must preserve historical
digest semantics.

A migration must not silently:

- recalculate historical evidence digests;
- recalculate historical coverage digests;
- change canonical ordering;
- merge previously distinct evidence;
- treat unavailable scope as complete;
- remove failure records.

When a digest algorithm or canonicalization version changes, retain the original
version and create a documented transition strategy.

---

## 17. Tenant isolation

Every multi-tenant table must have an explicit tenant or account boundary.

Tenant isolation must be preserved through:

- primary keys;
- unique constraints;
- foreign keys;
- indexes;
- queries;
- row-level security where used;
- background jobs;
- backfills;
- projections;
- audit chains;
- migration scripts.

A migration must not temporarily combine tenant data in an unscoped staging
table unless the design explicitly preserves isolation and authorization.

Cross-tenant foreign-key relationships are prohibited unless a reviewed product
requirement defines them safely.

---

## 18. Tenant-scoped uniqueness

Unique constraints must include tenant identity when uniqueness is intended only
within a tenant.

For example, a repository full name may need uniqueness within:

- provider connection;
- account;
- tenant;

rather than across the entire DCAv2 deployment.

A global unique constraint must not be introduced without validating that the
domain requires global uniqueness.

---

## 19. Foreign keys

Foreign keys should be used where they preserve domain integrity without
violating append-only or lifecycle requirements.

Foreign-key design must define:

- tenant alignment;
- deletion behavior;
- update behavior;
- deferrability;
- indexing;
- migration ordering;
- historical-record behavior.

Default to restrictive deletion behavior for authoritative records.

Broad cascading deletion should not be used for evidence, authorization, audit,
remediation, or publication history.

---

## 20. Deletion semantics

Database deletion behavior must be explicit.

Possible approaches include:

- physical deletion;
- logical deletion;
- revocation;
- supersession;
- archival;
- retention-based removal.

Authoritative historical records should normally use revocation, supersession,
or archival rather than mutation or deletion.

A generic `deleted_at` column must not be added without defining its meaning for
queries, audit, uniqueness, retention, and authorization.

---

## 21. Column additions

New columns should normally begin as nullable unless a safe default and
backfill strategy are established.

Before adding a non-null column, determine:

- existing row count;
- default semantics;
- table-lock behavior;
- application compatibility;
- backfill cost;
- tenant impact;
- historical truthfulness.

Do not populate historical rows with fabricated values merely to satisfy a
non-null constraint.

Use an explicit unknown or legacy state only when it accurately represents the
historical data.

---

## 22. Defaults

Database defaults must represent valid domain behavior.

A default must not:

- grant authorization;
- mark a capability functional;
- classify a finding as dead;
- mark a gate as passed;
- mark coverage complete;
- mark publication successful;
- imply a human disposition;
- hide missing provenance.

Security-sensitive and decision-sensitive fields should generally require an
explicit value.

---

## 23. Constraints

Constraints should be introduced in stages when existing data may not satisfy
them.

A safe sequence may include:

1. Add the constraint without immediate validation where PostgreSQL supports it.
2. Validate existing data separately.
3. Correct invalid data through an authorized process.
4. Validate the constraint.
5. Update application assumptions.

Constraint failures must not be bypassed by disabling integrity checks
permanently.

---

## 24. Check constraints

Check constraints should encode durable database invariants.

Examples may include:

- valid status combinations;
- required identifiers for finalized records;
- non-negative retry counts;
- valid temporal ordering;
- required tenant identifiers;
- forbidden secret-value flags.

Application policy that changes frequently should not be duplicated in rigid
database constraints without a migration strategy.

---

## 25. Enum types

PostgreSQL enum types require careful evolution.

Before introducing an enum, consider whether a lookup table or constrained text
field provides safer long-term evolution.

Adding enum values may be acceptable when:

- ordering implications are understood;
- application compatibility is verified;
- rollback limitations are documented;
- migration tooling supports the operation.

Removing or renaming enum values is destructive and requires explicit migration
planning.

---

## 26. Data-type changes

A data-type change must define:

- conversion behavior;
- invalid values;
- precision changes;
- collation changes;
- index impact;
- application compatibility;
- table-lock impact;
- rollback or forward recovery.

Potentially lossy conversions must not occur without explicit authorization and
validation.

Prefer adding a replacement column and backfilling over an unsafe in-place
conversion.

---

## 27. Identifier changes

Changing identifiers requires careful preservation of relationships.

Identifier migrations must consider:

- primary keys;
- foreign keys;
- external references;
- audit references;
- idempotency identities;
- API identifiers;
- cached values;
- artifact references;
- historical reports.

Externally visible or audit-significant identifiers should not be reused.

---

## 28. Indexes

Indexes must be introduced for demonstrated query, constraint, or operational
needs.

An index proposal should identify:

- query or constraint supported;
- table size;
- selectivity;
- expected write cost;
- storage cost;
- tenant behavior;
- creation method;
- lock behavior;
- removal criteria.

Large production indexes should use non-blocking creation methods when supported
and appropriate.

Index creation failure must remain visible.

---

## 29. Concurrent index creation

PostgreSQL concurrent index creation may be appropriate for large active tables.

The migration process must account for:

- transaction restrictions;
- invalid index states;
- retry behavior;
- migration-framework support;
- deployment coordination;
- cleanup of failed index creation.

A failed concurrent index must not be marked as a successful migration.

---

## 30. Unique indexes

Unique indexes and constraints must be validated against existing data before
enforcement.

Duplicate handling must be explicit.

Do not automatically delete duplicate rows.

Where duplicates represent historical operations, remediation may require:

- preserving every historical row;
- selecting a current projection;
- adding a new logical identity;
- recording a correction;
- introducing a scoped uniqueness rule.

---

## 31. Backfills

Backfills must be bounded, resumable, and auditable where practical.

A backfill plan should define:

- source rows;
- target fields;
- transformation logic;
- batch size;
- ordering;
- tenant isolation;
- retry behavior;
- idempotency;
- verification;
- cancellation;
- resource limits;
- completion criteria.

Backfills must not hold unbounded transactions over large tables.

---

## 32. Backfill identity

Long-running backfills should use stable job and batch identities.

A backfill record may include:

- backfill ID;
- migration identity;
- tenant scope;
- cursor or range;
- batch number;
- start and completion times;
- rows examined;
- rows changed;
- rows rejected;
- retry count;
- verification result.

Retries must not duplicate semantic changes.

---

## 33. Backfill truthfulness

A backfill must not invent historical facts.

For example, it must not assign:

- a human reviewer that did not exist;
- an authorization that was never granted;
- a tool version that was not recorded;
- a successful gate result that was unavailable;
- complete coverage where scope was unknown;
- an event occurrence time that was not captured.

Use null, unknown, legacy, or unavailable states when they reflect the actual
historical limitation.

---

## 34. Data correction

Correcting invalid persisted data requires an attributable process.

A correction must record:

- affected records;
- detected problem;
- original value or identity;
- corrected value or replacement record;
- correction reason;
- authorizing actor;
- correction time;
- verification.

Append-only domain history should use correction or supersession records rather
than in-place rewriting.

---

## 35. Current-state projections

Mutable projection tables may be rebuilt or corrected when their authoritative
sources remain preserved.

A projection migration must define:

- authoritative input records;
- deterministic projection rules;
- rebuild procedure;
- tenant isolation;
- consistency verification;
- application behavior during rebuild.

A projection table must not become the only source of historical truth.

---

## 36. Views and materialized views

Views may provide stable query contracts across schema evolution.

A view change must consider:

- column compatibility;
- caller expectations;
- tenant filtering;
- performance;
- permissions;
- migration ordering.

Materialized views additionally require:

- refresh strategy;
- staleness semantics;
- concurrent refresh support;
- failure behavior;
- storage impact.

A stale materialized view must not be treated as current authoritative state.

---

## 37. Database functions and triggers

Database functions and triggers require explicit ownership and tests.

They must not:

- hide authorization decisions;
- execute unbounded external behavior;
- expose secrets;
- rewrite finalized audit events;
- bypass tenant scoping;
- silently swallow failures.

Trigger ordering, transaction behavior, and recursion risks must be documented.

Security-definer functions require additional privilege review.

---

## 38. Roles and permissions

Database roles should separate:

- ordinary application access;
- migration execution;
- audit insertion;
- audit verification;
- projection maintenance;
- read-only reporting;
- administration.

A migration must not grant broader privileges than required.

The ordinary application role should not be able to:

- alter schemas;
- execute arbitrary migrations;
- update finalized audit records;
- delete authoritative history;
- assume administrative roles;
- read another tenant's data.

Permission changes require explicit tests.

---

## 39. Row-level security

When row-level security is used, migrations must preserve its enforcement.

Changes must verify:

- policy coverage for new tables;
- policy coverage for new operations;
- role behavior;
- bypass privileges;
- migration-role behavior;
- background-job behavior;
- tenant context propagation;
- test isolation.

A table containing tenant data must not be exposed temporarily without the
required policy during deployment.

---

## 40. Secrets and database configuration

Migration files and database code must not contain:

- passwords;
- access tokens;
- private keys;
- credential-bearing URLs;
- production connection strings;
- decrypted secret values.

Configuration should refer to secret names or runtime-provided capabilities.

Migration logs must redact credentials and sensitive data.

---

## 41. Test databases

Local and CI migration tests must use isolated test databases.

Tests must not use:

- production databases;
- shared customer databases;
- unrelated developer databases;
- uncontrolled persistent data;
- real credentials beyond the required test capability.

Test database identity and cleanup behavior must be explicit.

---

## 42. Production database access

Production database access requires separate explicit authorization.

An authorization should identify:

- environment;
- database or cluster;
- operation;
- migration identities;
- executing principal;
- allowed time window;
- backup or recovery prerequisites;
- verification commands;
- stop conditions.

Permission to prepare migration files is not permission to execute them in
production.

---

## 43. Migration transactions

Migrations should use transactions where PostgreSQL and the operation permit
them.

Transaction strategy must account for:

- DDL transaction support;
- concurrent index operations;
- long-running backfills;
- locks;
- partial external work;
- migration-framework behavior.

A multi-step migration that cannot be atomic must define checkpoints,
idempotency, and partial-failure recovery.

---

## 44. Lock analysis

Potentially blocking migrations must be evaluated for lock behavior.

The evaluation should consider:

- table size;
- active write volume;
- lock mode;
- lock duration;
- statement timeout;
- lock timeout;
- retry behavior;
- application impact;
- maintenance window requirements.

A migration must not assume that a statement is harmless merely because it is
syntactically simple.

---

## 45. Resource limits

Migration and backfill execution should define applicable:

- statement timeout;
- lock timeout;
- batch size;
- transaction size;
- memory expectations;
- temporary disk expectations;
- retry count;
- concurrency;
- rate limiting.

Resource exhaustion must be reported explicitly.

It must not be treated as successful partial completion.

---

## 46. Migration observability

Migration execution should expose bounded operational information including:

- migration identity;
- current stage;
- start time;
- duration;
- completion status;
- rows processed;
- batches completed;
- retries;
- failure category;
- remaining work.

Logs must not contain secret values or unnecessary row contents.

---

## 47. Migration failure

When a migration fails:

1. Stop dependent deployment steps.
2. Preserve the exact failure state.
3. Determine whether the transaction rolled back.
4. Detect partial non-transactional changes.
5. Avoid blind reruns.
6. Verify migration metadata.
7. Apply the documented recovery plan.
8. Record the failure.
9. Report affected schemas and environments.
10. Require human review when production data may be affected.

A failed migration must not be edited in place and rerun under the same identity.

---

## 48. Partial migration state

A partially applied migration must be represented explicitly.

The system must determine:

- which statements completed;
- which objects exist;
- which data changed;
- whether retries are idempotent;
- whether cleanup is safe;
- whether a corrective migration is required.

Unknown partial state must not be treated as a clean rollback.

---

## 49. Migration verification

Every migration should define verification queries or tests.

Verification may include:

- migration metadata;
- table and column existence;
- constraint validation;
- index validity;
- row counts;
- tenant-scoped consistency;
- digest preservation;
- audit-chain verification;
- projection consistency;
- role permissions;
- application compatibility.

A migration command exiting successfully is not sufficient proof that the
database satisfies the intended contract.

---

## 50. Upgrade testing

Migration testing must begin from representative prior schema states.

Applicable starting points include:

- the immediately previous schema;
- the earliest supported schema;
- a database containing realistic historical records;
- a database containing null legacy fields;
- a database containing large tables;
- a database containing multiple tenants;
- a database containing failed or partial operational records.

Testing only against an empty database is insufficient.

---

## 51. Fresh-install testing

The complete migration chain must also be tested against an empty database.

Fresh-install testing should verify:

- deterministic migration order;
- final schema;
- constraints;
- indexes;
- roles;
- seed data when applicable;
- application startup;
- absence of historical-migration checksum drift.

Fresh-install success does not replace upgrade testing.

---

## 52. Downgrade testing

When downgrade support is claimed, test it explicitly.

Downgrade tests must verify:

- schema compatibility;
- data preservation;
- application rollback;
- migration metadata;
- audit integrity;
- tenant isolation;
- inability to reverse irreversible history incorrectly.

When downgrade is unsupported, documentation must say so and provide a
forward-recovery strategy.

---

## 53. Backup and restoration

High-risk migrations require validated backup and restoration planning.

The plan should identify:

- backup scope;
- backup time;
- restoration process;
- restoration duration;
- encryption;
- access control;
- audit-history preservation;
- post-restoration verification.

The existence of a backup command is not proof that restoration works.

Restoration testing must use safe non-production infrastructure unless
separately authorized.

---

## 54. Migration performance

Large migration and backfill operations should be measured.

Measurements may include:

- table row count;
- table size;
- index size;
- execution duration;
- lock duration;
- CPU use;
- memory use;
- temporary disk;
- replication lag;
- batch throughput;
- application latency impact.

Performance claims must state the environment and dataset.

Unmeasured production behavior must remain unmeasured.

---

## 55. Replication and high availability

When PostgreSQL replication or high availability is used, migration planning
must consider:

- replication lag;
- write amplification;
- replica compatibility;
- failover during migration;
- long-running transactions;
- index creation;
- logical replication;
- read replicas;
- backup consistency.

A migration validated only on a standalone local database must not be described
as high-availability validated.

---

## 56. Partitioning

Table partitioning requires measured need and an ADR when architecture
significance is material.

A partitioning decision must address:

- partition key;
- tenant behavior;
- query pruning;
- retention;
- indexes;
- constraints;
- foreign keys;
- migration complexity;
- archival;
- chain integrity for audit data;
- operational ownership.

Partitioning must not be introduced solely because a table may become large in
the future.

---

## 57. Extensions and additional infrastructure

PostgreSQL extensions, external migration services, change-data-capture systems,
or additional databases require explicit evaluation.

The evaluation must consider:

- license;
- security;
- operational burden;
- availability;
- backup and restoration;
- tenant isolation;
- migration compatibility;
- replacement strategy.

Prefer core PostgreSQL capabilities until measured requirements justify
additional infrastructure.

---

## 58. Schema documentation

Persisted models should be documented sufficiently to explain:

- purpose;
- authoritative versus projected status;
- tenant scope;
- lifecycle;
- immutable fields;
- mutable fields;
- foreign-key relationships;
- deletion behavior;
- retention;
- audit requirements;
- migration constraints.

Documentation must describe implemented behavior rather than roadmap intent.

---

## 59. Schema drift

DCAv2 should detect unexpected differences between:

- migration history;
- expected schema;
- actual schema;
- application assumptions.

Drift may include:

- manually added columns;
- missing constraints;
- altered permissions;
- invalid indexes;
- edited migration metadata;
- untracked database functions.

Detected drift must be reported.

High-risk operations should stop when material drift prevents safe migration.

---

## 60. Manual database changes

Untracked manual production changes are prohibited except through an explicitly
authorized emergency process.

An emergency change must record:

- reason;
- operator;
- exact statements;
- environment;
- start and completion times;
- affected records or objects;
- verification;
- follow-up migration;
- audit event.

The repository migration history must be reconciled afterward.

Manual intervention must not remain undocumented.

---

## 61. Data imports

Data imports must define:

- source;
- provenance;
- schema;
- tenant scope;
- validation;
- deduplication;
- idempotency;
- failure handling;
- secret handling;
- rollback or correction;
- audit.

Imported conclusions must not bypass DCAv2 evidence, classification, or
authorization policy.

---

## 62. Data exports

Database exports require authorization and data-minimization review.

Exports must:

- remain tenant-scoped;
- exclude secret values;
- preserve required provenance;
- identify redactions;
- use controlled storage;
- define retention;
- be audited where practical.

A database backup or export must not be placed in the repository.

---

## 63. Migration code review

Every migration review should verify:

- authorization;
- immutable migration history;
- SQL correctness;
- compatibility;
- tenant isolation;
- lock behavior;
- resource behavior;
- failure behavior;
- retry behavior;
- backfill idempotency;
- audit impact;
- secret handling;
- verification;
- recovery;
- tests.

Reviewers must not approve a migration solely because the final schema looks
correct.

---

## 64. Migration test manifest

Database changes must reference applicable tests in the phase test manifest.

Relevant test categories include:

- fresh installation;
- upgrade from prior schema;
- upgrade from earliest supported schema;
- migration failure;
- retry;
- partial state;
- rollback or forward recovery;
- tenant isolation;
- permission enforcement;
- audit integrity;
- large-table behavior;
- backup restoration;
- application compatibility.

Unavailable required migration tests block completion.

---

## 65. Reporting requirements

A phase report involving database changes must state:

- migrations added;
- historical migrations preserved;
- schema objects changed;
- data backfills;
- compatibility behavior;
- test database versions;
- upgrade paths tested;
- fresh installation result;
- failure and retry results;
- rollback or forward-recovery result;
- tenant-isolation result;
- audit-integrity result;
- permission result;
- performance measurements;
- known limitations;
- production execution status.

Preparing a migration must not be reported as applying it to production.

---

## 66. Capability reporting

Database capabilities must be reported separately.

Examples include:

- migration ordering;
- checksum validation;
- fresh installation;
- upgrade from existing schema;
- forward recovery;
- backfill resumption;
- tenant isolation;
- audit mutation prevention;
- projection rebuild;
- backup restoration;
- schema-drift detection.

A migration framework dependency does not prove these capabilities are
functional.

Each capability requires implementation and tests.

---

## 67. Prohibited practices

The following practices are prohibited:

- rewriting released migrations;
- using production credentials in tests;
- running unreviewed migrations automatically;
- treating migration success on an empty database as complete validation;
- fabricating historical values during backfill;
- deleting audit or authorization history for convenience;
- disabling tenant isolation during migration without explicit safe design;
- storing secrets in migration files;
- using broad cascade deletion for authoritative history;
- marking failed migrations as applied;
- silently using destructive schema synchronization;
- allowing ORM auto-sync to mutate production schemas without reviewed
  migrations;
- editing production schemas manually without an authorized emergency process.

---

## 68. Fail-safe behavior

When database state, migration compatibility, authorization, or recovery cannot
be established confidently:

- do not execute the migration;
- do not modify production data;
- do not rewrite migration history;
- do not claim rollback is safe;
- do not fabricate legacy values;
- do not weaken constraints;
- preserve existing data;
- record the uncertainty;
- identify required verification;
- use a blocked or failed result.

Database uncertainty must reduce execution authority.

---

## 69. Policy integrity

This document must not be modified during implementation unless engineering or
governance modification is explicitly authorized.

Changes require:

1. Identification of the database-evolution problem.
2. Review against permanent safety invariants.
3. Review of historical-data preservation.
4. Review of audit and tenant-isolation impact.
5. Review of migration and recovery implications.
6. Updated migration tests.
7. Updated schemas or templates where applicable.
8. A reviewable governance commit.
9. An ADR when the change alters long-lived persistence, migration,
   compatibility, or recovery semantics.

This policy must not be weakened to simplify schema changes, hide migration
failure, rewrite history, or permit unauthorized destructive data operations.