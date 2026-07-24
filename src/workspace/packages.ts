import { lstat, readFile, readdir, realpath } from "node:fs/promises";
import { isAbsolute, join, relative, resolve, sep } from "node:path";

import {
  manifestDigest,
  packageIdentityDigest,
  type CanonicalPackageIdentity,
  type PackageSupportStatus,
  type WorkspacePackage,
} from "./types";

function portable(value: string): string {
  return value.split(sep).join("/");
}

function within(root: string, candidate: string): boolean {
  const child = relative(root, candidate);
  return child === "" || (!child.startsWith("..") && !isAbsolute(child));
}

async function safeReadJson(path: string): Promise<{ raw: string; value: Record<string, unknown> } | null> {
  try {
    const metadata = await lstat(path);
    if (metadata.isSymbolicLink()) {
      const target = await realpath(path);
      // caller must validate confinement
      void target;
    }
    const raw = await readFile(path, "utf8");
    return { raw, value: JSON.parse(raw) as Record<string, unknown> };
  } catch {
    return null;
  }
}

function dependencyMap(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") return {};
  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (typeof entry === "string") result[key] = entry;
  }
  return result;
}

function defaultRoots(kind: "source" | "test" | "generated" | "excluded"): string[] {
  if (kind === "source") return ["src"];
  if (kind === "test") return ["test", "tests", "__tests__"];
  if (kind === "generated") return ["generated", "src/generated"];
  return ["node_modules", "dist", "build", "coverage"];
}

