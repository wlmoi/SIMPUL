# SIMPUL v1.6 — Verification Record

Date: 2026-11-15. Scope: offline standalone navigation, UI motion, accessibility behavior and preservation of existing SIMPUL tests.

| Verification | Command | Result |
|---|---|---|
| Python tests including API, security and browser UI | `python -m pytest -q` | **30 passed** |
| JavaScript unit / regression groups | `npm test` | **11 sequential groups passed** |
| Source graph and module catalog | `npm run check:modules` | **18 module ownership areas validated** |
| Standalone bundling | `npm run build:standalone` | **40 JavaScript modules bundled** |
| Bundled JavaScript syntax | `node --check docs/bundled_app.js` | **Passed** |
| Desktop Chromium smoke | `python tools/check_motion_browser.py` | **Passed at 1440×900** |
| Mobile Chromium smoke | Same command | **Passed at 390×844, no horizontal overflow** |
| Reduced-motion navigation | Same command | **Passed** |
| Local self-hosted GSAP opt-in | `python tools/enable_gsap_local.py` | **Not run: npm registry unreachable in environment** |
| Remote provider/production integration | Not in scope | **Not evaluated** |

### Behavioral checks

- All 21 routes preserved; five core navigation links displayed; five groups available.
- Accordion opening/closing does not rebuild the entire current route.
- Mobile drawer opens/closes with working backdrop; route selection and keyboard shortcut retain navigation.
- Modal data submission closes immediately to avoid breaking form workflows; explicit dismissal can animate.
- CSS and JS honor system `prefers-reduced-motion`.
- User-entered data and quantitative measures are not animated as changing measurements.
- Default HTML remains usable offline without GSAP/CDN dependencies.

**Limitations:** These checks demonstrate local UI behavior, not compliance certification, real field accuracy, calibrated SUMO, live Grafana/InfluxDB connectivity, production security readiness, or actual deployment to a police environment.
