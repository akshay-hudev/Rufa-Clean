import Parser, { SyntaxNode } from "tree-sitter";
import JavaScript from "tree-sitter-javascript";
import Python from "tree-sitter-python";
import TypeScript from "tree-sitter-typescript";

type SymbolKind =
  | "function"
  | "method"
  | "class"
  | "variable"
  | "interface"
  | "type"
  | "enum"
  | "import"
  | "attribute"
  | "export";

export interface EnumeratedSymbol {
  kind: SymbolKind;
  name: string;
  qualifiedName: string;
  lineStart: number;
  lineEnd: number;
  columnStart: number;
  columnEnd: number;
  isExported: boolean;
}

export interface SymbolEnumerationResult {
  symbols: EnumeratedSymbol[];
  status: "success" | "failed";
  error?: string;
}

const javascriptParser = new Parser();
javascriptParser.setLanguage(JavaScript);

const typescriptParser = new Parser();
typescriptParser.setLanguage(TypeScript.typescript);

const tsxParser = new Parser();
tsxParser.setLanguage(TypeScript.tsx);

const pythonParser = new Parser();
pythonParser.setLanguage(Python);

function position(
  node: SyntaxNode,
): Pick<EnumeratedSymbol, "lineStart" | "lineEnd" | "columnStart" | "columnEnd"> {
  return {
    lineStart: node.startPosition.row + 1,
    lineEnd: node.endPosition.row + 1,
    columnStart: node.startPosition.column + 1,
    columnEnd: node.endPosition.column + 1,
  };
}

