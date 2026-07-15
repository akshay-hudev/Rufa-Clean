import "dotenv/config";

import { collectEvidenceForSymbol } from "../src/confidence/collect-evidence";
import { computeVerdict } from "../src/confidence/score-symbol";
import { pool } from "../src/db/client";

interface SymbolRow {
  id: string;
  qualified_name: string;
  file_path: string;
  repo_slug: string;
}

async function main(): Promise<void> {
  const qualifiedName = process.argv[2]?.trim();
  const repoSlug = process.argv[3]?.trim();
  if (!qualifiedName || !repoSlug) {
    throw new Error(
      "Usage: npx ts-node scripts/test-evidence.ts <qualified_name> <repo_slug>",
    );
  }

  const symbolResult = await pool.query<SymbolRow>(
    `SELECT symbols.id,
            symbols.qualified_name,
            indexed_files.file_path,
            repositories.repo_slug
       FROM symbols
       JOIN indexed_files ON indexed_files.id = symbols.file_id
       JOIN repositories ON repositories.id = indexed_files.repository_id
      WHERE symbols.qualified_name = $1
        AND repositories.repo_slug = $2
      ORDER BY indexed_files.file_path, symbols.line_start, symbols.id`,
    [qualifiedName, repoSlug],
  );

  if (symbolResult.rows.length === 0) {
    throw new Error(`Symbol not found: ${repoSlug} ${qualifiedName}`);
  }
  if (symbolResult.rows.length > 1) {
    const matches = symbolResult.rows
      .map((row) => `${row.file_path} (${row.id})`)
      .join(", ");
    throw new Error(`Symbol lookup is ambiguous: ${matches}`);
  }

  const symbol = symbolResult.rows[0];
  if (!symbol) {
    throw new Error(`Symbol not found: ${repoSlug} ${qualifiedName}`);
  }

  await collectEvidenceForSymbol(symbol.id);
  await computeVerdict(symbol.id);

  const evidenceResult = await pool.query(
    `SELECT id,
            symbol_id,
            signal_source,
            signal_status,
            raw_value,
            detected_at
       FROM confidence_evidence
      WHERE symbol_id = $1
      ORDER BY signal_source, detected_at, id`,
    [symbol.id],
  );

  console.log(`${symbol.repo_slug}: ${symbol.qualified_name} (${symbol.file_path})`);
  console.table(
    evidenceResult.rows.map((row) => ({
      ...row,
      raw_value: JSON.stringify(row.raw_value),
    })),
  );

  const verdictResult = await pool.query(
    `SELECT confidence_score,
            verdict,
            evidence_summary,
            computed_at,
            review_status,
            reviewed_by,
            reviewed_at
       FROM confidence_verdicts
      WHERE symbol_id = $1`,
    [symbol.id],
  );
  const verdict = verdictResult.rows[0];
  if (!verdict) {
    throw new Error(`Verdict was not stored for symbol: ${symbol.id}`);
  }

  console.log("Final verdict");
  console.dir(verdict, { depth: null });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
