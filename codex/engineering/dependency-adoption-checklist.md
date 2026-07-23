# Dependency Adoption Checklist

This checklist must be completed before a third-party tool, library, service,
container image, database extension, binary, or package becomes a mandatory
DCAv2 dependency.

The checklist supports evidence-based review. Checking a box without supporting
evidence does not satisfy the requirement.

This document must be applied together with:

- `codex/engineering/reuse-first-policy.md`;
- `codex/engineering/tooling-and-license-policy.md`;
- `codex/engineering/adr-policy.md`;
- `codex/engineering/testing-policy.md`;
- `codex/architecture/trust-boundaries.md`;
- `codex/architecture/capability-definitions.md`;
- `codex/core/08-secret-handling-policy.md`.

---

## 1. Completion rules

Use one status for every checklist item:

- `[x]` — completed and supported by recorded evidence;
- `[ ]` — not completed;
- `[~]` — partially completed or conditionally satisfied;
- `[N/A]` — not applicable, with a written reason;
- `[BLOCKED]` — cannot be completed because required information or
  infrastructure is unavailable.

A dependency must not be approved when a required item remains:

- unchecked;
- partially completed;
- blocked;
- unsupported by evidence.

An `N/A` decision must include a specific explanation.

This checklist does not authorize installation, network access, credential use,
source modification, or external operations.

---

## 2. Review metadata

Complete the following fields:

```yaml
review:
  review_id: null
  dependency_name: null
  canonical_project_identity: null
  dependency_type: null
  proposed_version: null
  proposed_version_range: null
  proposed_role: null
  target_capability_ids: []
  execution_trust_zone: null
  requested_by: null
  reviewed_by: []
  review_started_at: null
  review_completed_at: null
  active_phase_authorization_id: null
  related_tool_decision: null
  related_adr: null
  final_decision: pending
```

Permitted final_decision values are:

- pending;
- adopt;
- adopt_with_constraints;
- experimental_only;
- defer;
- reject;
- replace_existing;
- build_custom;
- blocked_pending_information.

---

## 3. Problem and capability fit

- [ ] The exact engineering problem is documented.
- [ ] The target DCAv2 capability identifiers are listed.
- [ ] The proposed dependency role is narrow and explicit.
- [ ] Supported inputs are documented.
- [ ] Unsupported inputs are documented.
- [ ] Required outputs are documented.
- [ ] Failure states are documented.
- [ ] The dependency's role in evidence, coverage, classification, transformation, verification, or publication is identified.
- [ ] The dependency is not being adopted merely because it is popular, available, or mentioned in a roadmap.
- [ ] The dependency does not receive authority over DCAv2 policy decisions.
- [ ] Detection support is distinguished from remediation support.
- [ ] Local functionality is distinguished from external publication support.
- [ ] Functional support is distinguished from scale validation.

### Evidence

- **Problem statement:**
- **Target capabilities:**
- **Supported scope:**
- **Unsupported scope:**
- **Expected outputs:**
- **Failure states:**

---

## 4. Existing implementation review

- [ ] Existing DCAv2 functionality was inspected before proposing the dependency.
- [ ] Existing adapters were inspected.
- [ ] Existing parsers and analyzers were inspected.
- [ ] Existing data models were inspected.
- [ ] Existing migrations were inspected.
- [ ] Existing fixtures were inspected.
- [ ] Existing command-runner behavior was inspected.
- [ ] Existing provider integrations were inspected where relevant.
- [ ] The proposal does not create an undocumented parallel implementation.
- [ ] Any replaced implementation has a migration and rollback plan.
- [ ] Existing working behavior will be preserved unless an explicit change is authorized.

### Evidence

- **Existing implementation paths:**
- **Existing tests:**
- **Behavior being preserved:**
- **Behavior being replaced:**
- **Migration requirement:**

---

## 5. Alternatives considered

At minimum, compare:

- existing DCAv2 functionality;
- language or runtime standard-library support;
- already approved dependencies;
- applicable open standards;
- alternative maintained tools;
- a narrow custom implementation;
- deferring the capability.

### Checklist

- [ ] Existing DCAv2 functionality was considered.
- [ ] Standard-library or platform functionality was considered.
- [ ] Already approved dependencies were considered.
- [ ] Relevant open standards were considered.
- [ ] At least one reasonable alternative was evaluated when available.
- [ ] A minimal custom implementation was considered.
- [ ] Deferring the capability was considered.
- [ ] Rejected alternatives have factual, current rationale.
- [ ] No historical rationale was invented.
- [ ] The comparison includes long-term maintenance and replacement cost.

### Comparison

| Candidate | Functional fit | Security | License | Maintenance | Integration cost | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| Existing DCAv2 behavior |  |  |  |  |  |  |
| Standard or platform capability |  |  |  |  |  |  |
| Proposed dependency |  |  |  |  |  |  |
| Alternative dependency |  |  |  |  |  |  |
| Narrow custom implementation |  |  |  |  |  |  |
| Defer |  |  |  |  |  |  |

