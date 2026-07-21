import { readdir, readFile, stat } from "node:fs/promises";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import ts from "typescript";

import type { ScipDocument, ScipOccurrence } from "../indexing/analyzers/scip-parse";
import { digestCanonical, sha256 } from "./canonical";
import { inspectTypeScriptFunctions, type TypeScriptFunctionShape } from "./typescript-shapes";
import {
  MILESTONE_POLICY_VERSION,
  type AnalysisInput,
  type CanonicalAnalysisResult,
  type CoverageBundle,
  type FindingBundle,
  type FindingClassification,
  type FindingEvidence,
} from "./types";

const IGNORED_DIRECTORIES = new Set([".git", "node_modules", "dist", "build", "coverage", ".next", ".turbo"]);
const EXCLUDED_SOURCE_SEGMENTS = new Set(["vendor", "vendored", "generated"]);
const MAX_TEXT_AUDIT_FILE_BYTES = 2 * 1024 * 1024;
const TREE_SITTER_VERSION = "tree-sitter-typescript@0.23.2";

interface LoadedSource {
  path: string;
  content: string;
  hash: string;
  generated: boolean;
}

interface ShapeWithSource extends TypeScriptFunctionShape {
  file: LoadedSource;
}

function portablePath(path: string): string {
  return path.split(sep).join("/");
}

function withinRoot(root: string, path: string): boolean {
  const child = relative(root, path);
  return child !== "" && !child.startsWith("..") && !isAbsolute(child);
}

async function walkFiles(root: string): Promise<string[]> {
  const files: string[] = [];
  const visit = async (directory: string): Promise<void> => {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      if (entry.isSymbolicLink()) {
        continue;
      }
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!IGNORED_DIRECTORIES.has(entry.name)) {
          await visit(path);
        }
      } else if (entry.isFile()) {
        files.push(path);
      }
    }
  };
  await visit(root);
  return files;
}

function generatedSource(path: string, content: string): boolean {
  const segments = portablePath(path).split("/").map((segment) => segment.toLowerCase());
  return segments.some((segment) => EXCLUDED_SOURCE_SEGMENTS.has(segment)) ||
    /(?:@generated|generated file|do not edit)/i.test(content.slice(0, 1024));
}

function tsDiagnostic(error: ts.Diagnostic): string {
  return ts.flattenDiagnosticMessageText(error.messageText, " ");
}

async function loadConfiguredFiles(root: string): Promise<{
  packageJson: Buffer;
  packageLock: Buffer;
  tsconfig: Buffer;
  files: string[];
  errors: string[];
}> {
  const packageJsonPath = join(root, "package.json");
  const packageLockPath = join(root, "package-lock.json");
  const tsconfigPath = join(root, "tsconfig.json");
  const [packageJson, packageLock, tsconfig] = await Promise.all([
    readFile(packageJsonPath), readFile(packageLockPath), readFile(tsconfigPath),
  ]);
  const manifest = JSON.parse(packageJson.toString("utf8")) as { workspaces?: unknown };
  if (manifest.workspaces !== undefined) {
    throw new Error("unsupported: npm workspaces are outside the approved milestone");
  }

  const allFiles = await walkFiles(root);
  const nestedPackages = allFiles.filter((path) =>
    path !== packageJsonPath && path.endsWith(`${sep}package.json`)
  );
  if (nestedPackages.length > 0) {
    throw new Error(`unsupported: nested package found at ${portablePath(relative(root, nestedPackages[0]!))}`);
  }

  const additionalRootConfigs = allFiles.filter((path) => {
    const candidate = portablePath(relative(root, path));
    return !candidate.includes("/") && /^tsconfig\..+\.json$/i.test(candidate);
  });
  if (additionalRootConfigs.length > 0) {
    throw new Error(
      `unsupported: multiple root TypeScript configurations found (${additionalRootConfigs.map((path) => portablePath(relative(root, path))).join(", ")})`,
    );
  }

  const configRead = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  const errors: string[] = [];
  if (configRead.error) {
    errors.push(tsDiagnostic(configRead.error));
  }
  if (Array.isArray((configRead.config as { references?: unknown } | undefined)?.references)) {
    throw new Error("unsupported: solution-style tsconfig project references are outside the milestone");
  }
  const parsed = ts.parseJsonConfigFileContent(
    configRead.config ?? {},
    ts.sys,
    root,
    { noEmit: true },
    tsconfigPath,
  );
  errors.push(...parsed.errors.map(tsDiagnostic));
  const files = parsed.fileNames
    .map((path) => resolve(path))
    .filter((path) => withinRoot(root, path))
    .sort();
  if (!files.some((path) => path.endsWith(".ts") && !path.endsWith(".d.ts"))) {
    throw new Error("unsupported: root tsconfig contains no supported .ts source files");
  }
  return { packageJson, packageLock, tsconfig, files, errors };
}

