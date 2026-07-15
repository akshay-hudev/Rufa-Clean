# PDMv2

## Prerequisites

- PostgreSQL, with `DATABASE_URL` configured for the service.
- [Vulture](https://github.com/jendrikseipp/vulture) available on `PATH` for Python dead-code analysis. Install it with `pipx install vulture` or `pip install vulture`.

## Design notes

- [Human-gated dead-code removal](docs/human-gated-removal.md) describes the
  boundary between confidence verdicts, reviewer confirmation, Piranha-generated
  changes, build/test validation, and pull requests.
- [PolyglotPiranha manual spike](docs/piranha-spike.md) records the first
  real-repository probe and why its acceptance bar did not pass.
- [Simple removal pipeline](docs/simple-removal-pipeline.md) documents the guarded
  `confirmed_dead` → patch → build/test gate → pull-request implementation.
