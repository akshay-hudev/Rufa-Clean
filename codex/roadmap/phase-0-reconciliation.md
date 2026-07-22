# Phase 0 — Current-System Reconciliation

This document defines the planned scope, evidence requirements, tests, stop
conditions, and completion criteria for Phase 0 of DCAv2.

Phase 0 establishes the verified current state of the existing system before
broader product expansion begins.

It is a reconciliation and stabilization phase.

It is not authorization to rewrite DCAv2, implement the entire roadmap, access
external repositories, use credentials, perform remediation, or publish source
changes.

Execution authority is governed by:

- `AGENTS.md`;
- `codex/core/01-instruction-precedence.md`;
- `codex/core/03-safety-invariants.md`;
- `codex/core/05-phase-authorization-protocol.md`;
- `codex/authorizations/current-phase-authorization.yaml`;
- the latest explicit human authorization.

---

## 1. Phase identity

```yaml
phase:
  id: phase-0-reconciliation
  name: Current-System Reconciliation
  roadmap_order: 0
  default_status: inactive
  implementation_authorized_by_this_file: false
```

The phase becomes active only when the current authorization record explicitly
identifies `phase-0-reconciliation` as active.

---

## 2. Primary objective

The primary objective is to create an evidence-backed description of what the
current DCAv2 implementation actually does.

Phase 0 must reconcile:

- product documentation;
- source code;
- database schemas;
- migrations;
- tests;
- command definitions;
- runner behavior;
- publisher behavior;
- repository-access controls;
- audit behavior;
- capability claims;
- known defects;
- external-operation boundaries.

The result must distinguish verified behavior from intended future behavior.

---

## 3. Required outcomes

Phase 0 should produce:

1. A current-system inventory.
2. A verified architecture map.
3. A trust-boundary assessment.
4. A database and migration inventory.
5. A command-execution inventory.
6. A repository-access and denylist assessment.
7. A capability matrix with evidence-backed statuses.
8. A test baseline.
9. A security-control baseline.
10. A known-defect register.
11. A reconciliation report.
12. A bounded continuation state.

Narrow foundational repairs may be included only when the active authorization
explicitly permits them.

---

## 4. Phase principles

Phase 0 must:

- inspect before changing;
- preserve existing working behavior;
- avoid broad refactoring;
- avoid architecture replacement;
- avoid unsupported capability claims;
- retain failures and unavailable infrastructure;
- verify controls through tests where practical;
- preserve historical migrations;
- preserve local user work;
- preserve repository denylist enforcement;
- keep governance separate from implementation;
- distinguish configuration from enforcement;
- distinguish current code from roadmap intent.

When current behavior cannot be established, the correct status is `unknown`.

---

## 5. Non-goals

Phase 0 does not, by default, include:

- full TypeScript product completion;
- broad TypeScript syntax support;
- JavaScript framework support;
- monorepo support;
- pnpm support;
- Yarn support;
- Python support;
- additional-language support;
- cross-repository analysis;
- microservice contract analysis;
- runtime telemetry integration;
- organization-wide campaigns;
- enterprise-scale validation;
- automatic remediation;
- automatic publication;
- direct default-branch pushes;
- pull-request merge;
- production infrastructure changes;
- destructive database cleanup;
- rewriting existing migrations;
- replacing the existing codebase.

These items belong to later phases or separately authorized work.

---

## 6. Authorization prerequisites

Before implementation or execution begins, the active Phase 0 authorization
must identify applicable:

- repository scope;
- permitted local paths;
- permitted source modifications;
- permitted governance modifications;
- permitted dependency changes;
- permitted database operations;
- permitted commands;
- permitted network access;
- permitted external repositories;
- permitted credentials;
- permitted test environments;
- permitted runner operations;
- permitted external operations;
- remediation permission;
- publication permission;
- destructive-operation permission;
- required tests;
- stop conditions;
- expiration or completion boundary.

Any permission not explicitly granted must be treated as denied.

---

## 7. Initial repository-state capture

Before modifying files, Phase 0 should record the local repository state.

Applicable evidence includes:

- repository root;
- current branch;
- current commit;
- configured remotes without credentials;
- tracked modifications;
- untracked files;
- staged files;
- existing branches relevant to the work;
- migration state;
- dependency manifests;
- lockfiles;
- current test configuration.

