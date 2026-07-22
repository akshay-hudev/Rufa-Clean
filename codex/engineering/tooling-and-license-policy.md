# Tooling and License Policy

This document defines how DCAv2 evaluates, approves, installs, executes,
distributes, upgrades, and removes third-party tools and dependencies.

It applies to:

- libraries;
- analyzers;
- parsers;
- compilers;
- command-line tools;
- transformation engines;
- container images;
- package-manager plugins;
- build tools;
- hosted services;
- provider SDKs;
- database extensions;
- development dependencies;
- runtime dependencies;
- transitive dependencies;
- vendored binaries;
- downloaded artifacts.

A tool must not become a mandatory DCAv2 dependency until its functional fit,
license, security implications, provenance, and maintenance expectations have
been evaluated.

This document must be applied together with:

- `codex/core/03-safety-invariants.md`;
- `codex/core/08-secret-handling-policy.md`;
- `codex/architecture/trust-boundaries.md`;
- `codex/architecture/capability-definitions.md`;
- `codex/engineering/reuse-first-policy.md`;
- `codex/engineering/dependency-adoption-checklist.md`;
- `codex/engineering/adr-policy.md`;
- `codex/engineering/testing-policy.md`.

---

## 1. Core principles

Tooling decisions must be:

- capability-driven;
- reuse-first;
- license-aware;
- security-reviewed;
- version-controlled;
- reproducible where practical;
- attributable;
- replaceable;
- failure-preserving;
- bounded by the active authorization.

DCAv2 must not adopt a tool merely because it is available, popular, or
convenient.

A tool may provide evidence or execution capability.

It must not gain authority over:

- classification policy;
- repository access;
- remediation approval;
- publication approval;
- safety invariants;
- governance files.

---

## 2. Scope of a tooling decision

Every tooling decision must identify the exact intended role.

Examples include:

- Tree-sitter for syntax parsing;
- SCIP for semantic-index interchange;
- `scip-typescript` for TypeScript semantic indexing;
- Knip for unused-export evidence;
- Vulture for Python unused-code evidence;
- PolyglotPiranha for structured transformation;
- PostgreSQL for relational persistence;
- a GitHub SDK for trusted provider operations.

Avoid broad decisions such as:

```text
Adopt Knip for dead-code detection.
```

Prefer bounded statements such as:

```text
Evaluate Knip as one TypeScript unused-export evidence source for qualified npm
workspaces.
```

The decision scope must state what the tool does not provide.

---

## 3. Tool classifications

Tools should be classified by how DCAv2 uses them.

### 3.1 Runtime dependency

Required for normal DCAv2 production operation.

### 3.2 Development dependency

Required only for building, testing, linting, or local development.

### 3.3 Runner tool

Executed inside the untrusted runner against repository-controlled content.

### 3.4 Trusted-controller tool

Executed by the trusted controller and prohibited from processing executable
repository-controlled behavior unless explicitly proven safe.

### 3.5 Trusted-publisher tool

Used only for narrow source-control publication operations.

### 3.6 Optional analyzer

Provides additional evidence but is not required for every supported workflow.

### 3.7 Build-time tool

Used to produce DCAv2 artifacts but not required at runtime.

### 3.8 External hosted service

Operated outside DCAv2 infrastructure and accessed through a network API.

A tool may occupy more than one classification, but each execution context must
be reviewed separately.

---

## 4. Approval states

Every evaluated tool must use one approval state:

- `not_evaluated`;
- `evaluation_in_progress`;
- `approved`;
- `approved_with_constraints`;
- `experimental_only`;
- `blocked`;
- `rejected`;
- `deprecated`;
- `removal_planned`.

### `not_evaluated`

No adoption decision exists.

### `evaluation_in_progress`

A bounded evaluation is authorized but incomplete.

### `approved`

The tool is permitted for its documented role and version range.

### `approved_with_constraints`

The tool is permitted only under explicit restrictions.

### `experimental_only`

The tool may be used in isolated evaluation or non-production workflows.

### `blocked`

Adoption cannot proceed until missing information or controls are resolved.

### `rejected`

The tool must not be used for the evaluated role.

### `deprecated`

Existing use may continue temporarily while migration occurs.

