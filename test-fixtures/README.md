# Detection regression fixtures

This directory contains permanent, deliberately small regression fixtures for the
dead-code detection pipeline.

## Layout

- `intra-repo/` contains fixtures whose ground truth is contained in one repository.
- `cross-repo/` contains fixtures that require two or more real repositories.

Every regression fixture must contain an `EXPECTATION.md` committed **before** its
first pipeline run. The expectation must describe:

1. The fixture's source and dependency structure.
2. Which symbols are expected to be used or dead.
3. Which evidence rows should prove that result.
4. Why that result is correct.

Compare the runner's output with the written expectation; do not edit the expectation
to rationalize unexpected output. A failed fixture is useful evidence. Record the gap
as a known limitation and preserve the fixture so later indexing, SCIP, or confidence
changes can be checked against it.

The current proven behavior and the platform's honest detection boundaries are
summarized in [KNOWN-LIMITATIONS.md](KNOWN-LIMITATIONS.md).

Run a fixture by repository slug:

```bash
npx ts-node scripts/run-fixture-check.ts repo-slug
npx ts-node scripts/run-fixture-check.ts provider-slug,consumer-slug
npx ts-node scripts/run-fixture-check.ts library-slug,middleware-slug,consumer-slug
```

Discovery is installation-wide, but indexing and reporting are limited to the listed
repository slugs. Confidence verdicts are not printed yet because the Confidence &
Review module has not been implemented.
