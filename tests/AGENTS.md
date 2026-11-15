# Test-suite agent guide (`tests/`)

- Node `.mjs` files test domain and browser-independent functionality; `npm test` runs the most important groups.
- Python `pytest` files test FastAPI/Pydantic and backend adapters. Some older `test_*.py` are executable scripts rather than collected pytest tests; execute them separately where appropriate.
- Provider HTTP responses, InfluxDB writes and optional OpenOSINT calls are mocked unless an explicit live environment is configured.
- Tests must never contact police systems, run intrusive OSINT, or identify actual persons.
- Prefer stable fixtures over arbitrary current dates, especially for scenario comparison.
- `source='demo'` must be rejected from police-facing exports and server observation sync.
- Do not skip failed tests by silently modifying expectations. Report unknown environment failures precisely.

Before claiming success, record exact commands and pass/fail counts in `docs/VERIFICATION_v1.2.md` (or release-specific successor). The reference target is the current code, not a fabricated pilot outcome.
