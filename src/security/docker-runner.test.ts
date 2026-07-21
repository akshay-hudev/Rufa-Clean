import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ProcessResult } from "../remediation/types";
import { DockerIsolatedRunner } from "./docker-runner";

const PINNED_IMAGE = `dcav2-runner@sha256:${"a".repeat(64)}`;
const roots: string[] = [];

function result(args: string[], stdout = ""): ProcessResult {
  return {
    command: "docker",
    args,
    cwd: "/tmp",
    exitCode: 0,
    signal: null,
    stdout,
    stderr: "",
    startedAt: new Date(0).toISOString(),
    completedAt: new Date(0).toISOString(),
    durationMs: 1,
    timedOut: false,
  };
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("DockerIsolatedRunner", () => {
  it("rejects mutable image tags", () => {
    expect(() => new DockerIsolatedRunner("dcav2-runner:latest")).toThrow(/pinned/);
  });

  it("creates a constrained non-root container and seals network before execution", async () => {
    const root = await mkdtemp(join(tmpdir(), "dca-runner-test-"));
    roots.push(root);
    const calls: string[][] = [];
    const runner = vi.fn(async (_command: string, args: string[]) => {
      calls.push(args);
      if (args[0] === "inspect" && args[1] === "--format") {
        return result(args, "{}\n");
      }
      if (args[0] === "inspect") {
        return { ...result(args), exitCode: 1, stderr: "not found" };
      }
      return result(args);
    });

    const session = await new DockerIsolatedRunner(PINNED_IMAGE, undefined, runner).createSession(root);
    await session.runInstall("npm", ["ci", "--ignore-scripts", "--include=dev"]);
    await session.sealNetwork();
    await session.run("npm", ["test"]);
    await expect(session.readTextArtifact("/workspace/not-allowed.json")).rejects.toThrow(/structured result/);
    await session.dispose();

    const create = calls.find((args) => args[0] === "create") ?? [];
    expect(create).toEqual(expect.arrayContaining([
      "--network", "none", "--read-only", "--user", "65532:65532",
      "--cap-drop", "ALL", "--pids-limit", "128",
      "--env", "NODE_ENV=development", "--env", "NPM_CONFIG_OMIT=",
      "--env", "NPM_CONFIG_PRODUCTION=false",
    ]));
    expect(create.join(" ")).not.toMatch(/DATABASE_URL|GITHUB_|process\.env/);
    expect(calls).toContainEqual(expect.arrayContaining(["exec", "--workdir", "/workspace"]));
    expect(calls).toContainEqual(expect.arrayContaining(["rm", "-f"]));
  });

  it("rejects install commands that could run lifecycle scripts", async () => {
    const root = await mkdtemp(join(tmpdir(), "dca-runner-test-"));
    roots.push(root);
    const runner = vi.fn(async (_command: string, args: string[]) => result(args));
    const session = await new DockerIsolatedRunner(PINNED_IMAGE, undefined, runner).createSession(root);
    await expect(session.runInstall("npm", ["install"])).rejects.toThrow(/npm ci --ignore-scripts/);
  });

  it("requires development dependencies during clean installation", async () => {
    const root = await mkdtemp(join(tmpdir(), "dca-runner-test-"));
    roots.push(root);
    const runner = vi.fn(async (_command: string, args: string[]) => result(args));
    const session = await new DockerIsolatedRunner(PINNED_IMAGE, undefined, runner).createSession(root);
    await expect(
      session.runInstall("npm", ["ci", "--ignore-scripts"]),
    ).rejects.toThrow(/include=dev/);
  });

  it("starts proxy-enabled sessions on a prevalidated internal network and disconnects it after install", async () => {
    const root = await mkdtemp(join(tmpdir(), "dca-runner-test-"));
    roots.push(root);
    const calls: string[][] = [];
    const runner = vi.fn(async (_command: string, args: string[]) => {
      calls.push(args);
      if (args[0] === "network" && args[1] === "inspect") {
        return result(args, "true\n");
      }
      if (args[0] === "inspect" && args[1] === "--format") {
        return result(args, "{}\n");
      }
      if (args[0] === "inspect") {
        return { ...result(args), exitCode: 1, stderr: "not found" };
      }
      return result(args);
    });
    const session = await new DockerIsolatedRunner(
      PINNED_IMAGE,
      undefined,
      runner,
      { networkName: "registry-internal", proxyUrl: "http://registry-proxy:3128" },
    ).createSession(root);

    await session.runInstall("npm", ["ci", "--ignore-scripts", "--include=dev"]);
    await session.sealNetwork();
    await session.dispose();

    const create = calls.find((args) => args[0] === "create") ?? [];
    expect(create).toEqual(expect.arrayContaining(["--network", "registry-internal"]));
    expect(calls.some((args) => args[0] === "network" && args[1] === "connect")).toBe(false);
    expect(calls).toContainEqual(expect.arrayContaining([
      "network", "disconnect", "registry-internal",
    ]));
  });

  it("refuses commands until registry access has been sealed", async () => {
    const root = await mkdtemp(join(tmpdir(), "dca-runner-test-"));
    roots.push(root);
    const runner = vi.fn(async (_command: string, args: string[]) => result(args));
    const session = await new DockerIsolatedRunner(PINNED_IMAGE, undefined, runner).createSession(root);
    await expect(session.run("npm", ["test"])).rejects.toThrow(/sealed/);
  });
});
