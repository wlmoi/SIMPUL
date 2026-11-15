# SIMPUL v1.6 — Navigation & Motion Experience

**Release type:** UI/UX refinement, presentation-layer only. No changes to Gemini, SUMO, classification, finance calculations, field observations, database schema, or API data contracts.

## What changed

- Retained the v1.5 five-step core navigation and five supporting accordion groups for all **21 existing pages**.
- Added route-specific staggered content reveal, mobile drawer slide, accordion expansion, modal opening and optional dismissal animation, and toast entrance.
- Added responsive hover/focus refinements, a subtle hero halo, and stronger navigation active state while preserving the original navy/teal/blue proposal palette.
- Added `/` and `Ctrl/Cmd+K` page-search shortcuts and Escape behavior for search, drawers, and modals.
- Respected system reduced-motion setting and added Web Animations API offline support.
- Added an **optional**, self-hosted GSAP installation path. Default ZIP does **not** bundle GSAP; all default animations run offline through Web Animations API.
- Added modular coding-agent documentation and automated motion testing.

## Files of interest

- `js/motion.js` — presentation-only motion controller
- `js/app.js` — route and interaction event wiring
- `js/navigation.js` — page groups and sidebar search
- `styles.css` — palette, hover/focus states, CSS decorative motion
- `tools/enable_gsap_local.py` — optional runtime installation
- `tools/build_standalone.py` — dependency-aware standalone build
- `tests/test_motion.mjs` — fallback, reduced motion and GSAP stub contract
- `tools/check_motion_browser.py` — desktop/mobile browser tests
- `docs/MOTION_DESIGN_v1.6.md` — accessible motion standards and source ownership

## Commands and current verification

```powershell
npm run verify
python -m pytest -q
python tools/check_motion_browser.py
```

Observed: 30/30 Python tests pass, 11/11 JavaScript test groups pass, module catalog validation and standalone build pass, plus Chromium desktop 1440 px, mobile 390 px and reduced-motion navigation checks pass. The optional downloaded GSAP version was not installed or tested in this environment because npm network access is unavailable. This UI release does not change field-validation status or confirm production readiness.
