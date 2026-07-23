# DCAv2 Phase Completion Report

## Non-authorization notice

This report records work performed, evidence collected, tests executed, failures, limitations, cleanup, and handoff state for one authorized DCAv2 phase.

This report does not authorize implementation, continuation, repository access, credential use, external operations, remediation, publication, deployment, infrastructure modification, merge, destructive operations, or transition to another phase.

## 1. Report metadata

| Field | Value |
| --- | --- |
| Report ID | {{report_id}} |
| Report status | {{draft_or_final}} |
| Phase ID | {{phase_id}} |
| Phase title | {{phase_title}} |
| Report generated at | {{timestamp}} |
| Report owner | {{report_owner}} |
| Human phase authorizer | {{human_authorizer}} |
| Authorization ID | {{authorization_id}} |
| Authorization status at start | {{authorization_status_at_start}} |
| Authorization status at end | {{authorization_status_at_end}} |
| Local repository | {{repository_identity}} |
| Initial commit | {{initial_commit}} |
| Final commit | {{final_commit}} |
| Phase report schema | codex/schemas/phase-report.schema.json |
| Execution-state record | CODEX_EXECUTION_STATE.md |

## 2. Executive summary

### 2.1 Phase objective

{{phase_objective}}

### 2.2 Outcome

Phase result: {{completed|completed_with_limitations|partially_completed|blocked|failed|cancelled|expired|revoked|security_stopped}}

Capability outcome: {{functional|detection_only|partially_supported|blocked|not_applicable}}

{{outcome_summary}}

### 2.3 Completion statement

{{completion_statement}}

The completion statement must identify:

- what was implemented;
- what was validated;
- what remained partial, unsupported, unavailable, blocked, or untested;
- whether all active required tests passed;
- whether all activated conditional tests passed;
- whether all blocking security controls passed;
- whether required cleanup completed;
- whether any external state remains unresolved.

### 2.4 Important limitations

{{important_limitations_summary}}

### 2.5 Next human decision

{{next_human_decision}}

No subsequent phase or operation is authorized by this report.

## 3. Authorization record

### 3.1 Authorization summary

| Field | Value |
| --- | --- |
| Authorization ID | {{authorization_id}} |
| Authorized phase | {{authorized_phase_id}} |
| Human instruction reference | {{human_instruction_reference}} |
| Authorization objective | {{authorization_objective}} |
| Issued at | {{issued_at}} |
| Activated at | {{activated_at}} |
| Expired, completed, or revoked at | {{authorization_end_timestamp}} |
| Scope digest | {{scope_digest}} |
| Validation digest | {{authorization_validation_digest}} |
| Valid throughout execution | {{yes_or_no}} |

### 3.2 Authorized operations

| Operation | Authorized | Performed | Evidence |
| --- | --- | --- | --- |
| Local repository read | {{yes_or_no}} | {{yes_or_no}} | {{evidence_id}} |
| Local command execution | {{yes_or_no}} | {{yes_or_no}} | {{evidence_id}} |
| Tracked-file modification | {{yes_or_no}} | {{yes_or_no}} | {{evidence_id}} |
| New-file creation | {{yes_or_no}} | {{yes_or_no}} | {{evidence_id}} |
| Additive migration creation | {{yes_or_no}} | {{yes_or_no}} | {{evidence_id}} |
| External metadata read | {{yes_or_no}} | {{yes_or_no}} | {{evidence_id}} |
| External source read | {{yes_or_no}} | {{yes_or_no}} | {{evidence_id}} |
| Dependency installation | {{yes_or_no}} | {{yes_or_no}} | {{evidence_id}} |
| Remediation execution | {{yes_or_no}} | {{yes_or_no}} | {{evidence_id}} |
| External branch creation | {{yes_or_no}} | {{yes_or_no}} | {{evidence_id}} |
| Draft pull-request creation | {{yes_or_no}} | {{yes_or_no}} | {{evidence_id}} |
| Production access | {{yes_or_no}} | {{yes_or_no}} | {{evidence_id}} |
| Destructive operation | {{yes_or_no}} | {{yes_or_no}} | {{evidence_id}} |

### 3.3 Permanent restrictions

