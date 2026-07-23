import { chmod, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { runProcess } from "../remediation/process";
import { allowlistedEnvironment } from "../security/environment";
import { DockerIsolatedRunner } from "../security/docker-runner";
import { testRepositoryAccess } from "../test-support/repository-access";
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
  const packageSource = await mkdtemp(join(tmpdir(), "dcav2-fixture-typescript-"));
  const packageHome = await mkdtemp(join(tmpdir(), "dcav2-fixture-npm-home-"));
  await mkdir(join(packageSource, "bin"), { recursive: true });
  const fixtureTypeScript = {
    name: "typescript",
    version: "5.9.3",
    bin: { tsc: "bin/tsc.js" },
  };
  await writeFile(
    join(packageSource, "package.json"),
    JSON.stringify(fixtureTypeScript),
  );
  const fixtureTsc = join(packageSource, "bin", "tsc.js");
  await writeFile(
    fixtureTsc,
    "#!/usr/bin/env node\nrequire('/opt/dcav2/node_modules/typescript/bin/tsc');\n",
  );
  await chmod(fixtureTsc, 0o755);
  const manifest = {
    name: "isolated-remediation-fixture", version: "1.0.0", private: true,
    devDependencies: { typescript: "file:typescript-5.9.3.tgz" },
    scripts: {
      typecheck: "tsc --noEmit -p tsconfig.json",
      build: "tsc -p tsconfig.json",
      test: "node -e \"process.exit(0)\"",
    },
  };
  await writeFile(join(root, "package.json"), JSON.stringify(manifest));
  try {
    const pack = await runProcess(
      "npm",
      ["pack", "--ignore-scripts", "--pack-destination", root],
      {
        cwd: packageSource,
        env: allowlistedEnvironment({ HOME: packageHome }),
        timeoutMs: 30_000,
      },
    );
    if (pack.exitCode !== 0 || pack.timedOut) {
      throw new Error(`Could not build fixture TypeScript package: ${pack.stderr}`);
    }
    const lock = await runProcess(
      "npm",
      ["install", "--package-lock-only", "--ignore-scripts", "--offline", "--no-audit", "--no-fund"],
      {
        cwd: root,
        env: allowlistedEnvironment({ HOME: packageHome }),
        timeoutMs: 30_000,
      },
    );
    if (lock.exitCode !== 0 || lock.timedOut) {
      throw new Error(`Could not generate fixture lockfile: ${lock.stderr}`);
    }
  } finally {
    await rm(packageSource, { recursive: true, force: true });
    await rm(packageHome, { recursive: true, force: true });
  }
  await writeFile(join(root, "tsconfig.json"), JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      module: "commonjs",
      strict: true,
      outDir: "dist",
    },
    include: ["src/**/*.ts"],
  }));
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
      access: testRepositoryAccess,
      role: "test_fixture",
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
      access: testRepositoryAccess,
    });
    expect(result.status, result.failure).toBe("verified");
    expect(result.baseline.status).toBe("passed");
    expect(result.postChange?.status).toBe("passed");
    expect(result.baseline.commands[0]?.args).toContain("--include=dev");
    expect(result.baseline.commands.some((command) =>
      command.kind === "typecheck" && command.command === "npm" && command.exitCode === 0
    )).toBe(true);
    expect(result.patch).toContain("function removableDead");
    expect(result.changedFiles).toEqual(["src/dead.ts"]);
  }, 120_000);
});
