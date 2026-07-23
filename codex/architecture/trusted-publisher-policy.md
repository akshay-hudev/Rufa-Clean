# Trusted Publisher Policy

This document defines the architecture and safety requirements for publishing a
verified DCAv2 remediation result to an external version-control provider.

The trusted publisher is a narrow security boundary responsible only for
authenticated source-control publication.

It must not perform repository analysis, determine deadness, approve
remediation, or execute repository-controlled code.

This document must be applied together with:

- `codex/core/03-safety-invariants.md`;
- `codex/core/05-phase-authorization-protocol.md`;
- `codex/core/07-source-control-policy.md`;
- `codex/core/08-secret-handling-policy.md`;
- `codex/access/external-operation-policy.md`;
- `codex/access/github-repository-policy.yaml`;
- `codex/access/prohibited-repositories.yaml`;
- `codex/architecture/trust-boundaries.md`;
- `codex/architecture/remediation-policy.md`;
- `codex/architecture/audit-policy.md`.

---

## 1. Core principle

A remediation result produced by an untrusted runner is not trusted for
publication.

The trusted publisher must independently validate all publication-critical
inputs before using external write credentials.

The publisher may create only:

- a dedicated remediation branch;
- approved commits containing the verified patch;
- a draft pull request.

The publisher must never:

- push directly to the default branch;
- merge a pull request;
- enable auto-merge;
- mark a draft pull request ready for review automatically;
- approve a pull request;
- bypass branch protections;
- rewrite shared history;
- modify repository settings;
- delete repositories;
- perform arbitrary external writes.

---

## 2. Publisher responsibilities

The trusted publisher is responsible for:

1. Authenticating the publication request.
2. Validating the current phase authorization.
3. Validating the publication authorization.
4. Validating repository identity.
5. Applying the prohibited-repository policy.
6. Resolving and validating the base commit.
7. Validating finding and remediation identities.
8. Validating human disposition.
9. Validating remediation authorization.
10. Validating evidence and coverage freshness.
11. Validating required gate results.
12. Validating the patch hash.
13. Validating the changed-file allowlist.
14. Reacquiring a clean source snapshot.
15. Applying the exact verified patch.
16. Verifying the resulting Git diff.
17. Creating a dedicated remediation branch.
18. Creating approved commits.
19. Pushing only the dedicated branch.
20. Creating a draft pull request.
21. Enforcing idempotency.
22. Recording the publication result.
23. Cleaning publisher-created temporary resources.

The publisher must reject requests that fail any required validation.

---

## 3. Publisher non-responsibilities

The publisher must not:

- discover dead-code candidates;
- run analyzers;
- calculate coverage;
- classify findings;
- create human dispositions;
- create remediation authorization;
- decide whether a symbol is dead;
- select a transformation;
- modify the verified patch;
- run package installation;
- run repository builds;
- run repository tests;
- run repository scripts;
- execute Git hooks;
- repair remediation failures;
- broaden publication scope.

These responsibilities belong to other trusted or isolated components.

---

## 4. Publication request

A publication request must be structured and machine-readable.

It should contain:

- publication-request ID;
- idempotency identity;
- account or tenant ID;
- phase-authorization ID;
- human-disposition ID;
- remediation-authorization ID;
- remediation-attempt ID;
- finding ID;
- repository provider;
- repository owner;
- repository name;
- canonical repository full name;
- default branch identity;
- authorized base commit;
- source snapshot digest;
- evidence digest;
- coverage digest;
- classification-policy version;
- remediation-policy version;
- transformation identity;
- canonical patch hash;
- patch artifact reference;
- changed-file allowlist;
- baseline gate summary;
- post-change gate summary;
- requested branch name;
- requested commit metadata;
- requested draft pull-request metadata;
- request creation time;
- request expiration.

Free-form text must not replace required structured identity fields.

---

## 5. Request authentication

The publisher must authenticate publication requests.

Authentication may use an approved mechanism such as:

- mutually authenticated service communication;
- signed request envelopes;
- short-lived workload identity;
- authenticated internal queues;
- authenticated database-backed job records.