### `removal_planned`

A reviewed removal path exists and implementation is pending authorization.

Approval for one role does not approve every possible use of the tool.

---

## 5. Mandatory adoption record

Every mandatory tool must have an adoption record containing:

- tool name;
- canonical project identity;
- intended capability;
- execution trust zone;
- selected version;
- distribution method;
- license;
- license source;
- license verification date;
- copyright or notice obligations;
- security review status;
- provenance source;
- checksum, digest, or lockfile identity;
- transitive dependency summary;
- network behavior;
- credential requirements;
- repository-code execution behavior;
- output contract;
- known limitations;
- test coverage;
- upgrade strategy;
- replacement strategy;
- approval state;
- decision owner;
- decision date.

A package manifest entry alone is not an adoption record.

---

## 6. License verification

License verification must use authoritative sources where available.

Preferred sources include:

- License file in the exact source release.
- Official project repository.
- Official package-registry metadata.
- Official project documentation.
- Signed or published release artifacts.

Third-party summaries may support investigation but must not be the sole
authority when primary licensing material is available.

The review must identify the license for the exact version or release family
being adopted.

---

## 7. License uncertainty

When a license cannot be identified or interpreted confidently:

- do not mark the tool approved;
- do not make it mandatory;
- do not distribute it;
- do not copy its source into DCAv2;
- do not claim that its use is legally safe;
- mark the decision blocked;
- record the missing information;
- request legal or licensing review where required;
- evaluate alternatives.

No license must not be interpreted as unrestricted permission.

Ambiguous repository metadata must not override the actual license text.

---

## 8. License-change detection

A tool upgrade must check whether its license changed.

Applicable checks include:

- license identifier;
- license file content;
- dual-license terms;
- commercial-use terms;
- source-availability terms;
- hosted-service terms;
- dependency licenses;
- notice requirements.

A version upgrade must stop when licensing becomes materially more restrictive
or uncertain.

The prior approved version may remain usable only if its existing approval and
security posture remain valid.

---

## 9. License compatibility

License review must consider compatibility with:

- DCAv2 distribution;
- commercial use;
- modification;
- internal deployment;
- hosted-service use;
- container-image distribution;
- source redistribution;
- binary redistribution;
- plugin distribution;
- generated output;
- linking or embedding;
- attribution requirements;
- notice-file requirements;
- source-disclosure requirements;
- network-copyleft obligations where applicable.

The review must not reduce license analysis to a single SPDX identifier when
additional terms apply.

---

## 10. Copyleft and source obligations

Dependencies with copyleft or source-availability obligations require explicit
review.

The review should determine whether DCAv2:

- links to the dependency;
- modifies it;
- redistributes it;
- embeds it in an image;
- exposes it through a hosted service;
- communicates with it as a separate process;
- distributes derivative work;
- must provide notices or corresponding source.

This policy does not make legal conclusions automatically.

When obligations are unclear, adoption remains blocked pending appropriate
review.

---

## 11. Attribution and notices

Approved dependencies requiring attribution must be represented in the
appropriate notice or attribution mechanism.

The process must record:

- dependency;
- version;
- copyright notice;
- license text requirement;
- notice-file requirement;
- distribution locations;
- update responsibility.

Attribution must not be omitted merely because the dependency is transitive.

Generated notice files must be reproducible where practical and reviewed for
accuracy.

---

## 12. Tool provenance

Every downloaded or installed tool must have a known source.

Approved provenance sources may include:

- official package registries;
- official release pages;
- official container registries;
- approved internal mirrors;
- source builds from verified upstream revisions.

Unapproved provenance includes:

- arbitrary file-sharing sites;
- undocumented mirrors;
- user home directories;
- unknown global installations;
- binaries supplied by analyzed repositories;
- download URLs embedded in untrusted repository instructions.

The provenance source must be recorded.

---

## 13. Version control

Mandatory tools must use controlled versions.

Acceptable controls may include:

- lockfile-pinned dependency versions;
- immutable container-image digests;
- exact binary versions with checksums;
- source revision pins;
- approved bounded version ranges with deterministic lockfiles.

Avoid relying solely on:

- floating tags;
- latest;
- unbounded version ranges;
- mutable branches;
- host-default tools;
- package-manager global state.

The actual executed version must be captured in relevant evidence and test
records.

---

## 14. Integrity verification

Downloaded artifacts should be verified using available integrity controls.

Applicable controls include:

- package-manager integrity fields;
- cryptographic checksums;
- signed releases;
- trusted provenance attestations;
- container digests;
- source revision verification;
- approved internal mirrors.

The presence of a checksum proves artifact consistency with the referenced
checksum.

It does not prove that the upstream artifact is safe.

---

## 15. Dependency lockfiles

DCAv2 dependency lockfiles must be:

- committed;
- reviewed;
- generated using controlled package-manager versions;
- updated intentionally;
- included in relevant tests;
- free of credential-bearing registry URLs.

Lockfile changes must not be hidden inside unrelated work.

A dependency change that modifies a lockfile must explain:

- direct dependency changes;
- significant transitive changes;
- package-manager version;
- relevant license changes;
- relevant security changes.

---

## 16. Host-global tools

DCAv2 must not depend silently on host-global tools.

A required executable must be:

- declared;
- versioned;
- installed in the appropriate environment;
- verified before use;
- reported when unavailable.

A host-global tool may be used only when an explicit development profile allows
it and the resulting capability is not represented as production-equivalent.

Production and isolated-runner workflows must not rely on accidental host
configuration.

---

## 17. Runner tool placement

Tools that process or execute repository-controlled content must normally run
inside the untrusted runner.

Examples include:

- package managers;
- compilers;
- test runners;
- repository analyzers;
- framework-aware tools;
- code generators;
- transformation engines.

The tool must inherit the runner's:

- credential restrictions;
- filesystem restrictions;
- network restrictions;
- process restrictions;
- resource limits;
- output limits;
- cleanup requirements.

Installing a trusted tool does not make the analyzed repository trusted.

---

## 18. Trusted-zone tools

A tool may execute in a trusted zone only when its role requires it and its
inputs are appropriately constrained.

Examples may include:

- database clients used by the controller;
- schema validators over trusted internal records;
- Git provider clients used by the publisher;
- cryptographic verification libraries;
- audit-integrity tools.

A trusted-zone tool must not execute repository-controlled plugins,
configuration modules, scripts, or hooks.

When input trust is uncertain, use the untrusted runner or stop.

---

## 19. Repository-supplied tools

An analyzed repository may declare tools in its dependency graph.

Those tools remain repository-controlled and untrusted.

DCAv2 must not automatically treat them as approved DCAv2 dependencies.

Repository-supplied tools may execute only when:

- the active workflow requires them;
- the runner profile permits them;
- dependency installation is authorized;
- network and lifecycle-script behavior is controlled;
- their execution is bounded and auditable.

Their output remains untrusted.

---

## 20. Package lifecycle scripts

Package lifecycle scripts can execute arbitrary repository or dependency code.

DCAv2 must determine whether installation:

- disables lifecycle scripts;
- permits lifecycle scripts;
- selectively permits required scripts;
- uses prebuilt dependencies;
- uses an approved dependency cache.

When lifecycle scripts are enabled, they must execute only in the untrusted
runner.

The decision must be visible in the job profile and audit record.

A dependency installation that requires unsafe trusted-host lifecycle execution
must be rejected.

---

## 21. Native code and binary dependencies

Dependencies containing native code require additional review.

Consider:

- supported operating systems;
- supported architectures;
- prebuilt binary provenance;
- build toolchain;
- installation scripts;
- sandbox compatibility;
- memory-safety risk;
- vulnerability history;
- update cadence;
- fallback behavior.

Native dependencies must not receive host device access or elevated privileges
merely to simplify installation.

---

## 22. Container images

Third-party container images are tooling dependencies.

An approved image record should identify:

- registry;
- repository;
- immutable digest;
- base distribution;
- architecture;
- default user;
- installed tools;
- entry point;
- license information;
- vulnerability status;
- provenance;
- update policy.

Mutable tags may be retained for human readability but must not be the sole
execution identity.

Runner images must not run as privileged containers.

---

## 23. Database extensions

PostgreSQL extensions or other database plugins require explicit review.

