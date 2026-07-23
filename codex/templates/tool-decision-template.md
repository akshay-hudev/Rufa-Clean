# Tool Decision Record: {{tool_name}}

## Non-authorization notice

This record documents the evaluation of a tool, library, framework, analyzer, protocol, service, image, or dependency for possible use in DCAv2.

This record does not authorize installation, execution, repository access, credential use, external operations, implementation, remediation, publication, deployment, infrastructure modification, merge, destructive operations, or transition to another phase.

Adoption and implementation require separate, current, explicit human authorization.

## 1. Record metadata

| Field | Value |
| --- | --- |
| Decision record ID | {{decision_record_id}} |
| Tool name | {{tool_name}} |
| Tool type | {{tool_type}} |
| Tool version | {{tool_version}} |
| Decision status | {{decision_status}} |
| Evaluation owner | {{evaluation_owner}} |
| Reviewers | {{reviewers}} |
| Created at | {{created_at}} |
| Last updated at | {{updated_at}} |
| Target phase | {{phase_id_or_not_applicable}} |
| Related capability IDs | {{capability_ids}} |
| Related ADR IDs | {{adr_ids_or_none}} |
| Supersedes record | {{record_id_or_none}} |
| Superseded by | {{record_id_or_none}} |

Allowed decision statuses:

- proposed
- evaluation_required
- approved
- approved_with_limitations
- rejected
- deprecated
- superseded

Approval of this record does not authorize implementation or installation.

## 2. Executive summary

### 2.1 Evaluation objective

{{evaluation_objective}}

### 2.2 Decision

Decision status: {{decision_status}}

{{decision_summary}}

### 2.3 Primary reason

{{primary_reason}}

### 2.4 Important limitations

{{important_limitations}}

### 2.5 Required next human decision

{{next_human_decision}}

## 3. Tool identity

| Field | Value |
| --- | --- |
| Official name | {{official_name}} |
| Package or project identifier | {{package_or_project_identifier}} |
| Version evaluated | {{version}} |
| Version constraint | {{version_constraint}} |
| Source repository | {{source_repository}} |
| Distribution source | {{distribution_source}} |
| Publisher or maintainer | {{publisher_or_maintainer}} |
| Release date | {{release_date}} |
| Integrity digest | {{integrity_digest_or_not_available}} |
| Signature status | {{signature_status}} |
| Provenance status | {{provenance_status}} |

## 4. Tool category

Select the applicable categories.

- [ ] Parser
- [ ] Compiler
- [ ] Language server
- [ ] Semantic indexer
- [ ] Static analyzer
- [ ] Dead-code detector
- [ ] Dependency analyzer
- [ ] Build tool
- [ ] Test tool
- [ ] Package manager
- [ ] Transformation engine
- [ ] AST or CST library
- [ ] Database library
- [ ] Queue or workflow system
- [ ] Source-provider client
- [ ] Trusted publisher component
- [ ] Container image
- [ ] Security scanner
- [ ] Observability tool
- [ ] Infrastructure tool
- [ ] Runtime-analysis tool
- [ ] Contract-analysis tool
- [ ] Other

Other category: {{other_category_or_not_applicable}}

## 5. Problem being addressed

{{problem_statement}}

Describe:

- the capability gap;
- the current implementation;
- why the current implementation is insufficient;
- whether the need is immediate or future;
- whether the tool is required, conditional, optional, or evaluation-only;
- what failure would occur without the tool.

## 6. Intended use

### 6.1 Proposed responsibilities

{{proposed_responsibilities}}

### 6.2 Explicit non-responsibilities

{{explicit_non_responsibilities}}

### 6.3 Intended execution boundary

| Field | Value |
| --- | --- |
| Execution zone | {{execution_zone}} |
| Repository-controlled input accepted | {{yes_or_no}} |
| Trusted credentials required | {{yes_or_no}} |
| Network access required | {{yes_or_no}} |
| Filesystem write access required | {{yes_or_no}} |
| Database access required | {{yes_or_no}} |
| External system access required | {{yes_or_no}} |
| Production access required | {{yes_or_no}} |

Allowed execution zones include:

