# Rufa basic cross-repository result

Verified on 2026-07-14 with:

```bash
npx ts-node scripts/run-fixture-check.ts rufa-test-lib,rufa-test-consumer
```

Discovery completed with 18 repositories and no errors. Both fixture repositories
completed Knip and SCIP indexing. The targeted cross-repository resolver reported:

- `rufa-test-lib`: 0 resolved references to the consumer.
- `rufa-test-consumer`: 4 resolved references to the library.

## Expectation comparison

| Library symbol | Expected `cross_repo_resolved` | Actual | Result |
| --- | ---: | ---: | --- |
| `formatCurrency` | 2 | 2 | Pass |
| `slugify` | 2 | 2 | Pass |
| `parseDateRange` | 0 | 0 | Pass |
| `debounce` | 0 | 0 | Pass |

All four rows matched the prewritten expectation. Confidence verdicts were not
evaluated because the Confidence & Review module does not exist yet.
