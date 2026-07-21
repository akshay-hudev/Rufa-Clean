import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { pool } from "./client";

export async function migrate(): Promise<void> {
  await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version text PRIMARY KEY,
    checksum text NOT NULL,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`);
  const migrations = [
    { version: "0001_legacy_baseline", path: join(__dirname, "../../src/db/schema.sql") },
    { version: "0002_milestone_ledger", path: join(__dirname, "../../src/db/migrations/0002_milestone_ledger.sql") },
    { version: "0003_publication_attempts", path: join(__dirname, "../../src/db/migrations/0003_publication_attempts.sql") },
  ];
  const client = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock(hashtext('dcav2-schema-migrations'))");
    for (const migration of migrations) {
      const sql = await readFile(migration.path, "utf8");
      const checksum = createHash("sha256").update(sql).digest("hex");
      const existing = await client.query<{ checksum: string }>(
        "SELECT checksum FROM schema_migrations WHERE version = $1",
        [migration.version],
      );
      if (existing.rows[0]) {
        if (existing.rows[0].checksum !== checksum) {
          throw new Error(`Applied migration changed: ${migration.version}`);
        }
        continue;
      }
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (version, checksum) VALUES ($1, $2)",
          [migration.version, checksum],
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    await client.query("SELECT pg_advisory_unlock(hashtext('dcav2-schema-migrations'))");
    client.release();
  }
}
