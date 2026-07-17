import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { auditCandidateSourceReferences } from "./source-audit";
import type { RemovalCandidate, RemovalValidation } from "./types";

function candidate(overrides: Partial<RemovalCandidate> = {}): RemovalCandidate {
  return {
    verdictId: "verdict",
    symbolId: "symbol",
    symbolName: "unused",
    qualifiedName: "unused",
    symbolKind: "function",
    isExported: true,
    filePath: "src/client.js",
    language: "javascript",
    indexedCommitSha: "commit",
    indexedContentHash: "hash",
    repositoryId: "repo",
    vcsProvider: "github",
    orgSlug: "owner",
    repoSlug: "repo",
    defaultBranch: "main",
    automatedVerdict: "undecidable",
    confidenceScore: 0.6,
    reviewStatus: "unreviewed",
    reviewedBy: null,
    reviewedAt: null,
    importOrReexportReferences: 0,
    executableReferences: 0,
    importEdges: 0,
    directUnusedExportFindings: 1,
    directUnusedTypeFindings: 0,
    scoreBeforeExportCap: 0.625,
    ...overrides,
  };
}

const namedValidation: RemovalValidation = {
  language: "javascript",
  shape: "exported_variable_function",
  reviewMode: "draft_pr_review",
};

describe("auditCandidateSourceReferences", () => {
  it("accepts a named export whose declaration is its only repository occurrence", async () => {
    const root = await mkdtemp(join(tmpdir(), "dca-source-audit-"));
    await mkdir(join(root, "src"));
    await writeFile(join(root, "src/client.js"), "export const unused = () => 1\n");
    await writeFile(join(root, "src/main.js"), "console.log('alive')\n");

    const result = await auditCandidateSourceReferences(root, candidate(), namedValidation);
    expect(result.sourceOccurrences).toBe(1);
    expect(result.checkedFiles).toBe(2);
  });

  it("rejects a named export with a real source consumer", async () => {
    const root = await mkdtemp(join(tmpdir(), "dca-source-audit-consumer-"));
    await mkdir(join(root, "src"));
    await writeFile(join(root, "src/client.js"), "export const unused = () => 1\n");
    await writeFile(join(root, "src/main.js"), "import { unused } from './client.js'\nunused()\n");

    await expect(auditCandidateSourceReferences(root, candidate(), namedValidation))
      .rejects.toThrow("found 3 repository source occurrences");
  });

  it("rejects a default export that has a default-import consumer", async () => {
    const root = await mkdtemp(join(tmpdir(), "dca-source-audit-default-"));
    await mkdir(join(root, "src"));
    await writeFile(join(root, "src/client.js"), "const api = {}\nexport default api\n");
    await writeFile(join(root, "src/main.js"), "import api from './client.js'\nvoid api\n");
    await expect(auditCandidateSourceReferences(
      root,
      candidate({ symbolName: "default", qualifiedName: "default", symbolKind: "export" }),
      { ...namedValidation, shape: "default_export_alias" },
    )).rejects.toThrow("default-import consumers");
  });

  it("accepts an internally used type when only its export modifier is unused", async () => {
    const root = await mkdtemp(join(tmpdir(), "dca-source-audit-type-"));
    await mkdir(join(root, "src"));
    await writeFile(
      join(root, "src/client.ts"),
      "export interface Internal { id: string }\ninterface Holder { value: Internal }\n",
    );
    const result = await auditCandidateSourceReferences(
      root,
      candidate({
        symbolName: "Internal",
        qualifiedName: "Internal",
        symbolKind: "interface",
        filePath: "src/client.ts",
        language: "typescript",
        directUnusedExportFindings: 0,
        directUnusedTypeFindings: 1,
      }),
      {
        language: "typescript",
        shape: "export_modifier_only",
        reviewMode: "draft_pr_review",
      },
    );
    expect(result.sourceOccurrences).toBe(2);
    expect(result.importConsumers).toEqual([]);
  });
});
