# Phase 0 Implementation-Readiness Reconciliation

## Decision

| Field | Result |
| --- | --- |
| Authorization | `phase-0-reconciliation-20260723-02` |
| Authorized work | Completed |
| Roadmap Phase 0 completion criteria | Not satisfied |
| Phase 1 readiness | `BLOCKED` |
| Source commit | `9be9897b384115a1cb7a4ca523772cdd04d00174` |
| Branch | `main` |
| Started | `2026-07-23T06:57:19Z` |
| Completed | `2026-07-23T07:11:09Z` |

The time-boxed reconciliation is complete as authorized. Phase 1 must not
start from the current state because runtime repository-role exclusion is
missing, required isolated-runner evidence is unavailable, the clean unit
baseline has an import-time database dependency, and the prior governance
correction left several role/identity conflations unresolved.

No Phase 1 work was performed.

## Repository state

- Repository root:
  `/Users/apple/Desktop/Akshay@goAI/DCAv2`
- Canonical implementation-repository identity:
  `akshay-hudev/Rufa-Clean`
- Sanitized origin:
  `github.com/akshay-hudev/Rufa-Clean.git`
- Upstream: `origin/main`
- Ahead/behind at completion capture: `0/0`
- Initial worktree: clean
- Initial staged, unstaged, and untracked paths: none
- Final intended changes:
  - `codex/authorizations/current-phase-authorization.yaml`
  - `CODEX_EXECUTION_STATE.md`
  - `codex/reports/phase-0-reconciliation-report-02.md`
- No branch, commit, migration, dependency, database, external resource, or
  application/test change was created.

The original blocked report remains unchanged at
`codex/reports/phase-0-reconciliation-report.md`; its SHA-256 is
`aeb165977083e697d7d794655e0b0503266564f7ea11899688cca842645bfbde`.

## Validations passed

- Required canonical governance/test/schema/template files: `36/36` present.
- Local structured documents: `38/38` JSON/YAML files parsed; YAML duplicate
  keys were rejected.
- Repository-role governance validator:
  - 7 repository roles;
  - 25 Phase 0 test IDs;
  - 44 Phase 1 test IDs;
  - 60 security controls.
- Phase test manifests independently conformed to
  `phase-test-manifest.schema.json`:
  - Phase 0: 7 groups, 25 unique tests;
  - Phase 1: 11 groups, 44 unique tests.
- All manifest document/requirement paths resolved.
- All security-control test references and phase-required control IDs resolved.
- Capability IDs are unique and internally declared within each test
  manifest.
- Authorization and repository-access documents conformed to their v2
  schemas through the governance validator.
- Governance Markdown had balanced fences and no NUL bytes.
- Historical report hash verification passed.
- Governing-file hashes matched the Phase 0 start capture.
- `git diff --check` passed before reporting.
- Project-local TypeScript 5.9.3:
  `tsc --noEmit -p tsconfig.json` passed in 3.84 seconds.
- Installed dependency tree:
  `npm ls --depth=0 --json` passed without network access.
- Safe unit retry with dotenv disabled and a synthetic non-routable
  `DATABASE_URL`: 24 files and 171 tests passed in 20.82 seconds.

## Baseline result

The first secret-free unit baseline deliberately disabled dotenv and supplied
no database configuration:

```text
20 test files passed
4 test files failed during import
144 tests passed
duration: 21.98 seconds
```

The four failed suites were:

- `src/confidence/collect-evidence.test.ts`
- `src/indexing/external-signal-guard.test.ts`
- `src/indexing/symbol-refresh.test.ts`
- `src/remediation/eligibility.test.ts`

All failed before registering tests because `src/db/client.ts` throws
`DATABASE_URL is required` at module import time. These suites exercise pure
logic or injected query clients and do not require a live database.

A controlled retry used a synthetic, non-routable URL only to satisfy the
eager constructor. No query was issued. All 24 selected files and 171 tests
then passed. This confirms the unit behavior but does not erase the clean
baseline failure.

The following were not executed:

- `src/db/milestone.integration.test.ts` — database use prohibited;
- `src/milestone/isolated-analysis.integration.test.ts` — container execution
  prohibited;