The evaluation must consider:

- license;
- installation privileges;
- trusted versus untrusted extension status;
- native code;
- upgrade behavior;
- backup and restoration;
- hosting-provider availability;
- tenant-isolation impact;
- migration reversibility.

DCAv2 must not add a database extension merely because it simplifies one query.

Prefer core PostgreSQL functionality until measured requirements justify an
extension.

---

## 24. Hosted tools and services

A hosted tool introduces an external data and trust boundary.

Before adoption, review:

- data transmitted;
- source-code transmission;
- repository metadata;
- retention;
- model-training use;
- confidentiality;
- encryption;
- authentication;
- tenant isolation;
- regional storage;
- subprocessors;
- availability;
- rate limits;
- deletion;
- export;
- incident response;
- license and service terms;
- replacement strategy.

Source code must not be transmitted without explicit authorization.

A hosted service must not become mandatory when its legal, security, or
availability requirements cannot be established.

---

## 25. Telemetry and update checks

Tools must be evaluated for:

- telemetry;
- analytics;
- crash reporting;
- update checks;
- remote configuration;
- license verification calls.

Unnecessary telemetry and update checks should be disabled.

When they cannot be disabled:

- document the transmitted data;
- apply network restrictions;
- obtain authorization where required;
- assess confidentiality impact;
- consider rejecting the tool.

A tool must not contact external services unexpectedly from an isolated runner.

---

## 26. Credential requirements

A tool requiring credentials must document:

- credential type;
- required permissions;
- trust zone;
- lifetime;
- storage;
- injection method;
- redaction behavior;
- network destination;
- failure behavior.

Credentials must follow least privilege.

Credential values must not appear in:

- manifests;
- lockfiles;
- adoption records;
- logs;
- reports;
- command arguments when avoidable;
- container layers;
- source control.

A tool requiring materially broader credentials than its capability justifies
must remain blocked or constrained.

---

## 27. Security advisories

Approved tools must have an identified security-advisory source when available.

Possible sources include:

- official security advisories;
- package-registry advisories;
- language ecosystem advisory databases;
- container vulnerability feeds;
- vendor security bulletins.

The absence of a known advisory does not prove safety.

Security review should focus on whether an advisory affects the exact version,
configuration, and reachable code path.

---

## 28. Vulnerability handling

When a relevant vulnerability is identified:

- Record the affected tool and version.
- Identify affected DCAv2 capabilities.
- Determine whether the vulnerable path is reachable.
- Determine whether untrusted input can exploit it.
- Identify fixed versions or mitigations.
- Evaluate license and compatibility changes.
- Test the chosen update or mitigation.
- Update the adoption record.
- Report residual risk.

Do not perform broad unreviewed upgrades merely to remove an advisory count.

A vulnerable capability may need to be disabled or marked broken pending repair.

---

## 29. Maintenance status

Tool review should evaluate:

- latest stable release;
- release cadence;
- maintenance activity;
- supported runtimes;
- issue responsiveness;
- security policy;
- governance;
- maintainer concentration;
- project archival status;
- dependency health.

An abandoned project may still be usable when:

- its scope is stable;
- the implementation is well understood;
- the security surface is small;
- the license is clear;
- DCAv2 can maintain or replace it safely.

The decision must document the trade-off.

---

## 30. Transitive dependencies

Tool evaluation must consider significant transitive dependencies.

Review should identify:

- total dependency growth;
- native dependencies;
- lifecycle scripts;
- duplicate libraries;
- conflicting licenses;
- vulnerable packages;
- abandoned packages;
- broad framework introduction;
- runtime privilege changes.

Not every transitive dependency requires a separate ADR.

Material risks and obligations must still be documented.

---

## 31. Dependency minimization

DCAv2 should avoid unnecessary dependency growth.

Before adding a dependency, determine whether the requirement can be satisfied
by:

- existing DCAv2 code;
- the standard library;
- an already approved dependency;
- a small bounded implementation;
- a standard protocol;
- a database feature.

Dependency minimization must not justify reimplementing complex language or
security behavior poorly.

The decision must balance risk, maintenance, and correctness.

---

## 32. Overlapping tools

