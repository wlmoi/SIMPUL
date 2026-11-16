# Verifikasi geospasial dan monitoring Pi

Tanggal: 16 November 2026 WIB. Lingkup: UI peta, koordinat eksplisit, branding AIERA, runtime Pi, dan monitoring lokal laptop.

## Perubahan

- `js/geospatial.js` memvalidasi latitude/longitude WGS84. Nilai kosong/null/boolean dan koordinat di luar batas ditolak. Koordinat eksplisit `0,0` tetap sah. Referensi awal Fatmawati digunakan saat koordinat proyek belum tersedia.
- `js/map-controller.js` memuat Leaflet 1.9.4 dari aset lokal. Popup memakai DOM `textContent`; nilai dari dokumen diperlakukan sebagai teks. Penanda PDF memakai GPS eksplisit yang lolos validasi, dengan status unverified dan halaman sumber. Status basemap mengikuti keberhasilan/kegagalan pemuatan tile.
- `js/views/mapview.js` dan `styles.css` memperbarui workspace geospasial: panel sumber, koordinat pusat, kontrol pusat studi/semua titik, serta tampilan desktop/mobile.
- `js/views/monitor.js` menyediakan tautan layanan Grafana/InfluxDB laptop dan status koneksi yang mengikuti respons backend.
- Logo AIERA yang diberikan pengusul tersedia di `assets/aiera-foundation.png`. Badge header diganti dengan logo; redaksi sumber contoh menggunakan “data sintetis”. Nilai mesin `source=demo`, `source=manual`, filter dan aturan ekspor dipertahankan.
- Bundler menyertakan aset lokal Leaflet/logo dalam cache PWA; nama cache mengikuti hash konten agar pembaruan tampil. Logo ditanam sebagai data URI dalam HTML mandiri.
- `server/storage.py` menutup koneksi SQLite setelah commit/rollback konteks. Ini memperbaiki handle terbuka yang ditemukan saat regresi Windows, dengan skema, transaksi, dan outbox tetap dipertahankan.
- Pemeriksaan API menggunakan kontrak OpenAPI publik pada FastAPI baru. Pengujian bundler menormalkan pemisah path dan fixture SQLite legacy ditutup eksplisit agar portabel di Windows.

## Hasil pemeriksaan

| Pemeriksaan | Hasil yang diamati |
|---|---|
| `npm test` / `npm run verify` | 15 kelompok pengujian JavaScript lulus; 0 gagal |
| `python tools/check_module_catalog.py` | 20 modul, 101 path sumber/pengujian unik; lulus |
| `python tools/build_standalone.py` | 49 modul JS; HTML mandiri dan cache PWA dibangun |
| `node --check docs/bundled_app.js` | Lulus |
| Pytest API registry, bundler, PDF evidence, security hardening, SQLite context | 17 lulus; 0 gagal; satu peringatan deprecation Starlette/httpx |
| `python tests/test_timeseries.py` | Lulus: outbox, backfill, pemisahan sumber, retry, idempotensi dan privasi telemetry |
| Browser terisolasi terhadap server Pi | Leaflet lokal, referensi stasiun, GPS eksplisit, escaping popup, provenance, tautan monitoring dan layout mobile lulus; 0 uncaught page errors |
| Integritas deployment | 86/86 hash berkas runtime cocok pada Pi |

Perintah pytest yang digunakan:

```text
python -m pytest -q tests/test_api_registry.py tests/test_build_standalone.py tests/test_document_evidence.py tests/test_security_hardening.py tests/test_sqlite_context.py
```

Pengujian Python dijalankan di virtual environment terisolasi `tmp/pi_setup/qa_venv`, di luar sandbox Windows karena pembatasan event loop/direktori sementara. Kegagalan awal mengungkap asumsi router internal FastAPI, pemisah path Windows, serta handle SQLite; pemeriksaan diulang setelah perbaikan. Tidak ada ekspektasi keamanan atau transaksi yang dihapus.

## Monitoring yang berfungsi

Grafana 12.3.0 dan InfluxDB 2.7.12 berjalan pada Docker laptop dengan port loopback. Backend Pi mengakses InfluxDB melalui reverse tunnel SSH pada `127.0.0.1:18086`. SQLite tetap menjadi penyimpanan utama.

- Grafana health: database `ok`.
- Datasource `simpul-influx`: status `OK`.
- Dua dashboard terprovisi: Monitoring Observasi Lapangan dan Diagnosis Koridor dan Akses.
- InfluxDB health: `pass`; login `simpul_admin` menghasilkan HTTP 204 dan `/api/v2/me` HTTP 200.
- Uji Pi ke InfluxDB memakai measurement `simpul_diagnostic`, `source=system`, dan run ID unik. Write HTTP 204, query pada rentang timestamp eksplisit HTTP 200 dengan record cocok, cleanup HTTP 204.
- Uji awal memakai batas waktu relatif dan tidak menemukan titik beberapa detik di depan clock server. Selisih clock terukur sekitar 2,5 detik; query berbatas timestamp eksplisit berhasil. Setiap titik diagnostik dibersihkan setelah pemeriksaan.
- Tidak ada observasi lalu lintas buatan yang disisipkan untuk mengisi dashboard. Status pengiriman terakhir mengikuti data manual yang benar-benar tersedia.

Kredensial disimpan dalam `.env` lokal yang tidak dilacak Git. `output/pi/Lihat_Akses_Monitoring.ps1` menampilkan akun dan kata sandi pada terminal pengguna; token API tidak ditampilkan. Backend Pi menyimpan konfigurasi monitoring pada file berizin 600. Rahasia tidak disertakan dalam paket runtime.

## Akses dan konfigurasi

- SIMPUL: `http://127.0.0.1:8890/#mapview` melalui forward tunnel SSH ke Pi.
- Grafana: `http://127.0.0.1:3000`, pengguna `admin`.
- InfluxDB: `http://127.0.0.1:8086`, pengguna `simpul_admin`.
- Layanan Pi: `simpul-pi.service`; perangkat teridentifikasi Raspberry Pi 3 Model B Plus.
- Kedua tunnel SSH memerlukan laptop dan koneksi LAN tetap aktif. `output/pi/Hubungkan_SIMPUL_Pi.ps1` dipakai untuk menyambungkan akses kembali.

## Batas dan gerbang penerimaan

Validasi ini mencakup fungsi perangkat lunak dan konektivitas. Catatan PDF tetap berstatus unverified, titik zona merupakan referensi pengamat, dan SUMO tetap memakai jaringan sintetis sesuai status engine.

Pengujian browser otomatis memblokir permintaan tile OSM. Referensi kebijakan: https://operations.osmfoundation.org/policies/tiles/ . Peta dasar dalam sesi pengguna memerlukan internet pada browser, dengan atribusi terlihat dan tanpa prefetch tile. Validasi geometri/kejadian lalu lintas di Fatmawati memerlukan pemeriksaan lapangan dan data pengukuran.

Gerbang berikutnya: pengguna memeriksa peta dan login monitoring pada laptop, kemudian mengumpulkan observasi manual yang berizin untuk mengisi dashboard. Uji reboot fisik, AI provider dan SUMO tetap memerlukan konfigurasi serta pemeriksaan tersendiri.