Confirm the following remained prohibited:

| Restriction | Result |
| --- | --- |
| Direct default-branch push | {{not_performed}} |
| Pull-request merge | {{not_performed}} |
| Auto-merge enablement | {{not_performed}} |
| Automatic ready-for-review transition | {{not_performed}} |
| Force push or history rewrite | {{not_performed}} |
| Branch-protection bypass | {{not_performed}} |
| Repository-settings change | {{not_performed}} |
| Repository deletion | {{not_performed}} |
| Prohibited-repository content access | {{not_performed}} |
| Secret-value disclosure | {{not_detected}} |
| Automatic human disposition | {{not_performed}} |
| Remediation based only on confirmed_dead | {{not_performed}} |
| Automatic phase transition | {{not_performed}} |

### 3.4 Authorization deviations

{{authorization_deviations_or_none}}

Any unauthorized or ambiguous operation must be reported as a failure or security incident. It must not be normalized as successful work.

## 4. Repository state

### 4.1 Repository identity

| Field | Initial state | Final state |
| --- | --- | --- |
| Repository identity | {{repository_identity}} | {{repository_identity}} |
| Local path | {{repository_path}} | {{repository_path}} |
| Remote identity | {{remote_identity}} | {{remote_identity}} |
| Branch | {{initial_branch}} | {{final_branch}} |
| Commit | {{initial_commit}} | {{final_commit}} |
| Worktree status | {{initial_worktree_status}} | {{final_worktree_status}} |
| Worktree-status digest | {{initial_status_digest}} | {{final_status_digest}} |

### 4.2 Pre-existing work

{{preexisting_work_summary}}

Confirm:

- [ ] pre-existing user changes were identified before modification;
- [ ] pre-existing changes were not reset, cleaned, overwritten, stashed, reverted, or silently incorporated;
- [ ] phase-generated changes remain distinguishable from pre-existing work;
- [ ] destructive Git operations were not performed.

### 4.3 Local commits

| Commit | Subject | Authorized | Purpose |
| --- | --- | --- | --- |
| {{commit}} | {{subject}} | {{yes_or_no}} | {{purpose}} |

State None when no local commits were created.

## 5. Scope reconciliation

### 5.1 Authorized scope

{{authorized_scope}}

### 5.2 Executed scope

{{executed_scope}}

### 5.3 Excluded scope

{{excluded_scope}}

### 5.4 Unsupported scope

{{unsupported_scope}}

### 5.5 Inaccessible scope

{{inaccessible_scope}}

### 5.6 Failed scope

{{failed_scope}}

### 5.7 Scope integrity

| Check | Result |
| --- | --- |
| Executed scope remained within authorization | {{yes_or_no}} |
| Repository access policy was evaluated | {{yes_or_no}} |
| Prohibited-repository policy was evaluated before content access | {{yes_or_no}} |
| No prohibited repository was accessed | {{yes_or_no}} |
| Unsupported scope remained visible | {{yes_or_no}} |
| Inaccessible scope remained visible | {{yes_or_no}} |
| Failed scope was not treated as absent | {{yes_or_no}} |
| Scope digest | {{scope_digest}} |

## 6. Objective results

| Objective ID | Objective | Status | Evidence | Notes |
| --- | --- | --- | --- | --- |
| {{objective_id}} | {{objective}} | `{{completed\|partial\|blocked}}` |  |  |

Do not report an objective as completed when required validation was skipped, unavailable, blocked, or failed.

## 7. Implementation summary

### 7.1 Work completed

{{completed_work}}

### 7.2 Work partially completed

{{partial_work}}

### 7.3 Work not completed

{{not_completed_work}}

### 7.4 Preserved existing behavior

{{preserved_behavior}}

### 7.5 Deferred work

{{deferred_work}}

Deferred work is not authorized merely because it appears in this report.

## 8. Changed-file inventory

### 8.1 Summary

| Change type | Count |
| --- | --- |
| Added | {{count}} |
| Modified | {{count}} |
| Deleted | {{count}} |
| Renamed | {{count}} |
| Mode changed | {{count}} |
| Symbolic link changed | {{count}} |
| Binary changed | {{count}} |
| Total changed files | {{count}} |
| Unexpected changes | {{count}} |
| Pre-existing changes incorporated | {{yes_or_no}} |