The capture must not expose:

- credential-bearing remote URLs;
- authentication headers;
- tokens;
- private keys;
- complete environment dumps.

Pre-existing user changes must remain distinguishable from Phase 0 changes.

---

## 8. Local worktree safety

Phase 0 must preserve existing local work.

Without explicit authorization, it must not:

- run a destructive reset;
- run a destructive clean;
- discard tracked changes;
- delete untracked user files;
- overwrite unrelated modifications;
- delete user branches;
- amend unrelated commits;
- rewrite shared history;
- replace the repository with a fresh copy.

Temporary tests should use isolated workspaces when practical.

A dirty worktree is not permission to discard changes.

---

## 9. Current-system inventory

The inventory should identify implemented components such as:

- API or application entry points;
- trusted controller modules;
- untrusted runner modules;
- trusted publisher modules;
- source-control provider adapters;
- analyzers;
- parsers;
- command executors;
- evidence models;
- coverage models;
- classification logic;
- remediation logic;
- audit storage;
- reporting;
- database access;
- configuration;
- background jobs;
- test harnesses.

For every component, record:

- source location;
- purpose;
- trust zone;
- current callers;
- external dependencies;
- persistence dependencies;
- relevant tests;
- known limitations;
- confidence in the inventory.

---

## 10. Architecture reconciliation

Phase 0 must compare intended architecture with executable implementation.

The assessment should answer:

- Does a trusted controller exist?
- Does a distinct untrusted runner exist?
- Does a distinct trusted publisher exist?
- Which boundaries are enforced?
- Which boundaries exist only in documentation?
- Which components execute repository-controlled code?
- Which components receive credentials?
- Which components access PostgreSQL?
- Which components perform external writes?
- Which components create authoritative audit records?
- Which components can modify source?
- Which components can publish source?

The result must use explicit statuses such as:

- implemented and tested;
- implemented but unverified;
- partially implemented;
- documented only;
- missing;
- broken;
- unknown.

---

## 11. Trust-boundary reconciliation

The trust-boundary review must examine:

- trusted controller inputs;
- runner request and result contracts;
- runner credential exposure;
- runner filesystem exposure;
- runner network exposure;
- publisher input validation;
- publisher credential handling;
- database credential boundaries;
- provider credential boundaries;
- artifact movement between zones;
- repository-controlled configuration;
- repository-controlled scripts;
- Git-hook behavior.

A boundary shown in a diagram must not be reported as enforced without
executable evidence.

---

## 12. Repository-access reconciliation

Phase 0 should verify that repository access is governed by:

- canonical provider identity;
- canonical account or installation identity;
- canonical repository identity;
- operation type;
- active authorization;
- repository-access policy;
- prohibited-repository policy.

The review must determine whether denylist evaluation occurs before content
retrieval.

A prohibited repository must not be:

- cloned;
- fetched;
- opened;
- qualified;
- analyzed;
- modified;
- branched;
- published.

Testing must use synthetic identities or authorized safe fixtures.

---

## 13. Prohibited-repository validation

Phase 0 must confirm that the absolute prohibited-repository rule remains
present and enforceable.

The validation should test applicable operations such as:

- source acquisition;
- repository qualification;
- metadata expansion;
- analysis scheduling;
- remediation scheduling;
- publication scheduling.

The permitted audit result should contain only minimum identity and denial
information.

The test must not retrieve prohibited repository content.

---

## 14. Database inventory

The database inventory should identify:

- database platform and version assumptions;
- migration framework;
- migration ordering;
- migration metadata;
- schemas;
- tables;
- columns;
- indexes;
- constraints;
- foreign keys;
- enum types;
- database functions;
- triggers;
- roles;
- permissions;
- row-level security;
- append-only records;
- mutable projections;
- test database configuration.

The inventory must distinguish current database objects from planned objects.

---

## 15. Migration reconciliation

Migration reconciliation must verify:

- existing migration identities;
- ordering;
- checksums where used;
- whether historical migrations have changed;
- fresh-install behavior;
- upgrade behavior from a representative existing schema;
- failure behavior;
- retry behavior;
- tenant-isolation implications;
- audit-history implications.

