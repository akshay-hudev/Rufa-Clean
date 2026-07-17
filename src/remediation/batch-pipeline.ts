import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

import { simpleGit } from "simple-git";

import { createPullRequest } from "../connectors/github";
import { cloneRepository } from "../indexing/clone";
import {
  loadAdaptiveRemovalCandidates,
  validateAdaptiveDraftCandidate,
} from "./eligibility";
import { combineAdaptiveGateResults, runAdaptiveNodeGate } from "./gate";
import { runSimplePiranhaRemoval } from "./piranha";
import { runProcess } from "./process";
import { auditCandidateSourceReferences, type SourceAuditResult } from "./source-audit";
import {
  createRemovalAction,
  recordGateResult,
  recordGateStarted,
  recordGenerationFailure,
  recordGenerationSuccess,
  recordPullRequest,
  recordPullRequestFailure,
} from "./store";
import type {
  GateCommandResult,
  GatePhase,
  GateResult,
  RemovalCandidate,
  RemovalValidation,
} from "./types";

const KNIP_VERSION = "6.26.0";
const KNIP_RUNNER = join(__dirname, "../../node_modules/knip/bin/knip.js");

interface ValidatedCandidate {
  candidate: RemovalCandidate;
  validation: RemovalValidation;
  audit?: SourceAuditResult;
  actionId?: string;
}

export interface RejectedBatchCandidate {
  verdictId: string;
  symbol: string;
  reason: string;
}

export interface BatchRemovalResult {
  status: "no_candidates" | "human_review_required" | "pr_creation_failed" | "pr_opened";
  repository: string;
  actionIds: string[];
  candidates: string[];
  rejected: RejectedBatchCandidate[];
  gate?: GateResult;
  patchSha256?: string;
  prUrl?: string;
  reason?: string;
  prIsDraft: true;
}

function safeBranchPart(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 36);
}

async function changedFiles(repositoryPath: string): Promise<string[]> {
  const output = await simpleGit(repositoryPath).raw(["diff", "--name-only", "--"]);
  return output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).sort();
}

function sameMembers(actual: string[], expected: string[]): boolean {
  return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}

async function verifySnapshots(
  repositoryPath: string,
  commitSha: string,
  candidates: ValidatedCandidate[],
): Promise<void> {
  for (const { candidate } of candidates) {
    if (candidate.indexedCommitSha !== commitSha) {
      throw new Error(
        `Stale verdict for ${candidate.symbolName}: indexed ${candidate.indexedCommitSha}, cloned ${commitSha}`,
      );
    }
    const absolutePath = resolve(repositoryPath, candidate.filePath);
    const relativePath = relative(repositoryPath, absolutePath);
    if (!relativePath || relativePath.startsWith("..")) {
      throw new Error(`Source path escapes repository: ${candidate.filePath}`);
    }
    const contentHash = createHash("sha256").update(await readFile(absolutePath)).digest("hex");
    if (contentHash !== candidate.indexedContentHash) {
      throw new Error(
        `Stale content for ${candidate.symbolName}: indexed ${candidate.indexedContentHash}, cloned ${contentHash}`,
      );
    }
  }
}

function gateCommandSummary(gate: GateResult): string {
  return gate.commands.map((command) => {
    const rendered = [command.command, ...command.args].join(" ");
    return `- ${command.phase ?? "gate"} / ${command.kind}: \`${rendered}\` ` +
      `(${command.durationMs} ms, exit ${command.exitCode})`;
  }).join("\n");
}

function knipFindings(stdout: string): Array<{ file: string; name: string }> {
  const parsed = JSON.parse(stdout) as {
    issues?: Array<{ file?: string; exports?: Array<{ name?: string }> }>;
  };
  const findings: Array<{ file: string; name: string }> = [];
  for (const issue of parsed.issues ?? []) {
    for (const finding of issue.exports ?? []) {
      if (issue.file && finding.name) {
        findings.push({ file: issue.file, name: finding.name });
      }
    }
  }
  return findings;
}

async function runKnipVerification(
  repositoryPath: string,
  packageRoot: string,
  candidates: ValidatedCandidate[],
  phase: GatePhase,
): Promise<GateCommandResult> {
  const env: NodeJS.ProcessEnv = { ...process.env, CI: "true" };
  delete env.npm_config_allow_scripts;
  delete env.NPM_CONFIG_ALLOW_SCRIPTS;
  const processResult = await runProcess(
    process.execPath,
    [KNIP_RUNNER, "--reporter", "json", "--include", "exports", "--no-exit-code"],
    { cwd: packageRoot, env },
  );
  const command: GateCommandResult = {
    ...processResult,
    kind: "static_analysis",
    phase,
  };
  if (command.exitCode !== 0 || command.timedOut) {
    throw Object.assign(new Error(`Knip ${phase} verification failed`), { command });
  }

  const actual = new Set(
    knipFindings(command.stdout).map((finding) => `${finding.file}\0${finding.name}`),
  );
  const expected = candidates.map(({ candidate }) => {
    const packageRelativeFile = relative(packageRoot, resolve(repositoryPath, candidate.filePath));
    return `${packageRelativeFile}\0${candidate.symbolName}`;
  });
  const invalid = phase === "baseline"
    ? expected.filter((key) => !actual.has(key))
    : expected.filter((key) => actual.has(key));
  if (invalid.length > 0) {
    const expectation = phase === "baseline" ? "present" : "removed";
    throw Object.assign(
      new Error(`Knip target verification expected ${expectation}: ${invalid.join(", ")}`),
      { command },
    );
  }
  return command;
}

