# Source Control Policy

This policy defines how Codex and DCAv2 may use Git and external version-control providers.

It applies to:

* the local DCAv2 worktree;
* cloned test repositories;
* analyzed repositories;
* remediation branches;
* patches;
* commits;
* pull requests;
* publication retries.

This policy does not grant repository access or publication permission. Those permissions must come from the current human authorization and the repository-access policies.

---

## 1. Core principles

All source-control operations must be:

* authorized;
* narrowly scoped;
* reviewable;
* reversible where practical;
* attributable;
* idempotent when external;
* protective of pre-existing user work;
* consistent with permanent safety invariants.

Codex must never interpret technical ability to perform a Git operation as permission to perform it.

---

## 2. Repository root

The DCAv2 repository root is the Git worktree containing:

* `AGENTS.md`;
* the `codex/` directory;
* the product source tree.

Do not rely on a machine-specific absolute path as the permanent repository identity.

At the start of every phase, record:

* repository root;
* current branch;
* current commit;
* upstream configuration;
* working-tree status;
* staged changes;
* unstaged changes;
* untracked paths;
* relevant submodule state;
* governing-file hashes.

Store this information in `CODEX_EXECUTION_STATE.md`.

---

## 3. Pre-existing user work

Pre-existing user work must be preserved.

Before modifying files, Codex must inspect the working tree and distinguish:

* changes that existed before the phase;
* changes created during the phase;
* generated files;
* ignored files;
* untracked user files;
* possible secret-bearing files.

Codex must not, without explicit authorization:

* discard user changes;
* overwrite overlapping edits;
* reset the worktree;
* run destructive clean operations;
* remove untracked user files;
* stash user changes;
* amend user commits;
* rewrite shared history.

When required phase work overlaps pre-existing changes:

1. Do not modify the overlapping file.
2. Record the conflict.
3. Continue non-overlapping safe work.
4. Stop when the overlap materially blocks the phase.
5. Ask the human operator how to proceed.

---

## 4. Local branch policy

When local branch creation is authorized, Codex should use a dedicated phase branch.

Recommended naming:

```text
codex/phase-<phase>-<short-purpose>
```

Examples:

```text
codex/phase-0-reconciliation
codex/phase-1-runner-hardening
codex/phase-3a-npm-workspaces
```

A phase branch must:

* begin from the intended base commit;
* avoid unrelated changes;
* contain only authorized phase work;
* use reviewable commits;
* preserve the default branch.

Codex must report when:

* the intended branch already exists;
* the branch has diverged;
* the base commit is unexpected;
* the branch contains unrelated work;
* switching branches would risk user changes.

---

## 5. Local commit policy

When local commits are authorized, Codex may create reviewable commits grouped by coherent purpose.

Good commit boundaries include:

* policy or documentation changes;
* one defect fix;
* one migration;
* one adapter implementation;
* one fixture family;
* one security hardening change;
* one phase-report update.

Commit messages must describe actual completed work.

Do not use messages that falsely claim:

* full phase completion;
* full enterprise support;
* complete security;
* universal language support;
* successful publication;
* passing tests that did not run.

Codex may correct commits created during the current phase when the correction does not rewrite shared history.

Codex must not amend commits that predate the phase.

---

## 6. Prohibited local Git operations

Unless separately and explicitly authorized, Codex must not:

* run `git reset --hard`;
* run destructive `git clean`;
* discard unrelated changes;
* delete user branches;
* rewrite shared history;
* amend pre-existing commits;
* rebase shared branches;
* force-push;
* change repository ownership or permissions;
* alter branch-protection settings;
* modify global Git configuration;
* persist credentials in Git configuration;
* add credential-bearing remotes.

Safer alternatives should be used where possible.

---

## 7. Git configuration safety

Repository and global Git configuration must be treated carefully.

Codex must not persist:

* access tokens;
* private keys;
* credentials in remote URLs;
* credential helper secrets;
* unsafe command aliases;
* hooks supplied by untrusted repositories;
* signing secrets.

Before untrusted analysis or remediation:

* remove authenticated remote URLs from the untrusted execution workspace;
* remove unsafe repository-local Git configuration;
* disable or avoid untrusted Git hooks;
* ensure publication credentials remain outside the untrusted runner.

Git configuration originating from analyzed repositories is untrusted data.

---

## 8. External repository access

External repository access is controlled by:

* the latest human authorization;
* `codex/access/github-repository-policy.yaml`;
* `codex/access/prohibited-repositories.yaml`;
* the current phase authorization.

Before any external repository operation, verify:

* exact owner;
* exact repository name;
* repository is not prohibited;
* requested operation is authorized;
* requested revision or branch is allowed;
* credential use is authorized;
* phase scope permits the operation.

The denylist always overrides broad account access.

---

## 9. Prohibited repository behavior

A prohibited repository must not be:

* cloned;
* fetched;
* searched;
* opened;
* inspected;
* qualified;
* indexed;
* analyzed;
* modified;
* branched;
* published to;
* used as a source of fixtures.

If a prohibited repository appears in:

* an organization listing;
* dependency metadata;
* a Git submodule;
* a manifest;
* a generated repository list;
* a cross-repository graph;

record only the minimum identity required to enforce exclusion.

Do not retrieve or inspect its contents.

---

## 10. Clone and fetch policy

Cloning or fetching requires permission at the appropriate external-access level.

For every clone or fetch, record:

* repository identity;
* provider;
* requested revision;
* resolved immutable commit;
* operation time;
* credential mode;
* destination workspace;
* authorization ID.

Use immutable commits for analysis and remediation identity.

A branch name alone is insufficient evidence of source identity.

Do not reuse a mutable working copy as if it represented the same source snapshot after the branch changes.

---

## 11. Untrusted repository worktrees

Cloned repositories used for analysis must be treated as untrusted.

The trusted controller may acquire source, but repository-controlled execution must occur only in the approved isolated runner.

Before runner execution:

* remove credential-bearing remotes;
* remove unnecessary provider metadata;
* remove trusted credentials;
* prevent access to host Git credentials;
* prevent access to unrelated worktrees;
* prevent access to the Docker socket;
* record the immutable source identity.

The runner must not push, publish, or authenticate to the source provider.

---

## 12. Source snapshot integrity

Every analysis and remediation must bind to an immutable source snapshot.

Record, where applicable:

* owner;
* repository;
* requested branch or revision;
* resolved commit;
* submodule commits;
* source archive hash;
* relevant file hashes.

Before remediation:

* reacquire or verify the authorized snapshot;
* verify exact repository identity;
* verify exact commit;
* verify the finding occurrence;
* verify the evidence digest;
* verify the coverage identity.

Before publication:

* verify the base commit again;
* verify the verified patch still applies;
* reject stale or changed source.

---

## 13. Patch policy

Patches must be deterministic and content-addressed where practical.

A remediation patch must record:

* source repository;
* base commit;
* finding identity;
* authorization identity;
* transformation engine;
* transformation version;
* rule identity;
* changed files;
* patch hash;
* creation time;
* verification results.

Publication must be blocked when:

* the patch differs from the verified patch;
* unexpected files changed;
* file modes changed unexpectedly;
* generated or prohibited files changed;
* the patch no longer applies to the authorized base commit;
* patch output is nondeterministic.

---

## 14. Changed-file allowlist

Every remediation attempt must define an expected changed-file set.

The changed-file allowlist must be established before publication.

A changed file is permitted only when:

* it is required by the authorized transformation;
* it is within repository scope;
* it is not prohibited or generated unless explicitly allowed;
* the change is explained;
* the file was verified by post-change gates.

Unexpected files must block publication.

Examples of unexpected changes include:

* lockfile changes not required by the transformation;
* formatting changes across unrelated files;
* generated artifacts not included in authorization;
* policy-file changes;
* CI changes;
* workflow changes;
* secret-bearing files;
* repository settings metadata.

---

## 15. Remediation branch policy

An external remediation branch may be created only when explicitly authorized.

The branch must:

* be dedicated to one authorized remediation scope;
* begin from the verified base commit;
* contain only the verified patch and permitted supporting changes;
* avoid unrelated refactoring;
* use a deterministic or collision-resistant name;
* remain separate from the default branch.

Recommended naming components include:

* DCAv2 identifier;
* finding or remediation-attempt identifier;
* short repository-safe description.

Do not embed secrets or sensitive source details in branch names.

---

## 16. Default branch protection

Direct pushes to a repository's default branch are permanently prohibited.

Codex and DCAv2 must not:

* commit directly to the default branch for external remediation;
* push directly to the default branch;
* bypass branch protection;
* temporarily change the default branch;
* weaken required reviews;
* disable status checks;
* disable signed-commit requirements;
* use administrator privileges to bypass policy.

This prohibition applies even when the connected account has administrative access.

---

## 17. Pull-request policy

A pull request may be created only when:

* the current human authorization allows draft publication;
* the repository is not prohibited;
* the remediation branch is authorized;
* the finding is current;
* human disposition is current;
* remediation authorization is current;
* baseline gates passed;
* post-change gates passed;
* the patch hash matches;
* changed files match the allowlist;
* publication is idempotent.

Every DCAv2-created pull request must be created as a draft.

DCAv2 must not automatically:

* mark it ready for review;
* merge it;
* enable auto-merge;
* approve it;
* dismiss reviews;
* bypass checks;
* modify branch protection.

---

## 18. Pull-request contents

A draft remediation pull request should identify:

* the source commit;
* finding identity;
* remediation-attempt identity;
* high-level reason for the change;
* changed files;
* transformation method;
* baseline gate summary;
* post-change gate summary;
* known limitations;
* evidence and coverage summary;
* human-review status;
* remediation-authorization status;
* statement that the pull request is draft-only.

Avoid exposing:

* secrets;
* sensitive source excerpts;
* raw credentials;
* unnecessary internal paths;
* unbounded analyzer output.

---

## 19. Idempotent publication

External publication must be idempotent.

A publication identity should include relevant values such as:

* owner;
* repository;
* base commit;
* finding;
* remediation authorization;
* patch hash;
* publication policy version.

Before creating a branch or pull request:

* search for an equivalent prior publication;
* verify whether the branch already exists;
* verify whether a matching draft pull request already exists;
* reuse the prior safe result when appropriate.

Retries must not create duplicate branches or pull requests.

---

## 20. Stale publication handling

Publication must stop when:

* the default branch advanced and policy requires a new analysis;
* the base commit changed;
* the finding changed;
* the source occurrence changed;
* the evidence digest changed;
* the coverage identity changed;
* human disposition changed;
* remediation authorization changed;
* policy version changed;
* the patch no longer applies cleanly.

Do not silently rebase and publish a previously authorized patch onto new source.

A new source snapshot requires fresh validation and, when required, fresh human governance.

---

## 21. Merge policy

Automatic merge is permanently prohibited.

Codex and DCAv2 must not:

* merge a pull request;
* enable auto-merge;
* queue a merge;
* approve a pull request on behalf of a human;
* mark a draft ready for review automatically;
* bypass required reviewers.

Merge responsibility remains with authorized human operators and repository governance.

---

## 22. External branch cleanup

Codex must not delete external remediation branches automatically unless a separate explicit authorization allows it.

A closed or abandoned remediation branch may contain useful audit and review context.

Local temporary branches created solely for testing may be removed only when:

* they were created by the current phase;
* removal is authorized;
* they contain no unique user work;
* their removal is recorded.

---

## 23. Submodules and nested repositories

