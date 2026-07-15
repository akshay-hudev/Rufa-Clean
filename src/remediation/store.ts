import type { PoolClient } from "pg";

import { pool } from "../db/client";
import { EXPECTED_PIRANHA_VERSION, SIMPLE_RULE_SET_VERSION } from "./piranha";
import type { GateResult, RemovalCandidate } from "./types";

interface LockedVerdictRow {
  symbol_id: string;
  verdict: string;
  confidence_score: number | null;
  review_status: string;
  reviewed_by: string | null;
  reviewed_at: Date | null;
}

async function lockVerdict(
  client: PoolClient,
  candidate: RemovalCandidate,
): Promise<LockedVerdictRow> {
  const result = await client.query<LockedVerdictRow>(
    `SELECT symbol_id, verdict, confidence_score, review_status, reviewed_by, reviewed_at
       FROM confidence_verdicts
      WHERE id = $1
      FOR UPDATE`,
    [candidate.verdictId],
  );
  const verdict = result.rows[0];
  if (!verdict || verdict.symbol_id !== candidate.symbolId) {
    throw new Error("Verdict/symbol changed before removal action creation");
  }
  if (
    verdict.review_status !== "confirmed_dead" ||
    !verdict.reviewed_by?.trim() ||
    !verdict.reviewed_at
  ) {
    throw new Error("Verdict is no longer human-confirmed dead");
  }
  return verdict;
}

export async function createRemovalAction(
  candidate: RemovalCandidate,
  baseCommitSha: string,
): Promise<string> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const verdict = await lockVerdict(client, candidate);
    const attemptResult = await client.query<{ attempt_number: number }>(
      `SELECT coalesce(max(attempt_number), 0) + 1 AS attempt_number
         FROM removal_actions
        WHERE confidence_verdict_id = $1`,
      [candidate.verdictId],
    );
    const attemptNumber = Number(attemptResult.rows[0]?.attempt_number ?? 1);
    const insertResult = await client.query<{ id: string }>(
      `INSERT INTO removal_actions (
         confidence_verdict_id,
         symbol_id,
         attempt_number,
         source_verdict,
         source_confidence_score,
         source_review_status,
         confirmed_by,
         confirmed_at,
         base_commit_sha,
         generator_name,
         generator_version,
         rule_set_version
       ) VALUES ($1, $2, $3, $4, $5, 'confirmed_dead', $6, $7, $8,
                 'PolyglotPiranha', $9, $10)
       RETURNING id`,
      [
        candidate.verdictId,
        candidate.symbolId,
        attemptNumber,
        verdict.verdict,
        verdict.confidence_score,
        verdict.reviewed_by,
        verdict.reviewed_at,
        baseCommitSha,
        EXPECTED_PIRANHA_VERSION,
        SIMPLE_RULE_SET_VERSION,
      ],
    );
    const actionId = insertResult.rows[0]?.id;
    if (!actionId) {
      throw new Error("Removal action insert returned no id");
    }
    await client.query("COMMIT");
    return actionId;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function recordGenerationSuccess(
  actionId: string,
  patch: string,
  patchSha256: string,
): Promise<void> {
  await pool.query(
    `UPDATE removal_actions
        SET generated_patch = $2,
            patch_sha256 = $3,
            generated_at = now(),
            outcome_status = 'patch_generated',
            updated_at = now()
      WHERE id = $1`,
    [actionId, patch, patchSha256],
  );
}

export async function recordGenerationFailure(
  actionId: string,
  summary: string,
): Promise<void> {
  await pool.query(
    `UPDATE removal_actions
        SET outcome_status = 'generation_failed',
            outcome_summary = $2,
            finalized_at = now(),
            updated_at = now()
      WHERE id = $1`,
    [actionId, summary],
  );
}

export async function recordGateStarted(actionId: string): Promise<void> {
  await pool.query(
    `UPDATE removal_actions
        SET gate_status = 'running',
            gate_started_at = now(),
            outcome_status = 'gate_running',
            updated_at = now()
      WHERE id = $1`,
    [actionId],
  );
}

export async function recordGateResult(
  actionId: string,
  gate: GateResult,
  failureReason?: string,
): Promise<void> {
  const passed = gate.status === "passed";
  await pool.query(
    `UPDATE removal_actions
        SET gate_status = $2,
            gate_result = $3::jsonb,
            gate_started_at = $4,
            gate_completed_at = $5,
            outcome_status = $6,
            outcome_summary = $7,
            finalized_at = CASE WHEN $2 = 'passed' THEN NULL ELSE now() END,
            updated_at = now()
      WHERE id = $1`,
    [
      actionId,
      gate.status,
      JSON.stringify(gate),
      gate.startedAt,
      gate.completedAt,
      passed ? "ready_for_pr" : "human_review_required",
      passed ? null : failureReason ?? gate.failure ?? "Human review required: gate failed",
    ],
  );
}

export async function recordPullRequest(
  actionId: string,
  prUrl: string,
): Promise<void> {
  await pool.query(
    `UPDATE removal_actions
        SET pr_url = $2,
            pr_opened_at = now(),
            outcome_status = 'pr_opened',
            outcome_summary = 'Build/test gate passed and pull request opened for human review.',
            updated_at = now()
      WHERE id = $1
        AND gate_status = 'passed'`,
    [actionId, prUrl],
  );
}

export async function recordPullRequestFailure(
  actionId: string,
  summary: string,
): Promise<void> {
  await pool.query(
    `UPDATE removal_actions
        SET outcome_status = 'pr_creation_failed',
            outcome_summary = $2,
            finalized_at = now(),
            updated_at = now()
      WHERE id = $1
        AND gate_status = 'passed'`,
    [actionId, summary],
  );
}
