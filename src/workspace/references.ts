import { readFile, readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";

import { packageContainingPath, resolvePackageByName } from "./packages";
import type { CrossPackageReference, WorkspacePackage } from "./types";

function portable(value: string): string {
  return value.split(sep).join("/");
}

const IMPORT_RE =
  /(?:import|export)\s+(?:type\s+)?(?:[^"'`]+?\s+from\s+)?["']([^"']+)["']|require\(\s*["']([^"']+)["']\s*\)/g;

async function listTsFiles(root: string, packageRoot: string): Promise<string[]> {
  const absoluteRoot = packageRoot === "." ? root : join(root, packageRoot);
  const files: string[] = [];
  async function walk(current: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (["node_modules", "dist", "build", "coverage", ".git"].includes(entry.name)) continue;
      const absolute = join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(absolute);
        continue;
      }
      if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith(".d.ts")) {
        files.push(portable(relative(root, absolute)));
      }
    }
  }
  await walk(absoluteRoot);
  return files.sort();
}

export async function collectCrossPackageReferences(input: {
  root: string;
  packages: readonly WorkspacePackage[];
}): Promise<CrossPackageReference[]> {
  const references: CrossPackageReference[] = [];
  for (const item of input.packages) {
    const files = await listTsFiles(input.root, item.identity.packageRoot);
    for (const filePath of files) {
      let source: string;
      try {
        source = await readFile(join(input.root, filePath), "utf8");
      } catch {
        continue;
      }
      for (const match of source.matchAll(IMPORT_RE)) {
        const specifier = match[1] ?? match[2];
        if (!specifier) continue;
        if (specifier.startsWith(".")) {
          const sourcePackage = packageContainingPath(input.packages, filePath);
          const resolvedRelative = portable(join(filePath, "..", specifier));
          const targetPackage = packageContainingPath(input.packages, resolvedRelative);
          if (
            sourcePackage &&
            targetPackage &&
            sourcePackage.identity.packageIdentityDigest !==
              targetPackage.identity.packageIdentityDigest
          ) {
            references.push({
              sourcePackageIdentityDigest: sourcePackage.identity.packageIdentityDigest,
              targetPackageIdentityDigest: targetPackage.identity.packageIdentityDigest,
              sourcePath: filePath,
              specifier,
              kind: "relative_cross_root",
              status: "resolved",
            });
          }
          continue;
        }
        if (specifier.startsWith("#") || specifier.startsWith("@/")) {
          references.push({
            sourcePackageIdentityDigest: item.identity.packageIdentityDigest,
            sourcePath: filePath,
            specifier,
            kind: "path_alias",
            status: "ambiguous",
          });
          continue;
        }
        const bareName = specifier.startsWith("@")
          ? specifier.split("/").slice(0, 2).join("/")
          : (specifier.split("/")[0] ?? specifier);
        const target = resolvePackageByName(input.packages, bareName);
        if (target) {
          references.push({
            sourcePackageIdentityDigest: item.identity.packageIdentityDigest,
            targetPackageIdentityDigest: target.identity.packageIdentityDigest,
            sourcePath: filePath,
            specifier,
            kind: specifier === bareName ? "package_name" : "subpath",
            status: "resolved",
          });
        } else {
          references.push({
            sourcePackageIdentityDigest: item.identity.packageIdentityDigest,
            sourcePath: filePath,
            specifier,
            kind: "unresolved",
            status: "external_unknown",
          });
        }
      }
    }
  }
  return references.sort((left, right) =>
    `${left.sourcePath}:${left.specifier}`.localeCompare(`${right.sourcePath}:${right.specifier}`),
  );
}

export function evaluatePathAliases(packages: readonly WorkspacePackage[]): {
  supported: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  for (const item of packages) {
    if (item.tsconfigPaths.length) {
      reasons.push(`configured_path_alias:${item.identity.packageName}`);
    }
  }
  return { supported: reasons.length === 0, reasons };
}

export function evaluatePackageExports(packages: readonly WorkspacePackage[]): {
  reasons: string[];
} {
  const reasons: string[] = [];
  for (const item of packages) {
    if (item.exports && typeof item.exports === "object") {
      const conditional = JSON.stringify(item.exports).includes("import") ||
        JSON.stringify(item.exports).includes("require");
      if (conditional && !item.private) {
        reasons.push(`public_export_conditions:${item.identity.packageName}`);
      }
    }
  }
  return { reasons: reasons.sort() };
}
