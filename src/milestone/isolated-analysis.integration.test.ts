import { chmod, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { DockerIsolatedRunner } from "../security/docker-runner";
import { runIsolatedAnalysis } from "./isolated-analysis";

const image = process.env.DCA_RUNNER_IMAGE;
const describeDocker = image ? describe : describe.skip;
let root = "";

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), "dcav2-isolated-analysis-"));
  await chmod(root, 0o755);
  await mkdir(join(root, "src"), { recursive: true });
  await writeFile(join(root, "package.json"), JSON.stringify({ name: "isolated-analysis-fixture", version: "1.0.0", private: true }));
  await writeFile(join(root, "package-lock.json"), JSON.stringify({ name: "isolated-analysis-fixture", version: "1.0.0", lockfileVersion: 3, requires: true, packages: { "": { name: "isolated-analysis-fixture", version: "1.0.0" } } }));
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
    });
    expect(result.coverage.status).toBe("complete_for_supported_scope");
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]?.classification, JSON.stringify(result.findings[0], null, 2)).toBe("candidate_dead");
    expect(result.findings[0]?.evidence.scip.definitionMatches).toBe(1);
  }, 60_000);
});
