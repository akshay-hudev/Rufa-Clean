import "dotenv/config";

import {
  loadRepositoryAccessAuthorizer,
  type RepositoryAccessAuthorizer,
} from "../src/access/repository-access";
import {
  listLanguages,
  listRepositories,
  listRootFiles,
  readFileContents,
  resolveCommit,
  type RawRepo,
} from "../src/connectors/github";

interface PackageMetadata {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  workspaces?: unknown;
}

function packageManager(files: string[]): { manager: string | null; lockfile: string | null } {
  for (const entry of [
    ["pnpm-lock.yaml", "pnpm"],
    ["yarn.lock", "yarn"],
    ["package-lock.json", "npm"],
    ["bun.lockb", "bun"],
    ["bun.lock", "bun"],
  ] as const) {
    const [lockfile, manager] = entry;
    if (files.includes(lockfile)) {
      return { manager, lockfile };
    }
  }
  return { manager: files.includes("package.json") ? "npm_without_lockfile" : null, lockfile: null };
}

function frameworkIndicators(packageJson: PackageMetadata | undefined): string[] {
  const dependencies = {
    ...packageJson?.dependencies,
    ...packageJson?.devDependencies,
  };
  return [
    "next", "react", "vue", "@angular/core", "@nestjs/core", "express",
    "fastify", "vitest", "jest", "typescript",
  ].filter((name) => dependencies[name] !== undefined);
}

async function inventoryRepository(
  repo: RawRepo,
  access: RepositoryAccessAuthorizer,
): Promise<Record<string, unknown>> {
  const [owner, name] = repo.full_name.split("/");
  if (!owner || !name) {
    throw new Error(`Invalid repository identity: ${repo.full_name}`);
  }
  const rootFiles = await listRootFiles(owner, name, access, "analysis_target");
  const packageFiles = rootFiles.filter((path) =>
    path === "package.json" || path.endsWith("/package.json")
  );
  const content = await readFileContents(
    owner,
    name,
    packageFiles.slice(0, 20),
    access,
    "analysis_target",
  );
  let packageJson: PackageMetadata | undefined;
  try {
    packageJson = content["package.json"]
      ? JSON.parse(content["package.json"]) as PackageMetadata
      : undefined;
  } catch {
    packageJson = undefined;
  }
  const languages = await listLanguages(owner, name, access, "analysis_target");
  const immutableRevision = await resolveCommit(
    owner,
    name,
    repo.default_branch,
    access,
    "analysis_target",
  );
  const manager = packageManager(rootFiles);
  const scripts = packageJson?.scripts ?? {};
  const monorepo = packageFiles.some((path) => path.includes("/")) ||
    packageJson?.workspaces !== undefined ||
    rootFiles.includes("pnpm-workspace.yaml") ||
    rootFiles.includes("turbo.json") ||
    rootFiles.includes("nx.json");
  const supportedLanguage = Object.keys(languages).some((language) =>
    ["TypeScript", "JavaScript"].includes(language)
  );
  return {
    canonical_identity: repo.full_name,
    default_branch: repo.default_branch,
    visibility: repo.private ? "private" : "public",
    archived: repo.archived,
    primary_language: repo.language ?? Object.keys(languages)[0] ?? null,
    language_bytes: languages,
    size_kib: repo.size ?? null,
    last_activity: repo.pushed_at ?? repo.updated_at ?? null,
    package_manager: manager.manager,
    lockfile: manager.lockfile,
    structure: monorepo ? "monorepo_or_multi_package" : "single_package_or_unknown",
    framework_indicators: frameworkIndicators(packageJson),
    tests: typeof scripts.test === "string" ? scripts.test : null,
    build: typeof scripts.build === "string" ? scripts.build : null,
    typecheck: typeof scripts.typecheck === "string" ? scripts.typecheck : null,
    immutable_revision: immutableRevision,
    suitability: !repo.archived && supportedLanguage && manager.lockfile
      ? "eligible_for_bounded_isolated_evaluation"
      : "rejected_or_requires_manual_review",
  };
}

async function main(): Promise<void> {
  const access = loadRepositoryAccessAuthorizer();
  const repositories: RawRepo[] = [];
  let cursor: string | undefined;
  do {
    const page = await listRepositories(access, cursor);
    repositories.push(...page.repos);
    cursor = page.nextCursor;
  } while (cursor);

  const inventory: Record<string, unknown>[] = [];
  const rejected: Record<string, unknown>[] = [];
  for (const repo of repositories) {
    const [owner, name] = repo.full_name.split("/");
    const request = {
      repository: { provider: "github" as const, owner: owner ?? "", name: name ?? "" },
      role: "analysis_target" as const,
      operation: "qualify" as const,
    };
    const decision = access.decide(request);
    if (!decision.allowed) {
      rejected.push({
        canonical_identity: repo.full_name,
        reason: decision.reason,
        operations_performed: ["account_repository_discovery"],
      });
      continue;
    }
    try {
      access.assert(request);
      inventory.push(await inventoryRepository(repo, access));
    } catch (error) {
      rejected.push({
        canonical_identity: repo.full_name,
        reason: error instanceof Error ? error.message : "inventory_failed",
        operations_performed: ["account_repository_discovery", "qualification", "metadata_read"],
      });
    }
  }
  process.stdout.write(`${JSON.stringify({
    schema_version: 1,
    requested_role: "analysis_target",
    operations: ["repository_discovery", "qualification", "metadata_read"],
    repositories: inventory,
    rejected,
  }, null, 2)}\n`);
}

void main().catch((error) => {
  process.stderr.write(`${JSON.stringify({
    error: error instanceof Error ? error.message : String(error),
  })}\n`);
  process.exitCode = 1;
});
