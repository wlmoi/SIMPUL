# SIMPUL v1.3 — Local Security Hardening and Strix-Ready Review

- Added `server/security.py` request boundary (host, optional Bearer token, same-origin writes, local rate limiting, CSP and no-store).
- Added tab-scoped API token UI and centralized authenticated simulation API requests.
- Added CSV formula injection protection and server-side observation ID collision checks.
- Bounded completed SUMO job memory.
- Added seven deterministic backend security tests and JavaScript CSV hardening tests.
- Added a scope-limited Strix CLI runner and detailed runbook for future authorized scans.
- Preserved SIMPUL's original 19 pages and transport workflows; no new cyber/offensive features were added to the application.

**Unverified:** Real Strix engine, external integrations, deployed CSP in a network-served browser, calibrated SUMO and public/multi-tenant deployment.
