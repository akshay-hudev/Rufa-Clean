import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const databaseUrl = process.env.DCA_TEST_DATABASE_URL;
const describeDatabase = databaseUrl ? describe : describe.skip;
let root = "";

afterAll(async () => {
  if (root) {
    await rm(root, { recursive: true, force: true });
  }
});

describeDatabase("PostgreSQL migration controls", () => {
  it("serializes concurrent runs and rejects changed migration checksums", async () => {
    process.env.DATABASE_URL = databaseUrl;
    const [{ migrate, defaultMigrations }, { pool }] = await Promise.all([
      import("./migrate.js"),
      import("./client.js"),
    ]);

    await Promise.all([migrate(pool), migrate(pool), migrate(pool)]);
    const versions = await pool.query<{ version: string; checksum: string }>(
      "SELECT version, checksum FROM schema_migrations ORDER BY version",
    );
    expect(versions.rows.map((row) => row.version)).toEqual([
      "0001_legacy_baseline",
      "0002_milestone_ledger",
      "0003_publication_attempts",
    ]);

    const target = defaultMigrations().at(-1)!;
    const expected = createHash("sha256")
      .update(await readFile(target.path))
      .digest("hex");
    await pool.query(
      "UPDATE schema_migrations SET checksum = $1 WHERE version = $2",
      ["0".repeat(64), target.version],
    );
    try {
      await expect(migrate(pool)).rejects.toThrow(/Applied migration changed/);
    } finally {
      await pool.query(
        "UPDATE schema_migrations SET checksum = $1 WHERE version = $2",
        [expected, target.version],
      );
    }
    await expect(migrate(pool)).resolves.toBeUndefined();
  }, 60_000);

  it("rolls back every statement in a failed migration transaction", async () => {
    process.env.DATABASE_URL = databaseUrl;
    const [{ migrate }, { pool }] = await Promise.all([
      import("./migrate.js"),
      import("./client.js"),
    ]);
    root = await mkdtemp(join(tmpdir(), "dcav2-migration-failure-"));
    const path = join(root, "phase0_failure_probe.sql");
    await writeFile(
      path,
      "CREATE TABLE phase0_rollback_probe (id integer); SELECT phase0_missing_function();\n",
    );
    await expect(
      migrate(pool, [{ version: "phase0_failure_probe", path }]),
    ).rejects.toThrow();
    const table = await pool.query<{ table_name: string | null }>(
      "SELECT to_regclass('public.phase0_rollback_probe')::text AS table_name",
    );
    expect(table.rows[0]?.table_name).toBeNull();
    const version = await pool.query(
      "SELECT 1 FROM schema_migrations WHERE version = 'phase0_failure_probe'",
    );
    expect(version.rowCount).toBe(0);
    await pool.end();
  }, 60_000);
});
