# Project status

## Current milestone

The standalone, CLI-driven TypeScript private-function removal slice is implemented.

Implemented behavior:

- Trusted GitHub source acquisition resolves an immutable commit, avoids authenticated remote URLs, sanitizes Git configuration, and verifies workspace cleanup.
- A digest-pinned, non-root Docker runner isolates installation, SCIP analysis, transformation, build, and test execution with explicit environment, filesystem, network, CPU, memory, disk, PID, timeout, output, and cleanup controls.
- Deterministic classification supports only private top-level TypeScript `function` declarations and emits explicit evidence, counter-evidence, coverage, blockers, contradictions, classifications, and reproducible evidence digests.
- Human disposition and remediation authorization are separate append-only records bound to the exact finding, commit, occurrence, source hash, evidence digest, and policy version.
- Remediation performs baseline verification, exactly one Piranha rewrite, post-change verification, changed-file validation, patch-stability validation, and SHA-256 patch generation.
- The trusted publisher independently revalidates persisted state under a per-finding lock and can create only a draft GitHub pull request.
- Ordered checksum-verified PostgreSQL migrations preserve the legacy prototype and add an immutable milestone ledger plus hash-chained audit events.
- Legacy confidence-only remediation, authenticated-URL cloning, and unreviewed batch/draft remediation are quarantined.

## Validation state

- Unit and hermetic tests pass.
- Type checking and production compilation pass.
- Hostile-repository containment passes against a real locally built Docker runner.
- Real isolated SCIP analysis and baseline/Piranha/post-change remediation pass against hermetic repositories.
- Migrations pass from an empty PostgreSQL database, preserve existing prototype data, enforce immutability, and satisfy append/idempotency checks.

The authorized external repository `akshay-hudev/swift-apply-form` was inspected read-only at `main` commit `51e9a90f5b586830af2dd173b4cc3af0e5719fef`. It is not a suitable milestone fixture: its root `tsconfig.json` is solution-style and references two additional root configs, its application is primarily TSX, it has no test script, and no eligible dead private `.ts` function was established. It was not modified and no branch or pull request was created.

External draft-PR publication remains unexecuted because GitHub App credentials and a conforming external fixture are not available. Dependency-bearing external repositories additionally require the documented allowlisting registry proxy; the runner fails closed without it.

## Scope boundary

Website/UI, PRPilot, Jira/Linear/MCP/Cursor, workspaces/monorepos, cross-repository analysis, private-registry credentials, runtime/deployment evidence, service retirement, JavaScript/TSX/Python/Java, exported or non-function entities, file/dependency deletion, barrel cleanup, batching, scheduling, distributed workers, graph databases, and automatic merge remain intentionally outside this milestone.
