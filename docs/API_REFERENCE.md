# SIMPUL v0.3 — REST API Reference

Backend: FastAPI, same-origin `http://localhost:8888`. Swagger UI: `/docs`. Requests are JSON except geo/weather queries. **This development server does not authenticate users. Do not expose it publicly.**

| Method | Endpoint | Purpose | External key | Validation |
|---|---|---|---|---|
| GET | `/api/status` | Health and SUMO binary readiness | No | Returns installed state |
| GET | `/api/integrations` | Configured integration capabilities | No | Does not ping external services |
| GET | `/api/geo/search?q=Fatmawati` | Manual Nominatim search | No | 3–120 chars; 1 req/s; cache; limit 5 |
| GET | `/api/geo/nearby?lat=-6.29&lon=106.79` | OSM points (bus stops, subway entrances, parking) | No | Bounded radius 450 m, OSM output <=35 |
| GET | `/api/context/weather?lat=-6.29&lon=106.79` | Open-Meteo contextual weather | No | Latitude/longitude bounds |
| GET | `/api/traffic/live?lat=-6.29&lon=106.79` | TomTom flow on nearest road | `TOMTOM_API_KEY` | Coordinates and upstream schema |
| POST | `/api/ai/insights` | Gemini report from manual observation aggregates | `GEMINI_API_KEY` | Pydantic bounded fields; structured JSON |
| POST | `/api/observations/sync` | Persist manual observations, idempotent by ID | No (local demo only) | Batch ≤500; field validation |
| GET | `/api/observations` | Retrieve up to 3,000 stored events | No (local demo only) | Stored local records |
| GET | `/api/observations/summary` | Aggregate server observations | No | Deterministic counts |
| POST | `/api/simulation` | Queue 3-scenario synthetic SUMO job | SUMO binaries | Bounded numeric params; 2 active jobs |
| GET | `/api/simulation/{jobId}` | Poll result/failure | No | Job ID existence |

## Nine new endpoints in v0.3

| Method | Endpoint | Purpose | Credential | Limitations |
|---|---|---|---|---|
| GET | `/api/geo/reverse?lat=&lon=` | Address for study coordinates | None | User-initiated; shared Nominatim throttle; cache |
| GET | `/api/geo/crossings?lat=&lon=` | Crossings, kerb and tactile metadata | None | OSM 350 m, ≤45 nodes, incomplete coverage |
| GET | `/api/context/air-quality?lat=&lon=` | US AQI, PM2.5, PM10 and NO₂ | None | CAMS model estimates; not roadside sensors |
| GET | `/api/context/forecast?lat=&lon=` | Rain forecast, next 12 hours | None | Model forecast, not measured rainfall |
| GET | `/api/context/history?lat=&lon=&day=2026-10-20` | ERA5-gridded historical weather | None | At least seven days old; within seven years |
| GET | `/api/context/elevation?lat=&lon=` | Terrain height above sea level | None | GLO-90; too coarse for sidewalk gradients |
| GET | `/api/context/holidays?year=2026` | Indonesian national holidays | None | Verify dates against Indonesian government decree |
| GET | `/api/accessibility/route?lat=&lon=&destLat=&destLon=&mode=foot-walking` | Map-based route, duration, distance and geometry | `ORS_API_KEY` | Modes: `foot-walking`, `wheelchair`, `driving-car`; not a site inspection |
| GET | `/api/accessibility/isochrone?lat=&lon=&minutes=10` | Walking reachability polygon | `ORS_API_KEY` | Minutes 3–20; doesn't verify accessible crossings |

**Coordinate convention:** API parameters use latitude/longitude (WGS84), while ORS upstream expects longitude/latitude. The backend converts them. All upstream URLs are fixed and the client cannot instruct the server to fetch arbitrary URLs. The 16-item integration catalog denotes availability/configuration, **not** confirmed upstream uptime.

