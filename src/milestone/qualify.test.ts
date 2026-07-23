import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { qualifyTypeScriptRepository, type QualificationToolchain } from "./qualify";

const roots: string[] = [];
const repository = { provider: "github" as const, owner: "fixture", name: "qualified" };
const commitSha = "1".repeat(40);
const toolchain: QualificationToolchain = {
  node: { version: "22.18.0", executable: "/usr/local/bin/node", source: "approved_runner" },
  npm: { version: "10.9.3", executable: "/usr/local/bin/npm", source: "approved_runner" },
  typescript: {
    version: "5.9.3",
    executable: "/workspace/node_modules/.bin/tsc",
    source: "project_local",
  },
};

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function fixture(overrides: {
  manifest?: Record<string, unknown>;
  lock?: Record<string, unknown>;
  tsconfig?: string;
  extra?: Record<string, string>;
} = {}): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "dcav2-phase1-qualification-"));
  roots.push(root);
  await mkdir(join(root, "src"), { recursive: true });
  const manifest = {
    name: "qualified",
    version: "1.0.0",
    private: true,
    packageManager: "npm@10.9.3",
    scripts: { build: "tsc -p tsconfig.json", test: "node test.js" },
    devDependencies: { typescript: "5.9.3" },
    ...overrides.manifest,
  };
  const lock = {
    name: "qualified",
    version: "1.0.0",
    lockfileVersion: 3,
    packages: {
      "": { name: "qualified", version: "1.0.0" },
      "node_modules/typescript": { version: "5.9.3" },
    },
    ...overrides.lock,
  };
  await writeFile(join(root, "package.json"), JSON.stringify(manifest));
  await writeFile(join(root, "package-lock.json"), JSON.stringify(lock));
  await writeFile(
    join(root, "tsconfig.json"),
    overrides.tsconfig ?? JSON.stringify({ include: ["src/**/*.ts"] }),
  );
  await writeFile(join(root, "src/main.ts"), "function privateHelper() { return 1; }\n");
  await writeFile(join(root, "src/main.test.ts"), "privateHelper();\n");
  for (const [path, content] of Object.entries(overrides.extra ?? {})) {
    await writeFile(join(root, path), content);
  }
  return root;
}

async function qualify(root: string, selectedToolchain = toolchain) {
  return qualifyTypeScriptRepository({
    repositoryPath: root,
    repository,
    commitSha,
    toolchain: selectedToolchain,
  });
}

describe("Phase 1 TypeScript repository qualification", () => {
  it("returns a deterministic ready record with exact package, toolchain, command, and module identities", async () => {
    const root = await fixture();
    const first = await qualify(root);
    const second = await qualify(root);
    expect(first.status, first.reasons.join(", ")).toBe("ready");
    expect(first).toEqual(second);
    expect(first.packageIdentity).toMatch(/^[a-f0-9]{64}$/);
    expect(first.commands.install).toContain("--ignore-scripts");
    expect(first.commands.typecheck).toContain("/workspace/node_modules/.bin/tsc");
    expect(first.modules).toHaveLength(2);
    expect(first.modules.map((module) => module.sourceKind)).toEqual([
      "authored_test",
      "authored_production",
    ]);
    expect(new Set(first.modules.map((module) => module.moduleId)).size).toBe(2);
  });

  it.each([
    [{ manifest: { workspaces: ["packages/*"] } }, "workspaces_are_outside_phase_1"],
    [{ manifest: { packageManager: "pnpm@9.0.0" } }, "declared_package_manager_is_not_npm"],
    [{ lock: { lockfileVersion: 2 } }, "package_lock_identity_mismatch"],
    [{ tsconfig: "{ malformed" }, "malformed_typescript_configuration"],
    [{ manifest: { scripts: {} } }, "required_build_gate_unavailable"],
  ] as const)("keeps unsupported or malformed profiles non-ready", async (overrides, reason) => {
    const result = await qualify(await fixture(overrides as Parameters<typeof fixture>[0]));
    expect(result.status).not.toBe("ready");
    expect(result.reasons).toContain(reason);
  });

  it("rejects host-global or mismatched compiler and runtime identities", async () => {
    const root = await fixture();
    const result = await qualify(root, {
      ...toolchain,
      node: { ...toolchain.node, executable: "/usr/bin/node" },
      typescript: { ...toolchain.typescript, source: "project_local", version: "5.8.0" },
    });
    expect(result.status).not.toBe("ready");
    expect(result.reasons).toEqual(expect.arrayContaining([
      "unsupported_or_untrusted_node_runtime",
      "project_local_typescript_identity_mismatch",
    ]));
  });
});
