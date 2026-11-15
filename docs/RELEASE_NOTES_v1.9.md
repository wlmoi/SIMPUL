# SIMPUL v1.9 — Vehicle-first Problem Solving

## What changed

- The first home-page action opens the **Masalah Kendaraan** problem center.
- Core navigation is now Overview, Vehicle Problem, Observation, Diagnosis, Map, Simulation, Evaluation.
- Vehicle Problem Center filters between synthetic examples and manually entered records; by vehicle activity and zone. It shows observed event counts, mean stopping duration, durations over an analytical threshold, impact states, source ledger, and zone distribution.
- Transparent decision hypotheses guide users to A1 pickup-area management or A2 stopping-duration/location management, then to A0/A1/A2 screening and human evaluation.
- Observed pedestrian and lane obstructions remain separate from legal violations, simulations, and causal conclusions.
- Business, OCR/PDF, maps, monitoring, traffic-review tools, and About the Creators remain intact and are not presented as the primary solution.

## Verification

- `npm run verify`: 14 JS test groups, module catalog, dependency-based standalone build passed.
- `python -m pytest -q`: 36 tests passed.
- Headless Chromium with locally injected standalone bundle: 1440px desktop and 390px mobile rendered without runtime errors or horizontal overflow; source/type filters and navigation to simulation passed.
- The Chromium test used locally injected bundled JavaScript because direct file/HTTP navigation was blocked by the execution environment. It does not verify deployment network behavior.
- No real Fatmawati observations, calibrated SUMO run, or operational effects were verified.
