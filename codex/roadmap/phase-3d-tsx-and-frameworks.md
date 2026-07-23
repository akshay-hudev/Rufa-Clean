# Phase 3D — TSX and Frameworks

This document defines the planned scope, capability boundaries, evidence
requirements, tests, stop conditions, and completion criteria for Phase 3D of
DCAv2.

Phase 3D expands TypeScript analysis beyond plain TypeScript source into bounded
TSX, JSX, and selected framework-convention support.

Framework behavior must be modeled through explicit evidence adapters and
versioned coverage profiles.

The presence of a framework, decorator, route file, component, configuration
file, or naming convention must not automatically prove that a symbol is live
or dead.

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
  id: phase-3d-tsx-and-frameworks
  name: TSX and Frameworks
  roadmap_order: 3D
  default_status: inactive
  implementation_authorized_by_this_file: false
```

The phase becomes active only when the current authorization record explicitly
identifies `phase-3d-tsx-and-frameworks` as active.

---

## 2. Primary objective

The primary objective is to add conservative, evidence-backed support for
selected TypeScript and JavaScript syntax and framework conventions.

The phase should implement and validate applicable:

1. TSX and JSX parsing.
2. Component declaration inventory.
3. Component-reference evidence.
4. JSX element resolution.
5. Framework-entry-point discovery.
6. Route-registration evidence.
7. Dependency-injection evidence.
8. Decorator and annotation evidence.
9. Event-handler registration evidence.
10. Scheduled-job registration evidence.
11. Plugin and extension discovery.
12. Serialization and reflection hooks.
13. Configuration-driven liveness.
14. Framework-specific coverage profiles.
15. Detection-only classification for unresolved dynamic conventions.
16. Structured remediation for narrowly supported framework shapes.
17. Framework-aware baseline and post-change gates.
18. Trusted draft publication when separately authorized.

Each framework adapter must have an independent support status.

---

## 3. Intended capability

The intended capability is conceptually:

```text
Analyze supported TypeScript and TSX repositories using versioned syntax and
framework evidence adapters, distinguish ordinary semantic references from
framework-discovered liveness, and remediate only narrowly supported symbols
when required source, configuration, convention, and runtime-registration
coverage is complete.
```

The capability must remain constrained by:

- supported TypeScript and JavaScript versions;
- supported TSX and JSX syntax;
- supported framework versions;
- supported build and routing conventions;
- supported decorator and metadata semantics;
- supported configuration formats;
- supported code-generation behavior;
- explicit framework coverage;
- conservative handling of reflection and dynamic registration;
- exact finding reproduction;
- supported structured transformations;
- required package and repository gates;
- runner security;
- trusted publication controls.

---

## 4. Phase prerequisites

Phase 3D should not begin until earlier phases have established or bounded:

- immutable source identity;
- package-manager qualification;
- workspace package identity;
- package graph construction;
- package-aware evidence;
- package-aware coverage;
- project-reference handling;
- path-alias handling;
- package-export handling;
- structured command execution;
- runner isolation;
- exact finding reproduction;
- structured transformation;
- changed-file validation;
- baseline and post-change verification;
- trusted publication separation.

The qualification system must be able to detect relevant syntax and framework
indicators without treating detection as support.

---

## 5. Non-goals

Phase 3D does not, by default, include:

- universal React support;
- universal Angular support;
- universal Vue support;
- universal Next.js support;
- universal NestJS support;
- universal Express support;
- every frontend framework;
- every backend framework;
- every bundler;
- every router;
- every dependency-injection container;
- every decorator library;
- arbitrary reflection analysis;
- complete runtime registration discovery;
- complete template-language analysis;
- cross-repository frontend consumer discovery;
- browser runtime telemetry;
- production traffic analysis;
- generated-code remediation;
- automatic public component removal;
- automatic route removal;
- automatic API-handler removal;
- automatic framework configuration changes;
- automatic package dependency removal;
- direct default-branch publication;
- pull-request merge;
- enterprise-scale validation.

Unsupported framework behavior must produce an explicit safe status.

---

## 6. Authorization prerequisites

The active Phase 3D authorization must identify applicable:

- local repository scope;
- external repository scope;
- immutable source revisions;
- package and workspace scope;
- supported framework targets;
- files permitted for modification;
- configuration files permitted for modification;
- generated files permitted for modification;
- manifest and lockfile permission;
- dependency-installation permission;
- lifecycle-script permission;
- build and test permission;
- migration permission;
- database-operation permission;
- runner-image permission;
- command-registry permission;
- network access;
- credential capabilities;
- remediation permission;
- publication permission;
- external cleanup permission;
- destructive-operation permission;
- required tests;
- stop conditions;
- expiration or completion boundary.

Permission to analyze framework conventions does not automatically permit
modifying routes, manifests, generated outputs, or configuration.

Missing permissions default to denial.

---

## 7. Required phase outputs

Phase 3D should produce applicable:

- TSX and JSX language profiles;
- component inventory;
- JSX-reference evidence;
- framework-detection results;
- framework adapter registry;
- framework-version profiles;
- framework entry-point evidence;
- route-registration evidence;
- dependency-injection evidence;
- decorator and metadata evidence;
- event-handler evidence;
- scheduled-job evidence;
- plugin-discovery evidence;
- configuration-liveness evidence;
- framework coverage records;
- framework-aware classification profiles;
- framework-aware remediation profiles;
- additive database migrations;
- audit events;
- phase test manifest;
- capability-matrix updates;
- security-control updates;
- phase-completion report;
- updated execution state.

---

## 8. Capability identifiers

Phase 3D should define or update capability identifiers such as:

```text
language.typescript.tsx.parse.v1
language.javascript.jsx.parse.v1
inventory.typescript.component.v1
analysis.tsx.jsx-element-reference.v1
analysis.tsx.component-prop-reference.v1
framework.detect.v1
framework.entry-point.discover.v1
framework.route-registration.detect.v1
framework.dependency-injection.detect.v1
framework.decorator-registration.detect.v1
framework.event-handler.detect.v1
framework.scheduled-job.detect.v1
framework.plugin-registration.detect.v1
framework.configuration-liveness.detect.v1
coverage.framework.profile.v1
classification.framework-aware.v1
remediation.tsx.private-component-helper-delete.v1
```

Framework-specific capability identifiers should include the framework and
profile version.

Examples:

```text
framework.react.component-references.v1
framework.nextjs.route-entrypoints.v1
framework.nestjs.decorator-registration.v1
framework.express.route-registration.v1
```

Every identifier must remain narrow, versioned, and testable.

---

## 9. Separate syntax and framework capabilities

DCAv2 must distinguish:

- parsing TSX;
- parsing JSX;
- resolving JSX elements;
- identifying component declarations;
- detecting a framework;
- interpreting a framework convention;
- establishing complete framework coverage;
- remediating a framework-related symbol.

Successful TSX parsing does not prove framework support.

Framework detection does not prove framework liveness analysis.

Framework liveness analysis does not prove safe remediation.

---

## 10. Qualification statuses

TSX and framework qualification should use explicit statuses such as:

- `ready`;
- `ready_with_limited_framework_coverage`;
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

A repository must not be reported as framework-ready merely because a framework
package appears in a manifest.

---

## 11. `ready`

A repository is `ready` for a requested Phase 3D capability only when:

- repository identity is verified;
- immutable source resolution succeeds;
- package-manager profile is supported;
- TypeScript or JavaScript version is supported;
- TSX or JSX syntax is supported when required;
- framework identity is unambiguous;
- framework version is supported;
- required framework configuration is available;
- required entry-point and registration conventions are supported;
- required tools are available;
- required framework coverage can become complete;
- required baseline gates are available;
- required security controls are enforced;
- no required scope remains failed, inaccessible, ambiguous, or unsupported.

`Ready` does not authorize remediation or publication.

---

## 12. Framework detection

Framework detection should use attributable signals such as:

- direct dependencies;
- development dependencies;
- lockfile resolution;
- imports;
- framework configuration;
- build configuration;
- routing files;
- decorators;
- entry-point files;
- generated metadata;
- trusted operator configuration.

The result should identify:

- framework;
- detected version;
- resolved version;
- detection evidence;
- configured mode;
- confidence;
- conflicting indicators;
- adapter availability;
- support status.

---

## 13. Framework detection is not support

A detected framework may still be:

- unsupported;
- supported only for inventory;
- supported only for detection;
- partially supported;
- supported for selected conventions;
- supported for selected remediation shapes.

The capability matrix must record exact dimensions.

The label `React repository`, for example, must not imply that all React
liveness patterns are understood.

---

## 14. Conflicting framework indicators

Qualification must detect conflicts such as:

- multiple framework versions;
- incompatible routing systems;
- mixed legacy and current conventions;
- several dependency-injection containers;
- custom framework wrappers;
- generated configuration inconsistent with source;
- several routers operating in one package;
- unsupported framework plugins altering registration behavior.

The workflow must not choose one convention silently.

Ambiguous required behavior should produce:

- `configuration_required`;
- `partially_supported`;
- `detection_only`;
- or `unsupported`.

---

## 15. Framework version profiles

Every supported framework adapter must identify:

- supported framework version range;
- supported language version range;
- supported package-manager profiles;
- supported build-system profiles;
- supported configuration forms;
- supported conventions;
- unsupported conventions;
- required tools;
- required tests;
- known dynamic behavior;
- remediation boundary.

A framework adapter must not apply automatically to unsupported versions.

---

## 16. Framework adapter registry

Framework behavior should be represented through a versioned adapter registry.

Each adapter should define:

- adapter ID;
- adapter version;
- framework;
- framework version range;
- supported repository profiles;
- evidence producers;
- coverage dimensions;
- classification implications;
- remediation support;
- configuration requirements;
- command requirements;
- test identifiers;
- security considerations;
- status.

Repository content must not add a trusted adapter automatically.

---

## 17. Adapter statuses

Framework adapters should use statuses such as:

- `proposed`;
- `experimental`;
- `detection_only`;
- `functional`;
- `partially_supported`;
- `blocked`;
- `unsupported`;
- `deprecated`;
- `disabled`.

Only an appropriately tested `functional` adapter may satisfy required framework
coverage.

---

## 18. TSX parsing

TSX parsing support should record:

- parser identity;
- parser version;
- TypeScript version;
- configuration identity;
- source file;
- parse status;
- syntax features encountered;
- unsupported syntax;
- diagnostics;
- source occurrence mapping.

A file that fails to parse must reduce source and framework coverage.

It must not be skipped silently.

---

## 19. JSX parsing

JSX parsing support should remain separate from TypeScript TSX support.

Qualification should identify:

- JavaScript parser mode;
- JSX transform configuration;
- module mode;
- build-system configuration;
- source roots;
- parser limitations;
- support status.

Successful TSX behavior must not be generalized to JavaScript JSX repositories.

---

## 20. JSX element evidence

A JSX element may provide reference evidence to a component symbol.

The evidence should retain:

- source component or file;
- JSX occurrence;
- element name;
- resolved symbol;
- resolution method;
- namespace or member access;
- import path;
- source package;
- target package;
- ambiguity;
- producer;
- producer version;
- source snapshot.

A textual tag-name match must not be treated as a resolved semantic reference.

---

## 21. Intrinsic versus custom elements

The resolver must distinguish:

- intrinsic platform elements;
- custom components;
- namespaced components;
- member-expression components;
- dynamically selected components;
- string-derived element names;
- framework-transformed elements.

Intrinsic elements must not resolve to user symbols merely because names match.

Ambiguous custom-element resolution must reduce coverage.

---

## 22. Component inventory

Component inventory may include supported:

- function components;
- class components;
- arrow-function components;
- wrapped components;
- forward-reference components;
- memoized components;
- higher-order component results;
- default-exported anonymous components;
- named exports;
- private helper components.

Each supported shape must have explicit symbol identity and tests.

Unsupported component forms must remain explicit.

---

## 23. Component identity

Component identity should bind applicable:

- repository;
- source commit;
- package;
- source file;
- declaration occurrence;
- semantic symbol;
- export status;
- component shape;
- wrapper chain;
- content digest;
- framework profile.

Component identity must not rely only on display name.

Anonymous default exports require a stable source occurrence rather than an
invented symbol name.

---

## 24. Wrapped components

Framework and utility wrappers may obscure component identity.

Examples include:

- memoization wrappers;
- forward-reference wrappers;
- observer wrappers;
- styling wrappers;
- localization wrappers;
- dependency-injection wrappers;
- framework-specific registration helpers.

Every supported wrapper must have an explicit rule.

Unknown wrappers must not be unwrapped approximately.

They should create ambiguity or unsupported coverage.

---

## 25. Higher-order components

Higher-order component behavior may create or return live components.

The adapter should distinguish:

- supported static wrapper;
- supported returned component identity;
- dynamic component factory;
- unresolved runtime composition;
- configuration-driven wrapping.

Unresolved higher-order behavior must prevent unsafe component-removal
conclusions.

---

## 26. Prop and callback references

Component props may carry function references that provide liveness evidence.

Applicable evidence includes:

- direct function prop;
- callback prop;
- render prop;
- event-handler prop;
- component constructor prop;
- configuration object prop;
- spread props with statically resolvable values.

Unresolved spread values or dynamic property access must remain explicit.

---

## 27. JSX spread behavior

JSX spread attributes may hide references.

The adapter should classify spreads as:

- statically resolved;
- partially resolved;
- unresolved;
- unsupported;
- failed.

An unresolved required spread must reduce framework coverage.

It must not be treated as containing no references.

---

## 28. Component registries

Applications may register components through maps, arrays, configuration, or
plugin systems.

Supported registry evidence should retain:

- registry occurrence;
- key;
- component symbol;
- registration method;
- consumer convention;
- source package;
- configuration source;
- framework adapter;
- ambiguity;
- freshness.

A component registry must not be inferred solely from a variable name such as
`components`.

---

## 29. Lazy components

Lazy loading may create liveness through:

- dynamic imports;
- framework lazy helpers;
- route-level loading;
- code-splitting configuration;
- plugin loaders.

Supported lazy-loading evidence should resolve:

- loader occurrence;
- module target;
- exported component;
- package;
- configuration;
- failure behavior.

Computed or unresolved module targets must reduce coverage.

---

## 30. Route entry points

Frameworks may treat files or registrations as route entry points.

Route evidence may come from:

- explicit router registration;
- filesystem routing;
- route configuration;
- decorators;
- generated route manifests;
- framework build metadata.

Every route convention must be adapter- and version-specific.

A file matching a route-like name is not automatically live without a supported
profile.

---

## 31. Filesystem routing

Filesystem routing adapters should define:

- route root;
- naming rules;
- supported extensions;
- layout conventions;
- special files;
- dynamic segment syntax;
- excluded files;
- generated route behavior;
- framework version;
- build-mode dependencies.

The adapter must preserve route occurrence and source identity.

Unsupported routing conventions must reduce coverage.

---

## 32. Route registration

Explicit route-registration evidence should retain:

- router identity;
- registration occurrence;
- HTTP method or route type;
- path pattern;
- handler symbol;
- middleware symbols;
- package;
- framework adapter;
- ambiguity;
- source snapshot.

A handler registered through a supported router must be treated as live.

---

## 33. Dynamic routes

Dynamic route creation may use:

- computed paths;
- loops;
- configuration data;
- generated registries;
- plugin modules;
- dependency injection;
- reflection.

When the handler symbol is resolved but the route path is dynamic, the handler
may still be live.

When the handler itself is unresolved, coverage must remain incomplete.

---

## 34. Middleware registration

Middleware may be live through registration rather than direct calls.

Supported evidence should distinguish:

- global middleware;
- route middleware;
- package-level middleware;
- error middleware;
- framework lifecycle middleware;
- generated middleware.

Middleware signatures alone must not prove registration.

The adapter must identify the actual supported registration occurrence.

---

## 35. Dependency injection

Dependency-injection frameworks may instantiate classes or providers without
direct constructor calls.

A dependency-injection adapter should model applicable:

- provider declarations;
- module registrations;
- constructor injection;
- token registration;
- factory providers;
- value providers;
- aliases;
- scopes;
- decorators;
- configuration-driven modules.

Registered providers must be treated as live under the supported profile.

---

## 36. Injection tokens

Injection tokens may be:

- classes;
- strings;
- symbols;
- constants;
- framework-specific token objects;
- generated metadata.

The adapter must preserve token identity and resolution confidence.

A textual token match must not automatically resolve to a provider symbol.

Unresolved token mappings must reduce coverage.

---

## 37. Dynamic modules and providers

Dynamic dependency-injection modules may construct provider sets at runtime.

Supported adapters should identify:

- static metadata;
- supported factory results;
- configuration-dependent providers;
- unresolved provider lists;
- imported modules;
- exported providers.

Unresolved dynamic provider construction must prevent unsafe dead-code
classification for affected providers.

---

## 38. Decorators and annotations

Decorators may provide liveness or registration evidence.

Each supported decorator rule should identify:

- framework;
- decorator symbol;
- resolved import;
- target declaration kind;
- metadata arguments;
- registration effect;
- inheritance behavior;
- source occurrence;
- framework version.

A decorator name match without semantic import resolution is insufficient.

---

## 39. Custom decorators

Custom decorators may wrap or compose framework behavior.

DCAv2 should support them only when:

- the composition is statically resolvable;
- the adapter explicitly models the behavior;
- evidence provenance is preserved;
- failure and ambiguity are tested.

Unknown custom decorators must not be treated as no-op or authoritative
registration.

---

## 40. Decorator metadata evaluation

Decorator arguments may contain executable or dynamic expressions.

The adapter should distinguish:

- literal metadata;
- statically resolved constants;
- supported object literals;
- partially resolved expressions;
- unresolved expressions;
- executable configuration.

Unresolved metadata must remain explicit.

Repository-controlled evaluation must occur only inside the runner.

---

## 41. Event handlers

Event handlers may be live through:

- event emitter registration;
- framework event decorators;
- message-bus subscription;
- DOM or component props;
- configuration-driven subscription;
- generated event maps.

Supported evidence should retain:

- event source;
- event name or token;
- registration occurrence;
- handler symbol;
- package;
- framework adapter;
- ambiguity;
- freshness.

Handler naming conventions alone do not prove registration.

---

## 42. Scheduled jobs

Scheduled jobs may be registered through:

- cron decorators;
- scheduler APIs;
- configuration;
- framework modules;
- generated manifests;
- infrastructure configuration.

Supported evidence should retain:

- schedule source;
- job symbol;
- registration occurrence;
- schedule expression where safely available;
- environment scope;
- framework adapter;
- configuration identity.

A scheduled-job function must be treated as live when registration is resolved.

---

## 43. Message consumers

Framework adapters may detect message or queue consumers through:

- decorators;
- explicit subscription APIs;
- topic maps;
- queue configuration;
- generated bindings.

Phase 3D should remain repository-local.

Unknown external message publication or consumer behavior belongs to later
contract and microservice phases.

A locally registered consumer is live even without direct calls.

---

## 44. Command handlers

Applications may register command-line or application command handlers through:

- command registries;
- decorators;
- framework modules;
- configuration;
- generated command manifests.

Supported evidence should bind the registration occurrence to the handler
symbol.

A handler class name ending in `Command` is not enough to prove liveness.

---

## 45. Plugin discovery

Plugin systems may discover code through:

- explicit registration;
- manifest entries;
- directory scanning;
- naming conventions;
- package exports;
- dependency metadata;
- runtime loaders.

Every supported plugin discovery rule must define:

- discovery root;
- file or symbol convention;
- registration mechanism;
- package boundary;
- framework version;
- coverage requirements;
- unsupported dynamic behavior.

---

## 46. Directory-scanned plugins

Directory scanning creates liveness without ordinary imports.

A supported adapter must identify:

- scan root;
- file pattern;
- export requirement;
- configuration source;
- recursive behavior;
- exclusions;
- environment conditions;
- source occurrence.

Unknown or dynamic scan roots must reduce coverage.

---

## 47. Serialization hooks

Serialization systems may invoke symbols through:

- decorators;
- schema registration;
- type maps;
- transform metadata;
- custom serializer registries;
- reflection.

Supported evidence must identify the concrete registration or metadata path.

A method name such as `toJSON` may be conventionally live in some profiles but
must not be treated universally as live without a defined rule.

---

## 48. Framework lifecycle hooks

Frameworks may invoke lifecycle methods by convention.

A lifecycle adapter should define:

- supported framework;
- supported class or component type;
- supported method names or interfaces;
- inheritance behavior;
- registration prerequisite;
- version range;
- source occurrence;
- liveness effect.

A lifecycle-like method name outside the supported context must not receive
automatic liveness.

---

## 49. Reflection

Reflection may create references invisible to ordinary static analysis.

Applicable reflective behavior includes:

- lookup by string;
- metadata lookup;
- property enumeration;
- method invocation by name;
- dependency injection;
- serialization;
- plugin discovery;
- framework decorators.

Unresolved reflection must reduce coverage.

Phase 3D must not claim reflection-complete analysis.

---

## 50. String-based symbol references

A string may refer to:

- route handler;
- component name;
- provider token;
- event name;
- serializer;
- plugin;
- command handler;
- method.

String evidence should be classified as:

- resolved under a supported convention;
- candidate supporting evidence;
- ambiguous;
- unrelated literal;
- unsupported.

A matching string alone must not become authoritative liveness without a
supported resolution rule.

---

## 51. Configuration-driven liveness

Framework configuration may make symbols live.

Supported configuration sources may include:

- declarative JSON;
- YAML;
- TOML;
- package metadata;
- static TypeScript objects;
- generated manifests;
- framework-specific configuration.

Every configuration adapter should define:

- schema;
- version;
- source path;
- symbol-resolution method;
- execution requirement;
- coverage impact;
- unsupported fields.

---

## 52. Executable framework configuration

Executable configuration must run only in the untrusted runner.

The trusted controller must not directly import:

- JavaScript configuration;
- TypeScript configuration;
- framework plugins;
- router builders;
- dependency-injection modules;
- generated loaders.

The controller may consume only validated structured output.

Failure must remain explicit.

---

## 53. Build-generated metadata

Framework builds may generate:

- route manifests;
- component registries;
- server manifests;
- chunk maps;
- dependency graphs;
- injection metadata;
- client references;
- server references.

Generated metadata may provide supporting evidence when:

- the generating command is approved;
- source identity is exact;
- tool and framework versions are recorded;
- artifact schema is validated;
- freshness is enforced;
- generated output is bounded.

Generated metadata must not be treated as timeless authoritative state.

---

## 54. Build artifacts as evidence

Build artifacts may contain references not visible in source configuration.

The evidence adapter should identify:

- generating command;
- source commit;
- framework version;
- build mode;
- environment;
- artifact type;
- artifact digest;
- source mapping;
- limitations.

Production-specific artifacts must not be inferred from development builds.

---

## 55. Environment-specific framework behavior

Framework registration may vary by:

- development;
- test;
- staging;
- production;
- feature flags;
- build target;
- server or client mode;
- region;
- tenant configuration.

The coverage profile must identify which environments are represented.

Unknown required environments must prevent complete coverage.

---

## 56. Feature flags

Feature flags may guard otherwise live code.

Phase 3D may record feature-flag evidence when the flag reference is statically
resolvable.

The adapter should retain:

- flag identity;
- source;
- environment scope;
- branch occurrence;
- known configuration state;
- uncertainty.

A disabled flag in one environment is not proof that guarded code is dead
globally.

---

## 57. Client and server boundaries

Some frameworks separate client and server modules.

Qualification should identify applicable:

- client entry points;
- server entry points;
- shared modules;
- server-only modules;
- client-only modules;
- generated boundaries;
- build-mode constraints.

A symbol unused on the client may remain live on the server and the reverse.

Coverage must remain boundary-aware.

---

## 58. Framework code generation

Frameworks may generate source or metadata from authored declarations.

The adapter should distinguish:

- authored source;
- generated source;
- generated metadata;
- generated declarations;
- build output;
- cache.

Generated output must not be remediated by default.

Removing authored source requires verification that generated outputs remain
consistent.

---

## 59. Framework source maps

Source maps may help connect generated artifacts to authored source.

When used as evidence, retain:

- source map identity;
- generated artifact identity;
- source commit;
- tool version;
- mapping confidence;
- unsupported segments;
- content digest.

Malformed or incomplete source maps must not produce complete coverage.

---

## 60. Framework evidence model

Framework evidence should retain applicable:

- repository;
- source commit;
- package;
- framework;
- framework version;
- adapter ID;
- adapter version;
- evidence type;
- registration occurrence;
- referenced symbol;
- configuration identity;
- build artifact identity;
- environment scope;
- polarity;
- strength;
- ambiguity;
- freshness;
- producer;
- raw artifact digest.

Framework-specific conclusions must be normalized into the common evidence
model.

---

## 61. Evidence polarity

Framework evidence may be:

- positive liveness;
- negative absence;
- ambiguous;
- contradictory;
- unsupported;
- failed.

Positive registration or entry-point evidence should dominate absence evidence
under the applicable classification profile.

A missing route or registration match is not authoritative absence unless the
required convention coverage is complete.

---

## 62. Framework evidence freshness

Framework evidence becomes stale when applicable:

- source commit changes;
- framework version changes;
- adapter version changes;
- configuration changes;
- package graph changes;
- route roots change;
- build mode changes;
- generated metadata changes;
- plugin set changes;
- environment profile changes;
- supported convention changes.

Stale evidence must not satisfy classification or remediation prerequisites.

---

## 63. Framework coverage profiles

Every framework adapter must define its required coverage dimensions.

Potential dimensions include:

- framework detection;
- version resolution;
- source-root discovery;
- TSX or JSX parsing;
- component inventory;
- import and export analysis;
- route discovery;
- route registration;
- dependency-injection registration;
- decorator resolution;
- event-handler registration;
- scheduled-job registration;
- plugin discovery;
- configuration evaluation;
- generated metadata;
- environment scope;
- reflection risk;
- dynamic import risk.

Every dimension must have an explicit status.

---

## 64. Coverage statuses

Framework coverage should use statuses such as:

- `complete`;
- `partial`;
- `failed`;
- `unsupported`;
- `unavailable`;
- `excluded`;
- `stale`;
- `not_applicable`.

Only `complete` may satisfy a required dimension.

An unsupported convention must not be represented as excluded merely because
the current adapter cannot analyze it.

---

## 65. Framework coverage digest

A deterministic framework coverage digest should bind applicable:

- repository identity;
- source commit;
- package graph digest;
- framework profile;
- framework version;
- adapter identities;
- configuration digests;
- route roots;
- registration roots;
- environment profiles;
- generated artifact digests;
- analyzed scopes;
- excluded scopes;
- failed scopes;
- unsupported scopes;
- completion statuses.

Changing any required dimension must invalidate dependent classification and
remediation records.

---

## 66. Partial framework coverage

A repository may have complete TypeScript reference coverage but partial
framework coverage.

Examples include:

- ordinary imports are resolved;
- filesystem routing is unsupported;
- one decorator convention is unresolved;
- one plugin directory is dynamic;
- one generated manifest is unavailable.

The finding must remain inconclusive when the unresolved framework scope may
make the target live.

---

## 67. Framework classification

A framework-aware finding may become `candidate_dead` only when:

- the source symbol shape is supported;
- ordinary semantic coverage is complete;
- required framework adapters are functional;
- required framework coverage is complete;
- no positive registration or entry-point evidence exists;
- no unresolved dynamic convention may expose the symbol;
- no unsupported framework scope may contain liveness evidence;
- evidence is current;
- classification is deterministic.

A classification is not a human disposition.

---

## 68. Detection-only classification

Framework support may remain detection-only when:

- framework liveness evidence can be collected;
- coverage limitations can be reported;
- unsupported dynamic behavior remains explicit;
- no safe transformation exists;
- no complete remediation profile exists.

Detection-only support must not be described as remediation support.

---

## 69. Classification explanation

A framework-aware explanation should include:

- repository;
- source commit;
- package;
- target symbol;
- syntax profile;
- framework;
- framework version;
- adapter versions;
- ordinary semantic evidence;
- component evidence;
- route evidence;
- injection evidence;
- decorator evidence;
- event evidence;
- scheduler evidence;
- plugin evidence;
- configuration evidence;
- generated metadata evidence;
- environment scope;
- dynamic uncertainty;
- coverage digest;
- policy version;
- resulting status.

---

## 70. Human disposition

Human disposition remains separate from machine classification.

A framework-related disposition should bind to:

- repository;
- source commit;
- package;
- target symbol;
- framework profile;
- adapter identities;
- evidence digest;
- framework coverage digest;
- classification identity;
- human actor;
- timestamp.

A relevant framework, configuration, adapter, evidence, or coverage change may
make the disposition stale.

---

## 71. Remediation authorization

Remediation authorization should bind to:

- finding ID;
- repository identity;
- source commit;
- package identity;
- framework profile;
- framework version;
- adapter identities;
- evidence digest;
- coverage digest;
- human disposition;
- transformation ID;
- permitted files;
- permitted configuration files;
- required framework gates;
- expiration or completion boundary.

Authorization to remove one private helper must not authorize route,
configuration, manifest, or public component removal.

---

## 72. Initial remediation boundary

Phase 3D remediation should remain narrower than framework detection.

Potential initial supported targets include:

- a private helper function inside a TSX module;
- a private non-exported component proven unreferenced under a complete supported
  component profile;
- a private handler helper not itself registered through framework conventions.

Initial remediation should exclude:

- routes;
- public components;
- exported page components;
- dependency-injection providers;
- decorated classes;
- scheduled jobs;
- message consumers;
- middleware;
- plugin entry points;
- serialization hooks;
- lifecycle methods;
- configuration-referenced symbols.

---

## 73. Exact finding reproduction

Before transformation, DCAv2 must reproduce:

- repository identity;
- source commit;
- package identity;
- target symbol identity;
- source occurrence;
- syntax profile;
- framework profile;
- framework version;
- adapter identities;
- configuration digests;
- generated artifact digests where required;
- evidence digest;
- framework coverage digest;
- human disposition;
- remediation authorization.

Any mismatch must block transformation.

---

## 74. Reproduction failure

Reproduction must fail when applicable:

- source commit changed;
- target component or helper changed;
- framework version changed;
- adapter version changed materially;
- route configuration changed;
- decorator metadata changed;
- plugin configuration changed;
- generated metadata changed;
- new registration evidence appeared;
- coverage became partial;
- authorization expired;
- disposition became stale.

Approximate symbol-name matching must never proceed to transformation.

---

## 75. Framework baseline gates

Framework baseline gates may include:

- TSX or JSX parsing;
- type checking;
- framework compilation;
- application build;
- server build;
- client build;
- route generation;
- component tests;
- unit tests;
- integration tests;
- framework-specific validation;
- generated-manifest validation;
- lint;
- repository-status checks.

The framework profile must identify required gates.

A required unavailable gate blocks remediation.

---

## 76. Environment-specific gates

Some framework gates may need separate modes such as:

- development;
- production;
- server;
- client;
- edge;
- test.

The remediation profile must identify which modes are required.

Passing a development build must not be treated as proof that a production build
still works.

---

## 77. Structured transformation

Framework-related source modification must use a structured transformation.

The transformation must bind to:

- language;
- syntax profile;
- target symbol;
- source occurrence;
- framework profile;
- transformation version;
- expected rewrite count;
- permitted files;
- source digest;
- coverage digest.

The transformation must preserve surrounding TSX, comments, imports, and syntax
according to the supported rule.

---

## 78. Import cleanup

Removing a component or helper may make imports unused.

Import cleanup must be a separately defined transformation behavior.

It should identify:

- imports eligible for removal;
- imports still used;
- type-only imports;
- side-effect imports;
- framework-required imports;
- JSX runtime behavior;
- formatting behavior;
- expected rewrite count.

Side-effect imports must not be removed merely because no imported binding
remains.

---

## 79. Export cleanup

Export removal requires separate support.

The initial remediation profile should not remove exports unless:

- the target export is explicitly authorized;
- internal and external consumer coverage is sufficient;
- package-export behavior is understood;
- barrel re-exports are updated safely;
- public API implications are reviewed;
- required gates are available.

Private helper removal should not modify unrelated export surfaces.

---

## 80. Route and registration edits

Route tables, module registries, provider arrays, plugin manifests, and similar
configuration must not be modified automatically under a private-symbol removal
authorization.

Such edits require:

- a dedicated transformation ID;
- exact registration identity;
- explicit changed-file scope;
- framework-specific tests;
- separate remediation authorization;
- higher confidence in consumer coverage.

---

## 81. Generated-file handling

Generated framework files should not be edited directly unless the profile
explicitly identifies them as authoritative source.

When generated output must change, the workflow should:

1. Modify authorized authored source.
2. Run the approved generator or build.
3. Validate generated-file changes.
4. Confirm deterministic output.
5. Include generated files only when explicitly authorized.

Unexpected generated-file changes must cause failure.

---

## 82. Changed-file validation

After transformation, DCAv2 must validate repository-wide changes including:

- target source files;
- TSX or JSX files;
- route files;
- framework configuration;
- generated manifests;
- package manifests;
- lockfiles;
- generated output;
- source maps;
- file modes;
- symbolic links;
- binary files.

Any file outside the authorized set must cause failure.

---

## 83. Post-change framework gates

Post-change verification should rerun all required framework gates.

The workflow must verify applicable:

- parsing succeeds;
- type checking succeeds;
- framework compilation succeeds;
- client build succeeds;
- server build succeeds;
- route generation succeeds;
- component tests pass;
- integration tests pass;
- generated manifests remain valid;
- no new framework diagnostic appears;
- changed files remain authorized;
- patch remains deterministic.

---

## 84. Framework artifact comparison

Baseline and post-change comparison may include:

- route manifests;
- component manifests;
- server-client reference maps;
- build chunks;
- injection metadata;
- generated registries;
- test counts;
- diagnostics.

Artifact changes must be interpreted through a supported adapter.

A different artifact hash alone is not proof of failure when the authorized
source change legitimately affects the artifact.

---

## 85. Patch generation

The patch record should include framework-specific identity such as:

- repository;
- base commit;
- package;
- syntax profile;
- framework profile;
- framework version;
- adapter identities;
- configuration digests;
- generated artifact digests where relevant;
- target symbol;
- finding;
- remediation attempt;
- transformation;
- framework gate results;
- changed files;
- patch hash;
- coverage digest;
- secret-scan result.

Patch generation does not authorize publication.

---

## 86. Trusted publication

When separately authorized, the trusted publisher must validate:

- repository identity;
- prohibited-repository policy;
- base commit;
- package identity;
- syntax profile;
- framework profile;
- framework version;
- adapter identities;
- finding identity;
- human disposition;
- remediation authorization;
- evidence and coverage digests;
- framework gate results;
- patch hash;
- changed-file set;
- draft-only operation.

The publisher must not execute framework builds, generators, loaders, plugins,
tests, or repository scripts.

---

## 87. Database evolution

Phase 3D may persist concepts such as:

- syntax profiles;
- framework profiles;
- adapter identities;
- framework detection results;
- component identities;
- route evidence;
- injection evidence;
- decorator evidence;
- event-handler evidence;
- scheduler evidence;
- plugin evidence;
- configuration-liveness evidence;
- generated-artifact evidence;
- framework coverage records;
- framework gate results.

Persistence changes must use additive ordered migrations.

Historical non-framework TypeScript findings must remain interpretable.

---

## 88. Migration compatibility

Migration testing should include:

- fresh installation;
- upgrade from the Phase 3C schema;
- existing TypeScript findings;
- TSX component findings;
- framework detection records;
- several adapter versions;
- nullable historical framework fields;
- stale adapter records;
- partial framework coverage;
- multiple tenants;
- migration failure;
- retry;
- projection rebuild;
- audit preservation.

Existing migrations must not be rewritten.

---

## 89. Audit requirements

Phase 3D should produce audit events for applicable:

- syntax profile detected;
- TSX parsing completed;
- JSX parsing completed;
- framework detected;
- framework profile selected;
- framework adapter selected;
- framework adapter rejected;
- component discovered;
- route entry point discovered;
- route registration discovered;
- provider registration discovered;
- decorator registration discovered;
- event handler discovered;
- scheduled job discovered;
- plugin registration discovered;
- configuration liveness discovered;
- generated metadata validated;
- framework coverage completed;
- framework coverage partial;
- classification completed;
- remediation reproduced;
- transformation completed;
- unexpected framework file change rejected;
- patch created;
- publication requested;
- cleanup completed;
- cleanup failed.

Audit events must remain tenant-scoped and secret-free.

---

## 90. Runner requirements

Framework commands, executable configuration, loaders, generators, and plugins
must execute in an approved untrusted runner profile.

The profile must enforce applicable:

- non-root execution;
- no privileged mode;
- no Docker socket;
- no trusted credentials;
- explicit environment allowlist;
- repository-scoped mounts;
- approved dependency-cache mounts;
- restricted registry access during installation;
- network-disabled analysis and gates where possible;
- CPU limits;
- memory limits;
- process limits;
- disk limits;
- output limits;
- timeouts;
- process-tree cleanup;
- workspace cleanup.

Framework build complexity must not justify unbounded resources.

---

## 91. Network profiles

Phase 3D should use the narrowest network profile for each stage.

Examples include:

- provider read-only source acquisition;
- registry-only dependency installation;
- network-disabled source analysis;
- network-disabled framework metadata generation where possible;
- local-test-services-only integration tests;
- provider-publish-only trusted publication.

Framework development servers must not receive unrestricted network access by
default.

---

## 92. Credential boundaries

Framework builds and tests may request environment variables or service
credentials.

The runner may receive only explicitly authorized synthetic or test capability.

It must never receive:

- trusted publisher credentials;
- controller database credentials;
- unrelated cloud credentials;
- production application secrets;
- broad infrastructure credentials.

A framework's expectation of credentials does not authorize DCAv2 to provide
them.

---

## 93. Prompt-injection resistance

Instructions found in:

- components;
- route files;
- framework configuration;
- decorators;
- plugin manifests;
- generated metadata;
- build output;
- test output;
- documentation;
- source comments;
- commit messages;

must remain untrusted data.

They must not:

- broaden framework scope;
- add trusted adapters;
- select credentials;
- broaden network access;
- exclude required route or plugin scope;
- mark framework failures as passed;
- create human disposition;
- authorize remediation;
- trigger publication;
- modify governance.

---

## 94. Secret handling

Framework repositories may contain secret-bearing environment and deployment
configuration.

DCAv2 must prevent exposure through:

- environment files;
- framework configuration;
- build output;
- route manifests;
- source maps;
- test artifacts;
- generated metadata;
- patches;
- publication text;
- audit events.

Synthetic credential canaries should validate redaction and isolation.

---

## 95. Phase 3D test manifest

Phase 3D should receive a dedicated test manifest such as:

`codex/tests/phase-3d-tests.yaml`

If introduced, the file must conform to:

`codex/tests/phase-test-manifest.schema.json`

The manifest must identify concrete required and conditional test IDs.

The phrase “run relevant tests” is insufficient.

---

## 96. Minimum syntax tests

Syntax tests should cover:

- valid TSX;
- valid JSX;
- intrinsic elements;
- custom components;
- namespaced components;
- member-expression components;
- fragments;
- nested JSX;
- generic TypeScript syntax near JSX;
- malformed TSX;
- malformed JSX;
- unsupported syntax;
- parser-version mismatch;
- source map occurrence accuracy.

---

## 97. Minimum component tests

Component tests should cover:

- function component;
- arrow-function component;
- class component;
- default-exported component;
- anonymous default export;
- private helper component;
- wrapped component;
- memoized component;
- forward-reference component;
- higher-order component;
- duplicate component names;
- same component name in different packages;
- component moved between files.

Each supported shape must have deterministic identity.

---

## 98. Minimum JSX-reference tests

JSX-reference tests should cover:

- direct imported component;
- same-file component;
- namespaced component;
- member-expression component;
- aliased import;
- default import;
- re-exported component;
- path-alias import;
- workspace-package component;
- lazy component;
- dynamic component variable;
- string element name;
- comment-only occurrence;
- intrinsic element with matching user symbol.

---

## 99. Minimum prop-reference tests

Prop tests should cover:

- direct callback prop;
- event-handler prop;
- render prop;
- component constructor prop;
- statically resolved spread;
- partially resolved spread;
- unresolved spread;
- renamed prop;
- callback passed through an object;
- callback passed through a wrapper;
- comment-only and string-only occurrences.

Unresolved required spread behavior must reduce coverage.

---

## 100. Minimum route tests

Route tests should cover:

- explicit route registration;
- route handler function;
- middleware registration;
- nested router;
- filesystem route;
- dynamic route segment;
- route configuration file;
- lazy route import;
- generated route manifest;
- route root changed after analysis;
- unsupported router;
- unresolved computed handler;
- duplicate route handler names.

---

## 101. Minimum dependency-injection tests

Dependency-injection tests should cover:

- class provider;
- token provider;
- factory provider;
- alias provider;
- exported provider;
- imported module;
- decorator registration;
- missing provider;
- duplicate token;
- dynamic module;
- unresolved factory output;
- custom decorator;
- provider registered through configuration;
- provider class with no direct constructor call.

---

## 102. Minimum decorator tests

Decorator tests should cover:

- supported resolved decorator;
- aliased decorator import;
- decorator with literal metadata;
- decorator with static constant metadata;
- decorator with unresolved expression;
- custom composed decorator;
- same decorator name from another package;
- decorator removed after analysis;
- decorator version mismatch;
- malformed decorator output.

A name-only match must not establish registration.

---

## 103. Minimum event and scheduler tests

Tests should cover:

- explicit event subscription;
- decorator-based event handler;
- dynamic event name;
- configuration-based subscription;
- scheduled decorator;
- scheduler API registration;
- environment-specific schedule;
- generated schedule manifest;
- handler with no direct calls;
- unresolved registration;
- registration removed after analysis.

---

## 104. Minimum plugin tests

Plugin tests should cover:

- explicit plugin registration;
- manifest-based plugin;
- directory-scanned plugin;
- generated plugin registry;
- naming-convention candidate;
- dynamic scan root;
- plugin outside authorized repository;
- duplicate plugin identity;
- plugin configuration changed;
- unsupported plugin loader;
- malicious plugin instructions.

---

## 105. Minimum configuration tests

Configuration tests should cover:

- valid declarative configuration;
- valid static TypeScript configuration;
- executable configuration in the runner;
- configuration parse failure;
- unknown field;
- unsupported schema version;
- dynamic expression;
- configuration path escape;
- configuration referencing a symbol;
- configuration referencing a missing symbol;
- configuration containing a synthetic secret;
- repository configuration attempting to grant authority.

---

## 106. Minimum generated-metadata tests

Generated-metadata tests should cover:

- valid route manifest;
- valid component manifest;
- valid injection metadata;
- stale generated artifact;
- artifact from wrong source commit;
- malformed schema;
- oversized artifact;
- output truncation;
- missing source mapping;
- generated path traversal;
- differing development and production artifacts;
- generator failure;
- generator timeout.

---

## 107. Minimum coverage tests

Framework coverage tests should cover:

- complete ordinary and framework coverage;
- TSX parser failure;
- unsupported route convention;
- unresolved decorator;
- unresolved dependency-injection token;
- dynamic plugin root;
- missing generated manifest;
- stale framework configuration;
- framework version changed;
- adapter version changed;
- environment profile missing;
- unsupported reflection behavior;
- one framework adapter failed;
- positive liveness evidence in an otherwise unused symbol.

Complete coverage must require every relevant framework dimension.

---

## 108. Minimum classification tests

Classification tests should verify:

- private TSX helper with complete absence evidence;
- component referenced through JSX;
- component referenced through lazy loading;
- route handler registered without direct calls;
- provider registered without constructor calls;
- event handler registered without calls;
- scheduled job registered without calls;
- plugin discovered by supported convention;
- unresolved reflection;
- unsupported route system;
- partial framework coverage;
- stale generated metadata;
- positive evidence dominance;
- input-order independence.

---

## 109. Minimum baseline tests

Baseline tests should cover:

- TSX parsing passes;
- type checking passes;
- development build passes;
- production build passes when required;
- client build passes;
- server build passes;
- route generation passes;
- component tests pass;
- integration tests pass;
- required framework gate unavailable;
- build timeout;
- memory exhaustion;
- output truncation;
- generated artifact mismatch;
- cleanup failure.

---

## 110. Minimum remediation tests

Remediation tests should cover:

- exact private helper removal;
- exact supported private component removal;
- wrong component with same name;
- framework version changed;
- adapter version changed;
- route registration added after review;
- provider registration added after review;
- configuration reference added;
- generated metadata changed;
- unauthorized import cleanup;
- unauthorized export cleanup;
- unauthorized route-file change;
- unexpected generated-file change;
- deterministic patch;
- idempotent transformation;
- stale authorization.

---

## 111. Minimum post-change tests

Post-change tests should verify:

- parsing succeeds;
- type checking succeeds;
- required builds succeed;
- route generation remains valid;
- component tests pass;
- integration tests pass;
- generated metadata is consistent;
- no new framework diagnostic appears;
- changed files remain authorized;
- patch is deterministic;
- secret scan remains clear of synthetic canary leakage;
- cleanup completes.

---

## 112. Minimum publisher tests

Publisher tests should cover:

- exact framework profile;
- wrong framework version;
- stale adapter identity;
- stale configuration digest;
- stale generated artifact digest;
- stale coverage digest;
- missing framework gate;
- unexpected route change;
- unexpected configuration change;
- unexpected generated-file change;
- wrong patch hash;
- default-branch rejection;
- draft pull-request creation;
- idempotent retry;
- provider partial state;
- Git-hook suppression;
- publisher inability to run framework tools.

Live provider tests require separate authorization.

---

## 113. Minimum migration tests

Migration tests should cover:

- fresh database;
- upgrade from Phase 3C;
- existing plain TypeScript findings;
- TSX component findings;
- framework profiles;
- adapter identities;
- route evidence;
- injection evidence;
- decorator evidence;
- plugin evidence;
- generated artifact evidence;
- partial framework coverage;
- multiple tenants;
- failed migration;
- retry;
- projection rebuild;
- audit preservation.

---

## 114. Minimum security tests

Security tests should cover:

- executable framework configuration runs only in the runner;
- framework plugin cannot access publisher credentials;
- build tool cannot access controller credentials;
- development server cannot access unauthorized networks;
- route generator cannot escape the workspace;
- generated artifact path traversal is rejected;
- framework source maps do not expose secrets;
- Docker socket is unavailable;
- cloud metadata is unavailable;
- output is bounded;
- process limits apply to framework workers;
- background development servers are terminated;
- cleanup removes temporary framework state.

---

## 115. Fixture strategy

Phase 3D should use fixtures representing:

- plain TSX application;
- private helper in a component file;
- same-file component reference;
- cross-package component reference;
- lazy-loaded component;
- filesystem-routed application;
- explicit router application;
- dependency-injection application;
- decorator-driven application;
- event-handler application;
- scheduled-job application;
- plugin-based application;
- generated route manifest;
- unresolved reflection;
- malicious executable configuration;
- alternate repository, package, component, and route names.

Production behavior must not contain fixture-specific branches.

---

## 116. Framework rollout strategy

Framework support should be added incrementally.

A recommended sequence is:

1. TSX and JSX parsing.
2. Ordinary component references.
3. One explicit route-registration profile.
4. One filesystem-routing profile.
5. One dependency-injection profile.
6. One decorator-registration profile.
7. One event or scheduling profile.
8. Detection-only plugin and reflection profiles.
9. Narrow remediation profiles.

Each step requires its own capability and test evidence.

---

## 117. Scale boundary

Phase 3D establishes bounded functional syntax and framework support.

The phase report must state tested limits such as:

- TSX or JSX file count;
- component count;
- route count;
- provider count;
- decorator count;
- plugin count;
- generated artifact size;
- workspace package count;
- build duration;
- analysis duration;
- peak memory;
- output size.

Phase 3D must not claim enterprise-scale framework validation.

Broader scale validation belongs to Phase 10.

---

## 118. TSX capability acceptance criteria

TSX parsing and component-reference capability may become `functional` only
when:

1. Supported TSX syntax parses deterministically.
2. Source occurrences are accurate.
3. Intrinsic and custom elements are distinguished.
4. Supported component identities are deterministic.
5. JSX element references resolve semantically.
6. Aliases and workspace references are preserved.
7. Lazy-loading support is explicit.
8. Spread and dynamic behavior reduce coverage appropriately.
9. Parser failures remain visible.
10. Required syntax tests pass.
11. Required security and migration tests pass.

---

## 119. Framework adapter acceptance criteria

A framework adapter may become `functional` only when:

1. Framework detection is attributable.
2. Supported version range is explicit.
3. Supported conventions are explicit.
4. Unsupported conventions are explicit.
5. Registration evidence resolves to exact symbols.
6. Configuration handling is bounded.
7. Executable configuration remains in the runner.
8. Dynamic and reflective behavior reduces coverage.
9. Required framework coverage can become complete.
10. Positive liveness evidence dominates absence evidence.
11. Evidence freshness is enforced.
12. Required positive, negative, failure, and hostile tests pass.
13. Generalization beyond one fixture is demonstrated.

---

## 120. Framework remediation acceptance criteria

A framework-related remediation capability may become `functional` only when:

1. The target symbol shape is narrowly supported.
2. Ordinary semantic coverage is complete.
3. Required framework coverage is complete.
4. Exact framework identity is current.
5. Exact adapter identities are current.
6. Human disposition is current.
7. Separate remediation authorization is current.
8. Exact finding reproduction succeeds.
9. Required framework baseline gates pass.
10. Structured transformation is deterministic.
11. Rewrite count is exact.
12. Import cleanup is safe or separately disabled.
13. Changed files are within authorization.
14. Required framework post-change gates pass.
15. Generated metadata remains consistent.
16. Patch generation is deterministic.
17. Required runner controls pass.
18. Required migration and phase tests pass.

---

## 121. Detection-only outcome

Phase 3D may validly complete with detection-only support for some framework
profiles when:

- framework liveness evidence can be produced;
- framework coverage limitations are explicit;
- classifications remain conservative;
- unsafe transformations are unavailable;
- remediation capability is not claimed;
- the active completion scope permits detection-only support.

Detection-only framework support is a valid bounded capability.

---

## 122. Partially supported outcome

A framework capability may remain `partially_supported` when, for example:

- TSX parsing works but dynamic component resolution does not;
- explicit routes are supported but filesystem routes are not;
- direct providers are supported but dynamic modules are not;
- standard decorators are supported but custom composed decorators are not;
- development builds are supported but production builds are unavailable;
- detection is supported but remediation is not.

The exact unsupported dimensions must remain explicit.

---

## 123. Blocked outcome

Phase 3D must remain blocked when applicable:

- syntax parser behavior is ambiguous;
- framework identity is ambiguous;
- framework version is unsupported;
- required adapter is unavailable;
- required adapter licensing is unresolved;
- required configuration cannot be evaluated safely;
- executable configuration escapes isolation;
- required route or registration scope is unsupported;
- reflection may expose the target;
- generated metadata is stale or malformed;
- required environment coverage is unavailable;
- required framework gate fails;
- required runner control fails;
- migration tests fail;
- tenant isolation fails;
- required tests fail or are unavailable;
- exact finding reproduction fails;
- dominant liveness evidence appears;
- authorization expires or is revoked.

A blocked result must identify the exact safe next action.

---

## 124. Phase completion criteria

Phase 3D may be reported complete only when all applicable criteria are
satisfied:

1. TSX and JSX profiles are explicit.
2. Supported syntax parsing is implemented.
3. Component identity is deterministic.
4. JSX reference resolution is implemented for the supported profile.
5. Framework detection is attributable.
6. Framework adapters are versioned.
7. Every adapter has an explicit capability status.
8. Route evidence is implemented for supported profiles.
9. Dependency-injection evidence is implemented for supported profiles.
10. Decorator evidence is implemented for supported profiles.
11. Event and scheduler evidence is implemented for supported profiles.
12. Plugin and reflection limitations are explicit.
13. Configuration-driven liveness is bounded.
14. Generated metadata evidence is validated.
15. Framework coverage is implemented.
16. Partial framework coverage preserves uncertainty.
17. Classification remains deterministic and conservative.
18. Human disposition remains separate.
19. Remediation authorization remains separate.
20. Exact finding reproduction includes framework identities.
21. Structured transformations are narrowly scoped.
22. Unauthorized framework and generated-file changes are rejected.
23. Required framework baseline gates pass.
24. Required framework post-change gates pass.
25. Required database migrations pass.
26. Required security controls pass.
27. Required Phase 3D tests pass.
28. Triggered conditional tests pass.
29. Capability statuses are updated truthfully.
30. Security-control matrix is updated.
31. Phase report is complete.
32. Execution state is updated.
33. No unresolved blocker contradicts completion.

---

## 125. Phase report

The Phase 3D completion report should include:

- authorization identity;
- objective;
- source commit before and after;
- files changed;
- migrations;
- dependencies;
- supported TypeScript and JavaScript versions;
- supported TSX and JSX profiles;
- framework profiles;
- framework versions;
- adapter identities;
- component shapes;
- route conventions;
- dependency-injection conventions;
- decorator conventions;
- event and scheduler conventions;
- plugin conventions;
- configuration behavior;
- generated metadata behavior;
- framework coverage;
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

The report must not describe one supported framework convention as universal
framework support.

---

## 126. Execution-state handoff

The Phase 3D handoff should identify:

- phase status;
- authorization status;
- source commit;
- worktree state;
- supported syntax profiles;
- supported framework profiles;
- supported framework versions;
- adapter statuses;
- remediation-supported shapes;
- detection-only shapes;
- unsupported dynamic behavior;
- test manifest;
- test results;
- security-control results;
- migrations;
- external operations;
- retained external state;
- cleanup state;
- next human decision.

The handoff must not authorize Phase 4.

---

## 127. Transition to Phase 4

Phase 4 may be proposed when the TypeScript capability boundary is explicit
across:

- single-package repositories;
- supported package managers;
- supported workspaces;
- supported TSX and JSX syntax;
- selected framework conventions.

Before Phase 4 begins:

1. Finalize the Phase 3D report.
2. Update execution state.
3. Stop Phase 3D implementation.
4. Present actual framework capability statuses.
5. Record unsupported Python behavior.
6. Prepare a Phase 4 authorization.
7. Obtain explicit human approval.

Phase 4 must not start automatically.

---

## 128. Phase stop conditions

Work must stop when:

- Phase 3D authorization is inactive;
- authorization expires;
- authorization is revoked;
- repository or package scope is exceeded;
- an excluded repository target operation is requested;
- repository identity cannot be verified;
- immutable source resolution fails;
- syntax profile is unsupported;
- framework identity is ambiguous;
- required framework adapter is unavailable;
- required adapter licensing is unresolved;
- executable configuration cannot be isolated;
- required framework scope is inaccessible;
- required generated metadata is malformed;
- required environment coverage is unavailable;
- required runner controls fail;
- a destructive migration would be required without permission;
- a required test fails or is unavailable;
- tenant isolation fails;
- exact finding reproduction fails;
- framework coverage becomes incomplete;
- dominant liveness evidence appears;
- changed files exceed authorization;
- secret exposure is suspected;
- local user work cannot be preserved;
- external state becomes unknown and cannot be reconciled safely.

Stopping must be recorded truthfully.

---

## 129. Fail-safe behavior

When syntax, framework identity, adapter semantics, configuration, registration,
reflection, generated metadata, environment scope, evidence, coverage, baseline
state, transformation, verification, or publication state cannot be established
confidently:

- do not report full framework support;
- do not infer liveness from names alone;
- do not infer deadness from missing direct calls;
- do not treat unsupported framework scope as empty;
- do not execute framework configuration outside the runner;
- do not create human disposition automatically;
- do not infer remediation authorization;
- do not remove routes, providers, handlers, plugins, or lifecycle methods;
- do not modify generated files without explicit authorization;
- do not generate a publication-eligible patch;
- do not publish;
- preserve available evidence;
- return an explicit partial, detection-only, unsupported, failed, stale,
  configuration-required, or blocked result;
- identify the exact missing requirement.

Framework uncertainty must reduce classification, remediation, and publication
authority.

---

## 130. Document integrity

This roadmap file must not be modified during Phase 3D implementation unless
roadmap or governance modification is explicitly authorized.

Changes require:

1. Identification of the Phase 3D planning problem.
2. Review against the roadmap overview.
3. Review against permanent safety invariants.
4. Review of syntax and framework implications.
5. Review of adapter, evidence, and coverage implications.
6. Review of reflection, configuration, and generated-artifact implications.
7. Review of remediation and publication implications.
8. Review of authorization and testing impact.
9. Updated Phase 3D test manifest where applicable.
10. Updated schemas or capability definitions where applicable.
11. A reviewable governance commit.
12. An ADR when the change alters long-lived syntax, framework-adapter,
    configuration-evaluation, registration, or remediation semantics.

This roadmap must not be weakened to make unsupported framework behavior,
incomplete coverage, unresolved reflection, stale metadata, failed gates,
failed tests, or unauthorized framework changes appear acceptable.
