# SIMPUL international practice profile (v0.9)

## Scope and evidence boundary

SIMPUL is a **research prototype** for evaluating vehicle pickup and drop-off activity around MRT Fatmawati, Jakarta Selatan. The study scope remains one access corridor, with observations, AI-assisted analysis (optional Gemini), scenarios A0/A1/A2, pedestrian access and decision review. No FPGA or cybersecurity assessment components are used.

**This release adopts selected documented practices. It is not ISO-certified, not WCAG-certified, not a validated traffic model, and does not imply official adoption by MRT Jakarta or local authorities.** Standards may require purchase to examine normative clauses in full; public abstracts alone cannot establish clause-by-clause conformity.

## References and specific engineering relevance

| Reference | Public source | SIMPUL implementation | Status / verification gap |
|---|---|---|---|
| ISO 37120:2018 (services and quality of life) | https://www.iso.org/standard/68498.html | Framing city mobility indicators and comparability | Conceptual reference; internal indicators must **not** be labeled ISO 37120 indicators without clause mapping |
| ISO 37122:2019 (smart cities) | https://www.iso.org/standard/69050.html | Explicit indicator definition, study boundary and traceability | Conceptual reference; no smart-city certification |
| ISO 39001:2012 (+ amendment 2024) | https://www.iso.org/standard/44958.html | Safety and human approval as intervention safeguards | Formal safety-management system and audits outside app scope |
| ISO 19157-1:2023 | https://www.iso.org/standard/78900.html | Data quality checks for completeness, temporal validity and consistency | Partial, domain-specific checks, not complete ISO 19157 assessment |
| ISO 8601-1:2019 | https://www.iso.org/standard/70907.html | Offset-aware timestamps and explicit UTC output | Implemented in structured exports; legacy data can fail and must be reviewed |
| RFC 7946 GeoJSON | https://www.rfc-editor.org/rfc/rfc7946 | FeatureCollection, WGS84 coordinates `[longitude, latitude]` | Only the **selected project reference point** is exported; no false event location |
| W3C PROV-O | https://www.w3.org/TR/prov-o/ | Lightweight JSON-LD provenance graph and data source links | Partial mapping; full semantic reasoning / shape validation not included |
| WCAG 2.2 Level AA | https://www.w3.org/TR/WCAG22/ | Focus-visible styling, semantic controls where possible, mobile layout, responsive resizing | **Target only**; full contrast, keyboard, screen-reader and assistive testing outstanding |
| OpenTelemetry semantic conventions | https://opentelemetry.io/docs/concepts/semantic-conventions/ | Future observability naming reference | Not yet integrated as an OTel collector/tracer; existing InfluxDB/Grafana remain available |

## Application feature: Standards & Evidence Quality

Route `#standards`. The interface evaluates only `source=manual` records and explicitly excludes synthetic observations. Checks:

- Presence of manual observation or interval records.
- ISO-style timezone-aware timestamps; `Z` or explicit `±HH:MM`.
- Duplicate IDs across manual events and interval data.
- Non-negative numeric interval fields and physically consistent pickup occupancy.
- Consistency of baseline A0 and follow-up A1/A2 labels.
- Proposal sampling target: **12 completed manual sessions**. This is project-specific, NOT an ISO requirement.
- Matched before/after records at the same zone and observation period.
- Independent calibration, safety review and accessibility validation remain human-reviewed.

**Quality status** is limited to `NOT_READY` (blocker present) or `EXPLORATORY_ONLY` (no detected blocker). Neither status is a substitute for field validation, sufficient sampling, statistical significance, or causal inference.

## Exchange formats

### Browser exports

- `SIMPUL_evidence_bundle_v1.json`: units, time, provenance mapping, manual events, manual intervals, explicit quality findings and limits.
- `SIMPUL_study_reference.geojson`: optional RFC 7946 study reference point if coordinates exist, not event-level positions. Does **not** automatically geocode Fatmawati.
- `SIMPUL_Executive_Brief_EN.html`: print-friendly A4 English executive brief; includes study framing, evidence inventory, quality gaps and disclaimers.

### Backend endpoints

- `GET /api/v1/standards`: public reference catalog and explicit `certification_claim: false`.
- `POST /api/v1/quality/check`: typed quality evaluation. Accepts manual observations and intervals; rejects mock/demo source and timestamps without timezone.
- `POST /api/v1/evidence/bundle`: deterministic machine-readable export. No persistence; API returns normalized UTC and selected measurements.
- `POST /api/v1/geojson/project`: RFC 7946 project point with longitude-first coordinates; rejects invalid input.

Example:

```sh
curl -s http://127.0.0.1:8888/api/v1/standards
curl -s -X POST http://127.0.0.1:8888/api/v1/quality/check -H 'Content-Type: application/json' -d '{"observations":[],"intervals":[]}'
```

No real field observations are supplied in the release. Browser and API quality evaluation are intentionally *distinct implementations* with the same evidence constraints; both are tested on synthetic fixtures.

## Measurement conventions and assumptions

| Signal | Unit | Definition | Limitation |
|---|---|---|---|
| `observation_minutes` | min | Recorded interval duration | Not necessarily an exact continuous sensor capture |
| `stopped_vehicles` | vehicles | Vehicles observed stopping in the chosen interval | Field categories must be consistently defined |
| `stopping_events_per_hour` | events/h | `stopped_vehicles × 60 / observation_minutes` | Normalized observation rate, **not traffic delay** |
| `max_queue_vehicles` | vehicles | Maximum observed queue within the interval | Not the mean queue; cannot be averaged as a mean |
| `pedestrian_access_distance_m` | m | Distance/detour captured by the surveyor | Measurement method and uncertainty require documentation |
| `available_pickup_bays` | bays | Capacity reported at the chosen zone | `0` may encode unknown in legacy UI; do not treat as known zero |
| `occupied_pickup_bays` | bays | Reported occupied bays | Requires temporal interpretation aligned with interval |

Do not claim that these domain-specific signals are official ISO 37120/37122 indicators. Empirical mobility impacts must be established using separately verified geometry, demand, hold-out field data, multiple SUMO seeds and accessible field methods.

## Responsible data use

- No automatic face/plate identification.
- Manual observations may be recorded from a phone; recording video requires permissions and privacy procedures.
- Export only explicitly manual records; no silent mixing with demo.
- External data remain attributable to their own APIs and licenses.
- Local storage is not a production multi-tenant database. Public deployment requires auth, HTTPS, strict RBAC, retention policies and privacy review under applicable law.

## Verification scope

Checks that can be executed locally:

```sh
npm test
python -m pytest -q tests/test_international_api.py
python tools/build_standalone.py
node --check docs/bundled_app.js
```

For WCAG, complete full audit with keyboard, screen reader, contrast and automated tooling; a screenshot or smoke test does not establish conformance. For GeoJSON, use independent geospatial validators before public exchange. For standards claiming compliance, perform a licensed clause-by-clause assessment by a qualified reviewer.

## Security posture of the local API

The application now adds `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Frame-Options: DENY` to normal responses. These are basic browser protections only, not a penetration-test result or a production security certification. Authentication, HTTPS termination, organization isolation, protected credentials and retention are still required for any public deployment.
