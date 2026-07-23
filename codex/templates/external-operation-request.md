# External Operation Request

## Non-authorization notice

This request describes a proposed operation involving an external repository, provider, registry, database, telemetry system, infrastructure system, deployment system, message system, or other external service.

Submitting, generating, or reviewing this request does not authorize the operation.

The operation may proceed only after a human grants current, explicit, operation-specific authorization under the Phase Authorization Protocol.

## 1. Request metadata

| Field | Value |
| --- | --- |
| Request ID | {{request_id}} |
| Request status | `{{draft}}` |
| Requested by | {{requester}} |
| Requested at | {{requested_at}} |
| Target phase | {{phase_id}} |
| Phase authorization ID | {{phase_authorization_id_or_none}} |
| Human reviewer | {{reviewer_or_unassigned}} |
| Review deadline | {{review_deadline_or_none}} |
| Related capability IDs | {{capability_ids}} |
| Related finding IDs | {{finding_ids_or_none}} |
| Related remediation attempt IDs | {{remediation_attempt_ids_or_none}} |
| Related publication IDs | {{publication_ids_or_none}} |

## 2. Request summary

### 2.1 Requested operation

{{requested_operation_summary}}

### 2.2 Business or engineering purpose

{{operation_purpose}}

### 2.3 Why the external operation is necessary

{{necessity_explanation}}

### 2.4 Expected result

{{expected_result}}

### 2.5 Consequence of not performing the operation

{{consequence_of_denial_or_deferral}}

## 3. External system identity

| Field | Value |
| --- | --- |
| System type | {{system_type}} |
| System identity | {{system_identity}} |
| Provider | {{provider_or_not_applicable}} |
| Environment | {{environment}} |
| Tenant or organization | {{tenant_or_organization}} |
| Region | {{region_or_not_applicable}} |
| Production system | {{yes_or_no}} |
| Customer data may be present | {{yes_no_unknown}} |
| Secret-bearing data may be present | {{yes_no_unknown}} |

Allowed system types include:

- source_provider
- package_registry
- artifact_registry
- schema_registry
- telemetry_system
- infrastructure_provider
- database
- message_system
- deployment_system
- feature_flag_system
- identity_provider
- ticketing_system
- other

## 4. Repository identity

Complete this section when the operation involves a source repository.

| Field | Value |
| --- | --- |
| Source provider | {{source_provider}} |
| Canonical repository name | {{owner/repository}} |
| Provider repository ID | {{repository_id_or_unknown}} |
| Repository URL | {{repository_url_without_credentials}} |
| Visibility | `{{public}}` |
| Branch | {{branch_or_not_applicable}} |
| Immutable commit | {{commit_or_not_applicable}} |
| Default branch | {{default_branch_or_unknown}} |
| Fork, mirror, or alias | {{yes_or_no}} |
| Submodule or nested repository | {{yes_or_no}} |

### 4.1 Repository policy decision

| Check | Result |
| --- | --- |
| Canonical identity resolved | {{yes_or_no}} |
| Repository access policy evaluated | {{yes_or_no}} |
| Prohibited-repository policy evaluated before content access | {{yes_or_no}} |
| Repository is prohibited | {{yes_or_no}} |
| Repository is within standing eligibility scope | {{yes_or_no}} |
| Current authorization names the repository | {{yes_or_no}} |
| Current authorization names the operation | {{yes_or_no}} |
| Current authorization names the branch or commit | {{yes_or_no}} |
| Access decision | `{{allow}}` |
| Policy-decision evidence ID | {{evidence_id}} |

A prohibited repository must be denied before branch, commit, tree, file, package, source, qualification, analysis, remediation, or publication access.

## 5. Exact operation scope

### 5.1 Operation type

Select every operation requested.