Phase 0 must not rewrite historical migrations to fix detected issues.

Corrections require new ordered migrations and explicit authorization.

---

## 16. Persistence classification

Persisted records should be classified as one of:

- authoritative append-only history;
- authoritative current record;
- mutable projection;
- cache;
- temporary execution record;
- raw external artifact;
- derived report;
- unknown.

The classification must identify whether each record can be:

- inserted;
- updated;
- superseded;
- revoked;
- deleted;
- rebuilt;
- archived.

Unknown persistence semantics must remain visible.

---

## 17. Audit reconciliation

The audit assessment should determine whether current implementation provides:

- event persistence;
- event identity;
- tenant scope;
- actor identity;
- authorization identity;
- correlation identity;
- append-only application behavior;
- database mutation prevention;
- event hashing;
- hash chaining;
- canonicalization;
- correction records;
- integrity verification;
- projection rebuild;
- backup verification.

A hash field alone must not be reported as tamper-evident audit support.

Controls must be reported individually.

---

## 18. Command inventory

Phase 0 should identify every path that executes a process or command.

For each execution path, record:

- caller;
- trust zone;
- executable;
- argument construction;
- shell use;
- working directory;
- inherited environment;
- credentials;
- network access;
- filesystem access;
- timeout;
- resource limits;
- output handling;
- cleanup;
- tests.

The review must identify arbitrary shell strings and undeclared host-global
tool dependencies.

---

## 19. Structured-command reconciliation

The command review should determine whether current commands use:

- stable command identifiers;
- structured arguments;
- validated paths;
- explicit working directories;
- environment allowlists;
- network profiles;
- filesystem profiles;
- explicit executable identity;
- version verification;
- timeouts;
- resource limits;
- bounded output;
- structured results;
- failure-status mapping;
- process-tree cleanup.

Missing behavior must be reported as missing or partial rather than assumed.

---

## 20. Runner reconciliation

Phase 0 should determine the actual runner architecture.

The assessment should identify:

- isolation technology;
- runner image;
- image identity;
- runtime user;
- Linux capabilities;
- privileged mode;
- namespaces;
- filesystem mounts;
- network mode;
- environment inheritance;
- credential exposure;
- Docker socket access;
- cloud metadata access;
- CPU limits;
- memory limits;
- process limits;
- disk limits;
- output limits;
- timeout behavior;
- cleanup behavior.

Every control must use an explicit status:

- `enforced`;
- `partially_enforced`;
- `failed`;
- `unavailable`;
- `unsupported`;
- `deferred`;
- `unverified`;
- `not_applicable`.

---

## 21. Runner security testing

Phase 0 should execute applicable baseline hostile tests for:

- synthetic environment-secret access;
- synthetic credential-file access;
- host-home access;
- unrelated workspace access;
- Docker socket access;
- cloud metadata access;
- unauthorized network access;
- process-count enforcement;
- memory enforcement;
- disk enforcement;
- output bounding;
- background-process cleanup;
- symbolic-link escape;
- Git-hook execution;
- malicious configuration;
- prompt-injection output.

Unavailable controls must not be reported as passed.

Tests must use safe synthetic targets.

---

## 22. Trusted publisher reconciliation

The publisher assessment should determine whether current implementation:

- runs separately from the runner;
- authenticates publication requests;
- validates active authorization;
- validates repository identity;
- validates the denylist;
- validates the base commit;
- validates the finding identity;
- validates human disposition;
- validates remediation authorization;
- validates evidence and coverage identities;
- validates the patch hash;
- validates changed files;
- disables Git hooks;
- creates a dedicated branch;
- creates a draft pull request;
- prevents default-branch pushes;
- prevents merge;
- supports idempotency;
- reconciles partial external state;
- records audit events.

Mock implementations must remain distinguishable from live provider support.

---

## 23. Evidence-model reconciliation

Phase 0 should inventory current evidence types and producers.

For each evidence type, record:

- evidence identifier;
- producer;
- producer version;
- source snapshot;
- source occurrence;
- polarity;
- strength;
- provenance;
- freshness;
- correlation;
- contradiction behavior;
- persistence;
- invalidation;
- tests.

