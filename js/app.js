import {getIntroStages} from './views/intro.js';
import { fieldReadingModal } from './views/diagnosis.js';
import { reviewSessionModal } from './views/survey.js';
import { operationCreateModal, operationUpdateModal } from './views/operations.js';
import { surveyCoverage, normalizeProtocol, sessionQuality, exportSurveyCoverage } from './pilot.js';
import { operationalBoard,validateCaseDraft,validateCaseUpdate,exportOperations } from './operations.js';
import { decisionModal } from './views/evaluation.js';
import { eventModal } from './views/observation.js';
import { makeReport } from './views/reports.js';
import { trafficReviewModal } from './views/classification.js';
import { pageRenderers } from './page-registry.js';
import {activateMapView} from './map-controller.js';
import {activateCctv,deactivateCctv,getAiWindowSummary,resetAiWindow} from './cctv-controller.js';
import {activateHomeSim,deactivateHomeSim,controlHomeDemo} from './home-sim.js';
import {toggleViewerFullscreen} from './viewer-controls.js';
import {setSettingsTab} from './views/settings.js';
import {filterDocumentRecords} from './document-search.js';
import { renderNavigation, filterNavigation, sectionForRoute, sectionTitleForRoute, MORE_GROUP } from './navigation.js';
import { enterPage, openMobileDrawer, closeMobileDrawer, toggleAccordion, showModal, hideModal, showToast, accentActiveNav } from './motion.js';
import { observationCsv, policeCsv, fieldReadingCsv, forecastCsv, equipmentCsv, monitoringCsv } from './services/export-data.js';
import {views,initialData} from './data.js';
import {apiRequest,setSessionApiToken,getSessionApiToken} from './api.js';
import {getState,updateState,resetState,subscribe,exportState,importState} from './store.js';
import {icon,safe,uid,nowIso,download} from './util.js';
import {classifyTrafficEvent,classifyTrafficDataset,makePoliceReviewBundle,REVIEW_STATUS} from './classification.js';
import {assessQuality,buildStandardsBundle,buildProjectGeoJSON,buildExecutiveBriefHTML} from './standards.js';
import {heuristicSimulation} from './analytics.js';
import {buildBriefEnvelope,buildDeterministicBrief,normalizeDecisionBrief} from './decision-brief.js';
import {filterEvents} from './monitoring.js';
import {comparePeriods,evidenceGate} from './diagnostics.js';
import {getLanguage,setLanguage,labelForRoute,t} from './i18n.js';
import {installCustomSelects} from './custom-select.js';
import {installDomI18n,refreshDomI18n} from './i18n-dom.js';
// The renderer registry is maintained separately from action orchestration.
const components = pageRenderers;
const names=Object.fromEntries(views.map(v=>[v.id,v.label]));
let mobileOpen=false,toastTimer=null,serverStatus=null,monitorTimer=null,monitorBusy=false,lastMonitorSync=0,expandedNavGroup=null,lastRenderedRoute=null;
// Pages removed from the website: manual field observation (AI now automates input) and the business model (moved to the pitch deck).
const REMOVED_ROUTES={observation:'cctv',business:'overview',pipeline:'overview',equipment:'overview'};
const currentPage=()=>{let p=decodeURIComponent(location.hash.replace('#',''))||'overview';p=REMOVED_ROUTES[p]||p;return components[p]?p:'overview';};
function sidebar(){
  const active=currentPage();
  const open=expandedNavGroup===null?sectionForRoute(active):expandedNavGroup;
  return `<aside class="sidebar ${mobileOpen?'open':''}" id="sidebar" aria-label="${t('shell.openNav')}"><div class="brand"><div class="brand-icon">S</div><div><div class="wordmark">SIMPUL</div><small>MOBILITY INTELLIGENCE</small></div></div><nav class="nav-area" aria-label="${t('shell.openNav')}">${renderNavigation(active,open)}</nav><div class="sidebar-foot"><div class="mini">${t('shell.workspace')}</div><strong>${safe(getState().project.name)}</strong><div class="presence"><span class="dot"></span> ${t('shell.local')}</div><button type="button" data-route="settings">${icon('settings-2',13)} &nbsp; ${t('shell.settings')}</button></div></aside>`;
}
function layout(){const route=currentPage(),names=Object.fromEntries(views.map(v=>[v.id,labelForRoute(v.id,v.label)])),dateStr=new Intl.DateTimeFormat(getLanguage()==='en'?'en-US':'id-ID',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Jakarta'}).format(new Date()),lang=getLanguage();return `<div class="shell">${sidebar()}<div class="mobile-curtain ${mobileOpen?'show':''}" data-action="close-mobile"></div><div class="workspace"><header class="topbar"><div class="crumb"><button class="hamburger" data-action="toggle-mobile" aria-label="${t('shell.openNav')}">${icon('menu',22)}</button><span class="crumb-section">${sectionTitleForRoute(route)}</span>${icon('chevron-right',13)}<strong>${names[route]}</strong></div><div class="top-actions"><div class="header-date">${dateStr} - WIB</div><div class="header-divider"></div><div class="language-switch" role="group" aria-label="Language"><span>${icon('languages',15)}</span><button type="button" data-action="switch-language" data-language="en" aria-pressed="${lang==='en'}">EN</button><button type="button" data-action="switch-language" data-language="id" aria-pressed="${lang==='id'}">ID</button></div><span class="partner-brand"><img src="/assets/aiera-foundation.png" alt="AIERA Foundation" width="48" height="51"><span>AIERA<small>FOUNDATION</small></span></span><div class="avatar" title="iSeeDesignITB">ITB</div></div></header><main class="main" id="main-content">${components[route]()}<footer class="app-footer"><span>© 2026 SIMPUL / iSeeDesignITB / SI Bridges Indonesia 2026</span><span><a href="#creators">${t('shell.about')}</a> / <a href="https://www.linkedin.com/in/wlmoi/" target="_blank" rel="noopener noreferrer">${t('shell.linkedin')}</a></span></footer></main></div></div><nav class="mobile-bottom-nav" aria-label="${t('shell.quickNav')}">${[['overview','layout-dashboard',labelForRoute('overview','Overview')],['cctv','cctv','CCTV AI'],['vehicles','car-front',labelForRoute('vehicles','Vehicle Problem')],['simulation','git-compare-arrows',labelForRoute('simulation','Simulation')],['evaluation','clipboard-check',labelForRoute('evaluation','Evaluation')]].map(v=>`<button type="button" data-route="${v[0]}" class="${route===v[0]?'active':''}" aria-label="${v[2]}">${icon(v[1],19)}<span>${v[2]}</span></button>`).join('')}</nav><div class="toasts" id="toasts" aria-live="polite"></div>`;}
let introIndex=0,introPlaying=false,introTimer=null;
function syncIntro(){
 clearTimeout(introTimer);introTimer=null;
 const panel=document.querySelector('.simpul-intro');
 if(!panel){introPlaying=false;return;}
 const stages=getIntroStages(),stage=stages[introIndex];
 panel.dataset.introStage=String(introIndex);
 panel.classList.toggle('intro-playing',introPlaying);
 panel.querySelector('#intro-count').textContent=`0${introIndex+1} / 04 / ${stage.label.toUpperCase()}`;
 panel.querySelector('#intro-title').textContent=stage.title;
 panel.querySelector('#intro-description').textContent=stage.text;
 const destination=panel.querySelector('#intro-destination');
 destination.textContent=stage.cta+' ↗';destination.dataset.route=stage.route;
 panel.querySelectorAll('[data-action="intro-stage"]').forEach((button,index)=>button.setAttribute('aria-pressed',String(index===introIndex)));
 const play=panel.querySelector('[data-action="intro-play"]');
 play.textContent=introPlaying?(getLanguage()==='en'?'Pause':'Jeda'):(getLanguage()==='en'?'Play tour':'Putar tour');play.setAttribute('aria-pressed',String(introPlaying));
 // Only user-requested playback advances the explanation. No data is changed.
 if(introPlaying)introTimer=setTimeout(()=>{if(introIndex===stages.length-1)introPlaying=false;else introIndex++;syncIntro();},6000);
}
document.addEventListener('visibilitychange',()=>{if(document.hidden){introPlaying=false;syncIntro();}});
function render(){
  const route=currentPage();
  const changed=route!==lastRenderedRoute;
  const first=lastRenderedRoute===null;
  if(lastRenderedRoute==='cctv')deactivateCctv();
  if(lastRenderedRoute==='overview')deactivateHomeSim();
  document.getElementById('app').innerHTML=layout();
  lastRenderedRoute=route;
  syncIntro();
  // Motion is a progressive enhancement; page data and events work without it.
  if(changed){
    const main=document.getElementById('main-content');
    requestAnimationFrame(()=>{
      if(main?.isConnected && currentPage()===route){
        enterPage(main,{initial:first});
        accentActiveNav(document.getElementById('sidebar'));
      }
    });
  }
  if(route==='overview')activateHomeSim(document.querySelector('.mc-hero'));
  if(route==='cctv')activateCctv(document.querySelector('.cctv-page'),{threshold:Number(getState().fieldSettings?.dwellThresholdSec)||60});
  if(route==='mapview')requestAnimationFrame(()=>activateMapView(getState(),(zone,coords)=>{
    updateState(s=>({...s,zonePins:{...(s.zonePins||{}),[zone]:coords}}));
    toast(`Titik referensi ${zone} disimpan sebagai pilihan pengamat`);
  }));
  if(mobileOpen && window.matchMedia('(max-width: 1020px)').matches){
    requestAnimationFrame(()=>openMobileDrawer(document.getElementById('sidebar'),document.querySelector('.mobile-curtain')));
  }
}
function go(p){mobileOpen=false;expandedNavGroup=sectionForRoute(p)||expandedNavGroup;if(currentPage()===p){render();window.scrollTo(0,0)}else location.hash=p;}
function toast(msg){
  let el=document.getElementById('toasts');if(!el)return;
  el.innerHTML=`<div class="toast">${icon('check',17)}<span>${safe(msg)}</span></div>`;
  showToast(el.firstElementChild);
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>{if(el)el.innerHTML=''},4800);
}
function modal(inner){const e=document.createElement('div');e.className='overlay';e.id='app-modal';e.innerHTML=`<div class="modal" role="dialog" aria-modal="true">${inner}</div>`;document.body.append(e);showModal(e);e.addEventListener('click',ev=>{if(ev.target===e)closeModal({animate:true})});setTimeout(()=>{if(e.isConnected&&!e.contains(document.activeElement))e.querySelector('input:not([type=hidden]),select')?.focus();},20)}
function closeModal({animate=false}={}){const overlay=document.getElementById('app-modal');if(overlay){if(animate)hideModal(overlay,()=>overlay.remove());else overlay.remove()}}
// Pure CSV builders live in js/services/export-data.js; the app only handles downloads.
function downloadObservations(){download('SIMPUL_observasi.csv',observationCsv(getState()),'text/csv;charset=utf-8');toast('CSV observasi berhasil disiapkan')}
function downloadPoliceCsv(){download('SIMPUL_traffic_review_manual_only.csv',policeCsv(getState()),'text/csv;charset=utf-8');toast('CSV klasifikasi tanpa data sintetis disiapkan')}
function downloadFieldReadings(){download('SIMPUL_interval_lapangan.csv',fieldReadingCsv(getState()),'text/csv;charset=utf-8');toast('CSV interval lapangan disiapkan')}
async function syncFieldReadings(){
 const items=getState().fieldReadings.filter(r=>r.source==='manual');
 if(!items.length)return toast('Belum ada interval pengamatan manual untuk dikirim.');
 if(!confirm(`Kirim ${items.length} interval pengamatan manual ke backend lokal?`))return;
 try{const data=await apiRequest('/api/field-readings/sync',{method:'POST',body:{items},timeout:15000});recordLocalActivity('field.sync',`${data.inserted} interval baru tersinkronisasi`);toast(`${data.inserted} interval baru tersimpan; ${data.alreadyPresent} sudah ada.`);}catch(err){toast('Sinkronisasi gagal: '+err.message);}
}
function downloadForecast(){download('SIMPUL_proyeksi_finansial.csv',forecastCsv(getState()),'text/csv;charset=utf-8');toast('Proyeksi finansial disiapkan')}
function downloadEquipment(){download('SIMPUL_bom.csv',equipmentCsv(getState()),'text/csv;charset=utf-8');toast('Daftar perangkat disiapkan')}
function resetScenario(){updateState(s=>({...s,scenario:initialData().scenario,lastAnalysis:null}));toast('Parameter skenario dikembalikan')}
function resetFinance(){updateState(s=>({...s,finance:initialData().finance}));toast('Asumsi finansial dikembalikan')}
function startSession(){const state=getState();if(state.activeSession)return toast('Sesi sudah berjalan');const item={id:uid('ses'),startedAt:nowIso(),zone:document.getElementById('current-zone')?.value||'Zona A',period:document.getElementById('current-period')?.value||'Jam sibuk',source:'manual',status:'Berjalan'};updateState(s=>({...s,activeSession:item,sessions:[...s.sessions,item]}));recordLocalActivity('session.start','Sesi observasi dimulai di '+item.zone);toast('Sesi manual dimulai')}
function endSession(){if(!getState().activeSession)return toast('Tidak ada sesi aktif');updateState(s=>({...s,activeSession:null,sessions:s.sessions.map(x=>x.id===s.activeSession.id?{...x,endedAt:nowIso(),status:'Selesai'}:x)}));recordLocalActivity('session.end','Sesi observasi diakhiri');toast('Sesi diakhiri dan disimpan')}
function recordLocalActivity(kind,message,level='info'){
 updateState(s=>({...s,activityLog:[...(s.activityLog||[]),{id:uid('log'),at:nowIso(),kind,message,level}].slice(-500)}));
}
function monitorCsv(){download('SIMPUL_monitoring_log.csv',monitoringCsv(getState()),'text/csv;charset=utf-8');toast('Log monitoring diekspor dalam CSV')}
async function refreshMonitor({silent=false}={}){
 if(monitorBusy)return;monitorBusy=true;
 try{const [health,summary,logs,stream]=await Promise.all([
  apiRequest('/api/monitor/health',{timeout:5000}),apiRequest('/api/monitor/summary',{timeout:5000}),apiRequest('/api/monitor/logs?limit=60',{timeout:5000}),apiRequest('/api/monitor/stream/status',{timeout:5000})]);
  updateState(s=>({...s,monitorRemote:{connected:true,health,summary,logs:logs.items,stream,checkedAt:nowIso()}}));
  if(!silent)toast('Monitoring backend diperbarui');
 }catch(e){updateState(s=>({...s,monitorRemote:{connected:false,message:e.message,checkedAt:nowIso()}}));if(!silent)toast('Backend belum tersedia; monitoring lokal tetap aktif');}
 finally{monitorBusy=false;}
}
async function syncMonitorAutomatically(){
 const items=getState().observations.filter(x=>x.source==='manual').map(x=>({id:x.id,at:x.at,type:x.type,vehicle:x.vehicle,duration:x.duration,zone:x.zone,source:'manual',note:x.note||'',sessionId:x.sessionId||null,zoneContext:x.zoneContext||'unknown',laneBlocked:x.laneBlocked||'unknown',pedestrianBlocked:x.pedestrianBlocked||'unknown',queueObserved:x.queueObserved||'unknown',signageVerified:x.signageVerified===true,evidenceReference:x.evidenceReference||''}));
 if(!items.length)return;
 try{
  const result=await apiRequest('/api/observations/sync',{method:'POST',body:{items},timeout:10000});
  if(result.inserted||result.telemetry?.written)recordLocalActivity('monitor.autosync',`${result.inserted} event manual baru, ${result.telemetry?.written??0} dikirim ke InfluxDB`);
 }catch(e){console.warn('SIMPUL autosync: backend unavailable (data retained locally)');}
}
async function flushTelemetry(probe=false){
 try{const result=await apiRequest(probe?'/api/monitor/stream/status?probe=true':'/api/monitor/stream/flush',{method:probe?'GET':'POST',timeout:6500});
  if(probe){toast(result.configured?(result.reachable?'InfluxDB dapat diakses dari backend':'InfluxDB dikonfigurasi tetapi belum terjangkau'):'InfluxDB belum dikonfigurasi. Jalankan Docker Compose monitoring.');}
  else {toast(result.status==='delivered'?`${result.written} pengamatan terkirim ke InfluxDB`:`Status antrean: ${result.status}; ${result.pending??0} pending`);}
  refreshMonitor({silent:true});
 }catch(e){toast('Tidak dapat memeriksa InfluxDB: '+e.message);}
}
function manageMonitorPolling(){
 if(monitorTimer){clearInterval(monitorTimer);monitorTimer=null;}
 if(currentPage()==='monitor'){refreshMonitor({silent:true});monitorTimer=setInterval(()=>{if(currentPage()==='monitor'&&!document.hidden){refreshMonitor({silent:true});if(getState().monitorAutoSync&&Date.now()-lastMonitorSync>=30000){lastMonitorSync=Date.now();syncMonitorAutomatically();}}},15000);}
}
async function runSumo(){const button=document.querySelector('[data-action="run-sumo"]');if(button){button.disabled=true;button.textContent='Memeriksa backendâ€¦'}
 try{
  const data=await apiRequest('/api/status',{timeout:3000});
  if(!data.engineAvailable)throw new Error('Engine SUMO/netconvert belum terpasang. Lihat README.');
  const p=getState().scenario;
  const job=await apiRequest('/api/simulation',{method:'POST',body:{...p,seeds:2},timeout:10000});
  recordLocalActivity('simulation.submit','Pekerjaan SUMO diminta ke backend');
  toast('SUMO dijalankan di server, menunggu hasil');
  for(let i=0;i<90;i++){
    await new Promise(r=>setTimeout(r,1500));
    const j=await apiRequest(`/api/simulation/${encodeURIComponent(job.jobId)}`,{timeout:10000});
    if(j.status==='failed')throw new Error(j.error||'SUMO gagal');
    if(j.status==='complete'){
      updateState(s=>({...s,lastAnalysis:j.result,history:[...s.history,{id:uid('run'),engine:'sumo',createdAt:nowIso()}]}));
      recordLocalActivity('simulation.complete','Simulasi SUMO jaringan sintetis selesai');
      toast('SUMO selesai: hasil jaringan uji sintetis dimuat');return;
    }
  }
  throw new Error('Pekerjaan belum selesai; lihat log server.');
 }catch(e){toast(e.message||'Gagal menjalankan SUMO');console.error(e)}finally{render()}}

async function searchLocation(query){
  try{const data=await apiRequest('/api/geo/search?q='+encodeURIComponent(query));
    updateState(s=>({...s,context:{...s.context,query,results:data.results}}));
    toast(`${data.results.length} lokasi dari OpenStreetMap ditampilkan`);
  }catch(e){toast(e.message)}
}
async function connectedAction(action,el){
  try{
    if(action==='check-apis'){
      const [status,services]=await Promise.all([apiRequest('/api/status'),apiRequest('/api/integrations')]);
      updateState(s=>({...s,integrationStatus:{backend:true,status,services,checkedAt:nowIso()}}));
      toast('Backend terhubung. Periksa status masing-masing provider.');return;
    }
    if(action==='select-geo'){
      const index=Number(el.dataset.index),p=getState().context.results[index];
      if(!p||!Number.isFinite(p.lat)||!Number.isFinite(p.lon))throw new Error('Lokasi tidak valid.');
      updateState(s=>({...s,project:{...s.project,geo:{...p}},context:{...s.context,weather:null,nearby:null,traffic:null,mapVisible:false},contextPlus:{historyDay:s.contextPlus?.historyDay||'2026-10-20',year:s.contextPlus?.year||2026,destination:null}}));
      toast('Lokasi studi diperbarui berdasarkan hasil OSM');return;
    }
    if(action==='load-map'){if(!getState().project.geo)throw new Error('Pilih lokasi terlebih dahulu.');updateState(s=>({...s,context:{...s.context,mapVisible:true}}));return;}
    if(action==='fetch-weather'||action==='fetch-nearby'||action==='fetch-traffic'){
      const p=getState().project.geo;if(!p)throw new Error('Pilih lokasi dari pencarian OpenStreetMap terlebih dahulu.');
      const part=`lat=${p.lat}&lon=${p.lon}`;
      const key=action==='fetch-weather'?'weather':action==='fetch-nearby'?'nearby':'traffic';
      const url=key==='weather'?'/api/context/weather?'+part:key==='nearby'?'/api/geo/nearby?'+part:'/api/traffic/live?'+part;
      toast(key==='weather'?'Mengambil data cuacaâ€¦':key==='nearby'?'Mencari fasilitas sekitarâ€¦':'Mengambil snapshot lalu lintasâ€¦');
      const result=await apiRequest(url,{timeout:30000});
      updateState(s=>({...s,context:{...s.context,[key]:{...result,checkedAt:result?.checkedAt||nowIso()}}}));
      toast(key==='weather'?'Cuaca Open-Meteo berhasil dimuat':key==='nearby'?'Fasilitas dari Overpass berhasil dimuat':'Data TomTom berhasil dimuat');return;
    }
    if(action==='sync-observations'){
      const items=getState().observations.filter(x=>x.source==='manual').map(x=>({id:x.id,at:x.at,type:x.type,vehicle:x.vehicle,duration:x.duration,zone:x.zone,source:'manual',note:x.note||'',sessionId:x.sessionId||null,zoneContext:x.zoneContext||'unknown',laneBlocked:x.laneBlocked||'unknown',pedestrianBlocked:x.pedestrianBlocked||'unknown',queueObserved:x.queueObserved||'unknown',signageVerified:x.signageVerified===true,evidenceReference:x.evidenceReference||''}));
      if(!items.length)throw new Error('Belum ada rekaman manual. Buat sesi dan masukkan kejadian dahulu.');
      if(!confirm(`Kirim ${items.length} rekaman manual ke SQLite pada server lokal? Data sintetis tidak akan dikirim.`))return;
      const result=await apiRequest('/api/observations/sync',{method:'POST',body:{items},timeout:15000});
      toast(`${result.inserted} rekaman baru tersinkronisasi; ${result.alreadyPresent} sudah ada.`);return;
    }
    if(action==='pull-observations'){
      const result=await apiRequest('/api/observations');
      const known=new Set(getState().observations.map(x=>x.id));const newer=result.items.filter(x=>!known.has(x.id)&&x.source==='manual');
      updateState(s=>({...s,observations:[...s.observations,...newer]}));
      toast(`${newer.length} rekaman baru ditarik dari SQLite`);return;
    }
    if(action==='ai-insights'){
      const events=getState().observations.filter(x=>x.source==='manual');
      if(!events.length)throw new Error('Analisis AI memerlukan minimal satu observasi manual. Data sintetis tidak dikirim.');
      const byType={},byZone={};let sum=0;
      for(const e of events){byType[e.type]=(byType[e.type]||0)+1;byZone[e.zone]=(byZone[e.zone]||0)+1;sum+=Number(e.duration)||0;}
      const result=await apiRequest('/api/ai/insights',{method:'POST',body:{count:events.length,meanDwellSec:sum/events.length,byType,byZone},timeout:45000});
      updateState(s=>({...s,aiInsights:{...result,createdAt:nowIso(),sourceEvents:events.length}}));
      toast('Analisis Gemini diterima; tetap membutuhkan peninjauan manusia');return;
    }
  }catch(e){toast(e.message||'API gagal diproses');console.error('SIMPUL API',e)}
}
const ZONE_SLUGS={'Zona A':'zona-a','Zona B':'zona-b','Zona C':'zona-c','Area A1':'area-a1'};
const compactUtc=iso=>String(iso||nowIso()).replace(/[^a-zA-Z0-9]/g,'').slice(0,18);
async function signoffCvWindow(){
  const zone=document.querySelector('[data-cv-zone]')?.value||'Zona A';
  const period=document.querySelector('[data-cv-period]')?.value||'Jam sibuk';
  const reviewerLabel=(document.querySelector('[data-cv-reviewer]')?.value||'').trim();
  if(reviewerLabel.length<2)return toast('Isi nama atau inisial koordinator (minimal 2 karakter).');
  const summary=getAiWindowSummary(zone);
  if(!summary||summary.totalVehicles<=0)return toast('Belum ada kendaraan terhenti dalam jendela AI aktif untuk zona ini.');
  const windowId=`cv-${ZONE_SLUGS[zone]||'zone'}-${period==='Jam sibuk'?'peak':'off'}-${compactUtc(summary.windowStart)}-${compactUtc(summary.windowEnd)}`.slice(0,80);
  const payload={windowId,signedOffAt:nowIso(),windowStart:summary.windowStart,windowEnd:summary.windowEnd,reviewerLabel,zone,period,mode:'ai',vehicleCountsByClass:summary.vehicleCountsByClass,meanDwellSec:summary.meanDwellSec,overThresholdCount:summary.overThresholdCount};
  updateState(s=>({...s,cvReviewedSummaries:[...(s.cvReviewedSummaries||[]).filter(x=>x.windowId!==windowId),{...payload,totalVehicles:summary.totalVehicles,synced:false}].slice(-200)}));
  resetAiWindow(zone);
  recordLocalActivity('cv.signoff',`Jendela AI ${zone} (${period}) ditandai untuk tinjauan brief`);
  if(typeof location!=='undefined'&&location.protocol==='file:')return toast('Ringkasan jendela AI tersimpan di browser (mode offline)');
  try{
    const res=await apiRequest('/api/v1/cv-reviewed',{method:'POST',body:payload,timeout:15000});
    if(res&&(res.status==='inserted'||res.status==='already_present'||res.windowId)){
      updateState(s=>({...s,cvReviewedSummaries:(s.cvReviewedSummaries||[]).map(x=>x.windowId===windowId?{...x,synced:true}:x)}));
      return toast('Ringkasan jendela AI tersimpan dan tersinkron ke server');
    }
  }catch(_){
    toast('Ringkasan tersimpan lokal; sinkronisasi server akan disertakan pada brief berikutnya');
  }
}
async function runDecisionBrief(){
  const snap=getState();
  const deterministic=buildDeterministicBrief(snap);
  updateState(s=>({...s,decisionBrief:deterministic}));
  if(typeof location!=='undefined'&&location.protocol==='file:')return toast('Decision Brief deterministik diperbarui (mode offline file://)');
  try{
    toast('Menyusun Decision Brief…');
    const apiRes=await apiRequest('/api/v1/ai/decision-brief',{method:'POST',body:buildBriefEnvelope(snap),timeout:45000});
    const normalized=normalizeDecisionBrief(apiRes,getState());
    updateState(s=>({...s,decisionBrief:normalized}));
    toast(normalized.llmStatus==='ok'?'Decision Brief + sintesis Gemini siap ditinjau':'Decision Brief deterministik siap (Gemini tidak aktif / fallback)');
  }catch(e){
    updateState(s=>({...s,decisionBrief:{...deterministic,llmStatus:'error',executionTrace:{...deterministic.executionTrace,providerStatuses:{...(deterministic.executionTrace?.providerStatuses||{}),gemini:'error'}}}}));
    toast(`Decision Brief menggunakan fallback deterministik (${e.message||'server error'})`);
  }
}
function loadBriefScenario(el){
  const target=el.dataset.scenario;
  if(!['A0','A1','A2'].includes(target))return;
  const s=getState();
  const activeBrief=s.decisionBrief||buildDeterministicBrief(s);
  const item=(activeBrief.brief?.scenarioHypotheses||[]).find(h=>h.scenario===target);
  if(!item||!item.params)return toast(`Hipotesis ${target} tidak tersedia pada brief saat ini.`);
  updateState(st=>{
    const nextScenario={...st.scenario,...item.params};
    return {...st,scenario:nextScenario,comparisonScenario:target,lastAnalysis:heuristicSimulation(nextScenario)};
  });
  recordLocalActivity('brief.scenario',`Parameter hipotesis ${target} dimuat ke estimator heuristik`);
  toast(`Parameter hipotesis ${target} dimuat ke estimator heuristik (belum terkalibrasi)`);
}
async function contextPlusAction(action,el){
  try{
    if(action==='ctx-select-poi'){
      const lat=Number(el.dataset.lat),lon=Number(el.dataset.lon);
      if(!Number.isFinite(lat)||!Number.isFinite(lon))throw new Error('Koordinat fasilitas tidak tersedia.');
      updateState(s=>({...s,contextPlus:{...s.contextPlus,destination:{lat,lon}}}));
      toast('Tujuan diisi dari fasilitas OSM');return;
    }
    const p=getState().project.geo;
    if(!p)throw new Error('Pilih lokasi studi pada halaman Peta & Data Konteks terlebih dahulu.');
    const query=new URLSearchParams({lat:String(p.lat),lon:String(p.lon)});
    const services={
      'ctx-reverse':['reverse','/api/geo/reverse'],
      'ctx-crossings':['crossings','/api/geo/crossings'],
      'ctx-airquality':['airquality','/api/context/air-quality'],
      'ctx-forecast':['forecast','/api/context/forecast'],
      'ctx-elevation':['elevation','/api/context/elevation'],
      'ctx-history':['history','/api/context/history'],
      'ctx-holidays':['holidays','/api/context/holidays'],
      'ctx-isochrone':['isochrone','/api/accessibility/isochrone']
    };
    const conf=services[action];if(!conf)throw new Error('Tindakan tidak dikenal.');
    if(action==='ctx-history'){
      const day=document.getElementById('ctx-history-day')?.value;
      if(!day)throw new Error('Tanggal historis belum dipilih.');query.set('day',day);
      updateState(s=>({...s,contextPlus:{...s.contextPlus,historyDay:day}}));
    }
    if(action==='ctx-holidays'){
      query.delete('lat');query.delete('lon');const year=document.getElementById('ctx-year')?.value||'2026';query.set('year',year);
      updateState(s=>({...s,contextPlus:{...s.contextPlus,year:Number(year)}}));
    }
    if(action==='ctx-isochrone')query.set('minutes',String(el.dataset.minutes||10));
    const result=await apiRequest(conf[1]+'?'+query.toString(),{timeout:35000});
    updateState(s=>({...s,contextPlus:{...s.contextPlus,[conf[0]]:{data:result,checkedAt:nowIso()}}}));
    toast('Data '+(result.provider||'API')+' berhasil dimuat.');
  }catch(err){toast(err.message||'Gagal meminta data dari API');console.error('SIMPUL Context+ API',err)}
}
async function requestRoute(){
  try{
    const p=getState().project.geo;if(!p)throw new Error('Pilih lokasi studi terlebih dahulu.');
    const lat=Number(document.getElementById('ctx-dest-lat')?.value),lon=Number(document.getElementById('ctx-dest-lon')?.value);
    if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)throw new Error('Koordinat tujuan tidak valid.');
    const mode=document.getElementById('ctx-route-mode')?.value||'foot-walking';
    const qs=new URLSearchParams({lat:String(p.lat),lon:String(p.lon),destLat:String(lat),destLon:String(lon),mode});
    const result=await apiRequest('/api/accessibility/route?'+qs.toString(),{timeout:35000});
    updateState(s=>({...s,contextPlus:{...s.contextPlus,destination:{lat,lon},route:{data:result,checkedAt:nowIso()}}}));
    toast('Rute '+mode+' berhasil dihitung berdasarkan data peta.');
  }catch(err){toast(err.message||'Gagal menghitung rute');console.error('SIMPUL route',err)}
}
async function osintAction(action){
 try{
  if(action==='osint-clear'){
   updateState(s=>({...s,osintLookup:null}));toast('Hasil berita publik lokal dihapus');return;
  }
  if(action==='osint-status'){
   const status=await apiRequest('/api/v1/public-intelligence/status',{timeout:10000});
   updateState(s=>({...s,osintLookup:{...(s.osintLookup||{}),status}}));
   toast(status.available?'Adapter OpenOSINT siap':'Adapter belum siap; lihat status di halaman');return;
  }
  const lat=Number(document.getElementById('osint-lat')?.value),lon=Number(document.getElementById('osint-lon')?.value);
  const topic=document.getElementById('osint-topic')?.value||'fatmawati';
  const radius_km=Number(document.getElementById('osint-radius')?.value||3);
  const minutes=Number(document.getElementById('osint-minutes')?.value||60);
  if(!document.getElementById('osint-lat')?.value || !document.getElementById('osint-lon')?.value || !Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180) throw new Error('Titik studi belum tersedia. Pilih pada peta atau isi koordinat.');
  const data=await apiRequest('/api/v1/public-intelligence/news',{method:'POST',body:{lat,lon,topic,radius_km,minutes},timeout:32000});
  updateState(s=>({...s,osintLookup:{...data,status:{available:true,notice:data.notice}}}));
  recordLocalActivity('public-intelligence.lookup',`Konteks publik ${topic}: ${data.items.length} lokasi berita, bukan bukti pelanggaran`);
  toast(`${data.items.length} konteks berita ditemukan, perlu verifikasi sumber`);
 }catch(err){toast(err.message||'OpenOSINT belum tersedia');console.warn('SIMPUL OpenOSINT',err)}
}