- governance
- trusted_controller
- untrusted_runner
- trusted_publisher
- trusted_database
- external_read_only
- external_write

Repository-controlled code and data must not be executed in trusted controller or publisher processes.

## 7. Reuse-first assessment

### 7.1 Existing DCAv2 capability

{{existing_capability_assessment}}

### 7.2 Existing open-source alternatives

| Alternative | Purpose | Maturity | License | Security status | Fit |
| --- | --- | --- | --- | --- | --- |
| {{alternative_name}} | {{purpose}} | {{maturity}} | {{license}} | {{security_status}} | {{fit_assessment}} |

### 7.3 Custom implementation alternative

{{custom_implementation_assessment}}

### 7.4 Reuse decision

{{reuse_decision}}

Explain why adoption, limited adoption, further evaluation, rejection, or custom implementation is preferred.

## 8. Functional fit

### 8.1 Required capabilities

| Requirement ID | Requirement | Priority | Supported | Evidence |
| --- | --- | --- | --- | --- |
| {{requirement_id}} | {{requirement}} | {{priority}} | {{yes_no_partial_unknown}} | {{evidence}} |

Priority values:

- critical
- high
- medium
- low

### 8.2 Supported scope

{{supported_scope}}

### 8.3 Unsupported scope

{{unsupported_scope}}

### 8.4 Ambiguous or unverified scope

{{ambiguous_scope}}

### 8.5 Required adapters

{{required_adapters_or_none}}

### 8.6 Required fallbacks

{{required_fallbacks_or_none}}

A fallback must not silently weaken semantic analysis or convert unavailable analysis into successful absence evidence.

## 9. Accuracy and evidence behavior

### 9.1 Evidence produced

| Evidence type | Description | Target identity | Provenance available | Deterministic |
| --- | --- | --- | --- | --- |
| {{evidence_type}} | {{description}} | {{target_identity}} | {{yes_or_no}} | {{yes_or_no}} |

### 9.2 Provenance fields

{{provenance_fields}}

Relevant provenance may include:

- tool name;
- tool version;
- adapter version;
- configuration identity;
- source revision;
- source file digest;
- package identity;
- module identity;
- symbol occurrence;
- execution environment;
- raw artifact digest;
- timestamp.

### 9.3 Failure semantics

| Failure condition | Tool behavior | Required DCAv2 interpretation |
| --- | --- | --- |
| Parse failure | {{behavior}} | failed or partial |
| Unsupported syntax | {{behavior}} | unsupported or partial |
| Timeout | {{behavior}} | failed or blocked |
| Malformed output | {{behavior}} | failed |
| Missing dependency | {{behavior}} | unavailable |
| Resource exhaustion | {{behavior}} | failed or blocked |
| Inaccessible file | {{behavior}} | partial |
| Unknown configuration | {{behavior}} | configuration_required or partial |

A failed or unavailable tool must never be interpreted as producing authoritative zero-reference or absence evidence.

### 9.4 Positive evidence behavior

{{positive_evidence_behavior}}

Positive liveness evidence must not be overridden by weaker absence evidence from this or another tool.

### 9.5 Determinism

{{determinism_assessment}}

Document whether identical source, configuration, tool version, and environment inputs produce identical normalized output.

## 10. Coverage impact

### 10.1 Coverage dimensions affected

| Coverage dimension | Required | Tool contribution | Complete condition | Failure effect |
| --- | --- | --- | --- | --- |
| {{dimension}} | {{yes_or_no}} | {{contribution}} | {{complete_condition}} | {{failure_effect}} |

### 10.2 Open-world behavior

{{open_world_behavior}}

Confirm how the integration preserves:

- unsupported scope;
- inaccessible scope;
- failed scope;
- stale scope;
- dynamic references;
- generated code;
- external consumers;
- runtime uncertainty;
- cross-repository uncertainty.

### 10.3 Coverage claims prohibited

The integration must not claim:

- complete repository coverage when required files failed;
- complete semantic coverage when the tool performed only textual search;
- complete consumer coverage when external consumers remain unknown;
- proof of deadness from runtime non-observation;
- perfect dead-code detection.

## 11. Classification impact

