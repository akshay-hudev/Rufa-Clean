# Phase 0 Prerequisite Repair and Readiness Report

Primary status: `READY_FOR_PHASE_1`

Authorization:
`phase-0-prerequisite-repair-and-readiness-20260723-01`

Date: 2026-07-23

## Scope and preservation

This repair resolved the Phase 1 prerequisite blockers retained in
`phase-0-reconciliation-report-02.md`. It did not begin Phase 1.

The implementation repository was treated only as
`implementation_repository`. No Rufa-Clean qualification, target metadata,
source acquisition, analysis, finding generation, fixture use, remediation,
cross-repository participation, runtime classification, contract analysis,
scale testing, branch, push, or publication occurred.

The initial worktree was clean at
`834c5f99a21e5baefa1cdd4f92922efff26689c4` on `main`. Work proceeded on the
local branch `codex/phase-0-prerequisite-readiness`. No pre-existing user
changes existed. No local commit was required. No default branch, external
branch, external commit, push, pull request, merge, auto-merge, or ready-state
transition was created.

The following historical evidence remains byte-for-byte preserved:

- `codex/reports/phase-0-reconciliation-report.md`
  (`aeb165977083e697d7d794655e0b0503266564f7ea11899688cca842645bfbde`);
- `codex/reports/phase-0-reconciliation-report-02.md`
  (`0b3490dbc919dd22a297351c6880f3caffb2770f3073e042556e781ff9930eb0`);
- `codex/reports/governance-correction-repository-role-exclusions-20260723.md`
  (`0af47b76d8f90b0493ffb0ced37688fc38c637b04ef4b5948e447c908398afb1`).

## Repairs completed

### Runtime repository access

A canonical fail-closed authorizer now evaluates canonical GitHub identity,
repository role, requested operation, active authorization, owner scope,
provider policy, and permanent role exclusions.

Runtime gates cover:

- GitHub account discovery before installation-client creation;
- target qualification before repository-specific metadata;
- credentials, clone, and fetch;
- discovery and indexing;
- static and semantic analysis;
- finding generation;
- remediation reproduction, patch preparation, transformation, and execution;
- cross-repository participation;
- branch, commit, push, pull-request, and publication operations.

The policy contains explicit roles for implementation, analysis, fixture,
remediation, publication, cross-repository graph, runtime evidence, contract
analysis, and scale testing. Missing identity, role, operation, policy, or
active authorization denies access. Permission inheritance is prohibited.

The repository-access suite passed 18 tests, including every Rufa-Clean target
role and inactive/invalid-policy failure paths.

### Database-client boundary

`src/db/client.ts` now initializes PostgreSQL lazily. Importing pure modules
does not load dotenv, require `DATABASE_URL`, instantiate a pool, or attempt a
connection. Invoking database functionality without configuration produces:

`DATABASE_URL is required when database functionality is invoked`

Composition roots load dotenv explicitly. Three regression tests cover clean
construction, one-time initialization, and cleanup after configuration
failure.

### Governance and schemas

Active roadmap and manifest wording now distinguishes the implementation
repository from target and fixture roles. Governance validation rejects stale
identity-wide wording, verifies nine repository roles, preserves all three
historical reports, requires `system_under_test` for the implementation
worktree, and checks executable access gates in each implemented path.

Legacy reporting, execution-state, authorization, repository-policy, audit,
and security-control schema terminology was changed from identity-wide
prohibition to excluded target-role operations.

### Docker runner and compiler

Runner image:

`dcav2-runner@sha256:ed90977c9d9432db87a3f4a96fbbbe420fb8daa78ee01ce9a2a2e673f40cbee3`

Docker Engine: `29.5.3`

Verified controls include:

- digest pinning;
- non-root UID/GID 65532;
- read-only container root;
- read-only source bind and isolated tmpfs workspace;
- all Linux capabilities dropped;
- no-new-privileges;
- PID, CPU, memory, workspace-storage, output, and timeout limits;
- environment allowlisting and secret canaries;
- Docker-socket, controller-database, publisher-credential, host-path, and
  cloud-metadata isolation;
- registry-only installation through a temporary internal allowlist proxy,
  followed by network disconnection;
- disabled npm lifecycle scripts and installed development dependencies;
- project-local TypeScript compiler resolution;
- explicit non-passing missing-compiler and malformed-tsconfig behavior;
- process-tree termination, container disposal, and cleanup verification;
- baseline and post-change gates;
- deterministic one-file patches and changed-file enforcement.

The final exact-source complete suite passed 209/209 tests, including the
real-container missing-compiler and malformed-tsconfig cases.

### PostgreSQL

Only disposable local databases with the `dcav2_p0_20260723_` prefix were
used. No production or pre-existing database was accessed or modified.

Verified behavior:

- fresh installation of migrations 0001 through 0003;
- repeated and concurrent migration execution;
- advisory-lock serialization before migration-table creation;
- migration checksum mismatch rejection;
- per-migration transaction rollback after injected failure;
- representative legacy-to-current additive upgrade with retained legacy data;
- immutable ledger update/delete triggers;
- concurrent append-only human decisions;
- human disposition separated from remediation authorization;
- remediation and publication idempotency;
- audit sequence and previous-event hashes;
- independent event-hash recomputation and tamper detection;
- tenant-bound finding, analysis, attempt, publication, and audit access.

No historical migration was changed.

### Representative repositories

The configured GitHub App credential states were recorded only as `SET` or
`VALID`. Twenty-one eligible-owner repositories were inventoried. Rufa-Clean
was filtered after account discovery and before qualification or
repository-specific metadata.

Four immutable external snapshots were selected:

| Repository | Immutable commit | Result |
| --- | --- | --- |
| `akshay-hudev/swift-apply-form` | `51e9a90f5b586830af2dd173b4cc3af0e5719fef` | Explicitly unsupported: multiple root tsconfigs |
| `akshay-hudev/test-only-usage` | `91d258b9b6c852e923b0021e9afe8222672caba4` | Complete supported coverage; one unsupported-shape finding |
| `akshay-hudev/reexport-chain` | `513c328c629b3492b5d1a2ca86cdb64811a9e8a0` | Complete supported coverage; one unsupported-shape finding |
| `akshay-hudev/barrel-file` | `c2016855f30998d1c33819aea23eed0a086c3007` | Complete supported coverage; two unsupported-shape findings |

No classification was escalated to a dead-code remediation claim. Analyzer or
configuration failure was never interpreted as zero findings.

`rufa-test-lib` was not used. `query-test` was rejected because pnpm monorepos
are outside the current supported runner profile.

Full inventory and operation evidence:

- `codex/reports/phase-0-repository-inventory.json`;
- `codex/reports/phase-0-representative-analysis.json`.

### Capability and security evidence

`codex/capability-matrix.yaml` contains all nine Phase 0 capability IDs and
cross-validates phase IDs, tests, security controls, evidence, reports, and
paths. Eight capabilities are functional and validated. The TypeScript runner
is implemented and validated but truthfully `partially_supported` because
multi-tsconfig, pnpm, Yarn, and monorepo profiles are outside the tested scope.

Phase 0 security controls now use evidence-backed implementation and
validation states. Controls with no executed evidence remain unassessed rather
than being promoted by documentation alone.

## Validation results

| Check | Result |
| --- | --- |
| TypeScript compilation | passed |
| Database-free unit suite with `DATABASE_URL` absent | passed, 196/196 applicable tests |
| Complete local unit/integration suite | passed, 209/209 |
| Focused missing-compiler/malformed-tsconfig suite | passed, 3/3 |
| Runtime repository-access tests | passed |
| GitHub App credential/configuration status | passed (`SET`/`VALID` only) |
| Eligible-owner repository discovery | passed |
| Representative qualification and isolated analysis | passed with one explicit unsupported result |
| Docker hostile-repository and isolation tests | passed |
| Remediation baseline/post-change/determinism tests | passed |
| PostgreSQL migration/rollback/checksum/concurrency tests | passed |
| Audit append-only/hash/tamper tests | passed |
| Tenant-isolation tests | passed |
| Governance validation | passed |
| Phase 0 and Phase 1 manifest schema validation | passed |
| JSON parsing | passed |
| YAML parsing with duplicate-key rejection | passed |
| Capability-matrix schema and cross-reference validation | passed |
| Secret redaction and canary tests | passed |
| Deterministic-output and idempotency tests | passed |
| Referenced-path validation | passed |
| Resource cleanup verification | passed |
| `git diff --check` | passed |

## Limitations

- The supported TypeScript analysis profile remains a single npm package with
  one supported root TypeScript configuration.
- Multiple root tsconfigs are explicit `unsupported`, as demonstrated by
  `swift-apply-form`.
- pnpm, Yarn, npm workspaces, and general monorepos are not claimed.
- The selected relationship fixtures produced unsupported-shape findings; no
  external remediation or publication was justified.
- No external write was performed merely to prove permission.
- No production, hosted database, hosted runner, paid scanner, metered model,
  SaaS observability provider, cloud platform, or paid service was used.

## Cleanup

All acquired external workspaces were removed and verified absent. All
`dcav2-*` test containers were removed. The temporary registry proxy and
internal network were removed. All Phase 0 disposable PostgreSQL databases
were dropped after verification. Synthetic environment canaries were removed.
The local runner image is retained as reproducible evidence; it contains no
credential and has no running resource.

## Phase boundary

Phase 0 prerequisite readiness is complete.

Phase 1 remains unauthorized until the human approves the new request at:

`codex/authorizations/phase-1-typescript-vertical-slice-authorization-request.yaml`
