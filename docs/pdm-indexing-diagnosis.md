# PDM external-signals diagnosis

Date: 2026-07-15

## Step 1: evidence and root cause

`parse_status = 'symbols_only'` is the normal successful symbol-enumeration state,
not a partial-indexing marker. Every repository with successfully parsed files uses
it, including PDM (63 files), career-flow (53 files plus one failed file), and
Fraud-Guard (55 files).

PDM was processed by the real repository indexing path. Its first file batch ran
from 17:39:19.533 to 17:39:19.974 on 2026-07-13. Eight Knip dependency rows were
inserted at 17:39:21, and the same eight-result shape appeared in eight analyzer
batches through 2026-07-15. `knipAnalyzer.canAnalyze()` returns true and discovers
both `backend` and `frontend`. There are no PDM discovery error rows and no durable
process logs; the database timestamps are the surviving execution record.

The apparent zero was caused by two code defects:

1. Knip's eight mapped findings referred to `backend/package.json` or
   `frontend/package.json`. Manifests are not in `indexed_files`, and
   `external_signals` had no `repository_id`, so all eight were stored with null
   `file_id`/`symbol_id` and could not be attributed to PDM.
2. The adapter parsed only `files`, `exports`, and `dependencies`. PDM's nine code
   findings are in Knip's `types` array; `devDependencies`, `binaries`, and
   `unlisted` were also discarded.

The comparison repositories did not disprove this failure mode. Fraud-Guard's
1,728 attributed rows are all Vulture findings on indexed Python files.
career-flow has 1,016 Vulture findings and 48 Knip `exports`, which point to
indexed source files. PDM uniquely exercised manifest-only and `types` categories.

## Fix and verification

`external_signals` now carries `repository_id`, including findings whose manifest
is not an indexed source file. The Knip adapter preserves dependencies,
devDependencies, optional peer dependencies, binaries, unlisted dependencies, and
unused exported types. Analyzer snapshots replace prior rows only after a
successful run; Knip execution/parsing failures are logged and thrown. Indexing
warns whenever a repository has symbols but zero repository-attributed signals.

Unused exported types use the distinct finding type `unused_exported_type`.
Knip means their export modifier is unused; it does not mean an internally-used
type declaration can be deleted. Confidence retains these findings in evidence but
does not treat them as dead declarations.

The corrected PDM run produced 35 findings, matching independent Knip JSON:

| Finding type | Count |
| --- | ---: |
| `unused_exported_type` | 9 |
| `unused_dependency` | 8 |
| `unused_dev_dependency` | 11 |
| `unlisted_binary` | 5 |
| `unlisted_dependency` | 2 |

Nine findings matched symbols, two matched indexed source files, and 24 manifest
findings remained file-less but are now correctly linked to PDM. SCIP separately
inserted 1,182 same-repository references.

Evidence collection and verdict computation were refreshed for all 231 PDM
symbols. The result remains 88 `likely_alive`, 143 `undecidable`, and zero
`likely_dead`. This is the correct evidence-backed result: the independent Knip
report has no unused files or unused value exports. The nine type declarations are
used internally and therefore must not be promoted to dead-code deletions merely
because their `export` modifiers are unnecessary.
