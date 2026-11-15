# SIMPUL v1.0 — Operational Traffic Event Classification

## Implemented

- Dedicated Klasifikasi & Tinjauan view: source/zone/priority/review filters, P1–P4 operational prioritization, human review forms, event audit history.
- Manual observation capture now includes explicit area/sign context, lane, pedestrian and queue impacts; missing values remain unknown.
- Synthetic records are clearly flagged and excluded from police-review CSV/JSON exports.
- SQLite sync saves structured observation context fields. Reviewer state remains local-only.
- Versioned stateless FastAPI traffic taxonomy/classification endpoints with Pydantic validation.
- InfluxDB telemetry now includes operational priority; Grafana observation dashboard gained two panels.
- Added JS/Python tests and safety documentation.

## Limitations

- No criminal/administrative violation detection or police systems integration. Review labels are unverified local annotations.
- No login/RBAC or tamper-evident official evidence chain. Do not deploy publicly for police case management.
- No real Fatmawati field validation or calibrated SUMO model.
- UI browser screenshot test could not run in the current Chromium environment due to managed URL restrictions. JavaScript bundle and view rendering passed Node smoke tests.
- Docker/InfluxDB/Grafana live integrations were not re-tested within this environment.