async function importPdfDocument(){
 const input=document.getElementById('doc-pdf-file');const file=input?.files?.[0];
 if(!file)return toast('Pilih satu dokumen PDF.');
 if(file.size>10*1024*1024)return toast('Ukuran PDF maksimum 10 MB.');
 if(location.protocol==='file:')return toast('Impor PDF memerlukan backend; jalankan python server/app.py.');
 const form=new FormData();form.append('file',file,file.name);
 try{
   const headers={};const token=getSessionApiToken();if(token)headers.Authorization='Bearer '+token;
   const result=await fetch('/api/v1/documents/import',{method:'POST',headers,body:form});
   const payload=await result.json();if(!result.ok)throw new Error(payload.detail||'Impor gagal.');
   const data=await apiRequest('/api/v1/documents/records',{timeout:15000});
   updateState(s=>({...s,pdfEvidence:{...s.pdfEvidence,lastImport:payload,items:data.items}}));
   recordLocalActivity('documents.import',`Impor PDF ${payload.recordsFound} kandidat tanpa data identitas`);
   toast(`${payload.recordsFound} kandidat terindeks dari PDF; perlu pemeriksaan manusia.`);
 }catch(error){toast('Impor PDF gagal: '+error.message)}
}
async function refreshPdfRecords(){
 try{const data=await apiRequest('/api/v1/documents/records');updateState(s=>({...s,pdfEvidence:{...s.pdfEvidence,items:data.items}}));return data;}
 catch(error){toast('Indeks PDF belum tersedia: '+error.message);return null;}
}

