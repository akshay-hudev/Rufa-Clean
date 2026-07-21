ALTER TABLE pull_request_publications
  DROP CONSTRAINT IF EXISTS pull_request_publications_remediation_attempt_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS pull_request_publications_one_success_idx
  ON pull_request_publications(remediation_attempt_id)
  WHERE status = 'draft_pr_created';

CREATE INDEX IF NOT EXISTS pull_request_publications_attempt_idx
  ON pull_request_publications(remediation_attempt_id, created_at DESC, id DESC);
