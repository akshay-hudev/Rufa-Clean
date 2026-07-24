import { digestCanonical, sha256 } from "../milestone/canonical";
import type { CanonicalRepositoryIdentity } from "../qualification/types";

export const PHASE_3A_CAPABILITY_IDS = [
  "repository.npm-workspace.qualify.v1",
  "workspace.npm.discover.v1",
  "workspace.npm.package-inventory.v1",
  "workspace.npm.package-graph.v1",
  "workspace.npm.package-roots.v1",
  "analysis.typescript.cross-workspace-references.v1",
  "analysis.typescript.package-exports.v1",
  "analysis.typescript.project-references.v1",
  "analysis.typescript.path-aliases.v1",
  "coverage.typescript.npm-workspace.v1",
  "verification.npm-workspace.package-gates.v1",
  "verification.npm-workspace.aggregate-gates.v1",
  "remediation.typescript.npm-workspace.private-function-delete.v1",
] as const;

export type Phase3aCapabilityId = (typeof PHASE_3A_CAPABILITY_IDS)[number];

export type WorkspaceQualificationStatus =
  | "ready"
  | "ready_with_limited_packages"
  | "configuration_required"
  | "baseline_broken"
  | "partially_supported"
  | "unsupported"
  | "inaccessible"
  | "failed"
  | "stale"
  | "security_blocked"
  | "authorization_rejected";

export type PackageSupportStatus =
  | "supported"
  | "unsupported"
  | "excluded_irrelevant"
  | "inaccessible"
  | "failed"
  | "stale"
  | "configuration_required";

export interface WorkspaceDeclaration {
  location: "package.json#workspaces";
  patterns: string[];
  declarationDigest: string;
  support: "supported" | "unsupported" | "configuration_required";
  reasons: string[];
}

export interface CanonicalPackageIdentity {
  repositoryFullName: string;
  resolvedCommit: string;
  packageRoot: string;
  packageName: string;
  manifestDigest: string;
  packageIdentityDigest: string;
}

export interface WorkspacePackage {
  identity: CanonicalPackageIdentity;
  private: boolean;
  version?: string;
  support: PackageSupportStatus;
  reasons: string[];
  sourceRoots: string[];
  testRoots: string[];
  generatedRoots: string[];
  excludedRoots: string[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  optionalDependencies: Record<string, string>;
  exports?: unknown;
  tsconfigPaths: string[];
}

export type GraphEdgeKind = "runtime" | "development" | "peer" | "optional" | "root";

export interface PackageGraphEdge {
  fromPackageIdentityDigest: string;
  toPackageIdentityDigest?: string;
  toPackageName: string;
  kind: GraphEdgeKind;
  status: "resolved" | "unresolved" | "external";
}

export interface PackageGraph {
  nodes: CanonicalPackageIdentity[];
  edges: PackageGraphEdge[];
  graphDigest: string;
  unresolvedRequiredEdgeCount: number;
}

export interface CrossPackageReference {
  sourcePackageIdentityDigest: string;
  targetPackageIdentityDigest?: string;
  sourcePath: string;
  specifier: string;
  kind: "package_name" | "subpath" | "relative_cross_root" | "path_alias" | "unresolved";
  status: "resolved" | "ambiguous" | "unresolved" | "external_unknown";
}

export interface PackageCoverage {
  packageIdentityDigest: string;
  status: "complete" | "partial" | "failed" | "unsupported" | "stale" | "excluded";
  reasons: string[];
  coverageDigest: string;
}

export interface WorkspaceCoverage {
  status: "complete" | "partial" | "failed" | "incomplete";
  packageCoverages: PackageCoverage[];
  coverageDigest: string;
  reasons: string[];
}

export interface PackageGateResult {
  packageIdentityDigest: string;
  gateId: "typecheck" | "build" | "test";
  status: "passed" | "failed" | "unavailable" | "skipped" | "security_blocked";
  resultDigest: string;
}

export type CapabilityRouteStatus =
  | "enabled"
  | "enabled_with_limits"
  | "configuration_required"
  | "blocked_by_baseline"
  | "blocked_by_security"
  | "unsupported"
  | "unavailable"
  | "stale"
  | "remediation_disabled";

export interface WorkspaceCapabilityRoute {
  capabilityId: Phase3aCapabilityId;
  status: CapabilityRouteStatus;
  reasons: string[];
}

export interface WorkspaceQualificationResult {
  schemaVersion: "1";
  profileId: "typescript-npm-workspace-v1";
  requestId: string;
  requestDigest: string;
  repository: CanonicalRepositoryIdentity;
  resolvedCommit: string;
  sourceSnapshotId: string;
  declaration?: WorkspaceDeclaration;
  packages: WorkspacePackage[];
  graph: PackageGraph;
  references: CrossPackageReference[];
  coverage: WorkspaceCoverage;
  packageGates: PackageGateResult[];
  aggregateGates: PackageGateResult[];
  capabilityRoutes: WorkspaceCapabilityRoute[];
  blockers: string[];
  warnings: string[];
  status: WorkspaceQualificationStatus;
  qualificationDigest: string;
  remediationAuthorized: false;
  publicationAuthorized: false;
}

export function packageIdentityDigest(input: {
  repositoryFullName: string;
  resolvedCommit: string;
  packageRoot: string;
  packageName: string;
  manifestDigest: string;
}): string {
  return digestCanonical({
    repositoryFullName: input.repositoryFullName.toLowerCase(),
    resolvedCommit: input.resolvedCommit.toLowerCase(),
    packageRoot: input.packageRoot,
    packageName: input.packageName,
    manifestDigest: input.manifestDigest,
  });
}

export function graphDigest(nodes: CanonicalPackageIdentity[], edges: PackageGraphEdge[]): string {
  return digestCanonical({
    nodes: [...nodes]
      .map((node) => node.packageIdentityDigest)
      .sort(),
    edges: [...edges]
      .map((edge) => ({
        from: edge.fromPackageIdentityDigest,
        to: edge.toPackageIdentityDigest ?? null,
        name: edge.toPackageName,
        kind: edge.kind,
        status: edge.status,
      }))
      .sort((left, right) =>
        `${left.from}:${left.name}:${left.kind}`.localeCompare(
          `${right.from}:${right.name}:${right.kind}`,
        ),
      ),
  });
}

export function manifestDigest(raw: string): string {
  return sha256(raw);
}
