# Phase 4 — Python

This document defines the planned scope, capability boundaries, evidence
requirements, tests, stop conditions, and completion criteria for Phase 4 of
DCAv2.

Phase 4 introduces conservative Python dead-code analysis through versioned
repository profiles, explicit evidence provenance, open-world coverage, and
narrow remediation support.

Python is highly dynamic. Imports, decorators, reflection, runtime registration,
configuration, package entry points, framework discovery, monkey patching, and
generated code may create liveness that is not visible through ordinary static
references.

Missing static references must therefore never be treated as sufficient proof
that Python code is dead.

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
  id: phase-4-python
  name: Python
  roadmap_order: 4
  default_status: inactive
  implementation_authorized_by_this_file: false
```

The phase becomes active only when the current authorization record explicitly
identifies `phase-4-python` as active.

---

## 2. Primary objective

The primary objective is to implement and validate a bounded Python workflow
covering:

1. Python repository qualification.
2. Python interpreter and version resolution.
3. Environment and dependency-manager detection.
4. Package and module discovery.
5. Function, class, and method inventory.
6. Import and reference evidence.
7. Package entry-point evidence.
8. Decorator and registration evidence.
9. Reflection and dynamic-import uncertainty.
10. Framework-specific evidence where explicitly supported.
11. Open-world Python coverage.
12. Conservative classification.
13. Human disposition.
14. Separate remediation authorization.
15. Exact finding reproduction.
16. Baseline verification.
17. Structured transformation for narrow supported shapes.
18. Post-change verification.
19. Deterministic patch generation.
20. Trusted draft publication when separately authorized.
21. Append-only audit and truthful reporting.

The initial remediation target should remain narrow, such as a private
module-level Python function in a qualified package with complete supported
coverage.

---

## 3. Intended capability

The intended initial capability is conceptually:

```text
Detect, explain, review, reproduce, and safely remove one supported private
module-level Python function from a qualified repository when static,
configuration, registration, entry-point, framework, and dynamic-use coverage
required by the active profile is complete.
```

The capability must remain constrained by:

- supported Python versions;
- supported repository profiles;
- supported dependency-management profiles;
- supported import semantics;
- supported package layouts;
- supported namespace-package behavior;
- supported decorator and registration rules;
- supported framework adapters;
- complete required coverage;
- exact finding identity;
- current human disposition;
- separate remediation authorization;
- supported transformation shape;
- available baseline and post-change gates;
- runner security;
- trusted publication controls.

A successful fixture must not be generalized beyond its tested profile.

---

## 4. Phase prerequisites

Phase 4 should not begin until earlier phases have established or bounded:

- canonical repository identity;
- immutable source acquisition;
- repository qualification;
- configuration precedence;
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
- capability and security-control reporting.

Unresolved earlier limitations must remain explicit.

---

## 5. Non-goals

Phase 4 does not, by default, include:

- universal Python support;
- every Python version;
- every package manager;
- every virtual-environment system;
- every build backend;
- every framework;
- complete reflection analysis;
- complete dynamic import resolution;
- complete monkey-patching analysis;
- complete metaclass analysis;
- complete descriptor analysis;
- complete plugin discovery;
- complete dependency-injection analysis;
- complete notebook analysis;
- complete C-extension analysis;
- complete generated-code analysis;
- complete template-language analysis;
- cross-repository Python consumer discovery;
- runtime telemetry;
- public API removal;
- package deletion;
- module deletion;
- dependency removal;
- automatic configuration changes;
- automatic manifest or lockfile changes;
- automatic remediation authorization;
- direct default-branch publication;
- pull-request merge;
- enterprise-scale validation.

Unsupported behavior must produce an explicit safe status.

---

## 6. Authorization prerequisites

The active Phase 4 authorization must identify applicable:

- local repository scope;
- external repository scope;
- immutable source revisions;
- package and module scope;
- Python profiles;
- framework profiles;
- files permitted for modification;
- test files permitted for modification;
- manifest and lockfile permission;
- dependency-installation permission;
- build-backend permission;
- lifecycle or build-hook permission;
- migration permission;
- database-operation permission;
- runner-image permission;
- command-registry permission;
- network access;
- package-index access;
- private-index credential capabilities;
- test-service capabilities;
- remediation permission;
- publication permission;
- external cleanup permission;
- destructive-operation permission;
- required tests;
- stop conditions;
- expiration or completion boundary.

Permission to analyze Python does not automatically permit dependency
installation, virtual-environment creation, manifest changes, lockfile changes,
build-hook execution, or source remediation.

Missing permissions default to denial.

---

## 7. Required phase outputs

Phase 4 should produce applicable:

- Python repository profiles;
- interpreter-resolution capability;
- environment-manager detection;
- dependency-manager detection;
- package and module inventory;
- Python symbol identity model;
- import graph;
- reference evidence;
- package entry-point evidence;
- decorator and registration evidence;
- framework adapter registry;
- dynamic-use uncertainty records;
- Python coverage profiles;
- deterministic Python classification profiles;
- detection-only support for unresolved dynamic cases;
- narrow structured remediation profiles;
- Python baseline and post-change gates;
- additive database migrations;
- audit events;
- phase test manifest;
- capability-matrix updates;
- security-control updates;
- phase-completion report;
- updated execution state.

---

## 8. Capability identifiers

Phase 4 should define or update capability identifiers such as:

```text
repository.python.qualify.v1
runtime.python.resolve.v1
environment.python.detect.v1
dependency.python.detect.v1
inventory.python.module.v1
inventory.python.function.v1
inventory.python.class.v1
analysis.python.imports.v1
analysis.python.references.v1
analysis.python.entry-points.v1
analysis.python.decorators.v1
analysis.python.dynamic-import-risk.v1
coverage.python.single-package.v1
classification.python.private-function.v1
reproduction.python.private-function.v1
remediation.python.private-function-delete.v1
verification.python.gates.v1
```

Framework-specific capability identifiers should include the framework and
profile version.

Examples include:

```text
framework.django.registration-evidence.v1
framework.flask.route-evidence.v1
framework.fastapi.route-evidence.v1
framework.celery.task-evidence.v1
framework.pytest.fixture-evidence.v1
```

Every capability identifier must remain narrow, stable, versioned, and
testable.

---

## 9. Separate Python capability dimensions

DCAv2 must distinguish:

- detecting Python files;
- resolving a Python interpreter;
- parsing Python syntax;
- discovering packages and modules;
- resolving imports;
- resolving ordinary references;
- detecting package entry points;
- detecting decorators;
- detecting framework registration;
- evaluating dynamic-use risk;
- establishing complete coverage;
- classifying a finding;
- remediating a finding;
- publishing a verified patch.

Successful syntax parsing does not establish semantic or framework support.

Successful detection does not establish remediation support.

---

## 10. Qualification statuses

Python qualification should use explicit statuses such as:

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

A repository must not be reported as Python-ready merely because it contains
`.py` files.

---

## 11. `ready`

A repository is `ready` for a requested Python capability only when:

- repository identity is verified;
- immutable source resolution succeeds;
- the Python repository profile is supported;
- the required interpreter version is resolved;
- dependency-management behavior is supported;
- package and module roots are unambiguous;
- required tools are available;
- required configuration is valid;
- required commands are mapped;
- required framework adapters are functional;
- required Python coverage can become complete;
- required baseline gates are available;
- required security controls are enforced;
- no required scope remains failed, inaccessible, ambiguous, or unsupported.

`Ready` does not authorize analysis, remediation, or publication.

---

## 12. Supported initial repository profile

The initial Python profile should be intentionally narrow.

A possible profile is:

```text
One Git repository
One Python package or application
Supported Python version
Supported pyproject-based or requirements-based dependency profile
Discoverable source root
No unresolved namespace-package boundary
No required cross-repository consumers
No unsupported framework registration affecting the finding
No required C-extension analysis for the target
No unresolved dynamic import affecting the target
Required baseline gates available
```

Repositories outside this profile must not be forced through the workflow.

---

## 13. Python file detection

Python file detection should classify applicable files as:

- authored Python source;
- test source;
- generated Python source;
- migration source;
- configuration source;
- notebook-generated source;
- vendored source;
- dependency source;
- stub file;
- unknown source.

File extension alone is insufficient to determine authored source ownership.

Generated and vendored files must remain distinct from authored source.

---

## 14. Python version resolution

The Python interpreter version must be resolved deterministically.

Potential approved sources include:

- trusted repository profile;
- `pyproject.toml`;
- supported version-management files;
- package metadata;
- CI configuration as supporting evidence;
- an approved runner-image interpreter;
- trusted operator configuration.

The result should identify:

- declared version range;
- resolved interpreter version;
- executable identity;
- executable path inside the runner;
- resolution method;
- support status;
- conflicts;
- source commit;
- runner image.

---

## 15. Interpreter conflicts

Qualification must detect conflicts such as:

- project metadata declares one version while tooling declares another;
- several version-management files disagree;
- build configuration requires another version;
- lockfile metadata conflicts with the selected interpreter;
- a dependency requires an unsupported Python version;
- local and runner versions differ materially.

The workflow must not select a version silently when the difference affects
semantics or dependency resolution.

Conflicts should produce:

- `configuration_required`;
- `unsupported`;
- or `failed`.

---

## 16. Host-global interpreter fallback

DCAv2 must not silently use an undeclared host-global Python interpreter.

The selected interpreter must come from:

- the approved runner image;
- an approved isolated toolchain;
- or another explicitly authorized immutable environment.

A missing supported interpreter must produce an unavailable,
configuration-required, or unsupported result.

Tests must verify that a host-global Python cannot satisfy a missing approved
runner interpreter.

---

## 17. Python environment profiles

Phase 4 should model environment preparation separately from source analysis.

Potential profiles include:

- no dependency installation required;
- isolated virtual environment with public-index dependencies;
- isolated virtual environment with private-index dependencies;
- lockfile-based deterministic environment;
- editable local-package installation;
- build-only environment;
- test environment with approved services.

Each profile must identify:

- interpreter;
- environment location;
- dependency source;
- network profile;
- credential capability;
- build hooks;
- isolation controls;
- cleanup;
- known limitations.

---

## 18. Virtual environments

Virtual environments must be created inside the isolated job.

A virtual environment record should identify:

- environment ID;
- job ID;
- Python version;
- creation command;
- environment path;
- source commit;
- dependency profile;
- content or requirements digest;
- creation status;
- cleanup status.

A repository-provided virtual-environment path must not select an arbitrary host
directory.

Virtual environments must not be shared across tenants without an approved
isolation design.

---

## 19. Environment inheritance

Python commands must not inherit the complete host environment.

The runner should control applicable variables such as:

- `PATH`;
- `PYTHONPATH`;
- `PYTHONHOME`;
- user-site behavior;
- virtual-environment identity;
- package-index configuration;
- cache directories;
- temporary directories;
- locale;
- hash seed;
- bytecode-writing behavior;
- test-specific configuration.

Repository content must not use inherited Python path configuration to import
code outside the authorized workspace.

---

## 20. User-site packages

User-site packages must be disabled or explicitly controlled.

DCAv2 must not allow:

- host user-site packages;
- developer-global packages;
- unrelated editable installations;
- arbitrary path injections;

to satisfy project dependencies silently.

Tests must verify that undeclared host packages do not make an otherwise
unqualified repository appear ready.

---

## 21. `PYTHONPATH` handling

`PYTHONPATH` must be constructed from approved repository and environment
locations.

It must not include:

- host source directories;
- unrelated repositories;
- credential directories;
- user-site locations;
- arbitrary repository-provided absolute paths;
- paths outside the isolated workspace.

Every added path should be normalized and attributable.

---

## 22. Dependency-manager detection

Qualification should identify supported dependency-management signals such as:

- `pyproject.toml`;
- `requirements.txt`;
- supported constraints files;
- supported lockfiles;
- build-system metadata;
- package-manager configuration;
- trusted operator configuration.

The result should identify:

- dependency profile;
- dependency manager;
- lockfile or requirements identity;
- build backend;
- package indexes;
- environment markers;
- editable local dependencies;
- conflicts;
- support status.

---

## 23. Dependency profiles

Phase 4 should define separate capability profiles for supported dependency
forms.

Potential initial profiles include:

- `pyproject.toml` with a supported build backend and no lockfile;
- `requirements.txt` with fully pinned dependencies;
- supported lockfile generated by a selected Python dependency manager;
- local package with no external dependencies;
- detection-only analysis without installation.

Each profile must define deterministic and security expectations.

---

## 24. Dependency conflicts

Qualification must detect applicable conflicts such as:

- several independent lockfiles;
- requirements and lockfile disagreement;
- package metadata and lockfile disagreement;
- several package managers in one root;
- nested independent environments;
- editable dependency outside the repository;
- VCS dependency without authorized network access;
- direct URL dependency with unsupported provenance.

The workflow must not select one dependency source silently.

---

## 25. Lockfile and requirements identity

Every dependency environment should bind to exact input identity.

Applicable fields include:

- repository-relative path;
- content digest;
- parser version;
- dependency-manager version;
- source commit;
- environment markers;
- index identity;
- profile version;
- parse status;
- compatibility status.

Any relevant change must invalidate qualification and baseline results.

---

## 26. Package-index access

Dependency installation may use only approved package-index destinations.

The network profile should define:

- public index destinations;
- private index destinations;
- package scopes where applicable;
- certificate requirements;
- credential capability;
- timeout;
- connection limit;
- download limit;
- audit behavior.

Repository configuration cannot broaden the approved destination list.

---

## 27. Credential-bearing index configuration

Python index configuration may contain:

- usernames;
- passwords;
- tokens;
- credential-bearing URLs;
- certificate paths;
- client-key paths.

DCAv2 must not:

- print raw values;
- persist raw values;
- copy them into reports;
- include them in patches;
- expose them to unrelated commands;
- store them in environment records.

Synthetic credential canaries should validate redaction and cleanup.

---

## 28. Deterministic dependency installation

A supported installation profile should define:

- interpreter version;
- installer or dependency-manager version;
- dependency input digest;
- constraints;
- index profile;
- build-isolation behavior;
- binary versus source-package behavior;
- environment markers;
- timeout;
- resource limits;
- output limits;
- expected filesystem changes;
- cleanup.

Installation must not silently rewrite dependency inputs.

---

## 29. Source distributions and build hooks

Installing a source distribution may execute build backend code.

Build backend and installation hooks are untrusted code.

When source builds are permitted:

- execution must occur only inside the runner;
- network access must remain restricted;
- trusted credentials must remain unavailable;
- filesystem access must remain bounded;
- CPU, memory, process, disk, and output limits must apply;
- generated artifacts must be tracked;
- cleanup must be verified.

A required source build that cannot run safely must block the affected profile.

---

## 30. Wheels and binary extensions

Binary wheels and native extensions may execute native code during import or
tests.

The profile must identify:

- whether binary packages are permitted;
- supported platforms;
- architecture;
- provenance;
- integrity metadata;
- native-code risk;
- runner isolation requirements;
- known limitations.

Native dependencies may require stronger isolation than ordinary pure-Python
analysis.

---

## 31. Editable installations

Editable installation changes import behavior and may create generated metadata.

A supported editable-install profile must define:

- command;
- source root;
- generated metadata;
- path injection;
- build backend;
- environment location;
- expected changes;
- cleanup;
- security implications.

Editable installation must not expose unrelated host paths.

---

## 32. Dependency caches

Python package caches must have an explicit policy.

The policy should define:

- cache location;
- read and write permissions;
- tenant scope;
- package integrity;
- private package isolation;
- wheel and source artifact separation;
- retention;
- cleanup;
- poisoning response;
- secret exclusion.

A shared cache is a potential cross-job trust channel.

---

## 33. Package-root discovery

Python package-root discovery should use applicable:

- repository profile;
- `pyproject.toml`;
- package configuration;
- source layout;
- build metadata;
- import resolution;
- trusted configuration.

The result should identify:

- project root;
- source roots;
- package roots;
- module roots;
- test roots;
- generated roots;
- migration roots;
- excluded roots;
- namespace-package roots;
- support status.

---

## 34. `src` and flat layouts

Phase 4 should distinguish supported source layouts such as:

- `src` layout;
- flat repository-root layout;
- application-only layout;
- several package roots;
- nested independent projects;
- mixed package and script layout.

Each layout must have explicit import-resolution and coverage behavior.

A flat layout must not cause dependency or tool directories to be treated as
authored modules.

---

## 35. Namespace packages

Namespace packages require explicit support.

Qualification should distinguish:

- regular package with `__init__.py`;
- native namespace package;
- legacy namespace mechanism;
- split namespace across several roots;
- namespace spanning repositories;
- ambiguous namespace.

A namespace package spanning inaccessible or external roots must reduce
coverage.

Phase 4 must not claim complete package coverage when namespace membership is
unknown.

---

## 36. Package identity

A Python package identity should bind applicable:

- repository identity;
- source commit;
- package root;
- import name;
- package type;
- namespace status;
- configuration identity;
- source digest.

Import name alone is insufficient.

Two packages with the same import name in different roots must remain distinct
until resolution proves which one is active.

---

## 37. Module identity

A Python module identity should bind:

- repository;
- source commit;
- package identity;
- repository-relative file path;
- normalized module name;
- source root;
- module kind;
- source occurrence;
- content digest.

The same module name under different source roots must not be collapsed
silently.

---

## 38. Script modules

Standalone scripts may be entry points even when not imported.

Qualification should identify scripts through applicable:

- direct command mappings;
- shebangs as supporting evidence;
- package scripts;
- CI commands;
- deployment configuration;
- scheduler configuration;
- trusted operator configuration.

A script with no imports may still be live.

Script-entry evidence must remain separate from ordinary import evidence.

---

## 39. Notebook handling

Notebook support should remain explicit and separate.

Phase 4 may initially classify notebooks as:

- unsupported;
- detection-only;
- source-extraction-only;
- excluded with coverage impact.

Code extracted from notebooks must preserve cell identity and execution-order
uncertainty.

Notebook absence of references must not support automatic remediation by
default.

---

## 40. Stub files

Python stub files may provide type information, public API declarations, and
consumer contracts.

Qualification should distinguish:

- authored `.pyi` files;
- generated stubs;
- third-party stubs;
- inline typing;
- stub-only packages.

A symbol present in a public stub may be externally consumable even when local
runtime references are absent.

Stub coverage must be considered for public API decisions.

---

## 41. Generated Python source

Generated source may come from:

- schema compilers;
- ORM generators;
- API clients;
- protocol tools;
- parser generators;
- template systems;
- build backends.

Generated source should retain:

- generator identity;
- source inputs;
- output path;
- generated marker;
- source commit;
- artifact digest;
- support status.

Generated source must not be remediated by default.

---

## 42. Vendored source

Vendored Python source must remain distinct from authored project source.

Qualification should identify applicable:

- vendor roots;
- copied dependencies;
- generated vendor bundles;
- third-party notices;
- update tooling.

Vendored code must not be remediated under an ordinary project-source
authorization.

Its presence may still affect import resolution and coverage.

---

## 43. Python syntax parsing

Python parsing support should record:

- parser identity;
- parser version;
- selected Python grammar;
- source file;
- parse status;
- unsupported syntax;
- diagnostics;
- source occurrence mapping.

A parse failure must reduce source coverage.

It must not be skipped silently.

---

## 44. Parser strategy

Potential parser and syntax components include:

- Python's built-in AST;
- a concrete syntax tree library;
- Tree-sitter;
- language-server or semantic tooling;
- structured transformation libraries.

Each adopted component must have an explicit role.

The roadmap mention of a component is not approval.

---

## 45. Concrete syntax requirements

Safe transformation may require a concrete syntax representation that preserves
applicable:

- comments;
- formatting;
- whitespace;
- decorators;
- type comments;
- string prefixes;
- line endings;
- source positions.

The built-in AST alone may be insufficient for source-preserving edits.

The transformation strategy must be evaluated and tested separately from
analysis.

---

## 46. Module inventory

The Python inventory should identify:

- packages;
- modules;
- scripts;
- tests;
- generated modules;
- migration modules;
- configuration modules;
- plugin modules;
- entry-point modules;
- unsupported modules.

Every module should retain source-root, package, and repository identity.

---

## 47. Function inventory

A Python function record should retain applicable:

- symbol ID;
- repository;
- source commit;
- package;
- module;
- file path;
- source occurrence;
- function name;
- qualified name;
- async status;
- decorator identities;
- nesting;
- export indicators;
- type annotations;
- content digest;
- syntax shape.

Function identity must not rely only on name.

---

## 48. Initial supported function shape

The initial supported remediation shape should be narrow.

A supported private module-level function may require:

- module-level definition;
- name beginning with a profile-approved private convention;
- not exported through a supported public API;
- not nested;
- no unsupported decorator;
- no overload-like typing pattern;
- no generated-source marker;
- no framework registration;
- no entry-point registration;
- no dynamic-reference ambiguity;
- exact supported syntax;
- deterministic transformation support.

Private naming is supporting metadata, not proof of deadness.

---

## 49. Nested functions

Nested functions may be referenced through closures, returned values, decorators,
or dynamic behavior.

Phase 4 should initially treat nested-function remediation as unsupported unless
a dedicated profile exists.

Nested function inventory may still support detection and evidence.

An unsupported nested function must not be transformed approximately.

---

## 50. Lambda expressions

Lambda expressions require separate identity and transformation semantics.

Phase 4 may initially classify them as:

- inventory-only;
- evidence-only;
- unsupported for remediation.

A lambda assigned to a private name must not automatically be treated as
equivalent to a supported function declaration.

---

## 51. Class inventory

Class inventory should retain:

- class identity;
- package;
- module;
- source occurrence;
- bases;
- decorators;
- metaclass;
- methods;
- attributes;
- registration evidence;
- export status;
- framework role;
- content digest.

Class removal should remain outside the initial remediation scope.

Class inventory is still required because class members and registration may
create liveness.

---

## 52. Method inventory

Method identity should account for:

- containing class;
- method name;
- static, class, or instance method;
- property or descriptor status;
- decorator identities;
- override relationships where supported;
- framework lifecycle role;
- source occurrence.

Method-name matching alone is insufficient for semantic reference resolution.

Initial remediation should exclude methods unless a dedicated profile is
implemented.

---

## 53. Import graph

The Python import graph should model applicable:

- absolute imports;
- relative imports;
- package imports;
- module imports;
- imported symbols;
- alias imports;
- wildcard imports;
- conditional imports;
- type-checking-only imports;
- dynamic imports;
- import hooks;
- unresolved imports.

Every edge must retain provenance and resolution status.

---

## 54. Import resolution

Import resolution must account for the selected environment and package profile.

The resolver should consider:

- source roots;
- package roots;
- namespace packages;
- current module;
- relative-import level;
- installed dependencies;
- editable installations;
- generated modules;
- stub packages;
- platform markers;
- interpreter version.

It must not rely on arbitrary host import state.

---

## 55. Import side effects

Importing a module may execute side effects.

A module may be live because it is imported even when no symbol is referenced
from it.

The evidence model must distinguish:

- module import;
- symbol import;
- re-export;
- side-effect import;
- unresolved import.

Removing a function from an imported module still requires symbol-level
analysis, but module liveness must remain visible.

---

## 56. Wildcard imports

Wildcard imports create uncertain symbol usage.

The adapter should distinguish:

- statically resolvable `__all__`;
- no `__all__`;
- dynamic `__all__`;
- wildcard import in supported scope;
- wildcard export;
- failed resolution.

An unresolved wildcard consumer must reduce coverage for potentially exported
symbols.

---

## 57. `__all__`

`__all__` may define a module's intended public surface.

The adapter should retain:

- declaration occurrence;
- statically resolved entries;
- dynamic entries;
- mutation after declaration;
- imported names;
- export status;
- resolution confidence.

A function listed in a supported resolved `__all__` must be treated as publicly
exposed.

Dynamic or unresolved `__all__` must reduce public-surface coverage.

---

## 58. Re-exports

Python symbols may be re-exported through package or module imports.

Reference analysis should account for:

- import-and-re-export;
- alias re-export;
- package-level re-export;
- wildcard re-export;
- stub re-export;
- conditional re-export.

A private-looking function may become externally visible through a re-export.

Unsupported re-export behavior must reduce coverage.

---

## 59. Ordinary references

Ordinary reference evidence may include:

- direct calls;
- value references;
- argument passing;
- return values;
- container membership;
- attribute assignment;
- decorator use;
- default argument use;
- annotation use where semantically relevant;
- test references.

Every reference must retain source occurrence and resolution confidence.

---

## 60. Name resolution

Python name resolution may depend on:

- local scope;
- enclosing scope;
- module globals;
- builtins;
- imports;
- class scope;
- dynamic global mutation;
- wildcard imports;
- monkey patching.

The initial supported reference profile should remain narrow.

Ambiguous name resolution must not become a resolved reference or authoritative
absence.

---

## 61. Attribute references

Attribute access may refer to:

- module symbol;
- class member;
- instance member;
- dynamically provided attribute;
- proxy object;
- descriptor;
- monkey-patched value.

The resolver must distinguish exact module-symbol references from unresolved
attribute access.

Unknown attributes must not be linked by name alone.

---

## 62. Type-checking-only references

References guarded by `TYPE_CHECKING` or equivalent static typing conditions may
affect:

- public typing contracts;
- static verification;
- runtime liveness;
- stub generation.

The classification profile must define how typing-only references affect
remediation.

A runtime-private helper referenced only for typing may still require
preservation depending on its role.

---

## 63. Annotation evaluation

Annotations may be:

- eagerly evaluated;
- stored as strings;
- deferred;
- transformed by future imports;
- inspected at runtime;
- consumed by frameworks;
- consumed by serializers;
- consumed by dependency injection.

The adapter must consider the supported Python version and framework profile.

Annotation references must not be dismissed as non-runtime universally.

---

## 64. Default arguments

Default argument expressions execute when a function is defined.

A function may be referenced inside another function's default argument without
an ordinary call.

Default argument evidence should retain:

- definition occurrence;
- referenced symbol;
- evaluation timing;
- resolution status;
- source snapshot.

Removing a referenced function would be unsafe.

---

## 65. Decorator evidence

Decorators may:

- register functions;
- wrap functions;
- replace functions;
- attach metadata;
- expose routes;
- create tasks;
- define fixtures;
- mark hooks;
- alter import behavior.

Each supported decorator rule must identify:

- resolved decorator symbol;
- framework or library;
- version profile;
- decorated target;
- registration effect;
- wrapper effect;
- source occurrence;
- ambiguity.

Decorator-name matching alone is insufficient.

---

## 66. Decorator stacks

Several decorators may compose behavior.

The adapter should retain:

- decorator order;
- resolved identities;
- supported combinations;
- unknown decorators;
- wrapper chain;
- registration effects;
- transformed target identity.

An unsupported decorator in the stack must prevent unsafe remediation if it may
affect liveness or source transformation.

---

## 67. Custom decorators

Custom decorators may hide registration or references.

DCAv2 should support them only when:

- their behavior is statically modeled;
- the wrapper chain is resolvable;
- evidence provenance is preserved;
- ambiguity and failure are tested.

Unknown custom decorators must reduce coverage.

They must not be treated as no-op metadata.

---

## 68. Package entry points

Package metadata may register live code through entry points.

Applicable entry-point groups may include:

- console scripts;
- GUI scripts;
- plugins;
- framework extensions;
- test plugins;
- custom application groups.

Entry-point evidence should retain:

- metadata source;
- group;
- name;
- module target;
- attribute target;
- package identity;
- source occurrence;
- resolution status;
- build metadata identity.

A resolved entry-point target must be treated as live.

---

## 69. Build metadata and entry points

Entry-point declarations may appear in:

- `pyproject.toml`;
- supported legacy metadata;
- generated distribution metadata;
- build backend output.

The adapter must identify the authoritative supported source for the profile.

Generated distribution metadata must remain bound to the exact source commit and
build backend.

---

## 70. Console scripts

A console-script target may reference a function without any ordinary source
call.

A resolved console-script function must be treated as live.

The evidence should bind:

- script name;
- target module;
- target function;
- metadata occurrence;
- environment;
- source snapshot.

Unresolved console-script targets must reduce coverage.

---

## 71. Plugin entry points

Plugin entry points may expose packages or symbols to external hosts.

Absence of local imports does not establish deadness for a registered plugin.

Public plugin targets should remain outside automatic remediation until external
consumer and host behavior are addressed by a supported profile.

---

## 72. Dynamic imports

Dynamic imports may use:

- `importlib`;
- built-in import functions;
- computed module strings;
- configuration;
- package entry points;
- plugin systems;
- filesystem scanning;
- framework loaders.

The adapter should classify dynamic imports as:

- statically resolved;
- partially resolved;
- unresolved;
- unsupported;
- failed.

Unresolved dynamic imports must reduce coverage for affected modules and
symbols.

---

## 73. Reflection

Reflection may include:

- `getattr`;
- `setattr`;
- `hasattr`;
- globals access;
- locals access;
- module dictionaries;
- class dictionaries;
- inspection APIs;
- string-based invocation;
- serialization;
- dependency injection.

Resolved reflective references may provide positive liveness evidence.

Unresolved reflection must preserve uncertainty.

Phase 4 must not claim reflection-complete analysis.

---

## 74. String-based references

A string may identify:

- module;
- class;
- function;
- method;
- route;
- task;
- serializer;
- plugin;
- fixture;
- migration;
- command.

String evidence should be classified as:

- resolved under a supported convention;
- supporting candidate evidence;
- ambiguous;
- unrelated;
- unsupported.

A matching string alone must not become authoritative liveness without a
versioned resolution rule.

---

## 75. Monkey patching

Monkey patching may replace or expose functions dynamically.

Applicable behavior includes:

- module attribute reassignment;
- class attribute reassignment;
- test patching;
- framework patch registries;
- import-time mutation;
- plugin mutation.

The initial profile should treat unresolved monkey-patching scope as a coverage
limitation.

A function subject to unresolved monkey-patching must not become
remediation-eligible.

---

## 76. Metaclasses

Metaclasses may register, transform, or reference class members.

Phase 4 should initially treat metaclass-sensitive class and method remediation
as unsupported unless a dedicated profile exists.

Metaclass presence should be recorded as liveness or uncertainty evidence where
relevant.

---

## 77. Descriptors

Descriptors and properties may create runtime invocation without ordinary call
syntax.

The inventory should distinguish:

- property getters;
- property setters;
- property deleters;
- custom descriptors;
- cached properties;
- framework descriptors.

Method-removal support should remain unavailable until descriptor behavior is
covered explicitly.

---

## 78. Module-level execution

Python module bodies execute during import.

A function definition itself may be referenced by later module-level
registration or mutation.

The analyzer must preserve statement ordering and module-level references.

A function with no references after import resolution may still be affected by
dynamic module-level behavior.

---

## 79. Conditional imports and references

Python code may vary by:

- platform;
- Python version;
- environment variable;
- optional dependency;
- import success;
- feature flag;
- application mode.

Coverage profiles must identify which conditions are represented.

Unknown required conditions must prevent complete coverage.

A branch not active in one test environment may still be live elsewhere.

---

## 80. Platform-specific code

Platform markers and conditional imports may create different live code on:

- Linux;
- macOS;
- Windows;
- different architectures;
- different interpreter implementations.

The supported profile must identify tested platforms.

Untested required platform branches must remain unsupported or incomplete.

---

## 81. Test code as evidence

Tests may provide positive liveness evidence.

The classification profile must define how to treat:

- unit-test references;
- integration-test references;
- test fixtures;
- parameterization;
- test plugin registration;
- helper-only references;
- skipped tests;
- generated tests.

A function referenced only by tests is not automatically dead.

Test-only status may be surfaced for human review through a separate
classification profile.

---

## 82. Pytest fixtures

Pytest may discover fixtures through decorators, names, plugins, and
configuration.

A supported pytest adapter should model applicable:

- fixture decorator;
- fixture name;
- autouse behavior;
- scope;
- parameterization;
- plugin registration;
- `conftest.py`;
- indirect fixture requests;
- string-based fixture references.

A fixture with no ordinary calls may still be live.

---

## 83. Pytest hooks

Pytest hook functions may be discovered by naming and plugin registration.

A supported adapter must define:

- supported hook names;
- plugin scope;
- `conftest.py` behavior;
- registration prerequisites;
- version profile;
- source occurrence.

A function name resembling a pytest hook outside the supported context must not
receive automatic liveness.

---

## 84. Unittest discovery

Unittest may discover tests and lifecycle methods through naming and inheritance
conventions.

Phase 4 may record this behavior for test coverage.

Method-removal support should remain outside the initial scope unless the
conventions are modeled explicitly.

---

## 85. Framework adapters

Framework support must use versioned adapters.

Each adapter should define:

- adapter ID;
- adapter version;
- framework;
- framework version range;
- supported repository profiles;
- evidence types;
- coverage dimensions;
- classification implications;
- remediation boundary;
- required commands;
- required tests;
- security considerations;
- status.

Repository content must not add a trusted adapter automatically.

---

## 86. Initial framework candidates

Potential initial framework candidates include:

- Flask route registration;
- FastAPI route registration;
- Django application and management-command registration;
- Celery task registration;
- pytest fixture and hook registration.

Selection should be evidence-based.

Phase 4 should add a small number of bounded adapters rather than claiming broad
Python framework support.

---

## 87. Flask route evidence

A supported Flask adapter may identify:

- application instance;
- route decorator;
- blueprint registration;
- route function;
- HTTP methods;
- route path;
- package;
- source occurrence;
- registration status;
- framework version.

A resolved route function must be treated as live.

Dynamic application factories and blueprint discovery must remain explicit.

---

## 88. FastAPI route evidence

A supported FastAPI adapter may identify:

- application or router instance;
- route decorator;
- included router;
- dependency function;
- path operation function;
- lifecycle handler;
- middleware registration;
- framework version.

Dependency functions may be live without ordinary direct calls.

Unresolved router composition must reduce coverage.

---

## 89. Django evidence

A supported Django adapter may identify applicable:

- installed applications;
- URL configuration;
- views;
- management commands;
- signals;
- model registration;
- admin registration;
- middleware;
- migrations;
- application configuration;
- framework settings.

Django support should be divided into separate bounded capabilities.

The presence of Django does not imply every convention is supported.

---

## 90. Celery task evidence

A supported Celery adapter may identify:

- task decorators;
- shared tasks;
- application task registration;
- scheduled task configuration;
- autodiscovery;
- signal handlers;
- task names;
- framework version.

A registered task must be treated as live even without direct source calls.

Unresolved autodiscovery must reduce coverage.

---

## 91. Command and job registration

Python applications may register command handlers or scheduled jobs through:

- decorators;
- entry points;
- framework registries;
- configuration;
- directory scanning;
- naming conventions.

Each supported rule must bind the registration occurrence to an exact symbol.

Name-based guesses alone are insufficient.

---

## 92. Migration modules

Framework migration modules may be executed by convention.

They should be identified separately from ordinary source modules.

Migration functions and classes must not be remediated under an ordinary
private-function profile.

Unknown migration conventions must remain explicit.

---

## 93. Configuration-driven liveness

Python configuration may make symbols live through:

- declarative files;
- dotted import strings;
- static mappings;
- settings modules;
- plugin lists;
- route maps;
- task maps;
- serializer declarations.

Every supported configuration adapter should define:

- schema;
- source path;
- symbol-resolution method;
- version;
- dynamic fields;
- coverage impact.

---

## 94. Dotted import strings

Dotted import strings may resolve to modules, classes, or functions.

A supported resolver should retain:

- configuration occurrence;
- string value;
- package context;
- resolved module;
- resolved attribute;
- source occurrence;
- ambiguity;
- framework profile;
- freshness.

Unresolved dotted paths must reduce coverage.

---

## 95. Executable configuration

Executable Python configuration must run only inside the untrusted runner.

The trusted controller must not directly import:

- settings modules;
- framework applications;
- dependency-injection containers;
- plugin loaders;
- task modules;
- route modules;
- package build configuration.

The controller may consume only validated structured output.

Import side effects and failures must remain explicit.

---

## 96. Runtime import probes

A runtime import probe may provide supporting evidence when authorized and safe.

A probe must define:

- exact source commit;
- isolated environment;
- command ID;
- imported module;
- network policy;
- credentials;
- timeout;
- side-effect controls;
- observed imports;
- failure behavior;
- cleanup.

A successful import probe does not establish complete runtime coverage.

A failed import probe must not become zero liveness.

---

## 97. Static-analysis tools

Phase 4 should evaluate reusable Python tooling before implementing equivalent
behavior.

Potential tools include:

- Python AST facilities;
- language-server or semantic tooling;
- Vulture;
- import-graph tools;
- type checkers;
- structured transformation libraries;
- Tree-sitter.

Each tool must have one explicit role.

No external tool may directly authorize classification, remediation, or
publication.

---

## 98. Vulture role

Vulture may provide supporting unused-code evidence.

Its output must be normalized with:

- tool version;
- configuration;
- confidence;
- source occurrence;
- finding type;
- exclusions;
- failure status;
- raw artifact digest.

A Vulture finding must not become authoritative `candidate_dead` without
required DCAv2 evidence and coverage.

---

## 99. Type-checker role

A supported type checker may provide:

- import-resolution evidence;
- symbol-reference evidence;
- baseline verification;
- annotation diagnostics;
- package-boundary information.

Type-checker failure must not become zero references.

Type-checker support must be versioned and profile-specific.

---

## 100. Language-server or semantic-index role

A language server or semantic-index tool may provide richer symbol and reference
evidence.

The adapter must define:

- project configuration;
- interpreter environment;
- version;
- output schema;
- symbol identity;
- source occurrence;
- unsupported syntax;
- failure semantics;
- coverage contribution.

Generated semantic data must remain attributable to exact environment and source
identity.

---

## 101. Evidence normalization

Python tool output must be normalized into the common DCAv2 evidence model.

Normalization should retain:

- repository;
- source commit;
- Python profile;
- Python version;
- environment identity;
- dependency-input digest;
- package;
- module;
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

Tool-specific confidence values must not become classification policy directly.

---

## 102. Python evidence types

Potential normalized evidence types include:

- semantic call reference;
- semantic value reference;
- import reference;
- re-export reference;
- package entry-point registration;
- route registration;
- task registration;
- fixture registration;
- plugin registration;
- configuration dotted-path reference;
- decorator registration;
- dynamic-import candidate;
- reflective-reference candidate;
- monkey-patch candidate;
- test reference;
- typing-only reference;
- public-surface evidence;
- generated-source relation.

Each type must have explicit polarity and precedence behavior.

---

## 103. Evidence freshness

Python evidence becomes stale when applicable:

- source commit changes;
- file content changes;
- interpreter version changes;
- environment identity changes;
- dependency inputs change;
- package roots change;
- import resolution changes;
- framework version changes;
- adapter version changes;
- configuration changes;
- entry-point metadata changes;
- tool version changes;
- canonicalization changes.

Stale evidence must not satisfy classification or remediation prerequisites.

---

## 104. Contradictory evidence

Contradictory evidence must remain visible.

Examples include:

- an unused-code tool reports no references;
- a framework adapter resolves a route registration;
- a package entry point exposes the symbol;
- a dotted configuration path references the symbol;
- dynamic import scope is unresolved;
- a type checker and semantic adapter disagree;
- test discovery marks the symbol live.

Positive liveness evidence must dominate absence evidence under the applicable
profile.

Tool count must not act as majority voting.

---

## 105. Python coverage profiles

A Python coverage profile should include required dimensions such as:

- interpreter resolution;
- dependency profile;
- package-root discovery;
- namespace-package resolution;
- module discovery;
- syntax parsing;
- import graph;
- wildcard-import handling;
- re-export handling;
- ordinary reference analysis;
- entry-point analysis;
- decorator analysis;
- dynamic-import analysis;
- reflection-risk analysis;
- configuration-liveness analysis;
- test-discovery analysis;
- framework adapter coverage;
- generated-source analysis;
- public-surface analysis;
- required baseline readiness.

Every dimension must have an explicit status.

---

## 106. Coverage statuses

Python coverage should use statuses such as:

- `complete`;
- `partial`;
- `failed`;
- `unsupported`;
- `unavailable`;
- `excluded`;
- `stale`;
- `not_applicable`.

Only `complete` may satisfy a required dimension.

An unsupported dynamic behavior must not be represented as excluded merely
because the analyzer cannot resolve it.

---

## 107. Module coverage

Each required module should have a module-coverage record.

The record should identify:

- module identity;
- package identity;
- parse status;
- import-analysis status;
- reference-analysis status;
- decorator status;
- configuration status;
- framework status;
- dynamic-use status;
- generated status;
- completion status.

A failed module must not be treated as containing zero references.

---

## 108. Package coverage

Package coverage should aggregate module-level and package-level scope.

It should identify:

- modules discovered;
- modules analyzed;
- modules failed;
- modules unsupported;
- namespace scope;
- entry points;
- public exports;
- test scope;
- framework registrations;
- unresolved dynamic scope;
- completion status.

A simple module completion percentage is insufficient.

---

## 109. Repository coverage

Repository-level Python coverage should derive from:

- package coverage;
- script-entry coverage;
- configuration coverage;
- entry-point coverage;
- framework coverage;
- generated-source coverage;
- environment and platform coverage;
- required baseline readiness.

Any relevant inaccessible, failed, unsupported, or stale scope must remain
visible.

---

## 110. Coverage digest

A deterministic Python coverage digest should bind applicable:

- repository identity;
- source commit;
- Python profile;
- interpreter identity;
- environment identity;
- dependency-input digests;
- package identities;
- module coverage;
- entry-point coverage;
- framework adapter identities;
- configuration digests;
- dynamic-use records;
- analyzer identities;
- unresolved scopes;
- completion statuses.

Changing any required input must invalidate the digest.

---

## 111. Open-world handling

Python coverage must remain open-world.

Unknown scope may include:

- externally imported packages;
- externally invoked console scripts;
- plugin hosts;
- runtime-loaded modules;
- environment-specific configuration;
- framework autodiscovery;
- namespace-package members outside the repository;
- monkey patches;
- reflection;
- notebooks;
- generated clients.

Unknown relevant scope must prevent unsafe dead-code conclusions.

---

## 112. Classification profile

The initial Python classification profile should be versioned and narrow.

A supported private module-level function may become `candidate_dead` only when:

- the function shape is supported;
- repository and source identities are current;
- package and module identities are exact;
- required Python coverage is complete;
- required framework coverage is complete;
- no ordinary reference exists;
- no import, re-export, or entry-point evidence exposes the function;
- no decorator or registration evidence makes it live;
- no unresolved dynamic import may reference it;
- no unresolved reflection may reference it;
- no public-surface evidence exposes it;
- required analyzers succeeded;
- classification is deterministic.

A classification is not a human disposition.

---

## 113. Classification outcomes

Applicable outcomes may include:

- `live`;
- `candidate_dead`;
- `inconclusive`;
- `detection_only`;
- `unsupported`;
- `failed`;
- `stale`.

`Candidate_dead` must remain unavailable when any required dynamic or framework
scope is unresolved.

---

## 114. Classification explanation

A Python classification explanation should include:

- repository;
- source commit;
- Python profile;
- interpreter version;
- environment identity;
- package;
- module;
- target symbol;
- ordinary references;
- import and re-export evidence;
- entry-point evidence;
- decorator evidence;
- framework evidence;
- test evidence;
- configuration evidence;
- dynamic-import uncertainty;
- reflection uncertainty;
- public-surface evidence;
- coverage digest;
- policy version;
- resulting status;
- remediation-review eligibility.

The explanation must remain bounded and reproducible.

---

## 115. Detection-only outcome

Python support may remain detection-only when:

- inventory is functional;
- supporting unused-code evidence is available;
- coverage limitations are explicit;
- dynamic or framework behavior remains unresolved;
- classification remains conservative;
- no safe transformation exists;
- remediation capability is not claimed.

Detection-only support is a valid bounded capability.

---

## 116. Human disposition

Human disposition remains separate from machine classification.

A Python disposition should bind to:

- finding ID;
- repository;
- source commit;
- Python profile;
- interpreter identity;
- environment identity;
- package;
- module;
- symbol;
- classification identity;
- evidence digest;
- coverage digest;
- human actor;
- timestamp.

A relevant environment, source, framework, evidence, or coverage change may make
the disposition stale.

---

## 117. Remediation authorization

Remediation authorization should bind to:

- authorization ID;
- finding ID;
- repository identity;
- source commit;
- Python profile;
- interpreter identity;
- environment identity;
- package identity;
- module identity;
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

## 118. Exact finding reproduction

Before transformation, DCAv2 must reproduce:

- repository identity;
- source commit;
- Python profile;
- interpreter identity;
- dependency-input identities;
- environment identity;
- package identity;
- module identity;
- function identity;
- source occurrence;
- decorator state;
- export state;
- entry-point state;
- framework registration state;
- evidence digest;
- coverage digest;
- human disposition;
- remediation authorization.

Any mismatch must block transformation.

---

## 119. Reproduction failure

Reproduction must fail when applicable:

- source commit changed;
- module moved ambiguously;
- function changed;
- decorator added;
- entry point added;
- re-export added;
- route or task registration added;
- dynamic import appeared;
- reflection risk increased;
- environment changed;
- package layout changed;
- coverage became partial;
- evidence became stale;
- authorization expired;
- disposition became stale.

Approximate name matching must never proceed to transformation.

---

## 120. Baseline gates

Python baseline gates may include:

- dependency environment preparation;
- syntax compilation;
- import validation;
- type checking;
- lint;
- unit tests;
- integration tests;
- package build;
- distribution metadata build;
- framework validation;
- entry-point validation;
- generated-artifact validation;
- repository-status checks;
- secret checks.

The Python profile must identify required gates.

A required unavailable gate blocks remediation.

---

## 121. Syntax compilation

A baseline syntax gate may compile supported Python files without importing
application modules.

The command must record:

- interpreter;
- source roots;
- excluded roots;
- output behavior;
- bytecode policy;
- diagnostics;
- failure status.

Syntax compilation does not replace import, type, test, or framework gates.

---

## 122. Import validation

Import validation may execute module-level code.

It must run only in the untrusted runner.

The profile must define:

- modules imported;
- environment;
- network policy;
- credentials;
- side-effect controls;
- timeout;
- output limits;
- cleanup;
- failure mapping.

Import validation must not be used when side effects cannot be bounded safely.

---

## 123. Type-check gates

A supported type checker may be used as:

- baseline validation;
- post-change validation;
- reference-supporting evidence.

The gate must identify:

- tool;
- tool version;
- configuration;
- interpreter environment;
- source scope;
- plugin set;
- output schema;
- timeout;
- failure mapping.

Unavailable type checking must remain explicit.

---

## 124. Test gates

Test commands must identify:

- test framework;
- test roots;
- configuration;
- selected tests;
- plugins;
- fixtures;
- environment variables by name;
- synthetic services;
- database requirements;
- timeout;
- resource limits;
- network profile;
- cleanup.

A passing test subset must not be represented as the full repository test suite.

---

## 125. Framework gates

Framework-specific gates may include:

- application configuration validation;
- route enumeration;
- task registration validation;
- dependency-injection validation;
- migration consistency;
- package metadata validation;
- plugin discovery;
- startup checks.

Every gate must be adapter- and version-specific.

A development-only check must not prove production behavior unless the profile
states that equivalence.

---

## 126. Structured transformation

Python source modification must use a structured transformation capable of
preserving required syntax and formatting.

The transformation must bind to:

- transformation ID;
- transformation version;
- Python grammar version;
- concrete syntax tool;
- module identity;
- function identity;
- source occurrence;
- source digest;
- expected rewrite count;
- permitted files;
- coverage digest.

Plain text deletion must not be used when syntax ambiguity exists.

---

## 127. Initial transformation boundary

The initial transformation should support only a narrow module-level function
shape.

It should reject applicable:

- decorated functions;
- async functions unless separately supported;
- nested functions;
- overload declarations;
- singledispatch registration;
- dynamically assigned functions;
- generated source;
- framework-registered functions;
- entry-point functions;
- functions adjacent to unsupported syntax;
- semicolon-combined statements;
- ambiguous comments or formatting;
- functions participating in public exports.

Unsupported shapes must fail before modification.

---

## 128. Decorator preservation

A function with any unsupported decorator should not be removed.

When decorated-function removal is eventually supported, the transformation
must treat the decorator stack and function definition as one exact target.

It must not leave orphaned decorators or comments.

---

## 129. Comment preservation

The transformation strategy must define how to handle:

- leading comments;
- inline comments;
- trailing comments;
- blank lines;
- type comments;
- formatter directives;
- linter directives;
- region markers.

Ambiguous comment ownership should block automatic transformation.

A source-preserving tool must be preferred over destructive reformatting.

---

## 130. Import cleanup

Removing a Python function may make imports unused.

Import cleanup must be a separately versioned transformation behavior.

It should distinguish:

- ordinary imported symbols;
- side-effect imports;
- typing-only imports;
- wildcard imports;
- framework registrations;
- runtime annotation imports;
- re-export imports.

The initial function-removal transformation may leave unrelated import cleanup
to a separate authorized change.

---

## 131. `__all__` cleanup

Removing an exported name from `__all__` is a separate public-surface
transformation.

The initial private-function profile should reject targets listed in `__all__`.

Future support would require:

- exact `__all__` identity;
- static list resolution;
- public-consumer review;
- separate authorization;
- dedicated tests.

---

## 132. Entry-point cleanup

Removing a package entry point is not part of ordinary function deletion.

If the target is referenced by an entry point, it must be treated as live under
the supported profile.

Entry-point modification requires a separate transformation and authorization.

---

## 133. Generated metadata

Removing authored code may affect generated metadata such as:

- distribution metadata;
- route manifests;
- task registries;
- stub files;
- API schemas;
- documentation.

The profile must identify whether generated artifacts are:

- not required;
- regenerated during verification;
- committed and expected to change;
- unsupported.

Unexpected generated changes must cause failure.

---

## 134. Rewrite-count validation

The transformation must define an exact expected rewrite count.

The operation must fail when:

- no function is rewritten;
- more than one function is rewritten;
- a different function is selected;
- decorators or adjacent declarations are altered unexpectedly;
- unrelated formatting changes occur;
- unsupported syntax is encountered.

A successful tool exit does not satisfy rewrite validation.

---

## 135. Changed-file validation

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
- environment files;
- repository-relative paths;
- content hashes.

Any file outside the authorized set must cause failure.

---

## 136. Deterministic transformation

Equivalent authorized inputs should produce the same semantic patch.

Determinism tests should control:

- source commit;
- Python grammar version;
- transformation version;
- concrete syntax tool version;
- configuration;
- file ordering;
- locale;
- line endings;
- formatter behavior;
- random state;
- temporary paths.

The patch digest must exclude irrelevant environment variation.

---

## 137. Transformation idempotency

Reapplying the transformation to already transformed source must not remove
additional similarly named functions.

The second application should produce one documented result such as:

- no-op success;
- already-applied;
- exact target not found.

The behavior must be deterministic and tested.

---

## 138. Post-change gates

Post-change verification must rerun all required Python gates.

Applicable gates include:

- syntax compilation;
- import validation;
- type checking;
- lint;
- unit tests;
- integration tests;
- package build;
- entry-point validation;
- framework validation;
- generated-artifact validation;
- changed-file validation;
- patch determinism;
- secret scanning.

Every required gate must pass.

---

## 139. Baseline comparison

The workflow must compare baseline and post-change results.

The comparison should identify:

- newly introduced syntax errors;
- newly introduced import errors;
- changed type diagnostics;
- changed lint diagnostics;
- changed test results;
- changed package build output;
- changed entry-point metadata;
- changed framework registration;
- changed generated artifacts;
- unavailable gates;
- unchanged pre-existing failures.

A matching non-zero exit code is not sufficient proof of no regression.

---

## 140. Distribution build validation

For package profiles, a distribution build may verify:

- build backend compatibility;
- package inclusion;
- metadata generation;
- entry points;
- stubs;
- generated source;
- wheel or source-distribution creation.

Build artifacts must be bounded and treated as untrusted.

The publisher must not rebuild distributions.

---

## 141. Patch generation

After successful verification, DCAv2 may generate a deterministic patch.

The patch record should include:

- repository identity;
- base commit;
- Python profile;
- interpreter identity;
- environment identity;
- dependency-input digests;
- package identity;
- module identity;
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

## 142. Patch validation

Before publication eligibility, trusted validation must confirm:

- repository identity;
- base commit;
- Python profile;
- package and module identities;
- finding identity;
- human disposition;
- remediation authorization;
- evidence digest;
- coverage digest;
- patch format;
- patch hash;
- changed-file allowlist;
- no path traversal;
- no unexpected file mode;
- no unexpected symbolic link;
- no unsupported binary change;
- required gate results;
- no suspected secret leakage.

Any mismatch must block publication.

---

## 143. Trusted publication

When separately authorized, publication must continue through the trusted
publisher.

The publisher must validate:

- repository-access policy;
- prohibited-repository policy;
- exact base commit;
- finding identity;
- disposition identity;
- remediation authorization;
- Python profile;
- evidence and coverage digests;
- gate results;
- patch hash;
- changed files;
- branch policy;
- draft-only operation;
- idempotency identity.

The publisher must not execute Python, dependency installation, build backends,
imports, tests, frameworks, or repository scripts.

---

## 144. Database evolution

Phase 4 may persist concepts such as:

- Python repository profiles;
- interpreter identities;
- environment profiles;
- dependency-input identities;
- package identities;
- module identities;
- function and class identities;
- import graph edges;
- entry-point evidence;
- decorator evidence;
- framework evidence;
- dynamic-use records;
- Python coverage records;
- Python gate results;
- Python transformation records.

Persistence changes must use additive ordered migrations.

Historical TypeScript findings must remain interpretable.

---

## 145. Migration compatibility

Migration testing should include:

- fresh installation;
- upgrade from the Phase 3D schema;
- existing TypeScript records;
- Python package records;
- module and symbol identities;
- namespace-package records;
- entry-point records;
- dynamic-use records;
- framework adapter records;
- partial Python coverage;
- multiple tenants;
- migration failure;
- retry;
- projection rebuild;
- audit preservation.

Existing migrations must not be rewritten.

---

## 146. Audit requirements

Phase 4 should produce audit events for applicable:

- Python qualification requested;
- interpreter resolved;
- interpreter rejected;
- dependency profile selected;
- environment created;
- environment creation failed;
- package discovered;
- module discovered;
- package root rejected;
- import graph created;
- import resolution failed;
- entry point discovered;
- decorator registration discovered;
- framework adapter selected;
- dynamic import unresolved;
- reflection risk recorded;
- Python coverage completed;
- Python coverage partial;
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

## 147. Runner requirements

Python interpreters, installers, build backends, analyzers, imports, tests,
frameworks, and transformations must execute in an approved untrusted runner
profile.

The profile must enforce applicable:

- non-root execution;
- no privileged mode;
- no Docker socket;
- no trusted credentials;
- explicit environment allowlist;
- user-site isolation;
- controlled `PYTHONPATH`;
- repository-scoped mounts;
- approved cache mounts;
- index-only network during dependency installation;
- network-disabled analysis and gates where possible;
- CPU limits;
- memory limits;
- process limits;
- disk limits;
- output limits;
- timeouts;
- process-tree cleanup;
- workspace cleanup;
- virtual-environment cleanup.

Native extensions or source builds may require a stronger runner profile.

---

## 148. Network profiles

Phase 4 should use separate network profiles for applicable stages:

- provider read-only source acquisition;
- package-index-only dependency installation;
- private-index read-only installation;
- network-disabled parsing and static analysis;
- network-disabled type checking where possible;
- local-test-services-only integration testing;
- provider-publish-only trusted publication.

Python application startup must not receive unrestricted network access by
default.

---

## 149. Credential boundaries

Credential capabilities may include:

- provider read credential;
- public or private package-index read credential;
- synthetic test-service credential;
- controller database credential;
- trusted publisher credential.

The runner may receive only the minimum explicitly authorized capability needed
for a stage.

It must never receive:

- trusted publisher credentials;
- controller database credentials;
- unrelated cloud credentials;
- production application secrets;
- broad infrastructure credentials.

Repository configuration cannot authorize credentials.

---

## 150. Prompt-injection resistance

Instructions found in:

- Python source;
- docstrings;
- comments;
- package metadata;
- dependency configuration;
- framework configuration;
- test output;
- analyzer output;
- build output;
- generated artifacts;
- exception messages;
- package descriptions;

must remain untrusted data.

They must not:

- broaden repository scope;
- alter command definitions;
- choose credentials;
- broaden package-index access;
- change environment policy;
- exclude required modules;
- mark failed imports or tests as passed;
- create human disposition;
- authorize remediation;
- trigger publication;
- modify governance.

---

## 151. Secret handling

Python repositories may contain secret-bearing environment, package-index,
framework, and test configuration.

DCAv2 must prevent exposure through:

- environment variables;
- `.env` files;
- package-index configuration;
- dependency URLs;
- exception output;
- test output;
- build logs;
- generated metadata;
- source maps;
- patches;
- publication text;
- audit events;
- virtual environments;
- caches.

Synthetic credential canaries should validate redaction and cleanup.

---

## 152. Phase 4 test manifest

Phase 4 should receive a dedicated test manifest such as:

`codex/tests/phase-4-tests.yaml`

If introduced, the file must conform to:

`codex/tests/phase-test-manifest.schema.json`

The manifest must identify concrete required and conditional test IDs.

The phrase “run relevant tests” is insufficient.

---

## 153. Minimum qualification tests

Qualification tests should cover:

- supported Python package;
- supported application layout;
- missing Python metadata;
- unsupported Python version;
- conflicting version declarations;
- missing interpreter;
- host-global interpreter present;
- unsupported dependency profile;
- conflicting dependency managers;
- missing dependency inputs;
- namespace package;
- namespace spanning inaccessible roots;
- nested independent Python projects;
- generated-only source;
- prohibited repository identity;
- immutable revision failure.

Every result must map to an explicit qualification status.

---

## 154. Minimum environment tests

Environment tests should cover:

- isolated virtual environment creation;
- user-site disabled;
- controlled `PYTHONPATH`;
- host package unavailable;
- deterministic dependency installation;
- requirements mismatch;
- lockfile mismatch;
- public index access;
- private index unavailable;
- wrong credential scope;
- source-distribution build;
- build-hook failure;
- binary-extension installation;
- timeout;
- memory exhaustion;
- disk exhaustion;
- cleanup failure.

---

## 155. Minimum package and module tests

Inventory tests should cover:

- regular package;
- `src` layout;
- flat layout;
- namespace package;
- duplicate import names;
- module moved;
- standalone script;
- package entry module;
- test module;
- generated module;
- migration module;
- vendored module;
- stub file;
- malformed source;
- unsupported syntax;
- symbolic-link escape.

Package and module identity must remain deterministic.

---

## 156. Minimum function-identity tests

Function tests should cover:

- supported private module-level function;
- public module-level function;
- async function;
- decorated function;
- nested function;
- duplicate function names;
- same name in different modules;
- same name in different packages;
- function moved;
- function body changed;
- lambda assignment;
- overloaded typing pattern;
- generated function.

Only explicitly supported shapes may become remediation-eligible.

---

## 157. Minimum import tests

Import tests should cover:

- absolute import;
- relative import;
- alias import;
- imported symbol;
- module import;
- re-export;
- wildcard import with static `__all__`;
- wildcard import without `__all__`;
- dynamic `__all__`;
- conditional import;
- type-checking-only import;
- optional import;
- namespace-package import;
- unresolved import;
- host package shadowing attempt.

---

## 158. Minimum reference tests

Reference tests should cover:

- direct call;
- value reference;
- callback argument;
- return value;
- container membership;
- default argument;
- decorator argument;
- annotation reference;
- typing-only reference;
- test reference;
- attribute reference;
- comment-only occurrence;
- string-only occurrence;
- same name in another scope;
- analyzer failure;
- malformed analyzer output.

---

## 159. Minimum entry-point tests

Entry-point tests should cover:

- console script;
- GUI script;
- custom plugin group;
- module-only target;
- module-and-function target;
- missing target;
- malformed target;
- package moved;
- metadata changed after analysis;
- generated metadata mismatch;
- public plugin target;
- external host uncertainty.

A resolved entry-point target must be live.

---

## 160. Minimum decorator tests

Decorator tests should cover:

- supported resolved decorator;
- aliased decorator import;
- decorator stack;
- unsupported decorator;
- custom decorator;
- decorator factory;
- dynamic decorator expression;
- same decorator name from another package;
- decorator added after analysis;
- registration decorator;
- wrapper-only decorator;
- malformed decorator evidence.

Name-only matching must not establish registration.

---

## 161. Minimum dynamic-import tests

Dynamic-import tests should cover:

- static string import;
- statically resolved constant;
- concatenated string;
- configuration-derived string;
- environment-derived string;
- plugin entry-point loading;
- directory scanning;
- unresolved module name;
- missing module;
- dynamically imported symbol;
- dynamic import added after classification.

Unresolved required dynamic imports must reduce coverage.

---

## 162. Minimum reflection tests

Reflection tests should cover:

- resolved `getattr`;
- unresolved `getattr`;
- module dictionary access;
- globals access;
- string-based function lookup;
- serializer registry;
- monkey patch;
- class attribute mutation;
- test patching;
- comment-only symbol string;
- unrelated string match;
- reflection added after review.

Unresolved reflection must prevent unsafe remediation.

---

## 163. Minimum pytest tests

Pytest adapter tests should cover:

- fixture decorator;
- fixture referenced by parameter name;
- autouse fixture;
- session fixture;
- indirect parameterization;
- `conftest.py` fixture;
- plugin-provided fixture;
- pytest hook;
- missing fixture;
- duplicate fixture name;
- fixture string reference;
- unsupported plugin behavior.

A discovered fixture or hook must be treated according to the supported profile.

---

## 164. Minimum Flask and FastAPI tests

When those adapters are included, tests should cover applicable:

- direct route decorator;
- blueprint or router registration;
- included router;
- dependency function;
- middleware;
- startup or shutdown handler;
- dynamic route registration;
- application factory;
- route function with no direct calls;
- registration removed after analysis;
- unsupported plugin or extension.

Each adapter requires separate capability status.

---

## 165. Minimum Django tests

When a Django adapter is included, tests should cover applicable:

- installed application;
- URL configuration;
- function view;
- class-based view;
- management command;
- signal receiver;
- admin registration;
- middleware;
- migration module;
- application configuration;
- dynamic settings;
- unresolved dotted path;
- unsupported plugin behavior.

Django sub-capabilities must remain separate.

---

## 166. Minimum Celery tests

When a Celery adapter is included, tests should cover applicable:

- direct task decorator;
- shared task;
- application task;
- autodiscovered task;
- scheduled task;
- signal handler;
- custom task name;
- dynamic task registration;
- task with no direct calls;
- configuration-derived task;
- registration removed after review.

---

## 167. Minimum coverage tests

Python coverage tests should cover:

- complete supported repository;
- parse failure;
- unresolved import;
- wildcard import ambiguity;
- dynamic `__all__`;
- unresolved dynamic import;
- unresolved reflection;
- unsupported decorator;
- missing entry-point metadata;
- namespace package with inaccessible member;
- framework adapter failure;
- private index dependency unavailable;
- generated source unavailable;
- platform branch untested;
- stale environment;
- source commit changed.

Complete coverage must require all relevant dimensions.

---

## 168. Minimum classification tests

Classification tests should verify:

- supported private function with complete absence evidence;
- direct call makes function live;
- imported value makes function live;
- re-export makes function public;
- console entry point makes function live;
- route decorator makes function live;
- task decorator makes function live;
- pytest fixture makes function live;
- unresolved dynamic import produces inconclusive;
- unresolved reflection produces inconclusive;
- unsupported decorator produces unsupported or inconclusive;
- failed analyzer does not produce zero-reference certainty;
- stale environment produces stale result;
- positive evidence dominance;
- input-order independence.

---

## 169. Minimum disposition tests

Disposition tests should cover:

- `confirmed_dead`;
- `confirmed_live`;
- `needs_investigation`;
- stale classification rejection;
- wrong package rejection;
- wrong module rejection;
- wrong symbol rejection;
- revocation;
- supersession;
- history preservation;
- prevention of automatic remediation authority.

---

## 170. Minimum remediation-authorization tests

Authorization tests should cover:

- exact valid authorization;
- missing authorization;
- expired authorization;
- revoked authorization;
- wrong repository;
- wrong commit;
- wrong Python profile;
- wrong environment identity;
- wrong package;
- wrong module;
- wrong function;
- wrong evidence digest;
- wrong coverage digest;
- wrong transformation;
- changed-file scope mismatch;
- stale disposition;
- reuse after completion.

Every mismatch must deny remediation.

---

## 171. Minimum reproduction tests

Reproduction tests should cover:

- exact function reproduced;
- same name in another module;
- same name in another package;
- function moved;
- decorator added;
- export added;
- entry point added;
- route registration added;
- dynamic import added;
- reflection added;
- dependency environment changed;
- package root changed;
- coverage reduced;
- analyzer failed;
- authorization expired.

Approximate reproduction must never proceed.

---

## 172. Minimum baseline tests

Baseline tests should cover:

- syntax compilation succeeds;
- import validation succeeds where required;
- type checking succeeds;
- lint succeeds;
- unit tests succeed;
- integration tests succeed;
- package build succeeds;
- entry-point validation succeeds;
- framework validation succeeds;
- dependency environment unavailable;
- import side effect fails;
- type checker unavailable;
- required test unavailable;
- timeout;
- resource exhaustion;
- malformed result;
- cleanup failure.

---

## 173. Minimum transformation tests

Transformation tests should cover:

- exact supported private function removal;
- zero rewrites;
- several rewrites;
- same name in another module;
- decorated function;
- async function;
- nested function;
- semicolon-combined statement;
- leading comments;
- trailing comments;
- formatter directive;
- unsupported syntax;
- generated source;
- unexpected import cleanup;
- unauthorized file change;
- deterministic patch;
- idempotent second application.

---

## 174. Minimum post-change tests

Post-change tests should verify:

- syntax compilation succeeds;
- required imports succeed;
- type checking succeeds;
- lint succeeds;
- unit tests pass;
- integration tests pass;
- package build passes;
- entry points remain valid;
- framework registrations remain valid;
- generated metadata is consistent;
- no new diagnostic appears;
- changed files remain authorized;
- patch is deterministic;
- secret scan detects no synthetic canary leakage;
- cleanup completes.

---

## 175. Minimum publisher tests

Publisher tests should cover:

- exact Python profile;
- wrong interpreter identity;
- wrong environment identity;
- stale dependency-input digest;
- stale evidence digest;
- stale coverage digest;
- missing required Python gate;
- unexpected manifest change;
- unexpected lockfile change;
- unexpected generated-file change;
- wrong patch hash;
- default-branch rejection;
- draft pull-request creation;
- idempotent retry;
- provider partial state;
- Git-hook suppression;
- publisher inability to execute Python or import repository modules.

Live provider tests require separate authorization.

---

## 176. Minimum migration tests

Migration tests should cover:

- fresh database;
- upgrade from Phase 3D;
- existing TypeScript records;
- Python repository profiles;
- interpreter identities;
- environment identities;
- package and module records;
- namespace-package records;
- entry-point evidence;
- framework evidence;
- dynamic-use records;
- partial Python coverage;
- multiple tenants;
- failed migration;
- retry;
- projection rebuild;
- audit preservation.

---

## 177. Minimum security tests

Security tests should cover:

- repository cannot select an arbitrary interpreter;
- user-site packages are unavailable;
- `PYTHONPATH` cannot escape the workspace;
- build backend cannot access publisher credentials;
- imported application code cannot access controller credentials;
- dependency installer cannot reach unauthorized indexes;
- private-index credentials are scoped;
- Docker socket is unavailable;
- cloud metadata is unavailable;
- native extension execution remains isolated;
- output is bounded;
- process limits apply to test workers;
- background processes are terminated;
- virtual environment cleanup succeeds;
- package cache does not cross tenant boundaries.

---

## 178. Fixture strategy

Phase 4 should use fixtures representing:

- local package with no dependencies;
- `src` layout package;
- flat-layout application;
- namespace package;
- requirements-based project;
- pyproject-based project;
- locked dependency project;
- private-index requirement;
- console entry point;
- plugin entry point;
- pytest fixture;
- Flask route;
- FastAPI route;
- Django sub-capability when selected;
- Celery task when selected;
- dynamic import;
- unresolved reflection;
- monkey patch;
- generated source;
- malicious build backend;
- alternate repository, package, module, and function names.

Production behavior must not contain fixture-specific branches.

---

## 179. Framework rollout strategy

Python framework support should be added incrementally.

A recommended sequence is:

1. Python parsing and module inventory.
2. Import graph and ordinary references.
3. Package entry points.
4. Pytest fixture and hook evidence.
5. One explicit route-decorator profile.
6. One task-registration profile.
7. Selected Django sub-capabilities.
8. Configuration dotted-path evidence.
9. Detection-only dynamic and reflection profiles.
10. Narrow private-function remediation.

Each step requires its own capability and test evidence.

---

## 180. Scale boundary

Phase 4 establishes bounded functional Python support.

The phase report must state tested limits such as:

- package count;
- module count;
- function count;
- import-edge count;
- entry-point count;
- decorator count;
- framework registration count;
- dependency count;
- environment creation duration;
- analysis duration;
- test duration;
- peak memory;
- disk and cache use;
- output size.

Phase 4 must not claim enterprise-scale Python validation.

Broader scale validation belongs to Phase 10.

---

## 181. Python inventory acceptance criteria

Python inventory may become `functional` only when:

1. Supported interpreter resolution is deterministic.
2. Host-global fallback is prevented.
3. Supported package layouts are explicit.
4. Package identity is deterministic.
5. Module identity is deterministic.
6. Namespace-package behavior is bounded.
7. Supported source kinds are distinguished.
8. Parsing failures remain visible.
9. Function and class identities preserve source occurrence.
10. Generalization beyond one fixture is demonstrated.
11. Required security, migration, and phase tests pass.

---

## 182. Python evidence acceptance criteria

Python evidence may become `functional` only when:

1. Import resolution uses the approved environment.
2. Host packages cannot affect results silently.
3. Ordinary references preserve exact source occurrence.
4. Wildcard and re-export behavior is explicit.
5. Entry-point evidence is implemented.
6. Decorator evidence is semantic rather than name-only.
7. Dynamic imports reduce coverage appropriately.
8. Reflection reduces coverage appropriately.
9. Framework adapters have independent statuses.
10. Tool failures remain explicit.
11. Evidence freshness is enforced.
12. Positive liveness evidence dominates absence evidence.
13. Required tests pass.

---

## 183. Python classification acceptance criteria

A Python classification profile may become `functional` only when:

1. Supported symbol shape is explicit.
2. Required coverage dimensions are explicit.
3. Required coverage can become complete.
4. Public-surface behavior is represented.
5. Entry-point behavior is represented.
6. Decorator and registration behavior is represented.
7. Dynamic-import uncertainty is represented.
8. Reflection uncertainty is represented.
9. Framework uncertainty is represented.
10. Analyzer failures cannot become zero-reference certainty.
11. Classification is deterministic.
12. Explanations are reproducible.
13. Required positive, negative, failure, and hostile tests pass.

---

## 184. Python remediation acceptance criteria

Python private-function remediation may become `functional` only when:

1. The repository profile is supported.
2. The interpreter and environment identities are current.
3. The exact function shape is supported.
4. Required Python and framework coverage is complete.
5. Human disposition is current.
6. Separate remediation authorization is current.
7. Exact finding reproduction succeeds.
8. Required baseline gates pass.
9. Structured transformation is deterministic.
10. Comment and syntax preservation are tested.
11. Rewrite count is exact.
12. Changed files are within authorization.
13. Required post-change gates pass.
14. Generated metadata remains consistent.
15. Patch generation is deterministic.
16. Required runner controls pass.
17. Required migration and phase tests pass.

---

## 185. Partially supported outcome

A Python capability may remain `partially_supported` when, for example:

- one package layout is supported but another is not;
- ordinary imports are supported but namespace packages are incomplete;
- public-index dependencies are supported but private indexes are not;
- pure-Python dependencies are supported but native extensions are not;
- package entry points are supported but plugin-host behavior is unknown;
- Flask routes are supported but Django behavior is not;
- detection is supported but remediation is not;
- Linux is supported but another required platform is not.

The exact unsupported dimensions must remain explicit.

---

## 186. Blocked outcome

Phase 4 must remain blocked when applicable:

- Python identity is ambiguous;
- supported interpreter cannot be resolved;
- host-global contamination cannot be prevented;
- dependency inputs conflict;
- required dependency installation cannot be performed safely;
- required build hooks cannot run safely;
- package roots are ambiguous;
- namespace-package scope is incomplete;
- import resolution is incomplete;
- required entry-point metadata is unavailable;
- dynamic import may expose the target;
- reflection may expose the target;
- required framework adapter is unavailable;
- required framework adapter licensing is unresolved;
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

## 187. Phase completion criteria

Phase 4 may be reported complete only when all applicable criteria are
satisfied:

1. Python qualification is implemented for the authorized profiles.
2. Interpreter resolution is deterministic.
3. Host-global fallback is prevented.
4. Environment isolation is implemented.
5. Dependency profiles are explicit.
6. Package-index access is bounded.
7. Package-root discovery is implemented.
8. Package and module identities are deterministic.
9. Namespace-package behavior is explicit.
10. Function and class inventory is implemented.
11. Import graph construction is implemented.
12. Ordinary reference evidence is implemented.
13. Wildcard and re-export behavior is explicit.
14. Package entry-point evidence is implemented.
15. Decorator evidence is implemented for supported profiles.
16. Dynamic-import uncertainty is represented.
17. Reflection uncertainty is represented.
18. Framework adapters are versioned.
19. Every framework adapter has an explicit capability status.
20. Python coverage is implemented.
21. Partial Python coverage preserves uncertainty.
22. Classification is deterministic and conservative.
23. Human disposition remains separate.
24. Remediation authorization remains separate.
25. Exact finding reproduction includes Python environment identities.
26. Structured transformation is narrowly scoped.
27. Unauthorized manifest, lockfile, configuration, and generated-file changes
    are rejected.
28. Required baseline gates pass.
29. Required post-change gates pass.
30. Required database migrations pass.
31. Required security controls pass.
32. Required Phase 4 tests pass.
33. Triggered conditional tests pass.
34. Capability statuses are updated truthfully.
35. Security-control matrix is updated.
36. Phase report is complete.
37. Execution state is updated.
38. No unresolved blocker contradicts completion.

---

## 188. Phase report

The Phase 4 completion report should include:

- authorization identity;
- objective;
- source commit before and after;
- files changed;
- migrations;
- dependencies;
- supported Python versions;
- interpreter identities;
- environment profiles;
- dependency profiles;
- package-index behavior;
- package layouts;
- namespace-package support;
- module and symbol inventories;
- import behavior;
- reference evidence;
- entry-point evidence;
- decorator evidence;
- dynamic-import behavior;
- reflection behavior;
- framework profiles;
- framework adapter identities;
- Python coverage;
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

The report must not describe bounded Python support as universal Python or
polyglot support.

---

## 189. Execution-state handoff

The Phase 4 handoff should identify:

- phase status;
- authorization status;
- source commit;
- worktree state;
- supported Python versions;
- supported repository profiles;
- supported dependency profiles;
- supported package layouts;
- namespace-package status;
- supported framework adapters;
- detection-only capabilities;
- remediation-supported shapes;
- unsupported dynamic behavior;
- test manifest;
- test results;
- security-control results;
- migrations;
- external operations;
- retained external state;
- cleanup state;
- next human decision.

The handoff must not authorize Phase 5.

---

## 190. Transition to Phase 5

Phase 5 may be proposed when Python capability boundaries are explicit and an
additional language can be selected through a documented evidence-based
evaluation.

Before Phase 5 begins:

1. Finalize the Phase 4 report.
2. Update execution state.
3. Stop Phase 4 implementation.
4. Present actual Python capability statuses.
5. Record unsupported language demand and constraints.
6. Prepare a Phase 5 authorization.
7. Obtain explicit human approval.

Phase 5 must not start automatically.

---

## 191. Phase stop conditions

Work must stop when:

- Phase 4 authorization is inactive;
- authorization expires;
- authorization is revoked;
- repository, package, or module scope is exceeded;
- a prohibited repository is encountered;
- repository identity cannot be verified;
- immutable source resolution fails;
- Python version cannot be resolved safely;
- environment isolation fails;
- required package-index access is unauthorized;
- required credential capability is unavailable;
- required dependency installation cannot run safely;
- required native or build-hook execution exceeds the approved threat model;
- package identity is ambiguous;
- import resolution cannot be established;
- namespace-package coverage is incomplete;
- required dynamic or framework scope is unresolved;
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

## 192. Fail-safe behavior

When Python identity, environment, dependency state, package layout, import
resolution, entry points, decorators, dynamic imports, reflection, framework
behavior, evidence, coverage, baseline state, transformation, verification, or
publication state cannot be established confidently:

- do not report full Python support;
- do not use host-global Python state;
- do not guess package roots;
- do not treat unresolved imports as no references;
- do not treat unsupported decorators as inert;
- do not treat unresolved dynamic imports as absent;
- do not treat unresolved reflection as absent;
- do not create human disposition automatically;
- do not infer remediation authorization;
- do not modify source;
- do not modify manifests, lockfiles, configuration, or generated files;
- do not generate a publication-eligible patch;
- do not publish;
- preserve available evidence;
- return an explicit partial, detection-only, unsupported, failed, stale,
  configuration-required, or blocked result;
- identify the exact missing requirement.

Python uncertainty must reduce classification, remediation, and publication
authority.

---

## 193. Document integrity

This roadmap file must not be modified during Phase 4 implementation unless
roadmap or governance modification is explicitly authorized.

Changes require:

1. Identification of the Phase 4 planning problem.
2. Review against the roadmap overview.
3. Review against permanent safety invariants.
4. Review of interpreter, environment, and dependency implications.
5. Review of package, import, entry-point, and dynamic-use implications.
6. Review of framework-adapter and coverage implications.
7. Review of remediation and publication implications.
8. Review of authorization and testing impact.
9. Updated Phase 4 test manifest where applicable.
10. Updated schemas or capability definitions where applicable.
11. A reviewable governance commit.
12. An ADR when the change alters long-lived Python environment, dependency,
    import-resolution, framework-adapter, transformation, or remediation
    semantics.

This roadmap must not be weakened to make unresolved imports, unknown dynamic
behavior, incomplete framework coverage, unsafe environments, failed gates,
failed tests, or unauthorized Python changes appear acceptable.