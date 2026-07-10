import { readFileSync } from "node:fs";

export interface RawRepo {
  full_name: string;
  default_branch: string;
  private: boolean;
  archived: boolean;
  pushed_at: string | null;
}

const PAGE_SIZE = 100;
const LOW_RATE_LIMIT_REMAINING = 10;
const MAX_TIMER_DELAY_MS = 2_147_483_647;
const COMMON_APPLICATION_DIRECTORIES = new Set([
  "backend",
  "frontend",
  "client",
  "server",
  "api",
  "web",
  "services",
]);

interface GitHubResponse<T> {
  data: T;
  headers: Record<string, string | undefined>;
}

interface GitHubClient {
  request<T>(route: string, parameters: Record<string, unknown>): Promise<GitHubResponse<T>>;
}

interface InstallationRepositoriesResponse {
  repositories: RawRepo[];
}

interface ContentEntry {
  name: string;
  type: string;
}

let installationOctokit: Promise<GitHubClient> | undefined;

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getOctokit(): Promise<GitHubClient> {
  if (!installationOctokit) {
    installationOctokit = (async () => {
      const { App } = await import("octokit");
      const appId = requiredEnv("GITHUB_APP_ID");
      const installationId = Number(requiredEnv("GITHUB_INSTALLATION_ID"));
      const privateKey = readFileSync(requiredEnv("GITHUB_PRIVATE_KEY_PATH"), "utf8");

      if (!Number.isSafeInteger(installationId) || installationId <= 0) {
        throw new Error("GITHUB_INSTALLATION_ID must be a positive integer");
      }

      const app = new App({
        appId,
        privateKey,
      });
      return (await app.getInstallationOctokit(installationId)) as unknown as GitHubClient;
    })();
  }

  return installationOctokit;
}

async function sleep(milliseconds: number): Promise<void> {
  let remaining = milliseconds;
  while (remaining > 0) {
    const delay = Math.min(remaining, MAX_TIMER_DELAY_MS);
    await new Promise<void>((resolve) => setTimeout(resolve, delay));
    remaining -= delay;
  }
}

async function respectRateLimit(headers: Record<string, string | undefined>): Promise<void> {
  const remaining = Number(headers["x-ratelimit-remaining"]);
  const resetAtSeconds = Number(headers["x-ratelimit-reset"]);

  if (
    !Number.isFinite(remaining) ||
    remaining > LOW_RATE_LIMIT_REMAINING ||
    !Number.isFinite(resetAtSeconds)
  ) {
    return;
  }

  // Add a small buffer so clock skew does not cause the next request to arrive early.
  const waitMs = Math.max(0, resetAtSeconds * 1_000 - Date.now() + 1_000);
  if (waitMs > 0) {
    console.warn(
      `GitHub rate limit is low (${remaining} remaining); waiting ${Math.ceil(waitMs / 1_000)}s`,
    );
    await sleep(waitMs);
  }
}

function pageFromCursor(cursor?: string): number {
  if (cursor === undefined) {
    return 1;
  }

  const page = Number(cursor);
  if (!Number.isSafeInteger(page) || page <= 0) {
    throw new Error(`Invalid GitHub repositories cursor: ${cursor}`);
  }
  return page;
}

export async function listRepositories(
  cursor?: string,
): Promise<{ repos: RawRepo[]; nextCursor?: string }> {
  const page = pageFromCursor(cursor);
  const octokit = await getOctokit();
  const response = await octokit.request<InstallationRepositoriesResponse>(
    "GET /installation/repositories",
    {
      page,
      per_page: PAGE_SIZE,
    },
  );

  await respectRateLimit(response.headers);

  const repos: RawRepo[] = response.data.repositories.map((repo) => ({
    full_name: repo.full_name,
    default_branch: repo.default_branch,
    private: repo.private,
    archived: repo.archived,
    pushed_at: repo.pushed_at,
  }));

  if (response.headers.link?.includes('rel="next"')) {
    return { repos, nextCursor: String(page + 1) };
  }
  return { repos };
}

function errorStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("status" in error)) {
    return undefined;
  }
  const status = (error as { status?: unknown }).status;
  return typeof status === "number" ? status : undefined;
}

function errorHeaders(error: unknown): Record<string, string | undefined> | undefined {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return undefined;
  }

  const response = (error as { response?: unknown }).response;
  if (typeof response !== "object" || response === null || !("headers" in response)) {
    return undefined;
  }

  return (response as { headers: Record<string, string | undefined> }).headers;
}

export async function listRootFiles(owner: string, repo: string): Promise<string[]> {
  try {
    const octokit = await getOctokit();
    const rootResponse = await octokit.request<ContentEntry[] | ContentEntry>(
      "GET /repos/{owner}/{repo}/contents/{path}",
      { owner, repo, path: "" },
    );

    await respectRateLimit(rootResponse.headers);

    if (!Array.isArray(rootResponse.data)) {
      console.error(`GitHub contents response for ${owner}/${repo} was not a directory listing`);
      return [];
    }

    const entries = rootResponse.data.map((entry) => entry.name);
    const directoriesToInspect = rootResponse.data.filter(
      (entry) => entry.type === "dir" && COMMON_APPLICATION_DIRECTORIES.has(entry.name),
    );

    for (const directory of directoriesToInspect) {
      try {
        const response = await octokit.request<ContentEntry[] | ContentEntry>(
          "GET /repos/{owner}/{repo}/contents/{path}",
          { owner, repo, path: directory.name },
        );
        await respectRateLimit(response.headers);

        if (!Array.isArray(response.data)) {
          console.error(
            `GitHub contents response for ${owner}/${repo}/${directory.name} was not a directory listing`,
          );
          continue;
        }

        entries.push(...response.data.map((entry) => `${directory.name}/${entry.name}`));
      } catch (error) {
        const status = errorStatus(error);
        if (status !== 403 && status !== 404) {
          throw error;
        }

        const headers = errorHeaders(error);
        if (headers) {
          await respectRateLimit(headers);
        }
        console.error(
          `Failed to list files for ${owner}/${repo}/${directory.name}: GitHub returned ${status}`,
        );
      }
    }

    return entries;
  } catch (error) {
    const status = errorStatus(error);
    if (status === 403 || status === 404) {
      const headers = errorHeaders(error);
      if (headers) {
        await respectRateLimit(headers);
      }
      console.error(`Failed to list root files for ${owner}/${repo}: GitHub returned ${status}`);
      return [];
    }
    throw error;
  }
}
