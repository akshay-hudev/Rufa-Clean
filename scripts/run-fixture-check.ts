import "dotenv/config";

import { pool } from "../src/db/client";
import { migrate } from "../src/db/migrate";
import { runSync } from "../src/discovery/sync";
import {
  FIXTURE_CHECK_USAGE,
  parseFixtureSlugs,
  selectFixtureRepositories,
  type FixtureRepository,
} from "../src/fixtures/check";
import {
  catalogScipDefinitionMatches,
  resolveCrossRepoReferences,
  type RepositoryScipDefinitionMatch,
} from "../src/indexing/analyzers/scip-match";
import { runIndexing, type ScipRepositoryIndex } from "../src/indexing/sync";

type OutputRow = Record<string, unknown>;

function printTable(title: string, rows: OutputRow[]): void {
  console.log(`\n=== ${title} (${rows.length}) ===`);
  if (rows.length === 0) {
    console.log("(none)");
    return;
  }
  console.table(rows);
}

async function loadRequestedRepositories(slugs: string[]): Promise<FixtureRepository[]> {
  const result = await pool.query<FixtureRepository>(
    `SELECT id, vcs_provider, org_slug, repo_slug, default_branch, archived
       FROM repositories
      WHERE repo_slug = ANY($1::text[])
      ORDER BY repo_slug, org_slug, id`,
    [slugs],
  );
  return selectFixtureRepositories(result.rows, slugs);
}

