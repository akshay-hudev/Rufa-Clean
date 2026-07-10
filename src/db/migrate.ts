import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { pool } from "./client";

async function migrate(): Promise<void> {
  const schemaPath = join(__dirname, "schema.sql");
  const schema = await readFile(schemaPath, "utf8");

  await pool.query(schema);
}

migrate()
  .then(() => {
    console.log("Database schema is up to date.");
  })
  .catch((error: unknown) => {
    console.error("Database migration failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
