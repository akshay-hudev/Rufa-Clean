# Runner Security Controls

This document defines the security controls required for DCAv2 execution
environments that process untrusted repositories, dependencies, configuration,
scripts, analyzers, builds, tests, generators, and transformations.

The runner is an untrusted execution zone.

Every runner job must be treated as though the repository may intentionally try
to escape isolation, obtain credentials, access unrelated data, contact
unauthorized systems, persist after completion, or manipulate its reported
results.

This document defines required controls and validation expectations. It does not
claim that every control is currently implemented or enforced.

This document must be applied together with:

- `codex/core/03-safety-invariants.md`;
- `codex/core/08-secret-handling-policy.md`;
- `codex/core/09-prompt-injection-policy.md`;
- `codex/architecture/trust-boundaries.md`;
- `codex/engineering/structured-command-policy.md`;
- `codex/engineering/testing-policy.md`;
- `codex/tests/security-control-matrix.yaml`.

---

## 1. Core principles

Runner security must be:

- deny-by-default;
- isolated from trusted credentials;
- isolated from trusted control-plane data;
- isolated from unrelated repositories;
- non-privileged;
- resource-bounded;
- network-restricted;
- filesystem-restricted;
- process-bounded;
- observable;
- auditable;
- independently tested;
- explicit about unavailable controls.

A configured control must not be reported as enforced until its behavior has
been validated.

A container boundary alone must not be described as complete sandbox security.

---

## 2. Runner responsibilities

The runner may execute authorized repository-controlled operations such as:

- dependency installation;
- package-manager commands;
- repository scripts;
- analyzers;
- parsers;
- compilers;
- type checking;
- linting;
- builds;
- unit tests;
- integration tests;
- code generation;
- service startup;
- transformations;
- patch generation.

The runner must not perform trusted control-plane or publication decisions.

---

## 3. Runner prohibitions

The runner must not:

- approve repository access;
- approve a finding;
- create a human disposition;
- authorize remediation;
- authorize publication;
- access publisher credentials;
- access controller database credentials;
- push branches;
- create pull requests;
- merge code;
- modify repository settings;
- perform repository operations excluded for the requested target role;
- modify DCAv2 governance;
- write authoritative audit records directly;
- access unrelated tenant data;
- access the host container runtime;
- run with unrestricted host privileges.

---

## 4. Threat model

The runner threat model must assume that untrusted content may attempt to:

- read environment variables;
- read mounted credentials;
- inspect process arguments;
- access host files;
- access other workspaces;
- reach cloud metadata services;
- reach internal services;
- reach package registries outside policy;
- reach source-control providers;
- access the Docker socket;
- create privileged child processes;
- exploit native dependencies;
- exploit the host kernel;
- create symbolic-link escapes;
- leave background processes running;
- consume excessive CPU, memory, disk, or processes;
- emit unbounded output;
- manipulate test output;
- fabricate analyzer results;
- inject instructions into logs;
- persist malicious artifacts in shared caches.

The threat model must also identify limitations that the selected isolation
technology cannot fully mitigate.

---

## 5. Runner profiles

DCAv2 may define several runner profiles.

Examples include:

- `development`;
- `ci`;
- `analysis`;
- `dependency_install`;
- `remediation`;
- `integration_test`;
- `hostile_fixture`;
- `production`.

Each profile must define:

- intended use;
- isolation technology;
- image identity;
- user identity;
- filesystem policy;
- network policy;
- environment policy;
- credential capability;
- process limits;
- CPU limits;
- memory limits;
- disk limits;
- output limits;
- timeout policy;
- cleanup policy;
- known limitations;
- required security tests.

A weaker development profile must not be represented as production-equivalent.

---

## 6. Immutable runner identity

A runner environment should be identified by immutable configuration.

Applicable identity fields include:

- image digest;
- operating-system version;
- architecture;
- installed tool versions;
- entry-point version;
- security-profile version;
- command-registry version;
- network-policy version;
- filesystem-policy version.

Mutable image tags may be recorded for readability but must not be the only
security-sensitive identity.

Every job should record the runner profile and immutable image identity.

---

## 7. Non-root execution

Runner processes must execute as a non-root user unless a narrowly reviewed
bootstrap stage requires otherwise.

The effective runtime user must not have permission to:

