"""Loopback-only preview for an SSH tunnel. Frames are held in memory."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from threading import Lock, Thread
import time

PAGE = """<!doctype html>
<html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>SIMPUL | YOLO11</title>
<style>
body{font:16px system-ui;background:#101722;color:#edf3fa;margin:0}
main{max-width:960px;margin:auto;padding:24px}h1{font-size:1.5rem}
section{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin:16px 0}
section div{background:#1e2a3a;border-radius:8px;padding:12px}
strong{display:block;margin-top:4px;font-size:1.25rem}
img{width:100%;display:block;border-radius:8px;background:#202a39}
p{color:#c7d4e3} [hidden]{display:none}
</style>
<main><h1>SIMPUL · Penghitung Kendaraan</h1><p id="status">Menunggu frame</p>
<section><div>Mobil di area<strong id="car">—</strong></div>
<div>Motor di area<strong id="motorcycle">—</strong></div>
<div>Mobil melintas<strong id="carFlow">—</strong></div>
<div>Motor melintas<strong id="motorFlow">—</strong></div>
<div>Kepadatan / km / lajur<strong id="density">—</strong></div>
<div>Kemacetan<strong id="congestion">—</strong></div></section>
<img id="view" alt="Preview jalan dengan area pengamatan dan garis hitung" hidden></main>
<script>
const $ = id => document.getElementById(id);
const labels = {uncalibrated:"Belum dikalibrasi", insufficient_speed_samples:"Sampel kurang",
                below_threshold:"Di bawah ambang", pending:"Mengamati", congested:"Macet"};
let last = 0;
async function update(){
  try {
    const r = await fetch("/metrics", {cache:"no-store"});
    if(!r.ok) throw Error();
    const d = await r.json();
    $("status").textContent = (d.source === "kria_v4l2" ? "Webcam Kria" : "Video rekaman")
      + " · " + d.processed_fps + " FPS · Frame " + d.frame;
    for(const k of ["car","motorcycle"]) $(k).textContent = d.visible[k];
    $("carFlow").textContent = d.crossings.a_to_b.car + d.crossings.b_to_a.car;
    $("motorFlow").textContent = d.crossings.a_to_b.motorcycle + d.crossings.b_to_a.motorcycle;
    $("density").textContent = d.density_vehicles_per_km_lane ?? "—";
    $("congestion").textContent = labels[d.congestion] ?? d.congestion;
    if(d.frame !== last){
      $("view").src = "/frame.jpg?v=" + d.frame;
      $("view").hidden = false;
      last = d.frame;
    }
  } catch {
    $("status").textContent = "Frame belum tersedia atau koneksi terputus";
    $("view").hidden = true;
    for(const id of ["car","motorcycle","carFlow","motorFlow","density","congestion"]) $(id).textContent = "—";
    last = 0;
  }
  setTimeout(update, 400);
}
update();
</script></html>""".encode()


class Preview:
    def __init__(self, port):
        self.lock = Lock()
        self.latest = None
        current = self

        class Handler(BaseHTTPRequestHandler):
            def do_GET(self):
                path = self.path.partition("?")[0]
                with current.lock:
                    payload = current.latest
                if path == "/":
                    kind, data = "text/html; charset=utf-8", PAGE
                elif path in ("/metrics", "/frame.jpg"):
                    if not payload or time.monotonic() - payload[0] > 5:
                        self.send_error(503, "Waiting for current frames")
                        return
                    _, frame, report = payload
                    kind, data = ("application/json", report) if path == "/metrics" else ("image/jpeg", frame)
                else:
                    self.send_error(404)
                    return
                self.send_response(200)
                self.send_header("Content-Type", kind)
                self.send_header("Content-Length", str(len(data)))
                self.send_header("Cache-Control", "no-store")
                self.end_headers()
                self.wfile.write(data)

            def log_message(self, *_args):
                pass

        self.server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
        self.thread = Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def push(self, frame, report):
        with self.lock:
            self.latest = (time.monotonic(), frame, json.dumps(report).encode())

    def close(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()
