# Test-only usage expectation

Written before scaffolding or running this fixture.

## Structure

- `src/helper.ts` exports `computeThing()`.
- `src/helper.test.ts` imports and calls `computeThing()`.
- No non-test application file imports or calls `computeThing()`.

## Policy decision

`computeThing` is **DEAD for production reachability**, but it is not automatically
safe to delete. Test-only execution is a distinct evidence category:

- Production executable references: **0**.
- Test executable references: **1 or more**.
- Evidence classification: **test_only**.
- Future Confidence & Review behavior: route to human review rather than treating
  the test call as proof that production code is alive or issuing an automatic
  deletion recommendation.

## Expected result

- SCIP must resolve the call in `helper.test.ts` back to
  `src/helper.ts::computeThing`.
- The reference must be identifiable as test context rather than production context.
- Knip may treat test files as entrypoints and therefore may not report
  `computeThing` as an `unused_export`; the production/test distinction must not rely
  on Knip alone.

This policy answers the product question “is production behavior dependent on this
symbol?” while preserving the important fact that tests currently exercise it.
