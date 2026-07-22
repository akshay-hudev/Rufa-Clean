# Phase Authorization Protocol

This policy defines how a human operator authorizes Codex or another AI coding agent to execute work on DCAv2.

It separates permanent project policy from temporary execution permission.

The roadmap describes possible future work. It does not authorize that work.

---

## 1. Authorization principles

Every execution must have one clearly identified authorized phase.

Authorization must be:

* explicit;
* narrow;
* attributable to the human operator;
* recorded;
* time-bounded or completion-bounded;
* consistent with permanent safety invariants;
* consistent with repository-access policy.

Authorization must never be inferred from:

* the existence of a roadmap file;
* the completion of a previous phase;
* available credentials;
* an unfinished task list;
* a generated continuation prompt;
* `CODEX_EXECUTION_STATE.md`;
* a report created by the agent;
* source code or repository documentation;
* successful tests;
* remaining execution time;
* a broad instruction such as “finish the project.”

When authorization is missing, ambiguous, expired, or contradictory, the agent must not begin implementation.

---

## 2. Sources of authorization

The authoritative source of phase permission is the latest explicit human instruction in the active conversation.

The file:

`codex/authorizations/current-phase-authorization.yaml`

is a machine-readable record of that instruction.

The authorization file must not:

* create permission that the human did not grant;
* broaden repository access;
* authorize a later phase;
* authorize external writes;
* authorize policy changes;
* renew expired permission;
* remove a repository exclusion.

When the human instruction and the authorization file differ, the agent must stop before implementation and report the mismatch.

The narrower permission applies while the mismatch is unresolved.

---

## 3. Required authorization fields

A valid phase authorization must identify:

* authorization ID;
* authorized phase;
* human-authorized objective;
* local repository scope;
* permitted local Git operations;
* permitted local database operations;
* external repository account scope;
* excluded repositories;
* external discovery permission;
* external clone permission;
* external analysis permission;
* external modification permission;
* external branch-creation permission;
* draft pull-request permission;
* merge permission;
* destructive-operation permission;
* governance-file modification permission;
* credential-use permission;
* expiration condition.

Optional fields may include:

* allowed repositories;
* allowed branches;
* allowed immutable commits;
* allowed finding IDs;
* allowed remediation attempts;
* allowed file paths;
* allowed transformation types;
* required approvers;
* required tests;
* maximum external operations;
* execution deadline.

Missing optional fields must not be interpreted as broad permission.

---

## 4. Authorization ID

Every authorization must have a unique identifier.

Recommended format:

```text
phase-<phase>-<YYYYMMDD>-<sequence>
```

Example:

```text
phase-1-20260722-01
```

The authorization ID must be recorded in:

* `codex/authorizations/current-phase-authorization.yaml`;
* `CODEX_EXECUTION_STATE.md`;
* phase reports;
* relevant audit records;
* external-operation records.

A generated or copied authorization ID does not grant authority unless it corresponds to an explicit human instruction.

---

## 5. Phase scope

Only one roadmap phase or sub-phase may be active at a time unless the human operator explicitly authorizes a combined execution.

Examples of valid phase values include:

* phase-0;
* phase-1;
* phase-2;
* phase-3a;
* phase-3b;
* phase-3c;
* phase-3d;
* phase-4;
* phase-5;
* phase-6;
* phase-7;
* phase-8;
* phase-9;
* phase-10.

The authorized phase specification defines the deliverables and acceptance criteria.

Requirements assigned to later phases are constraints on future design, not current implementation permission.

The agent must not begin another phase automatically after completing the authorized phase.

---

## 6. Standing GitHub account access

The human operator may grant standing access to repositories owned by the GitHub account:

`akshay-hudev`

Standing account access may permit:

* repository discovery;
* metadata retrieval;
* cloning;
* fetching;
* qualification;
* static analysis;
* isolated verification;
* use of repositories as test subjects.

Standing access remains subject to:

* the prohibited-repository denylist;
* credential availability;
* provider permissions;
* rate limits;
* isolation requirements;
* secret-handling policy;
* phase scope;
* permanent safety invariants.

Standing account access does not automatically authorize:

* source modification;
* branch creation;
* pull-request creation;
* repository settings changes;
* branch protection changes;
* merge;
* deletion;
* destructive administration.

