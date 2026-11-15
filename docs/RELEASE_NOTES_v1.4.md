# Release notes — SIMPUL Field Operations v1.4

## Added

**Survey Coverage Planner** (`js/pilot.js`, `js/views/survey.js`): editable coverage matrix inspired by the proposal's 12 observation sessions. Only reviewed, completed, correctly timed manual sessions fill a slot. Zero-event sessions require explicit human confirmation. Invalid zone/time linkage, out-of-range duration and missing period labels prevent acceptance.

**Operational Response Board** (`js/operations.js`, `js/views/operations.js`): opens documented internal follow-ups from observed P1/P2 traffic conditions, assigns responsibility, optionally records a due time, allows status updates, shows overdue cases and preserves a change history in browser state. Cases do not establish legal liability or direct police action.

**Structured exports:** survey coverage and operational-response JSON (including redacted status history). Synthetic demonstration records and free-text private notes are excluded from operational exports.

**Offline PWA reliability:** the standalone builder now regenerates the service-worker asset list from the actual JS dependency graph, so new routes are cached on the next installed version.

**Observation form:** captures peak/off-peak classification at session start; the active zone is fixed while a session is running. New events must match the session zone.

## Preserved

Existing 19 routes and all previous modules: traffic observations, classification, diagnosis, A0/A1/A2 simulations, before-after evaluation, business studio, equipment planning, evidence/provenance, public-news OpenOSINT context, InfluxDB/Grafana option and Strix-preparation security controls.

## Compatibility

The local state version remains `2`. Older saved sessions without period labels are retained and marked **incomplete**, not automatically assigned to a period. Existing observations and reviews are not deleted. The standalone HTML continues to run offline using browser storage.

## Verification and limitations

See `docs/VERIFICATION_v1.4.md` for test commands and observed output. The new modules currently persist in the browser; authenticated server-side case/session synchronization is **not implemented**. No actual Fatmawati field result, official police integration or authorized Strix scan is claimed.
