# Evidence Model

This document defines the architecture for representing evidence collected and
derived by DCAv2.

The evidence model must preserve provenance, source identity, scope, freshness,
coverage, uncertainty, and relationships among observations.

Evidence supports classification and human review. Evidence does not authorize
remediation or publication.

This document must be applied together with:

- `codex/core/03-safety-invariants.md`;
- `codex/core/04-accuracy-and-evidence-policy.md`;
- `codex/architecture/coverage-model.md`;
- `codex/architecture/classification-policy.md`;
- `codex/architecture/audit-policy.md`.

---

## 1. Core principles

The evidence model must be:

- append-oriented;
- provenance-preserving;
- source-bound;
- scope-aware;
- version-aware;
- deterministic where practical;
- explicit about uncertainty;
- explicit about failures;
- capable of representing contradictions;
- independent of any single analyzer;
- safe for multi-repository and multi-tenant use.

DCAv2 must not store only a tool's final conclusion.

It must preserve the observations and execution context needed to explain and
re-evaluate that conclusion.

---

## 2. Evidence is not authorization

Evidence may support:

- machine classification;
- review prioritization;
- human disposition;
- remediation eligibility checks;
- audit explanations.

Evidence must not independently:

- confirm code as dead;
- approve remediation;
- authorize source modification;
- authorize branch creation;
- authorize publication;
- authorize merge;
- override repository-access policy.

Human disposition and remediation authorization must remain separate records.

---

## 3. Evidence layers

DCAv2 distinguishes three evidence layers.

### 3.1 Raw evidence artifacts

Raw artifacts are bounded outputs produced by tools or external systems.

Examples include:

- analyzer JSON;
- semantic index fragments;
- compiler diagnostics;
- test reports;
- build reports;
- package metadata;
- contract documents;
- infrastructure manifests;
- runtime query results.

Raw artifacts are untrusted.

They must be stored only when necessary and must retain:

- artifact type;
- content hash;
- size;
- producer;
- producer version;
- source snapshot;
- creation time;
- storage reference;
- redaction status.

### 3.2 Normalized evidence items

Normalized evidence items represent stable facts extracted from raw artifacts.

Examples include:

- a declaration occurrence;
- a semantic reference;
- a framework registration;
- a package dependency;
- an analyzer failure;
- a runtime observation;
- an excluded source root.

Normalized evidence must be independent of tool-specific output formats.

### 3.3 Derived evidence assertions

Derived assertions combine or interpret normalized evidence through versioned
policy.

Examples include:

- a reference is production usage;
- all discovered references are test-only;
- workspace coverage is incomplete;
- a runtime observation maps to a source occurrence;
- two evidence items contradict each other.

Derived assertions must link to:

- their input evidence;
- the derivation rule;
- the rule version;
- the policy version;
- the derivation time.

---

## 4. Primary entities

The evidence model should support the following entities.

### 4.1 Account or tenant

Represents the organizational isolation boundary.

Required fields include:

- account ID;
- tenant ID when applicable;
- provider connection identity;
- ownership scope.

Every evidence record must belong to exactly one account or tenant scope.

### 4.2 Repository

Represents a canonical version-control repository identity.

Required fields include:

- provider;
- owner;
- repository name;
- canonical full name;
- repository ID when supplied by the provider.

A repository name alone is insufficient identity.

### 4.3 Source snapshot

Represents one immutable repository state.

Required fields include:

- repository identity;
- requested revision;
- resolved immutable commit;
- source snapshot digest;
- acquisition time;
- acquisition method;
- submodule identities when included;
- source-access authorization ID.

Evidence from different source snapshots must not be merged as though it came
from one source state.

### 4.4 Analysis epoch

Represents a bounded organization, repository, package, or service analysis
scope.

An analysis epoch may include:

- one repository;
- multiple repositories;
- package versions;
- deployed versions;
- contracts;
- infrastructure sources;
- runtime observation windows.

