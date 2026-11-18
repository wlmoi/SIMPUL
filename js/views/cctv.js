/**
 * CCTV AI Live page: interactive 3D simulation of the MRT Fatmawati frontage with
 * a virtual AI camera. Runtime (3D render, traffic simulation, detection overlay,
 * interaction) lives in js/cctv-controller.js. Nothing here is a field measurement.
 */
import {getState} from '../store.js';
import {icon} from '../util.js';
import {tag} from './shared.js';
import {LAYOUT} from '../fatmawati-layout.js';
import {SCENARIOS,TIME_PRESETS} from '../traffic-sim.js';

/** Zones reported by the AI panels. The 2D boxes are only a fallback for real video feeds without zone ids. */
export const CCTV_ZONES = Object.freeze([
  {id:'Zona A', box:[0.04,0.6,0.28,0.3]},
  {id:'Zona B', box:[0.36,0.6,0.28,0.3]},
  {id:'Zona C', box:[0.68,0.6,0.28,0.3]},
  {id:LAYOUT.bayZoneId, box:null}
]);

export const CCTV_CLASSES = Object.freeze({
  car:{label:'Mobil', icon:'car-front'},
  motorcycle:{label:'Motor', icon:'bike'},
  bus:{label:'Bus / Truk', icon:'train-front'}
});

export const CAMERA_PRESETS = Object.freeze([
  {id:'drone', label:'Udara', sub:'Seluruh kawasan', target:[-4,10,4], yaw:-0.72, pitch:0.4, dist:200},
  {id:'front', label:'CAM-V1', sub:'Di bawah stasiun', target:[6,3,6], yaw:-Math.PI/2-0.12, pitch:0.07, dist:46},
  {id:'west', label:'CAM-V2', sub:'Zona A · barat', target:[-112,1,8], yaw:Math.PI-0.75, pitch:0.36, dist:58},
  {id:'east', label:'CAM-V3', sub:'Halte & penyempitan', target:[100,2,6], yaw:Math.PI+0.62, pitch:0.36, dist:80}
]);

const kpi=(key,label,unit='')=>`<div class="sim-kpi" data-sim-kpi="${key}"><strong>–</strong><span>${label}${unit?` <em>${unit}</em>`:''}</span></div>`;

