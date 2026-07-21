export interface BatchRemovalResult {
  status: "no_candidates" | "human_review_required" | "pr_creation_failed" | "pr_opened";
  repository: string;
  actionIds: string[];
  candidates: string[];
  rejected: unknown[];
}

/** Unreviewed and batch remediation are outside policy and fail closed. */
export async function runAdaptiveBatchRemovalPipeline(
  repositoryIdOrSlug: string,
): Promise<BatchRemovalResult> {
  void repositoryIdOrSlug;
  throw new Error(
    "Adaptive batch and unreviewed draft remediation are disabled by milestone policy.",
  );
}
