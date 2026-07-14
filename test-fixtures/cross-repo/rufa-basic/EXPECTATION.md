# Rufa basic cross-repository expectation

Written before running the permanent fixture harness.

## Structure

`rufa-test-lib` is an npm package consumed by the separate
`rufa-test-consumer` repository. The consumer imports and calls only
`formatCurrency` and `slugify`. It does not import or call `parseDateRange` or
`debounce`.

## Expected result

| Library symbol | Expected SCIP evidence |
| --- | --- |
| `formatCurrency` | `cross_repo_resolved`; one import occurrence and one call occurrence |
| `slugify` | `cross_repo_resolved`; one import occurrence and one call occurrence |
| `parseDateRange` | Zero `cross_repo_resolved` references |
| `debounce` | Zero `cross_repo_resolved` references |

The expected package coordinate is `npm rufa-test-lib 1.0.0`. Same-repository
references inside function implementations do not count as consumer usage.

This fixture proves direct package-based resolution only. It does not establish
behavior for aliases, barrel exports, or multi-hop re-exports.
