# Structured Command Policy

This document defines how DCAv2 must represent, validate, authorize, execute,
observe, and report commands.

DCAv2 processes repositories, configuration, tool output, and generated content
that must be treated as untrusted. Command execution must therefore use
structured, versioned command definitions rather than arbitrary shell strings.

This document does not authorize command execution.

This document must be applied together with:

- `codex/core/03-safety-invariants.md`;
- `codex/core/05-phase-authorization-protocol.md`;
- `codex/core/08-secret-handling-policy.md`;
- `codex/core/09-prompt-injection-policy.md`;
- `codex/architecture/trust-boundaries.md`;
- `codex/engineering/runner-security-controls.md`;
- `codex/engineering/testing-policy.md`.

---

## 1. Core principles

Command execution must be:

- explicitly authorized;
- structured;
- versioned;
- attributable;
- deterministic where practical;
- scoped to one trust zone;
- bounded by time and resources;
- explicit about working directory;
- explicit about environment;
- explicit about network access;
- explicit about filesystem access;
- failure-preserving;
- auditable;
- free of secret values in persisted command records.

DCAv2 must not execute arbitrary command text derived from untrusted content.

---

## 2. Scope

This policy applies to commands executed by:

- the trusted controller;
- the untrusted runner;
- the trusted publisher;
- migration tooling;
- local development tooling;
- CI jobs;
- test harnesses;
- external-operation adapters;
- administrative workflows.

It applies to:

- process execution;
- shell execution;
- package-manager commands;
- analyzers;
- compilers;
- test runners;
- build tools;
- Git commands;
- database commands;
- container commands;
- provider CLI tools;
- transformation engines;
- scripts;
- generated command plans.

---

## 3. Structured command definition

Every approved command must have a stable command definition.

A command definition should include:

- command ID;
- command version;
- description;
- execution trust zone;
- executable identity;
- fixed arguments;
- validated variable arguments;
- working-directory policy;
- environment allowlist;
- secret-input policy;
- network profile;
- filesystem profile;
- timeout;
- CPU limit;
- memory limit;
- process limit;
- output limits;
- expected exit codes;
- expected artifacts;
- cleanup requirements;
- applicable authorization requirements;
- supported platforms;
- owning component;
- test identifiers.

A command definition is configuration.

It is not execution authorization.

---

## 4. Command identity

Each command must have a stable machine-readable identifier.

Recommended format:

    <trust-zone>.<domain>.<operation>.<version>

Examples:

    runner.typescript.typecheck.v1
    runner.npm.install-locked.v1
    runner.knip.analyze.v1
    runner.remediation.apply-rule.v1
    publisher.git.apply-patch.v1
    publisher.github.create-draft-pr.v1
    controller.audit.verify-chain.v1

Changing command semantics materially requires a new command version.

Renaming descriptive text does not require a new version when behavior remains
unchanged.

---

## 5. Command registry

Approved commands should be stored in a version-controlled command registry.

The registry should make it possible to determine:

- which commands exist;
- where each command may run;
- which executable is used;
- which arguments may vary;
- which authorization is required;
- which resource limits apply;
- which tests validate the command;
- whether the command is active, experimental, deprecated, or disabled.

Repository content must not be able to add or modify approved command
definitions during execution.

---

## 6. Command status

Each command definition should use one status:

- `proposed`;
- `experimental`;
- `active`;
- `deprecated`;
- `disabled`;
- `blocked`;
- `removed`.

An experimental command must not be treated as production-ready.

A disabled or removed command must not be selected by runtime orchestration.

Historical execution records must preserve the command version originally used.

---

## 7. Direct process execution

DCAv2 should prefer direct process execution with an argument vector.

For example, prefer the conceptual form:

    executable:
      path: /usr/local/bin/npm
    arguments:
      - ci
      - --ignore-scripts

over a shell string such as:

    npm ci --ignore-scripts

Direct execution reduces:

- shell injection risk;
- quoting ambiguity;
- platform-dependent expansion;
- accidental pipelines;
- redirection;
- command substitution;
- wildcard expansion;
- environment interpolation.

