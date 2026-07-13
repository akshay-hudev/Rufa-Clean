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

  it("enumerates Python parameters and loop targets for Vulture matching", () => {
    const result = enumerateSymbols(
      "def hook(module, input, output):\n" +
      "    for feat_idx, feat_name in enumerate(output):\n" +
      "        callback = lambda texts, **kwargs: texts\n",
      "hooks.py",
    );

    expect(result.symbols).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: "module", qualifiedName: "hook.module" }),
      expect.objectContaining({ name: "input", qualifiedName: "hook.input" }),
      expect.objectContaining({ name: "output", qualifiedName: "hook.output" }),
      expect.objectContaining({ name: "feat_idx", qualifiedName: "hook.feat_idx" }),
      expect.objectContaining({ name: "feat_name", qualifiedName: "hook.feat_name" }),
      expect.objectContaining({ name: "kwargs", qualifiedName: "hook.<lambda@3>.kwargs" }),
    ]));
  });

  it("returns a failed result for syntax errors", () => {
    const result = enumerateSymbols("function broken(", "broken.ts");
    expect(result.status).toBe("failed");
    expect(result.symbols).toEqual([]);
  });

  it("enumerates source files larger than tree-sitter's default input buffer", () => {
    const declarations = Array.from(
      { length: 4_000 },
      (_, index) => `large_value_${index} = ${index}`,
    ).join("\n");

    const result = enumerateSymbols(declarations, "large_module.py");

    expect(declarations.length).toBeGreaterThan(32 * 1024);
    expect(result.status).toBe("success");
    expect(result.symbols).toHaveLength(4_000);
    expect(result.symbols.at(-1)?.name).toBe("large_value_3999");
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
