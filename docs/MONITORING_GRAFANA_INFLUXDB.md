# SIMPUL — Data Logging, InfluxDB & Grafana

## Tujuan

Modul ini menambah *observability* pada produk SIMPUL tanpa mengubah tujuan proposal: pengamatan aktivitas penjemputan di sekitar MRT Fatmawati, analisis berbantuan AI, dan evaluasi skenario A0/A1/A2 melalui SUMO.

- **SIMPUL PWA / HTML:** petugas mengisi sesi dan kejadian melalui HP; pencatatan lokal tetap tersedia saat internet mati.
- **FastAPI + SQLite:** menyimpan observasi manual sebagai data transaksional utama. SQLite memegang `observations`, `telemetry_outbox`, dan metadata log operasional.
- **InfluxDB OSS 2.x:** menerima *time-series measurements* dari observasi manual setelah sinkronisasi. Catatan demo tidak boleh dikirim.
- **Grafana:** menampilkan dashboard panel kejadian, rata-rata durasi berhenti, tren waktu, zona, kategori kejadian, dan jenis kendaraan. Dashboard terprovisi otomatis.

**Status epistemik:** *stored* berarti dicatat pengguna, *delivered* berarti InfluxDB menerima rekaman, bukan bahwa rekaman tersebut telah diverifikasi secara independen.

## Diagram alur

```text
Smartphone browser / SIMPUL PWA
   | (offline storage, only authorized manual events)
   | POST /api/observations/sync  [explicit or opt-in 30s]
   v
FastAPI
   | transaction
   +----> SQLite observations ---------> /api/monitor/summary
   |              |
   |              +--> telemetry_outbox (pending)
   |                        |
   |            POST /api/monitor/stream/flush (manual/retry)
   |                        |
   +------------------------+--> InfluxDB 2.x: simpul_traffic_event
                                        |
                                        +--> Grafana (Flux source)

Missing InfluxDB: pending retained in SQLite; API returns retry_pending.
```

No facial recognition, number plate recognition, or raw video frames are sent to InfluxDB. Free-text notes are excluded from exported time-series fields.

## Memulai pada Windows 11 + Docker Desktop WSL2

Prerequisites: Docker Desktop, WSL2 enabled, Python 3.12+ to generate credentials. The application does not depend on a paid monitoring service.

```powershell
# From the extracted project folder:
python tools/init_monitoring.py
# This creates an untracked .env file with random credentials.
docker compose --profile monitoring up --build -d
docker compose --profile monitoring ps
```

URLs on the **hosting computer**:

- SIMPUL: `http://127.0.0.1:8888`
- API documentation: `http://127.0.0.1:8888/docs`
- InfluxDB local admin: `http://127.0.0.1:8086`
- Grafana local UI: `http://127.0.0.1:3000`

Grafana username `admin`, password in the generated local `.env` file (`GRAFANA_ADMIN_PASSWORD`). InfluxDB username `simpul_admin`, password in the same file (`INFLUXDB_ADMIN_PASSWORD`). Keep `.env` private. These values are bootstrap credentials, not recommended for any public deployment. Grafana dashboard is provisioned under **SIMPUL → SIMPUL | Monitoring Observasi Lapangan**.

**Recommended operation sequence:** Start session → record manual event → navigate to **Monitoring & Data Log** → click **Sinkronkan manual** (or opt in to 30-second autosync) → inspect the InfluxDB pending queue → open Grafana and select a time range that includes the observation timestamps. No synthetic observations should appear in Grafana.

To turn off optional monitoring services, use:

```powershell
docker compose --profile monitoring stop grafana influxdb
```

If the backend remains running, it continues storing manual observations in SQLite. When monitoring restarts, use **Coba kirim ulang outbox**. Never run `docker compose down -v` unless you deliberately intend to delete all application and monitoring volumes.

## API endpoints

| Endpoint | Method | Use |
|---|---|---|
| `/api/observations/sync` | POST | Save manual observations atomically and attempt InfluxDB delivery |
| `/api/monitor/health` | GET | Local monitoring / SQLite status |
| `/api/monitor/summary` | GET | SQLite observation counts and mean duration |
| `/api/monitor/logs` | GET | Recent operational entries |
| `/api/monitor/logs.csv` | GET | Local metadata CSV download |
| `/api/monitor/metrics` | GET | Prometheus format text (optional separate scraper) |
| `/api/monitor/stream/status` | GET | InfluxDB config and outbox counts, no credential exposure |
| `/api/monitor/stream/status?probe=true` | GET | Optionally probe `/health` on InfluxDB |
| `/api/monitor/stream/flush` | POST | Retry up to 100 waiting time-series points |

HTTP 200 on `sync` means **SQLite persisted the batch**. Inspect `telemetry.status` for InfluxDB export outcome; a failed export does not reverse the observation write. The API uses event IDs for deduplication; repeated sync of the same event ID does not add observations.

## InfluxDB schema and retention

