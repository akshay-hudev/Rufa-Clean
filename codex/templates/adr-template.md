# Architecture Decision Record: {{decision_title}}

## Non-authorization notice

This Architecture Decision Record documents an architectural decision, its evidence, alternatives, consequences, risks, and validation requirements.

This document does not authorize implementation, repository access, credential use, external operations, dependency installation, remediation, publication, deployment, infrastructure modification, merge, destructive operations, or transition to another phase.

Execution requires separate, current, explicit human authorization under the Phase Authorization Protocol.

## 1. Metadata

| Field | Value |
| --- | --- |
| ADR ID | {{adr_id}} |
| Title | {{decision_title}} |
| Status | `{{proposed}}` |
| Decision owner | {{decision_owner}} |
| Authors | {{authors}} |
| Reviewers | {{reviewers}} |
| Created at | {{created_at}} |
| Last updated at | {{updated_at}} |
| Target phase | {{phase_id_or_not_applicable}} |
| Related capability IDs | {{capability_ids}} |
| Supersedes | {{adr_id_or_none}} |
| Superseded by | {{adr_id_or_none}} |
| Review deadline | {{review_deadline_or_none}} |

## 2. Decision summary

{{one_or_two_paragraph_decision_summary}}

The summary must state:

- what is being decided;
- why the decision is required;
- the scope to which the decision applies;
- the most important limitation or trade-off;
- whether the decision affects detection, classification, remediation, publication, security, persistence, or operations.

## 3. Status meaning

Use exactly one status:

| Status | Meaning |
| --- | --- |
| proposed | The decision is under review and must not be treated as accepted. |
| accepted | The architectural decision has been approved, but implementation still requires separate authorization. |
| rejected | The option was considered and must not be implemented as the selected architecture. |
| deprecated | The decision remains historically relevant but should not guide new implementation. |
| superseded | A newer ADR replaces this decision. |

Acceptance of an ADR does not authorize implementation.

## 4. Context

{{decision_context}}

Describe the current situation, including:

- the existing implementation;
- the problem or limitation being addressed;
- relevant product requirements;
- relevant safety invariants;
- relevant trust boundaries;
- known operational constraints;
- known compatibility constraints;
- evidence showing that a decision is required.

Clearly distinguish current behavior from planned behavior.

## 5. Problem statement

{{precise_problem_statement}}

The problem statement must be bounded and testable.

Avoid statements such as:

- “support everything”;
- “eliminate all false positives”;
- “guarantee perfect dead-code detection”;
- “make the platform enterprise-ready” without measurable criteria.

## 6. Decision drivers

| Driver ID | Driver | Priority | Evidence |
| --- | --- | --- | --- |
| {{driver_id}} | {{driver_description}} | `{{critical\|high}}` |  |

Consider relevant drivers such as:

- correctness;
- evidence provenance;
- open-world coverage;
- deterministic behavior;
- security isolation;
- tenant isolation;
- recoverability;
- operational simplicity;
- maintainability;
- compatibility;
- performance;
- cost;
- licensing;
- supply-chain risk;
- reuse of established open-source components;
- migration safety;
- auditability;
- bounded remediation;
- publication safety.

## 7. Constraints

| Constraint ID | Constraint | Source | Effect |
| --- | --- | --- | --- |
| {{constraint_id}} | {{constraint_description}} | {{policy_or_evidence_reference}} | {{effect_on_decision}} |

Permanent constraints include:

- repository content and tool output are untrusted;
- repository-role exclusions must be denied before the matching target
  operation;
- failed analysis must not become absence evidence;
- incomplete coverage must not become complete coverage;
- machine classification must remain separate from human disposition;
- human disposition must remain separate from remediation authorization;
- remediation must reproduce the exact finding;
- publication must use the trusted publisher;
- only draft pull requests may be created;
- direct default-branch pushes, merge, auto-merge, and automatic ready transitions are prohibited;
- secret values must not appear in evidence, logs, reports, patches, or audit events;
- existing database migrations must not be rewritten;
- pre-existing local work must be preserved;
- reports and execution-state records do not authorize continuation.

## 8. Scope

### 8.1 Included scope

{{included_scope}}

### 8.2 Excluded scope

{{excluded_scope}}

