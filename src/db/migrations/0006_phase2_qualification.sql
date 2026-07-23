CREATE TABLE IF NOT EXISTS phase2_qualification_requests (
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

CREATE TABLE IF NOT EXISTS phase2_qualification_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_scope_id text NOT NULL REFERENCES account_scopes(id) ON DELETE RESTRICT,
  request_id uuid NOT NULL REFERENCES phase2_qualification_requests(id) ON DELETE RESTRICT,
  status text NOT NULL CHECK (status IN (
    'ready', 'ready_with_limited_gates', 'configuration_required',
    'baseline_broken', 'unsupported', 'inaccessible', 'failed', 'stale',
    'security_blocked', 'authorization_rejected'
  )),
  qualification_digest text NOT NULL CHECK (qualification_digest ~ '^[0-9a-f]{64}$'),
  result_bundle jsonb NOT NULL,
  actor_identity text NOT NULL CHECK (btrim(actor_identity) <> ''),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_scope_id, qualification_digest)
);

CREATE TABLE IF NOT EXISTS phase2_baseline_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_scope_id text NOT NULL REFERENCES account_scopes(id) ON DELETE RESTRICT,
  qualification_result_id uuid NOT NULL REFERENCES phase2_qualification_results(id) ON DELETE RESTRICT,
  gate_id text NOT NULL CHECK (gate_id IN ('typecheck', 'build', 'test')),
  result_digest text NOT NULL CHECK (result_digest ~ '^[0-9a-f]{64}$'),
  result_bundle jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (qualification_result_id, gate_id)
);

CREATE TABLE IF NOT EXISTS phase2_capability_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_scope_id text NOT NULL REFERENCES account_scopes(id) ON DELETE RESTRICT,
  qualification_result_id uuid NOT NULL REFERENCES phase2_qualification_results(id) ON DELETE RESTRICT,
  capability_id text NOT NULL CHECK (btrim(capability_id) <> ''),
  route_status text NOT NULL CHECK (route_status IN (
    'enabled', 'enabled_with_limits', 'configuration_required',
    'blocked_by_baseline', 'blocked_by_security', 'unsupported',
    'unavailable', 'stale'
  )),
  route_bundle jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (qualification_result_id, capability_id)
);

CREATE TABLE IF NOT EXISTS phase2_qualification_events (
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

CREATE TRIGGER phase2_qualification_requests_immutable
  BEFORE UPDATE OR DELETE ON phase2_qualification_requests
  FOR EACH ROW EXECUTE FUNCTION reject_immutable_ledger_change();

CREATE TRIGGER phase2_qualification_results_immutable
  BEFORE UPDATE OR DELETE ON phase2_qualification_results
  FOR EACH ROW EXECUTE FUNCTION reject_immutable_ledger_change();

CREATE TRIGGER phase2_baseline_results_immutable
  BEFORE UPDATE OR DELETE ON phase2_baseline_results
  FOR EACH ROW EXECUTE FUNCTION reject_immutable_ledger_change();

CREATE TRIGGER phase2_capability_routes_immutable
  BEFORE UPDATE OR DELETE ON phase2_capability_routes
  FOR EACH ROW EXECUTE FUNCTION reject_immutable_ledger_change();

CREATE TRIGGER phase2_qualification_events_immutable
  BEFORE UPDATE OR DELETE ON phase2_qualification_events
  FOR EACH ROW EXECUTE FUNCTION reject_immutable_ledger_change();

