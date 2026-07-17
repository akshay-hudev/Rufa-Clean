import { describe, expect, it } from "vitest";

import type { RemovalCandidate } from "./types";
import {
  validateAdaptiveDraftCandidate,
  validateDraftReviewCandidate,
  validateSimpleCandidate,
} from "./eligibility";

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
    directUnusedExportFindings: 0,
    scoreBeforeExportCap: null,
    ...overrides,
  };
}

describe("validateSimpleCandidate", () => {
  it("accepts a human-confirmed non-exported top-level TypeScript function", () => {
    expect(validateSimpleCandidate(candidate())).toBe("typescript");
    expect(validateSimpleCandidate(candidate({ filePath: "src/helper.tsx" }))).toBe("tsx");
  });

  it("accepts a human-confirmed non-exported top-level JavaScript function", () => {
    expect(validateSimpleCandidate(candidate({
      language: "javascript",
      filePath: "src/helper.js",
    }))).toBe("javascript");
  });

  it("accepts a human-confirmed non-exported top-level Python function", () => {
    expect(validateSimpleCandidate(candidate({
      language: "python",
      filePath: "training/helper.py",
    }))).toBe("python");
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
    [{ language: "python", filePath: "src/helper.ts" }, "language/file combination"],
  ] as const)("rejects an unsafe candidate %#", (overrides, message) => {
    expect(() => validateSimpleCandidate(candidate(overrides))).toThrow(message);
  });
});

describe("validateAdaptiveDraftCandidate", () => {
  it("accepts a directly reported JavaScript exported arrow function", () => {
    expect(validateAdaptiveDraftCandidate(candidate({
      language: "javascript",
      filePath: "src/api/client.js",
      symbolName: "createUser",
      qualifiedName: "createUser",
      isExported: true,
      automatedVerdict: "undecidable",
      confidenceScore: 0.6,
      reviewStatus: "unreviewed",
      reviewedBy: null,
      reviewedAt: null,
      directUnusedExportFindings: 1,
      scoreBeforeExportCap: 0.625,
    }))).toEqual({
      language: "javascript",
      shape: "exported_variable_function",
      reviewMode: "draft_pr_review",
    });
  });

  it("requires direct Knip evidence and rejects resolved consumers", () => {
    expect(() => validateAdaptiveDraftCandidate(candidate({
      language: "javascript",
      filePath: "src/api/client.js",
      isExported: true,
      directUnusedExportFindings: 0,
      scoreBeforeExportCap: 0.625,
    }))).toThrow("direct Knip");
    expect(() => validateAdaptiveDraftCandidate(candidate({
      language: "javascript",
      filePath: "src/api/client.js",
      isExported: true,
      directUnusedExportFindings: 1,
      scoreBeforeExportCap: 0.625,
      executableReferences: 1,
    }))).toThrow("resolved references");
  });
});

describe("validateDraftReviewCandidate", () => {
  it("accepts an unreviewed likely-dead top-level function for a draft PR", () => {
    expect(validateDraftReviewCandidate(candidate({
      reviewStatus: "unreviewed",
      reviewedBy: null,
      reviewedAt: null,
    }))).toEqual({
      language: "typescript",
      shape: "top_level_function",
      reviewMode: "draft_pr_review",
    });
  });

  it("accepts a directly-reported unused default export suppressed by the export cap", () => {
    expect(validateDraftReviewCandidate(candidate({
      symbolName: "default",
      qualifiedName: "default",
      symbolKind: "export",
      isExported: true,
      automatedVerdict: "undecidable",
      confidenceScore: 0.6,
      reviewStatus: "unreviewed",
      reviewedBy: null,
      reviewedAt: null,
      directUnusedExportFindings: 1,
      scoreBeforeExportCap: 0.84,
    }))).toEqual({
      language: "typescript",
      shape: "default_export_alias",
      reviewMode: "draft_pr_review",
    });
  });

  it("rejects a weak undecidable export candidate", () => {
    expect(() => validateDraftReviewCandidate(candidate({
      symbolName: "default",
      qualifiedName: "default",
      symbolKind: "export",
      isExported: true,
      automatedVerdict: "undecidable",
      reviewStatus: "unreviewed",
      reviewedBy: null,
      reviewedAt: null,
      directUnusedExportFindings: 0,
      scoreBeforeExportCap: 0.84,
    }))).toThrow("likely_dead or a directly-reported unused default export");
  });
});
