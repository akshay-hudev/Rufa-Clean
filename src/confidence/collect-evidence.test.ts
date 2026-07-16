import { describe, expect, it } from "vitest";

import {
  classifyExternalFindings,
  type ExternalFindingRow,
} from "./collect-evidence";

function finding(
  findingType: string,
  evidenceScope: "symbol" | "file" = "symbol",
): ExternalFindingRow {
  return {
    source_tool: "knip",
    finding_type: findingType,
    raw_output: { name: "example" },
    evidence_scope: evidenceScope,
  };
}

describe("classifyExternalFindings", () => {
  it("treats a containing-file unused_file finding as dead-declaration evidence", () => {
    const result = classifyExternalFindings([
      finding("unused_file", "file"),
      finding("unused_exported_type"),
    ]);

    expect(result.deadDeclarationFindings.map((row) => row.finding_type)).toEqual([
      "unused_file",
    ]);
    expect(result.inheritedUnusedFileCount).toBe(1);
    expect(result.unusedExportedTypeCount).toBe(1);
  });

  it("keeps unused exported types out of dead-declaration evidence", () => {
    const result = classifyExternalFindings([
      finding("unused_export"),
      finding("unreachable"),
      finding("unused_exported_type"),
    ]);

    expect(result.deadDeclarationFindings.map((row) => row.finding_type)).toEqual([
      "unused_export",
      "unreachable",
    ]);
    expect(result.inheritedUnusedFileCount).toBe(0);
    expect(result.unusedExportedTypeCount).toBe(1);
  });
});
