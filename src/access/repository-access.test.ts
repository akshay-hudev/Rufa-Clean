import { describe, expect, it } from "vitest";

import {
  createRepositoryAccessAuthorizer,
  RepositoryAccessDeniedError,
  type RepositoryAccessDocuments,
  type RepositoryAccessRequest,
} from "./repository-access";

const rufa = { provider: "github" as const, owner: "akshay-hudev", name: "Rufa-Clean" };
const eligible = { provider: "github" as const, owner: "akshay-hudev", name: "eligible-repository" };

function documents(): RepositoryAccessDocuments {
  return {
    providerPolicy: {
      policy: {
        status: "active",
        provider: "github",
        default_decision: "deny",
        decision_model: "repository_identity_role_operation",
      },
      account_scope: {
        allowed_owners: ["akshay-hudev"],
        require_role_exclusion_check: true,
      },
      repository_roles: Object.fromEntries([
        "implementation_repository",
        "analysis_target",
        "test_fixture",
        "remediation_target",
        "publication_target",
        "cross_repository_graph_participant",
        "runtime_evidence_target",
        "contract_analysis_target",
        "scale_test_subject",
      ].map((role) => [role, {}])),
    },
    roleExclusions: {
      policy: {
        status: "active",
        enforcement: "operation_specific",
        default_for_unlisted_role_or_operation: "deny",
      },
      decisions: [{
        full_name: "akshay-hudev/Rufa-Clean",
        denied_target_roles: {
          analysis_target: ["qualify", "static_analysis", "generate_findings"],
          test_fixture: ["use_as_fixture"],
          remediation_target: ["remediate"],
          publication_target: ["publish"],
          cross_repository_graph_participant: ["include_cross_repository"],
          runtime_evidence_target: ["classify_runtime_evidence"],
          contract_analysis_target: ["include_contract_analysis"],
          scale_test_subject: ["include_scale_test"],
        },
      }],
    },
    authorization: {
      authorization: { id: "test-authorization", status: "active" },
      human_approval: { approved: true },
      validity: { expires_at: null },
      repository_access: {
        implementation_repository: {
          full_name: "akshay-hudev/Rufa-Clean",
          role: "implementation_repository",
          local_inspection: "allowed",
          local_modification: "allowed",
          local_build_and_test: "allowed",
        },
      },
      external_operations: {
        allowed: true,
        permitted_providers: ["github"],
        permitted_operations: [
          "repository_discovery", "metadata_read", "clone", "fetch", "qualification", "analysis",
          "isolated_build_and_test", "branch_creation", "commit_creation",
          "push_non_default_branch", "pull_request_creation", "pull_request_update",
        ],
        github: { allowed_owners: ["akshay-hudev"] },
      },
      analysis: {
        repository_qualification: true,
        evidence_collection: true,
        machine_classification: true,
      },
      remediation: { enabled: true },
      publication: { enabled: true },
    },
  };
}

function decision(overrides: Partial<RepositoryAccessRequest>) {
  return createRepositoryAccessAuthorizer(documents()).decide({
    repository: eligible,
    role: "analysis_target",
    operation: "static_analysis",
    ...overrides,
  });
}

describe("repository access authorization", () => {
  it("allows explicitly authorized local implementation operations", () => {
    for (const operation of [
      "local_inspection",
      "local_modification",
      "local_build_and_test",
    ] as const) {
      expect(decision({
        repository: rufa,
        role: "implementation_repository",
        operation,
      })).toEqual(expect.objectContaining({ allowed: true, reason: "authorized" }));
    }
  });

  it("authorizes account discovery only for the owner intersection", () => {
    expect(createRepositoryAccessAuthorizer(documents()).authorizedDiscoveryOwners())
      .toEqual(["akshay-hudev"]);
  });

  it.each([
    ["analysis_target", "qualify"],
    ["analysis_target", "static_analysis"],
    ["analysis_target", "generate_findings"],
    ["test_fixture", "use_as_fixture"],
    ["remediation_target", "remediate"],
    ["cross_repository_graph_participant", "include_cross_repository"],
    ["runtime_evidence_target", "classify_runtime_evidence"],
    ["contract_analysis_target", "include_contract_analysis"],
    ["scale_test_subject", "include_scale_test"],
    ["publication_target", "publish"],
  ] as const)("permanently denies Rufa-Clean as %s for %s", (role, operation) => {
    expect(decision({ repository: rufa, role, operation })).toEqual(
      expect.objectContaining({ allowed: false, reason: "permanent_role_exclusion" }),
    );
  });

  it("does not let implementation permission imply analysis", () => {
    expect(decision({
      repository: rufa,
      role: "implementation_repository",
      operation: "static_analysis",
    }).reason).toBe("role_operation_mismatch");
  });

  it("does not let analysis permission imply remediation or publication", () => {
    expect(decision({
      role: "analysis_target",
      operation: "remediate",
    }).reason).toBe("role_operation_mismatch");
    expect(decision({
      role: "analysis_target",
      operation: "publish",
    }).reason).toBe("role_operation_mismatch");
  });

  it("does not let remediation permission imply publication", () => {
    expect(decision({
      role: "remediation_target",
      operation: "publish",
    }).reason).toBe("role_operation_mismatch");
  });

  it("denies inactive authorization", () => {
    const input = documents();
    (input.authorization as { authorization: { status: string } }).authorization.status = "completed";
    expect(createRepositoryAccessAuthorizer(input).decide({
      repository: eligible,
      role: "analysis_target",
      operation: "static_analysis",
    }).reason).toBe("inactive_authorization");
  });

  it("denies invalid or missing policy rather than falling back", () => {
    const input = documents();
    input.roleExclusions = null;
    const authorizer = createRepositoryAccessAuthorizer(input);
    const request = {
      repository: eligible,
      role: "analysis_target" as const,
      operation: "static_analysis" as const,
    };
    expect(authorizer.decide(request).reason).toBe("invalid_policy");
    expect(() => authorizer.assert(request)).toThrow(RepositoryAccessDeniedError);
  });

  it("denies incomplete identity and out-of-scope owners", () => {
    expect(decision({
      repository: { provider: "github", owner: "", name: "repo" },
    }).reason).toBe("invalid_identity");
    expect(decision({
      repository: { provider: "github", owner: "other-owner", name: "repo" },
    }).reason).toBe("owner_out_of_scope");
  });
});
