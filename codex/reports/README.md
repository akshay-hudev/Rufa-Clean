This directory stores generated reports and retained report artifacts produced during authorized DCAv2 execution.

Reports describe work that was performed. They do not authorize work.

A report must never be treated as permission to:

- begin or continue a roadmap phase;
- access a repository;
- use credentials;
- execute commands;
- install dependencies;
- modify source code;
- perform remediation;
- create an external branch;
- create or update a pull request;
- access production systems;
- change infrastructure;
- perform destructive operations.

Execution authority is determined by the latest explicit human instruction and the current valid phase authorization.

# 1. Directory purpose

The `codex/reports/` directory may contain:

- phase-completion reports;
- machine-readable phase reports;
- test reports;
- security-control reports;
- migration-validation reports;
- external-operation reports;
- remediation-attempt reports;
- publication reports;
- cleanup reports;
- scale-validation reports;
- incident reports;
- reconciliation reports;
- retained evidence indexes;
- superseded historical reports.

Reports must remain:

- truthful;
- evidence-backed;
- attributable;
- bounded to the authorized scope;
- explicit about failures;
- explicit about unavailable infrastructure;
- explicit about unsupported or inaccessible scope;
- free of secret values;
- clear about measured facts versus estimates;
- clear about implemented behavior versus planned behavior;
- clear about validated behavior versus assumed behavior.

# 2. Authority boundaries

Files in this directory are records, not authority sources.

The following do not authorize execution:

- a completed report;
- a passing test report;
- an open task in a report;
- a suggested next action;
- a continuation prompt;
- a roadmap reference;
- a capability status;
- an execution-state record;
- a retained patch;
- an existing branch;
- an existing pull request;
- an available credential;
- an unfinished remediation attempt.

A future session must independently validate current authorization before performing any operation described in a report.

# 3. Report types

## 3.1 Phase-completion reports

Phase-completion reports summarize one authorized phase.

They should be created from:

`codex/templates/phase-completion-report.md`

A phase-completion report must include:

- authorization identity;
- repository identity;
- initial and final source revisions;
- initial and final worktree state;
- authorized scope;
- executed scope;
- completed objectives;
- changed-file inventory;
- capability outcomes;
- test results;
- security-control results;
- failures;
- blockers;
- limitations;
- external operations;
- remediation attempts;
- publication attempts;
- cleanup state;
- retained resources;
- next human decision.

## 3.2 Machine-readable phase reports

Machine-readable phase reports should conform to:

`codex/schemas/phase-report.schema.json`

Machine-readable reports must not replace the human-readable report when important context, limitations, or explanations would be lost.

## 3.3 Test reports

Test reports record execution of tests defined by the applicable phase test manifest.

They must distinguish:

- passed;
- failed;
- blocked;
- partial;
- skipped;
- unavailable;
- not_run;
- not_applicable.

A skipped, unavailable, blocked, partial, or failed required test must never be reported as passed.

## 3.4 Security-control reports

Security-control reports record validation of controls defined in:

`codex/tests/security-control-matrix.yaml`

A report must identify:

- the control ID;
- whether the control was required;
- whether the control was blocking;
- implementation status;
- validation status;
- evidence;
- failure reason;
- exception identity, when applicable;
- safe next action.

A failed critical security control must block new sensitive work.

## 3.5 Migration reports

Migration reports record:

- migration identity;
- migration order;
- schema version before and after;
- whether the migration is additive;
- fresh-install results;
- upgrade-path results;
- retry behavior;
- failure behavior;
- data-preservation results;
- tenant-isolation results;
- audit-integrity results.

Historical migrations must not be rewritten.

## 3.6 External-operation reports

External-operation reports record operations involving:

- source providers;
- package registries;
- artifact registries;
- schema registries;
- databases;
- telemetry systems;
- infrastructure providers;
- deployment systems;
- message systems;
- feature-flag systems;
- identity providers;
- other external services.

Each record must identify:

- the external system;
- environment;
- exact operation;
- authorization;
- credential capability;
- network profile;
- start and end times;
- result;
- external identity;
- idempotency identity;
- reconciliation state;
- cleanup state.

A timeout or failed response does not prove that no external effect occurred.