export async function inventoryWorkspacePackages(input: {
  root: string;
  repositoryFullName: string;
  resolvedCommit: string;
  matchedRoots: readonly string[];
}): Promise<{
  packages: WorkspacePackage[];
  duplicateNames: string[];
  blockers: string[];
  warnings: string[];
}> {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const packages: WorkspacePackage[] = [];
  const candidates = ["", ...input.matchedRoots];

  for (const packageRoot of candidates) {
    const absoluteManifest = join(input.root, packageRoot, "package.json");
    try {
      const metadata = await lstat(absoluteManifest);
      if (metadata.isSymbolicLink()) {
        const target = await realpath(absoluteManifest);
        if (!within(input.root, target)) {
          blockers.push(`symlink_escape:${portable(packageRoot) || "."}`);
          continue;
        }
      }
    } catch {
      if (packageRoot === "") blockers.push("missing_root_package_json");
      else warnings.push(`missing_package_manifest:${portable(packageRoot)}`);
      continue;
    }

    const parsed = await safeReadJson(absoluteManifest);
    if (!parsed) {
      blockers.push(`malformed_package_manifest:${portable(packageRoot) || "."}`);
      continue;
    }
    const name = typeof parsed.value.name === "string" ? parsed.value.name : "";
    if (!name) {
      blockers.push(`missing_package_name:${portable(packageRoot) || "."}`);
      continue;
    }

    const identity: CanonicalPackageIdentity = {
      repositoryFullName: input.repositoryFullName,
      resolvedCommit: input.resolvedCommit,
      packageRoot: portable(packageRoot) || ".",
      packageName: name,
      manifestDigest: manifestDigest(parsed.raw),
      packageIdentityDigest: "",
    };
    identity.packageIdentityDigest = packageIdentityDigest(identity);

    let support: PackageSupportStatus = "supported";
    const reasons: string[] = [];
    const tsconfigPath = join(input.root, packageRoot, "tsconfig.json");
    try {
      await lstat(tsconfigPath);
    } catch {
      if (packageRoot !== "") {
        support = "configuration_required";
        reasons.push("missing_package_tsconfig");
      }
    }

    packages.push({
      identity,
      private: parsed.value.private === true,
      ...(typeof parsed.value.version === "string" ? { version: parsed.value.version } : {}),
      support,
      reasons,
      sourceRoots: defaultRoots("source").map((path) =>
        identity.packageRoot === "." ? path : `${identity.packageRoot}/${path}`,
      ),
      testRoots: defaultRoots("test").map((path) =>
        identity.packageRoot === "." ? path : `${identity.packageRoot}/${path}`,
      ),
      generatedRoots: defaultRoots("generated").map((path) =>
        identity.packageRoot === "." ? path : `${identity.packageRoot}/${path}`,
      ),
      excludedRoots: defaultRoots("excluded").map((path) =>
        identity.packageRoot === "." ? path : `${identity.packageRoot}/${path}`,
      ),
      dependencies: dependencyMap(parsed.value.dependencies),
      devDependencies: dependencyMap(parsed.value.devDependencies),
      peerDependencies: dependencyMap(parsed.value.peerDependencies),
      optionalDependencies: dependencyMap(parsed.value.optionalDependencies),
      ...(parsed.value.exports !== undefined ? { exports: parsed.value.exports } : {}),
      tsconfigPaths: [],
    });
  }

  // Undeclared nested manifests are not auto-members.
  async function findUndeclared(current: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if ([".git", "node_modules", ".dca-output", "dist", "build", "coverage"].includes(entry.name)) {
        continue;
      }
      const absolute = join(current, entry.name);
      if (entry.isDirectory()) {
        await findUndeclared(absolute);
        continue;
      }
      if (entry.name !== "package.json") continue;
      const relativePath = portable(relative(input.root, absolute));
      const packageRoot = relativePath === "package.json"
        ? "."
        : relativePath.slice(0, -"/package.json".length);
      if (packages.some((item) => item.identity.packageRoot === packageRoot)) continue;
      if (packageRoot.includes("fixtures") || packageRoot.includes("examples") || packageRoot.includes("vendor")) {
        warnings.push(`undeclared_nested_manifest:${packageRoot}`);
      } else {
        warnings.push(`undeclared_nested_manifest:${packageRoot}`);
      }
    }
  }
  await findUndeclared(input.root);

  const byName = new Map<string, number>();
  for (const item of packages) {
    byName.set(item.identity.packageName, (byName.get(item.identity.packageName) ?? 0) + 1);
  }
  const duplicateNames = [...byName.entries()].filter(([, count]) => count > 1).map(([name]) => name).sort();
  if (duplicateNames.length) {
    blockers.push(...duplicateNames.map((name) => `duplicate_package_name:${name}`));
    for (const item of packages) {
      if (duplicateNames.includes(item.identity.packageName)) {
        item.support = "configuration_required";
        item.reasons = [...new Set([...item.reasons, "duplicate_package_name"])].sort();
      }
    }
  }

  return {
    packages: packages.sort((left, right) =>
      left.identity.packageRoot.localeCompare(right.identity.packageRoot),
    ),
    duplicateNames,
    blockers: [...new Set(blockers)].sort(),
    warnings: [...new Set(warnings)].sort(),
  };
}

export function resolvePackageByName(
  packages: readonly WorkspacePackage[],
  name: string,
): WorkspacePackage | undefined {
  const matches = packages.filter((item) => item.identity.packageName === name);
  return matches.length === 1 ? matches[0] : undefined;
}

export function packageContainingPath(
  packages: readonly WorkspacePackage[],
  filePath: string,
): WorkspacePackage | undefined {
  const portablePath = portable(filePath);
  const ordered = [...packages].sort(
    (left, right) => right.identity.packageRoot.length - left.identity.packageRoot.length,
  );
  for (const item of ordered) {
    if (item.identity.packageRoot === ".") {
      if (!portablePath.includes("/") || packages.every((candidate) =>
        candidate.identity.packageRoot === "." ||
        !portablePath.startsWith(`${candidate.identity.packageRoot}/`)
      )) {
        return item;
      }
      continue;
    }
    if (
      portablePath === item.identity.packageRoot ||
      portablePath.startsWith(`${item.identity.packageRoot}/`)
    ) {
      return item;
    }
  }
  return undefined;
}

export function assertWithinRepository(root: string, candidate: string): boolean {
  return within(resolve(root), resolve(candidate));
}
