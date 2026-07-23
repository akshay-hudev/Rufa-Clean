import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import Ajv2020 from "ajv/dist/2020";
import { afterEach, describe, expect, it } from "vitest";

import { digestCanonical } from "../milestone/canonical";
import { createQualificationRequest, qualifyRepository } from "./qualify";
import type {
  BaselineGateResult,
  ConfigurationSource,
  ToolRequirement,
} from "./types";

const roots: string[] = [];
const schemaRoot = join(process.cwd(), "codex", "schemas");

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function schema(name: string): Promise<Record<string, unknown>> {
  return JSON.parse(await readFile(join(schemaRoot, name), "utf8")) as Record<string, unknown>;
}

async function artifacts() {
  const root = await mkdtemp(join(tmpdir(), "dcav2-phase2-schema-"));
  roots.push(root);
  await mkdir(join(root, "src"));
  await writeFile(join(root, "src", "main.ts"), "export const value = 1;\n");
  await writeFile(join(root, "tsconfig.json"), JSON.stringify({ include: ["src/**/*.ts"] }));
  await writeFile(join(root, "package.json"), JSON.stringify({
    name: "schema-fixture",
    version: "1.0.0",
    packageManager: "npm@10.9.3",
    scripts: { typecheck: "tsc --noEmit -p tsconfig.json" },
  }));
  await writeFile(join(root, "package-lock.json"), JSON.stringify({
    name: "schema-fixture",
    version: "1.0.0",
    lockfileVersion: 3,
    packages: {
      "": { name: "schema-fixture", version: "1.0.0" },
      "node_modules/typescript": { version: "5.9.3" },
    },
  }));
  const request = createQualificationRequest({
    schemaVersion: "1",
    requestId: "phase2-schema-request",
    accountScopeId: "phase2-schema-tenant",
    authorizationId: "phase-2-qualification-and-configuration-20260723-01",
    repository: {
      provider: "github",
      owner: "fixture",
      name: "schema",
      fullName: "fixture/schema",
    },
    requestedRevision: "main",
    resolvedCommit: "a".repeat(40),
    sourceSnapshotId: "b".repeat(64),
    requestedCapabilities: ["repository.profile.qualify.v1"],
    requestedProfileId: "typescript-single-package-npm-v1",
    requestedAt: "2026-07-23T00:00:00.000Z",
  });
  const configurationSources: ConfigurationSource[] = [{
    authority: "repository_profile",
    value: {
      schemaVersion: "1",
      sourceRoots: ["src"],
      testRoots: [],
      generatedRoots: [],
      excludedRoots: ["node_modules"],
      requiredGates: ["typecheck"],
      optionalGates: [],
      networkProfile: "network-disabled",
      runnerProfile: "isolated-typescript-runner",
    },
  }];
  const tools: ToolRequirement[] = [
    {
      tool: "node", requiredRange: "22.x", resolvedVersion: "22.18.0",
      executable: "/usr/local/bin/node", source: "approved_runner", status: "available",
    },
    {
      tool: "npm", requiredRange: "10.x", resolvedVersion: "10.9.3",
      executable: "/usr/local/bin/npm", source: "approved_runner", status: "available",
    },
    {
      tool: "typescript", requiredRange: "5.9.3", resolvedVersion: "5.9.3",
      executable: "/workspace/node_modules/.bin/tsc", source: "project_local", status: "available",
    },
  ];
  const baselineMaterial = {
    gateId: "typecheck" as const,
    commandId: "qualification.typecheck.v1",
    status: "passed" as const,
    exitCode: 0,
    outputTruncated: false,
    sourceModified: false,
    cleanupStatus: "removed" as const,
  };
  const baseline: BaselineGateResult[] = [{
    ...baselineMaterial,
    resultDigest: digestCanonical(baselineMaterial),
  }];
  const result = await qualifyRepository({
    repositoryPath: root,
    request,
    authorizationActive: true,
    targetAccessAllowed: true,
    configurationSources,
    tools,
    baseline,
  });
  return {
    request,
    configuration: result.configuration.configuration,
    result,
  };
}

describe("Phase 2 JSON Schema instances", () => {
  it("validates generated request, configuration, and result artifacts", async () => {
    const values = await artifacts();
    const ajv = new Ajv2020({ allErrors: true, strict: true, validateFormats: false });
    for (const [name, value] of [
      ["phase2-qualification-request.schema.json", values.request],
      ["phase2-qualification-configuration.schema.json", values.configuration],
      ["phase2-qualification-result.schema.json", values.result],
    ] as const) {
      const validate = ajv.compile(await schema(name));
      expect(validate(value), JSON.stringify(validate.errors)).toBe(true);
    }
  });

  it("rejects unversioned or broadened artifacts", async () => {
    const values = await artifacts();
    const ajv = new Ajv2020({ allErrors: true, strict: true, validateFormats: false });
    const validate = ajv.compile(await schema("phase2-qualification-request.schema.json"));
    expect(validate({ ...values.request, schemaVersion: "2", publication: true })).toBe(false);
  });
});
