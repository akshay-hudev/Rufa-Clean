import "dotenv/config";

import { access as fileAccess, readFile } from "node:fs/promises";
import { join } from "node:path";

import { loadRepositoryAccessAuthorizer } from "../src/access/repository-access";
import { digestCanonical } from "../src/milestone/canonical";
import { runQualificationBaseline } from "../src/qualification/baseline";
import {
  createQualificationRequest,
  qualifyRepository,
} from "../src/qualification/qualify";
import {
  PHASE_2_CAPABILITY_IDS,
  type BaselineGateResult,
  type ConfigurationSource,
  type ToolRequirement,
} from "../src/qualification/types";
import { configuredDockerRunner } from "../src/security/docker-runner";
import { readOnlyRepositoryCredential } from "../src/security/github-credentials";
import { acquireGitHubSource } from "../src/security/source-acquisition";

const AUTHORIZATION_ID = "phase-2-qualification-and-configuration-20260723-01";

const selected = [
  {
    name: "test-only-usage",
    revision: "main",
    commit: "91d258b9b6c852e923b0021e9afe8222672caba4",
    reason: "Primary compact npm TypeScript repository with build and test gates.",
  },
  {
    name: "swift-apply-form",
    revision: "main",
    commit: "51e9a90f5b586830af2dd173b4cc3af0e5719fef",
    reason: "Larger React/Vite TypeScript repository with a different configuration shape.",
  },
  {
    name: "rufa-test-consumer",
    revision: "main",
    commit: "e85f11a783f69dfb411d643707c7012088211df6",
    reason: "Small npm TypeScript consumer with deliberately limited baseline gates.",
  },
  {
    name: "query-test",
    revision: "main",
    commit: "151cd64dd1ba59e330b31806fe8570f207fd6d8d",
    reason: "Large pnpm/Nx monorepo used to prove explicit unsupported-profile reporting.",
  },
  {
    name: "rufa-test-lib",
    revision: "main",
    commit: "a1bdd81ad38676b78760309c219d541daec47d77",
    reason: "Optional deterministic smoke repository only; never primary capability evidence.",
  },
] as const;

const configurationSources: ConfigurationSource[] = [{
  authority: "repository_profile",
  value: {
    schemaVersion: "1",
    sourceRoots: ["src"],
    testRoots: ["test", "tests", "__tests__"],
    generatedRoots: ["generated", "src/generated"],
    excludedRoots: ["node_modules", "dist", "build", "coverage"],
    requiredGates: ["typecheck"],
    optionalGates: ["build", "test"],
    networkProfile: "network-disabled",
    runnerProfile: "isolated-typescript-runner",
  },
}];

async function tools(root: string): Promise<ToolRequirement[]> {
  let typescriptVersion: string | undefined;
  try {
    const lock = JSON.parse(await readFile(join(root, "package-lock.json"), "utf8")) as {
      packages?: Record<string, { version?: unknown }>;
    };
    const locked = lock.packages?.["node_modules/typescript"]?.version;
    if (typeof locked === "string") typescriptVersion = locked;
  } catch {
    // Missing or malformed npm lock data is qualification evidence, not success.
  }
  return [
    {
      tool: "node",
      requiredRange: "22.x",
      resolvedVersion: "22.18.0",
      executable: "/usr/local/bin/node",
      source: "approved_runner",
      status: "available",
    },
    {
      tool: "npm",
      requiredRange: "10.x-11.x",
      resolvedVersion: "10.9.3",
      executable: "/usr/local/bin/npm",
      source: "approved_runner",
      status: "available",
    },
    {
      tool: "typescript",
      requiredRange: typescriptVersion ?? "unresolved",
      ...(typescriptVersion ? { resolvedVersion: typescriptVersion } : {}),
      executable: "/workspace/node_modules/.bin/tsc",
      source: "project_local",
      status: typescriptVersion ? "available" : "missing",
    },
  ];
}