Measurement name: `simpul_traffic_event`.

| Part | Field | Meaning |
|---|---|---|
| Tag | `source` | Always `manual` |
| Tag | `zone` | Observation zone (bounded user input) |
| Tag | `event_type` | Jemput / Turun / Menunggu |
| Tag | `vehicle` | Mobil / Motor / Bus / Lainnya |
| Field | `count` | 1 integer per observation event |
| Field | `dwell_seconds` | Observed stopping duration |
| Field | `event_id` | Stable observation ID; not a high-cardinality tag |
| Timestamp | UTC ns | Time recorded on the user device, not ingestion time |

The default Docker bucket retention is **90 days**, whereas SQLite retains its primary records until the application is explicitly cleared. For academic research, a separate verified archival and retention plan must be established. Setting an appropriate time clock on the phone matters for chronological integrity.

The timestamp uses a stable submicrosecond suffix derived from event ID to reduce accidental series/time collisions without adding high-cardinality identity tags. A theoretical collision is still possible; the current prototype is not certified for high-throughput sensor telemetry.

## Grafana dashboard

Provisioning files:

- `infrastructure/grafana/provisioning/datasources/influxdb.yml`
- `infrastructure/grafana/provisioning/dashboards/dashboards.yml`
- `infrastructure/grafana/dashboards/simpul-field.json`

Datasource: InfluxDB 2.x / Flux, read using the token from the Grafana container environment. Dashboard fields are derived from the InfluxDB measurement only. Its queries do not infer real traffic volume, safety, or observed intervention impacts beyond the entered sample.

Flux is available for InfluxDB 2.x and not InfluxDB 3.x. A future InfluxDB 3 migration needs a distinct SQL query layer and dashboard adaptations. See [Grafana InfluxDB datasource](https://grafana.com/docs/grafana/latest/datasources/influxdb/) and [InfluxDB v2 write API](https://docs.influxdata.com/influxdb/v2/get-started/write/).

## Availability, security, and limitations

- This is a **single-host research prototype**. It has no login, tenant isolation, TLS termination, or deployment-grade rate limiting. Docker binds ports only to the host loopback address. Never open ports 8888, 8086, or 3000 directly to the public internet.
- An HP accesses the application through a network-accessible server address, not `localhost` on the phone. Remote field deployment requires authenticated HTTPS reverse proxy or VPN, secure access controls, and appropriate data protection measures before any nonpublic study data is collected.
- The browser-only standalone HTML uses local storage and does not start Grafana, InfluxDB, or SUMO. It can still display local monitoring and export CSV.
- Autosync is OFF by default. Enabling it sends manually entered observations to the configured backend every 30 s **only while the Monitoring page remains visible**.
- Sync is not a continuous IoT sensor stream. Camera-based automatic detection is not included.
- Outbox publishing is best-effort with explicit retries; it is not a continuously scheduled resilient delivery worker. Once InfluxDB recovers, click retry or re-sync.
- InfluxDB delivery and Grafana provisioning were **contract-/configuration-tested only** here. No Docker daemon exists in this authoring environment; live container integration remains unverified.
- A meaningful Fatmawati pilot still requires permits, measured input data, calibration/validation of SUMO, and nonfabricated observational results.

## Test commands

```bash
python tests/test_timeseries.py
node tests/test_monitoring.mjs
python tests/smoke_test.py
```

`test_timeseries.py` mocks the InfluxDB HTTP transport, validates point payloads, checks duplicate IDs, verifies retry after simulated outage, and confirms that notes do not leave the backend as telemetry. `smoke_test.py` validates UI on desktop and 390 px mobile widths using Playwright.


## v0.8: field-interval series and second Grafana dashboard

The existing `simpul_traffic_event` schema remains intact. The new `simpul_field_interval` series stores manually observed, interval-level measurements. Tags: `zone`, `phase`, `scenario`, `period`, `source=manual`. Fields: `minutes`, `passing`, `stopped`, `max_queue`, `access_meters`, `pedestrians`, `blocked`, `bay_capacity`, `bay_occupied`. Only bounded numeric inputs are sent; original free text remains in SQLite.

Synchronization begins from **Diagnosis Hambatan → Sinkronkan**. API `POST /api/field-readings/sync` first commits to SQLite, queues the record and attempts a best-effort InfluxDB write. The new dashboard `SIMPUL | Diagnosis Koridor dan Akses` is provisioned from `infrastructure/grafana/dashboards/simpul-diagnosis.json` and contains 8 panels. The original monitoring dashboard continues to have 7 panels. Total: 15 Grafana panels across two dashboards.

To retry queued records, use **Monitoring & Data Log → Coba kirim ulang outbox**. Its response now contains a nested `fieldIntervals` result. `GET /api/monitor/stream/status` includes `fieldIntervals.pending` and `fieldIntervals.delivered` counters. This does not indicate independent verification of observations. Docker provisioning and external API delivery have not been tested live in this authoring environment.
