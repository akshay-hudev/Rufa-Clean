import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import type { ScipDocument, ScipOccurrence } from "../indexing/analyzers/scip-parse";
import { analyzeTypeScriptSnapshot } from "./analyze";

const roots: string[] = [];
const COMMIT = "a".repeat(40);

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function fixture(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "dca-analyzer-fixture-"));
  roots.push(root);
  const packageJson = JSON.stringify({ name: "fixture", private: true, scripts: { build: "tsc", test: "node test.js" }, devDependencies: { typescript: "5.9.3" } });
  await writeFile(join(root, "package.json"), packageJson);
  await writeFile(join(root, "package-lock.json"), JSON.stringify({ name: "fixture", lockfileVersion: 3, packages: { "": { name: "fixture" } } }));
  await writeFile(join(root, "tsconfig.json"), JSON.stringify({ compilerOptions: { target: "ES2022", module: "commonjs" }, include: ["src/**/*.ts"] }));
  for (const [path, content] of Object.entries(files)) {
    await mkdir(join(root, path, ".."), { recursive: true });
    await writeFile(join(root, path), content);
  }
  return root;
}

function occurrence(symbol: string, line: number, definition: boolean, context: "production" | "test" | "unknown" = "unknown"): ScipOccurrence {
  return {
    symbolString: symbol,
    kind: "function",
    isDefinition: definition,
    referenceKind: definition ? "definition" : "read",
    referenceContext: context,
    rangeStart: [line, 9],
    rangeEnd: [line, 13],
  };
}

function document(path: string, symbol: string, references: ScipOccurrence[] = []): ScipDocument {
  return { relativePath: path, symbols: [occurrence(symbol, 0, true)], references };
}

async function analyze(root: string, documents: ScipDocument[], status: "succeeded" | "failed" = "succeeded") {
  return analyzeTypeScriptSnapshot({
    accountScopeId: "fixture-account",
    repository: { provider: "github", owner: "fixture", name: "fixture" },
    commitSha: COMMIT,
    repositoryPath: root,
    scip: { status, version: "0.4.0", configuration: { tsconfig: "tsconfig.json" }, ...(status === "succeeded" ? { documents } : { failure: "fixture failure" }) },
  });
}

