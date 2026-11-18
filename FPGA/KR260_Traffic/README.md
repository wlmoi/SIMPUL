# Webcam KR260 dan penghitung kendaraan SIMPUL

Webcam USB → Linux Kria/V4L2 → YOLO11n → ByteTrack → hitung mobil dan motor → metrik area jalan. Inferensi pertama memakai CPU ARM di PS. DPU dan FPGA memerlukan build serta verifikasi terpisah. Preview menampilkan video beranotasi dan angka aktual. Status kemacetan tersedia setelah kalibrasi jalan.

## Menyiapkan Kria

Dari terminal Linux Kria, jalankan probe dan pilih perangkat dengan kemampuan video capture. Gunakan path tetap dari `/dev/v4l/by-id/` bila tersedia.

```sh
sudo apt install v4l-utils python3-venv
sh probe_kria.sh
sh probe_kria.sh /dev/video0
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
curl -fL -o yolo11n.pt https://github.com/ultralytics/assets/releases/download/v8.3.0/yolo11n.pt
cp example.json site.json
python run.py /dev/video0 --config site.json --imgsz 320 --web-preview 8765
```

Sesuaikan node video dengan hasil probe. Instalasi paket memerlukan Python dan wheel ARM64 yang kompatibel dengan image Linux yang terpasang. Catat versi yang berhasil dengan `python -m pip freeze` dan checksum model dengan `sha256sum yolo11n.pt`. Untuk preview pada monitor Kria, gunakan `--preview` dalam sesi desktop aktif.

Dari Windows, buka tunnel ke server preview yang hanya bind ke loopback di Kria.

```powershell
ssh -L 8765:127.0.0.1:8765 ubuntu@IP_KRIA
```

Buka `http://127.0.0.1:8765/` pada PC. Untuk uji video rekaman, ganti argumen sumber dengan path berkas video. Program mengeluarkan JSON Lines agregat dan mempertahankan satu frame terbaru dalam memori selama preview aktif. Preview hanya untuk lingkungan yang memiliki izin melihat video.

## Arti angka dan kalibrasi

- **Mobil/motor di area** adalah deteksi dalam frame terkini yang titik tengah sisi bawah bounding box-nya berada di dalam poligon jalan. Kelas COCO yang digunakan adalah `car` dan `motorcycle`.
- **Mobil/motor melintas** adalah track berbeda yang memotong segmen garis di dalam area. Satu track dihitung sekali selama masih dikenali, dengan arah berdasarkan sisi garis. Tukar urutan endpoint untuk membalik label arah. Occlusion dan pergantian track ID bisa menyebabkan selisih.
- **Kepadatan** memakai `1.000 × kendaraan terlihat / (panjang segmen meter × jumlah lajur)`. Kalibrasikan ROI agar hanya mencakup segmen dan lajur yang dimasukkan dalam rumus. Angka ini adalah kepadatan dua kelas kendaraan yang dipantau.
- **Macet** membutuhkan kepadatan di atas ambang dan fraksi kendaraan lambat di atas ambang secara kontinu. Kecepatan diestimasi dari perpindahan titik kontak pada bidang jalan. Sampel kecepatan harus tersedia untuk setidaknya separuh kendaraan terlihat.

Poligon dan garis memakai koordinat x/y 0–1 dari kiri atas frame. Dengan `calibration: null`, hanya jumlah dan lintasan yang dilaporkan. Untuk mengaktifkan metrik fisik, masukkan empat titik jalan yang terukur. Posisi harus cocok satu per satu dan berurutan mengelilingi segiempat. Koordinat meter berikut hanya ilustrasi skema, bukan nilai untuk lokasi pemantauan.

```json
{
  "image_points": [[0.35, 0.24], [0.65, 0.24], [0.93, 0.93], [0.07, 0.93]],
  "road_points_m": [[0, 50], [7, 50], [7, 0], [0, 0]],
  "segment_m": 50,
  "lanes": 2,
  "slow_kmh": 8,
  "dense_per_km_lane": 30,
  "slow_fraction": 0.6,
  "hold_seconds": 15
}
```

## Dokumentasi untuk pengembangan berikutnya

1. **Runbook perangkat** mencatat image OS, boot media, versi kernel, port USB, VID/PID webcam, link Ethernet, jalur V4L2, mode video aktual, dan perintah reproduksi.
2. **Lembar kalibrasi** menyimpan ID lokasi, arah kamera, panjang segmen, jumlah lajur, ROI dan garis, empat titik acuan, versi konfigurasi, serta tanggal pengukuran. Kalibrasi ulang ketika kamera bergeser.
3. **Kartu model** mencatat checkpoint dan checksum, versi dependensi, kelas, resolusi inferensi, ambang confidence, parameter tracker dan ketentuan lisensi untuk rencana distribusi.
4. **Bukti verifikasi** mencatat ground truth manual per kelas dan arah, galat hitung per interval, uji malam/hujan/occlusion, FPS pemrosesan, latensi persentil ke-95 dan frame drop. Gunakan contoh yang diizinkan untuk disimpan.
5. **Log perubahan** mencatat versi model, konfigurasi dan perangkat, hasil regresi sebelum/sesudah, serta cara kembali ke versi yang terverifikasi. Pisahkan angka simulasi, uji rekaman dan pengamatan lapangan.

- [Panduan webcam KR260 dari AMD](https://github.com/amd/Kria-RoboticsAI/blob/main/README.md)
- [YOLO11 resmi](https://docs.ultralytics.com/models/yolo11/)
- [Tracking Ultralytics](https://docs.ultralytics.com/modes/track/)
