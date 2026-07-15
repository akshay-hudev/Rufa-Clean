import { describe, expect, it } from "vitest";

import type { RemovalCandidate } from "./types";
import { validateSimpleCandidate } from "./eligibility";

function candidate(overrides: Partial<RemovalCandidate> = {}): RemovalCandidate {
  return {
    verdictId: "verdict-1",
    symbolId: "symbol-1",
    symbolName: "unusedHelper",
    qualifiedName: "unusedHelper",
    symbolKind: "function",
    isExported: false,
    filePath: "src/helper.ts",
    language: "typescript",
    indexedCommitSha: "abc123",
    indexedContentHash: "def456",
    repositoryId: "repository-1",
    vcsProvider: "github",
    orgSlug: "owner",
    repoSlug: "repo",
    defaultBranch: "main",
    automatedVerdict: "likely_dead",
    confidenceScore: 0.95,
    reviewStatus: "confirmed_dead",
    reviewedBy: "human@example.com",
    reviewedAt: new Date("2026-07-15T00:00:00Z"),
    importOrReexportReferences: 0,
    executableReferences: 0,
    importEdges: 0,
    ...overrides,
  };
}

describe("validateSimpleCandidate", () => {
  it("accepts a human-confirmed non-exported top-level TypeScript function", () => {
    expect(validateSimpleCandidate(candidate())).toBe("typescript");
    expect(validateSimpleCandidate(candidate({ filePath: "src/helper.tsx" }))).toBe("tsx");
  });

  it.each([
    [{ reviewStatus: "unreviewed" }, "confirmed_dead"],
    [{ reviewedBy: null }, "human reviewer"],
    [{ isExported: true }, "exported symbols"],
    [{ importOrReexportReferences: 1 }, "import or re-export"],
    [{ importEdges: 1 }, "import or re-export"],
    [{ executableReferences: 1 }, "executable references"],
    [{ qualifiedName: "Thing.unusedHelper" }, "top-level"],
    [{ symbolKind: "class" }, "top-level"],
    [{ filePath: "src/helper.d.ts" }, "declaration files"],
    [{ language: "python", filePath: "src/helper.py" }, "TypeScript and TSX"],
  ] as const)("rejects an unsafe candidate %#", (overrides, message) => {
    expect(() => validateSimpleCandidate(candidate(overrides))).toThrow(message);
  });
});