Official references: [openrouteservice Directions](https://giscience.github.io/openrouteservice/api-reference/endpoints/directions/), [Open-Meteo Air Quality](https://open-meteo.com/en/docs/air-quality-api), [Open-Meteo Historical](https://open-meteo.com/en/docs/historical-weather-api), [Open-Meteo Elevation](https://open-meteo.com/en/docs/elevation-api), [Nager.Holidays v4](https://nagerholidays.com/api), [Nominatim Policy](https://operations.osmfoundation.org/policies/nominatim/).

## Example: sync two observations

```http
POST /api/observations/sync
Content-Type: application/json

{
  "items": [{
    "id": "evt-20261114-01",
    "at": "2026-11-14T10:00:00+07:00",
    "type": "Jemput",
    "vehicle": "Mobil",
    "duration": 45,
    "zone": "Zona A",
    "source": "manual",
    "note": "",
    "sessionId": "ses-1"
  }]
}
```

Records with `source: "demo"` are rejected by the server. Repeated IDs are ignored, not overwritten. A sync operation is intentional and performed via a user button; local browser data is not silently uploaded. The database is SQLite under `server/data/simpul.sqlite3` unless `SIMPUL_DB_PATH` is set.

## Example: Gemini input

```json
{
  "count": 12,
  "meanDwellSec": 51.2,
  "byType": {"Jemput": 7, "Turun": 3, "Menunggu": 2},
  "byZone": {"Zona A": 9, "Zona B": 3}
}
```

The application aggregates **manual events only** in the browser, excludes free-text notes and visual evidence, and sends that aggregate to the FastAPI backend. The server uses Gemini's JSON response mode. The output is a hypothesis requiring human review, not validation or official approval.

## External provider implementation contracts

### Nominatim

`providers.geocode(q)` sends a bounded search to the public Nominatim server with app attribution; no autocomplete and at most one uncached request/second. Public API policies: <https://operations.osmfoundation.org/policies/nominatim/>.

### Overpass

`providers.nearby(lat,lon)` submits a fixed, non-user-editable Overpass QL query for a short radius. Results are marked as OpenStreetMap community data; actual street geometry still requires field verification. QL docs: <https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL>.

### Open-Meteo

Uses current temperature, precipitation, relative humidity and weather code, labeled as context-only. Terms: <https://open-meteo.com/>.

### TomTom Traffic Flow

Uses `GET /traffic/services/4/flowSegmentData/absolute/16/json` with server-side API key, returns speed and confidence when available. Official reference: <https://docs.tomtom.com/traffic-api/documentation/tomtom-maps/v1/traffic-flow/flow-segment-data>. A snapshot at one coordinate must not be treated as congestion for a whole transit hub.

### Gemini

Uses server-side `GEMINI_API_KEY`, configurable `GEMINI_MODEL`, and `generateContent` structured JSON output. Official guidance: <https://ai.google.dev/gemini-api/docs/structured-output>. This endpoint remains supported but Google recommends the newer Interactions API for new projects; plan migration before scale.

## Security gates before production

Authentication and authorization, privacy/retention, TLS, origin controls, rate limits, cost quotas, secrets vault, logs and monitoring, isolated job storage, and provider licensing must be implemented before handling personal or sensitive information and before LAN/public exposure. Persistent multi-user SQLite is **not** claimed. The provider configuration endpoint reports whether a key is set, not the key itself.



## v0.7: InfluxDB / Grafana monitoring

New endpoints: `GET /api/monitor/health`, `GET /api/monitor/summary`, `GET /api/monitor/logs`, `GET /api/monitor/logs.csv`, `GET /api/monitor/metrics`, `GET /api/monitor/stream/status`, `GET /api/monitor/stream/status?probe=true`, `POST /api/monitor/stream/flush`. `POST /api/observations/sync` now returns a `telemetry` object with `status`, pending and delivered counts. A success response indicates SQLite persistence; check `telemetry.status` independently for InfluxDB write outcome. See `docs/MONITORING_GRAFANA_INFLUXDB.md` for integration requirements and the outbox contract.


## v0.8: manual field intervals and intervention evidence

| Method | Endpoint | Behavior |
|---|---|---|
| POST | `/api/field-readings/sync` | Store a batch of ≤500 structured manual interval measurements in SQLite, enqueue InfluxDB telemetry; stable IDs are idempotent, incompatible duplicate IDs return HTTP 409 |
| GET | `/api/field-readings` | Retrieve locally stored interval data |
| GET | `/api/field-readings/summary` | Separate baseline/follow-up arithmetic summaries; not calibrated or validated |
| GET | `/api/monitor/stream/status` | Now includes `fieldIntervals.pending` and `.delivered` |
| POST | `/api/monitor/stream/flush` | Attempts delivery of event and interval time series; `fieldIntervals` result appears in response |

For a full example payload and validation ranges, see [`DIAGNOSIS_AND_PILOT.md`](DIAGNOSIS_AND_PILOT.md). Only `source=manual` is accepted. Baseline requires `scenario=A0`; follow-up is labeled A0, A1 or A2. No raw image, face, license plate or personal information is needed. Local API remains unauthenticated.


## Traffic classification — v1.0

- `GET /api/v1/traffic/taxonomy`: classification dictionary and constraints.
- `POST /api/v1/traffic/classify`: validated manual event batch, deterministic P1–P4 priorities and potential rule-review flags. Stateless and **not an offence determination**.

Field definitions and sample request: [`TRAFFIC_CLASSIFICATION_AND_REVIEW.md`](TRAFFIC_CLASSIFICATION_AND_REVIEW.md).


## v1.1 OpenOSINT (optional, passive only)

`GET /api/v1/public-intelligence/status` reports installation and explicit opt-in. `POST /api/v1/public-intelligence/news` accepts a fixed topic, lat/lon, radius and time window. Only OpenOSINT's GDELT geolocated-news module is invoked. The returned points are mentions in media, not police-grade incident locations. Errors return HTTP 422/502/503/504 instead of fabricated results. Installation: `server/requirements-openosint.txt`. See `docs/OPENOSINT_INTEGRATION.md` for full contract.

## v1.7 Document evidence API (local prototype)

The endpoints below require the local FastAPI backend. They inherit the existing host, origin, optional Bearer-token, and rate-limit middleware. Do not expose the database publicly without organizational authentication and access control.

| Method and endpoint | Operation | Validation |
| --- | --- | --- |
| `GET /api/v1/documents/status` | Report PyMuPDF and optional OpenOCR availability | No uploaded content |
| `POST /api/v1/documents/import` | Upload authorized PDF and index non-identifying observation candidates | PDF magic, max 10 MB, max 30 pages |
| `GET /api/v1/documents/records` | Search indexed candidates | Optional `zone`, `vehicle`, `color`, `date`, `after`, `before`, `document_id` |
| `GET /api/v1/documents/map` | Emit GeoJSON points from recorded GPS coordinates only | Unverified source, zero invented coordinates |

Example upload (for test data only):

```bash
curl -F "file=@examples/SIMPUL_Observations_SYNTHETIC.pdf" http://127.0.0.1:8888/api/v1/documents/import
curl 'http://127.0.0.1:8888/api/v1/documents/records?vehicle=Mobil&zone=Zona%20A&color=Hitam&date=2026-11-15'
```

If `SIMPUL_API_TOKEN` is configured, add `Authorization: Bearer <token>` to requests. Real documents must be obtained and used under appropriate authorization, and output requires human review. See `docs/PDF_MAP_INTEGRATION_v1.7.md`.

## Coordinator Decision Brief & CV Window Review API

Single-pass deterministic pre-/post-check pipeline wrapping bounded optional Gemini synthesis ([architecture design](designs/neuro-symbolic-decision-brief.md)). Never returns legal offense determinations (`legalConclusion` is always `'NOT_DETERMINED'`), excludes license plates and enforcement terms, and separates `Area A1` pickup bay metrics (`bayUtilization`) from 12-slot `Zona A/B/C` survey totals.

| Method and endpoint | Operation | Validation & Error Behavior |
| --- | --- | --- |
| `POST /api/v1/cv-reviewed` | Idempotently persist coordinator-signed `mode='ai'` CCTV window summary (`windowId`, `zone`, `period`, `vehicleCountsByClass`, `totalVehicles`, `meanDwellSec`, `overThresholdCount`, `reviewerLabel`) | Rejects `mode='demo'` or missing `period` (`422`); same `windowId` + matching SHA-256 `payload_hash` returns `200` `already_present`; conflicting payload returns `409`. |
| `POST /api/v1/ai/decision-brief` | Run server PDF/CV/context checks, optional single-pass Gemini structured JSON synthesis (`timeout=25s`, `max_output_tokens=1400`), `ScenarioParams` bounds clamp, and blocklist check | Always returns HTTP `200` with complete `brief`, `llmStatus` (`ok`, `unavailable`, `validation_failed`, `error`), `pdfSummary`, and `executionTrace` (falls back deterministically without inventing validated results). |
