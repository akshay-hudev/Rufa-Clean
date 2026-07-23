import "dotenv/config";

import { access as fileAccess, readFile } from "node:fs/promises";
import { join } from "node:path";

import {
  loadRepositoryAccessAuthorizer,
  type RepositoryRole,
} from "../src/access/repository-access";
import { runIsolatedAnalysis } from "../src/milestone/isolated-analysis";
import {
  qualifyTypeScriptRepository,
  type QualificationToolchain,
} from "../src/milestone/qualify";
import { configuredDockerRunner } from "../src/security/docker-runner";
import { readOnlyRepositoryCredential } from "../src/security/github-credentials";
import { acquireGitHubSource } from "../src/security/source-acquisition";

const selected: Array<{
  owner: "akshay-hudev";
  name: string;
  revision: string;
  commit: string;
  role: Extract<RepositoryRole, "analysis_target" | "test_fixture">;
  evidenceRole: string;
  reason: string;
}> = [
  {
    owner: "akshay-hudev",
    name: "test-only-usage",
    revision: "main",
    commit: "91d258b9b6c852e923b0021e9afe8222672caba4",
    role: "analysis_target",
    evidenceRole: "primary_representative_reference_and_test_behavior",
    reason: "Eligible non-Rufa single-package npm TypeScript repository with build and test commands.",
  },
  {
    owner: "akshay-hudev",
    name: "rufa-test-lib",
    revision: "main",
    commit: "a1bdd81ad38676b78760309c219d541daec47d77",
    role: "test_fixture",
    evidenceRole: "optional_smoke_finding_only",
    reason: "Optional deterministic smoke fixture; not primary general-capability evidence.",
  },
];

async function toolchain(root: string): Promise<QualificationToolchain> {
  const lock = JSON.parse(
    await readFile(join(root, "package-lock.json"), "utf8"),
  ) as { packages?: Record<string, { version?: unknown }> };
  const compiler = lock.packages?.["node_modules/typescript"]?.version;
  return {
    node: {
      version: "22.18.0",
      executable: "/usr/local/bin/node",
      source: "approved_runner",
    },
    npm: {
      version: "10.9.3",
      executable: "/usr/local/bin/npm",
      source: "approved_runner",
    },
    typescript: {
      version: typeof compiler === "string" ? compiler : "unresolved",
      executable: "/workspace/node_modules/.bin/tsc",
      source: "project_local",
    },
  };
}

async function main(): Promise<void> {
  const access = loadRepositoryAccessAuthorizer();
  const results: Record<string, unknown>[] = [];
  for (const repository of selected) {
    const identity = {
      provider: "github" as const,
      owner: repository.owner,
      name: repository.name,
    };
    if (`${repository.owner}/${repository.name}`.toLowerCase() === "akshay-hudev/rufa-clean") {
      throw new Error("Rufa-Clean must never enter Phase 1 representative evaluation");
    }
    access.assert({ repository: identity, role: repository.role, operation: "qualify" });
    const source = await acquireGitHubSource({
      owner: repository.owner,
      repository: repository.name,
      revision: repository.revision,
      expectedCommitSha: repository.commit,
      access,
      role: repository.role,
      credentialProvider: () => readOnlyRepositoryCredential(
        repository.owner,
        repository.name,
        access,
        repository.role,
      ),
    });
    let cleanup = "not_run";
    try {
      const qualification = await qualifyTypeScriptRepository({
        repositoryPath: source.path,
        repository: identity,
        commitSha: source.commitSha,
        toolchain: await toolchain(source.path),
      });
      if (qualification.status !== "ready") {
        results.push({
          canonical_identity: `${repository.owner}/${repository.name}`,
          immutable_base_commit: source.commitSha,
          requested_role: repository.role,
          evidence_role: repository.evidenceRole,
          selection_reason: repository.reason,
          qualification_status: qualification.status,
          qualification_digest: qualification.qualificationDigest,
          limitations: qualification.reasons,
          analysis_status: "not_run_nonready",
        });
        continue;
      }
      const analysis = await runIsolatedAnalysis({
        session: await configuredDockerRunner().createSession(source.path),
        accountScopeId: "phase-1-representative-evaluation",
        repository: identity,
        commitSha: source.commitSha,
        access,
        role: repository.role,
      });
      const classifications = analysis.findings.reduce<Record<string, number>>(
        (counts, finding) => {
          counts[finding.classification] = (counts[finding.classification] ?? 0) + 1;
          return counts;
        },
        {},
      );
      results.push({
        canonical_identity: `${repository.owner}/${repository.name}`,
        immutable_base_commit: source.commitSha,
        requested_role: repository.role,
        evidence_role: repository.evidenceRole,
        selection_reason: repository.reason,
        operations_performed: [
          "qualification",
          "credential_read",
          "clone",
          "fetch",
          "isolated_build_and_test",
          "static_analysis",
          "semantic_analysis",
          "generate_findings",
        ],
        qualification_status: qualification.status,
        qualification_digest: qualification.qualificationDigest,
        package_identity: qualification.packageIdentity,
        module_count: qualification.modules.length,
        analysis_status: "succeeded",
        coverage_status: analysis.coverage.status,
        finding_count: analysis.findings.length,
        finding_classifications: classifications,
        findings: analysis.findings.map((finding) => ({
          finding_id: finding.findingId,
          function_identity: finding.functionIdentity,
          name: finding.occurrence.name,
          file: finding.occurrence.filePath,
          classification: finding.classification,
          evidence_digest: finding.evidenceDigest,
        })),
        external_writes: [],
      });
    } catch (error) {
      results.push({
        canonical_identity: `${repository.owner}/${repository.name}`,
        immutable_base_commit: source.commitSha,
        requested_role: repository.role,
        evidence_role: repository.evidenceRole,
        selection_reason: repository.reason,
        analysis_status: "failed",
        failure: error instanceof Error ? error.message : String(error),
        external_writes: [],
      });
    } finally {
      await source.cleanup();
      try {
        await fileAccess(source.path);
        cleanup = "failed";
      } catch (error) {
        cleanup = (error as NodeJS.ErrnoException).code === "ENOENT"
          ? "verified"
          : "failed";
      }
      results.at(-1)!.cleanup_result = cleanup;
    }
  }
  process.stdout.write(`${JSON.stringify({
    schema_version: 1,
    authorization_id: "phase-1-typescript-vertical-slice-20260723-01",
    runner_image: process.env.DCA_RUNNER_IMAGE,
    selected_repositories: results,
    rejected_repositories: [
      {
        canonical_identity: "akshay-hudev/Rufa-Clean",
        reason: "permanent_target_role_exclusion",
        operations_performed: [],
      },
      {
        canonical_identity: "akshay-hudev/swift-apply-form",
        reason: "multiple_root_typescript_configurations_and_no_test_command",
        operations_performed: ["prior_inventory_review"],
      },
      {
        canonical_identity: "akshay-hudev/rufa-test-consumer",
        reason: "required_test_gate_unavailable",
        operations_performed: ["prior_inventory_review"],
      },
    ],
    external_writes: [],
  }, null, 2)}\n`);
}

void main().catch((error) => {
  process.stderr.write(`${JSON.stringify({
    error: error instanceof Error ? error.message : String(error),
  })}\n`);
  process.exitCode = 1;
});