{{classification_impact_or_not_applicable}}

When the tool affects classification, document:

| Field | Value |
| --- | --- |
| Classification policy version | {{policy_version}} |
| Evidence precedence | {{precedence_rule}} |
| Required coverage status | {{coverage_requirement}} |
| Deterministic ordering | {{yes_or_no}} |
| Explanation available | {{yes_or_no}} |
| Stale-result invalidation | {{invalidation_behavior}} |

The tool must not directly create a human disposition.

## 12. Remediation impact

{{remediation_impact_or_not_applicable}}

When the tool participates in remediation, confirm:

| Requirement | Result |
| --- | --- |
| Exact finding reproduction required | {{yes_or_no}} |
| Human disposition required | {{yes_or_no}} |
| Finding-specific remediation authorization required | {{yes_or_no}} |
| Baseline verification required | {{yes_or_no}} |
| Structured transformation used | {{yes_or_no}} |
| Exact rewrite count enforced | {{yes_or_no}} |
| Changed-file allowlist enforced | {{yes_or_no}} |
| Post-change verification required | {{yes_or_no}} |
| Deterministic patch produced | {{yes_or_no}} |
| Idempotent retry behavior defined | {{yes_or_no}} |

confirmed_dead alone must not authorize source modification.

## 13. Publication impact

{{publication_impact_or_not_applicable}}

When the tool participates in publication, confirm:

| Requirement | Result |
| --- | --- |
| Trusted publisher boundary preserved | {{yes_or_no}} |
| Repository-controlled code execution disabled | {{yes_or_no}} |
| Separate publication authorization required | {{yes_or_no}} |
| Draft pull request only | {{yes_or_no}} |
| Direct default-branch push | Prohibited |
| Merge | Prohibited |
| Auto-merge | Prohibited |
| Automatic ready transition | Prohibited |
| Unknown external state blocks retry | {{yes_or_no}} |

## 14. License assessment

### 14.1 License identity

| Field | Value |
| --- | --- |
| Declared license | {{license}} |
| License file verified | {{yes_or_no}} |
| License version | {{license_version}} |
| SPDX identifier | {{spdx_identifier}} |
| Multiple licenses present | {{yes_or_no}} |
| Commercial terms required | {{yes_or_no}} |

### 14.2 Compatibility assessment

{{license_compatibility_assessment}}

### 14.3 Distribution obligations

{{distribution_obligations}}

### 14.4 Attribution obligations

{{attribution_obligations}}

### 14.5 Source-disclosure obligations

{{source_disclosure_obligations}}

### 14.6 Network-use obligations

{{network_use_obligations}}

### 14.7 License decision

License status: {{approved_or_rejected_status}}

{{license_decision_reason}}

Do not adopt the tool as a mandatory dependency until the required license review is complete.

## 15. Security assessment

### 15.1 Threat model

| Threat | Applicable | Mitigation | Residual risk |
| --- | --- | --- | --- |
| Arbitrary code execution | {{yes_or_no}} | {{mitigation}} | {{residual_risk}} |
| Lifecycle-script execution | {{yes_or_no}} | {{mitigation}} | {{residual_risk}} |
| Plugin execution | {{yes_or_no}} | {{mitigation}} | {{residual_risk}} |
| Path traversal | {{yes_or_no}} | {{mitigation}} | {{residual_risk}} |
| Symbolic-link escape | {{yes_or_no}} | {{mitigation}} | {{residual_risk}} |
| Network exfiltration | {{yes_or_no}} | {{mitigation}} | {{residual_risk}} |
| Credential exposure | {{yes_or_no}} | {{mitigation}} | {{residual_risk}} |
| Output flooding | {{yes_or_no}} | {{mitigation}} | {{residual_risk}} |
| Resource exhaustion | {{yes_or_no}} | {{mitigation}} | {{residual_risk}} |
| Supply-chain substitution | {{yes_or_no}} | {{mitigation}} | {{residual_risk}} |
| Prompt injection | {{yes_or_no}} | {{mitigation}} | {{residual_risk}} |
| Cross-tenant leakage | {{yes_or_no}} | {{mitigation}} | {{residual_risk}} |

