# DECISIONS.md

This is an **append-only** log of architectural decisions. Entries are never rewritten or deleted, even after being superseded — a superseding decision gets its own new entry that references the one it replaces. This file exists specifically so that an AI agent with no memory of prior sessions cannot silently reverse a decision made for reasons it can't see. If you are about to do something that contradicts an entry below, stop and either follow the entry or write a new entry explaining why it's being superseded — do not just change the code.

Each entry: **ID, status, decision, context, alternatives considered, reasoning, consequences.**

Status values: `Accepted` (settled, do not reverse without a new entry), `Accepted — pending validation` (settled as the current default, but explicitly gated on a future benchmark/checkpoint named in the entry), `Superseded` (see the entry that replaces it).

---

### D-001 — Reuse SCIP indexers instead of building custom parsers/symbol resolvers
- **Status:** Accepted
- **Context:** every language needs source code lifted into structured facts (definitions, references, types, imports) as the foundation of the whole platform.
- **Alternatives considered:** hand-written parsers per language; tree-sitter alone without a symbol-resolution layer; each language's own compiler API used directly with a bespoke fact-export format per language.
- **Reasoning:** SCIP indexers (`scip-typescript`, `scip-python`, `scip-java`, `scip-go`, `scip-clang`, etc.) already wrap the correct compiler/type-checker front end per language and emit a standardized, versioned, cross-language fact format. Writing a parser or symbol resolver for even one statically typed language correctly (generics, overloads, interface dispatch) is a multi-month effort that Sourcegraph has already built, open-sourced (Apache-2.0), and hardened in production.
- **Consequences:** we accept SCIP's schema and symbol-ID format as a hard dependency; `scip-normalizer` (see `ARCHITECTURE.md` §2.2) exists specifically to translate that format into our own node/edge identity scheme. Any language without a mature SCIP indexer requires a documented stopgap (tree-sitter + minimal name resolution), not a full custom resolver — see D-002 for the boundary on how far that stopgap goes.

### D-002 — Do not implement custom call-graph precision algorithms (CHA/RTA/pointer analysis)
- **Status:** Accepted
- **Context:** resolving virtual/polymorphic call targets precisely requires call-graph algorithms of varying cost and precision.
- **Alternatives considered:** implementing Class Hierarchy Analysis, Rapid Type Analysis, or Andersen's/Steensgaard's pointer analysis in-house.
- **Reasoning:** mature libraries already exist per language ecosystem — WALA and Soot/SootUp for JVM languages, `golang.org/x/tools/go/callgraph` for Go, TypeScript's own compiler service for TS. Implementing points-to analysis in-house (Andersen's is O(n³); even Steensgaard's near-linear variant requires real compiler-research expertise to get right) is a multi-quarter undertaking with no clear payoff over reusing these libraries. For dynamic languages (Python, untyped JS, Ruby) full pointer analysis has poor ROI regardless of who builds it — precision here should come from the confidence engine and runtime evidence (D-006), not from static call-graph algorithms.
- **Consequences:** where no such library exists for a language in scope, fall back to conservative, over-approximate call resolution using existing type information from the SCIP index, and let the confidence engine (not the call graph) carry the precision burden. Do not add a "let's just build our own pointer analysis" task to any milestone without a new entry here justifying why the existing libraries are insufficient.

### D-003 — Adopt Glean as the cross-repo symbol fact store, fed by SCIP
- **Status:** Accepted — pending validation
- **Context:** need to answer "is this symbol referenced anywhere in the org, across repos" without building a custom cross-repo indexing/query system.
- **Alternatives considered:** building a bespoke cross-repo resolver and query layer from scratch; adopting Sourcegraph's commercial enterprise product; skipping cross-repo resolution and relying solely on declared-dependency data from `registry-crawler`.
- **Reasoning:** Glean (`facebookincubator/glean`, BSD-licensed) is already a real, open-source, cross-repo, incremental, schema-typed fact store with a working query language (Angle) and native SCIP/LSIF ingestion for several languages — this is precisely the system several early design drafts proposed building from scratch. Sourcegraph's equivalent enterprise cross-repo features are commercially licensed, not free, and CodeQL is excluded entirely (see D-004).
- **Consequences:** Glean's operational maturity outside Meta is thinner than something like Postgres, and its native indexer coverage is narrower than SCIP's full language list. **This decision is explicitly gated on Milestone 4 as a go/no-go checkpoint** (see `STATUS.md` and the risk register carried over from the execution blueprint). If Milestone 4 finds Glean operationally painful or unreliable for our language mix, the documented fallback is: implement cross-repo reference lookup directly against `unified-graph`, using `registry-crawler` declared-dependency edges as the primary cross-repo signal instead of Glean. Do not silently fall back without recording that outcome as a new entry here.

