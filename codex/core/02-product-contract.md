# DCAv2 Product Contract

This document defines the permanent product purpose, scope, required outcomes,
capability boundaries, and quality expectations for DCAv2.

It describes what the product is intended to become.

It does not authorize implementation of any phase, repository operation,
remediation action, publication action, or destructive operation.

Execution authority is governed by:

* `AGENTS.md`;
* `codex/core/01-instruction-precedence.md`;
* `codex/core/03-safety-invariants.md`;
* `codex/core/05-phase-authorization-protocol.md`;
* the latest explicit human authorization.

---

## 1. Product mission

DCAv2 is an evidence-driven platform for detecting, analyzing, explaining, and
safely remediating dead code across enterprise software systems.

The product must support incremental evolution from narrow, high-confidence
analysis toward broader organizational coverage.

The long-term product scope includes:

* single-package repositories;
* multi-package repositories;
* monorepos;
* polyrepo organizations;
* shared internal libraries;
* internal package registries;
* generated clients;
* distributed microservices;
* build graphs;
* deployment configurations;
* infrastructure definitions;
* runtime-observed systems.

DCAv2 must not present dead-code analysis as a purely local source-code problem.

Enterprise deadness may depend on references and behavior outside the current
file, package, repository, deployment, or organization boundary.

---

## 2. Primary product outcomes

DCAv2 must enable an authorized operator to:

1. Discover repositories and packages within approved scope.
2. Resolve analyzed revisions to immutable source snapshots.
3. Qualify repositories before expensive or unsafe execution.
4. Discover supported packages, workspaces, source roots, test roots, and build
   targets.
5. Run appropriate analyzers through versioned adapters.
6. Normalize evidence from multiple tools and sources.
7. Record successful, failed, unsupported, excluded, and unavailable analysis
   coverage.
8. Classify findings conservatively.
9. Explain why a finding received its classification.
10. Present evidence and limitations to a human reviewer.
11. Record human disposition separately from remediation authorization.
12. Reproduce an authorized finding before modifying source.
13. Apply only supported and explicitly authorized transformations.
14. Run baseline and post-change verification.
15. Validate the exact changed-file set.
16. Produce deterministic and content-addressed patches.
17. Revalidate patches at a trusted publication boundary.
18. Create draft pull requests when explicitly authorized.
19. Preserve an append-only and tamper-evident audit history.
20. Support safe retries and idempotent external operations.
21. Fail safely when evidence, coverage, identity, or authorization is
    insufficient.

---

## 3. Product responsibility boundaries

DCAv2 is responsible for the control plane surrounding dead-code decisions.

DCAv2 should primarily own:

* repository and source identity;
* analysis scope;
* evidence normalization;
* provenance;
* coverage semantics;
* evidence correlation;
* contradiction handling;
* deterministic classification policy;
* human review workflow;
* remediation authorization;
* trust-boundary enforcement;
* patch verification;
* publication safety;
* audit history;
* capability reporting;
* organization-wide analysis coordination.

DCAv2 should not unnecessarily reimplement mature ecosystem capabilities.

External tools should primarily provide:

* parsing;
* symbol extraction;
* semantic indexing;
* reference extraction;
* workspace discovery;
* package discovery;
* framework conventions;
* dependency graphs;
* build graphs;
* contract parsing;
* infrastructure parsing;
* runtime observations;
* structural transformations;
* native compilation;
* native testing;
* native package installation.

No third-party tool's final dead-code verdict is authoritative.

DCAv2 must normalize the tool's evidence and apply DCAv2 policy independently.

---

## 4. Product operating model

DCAv2 must maintain distinct product stages:

```text
Repository discovery
        ↓
Repository qualification
        ↓
Source acquisition
        ↓
Analysis and evidence collection
        ↓
Coverage evaluation
        ↓
Machine classification
        ↓
Human disposition
        ↓
Remediation authorization
        ↓
Finding reproduction
        ↓
Baseline verification
        ↓
Transformation
        ↓
Post-change verification
        ↓
Trusted publication
        ↓
Audit and reporting
```

Stages must not be silently collapsed.

A successful earlier stage does not authorize a later stage.

Examples:

* discovery does not authorize cloning;
* cloning does not authorize analysis;
* analysis does not authorize modification;
* a finding does not authorize remediation;
* a confirmed-dead disposition does not authorize source modification;
* successful remediation does not authorize publication;
* draft publication does not authorize merge.

---

## 5. Open-world product model

DCAv2 must treat enterprise dead-code analysis as an open-world problem.

A symbol may appear unused locally while still being used through:

* another package;
* another repository;
* a published package version;
* an older deployed artifact;
* an external customer;
* generated code;
* reflection;
* dependency injection;
* decorators or annotations;
* plugin registration;
* dynamic imports;
* configuration;
* feature flags;
* REST;
* GraphQL;
* gRPC;
* message brokers;
* scheduled jobs;
* infrastructure wiring;
* API gateways;
* service meshes;
* runtime invocation.

Therefore, the product must distinguish between:

* no usage found within observed scope;
* complete evidence of absence within a defined scope;
* incomplete evidence;
* contradictory evidence;
* unsupported analysis;
* stale analysis;
* confirmed positive liveness.

The product must prefer an explicit inconclusive result over an unsafe claim of
deadness.

Detailed evidence and classification rules are defined in:

* `codex/core/04-accuracy-and-evidence-policy.md`;
* `codex/architecture/evidence-model.md`;
* `codex/architecture/coverage-model.md`;
* `codex/architecture/classification-policy.md`.

---

## 6. Required classification outcomes

The product must support explicit machine classifications including:

* `candidate_dead`;
* `live_evidence_present`;
* `test_only`;
* `inconclusive`;
* `conflicting`;
* `unsupported`;
* `stale`;
* `failed`.

These outcomes must remain distinguishable.

The product must not collapse them into a single numeric score.

Numeric values may be used for:

* prioritization;
* ranking;
* review ordering;
* operational analysis.

Numeric values must not directly authorize remediation or publication.

---

## 7. Product explanation requirements

Every finding must be understandable without requiring direct database
inspection.

A finding explanation should identify, where applicable:

* repository;
* immutable source snapshot;
* package or workspace;
* file;
* exact source occurrence;
* symbol identity;
* language;
* analyzer evidence;
* discovered references;
* missing references;
* test-only references;
* cross-package evidence;
* cross-repository evidence;
* dynamic-use indicators;
* framework registrations;
* contract evidence;
* infrastructure evidence;
* runtime evidence;
* analyzer failures;
* exclusions;
* coverage limitations;
* policy blockers;
* contradictions;
* classification reason;
* freshness state;
* human disposition;
* remediation authorization state.

The explanation must distinguish observed facts from inference.

---

## 8. Repository qualification

DCAv2 must qualify repositories before treating analysis results as actionable.

Qualification should determine, where applicable:

* repository identity;
* requested revision;
* immutable commit;
* language composition;
* package managers;
* lockfiles;
* workspaces;
* package roots;
* source roots;
* test roots;
* generated directories;
* vendored directories;
* build targets;
* project configurations;
* framework indicators;
* install strategy;
* type-check strategy;
* build strategy;
* lint strategy;
* test strategy;
* service-start strategy;
* health-check strategy;
* environment requirements;
* network requirements;
* missing configuration;
* unsupported features;
* known coverage limitations.

Qualification outcomes should include:

* `ready`;
* `ready_with_limited_gates`;
* `configuration_required`;
* `baseline_broken`;
* `unsupported`;
* `inaccessible`;
* `failed`.

A missing test command is not a passed test.

A baseline-broken repository is not the same as an analyzer failure.

One repository failure must not automatically fail an organization-wide
analysis campaign.

---

## 9. Repository and package model

DCAv2 must not assume that:

* one repository equals one package;
* one repository equals one service;
* one package equals one deployment;
* one symbol has one permanent identity across all history.

The product model must support relationships among:

* tenants or accounts;
* version-control connections;
* repositories;
* source snapshots;
* workspaces;
* packages;
* package versions;
* build targets;
* artifacts;
* container images;
* deployments;
* environments;
* source documents;
* symbol occurrences;
* semantic definitions;
* reference occurrences;
* package dependencies;
* repository dependencies;
* contract edges;
* infrastructure edges;
* runtime observations;
* evidence items;
* coverage assertions.

