import "dotenv/config";

import { access as fileAccess } from "node:fs/promises";

import { loadRepositoryAccessAuthorizer } from "../src/access/repository-access";
import { runIsolatedAnalysis } from "../src/milestone/isolated-analysis";
import { configuredDockerRunner } from "../src/security/docker-runner";
import { readOnlyRepositoryCredential } from "../src/security/github-credentials";
import { acquireGitHubSource } from "../src/security/source-acquisition";

const selected = [
  {
    owner: "akshay-hudev",
    name: "swift-apply-form",
    revision: "main",
    commit: "51e9a90f5b586830af2dd173b4cc3af0e5719fef",
    reason: "realistic TypeScript React single-package repository larger than smoke fixtures",
  },
  {
    owner: "akshay-hudev",
    name: "test-only-usage",
    revision: "main",
    commit: "91d258b9b6c852e923b0021e9afe8222672caba4",
    reason: "TypeScript repository with an available test command and test-only relationships",
  },
  {
    owner: "akshay-hudev",
    name: "reexport-chain",
    revision: "main",
    commit: "513c328c629b3492b5d1a2ca86cdb64811a9e8a0",
    reason: "TypeScript repository with a distinct re-export relationship shape",
  },
  {
    owner: "akshay-hudev",
    name: "barrel-file",
    revision: "main",
    commit: "c2016855f30998d1c33819aea23eed0a086c3007",
    reason: "TypeScript repository exercising barrel-file source relationships",
  },
] as const;

async function main(): Promise<void> {
  const repositoryAccess = loadRepositoryAccessAuthorizer();
  const results: Record<string, unknown>[] = [];
  for (const repository of selected) {
    const identity = {
      provider: "github" as const,
      owner: repository.owner,
      name: repository.name,
    };
    repositoryAccess.assert({
      repository: identity,
      role: "analysis_target",
      operation: "qualify",
    });
    const source = await acquireGitHubSource({
      owner: repository.owner,
      repository: repository.name,
      revision: repository.revision,
      expectedCommitSha: repository.commit,
      access: repositoryAccess,
      role: "analysis_target",
      credentialProvider: () => readOnlyRepositoryCredential(
        repository.owner,
        repository.name,
        repositoryAccess,
        "analysis_target",
      ),
    });
    let cleanup = "not_run";
    try {
      const analysis = await runIsolatedAnalysis({
        session: await configuredDockerRunner().createSession(source.path),
        accountScopeId: "phase-0-representative-evaluation",
        repository: identity,
        commitSha: source.commitSha,
        access: repositoryAccess,
      });
      const classifications = analysis.findings.reduce<Record<string, number>>((counts, finding) => {
        counts[finding.classification] = (counts[finding.classification] ?? 0) + 1;
        return counts;
      }, {});
      results.push({
        canonical_identity: `${repository.owner}/${repository.name}`,
        immutable_base_commit: source.commitSha,
        requested_role: "analysis_target",
        reason: repository.reason,
        operations_performed: [
          "qualification", "credential_read", "clone", "fetch",
          "static_analysis", "semantic_analysis", "generate_findings",
        ],
        analysis_status: "succeeded",
        coverage_status: analysis.coverage.status,
        analyzed_files: analysis.coverage.analyzedFiles.length,
        finding_count: analysis.findings.length,
        finding_classifications: classifications,
        analyzer_runs: analysis.analyzerRuns.map((run) => ({
          analyzer: run.analyzer,
          version: run.version,
          status: run.status,
        })),
      });
    } catch (error) {
      results.push({
        canonical_identity: `${repository.owner}/${repository.name}`,
        immutable_base_commit: source.commitSha,
        requested_role: "analysis_target",
        reason: repository.reason,
        operations_performed: [
          "qualification", "credential_read", "clone", "fetch", "isolated_analysis_attempt",
        ],
        analysis_status: "failed",
        failure: error instanceof Error ? error.message : String(error),
      });
    } finally {
      await source.cleanup();
      try {
        await fileAccess(source.path);
        cleanup = "failed";
      } catch (error) {
        cleanup = (error as NodeJS.ErrnoException).code === "ENOENT" ? "verified" : "failed";
      }
      results.at(-1)!.cleanup_result = cleanup;
    }
  }
  process.stdout.write(`${JSON.stringify({
    schema_version: 1,
    runner_image: process.env.DCA_RUNNER_IMAGE,
    selected_repositories: results,
    external_writes: [],
  }, null, 2)}\n`);
}

void main().catch((error) => {
  process.stderr.write(`${JSON.stringify({
    error: error instanceof Error ? error.message : String(error),
  })}\n`);
  process.exitCode = 1;
});
