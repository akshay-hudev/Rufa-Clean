import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const YAML = require("yaml");
const root = process.cwd();
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function parseYaml(relativePath) {
  const document = YAML.parseDocument(read(relativePath), { uniqueKeys: true });
  if (document.errors.length > 0) {
    failures.push(
      `${relativePath}: YAML parse failed: ${document.errors
        .map((error) => error.message)
        .join(" | ")}`,
    );
  }
  return document.toJS();
}

function parseJson(relativePath) {
  try {
    return JSON.parse(read(relativePath));
  } catch (error) {
    failures.push(`${relativePath}: JSON parse failed: ${error.message}`);
    return {};
  }
}

function equal(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function validateSchema(value, schema, location = "$") {
  if (schema.const !== undefined && !equal(value, schema.const)) {
    failures.push(`${location}: expected const ${JSON.stringify(schema.const)}`);
    return;
  }
  if (schema.enum && !schema.enum.some((item) => equal(value, item))) {
    failures.push(`${location}: value is outside enum`);
  }

  const types = Array.isArray(schema.type) ? schema.type : [schema.type];
  if (schema.type) {
    const actual =
      value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
    if (!types.includes(actual)) {
      failures.push(`${location}: expected ${types.join("|")}, got ${actual}`);
      return;
    }
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const required of schema.required ?? []) {
      if (!(required in value)) {
        failures.push(`${location}: missing required property ${required}`);
      }
    }
    if (schema.additionalProperties === false && schema.properties) {
      for (const key of Object.keys(value)) {
        if (!(key in schema.properties)) {
          failures.push(`${location}: unexpected property ${key}`);
        }
      }
    }
    for (const [key, childSchema] of Object.entries(schema.properties ?? {})) {
      if (key in value) {
        validateSchema(value[key], childSchema, `${location}.${key}`);
      }
    }
  }

  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      failures.push(`${location}: expected at least ${schema.minItems} items`);
    }
    if (schema.uniqueItems) {
      const unique = new Set(value.map((item) => JSON.stringify(item)));
      if (unique.size !== value.length) {
        failures.push(`${location}: duplicate array item`);
      }
    }
    if (schema.items) {
      value.forEach((item, index) =>
        validateSchema(item, schema.items, `${location}[${index}]`),
      );
    }
    if (
      schema.contains &&
      !value.some((item) => {
        if (schema.contains.const !== undefined) {
          return equal(item, schema.contains.const);
        }
        return true;
      })
    ) {
      failures.push(`${location}: contains constraint not satisfied`);
    }
  }
}

function validateDocument(documentPath, schemaPath) {
  const document = documentPath.endsWith(".json")
    ? parseJson(documentPath)
    : parseYaml(documentPath);
  const schema = parseJson(schemaPath);
  validateSchema(document, schema, documentPath);
  return document;
}

const accessPolicy = validateDocument(
  "codex/access/github-repository-policy.yaml",
  "codex/schemas/github-repository-policy-v2.schema.json",
);
const rolePolicy = validateDocument(
  "codex/access/prohibited-repositories.yaml",
  "codex/schemas/repository-role-exclusions.schema.json",
);
const currentAuthorization = validateDocument(
  "codex/authorizations/current-phase-authorization.yaml",
  "codex/schemas/phase-authorization-v2.schema.json",
);
validateDocument(
  "codex/authorizations/authorization-template.yaml",
  "codex/schemas/phase-authorization-v2.schema.json",
);
validateDocument(
  "codex/authorizations/phase-0-reconciliation-authorization-request.yaml",
  "codex/schemas/phase-authorization-v2.schema.json",
);

const phase0 = parseYaml("codex/tests/phase-0-tests.yaml");
const phase1 = parseYaml("codex/tests/phase-1-tests.yaml");
const security = parseYaml("codex/tests/security-control-matrix.yaml");

for (const manifest of [phase0, phase1]) {
  for (const reference of manifest.references ?? []) {
    if (!fs.existsSync(path.join(root, reference.path))) {
      failures.push(`${manifest.manifest_id}: missing referenced path ${reference.path}`);
    }
  }
  for (const group of manifest.test_groups ?? []) {
    for (const test of group.tests ?? []) {
      for (const reference of test.requirement_references ?? []) {
        if (!fs.existsSync(path.join(root, reference.path))) {
          failures.push(`${test.test_id}: missing referenced path ${reference.path}`);
        }
      }
    }
  }
}

