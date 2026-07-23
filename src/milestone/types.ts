import type { ScipDocument } from "../indexing/analyzers/scip-parse";

export const MILESTONE_POLICY_VERSION = "typescript-private-function-v3";

export type FindingClassification =
  | "candidate_dead"
  | "live_evidence_present"
  | "inconclusive"
  | "conflicting"
  | "unsupported"
  | "stale"
  | "failed";

export type CoverageStatus = "complete_for_supported_scope" | "partial" | "failed" | "unknown";

export interface RepositoryIdentity {
  provider: "github";
  owner: string;
  name: string;
}

export interface ExactSymbolOccurrence {
  filePath: string;
  name: string;
  kind: "function";
  shape: "function_declaration" | "arrow_function" | "nested_function";
  exported: boolean;
  lineStart: number;
  columnStart: number;
  lineEnd: number;
  columnEnd: number;
  byteStart: number;
  byteEnd: number;
  sourceSha256: string;
  declarationSha256: string;
}

export interface CoverageBundle {
  status: CoverageStatus;
  tsconfigFileCount: number;
  parsedFileCount: number;
  scipDocumentCount: number;
  analyzedFiles: string[];
  excludedFiles: Array<{ path: string; reason: string }>;
  missingScipFiles: string[];
  failedFiles: Array<{ path: string; reason: string }>;
  explanation: string;
}

export interface FindingEvidence {
  treeSitter: {
    status: "succeeded" | "failed";
    declarationCount: number;
  };
  scip: {
    status: "succeeded" | "failed";
    definitionMatches: number;
    symbol?: string;
    productionReferences: number;
    testReferences: number;
    unknownReferences: number;
  };
  textualAudit: {
    status: "succeeded" | "failed";
    occurrenceCount: number;
    checkedFiles: number;
    occurrenceFiles: string[];
  };
}

export interface FindingBundle {
  schemaVersion: "1";
  findingId: string;
  accountScopeId: string;
  repository: RepositoryIdentity;
  commitSha: string;
  packageJsonSha256: string;
  packageLockSha256: string;
  tsconfigSha256: string;
  packageIdentity: string;
  moduleIdentity: string;
  functionIdentity: string;
  occurrence: ExactSymbolOccurrence;
  nativeScipIdentity?: string;
  analyzers: Array<{
    name: string;
    version: string;
    configuration: Record<string, unknown>;
    artifactSha256?: string;
  }>;
  coverage: CoverageBundle;
  supportingEvidence: string[];
  counterEvidence: string[];
  blockers: string[];
  contradictions: string[];
  evidence: FindingEvidence;
  classification: FindingClassification;
  explanation: string;
  policyVersion: string;
  evidenceDigest: string;
}

export interface CanonicalAnalysisResult {
  schemaVersion: "1";
  accountScopeId: string;
  repository: RepositoryIdentity;
  commitSha: string;
  policyVersion: string;
  coverage: CoverageBundle;
  analyzerRuns: Array<{
    analyzer: string;
    version: string;
    status: "succeeded" | "failed";
    configuration: Record<string, unknown>;
    artifactSha256?: string;
    failure?: string;
  }>;
  findings: FindingBundle[];
}

export interface ScipInput {
  status: "succeeded" | "failed";
  version: string;
  configuration: Record<string, unknown>;
  artifactSha256?: string;
  documents?: ScipDocument[];
  failure?: string;
}

export interface AnalysisInput {
  accountScopeId: string;
  repository: RepositoryIdentity;
  commitSha: string;
  repositoryPath: string;
  scip: ScipInput;
}

export type HumanDisposition =
  | "confirmed_dead"
  | "confirmed_alive"
  | "deferred"
  | "excluded"
  | "inconclusive";

export type AuthorizationDecision =
  | "approved_for_remediation"
  | "rejected"
  | "revoked"
  | "expired";
