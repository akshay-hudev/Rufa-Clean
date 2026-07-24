import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { verifyAuditChain } from "../milestone/audit";
import { createWorkspaceQualificationRequest, qualifyNpmWorkspace } from "../workspace/qualify";
import { Phase3aWorkspaceStore } from "../workspace/store";

const adminUrl = process.env.DCA_TEST_DATABASE_URL;
const describeDatabase = adminUrl ? describe : describe.skip;

function withDatabaseName(url: string, name: string): string {
  const parsed = new URL(url);
  parsed.pathname = `/${name}`;
  return parsed.toString();
}

async function workspaceFixture(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "dcav2-phase3a-db-fix-"));
  await writeFile(
    join(root, "package.json"),
    `${JSON.stringify({
      name: "root-workspace",
      private: true,
      workspaces: ["packages/*"],
    }, null, 2)}\n`,
  );
  await writeFile(
    join(root, "package-lock.json"),
    `${JSON.stringify({
      name: "root-workspace",
      lockfileVersion: 3,
      packages: {
        "": {},
        "packages/lib": { name: "@scope/lib", version: "1.0.0" },
        "packages/app": { name: "@scope/app", version: "1.0.0" },
      },
    }, null, 2)}\n`,
  );
  for (const name of ["lib", "app"]) {
    const packageRoot = join(root, "packages", name);
    await mkdir(join(packageRoot, "src"), { recursive: true });
    await writeFile(
      join(packageRoot, "package.json"),
      `${JSON.stringify({
        name: `@scope/${name}`,
        version: "1.0.0",
        private: true,
        ...(name === "app" ? { dependencies: { "@scope/lib": "workspace:*" } } : {}),
      }, null, 2)}\n`,
    );
    await writeFile(
      join(packageRoot, "tsconfig.json"),
      `${JSON.stringify({ compilerOptions: { strict: true } }, null, 2)}\n`,
    );
    await writeFile(join(packageRoot, "src", "index.ts"), "export const value = 1;\n");
  }
  return root;
}

const roots: string[] = [];
const ownedDatabases: string[] = [];
let urls: {
  fresh: string;
  upgrade: string;
  persist: string;
  audit: string;
} | null = null;

beforeAll(async () => {
  if (!adminUrl) return;
  const stamp = Date.now().toString(36);
  const names = {
    fresh: `dcav2_phase3a_${stamp}_fresh`,
    upgrade: `dcav2_phase3a_${stamp}_upgrade`,
    persist: `dcav2_phase3a_${stamp}_persist`,
    audit: `dcav2_phase3a_${stamp}_audit`,
  };
  const admin = new Pool({ connectionString: adminUrl });
  try {
    for (const name of Object.values(names)) {
      await admin.query(`CREATE DATABASE ${name}`);
      ownedDatabases.push(name);
    }
  } finally {
    await admin.end();
  }
  urls = {
    fresh: withDatabaseName(adminUrl, names.fresh),
    upgrade: withDatabaseName(adminUrl, names.upgrade),
    persist: withDatabaseName(adminUrl, names.persist),
    audit: withDatabaseName(adminUrl, names.audit),
  };
});

afterAll(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
  if (!adminUrl || ownedDatabases.length === 0) return;
  const admin = new Pool({ connectionString: adminUrl });
  try {
    for (const name of ownedDatabases.splice(0)) {
      await admin.query(`
        SELECT pg_terminate_backend(pid)
          FROM pg_stat_activity
         WHERE datname = $1 AND pid <> pg_backend_pid()
      `, [name]);
      await admin.query(`DROP DATABASE IF EXISTS ${name}`);
    }
  } finally {
    await admin.end();
  }
});

