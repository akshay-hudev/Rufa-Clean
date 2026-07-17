import { readdir, readFile } from "node:fs/promises";
import { dirname, extname, relative, resolve } from "node:path";

import type { RemovalCandidate, RemovalValidation } from "./types";

const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]);
const IGNORED_DIRECTORIES = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".next",
  ".turbo",
]);

export interface SourceAuditResult {
  symbol: string;
  sourceOccurrences: number;
  defaultImportConsumers: string[];
  checkedFiles: number;
}

async function sourceFiles(root: string): Promise<string[]> {
  const found: string[] = [];
  async function visit(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!IGNORED_DIRECTORIES.has(entry.name)) {
          await visit(resolve(directory, entry.name));
        }
      } else if (entry.isFile() && SOURCE_EXTENSIONS.has(extname(entry.name))) {
        found.push(resolve(directory, entry.name));
      }
    }
  }
  await visit(root);
  return found;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function withoutSourceExtension(path: string): string {
  return path.replace(/\.(?:[cm]?[jt]sx?)$/i, "").replace(/\/index$/i, "");
}

function importsCandidateAsDefault(
  importerPath: string,
  source: string,
  candidatePath: string,
): boolean {
  const importPattern = /\bimport\s+[A-Za-z_$][\w$]*\s*(?:,\s*\{[^}]*\})?\s+from\s+['"]([^'"]+)['"]/g;
  for (const match of source.matchAll(importPattern)) {
    const specifier = match[1];
    if (!specifier?.startsWith(".")) {
      continue;
    }
    const resolvedImport = withoutSourceExtension(resolve(dirname(importerPath), specifier));
    if (resolvedImport === withoutSourceExtension(candidatePath)) {
      return true;
    }
  }
  return false;
}

export async function auditCandidateSourceReferences(
  repositoryPath: string,
  candidate: RemovalCandidate,
  validation: RemovalValidation,
): Promise<SourceAuditResult> {
  const files = await sourceFiles(repositoryPath);
  const candidatePath = resolve(repositoryPath, candidate.filePath);

  if (validation.shape === "default_export_alias") {
    const consumers: string[] = [];
    for (const file of files) {
      if (file === candidatePath) {
        continue;
      }
      const source = await readFile(file, "utf8");
      if (importsCandidateAsDefault(file, source, candidatePath)) {
        consumers.push(relative(repositoryPath, file));
      }
    }
    const candidateSource = await readFile(candidatePath, "utf8");
    const sourceOccurrences = [...candidateSource.matchAll(/\bexport\s+default\b/g)].length;
    if (sourceOccurrences !== 1 || consumers.length > 0) {
      throw new Error(
        `Source audit rejected default export in ${candidate.filePath}: ` +
          `${sourceOccurrences} declarations, ${consumers.length} default-import consumers`,
      );
    }
    return {
      symbol: candidate.symbolName,
      sourceOccurrences,
      defaultImportConsumers: consumers,
      checkedFiles: files.length,
    };
  }

  const identifier = new RegExp(`\\b${escapeRegex(candidate.symbolName)}\\b`, "g");
  let sourceOccurrences = 0;
  for (const file of files) {
    const source = await readFile(file, "utf8");
    sourceOccurrences += [...source.matchAll(identifier)].length;
  }
  if (sourceOccurrences !== 1) {
    throw new Error(
      `Source audit rejected ${candidate.symbolName}: expected only its declaration, ` +
        `found ${sourceOccurrences} repository source occurrences`,
    );
  }
  return {
    symbol: candidate.symbolName,
    sourceOccurrences,
    defaultImportConsumers: [],
    checkedFiles: files.length,
  };
}
