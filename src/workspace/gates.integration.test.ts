import { chmod, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

import { writeOfflineTypeScriptPackage } from "../test-support/offline-typescript";
import { DockerIsolatedRunner } from "../security/docker-runner";
import {
  commandRoutingDigest,
  mapWorkspaceAggregateCommands,
  mapWorkspacePackageCommands,
} from "./commands";
import {
  aggregateCannotHidePackageFailure,
  runWorkspaceBaselineGates,
} from "./gates";
import { inventoryWorkspacePackages } from "./packages";
import { discoverNpmWorkspace } from "./discover";

const image = process.env.DCA_RUNNER_IMAGE;
const describeDocker = image ? describe : describe.skip;
const roots: string[] = [];
const ownedContainers: string[] = [];

afterAll(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function offlineWorkspaceFixture(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "dcav2-phase3a-ws-runner-"));
  roots.push(root);
  await chmod(root, 0o755);
  await mkdir(join(root, "packages", "lib", "src"), { recursive: true });
  await mkdir(join(root, "packages", "app", "src"), { recursive: true });

  // Pack TypeScript into the workspace root using the shared offline helper shape,
  // then rewrite into an npm workspace layout.
  await writeOfflineTypeScriptPackage(root, {
    name: "root-workspace",
    version: "1.0.0",
    private: true,
  });
  const packed = await import("node:fs/promises").then((fs) => fs.readdir(root));
  const tarball = packed.find((name) => name.endsWith(".tgz"));
  if (!tarball) throw new Error("offline typescript tarball missing");

  await writeFile(
    join(root, "package.json"),
    `${JSON.stringify({
      name: "root-workspace",
      private: true,
      workspaces: ["packages/*"],
      scripts: {
        build: "node -e \"process.exit(0)\"",
        test: "node -e \"process.exit(0)\"",
      },
      devDependencies: {
        typescript: `file:${tarball}`,
      },
    }, null, 2)}\n`,
  );
  await writeFile(
    join(root, "tsconfig.json"),
    `${JSON.stringify({
      compilerOptions: {
        target: "ES2022",
        module: "commonjs",
        strict: true,
        skipLibCheck: true,
      },
      include: ["packages/*/src/**/*.ts"],
    }, null, 2)}\n`,
  );
  for (const name of ["lib", "app"]) {
    const packageRoot = join(root, "packages", name);
    await writeFile(
      join(packageRoot, "package.json"),
      `${JSON.stringify({
        name: `@scope/${name}`,
        version: "1.0.0",
        private: true,
        scripts: {
          build: "node -e \"process.exit(0)\"",
          test: "node -e \"process.exit(0)\"",
        },
        ...(name === "app" ? { dependencies: { "@scope/lib": "1.0.0" } } : {}),
      }, null, 2)}\n`,
    );
    await writeFile(
      join(packageRoot, "tsconfig.json"),
      `${JSON.stringify({
        compilerOptions: {
          target: "ES2022",
          module: "commonjs",
          strict: true,
          noEmit: true,
          skipLibCheck: true,
        },
        include: ["src/**/*.ts"],
      }, null, 2)}\n`,
    );
    await writeFile(join(packageRoot, "src", "index.ts"), "export const value = 1;\n");
  }

  const { runProcess } = await import("../remediation/process.js");
  const { allowlistedEnvironment } = await import("../security/environment.js");
  const npmHome = await mkdtemp(join(tmpdir(), "dcav2-phase3a-npm-home-"));
  roots.push(npmHome);
  const locked = await runProcess(
    "npm",
    ["install", "--package-lock-only", "--ignore-scripts", "--offline", "--no-audit", "--no-fund"],
    {
      cwd: root,
      env: allowlistedEnvironment({ HOME: npmHome }),
      timeoutMs: 60_000,
    },
  );
  if (locked.exitCode !== 0 || locked.timedOut) {
    throw new Error(`workspace lockfile failed: ${locked.stderr}`);
  }
  return root;
}