- [ ] Account or organization discovery
- [ ] Repository metadata read
- [ ] Repository clone
- [ ] Repository fetch
- [ ] Source read
- [ ] Qualification
- [ ] Static analysis
- [ ] Isolated build
- [ ] Isolated test execution
- [ ] Dependency download
- [ ] Package-registry read
- [ ] Artifact-registry read
- [ ] Database read
- [ ] Database write
- [ ] Telemetry query
- [ ] Infrastructure metadata read
- [ ] Contract or schema retrieval
- [ ] Message-system metadata read
- [ ] Local candidate modification
- [ ] External source modification
- [ ] External branch creation
- [ ] Draft pull-request creation
- [ ] Provider comment creation
- [ ] Issue creation
- [ ] Artifact upload
- [ ] Temporary external resource creation
- [ ] Temporary external resource deletion
- [ ] Production access
- [ ] Destructive operation
- [ ] Other

Other operation: {{other_operation_or_not_applicable}}

### 5.2 Exact operation description

{{exact_operation_description}}

### 5.3 Target resources

| Resource type | Resource identity | Environment | Operation |
| --- | --- | --- | --- |
| {{resource_type}} | {{resource_identity}} | {{environment}} | {{operation}} |

### 5.4 Allowed paths, objects, or queries

{{allowed_paths_objects_or_queries}}

### 5.5 Explicit exclusions

{{explicit_exclusions}}

### 5.6 Maximum operation count

{{maximum_operation_count}}

### 5.7 Maximum duration

{{maximum_duration}}

### 5.8 Maximum data volume

{{maximum_data_volume}}

## 6. Permission separation

Confirm that the requested operation does not infer unrelated permissions.

| Permission relationship | Result |
| --- | --- |
| Metadata access implies source access | No |
| Source access implies modification | No |
| Analysis implies remediation | No |
| Human confirmed_dead disposition implies remediation | No |
| Remediation implies publication | No |
| Branch creation implies pull-request creation | No |
| Draft pull-request creation implies ready-for-review transition | No |
| Draft pull-request creation implies merge | No |
| Repository access implies production access | No |
| Temporary resource creation implies destructive cleanup authority | No |

Each operation requires its own current authorization.

## 7. Authorization requirements

### 7.1 Phase authorization

| Field | Value |
| --- | --- |
| Authorization ID | {{authorization_id}} |
| Authorization status | `{{active}}` |
| Authorized phase | {{phase_id}} |
| Human authorizer | {{human_authorizer}} |
| Human instruction reference | {{instruction_reference}} |
| Scope digest | {{scope_digest}} |
| Issued at | {{issued_at}} |
| Expires at or when | {{expiration}} |
| Valid for this operation | {{yes_or_no}} |

### 7.2 Additional authorization

| Authorization type | Required | Authorization ID | Status |
| --- | --- | --- | --- |
| Repository read authorization | {{yes_or_no}} | {{id_or_none}} | {{status}} |
| Dependency-installation authorization | {{yes_or_no}} | {{id_or_none}} | {{status}} |
| Database-access authorization | {{yes_or_no}} | {{id_or_none}} | {{status}} |
| Production-access authorization | {{yes_or_no}} | {{id_or_none}} | {{status}} |
| Finding-specific remediation authorization | {{yes_or_no}} | {{id_or_none}} | {{status}} |
| Publication authorization | {{yes_or_no}} | {{id_or_none}} | {{status}} |
| Destructive-operation authorization | {{yes_or_no}} | {{id_or_none}} | {{status}} |
| Governance-modification authorization | {{yes_or_no}} | {{id_or_none}} | {{status}} |

### 7.3 Authorization validation

{{authorization_validation_summary}}

The operation must be denied when authorization is missing, inactive, ambiguous, expired, revoked, mismatched, or insufficiently specific.

## 8. Credential requirements

### 8.1 Credential capabilities

| Capability ID | Purpose | Target scope | Operations | Lifetime | External writes |
| --- | --- | --- | --- | --- | --- |
| {{credential_capability}} | {{purpose}} | {{target_scope}} | {{operations}} | {{lifetime}} | {{yes_or_no}} |

