export type PiranhaLanguage = "typescript" | "tsx" | "python";

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
  kind: "install" | "service" | "typecheck" | "compile" | "build" | "test";
}

export interface GateResult {
  status: "passed" | "failed" | "error";
  packageRoot: string;
  commands: GateCommandResult[];
  startedAt: string;
  completedAt: string;
  failure?: string;
}

export interface PiranhaResult {
  rewriteCount: number;
  path: string;
  generatorVersion: string;
  ruleSetVersion: string;
}
