# Remediation Policy

This document defines the architecture and safety requirements for changing
source code in response to a DCAv2 finding.

Remediation is a distinct workflow that begins only after analysis,
classification, human review, and separate remediation authorization have
completed successfully.

This document must be applied together with:

- `codex/core/03-safety-invariants.md`;
- `codex/core/04-accuracy-and-evidence-policy.md`;
- `codex/core/05-phase-authorization-protocol.md`;
- `codex/core/07-source-control-policy.md`;
- `codex/architecture/evidence-model.md`;
- `codex/architecture/coverage-model.md`;
- `codex/architecture/classification-policy.md`;
- `codex/architecture/trusted-publisher-policy.md`.

---

## 1. Core principle

DCAv2 must never modify source code solely because an analyzer reports that code
is unused.

A remediation attempt requires a complete chain of current, attributable, and
auditable decisions.

At minimum, remediation requires:

1. A current finding bound to an immutable source snapshot.
2. A machine classification compatible with human review.
3. A current human disposition confirming the finding as dead.
4. A separate current remediation authorization.
5. Successful reproduction of the exact finding.
6. Successful baseline verification.
7. An explicitly supported transformation.
8. Successful post-change verification.
9. A verified changed-file allowlist.
10. A deterministic patch.
11. Separate publication authorization when an external write is requested.

Failure of any required condition must block remediation or publication.

---

## 2. Remediation stages

The remediation workflow must preserve the following stages:

```text
Finding selected
        ↓
Finding identity validated
        ↓
Evidence and coverage freshness validated
        ↓
Human disposition validated
        ↓
Remediation authorization validated
        ↓
Immutable source snapshot acquired
        ↓
Exact finding reproduced
        ↓
Baseline gates executed
        ↓
Supported transformation applied
        ↓
Changed files validated
        ↓
Post-change gates executed
        ↓
Patch canonicalized and hashed
        ↓
Publication eligibility validated
        ↓
Trusted publisher invoked when authorized
        ↓
Audit and cleanup completed
```

No stage may silently grant permission for a later stage.

---

## 3. Finding requirements

A remediation attempt must target one exact finding or an explicitly authorized
set of findings.

Each finding must identify:

- finding ID;
- account or tenant;
- repository;
- immutable source snapshot;
- source document;
- exact source occurrence;
- semantic entity;
- finding type;
- machine classification;
- evidence digest;
- coverage digest;
- classification-policy version;
- classification time.

A symbol name alone is insufficient finding identity.

A repository branch name alone is insufficient source identity.

---

## 4. Current classification requirement

The finding must have a current machine classification compatible with
remediation review.

The default compatible classification is:

- `candidate_dead`.

The following classifications must block remediation:

- `live_evidence_present`;
- `test_only`, unless a separate supported test-code remediation policy exists;
- `inconclusive`;
- `conflicting`;
- `unsupported`;
- `stale`;
- `failed`.

A numeric confidence score must not override an incompatible classification.

---

## 5. Human disposition

A human disposition is a review decision about the finding.

Supported dispositions may include:

- `confirmed_dead`;
- `confirmed_alive`;
- `deferred`;
- `excluded`;
- `inconclusive`.

Only a current `confirmed_dead` disposition may satisfy the default dead-code
remediation prerequisite.

The disposition must record:

- disposition ID;
- reviewer identity;
- finding ID;
- source snapshot;
- source occurrence;
- evidence digest;
- coverage digest;
- classification-policy version;
- rationale;
- creation time;
- expiration or invalidation conditions.

The human disposition must remain separate from remediation authorization.

---

## 6. Remediation authorization

A remediation authorization grants permission to attempt a bounded source
change.

It must record:

- authorization ID;
- finding ID or explicitly bounded finding set;
- repository;
- immutable source commit;
- permitted file paths;
- permitted transformation types;
- maximum attempts;
- baseline gates;
- post-change gates;
- changed-file expectations;
- publication permission;
- expiration conditions;
- authorizing human identity;
- creation time.

A remediation authorization must not be inferred from:

- a `confirmed_dead` disposition;
- a machine classification;
- an active implementation phase;
- available write credentials;
- a generated remediation plan;
- successful tests;
- a prior remediation attempt.

---

## 7. Authorization freshness

A remediation authorization becomes invalid when any bound identity changes.

Invalidation triggers include:

- repository identity changes;
- source commit changes;
- source occurrence changes;
- finding identity changes;
- evidence digest changes;
- coverage digest changes;
- human disposition changes;
- classification-policy version changes materially;
- remediation-policy version changes materially;
- authorization expires;
- human authorization is revoked.

A stale authorization must not be renewed automatically.

---

## 8. Source acquisition

Remediation must begin from the exact authorized immutable source snapshot.

Source acquisition must:

1. Validate the repository against access policy.
2. Apply the prohibited-repository denylist.
3. Resolve the authorized commit.
4. Verify the source snapshot digest.
5. Remove credential-bearing remotes.
6. Disable untrusted Git hooks.
7. Create an isolated writable remediation workspace.
8. Record the workspace identity.
9. Preserve the original snapshot for comparison.

The writable workspace must not contain unrelated user changes.

---

## 9. Prohibited repositories

No remediation stage may access a prohibited repository.

A prohibited repository must not be:

- cloned;
- fetched;
- inspected;
- analyzed;
- used for finding reproduction;
- used as a transformation target;
- branched;
- published to;
- used as a source of supporting fixtures.

Broad account authorization does not override the denylist.

---

## 10. Exact finding reproduction

Before transformation, DCAv2 must reproduce the exact authorized finding against
the authorized source snapshot.

Reproduction must verify:

- repository identity;
- immutable commit;
- source document hash;
- source occurrence;
- semantic entity;
- finding type;
- relevant analyzer behavior;
- evidence digest;
- coverage digest;
- classification result.

Reproduction must fail when:

- the occurrence no longer exists;
- the symbol resolves differently;
- the analyzer result materially changes;
- positive liveness evidence appears;
- required coverage is no longer complete;
- the source file hash differs;
- the finding maps ambiguously;
- the finding becomes stale.

A similar symbol with the same name is not sufficient reproduction.

---

## 11. Baseline verification

All required baseline gates must execute before transformation.

Applicable gates may include:

- dependency installation;
- type checking;
- compilation;
- build;
- lint;
- unit tests;
- integration tests;
- service startup;
- health checks;
- generated-artifact validation;
- repository-specific validation.

Each gate must define:

- gate ID;
- command identity;
- runner profile;
- working directory;
- timeout;
- resource limits;
- expected result;
- required or conditional status.

Only `passed` satisfies a required baseline gate.

---

## 12. Baseline failure

Remediation must stop when a required baseline gate is:

- failed;
- timed out;
- resource exceeded;
- unavailable;
- configuration required;
- skipped by policy;
- not run.

A failing baseline must not be repaired through the remediation patch unless:

- the failure is directly caused by a narrow, authorized prerequisite defect;
- fixing it is within the active implementation authorization;
- the repair is independently tested;
- the repair is not hidden inside the dead-code patch.

Baseline defects must remain distinguishable from remediation changes.

---

## 13. Toolchain availability

Required compilers, package managers, analyzers, and test tools must be available
inside the approved runner environment.

DCAv2 must not silently fall back to:

- host-global executables;
- undeclared compilers;
- trusted-controller execution;
- skipped verification;
- alternative commands not authorized by the gate definition.

When a required executable is missing, the gate must report an explicit
unavailable or configuration-required result.

---

## 14. Transformation support

DCAv2 may apply only explicitly supported transformation shapes.

A transformation definition must identify:

- transformation ID;
- language;
- supported syntax shape;
- supported semantic shape;
- target finding type;
- transformation engine;
- engine version;
- rule or query version;
- preconditions;
- expected rewrite count;
- expected changed files;
- unsupported cases;
- idempotency behavior;
- rollback behavior.

Detection support and transformation support must be reported separately.

---

## 15. Unsupported transformation cases

A transformation must fail safely when it encounters an unsupported shape.

Examples include:

- overloaded declarations not covered by the rule;
- symbols participating in reflection;
- generated code;
- public API declarations;
- declarations with unresolved decorators;
- declarations with side-effecting initializers;
- syntax with ambiguous ownership;
- partial declarations;
- macro-generated code;
- language features unsupported by the parser;
- repository-specific transformations not covered by policy.

Unsupported cases must not fall back to broad text deletion.

---

## 16. Structured transformation

Transformations must use structured syntax- or semantics-aware mechanisms where
practical.

Preferred mechanisms include:

- abstract syntax tree transformations;
- concrete syntax tree transformations;
- Tree-sitter-based structural rewrites;
- compiler-supported transformations;
- language-aware refactoring tools;
- PolyglotPiranha rules where appropriate and approved.