- `src/milestone/remediation.integration.test.ts` — container execution
  prohibited;
- `src/milestone/workflow.integration.test.ts` — database and container
  execution prohibited;
- `src/security/hostile-repository.test.ts` — container execution prohibited.

They are `unavailable`, not passed. No existing lint script exists. The
configured build script emits `dist/`, so the non-emitting compiler check was
used instead of modifying application output.

## Implementation inventory

### Platform and surfaces

- TypeScript/Node.js CommonJS project.
- npm with lockfile version 3.
- PostgreSQL through `pg`.
- No HTTP API or server framework was found.
- Executable surfaces:
  - `src/index.ts`: migration, discovery, and legacy indexing sync;
  - `src/cron.ts`: scheduled discovery/indexing;
  - `src/cli.ts`: milestone analysis, review, authorization, remediation,
    publication, and audit commands;
  - package binary `dcav2` -> `dist/cli.js`.

### Analysis and classification

- Legacy inventory path:
  tree-sitter, Knip, SCIP TypeScript, and Vulture adapters.
- `src/indexing/clone.ts` is intentionally fail-closed, so the legacy indexing
  workflow cannot currently acquire a repository.
- Some legacy analyzer/gate modules still define host process execution
  (`npx knip`, npm installation, Vulture, and repository scripts). They are not
  the approved milestone runner path.
- Milestone path:
  `src/milestone/analyze.ts` combines TypeScript compiler configuration,
  tree-sitter declaration shapes, SCIP definitions/references, textual audit,
  explicit coverage, and deterministic classification.
- Verified narrow supported finding shape:
  one non-exported, top-level TypeScript function declaration in one
  single-package npm project with one root `tsconfig.json`, complete parsing,
  exactly one SCIP definition, no references, and exactly one textual
  occurrence.
- Explicitly unsupported or non-remediable in this path include workspaces,
  nested packages, project references, multiple root configs, TSX, declaration
  files, exported functions, arrow functions, nested functions, incomplete
  coverage, ambiguous definitions, and contradictory textual evidence.
- Analyzer failure maps to failed/inconclusive behavior rather than zero
  findings in the milestone path.

### Trust zones and command execution

- Trusted controller responsibilities are combined in `src/cli.ts`.
- Trusted acquisition is implemented in
  `src/security/source-acquisition.ts`; it uses structured Git arguments,
  short-lived read credentials, immutable commit resolution, credential
  redaction, Git-config sanitization, and verified cleanup.
- Untrusted execution is implemented by
  `src/security/docker-runner.ts`:
  digest-pinned image, non-root UID, read-only container, dropped
  capabilities, no-new-privileges, PID/CPU/memory/tmpfs limits, bounded output,
  allowlisted environment, initially restricted registry phase, network seal,
  and verified container removal.
- Repository dependency installation requires
  `npm ci --ignore-scripts --include=dev`.
- Analysis invokes pinned controller-owned SCIP and runner-entry paths.
- Remediation runs baseline and post-change typecheck/build/test commands
  inside the sealed container, applies a pinned Piranha transformation, checks
  one-file scope, and emits a hash-bound patch artifact.
- The publisher is a separate class and does not run target builds/tests. It
  verifies persisted finding, disposition, authorization, gates, patch hash,
  and changed files before creating a dedicated branch and draft PR.
- Publisher/source-acquisition commands use argument arrays rather than shell
  strings.

### Persistence, migrations, and audit

- Migration runner:
  `src/db/migrate.ts`.
- Ordered identities:
  - `0001_legacy_baseline` -> mutable historical file `src/db/schema.sql`;
  - `0002_milestone_ledger`;
  - `0003_publication_attempts`.
- The runner uses checksums, a PostgreSQL advisory lock, and per-migration
  transactions.
- Static inventory found 24 tables: 12 legacy discovery/indexing/remediation
  tables and 12 milestone ledger tables.
- Milestone ledger rows have update/delete rejection triggers.
- Human disposition and remediation authorization are separate append-only
  records.
- Audit events have account-scoped sequences, previous-event hashes, event
  hashes, actors, and payloads.
- `auditChain` returns stored rows but performs no independent chain
  verification.
