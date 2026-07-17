# DCAv2 / Rufa Clean

DCAv2 is an evidence-driven dead-code detection and human-gated remediation
service. The Rufa Clean GitHub App discovers repositories, indexes supported
source code, combines static-analysis evidence, records deterministic confidence
verdicts, generates narrow patches, validates them, and opens reviewable GitHub
pull requests.

The project is a working MVP, not a universal autonomous code remover. It never
auto-merges a pull request. Human review is always the final step.

## Current status

Implemented and exercised:

- GitHub App repository discovery, authenticated cloning, branch pushes, and
  draft or regular pull-request creation.
- Tree-sitter symbol extraction for TypeScript, JavaScript, TSX/JSX, and Python.
- Knip repository analysis for JavaScript/TypeScript and Vulture analysis for
  Python.
- SCIP TypeScript indexing and classification of imports, re-exports, calls,
  construction, reads, and production/test context.
- Persistent confidence evidence and deterministic verdicts: `likely_alive`,
  `undecidable`, `likely_dead`, and `insufficient_signal`.
- Human review states: `confirmed_dead`, `confirmed_alive`, and `excluded`, with
  reviewer identity and timestamp.
- Commit and content-hash freshness checks before any patch is generated.
- PolyglotPiranha removal rules for narrow TypeScript, JavaScript, TSX, and
  Python declaration shapes.
- Strict build/test gating for human-confirmed removals.
- Adaptive, workspace-scoped baseline/post-removal verification for draft batch
  remediation when a repository does not provide every possible check.
- End-to-end audit records connecting a confidence verdict, generated patch,
  patch hash, gate result, and pull-request URL.
- Failure handling that stops without automated repair, branch push, or PR
  creation when a required pre-PR gate fails.

The normal `sync` and cron flows currently perform discovery and indexing.
Confidence computation, review recording, and remediation remain separately
invoked operations.

## Architecture

```text
Rufa Clean GitHub App
    |
    v
repository discovery and workspace classification
    |
    v
symbol extraction
    |
    +--> Knip / Vulture findings
    |
    +--> SCIP and import/reference graph
    |
    v
confidence evidence and deterministic verdict
    |
    +--> strict path: human confirmed_dead
    |        |
    |        v
    |    narrow Piranha patch -> build/test gate -> PR
    |
    +--> adaptive path: direct Knip finding + zero consumers
             |
             v
         source audit -> draft patch -> baseline/post gate -> draft PR

Every PR ends at human review. No path auto-merges.
```

## Supported scope

### Detection

- Symbol enumeration: TypeScript, JavaScript, TSX/JSX, and Python.
- Unused-code tools: Knip for JavaScript/TypeScript and Vulture for Python.
- Semantic references: TypeScript/npm projects that SCIP TypeScript can index.
- Common monorepository layouts, including `backend`, `frontend`, `client`, and
  `server` workspaces.
- File-level Knip `unused_file` evidence is propagated to symbols contained in
  that file.

Runtime reflection, dependency injection, HTTP/API consumers, GraphQL,
protobuf, dynamic imports, framework conventions, and generated code can hide
real usage. A missing reference is therefore corroborating evidence, not proof
by itself. See [the tested limitations](test-fixtures/KNOWN-LIMITATIONS.md).

### Strict confirmed-dead remediation

The strict path requires:

- `review_status = 'confirmed_dead'` with a reviewer and timestamp;
- a supported top-level function whose qualified name equals its name;
- no import, re-export, executable, or import-edge consumers;
- a repository commit and file hash matching the indexed snapshot; and
- exactly one declaration rewrite in exactly one source file.

Supported strict languages are TypeScript, TSX, JavaScript, and Python. The Node
gate requires a lockfile, a real build script, and a real test script. The Python
gate creates an isolated virtual environment, installs `requirements.txt`,
compiles the target file, and runs pytest. Every command, output, duration, and
exit status is stored.

### Adaptive draft batch remediation

The batch path exists for repositories where the PR itself is the human review
surface. It still requires direct analyzer evidence and several independent
safety checks:

- a direct Knip `unused_export` or `unused_exported_type` finding;
- zero resolved import, re-export, executable, and import-edge consumers;
- a matching indexed commit and content hash;
- a fresh repository-wide source audit;
- a fresh baseline Knip run that reproduces every target finding;
- a generated patch limited to the expected workspace files;
- baseline and post-removal checks that both pass;
- a post-removal Knip run showing every targeted finding is gone; and
- an unchanged patch hash after validation.

Currently supported batch shapes are:

- exported JavaScript/TypeScript arrow or function-expression variables;
- unused default-export aliases; and
- TypeScript type/interface exports that are still used internally. For these,
  the declaration is preserved and only the unused `export` modifier is removed.

Multiple candidates can share one patch and draft PR while retaining one
`removal_actions` audit row per source verdict.

### Verification tiers

Adaptive validation records what genuinely ran rather than reporting unavailable
checks as successes:

- **Tier A:** install plus available static/build/type/lint checks and real tests.
- **Tier B:** install plus build, typecheck, or lint; no real test script exists.
- **Tier C:** syntax/static verification only.

Any available check that runs and fails blocks the PR. Missing tests are called
out explicitly in the PR. A Tier B or C result is not equivalent to full
end-to-end application verification.

## Proven end-to-end runs

### Fraud-Guard

A human-confirmed, non-exported Python function was removed through the strict
pipeline. The baseline and post-removal Python gates ran, the real PR was
reviewed, and it was manually merged.

### Rufa-Clean

The pipeline proved narrow TypeScript/default-export removal. A separate
repository-wide Knip cleanup also established why real entrypoint and fixture
configuration must be declared before treating unused-file output as deletable.

### career-flow

