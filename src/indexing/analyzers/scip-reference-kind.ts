import { readFile } from "node:fs/promises";
import { join } from "node:path";

import ts from "typescript";

import type {
  ScipDocument,
  ScipOccurrence,
  ScipReferenceContext,
  ScipReferenceKind,
} from "./scip-parse";

export function classifyScipReferenceContext(relativePath: string): ScipReferenceContext {
  const normalizedPath = relativePath.replaceAll("\\", "/").toLowerCase();
  const segments = normalizedPath.split("/");
  const fileName = segments.at(-1) ?? normalizedPath;
  const isTestDirectory = segments.some((segment) =>
    segment === "test" || segment === "tests" || segment === "__tests__"
  );
  const isTestFile = /(?:^|\.)(?:test|spec)\.[cm]?[jt]sx?$/.test(fileName);
  return isTestDirectory || isTestFile ? "test" : "production";
}

function innermostNodeAtRange(
  sourceFile: ts.SourceFile,
  start: number,
  end: number,
): ts.Node {
  function visit(node: ts.Node): ts.Node {
    for (const child of node.getChildren(sourceFile)) {
      if (child.getStart(sourceFile) <= start && end <= child.getEnd()) {
        return visit(child);
      }
    }
    return node;
  }

  return visit(sourceFile);
}

export function classifyScipReferenceKind(
  sourceFile: ts.SourceFile,
  occurrence: ScipOccurrence,
): ScipReferenceKind {
  if (occurrence.isDefinition) {
    return "definition";
  }

  const start = sourceFile.getPositionOfLineAndCharacter(
    occurrence.rangeStart[0],
    occurrence.rangeStart[1],
  );
  const end = sourceFile.getPositionOfLineAndCharacter(
    occurrence.rangeEnd[0],
    occurrence.rangeEnd[1],
  );
  let node: ts.Node | undefined = innermostNodeAtRange(sourceFile, start, end);

  while (node) {
    if (ts.isImportDeclaration(node) || ts.isImportEqualsDeclaration(node)) {
      return "import";
    }
    if (ts.isExportDeclaration(node) || ts.isExportAssignment(node)) {
      return "reexport";
    }
    if (ts.isCallExpression(node)) {
      const expressionStart = node.expression.getStart(sourceFile);
      if (expressionStart <= start && end <= node.expression.getEnd()) {
        return "call";
      }
    }
    if (ts.isNewExpression(node)) {
      const expressionStart = node.expression.getStart(sourceFile);
      if (expressionStart <= start && end <= node.expression.getEnd()) {
        return "construct";
      }
    }
    node = node.parent;
  }

  return "read";
}

export async function classifyScipReferenceKinds(
  projectRootPath: string,
  documents: ScipDocument[],
): Promise<ScipDocument[]> {
  return Promise.all(documents.map(async (document): Promise<ScipDocument> => {
    try {
      const sourceText = await readFile(join(projectRootPath, document.relativePath), "utf8");
      const sourceFile = ts.createSourceFile(
        document.relativePath,
        sourceText,
        ts.ScriptTarget.Latest,
        true,
      );
      return {
        ...document,
        references: document.references.map((reference) => ({
          ...reference,
          referenceKind: classifyScipReferenceKind(sourceFile, reference),
          referenceContext: classifyScipReferenceContext(document.relativePath),
        })),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(
        `Unable to classify SCIP reference kinds for ${document.relativePath}: ${message}`,
      );
      return document;
    }
  }));
}
