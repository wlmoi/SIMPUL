# SIMPUL v1.2 · Verification report

**Date:** 15 November 2026  
**Scope:** Modularity, AI-agent guidance, README presentation, preserved application workflows.  
**Environment:** Linux development container; Python 3.13; Node.js 22; FastAPI; Chromium and Playwright available. **No Docker daemon, paid provider credentials or SUMO executables were used for live integration tests.**

## Summary

| Test / check actually run | Result | Evidence |
|:--|:--|:--|
| `npm run verify` | PASS | 5 JavaScript test groups, 15-module catalog validation, 34-module standalone build, JS syntax |
| `python -m pytest -q tests` | **22 passed** | Backend routers, OpenOSINT mock contracts, field readings, evidence, time series and bundle graph |
| `node tests/test_classification_render.mjs` | PASS | Standalone renders classification and event modal |
| `node tests/test_publicintel_render.mjs` | PASS | Standalone public context renders with no fabricated news |
| `node tests/test_classification.mjs` | PASS | 12 assertions for classification and manual-only police export |
| `python tests/test_proposal_alignment.py` | PASS | Four-stage proposal, A0/A1/A2 and removed hardware routes |
| `python tests/smoke_test.py` | PASS | All 19 pages, field event workflow, finance edits, export and mobile width 390 px, no uncaught JS errors |
| README local-link audit | PASS | Local paths referenced from README exist in archive |

## Structural changes tested

- `js/page-registry.js` centralizes the 19 renderer functions; route metadata remains in `js/data.js`.
- `js/services/csv.js` and `js/services/export-data.js` isolate deterministic export transformation from DOM actions.
- `server/api_registry.py` centrally registers eight FastAPI routers.
- `server/simulation_engine.py` owns synthetic SUMO computation; `server/simulation_api.py` owns HTTP job handling; `server/app.py` is now a small entrypoint.
- `tools/build_standalone.py` discovers local ES-module imports recursively and validates missing/circular imports and unsupported forms, instead of a hardcoded list.
- `config/module-catalog.json` lists **15 modules and 66 unique source/test paths**, validated by `tools/check_module_catalog.py`.
- Root and nested `AGENTS.md` documents describe ownership, invariant checks and exact tests.
- `.github/workflows/quality.yml` adds PR checks; workflow config parsed locally, **GitHub Actions itself has not yet run**.

## What the tests do **not** establish

- No field observation dataset for MRT Fatmawati was validated in these checks.
- No SUMO executable or calibrated Fatmawati digital twin was executed.
- OpenOSINT, Gemini, TomTom, ORS and other external services were not verified against live provider networks/credentials here; contract mocks are not field evidence.
- Grafana–InfluxDB container interoperability was not tested with Docker.
- Police review remains a local demonstrator without official authentication, legal adjudication, or custody of evidence.
- No production security review, multi-tenant authorization, or WCAG conformance audit was performed.

**Release classification:** locally runnable modular research prototype. Previous functionality is preserved, but production deployment and field impact remain unverified.
