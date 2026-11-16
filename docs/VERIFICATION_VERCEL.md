# Verifikasi paket prototype Vercel (2026-11-16)

- npm run verify: PASS. 14 kelompok tes JavaScript lulus; katalog 20 modul,
  94 path lulus; standalone 47 modul berhasil; pemeriksaan sintaks bundle lulus.
- npm run build: PASS. Paket publik dan impor relatif diperiksa oleh builder.
- Python API registry: ERROR saat collection, FastAPI belum terpasang.
- Python standalone dengan --basetemp .pytest_tmp_web: 2 passed, 1 failed.
  Tes lama mengasumsikan separator path '/', Windows menghasilkan '\'.
  Tidak diubah karena di luar perubahan deployment.
- Logo ITB diperiksa visual; banner mitra identik belum tersedia.
- Browser/responsivitas: belum diverifikasi pada sesi ini.
- Deployment Vercel: belum dilakukan; akun/repository belum dihubungkan.

Batas perubahan: build/deployment, judul halaman, logo pada halaman tim,
embedding logo pada standalone dan PWA cache. Kontrak API, data manual/demo,
route, penyimpanan, dan kalkulasi tidak diubah.

Acceptance gate berikutnya: hubungkan repository SIMPUL ke Vercel sesuai
VERCEL.md, periksa semua route hash desktop/mobile, lalu lengkapi banner asli.

## Layout dan animasi (pemeriksaan lanjutan)

Perubahan: js/motion.js mencakup solution hero/steps/evidence, vehicle story/KPI/panel,
dan creator cards. styles.css menempatkan dekorasi halo dalam hero agar tidak
menambah lebar halaman. Standalone, bundle, dan dist dibangun ulang.

npm run verify: PASS (14 kelompok JS, katalog, standalone 47 modul, sintaks).
npm run build: PASS (55 file publik, 156 impor lokal).
Browser QA memakai tools/check_web_layout.py dengan Playwright lokal dan Edge:
25 route desktop 1440x900 lulus, tanpa pageerror atau overflow horizontal;
hero motion dan accordion navigasi terverifikasi. Screenshot beranda desktop
serta mobile diperiksa visual. Lihat web_desktop_overview.png dan
web_mobile_overview.png. Skrip check_motion_browser.py lama tidak portable
(runtime Chromium Linux dan selector navigasi lama); skrip baru menguji dist
Vercel dengan route saat ini. Playwright pengujian berada di .qa-python yang
diabaikan Git dan tidak masuk dist.

Hasil akhir browser QA: PASS mobile 390x844, 25 route tanpa overflow horizontal
atau pageerror; drawer buka/tutup dan animasi hero terverifikasi. PASS reduced
motion: navigasi tetap berfungsi dan tidak ada animasi bergerak yang aktif.
Total 50 pemeriksaan route/viewport lulus dan 1 pemeriksaan reduced motion lulus.
Deployment Vercel belum dilakukan; acceptance berikutnya adalah smoke test URL
hasil deploy. Banner mitra identik masih belum tersedia seperti catatan awal.

## Audit lengkap JavaScript dan animasi (2026-11-16)

File baru: tools/verify_web.mjs, tools/check_web_motion.py.
File diperbarui: tools/build_web.mjs dan package.json (npm run verify:web).

Build menjalankan audit otomatis: 55 file publik, 48 JavaScript (47 modul
frontend dan sw.js), 156 impor relatif; setiap JS diperiksa dengan node --check.
Isi frontend dibandingkan byte demi byte dengan sumber (sw.js dibuat khusus
untuk versi cache deployment). File output tak dikenal ditolak. Semua modul
frontend serta aset visual/styles dimasukkan ke cache offline.
Daftar file, ukuran, dan SHA-256 ada di dist/build-manifest.json.

Hasil perintah yang diamati:
- npm run verify: PASS, 14 kelompok JS, katalog, standalone, sintaks bundle.
- npm run build: PASS, audit payload otomatis lulus.
- npm run verify:web: PASS, 48 sintaks JS, 156 impor, 53 entri offline.
- Uji negatif motion.js dipindahkan sementara: PASS, audit menolak file hilang;
  file dikembalikan dan build final lulus.
- tools/check_web_motion.py dengan Edge/Playwright lokal: PASS 10 pemeriksaan
  native browser motion (page/cards, drawer open/close, accordion open/close,
  modal open/close, toast, active navigation, cancellation).
- CSS simpul-halo: PASS aktif pada pseudo-element hero.
- Offline: PASS 53 resource cache, reload dan navigasi kendaraan tanpa internet.
- Tidak ada perubahan localStorage akibat pemeriksaan fungsi animasi.

Animasi default menggunakan Web Animations API dan CSS yang tersedia lokal.
GSAP adalah opsi dan tidak diperlukan; tidak ada runtime GSAP yang diunduh.
Gerakan sengaja dikurangi ketika prefers-reduced-motion aktif.
Hasil berlaku pada paket lokal yang diuji, belum pada URL Vercel produksi.
Tes Python backend tetap memiliki kendala dependensi/path yang dicatat di atas.
Acceptance gate: deploy repository SIMPUL lalu smoke test URL Vercel.

## Intro dan inspirasi GARDA

Implementasi dijelaskan di docs/INTRO.md. Intro tersedia di beranda dan ikut
standalone serta dist. Perubahan mencakup js/views/intro.js, js/views/overview.js,
js/app.js, styles.css dan katalog modul. Tidak ada perubahan data/API/kalkulasi.

Verifikasi final:
- npm run verify: PASS, 14 kelompok tes JavaScript, katalog 20 modul/95 path,
  standalone 48 modul dan pemeriksaan sintaks bundle.
- npm run build: PASS, 56 file publik, 49 file JS, 158 impor, 54 entri cache.
- tools/check_intro_browser.py: 3 kelompok PASS (desktop, mobile, reduced motion).
  Empat tahap, next/prev, autoplay, pause, replay, skip/focus, navigasi tujuan,
  cleanup saat keluar route, data tetap utuh dan tanpa overflow terverifikasi.
- Screenshot intro desktop dan mobile diperiksa visual; dua simbol encoding
  yang salah pada iterasi awal telah diperbaiki dan screenshot dibuat ulang.

Konfigurasi tambahan runtime tidak diperlukan. Deployment dan smoke test URL
Vercel tetap acceptance gate berikutnya. Kendala tes backend sebelumnya tidak
berubah. Banner mitra identik masih belum ditemukan.