When tools overlap, the adoption decision must define distinct roles.

For each tool, state:

- evidence type;
- supported scope;
- authoritative or supporting role;
- correlation with other tools;
- failure behavior;
- coverage contribution;
- performance cost;
- disagreement handling.

DCAv2 must not adopt several tools only to count their outputs as independent
votes.

---

## 33. Tool output

Tool output must be treated as untrusted.

Adapters must validate:

- schema;
- size;
- encoding;
- tool version;
- source identity;
- exit status;
- completion status;
- artifact digest;
- expected paths;
- error fields.

Tool diagnostics may contain:

- source content;
- secrets;
- terminal escape sequences;
- prompt injection;
- invalid encoding;
- oversized output.

Output must be bounded, encoded safely, and redacted before persistence or
display.

---

## 34. Failure semantics

Each integration must distinguish:

- success with findings;
- success without findings;
- partial success;
- unsupported input;
- configuration required;
- tool unavailable;
- timeout;
- resource exceeded;
- malformed output;
- internal failure.

An error must not become an empty successful result.

A tool unavailable inside the approved runner must not be replaced silently by a
host-global executable.

---

## 35. Tool configuration

Tool configuration must be attributable and reproducible where practical.

Record applicable:

- configuration file;
- configuration digest;
- command identity;
- structured arguments;
- environment allowlist;
- working directory;
- plugin settings;
- excluded paths;
- enabled rules;
- disabled rules;
- network settings.

Repository-supplied configuration remains untrusted.

When a tool executes configuration as code, it must run inside the untrusted
runner.

---

## 36. Wrapper and adapter ownership

Third-party tools should be isolated behind DCAv2-owned adapters.

Adapters must:

- expose stable internal contracts;
- normalize output;
- preserve provenance;
- preserve failures;
- enforce limits;
- redact secrets;
- identify unsupported cases;
- support replacement;
- avoid leaking tool-specific authority into product policy.

Adapters must not conceal tool limitations to simplify downstream logic.

---

## 37. Optional tooling

An optional tool must not become an undeclared prerequisite.

When optional tooling is absent, DCAv2 must report:

- the unavailable capability;
- affected evidence types;
- affected coverage;
- affected classifications;
- whether remediation is blocked.

Optional-tool absence must not be reported as successful complete coverage.

---

## 38. Experimental tooling

Experimental tools must be isolated from production claims.

Experimental use must identify:

- authorized evaluation scope;
- test fixtures;
- expected duration;
- data permitted;
- security profile;
- license status;
- success criteria;
- exit decision.

Experimental output may inform engineering evaluation.

It must not authorize production remediation or publication unless the exact
workflow has separately reached functional status.

---

## 39. Tool adoption checklist

Before approval, complete:

`codex/engineering/dependency-adoption-checklist.md`

The checklist must not be completed mechanically.

Entries must be supported by evidence, tests, or explicit limitations.

A missing required checklist item prevents approval.

---

## 40. Decision record

A tool decision should use:

`codex/templates/tool-decision-template.md`

An ADR is required when the decision:

- establishes a long-lived architecture dependency;
- changes a trust boundary;
- introduces a hosted service;
- introduces a database or infrastructure system;
- changes an authoritative evidence format;
- creates material migration cost;
- replaces a core subsystem.

Narrow dependency updates may not require a new ADR when the existing decision
already defines the upgrade path.

---

## 41. Installation authorization

Tool installation must be within the current phase authorization.

Authorization should identify applicable permission for:

- dependency-manifest changes;
- lockfile changes;
- container-image changes;
- binary downloads;
- package-registry access;
- network access;
- license research;
- security scanning;
- test execution.

A roadmap entry mentioning a tool does not authorize its installation.

---

## 42. External research

Current information may be required for:

- release status;
- license terms;
- security advisories;
- maintenance status;
- compatibility;
- provider terms;
- package availability.

Research must use authoritative current sources where available.

When authoritative information is unavailable:

- record the failed lookup;
- avoid inventing a conclusion;
- mark the relevant item unverified;
- block mandatory adoption when the missing fact is material.

A cached or remembered license must not be treated as current verification.

---

## 43. Development environment

Development-tool requirements should be documented separately from production
requirements.

