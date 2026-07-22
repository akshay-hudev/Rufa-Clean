# Architecture Decision Record Policy

This document defines when DCAv2 must create an Architecture Decision Record,
how decisions must be documented, and how superseded decisions must be
preserved.

An Architecture Decision Record, or ADR, records a significant engineering
decision and its current rationale.

An ADR does not authorize implementation, repository access, credential use,
external operations, remediation, publication, or destructive work.

This document must be applied together with:

- `codex/core/01-instruction-precedence.md`;
- `codex/core/05-phase-authorization-protocol.md`;
- `codex/core/10-reporting-and-state-policy.md`;
- `codex/architecture/current-system-contract.md`;
- `codex/architecture/capability-definitions.md`;
- `codex/engineering/reuse-first-policy.md`;
- `codex/engineering/tooling-and-license-policy.md`;
- `codex/templates/adr-template.md`.

---

## 1. Core principles

ADRs must be:

- factual;
- attributable;
- narrowly scoped;
- evidence-backed;
- reviewable;
- immutable after acceptance except for administrative metadata;
- explicit about uncertainty;
- explicit about alternatives;
- explicit about consequences;
- free of invented historical rationale;
- separate from execution authorization.

An ADR must describe the decision that is being made now.

It must not fabricate prior discussions, approvals, incidents, benchmarks, or
rejected alternatives.

---

## 2. Purpose of an ADR

An ADR should explain:

- the problem requiring a decision;
- the context in which the decision applies;
- the decision that was selected;
- the alternatives genuinely evaluated;
- the evidence supporting the decision;
- the consequences and limitations;
- the migration or rollout implications;
- the conditions that could cause reconsideration.

An ADR should make it possible for a future engineer to understand why the
current architecture exists without relying on undocumented conversation or
private reasoning.

---

## 3. What an ADR does not do

An ADR does not:

- grant phase authorization;
- grant repository access;
- approve a dependency installation;
- approve use of credentials;
- approve remediation;
- approve publication;
- override permanent safety invariants;
- override the prohibited-repository policy;
- prove that implementation is complete;
- prove that tests passed;
- prove that a capability is functional;
- create current execution state.

Implementation authority must come from the current phase authorization.

Operational truth must come from source, tests, reports, and reproducible
evidence.

---

## 4. When an ADR is required

An ADR is required when a decision materially affects one or more of the
following:

- long-lived architecture;
- trust boundaries;
- credential flow;
- tenant isolation;
- source acquisition;
- untrusted execution;
- trusted publication;
- evidence identity;
- coverage semantics;
- classification precedence;
- remediation eligibility;
- patch identity;
- audit integrity;
- database architecture;
- migration strategy;
- provider abstraction;
- hosted services;
- external data transmission;
- core tool adoption;
- authoritative interchange formats;
- infrastructure systems;
- compatibility guarantees;
- long-term operational ownership.

Examples include:

- selecting PostgreSQL as the primary control-plane database;
- introducing a trusted publisher boundary;
- choosing SCIP as an authoritative semantic-index interchange format;
- adopting a hosted analysis service;
- adding a message broker;
- changing evidence-digest semantics;
- changing classification precedence;
- introducing a graph database;
- changing tenant-isolation architecture;
- replacing the runner isolation mechanism;
- adopting a core transformation engine.

---

## 5. When an ADR may not be required

An ADR may be unnecessary for narrowly scoped implementation choices that do not
materially change architecture or long-lived behavior.

Examples may include:

- renaming an internal variable;
- adding a small private helper;
- fixing a local defect without changing the contract;
- adding a test fixture;
- updating documentation to match verified behavior;
- applying an already approved dependency patch release;
- adding an index under an existing database strategy;
- implementing an existing accepted ADR.

The absence of an ADR does not remove the requirement for authorization,
testing, reporting, or review.

When uncertain whether a decision is architecture-significant, prefer creating
a concise ADR or explicitly record why one is unnecessary.

---

## 6. ADR decision threshold

Before creating an ADR, determine whether the decision is:

- durable;
- difficult to reverse;
- expensive to migrate;
- security-sensitive;
- cross-cutting;
- externally observable;
- likely to affect multiple phases;
- likely to constrain future implementation;
- likely to require future engineers to understand its rationale.

A decision satisfying any of these conditions should normally receive an ADR.

---

## 7. ADR status model

Every ADR must use one status:

- `proposed`;
- `accepted`;
- `rejected`;
- `superseded`;
- `deprecated`;
- `withdrawn`.

### `proposed`

The decision is under review and has not been accepted.

A proposed ADR does not authorize implementation.

### `accepted`

The decision has been approved through the applicable review process.

Acceptance does not itself authorize implementation.

### `rejected`

The proposed decision was considered and not selected.

A rejected ADR must preserve the factual rationale available at the time.

### `superseded`

A newer accepted ADR replaces the decision.

The superseding ADR must be identified.

### `deprecated`

The decision remains relevant to existing behavior but should not be used for
new implementation.

### `withdrawn`

The proposal was withdrawn before acceptance.

The reason should be recorded when known.

---

## 8. ADR lifecycle

A typical ADR lifecycle is:

```text
Draft
  ↓
Proposed
  ↓
Reviewed
  ↓
Accepted or Rejected
  ↓
Implemented separately when authorized
  ↓
Superseded or Deprecated when architecture changes
```

Implementation status must not be encoded by changing the ADR decision status.

A separate field or linked report may describe whether implementation is:

- not started;
- partial;
- complete;
- broken;
- replaced.

---

## 9. ADR identity

Each ADR must have a stable identifier.

Recommended filename format:

```text
NNNN-short-decision-title.md
```

Examples:

- `0001-use-postgresql-for-control-plane-storage.md`
- `0002-separate-trusted-publisher-from-untrusted-runner.md`
- `0003-use-scip-for-semantic-index-interchange.md`

The number must not be reused after an ADR is rejected, withdrawn, or removed.

The filename may remain unchanged when the title is refined, provided the
decision identity is unchanged.

---

## 10. ADR location

ADRs should be stored in a dedicated directory such as:

`codex/decisions/`

The directory may be introduced when the first ADR is created.

An ADR must not be stored only in:

- chat history;
- issue comments;
- pull-request discussion;
- commit messages;
- private notes;
- generated reports;
- temporary files.

External discussion may be referenced, but the repository ADR must remain the
durable decision record.

---

## 11. Required ADR sections

Every ADR must contain:

- Title.
- Status.
- Date.
- Decision owners or reviewers.
- Context.
- Decision.
- Decision scope.
- Alternatives considered.
- Evidence.
- Consequences.
- Security implications.
- Data and migration implications.
- Operational implications.
- Testing and validation requirements.
- Reconsideration triggers.
- Related records.

Additional sections may be added when useful.

Required sections must not be omitted merely to shorten the document.

---

## 12. Title

The title should describe the selected decision.

Prefer:

> Use PostgreSQL for control-plane persistence

Avoid vague titles such as:

> Database decision

A proposed ADR may use a neutral title while alternatives remain under review,
but the final accepted title should describe the actual decision.

---

## 13. Context

The context section must state:

- the problem;
- the current verified system state;
- the constraints;
- the capability affected;
- the reason a decision is required;
- known unknowns;
- relevant policy requirements.

The context must distinguish:

- verified current behavior;
- intended future behavior;
- assumptions;
- unresolved facts.

Roadmap text must not be presented as proof of current implementation.

---

## 14. Decision statement

The decision section must state exactly what is being selected.

It should identify:

- selected architecture or component;
- intended scope;
- trust zone;
- supported use;
- prohibited use;
- version or protocol boundary when relevant;
- expected ownership.

A decision must be narrow enough to evaluate and implement.

Avoid combining several unrelated architecture changes into one ADR.

---

## 15. Decision scope

The ADR must define where the decision applies.

Applicable dimensions include:

- product component;
- repository;
- deployment profile;
- environment;
- tenant model;
- language;
- provider;
- data type;
- workflow stage;
- capability identifiers.

The ADR must also state what is outside scope.

