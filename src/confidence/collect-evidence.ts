import type { PoolClient } from "pg";

import { pool } from "../db/client";

const EVIDENCE_SOURCES = [
  "knip_vulture",
  "scip_same_repo_executable",
  "scip_cross_repo_executable",
  "scip_import_only",
  "export_visibility",
] as const;

type SignalStatus = "available_used" | "available_unused" | "not_available";

interface SymbolContextRow {
  symbol_id: string;
  is_exported: boolean;
  file_id: string;
  language: string | null;
  call_graph_status: string;
  scip_status: string;
  repository_id: string | null;
}

interface ExternalFindingRow {
  source_tool: string;
  finding_type: string;
  raw_output: unknown;
}

interface ScipEvidenceRow {
  same_repo_executable_count: string;
  cross_repo_executable_count: string;
  import_or_reexport_count: string;
  executable_count: string;
  known_cross_repo_reference_count: string;
}

async function insertEvidence(
  client: PoolClient,
  symbolId: string,
  signalSource: string,
  signalStatus: SignalStatus,
  rawValue: Record<string, unknown>,
): Promise<void> {
  await client.query(
    `INSERT INTO confidence_evidence (
       symbol_id,
       signal_source,
       signal_status,
       raw_value
     )
     VALUES ($1, $2, $3, $4::jsonb)`,
    [symbolId, signalSource, signalStatus, JSON.stringify(rawValue)],
  );
}

function executableStatus(scipStatus: string, count: number): SignalStatus {
  if (scipStatus !== "succeeded") {
    return "not_available";
  }
  return count > 0 ? "available_used" : "available_unused";
}