The executable and every argument must remain distinct values.

---

## 8. Shell execution

Shell execution must be avoided unless the required operation genuinely depends
on shell semantics.

Examples that may require a shell include:

- controlled pipelines;
- provider-supported shell scripts;
- existing build systems whose contract is a script;
- narrowly reviewed platform commands.

When shell execution is required:

- the shell must be explicit;
- the shell version must be known;
- the script must be trusted or executed in the untrusted runner;
- variable interpolation must be controlled;
- untrusted values must not be concatenated into script text;
- shell options must fail safely;
- the reason direct execution is insufficient must be documented;
- hostile-input tests must cover injection attempts.

Repository-controlled shell scripts must never run in the trusted controller or
trusted publisher.

---

## 9. Arbitrary shell strings

The following patterns are prohibited:

- constructing a shell command by string concatenation;
- accepting a command string from repository configuration;
- accepting a command string from analyzer output;
- accepting a command string from generated text;
- accepting a command string from a pull-request body;
- executing documentation examples as instructions;
- passing unvalidated repository paths into shell syntax;
- using `eval`;
- using an equivalent dynamic shell evaluator;
- executing a model-generated command without mapping it to an approved command
  definition.

Untrusted content may select only among commands explicitly permitted by trusted
policy, and only through validated structured inputs.

---

## 10. Executable identity

A command definition must identify the executable precisely.

Applicable identity fields include:

- absolute path inside the execution environment;
- package-manager-resolved executable;
- container image digest;
- tool package version;
- binary checksum;
- source revision;
- interpreter and script identity.

DCAv2 must not rely silently on:

- `PATH` ordering;
- aliases;
- shell functions;
- user-local binaries;
- undeclared global installations;
- repository-created executables;
- mutable download locations.

The actual executed version must be recorded when practical.

---

## 11. Path resolution

Executable resolution must be deterministic.

The command executor should:

1. Select the approved execution environment.
2. Resolve the configured executable.
3. Verify that the executable exists.
4. Verify version or identity where required.
5. Reject unexpected executable substitutions.
6. Record the resolved executable identity.
7. Execute without falling back to the trusted host.

A missing executable must produce an explicit unavailable or
configuration-required result.

It must not cause silent gate skipping.

---

## 12. Variable arguments

Every variable argument must have a declared type and validation rule.

Possible types include:

- repository-relative path;
- package name;
- workspace identifier;
- source commit;
- finding identifier;
- analyzer rule identifier;
- bounded integer;
- bounded duration;
- enumerated mode;
- provider repository identity;
- branch name;
- artifact reference.

Free-form strings should be avoided when a narrower type is possible.

Each argument definition should specify:

- required or optional;
- allowed values;
- minimum and maximum length;
- character restrictions;
- normalization;
- canonical representation;
- whether secrets are permitted;
- whether the value may affect filesystem or network access.

---

## 13. Argument allowlists

Use explicit allowlists for values with a finite supported set.

Examples include:

- package managers;
- analyzers;
- test modes;
- transformation rules;
- provider operations;
- output formats;
- network profiles;
- runner profiles.

An unknown enum value must be rejected.

It must not fall back to a default that expands capability or authority.

---

## 14. Repository-relative paths

Repository paths must be normalized and validated before use.

Validation must reject:

- absolute paths;
- parent-directory traversal;
- null bytes;
- invalid encoding;
- platform device paths;
- unauthorized symbolic-link traversal;
- paths outside the source snapshot;
- paths outside the changed-file allowlist;
- alternate separators that bypass checks;
- case-confusion attacks where relevant.

Durable command records should use repository-relative normalized paths.

Host-specific absolute paths should be retained only when operationally
necessary and must not become domain identity.

---

## 15. Working-directory policy

Every command must define its working-directory policy.

Permitted working directories may include:

- repository root;
- authorized workspace root;
- authorized package root;
- isolated temporary directory;
- trusted publisher workspace;
- controlled migration directory.

The working directory must be validated against the job workspace.

A repository-provided value must not select an arbitrary host directory.

