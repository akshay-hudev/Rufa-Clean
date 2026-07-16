# DCAv2

DCAv2 is an experimental dead-code analysis and human-gated remediation service.
It discovers repositories available to a GitHub App, indexes supported source
files, combines multiple static-analysis signals, stores reviewable confidence
verdicts, and provides a deliberately narrow path for opening a removal pull
request after explicit human confirmation.

The project is a working prototype, not a production-ready autonomous removal
system. Discovery, indexing, and the individual confidence and remediation modules
exist, but the default sync currently stops after indexing. Confidence computation,
human review, and remediation must be invoked separately.

## Current status

Implemented and exercised:

- GitHub App repository discovery, pagination, metadata collection, and shallow
  authenticated cloning.
- Marker-based repository classification and build-system detection.
- Tree-sitter symbol extraction for TypeScript, JavaScript, TSX/JSX, and Python.
- Knip analysis for TypeScript/JavaScript and Vulture analysis for Python.
- SCIP TypeScript indexing, occurrence parsing, same-repository references, and
  cross-repository reference matching.
- Reference classification for imports, re-exports, calls, construction, reads,
  and production/test context.
- Persistent evidence and deterministic confidence verdicts.
- Human review fields and `confirmed_dead`, `confirmed_alive`, and `excluded`
  review states.
- A narrow, audited TypeScript removal pipeline using PolyglotPiranha, a real
  build/test gate, and GitHub pull-request creation.
- A nightly cron entry point and regression fixtures for important TypeScript
  reference patterns.

Not yet complete:

- Confidence scoring is not called by the normal sync or cron entry point.
- There is no API, UI, or CLI for listing candidates and recording reviews.
- No real candidate has yet been marked `confirmed_dead`; consequently, the live
  verdict-to-PR acceptance path has not been completed.
- Indexing-result replacement and confidence freshness need lifecycle hardening
  before unattended production use.
- The fixture suite validates detection signals more thoroughly than final
  confidence decisions.
- Deployment, CI, health checks, metrics, alerting, and durable job orchestration
  are not included.

## How it works

```text
GitHub App
    |
    v
repository discovery and classification
    |
    v
shallow clone and symbol enumeration
    |
    +--> Knip / Vulture findings
    |
    +--> SCIP same-repo and cross-repo references
    |
    v
confidence evidence and deterministic verdicts
    |
    v
explicit human review: confirmed_dead
    |
    v
Piranha patch -> install/typecheck/build/test gate -> GitHub PR
```

The default `sync` and `cron` commands currently execute only the discovery and
indexing portion of this flow.

## Supported scope

### Detection

- Symbol enumeration: TypeScript, JavaScript, TSX/JSX, and Python.
- Unused-code tools: Knip for JavaScript/TypeScript and Vulture for Python.
- Semantic references: TypeScript/npm projects that SCIP TypeScript can index.
- Package discovery is intentionally shallow: the repository root or selected
  common application directories such as `backend`, `frontend`, `client`, and
  `server`.

Runtime reflection, dependency injection, HTTP/API consumers, GraphQL, protobuf,
dynamic imports, and framework-specific indirection are not resolved. See
[the tested limitations](test-fixtures/KNOWN-LIMITATIONS.md) before interpreting a
missing reference as proof that code is dead.

### Automated remediation

The production verdict-to-PR path accepts only:

- a verdict explicitly marked `confirmed_dead` by a named human reviewer;
- a non-exported, top-level TypeScript or TSX function;
- no recorded import, re-export, call, construction, or read references;
- a cloned source file matching the indexed content hash; and
- an npm package with a lockfile and real `build` and `test` scripts.

The gate runs `npm ci`, a TypeScript `tsc --noEmit` check when applicable,
`npm run build`, and `npm test`. It stores the commands and results, verifies that
the gate did not alter the generated patch, and opens a PR only after the gate
passes. It never auto-merges or attempts automated repair after a failed gate.

A separately tested barrel-aware transformation exists, but it is not enabled in
the verdict-to-PR pipeline. Details are in
[the simple removal pipeline](docs/simple-removal-pipeline.md).

## Prerequisites

- Node.js compatible with the versions in `package-lock.json`.
- PostgreSQL with `gen_random_uuid()` available.
- A GitHub App installation with repository read access and, for remediation,
  contents and pull-request write access.
