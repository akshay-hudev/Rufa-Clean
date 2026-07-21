import type { IsolatedRunnerSession } from "../security/docker-runner";
import type { CanonicalAnalysisResult, RepositoryIdentity } from "./types";

function requirePassed(label: string, result: { exitCode: number | null; timedOut: boolean; stderr: string; stdout: string }): void {
  if (result.exitCode !== 0 || result.timedOut) {
    throw new Error(`${label} failed: ${result.stderr.trim() || result.stdout.trim() || "unknown failure"}`);
  }
}

export async function runIsolatedAnalysis(input: {
  session: IsolatedRunnerSession;
  accountScopeId: string;
  repository: RepositoryIdentity;
  commitSha: string;
}): Promise<CanonicalAnalysisResult> {
  try {
    const install = await input.session.runInstall("npm", [
      "ci", "--ignore-scripts", "--include=dev", "--no-audit", "--no-fund",
    ]);
    requirePassed("Dependency installation", install);
    await input.session.sealNetwork();
    const scip = await input.session.run("node", [
      "/opt/dcav2/node_modules/@sourcegraph/scip-typescript/dist/src/main.js",
      "index", "--output", "/tmp/index.scip", "--no-progress-bar",
    ]);
    requirePassed("SCIP", scip);
    const metadata = Buffer.from(JSON.stringify({
      accountScopeId: input.accountScopeId,
      repository: input.repository,
      commitSha: input.commitSha,
    })).toString("base64url");
    const analysis = await input.session.run("node", [
      "/opt/dcav2/dist/milestone/runner-entry.js", "analyze", metadata,
    ]);
    requirePassed("Deterministic analysis", analysis);
    const artifactCheck = await input.session.run("node", [
      "-e",
      "const fs=require('node:fs');const p='/workspace/.dca-output/analysis.json';if(!fs.existsSync(p)){console.error(JSON.stringify(fs.readdirSync('/workspace')));process.exit(2)}",
    ]);
    requirePassed("Analysis artifact validation", artifactCheck);
    return JSON.parse(
      await input.session.readTextArtifact("/workspace/.dca-output/analysis.json"),
    ) as CanonicalAnalysisResult;
  } finally {
    await input.session.dispose();
  }
}
