# Trust Boundaries

This document defines the security trust boundaries for DCAv2.

DCAv2 analyzes repositories whose contents, dependencies, scripts,
configuration, build processes, tests, analyzers, and generated artifacts must
be treated as untrusted.

The system must isolate repository-controlled execution from trusted policy,
credentials, persistence, authorization, and publication capabilities.

This document defines the intended architecture. Enforcement status must be
verified and reported separately. A documented boundary must not be described as
enforced until its controls have been implemented and tested.

---

## 1. Security objective

The primary security objective is to prevent untrusted repository content from
gaining access to:

- DCAv2 governance authority;
- controller credentials;
- publisher credentials;
- control-plane database credentials;
- unrelated repositories;
- host files;
- host processes;
- the container runtime;
- cloud credentials;
- unrestricted network access;
- external write capabilities;
- audit-history modification.

The system must assume that an analyzed repository may intentionally attempt to
escape its execution boundary.

---

## 2. Primary trust zones

DCAv2 has three primary trust zones:

1. Trusted controller.
2. Untrusted execution runner.
3. Trusted publisher.

Supporting systems such as PostgreSQL, artifact storage, version-control
providers, package registries, and telemetry platforms form additional external
trust boundaries.

Responsibilities and credentials must not be collapsed across these zones
without explicit architecture review and authorization.

---

## 3. Trusted controller

The trusted controller is responsible for control-plane decisions.

Its responsibilities include:

- validating authorization;
- enforcing repository-access policy;
- enforcing prohibited-repository exclusions;
- resolving repository identity;
- orchestrating source acquisition;
- creating immutable analysis jobs;
- selecting approved runner profiles;
- providing structured commands;
- receiving bounded runner results;
- validating result schemas;
- normalizing evidence;
- calculating coverage;
- applying classification policy;
- coordinating human review;
- validating remediation authorization;
- storing audit events;
- requesting trusted publication.

The controller may possess narrowly scoped credentials required for its trusted
responsibilities.

The controller must not execute repository-controlled commands directly.

---

## 4. Controller prohibitions

The trusted controller must not directly execute:

- package lifecycle scripts;
- repository shell scripts;
- repository build scripts;
- repository test commands;
- repository code generators;
- repository-provided analyzers;
- repository transformations;
- arbitrary commands derived from repository text;
- Git hooks from analyzed repositories;
- application services from analyzed repositories.

The controller must not treat repository documentation as authorization to run
a command.

When repository-controlled execution is required, the controller must create a
job for the approved untrusted runner.

---

## 5. Untrusted execution runner

The untrusted runner is the only zone permitted to execute
repository-controlled activity.

Its responsibilities may include:

- dependency installation;
- package-manager commands;
- analyzer execution;
- parsing repository configuration;
- type checking;
- compilation;
- building;
- linting;
- unit testing;
- integration testing;
- code generation;
- transformation;
- service startup;
- health checks;
- patch generation.

The runner must receive only the minimum inputs needed for one bounded job.

A runner must be considered compromised for the duration of every job.

---

## 6. Runner credential prohibition

The untrusted runner must not receive:

- GitHub App private keys;
- GitHub installation tokens;
- provider write tokens;
- publisher credentials;
- controller database credentials;
- production database credentials;
- cloud account credentials;
- host SSH private keys;
- host SSH agent access;
- host Git credential-helper access;
- Docker registry credentials unrelated to the job;
- package-registry credentials broader than the approved dependency operation;
- unrelated environment variables;
- secrets belonging to other repositories or tenants.

A repository command must not be able to obtain trusted credentials through
environment variables, mounted files, process inspection, metadata services, or
network access.

---

## 7. Trusted publisher

The trusted publisher is responsible for authenticated source-control writes.

Its responsibilities are limited to:

- receiving a verified publication request;
- reacquiring or validating the target repository;
- validating exact repository identity;
- validating the base commit;
- validating authorization;
- validating the human disposition;
- validating remediation authorization;
- validating the patch hash;
- validating the changed-file allowlist;
- applying the verified patch;
- creating a dedicated remediation branch;
- pushing approved commits;
- creating a draft pull request;
- returning external publication identifiers;
- recording an auditable result.

