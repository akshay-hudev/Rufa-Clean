import { describe, expect, it } from "vitest";

import type { IsolatedCommandResult, IsolatedRunnerSession } from "../security/docker-runner";
import { runQualificationBaseline } from "./baseline";
import type { QualificationConfiguration, StructuredCommandMapping } from "./types";

function command(
  overrides: Partial<IsolatedCommandResult> = {},
): IsolatedCommandResult {
  return {
    command: "fixture",
    args: [],
    cwd: "/workspace",
    exitCode: 0,
    signal: null,
    stdout: "",
    stderr: "",
    startedAt: new Date(0).toISOString(),
    completedAt: new Date(0).toISOString(),
    durationMs: 1,
    timedOut: false,
    networkMode: "none",
    ...overrides,
  };
}

const configuration: QualificationConfiguration = {
  schemaVersion: "1",
  sourceRoots: ["src"],
  testRoots: ["test"],
  generatedRoots: ["generated"],
  excludedRoots: ["node_modules"],
  requiredGates: ["typecheck", "build", "test"],
  optionalGates: [],
  networkProfile: "network-disabled",
  runnerProfile: "isolated-typescript-runner",
};

const common = {
  version: "1" as const,
  workingDirectory: "/workspace" as const,
  environmentAllowlist: ["CI"],
  runnerProfile: "isolated-typescript-runner" as const,
  networkProfile: "network-disabled" as const,
  timeoutSeconds: 600,
  memoryMb: 1024,
  cpuCount: 1,
  processLimit: 128,
  outputLimitBytes: 2_097_152,
};
const mappings: StructuredCommandMapping[] = [
  {
    ...common,
    commandId: "qualification.typecheck.v1",
    executable: "/workspace/node_modules/.bin/tsc",
    args: ["--noEmit", "-p", "tsconfig.json"],
  },
  {
    ...common,
    commandId: "qualification.build.v1",
    executable: "/usr/local/bin/npm",
    args: ["run", "build"],
  },
  {
    ...common,
    commandId: "qualification.test.v1",
    executable: "/usr/local/bin/npm",
    args: ["test"],
  },
];

function session(gateResults: IsolatedCommandResult[] = []): {
  value: IsolatedRunnerSession;
  calls: string[];
} {
  const calls: string[] = [];
  const sourceDigest = "a".repeat(64);
  let gateIndex = 0;
  return {
    calls,
    value: {
      containerName: "phase2-fixture",
      runInstall: async (name, args) => {
        calls.push(`install:${name}:${args.join(" ")}`);
        return command({ command: name, args, networkMode: "registry_proxy" });
      },
      sealNetwork: async () => {
        calls.push("seal");
      },
      run: async (name, args) => {
        if (name === "node") {
          calls.push("digest");
          return command({ command: name, args, stdout: sourceDigest });
        }
        calls.push(`gate:${name}:${args.join(" ")}`);
        return gateResults[gateIndex++] ?? command({ command: name, args });
      },
      readTextArtifact: async () => "",
      copyOut: async () => undefined,
      dispose: async () => {
        calls.push("dispose");
      },
    },
  };
}

describe("Phase 2 isolated baseline evaluator", () => {
  it("installs with scripts disabled, seals network, runs only mapped commands, and cleans up", async () => {
    const fixture = session();
    const result = await runQualificationBaseline({
      session: fixture.value,
      configuration,
      commandMappings: mappings,
    });
    expect(result.map((gate) => gate.status)).toEqual(["passed", "passed", "passed"]);
    expect(fixture.calls[0]).toContain("npm:ci --ignore-scripts --include=dev");
    expect(fixture.calls[1]).toBe("seal");
    expect(fixture.calls.at(-1)).toBe("dispose");
  });

  it("preserves failures and timeouts instead of converting them to empty success", async () => {
    const fixture = session([
      command({ exitCode: 1 }),
      command({ timedOut: true, exitCode: null }),
      command(),
    ]);
    const result = await runQualificationBaseline({
      session: fixture.value,
      configuration,
      commandMappings: mappings,
    });
    expect(result.map((gate) => gate.status)).toEqual(["failed", "timed_out", "passed"]);
  });

  it("returns unavailable when an approved mapping is absent", async () => {
    const fixture = session();
    const result = await runQualificationBaseline({
      session: fixture.value,
      configuration,
      commandMappings: mappings.filter((mapping) => !mapping.commandId.includes("build")),
    });
    expect(result.find((gate) => gate.gateId === "build")).toEqual(
      expect.objectContaining({ status: "unavailable", failureCategory: "approved_command_mapping_missing" }),
    );
  });

  it("blocks a gate that modifies source", async () => {
    const fixture = session();
    let digestCount = 0;
    fixture.value.run = async (name, args) => {
      if (name === "node") {
        digestCount += 1;
        return command({ command: name, args, stdout: digestCount > 1 ? "b".repeat(64) : "a".repeat(64) });
      }
      return command({ command: name, args });
    };
    const result = await runQualificationBaseline({
      session: fixture.value,
      configuration,
      commandMappings: mappings,
    });
    expect(result[0]).toEqual(expect.objectContaining({
      status: "security_blocked",
      sourceModified: true,
    }));
  });
});

