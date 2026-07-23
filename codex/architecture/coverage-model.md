# Coverage Model

This document defines how DCAv2 represents the scope, completeness, failures,
exclusions, and limitations of an analysis.

Coverage determines whether absence-based evidence may support a classification.

Coverage is not permission to remediate, and it is not proof that code is dead.

This document must be applied together with:

- `codex/core/03-safety-invariants.md`;
- `codex/core/04-accuracy-and-evidence-policy.md`;
- `codex/architecture/evidence-model.md`;
- `codex/architecture/classification-policy.md`;
- `codex/architecture/capability-definitions.md`.

---

## 1. Core principle

An analysis result is meaningful only within its observed scope.

DCAv2 must distinguish between:

- a scope that was analyzed successfully;
- a scope that was analyzed partially;
- a scope that failed;
- a scope that was unsupported;
- a scope that was unavailable;
- a scope that was excluded by policy;
- a scope that was not discovered;
- a scope that was not required.

The absence of a discovered reference is meaningful only when the required
coverage for that finding type has been satisfied.

Missing coverage must remain visible.

---

## 2. Coverage is not evidence voting

Coverage is a prerequisite for interpreting absence-based evidence.

Coverage must not be treated as:

- another analyzer vote;
- a numeric confidence boost;
- proof of non-use;
- a substitute for positive evidence;
- authorization for remediation.

Complete coverage for one defined scope means only that the declared coverage
requirements for that scope were satisfied.

It does not establish universal absence outside that scope.

---

## 3. Coverage questions

For every finding, DCAv2 should be able to answer:

- Which repositories were considered?
- Which immutable commits were analyzed?
- Which packages and workspaces were included?
- Which files and source roots were included?
- Which analyzers were required?
- Which analyzers completed?
- Which analyzers failed?
- Which language features were supported?
- Which framework conventions were checked?
- Which contracts were inspected?
- Which infrastructure sources were inspected?
- Which package registries were queried?
- Which deployed versions were considered?
- Which runtime environments were observed?
- Which observation windows applied?
- Which scopes were excluded?
- Which relevant scopes were unavailable?
- Which required capabilities were unsupported?
- Which limitations prevent a conclusive classification?

A coverage record must support these explanations without relying on hidden
agent reasoning.

---

## 4. Coverage hierarchy

Coverage may be represented at multiple levels.

Relevant levels include:

1. Account or tenant.
2. Analysis epoch.
3. Repository.
4. Source snapshot.
5. Workspace.
6. Package.
7. Build target.
8. Source root.
9. Source document.
10. Semantic entity.
11. Analyzer.
12. Framework.
13. Contract.
14. Infrastructure source.
15. Deployment.
16. Runtime observation window.

A higher-level coverage claim must be derived from explicit lower-level records.

For example, repository coverage must not be marked complete when a required
workspace failed.

---

## 5. Analysis epoch

An analysis epoch is the immutable boundary for one coordinated analysis.

An epoch must identify:

- epoch ID;
- account or tenant;
- authorization ID;
- policy version;
- start time;
- completion time;
- requested scope;
- discovered scope;
- included scope;
- excluded scope;
- unavailable scope;
- source snapshots;
- analyzer runs;
- runtime observation windows;
- coverage digest;
- final status.

An epoch may cover:

- one package;
- one repository;
- one monorepo;
- several related repositories;
- an organization-wide campaign.

Evidence from different epochs must not be combined silently.

---

## 6. Coverage dimensions

Coverage must be modeled across separate dimensions.

At minimum, applicable dimensions include:

- repository coverage;
- revision coverage;
- workspace coverage;
- package coverage;
- source coverage;
- language coverage;
- analyzer coverage;
- semantic-reference coverage;
- framework coverage;
- configuration coverage;
- package-consumer coverage;
- cross-repository coverage;
- contract coverage;
- infrastructure coverage;
- deployment coverage;
- runtime coverage;
- verification-gate coverage.

A finding may have complete coverage in one dimension and incomplete coverage in
another.

