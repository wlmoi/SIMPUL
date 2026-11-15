# SIMPUL v1.5 — Navigation and UI structure

> **Scope:** Navigation only. Gemini, data classification, simulation calculations, API contracts, and field records are unchanged.

## Entry points

The primary five navigation items follow the original mobility decision workflow:

1. **Beranda** (`overview`) — project summary.
2. **Observasi** (`observation`) — capture manual pickup/drop-off activity.
3. **Diagnosis** (`diagnosis`) — assess bottleneck observations.
4. **Simulasi** (`simulation`) — compare A0, A1, A2.
5. **Evaluasi** (`evaluation`) — inspect trade-offs and actions.

These five pages remain visible on desktop and as a bottom navigation bar on mobile.

## Secondary module groups

| Group | Pages |
|---|---|
| Survei & operasional | Survey coverage; monitoring; traffic classification; operational follow-up |
| Data & konteks | Maps; context intelligence; findings; public intelligence |
| Model bisnis | Pricing/revenue; customer pipeline; equipment |
| Dokumentasi & bukti | Project guide; evidence standards; reports |
| Integrasi & sistem | API integrations; settings |

Only one supporting group expands by default. The active route opens its group. The sidebar search reveals matching pages across all groups without changing application data.

## Where coding agents should edit

- `js/navigation.js`: only navigation hierarchy, labels, route-to-group map, and search filtering.
- `js/app.js`: sidebar layout, route events, mobile navigation, and group expansion state.
- `styles.css`: application colors, spacing, accessible focus, and responsive behavior.
- `js/data.js`: existing page labels (do not duplicate definitions).
- `js/page-registry.js`: existing page renderer registry.

When adding a page, update `js/data.js`, `js/page-registry.js`, and assign the route once in `js/navigation.js`. Add navigation tests, then run `npm run verify`.

## Verification

The test `tests/test_navigation.mjs` ensures the full set of 21 routes appears exactly once and active state is coherent. Browser tests should check desktop accordion expansion, menu search, mobile bottom navigation, and zero horizontal overflow.

This release does **not** claim to add AI/transport analysis functionality or change evidence quality.
