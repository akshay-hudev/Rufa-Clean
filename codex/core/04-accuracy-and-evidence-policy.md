# Accuracy and Evidence Policy

This policy defines how DCAv2 must collect, normalize, interpret, classify, and
report evidence about potentially dead code.

It applies to every analyzer, repository, package, workspace, source snapshot,
finding, analysis epoch, remediation decision, and capability claim.

This policy does not authorize implementation, source modification, external
repository access, remediation, publication, or destructive action.

Execution authority remains governed by:

- `AGENTS.md`;
- `codex/core/01-instruction-precedence.md`;
- `codex/core/03-safety-invariants.md`;
- `codex/core/05-phase-authorization-protocol.md`;
- the latest explicit human authorization.

---

## 1. Core accuracy principle

DCAv2 operates in an open-world environment.

A symbol that appears unused within one observed scope may still be used through
another package, repository, deployment, external consumer, generated client,
runtime convention, configuration source, or dynamic execution path.

DCAv2 must therefore distinguish between:

- usage that was positively observed;
- usage that was not observed within a defined scope;
- evidence that could not be collected;
- evidence that failed to execute;
- evidence that is contradictory;
- behavior that is unsupported;
- evidence that has become stale.

The absence of discovered usage is not automatically proof of deadness.

Unknown must remain unknown.

---

## 2. Accuracy objectives

DCAv2 must optimize for:

1. Preventing unsafe false-positive remediation.
2. Preserving positive liveness evidence.
3. Making incomplete coverage visible.
4. Keeping analyzer failures explicit.
5. Binding evidence to immutable source identity.
6. Separating observed facts from derived conclusions.
7. Explaining classifications in human-readable form.
8. Producing deterministic classifications from equivalent evidence.
9. Preventing stale evidence from authorizing current actions.
10. Reporting capability boundaries honestly.

The system may tolerate conservative false negatives when required to avoid
unsafe deletion.

It must not improve apparent recall by concealing uncertainty.

---

## 3. Facts, interpretations, and decisions

DCAv2 must maintain a distinction between three layers.

### Observed facts

Examples include:

- a declaration exists at a specific source range;
- a semantic reference was emitted by a named analyzer;
- a test file contains a reference;
- a package manifest declares a dependency;
- a route is registered in a framework configuration;
- an analyzer timed out;
- a repository was unavailable;
- runtime activity was observed during a stated interval.

### Interpretations

Examples include:

- a reference is production usage;
- a usage is test-only;
- a framework registration is a liveness signal;
- a repository omission makes coverage incomplete;
- runtime observation maps to a source occurrence;
- several analyzer results are correlated.

### Decisions

Examples include:

- `candidate_dead`;
- `live_evidence_present`;
- `test_only`;
- `inconclusive`;
- `conflicting`;
- `unsupported`;
- `stale`;
- `failed`.

Observed facts must not be rewritten to match a desired interpretation.

Interpretations and decisions must retain links to their supporting evidence and
policy versions.

---

## 4. Evidence identity

Every evidence item must be bound to sufficient identity to prevent accidental
reuse across unrelated source states.

Where applicable, record:

- tenant or account;
- repository provider;
- repository owner;
- repository name;
- requested revision;
- resolved immutable commit;
- source snapshot identity;
- file path;
- file content hash;
- language;
- package;
- workspace;
- build target;
- deployment;
- environment;
- source occurrence;
- analyzer;
- analyzer version;
- adapter version;
- configuration hash;
- query or rule version;
- execution security profile;
- collection time;
- artifact hash.

Evidence lacking required identity must not be used for remediation eligibility.

---

## 5. Evidence provenance

Every analyzer-derived result must retain provenance.

Required provenance includes, where applicable:

- analyzer name;
- analyzer version;
- adapter version;
- executable hash or container digest;
- configuration hash;
- invocation identity;
- source snapshot;
- analysis scope;
- start time;
- end time;
- exit status;
- warnings;
- exclusions;
- failure classification;
- bounded output;
- artifact hashes;
- security profile;
- coverage produced.

