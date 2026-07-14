import { pool } from "../../db/client";
import type { ScipDocument } from "./scip-parse";

export interface ScipSymbolMatch {
  scipSymbolString: string;
  matchedSymbolId: string | null;
}

export interface RepositoryScipDefinitionMatch extends ScipSymbolMatch {
  repositoryId: string;
}

export interface CrossRepoResolutionSummary {
  crossRepoResolved: number;
  crossRepoExternal: number;
}

export interface ParsedScipSymbol {
  scheme: string;
  packageCoordinate: string;
  symbolPath: string;
  packageName: string;
  version: string;
}

interface StoredSymbol {
  id: string;
  file_path: string;
  line_start: number;
  line_end: number;
}

async function loadStoredSymbols(repositoryId: string): Promise<Map<string, StoredSymbol[]>> {
  const result = await pool.query<StoredSymbol>(
    `SELECT symbols.id,
            indexed_files.file_path,
            symbols.line_start,
            symbols.line_end
       FROM symbols
       JOIN indexed_files ON indexed_files.id = symbols.file_id
      WHERE indexed_files.repository_id = $1
        AND symbols.line_start IS NOT NULL
        AND symbols.line_end IS NOT NULL`,
    [repositoryId],
  );

  const symbolsByFile = new Map<string, StoredSymbol[]>();
  for (const symbol of result.rows) {
    const fileSymbols = symbolsByFile.get(symbol.file_path) ?? [];
    fileSymbols.push(symbol);
    symbolsByFile.set(symbol.file_path, fileSymbols);
  }

  for (const fileSymbols of symbolsByFile.values()) {
    fileSymbols.sort((left, right) => {
      const leftSpan = left.line_end - left.line_start;
      const rightSpan = right.line_end - right.line_start;
      return (
        leftSpan - rightSpan ||
        right.line_start - left.line_start ||
        left.id.localeCompare(right.id)
      );
    });
  }

  return symbolsByFile;
}

function containingSymbol(
  symbolsByFile: Map<string, StoredSymbol[]>,
  filePath: string,
  zeroBasedLine: number,
): StoredSymbol | undefined {
  const oneBasedLine = zeroBasedLine + 1;
  return (symbolsByFile.get(filePath) ?? []).find(
    (symbol) => symbol.line_start <= oneBasedLine && oneBasedLine <= symbol.line_end,
  );
}

export async function matchScipDefinitionsToSymbols(
  repositoryId: string,
  scipDocuments: ScipDocument[],
): Promise<ScipSymbolMatch[]> {
  const symbolsByFile = await loadStoredSymbols(repositoryId);

  const matches: ScipSymbolMatch[] = [];
  for (const document of scipDocuments) {
    for (const definition of document.symbols) {
      if (!definition.isDefinition) {
        continue;
      }

      const matchedSymbol = containingSymbol(
        symbolsByFile,
        document.relativePath,
        definition.rangeStart[0],
      );

      matches.push({
        scipSymbolString: definition.symbolString,
        matchedSymbolId: matchedSymbol?.id ?? null,
      });
    }
  }

  return matches;
}

function targetKey(relativePath: string, symbolString: string): string {
  return symbolString.startsWith("local ")
    ? `${relativePath}\0${symbolString}`
    : symbolString;
}

