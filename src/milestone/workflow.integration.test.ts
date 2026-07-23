import { chmod, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { DockerIsolatedRunner } from "../security/docker-runner";
import { testRepositoryAccess } from "../test-support/repository-access";
import { runIsolatedAnalysis } from "./isolated-analysis";
import { publishVerifiedDraft, type DraftPullRequestGateway } from "./publisher";
import { remediateInIsolation } from "./remediate";

const image = process.env.DCA_RUNNER_IMAGE;
const databaseUrl = process.env.DCA_TEST_DATABASE_URL;
const describeWorkflow = image && databaseUrl ? describe : describe.skip;
let root = "";

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), "dcav2-workflow-integration-"));
  await chmod(root, 0o755);
  await mkdir(join(root, "src"), { recursive: true });
  const manifest = {
    name: "workflow-integration", version: "1.0.0", private: true,
    scripts: {
      typecheck: "node /opt/dcav2/node_modules/typescript/bin/tsc --noEmit -p tsconfig.json",
      build: "node -e \"process.exit(0)\"",
      test: "node -e \"process.exit(0)\"",
    },
  };
  await writeFile(join(root, "package.json"), JSON.stringify(manifest));
  await writeFile(join(root, "package-lock.json"), JSON.stringify({ name: manifest.name, version: manifest.version, lockfileVersion: 3, requires: true, packages: { "": { name: manifest.name, version: manifest.version } } }));
  await writeFile(join(root, "tsconfig.json"), JSON.stringify({ compilerOptions: { target: "ES2022", module: "commonjs", strict: true }, include: ["src/**/*.ts"] }));
  await writeFile(join(root, "src/dead.ts"), "function workflowDead() { return 1; }\nexport const retained = 1;\n");
});

afterAll(async () => {
  if (root) {
    await rm(root, { recursive: true, force: true });
  }
});

describeWorkflow("standalone milestone workflow", () => {
  it("persists the complete authorized draft-PR audit chain without merging", async () => {
    process.env.DATABASE_URL = databaseUrl;
    const [{ migrate }, { pool }, { MilestoneStore }] = await Promise.all([
      import("../db/migrate.js"), import("../db/client.js"), import("./store.js"),
    ]);
    await migrate();
    const store = new MilestoneStore("workflow-integration", pool);
    const accountScopeId = "workflow-integration";
    const actor = "integration-operator";
    const commitSha = "c".repeat(40);
    const repository = { provider: "github" as const, owner: "fixture", name: "workflow" };
    await store.ensureAccountScope(accountScopeId, "Workflow Integration");
    const analysis = await runIsolatedAnalysis({
      session: await new DockerIsolatedRunner(image!).createSession(root),
      accountScopeId, repository, commitSha,
      access: testRepositoryAccess, role: "test_fixture",
    });
    await store.recordAnalysis(analysis, actor);
    const finding = analysis.findings.find((candidate) => candidate.occurrence.name === "workflowDead");
    expect(finding?.classification).toBe("candidate_dead");
    const reviewId = await store.recordDisposition({
      findingId: finding!.findingId, decision: "confirmed_dead", actorIdentity: "reviewer",
      rationale: "Complete fixture evidence reviewed",
    });
    const authorizationId = await store.recordAuthorization({
      findingId: finding!.findingId, decision: "approved_for_remediation", actorIdentity: "authorizer",
      rationale: "Exact one-file fixture removal approved",
    });
    expect(authorizationId).not.toBe(reviewId);

    const fresh = await runIsolatedAnalysis({
      session: await new DockerIsolatedRunner(image!).createSession(root),
      accountScopeId, repository, commitSha,
      access: testRepositoryAccess, role: "test_fixture",
    });
    expect(fresh.findings[0]?.evidenceDigest).toBe(finding!.evidenceDigest);
    const authorization = await store.latestAuthorization(finding!.findingId);
    const remediation = await remediateInIsolation({
      session: await new DockerIsolatedRunner(image!).createSession(root),
      sourcePath: root, finding: finding!, authorization,
      freshIdentity: {
        repositoryProvider: "github", repositoryOwner: repository.owner, repositoryName: repository.name,
        commitSha, filePath: fresh.findings[0]!.occurrence.filePath,
        sourceSha256: fresh.findings[0]!.occurrence.sourceSha256,
        evidenceDigest: fresh.findings[0]!.evidenceDigest,
        policyVersion: fresh.findings[0]!.policyVersion,
        exactOccurrence: fresh.findings[0]!.occurrence,
      },
      access: testRepositoryAccess,
    });
    expect(remediation.status, remediation.failure).toBe("verified");
    const attemptId = await store.recordRemediation(remediation, actor);
    const gateway: DraftPullRequestGateway = {
      createDraftPullRequest: vi.fn(async (input) => ({
        url: "https://github.test/fixture/workflow/pull/1",
        branchName: input.branchName,
      })),
    };
    const publication = await publishVerifiedDraft({
      store, gateway, attemptId, baseBranch: "main", actorIdentity: "publisher",
      access: testRepositoryAccess,
    });
    expect(publication.status).toBe("draft_pr_created");
    expect(gateway.createDraftPullRequest).toHaveBeenCalledOnce();
    const publishedInput = vi.mocked(gateway.createDraftPullRequest).mock.calls[0]![0];
    expect(publishedInput.body).toContain("intentionally a draft");
    expect(publishedInput.body).toContain(finding!.evidenceDigest);
    expect(publishedInput.body).not.toMatch(/auto.?merge/i);
    const audit = await store.auditChain(accountScopeId);
    expect(audit).toHaveLength(5);
    expect(await store.getRemediationAttempt(attemptId)).toEqual(expect.objectContaining({
      status: "verified",
      publication_status: "draft_pr_created",
    }));
    await pool.end();
  }, 180_000);
});