### 15.2 Known vulnerabilities

| Advisory | Affected versions | Severity | Status | Mitigation |
| --- | --- | --- | --- | --- |
| {{advisory_id}} | {{versions}} | {{severity}} | {{open_fixed_not_applicable}} | {{mitigation}} |

### 15.3 Security maintenance

| Field | Value |
| --- | --- |
| Security policy published | {{yes_or_no}} |
| Vulnerability reporting process | {{available_or_missing}} |
| Recent security releases | {{summary}} |
| Dependency scanning available | {{yes_or_no}} |
| Signed releases available | {{yes_or_no}} |
| Reproducible builds available | {{yes_or_no}} |

### 15.4 Security decision

Security status: {{approved_status}}

{{security_decision_reason}}

Allowed security statuses:

- approved
- approved_with_limitations
- evaluation_required
- rejected
- not_applicable

## 16. Supply-chain assessment

### 16.1 Source and distribution

{{source_and_distribution_assessment}}

### 16.2 Release integrity

{{release_integrity_assessment}}

### 16.3 Maintainer risk

{{maintainer_risk_assessment}}

### 16.4 Dependency tree

| Metric | Value |
| --- | --- |
| Direct dependencies | {{count}} |
| Transitive dependencies | {{count}} |
| Native dependencies | {{count}} |
| Install scripts | {{count}} |
| Runtime downloads | {{count}} |
| Optional dependencies | {{count}} |

### 16.5 Dependency risks

{{dependency_risks}}

### 16.6 Pinning strategy

{{pinning_strategy}}

### 16.7 Integrity-verification strategy

{{integrity_verification_strategy}}

## 17. Maintenance and maturity

| Factor | Assessment | Evidence |
| --- | --- | --- |
| Project age | {{assessment}} | {{evidence}} |
| Release frequency | {{assessment}} | {{evidence}} |
| Recent maintenance | {{assessment}} | {{evidence}} |
| Maintainer concentration | {{assessment}} | {{evidence}} |
| Issue responsiveness | {{assessment}} | {{evidence}} |
| Documentation quality | {{assessment}} | {{evidence}} |
| Test quality | {{assessment}} | {{evidence}} |
| Backward compatibility | {{assessment}} | {{evidence}} |
| Ecosystem adoption | {{assessment}} | {{evidence}} |
| Deprecation risk | {{assessment}} | {{evidence}} |

### 17.1 Maintenance conclusion

{{maintenance_conclusion}}

## 18. Compatibility assessment

### 18.1 Platform compatibility

| Platform | Supported | Tested | Notes |
| --- | --- | --- | --- |
| Linux | {{yes_no_unknown}} | {{yes_or_no}} | {{notes}} |
| macOS | {{yes_no_unknown}} | {{yes_or_no}} | {{notes}} |
| Windows | {{yes_no_unknown}} | {{yes_or_no}} | {{notes}} |
| Containerized runner | {{yes_no_unknown}} | {{yes_or_no}} | {{notes}} |

### 18.2 Runtime compatibility

| Runtime | Supported range | Tested version | Result |
| --- | --- | --- | --- |
| {{runtime}} | {{range}} | {{version}} | {{status}} |

### 18.3 Language and package-manager compatibility

| Language or package manager | Supported profile | Tested | Limitations |
| --- | --- | --- | --- |
| {{identity}} | {{profile}} | {{yes_or_no}} | {{limitations}} |

### 18.4 Database compatibility

{{database_compatibility_or_not_applicable}}

### 18.5 Provider compatibility

{{provider_compatibility_or_not_applicable}}

## 19. Integration architecture

### 19.1 Integration model

{{integration_model}}

### 19.2 Data flow

{{data_flow}}

### 19.3 Control flow

{{control_flow}}

### 19.4 Adapter boundary

{{adapter_boundary}}

The adapter should normalize tool-specific behavior into DCAv2 evidence, coverage, failure, and provenance contracts.

### 19.5 Configuration model

{{configuration_model}}

Repository configuration must not:

- override security policy;
- add trusted credentials;
- add arbitrary network destinations;
- authorize external operations;
- convert unsupported behavior into supported behavior;
- convert failed analysis into successful absence evidence.