The executor must reject missing, symbolic-link-escaped, or unauthorized
working directories.

---

## 16. Environment policy

Commands must receive an explicit environment allowlist.

The command executor must not inherit the complete host or controller
environment.

Allowed values may include:

- deterministic locale;
- controlled `PATH`;
- job identifier;
- source snapshot identifier;
- approved temporary directories;
- tool configuration;
- bounded non-secret feature flags;
- explicitly authorized credential references.

Every allowed variable should identify:

- source;
- whether it is secret;
- trust zone;
- redaction requirement;
- cleanup requirement;
- whether repository content may influence it.

---

## 17. Environment sanitization

The executor should remove unapproved variables before process creation.

Variables requiring particular attention include:

- cloud credentials;
- Git credentials;
- SSH agent settings;
- proxy settings;
- database URLs;
- package-registry tokens;
- browser credentials;
- container-runtime settings;
- language-specific injection variables;
- dynamic-loader variables;
- debugging and tracing variables;
- user profile paths.

The approved environment must be constructed from a safe baseline.

It must not be created by subtracting a few known variables from an otherwise
untrusted inherited environment.

---

## 18. Secret-bearing arguments

Secret values should not be passed as command-line arguments when a safer
mechanism exists.

Command-line arguments may be visible through:

- process inspection;
- logs;
- crash reports;
- audit systems;
- shell history;
- error messages.

Prefer:

- short-lived file descriptors;
- protected temporary files;
- runtime secret mounts;
- provider SDK credential mechanisms;
- narrowly scoped environment variables when necessary.

Secret values must not be included in command definitions, reports, or
persistent execution records.

---

## 19. Standard input

Standard input may be used for:

- structured request payloads;
- patch content;
- bounded tool input;
- secrets when the tool safely supports it.

The command definition must specify:

- input type;
- maximum size;
- encoding;
- schema;
- secret status;
- source;
- whether the input is persisted;
- redaction requirements.

Unbounded repository content must not be streamed without explicit limits.

---

## 20. Standard output and standard error

Command output is untrusted.

The executor must define limits for:

- standard output size;
- standard error size;
- line length;
- encoding errors;
- total artifact size;
- execution log retention.

When a limit is exceeded:

- stop or truncate according to the command policy;
- record that truncation occurred;
- preserve the failure state;
- do not treat incomplete structured output as complete;
- do not expose unbounded output to prompts or reports.

Terminal control sequences must be escaped or removed before display.

---

## 21. Structured output

Commands that produce authoritative data should use structured output where
available.

The command definition should specify:

- output format;
- schema;
- schema version;
- maximum size;
- expected encoding;
- validation behavior;
- malformed-output status;
- artifact hashing;
- provenance fields.

Console text parsing should be used only when no stable structured interface
exists and the compatibility risk is documented.

Malformed structured output must not become an empty successful result.

---

## 22. Exit codes

Each command must define expected exit-code semantics.

The definition should distinguish:

- success;
- success with findings;
- success with warnings;
- configuration required;
- unsupported input;
- test failure;
- analyzer failure;
- timeout;
- cancellation;
- resource exhaustion;
- internal error.

Do not assume that every non-zero exit code means the same thing.

Do not assume that exit code zero proves semantic success.

Output validation and expected artifacts may still be required.

---

## 23. Timeouts

Every command must have a timeout.

Timeout configuration should identify:

- startup timeout;
- execution timeout;
- idle-output timeout when applicable;
- graceful termination period;
- forced termination period;
- child-process cleanup behavior.

A timeout must produce an explicit timed-out result.

It must not be converted into:

- zero findings;
- skipped gate success;
- partial coverage marked complete;
- successful remediation;
- successful publication.

---

## 24. Cancellation

Commands must support cancellation where practical.

Cancellation behavior must define:

- how cancellation is requested;
- which process receives the first signal;
- grace period;
- forced termination;
- child-process handling;
- artifact retention;
- workspace cleanup;
- final status.

Cancellation must not be reported as ordinary success.

A revoked authorization should prevent later command stages from starting.

---

## 25. Process trees