Unknown external state must block blind retry and completion until reconciled.

## 3.7 Remediation reports

Remediation reports must identify:

- finding identity;
- source revision;
- source occurrence;
- evidence digest;
- coverage digest;
- human disposition;
- remediation authorization;
- reproduction result;
- baseline-gate result;
- transformation profile;
- changed-file allowlist;
- post-change-gate result;
- patch digest;
- determinism result;
- idempotency result;
- cleanup result;
- publication status.

A human confirmed_dead disposition is not remediation authorization.

## 3.8 Publication reports

Publication reports must identify:

- repository identity;
- base commit;
- patch digest;
- publication authorization;
- trusted-publisher identity;
- branch identity;
- draft pull-request identity;
- provider response;
- reconciliation result;
- cleanup result.

Publication reports must confirm that:

- no direct default-branch push occurred;
- no merge occurred;
- no auto-merge was enabled;
- no automatic ready-for-review transition occurred;
- no repository setting was changed;
- repository-controlled code was not executed in the trusted publisher.

## 3.9 Cleanup reports

Cleanup reports record the final state of temporary:

- processes;
- workspaces;
- credentials;
- containers;
- databases;
- branches;
- pull requests;
- test environments;
- queues;
- leases;
- artifacts;
- network resources;
- external resources.

Failed required cleanup must remain visible and must block completion.

## 3.10 Scale-validation reports

Scale-validation reports must distinguish:

- measured facts;
- derived values;
- estimates;
- assumptions;
- untested limits;
- saturation points;
- degradation behavior;
- safe operating envelopes.

Scale results must not be generalized beyond the exact tested workload and environment.

## 3.11 Incident reports

Incident reports may record:

- credential exposure;
- prohibited-repository access;
- tenant-isolation failure;
- runner escape;
- publisher-policy violation;
- audit-integrity failure;
- unauthorized production access;
- data exposure;
- uncontrolled external effects;
- uncontrolled cost;
- other security or safety incidents.

Incident records must include containment, credential revocation, external-state reconciliation, cleanup, and required human review.

# 4. File naming

Use lowercase, hyphen-separated names.

Recommended patterns:

- `phase-0-completion-{{timestamp}}.md`
- `phase-0-report-{{timestamp}}.json`
- `phase-0-tests-{{timestamp}}.json`
- `security-controls-{{phase_id}}-{{timestamp}}.json`
- `migration-validation-{{timestamp}}.md`
- `external-operation-{{operation_id}}.md`
- `remediation-attempt-{{attempt_id}}.md`
- `publication-{{publication_id}}.md`
- `cleanup-{{execution_id}}.md`
- `scale-validation-{{profile_id}}.md`
- `incident-{{incident_id}}.md`

Use a stable timestamp format such as:

`YYYYMMDDTHHMMSSZ`

Do not place secret values, access tokens, customer identifiers, email addresses, credential fragments, or sensitive payload data in filenames.

# 5. Report lifecycle

Recommended report statuses are:

- draft;
- final;
- superseded;
- archived.

## 5.1 Draft

A draft report may be incomplete.

It must clearly identify:

- incomplete sections;
- unresolved evidence;
- unverified claims;
- pending cleanup;
- unknown external state;
- pending human review.

## 5.2 Final

A report may be marked final only when:

- the recorded execution has stopped;
- material results are known;
- failures are visible;
- required cleanup status is recorded;
- unknown external state is recorded;
- limitations are documented;
- blockers are documented;
- report integrity checks have been performed.

A final report does not imply that the phase completed successfully.

## 5.3 Superseded

A report should be marked superseded when a corrected or more complete report replaces it.

The replacement report must identify the superseded report.

Superseded reports should remain available for audit history.

## 5.4 Archived

Archived reports remain historical records and must not be treated as current operational state.

# 6. Report integrity requirements

Every report must preserve the following distinctions:

- policy from implementation;
- authorization from execution;
- planned work from completed work;
- implementation from validation;
- passing tests from unavailable tests;
- passing tests from skipped tests;
- passing tests from partial tests;
- complete coverage from incomplete coverage;
- failed analysis from absence evidence;
- machine classification from human disposition;
- human disposition from remediation authorization;
- remediation authorization from publication authorization;
- local changes from external publication;
- confirmed external state from unknown external state;
- completed cleanup from retained or unresolved resources;
- measured facts from estimates;
- fixture-specific behavior from general support.

