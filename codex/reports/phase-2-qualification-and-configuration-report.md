# Phase 2 Qualification and Configuration Report

## Result

Phase 2 completed successfully under authorization
`phase-2-qualification-and-configuration-20260723-01`.

The implemented boundary deterministically qualifies an exact repository
identity and immutable revision for the versioned
`typescript-single-package-npm-v1` profile. It detects unsupported repository
shapes without treating them as ready and does not perform analysis,
classification, remediation, or publication.

Phase 3A remains unauthorized.

## Source-control and governance boundary

- Implementation repository: `akshay-hudev/Rufa-Clean`
- Repository role: `implementation_repository`
- Required and retained branch: `codex/phase-0-prerequisite-readiness`
- Starting and current commit:
  `a2f75fbdcbb82c13e3724405cabceab5c6c56efb`
- Local commits, new branches, pushes, pull requests, merges, history rewrites,
  and default-branch changes: none
- Pre-existing Phase 2 governance-preparation changes were preserved.
- All historical Phase 0 and Phase 1 reports and state sections were preserved.
- `AGENTS.md`, `codex/core/`, `codex/access/`, the Phase 2 roadmap, and the
  Phase 2 test manifest retain their activation hashes.

## Implemented capability

Phase 2 added:

- canonical repository identity and immutable-revision request contracts;
- versioned deterministic profile matching;
- TypeScript, TSX, JavaScript, declaration, Python, generated, and test-only
  language detection with support reported separately;
- npm/pnpm/Yarn signal, lockfile-version, conflict, and workspace detection;
- configured source, test, generated, and excluded-root validation with
  repository confinement and symbolic-link rejection;
- digest-only untrusted command observations;
- fixed structured mappings for approved typecheck, build, and test script
  names;
- explicit Node, npm, and project-local TypeScript requirements without
  host-global fallback;
- isolated dependency installation with lifecycle scripts disabled, followed
  by network sealing and baseline gates;
- source-digest checks before and after every baseline gate;
- per-capability enabled, limited, configuration-required, baseline-blocked,
  security-blocked, unsupported, unavailable, and stale routing;
- deterministic request, configuration, gate, result, and freshness digests;
- draft 2020-12 schemas for requests, configurations, and results;
- an additive PostgreSQL qualification ledger, baseline results, capability
  routes, tenant isolation, immutable records, and a hash-linked audit chain;
- the `dcav2 qualify` CLI path, guarded before credentials and acquisition.

The capability matrix now contains 43 capabilities: 41 functional and two
partially supported. Forty-two have passed validation; the pre-existing
trusted draft publisher remains partial because live publication was not
required.

## Repository profiles and representative evidence

Five non-Rufa repositories were evaluated at immutable revisions. Rufa-Clean
was rejected by canonical identity before target metadata expansion or content
access.

| Repository | Revision | Role in evidence | Result |
| --- | --- | --- | --- |
| `akshay-hudev/test-only-usage` | `91d258b9b6c852e923b0021e9afe8222672caba4` | primary compact npm TypeScript representative | `ready`; typecheck/build/test passed |
| `akshay-hudev/swift-apply-form` | `51e9a90f5b586830af2dd173b4cc3af0e5719fef` | larger React/Vite configuration shape | `ready_with_limited_gates`; optional test mapping unavailable |
| `akshay-hudev/rufa-test-consumer` | `e85f11a783f69dfb411d643707c7012088211df6` | broken dependency-install baseline | `baseline_broken`; never converted to readiness |
| `akshay-hudev/query-test` | `151cd64dd1ba59e330b31806fe8570f207fd6d8d` | large pnpm/Nx monorepo | `unsupported`; 103 packages detected |
| `akshay-hudev/rufa-test-lib` | `a1bdd81ad38676b78760309c219d541daec47d77` | optional smoke only | `ready`; not primary evidence |

Exact selections, operations, digests, limitations, the retained initial
missing-runner failure, and cleanup results are recorded in
`codex/reports/phase-2-representative-qualification.json`.

No repository was analyzed for dead code. No findings, dispositions,
remediations, branches, commits, pushes, pull requests, or publications were
created.

## Runner and security evidence

- Runner image:
  `dcav2-runner@sha256:7f347352497067cbd5b833b0c63046c89c358040078ade1b3c3fd29d0358f45f`
- Dependency egress used a temporary Docker-internal network and a proxy that
  allowed only `registry.npmjs.org:443`; the runner network was removed before
  repository-controlled gates.
- The runner remained non-root, read-only, capability-free, protected by
  `no-new-privileges`, resource-bounded, environment-allowlisted, secret-free,
  Docker-socket-free, host-filesystem-confined, and cleanup-verified.
- A setup-install timeout was separated from the deliberately short hostile
  command timeout. This prevents infrastructure load from weakening the
  command timeout test.
- Prompt-injection, hostile command, symbolic-link, source-mutation, secret
  canary, output, disk, process, memory, timeout, and process-tree tests passed.
