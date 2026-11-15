# SIMPUL v0.8 — Change Log

## Added
- Diagnosis Hambatan page with manual interval input, hotspot normalization, pedestrian access and pickup-bay measurements.
- Transparent operational hypotheses linked to A0/A1/A2.
- Rencana Intervensi & Dampak page, guardrails, decision register and scenario-specific before-after comparisons.
- Field-reading SQLite API, validation and conflict handling.
- InfluxDB telemetry for interval readings and a second Grafana dashboard (8 panels).
- Browser CSV/JSON export extensions and offline PWA cache entries for new modules.
- Diagnostics, API and Chromium UI tests.

## Preserved
- Original SIMPUL proposal scope, navy/blue/teal visual identity and mobile-first workflow.
- Existing manual event capture, monitoring, business model, mapping APIs, demo simulation and optional SUMO engine.
- Legacy localStorage state migration and exclusion of FPGA subsystems.

## Limitations
- No real Fatmawati observations or validated scenario outcomes are bundled.
- A0/A1/A2 browser estimates are illustrative, backend SUMO network is synthetic, and before-after changes are descriptive.
- InfluxDB/Grafana live integration, real physical devices, deployment HTTPS and user access control still require testing/configuration.
