# Testing Policy

This document defines how DCAv2 must plan, execute, record, interpret, and report
tests.

Testing must provide reproducible evidence about implemented behavior, failure
handling, security controls, migration compatibility, and capability limits.

A test result describes what was executed in a specific environment against
specific inputs. It does not authorize implementation, remediation,
publication, repository access, credential use, or destructive operations.

This document must be applied together with:

- `codex/core/03-safety-invariants.md`;
- `codex/core/04-accuracy-and-evidence-policy.md`;
- `codex/core/05-phase-authorization-protocol.md`;
- `codex/core/10-reporting-and-state-policy.md`;
- `codex/architecture/capability-definitions.md`;
- `codex/engineering/database-evolution-policy.md`;
- `codex/engineering/structured-command-policy.md`;
- `codex/engineering/runner-security-controls.md`;
- `codex/tests/phase-test-manifest.schema.json`;
- `codex/tests/security-control-matrix.yaml`.

---

## 1. Core principles

Testing must be:

- explicitly scoped;
- attributable;
- reproducible where practical;
- evidence-backed;
- independent of hidden reasoning;
- explicit about environment;
- explicit about fixtures;
- explicit about skipped or unavailable tests;
- explicit about failures;
- explicit about limitations;
- safe for untrusted repositories;
- free of secret values;
- aligned with capability claims.

DCAv2 must never report:

- a skipped test as passed;
- an unavailable test as passed;
- a timed-out test as passed;
- a resource-exceeded test as passed;
- an unexecuted command as successful;
- a partial test run as complete;
- a fixture-specific result as universal support.

---

## 2. Test authority

Tests provide implementation evidence.

Tests do not:

- activate a roadmap phase;
- authorize repository access;
- authorize credential use;
- approve a finding;
- create a human disposition;
- authorize remediation;
- authorize publication;
- override a prohibited repository;
- weaken a permanent safety invariant;
- prove behavior outside the tested scope.

A passing test cannot expand the current authorization.

---

## 3. Test taxonomy

DCAv2 tests should be classified using applicable categories:

- unit;
- component;
- integration;
- contract;
- end-to-end;
- migration;
- security;
- hostile;
- invariant;
- property-based;
- regression;
- compatibility;
- performance;
- scale;
- recovery;
- manual verification.

A test may belong to several categories.

The category must describe what the test actually validates.

---

## 4. Unit tests

Unit tests validate one narrowly scoped component with controlled collaborators.

Appropriate subjects include:

- canonicalization;
- digest generation;
- argument validation;
- path normalization;
- classification-rule precedence;
- coverage aggregation;
- schema validation;
- status mapping;
- redaction;
- idempotency-key generation.

Unit tests must not be used as proof that:

- the real analyzer executes;
- the runner is isolated;
- PostgreSQL permissions are enforced;
- a provider write works;
- a migration upgrades an existing database;
- a complete remediation workflow succeeds.

---

## 5. Component tests

Component tests validate a larger module using real internal behavior and
controlled external boundaries.

Examples include:

- an analyzer adapter using a fixture artifact;
- a coverage engine using persisted evidence;
- a command executor using a synthetic executable;
- a publisher validator using a mocked provider boundary;
- an audit-chain verifier using a test database.

Component tests must clearly identify mocked or simulated boundaries.

Mocked success must not be reported as operational external integration.

---

## 6. Integration tests

Integration tests validate real interactions among applicable components.

Examples include:

- adapter plus actual analyzer executable;
- application plus PostgreSQL;
- migration tool plus an existing schema;
- controller plus runner protocol;
- publisher plus provider sandbox;
- source acquisition plus immutable commit resolution.

Integration tests must identify:

- real components used;
- simulated components;
- credentials used by capability only;
- network dependencies;
- environment;
- cleanup behavior.

---

## 7. Contract tests

Contract tests validate boundaries between components or systems.

Applicable contracts include:

- command request and result schemas;
- analyzer output schemas;
- evidence schemas;
- coverage schemas;
- provider adapter responses;
- publisher request envelopes;
- audit event schemas;
- database projection contracts.

Contract tests should cover:

- supported versions;
- missing required fields;
- unknown fields;
- malformed values;
- incompatible versions;
- oversized payloads;
- invalid encoding;
- stale identity.

A schema file alone does not prove contract compatibility.

---

## 8. End-to-end tests

End-to-end tests validate a complete bounded workflow.

Examples include:

- repository qualification through classification;
- confirmed finding through verified local patch;
- verified patch through draft pull-request publication;
- migration through application startup and projection rebuild.

An end-to-end test must preserve stage-level results.

A final success result must not conceal:

- partial coverage;
- skipped gates;
- mocked publication;
- unverified security controls;
- unavailable infrastructure.

---

## 9. Regression tests

Every corrected defect should receive a regression test when practical.

The regression test should:

- reproduce the original failure;
- fail against the defective behavior;
- pass after the correction;
- remain independent of incidental implementation detail;
- identify the affected capability;
- appear in the applicable test manifest.