const requiredRoles = [
  "implementation_repository",
  "analysis_target",
  "test_fixture",
  "remediation_target",
  "publication_target",
  "cross_repository_graph_participant",
  "runtime_evidence_target",
];
for (const role of requiredRoles) {
  if (!rolePolicy.repository_roles?.includes(role)) {
    failures.push(`role policy: missing role ${role}`);
  }
  if (!accessPolicy.repository_roles?.[role]) {
    failures.push(`access policy: missing role ${role}`);
  }
}

const rufa = rolePolicy.decisions?.find(
  (entry) => entry.full_name === "akshay-hudev/Rufa-Clean",
);
if (!rufa) {
  failures.push("role policy: missing Rufa-Clean decision");
} else {
  for (const operation of [
    "local_inspection",
    "local_modification",
    "local_build_and_test",
  ]) {
    if (rufa.implementation_repository?.[operation] !== "authorization_required") {
      failures.push(`role policy: ${operation} must require authorization`);
    }
  }
  for (const role of requiredRoles.slice(1)) {
    if (!Array.isArray(rufa.denied_target_roles?.[role])) {
      failures.push(`role policy: missing permanent denial for ${role}`);
    }
  }
}

for (const [field, expected] of [
  ["read_permission_may_imply_modification", false],
  ["modification_permission_may_imply_analysis", false],
  ["analysis_permission_may_imply_publication", false],
  ["implementation_role_may_imply_target_role", false],
]) {
  if (rolePolicy.evaluation?.[field] !== expected) {
    failures.push(`role policy: ${field} must be false`);
  }
}

if (
  currentAuthorization.repository_access?.implementation_repository?.role !==
  "implementation_repository"
) {
  failures.push("current authorization: implementation role is not explicit");
}

function testsById(manifest) {
  const result = new Map();
  for (const group of manifest.test_groups ?? []) {
    for (const test of group.tests ?? []) {
      if (result.has(test.test_id)) {
        failures.push(`${manifest.manifest_id}: duplicate test ${test.test_id}`);
      }
      result.set(test.test_id, test);
    }
  }
  return result;
}

const manifests = new Map([
  ["codex/tests/phase-0-tests.yaml", testsById(phase0)],
  ["codex/tests/phase-1-tests.yaml", testsById(phase1)],
]);

const expectedAssertions = {
  "p0-repository-role-exclusion-matrix": [
    "implementation-repository-recognized",
    "implementation-access-requires-authorization",
    "read-does-not-imply-modification",
    "implementation-modification-does-not-imply-analysis",
    "analysis-target-qualification-denied",
    "finding-generation-denied",
    "fixture-use-denied",
    "remediation-target-denied",
    "cross-repository-target-denied",
    "runtime-evidence-target-denied",
    "automated-remediation-publication-denied",
    "other-analysis-permission-does-not-imply-publication",
  ],
  "p1-repository-role-exclusion-matrix": [
    "implementation-repository-recognized",
    "implementation-work-does-not-trigger-target-exclusion",
    "operation-permissions-remain-independent",
    "target-qualification-and-findings-denied",
    "fixture-and-remediation-denied",
    "cross-repository-and-runtime-denied",
    "remediation-publication-denied",
  ],
};

for (const [testId, resultIds] of Object.entries(expectedAssertions)) {
  const test = [...manifests.values()]
    .map((tests) => tests.get(testId))
    .find(Boolean);
  if (!test) {
    failures.push(`tests: missing ${testId}`);
    continue;
  }
  const actual = new Set(
    (test.expected_results ?? []).map((result) => result.result_id),
  );
  for (const resultId of resultIds) {
    if (!actual.has(resultId)) {
      failures.push(`${testId}: missing expected result ${resultId}`);
    }
  }
}

for (const control of security.controls ?? []) {
  for (const validation of control.validation_tests ?? []) {
    const tests = manifests.get(validation.manifest_path);
    if (!tests) {
      continue;
    }
    for (const testId of validation.test_ids ?? []) {
      if (!tests.has(testId)) {
        failures.push(
          `${control.control_id}: missing referenced test ${testId} in ${validation.manifest_path}`,
        );
      }
    }
  }
}