describeDatabase("Phase 3A PostgreSQL workspace ledger", () => {
  it("p3a-migrations-fresh-and-upgrade: fresh install, upgrade, checksums, rollback", async () => {
    expect(urls).not.toBeNull();
    const { migrate, defaultMigrations } = await import("./migrate.js");

    const fresh = new Pool({ connectionString: urls!.fresh });
    try {
      await migrate(fresh);
      const versions = await fresh.query<{ version: string; checksum: string }>(
        "SELECT version, checksum FROM schema_migrations ORDER BY version",
      );
      expect(versions.rows.map((row) => row.version)).toEqual([
        "0001_legacy_baseline",
        "0002_milestone_ledger",
        "0003_publication_attempts",
        "0004_publication_reconciliation",
        "0005_phase1_qualification",
        "0006_phase2_qualification",
        "0007_phase3a_npm_workspace",
      ]);
      const phase3a = versions.rows.find((row) => row.version === "0007_phase3a_npm_workspace");
      const sql = await readFile(
        join(__dirname, "migrations/0007_phase3a_npm_workspace.sql"),
      );
      expect(phase3a?.checksum).toBe(createHash("sha256").update(sql).digest("hex"));
    } finally {
      await fresh.end();
    }

    const upgrade = new Pool({ connectionString: urls!.upgrade });
    try {
      const migrations = defaultMigrations();
      await migrate(upgrade, migrations.slice(0, 6));
      await upgrade.query(
        `INSERT INTO repositories (
           vcs_provider, org_slug, repo_slug, default_branch, visibility, archived
         ) VALUES ('github', 'fixture', 'phase2-history', 'main', 'private', false)`,
      );
      await migrate(upgrade);
      const retained = await upgrade.query<{ count: string }>(
        `SELECT count(*)::text AS count FROM repositories
          WHERE org_slug = 'fixture' AND repo_slug = 'phase2-history'`,
      );
      expect(retained.rows[0]?.count).toBe("1");
      const versions = await upgrade.query<{ version: string }>(
        "SELECT version FROM schema_migrations ORDER BY version",
      );
      expect(versions.rows.map((row) => row.version)).toContain("0007_phase3a_npm_workspace");
    } finally {
      await upgrade.end();
    }

    const rollback = new Pool({ connectionString: urls!.fresh });
    const probeRoot = await mkdtemp(join(tmpdir(), "dcav2-phase3a-rollback-"));
    roots.push(probeRoot);
    try {
      const path = join(probeRoot, "phase3a_failure_probe.sql");
      await writeFile(
        path,
        "CREATE TABLE phase3a_rollback_probe (id integer); SELECT phase3a_missing_function();\n",
      );
      await expect(
        migrate(rollback, [{ version: "phase3a_failure_probe", path }]),
      ).rejects.toThrow();
      const table = await rollback.query<{ table_name: string | null }>(
        "SELECT to_regclass('public.phase3a_rollback_probe')::text AS table_name",
      );
      expect(table.rows[0]?.table_name).toBeNull();
    } finally {
      await rollback.end();
    }
  }, 120_000);

  it("p3a-workspace-persistence-shapes: packages, graph, gates, routes, immutability, tenants", async () => {
    expect(urls).not.toBeNull();
    const { migrate } = await import("./migrate.js");
    const database = new Pool({ connectionString: urls!.persist });
    const root = await workspaceFixture();
    roots.push(root);
    try {
      await migrate(database);
      const request = createWorkspaceQualificationRequest({
        requestId: "phase3a-persist-request",
        accountScopeId: "phase3a-persist-tenant",
        authorizationId: "phase-3a-validation-completion-20260724-01",
        repository: {
          provider: "github",
          owner: "fixture",
          name: "phase3a-persist",
          fullName: "fixture/phase3a-persist",
        },
        requestedRevision: "main",
        resolvedCommit: "c".repeat(40),
        sourceSnapshotId: "d".repeat(64),
        requestedAt: new Date().toISOString(),
      });
      const qualified = await qualifyNpmWorkspace({
        root,
        requestId: request.requestId,
        requestDigest: request.requestDigest,
        repository: request.repository,
        resolvedCommit: request.resolvedCommit,
        sourceSnapshotId: request.sourceSnapshotId,
        authorizationActive: true,
        targetAccessAllowed: true,
        packageGates: [{
          packageIdentityDigest: "e".repeat(64),
          gateId: "typecheck",
          status: "passed",
          resultDigest: "f".repeat(64),
        }],
        aggregateGates: [{
          packageIdentityDigest: "workspace-root",
          gateId: "typecheck",
          status: "passed",
          resultDigest: "1".repeat(64),
        }],
      });
      expect(qualified.packages.length).toBeGreaterThan(0);
      expect(qualified.graph.edges.length).toBeGreaterThan(0);
      expect(qualified.capabilityRoutes.length).toBeGreaterThan(0);

      const store = new Phase3aWorkspaceStore("phase3a-persist-tenant", database);
      const first = await store.persistQualification({
        authorizationId: "phase-3a-validation-completion-20260724-01",
        actorIdentity: "phase3a-validator",
        requestDigest: request.requestDigest,
        result: qualified,
      });
      const second = await store.persistQualification({
        authorizationId: "phase-3a-validation-completion-20260724-01",
        actorIdentity: "phase3a-validator",
        requestDigest: request.requestDigest,
        result: qualified,
      });
      expect(second.resultId).toBe(first.resultId);
      const loaded = await store.getResult(first.resultId);
      expect(loaded.packages.length).toBe(qualified.packages.length);
      expect(loaded.graph.graphDigest).toBe(qualified.graph.graphDigest);
      expect(loaded.packageGates).toEqual(qualified.packageGates);
      expect(loaded.aggregateGates).toEqual(qualified.aggregateGates);
      expect(loaded.capabilityRoutes).toEqual(qualified.capabilityRoutes);

      const packages = await database.query(
        `SELECT count(*)::int AS count FROM phase3a_workspace_packages
          WHERE account_scope_id = $1 AND qualification_result_id = $2`,
        ["phase3a-persist-tenant", first.resultId],
      );
      expect(packages.rows[0]?.count).toBe(qualified.packages.length);
      const graphs = await database.query(
        `SELECT graph_digest FROM phase3a_workspace_graphs
          WHERE account_scope_id = $1 AND qualification_result_id = $2`,
        ["phase3a-persist-tenant", first.resultId],
      );
      expect(graphs.rows[0]?.graph_digest).toBe(qualified.graph.graphDigest);

      await expect(database.query(
        "UPDATE phase3a_workspace_results SET status = 'failed' WHERE id = $1",
        [first.resultId],
      )).rejects.toThrow(/immutable milestone ledger/);

      const other = new Phase3aWorkspaceStore("phase3a-other-tenant", database);
      await expect(other.getResult(first.resultId)).rejects.toThrow(/account scope/);
      await expect(other.auditChain("phase3a-persist-tenant")).rejects.toThrow(/Tenant isolation/);
    } finally {
      await database.end();
    }
  }, 120_000);

  it("p3a-audit-workspace-events: ordering, hashes, append-only, independent verification", async () => {
    expect(urls).not.toBeNull();
    const { migrate } = await import("./migrate.js");
    const database = new Pool({ connectionString: urls!.audit });
    const root = await workspaceFixture();
    roots.push(root);
    try {
      await migrate(database);
      const request = createWorkspaceQualificationRequest({
        requestId: "phase3a-audit-request",
        accountScopeId: "phase3a-audit-tenant",
        authorizationId: "phase-3a-validation-completion-20260724-01",
        repository: {
          provider: "github",
          owner: "fixture",
          name: "phase3a-audit",
          fullName: "fixture/phase3a-audit",
        },
        requestedRevision: "main",
        resolvedCommit: "a".repeat(40),
        sourceSnapshotId: "b".repeat(64),
        requestedAt: new Date().toISOString(),
      });
      const result = await qualifyNpmWorkspace({
        root,
        requestId: request.requestId,
        requestDigest: request.requestDigest,
        repository: request.repository,
        resolvedCommit: request.resolvedCommit,
        sourceSnapshotId: request.sourceSnapshotId,
        authorizationActive: true,
        targetAccessAllowed: true,
        packageGates: [{
          packageIdentityDigest: "c".repeat(64),
          gateId: "test",
          status: "passed",
          resultDigest: "d".repeat(64),
        }],
        aggregateGates: [{
          packageIdentityDigest: "workspace-root",
          gateId: "test",
          status: "passed",
          resultDigest: "e".repeat(64),
        }],
      });
      const store = new Phase3aWorkspaceStore("phase3a-audit-tenant", database);
      await store.persistQualification({
        authorizationId: "phase-3a-validation-completion-20260724-01",
        actorIdentity: "phase3a-auditor",
        requestDigest: request.requestDigest,
        result,
      });
      const chain = await store.auditChain();
      expect(chain.length).toBeGreaterThan(0);
      for (let index = 0; index < chain.length; index += 1) {
        const event = chain[index] as {
          sequence: string | number;
          previous_event_hash: string | null;
          event_hash: string;
        };
        expect(Number(event.sequence)).toBe(index + 1);
        expect(event.previous_event_hash).toBe(
          index === 0 ? null : (chain[index - 1] as { event_hash: string }).event_hash,
        );
        expect(event.event_hash).toMatch(/^[a-f0-9]{64}$/);
      }
      expect(await store.verifyAuditChain()).toEqual({
        valid: true,
        eventCount: chain.length,
      });
      const eventTypes = chain.map((event: { event_type: string }) => event.event_type);
      expect(eventTypes).toEqual(expect.arrayContaining([
        "workspace-baseline-gate-recorded",
        "workspace-capability-routed",
        "workspace-qualification-completed",
      ]));
      await expect(database.query(
        "DELETE FROM phase3a_workspace_events WHERE account_scope_id = $1",
        ["phase3a-audit-tenant"],
      )).rejects.toThrow(/immutable milestone ledger/);
      const tampered = structuredClone(chain);
      (tampered[0] as { event_hash: string }).event_hash = "0".repeat(64);
      expect(verifyAuditChain("phase3a-audit-tenant", tampered as never).valid).toBe(false);
      expect(result.qualificationDigest).toMatch(/^[a-f0-9]{64}$/);
    } finally {
      await database.end();
    }
  }, 120_000);
});
