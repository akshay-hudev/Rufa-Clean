import Parser, { SyntaxNode } from "tree-sitter";
import TypeScript from "tree-sitter-typescript";

export interface LanguageParser {
  canParse(filePath: string): boolean;
  parse(fileContent: string, filePath: string): ParseResult;
}

export interface ParseResult {
  symbols: Array<{
    kind: "function" | "method" | "class" | "module" | "export";
    name: string;
    qualifiedName: string;
    lineStart: number;
    lineEnd: number;
    isExported: boolean;
  }>;
  parseStatus: "success" | "partial" | "failed";
  parseError?: string;
}

type SymbolResult = ParseResult["symbols"][number];

const typescript = new Parser();
typescript.setLanguage(TypeScript.typescript);

const tsx = new Parser();
tsx.setLanguage(TypeScript.tsx);

function position(node: SyntaxNode): Pick<SymbolResult, "lineStart" | "lineEnd"> {
  return {
    lineStart: node.startPosition.row + 1,
    lineEnd: node.endPosition.row + 1,
  };
}

function declarationSymbol(node: SyntaxNode, isExported: boolean): SymbolResult | undefined {
  const name = node.childForFieldName("name")?.text;
  if (!name) {
    return undefined;
  }

  return {
    kind: node.type === "class_declaration" ? "class" : "function",
    name,
    qualifiedName: name,
    ...position(node),
    isExported,
  };
}

function classMethods(classNode: SyntaxNode, className: string): SymbolResult[] {
  const body = classNode.childForFieldName("body");
  if (!body) {
    return [];
  }

  return body.namedChildren
    .filter((node) => node.type === "method_definition")
    .flatMap((node): SymbolResult[] => {
      const name = node.childForFieldName("name")?.text;
      if (!name) {
        return [];
      }
      return [{
        kind: "method",
        name,
        qualifiedName: `${className}.${name}`,
        ...position(node),
        isExported: false,
      }];
    });
}

function descendantsOfType(node: SyntaxNode, type: string): SyntaxNode[] {
  const matches: SyntaxNode[] = [];
  const visit = (current: SyntaxNode): void => {
    if (current.type === type) {
      matches.push(current);
    }
    current.namedChildren.forEach(visit);
  };
  visit(node);
  return matches;
}

function parseFile(fileContent: string, filePath: string): ParseResult {
  const parser = /\.(?:tsx|jsx)$/i.test(filePath) ? tsx : typescript;
  const tree = parser.parse(fileContent);

  if (tree.rootNode.hasError) {
    return {
      symbols: [],
      parseStatus: "failed",
      parseError: `Syntax error while parsing ${filePath}`,
    };
  }

  const symbols: SymbolResult[] = [];
  const exportStatements: SyntaxNode[] = [];

  for (const node of tree.rootNode.namedChildren) {
    const isExportStatement = node.type === "export_statement";
    const declaration = isExportStatement ? node.childForFieldName("declaration") : node;

    if (isExportStatement) {
      exportStatements.push(node);
    }
    if (declaration?.type !== "function_declaration" && declaration?.type !== "class_declaration") {
      continue;
    }

    const symbol = declarationSymbol(declaration, isExportStatement);
    if (symbol) {
      symbols.push(symbol);
      if (declaration.type === "class_declaration") {
        symbols.push(...classMethods(declaration, symbol.name));
      }
    } else if (isExportStatement) {
      symbols.push({
        kind: "export",
        name: "default",
        qualifiedName: "default",
        ...position(node),
        isExported: true,
      });
    }
  }

  for (const statement of exportStatements) {
    const referencedNames = descendantsOfType(statement, "export_specifier")
      .map((specifier) => specifier.childForFieldName("name")?.text)
      .filter((name): name is string => name !== undefined);
    const exportedValue = statement.childForFieldName("value")?.text;
    if (exportedValue) {
      referencedNames.push(exportedValue);
    }

    for (const referencedName of referencedNames) {
      const existing = symbols.find((symbol) => symbol.name === referencedName);
      if (existing) {
        existing.isExported = true;
        continue;
      }

      const specifier = descendantsOfType(statement, "export_specifier").find(
        (candidate) => candidate.childForFieldName("name")?.text === referencedName,
      );
      const exportedName = specifier?.childForFieldName("alias")?.text ?? referencedName;
      symbols.push({
        kind: "export",
        name: exportedName,
        qualifiedName: exportedName,
        ...position(specifier ?? statement),
        isExported: true,
      });
    }
  }

  return { symbols, parseStatus: "success" };
}

export const typescriptParser: LanguageParser = {
  canParse(filePath: string): boolean {
    const normalizedPath = filePath.replaceAll("\\", "/");
    const segments = normalizedPath.toLowerCase().split("/");
    const excludedDirectory = segments.some((segment) =>
      segment === "node_modules" || segment === "dist" || segment === "build"
    );

    return !excludedDirectory &&
      !normalizedPath.toLowerCase().endsWith(".min.js") &&
      /\.(?:ts|tsx|js|jsx)$/i.test(normalizedPath);
  },

  parse(fileContent: string, filePath: string): ParseResult {
    try {
      return parseFile(fileContent, filePath);
    } catch (error) {
      return {
        symbols: [],
        parseStatus: "failed",
        parseError: error instanceof Error ? error.message : String(error),
      };
    }
  },
};

export default typescriptParser;
