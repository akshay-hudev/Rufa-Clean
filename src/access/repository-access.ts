import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import YAML from "yaml";

export const REPOSITORY_ROLES = [
  "implementation_repository",
  "analysis_target",
  "test_fixture",
  "remediation_target",
  "publication_target",
  "cross_repository_graph_participant",
  "runtime_evidence_target",
  "contract_analysis_target",
  "scale_test_subject",
] as const;

export type RepositoryRole = (typeof REPOSITORY_ROLES)[number];

export const REPOSITORY_OPERATIONS = [
  "local_inspection",
  "local_modification",
  "local_build_and_test",
  "metadata_read",
  "credential_read",
  "clone",
  "fetch",
  "qualify",
  "static_analysis",
  "semantic_analysis",
  "generate_findings",
  "use_as_fixture",
  "reproduce_finding",
  "prepare_patch",
  "transform_source",
  "remediate",
  "include_cross_repository",
  "collect_runtime_evidence",
  "interpret_runtime_evidence",
  "classify_runtime_evidence",
  "include_contract_analysis",
  "include_microservice_analysis",
  "include_scale_test",
  "branch_create",
  "commit_create",
  "push_non_default_branch",
  "pull_request_create",
  "pull_request_update",
  "publish",
] as const;

export type RepositoryOperation = (typeof REPOSITORY_OPERATIONS)[number];

export interface CanonicalRepositoryIdentity {
  provider: "github";
  owner: string;
  name: string;
}

export interface RepositoryAccessRequest {
  repository: CanonicalRepositoryIdentity;
  role: RepositoryRole;
  operation: RepositoryOperation;
}

export interface RepositoryAccessDecision {
  allowed: boolean;
  repositoryFullName: string;
  role: RepositoryRole;
  operation: RepositoryOperation;
  authorizationId?: string;
  reason:
    | "authorized"
    | "invalid_identity"
    | "invalid_policy"
    | "inactive_authorization"
    | "owner_out_of_scope"
    | "role_operation_mismatch"
    | "identity_operation_denied"
    | "permanent_role_exclusion"
    | "operation_not_authorized";
}

export interface RepositoryAccessAuthorizer {
  authorizedDiscoveryOwners(): string[];
  decide(request: RepositoryAccessRequest): RepositoryAccessDecision;
  assert(request: RepositoryAccessRequest): RepositoryAccessDecision;
}

export interface RepositoryAccessDocuments {
  providerPolicy: unknown;
  roleExclusions: unknown;
  authorization: unknown;
}

interface RecordValue {
  [key: string]: unknown;
}

const ROLE_OPERATIONS: Readonly<Record<RepositoryRole, ReadonlySet<RepositoryOperation>>> = {
  implementation_repository: new Set([
    "local_inspection",
    "local_modification",
    "local_build_and_test",
  ]),
  analysis_target: new Set([
    "metadata_read",
    "credential_read",
    "clone",
    "fetch",
    "qualify",
    "static_analysis",
    "semantic_analysis",
    "generate_findings",
  ]),
  test_fixture: new Set([
    "metadata_read",
    "credential_read",
    "clone",
    "fetch",
    "qualify",
    "use_as_fixture",
    "static_analysis",
    "semantic_analysis",
    "generate_findings",
  ]),
  remediation_target: new Set([
    "metadata_read",
    "credential_read",
    "clone",
    "fetch",
    "reproduce_finding",
    "prepare_patch",
    "transform_source",
    "remediate",
  ]),
  publication_target: new Set([
    "metadata_read",
    "credential_read",
    "clone",
    "fetch",
    "branch_create",
    "commit_create",
    "push_non_default_branch",
    "pull_request_create",
    "pull_request_update",
    "publish",
  ]),
  cross_repository_graph_participant: new Set([
    "metadata_read",
    "credential_read",
    "clone",
    "fetch",
    "include_cross_repository",
  ]),
  runtime_evidence_target: new Set([
    "collect_runtime_evidence",
    "interpret_runtime_evidence",
    "classify_runtime_evidence",
  ]),
  contract_analysis_target: new Set([
    "metadata_read",
    "credential_read",
    "clone",
    "fetch",
    "include_contract_analysis",
    "include_microservice_analysis",
  ]),
  scale_test_subject: new Set([
    "metadata_read",
    "credential_read",
    "clone",
    "fetch",
    "include_scale_test",
  ]),
};

