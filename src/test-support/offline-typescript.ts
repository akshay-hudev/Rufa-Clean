import { chmod, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { runProcess } from "../remediation/process";
import { allowlistedEnvironment } from "../security/environment";

export async function writeOfflineTypeScriptPackage(
  repositoryRoot: string,
  manifest: Record<string, unknown>,
): Promise<void> {
  const packageSource = await mkdtemp(join(tmpdir(), "dcav2-offline-typescript-"));
  const packageHome = await mkdtemp(join(tmpdir(), "dcav2-offline-npm-home-"));
  try {
    await mkdir(join(packageSource, "bin"), { recursive: true });
    await writeFile(
      join(packageSource, "package.json"),
      JSON.stringify({
        name: "typescript",
        version: "5.9.3",
        bin: { tsc: "bin/tsc.js" },
      }),
    );
    const compiler = join(packageSource, "bin", "tsc.js");
    await writeFile(
      compiler,
      "#!/usr/bin/env node\nrequire('/opt/dcav2/node_modules/typescript/bin/tsc');\n",
    );
    await chmod(compiler, 0o755);
    const packed = await runProcess(
      "npm",
      ["pack", "--ignore-scripts", "--pack-destination", repositoryRoot],
      {
        cwd: packageSource,
        env: allowlistedEnvironment({ HOME: packageHome }),
        timeoutMs: 30_000,
      },
    );
    if (packed.exitCode !== 0 || packed.timedOut) {
      throw new Error(`Could not pack offline TypeScript fixture: ${packed.stderr}`);
    }
    await writeFile(
      join(repositoryRoot, "package.json"),
      JSON.stringify({
        ...manifest,
        devDependencies: { typescript: "file:typescript-5.9.3.tgz" },
      }),
    );
    const locked = await runProcess(
      "npm",
      ["install", "--package-lock-only", "--ignore-scripts", "--offline", "--no-audit", "--no-fund"],
      {
        cwd: repositoryRoot,
        env: allowlistedEnvironment({ HOME: packageHome }),
        timeoutMs: 30_000,
      },
    );
    if (locked.exitCode !== 0 || locked.timedOut) {
      throw new Error(`Could not lock offline TypeScript fixture: ${locked.stderr}`);
    }
  } finally {
    await rm(packageSource, { recursive: true, force: true });
    await rm(packageHome, { recursive: true, force: true });
  }
}
