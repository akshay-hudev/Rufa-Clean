# Barrel file expectation

Written before scaffolding or running this fixture.

## Structure

- `src/utils/formatDate.ts` exports `formatDate()`.
- `src/utils/formatName.ts` exports `formatName()`.
- `src/utils/index.ts` re-exports both modules with `export *`.
- `src/app.ts` imports both functions through the barrel, calls `formatDate`, and
  never calls `formatName`.

## Expected result

- `formatDate` is **USED**. Knip must not report it as an `unused_export`, and
  SCIP should resolve the application call through the barrel to its definition.
- `formatName` is **DEAD**. Knip should report it as an `unused_export` even though
  it is exported and re-exported through the barrel.
- The barrel must not make both functions appear used merely because both are
  re-exported, and it must not break resolution so that both appear dead.

This result is correct because re-exporting a symbol exposes it but does not execute
or otherwise use it. Only `formatDate` is reached by application behavior.