### 8.2 File records

| Path | Change | Origin | Authorized | Purpose | Before digest | After digest |
| --- | --- | --- | --- | --- | --- | --- |
| {{path}} | {{change_type}} | `{{preexisting\|current_phase\|unknown}}` | {{yes_or_no}} | {{purpose}} |  |  |

### 8.3 Change-set result

Change-set digest: {{change_set_digest}}

{{change_set_assessment}}

Unexpected changes must block remediation completion and publication.

## 9. Dependency and tool decisions

### 9.1 Dependency changes

| Dependency | Previous version | New version | Change | Mandatory | License review | Security review | Decision record |
| --- | --- | --- | --- | --- | --- | --- | --- |
| {{dependency}} | {{previous_version}} | {{new_version}} | {{change_type}} | {{yes_or_no}} | {{status}} | {{status}} | {{record}} |

State None when no dependencies changed.

### 9.2 Tools used or evaluated

| Tool ID | Version | Purpose | Status | Provenance | Integrity | License | Security |
| --- | --- | --- | --- | --- | --- | --- | --- |
| {{tool_id}} | {{version}} | {{purpose}} | `{{used\|evaluated\|unavailable\|rejected\|not_applicable}}` |  |  |  |  |

### 9.3 Tool-resolution failures

{{tool_resolution_failures_or_none}}

An unavailable required tool is not a passing result.

## 10. Capability results

| Capability ID | Before | After | Implementation | Validation | Scale | Evidence | Limitations |
| --- | --- | --- | --- | --- | --- | --- | --- |
| {{capability_id}} | {{support_status}} | {{support_status}} | {{implementation_status}} | {{validation_status}} | {{scale_status}} | {{evidence_ids}} | {{limitations}} |

Allowed support statuses include:

- planned;
- experimental;
- detection_only;
- partially_supported;
- functional;
- blocked;
- unsupported;
- deprecated;
- superseded.

A capability may be reported as functional only when implementation is complete, required validation passed, required security controls passed, evidence is current, and stated limitations do not contradict the claim.

## 11. Evidence and coverage

### 11.1 Evidence summary

| Evidence ID | Type | Producer | Source revision | Target | Status | Digest |
| --- | --- | --- | --- | --- | --- | --- |
| {{evidence_id}} | {{evidence_type}} | {{producer_and_version}} | {{source_revision}} | {{target_identity}} | `{{current\|partial}}` |  |

### 11.2 Coverage summary

| Scope | Coverage status | Required dimensions complete | Failed dimensions | Unsupported dimensions | Digest |
| --- | --- | --- | --- | --- | --- |
| {{scope_identity}} | `{{complete\|partial\|failed\|unsupported\|not_applicable}}` |  |  |  |  |

### 11.3 Open-world integrity

Confirm:

- [ ] failed analysis was not converted into zero references;
- [ ] unsupported scope was not silently omitted;
- [ ] inaccessible scope was not treated as absent;
- [ ] incomplete coverage did not become complete coverage;
- [ ] runtime non-observation was not treated as proof of deadness;
- [ ] positive liveness evidence was not overridden by weaker absence evidence;
- [ ] stale evidence was not accepted as current evidence.

{{evidence_and_coverage_notes}}

## 12. Finding and disposition results

### 12.1 Finding counts

| Finding state | Count |
| --- | --- |
| Total | {{count}} |
| candidate_dead | {{count}} |
| live | {{count}} |
| inconclusive | {{count}} |
| unsupported | {{count}} |
| failed | {{count}} |
| confirmed_dead | {{count}} |
| confirmed_live | {{count}} |
| needs_investigation | {{count}} |

### 12.2 Material findings

| Finding ID | Target | Classification | Disposition | Source commit | Evidence digest | Coverage digest | Current |
| --- | --- | --- | --- | --- | --- | --- | --- |
| {{finding_id}} | {{target_identity}} | {{classification}} | {{disposition_or_none}} | {{commit}} | {{evidence_digest}} | {{coverage_digest}} | {{yes_or_no}} |

### 12.3 Disposition integrity

