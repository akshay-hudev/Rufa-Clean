import { digestCanonical } from "./canonical";

const SECRET_PATTERNS: ReadonlyArray<[RegExp, string]> = [
  [/\b(?:gh[pousr]|github_pat)_[A-Za-z0-9_]{12,}\b/g, "[REDACTED_GITHUB_CREDENTIAL]"],
  [/\bBearer\s+[A-Za-z0-9._~+/=-]{12,}\b/gi, "Bearer [REDACTED]"],
  [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
    "[REDACTED_PRIVATE_KEY]",
  ],
  [
    /([a-z][a-z0-9+.-]*:\/\/[^:/\s]+:)[^@\s]+@/gi,
    "$1[REDACTED]@",
  ],
];

export function redactAuditValue(value: unknown): unknown {
  if (typeof value === "string") {
    return SECRET_PATTERNS.reduce(
      (redacted, [pattern, replacement]) => redacted.replace(pattern, replacement),
      value,
    );
  }
  if (Array.isArray(value)) {
    return value.map(redactAuditValue);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .map(([key, entry]) => [key, redactAuditValue(entry)]),
    );
  }
  return value;
}

export interface AuditChainEvent {
  sequence: string | number;
  event_type: string;
  subject_type: string;
  subject_id: string;
  payload: unknown;
  previous_event_hash: string | null;
  event_hash: string;
  actor_identity: string;
  created_at: string | Date;
}

export interface AuditChainVerification {
  valid: boolean;
  eventCount: number;
  failure?: string;
}

export function verifyAuditChain(
  accountScopeId: string,
  events: readonly AuditChainEvent[],
): AuditChainVerification {
  let previousEventHash: string | null = null;
  for (let index = 0; index < events.length; index += 1) {
    const event = events[index]!;
    const sequence = Number(event.sequence);
    if (sequence !== index + 1) {
      return { valid: false, eventCount: events.length, failure: `sequence_${index + 1}` };
    }
    if (event.previous_event_hash !== previousEventHash) {
      return { valid: false, eventCount: events.length, failure: `previous_hash_${sequence}` };
    }
    const createdAt = event.created_at instanceof Date
      ? event.created_at.toISOString()
      : new Date(event.created_at).toISOString();
    const expected = digestCanonical({
      accountScopeId,
      sequence,
      eventType: event.event_type,
      subjectType: event.subject_type,
      subjectId: event.subject_id,
      payload: event.payload,
      previousEventHash,
      actorIdentity: event.actor_identity,
      createdAt,
    });
    if (event.event_hash !== expected) {
      return { valid: false, eventCount: events.length, failure: `event_hash_${sequence}` };
    }
    previousEventHash = event.event_hash;
  }
  return { valid: true, eventCount: events.length };
}
