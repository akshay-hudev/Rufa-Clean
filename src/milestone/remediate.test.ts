import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ProcessResult } from "../remediation/types";
import type { IsolatedCommandResult, IsolatedRunnerSession } from "../security/docker-runner";
import { sha256 } from "./canonical";
import { bindingForFinding } from "./policy";
import { remediateInIsolation } from "./remediate";
import type { FindingBundle } from "./types";

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

function processResult(command: string, args: string[], exitCode = 0, stdout = "", stderr = ""): IsolatedCommandResult {
  return {
    command, args, cwd: "/workspace", exitCode, signal: null, stdout, stderr,
    startedAt: new Date(0).toISOString(), completedAt: new Date(0).toISOString(),
    durationMs: 1, timedOut: false, networkMode: "none",
  };
}

async function setup(): Promise<{ root: string; finding: FindingBundle; changed: Buffer }> {
  const root = await mkdtemp(join(tmpdir(), "dca-remediate-test-"));
  roots.push(root);
  await mkdir(join(root, "src"), { recursive: true });
  const original = Buffer.from("function dead() { return 1; }\n");
  const changed = Buffer.from("\n");
  await writeFile(join(root, "src/dead.ts"), original);
  await writeFile(join(root, "package.json"), JSON.stringify({ scripts: { build: "tsc", test: "node test.js" } }));
  const finding: FindingBundle = {
    schemaVersion: "1", findingId: "f".repeat(64), accountScopeId: "account",
    repository: { provider: "github", owner: "owner", name: "repo" }, commitSha: "a".repeat(40),
    packageJsonSha256: "1".repeat(64), packageLockSha256: "2".repeat(64), tsconfigSha256: "3".repeat(64),
    occurrence: {
      filePath: "src/dead.ts", name: "dead", kind: "function", shape: "function_declaration", exported: false,
      lineStart: 1, columnStart: 1, lineEnd: 1, columnEnd: 30, byteStart: 0, byteEnd: original.length - 1,
      sourceSha256: sha256(original), declarationSha256: sha256(original.subarray(0, original.length - 1)),
    },
    analyzers: [], coverage: { status: "complete_for_supported_scope", tsconfigFileCount: 1, parsedFileCount: 1, scipDocumentCount: 1, analyzedFiles: ["src/dead.ts"], excludedFiles: [], missingScipFiles: [], failedFiles: [], explanation: "complete" },
    supportingEvidence: [], counterEvidence: [], blockers: [], contradictions: [],
    evidence: {
      treeSitter: { status: "succeeded", declarationCount: 1 },
      scip: { status: "succeeded", definitionMatches: 1, productionReferences: 0, testReferences: 0, unknownReferences: 0 },
      textualAudit: { status: "succeeded", occurrenceCount: 1, checkedFiles: 1, occurrenceFiles: ["src/dead.ts"] },
    },
    classification: "candidate_dead", explanation: "dead", policyVersion: "policy-v1", evidenceDigest: "e".repeat(64),
  };
  return { root, finding, changed };
}

function fakeSession(input: {
  finding: FindingBundle;
  changed: Buffer;
  failBaselineBuild?: boolean;
  failBaselineTypecheck?: boolean;
  failBaselineTest?: boolean;
  failPostTypecheck?: boolean;
  failPostBuild?: boolean;
  failPostTest?: boolean;
  rewrites?: number;
  emitFailure?: string;
  mutateAfterGates?: boolean;
}): IsolatedRunnerSession {
  let buildCalls = 0;
  let testCalls = 0;
  let typecheckCalls = 0;
  let copies = 0;
  return {
    containerName: "fixture",
    runInstall: vi.fn(async (command, args) => processResult(command, args)),
    sealNetwork: vi.fn(async () => undefined),
    run: vi.fn(async (command, args) => {
      if (command.includes("piranha")) {
        return processResult(command, args, 0, JSON.stringify({
          rewrite_count: input.rewrites ?? 1,
          changed_paths: ["/workspace/src/dead.ts"],
          generator_version: "0.4.8",
          rule_set_version: "simple-top-level-function-v1",
        }));
      }
      if (args.includes("emit-patch")) {
        return processResult(command, args, input.emitFailure ? 1 : 0, "", input.emitFailure ?? "");
      }
      if (args.includes("build")) {
        buildCalls += 1;
        return processResult(command, args,
          input.failBaselineBuild && buildCalls === 1 || input.failPostBuild && buildCalls === 2 ? 1 : 0,
        );
      }
      if (args[0] === "test") {
        testCalls += 1;
        return processResult(command, args,
          input.failBaselineTest && testCalls === 1 || input.failPostTest && testCalls === 2 ? 1 : 0,
        );
      }
      if (command.includes("tsc")) {
        typecheckCalls += 1;
        return processResult(command, args,
          input.failBaselineTypecheck && typecheckCalls === 1 || input.failPostTypecheck && typecheckCalls === 2 ? 1 : 0,
        );
      }
      return processResult(command, args);
    }),
    readTextArtifact: vi.fn(async () => {
      copies += 1;
      const changed = input.mutateAfterGates && copies === 2 ? Buffer.from("// mutated\n") : input.changed;
      return JSON.stringify({
        filePath: input.finding.occurrence.filePath,
        beforeSha256: input.finding.occurrence.sourceSha256,
        afterSha256: sha256(changed),
        changedContentBase64: changed.toString("base64"),
        changedFiles: [input.finding.occurrence.filePath],
      });
    }),
    copyOut: vi.fn(async () => undefined),
    dispose: vi.fn(async () => undefined),
  };
}