A defect is not adequately closed merely because a nearby test passes.

---

## 10. Characterization tests

Characterization tests may be added before changing insufficiently understood
existing behavior.

They should capture applicable:

- accepted inputs;
- outputs;
- state transitions;
- errors;
- side effects;
- authorization checks;
- audit events;
- cleanup behavior.

Characterization tests must not preserve behavior that violates permanent safety
invariants.

Unsafe behavior should instead receive a test asserting the required safe
replacement.

---

## 11. Negative tests

Functional capabilities require negative tests.

Negative tests should verify that the system rejects or safely handles
applicable:

- invalid input;
- stale input;
- unsupported input;
- incomplete coverage;
- positive liveness evidence;
- missing authorization;
- expired authorization;
- wrong tenant;
- prohibited repository;
- unexpected changed files;
- invalid patch hashes;
- malformed analyzer output;
- unsafe paths;
- unavailable tools.

A happy-path test alone cannot establish functional capability status.

---

## 12. Failure tests

Failure behavior must be tested as a first-class contract.

Applicable failures include:

- process failure;
- analyzer crash;
- dependency-installation failure;
- compiler unavailable;
- timeout;
- resource exhaustion;
- malformed output;
- network denial;
- credential denial;
- database failure;
- migration failure;
- provider failure;
- cleanup failure.

The test must verify the resulting status and downstream impact.

A failure test should confirm that the failure does not become successful empty
output.

---

## 13. Unsupported-case tests

Capabilities must test known unsupported cases.

An unsupported-case test should verify that the system:

- detects the unsupported input;
- returns an explicit unsupported status;
- records affected scope;
- reduces coverage appropriately;
- blocks dependent classification or remediation;
- does not fall back silently to weaker behavior.

Explicit non-support is a valid result.

---

## 14. Security tests

Security tests validate specific controls rather than broad claims.

Applicable controls include:

- authorization enforcement;
- prohibited-repository exclusion;
- tenant isolation;
- credential isolation;
- filesystem confinement;
- network denial;
- cloud metadata denial;
- Docker socket denial;
- non-root execution;
- capability dropping;
- Git-hook suppression;
- output bounding;
- secret redaction;
- audit mutation prevention;
- trusted publisher separation.

Every security test must identify the control it validates.

---

## 15. Hostile tests

Hostile tests use intentionally adversarial but non-destructive fixtures.

A hostile fixture may attempt to:

- read synthetic secrets;
- escape the workspace;
- access unrelated repositories;
- access the Docker socket;
- reach unauthorized networks;
- reach cloud metadata;
- leave background processes;
- consume excessive resources;
- emit excessive output;
- create unsafe artifacts;
- exploit symbolic links;
- execute Git hooks;
- inject instructions into diagnostics;
- alter trusted publication inputs.

Hostile tests must use synthetic credentials and safe targets.

---

## 16. Invariant tests

Invariant tests validate permanent behavior across many cases.

Examples include:

- adding positive liveness evidence cannot produce `candidate_dead`;
- removing required coverage cannot improve remediation eligibility;
- changing a patch after verification causes publisher rejection;
- changing input order does not change deterministic classification;
- evidence from one tenant cannot affect another tenant;
- analyzer failure cannot become zero references;
- unavailable required tests cannot produce phase completion;
- prohibited repositories remain inaccessible;
- runner output cannot authorize publication.

Invariant tests should avoid dependence on one fixture name or path.

---

## 17. Property-based tests

Property-based testing should be considered for:

- path normalization;
- canonicalization;
- hashing;
- ordering;
- schema round trips;
- classification precedence;
- coverage aggregation;
- idempotency;
- argument validation;
- tenant scoping.

Generated inputs must remain bounded.

Shrunk failure examples should be preserved as regression cases when useful.

---

## 18. Migration tests

Database changes require applicable migration tests.

The test set should include:

- fresh installation;
- upgrade from the immediately previous schema;
- upgrade from the earliest supported schema;
- realistic historical data;
- nullable legacy data;
- multiple tenants;
- failed migration;
- partial non-transactional state;
- retry;
- forward recovery;
- rollback when supported;
- application compatibility;
- audit-integrity verification;
- permission enforcement;
- projection rebuild.

Testing only against an empty database is insufficient.

---

## 19. Compatibility tests

Compatibility tests should cover applicable:

- supported language versions;
- package-manager versions;
- operating systems;
- architectures;
- database versions;
- provider API versions;
- schema versions;
- old and new application versions;
- runner-image versions;
- tool versions.

Compatibility claims must state the versions actually tested.

Untested versions must remain unsupported or unverified.

---

## 20. Provider tests

External provider tests must distinguish:

- mock tests;
- provider sandbox tests;
- authorized live tests;
- production tests.

Provider tests should cover applicable:

- identity validation;
- authentication;
- authorization;
- rate limits;
- idempotency;
- partial success;
- timeout after write;
- stale base commit;
- branch conflict;
- draft status;
- cleanup;
- reconciliation.

A mock provider response does not prove that a live draft pull request can be
created safely.

---

## 21. Performance tests

Performance tests measure bounded workload behavior.

Record applicable:

- workload;
- fixture;
- hardware;
- operating system;
- runner profile;
- tool versions;
- cache state;
- concurrency;
- duration;
- CPU use;
- peak memory;
- disk use;
- output size;
- database growth;
- request counts;
- variability.

A performance test does not establish functional correctness by itself.

---

## 22. Scale tests

Scale tests validate behavior at representative size.

Applicable dimensions include:

- repositories;
- files;
- symbols;
- packages;
- workspaces;
- evidence items;
- findings;
- tenants;
- concurrent jobs;
- database rows;
- artifact sizes;
- provider requests.

Scale validation must state the tested upper boundary.

It must not imply unlimited enterprise capacity.

A capability may be functional without being scale-validated.

---

## 23. Recovery tests

Recovery tests should validate applicable:

- failed migration recovery;
- interrupted backfill resumption;
- lost provider response reconciliation;
- runner cleanup after timeout;
- process-tree cleanup;
- audit projection rebuild;
- backup restoration;
- stale authorization rejection;
- partial publication handling;
- compromised-runner retirement.

Recovery tests must verify actual state, not only returned status.

---

## 24. Manual verification

Manual verification may be required when automation is not practical.

A manual test record must identify:

- test ID;
- objective;
- procedure;
- environment;
- operator;
- date;
- expected result;
- observed result;
- evidence reference;
- limitations.

Manual verification must not be recorded as automated coverage.

An undocumented visual inspection does not satisfy a required test.

---

## 25. Test identifiers

Every material test should have a stable identifier.

Recommended format:

    <domain>-<capability>-<sequence>

Examples:

    ANALYSIS-TS-001
    COVERAGE-MONOREPO-004
    REMEDIATION-TS-012
    PUBLISHER-GITHUB-007
    SECURITY-RUNNER-015
    DB-MIGRATION-009

Test identifiers should remain stable when implementation paths change.

A materially different test objective requires a new identifier.

---

## 26. Test manifests

Each implementation phase must use a machine-readable test manifest.

A test manifest should identify:

- phase;
- test ID;
- description;
- category;
- capability IDs;
- required or conditional status;
- prerequisites;
- command ID;
- environment;
- fixture;
- expected result;
- security controls;
- timeout;
- evidence artifacts;
- completion impact.

The manifest must conform to:

`codex/tests/phase-test-manifest.schema.json`

---

## 27. Required tests

A required test must pass before the associated phase or capability can be
reported complete.

A required test that is:

- not run;
- skipped;
- unavailable;
- timed out;
- resource exceeded;
- cancelled;
- inconclusive;
- malformed;

blocks completion.

A human may explicitly revise the phase scope or manifest through an authorized
governance change.

Codex must not downgrade a required test merely because it fails.

---

## 28. Conditional tests

A conditional test becomes required when its declared trigger applies.

Examples include:

- framework tests when a framework adapter is changed;
- migration tests when persistence changes;
- publisher tests when external publication changes;
- hostile runner tests when isolation changes;
- license tests when dependencies change;
- monorepo tests when workspace behavior changes.

The phase report must state whether each condition applied and why.

A triggered conditional test must not remain omitted silently.

---

## 29. Optional tests

Optional tests may provide additional evidence but do not determine completion
unless the phase specification says otherwise.

Optional test failure must still be reported when the test was executed.

An optional test must not be represented as required after the fact merely to
justify a preferred conclusion.

---

## 30. Test prerequisites

Every test should identify prerequisites such as:

- operating system;
- architecture;
- Docker;
- PostgreSQL;
- package manager;
- compiler;
- provider sandbox;
- network access;
- credentials by capability;
- fixture repository;
- runtime telemetry;
- specific runner profile.

A missing prerequisite must produce an explicit unavailable or blocked result.

It must not become a pass.

---

## 31. Test environment identity

Every material test result should record applicable:

- source commit;
- test manifest version;
- command ID;
- runner profile;
- image digest;
- operating system;
- architecture;
- runtime versions;
- tool versions;
- database version;
- provider environment;
- configuration digest;
- fixture identity.

Without environment identity, reproducibility and capability claims are limited.

---

## 32. Fixture identity

Every fixture must have a stable identity.

Applicable fields include:

- fixture ID;
- repository identity;
- immutable commit;
- local fixture path;
- language;
- package manager;
- repository shape;
- intended behavior;
- prohibited production hardcoding;
- setup procedure;
- cleanup procedure.

External fixture access requires authorization.

A fixture repository must still pass repository-access and denylist checks.

---

## 33. Fixture independence

Production behavior must not depend on:

- fixture repository name;
- fixture owner;
- fixture commit;
- prepared function name;
- fixed file path;
- expected finding ID;
- test-only environment variable;
- hidden bypass.