The final classification must apply the coverage requirements relevant to the
finding type.

---

## 7. Coverage statuses

Every coverage record must use an explicit status.

Supported statuses include:

- `complete`;
- `partial`;
- `failed`;
- `unsupported`;
- `unavailable`;
- `configuration_required`;
- `excluded_by_policy`;
- `not_discovered`;
- `not_required`;
- `stale`;
- `unknown`.

### `complete`

All declared requirements for the specific coverage record were satisfied.

### `partial`

Some applicable scope was analyzed successfully, but one or more relevant parts
were not completed.

### `failed`

The required coverage operation executed but failed.

### `unsupported`

DCAv2 does not support the required repository shape, language feature,
framework, protocol, tool, or analysis capability.

### `unavailable`

A required external source, repository, service, credential, registry, or
environment could not be accessed.

### `configuration_required`

Required project or environment configuration was missing.

### `excluded_by_policy`

The scope was deliberately excluded by an authoritative policy.

### `not_discovered`

The scope was expected or suspected but could not be identified sufficiently.

### `not_required`

The coverage dimension does not apply under the current policy.

### `stale`

The coverage record no longer matches the current source, policy, tool,
configuration, deployment, or observation identity.

### `unknown`

The coverage state cannot be determined confidently.

Only `complete` satisfies a required coverage condition.

---

## 8. Required versus optional coverage

Coverage requirements must distinguish:

- required dimensions;
- conditional dimensions;
- optional dimensions;
- informational dimensions.

### Required coverage

Failure to complete the dimension blocks a conclusive absence-based
classification.

### Conditional coverage

The dimension becomes required when a relevant trigger exists.

Examples include:

- framework coverage when framework indicators are detected;
- cross-repository coverage when the package is externally consumable;
- contract coverage when a route or service interface is detected;
- runtime coverage when remediation policy requires an observation period.

### Optional coverage

The dimension may improve explanation or prioritization but does not determine
eligibility.

### Informational coverage

The dimension records context only.

Requirements must be defined by versioned coverage profiles.

---

## 9. Coverage profiles

A coverage profile defines the dimensions required for a class of findings.

A profile should identify:

- profile ID;
- profile version;
- applicable language;
- applicable symbol types;
- applicable repository shapes;
- required dimensions;
- conditional dimensions;
- blocking statuses;
- acceptable exclusions;
- public-API rules;
- dynamic-behavior rules;
- runtime requirements;
- remediation eligibility implications.

Example profile identifiers may include:

```text
typescript-private-function-v1
typescript-exported-symbol-v1
python-private-function-v1
public-package-api-v1
service-route-handler-v1
message-consumer-v1
```

A finding must record the coverage profile used for classification.

---

## 10. Repository coverage

Repository coverage must identify:

- repositories requested;
- repositories discovered;
- repositories included;
- repositories excluded;
- repositories unavailable;
- repositories prohibited;
- repositories outside authorization;
- immutable commits analyzed.

A repository must not be considered covered merely because it appeared in an
account listing.

Repository coverage requires the applicable repository-specific analysis to
complete successfully.

A repository excluded from the requested analysis role must be recorded as
`excluded_by_policy` without performing that analysis operation. Separately
authorized implementation access does not count as analysis coverage.

---

## 11. Revision coverage

Every analyzed repository must resolve to an immutable commit.

Revision coverage must identify:

- requested branch, tag, or revision;
- resolved commit;
- acquisition time;
- source snapshot digest;
- submodule commits when applicable;
- freshness state.

A mutable branch name is not sufficient source identity.

When the source commit changes, prior coverage becomes stale unless an approved
revalidation rule establishes equivalence.

---

## 12. Workspace coverage

Workspace coverage applies to repositories containing multiple projects or
packages.

It must identify:

- workspace configuration;
- package manager;
- discovered workspace roots;
- included workspaces;
- excluded workspaces;
- failed workspaces;
- unsupported workspaces;
- nested workspaces;
- workspace dependency relationships.

