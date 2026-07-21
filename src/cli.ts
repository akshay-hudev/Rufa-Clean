import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { pool } from "./db/client";
import { migrate } from "./db/migrate";
import { MILESTONE_POLICY_VERSION, type AuthorizationDecision, type HumanDisposition } from "./milestone/types";
import { MilestoneStore } from "./milestone/store";
import { runIsolatedAnalysis } from "./milestone/isolated-analysis";
import { remediateInIsolation } from "./milestone/remediate";
import { publishVerifiedDraft } from "./milestone/publisher";
import { GitHubDraftPublisher } from "./milestone/github-publisher";
import { configuredDockerRunner } from "./security/docker-runner";
import { readOnlyRepositoryCredential } from "./security/github-credentials";
import { acquireGitHubSource } from "./security/source-acquisition";
import { sha256 } from "./milestone/canonical";

interface Arguments {
  positionals: string[];
  options: Map<string, string>;
}

function parseArguments(values: string[]): Arguments {
  const positionals: string[] = [];
  const options = new Map<string, string>();
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index]!;
    if (!value.startsWith("--")) {
      positionals.push(value);
      continue;
    }
    const name = value.slice(2);
    const optionValue = values[index + 1];
    if (!optionValue || optionValue.startsWith("--")) {
      throw new Error(`Option --${name} requires a value`);
    }
    options.set(name, optionValue);
    index += 1;
  }
  return { positionals, options };
}

function required(args: Arguments, name: string): string {
  const value = args.options.get(name)?.trim();
  if (!value) {
    throw new Error(`--${name} is required`);
  }
  return value;
}

function repository(value: string): { owner: string; name: string } {
  const [owner, name, extra] = value.split("/");
  if (!owner || !name || extra) {
    throw new Error("--repo must use owner/repository form");
  }
  return { owner, name };
}