Analyzer output must not be stored as an unexplained final verdict.

DCAv2 must retain enough information to determine:

- which tool produced the evidence;
- against which source;
- under which configuration;
- whether execution succeeded;
- which scope was analyzed;
- which limitations applied.

---

## 6. Evidence categories

DCAv2 may normalize evidence into categories including:

- syntax declaration;
- semantic definition;
- production reference;
- test reference;
- import reference;
- re-export reference;
- callback reference;
- function-value reference;
- dynamic-use indicator;
- textual occurrence;
- cross-package reference;
- cross-repository reference;
- package dependency;
- package publication;
- registry consumption;
- generated-code relationship;
- framework registration;
- decorator or annotation registration;
- configuration registration;
- public export;
- public API exposure;
- contract binding;
- infrastructure binding;
- deployment presence;
- runtime observation;
- feature-flag evidence;
- source-history evidence;
- ownership evidence;
- analyzer failure;
- exclusion;
- unsupported behavior;
- coverage assertion.

The evidence model may evolve through additive, versioned changes.

New evidence types must define:

- meaning;
- provenance requirements;
- supported scopes;
- known limitations;
- contradiction behavior;
- classification impact;
- whether they can block remediation.

---

## 7. Positive liveness evidence

Valid positive liveness evidence must dominate weak evidence based only on
absence.

Examples of positive liveness evidence include:

- an exact semantic production reference;
- a valid cross-package reference;
- a valid cross-repository reference;
- a framework route or handler registration;
- a dependency-injection registration;
- a valid public contract binding;
- an infrastructure binding;
- a deployed artifact relationship;
- positive runtime execution;
- a known external consumer;
- an explicitly configured entry point.

Positive evidence must be scoped to the relevant identity.

A runtime event for one deployed version must not automatically prove usage of a
different source version.

A reference in one branch must not automatically apply to another immutable
commit.

When positive evidence cannot be mapped confidently to the finding, preserve
the mapping uncertainty.

---

## 8. Absence-based evidence

Absence-based evidence may support a dead-code candidate only when the relevant
coverage requirements are satisfied.

Examples include:

- no semantic references found;
- no project-level usage found;
- no package consumers found;
- no contract consumers found;
- no runtime activity observed.

Such evidence must be interpreted only within its measured scope.

The system must not convert:

- “no reference found in this repository” into “no reference exists”;
- “no runtime activity observed” into “never executed”;
- “no consumer repository available” into “no consumers exist”;
- “analyzer produced no output” into “analysis succeeded with zero findings.”

Absence-based evidence must always retain its coverage context.

---

## 9. Coverage is a prerequisite, not a vote

Coverage determines whether absence-based evidence may be interpreted.

Coverage is not an ordinary evidence item that can compensate for missing
analysis through a numeric score.

Coverage must identify, where applicable:

- repositories included;
- repositories unavailable;
- immutable commits included;
- packages included;
- packages excluded;
- workspaces included;
- workspaces excluded;
- files included;
- files excluded;
- generated files excluded;
- vendored files excluded;
- project configurations included;
- build targets included;
- analyzers completed;
- analyzers failed;
- registries queried;
- package versions examined;
- deployed versions examined;
- contracts included;
- infrastructure sources included;
- runtime environments observed;
- runtime observation windows;
- sampling information;
- known blind spots.

Required coverage must be defined by policy for each finding type and capability.

Missing required coverage must produce an `inconclusive`, `failed`,
`unsupported`, or equivalent non-remediable result.

Detailed coverage structures are defined in
`codex/architecture/coverage-model.md`.

---

## 10. Coverage must be immutable

A finding must bind to the exact coverage state used to classify it.

Coverage identity should include or reference:

- analysis epoch;
- repositories and commits;
- packages and workspaces;
- analyzer runs;
- exclusions;
- unavailable sources;
- policy version;
- coverage digest.

