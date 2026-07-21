import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { runProcess } from "../remediation/process";
import type { GateCommandResult, GateResult } from "../remediation/types";
import type { IsolatedRunnerSession } from "../security/docker-runner";
import { allowlistedEnvironment } from "../security/environment";
import { canonicalJson, sha256 } from "./canonical";
import type { BoundAuthorization, FreshRemediationIdentity } from "./policy";
import { assertAuthorizationCurrent } from "./policy";
import type { FindingBundle } from "./types";

interface PatchInput {
  filePath: string;
  beforeSha256: string;
  afterSha256: string;
  changedContentBase64: string;
  changedFiles: string[];
}

export interface VerifiedRemediation {
  status: "verified" | "failed" | "stale";
  findingId: string;
  authorizationId: string;
  baseCommitSha: string;
  baseline: GateResult;
  postChange?: GateResult;
  patch?: string;
  patchSha256?: string;
  changedFiles?: string[];
  generator: { name: "PolyglotPiranha"; version: "0.4.8"; ruleSetVersion: "simple-top-level-function-v1" };
  failure?: string;
}

function commandResult(
  result: Awaited<ReturnType<IsolatedRunnerSession["run"]>>,
  kind: GateCommandResult["kind"],
  phase: "baseline" | "post_removal",
): GateCommandResult {
  return { ...result, kind, phase };
}

async function runChecks(
  session: IsolatedRunnerSession,
  scripts: Record<string, string>,
  phase: "baseline" | "post_removal",
): Promise<GateResult> {
  const startedAt = new Date().toISOString();
  const commands: GateCommandResult[] = [];
  const skippedChecks: string[] = [];
  const execute = async (
    kind: GateCommandResult["kind"],
    command: string,
    args: string[],
  ): Promise<boolean> => {
    const result = commandResult(await session.run(command, args), kind, phase);
    commands.push(result);
    return result.exitCode === 0 && !result.timedOut;
  };
  try {
    const typecheck = scripts.typecheck?.trim()
      ? await execute("typecheck", "npm", ["run", "typecheck"])
      : await execute("typecheck", "/workspace/node_modules/.bin/tsc", ["--noEmit", "-p", "tsconfig.json"]);
    if (!typecheck) {
      throw new Error("Type checking failed");
    }
    if (scripts.build?.trim()) {
      if (!await execute("build", "npm", ["run", "build"])) {
        throw new Error("Build failed");
      }
    } else {
      skippedChecks.push("build script unavailable");
    }
    if (scripts.test?.trim() && !scripts.test.toLowerCase().includes("no test specified")) {
      if (!await execute("test", "npm", ["test"])) {
        throw new Error("Tests failed");
      }
    } else {
      skippedChecks.push("test script unavailable");
    }
    return {
      status: "passed", packageRoot: "/workspace", commands, startedAt,
      completedAt: new Date().toISOString(), testsAvailable: commands.some((command) => command.kind === "test"),
      skippedChecks,
    };
  } catch (error) {
    return {
      status: commands.some((command) => command.exitCode !== 0) ? "failed" : "error",
      packageRoot: "/workspace", commands, startedAt, completedAt: new Date().toISOString(),
      failure: error instanceof Error ? error.message : String(error),
      testsAvailable: commands.some((command) => command.kind === "test"), skippedChecks,
    };
  }
}

async function readPatchInput(session: IsolatedRunnerSession, root: string, suffix: string): Promise<PatchInput> {
  void root;
  void suffix;
  return JSON.parse(
    await session.readTextArtifact("/workspace/.dca-output/patch-input.json"),
  ) as PatchInput;
}

async function createUnifiedPatch(
  root: string,
  filePath: string,
  originalContent: Buffer,
  changedContent: Buffer,
): Promise<string> {
  const before = join(root, "a", filePath);
  const after = join(root, "b", filePath);
  await mkdir(dirname(before), { recursive: true });
  await mkdir(dirname(after), { recursive: true });
  await writeFile(before, originalContent);
  await writeFile(after, changedContent);
  const diff = await runProcess("git", ["diff", "--no-index", "--no-prefix", "--binary", "--", `a/${filePath}`, `b/${filePath}`], {
    cwd: root,
    env: allowlistedEnvironment({ GIT_CONFIG_NOSYSTEM: "1", HOME: root }),
    timeoutMs: 30_000,
    outputLimitBytes: 2 * 1024 * 1024,
  });
  if (diff.timedOut || (diff.exitCode !== 1 && diff.exitCode !== 0) || !diff.stdout.trim()) {
    throw new Error(`Could not generate patch: ${diff.stderr || "empty diff"}`);
  }
  return diff.stdout;
}

