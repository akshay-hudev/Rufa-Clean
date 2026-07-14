export interface FixtureRepository {
  id: string;
  vcs_provider: string | null;
  org_slug: string | null;
  repo_slug: string | null;
  default_branch: string | null;
  archived: boolean | null;
}

export const FIXTURE_CHECK_USAGE =
  "Usage: npx ts-node scripts/run-fixture-check.ts repo-slug[,repo-slug[,repo-slug]]";

export function parseFixtureSlugs(argument: string | undefined): string[] {
  if (argument === undefined || argument.trim() === "") {
    throw new Error(`A repository slug or comma-separated pair is required.\n${FIXTURE_CHECK_USAGE}`);
  }

  const slugs = argument.split(",").map((slug) => slug.trim());
  if (slugs.some((slug) => slug === "")) {
    throw new Error(`Repository slugs must not be empty.\n${FIXTURE_CHECK_USAGE}`);
  }
  if (slugs.length > 3) {
    throw new Error(`At most three repository slugs are supported.\n${FIXTURE_CHECK_USAGE}`);
  }
  if (new Set(slugs).size !== slugs.length) {
    throw new Error(`Repository slugs must be unique.\n${FIXTURE_CHECK_USAGE}`);
  }

  return slugs;
}

export function selectFixtureRepositories(
  candidates: FixtureRepository[],
  requestedSlugs: string[],
): FixtureRepository[] {
  return requestedSlugs.map((slug) => {
    const matches = candidates.filter((repository) => repository.repo_slug === slug);
    if (matches.length === 0) {
      throw new Error(`Repository not found after discovery: ${slug}`);
    }
    if (matches.length > 1) {
      const coordinates = matches
        .map((repository) => `${repository.org_slug ?? "<unknown>"}/${slug}`)
        .sort()
        .join(", ");
      throw new Error(`Repository slug is ambiguous: ${slug} (${coordinates})`);
    }

    const repository = matches[0];
    if (!repository) {
      throw new Error(`Repository not found after discovery: ${slug}`);
    }
    if (repository.archived) {
      throw new Error(`Repository is archived and cannot be indexed: ${slug}`);
    }
    if (!repository.vcs_provider || !repository.org_slug || !repository.default_branch) {
      throw new Error(`Repository is missing clone metadata: ${slug}`);
    }
    return repository;
  });
}
