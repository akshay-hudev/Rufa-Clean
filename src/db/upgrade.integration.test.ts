import { Pool } from "pg";
import { describe, expect, it } from "vitest";

import { defaultMigrations, migrate } from "./migrate";

const databaseUrl = process.env.DCA_UPGRADE_DATABASE_URL;
const describeDatabase = databaseUrl ? describe : describe.skip;

describeDatabase("PostgreSQL representative upgrade", () => {
  it("preserves legacy inventory data while applying the additive ledger migrations", async () => {
    const database = new Pool({ connectionString: databaseUrl });
    try {
      const migrations = defaultMigrations();
      await migrate(database, [migrations[0]!]);
      await database.query(
        `INSERT INTO repositories (
           vcs_provider, org_slug, repo_slug, default_branch, visibility, archived
         ) VALUES ('github', 'synthetic-owner', 'legacy-inventory', 'main', 'private', false)`,
      );

      await migrate(database);

      const retained = await database.query<{ count: string }>(
        `SELECT count(*)::text AS count
           FROM repositories
          WHERE vcs_provider = 'github'
            AND org_slug = 'synthetic-owner'
            AND repo_slug = 'legacy-inventory'`,
      );
      expect(retained.rows[0]?.count).toBe("1");
      const versions = await database.query<{ version: string }>(
        "SELECT version FROM schema_migrations ORDER BY version",
      );
      expect(versions.rows.map((row) => row.version)).toEqual([
        "0001_legacy_baseline",
        "0002_milestone_ledger",
        "0003_publication_attempts",
        "0004_publication_reconciliation",
        "0005_phase1_qualification",
        "0006_phase2_qualification",
      ]);
    } finally {
      await database.end();
    }
  }, 60_000);
});