The authentication mechanism must bind the request to:

- request identity;
- tenant;
- intended publisher;
- request payload;
- creation time;
- expiration.

A valid transport identity does not prove that the publication request is
authorized.

Authorization and payload validation remain mandatory.

---

## 6. Request integrity

The publisher must verify that the request payload has not changed after
approval.

The request should include a deterministic digest over publication-critical
fields.

Applicable fields include:

- repository identity;
- base commit;
- finding ID;
- evidence digest;
- coverage digest;
- human-disposition ID;
- remediation-authorization ID;
- patch hash;
- changed-file allowlist;
- requested operation;
- publication-policy version.

A digest mismatch must cause rejection.

---

## 7. Authorization validation

Before publication, the publisher must validate:

- the phase authorization exists;
- its status is active;
- it has not expired;
- it permits external modification;
- it permits external branch creation;
- it permits draft pull-request creation;
- the repository is within scope;
- the requested write count is within limits;
- credential use is permitted;
- publication remains within the authorized phase.

A phase authorization does not replace finding-specific remediation
authorization.

---

## 8. Human disposition validation

The publisher must verify that the finding has a current human disposition of:

```text
confirmed_dead
```

The disposition must bind to:

- finding ID;
- repository;
- immutable source snapshot;
- exact source occurrence;
- evidence digest;
- coverage digest;
- applicable policy version.

The publisher must reject dispositions that are:

- missing;
- revoked;
- expired;
- superseded;
- stale;
- bound to a different finding;
- bound to a different source snapshot;
- bound to different evidence or coverage.

---

## 9. Remediation authorization validation

The publisher must verify a separate current remediation authorization.

The authorization must permit:

- the exact repository;
- the exact source commit;
- the exact finding;
- the transformation type;
- the changed files;
- the publication operation;
- the draft pull-request count.

The publisher must reject remediation authorization that is:

- missing;
- expired;
- revoked;
- stale;
- exceeded;
- broader than the current human instruction;
- inconsistent with the remediation attempt.

---

## 10. Repository identity validation

The publisher must use exact canonical repository identity.

For GitHub, validate:

- provider;
- owner;
- repository name;
- canonical full name;
- provider repository ID when available.

Repository identity must not be derived solely from:

- a clone URL;
- a display name;
- a branch name;
- a local directory name;
- repository-controlled configuration;
- pull-request text.

Ambiguous repository identity must cause rejection.

---

## 11. Publication-role exclusion enforcement

Before every repository-specific operation, the publisher must evaluate:

`codex/access/prohibited-repositories.yaml`

A repository excluded for `publication_target` must not receive automated
dead-code remediation publication. `akshay-hudev/Rufa-Clean` has that permanent
exclusion.

This exclusion does not by itself block separately authorized implementation
development operations, but implementation authorization cannot be presented
as automated remediation publication authority.

Broad account authorization, valid credentials, or an apparently approved
remediation request must not override the target-role exclusion. A matching
repository, role, and operation must be rejected before publication effects.

---

## 12. Source freshness

The publisher must validate that the authorized base commit remains applicable.

It must verify:

- the commit exists in the target repository;
- the commit belongs to the authorized repository;
- the requested base branch is permitted;
- the remediation was verified against the same commit;
- the source snapshot digest matches;
- the finding and patch remain bound to that commit.

The publisher must not silently rebase an approved patch onto a newer commit.

When the target branch has advanced, the publisher must follow the configured
policy.

The safe default is to reject the stale request and require new analysis,
verification, and authorization.

---

## 13. Clean source acquisition

The publisher must acquire a clean trusted publication workspace.

The workspace must:

- contain only the authorized repository;
- begin at the exact authorized base commit;
- contain no pre-existing user changes;
- contain no untrusted runner state;
- disable repository Git hooks;
- use controlled Git configuration;
- use no credential-bearing remote URL;
- be isolated from unrelated repositories;
- be unique to the publication attempt.

The publisher must not publish from the untrusted runner's writable workspace.