export function parseScipSymbol(symbolString: string): ParsedScipSymbol | null {
  if (!symbolString || symbolString.startsWith("local ")) {
    return null;
  }

  const match = /^(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(.+)$/.exec(symbolString);
  if (!match) {
    return null;
  }

  const [, scheme, packageManager, packageName, version, symbolPath] = match;
  if (!scheme || !packageManager || !packageName || !version || !symbolPath) {
    return null;
  }

  return {
    scheme,
    packageCoordinate: `${packageManager} ${packageName} ${version}`,
    symbolPath,
    packageName,
    version,
  };
}

export function catalogScipDefinitionMatches(
  repositoryId: string,
  matchedDefinitions: ScipSymbolMatch[],
): RepositoryScipDefinitionMatch[] {
  return matchedDefinitions.map((match) => ({ repositoryId, ...match }));
}

export async function resolveIntraRepoReferences(
  repositoryId: string,
  scipDocuments: ScipDocument[],
  matchedDefinitions: ScipSymbolMatch[],
): Promise<number> {
  const referencedSymbols = new Map<string, string>();
  let matchedDefinitionIndex = 0;

  for (const document of scipDocuments) {
    for (const definition of document.symbols) {
      if (!definition.isDefinition) {
        continue;
      }

      const match = matchedDefinitions[matchedDefinitionIndex];
      matchedDefinitionIndex += 1;
      if (!match || match.scipSymbolString !== definition.symbolString) {
        throw new Error("matchedDefinitions are not aligned with the SCIP document definitions");
      }
      if (match.matchedSymbolId) {
        const key = targetKey(document.relativePath, definition.symbolString);
        if (!referencedSymbols.has(key)) {
          referencedSymbols.set(key, match.matchedSymbolId);
        }
      }
    }
  }

  if (matchedDefinitionIndex !== matchedDefinitions.length) {
    throw new Error("matchedDefinitions contain entries not present in the SCIP documents");
  }

  const symbolsByFile = await loadStoredSymbols(repositoryId);
  const referencingSymbolIds: Array<string | null> = [];
  const referencedSymbolIds: string[] = [];

  for (const document of scipDocuments) {
    for (const reference of document.references) {
      const referencedSymbolId = referencedSymbols.get(
        targetKey(document.relativePath, reference.symbolString),
      );
      if (!referencedSymbolId) {
        continue;
      }

      const referencingSymbol = containingSymbol(
        symbolsByFile,
        document.relativePath,
        reference.rangeStart[0],
      );
      referencingSymbolIds.push(referencingSymbol?.id ?? null);
      referencedSymbolIds.push(referencedSymbolId);
    }
  }

  if (referencedSymbolIds.length === 0) {
    return 0;
  }

  const insertResult = await pool.query(
    `INSERT INTO cross_repo_references (
       referencing_symbol_id,
       referenced_symbol_id,
       resolution_confidence,
       source_tool
     )
     SELECT edge.referencing_symbol_id,
            edge.referenced_symbol_id,
            'same_repo',
            'scip'
       FROM unnest($1::uuid[], $2::uuid[])
         AS edge(referencing_symbol_id, referenced_symbol_id)`,
    [referencingSymbolIds, referencedSymbolIds],
  );

  return insertResult.rowCount ?? 0;
}

function crossRepoTargetKey(packageCoordinate: string, symbolPath: string): string {
  return `${packageCoordinate}\0${symbolPath}`;
}

function semanticSymbolPath(symbolPath: string): string | null {
  const sourceFileBoundary = symbolPath.indexOf("`/");
  if (sourceFileBoundary === -1) {
    return null;
  }

  const descriptorPath = symbolPath.slice(sourceFileBoundary + 2);
  return descriptorPath || null;
}

export async function resolveCrossRepoReferences(
  repositoryId: string,
  scipDocuments: ScipDocument[],
  allRepositoryDefinitions: RepositoryScipDefinitionMatch[],
): Promise<CrossRepoResolutionSummary> {
  const currentPackageCoordinates = new Set<string>();
  const otherIndexedPackageCoordinates = new Set<string>();
  const otherMatchedDefinitions = new Map<string, string>();
  const otherSemanticDefinitions = new Map<string, Set<string>>();

  const orderedDefinitions = [...allRepositoryDefinitions].sort(
    (left, right) =>
      left.repositoryId.localeCompare(right.repositoryId) ||
      left.scipSymbolString.localeCompare(right.scipSymbolString) ||
      (left.matchedSymbolId ?? "").localeCompare(right.matchedSymbolId ?? ""),
  );

  for (const definition of orderedDefinitions) {
    const parsed = parseScipSymbol(definition.scipSymbolString);
    if (!parsed || (parsed.packageName === "." && parsed.version === ".")) {
      continue;
    }

    if (definition.repositoryId === repositoryId) {
      currentPackageCoordinates.add(parsed.packageCoordinate);
      continue;
    }

    otherIndexedPackageCoordinates.add(parsed.packageCoordinate);
    if (definition.matchedSymbolId) {
      const key = crossRepoTargetKey(parsed.packageCoordinate, parsed.symbolPath);
      if (!otherMatchedDefinitions.has(key)) {
        otherMatchedDefinitions.set(key, definition.matchedSymbolId);
      }

      const semanticPath = semanticSymbolPath(parsed.symbolPath);
      if (semanticPath) {
        const semanticKey = crossRepoTargetKey(parsed.packageCoordinate, semanticPath);
        const symbolIds = otherSemanticDefinitions.get(semanticKey) ?? new Set<string>();
        symbolIds.add(definition.matchedSymbolId);
        otherSemanticDefinitions.set(semanticKey, symbolIds);
      }
    }
  }

  if (currentPackageCoordinates.size === 0) {
    console.warn(
      `Cross-repository SCIP resolution skipped for ${repositoryId}: current package coordinate not found`,
    );
    return { crossRepoResolved: 0, crossRepoExternal: 0 };
  }

  const symbolsByFile = await loadStoredSymbols(repositoryId);
  const referencingSymbolIds: Array<string | null> = [];
  const referencedSymbolIds: Array<string | null> = [];
  const packageCoordinates: string[] = [];
  const confidences: string[] = [];
  let crossRepoResolved = 0;
  let crossRepoExternal = 0;

  for (const document of scipDocuments) {
    for (const reference of document.references) {
      const parsed = parseScipSymbol(reference.symbolString);
      if (!parsed || currentPackageCoordinates.has(parsed.packageCoordinate)) {
        continue;
      }

      const referencingSymbol = containingSymbol(
        symbolsByFile,
        document.relativePath,
        reference.rangeStart[0],
      );
      const targetKey = crossRepoTargetKey(parsed.packageCoordinate, parsed.symbolPath);
      let referencedSymbolId = otherMatchedDefinitions.get(targetKey);
      if (!referencedSymbolId) {
        const semanticPath = semanticSymbolPath(parsed.symbolPath);
        const semanticMatches = semanticPath
          ? otherSemanticDefinitions.get(crossRepoTargetKey(parsed.packageCoordinate, semanticPath))
          : undefined;
        if (semanticMatches?.size === 1) {
          referencedSymbolId = semanticMatches.values().next().value;
        }
      }

      if (referencedSymbolId) {
        referencingSymbolIds.push(referencingSymbol?.id ?? null);
        referencedSymbolIds.push(referencedSymbolId);
        packageCoordinates.push(parsed.packageCoordinate);
        confidences.push("cross_repo_resolved");
        crossRepoResolved += 1;
        continue;
      }

      if (!otherIndexedPackageCoordinates.has(parsed.packageCoordinate)) {
        referencingSymbolIds.push(referencingSymbol?.id ?? null);
        referencedSymbolIds.push(null);
        packageCoordinates.push(parsed.packageCoordinate);
        confidences.push("cross_repo_external");
        crossRepoExternal += 1;
      }
    }
  }

  if (confidences.length === 0) {
    return { crossRepoResolved, crossRepoExternal };
  }

  await pool.query(
    `INSERT INTO cross_repo_references (
       referencing_symbol_id,
       referenced_symbol_id,
       referenced_package_coordinate,
       resolution_confidence,
       source_tool
     )
     SELECT edge.referencing_symbol_id,
            edge.referenced_symbol_id,
            edge.package_coordinate,
            edge.resolution_confidence,
            'scip'
       FROM unnest($1::uuid[], $2::uuid[], $3::text[], $4::text[])
         AS edge(
           referencing_symbol_id,
           referenced_symbol_id,
           package_coordinate,
           resolution_confidence
         )`,
    [referencingSymbolIds, referencedSymbolIds, packageCoordinates, confidences],
  );

  return { crossRepoResolved, crossRepoExternal };
}
