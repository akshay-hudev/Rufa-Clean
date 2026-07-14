# Multi-hop cross-repository re-export expectation

Written before scaffolding middleware or modifying the consumer.

## Structure

1. `rufa-test-lib` defines and exports `formatCurrency()`.
2. `rufa-test-middleware` depends on the library and re-exports it:

   ```ts
   export { formatCurrency } from "rufa-test-lib";
   ```

3. `rufa-test-consumer` imports `formatCurrency` from `rufa-test-middleware`, not
   directly from `rufa-test-lib`, and calls it.

The consumer may continue importing unrelated symbols directly from
`rufa-test-lib`; only the `formatCurrency` path is under test here.

## Expected result

- The middleware re-export resolves to `rufa-test-lib::formatCurrency` with
  `resolution_confidence = 'cross_repo_resolved'` and
  `reference_kind = 'reexport'`.
- The consumer's import and executable call ultimately target the library's
  `formatCurrency` definition rather than stopping at an unresolved or synthetic
  middleware symbol.
- The final consumer call is production context and contributes one executable
  cross-repository reference to the library definition.
- Package identities remain distinct: middleware is
  `npm rufa-test-middleware 1.0.0`; the canonical implementation target is
  `npm rufa-test-lib 1.0.0`.

## Failure policy

This is an intentionally hard fixture. If SCIP or the resolver stops at the
middleware boundary, record the precise rows as a known multi-hop limitation and
stop. Do not add name-based transitive matching or spend unbounded effort forcing a
pass.