A monorepo must not be marked fully covered when a relevant workspace was:

- skipped;
- unavailable;
- unsupported;
- configuration-required;
- failed.

Partial workspace success must remain `partial`.

---

## 13. Package coverage

Package coverage must identify:

- package root;
- package name;
- package version;
- source roots;
- test roots;
- generated roots;
- build targets;
- package dependencies;
- package exports;
- analyzer runs;
- verification gates.

A repository may contain packages with different coverage statuses.

Repository-level reporting must preserve those distinctions.

---

## 14. Source coverage

Source coverage must identify which files were included in analysis.

It should record:

- source roots;
- included files;
- excluded files;
- ignored files;
- generated files;
- vendored files;
- test files;
- examples;
- benchmarks;
- unsupported file types;
- files that failed parsing.

Source coverage claims should use repository-relative paths.

A file excluded because it is generated must remain distinguishable from a file
that was never discovered.

---

## 15. Language coverage

Language coverage must identify:

- detected languages;
- supported languages;
- unsupported languages;
- mixed-language boundaries;
- relevant language versions;
- parser versions;
- compiler versions;
- semantic index coverage;
- unsupported syntax or semantics.

A repository must not be called fully covered merely because its dominant
language is supported.

Unsupported secondary languages may affect cross-language liveness and must
remain visible.

---

## 16. Analyzer coverage

Analyzer coverage must identify:

- analyzers required by the coverage profile;
- analyzers selected;
- analyzers executed;
- analyzer versions;
- adapter versions;
- analyzer scopes;
- analyzer statuses;
- warnings;
- malformed outputs;
- timeouts;
- resource-limit failures.

An analyzer run that times out or emits malformed output does not provide
complete analyzer coverage.

A successful analyzer that covers only part of a project must report partial
scope.

---

## 17. Semantic-reference coverage

Semantic-reference coverage must distinguish:

- local references;
- references in the same file;
- references in the same package;
- references in another package;
- references in another repository;
- references through exports;
- function-value references;
- callbacks;
- generated references;
- unresolved dynamic references.

Textual search does not replace semantic-reference coverage when semantic
analysis is required.

A semantic analyzer's inability to resolve a project must not be represented as
zero references.

---

## 18. Framework coverage

Framework coverage becomes relevant when repository qualification detects
framework behavior.

It should identify:

- detected framework;
- framework version;
- registrations inspected;
- routes inspected;
- dependency-injection bindings inspected;
- decorators or annotations inspected;
- plugin conventions inspected;
- entry-point conventions inspected;
- unsupported conventions;
- dynamic registrations;
- generated registrations.

Framework coverage must be specific.

Support for one framework convention does not imply complete support for the
framework.

---

## 19. Configuration coverage

Configuration may create liveness without direct source references.

Configuration coverage should include applicable:

- project configuration;
- package exports;
- path aliases;
- plugin declarations;
- dependency-injection configuration;
- feature flags;
- route configuration;
- scheduler configuration;
- application entry points;
- generated configuration;
- environment-specific configuration.

Missing required configuration must be represented as
`configuration_required`, not as complete absence.

Secret-bearing configuration must not be exposed.

---

## 20. Package-consumer coverage

For exported or published code, coverage may require identifying consumers.

Package-consumer coverage should include:

- workspace consumers;
- internal repository consumers;
- internal registry consumers;
- Git dependency consumers;
- published package versions;
- generated clients;
- known external consumers;
- unavailable consumer sources.

The absence of internal consumers is insufficient when external consumers may
exist.

Unknown consumer universes must block conclusive deadness for public APIs unless
an approved deprecation policy provides another safe basis.

---

## 21. Cross-repository coverage

Cross-repository coverage must be bounded by the analysis epoch.

It must identify:

- repositories included;
- repositories unavailable;
- repositories excluded;
- immutable commits;
- package versions;
- dependency relationships;
- semantic cross-repository references;
- generated-client relationships;
- contract consumers;
- deployed-version relationships.

Zero discovered cross-repository references is meaningful only within the
recorded epoch.

