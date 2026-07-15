import { pool } from "../db/client";

export type ReviewStatus = "confirmed_dead" | "confirmed_alive" | "excluded";

export async function markReviewed(
  symbolId: string,
  status: ReviewStatus,
  reviewedBy: string,
): Promise<void> {
  const reviewer = reviewedBy.trim();
  if (!reviewer) {
    throw new Error("reviewedBy is required");
  }

  const result = await pool.query(
    `UPDATE confidence_verdicts
        SET review_status = $2,
            reviewed_by = $3,
            reviewed_at = now()
      WHERE symbol_id = $1`,
    [symbolId, status, reviewer],
  );

  if (result.rowCount === 0) {
    throw new Error(`Confidence verdict not found for symbol: ${symbolId}`);
  }
}