---

## 6. Project identity and provenance

- [ ] The canonical upstream project is identified.
- [ ] The official source repository is identified.
- [ ] The official package or artifact location is identified.
- [ ] The exact proposed version is identified.
- [ ] The proposed artifact belongs to the expected upstream project.
- [ ] The download or registry source is approved.
- [ ] The dependency is not obtained from an arbitrary mirror.
- [ ] The dependency is not supplied by an analyzed repository as a trusted DCAv2 tool.
- [ ] The dependency does not rely on an unknown host-global installation.
- [ ] Artifact hashes, package integrity values, image digests, or source revisions are recorded where available.
- [ ] Release provenance or signatures were evaluated where available.

### Evidence

- **Official project:**
- **Official repository:**
- **Official registry or distribution source:**
- **Exact version:**
- **Artifact identity:**
- **Checksum or digest:**
- **Provenance limitations:**

---

## 7. Version control and reproducibility

- [ ] The dependency version is pinned or deterministically locked.
- [ ] A mutable latest tag is not the only version identity.
- [ ] The package-manager version is controlled.
- [ ] Container images use immutable digests where applicable.
- [ ] Binary downloads use exact versions and integrity verification.
- [ ] Source builds use immutable source revisions.
- [ ] Required configuration is version-controlled.
- [ ] The executed version can be captured in evidence and reports.
- [ ] Installation is reproducible enough for the supported environment.
- [ ] The dependency does not silently fall back to another version.
- [ ] Upgrade behavior is documented.
- [ ] Downgrade behavior is documented when relevant.

### Evidence

- **Version pin:**
- **Lockfile:**
- **Container digest:**
- **Tool-version command:**
- **Reproduction command:**

---

## 8. License identification

- [ ] The license for the exact proposed version was identified.
- [ ] The license was verified using an authoritative source.
- [ ] The authoritative license source is recorded.
- [ ] Package metadata and source license information are consistent.
- [ ] Custom license terms were reviewed.
- [ ] Dual-license terms were reviewed where applicable.
- [ ] Source-available terms were identified where applicable.
- [ ] No-license or ambiguous-license conditions are absent.
- [ ] The license verification date is recorded.
- [ ] Unresolved license questions are documented.

### Evidence

- **License identifier:**
- **Authoritative license source:**
- **Version reviewed:**
- **Verification date:**
- **Reviewer:**
- **Unresolved questions:**

---

## 9. License compatibility

- [ ] Commercial use implications were reviewed.
- [ ] Internal-use implications were reviewed.
- [ ] Hosted-service use implications were reviewed.
- [ ] Modification rights were reviewed.
- [ ] Source redistribution implications were reviewed.
- [ ] Binary redistribution implications were reviewed.
- [ ] Container-image distribution implications were reviewed.
- [ ] Linking or embedding implications were reviewed.
- [ ] Plugin distribution implications were reviewed.
- [ ] Generated-output implications were reviewed.
- [ ] Copyleft obligations were reviewed.
- [ ] Network-copyleft obligations were reviewed where applicable.
- [ ] Source-disclosure obligations were reviewed.
- [ ] Attribution obligations were reviewed.
- [ ] Notice-file obligations were reviewed.
- [ ] Trademark restrictions were reviewed where applicable.
- [ ] Export or jurisdictional restrictions were reviewed where applicable.
- [ ] Mandatory legal review was completed where required.

### Evidence

- **Intended use:**
- **Distribution model:**
- **Required notices:**
- **Required source obligations:**
- **Legal-review reference:**
- **Constraints:**

---

## 10. Transitive license review

- [ ] Significant transitive dependencies were identified.
- [ ] Unknown transitive licenses were investigated.
- [ ] Conflicting license obligations were investigated.
- [ ] Native binary licenses were reviewed.
- [ ] Bundled assets, templates, and generated runtime components were reviewed.
- [ ] Required transitive notices were identified.
- [ ] Automated scanner output was manually reviewed where material.
- [ ] Scanner uncertainty remains visible.
- [ ] Transitive-license changes can be detected during upgrades.

### Evidence

- **Transitive dependency count:**
- **Unknown licenses:**
- **Material obligations:**
- **Scanner used:**
- **Manual-review summary:**

---

## 11. Maintenance and project health

- [ ] The latest stable release was identified.
- [ ] The proposed version is supported upstream or intentionally pinned.
- [ ] Release activity was reviewed.
- [ ] Issue responsiveness was reviewed.
- [ ] Security-reporting guidance was reviewed.
- [ ] Supported runtimes and platforms were reviewed.
- [ ] Maintainer concentration was considered.
- [ ] Archived or abandoned status was checked.
- [ ] Release provenance was considered.
- [ ] The dependency's expected lifetime matches the capability's expected lifetime.
- [ ] A replacement strategy exists if maintenance stops.
- [ ] Current maintenance information was verified rather than assumed.

### Evidence