Do not include credential values, tokens, passwords, private keys, cookies, authentication headers, or credential-bearing URLs.

### 8.2 Credential minimization

| Requirement | Result |
| --- | --- |
| Minimum required capability selected | {{yes_or_no}} |
| Credential target is restricted | {{yes_or_no}} |
| Credential operations are restricted | {{yes_or_no}} |
| Credential lifetime is restricted | {{yes_or_no}} |
| Credential unavailable to untrusted repository content | {{yes_or_no}} |
| Credential unavailable outside the authorized component | {{yes_or_no}} |
| Credential revocation defined | {{yes_or_no}} |
| Secret values excluded from retained evidence | {{yes_or_no}} |

### 8.3 Credential revocation

{{credential_revocation_plan}}

## 9. Network requirements

| Field | Value |
| --- | --- |
| Network profile | {{network_profile}} |
| Network required | {{yes_or_no}} |
| Network mode | `{{disabled}}` |
| TLS required | {{yes_or_no}} |
| Proxy required | {{yes_or_no}} |
| Repository content may add destinations | No |

### 9.1 Allowed destinations

| Destination | Port or protocol | Purpose | Credential capability |
| --- | --- | --- | --- |
| {{destination}} | {{port_or_protocol}} | {{purpose}} | {{credential_capability_or_none}} |

### 9.2 Prohibited destinations

{{prohibited_destinations}}

The request must not authorize arbitrary internet access, cloud metadata access, unrelated provider access, or repository-selected destinations.

## 10. Execution boundary

| Field | Value |
| --- | --- |
| Executing component | {{component}} |
| Trust zone | `{{trusted_controller}}` |
| Runner profile | {{runner_profile_or_not_applicable}} |
| Repository-controlled code executed | {{yes_or_no}} |
| Trusted credentials present | {{yes_or_no}} |
| Structured-command ID | {{command_id_or_not_applicable}} |
| Command registry version | {{registry_version_or_not_applicable}} |

### 10.1 Required isolation controls

- [ ] Non-root execution
- [ ] Privileged mode disabled
- [ ] Docker socket denied
- [ ] Cloud metadata denied
- [ ] Host filesystem access denied except authorized mounts
- [ ] Repository paths confined
- [ ] Symbolic-link escape denied
- [ ] Process limit applied
- [ ] CPU limit applied
- [ ] Memory limit applied
- [ ] Disk limit applied
- [ ] Timeout applied
- [ ] Output limit applied
- [ ] Network destinations allowlisted
- [ ] Complete process-tree cleanup required
- [ ] Temporary credential cleanup required
- [ ] Structured output validation required
- [ ] Secret scanning required

### 10.2 Isolation notes

{{isolation_notes}}

## 11. Data-access scope

### 11.1 Data requested

| Data category | Fields or objects | Purpose | Sensitivity | Retention |
| --- | --- | --- | --- | --- |
| {{data_category}} | {{fields_or_objects}} | {{purpose}} | `{{public\|internal}}` |  |

### 11.2 Data explicitly prohibited

{{prohibited_data}}

Examples may include:

- secret values;
- authentication material;
- unrestricted environment variables;
- customer payloads;
- request or response bodies;
- message contents;
- unrelated source files;
- unrestricted logs;
- personally identifiable information;
- financial or health information;
- production database rows outside the approved query;
- unrelated tenant data.

### 11.3 Data minimization

{{data_minimization_plan}}

### 11.4 Redaction

{{redaction_plan}}

### 11.5 Tenant isolation

{{tenant_isolation_plan}}

## 12. Source-provider write controls

Complete this section when the operation includes provider writes.

### 12.1 Allowed provider writes