## 20. Runner requirements

| Control | Requirement |
| --- | --- |
| Execution identity | {{non_root_identity}} |
| Privileged mode | Disabled |
| Docker socket | Denied |
| Cloud metadata | Denied |
| Host filesystem access | Denied except authorized mounts |
| Network profile | {{network_profile}} |
| CPU limit | {{cpu_limit}} |
| Memory limit | {{memory_limit}} |
| Process limit | {{process_limit}} |
| Disk limit | {{disk_limit}} |
| Timeout | {{timeout}} |
| Output limit | {{output_limit}} |
| Process-tree cleanup | Required |
| Temporary credential cleanup | Required |

### 20.1 Required filesystem mounts

{{required_mounts}}

### 20.2 Required network destinations

{{required_network_destinations_or_none}}

### 20.3 Required credential capabilities

{{required_credential_capabilities_or_none}}

Secret values must not appear in this record.

## 21. Command-execution model

| Field | Value |
| --- | --- |
| Structured command ID | {{command_id}} |
| Command registry version | {{registry_version}} |
| Shell interpolation permitted | No |
| Working directory policy | {{policy}} |
| Environment policy | {{policy}} |
| Network policy | {{policy}} |
| Timeout policy | {{policy}} |
| Output policy | {{policy}} |
| Retry policy | {{policy}} |

Repository text and tool output must not create trusted commands.

## 22. Data and persistence impact

### 22.1 New persistent records

| Record | Purpose | Tenant scoped | Append-only | Retention |
| --- | --- | --- | --- | --- |
| {{record_type}} | {{purpose}} | {{yes_or_no}} | {{yes_or_no}} | {{retention}} |

### 22.2 Existing records changed

{{existing_record_changes_or_none}}

### 22.3 Migration requirements

| Requirement | Result |
| --- | --- |
| New migration required | {{yes_or_no}} |
| Migration additive | {{yes_or_no}} |
| Historical migration rewritten | No |
| Fresh-install test required | {{yes_or_no}} |
| Upgrade-path test required | {{yes_or_no}} |
| Backfill required | {{yes_or_no}} |
| Rollback or forward recovery required | {{yes_or_no}} |

## 23. Performance assessment

### 23.1 Benchmark environment

{{benchmark_environment}}

### 23.2 Benchmark workload

{{benchmark_workload}}

### 23.3 Results

| Metric | Value | Unit | Measured or estimated | Notes |
| --- | --- | --- | --- | --- |
| {{metric}} | {{value}} | {{unit}} | {{measured_or_estimated}} | {{notes}} |

### 23.4 Resource behavior

{{resource_behavior}}

### 23.5 Saturation and degradation

{{saturation_and_degradation_behavior}}

### 23.6 Performance conclusion

{{performance_conclusion}}

Do not generalize beyond the exact tested workload and environment.

## 24. Scale assessment

| Dimension | Tested value | Status | Limitation |
| --- | --- | --- | --- |
| Repositories | {{value}} | {{status}} | {{limitation}} |
| Packages | {{value}} | {{status}} | {{limitation}} |
| Files | {{value}} | {{status}} | {{limitation}} |
| Symbols | {{value}} | {{status}} | {{limitation}} |
| Evidence edges | {{value}} | {{status}} | {{limitation}} |
| Concurrent workers | {{value}} | {{status}} | {{limitation}} |
| Duration | {{value}} | {{status}} | {{limitation}} |

Scale status: {{scale_status}}

Allowed scale statuses:

- not_validated
- validated_within_profile
- validated_with_limitations
- partially_validated
- failed
- blocked
- stale
- not_applicable

## 25. Cost assessment

| Cost source | Measured cost | Estimated cost | Currency | Notes |
| --- | --- | --- | --- | --- |
| {{source}} | {{measured}} | {{estimated}} | {{currency}} | {{notes}} |

### 25.1 Cost risks

{{cost_risks}}

### 25.2 Cost controls

{{cost_controls}}

### 25.3 Cost conclusion

{{cost_conclusion}}

## 26. Operational assessment

### 26.1 Installation

{{installation_behavior}}