function definitionWithinShape(definition: ScipOccurrence, shape: ShapeWithSource): boolean {
  const line = definition.rangeStart[0] + 1;
  const column = definition.rangeStart[1] + 1;
  return line === shape.nameLine && column === shape.nameColumnStart;
}

function matchingDefinitions(documents: ScipDocument[], shape: ShapeWithSource): ScipOccurrence[] {
  const document = documents.find((candidate) => portablePath(candidate.relativePath) === shape.file.path);
  return (document?.symbols ?? []).filter((definition) =>
    definition.isDefinition && definitionWithinShape(definition, shape)
  );
}

function matchingReferences(
  documents: ScipDocument[],
  definition: ScipOccurrence | undefined,
  targetPath: string,
): ScipOccurrence[] {
  if (!definition) {
    return [];
  }
  return documents.flatMap((document) => {
    if (definition.symbolString.startsWith("local ") && portablePath(document.relativePath) !== targetPath) {
      return [];
    }
    return document.references.filter((reference) => reference.symbolString === definition.symbolString);
  });
}

function occurrenceAudit(
  name: string,
  textFiles: ReadonlyMap<string, string>,
): { count: number; files: string[] } {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`\\b${escaped}\\b`, "g");
  let count = 0;
  const files: string[] = [];
  for (const [path, content] of textFiles) {
    const occurrences = [...content.matchAll(pattern)].length;
    if (occurrences > 0) {
      count += occurrences;
      files.push(path);
    }
  }
  return { count, files: files.sort() };
}

function classify(input: {
  supported: boolean;
  scipStatus: "succeeded" | "failed";
  coverage: CoverageBundle;
  definitions: number;
  production: number;
  test: number;
  unknown: number;
  textOccurrences: number;
  declarations: number;
}): { classification: FindingClassification; explanation: string; blockers: string[]; contradictions: string[] } {
  const blockers: string[] = [];
  const contradictions: string[] = [];
  if (!input.supported) {
    return { classification: "unsupported", explanation: "The declaration shape is outside the approved milestone.", blockers: ["unsupported_entity_shape"], contradictions };
  }
  if (input.scipStatus === "failed") {
    return { classification: "failed", explanation: "Required SCIP analysis failed.", blockers: ["scip_failed"], contradictions };
  }
  if (input.coverage.status !== "complete_for_supported_scope") {
    return { classification: "inconclusive", explanation: "Required TypeScript or SCIP coverage is incomplete.", blockers: ["incomplete_coverage"], contradictions };
  }
  if (input.declarations !== 1) {
    contradictions.push("multiple_declarations_with_same_name");
    return { classification: "conflicting", explanation: "The symbol name does not identify exactly one declaration.", blockers, contradictions };
  }
  if (input.definitions !== 1) {
    blockers.push(input.definitions === 0 ? "exact_scip_definition_missing" : "ambiguous_scip_definition");
    return { classification: "inconclusive", explanation: "SCIP did not provide exactly one definition for the occurrence.", blockers, contradictions };
  }
  if (input.production > 0 || input.test > 0) {
    return { classification: "live_evidence_present", explanation: "SCIP found one or more exact references.", blockers: ["resolved_reference_present"], contradictions };
  }
  if (input.unknown > 0) {
    contradictions.push("reference_context_unknown");
    return { classification: "conflicting", explanation: "SCIP found references whose production/test context is unresolved.", blockers, contradictions };
  }
  if (input.textOccurrences !== 1) {
    contradictions.push("textual_occurrence_without_resolved_scip_reference");
    return { classification: "conflicting", explanation: "Repository text contains additional symbol occurrences not explained by SCIP.", blockers, contradictions };
  }
  return {
    classification: "candidate_dead",
    explanation: "One supported private top-level function has an exact SCIP definition, no references, one textual occurrence, and complete required coverage.",
    blockers,
    contradictions,
  };
}

