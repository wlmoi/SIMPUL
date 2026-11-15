# SIMPUL — Arsitektur dan Batas Implementasi

## 1. Hubungan produk dengan proposal

- **Lokasi:** akses penjemputan sekitar MRT Fatmawati, Jakarta Selatan.
- **Fungsi:** observasi kendaraan berhenti/naik/turun, pemodelan kondisi eksisting A0, area penjemputan A1, aturan berhenti A2, dan evaluasi keputusan.
- **Target proposal:** 12 sesi pengamatan, masing-masing 30–60 menit; F1 0,80 untuk pengenalan kejadian; galat volume maksimal 20%; tiga skenario; evaluasi pedestrian; rekomendasi yang dapat diaudit.
- **Komersialisasi produk:** tambahan desain pada prototipe. Harga dan penerimaan pasar belum diverifikasi dan dapat diubah di Business Studio.

## 2. Komponen utama

```text
Smartphone/Desktop Browser
  │
  ├── SPA JavaScript + CSS
  │     ├── Dashboard
  │     ├── Field Observation + Sessions
  │     ├── Scenario Controls
  │     ├── Evidence and Decision Review
  │     ├── Business Studio / Finance Engine
  │     ├── Customer Acquisition Pipeline
  │     ├── Equipment Planner
  │     ├── Reports and Backup
  │     ├── Context Intelligence Lab (contextplus.js)
  │     │     └── Routes, forecast, history, air quality, elevation, holidays
  │     └── Versioned LocalStorage (local prototype)
  │
  └── Optional HTTPS API (FastAPI)
        ├── /api/status
        ├── /api/simulation [POST]
        ├── /api/simulation/{jobId} [GET]
        └── SUMO background thread job
              ├── Synthetic node/edge generator
              ├── netconvert (generates SUMO network)
              ├── Scenario route/stop generator
              ├── sumo execution
              ├── tripinfo parser
              ├── laneAreaDetector queue output parser
              └── scenario result assembly
```

The standalone artifact compiles all frontend ES module source into a single HTML file. Server-based development preserves modules separately. There are no hidden service dependencies for the standalone flow.

## 3. Data path, with provenance

**Source → Record → Aggregation → Model → Output → Decision.**

1. A surveyor records a vehicle event using the mobile form.
2. The application attaches a timestamp, zone, event type, duration, session ID and source label.
3. Records are stored in browser localStorage under a versioned workspace key. Export creates a CSV or JSON.
4. `analytics.js` calculates deterministic descriptive metrics. It does not infer identities or automatic video classifications.
5. The scenario UI calculates **illustrative** values using a congestion heuristic by default.
6. If SUMO is installed, the API creates a **synthetic** network and returns actual tool outputs. These are clearly separated from the browser heuristic and from a validated study.
7. A user can review evidence assumptions and export a report. The UI never declares a real traffic intervention approved.

For production, substitute centralized database storage with user/organization permissions, consent/notice records, an actual source document registry, and calibrated location geometry.

## 4. Business model calculation

The 12-month model consists of:

```text
recurring_revenue[t] = active_locations[t] × monthly_subscription
implementation_revenue[t] = new_locations[t] × setup_fee
pilot_revenue[t] = paid_pilots[t] × pilot_fee
revenue[t] = recurring_revenue[t] + implementation_revenue[t] + pilot_revenue[t]

direct_cost[t] = cloud[t] + (active_locations[t] × support_per_location)
               + (new_locations[t] × implementation_cost)
               + (paid_pilots[t] × direct_pilot_cost)
fixed_cost[t] = fixed_operations[t] + sales_and_marketing[t]
operating_result[t] = revenue[t] - direct_cost[t] - fixed_cost[t]
gross_margin = (revenue - total_direct_cost) / revenue
MRR[end] = active_locations[12] × monthly_subscription
ARR_run_rate = 12 × MRR[end]
```

The current model assumes all initial locations are onboarded at the start of month 1. New locations are added from month 2. Pilot conversion does not automatically turn into subscription contracts. Churn applies monthly to currently active locations. This is intentional to prevent double-counting.

Missing items needed before an investment-ready model include customer-level cohort dates, variable simulation compute costs, payment milestones, tax, receivables and cash collection, inflation, taxes, and a verified willingness-to-pay study.

## 5. SUMO worker details

When required SUMO binaries exist:

1. `server/app.py` checks traffic, stop fraction, stopping duration, access assumptions, and seed counts against Pydantic bounds.
2. The service uses a two-thread in-memory executor; only two jobs may be pending/running at once.
3. The worker generates a four-node **synthetic** road network. All three scenarios use comparable traffic demand.
4. A0 retains baseline stopping on the main road, A1 redirects an adjustable share of pickup vehicles via a separate pickup segment, and A2 reduces stopping duration.
5. Multiple seeds evaluate stochastic variation. SUMO emits tripinfo data and a lane-area detector interval series.
6. The API returns mean time loss and detector-based queue indicators, stores job status in volatile memory, and exposes failure details.

This is a genuine simulation integration test, not an engineering representation of Fatmawati. To become a location-specific digital twin, the source network must be constructed from verified OSM and actual site geometry, then calibrated and evaluated on independent observations. Worker infrastructure also needs persistent queues, backpressure, authentication, and execution sandboxing for a production environment.

## 6. UI design system