When relevant coverage changes, the prior classification must be reconsidered.

Examples include:

- a previously unavailable repository becomes available;
- another workspace is discovered;
- an analyzer failure is corrected;
- a deployed version is added;
- a registry query changes;
- a runtime observation window changes;
- the coverage policy changes.

A previous approval must not remain valid automatically after coverage changes.

---

## 11. Analyzer failure handling

Every analyzer execution must have an explicit outcome.

Possible outcomes include:

- succeeded;
- failed;
- timed out;
- unavailable;
- unsupported;
- malformed output;
- partially completed;
- resource exceeded;
- blocked by configuration.

A non-success outcome must never be represented as:

- zero references;
- zero findings;
- complete coverage;
- successful analysis.

Partial analyzer output may be retained for diagnostics, but classification must
reflect that the run was incomplete.

When an analyzer is required by policy, its failure must block a conclusive
absence-based classification.

---

## 12. Tool disagreement

Different tools may produce different results because they observe different
semantic layers.

Examples include:

- Tree-sitter finds a declaration;
- SCIP finds semantic references;
- Knip identifies project-level unused exports;
- grep finds textual occurrences;
- Vulture produces a heuristic Python candidate;
- runtime telemetry observes execution.

DCAv2 must not resolve disagreement by counting tools.

A result from four correlated static tools is not necessarily stronger than one
exact positive runtime or semantic reference.

Tool disagreement must be resolved through explicit policy covering:

- evidence authority;
- scope;
- precision;
- correlation;
- contradiction;
- coverage;
- freshness.

Valid contradictory evidence must produce `conflicting` or `inconclusive`
unless a defined dominance rule resolves it safely.

---

## 13. Correlated evidence

Evidence derived from the same underlying source or technique must not be
treated as fully independent confirmation.

Examples of potentially correlated evidence include:

- Tree-sitter inventory and grep over the same files;
- SCIP and TypeScript compiler output from the same project graph;
- Knip and package-manifest analysis using the same entry points;
- repeated runs of the same analyzer;
- two tools consuming the same generated index.

DCAv2 should record correlation groups or source relationships where practical.

Numeric confidence must not be inflated by counting correlated outputs as
independent votes.

---

## 14. Dynamic language and framework behavior

Dynamic behavior must reduce certainty when it cannot be resolved reliably.

Relevant behaviors include:

- reflection;
- dynamic imports;
- computed property access;
- string-based invocation;
- decorators;
- annotations;
- dependency injection;
- monkey patching;
- plugin loading;
- framework registration;
- metaprogramming;
- runtime code generation;
- convention-based entry points;
- externally supplied configuration.

When supported framework or configuration evidence identifies usage, treat it
as positive liveness evidence.

When dynamic behavior is detected but unresolved, classify conservatively.

Unsupported dynamic behavior must not be ignored merely because static
analyzers report no references.

---

## 15. Test-only evidence

References found only in tests must remain distinguishable from production
usage.

A `test_only` classification must identify:

- which test scopes were analyzed;
- whether the referenced symbol is intentionally test support;
- whether the symbol is part of a public test API;
- whether production code loads tests or fixtures dynamically;
- whether deleting the symbol would invalidate required tests.

Test-only usage is not equivalent to unused code.

Policy may permit or prohibit remediation of test-only code, but such
remediation requires explicit support and authorization.

---

## 16. Public and externally consumable code

Public exports and externally consumable APIs require stronger evidence.

Examples include:

- published package exports;
- public library functions;
- documented APIs;
- SDK entry points;
- externally callable routes;
- plugin interfaces;
- extension points;
- generated clients distributed outside the organization.

When the consumer universe is incomplete or unknowable, the finding must remain
inconclusive or policy-blocked unless an approved deprecation and observation
process provides sufficient evidence.

The absence of internal references is not sufficient to classify externally
consumable code as dead.

---

## 17. Cross-package and monorepo evidence

