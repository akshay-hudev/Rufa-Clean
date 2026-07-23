import { createHash } from "node:crypto";

import type { RepositoryAccessAuthorizer } from "../access/repository-access";
import { assertAuthorizationCurrent } from "./policy";
import type { MilestoneStore } from "./store";

export interface DraftPullRequestInput {
  owner: string;
  repository: string;
  baseBranch: string;
  baseCommitSha: string;
  branchName: string;
  title: string;
  body: string;
  patch: string;
  expectedFile: string;
}

export interface DraftPullRequestResult {
  url: string;
  branchName: string;
}

export interface DraftPullRequestGateway {
  createDraftPullRequest(input: DraftPullRequestInput): Promise<DraftPullRequestResult>;
}

function safeBranchPart(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 36) || "symbol";
}

function gatePassed(value: unknown): boolean {
  return typeof value === "object" && value !== null &&
    "status" in value && (value as { status?: unknown }).status === "passed";
}

export async function publishVerifiedDraft(input: {
  store: MilestoneStore;
  gateway: DraftPullRequestGateway;
  attemptId: string;
  baseBranch: string;
  actorIdentity: string;
  access: RepositoryAccessAuthorizer;
}): Promise<{ status: "draft_pr_created" | "already_published"; prUrl: string }> {
  const existing = await input.store.existingPublication(input.attemptId);
  if (existing?.status === "draft_pr_created" && existing.prUrl) {
    return { status: "already_published", prUrl: existing.prUrl };
  }
  const preliminary = await input.store.publicationContext(input.attemptId);
  return input.store.withFindingLock(preliminary.finding.findingId, async () => {
  const publishedWhileWaiting = await input.store.existingPublication(input.attemptId);
  if (publishedWhileWaiting?.status === "draft_pr_created" && publishedWhileWaiting.prUrl) {
    return { status: "already_published" as const, prUrl: publishedWhileWaiting.prUrl };
  }
  const context = await input.store.publicationContext(input.attemptId);
  const finding = context.finding;
  const accessRequest = {
    repository: finding.repository,
    role: "publication_target" as const,
  };
  input.access.assert({ ...accessRequest, operation: "branch_create" });
  input.access.assert({ ...accessRequest, operation: "commit_create" });
  input.access.assert({ ...accessRequest, operation: "push_non_default_branch" });
  input.access.assert({ ...accessRequest, operation: "pull_request_create" });
  input.access.assert({ ...accessRequest, operation: "publish" });
  const latestAuthorization = await input.store.latestAuthorization(finding.findingId);
  const latestDisposition = await input.store.latestDisposition(finding.findingId);
  if (context.status !== "verified") {
    throw new Error("Only a verified remediation attempt may be published");
  }
  if (finding.classification !== "candidate_dead") {
    throw new Error("Only candidate_dead findings may be published");
  }
  if (latestDisposition.decision !== "confirmed_dead") {
    throw new Error("Publication blocked: latest human disposition is not confirmed_dead");
  }
  if (latestAuthorization.id !== context.authorization.id) {
    throw new Error("Publication blocked: remediation authorization is no longer the latest action");
  }
  assertAuthorizationCurrent(latestAuthorization, finding, {
    repositoryProvider: finding.repository.provider,
    repositoryOwner: finding.repository.owner,
    repositoryName: finding.repository.name,
    commitSha: finding.commitSha,
    filePath: finding.occurrence.filePath,
    sourceSha256: finding.occurrence.sourceSha256,
    evidenceDigest: finding.evidenceDigest,
    policyVersion: finding.policyVersion,
    exactOccurrence: finding.occurrence,
  });
  if (!gatePassed(context.baseline) || !gatePassed(context.postChange)) {
    throw new Error("Publication blocked: baseline and post-change verification must pass");
  }
  const patchHash = createHash("sha256").update(context.patch).digest("hex");
  if (patchHash !== context.patchSha256) {
    throw new Error("Publication blocked: patch hash does not match persisted artifact");
  }
  if (context.changedFiles.length !== 1 || context.changedFiles[0] !== finding.occurrence.filePath) {
    throw new Error("Publication blocked: expected changed-file set is not exact");
  }
  const branchName = `dead-code/${safeBranchPart(finding.occurrence.name)}-${input.attemptId.slice(0, 8)}`;
  let result: DraftPullRequestResult;
  try {
    result = await input.gateway.createDraftPullRequest({
    owner: finding.repository.owner,
    repository: finding.repository.name,
    baseBranch: input.baseBranch,
    baseCommitSha: finding.commitSha,
    branchName,
    title: `Remove confirmed-dead ${finding.occurrence.name}`,
    body: [
      "## Summary", "",
      `Removes the human-confirmed-dead private function \`${finding.occurrence.name}\` from \`${finding.occurrence.filePath}\`.`,
      "", "## Evidence and coverage", "",
      `- finding: \`${finding.findingId}\``,
      `- evidence digest: \`${finding.evidenceDigest}\``,
      `- classification: \`${finding.classification}\``,
      `- coverage: \`${finding.coverage.status}\` (${finding.coverage.parsedFileCount}/${finding.coverage.tsconfigFileCount} parsed; ${finding.coverage.scipDocumentCount} SCIP documents)`,
      `- production references: ${finding.evidence.scip.productionReferences}`,
      `- test references: ${finding.evidence.scip.testReferences}`,
      `- textual occurrences: ${finding.evidence.textualAudit.occurrenceCount}`,
      "", "## Authorization and verification", "",
      `- remediation authorization: \`${latestAuthorization.id}\``,
      `- remediation attempt: \`${input.attemptId}\``,
      `- immutable base commit: \`${finding.commitSha}\``,
      `- patch SHA-256: \`${context.patchSha256}\``,
      "- baseline typecheck/build/test: passed (applicable checks)",
      "- post-change typecheck/build/test: passed (applicable checks)",
      "", "This pull request is intentionally a draft. DCAv2 has no automatic merge operation.",
    ].join("\n"),
    patch: context.patch,
    expectedFile: finding.occurrence.filePath,
    });
  } catch (error) {
    const failure = error instanceof Error ? error.message : String(error);
    await input.store.recordPublication({
      attemptId: input.attemptId,
      status: "failed",
      owner: finding.repository.owner,
      repository: finding.repository.name,
      baseCommitSha: finding.commitSha,
      branchName,
      failure,
      actorIdentity: input.actorIdentity,
      accountScopeId: finding.accountScopeId,
    });
    throw error;
  }
  if (result.branchName !== branchName) {
    throw new Error("Publisher returned an unexpected branch identity");
  }
  await input.store.recordPublication({
    attemptId: input.attemptId,
    status: "draft_pr_created",
    owner: finding.repository.owner,
    repository: finding.repository.name,
    baseCommitSha: finding.commitSha,
    branchName,
    prUrl: result.url,
    actorIdentity: input.actorIdentity,
    accountScopeId: finding.accountScopeId,
  });
  return { status: "draft_pr_created" as const, prUrl: result.url };
  });
}
