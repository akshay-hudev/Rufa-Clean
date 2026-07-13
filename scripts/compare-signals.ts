import "dotenv/config";

import { pool } from "../src/db/client";

interface RepositoryRow {
  repo_slug: string;
}

interface SymbolSignalRow {
  file_path: string;
  language: string;
  kind: string;
  name: string;
  qualified_name: string;
  line_start: number | null;
  has_resolved_caller: boolean;
  knip_thinks_unused: boolean;
  vulture_thinks_unused: boolean;
}

interface ComparisonRow {
  file: string;
  line: number | null;
  language: string;
  kind: string;
  symbol: string;
  qualifiedName: string;
  hasResolvedCaller: boolean;
  graphThinksUnreferenced: boolean;
  knipThinksUnused: boolean;
  vultureThinksUnused: boolean;
  disagreement: string;
}

function disagreementLabel(graphUnused: boolean, externalUnused: boolean): string {
  if (graphUnused === externalUnused) {
    return "";
  }
  return externalUnused
    ? "EXTERNAL_UNUSED_BUT_GRAPH_REFERENCED"
    : "GRAPH_UNREFERENCED_BUT_NO_EXTERNAL_SIGNAL";
}

async function main(): Promise<void> {
  const repositoryId = process.argv[2]?.trim();
  if (!repositoryId) {
    throw new Error(
      "Repository ID argument is required. Usage: npx ts-node scripts/compare-signals.ts <repository-id>",
    );
  }

  const repositoryResult = await pool.query<RepositoryRow>(
    `SELECT repo_slug
       FROM repositories
      WHERE id = $1`,
    [repositoryId],
  );
  const repository = repositoryResult.rows[0];
  if (!repository) {
    throw new Error(`Repository not found: ${repositoryId}`);
  }

  const result = await pool.query<SymbolSignalRow>(
    `SELECT indexed_files.file_path,
            indexed_files.language,
            symbols.kind,
            symbols.name,
            symbols.qualified_name,
            symbols.line_start,
            EXISTS (
              SELECT 1
                FROM call_edges
               WHERE call_edges.callee_symbol_id = symbols.id
            ) AS has_resolved_caller,
            EXISTS (
              SELECT 1
                FROM external_signals
               WHERE external_signals.symbol_id = symbols.id
                 AND external_signals.source_tool = 'knip'
                 AND external_signals.finding_type = 'unused_export'
            ) AS knip_thinks_unused,
            EXISTS (
              SELECT 1
                FROM external_signals
               WHERE external_signals.symbol_id = symbols.id
                 AND external_signals.source_tool = 'vulture'
                 AND external_signals.finding_type = 'unreachable'
            ) AS vulture_thinks_unused
       FROM symbols
       JOIN indexed_files ON indexed_files.id = symbols.file_id
      WHERE indexed_files.repository_id = $1
      ORDER BY indexed_files.file_path, symbols.line_start, symbols.qualified_name`,
    [repositoryId],
  );

  const rows: ComparisonRow[] = result.rows.map((row) => {
    const graphThinksUnreferenced = !row.has_resolved_caller;
    const externalThinksUnused = row.knip_thinks_unused || row.vulture_thinks_unused;

    return {
      file: row.file_path,
      line: row.line_start,
      language: row.language,
      kind: row.kind,
      symbol: row.name,
      qualifiedName: row.qualified_name,
      hasResolvedCaller: row.has_resolved_caller,
      graphThinksUnreferenced,
      knipThinksUnused: row.knip_thinks_unused,
      vultureThinksUnused: row.vulture_thinks_unused,
      disagreement: disagreementLabel(graphThinksUnreferenced, externalThinksUnused),
    };
  });

  console.log(`Signal comparison for ${repository.repo_slug} (${repositoryId})`);
  console.table(rows);
  console.log(
    `Disagreements: ${rows.filter((row) => row.disagreement !== "").length}/${rows.length}`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
