# Classification Policy

This document defines how DCAv2 converts normalized evidence and coverage into
deterministic machine classifications.

Classification is a policy decision derived from evidence. It is not a human
disposition, remediation authorization, or publication authorization.

This document must be applied together with:

- `codex/core/03-safety-invariants.md`;
- `codex/core/04-accuracy-and-evidence-policy.md`;
- `codex/architecture/evidence-model.md`;
- `codex/architecture/coverage-model.md`;
- `codex/architecture/remediation-policy.md`.

---

## 1. Core principle

DCAv2 must classify conservatively.

The system must prefer an explicit non-remediable result over an unsupported
claim that code is dead.

Classification must preserve the distinction between:

- positive liveness evidence;
- absence-based evidence;
- incomplete coverage;
- analyzer failure;
- unsupported behavior;
- contradictory evidence;
- stale evidence;
- test-only usage;
- public or externally consumable code.

No classification may silently convert uncertainty into deadness.

---

## 2. Classification inputs

A classification decision must be based on explicit, versioned inputs.

Applicable inputs include:

- finding identity;
- repository identity;
- immutable source snapshot;
- exact source occurrence;
- semantic entity;
- normalized evidence items;
- evidence relationships;
- evidence mappings;
- evidence digest;
- analysis epoch;
- coverage profile;
- coverage records;
- coverage digest;
- analyzer-run statuses;
- exclusions;
- policy version;
- classification-rule version.

Hidden agent reasoning must not be an authoritative classification input.

---

## 3. Classification outputs

DCAv2 must support at least the following machine classifications:

- `candidate_dead`;
- `live_evidence_present`;
- `test_only`;
- `inconclusive`;
- `conflicting`;
- `unsupported`;
- `stale`;
- `failed`.

Additional classifications may be introduced through a versioned policy change.

A classification record must contain:

- classification ID;
- finding ID;
- classification value;
- source snapshot ID;
- evidence digest;
- coverage digest;
- coverage profile ID and version;
- classification-policy version;
- rule result;
- explanation;
- blockers;
- contradictions;
- creation time;
- superseded classification when applicable.

---

## 4. Classification is not human disposition

Machine classification and human disposition are separate records.

Examples of human dispositions include:

- `confirmed_dead`;
- `confirmed_alive`;
- `deferred`;
- `excluded`;
- `inconclusive`.

A `candidate_dead` classification does not mean that a human has confirmed the
finding.

A human disposition does not rewrite the machine classification.

When a human disagrees with the classification, the system must preserve:

- the machine result;
- the human disposition;
- the human rationale;
- the evidence state reviewed;
- the applicable timestamps.

---

## 5. Classification is not remediation authorization

No machine classification authorizes source modification.

A finding classified as `candidate_dead` still requires:

1. A valid human disposition.
2. A separate valid remediation authorization.
3. Current evidence.
4. Current coverage.
5. Successful finding reproduction.
6. Successful baseline verification.
7. A supported transformation.
8. Successful post-change verification.
9. Publication permission when an external write is requested.

The classification engine must not trigger remediation automatically.

---

## 6. Deterministic evaluation

Equivalent canonical classification inputs must produce the same result.

Classification must not depend on:

- database row order;
- analyzer execution order;
- nondeterministic map iteration;
- arbitrary evidence count;
- hidden model judgment;
- undocumented heuristics;
- the order in which repositories were discovered.

Classification rules must have explicit precedence.

The rule version must be recorded with every classification.

---

## 7. Rule evaluation order

Unless a more specific approved profile defines otherwise, classification rules
must be evaluated in this order:

1. Validate source and finding identity.
2. Validate evidence and coverage freshness.
3. Evaluate required analyzer and collection failures.
4. Evaluate unsupported capabilities.
5. Evaluate valid positive liveness evidence.
6. Evaluate contradictions.
7. Evaluate coverage completeness.
8. Evaluate test-only usage.
9. Evaluate public or externally consumable exposure.
10. Evaluate dynamic-use blockers.
11. Evaluate absence-based evidence.
12. Produce the final classification.
13. Generate the explanation and blockers.

Higher-precedence rules must not be bypassed by lower-precedence evidence.

---

