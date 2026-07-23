import { describe, expect, it } from "vitest";

import { digestCanonical } from "./canonical";
import { redactAuditValue, verifyAuditChain, type AuditChainEvent } from "./audit";

function chain(): AuditChainEvent[] {
  const first = {
    sequence: 1,
    event_type: "analysis_recorded",
    subject_type: "analysis",
    subject_id: "one",
    payload: { status: "succeeded" },
    previous_event_hash: null,
    actor_identity: "operator",
    created_at: "2026-07-23T00:00:00.000Z",
  };
  const firstHash = digestCanonical({
    accountScopeId: "tenant-a",
    sequence: first.sequence,
    eventType: first.event_type,
    subjectType: first.subject_type,
    subjectId: first.subject_id,
    payload: first.payload,
    previousEventHash: first.previous_event_hash,
    actorIdentity: first.actor_identity,
    createdAt: first.created_at,
  });
  const second = {
    ...first,
    sequence: 2,
    subject_id: "two",
    previous_event_hash: firstHash,
    created_at: "2026-07-23T00:00:01.000Z",
  };
  const secondHash = digestCanonical({
    accountScopeId: "tenant-a",
    sequence: second.sequence,
    eventType: second.event_type,
    subjectType: second.subject_type,
    subjectId: second.subject_id,
    payload: second.payload,
    previousEventHash: second.previous_event_hash,
    actorIdentity: second.actor_identity,
    createdAt: second.created_at,
  });
  return [
    { ...first, event_hash: firstHash },
    { ...second, event_hash: secondHash },
  ];
}

describe("independent audit-chain verification", () => {
  it("redacts credential canaries before audit hashing or persistence", () => {
    const canary = "github_pat_phase0SyntheticCredential123456";
    const privateKey = "-----BEGIN PRIVATE KEY-----\nsynthetic\n-----END PRIVATE KEY-----";
    const redacted = redactAuditValue({
      nested: [canary, `Bearer ${"a".repeat(32)}`, privateKey],
      url: "postgresql://operator:synthetic-password@localhost/disposable",
    });
    const serialized = JSON.stringify(redacted);
    expect(serialized).not.toContain(canary);
    expect(serialized).not.toContain("synthetic-password");
    expect(serialized).not.toContain("synthetic\\n");
    expect(serialized).toContain("[REDACTED");
  });

  it("validates sequence, previous hashes, and event hashes", () => {
    expect(verifyAuditChain("tenant-a", chain())).toEqual({
      valid: true,
      eventCount: 2,
    });
  });

  it("detects payload, link, sequence, and tenant tampering", () => {
    const payload = chain();
    payload[1] = { ...payload[1]!, payload: { status: "tampered" } };
    expect(verifyAuditChain("tenant-a", payload).valid).toBe(false);

    const link = chain();
    link[1] = { ...link[1]!, previous_event_hash: "0".repeat(64) };
    expect(verifyAuditChain("tenant-a", link).failure).toMatch(/previous_hash/);

    const sequence = chain();
    sequence[1] = { ...sequence[1]!, sequence: 3 };
    expect(verifyAuditChain("tenant-a", sequence).failure).toMatch(/sequence/);

    expect(verifyAuditChain("tenant-b", chain()).valid).toBe(false);
  });
});