async function main(): Promise<void> {
  const access = loadRepositoryAccessAuthorizer();
  const results: Record<string, unknown>[] = [];
  for (const repository of selected) {
    const owner = "akshay-hudev";
    const fullName = `${owner}/${repository.name}`;
    if (fullName.toLowerCase() === "akshay-hudev/rufa-clean") {
      throw new Error("Rufa-Clean must never enter Phase 2 target qualification");
    }
    const identity = { provider: "github" as const, owner, name: repository.name };
    access.assert({ repository: identity, role: "analysis_target", operation: "qualify" });
    const source = await acquireGitHubSource({
      owner,
      repository: repository.name,
      revision: repository.revision,
      expectedCommitSha: repository.commit,
      access,
      role: "analysis_target",
      credentialProvider: () => readOnlyRepositoryCredential(
        owner,
        repository.name,
        access,
        "analysis_target",
      ),
    });
    try {
      const request = createQualificationRequest({
        schemaVersion: "1",
        requestId: `phase2-${repository.name}-${source.commitSha.slice(0, 12)}`,
        accountScopeId: "phase-2-representative-qualification",
        authorizationId: AUTHORIZATION_ID,
        repository: { ...identity, fullName },
        requestedRevision: repository.revision,
        resolvedCommit: source.commitSha,
        sourceSnapshotId: digestCanonical({
          provider: "github",
          owner,
          repository: repository.name,
          commitSha: source.commitSha,
        }),
        requestedCapabilities: [...PHASE_2_CAPABILITY_IDS],
        requestedProfileId: "typescript-single-package-npm-v1",
        requestedAt: "2026-07-23T00:00:00.000Z",
      });
      const detectedTools = await tools(source.path);
      const preflight = await qualifyRepository({
        repositoryPath: source.path,
        request,
        authorizationActive: true,
        targetAccessAllowed: true,
        configurationSources,
        tools: detectedTools,
        baseline: [],
      });
      let baseline: BaselineGateResult[] = [];
      if (
        preflight.profile.status === "matched" &&
        preflight.configuration.configuration
      ) {
        baseline = await runQualificationBaseline({
          session: await configuredDockerRunner().createSession(source.path),
          configuration: preflight.configuration.configuration,
          commandMappings: preflight.commandMappings,
        });
      }
      const qualification = await qualifyRepository({
        repositoryPath: source.path,
        request,
        authorizationActive: true,
        targetAccessAllowed: true,
        configurationSources,
        tools: detectedTools,
        baseline,
      });
      results.push({
        canonical_identity: fullName,
        immutable_revision: source.commitSha,
        reason_for_selection: repository.reason,
        evidence_role: repository.name === "rufa-test-lib"
          ? "optional_smoke_only"
          : "representative_qualification",
        requested_role: "analysis_target",
        operations_performed: [
          "qualification",
          "credential_read",
          "clone",
          "fetch",
          ...(baseline.length ? ["isolated_build_and_test"] : []),
        ],
        language_profile: qualification.languages,
        package_manager: qualification.packageManager,
        workspace: qualification.workspace,
        configuration_status: qualification.configuration.status,
        baseline,
        qualification_status: qualification.status,
        qualification_digest: qualification.qualificationDigest,
        capability_routes: qualification.capabilityRoutes,
        limitations: qualification.blockers,
        analysis_status: "not_run_phase_2_prohibition",
        external_writes: [],
      });
    } catch (error) {
      results.push({
        canonical_identity: fullName,
        immutable_revision: source.commitSha,
        reason_for_selection: repository.reason,
        requested_role: "analysis_target",
        qualification_status: "failed",
        failure_category: error instanceof Error ? error.message : String(error),
        analysis_status: "not_run_phase_2_prohibition",
        external_writes: [],
      });
    } finally {
      await source.cleanup();
      let cleanup = "failed";
      try {
        await fileAccess(source.path);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") cleanup = "verified";
      }
      results.at(-1)!.cleanup_result = cleanup;
    }
  }
  process.stdout.write(`${JSON.stringify({
    schema_version: 1,
    authorization_id: AUTHORIZATION_ID,
    runner_image: process.env.DCA_RUNNER_IMAGE ?? "UNAVAILABLE",
    selected_repositories: results,
    rejected_repositories: [
      {
        canonical_identity: "akshay-hudev/Rufa-Clean",
        reason: "permanent_target_role_exclusion",
        operations_performed: ["account_repository_discovery"],
        content_access_performed: false,
      },
    ],
    paid_or_metered_services_used: [],
    external_writes: [],
  }, null, 2)}\n`);
}

void main().catch((error) => {
  process.stderr.write(`${JSON.stringify({
    error: error instanceof Error ? error.message : String(error),
  })}\n`);
  process.exitCode = 1;
});
