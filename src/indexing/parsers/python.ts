import Parser, { SyntaxNode } from "tree-sitter";
import Python from "tree-sitter-python";

import type { LanguageParser, ParseResult } from "./typescript";

type SymbolResult = ParseResult["symbols"][number];

const parser = new Parser();
parser.setLanguage(Python);

function position(node: SyntaxNode): Pick<SymbolResult, "lineStart" | "lineEnd"> {
  return {
    lineStart: node.startPosition.row + 1,
    lineEnd: node.endPosition.row + 1,
  };
}

function unwrapDefinition(node: SyntaxNode): SyntaxNode | undefined {
  if (node.type === "function_definition" || node.type === "class_definition") {
    return node;
  }
  if (node.type === "decorated_definition") {
    return node.childForFieldName("definition") ?? undefined;
  }
  return undefined;
}

function methodsFromClass(classNode: SyntaxNode, className: string): SymbolResult[] {
  const body = classNode.childForFieldName("body");
  if (!body) {
    return [];
  }

  return body.namedChildren.flatMap((child): SymbolResult[] => {
    const definition = unwrapDefinition(child);
    if (definition?.type !== "function_definition") {
      return [];
    }
    const name = definition.childForFieldName("name")?.text;
    if (!name) {
      return [];
    }

    return [{
      kind: "method",
      name,
      qualifiedName: `${className}.${name}`,
      ...position(definition),
      isExported: false,
    }];
  });
}

function parseFile(fileContent: string, filePath: string): ParseResult {
  const tree = parser.parse(fileContent);
  if (tree.rootNode.hasError) {
    return {
      symbols: [],
      intraFileCalls: [],
      parseStatus: "failed",
      parseError: `Syntax error while parsing ${filePath}`,
    };
  }

  const symbols: SymbolResult[] = [];
  for (const child of tree.rootNode.namedChildren) {
    const definition = unwrapDefinition(child);
    if (!definition) {
      continue;
    }
    const name = definition.childForFieldName("name")?.text;
    if (!name) {
      continue;
    }

    // Python has no explicit export keyword. As a convention-based approximation,
    // public names defined at module scope are treated as exported.
    const isExported = !name.startsWith("_");
    if (definition.type === "function_definition") {
      symbols.push({
        kind: "function",
        name,
        qualifiedName: name,
        ...position(definition),
        isExported,
      });
      continue;
    }

    symbols.push({
      kind: "class",
      name,
      qualifiedName: name,
      ...position(definition),
      isExported,
    });
    symbols.push(...methodsFromClass(definition, name));
  }

  return {
    symbols,
    intraFileCalls: [],
    parseStatus: "success",
  };
}

export const pythonParser: LanguageParser = {
  canParse(filePath: string): boolean {
    const normalizedPath = filePath.replaceAll("\\", "/").toLowerCase();
    const segments = normalizedPath.split("/");
    const excludedDirectory = segments.some((segment) =>
      segment === "__pycache__" ||
      segment === "pycache" ||
      segment === "venv" ||
      segment === ".venv" ||
      segment === "site-packages"
    );

    return !excludedDirectory && normalizedPath.endsWith(".py");
  },

  parse(fileContent: string, filePath: string): ParseResult {
    try {
      return parseFile(fileContent, filePath);
    } catch (error) {
      return {
        symbols: [],
        intraFileCalls: [],
        parseStatus: "failed",
        parseError: error instanceof Error ? error.message : String(error),
      };
    }
  },
};

export default pythonParser;
