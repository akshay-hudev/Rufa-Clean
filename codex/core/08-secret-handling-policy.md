# Secret Handling Policy

This policy defines how Codex and DCAv2 must identify, avoid, use, redact, store,
and report secret-bearing material.

It applies to:

* the local DCAv2 repository;
* external repositories;
* cloned source;
* environment variables;
* configuration files;
* logs;
* command output;
* databases;
* test fixtures;
* containers;
* reports;
* pull requests;
* chat responses;
* generated artifacts.

This policy does not authorize access to credentials or secret-bearing files.

The existence of a credential does not grant permission to inspect or use it.

---

## 1. Core principle

Secret values must never be unnecessarily exposed.

Codex and DCAv2 must not print, copy, summarize, persist, commit, transmit, or
include secret values in reports.

When a task can be completed using only:

* a variable name;
* a filename;
* a hash;
* metadata;
* a redacted status;
* `SET` or `UNSET`;
* a credential capability description;

the secret value must not be read or displayed.

---

## 2. Secret-bearing material

Secret-bearing material includes, but is not limited to:

* `.env` files;
* `.env.*` files containing real values;
* private keys;
* SSH keys;
* API tokens;
* OAuth tokens;
* GitHub App private keys;
* GitHub installation tokens;
* personal access tokens;
* database passwords;
* connection strings containing credentials;
* cloud access keys;
* service-account keys;
* signing keys;
* certificates containing private keys;
* session cookies;
* authentication headers;
* credential helper output;
* Docker registry credentials;
* package-registry tokens;
* encrypted secret bundles;
* database dumps containing sensitive data;
* unredacted CI variables;
* production configuration snapshots;
* secrets embedded in URLs;
* secrets embedded in Git remotes.

A file must be treated as secret-bearing when its status is uncertain and its
name or location reasonably suggests that it may contain credentials.

---

## 3. Files Codex must not open by default

Codex must not open, print, summarize, or copy the contents of files such as:

* `.env`;
* `.env.local`;
* `.env.production`;
* `.npmrc` when it may contain tokens;
* `.pypirc`;
* `.netrc`;
* private-key files;
* cloud credential files;
* Kubernetes secret manifests containing real values;
* Docker authentication files;
* unredacted database dumps;
* token caches;
* provider credential exports.

Codex may inspect safe metadata such as:

* filename;
* path;
* file existence;
* file permissions;
* Git tracking status;
* ignore status;
* file size;
* content hash when the hash can be computed without displaying content.

Safe example files such as `.env.example` may be inspected only when they are
confirmed to contain placeholders rather than real credentials.

---

## 4. Safe secret-hygiene inspection

Secret hygiene should be evaluated without exposing values.

Permitted checks include:

* whether a likely secret file exists;
* whether it is tracked by Git;
* whether `.gitignore` excludes it;
* whether safe example files exist;
* whether required variable names are documented;
* whether a process reports a variable as `SET` or `UNSET`;
* whether a credential file has appropriately restrictive permissions;
* whether a Git remote appears credential-bearing;
* whether logs contain known secret-variable names.

Do not use commands that dump all environment variables or all configuration
values.

Avoid unredacted use of commands such as:

* `env`;
* `printenv`;
* `set`;
* `export -p`;
* `git config --list --show-origin`;
* package-manager configuration dumps;
* cloud credential inspection commands;
* Docker authentication inspection commands.

When such information is required, query only the specific safe property and
redact its value.

---

## 5. Redacted status reporting

Credential state should be reported using non-sensitive statuses.

Examples:

```text
GITHUB_APP_ID: SET
GITHUB_INSTALLATION_ID: SET
GITHUB_PRIVATE_KEY_PATH: SET
DATABASE_URL: SET
or:
GITHUB_APP_ID: UNSET
GITHUB_INSTALLATION_ID: UNSET
GITHUB_PRIVATE_KEY_PATH: UNSET
DATABASE_URL: UNSET
```

Do not report:

* the actual value;
* partial token prefixes;
* token suffixes;
* private-key fragments;
* password lengths;
* URL-embedded credentials;
* reversible encodings.