Containment may be hierarchical.

Dependencies and deployments form graphs.

---

## 10. Monorepo product requirements

Monorepo support must be capability-based rather than advertised as a single
binary feature.

Relevant capabilities include:

* workspace discovery;
* package discovery;
* nested package discovery;
* package-manager workspace interpretation;
* multiple project configurations;
* TypeScript project references;
* path aliases;
* package exports;
* cross-workspace imports;
* cross-package semantic references;
* package-specific builds;
* package-specific tests;
* package-specific verification gates;
* partial workspace coverage reporting.

DCAv2 must not claim complete monorepo analysis when relevant packages or build
targets were skipped, failed, or unsupported.

Partial workspace coverage must remain visible and may require an inconclusive
classification.

Support for npm, pnpm, Yarn, Nx, Turborepo, Bazel, or another workspace system
must be reported independently.

---

## 11. Cross-repository product requirements

Cross-repository analysis must operate within an explicit analysis epoch.

An analysis epoch should identify:

* repositories included;
* immutable commits;
* repositories unavailable;
* packages included;
* package versions;
* registries queried;
* deployed versions;
* contracts included;
* infrastructure sources included;
* runtime environments included;
* observation windows;
* failed analyzers;
* excluded sources.

Cross-repository evidence may include:

* semantic imports;
* package dependencies;
* Git dependencies;
* internal registry consumers;
* generated-client relationships;
* package-version alignment;
* deployed-version alignment;
* contract consumers;
* runtime consumers.

Zero discovered cross-repository references must not be interpreted as complete
absence when relevant repositories or consumers were unavailable.

Public or externally consumed APIs require stronger policy because the complete
consumer universe may be unknowable.

---

## 12. Microservice product requirements

Microservice analysis must distinguish source-code use from service-level use.

Relevant evidence may include:

* route definitions;
* handlers;
* clients;
* generated clients;
* OpenAPI contracts;
* GraphQL schemas and operations;
* Protobuf definitions;
* gRPC services;
* producers;
* consumers;
* topics;
* queues;
* exchanges;
* subjects;
* scheduled jobs;
* webhooks;
* API gateways;
* service meshes;
* deployment manifests;
* runtime observations.

Producer-without-consumer and consumer-without-producer are distinct conditions.

Contract evidence must be scoped by relevant identity such as:

* source version;
* generated artifact version;
* deployment;
* environment;
* observation period.

Microservice support must be introduced incrementally, based on observed
repository inventory and phase-specific authorization.

The product must not implement every protocol merely because it appears in the
long-term roadmap.

---

## 13. Runtime evidence

DCAv2 should prefer standard runtime evidence integrations over custom runtime
agents.

OpenTelemetry is the preferred future integration standard where it provides
appropriate coverage.

Runtime evidence may include:

* service identity;
* service version;
* deployment;
* environment;
* route or operation;
* topic or queue;
* observation period;
* first-seen time;
* last-seen time;
* execution count;
* sampling information;
* collector identity;
* completeness;
* source-mapping method;
* mapping confidence.

Positive runtime activity is strong liveness evidence for the matching scope.

Missing runtime activity is not proof of non-use unless the observation scope,
version, window, and completeness are sufficient under an approved policy.

Low-frequency, emergency, annual, or externally triggered workloads must be
handled conservatively.

---

## 14. Remediation product requirements

DCAv2 remediation must be narrow, deterministic, auditable, and reversible.

A remediation attempt must:

1. Use the exact authorized source snapshot.
2. Reproduce the exact finding.
3. Verify current human disposition.
4. Verify current remediation authorization.
5. Run applicable baseline gates.
6. Apply an explicitly supported transformation.
7. Validate the expected rewrite count.
8. Validate the exact changed-file set.
9. Generate a deterministic patch.
10. Run required post-change gates.
11. Revalidate review and authorization.
12. Persist the patch and content hash.
13. Persist gate results.
14. Clean resources created by the attempt.

DCAv2 must not perform broad text deletion.

Unsupported transformation shapes must fail safely.