const EXTERNAL_PERMISSION: Readonly<Partial<Record<RepositoryOperation, string>>> = {
  metadata_read: "metadata_read",
  credential_read: "clone",
  clone: "clone",
  fetch: "fetch",
  qualify: "qualification",
  static_analysis: "analysis",
  semantic_analysis: "analysis",
  generate_findings: "analysis",
  use_as_fixture: "isolated_build_and_test",
  reproduce_finding: "analysis",
  prepare_patch: "isolated_build_and_test",
  transform_source: "isolated_build_and_test",
  remediate: "isolated_build_and_test",
  include_cross_repository: "analysis",
  collect_runtime_evidence: "analysis",
  interpret_runtime_evidence: "analysis",
  classify_runtime_evidence: "analysis",
  include_contract_analysis: "analysis",
  include_microservice_analysis: "analysis",
  include_scale_test: "analysis",
  branch_create: "branch_creation",
  commit_create: "commit_creation",
  push_non_default_branch: "push_non_default_branch",
  pull_request_create: "pull_request_creation",
  pull_request_update: "pull_request_update",
  publish: "pull_request_creation",
};

function record(value: unknown): RecordValue | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as RecordValue
    : undefined;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string")
    ? value
    : [];
}

function bool(value: unknown): boolean {
  return value === true;
}

function canonicalIdentity(
  repository: CanonicalRepositoryIdentity,
): { fullName: string; key: string } | undefined {
  if (
    repository.provider !== "github" ||
    !/^[A-Za-z0-9_.-]+$/.test(repository.owner) ||
    !/^[A-Za-z0-9_.-]+$/.test(repository.name)
  ) {
    return undefined;
  }
  const fullName = `${repository.owner}/${repository.name}`;
  return { fullName, key: fullName.toLowerCase() };
}

function parseYaml(path: string): unknown {
  const document = YAML.parseDocument(readFileSync(path, "utf8"), {
    uniqueKeys: true,
  });
  if (document.errors.length > 0) {
    throw new Error(document.errors.map((error) => error.message).join(" | "));
  }
  return document.toJS();
}

function policyIsValid(documents: RepositoryAccessDocuments): boolean {
  const provider = record(documents.providerPolicy);
  const providerPolicy = record(provider?.policy);
  const accountScope = record(provider?.account_scope);
  const roles = record(provider?.repository_roles);
  const exclusions = record(documents.roleExclusions);
  const exclusionPolicy = record(exclusions?.policy);
  const authorization = record(documents.authorization);
  return (
    providerPolicy?.status === "active" &&
    providerPolicy.provider === "github" &&
    providerPolicy.default_decision === "deny" &&
    providerPolicy.decision_model === "repository_identity_role_operation" &&
    accountScope?.require_role_exclusion_check === true &&
    REPOSITORY_ROLES.every((role) => record(roles?.[role]) !== undefined) &&
    exclusionPolicy?.status === "active" &&
    exclusionPolicy.enforcement === "operation_specific" &&
    exclusionPolicy.default_for_unlisted_role_or_operation === "deny" &&
    Array.isArray(exclusions?.decisions) &&
    record(authorization?.authorization) !== undefined
  );
}

function activeAuthorization(documents: RepositoryAccessDocuments): RecordValue | undefined {
  const document = record(documents.authorization);
  const authorization = record(document?.authorization);
  const approval = record(document?.human_approval);
  const validity = record(document?.validity);
  if (
    authorization?.status !== "active" ||
    typeof authorization.id !== "string" ||
    !authorization.id ||
    approval?.approved !== true
  ) {
    return undefined;
  }
  const expiresAt = validity?.expires_at;
  if (
    typeof expiresAt === "string" &&
    Number.isFinite(Date.parse(expiresAt)) &&
    Date.parse(expiresAt) <= Date.now()
  ) {
    return undefined;
  }
  return authorization;
}

