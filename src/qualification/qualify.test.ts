import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { digestCanonical } from "../milestone/canonical";
import {
  canonicalRepositoryIdentity,
  createQualificationRequest,
  markQualificationStale,
  qualificationIsFresh,
  qualifyRepository,
} from "./qualify";
import {
  PHASE_2_CAPABILITY_IDS,
  type BaselineGateResult,
  type ConfigurationSource,
  type ToolRequirement,
} from "./types";

const roots: string[] = [];
const commit = "a".repeat(40);
const snapshot = "b".repeat(64);
const configuration: ConfigurationSource[] = [{
  authority: "repository_profile" as const,
  value: {
    schemaVersion: "1",
    sourceRoots: ["src"],
    testRoots: ["test"],
    generatedRoots: ["generated"],
    excludedRoots: ["node_modules"],
    requiredGates: ["typecheck", "build", "test"],
    optionalGates: [],
    networkProfile: "network-disabled",
    runnerProfile: "isolated-typescript-runner",
  },
}];
const tools: ToolRequirement[] = [
  {
    tool: "node", requiredRange: "22.x", resolvedVersion: "22.18.0",
    executable: "/usr/local/bin/node", source: "approved_runner", status: "available",
  },
  {
    tool: "npm", requiredRange: "10.x-11.x", resolvedVersion: "10.9.3",
    executable: "/usr/local/bin/npm", source: "approved_runner", status: "available",
  },
  {
    tool: "typescript", requiredRange: "5.9.3", resolvedVersion: "5.9.3",
    executable: "/workspace/node_modules/.bin/tsc", source: "project_local", status: "available",
  },
];

function gate(gateId: BaselineGateResult["gateId"], overrides: Partial<BaselineGateResult> = {}): BaselineGateResult {
  const material = {
    gateId,
    commandId: `qualification.${gateId}.v1`,
    status: "passed" as const,
    exitCode: 0,
    outputTruncated: false,
    sourceModified: false,
    cleanupStatus: "removed" as const,
    ...overrides,
  };
  return { ...material, resultDigest: digestCanonical(material) };
}
const baseline = [gate("typecheck"), gate("build"), gate("test")];

function request(repository = {
  provider: "github" as const,
  owner: "eligible-owner",
  name: "qualified",
  fullName: "eligible-owner/qualified",
}) {
  return createQualificationRequest({
    schemaVersion: "1",
    requestId: "qualification-request-1",
    accountScopeId: "tenant-phase-2",
    authorizationId: "phase-2-qualification-and-configuration-20260723-01",
    repository,
    requestedRevision: "main",
    resolvedCommit: commit,
    sourceSnapshotId: snapshot,
    requestedCapabilities: [...PHASE_2_CAPABILITY_IDS],
    requestedProfileId: "typescript-single-package-npm-v1",
    requestedAt: "2026-07-23T17:11:22Z",
  });
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function fixture(overrides: {
  manifest?: Record<string, unknown>;
  lock?: Record<string, unknown> | null;
  tsconfig?: boolean;
  files?: Record<string, string>;
  rootFiles?: Record<string, string>;
} = {}): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "dcav2-phase2-qualification-"));
  roots.push(root);
  const manifest = {
    name: "qualified",
    version: "1.0.0",
    packageManager: "npm@10.9.3",
    scripts: {
      typecheck: "tsc --noEmit -p tsconfig.json",
      build: "tsc -p tsconfig.json",
      test: "node test.js",
    },
    devDependencies: { typescript: "5.9.3" },
    ...overrides.manifest,
  };
  const lock = overrides.lock === null ? undefined : {
    name: "qualified",
    version: "1.0.0",
    lockfileVersion: 3,
    packages: {
      "": { name: "qualified", version: "1.0.0" },
      "node_modules/typescript": { version: "5.9.3" },
    },
    ...overrides.lock,
  };
  await mkdir(join(root, "src"), { recursive: true });
  await mkdir(join(root, "test"), { recursive: true });
  await mkdir(join(root, "generated"), { recursive: true });
  await writeFile(join(root, "package.json"), JSON.stringify(manifest));
  if (lock) await writeFile(join(root, "package-lock.json"), JSON.stringify(lock));
  if (overrides.tsconfig !== false) {
    await writeFile(join(root, "tsconfig.json"), JSON.stringify({ include: ["src/**/*.ts"] }));
  }
  const files = {
    "src/main.ts": "export const live = 1;\n",
    "test/main.test.ts": "import '../src/main';\n",
    "generated/client.ts": "// generated file\nexport const client = 1;\n",
    ...overrides.files,
  };
  for (const [path, content] of Object.entries(files)) {
    const absolute = join(root, path);
    await mkdir(dirname(absolute), { recursive: true });
    await writeFile(absolute, content);
  }
  for (const [path, content] of Object.entries(overrides.rootFiles ?? {})) {
    await writeFile(join(root, path), content);
  }
  return root;
}