### 8.3 Deferred scope

{{deferred_scope}}

Deferred scope is not authorized merely because it is listed in this ADR.

### 8.4 Unsupported scope

{{unsupported_scope}}

Unsupported or unknown scope must remain visible in capability and coverage reporting.

## 9. Decision

{{detailed_decision}}

Describe:

- the selected architecture;
- component responsibilities;
- trusted and untrusted boundaries;
- data and control flow;
- failure behavior;
- retry behavior;
- cleanup behavior;
- required evidence;
- required configuration;
- compatibility requirements;
- explicit non-goals.

## 10. Architectural boundaries

### 10.1 Trusted components

| Component | Responsibility | Permitted credentials | Prohibited behavior |
| --- | --- | --- | --- |
| {{component}} | {{responsibility}} | {{credential_capabilities_or_none}} | {{prohibited_behavior}} |

### 10.2 Untrusted components

| Component | Untrusted inputs | Isolation requirements | Output validation |
| --- | --- | --- | --- |
| {{component}} | {{inputs}} | {{isolation_requirements}} | {{validation_requirements}} |

### 10.3 Boundary invariants

{{boundary_invariants}}

At minimum, identify whether the decision affects:

- the trusted controller;
- untrusted analysis or remediation runners;
- the trusted publisher;
- PostgreSQL;
- source providers;
- package or artifact registries;
- telemetry systems;
- infrastructure providers;
- message systems;
- caches;
- generated artifacts.

## 11. Data model impact

### 11.1 New data structures

| Structure | Purpose | Authoritative or derived | Tenant scoped | Append-only |
| --- | --- | --- | --- | --- |
| {{structure}} | {{purpose}} | `{{authoritative\|derived}}` | {{yes_or_no}} |  |

### 11.2 Existing data structures changed

| Structure | Change | Compatibility impact | Migration required |
| --- | --- | --- | --- |
| {{structure}} | {{change}} | {{compatibility_impact}} | {{yes_or_no}} |

### 11.3 Identity and provenance

{{identity_and_provenance_requirements}}

Specify exact identities for relevant objects, such as:

- tenant;
- repository;
- source revision;
- package;
- module;
- file;
- symbol occurrence;
- service;
- contract;
- environment;
- campaign;
- finding;
- evidence;
- coverage;
- authorization;
- remediation attempt;
- patch;
- publication operation;
- audit event.

### 11.4 Retention and deletion

{{retention_and_deletion_behavior}}

The decision must not silently destroy authoritative evidence, disposition history, authorization history, remediation history, publication history, or audit records.

## 12. Database and migration impact

| Question | Answer |
| --- | --- |
| Database change required | {{yes_or_no}} |
| New additive migration required | {{yes_or_no}} |
| Historical migration rewritten | No |
| Fresh installation test required | {{yes_or_no}} |
| Upgrade-path test required | {{yes_or_no}} |
| Rollback or forward-recovery plan required | {{yes_or_no}} |
| Data backfill required | {{yes_or_no}} |
| Production database access required | {{yes_or_no}} |

### 12.1 Migration plan

{{migration_plan_or_not_applicable}}

### 12.2 Compatibility plan

{{database_compatibility_plan_or_not_applicable}}

### 12.3 Failure and recovery behavior

{{database_failure_and_recovery_behavior_or_not_applicable}}

## 13. Security impact

### 13.1 Threats addressed

| Threat | Mitigation | Residual risk | Validation |
| --- | --- | --- | --- |
| {{threat}} | {{mitigation}} | {{residual_risk}} | {{test_or_evidence}} |

### 13.2 Security controls affected

| Control ID | Effect | Required validation |
| --- | --- | --- |
| {{security_control_id}} | `{{new\|changed}}` |  |

### 13.3 Credential impact

{{credential_impact}}

State:

- which credential capabilities are required;
- which components may receive them;
- their target, operation, environment, and lifetime scope;
- how credentials are revoked;
- how secret values remain excluded from retained records.

### 13.4 Network impact

{{network_impact}}

Repository content must not be able to add network destinations or select credentials.

### 13.5 Tenant-isolation impact

{{tenant_isolation_impact}}

### 13.6 Prompt-injection impact

{{prompt_injection_impact}}

