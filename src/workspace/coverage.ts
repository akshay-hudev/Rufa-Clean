import { digestCanonical } from "../milestone/canonical";
import type {
  CrossPackageReference,
  PackageCoverage,
  PackageGraph,
  WorkspaceCoverage,
  WorkspacePackage,
} from "./types";

export function evaluatePackageCoverage(input: {
  pkg: WorkspacePackage;
  graph: PackageGraph;
  references: readonly CrossPackageReference[];
}): PackageCoverage {
  const reasons = [...input.pkg.reasons];
  if (input.pkg.support === "failed") {
    return {
      packageIdentityDigest: input.pkg.identity.packageIdentityDigest,
      status: "failed",
      reasons,
      coverageDigest: digestCanonical({
        package: input.pkg.identity.packageIdentityDigest,
        status: "failed",
        reasons,
      }),
    };
  }
  if (input.pkg.support === "excluded_irrelevant") {
    return {
      packageIdentityDigest: input.pkg.identity.packageIdentityDigest,
      status: "excluded",
      reasons,
      coverageDigest: digestCanonical({
        package: input.pkg.identity.packageIdentityDigest,
        status: "excluded",
        reasons,
      }),
    };
  }
  if (input.pkg.support === "unsupported" || input.pkg.support === "configuration_required") {
    return {
      packageIdentityDigest: input.pkg.identity.packageIdentityDigest,
      status: input.pkg.support === "unsupported" ? "unsupported" : "partial",
      reasons,
      coverageDigest: digestCanonical({
        package: input.pkg.identity.packageIdentityDigest,
        status: input.pkg.support,
        reasons,
      }),
    };
  }
  const unresolved = input.graph.edges.filter(
    (edge) =>
      edge.fromPackageIdentityDigest === input.pkg.identity.packageIdentityDigest &&
      edge.status === "unresolved",
  );
  if (unresolved.length) reasons.push("unresolved_workspace_dependency");
  const ambiguousRefs = input.references.filter(
    (reference) =>
      reference.sourcePackageIdentityDigest === input.pkg.identity.packageIdentityDigest &&
      (reference.status === "ambiguous" || reference.status === "unresolved"),
  );
  if (ambiguousRefs.length) reasons.push("ambiguous_or_unresolved_references");
  const status = reasons.length ? "partial" : "complete";
  return {
    packageIdentityDigest: input.pkg.identity.packageIdentityDigest,
    status,
    reasons: reasons.sort(),
    coverageDigest: digestCanonical({
      package: input.pkg.identity.packageIdentityDigest,
      status,
      reasons: reasons.sort(),
    }),
  };
}

export function aggregateWorkspaceCoverage(
  packages: readonly WorkspacePackage[],
  packageCoverages: readonly PackageCoverage[],
): WorkspaceCoverage {
  const required = packages.filter((item) => item.support !== "excluded_irrelevant");
  const byDigest = new Map(
    packageCoverages.map((item) => [item.packageIdentityDigest, item]),
  );
  const reasons: string[] = [];
  let failed = false;
  let partial = false;
  for (const item of required) {
    const coverage = byDigest.get(item.identity.packageIdentityDigest);
    if (!coverage) {
      reasons.push(`missing_coverage:${item.identity.packageName}`);
      failed = true;
      continue;
    }
    if (coverage.status === "failed") {
      failed = true;
      reasons.push(`failed_package:${item.identity.packageName}`);
    } else if (coverage.status !== "complete" && coverage.status !== "excluded") {
      partial = true;
      reasons.push(`incomplete_package:${item.identity.packageName}`);
    }
  }
  const status = failed ? "failed" : partial || reasons.length ? "incomplete" : "complete";
  return {
    status,
    packageCoverages: [...packageCoverages].sort((left, right) =>
      left.packageIdentityDigest.localeCompare(right.packageIdentityDigest),
    ),
    coverageDigest: digestCanonical({
      status,
      packages: packageCoverages.map((item) => item.coverageDigest).sort(),
      reasons: reasons.sort(),
    }),
    reasons: reasons.sort(),
  };
}

export function mayClassifyCandidateDead(coverage: WorkspaceCoverage): boolean {
  return coverage.status === "complete";
}
