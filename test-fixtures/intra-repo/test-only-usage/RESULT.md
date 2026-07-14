# Test-only usage result

Verified on 2026-07-14 with:

```bash
npx ts-node scripts/run-fixture-check.ts test-only-usage
```

Discovery found 21 repositories and completed with no errors. The fixture built,
its test executed successfully, and Knip produced zero findings because
`src/helper.test.ts` is an explicit entrypoint.

## Expectation comparison

| Expected evidence | Actual | Result |
| --- | --- | --- |
| SCIP resolves the test call to `computeThing` | One `same_repo` `call` targets `src/helper.ts::computeThing` | Pass |
| Production executable references | 0 | Pass |
| Test executable references | 1 | Pass |
| Reference is identifiable as test context | The call and imports have `reference_context = 'test'` | Pass |
| Knip alone may consider the symbol used | Knip produced zero findings | Expected limitation |

## Policy outcome

`computeThing` is dead for production reachability but has `test_only` evidence. The
future Confidence & Review module should route this state to human review rather than
allowing the test call to mark the symbol production-alive or recommending automatic
deletion.

The platform now stores `reference_context` independently from `reference_kind`:

- Context: `production`, `test`, or `unknown`.
- Kind: `import`, `reexport`, `call`, `construct`, `read`, or `unknown`.

This preserves the resolved graph while allowing production and test reachability to
be evaluated separately.