The publisher must not perform analysis or execute repository-controlled tests.

---

## 8. Publisher prohibitions

The trusted publisher must not:

- run package installation;
- run repository build scripts;
- run repository tests;
- run analyzers supplied by the repository;
- modify the verified patch;
- add unrelated files;
- push directly to the default branch;
- merge a pull request;
- enable auto-merge;
- mark a draft pull request ready for review;
- bypass branch protections;
- modify repository settings;
- delete repositories;
- rewrite shared history.

When the publisher cannot reproduce the verified publication inputs, it must
reject the request.

---

## 9. Separation between controller and publisher

The controller and publisher may be deployed within the same trusted system only
when their logical responsibilities and credentials remain separated.

At minimum:

- publication credentials must be unavailable to analysis workers;
- publisher entry points must validate signed or authenticated requests;
- publisher operations must be narrowly structured;
- publisher actions must be independently auditable;
- the publisher must reject arbitrary command execution;
- the publisher must not trust controller-provided descriptive text as proof of
  authorization.

A future deployment may separate the publisher into its own process or service
when required by the threat model.

---

## 10. Source-acquisition boundary

Source acquisition is a trusted operation because it may require provider
credentials.

The source-acquisition component must:

1. Validate repository identity.
2. Apply the prohibited-repository denylist.
3. Validate the current authorization.
4. Resolve the requested revision to an immutable commit.
5. Acquire only the permitted repository.
6. avoid executing repository hooks;
7. remove credential-bearing remotes;
8. produce a credential-free source snapshot;
9. calculate or record source identity;
10. transfer the snapshot to the runner.

The source snapshot supplied to the runner must not include provider
credentials.

---

## 11. Credential-free source snapshots

The preferred runner input is a credential-free, immutable source snapshot.

The snapshot should exclude or neutralize:

- authenticated Git remotes;
- provider authentication headers;
- host-specific Git configuration;
- host credential-helper configuration;
- host SSH configuration;
- Git hooks;
- unrelated repository history when unnecessary;
- unrelated worktrees;
- secret files not required by the authorized job.

When full Git history is required, it must still be supplied without credentials
or trusted hooks.

---

## 12. Structured job requests

The controller must send structured job requests rather than arbitrary shell
strings.

A job request should identify:

- job ID;
- authorization ID;
- tenant or account;
- repository identity;
- immutable source commit;
- source snapshot digest;
- runner profile;
- command identifier;
- structured arguments;
- working directory;
- environment allowlist;
- network policy;
- filesystem policy;
- resource limits;
- timeout;
- expected output schema;
- expected artifacts;
- cleanup policy.

Repository content must not be allowed to replace the approved command
identifier with arbitrary trusted-host execution.

---

## 13. Structured command boundary

Runner commands must be selected from approved, versioned command definitions.

A structured command definition should specify:

- executable;
- fixed arguments;
- validated variable arguments;
- allowed working-directory pattern;
- environment variables;
- network profile;
- timeout;
- CPU limit;
- memory limit;
- process limit;
- output limits;
- expected exit behavior;
- expected artifacts.

Shell interpretation should be avoided when direct process execution is
possible.

Untrusted repository values must not be concatenated into shell commands without
strict validation and escaping.

Detailed requirements are maintained in:

`codex/engineering/structured-command-policy.md`

---

## 14. Filesystem isolation

The runner filesystem must expose only the files required for the job.

The runner must not have access to:

- the entire host filesystem;
- the user's home directory;
- unrelated source repositories;
- controller source code unless explicitly required;
- controller configuration;
- publisher workspaces;
- credential stores;
- SSH directories;
- cloud configuration directories;
- browser profiles;
- unrelated temporary directories;
- production data.

Preferred runner mounts include:

- one immutable or controlled source workspace;
- one bounded writable workspace;
- approved read-only tool assets;
- approved temporary directories.

Mount modes must be explicit.

---

## 15. Workspace mutability

Analysis jobs should use read-only source snapshots when mutation is not needed.

Remediation jobs may use a writable copy of the authorized source snapshot.

A writable remediation workspace must:

- begin from the verified immutable snapshot;
- be unique to the attempt;
- contain no unrelated user changes;
- be isolated from other jobs;
- record all changed files;
- be destroyed or retained according to the authorized cleanup policy.