Unavailable relevant repositories must produce incomplete coverage.

---

## 22. Contract coverage

Contract coverage may include:

- REST or OpenAPI;
- GraphQL;
- Protobuf or gRPC;
- message schemas;
- webhooks;
- scheduled operations;
- generated clients.

For each supported contract source, record:

- protocol;
- contract identity;
- contract version;
- producer;
- consumer;
- operation or message;
- environment;
- deployment;
- source mapping;
- parser status;
- unsupported features.

Contract support must be introduced incrementally.

Unsupported protocols must remain explicit rather than being silently ignored.

---

## 23. Infrastructure coverage

Infrastructure coverage may include:

- Kubernetes;
- Helm;
- Terraform;
- CloudFormation;
- Docker entry points;
- CI/CD workflows;
- API gateways;
- service meshes;
- schedulers;
- deployment manifests.

It must identify:

- infrastructure source;
- immutable source revision;
- parser or tool;
- rendered versus templated state;
- environment;
- deployment;
- unresolved variables;
- failed templates;
- unsupported resources.

Incomplete rendering or unresolved templates must reduce coverage.

---

## 24. Deployment coverage

Deployment coverage should identify:

- environments;
- services;
- service versions;
- artifacts;
- container images;
- deployment identifiers;
- active and inactive deployments;
- version skew;
- unavailable environments.

A source symbol may remain live because an older supported version is still
deployed.

Coverage must not consider only the latest default-branch source when known
deployed versions differ.

---

## 25. Runtime coverage

Runtime coverage must identify:

- environment;
- service;
- service version;
- deployment;
- operation;
- observation start;
- observation end;
- sampling;
- collector identity;
- instrumentation scope;
- collection completeness;
- source-mapping method;
- known blind spots.

A runtime query succeeding does not prove complete runtime coverage.

No observed execution may support an absence statement only when the applicable
runtime policy confirms that:

- the correct deployment was observed;
- the correct version was observed;
- the relevant operation was instrumented;
- the observation window was sufficient;
- sampling was understood;
- collection completeness was sufficient;
- low-frequency behavior was considered.

---

## 26. Verification-gate coverage

Remediation coverage must include baseline and post-change verification.

Applicable gates may include:

- dependency installation;
- type checking;
- compilation;
- build;
- lint;
- unit tests;
- integration tests;
- service startup;
- health checks;
- generated-artifact checks.

For each gate, record:

- required status;
- command identity;
- runner profile;
- execution result;
- scope;
- limitations.

An unavailable, skipped, timed-out, or resource-exceeded gate is not complete
verification coverage.

---

## 27. Exclusions

Every exclusion must have:

- excluded scope;
- exclusion type;
- reason;
- authority;
- policy version;
- effect on classification;
- effect on remediation eligibility.

Exclusion types may include:

- prohibited by policy;
- generated source;
- vendored source;
- unsupported language;
- unsupported framework;
- user-authorized scope reduction;
- cost or resource constraint;
- unavailable credential;
- unavailable repository.

An exclusion does not automatically preserve completeness.

The coverage profile must define whether a specific exclusion is acceptable.

---

## 28. Repository-role exclusions

A repository excluded from analysis or graph participation must be represented
without performing the excluded target operation.

Coverage may record only:

- canonical repository identity;
- exclusion status;
- exclusion policy;
- target operation started as `false`.

The excluded target must not contribute:

- source evidence;
- package metadata;
- analyzer output;
- contract data;
- runtime mappings;
- fixture content.

When the excluded target could contain relevant usage, the finding may
remain inconclusive because the consumer universe is intentionally incomplete.

---

## 29. Failures

Failures must be associated with the exact coverage dimension and scope they
affect.

Examples include:

- repository clone failure;
- workspace discovery failure;
- parser failure;
- analyzer timeout;
- malformed analyzer output;
- package installation failure;
- compiler unavailable;
- contract retrieval failure;
- telemetry query failure;
- resource exhaustion.