The epoch must identify unavailable and excluded sources as well as included
sources.

### 4.5 Workspace and package

Represents logical project boundaries within repositories.

Fields may include:

- workspace ID;
- package ID;
- repository;
- source snapshot;
- package root;
- package name;
- package version;
- package manager;
- build target;
- parent workspace;
- generated or vendored status.

### 4.6 Source document

Represents a file within an immutable source snapshot.

Required fields include:

- source snapshot;
- normalized repository-relative path;
- content hash;
- language;
- generated status;
- vendored status;
- test-scope status;
- size.

Host-specific absolute paths must not be used as durable evidence identity.

### 4.7 Source occurrence

Represents an exact range within a source document.

Fields should include:

- source document;
- start byte;
- end byte;
- start line;
- start column;
- end line;
- end column;
- occurrence hash where practical.

Line and column positions are explanatory metadata.

Content and range identity must be used when determining whether an occurrence
is still current.

### 4.8 Semantic entity

Represents a logical program entity such as:

- function;
- method;
- class;
- interface;
- variable;
- type;
- module;
- export;
- route handler;
- message handler;
- scheduled job;
- service operation.

A semantic entity may have multiple source occurrences across revisions.

The model must not assume that symbol names alone provide stable identity.

---

## 5. Evidence-item structure

Every normalized evidence item should contain the following fields.

### Identity

- evidence ID;
- account or tenant ID;
- evidence type;
- schema version.

### Source binding

- repository ID;
- source snapshot ID;
- source document ID when applicable;
- source occurrence ID when applicable;
- semantic entity ID when applicable;
- workspace or package ID when applicable.

### Scope

- analysis epoch ID;
- environment when applicable;
- deployment when applicable;
- package version when applicable;
- observation window when applicable.

### Provenance

- producer type;
- producer name;
- producer version;
- adapter version;
- configuration digest;
- rule or query identity;
- runner job ID;
- raw artifact ID when applicable.

### Result

- normalized value;
- interpretation status;
- mapping confidence when applicable;
- correlation group;
- contradiction group when applicable.

### Lifecycle

- observed at;
- persisted at;
- freshness state;
- superseded-by reference when applicable;
- invalidation reason when applicable.

---

## 6. Evidence types

Evidence types must use stable machine-readable identifiers.

Initial evidence types may include:

### Source structure

- `syntax_declaration`;
- `semantic_definition`;
- `export_declaration`;
- `entry_point_declaration`;
- `generated_source`;
- `vendored_source`;
- `test_scope_source`.

### References and usage

- `semantic_reference`;
- `import_reference`;
- `reexport_reference`;
- `call_reference`;
- `function_value_reference`;
- `callback_registration`;
- `textual_occurrence`;
- `dynamic_use_indicator`.

### Package and repository relationships

- `package_dependency`;
- `workspace_dependency`;
- `cross_package_reference`;
- `cross_repository_reference`;
- `registry_consumer`;
- `git_dependency`;
- `generated_client_relationship`.

### Framework and configuration evidence

- `framework_registration`;
- `dependency_injection_registration`;
- `decorator_registration`;
- `configuration_registration`;
- `plugin_registration`;
- `public_api_exposure`.

### Contract and service evidence

- `rest_contract_binding`;
- `graphql_contract_binding`;
- `grpc_contract_binding`;
- `message_producer`;
- `message_consumer`;
- `scheduled_job_binding`;
- `webhook_binding`.

### Infrastructure evidence

- `deployment_binding`;
- `container_entry_point`;
- `gateway_binding`;
- `service_mesh_binding`;
- `infrastructure_reference`.

### Runtime evidence

- `runtime_execution`;
- `runtime_request`;
- `runtime_message`;
- `runtime_job_execution`;
- `runtime_mapping`.

### Operational and negative evidence

- `analyzer_failure`;
- `analyzer_timeout`;
- `unsupported_scope`;
- `excluded_scope`;
- `unavailable_repository`;
- `configuration_required`;
- `resource_limit_exceeded`;
- `coverage_assertion`.