### 26.2 Upgrade

{{upgrade_behavior}}

### 26.3 Configuration

{{configuration_behavior}}

### 26.4 Monitoring

{{monitoring_requirements}}

### 26.5 Failure recovery

{{failure_recovery}}

### 26.6 Cancellation

{{cancellation_behavior}}

### 26.7 Cleanup

{{cleanup_behavior}}

### 26.8 Support burden

{{support_burden}}

## 27. Testing plan

### 27.1 Required functional tests

| Test ID | Objective | Blocking | Evidence |
| --- | --- | --- | --- |
| {{test_id}} | {{objective}} | {{yes_or_no}} | {{evidence_type}} |

### 27.2 Required failure tests

| Test ID | Failure condition | Expected result | Blocking |
| --- | --- | --- | --- |
| {{test_id}} | {{failure_condition}} | {{expected_result}} | {{yes_or_no}} |

### 27.3 Required security tests

| Test ID | Control | Objective | Blocking |
| --- | --- | --- | --- |
| {{test_id}} | {{control_id}} | {{objective}} | {{yes_or_no}} |

### 27.4 Required compatibility tests

{{compatibility_tests}}

### 27.5 Required determinism tests

{{determinism_tests}}

### 27.6 Required performance and scale tests

{{performance_and_scale_tests}}

### 27.7 External fixture tests

{{external_fixture_tests_or_not_applicable}}

External fixture access requires separate current authorization.

## 28. Test results

Complete this section only after authorized evaluation.

| Test ID | Status | Environment | Evidence | Notes |
| --- | --- | --- | --- | --- |
| {{test_id}} | {{status}} | {{environment}} | {{evidence_ids}} | {{notes}} |

### 28.1 Failed tests

{{failed_tests_or_none}}

### 28.2 Blocked tests

{{blocked_tests_or_none}}

### 28.3 Skipped tests

{{skipped_tests_or_none}}

### 28.4 Unavailable tests

{{unavailable_tests_or_none}}

Skipped or unavailable required tests must not be reported as passed.

## 29. Risks and mitigations

| Risk ID | Risk | Likelihood | Impact | Mitigation | Residual risk | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| {{risk_id}} | {{risk}} | {{likelihood}} | {{impact}} | {{mitigation}} | {{residual_risk}} | {{owner}} |

Include relevant risks involving:

- false positives;
- false negatives;
- failed-analysis misinterpretation;
- incomplete coverage;
- nondeterministic output;
- untrusted code execution;
- credential exposure;
- tenant isolation;
- supply-chain compromise;
- licensing;
- maintenance abandonment;
- external-state uncertainty;
- data loss;
- performance;
- cost;
- audit integrity.

## 30. Limitations

| Limitation ID | Description | Effect | Affected capability | Required user-visible disclosure |
| --- | --- | --- | --- | --- |
| {{limitation_id}} | {{description}} | {{effect}} | {{capability_id}} | Yes |

Limitations must remain visible in capability matrices, reports, and execution state.

## 31. Exit and replacement strategy

### 31.1 Abstraction boundary

{{abstraction_boundary}}

### 31.2 Replacement conditions

{{replacement_conditions}}

### 31.3 Data portability

{{data_portability}}

### 31.4 Configuration portability

{{configuration_portability}}

### 31.5 Removal plan

{{removal_plan}}

### 31.6 Fallback after removal

{{fallback_after_removal}}

The fallback must preserve safety and truthful reporting.

## 32. Decision comparison

| Criterion | Selected tool | Alternative A | Alternative B | Custom implementation |
| --- | --- | --- | --- | --- |
| Functional fit | {{rating}} | {{rating}} | {{rating}} | {{rating}} |
| Accuracy | {{rating}} | {{rating}} | {{rating}} | {{rating}} |
| Evidence provenance | {{rating}} | {{rating}} | {{rating}} | {{rating}} |
| Coverage behavior | {{rating}} | {{rating}} | {{rating}} | {{rating}} |
| Security | {{rating}} | {{rating}} | {{rating}} | {{rating}} |
| License compatibility | {{rating}} | {{rating}} | {{rating}} | {{rating}} |
| Maintenance | {{rating}} | {{rating}} | {{rating}} | {{rating}} |
| Integration effort | {{rating}} | {{rating}} | {{rating}} | {{rating}} |
| Operational burden | {{rating}} | {{rating}} | {{rating}} | {{rating}} |
| Performance | {{rating}} | {{rating}} | {{rating}} | {{rating}} |
| Cost | {{rating}} | {{rating}} | {{rating}} | {{rating}} |
| Replacement difficulty | {{rating}} | {{rating}} | {{rating}} | {{rating}} |