- Fresh install, representative upgrade, trigger enforcement, concurrency, and
  audit-chain behavior were not executed because database access was
  prohibited.

### Dependencies and tooling

- 10 runtime and 6 development dependencies were installed consistently with
  the lockfile.
- Direct dependency licenses recorded in the lockfile are Apache-2.0,
  BSD-2-Clause, ISC, or MIT.
- No vulnerability or provenance lookup was performed because network access
  was prohibited.
- Project-local tools present:
  TypeScript 5.9.3, Vitest 4.1.10, ts-node 10.9.2, and Knip 6.26.0.
- No project-local `lint`, `typecheck`, or standalone migration npm script is
  defined.

### Contracts and capability records

- Runtime contracts are TypeScript interfaces; no general runtime request
  schema validator was found.
- Governance schemas exist for capability matrices, execution state, phase
  reports, authorization, repository policy, role exclusions, and phase test
  manifests.
- No machine-readable capability-matrix instance exists.
- Every Phase 0-required control in
  `codex/tests/security-control-matrix.yaml` remains `not_assessed`, even where
  source or unit-test evidence exists.

## TypeScript compiler-resolution diagnosis

The prior missing-`tsc` report was human-reported and was not reproduced in
this authorization.

Git history and current source provide strong static evidence for the likely
cause and an existing candidate correction:

- before commit `8222c4a`, isolated npm installation did not require
  development dependencies and the runner environment did not neutralize
  production-mode npm omission;
- TypeScript is a development dependency in the reproduction fixture;
- current code requires `--include=dev`;
- current runner environment sets `NODE_ENV=development`, clears
  `NPM_CONFIG_OMIT`, and sets `NPM_CONFIG_PRODUCTION=false`;
- the current integration fixture uses `typecheck: tsc ...` and asserts that
  the package-local compiler resolves;
- runner unit tests passed and verify those command/environment requirements.

Inference: the most likely prior cause was omission of development
dependencies due to install/environment configuration, not an absent
host-global compiler. This remains an inference until the approved pinned
runner integration test is executed.

## Critical blockers

### B1 — Repository-role exclusion is not enforced by application code

Evidence:

- no source module references the role-exclusion policy, target roles, or
  `akshay-hudev/Rufa-Clean`;
- `src/cli.ts` calls credential acquisition and `acquireGitHubSource` before
  any role-aware access decision;
- `src/security/source-acquisition.ts` validates syntax and commit identity but
  not phase authorization or repository-role exclusion;
- `src/milestone/publisher.ts` and
  `src/milestone/github-publisher.ts` validate finding/patch state but not the
  current phase authorization or publication-target exclusion.

Impact: the executable milestone path can attempt source acquisition, analysis,
remediation, or publication for a permanently excluded target. Governance-only
tests do not enforce the product boundary.

Smallest safe correction: add one trusted, canonical,
operation-specific access-decision module and require it before credential
issuance, acquisition, qualification, analysis, remediation, cross-repository
participation, runtime-evidence use, and publication. Add negative tests for
every Rufa-Clean target role and positive tests for authorized implementation
work.

Expected verification:

```text
node_modules/.bin/vitest run <repository-access-runtime-tests>
node_modules/.bin/tsc --noEmit -p tsconfig.json
```

### B2 — Required isolated-runner and compiler evidence is unavailable

Evidence:

- the authorization sets `run_containerized_tests: false`;
- the Phase 0 manifest marks runner failure semantics, isolation, secret
  canaries, prompt-injection resistance, and structured-command authority as
  required;
- the actual compiler-resolution, remediation, workflow, and hostile-runner
  integration tests were not run.

Impact: Phase 1 cannot rely on the candidate missing-`tsc` correction or claim
runner security controls are enforced.

Smallest safe correction: issue a bounded authorization for the existing
digest-pinned runner image and synthetic fixtures, then run the isolated
analysis/remediation and hostile-runner suites with no Rufa-Clean target use.

Expected verification:

```text
DCA_RUNNER_IMAGE=<digest-pinned-image> node_modules/.bin/vitest run \
  src/milestone/isolated-analysis.integration.test.ts \
  src/milestone/remediation.integration.test.ts \
  src/security/hostile-repository.test.ts
```

