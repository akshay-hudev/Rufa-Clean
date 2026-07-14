import "dotenv/config";
import { existsSync } from "node:fs";

import { pool } from "../src/db/client";
import {
  matchScipDefinitionsToSymbols,
  resolveIntraRepoReferences,
} from "../src/indexing/analyzers/scip-match";
import { parseScipIndex } from "../src/indexing/analyzers/scip-parse";
import { runScipIndex } from "../src/indexing/analyzers/scip-typescript";
import { cloneRepository } from "../src/indexing/clone";

interface InventoryRepository {
  id: string;
  vcs_provider: string;
  org_slug: string;
  repo_slug: string;
  default_branch: string;
}

async function main(): Promise<void> {
  const repoSlug = process.argv[2]?.trim();
  if (!repoSlug) {
    throw new Error("Repository slug argument is required. Usage: npx ts-node scripts/test-scip.ts <repo-slug>");
  }

  const result = await pool.query<InventoryRepository>(
    `SELECT id, vcs_provider, org_slug, repo_slug, default_branch
       FROM repositories
      WHERE lower(vcs_provider) = 'github'
        AND repo_slug = $1
        AND archived = false
        AND default_branch IS NOT NULL
      LIMIT 1`,
    [repoSlug],
  );
  const repo = result.rows[0];
  if (!repo) {
    throw new Error(`No cloneable GitHub repository with slug "${repoSlug}" found in the inventory`);
  }

  const clone = await cloneRepository(repo);
  try {
    const scipFilePath = await runScipIndex(clone.localPath);
    if (!scipFilePath) {
      throw new Error(`SCIP TypeScript indexing did not produce an index for "${repoSlug}"`);
    }

    const documents = await parseScipIndex(scipFilePath);
    const definitions = documents.flatMap((document) =>
      document.symbols.map((symbol) => ({
        filePath: document.relativePath,
        symbolString: symbol.symbolString,
        kind: symbol.kind,
        rangeStart: symbol.rangeStart,
        rangeEnd: symbol.rangeEnd,
      })),
    );

    console.log("First 20 SCIP definitions:", definitions.slice(0, 20));

    const matches = await matchScipDefinitionsToSymbols(repo.id, documents);
    const matchedCount = matches.filter((match) => match.matchedSymbolId !== null).length;
    console.log(`Total SCIP definitions found: ${matches.length}`);
    console.log(`Matched existing symbols: ${matchedCount}`);
    console.log(`Unmatched SCIP definitions: ${matches.length - matchedCount}`);

    const insertedReferences = await resolveIntraRepoReferences(repo.id, documents, matches);
    console.log(`Inserted same-repo SCIP references: ${insertedReferences}`);
  } finally {
    await clone.cleanup();
    console.log(`Cleanup confirmed: ${!existsSync(clone.localPath)}`);
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
