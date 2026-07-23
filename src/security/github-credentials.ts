import { readFile } from "node:fs/promises";

import type {
  RepositoryAccessAuthorizer,
  RepositoryRole,
} from "../access/repository-access";

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
  owner: string,
  repositoryName: string,
  permissions: Record<string, "read" | "write">,
  access: RepositoryAccessAuthorizer,
  role: RepositoryRole,
): Promise<ShortLivedCredential> {
  access.assert({
    repository: { provider: "github", owner, name: repositoryName },
    role,
    operation: "credential_read",
  });
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
  owner: string,
  repositoryName: string,
  access: RepositoryAccessAuthorizer,
  role: RepositoryRole,
): Promise<ShortLivedCredential> {
  return repositoryToken(owner, repositoryName, { contents: "read" }, access, role);
}

export async function publisherRepositoryCredential(
  owner: string,
  repositoryName: string,
  access: RepositoryAccessAuthorizer,
): Promise<ShortLivedCredential> {
  return repositoryToken(
    owner,
    repositoryName,
    { contents: "write", pull_requests: "write" },
    access,
    "publication_target",
  );
}
