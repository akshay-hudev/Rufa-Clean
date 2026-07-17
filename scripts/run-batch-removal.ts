import "dotenv/config";

import { pool } from "../src/db/client";
import { migrate } from "../src/db/migrate";
import { runAdaptiveBatchRemovalPipeline } from "../src/remediation/batch-pipeline";

async function main(): Promise<void> {
  const repository = process.argv[2]?.trim();
  if (!repository) {
    throw new Error(
      "Usage: npx ts-node scripts/run-batch-removal.ts <repository-id-or-slug>",
    );
  }
  await migrate();
  const result = await runAdaptiveBatchRemovalPipeline(repository);
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
