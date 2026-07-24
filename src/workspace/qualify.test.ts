import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  discoverNpmWorkspace,
  matchWorkspacePattern,
  validateWorkspacePattern,
} from "./discover";
import { buildPackageGraph, evaluateLockfileConsistency } from "./graph";
import { inventoryWorkspacePackages } from "./packages";
import { aggregateWorkspaceCoverage, evaluatePackageCoverage, mayClassifyCandidateDead } from "./coverage";
import { collectCrossPackageReferences } from "./references";
import { createWorkspaceQualificationRequest, qualifyNpmWorkspace } from "./qualify";

const COMMIT = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const SNAPSHOT = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

async function workspaceFixture(layout: {
  root?: Record<string, unknown>;
  packages?: Record<string, Record<string, unknown>>;
  files?: Record<string, string>;
  lockfile?: Record<string, unknown> | null;
  extraRootFiles?: Record<string, string>;
}): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "dcav2-phase3a-"));
  const rootManifest = {
    name: "root-workspace",
    private: true,
    workspaces: ["packages/*"],
    ...(layout.root ?? {}),
  };
  await writeFile(join(root, "package.json"), `${JSON.stringify(rootManifest, null, 2)}\n`);
  if (layout.lockfile !== null) {
    await writeFile(
      join(root, "package-lock.json"),
      `${JSON.stringify(layout.lockfile ?? { lockfileVersion: 3, packages: {} }, null, 2)}\n`,
    );
  }
  for (const [name, content] of Object.entries(layout.extraRootFiles ?? {})) {
    await writeFile(join(root, name), content);
  }
  for (const [packageName, manifest] of Object.entries(layout.packages ?? {})) {
    const packageRoot = join(root, "packages", packageName);
    await mkdir(join(packageRoot, "src"), { recursive: true });
    await writeFile(
      join(packageRoot, "package.json"),
      `${JSON.stringify({ name: `@scope/${packageName}`, version: "1.0.0", ...manifest }, null, 2)}\n`,
    );
    await writeFile(
      join(packageRoot, "tsconfig.json"),
      `${JSON.stringify({ compilerOptions: { strict: true } }, null, 2)}\n`,
    );
    await writeFile(join(packageRoot, "src", "index.ts"), "export const value = 1;\n");
  }
  for (const [relativePath, content] of Object.entries(layout.files ?? {})) {
    const absolute = join(root, relativePath);
    await mkdir(join(absolute, ".."), { recursive: true });
    await writeFile(absolute, content);
  }
  return root;
}

describe("Phase 3A workspace discovery", () => {
  it("matches supported workspace patterns and rejects unsafe patterns", () => {
    expect(matchWorkspacePattern("packages/*", "packages/a")).toBe(true);
    expect(matchWorkspacePattern("packages/*", "packages/a/b")).toBe(false);
    expect(validateWorkspacePattern("../evil")).toContain("parent_directory_escape");
    expect(validateWorkspacePattern("/abs")).toContain("absolute_pattern");
    expect(validateWorkspacePattern("**/node_modules/**")).toContain("dependency_directory_pattern");
  });

  it("discovers npm workspaces and rejects pnpm indicators", async () => {
    const root = await workspaceFixture({
      packages: { lib: {}, app: { dependencies: { "@scope/lib": "workspace:*" } } },
    });
    const discovered = await discoverNpmWorkspace(root);
    expect(discovered.declaration?.support).toBe("supported");
    expect(discovered.matchedRoots).toEqual(["packages/app", "packages/lib"]);

    const pnpm = await workspaceFixture({
      packages: { lib: {} },
      extraRootFiles: { "pnpm-workspace.yaml": "packages:\n  - packages/*\n" },
    });
    const unsupported = await discoverNpmWorkspace(pnpm);
    expect(unsupported.declaration?.support).toBe("unsupported");
    expect(unsupported.blockers).toContain("pnpm_workspace_unsupported_in_phase_3a");
  });
});

describe("Phase 3A package identity and graph", () => {
  it("binds canonical package identity and builds deterministic graphs", async () => {
    const root = await workspaceFixture({
      packages: {
        lib: {},
        app: { dependencies: { "@scope/lib": "workspace:*" } },
      },
      lockfile: {
        lockfileVersion: 3,
        packages: {
          "": {},
          "packages/lib": { name: "@scope/lib", version: "1.0.0" },
          "packages/app": { name: "@scope/app", version: "1.0.0" },
        },
      },
    });
    const inventory = await inventoryWorkspacePackages({
      root,
      repositoryFullName: "fixture/workspace",
      resolvedCommit: COMMIT,
      matchedRoots: ["packages/app", "packages/lib"],
    });
    expect(inventory.packages).toHaveLength(3);
    expect(inventory.duplicateNames).toEqual([]);
    const first = buildPackageGraph(inventory.packages);
    const second = buildPackageGraph(inventory.packages);
    expect(first.graphDigest).toBe(second.graphDigest);
    expect(first.edges.some((edge) => edge.status === "resolved" && edge.toPackageName === "@scope/lib")).toBe(true);
    const lock = await evaluateLockfileConsistency({ root, packages: inventory.packages });
    expect(lock.consistent).toBe(true);
  });

  it("fails safely on duplicate package names", async () => {
    const root = await workspaceFixture({
      packages: {
        one: { name: "@scope/dup" },
        two: { name: "@scope/dup" },
      },
    });
    const inventory = await inventoryWorkspacePackages({
      root,
      repositoryFullName: "fixture/workspace",
      resolvedCommit: COMMIT,
      matchedRoots: ["packages/one", "packages/two"],
    });
    expect(inventory.duplicateNames).toEqual(["@scope/dup"]);
    expect(inventory.blockers.some((item) => item.startsWith("duplicate_package_name:"))).toBe(true);
  });
});

