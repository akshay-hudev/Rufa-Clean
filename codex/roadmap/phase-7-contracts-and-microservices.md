# Phase 7 — Contracts and Microservices

This document defines the planned scope, capability boundaries, evidence
requirements, tests, stop conditions, and completion criteria for Phase 7 of
DCAv2.

Phase 7 extends liveness analysis beyond source references and package
dependencies into service contracts, APIs, events, queues, schemas, generated
clients, and distributed-system consumers.

A handler, endpoint, message consumer, schema field, RPC method, or event type
must not be classified as dead merely because no direct source reference exists.

Distributed consumers may exist:

- in another repository;
- in another language;
- outside the authorized repository universe;
- in generated clients;
- in external customer systems;
- in scheduled workflows;
- in integration platforms;
- in production configuration;
- in message-bus subscriptions;
- in deployment or gateway configuration;
- in retained older service versions.

Missing static consumers must therefore preserve uncertainty unless the complete
required contract-consumer universe is explicitly defined, authorized,
accessible, current, and covered.

This roadmap file does not authorize implementation, repository access,
production-system access, credential use, network probing, database changes,
message-bus access, contract publication, remediation, source publication, or
destructive operations.

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
  id: phase-7-contracts-and-microservices
  name: Contracts and Microservices
  roadmap_order: 7
  default_status: inactive
  implementation_authorized_by_this_file: false
