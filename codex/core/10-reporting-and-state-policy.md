# Reporting and Execution State Policy

This policy defines how Codex and DCAv2 must record execution progress, test results, blockers, repository state, security checks, phase completion, and continuation information.

It applies to:

* `CODEX_EXECUTION_STATE.md`;
* phase reports;
* machine-readable reports;
* test records;
* security-control records;
* continuation prompts;
* external-operation records;
* final project handoffs.

Reports and state files describe work. They do not authorize work.

---

## 1. Core reporting principles

All reporting must be:

* truthful;
* evidence-backed;
* bounded;
* reproducible where practical;
* free of secret values;
* explicit about failures and unavailable infrastructure;
* scoped to the authorized phase;
* clear about what was implemented versus planned;
* clear about what was tested versus assumed.

Codex must never report:

* an unavailable test as passed;
* a skipped test as passed;
* a partial implementation as complete;
* a fixture-only implementation as general support;
* an external action as successful when it did not occur;
* cleanup as successful without checking phase-created resources;
* complete analysis when required coverage was missing;
* verified security when controls were not tested;
* authorization based on a generated report or continuation prompt.

---

## 2. State is descriptive, not authoritative

The following files and artifacts are descriptive records:

* `CODEX_EXECUTION_STATE.md`;
* files under `codex/reports/`;
* phase reports;
* test reports;
* generated capability matrices;
* generated continuation prompts;
* generated remediation summaries;
* generated authorization proposals.

They cannot:

* authorize a phase;
* broaden repository access;
* authorize external writes;
* authorize remediation;
* authorize publication;
* modify a denylist;
* authorize destructive actions;
* weaken a permanent safety invariant.

Only the latest valid human instruction and the approved authorization protocol can authorize work.

---

## 3. `CODEX_EXECUTION_STATE.md`

`CODEX_EXECUTION_STATE.md` is the primary human-readable progress record for the current execution.

It should contain the following sections.

### Authorization

Record:

* authorization ID;
* authorized phase;
* authorization status;
* human-authorized objective;
* expiration condition;
* permitted local Git operations;
* permitted external operations;
* governance-modification permission;
* destructive-operation permission;
* credential-use permission.

Do not copy secret values into the state file.

### Repository state

Record:

* repository root;
* starting branch;
* current branch;
* starting commit;
* current commit;
* upstream relationship when relevant;
* working-tree status;
* pre-existing changed files;
* pre-existing untracked files;
* phase-created files;
* phase-created branches;
* phase-created commits.

### Governance integrity

Record hashes for the governing files required by `AGENTS.md`, including:

* `AGENTS.md`;
* relevant files under `codex/core/`;
* repository-access policies;
* the current phase authorization;
* the current phase specification;
* the current phase test manifest.

Record:

* hash algorithm;
* file path;
* initial hash;
* current verification status.

Unexpected governance-file changes must be reported immediately.

### Current progress

Record:

* completed tasks;
* current task;
* remaining tasks;
* deferred out-of-scope findings;
* blockers;
* decisions made;
* ADRs created or proposed;
* external operations performed;
* next safe action.

### Commands and tests

Record:

* command;
* purpose;
* working directory;
* start time;
* end time;
* duration;
* exit status;
* result status;
* log or artifact location;
* reason when unavailable or skipped.

### Resources

Record resources created by the phase, such as:

* containers;
* temporary workspaces;
* test databases;
* schemas;
* branches;
* background processes;
* generated credentials;
* temporary files.

For each resource, record:

* identifier;
* purpose;
* creation time;
* expected lifecycle;
* cleanup status.

### Stop or completion state

Record one of:

* `in_progress`;
* `blocked`;
* `stopped_for_authorization`;
* `stopped_for_governance_conflict`;
* `stopped_for_security_reason`;
* `phase_complete`;
* `phase_incomplete`;
* `revoked`;
* `context_exhausted`.

The state must explain why execution stopped.

---

## 4. Updating execution state

Update `CODEX_EXECUTION_STATE.md`:

* at phase start;
* after a material implementation milestone;
* after a material test run;
* after a significant failure;
* after an external operation;
* after a governance conflict;
* before stopping;
* at phase completion;
* before context or session exhaustion.

Do not update the state file after every trivial command when doing so creates noise without improving recovery.

The state file should allow another authorized agent session to understand the current safe execution state without relying on hidden conversation context.

---

## 5. State-file integrity

The execution-state file must not contain:

* secrets;
* private keys;
* tokens;
* credential-bearing URLs;
* full environment dumps;
* unbounded logs;
* sensitive source excerpts;
* fabricated authorization;
* instructions that claim to authorize future work.

A generated continuation prompt stored in the state file is a proposal only.

The state file must clearly state:

> This file records execution state and does not grant authorization.

