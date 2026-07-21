import Parser, { SyntaxNode } from "tree-sitter";
import TypeScript from "tree-sitter-typescript";

export interface TypeScriptFunctionShape {
  name: string;
  shape: "function_declaration" | "arrow_function" | "nested_function";
  exported: boolean;
  lineStart: number;
  columnStart: number;
  lineEnd: number;
  columnEnd: number;
  byteStart: number;
  byteEnd: number;
  nameLine: number;
  nameColumnStart: number;
  nameColumnEnd: number;
}

export interface TypeScriptShapeResult {
  status: "succeeded" | "failed";
  functions: TypeScriptFunctionShape[];
  failure?: string;
}

const parser = new Parser();
parser.setLanguage(TypeScript.typescript);

function isTopLevel(node: SyntaxNode): boolean {
  return node.parent?.type === "program" ||
    (node.parent?.type === "export_statement" && node.parent.parent?.type === "program");
}

function isExported(node: SyntaxNode): boolean {
  let current = node.parent;
  while (current && current.type !== "program") {
    if (current.type === "export_statement") {
      return true;
    }
    current = current.parent;
  }
  return false;
}

function occurrence(
  node: SyntaxNode,
  nameNode: SyntaxNode,
  name: string,
  shape: TypeScriptFunctionShape["shape"],
  exported: boolean,
): TypeScriptFunctionShape {
  return {
    name,
    shape,
    exported,
    lineStart: node.startPosition.row + 1,
    columnStart: node.startPosition.column + 1,
    lineEnd: node.endPosition.row + 1,
    columnEnd: node.endPosition.column + 1,
    byteStart: node.startIndex,
    byteEnd: node.endIndex,
    nameLine: nameNode.startPosition.row + 1,
    nameColumnStart: nameNode.startPosition.column + 1,
    nameColumnEnd: nameNode.endPosition.column + 1,
  };
}

export function inspectTypeScriptFunctions(source: string, filePath: string): TypeScriptShapeResult {
  try {
    const tree = parser.parse(source, undefined, { bufferSize: source.length + 1 });
    if (tree.rootNode.hasError) {
      return { status: "failed", functions: [], failure: `Syntax error in ${filePath}` };
    }
    const functions: TypeScriptFunctionShape[] = [];
    const visit = (node: SyntaxNode): void => {
      if (node.type === "function_declaration" || node.type === "generator_function_declaration") {
        const nameNode = node.childForFieldName("name");
        const name = nameNode?.text;
        if (name && nameNode) {
          functions.push(occurrence(
            node,
            nameNode,
            name,
            isTopLevel(node) ? "function_declaration" : "nested_function",
            isExported(node),
          ));
        }
      }
      if (node.type === "variable_declarator") {
        const value = node.childForFieldName("value");
        const name = node.childForFieldName("name");
        if (name?.type === "identifier" && value?.type === "arrow_function") {
          functions.push(occurrence(node, name, name.text, "arrow_function", isExported(node)));
        }
      }
      node.namedChildren.forEach(visit);
    };
    visit(tree.rootNode);
    return { status: "succeeded", functions };
  } catch (error) {
    return {
      status: "failed",
      functions: [],
      failure: error instanceof Error ? error.message : String(error),
    };
  }
}