function selectOverviewNode(el){
 const node=el.dataset.node,panel=document.getElementById('overview-node-inspector');
 if(!panel)return;
 const labels={station:['map.station','map.stationDetail'],zoneA:['map.zoneA','map.zoneDetail'],zoneB:['map.zoneB','map.zoneDetail'],zoneC:['map.zoneC','map.zoneDetail'],pickup:['map.pickup','map.pickupDetail']};
 const selected=labels[node]||labels.station;
 panel.innerHTML=`<div><span class="overview-node-kicker">${safe(t(selected[0]))}</span><strong>${safe(t(selected[1]))}</strong></div>${node==='station'?`<a href="https://jakcctv.jakarta.go.id/publik" target="_blank" rel="noopener noreferrer">${icon('video',14)} ${safe(t('map.cctv'))}</a>`:''}<button type="button" class="overview-node-map-link" data-route="mapview">${icon('map',14)} ${safe(t('map.openMap'))}</button>`;
 document.querySelectorAll('.overview-map-node').forEach(button=>button.setAttribute('aria-pressed',String(button===el)));
}

function handleAction(action,el){switch(action){
case 'switch-language':setLanguage(el.dataset.language);introIndex=0;render();refreshDomI18n();break;
case 'select-overview-node':selectOverviewNode(el);break;
case 'scene-alternative':{const scene=el.closest('.corridor-lab'),key=el.dataset.scene;if(!['A0','A1','A2'].includes(key))break;scene.dataset.scene=key;scene.querySelectorAll('.scene-switch button').forEach(b=>b.setAttribute('aria-pressed',String(b===el)));scene.querySelector('.scene-description').textContent=({A0:'A0: ilustrasi ruang jalan dan aktivitas penjemputan.',A1:'A1: ilustrasi pemusatan aktivitas di area jemput.',A2:'A2: ilustrasi pengaturan titik dan durasi berhenti.'})[key];break;}
case 'preview-classifier':{const val=id=>document.getElementById('lab-'+id).value,duration=Number(val('duration')),out=document.getElementById('classifier-result');if(!Number.isFinite(duration)||duration<0||duration>86400){out.textContent='Isi durasi antara 0 dan 86400 detik.';break;}const result=classifyTrafficEvent({source:'demo',type:val('activity'),duration,pedestrianBlocked:val('pedestrian'),laneBlocked:val('lane'),queueObserved:val('queue')});out.textContent=result.priorityLabel+' - '+result.priorityReason+' Sumber: percobaan sintetis.';break;}

case 'intro-skip':{introPlaying=false;syncIntro();const target=document.getElementById('intro-end');target?.focus({preventScroll:true});target?.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});break;}
case 'intro-stage':introPlaying=false;introIndex=Math.max(0,Math.min(3,Number(el.dataset.index)||0));syncIntro();break;
case 'intro-next':{const stages=getIntroStages();introPlaying=false;introIndex=(introIndex+1)%stages.length;syncIntro();break;}
case 'intro-prev':{const stages=getIntroStages();introPlaying=false;introIndex=(introIndex+stages.length-1)%stages.length;syncIntro();break;}
case 'intro-play':introPlaying=!introPlaying;syncIntro();break;
case 'home-demo-play':case 'home-demo-replay':case 'home-demo-step':case 'home-demo-next':case 'home-demo-prev':case 'home-demo-close':case 'home-demo-camera-reset':case 'home-demo-zoom-in':case 'home-demo-zoom-out':controlHomeDemo(action.replace('home-demo-',''),el.dataset.index);break;
case 'viewer-fullscreen':{if(el.closest('.mc-hero'))controlHomeDemo('expand');toggleViewerFullscreen(el.closest('[data-viewer]'));break;}
case 'intro-replay':introIndex=0;introPlaying=true;syncIntro();break;
case 'doc-status':apiRequest('/api/v1/documents/status').then(data=>{updateState(s=>({...s,pdfEvidence:{...s.pdfEvidence,status:data}}));toast('Status OCR diperbarui')}).catch(e=>toast(e.message));break;
case 'doc-reset':updateState(s=>({...s,pdfEvidence:{...s.pdfEvidence,filters:{}}}));break;
case 'doc-export':{const data=getState().pdfEvidence||{items:[],filters:{}};download('SIMPUL_pdf_observations_filtered.json',JSON.stringify({source:'uploaded_pdf',status:'unverified',records:filterDocumentRecords(data.items,data.filters)},null,2));toast('Hasil PDF yang sedang difilter disiapkan');break;}
case 'map-reset-zones':if(confirm('Hapus semua titik referensi zona yang dibuat manual?'))updateState(s=>({...s,zonePins:{}}));break;
case 'osint-status':case 'osint-search':case 'osint-clear':osintAction(action);break;
case 'toggle-mobile':{if(mobileOpen)closeMobileDrawer(document.getElementById('sidebar'),document.querySelector('.mobile-curtain'),()=>{mobileOpen=false;render()});else {mobileOpen=true;render();}break;}
case 'settings-tab':{setSettingsTab(el.dataset.tab);render();window.scrollTo(0,0);break;}
case 'toggle-nav-group':{
  const target=el.dataset.group;
  if(target===MORE_GROUP){
    const panel=el.closest('.nav-more')?.querySelector('.nav-more-panel');
    const open=panel?panel.hidden:true;
    expandedNavGroup=open?MORE_GROUP:'';
    el.setAttribute('aria-expanded',String(open));el.closest('.nav-more')?.classList.toggle('open',open);
    if(panel)toggleAccordion(panel,open);
    break;
  }
  const currentOpen=expandedNavGroup===null?sectionForRoute(currentPage()):expandedNavGroup;
  expandedNavGroup=currentOpen===target?'':target;
  const nav=el.closest('.nav-area');
  nav?.querySelectorAll('[data-nav-section]').forEach(section=>{
    const sectionId=section.dataset.navSection;
    const button=section.querySelector('.nav-fold-trigger');
    const panel=section.querySelector('.nav-fold-content');
    const shouldOpen=sectionId===expandedNavGroup;
    if(button){button.setAttribute('aria-expanded',String(shouldOpen));}
    if(panel && (shouldOpen || !panel.hidden))toggleAccordion(panel,shouldOpen);
  });
  break;
}
case 'close-mobile':closeMobileDrawer(document.getElementById('sidebar'),document.querySelector('.mobile-curtain'),()=>{mobileOpen=false;render()});break;
case 'quick-observation':modal(eventModal());break;
case 'export-survey':download('SIMPUL_survey_coverage_manual.json',JSON.stringify(exportSurveyCoverage(getState()),null,2));toast('Matriks survei diekspor dengan status review');break;
case 'review-survey-session':{
  const s=getState(),session=s.sessions.find(x=>x.id===el.dataset.id&&x.source==='manual');
  if(!session)return toast('Sesi manual tidak ditemukan');
  const summary=surveyCoverage(s),row=summary.rows.find(x=>x.session.id===session.id);
  modal(reviewSessionModal(session,row,s.sessionReviews?.[session.id]||{}));break;
}
case 'create-operation':{
  const s=getState(),board=operationalBoard(s),candidate=board.candidates.find(x=>x.event.id===el.dataset.id)||null;
  const available=board.candidates.filter(x=>!board.cases.some(c=>c.eventId===x.event.id));
  if(!available.length)return toast('Belum ada kejadian manual P1/P2 yang belum ditindaklanjuti.');
  modal(operationCreateModal(candidate,board));break;
}
case 'update-operation':{
  const item=(getState().responseCases||[]).find(x=>x.id===el.dataset.id);
  if(!item)return toast('Kasus tidak ditemukan');modal(operationUpdateModal(item));break;
}
case 'export-operations':download('SIMPUL_operational_response_manual.json',JSON.stringify(exportOperations(getState()),null,2));toast('Daftar tindak lanjut diekspor tanpa catatan bebas');break;
case 'export-police-csv':downloadPoliceCsv();break;
case 'export-police-json':{download('SIMPUL_traffic_review_manual_only.json',JSON.stringify(makePoliceReviewBundle(getState()),null,2));toast('Berkas review JSON disiapkan, tanpa data ilustratif');break;}
case 'review-traffic':{const e=getState().observations.find(x=>x.id===el.dataset.id);if(!e)return toast('Rekaman tidak ditemukan');if(e.source!=='manual'){toast('Review resmi tidak dapat diisi pada data sintetis. Catat observasi manual.');return;}modal(trafficReviewModal(e,getState().eventReviews?.[e.id]));break;}

