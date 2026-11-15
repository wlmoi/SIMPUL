# What We Built — SIMPUL Observability v0.7

We implemented the existing SIMPUL proposal as an Android/iPhone-accessible browser application and an optional Linux/Docker-backed observation telemetry pipeline. The mobility workflow remains field observation, AI-assisted interpretation, SUMO A0/A1/A2 simulation, and decision support for MRT Fatmawati.

### User workflows

1. **Surveyor:** starts a session, records pickup/drop-off/waiting events, enters dwell duration and zone, and reviews its locally stored history.
2. **Analyst:** opens Monitoring & Data Log, filters by time/zone/source, checks the manual-vs-demo split, reviews changes, exports a CSV, and explicitly synchronizes manual records.
3. **Administrator / project lead:** starts an optional InfluxDB 2.x + Grafana stack in Docker; inspects an automatically provisioned dashboard for event frequency, dwell duration, zones, categories, and types; diagnoses pending/failed uploads via the UI.
4. **Decision maker:** continues to the A0/A1/A2 scenario comparison and report module, which keeps model assumptions and evidence quality visible.

### Architectural choices

SQLite keeps authoritative observations. An outbox insert shares the same transaction as each observation, so a telemetry outage does not erase saved field records. Repeat submissions deduplicate on event ID. Retries are explicit and best-effort; no continuously running work queue is claimed.

InfluxDB receives typed time-series points without personal-identifying visual evidence or free-text notes. Grafana reads from that bucket using Flux and is provisioned using the files in `infrastructure/grafana`. The stack uses a 90-day time-series retention configured in Docker. A dedicated background service or device-side sensor stream was not part of this release.

### Deployment distinction

A standalone HTML file supports offline demonstration, local charts and manual logs. A proper server deployment is required for shared monitoring, Grafana, InfluxDB and SUMO. Docker ports are localhost-only because this version has no authentication; opening the application from a phone on a separate network requires a secured network access strategy that has not been implemented.

### Limits

No real Fatmawati traffic data, no calibrated SUMO model, no verified improvement in congestion or pedestrian access, no real sales forecast, no automatic camera analytics, and no production-ready user authentication. Live Docker integration has not yet been run in this environment.