- **Latest stable release:**
- **Proposed release:**
- **Last release date:**
- **Maintenance status:**
- **Security policy:**
- **Supported runtimes:**
- **Bus-factor concerns:**

---

## 12. Security architecture

- [ ] The dependency's execution trust zone is identified.
- [ ] The dependency does not weaken controller, runner, or publisher separation.
- [ ] Repository-controlled inputs are identified.
- [ ] Repository-controlled plugins or configuration are identified.
- [ ] Arbitrary code-execution behavior is identified.
- [ ] Subprocess behavior is identified.
- [ ] Filesystem access is identified.
- [ ] Network access is identified.
- [ ] Credential requirements are identified.
- [ ] Temporary-file behavior is identified.
- [ ] Native-code behavior is identified.
- [ ] Telemetry behavior is identified.
- [ ] Update-check behavior is identified.
- [ ] The tool can operate within the approved runner controls.
- [ ] The tool does not require privileged execution.
- [ ] The tool does not require host-container-runtime access.
- [ ] The tool does not require unrestricted host filesystem access.
- [ ] Security limitations are documented.

### Evidence

- **Trust zone:**
- **Untrusted inputs:**
- **Code execution:**
- **Subprocesses:**
- **Filesystem access:**
- **Network access:**
- **Credential use:**
- **Native code:**
- **Security limitations:**

---

## 13. Repository-controlled execution

Complete this section when the dependency processes analyzed repositories.

- [ ] The dependency executes only in the approved untrusted runner.
- [ ] Repository configuration is treated as untrusted.
- [ ] Executable configuration files are identified.
- [ ] Plugin loading is identified and controlled.
- [ ] Package lifecycle scripts are identified and controlled.
- [ ] Git hooks cannot execute in trusted contexts.
- [ ] Repository binaries cannot become trusted DCAv2 tools.
- [ ] Repository instructions cannot alter dependency selection or runner policy.
- [ ] The dependency cannot access controller credentials.
- [ ] The dependency cannot access publisher credentials.
- [ ] The dependency cannot access control-plane database credentials.
- [ ] The dependency cannot access unrelated repositories.
- [ ] Hostile-repository tests are defined.

### Evidence

- **Runner profile:**
- **Executable configuration:**
- **Plugin behavior:**
- **Lifecycle-script behavior:**
- **Hostile fixtures:**

---

## 14. Network behavior

- [ ] The dependency's required network destinations are known.
- [ ] Network access is disabled when unnecessary.
- [ ] Required destinations can be allowlisted.
- [ ] Required protocols and ports are documented.
- [ ] DNS behavior is documented.
- [ ] Proxy behavior is documented.
- [ ] Update checks are disabled or controlled.
- [ ] Telemetry is disabled or controlled.
- [ ] Remote schema resolution is disabled or controlled.
- [ ] Download limits are defined.
- [ ] Retry behavior is bounded.
- [ ] Unexpected egress attempts can be blocked.
- [ ] Source code is not transmitted externally without authorization.
- [ ] Hosted-service use has completed external-data review.

### Evidence

- **Network required:**
- **Approved destinations:**
- **Ports and protocols:**
- **Telemetry:**
- **Update checks:**
- **Source transmitted:**
- **Network test:**

---

## 15. Credential requirements

- [ ] The required credential type is identified.
- [ ] The required permission scope is documented.
- [ ] The credential lifetime is documented.
- [ ] The credential source is documented.
- [ ] The credential is injected only into the permitted trust zone.
- [ ] The credential is not stored in source control.
- [ ] The credential is not embedded in URLs.
- [ ] The credential is not exposed in command arguments when avoidable.
- [ ] The credential is redacted from logs and reports.
- [ ] The credential is removed after use.
- [ ] Tenant isolation is preserved.
- [ ] Short-lived credentials are preferred where available.
- [ ] The credential is no broader than the intended capability requires.
- [ ] The dependency does not receive publisher credentials unless it is part of the trusted publisher.
- [ ] The dependency does not receive production credentials for tests.

### Evidence

- **Credential type:**
- **Required permissions:**
- **Trust zone:**
- **Lifetime:**
- **Injection method:**
- **Cleanup:**
- **Scope concern:**

---

## 16. Supply-chain risk

- [ ] Direct dependencies were inventoried.
- [ ] Significant transitive dependencies were inventoried.
- [ ] Installation scripts were reviewed.
- [ ] Native binaries were reviewed.
- [ ] Binary provenance was reviewed.
- [ ] Package integrity controls were reviewed.
- [ ] Signature or attestation support was reviewed where available.
- [ ] Known dependency-confusion risks were considered.
- [ ] Registry namespace ownership was verified.
- [ ] Cache-poisoning risks were considered.
- [ ] Build-time downloads were identified.
- [ ] Runtime downloads were identified.
- [ ] Remote update mechanisms were identified.
- [ ] Dependency footprint is proportionate to the capability.
- [ ] A software bill of materials can include the dependency where required.

### Evidence