Generalization tests should vary names, paths, formatting, and project layout.

A successful single fixture must not be reported as general support.

---

## 34. Synthetic fixtures

Prefer synthetic fixtures for:

- security tests;
- hostile tests;
- secret handling;
- destructive-operation prevention;
- provider mocks;
- migration edge cases;
- malformed input;
- resource exhaustion.

Synthetic fixtures must avoid real secrets and customer data.

A synthetic fixture should model the relevant behavior accurately enough for the
test objective.

---

## 35. External repositories

Tests against external repositories require:

- current authorization;
- exact repository identity;
- denylist validation;
- immutable commit;
- permitted operation;
- isolated execution;
- cleanup;
- audit recording.

Broad account access does not authorize every test operation.

A prohibited repository must never be used as a fixture.

---

## 36. Test data

Test data must be:

- minimal;
- attributable;
- tenant-safe;
- free of real secrets;
- free of unnecessary personal data;
- reproducible where practical;
- cleaned when created temporarily.

Production data must not be copied into test environments without explicit
authorization and data-handling review.

---

## 37. Synthetic secrets

Secret-handling tests must use synthetic sentinel values.

Synthetic secrets should be:

- clearly non-production;
- unique to the test;
- recognizable by scanners;
- excluded from committed artifacts when unnecessary;
- removed during cleanup.

A successful synthetic test does not prove that every possible secret format is
detected.

---

## 38. Test isolation

Tests must not interfere with:

- unrelated repositories;
- user worktrees;
- other tenants;
- production databases;
- production provider state;
- shared branches;
- shared credentials;
- running user processes.

Tests should use:

- temporary workspaces;
- isolated databases;
- synthetic provider targets;
- dedicated branches when authorized;
- controlled ports;
- bounded resources.

---

## 39. Test parallelism

Parallel test execution must preserve:

- tenant isolation;
- fixture isolation;
- database isolation;
- port isolation;
- workspace isolation;
- artifact identity;
- deterministic results where required.

Tests that mutate shared state must use appropriate serialization or unique
resources.

Flaky collisions must not be hidden through automatic retries.

---

## 40. Test retries

Automatic retries must be used cautiously.

A retry policy must identify:

- retryable failure categories;
- maximum attempts;
- backoff;
- state reset;
- artifact separation;
- whether the original failure remains reported.

A passing retry does not erase the initial failure.

Flaky tests must be reported and corrected.

Required tests must not rely indefinitely on retries to appear stable.

---

## 41. Flaky tests

A flaky test produces inconsistent results without intentional input changes.

When flakiness is detected:

1. Preserve each result.
2. Record the environment.
3. Determine whether the product or test is nondeterministic.
4. Avoid marking the capability fully verified.
5. Create a defect or blocker.
6. Fix or quarantine only through an authorized process.
7. Keep required coverage visible.

Quarantining a required test does not make it pass.

---

## 42. Test order independence

Tests should not depend on execution order unless the workflow intentionally
tests ordered state transitions.

Order-dependence tests should verify that:

- isolated tests pass independently;
- random order does not change results;
- shared state is reset;
- database state is controlled;
- caches do not leak authority;
- environment variables do not leak.

Hidden order dependence reduces reproducibility.

---

## 43. Determinism

Tests of deterministic behavior should control applicable:

- time;
- locale;
- random seeds;
- file ordering;
- environment;
- temporary paths;
- tool versions;
- concurrency;
- network responses;
- database ordering.

When nondeterminism is intentional, the test must define acceptable bounds.

A nondeterministic test must not be used to prove deterministic patch identity.

---

## 44. Time-dependent tests

Time-dependent tests should use controlled clocks where practical.

They must not rely unnecessarily on:

- wall-clock delays;
- local timezone;
- daylight-saving transitions;
- current calendar date;
- provider timing;
- arbitrary sleeps.

Authorization expiration, runtime windows, and audit ordering should be tested
with explicit controlled times.

---

## 45. Network-dependent tests

Network-dependent tests must define:

- authorized destinations;
- credentials;
- timeout;
- retry behavior;
- rate-limit handling;
- offline behavior;
- cleanup;
- expected external state.

Tests must not use unrestricted internet access merely for convenience.

When network infrastructure is unavailable, the test result must be
`unavailable`, not passed.

---

## 46. Credentialed tests

Credentialed tests require explicit authorization.

The test record must identify:

- credential type;
- capability;
- scope;
- environment;
- value recorded as `false`;
- redaction behavior;
- cleanup;
- external operations performed.

Credential values must never be stored in test output, logs, reports, or
fixtures.

---

## 47. Test commands

Tests must execute through approved structured commands where applicable.

A test command must define:

- command ID;
- executable;
- arguments;
- working directory;
- environment allowlist;
- trust zone;
- network profile;
- filesystem profile;
- timeout;
- resource limits;
- expected output.

Generated arbitrary shell text must not be executed as a test command.