| Check | Result |
| --- | --- |
| Machine classification automatically created a human disposition | No |
| Every human disposition has an attributable actor | {{yes_or_no}} |
| Every disposition is bound to an exact finding version | {{yes_or_no}} |
| Revocation and supersession history is preserved | {{yes_or_no}} |
| Stale dispositions were rejected | {{yes_or_no}} |

## 13. Test results

### 13.1 Test manifest

| Field | Value |
| --- | --- |
| Manifest path | {{test_manifest_path}} |
| Manifest ID | {{manifest_id}} |
| Manifest digest | {{manifest_digest}} |
| Required tests satisfied | {{yes_or_no}} |
| Activated conditional tests satisfied | {{yes_or_no}} |
| False-pass count | 0 |

### 13.2 Test totals

| Status | Count |
| --- | --- |
| Total | {{count}} |
| Passed | {{count}} |
| Failed | {{count}} |
| Blocked | {{count}} |
| Partial | {{count}} |
| Skipped | {{count}} |
| Unavailable | {{count}} |
| Not run | {{count}} |
| Not applicable | {{count}} |

### 13.3 Individual test records

| Test ID | Requirement | Activated | Status | Environment | Evidence | Cleanup |
| --- | --- | --- | --- | --- | --- | --- |
| {{test_id}} | `{{required\|conditional\|informational}}` | {{yes_or_no}} | {{status}} | {{environment_identity}} |  |  |

### 13.4 Failed tests

{{failed_tests_or_none}}

### 13.5 Blocked tests

{{blocked_tests_or_none}}

### 13.6 Skipped tests

{{skipped_tests_or_none}}

### 13.7 Unavailable tests

{{unavailable_tests_or_none}}

Skipped and unavailable required tests must not be reported as passed.

## 14. Security-control results

### 14.1 Security matrix

| Field | Value |
| --- | --- |
| Matrix path | codex/tests/security-control-matrix.yaml |
| Matrix digest | {{security_matrix_digest}} |
| Blocking controls satisfied | {{yes_or_no}} |
| Open security incidents | {{count}} |

### 14.2 Control totals

| Status | Count |
| --- | --- |
| Required | {{count}} |
| Passed | {{count}} |
| Failed | {{count}} |
| Partial | {{count}} |
| Blocked | {{count}} |
| Not run | {{count}} |
| Unavailable | {{count}} |
| Stale | {{count}} |
| Not applicable | {{count}} |

### 14.3 Control records

| Control ID | Status | Blocking | Evidence | Exception | Notes |
| --- | --- | --- | --- | --- | --- |
| {{control_id}} | {{status}} | {{yes_or_no}} | {{evidence_ids}} | {{exception_id_or_none}} | {{notes}} |

### 14.4 Security failures

{{security_failures_or_none}}

A failed critical security control requires the phase to stop or remain blocked.

## 15. Database and migration results

### 15.1 Database scope

| Field | Value |
| --- | --- |
| Database used | {{yes_or_no}} |
| Database identity | {{database_identity}} |
| Environment | {{environment}} |
| Initial schema version | {{initial_schema_version}} |
| Final schema version | {{final_schema_version}} |
| Production database accessed | {{yes_or_no}} |
| Historical migrations rewritten | No |
| Audit history modified | No |

### 15.2 Migration records

| Migration ID | Order | Path | Change type | Additive | Status | Digest |
| --- | --- | --- | --- | --- | --- | --- |
| {{migration_id}} | {{order}} | {{path}} | {{change_type}} | {{yes_or_no}} | {{status}} | {{digest}} |

### 15.3 Migration validation

| Validation | Status |
| --- | --- |
| Fresh installation | {{status}} |
| Upgrade from previous schema | {{status}} |
| Retry behavior | {{status}} |
| Failure behavior | {{status}} |
| Existing records preserved | {{status}} |
| Tenant isolation preserved | {{status}} |
| Audit integrity preserved | {{status}} |

{{migration_notes}}

## 16. Remediation results

### 16.1 Remediation summary

| Field | Value |
| --- | --- |
| Remediation attempted | {{yes_or_no}} |
| Phase authorization used as remediation authority | No |
| confirmed_dead used as remediation authority | No |
| Successful attempts | {{count}} |
| Failed attempts | {{count}} |
| Blocked attempts | {{count}} |
| Cancelled attempts | {{count}} |

