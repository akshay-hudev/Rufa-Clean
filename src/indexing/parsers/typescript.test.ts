import { describe, expect, it } from "vitest";

import { typescriptParser } from "./typescript";

describe("typescriptParser", () => {
  it("extracts a plain top-level function", () => {
    const result = typescriptParser.parse("function greet() { return 'hello'; }", "greet.ts");

    expect(result.parseStatus).toBe("success");
    expect(result.symbols).toContainEqual(expect.objectContaining({
      kind: "function",
      name: "greet",
      qualifiedName: "greet",
      isExported: false,
    }));
  });

  it("marks an exported function", () => {
    const result = typescriptParser.parse("export function greet() {}", "greet.ts");

    expect(result.symbols).toContainEqual(expect.objectContaining({
      kind: "function",
      name: "greet",
      isExported: true,
    }));
  });

  it("extracts a class and its methods with qualified names", () => {
    const result = typescriptParser.parse(
      "class Greeter { hello() {} goodbye() {} }",
      "greeter.ts",
    );

    expect(result.symbols).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: "class", name: "Greeter" }),
      expect.objectContaining({ kind: "method", name: "hello", qualifiedName: "Greeter.hello" }),
      expect.objectContaining({
        kind: "method",
        name: "goodbye",
        qualifiedName: "Greeter.goodbye",
      }),
    ]));
  });

  it("marks a default-exported declaration", () => {
    const result = typescriptParser.parse("export default class Greeter {}", "greeter.ts");

    expect(result.symbols).toContainEqual(expect.objectContaining({
      kind: "class",
      name: "Greeter",
      isExported: true,
    }));
  });

  it("returns failed instead of crashing on a syntax error", () => {
    const result = typescriptParser.parse("function broken(", "broken.ts");

    expect(result.parseStatus).toBe("failed");
    expect(result.symbols).toEqual([]);
    expect(result.parseError).toContain("Syntax error");
  });

  it("parses an empty file", () => {
    expect(typescriptParser.parse("", "empty.ts")).toEqual({
      symbols: [],
      intraFileCalls: [],
      parseStatus: "success",
    });
  });

  it("accepts supported extensions and excludes generated or dependency paths", () => {
    expect(typescriptParser.canParse("src/index.ts")).toBe(true);
    expect(typescriptParser.canParse("src/component.tsx")).toBe(true);
    expect(typescriptParser.canParse("src/index.js")).toBe(true);
    expect(typescriptParser.canParse("src/component.jsx")).toBe(true);
    expect(typescriptParser.canParse("node_modules/pkg/index.js")).toBe(false);
    expect(typescriptParser.canParse("dist/index.js")).toBe(false);
    expect(typescriptParser.canParse("build/index.js")).toBe(false);
    expect(typescriptParser.canParse("public/app.min.js")).toBe(false);
  });

  it("resolves a call to another function in the same file", () => {
    const result = typescriptParser.parse(
      "function helper() {} function run() { helper(); }",
      "calls.ts",
    );

    expect(result.intraFileCalls).toContainEqual({
      callerQualifiedName: "run",
      calleeName: "helper",
      resolved: true,
    });
  });

  it("leaves imported or external function calls unresolved", () => {
    const result = typescriptParser.parse(
      "import { external } from './dependency'; function run() { external(); }",
      "calls.ts",
    );

    expect(result.intraFileCalls).toContainEqual({
      callerQualifiedName: "run",
      calleeName: "external",
      resolved: false,
    });
  });

  it("resolves this.method calls to another method in the same class", () => {
    const result = typescriptParser.parse(
      "class Service { run() { this.finish(); } finish() {} }",
      "service.ts",
    );

    expect(result.intraFileCalls).toContainEqual({
      callerQualifiedName: "Service.run",
      calleeName: "this.finish",
      resolved: true,
    });
  });

  it("resolves recursive calls", () => {
    const result = typescriptParser.parse(
      "function recurse() { recurse(); }",
      "recursive.ts",
    );

    expect(result.intraFileCalls).toContainEqual({
      callerQualifiedName: "recurse",
      calleeName: "recurse",
      resolved: true,
    });
  });
});
