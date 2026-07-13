import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

import { PoolClient } from "pg";

import { pool } from "../db/client";
import { knipAnalyzer } from "./analyzers/knip";
import type { RepoLevelAnalyzer, RepoLevelFinding } from "./analyzers/types";
import { vultureAnalyzer } from "./analyzers/vulture";
import { cloneRepository } from "./clone";
import {
  enumerateSymbols,
  SymbolEnumerationResult,
  symbolLanguage,
} from "./symbols/tree-sitter";

interface RepositoryRow {
  vcs_provider: string | null;
  org_slug: string | null;
  repo_slug: string | null;
  default_branch: string | null;
}

interface IndexingSummary {
  filesFound: number;
  filesEnumerated: number;
  filesSkipped: number;
  filesFailed: number;
  symbolsExtracted: number;
}

interface ExternalSignalMatch {
  file_id: string;
  symbol_id: string | null;
}

interface AnalyzerSummary {
  findings: number;
  symbolMatches: number;
  fileOnlyMatches: number;
  unmatchedFiles: number;
}

const SKIPPED_DIRECTORIES = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "__pycache__",
  "venv",
  ".venv",
  "site-packages",
]);

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

const repoLevelAnalyzers: RepoLevelAnalyzer[] = [knipAnalyzer, vultureAnalyzer];

async function insertExternalSignal(
  repositoryId: string,
  finding: RepoLevelFinding,
): Promise<"symbol" | "file" | "unmatched"> {
  const matchResult = await pool.query<ExternalSignalMatch>(
    `SELECT indexed_files.id AS file_id,
            (
              SELECT symbols.id
                FROM symbols
               WHERE symbols.file_id = indexed_files.id
                 AND symbols.name = $3::text
               ORDER BY
                 CASE
                   WHEN $4::int IS NOT NULL AND symbols.line_start = $4::int THEN 0
                   ELSE 1
                 END,
                 symbols.line_start,
                 symbols.id
               LIMIT 1
            ) AS symbol_id
       FROM indexed_files
      WHERE indexed_files.repository_id = $1
        AND indexed_files.file_path = $2
      LIMIT 1`,
    [repositoryId, finding.filePath, finding.symbolName ?? null, finding.lineStart ?? null],
  );
  const match = matchResult.rows[0];

  await pool.query(
    `INSERT INTO external_signals (
       file_id,
       symbol_id,
       source_tool,
       finding_type,
       raw_output
     )
     VALUES ($1, $2, $3, $4, $5::jsonb)`,
    [
      match?.file_id ?? null,
      match?.symbol_id ?? null,
      finding.sourceTool,
      finding.findingType,
      JSON.stringify(finding.rawOutput ?? null),
    ],
  );

  if (match?.symbol_id) {
    return "symbol";
  }
  return match?.file_id ? "file" : "unmatched";
}

async function runRepoLevelAnalyzers(
  analyzers: RepoLevelAnalyzer[],
  repoRootPath: string,
  repositoryId: string,
): Promise<void> {
  for (const analyzer of analyzers) {
    const findings = await analyzer.analyze(repoRootPath);
    const summary: AnalyzerSummary = {
      findings: findings.length,
      symbolMatches: 0,
      fileOnlyMatches: 0,
      unmatchedFiles: 0,
    };

    for (const finding of findings) {
      const match = await insertExternalSignal(repositoryId, finding);
      if (match === "symbol") {
        summary.symbolMatches += 1;
      } else if (match === "file") {
        summary.fileOnlyMatches += 1;
      } else {
        summary.unmatchedFiles += 1;
      }
    }

    console.log(
      `${analyzer.name} analysis: ${summary.findings} findings, ` +
      `${summary.symbolMatches} symbol-matched, ${summary.fileOnlyMatches} file-only, ` +
      `${summary.unmatchedFiles} without an indexed file.`,
    );
  }
}

