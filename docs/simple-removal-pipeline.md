# Simple human-gated removal pipeline

Status: TypeScript/TSX and narrow top-level Python removal are implemented and
locally verified. Live PR acceptance remains gated on a candidate repository whose
baseline build/test gate passes.

## Supported scope

The production integration intentionally accepts only:

- a `confidence_verdicts` row with `review_status = 'confirmed_dead'`, a non-empty
  human reviewer, and a review timestamp;
- a top-level TypeScript, TSX, or Python function declaration;
- a non-exported symbol with no recorded imports, re-exports, calls, constructions,
  or reads;
- a cloned source file whose SHA-256 still matches the indexed content; and
- either an npm workspace with a lockfile and real `build` and `test` scripts,
  or a Python repository with `requirements.txt` and real pytest suites.

Exported symbols, class members, JavaScript, declaration files, barrel
involvement, multiple rewrites, and multi-file diffs are rejected before a PR can
be opened.

The separately verified barrel-aware extension in
`src/remediation/barrel-removal.ts` handles the fixture's narrow multi-file
transformation, but it is not yet enabled in this verdict-to-PR path. Keeping that
boundary explicit prevents the Step 5 fixture result from silently broadening the
production eligibility rules.

## Execution order

1. Load and validate the reviewed verdict and symbol.
2. Clone the repository's current default branch.
3. Create an auditable `removal_actions` attempt using the cloned HEAD as its base
   commit and verify the cloned file against the indexed content hash.
4. Run pinned PolyglotPiranha 0.4.8 with the
   `simple-top-level-function-v1` rule.
5. Require exactly one rewrite and exactly one changed file, then persist the full
   patch and its SHA-256.
6. For TypeScript/TSX, run `npm ci`, a local `tsc --noEmit` when TypeScript is
   present, `npm run build`, and `npm test`. For Python, create a temporary isolated
   virtual environment, install `requirements.txt`, compile the target with
   `py_compile`, and run `pytest training/tests tests -v --tb=short`. When configured,
   the Python gate also starts a repository API module, waits for its health
   endpoint, isolates its `DEBUG` setting (defaulting it to `false`), records the
   managed service command, and always stops it after tests.
   Every command records its arguments, exit code, bounded stdout/stderr,
   timestamps, and duration in `gate_result`.
7. Re-check that the gate changed neither the file set nor patch hash.
8. Only after a passed gate, commit and push a dedicated branch and open a GitHub
   pull request. The PR body includes the verdict, action, reviewer, base commit,
   patch hash, and commands actually executed.

The implementation exposes no merge operation. Every PR explicitly requires human
review and must never be auto-merged.

## Running it

Install the pinned Python dependency in an isolated environment:

```bash
python3 -m venv .venv-piranha
.venv-piranha/bin/pip install -r remediation-requirements.txt
```

Set `PIRANHA_PYTHON` to that environment's Python and run:

```bash
npm run remediate -- <confidence-verdict-id>
```

The command exits unsuccessfully unless it opens a PR. A failed gate stores the
patch, complete gate evidence, and a bounded human-readable reason, then finishes
as `human_review_required`. It attempts no automated/LLM repair and never pushes a
branch or opens a PR.

## Verification completed

- TypeScript build passes.
- Vitest: 117 tests pass, including gate tests whose build and test commands create
  independent marker files, proving the runner executes rather than simulates them.
- The pinned Piranha runner made exactly one rewrite against a temporary copy of
  Fraud-Guard's real `training/train_real_world.py`, removing only the top-level
  `_load_synthetic_fallback` function.
- Fraud-Guard's Python 3.12 baseline gate installed `requirements.txt`, started
  `backend.main:app`, received HTTP 200 from `/health`, and passed `py_compile`.
  The exact `pytest training/tests tests -v --tb=short` command then collected 64
  tests but failed on the repository's checked-in training-data/model
  preconditions (for example, generated row-count and missing-model assertions).
  The unmodified baseline is therefore not green. Its verdict remains
  `unreviewed`, no removal action was created, and no branch or pull request was
  opened.
- A deliberately bad removal with an indirect barrel dependency makes the real
  build command fail. The pipeline returns `human_review_required` with the build
  diagnostic and proves that neither branch push nor PR creation was called.
- The pinned Piranha runner was exercised directly and made exactly one rewrite to
  a top-level TypeScript function while preserving its neighboring function.
- The `removal_actions` migration was applied successfully to the local database.
- The live database currently has zero `confirmed_dead` verdicts and zero removal
  actions. No review state was fabricated to force the acceptance run.

## Remaining acceptance step

Choose a real eligible candidate whose unmodified repository passes its configured
gate. Only after that baseline succeeds may a human reviewer mark the verdict
`confirmed_dead` and allow the pipeline to generate a patch and potentially open a
non-auto-merged pull request.