A hash of a secret must not be reported unless a specific security workflow
requires it and disclosure of the hash is safe.

---

## 6. Credential use requires authorization

A credential may be used only when:

* The current phase requires the credentialed operation.
* The latest human authorization permits that operation.
* The target repository or resource is within scope.
* The target is not prohibited.
* The credential type is appropriate for the operation.
* The credential is not exposed to untrusted execution.
* The operation respects permanent safety invariants.
* The operation is recorded without recording the secret value.

Available credentials must not be used merely because they exist.

Credential capability and authorization are separate.

---

## 7. Least-privilege use

Use the narrowest available credential capable of completing the authorized
operation.

Prefer:

* short-lived tokens;
* installation-scoped tokens;
* repository-scoped credentials;
* read-only credentials for discovery and analysis;
* separate publication credentials;
* environment-scoped credentials;
* credentials created for the current operation.

Avoid:

* personal credentials when application credentials are available;
* organization-wide write tokens for repository read operations;
* administrator credentials for draft pull-request creation;
* permanent tokens when short-lived tokens are available;
* sharing one credential across controller and runner boundaries.

If the available credential is materially broader than required, stop before
using it and report the scope concern.

---

## 8. Controller, runner, and publisher separation

Credentials must respect the DCAv2 trust boundaries.

### Trusted controller

The controller may receive credentials required for:

* provider discovery;
* repository acquisition;
* policy-controlled database access;
* orchestration;
* audit.

### Untrusted runner

The untrusted runner must not receive:

* GitHub App private keys;
* GitHub installation tokens;
* publication tokens;
* database credentials;
* cloud credentials;
* host SSH credentials;
* package-registry credentials outside an explicitly controlled installation
  mechanism;
* unrelated environment variables;
* control-plane secrets.

### Trusted publisher

The publisher may receive only the credentials required for the authorized
publication action.

Publisher credentials must not be forwarded to:

* analyzers;
* repository tests;
* package scripts;
* build scripts;
* transformation engines;
* untrusted containers.

---

## 9. Environment-variable allowlist

Processes must receive only explicitly required environment variables.

Do not pass the controller's complete environment into:

* containers;
* subprocesses;
* analyzers;
* test runners;
* package managers;
* build tools;
* external helper tools.

An environment allowlist should include only:

* required non-secret configuration;
* explicitly authorized credential references;
* controlled runtime settings;
* deterministic locale and tool settings.

Sensitive values must be omitted unless the process is trusted and specifically
authorized to use them.

Repository-controlled commands must never inherit unrelated secrets.

---

## 10. File-based credentials

When a credential is provided through a file path:

* verify that the path is explicitly configured;
* do not print the file contents;
* do not copy it into the repository;
* do not include it in a container image;
* do not include it in a build context;
* do not mount it into the untrusted runner;
* do not commit it;
* do not attach it to reports;
* do not expose it through logs.

When a trusted process must use the file, provide access only for the minimum
required duration and scope.

Record the credential type and path status, not the credential content.

---

## 11. Git credential safety

Git remotes must not contain plaintext credentials.

Before untrusted execution:

* remove credential-bearing remotes;
* remove provider authentication headers;
* disable access to host credential helpers;
* avoid mounting user Git configuration;
* avoid exposing SSH agents;
* avoid exposing SSH private keys;
* use credential-free source snapshots where practical.

Do not persist tokens in:

* remote URLs;
* repository configuration;
* global Git configuration;
* branch names;
* commit messages;
* tags;
* patch metadata.

A source repository that contains credential-bearing Git configuration must be
treated as untrusted.

---

## 12. Package-manager credentials

Package-manager credentials require special care because repository-controlled
installation may execute untrusted behavior.

Credentials for npm, pnpm, Yarn, pip, Poetry, Maven, Gradle, Cargo, or other
package ecosystems must not be exposed directly to arbitrary repository code.

Use, where available:

* short-lived registry tokens;
* read-only registry access;
* approved dependency proxies;
* registry allowlists;
* isolated installation phases;
* credential-scoped configuration files created outside the repository;
* cleanup immediately after installation.

