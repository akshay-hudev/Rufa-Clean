import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import YAML from "yaml";

const root = resolve(import.meta.dirname, "../..");
const matrixPath = join(root, "codex/capability-matrix.yaml");
const matrix = YAML.parse(readFileSync(matrixPath, "utf8"), {
  merge: true,
  uniqueKeys: true,
});
const schemaPath = resolve(dirname(matrixPath), matrix.$schema);
const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
const errors = [];

function refValue(ref) {
  if (!ref.startsWith("#/")) {
    throw new Error(`Unsupported external schema reference: ${ref}`);
  }
  return ref.slice(2).split("/")
    .map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"))
    .reduce((value, part) => value[part], schema);
}

function equal(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function validate(value, rule, location, output) {
  if (rule.$ref) {
    validate(value, refValue(rule.$ref), location, output);
    return;
  }
  for (const part of rule.allOf ?? []) {
    validate(value, part, location, output);
  }
  if (rule.if) {
    const conditionErrors = [];
    validate(value, rule.if, location, conditionErrors);
    if (conditionErrors.length === 0 && rule.then) {
      validate(value, rule.then, location, output);
    }
  }
  if (rule.anyOf) {
    const matched = rule.anyOf.some((part) => {
      const candidate = [];
      validate(value, part, location, candidate);
      return candidate.length === 0;
    });
    if (!matched) output.push(`${location}: no anyOf alternative matched`);
  }
  if (Object.hasOwn(rule, "const") && !equal(value, rule.const)) {
    output.push(`${location}: expected const ${JSON.stringify(rule.const)}`);
  }
  if (rule.enum && !rule.enum.some((entry) => equal(value, entry))) {
    output.push(`${location}: value is not in enum`);
  }
  if (rule.type === "object") {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      output.push(`${location}: expected object`);
      return;
    }
    for (const required of rule.required ?? []) {
      if (!Object.hasOwn(value, required)) output.push(`${location}: missing ${required}`);
    }
    if (rule.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!Object.hasOwn(rule.properties ?? {}, key)) {
          output.push(`${location}: unexpected property ${key}`);
        }
      }
    }
    for (const [key, child] of Object.entries(rule.properties ?? {})) {
      if (Object.hasOwn(value, key)) {
        validate(value[key], child, `${location}.${key}`, output);
      }
    }
  } else if (rule.type === "array") {
    if (!Array.isArray(value)) {
      output.push(`${location}: expected array`);
      return;
    }
    if (rule.minItems !== undefined && value.length < rule.minItems) {
      output.push(`${location}: fewer than ${rule.minItems} items`);
    }
    if (rule.uniqueItems) {
      const values = value.map(JSON.stringify);
      if (new Set(values).size !== values.length) output.push(`${location}: duplicate items`);
    }
    if (rule.contains) {
      const contained = value.some((entry, index) => {
        const candidate = [];
        validate(entry, rule.contains, `${location}[${index}]`, candidate);
        return candidate.length === 0;
      });
      if (!contained) output.push(`${location}: contains constraint not met`);
    }
    value.forEach((entry, index) => {
      if (rule.items) validate(entry, rule.items, `${location}[${index}]`, output);
    });
  } else if (rule.type === "string") {
    if (typeof value !== "string") {
      output.push(`${location}: expected string`);
      return;
    }
    if (rule.minLength !== undefined && value.length < rule.minLength) output.push(`${location}: too short`);
    if (rule.maxLength !== undefined && value.length > rule.maxLength) output.push(`${location}: too long`);
    if (rule.pattern && !new RegExp(rule.pattern).test(value)) output.push(`${location}: pattern mismatch`);
    if (rule.format === "date-time" && !Number.isFinite(Date.parse(value))) {
      output.push(`${location}: invalid date-time`);
    }
  } else if (rule.type === "integer") {
    if (!Number.isInteger(value)) {
      output.push(`${location}: expected integer`);
      return;
    }
    if (rule.minimum !== undefined && value < rule.minimum) output.push(`${location}: below minimum`);
    if (rule.maximum !== undefined && value > rule.maximum) output.push(`${location}: above maximum`);
  } else if (rule.type === "boolean" && typeof value !== "boolean") {
    output.push(`${location}: expected boolean`);
  }
}

validate(matrix, schema, "capability-matrix", errors);

const phase0 = YAML.parse(
  readFileSync(join(root, "codex/tests/phase-0-tests.yaml"), "utf8"),
  { uniqueKeys: true },
);
const phase1 = YAML.parse(
  readFileSync(join(root, "codex/tests/phase-1-tests.yaml"), "utf8"),
  { uniqueKeys: true },
);
const security = YAML.parse(
  readFileSync(join(root, "codex/tests/security-control-matrix.yaml"), "utf8"),
  { uniqueKeys: true },
);
const requiredCapabilityIds = new Set([
  ...phase0.capability_ids,
  ...phase1.capability_ids,
]);
const matrixCapabilityIds = new Set(matrix.capabilities.map((capability) => capability.capability_id));
const testIds = new Set(
  [phase0, phase1].flatMap((manifest) =>
    manifest.test_groups.flatMap((group) => group.tests.map((test) => test.test_id))
  ),
);
const controlIds = new Set(security.controls.map((control) => control.control_id));

for (const capabilityId of requiredCapabilityIds) {
  if (!matrixCapabilityIds.has(capabilityId)) {
    errors.push(`capability-matrix: missing declared capability ${capabilityId}`);
  }
}
if (matrix.matrix_summary?.total_capabilities !== matrix.capabilities.length) {
  errors.push("capability-matrix: summary total does not match capability count");
}
for (const capability of matrix.capabilities) {
  for (const controlId of capability.security_control_ids) {
    if (!controlIds.has(controlId)) {
      errors.push(`${capability.capability_id}: unknown security control ${controlId}`);
    }
  }
  for (const reference of capability.test_references ?? []) {
    if (!existsSync(join(root, reference.manifest_path))) {
      errors.push(`${capability.capability_id}: missing manifest ${reference.manifest_path}`);
    }
    for (const testId of reference.test_ids) {
      if (!testIds.has(testId)) {
        errors.push(`${capability.capability_id}: unknown test ${testId}`);
      }
    }
    if (reference.report_identity && !existsSync(join(root, reference.report_identity))) {
      errors.push(`${capability.capability_id}: missing report ${reference.report_identity}`);
    }
  }
  for (const evidence of capability.evidence.evidence_identities) {
    if (
      evidence.description.startsWith("codex/") &&
      !existsSync(join(root, evidence.description))
    ) {
      errors.push(`${capability.capability_id}: missing evidence path ${evidence.description}`);
    }
  }
}
for (const reference of matrix.references ?? []) {
  if (!existsSync(join(root, reference.path))) {
    errors.push(`capability-matrix: missing reference ${reference.path}`);
  }
}

if (errors.length > 0) {
  process.stderr.write(`${errors.join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(
    `capability matrix validation passed: ${matrix.capabilities.length} capabilities, ` +
    `${controlIds.size} security controls, ${testIds.size} test IDs\n`,
  );
}
