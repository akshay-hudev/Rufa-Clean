# Documentation Strategy: AI-Agent-Driven Development
### Final Repository Design Review Before Implementation Begins

## First principle guiding every decision below

Every document in this repository will be read, most often, by an AI coding agent starting a fresh session with no memory of prior sessions. That agent needs just enough grounding to (a) not violate settled architectural decisions, (b) know what to build next, and (c) know how to verify its own work — and nothing more, because every extra document is more context to load, more surface to go stale, and more opportunity for two documents to quietly contradict each other. The test for every candidate document below is: **does an agent (or the human reviewer) fail in some specific, identifiable way without this document existing as its own file?** If the answer is "no, that information lives comfortably inside another document," it is merged, not created.

A second, equally important principle: **documents that describe stable truth (why we chose X) must be structurally separated from documents that describe changing state (what's built so far).** Mixing the two causes constant diff noise in the stable document, which trains both humans and agents to stop reading it carefully — the exact failure mode that would let an agent casually "fix" the Postgres-over-Neo4j decision because the file it lived in looked like routine, editable status text.

---

## 1. The Recommended Documentation Set

Five documents. That's the whole set.

### 1.1 `README.md`

- **Problem it solves:** the single entry point — anyone (human or agent) landing in this repository for the first time needs to know what this project is, how to get a working dev environment running, and where to go next. Nothing more.
- **Why standalone:** every repository needs exactly one canonical "start here" file by convention; this isn't a judgment call, it's how tooling (GitHub rendering, IDEs, agents' initial repo scan) already expects to find orientation.
- **Audience:** both, but optimized for the *first thirty seconds* of either a human or an agent's engagement with the repo — it should be short enough that it's fully read, not skimmed.
- **Contents (at a glance, not the full doc):** one paragraph on what the system does, a link to `ARCHITECTURE.md` for anyone who needs the real detail, dev environment setup commands, and a link to `AGENTS.md` for anyone (agent or human) about to actually write code.
- **How it evolves:** rarely, and only in small ways — new setup steps if the dev environment changes, updated links if documents are renamed. If README starts accumulating architectural explanation, that content is misplaced and belongs in `ARCHITECTURE.md`.

### 1.2 `ARCHITECTURE.md`

- **Problem it solves:** this is the single "how the system works and why it's shaped this way" reference — consolidating what would otherwise be scattered across separate schema docs, confidence-model docs, evidence-source docs, and plugin-interface docs (as originally sketched in the execution blueprint's `docs/architecture/` folder). An agent picking up any task — indexing, scoring, plugin-writing, infra extraction — needs the *same* mental model of the unified graph and evidence flow, so splitting that model across five small files just means the agent (or the person prompting it) has to know which of five files to open, and re-derive how they relate to each other every time. One document, several clearly-headed sections, is strictly better here.
- **Why standalone (from README):** it is long-form technical content that would drown the orientation purpose of README if merged into it; README's value is being short, ARCHITECTURE's value is being complete.
- **Why merged (rather than split into schema/confidence-model/evidence/plugin docs):** these four topics are read together far more often than they're read alone — nobody works on the confidence engine without also needing the evidence-source reliability table, and nobody writes a plugin without needing the graph schema it emits edges into. Splitting them optimizes for a document-count aesthetic, not for how the content is actually consumed.
- **Contents:** component responsibilities and interfaces (condensed from the execution blueprint's Section 1, kept current — not the full historical spec, just the present-tense truth), the unified graph schema (node/edge types), the evidence-source reliability table, the confidence-scoring model (the noisy-OR approach and why, not the exact tunable weights — those belong in config, not docs), and the plugin interface contract.
- **Audience:** primarily AI agents (this is the document loaded into context before almost any non-trivial task), secondarily humans doing design review.
- **How it evolves:** edited in place, incrementally, as the system's actual shape changes — this document describes **current truth**, not history. When a component's interface changes, this file changes with it, in the same PR. It should never accumulate "as of milestone 6 we changed X" narration — that belongs in `DECISIONS.md`. **Splitting trigger:** if the plugin-interface section grows past roughly 5–6 concrete plugins with meaningfully different concerns, split "how to write a plugin" into its own `docs/plugins/PLUGIN_INTERFACE.md` at that point — not before. This is the one place in this repo where a document is explicitly designed to fission later, once there's enough content to justify the extra file.

### 1.3 `DECISIONS.md`

- **Problem it solves:** this is the single most important document for preventing an AI agent from silently re-litigating settled architecture. Every prior document in this project's history (build-vs-buy review, execution blueprint) made specific, reasoned calls — Postgres over Neo4j, SCIP+Glean over custom indexing, no autonomous deletion, CodeQL excluded for licensing reasons — and an agent working on a later task, with no memory of that reasoning, is entirely capable of "improving" the code by reversing one of these decisions if the *reason* isn't sitting right next to the code it affects. This document is that guardrail.
- **Why standalone (rather than folded into ARCHITECTURE.md):** the two documents have fundamentally different update semantics. `ARCHITECTURE.md` is a living description that gets edited and rewritten as the system evolves. `DECISIONS.md` is **append-only** — old entries are never rewritten or deleted, even if a later decision supersedes them (a superseding entry just references the one it replaces). Mixing an append-only log with a continuously-rewritten description in the same file makes both harder to maintain correctly; keeping them separate lets each follow its own simple, consistent editing rule.
- **Audience:** primarily AI agents (as a pre-task check: "has this already been decided, and why"), secondarily human reviewers auditing why the system looks the way it does.
- **Contents:** one entry per real architectural decision, each with: the decision, the alternatives considered, the reason, and (if later superseded) a pointer to the entry that supersedes it. Not every implementation detail — only decisions that a reasonable future contributor (or agent) might otherwise second-guess or accidentally reverse.
- **How it evolves:** append-only. New entries added as new decisions are made during implementation (e.g., the Milestone 4 Glean go/no-go call, the Milestone 12 Postgres-scale verdict). Never edited retroactively except to add a "superseded by" pointer.

### 1.4 `AGENTS.md`

- **Problem it solves:** this is the operational manual — the thing an agent actually needs open, every session, before touching code: how to run the build, how to run the test suite, where fixtures live and how to add one, the repository's coding conventions, and — critically — the **definition-of-done checklist** every task must satisfy before being considered complete (matches the acceptance criteria pattern established in the execution blueprint's backlog). This is distinct from *why the system is shaped this way* (`ARCHITECTURE.md`) — it's *how to work in this codebase day to day*.
- **Why standalone:** both Codex and Claude Code already look for a file with this name (or `CLAUDE.md`) by convention as their primary operating context — using the name the tooling already expects means agents load it automatically rather than needing to be told to. Functionally, it also serves a different purpose than `ARCHITECTURE.md`: one is "what to know," the other is "what to do."
- **Audience:** primarily AI agents. Secondarily, the human reviewer, mainly to confirm the process being asked of agents is the process actually happening.
- **Contents:** build/test/lint commands, repository layout conventions (services vs. libs vs. plugins, per the execution blueprint's Section 3), the fixture-and-golden-file testing pattern, the plugin-interface contract test requirement, a short and concrete "before you mark a task done" checklist, and explicit reminders of the hard invariants that must never be violated regardless of task framing (no autonomous merge/deletion; no bypassing the confidence-tier gate; no new architectural decisions without a corresponding `DECISIONS.md` entry).
- **How it evolves:** edited as tooling/conventions change (new linter, new test command, a repo-layout adjustment) — infrequent, low-churn, but it should be treated as load-bearing and kept accurate, since a stale command in this file wastes an agent's turn immediately.

### 1.5 `STATUS.md`

- **Problem it solves:** "what milestone/task are we on, what's done, what's next" — the single living checklist tracking progress against the execution blueprint's milestone list. Without this, every new agent session has to reconstruct project state by reading git history or guessing, which wastes turns and risks duplicate or conflicting work across sessions.
- **Why standalone:** this is the **highest-churn** document in the repository — it changes with essentially every completed task. Bundling high-churn state into any of the four documents above would make their git history noisy and make it harder to spot an actual architectural change (in `ARCHITECTURE.md`/`DECISIONS.md`) buried among routine status updates.
- **Audience:** both — this is the human reviewer's primary "where are we" view, and it's also the first thing an agent should check before starting new work, to know what's already been built and what the next unblocked task is.
- **Contents:** current milestone, a checklist of tasks within it (mirroring the backlog granularity from the execution blueprint), and a short "known issues / open questions" list for anything discovered mid-implementation that needs human input before proceeding.
- **How it evolves:** continuously, as the natural byproduct of ordinary work — every completed task updates it. This is the one document where frequent small edits are the intended and healthy behavior, not a smell.

---

## 2. Repository Documentation Structure

```
dead-code-platform/
├── README.md
├── ARCHITECTURE.md
├── DECISIONS.md
├── AGENTS.md
├── STATUS.md
│
├── docs/
│   └── plugins/
│       └── PLUGIN_INTERFACE.md      # split out of ARCHITECTURE.md only once
│                                     # it grows past ~5-6 plugins (see 1.2)
│
├── services/   libs/   plugins/   cli/   fixtures/   infra/   scripts/
│   (as defined in the execution blueprint — unchanged)
```

Everything else the execution blueprint originally sketched under `docs/` (a separate `unified-graph-schema.md`, `confidence-model.md`, `evidence-sources.md`, a `runbooks/` folder) is intentionally **not** created as separate files — either consolidated into `ARCHITECTURE.md` (schema, confidence model, evidence sources) or deferred entirely (runbooks — see below). This is a deliberate correction to the earlier blueprint's default "one doc per topic" instinct, made now with the explicit AI-agent-development lens the earlier blueprint didn't yet have.

---

## 3. Documentation That Should Intentionally Not Exist (yet, or at all)

- **Separate `CONTRIBUTING.md` for humans, distinct from `AGENTS.md`.** There is exactly one human in this project's loop right now (the reviewer), and their needs — understanding conventions, checking process — are a strict subset of what `AGENTS.md` already documents. A second document repeating the same conventions in "human voice" is pure duplication risk with no one left to serve differently. Revisit only if/when external human contributors join.
- **API reference documentation, hand-maintained.** Interface signatures belong in code (with docstrings/type annotations) and should be generated from source when needed, not hand-written and hand-synced in a separate file that will drift the first time an interface changes and the doc doesn't.
- **Runbooks / incident-response documentation.** These are operationally valuable *once something is running in production and can page someone at 2am* — before Milestone 11 (CI integration, PR bot) actually deploys anything live, a runbook describes procedures for a system that doesn't exist yet, and it will be wrong by the time it matters. Create it when there is a real deployed service and a real on-call story, not speculatively.
- **A formal RFC/design-proposal process and templates.** This project has one decision-maker (the reviewer) and AI agents implementing against an already-approved blueprint; a multi-stakeholder proposal process solves a coordination problem this project doesn't currently have. If the team grows, this is cheap to introduce later — but introducing it now is pure process weight with no one for it to coordinate.
- **A style guide document.** Coding style should be enforced by a linter/formatter configuration file (checked into the repo as config, not prose) and referenced briefly from `AGENTS.md` ("run `make lint` before considering a task done"), not described in paragraphs that will drift from what the linter actually enforces.
- **A changelog file.** Git history plus `STATUS.md`'s rolling milestone record already serves this purpose at this project's current stage; a hand-maintained `CHANGELOG.md` is one more place to remember to update on every change, for an audience (external consumers tracking version-to-version changes) that doesn't exist yet for an internal platform pre-release.
- **A glossary document.** Domain terms (confidence tier, evidence bundle, blast radius, etc.) are already defined at their point of use in `ARCHITECTURE.md`; a separate glossary duplicates those definitions in a second location that has to be kept in sync with the first, for a marginal lookup convenience that doesn't offset the maintenance cost.
- **Per-service README files duplicating architecture content.** Each `services/*` and `libs/*` directory should have, at most, a few lines pointing back to the relevant `ARCHITECTURE.md` section — not its own prose description of what the service does. If a service needs a paragraph of unique explanation beyond "see ARCHITECTURE.md §1.9," that explanation belongs in `ARCHITECTURE.md` itself, not forked into a second location.
- **A separate security policy / responsible-disclosure document.** Relevant once this is an externally-facing or open-source product with outside reporters; not yet load-bearing for an internal platform in initial implementation.

---

## 4. Prioritized Creation Order

1. **`AGENTS.md`** — first, because the very first agent session (even for Milestone 0's first task) needs to know how to run tests and what "done" means; without it, early work has no consistent quality bar from task one.
2. **`ARCHITECTURE.md`** — second, and largely a condensation of already-completed work (the execution blueprint's Section 1 and the schema/confidence-model content from the build-vs-buy and blueprint documents) rather than new thinking — this is fast to produce and is the document every subsequent implementation task will actually load into context.
3. **`DECISIONS.md`** — third, seeded immediately with the settled calls already made (Postgres-over-Neo4j, SCIP+Glean, no-autonomous-deletion, CodeQL-excluded) before any new code is written, so the guardrail is in place from the very first commit rather than retrofitted after an agent has already reversed one of these decisions once.
4. **`STATUS.md`** — fourth, initialized with Milestone 0's task list from the execution blueprint the moment implementation actually starts; there's no value creating it earlier since it has nothing to track until work begins.
5. **`README.md`** — last, deliberately. It's the shortest document and the least urgent for an agent's first working session (an agent following `AGENTS.md` doesn't need README), but it's the first thing any *human* — including a future collaborator — will see, so it should be written once the other four exist and can simply be linked from it, rather than written first and then having to be updated to reflect decisions that weren't made yet.

`docs/plugins/PLUGIN_INTERFACE.md` is not in this priority list because, per Section 1.2's splitting trigger, it shouldn't be created at all until `ARCHITECTURE.md`'s plugin section actually outgrows a single section — likely around Milestone 7.