async function adaptiveGateWithKnip(
  repositoryPath: string,
  sourceFiles: string[],
  candidates: ValidatedCandidate[],
  phase: GatePhase,
): Promise<GateResult> {
  const gate = await runAdaptiveNodeGate(repositoryPath, sourceFiles, phase);
  if (gate.status !== "passed") {
    return gate;
  }
  try {
    const knip = await runKnipVerification(
      repositoryPath,
      gate.packageRoot,
      candidates,
      phase,
    );
    return { ...gate, commands: [...gate.commands, knip] };
  } catch (error) {
    const command = error && typeof error === "object" && "command" in error
      ? (error as { command: GateCommandResult }).command
      : undefined;
    return {
      ...gate,
      status: command && (command.exitCode !== 0 || command.timedOut) ? "failed" : "error",
      commands: command ? [...gate.commands, command] : gate.commands,
      completedAt: new Date().toISOString(),
      failure: error instanceof Error ? error.message : String(error),
    };
  }
}

async function recordForAll(
  candidates: ValidatedCandidate[],
  operation: (actionId: string) => Promise<void>,
): Promise<void> {
  await Promise.all(candidates.map(({ actionId }) => {
    if (!actionId) {
      throw new Error("Removal action was not created");
    }
    return operation(actionId);
  }));
}

