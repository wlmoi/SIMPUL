# Backend agent guide (`server/`)

**Entry:** `server/app.py`. **Router registry:** `server/api_registry.py`. **Synthetic SUMO:** `server/simulation_engine.py` and `server/simulation_api.py`. Every new router is registered there with a distinct owner. Do not hide imports/registration inside frontend code.

- Validate JSON/query inputs with bounded Pydantic models and FastAPI parameters.
- Separate configuration/health, provider errors, and successful results. No synthetic provider responses disguised as real data.
- SQLite is the current local transactional store. The telemetry outbox is durable across InfluxDB failures; preserve idempotency semantics.
- Store credentials only in server-side environment variables. Never log full secrets or expose service tokens to browser clients.
- Existing REST paths are public on loopback for development only; do not claim production authentication.
- SUMO worker runs a synthetic example network and must not be represented as a validated Fatmawati simulation.
- Public intelligence may only call OpenOSINT `search_gdelt_geo` with fixed transport topics and bounded geographic parameters. Never import unrelated OSINT tooling into this application.
- Classification is deterministic operational triage; legal determinations must remain `NOT_DETERMINED`.

**Change flow:** inspect `server/api_registry.py` and affected Pydantic models → write API contract test → implement → run targeted `pytest` → verify `/openapi.json` or `/docs` via TestClient → update docs.

**Verification:** `python -m pytest -q tests/test_api_registry.py tests/test_api.py tests/test_public_intelligence.py tests/test_traffic_classification_api.py`. Additional tests are listed in `config/module-catalog.json`.