- **Direct dependency:**
- **Transitive dependency summary:**
- **Install scripts:**
- **Native binaries:**
- **Integrity controls:**
- **Supply-chain concerns:**

---

## 17. Vulnerability review

- [ ] Current vulnerability advisories were checked.
- [ ] The exact proposed version was checked.
- [ ] Reachability of relevant vulnerable paths was assessed.
- [ ] Untrusted-input exposure was assessed.
- [ ] Existing mitigations were assessed.
- [ ] Fixed versions were identified where applicable.
- [ ] Upgrade compatibility was assessed.
- [ ] Residual risk is documented.
- [ ] Vulnerability scanning limitations are documented.
- [ ] The dependency has an identified future advisory source.

### Evidence

- **Advisory sources:**
- **Relevant advisories:**
- **Reachability:**
- **Mitigations:**
- **Residual risk:**

---

## 18. Functional evaluation

- [ ] The dependency was tested against representative positive fixtures.
- [ ] The dependency was tested against representative negative fixtures.
- [ ] Unsupported inputs were tested.
- [ ] Malformed inputs were tested.
- [ ] Dynamic behavior was tested where relevant.
- [ ] Framework behavior was tested where relevant.
- [ ] Generated code was tested where relevant.
- [ ] Public APIs were tested where relevant.
- [ ] Test-only usage was tested where relevant.
- [ ] Cross-package usage was tested where relevant.
- [ ] Mixed-language behavior was tested where relevant.
- [ ] Results were compared with expected evidence.
- [ ] Tool-specific confidence scores were not treated as DCAv2 authority.
- [ ] The dependency demonstrated behavior beyond one hardcoded fixture.

### Evidence

- **Positive fixtures:**
- **Negative fixtures:**
- **Unsupported fixtures:**
- **Expected results:**
- **Observed results:**
- **Functional limitations:**

---

## 19. Output contract

- [ ] Structured output is used where available.
- [ ] The output schema is documented.
- [ ] The output schema version is identified.
- [ ] Source locations are represented accurately.
- [ ] Tool version is captured.
- [ ] Configuration identity is captured.
- [ ] Failure fields are represented.
- [ ] Exclusions are represented.
- [ ] Output ordering is deterministic or canonicalizable.
- [ ] Output size can be bounded.
- [ ] Invalid encoding is handled safely.
- [ ] Terminal escape sequences are handled safely.
- [ ] Prompt-injection content remains untrusted data.
- [ ] Tool output is not persisted without validation and redaction.

### Evidence

- **Output format:**
- **Schema:**
- **Schema version:**
- **Maximum expected size:**
- **Canonicalization:**
- **Validation implementation:**

---

## 20. Failure semantics

The integration must distinguish:

- success with results;
- success without results;
- partial success;
- unsupported input;
- configuration required;
- missing executable;
- dependency-installation failure;
- timeout;
- resource exhaustion;
- malformed output;
- internal failure.

### Checklist

- [ ] Success with zero results is distinguishable from failure.
- [ ] Partial output is distinguishable from complete output.
- [ ] Unsupported input is distinguishable from tool failure.
- [ ] Missing configuration is explicit.
- [ ] Missing executable is explicit.
- [ ] Timeout is explicit.
- [ ] Resource exhaustion is explicit.
- [ ] Malformed output is explicit.
- [ ] Internal failure is explicit.
- [ ] Failure reduces coverage appropriately.
- [ ] Failure blocks dependent classification where required.
- [ ] Failure cannot become an empty successful result.
- [ ] Retry safety is documented.

### Evidence

- **Exit-code mapping:**
- **Status mapping:**
- **Partial-output handling:**
- **Retry policy:**
- **Coverage impact:**

---

## 21. Adapter design

- [ ] The dependency is isolated behind a DCAv2-owned adapter.
- [ ] The adapter has structured inputs.
- [ ] The adapter uses an approved command identity.
- [ ] Variable arguments are validated.
- [ ] The working directory is constrained.
- [ ] The environment uses an allowlist.
- [ ] Tool output is schema-validated.
- [ ] Tool failures are preserved.
- [ ] Provenance is captured.
- [ ] Secrets are redacted.
- [ ] Output is bounded.
- [ ] Unsupported cases are explicit.
- [ ] Tool-specific concepts do not leak unnecessarily into domain models.
- [ ] The adapter supports dependency replacement.
- [ ] The adapter does not grant classification or remediation authority.

### Evidence

- **Adapter path:**
- **Input schema:**
- **Output schema:**
- **Command definition:**
- **Replacement boundary:**

---

## 22. Evidence integration

Complete this section when the dependency produces analysis evidence.

- [ ] The emitted DCAv2 evidence types are identified.
- [ ] Raw artifacts remain distinguishable from normalized evidence.
- [ ] Provenance fields are complete.
- [ ] Source snapshot identity is preserved.
- [ ] Source occurrences are represented accurately.
- [ ] Evidence polarity is assigned by DCAv2 policy.
- [ ] Evidence strength is represented accurately.
- [ ] Correlated evidence is identified.
- [ ] Contradictory evidence is preserved.
- [ ] Ambiguous mappings remain ambiguous.
- [ ] Staleness triggers are defined.
- [ ] Evidence invalidation is defined.
- [ ] Tool conclusions are not copied as authoritative DCAv2 classifications.

