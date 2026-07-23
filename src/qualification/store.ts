import type { Pool, PoolClient } from "pg";

import { pool as defaultPool } from "../db/client";
import { redactAuditValue, verifyAuditChain, type AuditChainVerification } from "../milestone/audit";
import { canonicalJson, digestCanonical } from "../milestone/canonical";
import type { QualificationRequest, QualificationResult } from "./types";

function text(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required`);
  return trimmed;
}

async function appendEvent(
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
  const payload = redactAuditValue(input.payload);
  const actorIdentity = redactAuditValue(text(input.actorIdentity, "actor identity")) as string;
  const prior = await client.query<{ sequence: string; event_hash: string }>(
    `SELECT sequence::text, event_hash
       FROM phase2_qualification_events
      WHERE account_scope_id = $1
      ORDER BY sequence DESC
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
    payload,
    previousEventHash,
    actorIdentity,
    createdAt,
  });
  await client.query(
    `INSERT INTO phase2_qualification_events (
       account_scope_id, sequence, event_type, subject_type, subject_id,
       payload, previous_event_hash, event_hash, actor_identity, created_at
     ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10)`,
    [
      input.accountScopeId,
      sequence,
      input.eventType,
      input.subjectType,
      input.subjectId,
      canonicalJson(payload),
      previousEventHash,
      eventHash,
      actorIdentity,
      createdAt,
    ],
  );
}

export class Phase2QualificationStore {
  constructor(
    private readonly accountScopeId: string,
    private readonly database: Pool = defaultPool,
  ) {
    text(accountScopeId, "account scope");
  }

  private requireScope(accountScopeId: string): void {
    if (accountScopeId !== this.accountScopeId) {
      throw new Error("Tenant isolation denied cross-account qualification access");
    }
  }

  async ensureAccountScope(displayName = this.accountScopeId): Promise<void> {
    await this.database.query(
      `INSERT INTO account_scopes (id, display_name) VALUES ($1, $2)
       ON CONFLICT (id) DO NOTHING`,
      [this.accountScopeId, text(displayName, "display name")],
    );
  }

