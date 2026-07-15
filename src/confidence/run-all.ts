import { pool } from "../db/client";
import { computeVerdict } from "./score-symbol";

const VERDICT_TYPES = [
  "likely_dead",
  "likely_alive",
  "insufficient_signal",
  "undecidable",
] as const;

type Verdict = typeof VERDICT_TYPES[number];

export interface ConfidenceRunSummary {
  repositoryId: string;
  totalSymbols: number;
  computed: number;
  skippedFresh: number;
  verdictCounts: Record<Verdict, number>;
}

interface SymbolStalenessRow {
  symbol_id: string;
  verdict_id: string | null;
  verdict_computed_at: Date | null;
  latest_evidence_at: Date | null;
}

interface VerdictCountRow {
  verdict: Verdict;
  symbol_count: string;
}

function isFresh(row: SymbolStalenessRow): boolean {
  if (!row.verdict_id || !row.verdict_computed_at || !row.latest_evidence_at) {
    return false;
  }
  return row.latest_evidence_at.getTime() <= row.verdict_computed_at.getTime();
}

export async function runAllForRepository(
  repositoryId: string,
): Promise<ConfidenceRunSummary> {
  const repositoryResult = await pool.query<{ id: string }>(
    `SELECT id
       FROM repositories
      WHERE id = $1`,
    [repositoryId],
  );
  if (repositoryResult.rows.length === 0) {
    throw new Error(`Repository not found: ${repositoryId}`);
  }

  const symbolsResult = await pool.query<SymbolStalenessRow>(
    `SELECT symbols.id AS symbol_id,
            confidence_verdicts.id AS verdict_id,
            confidence_verdicts.computed_at AS verdict_computed_at,
            max(confidence_evidence.detected_at) AS latest_evidence_at
       FROM symbols
       JOIN indexed_files ON indexed_files.id = symbols.file_id
       LEFT JOIN confidence_verdicts
         ON confidence_verdicts.symbol_id = symbols.id
       LEFT JOIN confidence_evidence
         ON confidence_evidence.symbol_id = symbols.id
      WHERE indexed_files.repository_id = $1
      GROUP BY symbols.id,
               confidence_verdicts.id,
               confidence_verdicts.computed_at
      ORDER BY symbols.id`,
    [repositoryId],
  );

  let computed = 0;
  let skippedFresh = 0;
  for (const symbol of symbolsResult.rows) {
    if (isFresh(symbol)) {
      skippedFresh += 1;
      continue;
    }
    await computeVerdict(symbol.symbol_id);
    computed += 1;
  }

  const countsResult = await pool.query<VerdictCountRow>(
    `SELECT expected.verdict,
            coalesce(actual.symbol_count, 0)::text AS symbol_count
       FROM unnest($2::text[]) WITH ORDINALITY AS expected(verdict, position)
       LEFT JOIN (
         SELECT confidence_verdicts.verdict,
                count(*) AS symbol_count
           FROM confidence_verdicts
           JOIN symbols ON symbols.id = confidence_verdicts.symbol_id
           JOIN indexed_files ON indexed_files.id = symbols.file_id
          WHERE indexed_files.repository_id = $1
          GROUP BY confidence_verdicts.verdict
       ) AS actual ON actual.verdict = expected.verdict
      ORDER BY expected.position`,
    [repositoryId, VERDICT_TYPES],
  );

  const verdictCounts = Object.fromEntries(
    VERDICT_TYPES.map((verdict) => [verdict, 0]),
  ) as Record<Verdict, number>;
  for (const row of countsResult.rows) {
    verdictCounts[row.verdict] = Number(row.symbol_count);
  }

  const summary: ConfidenceRunSummary = {
    repositoryId,
    totalSymbols: symbolsResult.rows.length,
    computed,
    skippedFresh,
    verdictCounts,
  };

  console.log(`Confidence verdict summary for repository ${repositoryId}`);
  console.table(
    VERDICT_TYPES.map((verdict) => ({
      verdict,
      symbols: verdictCounts[verdict],
    })),
  );
  console.log(
    `${summary.totalSymbols} symbols: ${summary.computed} computed, ` +
    `${summary.skippedFresh} skipped as fresh.`,
  );

  return summary;
}
