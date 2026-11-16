# Windows monitoring access — 16 November 2026

Implemented: added browser links to SIMPUL and InfluxDB in both provisioned Grafana dashboards:
- infrastructure/grafana/dashboards/simpul-field.json
- infrastructure/grafana/dashboards/simpul-diagnosis.json
Grafana restarted and links confirmed via authenticated dashboard API. No observation, source, privacy, API or SQLite/outbox contracts changed.

Observed live checks:
- Windows -> SIMPUL health HTTP 200, SQLite ready.
- Windows -> Grafana health HTTP 200, database ok (12.3.0).
- Windows -> InfluxDB health HTTP 200, ready for queries and writes (2.7.12).
- Grafana authenticated API lists both registered SIMPUL dashboards.
- Grafana InfluxDB datasource health OK; 3 buckets found.
- InfluxDB sign-in HTTP 204, authenticated /me succeeds for simpul_admin.
- Pi -> InfluxDB probe: configured=true, reachable=true, pending=0; delivered=0. No artificial field observations inserted.
- Isolated Windows Chrome: Grafana login and field dashboard PASS; provisioned return links PASS; InfluxDB login page renders PASS. External requests blocked.
- Default Windows browser launch requested for all three services; isolated QA does not authenticate user's separate browser profile.

Commands: npm run verify PASS (15 JS groups, catalog 20 modules / 101 paths, standalone 49 modules, syntax). python tests/test_timeseries.py PASS. python -m pytest -q tests/test_api_registry.py tests/test_build_standalone.py: 5 passed / 0 failed / 0 skipped, one dependency deprecation warning.

URLs: SIMPUL http://127.0.0.1:8890/#monitor ; Grafana http://127.0.0.1:3000/d/simpul-field-observations/ ; InfluxDB http://127.0.0.1:8086 . Existing Desktop/SIMPUL shortcuts remain available. Credentials can be viewed locally using output/pi/Lihat_Akses_Monitoring.ps1; no passwords/tokens included in this report.

Configuration/limits: local Windows services, not public hosting or a registered Internet domain. Docker Desktop must run for Grafana/InfluxDB; Ethernet, powered Pi and SSH tunnels for SIMPUL and Pi telemetry. Empty traffic charts are expected until real manual observations are synced. Next acceptance gate: user login in their normal Windows browser and inspect both dashboards.
