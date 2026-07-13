import "dotenv/config";
import { existsSync, readdirSync } from "node:fs";

import { pool } from "../src/db/client";
import { cloneRepository } from "../src/indexing/clone";

interface InventoryRepository {
  vcs_provider: string;
  org_slug: string;
  repo_slug: string;
  default_branch: string;
}

async function main(): Promise<void> {
  const repoSlug = process.argv[2]?.trim();
  if (!repoSlug) {
    throw new Error("Repository slug argument is required. Usage: npx ts-node scripts/test-clone.ts <repo-slug>");
  }

  const result = await pool.query<InventoryRepository>(
    `SELECT vcs_provider, org_slug, repo_slug, default_branch
       FROM repositories
      WHERE lower(vcs_provider) = 'github'
        AND repo_slug = $1
        AND archived = false
        AND default_branch IS NOT NULL
      LIMIT 1`,
    [repoSlug],
  );
  const repo = result.rows[0];
  if (!repo) {
    throw new Error(`No cloneable GitHub repository with slug "${repoSlug}" found in the inventory`);
  }

  const clone = await cloneRepository(repo);
  try {
    console.log(`Local path: ${clone.localPath}`);
    console.log(`Commit SHA: ${clone.commitSha}`);
    console.log("Top-level files:", readdirSync(clone.localPath));
  } finally {
    await clone.cleanup();
    console.log(`Cleanup confirmed: ${!existsSync(clone.localPath)}`);
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