### Evidence

- **Evidence types:**
- **Raw artifact type:**
- **Normalization rules:**
- **Correlation group:**
- **Freshness rules:**

---

## 23. Coverage integration

Complete this section when the dependency contributes to coverage.

- [ ] The exact coverage dimensions are identified.
- [ ] The dependency's scope is explicit.
- [ ] Required versus optional coverage contribution is explicit.
- [ ] Exclusions are represented.
- [ ] Unsupported scope is represented.
- [ ] Failed scope is represented.
- [ ] Partial completion is represented.
- [ ] Aggregate coverage rules do not overstate completeness.
- [ ] Tool failure cannot produce complete coverage.
- [ ] Coverage freshness is defined.
- [ ] Coverage digest impact is defined.
- [ ] Public consumer or dynamic behavior limitations remain visible.

### Evidence

- **Coverage dimensions:**
- **Coverage profiles:**
- **Completion requirements:**
- **Blocking failures:**
- **Known blind spots:**

---

## 24. Classification impact

- [ ] The dependency cannot directly authorize candidate_dead.
- [ ] Positive liveness evidence has correct precedence.
- [ ] Tool count is not used as authoritative voting.
- [ ] Numeric tool scores do not override DCAv2 policy.
- [ ] Unsupported tool behavior produces unsupported or another safe state.
- [ ] Tool failure produces failed, inconclusive, or reduced coverage.
- [ ] Contradictions remain visible.
- [ ] Public API limitations remain visible.
- [ ] Dynamic behavior limitations remain visible.
- [ ] Classification-policy changes are versioned and tested.

### Evidence

- **Classification profiles affected:**
- **Dominance rules affected:**
- **Blockers introduced:**
- **Policy change required:**

---

## 25. Transformation impact

Complete this section when the dependency changes source code.

- [ ] Supported transformation shapes are explicit.
- [ ] Unsupported transformation shapes are explicit.
- [ ] Semantic and syntax preconditions are explicit.
- [ ] Expected rewrite count is defined.
- [ ] Changed-file expectations are defined.
- [ ] The transformation is deterministic where required.
- [ ] The transformation is idempotent where required.
- [ ] Zero unexpected rewrites cause failure.
- [ ] Excess rewrites cause failure.
- [ ] Unexpected files cause failure.
- [ ] Generated-code behavior is defined.
- [ ] Public API transformations are excluded unless separately governed.
- [ ] Plain text deletion is not used for ambiguous structured code.
- [ ] Baseline and post-change verification requirements are defined.

### Evidence

- **Transformation ID:**
- **Supported shapes:**
- **Unsupported shapes:**
- **Rewrite count:**
- **Changed files:**
- **Determinism test:**
- **Idempotency test:**

---

## 26. Trusted publication impact

Complete this section when the dependency participates in external publication.

- [ ] The dependency executes only within the trusted publisher.
- [ ] Repository-controlled code cannot execute through it.
- [ ] Git hooks are disabled.
- [ ] Repository identity is validated independently.
- [ ] The prohibited-repository policy is enforced.
- [ ] Patch identity is validated.
- [ ] Changed files are validated.
- [ ] Default-branch pushes are prohibited.
- [ ] Merge is prohibited.
- [ ] Auto-merge is prohibited.
- [ ] Automatic ready-for-review transitions are prohibited.
- [ ] Idempotency behavior is defined.
- [ ] Partial external state can be reconciled.
- [ ] Credentials are narrowly scoped and isolated.

### Evidence

- **Publisher component:**
- **Credential type:**
- **Provider operations:**
- **Idempotency design:**
- **Partial-state behavior:**

---

## 27. Resource behavior

- [ ] Expected CPU use was measured or bounded.
- [ ] Expected memory use was measured or bounded.
- [ ] Expected disk use was measured or bounded.
- [ ] Expected process count was measured or bounded.
- [ ] Expected output size was measured or bounded.
- [ ] Expected artifact size was measured or bounded.
- [ ] Expected network use was measured or bounded.
- [ ] Timeouts are defined.
- [ ] Resource-limit failures are explicit.
- [ ] The dependency cleans temporary resources.
- [ ] Resource behavior is acceptable for the intended runner profile.
- [ ] Unmeasured limits remain documented.

### Evidence

- **Fixture size:**
- **Duration:**
- **Peak memory:**
- **Disk use:**
- **Output size:**
- **Timeout:**
- **Resource limits:**

---

## 28. Performance and scale

