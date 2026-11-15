# SIMPUL v0.7 — Actual Verification Report

**Test environment:** Linux development container; Python 3.13 / FastAPI / Pydantic 2; Node.js 22; Chromium/Playwright. No Docker daemon was available. Existing external API providers were tested with mocked upstream responses; InfluxDB writes were tested with a mocked HTTP transport.

| Executed check | Result | Evidence and scope |
|---|---|---|
| `python tools/build_standalone.py` | PASS | Self-contained HTML builds; bundle syntax validated with Node.js |
| `npm test` | PASS | Finance/scenario calculations; monitoring aggregation and provenance |
| `node tests/test_state_migration.mjs` | PASS | Legacy browser data preserved; obsolete FPGA settings removed |
| `python tests/test_api.py` | PASS | API status, SQLite sync, deduplication and external provider mocks |
| `python tests/test_extended_api.py` | PASS | Nine additional context endpoints, validation and mocked upstreams |
| `python tests/test_timeseries.py` | PASS | Influx HTTP write mock, SQLite outbox, failure retry, duplicate IDs, legacy SQLite backfill, notes excluded |
| `python tests/test_proposal_alignment.py` | PASS | Proposal stages and A0/A1/A2 consistency |
| `python tests/smoke_test.py` | PASS | 14 application routes, finance, observation, exports, mobile 390 px, no JS exceptions |
| `python tests/test_monitor_ui.py` | PASS | Monitoring filter, log CSV, status cards, default OFF autosync, desktop/mobile screenshots and no overflow |
| `python tests/test_connected_ui.py` | PASS | API UI with mocked upstream response and local sync |
| `python tests/test_context_plus_ui.py` | PASS | Routing and geospatial UI mock, mobile responsiveness |
| YAML parser + JSON schema shape inspection | PASS | Docker Compose, Grafana datasource + dashboard provisioning YAML, 7 dashboard panels |

## Not verified in this environment

- **Live Docker:** container startup, port allocation, persistence, real InfluxDB write, Grafana login and datasource resolution. These require Docker Desktop or Docker Engine on the user's workstation.
- **Actual field measurement:** no verified Fatmawati observational dataset or calibrated simulation; values shown in demo remain synthetic.
- **Real Gemini or commercial provider calls:** external APIs not exercised with user credentials; do not infer availability from passing mock tests.
- **Production safety:** no multi-user authentication, HTTPS termination, scoped workspace permissions, security review, or commissioned field pilot.

The implementation is a **functional local prototype**, not a verified, production-ready mobility monitoring service.


## v0.8 decision intelligence verification — 15 November 2026

Executed in the authoring environment:

- `npm test`: PASS across engine/finance, monitoring, and new diagnostics formulas; baseline normalization, demo exclusion, matched before-after, transparent heuristic guardrails.
- `node tests/test_state_migration.mjs`: PASS, legacy workspace data retained.
- `python tests/test_timeseries.py`: PASS, existing event outbox and mocked InfluxDB transport.
- `python tests/test_proposal_alignment.py`: PASS, original four-stage proposal and A0/A1/A2 scope.
- `python tests/test_api.py`: PASS, existing API/storage and provider contracts.
- `python -m pytest -q tests/test_field_readings.py`: 2 passed, includes Pydantic schema validation, SQLite idempotence, conflict HTTP409, source filtering, interval line protocol.
- `python -m pytest -q tests/test_decision_ui.py tests/test_field_readings.py`: 3 passed; 16 routes rendered in Chromium with inline standalone markup, baseline/follow-up input, A1/A2 comparison switch, decision log and 390px mobile width without overflow.
- `python tools/build_standalone.py`: PASS, self-contained HTML with modular JS and inlined CSS generated.

**Not verified:** field operation in Fatmawati, independent annotation/precision, actual SUMO calibration, real InfluxDB/Grafana Docker containers, mobile device network/HTTPS installation, real customer uptake. Visual UI test used Chromium inline document because browser navigation to local URL was administratively blocked; this does not constitute a production deployment test.

## v0.9 international-practice release checks — 15 November 2026

The following commands were **actually executed** against the copied v0.9 source:

| Test | Observed result |
|---|---|
| `python tools/build_standalone.py` | PASS; generated standalone HTML |
| `npm test` | PASS; four JS test groups including the new standards checks |
| `python -m pytest -q tests/test_international_api.py tests/test_api.py tests/test_field_readings.py tests/test_timeseries.py tests/test_proposal_alignment.py` | PASS; 6 pytest tests (some original tests are standalone scripts and are not collected by pytest) |
| `node --check docs/bundled_app.js` | PASS; combined browser script parses |
| Playwright Chromium `page.set_content` on desktop 1440px and mobile 390px | PASS; quality page renders, no page errors, no horizontal overflow |
| Browser evidence bundle export | PASS; download started with correct filename |
| Browser GeoJSON without coordinates | PASS; emits explicit warning rather than fabricated point |

Caveats: The Chromium screenshot method loads the HTML markup inline because navigation to localhost and file URLs is restricted in this environment. Docker/InfluxDB/Grafana live container interoperability, external APIs, live field calibration, and WCAG 2.2 AA conformance audit have **not** been verified. No ISO certification is claimed.
