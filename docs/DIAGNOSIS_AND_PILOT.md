# SIMPUL v0.8 — Diagnosis Hambatan dan Evaluasi Pilot

## Masalah yang dijawab

Mengacu pada `reference/SIMPUL_iSeeDesignITB_Proposal.pdf`, pertanyaannya adalah bagaimana mengurangi hambatan kendaraan saat menaikkan, menurunkan, atau menunggu penumpang di sekitar akses MRT Fatmawati **tanpa memperburuk akses menuju transportasi massal**. Empat tahap proposal adalah observasi → analisis berbantuan SI/Gemini → simulasi SUMO → evaluasi. Versi v0.8 melengkapi observasi event dengan data interval yang diperlukan untuk mendukung evaluasi antrean dan akses.

## Fitur yang diimplementasikan

1. **Diagnosis Hambatan** (`js/views/diagnosis.js` + `js/diagnostics.js`): form pengamatan interval, jenis periode, zona, sumber manual, fase baseline/follow-up, skenario A0/A1/A2, volume kendaraan, jumlah berhenti, antrean maksimum, jarak akses pejalan, volume pejalan, akses terhalang, kapasitas ruang jemput, dan okupansi ruang. Waktu pengamatan (`at`) dipisahkan dari waktu input (`recordedAt`).
2. **Normalisasi**: kejadian berhenti per jam = total berhenti × 60 / jumlah menit pengamatan. Angka ini menggambarkan interval yang diamati, bukan volume lalu lintas koridor yang tidak diamati. Antrean maksimum adalah puncak yang dimasukkan petugas, bukan hasil video AI.
3. **Hipotesis tindakan yang transparan**: jika tercatat menunggu/dwell panjang, arahkan pemeriksaan ke A2; jika kapasitas terukur atau kegiatan berhenti relevan, uji A1; jika akses terhalang, prioritaskan pemeriksaan jalur pejalan. Ini adalah aturan deterministik untuk menentukan langkah analisis, bukan rekomendasi operasional tervalidasi.
4. **Rencana & Dampak** (`js/views/evaluation.js`): screening numerik skenario berdasarkan antrean dan akses; pencatatan alasan dan status kajian tim; daftar gate observasi, kalibrasi, pemeriksaan kewenangan, dan observasi ulang.
5. **Before-after matched comparison**: hanya data dari **zona, periode, dan skenario follow-up** yang sesuai dipasangkan. A0→A1, A0→A2 atau A0→A0 dipilih secara eksplisit; data A1 dan A2 tidak dicampur. Pembandingan memberikan selisih deskriptif, bukan bukti kausal. Baseline harus berlabel A0.
6. **API-first storage** (`server/field_readings.py`): validasi Pydantic dan penyimpanan SQLite dengan ID idempoten, input demo ditolak, benturan ID dikembalikan sebagai HTTP 409, outbox untuk pengiriman time series.
7. **InfluxDB** (`server/timeseries.py`): measurement `simpul_field_interval` dengan tag `zone`, `phase`, `scenario`, `period`, `source`; numerik fields `minutes`, `passing`, `stopped`, `max_queue`, `access_meters`, `pedestrians`, `blocked`, `bay_capacity`, `bay_occupied`. Catatan bebas dan identitas pengguna tidak dikirim.
8. **Grafana** (`infrastructure/grafana/dashboards/simpul-diagnosis.json`): dashboard baru delapan panel untuk kuantitas, antrean, dan akses berbasis interval manual, terpisah dari tujuh panel event versi sebelumnya.
9. **Laporan**: JSON mencakup interval mentah, diagnosis, gate bukti, pembandingan masing-masing skenario, kriteria screening, serta catatan keputusan internal. CSV interval terpisah dari CSV event.

## Alur demo tanpa data palsu

