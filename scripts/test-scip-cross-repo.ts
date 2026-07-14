import "dotenv/config";

import { pool } from "../src/db/client";
import {
  catalogScipDefinitionMatches,
  matchScipDefinitionsToSymbols,
  resolveCrossRepoReferences,
  type RepositoryScipDefinitionMatch,
  type ScipSymbolMatch,
} from "../src/indexing/analyzers/scip-match";
import { parseScipIndex, type ScipDocument } from "../src/indexing/analyzers/scip-parse";
import { runScipIndex } from "../src/indexing/analyzers/scip-typescript";
import { cloneRepository } from "../src/indexing/clone";

interface InventoryRepository {
  id: string;
  vcs_provider: string;
  org_slug: string;
  repo_slug: string;
  default_branch: string;
}

interface IndexedScipRepository {
  id: string;
  repoSlug: string;
  documents: ScipDocument[];
  matchedDefinitions: ScipSymbolMatch[];
}

async function indexRepository(
  repository: InventoryRepository,
): Promise<IndexedScipRepository | null> {
  const clone = await cloneRepository(repository);
  try {
    const scipFilePath = await runScipIndex(clone.localPath);
    if (!scipFilePath) {
      return null;
    }

    const documents = await parseScipIndex(scipFilePath);
    const matchedDefinitions = await matchScipDefinitionsToSymbols(repository.id, documents);
    return {
      id: repository.id,
      repoSlug: repository.repo_slug,
      documents,
      matchedDefinitions,
    };
  } finally {
    await clone.cleanup();
  }
}

async function main(): Promise<void> {
  const result = await pool.query<InventoryRepository>(
    `SELECT id, vcs_provider, org_slug, repo_slug, default_branch
       FROM repositories
      WHERE lower(vcs_provider) = 'github'
        AND archived = false
        AND default_branch IS NOT NULL
      ORDER BY repo_slug`,
  );

  const indexedRepositories: IndexedScipRepository[] = [];
  for (const repository of result.rows) {
    try {
      const indexed = await indexRepository(repository);
      if (indexed) {
        indexedRepositories.push(indexed);
        console.log(
          `Indexed ${indexed.repoSlug}: ${indexed.matchedDefinitions.length} SCIP definitions`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`SCIP batch indexing failed for ${repository.repo_slug}: ${message}`);
    }
  }

  const definitionCatalog: RepositoryScipDefinitionMatch[] = indexedRepositories.flatMap(
    (repository) => catalogScipDefinitionMatches(repository.id, repository.matchedDefinitions),
  );

  for (const repository of indexedRepositories) {
    const summary = await resolveCrossRepoReferences(
      repository.id,
      repository.documents,
      definitionCatalog,
    );
    console.log(`${repository.repoSlug} cross-repository resolution:`, summary);
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
