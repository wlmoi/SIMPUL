/** Lazily activate the map only while the map page is open.
 * No map-tile prefetching or bulk downloads. A failed remote dependency leaves
 * a usable OSM deep link and the document results table intact.
 */
let loadPromise = null;
let mapInstance = null;
const LEAFLET_JS='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
const LEAFLET_CSS='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
function leaflet(){
  if(typeof window==='undefined')return Promise.reject(new Error('Browser unavailable'));
  if(window.L)return Promise.resolve(window.L);
  if(loadPromise)return loadPromise;
  loadPromise=new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Leaflet network timeout')),6000);
    const done=(fn,value)=>{clearTimeout(timer);fn(value)};
    const link=document.createElement('link');link.rel='stylesheet';link.href=LEAFLET_CSS;document.head.append(link);
    const script=document.createElement('script');script.src=LEAFLET_JS;script.defer=true;
    script.onload=()=>window.L?done(resolve,window.L):done(reject,new Error('Leaflet missing after load'));
    script.onerror=()=>done(reject,new Error('Cannot load Leaflet online'));
    document.head.append(script);
  }).catch(e=>{loadPromise=null;throw e});
  return loadPromise;
}
export async function activateMapView(state,onZonePick){
 const el=document.getElementById('simpul-leaflet-map');if(!el)return;
 try{
   const L=await leaflet();
   if(!el.isConnected)return;
   if(mapInstance){mapInstance.remove();mapInstance=null;}
   el.innerHTML='';
   const g=state.project.geo||{};const lat=Number.isFinite(Number(g.lat))?Number(g.lat):-6.29247;
   const lon=Number.isFinite(Number(g.lon))?Number(g.lon):106.79245;
   mapInstance=L.map(el,{scrollWheelZoom:false}).setView([lat,lon],16);
   L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(mapInstance);
   L.circleMarker([-6.29247,106.79245],{radius:10,color:'#087d72',fillColor:'#087d72',fillOpacity:.92}).addTo(mapInstance).bindPopup('Stasiun MRT Fatmawati: referensi OpenStreetMap, belum diverifikasi melalui survei.');
   if(g.lat!=null&&g.lon!=null)L.circleMarker([lat,lon],{radius:8,color:'#142456',fillColor:'#142456',fillOpacity:.7}).addTo(mapInstance).bindPopup('Titik proyek yang dipilih melalui pencarian lokasi.');
   for(const [name,p] of Object.entries(state.zonePins||{})){
     if(Number.isFinite(Number(p.lat))&&Number.isFinite(Number(p.lon)))L.circleMarker([Number(p.lat),Number(p.lon)],{radius:9,color:'#176fa6',fillOpacity:.8}).addTo(mapInstance).bindPopup(`${name}: titik zona dipilih pengamat, bukan posisi kendaraan.`);
   }
   for(const row of state.pdfEvidence?.items||[]){
     if(row.source!=='uploaded_pdf'||!Number.isFinite(row.lat)||!Number.isFinite(row.lon))continue;
     L.circleMarker([row.lat,row.lon],{radius:6,color:'#c87d19',fillColor:'#c87d19',fillOpacity:.7}).addTo(mapInstance)
       .bindPopup(`Catatan PDF (belum diverifikasi): ${row.vehicle}; ${row.zone}; ${row.at}; halaman ${row.page}`);
   }
   mapInstance.on('click',e=>{
     const z=document.getElementById('map-zone-select')?.value;
     if(z&&onZonePick)onZonePick(z,{lat:e.latlng.lat,lon:e.latlng.lng});
   });
   setTimeout(()=>{if(el.isConnected&&mapInstance)mapInstance.invalidateSize()},100);
 }catch(e){if(el.isConnected)el.querySelector('.map-loading')?.insertAdjacentHTML('beforeend','<small>Basemap belum terhubung. Gunakan tautan OpenStreetMap untuk membuka peta geografis.</small>');}
}