### 16.2 Remediation attempts

| Attempt ID | Finding ID | Authorization ID | Reproduction | Baseline | Transformation | Changed files | Post-change | Patch | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| {{attempt_id}} | {{finding_id}} | {{authorization_id}} | {{status}} | {{status}} | {{status}} | {{status}} | {{status}} | {{status}} | {{status}} |

### 16.3 Exact reproduction

{{reproduction_results_or_not_applicable}}

### 16.4 Baseline verification

{{baseline_results_or_not_applicable}}

### 16.5 Transformation

{{transformation_results_or_not_applicable}}

### 16.6 Changed-file validation

{{changed_file_validation_or_not_applicable}}

### 16.7 Post-change verification

{{post_change_results_or_not_applicable}}

### 16.8 Patch identity

| Field | Value |
| --- | --- |
| Patch generated | {{yes_or_no}} |
| Patch digest | {{patch_digest}} |
| Deterministic across repeated runs | {{yes_or_no}} |
| Second application made additional changes | {{yes_or_no}} |
| Patch retained | {{yes_or_no}} |
| Retention authorization | {{authorization_id_or_not_applicable}} |

## 17. Publication results

### 17.1 Publication summary

| Field | Value |
| --- | --- |
| Publication attempted | {{yes_or_no}} |
| Trusted publisher used | {{yes_or_no}} |
| Draft pull requests created | {{count}} |
| Direct default-branch pushes | 0 |
| Merges | 0 |
| Auto-merges enabled | 0 |
| Automatic ready transitions | 0 |
| Unknown external publication states | {{count}} |

### 17.2 Publication records

| Publication ID | Repository | Base commit | Patch digest | Authorization | Status | Branch | Draft pull request | Reconciled |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| {{publication_id}} | {{repository}} | {{base_commit}} | {{patch_digest}} | {{authorization_id}} | {{status}} | {{branch_identity}} | {{pull_request_identity}} | {{yes_or_no}} |

### 17.3 Publication restrictions

Confirm:

- [ ] publication did not execute repository-controlled code;
- [ ] publisher credentials were not available to untrusted runners;
- [ ] only the exact authorized patch was accepted;
- [ ] no default-branch write occurred;
- [ ] no merge or auto-merge occurred;
- [ ] no automatic ready-for-review transition occurred;
- [ ] no repository setting was changed;
- [ ] unknown external state blocked blind retry.

{{publication_notes}}

## 18. External operations

### 18.1 Summary

| Status | Count |
| --- | --- |
| Total | {{count}} |
| Successful | {{count}} |
| Failed | {{count}} |
| Blocked | {{count}} |
| Cancelled | {{count}} |
| Unknown state | {{count}} |
| Unauthorized | 0 |
| Production operations | {{count}} |

### 18.2 Operation records

| Operation ID | System | Environment | Operation | Authorization | Credential capability | Network profile | Status | Production | Cleanup |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| {{operation_id}} | {{system_identity}} | {{environment}} | {{operation}} | {{authorization_id}} | {{credential_capability}} | {{network_profile}} | {{status}} | {{yes_or_no}} | {{cleanup_status}} |

### 18.3 Unknown external state

{{unknown_external_state_or_none}}

A timeout or failed response does not prove that an external side effect did not occur. Unknown state must be reconciled before retry or completion.

## 19. Resource and cost results

### 19.1 Resource usage

| Resource | Measured value |
| --- | --- |
| CPU seconds | {{value}} |
| Maximum memory bytes | {{value}} |
| Maximum disk bytes | {{value}} |
| Network bytes | {{value}} |
| Artifact bytes | {{value}} |
| Database bytes added | {{value}} |
| Worker count | {{value}} |
| Maximum concurrency | {{value}} |

### 19.2 Cost

| Field | Value |
| --- | --- |
| Measured cost | {{value}} {{currency}} |
| Estimated cost | {{value}} {{currency}} |
| Authorized budget | {{value}} {{currency}} |
| Budget exceeded | {{yes_or_no}} |
| Measurement method | {{method}} |

