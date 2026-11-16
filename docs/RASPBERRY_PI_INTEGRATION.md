# Raspberry Pi integration

The Windows browser connects to the Pi backend through a local SSH tunnel. Existing Desktop/SIMPUL shortcuts open the app and request an SSH login when needed. Keep the tunnel terminal open; laptop sleep/shutdown closes forwarding. Docker Desktop must run for local Grafana and InfluxDB.

Application: http://127.0.0.1:8890/ . Grafana: http://127.0.0.1:3000/ . InfluxDB: http://127.0.0.1:8086/ . These are local Windows addresses, not public hosting.

## Prompts and deployment

Codex chat prompts do not automatically execute on the Pi. Git push uploads source to GitHub and does not deploy to the Pi. Deployment requires an explicit transfer, service restart and health check while preserving SQLite data.

The existing AI adapter uses server-side Gemini. Live inference requires a backend GEMINI_API_KEY and outbound Internet connectivity. Live AI is currently unavailable. Rule-based classification and browser calculations remain available; unavailable providers must never be presented as successful.

Observations remain local until explicitly synchronized. SQLite remains canonical and InfluxDB uses a retry outbox. Synthetic data remains distinguishable from manual field records.

Detailed device inventory, addresses, service paths and connection settings are retained only under ignored output/pi. Credentials, host keys, databases, signatures, banking evidence, tmp/ and output/ are excluded from version control.

Pre-push verification: npm run verify PASS (15 JavaScript groups, catalog, standalone and syntax); targeted API/build/security/PDF/SQLite pytest 17 passed, 0 failed, 0 skipped, one dependency deprecation warning. Physical reboot and live AI inference are unverified.

Next acceptance gate: configure an authorized AI provider and Pi outbound connectivity if live AI is needed; verify a real observation sync, then test physical reboot/reconnection separately.
