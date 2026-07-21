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
export async function cloneRepository(repo: RepositoryToClone): Promise<{
  localPath: string;
  commitSha: string;
  pushBranch: (branch: string) => Promise<void>;
  cleanup: () => Promise<void>;
}> {
  void repo;
  throw new Error(
    "Legacy authenticated-URL cloning is disabled. Use trusted source acquisition and the isolated milestone runner.",
  );
}
