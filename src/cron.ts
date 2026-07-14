import "dotenv/config";

import cron, { type ScheduledTask } from "node-cron";

import { pool } from "./db/client";
import { migrate } from "./db/migrate";
import { runSync } from "./discovery/sync";
import { runAllIndexing } from "./indexing/sync";

const schedule = process.env.SYNC_CRON ?? "0 2 * * *";
const timezone = process.env.SYNC_TIMEZONE ?? "UTC";

let task: ScheduledTask | undefined;
let shuttingDown = false;

async function runScheduledSync(): Promise<void> {
  console.log(`Starting scheduled discovery sync at ${new Date().toISOString()}`);
  try {
    await runSync();
    await runAllIndexing();
  } catch (error) {
    console.error("Scheduled discovery and indexing sync failed.", error);
  }
}

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  console.log(`Received ${signal}; stopping nightly sync scheduler.`);
  task?.stop();
  await pool.end();
}

async function main(): Promise<void> {
  if (!cron.validate(schedule)) {
    throw new Error(`Invalid SYNC_CRON expression: ${schedule}`);
  }

  await migrate();
  console.log("Database schema is up to date.");

  task = cron.schedule(schedule, runScheduledSync, {
    name: "nightly-discovery-sync",
    noOverlap: true,
    timezone,
  });
  console.log(`Nightly discovery sync scheduled with "${schedule}" in ${timezone}.`);
}

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});
process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});

void main().catch(async (error: unknown) => {
  console.error("Failed to start nightly sync scheduler.", error);
  process.exitCode = 1;
  await pool.end();
});