- change host configuration;
- mount filesystems;
- create devices;
- modify container runtime configuration;
- access privileged host paths;
- change security profiles;
- alter network policy;
- inspect trusted processes.

Any temporary privileged setup stage must finish before repository-controlled
code becomes executable.

The final repository execution process must be non-root.

---

## 8. User and group isolation

Runner images should use a dedicated user and group.

The runner identity should:

- have no login shell unless required;
- own only bounded workspace paths;
- lack access to system credential stores;
- lack access to unrelated tool configuration;
- lack access to host user identifiers where practical;
- avoid shared writable directories across jobs.

File ownership must be validated when artifacts move between trust zones.

---

## 9. Linux capabilities

Runner containers must drop all unnecessary Linux capabilities.

The default should be:

```text
drop all capabilities
```

Any capability that remains must have:

- documented purpose;
- profile-specific justification;
- threat analysis;
- validation test;
- removal plan when temporary.

Capabilities such as `SYS_ADMIN`, `SYS_PTRACE`, `NET_ADMIN`, `DAC_OVERRIDE`,
and similar broad privileges must not be granted to repository-controlled
execution without exceptional explicit approval.

---

## 10. Privileged execution

Privileged containers are prohibited for repository-controlled execution.

The runner must not use:

- privileged mode;
- host PID namespace;
- host IPC namespace;
- host user namespace without reviewed isolation;
- unrestricted host devices;
- host network mode;
- broad bind mounts;
- container-runtime control sockets.

A repository requiring privileged execution is unsupported under the default
runner policy.

---

## 11. Seccomp and system calls

Where supported, runner profiles should apply a restrictive system-call policy.

The policy should deny unnecessary operations related to:

- mounting;
- kernel module loading;
- process tracing;
- namespace manipulation;
- raw sockets;
- device management;
- rebooting;
- keyring access;
- privileged scheduling;
- host administration.

A default container-runtime profile may be used initially, but it must not be
described as a hardened DCAv2 profile without validation.

Changes to the system-call policy require security testing.

---

## 12. Mandatory access controls

Where available, runner deployments should use an additional mandatory access
control mechanism such as:

- AppArmor;
- SELinux;
- another platform-supported sandbox policy.

The policy should restrict:

- filesystem paths;
- process capabilities;
- device access;
- network behavior where supported;
- interaction with host services.

The control's enforcement status must be tested in the actual deployment
environment.

A policy file existing in the repository is not proof that the runtime applies
it.

---

## 13. User namespaces

User namespaces may reduce the impact of container user privileges.

When used, the runner design must document:

- UID and GID mappings;
- host ownership implications;
- volume behavior;
- platform support;
- known kernel limitations;
- interaction with nested tooling;
- test coverage.

User namespaces do not replace filesystem, capability, network, and credential
controls.

---

## 14. Filesystem isolation

The runner must receive only the filesystem content required for its job.

The runner must not receive access to:

- the user's home directory;
- unrelated repositories;
- controller source or configuration;
- publisher workspaces;
- SSH directories;
- cloud configuration directories;
- browser profiles;
- credential stores;
- host temporary directories;
- production data;
- host package-manager configuration;
- host Git configuration.

Mounts must be explicit and recorded.

---

## 15. Read-only source snapshots

Analysis jobs should use read-only source snapshots whenever mutation is not
required.

A read-only analysis workspace should prevent:

- source modification;
- creation of Git objects;
- modification of repository configuration;
- mutation of source caches;
- persistence of generated files into the source snapshot.

Tools requiring writable output must use a separate bounded writable directory.

---

## 16. Writable remediation workspaces

Remediation jobs may use a writable copy of the authorized source snapshot.

The workspace must:

- begin from an immutable verified source identity;
- be unique to the job or attempt;
- contain no unrelated user changes;
- be isolated from other jobs;
- track every file change;
- have a maximum size;
- be destroyed or retained according to policy;
- never become the trusted publication workspace.

The trusted publisher must reacquire a clean source state independently.

---

## 17. Mount modes

Each mount must declare one mode:

- read-only;
- writable;
- executable;
- non-executable;
- device-free;
- temporary;
- artifact-output only.

Writable mounts should be minimized.

Source mounts should be non-executable where compatible with the required
workflow.

Secret mounts, when exceptionally authorized, must be read-only, narrowly
scoped, and removed after the stage that needs them.

---

## 18. Symbolic-link controls

The runner and controller must prevent symbolic links from escaping authorized
paths.