function invocation(root: string, finding: FindingBundle, session: IsolatedRunnerSession) {
  const binding = bindingForFinding(finding);
  return {
    session, sourcePath: root, finding,
    authorization: { ...binding, id: "authorization-id", decision: "approved_for_remediation" as const },
    freshIdentity: {
      repositoryProvider: "github", repositoryOwner: "owner", repositoryName: "repo",
      commitSha: finding.commitSha, filePath: finding.occurrence.filePath,
      sourceSha256: finding.occurrence.sourceSha256, evidenceDigest: finding.evidenceDigest,
      policyVersion: finding.policyVersion, exactOccurrence: finding.occurrence,
    },
  };
}

describe("isolated remediation", () => {
  it("produces one hashed patch only after baseline and post-change checks", async () => {
    const { root, finding, changed } = await setup();
    const result = await remediateInIsolation(invocation(root, finding, fakeSession({ finding, changed })));
    expect(result.status).toBe("verified");
    expect(result.baseline.status).toBe("passed");
    expect(result.postChange?.status).toBe("passed");
    expect(result.changedFiles).toEqual(["src/dead.ts"]);
    expect(result.patchSha256).toBe(sha256(result.patch!));
  });

  it("stops before transformation when baseline build fails", async () => {
    const { root, finding, changed } = await setup();
    const session = fakeSession({ finding, changed, failBaselineBuild: true });
    const result = await remediateInIsolation(invocation(root, finding, session));
    expect(result.status).toBe("failed");
    expect(result.baseline.status).toBe("failed");
    expect(vi.mocked(session.run).mock.calls.some(([command]) => String(command).includes("piranha"))).toBe(false);
  });

  it("blocks publication artifacts on post-change failure", async () => {
    const { root, finding, changed } = await setup();
    const result = await remediateInIsolation(invocation(root, finding, fakeSession({ finding, changed, failPostTest: true })));
    expect(result.status).toBe("failed");
    expect(result.postChange?.status).toBe("failed");
    expect(result.patch).toBeUndefined();
  });

  it("fails closed for every baseline and post-change verification phase", async () => {
    for (const options of [
      { failBaselineTypecheck: true },
      { failBaselineTest: true },
      { failPostTypecheck: true },
      { failPostBuild: true },
    ]) {
      const { root, finding, changed } = await setup();
      const result = await remediateInIsolation(invocation(root, finding, fakeSession({ finding, changed, ...options })));
      expect(result.status).toBe("failed");
      expect(result.patch).toBeUndefined();
    }
  });

  it("rejects zero rewrites, unexpected files, and patch mutation", async () => {
    for (const options of [
      { rewrites: 0 },
      { rewrites: 2 },
      { emitFailure: "Unexpected changed files: src/other.ts" },
      { mutateAfterGates: true },
    ]) {
      const { root, finding, changed } = await setup();
      const result = await remediateInIsolation(invocation(root, finding, fakeSession({ finding, changed, ...options })));
      expect(result.status).toBe("failed");
      expect(result.patch).toBeUndefined();
    }
  });

  it("rejects stale authorization before installation", async () => {
    const { root, finding, changed } = await setup();
    const session = fakeSession({ finding, changed });
    const input = invocation(root, finding, session);
    input.freshIdentity.sourceSha256 = "0".repeat(64);
    const result = await remediateInIsolation(input);
    expect(result.status).toBe("stale");
    expect(session.runInstall).not.toHaveBeenCalled();
  });
});
