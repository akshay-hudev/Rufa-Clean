import { extname } from "node:path";

import { pool } from "../db/client";
import type {
  PiranhaLanguage,
  RemovalCandidate,
  RemovalValidation,
} from "./types";

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
  direct_unused_export_findings: string;
  direct_unused_type_findings: string;
  score_before_export_cap: number | null;
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
            ) AS import_edges,
            (
              SELECT count(*)::text
                FROM external_signals AS signal
               WHERE signal.symbol_id = symbol.id
                 AND signal.finding_type = 'unused_export'
            ) AS direct_unused_export_findings,
            (
              SELECT count(*)::text
                FROM external_signals AS signal
               WHERE signal.symbol_id = symbol.id
                 AND signal.finding_type = 'unused_exported_type'
            ) AS direct_unused_type_findings,
            NULLIF(
              verdict.evidence_summary #>> '{normalized_score_before_export_cap}',
              ''
            )::float8 AS score_before_export_cap
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
    directUnusedExportFindings: Number(row.direct_unused_export_findings),
    directUnusedTypeFindings: Number(row.direct_unused_type_findings),
    scoreBeforeExportCap: row.score_before_export_cap,
  };
}

export async function loadAdaptiveRemovalCandidates(
  repositoryIdOrSlug: string,
): Promise<RemovalCandidate[]> {
  const result = await pool.query<{ id: string }>(
    `SELECT DISTINCT verdict.id
       FROM confidence_verdicts AS verdict
       JOIN symbols AS symbol ON symbol.id = verdict.symbol_id
       JOIN indexed_files AS file ON file.id = symbol.file_id
       JOIN repositories AS repository ON repository.id = file.repository_id
       JOIN external_signals AS signal
         ON signal.symbol_id = symbol.id
        AND signal.finding_type IN ('unused_export', 'unused_exported_type')
      WHERE (repository.id::text = $1 OR repository.repo_slug = $1)
        AND verdict.review_status NOT IN ('confirmed_alive', 'excluded')
      ORDER BY verdict.id`,
    [repositoryIdOrSlug],
  );
  return Promise.all(result.rows.map((row) => loadRemovalCandidate(row.id)));
}

function validateReferenceSafety(candidate: RemovalCandidate): void {
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
}

function validateSnapshot(candidate: RemovalCandidate): void {
  if (!candidate.indexedCommitSha?.trim()) {
    throw new Error("Candidate has no indexed commit SHA");
  }
  if (!candidate.indexedContentHash?.trim()) {
    throw new Error("Candidate has no indexed content hash");
  }
  const language = candidate.language.toLowerCase();
  if (candidate.filePath.endsWith(".d.ts")) {
    throw new Error("Simple removal rejects declaration files");
  }
}

function languageForCandidate(candidate: RemovalCandidate): PiranhaLanguage {
  const extension = extname(candidate.filePath).toLowerCase();
  const language = candidate.language.toLowerCase();
  if (language === "javascript" && extension === ".js") {
    return "javascript";
  }
  if (language === "python" && extension === ".py") {
    return "python";
  }
  if (language === "typescript" && extension === ".tsx") {
    return "tsx";
  }
  if (language === "typescript" && extension === ".ts") {
    return "typescript";
  }
  throw new Error(`Unsupported remediation language/file combination: ${language}/${extension}`);
}

/**
 * Eligibility for the repository-wide, human-reviewed draft workflow.
 *
 * This intentionally does not equate a capped `undecidable` verdict with dead
 * code. It requires a direct Knip unused-export finding and independently
 * requires the reference graph to contain no consumer/import/re-export edge.
 * The batch pipeline adds a repository source audit before changing code.
 */
export function validateAdaptiveDraftCandidate(
  candidate: RemovalCandidate,
): RemovalValidation {
  if (candidate.reviewStatus === "confirmed_alive" || candidate.reviewStatus === "excluded") {
    throw new Error(`Adaptive remediation rejects review_status = ${candidate.reviewStatus}`);
  }
  validateSnapshot(candidate);
  if (
    candidate.importOrReexportReferences > 0 ||
    candidate.importEdges > 0 ||
    candidate.executableReferences > 0
  ) {
    throw new Error("Adaptive remediation rejects symbols with resolved references");
  }

  const language = languageForCandidate(candidate);
  const isUnusedPublicType =
    candidate.directUnusedTypeFindings > 0 &&
    candidate.isExported &&
    (candidate.symbolKind === "type" || candidate.symbolKind === "interface") &&
    (language === "typescript" || language === "tsx");
  if (isUnusedPublicType) {
    return {
      language,
      shape: "export_modifier_only",
      reviewMode: "draft_pr_review",
    };
  }
  if (candidate.directUnusedExportFindings < 1) {
    throw new Error("Adaptive remediation requires a direct Knip unused_export finding");
  }
  if ((candidate.scoreBeforeExportCap ?? candidate.confidenceScore ?? 0) < 0.6) {
    throw new Error("Adaptive remediation requires corroborated confidence of at least 0.6");
  }

  if (language === "python") {
    throw new Error("Adaptive export remediation currently supports JavaScript/TypeScript only");
  }
  if (
    candidate.symbolKind === "export" &&
    candidate.symbolName === "default" &&
    candidate.isExported
  ) {
    return {
      language,
      shape: "default_export_alias",
      reviewMode: "draft_pr_review",
    };
  }
  if (
    candidate.symbolKind === "function" &&
    candidate.qualifiedName === candidate.symbolName &&
    candidate.isExported
  ) {
    return {
      language,
      shape: "exported_variable_function",
      reviewMode: "draft_pr_review",
    };
  }
  throw new Error(
    "Adaptive remediation supports only top-level exported functions and default-export aliases",
  );
}

export function validateSimpleCandidate(candidate: RemovalCandidate): PiranhaLanguage {
  if (candidate.reviewStatus !== "confirmed_dead") {
    throw new Error("Removal requires review_status = confirmed_dead");
  }
  if (!candidate.reviewedBy?.trim() || !candidate.reviewedAt) {
    throw new Error("Removal requires a recorded human reviewer and review timestamp");
  }
  validateReferenceSafety(candidate);
  validateSnapshot(candidate);
  return languageForCandidate(candidate);
}

export function validateDraftReviewCandidate(
  candidate: RemovalCandidate,
): RemovalValidation {
  if (candidate.reviewStatus === "confirmed_alive" || candidate.reviewStatus === "excluded") {
    throw new Error(`Draft remediation rejects review_status = ${candidate.reviewStatus}`);
  }
  validateSnapshot(candidate);
  if (
    candidate.importOrReexportReferences > 0 ||
    candidate.importEdges > 0 ||
    candidate.executableReferences > 0
  ) {
    throw new Error("Draft remediation rejects symbols with resolved references");
  }

  const language = languageForCandidate(candidate);
  const isStrongDefaultExportCandidate =
    (language === "typescript" || language === "tsx") &&
    candidate.symbolKind === "export" &&
    candidate.symbolName === "default" &&
    candidate.isExported &&
    candidate.directUnusedExportFindings > 0 &&
    (candidate.scoreBeforeExportCap ?? 0) >= 0.75;

  if (isStrongDefaultExportCandidate) {
    return {
      language,
      shape: "default_export_alias",
      reviewMode: "draft_pr_review",
    };
  }

  if (candidate.automatedVerdict !== "likely_dead") {
    throw new Error(
      "Draft remediation requires likely_dead or a directly-reported unused default export",
    );
  }
  validateReferenceSafety(candidate);
  return {
    language,
    shape: "top_level_function",
    reviewMode: "draft_pr_review",
  };
}
