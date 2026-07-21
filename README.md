# DCAv2

DCAv2 is a standalone, CLI-driven vertical slice for explainable and human-authorized dead-code removal. The supported path analyzes one immutable GitHub commit, identifies eligible private top-level TypeScript function declarations, records evidence and coverage, requires separate human review and remediation authorization, verifies one removal in an isolated runner, and may publish a draft pull request.

DCAv2 never merges pull requests. The new workflow contains no merge command or merge API call.

## Supported scope

- One GitHub repository and one root npm package.
- `package-lock.json` and one non-solution root `tsconfig.json`.
- TypeScript `.ts` source files only; `.tsx`, JavaScript, declaration files, generated files, and vendored files are excluded.
- Named, non-exported, top-level `function` declarations only.
- Exactly one Tree-sitter declaration, one exact SCIP definition, zero production references, zero test references, and one repository-wide textual occurrence.
- One finding, authorization, patch, branch, and draft PR per remediation attempt.

Workspaces, nested packages, cross-repository analysis, runtime evidence, multiple languages, batch remediation, private-registry credential brokering, web UI, PRPilot, and automatic merge are outside this milestone.

## Safety model

The controller, isolated runner, and publisher are separate boundaries:

1. Trusted acquisition obtains a repository-scoped, short-lived GitHub App credential, resolves an immutable SHA, uses an askpass helper instead of an authenticated URL, replaces Git configuration with a safe local configuration, and stages the clone under the operating-system temporary directory.
2. The digest-pinned Docker runner executes as UID/GID `65532`, with a read-only root filesystem, no capabilities, `no-new-privileges`, no Docker socket, explicit tmpfs workspaces, CPU/memory/disk/PID/time/output limits, and an allowlisted environment. The staged repository is read-only; the mutable copy and dependency tree are unique to one session.
3. Dependency installation permits only `npm ci --ignore-scripts`. Without a configured allowlisting registry proxy, it runs with no network and therefore fails closed if downloads are required. With a proxy, the runner connects only to a Docker `--internal` network for installation and is disconnected before analysis, transformation, build, and tests.
4. The trusted publisher reloads persisted evidence, the latest authorization, baseline/post results, patch hash, and expected file set under a per-finding advisory lock. It uses a separately issued repository-scoped write credential and creates only a draft PR.

Legacy authenticated-URL cloning, confidence-score remediation, and adaptive unreviewed batch/draft remediation are quarantined and throw errors.

## Prerequisites

- Node.js and npm versions compatible with the lockfile.
- PostgreSQL 16 or compatible PostgreSQL with `gen_random_uuid()`.
- Docker with the isolated-runner image built locally or supplied by a trusted registry.
- A GitHub App installed on the target repository with narrowly scoped read credentials for acquisition and contents/pull-request write credentials for publishing. Branch protection must prevent the App from pushing or merging the default branch.

Required control-plane environment variables:

```text
DATABASE_URL
GITHUB_APP_ID
GITHUB_INSTALLATION_ID
GITHUB_PRIVATE_KEY_PATH
DCA_RUNNER_IMAGE
```

`DCA_RUNNER_IMAGE` must end in `@sha256:<64 hex characters>`; mutable tags are rejected.

When dependencies must be downloaded, configure both:

```text
DCA_REGISTRY_NETWORK
DCA_REGISTRY_PROXY_URL
```

`DCA_REGISTRY_NETWORK` must be a Docker internal network containing an allowlisting registry proxy. The proxy is an operational security dependency and must allow only the approved npm registry hosts.

## Build the runner

The Dockerfile defaults to a digest-pinned Node base image and installs npm dependencies from `package-lock.json` plus PolyglotPiranha `0.4.8`.

```bash
npm run runner:image
docker image inspect dcav2-runner:milestone --format '{{index .RepoDigests 0}}'
export DCA_RUNNER_IMAGE='dcav2-runner@sha256:<resolved-digest>'
```

Do not use repository-controlled `npx` to obtain analyzers or transformers at runtime.

## CLI workflow

Every command emits structured JSON.

```bash
npm run dca -- analyze \
  --account internal-evaluation \
  --repo owner/repository \
  --revision main \
  --actor operator@example.com

npm run dca -- analysis --run <analysis-run-id>
npm run dca -- findings --account internal-evaluation
npm run dca -- finding --finding <finding-id>

npm run dca -- review \
  --finding <finding-id> \
  --decision confirmed_dead \
  --actor reviewer@example.com \
  --rationale 'Evidence and supported-scope coverage reviewed.'

npm run dca -- authorize \
  --finding <finding-id> \
  --decision approved_for_remediation \
  --actor authorizer@example.com \
  --rationale 'One-file removal is approved for this exact evidence digest.'

npm run dca -- remediate \
  --finding <finding-id> \
  --revision main \
  --actor operator@example.com

npm run dca -- gates --attempt <remediation-attempt-id>

npm run dca -- publish \
  --attempt <remediation-attempt-id> \
  --base main \
  --actor publisher@example.com

npm run dca -- audit --account internal-evaluation
```

Allowed disposition values are `confirmed_dead`, `confirmed_alive`, `deferred`, `excluded`, and `inconclusive`. Allowed authorization values are `approved_for_remediation`, `rejected`, `revoked`, and `expired`.

Any changed commit, file hash, exact occurrence, evidence digest, policy version, failed/partial coverage, analyzer failure, resolved reference, extra textual occurrence, baseline failure, post-change failure, patch mutation, or unexpected file change prevents publication.

## Database migrations

`src/db/migrate.ts` applies checksum-verified ordered migrations under a PostgreSQL advisory lock:

- `0001_legacy_baseline` preserves the prototype schema and data.
- `0002_milestone_ledger` adds immutable analysis, evidence, review, authorization, remediation, verification, patch, publication, and audit records.
- `0003_publication_attempts` allows append-only failed publication attempts followed by one idempotent successful draft-PR publication.

The legacy symbol/reference tables remain replaceable caches. The immutable finding bundle and milestone ledger are the remediation audit source.

## Validation

```bash
npm test
npx tsc --noEmit

DCA_RUNNER_IMAGE='dcav2-runner@sha256:<digest>' \
  npx vitest run src/security/hostile-repository.test.ts

DCA_RUNNER_IMAGE='dcav2-runner@sha256:<digest>' \
  npx vitest run \
    src/milestone/isolated-analysis.integration.test.ts \
    src/milestone/remediation.integration.test.ts

DATABASE_URL='postgresql:///temporary_test_database' \
DCA_TEST_DATABASE_URL='postgresql:///temporary_test_database' \
  npx vitest run src/db/milestone.integration.test.ts
```

Docker and PostgreSQL integration tests skip unless their explicit environment variables are present. Unit and hermetic analyzer fixture tests always run.
