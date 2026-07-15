import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, extname, relative, resolve, sep } from "node:path";

import ts from "typescript";

interface TextEdit {
  start: number;
  end: number;
  replacement: string;
}

export interface BarrelCleanupResult {
  changedFiles: string[];
  removedReexports: number;
  removedImports: number;
}

const IGNORED_DIRECTORIES = new Set([".git", "dist", "build", "node_modules"]);

async function walkTypeScriptFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRECTORIES.has(entry.name)) {
        files.push(...await walkTypeScriptFiles(resolve(directory, entry.name)));
      }
      continue;
    }
    if (entry.isFile() && [".ts", ".tsx"].includes(extname(entry.name).toLowerCase())) {
      files.push(resolve(directory, entry.name));
    }
  }
  return files;
}

function sourceFile(path: string, content: string): ts.SourceFile {
  const kind = path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  return ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true, kind);
}

function moduleCandidates(containingFile: string, specifier: string): string[] {
  const base = resolve(dirname(containingFile), specifier);
  return [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    resolve(base, "index.ts"),
    resolve(base, "index.tsx"),
  ];
}

function resolveModule(
  containingFile: string,
  specifier: string,
  knownFiles: Set<string>,
): string | undefined {
  if (!specifier.startsWith(".")) {
    return undefined;
  }
  return moduleCandidates(containingFile, specifier).find((candidate) => knownFiles.has(candidate));
}

function statementRemovalEnd(content: string, end: number): number {
  if (content.startsWith("\r\n", end)) {
    return end + 2;
  }
  if (content[end] === "\n" || content[end] === "\r") {
    return end + 1;
  }
  return end;
}

function applyEdits(content: string, edits: TextEdit[]): string {
  return [...edits]
    .sort((left, right) => right.start - left.start)
    .reduce(
      (current, edit) => current.slice(0, edit.start) + edit.replacement + current.slice(edit.end),
      content,
    );
}

function printed(node: ts.Node, file: ts.SourceFile): string {
  return ts.createPrinter({ newLine: ts.NewLineKind.LineFeed }).printNode(
    ts.EmitHint.Unspecified,
    node,
    file,
  );
}

function importedName(element: ts.ImportSpecifier): string {
  return (element.propertyName ?? element.name).text;
}

function exportedSourceName(element: ts.ExportSpecifier): string {
  return (element.propertyName ?? element.name).text;
}

