# SIMPUL v0.9 — International-practice quality release

## Implemented

1. New **Standar & Evidence Quality** workspace (`js/views/standards.js`, `js/standards.js`), with deterministic manual-data checks and human-validation reminders.
2. New **evidence bundle JSON** with UTC timestamps, explicit SI-unit labels, source separation and a lightweight PROV vocabulary graph.
3. New **project-reference GeoJSON** with WGS84 coordinate order and a deliberate no-geocode fallback (no invented event locations).
4. New **English executive technical brief**, print-friendly, containing evidence inventory, known limitations and international references.
5. New FastAPI versioned endpoints in `server/international.py`, with Pydantic validation and OpenAPI.
6. Mobile/desktop design adjustments following proposal navy–blue–teal; focus-visible and reduced-motion preferences.
7. Regression tests: JS quality, provenance, export; Python API tests.

## Preserved

- Observation, diagnosis, monitoring, InfluxDB, Grafana, simulation, before/after, business and CRM workflows from v0.8.
- Synthetic demo flagged. SUMO demo not Fatmawati-calibrated. No FPGA.

## Not implemented / not claimed

- Official ISO compliance/certification.
- WCAG 2.2 AA conformance audit.
- Calibrated model of MRT Fatmawati.
- Independent statistical validation or verified before–after effects.
- Full W3C PROV constraint checks, GeoJSON validator certification.
- Authenticated public multi-tenant deployment.
- Live Docker test of InfluxDB + Grafana in this development environment.