function symbol(
  node: SyntaxNode,
  kind: SymbolKind,
  name: string,
  qualifiedName: string,
  isExported: boolean,
): EnumeratedSymbol {
  return { kind, name, qualifiedName, ...position(node), isExported };
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

function bindingIdentifiers(node: SyntaxNode | null): SyntaxNode[] {
  if (!node) {
    return [];
  }
  if (node.type === "identifier" || node.type.includes("shorthand_property_identifier")) {
    return [node];
  }
  return node.namedChildren.flatMap(bindingIdentifiers);
}

function classMethods(classNode: SyntaxNode, className: string): EnumeratedSymbol[] {
  const body = classNode.childForFieldName("body");
  if (!body) {
    return [];
  }

  return body.namedChildren.flatMap((node): EnumeratedSymbol[] => {
    if (node.type !== "method_definition" && node.type !== "method_signature") {
      return [];
    }
    const name = node.childForFieldName("name")?.text;
    return name ? [symbol(node, "method", name, `${className}.${name}`, false)] : [];
  });
}

function declarationSymbols(node: SyntaxNode, isExported: boolean): EnumeratedSymbol[] {
  if (node.type === "function_declaration" || node.type === "generator_function_declaration") {
    const name = node.childForFieldName("name")?.text;
    return name ? [symbol(node, "function", name, name, isExported)] : [];
  }

  if (node.type === "class_declaration" || node.type === "abstract_class_declaration") {
    const name = node.childForFieldName("name")?.text;
    return name
      ? [symbol(node, "class", name, name, isExported), ...classMethods(node, name)]
      : [];
  }

  if (node.type === "lexical_declaration" || node.type === "variable_declaration") {
    return node.namedChildren.flatMap((declarator): EnumeratedSymbol[] => {
      if (declarator.type !== "variable_declarator") {
        return [];
      }
      const value = declarator.childForFieldName("value");
      const kind: SymbolKind = value?.type === "arrow_function" || value?.type === "function_expression"
        ? "function"
        : "variable";
      return bindingIdentifiers(declarator.childForFieldName("name")).map((identifier) =>
        symbol(declarator, kind, identifier.text, identifier.text, isExported)
      );
    });
  }

  const namedDeclarationKinds: Record<string, SymbolKind> = {
    interface_declaration: "interface",
    type_alias_declaration: "type",
    enum_declaration: "enum",
  };
  const kind = namedDeclarationKinds[node.type];
  const name = node.childForFieldName("name")?.text;
  return kind && name ? [symbol(node, kind, name, name, isExported)] : [];
}

function markExported(
  symbols: EnumeratedSymbol[],
  localName: string,
  exportedName: string,
  node: SyntaxNode,
): void {
  const existing = symbols.find((candidate) => candidate.name === localName);
  if (existing) {
    existing.isExported = true;
  }
  if (!existing || exportedName !== localName) {
    symbols.push(symbol(node, "export", exportedName, exportedName, true));
  }
}

function processEsModuleExports(statement: SyntaxNode, symbols: EnumeratedSymbol[]): void {
  for (const specifier of descendantsOfType(statement, "export_specifier")) {
    const localName = specifier.childForFieldName("name")?.text;
    if (localName) {
      markExported(
        symbols,
        localName,
        specifier.childForFieldName("alias")?.text ?? localName,
        specifier,
      );
    }
  }

  const value = statement.childForFieldName("value");
  if (value && statement.childForFieldName("declaration") === null) {
    markExported(symbols, value.text, "default", value);
  }
}

function processCommonJsObject(
  objectNode: SyntaxNode,
  symbols: EnumeratedSymbol[],
): void {
  for (const property of objectNode.namedChildren) {
    if (property.type === "shorthand_property_identifier") {
      markExported(symbols, property.text, property.text, property);
      continue;
    }
    if (property.type === "pair") {
      const key = property.childForFieldName("key")?.text.replace(/^['"]|['"]$/g, "");
      const value = property.childForFieldName("value");
      if (key && value?.type === "identifier") {
        markExported(symbols, value.text, key, property);
      }
      continue;
    }
    if (property.type === "method_definition") {
      const name = property.childForFieldName("name")?.text;
      if (name) {
        symbols.push(symbol(property, "function", name, name, true));
      }
    }
  }
}

function processCommonJsExports(rootNode: SyntaxNode, symbols: EnumeratedSymbol[]): void {
  for (const assignment of descendantsOfType(rootNode, "assignment_expression")) {
    const left = assignment.childForFieldName("left")?.text;
    const right = assignment.childForFieldName("right");
    if (!left || !right) {
      continue;
    }

    if (left === "module.exports") {
      if (right.type === "object") {
        processCommonJsObject(right, symbols);
      } else if (right.type === "identifier") {
        markExported(symbols, right.text, right.text, assignment);
      }
      continue;
    }

    const match = /^(?:module\.)?exports\.([A-Za-z_$][\w$]*)$/.exec(left);
    if (match?.[1]) {
      const exportedName = match[1];
      const localName = right.type === "identifier" ? right.text : exportedName;
      markExported(symbols, localName, exportedName, assignment);
    }
  }
}

function enumerateJavaScript(fileContent: string, filePath: string): SymbolEnumerationResult {
  const parser = /\.tsx$/i.test(filePath)
    ? tsxParser
    : /\.(?:ts|mts|cts)$/i.test(filePath)
      ? typescriptParser
      : javascriptParser;
  // node-tree-sitter 0.21's default 32 KiB UTF-16 input buffer can throw
  // `Invalid argument` instead of continuing with another chunk. Size the
  // buffer for the complete source so large, valid files remain enumerable.
  const tree = parser.parse(fileContent, undefined, { bufferSize: fileContent.length + 1 });
  if (tree.rootNode.hasError) {
    return {
      symbols: [],
      status: "failed",
      error: `Syntax error while enumerating symbols in ${filePath}`,
    };
  }

  const symbols: EnumeratedSymbol[] = [];
  for (const node of tree.rootNode.namedChildren) {
    const isExportStatement = node.type === "export_statement";
    const declaration = isExportStatement ? node.childForFieldName("declaration") : node;
    if (declaration) {
      symbols.push(...declarationSymbols(declaration, isExportStatement));
    }
    if (isExportStatement) {
      processEsModuleExports(node, symbols);
    }
  }
  processCommonJsExports(tree.rootNode, symbols);

  return { symbols, status: "success" };
}

interface PythonScope {
  names: string[];
  className?: string;
  isModule: boolean;
}

function unwrapPythonDefinition(node: SyntaxNode): SyntaxNode | undefined {
  if (node.type === "function_definition" || node.type === "class_definition") {
    return node;
  }
  if (node.type === "decorated_definition") {
    return node.childForFieldName("definition") ?? undefined;
  }
  return undefined;
}

function pythonTargetBindings(node: SyntaxNode | null): Array<{ name: string; kind: SymbolKind }> {
  if (!node) {
    return [];
  }
  if (node.type === "identifier") {
    return [{ name: node.text, kind: "variable" }];
  }
  if (node.type === "attribute") {
    const name = node.childForFieldName("attribute")?.text;
    return name ? [{ name, kind: "attribute" }] : [];
  }
  if (node.type === "subscript") {
    return [];
  }
  return node.namedChildren.flatMap(pythonTargetBindings);
}

function pythonImportNames(node: SyntaxNode): Array<{ name: string; node: SyntaxNode }> {
  const moduleNode = node.childForFieldName("module_name");
  return node.namedChildren.flatMap((child): Array<{ name: string; node: SyntaxNode }> => {
    if (moduleNode && child.id === moduleNode.id) {
      return [];
    }
    if (child.type === "aliased_import") {
      const name = child.childForFieldName("alias")?.text;
      return name ? [{ name, node: child }] : [];
    }
    if (child.type === "dotted_name") {
      const name = child.text.split(".")[0];
      return name ? [{ name, node: child }] : [];
    }
    return [];
  });
}

function pythonParameterBindings(node: SyntaxNode | null): SyntaxNode[] {
  if (!node) {
    return [];
  }
  if (node.type === "identifier") {
    return [node];
  }
  if (node.type === "default_parameter" || node.type === "typed_default_parameter") {
    return bindingIdentifiers(node.childForFieldName("name"));
  }
  if (node.type === "typed_parameter") {
    const typeNode = node.childForFieldName("type");
    return node.namedChildren
      .filter((child) => child.id !== typeNode?.id)
      .flatMap(pythonParameterBindings);
  }
  if (
    node.type === "parameters" ||
    node.type === "lambda_parameters" ||
    node.type === "tuple_pattern" ||
    node.type === "list_splat_pattern" ||
    node.type === "dictionary_splat_pattern"
  ) {
    return node.namedChildren.flatMap(pythonParameterBindings);
  }
  return [];
}

function visitPython(
  node: SyntaxNode,
  scope: PythonScope,
  symbols: EnumeratedSymbol[],
): void {
  if (node.type === "lambda") {
    const lambdaName = [...scope.names, `<lambda@${node.startPosition.row + 1}>`].join(".");
    for (const parameter of pythonParameterBindings(node.childForFieldName("parameters"))) {
      symbols.push(symbol(
        parameter,
        "variable",
        parameter.text,
        `${lambdaName}.${parameter.text}`,
        false,
      ));
    }
  }

  const definition = unwrapPythonDefinition(node);
  if (definition) {
    const name = definition.childForFieldName("name")?.text;
    if (!name) {
      return;
    }
    const qualifiedName = [...scope.names, name].join(".");
    const isClass = definition.type === "class_definition";
    const kind: SymbolKind = isClass ? "class" : scope.className ? "method" : "function";
    symbols.push(symbol(definition, kind, name, qualifiedName, scope.isModule && !name.startsWith("_")));

    if (!isClass) {
      for (const parameter of pythonParameterBindings(
        definition.childForFieldName("parameters"),
      )) {
        symbols.push(symbol(
          parameter,
          "variable",
          parameter.text,
          `${qualifiedName}.${parameter.text}`,
          false,
        ));
      }
    }

    const body = definition.childForFieldName("body");
    if (body) {
      const nestedScope: PythonScope = isClass
        ? { names: [...scope.names, name], className: name, isModule: false }
        : { names: [...scope.names, name], isModule: false };
      body.namedChildren.forEach((child) => visitPython(child, nestedScope, symbols));
    }
    return;
  }

  if (node.type === "assignment" || node.type === "augmented_assignment") {
    for (const binding of pythonTargetBindings(node.childForFieldName("left"))) {
      symbols.push(symbol(
        node,
        binding.kind,
        binding.name,
        [...scope.names, binding.name].join("."),
        scope.isModule && !binding.name.startsWith("_"),
      ));
    }
  }

  if (node.type === "for_statement" || node.type === "for_in_clause") {
    for (const binding of pythonTargetBindings(node.childForFieldName("left"))) {
      symbols.push(symbol(
        node,
        binding.kind,
        binding.name,
        [...scope.names, binding.name].join("."),
        false,
      ));
    }
  }

  if (node.type === "import_statement" || node.type === "import_from_statement") {
    for (const imported of pythonImportNames(node)) {
      symbols.push(symbol(
        imported.node,
        "import",
        imported.name,
        [...scope.names, imported.name].join("."),
        false,
      ));
    }
  }

  node.namedChildren.forEach((child) => visitPython(child, scope, symbols));
}

function enumeratePython(fileContent: string, filePath: string): SymbolEnumerationResult {
  const tree = pythonParser.parse(fileContent, undefined, {
    bufferSize: fileContent.length + 1,
  });
  if (tree.rootNode.hasError) {
    return {
      symbols: [],
      status: "failed",
      error: `Syntax error while enumerating symbols in ${filePath}`,
    };
  }

  const symbols: EnumeratedSymbol[] = [];
  tree.rootNode.namedChildren.forEach((node) =>
    visitPython(node, { names: [], isModule: true }, symbols)
  );
  return { symbols, status: "success" };
}

export function symbolLanguage(filePath: string): "typescript" | "javascript" | "python" | undefined {
  const normalizedPath = filePath.replaceAll("\\", "/").toLowerCase();
  const segments = normalizedPath.split("/");
  if (segments.some((segment) =>
    segment === "node_modules" ||
    segment === "dist" ||
    segment === "build" ||
    segment === "__pycache__" ||
    segment === "venv" ||
    segment === ".venv" ||
    segment === "site-packages"
  )) {
    return undefined;
  }
  if (normalizedPath.endsWith(".min.js")) {
    return undefined;
  }
  if (/\.py$/i.test(normalizedPath)) {
    return "python";
  }
  if (/\.(?:ts|tsx|mts|cts)$/i.test(normalizedPath)) {
    return "typescript";
  }
  return /\.(?:js|jsx|mjs|cjs)$/i.test(normalizedPath) ? "javascript" : undefined;
}

export function enumerateSymbols(fileContent: string, filePath: string): SymbolEnumerationResult {
  try {
    const language = symbolLanguage(filePath);
    if (!language) {
      return {
        symbols: [],
        status: "failed",
        error: `Unsupported file for symbol enumeration: ${filePath}`,
      };
    }
    return language === "python"
      ? enumeratePython(fileContent, filePath)
      : enumerateJavaScript(fileContent, filePath);
  } catch (error) {
    return {
      symbols: [],
      status: "failed",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