function identifierIsUsedOutside(
  file: ts.SourceFile,
  localName: string,
  excluded: ts.Node,
): boolean {
  let used = false;
  const visit = (node: ts.Node): void => {
    if (used || node === excluded) {
      return;
    }
    if (ts.isIdentifier(node) && node.text === localName) {
      used = true;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return used;
}

function repositoryRelative(repositoryPath: string, path: string): string {
  return relative(repositoryPath, path).split(sep).join("/");
}

export async function cleanupBarrelReexports(
  repositoryPath: string,
  targetFilePath: string,
  symbolName: string,
): Promise<BarrelCleanupResult> {
  const repositoryRoot = resolve(repositoryPath);
  const targetFile = resolve(repositoryRoot, targetFilePath);
  const files = await walkTypeScriptFiles(repositoryRoot);
  const knownFiles = new Set(files);
  if (!knownFiles.has(targetFile)) {
    throw new Error(`Target TypeScript file not found: ${targetFilePath}`);
  }

  const contents = new Map<string, string>();
  for (const file of files) {
    contents.set(file, await readFile(file, "utf8"));
  }
  const targetContent = contents.get(targetFile) ?? "";
  if (sourceFile(targetFile, targetContent).statements.length !== 0) {
    throw new Error("export * cleanup requires the deleted symbol to leave an empty module");
  }

  const affectedModules = new Set([targetFile]);
  const changedFiles = new Set([targetFile]);
  let removedReexports = 0;
  let discovered = true;
  while (discovered) {
    discovered = false;
    for (const file of files) {
      const content = contents.get(file) ?? "";
      const parsed = sourceFile(file, content);
      const edits: TextEdit[] = [];
      let exposesTarget = false;
      for (const statement of parsed.statements) {
        if (!ts.isExportDeclaration(statement)) {
          continue;
        }
        const moduleSpecifier = statement.moduleSpecifier;
        if (!moduleSpecifier || !ts.isStringLiteral(moduleSpecifier)) {
          continue;
        }
        const resolvedModule = resolveModule(file, moduleSpecifier.text, knownFiles);
        if (!resolvedModule || !affectedModules.has(resolvedModule)) {
          continue;
        }
        if (!statement.exportClause) {
          edits.push({
            start: statement.getStart(parsed),
            end: statementRemovalEnd(content, statement.end),
            replacement: "",
          });
          removedReexports += 1;
          exposesTarget = true;
          continue;
        }
        if (!ts.isNamedExports(statement.exportClause)) {
          throw new Error(
            `Namespace re-export is outside the narrow cleanup scope: ${repositoryRelative(repositoryRoot, file)}`,
          );
        }
        const remaining = statement.exportClause.elements.filter(
          (element) => exportedSourceName(element) !== symbolName,
        );
        if (remaining.length === statement.exportClause.elements.length) {
          continue;
        }
        exposesTarget = true;
        removedReexports += statement.exportClause.elements.length - remaining.length;
        if (remaining.length === 0) {
          edits.push({
            start: statement.getStart(parsed),
            end: statementRemovalEnd(content, statement.end),
            replacement: "",
          });
        } else {
          const clause = ts.factory.updateNamedExports(statement.exportClause, remaining);
          const updated = ts.factory.updateExportDeclaration(
            statement,
            statement.modifiers,
            statement.isTypeOnly,
            clause,
            statement.moduleSpecifier,
            statement.attributes,
          );
          edits.push({
            start: statement.getStart(parsed),
            end: statement.end,
            replacement: printed(updated, parsed),
          });
        }
      }
      if (edits.length > 0) {
        const updatedContent = applyEdits(content, edits);
        contents.set(file, updatedContent);
        await writeFile(file, updatedContent);
        changedFiles.add(file);
      }
      if (exposesTarget && !affectedModules.has(file)) {
        affectedModules.add(file);
        discovered = true;
      }
    }
  }

  let removedImports = 0;
  for (const file of files) {
    const content = contents.get(file) ?? "";
    const parsed = sourceFile(file, content);
    const edits: TextEdit[] = [];
    for (const statement of parsed.statements) {
      if (
        !ts.isImportDeclaration(statement) ||
        !ts.isStringLiteral(statement.moduleSpecifier) ||
        !statement.importClause ||
        !statement.importClause.namedBindings ||
        !ts.isNamedImports(statement.importClause.namedBindings)
      ) {
        continue;
      }
      const resolvedModule = resolveModule(file, statement.moduleSpecifier.text, knownFiles);
      if (!resolvedModule || !affectedModules.has(resolvedModule)) {
        continue;
      }
      const removed = statement.importClause.namedBindings.elements.filter(
        (element) => importedName(element) === symbolName,
      );
      if (removed.length === 0) {
        continue;
      }
      for (const element of removed) {
        if (identifierIsUsedOutside(parsed, element.name.text, statement)) {
          throw new Error(
            `Cannot remove used import ${element.name.text} from ${repositoryRelative(repositoryRoot, file)}`,
          );
        }
      }
      const remaining = statement.importClause.namedBindings.elements.filter(
        (element) => importedName(element) !== symbolName,
      );
      removedImports += removed.length;
      if (remaining.length === 0 && !statement.importClause.name) {
        edits.push({
          start: statement.getStart(parsed),
          end: statementRemovalEnd(content, statement.end),
          replacement: "",
        });
      } else {
        const namedBindings = remaining.length > 0
          ? ts.factory.updateNamedImports(statement.importClause.namedBindings, remaining)
          : undefined;
        const clause = ts.factory.updateImportClause(
          statement.importClause,
          statement.importClause.isTypeOnly,
          statement.importClause.name,
          namedBindings,
        );
        const updated = ts.factory.updateImportDeclaration(
          statement,
          statement.modifiers,
          clause,
          statement.moduleSpecifier,
          statement.attributes,
        );
        edits.push({
          start: statement.getStart(parsed),
          end: statement.end,
          replacement: printed(updated, parsed),
        });
      }
    }
    if (edits.length > 0) {
      const updatedContent = applyEdits(content, edits);
      contents.set(file, updatedContent);
      await writeFile(file, updatedContent);
      changedFiles.add(file);
    }
  }

  if (removedReexports === 0) {
    throw new Error("No barrel re-export was found for the deleted symbol module");
  }
  return {
    changedFiles: [...changedFiles]
      .map((file) => repositoryRelative(repositoryRoot, file))
      .sort(),
    removedReexports,
    removedImports,
  };
}