New evidence types must be additive and versioned.

---

## 7. Provenance requirements

Evidence provenance must be sufficient to reproduce or independently evaluate
the observation.

Applicable provenance fields include:

- analyzer name;
- analyzer version;
- adapter name;
- adapter version;
- runner image digest;
- executable digest;
- package-manager version;
- compiler version;
- configuration digest;
- command identity;
- structured arguments;
- working directory;
- start time;
- end time;
- exit code;
- output artifact digest;
- source snapshot digest;
- security profile.

A missing tool version or configuration digest must remain visible as a
provenance limitation.

---

## 8. Analyzer-run model

Analyzer execution must be represented separately from the evidence items it
produces.

An analyzer run should record:

- analyzer-run ID;
- analysis epoch;
- source snapshot;
- workspace or package scope;
- analyzer identity;
- adapter identity;
- command identity;
- runner profile;
- start and completion times;
- status;
- exit code;
- timeout status;
- resource-limit status;
- output artifact references;
- normalized evidence count;
- warnings;
- exclusions;
- failure category.

Supported statuses include:

- `succeeded`;
- `failed`;
- `timed_out`;
- `resource_exceeded`;
- `unavailable`;
- `unsupported`;
- `malformed_output`;
- `partially_completed`;
- `configuration_required`.

Only a successful run may contribute successful coverage for its declared
scope.

---

## 9. Failure evidence

Failures must be represented as first-class evidence.

A failed analyzer must not disappear from the model.

Failure evidence should include:

- failed component;
- affected scope;
- failure type;
- error classification;
- bounded diagnostic summary;
- retryability;
- whether partial output exists;
- whether required coverage was affected.

Failure evidence may block classification even when other analyzers succeed.

---

## 10. Positive and absence-based evidence

The model must distinguish positive evidence from absence-based evidence.

### Positive evidence

Positive evidence records an observed relationship or execution.

Examples include:

- semantic reference;
- contract binding;
- framework registration;
- runtime execution;
- known external consumer.

### Absence-based evidence

Absence-based evidence states that no matching observation was found within a
declared scope.

It must include:

- the exact searched scope;
- the analyzer or query used;
- the coverage identity;
- exclusions;
- failures;
- unsupported behavior;
- observation window when applicable.

Absence-based evidence without sufficient coverage must not support a
conclusive dead-code classification.

---

## 11. Evidence polarity

Evidence items may use an explicit polarity:

- `supports_liveness`;
- `supports_candidate_absence`;
- `blocks_classification`;
- `context_only`;
- `contradictory`;
- `unknown`.

Polarity must be assigned by a versioned interpretation rule rather than copied
uncritically from an analyzer's verdict.

Positive liveness evidence must not be assigned negative polarity merely to
improve dead-code recall.

---

## 12. Evidence strength

Evidence strength may be represented through named categories rather than an
authoritative numeric score.

Possible categories include:

- `exact_semantic`;
- `exact_runtime`;
- `exact_contract`;
- `structural`;
- `configuration_derived`;
- `heuristic`;
- `textual`;
- `contextual`;
- `unknown`.

Strength does not replace scope, coverage, provenance, or freshness.

A weak evidence category must not be promoted merely because several correlated
tools emitted it.

---

## 13. Correlation groups

Evidence derived from the same underlying source or analysis technique should
share a correlation-group identity.

Examples include:

- multiple normalized items from one SCIP index;
- Tree-sitter and textual results over the same syntax tree;
- repeated runs of the same analyzer configuration;
- multiple adapters consuming one generated dependency graph.

Correlation groups help prevent counting related evidence as independent
confirmation.

Classification policy must not use raw evidence count as a substitute for
independence.

---

## 14. Contradiction groups

When evidence items make incompatible claims about the same relevant scope,
they should be linked through a contradiction group.

A contradiction group should identify:

- affected finding or semantic entity;
- participating evidence items;
- affected source snapshot;
- affected scope;
- contradiction type;
- resolution status;
- applicable dominance rule;
- resolution rationale.

Unresolved contradictions must remain explicit.

They must not be hidden through aggregation.

---

## 15. Evidence relationships

The model should support typed relationships among evidence items.

Possible relationship types include:

- `derived_from`;
- `corroborates`;
- `contradicts`;
- `supersedes`;
- `maps_to`;
- `references`;
- `belongs_to_scope`;
- `excluded_from_scope`;
- `generated_from`;
- `observed_in_deployment`;
- `correlated_with`.

Relationships must identify their derivation rule when they are not directly
observed.

---

## 16. Evidence mapping

Evidence from contracts, infrastructure, or runtime systems may not directly
identify a source occurrence.

Mapping records must be explicit.

A mapping should include:

- source evidence;
- target semantic entity or source occurrence;
- mapping method;
- mapping rule version;
- mapping confidence;
- ambiguity;
- alternative targets;
- reviewer status when applicable.

An uncertain mapping must not be represented as an exact reference.

Positive external evidence with uncertain mapping may still block remediation
for a broader enclosing scope.

---

## 17. Test-scope evidence

Test evidence must remain distinguishable from production evidence.

A reference item should record its source scope, such as:

- `production`;
- `test`;
- `fixture`;
- `benchmark`;
- `example`;
- `generated`;
- `unknown`.

Test-only classification requires sufficient evidence that all observed usage
falls within recognized test scope.

Unknown source scope must not be silently treated as test scope.

---

## 18. Public API evidence

Evidence that a symbol is externally consumable must be represented explicitly.

Examples include:

- exported package entry point;
- published package symbol;
- documented public API;
- extension point;
- plugin interface;
- generated SDK surface;
- externally callable route.

Public exposure may block remediation even when internal references are absent.

The model must distinguish:

- internal export;
- workspace export;
- organization export;
- publicly published export;
- unknown consumer scope.

---

## 19. Runtime evidence model

Runtime evidence should include:

- service identity;
- service version;
- deployment identity;
- environment;
- operation identity;
- observation start;
- observation end;
- first-seen time;
- last-seen time;
- execution count;
- sampling information;
- collector identity;
- collector version;
- completeness;
- source-mapping method;
- mapping confidence.

Runtime evidence must be version-aware.

Execution observed for one deployed version must not automatically apply to
another source snapshot.

Missing runtime activity must be stored as a scoped observation, not as proof
that execution never occurs.

---

## 20. Contract evidence model

Contract evidence should preserve:

- protocol;
- contract identity;
- contract version;
- producer;
- consumer;
- generated artifact identity;
- operation or message identity;
- environment;
- deployment;
- source mapping;
- provenance.

Supported protocols may be introduced incrementally.

The model must not require every possible protocol to exist before useful
contract evidence can be stored.

---

## 21. Infrastructure evidence model

Infrastructure evidence should preserve:

- infrastructure source;
- source revision;
- tool or parser;
- resource identity;
- environment;
- deployment relationship;
- referenced artifact or operation;
- source mapping;
- known templating limitations.

Rendered and source-template evidence must remain distinguishable.

An unresolved template value must remain unresolved.

---

## 22. Evidence freshness

Every evidence item must have a freshness state.

Supported states include:

- `current`;
- `stale_source`;
- `stale_configuration`;
- `stale_tool`;
- `stale_policy`;
- `stale_coverage`;
- `stale_runtime_window`;
- `superseded`;
- `unknown`.

Evidence becomes stale when a relevant identity changes, including:

- repository commit;
- file content;
- source occurrence;
- package version;
- deployment version;
- analyzer version;
- adapter version;
- configuration digest;
- rule version;
- policy version;
- coverage identity;
- contract version;
- runtime observation scope.

Stale evidence remains available for audit but must not authorize current
remediation.

---

## 23. Evidence invalidation

Invalidation must create new state rather than delete history.

