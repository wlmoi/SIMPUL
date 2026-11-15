import {getState} from '../store.js';
import {safe,icon} from '../util.js';
import {pageHead,note,button,cardHeading,emptyState} from './shared.js';

const statusTag=(ok)=>ok?'<span class="intel-chip green">Terpasang dan diizinkan</span>':'<span class="intel-chip amber">Perlu konfigurasi backend</span>';
export function renderPublicIntel(){
 const s=getState(),data=s.osintLookup,geo=s.project.geo;
 const lat=geo && Number.isFinite(+geo.lat)?Number(geo.lat).toFixed(5):'';
 const lon=geo && Number.isFinite(+geo.lon)?Number(geo.lon).toFixed(5):'';
 const items=Array.isArray(data?.items)?data.items:[];
 return `${pageHead('EXTERNAL CONTEXT / READ-ONLY','Konteks Publik & OpenOSINT',
 'Pencarian berita publik yang menyebut lokasi di sekitar area studi. Untuk konteks perencanaan, bukan penetapan pelanggaran.',
 `${button(`${icon('refresh-cw',15)} Periksa adapter`,'osint-status')} ${button(`${icon('map-pin',15)} Pilih titik studi`,'goto-context')}`)}
 <section class="intel-hero"><div><div class="intel-kicker">OPENOSINT · GDELT GKG · PASSIVE ONLY</div><h2>Public signals, clearly separated from field evidence.</h2><p>Membantu petugas memahami pemberitaan area transit sambil mempertahankan perbedaan antara sumber publik, observasi primer, dan keputusan pemeriksa.</p><div class="intel-pills"><span>Source linked</span><span>Geo-referenced mentions</span><span>No identity lookup</span></div></div><div class="intel-hero-stat"><small>BERITA BERREFERENSI</small><strong>${items.length}</strong><span>Lokasi dalam berita ≠ lokasi kejadian</span></div></section>
 ${note('<strong>Batas bukti:</strong> lokasi yang disebut berita tidak sama dengan lokasi insiden yang terbukti. Tidak ada penyelidikan individu, pembacaan plat, pembuktian pelanggaran, atau pengiriman otomatis ke kepolisian.','warning')}
 <div class="intel-cols"><section class="card intel-form">${cardHeading('Kueri berita publik','Pilih titik melalui Peta & Data Konteks atau masukkan koordinat yang relevan.')}
 <div class="intel-grid"><label class="field">Topik publik<select class="control" id="osint-topic"><option value="fatmawati">Fatmawati</option><option value="transit">MRT / transit</option><option value="mobility">Traffic / mobility</option><option value="all">Semua (sangat luas)</option></select></label>
 <label class="field">Radius konteks<select class="control" id="osint-radius"><option value="1">1 km</option><option value="3" selected>3 km</option><option value="5">5 km</option><option value="10">10 km</option></select></label>
 <label class="field">Latitude<input class="control" id="osint-lat" type="number" min="-90" max="90" step="any" placeholder="Pilih lokasi pada peta" value="${safe(lat)}" /></label>
 <label class="field">Longitude<input class="control" id="osint-lon" type="number" min="-180" max="180" step="any" placeholder="Pilih lokasi pada peta" value="${safe(lon)}" /></label>
 <label class="field">Rentang berita<select class="control" id="osint-minutes"><option value="60">60 menit</option><option value="180">3 jam</option><option value="360">6 jam</option></select></label></div>
 <div class="intel-buttons">${button(`${icon('search',16)} Ambil konteks publik`,'osint-search','primary')} ${button(`${icon('trash-2',15)} Hapus hasil lokal`,'osint-clear')}</div>
 <p class="intel-hint">Pengambilan terjadi di server melalui OpenOSINT (opsional); data tidak dikirim ke mesin SUMO atau algoritma klasifikasi pelanggaran. Karena GDELT memakai feed terbaru, hasil bisa kosong walaupun ada berita lama.</p></section>
 <section class="card intel-side">${cardHeading('Status integrasi','OpenOSINT dapat dipasang terpisah dari layanan SIMPUL.')}
 <div class="intel-check">${statusTag(data?.status?.available)}<p>${safe(data?.status?.notice||'Klik “Periksa adapter” untuk mengecek ketersediaan backend.')}</p></div>
 <div class="intel-steps"><div><b>1</b><span>Observasi dan klasifikasi tetap mengandalkan data lapangan.</span></div><div><b>2</b><span>OpenOSINT mengambil pemberitaan publik berkoordinat.</span></div><div><b>3</b><span>Petugas dapat membuka sumber asli untuk verifikasi manual.</span></div><div><b>4</b><span>Keputusan dan status hukum tetap ditentukan oleh pihak berwenang.</span></div></div>
 <p class="intel-hint">Instalasi opsional: <code>pip install -r server/requirements-openosint.txt</code> dan set <code>SIMPUL_PUBLIC_OSINT_ENABLED=1</code> pada backend lokal.</p></section></div>
 <section class="card intel-results">${cardHeading('Hasil konteks publik',data?.queriedAt?`Diambil ${safe(new Date(data.queriedAt).toLocaleString('id-ID'))} · ${safe(data.provider)} · ${safe(data.topic)}`:'Belum ada permintaan berita yang berhasil.')}
 ${items.length?`<div class="intel-list">${items.map(i=>`<article class="intel-item"><div class="intel-item-head"><span class="intel-chip">SUMBER SEKUNDER</span><small>${safe(i.place)} · ${i.mentionCount} referensi</small></div><h3>${safe(i.title||'(Judul tidak tersedia)')}</h3><p>${safe(i.domain)} · Tautan publik, belum diverifikasi sebagai kejadian lalu lintas.</p><a target="_blank" rel="noopener noreferrer" href="${safe(i.url)}">Periksa sumber asli ${icon('external-link',13)}</a></article>`).join('')}</div>`:emptyState('Belum ada hasil konteks',data?.queriedAt?'Tidak ada berita berlokasi dalam jendela waktu dan radius ini. Ini bukan bukti tidak ada kejadian.':'Pilih topik, lokasi, lalu jalankan pencarian berizin. Tidak ada hasil palsu atau sumber sintetis.')}
 ${data?.coverage?`<p class="intel-hint">Cakupan waktu tersedia: ${safe(String(data.coverage.minutes??'tidak diketahui'))} menit dari ${safe(String(data.coverage.requested??'tidak diketahui'))} menit diminta.</p>`:''}
 </section>
 <div class="intel-foot"><strong>Data governance</strong><p>OpenOSINT digunakan hanya untuk <code>search_gdelt_geo</code>. Identitas, nomor telepon, surel, kebocoran akun, serta alat pemindaian keamanan tidak tersedia pada antarmuka SIMPUL. Seluruh tautan ditampilkan sebagai informasi publik yang perlu diverifikasi. Provenance: OpenOSINT → GDELT GKG → judul, domain, URL, dan lokasi yang disebut.</p></div>`;
}
