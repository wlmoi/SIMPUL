# Monitoring credential configuration verification

Date: 2026-11-17 (Asia/Jakarta).

Both monitoring services use username `user`. Docker Compose reads Grafana's username from `GRAFANA_ADMIN_USERNAME`, matching InfluxDB's configurable username. The requested passwords were set only in the existing ignored local `.env`. Unrelated settings, including the InfluxDB token, were preserved. No password was added to tracked files.

Changed tracked files: `docker-compose.yml`, `.env.example`, `tools/init_monitoring.py`, `docs/MONITORING_GRAFANA_INFLUXDB.md`, and this report. The initializer still generates random passwords for new installations and refuses to overwrite existing credentials.

Observed checks:

- `npm.cmd run verify`: all 17 JavaScript suites passed; module catalog (21 modules, 110 paths), standalone build (57 modules), and bundle syntax check passed.
- `python -m pytest -q tests/test_api_registry.py tests/test_build_standalone.py --basetemp=tmp/monitoring_credentials_pytest`: 5 passed, 0 failed, 0 skipped; one dependency deprecation warning. Used existing temporary test dependencies via `PYTHONPATH=tmp/pr1_python`.
- `python tests/test_timeseries.py`: passed mocked InfluxDB transport, SQLite outbox, migration, retry, idempotence and privacy checks.
- `docker compose --profile monitoring config --format json`: parsed in memory and asserted both requested username/password pairs; configuration values were not printed.
- Verified `.env` remains ignored by Git and `tools/init_monitoring.py` refuses overwrite without changing its bytes.
- All Grafana provisioning/dashboard JSON files parsed successfully; `git diff --check` passed.
- `docker compose --profile monitoring ps --format json`: unavailable because Docker Desktop's Linux engine pipe does not exist. No live account update or login test was performed.

Preserved invariants: SQLite remains canonical, InfluxDB outages preserve pending outbox records, manual/demo provenance and API contracts are unchanged, and Docker ports remain bound to loopback.

Next acceptance gate: start Docker Desktop and check whether existing InfluxDB/Grafana volumes contain initialized accounts. Fresh volumes use the configured bootstrap credentials; existing accounts need updating within the running services. Preserve all volumes and observations, then verify both logins. Starting containers alone does not prove existing accounts were renamed or their passwords changed.
