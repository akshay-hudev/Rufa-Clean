# Phase 10 — Scale Validation

This document defines the planned scope, capability boundaries, test strategy,
safety requirements, stop conditions, and completion criteria for Phase 10 of
DCAv2.

Phase 10 validates previously established DCAv2 capabilities under explicitly
bounded scale, concurrency, failure, recovery, cost, and multi-tenant
conditions.

Phase 10 does not create new semantic authority.

Higher throughput, larger datasets, more workers, longer campaigns, or broader
infrastructure do not permit DCAv2 to:

- weaken evidence requirements;
- treat partial coverage as complete;
- infer human disposition;
- infer remediation authorization;
- infer publication authorization;
- bypass repository policy;
- perform excluded repository target operations;
- expose credentials;
- suppress failed targets;
- merge pull requests;
- modify production systems automatically;
- claim universal enterprise scale.

A capability may be described as validated only within the exact dimensions,
profiles, workloads, environments, and limits actually tested.

This roadmap file does not authorize implementation, repository access,
credential use, production load generation, external-system load testing,
database changes, campaign execution, remediation, publication, infrastructure
changes, or destructive operations.

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
  id: phase-10-scale-validation
  name: Scale Validation
  roadmap_order: 10
  default_status: inactive
  implementation_authorized_by_this_file: false
