import { chmod, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { DockerIsolatedRunner } from "../security/docker-runner";
import { testRepositoryAccess } from "../test-support/repository-access";
import { writeOfflineTypeScriptPackage } from "../test-support/offline-typescript";
import { runIsolatedAnalysis } from "./isolated-analysis";

const image = process.env.DCA_RUNNER_IMAGE;
const describeDocker = image ? describe : describe.skip;
let root = "";

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), "dcav2-isolated-analysis-"));
  await chmod(root, 0o755);
  await mkdir(join(root, "src"), { recursive: true });
  await writeOfflineTypeScriptPackage(root, {
    name: "isolated-analysis-fixture",
    version: "1.0.0",
    private: true,
  });
  await writeFile(join(root, "tsconfig.json"), JSON.stringify({ compilerOptions: { target: "ES2022", module: "commonjs", strict: true }, include: ["src/**/*.ts"] }));
  await writeFile(join(root, "src/dead.ts"), "function isolatedDead() { return 1; }\n");
});

afterAll(async () => {
  if (root) {
    await rm(root, { recursive: true, force: true });
  }
});

describeDocker("isolated analyzer integration", () => {
  it("runs pinned SCIP and deterministic analysis without host execution", async () => {
    const session = await new DockerIsolatedRunner(image!).createSession(root);
    const result = await runIsolatedAnalysis({
      session,
      accountScopeId: "integration",
      repository: { provider: "github", owner: "fixture", name: "isolated" },
      commitSha: "a".repeat(40),
      access: testRepositoryAccess,
      role: "test_fixture",
    });
    expect(result.coverage.status).toBe("complete_for_supported_scope");
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]?.classification, JSON.stringify(result.findings[0], null, 2)).toBe("candidate_dead");
    expect(result.findings[0]?.evidence.scip.definitionMatches).toBe(1);
  }, 60_000);

  it("keeps a missing project compiler as an explicit failed command", async () => {
    const missingCompilerRoot = await mkdtemp(join(tmpdir(), "dcav2-missing-compiler-"));
    await chmod(missingCompilerRoot, 0o755);
    try {
      await writeFile(
        join(missingCompilerRoot, "package.json"),
        JSON.stringify({ name: "missing-compiler", version: "1.0.0", private: true }),
      );
      await writeFile(
        join(missingCompilerRoot, "package-lock.json"),
        JSON.stringify({
          name: "missing-compiler",
          version: "1.0.0",
          lockfileVersion: 3,
          requires: true,
          packages: { "": { name: "missing-compiler", version: "1.0.0" } },
        }),
      );
      const session = await new DockerIsolatedRunner(image!).createSession(missingCompilerRoot);
      try {
        const install = await session.runInstall("npm", [
          "ci", "--ignore-scripts", "--include=dev", "--no-audit", "--no-fund",
        ]);
        expect(install.exitCode).toBe(0);
        await session.sealNetwork();
        const compiler = await session.run(
          "/workspace/node_modules/.bin/tsc",
          ["--noEmit", "-p", "tsconfig.json"],
        );
        expect(compiler.exitCode).not.toBe(0);
        expect(compiler.timedOut).toBe(false);
      } finally {
        await session.dispose();
      }
    } finally {
      await rm(missingCompilerRoot, { recursive: true, force: true });
    }
  }, 60_000);

  it("keeps malformed TypeScript configuration as a failed analysis", async () => {
    const malformedRoot = await mkdtemp(join(tmpdir(), "dcav2-malformed-tsconfig-"));
    await chmod(malformedRoot, 0o755);
    await mkdir(join(malformedRoot, "src"), { recursive: true });
    try {
      await writeOfflineTypeScriptPackage(malformedRoot, {
        name: "malformed-tsconfig",
        version: "1.0.0",
        private: true,
      });
      await writeFile(join(malformedRoot, "tsconfig.json"), "{ not valid json");
      await writeFile(join(malformedRoot, "src/dead.ts"), "function malformedDead() { return 1; }\n");
      await expect(runIsolatedAnalysis({
        session: await new DockerIsolatedRunner(image!).createSession(malformedRoot),
        accountScopeId: "integration",
        repository: { provider: "github", owner: "fixture", name: "malformed" },
        commitSha: "d".repeat(40),
        access: testRepositoryAccess,
        role: "test_fixture",
      })).rejects.toThrow(/SCIP failed/);
    } finally {
      await rm(malformedRoot, { recursive: true, force: true });
    }
  }, 60_000);
});
