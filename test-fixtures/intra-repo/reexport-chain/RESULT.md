# Re-export chain result

Verified on 2026-07-14 with:

```bash
npx ts-node scripts/run-fixture-check.ts reexport-chain
```

The GitHub discovery sync found 19 repositories and completed with no errors. The
fixture indexed three TypeScript files, extracted the implementation and re-export
symbols, and matched four of five SCIP definitions to stored symbols.

## Expectation comparison

| Expected evidence | Actual | Result |
| --- | --- | --- |
| No Knip `unused_export` for `realWork` | Knip produced zero findings | Pass |
| Re-export reaches `src/impl.ts::realWork` | SCIP inserted `same_repo` references from `src/index.ts` to `src/impl.ts` | Pass |
| Consumer import/call reaches the implementation | SCIP inserted top-level `same_repo` references targeting `src/impl.ts::realWork` | Pass |
| Re-export is not treated as dead | No dead/unused finding was stored for `src/index.ts::realWork` | Pass |

The fixture matches the prewritten expectation. The re-export chain is proven to
work for this direct intra-repository pattern. Confidence verdicts were not evaluated
because the Confidence & Review module has not been implemented.
