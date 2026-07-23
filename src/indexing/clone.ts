import type { RepositoryAccessAuthorizer } from "../access/repository-access";
import { readOnlyRepositoryCredential } from "../security/github-credentials";
import { acquireGitHubSource } from "../security/source-acquisition";

interface RepositoryToClone {
  vcs_provider: string;
  org_slug: string;
  repo_slug: string;
  default_branch: string;
}

/**
 * The legacy clone embedded installation credentials in the remote URL and
 * placed workspaces under src/. It is deliberately unavailable. The approved
 * path is security/source-acquisition plus the isolated runner.
 */
export async function cloneRepository(
  repo: RepositoryToClone,
  access: RepositoryAccessAuthorizer,
): Promise<{
  localPath: string;
  commitSha: string;
  cleanup: () => Promise<void>;
}> {
  if (repo.vcs_provider.toLowerCase() !== "github") {
    throw new Error(`Unsupported repository provider: ${repo.vcs_provider}`);
  }
  const source = await acquireGitHubSource({
    owner: repo.org_slug,
    repository: repo.repo_slug,
    revision: repo.default_branch,
    access,
    role: "analysis_target",
    credentialProvider: () => readOnlyRepositoryCredential(
      repo.org_slug,
      repo.repo_slug,
      access,
      "analysis_target",
    ),
  });
  return {
    localPath: source.path,
    commitSha: source.commitSha,
    cleanup: source.cleanup,
  };
}