function targetExclusion(
  documents: RepositoryAccessDocuments,
  repositoryKey: string,
  role: RepositoryRole,
): boolean {
  const exclusions = record(documents.roleExclusions);
  for (const entry of Array.isArray(exclusions?.decisions) ? exclusions.decisions : []) {
    const decision = record(entry);
    if (
      typeof decision?.full_name === "string" &&
      decision.full_name.toLowerCase() === repositoryKey &&
      record(decision.denied_target_roles)?.[role] !== undefined
    ) {
      return true;
    }
  }
  return false;
}

function identityOperationDenied(
  documents: RepositoryAccessDocuments,
  repositoryKey: string,
  operation: RepositoryOperation,
): boolean {
  const document = record(documents.authorization);
  const external = record(document?.external_operations);
  const github = record(external?.github);
  const rules = Array.isArray(github?.canonical_repository_rules)
    ? github.canonical_repository_rules
    : [];
  const externalOperation = EXTERNAL_PERMISSION[operation];
  if (!externalOperation) {
    return false;
  }
  return rules.some((value) => {
    const rule = record(value);
    const operations = record(rule?.operations);
    return (
      rule?.match === "exact_case_normalized" &&
      typeof rule.canonical_repository_identity === "string" &&
      rule.canonical_repository_identity.toLowerCase() === repositoryKey &&
      operations?.[externalOperation] === "denied"
    );
  });
}

function operationAuthorized(
  documents: RepositoryAccessDocuments,
  request: RepositoryAccessRequest,
  repositoryKey: string,
): boolean {
  const document = record(documents.authorization);
  if (request.role === "implementation_repository") {
    const repositoryAccess = record(document?.repository_access);
    const implementation = record(repositoryAccess?.implementation_repository);
    if (
      typeof implementation?.full_name !== "string" ||
      implementation.full_name.toLowerCase() !== repositoryKey ||
      implementation.role !== "implementation_repository"
    ) {
      return false;
    }
    const implementationFields: Partial<Record<RepositoryOperation, string>> = {
      local_inspection: "local_inspection",
      local_modification: "local_modification",
      local_build_and_test: "local_build_and_test",
    };
    const field = implementationFields[request.operation];
    return field !== undefined && implementation[field] === "allowed";
  }

  const external = record(document?.external_operations);
  const github = record(external?.github);
  const analysis = record(document?.analysis);
  const remediation = record(document?.remediation);
  const publication = record(document?.publication);
  const permission = EXTERNAL_PERMISSION[request.operation];
  if (
    external?.allowed !== true ||
    !stringArray(external.permitted_providers).includes("github") ||
    !stringArray(github?.allowed_owners)
      .map((owner) => owner.toLowerCase())
      .includes(request.repository.owner.toLowerCase()) ||
    !permission ||
    !stringArray(external.permitted_operations).includes(permission)
  ) {
    return false;
  }
  if (
    ["qualify", "static_analysis", "semantic_analysis", "generate_findings",
      "include_cross_repository", "collect_runtime_evidence",
      "interpret_runtime_evidence", "classify_runtime_evidence",
      "include_contract_analysis", "include_microservice_analysis",
      "include_scale_test"].includes(request.operation) &&
    (!bool(analysis?.repository_qualification) && request.operation === "qualify" ||
      !bool(analysis?.evidence_collection) && request.operation !== "qualify")
  ) {
    return false;
  }
  if (
    ["reproduce_finding", "prepare_patch", "transform_source", "remediate"]
      .includes(request.operation) &&
    remediation?.enabled !== true
  ) {
    return false;
  }
  if (
    ["branch_create", "commit_create", "push_non_default_branch",
      "pull_request_create", "pull_request_update", "publish"]
      .includes(request.operation) &&
    publication?.enabled !== true
  ) {
    return false;
  }
  return true;
}

export class RepositoryAccessDeniedError extends Error {
  constructor(readonly decision: RepositoryAccessDecision) {
    super(
      `Repository access denied: ${decision.repositoryFullName} ` +
        `${decision.role}/${decision.operation} (${decision.reason})`,
    );
    this.name = "RepositoryAccessDeniedError";
  }
}

