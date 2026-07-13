export interface RepoLevelAnalyzer {
  name: string;
  canAnalyze(repoRootPath: string): boolean;
  analyze(repoRootPath: string): Promise<RepoLevelFinding[]>;
}

export interface RepoLevelFinding {
  filePath: string;
  lineStart?: number;
  lineEnd?: number;
  symbolName?: string;
  findingType: string;
  sourceTool: string;
  rawOutput: unknown;
}
