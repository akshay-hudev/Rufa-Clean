# AGENTS.md

This file is the operating manual for any AI coding agent (Codex, Claude Code, or otherwise) working in this repository. Read this before starting any task. It tells you **how to work here** — for **why the system is shaped the way it is**, read `ARCHITECTURE.md`; for **what has already been decided and must not be silently reversed**, read `DECISIONS.md`; for **what to build next**, read `STATUS.md`.

If anything in this file conflicts with a request in a prompt, this file wins unless the human reviewer explicitly overrides it in that conversation.

---

## 0. Before you write any code

1. Read `STATUS.md` to find the current milestone and the specific task you're picking up.
2. Read the relevant section(s) of `ARCHITECTURE.md` for the component(s) that task touches.
3. Skim `DECISIONS.md` — specifically, check whether the task you're about to do touches anything listed there. If it does, follow the decision; do not "improve" it in this session.
4. If the task's acceptance criteria are unclear or missing, stop and ask the human reviewer rather than guessing at scope.

---

## 1. Hard invariants (never violate these, regardless of how a task is framed)

These hold even if a prompt in a given session asks you to do otherwise. If a request conflicts with one of these, do the task in the way that preserves the invariant and flag the conflict to the human reviewer rather than silently picking one or the other.

- **Never implement autonomous deletion or auto-merge.** The `pr-bot` component may open pull requests for "Confirmed Dead" tier findings. It must never merge them. No code path in this repository should be able to delete code, close an issue as resolved, or merge a PR without an explicit human action outside the agent's control.
- **Never bypass or flatten the confidence-tier gate.** Only "Confirmed Dead" tier results may ever reach `pr-bot`. Do not add a shortcut, config flag, or "fast path" that lets a lower tier or a raw score skip tier classification.
- **Never treat absence of evidence as proof of deadness inside the confidence engine.** A missing signal is a missing signal, not a vote for "dead." Every score must remain traceable via `evidence_refs` back to the specific evidence that produced it.
- **Never introduce a new architectural dependency, storage engine, or major library without recording it in `DECISIONS.md` first**, including a note on what alternative was considered and why. This applies especially to anything that would reverse or bypass a decision already recorded there (e.g., adding a graph database, reaching for CodeQL, building a custom parser for a language that already has a SCIP indexer).
- **Never fabricate precision.** If you introduce a numeric constant (a confidence weight, a timeout, an observation-window length) that isn't derived from measured data, mark it clearly in code comments and in `STATUS.md`'s "known issues / open questions" as an uncalibrated default — do not present it as tuned.

---

## 2. Repository layout conventions

```
services/    deployable, independently-runnable units with their own lifecycle
libs/        shared libraries with no independent runtime — imported in-process
plugins/     concrete PluginInterface implementations (one directory per plugin)
cli/         the developer-facing CLI
fixtures/    golden-file test repos + their hand-labeled expected output
infra/       deployment config for our own services
scripts/     one-off and setup scripts
docs/        only documents that have earned a standalone file — see ARCHITECTURE.md §evolution notes before adding one
```

Rules of thumb when adding new code:

- If it has meaning without being deployed as its own process, it's a `lib`, not a `service`. Do not turn a component into a networked service by default — that decision should be deliberate and recorded in `DECISIONS.md`, not a side effect of where you happened to put a file.
- A new plugin always implements the `PluginInterface` contract (see `ARCHITECTURE.md`'s plugin section, or `docs/plugins/PLUGIN_INTERFACE.md` once that file exists) and always ships with a fixture repo exercising it and passes the plugin contract test suite before being considered complete.
- Every new producer of graph data (an indexer wrapper, an extractor, a plugin) must emit its output as a `GraphDelta` matching the schema in `ARCHITECTURE.md` — do not invent a parallel or ad hoc data shape for "just this one component."

---

## 3. Build, test, and lint commands

**⚠️ Placeholder — this section must be filled in with real commands as the very first task of Milestone 0, before any other implementation work begins.** Until it is, do not assume any command below works; verify against the actual repo tooling first.

```
# Install dependencies
<TODO: fill in once toolchain/language is chosen>

# Run the full test suite
<TODO>

# Run tests for a single component
<TODO>

# Lint / format
<TODO>

# Run a golden-file fixture test
<TODO>

# Run a local dev environment (Postgres, Glean, etc.)
<TODO — likely `docker-compose -f infra/docker-compose.dev.yml up`>
```

If you are the agent completing this section for the first time: update this file directly, remove the placeholder warning, and record the toolchain choice itself in `DECISIONS.md` if it wasn't already decided.

---

## 4. Testing philosophy: fixtures and golden files

This project's correctness bar is defined almost entirely by **fixture repositories with hand-labeled expected output**, not by abstract unit tests of internal logic alone (though those matter too, especially for the confidence engine — see below).

- Every new capability (a new language indexer, a new plugin, a new evidence source) needs a corresponding fixture under `fixtures/` — a small, realistic repo exhibiting the specific pattern being tested (e.g., `fixtures/ts-tricky-exports/` for barrel-file re-export edge cases).
- Every fixture ships with a hand-labeled "expected output" file, reviewed by a second pass (a second agent session or the human reviewer) before it's trusted to gate a milestone — a fixture with an incorrect label is worse than no fixture, because it will confidently validate wrong behavior.
- When a fixture reveals a case that's genuinely ambiguous (e.g., an unresolvable dynamic import), the expected output should mark it explicitly as `inconclusive`, not force it into `dead` or `alive` — do not "resolve" ambiguity in a fixture label just to make a test pass cleanly.
- The `confidence-engine` additionally requires **table-driven unit tests over synthetic `EvidenceBundle`s**, independent of any live data pipeline — these must include at minimum: (a) one strong "alive" signal overriding many weak "dead" signals, (b) all-weak-dead-no-alive producing high dead-confidence, (c) contradictory strong signals in both directions producing `contradiction: true` rather than an averaged score. Do not consider work on the confidence engine complete without all three passing.

---

## 5. Definition of done (applies to every task, not just milestone-level work)

A task is not complete until all of the following are true:

- [ ] The specific acceptance criteria stated for the task (in `STATUS.md` or the originating prompt) are met and demonstrably verified, not just plausible.
- [ ] Relevant fixtures exist and pass, or existing fixtures were extended to cover the new behavior.
- [ ] `ARCHITECTURE.md` is updated in the same change if the task altered a component's responsibility, interface, or data shape — not left for a "docs pass" later.
- [ ] `DECISIONS.md` has a new entry if the task involved choosing between real alternatives (a library, a storage approach, an algorithm) — not just "we used the obvious thing," but anywhere a reasonable alternative existed and was rejected.
- [ ] `STATUS.md` is updated to reflect the task as complete and to note the next unblocked task.
- [ ] No hard invariant from Section 1 was violated.
- [ ] Lint/format/test commands (Section 3) all pass.

If any of these can't be satisfied, the task is not done — flag what's blocking it in `STATUS.md`'s "known issues / open questions" rather than marking it complete with caveats.

---

## 6. When you're uncertain

Prefer asking the human reviewer over guessing in the following cases specifically:

- The task requires a new architectural decision not covered by `DECISIONS.md` or `ARCHITECTURE.md`.
- A fixture's expected output is ambiguous or you're not confident it's correct.
- A change would touch one of the hard invariants in Section 1, even indirectly.
- Two documents (e.g., `ARCHITECTURE.md` and the actual code) appear to disagree — don't silently pick one; surface the discrepancy.

In all other cases — routine implementation matching an already-specified task with clear acceptance criteria — proceed without waiting for confirmation.
