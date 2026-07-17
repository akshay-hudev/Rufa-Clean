import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";

import { runProcess, startManagedProcess, type ManagedProcess } from "./process";
import type {
  GateCommandResult,
  GatePhase,
  GateResult,
  PiranhaLanguage,
  VerificationTier,
} from "./types";

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

async function findRootContaining(
  repositoryPath: string,
  sourceFilePath: string,
  marker: string,
): Promise<string> {
  const repositoryRoot = resolve(repositoryPath);
  let current = dirname(resolve(repositoryPath, sourceFilePath));
  while (current.startsWith(repositoryRoot)) {
    if (await exists(join(current, marker))) {
      return current;
    }
    if (current === repositoryRoot) {
      break;
    }
    current = dirname(current);
  }
  throw new Error(`No ${marker} found for ${sourceFilePath}`);
}

async function findPackageRoot(
  repositoryPath: string,
  sourceFilePath: string,
): Promise<string> {
  return findRootContaining(repositoryPath, sourceFilePath, "package.json");
}

function isPlaceholderTest(script: string): boolean {
  const normalized = script.toLowerCase();
  return normalized.includes("no test specified") || normalized.trim() === "";
}

async function hasEslintConfiguration(packageRoot: string): Promise<boolean> {
  const names = [
    ".eslintrc",
    ".eslintrc.js",
    ".eslintrc.cjs",
    ".eslintrc.json",
    ".eslintrc.yml",
    ".eslintrc.yaml",
    "eslint.config.js",
    "eslint.config.mjs",
    "eslint.config.cjs",
  ];
  return (await Promise.all(names.map((name) => exists(join(packageRoot, name)))))
    .some(Boolean);
}

async function runGateCommand(
  kind: GateCommandResult["kind"],
  command: string,
  args: string[],
  cwd: string,
): Promise<GateCommandResult> {
  const env: NodeJS.ProcessEnv = { ...process.env, CI: "true" };
  // npm exposes user configuration as npm_config_* variables to scripts that it
  // launches. Do not let an outer project's legacy allow-scripts setting alter
  // npm behavior inside the independently cloned remediation candidate.
  delete env.npm_config_allow_scripts;
  delete env.NPM_CONFIG_ALLOW_SCRIPTS;
  const result = await runProcess(command, args, {
    cwd,
    env,
  });
  return { ...result, kind };
}

function withPhase(command: GateCommandResult, phase: GatePhase): GateCommandResult {
  return { ...command, phase };
}

function verificationTier(
  commands: GateCommandResult[],
  testsAvailable: boolean,
): VerificationTier {
  if (testsAvailable && commands.some((command) => command.kind === "test")) {
    return "A";
  }
  if (
    commands.some((command) =>
      command.kind === "build" || command.kind === "typecheck" || command.kind === "lint"
    )
  ) {
    return "B";
  }
  return "C";
}

/**
 * A workspace-scoped Node gate for draft batch remediation.
 *
 * Missing tests are recorded, not disguised as passing tests. Every available
 * deterministic check still has to pass. The caller runs this once before and
 * once after the patch and stores both results.
 */