The review must determine whether raw tool conclusions are being treated as
authoritative DCAv2 classifications.

---

## 24. Coverage-model reconciliation

The coverage assessment should identify:

- implemented coverage dimensions;
- required scopes;
- discovered scopes;
- excluded scopes;
- failed scopes;
- unsupported scopes;
- partial scopes;
- freshness;
- digest behavior;
- aggregation rules;
- completion criteria.

The review must verify that:

- analyzer failure does not become complete coverage;
- inaccessible scope does not become zero references;
- unsupported scope remains explicit;
- partial scope blocks classifications that require completeness.

---

## 25. Classification reconciliation

The classification assessment should identify:

- current statuses;
- finding profiles;
- evidence precedence;
- liveness dominance;
- coverage requirements;
- unsupported behavior;
- stale behavior;
- contradictory evidence behavior;
- human review behavior;
- remediation eligibility.

The review should test invariants such as:

- positive liveness evidence cannot produce `candidate_dead`;
- incomplete required coverage cannot produce remediation eligibility;
- tool count does not act as authoritative voting;
- analyzer failure cannot produce zero-reference certainty.

---

## 26. Human-disposition reconciliation

Phase 0 must determine whether human disposition is represented separately from
machine classification.

The review should identify:

- disposition statuses;
- actor identity;
- timestamp;
- finding identity;
- source identity;
- revocation;
- supersession;
- audit behavior;
- current-state projection.

A human `confirmed_dead` disposition must not automatically grant remediation
authority.

---

## 27. Remediation-authorization reconciliation

The assessment must determine whether remediation authorization is:

- separate from human disposition;
- finding-specific;
- repository-specific;
- source-commit-specific;
- evidence-specific;
- coverage-specific;
- transformation-specific;
- time-bounded or completion-bounded;
- revocable;
- audited.

Any implementation that combines disposition and remediation approval must be
reported as conflicting with the intended architecture.

---

## 28. Remediation workflow reconciliation

The remediation assessment should identify whether current behavior performs:

1. Exact finding reproduction.
2. Source-identity validation.
3. Evidence freshness validation.
4. Coverage freshness validation.
5. Baseline gates.
6. Structured transformation.
7. Changed-file validation.
8. Post-change gates.
9. Patch generation.
10. Patch hashing.
11. Secret scanning.
12. Local result reporting.
13. Trusted publisher handoff.

Every missing or partial step must remain explicit.

---

## 29. Transformation reconciliation

For each current transformation, record:

- language;
- symbol type;
- syntax shape;
- transformation engine;
- engine version;
- rule version;
- semantic preconditions;
- expected rewrite count;
- changed-file expectations;
- deterministic behavior;
- idempotency;
- unsupported cases;
- tests.

Plain text replacement must not be reported as a safe structured
transformation when syntax ambiguity remains.

---

## 30. TypeScript capability baseline

Phase 0 should establish the current TypeScript capability boundary.

Applicable dimensions include:

- TypeScript version;
- package manager;
- repository shape;
- workspace support;
- parser;
- semantic references;
- import handling;
- export handling;
- private functions;
- exported functions;
- methods;
- classes;
- TSX;
- path aliases;
- project references;
- dynamic imports;
- tests;
- transformation;
- verification;
- publication.

Each dimension must receive an evidence-backed capability status.

The broad label “TypeScript supported” is insufficient.

---

## 31. Known TypeScript runner defect

A previous isolated remediation attempt reportedly failed because the TypeScript
compiler executable could not be located inside the runner, even though
TypeScript was declared as a development dependency in the fixture.

Phase 0 should reproduce and diagnose this defect when the active authorization
permits the required fixture, dependency installation, and runner execution.

Potential causes to evaluate include:

- dependencies were not installed;
- development dependencies were omitted;
- lifecycle-script policy altered installation;
- the package manager used a different binary layout;
- the workspace was mounted incorrectly;
- the working directory was wrong;
- `PATH` was incomplete;
- the command bypassed the package-local executable resolver;
- the runner image lacked required tooling;
- the lockfile and manifest were inconsistent;
- the fixture configuration was incomplete;
- executable permissions were incorrect;
- another reproducible runner defect exists.

No cause should be selected without evidence.

---

## 32. Compiler-defect reproduction

