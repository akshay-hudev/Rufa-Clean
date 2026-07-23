import {
  loadRepositoryAccessAuthorizer,
  type RepositoryAccessAuthorizer,
} from "../access/repository-access";
import { pool } from "../db/client";
import * as github from "../connectors/github";
import { classifyByMarkers } from "./classify";
import { detectBuildSystem, toPrimaryLanguages } from "./metadata";

interface ErrorDetails {
  errorType: string;
  message: string;
}

function describeError(error: unknown): ErrorDetails {
  if (error instanceof Error) {
    return {
      errorType: error.constructor.name,
      message: error.message,
    };
  }

  return {
    errorType: "UnknownError",
    message: String(error),
  };
}

function parseFullName(fullName: string): { orgSlug: string; repoSlug: string } {
  const parts = fullName.split("/");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(`Invalid GitHub repository full_name: ${fullName}`);
  }

  return { orgSlug: parts[0], repoSlug: parts[1] };
}

function classificationContentPaths(fileList: string[]): string[] {
  const manifestNames = new Set(["package.json", "requirements.txt", "pyproject.toml", "go.mod"]);
  return fileList.filter((path) => {
    const name = path.split("/").at(-1);
    return name !== undefined && (manifestNames.has(name) || name.endsWith(".go"));
  });
}

export async function runSync(
  access: RepositoryAccessAuthorizer = loadRepositoryAccessAuthorizer(),
): Promise<void> {
  let cursor: string | undefined;
  let totalRepos = 0;
  let upsertedCount = 0;
  let errorCount = 0;

  do {
    const page = await github.listRepositories(access, cursor);
    totalRepos += page.repos.length;

    for (const repo of page.repos) {
      let repoSlug = repo.full_name;

      try {
        const parsed = parseFullName(repo.full_name);
        repoSlug = parsed.repoSlug;
        const request = {
          repository: {
            provider: "github" as const,
            owner: parsed.orgSlug,
            name: parsed.repoSlug,
          },
          role: "analysis_target" as const,
        };
        // Qualification is the first repository-specific decision. Excluded
        // identities are rejected before content or language metadata access.
        access.assert({ ...request, operation: "qualify" });
        access.assert({ ...request, operation: "metadata_read" });
        const rootFiles = await github.listRootFiles(
          parsed.orgSlug,
          parsed.repoSlug,
          access,
          "analysis_target",
        );
        const classificationFiles = await github.readFileContents(
          parsed.orgSlug,
          parsed.repoSlug,
          classificationContentPaths(rootFiles),
          access,
          "analysis_target",
        );
        const languageBytes = await github.listLanguages(
          parsed.orgSlug,
          parsed.repoSlug,
          access,
          "analysis_target",
        );
        const classification = classifyByMarkers(rootFiles, classificationFiles);
        const primaryLanguages = toPrimaryLanguages(languageBytes);
        const buildSystem = detectBuildSystem(rootFiles);

        await pool.query(
          `INSERT INTO repositories (
             vcs_provider,
             org_slug,
             repo_slug,
             default_branch,
             visibility,
             archived,
             last_commit_at,
             classification,
             primary_languages,
             build_system,
             last_scanned_at
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, now())
           ON CONFLICT (vcs_provider, org_slug, repo_slug)
           DO UPDATE SET
             default_branch = EXCLUDED.default_branch,
             visibility = EXCLUDED.visibility,
             archived = EXCLUDED.archived,
             last_commit_at = EXCLUDED.last_commit_at,
             classification = EXCLUDED.classification,
             primary_languages = EXCLUDED.primary_languages,
             build_system = EXCLUDED.build_system,
             last_scanned_at = now()`,
          [
            "github",
            parsed.orgSlug,
            parsed.repoSlug,
            repo.default_branch,
            repo.private ? "private" : "public",
            repo.archived,
            repo.pushed_at,
            classification,
            JSON.stringify(primaryLanguages),
            buildSystem,
          ],
        );
        upsertedCount += 1;
      } catch (error) {
        errorCount += 1;
        const details = describeError(error);

        try {
          await pool.query(
            `INSERT INTO discovery_errors (id, repository_slug, error_type, message)
             VALUES (gen_random_uuid(), $1, $2, $3)`,
            [repoSlug, details.errorType, details.message],
          );
        } catch (recordError) {
          console.error(`Failed to record discovery error for ${repoSlug}`, recordError);
        }
      }
    }

    cursor = page.nextCursor;
  } while (cursor !== undefined);

  console.log(
    `Discovery sync complete: ${totalRepos} repos found, ${upsertedCount} upserted, ${errorCount} errors.`,
  );
}
