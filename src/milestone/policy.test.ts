import { describe, expect, it } from "vitest";

import { assertAuthorizationCurrent, assertDispositionAllowed, bindingForFinding } from "./policy";
import type { FindingBundle } from "./types";

function finding(): FindingBundle {
  return {
    schemaVersion: "1",
    findingId: "f".repeat(64),
    accountScopeId: "account",
    repository: { provider: "github", owner: "owner", name: "repo" },
    commitSha: "a".repeat(40),
    packageJsonSha256: "1".repeat(64),
    packageLockSha256: "2".repeat(64),
    tsconfigSha256: "3".repeat(64),
    occurrence: {
      filePath: "src/dead.ts", name: "dead", kind: "function", shape: "function_declaration",
      exported: false, lineStart: 1, columnStart: 1, lineEnd: 1, columnEnd: 20,
      byteStart: 0, byteEnd: 20, sourceSha256: "4".repeat(64), declarationSha256: "5".repeat(64),
    },
    analyzers: [],
    coverage: { status: "complete_for_supported_scope", tsconfigFileCount: 1, parsedFileCount: 1, scipDocumentCount: 1, analyzedFiles: ["src/dead.ts"], excludedFiles: [], missingScipFiles: [], failedFiles: [], explanation: "complete" },
    supportingEvidence: [], counterEvidence: [], blockers: [], contradictions: [],
    evidence: {
      treeSitter: { status: "succeeded", declarationCount: 1 },
      scip: { status: "succeeded", definitionMatches: 1, productionReferences: 0, testReferences: 0, unknownReferences: 0 },
      textualAudit: { status: "succeeded", occurrenceCount: 1, checkedFiles: 1, occurrenceFiles: ["src/dead.ts"] },
    },
    classification: "candidate_dead", explanation: "dead", policyVersion: "policy-v1", evidenceDigest: "e".repeat(64),
  };
}

describe("review and authorization policy", () => {
  it("only permits confirmed_dead for a candidate", () => {
    const value = finding();
    expect(() => assertDispositionAllowed(value, "confirmed_dead")).not.toThrow();
    expect(() => assertDispositionAllowed({ ...value, classification: "inconclusive" }, "confirmed_dead")).toThrow(/candidate_dead/);
  });

  it("requires active authorization bound to the exact fresh identity", () => {
    const value = finding();
    const binding = bindingForFinding(value);
    const authorization = { ...binding, decision: "approved_for_remediation" as const };
    const fresh = {
      repositoryProvider: "github", repositoryOwner: "owner", repositoryName: "repo",
      commitSha: value.commitSha, filePath: value.occurrence.filePath,
      sourceSha256: value.occurrence.sourceSha256, evidenceDigest: value.evidenceDigest,
      policyVersion: value.policyVersion, exactOccurrence: value.occurrence,
    };
    expect(() => assertAuthorizationCurrent(authorization, value, fresh)).not.toThrow();
    expect(() => assertAuthorizationCurrent(authorization, value, { ...fresh, sourceSha256: "0".repeat(64) })).toThrow(/source hash changed/);
    expect(() => assertAuthorizationCurrent(authorization, value, { ...fresh, evidenceDigest: "0".repeat(64) })).toThrow(/evidence digest changed/);
    expect(() => assertAuthorizationCurrent({ ...authorization, decision: "revoked" }, value, fresh)).toThrow(/not active/);
  });
});
