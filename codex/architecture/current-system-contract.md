# Current System Contract

This document defines how the existing DCAv2 implementation must be treated while the product evolves.

DCAv2 is an existing working codebase. It must be inspected, tested, preserved, and improved incrementally rather than replaced based only on roadmap expectations.

This contract distinguishes:

- behavior verified in the current implementation;
- behavior required by permanent governance;
- planned behavior that has not yet been implemented;
- defects and limitations requiring later authorized work.

This document does not authorize implementation or declare that every intended capability already exists.

---

## 1. Core preservation principle

The existing DCAv2 repository is the starting implementation.

Authorized work must evolve it incrementally.

Codex must not rewrite the system from scratch unless the human operator explicitly authorizes a rewrite after reviewing:

- current capabilities;
- migration cost;
- operational risk;
- data compatibility;
- test coverage;
- security implications;
- alternative incremental approaches.

A cleaner theoretical design is not sufficient justification for discarding working behavior.

---

## 2. Current behavior must be verified

Claims about the current system must be supported by evidence from:

- source inspection;
- configuration inspection;
- database migrations;
- tests;
- executable commands;
- observed runtime behavior;
- existing reports;
- Git history when relevant.

Documentation alone is insufficient when it conflicts with executable behavior.

When code, tests, and documentation disagree:

1. Record the disagreement.
2. Identify which behavior is actually executable.
3. Apply permanent governance and safety requirements.
4. Avoid silently redefining the current system.
5. Resolve the conflict only within an authorized phase.

---

## 3. Phase 0 reconciliation requirement

Before substantial feature expansion, DCAv2 must undergo a reconciliation phase.

The reconciliation must establish:

- repository structure;
- supported applications and packages;
- entry points;
- command surfaces;
- database model;
- migrations;
- current analyzer adapters;
- current evidence flow;
- current classification behavior;
- current review behavior;
- current remediation behavior;
- current runner behavior;
- current publication behavior;
- existing tests;
- existing fixtures;
- external integrations;
- known defects;
- undocumented behavior;
- security gaps;
- incomplete or placeholder implementations.

The reconciliation report becomes the evidence-backed description of the actual starting state.

The roadmap does not replace this inspection.

---

## 4. Existing capabilities

A capability may be recorded as currently implemented only when its behavior is demonstrated through source and appropriate tests or reproducible execution.

Possible capability statuses are:

- `verified`;
- `partially_verified`;
- `present_but_untested`;
- `placeholder`;
- `broken`;
- `unsupported`;
- `unknown`.

An interface, route, table, type, or configuration entry does not prove that the complete capability works.

A fixture-specific success does not prove general support.

---

## 5. Existing defects

A defect discovered in the current implementation must be recorded separately from planned capability work.

For each defect, record:

- component;
- observed behavior;
- expected behavior;
- reproduction command;
- environment;
- failure output summary;
- security or correctness impact;
- affected acceptance criteria;
- proposed phase;
- regression-test requirement.

A current defect must not be reclassified as a future enhancement merely to avoid fixing it.

A defect may be repaired only within an authorization that permits the relevant work.

---

## 6. Known runner defect

A previously observed TypeScript remediation attempt failed inside the isolated execution environment because the `tsc` executable was unavailable, despite TypeScript being declared as a development dependency in the target fixture.

This observation must be treated as a defect report, not as a completed root-cause analysis.

Possible causes may include:

- dependency installation failure;
- incorrect workspace mounting;
- incorrect working directory;
- missing package-manager execution path;
- environment-variable configuration;
- runner image configuration;
- command-construction behavior.

The root cause must be established through reproducible evidence during an authorized phase.

The defect must not be bypassed by:

- running repository-controlled commands directly on the trusted host;
- using an undeclared global compiler;
- skipping the TypeScript gate;
- reporting the unavailable gate as passed;
- weakening runner isolation.

---

## 7. Existing tests are preservation evidence

Existing tests represent important behavioral evidence.

Authorized changes must preserve passing tests unless:

- a test is demonstrably incorrect;
- the intended behavior is explicitly changed;
- the change is authorized;
- the replacement expectation is documented;
- equivalent or stronger tests are added.

Codex must not delete, skip, or weaken tests merely because they block a change.