A valid reproduction should record:

- authorized fixture identity;
- immutable source commit;
- package-manager version;
- lockfile identity;
- dependency-install command;
- lifecycle-script policy;
- install result;
- resolved dependency tree;
- expected compiler path;
- actual compiler path;
- command definition;
- working directory;
- environment allowlist;
- `PATH`;
- runner image;
- exit status;
- bounded diagnostics.

The reproduction must occur inside the approved runner.

Host execution alone is insufficient.

---

## 33. Compiler-defect correction

When authorized, a correction should address the verified cause rather than
adding fixture-specific behavior.

Possible correction categories include:

- deterministic dependency installation;
- correct development-dependency policy;
- package-manager-local executable resolution;
- corrected working directory;
- corrected workspace mount;
- corrected environment construction;
- declared runner tool installation;
- explicit configuration-required result.

The correction must not silently fall back to a host-global `tsc`.

---

## 34. Compiler-defect tests

A correction should include applicable tests for:

- compiler available through the approved path;
- compiler missing;
- development dependencies omitted;
- malformed lockfile;
- unsupported package-manager layout;
- wrong working directory;
- empty or hostile `PATH`;
- host-global compiler present but runner compiler absent;
- more than one fixture name and source path;
- exact failure-status mapping.

The host-global fallback test must prove that the isolated workflow fails safely
rather than using undeclared host state.

---

## 35. Dependency inventory

Phase 0 should inventory current direct dependencies and material tooling.

The inventory should identify:

- dependency name;
- version;
- role;
- trust zone;
- manifest;
- lockfile;
- runtime or development status;
- license status;
- provenance;
- known vulnerability status;
- current usage;
- optional or mandatory status;
- replacement boundary.

Unknown licensing or provenance must remain unverified.

Phase 0 should not perform broad dependency replacement without explicit
authorization.

---

## 36. Tooling reconciliation

The tooling assessment should distinguish:

- currently integrated tools;
- installed but unused tools;
- host-global accidental dependencies;
- optional tools;
- experimental tools;
- planned future candidates;
- rejected tools;
- unknown tools.

Mentioning Tree-sitter, SCIP, Knip, Vulture, PolyglotPiranha, or another tool in
the roadmap does not mean it is currently adopted.

Current capability claims must refer only to verified integrations.

---

## 37. License reconciliation

For each mandatory current dependency, Phase 0 should determine whether the
repository contains or references:

- canonical project identity;
- exact version;
- license;
- authoritative license source;
- distribution implications;
- notice obligations;
- current approval state.

When authoritative license information cannot be verified:

- mark the status unverified or blocked;
- do not invent a conclusion;
- do not remove the dependency automatically;
- record the required follow-up.

License review must remain within the authorized research scope.

---

## 38. Configuration inventory

The configuration inventory should identify:

- configuration files;
- environment-variable names;
- defaults;
- tenant scope;
- repository scope;
- command mappings;
- runner profiles;
- provider settings;
- database settings;
- feature flags;
- credential references;
- external endpoints.

Secret values must not be copied into the inventory.

Executable repository configuration must be treated as untrusted code.

---

## 39. Secret-handling reconciliation

Phase 0 should inspect whether secret values can enter:

- source control;
- configuration files;
- command arguments;
- process environments;
- logs;
- reports;
- test artifacts;
- patches;
- audit events;
- runner workspaces;
- container layers;
- provider responses.

Testing should use synthetic sentinel values.

The absence of a scanner finding must not be described as proof that no secret
exists.

---

## 40. Prompt-injection reconciliation

The review should determine whether untrusted content can influence:

- instruction precedence;
- repository scope;
- command selection;
- network access;
- credential use;
- test reporting;
- classification;
- remediation authorization;
- publication;
- governance changes.

Hostile instructions should be placed in safe synthetic:

- source comments;
- Markdown;
- configuration;
- analyzer output;
- logs;
- commit messages;
- generated artifacts.

The content must remain data and must not gain authority.

---

## 41. API and schema inventory

Phase 0 should inventory current machine-readable contracts such as:

- API request schemas;
- API response schemas;
- command schemas;
- evidence schemas;
- coverage schemas;
- finding schemas;
- authorization schemas;
- publisher schemas;
- audit schemas;
- report schemas;
- execution-state schemas.

