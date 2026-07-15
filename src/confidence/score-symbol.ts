import { pool } from "../db/client";
import { collectEvidenceForSymbol } from "./collect-evidence";

const WEIGHTS = {
  scip_same_repo_executable: 0.35,
  scip_cross_repo_executable: 0.20,
  knip_vulture: 0.25,
  scip_import_only: -0.10,
  export_visibility: 0.15,
} as const;

const PRIMARY_SIGNAL_SOURCES = [
  "scip_same_repo_executable",
  "scip_cross_repo_executable",
  "knip_vulture",
] as const;

type SignalSource = keyof typeof WEIGHTS;
type SignalStatus = "available_used" | "available_unused" | "not_available";
type Verdict = "likely_dead" | "likely_alive" | "insufficient_signal" | "undecidable";

interface EvidenceRow {
  id: string;
  signal_source: string;
  signal_status: SignalStatus;
  raw_value: unknown;
  detected_at: Date;
}

interface SummarizedSignal {
  signal_source: SignalSource;
  signal_status: SignalStatus;
  weight: number;
  dead_score_contribution: number;
  raw_value: unknown;
}

function isSignalSource(source: string): source is SignalSource {
  return Object.prototype.hasOwnProperty.call(WEIGHTS, source);
}

function verdictForScore(score: number): Verdict {
  if (score >= 0.75) {
    return "likely_dead";
  }
  if (score <= 0.25) {
    return "likely_alive";
  }
  return "undecidable";
}

async function fetchEvidence(symbolId: string): Promise<EvidenceRow[]> {
  const result = await pool.query<EvidenceRow>(
    `SELECT id, signal_source, signal_status, raw_value, detected_at
       FROM confidence_evidence
      WHERE symbol_id = $1
      ORDER BY detected_at DESC, id DESC`,
    [symbolId],
  );
  return result.rows;
}

async function storeVerdict(
  symbolId: string,
  confidenceScore: number | null,
  verdict: Verdict,
  evidenceSummary: Record<string, unknown>,
): Promise<void> {
  await pool.query(
    `INSERT INTO confidence_verdicts (
       symbol_id,
       confidence_score,
       verdict,
       evidence_summary,
       computed_at
     )
     VALUES ($1, $2, $3, $4::jsonb, now())
     ON CONFLICT (symbol_id)
     DO UPDATE SET
       confidence_score = EXCLUDED.confidence_score,
       verdict = EXCLUDED.verdict,
       evidence_summary = EXCLUDED.evidence_summary,
       computed_at = now()`,
    [symbolId, confidenceScore, verdict, JSON.stringify(evidenceSummary)],
  );
}

export async function computeVerdict(symbolId: string): Promise<void> {
  let evidenceRows = await fetchEvidence(symbolId);
  if (evidenceRows.length === 0) {
    await collectEvidenceForSymbol(symbolId);
    evidenceRows = await fetchEvidence(symbolId);
  }

  // The newest row wins if legacy or manually inserted duplicate sources exist.
  const evidenceBySource = new Map<SignalSource, EvidenceRow>();
  for (const row of evidenceRows) {
    if (isSignalSource(row.signal_source) && !evidenceBySource.has(row.signal_source)) {
      evidenceBySource.set(row.signal_source, row);
    }
  }

  const primarySignalsUnavailable = PRIMARY_SIGNAL_SOURCES.every(
    (source) => evidenceBySource.get(source)?.signal_status === "not_available" ||
      !evidenceBySource.has(source),
  );

  if (primarySignalsUnavailable) {
    await storeVerdict(symbolId, null, "insufficient_signal", {
      methodology: "deterministic_rule_based_weighting_no_model_inference",
      reason:
        "SCIP same-repository executable, SCIP cross-repository executable, and Knip/Vulture signals are all unavailable.",
      weights: WEIGHTS,
      signals: [...evidenceBySource.entries()].map(([source, evidence]) => ({
        signal_source: source,
        signal_status: evidence.signal_status,
        weight: WEIGHTS[source],
        raw_value: evidence.raw_value,
      })),
      confidence_score: null,
      verdict: "insufficient_signal",
    });
    return;
  }

  let availablePositiveWeight = 0;
  let weightedDeadTotal = 0;
  const signals: SummarizedSignal[] = [];

  for (const [source, weight] of Object.entries(WEIGHTS) as [SignalSource, number][]) {
    const evidence = evidenceBySource.get(source);
    if (!evidence || evidence.signal_status === "not_available") {
      continue;
    }

    let contribution = 0;
    if (source === "scip_import_only") {
      if (evidence.signal_status === "available_used") {
        contribution = weight;
        weightedDeadTotal += contribution;
      }
    } else {
      availablePositiveWeight += weight;
      if (evidence.signal_status === "available_unused") {
        contribution = weight;
        weightedDeadTotal += contribution;
      }
    }

    signals.push({
      signal_source: source,
      signal_status: evidence.signal_status,
      weight,
      dead_score_contribution: contribution,
      raw_value: evidence.raw_value,
    });
  }

  const importOnlyEvidence = evidenceBySource.get("scip_import_only");
  const importOnlyApplied = importOnlyEvidence?.signal_status === "available_used";
  const normalizedBeforeClamp = availablePositiveWeight > 0
    ? weightedDeadTotal / availablePositiveWeight
    : 0;
  const normalizedBeforeExportCap = Math.min(1, Math.max(0, normalizedBeforeClamp));

  const exportEvidence = evidenceBySource.get("export_visibility");
  const exportCapApplied = exportEvidence?.signal_status === "available_used" &&
    normalizedBeforeExportCap > 0.6;
  const confidenceScore = exportEvidence?.signal_status === "available_used"
    ? Math.min(normalizedBeforeExportCap, 0.6)
    : normalizedBeforeExportCap;
  const verdict = verdictForScore(confidenceScore);

  const explanations = [
    `Available positive evidence weight: ${availablePositiveWeight.toFixed(2)}.`,
    `Weighted dead total before normalization: ${weightedDeadTotal.toFixed(2)}.`,
  ];
  if (importOnlyApplied) {
    explanations.push(
      "Imported via barrel/file reference but no executable call was found — treated as ambiguous, not confirmed dead; the import-only factor reduced the dead score.",
    );
  }
  if (exportCapApplied) {
    explanations.push("Export visibility capped the dead score at 0.60.");
  }

  await storeVerdict(symbolId, confidenceScore, verdict, {
    methodology: "deterministic_rule_based_weighting_no_model_inference",
    weights: WEIGHTS,
    normalization:
      "Positive available weights form the denominator; available_unused contributes its positive weight. Import-only available_used contributes -0.10 to the numerator, then the score is clamped to [0,1].",
    signals,
    available_positive_weight: availablePositiveWeight,
    weighted_dead_total: weightedDeadTotal,
    normalized_score_before_clamp: normalizedBeforeClamp,
    normalized_score_before_export_cap: normalizedBeforeExportCap,
    import_only_factor: {
      applied: importOnlyApplied,
      contribution: importOnlyApplied ? WEIGHTS.scip_import_only : 0,
      note: importOnlyApplied
        ? "Imported via barrel/file reference but no executable call found — treated as ambiguous, not confirmed dead."
        : "Import-only evidence did not reduce the dead score.",
    },
    export_visibility_cap: {
      exported: exportEvidence?.signal_status === "available_used",
      cap: 0.6,
      applied: exportCapApplied,
    },
    confidence_score: confidenceScore,
    verdict,
    thresholds: {
      likely_dead: ">= 0.75",
      likely_alive: "<= 0.25",
      undecidable: "between 0.25 and 0.75",
    },
    explanations,
  });
}