- [ ] Representative workloads were defined.
- [ ] Benchmark methodology was documented.
- [ ] Tool and adapter versions were recorded.
- [ ] Runner profile was recorded.
- [ ] Cache conditions were recorded.
- [ ] More than one run was used when variability matters.
- [ ] Repository size was recorded.
- [ ] File and symbol counts were recorded where relevant.
- [ ] Package and workspace counts were recorded where relevant.
- [ ] Concurrency behavior was tested where relevant.
- [ ] Database impact was measured where relevant.
- [ ] Scale claims are bounded to measured results.
- [ ] Functional status is not being confused with scale validation.

### Evidence

- **Benchmark fixture:**
- **Environment:**
- **Measurements:**
- **Concurrency:**
- **Validated limit:**
- **Unvalidated scale:**

---

## 29. Platform compatibility

- [ ] Supported operating systems are documented.
- [ ] Supported architectures are documented.
- [ ] Required runtime versions are documented.
- [ ] Required libc or native-runtime assumptions are documented.
- [ ] Container compatibility is documented.
- [ ] Local-development compatibility is documented.
- [ ] CI compatibility is documented.
- [ ] Production-runner compatibility is documented.
- [ ] Unsupported platforms fail explicitly.
- [ ] Platform-specific behavior is tested where required.

### Evidence

- **Operating systems:**
- **Architectures:**
- **Runtime versions:**
- **Container requirements:**
- **Unsupported platforms:**

---

## 30. Data handling

- [ ] Data read by the dependency is documented.
- [ ] Data written by the dependency is documented.
- [ ] Temporary data is documented.
- [ ] Source-code transmission is documented.
- [ ] Personal-data handling is documented where applicable.
- [ ] Secret-bearing input risk is documented.
- [ ] Output redaction is implemented.
- [ ] Data retention is documented.
- [ ] Data deletion behavior is documented.
- [ ] Tenant isolation is preserved.
- [ ] Hosted-service data terms were reviewed where applicable.
- [ ] Data minimization is applied.

### Evidence

- **Input data:**
- **Output data:**
- **External transmission:**
- **Retention:**
- **Deletion:**
- **Tenant controls:**

---

## 31. Database and migration impact

- [ ] Database schema changes are identified.
- [ ] Changes use additive, ordered migrations.
- [ ] Existing migrations are not rewritten.
- [ ] Historical tool provenance is preserved.
- [ ] Historical evidence is not relabeled.
- [ ] Nullable legacy behavior is defined.
- [ ] Rollback or forward-recovery behavior is defined.
- [ ] Migration from an existing database is tested.
- [ ] Tenant isolation remains enforced.
- [ ] Audit reconstruction remains possible.
- [ ] Tool removal will not destroy historical provenance.

### Evidence

- **Migration files:**
- **Tables affected:**
- **Historical data behavior:**
- **Upgrade test:**
- **Rollback or recovery:**

---

## 32. Testing requirements

- [ ] Unit tests exist for the adapter.
- [ ] Integration tests exist for actual tool execution.
- [ ] Positive fixtures exist.
- [ ] Negative fixtures exist.
- [ ] Unsupported fixtures exist.
- [ ] Failure fixtures exist.
- [ ] Timeout behavior is tested.
- [ ] Resource-exhaustion behavior is tested where practical.
- [ ] Malformed output is tested.
- [ ] Missing executable behavior is tested.
- [ ] Version mismatch is tested.
- [ ] Secret redaction is tested.
- [ ] Tenant isolation is tested where applicable.
- [ ] Cleanup is tested.
- [ ] Fixture-specific hardcoding checks exist.
- [ ] Generalization across differing names and paths is tested.
- [ ] Required tests appear in the applicable phase test manifest.

### Evidence

- **Unit tests:**
- **Integration tests:**
- **Fixture repositories:**
- **Phase test IDs:**
- **Last test result:**

---

## 33. Hostile-input testing

Complete this section for tools processing untrusted repositories or external content.

- [ ] Malicious configuration loading was tested.
- [ ] Lifecycle-script execution was tested.
- [ ] Plugin loading was tested.
- [ ] Environment-variable access was tested.
- [ ] Host-file access was tested.
- [ ] Unauthorized network access was tested.
- [ ] Cloud metadata access was tested.
- [ ] Docker socket access was tested.
- [ ] Unbounded output was tested.
- [ ] Excessive process creation was tested.
- [ ] Excessive memory use was tested where practical.
- [ ] Path traversal was tested.
- [ ] Unexpected-file creation was tested.
- [ ] Terminal control sequences were tested.
- [ ] Prompt-injection text was tested.
- [ ] Synthetic secret exposure was tested.
- [ ] Hostile tests use only synthetic, non-sensitive targets.

### Evidence

- **Hostile fixtures:**
- **Security-control test IDs:**
- **Runner profile:**
- **Observed results:**
- **Known untested threats:**

---

## 34. Operational behavior

- [ ] Startup and initialization behavior are documented.
- [ ] Health-check behavior is documented where applicable.
- [ ] Retry behavior is bounded.
- [ ] Partial-success behavior is documented.
- [ ] Cancellation behavior is documented.
- [ ] Cleanup behavior is documented.
- [ ] Logging is bounded and redacted.
- [ ] Metrics are bounded and tenant-safe.
- [ ] Failure alerts are defined where applicable.
- [ ] Dependency unavailability has an explicit operational result.
- [ ] The dependency can be disabled safely where applicable.
- [ ] A rollback or containment procedure exists.

