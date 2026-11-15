SIMPUL v0.9 — INTERNATIONAL PRACTICES EDITION

Extract the ZIP, then open SIMPUL_Standalone.html to explore the mobile and desktop application.
Choose "Standar & kualitas bukti" in the sidebar.

New functionality:
- Manual-only evidence quality gates and audit findings.
- UTC provenance JSON evidence export.
- RFC 7946 project reference GeoJSON (requires user-selected coordinates).
- English research executive brief (print-friendly).
- Versioned FastAPI quality / export endpoints.

For local FastAPI: python -m pip install -r server/requirements.txt && python server/app.py
For Grafana/InfluxDB: python tools/init_monitoring.py && docker compose --profile monitoring up --build -d

Standards are references/implementation targets only; no certification, calibrated traffic simulation, or validated field impact.
See README.md and docs/INTERNATIONAL_PRACTICES.md.