export async function runAdaptiveBatchRemovalPipeline(
  repositoryIdOrSlug: string,
): Promise<BatchRemovalResult> {
  const loaded = await loadAdaptiveRemovalCandidates(repositoryIdOrSlug);
  const rejected: RejectedBatchCandidate[] = [];
  const validated: ValidatedCandidate[] = [];
  for (const candidate of loaded) {
    try {
      validated.push({ candidate, validation: validateAdaptiveDraftCandidate(candidate) });
    } catch (error) {
      rejected.push({
        verdictId: candidate.verdictId,
        symbol: candidate.symbolName,
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }
  if (validated.length === 0) {
    return {
      status: "no_candidates",
      repository: repositoryIdOrSlug,
      actionIds: [],
      candidates: [],
      rejected,
      reason: "No direct Knip unused-export candidate passed adaptive eligibility",
      prIsDraft: true,
    };
  }

  const first = validated[0]!.candidate;
  if (validated.some(({ candidate }) => candidate.repositoryId !== first.repositoryId)) {
    throw new Error("Adaptive batch candidates must belong to one repository");
  }
  let clone: Awaited<ReturnType<typeof cloneRepository>> | undefined;
  let generationRecorded = false;
  try {
    clone = await cloneRepository({
      vcs_provider: first.vcsProvider,
      org_slug: first.orgSlug,
      repo_slug: first.repoSlug,
      default_branch: first.defaultBranch,
    });
    await verifySnapshots(clone.localPath, clone.commitSha, validated);
    for (const item of validated) {
      item.audit = await auditCandidateSourceReferences(
        clone.localPath,
        item.candidate,
        item.validation,
      );
      item.actionId = await createRemovalAction(item.candidate, clone.commitSha, item.validation);
    }
    const actionIds = validated.map(({ actionId }) => actionId!);
    const sourceFiles = [...new Set(validated.map(({ candidate }) => candidate.filePath))].sort();

    await recordForAll(validated, recordGateStarted);
    const baseline = await adaptiveGateWithKnip(
      clone.localPath,
      sourceFiles,
      validated,
      "baseline",
    );
    if (baseline.status !== "passed") {
      const gate = combineAdaptiveGateResults(baseline, {
        ...baseline,
        commands: [],
        startedAt: baseline.completedAt,
        completedAt: baseline.completedAt,
        failure: "Post-removal gate not run because baseline failed",
      });
      await recordForAll(validated, (actionId) =>
        recordGateResult(actionId, gate, gate.failure));
      return {
        status: "human_review_required",
        repository: `${first.orgSlug}/${first.repoSlug}`,
        actionIds,
        candidates: validated.map(({ candidate }) => candidate.symbolName),
        rejected,
        gate,
        ...(gate.failure ? { reason: gate.failure } : {}),
        prIsDraft: true,
      };
    }

    const branch = `dead-code/knip-batch-${safeBranchPart(first.repoSlug)}-${actionIds[0]!.slice(0, 8)}`;
    const git = simpleGit(clone.localPath);
    await git.checkoutLocalBranch(branch);
    for (const { candidate, validation } of validated) {
      await runSimplePiranhaRemoval(
        clone.localPath,
        candidate.filePath,
        candidate.symbolName,
        validation.language,
        { shape: validation.shape },
      );
    }
    const actualChangedFiles = await changedFiles(clone.localPath);
    if (!sameMembers(actualChangedFiles, sourceFiles)) {
      throw new Error(
        `Batch removal changed unexpected files: ${actualChangedFiles.join(", ") || "none"}`,
      );
    }
    const patch = await git.raw(["diff", "--binary", "--", ...sourceFiles]);
    if (!patch.trim()) {
      throw new Error("Piranha produced an empty batch patch");
    }
    const patchSha256 = createHash("sha256").update(patch).digest("hex");
    await recordForAll(validated, (actionId) =>
      recordGenerationSuccess(actionId, patch, patchSha256));
    generationRecorded = true;

    const postRemoval = await adaptiveGateWithKnip(
      clone.localPath,
      sourceFiles,
      validated,
      "post_removal",
    );
    let gate = combineAdaptiveGateResults(baseline, postRemoval);
    if (gate.status === "passed") {
      const postFiles = await changedFiles(clone.localPath);
      const patchAfterGate = await git.raw(["diff", "--binary", "--", ...sourceFiles]);
      if (
        !sameMembers(postFiles, sourceFiles) ||
        createHash("sha256").update(patchAfterGate).digest("hex") !== patchSha256
      ) {
        gate = {
          ...gate,
          status: "error",
          completedAt: new Date().toISOString(),
          failure: "Gate commands changed the generated batch patch",
        };
      }
    }
    await recordForAll(validated, (actionId) =>
      recordGateResult(actionId, gate, gate.failure));
    if (gate.status !== "passed") {
      return {
        status: "human_review_required",
        repository: `${first.orgSlug}/${first.repoSlug}`,
        actionIds,
        candidates: validated.map(({ candidate }) => candidate.symbolName),
        rejected,
        gate,
        patchSha256,
        ...(gate.failure ? { reason: gate.failure } : {}),
        prIsDraft: true,
      };
    }

    await git.addConfig("user.name", process.env.REMEDIATION_GIT_NAME ?? "Rufa Clean Bot");
    await git.addConfig(
      "user.email",
      process.env.REMEDIATION_GIT_EMAIL ?? "rufa-clean[bot]@users.noreply.github.com",
    );
    await git.add(sourceFiles);
    await git.commit(`Remove ${validated.length} Knip-confirmed unused exports`);
    await clone.pushBranch(branch);

    const auditLines = validated.map(({ candidate, actionId, audit }) =>
      `- \`${candidate.symbolName}\`: verdict \`${candidate.verdictId}\`, action \`${actionId}\`, ` +
        `source occurrences ${audit?.sourceOccurrences}, files audited ${audit?.checkedFiles}`,
    );
    try {
      const prUrl = await createPullRequest({
        owner: first.orgSlug,
        repo: first.repoSlug,
        title: `Draft: remove ${validated.length} Knip-confirmed unused exports`,
        body: [
          "## Summary",
          "",
          `Removes ${validated.length} exports directly reported unused by Knip and corroborated by the repository graph and source audit.`,
          "",
          "## Safety evidence",
          "",
          ...auditLines,
          `- indexed/base commit: \`${clone.commitSha}\``,
          `- patch SHA-256: \`${patchSha256}\``,
          `- Knip verifier: \`${KNIP_VERSION}\``,
          `- verification tier: **${gate.verificationTier}**`,
          `- tests available: **${gate.testsAvailable ? "yes" : "no"}**`,
          ...(gate.skippedChecks?.length ? [`- unavailable checks: ${gate.skippedChecks.join(", ")}`] : []),
          "",
          "## Baseline and post-removal commands actually executed",
          "",
          gateCommandSummary(gate),
          "",
          "This pull request is intentionally a draft and is never auto-merged. Human review is the final step.",
        ].join("\n"),
        head: branch,
        base: first.defaultBranch,
        draft: true,
      });
      await recordForAll(validated, (actionId) => recordPullRequest(actionId, prUrl, true));
      return {
        status: "pr_opened",
        repository: `${first.orgSlug}/${first.repoSlug}`,
        actionIds,
        candidates: validated.map(({ candidate }) => candidate.symbolName),
        rejected,
        gate,
        patchSha256,
        prUrl,
        prIsDraft: true,
      };
    } catch (error) {
      const summary = error instanceof Error ? error.message : String(error);
      await recordForAll(validated, (actionId) => recordPullRequestFailure(actionId, summary));
      return {
        status: "pr_creation_failed",
        repository: `${first.orgSlug}/${first.repoSlug}`,
        actionIds,
        candidates: validated.map(({ candidate }) => candidate.symbolName),
        rejected,
        gate,
        patchSha256,
        reason: summary,
        prIsDraft: true,
      };
    }
  } catch (error) {
    const summary = error instanceof Error ? error.message : String(error);
    if (!generationRecorded) {
      await Promise.all(validated.flatMap(({ actionId }) =>
        actionId ? [recordGenerationFailure(actionId, summary)] : []));
    }
    throw error;
  } finally {
    await clone?.cleanup();
  }
}
