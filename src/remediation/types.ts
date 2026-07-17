export type PiranhaLanguage = "javascript" | "typescript" | "tsx" | "python";
export type RemovalShape =
  | "top_level_function"
  | "default_export_alias"
  | "exported_variable_function"
  | "export_modifier_only";
export type RemediationReviewMode = "confirmed_dead" | "draft_pr_review";
export type VerificationTier = "A" | "B" | "C";
export type GatePhase = "baseline" | "post_removal";

export interface RemovalValidation {
  language: PiranhaLanguage;
  shape: RemovalShape;
  reviewMode: RemediationReviewMode;
}

export interface RemovalCandidate {
  verdictId: string;
  symbolId: string;
  symbolName: string;
  qualifiedName: string;
  symbolKind: string;
  isExported: boolean;
  filePath: string;
  language: string;
  indexedCommitSha: string;
  indexedContentHash: string;
  repositoryId: string;
  vcsProvider: string;
  orgSlug: string;
  repoSlug: string;
  defaultBranch: string;
  automatedVerdict: string;
  confidenceScore: number | null;
  reviewStatus: string;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  importOrReexportReferences: number;
  executableReferences: number;
  importEdges: number;
  directUnusedExportFindings: number;
  directUnusedTypeFindings: number;
  scoreBeforeExportCap: number | null;
}

export interface ProcessResult {
  command: string;
  args: string[];
  cwd: string;
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  timedOut: boolean;
}

export interface GateCommandResult extends ProcessResult {
  kind:
    | "install"
    | "service"
    | "typecheck"
    | "compile"
    | "build"
    | "test"
    | "lint"
    | "syntax"
    | "static_analysis";
  phase?: GatePhase;
}

export interface GateResult {
  status: "passed" | "failed" | "error";
  packageRoot: string;
  commands: GateCommandResult[];
  startedAt: string;
  completedAt: string;
  failure?: string;
  verificationTier?: VerificationTier;
  testsAvailable?: boolean;
  skippedChecks?: string[];
  baseline?: GateResult;
  postRemoval?: GateResult;
}

export interface PiranhaResult {
  rewriteCount: number;
  path: string;
  generatorVersion: string;
  ruleSetVersion: string;
}
