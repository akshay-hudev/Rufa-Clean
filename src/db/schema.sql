CREATE TABLE IF NOT EXISTS repositories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vcs_provider text,
  org_slug text,
  repo_slug text,
  default_branch text,
  visibility text,
  discovered_at timestamptz DEFAULT now(),
  last_scanned_at timestamptz,
  primary_languages jsonb,
  build_system text,
  archived boolean DEFAULT false,
  last_commit_at timestamptz,
  classification text[] DEFAULT '{}',
  UNIQUE (vcs_provider, org_slug, repo_slug)
);

CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY,
  repository_id uuid REFERENCES repositories(id),
  root_path text,
  classification text[] DEFAULT '{}',
  build_system text,
  deploy_unit boolean DEFAULT false,
  UNIQUE (repository_id, root_path)
);

CREATE TABLE IF NOT EXISTS discovery_errors (
  id uuid PRIMARY KEY,
  repository_slug text,
  error_type text,
  message text,
  occurred_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS indexed_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid,
  repository_id uuid REFERENCES repositories(id),
  file_path text,
  language text,
  commit_sha text,
  content_hash text,
  indexed_at timestamptz DEFAULT now(),
  parse_status text,
  parse_error text,
  call_graph_status text NOT NULL DEFAULT 'not_produced',
  scip_status text NOT NULL DEFAULT 'not_attempted',
  UNIQUE (repository_id, file_path)
);

ALTER TABLE indexed_files
  ADD COLUMN IF NOT EXISTS call_graph_status TEXT NOT NULL DEFAULT 'not_produced';

ALTER TABLE indexed_files
  ADD COLUMN IF NOT EXISTS scip_status TEXT NOT NULL DEFAULT 'not_attempted';

DO $$
BEGIN
  ALTER TABLE indexed_files
    ADD CONSTRAINT indexed_files_call_graph_status_check
    CHECK (call_graph_status IN (
      'not_produced',
      'tree_sitter_resolved',
      'deprecated_superseded_by_scip'
    ));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  ALTER TABLE indexed_files
    ADD CONSTRAINT indexed_files_scip_status_check
    CHECK (scip_status IN (
      'not_attempted',
      'succeeded',
      'failed_no_tsconfig',
      'failed_other'
    ));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS symbols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid REFERENCES indexed_files(id),
  kind text,
  name text,
  qualified_name text,
  line_start int,
  line_end int,
  is_exported boolean DEFAULT false,
  visibility text DEFAULT 'unknown'
);

CREATE TABLE IF NOT EXISTS external_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid REFERENCES indexed_files(id),
  symbol_id uuid REFERENCES symbols(id),
  source_tool text,
  finding_type text,
  raw_output jsonb,
  detected_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS call_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_symbol_id uuid REFERENCES symbols(id),
  callee_symbol_id uuid REFERENCES symbols(id),
  callee_unresolved_name text,
  resolution_method text,
  file_id uuid REFERENCES indexed_files(id)
);

CREATE TABLE IF NOT EXISTS import_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  importing_file_id uuid REFERENCES indexed_files(id),
  imported_symbol_id uuid REFERENCES symbols(id),
  imported_module_path text,
  import_kind text
);

CREATE TABLE IF NOT EXISTS cross_repo_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referencing_symbol_id UUID REFERENCES symbols(id),
  referenced_symbol_id UUID REFERENCES symbols(id),
  referenced_package_coordinate TEXT,
  resolution_confidence TEXT NOT NULL,
  reference_kind TEXT NOT NULL DEFAULT 'unknown',
  reference_context TEXT NOT NULL DEFAULT 'unknown',
  source_tool TEXT NOT NULL DEFAULT 'scip',
  detected_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE cross_repo_references
  ADD COLUMN IF NOT EXISTS reference_kind TEXT NOT NULL DEFAULT 'unknown';

ALTER TABLE cross_repo_references
  ADD COLUMN IF NOT EXISTS reference_context TEXT NOT NULL DEFAULT 'unknown';

CREATE INDEX IF NOT EXISTS symbols_file_id_idx
  ON symbols (file_id);

CREATE INDEX IF NOT EXISTS call_edges_caller_symbol_id_idx
  ON call_edges (caller_symbol_id);

CREATE INDEX IF NOT EXISTS call_edges_callee_symbol_id_idx
  ON call_edges (callee_symbol_id);

CREATE INDEX IF NOT EXISTS import_edges_importing_file_id_idx
  ON import_edges (importing_file_id);

CREATE INDEX IF NOT EXISTS idx_crr_referencing
  ON cross_repo_references(referencing_symbol_id);

CREATE INDEX IF NOT EXISTS idx_crr_referenced
  ON cross_repo_references(referenced_symbol_id);

CREATE TABLE IF NOT EXISTS confidence_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol_id UUID REFERENCES symbols(id),
  signal_source TEXT NOT NULL,
  signal_status TEXT NOT NULL,
  raw_value JSONB,
  detected_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ce_symbol
  ON confidence_evidence(symbol_id);

CREATE TABLE IF NOT EXISTS confidence_verdicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol_id UUID REFERENCES symbols(id) UNIQUE,
  confidence_score FLOAT,
  verdict TEXT NOT NULL,
  evidence_summary JSONB,
  computed_at TIMESTAMPTZ DEFAULT now(),
  review_status TEXT NOT NULL DEFAULT 'unreviewed',
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ
);