A failure must not disappear when an aggregate coverage status is calculated.

Aggregate explanations must include all blocking failures.

---

## 30. Unknown and undiscovered scope

DCAv2 must distinguish:

- known unavailable scope;
- known excluded scope;
- suspected but undiscovered scope;
- scope not required by policy.

Examples of undiscovered scope include:

- unresolved workspace patterns;
- dynamic package loading;
- unknown external consumers;
- repositories referenced through incomplete metadata;
- generated clients whose source cannot be located.

Unknown scope must not be converted into complete coverage.

---

## 31. Aggregate coverage

Aggregate coverage must be derived deterministically.

A parent scope may be `complete` only when:

- all required child scopes are known;
- every required child scope is `complete`;
- no blocking failure exists;
- no required scope is unsupported;
- no required scope is unavailable;
- no required scope is stale;
- all applicable conditional requirements were evaluated.

A parent scope must be `partial` when some relevant child coverage succeeded but
the complete requirement was not satisfied.

Aggregation rules must be versioned.

---

## 32. Coverage blockers

Coverage blockers prevent a conclusive absence-based classification.

Examples include:

- required repository unavailable;
- required workspace failed;
- required language unsupported;
- semantic analyzer failed;
- framework convention unresolved;
- external consumer universe unknown;
- required contract source unavailable;
- required runtime window incomplete;
- source snapshot stale;
- coverage policy changed;
- required gate unavailable.

Coverage blockers must be machine-readable and human-explainable.

---

## 33. Coverage and positive liveness

Positive liveness evidence may establish that code is live even when coverage is
incomplete.

For example, one exact production reference is sufficient to block dead-code
remediation without completing every absence-oriented search.

However, incomplete coverage must remain recorded.

Positive liveness evidence does not convert incomplete coverage into complete
coverage.

---

## 34. Coverage and candidate deadness

A `candidate_dead` classification requires the coverage profile to be satisfied.

At minimum:

- all required dimensions must be complete;
- no blocking failure may remain;
- no required scope may be unknown;
- evidence must be current;
- no positive liveness evidence may remain unresolved;
- no contradiction may remain unresolved.

When these conditions are not satisfied, the result must be `inconclusive`,
`failed`, `unsupported`, `stale`, or another applicable non-remediable state.

---

## 35. Coverage and public APIs

Public or externally consumable code requires stronger coverage.

Coverage profiles for public APIs should consider:

- publication status;
- supported package versions;
- internal consumers;
- external consumers;
- deprecation status;
- observation period;
- contract compatibility;
- documented extension points;
- customer usage visibility.

When the consumer universe cannot be bounded safely, coverage must remain
incomplete for conclusive deadness.

---

## 36. Coverage and dynamic behavior

Dynamic behavior may introduce conditional coverage requirements.

Relevant indicators include:

- reflection;
- dynamic imports;
- string-based invocation;
- decorators;
- dependency injection;
- plugin loading;
- convention-based entry points;
- generated code;
- runtime registration.

When dynamic behavior is detected but unsupported, the applicable coverage
dimension must be `unsupported` or `partial`.

It must not be ignored because static reference analysis completed.

---

## 37. Coverage freshness

Coverage must have an explicit freshness state.

Coverage becomes stale when relevant identity changes, including:

- repository commit;
- workspace configuration;
- package version;
- lockfile;
- analyzer version;
- adapter version;
- analyzer configuration;
- coverage profile;
- policy version;
- contract version;
- deployment version;
- runtime observation window.

Stale coverage may remain available for history and audit.

It must not support current remediation.

---

## 38. Coverage digest

Each classification should bind to a deterministic coverage digest.

The digest should include applicable:

- analysis epoch ID;
- coverage profile ID and version;
- repository identities;
- immutable commits;
- package and workspace identities;
- analyzer-run identities;
- coverage statuses;
- exclusions;
- failures;
- runtime windows;
- contract and infrastructure scopes;
- policy version.

Canonical ordering is required.

Equivalent coverage inputs must produce the same digest.