async function printFixtureEvidence(repositoryIds: string[]): Promise<void> {
  const metadata = await pool.query(
    `SELECT repo_slug, org_slug, vcs_provider, default_branch, archived,
            classification, primary_languages, build_system, last_scanned_at
       FROM repositories
      WHERE id = ANY($1::uuid[])
      ORDER BY repo_slug, org_slug`,
    [repositoryIds],
  );
  printTable("Repositories", metadata.rows as OutputRow[]);

  const symbols = await pool.query(
    `SELECT repositories.repo_slug,
            indexed_files.file_path,
            symbols.name,
            symbols.kind,
            symbols.line_start,
            symbols.line_end,
            symbols.is_exported
       FROM symbols
       JOIN indexed_files ON indexed_files.id = symbols.file_id
       JOIN repositories ON repositories.id = indexed_files.repository_id
      WHERE repositories.id = ANY($1::uuid[])
      ORDER BY repositories.repo_slug,
               indexed_files.file_path,
               symbols.line_start,
               symbols.line_end,
               symbols.name,
               symbols.id`,
    [repositoryIds],
  );
  printTable("Symbols", symbols.rows as OutputRow[]);

  const signals = await pool.query(
    `SELECT repositories.repo_slug,
            indexed_files.file_path,
            symbols.name AS symbol_name,
            external_signals.source_tool,
            external_signals.finding_type,
            external_signals.raw_output,
            external_signals.detected_at
       FROM external_signals
       LEFT JOIN symbols ON symbols.id = external_signals.symbol_id
       JOIN indexed_files ON indexed_files.id = external_signals.file_id
       JOIN repositories ON repositories.id = indexed_files.repository_id
      WHERE repositories.id = ANY($1::uuid[])
      ORDER BY repositories.repo_slug,
               indexed_files.file_path,
               external_signals.source_tool,
               external_signals.finding_type,
               symbols.name NULLS LAST,
               external_signals.id`,
    [repositoryIds],
  );
  printTable("Knip/Vulture findings", signals.rows as OutputRow[]);

  const callEdges = await pool.query(
    `SELECT COALESCE(caller_repo.repo_slug, edge_repo.repo_slug) AS repository,
            caller_file.file_path AS caller_file,
            caller.name AS caller_symbol,
            callee_repo.repo_slug AS callee_repository,
            callee_file.file_path AS callee_file,
            callee.name AS callee_symbol,
            call_edges.callee_unresolved_name,
            call_edges.resolution_method
       FROM call_edges
       LEFT JOIN symbols caller ON caller.id = call_edges.caller_symbol_id
       LEFT JOIN indexed_files caller_file ON caller_file.id = caller.file_id
       LEFT JOIN repositories caller_repo ON caller_repo.id = caller_file.repository_id
       LEFT JOIN symbols callee ON callee.id = call_edges.callee_symbol_id
       LEFT JOIN indexed_files callee_file ON callee_file.id = callee.file_id
       LEFT JOIN repositories callee_repo ON callee_repo.id = callee_file.repository_id
       LEFT JOIN indexed_files edge_file ON edge_file.id = call_edges.file_id
       LEFT JOIN repositories edge_repo ON edge_repo.id = edge_file.repository_id
      WHERE caller_repo.id = ANY($1::uuid[])
         OR callee_repo.id = ANY($1::uuid[])
         OR edge_repo.id = ANY($1::uuid[])
      ORDER BY repository,
               caller_file NULLS LAST,
               caller_symbol NULLS LAST,
               callee_repository NULLS LAST,
               callee_file NULLS LAST,
               callee_symbol NULLS LAST,
               call_edges.id`,
    [repositoryIds],
  );
  printTable("Call edges", callEdges.rows as OutputRow[]);

  const scipReferences = await pool.query(
    `SELECT referencing_repo.repo_slug AS referencing_repository,
            referencing_file.file_path AS referencing_file,
            referencing_symbol.name AS referencing_symbol,
            referenced_repo.repo_slug AS referenced_repository,
            referenced_file.file_path AS referenced_file,
            referenced_symbol.name AS referenced_symbol,
            cross_repo_references.referenced_package_coordinate,
            cross_repo_references.resolution_confidence,
            cross_repo_references.reference_kind,
            cross_repo_references.reference_context,
            cross_repo_references.source_tool,
            cross_repo_references.detected_at
       FROM cross_repo_references
       LEFT JOIN symbols referencing_symbol
         ON referencing_symbol.id = cross_repo_references.referencing_symbol_id
       LEFT JOIN indexed_files referencing_file ON referencing_file.id = referencing_symbol.file_id
       LEFT JOIN repositories referencing_repo
         ON referencing_repo.id = referencing_file.repository_id
       LEFT JOIN symbols referenced_symbol
         ON referenced_symbol.id = cross_repo_references.referenced_symbol_id
       LEFT JOIN indexed_files referenced_file ON referenced_file.id = referenced_symbol.file_id
       LEFT JOIN repositories referenced_repo ON referenced_repo.id = referenced_file.repository_id
      WHERE referencing_repo.id = ANY($1::uuid[])
         OR referenced_repo.id = ANY($1::uuid[])
      ORDER BY cross_repo_references.resolution_confidence,
               referencing_repository NULLS LAST,
               referencing_file NULLS LAST,
               referencing_symbol NULLS LAST,
               referenced_repository NULLS LAST,
               referenced_file NULLS LAST,
               referenced_symbol NULLS LAST,
               cross_repo_references.id`,
    [repositoryIds],
  );

  const crossRepoSummary = await pool.query(
    `SELECT repositories.repo_slug,
            indexed_files.file_path,
            symbols.name AS referenced_symbol,
            count(cross_repo_references.id) FILTER (
              WHERE cross_repo_references.resolution_confidence = 'cross_repo_resolved'
            )::int AS cross_repo_resolved_count
       FROM symbols
       JOIN indexed_files ON indexed_files.id = symbols.file_id
       JOIN repositories ON repositories.id = indexed_files.repository_id
       LEFT JOIN cross_repo_references
         ON cross_repo_references.referenced_symbol_id = symbols.id
      WHERE repositories.id = ANY($1::uuid[])
      GROUP BY repositories.repo_slug,
               indexed_files.file_path,
               symbols.name,
               symbols.line_start,
               symbols.id
      ORDER BY repositories.repo_slug,
               indexed_files.file_path,
               symbols.line_start,
               symbols.name,
               symbols.id`,
    [repositoryIds],
  );
  printTable("Cross-repository resolved counts by symbol", crossRepoSummary.rows as OutputRow[]);

  const executableSummary = await pool.query(
    `SELECT repositories.repo_slug,
            indexed_files.file_path,
            symbols.name AS referenced_symbol,
            count(cross_repo_references.id) FILTER (
              WHERE cross_repo_references.reference_kind IN ('call', 'construct', 'read')
                AND cross_repo_references.referencing_symbol_id
                    IS DISTINCT FROM cross_repo_references.referenced_symbol_id
            )::int AS executable_reference_count,
            count(cross_repo_references.id) FILTER (
              WHERE cross_repo_references.reference_kind IN ('call', 'construct', 'read')
                AND cross_repo_references.reference_context = 'production'
                AND cross_repo_references.referencing_symbol_id
                    IS DISTINCT FROM cross_repo_references.referenced_symbol_id
            )::int AS production_executable_count,
            count(cross_repo_references.id) FILTER (
              WHERE cross_repo_references.reference_kind IN ('call', 'construct', 'read')
                AND cross_repo_references.reference_context = 'test'
                AND cross_repo_references.referencing_symbol_id
                    IS DISTINCT FROM cross_repo_references.referenced_symbol_id
            )::int AS test_executable_count
       FROM symbols
       JOIN indexed_files ON indexed_files.id = symbols.file_id
       JOIN repositories ON repositories.id = indexed_files.repository_id
       LEFT JOIN cross_repo_references
         ON cross_repo_references.referenced_symbol_id = symbols.id
      WHERE repositories.id = ANY($1::uuid[])
      GROUP BY repositories.repo_slug,
               indexed_files.file_path,
               symbols.name,
               symbols.line_start,
               symbols.id
      ORDER BY repositories.repo_slug,
               indexed_files.file_path,
               symbols.line_start,
               symbols.name,
               symbols.id`,
    [repositoryIds],
  );
  printTable("Executable SCIP references by symbol", executableSummary.rows as OutputRow[]);
  printTable("SCIP references", scipReferences.rows as OutputRow[]);

  console.log(
    "\nConfidence verdicts are unavailable and intentionally omitted: " +
      "the Confidence & Review module has not been implemented yet.",
  );
}