export function renderCctv(){
  const s=getState();
  const threshold=Number(s.fieldSettings?.dwellThresholdSec)||60;
  const counters=Object.entries(CCTV_CLASSES).map(([key,c])=>`<div class="cctv-count" data-count="${key}">${icon(c.icon,18)}<div><strong>0</strong><span>${c.label}</span></div></div>`).join('');
  const zoneRows=CCTV_ZONES.map(z=>`<div class="cctv-zone-row" data-zone-row="${z.id}"><div class="cctv-zone-name"><b>${z.id}</b><small data-zone-dwell>kosong</small></div><div class="cctv-zone-bar"><i style="width:0%"></i></div><strong data-zone-count>0</strong></div>`).join('');
  return `<section class="cctv-page">
  <header class="cctv-head">
    <div>
      <div class="eyebrow">LANGKAH 01 · LIHAT</div>
      <h1>CCTV AI · Simulasi 3D Fatmawati</h1>
      <p>Model 3D kawasan Stasiun MRT Fatmawati. Kendaraan bergerak mengikuti simulasi lalu lintas; AI virtual menghitung kendaraan dan menandai yang berhenti di lajur. Ganti skenario untuk melihat dampaknya.</p>
    </div>
    <div class="cctv-status" data-cctv-status data-state="idle"><span class="cctv-status-dot"></span><div><strong data-cctv-status-label>AI belum terhubung</strong><small data-cctv-status-sub>Simulasi 3D sintetis siap diputar</small></div></div>
  </header>

  <div class="sim-scenarios" role="radiogroup" aria-label="Skenario penataan">
    ${Object.values(SCENARIOS).map((sc,i)=>`<button type="button" class="sim-scenario" role="radio" aria-checked="${i===0}" data-sim="scenario" data-value="${sc.id}"><b>${sc.id}</b><span>${sc.label.split('· ')[1]}</span><small>${sc.short}</small></button>`).join('')}
  </div>

  <div class="cctv-grid">
    <div class="cctv-main" data-viewer="cctv" tabindex="-1">
      <div class="sim-cams" role="group" aria-label="Kamera">
        ${CAMERA_PRESETS.map((c,i)=>`<button type="button" data-sim="cam" data-value="${c.id}" aria-pressed="${i===0}"><b>${c.label}</b><small>${c.sub}</small></button>`).join('')}
      </div>
      <div class="cctv-stage sim-stage" data-cctv-stage data-labels="on" tabindex="0" aria-label="Simulasi 3D interaktif. Seret untuk memutar, gulir untuk zoom, klik kendaraan untuk detail.">
        <canvas class="sim-canvas" data-sim-canvas></canvas>
        <video class="cctv-video" data-cctv-video muted playsinline loop hidden></video>
        <div class="cctv-overlay" data-cctv-overlay aria-hidden="true"></div>
        <div class="cctv-scanline" aria-hidden="true"></div>
        <div class="cctv-hud cctv-hud-tl"><span class="cctv-rec"></span><span data-cctv-camlabel><b>UDARA</b> · Seluruh kawasan</span></div>
        <div class="cctv-hud cctv-hud-tr"><span data-sim-clock>17:00</span> · <span data-cctv-clock>--:--:-- WIB</span></div>
        <div class="cctv-hud cctv-hud-bl" data-cctv-source>SIMULASI 3D · SINTETIS</div>
        <div class="cctv-hud cctv-hud-br" data-cctv-fps>0 frame/dtk</div>
        <i class="cctv-corner c1"></i><i class="cctv-corner c2"></i><i class="cctv-corner c3"></i><i class="cctv-corner c4"></i>
        <div class="sim-legend" aria-hidden="true"><span class="lg-move">Bergerak</span><span class="lg-stop">Berhenti</span><span class="lg-over">&gt; ${threshold} dtk</span></div>
        <div class="sim-inspect" data-sim-inspect hidden></div>
        <div class="sim-hint" data-sim-hint>${icon('sparkles',14)} Seret untuk memutar · gulir untuk zoom · klik kendaraan</div>
      </div>

      <div class="cctv-controls sim-controls" role="toolbar" aria-label="Kontrol simulasi">
        <button type="button" class="cctv-ctl" data-action="viewer-fullscreen" aria-pressed="false">${icon('maximize',16)}<span data-fullscreen-label>Layar penuh</span></button>
        <button type="button" class="cctv-ctl primary" data-sim="play" aria-pressed="false">${icon('play',16)}<span>Putar</span></button>
        <div class="sim-seg" role="group" aria-label="Kecepatan">${[1,2,4].map((x,i)=>`<button type="button" data-sim="speed" data-value="${x}" aria-pressed="${i===0}">${x}×</button>`).join('')}</div>
        <div class="sim-seg" role="group" aria-label="Waktu">${Object.values(TIME_PRESETS).map(t=>`<button type="button" data-sim="time" data-value="${t.id}" aria-pressed="${t.id==='sore'}">${t.label}</button>`).join('')}</div>
        <button type="button" class="cctv-ctl" data-sim="place" aria-pressed="false">${icon('plus',16)}<span>Taruh ojol</span></button>
        <button type="button" class="cctv-ctl" data-cctv="zones" aria-pressed="true">${icon('layers',16)}<span>Zona</span></button>
        <button type="button" class="cctv-ctl" data-cctv="labels" aria-pressed="true">${icon('eye',16)}<span>Label AI</span></button>
        <button type="button" class="cctv-ctl" data-cctv="reset">${icon('refresh-cw',16)}<span>Ulang</span></button>
      </div>
      <div class="sim-sliders">
        <label>Volume kendaraan <output data-sim-out="volume">2100</output> kend/jam<input type="range" min="800" max="3000" step="100" value="2100" data-sim="volume"></label>
        <label>Kendaraan yang menaikkan/menurunkan penumpang <output data-sim-out="pickup">18</output>%<input type="range" min="0" max="40" step="1" value="18" data-sim="pickup"></label>
        <label class="sim-opacity">Opasitas stasiun <output data-sim-out="opacity">100</output>%<small>Turunkan untuk melihat lalu lintas di bawah stasiun</small><input type="range" min="10" max="100" step="5" value="100" data-sim="opacity" aria-label="Opasitas model stasiun"></label>
      </div>
      <p class="cctv-privacy">${icon('shield-check',14)} Model 3D skematis dari foto kawasan, bukan GIS terukur. Angka simulasi ilustratif dan belum dikalibrasi dengan data lapangan. AI hanya menghitung jenis kendaraan dan durasi berhenti, tanpa plat nomor dan wajah.</p>
    </div>

    <aside class="cctv-side">
      <section class="cctv-panel sim-impact">
        <div class="cctv-panel-head"><h2>Dampak di jalan</h2><span data-sim-badge>${tag('A0 · LIVE','slate')}</span></div>
        <div class="sim-kpis">
          ${kpi('speed','Kecepatan rata-rata','km/jam')}
          ${kpi('queue','Antrean saat ini','m')}
          ${kpi('blocked','Berhenti di lajur','kend')}
          ${kpi('conflict','Penumpang turun di tengah jalan','/jam')}
        </div>
        <button type="button" class="btn primary sim-compare-btn" data-sim="compare">${icon('git-compare-arrows',16)} Bandingkan A0 / A1 / A2</button>
        <div class="sim-compare" data-sim-compare hidden></div>
      </section>
      <section class="cctv-panel">
        <div class="cctv-panel-head"><h2>Deteksi AI</h2>${tag('SESI INI','slate')}</div>
        <div class="cctv-counts">${counters}</div>
        <div class="cctv-kpis">
          <div><strong data-kpi="stopped">0</strong><span>Sedang berhenti</span></div>
          <div><strong data-kpi="dwell">0 dtk</strong><span>Rata-rata durasi henti</span></div>
          <div class="warn"><strong data-kpi="over">0</strong><span>Melewati ${threshold} dtk</span></div>
        </div>
      </section>
      <section class="cctv-panel">
        <div class="cctv-panel-head"><h2>Okupansi zona</h2><small>maks. 4 kendaraan</small></div>
        <div class="cctv-zone-list">${zoneRows}</div>
      </section>
      <section class="cctv-panel cctv-feed-panel">
        <div class="cctv-panel-head"><h2>Aktivitas terbaru</h2><small data-feed-count>0 kejadian</small></div>
        <ol class="cctv-feed" data-cctv-feed><li class="cctv-feed-empty">Belum ada kejadian.</li></ol>
      </section>
      <section class="cctv-panel" data-cv-panel>
        <div class="cctv-panel-head"><h2>Ringkasan Jendela AI</h2><span data-cv-window-status>${tag('PERLU MODEL AI','slate')}</span></div>
        <p class="muted" style="font-size:12px;margin:0 0 10px">Catat agregat zona dari deteksi AI aktif untuk bahan <em>Decision Brief</em> (tanpa ID pelacakan, plat nomor, atau wajah).</p>
        <div style="display:grid;gap:8px;margin-bottom:10px">
          <label style="font-size:12px;display:grid;gap:4px">Zona pencatatan<select data-cv-zone>${CCTV_ZONES.map(z=>`<option value="${z.id}">${z.id}</option>`).join('')}</select></label>
          <label style="font-size:12px;display:grid;gap:4px">Periode<select data-cv-period><option value="Jam sibuk">Jam sibuk</option><option value="Luar jam sibuk">Luar jam sibuk</option></select></label>
          <label style="font-size:12px;display:grid;gap:4px">Koordinator<input type="text" data-cv-reviewer placeholder="Nama / inisial koordinator" maxlength="60" autocomplete="off"></label>
        </div>
        <div data-cv-preview style="font-size:12px;margin-bottom:10px;color:#475569">Hubungkan model AI terlebih dahulu untuk mencatat ringkasan jendela.</div>
        <button type="button" class="btn primary" data-action="cv-signoff-window" disabled>${icon('clipboard-check',16)} Catat ringkasan ke cv_reviewed</button>
      </section>
      <div class="cctv-next">
        <button type="button" class="btn primary" data-route="vehicles">Analisis masalah ${icon('arrow-right',16)}</button>
        <button type="button" class="btn" data-route="simulation">Simulasi rinci ${icon('arrow-right',16)}</button>
      </div>
    </aside>
  </div>

  <details class="cctv-dev">
    <summary>${icon('plug-zap',16)} Untuk tim AI: cara menghubungkan model deteksi</summary>
    <p>Muat rekaman video lalu kirim hasil model ke halaman ini. Saat deteksi nyata masuk, simulasi berhenti dan status berubah menjadi “AI terhubung”. Koordinat kotak dinormalisasi 0–1 terhadap ukuran frame. Data yang tampil tidak disimpan sebagai observasi.</p>
    <label class="cctv-ctl sim-video-btn">${icon('upload',16)}<span>Muat video rekaman</span><input type="file" accept="video/*" data-cctv="file" hidden></label>
<pre><code>window.SIMPUL_CCTV.push({
  source: 'ai',
  model: 'YOLOv8n',        // opsional, tampil di status
  detections: [
    { id: 'trk-12', cls: 'car', conf: 0.91,
      box: [0.42, 0.63, 0.08, 0.10],  // x, y, w, h
      zone: 'Zona B', dwellSec: 34 }
  ]
});</code></pre>
    <p>Kelas: <code>car</code>, <code>motorcycle</code>, <code>bus</code> (truk dipetakan ke <code>bus</code>). Zona: <code>Zona A</code>, <code>Zona B</code>, <code>Zona C</code>, <code>${LAYOUT.bayZoneId}</code>. Event <code>simpul:detections</code> pada <code>window</code> juga diterima.</p>
  </details>
</section>`;
}