Controls must validate:

- source paths;
- artifact paths;
- temporary paths;
- changed-file paths;
- cache paths;
- output paths.

Validation must consider the resolved target rather than only the textual path.

Unexpected symbolic links must be reported and must block artifact promotion or
publication.

---

## 19. Filesystem quotas

Every runner job must have a bounded writable storage allocation.

Applicable limits include:

- workspace size;
- temporary-directory size;
- dependency-cache write size;
- artifact-output size;
- log size;
- generated-file count;
- inode count where supported.

A storage-limit failure must produce an explicit resource-exceeded result.

It must not become an analyzer success with incomplete output.

---

## 20. Temporary directories

Runner jobs must use isolated temporary directories.

Temporary directories must:

- be unique per job;
- have restrictive permissions;
- not be shared across tenants;
- not be inherited from the trusted host;
- have bounded size;
- be cleaned after execution;
- exclude trusted credentials;
- not survive job completion unexpectedly.

Temporary path names must not be accepted as authoritative artifact identity.

---

## 21. Process namespaces

Runner processes should execute in isolated process namespaces.

The runner must not be able to:

- inspect trusted host processes;
- inspect controller processes;
- inspect publisher processes;
- signal unrelated processes;
- attach debuggers to trusted processes;
- enumerate another tenant's job processes.

The actual namespace behavior must be validated with hostile tests.

---

## 22. Process limits

Each runner job must have a process-count limit.

The limit must apply to:

- direct child processes;
- descendants;
- shell pipelines;
- language-runtime workers;
- test-runner workers;
- background services.

Fork-bomb or process-exhaustion attempts must be contained.

Exceeding the process limit must terminate or fail the job explicitly.

---

## 23. Child-process cleanup

The runner supervisor must manage the full process tree.

At job completion, cancellation, timeout, or failure, it must:

1. Stop accepting new child processes where practical.
2. Send the configured graceful termination signal.
3. Wait for the configured grace period.
4. Force-terminate remaining descendants.
5. Verify that no job processes remain.
6. Record cleanup status.

Killing only the initial process is insufficient.

---

## 24. CPU limits

Every runner job must have a CPU limit appropriate to its profile.

Limits may include:

- CPU shares;
- CPU quota;
- maximum cores;
- execution timeout;
- throttling policy.

CPU exhaustion must not affect trusted controller or publisher availability
beyond documented shared-infrastructure limits.

The actual enforcement mechanism must be recorded.

---

## 25. Memory limits

Every runner job must have a memory limit.

The limit should account for:

- main processes;
- child processes;
- language runtimes;
- compiler workers;
- test workers;
- file-system cache behavior where applicable.

Out-of-memory termination must be reported as resource exhaustion.

It must not be reported as an ordinary analyzer result or successful empty
output.

---

## 26. Open-file and descriptor limits

Runner jobs should have bounded file descriptors and open files.

Limits should prevent:

- descriptor exhaustion;
- excessive socket creation;
- excessive pipe creation;
- interference with other jobs;
- unbounded file traversal.

Limit failures must remain explicit.

---

## 27. Execution timeouts

Every job must define:

- startup timeout;
- command timeout;
- idle timeout where applicable;
- job-level timeout;
- graceful shutdown period;
- forced shutdown period.

A timed-out job must not contribute successful required coverage or gate
completion.

Partial artifacts must be marked incomplete and untrusted.

---

## 28. Network disabled by default

Runner network access must be disabled by default.

Jobs that do not require network access must have no outbound network
capability.

Network denial should cover:

- public internet;
- internal services;
- source-control providers;
- package registries;
- cloud metadata;
- control-plane databases;
- trusted APIs;
- other tenant workloads.

A repository's attempt to contact an external system must not broaden policy.

---

## 29. Network profiles

When network access is required, the job must use an approved network profile.

A network profile must define:

- destination allowlist;
- port allowlist;
- protocol allowlist;
- DNS policy;
- proxy configuration;
- request timeout;
- connection limit;
- download limit;
- credential capability;
- logging and audit behavior;
- cleanup behavior.

Examples include:

- registry read-only;
- local test services only;
- approved package mirrors only;
- no network.

Repository-controlled values must not alter the selected profile.

---

## 30. DNS controls

DNS behavior must not permit policy bypass.

Where practical:

- resolve only through approved DNS;
- prevent direct access to unauthorized IP addresses;
- prevent rebinding from bypassing destination restrictions;
- validate resolved destinations;
- block internal and metadata address ranges unless explicitly allowed;
- limit query volume.

DNS allowlisting alone may be insufficient and must not be represented as a
complete egress boundary without validation.

---

## 31. Cloud metadata denial

Runner jobs must be unable to access cloud metadata and ambient identity
endpoints by default.

Tests should cover applicable addresses and platform endpoints, including:

- link-local metadata services;
- workload-identity endpoints;
- container-orchestrator service-account endpoints;
- host credential proxies.

The exact test targets must use safe synthetic or denied requests.

A production profile must record whether metadata denial is enforced,
partially enforced, unavailable, or unverified.

---

## 32. Internal service denial

Runner jobs must not access trusted internal systems unless a profile explicitly
permits a specific service.

Protected services include:

- PostgreSQL control-plane databases;
- audit databases;
- publisher APIs;
- secret managers;
- GitHub credential brokers;
- container runtimes;
- orchestration APIs;
- internal administration endpoints;
- unrelated test services.

Network segmentation must not rely only on secret authentication.

Unauthorized network reachability is itself a security failure.

---

## 33. Package registry access

Dependency installation may use a restricted registry profile.

The profile should enforce:

- approved registries;
- read-only package access;
- approved package scopes;
- download limits;
- timeout limits;
- short-lived credentials;
- no credential persistence;
- no unrelated provider access.

Package registry access must not imply general internet access.

---

## 34. Credential absence

The default runner environment must contain no trusted credentials.

The runner must not inherit:

- GitHub tokens;
- GitHub App keys;
- SSH keys;
- SSH agent sockets;
- Git credential helpers;
- cloud credentials;
- database credentials;
- provider API keys;
- production secrets;
- publisher credentials;
- controller credentials.

Credential absence must be tested using synthetic sentinel values and expected
path checks.

---

## 35. Narrow temporary credentials

A runner may receive a temporary credential only when:

- the active authorization permits it;
- the capability requires it;
- the credential is narrowly scoped;
- the lifetime is bounded;
- the network destination is restricted;
- the injection method is controlled;
- logs are redacted;
- cleanup is verified;
- the credential cannot publish or administer unrelated resources.

The runner must never receive trusted publication credentials.

---

## 36. Environment allowlist

Runner environments must be constructed from a safe allowlist.

Permitted variables may include:

- deterministic locale;
- controlled `PATH`;
- approved temporary paths;
- job identifiers;
- source snapshot identity;
- approved tool configuration;
- bounded non-secret options;
- authorized short-lived registry credential references.

The runner must not inherit the complete controller, CI, or host environment.

---

## 37. Dynamic-loader variables

The environment policy must remove or control variables that can alter process
loading or execution.

Examples include platform-specific variables affecting:

- dynamic libraries;
- interpreter startup;
- module paths;
- shell startup;
- debugger injection;
- tracing;
- runtime preload behavior.

Repository content must not use inherited loader configuration to execute code
outside the approved workspace or toolchain.

---

## 38. Toolchain control

Runner tools must be declared and versioned.

Required tools should come from:

- an approved runner image;
- an approved package installation;
- an approved immutable binary;
- an approved project dependency inside the isolated job.

The runner must not fall back silently to host-global tools.

A missing required tool must produce an unavailable or
configuration-required result.

---

## 39. Package lifecycle scripts

Package lifecycle scripts are arbitrary code execution.

When installation disables lifecycle scripts, the resulting compatibility
limitation must be recorded.

When lifecycle scripts are required:

- they must execute only inside the runner;
- network access must remain profile-bound;
- credentials must remain restricted;
- filesystem access must remain bounded;
- resource limits must apply;
- output must be bounded;
- hostile behavior must be assumed.

Lifecycle scripts must never execute in the trusted controller or publisher.

---

## 40. Repository configuration as code

Repository configuration may execute code.

Examples include:

- JavaScript or TypeScript configuration files;
- build files;
- package-manager hooks;
- compiler plugins;
- test setup files;
- framework configuration;
- analyzer plugins.

Tools that evaluate such configuration must run in the untrusted runner.

The controller must not import executable repository configuration directly.

---

## 41. Git configuration and hooks

Runner source snapshots should not inherit trusted Git configuration.

Controls should prevent:

- use of host credential helpers;
- use of host SSH configuration;
- execution of repository hooks;
- use of credential-bearing remotes;
- unsafe global Git aliases;
- repository configuration that invokes external helpers.

Git hooks must be disabled or isolated.

A repository-provided hook must not receive credentials or trusted filesystem
access.

---

## 42. Docker socket denial

The runner must not have access to:

- `/var/run/docker.sock`;
- containerd sockets;
- Podman control sockets;
- Kubernetes administrative sockets;
- equivalent container-runtime APIs.

Tests must verify both:

- the path is unavailable;
- connection to any known mounted runtime socket is denied.

Access to a container-runtime socket must be treated as a containment failure.

---

## 43. Device denial

Runner jobs must not receive unrestricted host devices.

Device access should be denied unless a narrowly justified capability requires a
specific safe device.

Examples normally prohibited include:

- raw disks;
- kernel memory;
- virtualization devices;
- host GPUs without reviewed isolation;
- USB devices;
- host terminals.

A device requirement must be documented in the runner profile and tested.

---

## 44. Shared-memory controls

Shared-memory configuration must be bounded and isolated.

The runner must not share host IPC resources.

Large shared-memory allocations must count toward resource policy where
supported.

Tools requiring large shared memory must document the requirement and failure
behavior.

---

## 45. Cache isolation

Caches must not become cross-job or cross-tenant trust channels.

A cache policy must define:

- read access;
- write access;
- tenant scope;
- package-manager scope;
- cache key;
- integrity validation;
- poisoning resistance;
- secret exclusion;
- retention;
- cleanup.

Untrusted cache entries must not be promoted into trusted toolchain images
without validation.

---

## 46. Dependency cache safety

Dependency caches should be keyed by applicable:

- package manager;
- package-manager version;
- lockfile digest;
- architecture;
- operating system;
- registry identity;
- security profile.

A cache hit must not bypass lockfile, integrity, registry, or license policy.

Private packages from one tenant must not be visible to another tenant.

---

## 47. Output bounding

All runner output must be bounded.

Limits should apply to:

- standard output;
- standard error;
- individual lines;
- structured result files;
- test reports;
- analyzer reports;
- generated patches;
- file counts;
- artifact archives.

When output exceeds a limit:

- mark the output truncated;
- preserve the applicable failure;
- reject incomplete structured results;
- prevent direct injection into reports or prompts.

---

## 48. Output encoding

Runner output may contain invalid or hostile encoding.

The controller must handle:

- invalid UTF-8;
- binary output;
- terminal escape sequences;
- control characters;
- extremely long lines;
- nested archives;
- decompression bombs;
- misleading filenames.

Output must be treated as data.

Rendering must not execute terminal or markup control behavior.

---

## 49. Artifact policy

Every promoted artifact must have:

- job ID;
- tenant identity;
- source snapshot identity;
- artifact type;
- size;
- content hash;
- producer;
- producer version;
- creation time;
- validation status;
- redaction status.

Artifacts must be stored only in approved locations.

An artifact must not be trusted solely because it was generated inside an
approved runner.

---

## 50. Archive safety

Archive artifacts must be validated before extraction.

Validation should reject or bound:

- path traversal;
- absolute paths;
- symbolic-link escape;
- hard-link escape;
- excessive file count;
- excessive uncompressed size;
- nested archive expansion;
- device files;
- unsafe file modes.

Extraction must occur only in an isolated destination.

---

## 51. Patch validation

Patches produced by the runner are untrusted.

Before a patch may become publication-eligible, trusted validation must check:

- patch format;
- base commit;
- repository identity;
- changed-file allowlist;
- path safety;
- file modes;
- symbolic links;
- binary files;
- patch size;
- canonical hash;
- expected transformation;
- gate results;
- secret exposure.

The runner must not publish its own patch.

---

## 52. Result validation

The controller must validate runner results against a machine-readable schema.

Validation must cover:

- job identity;
- command identity;
- source snapshot;
- runner profile;
- status;
- exit code;
- timeout;
- resource exhaustion;
- tool version;
- artifacts;
- changed files;
- result digest;
- output bounds.

Malformed results must produce an explicit failure.

They must not be interpreted as successful empty analysis.

---

## 53. Audit events

Runner execution must produce trusted audit events for applicable stages such
as:

- job requested;
- authorization validated;
- runner profile selected;
- source mounted;
- network profile applied;
- command started;
- command completed;
- command failed;
- timeout;
- resource exhaustion;
- output truncation;
- artifact received;
- artifact rejected;
- cleanup started;
- cleanup completed;
- cleanup failed;
- containment failure suspected.

The runner may emit untrusted execution data, but the trusted controller must
validate it before recording authoritative audit events.

---

## 54. Logging

Runner logs must be bounded and redacted.

Logs may include:

- job ID;
- command ID;
- runner profile;
- tool version;
- start and completion time;
- exit status;
- resource status;
- artifact identity;
- failure category;
- security-control result.

Logs must not include:

- trusted credentials;
- full environment dumps;
- private keys;
- authentication headers;
- credential-bearing URLs;
- unbounded source code;
- unnecessary customer data;
- secret-bearing configuration.

---

## 55. Cleanup

Every runner job must define cleanup behavior.

Cleanup should cover:

- processes;
- descendants;
- workspaces;
- temporary files;
- temporary credentials;
- network rules;
- package-manager configuration;
- test databases;
- local services;
- generated artifacts not retained;
- cache write finalization;
- container or sandbox instances.

Cleanup must affect only job-created resources.

Cleanup success must be verified where practical.

---

## 56. Cleanup failure

A cleanup failure must:

- remain visible;
- identify the retained resource;
- identify the tenant and job;
- identify possible credential or data exposure;
- block workspace reuse when safety is uncertain;
- create an audit event;
- trigger human review when risk is material.

A job with unresolved cleanup failure must not be reported as fully successful.

---

## 57. Workspace reuse

Runner workspaces should not be reused across unrelated jobs.

Any reuse strategy must prove:

- tenant isolation;
- source-state reset;
- process termination;
- temporary-file cleanup;
- credential cleanup;
- network-state cleanup;
- cache separation;
- artifact separation.

The safe default is one fresh workspace per job or attempt.

---

## 58. Runner reuse

Long-lived runner processes or nodes require additional controls.

The design must address:

- job-to-job contamination;
- memory residue;
- temporary files;
- process cleanup;
- credential residue;
- network state;
- cache poisoning;
- tenant scheduling;
- compromised-runner retirement.

A runner suspected of compromise must be quarantined and replaced before
processing additional jobs.

---

## 59. Compromise response

When runner compromise is suspected:

1. Stop the job.
2. Stop scheduling new jobs on the affected runner.
3. Preserve bounded forensic evidence.
4. Avoid exposing additional credentials.
5. Revoke any temporary credential that may have been exposed.
6. Identify affected tenant and source scopes.
7. Destroy or quarantine the runner.
8. Record the incident.
9. Validate adjacent trusted boundaries.
10. Require human review before restoring the profile.

Do not continue merely because the command produced expected output.

---

## 60. Security-control statuses

Every runner control must use one explicit status:

- `enforced`;
- `partially_enforced`;
- `failed`;
- `unavailable`;
- `unsupported`;
- `not_applicable`;
- `deferred`;
- `unverified`.

Only `enforced` may satisfy a required security control.

A configured but untested control must be `unverified`.

A control unavailable on a platform must remain `unavailable`, not passed.

---

## 61. Security-control matrix

Runner controls must be represented in:

`codex/tests/security-control-matrix.yaml`

The matrix should identify:

- control ID;
- runner profile;
- requirement;
- enforcement mechanism;
- validation test;
- expected result;
- actual result;
- status;
- last verified time;
- limitations;
- owning phase.

The matrix must reflect executed evidence rather than intended configuration.

---

## 62. Required baseline controls

A production repository-execution profile should require, at minimum:

- non-root execution;
- no privileged mode;
- restricted capabilities;
- no container-runtime socket;
- no host PID namespace;
- no host network;
- no trusted credentials;
- explicit environment allowlist;
- explicit filesystem mounts;
- bounded writable storage;
- network disabled or allowlisted;
- CPU limit;
- memory limit;
- process limit;
- execution timeout;
- output limit;
- process-tree cleanup;
- workspace cleanup;
- artifact validation;
- audit recording.

Any unavailable required control must block the affected production capability.

---

## 63. Hostile fixture tests

Hostile fixtures should attempt to:

- read synthetic environment secrets;
- read synthetic host credential files;
- access the user's home directory;
- access unrelated workspaces;
- access the Docker socket;
- access cloud metadata;
- access an unauthorized internal service;
- access an unauthorized public destination;
- spawn excessive processes;
- consume excessive memory;
- fill writable storage;
- emit excessive output;
- leave a background process;
- create path-traversal artifacts;
- create symbolic-link escapes;
- manipulate Git hooks;
- load malicious configuration;
- inject instructions into diagnostics.

Tests must use synthetic secrets and non-destructive targets.

---

## 64. Credential-canary tests

Credential-isolation tests should use synthetic canary values.

The test should verify that the runner cannot obtain the canary through:

- environment variables;
- mounted files;
- process arguments;
- SSH agent access;
- Git credential helpers;
- cloud metadata;
- temporary directories;
- logs;
- caches;
- provider SDK defaults.

Canary values must never be real credentials.

---

## 65. Network-denial tests

Network tests should verify:

- public internet denial;
- internal service denial;
- cloud metadata denial;
- source-control provider denial when not allowed;
- package-registry denial when not allowed;
- destination allowlist enforcement when enabled;
- direct IP denial;
- DNS-based bypass resistance where practical.

A single failed HTTP request does not prove complete network isolation.

The test scope and limitations must be documented.

---

## 66. Filesystem-denial tests

Filesystem tests should attempt to access:

- host home paths;
- controller paths;
- publisher paths;
- credential paths;
- unrelated repository paths;
- runtime sockets;
- device paths;
- parent directories;
- symbolic-link targets outside the workspace.

Tests must verify both read and write denial where applicable.

---

## 67. Resource-limit tests

Resource tests should verify:

- CPU throttling or bounded execution;
- memory termination;
- process-count enforcement;
- file-descriptor limits;
- writable-disk limits;
- timeout enforcement;
- output truncation;
- cleanup after resource termination.

Resource tests must be designed to avoid destabilizing shared development
infrastructure.

---

## 68. Process-cleanup tests

Process-cleanup tests should start a controlled background child process and
verify that it does not survive:

- normal job completion;
- command failure;
- timeout;
- cancellation;
- runner shutdown.

The test must verify the descendant, not only the original parent process.

---

## 69. Git-hook tests

Git-hook tests should verify that repository-provided hooks cannot execute in
trusted source-acquisition or publication contexts.

Runner-side tests should verify that any permitted Git behavior remains:

- isolated;
- credential-free;
- workspace-bounded;
- unable to affect trusted Git state.

Synthetic hooks should create harmless marker files only within controlled test
paths.

---

## 70. Artifact-escape tests

Artifact tests should attempt to produce:

- absolute paths;
- parent-directory traversal;
- symbolic links;
- hard links;
- device files;
- excessive file counts;
- oversized archives;
- nested archives;
- unexpected binary files;
- prohibited changed files.

The artifact collector must reject or safely contain the output.

---

## 71. Prompt-injection tests

Runner diagnostics and artifacts may contain instructions directed at Codex or
operators.

Tests should verify that such content cannot:

- change authorization;
- modify command selection;
- request credentials;
- broaden network access;
- modify policy;
- trigger publication;
- alter reported test status.

The content must remain untrusted data in reports and evidence.

---

## 72. Platform differences

Security controls may differ across:

- Linux;
- macOS development environments;
- Windows development environments;
- CI providers;
- Kubernetes;
- local Docker;
- virtual machines.

Each profile must document:

- controls available;
- controls unavailable;
- compensating controls;
- threat-model limitations;
- production equivalence.

A local macOS or Windows container profile must not be assumed to enforce the
same kernel controls as a production Linux runner.

---

## 73. Container versus virtual-machine isolation

Container isolation may be appropriate for many workflows, but it shares the
host kernel.

A virtual-machine or stronger sandbox may be required when:

- hostile repository risk is high;
- native code is executed;
- stronger tenant isolation is required;
- kernel attack surface is unacceptable;
- compliance requires stronger separation;
- production publication depends on higher-assurance execution.

The decision must be evidence-based and documented through an ADR when it
changes the long-lived architecture.

---

## 74. Local development profile

A local development profile may have weaker controls.

It must clearly identify:

- missing production controls;
- host dependencies;
- credential risks;
- network differences;
- filesystem differences;
- unsupported security claims.

A development profile must not process sensitive external repositories when its
controls are insufficient for the authorized threat model.

---

## 75. CI profile

