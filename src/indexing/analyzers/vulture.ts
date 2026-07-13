import { execFile } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";

import type { RepoLevelAnalyzer, RepoLevelFinding } from "./types";

const PYTHON_PROJECT_SUBDIRECTORIES = ["backend", "src", "app"];
const PYTHON_MANIFESTS = ["requirements.txt", "pyproject.toml"];
const VULTURE_OUTPUT_PATTERN = /^(.*):(\d+): (.+) \((\d+)% confidence\)$/;

function hasPythonMarker(directoryPath: string): boolean {
  if (PYTHON_MANIFESTS.some((manifest) => existsSync(join(directoryPath, manifest)))) {
    return true;
  }

  try {
    return readdirSync(directoryPath, { withFileTypes: true }).some(
      (entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".py"),
    );
  } catch {
    return false;
  }
}

function findProjectRoots(repoRootPath: string): string[] {
  if (hasPythonMarker(repoRootPath)) {
    return ["."];
  }

  return PYTHON_PROJECT_SUBDIRECTORIES.filter((directory) =>
    hasPythonMarker(join(repoRootPath, directory))
  );
}

function runVulture(repoRootPath: string): Promise<string> {
  return new Promise((resolveOutput, reject) => {
    execFile(
      "vulture",
      [repoRootPath, "--min-confidence", "60"],
      {
        cwd: repoRootPath,
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
      },
      (error, stdout) => {
        // Vulture uses exit code 3 to indicate that dead code was found.
        if (!error || error.code === 3) {
          resolveOutput(stdout);
          return;
        }
        reject(error);
      },
    );
  });
}

function toRepoRelativePath(reportedPath: string, repoRootPath: string): string {
  const absolutePath = isAbsolute(reportedPath)
    ? reportedPath
    : resolve(repoRootPath, reportedPath);
  return relative(repoRootPath, absolutePath).replaceAll("\\", "/");
}

function projectRootForFile(filePath: string, projectRoots: string[]): string {
  if (projectRoots.includes(".")) {
    return ".";
  }

  return projectRoots.find(
    (projectRoot) => filePath === projectRoot || filePath.startsWith(`${projectRoot}/`),
  ) ?? ".";
}

function symbolNameFromDescription(description: string): string | undefined {
  const match = /^unused .+ '([^']+)'$/.exec(description);
  return match?.[1];
}

function parseOutput(
  output: string,
  repoRootPath: string,
  projectRoots: string[],
): RepoLevelFinding[] {
  return output.split(/\r?\n/).flatMap((outputLine): RepoLevelFinding[] => {
    if (!outputLine.trim()) {
      return [];
    }

    const match = VULTURE_OUTPUT_PATTERN.exec(outputLine);
    if (!match) {
      throw new Error(`Unexpected Vulture output: ${outputLine}`);
    }

    const [, reportedPath, lineText, description, confidenceText] = match;
    if (!reportedPath || !lineText || !description || !confidenceText) {
      throw new Error(`Incomplete Vulture output: ${outputLine}`);
    }

    const filePath = toRepoRelativePath(reportedPath, repoRootPath);
    const symbolName = symbolNameFromDescription(description);
    const confidence = Number(confidenceText);

    return [{
      filePath,
      projectRoot: projectRootForFile(filePath, projectRoots),
      lineStart: Number(lineText),
      ...(symbolName === undefined ? {} : { symbolName }),
      findingType: "unreachable",
      sourceTool: "vulture",
      rawOutput: {
        text: outputLine,
        confidence,
      },
    }];
  });
}

export const vultureAnalyzer: RepoLevelAnalyzer = {
  name: "vulture",

  canAnalyze(repoRootPath: string): boolean {
    return findProjectRoots(repoRootPath).length > 0;
  },

  async analyze(repoRootPath: string): Promise<RepoLevelFinding[]> {
    try {
      const projectRoots = findProjectRoots(repoRootPath);
      if (projectRoots.length === 0) {
        return [];
      }
      const output = await runVulture(repoRootPath);
      return parseOutput(output, repoRootPath, projectRoots);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Vulture analysis failed for ${repoRootPath}: ${message}`);
      return [];
    }
  },
};

export default vultureAnalyzer;