export async function remediateInIsolation(input: {
  session: IsolatedRunnerSession;
  sourcePath: string;
  finding: FindingBundle;
  authorization: BoundAuthorization & { id: string };
  freshIdentity: FreshRemediationIdentity;
}): Promise<VerifiedRemediation> {
  const artifactRoot = await mkdtemp(join(tmpdir(), "dcav2-remediation-artifacts-"));
  const generator = { name: "PolyglotPiranha" as const, version: "0.4.8" as const, ruleSetVersion: "simple-top-level-function-v1" as const };
  let baseline: GateResult = {
    status: "error", packageRoot: "/workspace", commands: [],
    startedAt: new Date().toISOString(), completedAt: new Date().toISOString(),
    failure: "baseline did not run",
  };
  try {
    assertAuthorizationCurrent(input.authorization, input.finding, input.freshIdentity);
    const manifest = JSON.parse(await readFile(join(input.sourcePath, "package.json"), "utf8")) as { scripts?: Record<string, string> };
    const originalContent = await readFile(join(input.sourcePath, input.finding.occurrence.filePath));
    if (sha256(originalContent) !== input.finding.occurrence.sourceSha256) {
      throw new Error("stale authorization: source hash changed before baseline");
    }
    const install = await input.session.runInstall("npm", [
      "ci", "--ignore-scripts", "--include=dev", "--no-audit", "--no-fund",
    ]);
    if (install.exitCode !== 0 || install.timedOut) {
      baseline = {
        status: "failed", packageRoot: "/workspace",
        commands: [{ ...install, kind: "install", phase: "baseline" }],
        startedAt: install.startedAt, completedAt: install.completedAt,
        failure: "Dependency installation failed", testsAvailable: false,
      };
      return { status: "failed", findingId: input.finding.findingId, authorizationId: input.authorization.id, baseCommitSha: input.finding.commitSha, baseline, generator, failure: baseline.failure ?? "Dependency installation failed" };
    }
    await input.session.sealNetwork();
    baseline = await runChecks(input.session, manifest.scripts ?? {}, "baseline");
    baseline.commands.unshift({ ...install, kind: "install", phase: "baseline" });
    if (baseline.status !== "passed") {
      return { status: "failed", findingId: input.finding.findingId, authorizationId: input.authorization.id, baseCommitSha: input.finding.commitSha, baseline, generator, failure: baseline.failure ?? "Baseline verification failed" };
    }
    const transform = await input.session.run("/opt/piranha/bin/python", [
      "/opt/dcav2/scripts/piranha-remove-simple.py",
      "--file", `/workspace/${input.finding.occurrence.filePath}`,
      "--symbol", input.finding.occurrence.name,
      "--language", "typescript",
      "--shape", "top_level_function",
    ]);
    if (transform.exitCode !== 0 || transform.timedOut) {
      throw new Error(`Piranha transformation failed: ${transform.stderr || transform.stdout}`);
    }
    const transformPayload = JSON.parse(transform.stdout.trim().split(/\r?\n/).at(-1) ?? "{}") as { rewrite_count?: number; changed_paths?: string[]; generator_version?: string; rule_set_version?: string };
    if (transformPayload.rewrite_count !== 1 || transformPayload.changed_paths?.length !== 1 || transformPayload.generator_version !== generator.version || transformPayload.rule_set_version !== generator.ruleSetVersion) {
      throw new Error("Transformation did not produce exactly one expected pinned rewrite");
    }
    const emitBefore = await input.session.run("node", ["/opt/dcav2/dist/milestone/runner-entry.js", "emit-patch", input.finding.occurrence.filePath]);
    if (emitBefore.exitCode !== 0 || emitBefore.timedOut) {
      throw new Error(`Patch scope validation failed: ${emitBefore.stderr || emitBefore.stdout}`);
    }
    const beforeGates = await readPatchInput(input.session, artifactRoot, "before-gates");
    const postChange = await runChecks(input.session, manifest.scripts ?? {}, "post_removal");
    if (postChange.status !== "passed") {
      return { status: "failed", findingId: input.finding.findingId, authorizationId: input.authorization.id, baseCommitSha: input.finding.commitSha, baseline, postChange, generator, failure: postChange.failure ?? "Post-change verification failed" };
    }
    const emitAfter = await input.session.run("node", ["/opt/dcav2/dist/milestone/runner-entry.js", "emit-patch", input.finding.occurrence.filePath]);
    if (emitAfter.exitCode !== 0 || emitAfter.timedOut) {
      throw new Error(`Post-gate patch scope validation failed: ${emitAfter.stderr || emitAfter.stdout}`);
    }
    const afterGates = await readPatchInput(input.session, artifactRoot, "after-gates");
    if (canonicalJson(beforeGates) !== canonicalJson(afterGates)) {
      throw new Error("Verification commands mutated the generated patch");
    }
    if (afterGates.beforeSha256 !== input.finding.occurrence.sourceSha256 || afterGates.changedFiles.length !== 1 || afterGates.changedFiles[0] !== input.finding.occurrence.filePath) {
      throw new Error("Patch artifact is not bound to the authorized source and file scope");
    }
    const changedContent = Buffer.from(afterGates.changedContentBase64, "base64");
    if (sha256(changedContent) !== afterGates.afterSha256) {
      throw new Error("Changed content hash does not match the runner artifact");
    }
    const patch = await createUnifiedPatch(artifactRoot, input.finding.occurrence.filePath, originalContent, changedContent);
    return {
      status: "verified", findingId: input.finding.findingId,
      authorizationId: input.authorization.id, baseCommitSha: input.finding.commitSha,
      baseline, postChange, patch, patchSha256: createHash("sha256").update(patch).digest("hex"),
      changedFiles: afterGates.changedFiles, generator,
    };
  } catch (error) {
    const failure = error instanceof Error ? error.message : String(error);
    return {
      status: failure.startsWith("stale authorization") ? "stale" : "failed",
      findingId: input.finding.findingId, authorizationId: input.authorization.id,
      baseCommitSha: input.finding.commitSha, baseline, generator, failure,
    };
  } finally {
    await input.session.dispose();
    await rm(artifactRoot, { recursive: true, force: true });
  }
}
