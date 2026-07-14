# Barrel file result

Verified on 2026-07-14 with:

```bash
npx ts-node scripts/run-fixture-check.ts barrel-file
```

Discovery found 20 repositories and completed with no errors. The fixture indexed
four TypeScript files and stored eight same-repository SCIP references.

## Expectation comparison

| Expected evidence | Actual | Result |
| --- | --- | --- |
| `formatDate` is used | One executable SCIP `call` targets `formatDate` | Pass |
| `formatName` is dead | Zero executable SCIP references target `formatName` | Pass |
| Barrel re-export does not make `formatName` executable | Its only non-self edges are `import` and `reexport` | Pass |
| Knip reports `formatName` as an `unused_export` | Knip produced zero findings | **Fail** |

## Finding and correction

SCIP TypeScript does not populate Import/Read symbol-role bits, and the platform
previously stored every occurrence as an undifferentiated reference. That made an
unused import indistinguishable from a call.

The adapter now classifies occurrences from their TypeScript syntax as `import`,
`reexport`, `call`, `construct`, `read`, or `unknown`, preserving all edges while
allowing executable evidence to exclude imports, re-exports, and self references.
The corrected evidence is:

| Symbol | Executable reference count |
| --- | ---: |
| `formatDate` | 1 |
| `formatName` | 0 |

The behavioral ground truth passes with combined SCIP evidence. The Knip-only
assertion remains a documented limitation: Knip treats an imported binding as usage
even when application code never executes it. Confidence verdicts were not evaluated
because the Confidence & Review module has not been implemented.
