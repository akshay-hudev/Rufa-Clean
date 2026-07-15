# Simple human-gated removal pipeline

Status: implemented and locally verified; live PR acceptance is waiting for a real
human-confirmed candidate.

## Supported scope

The first integration intentionally accepts only:

- a `confidence_verdicts` row with `review_status = 'confirmed_dead'`, a non-empty
  human reviewer, and a review timestamp;
- a top-level TypeScript or TSX function declaration;
- a non-exported symbol with no recorded imports, re-exports, calls, constructions,
  or reads;
- a cloned source file whose SHA-256 still matches the indexed content; and
- an npm workspace with a lockfile and real `build` and `test` scripts.

Exported symbols, class members, JavaScript, Python, declaration files, barrel
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
6. Run `npm ci`, a local TypeScript `tsc --noEmit` when TypeScript is present,
   `npm run build`, and `npm test`. Every command records its arguments, exit code,
   bounded stdout/stderr, timestamps, and duration in `gate_result`.
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
- Vitest: 103 tests pass, including a gate test whose build and test scripts create
  independent marker files, proving the runner executes rather than simulates them.
- A deliberately bad removal with an indirect barrel dependency makes the real
  build command fail. The pipeline returns `human_review_required` with the build
  diagnostic and proves that neither branch push nor PR creation was called.
- The pinned Piranha runner was exercised directly and made exactly one rewrite to
  a top-level TypeScript function while preserving its neighboring function.
- The `removal_actions` migration was applied successfully to the local database.
- The live database currently has zero `confirmed_dead` verdicts and zero removal
  actions. No review state was fabricated to force the acceptance run.

## Remaining acceptance step

A human reviewer must identify and mark a real eligible symbol `confirmed_dead` in
the database. After that explicit decision, the pipeline can run, open the real PR,
and the PR diff plus stored gate evidence can be manually verified.