---

## 14. Publisher execution restrictions

The publisher may execute only narrowly approved publication operations.

Permitted operations may include:

- safe Git metadata inspection;
- checkout of the exact base commit;
- application of the verified patch;
- diff generation;
- patch-hash verification;
- changed-file validation;
- commit creation;
- dedicated branch push;
- draft pull-request creation.

The publisher must not execute:

- package-manager commands;
- compiler commands;
- test commands;
- build commands;
- repository scripts;
- repository binaries;
- lifecycle hooks;
- arbitrary shell commands supplied by the repository;
- commands supplied through patch content.

---

## 15. Git hook isolation

Repository-controlled Git hooks are untrusted.

The publisher must ensure they cannot execute during:

- checkout;
- patch application;
- commit creation;
- push;
- cleanup.

The publisher should use a controlled empty hooks directory or an equivalent
enforcement mechanism.

A hook supplied by the target repository must never receive publisher
credentials.

---

## 16. Patch artifact validation

Before applying a patch, the publisher must validate:

- artifact identity;
- artifact content hash;
- canonical patch hash;
- artifact size;
- patch format;
- encoding;
- repository binding;
- base-commit binding;
- remediation-attempt binding;
- transformation identity;
- creation provenance.

The publisher must reject:

- malformed patches;
- oversized patches;
- patches with unsupported paths;
- patches containing binary content when not authorized;
- patches with absolute paths;
- patches with path traversal;
- patches targeting another repository;
- patches whose hash differs from the approved hash.

---

## 17. Patch application

The publisher must apply the exact verified patch to the exact clean base
commit.

Patch application must fail when:

- the patch does not apply cleanly;
- context differs;
- a target file is missing;
- a source occurrence has changed;
- the patch affects an unexpected path;
- file metadata changes unexpectedly;
- the resulting diff differs from the verified patch.

The publisher must not manually resolve patch conflicts.

A conflict requires renewed remediation against the current source state.

---

## 18. Changed-file allowlist

The publisher must compare the final Git diff against the authorized
changed-file allowlist.

Validation must include:

- added files;
- modified files;
- deleted files;
- renamed files;
- file modes;
- symbolic links;
- line-ending effects;
- binary files;
- submodule changes.

Any unexpected changed file or metadata change must cause rejection.

The publisher must not remove an unexpected change and continue silently.

---

## 19. Prohibited changed files

Unless explicitly authorized by a separate applicable policy, publication must
reject changes to:

- `AGENTS.md`;
- files under `codex/core/`;
- files under `codex/access/`;
- authorization records;
- phase test manifests;
- security workflows;
- repository settings metadata;
- secret-bearing files;
- credential files;
- deployment infrastructure;
- database migrations;
- generated artifacts;
- package lockfiles;
- Git submodules.

Some of these files may be changed through other authorized workflows, but they
must not be included accidentally in an ordinary dead-code remediation patch.

---

## 20. Secret scanning and redaction

Before commit or push, the publisher must check the publication content for
likely secret exposure.

The check should cover:

- patch content;
- changed files;
- branch name;
- commit message;
- pull-request title;
- pull-request body;
- external identifiers;
- remote configuration.

A detected or suspected secret must block publication.

The publisher must not reproduce the suspected secret in logs or reports.

Secret scanning is a preventive control and must not be described as proof that
no secret exists.

---

## 21. Patch-hash revalidation

After applying the patch, the publisher must generate a canonical representation
of the resulting diff.

It must verify that the resulting canonical hash equals the approved patch hash.

A mismatch must cause rejection.

The publisher must not:

- edit the patch;
- add formatting changes;
- update generated files;
- repair tests;
- change commit metadata that affects the canonical patch representation;
- substitute a semantically similar patch.

---

## 22. Gate-result validation

The publisher must validate structured records proving that all required gates
passed.

Applicable records include:

- finding reproduction;
- baseline gates;
- transformation validation;
- changed-file validation;
- post-change gates;
- patch-stability checks;
- secret checks.

The publisher must reject gate records that are:

- missing;
- malformed;
- stale;
- bound to another source commit;
- bound to another remediation attempt;
- reported as unavailable;
- reported as skipped;
- timed out;
- resource exceeded;
- failed.

The publisher does not rerun repository-controlled gates.

It validates the trusted records produced through the approved remediation
workflow.

---

## 23. Publication branch

The publisher may create only a dedicated remediation branch.

The branch must:

- begin at the authorized base commit;
- be within an approved naming prefix;
- contain no secrets or sensitive source details in its name;
- be associated with one idempotency identity;
- contain only the approved remediation commits.

Recommended branch naming components include:

```text
dcav2/remediation/<finding-or-attempt-identifier>
```

The exact format must be provider-safe and collision-resistant.

---

## 24. Existing branch handling

Before branch creation, the publisher must determine whether the requested
branch already exists.

When it exists:

- verify repository identity;
- verify branch ownership by the same publication identity;
- verify its base commit;
- verify its commit content;
- verify its patch hash;
- verify any associated draft pull request.

The publisher may reuse the branch only when it represents the same idempotent
publication.

It must not overwrite or force-update an unrelated branch.

---

## 25. Commit creation

The publisher may create approved commits containing only the verified patch.

Commit metadata should include:

- concise remediation purpose;
- finding or remediation-attempt reference;
- no secret values;
- no unsupported completion claims.

Commit creation must not execute untrusted hooks.

The commit tree must be validated before push.

The publisher must record the resulting commit hash.

---

## 26. Commit signing

Commit signing may be supported when:

- explicitly configured;
- keys remain within the trusted publisher;
- signing does not expose secrets;
- signing behavior is deterministic enough for the publication process;
- repository policy requires it.

The absence of optional signing must not be concealed.

Signing authority must not be available to the untrusted runner.

---

## 27. Push restrictions

The publisher may push only:

- to the exact authorized repository;
- to the dedicated remediation branch;
- using the approved publication credential;
- after all validation succeeds.

The publisher must never:

- push to the default branch;
- force-push shared history;
- push unrelated commits;
- push tags;
- push releases;
- push to an upstream repository when only a fork is authorized.

The push destination must be verified immediately before execution.

---

## 28. Draft pull-request creation

After a successful branch push, the publisher may create a draft pull request
when explicitly authorized.

The pull request must target:

- the exact authorized repository;
- the permitted base branch;
- the dedicated remediation branch;
- the authorized base commit relationship.

The pull request must be created with draft status enabled.

Failure to create draft status must block or reverse pull-request creation when
the provider supports safe reversal.

---

## 29. Pull-request content

The draft pull-request body should include:

- finding ID;
- remediation-attempt ID;
- base commit;
- high-level remediation rationale;
- changed-file summary;
- transformation method;
- baseline gate summary;
- post-change gate summary;
- known limitations;
- statement that the pull request is draft-only;
- statement that human review and merge remain required.

The pull-request content must not include:

- secret values;
- private keys;
- tokens;
- credential-bearing URLs;
- unbounded command output;
- unnecessary source excerpts;
- unsupported claims of certainty.

---

## 30. Pull-request prohibitions

The publisher must not automatically:

- mark the draft ready for review;
- approve the pull request;
- request bypass of required reviews;
- merge the pull request;
- enable auto-merge;
- dismiss reviews;
- modify branch protection;
- override status checks;
- close unrelated issues;
- delete the branch after merge.

These prohibitions apply even when the publication credential has
administrative permissions.

---

## 31. Idempotency identity

Every publication must have a stable idempotency identity.

The identity should include applicable:

- provider;
- repository;
- base commit;
- finding ID;
- remediation-authorization ID;
- remediation-attempt ID;
- patch hash;
- publication-policy version.

The identity must not include unstable values such as:

- request timestamp;
- temporary path;
- random retry ID;
- log location.

Retries of the same publication request must resolve to the same logical
publication identity.

---

## 32. Idempotent retry behavior

Before retrying publication, the publisher must inspect the existing authorized
external state.