Detection support and transformation support must be reported separately.

---

## 15. Publication product requirements

Publication must occur through a trusted publisher boundary.

The trusted publisher must independently verify:

* account;
* repository;
* base branch;
* base commit;
* source identity;
* finding;
* exact occurrence;
* evidence digest;
* coverage identity;
* human disposition;
* remediation authorization;
* policy version;
* remediation attempt;
* baseline gates;
* post-change gates;
* patch hash;
* changed files;
* idempotency identity.

Publication may create only:

* a dedicated remediation branch;
* a draft pull request.

The product must never:

* push directly to the default branch;
* merge automatically;
* enable auto-merge;
* mark a draft pull request ready automatically;
* bypass branch protections;
* modify repository settings.

When credentials are unavailable, DCAv2 should preserve a verified,
publication-ready result and report the missing capability accurately.

---

## 16. Service retirement boundary

Source-code remediation and service retirement are separate product workflows.

DCAv2 may produce evidence-backed service-retirement recommendations.

DCAv2 must not automatically delete:

* production deployments;
* databases;
* queues;
* topics;
* cloud resources;
* DNS;
* certificates;
* secrets;
* customer data;
* backups;
* monitoring;
* audit records.

A service-retirement workflow requires separate consideration of:

* service ownership;
* static dependencies;
* contract consumers;
* runtime evidence;
* data ownership;
* retention obligations;
* compliance;
* deprecation periods;
* consumer migration;
* operational approval;
* security approval;
* shutdown authorization;
* infrastructure cleanup authorization.

Function-level remediation authorization does not authorize service retirement.

---

## 17. Product security boundaries

The product must preserve three primary trust zones:

### Trusted controller

Responsible for:

* policy;
* credentials;
* database access;
* orchestration;
* review;
* authorization;
* audit.

### Untrusted execution runner

Responsible for repository-controlled activity such as:

* dependency installation;
* analyzer execution;
* type checking;
* builds;
* tests;
* transformations;
* optional service startup.

### Trusted publisher

Responsible for:

* authenticated Git operations;
* final patch revalidation;
* remediation branch creation;
* draft pull-request creation.

The untrusted runner must never possess controller or publisher credentials.

Detailed requirements are defined in:

* `codex/architecture/trust-boundaries.md`;
* `codex/engineering/runner-security-controls.md`;
* `codex/architecture/trusted-publisher-policy.md`.

---

## 18. Audit requirements

DCAv2 must maintain an append-only audit history for security-relevant and
remediation-relevant actions.

Audit events should cover:

* discovery;
* source acquisition;
* qualification;
* analyzer execution;
* analyzer failure;
* coverage;
* classification;
* human review;
* remediation authorization;
* rejection;
* revocation;
* expiration;
* remediation;
* verification gates;
* patch creation;
* publication;
* retries;
* cancellation;
* cleanup;
* cleanup failure;
* security-policy decisions.

Historical records must not be silently rewritten or deleted.

Corrections must be represented as new events.

---

## 19. Tooling strategy

DCAv2 follows a reuse-first and build-last policy.

Before building substantial infrastructure, DCAv2 should evaluate maintained,
legally usable, secure, and machine-integrable ecosystem tools.

A tool should be integrated only when it materially improves an authorized
capability.

A tool must not be adopted solely because it exists or appears in the roadmap.

Tool selection must consider:

* capability fit;
* precision;
* supported versions;
* maintenance;
* determinism;
* machine-readable output;
* provenance;
* performance;
* security;
* licensing;
* commercial-use restrictions;
* hosted-service restrictions;
* operational cost;
* fallback behavior.

Detailed rules are defined in:

* `codex/engineering/reuse-first-policy.md`;
* `codex/engineering/tooling-and-license-policy.md`;
* `codex/engineering/dependency-adoption-checklist.md`;
* `codex/engineering/adr-policy.md`.

---

## 20. Architecture strategy

DCAv2 should evolve the existing implementation incrementally.

The product must not be rewritten from scratch without explicit authorization
and compelling evidence.

The preferred control-plane architecture is a modular monolith backed by
PostgreSQL unless measured evidence demonstrates that another deployment model
is necessary.