The inventory must identify:

- schema version;
- implementation location;
- producer;
- consumer;
- validation behavior;
- compatibility behavior;
- tests.

A schema file without runtime validation must be reported as schema-only
support.

---

## 42. Test inventory

Phase 0 should inventory existing tests by:

- test identifier;
- category;
- component;
- capability;
- fixture;
- command;
- environment;
- required infrastructure;
- status;
- known flakiness;
- completion impact.

Tests should be mapped to the Phase 0 test manifest.

Tests lacking stable identifiers may receive identifiers through authorized test
maintenance.

---

## 43. Baseline test execution

The baseline should execute applicable existing tests without changing expected
behavior first.

The result must record:

- tests selected;
- tests executed;
- tests passed;
- tests failed;
- tests skipped;
- tests unavailable;
- tests timed out;
- tests not run;
- environment;
- source commit;
- runner profile;
- database version;
- tool versions;
- cleanup status.

Existing failures must not be hidden.

A baseline failure may become an authorized Phase 0 defect only when it falls
inside the approved scope.

---

## 44. Phase 0 test manifest

Phase 0 tests should be defined in:

`codex/tests/phase-0-tests.yaml`

The manifest should conform to:

`codex/tests/phase-test-manifest.schema.json`

The manifest must identify concrete required and conditional test IDs.

The phrase “run relevant tests” is insufficient for completion.

---

## 45. Minimum test categories

The Phase 0 manifest should include applicable tests for:

- governance validation;
- schema validation;
- repository-access policy;
- prohibited-repository exclusion;
- current database migration chain;
- fresh database installation;
- upgrade from a representative existing database;
- command execution;
- missing executable handling;
- runner credential isolation;
- runner filesystem isolation;
- runner network isolation;
- runner resource limits;
- runner cleanup;
- evidence normalization;
- coverage failure behavior;
- classification invariants;
- remediation authorization separation;
- publisher request rejection;
- audit mutation prevention;
- TypeScript compiler defect reproduction.

Tests requiring unavailable infrastructure must remain unavailable and must
retain their completion impact.

---

## 46. Security-control matrix

Phase 0 must populate or update:

`codex/tests/security-control-matrix.yaml`

The matrix should include current status for controls such as:

- non-root runner;
- privileged-mode denial;
- capability restrictions;
- Docker socket denial;
- host filesystem denial;
- environment allowlisting;
- trusted credential absence;
- network denial;
- cloud metadata denial;
- CPU limits;
- memory limits;
- process limits;
- disk limits;
- output limits;
- process-tree cleanup;
- Git-hook suppression;
- publisher isolation;
- tenant isolation;
- audit mutation prevention.

Configured but untested controls must remain `unverified`.

---

## 47. Capability matrix

Phase 0 should create or update a machine-readable capability matrix.

Every capability entry should identify:

- capability ID;
- status;
- supported scope;
- implementation location;
- test identifiers;
- last verified result;
- security prerequisites;
- known limitations;
- scale status;
- roadmap phase.

Valid Phase 0 outcomes include:

- `functional`;
- `experimental`;
- `partially_supported`;
- `detection_only`;
- `broken`;
- `unsupported`;
- `placeholder`;
- `unknown`.

The matrix must reflect current behavior rather than intended roadmap outcomes.

---

## 48. Capability-status evidence

A capability status should be based on applicable:

- source inspection;
- executable behavior;
- positive tests;
- negative tests;
- failure tests;
- hostile tests;
- migration tests;
- provider tests;
- fixture generalization;
- current tool availability;
- current security-control status.

Documentation alone is insufficient for `functional`.

One prepared fixture is insufficient for general functional support.

---

## 49. Known-defect register

Phase 0 should create a bounded register of verified defects.

Each defect should identify:

- defect ID;
- component;
- affected capability;
- reproduction;
- expected behavior;
- observed behavior;
- environment;
- severity;
- security impact;
- current workaround;
- authorized repair status;
- required tests;
- future phase when out of scope.

Suspected defects must remain distinguishable from reproduced defects.

---

## 50. Defect prioritization

Phase 0 should prioritize defects that block reliable current-state
reconciliation.

