import "dotenv/config";

import { pool } from "../src/db/client";

interface StatusCountRow {
  status: string;
  file_count: string;
}

async function printStatusCounts(
  label: string,
  column: "call_graph_status" | "scip_status",
  statuses: readonly string[],
): Promise<void> {
  const result = await pool.query<StatusCountRow>(
    `SELECT expected.status,
            count(indexed_files.id)::text AS file_count
       FROM unnest($1::text[]) WITH ORDINALITY AS expected(status, position)
       LEFT JOIN indexed_files
         ON indexed_files.${column} = expected.status
      GROUP BY expected.status, expected.position
      ORDER BY expected.position`,
    [statuses],
  );

  console.log(label);
  console.table(
    result.rows.map((row) => ({
      status: row.status,
      files: Number(row.file_count),
    })),
  );
}

async function main(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE indexed_files AS file
          SET call_graph_status = CASE
            WHEN lower(file.language) IN ('typescript', 'javascript', 'python')
              THEN 'deprecated_superseded_by_scip'
            WHEN EXISTS (
              SELECT 1
                FROM call_edges
               WHERE call_edges.file_id = file.id
            ) THEN 'tree_sitter_resolved'
            ELSE 'not_produced'
          END`,
    );

    // Historical SCIP gate outcomes were not persisted. A referencing SCIP
    // occurrence in this file is positive evidence that indexing succeeded;
    // absence is not enough to classify a failure, so it remains not_attempted.
    await client.query(
      `UPDATE indexed_files AS file
          SET scip_status = CASE
            WHEN EXISTS (
              SELECT 1
                FROM symbols
                JOIN cross_repo_references
                  ON cross_repo_references.referencing_symbol_id = symbols.id
                 AND cross_repo_references.source_tool = 'scip'
               WHERE symbols.file_id = file.id
            ) THEN 'succeeded'
            ELSE 'not_attempted'
          END`,
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  await printStatusCounts("Call graph status", "call_graph_status", [
    "not_produced",
    "tree_sitter_resolved",
    "deprecated_superseded_by_scip",
  ]);
  await printStatusCounts("SCIP status", "scip_status", [
    "not_attempted",
    "succeeded",
    "failed_no_tsconfig",
    "failed_other",
  ]);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