Test names and assertions must be interpreted together with implementation behavior and governance requirements.

---

## 8. Missing tests do not imply missing requirements

The absence of a test does not remove a requirement established by:

- permanent safety invariants;
- the product contract;
- the accuracy and evidence policy;
- access policies;
- the current authorized phase.

When existing behavior is security-sensitive but untested, the authorized phase should add characterization or regression coverage before changing it.

---

## 9. Characterization before refactoring

Before materially refactoring an insufficiently understood component, Codex should create characterization tests for relevant existing behavior.

Characterization tests should capture:

- accepted inputs;
- outputs;
- state changes;
- failures;
- side effects;
- authorization checks;
- security boundaries;
- audit records;
- retry behavior;
- cleanup behavior.

Characterization tests must not preserve behavior that violates permanent safety invariants.

Unsafe behavior must instead be documented and corrected through an authorized change.

---

## 10. Data compatibility

Existing persisted data must be preserved unless an explicitly authorized migration states otherwise.

Changes to persisted models must consider:

- existing databases;
- migration ordering;
- legacy rows;
- nullable historical fields;
- tenant scoping;
- evidence provenance;
- audit history;
- authorization history;
- backward compatibility;
- recovery behavior.

Existing migrations must not be rewritten merely to match a new preferred schema.

Schema evolution must use additive, ordered migrations unless destructive migration is separately authorized.

---

## 11. API and command compatibility

Existing API routes, CLI commands, configuration keys, and machine-readable outputs must be inventoried before they are changed.

For each externally observable interface, determine:

- whether it is implemented;
- whether it is used;
- whether it is documented;
- whether it is tested;
- whether compatibility is required;
- whether deprecation is needed;
- whether callers are known.

Breaking changes require explicit authorization and migration planning.

Internal cleanup must not silently break an existing supported interface.

---

## 12. Current architecture versus intended architecture

The current implementation may differ from the intended architecture.

The reconciliation process must distinguish:

- implemented architecture;
- partially implemented architecture;
- intended architecture;
- deprecated architecture;
- speculative documentation.

Roadmap documents describe intended evolution.

They must not be cited as proof that a component already exists or is operational.

Architecture documentation must be updated to reflect verified behavior after authorized implementation changes.

---

## 13. Control-plane evolution

DCAv2 should evolve toward a modular control plane while preserving working behavior.

The preferred default is an incrementally improved modular monolith backed by PostgreSQL.

This preference does not prove that the current implementation already satisfies that architecture.

Do not introduce distributed services, brokers, graph databases, or additional infrastructure unless measured requirements justify them and the current phase authorizes them.

---

## 14. Trust-boundary reconciliation

The current implementation must be inspected to determine where code executes and where credentials are available.

The reconciliation must identify:

- trusted controller processes;
- repository-controlled execution;
- container or sandbox boundaries;
- database access;
- provider credentials;
- publication credentials;
- environment propagation;
- filesystem mounts;
- network access;
- Docker socket access;
- host tool usage.

Any mismatch with the permanent trust-boundary requirements must be recorded as:

- enforced;
- partially enforced;
- missing;
- unverified;
- not applicable.

Configured isolation must not be reported as enforced without testing.

---

## 15. Evidence-flow reconciliation

The existing evidence pipeline must be traced from collection to classification.

The reconciliation should determine:

- which analyzers run;
- how analyzer output is parsed;
- how failures are represented;
- how evidence identity is stored;
- how source snapshots are bound;
- how coverage is represented;
- how contradictions are handled;
- how findings are classified;
- how explanations are generated;
- how evidence becomes stale;
- how human review is stored.

Analyzer output must not be treated as authoritative merely because the current implementation does so.

Current unsafe behavior must be documented and corrected incrementally.

---

## 16. Remediation-flow reconciliation

The existing remediation path must be traced end to end.

The reconciliation should determine whether the system currently enforces:

- immutable source identity;
- finding reproduction;
- separate human disposition;
- separate remediation authorization;
- baseline gates;
- deterministic transformation;
- expected rewrite count;
- changed-file allowlist;
- post-change gates;
- patch hashing;
- stale-approval rejection;
- trusted publication;
- draft-only pull requests;
- idempotency;
- cleanup.