Examples include:

- test harness cannot execute;
- migrations cannot create a fresh database;
- capability status cannot be derived;
- runner cannot locate required declared tools;
- failures collapse into empty success;
- repository denylist is not enforced;
- credentials enter the runner;
- audit records can be silently rewritten;
- publisher can bypass draft-only restrictions.

Prioritization does not expand authorization.

---

## 51. Permitted repair characteristics

An authorized Phase 0 repair should be:

- narrow;
- reproducible;
- directly connected to a verified defect;
- compatible with existing architecture;
- covered by regression tests;
- free of fixture-specific production logic;
- free of unrelated refactoring;
- free of new broad capability claims;
- documented in the phase report.

When repair requires an architecture decision, Phase 0 should draft an ADR
rather than inventing architecture silently.

---

## 52. Repairs that require separate authorization

Separate authorization is required for repairs involving:

- broad dependency replacement;
- new hosted services;
- new infrastructure;
- production database changes;
- production credential use;
- external publication;
- destructive cleanup;
- trust-boundary changes;
- provider permission expansion;
- governance modification;
- access to additional external repositories;
- migration-history rewriting.

A defect does not automatically authorize every possible correction.

---

## 53. External repository use

External repository access is optional in Phase 0 and must be explicitly
authorized.

The authorization must identify:

- canonical repository identity;
- immutable revision;
- permitted operations;
- network access;
- credential capability;
- runner profile;
- data retention;
- cleanup;
- publication permission.

Historical use of a fixture does not constitute current authorization.

A prohibited repository must never be used.

---

## 54. External publication

Phase 0 does not require external publication.

When an authorized test explicitly includes publication, it must still require:

- exact repository identity;
- exact source commit;
- exact finding identity;
- current human disposition;
- separate remediation authorization;
- verified gates;
- verified patch hash;
- changed-file validation;
- trusted publisher;
- dedicated branch;
- draft pull request;
- idempotency;
- audit.

No Phase 0 test may merge a pull request or push directly to a default branch.

---

## 55. Destructive operations

Phase 0 should not require destructive operations.

Without explicit destructive authorization, it must not:

- delete external repositories;
- delete branches;
- delete pull requests;
- delete production data;
- truncate database tables;
- drop production schemas;
- remove audit history;
- remove user worktrees;
- delete user files;
- rewrite shared Git history.

Test cleanup must remove only resources created by the authorized test and only
when cleanup permission exists.

---

## 56. Documentation reconciliation

Phase 0 should identify documentation that is:

- accurate;
- partially accurate;
- outdated;
- aspirational;
- contradictory;
- missing;
- unverifiable.

Documentation updates should clarify current truth.

They must not make implementation appear more complete than it is.

A roadmap description must not be copied into current capability documentation
as though it were executable behavior.

---

## 57. Governance validation

Phase 0 should validate governance files for:

- valid Markdown;
- valid YAML;
- valid JSON;
- schema conformance;
- resolvable file references;
- consistent terminology;
- explicit inactive authorization when applicable;
- preserved denylist entries;
- preserved publication restrictions;
- preserved disposition and authorization separation.

Governance validation must not automatically rewrite policy files unless
governance changes are explicitly authorized.

---

## 58. Architecture decisions

Phase 0 may identify architecture decisions that need ADRs.

Examples include:

- runner isolation technology;
- trusted publisher implementation;
- audit-chain design;
- semantic-index format;
- database architecture;
- command-registry structure;
- provider abstraction.

Codex may draft a proposed ADR only when permitted.

Human approval is required before an ADR becomes accepted.

An accepted ADR still requires separate implementation authorization.

---

## 59. Reporting requirements

The Phase 0 completion report should include:

- authorization identity;
- start and completion times;
- source commit before and after;
- local worktree state before and after;
- components inventoried;
- architecture findings;
- trust-boundary findings;
- database findings;
- migration findings;
- command findings;
- runner findings;
- publisher findings;
- audit findings;
- TypeScript findings;
- dependency and license findings;
- tests executed;
- security controls validated;
- capability-status changes;
- defects reproduced;
- defects repaired;
- external operations;
- cleanup;
- blockers;
- deferred work;
- next safe action.