## 8. Stale classification rule

A finding must be classified as `stale` when its authoritative inputs no longer
match the current identity.

Staleness triggers include:

- repository commit changed;
- file content changed;
- source occurrence changed;
- semantic entity changed;
- evidence digest changed;
- coverage digest changed;
- coverage profile changed;
- analyzer configuration changed;
- classification policy changed in a materially incompatible way;
- contract version changed;
- deployment version changed;
- runtime observation scope changed.

Stale evidence may remain available for history.

A stale classification must not support current remediation or publication.

---

## 9. Failed classification rule

A finding must be classified as `failed` when a required analysis operation
failed and no valid classification can be produced.

Examples include:

- required analyzer crashed;
- required analyzer timed out;
- analyzer output was malformed;
- required project configuration failed to load;
- dependency installation failed;
- required compiler was unavailable;
- resource limits were exceeded;
- evidence normalization failed;
- coverage aggregation failed.

A failed analyzer must not be represented as zero references.

A `failed` classification must identify the failing operation and affected
scope.

---

## 10. Unsupported classification rule

A finding must be classified as `unsupported` when DCAv2 lacks the capability
required to interpret the relevant source or usage model safely.

Examples include:

- unsupported language;
- unsupported syntax;
- unsupported symbol shape;
- unsupported framework convention;
- unsupported package-manager structure;
- unsupported contract protocol;
- unsupported infrastructure source;
- unsupported dynamic behavior;
- unsupported transformation precondition when classification depends on it.

Unsupported behavior must remain distinct from failure.

A capability that was never implemented is unsupported.

A capability that should work but crashed is failed.

---

## 11. Positive liveness rule

Valid positive liveness evidence must produce
`live_evidence_present` unless the evidence is stale, invalid, or mapped to a
different identity.

Examples include:

- exact semantic production reference;
- valid cross-package reference;
- valid cross-repository reference;
- package consumer;
- framework registration;
- dependency-injection binding;
- contract binding;
- infrastructure binding;
- deployment binding;
- positive runtime execution;
- configured entry point;
- known external consumer.

One exact positive liveness observation may be sufficient to block dead-code
remediation.

Additional absence evidence must not override valid positive liveness evidence.

---

## 12. Positive evidence validation

Before positive evidence affects classification, validate:

- source identity;
- evidence provenance;
- evidence freshness;
- applicable scope;
- mapping accuracy;
- correlation;
- interpretation rule;
- whether the evidence refers to production, test, or unknown scope.

Evidence mapped ambiguously to several possible symbols must not be represented
as an exact reference.

Ambiguous positive evidence may still block remediation for the affected
enclosing scope.

---

## 13. Contradiction rule

A finding must be classified as `conflicting` when valid evidence makes
incompatible claims and no approved dominance rule resolves the conflict.

Examples include:

- one source reports a valid production reference while another reports that
  the same reference cannot exist;
- runtime evidence maps to the symbol while source-version identity conflicts;
- a framework adapter reports registration while project configuration reports
  the registration is inactive;
- two authoritative contract sources disagree about the consumer relationship.

A contradiction must not be resolved by:

- counting tools;
- choosing the newest row without policy;
- selecting the result that creates more findings;
- using a numeric average;
- ignoring inconvenient evidence.

The classification explanation must identify every material contradiction.

---

## 14. Dominance rules

A dominance rule may resolve specific evidence conflicts when its behavior is
explicit, safe, and versioned.

Default dominance principles include:

1. Current evidence dominates stale evidence.
2. Exact source identity dominates approximate name matching.
3. Exact semantic production references dominate absence-only evidence.
4. Exact runtime execution for the matching version dominates runtime absence.
5. Valid positive contract or framework bindings dominate local reference
   absence.
6. Analyzer failure blocks conclusions that require that analyzer.
7. Policy exclusion does not become successful coverage.
8. Human disposition does not rewrite machine-observed facts.

A new dominance rule requires tests for positive, negative, contradictory, and
stale cases.

---

## 15. Inconclusive classification rule

A finding must be classified as `inconclusive` when the system cannot defend
either a liveness or candidate-dead conclusion.

Examples include:

- required coverage is partial;
- a relevant repository is unavailable;
- external consumers are unknown;
- dynamic behavior was detected but not resolved;
- framework registration may exist but could not be evaluated;
- required runtime observation is incomplete;
- evidence mapping is ambiguous;
- relevant deployed versions are unknown;
- a policy exclusion creates a material blind spot;
- the source shape is understood but the usage universe is incomplete.

`Inconclusive` is a valid product outcome.

It must not be treated as an error merely because it cannot proceed to
remediation.

---

## 16. Coverage requirement

A `candidate_dead` classification requires the applicable coverage profile to
be satisfied.

At minimum:

- every required coverage dimension is `complete`;
- every applicable conditional dimension was evaluated;
- no required analyzer failed;
- no required source is unavailable;
- no required scope is unsupported;
- no required scope is stale;
- no material scope remains unknown;
- exclusions are permitted by the profile;
- the coverage digest is current.

Partial success must not be rounded up to complete coverage.

---

## 17. Test-only classification rule

A finding may be classified as `test_only` when:

- at least one valid reference exists;
- every valid discovered reference is within recognized test scope;
- production reference coverage is complete;
- unknown-scope references do not remain;
- dynamic production registration is not unresolved;
- public or external exposure does not create an unresolved consumer scope.

Test-only usage is not equivalent to no usage.

A separate policy must determine whether test-only code may be remediated.

The default interpretation must be non-remediable until explicitly supported.

---

## 18. Test-scope identification

Test scope must be established through structured repository qualification.

Possible test scopes include:

- unit tests;
- integration tests;
- test fixtures;
- benchmarks;
- examples;
- development-only tools;
- test support packages.

A path containing the word `test` is not automatically sufficient proof of test
scope.

Unknown or mixed-use scope must remain unknown.

---

## 19. Public API rule

Public or externally consumable code must not be classified as
`candidate_dead` based only on internal reference absence.

Relevant exposure includes:

- published package exports;
- documented public functions;
- SDK surfaces;
- plugin interfaces;
- extension points;
- externally callable routes;
- generated client surfaces;
- public contracts.

A public-API coverage profile must establish a bounded consumer universe or an
approved deprecation process.

When the consumer universe is unknown, classify as `inconclusive` or
`live_evidence_present` when positive evidence exists.

---

## 20. Internal export rule

An internal export is not automatically a public API.

Classification must distinguish:

- file-local symbol;
- package-private symbol;
- workspace export;
- repository export;
- organization-internal package export;
- publicly published export;
- unknown export scope.

Each category may have a different coverage profile.

Export status alone does not prove liveness or deadness.

---

## 21. Dynamic behavior rule

Detected unresolved dynamic behavior must block `candidate_dead`.

Relevant indicators include:

- reflection;
- dynamic imports;
- computed property access;
- string-based dispatch;
- decorators;
- annotations;
- dependency injection;
- plugin loading;
- monkey patching;
- convention-based entry points;
- runtime code generation;
- externally supplied configuration.

When DCAv2 can resolve the dynamic behavior through supported evidence, the
result may proceed under the applicable coverage profile.

When it cannot, classify as `unsupported` or `inconclusive` depending on whether
the capability is absent or the available evidence is incomplete.

---

## 22. Framework rule

Framework-specific behavior must be evaluated when qualification detects a
supported framework.

Examples include:

- route registration;
- controller registration;
- dependency-injection binding;
- decorator registration;
- plugin discovery;
- scheduler registration;
- command registration;
- serialization hooks;
- event-handler registration.

Framework support must be reported per convention.

Support for one convention must not imply complete support for the framework.

Unresolved required framework coverage blocks `candidate_dead`.

---

## 23. Monorepo rule

A package-local result must not become `candidate_dead` when relevant workspace
coverage is incomplete.

The classification must consider applicable:

- workspace dependencies;
- path aliases;
- package exports;
- project references;
- cross-package imports;
- generated consumers;
- package-specific build targets;
- package-specific test targets.

A valid reference from another workspace produces `live_evidence_present`.

A failed or unavailable relevant workspace produces `inconclusive` or `failed`
according to the failure type.

---

## 24. Cross-repository rule

Cross-repository classification must bind to a defined analysis epoch.

