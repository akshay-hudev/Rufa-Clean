CREATE TABLE IF NOT EXISTS phase3a_workspace_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_scope_id text NOT NULL REFERENCES account_scopes(id) ON DELETE RESTRICT,
  authorization_id text NOT NULL CHECK (btrim(authorization_id) <> ''),
  repository_provider text NOT NULL CHECK (repository_provider = 'github'),
  repository_owner text NOT NULL CHECK (btrim(repository_owner) <> ''),
  repository_name text NOT NULL CHECK (btrim(repository_name) <> ''),
  resolved_commit text NOT NULL CHECK (resolved_commit ~ '^[0-9a-f]{40}$'),
  source_snapshot_id text NOT NULL CHECK (source_snapshot_id ~ '^[0-9a-f]{64}$'),
  request_digest text NOT NULL CHECK (request_digest ~ '^[0-9a-f]{64}$'),
  request_bundle jsonb NOT NULL,
  actor_identity text NOT NULL CHECK (btrim(actor_identity) <> ''),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_scope_id, request_digest)
);

CREATE TABLE IF NOT EXISTS phase3a_workspace_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_scope_id text NOT NULL REFERENCES account_scopes(id) ON DELETE RESTRICT,
  request_id uuid NOT NULL REFERENCES phase3a_workspace_requests(id) ON DELETE RESTRICT,
  status text NOT NULL CHECK (status IN (
    'ready', 'ready_with_limited_packages', 'configuration_required',
    'baseline_broken', 'partially_supported', 'unsupported', 'inaccessible',
    'failed', 'stale', 'security_blocked', 'authorization_rejected'
  )),
  qualification_digest text NOT NULL CHECK (qualification_digest ~ '^[0-9a-f]{64}$'),
  result_bundle jsonb NOT NULL,
  actor_identity text NOT NULL CHECK (btrim(actor_identity) <> ''),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_scope_id, qualification_digest)
);

CREATE TABLE IF NOT EXISTS phase3a_workspace_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_scope_id text NOT NULL REFERENCES account_scopes(id) ON DELETE RESTRICT,
  qualification_result_id uuid NOT NULL REFERENCES phase3a_workspace_results(id) ON DELETE RESTRICT,
  package_identity_digest text NOT NULL CHECK (package_identity_digest ~ '^[0-9a-f]{64}$'),
  package_bundle jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (qualification_result_id, package_identity_digest)
);

CREATE TABLE IF NOT EXISTS phase3a_workspace_graphs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_scope_id text NOT NULL REFERENCES account_scopes(id) ON DELETE RESTRICT,
  qualification_result_id uuid NOT NULL UNIQUE REFERENCES phase3a_workspace_results(id) ON DELETE RESTRICT,
  graph_digest text NOT NULL CHECK (graph_digest ~ '^[0-9a-f]{64}$'),
  graph_bundle jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS phase3a_workspace_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_scope_id text NOT NULL REFERENCES account_scopes(id) ON DELETE RESTRICT,
  sequence bigint NOT NULL CHECK (sequence > 0),
  event_type text NOT NULL CHECK (btrim(event_type) <> ''),
  subject_type text NOT NULL CHECK (btrim(subject_type) <> ''),
  subject_id text NOT NULL CHECK (btrim(subject_id) <> ''),
  payload jsonb NOT NULL,
  previous_event_hash text,
  event_hash text NOT NULL CHECK (event_hash ~ '^[0-9a-f]{64}$'),
  actor_identity text NOT NULL CHECK (btrim(actor_identity) <> ''),
  created_at timestamptz NOT NULL,
  UNIQUE (account_scope_id, sequence),
  UNIQUE (account_scope_id, event_hash)
);

CREATE TRIGGER phase3a_workspace_requests_immutable
  BEFORE UPDATE OR DELETE ON phase3a_workspace_requests
  FOR EACH ROW EXECUTE FUNCTION reject_immutable_ledger_change();

CREATE TRIGGER phase3a_workspace_results_immutable
  BEFORE UPDATE OR DELETE ON phase3a_workspace_results
  FOR EACH ROW EXECUTE FUNCTION reject_immutable_ledger_change();

CREATE TRIGGER phase3a_workspace_packages_immutable
  BEFORE UPDATE OR DELETE ON phase3a_workspace_packages
  FOR EACH ROW EXECUTE FUNCTION reject_immutable_ledger_change();

CREATE TRIGGER phase3a_workspace_graphs_immutable
  BEFORE UPDATE OR DELETE ON phase3a_workspace_graphs
  FOR EACH ROW EXECUTE FUNCTION reject_immutable_ledger_change();

CREATE TRIGGER phase3a_workspace_events_immutable
  BEFORE UPDATE OR DELETE ON phase3a_workspace_events
  FOR EACH ROW EXECUTE FUNCTION reject_immutable_ledger_change();