describe("Phase 3A workspace command routing", () => {
  it("p3a-workspace-command-routing and p3a-package-command-identity-binding", async () => {
    const root = await mkdtemp(join(tmpdir(), "dcav2-phase3a-cmd-"));
    roots.push(root);
    await writeFile(
      join(root, "package.json"),
      `${JSON.stringify({ name: "root", private: true, workspaces: ["packages/*"] }, null, 2)}\n`,
    );
    await mkdir(join(root, "packages", "lib", "src"), { recursive: true });
    await writeFile(
      join(root, "packages", "lib", "package.json"),
      `${JSON.stringify({ name: "@scope/lib", version: "1.0.0", private: true }, null, 2)}\n`,
    );
    await writeFile(
      join(root, "packages", "lib", "tsconfig.json"),
      `${JSON.stringify({ compilerOptions: { strict: true } }, null, 2)}\n`,
    );
    await writeFile(join(root, "packages", "lib", "src", "index.ts"), "export const value = 1;\n");
    const discovered = await discoverNpmWorkspace(root);
    const inventory = await inventoryWorkspacePackages({
      root,
      repositoryFullName: "fixture/cmd",
      resolvedCommit: "a".repeat(40),
      matchedRoots: discovered.matchedRoots,
    });
    const packageMappings = mapWorkspacePackageCommands(inventory.packages);
    const aggregateMappings = mapWorkspaceAggregateCommands();
    expect(packageMappings.length).toBeGreaterThan(0);
    expect(new Set(packageMappings.map((item) => item.packageIdentityDigest)).size).toBeGreaterThan(0);
    for (const mapping of packageMappings) {
      expect(mapping.commandId).toContain(mapping.packageIdentityDigest);
      expect(mapping.packageRoot).toMatch(/^packages\//);
      expect(mapping.networkProfile).toBe("network-disabled");
      if (mapping.gateId === "typecheck") {
        expect(mapping.executable).toBe("/workspace/node_modules/.bin/tsc");
      } else {
        expect(mapping.executable).toBe("/usr/local/bin/npm");
      }
    }
    expect(aggregateMappings.every((item) => item.packageIdentityDigest === "workspace-root")).toBe(true);
    expect(commandRoutingDigest(packageMappings)).toMatch(/^[a-f0-9]{64}$/);
  });
});

describeDocker("Phase 3A Docker workspace gates and containment", () => {
  it("p3a-root-install-and-lifecycle, baselines, containment, and aggregate fail-closed", async () => {
    const root = await offlineWorkspaceFixture();
    const discovered = await discoverNpmWorkspace(root);
    const inventory = await inventoryWorkspacePackages({
      root,
      repositoryFullName: "fixture/workspace-gates",
      resolvedCommit: "b".repeat(40),
      matchedRoots: discovered.matchedRoots,
    });
    const packageMappings = mapWorkspacePackageCommands(inventory.packages).filter(
      (mapping) => mapping.gateId === "typecheck" || mapping.gateId === "build" || mapping.gateId === "test",
    );
    const aggregateMappings = mapWorkspaceAggregateCommands();
    const session = await new DockerIsolatedRunner(image!).createSession(root);
    ownedContainers.push(session.containerName);
    try {
      const gates = await runWorkspaceBaselineGates({
        session,
        packageMappings,
        aggregateMappings,
      });
      expect(gates.installExitCode).toBe(0);
      expect(gates.sourceDigestBefore).toMatch(/^[a-f0-9]{64}$/);
      expect(gates.sourceDigestAfter).toBe(gates.sourceDigestBefore);
      expect(gates.packageGates.every((gate) => gate.status === "passed")).toBe(true);
      expect(gates.aggregateGates.every((gate) => gate.status === "passed")).toBe(true);
      expect(aggregateCannotHidePackageFailure(
        [{ ...gates.packageGates[0]!, status: "failed" }],
        gates.aggregateGates.map((gate) => ({ ...gate, status: "passed" as const })),
      )).toBe(false);
    } finally {
      await session.dispose();
    }

    const containment = await new DockerIsolatedRunner(image!, {
      cpus: 0.5,
      memoryMb: 512,
      diskMb: 64,
      pids: 64,
      timeoutMs: 30_000,
      outputBytes: 2048,
    }).createSession(root);
    ownedContainers.push(containment.containerName);
    try {
      const install = await containment.runInstall("npm", [
        "ci", "--ignore-scripts", "--include=dev", "--no-audit", "--no-fund",
      ]);
      expect(install.exitCode).toBe(0);
      await containment.sealNetwork();
      process.env.DCA_HOST_SENTINEL_SECRET = "do-not-expose";
      const probe = await containment.run("node", ["-e", [
        "const fs=require('node:fs');",
        "const report={uid:process.getuid(),secret:process.env.DCA_HOST_SENTINEL_SECRET||null,",
        "database:process.env.DATABASE_URL||null,github:process.env.GITHUB_TOKEN||null,",
        "docker:fs.existsSync('/var/run/docker.sock')};",
        "process.stdout.write(JSON.stringify(report));",
      ].join("")]);
      expect(probe.exitCode).toBe(0);
      expect(JSON.parse(probe.stdout)).toEqual({
        uid: 65532,
        secret: null,
        database: null,
        github: null,
        docker: false,
      });
      const net = await containment.run("node", [
        "-e",
        "const s=require('node:net').connect(80,'example.com');s.on('error',()=>process.exit(7));setTimeout(()=>process.exit(9),300)",
      ]);
      expect(net.exitCode).not.toBe(0);
    } finally {
      delete process.env.DCA_HOST_SENTINEL_SECRET;
      await containment.dispose();
    }
  }, 300_000);
});

export function phase3aOwnedContainers(): string[] {
  return [...ownedContainers];
}
