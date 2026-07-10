import "dotenv/config";

import { listRepositories, listRootFiles } from "../src/connectors/github";

async function main(): Promise<void> {
  const page = await listRepositories();
  console.log("First repository page:", page);

  const firstRepo = page.repos[0];
  if (!firstRepo) {
    console.log("The installation has no accessible repositories.");
    return;
  }

  const separator = firstRepo.full_name.indexOf("/");
  if (separator === -1) {
    throw new Error(`Unexpected repository full name: ${firstRepo.full_name}`);
  }

  const owner = firstRepo.full_name.slice(0, separator);
  const repo = firstRepo.full_name.slice(separator + 1);
  const rootFiles = await listRootFiles(owner, repo);
  console.log(`Root files for ${firstRepo.full_name}:`, rootFiles);
}

main().catch((error: unknown) => {
  console.error("GitHub connector smoke test failed:", error);
  process.exitCode = 1;
});