async function qualify(root: string, overrides: Partial<Parameters<typeof qualifyRepository>[0]> = {}) {
  return qualifyRepository({
    repositoryPath: root,
    request: request(),
    authorizationActive: true,
    targetAccessAllowed: true,
    configurationSources: configuration,
    tools,
    baseline,
    ...overrides,
  });
}

describe("Phase 2 qualification request and identity", () => {
  it("normalizes identity and creates a deterministic request digest", () => {
    const first = request();
    const second = request();
    expect(first).toEqual(second);
    expect(first.requestDigest).toMatch(/^[a-f0-9]{64}$/);
    expect(canonicalRepositoryIdentity({
      provider: "GITHUB", owner: "owner", name: "repo", fullName: "OWNER/REPO",
    }).fullName).toBe("owner/repo");
  });

  it.each([
    { provider: "gitlab", owner: "owner", name: "repo" },
    { provider: "github", owner: "", name: "repo" },
    { provider: "github", owner: "owner", name: "repo", fullName: "wrong/repo" },
  ])("rejects malformed or mismatched identity %#", (identity) => {
    expect(() => canonicalRepositoryIdentity(identity)).toThrow(/canonical_repository|identity/);
  });

  it("rejects Rufa-Clean before touching the requested source path", async () => {
    const result = await qualifyRepository({
      repositoryPath: "/path/that/must/not/be/read",
      request: request({
        provider: "github",
        owner: "akshay-hudev",
        name: "Rufa-Clean",
        fullName: "akshay-hudev/Rufa-Clean",
      }),
      authorizationActive: true,
      targetAccessAllowed: true,
      configurationSources: configuration,
      tools,
      baseline,
    });
    expect(result.status).toBe("authorization_rejected");
    expect(result.blockers).toContain("permanent_repository_role_exclusion");
  });

  it("fails closed for inactive authorization or denied target access", async () => {
    const root = await fixture();
    expect((await qualify(root, { authorizationActive: false })).status).toBe("authorization_rejected");
    expect((await qualify(root, { targetAccessAllowed: false })).status).toBe("authorization_rejected");
  });
});