Git submodules and nested repositories must be treated as separate repository scopes.

Before accessing a submodule:

* verify repository identity;
* check the prohibited list;
* verify external-access permission;
* resolve the immutable commit;
* record coverage.

Do not assume authorization for a parent repository automatically authorizes every submodule.

Nested `.git` directories must not be followed blindly.

---

## 24. Forks and cloned repositories

A repository owned by the authorized account may be a fork or clone of another project.

Before external writes, verify:

* repository owner;
* whether the target is a fork;
* configured upstream;
* default branch;
* publication destination;
* whether the operation affects only the authorized fork.

Do not push to an upstream repository merely because a fork references it.

Repository ownership and exact full name must determine scope.

---

## 25. Tags and releases

Codex must not create, modify, or delete external tags or releases unless explicitly authorized.

Phase work should not rely on mutable tags as immutable source identity.

When a tag is analyzed, resolve and record the underlying immutable commit.

---

## 26. Git hooks

Hooks from analyzed repositories are untrusted.

Codex and the runner must not execute untrusted Git hooks on the trusted controller.

When performing Git operations in untrusted workspaces:

* disable hooks or use a safe hooks path;
* prevent repository-supplied hooks from executing;
* avoid trusting repository-local configuration that can trigger commands.

---

## 27. Line-ending and file-mode stability

Source-control verification should detect unintended changes caused by:

* line-ending conversion;
* executable-bit changes;
* file-mode changes;
* encoding changes;
* formatter-wide rewrites;
* case-only path behavior;
* platform-specific normalization.

Unexpected metadata changes must be treated as unexpected changed files or patch instability.

---

## 28. Large files and generated artifacts

Do not commit large generated artifacts, analyzer caches, source archives, database dumps, dependency directories, or temporary reports unless the phase explicitly requires versioning them.

Examples commonly excluded from commits include:

* `node_modules`;
* analyzer caches;
* compiled outputs;
* temporary source clones;
* test databases;
* credential files;
* raw repository archives;
* unbounded logs.

When a required generated artifact must be committed, document:

* why it is necessary;
* how it is reproduced;
* its expected hash or version;
* its maintenance policy.

---

## 29. Audit requirements

Record source-control actions that materially affect analysis, remediation, or publication.

Relevant events include:

* branch creation;
* commit creation;
* patch generation;
* source snapshot resolution;
* external clone;
* external fetch;
* external branch creation;
* push;
* draft pull-request creation;
* publication retry;
* stale publication rejection;
* cleanup failure.

Audit records must identify:

* authorization ID;
* actor;
* repository;
* branch;
* commit;
* operation;
* result;
* timestamp;
* relevant content hash.

---

## 30. Phase completion

At phase completion, report:

* starting branch and commit;
* ending branch and commit;
* all commits created;
* uncommitted changes;
* changed files;
* migrations;
* local branches created;
* external branches created;
* external pull requests created;
* prohibited operations not performed;
* phase-created temporary resources cleaned;
* unresolved working-tree conflicts.

Run:

```bash
git diff --check
```

Do not claim a clean repository when authorized or pre-existing changes remain.

Describe the state accurately.

---

## 31. Fail-safe behavior

When source-control state is uncertain:

* do not discard changes;
* do not reset;
* do not clean;
* do not force-push;
* do not push to the default branch;
* do not merge;
* do not publish an unverified patch;
* preserve the current state;
* report the uncertainty.

Source-control ambiguity must produce narrower behavior, not broader authority.

---

## 32. Policy integrity

This policy must not be modified during an implementation phase unless governance modification is explicitly authorized.

Changes require:

* A clearly identified source-control problem.
* Review against permanent safety invariants.
* Analysis of user-work preservation.
* Analysis of external publication risk.
* Updated tests or publication checks.
* A reviewable governance commit.
* An ADR when the change affects a long-lived publication or trust boundary.

This policy must not be weakened to simplify publication or bypass repository protections.
