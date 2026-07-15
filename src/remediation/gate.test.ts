import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { runNodeBuildTestGate } from "./gate";

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
