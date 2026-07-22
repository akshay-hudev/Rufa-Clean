# Phase Authorizations

This directory contains machine-readable records of temporary human
authorization for DCAv2 execution.

Authorization files record permission. They do not create permission.

The authoritative source of execution permission is the latest explicit human
instruction in the active conversation, interpreted according to:

* `AGENTS.md`;
* `codex/core/01-instruction-precedence.md`;
* `codex/core/03-safety-invariants.md`;
* `codex/core/05-phase-authorization-protocol.md`;
* repository-access policies under `codex/access/`.

---

## 1. Directory contents

This directory contains:

* `authorization-template.yaml` — the canonical structure for recording a
  phase authorization;
* `current-phase-authorization.yaml` — the authorization record for the phase
  currently permitted to execute.

Additional historical authorization records may be added later when required by
the audit model.

---

## 2. Authorization source

A valid authorization begins with an explicit human instruction.

The human instruction must identify the phase or bounded work being authorized.

The authorization file must accurately mirror that instruction.

The file must not:

* broaden the human instruction;
* infer missing permission;
* authorize its own execution;
* authorize a later phase;
* renew expired permission;
* remove repository exclusions;
* authorize external writes by implication;
* authorize destructive operations by implication;
* weaken permanent safety invariants.

When the human instruction and authorization file disagree, execution must stop.

The narrower interpretation applies until the mismatch is corrected.

---

## 3. Current authorization file

The active authorization record is:

```text
codex/authorizations/current-phase-authorization.yaml
```

Before implementation begins, the file must identify:

* authorization ID;
* authorization status;
* authorized phase;
* human-authorized objective;
* local repository scope;
* permitted local Git operations;
* external repository scope;
* prohibited repositories;
* external discovery permission;
* clone and fetch permission;
* analysis permission;
* modification permission;
* external branch-creation permission;
* draft pull-request permission;
* credential-use permission;
* database-operation permission;
* destructive-operation permission;
* governance-modification permission;
* expiration condition.

Missing permission must be interpreted as denied.

---

## 4. Authorization status

An authorization record must use an explicit status.

Supported statuses include:

* draft;
* active;
* expired;
* revoked;
* completed;
* superseded;
* inactive.

Only an active authorization may permit implementation.

A file marked draft, inactive, expired, revoked, completed, or
superseded does not authorize execution.

The presence of an active status in the file is insufficient by itself. It must
match the latest explicit human instruction.

---

## 5. Authorization ID

Every authorization must have a unique identifier.

Recommended format:

```text
phase-<phase>-<YYYYMMDD>-<sequence>
```

Examples:

```text
phase-0-20260722-01
phase-1-20260723-01
phase-3a-20260810-02
```

The authorization ID should be recorded in:

* `current-phase-authorization.yaml`;
* `CODEX_EXECUTION_STATE.md`;
* phase reports;
* relevant audit events;
* external-operation records;
* remediation attempts;
* publication attempts.

An identifier is a reference to authorization. It is not authorization by
itself.

---

## 6. One active phase

Only one phase or sub-phase should be active at a time.

Examples include:

* `phase-0`;
* `phase-1`;
* `phase-2`;
* `phase-3a`;
* `phase-3b`;
* `phase-3c`;
* `phase-3d`;
* `phase-4`;
* `phase-5`;
* `phase-6`;
* `phase-7`;
* `phase-8`;
* `phase-9`;
* `phase-10`.

Multiple phases may be combined only when the human operator explicitly
authorizes the combined scope.

Completion of one phase does not authorize the next phase.

A roadmap file describes future work. It does not grant permission to execute
that work.

---

## 7. Repository permissions

Repository access must be recorded as separate operation permissions.

The authorization must distinguish:

* account-level discovery;
* repository-specific metadata retrieval;
* clone;
* fetch;
* qualification;
* static analysis;
* isolated build and test;
* local patch preparation;
* external source modification;
* external branch creation;
* draft pull-request creation.

Permission for one operation does not imply permission for another.

For example:

* discovery does not imply cloning;
* cloning does not imply analysis;
* analysis does not imply remediation;
* remediation does not imply publication;
* branch creation does not imply pull-request creation.

---

## 8. Standing GitHub scope

Repositories owned by the GitHub account:

`akshay-hudev`

may be eligible for authorized testing and analysis.

Eligibility does not independently authorize execution.

Every operation remains subject to:

* current phase scope;
* the latest explicit human instruction;
* `codex/access/github-repository-policy.yaml`;
* `codex/access/prohibited-repositories.yaml`;
* credential availability;
* credential authorization;
* runner isolation;
* permanent safety invariants.

---

## 9. Prohibited repositories

The prohibited-repository policy is a hard denylist.

The repository:

`akshay-hudev/Rufa-Clean`

must not be:

* cloned;
* fetched;
* searched;
* inspected;
* qualified;
* indexed;
* analyzed;
* modified;
* branched;
* published to;
* used as a test fixture.

An authorization file must not remove, override, or weaken this exclusion.

Changing the denylist requires separate, explicit governance authorization.

---

## 10. External writes

External writes must be recorded separately from external reads.

External writes include:

* creating a branch;
* pushing a commit;
* creating a draft pull request;
* creating a provider-side comment;
* creating an issue;
* uploading an artifact;
* modifying an external resource.

External writes are denied unless explicitly authorized.

The following remain permanently prohibited:

* direct push to the default branch;
* automatic merge;
* enabling auto-merge;
* automatically marking a draft pull request ready for review;
* bypassing branch protections;
* rewriting shared history;
* deleting repositories;
* changing repository settings through ordinary remediation authorization.

---

## 11. Remediation authorization