An ADR for TypeScript semantic indexing must not silently decide Python
analysis, remediation, and publication architecture.

---

## 16. Alternatives considered

The alternatives section must include only alternatives genuinely evaluated.

For each alternative, record applicable:

- functional fit;
- security;
- license;
- maintenance;
- operational cost;
- migration cost;
- reversibility;
- known limitations;
- reason selected or rejected.

Do not invent alternatives to make the selected decision appear more rigorous.

When only one viable option was available, state that fact and explain the
constraint.

---

## 17. Existing implementation as an alternative

When changing an existing system, the current implementation must be considered
as an alternative.

The ADR should explain:

- current behavior;
- benefits of preserving it;
- current defects;
- migration implications;
- reason for changing or retaining it.

A new design must not be compared only against other new designs while ignoring
the cost and risk of replacing working behavior.

---

## 18. Evidence

The evidence section should cite applicable:

- source inspection;
- tests;
- benchmarks;
- fixture results;
- incident records;
- capability reports;
- security evaluations;
- license reviews;
- provider documentation;
- official specifications;
- migration experiments;
- prototypes.

Evidence must be attributable.

Unexecuted expectations must be labeled as assumptions or projections.

Benchmark estimates must not be reported as measurements.

---

## 19. Current external information

When an ADR depends on changeable external facts, those facts must be verified
using current authoritative sources.

Examples include:

- software licenses;
- latest supported versions;
- provider capabilities;
- security advisories;
- maintenance status;
- service terms;
- protocol specifications.

The ADR should record:

- source identity;
- version or date checked;
- relevant conclusion;
- unresolved uncertainty.

When authoritative information is unavailable, the ADR must state the limitation
and may remain proposed or blocked.

---

## 20. Consequences

The consequences section must include both positive and negative effects.

Applicable consequences include:

- new capabilities;
- reduced complexity;
- new dependencies;
- migration cost;
- operational burden;
- security exposure;
- performance impact;
- compatibility impact;
- maintenance ownership;
- vendor lock-in;
- new failure modes;
- reduced flexibility;
- future replacement cost.

An ADR must not contain only benefits.

---

## 21. Security implications

Every architecture-significant ADR must evaluate security impact.

Applicable questions include:

- Does the decision change a trust boundary?
- Does it expose credentials?
- Does it execute untrusted content?
- Does it require network access?
- Does it transmit source externally?
- Does it affect tenant isolation?
- Does it change audit integrity?
- Does it introduce native code?
- Does it require privileged execution?
- Does it affect the trusted publisher?
- Does it expand external write authority?

When there is no material security impact, state why.

---

## 22. Secret-handling implications

An ADR affecting credentials or secret-bearing systems must document:

- secret types;
- trust zone;
- storage;
- injection method;
- lifetime;
- access scope;
- redaction;
- cleanup;
- rotation;
- incident implications.

Secret values must never appear in the ADR.

The ADR must not authorize credentials merely by documenting them.

---

## 23. Data implications

An ADR affecting data must document:

- data created;
- data read;
- data transmitted;
- data retained;
- tenant scope;
- privacy impact;
- source-content impact;
- deletion behavior;
- export behavior;
- archival implications.

Source-code transmission to external systems requires explicit treatment.

---

## 24. Database implications

An ADR affecting persistence must document:

- schema impact;
- migration strategy;
- compatibility;
- existing-data handling;
- rollback or forward recovery;
- tenant isolation;
- audit reconstruction;
- backup and restoration;
- historical-data preservation.

Existing migrations must not be rewritten as part of a new architecture decision
unless separately authorized under an exceptional migration process.

---

## 25. Operational implications

The ADR must identify applicable operational requirements such as:

- deployment;
- monitoring;
- alerting;
- scaling;
- backups;
- recovery;
- rate limits;
- retries;
- timeouts;
- cleanup;
- credential rotation;
- incident response;
- ownership.

A design that is simple in code but operationally expensive must record that
cost.

---

## 26. Testing and validation requirements

The ADR must identify how the decision will be validated.

Applicable validation may include:

- unit tests;
- integration tests;
- migration tests;
- hostile fixtures;
- security-control tests;
- performance tests;
- scale tests;
- provider sandbox tests;
- failure-injection tests;
- recovery tests;
- manual review.

Acceptance of the ADR does not mean these tests have already passed.

The implementation phase must report actual results.

---

## 27. Reconsideration triggers

Every accepted ADR should identify conditions that require review.

Examples include:

- tool license changes;
- provider API changes;
- security incidents;
- unmaintained dependencies;
- performance limits;
- scale thresholds;
- new compliance requirements;
- unsupported repository shapes;
- new tenant requirements;
- migration failures;
- availability failures;
- better supported standards.

Reconsideration does not automatically supersede the ADR.

A new decision record is required.

---

## 28. Related records

An ADR should link to applicable:

- capability identifiers;
- phase authorization;
- roadmap phase;
- tool-decision record;
- dependency checklist;
- security review;
- migration plan;
- phase report;
- superseded ADR;
- implementation issue;
- test manifest.

Links provide traceability.

They do not transfer authority from one record to another.

---

## 29. No invented history

An ADR must not claim that:

- a prior team selected the architecture;
- stakeholders approved the decision;
- an incident occurred;
- a benchmark was run;
- an alternative was rejected;
- a tool was previously evaluated;
- a migration was attempted;
- a customer required the feature;
- unless supporting evidence exists.

When historical context is unavailable, use wording such as:

> The historical rationale for the current implementation is not known from
> the available repository evidence.

Present-day rationale may still be documented.

---

## 30. No hidden chain of thought

An ADR must contain concise, reviewable rationale and evidence.

It must not depend on private reasoning, hidden scratch work, or unverifiable
internal deliberation.

The goal is not to record every thought.

The goal is to record the decision-relevant facts, alternatives, constraints,
and consequences.

---

## 31. Human review

An architecture-significant ADR requires human review before acceptance.

The review should verify:

- decision scope;
- factual accuracy;
- authorization consistency;
- security impact;
- license impact;
- migration impact;
- operational ownership;
- testing requirements;
- alternatives;
- consequences.

The reviewer must be attributable.

Silence or lack of objection must not be interpreted as approval.

---

## 32. Acceptance authority

The repository should identify who may accept ADRs.

Until a more specific governance model exists, acceptance requires explicit
human approval from the authorized project operator.

Codex may:

- draft an ADR;
- gather evidence;
- compare alternatives;
- identify risks;
- propose a status.

Codex must not self-approve an ADR.

---

## 33. ADR and phase authorization

A phase authorization may permit:

- drafting an ADR;
- evaluating alternatives;
- performing a bounded proof of concept;
- updating an ADR;
- implementing an accepted ADR.

The authorization must identify the permitted work.

An accepted ADR does not activate a roadmap phase.

A phase authorization does not automatically accept a proposed ADR.

---

## 34. ADR and governance integrity

ADRs must not modify permanent safety policy indirectly.

An ADR cannot validly decide to:

- allow direct default-branch pushes;
- allow automatic merge;
- expose publisher credentials to runners;
- ignore the prohibited-repository policy;
- treat analyzer failure as zero findings;
- merge human disposition with remediation authorization;
- rewrite audit history;
- weaken secret-handling rules.

Such a proposal conflicts with higher-precedence governance and must be
rejected.

---

## 35. ADR and implementation

Implementation must reference the accepted ADR when the decision is
architecture-significant.

Implementation reports should state:

- ADR identifier;
- implemented scope;
- deviations;
- tests executed;
- migration status;
- remaining work;
- capability status.

A deviation from an accepted ADR requires:

- explanation;
- review;
- updated decision record or new ADR when material;
- explicit authorization.

Implementation must not silently diverge from the accepted architecture.

---

## 36. ADR immutability

After an ADR is accepted, rejected, superseded, deprecated, or withdrawn, its
decision content should not be rewritten.

Permitted administrative changes may include:

- correcting a broken link;
- adding a superseding ADR reference;
- correcting formatting without changing meaning;
- adding implementation references;
- adding explicit metadata that does not alter the original decision.

