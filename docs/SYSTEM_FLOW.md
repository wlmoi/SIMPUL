# Alur end-to-end SIMPUL

## Tujuan
Menilai hambatan akibat kendaraan menaikkan/menurunkan/menunggu penumpang dekat akses penjemputan MRT Fatmawati, tanpa mengabaikan akses menuju transportasi massal. Rujukan utama: halaman 1–5 proposal SIMPUL.

```text
Surveyor HP (zona & sesi, kejadian manual)
       |
       v
Rekaman berstempel waktu + asal [manual/demo]
       |
       +-- -> ringkasan deterministik (jumlah, durasi, pola)
       |                       |
       |                       +--> Gemini opsional: interpretasi agregat (perlu review)
       |
       v
Parameter skenario + geometri jalan terverifikasi [belum tersedia untuk Fatmawati]
       |
       +--> A0 eksisting
       +--> A1 pemanfaatan area jemput
       +--> A2 aturan lokasi/durasi berhenti
       |
       v
SUMO: jaringan uji sintetis tersedia; jaringan Fatmawati perlu kalibrasi
       |
       v
Metrik tundaan, antrean, akses, ketidakpastian + provenance
       |
       v
Pengelola meninjau, membandingkan, dan mengambil keputusan
       |
       v
Ekspor / verifikasi pilot / pengamatan pascaintervensi [rencana]
```

## Pemetaan modul

| Tahap | Modul kode | Input | Output | Batasan |
|---|---|---|---|---|
| Observasi | `js/views/observation.js`, `server/storage.py` | Form sesi, jenis, durasi, zona | Rekaman manual, CSV, SQLite jika disinkronkan | Tidak ada deteksi kamera otomatis |
| Analisis | `js/analytics.js`, `js/views/insights.js`, `server/providers.py` | Kejadian, agregat anonim | Indikator dan hipotesis Gemini | Model AI belum diuji pada data lapangan |
| Simulasi | `js/views/simulation.js`, `server/app.py` | A0/A1/A2, volume, durasi, seed | Heuristik demo atau SUMO uji | Jaringan SUMO adalah contoh sintetis |
| Evaluasi | `js/views/reports.js`, `js/views/project.js` | Perbandingan dan asumsi | Laporan JSON/CSV dengan status sumber | Tidak menggantikan keputusan lapangan |
| Context (opsional) | `server/context_plus.py`, `server/routing.py` | Koordinat, tanggal | Rute, cuaca, akses kontekstual | Bukan survei arus kendaraan |
| Komersial (hipotesis) | `js/finance.js`, `js/views/business.js` | Harga, biaya, lokasi | Proyeksi revenue dan margin | Bukan transaksi sesungguhnya |

## Tanggung jawab
- Surveyor: akurasi waktu, zona, dan label; persetujuan observasi.
- Analis: kualitas dataset, pemisahan kalibrasi vs validasi, interpretasi hasil.
- Pengelola: penilaian keselamatan, aksesibilitas, keputusan dan otorisasi.
- Tim implementasi: dokumentasi versi konfigurasi, pengujian, API key dan privasi.

## Kriteria pembuktian
- Target F1 kejadian 0,80 melalui anotasi manusia.
- Target galat volume maksimal 20% melalui sesi uji terpisah.
- Setiap A0/A1/A2 dieksekusi dengan demand sebanding dan beberapa seed.
- Akses pejalan kaki dinilai bersama antrean dan tundaan, termasuk kebutuhan difabel.
- Rekomendasi memiliki provenance, asumsi, keterbatasan.
- Target pengurangan waktu pembuatan laporan 20% perlu uji pengguna.

**Seluruh angka di atas adalah target proposal, bukan pencapaian implementasi v0.5.**