describe("Phase 3A coverage and references", () => {
  it("records cross-package imports and blocks candidate_dead without complete coverage", async () => {
    const root = await workspaceFixture({
      packages: {
        lib: {},
        app: { dependencies: { "@scope/lib": "workspace:*" } },
      },
      files: {
        "packages/app/src/index.ts": `import { value } from "@scope/lib";\nexport const used = value;\n`,
      },
      lockfile: {
        lockfileVersion: 3,
        packages: {
          "": {},
          "packages/lib": { name: "@scope/lib" },
          "packages/app": { name: "@scope/app" },
        },
      },
    });
    const inventory = await inventoryWorkspacePackages({
      root,
      repositoryFullName: "fixture/workspace",
      resolvedCommit: COMMIT,
      matchedRoots: ["packages/app", "packages/lib"],
    });
    const graph = buildPackageGraph(inventory.packages);
    const references = await collectCrossPackageReferences({ root, packages: inventory.packages });
    expect(references.some((item) => item.kind === "package_name" && item.status === "resolved")).toBe(true);
    const coverages = inventory.packages.map((pkg) => evaluatePackageCoverage({ pkg, graph, references }));
    const coverage = aggregateWorkspaceCoverage(inventory.packages, coverages);
    expect(mayClassifyCandidateDead(coverage)).toBe(coverage.status === "complete");
  });
});

describe("Phase 3A workspace qualification", () => {
  it("rejects unauthorized target access and qualifies a supported workspace", async () => {
    const request = createWorkspaceQualificationRequest({
      requestId: "phase3a-request",
      accountScopeId: "tenant",
      authorizationId: "phase-3a-npm-monorepos-20260724-01",
      repository: {
        provider: "github",
        owner: "fixture",
        name: "workspace",
        fullName: "fixture/workspace",
      },
      requestedRevision: "main",
      resolvedCommit: COMMIT,
      sourceSnapshotId: SNAPSHOT,
      requestedAt: new Date().toISOString(),
    });
    const denied = await qualifyNpmWorkspace({
      root: "/tmp/does-not-matter",
      requestId: request.requestId,
      requestDigest: request.requestDigest,
      repository: request.repository,
      resolvedCommit: COMMIT,
      sourceSnapshotId: SNAPSHOT,
      authorizationActive: true,
      targetAccessAllowed: false,
    });
    expect(denied.status).toBe("authorization_rejected");
    expect(
      denied.capabilityRoutes.find(
        (route) => route.capabilityId === "remediation.typescript.npm-workspace.private-function-delete.v1",
      )?.status,
    ).toBe("blocked_by_security");

    const root = await workspaceFixture({
      packages: {
        lib: {},
        app: { dependencies: { "@scope/lib": "1.0.0" } },
      },
      lockfile: {
        lockfileVersion: 3,
        packages: {
          "": {},
          "packages/lib": { name: "@scope/lib" },
          "packages/app": { name: "@scope/app" },
        },
      },
    });
    const ready = await qualifyNpmWorkspace({
      root,
      requestId: request.requestId,
      requestDigest: request.requestDigest,
      repository: request.repository,
      resolvedCommit: COMMIT,
      sourceSnapshotId: SNAPSHOT,
      authorizationActive: true,
      targetAccessAllowed: true,
    });
    expect(["ready", "ready_with_limited_packages"]).toContain(ready.status);
    expect(ready.remediationAuthorized).toBe(false);
    expect(ready.publicationAuthorized).toBe(false);
    expect(
      ready.capabilityRoutes.find(
        (route) => route.capabilityId === "remediation.typescript.npm-workspace.private-function-delete.v1",
      )?.status,
    ).toBe("remediation_disabled");
    expect(ready.packages.length).toBeGreaterThanOrEqual(2);
    expect(ready.graph.graphDigest).toMatch(/^[a-f0-9]{64}$/);
  });

  it("marks yarn workspaces unsupported", async () => {
    const root = await workspaceFixture({
      packages: { lib: {} },
      extraRootFiles: { "yarn.lock": "# yarn\n" },
    });
    const request = createWorkspaceQualificationRequest({
      requestId: "phase3a-yarn",
      accountScopeId: "tenant",
      authorizationId: "phase-3a-npm-monorepos-20260724-01",
      repository: {
        provider: "github",
        owner: "fixture",
        name: "yarn-workspace",
        fullName: "fixture/yarn-workspace",
      },
      requestedRevision: "main",
      resolvedCommit: COMMIT,
      sourceSnapshotId: SNAPSHOT,
      requestedAt: new Date().toISOString(),
    });
    const result = await qualifyNpmWorkspace({
      root,
      requestId: request.requestId,
      requestDigest: request.requestDigest,
      repository: request.repository,
      resolvedCommit: COMMIT,
      sourceSnapshotId: SNAPSHOT,
      authorizationActive: true,
      targetAccessAllowed: true,
    });
    expect(result.status).toBe("unsupported");
    expect(result.blockers).toContain("yarn_workspace_unsupported_in_phase_3a");
  });
});