A changed coverage digest invalidates stale review or remediation authorization
unless an approved revalidation mechanism applies.

---

## 39. Coverage persistence

The preferred persistence model is relational and append-oriented.

Possible structures include:

- `analysis_epochs`;
- `coverage_profiles`;
- `coverage_records`;
- `coverage_requirements`;
- `coverage_relationships`;
- `coverage_failures`;
- `coverage_exclusions`;
- `coverage_digests`;
- `finding_coverage_links`.

Names are illustrative until implemented through an authorized phase.

A graph database is not required merely because coverage contains hierarchical
or graph relationships.

---

## 40. Coverage explanations

Every finding explanation should summarize coverage in human-readable form.

The explanation should state:

- coverage profile used;
- scopes completed;
- scopes incomplete;
- failures;
- exclusions;
- unsupported capabilities;
- unavailable repositories;
- runtime observation limitations;
- freshness;
- blockers;
- additional coverage required.

Avoid vague statements such as:

- coverage looks good;
- most files were analyzed;
- likely complete;
- sufficient confidence.

Use explicit dimensions and statuses.

---

## 41. Capability reporting

Coverage support must be reported separately from evidence-schema support.

For each capability, distinguish:

- coverage schema exists;
- scope discovery is implemented;
- execution is implemented;
- failure handling is implemented;
- aggregation is implemented;
- fixtures validate behavior;
- scale is validated.

A coverage table or enum alone does not constitute operational coverage support.

---

## 42. Testing requirements

Coverage-model tests should include:

- complete single-package coverage;
- partial file coverage;
- analyzer failure;
- analyzer timeout;
- unsupported language;
- unavailable repository;
- repository target-role exclusion;
- incomplete monorepo workspace coverage;
- cross-package coverage;
- cross-repository coverage;
- unknown external consumers;
- framework-triggered conditional coverage;
- contract coverage failure;
- runtime-window insufficiency;
- stale coverage;
- deterministic coverage digest;
- canonical ordering;
- aggregate status derivation;
- positive liveness with incomplete coverage;
- absence evidence blocked by incomplete coverage;
- tenant isolation.

Tests must verify that missing coverage cannot become complete through numeric
scoring or analyzer count.

---

## 43. Migration requirements

Coverage-model changes must use additive, ordered migrations.

Migration design must consider:

- historical coverage records;
- existing findings;
- prior coverage digests;
- nullable legacy fields;
- new coverage dimensions;
- renamed statuses;
- policy-version compatibility;
- tenant isolation;
- audit reconstruction.

Existing historical records must not be rewritten to imply that unavailable
coverage was complete.

---

## 44. Reporting requirements

Phase and capability reports should identify:

- coverage profiles implemented;
- coverage dimensions implemented;
- fixtures exercised;
- failures exercised;
- exclusions exercised;
- stale-state handling;
- unsupported dimensions;
- scale limitations;
- known blind spots.

A passing narrow fixture must not be reported as complete enterprise coverage.

---

## 45. Fail-safe behavior

When coverage cannot be established confidently:

- do not mark it complete;
- do not interpret missing references as proof of absence;
- do not authorize remediation;
- preserve successful partial results;
- record failures and exclusions;
- use `partial`, `failed`, `unsupported`, `unavailable`, `stale`, or `unknown`;
- explain what additional scope is required.

Coverage uncertainty must reduce remediation eligibility.

---

## 46. Model integrity

This document must not be modified during implementation unless architecture or
governance modification is explicitly authorized.

Changes require:

1. Identification of the coverage problem.
2. Review against the accuracy and evidence policy.
3. Review of classification impact.
4. Review of public-API and dynamic-behavior implications.
5. Migration planning.
6. Updated schemas.
7. Updated coverage fixtures.
8. Updated aggregate rules.
9. A reviewable architecture commit.
10. An ADR when the change alters long-lived coverage identity, digest, or
    completeness semantics.

The coverage model must not be weakened to increase finding counts, hide failed
analysis, or simplify remediation.