---

## 48. Test status model

Every test execution must use one status:

- `passed`;
- `failed`;
- `skipped`;
- `unavailable`;
- `timed_out`;
- `resource_exceeded`;
- `cancelled`;
- `inconclusive`;
- `malformed_result`;
- `not_applicable`;
- `not_run`.

Only `passed` satisfies a required test.

`Not_applicable` is valid only when the manifest condition does not apply and
the rationale is recorded.

---

## 49. Skipped tests

A skipped test must identify:

- test ID;
- reason;
- actor or mechanism;
- whether the skip was authorized;
- completion impact;
- required follow-up.

A skipped required test blocks completion.

Tests must not be skipped automatically because:

- they are slow;
- they are failing;
- infrastructure is inconvenient;
- the implementation is incomplete;
- credentials are unavailable.

Those conditions must be reported explicitly.

---

## 50. Unavailable tests

A test is unavailable when required infrastructure, tools, credentials, or
platform support cannot be obtained within authorization.

The result must identify:

- missing prerequisite;
- attempted setup;
- affected capability;
- completion impact;
- safe next action.

An unavailable test must not be reported as skipped or passed.

---

## 51. Timeouts

A timed-out test must record:

- test ID;
- timeout value;
- elapsed time;
- process status;
- descendant cleanup status;
- partial artifacts;
- resource use when available.

A timeout must not become a generic failure without preserving its category.

Required timed-out tests block completion.

---

## 52. Resource exhaustion

A resource-exceeded test must record the affected limit:

- CPU;
- memory;
- processes;
- open files;
- disk;
- output;
- network;
- provider rate limit.

Resource exhaustion must not be interpreted as functional success.

It may reveal a capability or scale limitation that must be reported.

---

## 53. Test evidence

A test result should preserve applicable evidence:

- test ID;
- source commit;
- command ID;
- manifest version;
- fixture identity;
- environment identity;
- start and completion times;
- status;
- exit code;
- bounded output references;
- artifact hashes;
- changed files;
- external identifiers;
- cleanup status;
- failure category.

Raw output should be stored only when necessary and must be bounded and
redacted.

---

## 54. Test result immutability

Finalized test results must not be rewritten to change:

- status;
- environment;
- command;
- output;
- time;
- fixture;
- failure category.

A corrected or repeated test requires a new execution record.

Historical failed results must remain visible.

A later pass may supersede a failure for current capability state, but it must
not erase the prior execution.

---

## 55. Test result digest

Material test results should have a deterministic digest over applicable:

- test ID;
- source commit;
- manifest version;
- command ID and version;
- fixture identity;
- environment identity;
- expected result;
- actual status;
- artifact hashes.

Unstable values such as temporary paths should be excluded from semantic
digests unless required.

---

## 56. Output redaction

Test output may contain:

- source code;
- secrets;
- private paths;
- environment variables;
- authentication headers;
- database URLs;
- provider responses;
- prompt injection;
- terminal escape sequences.

Output must be bounded, redacted, and safely encoded before persistence or
display.

A redaction failure must be treated as a security issue.

---

## 57. Test cleanup

Every test must define cleanup for resources it creates.

Applicable resources include:

- processes;
- containers;
- temporary files;
- workspaces;
- databases;
- schemas;
- branches;
- pull requests;
- network rules;
- temporary credentials;
- generated artifacts;
- local services.

Cleanup must not affect pre-existing user resources.

Cleanup success must be verified where practical.

---

## 58. Cleanup failure

A cleanup failure must identify:

- test ID;
- retained resource;
- environment;
- tenant;
- possible exposure;
- safe next action;
- whether further tests are blocked.

A test with material unresolved cleanup failure must not be reported as fully
successful.

External-resource deletion requires separate authorization.

---

## 59. Database test cleanup

Database tests should use uniquely identified test databases or schemas.

Cleanup must not:

- connect to production;
- drop unrelated databases;
- remove shared test data;
- bypass tenant boundaries;
- delete audit evidence required for the test report.

Database identity must be verified before destructive cleanup commands run.

---

## 60. Provider test cleanup

Provider tests may create:

- branches;
- draft pull requests;
- comments;
- test repositories;
- labels.

External cleanup must be explicitly authorized.

When cleanup is not authorized, the test must:

- retain external identifiers;
- report retained state;
- avoid claiming complete cleanup;
- avoid creating duplicate state during retries.

---

## 61. Baseline and post-change gates

Remediation tests must preserve separate baseline and post-change gate records.

A gate record must identify:

- gate ID;
- command ID;
- environment;
- status;
- duration;
- artifacts;
- limitations.

Post-change success must not conceal a failing or unavailable baseline.

The comparison must identify newly introduced failures.

---

## 62. Finding reproduction tests

Remediation workflows must test exact finding reproduction.

Tests should verify rejection when:

- repository differs;
- commit differs;
- file content differs;
- source occurrence differs;
- symbol identity differs;
- evidence digest differs;
- coverage digest differs;
- positive liveness appears;
- coverage becomes incomplete.