[career-flow draft PR #1](https://github.com/akshay-hudev/career-flow/pull/1)
removed five directly reported unused frontend API functions and one unused
default export:

- one file changed and 15 lines deleted;
- baseline Knip: six targeted unused exports;
- post-removal Knip: zero targeted unused exports;
- baseline and post-removal JavaScript syntax/build checks passed; and
- frontend GitHub Actions build and Vercel deployment passed.

This was a Tier B result because the frontend has no test, lint, or typecheck
scripts. The repository's unrelated backend CI currently fails during dependency
setup because spaCy is invoked without being installed; backend tests never run.

### PDM

[PDM draft PR #1](https://github.com/akshay-hudev/PDM/pull/1) internalized nine
unused public TypeScript types/interfaces across two frontend files:

- all declarations and their internal use remain intact;
- only nine unnecessary `export` modifiers changed;
- baseline and post-removal TypeScript checks passed;
- baseline and post-removal Next.js production builds passed; and
- Knip `exports,types` findings went from nine to zero.

This was a Tier B result because PDM has no frontend test script and its `next
lint` command launches interactive ESLint configuration instead of performing a
real lint. PDM currently has no GitHub Actions checks on the remediation branch.

## Prerequisites

- Node.js compatible with `package-lock.json`.
- PostgreSQL with `gen_random_uuid()` available.
- A GitHub App installation with repository read access and, for remediation,
  contents and pull-request write access.
- Vulture on `PATH` for Python analysis.
- Python and the pinned PolyglotPiranha dependency for remediation.

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

Keep the GitHub private key outside version control. `.env` and
`private-key.pem` are ignored by this repository.

Install Vulture in an isolated environment or with `pipx`:

```bash
pipx install vulture
```

Create the Piranha environment:

```bash
python3 -m venv .venv-piranha
.venv-piranha/bin/pip install -r remediation-requirements.txt
```

Set `PIRANHA_PYTHON` to that environment's Python executable. For Python gates,
set `REMEDIATION_PYTHON` to the interpreter used to create the temporary virtual
environment. Python 3.12 is recommended.

Python repositories whose tests need a live API can configure
`REMEDIATION_PYTHON_SERVICE_MODULE` and `REMEDIATION_PYTHON_HEALTH_URL`. The gate
starts the service, waits for health, records the process, and always stops it.

## Commands

Discover and index the GitHub App inventory:

```bash
npm run sync
```

Run the scheduler:

```bash
npm run cron
```

Build and test DCAv2:

```bash
npm run build
npm test
```

Run strict remediation for a human-confirmed verdict:

```bash
npm run remediate -- <confidence-verdict-id>
```

Open a narrow single-candidate draft PR for review:

```bash
npm run remediate -- <confidence-verdict-id> --draft-pr
```

Run adaptive batch remediation for a repository UUID or slug:

```bash
npm run remediate:batch -- <repository-id-or-slug>
```

For example:

```bash
npm run remediate:batch -- career-flow
npm run remediate:batch -- PDM
```

Remediation commands exit unsuccessfully when eligibility, freshness,
generation, or a required gate fails. They do not attempt automated repair.

Additional diagnostic scripts live in `scripts/`. They are development tools,
not stable public commands, and may require a populated local database.

## Database model

The schema is defined in `src/db/schema.sql`:

- `repositories`, `workspaces`, and `discovery_errors`;
- `indexed_files` and `symbols`;
- `external_signals`, `call_edges`, `import_edges`, and
  `cross_repo_references`;
- `confidence_evidence` and `confidence_verdicts`; and
- `removal_actions` for patch, gate, PR, and final-outcome auditing.

The schema is currently applied idempotently at startup. There is no versioned
migration history yet.

## Confidence model

Confidence scoring is deterministic and does not use an LLM. It combines:

- same-repository executable SCIP references;
- resolved cross-repository references;
- direct Knip/Vulture unused findings;
- containing-file `unused_file` findings;
- import-only ambiguity; and
- export visibility.

Export visibility currently caps a dead score at `0.6`; the uncapped and capped
scores are retained in `evidence_summary` for review. Automated verdicts remain
review aids. The strict pipeline requires `confirmed_dead`; the adaptive path can
open only a draft PR from direct Knip evidence, and that draft still requires a
human to decide whether it should ever merge.

## Verification

At the time of this update (2026-07-17):

- `npm run build` passes.
- `npm test` passes 138 tests across 17 test files.
- `git diff --check` passes.
- Regression fixtures cover direct and aliased imports, calls, construction,
  reads, JSX patterns, re-export chains, barrel files, test-only use, and
  multi-hop re-exports.
- Failure-path tests prove that build/test failures fall back to human review
  and never push or open a PR; generation failures are recorded and also stop
  before any push or PR.
- Adaptive-gate tests prove that unavailable tests and interactive lint setup are
  recorded as unavailable rather than falsely reported as passing.

Fixture results apply only to their tested shapes and are not a guarantee for
every repository or framework.

## Known limitations and next work

1. Confidence computation and human review are not yet integrated into the
   normal sync/cron workflow or a review UI.
2. Adaptive batch remediation currently supports one npm workspace with a
   `package-lock.json`; pnpm, Yarn, and multi-workspace patches need dedicated
   gate dispatch.
3. Automated package dependency removal and arbitrary unused-file deletion are
   intentionally unsupported. Framework and path-loaded entrypoints make raw
   Knip output unsafe to apply blindly.
4. Barrel/re-export cleanup is separately tested but not broadly enabled in the
   batch pipeline. Piranha rules must continue to be checked against dangling
   `export *` and named re-export cases before expansion.
5. Methods, class members, nested functions, decorators outside the supported
   Python shape, complex declarations, and generated sources are rejected.
6. A successful Tier B/C gate proves only the checks that actually ran; browser,
   API, and full-system behavior still require repository-provided tests or
   manual review.
7. GitHub Actions and external deployment checks run after PR creation and are
   not yet synchronized back into `removal_actions` automatically.
8. Durable job orchestration, deployment, metrics, alerting, and a remediation
   dashboard are not included.

## Design and evidence notes

- [Human-gated dead-code removal](docs/human-gated-removal.md)
- [Simple removal pipeline](docs/simple-removal-pipeline.md)
- [PolyglotPiranha manual spike](docs/piranha-spike.md)
- [Removal action schema](docs/removal-action-schema.md)
- [PDM indexing diagnosis](docs/pdm-indexing-diagnosis.md)
- [Detection regression fixtures](test-fixtures/README.md)
- [Proven behavior and known limitations](test-fixtures/KNOWN-LIMITATIONS.md)
