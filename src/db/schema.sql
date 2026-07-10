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
