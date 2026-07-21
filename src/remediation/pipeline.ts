/**
 * Quarantined compatibility entry point.
 *
 * The former implementation could turn a legacy confidence verdict into a PR
 * without a separate remediation authorization. Keeping that behavior callable
 * would violate the milestone safety policy, so callers must migrate to the
 * standalone milestone CLI.
 */
export interface RemovalPipelineResult {
  actionId: string;
  status: "human_review_required" | "pr_creation_failed" | "pr_opened";
}

export interface RemovalPipelineOptions {
  draftReview?: boolean;
}

export async function runSimpleRemovalPipeline(
  verdictId: string,
  options: RemovalPipelineOptions = {},
): Promise<RemovalPipelineResult> {
  void verdictId;
  void options;
  throw new Error(
    "Legacy confidence-verdict remediation is disabled. Use the milestone CLI with a separate confirmed_dead review and approved_for_remediation authorization.",
  );
}