An invalidation record should identify:

- evidence item;
- invalidation reason;
- triggering identity change;
- detected time;
- actor or process;
- replacement evidence when applicable.

Historical evidence must not be edited to appear as though it was collected
against a newer source state.

---

## 24. Evidence digest

A finding should bind to a deterministic digest of its authoritative evidence
inputs.

The digest should cover applicable:

- normalized evidence identities;
- evidence content hashes;
- coverage identity;
- source snapshot;
- policy version;
- exclusions;
- analyzer-run identities;
- interpretation-rule versions.

Canonical ordering is required.

Equivalent inputs must produce the same digest regardless of database row order
or processing order.

A changed evidence digest must invalidate stale review or remediation
authorization unless an approved revalidation rule applies.

---

## 25. Canonicalization

Before hashing or comparing evidence, DCAv2 should canonicalize:

- identifiers;
- path separators;
- repository-relative paths;
- ordering;
- timestamps excluded from semantic hashes;
- enumerated values;
- optional empty fields;
- structured arguments;
- relationship ordering.

Canonicalization rules must be versioned.

A canonicalization change that affects evidence digests requires migration and
compatibility planning.

---

## 26. Evidence immutability

Persisted evidence used in a classification or decision should be immutable.

Corrections must create:

- a replacement evidence item;
- a correction record;
- a superseding relationship;
- a new classification when applicable.

Do not update historical evidence in place to change:

- provenance;
- source identity;
- observed value;
- analyzer status;
- collection scope;
- timestamp;
- polarity.

Administrative metadata that does not alter historical meaning may be updated
only when audit requirements allow it.

---

## 27. Deduplication

Deduplication may prevent repeated storage of semantically identical evidence.

A deduplication key may include:

- tenant;
- evidence type;
- source snapshot;
- source occurrence;
- producer;
- producer version;
- configuration digest;
- normalized value;
- observation scope.

Deduplication must not merge evidence from:

- different source snapshots;
- different tenants;
- different runtime windows;
- different analyzer configurations;
- different policy interpretations.

Repeated observations may remain separate when frequency or independent
provenance matters.

---

## 28. Database representation

The preferred persistence model is relational and append-oriented.

Possible tables include:

- `repositories`;
- `source_snapshots`;
- `analysis_epochs`;
- `workspaces`;
- `packages`;
- `source_documents`;
- `source_occurrences`;
- `semantic_entities`;
- `analyzer_runs`;
- `raw_artifacts`;
- `evidence_items`;
- `evidence_relationships`;
- `evidence_mappings`;
- `evidence_invalidations`;
- `coverage_records`;
- `finding_evidence_links`.

Table names are illustrative until implemented through an authorized phase.

The model does not require a graph database.

Graph relationships may be represented relationally unless measured scale or
query requirements justify another storage system.

---

## 29. Tenant isolation

Every persisted evidence record must be tenant-scoped where multi-tenant
operation exists.

Tenant isolation must apply to:

- repositories;
- source snapshots;
- raw artifacts;
- analyzer runs;
- evidence items;
- relationships;
- findings;
- coverage;
- runtime observations;
- audit events.

Cross-tenant evidence correlation is prohibited unless an explicit product and
security policy defines a safe aggregate use case.

---

## 30. Data minimization

Evidence persistence should avoid unnecessary source storage.

Prefer:

- source identities;
- content hashes;
- semantic identities;
- ranges;
- normalized facts;
- bounded excerpts only when necessary;
- controlled artifact references.

Avoid storing:

- full repositories in the control-plane database;
- unbounded command output;
- complete source files without need;
- secret-bearing configuration;
- production request bodies;
- customer data unrelated to dead-code evidence.

---

## 31. Secret handling

Evidence must not contain secret values.

Potentially secret-bearing analyzer output must be redacted before persistence.

Evidence may record:

- that a secret-bearing file was excluded;
- that a required credential was unavailable;
- that redaction occurred;
- that a possible secret was detected.

