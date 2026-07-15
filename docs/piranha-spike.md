# PolyglotPiranha manual spike

Date: 2026-07-15

## Result

**Acceptance bar not met. Do not build removal or pull-request integration around
the out-of-box behavior.**

[PolyglotPiranha 0.4.8](https://github.com/uber/piranha/releases/tag/v0.4.8)
was installed in an isolated Python 3.12 virtual environment and run manually.
The package supports Python, TypeScript, and TSX, but it does not provide a default
seed rule that means "delete this dead symbol." Calling it without a custom rule
graph produces no output and reports that rules must be supplied. The 0.4.8 source
also ships no TypeScript, TSX, or Python cleanup-rule set comparable to its Java,
Kotlin, Go, Ruby, and Swift cleanup rules.

## Human-confirmation precondition

The configured `deadcode_platform` database contained no rows with
`review_status = 'confirmed_dead'` when this spike was run. Its only verdict rows
were unreviewed, and the other local project database did not contain the
Confidence Engine tables. No automated verdict was promoted to make the spike
pass.

Consequently, the repository probe below is diagnostic only. `CardFooter` was
chosen as a provisional real-repository candidate because Knip reports it as an
unused export and repository-wide search finds no consumer. It has **not** been
recorded as human-confirmed, so a rerun against a human-confirmed target is still
required before this step can be called complete.

## Real-repository probe

- Repository: `akshay-hudev/swift-apply-form`
- Commit: `51e9a90f5b586830af2dd173b4cc3af0e5719fef`
- Symbol: `CardFooter`
- File: `src/components/ui/card.tsx`
- Tool mode: `tsx`, using a minimal custom Tree-sitter seed rule that deletes the
  matching lexical declaration

Piranha reported one rewrite. The generated diff removed the `CardFooter`
declaration but left both of these references behind:

```tsx
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

This is not a correct or minimal symbol removal. It directly demonstrates that
Piranha does not infer related identifier or named-export cleanup from the seed
deletion.

## Gate evidence

- `git diff --check`: passed.
- Repository `npm run build` (`vite build`): passed, showing that this build gate
  alone does not type-check the dangling identifier.
- `tsc --noEmit -p tsconfig.app.json`: failed on the transformed checkout with
  `TS2304: Cannot find name 'CardFooter'` at the assignment and export.
- The same `tsc` command passed on a pristine checkout at the same commit.
- Repository lint was already failing on unrelated baseline rules, so it is not a
  clean discriminator for this spike.

The spike therefore finds two prerequisites for future work: language-specific
declaration/reference/export rules must be authored and tested, and the gate for a
TypeScript repository must include an actual type-check rather than assuming its
bundler performs one.

## Step 2: barrel-file fixture

PolyglotPiranha 0.4.8 was subsequently run against `formatName` in the
`barrel-file` fixture. The minimal seed rule deleted the exported declaration while
Piranha scanned the fixture's entire `src` tree. It made exactly one rewrite and
left both `export * from "./formatName"` in the barrel and the unused `formatName`
consumer import unchanged.

The fixture's `npm run build` (`tsc`) gate then failed because the barrel pointed
to an empty non-module file and `formatName` was no longer exported. This directly
confirms that Step 4 needs custom rule-template work for barrel re-exports and
consumer imports; Piranha does not already handle the case. Full evidence is in
the [barrel-file result](../test-fixtures/intra-repo/barrel-file/RESULT.md).

## Step 5: narrow barrel-aware extension

The follow-up extension retains Piranha as the declaration-deletion seed and adds
a conservative TypeScript compiler-API pass. It removes relative `export *` or
named re-exports that resolve to the emptied target module, follows chained barrel
modules, and removes only an unused named consumer import. It rejects a non-empty
target module, namespace re-export, missing barrel edge, or consumer that still
uses the imported symbol.

An end-to-end run on a fresh `barrel-file` copy produced exactly three source-file
changes: the `formatName` declaration, `export * from "./formatName"`, and the
unused `formatName` import specifier were removed. `formatDate` and its import and
export remained. The run reported PolyglotPiranha `0.4.8` and the distinct audited
rule-set identifier `barrel-exported-function-v1`. The fixture's actual
`npm run build` (`tsc`) exited 0. Focused
regressions cover `export *`, a named re-export, preservation of peer exports and
imports, and rejection of a still-used consumer.

This passes Step 5 only for the deliberately narrow supported shape. It does not
change the Step 1 conclusion about out-of-box Piranha behavior, and it is not a
reason to trust its default templates broadly.
