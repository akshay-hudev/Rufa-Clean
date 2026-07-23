import { describe, expect, it } from "vitest";

import { validateQualificationConfiguration } from "./config";

const base = {
  schemaVersion: "1" as const,
  sourceRoots: ["src"],
  testRoots: ["test"],
  generatedRoots: ["generated"],
  excludedRoots: ["node_modules"],
  requiredGates: ["typecheck", "build", "test"] as const,
  optionalGates: [] as const,
  networkProfile: "network-disabled" as const,
  runnerProfile: "isolated-typescript-runner" as const,
};

describe("Phase 2 configuration validation and precedence", () => {
  it("normalizes deterministic complete configuration", () => {
    const first = validateQualificationConfiguration([
      { authority: "repository_profile", value: { ...base, sourceRoots: ["src/", "src"] } },
    ]);
    const second = validateQualificationConfiguration([
      { authority: "repository_profile", value: { ...base, sourceRoots: ["src"] } },
    ]);
    expect(first.status).toBe("valid");
    expect(first.configuration).toEqual(second.configuration);
    expect(first.configurationDigest).toBe(second.configurationDigest);
  });

  it("applies higher-precedence restrictions last", () => {
    const result = validateQualificationConfiguration([
      { authority: "repository", value: { ...base, networkProfile: "npm-public-install-only" } },
      { authority: "phase_authorization", value: { networkProfile: "network-disabled" } },
    ]);
    expect(result.status).toBe("valid");
    expect(result.configuration?.networkProfile).toBe("network-disabled");
  });

  it.each([
    ["disableDenylist", true],
    ["publication", { enabled: true }],
    ["credentials", { expose: true }],
    ["markPassed", true],
  ])("rejects repository security authority field %s", (field, value) => {
    const result = validateQualificationConfiguration([
      { authority: "repository_profile", value: base },
      { authority: "repository", value: { [field]: value } },
    ]);
    expect(result.status).toBe("security_blocked");
    expect(result.errors).toContain(`security_sensitive_field_rejected:${field}:repository`);
  });

  it("rejects unknown, unsafe, conflicting, and incomplete configuration", () => {
    expect(validateQualificationConfiguration([
      { authority: "repository_profile", value: { ...base, unknown: true } },
    ]).status).toBe("invalid");
    expect(validateQualificationConfiguration([
      { authority: "repository_profile", value: { ...base, sourceRoots: ["../escape"] } },
    ]).status).toBe("invalid");
    expect(validateQualificationConfiguration([
      {
        authority: "repository_profile",
        value: { ...base, optionalGates: ["build"] },
      },
    ]).status).toBe("invalid");
    expect(validateQualificationConfiguration([
      { authority: "repository_profile", value: { sourceRoots: ["src"] } },
    ]).status).toBe("invalid");
    expect(validateQualificationConfiguration([
      { authority: "repository_profile", value: { ...base, schemaVersion: "2" } },
    ]).errors).toContain("unsupported_configuration_schema_version");
    expect(validateQualificationConfiguration([
      {
        authority: "repository_profile",
        value: { ...base, sourceRoots: ["src"], generatedRoots: ["src"] },
      },
    ]).errors).toContain("conflicting_root_kind:src:source:generated");
  });
});
