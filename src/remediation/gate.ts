import { access, readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";

import { runProcess } from "./process";
import type { GateCommandResult, GateResult } from "./types";

interface PackageManifest {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function findPackageRoot(
  repositoryPath: string,
  sourceFilePath: string,
): Promise<string> {
  const repositoryRoot = resolve(repositoryPath);
  let current = dirname(resolve(repositoryPath, sourceFilePath));
  while (current.startsWith(repositoryRoot)) {
    if (await exists(join(current, "package.json"))) {
      return current;
    }
    if (current === repositoryRoot) {
      break;
    }
    current = dirname(current);
  }
  throw new Error(`No package.json found for ${sourceFilePath}`);
}

function isPlaceholderTest(script: string): boolean {
  const normalized = script.toLowerCase();
  return normalized.includes("no test specified") || normalized.trim() === "";
}

async function runGateCommand(
  kind: GateCommandResult["kind"],
  command: string,
  args: string[],
  cwd: string,
): Promise<GateCommandResult> {
  const result = await runProcess(command, args, {
    cwd,
    env: { ...process.env, CI: "true" },
  });
  return { ...result, kind };
}

export async function runNodeBuildTestGate(
  repositoryPath: string,
  sourceFilePath: string,
): Promise<GateResult> {
  const startedAt = new Date().toISOString();
  const commands: GateCommandResult[] = [];
  let packageRoot = repositoryPath;

  try {
    packageRoot = await findPackageRoot(repositoryPath, sourceFilePath);
    if (!(await exists(join(packageRoot, "package-lock.json")))) {
      throw new Error("Simple gate requires package-lock.json beside package.json");
    }
    const manifest = JSON.parse(
      await readFile(join(packageRoot, "package.json"), "utf8"),
    ) as PackageManifest;
    const buildScript = manifest.scripts?.build;
    const testScript = manifest.scripts?.test;
    if (!buildScript?.trim()) {
      throw new Error("Simple gate requires a non-empty build script");
    }
    if (!testScript || isPlaceholderTest(testScript)) {
      throw new Error("Simple gate requires a real, non-placeholder test script");
    }

    const install = await runGateCommand("install", "npm", ["ci"], packageRoot);
    commands.push(install);
    if (install.exitCode !== 0 || install.timedOut) {
      throw new Error("npm ci failed");
    }

    const hasTypeScript = Boolean(
      manifest.dependencies?.typescript || manifest.devDependencies?.typescript,
    );
    if (hasTypeScript) {
      const tsconfigPath = join(packageRoot, "tsconfig.json");
      const tscPath = join(packageRoot, "node_modules", ".bin", "tsc");
      if (!(await exists(tsconfigPath)) || !(await exists(tscPath))) {
        throw new Error("TypeScript gate requires tsconfig.json and local tsc");
      }
      const typecheck = await runGateCommand(
        "typecheck",
        tscPath,
        ["--noEmit", "-p", relative(packageRoot, tsconfigPath)],
        packageRoot,
      );
      commands.push(typecheck);
      if (typecheck.exitCode !== 0 || typecheck.timedOut) {
        throw new Error("TypeScript type-check failed");
      }
    }

    const build = await runGateCommand("build", "npm", ["run", "build"], packageRoot);
    commands.push(build);
    if (build.exitCode !== 0 || build.timedOut) {
      throw new Error("Build command failed");
    }

    const test = await runGateCommand("test", "npm", ["test"], packageRoot);
    commands.push(test);
    if (test.exitCode !== 0 || test.timedOut) {
      throw new Error("Test command failed");
    }

    return {
      status: "passed",
      packageRoot,
      commands,
      startedAt,
      completedAt: new Date().toISOString(),
    };
  } catch (error) {
    const failure = error instanceof Error ? error.message : String(error);
    const commandFailed = commands.some(
      (command) => command.exitCode !== 0 || command.timedOut,
    );
    return {
      status: commandFailed ? "failed" : "error",
      packageRoot,
      commands,
      startedAt,
      completedAt: new Date().toISOString(),
      failure,
    };
  }
}
