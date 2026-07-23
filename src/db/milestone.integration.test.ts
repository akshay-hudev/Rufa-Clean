import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

import type { CanonicalAnalysisResult, FindingBundle } from "../milestone/types";
import type { TypeScriptQualification } from "../milestone/qualify";

const databaseUrl = process.env.DCA_TEST_DATABASE_URL;
const describeDatabase = databaseUrl ? describe : describe.skip;

function finding(): FindingBundle {
  return {
    schemaVersion: "1", findingId: "f".repeat(64), accountScopeId: "db-integration",
    repository: { provider: "github", owner: "fixture", name: "ledger" }, commitSha: "a".repeat(40),
    packageJsonSha256: "1".repeat(64), packageLockSha256: "2".repeat(64), tsconfigSha256: "3".repeat(64),
    packageIdentity: "6".repeat(64), moduleIdentity: "7".repeat(64), functionIdentity: "8".repeat(64),
    occurrence: {
      filePath: "src/dead.ts", name: "dead", kind: "function", shape: "function_declaration", exported: false,
      lineStart: 1, columnStart: 1, lineEnd: 1, columnEnd: 20, byteStart: 0, byteEnd: 20,
      sourceSha256: "4".repeat(64), declarationSha256: "5".repeat(64),
    },
    analyzers: [{ name: "fixture", version: "1", configuration: {} }],
    coverage: { status: "complete_for_supported_scope", tsconfigFileCount: 1, parsedFileCount: 1, scipDocumentCount: 1, analyzedFiles: ["src/dead.ts"], excludedFiles: [], missingScipFiles: [], failedFiles: [], explanation: "complete" },
    supportingEvidence: ["exact_scip_definition_matched"], counterEvidence: [], blockers: [], contradictions: [],
    evidence: {
      treeSitter: { status: "succeeded", declarationCount: 1 },
      scip: { status: "succeeded", definitionMatches: 1, symbol: "local 0", productionReferences: 0, testReferences: 0, unknownReferences: 0 },
      textualAudit: { status: "succeeded", occurrenceCount: 1, checkedFiles: 1, occurrenceFiles: ["src/dead.ts"] },
    },
    classification: "candidate_dead", explanation: "dead", policyVersion: "policy-v1", evidenceDigest: "e".repeat(64),
  };
}