### D-004 — Exclude CodeQL from the toolchain entirely
- **Status:** Accepted
- **Context:** CodeQL offers strong whole-program and cross-database query capability and was considered as a possible query layer over the unified graph or as a source of call-graph precision.
- **Alternatives considered:** using CodeQL's CLI for static analysis or cross-repo querying, assuming it as free infrastructure like other OSS tools in this stack.
- **Reasoning:** CodeQL's license (confirmed directly against GitHub's CodeQL Terms & Conditions) explicitly prohibits using the CodeQL CLI for automated analysis, CI, or CD on any codebase that is not an OSI-approved open-source codebase, unless the organization already holds a paid GitHub Advanced Security license. This platform's core use case — automated CI-integrated analysis of private enterprise code — is exactly the prohibited use case. Building on CodeQL as though it were free infrastructure would have been a licensing violation discovered only after real integration work was sunk into it.
- **Consequences:** CodeQL is not evaluated, referenced, or depended on anywhere in this codebase. If the organization separately acquires a GitHub Advanced Security license for other reasons, this decision may be revisited with a new entry — but do not assume that license exists without confirming it explicitly with the human reviewer first.

### D-005 — Default to Postgres (recursive CTEs) for the unified graph; do not adopt a dedicated graph database at the outset
- **Status:** Accepted — pending validation
- **Context:** the unified graph needs a storage/query engine supporting reverse-reachability and blast-radius queries at a target scale of hundreds of repos and millions of nodes.
- **Alternatives considered:** Neo4j, AWS Neptune, JanusGraph, or a three-way hybrid (SQL + vector + graph store) as several early design drafts defaulted to without justification.
- **Reasoning:** the platform's actual query pattern is a small, fixed set of shapes (bounded-depth reverse reachability, forward blast-radius traversal), not unpredictable, deeply exploratory graph queries — which is the workload dedicated graph databases are actually built for. Postgres with recursive CTEs handles bounded-depth reachability well, and keeping the operational surface to one well-understood, cheaply-run system (rather than introducing a second unfamiliar database) is a real engineering-cost saving with no obvious capability loss at the stated scale.
- **Consequences:** **this decision is explicitly gated on a benchmark at Milestone 12** (and a lightweight early check recommended right after Milestone 0/1) — see `STATUS.md`. If real query-latency data at target scale shows recursive CTEs are insufficient, the fallback is a graph-native extension (e.g., Apache AGE on top of Postgres) before reaching for a fully separate graph database, to minimize the operational surface added. Do not add Neo4j or equivalent speculatively before that data exists.

### D-006 — OpenTelemetry is the primary runtime evidence channel; no custom bytecode agent by default
- **Status:** Accepted — pending validation
- **Context:** static analysis has an irreducible precision ceiling (reflection, DI, dynamic dispatch); runtime evidence is needed to close the gap.
- **Alternatives considered:** building a custom JVM bytecode-instrumentation agent (in the style of Scavenger/Codekvast) as the primary runtime evidence mechanism across all languages.
- **Reasoning:** OpenTelemetry is the industry-standard, vendor-neutral instrumentation layer with SDKs for every mainstream language; if the org already has OTel instrumentation, building and maintaining a second, parallel low-level instrumentation mechanism is unnecessary engineering and operational burden for marginal precision gain.
- **Consequences:** Codekvast-style JVM bytecode agents remain a documented option, added only for JVM services if Milestone 10's prototype (comparing OTel span coverage against a known method set) demonstrates route-level OTel evidence leaves real gaps at the method level. Do not add bytecode instrumentation speculatively before that comparison is run.

