import {renderIntro} from './intro.js';
import {getState} from '../store.js';import {monitorStats} from '../monitoring.js';import {icon,num,compact,safe} from '../util.js';import {forecast} from '../finance.js';import {eventByType,observationStats} from '../analytics.js';import {pageHead,cardHeading,note,statCard,button,tag} from './shared.js';
export function miniMap(){return `<div class="map-frame"><svg viewBox="0 0 620 330" preserveAspectRatio="xMidYMid slice"><defs><pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse"><path d="M 34 0 L 0 0 0 34" fill="none" stroke="#d8e1e9" stroke-width=".8"/></pattern></defs><rect width="620" height="330" fill="url(#grid)"/><path d="M-40 250 C180 225 270 175 640 98" stroke="#cbdbe1" stroke-width="52" fill="none"/><path d="M-40 250 C180 225 270 175 640 98" stroke="#fff" stroke-width="36" fill="none"/><path d="M-40 250 C180 225 270 175 640 98" stroke="#d9e5e9" stroke-width="2" stroke-dasharray="7 7" fill="none"/><path d="M120 -40C175 95 265 245 360 380" stroke="#d3dee4" stroke-width="38" fill="none"/><path d="M120 -40C175 95 265 245 360 380" stroke="#fff" stroke-width="24" fill="none"/><path d="M450 -50C430 55 490 215 530 370" stroke="#d1e0e5" stroke-width="29" fill="none"/><path d="M450 -50C430 55 490 215 530 370" stroke="#fff" stroke-width="18" fill="none"/><path d="M20 40h100M270 275h85M460 35h80" stroke="#b6c4cf" stroke-width="6" opacity=".45"/><path d="M210 225 380 190" stroke="#0c5795" stroke-width="8" stroke-linecap="round" stroke-dasharray="4 12"/><circle cx="285" cy="210" r="22" fill="#0b518b" opacity=".12"/><circle cx="285" cy="210" r="9" fill="#0a5490" stroke="white" stroke-width="4"/><circle cx="400" cy="185" r="8" fill="#2868b5" stroke="white" stroke-width="3"/><circle cx="219" cy="224" r="7" fill="#dfad51" stroke="white" stroke-width="3"/><text x="298" y="185" fill="#2a597f" font-size="14" font-weight="700">FATMAWATI</text><text x="410" y="164" fill="#7a9ca4" font-size="9">ZONA C</text><text x="183" y="258" fill="#7a9ca4" font-size="9">ZONA A</text></svg><div class="map-label"><i class="pin"></i> Peta skematis - bukan GIS terverifikasi</div></div>`}
function heroMap(){return `<div class="corridor-lab" data-scene="A0"><div class="scene-label">EXPLORE / SKEMA 3D ILUSTRATIF</div><div class="corridor-perspective" aria-label="Skema ilustratif jalan, stasiun, dan area jemput"><div class="corridor-ground"><div class="corridor-road"></div><div class="corridor-walk">AKSES PEJALAN KAKI</div><div class="corridor-station">MRT</div><div class="corridor-bay">AREA JEMPUT</div><i class="scene-car car-one"></i><i class="scene-car car-two"></i><i class="scene-car car-three"></i></div></div><div class="scene-switch" role="group" aria-label="Eksplorasi alternatif skematis">${['A0','A1','A2'].map((x,i)=>`<button type="button" data-action="scene-alternative" data-scene="${x}" aria-pressed="${i===0}">${x}</button>`).join('')}</div><p class="scene-description" aria-live="polite">A0: ilustrasi ruang jalan dan aktivitas penjemputan.</p><small>Geometri ilustratif. Dampak alternatif dihitung di Simulasi.</small></div>`}
export function renderOverview(){
 const s=getState(), stats=observationStats(s.observations), manual=s.observations.filter(o=>o.source==='manual').length,
 interval=(s.fieldReadings||[]).filter(o=>o.source==='manual').length,
 reviewed=(s.sessions||[]).filter(x=>x.source==='manual' && x.status==='Selesai').length;
 const evidenceReady=manual>0&&interval>0;
 return `<section class="mc-hero">
  <div class="mc-hero-copy">
   <div class="mc-eyebrow"><span class="mc-live-dot"></span> SI BRIDGES INDONESIA 2026 · MRT FATMAWATI, JAKARTA SELATAN</div>
   <h1>Kendaraan berhenti. Antrean terbentuk. <em>Akses MRT terdampak.</em></h1>
   <p>SIMPUL memakai CCTV dan AI untuk melihat di mana kendaraan penjemput berhenti, lalu mensimulasikan penataan terbaik sebelum diterapkan di jalan.</p>
   <div class="mc-actions">
    <button type="button" class="btn mc-cta" data-route="cctv">${icon('cctv',18)} Lihat CCTV AI</button>
    <button type="button" class="btn mc-ghost" data-route="simulation">${icon('git-compare-arrows',18)} Jalankan simulasi</button>
   </div>
   <div class="mc-trust">${icon('shield-check',15)} Tanpa plat nomor &amp; wajah · Data contoh bersifat sintetis</div>
  </div>
  <div class="mc-preview">
   <div class="mc-preview-top"><span><i class="mc-rec"></i> SIMULASI 3D LANGSUNG · FATMAWATI</span><span>AI virtual</span></div>
   <div class="mc-preview-scene">
    <canvas class="mc-canvas" data-home-canvas aria-label="Simulasi 3D kawasan Stasiun MRT Fatmawati"></canvas>
    <div class="mc-kpis"><span data-home-kpi="speed">Kecepatan <b>–</b></span><span data-home-kpi="queue">Antrean <b>–</b></span><span data-home-kpi="blocked">Berhenti di lajur <b>–</b></span></div>
   </div>
   <div class="mc-preview-foot">
    <div class="mc-switch" role="group" aria-label="Skenario">${['A0','A1','A2'].map(x=>`<button type="button" data-home-scenario="${x}" aria-pressed="${x==='A0'}">${x}</button>`).join('')}</div>
    <small data-home-caption></small>
    <button type="button" class="mc-open" data-route="cctv">Buka penuh ${icon('arrow-up-right',15)}</button>
   </div>
  </div>
 </section>
 <div class="mc-stats">
  <div><strong>${stats.count}</strong><span>Kejadian tercatat</span></div>
  <div><strong>3</strong><span>Zona penjemputan dipantau</span></div>
  <div><strong>A0 · A1 · A2</strong><span>Alternatif penataan diuji</span></div>
  <div><strong>${manual}</strong><span>Observasi lapangan manual</span></div>
 </div>
 <div class="section-h solution-heading"><h2>Cara kerja SIMPUL dalam 4 langkah</h2><small>ALUR UTAMA</small></div>
 <div class="solution-steps">
  ${[
   ['01','Lihat dengan CCTV AI','AI menghitung kendaraan dan mendeteksi yang berhenti terlalu lama di zona jemput.','cctv','cctv','Buka CCTV AI'],
   ['02','Analisis masalah kendaraan','Bedakan aktivitas jemput, turun dan menunggu; periksa durasi serta dampaknya.','car-front','vehicles','Periksa kendaraan'],
   ['03','Uji penataan','Bandingkan A0 eksisting, A1 area jemput, dan A2 aturan berhenti.','git-compare-arrows','simulation','Bandingkan A0/A1/A2'],
   ['04','Putuskan dengan bukti','Tinjau antrean, akses pejalan dan mutu bukti sebelum rekomendasi.','clipboard-check','evaluation','Tinjau keputusan']
  ].map(x=>`<article class="solution-step"><div class="solution-step-top"><span>${x[0]}</span>${icon(x[3],21)}</div><h3>${x[1]}</h3><p>${x[2]}</p><button type="button" data-route="${x[4]}">${x[5]} ${icon('arrow-right',16)}</button></article>`).join('')}
 </div>
 ${renderIntro()}
 <div class="section-h"><h2>Kesiapan bukti pengamatan</h2><small>BERDASARKAN DATA YANG TERSIMPAN</small></div>
 <section class="solution-evidence"><div class="solution-evidence-head"><div><span class="solution-kicker">SOURCE & QUALITY GATE</span><h3>${evidenceReady?'Observasi tersimpan, perlu validasi lanjutan':'Belum siap untuk rekomendasi lapangan'}</h3><p>${evidenceReady?'Ada input manual; evaluasi masih membutuhkan peninjauan dan kalibrasi model.':'Contoh awal adalah data sintetis. Tambahkan hasil survei manual dan pengukuran interval sebelum menarik kesimpulan.'}</p></div><span class="solution-state">${evidenceReady?'PERLU TINJAUAN':'SINTETIS / BELUM TERVALIDASI'}</span></div><div class="solution-evidence-metrics"><div><strong>${manual}</strong><span>Kejadian manual</span></div><div><strong>${interval}</strong><span>Interval manual</span></div><div><strong>${reviewed}</strong><span>Sesi selesai (belum tentu ditinjau)</span></div><div><strong>${stats.synthetic}</strong><span>Contoh sintetis</span></div></div><div class="solution-evidence-actions">${button(`Catat observasi ${icon('arrow-right',16)}`,'goto-observation','primary')}${button('Rencana survei','goto-survey')}${button('Kualitas bukti','goto-standards')}</div></section>
 <div class="solution-two-col"><section class="card solution-map-card">${cardHeading('Satu lokasi: MRT Fatmawati','Peta ilustratif; koordinat hasil survei hanya ditampilkan jika tersedia.',tag('LOKASI STUDI','slate'))}${miniMap()}<div class="solution-link-row"><button type="button" data-route="mapview">${icon('map',16)} Peta interaktif ${icon('arrow-right',15)}</button><button type="button" data-route="documents">${icon('file-text',16)} Cari laporan PDF ${icon('arrow-right',15)}</button></div></section><section class="card solution-options">${cardHeading('Tiga alternatif yang diuji','Intervensi harus dibandingkan terhadap permintaan lalu lintas setara.')}
 <div class="solution-option"><b>A0</b><div><strong>Kondisi eksisting</strong><p>Titik pembanding sebelum intervensi.</p></div></div>
 <div class="solution-option"><b>A1</b><div><strong>Penataan area jemput</strong><p>Optimasi pemanfaatan fasilitas yang tersedia.</p></div></div>
 <div class="solution-option"><b>A2</b><div><strong>Aturan lokasi dan durasi berhenti</strong><p>Uji batas waktu atau perpindahan titik.</p></div></div>
 ${button(`Jalankan perbandingan ${icon('arrow-right',15)}`,'goto-simulation','primary')}<p class="solution-limit">Hasil cepat merupakan estimasi ilustratif; SUMO Fatmawati belum terkalibrasi.</p></section></div>
 <section class="solution-secondary"><div><span class="solution-kicker">FITUR PENDUKUNG</span><h3>Data, monitoring, dan implementasi</h3><p>Gunakan dashboard lanjutan setelah alur diagnosis dan simulasi dipahami. Integrasi API memerlukan konfigurasi server sesuai dokumentasi.</p></div><div class="solution-secondary-links"><button type="button" data-route="monitor">${icon('activity',16)} Monitoring</button><button type="button" data-route="classification">${icon('clipboard-list',16)} Klasifikasi kejadian</button><button type="button" data-route="reports">${icon('files',16)} Laporan</button><button type="button" data-route="business">${icon('chart-no-axes-combined',16)} Model bisnis</button></div></section>
 ${note('<strong>Integritas data:</strong> 8 kejadian awal merupakan contoh sintetis. Status kesiapan bukti bukan persetujuan instansi. Tidak ada pelacakan identitas kendaraan, pengenalan wajah, atau penetapan pelanggaran otomatis.')}
 <section class="solution-credits"><div><span class="solution-kicker">THE PEOPLE BEHIND SIMPUL</span><h3>About the Creators</h3><p>Proyek iSeeDesignITB dikembangkan oleh lima mahasiswa ITB. Kenali tim dan pembagian perannya pada bagian terakhir aplikasi.</p></div><button type="button" data-route="creators" class="btn primary">Kenali tim ${icon('arrow-right',17)}</button></section>`;
}
