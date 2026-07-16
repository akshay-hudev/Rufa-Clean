import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";

import { simpleGit } from "simple-git";

import { createPullRequest } from "../connectors/github";
import { cloneRepository } from "../indexing/clone";
import { loadRemovalCandidate, validateSimpleCandidate } from "./eligibility";
import { humanReviewFallback } from "./fallback";
import { runRemovalGate } from "./gate";
import { runSimplePiranhaRemoval } from "./piranha";
import {
  createRemovalAction,
  recordGateResult,
  recordGateStarted,
  recordGenerationFailure,
  recordGenerationSuccess,
  recordPullRequest,
  recordPullRequestFailure,
} from "./store";
import type { GateResult } from "./types";

export interface RemovalPipelineResult {
  actionId: string;
  status: "human_review_required" | "pr_creation_failed" | "pr_opened";
  patchSha256?: string;
  prUrl?: string;
  reason?: string;
  automatedRepairAttempted?: false;
  prOpened?: false;
  gate: GateResult;
}

function safeBranchPart(value: string): string {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return normalized.slice(0, 40) || "symbol";
}

async function changedFiles(repositoryPath: string): Promise<string[]> {
  const output = await simpleGit(repositoryPath).raw(["diff", "--name-only", "--"]);
  return output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function requireOnlyExpectedFile(files: string[], expectedFile: string): void {
  if (files.length !== 1 || files[0] !== expectedFile) {
    throw new Error(
      `Simple removal must change only ${expectedFile}; changed files: ` +
        (files.join(", ") || "none"),
    );
  }
}

function gateSummary(gate: GateResult): string {
  return gate.commands
    .map((command) => {
      const rendered = [command.command, ...command.args].join(" ");
      return `- ${command.kind}: \`${rendered}\` (${command.durationMs} ms, exit ${command.exitCode})`;
    })
    .join("\n");
}

export async function runSimpleRemovalPipeline(
  verdictId: string,
): Promise<RemovalPipelineResult> {
  const candidate = await loadRemovalCandidate(verdictId);
  const piranhaLanguage = validateSimpleCandidate(candidate);
  let actionId: string | undefined;
  let clone: Awaited<ReturnType<typeof cloneRepository>> | undefined;
  let generationRecorded = false;
  let gate: GateResult | undefined;

  try {
    clone = await cloneRepository({
      vcs_provider: candidate.vcsProvider,
      org_slug: candidate.orgSlug,
      repo_slug: candidate.repoSlug,
      default_branch: candidate.defaultBranch,
    });
    actionId = await createRemovalAction(candidate, clone.commitSha, piranhaLanguage);
    if (clone.commitSha !== candidate.indexedCommitSha) {
      throw new Error(
        `Stale verdict: indexed commit ${candidate.indexedCommitSha}, ` +
          `cloned commit ${clone.commitSha}`,
      );
    }
    const absoluteSourcePath = resolve(clone.localPath, candidate.filePath);
    const relativeSourcePath = relative(clone.localPath, absoluteSourcePath);
    if (relativeSourcePath.startsWith("..") || relativeSourcePath === "") {
      throw new Error(`Source path escapes repository: ${candidate.filePath}`);
    }
    const clonedContentHash = createHash("sha256")
      .update(await readFile(absoluteSourcePath))
      .digest("hex");
    if (clonedContentHash !== candidate.indexedContentHash) {
      throw new Error(
        `Stale verdict: indexed content ${candidate.indexedContentHash}, ` +
          `cloned content ${clonedContentHash}`,
      );
    }

    const branch = `dead-code/${safeBranchPart(candidate.symbolName)}-${actionId.slice(0, 8)}`;
    const git = simpleGit(clone.localPath);
    await git.checkoutLocalBranch(branch);

    await runSimplePiranhaRemoval(
      clone.localPath,
      candidate.filePath,
      candidate.symbolName,
      piranhaLanguage,
    );
    requireOnlyExpectedFile(await changedFiles(clone.localPath), candidate.filePath);
    const patch = await git.raw(["diff", "--binary", "--", candidate.filePath]);
    if (!patch.trim()) {
      throw new Error("Piranha produced an empty patch");
    }
    const patchSha256 = createHash("sha256").update(patch).digest("hex");
    await recordGenerationSuccess(actionId, patch, patchSha256);
    generationRecorded = true;

    await recordGateStarted(actionId);
    gate = await runRemovalGate(clone.localPath, candidate.filePath, piranhaLanguage);
    if (gate.status === "passed") {
      try {
        requireOnlyExpectedFile(await changedFiles(clone.localPath), candidate.filePath);
        const patchAfterGate = await git.raw(["diff", "--binary", "--", candidate.filePath]);
        const hashAfterGate = createHash("sha256").update(patchAfterGate).digest("hex");
        if (hashAfterGate !== patchSha256) {
          throw new Error("Gate commands changed the generated patch");
        }
      } catch (error) {
        gate = {
          ...gate,
          status: "error",
          failure: error instanceof Error ? error.message : String(error),
          completedAt: new Date().toISOString(),
        };
      }
    }
    const fallback = humanReviewFallback(gate);
    await recordGateResult(actionId, gate, fallback?.reason);
    if (fallback) {
      return { actionId, patchSha256, gate, ...fallback };
    }

    await git.addConfig("user.name", process.env.REMEDIATION_GIT_NAME ?? "DCA Remediation Bot");
    await git.addConfig(
      "user.email",
      process.env.REMEDIATION_GIT_EMAIL ?? "dca-remediation[bot]@users.noreply.github.com",
    );
    await git.add([candidate.filePath]);
    await git.commit(`Remove confirmed-dead ${candidate.symbolName}`);

    try {
      await clone.pushBranch(branch);
      const prUrl = await createPullRequest({
        owner: candidate.orgSlug,
        repo: candidate.repoSlug,
        title: `Remove confirmed-dead ${candidate.symbolName}`,
        body: [
          "## Summary",
          "",
          `Removes the human-confirmed-dead \`${candidate.symbolName}\` symbol.`,
          "",
          "## Audit",
          "",
          `- confidence verdict: \`${candidate.verdictId}\``,
          `- removal action: \`${actionId}\``,
          `- confirmed by: \`${candidate.reviewedBy}\` at ${candidate.reviewedAt?.toISOString()}`,
          `- base commit: \`${clone.commitSha}\``,
          `- patch SHA-256: \`${patchSha256}\``,
          "",
          "## Gate commands actually executed",
          "",
          gateSummary(gate),
          "",
          "This pull request is intentionally not auto-merged. Human review is required.",
        ].join("\n"),
        head: branch,
        base: candidate.defaultBranch,
      });
      await recordPullRequest(actionId, prUrl);
      return { actionId, status: "pr_opened", patchSha256, prUrl, gate };
    } catch (error) {
      const summary = error instanceof Error ? error.message : String(error);
      await recordPullRequestFailure(actionId, summary);
      return { actionId, status: "pr_creation_failed", patchSha256, gate };
    }
  } catch (error) {
    const summary = error instanceof Error ? error.message : String(error);
    if (actionId && !generationRecorded) {
      await recordGenerationFailure(actionId, summary);
    }
    throw error;
  } finally {
    await clone?.cleanup();
  }
}
