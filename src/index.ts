import { pool } from "./db/client";
import { migrate } from "./db/migrate";
import { runSync } from "./discovery/sync";
import { runAllIndexing } from "./indexing/sync";

async function main(): Promise<void> {
  try {
    await migrate();
    console.log("Database schema is up to date.");
    await runSync();
    await runAllIndexing();
  } catch (error) {
    console.error("Discovery and indexing sync failed.", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void main();
