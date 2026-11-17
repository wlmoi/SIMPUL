# Guided problem demo verification

Date: 2026-11-17 (Asia/Jakarta).

## Implemented

Overview has a prominent Play full demo button and a six-chapter, 48-second narrative: pickup demand, stopping, potential obstruction, A1 pickup space, A2 location/duration, and human evaluation. Playback expands the 3D view, changes camera focus, highlights stopped/slow model vehicles, and advances the narrative. Controls support pause/resume, replay, previous/next, chapter selection, scenario exploration and compact view. The last chapter displays computed A0/A1/A2 means with matched demand (2,100 vehicles/hour), pickup share (18%), seed (11), warm-up (90 model seconds) and sampling duration (300 model seconds).

All story state is temporary and presentation-only. Observations, sources, legal conclusions, exports, API contracts and the underlying traffic calculation engine are unchanged. Model mechanisms are labelled synthetic and uncalibrated; field causation and intervention improvement are not claimed. AI remains unavailable by default. No external services or credentials are required.

Playback requires explicit Play, pauses while the entire demo panel is off-screen or the document is hidden, and stops after human evaluation. Reduced motion uses static chapter snapshots instead of continuously animated vehicles. New controls and narration support English and Indonesian. Navigation routes remain unchanged.

## Observed verification

- `npm.cmd run verify`: 18 JavaScript suites passed, including the new story state-machine checks, navigation, motion, solution-first, vehicle-first and CSV security. Catalog: 21 modules, 113 paths. Standalone: 58 JS modules; bundle syntax passed.
- `python -m pytest -q tests --basetemp=tmp/guided_demo_full_pytest`: 39 passed, 0 failed, 0 skipped; one FastAPI/Starlette dependency deprecation warning. Includes desktop and mobile guided-demo browser tests.
- The complete suite was also rerun with `--basetemp=tmp/guided_demo_release_pytest`: 39 passed. After moving playback controls above narration for phone access, `python -m pytest -q tests/test_demo_ui.py --basetemp=tmp/demo_ui_controls_final` passed both browser cases, including Indonesian labels.
- New browser checks cover explicit start, pause, chapter/scenario selection, computed comparison, no horizontal overflow, replay, completion through all chapters with reduced motion, and an unchanged full stored-state snapshot.
- `node tests/test_classification_render.mjs`, `node tests/test_publicintel_render.mjs`, and `node tests/test_state_migration.mjs`: passed.
- Desktop (1440 px) and mobile (390 px) screenshots were rendered and inspected locally under ignored `output/guided-demo/`. Both document widths match their viewports.
- `npm.cmd run build` and `npm.cmd run verify:web`: passed; 75 public files, 60 JavaScript syntax checks, 189 imports and 72 offline-cache entries.
- `python tools/check_motion_browser.py`: unavailable; the legacy script still requires `/usr/bin/chromium`. The new pytest browser tests use installed Playwright Chromium successfully. No claim is made that the legacy script passed.
- Early targeted tests caught and resolved a terminal chapter-index bug, delayed paused-progress display, and mobile visibility tracking that paused playback while reading narration. Assertions were retained.

Local browser tests use existing test dependencies through `PYTHONPATH=tmp/pr1_python`, `PYTHONUTF8=1`, and Playwright Chromium installed outside the repository in the OS temporary directory. Four legacy browser scripts are imported but not executed as scenarios by pytest; the pass count does not include those scenarios.

## Files and acceptance

Primary files: `js/demo-story.js`, `js/home-sim.js`, `js/views/overview.js`, `js/app.js`, `styles.css`, `tests/test_demo_story.mjs`, `tests/test_demo_ui.py`, `config/module-catalog.json`, `package.json`, `manifest.webmanifest`, README, and regenerated standalone/bundle/service worker.

Next gate: GitHub Actions must pass after push, followed by user review of the demo story. Live camera/model integration, Fatmawati calibration and real intervention performance remain outside this synthetic demo.
