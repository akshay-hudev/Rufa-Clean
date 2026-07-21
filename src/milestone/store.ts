import type { Pool, PoolClient } from "pg";

import { pool as defaultPool } from "../db/client";
import { canonicalJson, digestCanonical } from "./canonical";
import { assertDispositionAllowed, bindingForFinding, type BoundAuthorization } from "./policy";
import type {
  AuthorizationDecision,
  CanonicalAnalysisResult,
  FindingBundle,
  HumanDisposition,
} from "./types";
import type { VerifiedRemediation } from "./remediate";

interface FindingRow {
  finding_bundle: FindingBundle;
}

interface ReviewRow {
  id: string;
  decision: HumanDisposition;
  finding_id: string;
  evidence_digest: string;
  policy_version: string;
  commit_sha: string;
  source_sha256: string;
  exact_occurrence: unknown;
}

interface AuthorizationRow {
  id: string;
  decision: AuthorizationDecision;
  finding_id: string;
  repository_provider: string;
  repository_owner: string;
  repository_name: string;
  commit_sha: string;
  source_sha256: string;
  evidence_digest: string;
  policy_version: string;
  exact_occurrence: unknown;
}

async function appendAudit(
  client: PoolClient,
  input: {
    accountScopeId: string;
    eventType: string;
    subjectType: string;
    subjectId: string;
    payload: unknown;
    actorIdentity: string;
  },
): Promise<void> {
  const scope = await client.query<{ id: string }>(
    "SELECT id FROM account_scopes WHERE id = $1 FOR UPDATE",
    [input.accountScopeId],
  );
  if (!scope.rows[0]) {
    throw new Error(`Audit account scope does not exist: ${input.accountScopeId}`);
  }
  const prior = await client.query<{ sequence: string; event_hash: string }>(
    `SELECT sequence::text, event_hash
       FROM milestone_audit_events
      WHERE account_scope_id = $1
      ORDER BY milestone_audit_events.sequence DESC
      LIMIT 1`,
    [input.accountScopeId],
  );
  const sequence = Number(prior.rows[0]?.sequence ?? 0) + 1;
  const previousEventHash = prior.rows[0]?.event_hash ?? null;
  const createdAt = new Date().toISOString();
  const eventHash = digestCanonical({
    accountScopeId: input.accountScopeId,
    sequence,
    eventType: input.eventType,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    payload: input.payload,
    previousEventHash,
    actorIdentity: input.actorIdentity,
    createdAt,
  });
  await client.query(
    `INSERT INTO milestone_audit_events (
       account_scope_id, sequence, event_type, subject_type, subject_id,
       payload, previous_event_hash, event_hash, actor_identity, created_at
     ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10)`,
    [
      input.accountScopeId, sequence, input.eventType, input.subjectType, input.subjectId,
      canonicalJson(input.payload), previousEventHash, eventHash, input.actorIdentity, createdAt,
    ],
  );
}

