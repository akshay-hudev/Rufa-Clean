import { extname } from "node:path";

import { pool } from "../db/client";
import type { PiranhaLanguage, RemovalCandidate } from "./types";

interface CandidateRow {
  verdict_id: string;
  symbol_id: string;
  symbol_name: string;
  qualified_name: string;
  symbol_kind: string;
  is_exported: boolean;
  file_path: string;
  language: string;
  indexed_commit_sha: string;
  indexed_content_hash: string;
  repository_id: string;
  vcs_provider: string;
  org_slug: string;
  repo_slug: string;
  default_branch: string;
  automated_verdict: string;
  confidence_score: number | null;
  review_status: string;
  reviewed_by: string | null;
  reviewed_at: Date | null;
  import_or_reexport_references: string;
  executable_references: string;
  import_edges: string;
}

export async function loadRemovalCandidate(verdictId: string): Promise<RemovalCandidate> {
  const result = await pool.query<CandidateRow>(
    `SELECT verdict.id AS verdict_id,
            symbol.id AS symbol_id,
            symbol.name AS symbol_name,
            symbol.qualified_name,
            symbol.kind AS symbol_kind,
            symbol.is_exported,
            file.file_path,
            file.language,
            file.commit_sha AS indexed_commit_sha,
            file.content_hash AS indexed_content_hash,
            repository.id AS repository_id,
            repository.vcs_provider,
            repository.org_slug,
            repository.repo_slug,
            repository.default_branch,
            verdict.verdict AS automated_verdict,
            verdict.confidence_score,
            verdict.review_status,
            verdict.reviewed_by,
            verdict.reviewed_at,
            (
              SELECT count(*)::text
                FROM cross_repo_references AS reference
               WHERE reference.referenced_symbol_id = symbol.id
                 AND reference.reference_kind IN ('import', 'reexport')
            ) AS import_or_reexport_references,
            (
              SELECT count(*)::text
                FROM cross_repo_references AS reference
               WHERE reference.referenced_symbol_id = symbol.id
                 AND reference.reference_kind IN ('call', 'construct', 'read')
            ) AS executable_references,
            (
              SELECT count(*)::text
                FROM import_edges AS import_edge
               WHERE import_edge.imported_symbol_id = symbol.id
            ) AS import_edges
       FROM confidence_verdicts AS verdict
       JOIN symbols AS symbol ON symbol.id = verdict.symbol_id
       JOIN indexed_files AS file ON file.id = symbol.file_id
       JOIN repositories AS repository ON repository.id = file.repository_id
      WHERE verdict.id = $1`,
    [verdictId],
  );
  const row = result.rows[0];
  if (!row) {
    throw new Error(`Confidence verdict not found: ${verdictId}`);
  }

  return {
    verdictId: row.verdict_id,
    symbolId: row.symbol_id,
    symbolName: row.symbol_name,
    qualifiedName: row.qualified_name,
    symbolKind: row.symbol_kind,
    isExported: row.is_exported,
    filePath: row.file_path,
    language: row.language,
    indexedCommitSha: row.indexed_commit_sha,
    indexedContentHash: row.indexed_content_hash,
    repositoryId: row.repository_id,
    vcsProvider: row.vcs_provider,
    orgSlug: row.org_slug,
    repoSlug: row.repo_slug,
    defaultBranch: row.default_branch,
    automatedVerdict: row.automated_verdict,
    confidenceScore: row.confidence_score,
    reviewStatus: row.review_status,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    importOrReexportReferences: Number(row.import_or_reexport_references),
    executableReferences: Number(row.executable_references),
    importEdges: Number(row.import_edges),
  };
}

export function validateSimpleCandidate(candidate: RemovalCandidate): PiranhaLanguage {
  if (candidate.reviewStatus !== "confirmed_dead") {
    throw new Error("Removal requires review_status = confirmed_dead");
  }
  if (!candidate.reviewedBy?.trim() || !candidate.reviewedAt) {
    throw new Error("Removal requires a recorded human reviewer and review timestamp");
  }
  if (candidate.symbolKind !== "function" || candidate.qualifiedName !== candidate.symbolName) {
    throw new Error("Simple removal supports only top-level function declarations");
  }
  if (candidate.isExported) {
    throw new Error("Simple removal rejects exported symbols");
  }
  if (
    candidate.importOrReexportReferences > 0 ||
    candidate.importEdges > 0
  ) {
    throw new Error("Simple removal rejects symbols with import or re-export involvement");
  }
  if (candidate.executableReferences > 0) {
    throw new Error("Confirmed-dead symbol has executable references; refusing simple removal");
  }
  if (!candidate.indexedCommitSha?.trim()) {
    throw new Error("Candidate has no indexed commit SHA");
  }
  if (!candidate.indexedContentHash?.trim()) {
    throw new Error("Candidate has no indexed content hash");
  }
  if (candidate.language.toLowerCase() !== "typescript") {
    throw new Error("Simple removal currently supports TypeScript and TSX only");
  }
  if (candidate.filePath.endsWith(".d.ts")) {
    throw new Error("Simple removal rejects declaration files");
  }
  const extension = extname(candidate.filePath).toLowerCase();
  if (extension === ".tsx") {
    return "tsx";
  }
  if (extension === ".ts") {
    return "typescript";
  }
  throw new Error(`Unsupported TypeScript file extension: ${extension}`);
}