Material changes require a new ADR.

The original record must remain available.

---

## 37. Superseding an ADR

A new ADR must supersede an existing ADR when the architecture decision changes
materially.

The new ADR must identify:

- superseded ADR;
- reason for reconsideration;
- changed context;
- new evidence;
- migration implications;
- compatibility implications;
- deprecation or transition plan.

The older ADR status must become superseded.

Its content must remain unchanged except for the supersession reference.

---

## 38. Rejecting an ADR

A rejected ADR should preserve:

- the proposal;
- context;
- alternatives;
- available evidence;
- reason for rejection;
- reviewer;
- decision date.

Rejected ADRs should not be deleted.

They provide useful evidence that the proposal was considered.

A future proposal may revisit the topic using new evidence in a new ADR.

---

## 39. Deprecating an ADR

An ADR may become deprecated when:

- its architecture remains in existing systems;
- new implementation should use a replacement;
- migration is incomplete;
- removal is not yet authorized.

The ADR should identify:

- replacement ADR;
- affected components;
- migration status;
- compatibility period;
- removal conditions.

Deprecation must not be used to conceal broken or unsafe behavior.

---

## 40. ADR corrections

A factual error discovered after finalization must be corrected transparently.

Use one of these approaches:

- add a clearly labeled correction note;
- create a linked correction record;
- create a superseding ADR when the correction changes the decision.

Do not silently rewrite the original reasoning.

The correction must identify:

- error;
- corrected fact;
- impact on the decision;
- correction date;
- correcting actor.

---

## 41. ADR size

An ADR should be as short as possible while preserving decision quality.

A narrow decision may require only a few pages.

A cross-cutting security or persistence decision may require more detail.

Do not combine unrelated decisions merely to reduce the number of files.

Do not add generic policy text already defined elsewhere.

Reference applicable policies instead.

---

## 42. ADR templates

New ADRs should use:

`codex/templates/adr-template.md`

The template may be extended for a specific decision.

Required sections must remain present.

Template completion must reflect actual evidence rather than boilerplate.

---

## 43. Tool decisions versus ADRs

A tool-decision record is appropriate for a narrow dependency evaluation.

An ADR is additionally required when the tool:

- becomes a core architectural dependency;
- changes a trust boundary;
- introduces hosted processing;
- changes credential flow;
- establishes an authoritative data format;
- creates material migration cost;
- replaces a core subsystem;
- affects several capabilities.

A tool-decision record and ADR may reference each other.

They serve different purposes.

---

## 44. Proofs of concept

A proof of concept may inform an ADR.

The ADR must record:

- bounded objective;
- environment;
- tool versions;
- fixture;
- tests executed;
- observed results;
- limitations;
- whether results generalize.

A proof of concept does not establish production readiness.

Prototype code must not become an accepted architecture merely because it
exists.

---

## 45. Benchmarks

When benchmark evidence influences a decision, record:

- workload;
- environment;
- hardware;
- tool versions;
- runner profile;
- cache state;
- number of runs;
- measurements;
- variability;
- limitations.

Do not compare benchmark results from materially different environments without
stating the limitation.

Do not present vendor or upstream benchmark claims as DCAv2 measurements.

---

## 46. Security-sensitive ADRs

A security-sensitive ADR should include an explicit threat analysis.

Applicable questions include:

- What is trusted?
- What is untrusted?
- Which credentials exist?
- Which boundaries are crossed?
- What can an attacker control?
- What is the containment model?
- What are the failure modes?
- Which controls are preventive?
- Which controls are detective?
- Which controls remain unverified?
- What is the residual risk?

Security claims must remain bounded to implemented and tested controls.

---

## 47. Provider-specific ADRs

An ADR involving an external provider must identify:

- provider;
- API or protocol;
- authentication;
- permission scope;
- rate limits;
- idempotency;
- partial success;
- data retention;
- failure behavior;
- provider-specific restrictions;
- replacement strategy.

A generic provider abstraction must not conceal provider-specific safety
limitations.

---

## 48. Open-source adoption ADRs