The development setup should identify:

- supported operating systems;
- language runtimes;
- package-manager versions;
- container runtime;
- database version;
- optional tools;
- required environment variables by name only;
- bootstrap commands;
- verification commands.

A developer's working local setup does not prove production reproducibility.

---

## 44. Reproducible setup

DCAv2 should provide a reproducible method for creating supported environments.

Applicable mechanisms include:

- lockfiles;
- container images;
- bootstrap scripts;
- declarative tool-version files;
- documented package-manager versions;
- database migrations;
- fixture setup commands.

Bootstrap scripts must not download and execute unverified remote scripts.

Setup failures must remain explicit.

---

## 45. Tool caches

Tool and dependency caches must be treated as untrusted inputs unless their
integrity is verified.

Cache policy should define:

- cache key;
- tenant isolation;
- source;
- integrity checks;
- lifetime;
- writable components;
- cleanup;
- secret exclusion;
- poisoning resistance.

A shared cache must not expose one tenant's private packages or artifacts to
another tenant.

Cache success must not replace lockfile or integrity verification.

---

## 46. Private registries

Private registry use requires explicit authorization and credential review.

The design must define:

- registry identity;
- permitted package scope;
- credential type;
- runner injection;
- network destination;
- redaction;
- cleanup;
- tenant isolation;
- fallback behavior.

Private registry credentials must not be written into repository configuration
or persisted in runner artifacts.

Failure to access a required private registry must produce an explicit
unavailable or configuration-required result.

---

## 47. Distribution

Before distributing a tool or dependency as part of DCAv2, verify:

- redistribution permission;
- notice obligations;
- source obligations;
- binary obligations;
- container-image obligations;
- trademark restrictions;
- export restrictions when applicable.

Internal use approval does not automatically approve redistribution.

Distribution scope must be part of the adoption decision.

---

## 48. Generated output and licensing

Some tools impose terms affecting generated output or embedded runtime code.

The evaluation must determine whether the tool:

- inserts licensed runtime components;
- copies templates;
- emits source derived from licensed material;
- adds required headers;
- changes distribution obligations.

Do not assume generated output is free of licensing obligations.

When unclear, mark the adoption decision blocked pending review.

---

## 49. Forking a dependency

Forking a dependency requires explicit approval.

A fork decision must address:

- reason for the fork;
- upstream status;
- license obligations;
- security ownership;
- release process;
- namespace;
- versioning;
- patch management;
- upstream contribution strategy;
- long-term maintenance;
- replacement or rebase plan.

A fork must not be created merely to avoid submitting a small upstream issue.

Maintaining a fork creates ongoing product responsibility.

---

## 50. Vendoring

Vendoring third-party source or binaries requires:

- explicit license approval;
- source provenance;
- exact version;
- integrity digest;
- update process;
- notice handling;
- vulnerability monitoring;
- local modification record;
- removal plan.

Vendored code must remain distinguishable from DCAv2-owned code.

Local modifications must not obscure upstream license or attribution.

---

## 51. Tool upgrades

An upgrade must evaluate applicable:

- functional compatibility;
- output changes;
- schema changes;
- default changes;
- configuration changes;
- new network behavior;
- new telemetry;
- license changes;
- transitive changes;
- vulnerability changes;
- performance changes;
- runner-image changes.

Required tests must pass before the upgraded version becomes authoritative.

A tool upgrade must not silently reclassify historical evidence.

---

## 52. Tool downgrade

A downgrade may be necessary for compatibility or incident response.

Before downgrading, verify:

- database or artifact compatibility;
- output-schema compatibility;
- known vulnerabilities;
- lockfile behavior;
- configuration compatibility;
- migration reversibility;
- historical evidence interpretation.

A downgrade must not be used to bypass a new security restriction without
review.

---

## 53. Tool removal

Removing a tool requires a reviewed plan.

The plan should identify:

- affected capabilities;
- replacement;
- stored tool-specific artifacts;
- schema impact;
- configuration cleanup;
- dependency cleanup;
- lockfile changes;
- documentation changes;
- notice changes;
- test migration;
- rollback.

Tool removal must not delete historical provenance needed to explain prior
evidence.