1. Buka `SIMPUL_Standalone.html`, kemudian **Diagnosis Hambatan**. Delapan event contoh lama tetap berlabel `demo` dan tidak masuk statistik interval.
2. Klik **Tambah interval**; masukkan volume kendaraan yang benar-benar dihitung, jumlah berhenti, antrean, akses, dan kapasitas area. Tentukan jam sibuk/non-sibuk, zona, serta fase `baseline` untuk A0.
3. Setelah ada pilot yang disetujui dan benar-benar dilaksanakan, rekam fase `followup`, pilih A1 atau A2 sesuai perubahan nyata. Hindari mengisi data sintetis sebagai hasil lapangan.
4. Pada **Rencana & Dampak**, pilih perbandingan A0→A1 atau A0→A2. Periksa kelompok zona-periode yang berpasangan dan kesenjangan bukti. Skenario simulasi browser tetap ilustratif; SUMO backend tetap jaringan sintetis sampai kalibrasi lokasi tersedia.
5. Catat keputusan tim dan alasan yang merujuk hasil observasi. Jangan menandai perubahan sebagai sah hanya karena dicatat di aplikasi.
6. Ekspor interval CSV atau laporan JSON. Jika backend berjalan, gunakan **Sinkronkan** agar interval tersimpan di SQLite dan diteruskan lewat outbox ke InfluxDB.

## Endpoint dan bentuk request

**POST** `/api/field-readings/sync` (batas 500 item):

```json
{
  "items": [{
    "id": "interval-001",
    "at": "2026-11-15T07:00:00+07:00",
    "recordedAt": "2026-11-15T07:35:00+07:00",
    "phase": "baseline",
    "scenario": "A0",
    "period": "Jam sibuk",
    "zone": "Zona A",
    "minutes": 30,
    "passingVehicles": 100,
    "stoppedVehicles": 12,
    "maxQueue": 8,
    "accessMeters": 130,
    "pedestrians": 50,
    "blockedAccess": false,
    "availableBays": 4,
    "occupiedBays": 2,
    "source": "manual",
    "note": "Pengamatan interval oleh petugas"
  }]
}
```

**GET** `/api/field-readings` mengembalikan catatan manual; **GET** `/api/field-readings/summary` menghasilkan agregat fase tanpa klaim validasi. `/api/monitor/stream/status` mencakup `fieldIntervals` pending/delivered. `/api/monitor/stream/flush` mencoba ulang outbox event dan interval.

## Kualitas bukti dan batas interpretasi

- Proposal menargetkan **12 sesi** masing-masing 30–60 menit. Jumlah interval tidak boleh dianggap sebagai jumlah sesi. Pengingat 12 sesi merupakan gate administratif, bukan definisi sampel statistik yang memadai untuk semua metrik.
- Untuk evaluasi yang layak, tim harus mengukur traffic flow, antrean, akses pejalan, serta faktor perancu (hari, cuaca, demand, penegakan aturan, perubahan geometri) dan melaporkan variasi antar-sesi.
- Data manual belum diverifikasi secara independen; F1-score 0,80, galat volume maksimal 20%, serta penurunan waktu laporan 20% **belum diukur**.
- SUMO bawaan backend menggunakan jaringan uji sintetis. Hasil screening tidak boleh dipresentasikan sebagai prediksi atau dampak Fatmawati.
- Metrik `accessMeters` merupakan jarak atau detour yang dicatat petugas, tidak otomatis membuktikan aksesibilitas pengguna kursi roda. Perlu peninjauan akses disabilitas dan keselamatan secara terpisah.
- Observasi sesudah dibandingkan menurut zona-periode dan skenario yang sama, tetapi tetap bersifat deskriptif dan tidak menetapkan kausalitas. Tidak ada klaim intervensi nyata telah dilakukan.
- Backend adalah contoh lokal **tanpa autentikasi**, tidak aman untuk diakses publik; izin pengamatan dan kebijakan privasi harus ditetapkan sebelum survei nyata.

## Pengujian

```bash
npm test
node tests/test_state_migration.mjs
python -m pytest -q tests/test_field_readings.py
python tools/build_standalone.py
```

Pengujian unit mencakup normalisasi, pemisahan `demo`, pencocokan periode dan skenario, validasi payload, duplicate ID, field telemetry line protocol, serta ketiadaan catatan bebas dalam telemetri. Browser E2E dapat dijalankan dengan Playwright menggunakan standalone markup dalam Chromium; pengujian koneksi Grafana–InfluxDB secara langsung tetap memerlukan Docker pada host pengguna.
