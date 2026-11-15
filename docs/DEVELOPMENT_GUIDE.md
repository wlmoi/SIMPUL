# Pengembangan modular SIMPUL

## Aturan kerja
1. Baca proposal dan dokumen keterlacakan sebelum mengubah target produk.
2. Inspeksi file lama; hindari menimpa data atau mengubah skema tanpa migrasi.
3. Kembangkan satu modul, tambahkan pengujian, lalu perbarui dokumentasi dan HTML mandiri.
4. Setiap integrasi wajib menyatakan sumber, izin, parameter, kuota, error, dan cara mengaktifkan kredensial.
5. Jangan membuat status API berhasil jika hanya diuji dengan mock. Jangan menyebut jaringan sintetis sebagai model Fatmawati.
6. Jangan mengeksekusi hasil interpretasi AI sebagai perintah operasional lalu lintas.

## Peta kode
- `js/views/*`: presentasi tiap halaman, idealnya tanpa melakukan HTTP langsung.
- `js/app.js`: routing, aksi pengguna, validasi input UI dan orchestrasi endpoint.
- `js/api.js`: pembungkus fetch dan error/timeout.
- `js/data.js` dan `js/store.js`: seed data, status dan persistensi browser.
- `js/analytics.js`: agregasi dan model heuristik *demo*.
- `js/finance.js`: perhitungan bisnis deterministik.
- `server/app.py`: SUMO worker dan aplikasi FastAPI.
- `server/providers.py`: konektor data publik dan Gemini.
- `server/extended_routes.py`, `server/context_plus.py`, `server/routing.py`: API konteks tambahan.
- `server/storage.py`: SQLite observasi manual.

## Pola adapter API berikutnya
Jika menambah provider baru: buat fungsi bertipe, batasi input, timeout, log tanpa rahasia, return struktur termasuk provider dan status data, bedakan error 503/429/422, tulis unit test dengan mock HTTP, dokumentasikan ToS, dan tampilkan di integrasi. Implementasi saat ini belum memiliki kontrak `get_capabilities()` bersama untuk seluruh provider, jadi jangan mendokumentasikannya seolah sudah tersedia.

## Perintah yang sesuai repository
```sh
python tools/build_standalone.py
node tests/test_engines.mjs
python tests/test_api.py
python tests/test_extended_api.py
python tests/smoke_test.py
python tests/test_connected_ui.py
python tests/test_context_plus_ui.py
```

## Rencana pengujian lanjut
(1) kontrak data dan error provider, (2) data pengamatan yang disetujui, (3) kalibrasi geometri dan volume Fatmawati, (4) verifikasi multi-seed SUMO, (5) uji task reporting pengguna, (6) keamanan multi-tenant sebelum deployment produksi.
