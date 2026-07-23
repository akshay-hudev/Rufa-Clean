import { describe, expect, it } from "vitest";

import { digestCanonical } from "../milestone/canonical";
import { createQualificationRequest } from "../qualification/qualify";
import type { QualificationResult } from "../qualification/types";

const databaseUrl = process.env.DCA_TEST_DATABASE_URL;
const describeDatabase = databaseUrl ? describe : describe.skip;

describeDatabase("Phase 2 PostgreSQL qualification ledger", () => {
  it("persists idempotent tenant-scoped immutable results and hash-linked redacted audit", async () => {
    process.env.DATABASE_URL = databaseUrl;
    const [{ migrate }, { pool }, { Phase2QualificationStore }] = await Promise.all([
      import("./migrate.js"),
      import("./client.js"),
      import("../qualification/store.js"),
    ]);
    await migrate();
    const request = createQualificationRequest({
      schemaVersion: "1",
      requestId: "phase2-db-request",
      accountScopeId: "phase2-db-tenant",
      authorizationId: "phase-2-qualification-and-configuration-20260723-01",
      repository: {
        provider: "github",
        owner: "fixture",
        name: "phase2-db",
        fullName: "fixture/phase2-db",
      },
      requestedRevision: "main",
      resolvedCommit: "a".repeat(40),
      sourceSnapshotId: "b".repeat(64),
      requestedCapabilities: ["repository.profile.qualify.v1"],
      requestedProfileId: "typescript-single-package-npm-v1",
      requestedAt: "2026-07-23T17:11:22Z",
    });
    const configuration = {
      status: "valid" as const,
      configuration: {
        schemaVersion: "1" as const,
        sourceRoots: ["src"],
        testRoots: ["test"],
        generatedRoots: ["generated"],
        excludedRoots: ["node_modules"],
        requiredGates: ["typecheck"] as ["typecheck"],
        optionalGates: [],
        networkProfile: "network-disabled" as const,
        runnerProfile: "isolated-typescript-runner" as const,
      },
      sourceAuthorities: ["repository_profile" as const],
      errors: [],
      warnings: [],
      configurationDigest: "c".repeat(64),
    };
    const baselineMaterial = {
      gateId: "typecheck" as const,
      commandId: "qualification.typecheck.v1",
      status: "passed" as const,
      exitCode: 0,
      outputTruncated: false,
      sourceModified: false,
      cleanupStatus: "removed" as const,
    };
    const material: Omit<QualificationResult, "qualificationDigest"> = {
      schemaVersion: "1",
      requestId: request.requestId,
      requestDigest: request.requestDigest,
      repository: request.repository,
      resolvedCommit: request.resolvedCommit,
      sourceSnapshotId: request.sourceSnapshotId,
      profile: {
        id: "typescript-single-package-npm-v1",
        version: "1",
        status: "matched",
        reasons: [],
      },
      languages: [{
        language: "typescript",
        fileCount: 1,
        generatedCount: 0,
        testOnly: false,
        support: "supported",
      }],
      packageManager: {
        manager: "npm",
        declared: "npm@10.9.3",
        lockfiles: ["package-lock.json"],
        lockfileVersion: 3,
        conflicts: [],
        support: "supported",
      },
      workspace: {
        detected: false,
        mechanisms: [],
        roots: [],
        packageCount: 1,
        support: "single_package_supported",
      },
      roots: [{
        path: "src",
        kind: "source",
        discoveryMethod: "trusted_configuration",
        exists: true,
        symlinkStatus: "not_symlink",
        required: true,
      }],
      tools: [{
        tool: "typescript",
        requiredRange: "5.9.3",
        resolvedVersion: "5.9.3",
        executable: "/workspace/node_modules/.bin/tsc",
        source: "project_local",
        status: "available",
      }],
      commandObservations: [],
      commandMappings: [],
      configuration,
      baseline: [{ ...baselineMaterial, resultDigest: digestCanonical(baselineMaterial) }],
      capabilityRoutes: [{
        capabilityId: "repository.profile.qualify.v1",
        status: "enabled",
        reasons: [],
      }],
      blockers: [],
      warnings: [],
      status: "ready",
    };
    const result: QualificationResult = {
      ...material,
      qualificationDigest: digestCanonical(material),
    };
    const store = new Phase2QualificationStore("phase2-db-tenant", pool);
    await store.ensureAccountScope("Phase 2 DB Tenant");
    const first = await store.record(request, result, "phase2-operator");
    expect(await store.record(request, result, "phase2-operator")).toEqual(first);
    expect(await store.getResult(first.resultId)).toEqual(result);
    await expect(pool.query(
      "UPDATE phase2_qualification_results SET status = 'failed' WHERE id = $1",
      [first.resultId],
    )).rejects.toThrow(/immutable milestone ledger/);
    const other = new Phase2QualificationStore("phase2-other-tenant", pool);
    await other.ensureAccountScope("Phase 2 Other Tenant");
    await expect(other.getResult(first.resultId)).rejects.toThrow(/account scope/);
    await expect(other.auditChain("phase2-db-tenant")).rejects.toThrow(/Tenant isolation/);
    const chain = await store.auditChain();
    expect(chain.length).toBeGreaterThanOrEqual(6);
    expect(await store.verifyAuditChain()).toEqual({ valid: true, eventCount: chain.length });
    const eventTypes = chain.map((event: { event_type: string }) => event.event_type);
    expect(eventTypes).toEqual(expect.arrayContaining([
      "qualification_requested",
      "repository_profile_selected",
      "configuration_validated",
      "tool_resolved",
      "baseline_gate_completed",
      "capability_routed",
      "qualification_completed",
    ]));
    await pool.end();
  }, 60_000);
});