A finding may proceed toward `candidate_dead` only when the applicable
cross-repository profile confirms:

- required repositories were included;
- immutable commits were recorded;
- required package consumers were evaluated;
- relevant registry versions were evaluated;
- unavailable repositories were handled according to policy;
- no valid external liveness evidence exists.

Zero cross-repository references is meaningful only within the recorded epoch.

It must not be described as universal absence.

---

## 25. Package-version rule

Classification must be version-aware.

A symbol may remain live because:

- an older package version is supported;
- an older artifact is deployed;
- consumers use a Git revision;
- generated clients target an earlier contract;
- a compatibility window remains active.

The latest default-branch source must not be treated as the only relevant
version when known consumers or deployments use another version.

Unknown version skew blocks conclusive deadness when relevant.

---

## 26. Contract rule

A handler, route, operation, or message endpoint may be live through a contract
without a direct local caller.

Applicable contract evidence may include:

- REST or OpenAPI;
- GraphQL;
- Protobuf or gRPC;
- message schemas;
- webhooks;
- scheduler definitions;
- generated clients.

Valid producer, consumer, or generated-client bindings may produce
`live_evidence_present`.

Unavailable or unsupported required contract coverage produces
`inconclusive`, `unsupported`, or `failed`.

---

## 27. Infrastructure rule

Infrastructure may establish liveness through:

- deployment configuration;
- container entry points;
- scheduled jobs;
- gateway routes;
- service-mesh routes;
- CI/CD invocation;
- infrastructure references.

Valid current infrastructure bindings may produce
`live_evidence_present`.

Unresolved templates, stale manifests, or unavailable environments must retain
their uncertainty.

Infrastructure absence alone does not prove deadness.

---

## 28. Runtime rule

Positive runtime evidence for the matching source or deployed version produces
`live_evidence_present`.

Runtime absence may support candidate absence only when the applicable profile
confirms:

- correct environment;
- correct deployment;
- correct version;
- relevant instrumentation;
- sufficient observation duration;
- understood sampling;
- sufficient collection completeness;
- consideration of low-frequency execution.

Runtime absence must not override valid static, contract, framework, or
infrastructure liveness evidence.

---

## 29. Candidate-dead rule

A finding may be classified as `candidate_dead` only when all applicable
conditions are satisfied:

- source identity is current;
- evidence is current;
- coverage is current;
- required coverage is complete;
- required analyzers succeeded;
- no required capability is unsupported;
- no material scope is unavailable;
- no unresolved positive liveness evidence exists;
- no unresolved contradiction exists;
- no unresolved dynamic-use indicator exists;
- public exposure requirements are satisfied;
- absence-based evidence satisfies the applicable profile;
- the classification rule is deterministic and explainable.

`Candidate_dead` means only that the finding is eligible for human review.

It does not mean the code is conclusively dead.

---

## 30. Absence-evidence rule

Absence-based evidence must identify:

- searched scope;
- analyzer or query;
- analyzer status;
- source snapshot;
- exclusions;
- failures;
- coverage profile;
- coverage digest;
- observation period when applicable.

An absence observation must not support `candidate_dead` when:

- the analyzer failed;
- the scope was incomplete;
- a required repository was unavailable;
- relevant dynamic behavior was unresolved;
- the source or evidence is stale;
- the consumer universe is unknown;
- positive liveness evidence exists.

---

## 31. Evidence correlation rule

Correlated evidence must not be counted as independent confirmation.

Examples include:

- multiple items from one semantic index;
- repeated runs of the same analyzer;
- several tools consuming the same project graph;
- textual and syntax results derived from the same source traversal.

Classification may use correlated evidence for explanation.

It must not increase authoritative certainty merely because the same underlying
fact appears several times.

---

## 32. Numeric score rule

Numeric scores may be used for:

- prioritization;
- triage;
- review ordering;
- calibration studies;
- operational analytics.

Numeric scores must not:

- determine `candidate_dead`;
- override liveness evidence;
- satisfy missing coverage;
- resolve contradiction;
- convert unsupported behavior into support;
- authorize remediation;
- authorize publication.

The authoritative classification must remain rule-based and explainable.