const roleControl = (security.controls ?? []).find(
  (control) => control.control_id === "access-repository-role-exclusion",
);
if (!roleControl) {
  failures.push("security matrix: missing access-repository-role-exclusion");
}
const controlIds = new Set(
  (security.controls ?? []).map((control) => control.control_id),
);
for (const phase of security.phase_security_requirements ?? []) {
  for (const controlId of [
    ...(phase.required_control_ids ?? []),
    ...(phase.additional_required_control_ids ?? []),
  ]) {
    if (!controlIds.has(controlId)) {
      failures.push(`${phase.phase_id}: missing security control ${controlId}`);
    }
  }
}

for (const [documentPath, schemaPath] of [
  [
    "codex/access/github-repository-policy.yaml",
    "codex/schemas/github-repository-policy-v2.schema.json",
  ],
  [
    "codex/access/prohibited-repositories.yaml",
    "codex/schemas/repository-role-exclusions.schema.json",
  ],
  [
    "codex/authorizations/current-phase-authorization.yaml",
    "codex/schemas/phase-authorization-v2.schema.json",
  ],
  [
    "codex/authorizations/authorization-template.yaml",
    "codex/schemas/phase-authorization-v2.schema.json",
  ],
  [
    "codex/authorizations/phase-0-reconciliation-authorization-request.yaml",
    "codex/schemas/phase-authorization-v2.schema.json",
  ],
]) {
  if (!fs.existsSync(path.join(root, schemaPath))) {
    failures.push(`${documentPath}: schema path does not resolve: ${schemaPath}`);
  }
}

const markdownFiles = [
  "AGENTS.md",
  ...fs
    .readdirSync(path.join(root, "codex"), { recursive: true })
    .filter((entry) => entry.endsWith(".md"))
    .map((entry) => `codex/${entry}`),
];
for (const file of markdownFiles) {
  const content = read(file);
  const fences = content.match(/^```/gm)?.length ?? 0;
  if (fences % 2 !== 0) {
    failures.push(`${file}: unbalanced fenced code blocks`);
  }
  if (content.includes("\u0000")) {
    failures.push(`${file}: contains NUL`);
  }
}

const legacyConflationPatterns = [
  /absolute prohibited repository/i,
  /prohibited repository must not be/i,
  /deny before content access/i,
  /must not be cloned, inspected/i,
];
for (const file of [
  "AGENTS.md",
  ...fs
    .readdirSync(path.join(root, "codex"), { recursive: true })
    .filter((entry) => /\.(md|ya?ml|json)$/.test(entry))
    .map((entry) => `codex/${entry}`)
    .filter(
      (entry) =>
        entry !== "codex/reports/phase-0-reconciliation-report.md",
    ),
]) {
  const content = read(file);
  for (const pattern of legacyConflationPatterns) {
    if (pattern.test(content)) {
      failures.push(`${file}: legacy identity-only denial wording remains`);
    }
  }
}

const historicalReport =
  "codex/reports/phase-0-reconciliation-report.md";
const historicalReportHash = crypto
  .createHash("sha256")
  .update(read(historicalReport))
  .digest("hex");
if (
  historicalReportHash !==
  "aeb165977083e697d7d794655e0b0503266564f7ea11899688cca842645bfbde"
) {
  failures.push("historical Phase 0 report changed");
}

const statusLines = execFileSync(
  "git",
  ["status", "--porcelain=v1", "--untracked-files=all"],
  { cwd: root, encoding: "utf8" },
)
  .trimEnd()
  .split("\n")
  .filter(Boolean);
for (const line of statusLines) {
  const file = line.slice(3);
  if (
    file === "OPEARTING_GUIDE.MD" ||
    file === "AGENTS.md" ||
    file === "CODEX_EXECUTION_STATE.md" ||
    file.startsWith("codex/")
  ) {
    continue;
  }
  failures.push(`changed path outside governance correction scope: ${file}`);
}

if (failures.length > 0) {
  console.error(`governance validation failed (${failures.length})`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("governance validation passed");
console.log(`roles validated: ${requiredRoles.length}`);
console.log(`phase-0 tests indexed: ${manifests.get("codex/tests/phase-0-tests.yaml").size}`);
console.log(`phase-1 tests indexed: ${manifests.get("codex/tests/phase-1-tests.yaml").size}`);
console.log(`security controls indexed: ${(security.controls ?? []).length}`);
