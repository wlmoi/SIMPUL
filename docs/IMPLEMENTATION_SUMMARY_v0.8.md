# SIMPUL Decision Intelligence v0.8 — implementation summary

## Why this version exists

Earlier builds captured events and monitored them, but did not collect all evidence needed to answer the proposal's operational question. This version adds manual interval measurements, comparable before/after periods, an intervention register, and numeric time series aligned with corridor congestion and pedestrian access.

## New modules

- `js/diagnostics.js` — evidence quality, hourly normalized rates, zone ranking, hypothesis generation, paired comparisons, scenario constraints.
- `js/views/diagnosis.js` — field interval capture, data ledger, quality checklist, hotspot diagnostics.
- `js/views/evaluation.js` — A0/A1/A2 screening, change controls, before-after panels, internal decision register.
- `server/field_readings.py` — Pydantic validation, SQLite, idempotent sync and summary.
- `server/timeseries.py` — additional `simpul_field_interval` exporter and outbox retry.
- `infrastructure/grafana/dashboards/simpul-diagnosis.json` — eight interval metrics panels.
- `tests/test_diagnostics.mjs`, `tests/test_field_readings.py`, `tests/test_decision_ui.py` — formula, API, and UI regression tests.

## Important distinctions

- **Implemented:** frontend forms, storage, API routes, deterministic diagnostics, controls, export.
- **Unit/browser tested:** pure analytics, mock HTTP/SQLite write, direct Chromium rendering and interaction.
- **Implemented but live deployment unverified:** Grafana provisioning and InfluxDB interval export.
- **Still illustrative:** browser A0/A1/A2 formula and backend SUMO synthetic network, pricing models and demo CRM.
- **Not implemented/validated:** Fatmawati traffic survey dataset, calibrated twin, verified pedestrian accessibility impact, actual approved pilot, production auth/TLS and real-time camera detection.

Review `README.md` and `docs/DIAGNOSIS_AND_PILOT.md` for start commands and an operational walkthrough.