export async function analyzeTypeScriptSnapshot(input: AnalysisInput): Promise<CanonicalAnalysisResult> {
  if (!/^[a-f0-9]{40}$/i.test(input.commitSha)) {
    throw new Error("Analysis requires an immutable 40-character commit SHA");
  }
  const root = resolve(input.repositoryPath);
  const configured = await loadConfiguredFiles(root);
  const allRepositoryFiles = await walkFiles(root);
  const failedFiles: CoverageBundle["failedFiles"] = configured.errors.map((reason) => ({ path: "tsconfig.json", reason }));
  const excludedFiles: CoverageBundle["excludedFiles"] = [];
  const sources: LoadedSource[] = [];
  const shapes: ShapeWithSource[] = [];
  let parseFailures = 0;

  const configuredPaths = new Set(configured.files.map((path) => portablePath(relative(root, path))));
  for (const absolutePath of allRepositoryFiles) {
    const path = portablePath(relative(root, absolutePath));
    if (path.endsWith(".ts") && !path.endsWith(".d.ts") && !configuredPaths.has(path)) {
      excludedFiles.push({ path, reason: "excluded_by_tsconfig" });
    }
  }

  for (const absolutePath of configured.files) {
    const path = portablePath(relative(root, absolutePath));
    if (!path.endsWith(".ts") || path.endsWith(".d.ts")) {
      excludedFiles.push({ path, reason: "unsupported_file_type" });
      continue;
    }
    const content = await readFile(absolutePath, "utf8");
    const generated = generatedSource(path, content);
    const file: LoadedSource = { path, content, hash: sha256(content), generated };
    if (generated) {
      excludedFiles.push({ path, reason: "generated_or_vendored" });
      continue;
    }
    sources.push(file);
    const inspected = inspectTypeScriptFunctions(content, path);
    if (inspected.status === "failed") {
      parseFailures += 1;
      failedFiles.push({ path, reason: inspected.failure ?? "tree-sitter parse failure" });
      continue;
    }
    shapes.push(...inspected.functions.map((shape) => ({ ...shape, file })));
  }

  const textFiles = new Map<string, string>();
  for (const absolutePath of allRepositoryFiles) {
    const path = portablePath(relative(root, absolutePath));
    if ((await stat(absolutePath)).size > MAX_TEXT_AUDIT_FILE_BYTES) {
      failedFiles.push({ path, reason: "text_audit_file_too_large" });
      continue;
    }
    const content = await readFile(absolutePath);
    if (content.includes(0)) {
      excludedFiles.push({ path, reason: "binary_file" });
      continue;
    }
    textFiles.set(path, content.toString("utf8"));
  }

  const scipDocuments = input.scip.documents ?? [];
  const scipPaths = new Set(scipDocuments.map((document) => portablePath(document.relativePath)));
  const missingScipFiles = input.scip.status === "succeeded"
    ? sources.map((source) => source.path).filter((path) => !scipPaths.has(path))
    : sources.map((source) => source.path);
  const coverageStatus: CoverageBundle["status"] = input.scip.status === "failed"
    ? "failed"
    : configured.errors.length > 0 || failedFiles.length > 0 || missingScipFiles.length > 0
      ? "partial"
      : "complete_for_supported_scope";
  const coverage: CoverageBundle = {
    status: coverageStatus,
    tsconfigFileCount: configured.files.length,
    parsedFileCount: sources.length - parseFailures,
    scipDocumentCount: scipDocuments.length,
    analyzedFiles: sources.map((source) => source.path).sort(),
    excludedFiles: excludedFiles.sort((left, right) => left.path.localeCompare(right.path)),
    missingScipFiles: missingScipFiles.sort(),
    failedFiles: failedFiles.sort((left, right) => left.path.localeCompare(right.path)),
    explanation: coverageStatus === "complete_for_supported_scope"
      ? "Every supported tsconfig .ts source parsed successfully and is present in the SCIP index."
      : "At least one required configuration, parse, analyzer, or SCIP-document condition is incomplete.",
  };

  const shapeNameCounts = new Map<string, number>();
  for (const shape of shapes) {
    shapeNameCounts.set(shape.name, (shapeNameCounts.get(shape.name) ?? 0) + 1);
  }
  const findings: FindingBundle[] = [];
  for (const shape of shapes.sort((left, right) =>
    left.file.path.localeCompare(right.file.path) || left.byteStart - right.byteStart
  )) {
    const supported = shape.shape === "function_declaration" && !shape.exported && !shape.file.generated;
    const definitions = matchingDefinitions(scipDocuments, shape);
    const definition = definitions.length === 1 ? definitions[0] : undefined;
    const references = matchingReferences(scipDocuments, definition, shape.file.path);
    const production = references.filter((reference) => reference.referenceContext === "production").length;
    const test = references.filter((reference) => reference.referenceContext === "test").length;
    const unknown = references.length - production - test;
    const text = occurrenceAudit(shape.name, textFiles);
    const decision = classify({
      supported,
      scipStatus: input.scip.status,
      coverage,
      definitions: definitions.length,
      production,
      test,
      unknown,
      textOccurrences: text.count,
      declarations: shapeNameCounts.get(shape.name) ?? 0,
    });
    const evidence: FindingEvidence = {
      treeSitter: { status: "succeeded", declarationCount: shapeNameCounts.get(shape.name) ?? 0 },
      scip: {
        status: input.scip.status,
        definitionMatches: definitions.length,
        ...(definition ? { symbol: definition.symbolString } : {}),
        productionReferences: production,
        testReferences: test,
        unknownReferences: unknown,
      },
      textualAudit: {
        status: "succeeded",
        occurrenceCount: text.count,
        checkedFiles: textFiles.size,
        occurrenceFiles: text.files,
      },
    };
    const occurrence = {
      filePath: shape.file.path,
      name: shape.name,
      kind: "function" as const,
      shape: shape.shape,
      exported: shape.exported,
      lineStart: shape.lineStart,
      columnStart: shape.columnStart,
      lineEnd: shape.lineEnd,
      columnEnd: shape.columnEnd,
      byteStart: shape.byteStart,
      byteEnd: shape.byteEnd,
      sourceSha256: shape.file.hash,
      declarationSha256: sha256(shape.file.content.slice(shape.byteStart, shape.byteEnd)),
    };
    const supportingEvidence = [
      "tree_sitter_declaration_identified",
      ...(definitions.length === 1 ? ["exact_scip_definition_matched"] : []),
      ...(references.length === 0 ? ["zero_resolved_scip_references"] : []),
      ...(text.count === 1 ? ["single_repository_textual_occurrence"] : []),
      ...(coverage.status === "complete_for_supported_scope" ? ["required_coverage_complete"] : []),
    ];
    const counterEvidence = [
      ...(production > 0 ? [`${production}_production_references`] : []),
      ...(test > 0 ? [`${test}_test_references`] : []),
      ...(unknown > 0 ? [`${unknown}_unknown_context_references`] : []),
      ...(text.count > 1 ? [`${text.count - 1}_additional_textual_occurrences`] : []),
    ];
    const evidenceMaterial = {
      schemaVersion: "1" as const,
      accountScopeId: input.accountScopeId,
      repository: input.repository,
      commitSha: input.commitSha.toLowerCase(),
      packageJsonSha256: sha256(configured.packageJson),
      packageLockSha256: sha256(configured.packageLock),
      tsconfigSha256: sha256(configured.tsconfig),
      occurrence,
      ...(definition ? { nativeScipIdentity: definition.symbolString } : {}),
      analyzers: [
        { name: "tree-sitter-typescript", version: TREE_SITTER_VERSION, configuration: { fileType: ".ts" } },
        { name: "scip-typescript", version: input.scip.version, configuration: input.scip.configuration, ...(input.scip.artifactSha256 ? { artifactSha256: input.scip.artifactSha256 } : {}) },
        { name: "repository-text-audit", version: "1", configuration: { exactIdentifier: true } },
      ],
      coverage,
      supportingEvidence,
      counterEvidence,
      blockers: decision.blockers,
      contradictions: decision.contradictions,
      evidence,
      classification: decision.classification,
      policyVersion: MILESTONE_POLICY_VERSION,
    };
    const evidenceDigest = digestCanonical(evidenceMaterial);
    const findingId = digestCanonical({
      namespace: "dcav2-finding-v1",
      repository: input.repository,
      commitSha: input.commitSha.toLowerCase(),
      occurrence,
      evidenceDigest,
    });
    findings.push({
      ...evidenceMaterial,
      findingId,
      evidenceDigest,
      explanation: decision.explanation,
    });
  }

  return {
    schemaVersion: "1",
    accountScopeId: input.accountScopeId,
    repository: input.repository,
    commitSha: input.commitSha.toLowerCase(),
    policyVersion: MILESTONE_POLICY_VERSION,
    coverage,
    analyzerRuns: [
      { analyzer: "tree-sitter-typescript", version: TREE_SITTER_VERSION, status: failedFiles.length === 0 ? "succeeded" : "failed", configuration: { fileType: ".ts" }, ...(failedFiles.length > 0 ? { failure: "one or more files failed parsing" } : {}) },
      { analyzer: "scip-typescript", version: input.scip.version, status: input.scip.status, configuration: input.scip.configuration, ...(input.scip.artifactSha256 ? { artifactSha256: input.scip.artifactSha256 } : {}), ...(input.scip.failure ? { failure: input.scip.failure } : {}) },
      { analyzer: "repository-text-audit", version: "1", status: "succeeded", configuration: { exactIdentifier: true } },
    ],
    findings,
  };
}