function hasAnalyzerForLanguage(
  language: "typescript" | "javascript" | "python",
  analyzerNames: ReadonlySet<string>,
): boolean {
  return language === "python" ? analyzerNames.has("vulture") : analyzerNames.has("knip");
}

async function replaceIndexedFile(
  client: PoolClient,
  repositoryId: string,
  filePath: string,
  commitSha: string,
  contentHash: string,
  language: "typescript" | "javascript" | "python",
  result: SymbolEnumerationResult,
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
        language,
        commitSha,
        contentHash,
        result.status === "success" ? "symbols_only" : "failed",
        result.error ?? null,
      ],
    );
    const fileId = upsert.rows[0]?.id;
    if (!fileId) {
      throw new Error(`Failed to upsert indexed file: ${filePath}`);
    }

    await client.query("DELETE FROM call_edges WHERE file_id = $1", [fileId]);
    await client.query(
      "UPDATE external_signals SET symbol_id = NULL WHERE file_id = $1",
      [fileId],
    );
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

async function clearRepositoryCallEdges(repositoryId: string): Promise<void> {
  await pool.query(
    `DELETE FROM call_edges
      WHERE file_id IN (
              SELECT id FROM indexed_files WHERE repository_id = $1
            )
         OR caller_symbol_id IN (
              SELECT symbols.id
                FROM symbols
                JOIN indexed_files ON indexed_files.id = symbols.file_id
               WHERE indexed_files.repository_id = $1
            )
         OR callee_symbol_id IN (
              SELECT symbols.id
                FROM symbols
                JOIN indexed_files ON indexed_files.id = symbols.file_id
               WHERE indexed_files.repository_id = $1
            )`,
    [repositoryId],
  );
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
    filesEnumerated: 0,
    filesSkipped: 0,
    filesFailed: 0,
    symbolsExtracted: 0,
  };

  try {
    const activeAnalyzers = repoLevelAnalyzers.filter((analyzer) =>
      analyzer.canAnalyze(clone.localPath)
    );
    const activeAnalyzerNames = new Set(activeAnalyzers.map((analyzer) => analyzer.name));

    // Knip's public graph exposes imports and exports, but not the full declaration
    // population. Keep this pass limited to symbol enumeration; usage verdicts come
    // exclusively from the repo-level analyzers below.
    await clearRepositoryCallEdges(repositoryId);

    const files = await walkSourceFiles(clone.localPath);
    for (const absolutePath of files) {
      const filePath = relative(clone.localPath, absolutePath).split(sep).join("/");
      const language = symbolLanguage(filePath);
      if (!language || !hasAnalyzerForLanguage(language, activeAnalyzerNames)) {
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
            AND content_hash = $3
            AND parse_status = 'symbols_only'`,
        [repositoryId, filePath, contentHash],
      );
      if (existing.rows.length > 0) {
        summary.filesSkipped += 1;
        continue;
      }

      const enumerationResult = enumerateSymbols(content, filePath);
      const client = await pool.connect();
      try {
        await replaceIndexedFile(
          client,
          repositoryId,
          filePath,
          clone.commitSha,
          contentHash,
          language,
          enumerationResult,
        );
      } finally {
        client.release();
      }

      summary.filesEnumerated += 1;
      summary.symbolsExtracted += enumerationResult.symbols.length;
      if (enumerationResult.status === "failed") {
        summary.filesFailed += 1;
      }
    }

    await runRepoLevelAnalyzers(activeAnalyzers, clone.localPath, repositoryId);
  } finally {
    await clone.cleanup();
  }

  console.log(
    `Indexing complete: ${summary.filesFound} files found, ` +
    `${summary.filesEnumerated} files symbol-enumerated, ` +
    `${summary.filesSkipped} files skipped (unchanged), ` +
    `${summary.filesFailed} files failed, ${summary.symbolsExtracted} symbols extracted.`,
  );
}
