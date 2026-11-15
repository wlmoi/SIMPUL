# Data contracts and evidence boundaries

## Canonical categories

| Category | Typical value | Permitted interpretation |
|:--|:--|:--|
| Field observation | `source: 'manual'` | An observer-entered record, not automatically validated |
| Synthetic example | `source: 'demo'` | Functional demonstration only |
| Public contextual data | `secondary_public_news` | Mention in published media, not a confirmed location/event |
| Simulation | `engine: 'sumo'` or `engine: 'heuristic'` | Modeled estimates, not observed effects |
| Internal review | `reviewStatus` and audit entry | Work tracking, not governmental approval |
| Financial forecast | user-editable `finance` inputs | Hypotheses, not actual sales transactions |

## Example manual event

```json
{
  "id": "evt-local-001",
  "at": "2026-11-15T08:00:00+07:00",
  "type": "Jemput",
  "vehicle": "Mobil",
  "duration": 36,
  "zone": "Zona A",
  "source": "manual",
  "pedestrianBlocked": "unknown",
  "laneBlocked": "unknown",
  "queueObserved": "unknown",
  "signageVerified": false
}
```

Fields recorded by a user are observations; the presence of a record does not establish a traffic offense. `unknown` must not be automatically interpreted as `no`.

## Simulation contracts

- `A0`: current/baseline condition.
- `A1`: use of designated pickup area.
- `A2`: stopping rule/location/duration variation.
- Model calibration to MRT Fatmawati: **not completed** in the distributed test network.
- Pedestrian detour may be an explicit input assumption; it must not be labeled as measured.

## Data flow limitations

- Browser storage does not provide authenticated multi-operator custody of evidence.
- Server SQLite is a development store; production needs schema migration, tenant access and retention policy.
- InfluxDB is a time-series projection; it does not replace source or audit provenance.
- Exports for police review are limited to manually entered, structured records and exclude demo data and free-text notes.
- OpenOSINT only provides secondary public-news context; `legalConclusion` stays `NOT_DETERMINED`.

## Coordinated changes

If one of these contracts changes, update **both** the browser and API schemas where applicable, migration tests, export semantics, module catalog, README and integration docs.

See `docs/REQUIREMENTS_TRACEABILITY.md`, `docs/TRAFFIC_CLASSIFICATION_AND_REVIEW.md`, and `docs/INTERNATIONAL_PRACTICES.md` for longer methodological notes.
