# SIMPUL v1.8 — Solution-First Navigation & About the Creators

## Motivation
Make the core mobility problem and decisions visible first instead of prioritizing business revenue and peripheral integrations on the first screen.

## New and changed
- Home shows the problem statement and immediate Diagnosis and Corridor Map actions before any supporting business tools.
- Four decision workflow cards: Diagnosis, Map and Observation, Simulation A0/A1/A2, Evaluation.
- Evidence-readiness panel separates manually entered events, manual interval readings, completed sessions and synthetic events.
- Desktop primary navigation uses Overview, Diagnosis, Map, Observation, Simulation, Evaluation.
- Mobile quick navigation uses Overview, Diagnosis, Map, Simulation, Evaluation; the first screen and full sidebar provide Observation entry points.
- Final navigation section and final home section link to About the Creators.
- Creators list reflects the five roles in the uploaded proposal; only William Anthony's supplied LinkedIn profile is linked.
- Original 23 pages and the previous PDF, OpenOCR, OpenOSINT, monitoring, classification, and SUMO modules remain intact.

## Verification
- JavaScript: 13 sequential test groups passed using `npm run verify`.
- Python: 36 tests passed using `python -m pytest -q`.
- Standalone bundler: 45 modules assembled; JavaScript syntax check passed.
- Chromium in-memory HTML rendering (`page.set_content`) at 1440x900 and 390x844 succeeded with no JavaScript page errors or horizontal overflow. About page rendered five team cards and expected LinkedIn URL.
- Local HTTP navigation via Chromium was blocked by the test environment's browser policy and has not been verified for this release.
- Third-party API availability, real SUMO calibration, and production auth remain out of scope.
- The forbidden the prohibited bullet-plus-space sequence pattern is absent in all packaged raw entries; the reference PDF text has a separate extraction check.

## Constraints
No change to Gemini evaluation, SUMO computational logic, field data storage, classification criteria, or business calculations.