A similar symbol name must not satisfy reproduction.

---

## 63. Patch tests

Patch tests should cover:

- expected rewrite count;
- zero rewrite;
- excessive rewrites;
- expected changed files;
- unexpected changed files;
- file-mode changes;
- symbolic-link changes;
- binary changes;
- deterministic patch hash;
- idempotent reapplication;
- stale base commit;
- malformed patch;
- path traversal;
- secret-bearing content.

A valid-looking diff is insufficient without identity and gate validation.

---

## 64. Publisher tests

Trusted publisher tests must verify:

- request authentication;
- authorization;
- denylist enforcement;
- repository identity;
- base commit;
- human disposition;
- remediation authorization;
- evidence and coverage digests;
- gate results;
- patch hash;
- changed files;
- Git-hook suppression;
- branch restrictions;
- draft pull-request status;
- idempotency;
- partial-state reconciliation;
- credential isolation.

Tests must verify that the publisher does not execute repository-controlled
builds, tests, or scripts.

---

## 65. Audit tests

Audit tests should verify:

- append-only insertion;
- event hashing;
- hash chaining;
- canonicalization;
- correction records;
- tenant isolation;
- mutation rejection;
- deletion rejection;
- chain verification;
- checkpoint verification;
- projection rebuild;
- backup restoration;
- audit-insertion failure.

Database-level controls require database-level tests.

Application-unit tests alone do not prove append-only enforcement.

---

## 66. Authorization tests

Authorization tests should cover:

- no active phase;
- inactive authorization;
- expired authorization;
- revoked authorization;
- wrong phase;
- wrong repository;
- wrong command;
- wrong path;
- wrong trust zone;
- unavailable credential permission;
- publication not permitted;
- remediation not permitted;
- changed evidence identity;
- changed coverage identity;
- denylist conflict.

Missing permission must default to denial.

---

## 67. Prompt-injection tests

Prompt-injection tests should place hostile instructions in:

- source comments;
- Markdown files;
- configuration;
- analyzer output;
- logs;
- commit messages;
- pull-request text;
- generated artifacts.

The test must verify that the content cannot:

- change authorization;
- expose secrets;
- broaden repository scope;
- select arbitrary commands;
- weaken gates;
- trigger publication;
- modify governance;
- falsify results.

---

## 68. Secret-handling tests

Secret-handling tests should verify:

- environment sanitization;
- log redaction;
- report redaction;
- command-argument handling;
- temporary-file cleanup;
- artifact scanning;
- patch scanning;
- audit redaction;
- provider response redaction.

Tests must use synthetic secrets.

A scanner pass must not be described as proof that no secret exists.

---

## 69. Tenant-isolation tests

Tenant-isolation tests should cover applicable:

- database queries;
- evidence retrieval;
- coverage aggregation;
- classification;
- runner workspaces;
- caches;
- artifacts;
- audit events;
- remediation authorization;
- publication credentials;
- provider targets.

One tenant's data or authorization must never affect another tenant's result.

---

## 70. Prohibited-repository tests

Tests must verify that prohibited repositories are rejected before content
access.

The test should confirm that DCAv2 does not:

- clone;
- fetch;
- inspect files;
- inspect branches;
- inspect commits;
- analyze;
- modify;
- publish.

The audit record should contain only minimum identity and denial information.

---

## 71. Local source-control tests

Tests affecting a local Git worktree must preserve pre-existing user work.

They should verify that DCAv2 does not:

- hard reset;
- destructively clean;
- overwrite unrelated changes;
- amend unrelated commits;
- rewrite shared history;
- delete user branches.

Test cleanup must remove only resources created by the test.

---

## 72. Test selection

Test selection must be derived from:

- changed capabilities;
- changed files;
- dependency graph;
- phase manifest;
- affected trust boundaries;
- affected schemas;
- affected providers;
- affected runner profiles;
- conditional test triggers.

A minimal test set may be used only when the selection logic is explicit and
the phase allows it.

The phrase “relevant tests” must be resolved into concrete test IDs before
completion.

---

## 73. Changed-file test mapping

The repository should maintain a mapping from code or policy areas to required
tests where practical.

Examples include:

- runner changes require hostile isolation tests;
- publisher changes require draft-only publication tests;
- classification changes require precedence and invariant tests;
- migration changes require upgrade and fresh-install tests;
- dependency changes require license and integration tests;
- governance changes require schema and consistency checks.

The mapping may be implemented through manifests or tooling.

---

## 74. Test execution order

A phase may define an ordered test strategy such as:

1. Static validation.
2. Unit tests.
3. Component tests.
4. Integration tests.
5. Migration tests.
6. Security tests.
7. End-to-end tests.
8. Scale tests.

Early failures may stop later expensive tests when the manifest permits
fail-fast behavior.

Tests not run because of fail-fast must be recorded as `not_run`, not passed.

---

