<p align="center">
  <img src="docs/assets/readme-hero.svg" alt="SIMPUL — Mobile-first urban mobility intelligence" width="100%" />
</p>

<p align="center">
  <strong>Understand vehicle stopping at MRT Fatmawati. Test curbside interventions with traceable evidence.</strong><br/>
  A modular, mobile-first mobility decision-support prototype developed from the iSeeDesignITB SIMPUL proposal.
</p>

<p align="center">
  <a href="#-get-started">Quick start</a> ·
  <a href="#-what-you-can-do">Features</a> ·
  <a href="#-architecture">Architecture</a> ·
  <a href="#-for-ai-coding-agents">AI agent guide</a> ·
  <a href="#-verification--limitations">Verification</a> ·
  <a href="#about-the-creators">Creators</a> ·
  <a href="docs/security/PENTEST_REPORT_v1.3.md">Security review</a>
</p>

<p align="center">
  <img alt="Release 1.9" src="https://img.shields.io/badge/release-v1.9-152A62?style=flat-square" />
  <img alt="Python FastAPI" src="https://img.shields.io/badge/backend-FastAPI-0C8A7B?style=flat-square" />
  <img alt="JavaScript ES modules" src="https://img.shields.io/badge/frontend-ES%20Modules-1768AC?style=flat-square" />
  <img alt="Prototype, not certified" src="https://img.shields.io/badge/status-research%20prototype-59677F?style=flat-square" />
</p>

> [!IMPORTANT]
> **SIMPUL is a research prototype, not a validated digital twin or police enforcement system.** Its default traffic data and heuristic estimates are synthetic. The optional SUMO runner uses a synthetic network, not a calibrated MRT Fatmawati network. Public-news references and AI interpretations are *supporting context*, never confirmed violations.

---

## Core Capabilities & Interface

SIMPUL starts with the core operational problem: vehicles picking up, dropping off, or waiting for passengers compete for curbside space near **MRT Fatmawati, Jakarta Selatan**. The outcome being investigated is traffic queues and obstruction of passenger/pedestrian access, not vehicle identity tracking or automatic law enforcement.

The Overview includes **Play full demo**: a 48-second guided 3D story from pickup demand and stopping activity to potential queues, A1/A2 alternatives, and human evaluation, plus full EN/ID language switching, compact sidebar navigation with advanced pages under Settings, and an interactive schematic 3D CCTV simulation page. Pause, replay, or select any of six chapters, or explore freely with orbit/zoom/pan (**Reset camera** restores the chapter view). The guided demo never saves observations. See [guided demo verification](docs/VERIFICATION_GUIDED_DEMO.md).

The primary app sequence is **Vehicle Problem Center → Field Observation → Diagnosis by time interval → Corridor Map → A0/A1/A2 Simulation → Evidence-backed Evaluation**.

- **Vehicle-first diagnostics:** Working source/activity/zone filters, duration and activity summaries, ternary pedestrian/lane/queue evidence states (`yes` / `no` / `unknown`), and review hypotheses for A1 and A2 ([Vehicle Problem Logic](docs/VEHICLE_PROBLEM_v1.9.md)).
- **Solution-first navigation:** Prioritizes *“Di mana kendaraan berhenti menghambat akses MRT?”* with an **Evidence Readiness** panel separating manually recorded events, manually measured intervals, and synthetic examples, plus an illustrative 3D corridor presentation preview and compact settings/creators hub.
- **Spatial map & PDF observations:** **Peta koridor interaktif** uses local Leaflet 1.9.4 + OpenStreetMap standard tiles for explicit WGS84 coordinates, while **Pencarian catatan PDF** indexes text-derived event candidates via PyMuPDF (with optional local OpenOCR; see [PDF & Map guide](docs/PDF_MAP_INTEGRATION_v1.7.md)). Try [`examples/SIMPUL_Observations_SYNTHETIC.pdf`](examples/SIMPUL_Observations_SYNTHETIC.pdf) on `#documents`.
- **Motion & offline experience:** Staged page reveals via Web Animations API (or optional self-hosted GSAP via `python tools/enable_gsap_local.py`), `prefers-reduced-motion` support, and `/` or `Ctrl/Cmd+K` page search ([Motion guide](docs/MOTION_DESIGN_v1.6.md) · [Navigation IA](docs/NAVIGATION_GUIDE_v1.5.md)).

