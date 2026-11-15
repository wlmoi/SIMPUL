# SIMPUL v1.9 — Vehicle-first problem-solving logic

## Problem statement

At MRT Fatmawati, pickup, drop-off and passenger waiting by feeder vehicles occupy curbside space. Where stopping demand and available space conflict, there may be queues or obstacles to pedestrian access. **These mechanisms are hypotheses until field observations and a calibrated traffic model support them.**

## Operational investigation sequence

1. **Record vehicle activity**: category, zone, time, event duration, whether a lane, pedestrian access, or queue obstruction was actually observed.
2. **Separate evidence**: synthetic examples are never merged into manual field statistics. Unknown impact is never interpreted as absence of impact.
3. **Quantify the mechanism**: count activity types and duration; for rates per hour, use the interval-based Diagnosis module and record observation duration.
4. **Investigate interventions**: A0 current condition; A1 pickup-area allocation; A2 stopping-location/duration rules.
5. **Safeguard passenger access**: review queue and pedestrian distance, and require human checks before recommending changes.
6. **Validate**: independent sessions and comparable demand/seed settings in SUMO; observe again after any actual intervention.

## Implemented in v1.9

- `js/vehicle-problem.js`: pure data grouping and operational screening. Does not infer legal violations or causal impacts.
- `js/views/vehicles.js`: source, activity, zone filters; count/duration indicators; impact transparency; intervention hypotheses; event ledger.
- `js/views/overview.js`: vehicle-first action above map and business.
- All prior modules remain accessible. `About the Creators` remains last.

## Evidence limitations

The initial eight events are entirely synthetic. Manual observations have not been independently verified. Unknown impact fields remain unknown. The A1/A2 suggestions are review hypotheses; the SUMO network is not calibrated against Fatmawati. No person identification, license-plate recognition, or automatic traffic enforcement is implemented.

## Test

```bash
node tests/test_vehicle_first.mjs
npm run verify
python -m pytest -q
```
