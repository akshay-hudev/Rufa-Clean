import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it, vi } from "vitest";

import { runNodeBuildTestGate, runPythonBuildTestGate } from "./gate";

describe("runNodeBuildTestGate", () => {
  it("actually executes install, build, and test commands", async () => {
    const root = await mkdtemp(join(tmpdir(), "dca-gate-test-"));
    const manifest = {
      name: "gate-fixture",
      version: "1.0.0",
      scripts: {
        build: "node -e \"require('fs').writeFileSync('build-ran', 'yes')\"",
        test: "node -e \"require('fs').writeFileSync('test-ran', 'yes')\"",
      },
    };
    const lock = {
      name: "gate-fixture",
      version: "1.0.0",
      lockfileVersion: 3,
      requires: true,
      packages: { "": { name: "gate-fixture", version: "1.0.0" } },
    };
    await writeFile(join(root, "package.json"), JSON.stringify(manifest));
    await writeFile(join(root, "package-lock.json"), JSON.stringify(lock));
    await writeFile(join(root, "helper.ts"), "function unusedHelper() {}\n");

    const result = await runNodeBuildTestGate(root, "helper.ts");

    expect(result.status).toBe("passed");
    expect(result.commands.map((command) => command.kind)).toEqual([
      "install",
      "build",
      "test",
    ]);
    expect(await readFile(join(root, "build-ran"), "utf8")).toBe("yes");
    expect(await readFile(join(root, "test-ran"), "utf8")).toBe("yes");
    expect(result.commands.every((command) => command.durationMs >= 0)).toBe(true);
  }, 30_000);

  it("rejects a placeholder test script without reporting a pass", async () => {
    const root = await mkdtemp(join(tmpdir(), "dca-gate-placeholder-"));
    await writeFile(
      join(root, "package.json"),
      JSON.stringify({
        name: "placeholder",
        version: "1.0.0",
        scripts: { build: "echo build", test: "echo Error: no test specified && exit 1" },
      }),
    );
    await writeFile(
      join(root, "package-lock.json"),
      JSON.stringify({
        name: "placeholder",
        version: "1.0.0",
        lockfileVersion: 3,
        requires: true,
        packages: { "": { name: "placeholder", version: "1.0.0" } },
      }),
    );
    await writeFile(join(root, "helper.ts"), "function unusedHelper() {}\n");

    const result = await runNodeBuildTestGate(root, "helper.ts");

    expect(result.status).toBe("error");
    expect(result.failure).toContain("real, non-placeholder test script");
    expect(result.commands).toHaveLength(0);
  });
});