Allowed ratings:

- excellent
- good
- acceptable
- poor
- unacceptable
- unknown

## 33. Decision checklist

Confirm before approving the tool.

- [ ] The capability need is clearly defined.
- [ ] Current implementation and gaps are documented.
- [ ] Reuse alternatives were evaluated.
- [ ] Custom implementation was considered.
- [ ] Tool identity and exact version are recorded.
- [ ] Source and distribution provenance are recorded.
- [ ] Integrity-verification strategy is documented.
- [ ] License identity is verified.
- [ ] License compatibility is reviewed.
- [ ] Security assessment is complete.
- [ ] Known vulnerabilities are reviewed.
- [ ] Supply-chain risks are reviewed.
- [ ] Maintainer and maturity risks are reviewed.
- [ ] Functional fit is evidence-backed.
- [ ] Unsupported scope is explicit.
- [ ] Failure semantics are safe.
- [ ] Failed analysis cannot become absence evidence.
- [ ] Open-world coverage behavior is preserved.
- [ ] Positive liveness evidence remains dominant.
- [ ] Tool output can be normalized deterministically.
- [ ] Repository content remains untrusted.
- [ ] Structured-command execution is defined.
- [ ] Runner isolation requirements are defined.
- [ ] Credentials and network access are minimized.
- [ ] Secret values are excluded from retained records.
- [ ] Tenant-isolation impact is reviewed.
- [ ] Database and migration impact is reviewed.
- [ ] Performance and scale claims are bounded.
- [ ] Cost impact is documented.
- [ ] Required tests are defined.
- [ ] Exit and replacement strategy is defined.
- [ ] Limitations are user-visible.
- [ ] The record does not authorize implementation or installation.

## 34. Final decision

### 34.1 Decision status

{{decision_status}}

### 34.2 Decision statement

{{final_decision_statement}}

### 34.3 Approved use

{{approved_use_or_not_applicable}}

### 34.4 Prohibited use

{{prohibited_use}}

### 34.5 Required limitations

{{required_limitations}}

### 34.6 Required controls

{{required_security_controls}}

### 34.7 Required tests

{{required_tests}}

### 34.8 Required authorization

{{required_authorization}}

### 34.9 Expiration or review trigger

{{expiration_or_review_trigger}}

### 34.10 Implementation authorization granted by this record

No

## 35. Review decisions

| Role | Reviewer | Decision | Timestamp | Notes |
| --- | --- | --- | --- | --- |
| Tooling reviewer | {{reviewer}} | {{decision}} | {{timestamp}} | {{notes}} |
| Architecture reviewer | {{reviewer}} | {{decision}} | {{timestamp}} | {{notes}} |
| Security reviewer | {{reviewer}} | {{decision}} | {{timestamp}} | {{notes}} |
| License reviewer | {{reviewer}} | {{decision}} | {{timestamp}} | {{notes}} |
| Operations reviewer | {{reviewer}} | {{decision}} | {{timestamp}} | {{notes}} |
| Database reviewer | {{reviewer}} | {{decision}} | {{timestamp}} | {{notes}} |

Allowed review decisions:

- approved
- approved_with_limitations
- rejected
- changes_required
- not_required
- not_reviewed

## 36. Revision history

| Version | Date | Author | Change | Status |
| --- | --- | --- | --- | --- |
| 1 | {{date}} | {{author}} | Initial evaluation | {{status}} |
| {{version}} | {{date}} | {{author}} | {{change_summary}} | {{status}} |

Material changes to the selected tool, version, licensing, security posture, integration architecture, or required use should create a new decision record or explicitly supersede the previous record.