describe("milestone TypeScript analyzer", () => {
  it("classifies a truly unused private top-level function as candidate_dead reproducibly", async () => {
    const root = await fixture({ "src/dead.ts": "function dead() { return 1; }\n" });
    const first = await analyze(root, [document("src/dead.ts", "local 0")]);
    const second = await analyze(root, [document("src/dead.ts", "local 0")]);
    expect(first.findings[0]?.classification).toBe("candidate_dead");
    expect(first.findings[0]?.evidence.scip.definitionMatches).toBe(1);
    expect(first.findings[0]?.coverage.status).toBe("complete_for_supported_scope");
    expect(second.findings[0]?.evidenceDigest).toBe(first.findings[0]?.evidenceDigest);
    expect(second.findings[0]?.findingId).toBe(first.findings[0]?.findingId);
    expect(second.findings[0]?.functionIdentity).toBe(first.findings[0]?.functionIdentity);
    expect(first.findings[0]?.packageIdentity).toMatch(/^[a-f0-9]{64}$/);
    expect(first.findings[0]?.moduleIdentity).toMatch(/^[a-f0-9]{64}$/);
  });

  it("blocks direct calls and function-value reads", async () => {
    for (const source of [
      "function live() { return 1; }\nlive();\n",
      "function live() { return 1; }\nconsume(live);\n",
    ]) {
      const root = await fixture({ "src/live.ts": source });
      const reference = occurrence("local 0", 1, false, "production");
      const result = await analyze(root, [document("src/live.ts", "local 0", [reference])]);
      expect(result.findings[0]?.classification).toBe("live_evidence_present");
    }
  });

  it("blocks a test-only reference", async () => {
    const root = await fixture({
      "src/helper.ts": "function helper() { return 1; }\n",
      "src/helper.test.ts": "helper();\n",
    });
    const definition = document("src/helper.ts", "scip-typescript npm fixture 1.0.0 `src/helper.ts`/helper().");
    const testDocument: ScipDocument = {
      relativePath: "src/helper.test.ts",
      symbols: [],
      references: [occurrence(definition.symbols[0]!.symbolString, 0, false, "test")],
    };
    const result = await analyze(root, [definition, testDocument]);
    expect(result.findings[0]?.classification).toBe("live_evidence_present");
    expect(result.findings[0]?.evidence.scip.testReferences).toBe(1);
  });

  it("rejects exported, nested, and arrow functions as unsupported", async () => {
    const root = await fixture({
      "src/shapes.ts": [
        "export function exported() {}",
        "function outer() { function nested() {} }",
        "const arrow = () => 1;",
      ].join("\n"),
    });
    const result = await analyze(root, [{
      relativePath: "src/shapes.ts",
      symbols: [occurrence("local 0", 0, true), occurrence("local 1", 1, true), occurrence("local 2", 1, true), occurrence("local 3", 2, true)],
      references: [],
    }]);
    const byName = new Map(result.findings.map((finding) => [finding.occurrence.name, finding]));
    expect(byName.get("exported")?.classification).toBe("unsupported");
    expect(byName.get("nested")?.classification).toBe("unsupported");
    expect(byName.get("arrow")?.classification).toBe("unsupported");
  });

  it("classifies duplicate declarations and unexplained textual occurrences as conflicting", async () => {
    const duplicateRoot = await fixture({
      "src/a.ts": "function duplicate() {}\n",
      "src/b.ts": "function duplicate() {}\n",
    });
    const duplicate = await analyze(duplicateRoot, [document("src/a.ts", "local 0"), document("src/b.ts", "local 0")]);
    expect(duplicate.findings.every((finding) => finding.classification === "conflicting")).toBe(true);
    expect(new Set(duplicate.findings.map((finding) => finding.functionIdentity)).size).toBe(2);

    const textRoot = await fixture({ "src/text.ts": "function maybeDead() {}\nconst dynamic = 'maybeDead';\n" });
    const text = await analyze(textRoot, [document("src/text.ts", "local 0")]);
    expect(text.findings[0]?.classification).toBe("conflicting");
  });

  it("never produces a candidate on parse, SCIP, or coverage failure", async () => {
    const parseRoot = await fixture({
      "src/dead.ts": "function dead() {}\n",
      "src/broken.ts": "function broken( {\n",
    });
    const partial = await analyze(parseRoot, [document("src/dead.ts", "local 0"), { relativePath: "src/broken.ts", symbols: [], references: [] }]);
    expect(partial.coverage.status).toBe("partial");
    expect(partial.findings.find((finding) => finding.occurrence.name === "dead")?.classification).toBe("inconclusive");

    const scipRoot = await fixture({ "src/dead.ts": "function dead() {}\n" });
    const failed = await analyze(scipRoot, [], "failed");
    expect(failed.findings[0]?.classification).toBe("failed");

    const missing = await analyze(scipRoot, []);
    expect(missing.findings[0]?.classification).toBe("inconclusive");
  });

  it("records generated sources as explicit exclusions", async () => {
    const root = await fixture({ "src/generated/auto.ts": "// @generated\nfunction generatedDead() {}\n" });
    const result = await analyze(root, [{ relativePath: "src/generated/auto.ts", symbols: [], references: [] }]);
    expect(result.coverage.excludedFiles).toContainEqual({ path: "src/generated/auto.ts", reason: "generated_or_vendored" });
    expect(result.findings).toEqual([]);
  });

  it("rejects solution-style or multiple root TypeScript configurations", async () => {
    const root = await fixture({ "src/dead.ts": "function dead() {}\n" });
    await writeFile(join(root, "tsconfig.app.json"), JSON.stringify({ include: ["src/**/*.ts"] }));
    await expect(analyze(root, [])).rejects.toThrow(/multiple root TypeScript configurations/);
  });

  it("makes tsconfig exclusions visible without treating them as analyzed", async () => {
    const root = await fixture({
      "src/dead.ts": "function dead() {}\n",
      "outside.ts": "function outside() {}\n",
    });
    const result = await analyze(root, [document("src/dead.ts", "local 0")]);
    expect(result.coverage.excludedFiles).toContainEqual({ path: "outside.ts", reason: "excluded_by_tsconfig" });
    expect(result.findings.map((candidate) => candidate.occurrence.name)).toEqual(["dead"]);
  });
});