{{resource_and_cost_notes}}

## 20. Scale-validation results

Complete this section only when scale validation was authorized and performed.

| Field | Value |
| --- | --- |
| Scale validation performed | {{yes_or_no}} |
| Status | {{scale_status}} |
| Environment identity | {{environment_identity}} |
| Workload identity | {{workload_identity}} |
| Dataset identity | {{dataset_identity}} |
| Scale report identity | {{scale_report_identity}} |
| Measured facts separated from estimates | {{yes_or_no}} |
| Unbounded scale claimed | No |

### 20.1 Tested limits

| Dimension | Value | Unit | Status | Environment | Limitations |
| --- | --- | --- | --- | --- | --- |
| {{dimension}} | {{value}} | {{unit}} | {{status}} | {{environment_identity}} | {{limitations}} |

### 20.2 Validated operating envelope

{{validated_operating_envelope}}

### 20.3 Saturation points and degradation behavior

{{saturation_and_degradation_results}}

### 20.4 Untested and non-generalizable scale

{{untested_scale}}

Do not extrapolate beyond the exact measured profile without clearly labeling the statement as an estimate or assumption.

## 21. Security incidents

| Incident ID | Category | Severity | Status | Description | Containment | Credentials revoked | Human review |
| --- | --- | --- | --- | --- | --- | --- | --- |
| {{incident_id}} | {{category}} | {{severity}} | {{status}} | {{description}} | {{containment_status}} | {{yes_or_no}} | {{yes_or_no}} |

State None when no security incidents occurred.

For each incident, document:

- when it was detected;
- affected tenants, repositories, systems, credentials, and operations;
- containment performed;
- credentials revoked;
- external state requiring reconciliation;
- cleanup completed;
- required human review;
- safe recovery conditions.

## 22. Cleanup

### 22.1 Cleanup summary

| Field | Value |
| --- | --- |
| Required cleanup complete | {{yes_or_no}} |
| Temporary credentials remaining | 0 |
| Uncontrolled processes remaining | 0 |
| Unresolved temporary resources | {{count}} |
| Cleanup digest | {{cleanup_digest}} |

### 22.2 Cleanup records

| Cleanup ID | Resource type | Resource identity | Required | Status | Authorization | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| {{cleanup_id}} | {{resource_type}} | {{resource_identity}} | {{yes_or_no}} | {{status}} | {{authorization_id_or_none}} | {{evidence_id}} |

### 22.3 Authorized retained resources

| Resource | Type | Authorization | Reason | Expiration |
| --- | --- | --- | --- | --- |
| {{resource_identity}} | {{resource_type}} | {{authorization_id}} | {{reason}} | {{expiration}} |

State None when no temporary resources were retained.

Failed required cleanup blocks phase completion.

## 23. Limitations

| Limitation ID | Category | Description | Impact | Affected capabilities | Resolution phase | Safe next action |
| --- | --- | --- | --- | --- | --- | --- |
| {{limitation_id}} | {{category}} | {{description}} | {{impact}} | {{capability_ids}} | {{phase_id_or_unknown}} | {{safe_next_action}} |

Limitations must include all relevant:

- unsupported languages, frameworks, package managers, source shapes, and configurations;
- incomplete evidence or coverage;
- unavailable tools or infrastructure;
- fixture-only behavior;
- detection-only behavior;
- remediation or publication restrictions;
- runtime and external-consumer uncertainty;
- scale, performance, and cost boundaries;
- untested environments and production restrictions.

## 24. Blockers

| Blocker ID | Category | Status | Description | Affected capabilities | Evidence | Safe next action |
| --- | --- | --- | --- | --- | --- | --- |
| {{blocker_id}} | {{category}} | `{{open\|resolved\|accepted_limitation\|superseded}}` | {{description}} |  |  |  |

State None only when no blocker remains.

A blocker must not be omitted merely because it belongs to infrastructure, tooling, authorization, access, cleanup, or an external system rather than source code.

## 25. Evidence index

| Evidence ID | Type | Description | Location or identity | Digest | Secret-free | Retained |
| --- | --- | --- | --- | --- | --- | --- |
| {{evidence_id}} | {{evidence_type}} | {{description}} | {{path_or_identity}} | {{digest}} | {{yes_or_no}} | {{yes_or_no}} |