## 75. Fail-fast behavior

Fail-fast behavior must identify:

- triggering failure;
- tests not run;
- completion impact;
- whether later diagnostic tests were still executed.

Fail-fast must not conceal the remaining manifest.

A phase report must distinguish executed failures from tests prevented by the
failure.

---

## 76. Test parallelization

Parallelization may reduce execution time but must not weaken isolation or
determinism.

Before enabling parallel execution, verify:

- unique databases;
- unique ports;
- unique workspaces;
- unique artifact paths;
- unique branches;
- tenant separation;
- resource capacity;
- deterministic output.

Parallel execution must not exceed runner or provider limits.

---

## 77. Continuous integration

CI should execute an explicit test subset for each change.

CI configuration must:

- use controlled tool versions;
- use least-privilege credentials;
- avoid production secrets;
- preserve test evidence;
- report skipped and unavailable tests;
- enforce timeout and resource limits;
- isolate untrusted repository execution;
- avoid automatic publication unless separately authorized.

A green CI status proves only the configured executed checks.

---

## 78. Local testing

Local tests may use development profiles with weaker controls.

Reports must state when results came from a local profile.

Local success must not be represented as proof of:

- production runner isolation;
- provider integration;
- production database permissions;
- cloud network policy;
- scale validation.

Local testing remains valuable for fast feedback and reproducibility.

---

## 79. Production-equivalent testing

A test may be described as production-equivalent only when applicable:

- runner profile matches;
- image identity matches;
- security controls match;
- database version matches;
- network policy matches;
- credential mechanism matches;
- provider environment behavior is representative;
- resource limits match;
- deployment configuration matches.

Any material differences must be stated.

---

## 80. Test reports

A test report must include:

- phase or workflow;
- source commit;
- test manifest version;
- tests selected;
- tests executed;
- statuses;
- environment;
- fixtures;
- commands;
- duration;
- failures;
- skipped tests;
- unavailable tests;
- cleanup;
- limitations;
- artifact references.

Test reports must be bounded and free of secret values.

---

## 81. Machine-readable results

Material phase tests should produce machine-readable results conforming to an
approved schema.

The result should include:

- test ID;
- execution ID;
- status;
- source commit;
- command ID;
- environment ID;
- fixture ID;
- expected result;
- actual result;
- failure category;
- artifact references;
- start and completion times;
- cleanup status.

Human-readable summaries should be derived from the same authoritative result
records.

---

## 82. Test result aggregation

Aggregate test status must be deterministic.

A test suite may be `passed` only when:

- every required test passed;
- every triggered conditional test passed;
- no required test was skipped;
- no required test was unavailable;
- no required test timed out;
- no required test exceeded resources;
- no required test was cancelled;
- no required result was malformed.

Optional test failures must remain visible even when they do not block the
aggregate result.

---

## 83. Phase completion

A phase may be reported complete only when:

- its authorized objective is satisfied;
- every required test passed;
- every triggered conditional test passed;
- required security controls passed;
- required migrations passed;
- required cleanup completed;
- known limitations are documented;
- execution state is updated;
- the human operator has not revoked authorization.

Passing tests alone does not prove phase completion.

---

## 84. Capability status

A capability may move to `functional` only when its required test criteria are
satisfied.

Applicable evidence includes:

- positive tests;
- negative tests;
- failure tests;
- unsupported tests;
- security tests;
- migration tests;
- generalization tests;
- cleanup tests.

Scale validation requires separate scale evidence.

A single fixture cannot establish general functional status.

---

## 85. Test coverage metrics

Code coverage metrics may be used as diagnostic information.

They must not replace behavior-based tests.

A high line or branch coverage percentage does not prove:

- correct authorization;
- secure isolation;
- complete evidence coverage;
- safe remediation;
- correct publication;
- absence of false positives.

Coverage thresholds, when used, must be explicit and capability-appropriate.

---

## 86. Mutation testing

Mutation testing may be used to evaluate whether tests detect incorrect
behavior.

It is particularly useful for:

- classification precedence;
- authorization checks;
- path validation;
- digest comparison;
- changed-file enforcement;
- redaction;
- audit integrity.

Mutation score is a diagnostic metric.

It must not replace required functional and security tests.

---

## 87. Static validation

Static validation may include:

- formatting;
- linting;
- type checking;
- schema validation;
- dependency checks;
- license checks;
- secret scanning;
- policy consistency checks.

Static validation is useful but does not replace runtime or integration tests
where behavior depends on execution.

A formatter pass is not a functional test.

---

## 88. Documentation tests

Documentation tests should verify applicable:

- file references;
- command examples;
- schema examples;
- configuration names;
- capability identifiers;
- Markdown validity;
- links;
- generated indexes.

Documentation tests must not execute untrusted code examples automatically.

Documentation matching intended behavior does not prove implementation.

---

## 89. Governance validation

Governance validation should check:

- required files exist;
- references resolve;
- YAML and JSON parse;
- schemas validate;
- authorization status is explicit;
- denylist entries are preserved;
- no active phase is invented;
- permanent prohibitions remain consistent;
- Markdown formatting is valid.

Governance validation must not rewrite governance automatically unless
explicitly authorized.

---

## 90. Test failures

When a required test fails:

1. Preserve the result.
2. Record the environment.
3. Record bounded diagnostics.
4. Identify affected capability.
5. Stop dependent completion claims.
6. Determine whether later diagnostic tests remain safe.
7. Avoid weakening the test.
8. Correct the implementation only within authorization.
9. Rerun the failed test and required regression set.
10. Preserve both failed and later passing executions.

A failure must not be hidden through report editing.

---

## 91. Infrastructure unavailability

When test infrastructure is unavailable:

- record the unavailable prerequisite;
- record attempted access or setup;
- avoid fabricating a result;
- avoid substituting materially different infrastructure silently;
- mark affected tests unavailable;
- block completion when required;
- identify the safe next action.

Infrastructure unavailability is not a test pass.

---

## 92. Defect discovery

A test may reveal a defect outside the active phase.

The defect should be recorded with:

- reproduction;
- affected component;
- expected behavior;
- observed behavior;
- severity;
- security impact;
- proposed phase;
- whether it blocks current work.

Codex must not repair unrelated defects unless the current authorization permits
it.

---

## 93. Test maintenance

Tests should be updated when:

- contracts change;
- capabilities change;
- supported versions change;
- fixtures become obsolete;
- defects are corrected;
- security controls change;
- schemas change.

Tests must not be weakened merely to match defective implementation.

A changed expectation requires documented contract or policy justification.

---

## 94. Removing tests

Removing a test requires:

- reason;
- affected capability;
- replacement test where applicable;
- historical context;
- authorization;
- review.

A test must not be removed because it:

- fails;
- is slow;
- reveals unsupported behavior;
- blocks completion;
- requires inconvenient infrastructure.

Deprecated behavior may justify test removal only after the replacement contract
is accepted and implemented.

---

## 95. Test ownership

Important test areas should have an identified owner or responsible component.

Ownership should cover:

- maintenance;
- fixture updates;
- version compatibility;
- failure triage;
- security relevance;
- manifest inclusion.

Ownership does not grant authority to weaken requirements unilaterally.

---

## 96. Audit requirements

Material test activity should produce audit or execution-state records for:

- manifest selected;
- test execution started;
- test execution completed;
- required test failed;
- required test unavailable;
- security test failed;
- external test operation performed;
- cleanup completed;
- cleanup failed;
- phase test aggregate calculated.

Records must not include secret values.

---

## 97. Reporting language

Test reporting must use precise language.

Prefer:

- “Passed 42 required tests in runner profile `analysis-v1`.”
- “Three required provider tests were unavailable because no authorized sandbox
  credential was present.”
- “The migration passed from schema versions 12 and 13; earlier supported
  versions were not tested.”
- “The hostile fixture confirmed Docker socket denial in the tested Linux
  profile.”

Avoid:

- “All tests look good.”
- “Everything passed” when tests were skipped.
- “Production-ready” based on local tests.
- “Secure” based on configuration inspection.
- “Fully supported” based on one fixture.

---

## 98. Prohibited practices

The following practices are prohibited:

- marking skipped tests as passed;
- marking unavailable tests as passed;
- hiding failed tests from reports;
- deleting failing tests without reviewed justification;
- weakening assertions to fit implementation;
- using production credentials in ordinary tests;
- using production databases as test databases;
- accessing prohibited repositories;
- retrying external writes without idempotency;
- relying on one fixture for universal capability claims;
- reporting mocked provider behavior as live integration;
- reporting local containers as production-equivalent without evidence;
- allowing untrusted tests to access trusted credentials;
- using test results to grant authorization;
- rewriting historical test results.

---

## 99. Fail-safe behavior

When test scope, environment, fixture identity, result integrity, cleanup, or
required infrastructure cannot be established confidently:

- do not report the test as passed;
- do not report the suite as complete;
- do not advance capability status;
- do not claim phase completion;
- preserve available evidence;
- use `failed`, `unavailable`, `inconclusive`, `malformed_result`, or
  `not_run` as applicable;
- identify the missing validation;
- stop dependent remediation or publication when the test is required.

Testing uncertainty must reduce capability and completion claims.

---

## 100. Policy integrity

This document must not be modified during implementation unless engineering or
governance modification is explicitly authorized.

Changes require:

1. Identification of the testing-policy problem.
2. Review against permanent safety invariants.
3. Review of capability and completion implications.
4. Review of security, migration, and external-operation implications.
5. Updated test schemas and manifests where applicable.
6. Updated reporting rules.
7. A reviewable governance commit.
8. An ADR when the change alters long-lived required-test, completion,
   evidence, or security-validation semantics.

This policy must not be weakened to make failing, skipped, unavailable, or
unexecuted tests appear successful.