```

The phase becomes active only when the current authorization record explicitly
identifies `phase-10-scale-validation` as active.

---

## 2. Primary objective

The primary objective is to determine how established DCAv2 capabilities behave
under realistic, bounded operating conditions.

The phase should validate applicable:

1. Correctness under load.
2. Evidence preservation under load.
3. Coverage preservation under load.
4. Classification determinism under concurrency.
5. Tenant isolation under concurrency.
6. Repository and target isolation.
7. Queue throughput and backpressure.
8. Lease safety.
9. Retry safety.
10. Idempotency.
11. Worker startup and shutdown.
12. Runner isolation.
13. Database throughput and contention.
14. Audit integrity and growth.
15. Artifact-storage behavior.
16. Provider and registry rate-limit handling.
17. Campaign scheduling and fairness.
18. Resource budgeting.
19. Cost budgeting.
20. Failure isolation.
21. Partial-outage behavior.
22. Restart and recovery.
23. External-state reconciliation.
24. Publisher safety under concurrent requests.
25. Long-running campaign behavior.
26. Staleness propagation.
27. Observability.
28. Capacity planning.
29. Admission control.
30. Operational handoff.

Scale validation must measure both successful throughput and safe degradation.

---

## 3. Intended capability

The intended capability is conceptually:

```text
Execute previously supported DCAv2 workflows against representative bounded
workloads, verify that correctness and safety invariants remain true as load,
concurrency, data volume, duration, and failure rates increase, and publish
precise tested limits without generalizing beyond the observed evidence.
```

Phase 10 should answer questions such as:

- How many repositories were tested?
- How many files and symbols were processed?
- How many evidence edges were normalized?
- How many campaigns and work items ran concurrently?
- How did latency change as load increased?
- When did backpressure begin?
- Were failures isolated?
- Were retries safe?
- Was audit history complete?
- Were tenant boundaries preserved?
- Did cleanup complete?
- What resource and cost limits were reached?
- Which capability became the first bottleneck?
- Which operating limits remain unvalidated?

---

## 4. Phase prerequisites

Phase 10 should not begin until earlier phases have established or bounded:

- capability identifiers;
- capability statuses;
- repository qualification;
- language profiles;
- package-manager profiles;
- monorepo profiles;
- cross-repository profiles;
- contract profiles;
- infrastructure and runtime profiles;
- campaign workflows;
- queue semantics;
- lease semantics;
- retry semantics;
- idempotency semantics;
- evidence normalization;
- coverage accounting;
- deterministic classification;
- human disposition;
- separate remediation authorization;
- trusted publication;
- runner isolation;
- tenant isolation;
- additive database evolution;
- append-only audit;
- security-control reporting.

Phase 10 must not use scale testing to compensate for missing functional
correctness.

A capability that is not functionally accepted must not be represented as
scale-validated.

---

## 5. Non-goals

Phase 10 does not, by default, include:

- adding new language support;
- adding new package-manager support;
- adding new framework support;
- adding new contract types;
- adding new infrastructure providers;
- adding new runtime collectors;
- changing classification semantics;
- weakening safety invariants;
- testing repository target-role exclusions;
- unrestricted organization crawling;
- unrestricted production load;
- production denial-of-service testing;
- destructive chaos experiments;
- production credential testing;
- production data extraction;
- automatic remediation at scale;
- automatic publication at scale;
- direct default-branch pushes;
- pull-request merge;
- auto-merge;
- infrastructure apply;
- deployment;
- feature-flag modification;
- package publication;
- contract publication;
- unlimited workers;
- unlimited retries;
- unlimited storage;
- unlimited cost;
- universal enterprise-scale claims.

Any new functional capability discovered as necessary during Phase 10 must be
planned and authorized separately.

---

## 6. Authorization prerequisites

The active Phase 10 authorization must identify applicable:

- tenant scope;
- test environment;
- production prohibition or permission;
- capability IDs under test;
- capability versions;
- target-universe type;
- repository scope;
- service scope;
- contract scope;
- environment scope;
- workload profiles;
- dataset sources;
- synthetic-data requirements;
- external-system scope;
- provider operations;
- registry operations;
- database operations;
- migration operations;
- runner operations;
- campaign operations;
- remediation operations;
- publication operations;
- concurrency limits;
- duration limits;
- resource limits;
- storage limits;
- network limits;
- provider request limits;
- telemetry-query limits;
- cost limits;
- failure-injection permissions;
- cleanup requirements;
- retained artifacts;
- required tests;
- stop conditions;
- expiration or completion boundary;
- human authorizer.

Load testing must not begin with an open-ended instruction such as `test at
enterprise scale`.

Missing limits default to denial.

---

## 7. Required phase outputs

Phase 10 should produce applicable:

- scale-validation plan;
- workload profiles;
- dataset profiles;
- benchmark environment identity;
- baseline measurements;
- load-test results;
- concurrency-test results;
- endurance-test results;
- failure-injection results;
- recovery-test results;
- tenant-isolation results;
- provider-rate-limit results;
- database-capacity results;
- queue-capacity results;
- worker-capacity results;
- runner-capacity results;
- artifact-storage results;
- audit-growth results;
- publisher-concurrency results;
- cost measurements;
- bottleneck analysis;
- capacity model;
- admission-control recommendations;
- operational limits;
- capability-status updates;
- additive database migrations where required;
- audit events;
- phase test manifest;
- security-control updates;
- phase-completion report;
- updated execution state.

---

## 8. Capability identifiers

Phase 10 should define or update capability identifiers such as:

```text
scale.workload-profile.v1
scale.dataset-profile.v1
scale.correctness-under-load.v1
scale.queue-throughput.v1
scale.worker-concurrency.v1
scale.runner-capacity.v1
scale.database-capacity.v1
scale.audit-capacity.v1
scale.artifact-storage.v1
scale.provider-rate-limit.v1
scale.failure-injection.v1
scale.recovery.v1
scale.endurance.v1
scale.tenant-isolation.v1
scale.publisher-concurrency.v1
scale.cost-model.v1
scale.capacity-model.v1
scale.admission-control.v1
```

Capability-specific scale identifiers should remain explicit.

Examples include:

```text
scale.typescript-analysis.v1
scale.python-analysis.v1
scale.cross-repository-analysis.v1
scale.contract-analysis.v1
scale.runtime-collection.v1
scale.campaign-orchestration.v1
```

Every identifier must remain narrow, versioned, and testable.

---

## 9. Scale-validation principle

Scale validation must preserve functional correctness.

A test is not successful merely because DCAv2:

- processed many repositories;
- completed quickly;
- used many workers;
- created many findings;
- produced many pull requests;
- consumed little memory;
- remained available.

Success requires that applicable:

- repository identities remain exact;
- source revisions remain exact;
- evidence remains attributable;
- coverage remains truthful;
- failures remain visible;
- classifications remain deterministic;
- tenant boundaries remain intact;
- authorization remains current;
- changed files remain bounded;
- audit history remains complete;
- external operations remain idempotent;
- cleanup remains verified.

---

## 10. Tested-limit principle

Every scale statement must include the tested boundary.

A valid claim should identify applicable:

- repository count;
- package count;
- service count;
- environment count;
- file count;
- symbol count;
- evidence-edge count;
- contract-operation count;
- runtime-observation count;
- campaign count;
- work-item count;
- concurrent worker count;
- test duration;
- hardware profile;
- database profile;
- storage profile;
- network profile;
- provider profile;
- failure rate;
- cost.

Statements such as `supports enterprise scale` are invalid without a precise
tested profile.

---

## 11. Benchmark environment identity

Every benchmark environment should bind:

- environment ID;
- tenant;
- infrastructure provider or local platform;
- region;
- machine or node type;
- CPU allocation;
- memory allocation;
- disk type and capacity;
- network characteristics;
- database version;
- database topology;
- queue implementation;
- artifact-storage implementation;
- runner-image versions;
- controller version;
- publisher version;
- configuration digest;
- creation time;
- cleanup status.

Benchmark results from materially different environments must remain distinct.

---

## 12. Environment isolation

Scale testing should use isolated environments whenever practical.

The environment must prevent:

- impact on production workloads;
- impact on unrelated tenants;
- uncontrolled provider cost;
- access to production credentials;
- excluded repository target operations;
- accidental publication;
- accidental deployment;
- shared mutable test state;
- cross-test contamination.

Production testing requires explicit authorization and a separately reviewed
risk plan.

---

## 13. Production testing

Production-scale testing is denied by default.

When production observation is explicitly authorized, the test plan must
identify:

- read-only operations;
- prohibited write operations;
- query limits;
- request limits;
- observation windows;
- data classes;
- credential scope;
- abort thresholds;
- operator supervision;
- incident response;
- cleanup;
- customer-impact safeguards.

Phase 10 must never generate destructive production load under a general scale
authorization.

---

## 14. Workload profiles

Every scale test should use a versioned workload profile.

A workload profile should identify:

- workload ID;
- workload version;
- capabilities exercised;
- target distribution;
- repository distribution;
- language distribution;
- package-manager distribution;
- framework distribution;
- file-size distribution;
- symbol distribution;
- dependency-graph distribution;
- failure distribution;
- concurrency;
- arrival rate;
- duration;
- expected outputs;
- correctness oracle;
- resource limits;
- cost limits.

---

## 15. Representative workloads

Representative workloads should include more than uniform small fixtures.

Applicable distributions may include:

- many small repositories;
- fewer large repositories;
- mixed repository sizes;
- single-package repositories;
- monorepos;
- cross-repository dependency graphs;
- several languages;
- several package managers;
- generated source;
- malformed source;
- unsupported targets;
- inaccessible targets;
- stale targets;
- repositories with no findings;
- repositories with many findings;
- repositories with broken baselines.

The distribution used must be reported precisely.

---

## 16. Dataset profiles

A dataset profile should identify:

- dataset ID;
- dataset version;
- source;
- ownership;
- authorization;
- synthetic or real status;
- tenant;
- repository count;
- file count;
- symbol count;
- evidence-edge count;
- language distribution;
- size distribution;
- sensitive-data classification;
- expected findings;
- expected failures;
- retention;
- cleanup.

Dataset identity must remain stable across comparable benchmark runs.

---

## 17. Synthetic datasets

Synthetic datasets should be preferred for:

- hostile-input tests;
- tenant-isolation tests;
- large-volume tests;
- deterministic correctness tests;
- failure-injection tests;
- secret-canary tests;
- prohibited-target tests;
- publication-concurrency tests.

Synthetic datasets must still vary:

- names;
- paths;
- formatting;
- repository structure;
- package structure;
- graph structure;
- failure placement;
- target ordering.

Production behavior must not contain fixture-specific branches.

---

## 18. Real repository datasets

Real repository datasets may be used only when explicitly authorized.

The dataset record should identify:

- canonical repositories;
- immutable revisions;
- permitted operations;
- data retention;
- credential capabilities;
- publication prohibition or permission;
- cleanup;
- confidentiality;
- expected source volume.

Historical repository access does not constitute current authorization.

A repository excluded for the requested target role must never be included for
that role.

---

## 19. Correctness oracle

Every scale test requires a correctness oracle.

The oracle may use:

- expected synthetic findings;
- known references;
- known live symbols;
- known dead candidates;
- known unsupported scopes;
- expected access denials;
- expected failures;
- expected coverage statuses;
- expected audit events;
- expected changed-file sets;
- expected publication rejections.

Performance without a correctness oracle is insufficient.

---

## 20. Baseline measurements

Before increasing load, Phase 10 should record a low-concurrency baseline.

The baseline should include:

- throughput;
- latency;
- queue delay;
- worker startup time;
- source-acquisition time;
- analysis time;
- coverage-aggregation time;
- database time;
- artifact-write time;
- audit-write time;
- cleanup time;
- CPU;
- memory;
- disk;
- network;
- provider requests;
- cost;
- correctness result.

Later measurements should be compared against the same workload identity where
practical.

---

## 21. Service-level objectives

Scale tests should use explicit service-level objectives or acceptance
thresholds.

Applicable objectives may include:

- maximum queue delay;
- maximum job latency;
- minimum throughput;
- maximum error rate;
- maximum retry rate;
- maximum duplicate rate;
- maximum cleanup delay;
- maximum stale-lease duration;
- maximum database contention;
- maximum artifact-write latency;
- maximum audit lag;
- maximum cost per target;
- maximum tenant-fairness deviation.

Values must be defined in the authorized Phase 10 test plan.

This roadmap does not invent universal performance thresholds.

---

## 22. Correctness under concurrency

Concurrent execution must not change semantic results.

Equivalent inputs should preserve:

- repository inventory;
- symbol inventory;
- evidence records;
- coverage results;
- classification outcomes;
- explanation ordering where deterministic ordering is required;
- patch contents;
- audit identities;
- failure statuses.

Concurrency must not create or remove findings nondeterministically.

---

## 23. Deterministic ordering

Where output order is observable, DCAv2 should define deterministic ordering for
applicable:

- repositories;
- packages;
- files;
- symbols;
- evidence;
- findings;
- coverage dimensions;
- changed files;
- report sections.

Worker-completion order must not alter semantic output.

---

## 24. Queue throughput

Queue tests should measure:

- enqueue rate;
- dequeue rate;
- queue depth;
- lease rate;
- acknowledgement rate;
- retry rate;
- cancellation rate;
- stale-job rate;
- queue-recovery time;
- tenant fairness;
- provider-specific blocking.

High enqueue throughput is not useful when downstream safety controls are
bypassed or failures are hidden.

---

## 25. Backpressure

The control plane should apply backpressure before overload causes:

- lost work;
- excessive retries;
- database collapse;
- artifact-storage exhaustion;
- provider-rate-limit violations;
- worker thrashing;
- uncontrolled cost;
- audit lag;
- cleanup failure.

Backpressure behavior should be explicit and measurable.

---

## 26. Admission control

Admission control should evaluate applicable:

- campaign authorization;
- target count;
- current queue depth;
- worker capacity;
- database capacity;
- storage capacity;
- provider allowance;
- cost budget;
- tenant quota;
- capability status;
- security state.

A campaign that exceeds safe capacity should be delayed, reduced, or rejected
rather than accepted optimistically.

---

## 27. Job leasing at scale

Lease tests should validate:

- single ownership;
- heartbeat renewal;
- lease expiration;
- worker crash;
- controller restart;
- delayed result;
- duplicate worker attempt;
- clock skew handling;
- cancellation;
- security stop;
- credential revocation.

Load must not create duplicate external side effects.

---

## 28. Retry behavior at scale

Retry testing should measure:

- retry volume;
- retry amplification;
- backoff effectiveness;
- provider-rate-limit interaction;
- database impact;
- queue impact;
- duplicate prevention;
- authorization revalidation;
- policy revalidation;
- cleanup prerequisites.

A transient external outage must not cause an uncontrolled retry storm.

---

## 29. Idempotency at scale

Idempotency should be validated for applicable:

- inventory operations;
- source acquisition;
- semantic-index generation;
- finding creation;
- disposition recording;
- remediation attempts;
- patch creation;
- branch creation;
- draft pull-request creation;
- cleanup.

High concurrency must not produce duplicate branches, duplicate pull requests,
or conflicting authoritative records.

---

## 30. Worker-pool scaling

Worker-pool tests should measure:

- worker startup rate;
- worker readiness time;
- maximum stable worker count;
- scheduling delay;
- resource contention;
- failure rate;
- image-pull behavior;
- credential issuance;
- cleanup;
- scale-down behavior.

Workers must not retain credentials or workspaces after completion.

---

## 31. Runner startup

Runner startup measurements should include:

- image resolution;
- image verification;
- workspace creation;
- source mount preparation;
- dependency-cache preparation;
- credential injection;
- network-policy application;
- resource-limit application;
- command readiness.

A faster startup path must not skip security controls.

---

## 32. Runner cleanup

Runner cleanup tests should validate removal of applicable:

- processes;
- subprocesses;
- temporary workspaces;
- source snapshots where retention is not authorized;
- dependency caches where job-scoped;
- temporary credentials;
- registry configuration;
- test services;
- sockets;
- temporary artifacts;
- environment files.

Cleanup backlog must remain observable under load.

---

## 33. Long-running jobs

Long-running jobs may include:

- large monorepo analysis;
- cross-repository indexing;
- contract analysis;
- runtime collection;
- endurance campaigns.

The system should define:

- heartbeat behavior;
- lease renewal;
- progress reporting;
- output limits;
- checkpoint behavior where supported;
- cancellation;
- timeout;
- cleanup;
- retry safety.

A long runtime must not justify unbounded authorization or resource use.

---

## 34. Database capacity

Database tests should measure applicable:

- transaction throughput;
- write latency;
- read latency;
- index performance;
- lock contention;
- connection-pool behavior;
- migration impact;
- projection lag;
- audit-write throughput;
- storage growth;
- vacuum or maintenance behavior;
- recovery time.

Database performance tests must preserve correctness and transaction boundaries.

---

## 35. Database contention

Contention tests should cover concurrent:

- campaign updates;
- work-item leasing;
- heartbeat writes;
- evidence ingestion;
- coverage aggregation;
- finding creation;
- audit writes;
- retry updates;
- cancellation;
- report generation.

Contention must not cause:

- duplicate leases;
- lost audit events;
- stale authorization use;
- incorrect terminal states;
- cross-tenant data exposure.

---

## 36. Connection-pool behavior

Connection-pool tests should validate:

- maximum pool size;
- wait behavior;
- timeout behavior;
- transaction cleanup;
- connection leak detection;
- worker failure;
- database failover;
- controller restart;
- tenant fairness.

Connection exhaustion must trigger bounded backpressure rather than uncontrolled
failure.

---

## 37. Migration validation at scale

Scale-related migrations should be tested against:

- empty databases;
- small historical datasets;
- large synthetic historical datasets;
- partial campaign state;
- active-looking stale leases;
- large evidence tables;
- large audit tables;
- multiple tenants;
- failed migration;
- retry;
- rollback behavior where supported;
- projection rebuild.

Existing migrations must not be rewritten.

A migration must not be declared safe solely because it succeeds on an empty
database.

---

## 38. Audit capacity

Audit tests should measure:

- event-write throughput;
- event size;
- verification cost;
- chain or integrity-check cost;
- projection lag;
- retention growth;
- query performance;
- incident-stop behavior;
- recovery behavior.

Audit throughput must not be improved by dropping required events.

---

## 39. Audit integrity under load

Under concurrency, DCAv2 must preserve:

- event ordering semantics;
- event attribution;
- tenant identity;
- campaign identity;
- work-item identity;
- actor identity;
- authorization identity;
- integrity linkage;
- failure events;
- cleanup events.

An overloaded audit subsystem must stop sensitive work rather than silently lose
history.

---

## 40. Artifact-storage capacity

Artifact tests should measure applicable:

- write throughput;
- read throughput;
- artifact size;
- artifact count;
- retention;
- integrity validation;
- deduplication;
- tenant isolation;
- cleanup;
- unavailable storage;
- partial write;
- corrupted object;
- stale reference.

Artifacts may include:

- semantic indexes;
- bounded logs;
- test outputs;
- patches;
- generated contracts;
- candidate packages;
- reports.

---

## 41. Artifact size limits

Every artifact type should have a defined maximum size.

Oversized artifacts should produce:

- bounded rejection;
- partial status where valid;
- explicit coverage impact;
- cleanup;
- audit event.

An oversized tool output must not exhaust controller or database memory.

---

## 42. Artifact integrity

Artifact integrity tests should validate:

- digest calculation;
- digest verification;
- content-addressed identity where used;
- partial-upload rejection;
- corrupted-download rejection;
- cross-tenant access rejection;
- stale-artifact invalidation;
- cleanup safety.

An artifact reference without verified content identity must not satisfy a
required evidence or gate input.

---

## 43. Provider API scale

Provider tests should measure:

- metadata request rate;
- source-acquisition rate;
- pagination;
- rate limits;
- retries;
- secondary limits;
- credential scope;
- provider outage;
- partial responses;
- response-size limits;
- reconciliation.

Scale testing must respect provider terms and authorized rate boundaries.

---

## 44. Registry scale

Registry tests may include authorized:

- package metadata reads;
- package downloads;
- schema metadata reads;
- artifact metadata reads;
- cache behavior;
- rate limits;
- credential scope;
- partial responses;
- unavailable registry;
- private package isolation.

Scale testing must not publish packages, schemas, or artifacts unless separately
authorized.

---

## 45. External dependency failures

External failure tests should include applicable:

- provider unavailable;
- registry unavailable;
- telemetry system unavailable;
- artifact storage unavailable;
- database unavailable;
- queue unavailable;
- network partition;
- DNS failure;
- credential service unavailable;
- time service anomaly.

Each failure must preserve explicit status and retry safety.

---

## 46. Partial outage behavior

A partial outage may affect:

- one provider;
- one tenant;
- one repository;
- one worker pool;
- one database replica;
- one artifact bucket;
- one registry;
- one telemetry source.

The control plane should isolate the affected scope where possible.

Unrelated safe work may continue only when isolation and audit remain intact.

---

## 47. Controller restart

Restart tests should validate recovery of:

- campaigns;
- work items;
- leases;
- retries;
- budgets;
- policy decisions;
- review queues;
- remediation requests;
- publication requests;
- cleanup tasks;
- security incidents.

Restart must not re-execute completed external side effects.

---

## 48. Worker restart

Worker restart tests should validate:

- lease expiration;
- result rejection after lease loss;
- workspace cleanup;
- credential revocation;
- retry eligibility;
- partial artifact handling;
- external-state reconciliation.

A restarted worker must not assume ownership of its previous job without a new
valid lease.

---

## 49. Database restart and failover

Database recovery tests should validate:

- connection recovery;
- transaction outcome;
- lease consistency;
- audit consistency;
- idempotency records;
- queue state;
- campaign state;
- projection recovery;
- stale-read handling.

Unknown transaction outcome must trigger reconciliation rather than blind retry.

---

## 50. Queue restart

Queue recovery tests should validate:

- message durability;
- duplicate delivery;
- ordering assumptions;
- lease recovery;
- cancellation state;
- retry state;
- tenant scope;
- poison-message handling.

Queue redelivery must not create duplicate authoritative records or external
effects.

---

## 51. Failure injection

Failure injection should be bounded and authorized.

Potential injections include:

- worker termination;
- controller restart;
- database connection loss;
- queue delay;
- artifact write failure;
- provider rate limit;
- registry timeout;
- malformed analyzer output;
- partial semantic index;
- cleanup failure;
- clock skew;
- network latency;
- disk exhaustion;
- memory pressure.

Destructive production chaos is outside the default scope.

---

## 52. Failure-injection identity

Every failure-injection test should bind:

- test ID;
- environment;
- target component;
- injection method;
- start time;
- duration;
- expected effect;
- abort threshold;
- recovery expectation;
- cleanup;
- observed result.

Unrecorded ad hoc failure injection must not be used for acceptance claims.

---

## 53. Endurance testing

Endurance tests should validate behavior over a bounded extended duration.

They should measure:

- memory growth;
- connection growth;
- file-descriptor growth;
- queue growth;
- artifact growth;
- audit growth;
- retry accumulation;
- cleanup backlog;
- stale leases;
- worker churn;
- database maintenance;
- cost growth;
- correctness drift.

The authorized duration must be explicit.

---

## 54. Memory and resource leaks

Leak detection should consider:

- controller processes;
- worker processes;
- runner supervisors;
- database connections;
- queue consumers;
- artifact clients;
- provider clients;
- temporary files;
- mounted workspaces;
- background processes.

Resource growth must be correlated with workload and cleanup behavior.

---

## 55. Multi-tenant scale

Multi-tenant tests should validate concurrent:

- campaign creation;
- target resolution;
- analysis;
- evidence ingestion;
- human review;
- remediation preparation;
- reporting;
- cleanup.

The tests must verify that load from one tenant does not expose or corrupt
another tenant's:

- targets;
- credentials;
- work items;
- evidence;
- findings;
- budgets;
- reports;
- artifacts;
- audit events.

---

## 56. Noisy-neighbor behavior

A high-load tenant must not:

- monopolize all workers;
- exhaust all database connections;
- exhaust shared storage;
- consume another tenant's provider budget;
- delay security-critical cleanup indefinitely;
- view another tenant's capacity data;
- receive another tenant's results.

Fairness and quota behavior should be measured.

---

## 57. Tenant isolation under failure

Tenant isolation tests should include:

- worker crash;
- queue redelivery;
- database failover;
- cache corruption;
- artifact-reference collision;
- idempotency-key collision;
- provider credential error;
- cleanup failure.

Failure conditions must not weaken tenant boundaries.

---

## 58. Security controls under load

Security tests should validate that load does not disable or bypass:

- repository-access policy;
- prohibited-repository checks;
- credential scoping;
- network policies;
- runner isolation;
- output bounds;
- path validation;
- tenant isolation;
- secret redaction;
- audit recording;
- publication validation;
- default-branch rejection.

Security checks must not be skipped as an optimization.

---

## 59. Prompt-injection resistance under load

Large volumes of untrusted content must not cause instructions in:

- source files;
- documentation;
- repository metadata;
- analyzer output;
- contract descriptions;
- logs;
- traces;
- resource labels;
- error messages;

to alter:

- campaign scope;
- policy;
- authorization;
- credentials;
- network access;
- workflow definitions;
- classification semantics;
- remediation authority;
- publication authority;
- reporting truthfulness.

Adversarial-content volume should be part of scale testing.

---

## 60. Secret handling under load

Secret-handling tests should verify:

- redaction throughput;
- bounded failure behavior;
- no secret values in queue payloads;
- no secret values in audit events;
- no secret values in reports;
- no secret values in patches;
- no secret values in artifact names;
- no cross-tenant credential reuse;
- credential revocation at scale;
- cleanup of temporary credential files.

A redaction backlog or failure must stop sensitive export or publication.

---

## 61. Classification determinism at scale

Repeated runs over identical inputs should produce the same applicable:

- symbol identities;
- evidence digests;
- coverage digests;
- classifications;
- explanations;
- finding IDs;
- remediation eligibility;
- patch hashes.

Differences must be investigated and categorized.

Nondeterministic completion order must not change semantic results.

---

## 62. Staleness propagation

Scale tests should validate that changes to applicable:

- repository commit;
- package graph;
- contract version;
- deployment mapping;
- runtime evidence;
- policy;
- authorization;
- capability version;
- tool version;

invalidate dependent:

- evidence;
- coverage;
- classification;
- disposition eligibility;
- remediation eligibility;
- publication eligibility.

Staleness propagation must remain bounded and complete.

---

## 63. Large invalidation events

A single upstream change may invalidate many downstream records.

Tests should measure:

- invalidation latency;
- database load;
- queue load;
- affected target count;
- duplicate suppression;
- partial failure;
- retry behavior;
- report correctness.

The system must not continue using stale downstream authorization during an
invalidation backlog.

---

## 64. Human-review scale

Human-review queue tests should measure:

- queue size;
- prioritization;
- explanation generation;
- stale finding removal;
- decision attribution;
- duplicate finding suppression;
- tenant isolation;
- report size;
- review latency as operational metadata.

Scale must not reduce explanation quality or hide uncertainty.

---

## 65. Remediation preparation at scale

Remediation-preparation tests should verify that every attempt retains:

- exact finding identity;
- current source commit;
- current evidence digest;
- current coverage digest;
- current disposition;
- current authorization;
- transformation identity;
- changed-file scope;
- required gates.

Batch volume must not cause reuse of one finding's authorization for another
finding.

---

## 66. Publication concurrency

Publisher-concurrency tests should validate:

- repository-specific serialization;
- idempotent branch creation;
- idempotent draft pull-request creation;
- duplicate request handling;
- conflicting patch rejection;
- stale base-commit rejection;
- prohibited-repository rejection;
- default-branch rejection;
- credential isolation;
- provider-rate-limit handling;
- unknown external-state reconciliation.

The publisher must remain unable to merge or mark pull requests ready
automatically.

---

## 67. Publication test safety

Publication scale tests should prefer:

- local provider emulators;
- mocked provider APIs;
- isolated test organizations;
- dedicated test repositories;
- synthetic patches;
- draft-only requests.

Live provider testing requires explicit authorization.

A repository excluded for the requested target role must never be used for that
role.

---

## 68. Cost measurement

Cost measurements should identify applicable:

- compute cost;
- database cost;
- storage cost;
- network cost;
- provider API cost;
- telemetry-query cost;
- test-environment cost;
- artifact-retention cost;
- model or inference cost where applicable;
- operator-review cost as a separate estimate.

Estimated and actual costs must remain distinct.

---

## 69. Unit cost

Useful unit-cost measurements may include:

- cost per repository qualified;
- cost per million source lines analyzed;
- cost per million symbols;
- cost per million evidence edges;
- cost per campaign;
- cost per finding;
- cost per verified remediation attempt;
- cost per retained artifact;
- cost per runtime observation window.

Unit costs must include the workload and environment profile.

---

## 70. Cost-stop behavior

Cost controls should stop or pause work when:

- campaign cost limit is reached;
- tenant cost limit is reached;
- test-environment lifetime is exceeded;
- provider usage exceeds authorization;
- unexpected cost growth occurs;
- unit cost exceeds the test-plan threshold.

Cost-stop behavior must preserve cleanup and audit.

---

## 71. Observability

Phase 10 should validate observability for applicable:

- campaigns;
- work items;
- queues;
- leases;
- workers;
- runners;
- databases;
- artifact storage;
- provider clients;
- publishers;
- cleanup;
- security incidents.

Observability must remain tenant-safe and secret-free.

---

## 72. Operational metrics

Operational metrics may include:

- queue depth;
- queue delay;
- job latency;
- job throughput;
- worker utilization;
- worker startup time;
- retry count;
- lease expiration count;
- cleanup backlog;
- database latency;
- connection-pool use;
- artifact latency;
- audit lag;
- provider-rate-limit events;
- cost;
- failure rate.

Metric labels must be bounded to avoid uncontrolled cardinality.

---

## 73. Logs and traces

Control-plane logs and traces should preserve:

- campaign identity;
- work-item identity;
- capability identity;
- target identity through bounded internal IDs;
- state transition;
- error category;
- duration;
- retry identity.

They must not expose:

- credentials;
- full source;
- customer data;
- unrestricted repository names across tenant boundaries;
- secret-bearing URLs;
- unbounded tool output.

---

## 74. Alerting

Phase 10 should validate alerts for conditions such as:

- queue backlog;
- lease churn;
- retry storm;
- database saturation;
- artifact-storage failure;
- audit lag;
- cleanup backlog;
- provider-rate-limit exhaustion;
- cost threshold;
- tenant-isolation failure;
- publisher anomaly;
- prohibited-repository access attempt;
- credential exposure.

Alerts do not authorize corrective external operations automatically.

---

## 75. Capacity model

The capacity model should identify relationships among:

- target volume;
- repository size;
- symbol volume;
- evidence volume;
- worker count;
- queue depth;
- database capacity;
- storage capacity;
- provider allowance;
- analysis duration;
- cost.

The model should include:

- assumptions;
- measured points;
- extrapolation boundaries;
- bottlenecks;
- confidence;
- known nonlinear behavior.

Extrapolation must be labeled clearly.

---

## 76. Bottleneck analysis

Bottlenecks may include:

- provider source acquisition;
- dependency installation;
- semantic indexing;
- analyzer CPU;
- analyzer memory;
- database writes;
- database indexes;
- coverage aggregation;
- artifact storage;
- audit writes;
- queue leasing;
- worker startup;
- publisher API calls;
- cleanup.

The report should identify the first observed bottleneck for each tested
workload.

---

## 77. Capacity tiers

Phase 10 may define bounded capacity tiers such as:

- development;
- small;
- medium;
- large;
- tested maximum.

Each tier should identify actual:

- environment profile;
- target limits;
- concurrency limits;
- duration;
- storage;
- provider assumptions;
- expected latency;
- cost;
- capability limitations.

Tier names alone must not imply industry-standard scale.

---

## 78. Safe operating envelope

The safe operating envelope should identify:

- validated workloads;
- validated maximum concurrency;
- validated queue depth;
- validated database volume;
- validated artifact volume;
- validated provider request rate;
- validated campaign duration;
- validated tenant count;
- validated cost range;
- required backpressure thresholds;
- required admission-control thresholds.

Operating outside the envelope should produce a warning, rejection, or reduced
capability status.

---

## 79. Degradation modes

The system should define safe degradation for applicable overload conditions.

Possible responses include:

- reject new campaigns;
- delay low-priority work;
- reduce worker concurrency;
- pause provider operations;
- stop artifact-heavy work;
- preserve security and cleanup work;
- mark coverage partial;
- extend retry backoff;
- stop publication requests;
- trigger emergency stop.

Degradation must not convert failures into successful absence evidence.

---

## 80. Scale-validation statuses

A scale-validation result should use statuses such as:

- `validated_within_profile`;
- `validated_with_limitations`;
- `partially_validated`;
- `not_validated`;
- `failed`;
- `blocked`;
- `security_blocked`;
- `cost_blocked`;
- `environment_blocked`;
- `stale`.

`Validated_within_profile` must always reference the exact workload and
environment profile.

---

## 81. Capability scale status

Each tested capability should retain an independent scale status.

Examples include:

- TypeScript analysis validated within one profile;
- Python analysis not validated;
- cross-repository analysis partially validated;
- runtime collection blocked;
- campaign orchestration validated with limitations;
- publication concurrency validated only against a provider emulator.

One successful capability must not upgrade unrelated capabilities.

---

## 82. Phase 10 test manifest

Phase 10 should receive a dedicated test manifest such as:

`codex/tests/phase-10-tests.yaml`

If introduced, the file must conform to:

`codex/tests/phase-test-manifest.schema.json`

The manifest must identify concrete required and conditional test IDs.

The phrase `run scale tests` is insufficient.

---

## 83. Minimum workload-profile tests

Workload-profile tests should cover:

- many small repositories;
- fewer large repositories;
- mixed repository sizes;
- monorepos;
- cross-repository graphs;
- supported languages;
- unsupported languages;
- supported package managers;
- malformed repositories;
- inaccessible repositories;
- stale repositories;
- no-finding repositories;
- high-finding repositories;
- deterministic dataset identity.

---

## 84. Minimum correctness-under-load tests

Correctness tests should verify under increasing concurrency:

- repository identities remain exact;
- symbol identities remain exact;
- evidence is not lost;
- coverage is not inflated;
- failed analyzers remain failed;
- classifications remain deterministic;
- explanations remain bounded;
- finding IDs remain stable;
- tenant data remains isolated;
- audit events remain complete;
- cleanup completes.

---

## 85. Minimum queue tests

Queue tests should cover:

- sustained enqueue;
- burst enqueue;
- backpressure;
- priority;
- fairness;
- queue restart;
- duplicate delivery;
- poison message;
- stale work item;
- cancellation backlog;
- tenant quota;
- provider-specific throttling;
- queue saturation;
- recovery after saturation.

---

## 86. Minimum lease tests

Lease tests should cover:

- high lease rate;
- duplicate lease contention;
- heartbeat load;
- worker crash;
- expired lease;
- late result;
- controller restart;
- clock skew;
- cancellation;
- authorization revocation;
- security stop;
- external-state reconciliation.

---

## 87. Minimum retry-storm tests

Retry tests should cover:

- provider outage;
- registry outage;
- database timeout;
- artifact-store timeout;
- analyzer deterministic failure;
- cleanup failure;
- rate limit;
- credential outage;
- exponential backoff;
- maximum attempts;
- retry-budget exhaustion;
- successful recovery;
- prevention of duplicate external effects.

---

## 88. Minimum database tests

Database tests should cover:

- concurrent evidence writes;
- concurrent audit writes;
- concurrent leases;
- concurrent campaign updates;
- connection-pool exhaustion;
- lock contention;
- large coverage aggregation;
- large report query;
- database restart;
- transaction ambiguity;
- migration on large synthetic data;
- projection rebuild;
- tenant-isolation query checks.

---

## 89. Minimum audit tests

Audit tests should cover:

- sustained event writes;
- concurrent campaigns;
- event integrity verification;
- audit-storage growth;
- audit query performance;
- failed event write;
- delayed event write;
- controller restart;
- projection lag;
- tamper detection;
- tenant separation;
- security stop on integrity failure.

---

## 90. Minimum artifact tests

Artifact tests should cover:

- many small artifacts;
- fewer large artifacts;
- maximum allowed artifact;
- oversized artifact;
- partial upload;
- corrupted artifact;
- duplicate artifact;
- concurrent reads and writes;
- unavailable storage;
- cleanup backlog;
- retention expiration;
- cross-tenant access attempt;
- integrity verification under load.

---

## 91. Minimum worker and runner tests

Worker tests should cover:

- rapid scale-up;
- sustained concurrency;
- worker crash;
- worker replacement;
- image-pull delay;
- credential issuance load;
- runner startup;
- runner timeout;
- process leak;
- memory leak;
- workspace leak;
- cleanup under load;
- safe scale-down;
- no credential persistence.

---

## 92. Minimum provider tests

Provider tests should cover:

- pagination at scale;
- request throttling;
- rate-limit reset;
- secondary rate limit;
- partial response;
- provider outage;
- source-acquisition concurrency;
- repository rename;
- stale default branch;
- repository target-role denial;
- credential-scope enforcement;
- reconciliation after timeout.

---

## 93. Minimum campaign tests

Campaign tests should cover:

- many small campaigns;
- one large campaign;
- mixed campaign priorities;
- concurrent tenants;
- campaign pause;
- campaign resume;
- campaign cancel;
- authorization expiration;
- policy change;
- budget exhaustion;
- stale target invalidation;
- human-review backlog;
- remediation-request backlog;
- campaign report generation.

---

## 94. Minimum endurance tests

Endurance tests should cover:

- sustained queue traffic;
- sustained evidence ingestion;
- sustained audit writes;
- repeated worker churn;
- periodic provider throttling;
- periodic database reconnect;
- artifact retention growth;
- cleanup cycles;
- memory growth;
- connection growth;
- stale-lease accumulation;
- cost accumulation;
- final cleanup.

---

## 95. Minimum failure-injection tests

Failure-injection tests should cover:

- controller restart;
- worker termination;
- queue delay;
- queue restart;
- database connection loss;
- artifact write failure;
- disk pressure;
- memory pressure;
- provider timeout;
- registry timeout;
- malformed analyzer result;
- clock skew;
- cleanup failure;
- audit failure;
- safe recovery.

---

## 96. Minimum multi-tenant tests

Multi-tenant tests should cover:

- simultaneous campaigns;
- overlapping display names;
- identical repository names under different tenants;
- identical idempotency input shapes;
- queue contention;
- database contention;
- artifact-reference collision;
- cache collision;
- provider credential separation;
- budget separation;
- report separation;
- audit separation;
- failure isolation;
- noisy-neighbor throttling.

---

## 97. Minimum security-under-load tests

Security tests should cover:

- prohibited-repository attempts at volume;
- cross-tenant access attempts at volume;
- path traversal attempts;
- oversized output attacks;
- prompt-injection content at volume;
- synthetic secret canaries;
- credential-revocation load;
- network-policy enforcement;
- Docker-socket denial;
- cloud-metadata denial;
- publisher-credential isolation;
- audit-integrity enforcement;
- emergency stop under load.

---

## 98. Minimum classification-determinism tests

Determinism tests should cover:

- repeated identical workloads;
- different worker counts;
- different completion orders;
- different queue ordering;
- controller restart;
- worker restart;
- retry;
- database failover;
- input-order variation;
- report regeneration;
- patch regeneration;
- unchanged evidence and coverage digests.

---

## 99. Minimum publication-concurrency tests

Publication tests should cover:

- several repositories;
- repeated request for one patch;
- conflicting patches for one repository;
- stale base commit;
- repository excluded for the requested target role;
- default-branch rejection;
- draft-only pull requests;
- provider rate limit;
- provider timeout after branch creation;
- unknown pull-request state;
- idempotent retry;
- publisher restart;
- publisher credential isolation;
- no merge capability.

Live provider tests require separate authorization.

---

## 100. Minimum cost tests

Cost tests should cover:

- per-job accounting;
- per-campaign accounting;
- per-tenant accounting;
- compute growth;
- storage growth;
- telemetry-query growth;
- provider request growth;
- estimated versus actual cost;
- soft threshold;
- hard threshold;
- pause at threshold;
- cleanup after cost stop;
- budget increase requiring authorization.

---

## 101. Minimum migration tests

Migration tests should cover:

- fresh database;
- upgrade from Phase 9;
- small historical dataset;
- large synthetic historical dataset;
- active campaigns;
- stale leases;
- retry records;
- large evidence tables;
- large audit tables;
- artifact metadata;
- multiple tenants;
- failed migration;
- retry;
- projection rebuild;
- audit preservation.

---

## 102. Fixture strategy

Phase 10 should use fixtures and synthetic generators representing:

- varied repository sizes;
- varied package counts;
- varied file counts;
- varied symbol counts;
- varied dependency-graph density;
- varied contract sizes;
- varied runtime-observation volume;
- varied failure rates;
- malformed inputs;
- inaccessible targets;
- prohibited targets;
- adversarial metadata;
- synthetic secrets;
- concurrent tenants;
- long-running jobs;
- publication requests;
- alternate names and layouts.

Production behavior must not contain fixture-specific branches.

---

## 103. External-system testing

Every external provider, registry, telemetry, or publication scale test requires
explicit authorization.

The authorization must identify:

- canonical external system;
- environment;
- permitted operations;
- request limits;
- concurrency limits;
- credential capability;
- test duration;
- cost limit;
- data classification;
- cleanup;
- production prohibition or permission;
- required test IDs.

Historical access does not constitute current authorization.

---

## 104. Performance optimization policy

Performance optimizations must not weaken correctness or safety.

An optimization must not:

- skip required evidence;
- skip required coverage;
- suppress failed targets;
- cache stale authorization indefinitely;
- skip prohibited-repository checks;
- weaken tenant isolation;
- expose broader credentials;
- skip audit events;
- bypass structured result validation;
- reduce changed-file validation;
- bypass publisher validation.

Every material optimization should have correctness and regression tests.

---

## 105. Caching policy at scale

Scale-related caches may include:

- repository metadata;
- Git objects;
- dependency artifacts;
- semantic indexes;
- qualification results;
- evidence;
- coverage;
- tool artifacts;
- generated contracts.

Every cache must define:

- key;
- tenant scope;
- repository scope;
- source-revision scope;
- capability version;
- policy scope;
- authorization sensitivity;
- integrity validation;
- freshness;
- invalidation;
- retention;
- poisoning response.

A cache hit must not bypass current policy or authorization evaluation.

---

## 106. Cache invalidation

Cache invalidation tests should cover changes to:

- source commit;
- package manifest;
- lockfile;
- tool version;
- adapter version;
- configuration;
- policy;
- authorization;
- repository universe;
- consumer set;
- contract version;
- deployment mapping;
- observation window.

Stale cache entries must not satisfy current remediation or publication
requirements.

---

## 107. Scale acceptance criteria

A tested workload profile may become `validated_within_profile` only when:

1. The benchmark environment is exact.
2. The dataset identity is exact.
3. The workload identity is exact.
4. The correctness oracle passes.
5. Required evidence is preserved.
6. Required coverage is preserved.
7. Classification remains deterministic.
8. Failures remain visible.
9. Tenant isolation passes.
10. Repository policy passes.
11. Prohibited-repository protection passes.
12. Credential isolation passes.
13. Queue ownership remains safe.
14. Lease behavior remains safe.
15. Retries remain bounded and idempotent.
16. Resource limits remain enforced.
17. Cost limits remain enforced.
18. Audit integrity remains complete.
19. Cleanup completes.
20. Tested limits and limitations are recorded precisely.

---

## 108. Control-plane scale acceptance criteria

Control-plane scale may become `validated_within_profile` only when:

1. Campaign creation remains deterministic.
2. Scope resolution remains exact.
3. Policy evaluation remains current.
4. Queue backpressure functions.
5. Tenant fairness functions.
6. Lease ownership remains unique.
7. Late results are rejected.
8. Retry storms are prevented.
9. Cancellation stops new work.
10. Security stop works under load.
11. Database contention does not corrupt state.
12. Queue restart does not duplicate authoritative effects.
13. Audit history remains complete.
14. Cost and resource budgets remain enforced.
15. Recovery behavior passes required tests.

---

## 109. Analysis scale acceptance criteria

A language or repository analysis capability may become
`validated_within_profile` only when:

1. The underlying functional capability is already accepted.
2. Source and symbol identities remain exact.
3. Evidence records are not lost.
4. Analyzer failures remain explicit.
5. Coverage does not become falsely complete.
6. Classification outcomes match the correctness oracle.
7. Results remain deterministic across worker counts.
8. Artifact limits are enforced.
9. Resource limits are enforced.
10. Tested repository, file, symbol, and edge limits are recorded.

---

## 110. Cross-repository scale acceptance criteria

Cross-repository analysis may become `validated_within_profile` only when:

1. Repository inventory remains complete for the tested universe.
2. Pagination remains complete.
3. Rate limits are respected.
4. Snapshot sets remain exact.
5. Repository failures remain visible.
6. Consumer sets remain deterministic.
7. Semantic indexes remain attributable.
8. Coverage remains open-world and truthful.
9. Tenant and repository isolation pass.
10. Tested repository and graph limits are recorded.

---

## 111. Campaign scale acceptance criteria

Campaign orchestration may become `validated_within_profile` only when:

1. Target sets remain immutable per scope version.
2. Work-item identities remain deterministic.
3. Duplicate work is suppressed safely.
4. Distinct work is not incorrectly deduplicated.
5. Priorities do not bypass authorization.
6. Fairness prevents starvation within the tested profile.
7. Budgets stop or pause work correctly.
8. Human-review records remain exact.
9. Remediation authorization remains finding-specific.
10. Publication remains separately authorized and draft-only.
11. Campaign reports preserve failed and inaccessible targets.
12. Tested campaign and work-item limits are recorded.

---

## 112. Publisher scale acceptance criteria

Publisher concurrency may become `validated_within_profile` only when:

1. Publisher credentials remain isolated.
2. Repository-specific serialization works.
3. Exact base commits are enforced.
4. Exact patch hashes are enforced.
5. Repository target-role exclusions are enforced.
6. Default-branch direct push is rejected.
7. Pull requests remain draft-only.
8. Duplicate requests are idempotent.
9. Conflicting requests are rejected.
10. Unknown provider state blocks automatic retry.
11. The publisher cannot merge.
12. Tested request rate and repository count are recorded.

---

## 113. Partially validated outcome

A capability may remain `partially_validated` when, for example:

- correctness passes but endurance testing is incomplete;
- one workload profile passes but larger profiles fail;
- one tenant passes but multi-tenant load is incomplete;
- database scale passes but artifact storage remains limited;
- analysis scale passes but provider acquisition becomes rate-limited;
- campaign orchestration passes but publication concurrency is untested;
- test-environment runtime collection passes but production is unauthorized;
- recovery passes except for one unsupported external-state condition.

The exact unvalidated dimensions must remain explicit.

---

## 114. Failed validation outcome

Scale validation should fail when applicable:

- correctness changes under concurrency;
- evidence is lost;
- coverage becomes falsely complete;
- findings become nondeterministic;
- tenant isolation fails;
- repository boundaries fail;
- prohibited-repository access occurs;
- credentials cross boundaries;
- audit events are lost;
- duplicate external effects occur;
- retries become unbounded;
- cleanup does not complete;
- cost limits are exceeded;
- resource limits are bypassed;
- publisher restrictions fail;
- recovery corrupts authoritative state.

Performance success cannot override a safety or correctness failure.

---

## 115. Blocked outcome

Phase 10 must remain blocked when applicable:

- benchmark environment is not isolated;
- workload profile is undefined;
- correctness oracle is unavailable;
- production access would occur without permission;
- external-system rate limits cannot be respected;
- cost boundaries are undefined;
- tenant isolation cannot be tested;
- audit integrity cannot be measured;
- failure injection cannot be bounded;
- cleanup cannot be guaranteed;
- required capability is not functionally accepted;
- required security control is unavailable;
- required test fails or is unavailable;
- authorization expires or is revoked.

A blocked result must identify the exact safe next action.

---

## 116. Phase completion criteria

Phase 10 may be reported complete only when all applicable criteria are
satisfied:

1. The scale-validation plan is versioned.
2. Benchmark environments are identified exactly.
3. Workload profiles are versioned.
4. Dataset profiles are versioned.
5. Correctness oracles are defined.
6. Low-concurrency baselines are recorded.
7. Acceptance thresholds are explicit.
8. Correctness under concurrency is validated.
9. Deterministic output under concurrency is validated.
10. Queue throughput and backpressure are measured.
11. Lease safety is validated.
12. Retry safety is validated.
13. Idempotency is validated.
14. Worker and runner scaling are measured.
15. Cleanup under load is validated.
16. Database capacity is measured.
17. Audit capacity and integrity are validated.
18. Artifact-storage behavior is measured.
19. Provider and registry limits are measured where authorized.
20. Failure isolation is validated.
21. Restart and recovery are validated.
22. Endurance behavior is measured.
23. Multi-tenant isolation is validated.
24. Security controls remain enforced under load.
25. Prompt-injection resistance is validated under load.
26. Secret handling is validated under load.
27. Staleness propagation is validated.
28. Publication concurrency is validated where included.
29. Resource budgets are enforced.
30. Cost budgets are enforced.
31. Observability is sufficient for tested operations.
32. Capacity and bottleneck models are documented.
33. Safe operating envelopes are documented.
34. Required database migrations pass.
35. Required Phase 10 tests pass.
36. Triggered conditional tests pass.
37. Capability statuses are updated truthfully.
38. Security-control matrix is updated.
39. Phase report is complete.
40. Execution state is updated.
41. No unresolved correctness or safety failure contradicts completion.

Completion validates only the exact tested profiles.

---

## 117. Phase report

The Phase 10 completion report should include:

- authorization identity;
- objective;
- source commit before and after;
- files changed;
- migrations;
- dependencies;
- benchmark environment;
- workload profiles;
- dataset profiles;
- correctness oracles;
- baseline measurements;
- throughput;
- latency;
- queue delay;
- worker counts;
- runner startup and cleanup;
- database measurements;
- audit measurements;
- artifact-storage measurements;
- provider and registry measurements;
- retry behavior;
- idempotency behavior;
- backpressure behavior;
- fairness behavior;
- restart and recovery results;
- failure-injection results;
- endurance results;
- multi-tenant results;
- security results;
- publication-concurrency results;
- resource use;
- cost;
- bottlenecks;
- safe operating envelope;
- capacity model;
- capability scale statuses;
- tested limits;
- untested limits;
- failed limits;
- limitations;
- blockers;
- cleanup;
- next safe action.

The report must separate:

- measured facts;
- derived calculations;
- estimates;
- extrapolations;
- assumptions.

---

## 118. Tested-limit table

The phase report should include a tested-limit table with applicable fields such
as:

| Dimension | Tested value | Result | Environment | Limitations |
| --- | ---: | --- | --- | --- |
| Repositories | Exact measured value | Status | Environment ID | Boundaries |
| Files | Exact measured value | Status | Environment ID | Boundaries |
| Symbols | Exact measured value | Status | Environment ID | Boundaries |
| Evidence edges | Exact measured value | Status | Environment ID | Boundaries |
| Concurrent workers | Exact measured value | Status | Environment ID | Boundaries |
| Queue depth | Exact measured value | Status | Environment ID | Boundaries |
| Tenants | Exact measured value | Status | Environment ID | Boundaries |
| Campaign duration | Exact measured value | Status | Environment ID | Boundaries |
| Artifact volume | Exact measured value | Status | Environment ID | Boundaries |
| Database size | Exact measured value | Status | Environment ID | Boundaries |

Values must come from actual test results.

---

## 119. Capability-status updates

After Phase 10, capability status should distinguish:

- functional but not scale-validated;
- scale-validated within profile;
- scale-validated with limitations;
- partially scale-validated;
- scale validation failed;
- scale validation blocked;
- stale scale validation.

A functional capability must not be downgraded falsely merely because a larger
unrequired workload failed.

The tested operating boundary must remain attached to the status.

---

## 120. Execution-state handoff

The Phase 10 handoff should identify:

- phase status;
- authorization status;
- source commit;
- worktree state;
- benchmark environments;
- workload profiles;
- dataset profiles;
- validated capabilities;
- partially validated capabilities;
- failed validations;
- blocked validations;
- safe operating envelopes;
- admission-control limits;
- concurrency limits;
- provider limits;
- database limits;
- storage limits;
- cost limits;
- unresolved incidents;
- test manifest;
- test results;
- security-control results;
- migrations;
- external operations;
- retained external state;
- cleanup state;
- next human decision.

The handoff must not authorize additional roadmap work.

---

## 121. Post-roadmap transition

Phase 10 is the final planned roadmap phase in this operating-system structure.

After Phase 10:

1. Finalize the Phase 10 report.
2. Update execution state.
3. Stop Phase 10 implementation.
4. Present actual capability statuses.
5. Present exact tested limits.
6. Present unresolved functional gaps.
7. Present unresolved scale gaps.
8. Present unresolved security gaps.
9. Present operational recommendations.
10. Await explicit human direction.

Possible later work may include:

- maintenance;
- defect correction;
- capability hardening;
- additional language phases;
- additional provider phases;
- additional scale profiles;
- production-readiness reviews;
- security reviews;
- compliance reviews.

None of that work begins automatically.

---

## 122. Phase stop conditions

Work must stop when:

- Phase 10 authorization is inactive;
- authorization expires;
- authorization is revoked;
- tenant, provider, repository, service, environment, or operation scope is
  exceeded;
- an excluded repository target operation is requested;
- production impact becomes possible without explicit permission;
- benchmark isolation fails;
- correctness oracle fails;
- tenant isolation fails;
- repository isolation fails;
- credential isolation fails;
- audit integrity fails;
- duplicate external effects occur;
- queue ownership becomes unsafe;
- retry behavior becomes uncontrolled;
- backpressure fails;
- resource limits cannot be enforced;
- cost limits cannot be enforced;
- external rate limits cannot be respected;
- cleanup backlog exceeds the authorized threshold;
- secret exposure is suspected;
- customer-data exposure is suspected;
- publisher restrictions fail;
- a destructive operation would occur without permission;
- a required test fails and the test plan defines it as blocking;
- external state becomes unknown and cannot be reconciled safely.

Stopping must be recorded truthfully.

---

## 123. Fail-safe behavior

When benchmark identity, workload identity, dataset identity, correctness,
queue state, lease state, retry safety, database state, audit state, artifact
state, tenant isolation, cost, recovery, or external state cannot be
established confidently:

- do not increase load;
- do not admit new campaigns;
- do not add workers;
- do not issue new sensitive credentials;
- do not retry external side effects;
- do not continue publication;
- do not suppress failed targets;
- do not report partial coverage as complete;
- do not report unmeasured limits;
- do not extrapolate without labeling the extrapolation;
- do not claim enterprise scale;
- do not modify production systems;
- do not delete evidence or audit history;
- preserve available results;
- perform only authorized containment and cleanup;
- return an explicit partial, failed, blocked, security-blocked, cost-blocked,
  environment-blocked, or stale result;
- identify the exact missing requirement.

Scale uncertainty must reduce operational authority.

---

## 124. Document integrity

This roadmap file must not be modified during Phase 10 implementation unless
roadmap or governance modification is explicitly authorized.

Changes require:

1. Identification of the Phase 10 planning problem.
2. Review against the roadmap overview.
3. Review against permanent safety invariants.
4. Review of workload and dataset implications.
5. Review of benchmark-environment implications.
6. Review of correctness and determinism implications.
7. Review of queue, lease, retry, and idempotency implications.
8. Review of database, audit, and artifact implications.
9. Review of tenant-isolation and credential implications.
10. Review of provider, cost, and production-impact implications.
11. Review of authorization and testing impact.
12. Updated Phase 10 test manifest where applicable.
13. Updated schemas or capability definitions where applicable.
14. A reviewable governance commit.
15. An ADR when the change alters long-lived scale, capacity, backpressure,
    admission-control, recovery, or operational-limit semantics.

This roadmap must not be weakened to make incorrect results, incomplete
coverage, failed isolation, missing audit history, duplicate external effects,
uncontrolled retries, uncontrolled cost, failed tests, or unvalidated scale
claims appear acceptable.
