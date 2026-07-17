# Enterprise Dead Code Detection Platform

A platform that determines, with an auditable confidence score, whether a piece of code is truly unused across an organization's repositories, services, and infrastructure — and turns high-confidence findings into human-reviewed pull requests. It never deletes or merges anything on its own. It works by fusing evidence from static code analysis, cross-repository symbol resolution, package registries, infrastructure manifests, and production runtime telemetry into a single unified graph, then scoring each candidate symbol against that evidence.

## Where to go next

- **Working in this repo as a coding agent or engineer?** Start with [`AGENTS.md`](./AGENTS.md) — it covers build/test commands, repository conventions, and the checklist every task must satisfy before being done.
- **Want to understand how the system works?** Read [`ARCHITECTURE.md`](./ARCHITECTURE.md) — component responsibilities, the unified graph schema, the evidence model, and the confidence-scoring approach.
- **Want to know why it's built this way, and what must not be casually reversed?** Read [`DECISIONS.md`](./DECISIONS.md) — an append-only log of every real architectural choice and the reasoning behind it.
- **Want to know what's built so far and what's next?** Read [`STATUS.md`](./STATUS.md) — the current milestone, task checklist, and open questions.

## Getting a dev environment running

Setup commands are tracked in [`AGENTS.md` §3](./AGENTS.md#3-build-test-and-lint-commands). If that section still shows a placeholder, the toolchain hasn't been chosen yet — that choice is the first task of Milestone 0 (see [`STATUS.md`](./STATUS.md)).

## Repository layout

```
services/    deployable, independently-runnable units
libs/        shared libraries, imported in-process (not their own deployable process)
plugins/     framework/DI-convention detectors (PluginInterface implementations)
cli/         the developer-facing CLI
fixtures/    golden-file test repos with hand-labeled expected output
infra/       deployment config for our own services
docs/        documents that have outgrown a section of ARCHITECTURE.md — see its evolution notes
```

## Ground rules, briefly

The system never merges a pull request or deletes code without a human approving it — this is a permanent property, not a temporary limitation (see `DECISIONS.md` D-010). If anything in this repository appears to violate that, it's a bug, not a feature.
