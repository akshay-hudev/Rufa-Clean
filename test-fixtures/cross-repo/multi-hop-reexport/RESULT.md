# Multi-hop cross-repository re-export result

## Verdict

Pass. The three-repository chain preserves the canonical implementation identity
through the middleware package.

Verified repositories and commits:

- `rufa-test-lib` at `37c7a83`
- `rufa-test-middleware` at `c8281be`
- `rufa-test-consumer` at `e85f11a`

The fixture was run with:

```bash
npx ts-node scripts/run-fixture-check.ts \
  rufa-test-lib,rufa-test-middleware,rufa-test-consumer
```

## Observed evidence

For the library-owned `formatCurrency` definition, the persisted SCIP references
were:

| Origin | Reference kind | Context | Confidence | Target coordinate | Count |
| --- | --- | --- | --- | --- | ---: |
| `rufa-test-middleware` | `reexport` | `production` | `cross_repo_resolved` | `npm rufa-test-lib 1.0.0` | 1 |
| `rufa-test-consumer` top level | `import` | `production` | `cross_repo_resolved` | `npm rufa-test-lib 1.0.0` | 1 |
| `rufa-test-consumer` top level | `call` | `production` | `cross_repo_resolved` | `npm rufa-test-lib 1.0.0` | 1 |

The consumer source imports `formatCurrency` from `rufa-test-middleware`, but its
raw SCIP occurrences use the canonical symbol:

```text
scip-typescript npm rufa-test-lib 1.0.0 dist/`index.d.ts`/formatCurrency().
```

No persisted reference targets the middleware's exported `formatCurrency` symbol.
The middleware and library retain distinct package identities while SCIP follows
the re-export to the library implementation.

## Comparison with the expectation

- Middleware re-export resolves to the library definition: **Pass**.
- Consumer import crosses the middleware boundary: **Pass**.
- Consumer production call contributes one executable reference to the library:
  **Pass**.
- Resolution does not stop at a synthetic middleware definition: **Pass**.

## Reporting note

The consumer import and call occur at module top level, outside any extracted
enclosing symbol. Their `referencing_symbol_id` is therefore `NULL`, so the current
database view cannot derive the referencing repository from that foreign key. The
fixture source and raw consumer SCIP index establish their origin; this is a
provenance/reporting limitation, not a resolution failure.
