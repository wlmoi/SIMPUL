# PR #1 integration verification

Date: 2026-11-17 (Asia/Jakarta).

## Integrated functionality

Source: https://github.com/wlmoi/SIMPUL/pull/1 at original head `c79e3546dc5ca56cbfea986f8eceb286d398736d`.

- AIERA interface palette, schematic Fatmawati 3D home preview and interactive CCTV page.
- Deterministic illustrative A0/A1/A2 traffic simulation and display-only external detection intake.
- Compact navigation and Settings hub, retaining bilingual labels and all 26 routes.
- Manual/synthetic observation separation, unavailable AI defaults, legal status and existing backend contracts remain intact.

## Observed verification

- `npm.cmd run verify`: passed all 17 JavaScript test suites, the module catalog (21 modules, 110 paths), standalone build (57 modules), and `node --check docs/bundled_app.js`.
- `node tests/test_state_migration.mjs`: passed; legacy observations preserved.
- `python -m pytest -q tests/test_readme_integrity.py --basetemp=tmp/pr1_pytest_readme`: 2 passed, 0 failed, 0 skipped after updating integration documentation.
- `python -m pytest -q tests/test_api_registry.py tests/test_build_standalone.py tests/test_security_hardening.py --basetemp=tmp/pr1_pytest_core`: 12 passed, 0 failed, 0 skipped; 1 dependency deprecation warning.
- `python -m pytest -q tests --ignore=tests/smoke_test.py --ignore=tests/test_connected_ui.py --ignore=tests/test_context_plus_ui.py --ignore=tests/test_decision_ui.py --ignore=tests/test_monitor_ui.py --basetemp=tmp/pr1_pytest_suite`: 36 passed, 0 failed, 0 skipped; 1 dependency deprecation warning. The five browser script files were excluded explicitly, not counted as passing or pytest skips.
- Python test dependencies were installed only under ignored `tmp/pr1_python`; `PYTHONPATH` pointed there and `PYTHONUTF8=1` was used for the nonbrowser suite.
- `python tools/check_motion_browser.py`: unavailable on this Windows environment because the script requires `/usr/bin/chromium`. Browser layout, interaction and reduced-motion acceptance remain unverified.
- Initial unrestricted `python -m pytest -q`: interrupted with 27 collection errors from missing dependencies and inaccessible scratch directories. The scoped rerun above resolves dependency collection and avoids unrelated scratch directories.
- PowerShell blocked `npm.ps1`; invoking `npm.cmd` completed the required verification successfully.

## Commit attribution

Seven existing commit messages had assistant co-author or session trailers removed. Commit trees, human authors, author dates and committer identities/dates were preserved; descendant commit hashes changed. Local backup refs retain the original main and PR heads under `refs/backup/pr1-*-before-attribution-cleanup` and are not included in the push.

The cleaned PR head is merged into main with its human authorship retained. This cleans commit attribution, not repository collaborator permissions. GitHub connector write calls returned 403, and the local GitHub CLI is unauthenticated; collaborator access and PR description cleanup were not verified through those interfaces.

## Configuration and next acceptance gate

No configuration is required for the offline illustrative simulation. Real AI detections require a separately supplied model/feed; no live detection service or field calibration is claimed. Next gate: browser smoke checks on desktop/mobile using an available browser runtime, including advanced-page search, camera controls, A0/A1/A2 switching, and reduced motion. GitHub contributor display must be checked after its cached statistics refresh.