Plain text replacement may be used only for explicitly bounded,
non-ambiguous transformations with strong verification.

Broad substring deletion is prohibited.

---

## 17. Rewrite count

Every transformation must define the expected rewrite count.

The transformation must fail when:

- zero rewrites occur unexpectedly;
- more rewrites occur than authorized;
- the rewritten occurrence differs from the authorized finding;
- the same rule affects an unrelated symbol;
- the transformation changes a different source snapshot.

A successful command exit code does not prove the correct rewrite occurred.

---

## 18. Changed-file allowlist

Every remediation attempt must define an expected changed-file allowlist.

The allowlist should identify:

- required source files;
- permitted lockfiles when dependency changes are authorized;
- permitted generated artifacts when explicitly required;
- permitted configuration files;
- prohibited file categories.

Unexpected changed files must block further remediation and publication.

Files that normally require explicit authorization include:

- governance files;
- CI workflows;
- deployment configuration;
- security configuration;
- package-manager lockfiles;
- generated code;
- database migrations;
- secret-bearing files;
- repository settings metadata.

---

## 19. File metadata validation

Changed-file validation must detect unintended:

- executable-bit changes;
- line-ending conversion;
- encoding changes;
- file renames;
- case-only path changes;
- symbolic-link changes;
- file-mode changes;
- permission changes;
- broad formatter rewrites.

Unexpected metadata changes must block publication.

---

## 20. Patch minimality

A remediation patch must be limited to the authorized objective.

It must not include unrelated:

- refactoring;
- formatting;
- dependency upgrades;
- documentation rewrites;
- test rewrites;
- architecture changes;
- configuration changes;
- cleanup of unrelated code;
- policy changes.

Supporting changes may be included only when:

- required by the transformation;
- explicitly authorized;
- included in the changed-file allowlist;
- independently explained;
- covered by verification.

---

## 21. Deterministic patch

Equivalent authorized inputs must produce the same semantic patch.

Patch generation must control applicable sources of nondeterminism, including:

- file ordering;
- formatter versions;
- locale;
- timestamps;
- temporary paths;
- random identifiers;
- tool versions;
- configuration order;
- generated headers.

The patch must be canonicalized before hashing.

---

## 22. Patch identity

A remediation patch must record:

- patch ID;
- remediation-attempt ID;
- repository;
- base commit;
- finding ID;
- transformation ID;
- transformation version;
- changed files;
- canonical patch hash;
- creation time;
- runner job ID;
- evidence digest;
- coverage digest;
- authorization IDs.

A patch hash must not include unstable metadata that changes without changing
the actual patch.

---

## 23. Patch stability

Where required by the transformation policy, DCAv2 should verify patch stability
by regenerating the patch from equivalent clean inputs.

The stability check must confirm:

- identical changed-file set;
- identical semantic edits;
- identical canonical patch hash;
- no additional rewrites on the second application.

A transformation that produces changing output across equivalent runs must be
treated as nondeterministic and non-publishable.

---

## 24. Transformation idempotency

Applying the same transformation to an already transformed workspace should
produce:

- zero additional authorized rewrites;
- no new changed files;
- no patch expansion;
- a clear already-applied or no-op status.

Idempotency does not permit the first transformation to accept an unexpected
zero-rewrite result.

The first attempt must still match the expected rewrite count.

---

## 25. Post-change verification

After transformation, every required post-change gate must run.

Post-change gates should normally include the applicable baseline gates.

Additional gates may include:

- focused regression tests;
- finding absence verification;
- semantic integrity checks;
- package export validation;
- generated-artifact consistency;
- API compatibility checks;
- service startup;
- health checks;
- patch stability checks;
- changed-file validation.

Only `passed` satisfies a required post-change gate.

---

## 26. Finding absence verification

Post-change verification must confirm that the authorized finding no longer
exists in the transformed source.

This check must verify:

- the exact occurrence was removed or changed as intended;
- no duplicate unauthorized occurrence was modified;
- the semantic entity no longer exists when deletion was intended;
- the transformation did not merely hide the finding from one analyzer;
- the source remains parseable;
- relevant semantic analysis still succeeds.

The absence check must use the appropriate structured analyzer or parser.

---

## 27. Regression requirements

A remediation must not cause new relevant failures.

Post-change verification must compare baseline and transformed results.

The remediation must fail when:

- a previously passing required gate fails;
- new compiler errors appear;
- new test failures appear;
- new analyzer failures appear;
- unrelated generated output changes;
- new security-policy violations appear;
- source acquisition or identity checks fail;
- the transformed workspace contains unexpected changes.

Existing baseline failures must not be hidden or reclassified.

---

## 28. Test modifications

Changing tests as part of remediation requires explicit justification.

A remediation must not:

- delete tests that reference the finding merely to make the code removable;
- weaken assertions;
- mark tests skipped;
- remove coverage;
- change expected behavior without authorization.

A test may be changed when:

- the test exclusively validates the authorized dead code;
- removal is part of the explicit remediation scope;
- no supported behavior is lost;
- changed test files are allowlisted;
- the rationale is recorded;
- all remaining required tests pass.

---

## 29. Lockfile and dependency changes

Removing dead dependencies may require lockfile changes.

Dependency remediation must be treated as a separate supported transformation
type.

It must verify:

- no remaining package usage;
- no transitive requirement is unintentionally removed;
- lockfile changes are deterministic;
- installation succeeds;
- builds and tests pass;
- package-manager version is fixed;
- only expected manifest and lockfiles changed.

A symbol-removal authorization does not automatically authorize dependency
removal.

---

## 30. Generated code

Generated files must not be edited directly unless the transformation policy
explicitly authorizes it.

Preferred behavior is to modify the authoritative source and regenerate the
artifact through a verified generator.

The remediation record must identify:

- authoritative source;
- generator;
- generator version;
- generation command;
- generated outputs;
- deterministic-output expectations.

When generated output cannot be reproduced safely, remediation must stop.

---

## 31. Multi-file remediation

A remediation may affect multiple files only when the transformation definition
and authorization explicitly permit it.

Multi-file changes must define:

- all expected files;
- relationship among edits;
- rewrite count per file;
- verification requirements;
- rollback behavior;
- partial-failure handling.

Partial multi-file transformation must not be published.

---

## 32. Multi-finding remediation

Combining several findings into one remediation attempt requires explicit
authorization.

The authorization must identify every finding and source occurrence.

Combined remediation must not be used to:

- hide unrelated changes;
- reduce review clarity;
- bypass per-finding human disposition;
- bypass per-finding evidence freshness;
- exceed changed-file limits.

If one finding becomes stale or fails verification, policy must define whether
the entire combined attempt fails. The default behavior is to fail the combined
attempt.

---

## 33. Public API remediation

Public or externally consumable API removal requires a separate deprecation and
compatibility workflow.

It must not use the ordinary private-code remediation path unless an approved
policy establishes:

- bounded consumer coverage;
- deprecation period;
- compatibility requirements;
- versioning strategy;
- customer or owner approval;
- migration guidance;
- observation period.

Internal reference absence is insufficient.

---

## 34. Test-only remediation

Code classified as `test_only` is not eligible for ordinary production
dead-code remediation by default.

A future test-code remediation policy must define:

- supported test scopes;
- required reviewers;
- test ownership;
- fixture implications;
- benchmark implications;
- public test API implications;
- required gates.

Until such a policy exists, `test_only` findings remain non-remediable.

---

## 35. Service-level remediation

Removing a source symbol is not equivalent to retiring a service.

Ordinary remediation must not delete or retire:

- deployments;
- databases;
- queues;
- topics;
- cloud resources;
- DNS;
- certificates;
- secrets;
- customer data;
- monitoring;
- backups.

Service retirement requires a separate operational workflow and authorization.

---

## 36. Untrusted runner

All repository-controlled remediation activity must execute in the approved
untrusted runner.

This includes:

- dependency installation;
- finding reproduction;
- baseline gates;
- transformation;
- post-change gates;
- service startup;
- patch generation.

The runner must not receive:

- publisher credentials;
- controller database credentials;
- cloud credentials;
- host SSH credentials;
- Docker socket access;
- unrelated environment variables.

---

## 37. Runner result validation

Runner output must be treated as untrusted.

The controller must validate:

- job identity;
- repository identity;
- source snapshot;
- transformation identity;
- output schema;
- changed files;
- patch format;
- patch size;
- artifact hashes;
- gate results;
- output bounds;
- secret redaction.

A runner's statement that tests passed is insufficient without structured gate
records.

---

## 38. Trusted publication boundary

A verified local remediation does not automatically authorize or perform
publication.

External publication must occur through the trusted publisher described in:

`codex/architecture/trusted-publisher-policy.md`

The trusted publisher must independently validate the verified patch and current
authorization.

