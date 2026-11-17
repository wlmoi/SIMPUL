# CI dependency and browser verification

Date: 2026-11-17 (Asia/Jakarta).

The quality workflow installed only runtime/backend dependencies, so collection of `tests` failed on missing Playwright and ReportLab. CI now installs `requirements-dev.txt`, including pytest and ReportLab, and runs `python -m playwright install --with-deps chromium` before the tests. The decision UI test uses Playwright's managed Chromium instead of `/usr/bin/chromium`. Two standalone render harnesses now provide the DOM query and animation-frame methods used by the current app shell; their assertions remain unchanged.

No application logic, observation provenance, API contracts, credentials or privacy controls changed. README verification instructions match the complete setup.

Observed local commands and results:

- `npm.cmd run verify`: 17 JavaScript suites passed, module catalog passed (21 modules, 110 paths), standalone build passed (57 modules), bundle syntax passed.
- `python -m playwright install chromium`: installed the Windows browser runtime. Linux CI additionally installs OS dependencies with `--with-deps`.
- `python -m pytest -q tests --basetemp=tmp/ci_fix_pytest_final`: **37 passed, 0 failed, 0 skipped**, including the collected decision browser test. One FastAPI/Starlette dependency deprecation warning remains.
- `node tests/test_classification_render.mjs` and `node tests/test_publicintel_render.mjs`: both passed after correcting their DOM mocks.
- `git diff --check`: passed.

Local Python used the existing test dependencies under ignored `tmp/pr1_python` via `PYTHONPATH` and `PYTHONUTF8=1`. The downloaded browser was moved outside the repository to the OS temporary directory so the package-content test does not inspect third-party binaries. The first full local run had 36 passes and one package-content failure caused by those temporary binaries; the final run above includes all tests without exclusions or changed package assertions.

Four legacy browser scripts are imported by pytest but run their scenarios only when executed directly; the 37-pass count does not claim those standalone scenarios ran. Live providers, Docker and SUMO were not exercised. Next acceptance gate: the Linux GitHub Actions quality workflow must pass after push.