  async record(
    request: QualificationRequest,
    result: QualificationResult,
    actorIdentity: string,
  ): Promise<{ requestId: string; resultId: string }> {
    this.requireScope(request.accountScopeId);
    if (
      result.requestId !== request.requestId ||
      result.requestDigest !== request.requestDigest ||
      result.repository.fullName.toLowerCase() !== request.repository.fullName.toLowerCase() ||
      result.resolvedCommit !== request.resolvedCommit ||
      result.sourceSnapshotId !== request.sourceSnapshotId
    ) {
      throw new Error("Qualification result does not match its request");
    }
    const client = await this.database.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtext($1))",
        [`phase2:${this.accountScopeId}:${result.qualificationDigest}`],
      );
      const prior = await client.query<{ request_id: string; result_id: string }>(
        `SELECT request.id AS request_id, result.id AS result_id
           FROM phase2_qualification_results AS result
           JOIN phase2_qualification_requests AS request ON request.id = result.request_id
          WHERE result.account_scope_id = $1 AND result.qualification_digest = $2`,
        [this.accountScopeId, result.qualificationDigest],
      );
      if (prior.rows[0]) {
        await client.query("COMMIT");
        return {
          requestId: prior.rows[0].request_id,
          resultId: prior.rows[0].result_id,
        };
      }
      const requestInsert = await client.query<{ id: string }>(
        `INSERT INTO phase2_qualification_requests (
           account_scope_id, authorization_id, repository_provider,
           repository_owner, repository_name, resolved_commit,
           source_snapshot_id, request_digest, request_bundle, actor_identity
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10)
         ON CONFLICT (account_scope_id, request_digest)
         DO NOTHING
         RETURNING id`,
        [
          this.accountScopeId,
          request.authorizationId,
          request.repository.provider,
          request.repository.owner,
          request.repository.name,
          request.resolvedCommit,
          request.sourceSnapshotId,
          request.requestDigest,
          canonicalJson(request),
          text(actorIdentity, "actor identity"),
        ],
      );
      const requestId = requestInsert.rows[0]?.id ?? (
        await client.query<{ id: string }>(
          `SELECT id FROM phase2_qualification_requests
            WHERE account_scope_id = $1 AND request_digest = $2`,
          [this.accountScopeId, request.requestDigest],
        )
      ).rows[0]?.id;
      if (!requestId) throw new Error("Qualification request insert returned no id");
      const resultInsert = await client.query<{ id: string }>(
        `INSERT INTO phase2_qualification_results (
           account_scope_id, request_id, status, qualification_digest,
           result_bundle, actor_identity
         ) VALUES ($1, $2, $3, $4, $5::jsonb, $6)
         RETURNING id`,
        [
          this.accountScopeId,
          requestId,
          result.status,
          result.qualificationDigest,
          canonicalJson(result),
          text(actorIdentity, "actor identity"),
        ],
      );
      const resultId = resultInsert.rows[0]?.id;
      if (!resultId) throw new Error("Qualification result insert returned no id");
      for (const baseline of result.baseline) {
        await client.query(
          `INSERT INTO phase2_baseline_results (
             account_scope_id, qualification_result_id, gate_id,
             result_digest, result_bundle
           ) VALUES ($1, $2, $3, $4, $5::jsonb)`,
          [
            this.accountScopeId,
            resultId,
            baseline.gateId,
            baseline.resultDigest,
            canonicalJson(baseline),
          ],
        );
      }
      for (const route of result.capabilityRoutes) {
        await client.query(
          `INSERT INTO phase2_capability_routes (
             account_scope_id, qualification_result_id, capability_id,
             route_status, route_bundle
           ) VALUES ($1, $2, $3, $4, $5::jsonb)`,
          [
            this.accountScopeId,
            resultId,
            route.capabilityId,
            route.status,
            canonicalJson(route),
          ],
        );
      }
      const events: Array<[string, string, unknown]> = [
        ["qualification_requested", requestId, {
          requestDigest: request.requestDigest,
          authorizationId: request.authorizationId,
          repository: request.repository.fullName,
        }],
        ["repository_profile_selected", resultId, result.profile],
        ["configuration_validated", resultId, {
          status: result.configuration.status,
          configurationDigest: result.configuration.configurationDigest,
        }],
        ...result.tools.map((tool) => [
          tool.status === "available" ? "tool_resolved" : "tool_unavailable",
          resultId,
          { tool: tool.tool, status: tool.status, resolvedVersion: tool.resolvedVersion },
        ] as [string, string, unknown]),
        ...result.baseline.map((baseline) => [
          "baseline_gate_completed",
          resultId,
          { gateId: baseline.gateId, status: baseline.status, resultDigest: baseline.resultDigest },
        ] as [string, string, unknown]),
        ...result.capabilityRoutes.map((route) => [
          "capability_routed",
          resultId,
          route,
        ] as [string, string, unknown]),
        [
          result.status === "ready" || result.status === "ready_with_limited_gates"
            ? "qualification_completed"
            : "qualification_failed",
          resultId,
          { status: result.status, qualificationDigest: result.qualificationDigest },
        ],
      ];
      for (const [eventType, subjectId, payload] of events) {
        await appendEvent(client, {
          accountScopeId: this.accountScopeId,
          eventType,
          subjectType: eventType === "qualification_requested"
            ? "phase2_qualification_request"
            : "phase2_qualification_result",
          subjectId,
          payload,
          actorIdentity,
        });
      }
      await client.query("COMMIT");
      return { requestId, resultId };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async getResult(resultId: string): Promise<QualificationResult> {
    const result = await this.database.query<{ result_bundle: QualificationResult }>(
      `SELECT result_bundle
         FROM phase2_qualification_results
        WHERE id = $1 AND account_scope_id = $2`,
      [resultId, this.accountScopeId],
    );
    if (!result.rows[0]) throw new Error("Qualification result not found in account scope");
    return result.rows[0].result_bundle;
  }

  async auditChain(accountScopeId = this.accountScopeId) {
    this.requireScope(accountScopeId);
    const result = await this.database.query(
      `SELECT sequence, event_type, subject_type, subject_id, payload,
              previous_event_hash, event_hash, actor_identity, created_at
         FROM phase2_qualification_events
        WHERE account_scope_id = $1
        ORDER BY sequence`,
      [accountScopeId],
    );
    return result.rows;
  }

  async verifyAuditChain(accountScopeId = this.accountScopeId): Promise<AuditChainVerification> {
    return verifyAuditChain(accountScopeId, await this.auditChain(accountScopeId) as never);
  }
}
