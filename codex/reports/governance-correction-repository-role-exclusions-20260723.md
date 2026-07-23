# Governance Correction Report: Repository Role Exclusions

## Completion

| Field | Result |
| --- | --- |
| Report ID | governance-correction-repository-role-exclusions-20260723-01 |
| Authorization ID | governance-correction-20260723-01 |
| Status | `complete` |
| Repository | `akshay-hudev/Rufa-Clean` |
| Repository role | `implementation_repository` |
| Commit | `23cd839bb6d25bd844231c8f7948c481948e31a4` |
| External operations | 0 |
| Application source changes | 0 |

## Correction outcome

The repository-access architecture now decides from:

`canonical repository identity + repository role + requested operation + current authorization`

Repository identity alone no longer blocks authorized development of the local
DCAv2 implementation.

For `akshay-hudev/Rufa-Clean`, local implementation inspection, modification,
builds, and tests require explicit phase authorization. The following target
roles remain permanently denied:

1. dead-code analysis target;
2. dead-code test fixture;
3. remediation target;
4. automated remediation publication target;
5. cross-repository dead-code graph participant;
6. runtime-evidence target.

Permission inheritance remains prohibited:

- read does not imply modification;
- implementation modification does not imply analysis-target permission;
- analysis permission does not imply remediation;
- analysis permission for another repository does not imply publication.

## Previous Phase 0 blocker

The prior Phase 0 attempt correctly stopped under the policy then in force. The
human operator subsequently clarified that the absolute identity-based policy
did not express the intended product rule.

The original report was not edited:

`codex/reports/phase-0-reconciliation-report.md`

Verified SHA-256:

`aeb165977083e697d7d794655e0b0503266564f7ea11899688cca842645bfbde`

The previous result remains historical truth; this report records the later
policy clarification and correction.

## Policy and schema changes

The correction updated:

- root operating instructions;
- core authorization, safety, source-control, secret, prompt-injection, and
  reporting policies;
- GitHub access and external-operation policies;
- remediation, publisher, coverage, audit, classification, and current-system
  architecture documents;
- authorization guidance and templates;
- roadmap repository-boundary language;
- testing and runner guidance;
- continuation, ADR, external-operation, and phase-report templates;
- Phase 0 and Phase 1 test manifests;
- the security-control matrix;
- repository-access and phase-authorization schemas.

New artifacts:

- `codex/schemas/repository-role-exclusions.schema.json`;
- `codex/schemas/github-repository-policy-v2.schema.json`;
- `codex/schemas/phase-authorization-v2.schema.json`;
- `codex/tests/validate-repository-role-governance.mjs`;
- `codex/authorizations/phase-0-reconciliation-authorization-request.yaml`;
- this report.

The legacy repository-access and phase-authorization schemas were preserved and
narrowly updated rather than replaced wholesale.

## Test coverage added

Both Phase 0 and Phase 1 manifests now verify:

- implementation-repository recognition;
- implementation work does not automatically trigger a target exclusion;
- explicit authorization is required for implementation work;
- read permission does not imply modification;
- implementation modification does not imply analysis permission;
- qualification as an analysis target is denied before analysis;
- dead-code finding generation is denied;
- fixture use is denied;
- remediation targeting is denied;
- cross-repository graph inclusion is denied;
- runtime dead-code evidence processing and classification are denied;
- automated dead-code remediation publication is denied;
- analysis permission for other repositories does not imply publication.

The security control `access-repository-role-exclusion` references both updated
manifest tests.

## Validation

Passed checks:

- `node --check codex/tests/validate-repository-role-governance.mjs`
- `node codex/tests/validate-repository-role-governance.mjs`
- modified YAML parsing with duplicate-key rejection
- modified JSON and schema parsing
- repository-role schema validation
- v2 GitHub policy and authorization schema validation
- Phase 0 and Phase 1 test assertion checks
- security-control/test-ID cross-reference checks
- referenced-path checks
- governance Markdown fence and NUL checks
- changed-path scope validation
- historical report hash validation
- `git diff --check`

Validation inventory:

- repository roles: 7;
- Phase 0 tests: 25;
- Phase 1 tests: 44;
- security controls: 60;
- modified YAML documents parsed: 8;
- modified JSON schemas parsed: 5.

No dependency was installed. No external schema service or network validator was
used.

## Repository-state preservation

The correction began with pre-existing changes from the blocked Phase 0 attempt
and a pre-existing deletion of `OPEARTING_GUIDE.MD`. Those states were
preserved. The governance correction did not restore, discard, or claim
ownership of that deletion.

No commit or branch was created.

## Next authorization request

The proposed request is stored at:

`codex/authorizations/phase-0-reconciliation-authorization-request.yaml`

Authorization ID:

`phase-0-reconciliation-20260723-02`

The request is not active and does not authorize itself. Phase 0 must not begin
until the human operator replies exactly:

`APPROVED`

Phase 1 remains unauthorized.
