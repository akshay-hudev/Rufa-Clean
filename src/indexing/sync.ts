import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative, sep } from "node:path";

import { PoolClient } from "pg";

import { pool } from "../db/client";
import { knipAnalyzer } from "./analyzers/knip";
import {
  catalogScipDefinitionMatches,
  matchScipDefinitionsToSymbols,
  resolveCrossRepoReferences,
  resolveIntraRepoReferences,
  type RepositoryScipDefinitionMatch,
  type ScipSymbolMatch,
} from "./analyzers/scip-match";
import { parseScipIndex, type ScipDocument } from "./analyzers/scip-parse";
import { classifyScipReferenceKinds } from "./analyzers/scip-reference-kind";
import { runScipIndex } from "./analyzers/scip-typescript";
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

interface InventoryRepositoryRow extends RepositoryRow {
  id: string;
}

export interface ScipRepositoryIndex {
  repositoryId: string;
  documents: ScipDocument[];
  matchedDefinitions: ScipSymbolMatch[];
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
       repository_id,
       file_id,
       symbol_id,
       source_tool,
       finding_type,
       raw_output
     )
     VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
    [
      repositoryId,
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
    // Treat each successful analyzer invocation as the current snapshot. Analyze
    // first so an exception preserves the last known-good rows.
    await pool.query(
      `DELETE FROM external_signals
        WHERE repository_id = $1
          AND source_tool = $2`,
      [repositoryId, analyzer.name],
    );
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

async function warnIfRepositoryHasSymbolsWithoutExternalSignals(
  repositoryId: string,
  repositorySlug: string,
): Promise<void> {
  const result = await pool.query<{ symbol_count: string; signal_count: string }>(
    `SELECT (SELECT count(*)
               FROM symbols
               JOIN indexed_files ON indexed_files.id = symbols.file_id
              WHERE indexed_files.repository_id = $1)::text AS symbol_count,
            (SELECT count(*)
               FROM external_signals
              WHERE external_signals.repository_id = $1)::text AS signal_count`,
    [repositoryId],
  );
  const counts = result.rows[0];
  const symbolCount = Number(counts?.symbol_count ?? 0);
  const signalCount = Number(counts?.signal_count ?? 0);
  const warning = zeroExternalSignalsWarning(repositorySlug, symbolCount, signalCount);
  if (warning) {
    console.warn(warning);
  }
}

export function zeroExternalSignalsWarning(
  repositorySlug: string,
  symbolCount: number,
  signalCount: number,
): string | undefined {
  if (symbolCount <= 0 || signalCount > 0) {
    return undefined;
  }
  return `Indexing warning for ${repositorySlug}: ${symbolCount} symbols were stored but ` +
    "zero repository-attributed external_signals were produced. Check analyzer output and persistence.";
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

async function clearRepositoryScipReferences(repositoryId: string): Promise<void> {
  await pool.query(
    `DELETE FROM cross_repo_references
      WHERE source_tool = 'scip'
        AND (
          referencing_symbol_id IN (
            SELECT symbols.id
              FROM symbols
              JOIN indexed_files ON indexed_files.id = symbols.file_id
             WHERE indexed_files.repository_id = $1
          )
          OR referenced_symbol_id IN (
            SELECT symbols.id
              FROM symbols
              JOIN indexed_files ON indexed_files.id = symbols.file_id
             WHERE indexed_files.repository_id = $1
          )
        )`,
    [repositoryId],
  );
}

function prefixScipDocumentPaths(
  repoRootPath: string,
  scipFilePath: string,
  documents: ScipDocument[],
): ScipDocument[] {
  const projectRoot = relative(repoRootPath, dirname(scipFilePath)).split(sep).join("/");
  if (!projectRoot || projectRoot === ".") {
    return documents;
  }

  return documents.map((document) => ({
    ...document,
    relativePath: `${projectRoot}/${document.relativePath}`,
  }));
}

async function runScipAnalysis(
  repositoryId: string,
  repoRootPath: string,
): Promise<ScipRepositoryIndex | null> {
  const scipFilePath = await runScipIndex(repoRootPath);
  if (!scipFilePath) {
    return null;
  }

  const parsedDocuments = await classifyScipReferenceKinds(
    dirname(scipFilePath),
    await parseScipIndex(scipFilePath),
  );
  const documents = prefixScipDocumentPaths(repoRootPath, scipFilePath, parsedDocuments);
  const matchedDefinitions = await matchScipDefinitionsToSymbols(repositoryId, documents);
  const matchedCount = matchedDefinitions.filter((match) => match.matchedSymbolId !== null).length;
  const insertedReferences = await resolveIntraRepoReferences(
    repositoryId,
    documents,
    matchedDefinitions,
  );

  console.log(
    `SCIP analysis: ${matchedDefinitions.length} definitions, ${matchedCount} symbol-matched, ` +
    `${insertedReferences} same-repository references inserted.`,
  );

  return { repositoryId, documents, matchedDefinitions };
}

export async function runIndexing(repositoryId: string): Promise<ScipRepositoryIndex | null> {
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
  let scipIndex: ScipRepositoryIndex | null = null;

  try {
    const activeAnalyzers = repoLevelAnalyzers.filter((analyzer) =>
      analyzer.canAnalyze(clone.localPath)
    );
    const activeAnalyzerNames = new Set(activeAnalyzers.map((analyzer) => analyzer.name));

    // Knip's public graph exposes imports and exports, but not the full declaration
    // population. Keep this pass limited to symbol enumeration; usage verdicts come
    // exclusively from the repo-level analyzers below.
    await clearRepositoryCallEdges(repositoryId);
    await clearRepositoryScipReferences(repositoryId);

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
    await warnIfRepositoryHasSymbolsWithoutExternalSignals(
      repositoryId,
      repository.repo_slug ?? repositoryId,
    );
    scipIndex = await runScipAnalysis(repositoryId, clone.localPath);
  } finally {
    await clone.cleanup();
  }

  console.log(
    `Indexing complete: ${summary.filesFound} files found, ` +
    `${summary.filesEnumerated} files symbol-enumerated, ` +
    `${summary.filesSkipped} files skipped (unchanged), ` +
    `${summary.filesFailed} files failed, ${summary.symbolsExtracted} symbols extracted.`,
  );

  return scipIndex;
}

export async function runAllIndexing(): Promise<void> {
  const repositoryResult = await pool.query<InventoryRepositoryRow>(
    `SELECT id, vcs_provider, org_slug, repo_slug, default_branch
      FROM repositories
      WHERE lower(vcs_provider) = 'github'
        AND archived = false
        AND default_branch IS NOT NULL
      ORDER BY repo_slug`,
  );
  const scipIndexes: ScipRepositoryIndex[] = [];
  let failures = 0;

  for (const repository of repositoryResult.rows) {
    try {
      const scipIndex = await runIndexing(repository.id);
      if (scipIndex) {
        scipIndexes.push(scipIndex);
      }
    } catch (error) {
      failures += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Indexing failed for ${repository.repo_slug}: ${message}`);
    }
  }

  if (failures > 0) {
    console.warn(
      `Cross-repository SCIP resolution skipped: ${failures} repositories failed indexing.`,
    );
    return;
  }

  const definitionCatalog: RepositoryScipDefinitionMatch[] = scipIndexes.flatMap((index) =>
    catalogScipDefinitionMatches(index.repositoryId, index.matchedDefinitions)
  );
  await pool.query(
    `DELETE FROM cross_repo_references
      WHERE source_tool = 'scip'
        AND resolution_confidence IN ('cross_repo_resolved', 'cross_repo_external')`,
  );

  for (const index of scipIndexes) {
    const resolution = await resolveCrossRepoReferences(
      index.repositoryId,
      index.documents,
      definitionCatalog,
    );
    console.log(
      `SCIP cross-repository analysis for ${index.repositoryId}: ` +
      `${resolution.crossRepoResolved} resolved, ${resolution.crossRepoExternal} external.`,
    );
  }

  console.log(
    `Inventory indexing complete: ${repositoryResult.rows.length} repositories, ` +
    `${scipIndexes.length} SCIP-indexed, ${failures} failures.`,
  );
}
