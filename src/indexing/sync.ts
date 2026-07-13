import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

import { PoolClient } from "pg";

import { pool } from "../db/client";
import { cloneRepository } from "./clone";
import { ParseResult, typescriptParser } from "./parsers/typescript";

interface RepositoryRow {
  vcs_provider: string | null;
  org_slug: string | null;
  repo_slug: string | null;
  default_branch: string | null;
}

interface IndexingSummary {
  filesFound: number;
  filesParsed: number;
  filesSkipped: number;
  filesFailed: number;
  symbolsExtracted: number;
}

const SKIPPED_DIRECTORIES = new Set(["node_modules", ".git", "dist", "build"]);

async function walkSourceFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!SKIPPED_DIRECTORIES.has(entry.name)) {
        files.push(...await walkSourceFiles(entryPath));
      }
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function repositoryForClone(row: RepositoryRow): {
  vcs_provider: string;
  org_slug: string;
  repo_slug: string;
  default_branch: string;
} {
  if (!row.vcs_provider || !row.org_slug || !row.repo_slug || !row.default_branch) {
    throw new Error("Repository is missing clone metadata");
  }

  return {
    vcs_provider: row.vcs_provider,
    org_slug: row.org_slug,
    repo_slug: row.repo_slug,
    default_branch: row.default_branch,
  };
}

function languageFor(filePath: string): "typescript" | "javascript" {
  return /\.tsx?$/i.test(filePath) ? "typescript" : "javascript";
}

async function replaceIndexedFile(
  client: PoolClient,
  repositoryId: string,
  filePath: string,
  commitSha: string,
  contentHash: string,
  result: ParseResult,
): Promise<void> {
  await client.query("BEGIN");
  try {
    const upsert = await client.query<{ id: string }>(
      `INSERT INTO indexed_files (
         repository_id,
         file_path,
         language,
         commit_sha,
         content_hash,
         indexed_at,
         parse_status,
         parse_error
       )
       VALUES ($1, $2, $3, $4, $5, now(), $6, $7)
       ON CONFLICT (repository_id, file_path)
       DO UPDATE SET
         language = EXCLUDED.language,
         commit_sha = EXCLUDED.commit_sha,
         content_hash = EXCLUDED.content_hash,
         indexed_at = now(),
         parse_status = EXCLUDED.parse_status,
         parse_error = EXCLUDED.parse_error
       RETURNING id`,
      [
        repositoryId,
        filePath,
        languageFor(filePath),
        commitSha,
        contentHash,
        result.parseStatus,
        result.parseError ?? null,
      ],
    );
    const fileId = upsert.rows[0]?.id;
    if (!fileId) {
      throw new Error(`Failed to upsert indexed file: ${filePath}`);
    }

    await client.query("DELETE FROM symbols WHERE file_id = $1", [fileId]);
    for (const symbol of result.symbols) {
      await client.query(
        `INSERT INTO symbols (
           file_id,
           kind,
           name,
           qualified_name,
           line_start,
           line_end,
           is_exported
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          fileId,
          symbol.kind,
          symbol.name,
          symbol.qualifiedName,
          symbol.lineStart,
          symbol.lineEnd,
          symbol.isExported,
        ],
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

export async function runIndexing(repositoryId: string): Promise<void> {
  const repositoryResult = await pool.query<RepositoryRow>(
    `SELECT vcs_provider, org_slug, repo_slug, default_branch
       FROM repositories
      WHERE id = $1`,
    [repositoryId],
  );
  const repository = repositoryResult.rows[0];
  if (!repository) {
    throw new Error(`Repository not found: ${repositoryId}`);
  }

  const clone = await cloneRepository(repositoryForClone(repository));
  const summary: IndexingSummary = {
    filesFound: 0,
    filesParsed: 0,
    filesSkipped: 0,
    filesFailed: 0,
    symbolsExtracted: 0,
  };

  try {
    const files = await walkSourceFiles(clone.localPath);
    for (const absolutePath of files) {
      const filePath = relative(clone.localPath, absolutePath).split(sep).join("/");
      if (!typescriptParser.canParse(filePath)) {
        continue;
      }
      summary.filesFound += 1;

      const content = await readFile(absolutePath, "utf8");
      const contentHash = createHash("sha256").update(content).digest("hex");
      const existing = await pool.query<{ id: string }>(
        `SELECT id
           FROM indexed_files
          WHERE repository_id = $1
            AND file_path = $2
            AND content_hash = $3`,
        [repositoryId, filePath, contentHash],
      );
      if (existing.rows.length > 0) {
        summary.filesSkipped += 1;
        continue;
      }

      const parseResult = typescriptParser.parse(content, filePath);
      const client = await pool.connect();
      try {
        await replaceIndexedFile(
          client,
          repositoryId,
          filePath,
          clone.commitSha,
          contentHash,
          parseResult,
        );
      } finally {
        client.release();
      }

      summary.filesParsed += 1;
      summary.symbolsExtracted += parseResult.symbols.length;
      if (parseResult.parseStatus === "failed") {
        summary.filesFailed += 1;
      }
    }
  } finally {
    await clone.cleanup();
  }

  console.log(
    `Indexing complete: ${summary.filesFound} files found, ` +
    `${summary.filesParsed} files parsed, ${summary.filesSkipped} files skipped (unchanged), ` +
    `${summary.filesFailed} files failed, ${summary.symbolsExtracted} symbols extracted.`,
  );
}