A runner must not modify the trusted controller's source-acquisition cache
directly.

---

## 16. Process isolation

Runner processes must be isolated from host and controller processes.

Controls should include, where supported:

- separate process namespace;
- bounded process count;
- no host process namespace;
- no privileged execution;
- no host PID access;
- no ptrace access to trusted processes;
- restricted system calls;
- non-root execution;
- restricted Linux capabilities;
- bounded execution time.

A runner must not be able to inspect or signal trusted controller or publisher
processes.

---

## 17. Container-runtime isolation

The runner must not receive access to:

- the Docker socket;
- containerd sockets;
- Kubernetes administrative credentials;
- host container-runtime APIs;
- privileged container mode;
- host device access;
- host networking;
- arbitrary bind mounts.

Access to the container runtime would allow an untrusted repository to escape
the intended boundary and must be treated as a critical containment failure.

---

## 18. Network isolation

Network access must be disabled by default.

When a job requires network access, the runner profile must define:

- approved destinations;
- approved ports;
- approved protocols;
- DNS behavior;
- proxy behavior;
- timeout;
- download-size limits;
- request limits;
- credential mechanism.

Repository-controlled code must not select arbitrary destinations.

Unexpected outbound network attempts must be blocked and recorded when
practical.

---

## 19. Dependency installation boundary

Dependency installation may require controlled network and registry access.

The installation design should prefer:

- lockfile-respecting installation;
- immutable versions;
- approved registries;
- dependency proxies;
- read-only or short-lived credentials;
- lifecycle-script restrictions where compatible;
- bounded caches;
- reproducible package-manager versions.

When lifecycle scripts are required, they remain untrusted and must execute only
inside the runner.

Registry credentials must not remain available after the installation stage
unless explicitly required.

---

## 20. Cloud metadata isolation

The runner must not access cloud metadata or workload identity endpoints unless
a specific authorized job requires a narrowly scoped identity.

The default policy must block access to:

- instance metadata services;
- cloud credential endpoints;
- host workload identities;
- cluster service-account credentials;
- ambient cloud SDK credentials.

Hostile-runner tests should verify that common metadata endpoints are
unreachable under the applicable runner profile.

---

## 21. Environment isolation

The runner environment must use an allowlist.

It must not inherit the complete controller or host environment.

Allowed variables should be limited to:

- deterministic locale settings;
- approved tool configuration;
- job identifiers;
- non-secret source identity;
- approved temporary paths;
- explicitly authorized short-lived credential references;
- controlled network settings.

Variable names and values supplied by repository configuration must be treated
as untrusted.

---

## 22. Toolchain isolation

Tools supplied to the runner must be versioned and attributable.

Tool sources may include:

- approved runner images;
- approved package-manager installations;
- approved analyzer packages;
- approved transformation engines;
- approved compiler toolchains.

The runner must not silently fall back to undeclared host-global tools.

When a required executable is unavailable, the job must report:

- `unavailable`;
- `configuration_required`;
- or another explicit failure state.

It must not bypass the gate or report success.

---

## 23. Runner image requirements

A runner image should be identified by an immutable digest.

The image definition should document:

- base image;
- operating system;
- installed tools;
- tool versions;
- default user;
- capabilities;
- filesystem configuration;
- network assumptions;
- entry point;
- known limitations.

Mutable image tags must not be the only identity used for security-sensitive
execution.

Image provenance and vulnerability status should be evaluated according to the
tooling and security policies.

---

## 24. Resource limits

Every runner job must have bounded resources.

Relevant limits include:

- wall-clock timeout;
- CPU;
- memory;
- process count;
- filesystem size;
- output size;
- artifact size;
- network requests;
- download size;
- open files.

A resource-limit failure must be reported explicitly.

It must not be converted into:

- zero findings;
- successful analysis;
- complete coverage;
- a passed gate.

---

## 25. Output boundary

Runner output is untrusted.

The controller must validate:

- output type;
- schema;
- size;
- encoding;
- job identity;
- source identity;
- artifact hashes;
- expected artifact names;
- exit status;
- completion status.

