/** Local Leaflet runtime; OSM tiles are requested only for the visible map. */
import {coordinatePair,mapCenter,zoneReferencePoints,STATION_REFERENCE} from './geospatial.js';
import {mapPointsFromDocuments} from './document-search.js';
let loadPromise=null;
let mapInstance=null;
const LEAFLET_JS='/assets/vendor/leaflet/leaflet.js';
const LEAFLET_CSS='/assets/vendor/leaflet/leaflet.css';
function leaflet(){
 if(typeof window==='undefined')return Promise.reject(new Error('Browser unavailable'));
 if(window.L)return Promise.resolve(window.L);
 if(loadPromise)return loadPromise;
 loadPromise=new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(new Error('Leaflet runtime timeout')),6000);
  const finish=(fn,value)=>{clearTimeout(timer);fn(value)};
  if(!document.getElementById('simpul-leaflet-css')){
   const link=document.createElement('link');link.id='simpul-leaflet-css';link.rel='stylesheet';link.href=LEAFLET_CSS;document.head.append(link);
  }
  const script=document.createElement('script');script.src=LEAFLET_JS;script.defer=true;
  script.onload=()=>window.L?finish(resolve,window.L):finish(reject,new Error('Leaflet unavailable'));
  script.onerror=()=>{script.remove();finish(reject,new Error('Leaflet could not load'))};
  document.head.append(script);
 }).catch(error=>{loadPromise=null;throw error});
 return loadPromise;
}
function popup(text){const el=document.createElement('div');el.textContent=text;return el;}
export async function activateMapView(state,onZonePick){
 const el=document.getElementById('simpul-leaflet-map');if(!el)return;
 const status=document.getElementById('map-network-status');
 const updateStatus=(text,kind='pending')=>{if(status?.isConnected){status.textContent=text;status.dataset.state=kind;}};
 try{
  const L=await leaflet();if(!el.isConnected)return;
  if(mapInstance){mapInstance.remove();mapInstance=null;}
  el.innerHTML='';
  const center=mapCenter(state.project);
  const current=L.map(el,{scrollWheelZoom:false}).setView([center.lat,center.lon],16);mapInstance=current;
  const bounds=[[STATION_REFERENCE.lat,STATION_REFERENCE.lon]];
  let loaded=0,failed=0;
  const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'});
  tiles.on('tileload',()=>{loaded++;updateStatus(failed?'Peta dasar dimuat sebagian':'Peta dasar terhubung',failed?'partial':'ready')});
  tiles.on('tileerror',()=>{failed++;updateStatus(loaded?'Peta dasar dimuat sebagian':'Peta dasar memerlukan koneksi internet','partial')});
  tiles.addTo(current);
  const pin=(point,color,radius,text)=>{
   bounds.push([point.lat,point.lon]);
   return L.circleMarker([point.lat,point.lon],{radius,color,weight:2,fillColor:color,fillOpacity:.8}).addTo(current).bindPopup(popup(text));
  };
  pin(STATION_REFERENCE,'#0961ad',10,'MRT Fatmawati / Referensi OpenStreetMap. Verifikasi lapangan diperlukan.');
  const project=coordinatePair(state.project?.geo?.lat,state.project?.geo?.lon);
  if(project)pin(project,'#1b2b4e',8,'Titik proyek / Koordinat yang dipilih pengguna.');
  for(const point of zoneReferencePoints(state.zonePins))pin(point,'#176fa6',9,`${point.name} / Titik referensi yang ditetapkan pengamat.`);
  for(const point of mapPointsFromDocuments(state.pdfEvidence?.items))pin(point,'#c87d19',6,`Catatan PDF / Status: belum diverifikasi. ${point.vehicle}; ${point.zone}; ${point.at}; halaman ${point.page??'—'}`);
  current.on('click',event=>{
   const zone=document.getElementById('map-zone-select')?.value;
   const point=coordinatePair(event.latlng.lat,event.latlng.lng);
   if(zone&&point&&onZonePick)onZonePick(zone,point);
  });
  document.getElementById('map-home')?.addEventListener('click',()=>current.setView([center.lat,center.lon],16));
  document.getElementById('map-fit')?.addEventListener('click',()=>current.fitBounds(bounds,{padding:[35,35],maxZoom:17}));
  updateStatus('Memuat peta dasar');
  setTimeout(()=>{if(el.isConnected&&mapInstance===current){current.invalidateSize();if(!loaded&&!failed)updateStatus('Menunggu koneksi peta dasar','partial')}},700);
 }catch(error){
  updateStatus('Peta interaktif belum tersedia','partial');
  if(el.isConnected)el.querySelector('.map-loading')?.insertAdjacentHTML('beforeend','<small>Gunakan tautan OpenStreetMap untuk melihat lokasi referensi.</small>');
 }
}
