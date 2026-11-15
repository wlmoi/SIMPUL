# Frontend agent guide (`js/`)

The app uses native ES modules (no framework runtime). Preserve the SIMPUL navy/teal/white design and Indonesian UI terms.

**Read first:** `js/page-registry.js`, `js/data.js`, `js/store.js`, and the target `js/views/<page>.js`.

- `app.js` owns DOM event handling, route navigation, downloads and API orchestration. Keep new calculations out of it.
- `page-registry.js` owns **19 renderer functions**. `data.js` owns human-facing page labels/grouping. Both must remain in sync.
- Views should render from `getState()` and return HTML; do not introduce backend-only assumptions into browser output.
- `services/export-data.js` returns strings, not browser side effects. Use `services/csv.js` for escaping.
- Models in `analytics`, `diagnostics`, `classification`, `standards`, and `finance` are deterministic and source-aware. Preserve units and current semantics.
- The PWA demo works with no Python backend. Never display API success for offline-only fallback data.
- New local imports are discovered automatically by `tools/build_standalone.py`. Static named relative imports only; no aliases, namespace or dynamic imports in the standalone build.
- Never break browser localStorage migration; run `tests/test_state_migration.mjs` after state changes.

**Verification:** `npm test`, `python tools/build_standalone.py`, `node --check docs/bundled_app.js`. For a new route, update `config/module-catalog.json` and its owning test.