### Evidence

- **Startup:**
- **Health check:**
- **Retry:**
- **Cancellation:**
- **Cleanup:**
- **Disable procedure:**

---

## 35. Upgrade strategy

- [ ] The dependency owner is identified.
- [ ] An advisory source is identified.
- [ ] An update cadence is defined.
- [ ] Release-note review is required.
- [ ] License-change review is required.
- [ ] Transitive-dependency review is required.
- [ ] Output-schema compatibility review is required.
- [ ] Configuration compatibility review is required.
- [ ] Network and telemetry changes are reviewed.
- [ ] Required regression tests are identified.
- [ ] Historical evidence compatibility is preserved.
- [ ] Automatic unreviewed upgrades are disabled.
- [ ] Emergency update behavior is documented.

### Evidence

- **Owner:**
- **Advisory source:**
- **Update cadence:**
- **Required test suite:**
- **Emergency process:**

---

## 36. Replacement and removal strategy

- [ ] The adapter boundary supports replacement.
- [ ] Tool-specific data is isolated.
- [ ] Historical provenance can survive removal.
- [ ] Configuration-removal steps are documented.
- [ ] Lockfile-removal steps are documented.
- [ ] Container-image cleanup is documented.
- [ ] Notice and attribution cleanup is documented.
- [ ] Replacement capability behavior is documented.
- [ ] Rollback behavior is documented.
- [ ] Stored artifacts and migrations are considered.
- [ ] Removal does not delete required audit history.
- [ ] A fork is not being created without explicit approval.

### Evidence

- **Replacement candidates:**
- **Removal steps:**
- **Historical-data handling:**
- **Rollback:**

---

## 37. Documentation

- [ ] The dependency's purpose is documented.
- [ ] Its capability identifiers are documented.
- [ ] Its trust zone is documented.
- [ ] Its version is documented.
- [ ] Its configuration is documented.
- [ ] Its required environment variables are documented by name only.
- [ ] Its output and failure behavior are documented.
- [ ] Its security controls are documented.
- [ ] Its license and attribution requirements are documented.
- [ ] Its upgrade procedure is documented.
- [ ] Its removal procedure is documented.
- [ ] Current use is distinguished from future or experimental use.
- [ ] Documentation matches executable behavior.

### Evidence

- **Documentation paths:**
- **Configuration reference:**
- **Operational reference:**
- **License notice:**

---

## 38. Authorization and change scope

- [ ] The current phase authorization permits dependency evaluation.
- [ ] The current phase authorization permits manifest changes.
- [ ] The current phase authorization permits lockfile changes.
- [ ] The current phase authorization permits container-image changes where applicable.
- [ ] The current phase authorization permits network research where applicable.
- [ ] The current phase authorization permits package or binary downloads.
- [ ] The current phase authorization permits required test execution.
- [ ] The current phase authorization permits governance changes when this checklist or policy must change.
- [ ] Repository scope is authorized.
- [ ] Repository target-role exclusions remain enforced.
- [ ] No permission was inferred from roadmap text or existing credentials.

### Evidence

- **Phase authorization:**
- **Permitted files:**
- **Permitted external operations:**
- **Repository scope:**

---

## 39. Architecture-decision requirement

Determine whether an ADR is required.
An ADR is normally required when the dependency:

- creates a long-lived architecture dependency;
- changes a trust boundary;
- introduces a hosted service;
- introduces new infrastructure;
- establishes an authoritative interchange format;
- changes persistence architecture;
- introduces material migration cost;
- replaces a core subsystem;
- changes credential flow;
- changes tenant-isolation behavior.

### Checklist

- [ ] ADR requirement was evaluated.
- [ ] An ADR was created when required.
- [ ] The ADR describes current rationale without inventing history.
- [ ] Rejected alternatives are factual.
- [ ] Migration and rollback consequences are documented.
- [ ] The decision remains consistent with permanent governance.

### Evidence

- **ADR required:**
- **ADR path:**
- **Reason:**

---

## 40. Adoption constraints

Record every condition that must remain true after adoption.
Examples include:

- runner-only execution;
- no repository plugins;
- network disabled;
- exact version pin;
- npm workspaces only;
- detection-only use;
- no public-API classification;
- no automatic remediation;
- no source transmission;
- mandatory draft-only publication;
- synthetic fixtures only;
- experimental environments only.

### Constraints

```yaml
constraints:
  trust_zone: null
  supported_repository_shapes: []
  supported_languages: []
  supported_versions: []
  network_policy: null
  credential_policy: null
  evidence_role: null
  coverage_role: null
  remediation_allowed: false
  publication_allowed: false
  production_allowed: false
  additional_constraints: []
```