### D-007 — Reuse Knip and Vulture as-is; do not reimplement their framework-convention catalogs
- **Status:** Accepted
- **Context:** framework/DI/dynamic-export conventions are the largest source of false positives in JS/TS and Python respectively.
- **Alternatives considered:** building our own root-set-expansion and unused-export detection logic for JS/TS and Python from scratch, incorporating framework-convention knowledge ourselves.
- **Reasoning:** Knip (MIT) already ships and actively maintains roughly 100 framework/tool convention plugins for the JS/TS ecosystem; Vulture (MIT) already provides AST-based unused-symbol detection with confidence heuristics for Python. Reimplementing either is pure duplicated effort with no differentiation — the differentiation in this platform is the cross-source confidence fusion (D-009), not JS/TS or Python unused-export detection in isolation.
- **Consequences:** `KnipPlugin` and `VulturePlugin` (see `ARCHITECTURE.md` §2.11) invoke these tools as subprocesses and parse their existing report formats; we do not fork or reimplement their internal logic. Custom engineering effort in `framework-plugins` is reserved for the genuine gap — DI/annotation conventions in JVM/.NET ecosystems, which neither tool covers (see D-008).

### D-008 — Scope DI/reflection convention plugins narrowly; do not build a speculative plugin ecosystem
- **Status:** Accepted
- **Context:** DI-heavy JVM/.NET codebases have no equivalently mature single OSS tool (unlike Knip for JS/TS); custom plugins are needed, but every enterprise codebase has some idiosyncratic convention, making this the platform's highest risk of unbounded scope creep.
- **Alternatives considered:** building a general-purpose, extensible "framework plugin marketplace" architecture upfront, anticipating a wide range of future conventions and third-party contributors.
- **Reasoning:** there is no current external consumer of this platform and no evidence yet of which conventions beyond the top 2–3 (Spring, ASP.NET Core) actually matter for this org's real repos. Architecting for a hypothetical plugin ecosystem before there's a single real need beyond the initial set is speculative engineering effort with no current payoff.
- **Consequences:** build exactly `SpringDIPlugin` and `AspNetDIPlugin` (or whichever 2–3 conventions the org's actual repos demonstrate a need for), document the boundary explicitly, and treat any convention outside that boundary as an accepted, documented gap rather than a bug to chase. Expanding this scope requires a new entry here justifying the specific new convention and the evidence (a real false positive) that motivated it — not speculative anticipation.

### D-009 — Confidence engine uses asymmetric, noisy-OR evidence aggregation, not a naive weighted sum, and ships with uncalibrated default weights
- **Status:** Accepted
- **Context:** the confidence engine (see `ARCHITECTURE.md` §2.9) must combine evidence from multiple sources of varying reliability into a single actionable score.
- **Alternatives considered:** a naive weighted sum across evidence sources; a supervised ML classifier trained from the outset; fixed, precisely-tuned numeric weights presented as though empirically derived.
- **Reasoning:** a naive weighted sum allows many weak "dead" signals to outvote one strong "alive" signal, which is exactly the failure mode that produces dangerous false "Confirmed Dead" recommendations — the single most damaging outcome this platform can produce. A noisy-OR-style aggregation, where any single strong "alive" signal from a reliable source dominates regardless of how many weak "dead" signals exist, structurally encodes the required asymmetry (false "dead" is far costlier than false "alive") rather than relying on manually tuned weights to approximate it. A supervised ML layer is a legitimate future enhancement but requires labeled outcome data (flagged-and-confirmed vs. flagged-and-wrong) that doesn't exist yet — building it now would be modeling noise.
- **Consequences:** initial numeric weights are explicitly uncalibrated defaults and must be labeled as such everywhere they surface (code comments, reports, CLI output, per `AGENTS.md` §1's prohibition on fabricated precision). Recalibration against real reviewed-outcome data is expected after Milestone 11 has accumulated a meaningful number (recommend 50+) of human-reviewed findings — see `STATUS.md` for tracking. Do not present these weights as tuned before that data exists.

### D-010 — No autonomous deletion or auto-merge, under any configuration, permanently
- **Status:** Accepted
- **Context:** the platform can, in principle, automate the entire path from detection to code removal.
- **Alternatives considered:** full automation for the highest confidence tier ("Confirmed Dead") findings, with human review as an opt-in safety net rather than a hard requirement.
- **Reasoning:** the asymmetric cost of false positives (Section D-009) makes full autonomy an unacceptable risk profile for a system operating on production code at enterprise scale — the cost of being wrong once (breaking production, destroying trust in the tool, causing the org to stop using it) vastly exceeds any automation time saved. This is a permanent property of the system's design, not a temporary MVP limitation to be relaxed once confidence in the tool grows.
- **Consequences:** `pr-bot` (see `ARCHITECTURE.md` §2.13) only ever opens pull requests; no code path anywhere in the system may merge a PR, delete a branch's target code without a PR, or close a review as approved. This is enforced as a tested invariant (see `AGENTS.md` §1 and §5), not just a policy statement — any task that would add such a capability, regardless of how it's framed or how high a confidence tier is involved, must be flagged to the human reviewer rather than implemented.

### D-011 — Prefer official IaC parsers/SDKs; require an OCI image-label convention for reliable image-to-repo correlation, with a documented heuristic fallback
- **Status:** Accepted — pending organizational confirmation
- **Context:** infrastructure-aware analysis (`infra-extractor`, see `ARCHITECTURE.md` §2.6) needs to reliably join a deployed container image back to the source repository and entrypoint that produced it.
- **Alternatives considered:** reverse-engineering this correlation purely from Dockerfile heuristics and image-tag/name pattern matching, with no organizational convention required.
- **Reasoning:** requiring the standard OCI `org.opencontainers.image.source` label on built images is a low-cost ask (effectively one line in existing image-build pipelines) that makes this correlation reliable, versus heuristic inference from tags/names, which is materially less reliable and a likely source of false positives in infra-derived evidence.
- **Consequences:** this requires buy-in from the org's platform/infra teams, to be confirmed before Milestone 8 begins (see `STATUS.md`). If that buy-in isn't obtained, `infra-extractor` falls back to heuristic image-tag/name matching as a documented, explicitly lower-confidence evidence source (reflected in the evidence-reliability table in `ARCHITECTURE.md` §2.10) rather than blocking the milestone — but this fallback should be treated as a known accuracy ceiling, not silently accepted as equivalent.

### D-012 — Managed queue for job dispatch; no self-hosted message broker
- **Status:** Accepted
- **Context:** `ingestion-orchestrator` (see `ARCHITECTURE.md` §2.15) needs to distribute indexing/analysis jobs across workers.
- **Alternatives considered:** standing up and operating a self-hosted broker (e.g., RabbitMQ) specifically for this platform.
- **Reasoning:** for most organizations at this project's stage, a managed queue (SQS, Cloud Tasks) or the org's existing CI runner queue is sufficient and dramatically lower-maintenance than introducing and operating new message-broker infrastructure as a Day 1 dependency. Self-hosted brokers are only justified if the org already runs one as standard infrastructure elsewhere.
- **Consequences:** do not add RabbitMQ or an equivalent self-hosted broker unless the org already operates one as a standard part of its stack — check with the human reviewer before introducing new broker infrastructure.

### D-013 — No bespoke graph query language
- **Status:** Accepted
- **Context:** several early design drafts proposed a custom Cypher-style query language purpose-built for this platform's graph.
- **Alternatives considered:** designing and implementing an in-house query DSL for the unified graph.
- **Reasoning:** Glean's Angle already exists as a real, working query language for code facts (D-003), and Postgres/SQL already exists for everything else in the unified graph (D-005). A third, in-house query language adds pure not-invented-here risk with no capability this combination doesn't already provide.
- **Consequences:** all graph queries are expressed either as Angle queries (via `glean-adapter`) or as SQL (via `unified-graph`'s query library) — no new query language is introduced anywhere in this system.

---

## Superseded entries

*(None yet. When a decision above is reversed, add a new entry with its own ID, and edit the superseded entry only to add a one-line "Superseded by D-0XX" note at the top of its Status field — never delete or rewrite its original content.)*