---

## 54. Tool-specific historical evidence

Evidence produced by an older tool version must retain its original provenance.

Upgrading or removing the tool must not rewrite historical records to show the
new version.

Historical records should preserve:

- original tool;
- original version;
- adapter version;
- configuration digest;
- source snapshot;
- artifact digest;
- execution result.

New policy may mark historical evidence stale without modifying its history.

---

## 55. Security testing

Tool integrations should include applicable tests for:

- credential absence;
- network denial;
- filesystem isolation;
- plugin execution;
- lifecycle scripts;
- malicious configuration;
- malformed output;
- unbounded output;
- path traversal;
- secret-bearing diagnostics;
- timeout;
- resource exhaustion;
- cache poisoning;
- version mismatch.

Tests must execute in the applicable trust zone.

A unit test of an adapter does not prove runner isolation.

---

## 56. License testing and automation

Automated license scanners may support review.

They must not replace human evaluation when:

- licenses conflict;
- metadata is missing;
- custom terms exist;
- dual licensing applies;
- source-available terms apply;
- transitive obligations are material;
- distribution behavior is unclear.

Scanner results are evidence.

They are not final legal authority.

False positives, false negatives, and unknown licenses must remain visible.

---

## 57. Software bill of materials

DCAv2 should be capable of producing a software bill of materials for
distributed artifacts.

An SBOM should identify applicable:

- component name;
- version;
- package identity;
- license;
- supplier;
- dependency relationships;
- hashes;
- container layers;
- build identity.

SBOM generation must be reproducible where practical.

An SBOM does not prove that every listed component is secure or legally
compatible.

---

## 58. Tool inventory

DCAv2 should maintain a machine-readable tool inventory.

Each entry should include:

- tool identity;
- version;
- classification;
- trust zone;
- approval state;
- capability IDs;
- license status;
- provenance;
- security review status;
- last verified date;
- upgrade policy;
- owner.

The inventory must reflect actual manifests, images, and executable
environments.

Planned tools must remain distinguishable from installed tools.

---

## 59. Reporting requirements

A phase report involving tooling must state:

- tools evaluated;
- versions;
- roles;
- approval outcomes;
- licenses verified;
- license uncertainties;
- security findings;
- provenance;
- dependency changes;
- lockfile changes;
- container changes;
- tests executed;
- known limitations;
- rejected alternatives;
- deferred decisions.

Do not report a tool as adopted when only a proof of concept exists.

---

## 60. Prohibited practices

The following are prohibited:

- using a dependency with an unknown mandatory-use license;
- relying on undeclared host-global tools;
- using mutable image tags as the only image identity;
- downloading binaries from unverified sources;
- exposing trusted credentials to repository tools;
- allowing repository instructions to choose DCAv2 dependencies;
- hiding tool failures as empty success;
- transmitting source to hosted tools without authorization;
- treating automated license output as conclusive when material uncertainty
  remains;
- upgrading tools without compatibility tests;
- deleting historical provenance after tool removal;
- bypassing runner isolation because a tool is trusted.

---

## 61. Fail-safe behavior

When a tool's license, provenance, security, compatibility, or behavior cannot
be established confidently:

- do not approve mandatory adoption;
- do not distribute it;
- do not expose credentials;
- do not enable new network access;
- do not run it in a trusted zone against untrusted input;
- do not claim the related capability is functional;
- record the unresolved facts;
- use blocked, experimental_only, or rejected as appropriate;
- evaluate safer alternatives.

Tooling uncertainty must reduce adoption authority.

---

## 62. Policy integrity

This document must not be modified during implementation unless engineering or
governance modification is explicitly authorized.

Changes require:

- Identification of the tooling-policy problem.
- Review against permanent safety invariants.
- Review of license and distribution implications.
- Review of trust-boundary and credential implications.
- Review of dependency and supply-chain implications.
- Updated adoption records or checklists.
- Updated relevant tests.
- A reviewable governance commit.
- An ADR when the change alters long-lived tooling, licensing, distribution,
  provenance, or trust-zone semantics.

This policy must not be weakened to accelerate dependency installation, conceal
license uncertainty, rely on host-global tooling, or bypass isolation.