Evidence must be sufficient to reproduce or independently verify material claims where practical.

Secret values must not appear in the evidence index or retained artifacts.

## 26. Audit integrity

| Check | Result |
| --- | --- |
| Required audit events recorded | {{yes_or_no}} |
| Audit history remained append-only | {{yes_or_no}} |
| Tamper-evidence verification passed | {{yes_or_no}} |
| Actor attribution present | {{yes_or_no}} |
| Tenant attribution present | {{yes_or_no}} |
| Authorization attribution present | {{yes_or_no}} |
| Secret values detected in audit data | {{count}} |
| Audit verification identity | {{identity}} |
| Audit digest or chain state | {{digest_or_identity}} |

{{audit_notes}}

## 27. Report integrity

Confirm all statements below.

| Integrity requirement | Result |
| --- | --- |
| Material claims are evidence-backed | {{yes_or_no}} |
| Failed tests are visible | {{yes_or_no}} |
| Blocked tests are visible | {{yes_or_no}} |
| Skipped tests are visible | {{yes_or_no}} |
| Unavailable tests are visible | {{yes_or_no}} |
| Limitations are visible | {{yes_or_no}} |
| Blockers are visible | {{yes_or_no}} |
| Fixture-only behavior is labeled | {{yes_or_no}} |
| Measured facts are separated from estimates | {{yes_or_no}} |
| Perfect detection is claimed | No |
| Secret values are present | No |
| Report digest | {{report_digest}} |
| Report validation identity | {{validation_identity}} |

## 28. Handoff

### 28.1 Execution state

| Field | Value |
| --- | --- |
| Execution-state path | CODEX_EXECUTION_STATE.md |
| Execution state updated | {{yes_or_no}} |
| Execution-state digest | {{execution_state_digest}} |
| Current authorization status | {{status}} |
| Required cleanup complete | {{yes_or_no}} |
| Unknown external state remains | {{yes_or_no}} |
| Open blocker count | {{count}} |
| Open incident count | {{count}} |

### 28.2 Next phase

| Field | Value |
| --- | --- |
| Potential next phase | {{next_phase_id_or_none}} |
| Next phase authorized | No |
| Automatic continuation permitted | No |
| New explicit human authorization required | Yes |

### 28.3 Next safe action

{{next_safe_action}}

### 28.4 Required human decision

{{required_human_decision}}

### 28.5 Retained external state

{{retained_external_state_or_none}}

### 28.6 Continuation statement

Completion of this report does not authorize further implementation or execution.

A roadmap entry, report, test result, generated continuation prompt, remaining task, available credential, open pull request, or execution-state record cannot activate another phase.

## 29. Human review

| Review role | Reviewer | Decision | Timestamp | Notes |
| --- | --- | --- | --- | --- |
| Phase authorizer | {{reviewer}} | `{{accepted\|rejected\|changes_required}}` |  |  |
| Security reviewer | {{reviewer}} | `{{accepted\|rejected\|changes_required}}` |  |  |
| Database reviewer | {{reviewer}} | `{{accepted\|rejected\|changes_required}}` |  |  |
| Remediation reviewer | {{reviewer}} | `{{accepted\|rejected\|changes_required}}` |  |  |
| Publication reviewer | {{reviewer}} | `{{accepted\|rejected\|changes_required}}` |  |  |

Human acceptance of this report acknowledges the recorded outcome. It does not implicitly authorize additional work.

## 30. Final declaration

This report truthfully distinguishes:

- implemented work from planned work;
- tested behavior from assumed behavior;
- passing tests from failed, blocked, skipped, unavailable, partial, or untested tests;
- complete coverage from partial, failed, unsupported, inaccessible, stale, or unknown coverage;
- machine classification from human disposition;
- human disposition from remediation authorization;
- remediation authorization from publication authorization;
- local candidate changes from external publication;
- measured scale from estimated or untested scale;
- completed cleanup from unresolved or retained state.

Final phase status: {{phase_status}}

Final capability outcome: {{capability_outcome}}

New human authorization required before further work: Yes