### B3 — Clean unit baseline requires unrelated database configuration

Evidence: four pure unit suites fail at import through
`src/db/client.ts:7` when `DATABASE_URL` is absent. All pass when a synthetic
URL satisfies the eager constructor.

Impact: a secret-free, database-free Phase 1 unit baseline cannot pass without
irrelevant configuration.

Smallest safe correction: make database client construction lazy or inject the
pool at the DB boundary so pure modules/tests do not require `DATABASE_URL`.

Expected verification:

```text
env -i PATH=<safe-path> CI=true DOTENV_CONFIG_PATH=/dev/null \
  node_modules/.bin/vitest run \
  --exclude '**/*.integration.test.ts' \
  --exclude 'src/security/hostile-repository.test.ts'
```

### B4 — Governance correction is incomplete

Evidence:

- `codex/roadmap/phase-0-reconciliation.md` still says the “absolute
  prohibited-repository rule” must remain;
- Phase 0 and Phase 1 manifest reference descriptions still say prohibited
  repositories must never receive content access;
- the Phase 0 manifest models the local implementation worktree as a
  `fixture_type: local_repository`, although Rufa-Clean is permanently denied
  the test-fixture role;
- `validate-repository-role-governance.mjs` does not detect these forms.

Impact: automation or an agent can again conflate implementation identity with
target/fixture roles despite the controlling human clarification.

Smallest safe correction: under a new governance authorization, update the
stale wording and model the implementation worktree as the system under test,
not a target fixture; extend the validator to reject identity-wide content
denial and implementation-as-fixture conflation.

Expected verification:

```text
node codex/tests/validate-repository-role-governance.mjs
node /tmp/dcav2-schema-check.mjs
git diff --check
```

### B5 — Phase 1 prerequisite evidence matrices are incomplete

Evidence:

- no capability-matrix document exists for the provided schema;
- all 23 Phase 0-required security controls remain `not_assessed`;
- PostgreSQL migration/audit behavior and runner controls could not be
  executed.

Impact: Phase 1 cannot make evidence-backed functional or security claims from
the current machine-readable state.

Smallest safe correction: after B1–B4, create the capability-matrix instance
and update security-control statuses from retained executable evidence under an
authorization that permits those governance files.

Expected verification: validate the matrix against
`codex/schemas/capability-matrix.schema.json`, validate security-control test
references, and rerun all activated Phase 1 prerequisite tests.

## Non-blocking limitations

- The legacy discovery/indexing path is currently disabled at source
  acquisition and should not be confused with the milestone path.
- `src/db/schema.sql` acts as migration `0001`; its fresh-install and
  representative-upgrade behavior is unverified.
- Audit hash-chain verification is not implemented as a distinct runtime
  check.
- Publisher unit tests use a mocked gateway; live provider behavior is
  unverified and was not authorized.
- Direct dependency licenses are lockfile metadata only; vulnerability,
  transitive-license, and provenance checks were unavailable.
- The Phase 1 roadmap’s example capability IDs differ from the manifest IDs.
  The roadmap permits final IDs to differ, but the missing capability matrix
  leaves no canonical registry.

## External operations and cleanup

- External repository reads: 0
- External writes/publications: 0
- Credentials used: none
- Databases created or modified: none
- Containers created: none
- Dependencies installed or changed: none
- Temporary resources created by tests: cleaned by the passing tests
- Secret-bearing `.env` and private-key files: filenames observed only;
  contents were not opened

## Exact recommended Phase 1 starting action

Do not authorize the feature slice yet.

First authorize a narrow prerequisite repair that:

1. corrects the remaining governance role/fixture conflations;
2. adds runtime operation-specific repository-role enforcement before every
   target credential, acquisition, analysis, remediation, and publication
   path;
3. removes the import-time database requirement from pure unit tests; and
4. permits the existing synthetic pinned-runner and disposable PostgreSQL
   prerequisite suites.

After those checks pass, create a separate Phase 1 authorization whose first
feature commit adds characterization tests for the existing
single-package/private-top-level-function milestone path. Do not use
`akshay-hudev/Rufa-Clean` as an analysis target or fixture.