Evidence must not record:

- token values;
- passwords;
- private keys;
- authentication headers;
- credential-bearing URLs;
- decrypted secret contents.

---

## 32. Evidence explanation

The model must support human-readable explanations.

For any classification, the system should be able to retrieve:

- evidence supporting liveness;
- evidence supporting absence;
- failures;
- unsupported scopes;
- exclusions;
- contradictions;
- freshness state;
- provenance;
- coverage context;
- policy rules applied.

The explanation must distinguish observed facts from derived interpretation.

---

## 33. Query requirements

The evidence model should support queries such as:

- Which evidence supports this finding?
- Which evidence blocks remediation?
- Which analyzer produced this observation?
- Which source snapshot was analyzed?
- Which required scopes were unavailable?
- Which evidence became stale?
- Which positive liveness evidence exists?
- Which evidence is test-only?
- Which repositories contributed cross-repository evidence?
- Which runtime window produced this observation?
- Which rule derived this interpretation?
- Which human decisions referenced this evidence digest?

Query support must not compromise tenant isolation.

---

## 34. Evidence import

Evidence imported from external systems must be treated as untrusted.

An import must record:

- source system;
- source identity;
- import time;
- schema version;
- original artifact hash;
- validation status;
- normalization version;
- trust limitations.

Imported conclusions must not bypass DCAv2 classification policy.

---

## 35. Evidence export

Evidence export requires authorization and data-minimization review.

Exports must:

- remain tenant-scoped;
- exclude secrets;
- exclude unnecessary source content;
- preserve provenance;
- preserve source identity;
- identify redactions;
- identify stale evidence;
- distinguish observations from conclusions.

An exported report must not imply that the recipient is authorized to
remediate.

---

## 36. Testing requirements

Evidence-model tests should cover:

- immutable source binding;
- analyzer provenance;
- analyzer failure persistence;
- positive evidence;
- absence-based evidence;
- incomplete coverage;
- contradictory evidence;
- correlation groups;
- test-only evidence;
- stale evidence;
- evidence invalidation;
- deterministic digests;
- canonical ordering;
- tenant isolation;
- secret redaction;
- imported evidence;
- append-only correction behavior.

Tests must verify that analyzer failure cannot become a successful empty result.

---

## 37. Migration requirements

Evidence-model evolution must use additive, ordered migrations.

A migration must consider:

- existing evidence rows;
- historical classifications;
- evidence digests;
- nullable legacy fields;
- tenant scoping;
- audit reconstruction;
- backward compatibility;
- canonicalization versions.

Existing migrations and historical evidence must not be rewritten merely to
simplify the new model.

---

## 38. Capability boundaries

The existence of an evidence type does not prove that DCAv2 can collect it.

For each evidence type, capability reporting must distinguish:

- schema support;
- adapter support;
- tested collection;
- production-ready collection;
- scale validation;
- unsupported collection.

A placeholder table or enum does not constitute operational evidence support.

---

## 39. Fail-safe behavior

When evidence cannot be normalized confidently:

- preserve the bounded raw artifact when policy permits;
- record normalization failure;
- do not invent a normalized fact;
- do not declare coverage complete;
- do not produce a conclusive absence-based classification;
- classify the affected result as failed, unsupported, or inconclusive;
- retain sufficient provenance for later investigation.

Evidence uncertainty must reduce remediation eligibility.

---

## 40. Model integrity

This document must not be modified during implementation unless architecture or
governance modification is explicitly authorized.

Changes require:

1. Identification of the evidence-model problem.
2. Review against the accuracy and evidence policy.
3. Review of coverage and classification impact.
4. Review of tenant and secret-handling impact.
5. Migration planning.
6. Updated schemas.
7. Updated tests.
8. A reviewable architecture commit.
9. An ADR when the change alters long-lived evidence identity, digest, or
   provenance semantics.

The model must not be weakened to increase finding counts, hide analyzer
failures, or make remediation easier.