import { randomBytes } from "node:crypto";
import { access, chmod, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { runProcess } from "../remediation/process";
import { allowlistedEnvironment } from "../security/environment";
import { publisherRepositoryCredential } from "../security/github-credentials";
import type { DraftPullRequestGateway, DraftPullRequestInput, DraftPullRequestResult } from "./publisher";

function redact(value: string, secret: string): string {
  return value.replaceAll(secret, "[REDACTED]");
}

export class GitHubDraftPublisher implements DraftPullRequestGateway {
  async createDraftPullRequest(input: DraftPullRequestInput): Promise<DraftPullRequestResult> {
    const root = await mkdtemp(join(tmpdir(), "dcav2-publisher-"));
    const checkout = join(root, "repository");
    const patchPath = join(root, "removal.patch");
    const askPass = join(root, `askpass-${randomBytes(6).toString("hex")}.js`);
    const credential = await publisherRepositoryCredential(input.repository);
    const token = credential.token;
    try {
      await writeFile(askPass, "#!/usr/bin/env node\nconst p=process.argv[2]||'';process.stdout.write(p.toLowerCase().includes('username')?'x-access-token':(process.env.DCA_GIT_PASSWORD||''));\n", { mode: 0o700 });
      await chmod(askPass, 0o700);
      const gitEnv = allowlistedEnvironment({
        GIT_ASKPASS: askPass,
        GIT_TERMINAL_PROMPT: "0",
        GIT_CONFIG_NOSYSTEM: "1",
        GIT_CONFIG_GLOBAL: "/dev/null",
        GIT_LFS_SKIP_SMUDGE: "1",
        HOME: root,
        DCA_GIT_PASSWORD: token,
      });
      const git = async (args: string[], cwd = checkout, allowDiff = false): Promise<string> => {
        const result = await runProcess("git", args, { cwd, env: gitEnv, timeoutMs: 5 * 60_000, outputLimitBytes: 512 * 1024 });
        if (result.timedOut || (result.exitCode !== 0 && !(allowDiff && result.exitCode === 1))) {
          throw new Error(redact(result.stderr || result.stdout || `git ${args[0]} failed`, token));
        }
        return result.stdout;
      };
      await git(["clone", "--no-tags", `https://github.com/${input.owner}/${input.repository}.git`, checkout], root);
      await git(["fetch", "origin", input.baseCommitSha]);
      await git(["checkout", "--detach", input.baseCommitSha]);
      const actualCommit = (await git(["rev-parse", "HEAD^{commit}"])).trim().toLowerCase();
      if (actualCommit !== input.baseCommitSha.toLowerCase()) {
        throw new Error("Publisher clone did not resolve the authorized immutable commit");
      }
      await writeFile(patchPath, input.patch, { mode: 0o600 });
      await git(["apply", "--check", patchPath]);
      await git(["apply", patchPath]);
      const changedFiles = (await git(["diff", "--name-only", "--"])).trim().split(/\r?\n/).filter(Boolean);
      if (changedFiles.length !== 1 || changedFiles[0] !== input.expectedFile) {
        throw new Error(`Publisher patch changed an unexpected file set: ${changedFiles.join(", ") || "none"}`);
      }
      await git(["checkout", "-b", input.branchName]);
      await git(["config", "user.name", "DCAv2 Remediation Bot"]);
      await git(["config", "user.email", "dcav2-remediation[bot]@users.noreply.github.com"]);
      await git(["add", "--", input.expectedFile]);
      await git(["commit", "-m", input.title]);
      await git(["push", "--set-upstream", "origin", input.branchName]);

      const { Octokit } = await import("octokit");
      const octokit = new Octokit({ auth: token });
      const existing = await octokit.request("GET /repos/{owner}/{repo}/pulls", {
        owner: input.owner,
        repo: input.repository,
        state: "open",
        head: `${input.owner}:${input.branchName}`,
        base: input.baseBranch,
      });
      const prior = (existing.data as Array<{ html_url?: string }>)[0]?.html_url;
      if (prior) {
        return { url: prior, branchName: input.branchName };
      }
      const response = await octokit.request("POST /repos/{owner}/{repo}/pulls", {
        owner: input.owner,
        repo: input.repository,
        title: input.title,
        body: input.body,
        head: input.branchName,
        base: input.baseBranch,
        draft: true,
      });
      const url = (response.data as { html_url?: string }).html_url;
      if (!url) {
        throw new Error("GitHub created a draft pull request without a URL");
      }
      return { url, branchName: input.branchName };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(redact(error.message, token));
      }
      throw error;
    } finally {
      await rm(root, { recursive: true, force: true });
      try {
        await access(root);
        throw new Error(`Publisher workspace cleanup could not be verified: ${root}`);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          throw error;
        }
      }
    }
  }
}