| Operation | Allowed | Exact target |
| --- | --- | --- |
| Non-default branch creation | {{yes_or_no}} | {{branch_identity}} |
| Draft pull-request creation | {{yes_or_no}} | {{base_and_head}} |
| Provider comment creation | {{yes_or_no}} | {{target_identity}} |
| Issue creation | {{yes_or_no}} | {{repository}} |
| Artifact upload | {{yes_or_no}} | {{target_identity}} |

### 12.2 Permanently prohibited provider actions

| Action | Status |
| --- | --- |
| Direct default-branch push | Prohibited |
| Pull-request ready-for-review transition | Prohibited |
| Pull-request merge | Prohibited |
| Auto-merge enablement | Prohibited |
| Force push | Prohibited |
| History rewrite | Prohibited |
| Branch-protection bypass | Prohibited |
| Repository-settings change | Prohibited |
| Repository deletion | Prohibited |
| Release publication | Prohibited unless separately governed and explicitly authorized |

### 12.3 Trusted publisher requirements

| Requirement | Result |
| --- | --- |
| Trusted publisher required | {{yes_or_no}} |
| Repository-controlled code execution disabled | {{yes_or_no}} |
| Exact repository validated | {{yes_or_no}} |
| Exact base commit validated | {{yes_or_no}} |
| Exact patch digest validated | {{yes_or_no}} |
| Publication authorization validated | {{yes_or_no}} |
| Required verification gates passed | {{yes_or_no}} |
| Draft-only state enforced | {{yes_or_no}} |
| Idempotency identity defined | {{yes_or_no}} |

## 13. Remediation-specific controls

Complete this section when the requested operation includes remediation.

| Requirement | Result |
| --- | --- |
| Current finding exists | {{yes_or_no}} |
| Exact immutable source revision recorded | {{yes_or_no}} |
| Human disposition is confirmed_dead | {{yes_or_no}} |
| Human disposition is current | {{yes_or_no}} |
| Finding-specific remediation authorization exists | {{yes_or_no}} |
| Exact finding reproduction required | {{yes_or_no}} |
| Baseline gates defined | {{yes_or_no}} |
| Baseline gates passed | {{yes_or_no}} |
| Structured transformation defined | {{yes_or_no}} |
| Exact changed-file allowlist defined | {{yes_or_no}} |
| Post-change gates defined | {{yes_or_no}} |
| Deterministic patch required | {{yes_or_no}} |
| Publication permission is separate | {{yes_or_no}} |

### 13.1 Finding identity

| Field | Value |
| --- | --- |
| Finding ID | {{finding_id}} |
| Repository | {{repository}} |
| Source commit | {{source_commit}} |
| Package | {{package_identity}} |
| Module | {{module_identity}} |
| File | {{file_path}} |
| Symbol | {{symbol_identity}} |
| Source occurrence | {{source_occurrence}} |
| Evidence digest | {{evidence_digest}} |
| Coverage digest | {{coverage_digest}} |
| Disposition ID | {{disposition_id}} |
| Remediation authorization ID | {{remediation_authorization_id}} |

confirmed_dead alone does not authorize remediation.

## 14. Database-operation controls

Complete this section when the requested operation involves a database.

| Field | Value |
| --- | --- |
| Database identity | {{database_identity}} |
| Environment | {{environment}} |
| Tenant scope | {{tenant_scope}} |
| Read-only | {{yes_or_no}} |
| Migration involved | {{yes_or_no}} |
| Backfill involved | {{yes_or_no}} |
| Destructive statement involved | {{yes_or_no}} |
| Production database | {{yes_or_no}} |
| Transaction required | {{yes_or_no}} |
| Rollback or forward recovery defined | {{yes_or_no}} |

### 14.1 Allowed statements or operations

{{allowed_database_operations}}

### 14.2 Prohibited statements or operations

{{prohibited_database_operations}}

### 14.3 Migration requirements

| Requirement | Result |
| --- | --- |
| New ordered migration used | {{yes_or_no}} |
| Migration is additive | {{yes_or_no}} |
| Historical migration rewritten | No |
| Fresh-install test required | {{yes_or_no}} |
| Upgrade-path test required | {{yes_or_no}} |
| Existing records preserved | {{yes_or_no}} |
| Audit history preserved | {{yes_or_no}} |