A phase authorization does not replace finding-specific remediation governance.

Source modification requires:

* A current finding.
* An immutable source snapshot.
* A valid human disposition.
* A separate valid remediation authorization.
* Successful finding reproduction.
* Successful baseline verification.
* A supported deterministic transformation.
* Successful post-change verification.
* A verified changed-file allowlist.
* Publication permission when an external write is requested.

A `confirmed_dead` disposition does not automatically authorize remediation.

A successful remediation attempt does not automatically authorize publication.

---

## 12. Local Git permissions

The authorization must explicitly state whether Codex may:

* create a local phase branch;
* create local commits;
* generate patches;
* modify tracked files;
* create new files;
* create additive migrations.

The following must remain denied unless separately authorized and permitted by
permanent policy:

* discarding pre-existing user changes;
* destructive clean operations;
* amending pre-existing commits;
* rewriting shared history;
* force-pushing;
* deleting user branches;
* pushing externally.

---

## 13. Governance modification

Governance modification must be recorded explicitly.

When governance modification is not authorized, Codex must not modify:

* `AGENTS.md`;
* files under `codex/core/`;
* files under `codex/access/`;
* authorization policies or schemas;
* the authorized phase specification;
* the authorized phase test manifest.

When governance modification is authorized, the authorization must identify:

* files or policy area;
* allowed objective;
* limitations;
* required review;
* expiration.

General permission to implement a phase does not include governance
modification.

---

## 14. Credentials

Credential availability and credential permission are separate.

An authorization must state:

* whether existing configured credentials may be used;
* which credential types may be used;
* which operations may use them;
* which target scope applies;
* whether external writes are permitted.

Secret values must never appear in authorization files.

Use only statuses and capability descriptions such as:

```yaml
credentials:
  github_read:
    status: available
    use: allowed
  github_write:
    status: unknown
    use: prohibited
```

Do not include:

* tokens;
* private keys;
* passwords;
* credential-bearing URLs;
* authentication headers.

---

## 15. Database operations

Database authorization must distinguish:

* local test database creation;
* additive migrations;
* schema validation;
* migration testing;
* data backfills;
* destructive migrations;
* production database access.

Additive local development work may be permitted independently.

Destructive or production database operations require separate explicit
authorization.

Historical migrations and append-only audit history must not be rewritten
through ordinary phase authorization.

---

## 16. Expiration

Every authorization must define an expiration condition.

Examples include:

* when the phase stops for human review;
* when the phase acceptance criteria are completed;
* at a specified timestamp;
* after a specified number of external operations;
* when the source commit changes;
* when the evidence digest changes;
* when the coverage identity changes;
* when a governing policy changes;
* when the human operator revokes permission.

An authorization must not automatically renew across phases or sessions.

When expiration cannot be determined confidently, treat the authorization as
inactive.

---

## 17. Revocation

The human operator may revoke authorization at any time.

After revocation:

* Do not begin new implementation work.
* Do not begin new external operations.
* Stop in-progress operations safely where possible.
* Preserve current local work and evidence.
* Clean only phase-created temporary resources when safe.
* Update `CODEX_EXECUTION_STATE.md`.
* Report the stopping point.
* Wait for new authorization.

Revocation does not authorize deletion of external resources created before the
revocation.

---

## 18. Updating the current authorization

A material authorization change requires:

* a new explicit human instruction;
* a new authorization ID or version;
* an updated authorization file;
* updated execution state;
* revalidation before execution continues.

Material changes include:

* phase;
* objective;
* repository scope;
* external access;
* external writes;
* credential use;
* destructive operations;
* governance modification;
* expiration;
* prohibited repositories.

Do not silently edit the authorization file to match work already performed.

---

## 19. Historical records

When authorization history is persisted, historical records should be
append-only.

A prior authorization should not be silently overwritten to conceal:

* broader scope;
* expiration;
* revocation;
* failed operations;
* governance permission;
* external write permission.

Corrections should create a new record that references the prior record.

Historical records do not authorize current execution.

---

## 20. Required validation before work

Before implementation begins, validate:

* the human instruction is explicit;
* the authorization file exists;
* its schema version is supported;
* its status is active;
* the authorization ID is present;
* the phase is recognized;
* the objective matches the human instruction;
* the authorization has not expired;
* the local repository matches the authorized scope;
* requested operations are permitted;
* the prohibited-repository policy is available and valid;
* governance-file integrity is recorded;
* pre-existing user changes are understood.

Before every external write, repeat all relevant authorization checks.

---

## 21. Failure behavior

When authorization validation fails:

* do not modify source;
* do not begin a new phase;
* do not access prohibited repositories;
* do not perform external writes;
* do not use unauthorized credentials;
* do not perform destructive actions;
* do not modify governance files;
* preserve current work;
* report the exact validation failure.

Authorization uncertainty must always result in narrower behavior.

---

## 22. Template usage

Create a new authorization record from:

`codex/authorizations/authorization-template.yaml`

The template contains placeholders and defaults.

A template is not active authorization.

Before activating an authorization:

* Replace all required placeholders.
* Remove permissions not granted by the human.
* Keep omitted or uncertain operations denied.
* Validate the file against the authorization schema.
* Compare it with the latest explicit human instruction.
* Record the authorization ID in `CODEX_EXECUTION_STATE.md`.
* Verify the authorization status is active.

Do not activate an authorization merely to allow planned work to proceed.

---

## 23. Current repository state

The existence of files in this directory does not mean an implementation phase
is currently authorized.

Until a valid human instruction and matching active authorization record exist,
Codex may only perform work explicitly permitted by the current conversation.

The authorization directory must never be treated as a self-starting task
queue.