describe("Phase 2 repository detection and routing", () => {
  it("returns a deterministic ready result with attributable detection and structured mappings", async () => {
    const root = await fixture();
    const first = await qualify(root);
    const second = await qualify(root);
    expect(first.status, first.blockers.join(", ")).toBe("ready");
    expect(first).toEqual(second);
    expect(first.languages).toEqual(expect.arrayContaining([
      expect.objectContaining({ language: "typescript", support: "supported" }),
    ]));
    expect(first.packageManager).toEqual(expect.objectContaining({
      manager: "npm", lockfileVersion: 3, support: "supported",
    }));
    expect(first.workspace.support).toBe("single_package_supported");
    expect(first.roots.filter((root) => root.required).every((root) => root.exists)).toBe(true);
    expect(first.commandObservations.every((command) => command.trustStatus === "untrusted")).toBe(true);
    expect(first.commandMappings.map((command) => command.executable)).toEqual([
      "/workspace/node_modules/.bin/tsc",
      "/usr/local/bin/npm",
      "/usr/local/bin/npm",
    ]);
    expect(first.capabilityRoutes.every((route) => route.status === "enabled")).toBe(true);
    expect(first.qualificationDigest).toMatch(/^[a-f0-9]{64}$/);
  });

  it.each([
    [{ manifest: { workspaces: ["packages/*"] } }, "workspace_profile_not_supported"],
    [{ rootFiles: { "pnpm-lock.yaml": "lockfileVersion: 9" } }, "package_manager_ambiguous"],
    [{ lock: { lockfileVersion: 2 } }, "package_manager_unsupported"],
    [{ tsconfig: false }, "root_typescript_configuration_missing"],
    [{ files: { "src/main.ts": "", "src/main.py": "print('x')" } }, undefined],
  ] as const)("detects unsupported or mixed profiles without false readiness %#", async (overrides, reason) => {
    const result = await qualify(await fixture(overrides as Parameters<typeof fixture>[0]));
    if (reason) {
      expect(result.status).toBe("unsupported");
      expect(result.profile.reasons).toContain(reason);
    } else {
      expect(result.languages.some((language) => language.language === "python")).toBe(true);
    }
  });

  it("returns configuration-required for missing approved command mappings", async () => {
    const root = await fixture({ manifest: { scripts: { typecheck: "tsc" } } });
    const result = await qualify(root);
    expect(result.status).toBe("configuration_required");
    expect(result.blockers).toEqual(expect.arrayContaining(["missing_mapping:build", "missing_mapping:test"]));
  });

  it("preserves baseline failures, optional limitations, and security failures", async () => {
    const root = await fixture();
    const failed = await qualify(root, {
      baseline: [gate("typecheck"), gate("build", { status: "failed", exitCode: 1 }), gate("test")],
    });
    expect(failed.status).toBe("baseline_broken");
    expect(failed.capabilityRoutes.find(
      (route) => route.capabilityId === "repository.baseline.evaluate.v1",
    )?.status).toBe("blocked_by_baseline");
    expect(failed.capabilityRoutes.find(
      (route) => route.capabilityId === "repository.identity.validate.v1",
    )?.status).toBe("enabled_with_limits");

    const security = await qualify(root, {
      baseline: [gate("typecheck", { sourceModified: true }), gate("build"), gate("test")],
    });
    expect(security.status).toBe("security_blocked");

    const limitedConfiguration: ConfigurationSource[] = [{
      ...configuration[0]!,
      value: { ...configuration[0]!.value, optionalGates: ["test"], requiredGates: ["typecheck", "build"] },
    }];
    const limited = await qualify(root, {
      configurationSources: limitedConfiguration,
      baseline: [gate("typecheck"), gate("build"), gate("test", { status: "unavailable" })],
    });
    expect(limited.status).toBe("ready_with_limited_gates");
  });

  it("rejects symbolic-link escapes", async () => {
    const root = await fixture();
    await symlink(tmpdir(), join(root, "src", "escape"));
    const result = await qualify(root);
    expect(result.status).toBe("security_blocked");
    expect(result.blockers.some((blocker) => blocker.startsWith("symlink_escape"))).toBe(true);
  });

  it("enforces qualification freshness inputs", async () => {
    const result = await qualify(await fixture());
    expect(qualificationIsFresh(result, {
      requestDigest: result.requestDigest,
      sourceSnapshotId: result.sourceSnapshotId,
      configurationDigest: result.configuration.configurationDigest,
      runnerProfile: "isolated-typescript-runner",
    })).toBe(true);
    expect(qualificationIsFresh(result, {
      requestDigest: "0".repeat(64),
      sourceSnapshotId: result.sourceSnapshotId,
      configurationDigest: result.configuration.configurationDigest,
      runnerProfile: "isolated-typescript-runner",
    })).toBe(false);
    const stale = markQualificationStale(result, ["source_snapshot_changed"]);
    expect(stale.status).toBe("stale");
    expect(stale.blockers).toContain("source_snapshot_changed");
    expect(stale.capabilityRoutes.every((route) => route.status === "stale")).toBe(true);
    expect(stale.qualificationDigest).not.toBe(result.qualificationDigest);
  });

  it("keeps discovered shell text as a digest-only untrusted observation", async () => {
    const root = await fixture({
      manifest: {
        scripts: {
          typecheck: "echo DO-NOT-EXECUTE && exit 99",
          build: "touch /tmp/phase2-command-must-not-run",
          test: "cat /etc/passwd",
        },
      },
    });
    const result = await qualify(root);
    expect(result.status).toBe("ready");
    expect(JSON.stringify(result.commandObservations)).not.toContain("DO-NOT-EXECUTE");
    expect(result.commandObservations.every((observation) =>
      /^[a-f0-9]{64}$/.test(observation.observationDigest)
    )).toBe(true);
  });

  it("reports missing or untrusted toolchains as unsupported", async () => {
    const result = await qualify(await fixture(), {
      tools: tools.map((tool) =>
        tool.tool === "typescript"
          ? { ...tool, executable: "/usr/bin/tsc", status: "security_blocked" as const }
          : tool
      ),
    });
    expect(result.status).toBe("unsupported");
    expect(result.profile.reasons).toContain("required_toolchain_unavailable");
  });
});