case 'add-field-reading':modal(fieldReadingModal());break;
case 'add-decision':modal(decisionModal());break;
case 'export-field-readings':downloadFieldReadings();break;
case 'sync-field-readings':syncFieldReadings();break;
case 'delete-field-reading':if(confirm('Hapus interval ini dari penyimpanan lokal? Data yang sudah tersinkronisasi ke server tidak otomatis terhapus.')){updateState(s=>({...s,fieldReadings:s.fieldReadings.filter(r=>r.id!==el.dataset.id)}));recordLocalActivity('field.delete','Interval manual dihapus lokal','warning');toast('Interval dihapus dari browser');}break;
case 'capture-type':modal(eventModal(el.dataset.value));break;
case 'close-modal':closeModal();break;
case 'start-session':startSession();break;
case 'end-session':endSession();break;
case 'clear-demo':{const count=getState().observations.filter(e=>e.source==='demo').length;if(!count)return toast('Tidak ada data ilustratif');if(confirm(`Hapus ${count} kejadian sintetis? Rekaman manual tetap tersimpan.`)){updateState(s=>({...s,observations:s.observations.filter(e=>e.source!=='demo')}));recordLocalActivity('data.cleanup','Data sintetis sintetis dihapus');toast('Data contoh dihapus')}}break;
case 'delete-event':if(getState().responseCases?.some(c=>c.eventId===el.dataset.id)){toast('Rekaman sudah memiliki tindak lanjut. Ekspor/arsipkan catatan dulu sebelum menghapus sumber.');break;}if(confirm('Hapus satu kejadian ini?')){updateState(s=>({...s,observations:s.observations.filter(e=>e.id!==el.dataset.id)}));recordLocalActivity('observation.delete','Satu kejadian dihapus','warning');toast('Kejadian dihapus')}break;
case 'run-simulation':updateState(s=>({...s,lastAnalysis:heuristicSimulation(s.scenario),history:[...s.history,{id:uid('run'),engine:'heuristic',createdAt:nowIso()}]}));recordLocalActivity('simulation.demo','Estimasi heuristik ilustratif dijalankan');toast('Estimasi heuristik ilustratif diperbarui');break;
case 'run-sumo':runSumo();break;
case 'ctx-reverse':case 'ctx-crossings':case 'ctx-airquality':case 'ctx-forecast':case 'ctx-elevation':case 'ctx-history':case 'ctx-holidays':case 'ctx-isochrone':case 'ctx-select-poi':contextPlusAction(action,el);break;
case 'check-apis':case 'select-geo':case 'load-map':case 'fetch-weather':case 'fetch-traffic':case 'fetch-nearby':case 'sync-observations':case 'pull-observations':case 'ai-insights':connectedAction(action,el);break;
case 'cv-signoff-window':signoffCvWindow();break;
case 'ai-decision-brief':runDecisionBrief();break;
case 'load-brief-scenario':loadBriefScenario(el);break;
case 'refresh-monitor':refreshMonitor();break;
case 'export-monitor':monitorCsv();break;
case 'flush-telemetry':flushTelemetry(false);break;
case 'probe-telemetry':flushTelemetry(true);break;
case 'reset-monitor-filters':updateState(s=>({...s,monitorFilter:{source:'all',zone:'all',range:'all'}}));break;
case 'reset-scenario':resetScenario();break;
case 'reset-finance':resetFinance();break;