Possible safe outcomes include:

- return the existing branch;
- return the existing draft pull request;
- complete draft pull-request creation after a verified branch push;
- report that the prior operation did not modify external state;
- reject an inconsistent partial state.

Retries must not create duplicate:

- branches;
- commits;
- pull requests;
- comments;
- publication records.

---

## 33. Partial publication states

The publisher must handle partial success explicitly.

Examples include:

- branch created but push failed;
- push succeeded but pull-request creation failed;
- provider request timed out after accepting the operation;
- draft pull request exists but local response was lost.

When partial success is possible:

1. Stop blind retries.
2. Query current provider state using authorized reads.
3. Validate the idempotency identity.
4. Record completed steps.
5. Continue only when the next step remains safe and authorized.
6. Reject inconsistent or unrelated existing state.

An unknown result must not be treated as no external change.

---

## 34. Publication statuses

A publication request must use an explicit status.

Supported statuses may include:

- `requested`;
- `validating`;
- `rejected`;
- `workspace_preparing`;
- `patch_applying`;
- `patch_verified`;
- `branch_creating`;
- `branch_pushed`;
- `draft_pull_request_creating`;
- `published_draft`;
- `partially_published`;
- `failed`;
- `stale`;
- `revoked`;
- `cleanup_failed`.

A status must reflect actual external state.

---

## 35. Rejection reasons

Publisher rejection reasons should use stable machine-readable identifiers.

Examples include:

- `authorization_missing`;
- `authorization_expired`;
- `publication_not_permitted`;
- `repository_identity_mismatch`;
- `repository_prohibited`;
- `base_commit_stale`;
- `finding_stale`;
- `human_disposition_invalid`;
- `remediation_authorization_invalid`;
- `evidence_digest_mismatch`;
- `coverage_digest_mismatch`;
- `required_gate_not_passed`;
- `patch_hash_mismatch`;
- `patch_malformed`;
- `patch_path_invalid`;
- `unexpected_changed_file`;
- `secret_detected`;
- `branch_conflict`;
- `idempotency_conflict`;
- `credential_unavailable`;
- `credential_scope_invalid`;
- `provider_failure`.

Rejection must not be reported as publication success.

---

## 36. Credential isolation

Publisher credentials must remain within the trusted publisher boundary.

They must not be:

- sent to the controller as plaintext;
- sent to the untrusted runner;
- placed in repository files;
- embedded in remote URLs;
- written to logs;
- included in reports;
- included in process arguments when avoidable;
- exposed through environment dumps;
- persisted longer than necessary.

Use short-lived, repository-scoped credentials when available.

---

## 37. Credential scope

The publisher should use the narrowest credential capable of:

- creating the dedicated branch;
- pushing the approved commits;
- creating the draft pull request.

The credential should not permit unnecessary:

- repository administration;
- organization administration;
- workflow modification;
- secret management;
- destructive operations.

When only materially broader credentials are available, the publisher must
report the scope concern and stop unless an explicitly approved security policy
permits their use.

---

## 38. Tenant isolation

Publication data and credentials must remain tenant-scoped.

The publisher must validate that:

- the request tenant matches the repository connection;
- the credential belongs to the same tenant or authorized account;
- the finding belongs to the same tenant;
- the remediation authorization belongs to the same tenant;
- the publication record is written to the same tenant scope.

Evidence, authorization, or credentials from one tenant must never authorize
publication for another tenant.

---

## 39. Provider abstraction

The trusted publisher may support several version-control providers through
versioned adapters.

Each provider adapter must define:

- repository identity rules;
- branch semantics;
- draft pull-request or merge-request behavior;
- credential requirements;
- idempotency lookup;
- default-branch protection;
- error mapping;
- rate-limit behavior;
- partial-success behavior;
- audit fields.

A generic interface must not conceal provider-specific safety limitations.

Support for one provider must not be reported as universal publication support.

---

## 40. GitHub adapter requirements

A GitHub publisher adapter should validate:

- canonical repository owner and name;
- provider repository ID when available;
- default branch;
- base commit;
- branch existence;
- matching draft pull request;
- draft status;
- pull-request head and base;
- provider response identity;
- rate-limit state.

The adapter must follow:

`codex/access/github-repository-policy.yaml`

The GitHub adapter must never use repository administration permissions as
justification to bypass permanent publication restrictions.

---

## 41. External operation records

Every material publisher operation must produce an external-operation record.

Applicable operations include:

- repository validation;
- source acquisition;
- branch lookup;
- branch creation;
- push;
- draft pull-request lookup;
- draft pull-request creation;
- retry;
- rejection;
- cleanup.

Each record should include:

- authorization ID;
- publication-request ID;
- idempotency identity;
- provider;
- repository;
- operation;
- start time;
- completion time;
- result;
- external identifier;
- whether external state changed;
- failure category;
- credential type without value.

---

## 42. Audit events

The publisher must emit append-only audit events for:

- request received;
- request authenticated;
- authorization validated;
- denylist evaluated;
- repository identity validated;
- source acquired;
- patch validated;
- patch applied;
- changed files validated;
- branch created;
- push completed;
- draft pull request created;
- request rejected;
- partial state detected;
- retry completed;
- authorization revoked;
- cleanup completed;
- cleanup failed.

Audit events must not contain secret values.

---

## 43. Logging

Publisher logs must be bounded and redacted.

Logs may include:

- publication-request ID;
- repository identity;
- operation status;
- commit hash;
- branch name;
- pull-request number;
- failure category;
- timing;
- retry count.

Logs must not include:

- credentials;
- authentication headers;
- private keys;
- credential-bearing URLs;
- full environment dumps;
- full patch content unless stored in a controlled artifact;
- unnecessary private source content.

---

## 44. Cancellation and revocation

When publication authorization is revoked:

- do not begin new external writes;
- do not retry uncertain writes automatically;
- stop before push when possible;
- stop before pull-request creation when possible;
- preserve existing external identifiers;
- record any external state already created;
- perform only safe local cleanup;
- wait for new human direction.

Revocation does not automatically authorize deletion of an already-created
branch or draft pull request.

---

## 45. Cleanup

The publisher must clean resources it created for the publication attempt.

Applicable resources include:

- temporary workspaces;
- temporary credential files;
- transient Git configuration;
- temporary patch files;
- background processes;
- local temporary branches;
- temporary authentication state.

Cleanup must not remove:

- the external remediation branch;
- the draft pull request;
- unrelated local repositories;
- user work;
- audit records.

Cleanup failure must be reported explicitly.

---

## 46. Availability failure

When publication credentials or provider access are unavailable, the publisher
must:

- avoid external writes;
- preserve the verified publication-ready result;
- record the missing capability;
- return an explicit unavailable or blocked status;
- avoid claiming that a branch or pull request exists.

A publication-ready local result is not a published result.

---

## 47. Rate limits and transient failures

The publisher must respect provider rate limits.

Transient read operations may be retried within policy.

Write operations may be retried only when:

- idempotency is established;
- prior external state is checked;
- authorization remains current;
- target state remains valid;
- the retry limit is not exceeded.

The publisher must not evade rate limits using unauthorized credentials or
accounts.

---

## 48. Security failures

The following must be treated as security failures rather than ordinary
publication errors:

- publisher credentials exposed to the runner;
- excluded remediation-publication target operation;
- unauthorized default-branch push;
- patch content changed after verification;
- unexpected governance-file changes;
- credential-bearing remote URL;
- Git hook execution;
- cross-tenant publication;
- unauthorized external write;
- branch-protection bypass;
- secret detected after push.

Security failures require immediate stop, bounded evidence preservation, audit,
and human review.

---

## 49. Capability reporting

Trusted publication support must be reported per provider and operation.

For each provider, report separately:

- repository identity validation;
- denylist enforcement;
- clean source acquisition;
- base-commit validation;
- patch-hash validation;
- changed-file validation;
- branch creation;
- push;
- draft pull-request creation;
- idempotent retry;
- partial-state recovery;
- credential isolation;
- hostile-fixture validation;
- scale validation.