A CI runner profile must account for:

- CI-provided credentials;
- shared runner behavior;
- job isolation;
- cache sharing;
- artifact handling;
- service containers;
- provider metadata;
- environment inheritance;
- workflow permissions.

Repository-controlled CI configuration must not automatically define trusted
DCAv2 runner policy.

---

## 76. Production profile

A production profile must have:

- immutable runner identity;
- enforced isolation controls;
- controlled scheduling;
- tenant isolation;
- restricted network;
- restricted filesystem;
- no trusted credentials;
- bounded resources;
- security monitoring;
- cleanup verification;
- hostile-fixture validation;
- incident response;
- documented residual risk.

Production status requires actual validation in the production-equivalent
environment.

---

## 77. Runner image changes

Runner image changes require review of:

- base image;
- installed packages;
- tool versions;
- default user;
- capabilities;
- entry point;
- filesystem layout;
- network tools;
- debugging tools;
- package-manager behavior;
- vulnerability status;
- license implications.

Required security and capability tests must run before the new image becomes
authoritative.

---

## 78. Vulnerability management

Runner images and isolation dependencies must be reviewed for relevant
vulnerabilities.

The review should determine:

- affected component;
- exact version;
- exploitability from repository-controlled code;
- availability of fixes;
- compatibility impact;
- mitigation;
- residual risk.

A vulnerable runner profile may need to be disabled until repaired.

Vulnerability count alone must not replace reachability and severity analysis.

---

## 79. Observability

Runner observability should include bounded metrics such as:

- job count;
- status;
- duration;
- CPU use;
- peak memory;
- disk use;
- process-limit events;
- timeout events;
- output truncation;
- network-policy violations;
- cleanup failures;
- security-control failures.

Metrics must not contain secret values or unbounded source identifiers.

---

## 80. Audit and reporting

A phase report involving runner work must state:

- runner profiles changed;
- image identities;
- controls implemented;
- controls tested;
- controls failed;
- controls unavailable;
- hostile fixtures used;
- platform tested;
- resource limits;
- network policy;
- credential policy;
- cleanup results;
- known limitations;
- residual risks.

The report must distinguish configuration from enforcement.

---

## 81. Capability reporting

Runner capability must be reported per control and profile.

Examples include:

- non-root execution;
- capability dropping;
- seccomp enforcement;
- filesystem isolation;
- network denial;
- metadata denial;
- credential absence;
- process isolation;
- process-count limits;
- memory limits;
- disk limits;
- output limits;
- cleanup;
- hostile-fixture resistance.

A running container does not prove these capabilities.

---

## 82. Prohibited practices

The following practices are prohibited:

- privileged repository execution;
- Docker socket access;
- host network mode;
- host PID namespace;
- mounting the user's home directory;
- mounting trusted credential directories;
- passing publisher credentials to the runner;
- passing controller database credentials to the runner;
- inheriting the complete host environment;
- unrestricted outbound network access;
- unbounded CPU, memory, processes, disk, or output;
- trusting runner-generated patches without validation;
- treating container configuration as proof of enforcement;
- reusing compromised runners;
- reporting unavailable controls as passed;
- using host-global tools as an undeclared fallback.

---

## 83. Fail-safe behavior

When runner isolation, credential absence, network policy, filesystem policy,
resource enforcement, or cleanup cannot be established confidently:

- do not execute untrusted repository code;
- do not expose credentials;
- do not enable unrestricted network access;
- do not publish runner output;
- do not report the control as enforced;
- preserve safe diagnostic evidence;
- mark the capability blocked, unavailable, failed, or unverified;
- identify the required control or validation;
- stop the affected high-risk workflow.

Runner uncertainty must reduce execution authority.

---

## 84. Policy integrity

This document must not be modified during implementation unless engineering or
governance modification is explicitly authorized.

Changes require:

1. Identification of the runner-security problem.
2. Review against permanent safety invariants.
3. Review of trust-boundary and credential implications.
4. Review of filesystem, network, and process isolation.
5. Review of platform-specific limitations.
6. Updated hostile-fixture tests.
7. Updated security-control matrix.
8. A reviewable governance commit.
9. An ADR when the change alters long-lived sandbox, container, virtual-machine,
   credential, network, or isolation architecture.

This policy must not be weakened to simplify builds, expose host tooling,
provide runner credentials, bypass isolation, or conceal unavailable controls.