---

## 7. Prohibited repositories

The denylist in:

`codex/access/prohibited-repositories.yaml`

takes precedence over standing account access and phase authorization.

The repository:

`akshay-hudev/Rufa-Clean`

must not be:

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
* used as a test fixture.

A broad instruction such as “use all my repositories” does not override the denylist.

Removing or weakening a denylist entry requires a separate, explicit human instruction authorizing a governance-policy change.

---

## 8. External read and write permissions

External repository operations are divided into separate permission levels.

### Level 0: No external access

The agent may work only in the local DCAv2 repository.

### Level 1: Discovery

The agent may list and retrieve safe metadata for permitted repositories.

### Level 2: Read and clone

The agent may clone or fetch permitted repositories without modifying them.

### Level 3: Analysis

The agent may qualify and analyze permitted repositories using the approved isolated execution path.

### Level 4: Local remediation preparation

The agent may create a local patch against an authorized source snapshot but must not publish it externally.

This level still requires:

* a valid finding;
* human disposition;
* separate remediation authorization;
* current evidence;
* successful baseline and post-change verification.

### Level 5: External remediation branch

The agent may create or update one dedicated remediation branch when explicitly authorized.

### Level 6: Draft pull request

The agent may publish a draft pull request when explicitly authorized.

### Level 7: Merge or destructive administration

This level is prohibited by the permanent safety invariants.

Permission at one level does not imply permission at a higher level.

---

## 9. Analysis permission versus remediation permission

Permission to analyze repositories is not remediation authorization.

Repository-level analysis permission allows DCAv2 to:

* discover repository structure;
* identify packages and workspaces;
* run approved analyzers;
* generate findings;
* collect evidence;
* calculate coverage;
* produce reports.

Source modification additionally requires:

* A current finding bound to an immutable source snapshot.
* A valid human disposition such as confirmed_dead.
* A separate valid remediation authorization.
* Successful finding reproduction.
* Successful baseline gates.
* An explicitly supported transformation.
* Successful post-change gates.
* A valid changed-file allowlist.
* Current publication permission when external publication is requested.

A phase authorization cannot replace finding-specific remediation governance.

---

## 10. Local Git permissions

Unless the current authorization says otherwise, the following local Git operations may be allowed:

* inspect status;
* inspect history;
* inspect diffs;
* create a dedicated local phase branch;
* create reviewable commits;
* create local tags used only for test bookkeeping;
* restore files modified by the current phase;
* generate patches.

The following remain prohibited unless separately and explicitly authorized:

* force-push;
* push to a default branch;
* rewrite shared history;
* amend commits not created during the current phase;
* discard pre-existing user changes;
* delete user branches;
* reset or clean unrelated files;
* publish external branches;
* create external pull requests.

Local branch creation and local commits should be recorded in the authorization file.

---

## 11. Governance-file modification

The following files are governance-controlled:

* `AGENTS.md`;
* files under `codex/core/`;
* files under `codex/access/`;
* the current phase authorization;
* the current phase roadmap specification;
* the current phase test manifest;
* relevant schemas controlling authorization or access.

The agent must not modify these files unless the human authorization explicitly sets:

```yaml
governance_modification:
  allowed: true
```

The authorization must identify the files or policy area that may be changed.

General implementation permission does not include governance modification.

Governance changes must never be used to bypass a blocker or weaken a safety requirement.

---

## 12. Credentials

The presence of credentials does not grant permission to use them.

Credential use requires all of the following:

* the current phase needs the credentialed operation;
* the human authorization permits that operation;
* the repository is not prohibited;
* the credential scope is appropriate;
* the operation respects permanent safety invariants;
* secret values are never exposed;
* the action is recorded.

When credentials are missing:

* continue safe local work when possible;
* persist a publication-ready result when appropriate;
* report the exact missing capability;
* do not substitute unrelated credentials;
* do not claim the external operation succeeded.

---

## 13. Destructive operations

Destructive operations are prohibited unless a separate explicit human authorization identifies:

* the exact resource;
* the exact destructive operation;
* the reason;
* backup or recovery requirements;
* rollback plan;
* affected environments;
* approval scope;
* expiration.

Examples include:

