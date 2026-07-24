import type { Pool, PoolClient } from "pg";

import { pool as defaultPool } from "../db/client";
import {
  redactAuditValue,
  verifyAuditChain,
  type AuditChainVerification,
} from "../milestone/audit";
import { canonicalJson, digestCanonical } from "../milestone/canonical";
import type { WorkspaceQualificationResult } from "./types";

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
    sequence: number;
    previousEventHash: string | null;
  },
): Promise<string> {
  const payload = redactAuditValue(input.payload);
  const actorIdentity = redactAuditValue(text(input.actorIdentity, "actor identity")) as string;
  const createdAt = new Date().toISOString();
  const eventHash = digestCanonical({
    accountScopeId: input.accountScopeId,
    sequence: input.sequence,
    eventType: input.eventType,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    payload,
    previousEventHash: input.previousEventHash,
    actorIdentity,
    createdAt,
  });
  await client.query(
    `INSERT INTO phase3a_workspace_events (
       account_scope_id, sequence, event_type, subject_type, subject_id,
       payload, previous_event_hash, event_hash, actor_identity, created_at
     ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10)`,
    [
      input.accountScopeId,
      input.sequence,
      input.eventType,
      input.subjectType,
      input.subjectId,
      canonicalJson(payload),
      input.previousEventHash,
      eventHash,
      actorIdentity,
      createdAt,
    ],
  );
  return eventHash;
}

async function nextEventCursor(
  client: PoolClient,
  accountScopeId: string,
): Promise<{ sequence: number; previousEventHash: string | null }> {
  await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
    `phase3a-events:${accountScopeId}`,
  ]);
  const prior = await client.query<{ sequence: string; event_hash: string }>(
    `SELECT COALESCE(MAX(sequence), 0)::text AS sequence,
            (
              SELECT event_hash
                FROM phase3a_workspace_events
               WHERE account_scope_id = $1
               ORDER BY sequence DESC
               LIMIT 1
            ) AS event_hash
       FROM phase3a_workspace_events
      WHERE account_scope_id = $1`,
    [accountScopeId],
  );
  const maxSequence = Number(prior.rows[0]?.sequence ?? 0);
  return {
    sequence: maxSequence + 1,
    previousEventHash: prior.rows[0]?.event_hash ?? null,
  };
}

export class Phase3aWorkspaceStore {
  constructor(
    private readonly accountScopeId: string,
    private readonly database: Pool = defaultPool,
  ) {
    text(accountScopeId, "account scope");
  }

