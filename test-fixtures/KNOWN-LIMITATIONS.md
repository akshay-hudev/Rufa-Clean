# Detection regression suite: proven behavior and known limitations

Last verified: 2026-07-14

This document is the tested boundary of the current indexing and SCIP pipeline. It
summarizes observed fixture results rather than intended architecture. Consult the
linked expectation and result before trusting the same pattern in a customer
repository.

## Fixture results

| Fixture | Pattern | Verdict | Proven behavior | Remaining limitation |
| --- | --- | --- | --- | --- |
| [Rufa basic](cross-repo/rufa-basic/EXPECTATION.md) | Direct cross-repository imports and calls | **Pass** | `formatCurrency` and `slugify` each resolve one import and one call; unreferenced `parseDateRange` and `debounce` receive no cross-repository evidence. | This fixture result predates the Confidence Engine and does not validate its verdicts. |
| [Re-export chain](intra-repo/reexport-chain/EXPECTATION.md) | Intra-repository named re-export | **Pass** | A consumer import and call through `src/index.ts` resolve to the implementation of `realWork`. | One of five SCIP definitions did not match a stored symbol; this did not lose the implementation references under test. Module-level references may lack an enclosing referencing symbol. |
| [Barrel file](intra-repo/barrel-file/EXPECTATION.md) | `export *` with one executed and one unexecuted function | **Behavioral pass; Knip limitation** | SCIP syntax classification distinguishes the executed `formatDate` call from import/re-export-only evidence for `formatName`. | Knip emits no `unused_export` for `formatName` because an imported binding counts as usage even when application code never executes it. Do not use Knip alone to decide this pattern. |
| [Test-only usage](intra-repo/test-only-usage/EXPECTATION.md) | Symbol called only by its test | **Signal pass; verdict deferred** | The call to `computeThing` resolves with test context, with zero production executable references and one test executable reference. | The Confidence & Review module does not yet turn `test_only` evidence into a review verdict. Knip treats the test entrypoint as usage. |
| [Aliased import](cross-repo/aliased-import/EXPECTATION.md) | Cross-repository renamed binding | **Pass** | `truncateText as trunc` resolves to the provider's `truncateText` identity with one import and one production call. | SCIP emits duplicate same-line occurrences for an aliased import. The resolver deduplicates import/re-export evidence by source line and target; this is tested for this syntax but not every TypeScript import form. |
| [Multi-hop re-export](cross-repo/multi-hop-reexport/EXPECTATION.md) | Consumer → middleware re-export → library | **Pass** | Middleware re-export, consumer import, and consumer production call all resolve to the canonical library `formatCurrency`; no edge stops at the middleware export. | Top-level consumer occurrences have `referencing_symbol_id = NULL`, so the persisted edge cannot independently display their source repository or file. Raw SCIP and fixture source establish provenance, but the edge schema does not preserve it. |

Detailed observed rows and counts are recorded in each fixture's `RESULT.md`.

## Cross-cutting limitations

### Confidence output is not covered by these fixtures

The fixture suite currently verifies signals, not final dead-code decisions. The
Confidence Engine now persists `verdict`, `confidence_score`, `evidence_summary`,
and `review_status` in `confidence_verdicts`, but these fixture results do not prove
how their evidence is scored or presented for review.

The suite now validates the narrow barrel-file removal diff. Deleting a symbol
re-exported through a barrel requires updating the barrel's `export *` or named
re-export list as well as deleting the declaration. A
[manual PolyglotPiranha spike](../docs/piranha-spike.md) showed that a custom TSX
declaration-deletion seed leaves a same-file named export behind. The follow-up
barrel-file run also left `export * from "./formatName"` and the consumer import
unchanged, producing a failing TypeScript build. The narrow AST extension now
cleans the fixture's re-export and unused import and passes its real `tsc` build,
but namespace exports, non-relative modules, non-empty target modules, and used
consumer imports remain out of scope. Do not trust Piranha's templates for broad
automated remediation. See
[Human-gated dead-code removal](../docs/human-gated-removal.md).

### Reference provenance depends on an enclosing symbol

`cross_repo_references` stores `referencing_symbol_id`, not an occurrence file and
range. Imports and calls at module top level have no enclosing symbol in the current
symbol extractor, so their referencing repository/file cannot be reconstructed from
the stored edge. Resolution targets and package coordinates remain correct, but UI
or audit output requiring source provenance must fall back to raw SCIP data until the
schema preserves occurrence location.

### Knip reachability is not execution evidence

Knip is useful for unused-file/export signals, but an import or test entrypoint can
make a symbol appear used without production execution. Barrel-file and test-only
decisions must combine Knip with classified SCIP reference kind and context.

### Tested language and package boundary

These fixtures prove TypeScript/npm behavior only. They do not establish equivalent
behavior for Python packages, monorepo workspace protocols, conditional exports,
CommonJS `require`, dynamic imports, runtime dependency injection, reflection, or
network/API boundaries. HTTP/REST, GraphQL, and protobuf contract resolution remain
outside the SCIP phase.

## Regression rule

Re-run the relevant fixture whenever indexing, SCIP parsing/matching, reference
classification, or confidence logic changes. Preserve prewritten expectations. If a
fixture later fails, record the new observed result and treat the affected pattern as
untrusted until fixed; do not rewrite the expectation to match the regression.