Missing controls must be recorded explicitly.

Their absence must not be concealed through documentation that describes only intended behavior.

---

## 17. External integration reconciliation

Every configured external integration must be classified as:

- verified operational;
- configured but unverified;
- partially operational;
- unavailable;
- obsolete;
- placeholder;
- unsupported.

Relevant integrations may include:

- GitHub;
- package registries;
- container registries;
- databases;
- telemetry systems;
- hosted analyzers;
- CI/CD services.

Credential availability must be reported only as a redacted capability status.

The existence of configuration does not authorize use.

---

## 18. Fixture integrity

Existing fixtures must be reviewed for accidental hardcoding.

A fixture must not be the hidden basis for general product behavior.

Inspect for logic that depends on:

- a particular repository name;
- a particular function name;
- a particular commit;
- a particular file path;
- a fixed expected finding;
- fixture-only bypasses;
- special-case publication behavior;
- disabled safety checks.

Fixtures may intentionally represent narrow scenarios, but production code must not contain undisclosed fixture-specific exceptions.

---

## 19. Current support claims

Current support claims must be limited to verified capability dimensions.

For example, TypeScript support must be divided into applicable capabilities such as:

- repository qualification;
- package discovery;
- symbol inventory;
- semantic references;
- candidate classification;
- finding reproduction;
- transformation;
- baseline verification;
- post-change verification;
- publication.

A successful analyzer invocation does not prove safe remediation support.

A successful local transformation does not prove trusted publication support.

---

## 20. Preservation exceptions

Existing behavior does not need to be preserved when it:

- violates a permanent safety invariant;
- exposes secrets;
- performs an excluded repository target operation;
- runs untrusted code on a trusted host;
- permits direct default-branch pushes;
- permits automatic merge;
- rewrites audit history;
- converts failures into successful empty results;
- discards user work;
- fabricates evidence or test results.

Such behavior must be documented as unsafe and corrected through an authorized phase.

The correction should preserve unrelated working behavior.

---

## 21. Incremental change requirements

An authorized implementation change should:

1. Identify the current behavior.
2. Add or identify tests covering that behavior.
3. Define the required new behavior.
4. Make the smallest coherent change.
5. Preserve unrelated functionality.
6. Add regression tests.
7. Run the relevant phase test manifest.
8. Record migrations and compatibility impact.
9. Update architecture documentation to match actual behavior.
10. Report remaining limitations.

Large rewrites should be decomposed into reviewable steps.

---

## 22. No speculative completion

DCAv2 must not claim that reconciliation or preservation is complete based only on:

- reading top-level documentation;
- inspecting a few entry points;
- running one test command;
- observing one successful fixture;
- confirming that containers start;
- confirming that database tables exist;
- finding interfaces for planned components.

Completion requires the acceptance criteria defined by the authorized reconciliation phase.

Unknown areas must remain explicitly unknown.

---

## 23. Reconciliation outputs

The current-system reconciliation should produce:

- component inventory;
- package and application inventory;
- command inventory;
- API and CLI inventory;
- database and migration inventory;
- analyzer inventory;
- evidence-flow description;
- classification-flow description;
- remediation-flow description;
- trust-boundary assessment;
- external-integration inventory;
- test inventory;
- fixture inventory;
- defect register;
- capability matrix;
- security-control matrix;
- known limitations;
- recommended next-phase scope.

These outputs describe the current state.

They do not authorize implementation of the recommendations.

---

## 24. Contract maintenance

This document must be updated when verified current behavior materially changes.

Updates must distinguish:

- behavior that was previously verified;
- behavior changed by the authorized phase;
- new tests proving the change;
- remaining unverified behavior.

Historical reports should remain available for audit.

This contract must not be modified to imply that planned or incomplete behavior is already implemented.

---

## 25. Fail-safe interpretation

When current behavior cannot be determined confidently:

- mark it as unknown or unverified;
- do not remove the component;
- do not declare it obsolete;
- do not claim compatibility;
- do not claim support;
- do not weaken safety controls;
- preserve the current state;
- identify the evidence needed to resolve the uncertainty.

Uncertainty about the existing system must result in investigation, not invention.
