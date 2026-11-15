# SIMPUL v1.0 — Traffic Classification & Human Review

## Purpose and scope

The application now supports a structured observation taxonomy so transport planners, operational staff, Dishub, and police reviewers can distinguish event types and operational impacts. This remains a transit-access evaluation tool, **not** a traffic-law enforcement platform. No vehicle plates, faces, driver identities, citation issuance, automatic legal decisions, or police connections are implemented.

The project continues to target the MRT Fatmawati pickup/drop-off corridor. Signage and the exact regulated zones have **not** been verified on site.

## Data taxonomy

| Dimension | Field(s) | Enumerations / meaning |
|---|---|---|
| Activity | `type` | `Jemput`, `Turun`, `Menunggu` |
| Vehicle class | `vehicle` | `Mobil`, `Motor`, `Bus`, `Angkutan pengumpan`, `Lainnya` (the backend accepts supported categories) |
| Study location | `zone` | Named observation zone, not an individual's GPS track |
| Sign / area context | `zoneContext` | `unknown`, `designated_pickup`, `general_road`, `signed_no_stopping`, `signed_no_parking` |
| Obstruction | `laneBlocked` | `unknown`, `yes`, `no` |
| Pedestrian safety/access | `pedestrianBlocked` | `unknown`, `yes`, `no` |
| Queue | `queueObserved` | `unknown`, `yes`, `no` |
| Evidence of signage | `signageVerified`, `evidenceReference` | Boolean and a non-identifying, restricted-format reference ID |
| Review workflow | `eventReviews[id]` | `pending`, `needs_evidence`, `context_reviewed`, `field_check`, `closed` |

**Unknown is not equivalent to no impact.** Existing v0.9 observations are migrated without manufacturing these measurements.

### Operational priority rules

1. `P1` if *pedestrianBlocked = yes*. A pedestrian-access check is warranted.
2. `P2` if *laneBlocked = yes* or *queueObserved = yes* and not P1.
3. `P3` if activity is `Menunggu` and dwell is >= 120 s and not P1/P2.
4. `P4` otherwise.

These are provisional **screening priorities** selected by the SIMPUL team. The 120 s threshold is not a traffic-law threshold; it is an editable engineering rule in source (`js/classification.js`, `server/traffic_classification.py`) and requires validation with intended users before operational adoption.

### Rule-review flags

- `review_rule`: observed `signed_no_stopping` context with a manually checked sign and a nonempty reference. Requires authorized interpretation.
- `interpretation_needed`: observed `signed_no_parking` context with manually checked sign and a reference. **Standing/waiting/pickup are not automatically equivalent to parking**.
- `area_documented`: an observed designated pickup area and reference; does not imply unconditional permission.
- `unknown`: otherwise, including missing rule evidence.

There is **no** `violation_confirmed` classification; every record exports `legalConclusion: NOT_DETERMINED`.

Relevant Indonesian sources to consult when developing the *legal* verification process (not automatically applied by code): [UU 22/2009, including Articles 104, 118, 259–260](https://jdih.kemenkeu.go.id/api/download/fulltext/2009/22TAHUN2009UU.htm), and [Permenhub PM 13/2014 on road signage](https://peraturan.bpk.go.id/Details/103683/permenhub-no-13-tahun-2014). Verify applicable regulations and on-site signage with competent authorities prior to any real enforcement program.

## Workflow

1. In **Observasi Lapangan**, start a session and record manual events. Supplement activity, duration, and zone with verified or unknown context and impact fields.
2. Navigate to **Klasifikasi & Tinjauan**. Synthetic examples remain visible for UI testing but are not counted as real cases in operational KPIs.
3. Filter by source, P1/P2/P3/P4, zone, or review status. Open a manual event to review it.
4. A reviewer enters a label/initials, internal status, and reason. This creates a local review record and a separate append-only *in-app* review history, subject to normal browser storage limitations. It is **not** a signed official audit trail.
5. Export a `CSV` or `JSON` summary. These exports exclude demo events and raw free-text notes. They contain provenance references but no detected individuals or plates. Exporting does not send a record to the police.
6. Manually synced observation records persist the structured classification fields in backend SQLite. The reviewer notes and review state are local-only in this version and included only in explicitly exported workspace backups. They do not synchronize to the backend.
7. New InfluxDB telemetry records include low-cardinality `priority` P1–P4 tags. Existing dashboard `simpul-field.json` gains two operational charts. Review status is *not* included in InfluxDB.

## API surface (local-only, unauthenticated demonstration)

`GET /api/v1/traffic/taxonomy`: returns the classification dictionary, workflow states, and non-enforcement disclaimer.

`POST /api/v1/traffic/classify`: takes `{ "items": [<valid manual observation>] }`; returns priority, reported impact, rule-review flag, and `legalConclusion: "NOT_DETERMINED"`, without modifying storage. Synthetic observations are rejected. Limits: 1–500 items per request. Request validation uses Pydantic.

`POST /api/observations/sync`: persists manual events including the added structured fields as JSON in SQLite, with existing ID deduplication and telemetry outbox. Note that it does **not** overwrite already-synced records if their data changes.

### Example

```json
{
  "items": [{
    "id": "evt-12345", "at": "2026-11-15T10:00:00+07:00",
    "type": "Menunggu", "vehicle": "Mobil", "duration": 145,
    "zone": "Zona B", "source": "manual",
    "zoneContext": "signed_no_stopping",
    "signageVerified": true, "evidenceReference": "SIGN-B-01",
    "pedestrianBlocked": "yes", "laneBlocked": "unknown", "queueObserved": "yes"
  }]
}
```

## Privacy and readiness limitations

- The app must not be used to identify individual drivers or automatically issue administrative or criminal sanctions.
- Case priority is not proof of legal noncompliance, nor is a reviewer label proof of police authorization.
- The standalone app uses localStorage without authentication. The backend endpoints also lack organization authentication. **Do not deploy this build publicly or collect sensitive enforcement evidence.**
- Before use by police: introduce identity verification, RBAC, organizational tenancy, authorized data-sharing agreements, retention/erasure rules, encrypted evidence storage, and tamper-evident server audit logs; conduct a legal and operational assessment and test against authorized field data.
- We cannot claim digital chain of custody or certified evidentiary status.

## Verification

Execute `node tests/test_classification.mjs`, `node tests/test_classification_render.mjs`, and `python -m pytest -q tests/test_traffic_classification_api.py`. The full existing regression commands remain in `README.md`.