An adapter interface or mocked provider test does not constitute operational
publication support.

---

## 50. Testing requirements

Trusted publisher tests should cover:

- valid draft publication;
- missing phase authorization;
- missing publication authorization;
- expired authorization;
- revoked authorization;
- invalid human disposition;
- invalid remediation authorization;
- repository excluded for the publication target role;
- repository identity mismatch;
- stale base commit;
- evidence digest mismatch;
- coverage digest mismatch;
- failed required gate;
- malformed patch;
- patch-hash mismatch;
- path traversal;
- unexpected changed file;
- file-mode change;
- secret-bearing patch;
- existing matching branch;
- existing unrelated branch;
- duplicate publication retry;
- partial branch-only state;
- provider timeout after write;
- credential unavailable;
- credential scope too broad;
- Git hook suppression;
- default-branch push rejection;
- merge rejection;
- auto-merge rejection;
- cross-tenant rejection;
- cleanup failure.

Tests must use synthetic repositories and credentials.

---

## 51. Invariant tests

Where practical, invariant tests should verify:

- changing the patch after verification always causes rejection;
- changing the base commit always causes rejection;
- removing publication permission cannot produce an external write;
- adding an unexpected file always blocks publication;
- a repository excluded for remediation publication can never enter that
  publication workflow;
- the runner can never publish directly;
- equivalent requests reuse the same publication identity;
- retries do not create duplicate pull requests;
- publisher credentials never appear in runner inputs;
- no successful result is returned without verified external state;
- one tenant's authorization cannot publish another tenant's patch.

---

## 52. Production deployment requirements

A production publisher deployment should define:

- process or service identity;
- authenticated request channel;
- credential source;
- credential rotation;
- tenant isolation;
- network egress policy;
- source workspace isolation;
- Git hook isolation;
- audit destination;
- rate limits;
- resource limits;
- timeout policy;
- retry policy;
- incident response;
- health monitoring.

Development profiles must not be represented as production-equivalent without
validating these controls.

---

## 53. Database representation

The preferred persistence model is relational and append-oriented.

Possible structures include:

- `publication_requests`;
- `publication_request_validations`;
- `publication_attempts`;
- `publication_external_operations`;
- `publication_branches`;
- `publication_pull_requests`;
- `publication_rejections`;
- `publication_cleanup_records`.

Names are illustrative until implemented through an authorized phase.

Historical publication records must not be rewritten to conceal partial or
failed operations.

---

## 54. Migration requirements

Publisher-model evolution must use additive, ordered migrations.

Migration planning must consider:

- historical publication requests;
- idempotency identities;
- branch records;
- pull-request records;
- partial publication states;
- rejection reasons;
- credential capability metadata;
- tenant isolation;
- audit reconstruction.

A historical failed or partial publication must not be rewritten as successful.

---

## 55. Fail-safe behavior

When publication authority, identity, patch integrity, or external state cannot
be established confidently:

- do not push;
- do not create a branch;
- do not create a pull request;
- do not broaden credential use;
- do not perform an excluded remediation-publication target operation;
- do not modify the patch;
- do not retry an uncertain write blindly;
- preserve the verified local result;
- record the exact blocker;
- return a rejected, blocked, stale, unavailable, or failed status.

Publication uncertainty must reduce authority.

---

## 56. Policy integrity

This document must not be modified during implementation unless architecture or
governance modification is explicitly authorized.

Changes require:

1. Identification of the publication problem.
2. Review against permanent safety invariants.
3. Review of authorization and remediation separation.
4. Review of credential and tenant isolation.
5. Review of idempotency and partial-state behavior.
6. Updated provider-adapter tests.
7. Updated hostile publication fixtures.
8. Migration planning.
9. A reviewable architecture commit.
10. An ADR when the change alters a long-lived publisher, credential,
    idempotency, or external-write boundary.

This policy must not be weakened to simplify branch creation, bypass patch
verification, reuse untrusted workspaces, or automate merge.
