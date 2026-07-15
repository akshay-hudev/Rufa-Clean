import { readFileSync } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";

import { simpleGit } from "simple-git";

interface RepositoryToClone {
  vcs_provider: string;
  org_slug: string;
  repo_slug: string;
  default_branch: string;
}

interface InstallationAuthentication {
  token: string;
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function installationToken(): Promise<string> {
  const { App } = await import("octokit");
  const appId = requiredEnv("GITHUB_APP_ID");
  const installationId = Number(requiredEnv("GITHUB_INSTALLATION_ID"));
  const privateKey = readFileSync(requiredEnv("GITHUB_PRIVATE_KEY_PATH"), "utf8");

  if (!Number.isSafeInteger(installationId) || installationId <= 0) {
    throw new Error("GITHUB_INSTALLATION_ID must be a positive integer");
  }

  const app = new App({ appId, privateKey });
  const octokit = await app.getInstallationOctokit(installationId);
  const authentication = (await octokit.auth({ type: "installation" })) as InstallationAuthentication;
  return authentication.token;
}

export async function cloneRepository(repo: RepositoryToClone): Promise<{
  localPath: string;
  commitSha: string;
  pushBranch: (branch: string) => Promise<void>;
  cleanup: () => Promise<void>;
}> {
  if (repo.vcs_provider.toLowerCase() !== "github") {
    throw new Error(`Unsupported VCS provider: ${repo.vcs_provider}`);
  }

  const scratchRoot = resolve(__dirname, "scratch");
  const randomSuffix = randomBytes(6).toString("hex");
  const localPath = resolve(scratchRoot, `${repo.repo_slug}-${randomSuffix}`);
  await mkdir(scratchRoot, { recursive: true });

  const token = await installationToken();
  const cloneUrl = `https://x-access-token:${encodeURIComponent(token)}@github.com/${encodeURIComponent(repo.org_slug)}/${encodeURIComponent(repo.repo_slug)}.git`;

  try {
    await simpleGit().clone(cloneUrl, localPath, [
      "--depth=1",
      "--single-branch",
      "--branch",
      repo.default_branch,
    ]);
    const commitSha = await simpleGit(localPath).revparse(["HEAD"]);

    return {
      localPath,
      commitSha: commitSha.trim(),
      pushBranch: async (branch: string) => {
        try {
          await simpleGit(localPath).push(["--set-upstream", "origin", branch]);
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(error.message.replaceAll(token, "[REDACTED]"));
          }
          throw error;
        }
      },
      cleanup: () => rm(localPath, { recursive: true, force: true }),
    };
  } catch (error) {
    await rm(localPath, { recursive: true, force: true });
    if (error instanceof Error) {
      throw new Error(error.message.replaceAll(token, "[REDACTED]"));
    }
    throw error;
  }
}