export async function runAdaptiveNodeGate(
  repositoryPath: string,
  sourceFilePaths: string[],
  phase: GatePhase,
): Promise<GateResult> {
  const startedAt = new Date().toISOString();
  const commands: GateCommandResult[] = [];
  const skippedChecks: string[] = [];
  let packageRoot = repositoryPath;

  try {
    if (sourceFilePaths.length === 0) {
      throw new Error("Adaptive gate requires at least one changed source file");
    }
    const roots = await Promise.all(
      sourceFilePaths.map((filePath) => findPackageRoot(repositoryPath, filePath)),
    );
    packageRoot = roots[0] ?? repositoryPath;
    if (roots.some((root) => root !== packageRoot)) {
      throw new Error("One adaptive gate batch cannot span multiple package workspaces");
    }
    if (!(await exists(join(packageRoot, "package-lock.json")))) {
      throw new Error("Adaptive npm gate requires package-lock.json beside package.json");
    }
    const manifest = JSON.parse(
      await readFile(join(packageRoot, "package.json"), "utf8"),
    ) as PackageManifest;

    if (phase === "baseline") {
      const install = withPhase(
        await runGateCommand("install", "npm", ["ci"], packageRoot),
        phase,
      );
      commands.push(install);
      requirePassed(install, "npm ci failed");
    }

    for (const filePath of [...new Set(sourceFilePaths)].sort()) {
      if (!filePath.endsWith(".js")) {
        continue;
      }
      const syntax = withPhase(
        await runGateCommand(
          "syntax",
          process.execPath,
          ["--check", relative(packageRoot, resolve(repositoryPath, filePath))],
          packageRoot,
        ),
        phase,
      );
      commands.push(syntax);
      requirePassed(syntax, `JavaScript syntax check failed for ${filePath}`);
    }

    const hasTypeScript = Boolean(
      manifest.dependencies?.typescript || manifest.devDependencies?.typescript,
    );
    if (manifest.scripts?.typecheck?.trim()) {
      const typecheck = withPhase(
        await runGateCommand("typecheck", "npm", ["run", "typecheck"], packageRoot),
        phase,
      );
      commands.push(typecheck);
      requirePassed(typecheck, "Type-check command failed");
    } else if (hasTypeScript && await exists(join(packageRoot, "tsconfig.json"))) {
      const tscPath = join(packageRoot, "node_modules", ".bin", "tsc");
      if (!(await exists(tscPath))) {
        throw new Error("TypeScript is configured but the local tsc binary is unavailable");
      }
      const typecheck = withPhase(
        await runGateCommand("typecheck", tscPath, ["--noEmit", "-p", "tsconfig.json"], packageRoot),
        phase,
      );
      commands.push(typecheck);
      requirePassed(typecheck, "TypeScript type-check failed");
    } else {
      skippedChecks.push("typecheck unavailable");
    }

    if (manifest.scripts?.build?.trim()) {
      const build = withPhase(
        await runGateCommand("build", "npm", ["run", "build"], packageRoot),
        phase,
      );
      commands.push(build);
      requirePassed(build, "Build command failed");
    } else {
      skippedChecks.push("build script unavailable");
    }

    const lintScript = manifest.scripts?.lint?.trim();
    const lintNeedsInteractiveSetup = Boolean(
      lintScript?.includes("next lint") && !(await hasEslintConfiguration(packageRoot)),
    );
    if (lintScript && !lintNeedsInteractiveSetup) {
      const lint = withPhase(
        await runGateCommand("lint", "npm", ["run", "lint"], packageRoot),
        phase,
      );
      commands.push(lint);
      requirePassed(lint, "Lint command failed");
    } else if (lintNeedsInteractiveSetup) {
      skippedChecks.push("lint unavailable: Next.js requires interactive ESLint setup");
    } else {
      skippedChecks.push("lint script unavailable");
    }

    const testScript = manifest.scripts?.test;
    const testsAvailable = Boolean(testScript && !isPlaceholderTest(testScript));
    if (testsAvailable) {
      const test = withPhase(
        await runGateCommand("test", "npm", ["test"], packageRoot),
        phase,
      );
      commands.push(test);
      requirePassed(test, "Test command failed");
    } else {
      skippedChecks.push("test script unavailable");
    }

    return {
      status: "passed",
      packageRoot,
      commands,
      startedAt,
      completedAt: new Date().toISOString(),
      verificationTier: verificationTier(commands, testsAvailable),
      testsAvailable,
      skippedChecks,
    };
  } catch (error) {
    const failed = failedGateResult(packageRoot, commands, startedAt, error);
    return {
      ...failed,
      verificationTier: verificationTier(commands, false),
      testsAvailable: commands.some((command) => command.kind === "test"),
      skippedChecks,
    };
  }
}

