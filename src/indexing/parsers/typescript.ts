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
  intraFileCalls: Array<{
    callerQualifiedName: string;
    calleeName: string;
    resolved: boolean;
  }>;
  parseStatus: "success" | "partial" | "failed";
  parseError?: string;
}

type SymbolResult = ParseResult["symbols"][number];
type IntraFileCall = ParseResult["intraFileCalls"][number];

interface CallerNode {
  node: SyntaxNode;
  qualifiedName: string;
  className?: string;
}

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

function callsWithinCaller(caller: CallerNode): string[] {
  const calls: string[] = [];
  const body = caller.node.childForFieldName("body");
  if (!body) {
    return calls;
  }

  const nestedCallableTypes = new Set([
    "function_declaration",
    "function_expression",
    "arrow_function",
    "method_definition",
  ]);
  const visit = (node: SyntaxNode): void => {
    if (node !== body && nestedCallableTypes.has(node.type)) {
      return;
    }
    if (node.type === "call_expression") {
      const callee = node.childForFieldName("function")?.text;
      if (callee) {
        calls.push(callee);
      }
    }
    node.namedChildren.forEach(visit);
  };
  visit(body);
  return calls;
}

function callIsResolved(calleeName: string, caller: CallerNode, symbols: SymbolResult[]): boolean {
  const callableSymbols = symbols.filter(
    (symbol) => symbol.kind === "function" || symbol.kind === "method",
  );
  if (calleeName.startsWith("this.") && caller.className) {
    const qualifiedName = `${caller.className}.${calleeName.slice("this.".length)}`;
    return callableSymbols.some((symbol) => symbol.qualifiedName === qualifiedName);
  }

  const exactQualifiedMatch = callableSymbols.some(
    (symbol) => symbol.qualifiedName === calleeName,
  );
  if (exactQualifiedMatch) {
    return true;
  }

  if (calleeName.includes(".")) {
    return false;
  }
  return callableSymbols.filter((symbol) => symbol.name === calleeName).length === 1;
}

function parseFile(fileContent: string, filePath: string): ParseResult {
  const parser = /\.(?:tsx|jsx)$/i.test(filePath) ? tsx : typescript;
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
  const exportStatements: SyntaxNode[] = [];
  const callers: CallerNode[] = [];

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
      if (declaration.type === "function_declaration") {
        callers.push({ node: declaration, qualifiedName: symbol.qualifiedName });
      }
      if (declaration.type === "class_declaration") {
        const methods = classMethods(declaration, symbol.name);
        symbols.push(...methods);
        const methodNodes = declaration.childForFieldName("body")?.namedChildren.filter(
          (method) => method.type === "method_definition",
        ) ?? [];
        for (const method of methodNodes) {
          const methodName = method.childForFieldName("name")?.text;
          if (methodName) {
            callers.push({
              node: method,
              qualifiedName: `${symbol.name}.${methodName}`,
              className: symbol.name,
            });
          }
        }
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

  const intraFileCalls: IntraFileCall[] = callers.flatMap((caller) =>
    callsWithinCaller(caller).map((calleeName) => ({
      callerQualifiedName: caller.qualifiedName,
      calleeName,
      resolved: callIsResolved(calleeName, caller, symbols),
    }))
  );

  return { symbols, intraFileCalls, parseStatus: "success" };
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
        intraFileCalls: [],
        parseStatus: "failed",
        parseError: error instanceof Error ? error.message : String(error),
      };
    }
  },
};

export default typescriptParser;