  async persistQualification(input: {
    authorizationId: string;
    actorIdentity: string;
    requestDigest: string;
    result: WorkspaceQualificationResult;
  }): Promise<{ resultId: string }> {
    const client = await this.database.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO account_scopes (id, display_name) VALUES ($1, $2)
         ON CONFLICT (id) DO NOTHING`,
        [this.accountScopeId, this.accountScopeId],
      );
      const existingRequest = await client.query<{ id: string }>(
        `SELECT id
           FROM phase3a_workspace_requests
          WHERE account_scope_id = $1 AND request_digest = $2`,
        [this.accountScopeId, input.requestDigest],
      );
      let requestId = existingRequest.rows[0]?.id;
      if (!requestId) {
        const request = await client.query<{ id: string }>(
          `INSERT INTO phase3a_workspace_requests (
             account_scope_id, authorization_id, repository_provider, repository_owner,
             repository_name, resolved_commit, source_snapshot_id, request_digest,
             request_bundle, actor_identity
           ) VALUES ($1,$2,'github',$3,$4,$5,$6,$7,$8::jsonb,$9)
           RETURNING id`,
          [
            this.accountScopeId,
            text(input.authorizationId, "authorization"),
            input.result.repository.owner,
            input.result.repository.name,
            input.result.resolvedCommit,
            input.result.sourceSnapshotId,
            input.requestDigest,
            canonicalJson({
              requestId: input.result.requestId,
              requestDigest: input.requestDigest,
              repository: input.result.repository,
            }),
            text(input.actorIdentity, "actor"),
          ],
        );
        requestId = request.rows[0]?.id;
      }
      if (!requestId) throw new Error("phase3a workspace request insert failed");
      const existing = await client.query<{ id: string }>(
        `SELECT id
           FROM phase3a_workspace_results
          WHERE account_scope_id = $1 AND qualification_digest = $2`,
        [this.accountScopeId, input.result.qualificationDigest],
      );
      if (existing.rows[0]?.id) {
        await client.query("COMMIT");
        return { resultId: existing.rows[0].id };
      }
      const result = await client.query<{ id: string }>(
        `INSERT INTO phase3a_workspace_results (
           account_scope_id, request_id, status, qualification_digest, result_bundle, actor_identity
         ) VALUES ($1,$2,$3,$4,$5::jsonb,$6)
         RETURNING id`,
        [
          this.accountScopeId,
          requestId,
          input.result.status,
          input.result.qualificationDigest,
          canonicalJson(input.result),
          text(input.actorIdentity, "actor"),
        ],
      );
      const resultId = result.rows[0]?.id;
      if (!resultId) throw new Error("phase3a workspace result insert failed");
      for (const pkg of input.result.packages) {
        await client.query(
          `INSERT INTO phase3a_workspace_packages (
             account_scope_id, qualification_result_id, package_identity_digest, package_bundle
           ) VALUES ($1,$2,$3,$4::jsonb)
           ON CONFLICT (qualification_result_id, package_identity_digest) DO NOTHING`,
          [
            this.accountScopeId,
            resultId,
            pkg.identity.packageIdentityDigest,
            canonicalJson(pkg),
          ],
        );
      }
      await client.query(
        `INSERT INTO phase3a_workspace_graphs (
           account_scope_id, qualification_result_id, graph_digest, graph_bundle
         ) VALUES ($1,$2,$3,$4::jsonb)
         ON CONFLICT (qualification_result_id) DO NOTHING`,
        [
          this.accountScopeId,
          resultId,
          input.result.graph.graphDigest,
          canonicalJson(input.result.graph),
        ],
      );
      let cursor = await nextEventCursor(client, this.accountScopeId);
      for (const gate of [...input.result.packageGates, ...input.result.aggregateGates]) {
        const eventHash = await appendEvent(client, {
          accountScopeId: this.accountScopeId,
          eventType: "workspace-baseline-gate-recorded",
          subjectType: "workspace_gate_result",
          subjectId: gate.resultDigest,
          payload: {
            packageIdentityDigest: gate.packageIdentityDigest,
            gateId: gate.gateId,
            status: gate.status,
          },
          actorIdentity: input.actorIdentity,
          sequence: cursor.sequence,
          previousEventHash: cursor.previousEventHash,
        });
        cursor = { sequence: cursor.sequence + 1, previousEventHash: eventHash };
      }
      for (const route of input.result.capabilityRoutes) {
        const eventHash = await appendEvent(client, {
          accountScopeId: this.accountScopeId,
          eventType: "workspace-capability-routed",
          subjectType: "workspace_capability_route",
          subjectId: route.capabilityId,
          payload: {
            status: route.status,
            reasons: route.reasons,
          },
          actorIdentity: input.actorIdentity,
          sequence: cursor.sequence,
          previousEventHash: cursor.previousEventHash,
        });
        cursor = { sequence: cursor.sequence + 1, previousEventHash: eventHash };
      }
      await appendEvent(client, {
        accountScopeId: this.accountScopeId,
        eventType: "workspace-qualification-completed",
        subjectType: "workspace_qualification_result",
        subjectId: resultId,
        payload: {
          status: input.result.status,
          packageCount: input.result.packages.length,
          graphDigest: input.result.graph.graphDigest,
          coverageStatus: input.result.coverage.status,
          packageGateCount: input.result.packageGates.length,
          aggregateGateCount: input.result.aggregateGates.length,
          capabilityRouteCount: input.result.capabilityRoutes.length,
        },
        actorIdentity: input.actorIdentity,
        sequence: cursor.sequence,
        previousEventHash: cursor.previousEventHash,
      });
      await client.query("COMMIT");
      return { resultId };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async getResult(resultId: string): Promise<WorkspaceQualificationResult> {
    const result = await this.database.query<{ result_bundle: WorkspaceQualificationResult }>(
      `SELECT result_bundle
         FROM phase3a_workspace_results
        WHERE id = $1 AND account_scope_id = $2`,
      [resultId, this.accountScopeId],
    );
    if (!result.rows[0]) throw new Error("Workspace result not found in account scope");
    return result.rows[0].result_bundle;
  }

  async auditChain(accountScopeId = this.accountScopeId) {
    if (accountScopeId !== this.accountScopeId) {
      throw new Error("Tenant isolation: audit chain account scope mismatch");
    }
    const result = await this.database.query(
      `SELECT sequence, event_type, subject_type, subject_id, payload,
              previous_event_hash, event_hash, actor_identity, created_at
         FROM phase3a_workspace_events
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
