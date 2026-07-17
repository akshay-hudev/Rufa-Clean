# STATUS.md

This is the current, living state of the project — what milestone we're on, what's done, what's next. This file changes constantly and that's expected; frequent small edits here are healthy, unlike in `ARCHITECTURE.md` or `DECISIONS.md`. Before starting new work, check here first. After finishing a task, update here before considering the task done (see `AGENTS.md` §5).

---

## Current milestone: Milestone 0 — Single-repo, single-language static reachability CLI

**Objective:** prove the SCIP → graph → query pipeline end to end on one language (TypeScript), one repo, with a CLI answering "what's unreferenced here."

**Not yet started.** This is the first milestone; nothing has been implemented yet.

### Task checklist

- [ ] **T0.1** — Define unified graph schema v1 (File, Symbol nodes; imports/calls edges). Postgres migration creating `nodes`/`edges` tables with JSONB metadata and reverse-adjacency indexes. *Blocked on: nothing — this is the first task.*
- [ ] **T0.2** — Implement `indexer-runner` for TypeScript (wraps `scip-typescript`). *Blocked on: nothing (independent of T0.1).*
- [ ] **T0.3** — Implement `scip-normalizer` (SCIP → `GraphDelta`). *Blocked on: T0.1, T0.2.*
- [ ] **T0.4** — Implement `unified-graph` upsert + reverse-reachability query. *Blocked on: T0.1, T0.3.*
- [ ] **T0.5** — Build `find-unreferenced` CLI command wiring T0.2–T0.4 together. *Blocked on: T0.1–T0.4.*
- [ ] **T0.6** — Golden-file test harness (reusable fixture + expected-output + assertion-runner pattern used by every later milestone). *Blocked on: T0.5.*

**Next unblocked task:** T0.1 or T0.2 (independent of each other — either can be started first).

### Definition of done for this milestone

Running the CLI against `fixtures/ts-monorepo-basic` and against one real internal TS repo produces a reviewed-correct unreferenced-symbol list with zero known false negatives on the fixture set.

---

## Upcoming milestones (not started, listed for orientation only — do not begin until Milestone 0 is done)

1. Multi-language support (Python, Go, Java)
2. Monorepo/workspace-aware root-set discovery
3. Framework plugins (Knip + Vulture integration)
4. Glean integration + cross-repo references — **go/no-go checkpoint, see Known Issues below**
5. Confidence engine v1 (static evidence only)
6. Registry crawler + version alignment
7. DI/reflection convention plugins (JVM/.NET)
8. Infrastructure extraction — **depends on org confirming OCI image-label convention, see Known Issues below**
9. Microservice contract edges (REST/gRPC first)
10. Runtime evidence via OpenTelemetry — **includes bytecode-agent go/no-go prototype, see Known Issues below**
11. Reporting, PR bot, CI integration
12. Scale hardening — **Postgres-vs-graph-database benchmark checkpoint, see Known Issues below**

---

## Known issues / open questions

These are tracked here because they require human input or a specific validation step before proceeding — they are not blockers on Milestone 0, but should not be forgotten as later milestones approach.

- **`AGENTS.md` §3 (build/test/lint commands) is still a placeholder.** No implementation language/toolchain has been chosen yet. This must be resolved as part of T0.1/T0.2 — whoever picks up the first task should choose the toolchain, fill in `AGENTS.md` §3, and add a corresponding entry to `DECISIONS.md`.
- **Glean adoption (D-003) is unresolved until Milestone 4.** Build as planned, but do not treat cross-repo resolution via Glean as guaranteed — the fallback (declared-dependency edges via `registry-crawler` feeding `unified-graph` directly) is documented and should be kept viable.
- **OCI image-label convention (D-011) needs organizational confirmation before Milestone 8.** Not yet raised with platform/infra teams. Raise this well before Milestone 8 starts, not during it.
- **Bytecode-agent necessity (D-006) is unresolved until the Milestone 10 prototype runs.** Default is OTel-only; do not add Codekvast-style instrumentation before that prototype's result is in.
- **Postgres-vs-graph-database (D-005) is unresolved until the Milestone 12 benchmark.** A lightweight early sanity check (synthetic graph at partial scale) is recommended right after Milestone 1 completes, specifically so a scaling problem is caught early rather than at Milestone 12.
- **Confidence-engine weights are uncalibrated defaults from Milestone 5 onward.** Recalibration is expected after Milestone 11 accumulates roughly 50+ human-reviewed findings — track that count here once Milestone 11 ships.
- **DI-plugin scope (D-008) is currently unset.** Which 2–3 conventions to target in Milestone 7 should be chosen based on the org's actual repos, once enough real repos have been indexed (Milestones 1–2) to know what's actually in use — not decided speculatively now.

---

## How this file evolves

Updated continuously, as the direct byproduct of ordinary work: check a task box, add a new task if one is discovered mid-milestone, move to the next milestone's checklist when the current one's definition of done is met, add or resolve a "known issue" entry as needed. Do not let this file fall behind actual repository state — if in doubt about what's actually done, check the code and fixtures, then correct this file to match.
