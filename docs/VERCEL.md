# Prototype web SIMPUL di Vercel

Seluruh sumber web berada di repository D:\SIMPUL: index.html, styles.css,
js/, assets/, manifest.webmanifest, sw.js, tools/build_web.mjs dan vercel.json.
Tidak ada dependensi ke folder GARDA, GDS, FPGA, atau gambar GARDA.

## Build dan deploy

Jalankan `npm run build`. Hasil publik ada di dist/.
Hubungkan repository SIMPUL ke Vercel, Root Directory adalah root repository,
Framework Preset Other, Build Command `npm run build`, Output Directory `dist`.
vercel.json menyimpan konfigurasi build tersebut. Tidak perlu secret untuk demo.
Navigasi aplikasi memakai hash; buka /#overview atau /#creators.
Jangan mengatur rewrite seluruh URL ke index.html karena /api harus tetap gagal
secara jujur ketika backend belum disediakan.

## Batas prototype

Vercel ini menyajikan frontend statis. Observasi lokal, navigasi dan kalkulasi
browser tetap menggunakan implementasi SIMPUL yang ada. FastAPI, SQLite,
SUMO, OCR, AI dan integrasi provider tidak dijalankan oleh build ini.
Permintaan /api akan gagal sampai backend same-origin tersedia.
Jangan menyimpan API key dalam frontend atau mengklaim integrasi live aktif.
Data manual dan demo serta hasil simulasi sintetis tetap dibedakan.

## Aset

Gunakan hanya banner mitra dan logo ITB yang diberikan pengguna sebagai gambar
identitas baru. Logo ITB telah disimpan di assets/itb-seal.png dan dipasang di halaman tim. Banner identik belum ditemukan,
sehingga banner belum dipasang. Sumber logo tercatat di assets/SOURCES.md.
assets/favicon.svg yang sudah ada dipertahankan sebagai ikon aplikasi.

## Verifikasi

Lihat docs/VERIFICATION_VERCEL.md untuk hasil aktual. Deployment Vercel dan
pengujian tampilan browser adalah acceptance gate setelah build lokal.


## Pemeriksaan kelengkapan file

`npm run build` otomatis menjalankan audit JS, impor, hash sumber/output dan
cache offline. Jalankan `npm run verify:web` untuk audit ulang dist tanpa build.
Inventaris hasil ada di `dist/build-manifest.json`. Animasi default memakai
Web Animations API + CSS lokal; GSAP tidak diperlukan. Pemeriksaan browser
animasi/offline tersedia di tools/check_web_motion.py (Playwright dan Edge).