---

## 33. Classification blockers

A classification blocker is a machine-readable reason that prevents
`candidate_dead`.

Blockers may include:

- `source_identity_stale`;
- `evidence_stale`;
- `coverage_stale`;
- `required_analyzer_failed`;
- `required_scope_unavailable`;
- `required_scope_unsupported`;
- `coverage_partial`;
- `positive_liveness_present`;
- `contradictory_evidence`;
- `dynamic_behavior_unresolved`;
- `public_consumer_scope_unknown`;
- `framework_coverage_incomplete`;
- `contract_coverage_incomplete`;
- `runtime_coverage_insufficient`;
- `version_skew_unresolved`;
- `mapping_ambiguous`.

A finding may have multiple blockers.

Blockers must remain visible even when another rule determines the final
classification.

---

## 34. Classification explanation

Every classification must produce a human-readable explanation containing:

- final classification;
- rule that produced it;
- source snapshot;
- evidence digest;
- coverage profile;
- coverage digest;
- positive liveness evidence;
- absence-based evidence;
- failures;
- unsupported scopes;
- exclusions;
- contradictions;
- blockers;
- freshness;
- known limitations;
- additional evidence that could change the result.

The explanation must distinguish facts from policy interpretations.

It must not imply certainty beyond the evidence.

---

## 35. Classification record immutability

A finalized classification record must not be rewritten in place to reflect
newer evidence or policy.

When inputs change:

1. Preserve the historical classification.
2. Mark it superseded or stale through a new record.
3. Create a new classification.
4. Link the new record to the prior record.
5. preserve the original evidence and coverage digests;
6. record the reason for reclassification.

Historical classifications must remain auditable.

---

## 36. Policy versioning

Every classification must identify the exact classification-policy version.

A policy change must state whether it is:

- backward-compatible;
- interpretation-changing;
- classification-changing;
- remediation-eligibility-changing.

Material policy changes may require reclassification of existing findings.

Prior results must not be silently relabeled.

---

## 37. Reclassification triggers

Reclassification should occur when applicable:

- source commit changes;
- evidence changes;
- coverage changes;
- analyzer failures are resolved;
- a new repository becomes available;
- a new consumer is discovered;
- a contract changes;
- a deployment changes;
- runtime evidence changes materially;
- a human supplies new attributable evidence;
- classification policy changes.

Human disposition alone does not require rewriting the machine classification,
but new human-supplied evidence may trigger reclassification.

---

## 38. Finding identity

A classification must bind to a finding representing an exact source
occurrence.

Finding identity should include:

- repository;
- immutable source snapshot;
- source document;
- source occurrence;
- semantic entity;
- finding type;
- analyzer or discovery provenance.

A symbol name alone is insufficient finding identity.

When the exact occurrence no longer exists, the prior finding becomes stale.

---

## 39. Duplicate findings

Multiple analyzers may identify the same source occurrence.

DCAv2 should correlate duplicate candidates into one finding when identity can
be established safely.

Deduplication must preserve:

- all contributing analyzers;
- all evidence items;
- differing scopes;
- disagreements;
- provenance;
- correlation groups.

Findings from different source snapshots or ambiguous occurrences must not be
merged.

---

## 40. Human-supplied evidence

A reviewer may provide evidence unavailable to automated analysis.

Human-supplied evidence must record:

- reviewer identity;
- evidence statement;
- affected finding;
- source snapshot;
- scope;
- rationale;
- timestamp;
- supporting reference when applicable.

Human evidence remains attributable.

It must not be represented as analyzer-observed evidence.

A human statement may affect disposition and may trigger reclassification when
it provides a valid factual input.

---

## 41. Remediation eligibility projection

The classification engine may report whether the machine result is compatible
with later remediation review.

Possible values include:

- `eligible_for_human_review`;
- `not_eligible_positive_liveness`;
- `not_eligible_incomplete_coverage`;
- `not_eligible_conflicting`;
- `not_eligible_unsupported`;
- `not_eligible_stale`;
- `not_eligible_failed`;
- `not_eligible_policy_blocked`.

This projection does not authorize remediation.

Only `candidate_dead` should normally be eligible for dead-code confirmation
review.

