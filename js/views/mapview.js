import {getState} from '../store.js';
import {safe,icon} from '../util.js';
import {pageHead,note,cardHeading,tag} from './shared.js';
import {mapPointsFromDocuments} from '../document-search.js';

export function renderMapview(){
 const state=getState();const g=state.project.geo;
 const station={lat:-6.29247,lon:106.79245};
 const center=(Number.isFinite(Number(g?.lat))&&Number.isFinite(Number(g?.lon)))?{lat:Number(g.lat),lon:Number(g.lon)}:station;
 const points=mapPointsFromDocuments(state.pdfEvidence?.items||[]);
 const zonePins=state.zonePins||{};
 const countByZone={};for(const row of (state.pdfEvidence?.items||[])){countByZone[row.zone]=(countByZone[row.zone]||0)+1}
 const osmUrl=`https://www.openstreetmap.org/?mlat=${center.lat}&mlon=${center.lon}#map=16/${center.lat}/${center.lon}`;
 return `${pageHead('SPATIAL INTELLIGENCE / OSM','Peta Koridor SIMPUL','Lokasi Stasiun MRT Fatmawati, zona survei, dan GPS dari dokumen observasi yang diunggah.',`<button class="btn primary" data-route="documents">${icon('file-text',16)} Cari dari PDF</button>`)}
 ${note('<strong>Provenance geospasial:</strong> pin stasiun mengacu pada data OpenStreetMap, bukan hasil survei tim. Pin GPS dari PDF hanya muncul jika koordinat tertulis secara eksplisit. Zona yang Anda tempatkan manual merupakan titik referensi zona, bukan lokasi tepat kendaraan.')}
 <div class="map-layout"><section class="card map-stage">${cardHeading('Peta interaktif Fatmawati','Leaflet 1.9.4 + OpenStreetMap raster tiles; dimuat hanya saat halaman peta dibuka.',tag('BETA / DATA OSM',''))}
 <div id="simpul-leaflet-map" class="simpul-map" role="region" aria-label="Peta interaktif kawasan studi SIMPUL"><div class="map-loading map-schematic"><div class="map-grid-label">OFFLINE PREVIEW / REFERENSI STASIUN</div><div class="map-schematic-point">${icon('map-pin',24)}<strong>MRT Fatmawati</strong><small>-6.29247, 106.79245</small></div><span>Peta geografis dimuat dari OpenStreetMap saat online. Sketsa grid ini bukan jaringan jalan sesungguhnya.</span></div></div><div class="map-foot"><span>© OpenStreetMap contributors · data peta bukan bukti kondisi lalu lintas aktual</span><a href="${osmUrl}" rel="noopener noreferrer" target="_blank">Lihat pada OSM</a></div></section>
 <section class="card map-side">${cardHeading('Layer dan keterangan','Bedakan titik studi, zona pengamat, dan catatan PDF.')}
 <div class="map-legend"><div><i style="background:#087d72"></i> Stasiun referensi OSM</div><div><i style="background:#176fa6"></i> Zona yang ditandai pengamat</div><div><i style="background:#c87d19"></i> GPS yang tertulis pada PDF</div></div>
 <div class="map-counter"><strong>${points.length}</strong><span>Catatan PDF dengan GPS eksplisit</span></div>
 <div class="map-counter"><strong>${Object.keys(zonePins).length}</strong><span>Zona yang ditempatkan manual</span></div>
 <div class="field"><label for="map-zone-select">Tempatkan titik zona survei</label><select id="map-zone-select" class="control">${['Zona A','Zona B','Zona C'].map(z=>`<option value="${z}">${z}</option>`).join('')}</select></div>
 <p class="helper">Pilih zona lalu klik posisi pada peta. Titik disimpan sebagai lokasi referensi yang ditetapkan pengamat, bukan estimasi GPS kendaraan.</p>
 <button class="btn" data-action="map-reset-zones">${icon('refresh-cw',15)} Hapus titik zona manual</button>
 <div class="map-zones">${['Zona A','Zona B','Zona C'].map(z=>`<div><strong>${z}</strong><span>${zonePins[z]?`${Number(zonePins[z].lat).toFixed(5)}, ${Number(zonePins[z].lon).toFixed(5)}`:'Belum dipetakan'}</span><small>${countByZone[z]||0} catatan PDF terindeks</small></div>`).join('')}</div>
 </section></div><p class="footnote">Peta dasar memakai layanan tile OSM komunitas untuk demonstrasi interaktif, bukan untuk pengunduhan offline atau permintaan massal. Gunakan provider tile berkontrak untuk produksi.</p>`;
}
