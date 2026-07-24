import { access } from "node:fs/promises";
import { join } from "node:path";

import { digestCanonical } from "../milestone/canonical";
import { canonicalRepositoryIdentity } from "../qualification/qualify";
import type { CanonicalRepositoryIdentity } from "../qualification/types";
import { evaluatePackageCoverage, aggregateWorkspaceCoverage } from "./coverage";
import { discoverNpmWorkspace } from "./discover";
import { buildPackageGraph, evaluateLockfileConsistency } from "./graph";
import { inventoryWorkspacePackages } from "./packages";
import {
  collectCrossPackageReferences,
  evaluatePackageExports,
  evaluatePathAliases,
} from "./references";
import {
  PHASE_3A_CAPABILITY_IDS,
  type PackageGateResult,
  type Phase3aCapabilityId,
  type WorkspaceCapabilityRoute,
  type WorkspaceQualificationResult,
  type WorkspaceQualificationStatus,
} from "./types";

const COMMIT = /^[a-f0-9]{40}$/;

export function createWorkspaceQualificationRequest(input: {
  requestId: string;
  accountScopeId: string;
  authorizationId: string;
  repository: CanonicalRepositoryIdentity;
  requestedRevision: string;
  resolvedCommit: string;
  sourceSnapshotId: string;
  requestedAt: string;
}): { requestDigest: string } & typeof input {
  const repository = canonicalRepositoryIdentity(input.repository);
  if (
    !input.requestId.trim() ||
    !input.accountScopeId.trim() ||
    !input.authorizationId.trim() ||
    !COMMIT.test(input.resolvedCommit) ||
    !/^[a-f0-9]{64}$/.test(input.sourceSnapshotId)
  ) {
    throw new Error("invalid_workspace_qualification_request");
  }
  const material = {
    ...input,
    repository,
    resolvedCommit: input.resolvedCommit.toLowerCase(),
    profileId: "typescript-npm-workspace-v1" as const,
    capabilities: [...PHASE_3A_CAPABILITY_IDS],
  };
  return { ...input, repository, requestDigest: digestCanonical(material) };
}

function routeCapabilities(input: {
  status: WorkspaceQualificationStatus;
  blockers: string[];
  coverageComplete: boolean;
  remediationAuthorized: boolean;
}): WorkspaceCapabilityRoute[] {
  return PHASE_3A_CAPABILITY_IDS.map((capabilityId: Phase3aCapabilityId) => {
    if (input.status === "authorization_rejected") {
      return { capabilityId, status: "blocked_by_security", reasons: ["authorization_rejected"] };
    }
    if (input.status === "security_blocked") {
      return { capabilityId, status: "blocked_by_security", reasons: input.blockers };
    }
    if (input.status === "unsupported" || input.status === "configuration_required") {
      return {
        capabilityId,
        status: input.status === "unsupported" ? "unsupported" : "configuration_required",
        reasons: input.blockers,
      };
    }
    if (input.status === "baseline_broken") {
      return { capabilityId, status: "blocked_by_baseline", reasons: input.blockers };
    }
    if (capabilityId === "remediation.typescript.npm-workspace.private-function-delete.v1") {
      if (!input.remediationAuthorized) {
        return {
          capabilityId,
          status: "remediation_disabled",
          reasons: ["remediation_not_authorized_by_default"],
        };
      }
      if (!input.coverageComplete) {
        return {
          capabilityId,
          status: "blocked_by_baseline",
          reasons: ["incomplete_workspace_coverage"],
        };
      }
    }
    if (
      capabilityId.startsWith("analysis.") ||
      capabilityId.startsWith("coverage.") ||
      capabilityId.startsWith("verification.")
    ) {
      return {
        capabilityId,
        status: input.coverageComplete ? "enabled" : "enabled_with_limits",
        reasons: input.coverageComplete ? [] : ["coverage_incomplete"],
      };
    }
    return { capabilityId, status: "enabled", reasons: [] };
  });
}