- `ajv` 8.18.0 was added as a development-only draft 2020-12 schema validator.
  The initially selected 8.17.1 produced one moderate advisory; it was upgraded
  before completion. Final `npm audit` reported zero vulnerabilities.
- No credential value or credential-bearing URL was printed or retained.
- No paid or metered tool, hosted runner, hosted database, AI API, SaaS
  scanner, or production system was used.

## Database evidence

Migration `0006_phase2_qualification` is additive. It introduces immutable,
tenant-scoped requests, results, baseline results, capability routes, and
Phase 2 audit events without modifying historical migrations.

The final configured suite passed fresh-install, concurrent migration,
checksum-change rejection, rollback, representative Phase 1 upgrade,
append-only enforcement, tenant isolation, idempotency, audit sequencing,
previous-event hashes, event hashes, and independent audit-chain verification.

Six explicitly named disposable databases were used across retained diagnostic
and final runs:

- `dcav2_phase2_20260723_final`
- `dcav2_phase2_20260723_upgrade`
- `dcav2_phase2_20260723_final2`
- `dcav2_phase2_20260723_upgrade2`
- `dcav2_phase2_20260723_final3`
- `dcav2_phase2_20260723_upgrade3`

All six were dropped. The verified remaining `dcav2_phase2_%` database count
is zero.

## Validation results

| Check | Result |
| --- | --- |
| TypeScript compilation | passed |
| Database-free suite with database and runner variables absent | passed; 32 files, 236 tests; 8 files and 14 integration tests accurately skipped |
| Focused Phase 2 unit/schema suite | passed; 4 files, 31 tests |
| Repository-access runtime tests | passed |
| Representative GitHub discovery and qualification | passed with explicit ready, limited, broken, and unsupported results |
| Complete configured suite | passed; 40 files, 250 tests |
| Docker isolation and hostile-repository tests | passed |
| PostgreSQL fresh install and representative upgrade | passed |
| Phase 2 persistence, tenant isolation, and audit chain | passed |
| Governance validation | passed |
| Capability matrix and cross-reference validation | passed; 43 capabilities, 60 controls, 101 test IDs |
| Request/configuration/result schema-instance validation | passed |
| JSON and YAML parsing with duplicate-key rejection | passed |
| npm advisory audit | passed; zero vulnerabilities |
| Resource cleanup | passed |
| Git whitespace validation | passed |

Retained non-passing diagnostic results:

- The first representative run failed closed because `DCA_RUNNER_IMAGE` was
  absent; no host fallback occurred.
- One configured database run exposed a checksum-test race; the checksum
  mutation was isolated into its own schema and the focused tests passed.
- Repeat runs against already populated databases produced expected fixed-count
  assertion failures; final evidence used newly named empty databases.
- A parallel hostile-runner setup exceeded its three-second hostile-command
  timeout and left two stopped test containers; setup and command timeouts were
  separated, the focused and complete suites passed, and the containers were
  removed.

None of those failures is reported as passed. Each was corrected and followed
by passing final verification.

## Cleanup and limitations

- All acquired external workspaces were removed and verified absent.
- All Phase 2-created containers, the registry proxy, and its network were
  removed.
- All Phase 2 disposable databases were removed.
- The digest-pinned reusable runner image remains as pre-existing local
  evidence; it is not a running resource.
- npm workspaces, pnpm, Yarn, monorepos, TSX-only profiles, Python, additional
  languages, cross-repository analysis, runtime evidence, remediation, and
  publication remain unsupported or outside Phase 2.
- Qualification success grants no analysis, classification, remediation, or
  publication authority.

## Changed files

Phase 2 implementation changed or added:

- `src/qualification/` for contracts, configuration, qualification, baseline,
  persistence, schema tests, and unit tests;
- `src/cli.ts` for the guarded qualification command;
- `src/security/docker-runner.ts` for separate bounded install and untrusted
  command timeouts;
- `src/db/migrate.ts`, `src/db/migrate.integration.test.ts`,
  `src/db/milestone.integration.test.ts`, and
  `src/db/upgrade.integration.test.ts`;
- `src/db/migrations/0006_phase2_qualification.sql` and
  `src/db/phase2.integration.test.ts`;
- the three `codex/schemas/phase2-qualification-*.schema.json` contracts;
- `scripts/phase2-representative-qualification.ts`;
- `package.json` and `package-lock.json` for Ajv 8.18.0;
- `codex/capability-matrix.yaml`,
  `codex/tests/security-control-matrix.yaml`, and both current governance
  validators;
- the two Phase 2 reports, current authorization, and execution state.

The pre-existing Phase 2 authorization request and test manifest remain
preserved governance-preparation artifacts. No unrelated user work was
discarded or absorbed.

## Phase boundary

Phase 2 is complete. Phase 3A is not authorized and must not start without a
new exact human authorization.