## 15. Production-access controls

Complete this section when production access is requested.

Production access is denied by default and requires exact system-specific authorization.

| Requirement | Result |
| --- | --- |
| Production access explicitly authorized | {{yes_or_no}} |
| Exact production system named | {{yes_or_no}} |
| Exact operation named | {{yes_or_no}} |
| Read-only access sufficient | {{yes_or_no}} |
| Time window bounded | {{yes_or_no}} |
| Data fields allowlisted | {{yes_or_no}} |
| Customer data minimized | {{yes_or_no}} |
| Payload collection prohibited | {{yes_or_no}} |
| Human supervision required | {{yes_or_no}} |
| Emergency stop available | {{yes_or_no}} |
| Credentials revoked after use | {{yes_or_no}} |

### 15.1 Production justification

{{production_justification}}

### 15.2 Production data minimization

{{production_data_minimization}}

### 15.3 Production stop conditions

{{production_stop_conditions}}

## 16. Destructive-operation controls

Complete this section only when a destructive operation is explicitly requested.

Ordinary phase authorization is insufficient for destructive operations.

| Field | Value |
| --- | --- |
| Destructive operation | {{operation}} |
| Exact resource identity | {{resource_identity}} |
| Environment | {{environment}} |
| Reason | {{reason}} |
| Dedicated authorization ID | {{authorization_id}} |
| Human approver | {{approver}} |
| Recovery plan | {{recovery_plan}} |
| Rollback plan | {{rollback_plan}} |
| Backup verified | {{yes_or_no}} |
| Blast radius bounded | {{yes_or_no}} |
| Human confirmation immediately before execution | {{yes_or_no}} |
| Expiration | {{expiration}} |

Permanent prohibitions cannot be overridden by a destructive-operation request.

## 17. Expected external effects

| Effect ID | External effect | Expected | Reversible | Reconciliation method |
| --- | --- | --- | --- | --- |
| {{effect_id}} | {{external_effect}} | {{yes_or_no}} | {{yes_or_no}} | {{reconciliation_method}} |

### 17.1 Idempotency identity

{{idempotency_identity}}

### 17.2 Duplicate-effect prevention

{{duplicate_effect_prevention}}

### 17.3 Partial-effect behavior

{{partial_effect_behavior}}

### 17.4 Unknown-state behavior

{{unknown_state_behavior}}

A timeout, connection loss, or failed response does not prove that no external effect occurred.

Unknown external state must block blind retry and phase completion until reconciled.

## 18. Failure handling

| Failure condition | Required result | Retry permitted | Human review |
| --- | --- | --- | --- |
| Authorization missing or invalid | deny | No | Yes |
| Repository identity unresolved | blocked or configuration_required | No | Yes |
| Prohibited repository matched | deny_before_content_access | No | Yes |
| Credential unavailable | blocked | No | As required |
| Network destination unavailable | failed or blocked | Only under policy | As required |
| Required tool unavailable | unavailable | Only after environment correction | As required |
| External response malformed | failed | Only after validation | As required |
| Operation timeout | unknown_external_state when a side effect may have occurred | No | Yes |
| Cleanup failure | blocked | Only for authorized cleanup | Yes |
| Secret exposure | security_stop | No | Yes |
| Tenant-isolation failure | security_stop | No | Yes |
| Audit-integrity failure | security_stop | No | Yes |

## 19. Retry policy

| Field | Value |
| --- | --- |
| Retry policy | `{{no_retry}}` |
| Maximum retries | {{count}} |
| Retry delay | {{duration}} |
| Backoff | `{{none}}` |
| Idempotency required | {{yes_or_no}} |
| External-state reconciliation required | {{yes_or_no}} |
| Human approval required before retry | {{yes_or_no}} |