Untrusted content must remain data and must not alter policy, commands, credentials, classification, authorization, remediation, or publication.

## 14. Evidence and coverage impact

### 14.1 Evidence producers

| Producer | Evidence type | Provenance fields | Failure behavior |
| --- | --- | --- | --- |
| {{producer}} | {{evidence_type}} | {{provenance_fields}} | {{failure_behavior}} |

### 14.2 Coverage dimensions

| Dimension | Required | Complete condition | Failure effect |
| --- | --- | --- | --- |
| {{coverage_dimension}} | {{yes_or_no}} | {{complete_condition}} | {{failure_effect}} |

### 14.3 Open-world behavior

{{open_world_behavior}}

The decision must explain how it preserves:

- inaccessible scope;
- unsupported scope;
- failed scope;
- stale scope;
- dynamic scope;
- external-consumer uncertainty;
- runtime-observation limitations.

## 15. Classification impact

{{classification_impact_or_not_applicable}}

When classification is affected, specify:

- the policy version;
- required evidence;
- required coverage;
- evidence precedence;
- deterministic ordering;
- explanation behavior;
- invalidation triggers;
- conditions that produce live, candidate_dead, inconclusive, unsupported, or failed.

Positive liveness evidence must not be overridden by weaker absence evidence.

## 16. Remediation impact

{{remediation_impact_or_not_applicable}}

When remediation is affected, confirm:

| Requirement | Decision |
| --- | --- |
| Human disposition required | {{yes_or_no}} |
| Separate finding-specific remediation authorization required | {{yes_or_no}} |
| Exact finding reproduction required | {{yes_or_no}} |
| Passing baseline gates required | {{yes_or_no}} |
| Structured language-aware transformation required | {{yes_or_no}} |
| Exact rewrite count required | {{yes_or_no}} |
| Changed-file allowlist required | {{yes_or_no}} |
| Passing post-change gates required | {{yes_or_no}} |
| Deterministic patch required | {{yes_or_no}} |
| Idempotent retry behavior required | {{yes_or_no}} |

confirmed_dead alone must never authorize source modification.

## 17. Publication impact

{{publication_impact_or_not_applicable}}

When publication is affected, confirm:

| Requirement | Decision |
| --- | --- |
| Separate publication authorization required | {{yes_or_no}} |
| Trusted publisher required | {{yes_or_no}} |
| Draft pull request only | {{yes_or_no}} |
| Direct default-branch push | Prohibited |
| Pull-request merge | Prohibited |
| Auto-merge | Prohibited |
| Automatic ready-for-review transition | Prohibited |
| Repository hooks disabled in publisher | {{yes_or_no}} |
| Unknown external state blocks retry | {{yes_or_no}} |

## 18. Operational impact

### 18.1 Command execution

{{structured_command_impact}}

Commands must be dispatched through approved structured command identities rather than repository-provided shell text.

### 18.2 Runner requirements

{{runner_requirements}}

Include relevant:

- non-root execution;
- filesystem confinement;
- network policy;
- process limits;
- memory limits;
- CPU limits;
- disk limits;
- timeout;
- output limits;
- process-tree cleanup;
- credential isolation;
- Docker-socket denial;
- cloud-metadata denial.

### 18.3 Retry and idempotency

{{retry_and_idempotency_behavior}}

### 18.4 Cancellation

{{cancellation_behavior}}

### 18.5 Cleanup

{{cleanup_behavior}}

Failed required cleanup must remain a blocking result.

## 19. Performance, scale, and cost impact

### 19.1 Expected performance characteristics

{{expected_performance_characteristics}}

### 19.2 Scale assumptions

{{scale_assumptions}}

### 19.3 Tested operating envelope

{{tested_operating_envelope_or_not_yet_validated}}

### 19.4 Cost impact

{{cost_impact}}

Clearly distinguish:

- measured facts;
- estimates;
- assumptions;
- untested limits;
- extrapolations.

Do not claim universal or unlimited scale.

## 20. Alternatives considered

### 20.1 Alternative A: {{alternative_name}}

#### Description

{{alternative_description}}

#### Advantages

{{alternative_advantages}}

#### Disadvantages

{{alternative_disadvantages}}

#### Security and correctness impact

