import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { pool } from "./client";

export async function migrate(): Promise<void> {
  const schemaPath = join(__dirname, "../../src/db/schema.sql");
  const schema = await readFile(schemaPath, "utf8");

  await pool.query(schema);
}
