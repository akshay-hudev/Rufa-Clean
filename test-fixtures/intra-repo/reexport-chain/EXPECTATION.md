# Re-export chain expectation

Written before scaffolding or running this fixture.

## Structure

- `src/impl.ts` exports `realWork()`.
- `src/index.ts` re-exports `realWork` from `./impl`.
- `src/consumer.ts` imports `realWork` from `./index`, not directly from
  `./impl`, and calls it.

## Expected result

`realWork` is **USED**.

- Knip must not report `realWork` as an `unused_export`.
- SCIP should resolve the consumer reference back to the `realWork` definition in
  `src/impl.ts` with `resolution_confidence = 'same_repo'`.
- The re-export in `src/index.ts` must not be reported as dead and must not cause
  the definition's usage to be lost.

This result is correct because the consumer reaches and executes the implementation
through the package's public re-export chain.
