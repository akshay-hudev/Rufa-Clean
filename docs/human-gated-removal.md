# Human-gated dead-code removal

## What exists today

The Confidence Engine persists its output in the `confidence_verdicts` table. For
each symbol, the table records the automated `verdict`, numeric
`confidence_score`, supporting `evidence_summary`, and `review_status`. Reviewer
identity and timestamp fields provide an audit trail when a person changes that
status.

An automated verdict such as `likely_dead` is evidence for review, not permission
to modify a repository. The existing review model distinguishes a human decision
of `confirmed_dead` from automated scoring.

## Target removal workflow

The remediation workflow should select only symbols whose `review_status` has
been set to `confirmed_dead` by a human reviewer. It must never start from
`likely_dead` alone, regardless of the confidence score.

For each human-confirmed symbol, the workflow should:

1. Generate an actual code-removal diff with Piranha.
2. Apply the candidate diff in an isolated working branch or checkout.
3. Run the repository's required build and test gate.
4. Open a real pull request only when that gate passes.

A failed build or test gate stops at `human_review_required`, stores a clear reason
and the command evidence, and must not produce a pull request. It falls directly
back to a person; this pipeline has no LLM or automated-repair step. No pull request
created by this workflow should ever be auto-merged.
Human review and an explicit human merge decision remain the final step, following
the same human-in-the-loop principle as the rest of the platform.

The persistence model is documented in
[Removal action schema](removal-action-schema.md). The narrow, non-re-exported
single-file implementation is described in
[Simple removal pipeline](simple-removal-pipeline.md).

## Known fixture-suite gap: barrel re-exports

Removing a declaration that is re-exported through a barrel file is not complete
unless the barrel is updated too. The generated diff must remove or adjust the
corresponding `export *` or named re-export entry, rather than only deleting the
original declaration.

The first [manual PolyglotPiranha spike](piranha-spike.md) confirmed the analogous
failure for a same-file named export: deleting the declaration left its
`displayName` assignment and export entry behind. A follow-up run against the
barrel-file fixture deleted `formatName` but left its `export *` and consumer import
unchanged, causing the TypeScript build to fail. The narrow Step 5 AST extension
now produces a complete diff for that fixture and passes its build, but the result
does not justify broad automated remediation outside its explicit scope.