```

The phase becomes active only when the current authorization record explicitly
identifies `phase-7-contracts-and-microservices` as active.

---

## 2. Primary objective

The primary objective is to model distributed liveness evidence through
versioned service and contract relationships.

The phase should implement and validate applicable:

1. Service identity.
2. Service ownership and repository mapping.
3. Contract artifact discovery.
4. Contract type classification.
5. Contract version identity.
6. Producer and consumer relationships.
7. Endpoint and operation identity.
8. Request and response schema identity.
9. Event and message schema identity.
10. RPC service and method identity.
11. Generated client relationships.
12. Gateway and routing relationships.
13. Configuration-driven consumers.
14. Contract compatibility evidence.
15. Cross-language consumer evidence.
16. Partial and unknown consumer accounting.
17. Contract coverage.
18. Conservative classification.
19. Human disposition.
20. Separate remediation authorization.
21. Exact distributed finding reproduction.
22. Target-service verification.
23. Consumer compatibility verification where required.
24. Trusted draft-only publication when separately authorized.
25. Append-only audit and truthful reporting.

Phase 7 should remain detection-first.

Automatic removal of externally consumable endpoints, event types, fields, or
RPC methods should remain unsupported until complete consumer and compatibility
coverage is proven for a narrowly defined profile.

---

## 3. Intended capability

The intended capability is conceptually:

```text
Identify a supported service operation or contract element, discover its known
producers and consumers across an authorized service universe, evaluate contract
and compatibility evidence, and preserve uncertainty whenever runtime,
external, historical, or unauthorized consumer scope remains incomplete.
```

A later narrow remediation capability may support one internal contract or
handler shape only when:

- service identity is exact;
- contract identity is exact;
- version identity is exact;
- required consumer coverage is complete;
- compatibility gates pass;
- current human disposition exists;
- separate remediation authorization exists;
- the transformation is structured;
- publication remains trusted and draft-only.

---

## 4. Phase prerequisites

Phase 7 should not begin until earlier phases have established or bounded:

- canonical repository identity;
- immutable source snapshots;
- repository universes;
- cross-repository package relationships;
- source-to-artifact mappings;
- semantic-index ingestion;
- package and symbol identities;
- language-specific framework registration;
- generated-client relationships;
- evidence normalization;
- open-world coverage;
- deterministic classification;
- human disposition;
- separate remediation authorization;
- exact finding reproduction;
- target and consumer verification;
- trusted publisher separation;
- additive database evolution;
- tenant isolation;
- capability and security-control reporting.

Phase 6 limitations must remain visible.

A repository-level consumer graph is not sufficient evidence of complete
service-contract coverage.

---

## 5. Non-goals

Phase 7 does not, by default, include:

- unrestricted production service discovery;
- production network scanning;
- production traffic inspection;
- live request capture;
- live message-bus inspection;
- packet capture;
- service-mesh telemetry ingestion;
- production tracing;
- infrastructure inventory;
- deployment-state discovery;
- Kubernetes analysis;
- cloud resource analysis;
- runtime feature-flag evaluation;
- runtime database usage analysis;
- automatic endpoint removal;
- automatic message-topic deletion;
- automatic event-schema deletion;
- automatic database-column deletion;
- automatic gateway reconfiguration;
- automatic client regeneration across repositories;
- coordinated multi-repository remediation;
- automatic contract publication;
- automatic package or artifact release;
- backward-compatibility guarantees;
- complete external-customer discovery;
- direct default-branch publication;
- pull-request merge;
- enterprise-scale campaign orchestration.

Infrastructure and runtime evidence belongs primarily to Phase 8.

Organization-wide orchestration belongs primarily to Phase 9.

---

## 6. Authorization prerequisites

The active Phase 7 authorization must identify applicable:

- provider and repository scope;
- repository universe;
- service universe;
- target service;
- consumer services;
- contract types;
- contract repositories;
- schema registries;
- artifact registries;
- API gateways;
- message systems;
- permitted metadata operations;
- permitted source operations;
- permitted local contract generation;
- permitted dependency installation;
- permitted build and test commands;
- permitted compatibility checks;
- network destinations;
- credential capabilities;
- production-access prohibition or permission;
- test-system access;
- database operations;
- migrations;
- remediation permission;
- contract-file modification permission;
- source-file modification permission;
- consumer-repository modification permission;
- publication permission;
- cleanup permission;
- destructive-operation permission;
- required tests;
- stop conditions;
- expiration or completion boundary.

Authorization to read source does not authorize access to:

- production gateways;
- production schema registries;
- live message brokers;
- runtime traces;
- deployment systems;
- customer systems.

Missing permissions default to denial.

---

## 7. Required phase outputs

Phase 7 should produce applicable:

- service-universe model;
- canonical service identities;
- service-to-repository mappings;
- contract artifact inventory;
- contract type profiles;
- contract version identities;
- service operation identities;
- schema element identities;
- producer and consumer relationships;
- gateway and route relationships;
- generated-client relationships;
- message producer and consumer evidence;
- compatibility evidence;
- contract coverage profiles;
- distributed classification profiles;
- exact reproduction rules;
- target and consumer verification profiles;
- additive database migrations;
- audit events;
- phase test manifest;
- capability-matrix updates;
- security-control updates;
- phase-completion report;
- updated execution state.

---

## 8. Capability identifiers

Phase 7 should define or update capability identifiers such as:

```text
service.universe.define.v1
service.identity.resolve.v1
service.repository-map.v1
contract.artifact.discover.v1
contract.version.identify.v1
contract.operation.inventory.v1
contract.schema-element.inventory.v1
contract.producer-consumer-graph.v1
contract.generated-client-map.v1
contract.gateway-route-map.v1
contract.compatibility.evaluate.v1
analysis.service-operation-consumers.v1
analysis.message-producers-consumers.v1
coverage.contract.consumer-universe.v1
classification.contract-aware.v1
reproduction.contract-finding.v1
verification.contract-consumers.v1
```

Contract-specific identifiers should remain explicit.

Examples include:

```text
contract.openapi.operation-inventory.v1
contract.asyncapi.channel-inventory.v1
contract.protobuf.rpc-inventory.v1
contract.graphql.field-inventory.v1
contract.json-schema.consumer-analysis.v1
```

Every capability identifier must remain narrow, stable, versioned, and
testable.

---

## 9. Service universe

A service universe is the bounded set of services considered relevant to one
distributed analysis.

The universe should identify:

- service-universe ID;
- tenant;
- authorization identity;
- repository-universe identity;
- service-selection rule;
- explicit service inclusions;
- explicit exclusions;
- target service;
- possible consumer services;
- external consumer boundary;
- environment boundary;
- version boundary;
- selection time;
- completeness claim;
- known limitations;
- universe digest.

The service universe must not be inferred solely from directories named
`services` or repositories containing network libraries.

---

## 10. Service-universe types

Phase 7 may support bounded service-universe types such as:

- explicit service list;
- repository-catalog-derived service set;
- trusted service-registry export;
- contract-catalog-derived service set;
- package-and-client-derived service set;
- trusted operator-curated service set.

Each universe type must define separate completeness semantics.

A manually curated list may be useful but must not be described as complete
unless its declared boundary is proven.

---

## 11. Canonical service identity

A service identity should bind applicable:

- tenant;
- service ID;
- canonical service name;
- owning repository or repositories;
- package or module identity;
- contract artifacts;
- deployment name as metadata only;
- environment scope;
- owner or team;
- service version;
- source commit;
- identity source;
- identity confidence;
- identity digest.

Display name alone is insufficient.

Two environments or versions with the same display name may represent distinct
service states.

---

## 12. Service-to-repository mapping

A service may map to:

- one repository;
- one package in a monorepo;
- several packages;
- several repositories;
- generated source;
- configuration-only definitions;
- unknown source.

Every mapping should retain:

- service identity;
- repository identity;
- source commit;
- package or module identity;
- mapping source;
- confidence;
- freshness;
- ambiguity.

Ambiguous service ownership must reduce contract coverage.

---

## 13. Multi-service repositories

A repository may contain several independently deployed services.

Qualification should identify:

- service roots;
- source roots;
- contract roots;
- deployment roots as metadata only;
- shared libraries;
- shared configuration;
- generated clients;
- service-specific tests;
- service-specific commands.

A repository-level reference must not be treated automatically as a reference
from every service in that repository.

---

## 14. Multi-repository services

A service may be assembled from several repositories.

The profile should identify:

- primary source repository;
- contract repository;
- deployment repository;
- generated-client repository;
- shared schema repository;
- build repository;
- unknown components.

An incomplete multi-repository service mapping must reduce service coverage.

---

## 15. Service identity conflicts

Qualification must detect conflicts such as:

- duplicate service names;
- one contract mapped to several unrelated services;
- one service mapped to conflicting repositories;
- stale catalog entries;
- service rename without stable identity;
- environment-specific aliases;
- several owners claiming the same operation;
- generated contracts diverging from source.

The workflow must not choose one identity silently.

Conflicts should produce:

- `configuration_required`;
- `partially_supported`;
- `failed`;
- or `unsupported`.

---

## 16. Contract artifact types

Phase 7 may support bounded contract types such as:

- OpenAPI documents;
- AsyncAPI documents;
- Protocol Buffers;
- gRPC service definitions;
- GraphQL schemas;
- JSON Schema;
- Avro schemas;
- package entry-point metadata;
- framework route manifests;
- generated client metadata;
- trusted custom contract catalogs.

Every contract type must have an independent capability status.

---

## 17. Contract artifact identity

A contract artifact identity should bind:

- contract type;
- repository;
- source commit;
- service;
- repository-relative path;
- package or module;
- format version;
- parser version;
- content digest;
- generated or authored status;
- generator identity where applicable;
- environment scope;
- support status.

Filename alone is insufficient.

Two artifacts with the same title or service name must remain distinct until
identity resolution proves equivalence.

---

## 18. Authored and generated contracts

Contract artifacts may be:

- authored source;
- generated from source annotations;
- generated from runtime configuration;
- generated from build metadata;
- generated from another schema;
- copied from an external system;
- stale build output.

The workflow must identify the authoritative source for each supported profile.

Generated contracts must bind to:

- exact source commit;
- generator identity;
- generator version;
- command identity;
- configuration;
- artifact digest;
- generation result.

A stale generated contract must not satisfy current coverage.

---

## 19. Contract format versions

Supported format versions must be explicit.

For each format version, DCAv2 should define:

- parser;
- validation rules;
- supported constructs;
- unsupported constructs;
- canonicalization;
- reference resolution;
- extension handling;
- compatibility behavior;
- failure behavior;
- tests.

Unknown format versions must not be interpreted approximately.

They should produce `unsupported` or `configuration_required`.

---

## 20. Contract parsing

Contract parsing must preserve applicable:

- source location;
- operation identity;
- schema identity;
- reference identity;
- extension fields;
- external references;
- default values;
- constraints;
- deprecation metadata;
- version metadata;
- parser diagnostics;
- unsupported constructs.

Malformed contract output must not become an empty contract.

---

## 21. External contract references

Contracts may reference:

- files in the same repository;
- files in another repository;
- registry artifacts;
- URLs;
- package resources;
- generated schemas;
- environment-specific definitions.

Every external reference requires:

- canonical identity;
- access decision;
- authorization;
- immutable version or digest;
- provenance;
- freshness;
- resolution status.

An unresolved relevant reference must reduce contract coverage.

---

## 22. Contract extensions

Vendor or framework extensions may alter contract semantics.

The profile should classify extensions as:

- supported;
- ignored with proven irrelevance;
- unsupported;
- ambiguous;
- failed.

An unknown extension must not be ignored when it may affect:

- routing;
- operation identity;
- authentication;
- versioning;
- consumer generation;
- message channels;
- schema compatibility.

---

## 23. Contract version identity

A contract version should bind applicable:

- contract artifact;
- source commit;
- explicit semantic version;
- artifact version;
- environment;
- publication identity;
- compatibility lineage;
- content digest;
- version source;
- ambiguity.

A service version string alone may not identify the exact contract.

Content identity and source identity should remain primary.

---

## 24. Operation identity

A service operation identity may represent:

- HTTP endpoint;
- RPC method;
- GraphQL field;
- message channel;
- event type;
- queue consumer;
- command handler;
- webhook;
- scheduled integration trigger.

Operation identity should bind:

- service;
- contract artifact;
- contract version;
- operation type;
- protocol;
- path, method, field, channel, or method identity;
- source handler where resolvable;
- environment;
- source occurrence;
- operation digest.

Display labels or operation summaries are not sufficient.

---

## 25. HTTP operation identity

An HTTP operation should retain applicable:

- service;
- API contract;
- HTTP method;
- normalized path template;
- operation ID;
- request schema;
- response schemas;
- authentication metadata;
- versioning metadata;
- source handler;
- gateway mapping;
- deprecation state;
- content digest.

A path string without method and service context is insufficient.

---

## 26. RPC method identity

An RPC method should retain applicable:

- service definition;
- package or namespace;
- service name;
- method name;
- request message;
- response message;
- streaming mode;
- source handler;
- generated client identities;
- schema digest;
- source occurrence.

Method name alone is insufficient.

---

## 27. GraphQL operation identity

A GraphQL contract element may include:

- schema;
- type;
- field;
- argument;
- input type;
- enum value;
- interface;
- union;
- resolver;
- subscription field.

The identity must preserve schema and type context.

A field name appearing on several types must remain distinct.

---

## 28. Message operation identity

A messaging operation may include:

- broker profile;
- channel;
- topic;
- queue;
- routing key;
- event type;
- producer;
- consumer;
- message schema;
- version;
- environment;
- source handler;
- subscription configuration.

A topic name alone may be environment- and broker-dependent.

---

## 29. Schema element identity

A schema element may represent:

- object type;
- message type;
- field;
- property;
- enum;
- enum value;
- union member;
- request body;
- response body;
- error type;
- header;
- parameter.

Identity should bind:

- contract artifact;
- contract version;
- schema path;
- semantic name;
- containing element;
- source occurrence;
- content digest.

Name-only matching is insufficient.

---

## 30. Schema references

Schema references may be:

- local;
- cross-file;
- cross-repository;
- registry-based;
- recursive;
- cyclic;
- generated;
- unresolved.

The resolver must preserve:

- reference source;
- target identity;
- resolution status;
- cycle status;
- authorization status;
- freshness.

An unresolved required schema reference must reduce coverage.

---

## 31. Producer identity

A producer may be:

- service operation;
- event publisher;
- message publisher;
- RPC server;
- API server;
- generated source;
- scheduled workflow;
- integration platform;
- unknown external system.

A producer record should bind:

- service;
- repository;
- source commit;
- package or module;
- operation;
- source occurrence;
- contract version;
- environment;
- evidence source;
- confidence;
- freshness.

---

## 32. Consumer identity

A consumer may be:

- service;
- repository;
- package;
- generated client;
- external application;
- integration platform;
- test suite;
- scheduled workflow;
- message subscriber;
- customer system;
- unknown external system.

A consumer record should bind as much identity as the evidence supports.

Unknown external consumers must remain represented rather than omitted.

---

## 33. Producer-consumer relationships

A producer-consumer edge should retain:

- producer identity;
- consumer identity;
- contract identity;
- contract version;
- operation or schema element;
- protocol;
- environment;
- relationship type;
- declaration occurrence;
- generated-client identity;
- configuration identity;
- evidence source;
- confidence;
- freshness;
- ambiguity.

A package dependency alone does not prove operation-level consumption.

---

## 34. Relationship levels

Distributed relationships should distinguish:

- service-level dependency;
- contract-level dependency;
- operation-level dependency;
- schema-level dependency;
- field-level dependency;
- generated-client dependency;
- configuration-level dependency;
- test-only dependency;
- runtime candidate;
- unresolved candidate.

Only exact supported resolution may become authoritative operation- or
field-level liveness evidence.

---

## 35. Generated clients

Generated clients may preserve distributed consumer relationships.

A generated-client record should identify:

- source contract;
- contract version;
- generator;
- generator version;
- generated repository;
- generated package;
- generated language;
- generated source commit;
- generated artifact digest;
- consumer repositories;
- freshness;
- support status.

A generated client existing in one repository is evidence of possible
consumption, not proof that every generated operation is used.

---

## 36. Generated-client usage

Generated-client usage analysis should distinguish:

- client package dependency;
- client class construction;
- exact operation call;
- operation method reference;
- schema type reference;
- generated code present but unused;
- test-only use;
- unresolved dynamic invocation.

A generated method name match must not become an exact operation reference
without verified source-to-contract mapping.

---

## 37. Gateway and route mappings

Gateways and proxies may expose or route service operations.

A gateway mapping should retain:

- gateway identity;
- environment;
- external route;
- internal service;
- internal operation;
- transformation behavior;
- version rule;
- configuration source;
- authorization status;
- freshness;
- support status.

Gateway configuration is untrusted input and may contain secrets.

---

## 38. API gateway coverage

Gateway coverage should account for applicable:

- route definitions;
- rewrites;
- method mappings;
- version prefixes;
- host-based routing;
- environment-specific routes;
- canary routes;
- deprecated routes;
- redirects;
- authentication policies;
- transformations;
- external integrations.

Unsupported gateway features must reduce coverage when they may expose the
target operation.

---

## 39. Service mesh metadata

Service-mesh metadata may describe possible service relationships, but runtime
service-mesh analysis belongs primarily to Phase 8.

Phase 7 may ingest trusted static configuration as supporting evidence only when
explicitly authorized.

Static mesh configuration must not be treated as proof of runtime traffic or
consumer absence.

---

## 40. Message producers

Message-producer evidence may come from:

- explicit publish APIs;
- framework decorators;
- generated producers;
- configuration;
- event outbox mappings;
- workflow definitions;
- tests;
- schema registry metadata.

Every supported producer rule must map the source occurrence to an exact channel
or message type where possible.

Unresolved dynamic topic selection must preserve uncertainty.

---

## 41. Message consumers

Message-consumer evidence may come from:

- subscription APIs;
- decorators;
- queue configuration;
- framework modules;
- generated bindings;
- consumer groups;
- workflow definitions;
- tests.

A handler with no direct source calls may still be live through subscription.

A consumer naming convention alone is insufficient without a supported
registration rule.

---

## 42. Dynamic channel selection

Topic, queue, or routing-key selection may be:

- literal;
- statically resolved;
- configuration-driven;
- environment-driven;
- tenant-driven;
- computed;
- generated;
- unresolved.

Unresolved relevant channel selection must reduce contract coverage.

It must not be interpreted as no producer or consumer.

---

## 43. Schema registries

Schema-registry metadata may provide:

- schema identity;
- subject;
- version;
- compatibility mode;
- producer associations;
- consumer associations;
- artifact digest;
- publication time;
- deprecation state.

Registry access requires explicit authorization and a bounded network profile.

Registry metadata remains untrusted external input.

---

## 44. Registry identity

A schema registry should be identified by:

- provider or implementation;
- canonical endpoint identity;
- tenant or namespace;
- environment;
- credential capability;
- network profile;
- registry version where available;
- metadata digest.

Credential-bearing URLs must be redacted.

A repository-provided registry URL cannot broaden authorized destinations.

---

## 45. Registry freshness

Schema-registry evidence becomes stale when applicable:

- subject versions change;
- compatibility policy changes;
- environment changes;
- registry access changes;
- schema is replaced or deleted;
- producer or consumer metadata changes;
- freshness window expires.

Stale registry evidence must not satisfy remediation prerequisites.

---

## 46. OpenAPI support

A bounded OpenAPI capability may include:

- supported specification versions;
- operation inventory;
- path and method identity;
- request and response schema identity;
- local and external reference resolution;
- operation-ID mapping;
- generated-client mapping;
- source-handler mapping;
- compatibility checks;
- known unsupported extensions.

OpenAPI presence does not prove that runtime routing matches the document.

---

## 47. AsyncAPI support

A bounded AsyncAPI capability may include:

- supported specification versions;
- channel inventory;
- operation inventory;
- message identity;
- schema resolution;
- producer and consumer identity;
- binding metadata;
- generated-client mapping;
- compatibility checks;
- known unsupported extensions.

AsyncAPI absence does not prove that no messaging contract exists.

---

## 48. Protocol Buffers and gRPC support

A bounded Protocol Buffers or gRPC capability may include:

- supported syntax versions;
- package identity;
- service identity;
- RPC method identity;
- message identity;
- field identity;
- import resolution;
- generated-client mapping;
- source-handler mapping;
- compatibility checks;
- field-number retention;
- reserved-field handling.

Generated-code presence must remain distinct from source operation usage.

---

## 49. GraphQL support

A bounded GraphQL capability may include:

- schema identity;
- type and field inventory;
- resolver mapping;
- generated-client documents;
- persisted queries where available;
- fragment usage;
- introspection artifacts as supporting evidence;
- compatibility checks;
- schema composition where explicitly supported.

External ad hoc queries create open-world consumer uncertainty.

---

## 50. JSON Schema and Avro support

A bounded schema capability may include:

- schema identity;
- version identity;
- reference resolution;
- producer mapping;
- consumer mapping;
- compatibility rules;
- generated type mapping;
- registry metadata;
- known unsupported constructs.

Schema presence alone does not prove field-level use.

---

## 51. Contract compatibility

Compatibility evaluation must be contract-type-specific.

Potential compatibility classes include:

- backward compatible;
- forward compatible;
- fully compatible;
- breaking;
- potentially breaking;
- unsupported;
- inconclusive;
- failed.

Compatibility tooling must not directly authorize remediation.

A compatibility pass does not prove absence of runtime consumers.

---

## 52. Compatibility baselines

Compatibility checks should compare:

- current contract;
- proposed contract;
- supported historical contract versions;
- consumer-pinned versions;
- registry compatibility policy;
- generated-client expectations.

The exact comparison set must be defined by the profile.

Comparing only against the latest contract version may be insufficient.

---

## 53. Historical contract versions

Older service or client versions may still be active.

Phase 7 should retain applicable:

- historical contract version;
- source commit;
- publication identity;
- support window;
- known consumer versions;
- deprecation status;
- retirement evidence;
- environment scope.

A deprecated version is not necessarily unused.

Unknown retained-version usage must preserve uncertainty.

---

## 54. Deprecation evidence

Deprecation metadata may support review but does not prove non-use.

Deprecation evidence should retain:

- contract element;
- deprecation source;
- deprecation date;
- replacement;
- planned removal date;
- owner;
- consumer notification status;
- runtime retirement evidence if available later;
- confidence.

Human plans must remain separate from machine liveness evidence.

---

## 55. Source-handler mapping

A contract operation may map to a source handler through:

- framework route registration;
- generated routing metadata;
- explicit configuration;
- annotations;
- decorators;
- code generation;
- trusted operator mapping.

The mapping should retain:

- contract operation;
- source symbol;
- repository;
- source commit;
- framework adapter;
- mapping source;
- confidence;
- freshness;
- ambiguity.

An operation ID and function name match is insufficient by itself.

---

## 56. Handler liveness

A handler is live when it is exposed through a supported current contract or
registration profile, even when no direct source call exists.

A handler may remain uncertain when:

- contract generation is stale;
- gateway mapping is unresolved;
- version routing is unresolved;
- environment-specific registration is unknown;
- runtime feature flags affect exposure;
- external clients are unknown.

Handler removal should remain outside the default remediation scope.

---

## 57. Schema-field liveness

A schema field may be live through:

- serialized responses;
- deserialized requests;
- generated clients;
- stored events;
- historical data;
- compatibility guarantees;
- external consumers;
- reflection or serializers;
- database mappings.

Field-level absence in source references is insufficient.

Automatic schema-field removal should remain unsupported by default.

---

## 58. Event retention and replay

Events may remain relevant after producers stop emitting them because:

- retained messages can be replayed;
- consumers may process historical events;
- event stores preserve old schemas;
- migrations may read old event versions;
- disaster recovery may replay logs;
- audit workflows may depend on them.

Phase 7 must not classify an event type as safely removable without an explicit
retention and replay profile.

---

## 59. Consumer-version diversity

Consumers may run several versions simultaneously.

The consumer model should retain:

- service identity;
- source commit;
- artifact version;
- deployed version as metadata only when available;
- contract version;
- environment;
- compatibility state;
- freshness.

Static source at one commit does not prove that all deployed consumers use that
commit.

Runtime deployment evidence belongs primarily to Phase 8.

---

## 60. External consumers

External consumers may include:

- customers;
- partners;
- mobile applications;
- browser applications;
- scripts;
- third-party integrations;
- marketplace integrations;
- external automation;
- unknown public clients.

Unless a supported profile proves the external boundary is closed, externally
accessible operations must retain consumer uncertainty.

---

## 61. Test consumers

Tests may provide positive operation or schema evidence.

The model should distinguish:

- unit-test consumer;
- integration-test consumer;
- contract-test consumer;
- generated-client test;
- consumer-driven contract test;
- mock-only test;
- obsolete test;
- disabled test.

A test-only consumer is still liveness evidence under the selected profile.

It may also be surfaced separately for human review.

---

## 62. Consumer-driven contracts

Consumer-driven contract artifacts may provide strong evidence of expected
behavior.

The record should identify:

- consumer service;
- provider service;
- contract artifact;
- contract version;
- source commit;
- verification status;
- broker or registry identity;
- freshness;
- environment;
- support status.

A stale or unverified contract must not satisfy current consumer coverage.

---

## 63. Contract test evidence

Contract test evidence should retain:

- producer;
- consumer;
- target operation or schema;
- contract version;
- test command;
- source commits;
- environment;
- result;
- limitations;
- artifact digest;
- freshness.

A passing contract test against an older provider version does not validate a
new remediation automatically.

---

## 64. Static versus runtime evidence

Phase 7 primarily models static and test-derived contract evidence.

It must distinguish:

- static declaration;
- generated contract;
- source registration;
- compatibility result;
- test result;
- registry metadata;
- runtime observation;
- deployment observation.

Runtime and deployment evidence must not be fabricated from static artifacts.

Phase 8 may later add runtime and infrastructure evidence.

---

## 65. Contract evidence model

Contract evidence should retain applicable:

- tenant;
- target service;
- target repository;
- target commit;
- contract artifact;
- contract version;
- operation or schema element;
- producer;
- consumer;
- consumer repository;
- consumer commit;
- environment;
- protocol;
- evidence type;
- polarity;
- strength;
- ambiguity;
- producer tool;
- producer version;
- adapter version;
- configuration identity;
- raw artifact digest;
- freshness.

Evidence must remain attributable and reproducible.

---

## 66. Evidence polarity

Contract evidence may be:

- positive liveness;
- supporting relationship;
- negative absence within one covered scope;
- ambiguous;
- contradictory;
- unsupported;
- failed;
- stale.

Positive exact producer or consumer evidence must dominate absence evidence.

Absence from one contract, repository, or client must not become distributed
absence without complete required coverage.

---

## 67. Evidence freshness

Contract evidence becomes stale when applicable:

- target source changes;
- consumer source changes;
- contract content changes;
- contract version changes;
- gateway configuration changes;
- schema registry changes;
- generated client changes;
- framework mapping changes;
- package mapping changes;
- compatibility tool changes;
- adapter semantics change;
- environment scope changes;
- repository universe changes.

Stale evidence must not satisfy remediation prerequisites.

---

## 68. Contradictory evidence

Contradictory evidence must remain visible.

Examples include:

- no direct source calls exist;
- an OpenAPI operation still exposes the handler;
- a generated client includes the operation;
- no known client calls the generated method;
- gateway configuration still routes the endpoint;
- a consumer contract references the operation;
- registry metadata is stale;
- runtime deployment state is unknown.

Tool count must not act as majority voting.

Positive liveness evidence must dominate supported absence evidence.

---

## 69. Contract coverage profile

A contract coverage profile should define required dimensions such as:

- service-universe completeness;
- service identity;
- repository mapping;
- contract artifact discovery;
- contract format support;
- contract version resolution;
- external reference resolution;
- operation inventory;
- schema inventory;
- source-handler mapping;
- producer mapping;
- consumer mapping;
- generated-client mapping;
- gateway mapping;
- schema-registry coverage;
- historical-version coverage;
- external-consumer boundary;
- compatibility evaluation;
- test-consumer coverage;
- repository failure accounting;
- freshness;
- required consumer verification availability.

Every dimension must have an explicit status.

---

## 70. Coverage statuses

Contract coverage should use statuses such as:

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
- `external_scope_open`.

Only `complete` may satisfy a required dimension.

`External_scope_open` must prevent conclusions requiring a closed consumer
universe.

---

## 71. Service coverage records

Each service should have a coverage record identifying:

- service identity;
- repository mapping;
- source commit;
- contract artifacts;
- contract versions;
- operation inventory;
- schema inventory;
- producer analysis;
- consumer analysis;
- generated-client analysis;
- gateway analysis;
- registry analysis;
- test-consumer analysis;
- historical-version analysis;
- external-consumer status;
- completion status.

A failed service must not be treated as having no producers or consumers.

---

## 72. Operation coverage

Each operation should have a coverage record identifying:

- operation identity;
- source-handler mapping;
- contract exposure;
- gateway exposure;
- producer status;
- consumer status;
- generated-client status;
- test-consumer status;
- historical-version status;
- environment status;
- external-consumer status;
- compatibility status;
- completion status.

Operation-level conclusions require operation-level coverage.

---

## 73. Schema-element coverage

Each schema element should have applicable coverage for:

- contract references;
- producer serialization;
- consumer deserialization;
- generated types;
- compatibility constraints;
- historical versions;
- external consumers;
- storage or replay risk;
- framework mappings;
- completion status.

Field-level remediation must remain unavailable without field-level coverage.

---

## 74. Coverage aggregation

Contract coverage should aggregate from:

- service-universe coverage;
- repository coverage;
- contract artifact coverage;
- version coverage;
- operation coverage;
- schema coverage;
- producer coverage;
- consumer coverage;
- generated-client coverage;
- gateway coverage;
- registry coverage;
- compatibility coverage;
- external-consumer boundary;
- freshness.

A simple percentage is insufficient.

Every failed, unsupported, inaccessible, stale, or open external scope must
remain visible.

---

## 75. Contract coverage digest

A deterministic contract coverage digest should bind applicable:

- service-universe identity;
- repository-universe identity;
- service identities;
- source commits;
- contract artifact identities;
- contract version identities;
- operation identities;
- schema identities;
- producer-consumer graph;
- generated-client identities;
- gateway identities;
- registry identities;
- historical versions;
- compatibility results;
- failed and inaccessible scopes;
- external-scope state;
- completion statuses.

Changing any required input must invalidate the digest.

---

## 76. Open-world behavior

Distributed contract analysis is open-world by default.

Unknown scope may include:

- external customers;
- partner integrations;
- older deployed clients;
- mobile clients;
- browser clients;
- scripts;
- scheduled jobs;
- manually configured integrations;
- hidden message consumers;
- replayed events;
- undeclared gateways;
- unauthorized repositories;
- inaccessible registries;
- unsupported environments;
- runtime feature flags;
- deployment versions.

Unknown relevant scope must prevent unsafe removal conclusions.

---

## 77. Classification profile

A contract-aware classification profile must remain narrow.

A finding may become `candidate_dead` only when:

- the target source or contract shape is supported;
- service identity is current;
- source commit is current;
- contract identity is current;
- contract version is current;
- required service universe is defined;
- required contract artifacts are complete;
- required operation or schema coverage is complete;
- required producer and consumer coverage is complete;
- generated-client coverage is complete;
- gateway coverage is complete where applicable;
- required historical versions are covered;
- external consumer scope is closed for the profile;
- no positive liveness evidence exists;
- no unresolved possible consumer remains;
- required compatibility checks succeed;
- required analyzers succeed;
- classification is deterministic.

A classification is not a human disposition.

---

## 78. Default classification boundary

Phase 7 should default to conservative outcomes such as:

- `live`;
- `inconclusive`;
- `detection_only`;
- `unsupported`;
- `failed`;
- `stale`;
- `access_blocked`;
- `external_scope_open`.

`Candidate_dead` should initially be limited to internal, non-public contract
elements with a demonstrably closed consumer boundary.

---

## 79. Public endpoint classification

A publicly accessible endpoint must not become `candidate_dead` merely because:

- no internal repository references it;
- no generated client method is called;
- no current contract test covers it;
- it is marked deprecated;
- its handler has no direct calls.

Without complete external-consumer and runtime retirement evidence, the result
should remain inconclusive or external-scope-open.

---

## 80. Internal operation classification

An internal operation may be eligible for stronger conclusions only when:

- network boundary is closed;
- service universe is complete;
- every permitted consumer is covered;
- gateway and routing scope is complete;
- no externally published contract exists;
- historical versions are covered;
- no replay or retained-message concern applies;
- deployment and runtime uncertainty does not affect the profile.

The exact internal boundary must be documented.

---

## 81. Schema-field classification

Schema-field classification should remain detection-only by default.

A field may be reported as:

- referenced;
- unreferenced within known static scope;
- compatibility-sensitive;
- historical-data-sensitive;
- replay-sensitive;
- externally exposed;
- inconclusive;
- unsupported.

Automatic field removal should not be included in the initial Phase 7
remediation profile.

---

## 82. Classification explanation

A contract-aware explanation should include:

- target service;
- target repository;
- target commit;
- contract type;
- contract artifact;
- contract version;
- operation or schema element;
- source handler;
- service universe;
- repository universe;
- producers;
- consumers;
- possible consumers;
- inaccessible consumers;
- generated clients;
- gateways;
- registry evidence;
- historical versions;
- compatibility results;
- external-consumer status;
- runtime and deployment limitations;
- coverage digest;
- policy version;
- resulting status.

The explanation must make distributed uncertainty visible.

---

## 83. Human disposition

Human disposition remains separate from machine classification.

A contract-related disposition should bind to:

- finding ID;
- target service;
- target repository;
- target commit;
- contract artifact;
- contract version;
- operation or schema identity;
- service-universe ID;
- producer-consumer graph digest;
- evidence digest;
- coverage digest;
- classification identity;
- human actor;
- timestamp.

A material service, contract, version, consumer, or coverage change may make the
disposition stale.

---

## 84. Remediation authorization

Remediation authorization must remain separate and should bind to:

- authorization ID;
- finding ID;
- target service;
- target repository;
- target commit;
- contract identity;
- contract version;
- operation or schema identity;
- service-universe ID;
- repository-universe ID;
- producer-consumer graph digest;
- evidence digest;
- coverage digest;
- human disposition;
- transformation ID;
- permitted source files;
- permitted contract files;
- permitted generated files;
- consumer verification plan;
- publication permission;
- expiration or completion boundary;
- human authorizer.

Authorization for one handler must not permit:

- route deletion;
- gateway modification;
- schema deletion;
- topic deletion;
- consumer modification;
- contract publication;

unless each operation is explicitly included.

---

## 85. Default remediation boundary

The default Phase 7 remediation boundary should be:

- detection-only for public endpoints;
- detection-only for RPC methods;
- detection-only for message types;
- detection-only for schema fields;
- no topic or queue deletion;
- no gateway modification;
- no schema-registry deletion;
- no consumer-repository modification;
- no coordinated release.

A possible narrow remediation target may be an internal private handler helper
that is not itself a contract operation and is proven unused through the
existing language profile.

Contract-aware evidence may increase confidence without authorizing contract
surface removal.

---

## 86. Future operation-removal profile

A future narrowly supported operation-removal profile would require:

- closed internal service universe;
- exact operation identity;
- exact handler identity;
- complete consumer coverage;
- complete gateway coverage;
- complete historical-version coverage;
- compatible consumer migration state;
- current deprecation and retirement evidence;
- runtime or deployment evidence where required;
- structured source transformation;
- structured contract transformation;
- generated-client handling;
- exact compatibility tests;
- separate authorization for every changed repository.

This profile should not be assumed complete merely because Phase 7 exists.

---

## 87. Exact distributed reproduction

Before any contract-aware remediation, DCAv2 must reproduce:

- target service identity;
- target repository and commit;
- contract artifact identity;
- contract version identity;
- operation or schema identity;
- source-handler mapping;
- service-universe identity;
- repository-universe identity;
- every required repository commit;
- producer-consumer graph;
- generated-client identities;
- gateway identities;
- registry identities where used;
- historical-version set;
- evidence digest;
- coverage digest;
- human disposition;
- remediation authorization.

Any material mismatch must block transformation.

---

## 88. Reproduction failure

Reproduction must fail when applicable:

- target source changed;
- contract changed;
- contract version changed;
- operation identity changed;
- handler mapping changed;
- consumer repository changed;
- a new consumer appeared;
- generated client changed;
- gateway configuration changed;
- registry subject changed;
- historical version set changed;
- compatibility policy changed;
- external scope reopened;
- coverage became partial;
- authorization expired;
- disposition became stale.

Approximate reuse of a prior distributed finding must not proceed.

---

## 89. Target baseline gates

Target-service baseline gates should follow the language, framework, and
contract profile.

Applicable gates may include:

- dependency preparation;
- parsing;
- type checking;
- compilation;
- build;
- unit tests;
- integration tests;
- contract generation;
- contract validation;
- route enumeration;
- schema validation;
- compatibility checks;
- generated-client generation;
- repository-status validation.

Every required target gate must pass or satisfy an explicitly authorized
pre-existing-failure policy.

---

## 90. Contract baseline artifacts

Baseline contract artifacts should identify:

- contract type;
- contract version;
- generator;
- generator version;
- source commit;
- configuration;
- artifact digest;
- validation result;
- canonicalization result;
- external-reference state.

A generated baseline contract must not be reused after source or generator
changes.

---

## 91. Consumer verification plan

The remediation authorization should define whether consumer verification is:

- required for every confirmed consumer;
- required for every possible internal consumer;
- required for generated clients;
- required for contract-test consumers;
- required for historical supported versions;
- unavailable;
- not applicable under a proven private-helper profile.

The plan should identify:

- consumer services;
- repositories;
- source commits;
- contract versions;
- commands;
- candidate contract or artifact;
- substitution method;
- expected results;
- security profile;
- cleanup.

Undefined consumer verification must not be assumed sufficient.

---

## 92. Compatibility verification strategies

Potential bounded strategies include:

- static compatibility comparison;
- provider contract tests;
- consumer-driven contract verification;
- generated-client regeneration;
- consumer compilation against a candidate client;
- consumer tests against a candidate service artifact;
- schema-registry compatibility check in a test environment;
- message serialization and deserialization tests;
- RPC client/server compatibility tests.

Each strategy requires a versioned profile and explicit authorization.

---

## 93. Candidate contract artifacts

A candidate contract artifact may be generated locally in the untrusted runner.

The record should identify:

- target source commit;
- patched source digest;
- generator;
- generator version;
- command identity;
- contract type;
- contract version;
- artifact digest;
- changed operations;
- changed schemas;
- validation result;
- compatibility result;
- retention policy.

Generating a candidate contract does not authorize publishing it.

---

## 94. Generated-client verification

When generated clients are required, the verification should identify:

- source candidate contract;
- generator identity;
- generator version;
- generated language;
- generated package;
- generated source digest;
- consumer repository;
- consumer commit;
- build and test commands;
- changed generated API surface;
- result;
- cleanup.

Generated-client changes must remain isolated unless separately authorized for
publication.

---

## 95. Consumer baseline

Before testing a candidate contract or target change, each required consumer
baseline should record:

- consumer service;
- repository;
- source commit;
- consumed contract version;
- generated-client version;
- environment;
- selected commands;
- existing failures;
- unavailable gates;
- result identity.

A failing consumer baseline must not be hidden by candidate verification.

---

## 96. Consumer candidate comparison

The comparison should identify:

- newly introduced compilation failures;
- newly introduced type failures;
- newly introduced contract-test failures;
- changed generated-client APIs;
- changed serialization results;
- changed schema-validation results;
- changed RPC compatibility;
- changed route or gateway expectations;
- unchanged pre-existing failures;
- unavailable gates.

A matching aggregate exit code is insufficient when diagnostics changed
materially.

---

## 97. Structured transformation

Any Phase 7 transformation must be structured and contract-aware.

The transformation must bind to:

- target repository;
- target commit;
- target service;
- contract artifact;
- contract version;
- operation or schema element;
- source handler where applicable;
- transformation version;
- expected rewrite count;
- permitted files;
- evidence digest;
- coverage digest;
- consumer verification plan.

Plain text deletion must not be used for contract or source changes when syntax
or semantic ambiguity exists.

---

## 98. Multi-artifact changes

A contract-aware remediation may affect:

- source handler;
- route registration;
- authored contract;
- generated contract;
- generated client;
- tests;
- gateway configuration;
- compatibility metadata.

Each changed artifact requires:

- explicit authorization;
- exact identity;
- structured transformation;
- changed-file validation;
- baseline and post-change gates;
- repository-specific publication authorization.

One finding must not authorize an uncontrolled multi-repository campaign.

---

## 99. Changed-file validation

Changed-file validation must apply separately to every authorized repository.

The validator must detect:

- source changes;
- contract changes;
- generated-client changes;
- manifest changes;
- lockfile changes;
- gateway configuration changes;
- registry configuration changes;
- schema changes;
- generated artifacts;
- file modes;
- symbolic links;
- binary files.

Any file outside the repository-specific authorization must cause failure.

---

## 100. Post-change target gates

After transformation, required target gates must confirm applicable:

- source parsing;
- type checking;
- compilation;
- build;
- tests;
- contract generation;
- contract validation;
- route enumeration;
- schema validation;
- compatibility checks;
- generated artifact consistency;
- changed-file authorization;
- patch determinism.

---

## 101. Post-change consumer gates

Required consumer gates must run against the candidate contract or target
artifact.

The result should preserve:

- consumer service;
- consumer repository;
- consumer commit;
- candidate contract digest;
- candidate artifact digest;
- generated-client digest;
- selected commands;
- baseline comparison;
- status;
- limitations;
- cleanup.

A consumer test against the previous contract does not validate the candidate
change.

---

## 102. Patch generation

The target patch record should include applicable:

- target service;
- target repository;
- base commit;
- contract artifact;
- contract version;
- operation or schema identity;
- service-universe ID;
- repository-universe ID;
- producer-consumer graph digest;
- generated-client identities;
- gateway identities;
- registry identities;
- historical-version set;
- evidence digest;
- coverage digest;
- target gate results;
- consumer gate results;
- transformation ID;
- changed files;
- patch hash;
- secret-scan result.

Patch generation does not authorize publication.

---

## 103. Contract publication

Publishing a contract, schema, client, or artifact is outside the default
Phase 7 scope.

DCAv2 must not:

- publish a new schema version;
- delete a schema;
- change registry compatibility mode;
- publish a client package;
- publish a service package;
- create a release;
- modify a production gateway;
- delete a topic or queue;
- update production routing;

without separately defined capabilities and explicit authorization.

---

## 104. Trusted source publication

When separately authorized, source publication must continue through the
trusted publisher.

The publisher must validate:

- target repository identity;
- prohibited-repository policy;
- target base commit;
- target service identity;
- contract identity;
- operation or schema identity;
- human disposition;
- remediation authorization;
- evidence and coverage digests;
- target gate results;
- required consumer gate results;
- patch hash;
- changed-file set;
- branch policy;
- draft-only operation;
- idempotency identity.

The publisher must not execute service code, contract generators, clients,
tests, gateways, or registry operations.

---

## 105. Consumer repository publication

Creating branches or pull requests in consumer repositories is outside the
default Phase 7 scope.

Such operations require:

- separate repository-specific authorization;
- separate transformation identity;
- separate patch;
- separate verification;
- separate trusted publication request;
- separate audit trail.

A target contract-remediation authorization must not authorize consumer changes.

---

## 106. Database evolution

Phase 7 may persist concepts such as:

- service universes;
- service identities;
- service-to-repository mappings;
- contract artifacts;
- contract versions;
- operations;
- schema elements;
- producer-consumer relationships;
- generated-client identities;
- gateway mappings;
- registry identities;
- historical contract versions;
- compatibility results;
- service coverage;
- operation coverage;
- schema-element coverage;
- consumer verification plans;
- consumer gate results.

Persistence changes must use additive ordered migrations.

Historical source-only and cross-repository findings must remain interpretable.

---

## 107. Migration compatibility

Migration testing should include:

- fresh installation;
- upgrade from the Phase 6 schema;
- existing repository universes;
- service universes;
- service identities;
- contract artifacts;
- contract versions;
- operations;
- schema elements;
- producer-consumer edges;
- generated-client records;
- gateway records;
- registry records;
- historical versions;
- partial contract coverage;
- multiple tenants;
- migration failure;
- retry;
- projection rebuild;
- audit preservation.

Existing migrations must not be rewritten.

---

## 108. Audit requirements

Phase 7 should produce audit events for applicable:

- service universe proposed;
- service universe authorized;
- service discovered;
- service identity conflict detected;
- repository mapping created;
- contract artifact discovered;
- contract artifact rejected;
- contract version recorded;
- operation discovered;
- schema element discovered;
- producer discovered;
- consumer discovered;
- possible external consumer recorded;
- generated client mapped;
- gateway route mapped;
- registry metadata read;
- compatibility check completed;
- compatibility check failed;
- contract coverage completed;
- contract coverage partial;
- finding classified;
- human disposition recorded;
- remediation authorized;
- finding reproduced;
- target gate completed;
- consumer gate completed;
- transformation completed;
- unexpected file rejected;
- patch created;
- source publication requested;
- cleanup completed;
- cleanup failed.

Audit events must remain tenant-scoped and secret-free.

---

## 109. Tenant isolation

Service and contract information must be tenant-scoped.

One tenant must not access another tenant's:

- service catalog;
- repository mapping;
- private contracts;
- schema registry metadata;
- generated clients;
- gateway configuration;
- producer-consumer graph;
- findings;
- credentials;
- authorization;
- consumer verification results;
- patches;
- artifacts.

Shared public contract metadata must still retain source and access
classification.

---

## 110. Credential boundaries

Credential capabilities may include:

- repository read credential;
- package-registry read credential;
- test schema-registry read credential;
- test gateway metadata credential;
- test message-system metadata credential;
- controller database credential;
- trusted publisher credential.

The untrusted runner may receive only the minimum explicitly authorized test or
read capability for one stage.

It must never receive:

- trusted publisher credentials;
- controller database credentials;
- unrestricted production gateway credentials;
- unrestricted production broker credentials;
- production schema-registry administrative credentials;
- unrelated cloud credentials;
- customer credentials.

---

## 111. Production access

Production access is denied by default.

Phase 7 should prefer:

- repository-contained contracts;
- test fixtures;
- synthetic registries;
- local brokers;
- mocked gateways;
- sandbox environments;
- test service catalogs;
- exported metadata approved by the operator.

Access to any live production system requires explicit system-specific
authorization and a separately reviewed threat model.

---

## 112. Network profiles

Phase 7 should use separate network profiles for applicable stages:

- provider read-only source acquisition;
- package-registry-only dependency installation;
- authorized test schema-registry metadata access;
- authorized test gateway metadata access;
- authorized test broker metadata access;
- network-disabled contract parsing;
- network-disabled static analysis;
- local test-service compatibility checks;
- provider-publish-only trusted source publication.

Repository content must not broaden these profiles.

---

## 113. Runner requirements

Service source, contract parsers, generators, build systems, analyzers, tests,
local brokers, local registries, and compatibility tools must run in approved
untrusted runner profiles.

The profiles must enforce applicable:

- non-root execution;
- no privileged mode;
- no Docker socket;
- no trusted credentials;
- explicit environment allowlist;
- repository-specific mounts;
- no uncontrolled cross-repository writes;
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

A local broker or registry must not expose host or production network access.

---

## 114. Local test systems

Phase 7 may use isolated test systems such as:

- local HTTP servers;
- local gRPC servers;
- local schema registries;
- local message brokers;
- local gateway simulators;
- local contract brokers;
- local databases with synthetic data.

Every local system must define:

- image or binary identity;
- version;
- network namespace;
- credentials;
- data fixtures;
- resource limits;
- startup health check;
- shutdown behavior;
- cleanup;
- artifact retention.

Tests must not connect to production by fallback.

---

## 115. Contract artifact security

Contract artifacts may contain:

- internal hostnames;
- server URLs;
- authentication descriptions;
- private schemas;
- sensitive field names;
- examples containing secrets;
- customer identifiers.

DCAv2 must:

- treat artifacts as confidential;
- bound report output;
- redact secret values;
- avoid exposing full private schemas unnecessarily;
- avoid publishing private contract contents in pull-request descriptions;
- preserve tenant isolation;
- scan exported artifacts as defense in depth.

---

## 116. Prompt-injection resistance

Instructions found in:

- contract descriptions;
- schema comments;
- API examples;
- operation summaries;
- gateway configuration;
- registry metadata;
- generated clients;
- event payload examples;
- test output;
- build output;
- service catalogs;
- commit messages;

must remain untrusted data.

They must not:

- broaden the service universe;
- authorize another repository or system;
- select production credentials;
- add network destinations;
- change compatibility policy;
- mark unknown consumers absent;
- mark failed contract parsing complete;
- create human disposition;
- authorize remediation;
- trigger contract publication;
- trigger source publication;
- modify governance.

---

## 117. Secret handling

Contract and microservice workflows may expose secrets through:

- server URLs;
- registry URLs;
- broker URLs;
- gateway configuration;
- authentication examples;
- environment variables;
- generated clients;
- build logs;
- test logs;
- request or response examples;
- event examples;
- traces accidentally included in fixtures;
- pull-request descriptions;
- audit events.

DCAv2 must:

- use synthetic credentials in tests;
- redact credential-bearing URLs;
- avoid full environment dumps;
- bound output;
- isolate credentials by system and stage;
- remove temporary credentials;
- record credential capability rather than value.

---

## 118. Phase 7 test manifest

Phase 7 should receive a dedicated test manifest such as:

`codex/tests/phase-7-tests.yaml`

If introduced, the file must conform to:

`codex/tests/phase-test-manifest.schema.json`

The manifest must identify concrete required and conditional test IDs.

The phrase “run relevant tests” is insufficient.

---

## 119. Minimum service-identity tests

Service-identity tests should cover:

- one service in one repository;
- several services in one repository;
- one service across several repositories;
- duplicate service names;
- service rename;
- stale service catalog entry;
- conflicting repository mapping;
- generated contract repository;
- service without source repository;
- environment-specific alias;
- deterministic service digest;
- tenant isolation.

---

## 120. Minimum contract-discovery tests

Contract-discovery tests should cover:

- authored contract;
- generated contract;
- several contract types;
- several versions;
- malformed contract;
- unsupported format version;
- external reference;
- unresolved external reference;
- generated contract from wrong commit;
- stale generated contract;
- duplicate contract title;
- symbolic-link escape;
- oversized contract;
- secret-bearing example redaction.

---

## 121. Minimum operation-identity tests

Operation tests should cover:

- HTTP method and path;
- same path with different methods;
- versioned path;
- RPC service and method;
- same method name in different services;
- GraphQL field on different types;
- message topic and event type;
- operation renamed;
- operation ID changed;
- source-handler mapping;
- ambiguous source-handler mapping;
- deterministic operation digest.

---

## 122. Minimum schema-identity tests

Schema tests should cover:

- request type;
- response type;
- message type;
- nested field;
- enum value;
- recursive type;
- local reference;
- cross-file reference;
- cross-repository reference;
- unresolved reference;
- duplicate type names;
- field renamed;
- field number changed;
- generated schema;
- deterministic schema identity.

---

## 123. Minimum OpenAPI tests

OpenAPI tests should cover:

- supported specification version;
- unsupported version;
- path and method inventory;
- local schema reference;
- external schema reference;
- operation-ID mapping;
- source-handler mapping;
- generated client;
- gateway route;
- deprecated operation;
- vendor extension;
- malformed document;
- stale generated document;
- contract with no operations.

---

## 124. Minimum messaging tests

Messaging tests should cover:

- explicit producer;
- explicit consumer;
- decorator-based consumer;
- generated producer;
- static topic;
- configuration-driven topic;
- dynamic unresolved topic;
- event version;
- schema registry subject;
- retained historical event;
- replay-sensitive consumer;
- consumer group;
- topic with no known consumer;
- failed broker metadata access;
- test-only consumer.

---

## 125. Minimum gRPC and Protobuf tests

When included, tests should cover:

- service definition;
- unary RPC;
- streaming RPC;
- request message;
- response message;
- imported schema;
- generated client;
- source-handler mapping;
- field removal compatibility;
- field-number reuse rejection;
- reserved field;
- package rename;
- stale generated client;
- unsupported option or extension.

---

## 126. Minimum GraphQL tests

When included, tests should cover:

- query field;
- mutation field;
- subscription field;
- resolver mapping;
- input type;
- output type;
- fragment usage;
- generated client operation;
- persisted query;
- schema composition;
- external client uncertainty;
- deprecated field;
- field with no known internal query;
- unsupported directive.

---

## 127. Minimum producer-consumer tests

Relationship tests should cover:

- exact operation consumer;
- package-level dependency only;
- generated-client package dependency;
- exact generated-client method call;
- configuration consumer;
- gateway-only exposure;
- test-only consumer;
- historical consumer version;
- inaccessible consumer;
- unauthorized consumer;
- possible external consumer;
- consumer removed after analysis;
- new consumer added after classification.

---

## 128. Minimum compatibility tests

Compatibility tests should cover applicable:

- additive field;
- required field added;
- optional field removed;
- operation removed;
- response narrowed;
- enum value removed;
- RPC method removed;
- Protobuf field-number reuse;
- GraphQL field removal;
- event schema change;
- consumer-pinned older version;
- unsupported compatibility mode;
- malformed compatibility output;
- stale baseline contract.

---

## 129. Minimum coverage tests

Coverage tests should cover:

- complete internal service universe;
- incomplete repository mapping;
- malformed contract;
- unsupported contract version;
- unresolved external reference;
- failed generated-client analysis;
- unknown gateway route;
- inaccessible schema registry;
- historical version unavailable;
- external consumer scope open;
- consumer repository failed;
- compatibility tool failed;
- new consumer added;
- contract changed after analysis;
- service identity changed.

Complete coverage must require every relevant dimension.

---

## 130. Minimum classification tests

Classification tests should verify:

- exact internal consumer produces `live`;
- generated-client method use produces `live`;
- gateway exposure produces liveness or exposure evidence;
- route handler with no direct calls remains live;
- message consumer with no direct calls remains live;
- public endpoint with unknown consumers remains external-scope-open;
- deprecated endpoint remains potentially live;
- failed consumer analysis does not produce absence;
- unsupported contract feature produces inconclusive or unsupported;
- stale contract produces stale classification;
- positive evidence dominance;
- input-order independence.

---

## 131. Minimum disposition tests

Disposition tests should cover:

- `confirmed_dead`;
- `confirmed_live`;
- `needs_investigation`;
- service-universe mismatch;
- contract-version mismatch;
- operation mismatch;
- producer-consumer graph mismatch;
- stale coverage rejection;
- external scope reopened;
- revocation;
- supersession;
- history preservation;
- prevention of automatic remediation authority.

---

## 132. Minimum remediation-authorization tests

Authorization tests should cover:

- exact valid target authorization;
- missing authorization;
- expired authorization;
- revoked authorization;
- wrong service;
- wrong repository;
- wrong commit;
- wrong contract;
- wrong contract version;
- wrong operation;
- wrong producer-consumer graph;
- wrong evidence digest;
- wrong coverage digest;
- unauthorized contract-file change;
- unauthorized consumer change;
- missing consumer verification plan;
- stale disposition;
- reuse after completion.

Every mismatch must deny remediation.

---

## 133. Minimum reproduction tests

Reproduction tests should cover:

- exact service and operation reproduced;
- target source changed;
- contract changed;
- operation renamed;
- handler mapping changed;
- consumer repository changed;
- new consumer added;
- generated client changed;
- gateway route changed;
- registry version changed;
- historical version added;
- external scope reopened;
- coverage reduced;
- authorization expired.

Approximate distributed reproduction must never proceed.

---

## 134. Minimum consumer-verification tests

Consumer verification tests should cover:

- static consumer reanalysis;
- generated client regeneration;
- consumer compilation against candidate client;
- provider contract test;
- consumer-driven contract test;
- message serialization test;
- message deserialization test;
- RPC compatibility test;
- consumer baseline failure;
- candidate introduces failure;
- consumer environment unavailable;
- candidate contract digest mismatch;
- temporary substitution cleanup;
- no committed consumer changes.

---

## 135. Minimum remediation tests

Remediation tests should cover:

- narrow private helper removal with contract evidence unchanged;
- unauthorized endpoint removal rejected;
- unauthorized schema-field removal rejected;
- unauthorized gateway change rejected;
- unauthorized topic change rejected;
- contract artifact changed unexpectedly;
- generated client changed unexpectedly;
- target baseline failure;
- consumer verification failure;
- incomplete historical-version coverage;
- external consumer scope open;
- deterministic patch;
- idempotent transformation;
- stale authorization.

---

## 136. Minimum publisher tests

Publisher tests should cover:

- exact target service;
- exact target repository;
- wrong contract digest;
- stale producer-consumer graph;
- stale coverage digest;
- missing target gate;
- missing required consumer gate;
- unexpected contract change;
- unexpected generated-client change;
- wrong patch hash;
- default-branch rejection;
- draft pull-request creation;
- no consumer repository publication;
- no contract registry publication;
- idempotent retry;
- provider partial state;
- Git-hook suppression;
- publisher inability to execute service or contract tools.

Live provider tests require separate authorization.

---

## 137. Minimum migration tests

Migration tests should cover:

- fresh database;
- upgrade from Phase 6;
- existing repository universes;
- service universes;
- service identities;
- service-repository mappings;
- contract artifacts;
- contract versions;
- operations;
- schema elements;
- producer-consumer edges;
- generated clients;
- gateways;
- registries;
- historical versions;
- partial contract coverage;
- consumer gate results;
- multiple tenants;
- failed migration;
- retry;
- projection rebuild;
- audit preservation.

---

## 138. Minimum security tests

Security tests should cover:

- one tenant cannot read another tenant's contracts;
- repository contracts cannot select production systems;
- contract examples cannot expose synthetic secrets;
- test registry credentials are scoped;
- test broker credentials are scoped;
- gateway credentials are unavailable to repository code;
- publisher credentials are unavailable to the runner;
- production fallback is rejected;
- external contract reference path traversal is rejected;
- oversized schema is bounded;
- local broker cannot reach production networks;
- Docker socket is unavailable;
- cloud metadata is unavailable;
- background service processes are terminated;
- temporary credentials and test systems are cleaned.

---

## 139. Fixture strategy

Phase 7 should use fixtures representing:

- one internal HTTP provider;
- one direct HTTP consumer;
- one generated-client consumer;
- one gateway route;
- one public endpoint with unknown external consumers;
- one gRPC provider and client;
- one message producer;
- one message consumer;
- one retained historical event;
- one schema-registry fixture;
- one GraphQL provider and query consumer;
- one consumer-driven contract;
- one inaccessible consumer;
- one unsupported contract feature;
- one malicious contract example;
- alternate service, repository, operation, schema, and topic names.

Production behavior must not contain fixture-specific branches.

---

## 140. External system testing

Every external service, registry, gateway, or broker test requires explicit
authorization.

The authorization must identify:

- canonical system identity;
- environment;
- permitted metadata;
- permitted reads;
- permitted writes;
- network destination;
- credential capability;
- test isolation;
- data retention;
- cleanup;
- production prohibition or permission;
- rate limits;
- required test IDs.

Historical access does not constitute current authorization.

---

## 141. Scale boundary

Phase 7 establishes bounded functional contract and microservice analysis.

The phase report must state tested limits such as:

- service count;
- repository count;
- contract artifact count;
- operation count;
- schema-element count;
- producer-consumer edge count;
- generated-client count;
- historical-version count;
- gateway-route count;
- registry-subject count;
- analysis duration;
- compatibility-check duration;
- peak memory;
- database growth;
- artifact size.

Phase 7 must not claim organization-wide distributed-system coverage.

Broader scale validation belongs to Phase 10.

---

## 142. Detection capability acceptance criteria

Contract-aware detection may become `functional` only when:

1. Service universes are explicit and versioned.
2. Service identity is deterministic.
3. Service-to-repository mapping preserves ambiguity.
4. Contract artifacts have exact source and content identities.
5. Supported format versions are explicit.
6. Malformed contracts cannot become empty contracts.
7. Operation identity is deterministic.
8. Schema-element identity is deterministic.
9. Producer and consumer relationships preserve exact provenance.
10. Generated-client mappings preserve source contract identity.
11. Gateway and registry scope is explicit.
12. Historical versions remain visible.
13. External-consumer boundaries remain explicit.
14. Failed consumers do not become absence evidence.
15. Contract coverage is explicit.
16. Open-world uncertainty is preserved.
17. Classification is deterministic and conservative.
18. Generalization beyond one fixture is demonstrated.
19. Required security, migration, and phase tests pass.

---

## 143. Remediation capability acceptance criteria

A contract-aware remediation capability may become `functional` only when:

1. The target shape is narrowly supported.
2. Target service identity is current.
3. Target repository and commit are current.
4. Contract identity and version are current.
5. Operation or schema identity is exact.
6. Service and repository universes are complete for the profile.
7. Producer-consumer graph is current.
8. Required operation and schema coverage is complete.
9. Required generated-client coverage is complete.
10. Required gateway and registry coverage is complete.
11. Required historical versions are covered.
12. External consumer scope is closed.
13. Human disposition is current.
14. Separate remediation authorization is current.
15. Exact distributed reproduction succeeds.
16. Required target baseline gates pass.
17. Required consumer baselines are recorded.
18. Required candidate consumer gates pass.
19. Structured transformations are deterministic.
20. Every changed repository has separate authorization.
21. Required post-change gates pass.
22. Patch generation is deterministic.
23. Contract or artifact publication remains separately authorized.
24. Required runner controls pass.
25. Required migration and phase tests pass.

---

## 144. Detection-only outcome

Phase 7 may validly complete with detection-only support when:

- service identity is implemented;
- contract inventory is implemented;
- producer-consumer relationships are implemented;
- generated-client mappings are implemented;
- contract coverage is implemented;
- classifications remain conservative;
- external consumer scope remains visible;
- remediation or consumer verification remains unavailable;
- unsupported remediation behavior is explicit;
- the active completion scope permits detection-only support.

Detection-only contract support is a valid bounded capability.

---

## 145. Partially supported outcome

Contract capability may remain `partially_supported` when, for example:

- OpenAPI is supported but AsyncAPI is not;
- operation-level analysis works but field-level analysis does not;
- internal consumers are supported but external consumers remain unknown;
- generated clients are mapped for one language only;
- static gateway configuration is supported but dynamic routing is not;
- one registry is supported but another is not;
- compatibility checks work but consumer verification does not;
- detection works but remediation does not;
- current contracts are covered but historical versions are not.

The exact unsupported dimensions must remain explicit.

---

## 146. Blocked outcome

Phase 7 must remain blocked when applicable:

- service universe is ambiguous;
- service identity is ambiguous;
- service-to-repository mapping is incomplete;
- required contract artifact is inaccessible;
- required contract format is unsupported;
- external contract reference is unresolved;
- target operation identity is ambiguous;
- required consumer repository is inaccessible;
- required generated client is stale;
- gateway mapping is incomplete;
- required registry access is unauthorized;
- historical version scope is incomplete;
- external consumer scope remains open for a removal decision;
- compatibility checking fails;
- required consumer verification is unavailable;
- required runner control fails;
- migration tests fail;
- tenant isolation fails;
- required tests fail or are unavailable;
- exact distributed reproduction fails;
- dominant liveness evidence appears;
- authorization expires or is revoked.

A blocked result must identify the exact safe next action.

---

## 147. Phase completion criteria

Phase 7 may be reported complete only when all applicable criteria are
satisfied:

1. Service-universe definitions are implemented.
2. Canonical service identity is implemented.
3. Service-to-repository mapping is implemented.
4. Contract artifact discovery is implemented.
5. Supported contract types and versions are explicit.
6. Contract parsing preserves malformed and unsupported states.
7. Contract version identity is implemented.
8. Operation identity is deterministic.
9. Schema-element identity is deterministic.
10. Source-handler mapping is implemented for supported profiles.
11. Producer relationships are implemented.
12. Consumer relationships are implemented.
13. Generated-client relationships are implemented.
14. Gateway relationships are implemented where supported.
15. Registry relationships are implemented where supported.
16. Historical contract versions remain visible.
17. External consumer scope is explicit.
18. Compatibility evidence is implemented for supported profiles.
19. Contract coverage is implemented.
20. Partial contract coverage preserves uncertainty.
21. Classification is deterministic and conservative.
22. Human disposition remains separate.
23. Remediation authorization remains separate.
24. Exact reproduction includes distributed contract identities.
25. Target baseline gates are implemented.
26. Required consumer verification is implemented when remediation is included.
27. Unauthorized consumer, gateway, registry, and contract publication is
    prevented.
28. Required database migrations pass.
29. Required security controls pass.
30. Required Phase 7 tests pass.
31. Triggered conditional tests pass.
32. Capability statuses are updated truthfully.
33. Security-control matrix is updated.
34. Phase report is complete.
35. Execution state is updated.
36. No unresolved blocker contradicts completion.

Detection-only completion is valid when the active authorization and test
manifest define detection-only scope.

---

## 148. Phase report

The Phase 7 completion report should include:

- authorization identity;
- objective;
- source commit before and after;
- files changed;
- migrations;
- dependencies;
- service-universe profiles;
- service identities;
- repository mappings;
- contract types;
- contract format versions;
- contract artifact counts;
- operation counts;
- schema-element counts;
- producer-consumer relationships;
- generated-client relationships;
- gateway relationships;
- registry relationships;
- historical-version behavior;
- external-consumer behavior;
- compatibility behavior;
- contract coverage;
- classification behavior;
- target baseline gates;
- consumer verification;
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

The report must not describe bounded static contract coverage as complete runtime
or production consumer coverage.

---

## 149. Execution-state handoff

The Phase 7 handoff should identify:

- phase status;
- authorization status;
- source commit;
- worktree state;
- supported service-universe profiles;
- supported contract types;
- supported contract versions;
- supported operation identities;
- supported schema identities;
- producer-consumer capability;
- generated-client capability;
- gateway and registry capability;
- compatibility capability;
- detection-only capabilities;
- remediation-supported capabilities;
- unresolved runtime and external-consumer scope;
- test manifest;
- test results;
- security-control results;
- migrations;
- external operations;
- retained external state;
- cleanup state;
- next human decision.

The handoff must not authorize Phase 8.

---

## 150. Transition to Phase 8

Phase 8 may be proposed when source, repository, package, contract, producer,
and consumer relationships are bounded and the remaining evidence gaps require
infrastructure, deployment, and runtime observations.

Before Phase 8 begins:

1. Finalize the Phase 7 report.
2. Update execution state.
3. Stop Phase 7 implementation.
4. Present actual contract capability statuses.
5. Record unresolved runtime and infrastructure scope.
6. Prepare a Phase 8 authorization.
7. Obtain explicit human approval.

Phase 8 must not start automatically.

---

## 151. Phase stop conditions

Work must stop when:

- Phase 7 authorization is inactive;
- authorization expires;
- authorization is revoked;
- service, repository, system, or operation scope is exceeded;
- a prohibited repository is encountered;
- a production system would be accessed without explicit permission;
- service identity cannot be verified;
- contract identity cannot be verified;
- required contract parsing fails;
- required external reference cannot be resolved safely;
- required consumer access is unavailable;
- required gateway or registry access is unauthorized;
- required credential capability is unavailable;
- historical-version coverage is incomplete;
- external consumer scope remains open for a removal decision;
- required compatibility checking fails;
- required consumer verification cannot run;
- required runner controls fail;
- a destructive migration would be required without permission;
- a required test fails or is unavailable;
- tenant isolation fails;
- exact distributed reproduction fails;
- coverage becomes incomplete;
- dominant liveness evidence appears;
- changed files exceed authorization;
- a consumer repository would need modification without authorization;
- a contract, schema, topic, or gateway would be published or modified without
  authorization;
- secret exposure is suspected;
- local user work cannot be preserved;
- external state becomes unknown and cannot be reconciled safely.

Stopping must be recorded truthfully.

---

## 152. Fail-safe behavior

When service identity, repository mapping, contract identity, contract version,
operation identity, schema identity, producer or consumer scope, generated
clients, gateway routes, registry metadata, historical versions, external
consumer scope, compatibility, evidence, coverage, verification, remediation,
or publication state cannot be established confidently:

- do not report complete contract or microservice support;
- do not access production systems;
- do not treat inaccessible consumers as absent;
- do not treat malformed contracts as empty;
- do not infer operation identity from names alone;
- do not treat generated-client presence as exact usage;
- do not treat missing generated-client calls as distributed absence;
- do not treat deprecated contracts as unused;
- do not treat unknown historical versions as retired;
- do not treat open external consumer scope as closed;
- do not create human disposition automatically;
- do not infer remediation authorization;
- do not remove endpoints, fields, messages, topics, or RPC methods;
- do not modify consumer repositories;
- do not publish contracts or artifacts;
- do not modify gateways, registries, brokers, or production routing;
- do not generate a publication-eligible patch;
- do not publish;
- preserve available evidence;
- return an explicit partial, external-scope-open, access-blocked,
  detection-only, unsupported, failed, stale, configuration-required, or
  blocked result;
- identify the exact missing requirement.

Distributed-system uncertainty must reduce classification, remediation, and
publication authority.

---

## 153. Document integrity

This roadmap file must not be modified during Phase 7 implementation unless
roadmap or governance modification is explicitly authorized.

Changes require:

1. Identification of the Phase 7 planning problem.
2. Review against the roadmap overview.
3. Review against permanent safety invariants.
4. Review of service-universe and repository-access implications.
5. Review of contract identity and version implications.
6. Review of producer, consumer, gateway, and registry implications.
7. Review of compatibility and historical-version implications.
8. Review of external-consumer and open-world implications.
9. Review of remediation and publication implications.
10. Review of authorization and testing impact.
11. Updated Phase 7 test manifest where applicable.
12. Updated schemas or capability definitions where applicable.
13. A reviewable governance commit.
14. An ADR when the change alters long-lived service identity, contract
    identity, producer-consumer, compatibility, registry, or distributed
    remediation semantics.

This roadmap must not be weakened to make incomplete consumer coverage,
unresolved external scope, stale contracts, failed compatibility checks,
failed tests, unauthorized production access, or unsafe distributed
remediation appear acceptable.