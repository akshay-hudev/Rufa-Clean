import { describe, expect, it } from "vitest";

import { enumerateSymbols, symbolLanguage } from "./tree-sitter";

describe("tree-sitter symbol enumeration", () => {
  it("enumerates declarations without building calls", () => {
    const result = enumerateSymbols(
      "export function run() {} class Service { start() {} }",
      "src/service.ts",
    );

    expect(result.status).toBe("success");
    expect(result.symbols).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: "function", name: "run", isExported: true }),
      expect.objectContaining({ kind: "class", name: "Service", isExported: false }),
      expect.objectContaining({ kind: "method", qualifiedName: "Service.start" }),
    ]));
    expect(result).not.toHaveProperty("intraFileCalls");
  });

  it("enumerates CommonJS const and arrow-function exports", () => {
    const result = enumerateSymbols(
      "const provider = makeProvider();\nconst generateTOTP = () => '123';\n" +
      "module.exports = { provider, generateTOTP };",
      "backend/helpers.js",
    );

    expect(result.symbols).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: "variable", name: "provider", isExported: true }),
      expect.objectContaining({ kind: "function", name: "generateTOTP", isExported: true }),
    ]));
  });

  it("enumerates Python functions, methods, assignments, attributes, and imports", () => {
    const result = enumerateSymbols(
      "import os\nVALUE = 1\nclass Service:\n" +
      "    def run(self):\n        self.result = VALUE\n",
      "app.py",
    );

    expect(result.symbols).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: "import", name: "os" }),
      expect.objectContaining({ kind: "variable", name: "VALUE", isExported: true }),
      expect.objectContaining({ kind: "class", name: "Service", isExported: true }),
      expect.objectContaining({ kind: "method", qualifiedName: "Service.run" }),
      expect.objectContaining({ kind: "attribute", name: "result" }),
    ]));
  });

  it("returns a failed result for syntax errors", () => {
    const result = enumerateSymbols("function broken(", "broken.ts");
    expect(result.status).toBe("failed");
    expect(result.symbols).toEqual([]);
  });

  it("recognizes supported source files and exclusions", () => {
    expect(symbolLanguage("src/index.ts")).toBe("typescript");
    expect(symbolLanguage("src/index.mts")).toBe("typescript");
    expect(symbolLanguage("src/index.jsx")).toBe("javascript");
    expect(symbolLanguage("src/index.cjs")).toBe("javascript");
    expect(symbolLanguage("app/main.py")).toBe("python");
    expect(symbolLanguage("node_modules/pkg/index.js")).toBeUndefined();
    expect(symbolLanguage(".venv/lib/main.py")).toBeUndefined();
    expect(symbolLanguage("public/app.min.js")).toBeUndefined();
    expect(symbolLanguage("README.md")).toBeUndefined();
  });
});