The proposal has a prominent navy-and-ocean-blue graphic frame, emerald/teal section and table headers, white content areas, and pale mint data tables. The application reproduces this through:

- Persistent dark-navy navigation with teal active state.
- Navy-to-teal dashboard hero and geometric network motif.
- White modular cards with teal indicators, restrained status labeling and pale aquamarine evidence banners.
- Tables styled after the proposal's green header/white rows, adapted to desktop and horizontal-scroll mobile presentation.
- Responsive breakpoints at 1,250, 1,020 and 700 pixels.

Type families use Plus Jakarta Sans and DM Sans when network font loading is available, otherwise system sans-serif fallbacks. Icons use inline SVG and therefore require no icon library.

## 7. Security and privacy

The app records vehicle categories, events, durations, and zones. It neither captures images nor attempts to recognize faces or license plates. Real use requires site permissions, privacy notice and data collection policy, role-based access, and retention controls. Browser localStorage is deliberately limited to a local demonstration and cannot be represented as a secure multi-user cloud database.

The SUMO API accepts bounded numeric parameters, uses subprocess argument lists rather than shell interpolation, runs in temporary directories, and returns bounded errors. These guards do not substitute for authentication, per-user rate limiting, and infrastructure hardening before public deployment.

## 8. Acceptance and extension gates

**Working in this release:** React-free SPA, all nine pages, field event recording, scenario controls and heuristic results, data provenance labels, business financial model, prospect pipeline, equipment costing, backup, CSV and JSON export, mobile responsiveness and backend SUMO implementation code.

**Conditional:** real SUMO execution requires installed SUMO tools; actual site modeling requires calibrated geometry and observations.

**Not implemented:** Gemini live client, automatic object detection/video processing, real station map, multi-user cloud data, login/billing, public deployment, model validation, and official traffic intervention approvals.

## 9. v0.2 external APIs and UI modules

This extension **adds** two frontend pages without changing the proposal-based A0/A1/A2 structure:

- `js/views/context.js` — manual place search, selected location, OSM map preview + explicitly loaded embedded map, Overpass nearby points, Open-Meteo weather and optional TomTom flow.
- `js/views/integrations.js` — configured-backend readiness and navigation to actions; a configured provider is not an uptime test.
- `js/api.js` — same-origin REST wrapper; backend access requires HTTP(S), never `file://`.
- `server/extra_routes.py` — FastAPI router for external services and local observation persistence.
- `server/providers.py` — fixed-host adapters; network errors remain errors, no fabricated fallback traffic speeds.
- `server/storage.py` — SQLite `INSERT OR IGNORE` by event ID for manual observations only; no authentication (local demo).

The data is stored locally in the browser unless the user explicitly chooses **Kirim ke SQLite**. The optional AI analysis sends **only** category/zone/count/dwell aggregates, not notes, names, images or license plates. Weather is contextual; TomTom data describes the nearest matching road segment, not the overall station. Neither external dataset replaces field validation or a calibrated SUMO model. Public deployment must start with authentication, user-level data access controls, provider policy review, and a proper database lifecycle.

Read `docs/API_REFERENCE.md` for exact endpoints and constraints.

## v0.3 — independent context and accessibility adapters

```text
Browser / HP → js/views/contextplus.js → js/app.js → js/api.js
   → FastAPI /api/*
     ├── server/context_plus.py
     │   ├── Nominatim reverse (shared throttle with forward search)
     │   ├── Overpass crossing and kerb metadata (bounded)
     │   ├── Open-Meteo forecast / air quality / ERA5 history / elevation
     │   └── Nager.Holidays v4 Indonesia holiday calendar
     └── server/routing.py
         ├── ORS Directions: foot-walking / wheelchair / driving-car
         └── ORS Walking isochrone, 3–20 minutes
```

The `server/extended_routes.py` module exposes these adapters as nine bounded endpoints. Calls occur only through user actions in Context Intelligence Lab. The UI labels forecast/model/map outputs as contextual evidence; **none are field measurements or proof of accessibility**. The ORS credential exists only in `ORS_API_KEY` on the backend and never appears in the integration catalog.

Commercial production requires provider licenses and quotas, verified on-site ground truth, authentication, cost controls, API observability, and official supply-data agreement where applicable. The front-end PWA can operate on a phone but route generation and aggregation require a reachable secured backend.



## v0.7 — Optional observability pipeline

`PWA/localStorage → FastAPI → SQLite observations + telemetry_outbox → InfluxDB OSS 2.x → provisioned Grafana dashboard`. Manual field observations are authoritative in SQLite; time-series points are derived asynchronously via best-effort delivery and retry. No simulated traffic observations are exported. The backend API exposes queue and service status; Grafana reads the InfluxDB projection, not browser localStorage. The monitoring Docker Compose profile is optional and was not live-executed in the authoring environment. See `docs/MONITORING_GRAFANA_INFLUXDB.md`.


## v0.8 extension / corridor diagnosis

`js/views/diagnosis.js` and `js/views/evaluation.js` use pure metrics in `js/diagnostics.js`, persisted by the existing version-2 `store.js` compatibility layer. `server/field_readings.py` handles validated interval API traffic, SQLite storage and the `field_outbox` queue. `server/timeseries.py` exports numeric-only `simpul_field_interval` points to InfluxDB OSS 2.x. A separate Grafana dashboard consumes that series. The standalone HTML has no backend by itself. See `docs/DIAGNOSIS_AND_PILOT.md`.
