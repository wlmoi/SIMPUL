# SIMPUL v1.6 — Interaction & Motion Design

> **Scope:** presentation, page transitions, navigation, modals, toast and responsive UI. This release does **not** change the proposal, Gemini processing, evidence rules, traffic simulation, pricing, or backend API behavior.

## Design principles

SIMPUL follows the SI Bridges proposal's dark navy (`#19295F`), teal (`#087D72`), blue (`#1366A7`), and white. Motion is used to orient users between **Observasi → Diagnosis → Simulasi → Evaluasi**, rather than to embellish measured transport values. No animated number may be mistaken for an updated field observation.

| Interaction | Effect | Default duration | File |
|---|---|---:|---|
| Route change | Header reveal and staggered card appearance | 440–510 ms | `js/motion.js` |
| Accordion group | Height and opacity, no lost scroll state | 290 ms | `js/navigation.js`, `js/app.js` |
| Mobile drawer | Sidebar and scrim slide/fade | 220–320 ms | `js/motion.js` |
| Modal open/dismiss | Fade and slight vertical displacement | 160–320 ms | `js/motion.js` |
| Toast | Small vertical entrance | 260 ms | `js/motion.js` |
| Card/CTA hover | Small elevation and clearer focus | 160–260 ms | `styles.css` |
| Hero decoration | Low-amplitude background halo | 11 s (CSS) | `styles.css` |

**Keyboard:** `/` or `Ctrl/Cmd+K` focuses the sidebar page search. `Escape` closes the mobile drawer, dismisses a modal, or clears the search query as applicable. The primary navigation remains five items. Supporting pages are in five groups.

## Animation engine and offline fallback

The application ships with **Web Animations API (WAAPI) as its default, fully offline motion engine**. The same module can use **GSAP 3** if it is made available as `window.gsap` before SIMPUL starts. The ZIP does **not** contain the GSAP package by default, nor does it load a third-party animation CDN automatically. This preserves the local prototype's restrictive Content Security Policy and avoids adding a runtime network dependency.

To opt into a real, locally hosted GSAP runtime on a development machine with npm internet access:

```powershell
python tools/enable_gsap_local.py
npm run build:standalone
```

This installs a pinned GSAP `3.15.1` runtime in `assets/vendor/gsap.min.js`, adds its local script reference to `index.html`, and produces a standalone HTML with the library embedded. The PWA cache manifest is also updated when the asset exists. If installation fails, the default WAAPI motion remains functional. The optional GSAP installation path has not been exercised in the offline build environment.

For deployment with sensitive operational data, self-hosting the pinned animation library is preferable to loading third-party runtime JavaScript. Review package integrity and the applicable GSAP license when packaging a production release.

## Accessibility and performance

- `prefers-reduced-motion: reduce` disables JS-based movement and CSS decorative animations.
- Route animations run only when a route changes, **not** after every data mutation or form update.
- Motion primarily modifies `opacity` and `transform`; accordion animates measured `height` only during expansion/collapse.
- Status labels, evidence source, measurement values, and legal-review outcomes never change through animation.
- Focus rings and text labels remain visible without motion; hover states are optional and do not replace keyboard navigation.
- The motion module must not fetch remote content, read user data, or invoke business rules.

## Source ownership for coding agents

- **`js/motion.js`** — motion presets, progressive enhancement, reduced-motion check, animation cleanup.
- **`js/navigation.js`** — route grouping, active link, menu DOM structure, sidebar search.
- **`js/app.js`** — event wiring; call motion helpers only in UI lifecycle boundaries.
- **`styles.css`** — color, hover, CSS halo, focus styles, motion tokens.
- **`tools/build_standalone.py`** — dependency discovery, optional GSAP inline, offline cache.
- **`tools/enable_gsap_local.py`** — opt-in self-hosted library installer.

## Verification commands

```powershell
npm run verify
python -m pytest -q
python tools/check_motion_browser.py
```

In the implementation environment: **30 Python tests passed**, **11 sequential JavaScript groups passed**, module catalog and standalone build passed, Chromium smoke tests passed on **1440 px desktop and 390 px mobile**, and reduced-motion navigation remained functional. This checks local UI behavior, not production browser/device compatibility or performance benchmarks.

## Known limitations

- No user-configured motion-speed setting (system reduced-motion preference is honored).
- The default ZIP uses WAAPI, not a bundled GSAP runtime; optional GSAP installation requires network access.
- Real-time monitoring, provider API success, and calibrated Fatmawati simulations retain the earlier prototype's unverified status.
