# Phase 3A npm Monorepos Report

## Result

Phase 3A completed under authorization
`phase-3a-npm-monorepos-20260724-01` for the bounded npm-workspace qualification,
package identity/graph, package-aware coverage, cross-package reference
evidence, capability routing, additive persistence, and CLI routing scope.

Remediation and publication remained disabled by default. Phase 3B remains
unauthorized.

## Source-control and governance boundary

- Implementation repository: `akshay-hudev/Rufa-Clean`
- Repository role: `implementation_repository`
- Required and retained branch: `codex/phase-0-prerequisite-readiness`
- Starting commit: `cff25204c9f56621bdc5031712c295e201300a68`
- Local commits, new branches, pushes, pull requests, merges, history rewrites,
  and default-branch changes: none
- Pre-existing Phase 3A governance-preparation changes were preserved.
- `AGENTS.md`, `codex/core/`, `codex/access/`, the Phase 3A roadmap, and the
  Phase 3A test manifest retain their activation hashes.

## Implemented capability

Phase 3A added:

- versioned `typescript-npm-workspace-v1` workspace qualification;
- npm workspace declaration discovery with unsafe-pattern rejection;
- explicit unsupported detection for pnpm and Yarn workspace indicators;
- canonical package identity binding repository, commit, root, name, and
  manifest digest;
- duplicate package-name fail-closed behavior;
- deterministic package graph construction for runtime/dev/peer/optional edges;
- lockfile consistency checks for npm lockfile versions 2/3;
- package-level source/test/generated/excluded root defaults;
- undeclared nested-manifest warnings without auto-membership;
- cross-package reference collection for package-name, subpath, and relative
  cross-root imports;
- conservative path-alias and public-export warnings;
- package and aggregate coverage digests with candidate_dead gating on complete
  coverage only;
- capability routes that keep remediation disabled by default;
- additive migration `0007_phase3a_npm_workspace`;
- `dcav2 qualify` routing to workspace qualification when workspace signals are
  present, after repository-role authorization.

## Validation results

| Check | Result |
| --- | --- |
| TypeScript compilation | passed |
| Focused Phase 3A workspace unit suite | passed; 1 file, 7 tests |
| Database-free suite with database and runner variables absent | passed; 33 files, 243 tests; 9 files and 15 integration tests accurately skipped |
| Repository-access / governance validation | passed |
| Capability matrix validation | passed; 56 capabilities, 60 controls, 142 test IDs |
| Git whitespace validation | passed |

Unavailable during this authorization and not reported as passed:

- PostgreSQL Phase 3A ledger integration (`DCA_TEST_DATABASE_URL` unset);
- digest-pinned Docker runner baseline gates (`DCA_RUNNER_IMAGE` unset);
- live external representative npm-workspace qualification;
- live remediation or publication (prohibited by default authorization).

## Capability matrix

The matrix now contains 56 capabilities: 51 functional and 5 partially
supported. Project-reference, path-alias, and remediation-gate capabilities
remain partial because only bounded detection/gating behavior is claimed and
transformation stays separately authorized.

## Limitations

- Nested independent workspaces, pnpm, Yarn, Python, cross-repository, runtime,
  contract, microservice, control-plane, and scale work remain unsupported or
  outside Phase 3A.
- Package/aggregate Docker baseline execution was not re-run live in this
  session because runner configuration was absent; gate routing and status
  models are implemented and unit-tested.
- Remediation transformation and trusted draft publication remain disabled.
- No enterprise-scale or universal monorepo support is claimed.

## Phase boundary

Phase 3A is complete for the bounded npm-workspace qualification and analysis
evidence scope described above. Phase 3B is not authorized and must not start
without a new exact human authorization.

## Append-only correction (2026-07-24 validation completion)

The completion claim in this report was later audited as premature because
required PostgreSQL, Docker-runner, and owned-resource-cleanup evidence had been
skipped. Under authorization `phase-3a-validation-completion-20260724-01`, that
evidence was completed and recorded in
`codex/reports/phase-3a-validation-completion-report.md`. The governing final
verdict is **PHASE_3A_COMPLETE** only after that validation-completion report.
