import { describe, expect, it } from "vitest";

import { parseKnipOutput } from "./knip";

describe("parseKnipOutput", () => {
  it("preserves PDM-style type, manifest, and dependency categories", () => {
    const findings = parseKnipOutput(JSON.stringify({
      issues: [{
        file: "src/types.ts",
        files: [],
        exports: [{ name: "unusedFunction", line: 4 }],
        types: [{ name: "InternalType", line: 8 }],
        dependencies: [{ name: "runtime-package", line: 12 }],
        devDependencies: [{ name: "dev-package", line: 13 }],
        optionalPeerDependencies: [{ name: "peer-package", line: 14 }],
        binaries: [{ name: "missing-bin" }],
        unlisted: [{ name: "undeclared-package", line: 2 }],
      }],
    }), "frontend");

    expect(findings.map((finding) => ({
      filePath: finding.filePath,
      symbolName: finding.symbolName,
      findingType: finding.findingType,
    }))).toEqual([
      { filePath: "frontend/src/types.ts", symbolName: "unusedFunction", findingType: "unused_export" },
      { filePath: "frontend/src/types.ts", symbolName: "InternalType", findingType: "unused_exported_type" },
      { filePath: "frontend/src/types.ts", symbolName: undefined, findingType: "unused_dependency" },
      { filePath: "frontend/src/types.ts", symbolName: undefined, findingType: "unused_dev_dependency" },
      { filePath: "frontend/src/types.ts", symbolName: undefined, findingType: "unused_optional_peer_dependency" },
      { filePath: "frontend/src/types.ts", symbolName: undefined, findingType: "unlisted_binary" },
      { filePath: "frontend/src/types.ts", symbolName: undefined, findingType: "unlisted_dependency" },
    ]);
  });

  it("rejects non-Knip JSON instead of silently accepting it", () => {
    expect(() => parseKnipOutput('{"notIssues":[]}', ".")).toThrow(
      "Knip JSON output does not contain an issues array",
    );
  });
});
