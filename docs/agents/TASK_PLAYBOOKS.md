# SIMPUL task playbooks

These are short runbooks for coding agents. Apply only the relevant recipe; do not modify unrelated modules.

## A. Add a frontend page

**Owner:** `js/page-registry.js`, `js/data.js`, `js/views/<page>.js`.

1. Confirm the page helps observe, analyze, simulate, evaluate, or document SIMPUL.
2. Implement a pure `render<Name>()` function in a new view.
3. Add its route ID to `js/data.js` and its renderer to `js/page-registry.js`.
4. Wire a `data-action` handler in `js/app.js` only if new user interaction is required.
5. Update `config/module-catalog.json` ownership and add tests for the new flow.
6. Run `npm test`, `python tools/build_standalone.py`, `node --check tmp/bundled_app.js`.

**Done:** all routes render, action has a real effect, no synthetic outputs labeled as field evidence.

## B. Add an external API

**Owner:** one `server/<service>.py`, registration in `server/api_registry.py`, documentation and tests.

1. Confirm licensing, data privacy, and whether the source is observed measurement or contextual data.
2. Use fixed upstream API hosts and bounded parameters. Store key in backend env.
3. Define schema, timeouts, rate limits, attribution, freshness and error states.
4. Expose status/configuration separately from the data retrieval endpoint.
5. Write mock-response success and failure tests; live tests are additional and optional.
6. Update `docs/API_REFERENCE.md`, `.env.example`, module catalog and UI source labels.

**Done:** missing key = explicit unavailable response, failure ≠ fabricated success, external data cannot become primary observations silently.

## C. Modify traffic classification

**Owner:** `js/classification.js` and `server/traffic_classification.py`.

1. Define the field and exact semantics (observed behavior / impact / context).
2. Preserve `unknown` instead of turning absence of evidence into `no`.
3. Keep P1–P4 as operational priorities and `legalConclusion='NOT_DETERMINED'`.
4. Update browser/backend mirror tests. Check manual-only exports and no demo leakage.
5. Validate reviewers' outcomes never imply government approval.

**Done:** both engines agree on representative cases and no person identification is introduced.

## D. Change monitoring, data sync or Grafana

**Owner:** `server/storage.py`, `server/timeseries.py`, `infrastructure/grafana/`.

1. Identify the canonical SQLite table and the outbox entry.
2. Keep event ID/timestamp idempotency; maintain retry on delivery failure.
3. Add only aggregate or minimised time-series fields. No raw notes, identities, imagery.
4. Update Flux panel queries and tests with mocked InfluxDB responses.
5. Verify no partial ingestion loss. Mark Docker live checks separately.

**Done:** failures preserve the canonical event; dashboards don't conflate demo vs manual.

## E. Change SUMO simulation

**Owner:** `server/simulation_engine.py` (synthetic model), `server/simulation_api.py` (jobs), and `js/analytics.js` (heuristic demo), plus appropriate tests.

1. State whether result originates from **heuristic** or **actual SUMO execution**.
2. Preserve A0/A1/A2 demand and seed comparability.
3. Never call the test network a verified Fatmawati twin.
4. Add reproducibility tests and report constraints, model errors, parameter units.
5. Do not use SUMO predictions as causal claims absent field validation.

**Done:** outputs clearly identify engine, seed, data provenance and calibration status.

## F. Change data structures or exports

**Owner:** `js/store.js`, `js/services/export-data.js`, server Pydantic models as necessary.

1. Show source record before/after; list migration expectations.
2. Preserve manual observations and review history in legacy browser state.
3. Validate unknown/default behavior explicitly.
4. Test CSV escaping and that police exports exclude synthetic observations.
5. Add a format/version marker if interoperability contracts change.

**Done:** older local data survives, exports retain original meaning, version changes are documented.

## G. Release checklist

```bash
npm run verify
python -m pytest -q tests/test_api_registry.py tests/test_build_standalone.py
python -m pytest -q tests/test_public_intelligence.py tests/test_traffic_classification_api.py
```

Additional tests in `config/module-catalog.json` are required when their module changed. Build result, source, and verification status belong in README and release verification report. No claim of production or certification without independent evidence.