Reports must not claim:

- perfect dead-code detection;
- complete coverage without evidence;
- successful validation when required infrastructure was unavailable;
- successful remediation when required gates did not pass;
- successful publication when provider state is unknown;
- completed cleanup when temporary resources remain;
- functional support based only on fixtures or documentation.

# 7. Secret handling

Reports must not contain:

- access tokens;
- passwords;
- private keys;
- session cookies;
- authentication headers;
- credential-bearing URLs;
- database connection strings containing secrets;
- unrestricted environment-variable values;
- secret payloads;
- customer payload bodies;
- source-provider credentials;
- cloud credentials;
- publisher credentials.

Reports may identify:

- a credential capability ID;
- whether a capability was available;
- the authorized target;
- authorized operations;
- credential lifetime;
- revocation status;
- redacted diagnostic metadata.

Secret scanning should be performed before a report is retained, committed, exported, or published.

# 8. Repository and tenant scope

Reports involving repositories must record canonical repository identities.

Reports involving tenant data must record tenant scope.

A report must not combine evidence, findings, operations, credentials, or audit records from different tenants unless the aggregation is explicitly authorized and designed to preserve isolation.

The operation-specific repository-role exclusion policy remains applicable to
report generation.

Reports must not contain findings or derived target data produced through an
excluded repository role. Authorized implementation-development reporting is
independent.

# 9. Evidence references

Material report claims should reference stable evidence identities.

Evidence references should include, where applicable:

- evidence ID;
- evidence type;
- producer and version;
- source revision;
- target identity;
- configuration identity;
- environment identity;
- artifact digest;
- coverage digest;
- timestamp;
- retention state.

Reports should reference evidence rather than duplicating large raw artifacts.

Raw evidence must remain subject to retention, access, tenant-isolation, and secret-handling policy.

# 10. Corrections

Reports must not be silently rewritten to hide previous failures, limitations, incidents, or unknown state.

When correcting a material report:

- preserve the previous report;
- create a new report;
- identify the report being superseded;
- explain the correction;
- retain the original evidence;
- update the execution-state record;
- record the correction in the audit trail.

Minor formatting repairs may be applied when they do not change meaning, evidence, results, or recorded history.

# 11. Retention

Report retention must be defined by policy and authorization.

Retention decisions should consider:

- audit requirements;
- incident-investigation requirements;
- legal or contractual obligations;
- tenant requirements;
- evidence reproducibility;
- data minimization;
- secret-exposure risk;
- storage cost;
- supersession status.

Deleting or rewriting authoritative reports may be destructive and requires explicit authorization.

# 12. Required references

Reports should use the applicable policies and templates, including:

- `AGENTS.md`
- `CODEX_EXECUTION_STATE.md`
- `codex/core/04-accuracy-and-evidence-policy.md`
- `codex/core/05-phase-authorization-protocol.md`
- `codex/core/07-source-control-policy.md`
- `codex/core/08-secret-handling-policy.md`
- `codex/core/10-reporting-and-state-policy.md`
- `codex/access/external-operation-policy.md`
- `codex/architecture/evidence-model.md`
- `codex/architecture/coverage-model.md`
- `codex/architecture/classification-policy.md`
- `codex/architecture/remediation-policy.md`
- `codex/architecture/trusted-publisher-policy.md`
- `codex/architecture/audit-policy.md`
- `codex/engineering/testing-policy.md`
- `codex/tests/security-control-matrix.yaml`
- `codex/schemas/phase-report.schema.json`
- `codex/templates/phase-completion-report.md`

# 13. Current directory state

This directory is initially reserved for reports generated during future authorized execution.

The presence of this directory does not indicate that:

- a roadmap phase has executed;
- a test has passed;
- a capability is functional;
- remediation has occurred;
- publication has occurred;
- an external system has been accessed.

The `.gitkeep` file exists only to retain the empty directory in Git.

# 14. Final rule

Reports must tell the truth about what happened, what did not happen, what could not be verified, what remains unsafe or unknown, and what human decision is required next.

They must never create authority by describing future work.