case 'select-equipment':updateState(s=>({...s,equipmentMode:el.dataset.value}));break;
case 'export-executive-brief':{download('SIMPUL_Executive_Brief_EN.html',buildExecutiveBriefHTML(getState()),'text/html;charset=utf-8');toast('Executive brief berbahasa Inggris siap dibuka atau dicetak');break;}
case 'export-evidence-package':{const bundle=buildStandardsBundle(getState());download('SIMPUL_evidence_bundle_v1.json',JSON.stringify(bundle,null,2));recordLocalActivity('export.evidence','Evidence bundle manual diekspor');toast('Evidence bundle dengan kualitas dan provenance diekspor');break;}
case 'export-study-geojson':{try{download('SIMPUL_study_reference.geojson',JSON.stringify(buildProjectGeoJSON(getState()),null,2),'application/geo+json');toast('GeoJSON lokasi referensi proyek berhasil diekspor')}catch(error){toast(error.message)}break;}
case 'export-observations':downloadObservations();break;
case 'export-forecast':downloadForecast();break;
case 'export-equipment':downloadEquipment();break;
case 'export-report':download('SIMPUL_laporan.json',JSON.stringify(makeReport(),null,2));toast('Laporan dengan asumsi dan keterbatasan diekspor');break;
case 'export-backup':download('SIMPUL_backup.json',exportState());toast('Backup workspace diunduh');break;
case 'save-api-token':{
  const value=document.getElementById('simpul-api-token')?.value?.trim()||'';
  if(!value)return toast('Masukkan token API dari environment backend.');
  setSessionApiToken(value);
  document.getElementById('simpul-api-token').value='';
  toast('Token API disimpan hanya untuk sesi tab ini.');render();break;
}
case 'clear-api-token':setSessionApiToken('');toast('Token sesi dihapus.');render();break;
case 'reset-data':if(confirm('Reset seluruh pekerjaan menjadi data sintetis awal? Backup terlebih dahulu jika diperlukan.')){resetState();toast('Workspace direset ke data awal')}break;
default:if(action.startsWith('goto-')){const target=action.slice(5);go(REMOVED_ROUTES[target]||target);}}
}
document.addEventListener('click',e=>{const route=e.target.closest('[data-route]');if(route){go(route.dataset.route);return;}const action=e.target.closest('[data-action]');if(action){e.preventDefault();handleAction(action.dataset.action,action);}});
document.addEventListener('input',e=>{if(e.target.id==='simpul-nav-search'){filterNavigation(e.target.closest('.nav-area'),e.target.value);return;}if(e.target.matches('input[type=range].scenario-input')){const display=document.querySelector(`[data-range-out="${e.target.id}"]`);if(display){const suffix=display.textContent.endsWith('%')?'%':display.textContent.endsWith('s')?'s':display.textContent.endsWith('m')?'m':'';display.textContent=e.target.value+suffix}}});
document.addEventListener('change',async e=>{const el=e.target;
 if(['vehicle-source','vehicle-type','vehicle-zone'].includes(el.id)){
  const key=el.id.replace('vehicle-','');
  updateState(s=>({...s,vehicleView:{...s.vehicleView,[key]:el.value,...(key==='source'?{zone:'all',type:'all'}:null)}}));return;
 }
 if(el.id==='fld-phase'){const scenario=document.getElementById('fld-scenario');if(scenario)scenario.value=el.value==='baseline'?'A0':'A1';return;}
 if(el.id==='compare-scenario'){updateState(s=>({...s,comparisonScenario:el.value}));return;}
 if(el.id==='field-dwell-threshold' || el.id==='guard-queue' || el.id==='guard-detour'){const mapping={'field-dwell-threshold':'dwellThresholdSec','guard-queue':'maxQueue','guard-detour':'maxDetour'},key=mapping[el.id],value=Number(el.value);if(Number.isFinite(value)&&value>=0)updateState(s=>({...s,fieldSettings:{...s.fieldSettings,[key]:value}}));return;}
 if(['class-source','class-priority','class-zone','class-review'].includes(el.id)){
  const key=el.id.replace('class-','');updateState(s=>({...s,policeFilter:{...s.policeFilter,[key]:el.value}}));return;
 }
 if(el.id==='monitor-auto-sync'){if(el.checked&&!confirm('Aktifkan sinkronisasi otomatis observasi manual ke server lokal setiap 30 detik selama halaman Monitoring dibuka?')){el.checked=false;return;}updateState(s=>({...s,monitorAutoSync:el.checked}));recordLocalActivity('monitor.auto',el.checked?'Sinkronisasi otomatis diaktifkan':'Sinkronisasi otomatis dimatikan');lastMonitorSync=0;return;}
 if(['monitor-source','monitor-range','monitor-zone'].includes(el.id)){const key=el.id.replace('monitor-','');updateState(s=>({...s,monitorFilter:{...s.monitorFilter,[key]:el.value}}));return;}
 if(el.matches('.scenario-input')){const key=el.id;const v=Number(el.value);updateState(s=>({...s,scenario:{...s.scenario,[key]:v},lastAnalysis:heuristicSimulation({...s.scenario,[key]:v})}));return;}
 if(el.matches('.finance-input')){updateState(s=>({...s,finance:{...s.finance,[el.id]:Math.max(0,Number(el.value)||0)}}));return;}
 if(el.matches('.equipment-input')){updateState(s=>({...s,equipmentPrices:{...s.equipmentPrices,[el.dataset.equip]:Math.max(0,Number(el.value)||0)}}));return;}
 if(el.id==='import-backup'&&el.files?.length){try{const content=await el.files[0].text();if(!confirm('Timpa semua data workspace dengan file backup ini?'))return;importState(content);toast('Backup dipulihkan')}catch(err){toast('Gagal mengimpor: '+err.message)}el.value='';}
});
document.addEventListener('submit',e=>{e.preventDefault();const id=e.target.id;const get=k=>document.getElementById(k)?.value||'';
 if(id==='document-upload-form'){importPdfDocument();return;}
 if(id==='document-filter-form'){const filters={zone:get('doc-zone').trim(),vehicle:get('doc-vehicle').trim(),color:get('doc-color').trim(),date:get('doc-date'),after:get('doc-after'),before:get('doc-before')};updateState(s=>({...s,pdfEvidence:{...s.pdfEvidence,filters}}));return;}
 if(id==='survey-protocol-form'){
  try{
    const before=getState().surveyProtocol;
    const next=normalizeProtocol({...before,replicates:Number(get('survey-replicates')),minMinutes:Number(get('survey-min')),maxMinutes:Number(get('survey-max'))});
    updateState(s=>({...s,surveyProtocol:next}));
    recordLocalActivity('survey.protocol','Protokol survei diperbarui (asumsi perencanaan)');
    toast('Protokol survei tersimpan; sesi akan dihitung ulang.');
  }catch(error){toast(error.message);}return;
 }
 if(id==='survey-review-form'){
  const sessionId=get('survey-review-id'),state=getState(),session=state.sessions.find(x=>x.id===sessionId&&x.source==='manual');
  if(!session)return toast('Sesi manual tidak ditemukan');
  const status=get('survey-review-status'),reviewer=get('survey-reviewer').trim().slice(0,80),note=get('survey-review-note').trim().slice(0,500),zeroConfirmed=document.getElementById('survey-zero')?.checked===true;
  if(!['pending','approved','rejected'].includes(status)||reviewer.length<2||note.length<10)return toast('Isi status, pemeriksa, dan alasan minimal 10 karakter.');
  const review={status,reviewer,note,zeroConfirmed,at:nowIso()};
  const quality=sessionQuality(session,review,state.observations,normalizeProtocol(state.surveyProtocol));
  if(status==='approved'&&!quality.accepted)return toast('Sesi tidak dapat diterima: '+quality.reasons.join('; '));
  updateState(s=>({...s,sessionReviews:{...s.sessionReviews,[sessionId]:review},activityLog:[...(s.activityLog||[]),{id:uid('log'),at:review.at,kind:'survey.review',message:'Sesi '+sessionId+' '+status+' (internal)',level:'info'}].slice(-500)}));
  closeModal();toast('Review sesi tersimpan');return;
 }
 if(id==='operation-form'){
  try{
    const draft=validateCaseDraft({eventId:get('operation-event'),owner:get('operation-owner'),action:get('operation-action'),dueAt:get('operation-due')},getState());
    const item={...draft,id:uid('case'),status:'open',createdAt:nowIso()};
    updateState(s=>({...s,responseCases:[...s.responseCases,item],responseAudit:[...s.responseAudit,{id:uid('log'),caseId:item.id,eventId:item.eventId,at:item.createdAt,status:'open',action:'created'}].slice(-2500)}));
    closeModal();toast('Tindak lanjut dibuat sebagai catatan internal');
  }catch(error){toast(error.message);}return;
 }
 if(id==='operation-update-form'){
  const caseId=get('operation-case-id'),state=getState(),record=state.responseCases.find(x=>x.id===caseId);
  try{
    const checked=validateCaseUpdate(record,get('operation-status'),get('operation-reason'));
    const at=nowIso();
    updateState(s=>({...s,responseCases:s.responseCases.map(c=>c.id===caseId?{...c,status:checked.status,updatedAt:at}:c),
      responseAudit:[...s.responseAudit,{id:uid('log'),caseId,eventId:record.eventId,at,status:checked.status,action:'status_change',reason:checked.reason}].slice(-2500)}));
    closeModal();toast('Status dan riwayat tindak lanjut disimpan');
  }catch(error){toast(error.message);}return;
 }
 if(id==='geo-search-form'){searchLocation(get('geo-query'));return;}
 if(id==='ctx-route-form'){requestRoute();return;}
 if(id==='event-form'){const duration=Number(get('event-duration'));if(!Number.isFinite(duration)||duration<0||duration>3600)return toast('Durasi harus antara 0â€“3600 detik');const active=getState().activeSession;if(!active){toast('Mulai sesi dari halaman Observasi sebelum mencatat kejadian');closeModal();go('observation');return;}
  const evidenceReference=get('event-evidence').trim().slice(0,80);
  const signageVerified=document.getElementById('event-signage')?.checked===true;
  if(signageVerified&&!evidenceReference)return toast('Isi ID referensi sebelum menandai rambu/fasilitas sudah diperiksa.');
  if(evidenceReference&&!/^[A-Za-z0-9:_-]+$/.test(evidenceReference))return toast('ID referensi hanya boleh huruf, angka, :, - dan _.');
  if(get('event-zone')!==active.zone)return toast('Zona kejadian harus sama dengan zona sesi aktif.');
  const item={id:uid('evt'),at:nowIso(),type:get('event-type'),vehicle:get('event-vehicle'),duration,zone:get('event-zone'),note:get('event-note').trim().slice(0,500),source:'manual',sessionId:active.id,
   zoneContext:get('event-context'),laneBlocked:get('event-lane'),pedestrianBlocked:get('event-pedestrian'),queueObserved:get('event-queue'),signageVerified,evidenceReference};closeModal();updateState(s=>({...s,observations:[...s.observations,item]}));recordLocalActivity('observation.create',`Kejadian ${item.type} dicatat di ${item.zone}`);toast('Observasi manual tersimpan');}
 if(id==='traffic-review-form'){
  const eventId=get('traffic-review-id'),event=getState().observations.find(x=>x.id===eventId),status=get('traffic-review-status'),reviewer=get('traffic-reviewer').trim().slice(0,80),reviewNote=get('traffic-review-note').trim().slice(0,600);
  if(!event||event.source!=='manual')return toast('Review hanya tersedia untuk rekaman lapangan manual.');
  if(!Object.hasOwn(REVIEW_STATUS,status))return toast('Status review tidak valid.');
  if(status!=='pending'&&(!reviewer||reviewNote.length<8))return toast('Isi label pemeriksa dan alasan minimal 8 karakter.');
  const current=getState().eventReviews?.[eventId]||null;
  const record={status,reviewer,note:reviewNote,at:nowIso(),version:(current?.version||0)+1};
  updateState(s=>({...s,eventReviews:{...s.eventReviews,[eventId]:record},classificationAudit:[...(s.classificationAudit||[]),{id:uid('review'),eventId,at:record.at,action:'update_status',status,reviewer}].slice(-1000)}));
  closeModal();recordLocalActivity('classification.review',`Catatan pemeriksaan kejadian ${eventId}: ${status}`);toast('Review internal disimpan dengan audit trail');return;
 }
 if(id==='field-reading-form'){
  const bounded=(key,min,max)=>{const v=Number(get(key));if(!Number.isFinite(v)||v<min||v>max||!Number.isInteger(v))throw new Error(`Nilai ${key} harus bilangan bulat antara ${min} dan ${max}`);return v;};
  try{
   const minutes=bounded('fld-minutes',5,240),passingVehicles=bounded('fld-passing',0,50000),stoppedVehicles=bounded('fld-stopped',0,50000),maxQueue=bounded('fld-queue',0,2000),accessMeters=bounded('fld-access',0,10000),pedestrians=bounded('fld-pedestrians',0,50000),availableBays=bounded('fld-bays',0,1000),occupiedBays=bounded('fld-occupied',0,1000);
   if(availableBays>0&&occupiedBays>availableBays)throw new Error('Ruang terisi tidak boleh melebihi kapasitas terukur.');
   if(availableBays===0&&occupiedBays>0)throw new Error('Kapasitas 0 berarti belum diketahui; isi ruang terisi dengan 0 juga.');
   if(stoppedVehicles>passingVehicles)throw new Error('Jumlah berhenti tidak boleh melebihi total kendaraan yang lewat pada interval yang sama.');
   const observedAt=new Date(get('fld-observed-at'));if(!Number.isFinite(observedAt.getTime())||observedAt.getTime()+minutes*60000>Date.now()+5*60000||observedAt.getTime()<Date.parse('2000-01-01'))throw new Error('Waktu awal interval tidak valid atau berada di masa depan.');
   const phase=get('fld-phase'),scenario=get('fld-scenario');if(phase==='baseline'&&scenario!=='A0')throw new Error('Baseline harus mencatat kondisi eksisting A0.');
   const reading={id:uid('interval'),at:observedAt.toISOString(),recordedAt:nowIso(),phase,scenario,period:get('fld-period'),zone:get('fld-zone'),minutes,passingVehicles,stoppedVehicles,maxQueue,accessMeters,pedestrians,blockedAccess:get('fld-blocked')==='yes',availableBays,occupiedBays,source:'manual',sessionId:getState().activeSession?.id??null,note:get('fld-note').trim().slice(0,400)};
   closeModal();updateState(s=>({...s,fieldReadings:[...s.fieldReadings,reading]}));recordLocalActivity('field.create',`Interval ${reading.phase} ${reading.minutes} menit ditambahkan untuk ${reading.zone}`);toast('Interval manual tersimpan dan dapat dievaluasi');
  }catch(err){toast(err.message);}return;
 }
 if(id==='decision-form'){
  const owner=get('dec-owner').trim().slice(0,100),reason=get('dec-reason').trim().slice(0,700),status=get('dec-status'),scenario=get('dec-scenario');
  if(!owner||reason.length<10)return toast('Penanggung jawab dan alasan minimal 10 karakter diperlukan.');
  if(!['draft','review','pilot','closed'].includes(status)||!['A0','A1','A2'].includes(scenario))return toast('Status keputusan tidak valid.');
  const item={id:uid('decision'),at:nowIso(),owner,reason,status,scenario,nextAction:get('dec-next').trim().slice(0,200),source:'internal-team-record',approvedByAuthority:false};
  closeModal();updateState(s=>({...s,decisions:[...s.decisions,item]}));recordLocalActivity('decision.create',`Catatan kajian ${scenario} dibuat (${status})`);toast('Catatan keputusan internal disimpan');return;
 }
 if(id==='project-form'){updateState(s=>({...s,project:{...s.project,name:get('project-name').trim().slice(0,90)||s.project.name,district:get('project-district').slice(0,120),description:get('project-desc').slice(0,500)}}));toast('Pengaturan proyek disimpan')}
});
window.addEventListener('hashchange',()=>{mobileOpen=false;expandedNavGroup=sectionForRoute(currentPage())||expandedNavGroup;render();window.scrollTo(0,0);manageMonitorPolling()});
window.addEventListener('keydown',e=>{
  const typing=document.activeElement?.matches?.('input,textarea,select,[contenteditable=true]');
  const searchShortcut=((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k') || (e.key==='/'&&!typing&&!e.ctrlKey&&!e.metaKey);
  if(searchShortcut){
    e.preventDefault();
    if(window.matchMedia('(max-width: 1020px)').matches && !mobileOpen){mobileOpen=true;render();}
    requestAnimationFrame(()=>document.getElementById('simpul-nav-search')?.focus());
    return;
  }
  if(e.key==='Escape'){
    const opened=document.getElementById('app-modal');
    if(opened)closeModal({animate:true});
    else if(mobileOpen)closeMobileDrawer(document.getElementById('sidebar'),document.querySelector('.mobile-curtain'),()=>{mobileOpen=false;render()});
    else {const field=document.getElementById('simpul-nav-search');if(field?.value){field.value='';filterNavigation(field.closest('.nav-area'),'');field.blur();}}
    return;
  }
  if((e.key==='Enter'||e.key===' ')&&document.activeElement?.dataset?.action==='select-equipment'){
    e.preventDefault();handleAction('select-equipment',document.activeElement);
  }
});
subscribe(render);render();manageMonitorPolling();
installCustomSelects();
installDomI18n();
// PWA service worker, best-effort. HTTPS or localhost required.
if('serviceWorker' in navigator && location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