The executor must manage the complete process tree.

It should prevent child processes from:

- surviving job completion;
- escaping resource limits;
- continuing network access;
- retaining credentials;
- modifying workspaces after result collection;
- interfering with other jobs.

Process-tree cleanup must be verified where the platform supports it.

Killing only the parent process is insufficient when descendants may remain.

---

## 26. Resource limits

Every command must define applicable resource limits.

Relevant limits include:

- CPU;
- memory;
- process count;
- open files;
- filesystem size;
- output size;
- temporary-storage size;
- network requests;
- download size;
- wall-clock duration.

Resource-limit failures must use an explicit status.

They must reduce coverage and block dependent gates as applicable.

---

## 27. Network profile

Every command must select an approved network profile.

Possible profiles include:

- `network_disabled`;
- `registry_read_only`;
- `github_read_only`;
- `provider_publish_only`;
- `approved_destinations_only`;
- `local_test_services_only`.

A network profile must define:

- destinations;
- ports;
- protocols;
- DNS behavior;
- proxy behavior;
- credential capability;
- request limits;
- download limits;
- timeout;
- audit behavior.

Repository content must not choose or broaden the network profile.

---

## 28. Filesystem profile

Every command must select an approved filesystem profile.

A profile should define:

- readable paths;
- writable paths;
- read-only mounts;
- temporary paths;
- source mutability;
- symbolic-link behavior;
- maximum storage;
- cleanup requirements;
- prohibited host paths.

Examples include:

- read-only analysis workspace;
- writable remediation copy;
- trusted publisher workspace;
- isolated migration test database directory.

The executor must reject access requirements outside the selected profile.

---

## 29. Trust-zone restrictions

Commands must execute only in their declared trust zone.

### Trusted controller

May execute only trusted control-plane operations over validated internal data.

It must not execute repository-controlled tools, scripts, builds, or tests.

### Untrusted runner

May execute repository-controlled and analyzer activity within isolation.

It must not receive publisher, controller-database, or unrelated credentials.

### Trusted publisher

May execute only narrowly approved publication operations.

It must not run repository builds, tests, package installation, or analyzers.

Moving a command to another trust zone requires explicit architecture review.

---

## 30. Package-manager commands

Package-manager command definitions must specify:

- package manager;
- package-manager version;
- lockfile requirement;
- frozen or immutable install behavior;
- lifecycle-script policy;
- network profile;
- registry scope;
- credential handling;
- cache policy;
- working directory;
- timeout;
- output limits;
- expected changed files.

Installation commands must not silently modify manifests or lockfiles unless
that change is explicitly authorized.

---

## 31. Repository scripts

Repository-defined scripts are untrusted command references.

DCAv2 may execute them only when:

- the current workflow requires them;
- the command definition explicitly permits repository-script execution;
- execution occurs in the untrusted runner;
- the script name is validated;
- the working directory is constrained;
- network and filesystem profiles are explicit;
- credentials are excluded;
- resource limits apply;
- output is bounded.

A repository script name must not be interpreted as a trusted command body.

---

## 32. Analyzer commands

Analyzer command definitions must specify:

- analyzer identity;
- analyzer version;
- adapter version;
- source scope;
- configuration policy;
- output schema;
- expected artifacts;
- failure mapping;
- coverage contribution;
- unsupported cases;
- resource limits.

An analyzer command must not permit repository configuration to alter DCAv2
authorization, classification, or publication policy.

Analyzer failure must not become successful empty output.

---

## 33. Compiler and type-check commands

Compiler and type-check commands must define:

- compiler identity;
- compiler version;
- project configuration;
- source scope;
- incremental-cache policy;
- emitted-file policy;
- expected exit behavior;
- diagnostic limits;
- required artifacts;
- working directory.

When the command is intended only to validate source, emission should be
disabled where supported.

A missing compiler inside the runner must be reported explicitly.

The executor must not use an undeclared host-global compiler as a fallback.

---

## 34. Test commands

Test command definitions must identify:

- test framework;
- test scope;
- configuration;
- concurrency;
- timeout;
- retry policy;
- network profile;
- external-service dependencies;
- test database requirements;
- output format;
- coverage behavior;
- expected exit semantics.

Automatic test retries must not conceal flaky or failing results.

A skipped or unavailable required test must not be recorded as passed.

---

## 35. Build commands

Build commands must define:

- build system;
- target;
- source scope;
- output directories;
- cache behavior;
- generated artifacts;
- network requirements;
- timeout;
- resource limits;
- cleanup;
- expected changed files.

Build output outside approved directories must be treated as unexpected
filesystem modification.

---

## 36. Transformation commands

Transformation commands must define:

- transformation ID;
- transformation version;
- supported source shape;
- target finding;
- expected rewrite count;
- changed-file allowlist;
- deterministic-output requirement;
- idempotency requirement;
- output patch format;
- failure behavior.

A transformation command must not accept unrestricted replacement text or
arbitrary file lists from untrusted content.

Unexpected rewrites must cause failure.

---

## 37. Git commands

Git command definitions must be separated by trust zone and purpose.

### Source acquisition

May perform controlled clone, fetch, checkout, and metadata validation without
executing hooks.

### Local repository inspection

May perform read-only status, diff, log, and object inspection when authorized.

### Trusted publication

May apply the verified patch, create a dedicated branch, create commits, and
push only the authorized branch.

Prohibited Git behavior includes:

- unapproved hard resets;
- destructive cleans;
- force pushes;
- direct default-branch pushes;
- shared-history rewrites;
- automatic merge;
- untrusted hook execution.

---

## 38. Database commands

Database command definitions must identify:

- database environment;
- database role;
- operation type;
- migration identity;
- transaction policy;
- statement timeout;
- lock timeout;
- tenant scope;
- expected schema state;
- verification query;
- rollback or recovery behavior.

Production database commands require separate explicit authorization.

Connection strings and credentials must not be stored in command records.

---

## 39. Provider commands

External provider operations must use structured API or SDK calls where
practical.

A provider command must define:

- provider;
- operation;
- target identity;
- credential capability;
- idempotency identity;
- request schema;
- response schema;
- retry policy;
- partial-success handling;
- rate-limit handling;
- audit requirements.

A provider CLI must not receive an arbitrary command string derived from
untrusted input.

---

## 40. Command authorization

Before execution, the trusted orchestrator must verify:

- active phase authorization;
- command ID is permitted;
- trust zone is permitted;
- repository is permitted;
- target paths are permitted;
- network profile is permitted;
- credential capability is permitted;
- external operation is permitted when applicable;
- execution count remains within limits;
- authorization has not expired or been revoked.

A command definition cannot authorize itself.

---

## 41. Authorization binding

An execution request should bind to:

- phase-authorization ID;
- command ID and version;
- job ID;
- tenant;
- repository identity;
- source snapshot;
- target scope;
- network profile;
- filesystem profile;
- credential capability;
- timeout;
- request digest.

Changing a publication-critical or security-critical field after authorization
must invalidate the request.

---

## 42. Command request schema

A structured command request should include:

    schema_version: 1
    request_id: null
    job_id: null
    authorization_id: null
    tenant_id: null
    command_id: null
    command_version: null
    trust_zone: null
    source_snapshot_id: null
    repository_id: null
    working_directory: null
    arguments: {}
    environment: {}
    network_profile: null
    filesystem_profile: null
    timeout_seconds: null
    expected_artifacts: []
    request_digest: null

The final schema should be machine-validated.

Unknown fields should be rejected or handled through an explicit compatibility
policy.

---

## 43. Command result schema

A structured command result should include:

    schema_version: 1
    request_id: null
    job_id: null
    command_id: null
    command_version: null
    status: null
    started_at: null
    completed_at: null
    exit_code: null
    termination_reason: null
    timed_out: false
    resource_exceeded: false
    stdout_artifact: null
    stderr_artifact: null
    output_truncated: false
    produced_artifacts: []
    changed_files: []
    resolved_executable: null
    resolved_tool_version: null
    runner_profile: null
    result_digest: null
    failure_category: null