- [ ] Every constraint is enforceable.
- [ ] Every constraint is tested where practical.
- [ ] Constraint violation produces an explicit safe failure.
- [ ] Constraints appear in capability reporting.
- [ ] Constraints appear in operational documentation.

---

## 41. Blocking conditions

Record unresolved conditions:

```yaml
blocking_conditions:
  license: []
  security: []
  provenance: []
  maintenance: []
  compatibility: []
  functional_fit: []
  testing: []
  infrastructure: []
  authorization: []
  legal_review: []
  other: []
```

- [ ] Every blocker has an owner or required decision.
- [ ] Every blocker has a safe next action.
- [ ] No blocker is hidden by marking the dependency experimental.
- [ ] Mandatory adoption remains prohibited while a material blocker exists.

---

## 42. Final review summary

Complete the summary:

```yaml
summary:
  functional_fit: null
  security_result: null
  license_result: null
  provenance_result: null
  maintenance_result: null
  test_result: null
  scale_result: null
  migration_result: null
  operational_result: null
  unresolved_risks: []
  adoption_constraints: []
  recommended_decision: pending
```

---

## 43. Final decision

Select exactly one decision:

- [ ] adopt
- [ ] adopt_with_constraints
- [ ] experimental_only
- [ ] defer
- [ ] reject
- [ ] replace_existing
- [ ] build_custom
- [ ] blocked_pending_information

### Decision rationale

**Decision:**

**Capability scope:**

**Approved version:**

**Approved trust zone:**

**Approved environments:**

**Required constraints:**

**Rejected uses:**

**Remaining limitations:**

**Review evidence:**

**Decision owner:**

**Decision date:**

---

## 44. Approval conditions

A decision of adopt requires all applicable conditions below:

- [ ] Functional fit is established.
- [ ] License is verified and compatible.
- [ ] Provenance is verified.
- [ ] Security review is complete.
- [ ] Required trust-boundary controls are enforced.
- [ ] Required positive tests pass.
- [ ] Required negative tests pass.
- [ ] Required hostile tests pass.
- [ ] Failure behavior is explicit.
- [ ] Output validation is implemented.
- [ ] Version is controlled.
- [ ] Required migrations pass.
- [ ] Documentation is complete.
- [ ] Upgrade and removal strategies exist.
- [ ] The current authorization permits adoption.
- [ ] No material blocker remains.

A decision of adopt_with_constraints requires the same applicable evidence, plus explicit enforceable constraints.
A decision of experimental_only must not be represented as production approval.

---

## 45. Post-adoption verification

After implementation, verify:

- [ ] The installed version matches the approved version.
- [ ] The lockfile or image digest matches the reviewed artifact.
- [ ] The dependency executes in the approved trust zone.
- [ ] Network behavior matches the approved policy.
- [ ] Credential behavior matches the approved policy.
- [ ] Adapter behavior matches the reviewed contract.
- [ ] Required tests pass in the actual integrated environment.
- [ ] Capability reporting reflects the exact supported scope.
- [ ] License notices are present where required.
- [ ] Tool inventory is updated.
- [ ] The dependency is absent from prohibited execution contexts.
- [ ] No unreviewed transitive change was introduced.

### Evidence

- **Implementation commit:**
- **Installed version:**
- **Lockfile or digest:**
- **Integrated test result:**
- **Tool inventory entry:**
- **Capability matrix entry:**

---

## 46. Review invalidation

The adoption review must be revisited when any of the following changes materially:

- dependency version;
- license;
- distribution model;
- execution trust zone;
- network behavior;
- credential requirements;
- telemetry behavior;
- plugin behavior;
- output schema;
- dependency graph;
- supported capability;
- provider terms;
- vulnerability status;
- maintenance status;
- container base image;
- data transmitted;
- tenant-isolation behavior.

- [ ] Review-invalidation triggers are recorded.
- [ ] The dependency owner is responsible for re-evaluation.
- [ ] Material changes cannot be adopted silently.
- [ ] Historical review records remain preserved.

---

## 47. Fail-safe outcome

When this checklist cannot be completed confidently:

- do not make the dependency mandatory;
- do not claim the related capability is functional;
- do not enable new credentials;
- do not enable unrestricted network access;
- do not transmit source code;
- do not run the tool in a trusted zone against untrusted input;
- do not invent license, maintenance, or security conclusions;
- preserve completed evaluation evidence;
- record unresolved requirements;
- select blocked_pending_information, experimental_only, defer, or reject.

Dependency uncertainty must reduce adoption authority.

---

## 48. Checklist integrity

This checklist must not be modified during an implementation phase unless engineering or governance modification is explicitly authorized.
Changes must not:

- remove mandatory license review;
- remove provenance review;
- remove security review;
- permit undeclared host-global tools;
- treat tool failure as empty success;
- permit trusted credentials in untrusted runners;
- bypass required testing;
- make experimental use equivalent to production approval.

Material checklist changes require a reviewable governance commit and an ADR when they alter long-lived dependency-adoption semantics.