### 19.1 Retry conditions

{{retry_conditions}}

### 19.2 Non-retryable conditions

{{non_retryable_conditions}}

## 20. Cancellation policy

{{cancellation_policy}}

Cancellation must:

- prevent new work;
- stop or revoke credentials where practical;
- terminate active untrusted processes;
- preserve external-state uncertainty;
- avoid assuming that cancellation reversed completed external effects;
- perform authorized cleanup;
- record the final state.

## 21. Cleanup plan

### 21.1 Resources requiring cleanup

| Resource type | Resource identity | Cleanup operation | Authorization required | Verification |
| --- | --- | --- | --- | --- |
| {{resource_type}} | {{resource_identity}} | {{cleanup_operation}} | {{yes_or_no}} | {{verification}} |

### 21.2 Credential cleanup

{{credential_cleanup_plan}}

### 21.3 Process cleanup

{{process_cleanup_plan}}

### 21.4 Workspace cleanup

{{workspace_cleanup_plan}}

### 21.5 External resource cleanup

{{external_resource_cleanup_plan}}

### 21.6 Retained resources

| Resource | Retention reason | Authorization | Expiration |
| --- | --- | --- | --- |
| {{resource_identity}} | {{reason}} | {{authorization_id}} | {{expiration}} |

State None when no temporary resources will be retained.

Failed required cleanup blocks completion.

## 22. Audit requirements

### 22.1 Required audit events

| Event type | Trigger | Required fields |
| --- | --- | --- |
| external-operation-requested | Request created | request, phase, actor, system, operation |
| external-operation-authorized | Human approval recorded | authorization, actor, scope, expiration |
| external-operation-denied | Policy or human denial | request, reason, policy identity |
| external-operation-started | Execution begins | operation, system, environment, authorization |
| external-operation-completed | Confirmed completion | result, external identity, timestamps |
| external-operation-failed | Confirmed failure | failure class, bounded diagnostics |
| external-operation-state-unknown | Outcome cannot be confirmed | operation, possible effects, reconciliation requirement |
| external-operation-reconciled | External state confirmed | observed state, evidence, retry decision |
| external-operation-cleanup-completed | Cleanup confirmed | resources, results, retained state |
| external-operation-cleanup-failed | Cleanup incomplete | resources, failure, next action |

### 22.2 Audit integrity

Confirm:

- [ ] audit events are append-only;
- [ ] actor identity is recorded;
- [ ] tenant identity is recorded;
- [ ] authorization identity is recorded;
- [ ] system and environment identities are recorded;
- [ ] credential capability is recorded instead of the credential value;
- [ ] secret values are excluded;
- [ ] unknown external state remains visible;
- [ ] cleanup results are recorded.

## 23. Evidence requirements

| Evidence ID | Evidence type | Description | Required for approval | Required for completion |
| --- | --- | --- | --- | --- |
| {{evidence_id}} | {{evidence_type}} | {{description}} | {{yes_or_no}} | {{yes_or_no}} |

Required evidence may include:

- canonical external-system identity;
- repository-access policy decision;
- prohibited-repository preflight result;
- current authorization record;
- credential-capability record;
- network-profile record;
- structured-command identity;
- runner-profile identity;
- baseline verification;
- changed-file inventory;
- patch digest;
- external provider response identity;
- reconciliation result;
- cleanup result;
- secret-scan result;
- audit-event identities.

## 24. Validation plan

### 24.1 Pre-operation checks

- [ ] Current phase authorization is active.
- [ ] The exact operation is authorized.
- [ ] The exact external system and environment are authorized.
- [ ] Canonical repository identity is resolved where applicable.
- [ ] Prohibited-repository policy passed before content access.
- [ ] Credential capability is sufficient and minimal.
- [ ] Network profile is approved.
- [ ] Runner or publisher profile is approved.
- [ ] Structured command is registered.
- [ ] Required data minimization is configured.
- [ ] Required baseline tests passed.
- [ ] Required security controls passed.
- [ ] Cleanup plan is executable.
- [ ] Idempotency identity is defined.
- [ ] No unresolved external state conflicts with the request.