The result must not contain raw secret values.

The controller must validate the result before using it as evidence or audit
input.

---

## 44. Command-result statuses

Supported statuses should include:

- `succeeded`;
- `succeeded_with_warnings`;
- `failed`;
- `timed_out`;
- `resource_exceeded`;
- `cancelled`;
- `unavailable`;
- `unsupported`;
- `configuration_required`;
- `malformed_output`;
- `partially_completed`;
- `authorization_rejected`;
- `security_blocked`;
- `cleanup_failed`.

Only a status explicitly accepted by the calling gate may satisfy that gate.

---

## 45. Failure preservation

The execution layer must preserve the distinction between:

- command unavailable;
- executable missing;
- permission denied;
- invalid arguments;
- unsupported input;
- configuration missing;
- process failure;
- timeout;
- resource exhaustion;
- malformed output;
- artifact validation failure;
- cleanup failure.

These results must not collapse into a generic empty result.

Downstream evidence, coverage, classification, remediation, and publication
must retain the failure impact.

---

## 46. Retry policy

Every retryable command must define:

- retryable failure categories;
- maximum attempts;
- backoff;
- idempotency requirements;
- artifact separation;
- cleanup between attempts;
- authorization revalidation;
- source-state revalidation.

Commands that may create external state require stronger idempotency and
reconciliation.

A retry must receive a distinct attempt identity.

Prior attempts must remain auditable.

---

## 47. Idempotency

Commands that change state must define idempotency behavior.

Applicable identities may include:

- job ID;
- source snapshot;
- finding ID;
- transformation ID;
- patch hash;
- migration identity;
- publication identity;
- external target identity.

A command must not assume idempotency merely because repeating it usually works.

Idempotency must be implemented and tested.

---

## 48. Generated command plans

An AI system may propose a command plan.

The plan must remain non-authoritative until:

- every operation maps to an approved command ID;
- every argument validates;
- authorization permits every operation;
- trust-zone placement is correct;
- network and filesystem profiles are permitted;
- required credentials are permitted;
- stop conditions are defined.

Generated free-form shell text must not be executed directly.

---

## 49. Repository command discovery

DCAv2 may discover possible commands from:

- package manifests;
- build files;
- CI configuration;
- documentation;
- repository scripts;
- tool configuration.

Discovered commands are untrusted observations.

They may inform qualification or a proposed command mapping.

They must not become approved command definitions automatically.

---

## 50. Prompt-injection resistance

Command selection must not be altered by instructions found in:

- repository files;
- comments;
- documentation;
- issue content;
- commit messages;
- analyzer output;
- logs;
- generated artifacts;
- external responses.

Such content may describe a command but cannot authorize it.

The orchestrator must rely only on trusted policy and active human
authorization.

---

## 51. Git hook prevention

Commands interacting with Git repositories must prevent untrusted hook
execution where applicable.

Controls may include:

- controlled empty hooks directory;
- disabled hook configuration;
- credential-free repository state;
- avoidance of repository-provided Git configuration.

Hook prevention is mandatory for trusted controller and publisher operations.

Runner-side Git behavior must still remain isolated and credential-free.

---

## 52. Symbolic links

Filesystem-sensitive commands must define symbolic-link behavior.

The executor must prevent symbolic links from bypassing:

- workspace boundaries;
- read-only mounts;
- changed-file allowlists;
- prohibited paths;
- artifact directories;
- secret restrictions.

Path validation must consider the resolved target, not only the textual path.

Unexpected symbolic-link creation or modification must be reported.

---

## 53. File-change tracking

Commands permitted to modify files must produce a changed-file record.

The record should identify:

- added files;
- modified files;
- deleted files;
- renamed files;
- file modes;
- symbolic links;
- binary files;
- content hashes;
- repository-relative paths.

The changed-file set must be compared with the command's allowlist.

Unexpected changes must cause failure.

---

## 54. Temporary files

Commands must use controlled temporary directories.

The policy should define:

- directory location;
- tenant and job isolation;
- permissions;
- size limit;
- retention;
- cleanup;
- secret-bearing file handling;
- artifact promotion.

