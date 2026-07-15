# Removal action schema design

Status: implemented for the narrow Step 4 pipeline in `src/db/schema.sql`.

## Decision

Use a `removal_actions` table with one row per generation attempt. A verdict may
have multiple attempts as rules improve or a repository changes. Earlier failed or
superseded attempts remain immutable audit records rather than being overwritten.

Both the source verdict and symbol are stored. A composite foreign key ensures
that the symbol on the action is the same symbol owned by the referenced
`confidence_verdicts` row. The action also snapshots the human confirmation fields
because `confidence_verdicts` is currently updated in place; the snapshot preserves
what authorized the action even if that verdict is recomputed or reviewed again.

## Implemented shape

```sql
-- Required so PostgreSQL can use the pair as a composite FK target.
ALTER TABLE confidence_verdicts
  ADD CONSTRAINT confidence_verdicts_id_symbol_unique
  UNIQUE (id, symbol_id);

CREATE TABLE removal_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- End-to-end provenance.
  confidence_verdict_id UUID NOT NULL,
  symbol_id UUID NOT NULL,
  attempt_number INTEGER NOT NULL CHECK (attempt_number > 0),

  -- Immutable authorization snapshot taken when the attempt is created.
  source_verdict TEXT NOT NULL,
  source_confidence_score FLOAT,
  source_review_status TEXT NOT NULL
    CHECK (source_review_status = 'confirmed_dead'),
  confirmed_by TEXT NOT NULL CHECK (btrim(confirmed_by) <> ''),
  confirmed_at TIMESTAMPTZ NOT NULL,

  -- Reproducibility of the generated change.
  base_commit_sha TEXT NOT NULL CHECK (btrim(base_commit_sha) <> ''),
  generator_name TEXT NOT NULL,
  generator_version TEXT NOT NULL,
  rule_set_version TEXT NOT NULL,
  generated_patch TEXT,
  patch_sha256 TEXT,
  generated_at TIMESTAMPTZ,

  -- Aggregate gate state plus per-command evidence.
  gate_status TEXT NOT NULL DEFAULT 'not_run'
    CHECK (gate_status IN ('not_run', 'running', 'passed', 'failed', 'error')),
  gate_result JSONB,
  gate_started_at TIMESTAMPTZ,
  gate_completed_at TIMESTAMPTZ,

  -- Populated only after a passed gate.
  pr_url TEXT,
  pr_opened_at TIMESTAMPTZ,

  -- Overall attempt lifecycle/outcome.
  outcome_status TEXT NOT NULL DEFAULT 'pending_generation'
    CHECK (outcome_status IN (
      'pending_generation',
      'generation_failed',
      'patch_generated',
      'gate_running',
      'gate_failed',
      'human_review_required',
      'ready_for_pr',
      'pr_creation_failed',
      'pr_opened',
      'rejected',
      'closed',
      'merged',
      'superseded'
    )),
  outcome_summary TEXT,
  finalized_by TEXT,
  finalized_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT removal_actions_verdict_symbol_fk
    FOREIGN KEY (confidence_verdict_id, symbol_id)
    REFERENCES confidence_verdicts (id, symbol_id)
    ON DELETE RESTRICT,
  CONSTRAINT removal_actions_attempt_unique
    UNIQUE (confidence_verdict_id, attempt_number),
  CONSTRAINT removal_actions_pr_requires_passed_gate
    CHECK (pr_url IS NULL OR gate_status = 'passed'),
  CONSTRAINT removal_actions_pr_state_requires_url
    CHECK (
      outcome_status NOT IN ('pr_opened', 'rejected', 'closed', 'merged')
      OR pr_url IS NOT NULL
    ),
  CONSTRAINT removal_actions_patch_hash_pair
    CHECK (
      (generated_patch IS NULL AND patch_sha256 IS NULL)
      OR (generated_patch IS NOT NULL AND patch_sha256 IS NOT NULL)
    )
);

CREATE INDEX idx_removal_actions_verdict
  ON removal_actions(confidence_verdict_id, attempt_number);

CREATE INDEX idx_removal_actions_symbol
  ON removal_actions(symbol_id, created_at DESC);

CREATE INDEX idx_removal_actions_outcome
  ON removal_actions(outcome_status, updated_at);
```

The schema is applied by the existing idempotent migration runner. Runtime state
transitions are implemented in `src/remediation/store.ts`.

## Gate result contract

`gate_status` is deliberately queryable as a column. `gate_result` keeps the
variable command-level detail without adding a new table in this first design:

```json
{
  "status": "failed",
  "failure": "Build command failed",
  "commands": [
    {
      "kind": "build",
      "command": "npm run build",
      "exitCode": 1,
      "started_at": "2026-07-15T06:30:00Z",
      "completed_at": "2026-07-15T06:30:12Z",
      "stderr": "bounded diagnostic output..."
    }
  ]
}
```

Command output should be bounded and scrubbed of secrets. If full logs later move
to object storage, the JSON can retain their checksums and storage references.

## Lifecycle invariants

- Creation is allowed only from a verdict whose current `review_status` is
  `confirmed_dead` and which has non-null reviewer identity and timestamp. This
  cross-table condition should be enforced transactionally by the service or a
  database trigger; a plain `CHECK` constraint cannot read another row.
- `generated_patch` stores the complete unified diff. `patch_sha256` detects later
  corruption or accidental mutation. `base_commit_sha`, generator version, and
  rule-set version make the patch reproducible.
- A failed or errored gate ends at `human_review_required`; its clear failure
  reason and command evidence are stored, and it cannot receive a PR URL. The
  pipeline performs no automated or LLM repair. `gate_failed` remains accepted as
  a legacy status for existing rows.
- A passed gate advances to `ready_for_pr`. Opening a PR records `pr_url` and moves
  the action to `pr_opened`.
- `merged` records an observed human merge outcome; the workflow must never merge
  the PR itself. `finalized_by` and `finalized_at` record the actor and time for a
  terminal human decision.
- Terminal attempts are append-only. A retry creates the next `attempt_number` and
  may mark the earlier row `superseded`; it never replaces the earlier patch or
  gate evidence.

## Audit traversal

Starting from a reviewer decision, all resulting attempts are available through a
direct join:

```sql
SELECT verdict.symbol_id,
       verdict.review_status,
       verdict.reviewed_by,
       verdict.reviewed_at,
       action.attempt_number,
       action.generated_patch,
       action.gate_status,
       action.gate_result,
       action.pr_url,
       action.outcome_status
  FROM confidence_verdicts AS verdict
  LEFT JOIN removal_actions AS action
    ON action.confidence_verdict_id = verdict.id
 WHERE verdict.id = $1
 ORDER BY action.attempt_number;
```

This provides the required chain: symbol → automated evidence and verdict → human
`confirmed_dead` decision → exact generated patch → gate evidence → pull request →
final human outcome.
