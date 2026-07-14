# Aliased cross-repository import expectation

Written before modifying or running the existing Rufa fixture repositories.

## Structure

- `rufa-test-lib` exports a new `truncateText()` function.
- `rufa-test-consumer` imports it with a local alias:

  ```ts
  import { truncateText as trunc } from "rufa-test-lib";
  trunc("some string", 8);
  ```

## Expected result

- SCIP resolves both consumer occurrences to
  `rufa-test-lib::truncateText`, not to a synthetic symbol named `trunc`.
- `truncateText` has two `cross_repo_resolved` rows: one production `import` and
  one production `call`.
- Its executable production-reference count is **1**.
- The local alias does not change the referenced package coordinate, which remains
  `npm rufa-test-lib 1.0.0`.

This result is correct because an alias changes only the consumer's local binding;
the imported declaration retains the library symbol's SCIP identity.