---

## 42. Classification API behavior

Any API or CLI exposing classification must return structured fields rather
than only a score or label.

Applicable fields include:

- classification;
- classification-policy version;
- evidence digest;
- coverage digest;
- coverage profile;
- blockers;
- positive evidence count by type;
- failure count by type;
- contradiction count;
- freshness;
- explanation;
- remediation-review compatibility.

The interface must not represent `inconclusive` as an error unless the caller
explicitly requests only conclusive results.

---

## 43. Capability boundaries

Classification support must be reported per profile and finding type.

A classification enum or generic policy engine does not prove that DCAv2 can
classify every language or repository.

Capability reporting must distinguish:

- evidence types supported;
- coverage profile implemented;
- rule implementation;
- explanation implementation;
- fixture validation;
- production readiness;
- scale validation.

Unsupported profiles must return `unsupported` rather than falling back to an
unsafe generic rule.

---

## 44. Testing requirements

Classification tests must include:

- exact production liveness;
- exact runtime liveness;
- framework registration;
- contract binding;
- test-only usage;
- complete candidate absence;
- partial coverage;
- analyzer failure;
- analyzer timeout;
- unsupported language;
- unsupported dynamic behavior;
- unresolved reflection;
- public API with unknown consumers;
- monorepo workspace failure;
- cross-repository consumer;
- unavailable repository;
- prohibited repository exclusion;
- contradictory evidence;
- stale source;
- stale evidence;
- stale coverage;
- version skew;
- deterministic ordering;
- correlated evidence;
- duplicate finding correlation;
- policy-version change;
- explanation generation.

Tests must verify that:

- positive liveness overrides absence;
- incomplete coverage cannot produce `candidate_dead`;
- analyzer failure cannot become zero references;
- numeric score cannot authorize classification;
- stale evidence cannot support remediation;
- equivalent canonical inputs produce identical results.

---

## 45. Property-based and invariant testing

Where practical, property-based tests should verify invariants such as:

- adding valid liveness evidence cannot change a finding from
  `live_evidence_present` to `candidate_dead`;
- removing required coverage cannot improve remediation eligibility;
- changing input order cannot change the classification;
- stale inputs cannot produce a current remediation-compatible result;
- adding an unresolved contradiction cannot produce `candidate_dead`;
- analyzer failure cannot increase certainty;
- evidence from another tenant cannot affect the result.

Invariant tests should remain independent of one fixture repository.

---

## 46. Migration requirements

Classification-model changes must use additive, ordered migrations.

Migration planning must consider:

- historical classifications;
- policy versions;
- evidence digests;
- coverage digests;
- blockers;
- explanations;
- human dispositions;
- remediation authorizations;
- supersession relationships;
- tenant isolation.

Historical classifications must not be rewritten to match new policy.

---

## 47. Reporting requirements

Phase reports involving classification must identify:

- profiles implemented;
- rule versions;
- classifications supported;
- blockers supported;
- contradiction behavior;
- freshness behavior;
- fixtures executed;
- negative tests;
- unsupported areas;
- scale limitations.

A successful narrow private-function fixture must not be reported as universal
TypeScript dead-code classification.

---

## 48. Fail-safe behavior

When classification cannot be completed confidently:

- do not return `candidate_dead`;
- preserve normalized evidence;
- preserve coverage records;
- record failures;
- record unsupported behavior;
- record contradictions;
- return `inconclusive`, `conflicting`, `unsupported`, `stale`, or `failed`;
- explain what prevented a conclusive result.

Classification uncertainty must reduce remediation eligibility.

---

## 49. Policy integrity

This document must not be modified during implementation unless architecture or
governance modification is explicitly authorized.

Changes require:

1. Identification of the classification problem.
2. Review against the accuracy and evidence policy.
3. Review of evidence and coverage impacts.
4. Review of remediation eligibility impacts.
5. Migration planning.
6. Updated fixtures.
7. Updated invariant tests.
8. Updated schemas.
9. A reviewable architecture commit.
10. An ADR when the change alters long-lived classification precedence,
    dominance, blocker, or freshness semantics.

The policy must not be weakened to increase finding counts, conceal uncertainty,
or make remediation easier.