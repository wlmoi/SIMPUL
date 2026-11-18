# Status verifikasi

- PASS. Tiga uji Python memeriksa jumlah dalam ROI, pemotongan segmen dua arah, penghitungan sekali per track, ambang kepadatan/kecepatan, dan reset setelah jeda frame.
- PASS. Windows CPU menjalankan YOLO11n resmi dan ByteTrack pada 15 frame sampel COCO128. Dua gambar sumber memakai ID 94 dan 629. Detektor menampilkan 2 mobil dan 1 motor pada frame akhir. Frame bersifat statis sehingga lintasan berjumlah 0. Uji ini memeriksa eksekusi pipeline dan preview, dengan log agregat di smoke-results.jsonl.
- Runtime uji PC memakai Ultralytics 8.4.215, OpenCV 5.1.0.95, PyTorch 2.15.0, lap 0.5.14, dan imgsz 960. FPS smoke test hanya mencakup PC dan termasuk startup.
- Webcam KR260 menunggu akses Linux. Discovery Nmap pada subnet Wi-Fi menemukan dua host tanpa SSH yang merespons. COM23 terdeteksi tetapi tidak menampilkan prompt. Deploy ARM64, sumber V4L2, FPS dan jumlah kendaraan lapangan belum terukur.
- Status kepadatan dan kemacetan membutuhkan kalibrasi segmen di lokasi.
