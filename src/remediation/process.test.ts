import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { runProcess } from "./process";

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("runProcess", () => {
  it("does not inherit non-allowlisted environment variables", async () => {
    process.env.DCA_SENTINEL_SECRET = "must-not-leak";
    const result = await runProcess(process.execPath, ["-e", "process.stdout.write(process.env.DCA_SENTINEL_SECRET ?? '')"], {
      cwd: process.cwd(),
    });
    delete process.env.DCA_SENTINEL_SECRET;
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe("");
  });

  it.skipIf(process.platform === "win32")("terminates a child process group on timeout", async () => {
    const root = await mkdtemp(join(tmpdir(), "dca-process-tree-"));
    roots.push(root);
    const marker = join(root, "survived");
    const script = join(root, "parent.js");
    await writeFile(
      script,
      `require('node:child_process').spawn(process.execPath,['-e',${JSON.stringify(`setTimeout(()=>require('node:fs').writeFileSync(${JSON.stringify(marker)},'bad'),700)`) }],{stdio:'ignore'});setInterval(()=>{},1000)`,
    );
    const result = await runProcess(process.execPath, [script], {
      cwd: root,
      timeoutMs: 100,
    });
    expect(result.timedOut).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    await expect(access(marker)).rejects.toThrow();
  });

  it("caps captured output", async () => {
    const result = await runProcess(process.execPath, ["-e", "process.stdout.write('x'.repeat(10000))"], {
      cwd: process.cwd(),
      outputLimitBytes: 128,
    });
    expect(Buffer.byteLength(result.stdout)).toBe(128);
  });
});
