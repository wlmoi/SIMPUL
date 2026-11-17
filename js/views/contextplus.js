import {getState} from '../store.js';
import {safe,icon} from '../util.js';
import {pageHead,note,button,cardHeading,tag,emptyState} from './shared.js';

const fmt=(n,d=1)=>Number.isFinite(Number(n)) && n!==null && n!==undefined?Number(n).toLocaleString('id-ID',{maximumFractionDigits:d}):'-';
const hour=(s)=>safe(String(s||'').slice(11,16)||'-');
const stamp=(x)=>x?.checkedAt?`<small class="context-source">Diperbarui ${safe(new Date(x.checkedAt).toLocaleString('id-ID'))} - ${safe(x.data?.provider||'API')}</small>`:'';
const unit=(name,val,units='')=>`<div class="ctx-metric"><span>${safe(name)}</span><strong>${fmt(val)}${units}</strong></div>`;
function routeIllustration(points,{area=false}={}){
 if(!Array.isArray(points)||points.length<2)return '';
 const coords=points.filter(p=>Array.isArray(p)&&p.length>=2&&Number.isFinite(+p[0])&&Number.isFinite(+p[1]));if(coords.length<2)return '';
 const xs=coords.map(p=>Number(p[0])),ys=coords.map(p=>Number(p[1]));let minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
 const dx=Math.max(maxX-minX,.0005),dy=Math.max(maxY-minY,.0005),s=Math.min(490/dx,160/dy);
 const w=dx*s,h=dy*s,offX=(540-w)/2,offY=(210-h)/2;
 const series=coords.map(p=>`${(offX+(p[0]-minX)*s).toFixed(1)},${(offY+(maxY-p[1])*s).toFixed(1)}`).join(' ');
 const start=coords[0],end=coords[coords.length-1];
 const pin=p=>`${(offX+(p[0]-minX)*s).toFixed(1)},${(offY+(maxY-p[1])*s).toFixed(1)}`;
 return `<div class="ctx-route-figure"><svg viewBox="0 0 540 210" role="img" aria-label="Sketsa geometri ${area?'jangkauan':'rute'} berdasarkan respons API"><defs><pattern id="ctxmesh" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M22 0H0V22" stroke="#cadfde" fill="none" stroke-width=".7"/></pattern></defs><rect width="540" height="210" rx="12" fill="#eaf5f4"/><rect width="540" height="210" fill="url(#ctxmesh)"/>${area?`<polygon points="${series}" fill="#139b89" fill-opacity=".20" stroke="#087d72" stroke-width="2"/>`:`<polyline points="${series}" fill="none" stroke="#087d72" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${pin(start).split(',')[0]}" cy="${pin(start).split(',')[1]}" r="6" fill="#1366a7" stroke="white" stroke-width="2"/><circle cx="${pin(end).split(',')[0]}" cy="${pin(end).split(',')[1]}" r="6" fill="#087d72" stroke="white" stroke-width="2"/>`}</svg><small>Visualisasi geometri API dalam koordinat relatif. Bukan foto atau observasi lapangan.</small></div>`;
}
function output(id,entry){if(!entry?.data)return `<p class="ctx-await">Belum dimuat. Klik tombol untuk meminta data dari penyedia layanan.</p>`;
 const d=entry.data;let content='';
 if(id==='reverse')content=`<strong class="ctx-address">${safe(d.address)}</strong><p>Alamat turunan koordinat OSM; belum diverifikasi melalui survei.</p>`;
 if(id==='crossings')content=`${unit('Fitur terpetakan',d.count,' objek')}<p>Menampilkan hingga ${d.items?.length||0} titik bertanda crossing, kerb, atau tactile paving. Tidak mengukur kualitas penyeberangan.</p>`;
 if(id==='airquality')content=`<div class="ctx-metrics">${unit('US AQI',d.aqiUS)}${unit('PM₂.₅',d.pm25UgM3,' µg/m³')}${unit('PM₁₀',d.pm10UgM3,' µg/m³')}</div><p>Estimasi CAMS spasial; bukan pembacaan sensor tepi jalan.</p>`;
 if(id==='forecast')content=`<div class="ctx-hours">${(d.hours||[]).slice(0,8).map(x=>`<div><strong>${hour(x.time)}</strong><span>${fmt(x.rainProbabilityPct,0)}%</span><small>${fmt(x.precipitationMm)} mm</small></div>`).join('')}</div><p>Probabilitas dan jumlah hujan per jam adalah prakiraan model, bukan observasi aktual.</p>`;
 if(id==='history')content=`<div class="ctx-metrics">${unit('Rerata suhu',d.meanTemperatureC,' °C')}${unit('Total hujan',d.dayRainMm,' mm')}</div><p>${safe(d.date)} - Data historis reanalisis ERA5, bukan sensor lokal.</p>`;
 if(id==='elevation')content=`<div class="ctx-metrics">${unit('Elevasi medan',d.elevationM,' m')}${unit('Resolusi DEM',d.resolutionM,' m')}</div><p>Elevasi DEM tidak dapat menentukan kemiringan trotoar atau akses kursi roda.</p>`;
 if(id==='holidays')content=`<p>${d.count||0} entri kalender Indonesia pada ${d.year}. Periksa keputusan resmi pemerintah sebelum digunakan untuk studi.</p><div class="ctx-holidays">${(d.items||[]).slice(0,6).map(x=>`<div><span>${safe(x.date)}</span><strong>${safe(x.name)}</strong></div>`).join('')}</div>`;
 if(id==='route')content=`<div class="ctx-metrics">${unit('Panjang rute',d.distanceM,' m')}${unit('Estimasi waktu',d.durationSec!=null?d.durationSec/60:null,' menit')}</div>${routeIllustration(d.geometry)}<p>${safe(d.warning||'')} - Profil ${safe(d.profile)}</p>`;
 if(id==='isochrone')content=`${unit('Area perjalanan kaki',d.minutes,' menit')}${routeIllustration(d.boundary,{area:true})}<p>${safe(d.warning||'')}</p>`;
 return `<div class="ctx-answer">${content}${stamp(entry)}</div>`;
}
const card=(id,ico,heading,description,action,entry,options='')=>`<article class="card ctx-module"><div class="ctx-card-head"><span class="ctx-card-icon">${icon(ico,21)}</span><div><h3>${heading}</h3><p>${description}</p></div></div>${options}<div class="ctx-card-foot">${button('Ambil dari API',action,'primary')}</div>${output(id,entry)}</article>`;
export function renderContextPlus(){const s=getState(),c=s.contextPlus||{},geo=s.project.geo;
 return `${pageHead('MOBILITY / EXTERNAL INTELLIGENCE','Context Intelligence Lab','Data kontekstual untuk studi operasional, akses pejalan kaki, dan evaluasi sebelum/sesudah.',button(`${icon('plug-zap')} Status API`,'goto-integrations'))}
 <section class="ctx-hero"><div><div class="ctx-hero-kicker">SIMPUL / CONNECTED DATA V0.3</div><h2>Lebih banyak data. Keputusan yang dapat ditelusuri.</h2><p>Semua panggilan API dilakukan ketika diminta pengguna. Hasil peta, cuaca, dan rute merupakan data eksternal, bukan bukti dampak intervensi.</p><div class="ctx-tags"><span>${icon('map-pin',13)} ${safe(geo?.name||'Pilih lokasi di halaman Peta & Konteks')}</span><span>${icon('shield-check',13)} API key disimpan di server</span></div></div><div class="ctx-hero-symbol">${icon('waypoints',58)}</div></section>
 ${!geo?note('<strong>Mulai:</strong> buka Peta & Data Konteks, cari dan pilih lokasi. Semua perhitungan spasial memerlukan koordinat studi.'):
 note(`<strong>Koordinat aktif:</strong> ${Number(geo.lat).toFixed(5)}, ${Number(geo.lon).toFixed(5)} (WGS84). Semua sumber ditampilkan sesuai metode dan keterbatasan masing-masing.`)}
 <div class="ctx-section-title"><div><span>01 / LOKASI & LINGKUNGAN</span><h2>Konteks data lingkungan</h2></div><p>Data tidak otomatis dijadikan parameter simulasi SUMO.</p></div>
 <div class="ctx-modules">
 ${card('reverse','map-pin','Reverse geocoding','Alamat dari koordinat studi','ctx-reverse',c.reverse)}
 ${card('crossings','accessibility','Inventaris penyeberangan','Metadata OSM mengenai crossing, kerb, dan tactile paving','ctx-crossings',c.crossings)}
 ${card('airquality','wind','Kualitas udara model','US AQI, PM2.5, PM10 dari CAMS','ctx-airquality',c.airquality)}
 ${card('forecast','cloud-rain','Prakiraan hujan 12 jam','Distribusi probabilitas dan presipitasi per jam','ctx-forecast',c.forecast)}
 ${card('elevation','mountain','Elevasi kawasan','Model digital elevasi Copernicus GLO-90','ctx-elevation',c.elevation)}
 ${card('history','calendar-clock','Cuaca historis','Konteks kejadian berdasarkan tanggal observasi terdahulu','ctx-history',c.history,`<div class="field ctx-field"><label for="ctx-history-day">Tanggal historis</label><input class="control" id="ctx-history-day" type="date" value="${safe(c.historyDay||'2026-10-20')}" /></div>`)}
 ${card('holidays','calendar-days','Kalender hari libur','Pemeriksaan periode puncak perjalanan dan perilaku perjalanan','ctx-holidays',c.holidays,`<div class="field ctx-field"><label for="ctx-year">Tahun</label><select class="control" id="ctx-year">${[2025,2026,2027,2028].map(y=>`<option ${Number(c.year||2026)===y?'selected':''} value="${y}">${y}</option>`).join('')}</select></div>`)}
 </div>
 <div class="ctx-section-title"><div><span>02 / NETWORK-BASED ACCESSIBILITY</span><h2>Rute pedestrian dan area jangkauan</h2></div><p>openrouteservice membutuhkan API key pada backend.</p></div>
 <div class="ctx-route-layout"><section class="card"><div class="ctx-card-head"><span class="ctx-card-icon">${icon('route',23)}</span><div><h3>Pengukuran rute dari titik studi</h3><p>Bandingkan jaringan berjalan kaki, kursi roda, dan kendaraan; bukan jarak garis lurus.</p></div></div>
 <form id="ctx-route-form" class="ctx-route-form"><div class="form-grid"><div class="field"><label for="ctx-dest-lat">Latitude tujuan</label><input required class="control" id="ctx-dest-lat" inputmode="decimal" type="number" step="any" min="-90" max="90" value="${safe(c.destination?.lat??'')}" placeholder="-6.29"/></div><div class="field"><label for="ctx-dest-lon">Longitude tujuan</label><input required class="control" id="ctx-dest-lon" inputmode="decimal" type="number" step="any" min="-180" max="180" value="${safe(c.destination?.lon??'')}" placeholder="106.8"/></div></div>
 <div class="field"><label for="ctx-route-mode">Profil perjalanan</label><select id="ctx-route-mode" class="control"><option value="foot-walking">Pejalan kaki</option><option value="wheelchair">Kursi roda (estimasi berbasis data peta)</option><option value="driving-car">Mobil</option></select></div><button class="btn primary" type="submit">${icon('route',16)} Hitung rute dengan ORS</button></form>
 ${s.context?.nearby?.items?.length?`<div class="ctx-destinations"><small>Isi otomatis tujuan dari fasilitas OSM di dekat studi:</small>${s.context.nearby.items.filter(p=>Number.isFinite(Number(p.lat))&&Number.isFinite(Number(p.lon))).slice(0,8).map((p,i)=>`<button type="button" class="ctx-destination" data-action="ctx-select-poi" data-lat="${p.lat}" data-lon="${p.lon}">${icon('map-pin',12)} ${safe(p.name)} ${icon('arrow-up-right',11)}</button>`).join('')}</div>`:'<p class="helper">Untuk memilih tujuan dari daftar fasilitas, ambil data OSM terlebih dahulu di halaman Peta & Data Konteks.</p>'}
 ${output('route',c.route)}</section>
 <section class="card"><div class="ctx-card-head"><span class="ctx-card-icon">${icon('radar',23)}</span><div><h3>Isochrone berjalan kaki</h3><p>Area yang diperkirakan dapat dicapai dari titik studi dalam durasi tertentu.</p></div></div><div class="ctx-iso-buttons">${[5,10,15].map(x=>`<button class="btn ${Number(c.isochrone?.data?.minutes)===x?'primary':'outline'}" data-action="ctx-isochrone" data-minutes="${x}">${x} menit</button>`).join('')}</div>${output('isochrone',c.isochrone)}<p class="ctx-warning">Catatan: area jangkauan dari ORS tidak membuktikan penyeberangan aman, akses kursi roda tersedia, atau perjalanan bebas hambatan.</p></section></div>
 <section class="card ctx-provenance"><div><strong>${icon('file-check-2',19)} Aturan penggunaan data</strong><p>Jangan gabungkan data prakiraan, pemodelan, metadata peta, dan observasi manual menjadi satu metrik tanpa penanda sumber. Data-data di atas hanya mendukung konteks dan penyusunan hipotesis. Observasi serta kalibrasi lapangan tetap dibutuhkan.</p></div>${button(`${icon('map')} Buka peta`,'goto-context')}</section>`;
}
