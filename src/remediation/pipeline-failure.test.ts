import { createHash } from "node:crypto";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { simpleGit } from "simple-git";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RemovalCandidate } from "./types";

const mocks = vi.hoisted(() => ({
  candidate: undefined as RemovalCandidate | undefined,
  clone: undefined as {
    localPath: string;
    commitSha: string;
    pushBranch: ReturnType<typeof vi.fn>;
    cleanup: ReturnType<typeof vi.fn>;
  } | undefined,
  createPullRequest: vi.fn(),
  recordGateResult: vi.fn(),
  recordGenerationFailure: vi.fn(),
}));

vi.mock("../connectors/github", () => ({
  createPullRequest: mocks.createPullRequest,
}));

vi.mock("../indexing/clone", () => ({
  cloneRepository: vi.fn(async () => mocks.clone),
}));

vi.mock("./eligibility", () => ({
  loadRemovalCandidate: vi.fn(async () => mocks.candidate),
  validateSimpleCandidate: vi.fn(() => "typescript"),
}));

vi.mock("./piranha", () => ({
  runSimplePiranhaRemoval: vi.fn(async (repositoryPath: string, filePath: string) => {
    await writeFile(join(repositoryPath, filePath), "");
    return {
      rewriteCount: 1,
      path: filePath,
      generatorVersion: "0.4.8",
      ruleSetVersion: "simple-top-level-function-v1",
    };
  }),
}));

vi.mock("./store", () => ({
  createRemovalAction: vi.fn(async () => "11111111-1111-4111-8111-111111111111"),
  recordGenerationSuccess: vi.fn(async () => undefined),
  recordGenerationFailure: mocks.recordGenerationFailure,
  recordGateStarted: vi.fn(async () => undefined),
  recordGateResult: mocks.recordGateResult,
  recordPullRequest: vi.fn(async () => undefined),
  recordPullRequestFailure: vi.fn(async () => undefined),
}));

import { runSimpleRemovalPipeline } from "./pipeline";

