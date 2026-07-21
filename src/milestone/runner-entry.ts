import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve, sep } from "node:path";

import { classifyScipReferenceKinds } from "../indexing/analyzers/scip-reference-kind";
import { parseScipIndex } from "../indexing/analyzers/scip-parse";
import { analyzeTypeScriptSnapshot } from "./analyze";
import { canonicalJson } from "./canonical";
import type { AnalysisInput } from "./types";

const ROOT = "/workspace";
const INPUT = "/input";
const OUTPUT = join(ROOT, ".dca-output");
const IGNORED = new Set([".git", "node_modules", "dist", "build", "coverage", ".next", ".turbo", ".dca-output"]);

function portable(path: string): string {
  return path.split(sep).join("/");
}

async function files(root: string): Promise<string[]> {
  const result: string[] = [];
  const visit = async (directory: string): Promise<void> => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) {
        continue;
      }
      const path = join(directory, entry.name);
      if (entry.isDirectory() && !IGNORED.has(entry.name)) {
        await visit(path);
      } else if (entry.isFile()) {
        result.push(path);
      }
    }
  };
  await visit(root);
  return result.sort();
}

async function hash(path: string): Promise<string> {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

async function verifyScope(target: string): Promise<{ changedFiles: string[]; unexpectedFiles: string[] }> {
  const originalFiles = await files(INPUT);
  const workspaceFiles = await files(ROOT);
  const originalPaths = new Set(originalFiles.map((path) => portable(relative(INPUT, path))));
  const workspacePaths = new Set(workspaceFiles.map((path) => portable(relative(ROOT, path))));
  const all = [...new Set([...originalPaths, ...workspacePaths])].sort();
  const changedFiles: string[] = [];
  for (const path of all) {
    if (!originalPaths.has(path) || !workspacePaths.has(path)) {
      changedFiles.push(path);
      continue;
    }
    if (await hash(join(INPUT, path)) !== await hash(join(ROOT, path))) {
      changedFiles.push(path);
    }
  }
  return { changedFiles, unexpectedFiles: changedFiles.filter((path) => path !== target) };
}

async function analyze(metadata: string): Promise<void> {
  const parsed = JSON.parse(Buffer.from(metadata, "base64url").toString("utf8")) as Omit<AnalysisInput, "repositoryPath" | "scip">;
  const indexPath = "/tmp/index.scip";
  const indexBytes = await readFile(indexPath);
  const documents = await classifyScipReferenceKinds(ROOT, await parseScipIndex(indexPath));
  const result = await analyzeTypeScriptSnapshot({
    ...parsed,
    repositoryPath: ROOT,
    scip: {
      status: "succeeded",
      version: "0.4.0",
      configuration: { tsconfig: "tsconfig.json", command: "scip-typescript index" },
      artifactSha256: createHash("sha256").update(indexBytes).digest("hex"),
      documents,
    },
  });
  await mkdir(OUTPUT, { recursive: true });
  await writeFile(join(OUTPUT, "analysis.json"), canonicalJson(result));
}

async function emitPatch(filePath: string): Promise<void> {
  if (!filePath.endsWith(".ts") || filePath.includes("..") || filePath.startsWith("/")) {
    throw new Error("Unsafe patch target");
  }
  const scope = await verifyScope(filePath);
  if (scope.changedFiles.length !== 1 || scope.unexpectedFiles.length !== 0) {
    throw new Error(`Unexpected changed files: ${scope.changedFiles.join(", ") || "none"}`);
  }
  const original = await readFile(resolve(INPUT, filePath), "utf8");
  const changed = await readFile(resolve(ROOT, filePath), "utf8");
  const payload = {
    filePath,
    beforeSha256: createHash("sha256").update(original).digest("hex"),
    afterSha256: createHash("sha256").update(changed).digest("hex"),
    changedContentBase64: Buffer.from(changed).toString("base64"),
    changedFiles: scope.changedFiles,
  };
  await mkdir(OUTPUT, { recursive: true });
  await writeFile(join(OUTPUT, "patch-input.json"), canonicalJson(payload));
}

async function main(): Promise<void> {
  const [command, argument] = process.argv.slice(2);
  if (!command || !argument) {
    throw new Error("Usage: runner-entry <analyze|emit-patch|verify-scope> <argument>");
  }
  if (command === "analyze") {
    await analyze(argument);
    return;
  }
  if (command === "emit-patch") {
    await emitPatch(argument);
    return;
  }
  if (command === "verify-scope") {
    process.stdout.write(canonicalJson(await verifyScope(argument)));
    return;
  }
  throw new Error(`Unknown runner command: ${command}`);
}

void main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});
