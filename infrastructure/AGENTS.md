# Observability/deployment agent guide (`infrastructure/`)

- Grafana dashboard provisioning is in `infrastructure/grafana/` and uses InfluxDB OSS 2.x. Keep datasource queries aligned with `server/timeseries.py` measurement/tag schema.
- Data ownership: SQLite is canonical for manual events and the outbox; InfluxDB is a secondary time-series projection.
- Failed InfluxDB writes must remain pending for retry, never silently dropped or falsely marked delivered.
- Never add raw identities, faces, number plates, notes or API keys to telemetry.
- Docker ports bind to loopback by default. Do not expose Docker development stack publicly without HTTPS/authentication and privacy review.
- `.env` is local/untracked. `tools/init_monitoring.py` must never replace existing credentials.
- When Docker is unavailable, validate static configuration and mocked transport, and mark real interoperability as unverified.

Relevant checks: `python tests/test_timeseries.py`, JSON parser for Grafana dashboards, `docker compose config` when Docker is installed.