The report must remain bounded and free of secret values.

---

## 60. Phase 0 completion criteria

Phase 0 may be reported complete only when all applicable criteria are
satisfied:

1. The current-system inventory is complete for the authorized scope.
2. Current architecture and trust zones are documented.
3. Database and migration state are reconciled.
4. Command execution paths are inventoried.
5. Runner controls have explicit statuses.
6. Publisher behavior has an explicit status.
7. Evidence, coverage, and classification behavior are reconciled.
8. Human disposition and remediation authorization are assessed separately.
9. Current TypeScript capabilities have explicit statuses.
10. Known foundational defects are recorded.
11. Authorized foundational repairs have required regression tests.
12. Required Phase 0 tests passed.
13. Triggered conditional tests passed.
14. Required security controls passed.
15. Unavailable infrastructure is reported.
16. Capability matrix is updated.
17. Security-control matrix is updated.
18. Phase report is complete.
19. Execution state is updated.
20. No unresolved blocker contradicts completion.

When a required criterion is unavailable or failed, the phase remains blocked or
incomplete unless the human operator explicitly changes the authorized scope.

---

## 61. Valid incomplete outcomes

Phase 0 may end without completion when it discovers:

- material architecture uncertainty;
- missing required infrastructure;
- unavailable required tools;
- a containment failure;
- secret exposure;
- repository-access policy failure;
- prohibited-repository policy failure;
- destructive migration risk;
- unresolved production-data risk;
- authorization conflict;
- unavailable human decision.

A truthful blocked result is preferable to an unsupported completion claim.

---

## 62. Phase 0 stop conditions

Work must stop when:

- Phase 0 authorization is inactive;
- authorization expires;
- authorization is revoked;
- repository scope is exceeded;
- a prohibited repository is encountered;
- an external operation lacks permission;
- a credential capability is missing;
- production access would be required without permission;
- a destructive operation would be required without permission;
- a required runner control fails;
- publisher isolation fails;
- secret exposure is suspected;
- local user work cannot be preserved safely;
- governance conflict prevents safe interpretation;
- required test evidence is malformed or untrustworthy.

Stopping must be recorded in the execution state and phase report.

---

## 63. Phase handoff

The Phase 0 handoff should identify:

- whether the phase completed;
- active authorization status;
- current source commit;
- current worktree state;
- capability matrix location;
- security-control matrix location;
- test manifest and results;
- verified defects;
- unresolved blockers;
- migrations added;
- dependencies changed;
- external resources created;
- cleanup status;
- recommended next phase;
- exact human decision required.

The handoff must not claim that Phase 1 is authorized.

---

## 64. Transition to Phase 1

Phase 1 may be proposed when Phase 0 has established enough verified current
state to define a narrow TypeScript vertical slice safely.

Before Phase 1 begins:

1. Finalize the Phase 0 report.
2. Update execution state.
3. Stop Phase 0 implementation.
4. Present actual capability statuses.
5. Identify unresolved Phase 0 limitations.
6. Create a new Phase 1 authorization.
7. Obtain explicit human approval.

Phase 1 must not start automatically.

---

## 65. Fail-safe behavior

When Phase 0 evidence is incomplete or contradictory:

- use `unknown`, `partial`, `failed`, or `blocked`;
- do not invent current architecture;
- do not infer security enforcement;
- do not claim capability support;
- do not broaden the phase;
- do not access additional repositories;
- do not use additional credentials;
- do not repair unrelated defects;
- preserve the verified current state;
- identify the exact missing evidence or human decision.

Reconciliation uncertainty must reduce implementation authority.

---

## 66. Document integrity

This roadmap file must not be modified during Phase 0 implementation unless
roadmap or governance modification is explicitly authorized.

Changes require:

1. Identification of the Phase 0 planning problem.
2. Review against the roadmap overview.
3. Review against permanent safety invariants.
4. Review of authorization impact.
5. Review of completion and testing impact.
6. Updated Phase 0 test manifest where applicable.
7. Updated authorization schemas or templates where applicable.
8. A reviewable governance commit.
9. An ADR when the change alters long-lived architecture or phase semantics.

This roadmap must not be weakened to make incomplete reconciliation appear
complete or to authorize broad implementation implicitly.