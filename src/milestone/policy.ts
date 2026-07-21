import { canonicalJson } from "./canonical";
import type { AuthorizationDecision, FindingBundle, HumanDisposition } from "./types";

export interface BoundDecision {
  findingId: string;
  repositoryProvider: string;
  repositoryOwner: string;
  repositoryName: string;
  commitSha: string;
  exactOccurrence: unknown;
  sourceSha256: string;
  evidenceDigest: string;
  policyVersion: string;
}

export interface BoundAuthorization extends BoundDecision {
  decision: AuthorizationDecision;
}

export interface FreshRemediationIdentity {
  repositoryProvider: string;
  repositoryOwner: string;
  repositoryName: string;
  commitSha: string;
  filePath: string;
  sourceSha256: string;
  evidenceDigest: string;
  policyVersion: string;
  exactOccurrence: unknown;
}

export function bindingForFinding(finding: FindingBundle): BoundDecision {
  return {
    findingId: finding.findingId,
    repositoryProvider: finding.repository.provider,
    repositoryOwner: finding.repository.owner,
    repositoryName: finding.repository.name,
    commitSha: finding.commitSha,
    exactOccurrence: finding.occurrence,
    sourceSha256: finding.occurrence.sourceSha256,
    evidenceDigest: finding.evidenceDigest,
    policyVersion: finding.policyVersion,
  };
}

export function assertDispositionAllowed(
  finding: FindingBundle,
  disposition: HumanDisposition,
): void {
  if (disposition === "confirmed_dead" && finding.classification !== "candidate_dead") {
    throw new Error("Only a candidate_dead finding may be human-confirmed dead");
  }
}

export function assertAuthorizationCurrent(
  authorization: BoundAuthorization,
  finding: FindingBundle,
  fresh: FreshRemediationIdentity,
): void {
  if (authorization.decision !== "approved_for_remediation") {
    throw new Error(`Latest authorization is not active: ${authorization.decision}`);
  }
  const binding = bindingForFinding(finding);
  const checks: Array<[string, unknown, unknown]> = [
    ["finding", authorization.findingId, binding.findingId],
    ["repository provider", authorization.repositoryProvider, fresh.repositoryProvider],
    ["repository owner", authorization.repositoryOwner, fresh.repositoryOwner],
    ["repository name", authorization.repositoryName, fresh.repositoryName],
    ["commit", authorization.commitSha, fresh.commitSha],
    ["source file", finding.occurrence.filePath, fresh.filePath],
    ["source hash", authorization.sourceSha256, fresh.sourceSha256],
    ["evidence digest", authorization.evidenceDigest, fresh.evidenceDigest],
    ["policy version", authorization.policyVersion, fresh.policyVersion],
    ["exact occurrence", canonicalJson(authorization.exactOccurrence), canonicalJson(fresh.exactOccurrence)],
    ["finding evidence", authorization.evidenceDigest, binding.evidenceDigest],
  ];
  const stale = checks.find(([, expected, actual]) => expected !== actual);
  if (stale) {
    throw new Error(`stale authorization: ${stale[0]} changed`);
  }
}
