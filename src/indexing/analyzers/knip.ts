import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";

import type { RepoLevelAnalyzer, RepoLevelFinding } from "./types";

const execFileAsync = promisify(execFile);
const PROJECT_SUBDIRECTORIES = ["backend", "frontend", "client", "server", "api", "web"];

interface KnipProjectRoot {
  absolutePath: string;
  relativePath: string;
}

interface KnipReportEntry {
  file: string;
  files?: unknown[];
  exports?: unknown[];
  types?: unknown[];
  dependencies?: unknown[];
  devDependencies?: unknown[];
  optionalPeerDependencies?: unknown[];
  binaries?: unknown[];
  unlisted?: unknown[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseReport(output: string): KnipReportEntry[] {
  const report: unknown = JSON.parse(output);
  if (!isRecord(report) || !Array.isArray(report.issues)) {
    throw new Error("Knip JSON output does not contain an issues array");
  }

  return report.issues.filter((entry): entry is KnipReportEntry =>
    isRecord(entry) && typeof entry.file === "string"
  );
}

function lineFromFinding(finding: unknown): number | undefined {
  if (!isRecord(finding)) {
    return undefined;
  }
  return typeof finding.line === "number" ? finding.line : undefined;
}

function nameFromFinding(finding: unknown): string | undefined {
  if (!isRecord(finding)) {
    return undefined;
  }
  return typeof finding.name === "string" ? finding.name : undefined;
}

function findProjectRoots(repoRootPath: string): KnipProjectRoot[] {
  if (existsSync(join(repoRootPath, "package.json"))) {
    return [{ absolutePath: repoRootPath, relativePath: "." }];
  }

  return PROJECT_SUBDIRECTORIES.flatMap((directory): KnipProjectRoot[] => {
    const absolutePath = join(repoRootPath, directory);
    return existsSync(join(absolutePath, "package.json"))
      ? [{ absolutePath, relativePath: directory }]
      : [];
  });
}

function prefixFilePath(filePath: string, projectRoot: string): string {
  const normalizedPath = filePath.replaceAll("\\", "/").replace(/^\.\//, "");
  return projectRoot === "." ? normalizedPath : `${projectRoot}/${normalizedPath}`;
}

function mapEntry(entry: KnipReportEntry, projectRoot: string): RepoLevelFinding[] {
  const findings: RepoLevelFinding[] = [];
  const filePath = prefixFilePath(entry.file, projectRoot);

  for (const finding of entry.files ?? []) {
    findings.push({
      filePath,
      projectRoot,
      findingType: "unused_file",
      sourceTool: "knip",
      rawOutput: finding,
    });
  }

  for (const finding of entry.exports ?? []) {
    const line = lineFromFinding(finding);
    const symbolName = nameFromFinding(finding);
    findings.push({
      filePath,
      projectRoot,
      ...(line === undefined ? {} : { lineStart: line }),
      ...(symbolName === undefined ? {} : { symbolName }),
      findingType: "unused_export",
      sourceTool: "knip",
      rawOutput: finding,
    });
  }

  // Knip's `types` category means the type's export is unused, not necessarily
  // that the declaration is unused within its own module. Keep it distinct from
  // unused_export so Confidence cannot recommend deleting an internally-used type.
  for (const finding of entry.types ?? []) {
    const line = lineFromFinding(finding);
    const symbolName = nameFromFinding(finding);
    findings.push({
      filePath,
      projectRoot,
      ...(line === undefined ? {} : { lineStart: line }),
      ...(symbolName === undefined ? {} : { symbolName }),
      findingType: "unused_exported_type",
      sourceTool: "knip",
      rawOutput: finding,
    });
  }

  for (const finding of entry.dependencies ?? []) {
    findings.push({
      filePath,
      projectRoot,
      findingType: "unused_dependency",
      sourceTool: "knip",
      rawOutput: finding,
    });
  }

  for (const finding of entry.devDependencies ?? []) {
    findings.push({
      filePath,
      projectRoot,
      findingType: "unused_dev_dependency",
      sourceTool: "knip",
      rawOutput: finding,
    });
  }

  for (const finding of entry.optionalPeerDependencies ?? []) {
    findings.push({
      filePath,
      projectRoot,
      findingType: "unused_optional_peer_dependency",
      sourceTool: "knip",
      rawOutput: finding,
    });
  }

  for (const finding of entry.binaries ?? []) {
    findings.push({
      filePath,
      projectRoot,
      findingType: "unlisted_binary",
      sourceTool: "knip",
      rawOutput: finding,
    });
  }

  for (const finding of entry.unlisted ?? []) {
    findings.push({
      filePath,
      projectRoot,
      findingType: "unlisted_dependency",
      sourceTool: "knip",
      rawOutput: finding,
    });
  }

  return findings;
}

export function parseKnipOutput(
  output: string,
  projectRoot: string,
): RepoLevelFinding[] {
  return parseReport(output).flatMap((entry) => mapEntry(entry, projectRoot));
}

async function analyzeProject(projectRoot: KnipProjectRoot): Promise<RepoLevelFinding[]> {
  try {
    const { stdout } = await execFileAsync(
      "npx",
      ["knip", "--reporter", "json", "--no-exit-code"],
      {
        cwd: projectRoot.absolutePath,
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
      },
    );

    return parseKnipOutput(stdout, projectRoot.relativePath);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Knip analysis failed for ${projectRoot.absolutePath}: ${message}`);
    throw new Error(`Knip analysis failed for ${projectRoot.absolutePath}: ${message}`);
  }
}

export const knipAnalyzer: RepoLevelAnalyzer = {
  name: "knip",

  canAnalyze(repoRootPath: string): boolean {
    return findProjectRoots(repoRootPath).length > 0;
  },

  async analyze(repoRootPath: string): Promise<RepoLevelFinding[]> {
    const findings = await Promise.all(findProjectRoots(repoRootPath).map(analyzeProject));
    return findings.flat();
  },
};