{{alternative_security_and_correctness_impact}}

#### Reason not selected

{{reason_not_selected}}

### 20.2 Alternative B: {{alternative_name}}

#### Description

{{alternative_description}}

#### Advantages

{{alternative_advantages}}

#### Disadvantages

{{alternative_disadvantages}}

#### Security and correctness impact

{{alternative_security_and_correctness_impact}}

#### Reason not selected

{{reason_not_selected}}

### 20.3 Status quo

#### Description

{{status_quo_description}}

#### Consequences of no decision

{{status_quo_consequences}}

#### Reason retained or rejected

{{status_quo_decision}}

## 21. Open-source reuse and dependency evaluation

### 21.1 Reuse assessment

{{reuse_assessment}}

Before custom implementation, evaluate relevant established tools, libraries, protocols, schemas, and analyzers.

### 21.2 Candidate tools

| Tool | Purpose | License | Security status | Fit | Decision |
| --- | --- | --- | --- | --- | --- |
| {{tool}} | {{purpose}} | {{license}} | {{status}} | {{fit_assessment}} | `{{adopt}}` |

### 21.3 Adoption requirements

{{dependency_adoption_requirements}}

A mandatory dependency requires documented:

- provenance;
- version;
- integrity;
- license compatibility;
- maintenance status;
- security review;
- isolation requirements;
- failure behavior;
- replacement or exit strategy.

## 22. Consequences

### 22.1 Positive consequences

{{positive_consequences}}

### 22.2 Negative consequences

{{negative_consequences}}

### 22.3 Neutral consequences

{{neutral_consequences}}

### 22.4 Operational burden

{{operational_burden}}

### 22.5 Long-term maintenance impact

{{maintenance_impact}}

## 23. Risks and mitigations

| Risk ID | Risk | Likelihood | Impact | Mitigation | Residual risk | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| {{risk_id}} | {{risk}} | `{{low\|medium\|high}}` | `{{low\|medium}}` |  |  |  |

Security, correctness, data-loss, tenant-isolation, external-operation, and audit-integrity risks must not be omitted.

## 24. Failure modes

| Failure mode | Detection | Safe result | Recovery | Human review |
| --- | --- | --- | --- | --- |
| {{failure_mode}} | {{detection}} | `{{blocked\|failed\|partial}}` |  |  |

Failure handling must preserve uncertainty and must not convert:

- tool unavailability into success;
- failed analysis into absence;
- incomplete coverage into completeness;
- timeout into proof that no external effect occurred;
- partial implementation into functional support.

## 25. Reversibility and exit strategy

### 25.1 Reversibility

{{reversibility_assessment}}

### 25.2 Rollback or forward-recovery approach

{{rollback_or_forward_recovery}}

### 25.3 Data compatibility after reversal

{{data_compatibility_after_reversal}}

### 25.4 Dependency exit strategy

{{dependency_exit_strategy}}

### 25.5 Conditions requiring supersession

{{supersession_conditions}}

Accepted ADRs should generally be superseded rather than rewritten when the architectural decision materially changes.

## 26. Implementation plan

This plan is descriptive only. It does not authorize implementation.

### 26.1 Implementation stages

| Stage | Scope | Dependencies | Required authorization | Completion evidence |
| --- | --- | --- | --- | --- |
| {{stage_id}} | {{scope}} | {{dependencies}} | {{authorization_scope}} | {{evidence}} |

### 26.2 Migration stages

{{migration_stages_or_not_applicable}}

### 26.3 Rollout stages

{{rollout_stages_or_not_applicable}}

### 26.4 Stop conditions

{{implementation_stop_conditions}}

## 27. Validation plan

### 27.1 Required tests

| Test ID | Category | Objective | Blocking | Evidence |
| --- | --- | --- | --- | --- |
| {{test_id}} | `{{functional\|integration\|regression\|security}}` |  |  |  |

### 27.2 Security validation

{{security_validation_plan}}

### 27.3 Migration validation

{{migration_validation_plan_or_not_applicable}}

### 27.4 Failure-injection validation

{{failure_injection_plan}}

### 27.5 Scale validation

{{scale_validation_plan_or_not_applicable}}

### 27.6 Acceptance criteria

{{acceptance_criteria}}

