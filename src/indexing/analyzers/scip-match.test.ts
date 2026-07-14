import { mkdir, rm, symlink } from "node:fs/promises";
import { join, resolve } from "node:path";

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
}));

vi.mock("../../db/client", () => ({
  pool: { query: mocks.query },
}));

import {
  catalogScipDefinitionMatches,
  parseScipSymbol,
  resolveCrossRepoReferences,
  type RepositoryScipDefinitionMatch,
} from "./scip-match";
import { parseScipIndex, type ScipDocument, type ScipOccurrence } from "./scip-parse";
import { runScipIndex } from "./scip-typescript";

const fixtureRoot = resolve(__dirname, "__fixtures__/scip-cross-repo");
const providerRoot = join(fixtureRoot, "provider");
const consumerRoot = join(fixtureRoot, "consumer");
const consumerNodeModules = join(consumerRoot, "node_modules");

function occurrence(
  symbolString: string,
  referenceKind: ScipOccurrence["referenceKind"] = "unknown",
): ScipOccurrence {
  return {
    symbolString,
    kind: "unspecified",
    isDefinition: false,
    referenceKind,
    referenceContext: "unknown",
    rangeStart: [9, 4],
    rangeEnd: [9, 12],
  };
}

describe("parseScipSymbol", () => {
  it("extracts a scoped npm package coordinate and symbol path", () => {
    expect(
      parseScipSymbol(
        "scip-typescript npm @scope/library 2.3.4 src/`index.ts`/exportedFunction().",
      ),
    ).toEqual({
      scheme: "scip-typescript",
      packageCoordinate: "npm @scope/library 2.3.4",
      packageName: "@scope/library",
      version: "2.3.4",
      symbolPath: "src/`index.ts`/exportedFunction().",
    });
  });

  it("does not treat document-local symbols as package symbols", () => {
    expect(parseScipSymbol("local 2")).toBeNull();
  });
});

