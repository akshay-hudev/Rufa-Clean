# Aliased cross-repository import result

Verified on 2026-07-14 with:

```bash
npx ts-node scripts/run-fixture-check.ts rufa-test-lib,rufa-test-consumer
```

The library and consumer were updated and published as commits `37c7a83` and
`4f1d5af`, respectively. The consumer compiled and ran with the aliased binding,
printing `some ...` from `truncateText("some string", 8)`.

## Expectation comparison

| Expected evidence | Actual | Result |
| --- | --- | --- |
| Target retains the library name `truncateText` | All resolved targets are `truncateText`; none are `trunc` | Pass |
| One resolved production import | 1 | Pass |
| One resolved production call | 1 | Pass |
| Production executable-reference count | 1 | Pass |
| Package coordinate | `npm rufa-test-lib 1.0.0` | Pass |

## Finding and correction

SCIP emits two same-line import occurrences for an aliased import: one covering the
exported name and one covering the local alias. The first run therefore stored three
resolved rows for `truncateText` despite there being one import declaration and one
call.

The resolver now deduplicates only `import` and `reexport` occurrences that share the
same file, source line, target symbol, kind, and context. Call/read/construct
occurrences remain uncollapsed. After the correction, `truncateText` has exactly two
`cross_repo_resolved` rows and one executable call.

The original fixture assertions also remain intact: `formatCurrency = 2`,
`slugify = 2`, `parseDateRange = 0`, and `debounce = 0`.