### 24.2 Post-operation checks

- [ ] Expected external state is confirmed.
- [ ] Unexpected external effects are absent.
- [ ] No unauthorized operation occurred.
- [ ] No prohibited provider action occurred.
- [ ] No secret value was retained or exposed.
- [ ] Tenant isolation was preserved.
- [ ] Audit events were recorded.
- [ ] Required cleanup completed.
- [ ] Unknown state was reconciled.
- [ ] Report and execution state were updated truthfully.

## 25. Risk assessment

| Risk ID | Risk | Likelihood | Impact | Mitigation | Residual risk | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| {{risk_id}} | {{risk}} | `{{low\|medium\|high}}` | `{{low\|medium}}` |  |  |  |

Include relevant risks involving:

- unauthorized access;
- prohibited-repository access;
- credential exposure;
- secret leakage;
- customer-data exposure;
- tenant-isolation failure;
- repository modification;
- duplicate external effects;
- unknown external state;
- failed cleanup;
- production impact;
- supply-chain compromise;
- data loss;
- audit-integrity failure;
- uncontrolled cost.

## 26. Cost and resource limits

| Limit | Authorized value | Expected value | Hard limit |
| --- | --- | --- | --- |
| Runtime seconds | {{value}} | {{value}} | {{yes_or_no}} |
| Network bytes | {{value}} | {{value}} | {{yes_or_no}} |
| Storage bytes | {{value}} | {{value}} | {{yes_or_no}} |
| External operations | {{value}} | {{value}} | {{yes_or_no}} |
| Concurrent workers | {{value}} | {{value}} | {{yes_or_no}} |
| Estimated cost | {{value}} {{currency}} | {{value}} {{currency}} | {{yes_or_no}} |

### 26.1 Budget-exceeded behavior

{{budget_exceeded_behavior}}

## 27. Stop conditions

The operation must stop when any applicable condition occurs.

- [ ] Authorization expires, is revoked, or becomes ambiguous.
- [ ] The requested target no longer matches authorization.
- [ ] Repository identity changes.
- [ ] Source revision changes.
- [ ] Finding, evidence, coverage, or disposition changes.
- [ ] A prohibited repository is identified.
- [ ] A required security control fails.
- [ ] A secret value is exposed.
- [ ] Tenant isolation fails.
- [ ] Runner isolation fails.
- [ ] Publisher restrictions fail.
- [ ] Audit integrity cannot be established.
- [ ] Production data cannot be minimized.
- [ ] Cost or resource limits are exceeded.
- [ ] External state becomes unknown.
- [ ] Required cleanup cannot be completed.
- [ ] A human reviewer requests a stop.
- [ ] The authorized operation count is exhausted.
- [ ] The authorization expiration condition is reached.

### 27.1 Additional stop conditions

{{additional_stop_conditions}}

## 28. Approval checklist

The human reviewer must confirm each applicable item.

- [ ] The operation is necessary and narrowly scoped.
- [ ] The external system identity is exact.
- [ ] The environment is exact.
- [ ] The operation is independently authorized.
- [ ] Repository identity is canonical where applicable.
- [ ] The prohibited-repository check passed before content access.
- [ ] Production access is not requested, or dedicated production authorization exists.
- [ ] Credential capabilities are minimal.
- [ ] Secret values are absent from this request.
- [ ] Network destinations are allowlisted.
- [ ] Data access is minimized.
- [ ] Tenant isolation is preserved.
- [ ] Repository-controlled content remains untrusted.
- [ ] Structured-command execution is used.
- [ ] Runner or publisher isolation is adequate.
- [ ] Required baseline tests passed.
- [ ] Required security controls passed.
- [ ] Remediation authorization is separate where applicable.
- [ ] Publication authorization is separate where applicable.
- [ ] Draft-only publication is enforced where applicable.
- [ ] Direct default-branch push remains prohibited.
- [ ] Merge and auto-merge remain prohibited.
- [ ] Automatic ready transition remains prohibited.
- [ ] Idempotency behavior is defined.
- [ ] Unknown external state blocks blind retry.
- [ ] Cleanup is defined and authorized.
- [ ] Audit events are defined.
- [ ] Cost and resource limits are bounded.
- [ ] Stop conditions are sufficient.
- [ ] Approval will not implicitly authorize another operation or phase.