export async function runFixtureCheck(slugs: string[]): Promise<void> {
  await migrate();
  console.log("Database schema is up to date.");

  await runSync();
  const repositories = await loadRequestedRepositories(slugs);
  const scipIndexes: ScipRepositoryIndex[] = [];

  for (const repository of repositories) {
    if (!repository.repo_slug) {
      throw new Error(`Repository ${repository.id} has no slug`);
    }
    console.log(`\nIndexing fixture repository: ${repository.repo_slug}`);
    const scipIndex = await runIndexing(repository.id);
    if (!scipIndex) {
      throw new Error(`SCIP indexing produced no index for fixture: ${repository.repo_slug}`);
    }
    scipIndexes.push(scipIndex);
  }

  if (repositories.length > 1) {
    const catalog: RepositoryScipDefinitionMatch[] = scipIndexes.flatMap((index) =>
      catalogScipDefinitionMatches(index.repositoryId, index.matchedDefinitions)
    );
    for (const index of scipIndexes) {
      const summary = await resolveCrossRepoReferences(
        index.repositoryId,
        index.documents,
        catalog,
      );
      const slug = repositories.find((repository) => repository.id === index.repositoryId)
        ?.repo_slug;
      console.log(`${slug ?? index.repositoryId} cross-repository resolution:`, summary);
    }
  }

  await printFixtureEvidence(repositories.map((repository) => repository.id));
}

async function main(): Promise<void> {
  const arguments_ = process.argv.slice(2);
  if (arguments_.length !== 1) {
    throw new Error(FIXTURE_CHECK_USAGE);
  }
  await runFixtureCheck(parseFixtureSlugs(arguments_[0]));
}

if (require.main === module) {
  const keepAlive = setInterval(() => undefined, 1_000);
  void main()
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    })
    .finally(async () => {
      clearInterval(keepAlive);
      await pool.end();
    });
}
