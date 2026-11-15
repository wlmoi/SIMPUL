# Apa yang kita buat? — Penjelasan SIMPUL untuk tim dan juri

## Gambaran produk
SIMPUL (*Sistem Inspeksi Mobilitas untuk Penataan Ulang Layanan*) adalah aplikasi pendukung evaluasi penataan akses penjemputan di kawasan MRT Fatmawati, Jakarta Selatan. Masalah yang ditangani adalah kendaraan yang berhenti, menaikkan, menurunkan, atau menunggu penumpang di sekitar koridor transit. Ruang berhenti ini berpotensi menghambat arus dan mengganggu akses pejalan kaki. SIMPUL membantu pengelola membandingkan alternatif penataan secara digital sebelum diterapkan.

## Yang dilakukan pengguna
1. Surveyor membuka SIMPUL dari browser HP, memilih zona dan memulai sesi pengamatan.
2. Surveyor mencatat jenis kejadian, kendaraan, durasi berhenti dan catatan pendukung. Informasi tersimpan di browser; sinkronisasi SQLite dilakukan jika API lokal diaktifkan.
3. SIMPUL mengagregasi rekaman. Gemini dapat membantu membuat interpretasi dari agregat bila server memiliki API key, sementara hasil AI tetap memerlukan pemeriksaan manusia.
4. Analis menetapkan parameter model dan membandingkan **A0** (kondisi awal), **A1** (pemanfaatan area penjemputan), dan **A2** (aturan berhenti).
5. SUMO dapat dijalankan di backend; model yang **saat ini disediakan hanya jaringan contoh sintetis**, bukan rekonstruksi Fatmawati terkalibrasi.
6. Pengelola membandingkan indikator tundaan, antrean, dan akses pejalan kaki, lalu mengekspor laporan beserta sumber, asumsi, dan batas validitas hasil.

## Komponen pendukung
- **Peta dan data konteks:** pencarian lokasi OSM, metadata halte/persimpangan, cuaca dan rute pejalan kaki (sebagian memerlukan API key). Data ini membantu memahami kondisi sekitar, bukan menghitung kejadian jemput.
- **Business Studio:** memodelkan sumber pendapatan pilot, implementasi dan langganan per lokasi, dengan biaya operasional dan skenario. Semua angka adalah asumsi yang dapat diubah. Contoh 5 lokasi × Rp35 juta setup + 5 × 12 × Rp5 juta/bulan = **Rp475 juta** pendapatan kotor hipotetis pada tahun pertama.
- **Pipeline calon pelanggan:** tahapan menemukan pembeli, wawancara kebutuhan, pilot, sampai kontrak; catatan contoh adalah sintetis.
- **Equipment Planner:** HP-only, HP + cloud, atau opsi Raspberry Pi/kamera berizin. Tidak dibutuhkan hardware khusus untuk survei manual.

## Apa yang sudah dibuat sekarang
Aplikasi HTML mandiri (bisa dibuka langsung), source ES module terpisah, backend FastAPI, integrasi layanan eksternal dengan kondisi key, penyimpanan SQLite lokal, modul simulasi SUMO untuk *synthetic network*, kalkulator bisnis, CRM contoh, dan ekspor CSV/JSON. Halaman **Cara Kerja SIMPUL** memetakan input/proses/output pada setiap tahap ke tujuan proposal.

## Apa yang belum dibuat atau belum terbukti
Belum ada dataset observasi Fatmawati yang digunakan untuk kalibrasi, akurasi deteksi visual terukur, model jalan Fatmawati terverifikasi, hasil perbaikan lalu lintas nyata, transaksi pelanggan, atau sistem produksi multi-pengguna yang aman. Raspberry Pi hanya opsi yang tercantum dalam proposal; pemrosesan kamera otomatis belum diimplementasikan.

## Perbedaan dengan produk monitoring lalu lintas umum
Produk ini difokuskan pada **satu masalah dan satu lokasi pilot**, yaitu penataan aktivitas jemput di akses angkutan massal. Nilainya ada pada hubungan yang dapat ditelusuri antara observasi, pilihan skenario, hasil simulasi, dan penilaian dampak terhadap pejalan kaki. Nilai tersebut masih harus divalidasi melalui studi lapangan dan wawancara pengguna.

## Kalimat presentasi 30 detik
> SIMPUL adalah aplikasi evaluasi penataan penjemputan di sekitar MRT Fatmawati. Petugas mencatat kendaraan berhenti dan durasinya melalui HP. Data dianalisis, lalu alternatif kondisi eksisting, pemanfaatan area jemput, dan aturan berhenti dibandingkan dalam simulasi lalu lintas. Pengelola menerima laporan yang menampilkan antrean, tundaan, akses pejalan kaki, serta sumber dan ketidakpastian hasil. Saat ini alur perangkat lunak sudah dapat didemonstrasikan, sedangkan validasi terhadap kondisi nyata Fatmawati merupakan tahap penelitian berikutnya.