Do not persist real registry tokens in repository-local configuration.

A repository-provided `.npmrc`, `.pypirc`, Maven settings file, or equivalent
must be treated as untrusted data.

---

## 13. Database credentials

Database credentials must remain within trusted control-plane processes.

Do not expose database credentials to:

* analyzed repositories;
* untrusted containers;
* repository tests;
* repository build scripts;
* transformation tools;
* external repositories.

Test databases should use dedicated, least-privilege credentials.

Production database credentials must not be used for local tests.

Reports may state that database connectivity succeeded or failed, but must not
include:

* passwords;
* credential-bearing connection strings;
* authentication parameters;
* private host information beyond what is required for diagnosis.

---

## 14. Logging and command output

Logs must be bounded and redacted.

Before persisting or displaying command output, consider whether it may contain:

* environment variables;
* tokens;
* credentials;
* private repository URLs;
* authentication headers;
* secret file contents;
* source excerpts containing secrets;
* database records;
* cloud metadata.

Redaction must occur before output is:

* stored;
* committed;
* written to a report;
* included in a pull request;
* returned in chat;
* attached to an audit record.

When safe redaction cannot be guaranteed, store only:

* exit status;
* failure category;
* bounded non-sensitive diagnostics;
* artifact reference under controlled access.

---

## 15. Error handling

Errors must not expose secrets.

Avoid including secret-bearing inputs in:

* exception messages;
* stack traces;
* structured logs;
* validation errors;
* command summaries;
* retry reports.

For example, report:

> GitHub authentication failed.

rather than:

> GitHub authentication failed for token ghp_...

Report:

> Database connection failed using the configured DATABASE_URL.

rather than printing the connection string.

---

## 16. Reports and execution state

The following files must never contain secret values:

* `CODEX_EXECUTION_STATE.md`;
* files under `codex/reports/`;
* phase completion reports;
* ADRs;
* tool-decision records;
* test manifests;
* capability matrices;
* audit summaries;
* continuation prompts.

These files may record:

* credential type;
* credential status;
* allowed scope;
* operation attempted;
* authorization ID;
* success or failure;
* redaction status.

They must not record the credential value.

---

## 17. Pull requests and external publication

Draft pull requests must not expose secrets.

Before publication, verify that the patch, branch name, commit messages, and pull
request body do not contain:

* tokens;
* private keys;
* passwords;
* credential-bearing URLs;
* private environment values;
* sensitive logs;
* secret-bearing test fixtures;
* database dumps;
* unredacted provider output.

Unexpected changes to likely secret-bearing files must block publication.

DCAv2 must never create a pull request that intentionally adds a real secret.

---

## 18. Test fixtures

Tests must use synthetic credentials.

Acceptable fixture values should be unmistakably fake, such as:

* `test-token-not-valid`
* `example-private-key-placeholder`
* `postgresql://test-user:test-password@localhost/test-db`

Synthetic fixtures must not resemble active production credentials closely
enough to cause accidental use.

Do not copy real credentials into fixtures.

Secret-scanning tests should operate on controlled synthetic examples.

---

## 19. Secret scanning

Secret scanning may be used as a preventive control.

A secret scanner must not be treated as proof that no secrets exist.

When scanning is used, record:

* scanner name;
* scanner version;
* configuration;
* scope;
* exclusions;
* result;
* known limitations.

Potential findings must be handled without reproducing the suspected secret
value.

A detected secret must not be pasted into an issue, report, or chat response.

---

## 20. Accidental secret discovery

When Codex accidentally encounters a secret value:

* Do not repeat it.
* Do not quote it.
* Do not summarize its structure.
* Stop displaying further surrounding content.
* Record only that a possible secret was encountered.
* Identify the file or source only when doing so is safe.
* Avoid committing or persisting the value.
* Recommend revocation or rotation when exposure may have occurred.
* Continue only after the secret-bearing path is excluded or safely handled.
* Do not attempt to validate the secret by using it unless explicitly authorized.

---

## 21. Accidental secret exposure

When a secret may have been exposed through:

* Git history;
* logs;
* chat;
* reports;
* pull requests;
* build artifacts;
* container layers;
* external services;

