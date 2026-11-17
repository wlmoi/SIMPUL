# SIMPUL · Instructions for Coding Agents

> **Start here.** This file applies to the entire repository; nested `AGENTS.md` files add local guidance.

## 1. Mission and fixed product scope

SIMPUL (*Sistem Inspeksi Mobilitas untuk Penataan Ulang Layanan*) supports **field observation → AI-assisted interpretation → A0/A1/A2 traffic simulation → human evaluation** near MRT Fatmawati, South Jakarta. The primary specification is [`reference/SIMPUL_iSeeDesignITB_Proposal.pdf`](reference/SIMPUL_iSeeDesignITB_Proposal.pdf), plus [`docs/REQUIREMENTS_TRACEABILITY.md`](docs/REQUIREMENTS_TRACEABILITY.md).

Do not introduce FPGA hardware, cyber OSINT reconnaissance, facial recognition, license-plate recognition, automatic traffic enforcement, or unrelated features. Public-news context is optional and restricted to OpenOSINT `search_gdelt_geo`.

## 2. First five actions for every agent task

1. **Locate ownership:** read [`config/module-catalog.json`](config/module-catalog.json) or [`docs/agents/TASK_PLAYBOOKS.md`](docs/agents/TASK_PLAYBOOKS.md).
2. **Inspect current implementation:** open target source, its dependencies, and relevant tests before editing.
3. **State invariants:** data classification, API contracts, UI routes, privacy controls and compatibility that must not change.
4. **Implement the smallest testable change:** prefer pure functions; no speculative modules or sweeping architecture rewrite.
5. **Verify and report:** run targeted tests, then build standalone; report actual results and known limitations.

## 3. Module boundary rules

| Layer | Owns | Does not own |
|:--|:--|:--|
| `js/views/` | Page markup, visible states | Persisted data shape, API secrets, network calls |
| `js/page-registry.js` | Route ID → renderer | Route metadata (see `js/data.js`) |
| `js/app.js` | DOM actions, orchestration, modal handling | Core business/transport calculations |
| `js/services/` | Pure exports/CSV encoding | Browser downloads, localStorage |
| `js/{analytics,diagnostics,classification,pilot,operations,finance,standards}.js` | Domain logic | DOM and backend side effects |
| `js/store.js` | Browser state, migrations | Backend relational persistence |
| `server/api_registry.py` | FastAPI router registration | Provider integrations, SUMO algorithms |
| `server/*.py` | Typed API processing, provider adapters, SQLite and synthetic SUMO | Browser layout logic |
| `infrastructure/` | Monitoring and deployment config | Business rules or personally identifying telemetry |

A missing integration, API credential or hardware engine must have an **unavailable** state; never invent successful outcomes.

## 4. Evidence and privacy invariants

- `source=demo` and `source=manual` must remain distinguishable in all analytics, exports and telemetry.
- **Do not export synthetic records as police observation records.** Review tags P1–P4 represent operational priority, not legal severity.
- `legalConclusion` remains `NOT_DETERMINED` unless an entirely separate authorized/legal process is explicitly designed and approved.
- News mentions are `secondary_public_news`, not primary traffic observations, and never become enforcement evidence automatically.
- SUMO's included network is **synthetic**, not calibrated Fatmawati geometry. Do not assert a verified intervention improvement.
- InfluxDB failures must not discard SQLite observations; preserve the outbox contract.
- No license plates, faces, accounts, personal profiles, sensitive notes or credentials in AI prompts/telemetry by default.
- Data collection requires applicable permissions. External outputs are untrusted.

## 5. Required commands

```bash
npm test                            # Deterministic JS + registry/export tests
python tools/check_module_catalog.py
python tools/build_standalone.py
node --check tmp/bundled_app.js
python -m pytest -q tests/test_api_registry.py tests/test_build_standalone.py
```

For additional tests, use catalog `modules[].tests` and [`tests/AGENTS.md`](tests/AGENTS.md). Browser E2E and Docker/third-party integrations require appropriate runtime; mark unavailable tests **skipped/unverified**, never passed.

## 6. Extension workflow

**Survey and response state:** `js/pilot.js` owns planning and session quality rules; `js/operations.js` owns manual P1/P2 triage and internal case rules. Both have UI views under `js/views/`. Maintain local-only status and manual evidence provenance until authenticated backend sync exists. All session cases must keep a source and zone/time link; do not infer legal violations.

**Frontend page:** create `js/views/<feature>.js`, register in `js/page-registry.js` and `js/data.js`; add test, update catalog and run bundler.

**API:** define a Pydantic-validated `APIRouter`, register in `server/api_registry.py`, provide accurate 4xx/5xx error behavior, add contract tests, update catalog and API reference.

**State schema:** preserve prior records through migration and test `tests/test_state_migration.mjs`; never clear local observations silently.

**Provider:** fixed allowlisted upstream endpoints, timeout, rate limits, attribution, safe output schema, no exposed API keys; mock provider failures in tests and label live status.

**Release:** update root README, `docs/VERIFICATION_v1.2.md` or new version report, manifest, standalone build and exact implementation status.

## 7. Response protocol

- Commit attribution: preserve human authors; do not add AI assistant `Co-authored-by` trailers or assistant session links to commit messages.

