import { describe, expect, it, vi } from "vitest";

import {
  clearIndexedFileSymbolState,
  removeMissingIndexedFiles,
  refreshUnchangedIndexedFile,
} from "./sync";

function queryClient(
  handler: (sql: string, values: unknown[] | undefined) => unknown,
) {
  return {
    query: vi.fn(async (sql: string, values?: unknown[]) => handler(sql, values)),
  };
}

describe("indexed symbol refresh", () => {
  it("advances the snapshot commit for an unchanged file", async () => {
    const client = queryClient(() => ({ rows: [] }));

    await refreshUnchangedIndexedFile(
      client as never,
      "file-1",
      "new-commit",
    );

    expect(client.query).toHaveBeenCalledOnce();
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining("SET commit_sha = $2"),
      ["file-1", "new-commit"],
    );
  });

  it("clears stale symbol-derived rows before replacing unreviewed symbols", async () => {
    const statements: string[] = [];
    const client = queryClient((sql) => {
      statements.push(sql.replace(/\s+/g, " ").trim());
      return { rows: [] };
    });

    await clearIndexedFileSymbolState(client as never, "file-1");

    expect(statements).toHaveLength(8);
    expect(statements[0]).toContain("DELETE FROM call_edges");
    expect(statements[1]).toContain("DELETE FROM cross_repo_references");
    expect(statements[2]).toContain("DELETE FROM import_edges");
    expect(statements[3]).toContain("UPDATE external_signals");
    expect(statements[4]).toContain("DELETE FROM confidence_evidence");
    expect(statements[5]).toContain("DELETE FROM confidence_verdicts");
    expect(statements[6]).toContain("DELETE FROM symbols");
    expect(statements[7]).toContain("SET file_id = NULL");
  });

  it("preserves reviewed and removal-action symbols as detached audit history", async () => {
    const statements: string[] = [];
    const client = queryClient((sql) => {
      statements.push(sql.replace(/\s+/g, " ").trim());
      return { rows: [] };
    });

    await clearIndexedFileSymbolState(client as never, "file-1");

    expect(statements[4]).toContain(
      "confidence_verdicts.review_status <> 'unreviewed'",
    );
    expect(statements[4]).toContain("FROM removal_actions");
    expect(statements[5]).toContain(
      "confidence_verdicts.review_status = 'unreviewed'",
    );
    expect(statements[6]).toContain("FROM confidence_verdicts");
    expect(statements[6]).toContain("FROM removal_actions");
    expect(statements[7]).toBe(
      "UPDATE symbols SET file_id = NULL WHERE file_id = $1",
    );
  });

  it("removes indexed files that are absent from the current repository snapshot", async () => {
    const statements: string[] = [];
    const client = queryClient((sql) => {
      const normalized = sql.replace(/\s+/g, " ").trim();
      statements.push(normalized);
      if (normalized.startsWith("SELECT id, file_path FROM indexed_files")) {
        return {
          rows: [
            { id: "current-file", file_path: "src/current.ts" },
            { id: "deleted-file", file_path: "src/deleted.ts" },
          ],
        };
      }
      return { rows: [] };
    });

    const removed = await removeMissingIndexedFiles(
      client as never,
      "repository-1",
      new Set(["src/current.ts"]),
    );

    expect(removed).toBe(1);
    expect(statements.some((sql) =>
      sql === "DELETE FROM external_signals WHERE file_id = $1"
    )).toBe(true);
    expect(statements.some((sql) =>
      sql === "DELETE FROM indexed_files WHERE id = $1"
    )).toBe(true);
    expect(client.query).not.toHaveBeenCalledWith(
      expect.anything(),
      ["current-file"],
    );
  });
});
