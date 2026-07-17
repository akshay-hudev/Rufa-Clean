import { realpath } from "node:fs/promises";
import { isAbsolute, join, resolve } from "node:path";

import { runProcess } from "./process";
import type { PiranhaLanguage, PiranhaResult, RemovalShape } from "./types";

interface RunnerOutput {
  rewrite_count: number;
  changed_paths: string[];
  generator_version: string;
  rule_set_version: string;
}

export const EXPECTED_PIRANHA_VERSION = "0.4.8";
const SIMPLE_RULE_SET_VERSION = "simple-top-level-function-v1";
const EXPORTED_RULE_SET_VERSION = "barrel-exported-function-v1";
export const PYTHON_RULE_SET_VERSION = "simple-top-level-python-function-v1";
export const DEFAULT_EXPORT_ALIAS_RULE_SET_VERSION = "default-export-alias-v1";
export const EXPORTED_VARIABLE_FUNCTION_RULE_SET_VERSION =
  "exported-variable-function-v1";
export const EXPORT_MODIFIER_ONLY_RULE_SET_VERSION = "export-modifier-only-v1";

export function ruleSetVersionForLanguage(
  language: PiranhaLanguage,
  allowExported = false,
  shape: RemovalShape = "top_level_function",
): string {
  if (shape === "default_export_alias") {
    if (language === "python") {
      throw new Error("Python has no supported default-export alias removal");
    }
    return DEFAULT_EXPORT_ALIAS_RULE_SET_VERSION;
  }
  if (shape === "exported_variable_function") {
    if (language === "python") {
      throw new Error("Python has no supported exported-variable function removal");
    }
    return EXPORTED_VARIABLE_FUNCTION_RULE_SET_VERSION;
  }
  if (shape === "export_modifier_only") {
    if (language === "python" || language === "javascript") {
      throw new Error("Export-modifier cleanup supports TypeScript/TSX only");
    }
    return EXPORT_MODIFIER_ONLY_RULE_SET_VERSION;
  }
  if (language === "python") {
    if (allowExported) {
      throw new Error("Exported Python removal is outside the simple remediation scope");
    }
    return PYTHON_RULE_SET_VERSION;
  }
  return allowExported ? EXPORTED_RULE_SET_VERSION : SIMPLE_RULE_SET_VERSION;
}

function runnerPath(): string {
  const configured = process.env.PIRANHA_RUNNER_PATH;
  if (configured) {
    return isAbsolute(configured) ? configured : resolve(configured);
  }
  return join(__dirname, "../../scripts/piranha-remove-simple.py");
}

function parseRunnerOutput(stdout: string): RunnerOutput {
  const lines = stdout.trim().split(/\r?\n/).filter(Boolean);
  const lastLine = lines.at(-1);
  if (!lastLine) {
    throw new Error("Piranha runner produced no result");
  }
  const parsed = JSON.parse(lastLine) as Partial<RunnerOutput>;
  if (
    !Number.isInteger(parsed.rewrite_count) ||
    !Array.isArray(parsed.changed_paths) ||
    typeof parsed.generator_version !== "string" ||
    typeof parsed.rule_set_version !== "string"
  ) {
    throw new Error("Piranha runner returned an invalid result");
  }
  return parsed as RunnerOutput;
}

export async function runSimplePiranhaRemoval(
  repositoryPath: string,
  filePath: string,
  symbolName: string,
  language: PiranhaLanguage,
  options: {
    allowExported?: boolean;
    shape?: RemovalShape;
  } = {},
): Promise<PiranhaResult> {
  const absoluteFilePath = resolve(repositoryPath, filePath);
  const python = process.env.PIRANHA_PYTHON ?? "python3";
  const args = [
    runnerPath(),
    "--file",
    absoluteFilePath,
    "--symbol",
    symbolName,
    "--language",
    language,
    "--shape",
    options.shape ?? "top_level_function",
  ];
  if (options.allowExported) {
    args.push("--allow-exported");
  }
  const result = await runProcess(
    python,
    args,
    { cwd: repositoryPath, timeoutMs: 2 * 60 * 1_000 },
  );
  if (result.exitCode !== 0 || result.timedOut) {
    throw new Error(
      `Piranha failed (${result.exitCode ?? result.signal ?? "unknown"}): ` +
        (result.stderr.trim() || result.stdout.trim()),
    );
  }

  const output = parseRunnerOutput(result.stdout);
  const expectedRuleSetVersion = ruleSetVersionForLanguage(
    language,
    options.allowExported ?? false,
    options.shape ?? "top_level_function",
  );
  if (
    output.generator_version !== EXPECTED_PIRANHA_VERSION ||
    output.rule_set_version !== expectedRuleSetVersion
  ) {
    throw new Error(
      `Unexpected Piranha/rule version: ${output.generator_version}/` +
        output.rule_set_version,
    );
  }
  if (output.rewrite_count !== 1 || output.changed_paths.length !== 1) {
    throw new Error(
      `Simple removal requires exactly one rewrite in one file; got ` +
        `${output.rewrite_count} rewrites in ${output.changed_paths.length} files`,
    );
  }
  const [reportedPath, expectedPath] = await Promise.all([
    realpath(resolve(output.changed_paths[0] ?? "")),
    realpath(absoluteFilePath),
  ]);
  if (reportedPath !== expectedPath) {
    throw new Error(`Piranha changed an unexpected file: ${output.changed_paths[0]}`);
  }

  return {
    rewriteCount: output.rewrite_count,
    path: filePath,
    generatorVersion: output.generator_version,
    ruleSetVersion: output.rule_set_version,
  };
}