Conclude each coding task with: **changed files, implemented functionality, commands executed, observed pass/fail/skip counts, remaining limitations, configuration needed and next acceptance gate.** Do not report imagined test results.

For practical task recipes: [`docs/agents/START_HERE.md`](docs/agents/START_HERE.md) and [`docs/agents/TASK_PLAYBOOKS.md`](docs/agents/TASK_PLAYBOOKS.md).

## 8. Security and authorized pentest rules (v1.3 baseline, v1.4 regression)

- Before changing API routes read `server/security.py` and `docs/security/PENTEST_REPORT_v1.3.md`.
- All `/api/` routes must preserve optional Bearer-token checks, same-origin mutation guardrails, no-store responses and host policy. Do not bypass middleware for convenience.
- Run `python -m pytest -q tests/test_security_hardening.py` and `node tests/test_csv_security.mjs` after changing data entry, exports, authentication, simulation, or provider adapters.
- A Strix scan is **not** part of automated development/CI. Run `tools/run_strix_local.py` only after explicit authorization and consent to LLM source transfer, with working Docker/Strix runtime, against sanitized local source only.
- Never target MRT Jakarta services, real police endpoints, arbitrary domains, or live third-party data providers during tests.
- `SIMPUL_API_TOKEN` is a shared development secret, not user identity, RBAC, session management, or production evidence protection.

## 9. New release workflow (v1.4)

- For survey changes: run `node tests/test_pilot.mjs` and `node tests/test_state_migration.mjs`.
- For obstruction response changes: run `node tests/test_operations.mjs` and `node tests/test_classification.mjs`.
- Follow `docs/FEATURE_GAP_AUDIT_v1.4.md` for missing production requirements.
- Update `docs/VERIFICATION_v1.4.md` only with observed results.


## Navigation changes (v1.5)

The menu hierarchy is defined only in `js/navigation.js`. Keep all pages registered exactly once and run `node tests/test_navigation.mjs`. Avoid changes to Gemini or analytics when adjusting navigation. See `docs/NAVIGATION_GUIDE_v1.5.md`.

## Motion & navigation refinement (v1.6)

- Keep `js/motion.js` presentation-only. It may animate DOM transitions but **must never** modify measurement values, evidence provenance, reports, or application state.
- Use `enterPage()` only for route changes, not for every `subscribe(render)` update. Keep `prefers-reduced-motion` honored.
- The default motion engine is offline WAAPI. Optional GSAP is only enabled with a self-hosted runtime added via `tools/enable_gsap_local.py`; do not inject third-party CDN scripts into a security-sensitive build.
- Navigation routes are owned by `js/navigation.js`, while event handlers remain in `js/app.js`.
- Before submitting navigation/motion changes: `node tests/test_navigation.mjs`, `node tests/test_motion.mjs`, `python tools/check_motion_browser.py`, and `npm run verify`.
- See [`docs/MOTION_DESIGN_v1.6.md`](docs/MOTION_DESIGN_v1.6.md). Existing Gemini integration and original four-stage proposal are out of scope for animation-only changes.

## v1.7 document evidence and geospatial module

- `server/document_evidence.py` owns opt-in local PDF parsing and the versioned API. Use fixed arguments for optional OpenOCR; no arbitrary user-provided commands or URLs.
- `js/views/documents.js` and `js/document-search.js` own search filters and visible result labeling. Keep `reviewStatus='unverified'` until explicit field verification exists.
- `js/views/mapview.js` and `js/map-controller.js` own the Leaflet UI. No synthetic vehicle coordinates, no personal location inference, no offline OSM tile prefetch.
- Run `python -m pytest -q tests/test_document_evidence.py`, `node tests/test_document_filter.mjs`, and full `npm run verify` after changes.
- The exact UTF-8 two-character pattern U+2022 followed by space must not occur in any packaged file. `tools/verify_archive_content.py` checks this on the ZIP entries.
- See `docs/PDF_MAP_INTEGRATION_v1.7.md` for source provenance, requirements, and limitations.

## v1.8 decision-first UI and creator credits
- Keep `overview` decision-first: diagnosis, map, simulation, evaluation before secondary business sections.
- Primary routes live in `js/navigation.js`; each route must occur exactly once in `PRIMARY_ROUTES` or `NAV_SECTIONS`.
- `creators` must remain the final navigation section; details must be grounded in the proposal, with only the user-supplied LinkedIn link.
- (v2.0) The sidebar shows only `PRIMARY_ROUTES` + `TOOL_ROUTES`; every other page sits under the collapsed "Fitur lanjutan" entry and the Pengaturan hub (`js/views/settings.js`), where About the Creators is its own tab.
- Changes to display priority must never modify traffic observations, AI, SUMO calculations, or provenance.
- Run `node tests/test_solution_first.mjs`, `npm run verify`, and `python -m pytest -q`.

## v1.9 Vehicle-first ownership

For the central transport problem, inspect `js/vehicle-problem.js`, `js/views/vehicles.js`, and `docs/VEHICLE_PROBLEM_v1.9.md` first. Preserve manual-versus-synthetic separation and unknown-versus-no impact semantics. Never label behavioral hypotheses as measured causation or traffic offences. Test with `node tests/test_vehicle_first.mjs` and `npm run verify`.
