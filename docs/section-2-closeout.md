# Section 2 closeout

Verified on 2026-07-13 against real GitHub App installation repositories.

## Acceptance evidence

- Vitest: 69 tests passed across 4 test files.
- Clone smoke test: VahanConnect cloned at commit
  `5e9e06e270ff2944c7583273827486cf3d7171a4`; cleanup removed the scratch checkout.
- TypeScript/JavaScript indexing: PDM (`c9651a02-3886-4996-a403-0f2c3b70d3d1`)
  parsed 63 files and extracted 172 symbols with no failures.
- Python indexing: NutriLens (`8c1f9b0f-5537-4ef4-a0f0-e6de524aa2bd`)
  indexed 33 files and extracted 179 symbols with no failures on its initial run.
- PDM symbol rows for `AuthController`, `AuthController.login`, `AuthService`, and
  `AuthService.login` matched the source line ranges, qualified names, and export flags.
- PDM call edges contained 47 direct and 484 unresolved edges. Manual source checks confirmed:
  - `AuthController.login` directly resolves `this.setRefreshCookie()` to
    `AuthController.setRefreshCookie`.
  - `AuthController.login` leaves `this.authService.login()` unresolved.
  - `AuthService.login` directly resolves its same-class helper calls.
  - `AuthService.login` leaves imported `bcrypt.compare()` unresolved.
- Idempotency: a second PDM run skipped all 63 unchanged files.
- Change detection: changing only `backend/src/auth/auth.controller.ts` in the temporary
  checkout reparsed 1 file and skipped 62; a normal run restored the upstream hash.
- Failure isolation: BlockSeat completed with 28 successful JavaScript files and one failed
  JSX file (`frontend/src/pages/TransferTicket.jsx`) recorded with its parse error. The parser
  reported raw JSX text `Pay & Transfer` at line 100. The failure did not stop the run.
- Solidity files in BlockSeat produced no `indexed_files` rows. Unsupported languages are
  skipped intentionally; they are not parser failures.

## Explicitly deferred

- Points-to and context-sensitive analysis.
- Languages beyond TypeScript, JavaScript, and Python.
- Cross-repository resolution (Section 4).
- Dependency injection, decorators, reflection, and other framework-aware indirection
  (Section 3).