Temporary paths must not be predictable in a way that enables cross-job
interference.

Secret-bearing temporary files must be deleted through the approved cleanup
process.

---

## 55. Caches

Command definitions using caches must define:

- cache identity;
- cache scope;
- tenant isolation;
- read and write permissions;
- integrity verification;
- eviction;
- invalidation;
- secret exclusion;
- poisoning behavior.

A cache hit must not bypass source, version, lockfile, or artifact validation.

Untrusted jobs must not write into a cache later treated as trusted without
validation.

---

## 56. Command logging

Command logs must be bounded and redacted.

Permitted logging may include:

- command ID;
- command version;
- resolved executable;
- tool version;
- working-directory identity;
- start and completion times;
- exit code;
- result status;
- timeout;
- resource usage;
- artifact identifiers;
- failure category.

Logs must not include:

- secret values;
- complete inherited environments;
- authentication headers;
- private keys;
- credential-bearing URLs;
- unbounded source output;
- sensitive command input without need.

---

## 57. Audit events

Material command execution must produce audit events.

Applicable events include:

- command requested;
- authorization validated;
- command rejected;
- command started;
- command completed;
- command timed out;
- resource limit exceeded;
- command cancelled;
- output truncated;
- artifact validated;
- changed files rejected;
- cleanup completed;
- cleanup failed;
- security policy blocked execution.

Audit events must identify the command ID and version.

---

## 58. Metrics

Command metrics may include:

- execution count;
- success count;
- failure count;
- timeout count;
- resource-exceeded count;
- duration;
- CPU use;
- memory use;
- output size;
- retry count;
- cleanup failures.

Metrics must not contain secret values or unbounded repository identifiers.

Tenant labels must be controlled to avoid cross-tenant exposure and excessive
cardinality.

---

## 59. Cleanup

Every command definition must specify cleanup requirements.

Cleanup may include:

- process-tree termination;
- temporary-file removal;
- temporary credential removal;
- network-rule removal;
- test-service shutdown;
- test-database cleanup;
- cache write finalization;
- workspace retention or deletion;
- artifact promotion.

Cleanup must affect only command-created resources.

Cleanup failure must remain explicit and auditable.

---

## 60. Security incidents

The following must be treated as security incidents:

- execution in the wrong trust zone;
- command executed without authorization;
- arbitrary shell injection;
- trusted credential exposure;
- host filesystem escape;
- Docker socket access;
- unauthorized network access;
- cross-tenant filesystem access;
- command-definition tampering;
- publisher command executing repository code;
- controller command executing repository scripts.

When detected:

1. Stop the command.
2. Stop equivalent command scheduling when necessary.
3. Preserve bounded evidence.
4. Revoke exposed credentials through an authorized process.
5. Record the incident.
6. Report the affected scope.
7. Require review before re-enabling the command.

---

## 61. Command-definition changes

Changing a command definition requires review proportional to the impact.

Review must consider:

- executable change;
- argument change;
- trust-zone change;
- environment change;
- network change;
- filesystem change;
- credential change;
- timeout change;
- resource-limit change;
- output-schema change;
- failure-mapping change;
- cleanup change.

Security-sensitive semantic changes require a new command version.

Historical execution records must retain the old definition identity.

---

## 62. Deprecation

A deprecated command must identify:

- replacement;
- reason;
- compatibility period;
- remaining callers;
- removal conditions;
- migration plan.

New workflows must not select deprecated commands unless an explicit
compatibility policy permits it.

Deprecated command definitions must remain available for historical
interpretation.

---

## 63. Testing requirements

Structured-command tests should cover:

- valid direct execution;
- missing executable;
- wrong executable version;
- invalid argument type;
- unknown argument;
- argument-length limit;
- path traversal;
- absolute-path rejection;
- symbolic-link escape;
- environment sanitization;
- secret redaction;
- working-directory escape;
- network denial;
- timeout;
- cancellation;
- process-tree cleanup;
- resource exhaustion;
- output truncation;
- malformed structured output;
- unexpected artifact;
- unexpected changed file;
- unauthorized command;
- wrong trust zone;
- command-version mismatch;
- retry;
- idempotency;
- cleanup failure.