## 29. Human decision

| Field | Value |
| --- | --- |
| Decision | `{{approved}}` |
| Human reviewer | {{reviewer}} |
| Decision timestamp | {{timestamp}} |
| Authorization ID | {{authorization_id_or_none}} |
| Authorized operation count | {{count_or_zero}} |
| Authorization expiration | {{expiration_or_not_applicable}} |
| Human confirmation required immediately before execution | {{yes_or_no}} |

### 29.1 Approval limitations

{{approval_limitations_or_not_applicable}}

### 29.2 Rejection or required-change reason

{{rejection_or_change_reason_or_not_applicable}}

### 29.3 Approved operation statement

{{approved_operation_statement_or_not_applicable}}

The approved statement must identify the exact:

- external system;
- environment;
- repository or resource;
- operation;
- source revision or target version;
- credential capability;
- network profile;
- maximum operation count;
- expiration;
- required cleanup;
- prohibited related operations.

## 30. Execution result

Complete this section only after authorized execution.

| Field | Value |
| --- | --- |
| Execution attempted | {{yes_or_no}} |
| Started at | {{timestamp_or_not_applicable}} |
| Ended at | {{timestamp_or_not_applicable}} |
| Executing component | {{component}} |
| Operation status | `{{completed}}` |
| External result identity | {{identity_or_not_available}} |
| Idempotency identity | {{identity}} |
| External state reconciled | {{yes_or_no}} |
| Unauthorized operations performed | 0 |
| Production operations performed | {{count}} |
| Secret values exposed | 0 |
| Required cleanup complete | {{yes_or_no}} |

### 30.1 Result summary

{{result_summary}}

### 30.2 External state

{{confirmed_external_state}}

### 30.3 Failures

{{failures_or_none}}

### 30.4 Unknown external state

{{unknown_external_state_or_none}}

### 30.5 Cleanup result

{{cleanup_result}}

### 30.6 Evidence index

| Evidence ID | Type | Description | Digest or identity | Secret-free |
| --- | --- | --- | --- | --- |
| {{evidence_id}} | {{evidence_type}} | {{description}} | {{digest_or_identity}} | {{yes_or_no}} |

## 31. Reporting and handoff

| Field | Value |
| --- | --- |
| Phase report updated | {{yes_or_no}} |
| Execution state updated | {{yes_or_no}} |
| Audit events recorded | {{yes_or_no}} |
| Unknown external state remains | {{yes_or_no}} |
| Required cleanup complete | {{yes_or_no}} |
| Open blocker count | {{count}} |
| Open incident count | {{count}} |
| Next phase authorized | No |
| Automatic continuation permitted | No |

### 31.1 Next safe action

{{next_safe_action}}

### 31.2 Required human decision

{{required_human_decision}}

## 32. Final declaration

This request and its resulting records truthfully distinguish:

- requested operations from authorized operations;
- authorized operations from executed operations;
- successful operations from failed, blocked, cancelled, or unknown operations;
- read access from write access;
- analysis from remediation;
- remediation from publication;
- draft publication from merge;
- non-production access from production access;
- confirmed cleanup from unresolved state;
- credential capabilities from secret values.

Operation authorization granted merely by this template: No

Automatic retry permitted merely by this template: No

Automatic phase continuation permitted: No

New explicit human authorization required for any additional operation: Yes