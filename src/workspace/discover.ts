import { lstat, readFile, readdir, realpath } from "node:fs/promises";
import { isAbsolute, join, relative, resolve, sep } from "node:path";

import { digestCanonical } from "../milestone/canonical";
import type { WorkspaceDeclaration } from "./types";

function portable(value: string): string {
  return value.split(sep).join("/");
}

function within(root: string, candidate: string): boolean {
  const child = relative(root, candidate);
  return child === "" || (!child.startsWith("..") && !isAbsolute(child));
}

export function matchWorkspacePattern(pattern: string, candidate: string): boolean {
  const normalizedPattern = portable(pattern).replace(/^\.\//, "");
  const normalizedCandidate = portable(candidate).replace(/^\.\//, "");
  if (normalizedPattern.includes("**")) {
    const parts = normalizedPattern.split("**");
    const prefix = parts[0] ?? "";
    const suffix = parts[1] ?? "";
    if (!normalizedCandidate.startsWith(prefix.replace(/\/$/, ""))) return false;
    if (!suffix || suffix === "/") return true;
    return normalizedCandidate.endsWith(suffix.replace(/^\//, ""));
  }
  if (!normalizedPattern.includes("*")) {
    return normalizedCandidate === normalizedPattern ||
      normalizedCandidate.startsWith(`${normalizedPattern}/`);
  }
  const regex = new RegExp(
    `^${normalizedPattern
      .split("*")
      .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
      .join("[^/]*")}$`,
  );
  return regex.test(normalizedCandidate);
}

export function validateWorkspacePattern(pattern: string): string[] {
  const reasons: string[] = [];
  const normalized = portable(pattern);
  if (!normalized || normalized.trim() !== normalized) reasons.push("empty_or_padded_pattern");
  if (isAbsolute(normalized) || normalized.startsWith("/")) reasons.push("absolute_pattern");
  if (normalized.split("/").includes("..")) reasons.push("parent_directory_escape");
  if (normalized.includes("node_modules")) reasons.push("dependency_directory_pattern");
  if ((normalized.match(/\*/g) ?? []).length > 2) reasons.push("unbounded_glob");
  return reasons;
}

async function listDirectories(root: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(current: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name === ".git" || entry.name === "node_modules" || entry.name === ".dca-output") {
        continue;
      }
      const absolute = join(current, entry.name);
      try {
        if (entry.isSymbolicLink()) {
          const target = await realpath(absolute);
          if (!within(root, target)) continue;
        }
      } catch {
        continue;
      }
      if (entry.isDirectory() || entry.isSymbolicLink()) {
        const relativePath = portable(relative(root, absolute));
        if (entry.isDirectory()) {
          out.push(relativePath);
          await walk(absolute);
        } else {
          try {
            const stats = await lstat(absolute);
            if (stats.isDirectory()) {
              out.push(relativePath);
              await walk(absolute);
            }
          } catch {
            continue;
          }
        }
      }
    }
  }
  await walk(root);
  return out.sort();
}

export async function discoverNpmWorkspace(root: string): Promise<{
  declaration?: WorkspaceDeclaration;
  matchedRoots: string[];
  blockers: string[];
  warnings: string[];
  packageManagerSignals: string[];
}> {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const packageManagerSignals: string[] = [];
  const rootFiles = new Set(await readdir(root));

  if (rootFiles.has("pnpm-workspace.yaml") || rootFiles.has("pnpm-lock.yaml")) {
    packageManagerSignals.push("pnpm");
  }
  if (rootFiles.has("yarn.lock") || rootFiles.has(".yarnrc.yml")) {
    packageManagerSignals.push("yarn");
  }
  if (rootFiles.has("lerna.json")) {
    warnings.push("lerna_detected");
  }

  let manifestRaw: string;
  try {
    manifestRaw = await readFile(join(root, "package.json"), "utf8");
  } catch {
    return {
      blockers: ["missing_root_package_json"],
      warnings,
      packageManagerSignals,
      matchedRoots: [],
    };
  }

  let manifest: Record<string, unknown>;
  try {
    manifest = JSON.parse(manifestRaw) as Record<string, unknown>;
  } catch {
    return {
      blockers: ["malformed_root_package_json"],
      warnings,
      packageManagerSignals,
      matchedRoots: [],
    };
  }

  if (manifest.workspaces === undefined) {
    return {
      matchedRoots: [],
      blockers: packageManagerSignals.length
        ? ["unsupported_package_manager_workspace_without_npm_workspaces"]
        : [],
      warnings,
      packageManagerSignals,
    };
  }

  const patterns: string[] = [];
  if (Array.isArray(manifest.workspaces)) {
    for (const value of manifest.workspaces) {
      if (typeof value === "string") patterns.push(value);
      else blockers.push("non_string_workspace_pattern");
    }
  } else if (manifest.workspaces && typeof manifest.workspaces === "object") {
    const packages = (manifest.workspaces as { packages?: unknown }).packages;
    if (Array.isArray(packages)) {
      for (const value of packages) {
        if (typeof value === "string") patterns.push(value);
        else blockers.push("non_string_workspace_pattern");
      }
    } else {
      blockers.push("unsupported_workspaces_object_shape");
    }
  } else {
    blockers.push("unsupported_workspaces_declaration");
  }

  const patternReasons = patterns.flatMap((pattern) =>
    validateWorkspacePattern(pattern).map((reason) => `${reason}:${pattern}`),
  );
  const directories = await listDirectories(root);
  const matched = new Set<string>();
  for (const pattern of patterns) {
    if (validateWorkspacePattern(pattern).length > 0) continue;
    for (const directory of directories) {
      if (matchWorkspacePattern(pattern, directory)) matched.add(directory);
    }
  }

  const support = packageManagerSignals.length || patternReasons.length || blockers.length
    ? packageManagerSignals.length
      ? "unsupported"
      : "configuration_required"
    : patterns.length > 0
      ? "supported"
      : "configuration_required";

  if (packageManagerSignals.includes("pnpm")) blockers.push("pnpm_workspace_unsupported_in_phase_3a");
  if (packageManagerSignals.includes("yarn")) blockers.push("yarn_workspace_unsupported_in_phase_3a");
  blockers.push(...patternReasons);

  const declaration: WorkspaceDeclaration = {
    location: "package.json#workspaces",
    patterns: [...patterns].sort(),
    declarationDigest: digestCanonical({
      location: "package.json#workspaces",
      patterns: [...patterns].sort(),
      manifestDigest: digestCanonical(manifest),
    }),
    support,
    reasons: [...new Set([...blockers, ...warnings])].sort(),
  };

  return {
    declaration,
    matchedRoots: [...matched].sort(),
    blockers: [...new Set(blockers)].sort(),
    warnings: [...new Set(warnings)].sort(),
    packageManagerSignals,
  };
}
