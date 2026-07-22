# Phase 2 — Qualification and Configuration

This document defines the planned scope, capability boundaries, evidence
requirements, tests, stop conditions, and completion criteria for Phase 2 of
DCAv2.

Phase 2 makes repository readiness explicit before analysis, classification,
remediation, or publication.

It establishes deterministic qualification and configuration behavior for
supported repository profiles.

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
  id: phase-2-qualification-and-configuration
  name: Qualification and Configuration
  roadmap_order: 2
  default_status: inactive
  implementation_authorized_by_this_file: false
```

The phase becomes active only when the current authorization record explicitly
identifies `phase-2-qualification-and-configuration` as active.

---

## 2. Primary objective

The primary objective is to determine, before analysis begins:

- what repository was requested;
- which immutable source revision is being evaluated;
- which languages and repository structures are present;
- which package managers and build systems are present;
- which source, test, generated, and excluded roots apply;
- which tools and versions are required;
- which commands are available and permitted;
- which configuration is required;
- which baseline gates are available;
- which capabilities can run safely;
- which capabilities must remain unavailable or unsupported.

Qualification must produce a structured, evidence-backed readiness result.

---

## 3. Intended capability

The intended capability is conceptually:

```text
Evaluate an authorized repository and immutable source revision, determine
whether a specified DCAv2 workflow can run safely and reproducibly, and explain
all missing, unsupported, limited, or failing prerequisites.
```

Qualification must occur before:

- authoritative evidence collection;
- complete-coverage claims;
- dead-code classification;
- remediation authorization;
- source transformation;
- trusted publication.

Qualification success does not itself authorize any later operation.

---

## 4. Phase prerequisites

Phase 2 should not begin until Phase 1 has established or clearly bounded:

- repository identity handling;
- immutable source acquisition;
- structured command execution;
- runner tool resolution;
- TypeScript single-package behavior;
- evidence and coverage semantics;
- baseline gate behavior;
- capability reporting;
- migration practices;
- security-control reporting.

Unresolved Phase 1 limitations may remain, but Phase 2 must not conceal them.

A prerequisite that materially prevents safe qualification must be recorded as a
blocker.

---

## 5. Non-goals

Phase 2 does not, by default, include:

- broad monorepo analysis;
- pnpm implementation;
- Yarn implementation;
- framework-specific dead-code rules;
- Python analysis;
- additional-language analysis;
- cross-repository analysis;
- microservice contract analysis;
- runtime telemetry;
- organization-wide campaigns;
- source remediation;
- draft pull-request publication;
- production infrastructure changes;
- destructive database operations;
- automatic repository configuration changes;
- automatic execution of discovered repository commands;
- automatic approval of unsupported tools;
- universal build-system support.

Phase 2 may detect these repository characteristics without claiming support for
them.

---

## 6. Authorization prerequisites

The active Phase 2 authorization must identify applicable:

- local repository scope;
- external repository scope;
- immutable revisions;
- permitted source reads;
- permitted configuration reads;
- permitted source modifications;
- permitted configuration modifications;
- permitted dependency changes;
- permitted runner-image changes;
- permitted command-registry changes;
- permitted migrations;
- permitted database operations;
- permitted network access;
- permitted package-registry access;
- permitted credentials;
- permitted test environments;
- permitted external operations;
- required tests;
- stop conditions;
- expiration or completion boundary.

Any permission not explicitly granted must be treated as denied.

---

## 7. Required phase outputs

Phase 2 should produce applicable:

- qualification request schema;
- qualification result schema;
- repository-profile definitions;
- configuration model;
- configuration-precedence rules;
- configuration-validation rules;
- language-detection results;
- package-manager-detection results;
- workspace-detection results;
- source-root and test-root discovery;
- generated-root discovery;
- build-system discovery;
- toolchain requirement discovery;
- approved command mappings;
- baseline-state results;
- capability routing decisions;
- qualification digests;
- additive database migrations;
- audit events;
- tests;
- capability-matrix updates;
- phase-completion report;
- updated execution state.

---

## 8. Capability identifiers

Phase 2 should define or update capability identifiers such as:

```text
repository.identity.validate.v1
repository.revision.resolve.v1
repository.profile.qualify.v1
repository.language.detect.v1
repository.package-manager.detect.v1
repository.workspace.detect.v1
repository.source-roots.discover.v1
repository.test-roots.discover.v1
repository.generated-roots.discover.v1
repository.build-system.detect.v1
repository.toolchain.requirements.v1
repository.commands.discover.v1
repository.configuration.validate.v1
repository.baseline.evaluate.v1
repository.capability-route.v1
```

The final identifiers may differ if the capability schema requires another
naming convention.

Every identifier must remain narrow, versioned, and testable.

---

## 9. Qualification request

A qualification request should bind to:

- request ID;
- tenant;
- active phase authorization;
- provider;
- account or installation;
- repository identity;
- requested revision;
- requested capability IDs;
- requested repository profile;
- permitted configuration sources;
- permitted network profile;
- permitted credential capabilities;
- requested baseline gates;
- request time;
- request digest.

A qualification request must not contain secret values.

---

## 10. Qualification result

A qualification result should identify:

- request ID;
- repository identity;
- resolved source commit;
- repository profile;
- detected languages;
- detected package managers;
- detected workspaces;
- detected build systems;
- discovered roots;
- required tools;
- resolved tools;
- configuration status;
- command mappings;
- baseline status;
- supported capabilities;
- limited capabilities;
- unsupported capabilities;
- blockers;
- warnings;
- evidence references;
- qualification digest;
- result status;
- result time.

The result must remain attributable to the exact source revision and
configuration.

---

## 11. Qualification statuses

Qualification must use explicit statuses such as:

- `ready`;
- `ready_with_limited_gates`;
- `configuration_required`;
- `baseline_broken`;
- `unsupported`;
- `inaccessible`;
- `failed`;
- `stale`;
- `security_blocked`;
- `authorization_rejected`.

Only `ready` may indicate that all required qualification prerequisites for the
requested workflow are satisfied.

---

## 12. `ready`

A result is `ready` only when:

- repository access is authorized;
- repository identity is verified;
- immutable source resolution succeeds;
- the requested repository profile is supported;
- required languages are supported;
- required package-manager behavior is supported;
- required source and test scopes are discovered;
- required tools are available;
- required configuration is valid;
- required command mappings exist;
- required baseline gates are available;
- required security controls are enforced;
- no blocker prevents the requested capability.

`Ready` does not authorize analysis, remediation, or publication.

---

## 13. `ready_with_limited_gates`

A result may be `ready_with_limited_gates` when:

- qualification succeeds;
- some optional or non-remediation gate is unavailable;
- the affected capability remains explicitly limited;
- required detection behavior can still run safely;
- coverage and remediation implications are recorded.

The result must identify:

- unavailable gates;
- reason;
- affected capabilities;
- whether detection-only analysis is permitted;
- whether classification is limited;
- whether remediation is prohibited.

A required remediation gate cannot be treated as optional merely to produce this
status.

---

## 14. `configuration_required`

A result is `configuration_required` when the repository may be supportable but
trusted configuration is missing, ambiguous, or incomplete.

Examples include:

- source roots cannot be selected safely;
- more than one TypeScript project is present;
- no approved baseline command mapping exists;
- generated roots are ambiguous;
- private registry identity is missing;
- multiple lockfiles conflict;
- the requested capability profile is unspecified;
- repository commands cannot be mapped safely.

The result must identify the exact configuration fields required.

---

## 15. `baseline_broken`

A result is `baseline_broken` when the repository is otherwise qualified but one
or more required baseline commands fail against the unchanged source.

The result must identify:

- failing gates;
- command IDs;
- failure categories;
- bounded diagnostics;
- whether failures appear pre-existing;
- whether detection-only analysis remains possible;
- whether remediation is blocked.

A broken baseline must not be reported as ready for remediation.

---

## 16. `unsupported`

A result is `unsupported` when the requested repository shape or capability is
outside implemented support.

Examples include:

- unsupported package manager;
- unsupported workspace layout;
- unsupported language version;
- unsupported build system;
- unresolved executable configuration;
- unsupported generated-source model;
- unsupported platform;
- unsupported framework convention required by the finding profile.

Unsupported must remain distinct from failed.

---

## 17. `inaccessible`

A result is `inaccessible` when authorized source or required metadata cannot be
retrieved.

Possible causes include:

- repository does not exist;
- credential lacks required read capability;
- requested commit is unavailable;
- network destination is unavailable;
- provider denied access;
- private dependency registry is inaccessible.

The result must not imply that the repository contains no relevant source.

---

## 18. `failed`

A result is `failed` when qualification execution encountered an internal or
tool failure.

Examples include:

- qualification adapter crash;
- malformed tool output;
- timeout;
- resource exhaustion;
- database persistence failure;
- invalid result schema;
- cleanup failure affecting integrity.

A failed result must not be converted into unsupported or empty success.

---

## 19. `stale`

A qualification result becomes `stale` when applicable:

- source commit changes;
- configuration changes;
- repository profile changes;
- command definitions change;
- tool versions change;
- package-manager version changes;
- runner profile changes;
- capability requirements change;
- security-control status changes;
- qualification canonicalization changes.

A stale result must not satisfy later workflow prerequisites.

---

## 20. Repository identity validation

Qualification must begin with canonical repository identity validation.

The validation should bind:

- provider;
- account or installation;
- provider repository ID when available;
- owner;
- repository name;
- canonical full name;
- requested operation;
- requested revision.

Local directory names, display names, and remote aliases must not replace
canonical provider identity.

---

## 21. Prohibited-repository enforcement

The prohibited-repository policy must be evaluated before content retrieval.

A denied repository must not proceed to:

- metadata expansion beyond minimum identity validation;
- clone;
- fetch;
- source inspection;
- configuration inspection;
- qualification;
- analysis;
- remediation;
- publication.

The denial record must contain only the minimum identity and policy information
required for audit.

---

## 22. Immutable revision resolution

Qualification must bind to an immutable source revision.

The resolution record should identify:

- requested revision;
- resolved commit;
- provider response identity;
- resolution time;
- acquisition status;
- source snapshot ID.

Mutable branch or tag names may be accepted as input only when they are resolved
to an immutable commit before qualification continues.

---

## 23. Source acquisition boundary

Qualification must distinguish:

- provider metadata retrieval;
- Git object acquisition;
- source checkout;
- dependency installation;
- repository command execution.

Each stage requires its own authorized command, network profile, and credential
capability.

Read authorization for source acquisition does not authorize dependency
installation or command execution.

---

## 24. Repository profile

A repository profile defines a supported combination of characteristics.

A profile may include:

- language;
- language version;
- package manager;
- package-manager version;
- repository shape;
- workspace mode;
- build system;
- compiler;
- test framework;
- source-root rules;
- generated-root rules;
- command requirements;
- baseline gates;
- runner profile;
- network requirements;
- known unsupported behavior.

Profiles must be versioned.

---

## 25. Initial repository profiles

Phase 2 should initially preserve the narrow Phase 1 profile, such as:

```text
Single Git repository
Single npm package
Supported TypeScript version
Supported package-lock format
Discoverable TypeScript configuration
No npm workspaces
No required cross-repository consumers
No unsupported framework registration
Required baseline gates available
```

Phase 2 may detect additional profiles without claiming them as ready.

---

## 26. Profile matching

Profile matching must be deterministic.

The matcher should identify:

- exact matched profile;
- unmatched required characteristics;
- ambiguous characteristics;
- conflicting indicators;
- unsupported characteristics;
- profile version.

A repository must not be forced into the closest profile when material
differences exist.

Ambiguous profile selection should produce `configuration_required` or
`unsupported`.

---

## 27. Language detection

Language detection should use attributable signals such as:

- file extensions;
- language configuration;
- compiler configuration;
- package metadata;
- source-root contents;
- generated metadata;
- semantic-index configuration.

Detection must distinguish:

- primary language;
- additional languages;
- generated languages;
- configuration-only languages;
- unsupported languages;
- ambiguous files.

A file-extension count alone must not determine full language support.

---

## 28. Language-version detection

Where capability depends on language version, qualification should identify:

- declared version;
- lockfile-resolved version;
- installed version;
- executable version;
- supported range;
- conflicts among versions.

An unresolved or conflicting required version must produce
`configuration_required`, `unsupported`, or `failed` as appropriate.

Host-global versions must not silently replace project-declared versions.

---

## 29. Package-manager detection

Package-manager detection should use applicable:

- lockfiles;
- manifest metadata;
- package-manager declaration fields;
- workspace files;
- package-manager configuration;
- repository documentation as non-authoritative supporting evidence.

The result should identify:

- package manager;
- declared version;
- resolved version;
- lockfile type;
- lockfile version;
- confidence;
- conflicts;
- support status.

---

## 30. Conflicting package-manager indicators

Qualification must handle repositories containing conflicting indicators.

Examples include:

- multiple lockfile types;
- manifest declares one package manager while another lockfile exists;
- nested package managers;
- stale lockfiles;
- generated lockfiles;
- migration remnants.

The result must not select one silently.

Conflicts should produce:

- `configuration_required`;
- `unsupported`;
- or a profile-specific explicit selection backed by trusted configuration.

---

## 31. Workspace detection

Workspace detection should identify:

- whether workspaces exist;
- workspace mechanism;
- workspace roots;
- nested workspaces;
- package count;
- package identities;
- unsupported workspace files;
- ambiguous workspace boundaries.

Phase 2 may detect npm, pnpm, and Yarn workspace indicators.

Only implemented profiles may become ready.

---

## 32. Single-package validation

A repository classified as single-package should be verified to have no relevant
supported workspace structure.

Validation should consider:

- root workspace fields;
- workspace configuration files;
- nested package manifests;
- build-system project files;
- TypeScript project references;
- generated package roots.

The presence of nested examples or fixtures should not automatically create a
workspace when the profile excludes them explicitly.

---

## 33. Source-root discovery

Source-root discovery must produce normalized repository-relative paths.

Signals may include:

- TypeScript configuration;
- package manifest;
- build configuration;
- conventional directories;
- trusted DCAv2 configuration;
- semantic project structure.

Every discovered root should identify:

- path;
- discovery method;
- profile rule;
- inclusion status;
- confidence;
- symlink status;
- relevant language;
- whether the root is required.

---

## 34. Test-root discovery

Test-root discovery should identify:

- unit-test roots;
- integration-test roots;
- fixture roots;
- end-to-end test roots;
- test configuration;
- colocated tests;
- generated tests.

Test roots may contribute liveness evidence.

They must not be excluded merely because they are not production source.

The applicable classification profile must define how test references affect
liveness.

---

## 35. Generated-root discovery

Generated-root discovery should use applicable:

- directory conventions;
- configuration;
- generated-file headers;
- build output settings;
- source-map metadata;
- package-manager output directories;
- code-generation manifests.

The result must distinguish:

- generated source consumed by the build;
- generated artifacts;
- vendored source;
- cached dependencies;
- unknown generated status.

Generated code must not be remediated unless a later capability explicitly
supports it.

---

## 36. Excluded roots

An excluded root must have:

- repository-relative path;
- exclusion reason;
- authorizing profile or configuration;
- evidence that the exclusion is safe for the requested capability;
- coverage impact.

Exclusions must not be used to hide:

- failed analysis;
- inaccessible source;
- unsupported language;
- relevant consumer code;
- generated code whose output is authoritative;
- tests that provide liveness evidence.

An exclusion that may contain relevant evidence must reduce coverage.

---

## 37. Symbolic-link handling

Root discovery must validate symbolic links.

Qualification must reject or explicitly constrain links that:

- escape the source snapshot;
- point to unrelated repositories;
- point to host paths;
- point to credentials;
- create root cycles;
- cross tenant boundaries;
- bypass exclusion rules.

The resolved target must be considered.

Textual path validation alone is insufficient.

---

## 38. Build-system detection

Build-system detection may use:

- package scripts;
- build configuration;
- compiler configuration;
- task-runner configuration;
- project files;
- CI configuration as supporting evidence;
- trusted DCAv2 configuration.

The result should identify:

- build system;
- version when available;
- build targets;
- execution requirements;
- network requirements;
- generated outputs;
- support status.

Detected build commands remain untrusted observations until mapped to approved
structured commands.

---

## 39. Test-framework detection

Qualification should identify applicable test frameworks and configurations.

The result may include:

- framework;
- version;
- configuration path;
- test roots;
- script name;
- required services;
- database requirements;
- network requirements;
- support status.

Detection does not authorize execution.

A repository-defined test command must run only through an approved runner
command definition.

---

## 40. Lint and validation tooling

Qualification may identify:

- linters;
- formatters;
- static analyzers;
- schema validators;
- generated-artifact checks;
- custom validation scripts.

Each tool should receive:

- detected identity;
- version;
- configuration;
- command observation;
- support status;
- required or optional gate status.

A formatter must not be made a required remediation gate automatically unless
the repository profile or trusted configuration requires it.

---

## 41. Toolchain requirements

A qualification profile must define its required toolchain.

Applicable requirements include:

- Node.js;
- npm;
- TypeScript;
- compiler executables;
- test runner;
- build tool;
- Git;
- database client;
- container runtime outside the runner;
- analyzer tools;
- transformation tools.

For every required tool, qualification should record:

- required version range;
- resolution method;
- resolved version;
- executable identity;
- support status;
- missing-tool behavior.

---

## 42. Project-local tool preference

Project-local tools should be preferred where repository semantics depend on the
project's declared version.

Qualification must validate:

- package installation status;
- package identity;
- resolved executable;
- version;
- working directory;
- package-manager mechanism;
- no host-global fallback.

A project-local tool is still untrusted when its installation or execution is
repository-controlled.

It must run inside the approved runner.

---

## 43. Runner-image tools

Tools supplied by the runner image should be:

- approved;
- versioned;
- associated with the image digest;
- listed in the tool inventory;
- validated before use;
- compatible with the requested profile.

A runner-image tool must not override a required project-specific version
silently.

Version-selection policy must be explicit.

---

## 44. Tool availability statuses

Tool resolution should use statuses such as:

- `available`;
- `available_with_version_mismatch`;
- `missing`;
- `unsupported_version`;
- `installation_required`;
- `installation_failed`;
- `ambiguous`;
- `security_blocked`;
- `unverified`.

Only an acceptable `available` result may satisfy a required tool dependency.

---

## 45. Configuration sources

Qualification may use configuration from:

- permanent DCAv2 policy;
- tenant configuration;
- repository-access policy;
- phase authorization;
- repository profile;
- trusted operator-provided repository configuration;
- repository-contained declarative configuration;
- detected repository metadata;
- command observations.

Sources must remain distinguishable.

Repository-contained configuration cannot override higher-precedence policy.

---

## 46. Configuration precedence

Configuration precedence should follow trusted authority.

A conceptual order is:

1. Permanent safety policy.
2. Prohibited-repository policy.
3. Current phase authorization.
4. Tenant and account security policy.
5. Versioned repository profile.
6. Explicit trusted operator configuration.
7. Repository-contained declarative configuration.
8. Detected repository metadata.
9. Defaults that do not broaden authority.

A lower-precedence source must not weaken or override a higher-precedence
restriction.

---

## 47. Repository-contained configuration

Repository-contained configuration must be treated as untrusted data.

It may describe:

- source roots;
- test roots;
- scripts;
- build targets;
- compiler settings;
- workspace structure;
- generated outputs.

It must not:

- grant authorization;
- choose credentials;
- broaden network access;
- disable the denylist;
- weaken security controls;
- mark tests as passed;
- create human disposition;
- authorize remediation;
- authorize publication;
- modify governance.

---

## 48. Executable configuration

Configuration that executes code must run only in the untrusted runner.

Examples include:

- JavaScript configuration;
- TypeScript configuration loaders;
- package-manager hooks;
- build configuration;
- test setup;
- custom plugins;
- compiler plugins.

The trusted controller should consume only validated structured results from
such evaluation.

Executable configuration failure must remain explicit.

---

## 49. Trusted repository configuration

DCAv2 may support an explicit trusted repository-configuration record outside
the analyzed repository.

Such a record should identify:

- repository identity;
- source revision or applicability rule;
- profile;
- source roots;
- test roots;
- generated roots;
- command mappings;
- required gates;
- allowed network profile;
- credential capabilities;
- authorizing actor;
- version;
- expiration or supersession.

Configuration must not contain secret values.

---

## 50. Configuration validation

Every configuration field must have:

- type;
- allowed values;
- normalization rule;
- length or size limit;
- default behavior;
- security impact;
- compatibility version;
- error status.

Unknown fields should be rejected or handled through an explicit compatibility
policy.

Invalid configuration must not be ignored silently.

---

## 51. Configuration completeness

Qualification must distinguish:

- valid and complete configuration;
- valid but incomplete configuration;
- invalid configuration;
- conflicting configuration;
- stale configuration;
- unsupported configuration version.

Incomplete required configuration should produce `configuration_required`.

Invalid security-sensitive configuration should produce `security_blocked` or
`failed`.

---

## 52. Configuration suggestions

DCAv2 may generate a proposed configuration suggestion.

A suggestion must:

- remain non-authoritative;
- identify missing fields;
- explain detected evidence;
- avoid secret values;
- avoid broad permissions;
- avoid executable content where possible;
- require human review;
- remain separate from applied configuration.

Phase 2 must not write configuration into the repository unless explicitly
authorized.

---

## 53. Automatic configuration changes

Automatic repository configuration changes are outside the default Phase 2
scope.

Examples include:

- editing package scripts;
- editing TypeScript configuration;
- replacing lockfiles;
- adding analyzer configuration;
- adding DCAv2 configuration;
- adding registry configuration;
- adding build targets.

When separately authorized, such changes require:

- exact changed-file scope;
- structured transformation;
- baseline and post-change tests;
- secret review;
- local Git safety;
- separate reporting.

---

## 54. Environment-variable requirements

Qualification may identify required environment-variable names.

It must not retrieve or display secret values unnecessarily.

For each variable, record applicable:

- name;
- required or optional status;
- secret or non-secret classification;
- stage requiring it;
- trust zone;
- permitted source;
- redaction requirement;
- absence behavior.

A repository request for an environment variable does not authorize DCAv2 to
provide it.

---

## 55. Private registries

Private registry requirements must be explicit.

Qualification should identify:

- registry provider;
- destination;
- package scope;
- credential type;
- required network profile;
- package-manager configuration;
- support status;
- absence behavior.

Private registry credentials must not be written into repository files, logs,
lockfiles, or qualification records.

Inaccessible required private dependencies should produce `inaccessible` or
`configuration_required`.

---

## 56. Command discovery

Qualification may discover possible commands from:

- package scripts;
- build files;
- test configuration;
- CI configuration;
- repository documentation;
- trusted configuration.

Every discovered command is an untrusted observation.

The result should preserve:

- source;
- raw name;
- relevant metadata;
- likely purpose;
- trust status;
- mapping status.

Discovered command text must not be executed directly.

---

## 57. Command mapping

A discovered operation may run only after it maps to an approved structured
command definition.

A command mapping should identify:

- command ID;
- command version;
- discovered source;
- approved executable;
- validated arguments;
- working directory;
- environment allowlist;
- runner profile;
- network profile;
- filesystem profile;
- timeout;
- resource limits;
- expected result;
- required authorization.

An unmapped required command should produce `configuration_required` or
`unsupported`.

---

## 58. Shell command handling

Repository script bodies and shell commands are untrusted.

Qualification must not:

- concatenate them into trusted shell strings;
- execute them in the controller;
- execute them in the publisher;
- infer permission from their presence;
- copy them into governance or trusted command registries automatically.

When repository-script execution is required, an approved runner command may
invoke a validated script name under isolation.

---

## 59. Baseline gate discovery

Qualification should determine which baseline gates are applicable.

Possible gates include:

- dependency installation;
- parsing;
- type checking;
- compilation;
- build;
- lint;
- unit tests;
- integration tests;
- service startup;
- health check;
- generated-artifact validation;
- repository-status validation;
- secret scanning.

Each gate must be classified as:

- required;
- conditional;
- optional;
- unsupported;
- unavailable;
- not applicable.

---

## 60. Baseline probing

Phase 2 may execute authorized baseline probes to determine readiness.

A probe must use:

- approved command ID;
- immutable source snapshot;
- approved runner profile;
- explicit network profile;
- explicit filesystem profile;
- explicit environment allowlist;
- timeout;
- resource limits;
- bounded output;
- cleanup.

A probe is not remediation.

Source modification should be prohibited unless the probe profile explicitly
permits bounded generated output.

---

## 61. Baseline result model

Every baseline gate result should record:

- gate ID;
- command ID and version;
- repository identity;
- source commit;
- repository profile;
- runner profile;
- tool versions;
- configuration digest;
- start and completion times;
- status;
- exit code;
- failure category;
- bounded artifact references;
- output-truncation status;
- cleanup status.

Baseline results must remain separate from qualification conclusions.

---

## 62. Pre-existing failures

Qualification must preserve pre-existing baseline failures.

A pre-existing failure must not be:

- marked passed;
- omitted;
- rewritten as an analyzer warning;
- hidden by later successful commands;
- assumed irrelevant without policy.

The qualification result should identify whether the requested capability may
continue in:

- detection-only mode;
- limited mode;
- no mode.

Remediation must remain blocked when a required baseline is broken unless a
separately approved comparison policy permits the exact case.

---

## 63. Capability routing

Qualification should route each requested capability to one of:

- `enabled`;
- `enabled_with_limits`;
- `configuration_required`;
- `blocked_by_baseline`;
- `blocked_by_security`;
- `unsupported`;
- `unavailable`;
- `stale`.

Routing must consider:

- repository profile;
- tool availability;
- configuration;
- baseline results;
- security controls;
- required coverage;
- authorization;
- current capability status.

A capability must not be enabled solely because its code path exists.

---

## 64. Detection versus remediation routing

Qualification must distinguish:

- detection readiness;
- classification readiness;
- remediation readiness;
- publication readiness.

A repository may be:

- ready for inventory only;
- ready for evidence collection;
- ready for detection-only classification;
- ready for human review;
- not ready for remediation;
- not ready for publication.

A single Boolean readiness value is insufficient.

---

## 65. Qualification evidence

Qualification conclusions must retain attributable evidence.

Evidence may include:

- provider metadata;
- source snapshot;
- manifest occurrence;
- lockfile occurrence;
- configuration occurrence;
- directory occurrence;
- tool-version result;
- command result;
- baseline result;
- security-control result;
- trusted configuration reference.

Repository evidence must remain untrusted data.

The qualification engine determines how evidence maps to readiness under a
versioned profile.

---

## 66. Qualification digest

A deterministic qualification digest should bind applicable:

- request identity;
- repository identity;
- source commit;
- repository profile version;
- configuration digest;
- discovered roots;
- language results;
- package-manager results;
- workspace results;
- toolchain results;
- command mappings;
- baseline results;
- security-control results;
- capability-routing results.

Changing any security-sensitive or capability-sensitive input must invalidate
the qualification result.

---

## 67. Qualification freshness

A qualification result should become stale when applicable:

- repository commit changes;
- lockfile changes;
- manifest changes;
- relevant configuration changes;
- tool version changes;
- runner image changes;
- command mapping changes;
- repository profile changes;
- security policy changes;
- authorization changes;
- required gate definitions change.

Stale qualification must not permit analysis or remediation to continue without
requalification.

---

## 68. Persistence model

Phase 2 may persist concepts such as:

- qualification requests;
- qualification attempts;
- qualification results;
- repository profiles;
- detected repository characteristics;
- configuration records;
- configuration validation results;
- command mappings;
- tool-resolution results;
- baseline results;
- capability-routing results;
- qualification digests.

Persistence changes must use additive ordered migrations.

Historical qualification results must remain attributable to their original
profile and source revision.

---

## 69. Database migration requirements

Phase 2 database changes must follow
`codex/engineering/database-evolution-policy.md`.

Required migration testing should include applicable:

- fresh installation;
- upgrade from the Phase 1 schema;
- realistic existing qualification records;
- multiple tenants;
- nullable legacy fields;
- migration failure;
- retry;
- projection rebuild;
- tenant isolation;
- audit compatibility.

Existing migrations must not be rewritten.

---

## 70. Audit requirements

Phase 2 should produce audit events for applicable:

- qualification requested;
- repository identity validated;
- repository access allowed;
- repository access denied;
- prohibited repository excluded;
- immutable revision resolved;
- source acquisition completed;
- repository profile selected;
- language detected;
- package manager detected;
- workspace detected;
- configuration validated;
- configuration rejected;
- tool resolved;
- tool unavailable;
- command mapped;
- baseline gate executed;
- capability routed;
- qualification completed;
- qualification failed;
- qualification became stale;
- cleanup completed;
- cleanup failed.

Audit events must not contain secret values.

---

## 71. Runner requirements

Repository-controlled configuration, tools, and commands must execute only in
an approved runner profile.

The required profile should enforce applicable:

- non-root execution;
- no privileged mode;
- capability restrictions;
- no Docker socket;
- no host network;
- no trusted credentials;
- environment allowlisting;
- filesystem confinement;
- network denial or allowlisting;
- CPU limits;
- memory limits;
- process limits;
- disk limits;
- timeouts;
- output limits;
- process-tree cleanup;
- workspace cleanup.

Unavailable required controls must block qualification paths that execute
untrusted content.

---

## 72. Network stages

Qualification should use separate network stages where practical.

Examples include:

- provider metadata access;
- source acquisition;
- dependency-registry access;
- baseline execution with network disabled;
- local test-service access.

A job must not retain provider or registry network capability after the stage
requiring it completes.

Repository content must not broaden the selected network profile.

---

## 73. Credential boundaries

Qualification may use narrowly scoped credentials for:

- provider read access;
- private registry read access;
- test-only local services when authorized.

The runner must not receive:

- trusted publisher credentials;
- production database administrative credentials;
- unrelated provider credentials;
- broad cloud credentials;
- long-lived secrets when short-lived capability exists.

Credential values must not be persisted in qualification evidence or reports.

---

## 74. Prompt-injection resistance

Instructions found in repository files, configuration, documentation, command
output, or provider metadata must remain untrusted data.

Such content must not:

- alter configuration precedence;
- broaden repository scope;
- choose credentials;
- enable network access;
- add trusted command definitions;
- mark missing gates as passed;
- change qualification status;
- authorize analysis;
- authorize remediation;
- authorize publication;
- modify governance.

Hostile configuration and documentation fixtures should validate this behavior.

---

## 75. Secret handling

Qualification must avoid exposing secrets through:

- manifest inspection;
- package-manager configuration;
- registry URLs;
- command output;
- environment requirements;
- baseline logs;
- provider metadata;
- generated suggestions;
- audit events;
- reports.

Credential-bearing URLs must be redacted.

Synthetic secret canaries should be used for validation.

---

## 76. Phase 2 test manifest

Phase 2 should receive a dedicated test manifest, such as:

`codex/tests/phase-2-tests.yaml`

If this file is introduced, it must be added through authorized repository
changes and conform to:

`codex/tests/phase-test-manifest.schema.json`

The manifest must identify concrete required and conditional test IDs.

The phrase “run relevant tests” is insufficient.

---

## 77. Minimum repository-identity tests

Repository-identity tests should cover:

- valid canonical identity;
- owner/name case normalization;
- provider repository ID mismatch;
- mutable alias;
- malformed identity;
- wrong account or installation;
- unauthorized repository;
- prohibited repository;
- local remote with credential-bearing URL;
- requested operation outside policy.

Denylist tests must not retrieve prohibited content.

---

## 78. Minimum revision tests

Revision tests should cover:

- valid commit;
- branch resolving to commit;
- tag resolving to commit;
- missing revision;
- ambiguous revision;
- force-moved branch between attempts;
- commit unavailable after shallow fetch;
- repository mismatch;
- stale source snapshot;
- changed source after qualification.

Qualification must bind only to the resolved immutable commit.

---

## 79. Minimum profile tests

Repository-profile tests should cover:

- supported single-package npm TypeScript repository;
- npm workspace detected;
- pnpm workspace detected;
- Yarn workspace detected;
- mixed package-manager indicators;
- multiple TypeScript projects;
- unsupported language version;
- unsupported platform;
- generated-only project;
- framework convention requiring unsupported analysis;
- ambiguous profile;
- explicit trusted profile override.

A profile mismatch must not silently select the closest supported profile.

---

## 80. Minimum language-detection tests

Language tests should cover:

- TypeScript source;
- JavaScript source;
- TSX source;
- declaration files;
- generated TypeScript;
- mixed TypeScript and Python;
- unknown extensions;
- vendored source;
- test-only language;
- empty repository;
- malformed configuration.

Detection must remain separate from support status.

---

## 81. Minimum package-manager tests

Package-manager tests should cover:

- supported npm lockfile;
- unsupported npm lockfile version;
- missing lockfile;
- `packageManager` declaration;
- npm and pnpm lockfiles together;
- npm and Yarn lockfiles together;
- nested package managers;
- stale lockfile;
- private registry requirement;
- missing package-manager executable;
- unsupported package-manager version.

Conflicts must produce an explicit result.

---

## 82. Minimum root-discovery tests

Root-discovery tests should cover:

- conventional source root;
- configured source root;
- colocated tests;
- separate test root;
- generated root;
- excluded dependency directory;
- nested package root;
- symbolic-link escape;
- root cycle;
- missing configured root;
- ambiguous root;
- repository-relative normalization;
- platform separator differences.

Unsafe roots must be rejected.

---

## 83. Minimum configuration tests

Configuration tests should cover:

- valid complete configuration;
- missing required field;
- unknown field;
- invalid type;
- conflicting source roots;
- duplicate command mapping;
- stale configuration;
- unsupported configuration version;
- lower-precedence attempt to weaken security;
- repository attempt to enable publication;
- repository attempt to request credentials;
- repository attempt to disable the denylist;
- generated configuration suggestion;
- configuration containing a synthetic secret.

Invalid or unsafe configuration must fail explicitly.

---

## 84. Minimum command-discovery tests

Command-discovery tests should cover:

- package script observation;
- build configuration observation;
- test script observation;
- CI command observation;
- documentation command observation;
- shell metacharacters;
- arbitrary command string;
- missing script;
- duplicate script names;
- nested package script;
- mapped approved command;
- unmapped required command;
- repository attempt to select trust zone.

Discovered command text must never execute directly.

---

## 85. Minimum tool-resolution tests

Tool-resolution tests should cover:

- supported project-local executable;
- supported runner-image executable;
- missing executable;
- wrong version;
- ambiguous executable;
- executable outside approved path;
- host-global executable present;
- project executable absent;
- corrupted package installation;
- unsupported architecture;
- version command failure;
- executable replaced between validation and execution.

No host-global fallback should occur.

---

## 86. Minimum baseline tests

Baseline tests should cover:

- all required gates pass;
- optional gate unavailable;
- required gate unavailable;
- type-check failure;
- build failure;
- test failure;
- timeout;
- resource exhaustion;
- malformed result;
- output truncation;
- cleanup failure;
- source modification during a read-only probe;
- network request during a network-disabled gate;
- pre-existing failure classification.

Required failures must block remediation readiness.

---

## 87. Minimum capability-routing tests

Routing tests should cover:

- inventory enabled;
- evidence collection enabled;
- detection-only enabled;
- classification blocked by incomplete coverage;
- remediation blocked by baseline;
- remediation blocked by missing tool;
- remediation blocked by security;
- publication blocked by authorization;
- unsupported repository shape;
- stale qualification;
- configuration required;
- tool version mismatch.

Routing must be deterministic and explainable.

---

## 88. Minimum security tests

Security tests should cover:

- repository configuration remains untrusted;
- executable configuration runs only in the runner;
- environment is sanitized;
- provider credentials are unavailable to baseline commands;
- publisher credentials are unavailable;
- Docker socket is unavailable;
- host filesystem is unavailable;
- cloud metadata is unavailable;
- network profile is enforced;
- symbolic-link escape is rejected;
- arbitrary shell strings are not executed;
- output is bounded;
- process-tree cleanup succeeds.

Required security controls must be enforced in the tested profile.

---

## 89. Minimum migration tests

Migration tests should cover:

- fresh database;
- upgrade from Phase 1 schema;
- multiple tenants;
- historical qualification records;
- nullable legacy data;
- failed migration;
- retry;
- duplicate qualification attempt;
- qualification projection rebuild;
- tenant-isolation enforcement;
- audit-event preservation.

Testing only against an empty database is insufficient.

---

## 90. Minimum audit tests

Audit tests should verify:

- qualification request event;
- repository denial event;
- prohibited-repository exclusion event;
- profile-selection event;
- configuration failure event;
- tool-unavailable event;
- baseline-failure event;
- qualification-completed event;
- qualification-stale event;
- retry attempt identity;
- tenant scope;
- secret redaction;
- cleanup failure.

Historical failed qualification attempts must remain visible.

---

## 91. Fixture strategy

Phase 2 should use fixtures representing:

- supported single-package npm TypeScript repository;
- npm workspace;
- pnpm workspace;
- Yarn workspace;
- mixed package-manager repository;
- multiple TypeScript projects;
- generated-source repository;
- private-registry requirement;
- broken baseline;
- missing toolchain;
- malicious configuration;
- symbolic-link escape;
- hostile command text;
- alternate names and paths.

Production behavior must not branch on fixture-specific identities.

---

## 92. External repository tests

External repository qualification requires explicit authorization.

The authorization must identify:

- canonical repository;
- immutable revision;
- permitted metadata;
- permitted source access;
- permitted commands;
- permitted network;
- permitted credentials;
- data retention;
- cleanup.

External qualification must not imply remediation or publication authority.

The prohibited repository must never be used.

---

## 93. Capability acceptance criteria

A qualification capability may become `functional` only when:

1. Repository identity is verified.
2. Denylist enforcement occurs before content access.
3. Immutable revision resolution is deterministic.
4. Repository profiles are versioned.
5. Profile matching is deterministic.
6. Languages are detected accurately for the supported scope.
7. Package-manager conflicts are explicit.
8. Workspace detection is explicit.
9. Source, test, and generated roots are attributable.
10. Symbolic-link escapes are blocked.
11. Required tools are resolved deterministically.
12. Host-global fallback is prevented.
13. Configuration precedence is enforced.
14. Repository configuration remains untrusted.
15. Discovered commands require approved mappings.
16. Baseline results preserve failures.
17. Capability routing is deterministic.
18. Qualification freshness is enforced.
19. Required security controls pass.
20. Required migration tests pass.
21. Required Phase 2 tests pass.
22. Generalization beyond one fixture is demonstrated.

---

## 94. Detection-only qualification

A repository may be qualified for detection-only workflows when:

- required inventory and evidence tools are available;
- required detection coverage can be evaluated;
- remediation gates are unavailable or broken;
- remediation readiness is explicitly denied;
- the requested classification profile permits detection-only behavior;
- limitations are reported.

Detection-only readiness must not be represented as remediation readiness.

---

## 95. Configuration-required outcome

Phase 2 may validly produce `configuration_required` for repositories that
cannot be interpreted safely without human input.

A configuration request should identify:

- exact missing field;
- detected alternatives;
- security implications;
- affected capabilities;
- example valid values where safe;
- whether the configuration should be stored outside the repository;
- whether requalification is required.

DCAv2 must not guess security-sensitive configuration.

---

## 96. Blocked outcome

Phase 2 must remain blocked when applicable:

- repository identity cannot be established;
- denylist evaluation cannot be completed;
- immutable source resolution fails;
- required runner controls fail;
- required tool licensing is unresolved;
- command discovery cannot be made safe;
- executable configuration escapes isolation;
- required baseline infrastructure is unavailable;
- migration tests fail;
- tenant isolation fails;
- secret exposure is suspected;
- required tests fail or are unavailable;
- authorization expires or is revoked.

A blocked result must identify the exact safe next action.

---

## 97. Phase completion criteria

Phase 2 may be reported complete only when all applicable criteria are
satisfied:

1. Qualification request and result contracts are implemented.
2. Repository identity validation is implemented.
3. Prohibited-repository enforcement is tested.
4. Immutable revision resolution is implemented.
5. Repository profiles are versioned.
6. Language detection is implemented for the authorized scope.
7. Package-manager detection is implemented.
8. Workspace detection is implemented.
9. Source, test, and generated roots are implemented.
10. Configuration precedence is enforced.
11. Configuration validation is implemented.
12. Command discovery remains non-executable.
13. Approved command mapping is implemented.
14. Tool resolution is deterministic.
15. Host-global fallback is prevented.
16. Baseline evaluation is implemented.
17. Capability routing is implemented.
18. Qualification staleness is enforced.
19. Required database migrations pass.
20. Required security controls pass.
21. Required Phase 2 tests pass.
22. Triggered conditional tests pass.
23. Capability statuses are updated truthfully.
24. Security-control matrix is updated.
25. Phase report is complete.
26. Execution state is updated.
27. No unresolved blocker contradicts completion.

---

## 98. Phase report

The Phase 2 completion report should include:

- authorization identity;
- objective;
- source commit before and after;
- files changed;
- migrations;
- dependencies;
- schemas;
- repository profiles;
- supported languages;
- detected but unsupported languages;
- package-manager behavior;
- workspace behavior;
- root-discovery behavior;
- configuration model;
- configuration precedence;
- command discovery;
- command mappings;
- tool resolution;
- baseline evaluation;
- capability routing;
- security controls;
- tests;
- fixtures;
- external repositories;
- capability-status changes;
- limitations;
- blockers;
- cleanup;
- next safe action.

The report must distinguish detection from support and support from readiness.

---

## 99. Execution-state handoff

The Phase 2 handoff should identify:

- phase status;
- authorization status;
- source commit;
- current worktree state;
- implemented qualification profiles;
- unsupported repository profiles;
- configuration schema;
- command mappings;
- baseline behavior;
- capability-routing behavior;
- test manifest;
- test results;
- security-control results;
- migrations;
- external operations;
- cleanup state;
- next human decision.

The handoff must not authorize Phase 3A.

---

## 100. Transition to Phase 3A

Phase 3A may be proposed when Phase 2 can reliably detect npm workspaces and
report them as unsupported or configuration-required under the single-package
profile.

Before Phase 3A begins:

1. Finalize the Phase 2 report.
2. Update execution state.
3. Stop Phase 2 implementation.
4. Present actual qualification capabilities.
5. Record unsupported workspace behavior.
6. Prepare a Phase 3A authorization.
7. Obtain explicit human approval.

Phase 3A must not start automatically.

---

## 101. Phase stop conditions

Work must stop when:

- Phase 2 authorization is inactive;
- authorization expires;
- authorization is revoked;
- repository scope is exceeded;
- a prohibited repository is encountered;
- repository identity cannot be verified;
- immutable source resolution fails;
- required network access is unauthorized;
- required credential capability is unavailable;
- a required tool's license is unresolved;
- executable configuration cannot be isolated;
- required runner controls fail;
- a destructive database operation would be required;
- a required test fails or is unavailable;
- tenant isolation fails;
- secret exposure is suspected;
- local user work cannot be preserved;
- governance conflict prevents safe interpretation.

Stopping must be recorded truthfully.

---

## 102. Fail-safe behavior

When repository identity, source revision, profile, configuration, command
mapping, toolchain, baseline, security status, or capability routing cannot be
established confidently:

- do not report the repository as ready;
- do not execute arbitrary discovered commands;
- do not guess security-sensitive configuration;
- do not use undeclared host-global tools;
- do not broaden network access;
- do not expose additional credentials;
- do not begin remediation;
- do not begin publication;
- preserve available qualification evidence;
- return an explicit configuration-required, unsupported, inaccessible, failed,
  stale, or blocked result;
- identify the exact missing requirement.

Qualification uncertainty must reduce downstream execution authority.

---

## 103. Document integrity

This roadmap file must not be modified during Phase 2 implementation unless
roadmap or governance modification is explicitly authorized.

Changes require:

1. Identification of the Phase 2 planning problem.
2. Review against the roadmap overview.
3. Review against permanent safety invariants.
4. Review of repository-access and qualification implications.
5. Review of configuration-precedence implications.
6. Review of command, toolchain, and runner implications.
7. Review of testing and completion impact.
8. Updated Phase 2 test manifest where applicable.
9. Updated schemas or capability definitions where applicable.
10. A reviewable governance commit.
11. An ADR when the change alters long-lived qualification, configuration,
    command-discovery, or repository-profile semantics.

This roadmap must not be weakened to make ambiguous repositories, missing
tools, broken baselines, unsafe configuration, failed tests, or unsupported
profiles appear ready.