export function createRepositoryAccessAuthorizer(
  documents: RepositoryAccessDocuments,
): RepositoryAccessAuthorizer {
  return {
    authorizedDiscoveryOwners(): string[] {
      if (!policyIsValid(documents) || !activeAuthorization(documents)) {
        throw new Error("Repository discovery denied: policy or authorization is inactive");
      }
      const provider = record(documents.providerPolicy);
      const accountScope = record(provider?.account_scope);
      const document = record(documents.authorization);
      const external = record(document?.external_operations);
      const github = record(external?.github);
      if (
        external?.allowed !== true ||
        !stringArray(external.permitted_providers).includes("github") ||
        !stringArray(external.permitted_operations).includes("repository_discovery")
      ) {
        throw new Error("Repository discovery denied: operation is not authorized");
      }
      const policyOwners = new Set(
        stringArray(accountScope?.allowed_owners).map((owner) => owner.toLowerCase()),
      );
      const owners = stringArray(github?.allowed_owners)
        .filter((owner) => policyOwners.has(owner.toLowerCase()));
      if (owners.length === 0) {
        throw new Error("Repository discovery denied: no authorized owner intersection");
      }
      return owners;
    },
    decide(request): RepositoryAccessDecision {
      const identity = canonicalIdentity(request.repository);
      const base = {
        repositoryFullName: identity?.fullName ?? "[invalid]",
        role: request.role,
        operation: request.operation,
      };
      if (!identity) {
        return { ...base, allowed: false, reason: "invalid_identity" };
      }
      if (!policyIsValid(documents)) {
        return { ...base, allowed: false, reason: "invalid_policy" };
      }
      const authorization = activeAuthorization(documents);
      if (!authorization) {
        return { ...base, allowed: false, reason: "inactive_authorization" };
      }
      const provider = record(documents.providerPolicy);
      const accountScope = record(provider?.account_scope);
      if (
        !stringArray(accountScope?.allowed_owners)
          .map((owner) => owner.toLowerCase())
          .includes(request.repository.owner.toLowerCase())
      ) {
        return {
          ...base,
          allowed: false,
          authorizationId: authorization.id as string,
          reason: "owner_out_of_scope",
        };
      }
      if (!ROLE_OPERATIONS[request.role]?.has(request.operation)) {
        return {
          ...base,
          allowed: false,
          authorizationId: authorization.id as string,
          reason: "role_operation_mismatch",
        };
      }
      if (identityOperationDenied(documents, identity.key, request.operation)) {
        return {
          ...base,
          allowed: false,
          authorizationId: authorization.id as string,
          reason: "identity_operation_denied",
        };
      }
      if (targetExclusion(documents, identity.key, request.role)) {
        return {
          ...base,
          allowed: false,
          authorizationId: authorization.id as string,
          reason: "permanent_role_exclusion",
        };
      }
      if (!operationAuthorized(documents, request, identity.key)) {
        return {
          ...base,
          allowed: false,
          authorizationId: authorization.id as string,
          reason: "operation_not_authorized",
        };
      }
      return {
        ...base,
        allowed: true,
        authorizationId: authorization.id as string,
        reason: "authorized",
      };
    },
    assert(request): RepositoryAccessDecision {
      const decision = this.decide(request);
      if (!decision.allowed) {
        throw new RepositoryAccessDeniedError(decision);
      }
      return decision;
    },
  };
}

export function loadRepositoryAccessAuthorizer(
  repositoryRoot = process.cwd(),
): RepositoryAccessAuthorizer {
  try {
    return createRepositoryAccessAuthorizer({
      providerPolicy: parseYaml(resolve(repositoryRoot, "codex/access/github-repository-policy.yaml")),
      roleExclusions: parseYaml(resolve(repositoryRoot, "codex/access/prohibited-repositories.yaml")),
      authorization: parseYaml(
        resolve(repositoryRoot, "codex/authorizations/current-phase-authorization.yaml"),
      ),
    });
  } catch {
    return createRepositoryAccessAuthorizer({
      providerPolicy: null,
      roleExclusions: null,
      authorization: null,
    });
  }
}
