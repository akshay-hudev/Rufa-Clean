import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

import type { MilestoneStore } from "./store";
import { publishVerifiedDraft, type DraftPullRequestGateway } from "./publisher";
import type { FindingBundle } from "./types";

function setup() {
  const patch = "diff --git a/src/dead.ts b/src/dead.ts\n";
  const finding = {
    findingId: "f".repeat(64), accountScopeId: "account",
    repository: { provider: "github", owner: "owner", name: "repo" },
    commitSha: "a".repeat(40), classification: "candidate_dead",
    occurrence: { filePath: "src/dead.ts", name: "dead", sourceSha256: "s".repeat(64) },
    evidenceDigest: "e".repeat(64), policyVersion: "policy-v1",
    coverage: { status: "complete_for_supported_scope", parsedFileCount: 1, tsconfigFileCount: 1, scipDocumentCount: 1 },
    evidence: { scip: { productionReferences: 0, testReferences: 0 }, textualAudit: { occurrenceCount: 1 } },
  } as unknown as FindingBundle;
  const authorization = {
    id: "authorization-id", findingId: finding.findingId, repositoryProvider: "github",
    repositoryOwner: "owner", repositoryName: "repo", commitSha: finding.commitSha,
    exactOccurrence: finding.occurrence, sourceSha256: finding.occurrence.sourceSha256,
    evidenceDigest: finding.evidenceDigest, policyVersion: finding.policyVersion,
    decision: "approved_for_remediation" as const,
  };
  const store = {
    existingPublication: vi.fn(async () => undefined),
    publicationContext: vi.fn(async () => ({
      attemptId: "attempt-id", status: "verified", finding, authorization, patch,
      patchSha256: createHash("sha256").update(patch).digest("hex"), changedFiles: ["src/dead.ts"],
      baseline: { status: "passed" }, postChange: { status: "passed" },
    })),
    latestAuthorization: vi.fn(async () => authorization),
    latestDisposition: vi.fn(async () => ({ id: "review-id", decision: "confirmed_dead" as const })),
    recordPublication: vi.fn(async () => undefined),
    withFindingLock: vi.fn(async (_findingId: string, operation: () => Promise<unknown>) => operation()),
  } as unknown as MilestoneStore;
  const gateway: DraftPullRequestGateway = {
    createDraftPullRequest: vi.fn(async (input) => ({ url: "https://github.test/pr/1", branchName: input.branchName })),
  };
  return { store, gateway, finding, authorization };
}

describe("trusted publisher", () => {
  it("creates only a draft after independent persisted-state validation", async () => {
    const { store, gateway } = setup();
    const result = await publishVerifiedDraft({ store, gateway, attemptId: "attempt-id", baseBranch: "main", actorIdentity: "operator" });
    expect(result.status).toBe("draft_pr_created");
    expect(gateway.createDraftPullRequest).toHaveBeenCalledWith(expect.objectContaining({ baseBranch: "main", expectedFile: "src/dead.ts" }));
    expect(vi.mocked(gateway.createDraftPullRequest).mock.calls[0]?.[0].body).toContain("no automatic merge operation");
  });

  it("is idempotent after successful publication", async () => {
    const { store, gateway } = setup();
    vi.mocked(store.existingPublication).mockResolvedValue({ status: "draft_pr_created", prUrl: "https://github.test/pr/1" });
    const result = await publishVerifiedDraft({ store, gateway, attemptId: "attempt-id", baseBranch: "main", actorIdentity: "operator" });
    expect(result.status).toBe("already_published");
    expect(gateway.createDraftPullRequest).not.toHaveBeenCalled();
  });

  it("blocks revoked authorization and tampered patches", async () => {
    const revoked = setup();
    vi.mocked(revoked.store.latestAuthorization).mockResolvedValue({ ...revoked.authorization, decision: "revoked" });
    await expect(publishVerifiedDraft({ store: revoked.store, gateway: revoked.gateway, attemptId: "attempt-id", baseBranch: "main", actorIdentity: "operator" })).rejects.toThrow(/not active/);

    const tampered = setup();
    const context = await tampered.store.publicationContext("attempt-id");
    vi.mocked(tampered.store.publicationContext).mockResolvedValue({ ...context, patchSha256: "0".repeat(64) });
    await expect(publishVerifiedDraft({ store: tampered.store, gateway: tampered.gateway, attemptId: "attempt-id", baseBranch: "main", actorIdentity: "operator" })).rejects.toThrow(/patch hash/);
  });

  it("blocks publication when the latest human disposition is no longer confirmed_dead", async () => {
    const changed = setup();
    vi.mocked(changed.store.latestDisposition).mockResolvedValue({ id: "new-review", decision: "confirmed_alive" });
    await expect(publishVerifiedDraft({ store: changed.store, gateway: changed.gateway, attemptId: "attempt-id", baseBranch: "main", actorIdentity: "operator" })).rejects.toThrow(/latest human disposition/);
    expect(changed.gateway.createDraftPullRequest).not.toHaveBeenCalled();
  });
});
