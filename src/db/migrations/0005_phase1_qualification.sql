CREATE TABLE IF NOT EXISTS qualification_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_scope_id text NOT NULL REFERENCES account_scopes(id) ON DELETE RESTRICT,
  repository_provider text NOT NULL CHECK (repository_provider = 'github'),
  repository_owner text NOT NULL CHECK (btrim(repository_owner) <> ''),
  repository_name text NOT NULL CHECK (btrim(repository_name) <> ''),
  commit_sha text NOT NULL CHECK (commit_sha ~ '^[0-9a-f]{40}$'),
  status text NOT NULL CHECK (status IN ('ready', 'unsupported', 'blocked', 'invalid')),
  qualification_digest text NOT NULL CHECK (qualification_digest ~ '^[0-9a-f]{64}$'),
  qualification_bundle jsonb NOT NULL,
  actor_identity text NOT NULL CHECK (btrim(actor_identity) <> ''),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_scope_id, qualification_digest)
);

CREATE TRIGGER qualification_runs_immutable
  BEFORE UPDATE OR DELETE ON qualification_runs
  FOR EACH ROW EXECUTE FUNCTION reject_immutable_ledger_change();