The untrusted runner must never push branches or create pull requests.

---

## 39. Publication eligibility

A remediation result is eligible for publication only when:

- the remediation attempt completed successfully;
- source identity is current;
- finding identity is current;
- evidence digest is current;
- coverage digest is current;
- human disposition is current;
- remediation authorization is current;
- publication authorization is current;
- required baseline gates passed;
- required post-change gates passed;
- changed files match the allowlist;
- patch hash matches the verified patch;
- no secret-bearing content is present;
- publication idempotency is established.

Eligibility is not publication.

---

## 40. Draft-only publication

When publication is explicitly authorized, DCAv2 may create only:

- a dedicated remediation branch;
- a draft pull request.

DCAv2 must never:

- push directly to the default branch;
- merge;
- enable auto-merge;
- mark the draft ready for review automatically;
- bypass branch protections;
- modify repository settings;
- force-push shared history.

---

## 41. Publication idempotency

Publication retries must not create duplicate:

- branches;
- commits;
- pull requests;
- comments;
- audit records;
- remediation attempts.

A publication identity should include:

- repository;
- base commit;
- finding ID;
- remediation authorization;
- patch hash;
- publication-policy version.

When an equivalent publication already exists, return the existing result when
safe.

---

## 42. Remediation-attempt statuses

A remediation attempt must use an explicit status.

Supported statuses include:

- `requested`;
- `validating`;
- `reproducing`;
- `baseline_running`;
- `transforming`;
- `post_change_running`;
- `verified`;
- `publication_ready`;
- `published_draft`;
- `blocked`;
- `failed`;
- `stale`;
- `revoked`;
- `cancelled`;
- `cleanup_failed`.

A status must reflect actual execution.

`Publication_ready` must not be used when required publication preconditions are
missing.

---

## 43. Failure categories

A failed remediation attempt should identify one or more failure categories.

Examples include:

- `authorization_invalid`;
- `repository_prohibited`;
- `source_identity_mismatch`;
- `finding_not_reproduced`;
- `evidence_stale`;
- `coverage_stale`;
- `positive_liveness_discovered`;
- `baseline_failed`;
- `required_tool_unavailable`;
- `transformation_unsupported`;
- `rewrite_count_mismatch`;
- `unexpected_changed_file`;
- `patch_nondeterministic`;
- `post_change_failed`;
- `secret_detected`;
- `publication_not_authorized`;
- `publisher_rejected`;
- `cleanup_failed`.

Failures must remain auditable.

---

## 44. Retry behavior

A remediation may be retried only when:

- the current authorization remains valid;
- the source snapshot remains valid;
- the finding remains current;
- the retry addresses a documented transient or corrected failure;
- the maximum authorized attempt count is not exceeded;
- prior artifacts cannot be confused with the new attempt.

A retry must create a new remediation-attempt identity.

Do not overwrite the prior attempt.

---

## 45. Cancellation and revocation

When remediation authorization is revoked:

1. Stop beginning new remediation stages.
2. Stop before any external publication.
3. Terminate in-progress runner work safely where practical.
4. Preserve bounded evidence and artifacts.
5. Clean phase-created resources.
6. mark the attempt as `revoked`;
7. record the stopping point;
8. wait for new authorization.

Revocation does not authorize deletion of an already-created external branch or
draft pull request.

---

## 46. Cleanup

Each remediation attempt must define cleanup for:

- runner containers;
- temporary workspaces;
- temporary package-manager configuration;
- temporary credentials;
- background processes;
- test databases;
- generated artifacts not retained;
- local temporary branches when applicable.

Cleanup applies only to resources created by the attempt.

Cleanup failure must not be hidden.

The attempt must use `cleanup_failed` or an equivalent status when required
resources remain unexpectedly.

---

## 47. Audit requirements

The remediation workflow must produce append-only audit events for:

- remediation requested;
- authorization validated;
- source acquired;
- finding reproduced;
- baseline gate started;
- baseline gate completed;
- transformation started;
- transformation completed;
- changed files validated;
- post-change gate started;
- post-change gate completed;
- patch created;
- patch verified;
- publication requested;
- publisher accepted or rejected;
- draft pull request created;
- attempt failed;
- attempt revoked;
- cleanup completed or failed.

Audit events must not contain secrets.

---

## 48. Remediation record

A complete remediation record should identify:

- remediation-attempt ID;
- finding ID;
- human-disposition ID;
- remediation-authorization ID;
- phase-authorization ID;
- repository;
- base commit;
- evidence digest;
- coverage digest;
- transformation ID;
- runner profile;
- baseline results;
- changed files;
- patch hash;
- post-change results;
- publication eligibility;
- external publication identifiers;
- cleanup status;
- final status.

---

## 49. Human-readable explanation

Every remediation result must explain:

- why the finding was eligible;
- which human decisions applied;
- which source snapshot was used;
- how the finding was reproduced;
- which baseline gates ran;
- what transformation was applied;
- which files changed;
- which post-change gates ran;
- whether the patch was deterministic;
- whether publication was authorized;
- whether a draft pull request was created;
- which limitations remain.

The explanation must not expose secrets or unbounded logs.

---

## 50. Capability reporting

Remediation support must be reported per transformation shape.

For every supported transformation, report:

- language;
- finding type;
- syntax shape;
- semantic shape;
- transformation engine;
- baseline gates;
- post-change gates;
- fixture coverage;
- negative cases;
- unsupported cases;
- publication support;
- scale-validation status.

A successful private-function deletion fixture must not be reported as general
language remediation support.

---

## 51. Testing requirements

Remediation tests should cover:

- valid private-symbol removal;
- stale source rejection;
- stale evidence rejection;
- stale coverage rejection;
- missing human disposition;
- missing remediation authorization;
- finding reproduction failure;
- positive liveness discovered during reproduction;
- baseline failure;
- unavailable compiler;
- unsupported transformation shape;
- zero rewrite;
- multiple unexpected rewrites;
- unexpected changed file;
- generated-file modification;
- deterministic patch;
- idempotent second application;
- post-change failure;
- secret-bearing patch rejection;
- publication without authorization;
- publisher patch-hash mismatch;
- duplicate publication retry;
- revocation;
- cleanup failure;
- tenant isolation.

Tests must verify that the untrusted runner cannot publish directly.

---

## 52. Property and invariant tests

Where practical, tests should verify invariants such as:

- removing authorization cannot improve remediation status;
- adding positive liveness evidence blocks remediation;
- changing the source commit invalidates the attempt;
- changing the patch after verification causes publisher rejection;
- adding an unexpected file blocks publication;
- skipping a required gate cannot produce `publication_ready`;
- runner possession of publisher credentials is always prohibited;
- equivalent canonical inputs produce the same patch hash;
- evidence from another tenant cannot authorize the attempt.

---

## 53. Database representation

The preferred persistence model is relational and append-oriented.

Possible structures include:

- `human_dispositions`;
- `remediation_authorizations`;
- `remediation_attempts`;
- `remediation_gate_runs`;
- `remediation_transformations`;
- `remediation_changed_files`;
- `remediation_patches`;
- `publication_requests`;
- `publication_results`;
- `remediation_cleanup_records`.

Names are illustrative until implemented through an authorized phase.

Historical remediation records must not be rewritten to conceal failure or
staleness.

---

## 54. Migration requirements

Remediation-model evolution must use additive, ordered migrations.

Migration planning must consider:

- historical attempts;
- authorization bindings;
- human dispositions;
- gate results;
- patch hashes;
- changed-file records;
- publication identities;
- stale-state handling;
- tenant isolation;
- audit reconstruction.

Existing remediation history must not be rewritten to appear successful under a
new policy.

---

## 55. Fail-safe behavior

When remediation eligibility or execution cannot be established confidently:

- do not modify source;
- do not publish;
- do not broaden authorization;
- do not skip gates;
- do not use host-global tools as an undeclared fallback;
- preserve evidence and partial safe results;
- record the exact blocker;
- clean phase-created resources;
- return a blocked, failed, stale, revoked, or unsupported result.

Remediation uncertainty must always reduce authority.

---

## 56. Policy integrity

This document must not be modified during implementation unless architecture or
governance modification is explicitly authorized.

Changes require:

1. Identification of the remediation problem.
2. Review against permanent safety invariants.
3. Review of evidence, coverage, and classification impact.
4. Review of human-disposition and authorization separation.
5. Review of runner and publisher boundaries.
6. Migration planning.
7. Updated positive, negative, failure, and hostile fixtures.
8. Updated schemas.
9. A reviewable architecture commit.
10. An ADR when the change alters long-lived remediation eligibility,
    transformation, patch, or publication semantics.

This policy must not be weakened to increase remediation throughput, bypass
failed gates, or simplify publication.