describe("runSimpleRemovalPipeline gate failure", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("falls back to human review without repair, push, or PR", async () => {
    const root = await mkdtemp(join(tmpdir(), "dca-bad-removal-"));
    await mkdir(join(root, "src"), { recursive: true });
    const originalSource = [
      "function subtleHelper() { return 'needed'; }",
      "module.exports = { subtleHelper };",
      "",
    ].join("\n");
    await writeFile(join(root, "src/helper.ts"), originalSource);
    await writeFile(
      join(root, "src/index.ts"),
      'module.exports = require("./helper.ts");\n',
    );
    await writeFile(
      join(root, "build.cjs"),
      [
        'const fs = require("node:fs");',
        'const barrel = fs.readFileSync("src/index.ts", "utf8");',
        'const helper = fs.readFileSync("src/helper.ts", "utf8");',
        'if (barrel.includes("helper.ts") && !helper.includes("function subtleHelper")) {',
        '  throw new Error("indirect barrel dependency on subtleHelper is broken");',
        '}',
        "",
      ].join("\n"),
    );
    await writeFile(
      join(root, "package.json"),
      JSON.stringify({
        name: "bad-removal-fixture",
        version: "1.0.0",
        scripts: { build: "node build.cjs", test: "node -e \"process.exit(0)\"" },
      }),
    );
    await writeFile(
      join(root, "package-lock.json"),
      JSON.stringify({
        name: "bad-removal-fixture",
        version: "1.0.0",
        lockfileVersion: 3,
        requires: true,
        packages: { "": { name: "bad-removal-fixture", version: "1.0.0" } },
      }),
    );

    const git = simpleGit(root);
    await git.init();
    await git.addConfig("user.name", "Failure Test");
    await git.addConfig("user.email", "failure-test@example.com");
    await git.add(["."]);
    await git.commit("fixture baseline");
    const commitSha = (await git.revparse(["HEAD"])).trim();
    const pushBranch = vi.fn(async () => undefined);
    const cleanup = vi.fn(async () => undefined);
    mocks.clone = { localPath: root, commitSha, pushBranch, cleanup };
    mocks.candidate = {
      verdictId: "verdict-bad-removal",
      symbolId: "symbol-subtle-helper",
      symbolName: "subtleHelper",
      qualifiedName: "subtleHelper",
      symbolKind: "function",
      isExported: false,
      filePath: "src/helper.ts",
      language: "typescript",
      indexedCommitSha: commitSha,
      indexedContentHash: createHash("sha256").update(originalSource).digest("hex"),
      repositoryId: "repository-fixture",
      vcsProvider: "github",
      orgSlug: "fixture-owner",
      repoSlug: "fixture-repo",
      defaultBranch: "main",
      automatedVerdict: "likely_dead",
      confidenceScore: 0.99,
      reviewStatus: "confirmed_dead",
      reviewedBy: "human@example.com",
      reviewedAt: new Date("2026-07-15T00:00:00Z"),
      importOrReexportReferences: 0,
      executableReferences: 0,
      importEdges: 0,
      directUnusedExportFindings: 0,
      scoreBeforeExportCap: null,
    };

    const result = await runSimpleRemovalPipeline("verdict-bad-removal");

    expect(result.status).toBe("human_review_required");
    expect(result.gate.status).toBe("failed");
    expect(result.reason).toContain("Build command failed");
    expect(result.reason).toContain("indirect barrel dependency on subtleHelper is broken");
    expect(result.automatedRepairAttempted).toBe(false);
    expect(result.prOpened).toBe(false);
    expect(pushBranch).not.toHaveBeenCalled();
    expect(mocks.createPullRequest).not.toHaveBeenCalled();
    expect(mocks.recordGateResult).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      expect.objectContaining({ status: "failed" }),
      expect.stringContaining("Human review required"),
    );
    expect(cleanup).toHaveBeenCalledOnce();
  }, 30_000);

  it("rejects a candidate when the repository commit is newer than the indexed snapshot", async () => {
    const root = await mkdtemp(join(tmpdir(), "dca-stale-removal-"));
    await mkdir(join(root, "src"), { recursive: true });
    const source = "function unusedHelper() { return 1; }\n";
    await writeFile(join(root, "src/helper.ts"), source);
    const pushBranch = vi.fn(async () => undefined);
    const cleanup = vi.fn(async () => undefined);
    mocks.clone = {
      localPath: root,
      commitSha: "current-commit",
      pushBranch,
      cleanup,
    };
    mocks.candidate = {
      verdictId: "verdict-stale",
      symbolId: "symbol-stale",
      symbolName: "unusedHelper",
      qualifiedName: "unusedHelper",
      symbolKind: "function",
      isExported: false,
      filePath: "src/helper.ts",
      language: "typescript",
      indexedCommitSha: "indexed-commit",
      indexedContentHash: createHash("sha256").update(source).digest("hex"),
      repositoryId: "repository-fixture",
      vcsProvider: "github",
      orgSlug: "fixture-owner",
      repoSlug: "fixture-repo",
      defaultBranch: "main",
      automatedVerdict: "likely_dead",
      confidenceScore: 0.99,
      reviewStatus: "confirmed_dead",
      reviewedBy: "human@example.com",
      reviewedAt: new Date("2026-07-15T00:00:00Z"),
      importOrReexportReferences: 0,
      executableReferences: 0,
      importEdges: 0,
      directUnusedExportFindings: 0,
      scoreBeforeExportCap: null,
    };

    await expect(runSimpleRemovalPipeline("verdict-stale")).rejects.toThrow(
      "Stale verdict: indexed commit indexed-commit, cloned commit current-commit",
    );

    expect(mocks.recordGenerationFailure).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      expect.stringContaining("Stale verdict"),
    );
    expect(pushBranch).not.toHaveBeenCalled();
    expect(mocks.createPullRequest).not.toHaveBeenCalled();
    expect(cleanup).toHaveBeenCalledOnce();
  });
});