An unavailable, skipped, blocked, partial, or failed required test must not satisfy acceptance criteria.

## 28. Observability and audit

### 28.1 Required events

| Event type | Trigger | Required fields | Secret-free |
| --- | --- | --- | --- |
| {{event_type}} | {{trigger}} | {{required_fields}} | Yes |

### 28.2 Metrics

| Metric | Purpose | Labels | Cardinality controls |
| --- | --- | --- | --- |
| {{metric}} | {{purpose}} | {{labels}} | {{controls}} |

### 28.3 Logs

{{logging_requirements}}

### 28.4 Audit integrity

{{audit_integrity_requirements}}

Audit records must remain attributable, append-only, tamper-evident where required, tenant-scoped, and secret-free.

## 29. Documentation impact

| Document | Required change | Reason |
| --- | --- | --- |
| {{path}} | {{change}} | {{reason}} |

Consider updates to:

- product and architecture contracts;
- capability definitions;
- evidence and coverage models;
- security-control matrix;
- test manifests;
- schemas;
- roadmap phase documents;
- operational runbooks;
- capability matrix;
- phase reports;
- execution-state records.

Updating documentation does not authorize implementation.

## 30. Unresolved questions

| Question ID | Question | Owner | Blocking | Required decision date |
| --- | --- | --- | --- | --- |
| {{question_id}} | {{question}} | {{owner}} | {{yes_or_no}} | {{date_or_none}} |

Unresolved blocking questions prevent acceptance.

## 31. Decision review checklist

Confirm each item before changing the ADR status to accepted.

- [ ] The problem is clearly defined and bounded.
- [ ] Current behavior is distinguished from planned behavior.
- [ ] Included, excluded, deferred, unsupported, and unknown scope are explicit.
- [ ] Alternatives, including the status quo, were evaluated.
- [ ] Reuse of established open-source components was considered.
- [ ] Required dependency, license, provenance, and security reviews are documented.
- [ ] Trust boundaries are explicit.
- [ ] Repository content remains untrusted.
- [ ] Secret-handling requirements are explicit.
- [ ] Tenant-isolation effects are understood.
- [ ] Evidence and coverage effects are defined.
- [ ] Failed analysis cannot become absence evidence.
- [ ] Classification behavior remains deterministic.
- [ ] Human disposition remains separate from machine classification.
- [ ] Remediation authorization remains separate from disposition.
- [ ] Publication authorization remains separate from remediation.
- [ ] Direct default-branch push, merge, auto-merge, and automatic ready transition remain prohibited.
- [ ] Database changes use additive migrations.
- [ ] Existing audit history remains preserved.
- [ ] Failure, retry, cancellation, recovery, and cleanup behavior are defined.
- [ ] Required tests and evidence are identified.
- [ ] Performance, cost, and scale claims are bounded.
- [ ] Reversibility or forward recovery is documented.
- [ ] The ADR does not claim to authorize implementation.

## 32. Decision approval

| Role | Reviewer | Decision | Timestamp | Notes |
| --- | --- | --- | --- | --- |
| Architecture owner | {{reviewer}} | `{{accept\|reject\|changes_required}}` |  |  |
| Security reviewer | {{reviewer}} | `{{accept\|reject\|changes_required}}` |  |  |
| Database reviewer | {{reviewer}} | `{{accept\|reject\|changes_required}}` |  |  |
| Operations reviewer | {{reviewer}} | `{{accept\|reject\|changes_required}}` |  |  |
| Product owner | {{reviewer}} | `{{accept\|reject\|changes_required}}` |  |  |

## 33. Decision outcome

Final status: {{proposed|accepted|rejected|deprecated|superseded}}

Decision: {{final_decision_statement}}

Effective scope: {{effective_scope}}

Known limitations: {{known_limitations}}

Required follow-up: {{required_follow_up}}

Implementation authorization granted by this ADR: No

## 34. Revision history

| Version | Date | Author | Change | Status |
| --- | --- | --- | --- | --- |
| 1 | {{date}} | {{author}} | Initial proposal | proposed |
| {{version}} | {{date}} | {{author}} | {{change_summary}} | {{status}} |

Material architectural changes should normally create a new ADR that supersedes this record rather than rewriting accepted history.