- [Vulture](https://github.com/jendrikseipp/vulture) on `PATH` for Python analysis.
- Python and pinned PolyglotPiranha dependencies for remediation.

## Setup

Install Node dependencies:

```bash
npm ci
```

Copy the environment template and provide real values:

```bash
cp .env.example .env
```

Required discovery/indexing variables:

```dotenv
GITHUB_APP_ID=
GITHUB_PRIVATE_KEY_PATH=
GITHUB_INSTALLATION_ID=
DATABASE_URL=
```

Optional scheduler and remediation variables are documented in `.env.example`.
Keep the GitHub private key outside version control; `.env` and
`private-key.pem` are ignored by this repository.

For Python dead-code analysis, install Vulture in an isolated environment or with
`pipx`:

```bash
pipx install vulture
```

For remediation, create an isolated Python environment and install the pinned
dependency:

```bash
python3 -m venv .venv-piranha
.venv-piranha/bin/pip install -r remediation-requirements.txt
```

Then set `PIRANHA_PYTHON` to that environment's Python executable.
For Python removal gates, set `REMEDIATION_PYTHON` to the base interpreter used
to create an isolated temporary virtual environment (Python 3.12 is recommended).
Repositories whose tests require a live API can also set
`REMEDIATION_PYTHON_SERVICE_MODULE` (for example, `backend.main:app`) and
`REMEDIATION_PYTHON_HEALTH_URL`. The gate starts the service, waits for health,
records its command and output, and always stops it after testing.
`REMEDIATION_PYTHON_SERVICE_DEBUG` defaults to `false`, preventing a parent
process's unrelated `DEBUG` value from leaking into repositories that parse it as
a boolean.

## Commands

Run database migration, repository discovery, and indexing once:

```bash
npm run sync
```

Run the nightly scheduler (default: `0 2 * * *` in UTC):

```bash
npm run cron
```

Build and test the project:

```bash
npm run build
npm test
```

Run the narrow remediation pipeline for an already human-confirmed verdict:

```bash
npm run remediate -- <confidence-verdict-id>
```

The remediation command exits unsuccessfully when the gate requires human review
or PR creation fails.

Additional diagnostic and fixture scripts live in `scripts/`. They are development
tools rather than stable public commands and may require a populated local database
or dedicated fixture repositories.

## Database model

The schema is defined in `src/db/schema.sql`. Its main stages are represented by:

- `repositories`, `workspaces`, and `discovery_errors`;
- `indexed_files` and `symbols`;
- `external_signals`, `call_edges`, `import_edges`, and
  `cross_repo_references`;
- `confidence_evidence` and `confidence_verdicts`; and
- `removal_actions`.

Migration currently applies the idempotent schema file directly at startup. There
is no versioned migration history yet.

## Confidence model

Confidence scoring is deterministic and rule-based; it does not use an LLM. It
combines:

- same-repository executable SCIP references;
- resolved cross-repository executable references;
- Knip or Vulture usage findings;
- import-only ambiguity; and
- export visibility.

The resulting automated verdict is only a review aid. A `likely_dead` verdict is
never permission to modify a repository. Remediation requires the separate,
explicit `confirmed_dead` review state with reviewer identity and timestamp.

## Verification

At the time of this README update:

- `npm run build` passes.
- `npm test` passes 103 tests across 10 test files.
- Regression fixtures cover direct cross-repository use, aliased imports,
  re-export chains, barrel files, test-only use, and multi-hop re-exports.
- A failure-path integration test proves that a build failure stops remediation,
  stores the gate result, and does not push a branch or create a PR.

Fixture results are evidence for their exact tested shapes, not a guarantee for all
repositories or languages.

## Known engineering risks

Before unattended production use, the following should be addressed:

1. Replace symbols and their dependent evidence/verdict records safely when an
   indexed file changes.
2. Remove stale database rows when source files disappear.
3. Replace Knip/Vulture findings per indexing run instead of accumulating history.
4. Update `scip_status` during normal SCIP execution rather than relying on a
   separate backfill.
5. Tie evidence and verdict freshness to repository commits and indexing runs.
6. Make an inventory-wide indexing/reference refresh atomic or explicitly
   snapshot-based.
7. Wire confidence computation and a human review queue into normal operations.
8. Complete a real, explicitly human-approved removal PR acceptance run.

## Design and evidence notes

- [Human-gated dead-code removal](docs/human-gated-removal.md)
- [Simple removal pipeline](docs/simple-removal-pipeline.md)
- [PolyglotPiranha manual spike](docs/piranha-spike.md)
- [Removal action schema](docs/removal-action-schema.md)
- [Detection regression fixtures](test-fixtures/README.md)
- [Proven behavior and known limitations](test-fixtures/KNOWN-LIMITATIONS.md)
