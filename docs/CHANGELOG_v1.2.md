# SIMPUL v1.2 · Agent-ready modularization

## Added

- Project-specific, polished README header SVG, updated feature guide and screenshots, architecture diagrams, and exact quick-start instructions.
- `config/module-catalog.json` with 15 areas, source ownership, interfaces and test references.
- Root, frontend, backend, test and infrastructure `AGENTS.md` files; agent start guide and task playbooks.
- `.github/workflows/quality.yml` contract checks for pull requests (not yet executed in GitHub).
- Tests for page registry, CSV transformations, source filtering, router registration and standalone dependency graph.

## Refactored without changing user workflows

- Page rendering registration moved to `js/page-registry.js`.
- CSV creation moved to `js/services/csv.js` and `js/services/export-data.js`.
- FastAPI router registration moved to `server/api_registry.py`.
- Synthetic SUMO code moved from `server/app.py` to `server/simulation_engine.py`; job endpoints moved to `server/simulation_api.py`.
- Standalone build is now dependency-driven rather than using a manually maintained file list.

## Corrected / clarified

- An older browser smoke test expected 18 integration tiles even though 19 exist; updated the test and extended it to all 19 application pages.
- README distinguishes offline demo, local API, optional live APIs, Docker monitoring, and nonverified pilot/production capabilities.
- Retained source policy for synthetic versus manual data; no legal conclusion or automatic enforcement added.

## Not included

No new data-collection provider, identity lookup, camera model, FPGA, paid service, or traffic enforcement capability was introduced. No measured traffic reduction, calibrated SUMO performance, or production certification is claimed.
