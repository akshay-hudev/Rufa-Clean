import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const PROJECT_SUBDIRECTORIES = ["backend", "frontend", "client", "server", "api", "web"];
const SCIP_TYPESCRIPT_CLI = require.resolve("@sourcegraph/scip-typescript");

function findProjectRoot(repoRootPath: string): string | null {
  if (existsSync(join(repoRootPath, "package.json"))) {
    return repoRootPath;
  }

  for (const directory of PROJECT_SUBDIRECTORIES) {
    const candidate = join(repoRootPath, directory);
    if (existsSync(join(candidate, "package.json"))) {
      return candidate;
    }
  }

  return null;
}

export async function runScipIndex(repoRootPath: string): Promise<string | null> {
  const projectRoot = findProjectRoot(repoRootPath);
  if (!projectRoot) {
    console.warn(`SCIP TypeScript indexing skipped for ${repoRootPath}: package.json not found`);
    return null;
  }

  if (!existsSync(join(projectRoot, "tsconfig.json"))) {
    console.warn(
      `SCIP TypeScript indexing skipped for ${projectRoot}: no tsconfig.json found, skipping SCIP indexing`,
    );
    return null;
  }

  const outputPath = join(projectRoot, "index.scip");
  try {
    await execFileAsync(
      process.execPath,
      [SCIP_TYPESCRIPT_CLI, "index", "--output", outputPath, "--no-progress-bar"],
      {
        cwd: projectRoot,
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
      },
    );

    if (!existsSync(outputPath)) {
      console.warn(`SCIP TypeScript indexing did not produce ${outputPath}`);
      return null;
    }

    return outputPath;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`SCIP TypeScript indexing failed for ${projectRoot}: ${message}`);
    return null;
  }
}