export function combineAdaptiveGateResults(
  baseline: GateResult,
  postRemoval: GateResult,
): GateResult {
  const passed = baseline.status === "passed" && postRemoval.status === "passed";
  const failure = passed
    ? undefined
    : `Differential gate failed: ${baseline.failure ?? postRemoval.failure ?? "unknown failure"}`;
  const result: GateResult = {
    status: passed
      ? "passed"
      : baseline.status === "failed" || postRemoval.status === "failed"
        ? "failed"
        : "error",
    packageRoot: postRemoval.packageRoot || baseline.packageRoot,
    commands: [...baseline.commands, ...postRemoval.commands],
    startedAt: baseline.startedAt,
    completedAt: postRemoval.completedAt,
    skippedChecks: [...new Set([
      ...(baseline.skippedChecks ?? []),
      ...(postRemoval.skippedChecks ?? []),
    ])],
    baseline,
    postRemoval,
  };
  if (failure) {
    result.failure = failure;
  }
  if (postRemoval.verificationTier) {
    result.verificationTier = postRemoval.verificationTier;
  }
  if (postRemoval.testsAvailable !== undefined) {
    result.testsAvailable = postRemoval.testsAvailable;
  }
  return result;
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

function failedGateResult(
  packageRoot: string,
  commands: GateCommandResult[],
  startedAt: string,
  error: unknown,
): GateResult {
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

function requirePassed(command: GateCommandResult, failure: string): void {
  if (command.exitCode !== 0 || command.timedOut) {
    throw new Error(failure);
  }
}

async function waitForService(
  service: ManagedProcess,
  healthUrl: string,
  timeoutMs = 2 * 60 * 1_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let lastFailure = "service did not become ready";
  while (Date.now() < deadline) {
    const exited = service.currentResult();
    if (exited) {
      const diagnostic = (exited.stderr || exited.stdout).trim();
      throw new Error(
        `Python test service exited before readiness` +
          (diagnostic ? `: ${diagnostic.slice(0, 1_000)}` : ""),
      );
    }
    try {
      const response = await fetch(healthUrl, { signal: AbortSignal.timeout(2_000) });
      if (response.ok) {
        return;
      }
      lastFailure = `health endpoint returned ${response.status}`;
    } catch (error) {
      lastFailure = error instanceof Error ? error.message : String(error);
    }
    await new Promise<void>((resolveDelay) => setTimeout(resolveDelay, 500));
  }
  throw new Error(`Python test service readiness timed out: ${lastFailure}`);
}

export async function runPythonBuildTestGate(
  repositoryPath: string,
  sourceFilePath: string,
): Promise<GateResult> {
  const startedAt = new Date().toISOString();
  const commands: GateCommandResult[] = [];
  let packageRoot = resolve(repositoryPath);
  let scratchRoot: string | undefined;
  let service: ManagedProcess | undefined;
  let serviceCommandIndex = -1;

  try {
    packageRoot = await findRootContaining(repositoryPath, sourceFilePath, "requirements.txt");
    scratchRoot = await mkdtemp(join(tmpdir(), "dca-python-gate-"));
    const venvPath = join(scratchRoot, "venv");
    const basePython = process.env.REMEDIATION_PYTHON ?? "python3";

    const createEnvironment = await runGateCommand(
      "install",
      basePython,
      ["-m", "venv", venvPath],
      packageRoot,
    );
    commands.push(createEnvironment);
    requirePassed(createEnvironment, "Python virtual environment creation failed");

    const python = join(venvPath, "bin", "python");
    const install = await runGateCommand(
      "install",
      python,
      ["-m", "pip", "install", "-r", "requirements.txt"],
      packageRoot,
    );
    commands.push(install);
    requirePassed(install, "Python dependency installation failed");

    const serviceModule = process.env.REMEDIATION_PYTHON_SERVICE_MODULE?.trim();
    const healthUrl = process.env.REMEDIATION_PYTHON_HEALTH_URL?.trim();
    if (Boolean(serviceModule) !== Boolean(healthUrl)) {
      throw new Error(
        "Python service gate requires both REMEDIATION_PYTHON_SERVICE_MODULE and " +
          "REMEDIATION_PYTHON_HEALTH_URL",
      );
    }
    if (serviceModule && healthUrl) {
      const parsedHealthUrl = new URL(healthUrl);
      const host = parsedHealthUrl.hostname;
      const port = parsedHealthUrl.port ||
        (parsedHealthUrl.protocol === "https:" ? "443" : "80");
      serviceCommandIndex = commands.length;
      service = startManagedProcess(
        python,
        ["-m", "uvicorn", serviceModule, "--host", host, "--port", port],
        {
          cwd: packageRoot,
          env: {
            ...process.env,
            CI: "true",
            DATABASE_URL: `sqlite:///${join(scratchRoot, "service.db")}`,
            DEBUG: process.env.REMEDIATION_PYTHON_SERVICE_DEBUG ?? "false",
            PYTHONPATH: packageRoot,
            USE_INDUCTIVE_MODE: "false",
          },
        },
      );
      await waitForService(service, healthUrl);
    }

    const sourcePath = relative(packageRoot, resolve(repositoryPath, sourceFilePath));
    const compile = await runGateCommand(
      "compile",
      python,
      ["-m", "py_compile", sourcePath],
      packageRoot,
    );
    commands.push(compile);
    requirePassed(compile, "Python syntax compilation failed");

    const test = await runGateCommand(
      "test",
      python,
      ["-m", "pytest", "training/tests", "tests", "-v", "--tb=short"],
      packageRoot,
    );
    commands.push(test);
    requirePassed(test, "Python test command failed");

    return {
      status: "passed",
      packageRoot,
      commands,
      startedAt,
      completedAt: new Date().toISOString(),
    };
  } catch (error) {
    return failedGateResult(packageRoot, commands, startedAt, error);
  } finally {
    if (service) {
      const serviceResult = await service.stop();
      commands.splice(serviceCommandIndex, 0, { ...serviceResult, kind: "service" });
    }
    if (scratchRoot) {
      await rm(scratchRoot, { recursive: true, force: true });
    }
  }
}

export function runRemovalGate(
  repositoryPath: string,
  sourceFilePath: string,
  language: PiranhaLanguage,
): Promise<GateResult> {
  return language === "python"
    ? runPythonBuildTestGate(repositoryPath, sourceFilePath)
    : runNodeBuildTestGate(repositoryPath, sourceFilePath);
}
