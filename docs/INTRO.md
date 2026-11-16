# Intro SIMPUL

Intro berada di beranda, sesudah judul halaman. Empat tahap menjelaskan
Observasi, Analisis, Simulasi dan Evaluasi. Putar intro memulai tur sekitar
24 detik. Pengunjung dapat memilih tahap, mundur/maju, jeda, ulangi, lewati,
atau membuka halaman terkait. Tidak ada layar tunggu yang menghalangi aplikasi.

Inspirasi berasal dari source lokal GARDA site/GDSII/index.html: reveal,
narasi bertahap, kontrol tur dan penjelasan status bukti. Konten, warna dan
ilustrasi koridor disesuaikan dengan SIMPUL. Tidak ada aset GARDA, gambar baru
dari internet, atau dependensi animasi CDN yang ditambahkan.

File: js/views/intro.js (markup/tahap), js/app.js (kontrol/timer),
js/views/overview.js (penempatan), styles.css (reveal, ilustrasi, responsif).
config/module-catalog.json diperbarui. Build standalone dan dist ikut diperbarui.

Intro bersifat presentasi: tidak mengubah data observasi, kalkulasi, API atau
provenance. Timer dihentikan ketika keluar halaman atau tab disembunyikan.
Gerakan kendaraan/scan mengikuti play/pause; reduced motion mematikan animasi.
Tombol lewati memindahkan fokus dan scroll tanpa mengubah route.

Uji browser: tools/check_intro_browser.py (Playwright + Edge).
Preview tersimpan di docs/intro_desktop.png dan docs/intro_mobile.png.
