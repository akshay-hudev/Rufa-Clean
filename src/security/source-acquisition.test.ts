import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { simpleGit } from "simple-git";

import { acquireGitHubSource } from "./source-acquisition";

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("source acquisition", () => {
  it("never embeds credentials in the clone implementation", async () => {
    const source = await readFile(join(__dirname, "source-acquisition.ts"), "utf8");
    expect(source).not.toContain("x-access-token:${");
    expect(source).not.toContain("https://${");
  });

  it("local Git fixture demonstrates detached immutable commits and removable remotes", async () => {
    const root = await mkdtemp(join(tmpdir(), "dca-acquisition-fixture-"));
    roots.push(root);
    const origin = join(root, "origin.git");
    const work = join(root, "work");
    await mkdir(origin, { recursive: true });
    await simpleGit(origin).init(true);
    await simpleGit().clone(origin, work);
    const git = simpleGit(work);
    await git.addConfig("user.name", "Fixture");
    await git.addConfig("user.email", "fixture@example.invalid");
    await writeFile(join(work, "file.ts"), "function dead() {}\n");
    await git.add(["file.ts"]);
    await git.commit("fixture");
    const branch = await git.branchLocal();
    await git.push("origin", branch.current);
    const sha = (await git.revparse(["HEAD"])).trim();
    expect(sha).toMatch(/^[a-f0-9]{40}$/);
    await git.checkout(sha);
    await git.removeRemote("origin");
    expect(await git.getRemotes()).toEqual([]);
  });

  it("acquires a detached snapshot, sanitizes Git config, and verifies cleanup", async () => {
    const root = await mkdtemp(join(tmpdir(), "dca-acquisition-fixture-"));
    roots.push(root);
    const origin = join(root, "origin.git");
    const work = join(root, "work");
    await mkdir(origin, { recursive: true });
    await simpleGit(origin).init(true);
    await simpleGit().clone(origin, work);
    const git = simpleGit(work);
    await git.addConfig("user.name", "Fixture");
    await git.addConfig("user.email", "fixture@example.invalid");
    await writeFile(join(work, "file.ts"), "function dead() {}\n");
    await git.add(["file.ts"]);
    await git.commit("fixture");
    await git.branch(["-M", "main"]);
    await git.push(["--set-upstream", "origin", "main"]);
    const expected = (await git.revparse(["HEAD"])).trim();
    const acquired = await acquireGitHubSource({
      owner: "fixture",
      repository: "repository",
      revision: "main",
      expectedCommitSha: expected,
      credentialProvider: async () => ({ token: "sentinel-token", expiresAt: "2099-01-01T00:00:00Z" }),
    }, { remoteUrl: () => origin });
    expect(acquired.path).not.toContain(process.cwd());
    expect(acquired.commitSha).toBe(expected);
    const config = await readFile(join(acquired.path, ".git/config"), "utf8");
    expect(config).not.toMatch(/origin|credential|sentinel-token|include|hooksPath/);
    const acquiredPath = acquired.path;
    await acquired.cleanup();
    await expect(readFile(join(acquiredPath, "file.ts"))).rejects.toThrow();
  });
});