---

## Overview

**SIMPUL** (*Sistem Inspeksi Mobilitas untuk Penataan Ulang Layanan*) studies how pickup, drop-off, and waiting vehicles affect traffic flow near **MRT Fatmawati, Jakarta Selatan**. It helps surveyors record conditions, analysts compare alternatives, and decision-makers examine traffic and pedestrian-access trade-offs before changing operations.

The original proposal defines four stages:

| 01 · Observe | 02 · Analyze | 03 · Simulate | 04 · Evaluate |
|:--|:--|:--|:--|
| Record type, zone, duration, time, and traffic intervals | Aggregate data; optionally interpret with Gemini | Compare **A0** baseline, **A1** pickup-area use, **A2** stopping rules | Inspect queues, delay, pedestrian access, evidence, and uncertainty |

**Primary users:** field surveyors, transportation analysts, station operators, and authorized reviewers. **Initial deployment:** local demonstration; no live police platform or automatic enforcement.

### Core field operations

- **Survey Coverage Planner:** Track planned manual sessions by zone and period (configurable 3-zone × 2-period × 2-repeat assumption based on the proposal's 12 × 30–60 min target), check duration, source quality, and internal review status.
- **Operational Response Board:** Turn manually reported P1/P2 obstructions into internal follow-ups with an owner, deadline, status, and audit history. No automated enforcement. See [feature-gap audit](docs/FEATURE_GAP_AUDIT_v1.4.md) and [verification report](docs/VERIFICATION_v1.4.md).

---

## 🚀 Get started

Choose **one** of the following paths. No paid API key is required for the core demo.


### Security review & Strix readiness (v1.3)

> [!WARNING]
> **The autonomous Strix engine has not been run on this release.** Docker and a configured Strix runtime were unavailable in this development environment. The security changes below have been tested with local regression tests, not with Strix-generated attack proofs.

This release adds hostname filtering, optional Bearer authentication for API routes, foreign-origin write rejection, basic rate limiting, browser security headers, collision-safe observation syncing, and CSV spreadsheet-formula protection. The backend remains a **single-host research prototype**, not a multi-tenant police evidence platform.

To require an API token when running locally:

```powershell
# Generate a fresh secret locally and keep it out of Git.
$env:SIMPUL_API_TOKEN = python -c "import secrets; print(secrets.token_urlsafe(32))"
python server/app.py
```

Enter the same token under **Pengaturan & Data → Keamanan API lokal**. The browser stores it only for the current tab session. Never expose a token over plain HTTP; external hostnames require an explicitly configured allowlist and HTTPS.

To run the **actual Strix CLI later on your authorized Windows 11/WSL2 workstation**, read [the safety-gated Strix runbook](docs/security/STRIX_LOCAL_RUNBOOK.md). The runner stages only source, without the proposal PDF, databases or `.env`, and requires explicit consent before uploading source context to an LLM provider.

**Evidence:** [Local security review and residual-risk report](docs/security/PENTEST_REPORT_v1.3.md).

### Path A — Single-file demo (fastest)

1. Open **[`SIMPUL_Standalone.html`](SIMPUL_Standalone.html)** in Chrome, Edge, Safari, or another modern browser.
2. Select **Observasi lapangan**, **Diagnosis Hambatan**, or **Simulasi skenario**.
3. Explore explicitly marked demo observations and editable financial assumptions.

This mode uses browser storage. It **does not** run the Python backend, connect to Gemini/OpenOSINT, or execute real SUMO jobs. Export a backup before clearing browser data.

### Path B — Local app + FastAPI

**Requirements:** Python 3.10+, a modern browser, and optional Node.js 20+ for frontend tests.

<details open>
<summary><strong>Windows 11 / PowerShell</strong></summary>

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r server/requirements.txt
python server/app.py
```

Then open [http://127.0.0.1:8888](http://127.0.0.1:8888). API documentation: [http://127.0.0.1:8888/docs](http://127.0.0.1:8888/docs).

</details>

<details>
<summary><strong>macOS / Linux / WSL2</strong></summary>

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r server/requirements.txt
python server/app.py
```

Then open `http://127.0.0.1:8888`.

</details>

### Path C — Docker (optional Grafana + InfluxDB)

```bash
python tools/init_monitoring.py
# Start SIMPUL + optional observability stack
docker compose --profile monitoring up --build -d
```

| Service | Local address | Purpose |
|:--|:--|:--|
| SIMPUL | `http://localhost:8888` | App and API |
| Grafana | `http://localhost:3000` | Monitoring dashboards |
| InfluxDB | `http://localhost:8086` | Time-series observations |

`init_monitoring.py` generates **random local credentials** in `.env` and refuses to overwrite an existing `.env`. If you already have an `.env`, configure monitoring variables without replacing your existing secrets. Local Docker container-to-container interoperability was **not tested in this release environment**; see the [monitoring guide](docs/MONITORING_GRAFANA_INFLUXDB.md).

---

## What you can do

| Capability | Main screen | What it actually does |
|:--|:--|:--|
| **Field observations** | Observasi lapangan | Session/event entry, timestamps, zones and manual export |
| **Survey readiness** | Rencana survei & cakupan | Editable session coverage plan, independent internal review and gap checks |
| **Operational follow-up** | Tindak lanjut hambatan | Manual P1/P2 triage, owner assignment, due date, status history and privacy-reduced JSON export |
| **Time-series monitoring** | Monitoring & data log | Browser history, SQLite sync, optional InfluxDB outbox, Grafana configs |
| **Traffic diagnosis** | Diagnosis Hambatan | Traffic interval summaries, curbside capacity, queue and access indicators |
| **Classification** | Klasifikasi & Tinjauan | Operational P1–P4 prioritization and human review; **no legal finding** |
| **Geospatial context** | Peta & Context Intelligence | OpenStreetMap facilities, optional routing/weather/context services |
| **Public intelligence** | Konteks Publik / OSINT | Optional GDELT geolocated public-news context via **OpenOSINT** |
| **Traffic scenarios** | Simulasi skenario | A0/A1/A2 demo comparison or optional synthetic SUMO execution |
| **Evidence quality** | Standar & kualitas bukti | Source checks, provenance metadata, GeoJSON / report exports |
| **Commercial planning** | Business Studio | Editable pricing, scenario assumptions, 12-month forecasts |

SIMPUL also includes **customer discovery, equipment planning, intervention logs, and before/after comparisons**. These capabilities do not imply that external customers or traffic improvements have already been verified.

### Use case: from field event to review

For a full operational loop, open **Rencana survei & cakupan** to inspect missing sessions, start a labeled session in **Observasi lapangan**, record obstruction indicators, and review the completed session. P1/P2 manual observations can then be assigned via **Tindak lanjut hambatan**. Review labels and action statuses remain local, and must not be mistaken for independent verification or official police actions.

```mermaid
flowchart LR
    A[Field observation] --> B[Source and timestamp validation]
    B --> C[Deterministic classification]
    C --> D[Traffic diagnosis]
    D --> E[Scenario A0 / A1 / A2]
    E --> F[Evidence report]
    F --> G[Human decision]
    G --> H[Follow-up observation]
    H --> D
    I[Public context APIs] -.-> D
    J[Gemini, optional] -.-> F
```

**Data hierarchy:** `manual observation` ≠ `synthetic example` ≠ `public-news mention` ≠ `simulation output`. The application must preserve these distinctions in storage, charts, and exports.

---

## 🧱 Architecture

**Design intent:** a small modular monorepo; no Kubernetes or mandatory third-party services.

```mermaid
flowchart TB
    subgraph UI[Browser / mobile PWA]
        VIEW[Page registry + views]
        DOMAIN[Deterministic domain logic]
        STORE[Local browser state]
        EXPORT[CSV + evidence exporters]
    end
    UI --> API[FastAPI router registry]
    API --> SQL[(SQLite + telemetry outbox)]
    API --> SIM[SUMO synthetic worker, optional]
    API --> GEO[Fixed external API adapters]
    API --> OSINT[OpenOSINT/GDELT optional]
    SQL -.-> INFLUX[(InfluxDB optional)]
    INFLUX -.-> GRAF[Grafana optional]
```

### Folder map

```text
SIMPUL/
├── js/
│   ├── app.js                   # User actions, DOM and event orchestration
│   ├── page-registry.js         # Single registry of 19 page renderers
│   ├── views/                   # One view per user-facing module
│   ├── services/                # Pure CSV/export transforms
│   ├── store.js                 # Browser state and migrations
│   └── *.js                     # Domain engines (diagnosis, finance, etc.)
├── server/
│   ├── app.py                   # FastAPI startup + static asset serving
│   ├── simulation_api.py        # SUMO job queue and HTTP endpoints
│   ├── simulation_engine.py     # Synthetic SUMO computation
│   ├── api_registry.py          # All FastAPI router registrations
│   └── *.py                     # Scoped API adapters / persistence modules
├── infrastructure/grafana/     # Provisioned monitoring dashboards
├── config/module-catalog.json  # Machine-readable agent module ownership
├── docs/
│   ├── agents/                  # Change guides for AI coding agents
│   ├── architecture/            # Boundaries, data flow and contracts
│   └── ...                      # API, methods and release verification
├── tests/                      # JS/Python regression and contract tests
├── tools/                      # Build and catalog checks
├── .github/workflows/          # JS + Python contract gates on pull requests
├── reference/                   # Original five-page proposal
├── AGENTS.md                    # Read this before agent changes
├── docker-compose.yml
└── README.md
```

**Key changes in v1.2:** The frontend page registry, export transformations, and backend router registration are now separately maintained; the single-file build discovers ES-module imports automatically. See the [architecture guide](docs/architecture/OVERVIEW.md) and [module catalog](config/module-catalog.json).

---

## 🤖 For AI coding agents

SIMPUL includes a **task routing system** for Codex, Claude Code, Cursor, and other coding agents. Start with [**AGENTS.md**](AGENTS.md), then select the smallest relevant module rather than scanning the entire repository.

| You want to change… | Open first | Verify with… |
|:--|:--|:--|
| A page, navigation, or mobile interface | [`js/AGENTS.md`](js/AGENTS.md) | `node tests/test_module_boundaries.mjs` |
| Traffic classification or review rules | [`docs/agents/TASK_PLAYBOOKS.md`](docs/agents/TASK_PLAYBOOKS.md) | `node tests/test_classification.mjs` + API tests |
| API or external provider | [`server/AGENTS.md`](server/AGENTS.md) | relevant `pytest` contract tests |
| InfluxDB or Grafana | [`infrastructure/AGENTS.md`](infrastructure/AGENTS.md) | `python tests/test_timeseries.py` |
| A data schema or migration | [`docs/architecture/DATA_CONTRACTS.md`](docs/architecture/DATA_CONTRACTS.md) | state migration + API tests |
| Standalone build | [`tools/build_standalone.py`](tools/build_standalone.py) | `npm run build:standalone` |

Automated CI runs the same JS/Python contract gates on pull requests; see [`.github/workflows/quality.yml`](.github/workflows/quality.yml). CI does **not** validate live provider integrations, SUMO or field measurements.

**Agent workflow:** inspect the current module → state the change and invariants → implement → test the affected boundary → regenerate standalone → record actual verification. Follow [task playbooks](docs/agents/TASK_PLAYBOOKS.md) and the [module ownership catalog](config/module-catalog.json).

```bash
npm run verify                  # JS tests + catalog + regenerated standalone syntax
python -m pip install -r requirements-dev.txt
python -m playwright install chromium  # Linux CI uses: install --with-deps chromium
python -m pytest -q tests
```

The module catalog is validated automatically; adding a new page or API requires updating the corresponding registry and tests. No empty folder structure or speculative service is needed.

---

## APIs, configuration & observability

API documentation is generated by FastAPI at `/docs`. Major endpoint groups:

| Area | Interface | What to know |
|:--|:--|:--|
| Observation | `/api/observations/*` | SQLite is local, unauthenticated development storage |
| SUMO | `/api/simulation`, `/api/simulation/{job_id}` | Runs only when binaries exist; synthetic network |
| Traffic review | `/api/v1/traffic/*` | Deterministic triage, not official enforcement |
| Public intelligence | `/api/v1/public-intelligence/*` | Passive news context, optional installation and opt-in |
| Monitoring | `/api/monitor/*` | InfluxDB requires local config; failed writes stay pending |
| Context and AI | `/api/context/*`, `/api/ai/insights`, `/api/v1/cv-reviewed`, `/api/v1/ai/decision-brief` | Provider-specific credentials and licensing apply; Decision Brief degrades deterministically |

Configure secrets through environment variables; inspect [`.env.example`](.env.example). **Never put API keys in frontend JavaScript**. Full endpoint reference: [docs/API_REFERENCE.md](docs/API_REFERENCE.md). Optional OpenOSINT adapter: [integration guide](docs/OPENOSINT_INTEGRATION.md). Monitoring: [Grafana + InfluxDB guide](docs/MONITORING_GRAFANA_INFLUXDB.md).

### Optional OpenOSINT setup

```bash
python -m pip install -r server/requirements-openosint.txt
# Set SIMPUL_PUBLIC_OSINT_ENABLED=1 in the backend environment
python server/app.py
```

Only `search_gdelt_geo` is exposed. **Identity lookups, breach queries, and automated investigations are not part of SIMPUL.** No live GDELT test or commercial-provider connection is claimed for this release.

---

## Critical gaps before production use

The following remain **not implemented** in v1.9: authenticated multi-user RBAC; secure multi-device syncing of survey reviews and operational cases; calibrated Fatmawati SUMO; independent measurement verification; official police dispatch; real-time alert delivery. Do not deploy this workspace as an official evidence or emergency-response system. See [the detailed audit](docs/FEATURE_GAP_AUDIT_v1.4.md).

---

## 🧪 Verification & limitations

**Verified locally in v1.9:** 36 passing Python tests, 14 sequential JavaScript test groups, a dependency-derived PWA cache and standalone build. The standalone HTML rendered at 1440 px desktop and 390 px mobile with no JavaScript errors or horizontal overflow; creators navigation and its LinkedIn link were also checked. All 24 previous routes remain available, with one new vehicle-problem route (25 total). These results do not constitute field validation or a Strix pentest. See [motion verification](docs/MOTION_DESIGN_v1.6.md) and the earlier [v1.4 verification report](docs/VERIFICATION_v1.4.md).

| State | Meaning |
|:--|:--|
| **Implemented & tested locally** | Relevant unit/contract tests executed successfully |
| **Configured / mock-tested** | Adapter exists; live upstream or Docker environment not verified |
| **Synthetic / illustrative** | Demonstration network, observations, or commercial assumptions |
| **Not yet validated** | Real Fatmawati dataset, calibrated network, production controls |

**Still required before a field deployment:** permissioned collection and stakeholder review, independent annotations, SUMO calibration/validation, HTTPS, authentication/authorization, data retention controls, and production security review. The original proposal's F1, volume-error, and report-time targets remain **targets**, not achieved measurements.

---

## Documentation

| Read this if you need… | Resource |
|:--|:--|
| The research premise and requirements | [Original proposal](reference/SIMPUL_iSeeDesignITB_Proposal.pdf) · [Requirements traceability](docs/REQUIREMENTS_TRACEABILITY.md) |
| Navigation and motion behaviors | [Motion guide v1.6](docs/MOTION_DESIGN_v1.6.md) · [Navigation guide v1.5](docs/NAVIGATION_GUIDE_v1.5.md) |
| Software module boundaries | [Architecture overview](docs/architecture/OVERVIEW.md) · [Data contracts](docs/architecture/DATA_CONTRACTS.md) |
| Agent-safe development workflows | [Agent start guide](docs/agents/START_HERE.md) · [Task playbooks](docs/agents/TASK_PLAYBOOKS.md) |
| API contracts | [API reference](docs/API_REFERENCE.md) · [Decision Brief design](docs/designs/neuro-symbolic-decision-brief.md) |
| Evidence and human-review limitations | [Traffic classification](docs/TRAFFIC_CLASSIFICATION_AND_REVIEW.md) · [International practices](docs/INTERNATIONAL_PRACTICES.md) |
| Optional integrations | [OpenOSINT](docs/OPENOSINT_INTEGRATION.md) · [Grafana/InfluxDB](docs/MONITORING_GRAFANA_INFLUXDB.md) |
| Engineering verification | [Release v1.4](docs/VERIFICATION_v1.4.md) · [Previous reports](docs/VERIFICATION_v1.2.md) |

<details>
<summary><strong>Troubleshooting: common local setup issues</strong></summary>

- **`ModuleNotFoundError: fastapi`** — activate your intended virtual environment and reinstall `server/requirements.txt`.
- **Port 8888 already used** — stop the other process or choose a different `PORT`.
- **SUMO reports unavailable** — install `sumo` and `netconvert` on the backend host and check `PATH` or `SUMO_HOME`.
- **Provider returns HTTP 503** — check backend environment and API credentials; don't replace it with fake success data.
- **Mobile phone cannot reach localhost on laptop** — localhost means the phone itself. A real shared deployment needs HTTPS, authentication and network configuration.
- **Grafana login fails** — check your generated `.env` values; don't reset volumes without a backup.
- **Old PWA cache** — after exporting local data, refresh or update service worker caches before concluding that a new build is broken.

</details>

## Responsible use & licensing

This repository is intended for **mobility research and operational decision support**. It must not be used for automated enforcement, identifying individual commuters, or unapproved public surveillance. Comply with applicable privacy rules and data-source licenses. OpenOSINT is an independently licensed MIT project; verify its upstream terms when distributing a combined product. See [licenses and upstream documentation](docs/OPENOSINT_INTEGRATION.md) and the original proposal for attribution.

---

## About the Creators

SIMPUL is developed by **iSeeDesignITB**, a five-member team from Institut Teknologi Bandung. Team names and responsibilities below are taken from the project's submitted proposal.

| Creator | Role in the SIMPUL proposal |
|:--|:--|
| **[William Anthony](https://www.linkedin.com/in/wlmoi/)** | Team lead, architecture and integration |
| Gregorius Yoga Robianto | Full-stack and data pipeline |
| Bennaya Jonathan R. P. Siagian | User research and pitching |
| Brian Albar Hadian | System verification and quality |
| Karol Yangqian Poetracahya | Information systems and traffic simulation |

Only the explicitly supplied LinkedIn profile is linked. No other personal accounts or biographies were inferred.

<p align="center"><sub>iSeeDesignITB · SIMPUL · SI Bridges Indonesia 2026 · Prototype release v1.9</sub></p>

## Deployment & Edge Notes

- **Static web (Vercel):** Build output and backend boundary rules are documented in [docs/VERCEL.md](docs/VERCEL.md).
- **Raspberry Pi + Laptop Monitoring:** Local Leaflet map workspace and SSH-tunneled Grafana/InfluxDB setup are documented in [docs/RASPBERRY_PI_INTEGRATION.md](docs/RASPBERRY_PI_INTEGRATION.md). Git push does not deploy to Pi; live AI requires a configured backend `GEMINI_API_KEY` and outbound connectivity.