export async function qualifyNpmWorkspace(input: {
  root: string;
  requestId: string;
  requestDigest: string;
  repository: {
    provider: string;
    owner: string;
    name: string;
    fullName?: string;
  };
  resolvedCommit: string;
  sourceSnapshotId: string;
  authorizationActive: boolean;
  targetAccessAllowed: boolean;
  remediationAuthorized?: boolean;
  publicationAuthorized?: boolean;
  packageGates?: PackageGateResult[];
  aggregateGates?: PackageGateResult[];
}): Promise<WorkspaceQualificationResult> {
  const repository = canonicalRepositoryIdentity(input.repository);
  const remediationAuthorized = false;
  const publicationAuthorized = false;
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!input.authorizationActive || !input.targetAccessAllowed) {
    const status = "authorization_rejected";
    const emptyGraph = { nodes: [], edges: [], graphDigest: digestCanonical([]), unresolvedRequiredEdgeCount: 0 };
    const coverage = {
      status: "failed" as const,
      packageCoverages: [],
      coverageDigest: digestCanonical({ status: "authorization_rejected" }),
      reasons: ["authorization_rejected"],
    };
    const result: WorkspaceQualificationResult = {
      schemaVersion: "1",
      profileId: "typescript-npm-workspace-v1",
      requestId: input.requestId,
      requestDigest: input.requestDigest,
      repository,
      resolvedCommit: input.resolvedCommit.toLowerCase(),
      sourceSnapshotId: input.sourceSnapshotId,
      packages: [],
      graph: emptyGraph,
      references: [],
      coverage,
      packageGates: [],
      aggregateGates: [],
      capabilityRoutes: routeCapabilities({
        status,
        blockers: ["authorization_rejected"],
        coverageComplete: false,
        remediationAuthorized,
      }),
      blockers: ["authorization_rejected"],
      warnings: [],
      status,
      qualificationDigest: "",
      remediationAuthorized,
      publicationAuthorized,
    };
    result.qualificationDigest = digestCanonical(result);
    return result;
  }

  try {
    await access(input.root);
  } catch {
    const status = "inaccessible";
    const emptyGraph = { nodes: [], edges: [], graphDigest: digestCanonical([]), unresolvedRequiredEdgeCount: 0 };
    const result: WorkspaceQualificationResult = {
      schemaVersion: "1",
      profileId: "typescript-npm-workspace-v1",
      requestId: input.requestId,
      requestDigest: input.requestDigest,
      repository,
      resolvedCommit: input.resolvedCommit.toLowerCase(),
      sourceSnapshotId: input.sourceSnapshotId,
      packages: [],
      graph: emptyGraph,
      references: [],
      coverage: {
        status: "failed",
        packageCoverages: [],
        coverageDigest: digestCanonical({ status: "inaccessible" }),
        reasons: ["workspace_root_inaccessible"],
      },
      packageGates: [],
      aggregateGates: [],
      capabilityRoutes: routeCapabilities({
        status,
        blockers: ["workspace_root_inaccessible"],
        coverageComplete: false,
        remediationAuthorized,
      }),
      blockers: ["workspace_root_inaccessible"],
      warnings: [],
      status,
      qualificationDigest: "",
      remediationAuthorized,
      publicationAuthorized,
    };
    result.qualificationDigest = digestCanonical(result);
    return result;
  }

  const discovery = await discoverNpmWorkspace(input.root);
  blockers.push(...discovery.blockers);
  warnings.push(...discovery.warnings);

  if (!discovery.declaration) {
    blockers.push("npm_workspace_declaration_missing");
  }

  const inventory = await inventoryWorkspacePackages({
    root: input.root,
    repositoryFullName: repository.fullName,
    resolvedCommit: input.resolvedCommit.toLowerCase(),
    matchedRoots: discovery.matchedRoots,
  });
  blockers.push(...inventory.blockers);
  warnings.push(...inventory.warnings);

  const graph = buildPackageGraph(inventory.packages);
  if (graph.unresolvedRequiredEdgeCount > 0) {
    blockers.push("unresolved_required_workspace_edges");
  }

  const lockfile = await evaluateLockfileConsistency({
    root: input.root,
    packages: inventory.packages,
  });
  if (!lockfile.consistent) blockers.push(...lockfile.reasons);

  const references = await collectCrossPackageReferences({
    root: input.root,
    packages: inventory.packages,
  });
  const aliases = evaluatePathAliases(inventory.packages);
  if (!aliases.supported) warnings.push(...aliases.reasons);
  const exportsEvaluation = evaluatePackageExports(inventory.packages);
  warnings.push(...exportsEvaluation.reasons);

  const packageCoverages = inventory.packages.map((pkg) =>
    evaluatePackageCoverage({ pkg, graph, references }),
  );
  const coverage = aggregateWorkspaceCoverage(inventory.packages, packageCoverages);

  const packageGates = input.packageGates ?? [];
  const aggregateGates = input.aggregateGates ?? [];
  if (packageGates.some((gate) => gate.status === "failed") ||
    aggregateGates.some((gate) => gate.status === "failed")) {
    blockers.push("baseline_gate_failed");
  }

  let status: WorkspaceQualificationStatus = "ready";
  if (discovery.packageManagerSignals.length) status = "unsupported";
  else if (
    discovery.declaration?.support === "configuration_required" ||
    inventory.duplicateNames.length ||
    blockers.some((item) => item.startsWith("duplicate_package_name"))
  ) {
    status = "configuration_required";
  } else if (blockers.includes("baseline_gate_failed")) status = "baseline_broken";
  else if (coverage.status === "failed") status = "failed";
  else if (coverage.status !== "complete") {
    const relevantUnsupported = inventory.packages.some(
      (item) => item.support === "unsupported" && !item.reasons.includes("provably_irrelevant"),
    );
    status = relevantUnsupported ? "partially_supported" : "ready_with_limited_packages";
    if (relevantUnsupported) blockers.push("relevant_unsupported_package");
  } else if (blockers.length) {
    status = blockers.some((item) => item.includes("unsupported"))
      ? "unsupported"
      : "configuration_required";
  }

  // Nested independent workspace heuristic: multiple lockfiles.
  try {
    await access(join(input.root, "package-lock.json"));
  } catch {
    // already handled
  }

  const result: WorkspaceQualificationResult = {
    schemaVersion: "1",
    profileId: "typescript-npm-workspace-v1",
    requestId: input.requestId,
    requestDigest: input.requestDigest,
    repository,
    resolvedCommit: input.resolvedCommit.toLowerCase(),
    sourceSnapshotId: input.sourceSnapshotId,
    ...(discovery.declaration ? { declaration: discovery.declaration } : {}),
    packages: inventory.packages,
    graph,
    references,
    coverage,
    packageGates,
    aggregateGates,
    capabilityRoutes: routeCapabilities({
      status,
      blockers: [...new Set(blockers)].sort(),
      coverageComplete: coverage.status === "complete",
      remediationAuthorized,
    }),
    blockers: [...new Set(blockers)].sort(),
    warnings: [...new Set(warnings)].sort(),
    status,
    qualificationDigest: "",
    remediationAuthorized,
    publicationAuthorized,
  };
  result.qualificationDigest = digestCanonical({
    ...result,
    qualificationDigest: undefined,
  });
  return result;
}
