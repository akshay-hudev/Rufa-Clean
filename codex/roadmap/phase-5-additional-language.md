# Phase 5 — Additional Language

This document defines the planned scope, selection process, capability
boundaries, evidence requirements, tests, stop conditions, and completion
criteria for Phase 5 of DCAv2.

Phase 5 adds one additional programming language through an evidence-based
selection and implementation process.

The phase must not claim generic polyglot support.

Only one language should be selected as the primary Phase 5 target unless the
active authorization explicitly divides the phase into separately bounded
subphases.

This roadmap file does not authorize implementation, repository access,
credential use, dependency installation, database changes, remediation,
publication, or destructive operations.

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
  id: phase-5-additional-language
  name: Additional Language
  roadmap_order: 5
  default_status: inactive
  implementation_authorized_by_this_file: false
```

The phase becomes active only when the current authorization record explicitly
identifies `phase-5-additional-language` as active.

---

## 2. Primary objective

The primary objective is to:

1. Evaluate candidate languages.
2. Select one language through a documented decision.
3. Define one narrow repository profile.
4. Define one narrow symbol profile.
5. Reuse mature parsing and semantic tooling where practical.
6. Implement source and symbol inventory.
7. Implement attributable reference and liveness evidence.
8. Define explicit coverage requirements.
9. Implement conservative classification.
10. Preserve human disposition separately.
11. Preserve remediation authorization separately.
12. Add detection-only support before remediation where necessary.
13. Add one narrow structured remediation profile only when safe.
14. Add baseline and post-change verification.
15. Preserve trusted draft-only publication boundaries.
16. Update capability, audit, test, and persistence models truthfully.

The phase succeeds through one defensible language capability, not through the
number of languages attempted.

---

## 3. Intended capability

The intended capability is conceptually:

```text
Select one additional language, qualify one supported repository profile,
inventory one supported symbol type, collect evidence for its possible use,
classify it conservatively, and optionally remediate one narrowly supported
dead-code shape when required coverage and verification are complete.
```

The capability must remain constrained by:

- selected language;
- supported language versions;
- supported compiler or interpreter versions;
- supported repository shape;
- supported build system;
- supported dependency manager;
- supported symbol shape;
- supported semantic tooling;
- supported framework conventions;
- explicit coverage;
- exact finding identity;
- current human disposition;
- separate remediation authorization;
- supported transformation tooling;
- available verification gates;
- runner security;
- trusted publication controls.

---

## 4. Phase prerequisites

Phase 5 should not begin until earlier phases have established or bounded:

- repository qualification;
- immutable source identity;
- structured command execution;
- runner isolation;
- evidence normalization;
- coverage accounting;
- deterministic classification;
- human disposition;
- separate remediation authorization;
- exact finding reproduction;
- baseline and post-change gates;
- deterministic patch generation;
- trusted publisher separation;
- additive database evolution;
- test manifests;
- capability reporting;
- security-control reporting.

The selected language must fit these existing contracts rather than replacing
them with a language-specific parallel system.

---

## 5. Non-goals

Phase 5 does not, by default, include:

- adding several languages at once;
- generic language-plugin support without one functioning implementation;
- universal semantic analysis;
- universal compiler support;
- every build system for the selected language;
- every dependency manager;
- every framework;
- every package layout;
- every reflection mechanism;
- complete runtime behavior;
- cross-repository consumer discovery;
- public API removal;
- package deletion;
- module deletion;
- automatic dependency removal;
- automatic configuration rewriting;
- automatic migration of build systems;
- automatic remediation authorization;
- direct default-branch publication;
- pull-request merge;
- enterprise-scale validation.

Unsupported behavior must remain explicit.

---

## 6. Authorization prerequisites

The active Phase 5 authorization must identify applicable:

- candidate-language research scope;
- selected language;
- local repository scope;
- external repository scope;
- immutable revisions;
- repository profiles;
- symbol profiles;
- framework profiles;
- files permitted for modification;
- manifest and lockfile permission;
- dependency-installation permission;
- compiler or interpreter permission;
- build-tool permission;
- transformation-tool permission;
- migration permission;
- database-operation permission;
- runner-image permission;
- command-registry permission;
- network access;
- package-registry access;
- credential capabilities;
- remediation permission;
- publication permission;
- external cleanup permission;
- destructive-operation permission;
- required tests;
- stop conditions;
- expiration or completion boundary.

Language selection research does not authorize implementation automatically.

Missing permissions default to denial.

---

## 7. Required phase outputs

Phase 5 should produce applicable:

- candidate-language evaluation;
- language-selection decision;
- tool-selection records;
- dependency and license decisions;
- selected language profile;
- repository qualification profile;
- compiler or interpreter profile;
- build-system profile;
- dependency-manager profile;
- source-root discovery;
- package or module identity;
- symbol identity;
- reference evidence;
- configuration evidence;
- framework evidence where selected;
- coverage profile;
- classification profile;
- detection-only capability;
- narrow remediation profile where safe;
- baseline and post-change gate profiles;
- additive database migrations;
- audit events;
- phase test manifest;
- capability-matrix updates;
- security-control updates;
- phase-completion report;
- updated execution state.

---

## 8. Candidate-language selection

The language should be selected through a documented evaluation rather than
preference alone.

Selection criteria should include:

- user demand;
- repository prevalence;
- enterprise relevance;
- current DCAv2 user needs;
- parser maturity;
- compiler or interpreter availability;
- semantic-index availability;
- symbol-resolution quality;
- reference-analysis quality;
- build-system complexity;
- dependency-management complexity;
- framework dynamism;
- reflection risk;
- code-generation prevalence;
- structured transformation tooling;
- baseline verification quality;
- licensing;
- provenance;
- security;
- maintenance burden;
- runner compatibility;
- test-fixture availability;
- expected false-positive risk.

Every score or conclusion must retain supporting evidence.

---

## 9. Candidate languages

Potential candidate languages may include, for example:

- Java;
- C#;
- Go;
- Kotlin;
- Rust;
- C;
- C++;
- Ruby;
- PHP;
- another language justified by current product demand.

This list is illustrative.

A language must not be selected merely because it is listed here.

The active authorization and selection decision must identify the actual
language.

---

## 10. One-language rule

Phase 5 should select one primary language.

A second language must not be added merely because:

- tools are already installed;
- a fixture is available;
- implementation appears similar;
- the first language work finishes early;
- remaining context or time is available.

Adding another language requires:

- a separately bounded authorization;
- independent capability definitions;
- independent tests;
- independent tool and license evaluation;
- independent completion criteria.

---

## 11. Selection report

The language-selection report should identify:

- candidates evaluated;
- evaluation date;
- evaluation criteria;
- evidence sources;
- tool candidates;
- license findings;
- security findings;
- expected repository profiles;
- expected symbol profiles;
- expected dynamic-language risk;
- expected transformation feasibility;
- expected verification gates;
- estimated implementation scope;
- selected language;
- rejected languages;
- reasons for selection and rejection;
- unresolved questions.

The report must not invent historical reasons that were not actually evaluated.

---

## 12. Selection decision

The final selection should identify:

- selected language;
- initial language version range;
- initial repository profile;
- initial build-system profile;
- initial dependency-manager profile;
- initial symbol type;
- initial detection boundary;
- initial remediation boundary;
- required tools;
- blocked features;
- acceptance criteria.

The decision should be recorded through an ADR when it establishes a long-lived
language architecture or mandatory tool dependency.

An accepted ADR does not authorize implementation.

---

## 13. Candidate-tool evaluation

Every material language tool should be evaluated for:

- canonical project identity;
- exact version;
- maintenance activity;
- supported language versions;
- supported operating systems;
- supported architectures;
- parser accuracy;
- semantic accuracy;
- output format;
- deterministic behavior;
- failure behavior;
- incremental behavior;
- licensing;
- provenance;
- security;
- installation method;
- network requirements;
- resource requirements;
- runner compatibility;
- replacement boundary.

A tool must not become mandatory before its evaluation is complete.

---

## 14. Reuse-first expectation

Phase 5 should reuse mature tools where they provide better evidence than a
small custom implementation.

Potential reusable tool categories include:

- compiler APIs;
- language servers;
- semantic indexes;
- Tree-sitter grammars;
- static analyzers;
- package-manager APIs;
- build-system APIs;
- structured rewrite tools;
- codemod frameworks.

Custom code should focus on:

- adapters;
- normalization;
- coverage;
- policy;
- provenance;
- orchestration;
- verification;
- audit.

DCAv2 should not recreate a full compiler or language server unnecessarily.

---

## 15. Tool roles

Every adopted tool must have one explicit role.

Example roles include:

- syntax parser;
- symbol inventory producer;
- semantic reference producer;
- build graph producer;
- configuration parser;
- unused-code supporting analyzer;
- structured transformation engine;
- baseline verification tool.

No external tool may directly determine:

- human disposition;
- remediation authorization;
- publication authorization;
- repository-access policy;
- final DCAv2 classification;
- safety policy.

---

## 16. Tool licensing

Tool licensing must be verified before mandatory adoption.

The decision should identify:

- exact project;
- exact version;
- authoritative license source;
- license identifier;
- distribution implications;
- network-service implications;
- attribution requirements;
- notice requirements;
- modification obligations;
- approval status.

When licensing cannot be established confidently:

- do not make the tool mandatory;
- do not distribute it;
- do not claim approval;
- mark adoption blocked or experimental;
- evaluate alternatives.

---

## 17. Tool security

Security evaluation should consider:

- execution of repository code;
- plugin loading;
- compiler extensions;
- build hooks;
- network behavior;
- environment access;
- filesystem traversal;
- archive extraction;
- native code;
- daemon processes;
- background workers;
- output size;
- crash behavior;
- malformed project handling;
- dependency provenance.

A parser library and a full build tool may require different runner profiles.

---

## 18. Tool provenance

Tool provenance should identify:

- package or binary source;
- download source;
- checksum or digest;
- signature where available;
- build provenance where available;
- version;
- installation command;
- runner image;
- cache behavior.

A tool obtained from an unverified arbitrary download must not become a trusted
mandatory dependency.

---

## 19. Tool fallback behavior

DCAv2 must not silently fall back to:

- a host-global compiler;
- a host-global language server;
- an undeclared parser version;
- another analyzer with weaker semantics;
- a text-only search;
- a fixture-specific heuristic.

When a required tool is unavailable, the result must be:

- `unavailable`;
- `unsupported`;
- `configuration_required`;
- or `blocked`;

as appropriate.

---

## 20. Language profile

The selected language profile should define:

- profile ID;
- profile version;
- language;
- supported language versions;
- supported operating systems;
- supported architectures;
- supported repository shapes;
- supported build systems;
- supported dependency managers;
- supported package or module layouts;
- supported symbol kinds;
- supported evidence types;
- supported framework adapters;
- required coverage;
- required baseline gates;
- remediation boundary;
- known limitations.

The profile must be versioned independently from tool versions.

---

## 21. Repository qualification

Qualification for the selected language should identify:

- repository identity;
- immutable source commit;
- language presence;
- language version;
- compiler or interpreter;
- build system;
- dependency manager;
- package or module roots;
- source roots;
- test roots;
- generated roots;
- configuration;
- required tools;
- required commands;
- baseline readiness;
- unsupported features;
- blockers.

The presence of language files alone does not establish readiness.

---

## 22. Qualification statuses

Qualification should use explicit statuses such as:

- `ready`;
- `ready_with_limited_gates`;
- `configuration_required`;
- `baseline_broken`;
- `partially_supported`;
- `detection_only`;
- `unsupported`;
- `inaccessible`;
- `failed`;
- `stale`;
- `security_blocked`;
- `authorization_rejected`.

Only `ready` may satisfy all requested workflow prerequisites.

---

## 23. Version resolution

The selected compiler, interpreter, or language toolchain version must be
resolved deterministically.

The resolution record should identify:

- declared version;
- resolved version;
- executable identity;
- executable digest where applicable;
- resolution method;
- runner image;
- project-local versus runner-provided status;
- support status;
- conflicts.

A host-global tool must not satisfy a missing approved tool silently.

---

## 24. Build-system detection

The selected language may have several build systems.

The initial profile should support one bounded build-system family or mode.

Qualification should identify:

- build-system identity;
- version;
- project files;
- module or package graph;
- source sets;
- test sets;
- generated outputs;
- plugin system;
- build hooks;
- supported commands;
- support status.

Unknown build plugins must remain explicit.

---

## 25. Dependency-manager detection

The selected language profile should define supported dependency-management
behavior.

Qualification should identify:

- dependency manager;
- manifest files;
- lockfiles;
- package repositories;
- local dependencies;
- version constraints;
- build-time dependencies;
- test dependencies;
- optional dependencies;
- plugin dependencies;
- conflicts;
- support status.

Manifest presence does not authorize dependency installation.

---

## 26. Dependency installation

When installation is required, the command must define:

- tool version;
- source commit;
- manifest and lockfile identities;
- immutable or locked behavior;
- registry destinations;
- credential capability;
- lifecycle or build-hook policy;
- cache policy;
- working directory;
- timeout;
- resource limits;
- output limits;
- expected changed files;
- cleanup.

Unexpected manifest or lockfile mutation must cause failure.

---

## 27. Build hooks and plugins

Build hooks and plugins are repository- or dependency-controlled code.

They must execute only inside the untrusted runner.

The profile must identify whether they are:

- disabled;
- enabled;
- selectively permitted;
- required but unsupported.

When enabled, they must remain subject to:

- restricted network;
- restricted credentials;
- filesystem confinement;
- CPU limits;
- memory limits;
- process limits;
- disk limits;
- output limits;
- timeouts;
- cleanup.

---

## 28. Source-root discovery

Source-root discovery should produce normalized repository-relative paths.

Every root should identify:

- package or module;
- discovery method;
- language profile;
- inclusion status;
- generated status;
- test status;
- symlink status;
- support status;
- coverage role.

Unknown or inaccessible roots must reduce coverage.

---

## 29. Package or module identity

The selected language should define a canonical unit of code organization.

Depending on the language, this may be:

- package;
- module;
- namespace;
- crate;
- assembly;
- project;
- target;
- source set.

Identity should bind applicable:

- repository;
- source commit;
- root path;
- declared name;
- build-system identity;
- package or module kind;
- configuration digest;
- source digest.

Display name alone is insufficient.

---

## 30. Multi-project repositories

A repository may contain several independent projects or build roots.

The initial profile should define whether it supports:

- one project;
- several projects in one build;
- nested independent builds;
- shared source roots;
- generated projects;
- sample or fixture projects.

Ambiguous project ownership must produce `configuration_required` or
`unsupported`.

It must not be flattened silently.

---

## 31. Symbol inventory

The selected symbol inventory should retain applicable:

- symbol ID;
- repository;
- source commit;
- package or module;
- source file;
- source occurrence;
- name;
- qualified name;
- symbol kind;
- visibility;
- export status;
- modifiers;
- annotations or attributes;
- containing symbol;
- generated status;
- content digest;
- language profile.

Symbol identity must not rely only on name.

---

## 32. Initial symbol profile

The initial supported symbol type should be narrow.

Potential examples include:

- private method;
- private function;
- unexported package-level function;
- private static helper;
- internal class member.

The selected profile should prefer a symbol that:

- has a clear visibility boundary;
- has mature semantic-reference tooling;
- has low reflection risk;
- has a safe structured transformation;
- has strong compiler or test verification;
- is not part of a public API;
- can be tested across several fixtures.

---

## 33. Excluded symbol types

The initial profile should exclude applicable:

- public APIs;
- exported symbols;
- interface members;
- protocol members;
- virtual or overridable methods;
- reflection-sensitive members;
- annotation-registered members;
- framework entry points;
- generated symbols;
- serialization members;
- native-bound symbols;
- external linkage symbols;
- dynamically loaded symbols;
- package entry points.

Exclusions must remain explicit.

---

## 34. Visibility is not proof

Private, internal, or unexported visibility reduces possible consumer scope but
does not prove deadness.

A private symbol may still be live through:

- ordinary calls;
- callbacks;
- reflection;
- annotations;
- registration;
- serialization;
- tests;
- generated code;
- native bindings;
- framework conventions.

Visibility is one evidence dimension, not the classification conclusion.

---

## 35. Reference evidence

Reference evidence should include applicable:

- direct call;
- value reference;
- type reference;
- import or use reference;
- callback registration;
- configuration reference;
- annotation or attribute registration;
- test reference;
- generated-code reference;
- build-system reference;
- serialization reference;
- reflective candidate;
- dynamic-loading candidate.

Every evidence item must retain exact provenance and source occurrence.

---

## 36. Semantic reference preference

Semantic references should be preferred over text matching.

Text search may provide:

- candidate discovery;
- unresolved string-reference hints;
- contradiction detection;
- diagnostics.

Textual absence must not be treated as semantic absence.

A textual match must not be treated as an exact reference without a supported
resolution rule.

---

## 37. Type and signature references

Some languages expose liveness through:

- type signatures;
- interface implementation;
- trait or protocol conformance;
- generic constraints;
- annotations;
- method references;
- function pointers;
- delegates.

The selected language profile must define how these affect liveness.

A method required by an implemented interface or protocol must not be removed
merely because no direct call exists.

---

## 38. Override and dispatch behavior

Languages may support:

- virtual dispatch;
- interface dispatch;
- method overriding;
- extension methods;
- dynamic dispatch;
- trait implementations;
- reflection-based dispatch.

The initial remediation profile should exclude symbols whose dispatch target
cannot be resolved completely.

Override and implementation relationships must remain visible in evidence and
coverage.

---

## 39. Reflection

The selected language may expose reflection through:

- string-based type lookup;
- member lookup;
- dependency injection;
- serialization;
- annotations;
- runtime module loading;
- plugin systems;
- native bindings.

Reflection handling should classify scope as:

- resolved;
- partially resolved;
- unresolved;
- unsupported;
- failed.

Unresolved relevant reflection must prevent complete coverage.

---

## 40. Annotations and attributes

Annotations, attributes, decorators, or metadata may register code without
ordinary calls.

Every supported rule should identify:

- annotation or attribute identity;
- resolved import or type;
- target symbol;
- registration effect;
- framework or library;
- version;
- source occurrence;
- ambiguity.

Name-only matching is insufficient.

---

## 41. Configuration-driven liveness

Configuration may refer to symbols through:

- qualified names;
- class names;
- method names;
- package names;
- assembly or module names;
- entry-point identifiers;
- plugin declarations;
- dependency-injection bindings.

Every supported configuration adapter should define:

- schema;
- source path;
- resolution method;
- version;
- dynamic fields;
- coverage impact.

Unresolved configuration references must preserve uncertainty.

---

## 42. Generated code

Generated code may reference or expose authored symbols.

The profile should distinguish:

- authored source;
- generated source;
- generated metadata;
- compiled output;
- code-generation inputs;
- temporary build output.

Generated source must not be remediated by default.

Unavailable required generated output must reduce coverage.

---

## 43. Native and foreign-function boundaries

The selected language may interact with:

- C ABI;
- JNI;
- P/Invoke;
- cgo;
- FFI;
- WebAssembly;
- embedded runtimes;
- generated bindings.

Symbols exposed through native or foreign-function boundaries may be live
without ordinary source references.

The initial profile should exclude such symbols unless the boundary is modeled
explicitly.

---

## 44. Build-system evidence

Build files may create liveness through:

- entry-point declarations;
- source-set inclusion;
- code-generation tasks;
- plugin registration;
- reflection configuration;
- linker exports;
- test discovery;
- service registration.

Build-system evidence must retain:

- project identity;
- configuration occurrence;
- build-system version;
- source commit;
- semantic role;
- support status.

Build files are untrusted data.

---

## 45. Framework adapters

Framework support for the selected language must use versioned adapters.

Each adapter should define:

- adapter ID;
- adapter version;
- framework;
- supported framework versions;
- supported language profiles;
- evidence types;
- coverage dimensions;
- configuration requirements;
- dynamic behavior;
- remediation boundary;
- required commands;
- required tests;
- status.

The first language capability may omit framework remediation entirely.

---

## 46. Detection before remediation

Phase 5 should normally progress through:

1. Repository qualification.
2. Source inventory.
3. Symbol inventory.
4. Evidence collection.
5. Coverage reporting.
6. Conservative classification.
7. Human review.
8. Exact reproduction.
9. Structured remediation.
10. Verification.
11. Trusted publication.

The phase may stop at detection-only support.

A language does not require remediation support to provide a valid bounded
capability.

---

## 47. Evidence normalization

Tool output must be normalized into the common DCAv2 evidence model.

Normalization should retain:

- repository;
- source commit;
- language profile;
- language version;
- toolchain identity;
- build-system identity;
- dependency-state identity;
- package or module;
- symbol;
- source occurrence;
- producer;
- producer version;
- adapter version;
- evidence type;
- polarity;
- strength;
- ambiguity;
- configuration identity;
- raw artifact digest;
- execution status.

Tool-specific confidence must not become classification policy directly.

---

## 48. Evidence freshness

Evidence becomes stale when applicable:

- source commit changes;
- relevant file content changes;
- language version changes;
- compiler or interpreter changes;
- build-system version changes;
- dependency inputs change;
- package graph changes;
- source roots change;
- framework version changes;
- adapter version changes materially;
- configuration changes;
- tool version changes;
- evidence canonicalization changes.

Stale evidence must not satisfy remediation prerequisites.

---

## 49. Contradictory evidence

Contradictory evidence must remain visible.

Examples include:

- an unused-code analyzer reports no references;
- compiler indexing reports a use;
- configuration exposes the symbol;
- a framework adapter registers the symbol;
- generated metadata exposes the symbol;
- reflection scope is unresolved;
- build output contains an entry-point relation.

Positive liveness evidence must dominate absence evidence under the selected
profile.

Tool count must not act as majority voting.

---

## 50. Coverage profile

The selected language coverage profile should identify required dimensions such
as:

- language-version resolution;
- toolchain resolution;
- build-system qualification;
- dependency-state qualification;
- source-root discovery;
- package or module discovery;
- syntax parsing;
- symbol inventory;
- semantic reference analysis;
- type and signature analysis;
- visibility and export analysis;
- override and dispatch analysis;
- configuration analysis;
- annotation or attribute analysis;
- framework analysis;
- reflection analysis;
- dynamic loading;
- generated-source analysis;
- native-boundary analysis;
- test-scope analysis;
- required baseline readiness.

Every dimension must have an explicit status.

---

## 51. Coverage statuses

Coverage should use statuses such as:

- `complete`;
- `partial`;
- `failed`;
- `unsupported`;
- `unavailable`;
- `excluded`;
- `stale`;
- `not_applicable`.

Only `complete` may satisfy a required dimension.

Unsupported scope must not be represented as excluded merely because the
adapter cannot analyze it.

---

## 52. Coverage aggregation

Coverage should aggregate from:

- project coverage;
- package or module coverage;
- source-file coverage;
- analyzer coverage;
- configuration coverage;
- framework coverage;
- generated-code coverage;
- dynamic-behavior coverage;
- environment coverage;
- baseline readiness.

A simple percentage is insufficient.

Every failed, unsupported, inaccessible, or stale required scope must remain
visible.

---

## 53. Coverage digest

A deterministic coverage digest should bind applicable:

- repository identity;
- source commit;
- language profile;
- language version;
- toolchain identity;
- build-system identity;
- dependency-state identity;
- project graph;
- package or module identities;
- analyzer identities;
- configuration digests;
- framework adapter identities;
- generated-artifact digests;
- analyzed scopes;
- failed scopes;
- unsupported scopes;
- completion statuses.

Changing any required input must invalidate the digest.

---

## 54. Open-world handling

The selected language profile must identify unknown consumer scope.

Potential unknown scope includes:

- external packages;
- published APIs;
- plugins;
- native callers;
- dynamically loaded modules;
- reflection;
- serialization;
- framework discovery;
- generated clients;
- environment-specific entry points;
- cross-repository consumers.

Unknown relevant scope must prevent unsafe dead-code conclusions.

---

## 55. Classification profile

The initial classification profile should be versioned and narrow.

A finding may become `candidate_dead` only when:

- the repository profile is supported;
- the symbol shape is supported;
- source identity is current;
- toolchain identity is current;
- required coverage is complete;
- no dominant liveness evidence exists;
- no unresolved dispatch may reach the symbol;
- no unresolved reflection may reach the symbol;
- no framework or configuration registration exposes the symbol;
- no public or external consumer boundary exposes the symbol;
- required analyzers succeeded;
- classification is deterministic.

A classification is not a human disposition.

---

## 56. Classification outcomes

Applicable outcomes may include:

- `live`;
- `candidate_dead`;
- `inconclusive`;
- `detection_only`;
- `unsupported`;
- `failed`;
- `stale`.

`Candidate_dead` must remain unavailable when any required semantic, dynamic,
framework, public-surface, or native-boundary scope is unresolved.

---

## 57. Classification explanation

The explanation should include:

- repository;
- source commit;
- language profile;
- language version;
- toolchain;
- build system;
- dependency state;
- package or module;
- target symbol;
- ordinary references;
- type and signature evidence;
- visibility and export evidence;
- dispatch evidence;
- annotation or attribute evidence;
- configuration evidence;
- framework evidence;
- reflection uncertainty;
- dynamic-loading uncertainty;
- generated-code evidence;
- native-boundary evidence;
- test evidence;
- coverage digest;
- policy version;
- resulting status.

The explanation must remain bounded and reproducible.

---

## 58. Human disposition

Human disposition remains separate from machine classification.

A disposition should bind to:

- finding ID;
- repository;
- source commit;
- language profile;
- toolchain identity;
- package or module;
- symbol;
- classification identity;
- evidence digest;
- coverage digest;
- human actor;
- timestamp.

A material source, toolchain, evidence, or coverage change may make the
disposition stale.

---

## 59. Remediation authorization

Remediation authorization should bind to:

- authorization ID;
- finding ID;
- repository identity;
- source commit;
- language profile;
- toolchain identity;
- build-system identity;
- dependency-state identity;
- package or module identity;
- symbol identity;
- human disposition;
- evidence digest;
- coverage digest;
- transformation ID;
- permitted files;
- required gates;
- expiration or completion boundary;
- human authorizer.

A `confirmed_dead` disposition must not imply remediation authority.

---

## 60. Exact finding reproduction

Before transformation, DCAv2 must reproduce:

- repository identity;
- source commit;
- language profile;
- language version;
- toolchain identity;
- build-system identity;
- dependency-state identity;
- project graph;
- package or module identity;
- symbol identity;
- source occurrence;
- visibility and export state;
- annotation or attribute state;
- framework registration state;
- evidence digest;
- coverage digest;
- human disposition;
- remediation authorization.

Any mismatch must block transformation.

---

## 61. Baseline gates

The selected language profile should define required baseline gates such as:

- dependency-state preparation;
- syntax parsing;
- compilation;
- type checking;
- build;
- lint;
- unit tests;
- integration tests;
- package validation;
- framework validation;
- generated-artifact validation;
- repository-status checks;
- secret checks.

Every gate must have a stable command identity.

A required unavailable gate blocks remediation.

---

## 62. Structured transformation

Remediation must use a structured, language-aware transformation.

The transformation must bind to:

- transformation ID;
- transformation version;
- language grammar;
- target symbol;
- source occurrence;
- source digest;
- expected rewrite count;
- permitted files;
- coverage digest;
- tool version.

Plain text deletion must not be used when syntax or semantic ambiguity exists.

---

## 63. Initial transformation boundary

The initial transformation should support one narrow syntax shape.

It should reject applicable:

- public symbols;
- exported symbols;
- annotated or registered symbols;
- virtual or override-sensitive symbols;
- generated source;
- native-bound symbols;
- reflection-sensitive symbols;
- symbols with ambiguous comments;
- symbols with unsupported syntax;
- symbols requiring configuration changes;
- symbols requiring manifest changes;
- symbols requiring dependency changes.

Unsupported targets must fail before modification.

---

## 64. Rewrite-count validation

The transformation must define an exact expected rewrite count.

The operation must fail when:

- no target is rewritten;
- several targets are rewritten;
- a different symbol is selected;
- unrelated code changes;
- formatting changes exceed the supported rule;
- unsupported syntax is encountered;
- generated files change unexpectedly.

A successful tool exit does not satisfy rewrite validation.

---

## 65. Changed-file validation

After transformation, DCAv2 must calculate the complete repository changed-file
set.

Validation must include:

- added files;
- modified files;
- deleted files;
- renamed files;
- file modes;
- symbolic links;
- binary files;
- generated files;
- manifests;
- lockfiles;
- project files;
- configuration;
- repository-relative paths;
- content hashes.

Any file outside the authorized set must cause failure.

---

## 66. Deterministic transformation

Equivalent authorized inputs should produce the same semantic patch.

Determinism tests should control:

- source commit;
- language version;
- transformation version;
- transformation-tool version;
- configuration;
- file ordering;
- locale;
- line endings;
- formatter behavior;
- random state;
- temporary paths.

The patch digest must exclude irrelevant environment variation.

---

## 67. Transformation idempotency

Reapplying the transformation to already transformed source must not remove
additional similarly named symbols.

The second application should produce one documented result such as:

- no-op success;
- already applied;
- exact target not found.

The behavior must be deterministic and tested.

---

## 68. Post-change gates

Post-change verification must rerun all required language and project gates.

Applicable gates include:

- parsing;
- compilation;
- type checking;
- build;
- lint;
- unit tests;
- integration tests;
- package validation;
- framework validation;
- generated-artifact validation;
- changed-file validation;
- patch determinism;
- secret scanning.

Every required gate must pass.

---

## 69. Baseline comparison

The workflow must compare baseline and post-change results.

The comparison should identify:

- newly introduced compiler errors;
- changed type diagnostics;
- changed lint diagnostics;
- changed tests;
- changed package artifacts;
- changed generated output;
- changed framework metadata;
- unavailable gates;
- unchanged pre-existing failures.

A matching non-zero exit code is not sufficient proof of no regression.

---

## 70. Patch generation

After successful verification, DCAv2 may generate a deterministic patch.

The patch record should include:

- repository identity;
- base commit;
- language profile;
- toolchain identity;
- build-system identity;
- dependency-state identity;
- package or module identity;
- finding ID;
- remediation attempt ID;
- transformation ID;
- changed files;
- gate-result identities;
- patch format;
- patch size;
- patch hash;
- source hashes before and after;
- secret-scan result;
- creation time.

Patch generation does not authorize publication.

---

## 71. Trusted publication

When separately authorized, publication must continue through the trusted
publisher.

The publisher must validate:

- repository-access policy;
- prohibited-repository policy;
- exact base commit;
- finding identity;
- disposition identity;
- remediation authorization;
- language profile;
- evidence and coverage digests;
- required gate results;
- patch hash;
- changed files;
- branch policy;
- draft-only operation;
- idempotency identity.

The publisher must not execute the selected language toolchain, build system,
tests, plugins, generators, or repository scripts.

---

## 72. Database evolution

Phase 5 may persist concepts such as:

- language-selection decisions;
- language profiles;
- toolchain identities;
- build-system identities;
- dependency-state identities;
- project identities;
- package or module identities;
- selected-language symbol identities;
- reference evidence;
- framework evidence;
- dynamic-use records;
- coverage records;
- language gate results;
- transformation records.

Persistence changes must use additive ordered migrations.

Historical TypeScript and Python records must remain interpretable.

---

## 73. Migration compatibility

Migration testing should include:

- fresh installation;
- upgrade from the Phase 4 schema;
- existing TypeScript records;
- existing Python records;
- selected-language profiles;
- toolchain identities;
- project identities;
- package or module records;
- symbol records;
- partial coverage;
- historical findings;
- multiple tenants;
- migration failure;
- retry;
- projection rebuild;
- audit preservation.

Existing migrations must not be rewritten.

---

## 74. Audit requirements

Phase 5 should produce audit events for applicable:

- candidate-language evaluation started;
- candidate-language evaluation completed;
- language selected;
- language rejected;
- tool evaluated;
- tool approved;
- tool rejected;
- language qualification requested;
- toolchain resolved;
- toolchain rejected;
- project discovered;
- package or module discovered;
- symbol discovered;
- reference evidence recorded;
- framework evidence recorded;
- dynamic-use risk recorded;
- coverage completed;
- coverage partial;
- finding classified;
- human disposition recorded;
- remediation authorized;
- finding reproduced;
- baseline gate completed;
- transformation completed;
- unexpected file rejected;
- post-change gate completed;
- patch created;
- publication requested;
- cleanup completed;
- cleanup failed.

Audit events must remain tenant-scoped and secret-free.

---

## 75. Runner requirements

The selected compiler, interpreter, build system, dependency manager, analyzers,
plugins, generators, tests, and transformations must execute in an approved
untrusted runner profile.

The profile must enforce applicable:

- non-root execution;
- no privileged mode;
- no Docker socket;
- no trusted credentials;
- explicit environment allowlist;
- repository-scoped mounts;
- approved cache mounts;
- registry-only network during dependency installation;
- network-disabled analysis and gates where possible;
- CPU limits;
- memory limits;
- process limits;
- disk limits;
- output limits;
- timeouts;
- process-tree cleanup;
- workspace cleanup.

Native or highly dynamic toolchains may require stronger isolation.

---

## 76. Network profiles

Phase 5 should use separate network profiles for applicable stages:

- provider read-only source acquisition;
- approved registry-only dependency installation;
- network-disabled parsing and semantic analysis;
- network-disabled compilation and tests where possible;
- local-test-services-only integration tests;
- provider-publish-only trusted publication.

Repository configuration must not broaden these profiles.

---

## 77. Credential boundaries

Credential capabilities may include:

- provider read credential;
- package-registry read credential;
- synthetic test-service credential;
- controller database credential;
- trusted publisher credential.

The runner may receive only the minimum explicitly authorized capability
required for one stage.

It must never receive:

- trusted publisher credentials;
- controller database credentials;
- unrelated provider credentials;
- broad cloud credentials;
- production application secrets.

Repository content cannot authorize credentials.

---

## 78. Prompt-injection resistance

Instructions found in:

- source comments;
- documentation;
- manifests;
- build files;
- configuration;
- compiler diagnostics;
- analyzer output;
- test output;
- generated artifacts;
- package metadata;
- commit messages;

must remain untrusted data.

They must not:

- change language selection;
- broaden repository scope;
- add trusted tools;
- alter command definitions;
- choose credentials;
- broaden registry access;
- exclude required source;
- mark failures as passed;
- create human disposition;
- authorize remediation;
- trigger publication;
- modify governance.

---

## 79. Secret handling

The selected language ecosystem may contain secret-bearing:

- registry configuration;
- environment files;
- build configuration;
- test configuration;
- cloud configuration;
- signing configuration;
- deployment files.

DCAv2 must prevent exposure through:

- command arguments;
- process environments;
- logs;
- build output;
- test output;
- generated metadata;
- caches;
- patches;
- publication text;
- audit events.

Synthetic credential canaries should validate redaction and cleanup.

---

## 80. Phase 5 test manifest

Phase 5 should receive a dedicated test manifest such as:

`codex/tests/phase-5-tests.yaml`

If introduced, the file must conform to:

`codex/tests/phase-test-manifest.schema.json`

The manifest must identify concrete required and conditional test IDs.

The phrase “run relevant tests” is insufficient.

---

## 81. Minimum selection tests

Selection-process validation should verify:

- required evaluation criteria are present;
- every candidate has attributable evidence;
- license status is explicit;
- security status is explicit;
- tool availability is explicit;
- rejected candidates have reasons;
- selected language has one bounded profile;
- selected language has one bounded symbol shape;
- unresolved mandatory tool licensing blocks selection;
- unsupported claims are absent.

The selection process itself should be reviewable and reproducible.

---

## 82. Minimum qualification tests

Qualification tests should cover:

- supported repository profile;
- unsupported language version;
- missing compiler or interpreter;
- host-global tool present;
- unsupported build system;
- conflicting build systems;
- unsupported dependency manager;
- missing lockfile;
- conflicting dependency inputs;
- ambiguous project roots;
- generated-only source;
- unsupported framework behavior;
- prohibited repository identity;
- immutable revision failure.

Every result must map to an explicit qualification status.

---

## 83. Minimum toolchain tests

Toolchain tests should cover:

- approved toolchain available;
- wrong version;
- missing executable;
- executable outside approved path;
- host-global fallback attempt;
- malformed version output;
- tool replaced between validation and execution;
- unsupported operating system;
- unsupported architecture;
- plugin missing;
- plugin unsupported;
- timeout;
- resource exhaustion.

No undeclared fallback should occur.

---

## 84. Minimum project-discovery tests

Project-discovery tests should cover:

- supported single project;
- several supported projects where implemented;
- nested independent build;
- duplicate project identity;
- shared source root;
- generated project;
- test-only project;
- project outside repository;
- symbolic-link escape;
- conflicting configuration;
- project moved after qualification.

Project identity must remain deterministic.

---

## 85. Minimum symbol-identity tests

Symbol tests should cover:

- supported private or internal symbol;
- public symbol;
- exported symbol;
- duplicate names;
- same name in different modules;
- same name in different packages;
- override-sensitive symbol;
- annotated symbol;
- generated symbol;
- native-bound symbol;
- symbol moved;
- symbol body changed;
- unsupported syntax.

Only explicitly supported shapes may become remediation-eligible.

---

## 86. Minimum reference tests

Reference tests should cover applicable:

- direct call;
- value reference;
- type reference;
- callback registration;
- interface or trait implementation;
- method reference;
- configuration reference;
- annotation registration;
- test reference;
- generated-code reference;
- native-boundary reference;
- dynamic-loading candidate;
- reflection candidate;
- comment-only occurrence;
- string-only occurrence;
- analyzer failure;
- malformed analyzer output.

---

## 87. Minimum coverage tests

Coverage tests should cover:

- complete supported repository;
- parse failure;
- unresolved package or module;
- failed semantic analyzer;
- unsupported dispatch behavior;
- unresolved reflection;
- unsupported framework registration;
- missing generated artifact;
- unknown native consumer;
- public external surface;
- unavailable dependency;
- untested required platform;
- stale toolchain;
- source changed after analysis.

Complete coverage must require all relevant dimensions.

---

## 88. Minimum classification tests

Classification tests should verify:

- complete supported absence evidence;
- direct liveness;
- type-system liveness;
- interface or override liveness;
- configuration liveness;
- annotation registration;
- test liveness;
- unresolved reflection;
- unresolved dynamic loading;
- unsupported native boundary;
- public API uncertainty;
- failed analyzer;
- stale evidence;
- positive evidence dominance;
- input-order independence.

---

## 89. Minimum disposition tests

Disposition tests should cover:

- `confirmed_dead`;
- `confirmed_live`;
- `needs_investigation`;
- stale classification rejection;
- wrong project rejection;
- wrong package or module rejection;
- wrong symbol rejection;
- revocation;
- supersession;
- history preservation;
- prevention of automatic remediation authority.

---

## 90. Minimum remediation-authorization tests

Authorization tests should cover:

- exact valid authorization;
- missing authorization;
- expired authorization;
- revoked authorization;
- wrong repository;
- wrong commit;
- wrong language profile;
- wrong toolchain;
- wrong project;
- wrong package or module;
- wrong symbol;
- wrong evidence digest;
- wrong coverage digest;
- wrong transformation;
- changed-file scope mismatch;
- stale disposition;
- reuse after completion.

Every mismatch must deny remediation.

---

## 91. Minimum reproduction tests

Reproduction tests should cover:

- exact symbol reproduced;
- same name in another module;
- same name in another package;
- symbol moved;
- visibility changed;
- export added;
- annotation added;
- framework registration added;
- generated reference added;
- reflection risk increased;
- toolchain changed;
- project graph changed;
- coverage reduced;
- authorization expired.

Approximate reproduction must never proceed.

---

## 92. Minimum baseline tests

Baseline tests should cover:

- parsing succeeds;
- compilation or interpretation succeeds;
- type checking succeeds where applicable;
- build succeeds;
- lint succeeds;
- unit tests succeed;
- integration tests succeed;
- package validation succeeds;
- framework validation succeeds where applicable;
- required dependency preparation unavailable;
- required compiler unavailable;
- required test unavailable;
- timeout;
- resource exhaustion;
- malformed result;
- cleanup failure.

---

## 93. Minimum transformation tests

Transformation tests should cover:

- exact supported symbol removal;
- zero rewrites;
- several rewrites;
- same name in another scope;
- public symbol rejection;
- exported symbol rejection;
- annotated symbol rejection;
- override-sensitive symbol rejection;
- generated source rejection;
- native-bound symbol rejection;
- unsupported syntax;
- comment preservation;
- formatting preservation;
- unauthorized import cleanup;
- unauthorized file change;
- deterministic patch;
- idempotent second application.

---

## 94. Minimum post-change tests

Post-change tests should verify:

- parsing succeeds;
- compilation or interpretation succeeds;
- type checking succeeds where applicable;
- build succeeds;
- lint succeeds;
- required tests pass;
- package validation passes;
- framework registration remains valid;
- generated artifacts remain consistent;
- no new diagnostic appears;
- changed files remain authorized;
- patch is deterministic;
- secret scan detects no synthetic canary leakage;
- cleanup completes.

---

## 95. Minimum publisher tests

Publisher tests should cover:

- exact language profile;
- wrong toolchain identity;
- wrong build-system identity;
- stale dependency-state identity;
- stale evidence digest;
- stale coverage digest;
- missing required gate;
- unexpected manifest change;
- unexpected lockfile change;
- unexpected generated-file change;
- wrong patch hash;
- default-branch rejection;
- draft pull-request creation;
- idempotent retry;
- provider partial state;
- Git-hook suppression;
- publisher inability to execute the selected toolchain.

Live provider tests require separate authorization.

---

## 96. Minimum migration tests

Migration tests should cover:

- fresh database;
- upgrade from Phase 4;
- existing TypeScript records;
- existing Python records;
- selected-language profiles;
- toolchain identities;
- project identities;
- package or module identities;
- symbol identities;
- framework evidence;
- dynamic-use records;
- partial coverage;
- multiple tenants;
- migration failure;
- retry;
- projection rebuild;
- audit preservation.

---

## 97. Minimum security tests

Security tests should cover:

- repository cannot select an arbitrary toolchain;
- host-global tools are unavailable;
- build plugins cannot access publisher credentials;
- compiler plugins cannot access controller credentials;
- dependency manager cannot reach unauthorized registries;
- registry credentials are scoped;
- Docker socket is unavailable;
- cloud metadata is unavailable;
- native code remains isolated;
- generated artifact path traversal is rejected;
- output is bounded;
- worker process limits apply;
- background daemons are terminated;
- dependency caches do not cross tenant boundaries;
- cleanup removes temporary credentials and tool state.

---

## 98. Fixture strategy

Phase 5 should use fixtures representing:

- minimal supported project;
- supported package or module layout;
- supported private symbol;
- same symbol name in several scopes;
- public symbol;
- exported symbol;
- type-system or interface consumer;
- annotation or attribute registration;
- configuration reference;
- framework registration where selected;
- generated reference;
- dynamic loading;
- unresolved reflection;
- native-boundary risk;
- broken baseline;
- malicious build plugin;
- symbolic-link escape;
- alternate repository, project, package, module, and symbol names.

Production behavior must not contain fixture-specific branches.

---

## 99. External repository tests

External selected-language repository testing requires explicit authorization.

The authorization must identify:

- canonical repository;
- immutable revision;
- permitted source access;
- permitted dependency preparation;
- permitted registry destinations;
- credential capabilities;
- permitted toolchain execution;
- permitted build and test commands;
- runner profile;
- data retention;
- cleanup;
- remediation permission;
- publication permission.

Historical access does not constitute current authorization.

The prohibited repository must never be used.

---

## 100. Detection-only acceptance criteria

Detection-only support may become `functional` only when:

1. Language selection is documented.
2. Repository qualification is deterministic.
3. Toolchain resolution is deterministic.
4. Host-global fallback is prevented.
5. Project or package identity is deterministic.
6. Symbol identity is deterministic.
7. Reference evidence preserves exact provenance.
8. Relevant configuration and framework evidence are represented.
9. Dynamic and reflective uncertainty reduce coverage.
10. Required coverage is explicit.
11. Classification is deterministic and conservative.
12. Tool failures remain explicit.
13. Generalization beyond one fixture is demonstrated.
14. Required security, migration, and phase tests pass.

---

## 101. Remediation acceptance criteria

A selected-language remediation capability may become `functional` only when:

1. The repository profile is supported.
2. The toolchain identity is current.
3. The exact symbol shape is supported.
4. Required coverage is complete.
5. No unresolved public, dynamic, framework, or native boundary exists.
6. Human disposition is current.
7. Separate remediation authorization is current.
8. Exact finding reproduction succeeds.
9. Required baseline gates pass.
10. Structured transformation is deterministic.
11. Rewrite count is exact.
12. Changed files are within authorization.
13. Required post-change gates pass.
14. Generated artifacts remain consistent.
15. Patch generation is deterministic.
16. Required runner controls pass.
17. Required migration and phase tests pass.

---

## 102. Partially supported outcome

The selected language may remain `partially_supported` when, for example:

- one language version is supported but another is not;
- one build system is supported but another is not;
- one dependency manager is supported but another is not;
- one project layout is supported but another is not;
- ordinary references are supported but reflection is not;
- one framework convention is supported but another is not;
- detection is supported but remediation is not;
- pure-language code is supported but native bindings are not;
- one operating system is supported but another required platform is not.

The exact unsupported dimensions must remain explicit.

---

## 103. Blocked outcome

Phase 5 must remain blocked when applicable:

- language selection lacks evidence;
- mandatory tool licensing is unresolved;
- mandatory tool provenance is unverified;
- required toolchain cannot be resolved safely;
- host-global contamination cannot be prevented;
- required build system is unsupported;
- dependency inputs conflict;
- project roots are ambiguous;
- package or module identity is ambiguous;
- semantic reference quality is insufficient;
- required dynamic or framework scope is unresolved;
- public or native consumer scope is unknown;
- structured transformation is unavailable;
- required baseline gate fails;
- required runner control fails;
- migration tests fail;
- tenant isolation fails;
- required tests fail or are unavailable;
- exact finding reproduction fails;
- dominant liveness evidence appears;
- authorization expires or is revoked.

A blocked result must identify the exact safe next action.

---

## 104. Scale boundary

Phase 5 establishes bounded functional support for one additional language.

The phase report must state tested limits such as:

- project count;
- package or module count;
- source-file count;
- symbol count;
- reference-edge count;
- dependency count;
- generated-artifact count;
- build duration;
- analysis duration;
- test duration;
- peak memory;
- disk and cache use;
- output size.

Phase 5 must not claim enterprise-scale validation.

Broader scale validation belongs to Phase 10.

---

## 105. Phase completion criteria

Phase 5 may be reported complete only when all applicable criteria are
satisfied:

1. Candidate languages were evaluated.
2. One language was selected through a documented decision.
3. Mandatory tool licensing is verified.
4. Mandatory tool provenance is verified.
5. Tool roles are explicit.
6. The language profile is versioned.
7. The repository profile is explicit.
8. The toolchain version range is explicit.
9. Host-global fallback is prevented.
10. Build-system support is bounded.
11. Dependency-manager support is bounded.
12. Project and package or module identities are deterministic.
13. The initial symbol shape is explicit.
14. Symbol identity is deterministic.
15. Reference evidence is implemented for the supported profile.
16. Dynamic, reflective, framework, and native uncertainty are represented.
17. Required coverage is implemented.
18. Partial coverage preserves uncertainty.
19. Classification is deterministic and conservative.
20. Human disposition remains separate.
21. Remediation authorization remains separate.
22. Exact finding reproduction includes language and toolchain identities.
23. Structured transformation is narrowly scoped when remediation is included.
24. Unauthorized repository changes are rejected.
25. Required baseline gates pass.
26. Required post-change gates pass when remediation is included.
27. Required database migrations pass.
28. Required security controls pass.
29. Required Phase 5 tests pass.
30. Triggered conditional tests pass.
31. Capability statuses are updated truthfully.
32. Security-control matrix is updated.
33. Phase report is complete.
34. Execution state is updated.
35. No unresolved blocker contradicts completion.

Detection-only completion is valid when the active authorization and test
manifest define detection-only scope.

---

## 106. Phase report

The Phase 5 completion report should include:

- authorization identity;
- objective;
- source commit before and after;
- candidate languages;
- selection criteria;
- selected language;
- rejected languages;
- tool decisions;
- license decisions;
- provenance decisions;
- files changed;
- migrations;
- dependencies;
- supported language versions;
- supported operating systems;
- supported architectures;
- build-system profile;
- dependency-manager profile;
- repository profile;
- package or module profile;
- symbol profile;
- evidence types;
- dynamic and reflection behavior;
- framework behavior;
- native-boundary behavior;
- coverage profile;
- baseline gates;
- remediation result;
- changed files;
- post-change gates;
- patch identity;
- publication result;
- security controls;
- tests;
- fixtures;
- measured scale;
- capability-status changes;
- limitations;
- blockers;
- cleanup;
- next safe action.

The report must not describe one language capability as generic polyglot support.

---

## 107. Execution-state handoff

The Phase 5 handoff should identify:

- phase status;
- authorization status;
- source commit;
- worktree state;
- selected language;
- supported language versions;
- supported repository profile;
- supported build system;
- supported dependency manager;
- supported symbol profile;
- detection-only capabilities;
- remediation-supported capabilities;
- unsupported dynamic behavior;
- tool and license decisions;
- test manifest;
- test results;
- security-control results;
- migrations;
- external operations;
- retained external state;
- cleanup state;
- next human decision.

The handoff must not authorize Phase 6.

---

## 108. Transition to Phase 6

Phase 6 may be proposed when DCAv2 has several bounded language capabilities and
the remaining evidence gap requires consumer discovery across repository
boundaries.

Before Phase 6 begins:

1. Finalize the Phase 5 report.
2. Update execution state.
3. Stop Phase 5 implementation.
4. Present actual selected-language capability statuses.
5. Record cross-repository limitations.
6. Prepare a Phase 6 authorization.
7. Obtain explicit human approval.

Phase 6 must not start automatically.

---

## 109. Phase stop conditions

Work must stop when:

- Phase 5 authorization is inactive;
- authorization expires;
- authorization is revoked;
- selection scope is exceeded;
- more than one language would be implemented without separate authorization;
- repository, project, package, or module scope is exceeded;
- a prohibited repository is encountered;
- repository identity cannot be verified;
- immutable source resolution fails;
- mandatory tool licensing is unresolved;
- mandatory tool provenance is unverified;
- required toolchain cannot be resolved safely;
- required registry access is unauthorized;
- required credential capability is unavailable;
- required build hooks cannot run safely;
- project identity is ambiguous;
- required semantic coverage cannot be established;
- required dynamic, framework, public, or native scope is unresolved;
- required runner controls fail;
- a destructive migration would be required without permission;
- a required test fails or is unavailable;
- tenant isolation fails;
- exact finding reproduction fails;
- coverage becomes incomplete;
- dominant liveness evidence appears;
- changed files exceed authorization;
- secret exposure is suspected;
- local user work cannot be preserved;
- external state becomes unknown and cannot be reconciled safely.

Stopping must be recorded truthfully.

---

## 110. Fail-safe behavior

When language selection, licensing, tool provenance, toolchain identity,
build-system behavior, dependency state, project structure, package or module
identity, semantic references, dynamic behavior, framework behavior, native
boundaries, evidence, coverage, baseline state, transformation, verification,
or publication state cannot be established confidently:

- do not select a language without evidence;
- do not add several languages under one broad claim;
- do not make an unverified tool mandatory;
- do not use host-global toolchains;
- do not guess project roots;
- do not treat failed analysis as zero references;
- do not treat unresolved dispatch as absent;
- do not treat unresolved reflection as absent;
- do not treat unsupported framework behavior as empty;
- do not treat unknown public or native consumers as absent;
- do not create human disposition automatically;
- do not infer remediation authorization;
- do not modify source;
- do not modify manifests, lockfiles, project files, configuration, or generated
  files;
- do not generate a publication-eligible patch;
- do not publish;
- preserve available evidence;
- return an explicit partial, detection-only, unsupported, failed, stale,
  configuration-required, or blocked result;
- identify the exact missing requirement.

Language uncertainty must reduce classification, remediation, and publication
authority.

---

## 111. Document integrity

This roadmap file must not be modified during Phase 5 implementation unless
roadmap or governance modification is explicitly authorized.

Changes require:

1. Identification of the Phase 5 planning problem.
2. Review against the roadmap overview.
3. Review against permanent safety invariants.
4. Review of language-selection implications.
5. Review of tool, license, provenance, and security implications.
6. Review of toolchain, build-system, and dependency implications.
7. Review of evidence, coverage, and classification implications.
8. Review of remediation and publication implications.
9. Review of authorization and testing impact.
10. Updated Phase 5 test manifest where applicable.
11. Updated schemas or capability definitions where applicable.
12. A reviewable governance commit.
13. An ADR when the change alters long-lived language, toolchain, semantic-index,
    transformation, or remediation architecture.

This roadmap must not be weakened to make unsupported language behavior,
unverified tools, unresolved licenses, incomplete coverage, failed gates,
failed tests, or unauthorized source changes appear acceptable.