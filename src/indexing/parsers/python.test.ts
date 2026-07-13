import { describe, expect, it } from "vitest";

import { pythonParser } from "./python";

describe("pythonParser", () => {
  it("extracts public and private module-level functions", () => {
    const result = pythonParser.parse(
      "def public_function():\n    pass\n\ndef _private_function():\n    pass\n",
      "module.py",
    );

    expect(result.symbols).toEqual(expect.arrayContaining([
      expect.objectContaining({
        kind: "function",
        name: "public_function",
        isExported: true,
      }),
      expect.objectContaining({
        kind: "function",
        name: "_private_function",
        isExported: false,
      }),
    ]));
  });

  it("extracts classes and qualified methods", () => {
    const result = pythonParser.parse(
      "class Service:\n    def run(self):\n        pass\n\n    def stop(self):\n        pass\n",
      "service.py",
    );

    expect(result.symbols).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: "class", name: "Service", isExported: true }),
      expect.objectContaining({ kind: "method", name: "run", qualifiedName: "Service.run" }),
      expect.objectContaining({ kind: "method", name: "stop", qualifiedName: "Service.stop" }),
    ]));
  });

  it("extracts decorated and async definitions", () => {
    const result = pythonParser.parse(
      "@decorator\nasync def load_data():\n    pass\n",
      "loader.py",
    );

    expect(result.symbols).toContainEqual(expect.objectContaining({
      kind: "function",
      name: "load_data",
      isExported: true,
    }));
  });

  it("returns failed for syntax errors", () => {
    const result = pythonParser.parse("def broken(:\n    pass", "broken.py");

    expect(result.parseStatus).toBe("failed");
    expect(result.symbols).toEqual([]);
    expect(result.intraFileCalls).toEqual([]);
    expect(result.parseError).toContain("Syntax error");
  });

  it("parses an empty file", () => {
    expect(pythonParser.parse("", "empty.py")).toEqual({
      symbols: [],
      intraFileCalls: [],
      parseStatus: "success",
    });
  });

  it("matches Python files and excludes environment/cache paths", () => {
    expect(pythonParser.canParse("src/app.py")).toBe(true);
    expect(pythonParser.canParse("src/app.ts")).toBe(false);
    expect(pythonParser.canParse("src/__pycache__/app.py")).toBe(false);
    expect(pythonParser.canParse("venv/lib/app.py")).toBe(false);
    expect(pythonParser.canParse(".venv/lib/app.py")).toBe(false);
    expect(pythonParser.canParse("lib/site-packages/app.py")).toBe(false);
  });
});
