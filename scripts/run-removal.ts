import "dotenv/config";

import { pool } from "../src/db/client";
import { migrate } from "../src/db/migrate";
import { runSimpleRemovalPipeline } from "../src/remediation/pipeline";

async function main(): Promise<void> {
  const verdictId = process.argv[2]?.trim();
  if (!verdictId) {
    throw new Error("Usage: npx ts-node scripts/run-removal.ts <confidence-verdict-id>");
  }
  await migrate();
  const result = await runSimpleRemovalPipeline(verdictId);
  console.dir(result, { depth: null });
  if (result.status !== "pr_opened") {
    process.exitCode = 1;
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
