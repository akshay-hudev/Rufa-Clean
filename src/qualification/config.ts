import { isAbsolute, normalize, posix, sep } from "node:path";

import { digestCanonical } from "../milestone/canonical";
import type {
  ConfigurationAuthority,
  ConfigurationSource,
  ConfigurationValidation,
  QualificationConfiguration,
} from "./types";

const AUTHORITY: Record<ConfigurationAuthority, number> = {
  repository: 0,
  detected: 1,
  trusted_operator: 2,
  repository_profile: 3,
  tenant_policy: 4,
  phase_authorization: 5,
  permanent_policy: 6,
};

const FIELDS = new Set([
  "schemaVersion",
  "sourceRoots",
  "testRoots",
  "generatedRoots",
  "excludedRoots",
  "requiredGates",
  "optionalGates",
  "networkProfile",
  "runnerProfile",
]);

const SECURITY_FIELDS = new Set([
  "authorization",
  "credentials",
  "publication",
  "remediation",
  "repositoryExclusions",
  "disableDenylist",
  "trustedCommand",
  "markPassed",
]);

function pathValue(value: unknown, field: string, errors: string[]): string[] | undefined {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    errors.push(`${field}_must_be_string_array`);
    return undefined;
  }
  const normalized: string[] = [];
  for (const item of value as string[]) {
    const portable = normalize(item).split(sep).join("/");
    if (
      !portable ||
      portable === ".." ||
      portable.startsWith("../") ||
      isAbsolute(item) ||
      posix.isAbsolute(portable)
    ) {
      errors.push(`${field}_contains_unsafe_path`);
      continue;
    }
    normalized.push(portable === "." ? "." : portable.replace(/\/+$/, ""));
  }
  return [...new Set(normalized)].sort();
}

function gateValue(
  value: unknown,
  field: string,
  errors: string[],
): QualificationConfiguration["requiredGates"] | undefined {
  const allowed = new Set(["typecheck", "build", "test"]);
  if (
    !Array.isArray(value) ||
    value.some((item) => typeof item !== "string" || !allowed.has(item))
  ) {
    errors.push(`${field}_contains_invalid_gate`);
    return undefined;
  }
  return [...new Set(value)] as QualificationConfiguration["requiredGates"];
}

export function validateQualificationConfiguration(
  sources: readonly ConfigurationSource[],
): ConfigurationValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const sourceAuthorities = [...new Set(sources.map((source) => source.authority))];
  const sorted = [...sources].sort(
    (left, right) => AUTHORITY[left.authority] - AUTHORITY[right.authority],
  );
  const merged: Record<string, unknown> = {};
  for (const source of sorted) {
    for (const [key, value] of Object.entries(source.value)) {
      if (SECURITY_FIELDS.has(key)) {
        errors.push(`security_sensitive_field_rejected:${key}:${source.authority}`);
        continue;
      }
      if (!FIELDS.has(key)) {
        errors.push(`unknown_configuration_field:${key}`);
        continue;
      }
      merged[key] = value;
    }
  }
  if (errors.some((error) => error.startsWith("security_sensitive_field_rejected"))) {
    return { status: "security_blocked", sourceAuthorities, errors, warnings };
  }

  const sourceRoots = pathValue(merged.sourceRoots, "sourceRoots", errors);
  const testRoots = pathValue(merged.testRoots, "testRoots", errors);
  const generatedRoots = pathValue(merged.generatedRoots, "generatedRoots", errors);
  const excludedRoots = pathValue(merged.excludedRoots, "excludedRoots", errors);
  const requiredGates = gateValue(merged.requiredGates, "requiredGates", errors);
  const optionalGates = gateValue(merged.optionalGates, "optionalGates", errors);
  const networkProfile = merged.networkProfile;
  const runnerProfile = merged.runnerProfile;
  if (merged.schemaVersion !== "1") {
    errors.push("unsupported_configuration_schema_version");
  }
  if (!["network-disabled", "npm-public-install-only"].includes(String(networkProfile))) {
    errors.push("invalid_network_profile");
  }
  if (runnerProfile !== "isolated-typescript-runner") {
    errors.push("invalid_runner_profile");
  }
  if (requiredGates && optionalGates) {
    const duplicate = requiredGates.find((gate) => optionalGates.includes(gate));
    if (duplicate) errors.push(`gate_cannot_be_required_and_optional:${duplicate}`);
  }
  if (
    !sourceRoots ||
    !testRoots ||
    !generatedRoots ||
    !excludedRoots ||
    !requiredGates ||
    !optionalGates
  ) {
    return {
      status: errors.length ? "invalid" : "incomplete",
      sourceAuthorities,
      errors,
      warnings,
    };
  }
  if (sourceRoots.length === 0) errors.push("sourceRoots_is_required");
  const rootKinds = [
    ["source", sourceRoots],
    ["test", testRoots],
    ["generated", generatedRoots],
    ["excluded", excludedRoots],
  ] as const;
  const owners = new Map<string, string>();
  for (const [kind, paths] of rootKinds) {
    for (const path of paths) {
      const previous = owners.get(path);
      if (previous && previous !== kind) {
        errors.push(`conflicting_root_kind:${path}:${previous}:${kind}`);
      } else {
        owners.set(path, kind);
      }
    }
  }
  if (requiredGates.length === 0) warnings.push("no_required_baseline_gates");
  if (errors.length) {
    return { status: "invalid", sourceAuthorities, errors, warnings };
  }
  const configuration: QualificationConfiguration = {
    schemaVersion: "1",
    sourceRoots,
    testRoots,
    generatedRoots,
    excludedRoots,
    requiredGates,
    optionalGates,
    networkProfile: networkProfile as QualificationConfiguration["networkProfile"],
    runnerProfile: "isolated-typescript-runner",
  };
  return {
    status: "valid",
    configuration,
    sourceAuthorities,
    errors,
    warnings,
    configurationDigest: digestCanonical(configuration),
  };
}