An ADR adopting a core open-source component must reference:

- dependency-adoption checklist;
- exact version or version policy;
- license review;
- security review;
- provenance;
- maintenance status;
- adapter design;
- failure behavior;
- upgrade policy;
- replacement strategy.

The ADR must not conclude that adoption is safe when required license or
security information remains unresolved.

---

## 49. Hosted-service ADRs

A hosted-service ADR must document:

- data transmitted;
- source-code transmission;
- retention;
- training or secondary-use terms;
- confidentiality;
- tenant isolation;
- regional storage;
- subprocessors;
- credentials;
- availability;
- rate limits;
- deletion;
- export;
- incident response;
- exit strategy.

Adoption must remain blocked when required legal, security, or authorization
conditions are unavailable.

---

## 50. Database ADRs

A database ADR should document:

- data model fit;
- transactional requirements;
- consistency;
- indexing;
- migration behavior;
- backup and restoration;
- tenant isolation;
- audit enforcement;
- operational ownership;
- scale assumptions;
- alternatives;
- exit strategy.

A graph-shaped domain does not automatically justify a graph database.

Measured requirements must support additional infrastructure.

---

## 51. ADR indexing

The repository should maintain an ADR index when ADRs exist.

The index should include:

- ADR number;
- title;
- status;
- date;
- superseding ADR when applicable;
- affected capabilities.

The index is a navigation aid.

It must not replace the ADR content.

---

## 52. Machine-readable metadata

ADRs may include machine-readable front matter.

Example:

```yaml
---
adr_id: ADR-0001
title: Use PostgreSQL for control-plane persistence
status: proposed
date: 2026-07-22
decision_owners: []
supersedes: []
superseded_by: null
capability_ids: []
phase_authorization_id: null
---
```

Metadata must match the human-readable document.

Machine-readable metadata must not contain secret values.

---

## 53. ADR review checklist

Before accepting an ADR, verify:

- [ ] The decision is architecture-significant.
- [ ] The context reflects verified current behavior.
- [ ] The scope is explicit.
- [ ] Out-of-scope behavior is explicit.
- [ ] Alternatives are factual.
- [ ] No historical rationale was invented.
- [ ] Evidence is attributable.
- [ ] External facts are current where required.
- [ ] Positive consequences are documented.
- [ ] Negative consequences are documented.
- [ ] Security implications are documented.
- [ ] Secret-handling implications are documented.
- [ ] Data implications are documented.
- [ ] Migration implications are documented.
- [ ] Operational ownership is documented.
- [ ] Testing requirements are documented.
- [ ] Reconsideration triggers are documented.
- [ ] Higher-precedence governance is preserved.
- [ ] Human approval is explicit.
- [ ] Acceptance is separate from implementation authorization.

---

## 54. Reporting requirements

A phase report involving ADR work must state:

- ADRs created;
- ADRs proposed;
- ADRs accepted;
- ADRs rejected;
- ADRs superseded;
- evidence gathered;
- proof-of-concept results;
- unresolved questions;
- implementation authorized or not authorized;
- deviations from accepted decisions.

Do not report an ADR as implemented merely because it was accepted.

Do not report an ADR as accepted without attributable human approval.

---

## 55. Fail-safe behavior

When an architecture decision cannot be completed confidently:

- keep the ADR proposed;
- record missing evidence;
- record unresolved security or license questions;
- avoid implementation that depends on the unresolved decision;
- do not invent rationale;
- do not claim acceptance;
- do not broaden authorization;
- identify the safe next investigation or decision.

Decision uncertainty must reduce implementation authority.

---

## 56. Policy integrity

This document must not be modified during implementation unless engineering or
governance modification is explicitly authorized.

Changes require:

- Identification of the ADR-policy problem.
- Review against instruction precedence.
- Review of authorization separation.
- Review of governance-integrity implications.
- Updated ADR templates or review checklists.
- A reviewable governance commit.
- An ADR when the change materially alters long-lived decision-record semantics.

This policy must not be weakened to allow self-approval, invented history,
silent decision rewriting, or implementation without authorization.
