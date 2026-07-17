import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const PROJECT_SUBDIRECTORIES = ["backend", "frontend", "client", "server", "api", "web"];
const SCIP_TYPESCRIPT_CLI = require.resolve("@sourcegraph/scip-typescript");

export function scipNpmEnvironment(
  source: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...source };
  delete env.npm_config_allow_scripts;
  delete env.NPM_CONFIG_ALLOW_SCRIPTS;
  return env;
}

async function installDependencies(projectRoot: string): Promise<boolean> {
  if (existsSync(join(projectRoot, "node_modules"))) {
    return true;
  }

  const manifest = JSON.parse(readFileSync(join(projectRoot, "package.json"), "utf8")) as Record<
    string,
    unknown
  >;
  const dependencySections = [
    "dependencies",
    "devDependencies",
    "optionalDependencies",
    "peerDependencies",
  ];
  const hasDependencies = dependencySections.some((section) => {
    const dependencies = manifest[section];
    return dependencies !== null && typeof dependencies === "object" &&
      Object.keys(dependencies).length > 0;
  });
  if (!hasDependencies) {
    return true;
  }

  const installCommand = existsSync(join(projectRoot, "package-lock.json")) ? "ci" : "install";
  try {
    await execFileAsync(
      "npm",
      [
        installCommand,
        "--ignore-scripts",
        "--allow-git=all",
        "--allow-remote=all",
        "--no-audit",
        "--no-fund",
      ],
      {
        cwd: projectRoot,
        env: scipNpmEnvironment(),
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
      },
    );
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`SCIP TypeScript dependency installation failed for ${projectRoot}: ${message}`);
    return false;
  }
}

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

  if (!await installDependencies(projectRoot)) {
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