describe("resolveCrossRepoReferences", () => {
  beforeAll(async () => {
    const fixtureScope = join(consumerNodeModules, "@fixture");
    await mkdir(fixtureScope, { recursive: true });
    await symlink(providerRoot, join(fixtureScope, "shared"), "dir");
  });

  afterAll(async () => {
    await Promise.all([
      rm(join(providerRoot, "index.scip"), { force: true }),
      rm(join(consumerRoot, "index.scip"), { force: true }),
      rm(consumerNodeModules, { recursive: true, force: true }),
    ]);
  });

  beforeEach(() => {
    mocks.query.mockReset();
  });

  it("resolves exact symbols, records genuine externals, and skips missing paths in known repos", async () => {
    mocks.query
      .mockResolvedValueOnce({
        rows: [
          {
            id: "caller-id",
            file_path: "src/caller.ts",
            line_start: 1,
            line_end: 20,
          },
        ],
      })
      .mockResolvedValueOnce({ rowCount: 2 });

    const documents: ScipDocument[] = [
      {
        relativePath: "src/caller.ts",
        symbols: [],
        references: [
          occurrence("scip-typescript npm current-app 1.0.0 src/`own.ts`/own()."),
          occurrence(
            "scip-typescript npm shared-lib 2.0.0 src/`lib.ts`/shared().",
            "import",
          ),
          occurrence(
            "scip-typescript npm shared-lib 2.0.0 src/`lib.ts`/shared().",
            "import",
          ),
          occurrence("scip-typescript npm shared-lib 2.0.0 src/`lib.ts`/missing()."),
          occurrence("scip-typescript npm lodash 4.17.21 `lodash.d.ts`/map()."),
        ],
      },
    ];
    const catalog: RepositoryScipDefinitionMatch[] = [
      {
        repositoryId: "current-repo",
        scipSymbolString: "scip-typescript npm current-app 1.0.0 src/`own.ts`/own().",
        matchedSymbolId: "own-id",
      },
      {
        repositoryId: "shared-repo",
        scipSymbolString: "scip-typescript npm shared-lib 2.0.0 src/`lib.ts`/shared().",
        matchedSymbolId: "shared-id",
      },
    ];

    await expect(
      resolveCrossRepoReferences("current-repo", documents, catalog),
    ).resolves.toEqual({
      crossRepoResolved: 1,
      crossRepoExternal: 1,
    });

    expect(mocks.query).toHaveBeenCalledTimes(2);
    expect(mocks.query.mock.calls[1]?.[1]).toEqual([
      ["caller-id", "caller-id"],
      ["shared-id", null],
      ["npm shared-lib 2.0.0", "npm lodash 4.17.21"],
      ["cross_repo_resolved", "cross_repo_external"],
      ["import", "unknown"],
      ["unknown", "unknown"],
    ]);
  });

  it("resolves a declaration-file reference to a unique source definition", async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rowCount: 1 });

    const documents: ScipDocument[] = [
      {
        relativePath: "src/index.ts",
        symbols: [],
        references: [
          occurrence(
            "scip-typescript npm shared-lib 1.0.0 dist/`index.d.ts`/formatCurrency().",
          ),
        ],
      },
    ];
    const catalog: RepositoryScipDefinitionMatch[] = [
      {
        repositoryId: "current-repo",
        scipSymbolString: "scip-typescript npm current-app 1.0.0 src/`index.ts`/",
        matchedSymbolId: null,
      },
      {
        repositoryId: "shared-repo",
        scipSymbolString:
          "scip-typescript npm shared-lib 1.0.0 src/`index.ts`/formatCurrency().",
        matchedSymbolId: "format-currency-id",
      },
    ];

    await expect(
      resolveCrossRepoReferences("current-repo", documents, catalog),
    ).resolves.toEqual({ crossRepoResolved: 1, crossRepoExternal: 0 });
    expect(mocks.query.mock.calls[1]?.[1]).toEqual([
      [null],
      ["format-currency-id"],
      ["npm shared-lib 1.0.0"],
      ["cross_repo_resolved"],
      ["unknown"],
      ["unknown"],
    ]);
  });

  it("resolves a real SCIP reference between two package-linked repositories", async () => {
    const [providerScipPath, consumerScipPath] = await Promise.all([
      runScipIndex(providerRoot),
      runScipIndex(consumerRoot),
    ]);
    expect(providerScipPath).not.toBeNull();
    expect(consumerScipPath).not.toBeNull();

    const [providerDocuments, consumerDocuments] = await Promise.all([
      parseScipIndex(providerScipPath as string),
      parseScipIndex(consumerScipPath as string),
    ]);
    const providerMatches = providerDocuments.flatMap((document) =>
      document.symbols.map((definition) => ({
        scipSymbolString: definition.symbolString,
        matchedSymbolId: definition.symbolString.endsWith("/sharedGreeting().")
          ? "provider-shared-greeting-id"
          : null,
      })),
    );
    const consumerMatches = consumerDocuments.flatMap((document) =>
      document.symbols.map((definition) => ({
        scipSymbolString: definition.symbolString,
        matchedSymbolId: null,
      })),
    );
    expect(providerMatches.some((match) => match.matchedSymbolId !== null)).toBe(true);

    mocks.query
      .mockResolvedValueOnce({
        rows: [
          {
            id: "consumer-caller-id",
            file_path: "src/index.ts",
            line_start: 1,
            line_end: 10,
          },
        ],
      })
      .mockResolvedValueOnce({ rowCount: 1 });

    const catalog = [
      ...catalogScipDefinitionMatches("provider-repo", providerMatches),
      ...catalogScipDefinitionMatches("consumer-repo", consumerMatches),
    ];
    const summary = await resolveCrossRepoReferences(
      "consumer-repo",
      consumerDocuments,
      catalog,
    );

    expect(summary.crossRepoResolved).toBe(2);
    const insertParameters = mocks.query.mock.calls[1]?.[1] as unknown[][];
    expect(insertParameters[1]).toContain("provider-shared-greeting-id");
    expect(insertParameters[2]).toContain("npm @fixture/shared 1.0.0");
    expect(insertParameters[3]).toContain("cross_repo_resolved");
    expect(insertParameters[4]).toContain("unknown");
    expect(insertParameters[5]).toContain("unknown");
  }, 15_000);
});