describe("runPythonBuildTestGate", () => {
  it("creates an isolated environment and genuinely compiles and runs pytest", async () => {
    const root = await mkdtemp(join(tmpdir(), "dca-python-gate-test-"));
    await mkdir(join(root, "training/tests"), { recursive: true });
    await mkdir(join(root, "tests"), { recursive: true });
    await writeFile(join(root, "requirements.txt"), "");
    await writeFile(join(root, "training/helper.py"), "def unused_helper():\n    return 1\n");
    await writeFile(
      join(root, "pytest.py"),
      [
        "from pathlib import Path",
        "Path('pytest-ran').write_text('yes')",
        "",
      ].join("\n"),
    );

    const previousPython = process.env.REMEDIATION_PYTHON;
    process.env.REMEDIATION_PYTHON = "/usr/local/bin/python3.12";
    try {
      const result = await runPythonBuildTestGate(root, "training/helper.py");
      expect(result.status).toBe("passed");
      expect(result.commands.map((command) => command.kind)).toEqual([
        "install",
        "install",
        "compile",
        "test",
      ]);
      expect(await readFile(join(root, "pytest-ran"), "utf8")).toBe("yes");
      expect(result.commands.every((command) => command.durationMs >= 0)).toBe(true);
    } finally {
      if (previousPython === undefined) {
        delete process.env.REMEDIATION_PYTHON;
      } else {
        process.env.REMEDIATION_PYTHON = previousPython;
      }
    }
  }, 30_000);

  it("starts, health-checks, records, and stops a configured Python test service", async () => {
    const root = await mkdtemp(join(tmpdir(), "dca-python-service-gate-"));
    await mkdir(join(root, "training/tests"), { recursive: true });
    await mkdir(join(root, "tests"), { recursive: true });
    await writeFile(join(root, "requirements.txt"), "");
    await writeFile(join(root, "training/helper.py"), "def unused_helper():\n    return 1\n");
    await writeFile(
      join(root, "uvicorn.py"),
      [
        "import argparse",
        "import os",
        "from pathlib import Path",
        "import time",
        "parser = argparse.ArgumentParser()",
        "parser.add_argument('module')",
        "parser.add_argument('--host', required=True)",
        "parser.add_argument('--port', required=True, type=int)",
        "parser.parse_args()",
        "Path('service-debug-value').write_text(os.environ['DEBUG'])",
        "while True:",
        "    time.sleep(1)",
        "",
      ].join("\n"),
    );
    await writeFile(
      join(root, "pytest.py"),
      [
        "from pathlib import Path",
        "Path('service-test-ran').write_text('yes')",
        "",
      ].join("\n"),
    );

    const previous = {
      python: process.env.REMEDIATION_PYTHON,
      module: process.env.REMEDIATION_PYTHON_SERVICE_MODULE,
      health: process.env.REMEDIATION_PYTHON_HEALTH_URL,
    };
    process.env.REMEDIATION_PYTHON = "/usr/local/bin/python3.12";
    process.env.REMEDIATION_PYTHON_SERVICE_MODULE = "fixture:app";
    process.env.REMEDIATION_PYTHON_HEALTH_URL = "http://127.0.0.1:18765/health";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("ok", { status: 200 }),
    );
    try {
      const result = await runPythonBuildTestGate(root, "training/helper.py");

      expect(result.status).toBe("passed");
      expect(result.commands.map((command) => command.kind)).toEqual([
        "install",
        "install",
        "service",
        "compile",
        "test",
      ]);
      expect(result.commands.find((command) => command.kind === "service")).toEqual(
        expect.objectContaining({
          args: expect.arrayContaining(["-m", "uvicorn", "fixture:app"]),
          signal: "SIGTERM",
        }),
      );
      expect(await readFile(join(root, "service-test-ran"), "utf8")).toBe("yes");
      expect(await readFile(join(root, "service-debug-value"), "utf8")).toBe("false");
    } finally {
      if (previous.python === undefined) delete process.env.REMEDIATION_PYTHON;
      else process.env.REMEDIATION_PYTHON = previous.python;
      if (previous.module === undefined) delete process.env.REMEDIATION_PYTHON_SERVICE_MODULE;
      else process.env.REMEDIATION_PYTHON_SERVICE_MODULE = previous.module;
      if (previous.health === undefined) delete process.env.REMEDIATION_PYTHON_HEALTH_URL;
      else process.env.REMEDIATION_PYTHON_HEALTH_URL = previous.health;
      fetchMock.mockRestore();
    }
  }, 30_000);

  it("reports a Python test failure without passing the gate", async () => {
    const root = await mkdtemp(join(tmpdir(), "dca-python-gate-failure-"));
    await mkdir(join(root, "training/tests"), { recursive: true });
    await mkdir(join(root, "tests"), { recursive: true });
    await writeFile(join(root, "requirements.txt"), "");
    await writeFile(join(root, "training/helper.py"), "def unused_helper():\n    return 1\n");
    await writeFile(join(root, "pytest.py"), "raise SystemExit(3)\n");

    const previousPython = process.env.REMEDIATION_PYTHON;
    process.env.REMEDIATION_PYTHON = "/usr/local/bin/python3.12";
    try {
      const result = await runPythonBuildTestGate(root, "training/helper.py");

      expect(result.status).toBe("failed");
      expect(result.failure).toContain("Python test command failed");
      expect(result.commands.at(-1)).toEqual(expect.objectContaining({
        kind: "test",
        exitCode: 3,
      }));
    } finally {
      if (previousPython === undefined) {
        delete process.env.REMEDIATION_PYTHON;
      } else {
        process.env.REMEDIATION_PYTHON = previousPython;
      }
    }
  }, 30_000);
});