Unbounded standard output and standard error must not be injected directly into
reports, logs, prompts, or database fields.

Output must be redacted before storage or display.

---

## 26. Artifact transfer

Artifacts transferred from the runner may include:

- normalized analyzer output;
- bounded logs;
- coverage records;
- patches;
- test reports;
- build reports;
- generated metadata.

Every artifact should record:

- job ID;
- source snapshot identity;
- artifact type;
- content hash;
- size;
- creation time;
- producing tool;
- tool version.

Artifacts must not be trusted solely because they came from the approved runner.

The controller or publisher must independently validate security-sensitive
artifacts.

---

## 27. Patch boundary

A remediation patch is produced in the untrusted runner but is not trusted for
publication.

The controller must validate:

- expected transformation identity;
- expected rewrite count;
- changed-file allowlist;
- patch format;
- patch hash;
- file-size limits;
- prohibited file paths;
- generated-file policy;
- gate results;
- deterministic regeneration where required.

The trusted publisher must independently validate the patch before applying it.

The publisher must reject any patch that differs from the verified hash.

---

## 28. Database boundary

The control-plane database is trusted infrastructure.

The untrusted runner must not connect directly to it.

Runner results must reach the database only through trusted controller
validation.

Database credentials must not be placed in:

- runner environment variables;
- runner filesystems;
- repository configuration;
- analyzer configuration;
- generated patches;
- reports.

Database operations must maintain tenant scoping and append-only audit behavior.

---

## 29. Audit boundary

Security-relevant boundary crossings must produce audit events.

Relevant events include:

- authorization validation;
- denylist enforcement;
- source acquisition;
- source snapshot creation;
- runner job creation;
- runner profile selection;
- runner start;
- runner completion;
- runner failure;
- network-policy decision;
- credential capability use;
- artifact transfer;
- patch validation;
- publication request;
- publication success;
- publication rejection;
- cleanup;
- containment failure.

Audit events must not contain secret values.

---

## 30. Tenant and account isolation

Where DCAv2 supports multiple tenants or accounts, isolation must apply to:

- repository connections;
- credentials;
- source snapshots;
- evidence;
- findings;
- review records;
- remediation authorizations;
- runner workspaces;
- artifacts;
- publication requests;
- audit records.

A job for one tenant must not access data or credentials belonging to another
tenant.

Tenant identity must be validated at every trusted boundary.

---

## 31. Cross-repository isolation

An organization-wide analysis job may require multiple repositories.

Each repository must still pass:

- exact identity validation;
- owner-scope validation;
- denylist validation;
- authorization validation;
- immutable revision resolution.

Repositories must not be added to an analysis epoch merely because another
repository references them.

A prohibited or unavailable repository must remain excluded and must be
represented as incomplete coverage rather than silently ignored.

---

## 32. External service boundaries

Package registries, artifact registries, telemetry systems, and hosted analysis
services are external trust boundaries.

Interactions must define:

- data transmitted;
- credentials used;
- authorization scope;
- retention;
- failure behavior;
- response validation;
- audit requirements.

External service output remains untrusted.

Source code must not be transmitted to an external service without explicit
authorization and completed security, confidentiality, and licensing review.

---

## 33. Prompt-injection boundary

Repository content and runner output may contain prompt-injection attempts.

Neither may:

- modify job authorization;
- alter access policy;
- request secrets;
- change runner profiles;
- authorize network access;
- authorize publication;
- change expected gates;
- modify governance files.

The controller must derive authority only from trusted governance and current
human authorization.

Detailed behavior is defined in:

`codex/core/09-prompt-injection-policy.md`

---

## 34. Cleanup boundary

Every runner job must have an explicit cleanup policy.

Cleanup should cover:

- containers;
- processes;
- temporary workspaces;
- temporary files;
- temporary network rules;
- temporary credentials;
- package-manager configuration;
- test databases created for repository execution;
- generated artifacts not retained by policy.

Cleanup applies only to resources created for the job.

A cleanup failure must be reported and audited.

The system must not claim that cleanup succeeded without verifying the relevant
resources.

---

## 35. Containment failure

A containment failure includes evidence that an untrusted job accessed or may
have accessed:

- trusted credentials;
- controller files;
- publisher files;
- unrelated repositories;
- host processes;
- host container-runtime APIs;
- unauthorized networks;
- cloud metadata;
- control-plane databases;
- another tenant's data.

When a containment failure is suspected:

1. Stop the affected job.
2. Stop scheduling equivalent jobs on the affected runner profile.
3. Revoke or rotate potentially exposed credentials through an authorized
   incident process.
4. Preserve bounded evidence.
5. Avoid reproducing exposed secrets.
6. Record the event.
7. Report affected scopes.
8. Require human review before resuming the profile.

Containment failure must not be reported as an ordinary analyzer failure.

---

## 36. Boundary enforcement statuses

Each control must use an explicit status:

- `enforced`;
- `partially_enforced`;
- `unavailable`;
- `failed`;
- `not_applicable`;
- `deferred`;
- `unverified`.

Examples of controls include:

- non-root execution;
- network denial;
- credential absence;
- Docker socket denial;
- host filesystem denial;
- process isolation;
- resource limits;
- output limits;
- metadata-service denial;
- trusted publisher separation.

A configured control is not necessarily an enforced control.

---

## 37. Security testing requirements

Runner and publisher boundaries should be validated with hostile fixtures.

Tests should attempt, where safely supported, to:

- read unauthorized environment variables;
- read host files;
- access SSH credentials;
- access Git credentials;
- reach the Docker socket;
- reach cloud metadata;
- connect to unauthorized network destinations;
- access unrelated workspaces;
- spawn excessive processes;
- consume excessive memory;
- emit unbounded output;
- modify prohibited paths;
- smuggle unexpected files into a patch;
- alter patch content after verification;
- invoke provider writes from the runner.

Tests must use synthetic secrets and non-destructive targets.

---

## 38. Threat-model limitations

Security claims must identify their threat-model boundaries.

Examples of limitations may include:

- container isolation is not equivalent to a hardened virtual machine;
- host-kernel vulnerabilities may remain outside application controls;
- DNS filtering may not cover every covert channel;
- package-manager behavior may vary by version;
- platform-specific filesystem semantics may differ;
- local development profiles may be weaker than production profiles.

Unknown or untested threats must remain explicit.

DCAv2 must not claim complete sandbox security.

---

## 39. Development and production profiles

DCAv2 may define separate runner profiles for:

- local development;
- CI validation;
- production analysis;
- remediation;
- hostile-fixture testing.

Each profile must document:

- intended use;
- enabled controls;
- unavailable controls;
- credential capabilities;
- network policy;
- resource limits;
- threat-model limitations.

A weaker development profile must not be represented as production-equivalent.

Publication must always use the trusted publisher boundary.

---

## 40. Architecture evolution

Trust-boundary changes require explicit architecture review.

Examples include:

- giving a runner new credentials;
- enabling runner network access;
- adding an external analysis service;
- merging controller and publisher roles;
- exposing database access to workers;
- changing artifact-transfer mechanisms;
- changing sandbox technology;
- permitting nested container execution.

Such changes require:

1. An explicit human-authorized objective.
2. Threat analysis.
3. Secret-handling review.
4. Authorization review.
5. Failure-mode analysis.
6. Updated hostile fixtures.
7. Updated security-control reporting.
8. An ADR.
9. A reviewable governance commit when policies change.

---

## 41. Fail-safe behavior

When a trust-boundary guarantee cannot be established:

- do not expose credentials;
- do not run repository-controlled code on the trusted host;
- do not permit external publication;
- do not enable unrestricted network access;
- do not connect the runner to the control-plane database;
- do not treat generated artifacts as trusted;
- classify the control as unavailable or unverified;
- stop the affected operation when the missing control is required.

Uncertainty about isolation must result in stronger containment or no execution.

---

## 42. Contract integrity

This document must not be modified during an implementation phase unless
governance or architecture modification is explicitly authorized.

Changes must not weaken isolation merely to:

- simplify dependency installation;
- make a test pass;
- access host-global tools;
- reuse controller credentials;
- avoid publisher revalidation;
- bypass an unavailable runner capability;
- accelerate external publication.

The implemented system, tests, reports, and this contract must describe the same
trust-boundary behavior.