A package-local absence result is insufficient when the repository contains
other relevant packages or workspaces.

Monorepo evidence must account for:

- all supported workspaces;
- nested packages;
- package-manager workspace relationships;
- path aliases;
- project references;
- package exports;
- cross-package imports;
- independently built targets;
- package-specific tests;
- generated consumers.

When relevant workspaces were skipped, unsupported, or failed, coverage must be
marked incomplete.

A symbol may be classified as live when valid use is found in another package
within the same repository.

---

## 18. Cross-repository evidence

Cross-repository analysis must use a defined organization analysis epoch.

The epoch must identify:

- repositories included;
- immutable commits;
- repositories unavailable;
- package versions;
- registries queried;
- deployed versions;
- generated-client relationships;
- contracts included;
- infrastructure sources included;
- runtime environments included;
- analyzer failures.

Zero cross-repository references is meaningful only within the recorded epoch.

It must not be interpreted as organization-wide absence when relevant
repositories or consumers were unavailable.

---

## 19. Registry and version evidence

Package usage must be version-aware.

Evidence should distinguish:

- source on the default branch;
- published package versions;
- Git dependency revisions;
- generated artifacts;
- built artifacts;
- deployed artifacts;
- consumer versions.

A symbol removed from the latest source may still be required by an older
supported or deployed version.

A source-level finding must not ignore known version skew.

Registry failures or unavailable package metadata must remain visible as
coverage limitations.

---

## 20. Contract and microservice evidence

Microservice liveness may exist without a direct source-code call.

Relevant evidence includes:

- REST route registration;
- OpenAPI contracts;
- GraphQL schemas and operations;
- Protobuf definitions;
- gRPC services;
- generated clients;
- message producers;
- message consumers;
- queues;
- topics;
- exchanges;
- subjects;
- webhooks;
- schedulers;
- API gateways;
- service meshes.

Producer-without-consumer and consumer-without-producer are different
conditions.

Contract evidence must be scoped by:

- contract version;
- source version;
- generated artifact version;
- deployment;
- environment;
- observation period.

A handler with no local caller may still be live through a contract or external
request.

---

## 21. Infrastructure and deployment evidence

Infrastructure and deployment configuration may establish liveness.

Examples include:

- Kubernetes resources;
- Helm templates;
- Terraform resources;
- CloudFormation resources;
- Docker entry points;
- CI/CD definitions;
- scheduled jobs;
- API gateway routes;
- service mesh routes;
- image deployments;
- service registrations.

Infrastructure evidence must retain provenance and version identity.

Infrastructure absence alone is not proof of deadness.

A deployment relationship may be stale, incomplete, or environment-specific and
must be interpreted accordingly.

---

## 22. Runtime evidence

Positive runtime evidence is strong liveness evidence for the matching scope.

Runtime evidence must record, where applicable:

- environment;
- service;
- service version;
- deployment;
- operation;
- route;
- topic or queue;
- observation start;
- observation end;
- first seen;
- last seen;
- execution count;
- sampling;
- collector identity;
- collection completeness;
- symbol-mapping method;
- mapping confidence.

Missing runtime activity is not evidence of non-use unless policy confirms:

- the correct deployment was observed;
- the correct version was observed;
- instrumentation covered the relevant path;
- the observation window was sufficient;
- sampling was understood;
- collection completeness was sufficient;
- low-frequency workloads were considered.

Runtime absence must not override valid static liveness evidence.

---

## 23. Source-history evidence

Git history and ownership data may support prioritization and review.

Examples include:

- last modification time;
- last known caller removal;
- ownership changes;
- deprecation commits;
- revert history;
- CODEOWNERS;
- previous remediation attempts.

History evidence must not independently prove deadness.

Old age is not proof of non-use.

Recent modification is not proof of liveness.

Historical evidence should be treated as contextual unless a specific policy
defines stronger semantics.

---

## 24. Evidence freshness

Evidence must have an explicit freshness state.

