import { chmod, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { DockerIsolatedRunner } from "../security/docker-runner";
import { runIsolatedAnalysis } from "./isolated-analysis";
import { bindingForFinding } from "./policy";
import { remediateInIsolation } from "./remediate";

const image = process.env.DCA_RUNNER_IMAGE;
const describeDocker = image ? describe : describe.skip;
let root = "";

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), "dcav2-isolated-remediation-"));
  await chmod(root, 0o755);
  await mkdir(join(root, "src"), { recursive: true });
  const manifest = {
    name: "isolated-remediation-fixture", version: "1.0.0", private: true,
    scripts: {
      typecheck: "node /opt/dcav2/node_modules/typescript/bin/tsc --noEmit -p tsconfig.json",
      build: "node -e \"process.exit(0)\"",
      test: "node -e \"process.exit(0)\"",
    },
  };
  await writeFile(join(root, "package.json"), JSON.stringify(manifest));
  await writeFile(join(root, "package-lock.json"), JSON.stringify({ name: manifest.name, version: manifest.version, lockfileVersion: 3, requires: true, packages: { "": { name: manifest.name, version: manifest.version } } }));
  await writeFile(join(root, "tsconfig.json"), JSON.stringify({ compilerOptions: { target: "ES2022", module: "commonjs", strict: true }, include: ["src/**/*.ts"] }));
  await writeFile(join(root, "src/dead.ts"), "function removableDead() { return 1; }\nexport const retained = 1;\n");
});

afterAll(async () => {
  if (root) {
    await rm(root, { recursive: true, force: true });
  }
});

describeDocker("isolated remediation integration", () => {
  it("runs baseline, one Piranha rewrite, post checks, and emits a stable patch", async () => {
    const commitSha = "b".repeat(40);
    const repository = { provider: "github" as const, owner: "fixture", name: "remediation" };
    const analysis = await runIsolatedAnalysis({
      session: await new DockerIsolatedRunner(image!).createSession(root),
      accountScopeId: "integration",
      repository,
      commitSha,
    });
    const finding = analysis.findings.find((candidate) => candidate.occurrence.name === "removableDead");
    expect(finding?.classification).toBe("candidate_dead");
    const binding = bindingForFinding(finding!);
    const result = await remediateInIsolation({
      session: await new DockerIsolatedRunner(image!).createSession(root),
      sourcePath: root,
      finding: finding!,
      authorization: { ...binding, id: "integration-authorization", decision: "approved_for_remediation" },
      freshIdentity: {
        repositoryProvider: "github", repositoryOwner: repository.owner, repositoryName: repository.name,
        commitSha, filePath: finding!.occurrence.filePath,
        sourceSha256: finding!.occurrence.sourceSha256, evidenceDigest: finding!.evidenceDigest,
        policyVersion: finding!.policyVersion, exactOccurrence: finding!.occurrence,
      },
    });
    expect(result.status, result.failure).toBe("verified");
    expect(result.baseline.status).toBe("passed");
    expect(result.postChange?.status).toBe("passed");
    expect(result.patch).toContain("function removableDead");
    expect(result.changedFiles).toEqual(["src/dead.ts"]);
  }, 120_000);
});
