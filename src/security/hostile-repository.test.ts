import { chmod, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { DockerIsolatedRunner, type IsolatedRunnerLimits } from "./docker-runner";

const image = process.env.DCA_RUNNER_IMAGE;
const describeDocker = image ? describe : describe.skip;
let root = "";

const limits: IsolatedRunnerLimits = {
  cpus: 0.5,
  memoryMb: 256,
  diskMb: 32,
  pids: 32,
  timeoutMs: 3_000,
  outputBytes: 1024,
};

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), "dcav2-hostile-repository-"));
  await chmod(root, 0o755);
  await writeFile(join(root, "package.json"), JSON.stringify({ name: "hostile-fixture", version: "1.0.0", private: true }));
  await writeFile(join(root, "package-lock.json"), JSON.stringify({ name: "hostile-fixture", version: "1.0.0", lockfileVersion: 3, requires: true, packages: { "": { name: "hostile-fixture", version: "1.0.0" } } }));
});

afterAll(async () => {
  if (root) {
    await rm(root, { recursive: true, force: true });
  }
});

async function session() {
  const value = await new DockerIsolatedRunner(image!, limits).createSession(root);
  const install = await value.runInstall("npm", ["ci", "--ignore-scripts", "--no-audit", "--no-fund"]);
  expect(install.exitCode).toBe(0);
  expect(install.timedOut).toBe(false);
  await value.sealNetwork();
  return value;
}

describeDocker("hostile repository containment", () => {
  it("is non-root, secret-free, socket-free, Git-free, and host-filesystem isolated", async () => {
    process.env.DCA_HOST_SENTINEL_SECRET = "do-not-expose";
    const runner = await session();
    try {
      const result = await runner.run("node", ["-e", [
        "const fs=require('node:fs');",
        "const report={uid:process.getuid(),secret:process.env.DCA_HOST_SENTINEL_SECRET||null,",
        "database:process.env.DATABASE_URL||null,github:process.env.GITHUB_TOKEN||null,",
        "docker:fs.existsSync('/var/run/docker.sock'),git:fs.existsSync('/workspace/.git/config'),",
        `host:fs.existsSync(${JSON.stringify(join(root, "..", "host-sentinel"))})};`,
        "process.stdout.write(JSON.stringify(report));",
      ].join("")]);
      expect(result.exitCode, `${result.stderr}\n${result.stdout}`).toBe(0);
      expect(JSON.parse(result.stdout)).toEqual({
        uid: 65532, secret: null, database: null, github: null,
        docker: false, git: false, host: false,
      });
      const writeOutside = await runner.run("node", ["-e", "require('node:fs').writeFileSync('/input/escape','bad')"]);
      expect(writeOutside.exitCode).not.toBe(0);
    } finally {
      delete process.env.DCA_HOST_SENTINEL_SECRET;
      await runner.dispose();
    }
  }, 30_000);

  it("denies arbitrary internet and cloud metadata after install", async () => {
    const runner = await session();
    try {
      for (const host of ["example.com", "169.254.169.254"]) {
        const result = await runner.run("node", ["-e", `const s=require('node:net').connect(80,'${host}');s.on('error',()=>process.exit(7));setTimeout(()=>process.exit(9),300)`]);
        expect(result.exitCode).not.toBe(0);
      }
    } finally {
      await runner.dispose();
    }
  }, 30_000);

  it("enforces output, disk, process and memory limits", async () => {
    const outputRunner = await session();
    try {
      const output = await outputRunner.run("node", ["-e", "process.stdout.write('x'.repeat(100000))"]);
      expect(Buffer.byteLength(output.stdout)).toBeLessThanOrEqual(limits.outputBytes);
      const disk = await outputRunner.run("node", ["-e", "require('node:fs').writeFileSync('/workspace/fill',Buffer.alloc(64*1024*1024))"]);
      expect(disk.exitCode).not.toBe(0);
    } finally {
      await outputRunner.dispose();
    }

    const processRunner = await session();
    try {
      const processes = await processRunner.run("node", ["-e", "const c=require('node:child_process');let failed=0,kids=[];for(let i=0;i<100;i++){const k=c.spawn('sleep',['10']);k.on('error',()=>failed++);kids.push(k)}setTimeout(()=>{kids.forEach(k=>k.kill());process.exit(failed>0?0:8)},300)"]);
      expect(processes.exitCode, `${processes.stderr}\n${processes.stdout}`).toBe(0);
    } finally {
      await processRunner.dispose();
    }

    const memoryRunner = await session();
    try {
      const memory = await memoryRunner.run("node", ["-e", "const a=[];while(true)a.push(Buffer.alloc(16*1024*1024,1))"]);
      expect(memory.exitCode).not.toBe(0);
    } finally {
      await memoryRunner.dispose();
    }
  }, 60_000);

  it("kills child and grandchild processes and verifies container cleanup", async () => {
    const runner = await session();
    const result = await runner.run("node", ["-e", "const c=require('node:child_process');c.spawn('sh',['-c','(sleep 5; touch /workspace/survived) & wait'],{detached:false});setInterval(()=>{},1000)"]);
    expect(result.timedOut, JSON.stringify({ exitCode: result.exitCode, signal: result.signal, stderr: result.stderr })).toBe(true);
    await runner.dispose();
    await expect(runner.run("node", ["-e", "process.exit(0)"])).rejects.toThrow(/disposed/);
  }, 30_000);
});