describeDatabase("PostgreSQL milestone ledger", () => {
  it("migrates from empty, enforces immutability, append-only decisions, audit links, and idempotency", async () => {
    process.env.DATABASE_URL = databaseUrl;
    const [{ migrate }, { pool }, { MilestoneStore }] = await Promise.all([
      import("./migrate.js"), import("./client.js"), import("../milestone/store.js"),
    ]);
    await migrate();
    await migrate();
    const versions = await pool.query<{ version: string }>("SELECT version FROM schema_migrations ORDER BY version");
    expect(versions.rows.map((row) => row.version)).toEqual([
      "0001_legacy_baseline",
      "0002_milestone_ledger",
      "0003_publication_attempts",
      "0004_publication_reconciliation",
      "0005_phase1_qualification",
      "0006_phase2_qualification",
    ]);
    const store = new MilestoneStore("db-integration", pool);
    await store.ensureAccountScope("db-integration", "DB Integration");
    const qualification: TypeScriptQualification = {
      schemaVersion: "1",
      status: "ready",
      repository: { provider: "github", owner: "fixture", name: "ledger" },
      commitSha: "a".repeat(40),
      packageName: "fixture",
      packageVersion: "1.0.0",
      packageIdentity: "6".repeat(64),
      sourceRoot: ".",
      packageJsonSha256: "1".repeat(64),
      packageLockSha256: "2".repeat(64),
      tsconfigSha256: "3".repeat(64),
      toolchain: {
        node: { version: "22.18.0", executable: "/usr/local/bin/node", source: "approved_runner" },
        npm: { version: "10.9.3", executable: "/usr/local/bin/npm", source: "approved_runner" },
        typescript: {
          version: "5.9.3",
          executable: "/workspace/node_modules/.bin/tsc",
          source: "project_local",
        },
      },
      commands: {
        install: ["npm", "ci", "--ignore-scripts", "--include=dev"],
        typecheck: "/workspace/node_modules/.bin/tsc --noEmit -p tsconfig.json",
        build: "npm run build",
        test: "npm test",
      },
      modules: [],
      reasons: [],
      qualificationDigest: "9".repeat(64),
    };
    const qualificationId = await store.recordQualification(qualification, "qualifier");
    expect(await store.recordQualification(qualification, "qualifier")).toBe(qualificationId);
    const value = finding();
    const analysis: CanonicalAnalysisResult = {
      schemaVersion: "1", accountScopeId: value.accountScopeId, repository: value.repository,
      commitSha: value.commitSha, policyVersion: value.policyVersion, coverage: value.coverage,
      analyzerRuns: [{ analyzer: "fixture", version: "1", status: "succeeded", configuration: {} }],
      findings: [value],
    };
    const runId = await store.recordAnalysis(analysis, "integration-operator");
    const [firstReview, secondReview] = await Promise.all([
      store.recordDisposition({ findingId: value.findingId, decision: "confirmed_dead", actorIdentity: "reviewer", rationale: "fixture evidence reviewed" }),
      store.recordDisposition({ findingId: value.findingId, decision: "confirmed_dead", actorIdentity: "reviewer", rationale: "concurrent append-only reaffirmation" }),
    ]);
    expect(secondReview).not.toBe(firstReview);
    await Promise.all(Array.from({ length: 8 }, (_, index) =>
      store.recordDisposition({
        findingId: value.findingId,
        decision: "confirmed_dead",
        actorIdentity: "reviewer",
        rationale: `sequence boundary reaffirmation ${index + 1}`,
      })
    ));
    const authorizationId = await store.recordAuthorization({ findingId: value.findingId, decision: "approved_for_remediation", actorIdentity: "authorizer", rationale: "narrow fixture removal approved" });
    const patch = "diff --git a/src/dead.ts b/src/dead.ts\n";
    const verified = {
      status: "verified" as const, findingId: value.findingId, authorizationId,
      baseCommitSha: value.commitSha,
      baseline: { status: "passed" as const, packageRoot: "/workspace", commands: [], startedAt: new Date(0).toISOString(), completedAt: new Date(0).toISOString() },
      postChange: { status: "passed" as const, packageRoot: "/workspace", commands: [], startedAt: new Date(0).toISOString(), completedAt: new Date(0).toISOString() },
      patch, patchSha256: createHash("sha256").update(patch).digest("hex"), changedFiles: ["src/dead.ts"],
      generator: { name: "PolyglotPiranha" as const, version: "0.4.8" as const, ruleSetVersion: "simple-top-level-function-v1" as const },
    };
    const attemptId = await store.recordRemediation(verified, "integration-operator");
    expect(await store.recordRemediation(verified, "integration-operator")).toBe(attemptId);
    await store.recordPublication({
      attemptId, status: "draft_pr_created", owner: "fixture", repository: "ledger",
      baseCommitSha: value.commitSha, branchName: "dead-code/dead-attempt", prUrl: "https://github.test/pr/1",
      actorIdentity: "publisher", accountScopeId: value.accountScopeId,
    });
    const publicationCount = await pool.query<{ count: string }>("SELECT count(*)::text AS count FROM pull_request_publications WHERE remediation_attempt_id = $1", [attemptId]);
    expect(publicationCount.rows[0]?.count).toBe("1");

    await expect(pool.query("UPDATE milestone_findings SET classification = 'failed' WHERE finding_id = $1", [value.findingId])).rejects.toThrow(/immutable milestone ledger/);
    await expect(pool.query(
      "UPDATE qualification_runs SET status = 'blocked' WHERE id = $1",
      [qualificationId],
    )).rejects.toThrow(/immutable milestone ledger/);
    const reviewCount = await pool.query<{ count: string }>("SELECT count(*)::text AS count FROM human_review_decisions WHERE finding_id = $1", [value.findingId]);
    expect(reviewCount.rows[0]?.count).toBe("10");
    await store.recordAuthorization({ findingId: value.findingId, decision: "revoked", actorIdentity: "authorizer", rationale: "integration revocation" });
    expect((await store.latestAuthorization(value.findingId)).decision).toBe("revoked");
    const audit = await store.auditChain(value.accountScopeId) as Array<{ sequence: string | number; previous_event_hash: string | null; event_hash: string }>;
    expect(audit.length).toBeGreaterThanOrEqual(7);
    for (let index = 0; index < audit.length; index += 1) {
      expect(Number(audit[index]!.sequence)).toBe(index + 1);
      expect(audit[index]!.previous_event_hash).toBe(index === 0 ? null : audit[index - 1]!.event_hash);
    }
    expect(await store.verifyAuditChain(value.accountScopeId)).toEqual({
      valid: true,
      eventCount: audit.length,
    });
    const tampered = audit.map((event) => ({ ...event }));
    tampered[0]!.event_hash = "0".repeat(64);
    const { verifyAuditChain } = await import("../milestone/audit.js");
    expect(verifyAuditChain(value.accountScopeId, tampered as never).valid).toBe(false);
    expect(await store.getAnalysisRun(runId)).toEqual(expect.objectContaining({ status: "succeeded" }));
    const otherTenant = new MilestoneStore("other-tenant", pool);
    await expect(otherTenant.getFinding(value.findingId)).rejects.toThrow(/account scope/);
    await expect(otherTenant.getAnalysisRun(runId)).rejects.toThrow(/account scope/);
    await expect(otherTenant.auditChain(value.accountScopeId)).rejects.toThrow(/Tenant isolation/);
    await pool.end();
  }, 60_000);
});
