# Phase 8 — Infrastructure and Runtime Evidence

This document defines the planned scope, capability boundaries, evidence
requirements, tests, stop conditions, and completion criteria for Phase 8 of
DCAv2.

Phase 8 introduces bounded infrastructure, deployment, and runtime evidence to
supplement static source, repository, package, and contract analysis.

Runtime non-observation must never be treated as proof that code is dead.

A symbol, endpoint, job, message consumer, infrastructure resource, or
configuration path may be live even when it is not observed during a limited
time window.

Runtime evidence is environment-specific, time-bounded, workload-dependent, and
subject to collection failure.

Infrastructure and runtime evidence may increase or reduce confidence, but they
must not bypass:

- repository authorization;
- coverage requirements;
- human disposition;
- remediation authorization;
- baseline and post-change verification;
- trusted publication controls.

This roadmap file does not authorize production access, infrastructure access,
credential use, telemetry collection, deployment modification, database
changes, remediation, publication, or destructive operations.

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
  id: phase-8-infrastructure-and-runtime
  name: Infrastructure and Runtime Evidence
  roadmap_order: 8
  default_status: inactive
  implementation_authorized_by_this_file: false
```

The phase becomes active only when the current authorization record explicitly
identifies `phase-8-infrastructure-and-runtime` as active.

---

## 2. Primary objective

The primary objective is to collect, normalize, and evaluate bounded evidence
from infrastructure, deployment, and runtime systems.

The phase should implement and validate applicable:

1. Environment identity.
2. Deployment identity.
3. Workload identity.
4. Infrastructure-resource identity.
5. Source-to-deployment mapping.
6. Artifact-to-deployment mapping.
7. Service-to-workload mapping.
8. Runtime observation windows.
9. Trace, metric, and log evidence.
10. Route and endpoint observations.
11. Scheduled-job observations.
12. Message-producer and consumer observations.
13. Feature-flag state.
14. Configuration and secret-reference metadata.
15. Infrastructure-as-code evidence.
16. Deployment-manifest evidence.
17. Runtime coverage.
18. Evidence freshness and retention.
19. Conservative runtime-aware classification.
20. Human disposition.
21. Separate remediation authorization.
22. Exact runtime-context reproduction.
23. Deployment-aware verification where authorized.
24. Trusted draft-only source publication.
25. Append-only audit and truthful reporting.

Phase 8 should remain evidence-focused.

Automatic deployment, infrastructure, database, queue, topic, gateway, or
production configuration changes remain outside the default scope.

---

## 3. Intended capability

The intended capability is conceptually:

```text
Associate supported source and contract findings with authorized deployment and
runtime observations, determine whether there is positive evidence of runtime
use, and preserve uncertainty whenever observation windows, environments,
workloads, telemetry, or deployment mappings are incomplete.
```

A runtime-aware finding may become stronger only when:

- source identity is exact;
- deployment identity is exact;
- artifact identity is exact;
- environment identity is exact;
- observation windows are explicit;
- telemetry collection is authorized;
- collection coverage is measurable;
- failures remain visible;
- non-observation is not overinterpreted;
- required static and contract coverage remains complete.

---

## 4. Phase prerequisites

Phase 8 should not begin until earlier phases have established or bounded:

- repository identity;
- immutable source snapshots;
- package and artifact identity;
- source-to-artifact mapping;
- service identity;
- contract identity;
- operation identity;
- producer and consumer relationships;
- generated-client relationships;
- open-world coverage;
- deterministic classification;
- human disposition;
- separate remediation authorization;
- exact finding reproduction;
- target and consumer verification;
- trusted publisher separation;
- additive database evolution;
- tenant isolation;
- capability reporting;
- security-control reporting.

Runtime evidence must extend these identities rather than create unrelated
parallel identities.

---

## 5. Non-goals

Phase 8 does not, by default, include:

- unrestricted production access;
- unrestricted cloud account enumeration;
- unrestricted Kubernetes access;
- unrestricted container access;
- unrestricted log search;
- unrestricted tracing access;
- unrestricted database access;
- packet capture;
- memory inspection;
- endpoint probing;
- synthetic production traffic;
- production command execution;
- production shell access;
- secret-value retrieval;
- customer-data inspection;
- automatic deployment changes;
- automatic infrastructure changes;
- automatic resource deletion;
- automatic queue or topic deletion;
- automatic database-schema changes;
- automatic feature-flag changes;
- automatic scaling changes;
- automatic traffic shifting;
- automatic rollback;
- automatic release creation;
- automatic endpoint removal;
- direct default-branch publication;
- pull-request merge;
- enterprise-scale campaign orchestration.

Production and destructive operations require separately defined capabilities
and explicit authorization.

---

## 6. Authorization prerequisites

The active Phase 8 authorization must identify applicable:

- tenant;
- cloud or infrastructure provider;
- account, subscription, or project;
- environment;
- cluster;
- namespace;
- service;
- workload;
- deployment;
- repository universe;
- service universe;
- telemetry systems;
- log systems;
- tracing systems;
- metric systems;
- feature-flag systems;
- infrastructure repositories;
- deployment repositories;
- permitted metadata operations;
- permitted telemetry reads;
- permitted configuration reads;
- prohibited data classes;
- credential capabilities;
- network destinations;
- observation windows;
- retention boundaries;
- remediation permission;
- deployment permission;
- infrastructure modification permission;
- publication permission;
- cleanup permission;
- destructive-operation permission;
- required tests;
- stop conditions;
- expiration or completion boundary.

Authorization to inspect repository source does not authorize runtime or
infrastructure access.

Authorization to read telemetry does not authorize deployment changes.

Missing permissions default to denial.

---

## 7. Required phase outputs

Phase 8 should produce applicable:

- environment identities;
- infrastructure-provider profiles;
- cluster and namespace identities;
- deployment identities;
- workload identities;
- infrastructure-resource identities;
- source-to-artifact mappings;
- artifact-to-deployment mappings;
- service-to-workload mappings;
- infrastructure-as-code evidence;
- deployment-manifest evidence;
- runtime observation records;
- trace evidence;
- metric evidence;
- log-derived evidence;
- endpoint observation evidence;
- job observation evidence;
- message-flow observation evidence;
- feature-flag evidence;
- runtime coverage profiles;
- runtime-aware classification profiles;
- exact reproduction rules;
- additive database migrations;
- audit events;
- phase test manifest;
- capability-matrix updates;
- security-control updates;
- phase-completion report;
- updated execution state.

---

## 8. Capability identifiers

Phase 8 should define or update capability identifiers such as:

```text
environment.identity.resolve.v1
infrastructure.provider.qualify.v1
infrastructure.resource.inventory.v1
deployment.identity.resolve.v1
deployment.artifact-map.v1
deployment.source-map.v1
service.workload-map.v1
runtime.observation-window.v1
runtime.trace-evidence.v1
runtime.metric-evidence.v1
runtime.log-evidence.v1
runtime.endpoint-observation.v1
runtime.job-observation.v1
runtime.message-flow-observation.v1
runtime.feature-flag-evidence.v1
coverage.runtime.environment.v1
classification.runtime-aware.v1
reproduction.runtime-context.v1
```

Provider- and system-specific identifiers should remain explicit.

Examples include:

```text
infrastructure.kubernetes.workload-inventory.v1
infrastructure.terraform.resource-evidence.v1
runtime.opentelemetry.trace-evidence.v1
runtime.prometheus.metric-evidence.v1
```

Every capability identifier must remain narrow, versioned, and testable.

---

## 9. Separate capability dimensions

DCAv2 must distinguish:

- detecting infrastructure configuration;
- identifying a deployment;
- mapping source to an artifact;
- mapping an artifact to a deployment;
- identifying a running workload;
- reading authorized telemetry;
- normalizing runtime observations;
- measuring runtime coverage;
- classifying a finding with runtime evidence;
- changing source;
- changing deployment state;
- changing infrastructure state.

Success in one dimension must not imply support in another.

A valid Kubernetes manifest parser does not establish safe cluster access.

A valid trace reader does not establish complete runtime coverage.

---

## 10. Qualification statuses

Infrastructure and runtime qualification should use explicit statuses such as:

- `ready`;
- `ready_with_limited_observation`;
- `configuration_required`;
- `partially_supported`;
- `detection_only`;
- `unsupported`;
- `inaccessible`;
- `failed`;
- `stale`;
- `security_blocked`;
- `authorization_rejected`;
- `production_access_denied`.

A system must not be reported as runtime-ready merely because telemetry
configuration exists.

---

## 11. `ready`

A runtime evidence profile is `ready` only when:

- environment identity is exact;
- infrastructure-system identity is exact;
- authorization is current;
- credentials are appropriately scoped;
- required source and artifact mappings are current;
- required deployment mappings are current;
- required telemetry systems are supported;
- observation windows are explicit;
- required retention is available;
- required data classes are permitted;
- required security controls are enforced;
- collection failures can be detected;
- runtime coverage can be evaluated;
- no required scope remains inaccessible, ambiguous, or unsupported.

`Ready` does not authorize remediation, deployment, infrastructure change, or
publication.

---

## 12. Environment identity

An environment identity should bind applicable:

- tenant;
- provider;
- account, subscription, or project;
- region;
- cluster;
- namespace;
- stage;
- environment name;
- environment type;
- service universe;
- identity source;
- authorization identity;
- environment digest.

Display names such as `prod`, `staging`, or `dev` are not globally unique.

Two providers may contain environments with the same name.

---

## 13. Environment types

Environment types may include:

- local;
- test;
- development;
- integration;
- staging;
- pre-production;
- production;
- disaster recovery;
- ephemeral preview;
- customer-specific;
- unknown.

Environment type should come from trusted configuration or authorized inventory.

Repository content must not declare an environment safe for access
authoritatively.

---

## 14. Production boundary

Production access is denied by default.

Production access requires:

- exact system identity;
- exact environment identity;
- explicit authorized operations;
- credential capability;
- data-class boundaries;
- time window;
- operator attribution;
- retention rules;
- stop conditions;
- audit requirements;
- review of possible customer-data exposure.

A broad statement such as `read production telemetry` is insufficient without
system and data boundaries.

---

## 15. Infrastructure-provider profiles

Each infrastructure provider profile should define:

- provider identity;
- supported API versions;
- supported resource types;
- authentication method;
- read operations;
- prohibited operations;
- pagination;
- rate limits;
- network destinations;
- data sensitivity;
- output schemas;
- failure behavior;
- test fixtures;
- capability status.

A provider plugin or SDK must not become mandatory without tool, license,
provenance, and security evaluation.

---

## 16. Infrastructure-resource identity

A resource identity should bind applicable:

- tenant;
- provider;
- account or project;
- region;
- resource type;
- provider resource ID;
- canonical name;
- environment;
- parent resource;
- configuration source;
- creation metadata;
- current version;
- identity digest.

Resource name alone is insufficient.

A deleted and recreated resource may require a new identity even when its name
is reused.

---

## 17. Resource inventory

Resource inventory may include supported:

- clusters;
- namespaces;
- workloads;
- services;
- ingress or gateway resources;
- jobs;
- schedulers;
- functions;
- queues;
- topics;
- databases as metadata only;
- storage resources;
- load balancers;
- serverless applications;
- feature-flag projects;
- telemetry collectors.

Inventory scope must remain authorization-bound.

An inaccessible resource must not be treated as nonexistent.

---

## 18. Inventory completeness

Infrastructure inventory should use statuses such as:

- `complete`;
- `partial`;
- `failed`;
- `unauthorized`;
- `rate_limited`;
- `stale`;
- `unsupported`;
- `unknown`.

Only `complete` may satisfy a required inventory dimension.

Partial pagination, provider failure, or permission filtering must remain
visible.

---

## 19. Infrastructure-as-code evidence

Infrastructure-as-code sources may provide evidence from:

- Terraform;
- CloudFormation;
- Kubernetes manifests;
- Helm values and templates;
- supported deployment configuration;
- serverless configuration;
- gateway configuration;
- scheduler configuration;
- queue and topic declarations.

Every profile must define:

- supported versions;
- parser;
- evaluation boundaries;
- variable handling;
- module handling;
- external reference handling;
- generated-plan handling;
- unsupported dynamic behavior.

---

## 20. Infrastructure configuration is untrusted

Infrastructure files are repository-controlled untrusted data.

They may describe:

- resource names;
- environments;
- routes;
- schedules;
- images;
- variables;
- secret references;
- providers;
- modules.

They must not:

- authorize provider access;
- choose trusted credentials;
- broaden network destinations;
- disable resource limits;
- approve production access;
- authorize infrastructure changes;
- create human disposition;
- authorize remediation;
- trigger publication.

---

## 21. Executable infrastructure configuration

Executable or dynamically evaluated infrastructure configuration must run only
inside the untrusted runner.

The trusted controller must not directly execute:

- Terraform providers;
- Helm plugins;
- template hooks;
- deployment scripts;
- custom generators;
- policy plugins;
- repository-defined helper programs.

The controller may consume only validated structured output.

---

## 22. Terraform evidence

A bounded Terraform profile may include:

- configuration inventory;
- module identity;
- resource identity;
- data-source identity;
- output identity;
- variable identity;
- dependency edges;
- provider declarations;
- plan artifacts from authorized test environments;
- source-to-resource mappings;
- known unsupported expressions.

Terraform configuration does not prove that a resource currently exists.

A plan does not prove deployment unless separately confirmed.

---

## 23. Terraform state

Terraform state may contain sensitive infrastructure and secret-derived
information.

State access requires explicit authorization.

DCAv2 must not:

- retrieve state by default;
- print raw state;
- persist raw secret values;
- expose resource attributes unnecessarily;
- modify state;
- perform state migration;
- unlock state;
- apply plans.

Metadata extracted from authorized state must remain bounded and redacted.

---

## 24. Kubernetes evidence

A bounded Kubernetes profile may include:

- cluster identity;
- namespace identity;
- deployment identity;
- stateful workload identity;
- daemon workload identity;
- job identity;
- scheduled-job identity;
- service identity;
- ingress identity;
- image identity;
- labels and annotations as untrusted metadata;
- configuration and secret references by name only;
- workload status where authorized.

Kubernetes access does not authorize pod execution or mutation.

---

## 25. Kubernetes manifest identity

A manifest identity should bind:

- repository;
- source commit;
- file path;
- document occurrence;
- API version;
- resource kind;
- namespace;
- name;
- content digest;
- generator identity where applicable;
- environment profile.

A resource name without namespace and cluster context is insufficient.

---

## 26. Helm evidence

A bounded Helm profile may include:

- chart identity;
- chart version;
- values identity;
- template identity;
- release metadata where authorized;
- rendered manifest identity;
- source commit;
- rendering tool version;
- environment-specific values;
- unsupported template functions.

Helm rendering must occur only in the runner.

Rendering does not authorize installation or upgrade.

---

## 27. Deployment identity

A deployment identity should bind applicable:

- environment;
- service;
- provider resource;
- deployment mechanism;
- artifact identity;
- source commit;
- configuration identity;
- release identity;
- start time;
- completion status;
- deployment digest.

A deployment name alone is insufficient.

A rolling deployment may contain several artifact versions simultaneously.

---

## 28. Workload identity

A workload identity may represent:

- containerized service;
- serverless function;
- scheduled job;
- batch job;
- worker;
- message consumer;
- gateway;
- migration job;
- one-off task.

The identity should bind:

- environment;
- service;
- resource identity;
- artifact identity;
- configuration identity;
- workload type;
- version;
- replica or instance scope;
- freshness.

---

## 29. Artifact-to-deployment mapping

Artifact-to-deployment mapping should retain:

- artifact identity;
- artifact digest;
- source repository;
- source commit;
- build identity;
- deployment identity;
- environment;
- rollout status;
- observed version;
- mapping source;
- confidence;
- freshness.

Tag names alone are insufficient when mutable tags are possible.

Digest-based identity should be preferred where available.

---

## 30. Source-to-deployment mapping

Source-to-deployment mapping may use:

- signed provenance;
- build metadata;
- artifact labels;
- deployment annotations;
- release records;
- trusted catalog mappings;
- immutable artifact digests;
- source revision embedded by an approved build.

An unverified version string or branch name must not establish an exact source
commit.

Ambiguous mappings must reduce runtime coverage.

---

## 31. Rolling deployments

A rolling deployment may expose several versions simultaneously.

The deployment model should retain:

- previous artifact;
- current artifact;
- rollout phase;
- replica distribution;
- canary percentage;
- rollback candidate;
- observation window;
- mapping confidence.

Runtime evidence from one version must not be attributed automatically to
another version.

---

## 32. Ephemeral workloads

Preview, test, batch, and short-lived workloads may disappear before inventory.

The profile should account for:

- expected lifetime;
- inventory timing;
- telemetry retention;
- source identity;
- artifact identity;
- completion state;
- relevance to the finding.

Absence from current inventory is not proof that the workload never executed.

---

## 33. Scheduled workloads

Scheduled workloads may be live despite low execution frequency.

The model should retain:

- scheduler identity;
- schedule expression;
- timezone;
- environment;
- workload target;
- source handler;
- last observed execution;
- next expected execution where authorized;
- suspension state;
- observation coverage.

A thirty-day observation window may be insufficient for a quarterly job.

---

## 34. Feature flags

Feature flags may affect whether code paths execute.

A feature-flag identity should bind:

- provider;
- project;
- environment;
- flag key;
- source configuration;
- variation set;
- rule set identity;
- evaluation scope;
- observation time;
- authorization;
- freshness.

Flag values may be sensitive.

DCAv2 should prefer metadata and bounded state over customer-level evaluations.

---

## 35. Feature-flag evidence

Feature-flag evidence may identify:

- flag referenced in source;
- environment-level default;
- enabled variation;
- disabled variation;
- scheduled change;
- stale flag;
- unknown targeting rules;
- unavailable customer segments;
- unsupported provider behavior.

A disabled flag in one environment does not prove globally dead code.

Unknown targeting rules must preserve uncertainty.

---

## 36. Configuration-reference metadata

Runtime configuration may refer to:

- handlers;
- modules;
- routes;
- jobs;
- topics;
- queues;
- feature flags;
- secrets;
- database objects;
- plugins;
- generated clients.

DCAv2 should record reference metadata without retrieving secret values unless
explicitly required and authorized.

Configuration identity and environment scope must remain explicit.

---

## 37. Secret references

A secret reference may provide evidence that a workload or feature is
configured.

The system may record:

- secret-provider identity;
- secret reference name;
- workload using the reference;
- environment;
- configuration occurrence;
- presence status where authorized;
- freshness.

It must not record the secret value.

Secret presence does not prove successful runtime use.

---

## 38. Runtime observation windows

Every runtime observation must have an explicit window.

The window should identify:

- start time;
- end time;
- timezone;
- collection system;
- environment;
- workload scope;
- expected workload patterns;
- known outages;
- sampling;
- retention;
- completeness status;
- window digest.

An observation without a bounded window must not support a reproducible
conclusion.

---

## 39. Observation-window adequacy

Window adequacy depends on the workload.

The profile should consider:

- request frequency;
- scheduled frequency;
- seasonal behavior;
- batch cycles;
- maintenance cycles;
- customer-specific use;
- retry patterns;
- failover patterns;
- deployment changes;
- feature-flag changes;
- telemetry outages.

A generic fixed window must not be assumed adequate for every workload.

---

## 40. Runtime evidence types

Potential runtime evidence types include:

- trace span;
- route invocation;
- handler invocation;
- metric increment;
- log event;
- job execution;
- message production;
- message consumption;
- feature-flag evaluation;
- plugin load;
- command invocation;
- deployment start;
- workload health signal;
- generated-client call observation.

Every type must have explicit semantics and limitations.

---

## 41. Positive and negative runtime evidence

Positive runtime evidence may establish that a target was used during an
observation window.

Non-observation may mean:

- the target was unused;
- traffic did not reach it;
- the observation window was too short;
- telemetry was sampled;
- instrumentation was missing;
- logging was disabled;
- the workload was not deployed;
- the environment was inactive;
- collection failed;
- data expired;
- a different version was running.

Non-observation must not become authoritative deadness without a narrowly
defined, tested profile.

---

## 42. Trace evidence

Trace evidence should retain applicable:

- trace system;
- environment;
- service;
- workload;
- artifact version;
- source commit mapping;
- operation;
- span name;
- span kind;
- time window;
- sampling configuration;
- trace count;
- error status;
- attribute allowlist;
- collection completeness;
- freshness.

Raw traces may contain sensitive data and should not be retained unnecessarily.

---

## 43. Trace sampling

Sampling reduces absence confidence.

The trace profile should identify:

- head or tail sampling;
- sampling rate;
- adaptive behavior;
- dropped spans;
- service-specific configuration;
- known exclusions;
- collector failures;
- observation-window impact.

A sampled system cannot establish complete absence merely because no span was
observed.

---

## 44. Trace-to-source mapping

Trace-to-source mapping may use:

- operation identity;
- route identity;
- service name;
- artifact version;
- source metadata;
- instrumentation metadata;
- generated code mappings;
- framework adapters.

Span-name matching alone is insufficient.

Ambiguous mapping must remain supporting or inconclusive evidence.

---

## 45. Metric evidence

Metric evidence should retain applicable:

- metric system;
- metric identity;
- environment;
- service;
- workload;
- labels selected through an allowlist;
- counter or gauge semantics;
- aggregation;
- time window;
- scrape or collection interval;
- missing-data behavior;
- retention;
- freshness.

Metrics may be aggregated too coarsely for symbol-level conclusions.

---

## 46. Metric absence

No metric samples may mean:

- no activity;
- target not instrumented;
- exporter failure;
- scrape failure;
- label mismatch;
- retention expiry;
- workload absence;
- permission filtering;
- unsupported environment.

Metric absence must remain inconclusive unless the profile proves collection
completeness for the target.

---

## 47. Log evidence

Log evidence may provide positive use evidence when a log event maps reliably
to a source operation or workload.

The record should retain:

- log system;
- environment;
- service;
- workload;
- artifact version;
- event identity;
- source mapping;
- observation window;
- query identity;
- result count;
- retention;
- truncation;
- redaction;
- freshness.

Raw log bodies should not be stored by default.

---

## 48. Log-query safety

Log queries must be bounded by:

- system;
- environment;
- time window;
- service;
- approved fields;
- maximum results;
- timeout;
- data-class policy;
- redaction rules.

DCAv2 must not perform unrestricted full-environment log searches.

Repository text must not construct trusted log queries automatically.

---

## 49. Endpoint observations

Endpoint observations may derive from:

- traces;
- access metrics;
- gateway metrics;
- bounded access logs;
- synthetic test environments;
- framework instrumentation.

An endpoint observation should bind:

- contract operation;
- environment;
- service;
- deployment;
- artifact version;
- time window;
- observation source;
- request count or positive occurrence;
- sampling and retention limits.

No observed requests does not prove endpoint retirement.

---

## 50. Message-flow observations

Message-flow evidence may include:

- producer send;
- broker ingress;
- consumer receipt;
- consumer acknowledgement;
- dead-letter event;
- retry;
- replay;
- schema version;
- consumer group;
- environment;
- observation window.

Broker metadata and message payload access require separate authorization.

Payload contents should not be inspected unless explicitly necessary and
permitted.

---

## 51. Message absence

No observed message flow may result from:

- low event frequency;
- seasonal workflows;
- telemetry gaps;
- producer inactivity;
- consumer inactivity;
- alternate broker path;
- retained replay-only behavior;
- sampling;
- unsupported instrumentation.

Message non-observation must preserve uncertainty.

---

## 52. Job observations

Job observation evidence should retain:

- job identity;
- scheduler identity;
- environment;
- source handler;
- artifact version;
- scheduled time;
- actual execution time;
- result status;
- observation source;
- observation window;
- missed-run handling;
- retention;
- freshness.

A job may be live even when it has not executed during the selected window.

---

## 53. Runtime errors as evidence

Errors may indicate that code paths are invoked.

An error record should retain:

- environment;
- service;
- artifact version;
- operation;
- exception or error type;
- bounded diagnostic identity;
- observation window;
- mapping confidence;
- redaction status.

DCAv2 must not expose full stack traces or customer data unnecessarily.

An error does not authorize source modification automatically.

---

## 54. Health and readiness signals

Health and readiness signals may show that a workload is active.

They do not prove use of every operation or symbol inside the workload.

Health evidence should remain workload-level unless exact operation mapping is
available.

A healthy service may still contain dead code.

An unhealthy service may still contain live code.

---

## 55. Runtime version diversity

Several versions may run concurrently because of:

- rolling deployment;
- canary;
- blue-green deployment;
- regional rollout;
- customer-specific deployment;
- rollback;
- long-running jobs;
- stale instances.

Runtime evidence must be attributed to the exact artifact or version where
possible.

Unattributed observations must not be assigned to the target source commit
authoritatively.

---

## 56. Runtime evidence model

Runtime evidence should retain applicable:

- tenant;
- environment;
- provider;
- service;
- workload;
- deployment;
- artifact identity;
- source repository;
- source commit;
- target finding;
- observation type;
- observation source;
- observation window;
- positive or non-observation status;
- sampling;
- retention;
- collection status;
- mapping confidence;
- ambiguity;
- producer version;
- adapter version;
- raw artifact digest;
- freshness.

Evidence must remain attributable and bounded.

---

## 57. Evidence polarity

Runtime evidence may be:

- positive liveness;
- supporting deployment evidence;
- non-observation;
- ambiguous;
- contradictory;
- unavailable;
- unsupported;
- failed;
- stale.

Positive exact runtime evidence must dominate static absence evidence.

Non-observation must not dominate positive static or contract evidence.

---

## 58. Evidence freshness

Runtime evidence becomes stale when applicable:

- source commit changes;
- artifact changes;
- deployment changes;
- workload identity changes;
- environment changes;
- telemetry configuration changes;
- observation window expires;
- retention changes;
- mapping rules change;
- adapter semantics change;
- feature-flag rules change;
- service ownership changes.

Stale runtime evidence must not satisfy remediation prerequisites.

---

## 59. Contradictory evidence

Contradictory evidence must remain visible.

Examples include:

- static analysis reports no references;
- contract analysis exposes an endpoint;
- traces show current use;
- logs show historical use;
- metrics show no current traffic;
- a feature flag disables one environment;
- another environment remains unobserved;
- a stale deployment still runs an older version.

Tool count must not act as majority voting.

Positive current liveness evidence must dominate absence and non-observation
evidence.

---

## 60. Runtime coverage profile

A runtime coverage profile should define required dimensions such as:

- environment identity;
- infrastructure inventory;
- deployment inventory;
- source-to-artifact mapping;
- artifact-to-deployment mapping;
- service-to-workload mapping;
- observation-window adequacy;
- trace coverage;
- metric coverage;
- log coverage;
- endpoint coverage;
- job coverage;
- message-flow coverage;
- feature-flag coverage;
- environment coverage;
- version coverage;
- telemetry outage accounting;
- retention coverage;
- sampling coverage;
- freshness.

Every dimension must have an explicit status.

---

## 61. Coverage statuses

Runtime coverage should use statuses such as:

- `complete`;
- `partial`;
- `failed`;
- `unsupported`;
- `unavailable`;
- `unauthorized`;
- `excluded`;
- `stale`;
- `not_applicable`;
- `unknown`;
- `sampling_limited`;
- `retention_limited`;
- `observation_window_insufficient`.

Only `complete` may satisfy a required runtime dimension.

---

## 62. Environment coverage

Environment coverage should identify:

- required environments;
- observed environments;
- inaccessible environments;
- unauthorized environments;
- unsupported environments;
- inactive environments;
- environment-specific versions;
- feature-flag differences;
- telemetry differences;
- completion status.

Coverage of staging must not be described as production coverage.

---

## 63. Deployment coverage

Deployment coverage should identify:

- expected deployments;
- observed deployments;
- artifact versions;
- rollout state;
- stale deployments;
- unknown deployments;
- uninstrumented deployments;
- completed deployments;
- deployment failures;
- completion status.

An uninstrumented deployment must remain a coverage limitation.

---

## 64. Observation coverage

Observation coverage should identify:

- required workload cycles;
- actual observation window;
- sampling;
- telemetry outages;
- missing data;
- retention limits;
- low-frequency operations;
- seasonal operations;
- expected request volume;
- completion status.

A long window is not automatically complete when instrumentation is partial.

---

## 65. Runtime coverage digest

A deterministic runtime coverage digest should bind applicable:

- environment identities;
- infrastructure inventory digest;
- deployment identities;
- artifact identities;
- source mappings;
- workload mappings;
- observation windows;
- telemetry-system identities;
- sampling configuration;
- retention boundaries;
- feature-flag identities;
- failed and inaccessible scope;
- coverage statuses;
- adapter identities.

Changing any required input must invalidate the digest.

---

## 66. Open-world runtime behavior

Runtime evidence is open-world by default.

Unknown scope may include:

- uninstrumented services;
- unobserved environments;
- customer-specific deployments;
- offline clients;
- low-frequency jobs;
- seasonal workflows;
- disaster-recovery systems;
- retained messages;
- replayed events;
- manual operations;
- external callers;
- private integrations;
- feature-flag segments;
- historical deployments;
- telemetry outages.

Unknown relevant runtime scope must prevent unsafe dead-code conclusions.

---

## 67. Runtime-aware classification

Runtime evidence should refine, not replace, existing classification.

A finding must become `live` when exact current positive runtime evidence maps to
the target under a supported profile.

A finding may remain:

- `candidate_dead`;
- `inconclusive`;
- `detection_only`;
- `runtime_observed_live`;
- `runtime_scope_incomplete`;
- `unsupported`;
- `failed`;
- `stale`;
- `access_blocked`.

Runtime non-observation alone should not produce `candidate_dead`.

---

## 68. Classification prerequisites

A runtime-aware `candidate_dead` result requires:

- complete required static coverage;
- complete required contract coverage;
- complete repository and consumer coverage;
- current source identity;
- current artifact identity;
- current deployment mappings;
- complete required environment coverage;
- adequate observation windows;
- complete required telemetry coverage;
- no positive runtime evidence;
- no unresolved external consumer scope;
- no unresolved feature-flag scope;
- no unobserved historical or low-frequency workload required by the profile;
- deterministic policy evaluation.

This should remain a rare, narrowly defined profile.

---

## 69. Runtime-aware explanation

A runtime-aware explanation should include:

- target repository;
- source commit;
- target finding;
- service;
- contract operation where applicable;
- artifact identity;
- deployments;
- environments;
- workloads;
- observation windows;
- trace evidence;
- metric evidence;
- log evidence;
- endpoint evidence;
- job evidence;
- message-flow evidence;
- feature-flag evidence;
- sampling limitations;
- retention limitations;
- telemetry outages;
- unobserved scope;
- runtime coverage digest;
- static and contract coverage digests;
- policy version;
- resulting status.

The explanation must make non-observation limitations visible.

---

## 70. Human disposition

Human disposition remains separate from runtime-aware classification.

A disposition should bind to:

- finding ID;
- repository;
- source commit;
- artifact identity;
- service;
- environment set;
- deployment set;
- observation-window set;
- static evidence digest;
- contract evidence digest;
- runtime evidence digest;
- static coverage digest;
- contract coverage digest;
- runtime coverage digest;
- classification identity;
- human actor;
- timestamp.

A material runtime, deployment, artifact, or coverage change may make the
disposition stale.

---

## 71. Remediation authorization

Remediation authorization must remain separate and should bind to:

- authorization ID;
- finding ID;
- target repository;
- target commit;
- service identity;
- artifact identity;
- environment scope;
- deployment scope;
- observation-window scope;
- evidence digests;
- coverage digests;
- human disposition;
- transformation ID;
- permitted source files;
- required target gates;
- required consumer gates;
- required deployment-aware checks;
- publication permission;
- expiration or completion boundary;
- human authorizer.

Runtime evidence must not create remediation authority automatically.

---

## 72. Default remediation boundary

Phase 8 should default to:

- runtime evidence collection;
- runtime-aware explanation;
- runtime-aware classification refinement;
- source-only remediation under earlier language profiles;
- no infrastructure changes;
- no deployment changes;
- no feature-flag changes;
- no gateway changes;
- no queue or topic changes;
- no database changes;
- no production traffic changes.

Runtime evidence may block remediation when positive use or incomplete coverage
appears.

---

## 73. Exact runtime-context reproduction

Before runtime-informed source remediation, DCAv2 must reproduce:

- repository identity;
- source commit;
- finding identity;
- service identity;
- artifact identity;
- source-to-artifact mapping;
- deployment identities;
- workload identities;
- environment set;
- observation windows;
- telemetry-system identities;
- feature-flag identities where required;
- runtime evidence digest;
- runtime coverage digest;
- static and contract evidence digests;
- human disposition;
- remediation authorization.

Any material mismatch must block transformation.

---

## 74. Reproduction failure

Reproduction must fail when applicable:

- source changed;
- artifact changed;
- deployment changed;
- a new environment appeared;
- an old version remains deployed;
- observation window expired;
- telemetry configuration changed;
- sampling changed;
- retention changed;
- feature-flag rules changed;
- new positive runtime evidence appeared;
- runtime coverage became partial;
- authorization expired;
- disposition became stale.

Approximate reuse of prior runtime evidence must not proceed.

---

## 75. Target baseline gates

Target baseline gates should continue to follow the selected language,
framework, repository, and contract profiles.

Runtime-aware remediation may additionally require:

- artifact build;
- source-to-artifact provenance generation;
- deployment-manifest validation;
- contract validation;
- instrumentation validation;
- telemetry mapping validation.

Every required gate must pass or satisfy an explicitly authorized
pre-existing-failure policy.

---

## 76. Deployment-aware verification

Deployment-aware verification may include authorized non-production checks such
as:

- deploy candidate to an isolated test environment;
- verify artifact identity;
- run health checks;
- run contract tests;
- run synthetic local or test traffic;
- confirm telemetry instrumentation;
- compare candidate traces or metrics;
- confirm scheduled-job registration;
- confirm message consumer registration.

Such verification requires separate environment and operation authorization.

---

## 77. Production deployment prohibition

Phase 8 source remediation must not automatically:

- deploy to production;
- change production replicas;
- alter production traffic;
- update production images;
- restart production workloads;
- change feature flags;
- update gateways;
- update brokers;
- run migrations;
- execute production tests.

A source patch and draft pull request are not deployment authorization.

---

## 78. Candidate artifact verification

A candidate artifact may be built in the untrusted runner.

The record should identify:

- patched source commit or digest;
- build command;
- build toolchain;
- artifact digest;
- source provenance;
- contract artifact;
- instrumentation identity;
- secret-scan result;
- retention policy.

Building a candidate artifact does not authorize registry publication or
deployment.

---

## 79. Test deployment identity

An authorized test deployment should bind:

- test environment;
- artifact digest;
- source digest;
- deployment configuration;
- service identity;
- workload identity;
- start time;
- end time;
- test data;
- credentials;
- network profile;
- cleanup status.

Test deployment identity must remain distinct from production deployment
identity.

---

## 80. Test telemetry

Test telemetry may verify:

- source-to-runtime mapping;
- instrumentation;
- operation invocation;
- scheduled-job registration;
- message flow;
- candidate behavior.

It does not prove production consumer coverage.

The report must distinguish test evidence from production evidence.

---

## 81. Structured transformation

Source transformation must continue to use the selected language and framework
profile.

The transformation must bind to:

- target repository;
- target commit;
- target finding;
- source occurrence;
- transformation version;
- expected rewrite count;
- permitted files;
- static coverage digest;
- contract coverage digest;
- runtime coverage digest;
- runtime-context identity.

The transformation must not modify infrastructure or deployment files unless
separately authorized.

---

## 82. Infrastructure-file changes

Infrastructure-file changes are outside the default runtime-aware source
remediation profile.

Any future infrastructure transformation requires:

- exact resource identity;
- exact environment;
- exact configuration occurrence;
- explicit changed-file scope;
- infrastructure-specific tests;
- plan or preview validation;
- human review;
- separate authorization;
- no automatic apply;
- trusted source publication only.

A source-finding authorization must not permit infrastructure edits.

---

## 83. Changed-file validation

Changed-file validation must include applicable:

- source files;
- contract files;
- deployment manifests;
- infrastructure files;
- feature-flag configuration;
- gateway configuration;
- package manifests;
- lockfiles;
- generated artifacts;
- file modes;
- symbolic links;
- binary files.

Any file outside the explicit authorization must cause failure.

---

## 84. Post-change gates

Post-change verification should rerun applicable:

- parsing;
- type checking;
- compilation;
- build;
- tests;
- contract validation;
- generated-artifact validation;
- artifact-provenance generation;
- deployment-manifest validation;
- test-deployment checks;
- test telemetry checks;
- changed-file validation;
- patch determinism;
- secret scanning.

Every required gate must pass.

---

## 85. Patch generation

The patch record should include runtime-specific identity such as:

- target repository;
- base commit;
- service identity;
- artifact identity;
- environment scope;
- deployment scope;
- observation-window set;
- static evidence digest;
- contract evidence digest;
- runtime evidence digest;
- static coverage digest;
- contract coverage digest;
- runtime coverage digest;
- target gate results;
- test deployment results where applicable;
- transformation ID;
- changed files;
- patch hash;
- secret-scan result.

Patch generation does not authorize publication or deployment.

---

## 86. Trusted publication

When separately authorized, source publication must continue through the
trusted publisher.

The publisher must validate:

- target repository identity;
- prohibited-repository policy;
- base commit;
- finding identity;
- human disposition;
- remediation authorization;
- runtime-context identity;
- evidence and coverage digests;
- required target gates;
- required deployment-aware test gates;
- patch hash;
- changed-file set;
- branch policy;
- draft-only operation;
- idempotency identity.

The publisher must not:

- access production telemetry;
- build artifacts;
- deploy workloads;
- run infrastructure tools;
- change feature flags;
- modify gateways;
- execute repository code.

---

## 87. Infrastructure and deployment publication

Applying infrastructure or deployment changes is outside the default Phase 8
scope.

DCAv2 must not:

- apply Terraform;
- deploy Helm releases;
- apply Kubernetes manifests;
- update serverless deployments;
- modify cloud resources;
- publish production images;
- shift traffic;
- restart workloads;
- change autoscaling;
- update feature flags;
- modify production gateways;

without separately defined and explicitly authorized capabilities.

---

## 88. Database evolution

Phase 8 may persist concepts such as:

- environment identities;
- infrastructure-provider identities;
- infrastructure resources;
- deployment identities;
- workload identities;
- source-to-artifact mappings;
- artifact-to-deployment mappings;
- observation windows;
- trace evidence;
- metric evidence;
- log evidence;
- endpoint observations;
- job observations;
- message-flow observations;
- feature-flag evidence;
- runtime coverage;
- runtime-context reproduction;
- test-deployment results.

Persistence changes must use additive ordered migrations.

Historical static and contract findings must remain interpretable.

---

## 89. Migration compatibility

Migration testing should include:

- fresh installation;
- upgrade from the Phase 7 schema;
- existing repository universes;
- existing service universes;
- environment identities;
- infrastructure-resource identities;
- deployment identities;
- workload identities;
- observation windows;
- runtime evidence;
- partial telemetry records;
- stale deployment mappings;
- runtime coverage;
- multiple tenants;
- migration failure;
- retry;
- projection rebuild;
- audit preservation.

Existing migrations must not be rewritten.

---

## 90. Audit requirements

Phase 8 should produce audit events for applicable:

- environment proposed;
- environment authorized;
- infrastructure inventory started;
- infrastructure inventory completed;
- infrastructure inventory partial;
- resource discovered;
- deployment discovered;
- workload discovered;
- artifact mapping created;
- artifact mapping rejected;
- observation window created;
- trace collection started;
- trace collection completed;
- trace collection failed;
- metric collection completed;
- log query completed;
- endpoint observation recorded;
- job observation recorded;
- message-flow observation recorded;
- feature-flag evidence recorded;
- runtime coverage completed;
- runtime coverage partial;
- runtime-aware classification completed;
- human disposition recorded;
- remediation authorized;
- runtime context reproduced;
- target gate completed;
- test deployment completed;
- transformation completed;
- unexpected file rejected;
- patch created;
- source publication requested;
- cleanup completed;
- cleanup failed.

Audit events must remain tenant-scoped and secret-free.

---

## 91. Tenant isolation

Infrastructure and runtime data must be tenant-scoped.

One tenant must not access another tenant's:

- environment inventory;
- resource inventory;
- deployment identities;
- workload identities;
- telemetry;
- log metadata;
- traces;
- metrics;
- feature-flag data;
- service mappings;
- findings;
- credentials;
- authorization;
- patches;
- test deployments.

Shared public infrastructure metadata must still retain source and access
classification.

---

## 92. Credential boundaries

Credential capabilities may include:

- provider metadata-read credential;
- cluster metadata-read credential;
- telemetry-read credential;
- log-read credential;
- metric-read credential;
- trace-read credential;
- test feature-flag read credential;
- test deployment credential;
- controller database credential;
- trusted publisher credential.

The runner or collector may receive only the minimum explicitly authorized
capability for one stage.

It must never receive:

- trusted publisher credentials;
- controller database credentials;
- unrestricted infrastructure administrative credentials;
- production shell credentials;
- production database credentials;
- secret-store read-all credentials;
- unrelated cloud credentials;
- customer credentials.

---

## 93. Read-only enforcement

Read-only infrastructure and telemetry operations should be enforced through:

- scoped provider roles;
- API method allowlists;
- network destination allowlists;
- command registries;
- separate credentials;
- environment policy;
- audit checks;
- negative tests.

A tool's nominal `read` mode is insufficient when the credential itself permits
writes.

---

## 94. Telemetry data minimization

DCAv2 should collect the minimum telemetry needed to support the finding.

Prefer:

- counts;
- operation identities;
- timestamps;
- artifact versions;
- bounded labels;
- collection status;
- sampling information;
- retention metadata.

Avoid:

- request bodies;
- response bodies;
- message payloads;
- customer identifiers;
- user identifiers;
- full stack traces;
- unrestricted log text;
- secret-bearing attributes.

---

## 95. Personally identifiable information

Telemetry may contain personal or customer information.

The profile must define:

- prohibited fields;
- permitted fields;
- redaction rules;
- aggregation requirements;
- retention;
- access controls;
- audit requirements;
- incident handling.

When safe collection cannot be guaranteed, runtime evidence collection must
stop.

---

## 96. Network profiles

Phase 8 should use separate network profiles for applicable stages:

- provider metadata inventory;
- cluster metadata inventory;
- authorized telemetry reads;
- authorized log reads;
- authorized metric reads;
- authorized trace reads;
- network-disabled infrastructure parsing;
- network-disabled evidence normalization;
- isolated test-environment deployment;
- provider-publish-only trusted source publication.

Repository content must not broaden these profiles.

---

## 97. Collector architecture

Runtime collection should use narrowly scoped collectors.

A collector should define:

- collector ID;
- version;
- supported system;
- supported API;
- permitted operations;
- input schema;
- output schema;
- pagination;
- rate limits;
- timeouts;
- result limits;
- redaction;
- failure behavior;
- credential capability;
- network profile.

Collectors must not execute instructions found in telemetry data.

---

## 98. Collector failures

Collector failure must remain explicit.

Possible statuses include:

- `success`;
- `partial`;
- `unauthorized`;
- `rate_limited`;
- `timed_out`;
- `failed`;
- `unsupported`;
- `stale`;
- `redaction_failed`;
- `data_policy_blocked`.

A failed collector must not produce an empty successful observation set.

---

## 99. Pagination and rate limits

Every paginated collection operation must preserve:

- page identity;
- continuation state;
- items received;
- duplicate detection;
- completion status;
- rate-limit status;
- retry state;
- affected coverage.

A first page or truncated response must not be treated as complete telemetry.

---

## 100. Runner requirements

Infrastructure parsers, repository-defined generators, test deployments,
application tests, and local telemetry systems must run in approved untrusted
runner profiles.

The profiles must enforce applicable:

- non-root execution;
- no privileged mode;
- no Docker socket;
- no trusted credentials;
- explicit environment allowlist;
- repository-specific mounts;
- no uncontrolled infrastructure credentials;
- approved cache mounts;
- bounded network access;
- CPU limits;
- memory limits;
- process limits;
- disk limits;
- output limits;
- timeouts;
- process-tree cleanup;
- local-service cleanup;
- workspace cleanup.

Infrastructure-provider administrative credentials must not enter the
untrusted runner by default.

---

## 101. Test environments

Phase 8 should prefer isolated test environments.

A test environment should define:

- provider or local system;
- environment identity;
- isolation boundary;
- synthetic data;
- synthetic credentials;
- network restrictions;
- resource limits;
- startup behavior;
- health checks;
- observation systems;
- shutdown behavior;
- cleanup;
- cost limits;
- expiration.

A test-environment failure must not trigger production fallback.

---

## 102. Cost controls

Infrastructure and telemetry operations may incur cost.

The authorization should identify applicable:

- maximum resource count;
- maximum runtime;
- maximum storage;
- maximum telemetry query volume;
- maximum log scan volume;
- maximum test-environment lifetime;
- maximum concurrent workers;
- maximum estimated spend.

Exceeding a cost boundary must stop the operation.

DCAv2 must not create paid resources without explicit authorization.

---

## 103. Prompt-injection resistance

Instructions found in:

- infrastructure labels;
- resource annotations;
- log messages;
- trace attributes;
- metric labels;
- contract descriptions;
- deployment metadata;
- feature-flag descriptions;
- configuration comments;
- provider metadata;
- error messages;

must remain untrusted data.

They must not:

- broaden infrastructure scope;
- authorize production access;
- select credentials;
- change network destinations;
- disable redaction;
- mark incomplete telemetry complete;
- convert non-observation into deadness;
- create human disposition;
- authorize remediation;
- trigger deployment;
- trigger infrastructure changes;
- trigger publication;
- modify governance.

---

## 104. Secret handling

Infrastructure and runtime systems may expose secrets through:

- provider responses;
- environment variables;
- deployment configuration;
- secret references;
- logs;
- traces;
- metric labels;
- error messages;
- resource annotations;
- gateway configuration;
- test artifacts;
- patches;
- pull-request text;
- audit events.

DCAv2 must:

- avoid retrieving secret values;
- redact credential-bearing URLs;
- avoid full environment dumps;
- avoid full resource dumps;
- bound outputs;
- scan exported artifacts;
- remove temporary credentials;
- record credential capability rather than value;
- stop when redaction cannot be guaranteed.

---

## 105. Phase 8 test manifest

Phase 8 should receive a dedicated test manifest such as:

`codex/tests/phase-8-tests.yaml`

If introduced, the file must conform to:

`codex/tests/phase-test-manifest.schema.json`

The manifest must identify concrete required and conditional test IDs.

The phrase “run relevant tests” is insufficient.

---

## 106. Minimum environment-identity tests

Environment tests should cover:

- test environment;
- staging environment;
- production environment denied by default;
- duplicate environment names across accounts;
- duplicate cluster names across providers;
- environment rename;
- stale environment record;
- unknown environment;
- authorization mismatch;
- deterministic environment digest;
- tenant isolation.

---

## 107. Minimum infrastructure-inventory tests

Inventory tests should cover:

- complete authorized inventory;
- partial pagination;
- provider rate limiting;
- inaccessible resource;
- unsupported resource type;
- resource deleted during inventory;
- resource recreated with same name;
- archived environment;
- malformed provider response;
- oversized response;
- production scope denied;
- prohibited operation rejected.

---

## 108. Minimum source-to-deployment tests

Mapping tests should cover:

- exact source commit to artifact digest;
- exact artifact digest to deployment;
- mutable image tag;
- tag changed after analysis;
- several source commits in one deployment;
- rolling deployment;
- canary deployment;
- stale instance;
- missing provenance;
- conflicting provenance;
- repository renamed;
- artifact rebuilt from same source;
- deterministic mapping digest.

---

## 109. Minimum infrastructure-as-code tests

Infrastructure tests should cover:

- supported static configuration;
- several modules;
- external module reference;
- unresolved variable;
- unsupported dynamic expression;
- generated plan;
- stale plan;
- secret reference;
- provider declaration;
- resource rename;
- symbolic-link escape;
- executable helper;
- repository content attempting to authorize production access.

---

## 110. Minimum Kubernetes tests

When included, tests should cover:

- cluster identity;
- namespace identity;
- deployment;
- stateful workload;
- job;
- scheduled job;
- service;
- ingress;
- image digest;
- mutable image tag;
- several versions running;
- secret reference by name;
- pod execution denied;
- write operation denied;
- partial namespace access;
- stale workload inventory.

---

## 111. Minimum observation-window tests

Observation-window tests should cover:

- adequate high-frequency window;
- inadequate low-frequency window;
- scheduled job outside the window;
- seasonal workload;
- telemetry outage;
- sampling change;
- retention expiry;
- deployment change during window;
- feature-flag change during window;
- timezone handling;
- invalid window;
- deterministic window digest.

---

## 112. Minimum trace tests

Trace tests should cover:

- exact operation observation;
- exact handler observation;
- sampled trace;
- missing instrumentation;
- collector outage;
- wrong artifact version;
- ambiguous span name;
- several services with same operation name;
- redacted sensitive attribute;
- oversized trace response;
- partial pagination;
- no observed trace under incomplete coverage.

---

## 113. Minimum metric tests

Metric tests should cover:

- positive request counter;
- positive job counter;
- missing scrape;
- stale series;
- wrong label mapping;
- high-cardinality label rejection;
- aggregated metric too coarse for symbol mapping;
- retention expiry;
- counter reset;
- uninstrumented deployment;
- no samples under incomplete coverage;
- bounded query enforcement.

---

## 114. Minimum log tests

Log tests should cover:

- positive bounded event;
- exact operation mapping;
- ambiguous text match;
- comment or message containing symbol name;
- redacted synthetic secret;
- customer-data field rejection;
- query timeout;
- result limit;
- retention expiry;
- inaccessible log index;
- partial result;
- repository-derived query injection rejected.

---

## 115. Minimum endpoint-observation tests

Endpoint tests should cover:

- observed internal endpoint;
- observed public endpoint;
- gateway-only observation;
- trace-only observation;
- no observation with complete test coverage;
- no observation with sampled production telemetry;
- old version observed;
- new version unobserved;
- canary version observed;
- feature-flagged endpoint;
- low-frequency endpoint;
- external consumer uncertainty.

---

## 116. Minimum job-observation tests

Job tests should cover:

- frequent job observed;
- monthly job outside the window;
- suspended job;
- failed job;
- retried job;
- one-off job;
- old artifact version;
- scheduler configuration without runtime observation;
- runtime observation without current source mapping;
- timezone difference;
- missed-run handling;
- retention-limited history.

---

## 117. Minimum message-flow tests

Message tests should cover:

- producer observed;
- consumer observed;
- acknowledgement observed;
- retry observed;
- dead-letter observed;
- replay-only event;
- low-frequency event;
- dynamic topic;
- sampled telemetry;
- payload access denied;
- schema version mismatch;
- uninstrumented consumer;
- no observation with incomplete broker coverage.

---

## 118. Minimum feature-flag tests

Feature-flag tests should cover:

- enabled in one environment;
- disabled in another environment;
- unknown targeting rules;
- scheduled flag change;
- stale flag data;
- inaccessible provider;
- customer-level evaluation prohibited;
- source reference without runtime state;
- runtime state without exact source mapping;
- flag removed after analysis;
- flag renamed;
- synthetic secret redaction.

---

## 119. Minimum runtime-coverage tests

Coverage tests should cover:

- complete bounded test environment;
- production environment unauthorized;
- missing deployment mapping;
- old version still deployed;
- uninstrumented workload;
- sampled traces;
- missing metrics;
- inaccessible logs;
- insufficient observation window;
- retention-limited history;
- low-frequency job;
- unknown external consumers;
- feature-flag scope incomplete;
- new deployment added after analysis;
- telemetry configuration changed.

Complete coverage must require every relevant dimension.

---

## 120. Minimum classification tests

Classification tests should verify:

- exact positive runtime evidence produces live status;
- exact endpoint observation produces live status;
- exact job execution produces live status;
- exact message consumption produces live status;
- static absence plus runtime non-observation remains inconclusive when coverage
  is partial;
- sampled traces cannot prove absence;
- inadequate window cannot prove absence;
- staging non-observation does not prove production absence;
- positive static evidence dominates runtime non-observation;
- old-version runtime use remains visible;
- stale runtime evidence produces stale status;
- input-order independence.

---

## 121. Minimum disposition tests

Disposition tests should cover:

- `confirmed_dead`;
- `confirmed_live`;
- `needs_investigation`;
- runtime-context mismatch;
- artifact mismatch;
- environment mismatch;
- observation-window mismatch;
- stale runtime coverage rejection;
- new runtime evidence;
- revocation;
- supersession;
- history preservation;
- prevention of automatic remediation authority.

---

## 122. Minimum remediation-authorization tests

Authorization tests should cover:

- exact valid authorization;
- missing authorization;
- expired authorization;
- revoked authorization;
- wrong repository;
- wrong commit;
- wrong service;
- wrong artifact;
- wrong environment;
- wrong deployment set;
- wrong observation window;
- wrong runtime evidence digest;
- wrong runtime coverage digest;
- unauthorized infrastructure-file change;
- unauthorized deployment operation;
- stale disposition;
- reuse after completion.

Every mismatch must deny remediation.

---

## 123. Minimum reproduction tests

Reproduction tests should cover:

- exact runtime context reproduced;
- source changed;
- artifact changed;
- deployment changed;
- canary added;
- old version remains deployed;
- observation window expired;
- trace sampling changed;
- metric retention changed;
- log access changed;
- feature-flag state changed;
- new positive runtime evidence appeared;
- runtime coverage reduced;
- authorization expired.

Approximate runtime-context reproduction must never proceed.

---

## 124. Minimum test-deployment tests

When test deployment is included, tests should cover:

- isolated deployment succeeds;
- wrong artifact digest;
- test environment unavailable;
- production fallback rejected;
- health check failure;
- contract test failure;
- telemetry instrumentation missing;
- test trace observed;
- test metric observed;
- test job observed;
- test message flow observed;
- resource limit exceeded;
- cost limit exceeded;
- cleanup failure.

---

## 125. Minimum remediation tests

Remediation tests should cover:

- exact source-only target removal;
- positive runtime evidence blocks remediation;
- incomplete runtime coverage blocks runtime-dependent remediation;
- unauthorized infrastructure change rejected;
- unauthorized deployment manifest change rejected;
- unauthorized feature-flag change rejected;
- target baseline failure;
- test-deployment failure;
- new runtime evidence after review;
- deterministic patch;
- idempotent transformation;
- stale runtime-aware authorization.

---

## 126. Minimum publisher tests

Publisher tests should cover:

- exact runtime context;
- wrong artifact identity;
- stale deployment mapping;
- stale runtime evidence digest;
- stale runtime coverage digest;
- missing target gate;
- missing required test-deployment gate;
- unexpected infrastructure-file change;
- unexpected deployment-file change;
- wrong patch hash;
- default-branch rejection;
- draft pull-request creation;
- no deployment operation;
- no infrastructure operation;
- idempotent retry;
- provider partial state;
- Git-hook suppression;
- publisher inability to access runtime systems.

Live provider tests require separate authorization.

---

## 127. Minimum migration tests

Migration tests should cover:

- fresh database;
- upgrade from Phase 7;
- existing service universes;
- environment identities;
- infrastructure resources;
- deployments;
- workloads;
- source-to-artifact mappings;
- artifact-to-deployment mappings;
- observation windows;
- runtime evidence;
- partial collections;
- stale evidence;
- runtime coverage;
- test deployment results;
- multiple tenants;
- failed migration;
- retry;
- projection rebuild;
- audit preservation.

---

## 128. Minimum security tests

Security tests should cover:

- production access denied by default;
- write-capable credentials rejected for read-only profiles where required;
- one tenant cannot read another tenant's telemetry;
- provider scope is enforced;
- log query scope is enforced;
- customer-data fields are blocked;
- secret values are redacted;
- repository content cannot broaden provider scope;
- repository content cannot create log queries directly;
- pod execution is denied;
- infrastructure apply is denied;
- Docker socket is unavailable;
- cloud metadata is unavailable to repository code;
- output is bounded;
- collectors are rate-limited;
- temporary credentials are removed;
- test environments are cleaned.

---

## 129. Fixture strategy

Phase 8 should use fixtures representing:

- static infrastructure repository;
- Kubernetes test cluster metadata;
- one service deployment;
- rolling deployment;
- canary deployment;
- old artifact still running;
- trace collector fixture;
- metric collector fixture;
- bounded log fixture;
- scheduled job;
- message producer and consumer;
- feature-flag fixture;
- telemetry outage;
- sampling limitation;
- retention limitation;
- malicious resource annotation;
- synthetic secret;
- alternate environment, service, workload, and operation names.

Production behavior must not contain fixture-specific branches.

---

## 130. External system testing

Every external infrastructure or telemetry test requires explicit
authorization.

The authorization must identify:

- canonical system identity;
- provider;
- account or project;
- environment;
- permitted operations;
- network destinations;
- credential capability;
- data classes;
- query limits;
- observation window;
- retention;
- cleanup;
- production prohibition or permission;
- cost boundaries;
- required test IDs.

Historical access does not constitute current authorization.

---

## 131. Scale boundary

Phase 8 establishes bounded functional infrastructure and runtime evidence.

The phase report must state tested limits such as:

- environment count;
- provider count;
- resource count;
- deployment count;
- workload count;
- artifact mapping count;
- observation-window count;
- trace count or aggregation size;
- metric series count;
- log result count;
- message-flow observation count;
- collection duration;
- peak memory;
- database growth;
- artifact size;
- estimated or actual test cost.

Phase 8 must not claim complete enterprise runtime coverage.

Broader scale validation belongs to Phase 10.

---

## 132. Infrastructure detection acceptance criteria

Infrastructure detection may become `functional` only when:

1. Environment identities are deterministic.
2. Provider identities are exact.
3. Resource identities are deterministic.
4. Inventory completeness is explicit.
5. Pagination and rate limits preserve partial status.
6. Infrastructure configuration remains untrusted.
7. Executable configuration remains in the runner.
8. Source-to-artifact mapping preserves ambiguity.
9. Artifact-to-deployment mapping prefers immutable identity.
10. Rolling and concurrent versions remain visible.
11. Production access is denied by default.
12. Required security, migration, and phase tests pass.

---

## 133. Runtime evidence acceptance criteria

Runtime evidence may become `functional` only when:

1. Observation windows are explicit.
2. Environment and workload scope is explicit.
3. Telemetry-system identity is explicit.
4. Sampling is recorded.
5. Retention is recorded.
6. Collection failures remain visible.
7. Non-observation is distinct from absence.
8. Exact positive observations map to current artifact identities.
9. Sensitive data is minimized.
10. Redaction is validated.
11. Evidence freshness is enforced.
12. Generalization beyond one fixture is demonstrated.
13. Required security, migration, and phase tests pass.

---

## 134. Runtime-aware classification acceptance criteria

Runtime-aware classification may become `functional` only when:

1. Static and contract classifications remain available.
2. Runtime evidence cannot bypass coverage requirements.
3. Positive runtime evidence produces liveness.
4. Non-observation cannot produce deadness under incomplete coverage.
5. Observation-window adequacy is evaluated.
6. Environment coverage is explicit.
7. Version diversity is represented.
8. Feature-flag limitations are represented.
9. Telemetry outages are represented.
10. Evidence precedence is deterministic.
11. Explanations are reproducible.
12. Required positive, negative, failure, and hostile tests pass.

---

## 135. Runtime-informed remediation acceptance criteria

Runtime-informed source remediation may become `functional` only when:

1. The source symbol shape is supported by an earlier language profile.
2. Required static coverage is complete.
3. Required contract coverage is complete.
4. Required runtime coverage is complete for the selected profile.
5. Source, artifact, deployment, and environment identities are current.
6. No positive runtime evidence exists.
7. Observation windows are adequate.
8. Sampling and retention limitations do not affect the conclusion.
9. Human disposition is current.
10. Separate remediation authorization is current.
11. Exact runtime-context reproduction succeeds.
12. Required target baseline gates pass.
13. Required deployment-aware test gates pass when applicable.
14. Structured transformation is deterministic.
15. Infrastructure and deployment files remain unchanged unless separately
    authorized.
16. Required post-change gates pass.
17. Patch generation is deterministic.
18. Production deployment remains separately authorized.
19. Required runner controls pass.
20. Required migration and phase tests pass.

---

## 136. Detection-only outcome

Phase 8 may validly complete with detection-only support when:

- environment identity is implemented;
- deployment identity is implemented;
- source and artifact mappings are implemented;
- runtime evidence can be collected safely;
- runtime coverage is implemented;
- classifications remain conservative;
- runtime-informed remediation remains unavailable;
- infrastructure modification remains unavailable;
- deployment modification remains unavailable;
- the active completion scope permits detection-only support.

Detection-only runtime support is a valid bounded capability.

---

## 137. Partially supported outcome

Phase 8 capability may remain `partially_supported` when, for example:

- test environments are supported but production is not;
- Kubernetes metadata is supported but another provider is not;
- traces are supported but logs are not;
- metrics are supported only at service level;
- artifact mapping works only with immutable digests;
- feature-flag metadata is supported but targeting rules are not;
- static infrastructure parsing works but live inventory is unavailable;
- runtime evidence works but remediation does not;
- one environment is covered while another remains inaccessible.

The exact unsupported dimensions must remain explicit.

---

## 138. Blocked outcome

Phase 8 must remain blocked when applicable:

- environment identity is ambiguous;
- production access would be required without explicit authorization;
- provider credentials are overbroad and cannot be constrained;
- required inventory is incomplete;
- source-to-artifact mapping is ambiguous;
- artifact-to-deployment mapping is ambiguous;
- required workload is uninstrumented;
- observation window is inadequate;
- telemetry sampling prevents the required conclusion;
- retention is insufficient;
- required environment is inaccessible;
- customer-data minimization cannot be guaranteed;
- secret redaction fails;
- required runtime collector fails;
- required test deployment cannot run safely;
- required runner control fails;
- migration tests fail;
- tenant isolation fails;
- required tests fail or are unavailable;
- exact runtime-context reproduction fails;
- positive runtime evidence appears;
- authorization expires or is revoked.

A blocked result must identify the exact safe next action.

---

## 139. Phase completion criteria

Phase 8 may be reported complete only when all applicable criteria are
satisfied:

1. Environment identity is implemented.
2. Infrastructure-provider profiles are versioned.
3. Infrastructure-resource identity is implemented.
4. Inventory completeness is explicit.
5. Production access is denied by default.
6. Infrastructure configuration remains untrusted.
7. Executable infrastructure configuration remains in the runner.
8. Deployment identity is implemented.
9. Workload identity is implemented.
10. Source-to-artifact mapping is implemented.
11. Artifact-to-deployment mapping is implemented.
12. Rolling and concurrent versions remain visible.
13. Observation windows are implemented.
14. Trace evidence is implemented for supported profiles.
15. Metric evidence is implemented for supported profiles.
16. Log evidence is implemented for supported profiles.
17. Endpoint, job, and message observations are implemented where supported.
18. Feature-flag evidence is bounded.
19. Sensitive telemetry is minimized.
20. Collection failures preserve uncertainty.
21. Non-observation remains distinct from absence.
22. Runtime coverage is implemented.
23. Partial runtime coverage preserves uncertainty.
24. Runtime-aware classification is deterministic and conservative.
25. Human disposition remains separate.
26. Remediation authorization remains separate.
27. Exact reproduction includes runtime identities.
28. Infrastructure and deployment changes remain separately authorized.
29. Required target and test-environment gates pass.
30. Required database migrations pass.
31. Required security controls pass.
32. Required Phase 8 tests pass.
33. Triggered conditional tests pass.
34. Capability statuses are updated truthfully.
35. Security-control matrix is updated.
36. Phase report is complete.
37. Execution state is updated.
38. No unresolved blocker contradicts completion.

Detection-only completion is valid when the active authorization and test
manifest define detection-only scope.

---

## 140. Phase report

The Phase 8 completion report should include:

- authorization identity;
- objective;
- source commit before and after;
- files changed;
- migrations;
- dependencies;
- provider profiles;
- environments;
- infrastructure-resource types;
- inventory completeness;
- production-access status;
- deployment identities;
- workload identities;
- source-to-artifact mappings;
- artifact-to-deployment mappings;
- observation windows;
- trace evidence;
- metric evidence;
- log evidence;
- endpoint observations;
- job observations;
- message-flow observations;
- feature-flag evidence;
- sampling limitations;
- retention limitations;
- telemetry outages;
- runtime coverage;
- runtime-aware classification;
- test-deployment behavior;
- remediation result;
- changed files;
- post-change gates;
- patch identity;
- source publication result;
- infrastructure and deployment operations;
- security controls;
- tests;
- fixtures;
- measured scale;
- measured or estimated cost;
- capability-status changes;
- limitations;
- blockers;
- cleanup;
- next safe action.

The report must not describe bounded telemetry observations as complete
production or enterprise runtime coverage.

---

## 141. Execution-state handoff

The Phase 8 handoff should identify:

- phase status;
- authorization status;
- source commit;
- worktree state;
- supported infrastructure providers;
- supported resource profiles;
- supported environments;
- production-access status;
- deployment-mapping capability;
- workload-mapping capability;
- trace capability;
- metric capability;
- log capability;
- endpoint, job, and message observation capability;
- feature-flag capability;
- runtime coverage status;
- detection-only capabilities;
- remediation-supported capabilities;
- unsupported runtime scope;
- test manifest;
- test results;
- security-control results;
- migrations;
- external operations;
- retained external state;
- test-resource cleanup;
- next human decision.

The handoff must not authorize Phase 9.

---

## 142. Transition to Phase 9

Phase 9 may be proposed when repository, service, contract, infrastructure, and
runtime evidence can be represented consistently and the remaining need is
controlled organization-wide orchestration.

Before Phase 9 begins:

1. Finalize the Phase 8 report.
2. Update execution state.
3. Stop Phase 8 implementation.
4. Present actual infrastructure and runtime capability statuses.
5. Record orchestration and campaign limitations.
6. Prepare a Phase 9 authorization.
7. Obtain explicit human approval.

Phase 9 must not start automatically.

---

## 143. Phase stop conditions

Work must stop when:

- Phase 8 authorization is inactive;
- authorization expires;
- authorization is revoked;
- provider, account, environment, cluster, namespace, service, or operation
  scope is exceeded;
- production access would occur without explicit permission;
- a prohibited repository is encountered;
- environment identity cannot be verified;
- infrastructure identity cannot be verified;
- required inventory is incomplete;
- required provider access is unavailable;
- credential capability is overbroad or unavailable;
- source-to-artifact mapping is ambiguous;
- artifact-to-deployment mapping is ambiguous;
- observation windows are inadequate;
- required telemetry is sampled beyond the supported profile;
- required telemetry retention is insufficient;
- data minimization cannot be guaranteed;
- secret redaction fails;
- required collector fails;
- required test deployment cannot be isolated;
- a cost boundary would be exceeded;
- required runner controls fail;
- a destructive migration would be required without permission;
- a required test fails or is unavailable;
- tenant isolation fails;
- exact runtime-context reproduction fails;
- positive runtime evidence appears;
- runtime coverage becomes incomplete;
- changed files exceed authorization;
- infrastructure or deployment modification would occur without authorization;
- external state becomes unknown and cannot be reconciled safely.

Stopping must be recorded truthfully.

---

## 144. Fail-safe behavior

When environment identity, infrastructure inventory, artifact mapping,
deployment state, workload identity, observation windows, telemetry
completeness, feature-flag state, evidence, coverage, verification,
remediation, or publication state cannot be established confidently:

- do not report complete infrastructure or runtime support;
- do not access production systems;
- do not use overbroad credentials;
- do not retrieve secret values;
- do not treat inaccessible resources as nonexistent;
- do not treat collector failure as empty telemetry;
- do not treat sampling-limited non-observation as absence;
- do not treat retention-limited history as complete;
- do not treat staging evidence as production evidence;
- do not treat one deployed version as the only deployed version;
- do not create human disposition automatically;
- do not infer remediation authorization;
- do not modify infrastructure;
- do not modify deployments;
- do not modify feature flags;
- do not shift traffic;
- do not generate a deployment-eligible change;
- do not publish source without trusted validation;
- preserve available evidence;
- return an explicit partial, observation-window-insufficient,
  sampling-limited, retention-limited, access-blocked, detection-only,
  unsupported, failed, stale, configuration-required, or blocked result;
- identify the exact missing requirement.

Infrastructure and runtime uncertainty must reduce classification, remediation,
deployment, and publication authority.

---

## 145. Document integrity

This roadmap file must not be modified during Phase 8 implementation unless
roadmap or governance modification is explicitly authorized.

Changes require:

1. Identification of the Phase 8 planning problem.
2. Review against the roadmap overview.
3. Review against permanent safety invariants.
4. Review of environment and provider-access implications.
5. Review of resource, deployment, artifact, and workload identity.
6. Review of telemetry data minimization and privacy implications.
7. Review of observation-window, sampling, and retention semantics.
8. Review of runtime coverage and evidence-precedence implications.
9. Review of remediation, deployment, and infrastructure boundaries.
10. Review of authorization and testing impact.
11. Updated Phase 8 test manifest where applicable.
12. Updated schemas or capability definitions where applicable.
13. A reviewable governance commit.
14. An ADR when the change alters long-lived infrastructure identity,
    deployment mapping, telemetry collection, runtime coverage, or
    runtime-informed remediation semantics.

This roadmap must not be weakened to make incomplete inventories, ambiguous
deployments, inadequate observation windows, sampled telemetry, retention gaps,
failed collectors, unauthorized production access, failed tests, or unsafe
infrastructure operations appear acceptable.