Evidence becomes stale when relevant identity changes, including:

- repository commit;
- file content;
- source occurrence;
- package version;
- deployment version;
- analyzer version;
- analyzer configuration;
- rule or query version;
- coverage identity;
- policy version;
- contract version;
- runtime observation scope.

Stale evidence may remain available for audit and history.

Stale evidence must not authorize current remediation or publication.

A new source snapshot requires a new or explicitly revalidated finding.

---

## 25. Required machine classifications

DCAv2 must support at least the following classifications.

### `candidate_dead`

Evidence suggests the occurrence may be dead within a sufficiently defined
scope, and no stronger blocker or liveness evidence is present.

This remains a candidate for human review, not authorization.

### `live_evidence_present`

Valid evidence indicates that the occurrence is used within the applicable
scope.

### `test_only`

Observed usage is limited to recognized test scope.

### `inconclusive`

Required evidence or coverage is insufficient for a defensible classification.

### `conflicting`

Valid evidence sources disagree and no safe dominance rule resolves the
conflict.

### `unsupported`

The language, symbol shape, framework behavior, repository structure, or
required capability is not supported.

### `stale`

The finding or its evidence no longer matches the current source, coverage, or
policy identity.

### `failed`

Required analysis failed and no valid classification can be produced.

These classifications must not be collapsed into a single confidence
percentage.

---

## 26. Deterministic classification

Equivalent normalized evidence, coverage, and policy inputs should produce the
same classification.

Classification must be based on versioned rules.

The policy engine should support explicit concepts such as:

- dominance;
- blockers;
- contradictions;
- required coverage;
- freshness;
- unsupported shapes;
- analyzer failures;
- liveness vetoes.

Classification logic must not depend on:

- nondeterministic tool ordering;
- database row order;
- arbitrary analyzer count;
- undocumented heuristics;
- hidden operator assumptions.

Detailed classification design is maintained in
`codex/architecture/classification-policy.md`.

---

## 27. Numeric scores

Numeric scores may be retained for non-authoritative purposes such as:

- review prioritization;
- ranking;
- triage;
- operational analytics;
- calibration research.

Numeric scores must be labeled uncalibrated until validated against a reviewed
dataset.

A numeric score must never directly:

- prove deadness;
- satisfy coverage;
- override positive liveness evidence;
- resolve a contradiction;
- authorize remediation;
- authorize publication.

Score inputs and formulas must be versioned and explainable.

---

## 28. Human review evidence

Human review must bind to the exact finding and evidence state.

A human disposition must record:

- reviewer identity;
- finding identity;
- immutable source snapshot;
- exact source occurrence;
- evidence digest;
- coverage identity;
- policy version;
- rationale;
- timestamp;
- disposition.

Human review may add contextual evidence unavailable to automated analyzers.

Human-provided evidence must remain attributable and distinguishable from
machine-observed evidence.

A human disposition does not replace separate remediation authorization.

---

## 29. Remediation eligibility

A finding may become eligible for remediation only when all applicable
conditions are satisfied.

At minimum:

- classification is compatible with remediation policy;
- required coverage is complete;
- no unresolved positive liveness evidence exists;
- no unresolved contradiction exists;
- evidence is current;
- source identity is current;
- symbol shape is supported;
- human disposition is valid;
- separate remediation authorization is valid;
- finding reproduction succeeds;
- baseline gates pass.

Eligibility must be checked again immediately before publication.

---

## 30. Evidence digest

Each finding should bind to a deterministic evidence digest.

The digest should represent the authoritative normalized inputs used for the
classification, including applicable:

- evidence item identities;
- coverage identity;
- source snapshot;
- analyzer identities;
- policy version;
- exclusions;
- relevant configuration.

The digest must be stable for equivalent canonical inputs.

Ordering differences must not change the digest.

A changed digest invalidates stale human disposition or remediation
authorization unless policy explicitly provides a safe revalidation mechanism.