The product must not introduce:

* a graph database merely because the domain contains graphs;
* a message broker merely for architectural appearance;
* a microservice architecture merely because the product analyzes
  microservices;
* a custom universal compiler;
* a custom universal parser;
* a custom universal SSA platform;
* a custom universal whole-program pointer-analysis engine.

Architecture changes must be driven by measured requirements.

---

## 21. Capability reporting

DCAv2 must report support by capability, not through broad marketing labels.

For each language, repository type, package manager, framework, and adapter,
report support separately for:

* repository qualification;
* package discovery;
* workspace discovery;
* symbol inventory;
* semantic definitions;
* local references;
* cross-package references;
* cross-repository references;
* framework conventions;
* contract evidence;
* infrastructure evidence;
* runtime evidence;
* candidate classification;
* transformation;
* baseline verification;
* post-change verification;
* publication;
* service-retirement recommendation.

Support levels should distinguish:

### Functional support

The capability is implemented and validated through appropriate positive,
negative, failure, incomplete-coverage, and contradiction fixtures.

### Scale-validated support

Functional support exists and representative performance, resource limits, and
operational boundaries have been measured.

### Experimental support

The capability exists but is not yet sufficiently validated for general
production use.

### Detection-only support

The product can generate evidence or findings but cannot safely transform the
result.

### Unsupported

The capability is not implemented or cannot meet the required safety contract.

An interface, schema, placeholder, or database table does not constitute
support.

---

## 22. Product quality expectations

Product changes must be:

* testable;
* reviewable;
* auditable;
* deterministic where practical;
* idempotent where external actions are involved;
* tenant-scoped where applicable;
* failure-aware;
* explicit about unavailable infrastructure;
* explicit about limitations;
* backward-compatible where required;
* supported by additive migrations;
* documented according to actual behavior.

A passing demonstration fixture must not rely on:

* hardcoded repository names;
* hardcoded function names;
* hardcoded commits;
* fixture-specific bypasses;
* weakened security;
* skipped gates;
* invented evidence;
* modified policy.

---

## 23. Product non-goals

DCAv2 must not provide:

* autonomous source deletion without human governance;
* automatic merge;
* direct default-branch modification;
* unrestricted execution of repository code on the trusted controller;
* destructive service retirement;
* universal certainty of deadness;
* universal language support claims;
* universal framework support claims;
* automatic inference of customer approval policy;
* silent conversion of unsupported cases into success;
* mandatory dependence on commercially restricted tools;
* duplicated business logic across CLI, API, and user interface layers.

There must be no PRPilot-specific integration unless a future explicit product
decision and policy amendment authorizes it.

---

## 24. Product roadmap

Implementation must proceed through explicitly authorized phases.

The roadmap is maintained under:

`codex/roadmap/`

The roadmap does not authorize work.

Large capability areas should be split into smaller phases or sub-phases when
necessary to preserve implementation depth, testability, and reviewability.

A phase is complete only when its explicit acceptance criteria are satisfied.

Later-phase requirements remain future constraints and must not be treated as
current deliverables.

---

## 25. Product completion principle

The product must never claim completion based solely on:

* interfaces;
* schemas;
* database tables;
* placeholders;
* documentation;
* mocked external actions;
* skipped tests;
* unverified security controls;
* unmeasured broad support;
* a single successful fixture.

Completion claims must be bounded to implemented and tested capabilities.

The final product must remain honest about:

* unsupported repositories;
* unsupported languages;
* unsupported frameworks;
* incomplete consumer visibility;
* unavailable runtime evidence;
* unverified licenses;
* security-control limitations;
* scale limits;
* remaining human decisions.

---

## 26. Contract integrity

This product contract must not be modified during an implementation phase unless
the human operator explicitly authorizes governance changes.

Changes to this contract require:

1. A clear human-authorized objective.
2. Review against permanent safety invariants.
3. Identification of affected roadmap phases.
4. Identification of affected architecture and engineering policies.
5. Updated tests or schemas where applicable.
6. A reviewable governance commit.
7. An ADR when the change creates or alters a long-lived architecture or trust
   boundary.

The contract must not be weakened merely to make implementation easier.
