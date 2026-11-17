/** Local Leaflet runtime; OSM tiles are requested only for the visible map. */
import {coordinatePair,mapCenter,studyZonePoints,STATION_REFERENCE} from './geospatial.js';
import {mapPointsFromDocuments} from './document-search.js';
let loadPromise=null;
let mapInstance=null;
const LEAFLET_JS='/assets/vendor/leaflet/leaflet.js';
const LEAFLET_CSS='/assets/vendor/leaflet/leaflet.css';
export const OFFICIAL_CCTV_URL='https://jakcctv.jakarta.go.id/publik';
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
function popup(text,link=''){
 const el=document.createElement('div'),message=document.createElement('div');
 message.textContent=text;el.append(message);
 if(link){
  const anchor=document.createElement('a');
  anchor.href=link;anchor.target='_blank';anchor.rel='noopener noreferrer';
  anchor.textContent='Buka CCTV publik Jakarta';
  anchor.style.display='inline-block';anchor.style.marginTop='8px';el.append(anchor);
 }
 return el;
}
export async function activateMapView(state,onZonePick){
 const el=document.getElementById('simpul-leaflet-map');if(!el)return;
 const status=document.getElementById('map-network-status');
 const updateStatus=(text,kind='pending')=>{if(status?.isConnected){status.textContent=text;status.dataset.state=kind;}};
 try{
  const L=await leaflet();if(!el.isConnected)return;
  if(mapInstance){mapInstance.remove();mapInstance=null;}
  el.innerHTML='';
  const center=mapCenter(state.project);
  // Zoom with the +/- control, double-click, pinch or the mouse wheel; start close enough to tell the three zones apart.
  const current=L.map(el,{scrollWheelZoom:true,zoomControl:true,minZoom:13,maxZoom:19}).setView([center.lat,center.lon],18);mapInstance=current;
  const bounds=[[STATION_REFERENCE.lat,STATION_REFERENCE.lon]];
  let loaded=0,failed=0;
  const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'});
  tiles.on('tileload',()=>{loaded++;updateStatus(failed?'Peta dasar dimuat sebagian':'Peta dasar terhubung',failed?'partial':'ready')});
  tiles.on('tileerror',()=>{failed++;updateStatus(loaded?'Peta dasar dimuat sebagian':'Peta dasar memerlukan koneksi internet','partial')});
  tiles.addTo(current);
  const pin=(point,color,radius,text,link='')=>{
   bounds.push([point.lat,point.lon]);
   return L.circleMarker([point.lat,point.lon],{radius,color,weight:2,fillColor:color,fillOpacity:point===STATION_REFERENCE?.18:.8}).addTo(current).bindPopup(popup(text,link));
  };
  pin(STATION_REFERENCE,'#0961ad',11,'MRT Fatmawati / Referensi OpenStreetMap. Verifikasi lapangan diperlukan.',OFFICIAL_CCTV_URL);
  const project=coordinatePair(state.project?.geo?.lat,state.project?.geo?.lon);
  if(project)pin(project,'#1b2b4e',8,'Titik proyek / Koordinat yang dipilih pengguna.');
  for(const point of studyZonePoints(state.zonePins)){
   const marker=L.circleMarker([point.lat,point.lon],{radius:6,color:'#ffffff',weight:2,fillColor:'#f86809',fillOpacity:1}).addTo(current)
    .bindPopup(popup(point.custom?`${point.name} / Titik referensi yang ditetapkan pengamat.`:`${point.name} / Lajur kiri Jl. R.A. Kartini di bawah Stasiun MRT Fatmawati. Posisi skematis dari model 3D SIMPUL; perlu verifikasi lapangan.`));
   marker.bindTooltip(point.name.replace('Zona ',''),{permanent:true,direction:'top',offset:[0,-6],className:'zone-tip'});
   bounds.push([point.lat,point.lon]);
  }
  for(const point of mapPointsFromDocuments(state.pdfEvidence?.items))pin(point,'#c87d19',6,`Catatan PDF / Status: belum diverifikasi. ${point.vehicle}; ${point.zone}; ${point.at}; halaman ${point.page??'-'}`);
  current.on('click',event=>{
   const zone=document.getElementById('map-zone-select')?.value;
   const point=coordinatePair(event.latlng.lat,event.latlng.lng);
   if(zone&&point&&onZonePick)onZonePick(zone,point);
  });
  document.getElementById('map-home')?.addEventListener('click',()=>current.setView([center.lat,center.lon],18));
  document.getElementById('map-fit')?.addEventListener('click',()=>current.fitBounds(bounds,{padding:[35,35],maxZoom:18}));
  updateStatus('Memuat peta dasar');
  setTimeout(()=>{if(el.isConnected&&mapInstance===current){current.invalidateSize();if(!loaded&&!failed)updateStatus('Menunggu koneksi peta dasar','partial')}},700);
 }catch(error){
  updateStatus('Peta interaktif belum tersedia','partial');
  if(el.isConnected)el.querySelector('.map-loading')?.insertAdjacentHTML('beforeend','<small>Gunakan tautan OpenStreetMap untuk melihat lokasi referensi.</small>');
 }
}