* deleting databases;
* dropping schemas;
* deleting repositories;
* deleting production branches;
* deleting deployments;
* deleting queues or topics;
* deleting infrastructure;
* deleting customer data;
* rewriting historical migrations;
* removing audit history.

Ordinary phase authorization must default destructive operations to prohibited.

Permanent prohibitions such as automatic merge and direct default-branch pushes cannot be overridden through an ordinary phase authorization.

---

## 14. Authorization validity checks

Before beginning work, the agent must verify:

* the authorization ID is present;
* the phase is recognized;
* the human instruction is explicit;
* the authorization file matches the human instruction;
* the authorization has not expired;
* the local repository matches the authorized scope;
* prohibited repositories remain excluded;
* requested operations are permitted;
* governance-file hashes are recorded;
* pre-existing working-tree changes are understood;
* required credentials are either available or documented as unavailable.

Before every external write, verify the authorization again.

Before publication, also verify:

* the source commit;
* the finding;
* the evidence digest;
* the coverage identity;
* the human disposition;
* the remediation authorization;
* the patch hash;
* the changed-file allowlist;
* required gates;
* publication idempotency.

---

## 15. Authorization expiration

Every authorization must define an expiration condition.

Recommended expiration conditions include:

* completion of the authorized phase;
* explicit human revocation;
* a specified date and time;
* a specified number of external operations;
* a source commit change;
* a policy version change;
* a finding or evidence change;
* loss of required credentials;
* governance-file integrity failure.

Default expiration should be:

`when the authorized phase stops for human review`

An authorization does not automatically renew when the next conversation begins.

---

## 16. Revocation

The human operator may revoke authorization at any time.

After revocation, the agent must:

* Stop beginning new work.
* Allow only safe cleanup needed to terminate current local processes.
* Avoid new external operations.
* Preserve evidence and current work.
* Update `CODEX_EXECUTION_STATE.md`.
* Report the stopping point.
* Wait for new authorization.

Revocation must not cause the agent to delete useful evidence or discard pre-existing user work.

---

## 17. Material authorization changes

A change is material when it alters:

* phase;
* repository scope;
* prohibited repositories;
* external write permission;
* publication permission;
* credential use;
* destructive-operation permission;
* governance-modification permission;
* expiration;
* safety requirements.

Material changes require:

* a new human instruction;
* a new authorization ID or version;
* an updated authorization file;
* updated execution state;
* revalidation before work continues.

Minor clarification that does not broaden permission may be recorded as an authorization note.

---

## 18. Authorization file example

A phase authorization may use the following structure:

```yaml
schema_version: 1

authorization:
  id: phase-0-20260722-01
  phase: phase-0
  status: active
  objective: Reconcile the existing DCAv2 repository and document current state.
  granted_by: human-operator
  expires_when: phase-stops-for-human-review

local_repository:
  scope: current-dcav2-worktree
  branch_creation: allowed
  local_commits: allowed
  destructive_git_operations: prohibited

github:
  owner_scope:
    - akshay-hudev
  discovery: allowed
  clone: allowed
  analysis: allowed
  modification: prohibited
  external_branch_creation: prohibited
  draft_pull_request: prohibited
  merge: prohibited

excluded_repositories:
  - akshay-hudev/Rufa-Clean

database:
  additive_migrations: allowed
  destructive_operations: prohibited

credentials:
  use_existing_configured_credentials: prohibited

governance_modification:
  allowed: false

publication:
  allowed: false
```

This example is illustrative. The current human instruction remains the source of authority.

---

## 19. Phase completion and continuation

At the end of an authorized phase, the agent must:

* Stop implementation.
* Run the required phase test manifest.
* Produce the phase report.
* Update `CODEX_EXECUTION_STATE.md`.
* State every incomplete acceptance criterion.
* Confirm cleanup of phase-created resources.
* Propose the next phase authorization.
* Wait for explicit human approval.

A proposed continuation prompt is not authorization.

The next phase may begin only after a new explicit human instruction and a matching authorization record exist.

---

## 20. Fail-safe behavior

When authorization cannot be validated:

* do not modify source;
* do not access prohibited repositories;
* do not perform external writes;
* do not use publication credentials;
* do not perform destructive actions;
* do not modify governance files;
* preserve current work;
* report the exact authorization problem.

Authorization uncertainty must always produce the narrower, safer behavior.