---

## 31. Explainability

Every classification must produce a human-readable explanation.

The explanation must identify:

- what was observed;
- what was not observed;
- which scope was analyzed;
- which scope was unavailable;
- which analyzers succeeded;
- which analyzers failed;
- which evidence was positive;
- which evidence was absence-based;
- which blockers applied;
- which contradictions existed;
- which policy rule produced the result;
- whether the result is current;
- what additional evidence could change the result.

The explanation must not imply certainty beyond the evidence.

---

## 32. Capability claims

Accuracy claims must be bounded to implemented and tested capabilities.

DCAv2 must not claim support merely because:

- an interface exists;
- a schema exists;
- a database table exists;
- a tool is listed as a future candidate;
- one fixture passed;
- an analyzer can be invoked;
- documentation describes intended behavior.

Capability claims must identify whether support is:

- functional;
- scale-validated;
- experimental;
- detection-only;
- unsupported.

Claims must state relevant limitations.

---

## 33. Calibration and evaluation

Where numeric ranking or heuristic classification is used, DCAv2 should support
evaluation against reviewed examples.

Evaluation should distinguish:

- true positives;
- false positives;
- true negatives;
- false negatives;
- inconclusive cases;
- unsupported cases;
- stale cases;
- analyzer failures.

Evaluation datasets must preserve repository confidentiality and provenance.

Metrics must not encourage unsafe classification by excluding inconclusive or
unsupported cases from reporting.

Safety-critical decisions must remain rule-based unless a future policy
explicitly authorizes and validates another method.

---

## 34. Data minimization

Evidence collection must be limited to what is necessary for the authorized
analysis.

Reports and logs should avoid storing unnecessary source content.

Prefer storing:

- identities;
- hashes;
- ranges;
- normalized facts;
- bounded excerpts when required;
- references to controlled artifacts.

Sensitive source content must not be exposed in chat, logs, or reports without a
specific need and authorization.

Secret-handling requirements remain governed by
`codex/core/08-secret-handling-policy.md`.

---

## 35. Tool limitations

Every integrated analyzer must document:

- supported languages;
- supported project types;
- supported versions;
- known blind spots;
- known false-positive modes;
- known false-negative modes;
- dynamic behavior limitations;
- failure behavior;
- required configuration;
- output semantics.

When a limitation is not known or measured, record it as:

- unknown;
- not yet measured;
- not verified.

Do not invent precision, recall, or reliability claims.

---

## 36. Evidence retention and audit

Evidence used for a finding, review, remediation, or publication decision must
remain auditable.

Historical evidence may be retained after becoming stale.

Historical evidence must not be silently rewritten to reflect newer analysis.

Corrections or reclassifications must create new records linked to the prior
state.

The audit history must allow an operator to reconstruct:

- what evidence existed;
- what coverage applied;
- which policy version was used;
- why the classification occurred;
- which human decisions followed;
- whether remediation or publication occurred.

---

## 37. Fail-safe interpretation

When evidence semantics are unclear:

- do not infer liveness absence;
- do not declare complete coverage;
- do not upgrade confidence;
- do not authorize remediation;
- preserve the raw result;
- classify as inconclusive, unsupported, conflicting, stale, or failed as
  appropriate;
- document the exact ambiguity.

Evidence uncertainty must reduce remediation eligibility.

---

## 38. Policy integrity

This policy must not be modified during an implementation phase unless the
human operator explicitly authorizes governance changes.

Changes require:

1. A clear statement of the accuracy problem being addressed.
2. Review against permanent safety invariants.
3. Identification of affected evidence types.
4. Identification of affected classifications.
5. Identification of affected coverage requirements.
6. Updated tests and fixtures.
7. Migration consideration for persisted evidence.
8. A reviewable governance commit.
9. An ADR when the change alters a long-lived classification or trust model.

This policy must not be weakened merely to increase finding counts, improve a
demonstration, bypass incomplete coverage, or make remediation easier.