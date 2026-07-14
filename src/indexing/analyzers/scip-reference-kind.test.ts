import ts from "typescript";
import { describe, expect, it } from "vitest";

import type { ScipOccurrence } from "./scip-parse";
import {
  classifyScipReferenceContext,
  classifyScipReferenceKind,
} from "./scip-reference-kind";

function occurrence(
  sourceFile: ts.SourceFile,
  text: string,
  occurrenceIndex = 0,
): ScipOccurrence {
  let start = -1;
  for (let index = 0; index <= occurrenceIndex; index += 1) {
    start = sourceFile.text.indexOf(text, start + 1);
  }
  if (start < 0) {
    throw new Error(`Occurrence not found: ${text}`);
  }
  const startLocation = sourceFile.getLineAndCharacterOfPosition(start);
  const endLocation = sourceFile.getLineAndCharacterOfPosition(start + text.length);
  return {
    symbolString: `fixture/${text}`,
    kind: "function",
    isDefinition: false,
    referenceKind: "unknown",
    referenceContext: "unknown",
    rangeStart: [startLocation.line, startLocation.character],
    rangeEnd: [endLocation.line, endLocation.character],
  };
}

describe("classifyScipReferenceKind", () => {
  const sourceFile = ts.createSourceFile(
    "src/app.ts",
    [
      'import { importedOnly } from "./utils";',
      'export { reexported } from "./utils";',
      "calledFunction();",
      "const instance = new Service();",
      "const alias = readValue;",
    ].join("\n"),
    ts.ScriptTarget.Latest,
    true,
  );

  it("classifies imports and re-exports", () => {
    expect(classifyScipReferenceKind(sourceFile, occurrence(sourceFile, "importedOnly")))
      .toBe("import");
    expect(classifyScipReferenceKind(sourceFile, occurrence(sourceFile, "reexported")))
      .toBe("reexport");
  });

  it("classifies calls, construction, and ordinary reads", () => {
    expect(classifyScipReferenceKind(sourceFile, occurrence(sourceFile, "calledFunction")))
      .toBe("call");
    expect(classifyScipReferenceKind(sourceFile, occurrence(sourceFile, "Service")))
      .toBe("construct");
    expect(classifyScipReferenceKind(sourceFile, occurrence(sourceFile, "readValue")))
      .toBe("read");
  });
});

describe("classifyScipReferenceContext", () => {
  it.each([
    "src/helper.test.ts",
    "src/helper.spec.tsx",
    "src/__tests__/helper.ts",
    "tests/integration/helper.ts",
    "test/helper.js",
  ])("classifies test path %s", (filePath) => {
    expect(classifyScipReferenceContext(filePath)).toBe("test");
  });

  it.each([
    "src/helper.ts",
    "src/testing/helper.ts",
    "src/contest/helper.ts",
  ])("classifies production path %s", (filePath) => {
    expect(classifyScipReferenceContext(filePath)).toBe("production");
  });
});
