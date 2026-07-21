CREATE OR REPLACE FUNCTION reject_immutable_ledger_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'immutable milestone ledger rows cannot be updated or deleted';
END
$$;

CREATE TABLE IF NOT EXISTS account_scopes (
  id text PRIMARY KEY CHECK (btrim(id) <> ''),
  display_name text NOT NULL CHECK (btrim(display_name) <> ''),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analysis_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_scope_id text NOT NULL REFERENCES account_scopes(id) ON DELETE RESTRICT,
  repository_provider text NOT NULL CHECK (repository_provider = 'github'),
  repository_owner text NOT NULL CHECK (btrim(repository_owner) <> ''),
  repository_name text NOT NULL CHECK (btrim(repository_name) <> ''),
  commit_sha text NOT NULL CHECK (commit_sha ~ '^[0-9a-f]{40}$'),
  policy_version text NOT NULL CHECK (btrim(policy_version) <> ''),
  status text NOT NULL CHECK (status IN ('succeeded', 'failed')),
  canonical_result jsonb NOT NULL,
  result_sha256 text NOT NULL CHECK (result_sha256 ~ '^[0-9a-f]{64}$'),
  failure text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((status = 'succeeded' AND failure IS NULL) OR status = 'failed')
);

CREATE TABLE IF NOT EXISTS analyzer_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_run_id uuid NOT NULL REFERENCES analysis_runs(id) ON DELETE RESTRICT,
  analyzer text NOT NULL,
  analyzer_version text NOT NULL,
  configuration jsonb NOT NULL,
  status text NOT NULL CHECK (status IN ('succeeded', 'failed')),
  failure text,
  artifact_sha256 text CHECK (artifact_sha256 IS NULL OR artifact_sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS run_coverage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_run_id uuid NOT NULL UNIQUE REFERENCES analysis_runs(id) ON DELETE RESTRICT,
  status text NOT NULL CHECK (status IN ('complete_for_supported_scope', 'partial', 'failed', 'unknown')),
  coverage_bundle jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS milestone_findings (
  finding_id text PRIMARY KEY CHECK (finding_id ~ '^[0-9a-f]{64}$'),
  analysis_run_id uuid NOT NULL REFERENCES analysis_runs(id) ON DELETE RESTRICT,
  account_scope_id text NOT NULL REFERENCES account_scopes(id) ON DELETE RESTRICT,
  repository_provider text NOT NULL CHECK (repository_provider = 'github'),
  repository_owner text NOT NULL,
  repository_name text NOT NULL,
  commit_sha text NOT NULL CHECK (commit_sha ~ '^[0-9a-f]{40}$'),
  file_path text NOT NULL CHECK (btrim(file_path) <> ''),
  source_sha256 text NOT NULL CHECK (source_sha256 ~ '^[0-9a-f]{64}$'),
  evidence_digest text NOT NULL CHECK (evidence_digest ~ '^[0-9a-f]{64}$'),
  policy_version text NOT NULL,
  classification text NOT NULL CHECK (classification IN (
    'candidate_dead', 'live_evidence_present', 'inconclusive', 'conflicting',
    'unsupported', 'stale', 'failed'
  )),
  finding_bundle jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS human_review_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id text NOT NULL REFERENCES milestone_findings(finding_id) ON DELETE RESTRICT,
  account_scope_id text NOT NULL REFERENCES account_scopes(id) ON DELETE RESTRICT,
  repository_provider text NOT NULL,
  repository_owner text NOT NULL,
  repository_name text NOT NULL,
  commit_sha text NOT NULL CHECK (commit_sha ~ '^[0-9a-f]{40}$'),
  exact_occurrence jsonb NOT NULL,
  source_sha256 text NOT NULL CHECK (source_sha256 ~ '^[0-9a-f]{64}$'),
  evidence_digest text NOT NULL CHECK (evidence_digest ~ '^[0-9a-f]{64}$'),
  policy_version text NOT NULL,
  decision text NOT NULL CHECK (decision IN (
    'confirmed_dead', 'confirmed_alive', 'deferred', 'excluded', 'inconclusive'
  )),
  actor_identity text NOT NULL CHECK (btrim(actor_identity) <> ''),
  rationale text NOT NULL CHECK (btrim(rationale) <> ''),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS human_review_decisions_finding_idx
  ON human_review_decisions(finding_id, created_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS remediation_authorizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id text NOT NULL REFERENCES milestone_findings(finding_id) ON DELETE RESTRICT,
  review_decision_id uuid NOT NULL REFERENCES human_review_decisions(id) ON DELETE RESTRICT,
  account_scope_id text NOT NULL REFERENCES account_scopes(id) ON DELETE RESTRICT,
  repository_provider text NOT NULL,
  repository_owner text NOT NULL,
  repository_name text NOT NULL,
  commit_sha text NOT NULL CHECK (commit_sha ~ '^[0-9a-f]{40}$'),
  exact_occurrence jsonb NOT NULL,
  source_sha256 text NOT NULL CHECK (source_sha256 ~ '^[0-9a-f]{64}$'),
  evidence_digest text NOT NULL CHECK (evidence_digest ~ '^[0-9a-f]{64}$'),
  policy_version text NOT NULL,
  decision text NOT NULL CHECK (decision IN (
    'approved_for_remediation', 'rejected', 'revoked', 'expired'
  )),
  actor_identity text NOT NULL CHECK (btrim(actor_identity) <> ''),
  rationale text NOT NULL CHECK (btrim(rationale) <> ''),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS remediation_authorizations_finding_idx
  ON remediation_authorizations(finding_id, created_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS remediation_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id text NOT NULL REFERENCES milestone_findings(finding_id) ON DELETE RESTRICT,
  authorization_id uuid NOT NULL REFERENCES remediation_authorizations(id) ON DELETE RESTRICT,
  idempotency_key text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('verified', 'failed', 'stale')),
  base_commit_sha text NOT NULL CHECK (base_commit_sha ~ '^[0-9a-f]{40}$'),
  failure text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS verification_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  remediation_attempt_id uuid NOT NULL REFERENCES remediation_attempts(id) ON DELETE RESTRICT,
  phase text NOT NULL CHECK (phase IN ('baseline', 'post_change')),
  status text NOT NULL CHECK (status IN ('passed', 'failed', 'error')),
  result_bundle jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (remediation_attempt_id, phase)
);

CREATE TABLE IF NOT EXISTS patch_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  remediation_attempt_id uuid NOT NULL UNIQUE REFERENCES remediation_attempts(id) ON DELETE RESTRICT,
  patch_sha256 text NOT NULL CHECK (patch_sha256 ~ '^[0-9a-f]{64}$'),
  patch_content text NOT NULL,
  changed_files jsonb NOT NULL,
  generator_name text NOT NULL,
  generator_version text NOT NULL,
  rule_set_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pull_request_publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  remediation_attempt_id uuid NOT NULL UNIQUE REFERENCES remediation_attempts(id) ON DELETE RESTRICT,
  idempotency_key text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('draft_pr_created', 'failed')),
  repository_provider text NOT NULL CHECK (repository_provider = 'github'),
  repository_owner text NOT NULL,
  repository_name text NOT NULL,
  base_commit_sha text NOT NULL CHECK (base_commit_sha ~ '^[0-9a-f]{40}$'),
  branch_name text,
  pr_url text,
  failure text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (status = 'draft_pr_created' AND pr_url IS NOT NULL AND branch_name IS NOT NULL AND failure IS NULL)
    OR (status = 'failed' AND failure IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS milestone_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_scope_id text NOT NULL REFERENCES account_scopes(id) ON DELETE RESTRICT,
  sequence bigint NOT NULL,
  event_type text NOT NULL CHECK (btrim(event_type) <> ''),
  subject_type text NOT NULL CHECK (btrim(subject_type) <> ''),
  subject_id text NOT NULL CHECK (btrim(subject_id) <> ''),
  payload jsonb NOT NULL,
  previous_event_hash text,
  event_hash text NOT NULL CHECK (event_hash ~ '^[0-9a-f]{64}$'),
  actor_identity text NOT NULL CHECK (btrim(actor_identity) <> ''),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_scope_id, sequence),
  UNIQUE (account_scope_id, event_hash),
  CHECK (previous_event_hash IS NULL OR previous_event_hash ~ '^[0-9a-f]{64}$')
);

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'analysis_runs', 'analyzer_runs', 'run_coverage', 'milestone_findings',
    'human_review_decisions', 'remediation_authorizations', 'remediation_attempts',
    'verification_results', 'patch_artifacts', 'pull_request_publications',
    'milestone_audit_events'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger
       WHERE tgname = table_name || '_immutable'
         AND tgrelid = table_name::regclass
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER %I BEFORE UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION reject_immutable_ledger_change()',
        table_name || '_immutable', table_name
      );
    END IF;
  END LOOP;
END
$$;
