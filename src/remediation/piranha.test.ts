import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { beforeEach, describe, expect, it, vi } from "vitest";

const runProcess = vi.hoisted(() => vi.fn());

vi.mock("./process", () => ({ runProcess }));

import {
  DEFAULT_EXPORT_ALIAS_RULE_SET_VERSION,
  EXPORTED_VARIABLE_FUNCTION_RULE_SET_VERSION,
  PYTHON_RULE_SET_VERSION,
  ruleSetVersionForLanguage,
  runSimplePiranhaRemoval,
} from "./piranha";

describe("Python Piranha removal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the narrow default-export alias rule", async () => {
    const root = await mkdtemp(join(tmpdir(), "dca-default-export-piranha-"));
    const filePath = "analyzer.ts";
    const absolutePath = join(root, filePath);
    await writeFile(
      absolutePath,
      "export const analyzer = { name: 'example' };\nexport default analyzer;\n",
    );
    runProcess.mockResolvedValue({
      command: "python",
      args: [],
      cwd: root,
      exitCode: 0,
      signal: null,
      stdout: JSON.stringify({
        rewrite_count: 1,
        changed_paths: [absolutePath],
        generator_version: "0.4.8",
        rule_set_version: DEFAULT_EXPORT_ALIAS_RULE_SET_VERSION,
      }),
      stderr: "",
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: 1,
      timedOut: false,
    });

    const result = await runSimplePiranhaRemoval(
      root,
      filePath,
      "default",
      "typescript",
      { shape: "default_export_alias" },
    );

    expect(result.ruleSetVersion).toBe(DEFAULT_EXPORT_ALIAS_RULE_SET_VERSION);
    expect(runProcess).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(["--shape", "default_export_alias"]),
      expect.objectContaining({ cwd: root }),
    );
  });

  it("uses the versioned Python rule and accepts one changed Python file", async () => {
    const root = await mkdtemp(join(tmpdir(), "dca-python-piranha-"));
    const filePath = "helper.py";
    const absolutePath = join(root, filePath);
    await writeFile(absolutePath, "def unused_helper():\n    return 1\n");
    runProcess.mockResolvedValue({
      command: "python",
      args: [],
      cwd: root,
      exitCode: 0,
      signal: null,
      stdout: JSON.stringify({
        rewrite_count: 1,
        changed_paths: [absolutePath],
        generator_version: "0.4.8",
        rule_set_version: PYTHON_RULE_SET_VERSION,
      }),
      stderr: "",
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: 1,
      timedOut: false,
    });

    const result = await runSimplePiranhaRemoval(
      root,
      filePath,
      "unused_helper",
      "python",
    );

    expect(result.ruleSetVersion).toBe(PYTHON_RULE_SET_VERSION);
    expect(runProcess).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(["--language", "python", "--symbol", "unused_helper"]),
      expect.objectContaining({ cwd: root }),
    );
  });

  it("uses the narrow JavaScript exported-variable function rule", async () => {
    const root = await mkdtemp(join(tmpdir(), "dca-js-export-piranha-"));
    const filePath = "client.js";
    const absolutePath = join(root, filePath);
    await writeFile(absolutePath, "export const unused = () => 1\n");
    runProcess.mockResolvedValue({
      command: "python",
      args: [],
      cwd: root,
      exitCode: 0,
      signal: null,
      stdout: JSON.stringify({
        rewrite_count: 1,
        changed_paths: [absolutePath],
        generator_version: "0.4.8",
        rule_set_version: EXPORTED_VARIABLE_FUNCTION_RULE_SET_VERSION,
      }),
      stderr: "",
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: 1,
      timedOut: false,
    });

    const result = await runSimplePiranhaRemoval(
      root,
      filePath,
      "unused",
      "javascript",
      { shape: "exported_variable_function" },
    );

    expect(result.ruleSetVersion).toBe(EXPORTED_VARIABLE_FUNCTION_RULE_SET_VERSION);
    expect(runProcess).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining([
        "--language", "javascript", "--shape", "exported_variable_function",
      ]),
      expect.objectContaining({ cwd: root }),
    );
  });

  it("rejects exported-mode Python removal", () => {
    expect(() => ruleSetVersionForLanguage("python", true)).toThrow(
      "Exported Python removal",
    );
  });
});
