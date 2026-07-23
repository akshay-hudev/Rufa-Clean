ALTER TABLE pull_request_publications
  DROP CONSTRAINT IF EXISTS pull_request_publications_status_check;

ALTER TABLE pull_request_publications
  DROP CONSTRAINT IF EXISTS pull_request_publications_check;

ALTER TABLE pull_request_publications
  ADD CONSTRAINT pull_request_publications_status_check
  CHECK (status IN ('draft_pr_created', 'failed', 'unknown_external_state'));

ALTER TABLE pull_request_publications
  ADD CONSTRAINT pull_request_publications_result_check
  CHECK (
    (status = 'draft_pr_created' AND pr_url IS NOT NULL AND branch_name IS NOT NULL AND failure IS NULL)
    OR (status IN ('failed', 'unknown_external_state') AND failure IS NOT NULL)
  );