function requireText(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label} is required`);
  }
  return trimmed;
}

export class MilestoneStore {
  constructor(private readonly database: Pool = defaultPool) {}

  async ensureAccountScope(id: string, displayName = id): Promise<void> {
    await this.database.query(
      `INSERT INTO account_scopes (id, display_name) VALUES ($1, $2)
       ON CONFLICT (id) DO NOTHING`,
      [requireText(id, "account scope"), requireText(displayName, "display name")],
    );
  }

  async recordAnalysis(
    result: CanonicalAnalysisResult,
    actorIdentity: string,
  ): Promise<string> {
    const client = await this.database.connect();
    try {
      await client.query("BEGIN");
      const canonicalResult = canonicalJson(result);
      const run = await client.query<{ id: string }>(
        `INSERT INTO analysis_runs (
           account_scope_id, repository_provider, repository_owner, repository_name,
           commit_sha, policy_version, status, canonical_result, result_sha256
         ) VALUES ($1, $2, $3, $4, $5, $6, 'succeeded', $7::jsonb, $8)
         RETURNING id`,
        [
          result.accountScopeId, result.repository.provider, result.repository.owner,
          result.repository.name, result.commitSha, result.policyVersion,
          canonicalResult, digestCanonical(result),
        ],
      );
      const runId = run.rows[0]?.id;
      if (!runId) {
        throw new Error("Analysis run insert returned no id");
      }
      for (const analyzer of result.analyzerRuns) {
        await client.query(
          `INSERT INTO analyzer_runs (
             analysis_run_id, analyzer, analyzer_version, configuration,
             status, failure, artifact_sha256
           ) VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7)`,
          [runId, analyzer.analyzer, analyzer.version, canonicalJson(analyzer.configuration), analyzer.status, analyzer.failure ?? null, analyzer.artifactSha256 ?? null],
        );
      }
      await client.query(
        `INSERT INTO run_coverage (analysis_run_id, status, coverage_bundle)
         VALUES ($1, $2, $3::jsonb)`,
        [runId, result.coverage.status, canonicalJson(result.coverage)],
      );
      for (const finding of result.findings) {
        const findingInsert = await client.query(
          `INSERT INTO milestone_findings (
             finding_id, analysis_run_id, account_scope_id, repository_provider,
             repository_owner, repository_name, commit_sha, file_path, source_sha256,
             evidence_digest, policy_version, classification, finding_bundle
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb)
           ON CONFLICT (finding_id) DO NOTHING`,
          [
            finding.findingId, runId, finding.accountScopeId, finding.repository.provider,
            finding.repository.owner, finding.repository.name, finding.commitSha,
            finding.occurrence.filePath, finding.occurrence.sourceSha256,
            finding.evidenceDigest, finding.policyVersion, finding.classification,
            canonicalJson(finding),
          ],
        );
        if ((findingInsert.rowCount ?? 0) === 0) {
          const existingFinding = await client.query<FindingRow>(
            "SELECT finding_bundle FROM milestone_findings WHERE finding_id = $1",
            [finding.findingId],
          );
          if (canonicalJson(existingFinding.rows[0]?.finding_bundle) !== canonicalJson(finding)) {
            throw new Error(`Finding identity collision or non-determinism: ${finding.findingId}`);
          }
        }
      }
      await appendAudit(client, {
        accountScopeId: result.accountScopeId,
        eventType: "analysis_recorded",
        subjectType: "analysis_run",
        subjectId: runId,
        payload: { resultSha256: digestCanonical(result), findings: result.findings.map((finding) => finding.findingId) },
        actorIdentity: requireText(actorIdentity, "actor identity"),
      });
      await client.query("COMMIT");
      return runId;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async recordAnalysisFailure(input: {
    accountScopeId: string;
    repositoryProvider: "github";
    repositoryOwner: string;
    repositoryName: string;
    commitSha: string;
    policyVersion: string;
    analyzer: string;
    analyzerVersion: string;
    failure: string;
    actorIdentity: string;
  }): Promise<string> {
    const client = await this.database.connect();
    try {
      await client.query("BEGIN");
      const canonical = {
        schemaVersion: "1",
        accountScopeId: input.accountScopeId,
        repository: { provider: input.repositoryProvider, owner: input.repositoryOwner, name: input.repositoryName },
        commitSha: input.commitSha,
        policyVersion: input.policyVersion,
        coverage: { status: "failed", explanation: input.failure },
        findings: [],
      };
      const inserted = await client.query<{ id: string }>(
        `INSERT INTO analysis_runs (
           account_scope_id, repository_provider, repository_owner, repository_name,
           commit_sha, policy_version, status, canonical_result, result_sha256, failure
         ) VALUES ($1, $2, $3, $4, $5, $6, 'failed', $7::jsonb, $8, $9)
         RETURNING id`,
        [input.accountScopeId, input.repositoryProvider, input.repositoryOwner, input.repositoryName, input.commitSha, input.policyVersion, canonicalJson(canonical), digestCanonical(canonical), input.failure],
      );
      const runId = inserted.rows[0]?.id;
      if (!runId) {
        throw new Error("Failed analysis run insert returned no id");
      }
      await client.query(
        `INSERT INTO analyzer_runs (
           analysis_run_id, analyzer, analyzer_version, configuration, status, failure
         ) VALUES ($1, $2, $3, '{}'::jsonb, 'failed', $4)`,
        [runId, input.analyzer, input.analyzerVersion, input.failure],
      );
      await client.query(
        `INSERT INTO run_coverage (analysis_run_id, status, coverage_bundle)
         VALUES ($1, 'failed', $2::jsonb)`,
        [runId, canonicalJson(canonical.coverage)],
      );
      await appendAudit(client, {
        accountScopeId: input.accountScopeId,
        eventType: "analysis_failed",
        subjectType: "analysis_run",
        subjectId: runId,
        payload: { analyzer: input.analyzer, failure: input.failure },
        actorIdentity: input.actorIdentity,
      });
      await client.query("COMMIT");
      return runId;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async getAnalysisRun(runId: string): Promise<unknown> {
    const result = await this.database.query(
      `SELECT id, account_scope_id, repository_provider, repository_owner,
              repository_name, commit_sha, policy_version, status,
              canonical_result, result_sha256, failure, created_at
         FROM analysis_runs WHERE id = $1`,
      [runId],
    );
    if (!result.rows[0]) {
      throw new Error(`Analysis run not found: ${runId}`);
    }
    return result.rows[0];
  }

  async getFinding(findingId: string): Promise<FindingBundle> {
    const result = await this.database.query<FindingRow>(
      "SELECT finding_bundle FROM milestone_findings WHERE finding_id = $1",
      [findingId],
    );
    const finding = result.rows[0]?.finding_bundle;
    if (!finding) {
      throw new Error(`Finding not found: ${findingId}`);
    }
    return finding;
  }

  async listFindings(accountScopeId: string): Promise<FindingBundle[]> {
    const result = await this.database.query<FindingRow>(
      `SELECT finding_bundle FROM milestone_findings
        WHERE account_scope_id = $1
        ORDER BY created_at DESC, finding_id`,
      [accountScopeId],
    );
    return result.rows.map((row) => row.finding_bundle);
  }

  async recordDisposition(input: {
    findingId: string;
    decision: HumanDisposition;
    actorIdentity: string;
    rationale: string;
  }): Promise<string> {
    const finding = await this.getFinding(input.findingId);
    assertDispositionAllowed(finding, input.decision);
    const binding = bindingForFinding(finding);
    const client = await this.database.connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [finding.findingId]);
      const inserted = await client.query<{ id: string }>(
        `INSERT INTO human_review_decisions (
           finding_id, account_scope_id, repository_provider, repository_owner,
           repository_name, commit_sha, exact_occurrence, source_sha256,
           evidence_digest, policy_version, decision, actor_identity, rationale
         ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, $12, $13)
         RETURNING id`,
        [
          finding.findingId, finding.accountScopeId, binding.repositoryProvider,
          binding.repositoryOwner, binding.repositoryName, binding.commitSha,
          canonicalJson(binding.exactOccurrence), binding.sourceSha256,
          binding.evidenceDigest, binding.policyVersion, input.decision,
          requireText(input.actorIdentity, "actor identity"), requireText(input.rationale, "rationale"),
        ],
      );
      const id = inserted.rows[0]?.id;
      if (!id) {
        throw new Error("Review decision insert returned no id");
      }
      await appendAudit(client, {
        accountScopeId: finding.accountScopeId,
        eventType: "human_disposition_recorded",
        subjectType: "review_decision",
        subjectId: id,
        payload: { findingId: finding.findingId, decision: input.decision, evidenceDigest: finding.evidenceDigest },
        actorIdentity: input.actorIdentity,
      });
      await client.query("COMMIT");
      return id;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async recordAuthorization(input: {
    findingId: string;
    decision: AuthorizationDecision;
    actorIdentity: string;
    rationale: string;
  }): Promise<string> {
    const finding = await this.getFinding(input.findingId);
    const binding = bindingForFinding(finding);
    const client = await this.database.connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [finding.findingId]);
      const reviewResult = await client.query<ReviewRow>(
        `SELECT id, decision, finding_id, evidence_digest, policy_version, commit_sha,
                source_sha256, exact_occurrence
           FROM human_review_decisions
          WHERE finding_id = $1
          ORDER BY created_at DESC, id DESC
          LIMIT 1`,
        [input.findingId],
      );
      const review = reviewResult.rows[0];
      if (!review) {
        throw new Error("Remediation authorization requires a human disposition");
      }
      if (input.decision === "approved_for_remediation" && review.decision !== "confirmed_dead") {
        throw new Error("Remediation approval requires the latest disposition to be confirmed_dead");
      }
      if (
        review.finding_id !== binding.findingId ||
        review.evidence_digest !== binding.evidenceDigest ||
        review.policy_version !== binding.policyVersion ||
        review.commit_sha !== binding.commitSha ||
        review.source_sha256 !== binding.sourceSha256 ||
        canonicalJson(review.exact_occurrence) !== canonicalJson(binding.exactOccurrence)
      ) {
        throw new Error("Latest human disposition is stale for the finding");
      }
      const inserted = await client.query<{ id: string }>(
        `INSERT INTO remediation_authorizations (
           finding_id, review_decision_id, account_scope_id, repository_provider,
           repository_owner, repository_name, commit_sha, exact_occurrence,
           source_sha256, evidence_digest, policy_version, decision, actor_identity, rationale
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11, $12, $13, $14)
         RETURNING id`,
        [
          finding.findingId, review.id, finding.accountScopeId, binding.repositoryProvider,
          binding.repositoryOwner, binding.repositoryName, binding.commitSha,
          canonicalJson(binding.exactOccurrence), binding.sourceSha256,
          binding.evidenceDigest, binding.policyVersion, input.decision,
          requireText(input.actorIdentity, "actor identity"), requireText(input.rationale, "rationale"),
        ],
      );
      const id = inserted.rows[0]?.id;
      if (!id) {
        throw new Error("Authorization insert returned no id");
      }
      await appendAudit(client, {
        accountScopeId: finding.accountScopeId,
        eventType: "remediation_authorization_recorded",
        subjectType: "remediation_authorization",
        subjectId: id,
        payload: { findingId: finding.findingId, decision: input.decision, reviewDecisionId: review.id },
        actorIdentity: input.actorIdentity,
      });
      await client.query("COMMIT");
      return id;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async latestAuthorization(findingId: string): Promise<(BoundAuthorization & { id: string })> {
    const result = await this.database.query<AuthorizationRow>(
      `SELECT id, decision, finding_id, repository_provider, repository_owner,
              repository_name, commit_sha, source_sha256, evidence_digest,
              policy_version, exact_occurrence
         FROM remediation_authorizations
        WHERE finding_id = $1
        ORDER BY created_at DESC, id DESC
        LIMIT 1`,
      [findingId],
    );
    const row = result.rows[0];
    if (!row) {
      throw new Error("No remediation authorization exists for the finding");
    }
    return {
      id: row.id,
      findingId: row.finding_id,
      repositoryProvider: row.repository_provider,
      repositoryOwner: row.repository_owner,
      repositoryName: row.repository_name,
      commitSha: row.commit_sha,
      sourceSha256: row.source_sha256,
      evidenceDigest: row.evidence_digest,
      policyVersion: row.policy_version,
      exactOccurrence: row.exact_occurrence,
      decision: row.decision,
    };
  }

  async latestDisposition(findingId: string): Promise<{ id: string; decision: HumanDisposition }> {
    const result = await this.database.query<{ id: string; decision: HumanDisposition }>(
      `SELECT id, decision
         FROM human_review_decisions
        WHERE finding_id = $1
        ORDER BY created_at DESC, id DESC
        LIMIT 1`,
      [findingId],
    );
    const row = result.rows[0];
    if (!row) {
      throw new Error("No human disposition exists for the finding");
    }
    return row;
  }

  async recordRemediation(result: VerifiedRemediation, actorIdentity: string): Promise<string> {
    const finding = await this.getFinding(result.findingId);
    const idempotencyKey = digestCanonical({
      findingId: result.findingId,
      authorizationId: result.authorizationId,
      baseCommitSha: result.baseCommitSha,
      status: result.status,
      patchSha256: result.patchSha256 ?? null,
    });
    const existing = await this.database.query<{ id: string }>(
      "SELECT id FROM remediation_attempts WHERE idempotency_key = $1",
      [idempotencyKey],
    );
    if (existing.rows[0]) {
      return existing.rows[0].id;
    }
    const client = await this.database.connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [result.findingId]);
      if (result.status === "verified") {
        const current = await client.query<{ id: string; decision: AuthorizationDecision }>(
          `SELECT id, decision
             FROM remediation_authorizations
            WHERE finding_id = $1
            ORDER BY created_at DESC, id DESC
            LIMIT 1`,
          [result.findingId],
        );
        if (
          current.rows[0]?.id !== result.authorizationId ||
          current.rows[0]?.decision !== "approved_for_remediation"
        ) {
          throw new Error("Verified remediation cannot be recorded after authorization changed");
        }
        const currentReview = await client.query<{ decision: HumanDisposition }>(
          `SELECT decision
             FROM human_review_decisions
            WHERE finding_id = $1
            ORDER BY created_at DESC, id DESC
            LIMIT 1`,
          [result.findingId],
        );
        if (currentReview.rows[0]?.decision !== "confirmed_dead") {
          throw new Error("Verified remediation cannot be recorded after human disposition changed");
        }
      }
      const attempt = await client.query<{ id: string }>(
        `INSERT INTO remediation_attempts (
           finding_id, authorization_id, idempotency_key, status, base_commit_sha, failure
         ) VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [result.findingId, result.authorizationId, idempotencyKey, result.status, result.baseCommitSha, result.failure ?? null],
      );
      const attemptId = attempt.rows[0]?.id;
      if (!attemptId) {
        throw new Error("Remediation attempt insert returned no id");
      }
      await client.query(
        `INSERT INTO verification_results (remediation_attempt_id, phase, status, result_bundle)
         VALUES ($1, 'baseline', $2, $3::jsonb)`,
        [attemptId, result.baseline.status, canonicalJson(result.baseline)],
      );
      if (result.postChange) {
        await client.query(
          `INSERT INTO verification_results (remediation_attempt_id, phase, status, result_bundle)
           VALUES ($1, 'post_change', $2, $3::jsonb)`,
          [attemptId, result.postChange.status, canonicalJson(result.postChange)],
        );
      }
      if (result.status === "verified") {
        if (!result.patch || !result.patchSha256 || !result.changedFiles) {
          throw new Error("Verified remediation is missing its patch artifact");
        }
        await client.query(
          `INSERT INTO patch_artifacts (
             remediation_attempt_id, patch_sha256, patch_content, changed_files,
             generator_name, generator_version, rule_set_version
           ) VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7)`,
          [
            attemptId, result.patchSha256, result.patch, canonicalJson(result.changedFiles),
            result.generator.name, result.generator.version, result.generator.ruleSetVersion,
          ],
        );
      }
      await appendAudit(client, {
        accountScopeId: finding.accountScopeId,
        eventType: "remediation_attempt_recorded",
        subjectType: "remediation_attempt",
        subjectId: attemptId,
        payload: { findingId: result.findingId, authorizationId: result.authorizationId, status: result.status, patchSha256: result.patchSha256 ?? null },
        actorIdentity: requireText(actorIdentity, "actor identity"),
      });
      await client.query("COMMIT");
      return attemptId;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async publicationContext(attemptId: string): Promise<{
    attemptId: string;
    status: string;
    finding: FindingBundle;
    authorization: BoundAuthorization & { id: string };
    patch: string;
    patchSha256: string;
    changedFiles: string[];
    baseline: unknown;
    postChange: unknown;
  }> {
    const result = await this.database.query<{
      status: string;
      finding_bundle: FindingBundle;
      authorization_id: string;
      authorization_decision: AuthorizationDecision;
      repository_provider: string;
      repository_owner: string;
      repository_name: string;
      authorization_commit_sha: string;
      authorization_source_sha256: string;
      evidence_digest: string;
      policy_version: string;
      exact_occurrence: unknown;
      patch_content: string;
      patch_sha256: string;
      changed_files: string[];
      baseline: unknown;
      post_change: unknown;
    }>(
      `SELECT attempt.status,
              finding.finding_bundle,
              auth.id AS authorization_id,
              auth.decision AS authorization_decision,
              auth.repository_provider,
              auth.repository_owner,
              auth.repository_name,
              auth.commit_sha AS authorization_commit_sha,
              auth.source_sha256 AS authorization_source_sha256,
              auth.evidence_digest,
              auth.policy_version,
              auth.exact_occurrence,
              patch.patch_content,
              patch.patch_sha256,
              patch.changed_files,
              baseline.result_bundle AS baseline,
              post_change.result_bundle AS post_change
         FROM remediation_attempts AS attempt
         JOIN milestone_findings AS finding ON finding.finding_id = attempt.finding_id
         JOIN remediation_authorizations AS auth ON auth.id = attempt.authorization_id
         JOIN patch_artifacts AS patch ON patch.remediation_attempt_id = attempt.id
         JOIN verification_results AS baseline
           ON baseline.remediation_attempt_id = attempt.id AND baseline.phase = 'baseline'
         JOIN verification_results AS post_change
           ON post_change.remediation_attempt_id = attempt.id AND post_change.phase = 'post_change'
        WHERE attempt.id = $1`,
      [attemptId],
    );
    const row = result.rows[0];
    if (!row) {
      throw new Error(`Verified remediation attempt not found: ${attemptId}`);
    }
    return {
      attemptId,
      status: row.status,
      finding: row.finding_bundle,
      authorization: {
        id: row.authorization_id,
        findingId: row.finding_bundle.findingId,
        repositoryProvider: row.repository_provider,
        repositoryOwner: row.repository_owner,
        repositoryName: row.repository_name,
        commitSha: row.authorization_commit_sha,
        sourceSha256: row.authorization_source_sha256,
        evidenceDigest: row.evidence_digest,
        policyVersion: row.policy_version,
        exactOccurrence: row.exact_occurrence,
        decision: row.authorization_decision,
      },
      patch: row.patch_content,
      patchSha256: row.patch_sha256,
      changedFiles: row.changed_files,
      baseline: row.baseline,
      postChange: row.post_change,
    };
  }

  async getRemediationAttempt(attemptId: string): Promise<unknown> {
    const result = await this.database.query(
      `SELECT attempt.id, attempt.finding_id, attempt.authorization_id,
              attempt.status, attempt.base_commit_sha, attempt.failure, attempt.created_at,
              coalesce(
                jsonb_agg(
                  jsonb_build_object(
                    'phase', verification.phase,
                    'status', verification.status,
                    'result', verification.result_bundle
                  ) ORDER BY verification.phase
                ) FILTER (WHERE verification.id IS NOT NULL),
                '[]'::jsonb
              ) AS verification,
              patch.patch_sha256,
              patch.changed_files,
              publication.status AS publication_status,
              publication.pr_url
         FROM remediation_attempts AS attempt
         LEFT JOIN verification_results AS verification ON verification.remediation_attempt_id = attempt.id
         LEFT JOIN patch_artifacts AS patch ON patch.remediation_attempt_id = attempt.id
         LEFT JOIN pull_request_publications AS publication ON publication.remediation_attempt_id = attempt.id
        WHERE attempt.id = $1
        GROUP BY attempt.id, patch.id, publication.id`,
      [attemptId],
    );
    if (!result.rows[0]) {
      throw new Error(`Remediation attempt not found: ${attemptId}`);
    }
    return result.rows[0];
  }

  async existingPublication(attemptId: string): Promise<{ status: string; prUrl: string | null } | undefined> {
    const result = await this.database.query<{ status: string; pr_url: string | null }>(
      `SELECT status, pr_url
         FROM pull_request_publications
        WHERE remediation_attempt_id = $1
        ORDER BY (status = 'draft_pr_created') DESC, created_at DESC, id DESC
        LIMIT 1`,
      [attemptId],
    );
    const row = result.rows[0];
    return row ? { status: row.status, prUrl: row.pr_url } : undefined;
  }

  async recordPublication(input: {
    attemptId: string;
    status: "draft_pr_created" | "failed";
    owner: string;
    repository: string;
    baseCommitSha: string;
    branchName?: string;
    prUrl?: string;
    failure?: string;
    actorIdentity: string;
    accountScopeId: string;
  }): Promise<void> {
    const idempotencyKey = digestCanonical({
      attemptId: input.attemptId,
      owner: input.owner,
      repository: input.repository,
      status: input.status,
      branchName: input.branchName ?? null,
      prUrl: input.prUrl ?? null,
      failure: input.failure ?? null,
    });
    const client = await this.database.connect();
    try {
      await client.query("BEGIN");
      const inserted = await client.query(
        `INSERT INTO pull_request_publications (
           remediation_attempt_id, idempotency_key, status, repository_provider,
           repository_owner, repository_name, base_commit_sha, branch_name, pr_url, failure
         ) VALUES ($1, $2, $3, 'github', $4, $5, $6, $7, $8, $9)
         ON CONFLICT (idempotency_key) DO NOTHING`,
        [input.attemptId, idempotencyKey, input.status, input.owner, input.repository, input.baseCommitSha, input.branchName ?? null, input.prUrl ?? null, input.failure ?? null],
      );
      if ((inserted.rowCount ?? 0) > 0) {
        await appendAudit(client, {
          accountScopeId: input.accountScopeId,
          eventType: "draft_pr_publication_recorded",
          subjectType: "remediation_attempt",
          subjectId: input.attemptId,
          payload: { status: input.status, branchName: input.branchName ?? null, prUrl: input.prUrl ?? null, failure: input.failure ?? null },
          actorIdentity: requireText(input.actorIdentity, "actor identity"),
        });
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async auditChain(accountScopeId: string): Promise<unknown[]> {
    const result = await this.database.query(
      `SELECT sequence, event_type, subject_type, subject_id, payload,
              previous_event_hash, event_hash, actor_identity, created_at
         FROM milestone_audit_events
        WHERE account_scope_id = $1
        ORDER BY sequence`,
      [accountScopeId],
    );
    return result.rows;
  }

  async withFindingLock<T>(findingId: string, operation: () => Promise<T>): Promise<T> {
    const client = await this.database.connect();
    try {
      await client.query("SELECT pg_advisory_lock(hashtext($1))", [findingId]);
      return await operation();
    } finally {
      await client.query("SELECT pg_advisory_unlock(hashtext($1))", [findingId]);
      client.release();
    }
  }
}
