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
by this original fixture run; the Confidence & Review module was implemented later.

## PolyglotPiranha removal spike

Verified on 2026-07-15 with PolyglotPiranha 0.4.8 against a scratch copy of
this fixture. Because Piranha has no built-in "delete this symbol" seed, the run
used a minimal TypeScript Tree-sitter seed rule that deleted the exported
`formatName` function declaration. Piranha processed the entire `src` directory,
not only the declaration file.

Piranha reported one rewrite, in `src/utils/formatName.ts`. It left both dependent
sites unchanged:

```ts
// src/utils/index.ts
export * from "./formatName";

// src/app.ts
import { formatDate, formatName } from "./utils";
```

The resulting `formatName.ts` was an empty, non-module file. The fixture's
`npm run build` gate failed with:

```text
src/app.ts(1,22): error TS2724: '"./utils"' has no exported member named 'formatName'.
src/utils/index.ts(2,15): error TS2306: File '.../formatName.ts' is not a module.
```

**Step 2 acceptance result: fail.** Piranha does not automatically clean the barrel
re-export or consumer import after deleting the declaration. Custom TypeScript
cleanup and regression coverage are required.

## Barrel-aware removal extension

Verified on 2026-07-15 against a fresh scratch copy of this fixture with pinned
PolyglotPiranha 0.4.8 plus the narrow TypeScript AST cleanup in
`src/remediation/barrel-cleanup.ts`.

The combined run reported one Piranha rewrite, one removed re-export, and one
removed import. The audited generator/rule pair was PolyglotPiranha `0.4.8` with
`barrel-exported-function-v1`. Its complete source diff was:

```diff
-import { formatDate, formatName } from "./utils";
+import { formatDate } from "./utils";

-export function formatName(firstName: string, lastName: string): string {
-  return `${lastName.trim()}, ${firstName.trim()}`;
-}

 export * from "./formatDate";
-export * from "./formatName";
```

The fixture's real `npm run build` (`tsc`) gate exited 0 after these edits.

**Step 5 acceptance result: pass for the narrow fixture case.** The extension
removes the declaration, dangling barrel re-export, and now-unused named import
while preserving `formatDate`. Regression tests also cover a named re-export and
refusal to remove an import that still has a consumer. This does not make Piranha's
default templates broadly trustworthy: the cleanup is deliberately limited to an
empty post-removal TypeScript module, relative `export *`/named re-exports, and
unused named imports.
