import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { resolvePackageByName } from "./packages";
import {
  graphDigest,
  type PackageGraph,
  type PackageGraphEdge,
  type WorkspacePackage,
} from "./types";

function edgesFor(
  from: WorkspacePackage,
  map: Record<string, string>,
  kind: PackageGraphEdge["kind"],
  packages: readonly WorkspacePackage[],
): PackageGraphEdge[] {
  return Object.keys(map).sort().map((name) => {
    const target = resolvePackageByName(packages, name);
    if (!target) {
      const workspaceProtocol = map[name]?.startsWith("workspace:");
      return {
        fromPackageIdentityDigest: from.identity.packageIdentityDigest,
        toPackageName: name,
        kind,
        status: workspaceProtocol ? "unresolved" as const : "external" as const,
      };
    }
    return {
      fromPackageIdentityDigest: from.identity.packageIdentityDigest,
      toPackageIdentityDigest: target.identity.packageIdentityDigest,
      toPackageName: name,
      kind,
      status: "resolved" as const,
    };
  });
}

export function buildPackageGraph(packages: readonly WorkspacePackage[]): PackageGraph {
  const edges: PackageGraphEdge[] = [];
  for (const item of packages) {
    edges.push(
      ...edgesFor(item, item.dependencies, "runtime", packages),
      ...edgesFor(item, item.devDependencies, "development", packages),
      ...edgesFor(item, item.peerDependencies, "peer", packages),
      ...edgesFor(item, item.optionalDependencies, "optional", packages),
    );
  }
  const nodes = packages.map((item) => item.identity);
  return {
    nodes,
    edges: edges.sort((left, right) =>
      `${left.fromPackageIdentityDigest}:${left.toPackageName}:${left.kind}`
        .localeCompare(
          `${right.fromPackageIdentityDigest}:${right.toPackageName}:${right.kind}`,
        ),
    ),
    graphDigest: graphDigest(nodes, edges),
    unresolvedRequiredEdgeCount: edges.filter((edge) => edge.status === "unresolved").length,
  };
}

export async function evaluateLockfileConsistency(input: {
  root: string;
  packages: readonly WorkspacePackage[];
}): Promise<{ consistent: boolean; reasons: string[] }> {
  const reasons: string[] = [];
  let lockRaw: string;
  try {
    lockRaw = await readFile(join(input.root, "package-lock.json"), "utf8");
  } catch {
    return { consistent: false, reasons: ["missing_package_lock"] };
  }
  let lock: { lockfileVersion?: unknown; packages?: Record<string, unknown> };
  try {
    lock = JSON.parse(lockRaw) as { lockfileVersion?: unknown; packages?: Record<string, unknown> };
  } catch {
    return { consistent: false, reasons: ["malformed_package_lock"] };
  }
  if (lock.lockfileVersion !== 2 && lock.lockfileVersion !== 3) {
    reasons.push(`unsupported_lockfile_version:${String(lock.lockfileVersion)}`);
  }
  const lockPackages = lock.packages ?? {};
  for (const item of input.packages) {
    if (item.identity.packageRoot === ".") continue;
    const key = item.identity.packageRoot;
    if (!(key in lockPackages) && !(`node_modules/${item.identity.packageName}` in lockPackages)) {
      reasons.push(`lockfile_missing_package:${item.identity.packageName}`);
    }
  }
  return { consistent: reasons.length === 0, reasons: reasons.sort() };
}
