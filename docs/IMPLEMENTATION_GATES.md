# SIMPUL — Tahapan Implementasi dan Komersialisasi

Tanggal target mengikuti proposal: Desember 2026–April 2027. Status di bawah adalah rencana lanjutan, bukan pekerjaan yang telah diverifikasi.

| Gate | Prioritas | Output terukur | Kriteria berhenti / lanjut |
|---|---|---|---|
| I — Des 2026 | Validasi masalah dan pengguna | Persetujuan pengamatan, protokol zona, wawancara operasional dan 12 sesi observasi terjadwal | Masalah, peran pengambil keputusan dan data yang boleh dikumpulkan harus jelas |
| II — Des–Jan | MVP mobile-first | Catat sesi, periksa event, sinkronisasi aman, ekspor data | Petugas mampu melakukan survei end-to-end tanpa pelatihan panjang |
| III — Jan–Feb | Digital twin lokasi | Geometri Fatmawati diverifikasi, SUMO dikalibrasi, skenario A0/A1/A2 | Error dan ketidakpastian diterima pada set validasi independen |
| IV — Feb–Mar | Pilot dengan operator | Analisis skenario, review keselamatan, waktu kerja, laporan audit dan cost-to-deliver | Pembeli menilai laporan dapat dipakai dalam pengambilan keputusan |
| V — Mar–Apr | Commercial readiness | Paid pilot proposal, SLA, procurement fit, gross margin, pricing testing | Pembeli bersedia mengikat proses pengadaan atau pembelian yang sah |

## Customer-to-revenue path

1. Identifikasi pengelola transit atau konsultan dengan kebutuhan nyata.
2. Wawancara proses saat ini, frekuensi evaluasi, biaya survei, pemegang anggaran, dan batas pengadaan.
3. Demonstrasikan workflow menggunakan *data sintetis yang diberi label*.
4. Tawarkan paid pilot yang lingkupnya terbatas: survei, model, skenario, laporan, dan sesi evaluasi.
5. Peroleh persetujuan pengumpulan data dan kontrak melalui prosedur yang benar.
6. Ukur biaya delivery, ketepatan model, penerimaan laporan, dan willingness-to-pay setelah pilot.
7. Jika manfaat berulang terbukti, tawarkan onboarding lokasi dan langganan analitik.
8. Pantau penggunaan dan outcome, lalu tawarkan ekspansi ke lokasi berikutnya.

### Perangkat minimum

**Akun survei manual**: smartphone dengan browser, akses atau izin pengamatan, daya baterai cukup, dan proses ekspor/backup. Tidak memerlukan Raspberry Pi.

**Penggunaan SUMO**: smartphone sebagai klien, backend Python, `sumo`, `netconvert`, dan kapasitas CPU/RAM pada server; jaringan/konektivitas untuk mengirim job dan menerima hasil.

**Pilot kamera**: perizinan dan pelindungan data perlu diselesaikan lebih dahulu; tambah kamera, mounting, penyimpanan, daya, dan komputer tepi hanya ketika manfaatnya bisa dibenarkan.

### Indikator bisnis yang perlu benar-benar dikumpulkan

- Customer interview count, qualified buyer count and time-to-decision.
- Pilot quote acceptance, pilot gross margin and delivery days.
- Conversion from paid pilot to recurring subscription.
- Location onboarding cost and support hours.
- Simulation cloud cost per run and support per active site.
- Annual procurement cycle, renewal rate and churn.
- Reduction of analyst/report hours against comparable manual workflows.

The `Business Studio` UI currently computes *hypothetical economics*. These indicators will become actual operational evidence only after real signed customer and cost records exist.