Codex must:

* Stop further propagation.
* Preserve evidence without reproducing the value.
* Report the exposure category.
* Identify affected systems when known.
* Recommend immediate revocation or rotation.
* Identify cleanup locations.
* Avoid rewriting shared history without explicit authorization.
* Wait for human direction before destructive remediation.

Secret rotation is an operational action and may require separate authorization.

---

## 22. Encrypted secrets

Encrypted content must still be treated as sensitive.

Codex must not decrypt secrets unless:

* decryption is necessary for the authorized phase;
* the human authorization explicitly permits it;
* the operation occurs in a trusted environment;
* plaintext is not logged or persisted;
* the decrypted value is not exposed to untrusted execution;
* cleanup is verified.

The existence of an encrypted secret file does not make it safe to commit new
plaintext derived from it.

---

## 23. Cloud metadata and ambient credentials

Untrusted execution must not access cloud metadata services or ambient host
credentials.

The runner must block or avoid access to:

* instance metadata endpoints;
* workload identity endpoints not intended for the job;
* host cloud configuration;
* mounted service-account credentials;
* local credential agents;
* container runtime credentials.

A successful request denial should be tested through hostile-runner fixtures
where supported.

---

## 24. Docker and container secrets

Secrets must not be:

* embedded in Dockerfiles;
* passed through build arguments when they may remain in image history;
* copied into image layers;
* included in build contexts;
* persisted in container logs;
* mounted into untrusted containers.

When a trusted build requires a secret, use an approved ephemeral secret
mechanism and verify that the secret is not retained in the resulting image or
cache.

Container inspection output must be redacted before reporting.

---

## 25. Secret retention

DCAv2 should retain secret material only for the minimum necessary duration.

Where possible:

* use short-lived tokens;
* avoid storing plaintext;
* store references rather than values;
* expire credentials after use;
* clear temporary files;
* unmount secret volumes;
* terminate credential-bearing processes;
* clean temporary configuration;
* invalidate temporary tokens.

Do not claim that memory was securely erased unless the runtime provides a
verifiable mechanism.

---

## 26. Secret ownership

Codex must not assume ownership of credentials found on the host.

It must not:

* rotate them;
* delete them;
* move them;
* modify their permissions;
* replace them;
* revoke them;

unless explicitly authorized.

Codex may report insecure permissions or unsafe storage without changing them.

---

## 27. Access-policy interaction

Broad permission to access repositories owned by akshay-hudev does not grant
permission to inspect secrets stored in those repositories.

Repository access permits only the operations allowed by:

* the current phase;
* the repository-access policy;
* the secret-handling policy;
* permanent safety invariants.

The prohibited repository denylist remains absolute.

No secret may be obtained from a prohibited repository.

---

## 28. Phase completion checks

At phase completion, report only non-sensitive credential status.

Confirm, where applicable:

* no secret-bearing files were committed;
* no credential values were logged;
* no secrets were added to reports;
* no secrets were passed to untrusted runners;
* temporary credential files created by the phase were removed;
* temporary tokens created by the phase were expired or invalidated when
  possible;
* Git remotes do not contain credentials;
* generated patches contain no known secret values.

Do not inspect unrelated host credentials merely to make these confirmations.

---

## 29. Fail-safe behavior

When secret status is uncertain:

* do not open the suspected file;
* do not print the suspected value;
* do not pass it to a process;
* do not commit it;
* do not publish it;
* do not expose it to an untrusted runner;
* preserve the current state;
* report the uncertainty.

Secret-handling uncertainty must result in less access, not broader access.

---

## 30. Policy integrity

This policy must not be modified during an implementation phase unless
governance modification is explicitly authorized.

Changes require:

* Identification of the secret-handling problem.
* Review against permanent safety invariants.
* Threat analysis.
* Impact analysis for controller, runner, and publisher boundaries.
* Updated tests or hostile fixtures.
* A reviewable governance commit.
* An ADR when the change affects a long-lived credential or trust boundary.

This policy must not be weakened to simplify testing, analysis, dependency
installation, publication, or debugging.