function print(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function disposition(value: string): HumanDisposition {
  const allowed: HumanDisposition[] = ["confirmed_dead", "confirmed_alive", "deferred", "excluded", "inconclusive"];
  if (!allowed.includes(value as HumanDisposition)) {
    throw new Error(`Invalid human disposition: ${value}`);
  }
  return value as HumanDisposition;
}

function authorization(value: string): AuthorizationDecision {
  const allowed: AuthorizationDecision[] = ["approved_for_remediation", "rejected", "revoked", "expired"];
  if (!allowed.includes(value as AuthorizationDecision)) {
    throw new Error(`Invalid remediation authorization: ${value}`);
  }
  return value as AuthorizationDecision;
}

async function analyze(args: Arguments, store: MilestoneStore): Promise<void> {
  const account = required(args, "account");
  const identity = repository(required(args, "repo"));
  const revision = required(args, "revision");
  const actor = required(args, "actor");
  await store.ensureAccountScope(account);
  const source = await acquireGitHubSource({
    owner: identity.owner,
    repository: identity.name,
    revision,
    credentialProvider: () => readOnlyRepositoryCredential(identity.name),
  });
  try {
    try {
      const session = await configuredDockerRunner().createSession(source.path);
      const result = await runIsolatedAnalysis({
        session,
        accountScopeId: account,
        repository: { provider: "github", owner: identity.owner, name: identity.name },
        commitSha: source.commitSha,
      });
      const runId = await store.recordAnalysis(result, actor);
      print({ runId, result });
    } catch (error) {
      const failure = error instanceof Error ? error.message : String(error);
      const runId = await store.recordAnalysisFailure({
        accountScopeId: account,
        repositoryProvider: "github",
        repositoryOwner: identity.owner,
        repositoryName: identity.name,
        commitSha: source.commitSha,
        policyVersion: MILESTONE_POLICY_VERSION,
        analyzer: "isolated-analysis",
        analyzerVersion: "1",
        failure,
        actorIdentity: actor,
      });
      throw new Error(`Analysis failed (recorded as ${runId}): ${failure}`);
    }
  } finally {
    await source.cleanup();
  }
}

async function remediate(args: Arguments, store: MilestoneStore): Promise<void> {
  const findingId = required(args, "finding");
  const actor = required(args, "actor");
  const revision = required(args, "revision");
  const finding = await store.getFinding(findingId);
  const authorization = await store.latestAuthorization(findingId);
  const disposition = await store.latestDisposition(findingId);
  if (disposition.decision !== "confirmed_dead") {
    throw new Error("Remediation requires the latest human disposition to be confirmed_dead");
  }
  const source = await acquireGitHubSource({
    owner: finding.repository.owner,
    repository: finding.repository.name,
    revision,
    expectedCommitSha: finding.commitSha,
    credentialProvider: () => readOnlyRepositoryCredential(finding.repository.name),
  });
  try {
    const analysisSession = await configuredDockerRunner().createSession(source.path);
    const freshAnalysis = await runIsolatedAnalysis({
      session: analysisSession,
      accountScopeId: finding.accountScopeId,
      repository: finding.repository,
      commitSha: source.commitSha,
    });
    await store.recordAnalysis(freshAnalysis, actor);
    const freshFinding = freshAnalysis.findings.find((candidate) =>
      candidate.occurrence.filePath === finding.occurrence.filePath &&
      candidate.occurrence.name === finding.occurrence.name &&
      candidate.occurrence.lineStart === finding.occurrence.lineStart
    );
    if (!freshFinding) {
      throw new Error("stale authorization: exact symbol occurrence was not reproduced");
    }
    const freshSource = await readFile(join(source.path, finding.occurrence.filePath));
    const remediationSession = await configuredDockerRunner().createSession(source.path);
    const result = await remediateInIsolation({
      session: remediationSession,
      sourcePath: source.path,
      finding,
      authorization,
      freshIdentity: {
        repositoryProvider: freshFinding.repository.provider,
        repositoryOwner: freshFinding.repository.owner,
        repositoryName: freshFinding.repository.name,
        commitSha: freshFinding.commitSha,
        filePath: freshFinding.occurrence.filePath,
        sourceSha256: sha256(freshSource),
        evidenceDigest: freshFinding.evidenceDigest,
        policyVersion: freshFinding.policyVersion,
        exactOccurrence: freshFinding.occurrence,
      },
    });
    const attemptId = await store.recordRemediation(result, actor);
    print({ attemptId, result });
  } finally {
    await source.cleanup();
  }
}

async function main(): Promise<void> {
  const args = parseArguments(process.argv.slice(2));
  const command = args.positionals[0];
  if (!command) {
    throw new Error("A command is required: analyze, analysis, findings, finding, review, authorize, remediate, gates, publish, audit");
  }
  await migrate();
  const store = new MilestoneStore();
  if (command === "analyze") {
    await analyze(args, store);
  } else if (command === "analysis") {
    print(await store.getAnalysisRun(required(args, "run")));
  } else if (command === "findings") {
    print(await store.listFindings(required(args, "account")));
  } else if (command === "finding") {
    print(await store.getFinding(required(args, "finding")));
  } else if (command === "review") {
    const id = await store.recordDisposition({
      findingId: required(args, "finding"),
      decision: disposition(required(args, "decision")),
      actorIdentity: required(args, "actor"),
      rationale: required(args, "rationale"),
    });
    print({ reviewDecisionId: id });
  } else if (command === "authorize") {
    const id = await store.recordAuthorization({
      findingId: required(args, "finding"),
      decision: authorization(required(args, "decision")),
      actorIdentity: required(args, "actor"),
      rationale: required(args, "rationale"),
    });
    print({ remediationAuthorizationId: id });
  } else if (command === "remediate") {
    await remediate(args, store);
  } else if (command === "gates") {
    print(await store.getRemediationAttempt(required(args, "attempt")));
  } else if (command === "publish") {
    print(await publishVerifiedDraft({
      store,
      gateway: new GitHubDraftPublisher(),
      attemptId: required(args, "attempt"),
      baseBranch: required(args, "base"),
      actorIdentity: required(args, "actor"),
    }));
  } else if (command === "audit") {
    print(await store.auditChain(required(args, "account")));
  } else {
    throw new Error(`Unknown command: ${command}`);
  }
}

void main()
  .catch((error) => {
    process.stderr.write(`${JSON.stringify({ error: error instanceof Error ? error.message : String(error) })}\n`);
    process.exitCode = 1;
  })
  .finally(async () => pool.end());