export async function collectEvidenceForSymbol(symbolId: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const contextResult = await client.query<SymbolContextRow>(
      `SELECT symbols.id AS symbol_id,
              symbols.is_exported,
              indexed_files.id AS file_id,
              indexed_files.language,
              indexed_files.call_graph_status,
              indexed_files.scip_status,
              indexed_files.repository_id
         FROM symbols
         JOIN indexed_files ON indexed_files.id = symbols.file_id
        WHERE symbols.id = $1`,
      [symbolId],
    );
    const context = contextResult.rows[0];
    if (!context) {
      throw new Error(`Symbol or owning indexed file not found: ${symbolId}`);
    }

    const externalFindingsResult = await client.query<ExternalFindingRow>(
      `SELECT source_tool, finding_type, raw_output
         FROM external_signals
        WHERE symbol_id = $1
          AND source_tool IN ('knip', 'vulture')
          AND finding_type IN ('unused_export', 'unreachable')
        ORDER BY detected_at, id`,
      [symbolId],
    );

    const scipResult = await client.query<ScipEvidenceRow>(
      `SELECT count(*) FILTER (
                WHERE reference.resolution_confidence = 'same_repo'
                  AND reference.reference_kind IN ('call', 'construct', 'read')
              )::text AS same_repo_executable_count,
              count(*) FILTER (
                WHERE reference.resolution_confidence = 'cross_repo_resolved'
                  AND reference.reference_kind IN ('call', 'construct', 'read')
              )::text AS cross_repo_executable_count,
              count(*) FILTER (
                WHERE reference.resolution_confidence IN ('same_repo', 'cross_repo_resolved')
                  AND reference.reference_kind IN ('import', 'reexport')
              )::text AS import_or_reexport_count,
              count(*) FILTER (
                WHERE reference.resolution_confidence IN ('same_repo', 'cross_repo_resolved')
                  AND reference.reference_kind IN ('call', 'construct', 'read')
              )::text AS executable_count,
              (
                SELECT count(*)::text
                  FROM cross_repo_references AS repository_reference
                  JOIN symbols AS repository_symbol
                    ON repository_symbol.id = repository_reference.referenced_symbol_id
                  JOIN indexed_files AS repository_file
                    ON repository_file.id = repository_symbol.file_id
                 WHERE repository_file.repository_id = $2
                   AND repository_reference.resolution_confidence = 'cross_repo_resolved'
              ) AS known_cross_repo_reference_count
         FROM cross_repo_references AS reference
        WHERE reference.referenced_symbol_id = $1`,
      [symbolId, context.repository_id],
    );
    const scip = scipResult.rows[0];
    if (!scip) {
      throw new Error(`Failed to aggregate SCIP evidence for symbol: ${symbolId}`);
    }

    const language = context.language?.toLowerCase() ?? "";
    const coveredByKnipOrVulture = ["typescript", "javascript", "python"].includes(language);
    const externalFindings = externalFindingsResult.rows;
    const knipVultureStatus: SignalStatus = !coveredByKnipOrVulture
      ? "not_available"
      : externalFindings.length > 0
        ? "available_unused"
        : "available_used";

    const sameRepoExecutableCount = Number(scip.same_repo_executable_count);
    const crossRepoExecutableCount = Number(scip.cross_repo_executable_count);
    const importOrReexportCount = Number(scip.import_or_reexport_count);
    const executableCount = Number(scip.executable_count);
    const knownCrossRepoReferenceCount = Number(scip.known_cross_repo_reference_count);
    const importOnly = importOrReexportCount > 0 && executableCount === 0;

    await client.query(
      `DELETE FROM confidence_evidence
        WHERE symbol_id = $1
          AND signal_source = ANY($2::text[])`,
      [symbolId, EVIDENCE_SOURCES],
    );

    await insertEvidence(client, symbolId, "knip_vulture", knipVultureStatus, {
      language: context.language,
      call_graph_status: context.call_graph_status,
      analyzer: language === "python" ? "vulture" : coveredByKnipOrVulture ? "knip" : null,
      matching_finding_count: externalFindings.length,
      matching_findings: externalFindings,
      interpretation_note:
        "A Knip available_used result may mean only that the symbol was imported somewhere; it does not prove the symbol was actually called or otherwise executed.",
    });

    await insertEvidence(
      client,
      symbolId,
      "scip_same_repo_executable",
      executableStatus(context.scip_status, sameRepoExecutableCount),
      {
        scip_status: context.scip_status,
        executable_occurrence_kinds: ["call", "construct", "read"],
        excluded_occurrence_kinds: ["import", "reexport"],
        executable_reference_count: sameRepoExecutableCount,
        resolution_confidence: "same_repo",
      },
    );

    await insertEvidence(
      client,
      symbolId,
      "scip_cross_repo_executable",
      executableStatus(context.scip_status, crossRepoExecutableCount),
      {
        scip_status: context.scip_status,
        executable_occurrence_kinds: ["call", "construct", "read"],
        excluded_occurrence_kinds: ["import", "reexport"],
        executable_reference_count: crossRepoExecutableCount,
        resolution_confidence: "cross_repo_resolved",
        repository_has_known_cross_repo_consumers: knownCrossRepoReferenceCount > 0,
        repository_cross_repo_resolved_reference_count: knownCrossRepoReferenceCount,
        interpretation: crossRepoExecutableCount > 0
          ? "Resolved cross-repo executable references to this symbol were found."
          : knownCrossRepoReferenceCount > 0
            ? "The repository has known resolved cross-repo consumers, but none produced an executable reference to this symbol."
            : "No resolved cross-repo consumers are known for this repository; zero references to this symbol are not negative evidence of unused code.",
      },
    );

    const importOnlyStatus: SignalStatus = context.scip_status !== "succeeded"
      ? "not_available"
      : importOnly
        ? "available_used"
        : "available_unused";
    await insertEvidence(client, symbolId, "scip_import_only", importOnlyStatus, {
      scip_status: context.scip_status,
      import_or_reexport_count: importOrReexportCount,
      executable_reference_count: executableCount,
      is_import_only: importOnly,
      interpretation_note:
        "Import-only evidence is weaker than executable SCIP evidence and must not be treated as proof that the symbol was called or executed.",
    });

    await insertEvidence(
      client,
      symbolId,
      "export_visibility",
      context.is_exported ? "available_used" : "available_unused",
      { is_exported: context.is_exported },
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
