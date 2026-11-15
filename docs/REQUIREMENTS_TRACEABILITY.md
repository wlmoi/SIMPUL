# Keterlacakan kebutuhan proposal → implementasi

| Sumber proposal | Kebutuhan yang dimaksud | Implementasi v0.5 | Bukti atau keterbatasan |
|---|---|---|---|
| Hal. 1–2, masalah dan 5W+1H | Kendaraan berhenti di area penjemputan Fatmawati | `js/views/project.js`, `observation.js` | Zona demo, belum diukur di lapangan |
| Hal. 2, diagram 01 | Observasi volume, lokasi dan durasi | Form sesi/kejadian, penyimpanan browser dan SQLite | `tests/smoke_test.py`, `tests/test_api.py` |
| Hal. 2, diagram 02 | Gemini menyusun temuan dari data anonim | `server/providers.py`, `insights.js` | API memerlukan key, belum uji akurasi lapangan |
| Hal. 2, diagram 03 | SUMO membandingkan skenario | `server/app.py`, `simulation.js` | Model contoh sintetis, tidak dikalibrasi |
| Hal. 2, diagram 04 | Evaluasi antrean, tundaan, akses | `simulation.js`, `reports.js` | Akses pedestrian input/indikator, belum observasi validasi |
| Hal. 2, A0/A1/A2 | Existing, area jemput, aturan berhenti | Engine demo dan konfigurasi SUMO | Simulasi mendukung perbandingan konseptual |
| Hal. 3, O1 F1 0,80 | Klasifikasi kejadian | Target terdokumentasi, tidak diukur | Belum tersedia deteksi video otomatis |
| Hal. 3, O2 galat 20% | Estimasi volume | Target dan metode verifikasi terdokumentasi | Perlu anotasi dan sesi uji terpisah |
| Hal. 3, O3–O5 | Skenario, akses, audit | Konfigurasi, catatan sumber, ekspor | Audit keputusan produksi belum lengkap |
| Hal. 3, 12 sesi 30–60 menit | Data pengamatan | Sesi rekam manual, target pilot | Belum 12 sesi nyata |
| Hal. 3, perangkat akuisisi | Raspberry Pi dapat digunakan | Planner opsional | Tidak diperlukan untuk MVP manual |
| Hal. 4, fase Des 2026–Apr 2027 | Gate pengembangan | README, `PROJECT_EXPLANATION.md` | Jadwal dari proposal, bukan progres yang diklaim |
| Hal. 4, UX -20% waktu laporan | Pengujian pengguna | Target dokumentasi | Belum dilakukan evaluasi pengguna |
| Hal. 5, privasi | Tidak ada face/plate recognition | Tidak ada modul pengenalan identitas | Kebijakan izin/retensi sebelum pilot diperlukan |

API data konteks, CRM, dan Business Studio adalah perluasan prototipe untuk kegunaan operasional/komersial; **bukan persyaratan utama proposal dan bukan hasil uji yang diklaim**.


## v0.8 traceability additions

| Requirement from proposal | v0.8 implementation | Important remaining evidence |
|---|---|---|
| Observation of volume, stopping duration and queue | Existing event capture plus interval form in Diagnosis Hambatan; source-labeled manual data, timestamps and zone | Actual 12 authorized field sessions, inter-rater protocol and independent annotation |
| A0 existing, A1 pickup area, A2 stopping rules | Scenario screening remains in simulator; follow-up field readings now separately tagged A0/A1/A2 | Fatmawati network calibration and repeated-seed simulation verification |
| Measure pedestrian-access trade-off | Manual interval distance/detour, blockage and pedestrian count; adjustable guardrail in evaluation | Ground truth of walking paths and disability access audit |
| Traceability and audit log | SQLite interval API, local decision register, numeric InfluxDB projection and Grafana dashboard | Authentication, tamper evidence and institutional approvals |
| Evaluate measured impact | Matched zone/period/scenario before–after comparison with descriptive differences | Controlled pilot, representative samples, confounder checks and confidence intervals |
