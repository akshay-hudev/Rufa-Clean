import { readFile } from "node:fs/promises";

export interface ShortLivedCredential {
  token: string;
  expiresAt: string;
}

interface TokenResponse {
  token: string;
  expires_at: string;
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function repositoryToken(
  repositoryName: string,
  permissions: Record<string, "read" | "write">,
): Promise<ShortLivedCredential> {
  const { App } = await import("octokit");
  const installationId = Number(requiredEnv("GITHUB_INSTALLATION_ID"));
  if (!Number.isSafeInteger(installationId) || installationId <= 0) {
    throw new Error("GITHUB_INSTALLATION_ID must be a positive integer");
  }
  const app = new App({
    appId: requiredEnv("GITHUB_APP_ID"),
    privateKey: await readFile(requiredEnv("GITHUB_PRIVATE_KEY_PATH"), "utf8"),
  });
  const response = await app.octokit.request(
    "POST /app/installations/{installation_id}/access_tokens",
    {
      installation_id: installationId,
      repositories: [repositoryName],
      permissions,
    },
  );
  const data = response.data as TokenResponse;
  if (!data.token || !data.expires_at) {
    throw new Error("GitHub returned an invalid installation credential");
  }
  return { token: data.token, expiresAt: data.expires_at };
}

export async function readOnlyRepositoryCredential(
  repositoryName: string,
): Promise<ShortLivedCredential> {
  return repositoryToken(repositoryName, { contents: "read" });
}

export async function publisherRepositoryCredential(
  repositoryName: string,
): Promise<ShortLivedCredential> {
  return repositoryToken(repositoryName, { contents: "write", pull_requests: "write" });
}