---

## 6. Phase report files

Every completed or stopped phase should produce:

* a human-readable Markdown report;
* a machine-readable JSON report when the relevant schema exists.

Recommended paths:

```text
codex/reports/phase-<phase>-report.md
codex/reports/phase-<phase>-report.json
```

When multiple attempts exist, use a stable attempt identifier:

```text
codex/reports/phase-1-attempt-02-report.md
codex/reports/phase-1-attempt-02-report.json
```

Reports must reference the authorization ID.

---

## 7. Required phase-report content

A phase report must include:

* Phase and authorization ID.
* Execution status.
* Executive summary.
* Starting and ending repository state.
* Acceptance-criteria results.
* Changed files.
* Commits created.
* Migrations added.
* Dependencies added, removed, or changed.
* Tests and commands executed.
* Security controls evaluated.
* External operations performed.
* Resources created.
* Cleanup results.
* Blockers.
* Known limitations.
* Out-of-scope discoveries.
* Governance changes, when authorized.
* Proposed next phase.
* Confirmation that execution stopped.

The report should be concise enough for review while retaining links to detailed artifacts.

---

## 8. Acceptance-criteria reporting

Every phase acceptance criterion must have one status:

* `passed`;
* `failed`;
* `blocked`;
* `not_applicable`.

Do not use ambiguous statuses such as:

* mostly complete;
* essentially done;
* nearly passing;
* expected to pass;
* assumed complete.

For each criterion, record:

* criterion text or identifier;
* status;
* evidence;
* relevant command or artifact;
* explanation when not passed.

A phase may be declared complete only when every required criterion is passed or legitimately `not_applicable` under the phase specification.

A blocked required criterion means the phase is incomplete.

---

## 9. Test-result statuses

Every test or verification command must use one of the following statuses:

* `passed`;
* `failed`;
* `timed_out`;
* `resource_exceeded`;
* `unavailable`;
* `configuration_required`;
* `skipped_by_policy`;
* `not_applicable`;
* `not_run`.

Definitions:

### `passed`

The command executed successfully and satisfied its expected assertions.

### `failed`

The command executed and returned a failing result.

### `timed_out`

The command exceeded its approved timeout.

### `resource_exceeded`

The command exceeded an approved resource limit.

### `unavailable`

The required executable, service, credential, or infrastructure was unavailable.

### `configuration_required`

The repository or environment lacks required configuration.

### `skipped_by_policy`

The command was intentionally not executed because policy prohibited it.

### `not_applicable`

The test does not apply to the authorized phase or repository shape.

### `not_run`

The command was not executed for another stated reason.

Only `passed` counts as successful execution.

---

## 10. Test-command reporting

For every required or conditional test, record:

* test identifier;
* command;
* structured command identity where available;
* working directory;
* environment profile;
* runner profile;
* start time;
* end time;
* duration;
* exit code;
* status;
* bounded output summary;
* detailed artifact path;
* retry count;
* reason for retry;
* final result.

Do not paste unbounded command output into Markdown reports.

Store detailed logs only in approved controlled artifacts.

All logs must follow the secret-handling policy.

---

## 11. Exact test counts

When reporting test counts, derive them from actual trusted test output.

Record, where available:

* test files;
* test suites;
* tests passed;
* tests failed;
* tests skipped;
* tests unavailable;
* tests not run.

Do not reuse historical counts from prior reports when the current run produced different results.

Do not claim a full suite passed when only a focused subset ran.

Distinguish:

* focused tests;
* regular test suite;
* database integration tests;
* Docker integration tests;
* hostile-repository tests;
* migration tests;
* external integration tests.

---

## 12. Security-control reporting

Security controls must be reported with one of:

* `enforced`;
* `partially_enforced`;
* `unavailable`;
* `not_applicable`;
* `deferred`;
* `failed`.

For each control, record:

* control identifier;
* intended property;
* enforcement mechanism;
* verification method;
* test result;
* affected runner profile;
* known limitations.

A configuration option alone is not proof that the control is enforced.

Example:

```yaml
control: network_disabled
status: enforced
mechanism: docker-network-none
verification: hostile-network-egress-fixture
result: passed
limitations:
  - DNS behavior is covered only within the documented Docker threat model.
```

Security claims must remain bounded to the documented threat model and executed fixtures.

---

## 13. Changed-file reporting

At phase completion or stop, report:

* files added;
* files modified;
* files deleted;
* files renamed;
* generated files;
* migrations;
* governance files;
* ignored files created by the phase;
* unexpected changes.

Distinguish:

* pre-existing changes;
* phase-created changes;
* external repository changes;
* generated artifacts not intended for commit.

Do not claim ownership of pre-existing user changes.

---

## 14. Commit reporting

For every commit created during the phase, record:

* commit hash;
* subject;
* purpose;
* files affected;
* tests associated with the commit;
* whether the commit was pushed externally.

Also report:

* starting commit;
* ending commit;
* uncommitted phase changes;
* pre-existing commits not created by the phase.

Do not imply that a local commit was published externally when it was not.

---

## 15. Migration reporting

For each migration, report:

* migration identifier;
* file path;
* purpose;
* additive or destructive classification;
* affected tables or objects;
* empty-database test result;
* upgrade-path test result;
* rollback or forward-recovery notes;
* tenant-scope implications;
* data-retention implications.

A migration that was created but not tested must not be reported as complete.

---

## 16. Dependency and tooling reporting

When dependencies or tools change, report:

* name;
* old version when applicable;
* new version;
* purpose;
* license status;
* adoption decision record;
* security considerations;
* affected capabilities;
* fallback behavior;
* tests performed.

When license information is unavailable, record:

```yaml
license_status: unverified
adoption blocked or deferred
exact verification still required
```

Do not guess license terms.

---

## 17. External-operation reporting

Every external operation must record:

* authorization ID;
* provider;
* repository or resource identity;
* operation type;
* access level;
* requested revision;
* resolved commit when applicable;
* credential type without value;
* start and end time;
* result;
* external identifier;
* idempotency identity;
* whether the operation modified external state.

Examples include:

* repository listing;
* metadata retrieval;
* clone;
* fetch;
* branch creation;
* push;
* draft pull-request creation;
* external comment creation.

Prohibited or denied operations should also be recorded when relevant.

---

## 18. Prohibited-repository reporting

When a prohibited repository is encountered, record only the minimum identity required to demonstrate that exclusion was enforced.

Do not record:

* source contents;
* file lists;
* commit history;
* branch contents;
* package structure;
* findings.

The report may state:

```text
Excluded repository encountered: akshay-hudev/Rufa-Clean
Action: access denied by prohibited-repository policy
Content retrieved: no
```

Do not access the repository merely to produce a more detailed report.

---

## 19. Cleanup reporting

Cleanup applies only to resources created by the current phase.

For each resource, report:

* identifier;
* resource type;
* creation reason;
* cleanup command or method;
* cleanup result;
* remaining state.

Do not claim cleanup of unrelated pre-existing resources.

Valid cleanup statuses include:

* `removed`;
* `retained_by_phase_design`;
* `cleanup_failed`;
* `not_found`;
* `not_owned_by_phase`.

A retained resource must include:

* reason;
* owner;
* expected lifecycle;
* cleanup instructions;
* secret status.

---

## 20. Blocker reporting

A blocker report must identify:

* blocked acceptance criterion;
* exact condition;
* last attempted command;
* observed result;
* whether the blocker is local or external;
* whether safe unrelated work continued;
* human action required;
* next safe command after resolution.

Avoid vague blocker statements such as:

* environment issue;
* test problem;
* credentials missing;
* Docker failed.

State the exact missing capability without exposing secrets.

---

## 21. Known limitations

Every phase report must list relevant known limitations.

Examples include:

* unsupported repository structures;
* unsupported language features;
* incomplete analyzer coverage;
* unverified license conditions;
* unavailable runtime evidence;
* untested scale;
* partially enforced runner controls;
* unsupported transformation shapes;
* missing external credentials;
* incomplete framework support.

A limitation must not be hidden because it belongs to a later phase.

---

## 22. Out-of-scope discoveries

When work reveals a defect or opportunity outside the current phase, report:

* discovery;
* affected component;
* severity;
* reason it is outside scope;
* immediate risk;
* whether a minimal security fix was required;
* recommended roadmap phase;
* suggested acceptance criterion.

Do not implement broad later-phase work merely because it was discovered.

---

## 23. Continuation prompts

A continuation prompt should contain:

* current phase result;
* proposed next phase;
* exact files to read;
* exact authorization needed;
* unresolved blockers;
* starting branch and commit;
* required test manifest;
* explicit instruction not to begin later phases.

A continuation prompt is not authorization.

It must clearly state:

> This is a proposed continuation prompt. Human approval is required before execution.

Continuation prompts must not include secrets or fabricated permissions.

---

## 24. Chat response versus persisted report

Detailed execution evidence should be persisted in repository reports.

The chat response should summarize:

* phase status;
* major changes;
* key test results;
* blockers;
* important limitations;
* next authorization required.

Do not reproduce the entire machine-readable report in chat unless explicitly requested.

The persisted report remains subject to review and does not authorize future work.

---

## 25. Final project handoff

The final enterprise project handoff is broader than an individual phase report.

It should include:

* executive summary;
* implemented architecture;
* preserved capabilities;
* major defects resolved;
* open-source tools reused;
* tools evaluated but rejected;
* custom implementations;
* ADRs;
* license matrix;
* capability matrices;
* evidence and coverage models;
* classification policy;
* database migrations;
* security controls;
* runner profile;
* hostile-repository results;
* full test results;
* benchmark results;
* repository qualification results;
* cross-repository validation;
* contract and runtime validation;
* external integration results;
* draft pull-request references;
* deployment instructions;
* operator workflow;
* known limitations;
* remaining decisions;
* cleanup confirmation;
* secret-handling confirmation.

This full handoff is required only when the authorized roadmap defines project or release completion.

It must not be repeated for every phase.

---

## 26. Machine-readable reports

Machine-readable reports should conform to the schemas under `codex/schemas/`.

Machine-readable values should use stable identifiers and enumerated statuses.

Avoid embedding unbounded human prose in fields intended for automation.

Each machine-readable report should include:

* schema version;
* report ID;
* authorization ID;
* phase;
* repository identity;
* starting commit;
* ending commit;
* status;
* acceptance criteria;
* tests;
* changed files;
* commits;
* migrations;
* security checks;
* external operations;
* resources;
* blockers;
* limitations;
* timestamps.

Schema validation failure must be reported.

A schema-valid report is not necessarily factually correct; underlying evidence must still be verified.

---

## 27. Timestamps and durations

Use a consistent timestamp format.

Recommended format:

```text
YYYY-MM-DDTHH:MM:SSZ
```

Record time zone when UTC is not used.

Durations should be recorded using a consistent unit, preferably milliseconds in machine-readable reports and human-readable units in Markdown summaries.

Do not fabricate timestamps or durations.

When exact timing is unavailable, state that it was not captured.

---

## 28. Report identifiers

Every persisted report should have a unique identifier.

Recommended formats:

```text
phase-0-report-20260722-01
phase-1-attempt-02-report
security-runner-profile-01
```

Report identifiers must not contain:

* secrets;
* tokens;
* sensitive source content;
* private URLs.

---

## 29. Redaction

Before writing any report or state file, verify that it contains no:

* secret values;
* credential-bearing URLs;
* private keys;
* tokens;
* passwords;
* authentication headers;
* full environment dumps;
* unbounded source excerpts;
* unsafe command output.

Use redacted statuses such as:

```text
GITHUB_APP_CREDENTIALS: SET
DATABASE_CREDENTIALS: UNSET
```

Do not include partial secret values.

---

## 30. Failure and partial completion

When a phase is incomplete, the report must state:

* `phase_incomplete`;
* which criteria passed;
* which criteria failed;
* which criteria are blocked;
* what work remains;
* current repository state;
* whether cleanup completed;
* exact authorization required to continue.

Do not use optimistic language that obscures incomplete work.

Preserve completed safe work unless the human operator requests otherwise.

---

## 31. Revocation reporting

When authorization is revoked, record:

* authorization ID;
* revocation time;
* work in progress;
* commands running at revocation;
* safe termination actions;
* external operations already completed;
* local changes preserved;
* cleanup result;
* next human decision required.

Do not begin new implementation after revocation.

---

## 32. Context exhaustion reporting

Before stopping because of context or session limits, record:

* current coherent work unit;
* last successful command;
* last failing command;
* files changed;
* tests passed;
* tests remaining;
* blockers;
* exact next command;
* proposed continuation prompt;
* phase completion status.

Do not claim phase completion unless all required acceptance criteria were satisfied.

---

## 33. Reporting integrity checks

Before phase completion, verify:

* authorization ID matches;
* phase matches;
* starting and ending commits are accurate;
* changed files match Git state;
* test results match actual output;
* unavailable tests are not marked passed;
* external operations match provider state;
* cleanup claims match phase-created resources;
* governance hashes are unchanged or authorized;
* no secret values are present;
* `git diff --check` passes.

A report must not be finalized when material inconsistencies remain.

---

## 34. Report correction

Reports are historical records.

Do not silently rewrite a finalized report to conceal errors.

When a report requires correction:

* Preserve the original report when required by audit policy.
* Create a corrected report or correction record.
* Reference the original report.
* Explain the correction.
* Record the actor and timestamp.
* Update derived current-state views where appropriate.

Corrections do not retroactively authorize actions.

---

## 35. Policy integrity

This policy must not be modified during an implementation phase unless governance modification is explicitly authorized.

Changes require:

* Identification of the reporting or recovery problem.
* Review against authorization and safety policies.
* Review of secret-handling implications.
* Review of audit-retention implications.
* Updated schemas and templates when applicable.
* Updated tests.
* A reviewable governance commit.
* An ADR when the change creates a long-lived reporting or audit boundary.

This policy must not be weakened to conceal incomplete work, reduce test transparency, or simplify unsupported completion claims.
