import { randomBytes } from "node:crypto";
import { access, chmod, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import type {
  RepositoryAccessAuthorizer,
  RepositoryRole,
} from "../access/repository-access";
import { runProcess } from "../remediation/process";
import { allowlistedEnvironment } from "./environment";
import type { ShortLivedCredential } from "./github-credentials";

export interface AcquiredSource {
  path: string;
  commitSha: string;
  cleanup(): Promise<void>;
}

type CredentialProvider = () => Promise<ShortLivedCredential>;

interface SourceAcquisitionDependencies {
  remoteUrl?: (owner: string, repository: string) => string;
}

function requireSlug(value: string, label: string): string {
  if (!/^[A-Za-z0-9_.-]+$/.test(value)) {
    throw new Error(`Invalid GitHub ${label}: ${value}`);
  }
  return value;
}

function redact(value: string, token: string): string {
  return value.replaceAll(token, "[REDACTED]");
}

export async function acquireGitHubSource(input: {
  owner: string;
  repository: string;
  revision: string;
  expectedCommitSha?: string;
  access: RepositoryAccessAuthorizer;
  role: RepositoryRole;
  credentialProvider: CredentialProvider;
}, dependencies: SourceAcquisitionDependencies = {}): Promise<AcquiredSource> {
  const owner = requireSlug(input.owner, "owner");
  const repository = requireSlug(input.repository, "repository");
  if (!input.revision.trim() || input.revision.startsWith("-")) {
    throw new Error("A safe branch, tag, or commit revision is required");
  }
  const accessRequest = {
    repository: { provider: "github" as const, owner, name: repository },
    role: input.role,
  };
  input.access.assert({ ...accessRequest, operation: "clone" });
  const root = await mkdtemp(join(tmpdir(), "dcav2-source-"));
  const checkout = join(root, "repository");
  const askPass = join(root, `askpass-${randomBytes(6).toString("hex")}.js`);
  let token = "";
  let cleaned = false;
  const cleanup = async (): Promise<void> => {
    if (cleaned) {
      return;
    }
    cleaned = true;
    await rm(root, { recursive: true, force: true });
    try {
      await access(root);
      throw new Error(`Source workspace cleanup could not be verified: ${root}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  };

  try {
    input.access.assert({ ...accessRequest, operation: "credential_read" });
    const credential = await input.credentialProvider();
    token = credential.token;
    if (!token || Date.parse(credential.expiresAt) <= Date.now()) {
      throw new Error("Repository credential is empty or expired");
    }
    await writeFile(
      askPass,
      "#!/usr/bin/env node\nconst p=process.argv[2]||'';process.stdout.write(p.toLowerCase().includes('username')?'x-access-token':(process.env.DCA_GIT_PASSWORD||''));\n",
      { mode: 0o700 },
    );
    await chmod(askPass, 0o700);
    const environment = allowlistedEnvironment({
      GIT_ASKPASS: askPass,
      GIT_TERMINAL_PROMPT: "0",
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_CONFIG_GLOBAL: "/dev/null",
      GIT_LFS_SKIP_SMUDGE: "1",
      HOME: root,
      DCA_GIT_PASSWORD: token,
    });
    const remote = dependencies.remoteUrl?.(owner, repository) ??
      `https://github.com/${owner}/${repository}.git`;
    const clone = await runProcess(
      "git",
      ["clone", "--no-tags", "--single-branch", "--branch", input.revision, remote, checkout],
      { cwd: root, env: environment, timeoutMs: 5 * 60_000 },
    );
    if (clone.exitCode !== 0 || clone.timedOut) {
      throw new Error(`Git clone failed: ${redact(clone.stderr || clone.stdout, token)}`);
    }
    if (input.expectedCommitSha) {
      input.access.assert({ ...accessRequest, operation: "fetch" });
      if (!/^[a-f0-9]{40}$/i.test(input.expectedCommitSha)) {
        throw new Error("expectedCommitSha must be a full immutable commit SHA");
      }
      const fetch = await runProcess("git", ["fetch", "origin", input.expectedCommitSha], {
        cwd: checkout,
        env: environment,
        timeoutMs: 5 * 60_000,
      });
      if (fetch.exitCode !== 0 || fetch.timedOut) {
        throw new Error(`Could not fetch authorized commit: ${redact(fetch.stderr || fetch.stdout, token)}`);
      }
    }
    const resolvedRevision = input.expectedCommitSha ?? "HEAD";
    const revParse = await runProcess("git", ["rev-parse", `${resolvedRevision}^{commit}`], {
      cwd: checkout,
      env: allowlistedEnvironment({ GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: "/dev/null", HOME: root }),
      timeoutMs: 30_000,
    });
    const commitSha = revParse.stdout.trim().toLowerCase();
    if (revParse.exitCode !== 0 || !/^[a-f0-9]{40}$/.test(commitSha)) {
      throw new Error("Acquired revision did not resolve to an immutable commit SHA");
    }
    if (input.expectedCommitSha && commitSha !== input.expectedCommitSha.toLowerCase()) {
      throw new Error("Acquired commit does not match the authorized immutable commit");
    }
    const detach = await runProcess("git", ["checkout", "--detach", commitSha], {
      cwd: checkout,
      env: allowlistedEnvironment({ GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: "/dev/null", HOME: root }),
      timeoutMs: 30_000,
    });
    if (detach.exitCode !== 0) {
      throw new Error(`Could not detach immutable source commit: ${detach.stderr}`);
    }

    // Replace clone-created configuration instead of trying to enumerate every
    // potentially unsafe Git key. The runner receives neither a remote nor a
    // credential helper/include/hook configuration.
    await writeFile(
      join(checkout, ".git", "config"),
      "[core]\n\trepositoryformatversion = 0\n\tfilemode = true\n\tbare = false\n\tlogallrefupdates = true\n",
      { mode: 0o600 },
    );
    await rm(askPass, { force: true });
    const config = await readFile(join(checkout, ".git", "config"), "utf8");
    if (/credential|extraheader|insteadof|hooksPath|include|github\.com/i.test(config) || config.includes(token)) {
      throw new Error("Authenticated or unsafe Git configuration remained after acquisition");
    }
    return { path: resolve(checkout), commitSha, cleanup };
  } catch (error) {
    await cleanup();
    if (error instanceof Error && token) {
      throw new Error(redact(error.message, token));
    }
    throw error;
  } finally {
    await rm(askPass, { force: true });
  }
}