Tests must use synthetic secrets and safe fixtures.

---

## 64. Shell-injection tests

Any command using a shell must be tested with hostile values containing
applicable characters and patterns such as:

- whitespace;
- quotes;
- semicolons;
- pipes;
- redirection;
- command substitution;
- variable expansion;
- wildcard characters;
- newlines;
- control characters;
- path traversal;
- platform-specific shell metacharacters.

The test must verify that untrusted input remains data.

A test that merely escapes one known payload is insufficient.

---

## 65. Trust-zone tests

Tests must verify that:

- runner commands cannot access publisher credentials;
- runner commands cannot access controller database credentials;
- publisher commands cannot execute repository hooks;
- publisher commands cannot execute repository scripts;
- controller commands cannot execute repository-controlled tools;
- command definitions cannot switch trust zones through arguments;
- one tenant's command cannot access another tenant's workspace.

Configuration review alone does not prove these controls.

---

## 66. Determinism tests

Where determinism is required, tests should verify that equivalent inputs
produce:

- the same command request digest;
- the same argument order;
- the same normalized environment;
- the same selected executable version;
- the same output normalization;
- the same artifact digest;
- the same patch hash where applicable.

Unstable timestamps and temporary paths should be excluded from semantic
digests unless required.

---

## 67. Capability reporting

Command capabilities must be reported separately.

Examples include:

- direct process execution;
- shell isolation;
- argument validation;
- environment sanitization;
- path confinement;
- timeout enforcement;
- resource enforcement;
- output bounding;
- process-tree cleanup;
- network-profile enforcement;
- filesystem-profile enforcement;
- result schema validation;
- retry idempotency.

A command registry alone does not prove these capabilities are enforced.

Each capability requires implementation and tests.

---

## 68. Reporting requirements

A phase report affecting command execution must state:

- command definitions added;
- command definitions changed;
- trust zones;
- executable versions;
- argument schemas;
- environment policies;
- network profiles;
- filesystem profiles;
- timeouts;
- resource limits;
- output limits;
- tests executed;
- hostile tests executed;
- cleanup results;
- known limitations;
- commands remaining experimental or disabled.

Do not report command isolation as enforced without executed validation.

---

## 69. Prohibited practices

The following practices are prohibited:

- executing generated shell text directly;
- concatenating untrusted values into shell commands;
- inheriting the complete trusted-host environment;
- allowing repository content to select arbitrary executables;
- allowing repository content to broaden network access;
- allowing repository content to select credentials;
- using undeclared host-global tools as fallback;
- treating timeout as success;
- treating malformed output as no findings;
- executing repository hooks in trusted zones;
- allowing publisher commands to run builds or tests;
- logging secret-bearing arguments;
- leaving child processes running after job completion;
- accepting unexpected changed files;
- changing command semantics without versioning.

---

## 70. Fail-safe behavior

When command identity, authorization, executable identity, argument validity,
trust-zone placement, or containment cannot be established confidently:

- do not execute the command;
- do not fall back to arbitrary shell execution;
- do not broaden environment or network access;
- do not use undeclared credentials;
- do not use host-global tools;
- record the exact validation failure;
- return an explicit rejected, unavailable, unsupported, or security-blocked
  status;
- clean any resources already created.

Command uncertainty must reduce execution authority.

---

## 71. Policy integrity

This document must not be modified during implementation unless engineering or
governance modification is explicitly authorized.

Changes require:

1. Identification of the structured-command problem.
2. Review against permanent safety invariants.
3. Review of trust-zone implications.
4. Review of argument, environment, and credential implications.
5. Review of failure and cleanup behavior.
6. Updated hostile-input and isolation tests.
7. Updated schemas or command registries.
8. A reviewable governance commit.
9. An ADR when the change alters long-lived execution, shell, credential,
   network, or trust-boundary semantics.

This policy must not be weakened to execute generated commands, bypass argument
validation, rely on trusted-host state, or conceal command failures.