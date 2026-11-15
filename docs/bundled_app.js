// SOURCE MODULE: js/data.js
// Synthetic demonstration data. No entry is presented as a verified field measurement.
const initialData = () => ({
  version: 2,
  project: { id:'fatmawati-demo', name:'Koridor MRT Fatmawati', district:'Jakarta Selatan', status:'Demo sintetis', zone:'Akses penjemputan – koridor studi', description:'Lokasi pilot sesuai proposal; geometri dan observasi berikut adalah data ilustratif.' },
  observations: [
    {id:'evt-1001', at:'2026-11-13T07:05:00+07:00', type:'Jemput', vehicle:'Mobil', duration:55, zone:'Zona A', source:'demo', note:'Contoh event sintetis'},
    {id:'evt-1002', at:'2026-11-13T07:09:00+07:00', type:'Turun', vehicle:'Mobil', duration:24, zone:'Zona A', source:'demo', note:''},
    {id:'evt-1003', at:'2026-11-13T07:16:00+07:00', type:'Menunggu', vehicle:'Mobil', duration:110, zone:'Zona B', source:'demo', note:''},
    {id:'evt-1004', at:'2026-11-13T07:21:00+07:00', type:'Jemput', vehicle:'Motor', duration:42, zone:'Zona A', source:'demo', note:''},
    {id:'evt-1005', at:'2026-11-13T07:29:00+07:00', type:'Turun', vehicle:'Motor', duration:18, zone:'Zona C', source:'demo', note:''},
    {id:'evt-1006', at:'2026-11-13T07:36:00+07:00', type:'Menunggu', vehicle:'Mobil', duration:88, zone:'Zona B', source:'demo', note:''},
    {id:'evt-1007', at:'2026-11-13T07:42:00+07:00', type:'Jemput', vehicle:'Mobil', duration:63, zone:'Zona C', source:'demo', note:''},
    {id:'evt-1008', at:'2026-11-13T07:53:00+07:00', type:'Turun', vehicle:'Mobil', duration:31, zone:'Zona A', source:'demo', note:''}
  ],
  sessions:[ {id:'ses-demo', startedAt:'2026-11-13T07:00:00+07:00', endedAt:'2026-11-13T08:00:00+07:00', zone:'Zona A – C', source:'demo', status:'Selesai'} ],
  activeSession: null,
  fieldReadings: [],
  surveyProtocol: {zones:['Zona A','Zona B','Zona C'],periods:['Jam sibuk','Luar jam sibuk'],replicates:2,minMinutes:30,maxMinutes:60},
  sessionReviews: {},
  responseCases: [],
  responseAudit: [],
  fieldSettings: {dwellThresholdSec:60,maxQueue:15,maxDetour:150},
  decisions: [],
  comparisonScenario: 'A1',
  scenario: { traffic: 850, pickupShare:18, dwell:55, diversion:75, ruleDwell:20, pedestrianDetour:100, seeds:3 },
  finance: {sites:5, monthly:5000000, setup:35000000, pilots:0, pilotFee:20000000, conversions:65, churn:0, cloudMonthly:3600000, supportPerSite:550000, implementationCostPerSite:11500000, pilotCost:9000000, fixedMonthly:8500000, salesMonthly:3400000, newSitesPerMonth:0},
  pipeline: [
    {id:'lead-demo-a', name:'Contoh Organisasi A', segment:'Operator transit', stage:'Identifikasi', amount:0, contact:'Belum ada', next:'Validasi masalah operasional', demo:true},
    {id:'lead-demo-b', name:'Contoh Organisasi B', segment:'Konsultan transportasi', stage:'Wawancara', amount:0, contact:'Belum ada', next:'Susun pertanyaan discovery', demo:true}
  ],
  equipmentMode: 'phone',
  equipmentPrices: { phone:0, tripod:220000, powerbank:350000, cloud:3500000, pi:1350000, camera:900000, router:550000, storage:450000 },
  lastAnalysis: null,
  aiInsights: null,
  context: {query:'Stasiun MRT Fatmawati, Jakarta',results:[],nearby:null,weather:null},
  osintLookup: null,
  contextPlus: {historyDay:'2026-10-20',year:2026,destination:null},
  integrationStatus: null,
  history: [],
  notifications: [],
  activityLog: [],
  eventReviews: {},
  classificationAudit: [],
  policeFilter: {source:'all',priority:'all',zone:'all',review:'all'},
  vehicleView: {source:'demo',type:'all',zone:'all'},
  monitorFilter: {source:'all',zone:'all',range:'all'},
  monitorRemote: null,
  monitorAutoSync: false,
  pdfEvidence: {items:[],filters:{},lastImport:null,status:null},
  zonePins: {}
});
const views = [
  {id:'overview',label:'Ringkasan',icon:'layout-dashboard',group:'WORKSPACE'},
  {id:'vehicles',label:'Masalah Kendaraan',icon:'car-front',group:'WORKSPACE'},
  {id:'project',label:'Cara kerja SIMPUL',icon:'workflow',group:'WORKSPACE'},
  {id:'observation',label:'Observasi lapangan',icon:'scan-line',group:'WORKSPACE'},
  {id:'survey',label:'Rencana survei & cakupan',icon:'calendar-check',group:'WORKSPACE'},
  {id:'operations',label:'Tindak lanjut hambatan',icon:'list-checks',group:'WORKSPACE'},
  {id:'monitor',label:'Monitoring & data log',icon:'activity',group:'WORKSPACE'},
  {id:'classification',label:'Klasifikasi & Tinjauan',icon:'clipboard-list',group:'WORKSPACE'},
  {id:'publicintel',label:'Konteks Publik / OSINT',icon:'newspaper',group:'WORKSPACE'},
  {id:'diagnosis',label:'Diagnosis Hambatan',icon:'scan-search',group:'WORKSPACE'},
  {id:'context',label:'Peta & data konteks',icon:'map-pinned',group:'WORKSPACE'},
  {id:'mapview',label:'Peta koridor interaktif',icon:'map',group:'WORKSPACE'},
  {id:'documents',label:'Pencarian catatan PDF',icon:'file-text',group:'WORKSPACE'},
  {id:'contextplus',label:'Context Intelligence Lab',icon:'waypoints',group:'WORKSPACE'},
  {id:'simulation',label:'Simulasi skenario',icon:'git-compare-arrows',group:'WORKSPACE'},
  {id:'evaluation',label:'Rencana & Dampak',icon:'clipboard-check',group:'WORKSPACE'},
  {id:'insights',label:'Temuan & keputusan',icon:'brain-circuit',group:'WORKSPACE'},
  {id:'business',label:'Business Studio',icon:'chart-no-axes-combined',group:'BISNIS'},
  {id:'pipeline',label:'Akuisisi pelanggan',icon:'users',group:'BISNIS'},
  {id:'equipment',label:'Perangkat & biaya',icon:'smartphone',group:'BISNIS'},
  {id:'standards',label:'Standar & kualitas bukti',icon:'shield-check',group:'SISTEM'},
  {id:'reports',label:'Laporan & ekspor',icon:'files',group:'SISTEM'},
  {id:'integrations',label:'API & integrasi',icon:'plug-zap',group:'SISTEM'},
  {id:'settings',label:'Pengaturan & data',icon:'settings-2',group:'SISTEM'},
  {id:'creators',label:'About the Creators',icon:'users',group:'TENTANG'}
];


// SOURCE MODULE: js/store.js

const KEY = 'simpul_workspace_v2';
function sanitize(saved) {
 const initial=initialData();
 if (!saved || saved.version!==initial.version) return initial;
 const {edgeBenchmark,edgeData,...clean}=saved;
 return {...initial,...clean,
   project:{...initial.project,...saved.project},
   scenario:{...initial.scenario,...saved.scenario},
   finance:{...initial.finance,...saved.finance},
   equipmentPrices:Object.fromEntries(Object.keys(initial.equipmentPrices).map(k=>[k,Number(saved.equipmentPrices?.[k]??initial.equipmentPrices[k])])),
   equipmentMode:['phone','cloud','edge'].includes(saved.equipmentMode)?saved.equipmentMode:'phone',
   context:{...initial.context,...saved.context},
   contextPlus:{...initial.contextPlus,...saved.contextPlus},
   osintLookup: saved.osintLookup && typeof saved.osintLookup==='object'? {...saved.osintLookup,items:Array.isArray(saved.osintLookup.items)?saved.osintLookup.items.slice(0,15):[]} :null,
   monitorFilter:{...initial.monitorFilter,...saved.monitorFilter},
   activityLog:Array.isArray(saved.activityLog)?saved.activityLog.slice(-500):[],
   eventReviews:saved.eventReviews && typeof saved.eventReviews==='object' && !Array.isArray(saved.eventReviews)?saved.eventReviews:{},
   classificationAudit:Array.isArray(saved.classificationAudit)?saved.classificationAudit.slice(-1000):[],
   policeFilter:{...initial.policeFilter,...saved.policeFilter},
   vehicleView:{...initial.vehicleView,...saved.vehicleView},
   fieldReadings:Array.isArray(saved.fieldReadings)?saved.fieldReadings.filter(x=>x&&x.source==='manual').slice(-3000):[],
   fieldSettings:{...initial.fieldSettings,...saved.fieldSettings},
   surveyProtocol:{...initial.surveyProtocol,...saved.surveyProtocol},
   sessionReviews:saved.sessionReviews&&typeof saved.sessionReviews==='object'&&!Array.isArray(saved.sessionReviews)?saved.sessionReviews:{},
   responseCases:Array.isArray(saved.responseCases)?saved.responseCases.filter(x=>x&&typeof x==='object').slice(-1000):[],
   responseAudit:Array.isArray(saved.responseAudit)?saved.responseAudit.slice(-2500):[],
   decisions:Array.isArray(saved.decisions)?saved.decisions.slice(-100):[],
   comparisonScenario:['A0','A1','A2'].includes(saved.comparisonScenario)?saved.comparisonScenario:'A1',
   monitorRemote:saved.monitorRemote??null,
   pdfEvidence:{...initial.pdfEvidence,...(saved.pdfEvidence||{}),items:Array.isArray(saved.pdfEvidence?.items)?saved.pdfEvidence.items.filter(x=>x?.source==='uploaded_pdf').slice(-200):[]},
   zonePins:saved.zonePins&&typeof saved.zonePins==='object'&&!Array.isArray(saved.zonePins)?saved.zonePins:{},
   monitorAutoSync:saved.monitorAutoSync===true
 };
}
function readState(){try{return sanitize(JSON.parse(localStorage.getItem(KEY)));}catch{return initialData();}}
let state=readState();
let listeners=[];
function getState(){return state;}
function updateState(updater){state=sanitize(updater(state));try{localStorage.setItem(KEY,JSON.stringify(state));}catch(error){console.warn('Storage write failed',error);}listeners.forEach(f=>f(state));return state;}
function subscribe(fn){listeners.push(fn);return ()=>listeners=listeners.filter(x=>x!==fn);}
function resetState(){state=initialData();localStorage.setItem(KEY,JSON.stringify(state));listeners.forEach(f=>f(state));}
function exportState(){return JSON.stringify({exportedAt:new Date().toISOString(),type:'SIMPUL workspace backup',data:state},null,2)}
function importState(raw){let p=JSON.parse(raw),d=p.data??p;if(d.version!==2||!Array.isArray(d.observations)||!Array.isArray(d.pipeline))throw new Error('Format cadangan tidak sesuai.');updateState(()=>d);}


// SOURCE MODULE: js/diagnostics.js
/** Evidence-first field diagnostics. Measurements are entered by human surveyors, not automatically inferred.
 * Never merge synthetic observation events with field readings or attribute causality to before/after changes.
 */
const finite = v => typeof v === 'number' && Number.isFinite(v);
const avg = xs => xs.length ? xs.reduce((a,b)=>a+b,0)/xs.length : null;
const round = (v,d=1) => v===null ? null : Number(v.toFixed(d));
const PERIODS=['Jam sibuk','Luar jam sibuk'];
const PHASES=['baseline','followup'];
function summarizeReadings(records=[], filter={}) {
  const rows=records.filter(r=>r.source==='manual'&&PHASES.includes(r.phase)&&finite(r.minutes)&&r.minutes>0&&(!filter.phase||r.phase===filter.phase)&&(!filter.zone||r.zone===filter.zone)&&(!filter.period||r.period===filter.period)&&(!filter.scenario||r.scenario===filter.scenario));
  const minutes=rows.reduce((s,r)=>s+r.minutes,0);
  const count=k=>rows.reduce((s,r)=>s+Number(r[k]||0),0);
  const mean=k=>avg(rows.filter(r=>finite(r[k])).map(r=>r[k]));
  const capacity=rows.filter(r=>r.availableBays>0&&r.occupiedBays!==null&&r.occupiedBays!==undefined);
  return {
   samples:rows.length,minutes,zoneCount:new Set(rows.map(r=>r.zone)).size,periodCount:new Set(rows.map(r=>r.period)).size,
   passing:count('passingVehicles'),stopped:count('stoppedVehicles'),pedestrians:count('pedestrians'),
   trafficPerHour:minutes?round(count('passingVehicles')*60/minutes):null,
   stopPerHour:minutes?round(count('stoppedVehicles')*60/minutes):null,
   stopShare:count('passingVehicles')?round(count('stoppedVehicles')/count('passingVehicles')*100):null,
   avgQueue:round(mean('maxQueue')),peakQueue:rows.length?Math.max(...rows.map(r=>r.maxQueue)):null,
   meanAccess:round(mean('accessMeters')),
   blockedSamples:rows.filter(r=>r.blockedAccess===true).length,
   blockedPercent:rows.length?round(rows.filter(r=>r.blockedAccess===true).length*100/rows.length):null,
   capacitySamples:capacity.length,
   avgBayOccupancy:round(avg(capacity.map(r=>100*r.occupiedBays/r.availableBays))),
   rows
  };
}
/** Comparisons are paired on zone+period; only comparable strata are included. */
function comparePeriods(records=[],scenario='A1') {
  const baseline=summarizeReadings(records,{phase:'baseline'}),followup=summarizeReadings(records,{phase:'followup',scenario});
  const keys=new Set(baseline.rows.map(r=>r.zone+'|'+r.period));
  const comparable=[...keys].filter(key=>followup.rows.some(r=>r.zone+'|'+r.period===key));
  const select=(phase)=>summarizeReadings(records.filter(r=>comparable.includes(r.zone+'|'+r.period)),{phase,...(phase==='followup'?{scenario}:{})});
  const before=select('baseline'),after=select('followup');
  const dif=(k)=>before[k]===null||after[k]===null?null:round(after[k]-before[k]);
  const relative=(k)=>before[k]===null||after[k]===null||before[k]===0?null:round((after[k]-before[k])/before[k]*100);
  return {scenario,baseline,followup,comparable, before,after,
    comparableSamples:before.samples>0&&after.samples>0,
    changes:{trafficPerHour:dif('trafficPerHour'),stopPerHour:dif('stopPerHour'),stopPercent:relative('stopPerHour'),avgQueue:dif('avgQueue'),accessMeters:dif('meanAccess'),blockedPercentPoints:dif('blockedPercent')},
    limitations:['Perubahan sebelum/sesudah bersifat deskriptif dan tidak membuktikan dampak kausal.','Hanya zona dan jenis periode yang terdapat pada kedua fase yang dibandingkan.','Periksa perubahan permintaan, cuaca, hari, metode observasi, dan ketidakpastian sampel.']
  };
}
function diagnose(records=[],events=[],settings={}) {
 const base=summarizeReadings(records,{phase:'baseline'}),full=summarizeReadings(records),manual=events.filter(e=>e.source==='manual');
 const total=manual.length,wait=manual.filter(e=>e.type==='Menunggu'),threshold=Number(settings.dwellThresholdSec)||60;
 const long=manual.filter(e=>Number(e.duration)>threshold);
 const groups=[...new Set(base.rows.map(r=>r.zone))].map(zone=>({zone,...summarizeReadings(base.rows,{zone})})).sort((a,b)=>(b.stopPerHour??-1)-(a.stopPerHour??-1));
 const warnings=[];
 if(!base.samples)warnings.push({kind:'missing',title:'Belum ada pengukuran interval baseline',detail:'Catat volume kendaraan, antrean dan akses dengan durasi interval yang jelas.'});
 if(wait.length)warnings.push({kind:'observed',title:`${wait.length} peristiwa menunggu tercatat`,detail:'Peristiwa manual, bukan klasifikasi kamera. Periksa posisi dan waktu terhadap arus utama.'});
 if(long.length)warnings.push({kind:'observed',title:`${long.length} peristiwa melewati ${threshold} detik`,detail:'Batas adalah ambang analisis yang dapat diubah, bukan ketentuan hukum lalu lintas.'});
 if(base.rows.some(r=>r.blockedAccess))warnings.push({kind:'observed',title:'Ada interval dengan hambatan akses pejalan kaki',detail:'Catat posisi dan lakukan inspeksi keselamatan sebelum merekomendasikan lokasi jemput.'});
 if(base.rows.some(r=>r.availableBays>0&&r.occupiedBays>=r.availableBays))warnings.push({kind:'observed',title:'Fasilitas jemput terisi penuh pada sedikitnya satu interval',detail:'Periksa ketersediaan ruang, perputaran kendaraan dan perpindahan penumpang.'});
 const hypotheses=[];
 if(base.samples===0)hypotheses.push({id:'H0',title:'Lengkapi baseline terlebih dahulu',basis:'Belum ada interval pengukuran volume, antrean dan akses.',next:'Amati jam sibuk dan non-sibuk selama durasi sesi yang dinyatakan.',scenario:'A0'});
 if(wait.length||long.length)hypotheses.push({id:'H1',title:'Uji batas waktu tunggu/berhenti',basis:`${wait.length} kejadian Menunggu; ${long.length} kejadian melewati ambang ${threshold} detik`,next:'Bandingkan A2 dengan A0 menggunakan volume dan waktu kedatangan sebanding.',scenario:'A2'});
 if(base.rows.some(r=>r.availableBays>0&&r.occupiedBays>=r.availableBays)||base.stopPerHour!==null&&base.stopPerHour>0)hypotheses.push({id:'H2',title:'Periksa penataan ruang jemput yang sudah tersedia',basis:`${base.samples} interval baseline, ${base.stopped} kendaraan berhenti teramati`,next:'Verifikasi kapasitas area jemput dan detour pejalan sebelum menguji A1.',scenario:'A1'});
 if(base.rows.some(r=>r.blockedAccess))hypotheses.push({id:'H3',title:'Prioritaskan lintasan pejalan kaki',basis:`${base.blockedSamples} interval baseline tercatat akses terhalang`,next:'Cek jalur penyeberangan, akses disabilitas dan titik konflik langsung di lapangan.',scenario:'A1/A2'});
 return {base,full,groups,total,waiting:wait.length,long:long.length,threshold,warnings,hypotheses,completedSessions:0};
}
function evidenceGate(readings=[],sessions=[],events=[]) {
 const baseline=summarizeReadings(readings,{phase:'baseline'}),followup=summarizeReadings(readings,{phase:'followup'}),pairedGroups=['A0','A1','A2'].reduce((a,code)=>a+comparePeriods(readings,code).comparable.length,0);
 const completed=sessions.filter(s=>s.source==='manual'&&s.status==='Selesai').length;
 return {completed,baselineCount:baseline.samples,followupCount:followup.samples,pairedGroups,manualEvents:events.filter(e=>e.source==='manual').length,
  targetSessions:12, // proposed survey plan, not verified performance target
  checks:[{label:'Sesi observasi manual selesai',value:`${completed}/12`,met:completed>=12},
   {label:'Interval baseline berisi antrean dan akses',value:`${baseline.samples} interval`,met:baseline.samples>=2},
   {label:'Data pembanding sesudah intervensi',value:`${followup.samples} interval`,met:followup.samples>=2},
   {label:'Zona dan periode berpasangan',value:`${pairedGroups} pasangan skenario–zona–periode`,met:pairedGroups>0},
   {label:'Kalibrasi SUMO terhadap lapangan',value:'Belum terverifikasi',met:false}]
 };
}
function screenScenario(results,criteria={}) {
 const candidates=results?.scenarios||[],maxQueue=Number(criteria.maxQueue??15),maxDetour=Number(criteria.maxDetour??150);
 const ranked=candidates.map(s=>({ ...s, passesQueue:s.queue<=maxQueue,passesAccess:s.access<=maxDetour,eligible:s.queue<=maxQueue&&s.access<=maxDetour,
   caveat:results?.engine==='heuristic'?'Hanya screening model ilustratif': 'Keluaran simulator memerlukan validasi koridor' }));
 return ranked.sort((a,b)=>Number(b.eligible)-Number(a.eligible)||a.delay-b.delay);
}


// SOURCE MODULE: js/util.js
const rupiah=n=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n)||0);
const compact=n=>new Intl.NumberFormat('id-ID',{notation:'compact',maximumFractionDigits:1}).format(Number(n)||0);
const num=n=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:1}).format(Number(n)||0);
const pct=n=>(Number(n)||0).toFixed(1).replace('.',',')+'%';
const shortDate=s=>new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(s));
const clock=s=>new Intl.DateTimeFormat('id-ID',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Asia/Jakarta'}).format(new Date(s));
const safe=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const clamp=(x,min,max)=>Math.min(max,Math.max(min,Number(x)||0));
const uid=(prefix='id')=>`${prefix}-${Math.random().toString(36).slice(2,10)}`;
function download(name,content,mime='application/json'){const blob=new Blob([content],{type:mime});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(link.href),3000)}
const nowIso=()=>new Date().toISOString();
const isDemo=s=>s?.source==='demo';
function icon(name,size=20){
const paths={
 'cpu':'<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 9h6v6H9zM9 1v4m6-4v4M9 19v4m6-4v4M19 9h4m-4 6h4M1 9h4m-4 6h4"/>',
 'plug-zap':'<path d="M12 3v7l-3 2 4 1-2 8 6-11-4-1 1-6M5 5l3 3m11-3-3 3"/>',
 'clipboard-list':'<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4a3 3 0 0 1 6 0M9 10h6M9 14h6M9 18h4"/>',
 'layout-dashboard':'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
 'scan-line':'<path d="M4 7V5a2 2 0 0 1 2-2h3M15 3h3a2 2 0 0 1 2 2v2M20 17v2a2 2 0 0 1-2 2h-3M9 21H6a2 2 0 0 1-2-2v-2M4 12h16"/>',
 'git-compare-arrows':'<path d="M3 6h17M20 6l-3-3M20 6l-3 3M21 18H4m0 0 3-3m-3 3 3 3"/>',
 'brain-circuit':'<path d="M12 18V5a3 3 0 0 0-6 0 3 3 0 0 0-2 5 4 4 0 0 0 0 7 3 3 0 0 0 5 3l3-2Zm0 0V5a3 3 0 0 1 6 0 3 3 0 0 1 2 5 4 4 0 0 1 0 7 3 3 0 0 1-5 3l-3-2Z"/>',
 'chart-no-axes-combined':'<path d="m3 17 6-6 4 4 8-8M17 7h4v4M3 3v18h18"/>',
 'users':'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
 'smartphone':'<rect x="5" y="2" width="14" height="20" rx="3"/><path d="M11 18h2"/>',
 'map':'<path d="M3 5 9 3l6 3 6-2v15l-6 2-6-3-6 2V5ZM9 3v15m6-12v15"/>',
 'file-text':'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 0v6h6M8 13h8M8 17h8"/>',
 'files':'<path d="M6 3h9l4 4v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM14 3v5h5M8 13h8M8 17h7"/>',
 'settings-2':'<path d="M4 7h16M4 17h16M8 4v6M16 14v6"/>',
 'arrow-right':'<path d="M5 12h14m-6-6 6 6-6 6"/>',
 'arrow-up-right':'<path d="M7 17 17 7M7 7h10v10"/>',
 'chevron-right':'<path d="m9 18 6-6-6-6"/>',
 'chevron-down':'<path d="m6 9 6 6 6-6"/>',
 'plus':'<path d="M12 5v14M5 12h14"/>',
 'play':'<path d="m8 5 11 7-11 7V5Z"/>',
 'clock':'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 'map-pin':'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0ZM12 10h.01"/>',
 'shield-check':'<path d="M12 2 4 5v6c0 5.5 4 9 8 11 4-2 8-5.5 8-11V5l-8-3Zm-4 10 3 3 5-6"/>',
 'activity':'<path d="M2 12h4l3-7 5 14 3-7h5"/>',
 'car':'<path d="m5 11 2-6h10l2 6M4 11h16v7H4zm2 7v2m12-2v2M7 14h.01M17 14h.01"/>',
 'route':'<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h6"/>',
 'target':'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 'check':'<path d="m5 12 4 4L19 6"/>',
 'alert-circle':'<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 17h.01"/>',
 'info':'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
 'download':'<path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4"/>',
 'refresh-cw':'<path d="M20 7v5h-5M4 17v-5h5M6 9a7 7 0 0 1 12-2l2 5M4 12l2 5a7 7 0 0 0 12-2"/>',
 'more-horizontal':'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
 'menu':'<path d="M3 6h18M3 12h18M3 18h18"/>',
 'x':'<path d="M5 5 19 19M19 5 5 19"/>',
 'search':'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
 'calculator':'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M7 6h10v4H7zm1 8h1m4 0h1m4 0h.01M8 18h1m4 0h1m4 0h.01"/>',
 'layers':'<path d="m12 2 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
 'database':'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 4 18 4 18 0V5M3 12c0 4 18 4 18 0"/>',
 'cloud':'<path d="M20 17a4 4 0 0 0-1-7.87A7 7 0 0 0 5 10a4 4 0 0 0 0 8h13"/>',
 'external-link':'<path d="M13 5h6v6M19 5l-9 9M19 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4"/>',
 'trash-2':'<path d="M3 6h18M8 6V4h8v2m3 0-1 15H6L5 6m5 4v7m4-7v7"/>',
 'filter':'<path d="M3 4h18l-7 8v8l-4-2v-6L3 4Z"/>',
 'copy':'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
 'sliders-horizontal':'<path d="M4 7h16M4 17h16M9 4v6M15 14v6"/>',
 'file-check':'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 0v6h6M8 15l3 3 5-6"/>',
 'wifi-off':'<path d="M2 2l20 20M8 9a11 11 0 0 1 9-1M4 12a17 17 0 0 1 6-3m4 4a6 6 0 0 1 4 2M12 20h.01"/>',
 'sparkles':'<path d="m12 3 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6ZM20 17v5m-2-3h4"/>'};
return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.info}</svg>`;
}


// SOURCE MODULE: js/views/shared.js

const pageHead=(eyebrow,title,description,actions='')=>`<header class="main-head"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${description}</p></div>${actions?`<div class="head-buttons">${actions}</div>`:''}</header>`;
const note=(body,kind='')=>`<div class="banner-note ${kind}">${icon(kind==='warning'?'alert-circle':'info',17)}<div>${body}</div></div>`;
const cardHeading=(title,description='',right='')=>`<header class="card-title"><div><h2>${title}</h2>${description?`<p>${description}</p>`:''}</div>${right}</header>`;
const button=(text,action,klass='')=>`<button type="button" class="btn ${klass}" data-action="${action}">${text}</button>`;
const tag=(text,klass='')=>`<span class="tag ${klass}">${safe(text)}</span>`;
const statCard=(ico,label,value,foot,variant='')=>`<article class="card"><div class="stat-top"><div class="stat-icon ${variant}">${icon(ico,19)}</div>${tag('PROYEK DEMO','slate')}</div><div class="stat-label">${label}</div><div class="stat-value">${value}</div><div class="stat-foot">${foot}</div></article>`;
const emptyState=(title,description,action='')=>`<div class="no-data"><div class="empty-icon">${icon('database',22)}</div><strong>${title}</strong><div>${description}</div>${action?`<div style="margin-top:17px">${action}</div>`:''}</div>`;
const rangeField=(id,label,min,max,val,step=1,suffix='')=>`<div class="field"><label for="${id}">${label}</label><div class="slider-row"><input id="${id}" class="scenario-input" type="range" min="${min}" max="${max}" step="${step}" value="${val}"/><strong data-range-out="${id}">${val}${suffix}</strong></div><div class="range-help"><span>${min}${suffix}</span><span>${max}${suffix}</span></div></div>`;
const numberField=(id,label,value,step=1,desc='',min=0)=>`<div class="field"><label for="${id}">${label}</label><input class="control" id="${id}" type="number" min="${min}" step="${step}" value="${value}" />${desc?`<small>${desc}</small>`:''}</div>`;
const selectField=(id,label,options,selected)=>`<div class="field"><label for="${id}">${label}</label><select id="${id}" class="control">${options.map(x=>`<option value="${safe(x)}" ${selected===x?'selected':''}>${safe(x)}</option>`).join('')}</select></div>`;


// SOURCE MODULE: js/views/diagnosis.js




const fmtDiag=x=>x===null||x===undefined?'—':num(x);
const viewDate=x=>{try{return `${shortDate(x)} · ${clock(x)} WIB`;}catch{return '—'}};
const warnings=(flags)=>flags.length?flags.map(x=>`<div class="dia-alert ${x.kind}">${icon(x.kind==='missing'?'alert-circle':'alert-triangle',18)}<div><strong>${safe(x.title)}</strong><p>${safe(x.detail)}</p></div></div>`).join(''):'<div class="dia-alert positive">Belum ada indikator masalah pada data yang tercatat. Ini bukan bukti bahwa koridor bebas hambatan.</div>';
function bars(groups){if(!groups.length)return `<div class="dia-empty">Belum ada baseline. Input interval lapangan untuk melihat zona yang memerlukan perhatian.</div>`;
 const max=Math.max(1,...groups.map(x=>x.stopPerHour||0));return `<div class="dia-zones">${groups.map(g=>`<div class="dia-zone"><div class="dia-zone-head"><strong>${safe(g.zone)}</strong><span>${g.samples} interval · ${fmtDiag(g.minutes)} menit</span></div><div class="dia-bar-wrap"><div class="dia-bar" style="width:${Math.max(1,Math.round(100*(g.stopPerHour||0)/max))}%"></div></div><div class="dia-zone-meta"><span>Berhenti: ${fmtDiag(g.stopPerHour)} kejadian/jam</span><span>Antrean maks.: ${fmtDiag(g.peakQueue)} kendaraan</span><span>Okupansi ruang: ${fmtDiag(g.avgBayOccupancy)}${g.avgBayOccupancy===null?'':'%'}</span></div></div>`).join('')}</div>`}
function renderDiagnosis(){
 const s=getState(),d=diagnose(s.fieldReadings,s.observations,s.fieldSettings),gate=evidenceGate(s.fieldReadings,s.sessions,s.observations),b=d.base,f=d.full;
 return `${pageHead('ANALISIS / IDENTIFIKASI HAMBATAN','Diagnosis Hambatan','Telusuri sumber hambatan kendaraan yang menjemput, menurunkan, dan menunggu penumpang berdasarkan interval observasi.',`${button(`${icon('plus',16)} Tambah interval`,'add-field-reading','primary')} ${button(`${icon('download',15)} Ekspor CSV`,'export-field-readings')}`)}
<section class="dia-hero"><div><span class="dia-kicker">MENGAPA SIMPUL DIBUTUHKAN</span><h2>Titik jemput dapat padat.<br/><em>Akses menuju MRT harus tetap terjaga.</em></h2><p>Periksa hubungan antara aktivitas berhenti, ketersediaan ruang tepi jalan, antrean, dan hambatan akses pejalan kaki sebelum menguji A0, A1, dan A2.</p><div class="dia-hero-actions">${button('Catat pengukuran interval','add-field-reading','light')} ${button('Evaluasi alternatif','goto-evaluation','outline-light')}</div></div><div class="dia-chain"><div><small>01 / INPUT</small><b>Kendaraan berhenti</b><span>jumlah, durasi, titik kejadian</span></div>${icon('arrow-down',17)}<div><small>02 / KONDISI</small><b>Ruang & antrean</b><span>kapasitas zona, antrean maksimum</span></div>${icon('arrow-down',17)}<div><small>03 / DAMPAK</small><b>Akses ke MRT</b><span>jarak tempuh & hambatan pejalan</span></div></div></section>
${note('<strong>Makna angka:</strong> baseline di bawah hanya menghitung interval yang dimasukkan manual. Data demo delapan kejadian dari versi awal <strong>tidak</strong> digunakan dalam statistik lapangan ini. Jumlah berhenti per jam adalah normalisasi durasi pengamatan, bukan pengukuran tundaan kendaraan atau bukti sebab-akibat.')}
<div class="dia-stats"><article class="dia-stat"><span>INTERVAL BASELINE</span><strong>${b.samples}</strong><small>${fmtDiag(b.minutes)} menit pengamatan</small></article><article class="dia-stat"><span>AKTIVITAS BERHENTI</span><strong>${fmtDiag(b.stopPerHour)}</strong><small>kejadian/jam, manual</small></article><article class="dia-stat"><span>ANTREAN MAKSIMUM</span><strong>${fmtDiag(b.peakQueue)}</strong><small>kendaraan pada interval</small></article><article class="dia-stat"><span>AKSES TERHAMBAT</span><strong>${fmtDiag(b.blockedPercent)}${b.blockedPercent===null?'':'%'}</strong><small>proporsi interval teramati</small></article></div>
<div class="dia-grid"><section class="dia-panel"><div class="dia-panel-head"><div><span class="dia-kicker dark">HOTSPOT / DURASI-TERNORMALISASI</span><h3>Perbandingan aktivitas per zona</h3><p>Hanya fase sebelum intervensi. Zona dengan durasi observasi berbeda dibandingkan menggunakan kejadian/jam.</p></div>${tag('BASELINE','blue')}</div>${bars(d.groups)}</section>
<section class="dia-panel"><div class="dia-panel-head"><div><span class="dia-kicker dark">MEKANISME / FIELD EVIDENCE</span><h3>Indikator yang perlu ditindaklanjuti</h3><p>Ambang durasi ditetapkan tim untuk analisis, bukan regulasi.</p></div></div><div class="dia-alerts">${warnings(d.warnings)}</div><div class="dia-threshold"><label for="field-dwell-threshold">Ambang durasi berhenti <strong>${fmtDiag(d.threshold)} detik</strong></label><input id="field-dwell-threshold" class="control" type="number" min="5" max="600" step="5" value="${d.threshold}" /></div></section></div>
<section class="dia-panel dia-hypotheses"><div class="dia-panel-head"><div><span class="dia-kicker dark">DIAGNOSIS → ACTIONABLE HYPOTHESIS</span><h3>Langkah analisis yang disarankan</h3><p>Aturan transparan dari data yang tersedia; bukan rekomendasi AI atau keputusan rekayasa final.</p></div>${button('Buka perbandingan alternatif','goto-evaluation','primary')}</div><div class="dia-hypothesis-grid">${d.hypotheses.map(h=>`<article class="dia-hypothesis"><span>${safe(h.id)} / HIPOTESIS KERJA</span><strong>${safe(h.title)}</strong><p>${safe(h.basis)}</p><div><small>Tindakan berikutnya</small><b>${safe(h.next)}</b></div><em>${safe(h.scenario)}</em></article>`).join('')}</div></section>
<div class="dia-grid dia-data-grid"><section class="dia-panel"><div class="dia-panel-head"><div><span class="dia-kicker dark">REKAMAN LAPANGAN</span><h3>Ledger interval pengamatan</h3><p>Fase baseline dan tindak lanjut dicatat terpisah; semua berasal dari input manusia.</p></div>${button(`${icon('upload-cloud',15)} Sinkronkan`,'sync-field-readings')}</div>
<div class="table-wrap"><table class="data-table dia-table"><thead><tr><th>Waktu diamati</th><th>Fase</th><th>Skenario</th><th>Zona & periode</th><th>Durasi</th><th>Lewat</th><th>Berhenti</th><th>Antrean</th><th>Akses</th><th></th></tr></thead><tbody>${[...s.fieldReadings].reverse().slice(0,35).map(r=>`<tr><td>${safe(viewDate(r.at))}</td><td>${tag(r.phase==='baseline'?'SEBELUM':'SESUDAH',r.phase==='baseline'?'blue':'')}</td><td>${safe(r.scenario||'Tidak ditandai')}</td><td>${safe(r.zone)}<div class="dia-cell-minor">${safe(r.period)}</div></td><td>${fmtDiag(r.minutes)} mnt</td><td>${fmtDiag(r.passingVehicles)}</td><td>${fmtDiag(r.stoppedVehicles)}</td><td>${fmtDiag(r.maxQueue)}</td><td>${fmtDiag(r.accessMeters)} m</td><td><button class="btn sm" data-action="delete-field-reading" data-id="${safe(r.id)}" title="Hapus interval">${icon('trash-2',14)}</button></td></tr>`).join('')}</tbody></table>${!s.fieldReadings.length?'<div class="dia-empty">Belum ada interval pengamatan. Mulai dari mencatat volume, antrean, dan akses pada satu zona.</div>':''}</div></section>
<section class="dia-panel"><div class="dia-panel-head"><div><span class="dia-kicker dark">KELENGKAPAN BUKTI</span><h3>Evidence readiness</h3><p>Target proposal 12 sesi terpisah dari jumlah interval.</p></div></div><div class="dia-readiness">${gate.checks.map(c=>`<div class="dia-check"><span class="dia-check-icon ${c.met?'met':''}">${icon(c.met?'check':'circle-dashed',15)}</span><div><strong>${safe(c.label)}</strong><small>${safe(c.value)}</small></div></div>`).join('')}</div><div class="dia-gate-note">Belum memenuhi semua pemeriksaan bukan berarti studi gagal. Artinya kesimpulan belum layak diperlakukan sebagai rekomendasi operasional yang tervalidasi.</div></section></div>`
}
const fieldReadingModal=()=>`<div class="modal-header"><div><div class="eyebrow">SURVEI / INTERVAL TERUKUR</div><h2>Tambah pengamatan interval</h2></div><button class="btn sm" type="button" data-action="close-modal" aria-label="Tutup">${icon('x')}</button></div><form id="field-reading-form"><p class="helper">Masukkan hasil hitung manual untuk satu zona dan periode. Catat sebelum atau sesudah intervensi; jangan mengisi perkiraan sebagai pengamatan.</p><div class="form-grid"><div class="field"><label for="fld-observed-at">Awal interval (waktu lokal perangkat)</label><input required id="fld-observed-at" class="control" type="datetime-local" value="${new Date(Date.now()-30*60000-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16)}" /></div><div class="field"><label for="fld-phase">Fase pengamatan</label><select id="fld-phase" class="control"><option value="baseline">Sebelum intervensi (baseline)</option><option value="followup">Sesudah intervensi (follow-up)</option></select></div><div class="field"><label for="fld-scenario">Kondisi saat diamati</label><select id="fld-scenario" class="control"><option value="A0">A0 – kondisi eksisting</option><option value="A1">A1 – pemanfaatan area jemput</option><option value="A2">A2 – aturan berhenti</option></select></div><div class="field"><label for="fld-period">Periode</label><select id="fld-period" class="control">${PERIODS.map(p=>`<option>${p}</option>`).join('')}</select></div><div class="field"><label for="fld-zone">Zona</label><select id="fld-zone" class="control"><option>Zona A</option><option>Zona B</option><option>Zona C</option></select></div><div class="field"><label for="fld-minutes">Durasi pengamatan (menit)</label><input required id="fld-minutes" class="control" type="number" min="5" max="240" value="30" /></div><div class="field"><label for="fld-passing">Kendaraan lewat (unit)</label><input required id="fld-passing" class="control" type="number" min="0" max="50000" value="0" /></div><div class="field"><label for="fld-stopped">Kendaraan berhenti (unit)</label><input required id="fld-stopped" class="control" type="number" min="0" max="50000" value="0" /></div><div class="field"><label for="fld-queue">Antrean maksimum (kendaraan)</label><input required id="fld-queue" class="control" type="number" min="0" max="2000" value="0" /></div><div class="field"><label for="fld-access">Jarak/detour akses pejalan (meter)</label><input required id="fld-access" class="control" type="number" min="0" max="10000" value="0" /></div><div class="field"><label for="fld-pedestrians">Pejalan kaki teramati (orang)</label><input required id="fld-pedestrians" class="control" type="number" min="0" max="50000" value="0" /></div><div class="field"><label for="fld-blocked">Akses pejalan terhalang?</label><select id="fld-blocked" class="control"><option value="no">Tidak</option><option value="yes">Ya</option></select></div><div class="field"><label for="fld-bays">Kapasitas ruang jemput (unit, 0 = tidak diketahui)</label><input required id="fld-bays" class="control" type="number" min="0" max="1000" value="0" /></div><div class="field"><label for="fld-occupied">Ruang jemput terisi (unit)</label><input required id="fld-occupied" class="control" type="number" min="0" max="1000" value="0" /></div></div><div class="field" style="margin-top:12px"><label for="fld-note">Keterangan pengamatan</label><textarea id="fld-note" class="control" maxlength="400" placeholder="Lokasi, kondisi akses, cuaca, atau catatan pengukuran (tanpa identitas pribadi)"></textarea></div><p class="helper">Waktu pengamatan diisi sesuai awal interval; waktu penyimpanan dicatat otomatis secara terpisah. Fase sebelum harus A0; setelah pilih kondisi yang benar-benar telah diterapkan. Untuk perbandingan adil, gunakan definisi zona, metode, durasi dan periode yang konsisten. Pengamatan manual memerlukan izin serta prosedur keselamatan.</p><div class="modal-foot"><button type="button" class="btn" data-action="close-modal">Batal</button><button type="submit" class="btn primary">${icon('check',16)} Simpan interval</button></div></form>`;


// SOURCE MODULE: js/pilot.js
/**
 * Pilot survey coverage and evidence-quality rules.
 * Proposal basis: 12 sessions of 30–60 min. Zone/period allocation below is
 * a configurable planning ASSUMPTION, not a requirement dictated by the PDF.
 * All counts come from explicitly reviewed, non-synthetic manual sessions.
 */
const DEFAULT_PROTOCOL = Object.freeze({
  zones:['Zona A','Zona B','Zona C'],
  periods:['Jam sibuk','Luar jam sibuk'],
  replicates:2,
  minMinutes:30,
  maxMinutes:60
});

function normalizeProtocol(input={}) {
  const zones=Array.isArray(input.zones)?input.zones.filter(x=>DEFAULT_PROTOCOL.zones.includes(x)):DEFAULT_PROTOCOL.zones;
  const periods=Array.isArray(input.periods)?input.periods.filter(x=>DEFAULT_PROTOCOL.periods.includes(x)):DEFAULT_PROTOCOL.periods;
  const replicates=Number(input.replicates??2);
  const minMinutes=Number(input.minMinutes??30),maxMinutes=Number(input.maxMinutes??60);
  if(!zones.length || !periods.length || !Number.isInteger(replicates)||replicates<1||replicates>5||
     !Number.isInteger(minMinutes)||!Number.isInteger(maxMinutes)||minMinutes<5||maxMinutes>240||maxMinutes<minMinutes) {
    throw new Error('Protokol survei tidak valid. Periksa zona, periode, replikasi, dan batas menit.');
  }
  return {zones:[...new Set(zones)],periods:[...new Set(periods)],replicates,minMinutes,maxMinutes};
}
function sessionQuality(session,review,events=[],protocol=DEFAULT_PROTOCOL) {
  const reasons=[];
  if(session?.source!=='manual')reasons.push('Bukan sesi manual');
  if(!protocol.zones.includes(session?.zone))reasons.push('Zona tidak tercakup protokol');
  if(!protocol.periods.includes(session?.period))reasons.push('Periode belum diberi label');
  const start=Date.parse(session?.startedAt??''),end=Date.parse(session?.endedAt??'');
  const duration=Number.isFinite(start)&&Number.isFinite(end)?(end-start)/60000:null;
  if(duration===null||duration<=0)reasons.push('Sesi belum selesai atau timestamp tidak sah');
  else if(duration<protocol.minMinutes||duration>protocol.maxMinutes)reasons.push('Durasi di luar batas protokol');
  const sessionEvents=events.filter(x=>x.source==='manual'&&x.sessionId===session?.id);
  const inconsistent=sessionEvents.filter(x=>x.zone!==session?.zone || !Number.isFinite(Date.parse(x.at??'')) || Date.parse(x.at)<start || Date.parse(x.at)>end);
  if(inconsistent.length)reasons.push(`${inconsistent.length} kejadian terhubung memiliki zona atau waktu di luar sesi`);
  if(!sessionEvents.length && review?.zeroConfirmed!==true)reasons.push('Tidak ada kejadian; konfirmasi observasi nol secara eksplisit melalui review.');
  if(review?.status!=='approved')reasons.push('Belum disetujui melalui peninjauan internal');
  if(review?.status==='approved'&&!String(review?.reviewer||'').trim())reasons.push('Label peninjau tidak ada');
  return {accepted:!reasons.length,minutes:duration,events:sessionEvents.length,reasons};
}
function surveyCoverage(state) {
  const protocol=normalizeProtocol(state.surveyProtocol||DEFAULT_PROTOCOL);
  const reviews=state.sessionReviews||{};
  const observations=state.observations||[];
  const rows=(state.sessions||[]).filter(s=>s.source==='manual').map(session=>({
    session,...sessionQuality(session,reviews[session.id],observations,protocol)
  }));
  const slots=[];
  for(const zone of protocol.zones)for(const period of protocol.periods){
    const eligible=rows.filter(r=>r.accepted&&r.session.zone===zone&&r.session.period===period);
    slots.push({zone,period,target:protocol.replicates,completed:Math.min(eligible.length,protocol.replicates),available:eligible.length});
  }
  const target=slots.reduce((s,r)=>s+r.target,0);
  const completed=slots.reduce((s,r)=>s+r.completed,0);
  const pending=rows.filter(r=>!r.accepted).length;
  const issues=[];
  if(!completed)issues.push('Belum ada sesi manual yang memenuhi protokol dan ditinjau internal.');
  if(completed<target)issues.push(`${target-completed} slot observasi masih belum terpenuhi.`);
  if(pending)issues.push(`${pending} sesi manual belum memenuhi seluruh kriteria.`);
  const baseline=(state.fieldReadings||[]).filter(r=>r.source==='manual'&&r.phase==='baseline').length;
  if(!baseline)issues.push('Belum ada interval baseline manual untuk kalibrasi lalu lintas.');
  return {protocol,slots,rows,target,completed,pending,baseline,coveragePct:target?Math.round(completed/target*100):0,issues,
    // A complete survey schedule is *not* sufficient to validate a digital twin.
    surveyReady:completed===target&&baseline>0,
    calibrationVerified:false};
}
function exportSurveyCoverage(state){
  const c=surveyCoverage(state);
  return {schema:'simpul.survey_coverage.v1',generatedAt:new Date().toISOString(),projectId:state.project?.id||null,
    scope:'Local planning and review only; not evidence of third-party approval or SUMO validation.',
    protocol:c.protocol,slots:c.slots,summary:{target:c.target,completed:c.completed,coveragePct:c.coveragePct,baselineIntervals:c.baseline,calibrationVerified:false},
    sessionAssessments:c.rows.map(r=>({id:r.session.id,zone:r.session.zone,period:r.session.period,
      startedAt:r.session.startedAt,endedAt:r.session.endedAt,minutes:r.minutes,eventCount:r.events,
      accepted:r.accepted,reviewStatus:state.sessionReviews?.[r.session.id]?.status||'pending',reasons:r.reasons}))};
}


// SOURCE MODULE: js/views/survey.js





const minutes=v=>v===null?'—':`${Number(v).toFixed(1)} menit`;
const progress=(done,target)=>`<div class="pilot-progress"><span style="width:${target?Math.min(100,Math.round(100*done/target)):0}%"></span></div>`;
function renderSurvey(){
 const s=getState(),r=surveyCoverage(s);
 return `${pageHead('PILOT OPERATIONS / DATA COLLECTION','Rencana Survei & Coverage',
  'Pastikan 12 sesi observasi yang direncanakan benar-benar mencakup zona dan periode yang diperlukan sebelum kalibrasi.',
  `${button(`${icon('download',15)} Ekspor matriks`,'export-survey','')} ${button(`${icon('scan-line',15)} Mulai pencatatan`,'goto-observation','primary')}`)}
 <section class="pilot-hero"><div><div class="pilot-kicker">SI BRIDGES / EVIDENCE-FIRST FIELDWORK</div><h2>Pengamatan yang terencana menghasilkan perbandingan yang lebih dapat diuji.</h2><p>Proposal merencanakan 12 sesi, masing-masing 30–60 menit. Distribusi 3 zona × 2 periode × 2 pengulangan di bawah adalah <strong>asumsi rencana kerja yang dapat disesuaikan</strong>, bukan ketentuan proposal.</p></div><div class="pilot-meter"><small>CAKUPAN YANG DITINJAU INTERNAL</small><strong>${r.completed}<span> / ${r.target}</span></strong>${progress(r.completed,r.target)}<small>${r.coveragePct}% slot terpenuhi</small></div></section>
 ${note('<strong>Status validasi:</strong> peninjauan sesi di halaman ini adalah pemeriksaan internal pengguna aplikasi, bukan validasi oleh otoritas transportasi. Kelengkapan sesi juga tidak membuktikan bahwa model SUMO sudah terkalibrasi.')}
 <div class="pilot-stats"><div><span>Sesi memenuhi kriteria</span><strong>${r.completed}</strong><small>Dari ${r.target} slot rencana</small></div><div><span>Perlu pemeriksaan</span><strong>${r.pending}</strong><small>Sesi manual belum dapat dihitung</small></div><div><span>Interval baseline</span><strong>${r.baseline}</strong><small>Pengukuran manual per interval</small></div><div><span>Kesiapan survei</span><strong class="pilot-compact">${r.surveyReady?'Cakupan lengkap':'Belum lengkap'}</strong><small>Kalibrasi SUMO tetap diperlukan</small></div></div>
 <div class="pilot-grid"><section class="card">${cardHeading('Matriks cakupan studi','Setiap sel memerlukan sesi selesai, durasi sesuai, serta review internal.')}
 <div class="table-wrap"><table class="data-table"><thead><tr><th>Zona</th><th>Periode</th><th>Target</th><th>Diterima</th><th>Status</th></tr></thead><tbody>
 ${r.slots.map(slot=>`<tr><td><strong>${safe(slot.zone)}</strong></td><td>${safe(slot.period)}</td><td>${slot.target}</td><td>${slot.completed}</td><td>${tag(slot.completed>=slot.target?'Lengkap':'Belum lengkap',slot.completed>=slot.target?'':'gold')}</td></tr>`).join('')}
 </tbody></table></div><p class="helper">Sesi lebih dari target pada satu sel tidak dapat menggantikan sesi yang masih kurang di zona/periode lain. Data demo tidak dihitung.</p></section>
 <section class="card">${cardHeading('Konfigurasi protokol','Ubah replikasi dan durasi sebelum pelaksanaan survei.',tag('ASUMSI RENCANA','gold'))}
 <form id="survey-protocol-form" class="pilot-form"><div class="field"><label for="survey-replicates">Pengulangan per kombinasi zona–periode</label><input class="control" id="survey-replicates" type="number" min="1" max="5" step="1" value="${r.protocol.replicates}" required/></div><div class="form-grid"><div class="field"><label for="survey-min">Durasi minimal (menit)</label><input class="control" id="survey-min" type="number" min="5" max="240" value="${r.protocol.minMinutes}" required/></div><div class="field"><label for="survey-max">Durasi maksimal (menit)</label><input class="control" id="survey-max" type="number" min="5" max="240" value="${r.protocol.maxMinutes}" required/></div></div><button type="submit" class="btn primary">${icon('save',15)} Simpan protokol</button></form>
 <div class="pilot-guidance"><strong>${icon('clipboard-list',16)} Hal yang belum terpenuhi</strong><ul>${r.issues.length?r.issues.map(x=>`<li>${safe(x)}</li>`).join(''):'<li>Cakupan survei dan interval baseline terpenuhi. Lanjutkan kalibrasi dan validasi terpisah.</li>'}</ul></div></section></div>
 <section class="card">${cardHeading('Daftar sesi & pemeriksaan','Hanya sesi manual yang dapat ditinjau dan dihitung sebagai cakupan.',tag(`${r.rows.length} SESI MANUAL`,'slate'))}
 ${r.rows.length?`<div class="table-wrap"><table class="data-table"><thead><tr><th>Sesi</th><th>Zona / periode</th><th>Durasi</th><th>Kejadian</th><th>Review</th><th>Catatan kualitas</th><th></th></tr></thead><tbody>${[...r.rows].reverse().map(q=>`<tr><td><strong>${safe(q.session.id)}</strong><small style="display:block;color:#7b8795">${safe(q.session.startedAt||'')}</small></td><td>${safe(q.session.zone||'—')}<small style="display:block">${safe(q.session.period||'Belum dilabeli')}</small></td><td>${minutes(q.minutes)}</td><td>${q.events}</td><td>${tag(s.sessionReviews?.[q.session.id]?.status||'pending',q.accepted?'':'gold')}</td><td>${q.reasons.length?safe(q.reasons.join(' · ')):'Memenuhi aturan kualitas internal'}</td><td><button class="btn sm" data-action="review-survey-session" data-id="${safe(q.session.id)}">Periksa</button></td></tr>`).join('')}</tbody></table></div>`:emptyState('Belum ada sesi manual','Mulai sesi melalui halaman Observasi. Sesi demo tidak dihitung.')}
 </section>`;
}
function reviewSessionModal(session,quality,record={}){
 return `<div class="modal-header"><div><div class="eyebrow">SURVEY QUALITY / INTERNAL REVIEW</div><h2>Periksa sesi ${safe(session.id)}</h2></div><button type="button" class="btn sm" data-action="close-modal">${icon('x')}</button></div>
 <form id="survey-review-form"><input type="hidden" id="survey-review-id" value="${safe(session.id)}"/><p class="helper">${safe(session.zone)} / ${safe(session.period||'Periode tidak diketahui')} · ${quality.minutes===null?'Durasi belum diketahui':minutes(quality.minutes)} · ${quality.events} kejadian.</p>
 <div class="field"><label for="survey-review-status">Hasil peninjauan</label><select class="control" id="survey-review-status"><option value="pending" ${record.status==='pending'?'selected':''}>Belum dinilai</option><option value="approved" ${record.status==='approved'?'selected':''}>Diterima untuk matriks</option><option value="rejected" ${record.status==='rejected'?'selected':''}>Perlu observasi ulang</option></select></div>
 <div class="field" style="margin-top:12px"><label for="survey-reviewer">Label pemeriksa internal</label><input class="control" maxlength="80" id="survey-reviewer" value="${safe(record.reviewer||'')}" placeholder="Contoh: koordinator survei" required/></div>
 <div class="field" style="margin-top:12px"><label class="class-check"><input type="checkbox" id="survey-zero" ${record.zeroConfirmed===true?'checked':''}/> Saya telah memastikan tidak ada kejadian selama sesi (jika hitungan 0)</label></div>
 <div class="field" style="margin-top:12px"><label for="survey-review-note">Dasar pemeriksaan / kualitas bukti</label><textarea class="control" id="survey-review-note" maxlength="500" placeholder="Tuliskan alasan menerima/menolak, misalnya gangguan pengamatan atau pengukuran nol." required>${safe(record.note||'')}</textarea></div>
 ${quality.reasons.length?`<div class="pilot-warning">${quality.reasons.map(x=>`<p>${safe(x)}</p>`).join('')}</div>`:''}
 <p class="helper">Status diterima tidak akan dihitung jika durasi, zona, atau periode tidak sesuai. Review ini bukan tanda tangan otoritas.</p>
 <div class="modal-foot"><button type="button" class="btn" data-action="close-modal">Batal</button><button type="submit" class="btn primary">Simpan pemeriksaan</button></div></form>`;
}


// SOURCE MODULE: js/classification.js
/** Operational event classification for transit curbside monitoring.
 * This is deterministic triage, never an automated legal violation finding.
 * Unknown fields remain unknown; no personal identifiers are used.
 */
const ZONE_CONTEXT = Object.freeze({
  unknown:'Rambu / fungsi area belum diperiksa',
  designated_pickup:'Area naik-turun yang ditetapkan (perlu verifikasi)',
  general_road:'Tepi jalan umum',
  signed_no_stopping:'Rambu larangan berhenti teramati',
  signed_no_parking:'Rambu larangan parkir teramati'
});
const IMPACT_STATUS = Object.freeze({unknown:'Belum diperiksa',yes:'Teramati',no:'Tidak teramati'});
const REVIEW_STATUS = Object.freeze({
  pending:'Belum ditinjau',
  needs_evidence:'Bukti tambahan diperlukan',
  context_reviewed:'Konteks telah ditinjau',
  field_check:'Perlu pemeriksaan lapangan',
  closed:'Ditutup (catatan internal)'
});
const EVENT_TYPES = Object.freeze({Jemput:'Penjemputan',Turun:'Penurunan',Menunggu:'Menunggu penumpang'});
const PRIORITY = Object.freeze({P1:'P1 · Periksa keselamatan',P2:'P2 · Tinjau hambatan',P3:'P3 · Observasi berulang',P4:'P4 · Pemantauan rutin'});
const TERNARY=new Set(['yes','no','unknown']);
const normalizeSignal=value=>TERNARY.has(value)?value:'unknown';
function classifyTrafficEvent(event,review=null){
  const context=Object.hasOwn(ZONE_CONTEXT,event?.zoneContext)?event.zoneContext:'unknown';
  const lane=normalizeSignal(event?.laneBlocked),pedestrian=normalizeSignal(event?.pedestrianBlocked),queue=normalizeSignal(event?.queueObserved);
  const duration=Number(event?.duration)||0;
  const signVerified=event?.signageVerified===true && Boolean(String(event?.evidenceReference||'').trim());
  let priority='P4',cause='Belum ada dampak terkonfirmasi; pemantauan rutin.';
  if(pedestrian==='yes') {priority='P1';cause='Akses pejalan kaki dilaporkan terhalang. Perlu pemeriksaan keselamatan.';}
  else if(lane==='yes'||queue==='yes'){priority='P2';cause='Hambatan lajur atau antrean dilaporkan teramati.';}
  else if(event?.type==='Menunggu'&&duration>=120){priority='P3';cause='Durasi menunggu panjang; evaluasi pola dan kapasitas penjemputan.';}
  let ruleFlag='unknown',ruleDescription='Belum cukup bukti mengenai aturan yang berlaku pada titik dan waktu pengamatan.';
  if(context==='signed_no_stopping'&&signVerified){ruleFlag='review_rule';ruleDescription='Ada catatan rambu larangan berhenti terverifikasi oleh pengamat; pemeriksaan konteks dan kewenangan tetap diperlukan.';}
  else if(context==='signed_no_parking'&&signVerified){ruleFlag='interpretation_needed';ruleDescription='Rambu larangan parkir tercatat; aktivitas berhenti/menunggu tidak boleh otomatis disamakan dengan parkir.';}
  else if(context==='designated_pickup'&&signVerified){ruleFlag='area_documented';ruleDescription='Area penjemputan tercatat, namun kesesuaian perilaku tetap membutuhkan pemeriksaan aturan setempat.';}
  else if(context!=='unknown' && !signVerified){ruleDescription='Konteks lokasi dicatat tetapi belum didukung referensi rambu/fasilitas yang diperiksa.';}
  return {
    eventId:String(event?.id||''),activity:EVENT_TYPES[event?.type]||'Aktivitas lain',
    zone:String(event?.zone||'Tidak diketahui'),source:event?.source==='manual'?'manual':'demo',
    priority,priorityLabel:PRIORITY[priority],priorityReason:cause,
    context,contextLabel:ZONE_CONTEXT[context],ruleFlag,ruleDescription,
    impact:{lane,pedestrian,queue},
    evidenceStatus:event?.source!=='manual'?'SYNTHETIC':signVerified?'CONTEXT_RECORDED':'FIELD_UNVERIFIED',
    reviewStatus:REVIEW_STATUS[review?.status]?review.status:'pending',
    reviewLabel:REVIEW_STATUS[review?.status]||REVIEW_STATUS.pending,
    legalConclusion:'NOT_DETERMINED'
  };
}
function classifyTrafficDataset(observations=[],reviews={}){
  return observations.map(event=>({event,classification:classifyTrafficEvent(event,reviews?.[event.id]),review:reviews?.[event.id]||null}));
}
function trafficClassSummary(observations=[],reviews={}){
  const classified=classifyTrafficDataset(observations,reviews);
  const manual=classified.filter(x=>x.event.source==='manual');
  return {
    total:classified.length,manual:manual.length,synthetic:classified.length-manual.length,
    priorities:Object.fromEntries(['P1','P2','P3','P4'].map(p=>[p,manual.filter(x=>x.classification.priority===p).length])),
    ruleReview:manual.filter(x=>['review_rule','interpretation_needed'].includes(x.classification.ruleFlag)).length,
    pending:manual.filter(x=>x.classification.reviewStatus==='pending').length,
    reviewed:manual.filter(x=>x.classification.reviewStatus!=='pending').length
  };
}
function makePoliceReviewBundle(state){
  const records=classifyTrafficDataset(state.observations,state.eventReviews).filter(x=>x.event.source==='manual');
  return {
    schema:'simpul.operational_traffic_review.v1',generatedAt:new Date().toISOString(),
    project:{id:state.project?.id||'unknown',name:state.project?.name||'unknown'},
    purpose:'Operational traffic and pedestrian-access review only; not enforcement evidence or automated offence determination.',
    legalConclusion:'NOT_DETERMINED',
    sourcePolicy:'Manual observation records only; synthetic samples excluded. Free-text notes and personal identifiers omitted.',
    records:records.map(x=>({id:x.event.id,at:x.event.at,zone:x.event.zone,activity:x.event.type,vehicleCategory:x.event.vehicle,durationSec:x.event.duration,
      fieldContext:x.classification.context,observedImpact:x.classification.impact,
      contextReference:x.event.evidenceReference||null,signageVerifiedByObserver:x.event.signageVerified===true,
      operationalPriority:x.classification.priority,priorityReason:x.classification.priorityReason,
      ruleReviewFlag:x.classification.ruleFlag,ruleReviewExplanation:x.classification.ruleDescription,
      evidenceStatus:x.classification.evidenceStatus,reviewStatus:x.classification.reviewStatus,
      reviewedAt:x.review?.at||null,reviewerLabel:x.review?.reviewer||null,
      legalConclusion:'NOT_DETERMINED'})),
    reviewAudit:(state.classificationAudit||[]).filter(x=>records.some(r=>r.event.id===x.eventId)).map(x=>({eventId:x.eventId,at:x.at,action:x.action,status:x.status,reviewer:x.reviewer})),
    disclaimer:'Not an official police record. Review by an authorized official and verify the applicable road signs, context and jurisdiction before any enforcement action.'
  };
}


// SOURCE MODULE: js/operations.js
/** Action board: operational response, not traffic law adjudication. */

const CASE_STATUSES=Object.freeze({
  open:'Perlu ditugaskan',assigned:'Ditugaskan',checking:'Pemeriksaan lapangan',resolved:'Selesai ditindaklanjuti',dismissed:'Ditutup tanpa tindakan'
});
function actionableEvents(state){
  return (state.observations||[]).filter(e=>e.source==='manual')
    .map(event=>({event,assessment:classifyTrafficEvent(event,state.eventReviews?.[event.id])}))
    .filter(x=>['P1','P2'].includes(x.assessment.priority));
}
function operationalBoard(state,at=new Date()){
  const candidates=actionableEvents(state),events=new Map((state.observations||[]).filter(x=>x.source==='manual').map(x=>[x.id,x]));
  const cases=(state.responseCases||[]).map(record=>{
    const event=events.get(record.eventId)||null;
    const assessment=event?classifyTrafficEvent(event,state.eventReviews?.[event.id]):null;
    const overdue=Boolean(record.dueAt&&Number.isFinite(Date.parse(record.dueAt))&&Date.parse(record.dueAt)<at.getTime()&&!['resolved','dismissed'].includes(record.status));
    return {...record,event,assessment,overdue,sourceMissing:!event};
  });
  return {candidates,cases,open:cases.filter(x=>!['resolved','dismissed'].includes(x.status)).length,
    overdue:cases.filter(x=>x.overdue).length,
    unassigned:candidates.filter(c=>!cases.some(x=>x.eventId===c.event.id)).length,
    closed:cases.filter(x=>['resolved','dismissed'].includes(x.status)).length};
}
function validateCaseDraft({eventId,owner,action,dueAt},state){
  const candidate=actionableEvents(state).find(x=>x.event.id===eventId);
  if(!candidate)throw new Error('Hanya kejadian manual prioritas P1/P2 yang dapat menjadi tindak lanjut.');
  if((state.responseCases||[]).some(c=>c.eventId===eventId))throw new Error('Kejadian ini sudah memiliki catatan tindak lanjut.');
  if(String(owner||'').trim().length<2||String(action||'').trim().length<10)throw new Error('Isi penanggung jawab dan rencana tindakan minimal 10 karakter.');
  if(dueAt && (!Number.isFinite(Date.parse(dueAt))||Date.parse(dueAt)<Date.now()-60000))throw new Error('Batas tindak lanjut harus tanggal/waktu yang sah dan tidak di masa lalu.');
  return {eventId,owner:String(owner).trim().slice(0,80),action:String(action).trim().slice(0,350),dueAt:dueAt?new Date(dueAt).toISOString():null};
}
function validateCaseUpdate(record,status,reason){
  if(!record)throw new Error('Kasus operasional tidak ditemukan.');
  if(!Object.hasOwn(CASE_STATUSES,status))throw new Error('Status tindak lanjut tidak dikenal.');
  if(['resolved','dismissed'].includes(status)&&String(reason||'').trim().length<10)throw new Error('Penutupan memerlukan alasan minimal 10 karakter.');
  return {status,reason:String(reason||'').trim().slice(0,500)};
}
function exportOperations(state){
  const board=operationalBoard(state);
  return {schema:'simpul.operational_response.v1',generatedAt:new Date().toISOString(),
    notice:'Internal operational follow-up only; does not establish an offense or official police action.',
    cases:board.cases.filter(c=>!c.sourceMissing).map(c=>({id:c.id,eventId:c.eventId,eventAt:c.event.at,zone:c.event.zone,
      observedActivity:c.event.type,priority:c.assessment.priority,status:c.status,createdAt:c.createdAt,dueAt:c.dueAt,updatedAt:c.updatedAt||null,
      evidenceStatus:c.assessment.evidenceStatus,legalConclusion:'NOT_DETERMINED'})),
    statusHistory:(state.responseAudit||[]).filter(x=>board.cases.some(c=>!c.sourceMissing&&c.id===x.caseId)).map(x=>({caseId:x.caseId,eventId:x.eventId,at:x.at,status:x.status,action:x.action}))};
}


// SOURCE MODULE: js/views/operations.js




const when=v=>v?new Intl.DateTimeFormat('id-ID',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Jakarta'}).format(new Date(v)):'Belum ditentukan';
function renderOperations(){const s=getState(),b=operationalBoard(s);
 return `${pageHead('OPERATIONS / HUMAN-IN-THE-LOOP','Tindak Lanjut Hambatan','Tindak lanjuti laporan akses pejalan kaki atau hambatan lajur, dengan penanggung jawab dan jejak status.',
 `${button(`${icon('download',15)} Ekspor daftar`,'export-operations')} ${button(`${icon('plus',15)} Buat tindak lanjut`,'create-operation','primary')}`)}
 <section class="pilot-hero"><div><div class="pilot-kicker">OPERATIONAL RESPONSE / NO AUTOMATED ENFORCEMENT</div><h2>Dari temuan prioritas menuju langkah pemeriksaan yang tercatat.</h2><p>P1 menunjukkan hambatan akses pejalan kaki dan P2 hambatan lajur atau antrean yang dilaporkan. <strong>Prioritas bukan kesimpulan hukum atau instruksi penindakan.</strong></p></div><div class="pilot-meter"><small>ANTREAN TINDAK LANJUT</small><strong>${b.open}</strong><small>${b.overdue} melewati batas waktu internal</small></div></section>
 ${note('<strong>Penggunaan yang bertanggung jawab:</strong> kasus dibuat hanya dari catatan manual P1/P2. Tinjauan dan status pada halaman ini adalah catatan operasional internal, bukan laporan kepolisian resmi, bukti pelanggaran, atau alarm keselamatan real-time.')}
 <div class="pilot-stats"><div><span>Temuan P1/P2</span><strong>${b.candidates.length}</strong><small>Manual dan dapat ditinjau</small></div><div><span>Belum dialokasikan</span><strong>${b.unassigned}</strong><small>Belum memiliki kasus tindak lanjut</small></div><div><span>Dalam penanganan</span><strong>${b.open}</strong><small>Termasuk kasus menunggu penugasan</small></div><div><span>Selesai / ditutup</span><strong>${b.closed}</strong><small>Memerlukan dasar penutupan</small></div></div>
 <div class="pilot-grid"><section class="card">${cardHeading('Kasus tindak lanjut','Berdasarkan pencatatan manual dengan status yang dapat diaudit.',tag('INTERNAL','slate'))}
 ${b.cases.length?`<div class="pilot-case-list">${[...b.cases].reverse().map(c=>`<article class="pilot-case ${c.overdue?'pilot-overdue':''}"><div class="pilot-case-top"><strong>${safe(c.id)}</strong>${tag(CASE_STATUSES[c.status]||c.status,c.overdue?'gold':'slate')}</div><p>${c.event?safe(c.event.type+' · '+c.event.zone):'SUMBER KEJADIAN TIDAK TERSEDIA'} · ${safe(c.assessment?.priority||'N/A')}</p><small>Penanggung jawab: ${safe(c.owner)} · Tenggat internal: ${safe(when(c.dueAt))}</small><div class="pilot-case-foot"><span>${safe(c.action)}</span><button type="button" class="btn sm" data-action="update-operation" data-id="${safe(c.id)}">Ubah status</button></div>${c.sourceMissing?'<div class="pilot-warning">Sumber telah dihapus. Tidak dapat diverifikasi secara mandiri.</div>':''}</article>`).join('')}</div>`:emptyState('Belum ada tindak lanjut','Buat catatan dari temuan manual P1/P2 setelah pemeriksaan awal.')}
 </section><section class="card">${cardHeading('Temuan yang menunggu tindak lanjut','Prioritas dihitung secara deterministik dari indikator dampak yang dicatat pengamat.')}
 ${b.candidates.length?`<div class="pilot-queue">${b.candidates.map(x=>`<div class="pilot-queue-row"><div><strong>${safe(x.assessment.priority)} · ${safe(x.event.type)}</strong><small>${safe(x.event.zone)} · ${safe(x.event.id)}</small><p>${safe(x.assessment.priorityReason)}</p></div>${b.cases.some(c=>c.eventId===x.event.id)?tag('SUDAH DITUGASKAN','slate'):`<button class="btn sm" data-action="create-operation" data-id="${safe(x.event.id)}">Tindak lanjuti</button>`}</div>`).join('')}</div>`:emptyState('Tidak ada kejadian P1/P2 manual','Pencatatan demo dan kejadian tanpa dampak tidak masuk antrean tindak lanjut.')}
 </section></div><div class="pilot-guidance"><strong>${icon('shield-alert',17)} Batas operasional</strong><p>Modul ini belum mendukung push notification, dispatch petugas, integrasi kepolisian, maupun pembuktian hukum. Tindakan nyata memerlukan pemeriksaan dan kewenangan institusi terkait. Semua data tersimpan pada browser pengguna sampai diekspor.</p></div>`;
}
function operationCreateModal(candidate,board){const available=board.candidates.filter(x=>!board.cases.some(c=>c.eventId===x.event.id));
 return `<div class="modal-header"><div><div class="eyebrow">OPERATIONS / FIELD REVIEW</div><h2>Buat tindak lanjut</h2></div><button type="button" class="btn sm" data-action="close-modal">${icon('x')}</button></div><form id="operation-form"><div class="field"><label for="operation-event">Kejadian manual P1/P2</label><select id="operation-event" class="control" required>${available.map(x=>`<option value="${safe(x.event.id)}" ${x.event.id===candidate?.event.id?'selected':''}>${safe(x.assessment.priority)} · ${safe(x.event.zone)} · ${safe(x.event.id)}</option>`).join('')}</select></div><div class="field" style="margin-top:12px"><label for="operation-owner">Penanggung jawab internal</label><input class="control" id="operation-owner" maxlength="80" placeholder="Contoh: tim lapangan" required/></div><div class="field" style="margin-top:12px"><label for="operation-action">Tindakan yang akan diperiksa</label><textarea class="control" id="operation-action" maxlength="350" placeholder="Contoh: Periksa hambatan akses dan ukur antrean pada slot jam yang sama." required></textarea></div><div class="field" style="margin-top:12px"><label for="operation-due">Tenggat internal (opsional)</label><input class="control" type="datetime-local" id="operation-due"/></div><p class="helper">Identitas pribadi dan nomor kendaraan tidak diperlukan. Membuat kasus tidak otomatis menghubungi polisi.</p><div class="modal-foot"><button type="button" class="btn" data-action="close-modal">Batal</button><button type="submit" class="btn primary">Simpan tindak lanjut</button></div></form>`;
}
function operationUpdateModal(c){return `<div class="modal-header"><div><div class="eyebrow">OPERATIONS / STATUS HISTORY</div><h2>Perbarui ${safe(c.id)}</h2></div><button type="button" class="btn sm" data-action="close-modal">${icon('x')}</button></div><form id="operation-update-form"><input type="hidden" id="operation-case-id" value="${safe(c.id)}"/><div class="field"><label for="operation-status">Status tindak lanjut</label><select class="control" id="operation-status">${Object.entries(CASE_STATUSES).map(([key,label])=>`<option value="${key}" ${c.status===key?'selected':''}>${label}</option>`).join('')}</select></div><div class="field" style="margin-top:12px"><label for="operation-reason">Temuan, alasan perubahan atau hasil pemeriksaan</label><textarea class="control" id="operation-reason" maxlength="500" placeholder="Isi dasar pemeriksaan; wajib minimal 10 karakter jika menutup kasus."></textarea></div><p class="helper">Riwayat perubahan dipertahankan di browser. Status selesai bukan persetujuan hukum.</p><div class="modal-foot"><button type="button" class="btn" data-action="close-modal">Batal</button><button type="submit" class="btn primary">Perbarui status</button></div></form>`;}


// SOURCE MODULE: js/analytics.js

function observationStats(obs){
  const n=obs.length, total=obs.reduce((s,e)=>s+(Number(e.duration)||0),0);
  return {count:n,avgDwell:n?total/n:0,pickup:obs.filter(e=>e.type==='Jemput').length,dropoff:obs.filter(e=>e.type==='Turun').length,waiting:obs.filter(e=>e.type==='Menunggu').length,real:obs.filter(e=>e.source==='manual').length,synthetic:obs.filter(e=>e.source==='demo').length,zoneCount:new Set(obs.map(e=>e.zone)).size};
}
/** Transparent illustrative capacity/queue heuristic. NOT a SUMO simulation or validated traffic model. */
function heuristicSimulation(p){
  const t=clamp(p.traffic,100,1800), pickup=clamp(p.pickupShare,0,60)/100;
  const baselineDwell=clamp(p.dwell,5,300), redirected=clamp(p.diversion,0,100)/100;
  const ruleDwell=clamp(p.ruleDwell,5,300), pedestrianDetour=clamp(p.pedestrianDetour,0,900);
  function run(code,stopsOnRoad,dwell,detour){
    const blockHours=(t*pickup*stopsOnRoad*dwell)/3600;
    const pressure=1-Math.exp(-blockHours*0.72);
    const capacity=1450*(1-0.50*pressure);
    const ratio=t/capacity;
    // Stylized congestion curve calibrated to no field data.
    const delay=6+9*ratio/(Math.max(0.12,1-Math.min(.88,ratio)))+Math.max(0,ratio-1)*135;
    const queue=Math.max(0,Math.round((Math.max(0,t-capacity)*.09)+Math.max(0,delay-12)*.23));
    return {id:code,delay:+delay.toFixed(1),queue,capacity:Math.round(capacity),events:Math.round(t*pickup),access:Math.round(detour),estimated:true, model:'Ilustrasi matematis, bukan keluaran SUMO'};
  }
  const a0=run('A0',1,baselineDwell,pedestrianDetour),a1=run('A1',1-redirected,baselineDwell,pedestrianDetour+Math.round(redirected*65)),a2=run('A2',1,Math.min(baselineDwell,ruleDwell),pedestrianDetour);
  return {engine:'heuristic',evidence:'synthetic',createdAt:new Date().toISOString(),assumptions:{...p},scenarios:[a0,a1,a2],valid:false,message:'Hasil ilustratif dari rumus antrean sederhana. Bukan prediksi atau validasi kondisi Fatmawati; simulasi SUMO sesungguhnya membutuhkan backend dan kalibrasi data lapangan.'};
}
function compareScenarios(results){if(!results?.scenarios?.length)return null;const s=results.scenarios;const a=s.find(x=>x.id==='A0')||s[0];return s.map(x=>({...x,delayChange:a.delay?100*(x.delay-a.delay)/a.delay:0,queueChange:a.queue?100*(x.queue-a.queue)/a.queue:0}));}
function rankScenarios(results){const list=compareScenarios(results)||[];return [...list].sort((a,b)=>((a.delay/70)*.6+(a.queue/70)*.25+(a.access/400)*.15)-((b.delay/70)*.6+(b.queue/70)*.25+(b.access/400)*.15));}
function eventByType(obs){const s=observationStats(obs);return[{name:'Jemput',count:s.pickup,color:'teal'},{name:'Turun',count:s.dropoff,color:'blue'},{name:'Menunggu',count:s.waiting,color:'navy'}]}


// SOURCE MODULE: js/views/evaluation.js





const fmtEval=v=>v===null||v===undefined?'—':num(v);
const sign=v=>v===null?'—':(v>0?'+':'')+num(v);
const statusLabel={draft:'Draft internal',review:'Dalam kajian',pilot:'Pilot terencana',closed:'Ditutup'};
const scenarioNames={A0:'Kondisi eksisting',A1:'Optimasi area jemput',A2:'Aturan durasi berhenti'};
const cmpCard=(name,before,after,change,unit='',lowerBetter=true)=>{
 const trend=change===null?'unknown':change===0?'neutral':(lowerBetter?change<0:change>0)?'good':'bad';
 return `<div class="eval-comparison"><span>${name}</span><div class="eval-metrics"><strong>${fmtEval(before)} <small>${unit}</small></strong>${icon('arrow-right',15)}<strong>${fmtEval(after)} <small>${unit}</small></strong></div><div class="eval-delta ${trend}">${change===null?'Belum dapat dibandingkan':sign(change)+' '+unit+' (selisih deskriptif)'}</div></div>`;
};
function renderEvaluation(){
 const s=getState(),p=comparePeriods(s.fieldReadings,s.comparisonScenario),gate=evidenceGate(s.fieldReadings,s.sessions,s.observations),res=s.lastAnalysis||heuristicSimulation(s.scenario),options=screenScenario(res,s.fieldSettings),last=s.decisions?.at(-1),measured=p.comparableSamples;
 return `${pageHead('REKAYASA / DECISION WORKFLOW','Rencana Intervensi & Dampak','Uji alternatif penjemputan, periksa batas akses pejalan kaki, catat keputusan tim, dan bandingkan hasil setelah implementasi.',`${button(`${icon('clipboard-plus',16)} Catat keputusan tim`,'add-decision','primary')}`)}
<section class="eval-hero"><div class="eval-hero-mark">${icon('git-compare-arrows',25)}</div><div><span class="dia-kicker">PENGAMBILAN KEPUTUSAN / A0 — A2</span><h2>Kurangi hambatan kendaraan.<br/>Lindungi akses pengguna MRT.</h2><p>Alternatif yang dipilih perlu memenuhi kendala kelancaran, aksesibilitas, keselamatan, dan bukti pengamatan. Model heuristik hanya dipakai untuk screening, bukan izin implementasi.</p></div></section>
${note('<strong>Provenance:</strong> skor dan status kelayakan di bawah berasal dari parameter skenario serta ambang yang ditetapkan pengguna. Jika sumbernya heuristik atau SUMO jaringan sintetis, hasil <strong>bukan prediksi lapangan Fatmawati</strong>. Catatan keputusan tidak menggantikan persetujuan pihak berwenang.')}
<div class="eval-step-nav"><span class="active">01 · Diagnosa</span>${icon('arrow-right',14)}<span>02 · Bandingkan</span>${icon('arrow-right',14)}<span>03 · Tinjau</span>${icon('arrow-right',14)}<span>04 · Verifikasi sesudah</span></div>
<div class="eval-layout"><section class="dia-panel"><div class="dia-panel-head"><div><span class="dia-kicker dark">SCREENING / PEMBATAS</span><h3>Kriteria operasional tim</h3><p>Ini merupakan ambang studi yang dapat diubah, bukan standar teknis pemerintah.</p></div></div><div class="eval-criteria"><div class="field"><label for="guard-queue">Batas antrean maksimum (kendaraan)</label><input id="guard-queue" class="control" type="number" min="0" max="1000" value="${fmtEval(s.fieldSettings.maxQueue)}"/></div><div class="field"><label for="guard-detour">Batas akses/detour (m)</label><input id="guard-detour" class="control" type="number" min="0" max="2000" value="${fmtEval(s.fieldSettings.maxDetour)}" /></div></div><div class="eval-safety"><strong>${icon('shield-check',17)} Gerbang kualitas bukti</strong><p>${gate.completed} dari 12 sesi rencana selesai; ${gate.baselineCount} interval baseline dan ${gate.followupCount} tindak lanjut. Kalibrasi lokal SUMO belum dibuktikan.</p><div class="eval-microbar"><div style="width:${Math.min(100,Math.round(gate.completed/12*100))}%"></div></div></div></section>
<section class="dia-panel"><div class="dia-panel-head"><div><span class="dia-kicker dark">SKENARIO / PERBANDINGAN</span><h3>Mana yang layak dipelajari lebih lanjut?</h3><p>Sumber ${res.engine==='heuristic'?'rumus ilustratif':'SUMO pada jaringan uji sintetis'}, belum terkalibrasi lokasi.</p></div>${tag(res.engine==='heuristic'?'MODEL DEMO':'SUMO SINTETIS','gold')}</div>
<div class="eval-scenario-list">${options.map(a=>`<div class="eval-option ${a.eligible?'eligible':'risk'}"><div class="eval-option-title"><div><span class="eval-id">${a.id}</span><strong>${safe(scenarioNames[a.id]||a.id)}</strong></div><span class="eval-option-state">${a.eligible?'Lolos ambang input':'Perlu tinjauan'}</span></div><div class="eval-opt-metrics"><span>Delay model <strong>${fmtEval(a.delay)} dtk</strong></span><span>Antrean model <strong>${fmtEval(a.queue)}</strong></span><span>Akses model <strong>${fmtEval(a.access)} m</strong></span></div><div class="eval-option-foot">${a.eligible?'Lolos kriteria numerik yang ditetapkan, tetapi tetap memerlukan verifikasi.':'Salah satu batas antrean atau akses yang ditetapkan terlampaui.'}</div></div>`).join('')}</div><div class="form-actions">${button('Ubah simulasi A0/A1/A2','goto-simulation')}</div></section></div>
<div class="eval-section-title"><div><span class="dia-kicker dark">MEASURE / BEFORE–AFTER</span><h3>Evaluasi dampak dari pengamatan, bukan asumsi</h3></div><div class="eval-phase-actions"><label>Bandingkan A0 dengan <select class="control" id="compare-scenario"><option value="A1" ${s.comparisonScenario==='A1'?'selected':''}>A1 – area jemput</option><option value="A2" ${s.comparisonScenario==='A2'?'selected':''}>A2 – aturan berhenti</option><option value="A0" ${s.comparisonScenario==='A0'?'selected':''}>A0 – kondisi kontrol</option></select></label>${button('Rekam interval tindak lanjut','add-field-reading','primary')}</div></div>
<div class="eval-compare-status">${measured?`<span class="eval-status-ready">${icon('check-circle',16)} ${p.comparable.length} kombinasi zona–periode dapat dibandingkan</span>`:`<span class="eval-status-pending">${icon('alert-circle',16)} Belum ada pasangan pengamatan sebelum dan sesudah pada zona + periode yang sama</span>`}<small>${p.baseline.samples} baseline; ${p.followup.samples} follow-up ${safe(s.comparisonScenario)}. Seluruh data berasal dari entri manual.</small></div>
<div class="eval-comparison-grid">${cmpCard('Kendaraan berhenti per jam',p.before.stopPerHour,p.after.stopPerHour,p.changes.stopPerHour,'unit/jam')}${cmpCard('Antrean rata-rata maksimum',p.before.avgQueue,p.after.avgQueue,p.changes.avgQueue,'kendaraan')}${cmpCard('Rerata jarak akses pejalan',p.before.meanAccess,p.after.meanAccess,p.changes.accessMeters,'m')}${cmpCard('Interval akses terhalang',p.before.blockedPercent,p.after.blockedPercent,p.changes.blockedPercentPoints,'p.p.')}</div>
<div class="eval-disclaimer"><div>${icon('info',19)}</div><div><strong>Interpretasi hasil</strong><p>Selisih ini bersifat deskriptif. Perubahan belum membuktikan bahwa intervensi penyebabnya. Periksa volume lalu lintas, cuaca, hari, jam, metodologi, serta rentang ketidakpastian sebelum membentuk kesimpulan. Angka tidak ditampilkan jika tidak ada kelompok pembanding yang sepadan.</p></div></div>
<div class="eval-layout eval-last"><section class="dia-panel"><div class="dia-panel-head"><div><span class="dia-kicker dark">DECISION REGISTER</span><h3>Catatan pilihan intervensi</h3><p>Keputusan internal tim dengan jejak alasan; bukan persetujuan otoritas lalu lintas.</p></div>${tag(`${s.decisions.length} catatan`,'slate')}</div>
${!s.decisions.length?'<div class="dia-empty">Belum ada catatan keputusan. Dokumentasikan alasan memilih atau menolak A0/A1/A2.</div>':`<div class="eval-decisions">${[...s.decisions].reverse().slice(0,8).map(x=>`<div class="eval-decision"><div><strong>${safe(x.scenario)} · ${safe(scenarioNames[x.scenario]||'')}</strong><span>${safe(statusLabel[x.status]||'Draft')} · ${safe(shortDate(x.at))}</span></div><p>${safe(x.reason)}</p><small>Penanggung jawab: ${safe(x.owner)} · Tindak lanjut: ${safe(x.nextAction||'Belum ditetapkan')}</small></div>`).join('')}</div>`}</section>
<section class="dia-panel"><div class="dia-panel-head"><div><span class="dia-kicker dark">WORKFLOW / FIELD PILOT</span><h3>Tahapan keputusan yang bertanggung jawab</h3><p>Urutan berikut dipakai untuk memastikan hasil benar-benar menjawab masalah.</p></div></div><ol class="eval-checklist"><li><strong>Baseline terukur</strong><span>Kumpulkan volume, dwell, antrean, dan akses pada jam sibuk serta non-sibuk.</span></li><li><strong>Uji dan kalibrasi</strong><span>Cocokkan SUMO dengan sesi observasi independen; ulang beberapa seed.</span></li><li><strong>Tinjau alternatif</strong><span>Periksa aksesibilitas dan keselamatan sebelum mengusulkan lokasi atau aturan berhenti.</span></li><li><strong>Persetujuan berwenang</strong><span>Implementasi di jalan publik harus mengikuti prosedur pihak terkait.</span></li><li><strong>Ukur sesudah</strong><span>Ulang pengamatan pada zona dan periode setara lalu bandingkan hasilnya.</span></li></ol></section></div>`
}
const decisionModal=()=>`<div class="modal-header"><div><div class="eyebrow">DECISION LOG / KAJIAN INTERNAL</div><h2>Catat pilihan tim</h2></div><button class="btn sm" data-action="close-modal" type="button">${icon('x')}</button></div><form id="decision-form"><div class="form-grid"><div class="field"><label for="dec-scenario">Alternatif</label><select id="dec-scenario" class="control"><option value="A0">A0 – kondisi eksisting</option><option value="A1">A1 – area penjemputan</option><option value="A2">A2 – aturan berhenti</option></select></div><div class="field"><label for="dec-status">Status kajian internal</label><select id="dec-status" class="control"><option value="draft">Draft internal</option><option value="review">Dalam kajian</option><option value="pilot">Pilot terencana (perlu izin)</option><option value="closed">Ditutup</option></select></div></div><div class="field" style="margin-top:14px"><label for="dec-owner">Penanggung jawab tim</label><input required id="dec-owner" maxlength="100" class="control" placeholder="Peran / tim pengkaji" /></div><div class="field" style="margin-top:14px"><label for="dec-reason">Alasan berbasis bukti / risiko yang masih terbuka</label><textarea id="dec-reason" required maxlength="700" class="control" placeholder="Sebutkan sumber pengamatan, batas akses, dan ketidakpastian."></textarea></div><div class="field" style="margin-top:14px"><label for="dec-next">Tindak lanjut</label><input id="dec-next" maxlength="200" class="control" placeholder="Contoh: verifikasi kapasitas ruang jemput, wawancara pengelola"/></div><p class="helper">Menyimpan keputusan ini tidak menyatakan intervensi sudah diizinkan atau diterapkan. Hanya catatan kajian tim.</p><div class="modal-foot"><button type="button" class="btn" data-action="close-modal">Batal</button><button class="btn primary" type="submit">${icon('check',16)} Simpan catatan</button></div></form>`;


// SOURCE MODULE: js/views/observation.js

function renderObservation(){const s=getState(),stats=observationStats(s.observations),active=s.activeSession;const rows=[...s.observations].sort((a,b)=>new Date(b.at)-new Date(a.at));return `${pageHead('OPERASI / MOBILE FIELDWORK','Observasi Lapangan','Catat aktivitas kendaraan secara manual dan terstruktur. Dapat digunakan lewat browser HP tanpa perangkat akuisisi khusus.',`${button(`${icon('download')} Ekspor CSV`,'export-observations')} ${button(`${icon('plus')} Tambah kejadian`,'quick-observation','primary')}`)}
${note('<strong>Privasi dan asal data:</strong> tidak memerlukan foto, wajah, atau pelat nomor. Sumber <em>demo</em> dan <em>observasi manual</em> ditandai secara terpisah. Data browser disimpan secara lokal dan tidak otomatis terkirim ke server.')}
<section class="card" style="margin-bottom:18px">${cardHeading('Sinkronisasi server lokal','Kirim hanya observasi manual ke SQLite melalui REST API.',tag('OPSIONAL / API','slate'))}<div class="form-actions">${button(`${icon('upload-cloud')} Kirim ke SQLite`,'sync-observations','primary')} ${button(`${icon('download-cloud')} Ambil dari SQLite`,'pull-observations')}</div><p class="helper">Perlu backend FastAPI aktif. Data contoh sintetis tidak dikirim. Database demo ini belum memiliki autentikasi organisasi, sehingga jangan dipakai untuk data sensitif atau jaringan publik.</p></section>
<div class="cards three" style="margin-bottom:18px">${statCard('scan-line','Total kejadian',num(stats.count),`${stats.real} pencatatan manual`)}${statCard('clock','Rata-rata dwell time',`${num(stats.avgDwell)} dtk`,'Hasil agregasi kejadian tercatat','blue')}${statCard('map-pin','Zona teramati',`${stats.zoneCount}`,'Zona dalam rekaman demo / manual','navy')}</div>
<div class="two-cols" style="margin-bottom:18px"><section class="card">${cardHeading('Sesi observasi','Kelola sesi dan gunakan panel pencatatan untuk kerja lapangan.',tag(active?'SESI BERJALAN':'BELUM ADA SESI',''+(active?'':'slate')))}
<div class="field" style="margin-bottom:12px"><label>Lokasi studi</label><input class="control" value="${safe(s.project.name)}" disabled /></div><div class="field" style="margin-bottom:12px"><label>Zona observasi aktif</label><select class="control" id="current-zone" ${active?'disabled':''}><option value="Zona A" ${active?.zone==='Zona A'?'selected':''}>Zona A – akses utama</option><option value="Zona B" ${active?.zone==='Zona B'?'selected':''}>Zona B – area tunggu</option><option value="Zona C" ${active?.zone==='Zona C'?'selected':''}>Zona C – koridor terdekat</option></select></div>
<div class="field" style="margin-bottom:12px"><label for="current-period">Periode pencatatan</label><select class="control" id="current-period" ${active?'disabled':''}><option value="Jam sibuk" ${active?.period==='Jam sibuk'?'selected':''}>Jam sibuk (ditetapkan pengamat)</option><option value="Luar jam sibuk" ${active?.period==='Luar jam sibuk'?'selected':''}>Luar jam sibuk (ditetapkan pengamat)</option></select></div>
<div class="callout ${active?'':'warning'}"><strong>${active?'Sesi sedang berjalan':'Belum ada sesi aktif'}</strong>${active?'Waktu mulai: '+shortDate(active.startedAt)+' - '+clock(active.startedAt)+' WIB - '+safe(active.period||'Periode belum dilabeli')+' · Kejadian baru dicatat sebagai observasi manual.':'Tekan Mulai sesi untuk membuat rekaman baru yang terpisah dari data sintetis.'}</div><div class="form-actions">${button(`${icon('play')} Mulai sesi`,'start-session',active?'':'primary')} ${button('Akhiri sesi','end-session',active?'':'',)} </div></section>
<section class="card">${cardHeading('Quick Capture','Catat jenis aktivitas dengan satu langkah sederhana.')}
<div class="cards three" style="gap:9px">${[['Jemput','car'],['Turun','route'],['Menunggu','clock']].map(x=>`<button class="btn" data-action="capture-type" data-value="${x[0]}" style="min-height:85px;display:flex;flex-direction:column;justify-content:center;gap:8px;border-color:#dcebe6;background:#fafffd;color:#0b8276">${icon(x[1],23)}<span>${x[0]}</span></button>`).join('')}</div><div class="form-divider"></div><p class="helper">Pilih aktivitas untuk membuka input durasi, kategori kendaraan, dan zona. Informasi yang disimpan akan masuk ke tabel kejadian di bawah.</p><div class="result-pill"><span>Rekaman manual</span><strong>${stats.real} kejadian</strong></div><div class="result-pill"><span>Rekaman sintetis</span><strong>${stats.synthetic} kejadian</strong></div></section></div>
<section class="card">${cardHeading('Log kejadian','Semua kejadian yang tersimpan pada browser saat ini.',`<button class="btn sm" data-action="clear-demo">${icon('filter',14)} Hapus contoh demo</button>`)}<div class="table-wrap"><table class="data-table"><thead><tr><th>Waktu (WIB)</th><th>Aktivitas</th><th>Kendaraan</th><th>Durasi</th><th>Zona</th><th>Sumber</th><th></th></tr></thead><tbody>${rows.map(o=>`<tr><td>${shortDate(o.at)}<div style="color:#97a2af;font-size:9px;margin-top:4px">${clock(o.at)} WIB</div></td><td><strong>${safe(o.type)}</strong></td><td>${safe(o.vehicle)}</td><td>${num(o.duration)} dtk</td><td>${safe(o.zone)}</td><td>${tag(o.source==='demo'?'SINTETIS':'MANUAL',o.source==='demo'?'gold':'')}</td><td><button class="btn sm" title="Hapus kejadian" data-action="delete-event" data-id="${safe(o.id)}">${icon('trash-2',13)}</button></td></tr>`).join('')}</tbody></table>${!rows.length?emptyState('Belum ada kejadian','Mulai sesi dan rekam aktivitas pertama.') :''}</div><div class="note-line">Pencatatan di aplikasi bukan pengganti validasi lapangan dan izin observasi. F1-score serta galat volume merupakan target proposal yang belum diuji.</div></section>`}
const eventModal=(type='Jemput')=>`<div class="modal-header"><div><div class="eyebrow">EVENT CAPTURE</div><h2>Catat aktivitas kendaraan</h2></div><button class="btn sm" data-action="close-modal" aria-label="Tutup">${icon('x')}</button></div><form id="event-form"><div class="form-grid"><div class="field"><label for="event-type">Jenis aktivitas</label><select id="event-type" class="control" required><option ${type==='Jemput'?'selected':''}>Jemput</option><option ${type==='Turun'?'selected':''}>Turun</option><option ${type==='Menunggu'?'selected':''}>Menunggu</option></select></div><div class="field"><label for="event-vehicle">Kategori kendaraan</label><select id="event-vehicle" class="control"><option>Mobil</option><option>Motor</option><option>Angkutan pengumpan</option><option>Lainnya</option></select></div><div class="field"><label for="event-zone">Zona</label><select id="event-zone" class="control"><option ${getState().activeSession?.zone==='Zona A'?'selected':''}>Zona A</option><option ${getState().activeSession?.zone==='Zona B'?'selected':''}>Zona B</option><option ${getState().activeSession?.zone==='Zona C'?'selected':''}>Zona C</option></select></div><div class="field"><label for="event-duration">Durasi berhenti (detik)</label><input type="number" min="0" max="3600" step="1" value="45" id="event-duration" class="control" required></div></div><div class="form-divider"></div><div class="eyebrow">PENANDA OPERASIONAL / PENGAMATAN</div><div class="form-grid" style="margin-top:12px"><div class="field"><label for="event-context">Kondisi lokasi / rambu</label><select id="event-context" class="control"><option value="unknown">Belum diperiksa</option><option value="designated_pickup">Area penjemputan</option><option value="general_road">Tepi jalan umum</option><option value="signed_no_stopping">Rambu dilarang berhenti</option><option value="signed_no_parking">Rambu dilarang parkir</option></select></div><div class="field"><label for="event-evidence">ID referensi rambu / fasilitas (opsional)</label><input id="event-evidence" class="control" maxlength="80" pattern="[A-Za-z0-9:_-]{0,80}" placeholder="Contoh: ZONE-A-SIGN-01"/><small>Jangan masukkan nomor pelat, nama atau identitas pribadi.</small></div><div class="field"><label for="event-lane">Lajur kendaraan terhalang?</label><select id="event-lane" class="control"><option value="unknown">Belum diperiksa</option><option value="yes">Ya, teramati</option><option value="no">Tidak teramati</option></select></div><div class="field"><label for="event-pedestrian">Akses pejalan kaki terhalang?</label><select id="event-pedestrian" class="control"><option value="unknown">Belum diperiksa</option><option value="yes">Ya, teramati</option><option value="no">Tidak teramati</option></select></div><div class="field"><label for="event-queue">Antrean terbentuk?</label><select id="event-queue" class="control"><option value="unknown">Belum diperiksa</option><option value="yes">Ya, teramati</option><option value="no">Tidak teramati</option></select></div><div class="field"><label class="class-check"><input type="checkbox" id="event-signage"/> Rambu/fasilitas sudah dicek langsung oleh pengamat</label><small>Memerlukan ID referensi yang ditulis di atas.</small></div></div><div class="field" style="margin-top:14px"><label for="event-note">Catatan lapangan (opsional)</label><textarea id="event-note" class="control" placeholder="Contoh: kendaraan berhenti di tepi jalan, tanpa data identitas pribadi."></textarea></div><p class="helper">Timestamp dicatat otomatis saat disimpan. Data berlabel MANUAL dan tersimpan pada perangkat ini.</p><div class="modal-foot"><button class="btn" data-action="close-modal" type="button">Batal</button><button class="btn primary" type="submit">${icon('check')} Simpan kejadian</button></div></form>`;


// SOURCE MODULE: js/views/pipeline.js

const STAGES=['Identifikasi','Wawancara','Demo / proposal','Negosiasi','Pelanggan aktif'];
const GROUPS=[['Identifikasi','Wawancara'],['Demo / proposal'],['Negosiasi'],['Pelanggan aktif']];
function renderPipeline(){const s=getState(),leads=s.pipeline,live=leads.filter(x=>!x.demo).length;return `${pageHead('GO-TO-MARKET / SALES OPERATIONS','Akuisisi Pelanggan','Telusuri bagaimana masalah operasional berubah menjadi paid pilot, kontrak, dan langganan aktif.',`${button(`${icon('plus')} Tambah prospek`,'add-lead','primary')}`)}
${note(`<strong>Status CRM:</strong> ${leads.filter(x=>x.demo).length} organisasi contoh adalah data sintetis. ${live} prospek ditambahkan oleh pengguna; pencatatan prospek bukan bukti adanya kontrak atau pendapatan.`)}
<div class="cards four" style="margin-bottom:18px">${[['Prospek tercatat',leads.length,'Termasuk data demo'],['Prospek pengguna',live,'Tidak diverifikasi eksternal'],['Kesempatan negosiasi',leads.filter(x=>x.stage==='Negosiasi').length,'Belum menjadi kontrak'],['Pelanggan aktif (dicatat)',leads.filter(x=>x.stage==='Pelanggan aktif').length,'Data input pengguna; belum diaudit']].map((x,i)=>`<div class="card"><div class="stat-label">${x[0]}</div><div class="stat-value">${x[1]}</div><div class="stat-foot">${x[2]}</div></div>`).join('')}</div>
<section class="card">${cardHeading('Pipeline pelanggan','Kelola tahapan secara manual. Setiap kartu dapat dipindahkan ke tahap berikutnya.',tag('EDITABLE','blue'))}<div class="board">${GROUPS.map((stages,i)=>{const group=leads.filter(l=>stages.includes(l.stage));return `<div class="board-col"><div class="board-head">${['Discover','Proposal','Negotiate','Active'][i]}<span class="board-count">${group.length}</span></div>${group.map(l=>`<div class="deal"><strong>${safe(l.name)}</strong><small>${safe(l.segment)}</small><small>${safe(l.next||'Belum ada tindak lanjut')}</small><div class="deal-foot">${l.demo?tag('DEMO','gold'):tag('INPUT USER')}${l.amount?`<span>${rupiah(l.amount)}</span>`:''}</div><div style="display:flex;gap:5px;margin-top:9px"><button class="btn sm" data-action="advance-lead" data-id="${safe(l.id)}">${icon('arrow-right',13)} Tahap berikut</button><button class="btn sm" data-action="delete-lead" data-id="${safe(l.id)}" title="Hapus">${icon('trash-2',13)}</button></div></div>`).join('')||'<div style="font-size:10px;color:#a1acb8;padding:12px 5px">Belum ada prospek</div>'}</div>`}).join('')}</div></section>
<div class="section-h"><h2>Proses menghubungkan produk dengan pembeli</h2></div><div class="cards three"><section class="card"><div class="mini-kicker">DISCOVERY</div><h2 style="font-size:13px">Cari pengelola masalah</h2><p class="helper">Mulai dari tim operasional stasiun, konsultan transportasi, dan pemilik kawasan transit. Temukan siapa pengguna, pemegang anggaran, serta penentu pengadaan.</p></section><section class="card"><div class="mini-kicker">PILOT</div><h2 style="font-size:13px">Tawarkan studi berbayar</h2><p class="helper">Tentukan ruang lingkup satu lokasi: observasi, kalibrasi, simulasi alternatif, dan laporan yang dapat diuji. Harga perlu dikonfirmasi langsung kepada pembeli.</p></section><section class="card"><div class="mini-kicker">RENEWAL</div><h2 style="font-size:13px">Bangun nilai berulang</h2><p class="helper">Sediakan pemantauan berkala, penyimpanan hasil historis, simulasi perubahan kebijakan, dan dukungan teknis agar langganan memiliki manfaat nyata.</p></section></div>
<div class="section-h"><h2>Pertanyaan discovery (wawancara 15–20 menit)</h2></div><section class="card"><ul class="list-clean">${[['Masalah','Seberapa sering area penjemputan menyebabkan gangguan operasional dan bagaimana dampaknya saat ini?'],['Metode saat ini','Bagaimana tim melakukan survei dan evaluasi penataan? Berapa lama serta berapa biaya prosesnya?'],['Keputusan','Siapa yang menerima rekomendasi, siapa yang menyetujui perubahan, dan bagaimana pengadaannya?'],['Nilai pembelian','Apa kriteria yang membuat pilot SIMPUL cukup bernilai untuk dianggarkan?'],['Berulang','Apakah evaluasi dilakukan berkala sehingga dashboard dan simulasi langganan relevan?']].map((x,i)=>`<li><div class="li-ico">${i+1}</div><div><strong>${x[0]}</strong><p>${x[1]}</p></div></li>`).join('')}</ul></section>`}
function leadModal(){return `<div class="modal-header"><div><div class="eyebrow">CUSTOMER DISCOVERY</div><h2>Tambahkan prospek</h2></div><button class="btn sm" data-action="close-modal" aria-label="Tutup">${icon('x')}</button></div><form id="lead-form"><div class="form-grid"><div class="field"><label for="lead-name">Nama organisasi / akun</label><input class="control" id="lead-name" required maxlength="120" placeholder="Nama organisasi (sesuai data nyata)"></div><div class="field"><label for="lead-segment">Segmen</label><select id="lead-segment" class="control"><option>Operator transit</option><option>Instansi pemerintah</option><option>Konsultan transportasi</option><option>Pengelola kawasan</option><option>Lainnya</option></select></div><div class="field"><label for="lead-stage">Tahap pipeline</label><select id="lead-stage" class="control">${STAGES.map(x=>`<option>${x}</option>`).join('')}</select></div><div class="field"><label for="lead-amount">Nilai peluang (Rp), opsional</label><input id="lead-amount" class="control" type="number" min="0" value="0"></div></div><div class="field" style="margin-top:14px"><label for="lead-contact">Kontak / peran (jika berizin)</label><input class="control" id="lead-contact" placeholder="Mis. Manajer operasional"></div><div class="field" style="margin-top:14px"><label for="lead-next">Tindak lanjut</label><input class="control" id="lead-next" placeholder="Mis. Jadwalkan discovery interview"></div><div class="modal-foot"><button class="btn" type="button" data-action="close-modal">Batal</button><button class="btn primary" type="submit">${icon('check')} Tambahkan</button></div></form>`}


// SOURCE MODULE: js/standards.js
// SIMPUL international-practice module: quality gates and interoperable export.
// These are implementation controls; they do NOT establish ISO/WCAG certification.
const iso = value => { const parsed=new Date(value); return Number.isFinite(parsed.getTime())?parsed.toISOString():null; };
const tzAware = value => typeof value==='string' && /(Z|[+-]\d{2}:?\d{2})$/i.test(value) && iso(value)!==null;
const unique = items => new Set(items).size===items.length;
const asNum = value => typeof value==='number' && Number.isFinite(value) && value>=0;
const STANDARD_REFERENCES = [
 {code:'ISO 37120:2018',name:'City services & quality of life',application:'Konteks indikator mobilitas perkotaan; metrik SIMPUL adalah indikator studi lokal, bukan otomatis indikator ISO.',status:'Referensi metodologis',url:'https://www.iso.org/standard/68498.html'},
 {code:'ISO 37122:2019',name:'Smart city indicators',application:'Prinsip indikator terdefinisi dengan sumber, periode, dan metode yang dapat ditinjau.',status:'Referensi metodologis',url:'https://www.iso.org/standard/69050.html'},
 {code:'ISO 39001:2012',name:'Road traffic safety management',application:'Tinjauan risiko dan akses sebelum usulan perubahan pengaturan lalu lintas; bukan sertifikasi sistem.',status:'Referensi keselamatan',url:'https://www.iso.org/standard/44958.html'},
 {code:'ISO 19157-1:2023',name:'Geospatial data quality',application:'Pemeriksaan keterisian, konsistensi, validitas, dan provenance lokasi.',status:'Prinsip kualitas data',url:'https://www.iso.org/standard/78900.html'},
 {code:'ISO 8601-1:2019',name:'Date/time interchange',application:'Ekspor waktu pengamatan dan pencatatan ke UTC ISO 8601 dengan jejak zona waktu asal.',status:'Diterapkan pada ekspor',url:'https://www.iso.org/standard/70907.html'},
 {code:'RFC 7946',name:'GeoJSON',application:'Titik lokasi studi sebagai WGS84 [longitude, latitude], hanya jika koordinat tersedia; bukan posisi masing-masing event.',status:'Diterapkan pada ekspor',url:'https://www.rfc-editor.org/rfc/rfc7946'},
 {code:'W3C PROV-O',name:'Data provenance',application:'Identitas sumber, waktu, data turunan, metode dan status bukti dalam export bundle.',status:'Pemetaan provenance',url:'https://www.w3.org/TR/prov-o/'},
 {code:'WCAG 2.2 AA',name:'Web accessibility',application:'Target keyboard, kontras, focus state, label, dan responsivitas; memerlukan audit manual serta otomatis.',status:'Target, belum diaudit',url:'https://www.w3.org/TR/WCAG22/'}
];
function assessQuality(state){
 const observations=(state.observations||[]).filter(x=>x?.source==='manual');
 const intervals=(state.fieldReadings||[]).filter(x=>x?.source==='manual');
 const all=[...observations,...intervals];
 const invalidTime=all.filter(x=>!tzAware(x.at)|| (x.recordedAt&&!tzAware(x.recordedAt)));
 const ids=all.map(x=>x.id);
 const invalidNumeric=intervals.filter(x=>!Number.isInteger(Number(x.minutes))||Number(x.minutes)<5||Number(x.minutes)>240 || ['passingVehicles','stoppedVehicles','maxQueue','accessMeters','pedestrians','availableBays','occupiedBays'].some(k=>!asNum(Number(x[k]))));
 const invalidCapacity=intervals.filter(x=>Number(x.occupiedBays)>Number(x.availableBays)&&Number(x.availableBays)>0);
 const invalidPhase=intervals.filter(x=>x.phase==='baseline'&&x.scenario!=='A0'||x.phase==='followup'&&x.scenario==='A0');
 const pairs=[];
 const base=new Set(intervals.filter(x=>x.phase==='baseline'&&x.scenario==='A0').map(x=>`${x.zone}|${x.period}`));
 for(const x of intervals.filter(x=>x.phase==='followup'&&['A1','A2'].includes(x.scenario))){if(base.has(`${x.zone}|${x.period}`))pairs.push(x)}
 const observedSessions=(state.sessions||[]).filter(x=>x.source==='manual'&&x.endedAt);
 const issues=[];
 if(!all.length) issues.push({severity:'block',code:'NO_FIELD_DATA',message:'Belum ada observasi manual. Data sintetis tidak digunakan untuk evidence review.'});
 if(invalidTime.length)issues.push({severity:'block',code:'INVALID_TIME',message:`${invalidTime.length} rekaman memiliki timestamp tidak valid atau tanpa zona waktu.`});
 if(!unique(ids))issues.push({severity:'block',code:'DUPLICATE_ID',message:'ID rekaman tidak unik di dataset manual.'});
 if(invalidNumeric.length)issues.push({severity:'block',code:'INVALID_METRIC',message:`${invalidNumeric.length} interval memiliki nilai numerik di luar kontrak input.`});
 if(invalidCapacity.length)issues.push({severity:'block',code:'CAPACITY_CONFLICT',message:`${invalidCapacity.length} interval memiliki okupansi ruang jemput melebihi kapasitas tercatat; perlu konfirmasi.`});
 if(invalidPhase.length)issues.push({severity:'block',code:'SCENARIO_CONFLICT',message:'Penandaan baseline dan skenario tidak konsisten.'});
 if(observedSessions.length<12)issues.push({severity:'review',code:'SESSION_TARGET',message:`${observedSessions.length}/12 sesi manual selesai; angka 12 adalah rencana sampel pada proposal, bukan syarat ISO.`});
 if(!pairs.length)issues.push({severity:'review',code:'NO_MATCHED_FOLLOWUP',message:'Belum ada pasangan before–after pada zona dan periode yang sama.'});
 issues.push({severity:'review',code:'INDEPENDENT_VALIDATION',message:'Data kalibrasi/validasi terpisah, anotasi ground truth, serta kesesuaian jaringan SUMO belum dibuktikan.'});
 issues.push({severity:'review',code:'SAFETY_REVIEW',message:'Persetujuan rekayasa lalu lintas dan audit aksesibilitas pejalan kaki belum diverifikasi.'});
 const blocks=issues.filter(x=>x.severity==='block');
 return {status:blocks.length?'not_ready':'exploratory_only',manualEvents:observations.length,manualIntervals:intervals.length,completedManualSessions:observedSessions.length,syntheticEvents:(state.observations||[]).filter(x=>x?.source==='demo').length,matchedFollowups:pairs.length,invalidTime:invalidTime.length,duplicateIds:ids.length-new Set(ids).size,issues,scope:'Data manual saja; tidak ada validasi kalibrasi, klaim sebab-akibat, atau sertifikasi'};
}
function buildStandardsBundle(state){
 const quality=assessQuality(state);
 const obs=(state.observations||[]).filter(x=>x.source==='manual').map(x=>({id:x.id,observed_at_utc:iso(x.at),source_timestamp:x.at,category:x.type,vehicle_category:x.vehicle,zone:x.zone,dwell_seconds:Number(x.duration),source:'manual',session_id:x.sessionId||null,note:x.note||''}));
 const fields=(state.fieldReadings||[]).filter(x=>x.source==='manual').map(x=>({id:x.id,observed_at_utc:iso(x.at),recorded_at_utc:x.recordedAt?iso(x.recordedAt):null,source_timestamp:x.at,phase:x.phase,scenario:x.scenario,period:x.period,zone:x.zone,observation_minutes:Number(x.minutes),passing_vehicles:Number(x.passingVehicles),stopped_vehicles:Number(x.stoppedVehicles),stopping_events_per_hour:Number(x.minutes)>0?Number((Number(x.stoppedVehicles)*60/Number(x.minutes)).toFixed(3)):null,max_queue_vehicles:Number(x.maxQueue),pedestrian_access_distance_m:Number(x.accessMeters),pedestrians_observed:Number(x.pedestrians),access_blocked:Boolean(x.blockedAccess),available_pickup_bays:Number(x.availableBays),occupied_pickup_bays:Number(x.occupiedBays),source:'manual',session_id:x.sessionId||null,note:x.note||''}));
 const generatedAt=new Date().toISOString();
 return {schema:'https://simpul.local/schemas/evidence-bundle/v1',schema_version:'1.0.0',generated_at_utc:generatedAt,report_kind:'research_evidence_export',validation_status:'NOT_FIELD_VALIDATED',project:{id:state.project.id,name:state.project.name,district:state.project.district,spatial_reference:'WGS84 / EPSG:4326 only if coordinate supplied'},data_provenance:{manual_only:true,synthetic_records_excluded:quality.syntheticEvents,source_data_types:['manual_observation','manual_interval'],source_version:'SIMPUL v0.9',basis:'Local project proposal; independent calibration/validation pending'},quality,units:{observation_minutes:'min',dwell_seconds:'s',stopping_events_per_hour:'events/h',pedestrian_access_distance_m:'m',passing_vehicles:'vehicle count',max_queue_vehicles:'vehicle count'},observations:obs,field_intervals:fields,provenance:{'@context':{'prov':'http://www.w3.org/ns/prov#','dcterms':'http://purl.org/dc/terms/'},'@graph':[...obs,...fields].map(x=>({'@id':`urn:simpul:record:${encodeURIComponent(x.id)}`,'@type':'prov:Entity','prov:generatedAtTime':x.recorded_at_utc||x.observed_at_utc,'dcterms:source':'manual field input', 'dcterms:identifier':x.id}))},limitations:['ISO references inform design, not certification','No confirmed Fatmawati SUMO calibration','No independent field validation','Before/after metrics are descriptive, not causal','Manual observations are not automatically verified']};
}
function buildProjectGeoJSON(state){
 const geo=state.project?.geo, lat=Number(geo?.lat), lon=Number(geo?.lon);
 if(!geo||!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)throw new Error('Koordinat lokasi proyek belum tersedia atau tidak valid. Pilih lokasi pada halaman Peta terlebih dahulu.');
 return {type:'FeatureCollection',name:'SIMPUL study reference (not observed event coordinates)',features:[{type:'Feature',id:state.project.id,geometry:{type:'Point',coordinates:[lon,lat]},properties:{name:state.project.name,location_type:'project_reference_point',coordinate_accuracy:'not_verified',observation_location:'not_per_event',source:'user-selected geocoding',recorded_at_utc:new Date().toISOString()}}]};
}
function buildExecutiveBriefHTML(state){
 const q=assessQuality(state);
 const escape=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
 const rows=[['Manual event records',q.manualEvents],['Manual interval records',q.manualIntervals],['Completed manual sessions',q.completedManualSessions],['Matched before-after follow-ups',q.matchedFollowups],['Synthetic events excluded',q.syntheticEvents]];
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SIMPUL | International Research Brief</title><style>
 @page{size:A4;margin:18mm}*{box-sizing:border-box}body{margin:0;font:12px/1.6 Arial,sans-serif;color:#1b3354;background:#f0f4f7}.sheet{max-width:800px;margin:20px auto;padding:40px 48px;background:#fff;box-shadow:0 6px 22px #17265e12}header{border-top:9px solid #087d72;padding-top:20px}.eyebrow{color:#087d72;font-size:10px;letter-spacing:1.5px;font-weight:800}h1{font-size:30px;line-height:1.2;margin:14px 0;color:#192960}h2{font-size:15px;margin-top:27px;color:#192960;border-bottom:1px solid #e1e9ee;padding-bottom:6px}p{margin:9px 0}table{border-collapse:collapse;width:100%;margin:15px 0}th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #e6edf1}th{background:#192960;color:#fff}.warn{background:#fcf7eb;border-left:4px solid #d19c42;padding:14px}.foot{font-size:10px;color:#71869c;margin-top:30px;padding-top:12px;border-top:1px solid #dce8ed}@media print{body{background:#fff}.sheet{box-shadow:none;margin:0;max-width:none;padding:0}}</style></head><body><article class="sheet"><header><div class="eyebrow">SIMPUL · iSeeDesignITB · STUDY TECHNICAL BRIEF</div><h1>Mobility Access &amp; Pickup Management</h1><p><b>Case study:</b> ${escape(state.project?.name)} · ${escape(state.project?.district)}</p><p><b>Prepared (UTC):</b> ${escape(new Date().toISOString())}</p></header>
 <div class="warn"><b>Evidence status: ${q.status==='not_ready'?'NOT READY':'EXPLORATORY ONLY'}</b><p>This document is generated from a research prototype. No real-world impact, certified standard conformance, traffic safety approval, or calibrated SUMO model is claimed.</p></div>
 <h2>1. Problem and intended users</h2><p>SIMPUL is a mobile-first decision-support system for assessing vehicle pickup, drop-off and waiting activity near MRT Fatmawati, Jakarta, while monitoring implications for pedestrian access. Intended users include field surveyors, transport analysts, and transit operators.</p>
 <h2>2. Engineering workflow</h2><p>Field observations → deterministic/AI-assisted analysis → A0 existing conditions, A1 pickup area optimization, A2 stopping rule evaluation → human review and follow-up measurement.</p>
 <h2>3. Evidence inventory</h2><table><thead><tr><th>Data category</th><th>Count</th></tr></thead><tbody>${rows.map(([a,b])=>`<tr><td>${escape(a)}</td><td>${escape(b)}</td></tr>`).join('')}</tbody></table><p>Time representations follow ISO 8601 conventions; spatial exports use GeoJSON per RFC 7946 where reference coordinates exist. Data source metadata and caveats accompany the machine-readable evidence bundle.</p>
 <h2>4. Quality findings</h2><table><thead><tr><th>Level</th><th>Finding</th></tr></thead><tbody>${q.issues.map(x=>`<tr><td>${escape(x.severity.toUpperCase())}</td><td>${escape(x.message)}</td></tr>`).join('')}</tbody></table>
 <h2>5. Verification still required</h2><p>Independent vehicle-count annotations, calibrated and separately validated SUMO geometry/demand, accessibility and safety review, authorized field data collection, and a defensible before-after study are required before operational deployment.</p>
 <h2>6. Standard references</h2><p>${STANDARD_REFERENCES.map(x=>escape(x.code)).join(' · ')}. These references inform engineering practices only; this application is not certified against any of them.</p>
 <footer class="foot">Automatically generated · SIMPUL research prototype · No personal identifiers included in this brief · Methodology and field data require independent review.</footer></article></body></html>`;
}


// SOURCE MODULE: js/finance.js
const nonneg=x=>Math.max(0,Number(x)||0);
/**
 * Forward-looking financial assumptions. Not booked revenue or actual invoices.
 * 12-month model: assume opening sites are onboarded and billed for all 12 months;
 * incremental monthly signups begin at month 1 and are billed from that month.
 * Pilot conversions shown separately, not added to subscribed sites unless chosen by user.
 */
function forecast(f){
  const count=Math.floor(nonneg(f.sites)),newPerMonth=nonneg(f.newSitesPerMonth),churn=Math.min(100,nonneg(f.churn))/100;
  const monthly=nonneg(f.monthly), setup=nonneg(f.setup),pilotFee=nonneg(f.pilotFee),pilots=nonneg(f.pilots);
  let active=count;const rows=[];
  for(let i=1;i<=12;i++){
    // Existing opening sites are present from month 1; additional signups join from month 2.
    const newSites=i===1?0:newPerMonth;
    active=Math.max(0,active*(1-churn)+newSites);
    const pilotCount=i===1?pilots:0;
    const setupRevenue=(i===1?count:newSites)*setup;
    const recurring=active*monthly;
    const pilotRevenue=pilotCount*pilotFee;
    const revenue=setupRevenue+recurring+pilotRevenue;
    const direct=nonneg(f.cloudMonthly)+active*nonneg(f.supportPerSite)+(i===1?count:newSites)*nonneg(f.implementationCostPerSite)+pilotCount*nonneg(f.pilotCost);
    const fixed=nonneg(f.fixedMonthly)+nonneg(f.salesMonthly);
    const costs=direct+fixed;
    rows.push({month:i,active,recurring,setupRevenue,pilotRevenue,revenue,direct,fixed,costs,grossProfit:revenue-direct,net:revenue-costs});
  }
  const sum=k=>rows.reduce((s,r)=>s+r[k],0);
  const revenue=sum('revenue'),grossProfit=sum('grossProfit'),net=sum('net'),direct=sum('direct'),costs=sum('costs');
  const mrr=rows[11].recurring,arr=mrr*12;
  const breakEven=rows.find(r=>r.net>=0)?.month??null;
  let cumulative=0;let cashBreakEven=null;
  for(const r of rows){cumulative+=r.net;if(cashBreakEven===null&&cumulative>=0)cashBreakEven=r.month;}
  return {rows,revenue,grossProfit,net,direct,costs,grossMargin:revenue?grossProfit/revenue*100:0,netMargin:revenue?net/revenue*100:0,mrr,arr,breakEven,cashBreakEven,yearEndSites:rows[11].active,recurringTotal:sum('recurring'),setupTotal:sum('setupRevenue'),pilotTotal:sum('pilotRevenue')};
}
function directCostShare(f,siteCount){const count=Math.max(0,Number(siteCount)||0);const cloud=nonneg(f.cloudMonthly),support=count*nonneg(f.supportPerSite),fixed=nonneg(f.fixedMonthly),sales=nonneg(f.salesMonthly);const tot=cloud+support+fixed+sales||1;return [{label:'Cloud',value:cloud/tot*100,amount:cloud,css:'a'},{label:'Dukungan pelanggan',value:support/tot*100,amount:support,css:'b'},{label:'Operasional',value:fixed/tot*100,amount:fixed,css:'c'},{label:'Akuisisi',value:sales/tot*100,amount:sales,css:'d'}]}


// SOURCE MODULE: js/views/reports.js


function makeReport(){const s=getState(),o=observationStats(s.observations),r=s.lastAnalysis||heuristicSimulation(s.scenario),f=forecast(s.finance);return {meta:{title:'SIMPUL – Laporan kajian demonstrasi',createdAt:new Date().toISOString(),project:s.project.name,classification:'DATA DEMONSTRASI / BELUM TERVALIDASI',source:'Proposal SIMPUL iSeeDesignITB'},observations:{summary:o,records:s.observations},fieldAssessment:{manualIntervals:s.fieldReadings,baselineDiagnosis:diagnose(s.fieldReadings,s.observations,s.fieldSettings),beforeAfter:Object.fromEntries(['A0','A1','A2'].map(x=>[x,comparePeriods(s.fieldReadings,x)])),evidenceGate:evidenceGate(s.fieldReadings,s.sessions,s.observations),screeningCriteria:s.fieldSettings},internalDecisionLog:s.decisions,scenarios:r,financialModel:{assumptions:s.finance,forecast:f},evidenceQuality:assessQuality(s),limitations:['Kondisi Fatmawati belum diverifikasi dengan observasi lapangan yang memadai.','Model browser merupakan ilustrasi heuristik, bukan keluaran SUMO.','Jika backend SUMO digunakan, jaringannya adalah jaringan sintetis, belum terkalibrasi terhadap lokasi sebenarnya.','Pengamatan sebelum-sesudah bersifat deskriptif dan tidak cukup untuk membuktikan kausalitas.','Prediksi tidak sama dengan hasil implementasi.','Harga dan revenue merupakan asumsi bisnis, bukan transaksi.']};}
function renderReports(){const s=getState(),o=observationStats(s.observations),r=s.lastAnalysis||heuristicSimulation(s.scenario),f=forecast(s.finance);return `${pageHead('DOCUMENTATION / EVIDENCE','Laporan & Ekspor','Unduh data dan hasil analisis beserta asumsi yang diperlukan untuk mereproduksi evaluasi.',`${button(`${icon('download')} Unduh JSON lengkap`,'export-report','primary')}`)}
${note('<strong>Periksa keterbatasan sebelum dibagikan:</strong> laporan memuat catatan sintetis dan/atau input manual, simulasi ilustratif atau SUMO demo, serta proyeksi bisnis hipotetis. Dokumen ini belum setara dengan hasil survei terkalibrasi.')}
<div class="cards three">${[['Ekspor observasi','CSV untuk ditinjau atau dikalibrasi lebih lanjut.','export-observations','database'],['Laporan proyek','JSON: asumsi, rekaman, skenario, dan keterbatasan.','export-report','files'],['Proyeksi finansial','CSV 12 bulan untuk pengujian asumsi.','export-forecast','calculator']].map(x=>`<article class="card"><div class="stat-top"><div class="stat-icon">${icon(x[3],20)}</div>${tag('READY','blue')}</div><h2 style="font-size:13px;color:#273a5d">${x[0]}</h2><p class="helper">${x[1]}</p><div style="margin-top:15px">${button(`${icon('download')} Unduh` ,x[2])}</div></article>`).join('')}</div>
<div class="section-h"><h2>Ekspor dengan standar data internasional</h2></div><section class="card"><p class="helper">Untuk pertukaran dengan analis atau institusi lain, gunakan evidence bundle (UTC, unit SI, provenance, data manual) dan GeoJSON untuk titik referensi lokasi proyek. Keduanya tidak mengklaim validasi lapangan.</p><div class="head-buttons" style="margin-top:14px">${button('Unduh evidence bundle','export-evidence-package','primary')}${button('GeoJSON lokasi studi','export-study-geojson')}${button('Periksa kualitas bukti','goto-standards')}${button('Executive brief (EN)','export-executive-brief')}${button('Klasifikasi untuk tinjauan','goto-classification')}</div></section><div class="section-h"><h2>Ringkasan lampiran bukti</h2></div><div class="two-cols"><section class="card">${cardHeading('Informasi studi','Sumber: workspace browser')}<div class="result-pill"><span>Proyek</span><strong>${safe(s.project.name)}</strong></div><div class="result-pill"><span>Data observasi</span><strong>${o.count} kejadian</strong></div><div class="result-pill"><span>Data manual</span><strong>${o.real} kejadian</strong></div><div class="result-pill"><span>Keluaran skenario</span><strong>${r.engine==='sumo'?'SUMO sintetis':'Heuristik ilustratif'}</strong></div><div class="result-pill"><span>Status kajian</span><strong>Belum tervalidasi</strong></div></section><section class="card">${cardHeading('Transparansi model bisnis','Proyeksi berdasarkan parameter pengguna')}<div class="result-pill"><span>Pendapatan model 12 bulan</span><strong>${num(f.revenue)} Rp</strong></div><div class="result-pill"><span>Biaya langsung model</span><strong>${num(f.direct)} Rp</strong></div><div class="result-pill"><span>Laba operasi model</span><strong>${num(f.net)} Rp</strong></div><div class="result-pill"><span>Kontrak aktual terintegrasi</span><strong>0 / tidak tersedia</strong></div><div class="callout warning" style="margin-top:14px"><strong>Status komersialisasi</strong>Proyeksi pendapatan bukan invoice, pembayaran, atau komitmen pembelian.</div></section></div>
<div class="section-h"><h2>Ringkasan bukti verifikasi dan kekurangan</h2></div><section class="card"><ul class="list-clean">${[['Peta dan geometri','Peta skematis antarmuka hanya ilustrasi. Data OSM perlu diverifikasi dan diatribusikan pada peta produksi.'],['Deteksi peristiwa','Mode manual belum memberikan nilai F1. Perlu ground truth dan anotasi independen.'],['Kalibrasi SUMO','Belum tersedia data observasi dan model ruas Fatmawati yang tervalidasi.'],['Analisis SI / Gemini','Integrasi cloud dapat ditambahkan pada backend; demo browser tidak mengaku sebagai keluaran Gemini.'],['Manfaat bagi pengguna','Perlu uji waktu kerja serta wawancara penerimaan dengan pengguna aktual.'],['Kelayakan finansial','Willingness-to-pay, ongkos cloud, pengadaan publik, dan siklus penjualan perlu validasi pelanggan.']].map(x=>`<li><div class="li-ico">${icon('alert-circle',15)}</div><div><strong>${x[0]}</strong><p>${x[1]}</p></div></li>`).join('')}</ul></section>`}


// SOURCE MODULE: js/views/classification.js





const opts=(items,current)=>items.map(([v,label])=>`<option value="${safe(v)}" ${current===v?'selected':''}>${safe(label)}</option>`).join('');
const priorityColor=p=>({P1:'red',P2:'amber',P3:'blue',P4:'teal'})[p]||'slate';
function renderClassification(){
 const s=getState(),filter=s.policeFilter||{},all=classifyTrafficDataset(s.observations,s.eventReviews),sum=trafficClassSummary(s.observations,s.eventReviews);
 const selected=all.filter(x=>(filter.source||'all')==='all'||x.event.source===filter.source)
  .filter(x=>(filter.priority||'all')==='all'||x.classification.priority===filter.priority)
  .filter(x=>(filter.zone||'all')==='all'||x.event.zone===filter.zone)
  .filter(x=>(filter.review||'all')==='all'||x.classification.reviewStatus===filter.review)
  .sort((a,b)=>(a.event.source==='demo')-(b.event.source==='demo') || a.classification.priority.localeCompare(b.classification.priority) || new Date(b.event.at)-new Date(a.event.at));
 const zones=[...new Set(s.observations.map(x=>x.zone))].sort();
 const zoneCounts=zones.map(z=>({name:z,count:all.filter(x=>x.event.source==='manual'&&x.event.zone===z).length}));
 const largest=Math.max(1,...zoneCounts.map(x=>x.count));
 const unreviewed=all.filter(x=>x.event.source==='manual'&&x.classification.reviewStatus==='pending').length;
 return `${pageHead('OPERASI / REVIEW WORKSPACE','Klasifikasi & Tinjauan Lalu Lintas','Kategori observasi yang konsisten untuk petugas lapangan, pengelola transit, kepolisian, dan Dishub. Fitur ini membantu pemilahan kasus, bukan penerbitan tilang.',`${button(`${icon('download',15)} CSV untuk tinjauan`,'export-police-csv')} ${button(`${icon('files',15)} Evidence JSON`,'export-police-json','primary')}`)}
 <section class="class-hero"><div><div class="class-eyebrow">OPERATIONAL REVIEW · SIMPUL v1.0</div><h2>From recorded events to <em>clear operational priorities.</em></h2><p>Klasifikasi memisahkan aktivitas, hambatan lalu lintas, kondisi rambu, dan keputusan pemeriksa. Bukti yang tidak diketahui tetap berlabel <strong>belum diperiksa</strong>.</p><div class="class-hero-tags"><span>01 · Observasi</span><span>02 · Prioritas operasional</span><span>03 · Tinjauan manusia</span><span>04 · Ekspor tersaring</span></div></div><div class="class-hero-aside"><span>DATASET STATUS</span><strong>${sum.manual}</strong><small>kejadian manual - ${sum.synthetic} contoh sintetis</small><div class="class-progress"><i style="width:${sum.manual?Math.round(sum.reviewed/sum.manual*100):0}%"></i></div><small>${sum.reviewed} / ${sum.manual} catatan sudah ditinjau secara internal</small></div></section>
 ${note('<strong>Penting untuk kepolisian / Dishub:</strong> prioritas P1–P4 adalah skor operasional berbasis kondisi yang dicatat, bukan tingkatan pelanggaran hukum. Larangan berhenti dan larangan parkir tidak boleh disamakan. Tidak ada pengenalan wajah, pelat nomor, atau pengiriman otomatis kepada aparat.','warning')}
 <div class="class-kpis"><article class="class-kpi"><span>DATA LAPANGAN</span><strong>${sum.manual}</strong><small>Rekaman manual, tidak termasuk demo</small></article><article class="class-kpi"><span>AKSES PEJALAN KAKI / P1</span><strong>${sum.priorities.P1}</strong><small>Laporan hambatan akses yang perlu dicek</small></article><article class="class-kpi"><span>PERLU TINJAUAN ATURAN</span><strong>${sum.ruleReview}</strong><small>Rambu tercatat, bukan putusan hukum</small></article><article class="class-kpi"><span>MENUNGGU TINJAUAN</span><strong>${unreviewed}</strong><small>Belum memperoleh catatan pemeriksa</small></article></div>
 <div class="class-grid"><section class="card class-panel">${cardHeading('Taksonomi aktivitas','Satu kejadian bisa memiliki beberapa dampak, tetapi hanya satu jenis aktivitas.')}
 <div class="class-taxonomy"><div><span class="class-number">01</span><strong>Aktivitas</strong><small>Jemput · turun · menunggu</small></div><div><span class="class-number">02</span><strong>Dampak</strong><small>Lajur · akses pejalan kaki · antrean</small></div><div><span class="class-number">03</span><strong>Konteks aturan</strong><small>Rambu / area / belum diperiksa</small></div><div><span class="class-number">04</span><strong>Status tinjauan</strong><small>Belum ditinjau · perlu bukti · ditutup</small></div></div><p class="class-hint">Prioritas dihitung secara deterministik dari dampak yang <em>dilaporkan</em>. P1 akses pejalan kaki, P2 hambatan lajur/antrean, P3 menunggu ≥120 detik, P4 lainnya. Batas 120 detik merupakan parameter penyaringan internal, bukan batas hukum.</p></section>
 <section class="card class-panel">${cardHeading('Distribusi berdasarkan zona','Hanya rekaman manual; gunakan filter untuk menelusuri kejadian individual.')}
 ${zoneCounts.length?`<div class="class-bars">${zoneCounts.map(z=>`<div class="class-bar-row"><span>${safe(z.name)}</span><div class="class-bar-track"><i style="width:${Math.max(0,z.count/largest*100)}%"></i></div><b>${z.count}</b></div>`).join('')}</div>`:emptyState('Belum ada zona','Catat observasi manual terlebih dahulu.')}
 <div class="class-legend"><span><i class="class-dot teal"></i> Manual</span><span><i class="class-dot gold"></i> Demo tidak dihitung</span></div></section></div>
 <section class="card class-panel" style="margin-top:18px">${cardHeading('Antrean tinjauan peristiwa','Saring menurut tingkat perhatian, jenis sumber, zona, dan status pemeriksaan.',tag(`${selected.length} RECORDS`,'slate'))}
 <div class="class-filters"><div class="field"><label for="class-source">Sumber</label><select class="control" id="class-source">${opts([['all','Semua sumber'],['manual','Manual'],['demo','Demo sintetis']],filter.source||'all')}</select></div><div class="field"><label for="class-priority">Prioritas</label><select class="control" id="class-priority">${opts([['all','Semua prioritas'],...Object.entries(PRIORITY)],filter.priority||'all')}</select></div><div class="field"><label for="class-zone">Zona</label><select class="control" id="class-zone">${opts([['all','Semua zona'],...zones.map(z=>[z,z])],filter.zone||'all')}</select></div><div class="field"><label for="class-review">Review</label><select class="control" id="class-review">${opts([['all','Semua status'],...Object.entries(REVIEW_STATUS)],filter.review||'all')}</select></div></div>
 <div class="table-wrap"><table class="data-table class-table"><thead><tr><th>Waktu / Zona</th><th>Aktivitas</th><th>Dampak teramati</th><th>Prioritas</th><th>Konteks aturan</th><th>Status</th><th></th></tr></thead><tbody>${selected.map(({event,classification:c})=>`<tr><td><strong>${safe(event.zone)}</strong><small>${shortDate(event.at)} · ${clock(event.at)} WIB</small></td><td><strong>${safe(event.type)}</strong><small>${num(event.duration)} dtk · ${safe(event.vehicle)}</small></td><td>${[['Pejalan kaki',c.impact.pedestrian],['Lajur',c.impact.lane],['Antrean',c.impact.queue]].map(([label,value])=>value==='yes'?`<span class="class-impact">${label}</span>`:'').filter(Boolean).join('')||'<span class="class-muted">Belum ada konfirmasi</span>'}</td><td><span class="class-priority ${priorityColor(c.priority)}">${c.priority}</span><small>${safe(PRIORITY[c.priority].split('· ')[1])}</small></td><td><span class="class-rule">${safe(ZONE_CONTEXT[c.context])}</span><small>${safe(c.ruleFlag==='review_rule'?'Perlu pemeriksaan aturan':c.ruleFlag==='interpretation_needed'?'Perlu interpretasi':'Belum dipastikan')}</small></td><td>${tag(event.source==='demo'?'DEMO':c.reviewLabel,event.source==='demo'?'gold':'slate')}</td><td>${event.source==='demo'?'<span class="class-muted">Contoh saja</span>':`<button class="btn sm" type="button" data-action="review-traffic" data-id="${safe(event.id)}">${icon('clipboard-list',14)} Tinjau</button>`}</td></tr>`).join('')}</tbody></table>${!selected.length?emptyState('Tidak ditemukan','Ubah filter atau catat kejadian baru di Observasi Lapangan.'):''}</div>
 <p class="class-hint">Review disimpan secara lokal sebagai catatan internal. Ekspor untuk tinjauan resmi hanya memuat observasi manual dan tidak menyertakan catatan bebas atau data identitas individu.</p></section>
 <section class="class-explain"><div><div class="class-eyebrow">HANDOFF / POLICY CONTROL</div><h3>Siapa yang dapat menggunakan data ini?</h3><p><strong>Petugas survei:</strong> memasukkan kejadian dan kondisi yang teramati. <strong>Pengelola MRT / Dishub:</strong> memeriksa hambatan operasional, kapasitas fasilitas, dan kebutuhan pengaturan. <strong>Kepolisian:</strong> dapat menerima ringkasan yang telah diperiksa dan menilai dugaan masalah sesuai kewenangan, dengan verifikasi independen.</p></div><div class="class-handoff-status"><strong>NO AUTOMATED ENFORCEMENT</strong><span>Tanpa pengenalan individu · tanpa keputusan pelanggaran otomatis · tanpa integrasi langsung ke sistem polisi</span></div></section>`;
}
function trafficReviewModal(event,review){
 const c=classifyTrafficDataset([event],{[event.id]:review||{}})[0].classification;
 return `<div class="modal-header"><div><div class="eyebrow">MANUAL REVIEW · ${safe(event.id)}</div><h2>Catatan pemeriksaan kejadian</h2></div><button class="btn sm" data-action="close-modal" aria-label="Tutup">${icon('x')}</button></div>
 <div class="class-review-summary"><div><span>Aktivitas</span><strong>${safe(c.activity)}</strong></div><div><span>Prioritas operasional</span><strong>${safe(c.priorityLabel)}</strong></div><div><span>Konteks aturan</span><strong>${safe(c.contextLabel)}</strong></div></div>
 <p class="helper" style="margin:15px 0">${safe(c.priorityReason)} ${safe(c.ruleDescription)} Data ini tidak dapat digunakan sebagai bukti pelanggaran otomatis.</p>
 <form id="traffic-review-form"><input type="hidden" id="traffic-review-id" value="${safe(event.id)}"/><div class="form-grid"><div class="field"><label for="traffic-review-status">Status pemeriksaan internal</label><select class="control" id="traffic-review-status">${opts(Object.entries(REVIEW_STATUS),review?.status||'pending')}</select></div><div class="field"><label for="traffic-reviewer">Inisial / label pemeriksa</label><input class="control" id="traffic-reviewer" value="${safe(review?.reviewer||'')}" maxlength="80" placeholder="Misal: SURVEY-01" autocomplete="off" /></div></div><div class="field" style="margin-top:12px"><label for="traffic-review-note">Alasan dan tindakan berikutnya</label><textarea class="control" id="traffic-review-note" maxlength="600" placeholder="Contoh: verifikasi rambu dan kapasitas penjemputan pada sesi berikutnya.">${safe(review?.note||'')}</textarea></div><div class="callout warning"><strong>Review bukan penindakan</strong> Status internal tidak menyatakan pelanggaran, persetujuan kepolisian, atau laporan yang sudah dikirim.</div><div class="modal-foot"><button class="btn" type="button" data-action="close-modal">Batal</button><button class="btn primary" type="submit">Simpan catatan review</button></div></form>`;
}


// SOURCE MODULE: js/vehicle-problem.js
/** Vehicle-first operational diagnostics, using only logged events.
 * This module never identifies drivers or assigns offences. The observer's
 * yes/no/unknown impact fields are retained exactly (unknown != no).
 */
const ACTIVITIES=Object.freeze(['Jemput','Turun','Menunggu']);
const ACTIVITY_NAMES=Object.freeze({Jemput:'Menjemput penumpang',Turun:'Menurunkan penumpang',Menunggu:'Menunggu penumpang'});
const impactFields=Object.freeze({lane:'laneBlocked',pedestrian:'pedestrianBlocked',queue:'queueObserved'});
const numeric=value=>(value===null||value===undefined||value==='')?null:(Number.isFinite(Number(value))&&Number(value)>=0?Number(value):null);
function vehicleProblemSummary(events=[],filter={},thresholdSec=60){
 const source=filter.source==='manual'?'manual':'demo';
 const available=events.filter(e=>e?.source===source);
 const zones=[...new Set(available.map(e=>e.zone).filter(Boolean))].sort();
 const filtered=available.filter(e=>(!filter.type||filter.type==='all'||e.type===filter.type)&&(!filter.zone||filter.zone==='all'||e.zone===filter.zone));
 const threshold=Math.max(5,Math.min(600,Number(thresholdSec)||60));
 const counts=Object.fromEntries(ACTIVITIES.map(k=>[k,filtered.filter(e=>e.type===k).length]));
 const validDurations=filtered.map(e=>numeric(e.duration)).filter(x=>x!==null);
 const avgDwell=validDurations.length?Math.round(validDurations.reduce((a,b)=>a+b,0)/validDurations.length):null;
 const overThreshold=filtered.filter(e=>numeric(e.duration)!==null&&numeric(e.duration)>threshold).length;
 const impacts=Object.fromEntries(Object.entries(impactFields).map(([key,field])=>{
   const yes=filtered.filter(e=>e[field]==='yes').length;
   const no=filtered.filter(e=>e[field]==='no').length;
   return [key,{yes,no,unknown:filtered.length-yes-no}];
 }));
 const zoneRows=[...new Set(filtered.map(e=>e.zone).filter(Boolean))].map(zone=>{
   const group=filtered.filter(e=>e.zone===zone),known=group.filter(e=>e.pedestrianBlocked==='yes'||e.laneBlocked==='yes'||e.queueObserved==='yes').length;
   return {zone,count:group.length,waiting:group.filter(e=>e.type==='Menunggu').length,aboveThreshold:group.filter(e=>numeric(e.duration)!==null&&numeric(e.duration)>threshold).length,knownImpact:known};
 }).sort((a,b)=>b.knownImpact-a.knownImpact||b.aboveThreshold-a.aboveThreshold||b.count-a.count);
 const hypotheses=[];
 if(!filtered.length){hypotheses.push({code:'A0',title:'Kumpulkan bukti awal',reason:'Belum ada kejadian untuk filter yang dipilih.',action:'Mulai observasi kendaraan pada zona dan periode yang terdefinisi.'});}
 else {
   if(counts.Menunggu>0||overThreshold>0)hypotheses.push({code:'A2',title:'Uji aturan durasi dan lokasi berhenti',reason:`${counts.Menunggu} laporan menunggu dan ${overThreshold} durasi di atas ambang analitis ${threshold} detik.`,action:'Periksa durasi dan titik berhenti, lalu bandingkan A2 dengan A0 melalui simulasi.'});
   if(zoneRows.length)hypotheses.push({code:'A1',title:'Periksa kapasitas dan penempatan area jemput',reason:`${zoneRows[0].zone} memiliki ${zoneRows[0].count} kejadian pada filter ini.`,action:'Ukur kapasitas area jemput dan akses sebelum menguji pemanfaatan fasilitas pada A1.'});
   if(impacts.pedestrian.yes>0||impacts.lane.yes>0)hypotheses.unshift({code:'SAFETY',title:'Prioritaskan inspeksi keselamatan',reason:`${impacts.pedestrian.yes} laporan akses pejalan kaki terhalang; ${impacts.lane.yes} laporan lajur terhalang.`,action:'Lakukan tinjauan manusia di lapangan sebelum menyimpulkan kelayakan penataan.'});
 }
 return {source,sourceCount:available.length,filtered,counts,zones,threshold,avgDwell,overThreshold,impacts,zoneRows,hypotheses,manualAvailable:events.filter(e=>e.source==='manual').length,demoAvailable:events.filter(e=>e.source==='demo').length};
}


// SOURCE MODULE: js/views/vehicles.js




const options=(values,active)=>values.map(([id,label])=>`<option value="${safe(id)}" ${id===active?'selected':''}>${safe(label)}</option>`).join('');
const dash=n=>n===null?'–':String(n);
const bar=(n,max)=>`<span class="vehicle-bar"><i style="width:${max?Math.max(3,Math.round(n/max*100)):0}%"></i></span>`;
function renderVehicles(){
 const s=getState(),filter=s.vehicleView||{source:'demo',type:'all',zone:'all'},d=vehicleProblemSummary(s.observations,filter,s.fieldSettings?.dwellThresholdSec);
 const max=Math.max(1,...Object.values(d.counts)),context=d.source==='demo';
 return `${pageHead('PROBLEM SOLVING / TRANSPORTASI','Masalah Kendaraan di Titik Jemput','Dari aktivitas kendaraan yang teramati, telusuri dampaknya pada arus lalu lintas dan akses pejalan kaki. SIMPUL membantu memilih alternatif yang perlu diuji.',`${button(`${icon('plus',16)} Catat kendaraan`,'goto-observation','primary')} ${button(`${icon('map-pinned',16)} Peta koridor`,'goto-mapview')}`)}
 <section class="vehicle-story" aria-label="Alur penyebab dan keputusan"><div class="vehicle-story-top"><div><span class="vehicle-eyebrow">PERTANYAAN PENELITIAN</span><h2>Ketika kendaraan berhenti atau menunggu, apa yang terjadi pada jalan dan akses MRT?</h2><p>Kendaraan pengumpan membutuhkan ruang untuk naik-turun penumpang. Jika ruang dan permintaan tidak seimbang, antrean atau hambatan akses dapat terjadi. Hubungan tersebut harus diperiksa melalui observasi dan simulasi.</p></div><div class="vehicle-story-illustration" aria-hidden="true"><svg viewBox="0 0 280 155" fill="none"><rect x="8" y="14" width="264" height="127" rx="18" fill="#fff" opacity=".12"/><path d="M12 92H268" stroke="#d8fcf3" stroke-width="36" opacity=".65"/><path d="M16 92H264" stroke="#174E76" stroke-width="2" stroke-dasharray="10 9"/><rect x="75" y="69" width="60" height="31" rx="8" fill="#04B19E" stroke="#FFFFFF" stroke-width="3"/><rect x="145" y="77" width="49" height="24" rx="7" fill="#F5B84B" stroke="#FFFFFF" stroke-width="3"/><path d="M104 58v-24" stroke="#F5B84B" stroke-width="3" stroke-linecap="round"/><path d="m96 42 8-8 8 8" stroke="#F5B84B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><text x="20" y="45" fill="white" font-size="11" font-weight="700">BERHENTI</text><text x="182" y="126" fill="white" font-size="11">ARUS MELINTAS</text></svg></div></div>
 <div class="vehicle-causal"><div><span>01 / PERILAKU</span><b>Jemput · Turun · Menunggu</b><small>Kejadian dan durasi kendaraan</small></div><span class="vehicle-causal-arrow">${icon('arrow-right',20)}</span><div><span>02 / KONDISI</span><b>Ruang tepi jalan & antrean</b><small>Hambatan yang dilaporkan pengamat</small></div><span class="vehicle-causal-arrow">${icon('arrow-right',20)}</span><div><span>03 / DAMPAK</span><b>Arus dan akses pejalan</b><small>Harus diukur, bukan diasumsikan</small></div><span class="vehicle-causal-arrow">${icon('arrow-right',20)}</span><div><span>04 / PENANGANAN</span><b>Uji A1 / A2 terhadap A0</b><small>Simulasi & keputusan dengan bukti</small></div></div></section>
 <section class="vehicle-filter-panel" aria-label="Filter catatan kendaraan"><div><span class="vehicle-eyebrow dark">PILIH DATA YANG DIANALISIS</span><h3>Eksplorasi kejadian kendaraan</h3></div><div class="vehicle-filter-grid"><label>Sumber data<select id="vehicle-source" class="control">${options([['demo','Contoh sintetis (demo)'],['manual','Observasi lapangan manual']],d.source)}</select></label><label>Aktivitas<select id="vehicle-type" class="control">${options([['all','Semua aktivitas'],...ACTIVITIES.map(t=>[t,ACTIVITY_NAMES[t]])],filter.type||'all')}</select></label><label>Zona<select id="vehicle-zone" class="control">${options([['all','Semua zona'],...d.zones.map(z=>[z,z])],filter.zone||'all')}</select></label></div></section>
 <div class="vehicle-mode-status ${context?'demo':''}">${icon(context?'flask-conical':'clipboard-check',17)} <b>${context?'SIMULASI ANTARMUKA / CONTOH SINTETIS':'OBSERVASI MANUAL / BELUM DIVERIFIKASI'}</b><span>${context?'Angka di bawah berasal dari delapan contoh data, bukan kondisi Fatmawati.':'Data input pengamat; dampak dan aturan masih memerlukan pemeriksaan.'}</span></div>
 <section class="vehicle-kpis" aria-label="Indikator kejadian"><article><span>Kejadian tercatat</span><strong>${d.filtered.length}</strong><small>${d.sourceCount} kejadian pada sumber terpilih</small></article><article><span>Durasi berhenti rata-rata</span><strong>${dash(d.avgDwell)}<em> dtk</em></strong><small>Hanya dari durasi yang tercatat</small></article><article><span>Lewati ambang analitis</span><strong>${d.overThreshold}</strong><small>Durasi &gt; ${d.threshold} detik, bukan pelanggaran</small></article><article><span>Laporan akses pejalan terhalang</span><strong>${d.impacts.pedestrian.yes}</strong><small>${d.impacts.pedestrian.unknown} belum diperiksa</small></article></section>
 <div class="vehicle-columns"><section class="vehicle-panel"><header><div><span class="vehicle-eyebrow dark">PERILAKU KENDARAAN</span><h3>Aktivitas yang tercatat</h3></div><button class="vehicle-text-link" data-route="observation">Buka observasi ${icon('arrow-right',15)}</button></header><div class="vehicle-bars">${ACTIVITIES.map(t=>`<div class="vehicle-bar-row"><div><b>${ACTIVITY_NAMES[t]}</b><span>${d.counts[t]} kejadian</span></div>${bar(d.counts[t],max)}</div>`).join('')}</div><div class="vehicle-notice">${icon('alert-circle',16)} Periode pengamatan tidak selalu sama. Gunakan Diagnosis Hambatan untuk membandingkan kejadian per jam berdasarkan interval.</div></section>
 <section class="vehicle-panel"><header><div><span class="vehicle-eyebrow dark">DAMPAK YANG DILAPORKAN</span><h3>Indikator hambatan</h3></div></header><div class="vehicle-impact-list">${[['Jalur pejalan terhalang',d.impacts.pedestrian],['Lajur kendaraan terhalang',d.impacts.lane],['Antrean terbentuk',d.impacts.queue]].map(([name,entry])=>`<div class="vehicle-impact"><strong>${name}</strong><div><span class="vehicle-confirmed">${entry.yes} dilaporkan</span><span>${entry.unknown} tidak diketahui</span></div></div>`).join('')}</div><p class="vehicle-hint">Status <b>tidak diketahui</b> tidak boleh dihitung sebagai bukti tidak terjadi hambatan. Ini adalah laporan pengamat, belum pembuktian kausal.</p></section></div>
 <section class="vehicle-panel vehicle-zone-panel"><header><div><span class="vehicle-eyebrow dark">DI MANA PERLU DIPERIKSA</span><h3>Zona kejadian kendaraan</h3><p>Peringkat ini menunjukkan jumlah catatan terpilih, bukan tingkat kemacetan. Untuk perbandingan intensitas antarzona, gunakan interval observasi dengan durasi jelas.</p></div><button class="vehicle-text-link" data-route="mapview">Buka peta ${icon('arrow-right',15)}</button></header><div class="vehicle-zone-grid">${d.zoneRows.length?d.zoneRows.map((z,i)=>`<article class="vehicle-zone-card"><span class="vehicle-zone-rank">ZONA ${String(i+1).padStart(2,'0')}</span><strong>${safe(z.zone)}</strong><div><b>${z.count}</b><span>kejadian tercatat</span></div><small>${z.waiting} menunggu · ${z.aboveThreshold} melebihi ambang · ${z.knownImpact} laporan hambatan</small></article>`).join(''):'<p class="vehicle-empty">Belum ada zona dengan kejadian sesuai filter.</p>'}</div></section>
 <section class="vehicle-panel vehicle-solution-panel"><header><div><span class="vehicle-eyebrow dark">DARI GEJALA KE INTERVENSI</span><h3>Opsi penyelesaian yang perlu diuji</h3><p>Tindakan berikut berasal dari aturan penapisan transparan, bukan keputusan otomatis.</p></div></header><div class="vehicle-actions-grid">${d.hypotheses.map(h=>`<article class="vehicle-action"><span class="vehicle-scenario">${safe(h.code)}</span><h4>${safe(h.title)}</h4><p>${safe(h.reason)}</p><small>${safe(h.action)}</small></article>`).join('')}</div><div class="vehicle-solution-buttons"><button class="btn primary" data-route="diagnosis">Periksa bukti interval ${icon('arrow-right',16)}</button><button class="btn" data-route="simulation">Uji A0 / A1 / A2 ${icon('arrow-right',16)}</button><button class="btn" data-route="evaluation">Tinjau akses & keputusan ${icon('arrow-right',16)}</button></div></section>
 <section class="vehicle-panel vehicle-ledger"><header><div><span class="vehicle-eyebrow dark">SOURCE TRACEABILITY</span><h3>Jejak kejadian kendaraan</h3><p>Waktu, zona, aktivitas, dan durasi. Tidak mencatat pelat nomor atau identitas pengemudi.</p></div></header><div class="table-wrap"><table class="data-table"><thead><tr><th>Waktu</th><th>Zona</th><th>Jenis</th><th>Kendaraan</th><th>Durasi</th><th>Sumber</th></tr></thead><tbody>${d.filtered.slice().sort((a,b)=>new Date(b.at)-new Date(a.at)).slice(0,30).map(e=>`<tr><td>${safe(shortDate(e.at))} · ${safe(clock(e.at))}</td><td>${safe(e.zone||'—')}</td><td>${safe(e.type||'—')}</td><td>${safe(e.vehicle||'—')}</td><td>${Number.isFinite(Number(e.duration))?Number(e.duration):'—'} dtk</td><td>${context?'Sintetis':'Manual'}</td></tr>`).join('')}</tbody></table>${!d.filtered.length?'<div class="vehicle-empty">Tidak ada kejadian untuk filter ini. Catat observasi manual atau pilih contoh sintetis.</div>':''}</div></section>
 ${note('<strong>Batas interpretasi:</strong> SIMPUL mengkaji aktivitas berhenti kendaraan dan keterbatasan ruang penjemputan. Pencarian kejadian tidak membuktikan pelanggaran atau identitas kendaraan. Simulasi A0/A1/A2 belum terkalibrasi untuk Fatmawati.')}`;
}


// SOURCE MODULE: js/monitoring.js
/** Pure monitoring projections. Never turn demo records into field evidence. */
const SOURCES = ['manual','demo'];
const validDate=x=>{const t=Date.parse(x);return Number.isFinite(t)?t:null;};
function filterEvents(records=[], filter={}){
  const now=Date.now();const range=filter.range||'all';const span=({day:86400000,week:7*86400000,month:30*86400000})[range];
  return records.filter(r=>{
    if(!SOURCES.includes(r.source))return false;
    if(filter.source&&filter.source!=='all'&&r.source!==filter.source)return false;
    if(filter.zone&&filter.zone!=='all'&&r.zone!==filter.zone)return false;
    const t=validDate(r.at);return t!==null&&(!span||(t>=now-span&&t<=now+300000));
  }).sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));
}
function jakartaHour(date){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).format(new Date(date)).replace(', ','T');}
function jakartaDay(date){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(date));}
function timeSeries(records=[], filter={}){
  const filtered=filterEvents(records,filter);const days=new Set(filtered.map(x=>jakartaDay(x.at)));
  const granularity=(filter.range==='day'||(filter.range==='all'&&days.size<=1))?'hour':'day';
  const keyOf=x=>granularity==='hour'?jakartaHour(x.at):jakartaDay(x.at);
  const bins=new Map();for(const e of filtered){const key=keyOf(e);if(!bins.has(key))bins.set(key,{key,manual:0,demo:0});bins.get(key)[e.source]++;}
  return {granularity,bins:[...bins.values()].sort((a,b)=>a.key.localeCompare(b.key)).slice(-24),filtered};
}
function monitorStats(records=[],sessions=[],filter={}){
  const items=filterEvents(records,filter),manual=items.filter(x=>x.source==='manual'),demo=items.length-manual.length;
  const dwell=items.reduce((s,e)=>s+(Number(e.duration)||0),0);
  const completed=sessions.filter(s=>s.status==='Selesai'&&((filter.source||'all')==='all'||s.source===filter.source)).length;
  const counts={};for(const e of items)counts[e.type]=(counts[e.type]||0)+1;
  return {total:items.length,manual:manual.length,demo,completed,meanDwell:items.length?dwell/items.length:null,counts,last:items.at(-1)||null};
}
function monitorAlerts(records=[],sessions=[],now=Date.now()){
  const alerts=[];const manual=records.filter(e=>e.source==='manual');
  if(!manual.length)alerts.push({type:'info',title:'Belum ada observasi lapangan',detail:'Data demo tersedia untuk menguji antarmuka. Mulai sesi nyata untuk membuat data yang dapat dievaluasi.'});
  if(sessions.some(s=>s.status==='Berjalan'&&Date.parse(s.startedAt)<now-2*60*60*1000))alerts.push({type:'warning',title:'Sesi berlangsung lebih dari 2 jam',detail:'Periksa apakah sesi masih aktif dan pastikan pencatatan sesuai periode survei.'});
  if(manual.length&&Math.max(...manual.map(e=>Date.parse(e.at)||0))<now-24*60*60*1000)alerts.push({type:'info',title:'Tidak ada rekaman manual 24 jam terakhir',detail:'Ini merupakan indikator kesegaran data, bukan bukti gangguan lalu lintas.'});
  return alerts;
}


// SOURCE MODULE: js/views/overview.js

function miniMap(){return `<div class="map-frame"><svg viewBox="0 0 620 330" preserveAspectRatio="xMidYMid slice"><defs><pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse"><path d="M 34 0 L 0 0 0 34" fill="none" stroke="#d8e7e9" stroke-width=".8"/></pattern></defs><rect width="620" height="330" fill="url(#grid)"/><path d="M-40 250 C180 225 270 175 640 98" stroke="#cbdbe1" stroke-width="52" fill="none"/><path d="M-40 250 C180 225 270 175 640 98" stroke="#fff" stroke-width="36" fill="none"/><path d="M-40 250 C180 225 270 175 640 98" stroke="#d9e5e9" stroke-width="2" stroke-dasharray="7 7" fill="none"/><path d="M120 -40C175 95 265 245 360 380" stroke="#d3dee4" stroke-width="38" fill="none"/><path d="M120 -40C175 95 265 245 360 380" stroke="#fff" stroke-width="24" fill="none"/><path d="M450 -50C430 55 490 215 530 370" stroke="#d1e0e5" stroke-width="29" fill="none"/><path d="M450 -50C430 55 490 215 530 370" stroke="#fff" stroke-width="18" fill="none"/><path d="M20 40h100M270 275h85M460 35h80" stroke="#b6cfcc" stroke-width="6" opacity=".45"/><path d="M210 225 380 190" stroke="#0c9584" stroke-width="8" stroke-linecap="round" stroke-dasharray="4 12"/><circle cx="285" cy="210" r="22" fill="#0b8b7c" opacity=".12"/><circle cx="285" cy="210" r="9" fill="#0a907e" stroke="white" stroke-width="4"/><circle cx="400" cy="185" r="8" fill="#2868b5" stroke="white" stroke-width="3"/><circle cx="219" cy="224" r="7" fill="#dfad51" stroke="white" stroke-width="3"/><text x="298" y="185" fill="#336b76" font-size="14" font-weight="700">FATMAWATI</text><text x="410" y="164" fill="#7a9ca4" font-size="9">ZONA C</text><text x="183" y="258" fill="#7a9ca4" font-size="9">ZONA A</text></svg><div class="map-label"><i class="pin"></i> Peta skematis - bukan GIS terverifikasi</div></div>`}
function heroMap(){return `<div class="hero-map"><svg viewBox="0 0 420 320" fill="none"><g stroke="#ffffff" opacity=".22" stroke-width="1"><path d="M20 285 240 10M62 300 285 28M106 322 329 53M155 332 374 74M206 334 418 91M252 336 445 129M-30 194l420 90M-30 148l435 90M-8 103l430 92M45 46l367 89"/></g><path d="M60 230C180 270 226 135 386 170" stroke="#40e3cd" stroke-width="10" stroke-linecap="round" opacity=".55"/><circle cx="181" cy="216" r="12" fill="#fff"/><circle cx="181" cy="216" r="25" fill="#5cf4d9" opacity=".25"/><circle cx="294" cy="161" r="9" fill="#eafffa"/></svg></div>`}
function renderOverview(){
 const s=getState(), stats=observationStats(s.observations), manual=s.observations.filter(o=>o.source==='manual').length,
 interval=(s.fieldReadings||[]).filter(o=>o.source==='manual').length,
 reviewed=(s.sessions||[]).filter(x=>x.source==='manual' && x.status==='Selesai').length;
 const evidenceReady=manual>0&&interval>0;
 return `${pageHead('SIMPUL / FATMAWATI','Kendaraan Berhenti. Antrean Terbentuk. Akses MRT Terdampak.','SIMPUL menelusuri aktivitas kendaraan, ruang penjemputan, antrean, dan akses pejalan kaki sebelum menguji penataan.')}
 <section class="solution-hero"><div class="solution-hero-copy"><div class="solution-eyebrow">SI BRIDGES INDONESIA 2026 · SATU MASALAH, SATU LOKASI</div><h2>Mengapa kendaraan penjemput bisa menghambat akses MRT?</h2><p>Mulai dari aktivitas kendaraan yang teramati: menjemput, menurunkan, dan menunggu. Periksa durasi dan lokasi berhentinya, ukur antrean serta akses pejalan, lalu uji A0/A1/A2. Semua hasil menyatakan asal data dan batas validasinya.</p><div class="solution-hero-actions">${button(`${icon('car-front',17)} Analisis masalah kendaraan`,'goto-vehicles','primary')}${button(`${icon('map-pinned',17)} Buka peta koridor`,'goto-mapview','')}</div><div class="solution-hero-foot">${icon('shield-check',15)} Tidak ada klaim kondisi lalu lintas nyata dari data sintetis.</div></div><div class="solution-hero-visual">${heroMap()}<div class="solution-visual-caption">FATMAWATI · SKEMATIS / BUKAN PETA GIS</div></div></section>
 <div class="section-h solution-heading"><h2>Dari masalah kendaraan menuju keputusan</h2><small>ALUR UTAMA</small></div>
 <div class="solution-steps">
  ${[
   ['01','Identifikasi perilaku kendaraan','Bedakan aktivitas jemput, turun dan menunggu; periksa durasi serta dampaknya.','car-front','vehicles','Periksa kendaraan'],
   ['02','Ukur hambatan','Catat kejadian, volume, antrean dan akses pejalan kaki pada interval.','scan-search','diagnosis','Buka diagnosis'],
   ['03','Uji penataan','Bandingkan A0 eksisting, A1 area jemput, dan A2 aturan berhenti.','git-compare-arrows','simulation','Bandingkan A0/A1/A2'],
   ['04','Putuskan dengan bukti','Tinjau antrean, akses pejalan dan mutu bukti sebelum rekomendasi.','clipboard-check','evaluation','Tinjau keputusan']
  ].map(x=>`<article class="solution-step"><div class="solution-step-top"><span>${x[0]}</span>${icon(x[3],21)}</div><h3>${x[1]}</h3><p>${x[2]}</p><button type="button" data-route="${x[4]}">${x[5]} ${icon('arrow-right',16)}</button></article>`).join('')}
 </div>
 <div class="section-h"><h2>Kesiapan bukti pengamatan</h2><small>BERDASARKAN DATA YANG TERSIMPAN</small></div>
 <section class="solution-evidence"><div class="solution-evidence-head"><div><span class="solution-kicker">SOURCE & QUALITY GATE</span><h3>${evidenceReady?'Observasi tersimpan, perlu validasi lanjutan':'Belum siap untuk rekomendasi lapangan'}</h3><p>${evidenceReady?'Ada input manual; evaluasi masih membutuhkan peninjauan dan kalibrasi model.':'Contoh awal adalah data sintetis. Tambahkan hasil survei manual dan pengukuran interval sebelum menarik kesimpulan.'}</p></div><span class="solution-state">${evidenceReady?'PERLU TINJAUAN':'DEMO / BELUM TERVALIDASI'}</span></div><div class="solution-evidence-metrics"><div><strong>${manual}</strong><span>Kejadian manual</span></div><div><strong>${interval}</strong><span>Interval manual</span></div><div><strong>${reviewed}</strong><span>Sesi selesai (belum tentu ditinjau)</span></div><div><strong>${stats.synthetic}</strong><span>Contoh sintetis</span></div></div><div class="solution-evidence-actions">${button(`Catat observasi ${icon('arrow-right',16)}`,'goto-observation','primary')}${button('Rencana survei','goto-survey')}${button('Kualitas bukti','goto-standards')}</div></section>
 <div class="solution-two-col"><section class="card solution-map-card">${cardHeading('Satu lokasi: MRT Fatmawati','Peta ilustratif; koordinat hasil survei hanya ditampilkan jika tersedia.',tag('LOKASI STUDI','slate'))}${miniMap()}<div class="solution-link-row"><button type="button" data-route="mapview">${icon('map',16)} Peta interaktif ${icon('arrow-right',15)}</button><button type="button" data-route="documents">${icon('file-text',16)} Cari laporan PDF ${icon('arrow-right',15)}</button></div></section><section class="card solution-options">${cardHeading('Tiga alternatif yang diuji','Intervensi harus dibandingkan terhadap permintaan lalu lintas setara.')}
 <div class="solution-option"><b>A0</b><div><strong>Kondisi eksisting</strong><p>Titik pembanding sebelum intervensi.</p></div></div>
 <div class="solution-option"><b>A1</b><div><strong>Penataan area jemput</strong><p>Optimasi pemanfaatan fasilitas yang tersedia.</p></div></div>
 <div class="solution-option"><b>A2</b><div><strong>Aturan lokasi dan durasi berhenti</strong><p>Uji batas waktu atau perpindahan titik.</p></div></div>
 ${button(`Jalankan perbandingan ${icon('arrow-right',15)}`,'goto-simulation','primary')}<p class="solution-limit">Hasil cepat merupakan estimasi ilustratif; SUMO Fatmawati belum terkalibrasi.</p></section></div>
 <section class="solution-secondary"><div><span class="solution-kicker">FITUR PENDUKUNG</span><h3>Data, monitoring, dan implementasi</h3><p>Gunakan dashboard lanjutan setelah alur diagnosis dan simulasi dipahami. Integrasi API memerlukan konfigurasi server sesuai dokumentasi.</p></div><div class="solution-secondary-links"><button type="button" data-route="monitor">${icon('activity',16)} Monitoring</button><button type="button" data-route="classification">${icon('clipboard-list',16)} Klasifikasi kejadian</button><button type="button" data-route="reports">${icon('files',16)} Laporan</button><button type="button" data-route="business">${icon('chart-no-axes-combined',16)} Model bisnis</button></div></section>
 ${note('<strong>Integritas data:</strong> 8 kejadian awal merupakan contoh sintetis. Status kesiapan bukti bukan persetujuan instansi. Tidak ada pelacakan identitas kendaraan, pengenalan wajah, atau penetapan pelanggaran otomatis.')}
 <section class="solution-credits"><div><span class="solution-kicker">THE PEOPLE BEHIND SIMPUL</span><h3>About the Creators</h3><p>Proyek iSeeDesignITB dikembangkan oleh lima mahasiswa ITB. Kenali tim dan pembagian perannya pada bagian terakhir aplikasi.</p></div><button type="button" data-route="creators" class="btn primary">Kenali tim ${icon('arrow-right',17)}</button></section>`;
}


// SOURCE MODULE: js/views/project.js




const stages = [
 {id:'observation',step:'01',label:'Observasi',icon:'clipboard-list',input:'Lokasi, waktu, jenis kendaraan, durasi berhenti, volume dan antrean',process:'Surveyor mencatat kejadian manual dari HP; pengamatan dipisahkan menurut sesi dan zona.',output:'Dataset kejadian berstempel waktu dan sumber data.',status:'Dapat dicoba dalam aplikasi'},
 {id:'insights',step:'02',label:'Analisis SI',icon:'brain-circuit',input:'Data observasi terstruktur dan catatan anonim',process:'Statistik deskriptif dibentuk secara deterministik; Gemini opsional menginterpretasikan agregat.',output:'Pola kejadian, anomali, ringkasan dan item yang perlu ditinjau.',status:'Statistik berfungsi; Gemini memerlukan API key'},
 {id:'simulation',step:'03',label:'Simulasi',icon:'git-compare-arrows',input:'Volume, geometri, lokasi akses, durasi berhenti, konfigurasi skenario',process:'Bandingkan A0 kondisi eksisting, A1 area jemput, A2 aturan berhenti dengan permintaan setara.',output:'Tundaan, antrean dan indikator akses; setiap hasil menyatakan asal model.',status:'Demo heuristik; SUMO nyata opsional pada jaringan sintetis'},
 {id:'reports',step:'04',label:'Evaluasi',icon:'file-check-2',input:'Hasil skenario, asumsi, dan bukti observasi',process:'Pengelola meninjau trade-off kendaraan dan pejalan kaki sebelum keputusan lapangan.',output:'Rekomendasi, ekspor laporan dan catatan keterbatasan.',status:'Ekspor data berfungsi; evaluasi lapangan belum dilakukan'}
];
const targets=[
 ['O1 / V1','F1-score pengenalan kejadian','≥ 0,80','Target proposal; butuh anotasi manusia'],
 ['O2 / V2','Galat estimasi volume','≤ 20%','Target proposal; butuh sesi validasi terpisah'],
 ['O3 / V3','Skenario yang dibandingkan','A0, A1, A2','Wajib memakai permintaan dan seed yang sebanding'],
 ['O4 / V4','Akses pejalan kaki','Evaluasi eksplisit','Detour dan keselamatan wajib diperiksa'],
 ['O5 / V5','Provenance keputusan','Log dan status','Laporan harus membedakan data dan simulasi'],
 ['UX pilot','Pengurangan waktu penyusunan laporan','≥ 20%','Target proposal; memerlukan uji pengguna']
];
function renderProject(){const s=getState();const manual=s.observations.filter(x=>x.source==='manual').length,synthetic=s.observations.filter(x=>x.source==='demo').length;
return `${pageHead('PROPOSAL / SYSTEM DESIGN','Cara Kerja SIMPUL','Penjelasan fungsi, input, pemrosesan, output, tanggung jawab pengguna dan bukti verifikasi sesuai proposal iSeeDesignITB.')}
<section class="scope-hero"><div class="scope-top"><span class="scope-kicker">SI BRIDGES INDONESIA 2026 · FATMAWATI, JAKARTA SELATAN</span>${tag('SATU MASALAH, SATU LOKASI','white')}</div><h2>Bagaimana mengurangi hambatan akibat aktivitas penjemputan tanpa memperburuk akses transportasi massal?</h2><p>SIMPUL adalah alat bantu evaluasi pengaturan penjemputan. Sistem tidak menggantikan kewenangan pengelola jalan atau membuktikan manfaat intervensi sebelum divalidasi di lapangan.</p><div class="scope-actions">${button(`Mulai observasi ${icon('arrow-right')}`,'goto-observation','primary')} ${button(`Bandingkan skenario ${icon('arrow-right')}`,'goto-simulation','')}</div></section>
<div class="section-h"><h2>Alur end-to-end berdasarkan proposal</h2><small>Empat modul inti</small></div>
<div class="scope-stages">${stages.map(x=>`<article class="scope-stage"><div class="scope-stage-head"><span class="scope-number">${x.step}</span><span class="scope-stage-icon">${icon(x.icon,20)}</span></div><h3>${x.label}</h3><div class="scope-key">Input</div><p>${x.input}</p><div class="scope-key">Pemrosesan</div><p>${x.process}</p><div class="scope-key">Output</div><p>${x.output}</p><div class="scope-stage-bottom">${tag(x.status,'blue')}${button(`Buka modul ${icon('arrow-right')}`,'goto-'+x.id,'sm')}</div></article>`).join('')}</div>
<div class="two-cols" style="margin-top:19px"><section class="card">${cardHeading('Skenario perubahan','Alternatif dari halaman 2 proposal, bukan desain jalan final.')}
<div class="scope-option"><strong>A0</strong><div><b>Kondisi eksisting</b><p>Baseline sebelum intervensi. Harus dikalibrasi terhadap hasil observasi.</p></div></div><div class="scope-option"><strong>A1</strong><div><b>Area penjemputan</b><p>Menguji pemanfaatan fasilitas penjemputan yang telah tersedia.</p></div></div><div class="scope-option"><strong>A2</strong><div><b>Aturan berhenti</b><p>Menguji perubahan durasi dan lokasi kendaraan berhenti.</p></div></div>
${button(`Buka pengaturan A0 / A1 / A2 ${icon('arrow-right')}`,'goto-simulation','primary')}
</section><section class="card">${cardHeading('Asal data dan status hasil','Transparansi dari input hingga rekomendasi.')}
<div class="scope-source"><span class="scope-dot source-demo"></span><div><b>Data sintetis</b><p>${synthetic} kejadian awal: hanya untuk menguji antarmuka dan alur perangkat lunak.</p></div></div>
<div class="scope-source"><span class="scope-dot source-manual"></span><div><b>Observasi manual</b><p>${manual} kejadian yang dimasukkan melalui aplikasi; belum otomatis tervalidasi.</p></div></div>
<div class="scope-source"><span class="scope-dot source-external"></span><div><b>Data publik/API</b><p>OSM, cuaca, dan data kontekstual dilabeli sumbernya; bukan hitungan kendaraan lapangan.</p></div></div>
<div class="scope-source"><span class="scope-dot source-sumo"></span><div><b>Simulasi</b><p>Heuristik adalah ilustrasi. Backend SUMO menjalankan jaringan sintetis, bukan model Fatmawati terkalibrasi.</p></div></div>
</section></div>
<div class="section-h"><h2>Target spesifikasi dan bukti evaluasi</h2><small>Dari proposal, halaman 3–4</small></div><section class="card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Kode</th><th>Yang dievaluasi</th><th>Target</th><th>Status dan metode verifikasi</th></tr></thead><tbody>${targets.map(x=>`<tr><td>${tag(x[0],'slate')}</td><td><strong>${x[1]}</strong></td><td>${safe(x[2])}</td><td>${safe(x[3])}</td></tr>`).join('')}</tbody></table></div><p class="helper" style="margin-top:11px">Angka di atas adalah target penelitian, bukan hasil pengujian yang sudah tercapai.</p></section>
<div class="section-h"><h2>Pilot yang realistis</h2></div><div class="cards three"><section class="card">${cardHeading('01 · Siapkan data')}<p class="helper">Rencanakan 12 sesi observasi, masing-masing 30–60 menit. Tentukan zona, jam sibuk, izin, dan format catatan terlebih dahulu.</p>${button('Buka observasi','goto-observation')}</section><section class="card">${cardHeading('02 · Kalibrasi')}<p class="helper">Pisahkan data kalibrasi dan validasi. Reproduksi volume, antrean, dan pola berhenti pada jaringan Fatmawati yang sudah diverifikasi.</p>${button('Buka simulasi','goto-simulation')}</section><section class="card">${cardHeading('03 · Uji bersama pengguna')}<p class="helper">Minta pengelola meninjau skenario dan akses pejalan kaki. Bandingkan waktu pembuatan laporan manual dengan SIMPUL.</p>${button('Lihat laporan','goto-reports')}</section></div>
${note('<strong>Batas MVP:</strong> aplikasi berfungsi untuk observasi manual, penyajian data, integrasi kontekstual yang terkonfigurasi, demonstrasi skenario, proyeksi bisnis, dan ekspor. Pemrosesan video otomatis, model Fatmawati terkalibrasi, sistem multi-organisasi, serta pengambilan keputusan resmi belum tersedia.','warning')}`;
}


// SOURCE MODULE: js/views/monitor.js




const sel=(value,option)=>value===option?'selected':'';
const monitorFmt=s=>{try{return shortDate(s)+' · '+clock(s)+' WIB'}catch{return '—'}};
function metric(label,value,foot,name){return `<article class="monitor-kpi"><span class="monitor-kpi-caption">${label}</span><div class="monitor-kpi-value">${value}</div><span class="monitor-kpi-foot">${foot}</span><span class="monitor-kpi-icon">${icon(name,20)}</span></article>`}
function graph(bins=[]){if(!bins.length)return `<div class="monitor-empty-chart">${icon('activity',29)}<strong>Belum ada kejadian pada filter ini</strong><span>Pilih semua sumber atau mulai sesi observasi manual.</span></div>`;
  const W=820,H=250,left=43,right=18,top=19,bottom=48,plotH=H-top-bottom,plotW=W-left-right,max=Math.max(1,...bins.map(x=>x.demo+x.manual));
  const width=Math.min(37,Math.max(12,(plotW/bins.length)*.49)),spacing=plotW/bins.length;
  const lines=[0,.25,.5,.75,1].map(x=>{const y=top+(1-x)*plotH;return `<line x1="${left}" y1="${y}" x2="${W-right}" y2="${y}" stroke="#e2eaf0" stroke-dasharray="4 6"/><text x="${left-9}" y="${y+4}" text-anchor="end" fill="#8193a6" font-size="11">${Math.round(max*x)}</text>`}).join('');
  const bars=bins.map((x,i)=>{const cx=left+spacing*i+spacing/2,dh=plotH*x.demo/max,mh=plotH*x.manual/max;
    return `<g><rect x="${cx-width/2}" y="${top+plotH-dh}" width="${width}" height="${dh}" rx="3" fill="#abc8de"/><rect x="${cx-width/2}" y="${top+plotH-dh-mh}" width="${width}" height="${mh}" rx="3" fill="#0a8f81"/><title>${safe(x.key)}: ${x.manual} manual, ${x.demo} demo</title></g>`}).join('');
  const every=Math.max(1,Math.ceil(bins.length/7));const ticks=bins.map((x,i)=>i%every===0?`<text x="${left+spacing*i+spacing/2}" y="${H-14}" text-anchor="middle" fill="#8193a6" font-size="10">${safe(x.key.slice(-8).replace('T',' '))}</text>`:'').join('');
  return `<svg class="monitor-plot" viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik jumlah kejadian per ${bins.length} interval. Hijau untuk manual, biru untuk data demo.">${lines}${bars}${ticks}</svg>`;
}
function eventTable(rows){if(!rows.length)return `<div class="monitor-no-results">Belum ada kejadian yang sesuai filter.</div>`;
 return `<div class="monitor-table-wrap"><table class="monitor-table"><thead><tr><th>Waktu</th><th>Kejadian</th><th>Zona</th><th>Durasi</th><th>Sumber</th></tr></thead><tbody>${rows.slice(-40).reverse().map(e=>`<tr><td>${safe(monitorFmt(e.at))}</td><td><span class="monitor-dot ${e.source==='manual'?'real':''}"></span><strong>${safe(e.type)}</strong><small>${safe(e.vehicle)}</small></td><td>${safe(e.zone)}</td><td>${num(e.duration)} dtk</td><td><span class="monitor-source ${e.source}">${e.source==='manual'?'MANUAL':'DEMO'}</span></td></tr>`).join('')}</tbody></table></div>`;}
function journal(log=[]){if(!log.length)return `<p class="monitor-muted">Belum ada aktivitas pengguna yang dicatat pada perangkat ini.</p>`;
 return `<div class="monitor-timeline">${[...log].reverse().slice(0,9).map(e=>`<div class="monitor-timeline-row"><span class="monitor-timeline-point ${e.level==='warning'?'warn':''}"></span><div><strong>${safe(e.message)}</strong><small>${safe(monitorFmt(e.at))} - ${safe(e.kind)}</small></div></div>`).join('')}</div>`;
}
function renderMonitor(){const s=getState(),flt=s.monitorFilter||{source:'all',zone:'all',range:'all'},series=timeSeries(s.observations,flt),st=monitorStats(s.observations,s.sessions,flt),alerts=monitorAlerts(s.observations,s.sessions),remote=s.monitorRemote,checked=remote?.checkedAt;
  const zones=[...new Set(s.observations.map(x=>x.zone))].sort();const active=s.activeSession;const latest=st.last?monitorFmt(st.last.at):'Belum ada';const syncState=remote?.connected===true?'Terhubung':remote?.connected===false?'Offline / API belum aktif':'Belum diperiksa';
  return `${pageHead('OPERASI / DATA OBSERVABILITY','Monitoring & Data Log','Pantau aktivitas lapangan, audit perubahan, kesegaran data, dan sinkronisasi server dari satu halaman.',`${button(`${icon('refresh-cw')} Segarkan server`,'refresh-monitor')} ${button(`${icon('download')} Ekspor log`,'export-monitor','primary')}`)}
<section class="monitor-hero"><div><span class="monitor-hero-eyebrow"><span class="monitor-live-dot"></span> FIELD OPERATIONS / OBSERVABILITY</span><h2>Semua kejadian tercatat.<br/><em>Setiap sumber dapat ditelusuri.</em></h2><p>Grafik dan log lokal bekerja offline. Data manual dapat disinkronkan ke SQLite, kemudian diproyeksikan ke InfluxDB untuk monitoring Grafana.</p><div class="monitor-hero-actions"><button class="monitor-white-button" data-action="goto-observation">${icon('plus',16)} Catat kejadian</button><button class="monitor-ghost-button" data-action="goto-reports">Lihat laporan ${icon('arrow-right',15)}</button></div></div><div class="monitor-signal"><div class="monitor-signal-top">SIMPUL / DATA STREAM <span>●&nbsp; LOCAL</span></div><div class="monitor-signal-wave">${Array.from({length:25},(_,i)=>`<span style="height:${14+(i*19%54)+(i%4)*7}px"></span>`).join('')}</div><div class="monitor-signal-row"><span>Observasi terpilih</span><strong>${st.total}</strong></div><div class="monitor-signal-row"><span>Status backend</span><strong>${safe(syncState)}</strong></div></div></section>
<div class="monitor-toolbar"><div class="monitor-toolbar-left"><span class="monitor-toolbar-title">${icon('sliders-horizontal',16)} Filter data</span><label>Sumber <select id="monitor-source" class="monitor-select"><option value="all" ${sel(flt.source,'all')}>Semua sumber</option><option value="manual" ${sel(flt.source,'manual')}>Observasi manual</option><option value="demo" ${sel(flt.source,'demo')}>Data demo saja</option></select></label><label>Periode <select id="monitor-range" class="monitor-select"><option value="all" ${sel(flt.range,'all')}>Semua waktu</option><option value="day" ${sel(flt.range,'day')}>24 jam</option><option value="week" ${sel(flt.range,'week')}>7 hari</option><option value="month" ${sel(flt.range,'month')}>30 hari</option></select></label><label>Zona <select id="monitor-zone" class="monitor-select"><option value="all">Semua zona</option>${zones.map(z=>`<option value="${safe(z)}" ${sel(flt.zone,z)}>${safe(z)}</option>`).join('')}</select></label></div><button class="monitor-reset" data-action="reset-monitor-filters">Reset filter</button></div>
<div class="monitor-kpis">${metric('Kejadian dalam filter',num(st.total),`${st.manual} manual - ${st.demo} demo`,'car')}${metric('Rata-rata durasi',st.meanDwell===null?'—':num(st.meanDwell)+' dtk','Berdasarkan rekaman tersaring','clock')}${metric('Sesi selesai',num(st.completed),active?'1 sesi sedang berjalan':'Tidak ada sesi aktif','clipboard-list')}${metric('Pencatatan terakhir',st.last?clock(st.last.at)+' WIB':'—',latest==='Belum ada'?'Belum ada data':shortDate(st.last.at),'activity')}</div>
<div class="monitor-layout"><section class="monitor-panel monitor-chart-panel"><div class="monitor-panel-head"><div><span class="monitor-kicker">ACTIVITY VOLUME</span><h3>Tren kejadian tercatat</h3><p>Jumlah kejadian per ${series.granularity==='hour'?'jam':'hari'} dalam periode dan zona yang dipilih.</p></div><span class="monitor-chip">${series.bins.length} interval</span></div><div class="monitor-legend"><span><i class="real"></i> Manual lapangan</span><span><i class="demo"></i> Sintetis / demo</span></div>${graph(series.bins)}</section><section class="monitor-panel monitor-alert-panel"><div class="monitor-panel-head"><div><span class="monitor-kicker">DATA QUALITY</span><h3>Kondisi pengamatan</h3><p>Pemeriksaan administratif, bukan pengukuran lalu lintas.</p></div></div><div class="monitor-status-row"><span>Mode pencatatan</span><strong>${active?'Sesi aktif':'Siap mencatat'}</strong></div><div class="monitor-status-row"><span>Backend SQLite</span><strong class="${remote?.connected===true?'monitor-green':''}">${safe(syncState)}</strong></div><div class="monitor-status-row"><span>Segar terakhir</span><strong>${checked?safe(monitorFmt(checked)):'Belum pernah'}</strong></div><div class="monitor-alerts">${alerts.length?alerts.map(a=>`<div class="monitor-notice ${a.type}">${icon(a.type==='warning'?'alert-circle':'info',17)}<div><strong>${safe(a.title)}</strong><p>${safe(a.detail)}</p></div></div>`).join(''):`<div class="monitor-notice positive">${icon('check',17)}<div><strong>Tidak ada peringatan data dasar</strong><p>Periksa validitas dan konsistensi secara terpisah sebelum menarik kesimpulan.</p></div></div>`}</div></section></div>
<div class="monitor-layout monitor-lower"><section class="monitor-panel"><div class="monitor-panel-head"><div><span class="monitor-kicker">EVENT LEDGER</span><h3>Log observasi</h3><p>Hanya kejadian yang tersimpan; tidak menampilkan identitas individu.</p></div><span class="monitor-chip">${series.filtered.length} baris</span></div>${eventTable(series.filtered)}</section><section class="monitor-panel"><div class="monitor-panel-head"><div><span class="monitor-kicker">AUDIT TRAIL</span><h3>Aktivitas workspace</h3><p>Log aktivitas lokal pada perangkat ini.</p></div></div>${journal(s.activityLog)}</section></div>
<section class="monitor-panel monitor-infra"><div><span class="monitor-kicker">INTEGRASI MONITORING</span><h3>Dari HP ke monitoring multi-sesi</h3><p>Observasi manual dicatat di HP. Backend menyimpan data utama di SQLite dan mengirim metrik ke InfluxDB melalui antrean tahan-gagal. Grafana menampilkan deret waktu dari data manual yang benar-benar tersinkronisasi. Tidak ada streaming kamera ataupun survei otomatis.</p><div class="monitor-infra-flow"><span>HP / PWA</span>${icon('arrow-right',16)}<span>FastAPI + SQLite</span>${icon('arrow-right',16)}<span>Outbox</span>${icon('arrow-right',16)}<span>InfluxDB</span>${icon('arrow-right',16)}<span>Grafana</span></div></div><div class="monitor-infra-actions">${button(`${icon('upload-cloud',15)} Sinkronkan manual`,'sync-observations','primary')}${button('Periksa status server','refresh-monitor')}${remote?.connected?`<span class="monitor-caption">Server: ${remote?.summary?.count??0} event manual tersimpan</span>`:`<span class="monitor-caption">Opsional; memerlukan backend aktif</span>`}</div></section>
<div class="eval-disclaimer"><div>${icon('scan-search',19)}</div><div><strong>Baru: data interval untuk diagnosis</strong><p>Selain log peristiwa, catat volume lalu lintas, antrean dan akses pejalan kaki melalui modul Diagnosis Hambatan. Rekaman interval manual disimpan di SQLite dan dapat diteruskan ke InfluxDB sebagai measurement <code>simpul_field_interval</code> dengan dashboard Grafana terpisah.</p>${button('Buka Diagnosis Hambatan','goto-diagnosis')}</div></div>
<section class="monitor-observability"><div class="monitor-panel-head"><div><span class="monitor-kicker">TIME-SERIES STACK / OPSIONAL</span><h3>InfluxDB + Grafana</h3><p>Backend berusaha mengirim observasi yang belum terkirim. Jika koneksi gagal, data tetap aman di antrean SQLite.</p></div><span class="monitor-chip">90 hari retensi konfigurasi Docker</span></div>
<div class="monitor-stream-grid"><article class="monitor-stream-card"><div class="monitor-stream-icon">${icon('database',19)}</div><span>INFLUXDB / TIME SERIES</span><strong>${!remote?.connected?'Belum diperiksa':remote?.stream?.configured?'Dikonfigurasi':'Nonaktif'}</strong><small>${remote?.stream?.lastSuccessfulWrite?'Kirim terakhir '+safe(monitorFmt(remote.stream.lastSuccessfulWrite)):'Memerlukan kredensial pada backend'}</small></article><article class="monitor-stream-card"><div class="monitor-stream-icon">${icon('list-clock',19)}</div><span>OUTBOX SQLITE</span><strong>${num(remote?.stream?.pending??0)} event + ${num(remote?.stream?.fieldIntervals?.pending??0)} interval tertunda</strong><small>Event terkirim: ${num(remote?.stream?.delivered??0)} · interval terkirim: ${num(remote?.stream?.fieldIntervals?.delivered??0)}</small></article><article class="monitor-stream-card"><div class="monitor-stream-icon">${icon('chart-no-axes-combined',19)}</div><span>GRAFANA / VISUALIZATION</span><strong>Dashboard siap dimuat</strong><small>Jalankan Docker profile monitoring; buka localhost:3000 pada komputer host.</small></article></div>
<div class="monitor-auto-row"><label class="monitor-auto-toggle"><input id="monitor-auto-sync" type="checkbox" ${s.monitorAutoSync?'checked':''}/><span>Sinkronisasi otomatis tiap 30 detik saat halaman ini terbuka</span></label><div class="monitor-stream-actions">${button(`${icon('send',14)} Coba kirim ulang outbox`,'flush-telemetry')}${button('Periksa koneksi InfluxDB','probe-telemetry')}</div></div>
<div class="monitor-safety-note">Status sukses berarti InfluxDB menerima data, bukan bahwa observasi telah divalidasi. Sinkronisasi otomatis dimatikan secara default. Data demo tidak dikirim.</div>
</section>
<div class="monitor-disclosure">${icon('shield-check',16)} <span><strong>Integritas data:</strong> Data demo tidak dikirim sebagai observasi riil. Semua angka adalah rekaman input atau agregasi, bukan estimasi dampak di lapangan. Endpoint monitoring tidak boleh diekspos secara publik sebelum autentikasi diterapkan.</span></div>`;
}


// SOURCE MODULE: js/views/publicintel.js




const statusTag=(ok)=>ok?'<span class="intel-chip green">Terpasang dan diizinkan</span>':'<span class="intel-chip amber">Perlu konfigurasi backend</span>';
function renderPublicIntel(){
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


// SOURCE MODULE: js/views/context.js




const displayNumber=v=>typeof v==='number'&&Number.isFinite(v)?v.toLocaleString('id-ID',{maximumFractionDigits:1}):'—';
function liveMap(place,showExternal=false){
  if(!place)return `<div class="geo-placeholder"><div class="geo-icon">${icon('map-pinned',35)}</div><strong>Lokasi belum dipilih</strong><p>Cari lokasi secara manual di atas. Peta dari OpenStreetMap akan ditampilkan setelah lokasi dipilih.</p></div>`;
  const lat=Number(place.lat),lon=Number(place.lon);
  if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return '';
  const delta=.007,box=[lon-delta,lat-delta,lon+delta,lat+delta].map(x=>x.toFixed(6)).join('%2C');
  const url=`https://www.openstreetmap.org/export/embed.html?bbox=${box}&layer=mapnik&marker=${lat.toFixed(6)}%2C${lon.toFixed(6)}`;
  const link=`https://www.openstreetmap.org/?mlat=${lat.toFixed(6)}&mlon=${lon.toFixed(6)}#map=16/${lat.toFixed(6)}/${lon.toFixed(6)}`;
  const preview=`<div class="geo-vector-preview"><svg viewBox="0 0 600 290" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><pattern id="geo-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M 30 0 L 0 0 0 30" fill="none" stroke="#c9dddf" stroke-width="1" opacity=".65"/></pattern><linearGradient id="geo-gradient" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#e6f5f3"/><stop offset="1" stop-color="#edf3f9"/></linearGradient></defs><rect width="600" height="290" fill="url(#geo-gradient)"/><rect width="600" height="290" fill="url(#geo-grid)"/><circle cx="308" cy="145" r="105" fill="#12a493" opacity=".05"/><circle cx="308" cy="145" r="76" stroke="#188776" stroke-width="1" stroke-dasharray="5 8" opacity=".3" fill="none"/><circle cx="308" cy="145" r="49" stroke="#188776" stroke-width="1" opacity=".2" fill="none"/><path d="M308 93c-25 0-45 20-45 45 0 36 45 78 45 78s45-42 45-78c0-25-20-45-45-45z" fill="#087d72"/><circle cx="308" cy="139" r="16" fill="#e9faf6"/><circle cx="308" cy="139" r="7" fill="#2dc9b2"/><path d="M53 210H166M432 81H552" stroke="#1366a7" stroke-opacity=".22" stroke-width="2" stroke-dasharray="8 7"/><circle cx="166" cy="210" r="5" fill="#1366a7" opacity=".4"/><circle cx="432" cy="81" r="5" fill="#1366a7" opacity=".4"/></svg><div class="geo-vector-label"><span class="geo-coord-chip">${lat.toFixed(5)}° / ${lon.toFixed(5)}°</span><strong>Lokasi berhasil ditemukan</strong><span>Pratinjau koordinat - bukan geometri jalan</span><button type="button" class="btn primary" data-action="load-map">${icon('layers',16)} Muat peta OpenStreetMap</button></div></div>`;
  return `<div class="geo-live-map">${showExternal?`<iframe loading="lazy" title="Peta OpenStreetMap lokasi studi" src="${url}" referrerpolicy="strict-origin-when-cross-origin"></iframe>`:preview}<div class="map-credit"><span>© OpenStreetMap contributors - Data komunitas</span><a href="${link}" target="_blank" rel="noopener noreferrer">Buka peta besar ${icon('external-link',12)}</a></div></div>`;
}
function renderContext(){const s=getState(),d=s.context||{},location=s.project.geo||null,weather=d.weather,poi=d.nearby,traffic=d.traffic;
return `${pageHead('DATA / GIS & OPEN API','Peta & Data Konteks','Cari lokasi, tinjau fasilitas transit dari OpenStreetMap, dan ambil konteks cuaca melalui API nyata.',button(`${icon('waypoints')} Context Intelligence Lab`,'goto-contextplus'))}
${note('<strong>Sumber:</strong> OpenStreetMap Nominatim (pencarian), Overpass (objek peta), dan Open-Meteo (kondisi cuaca). Peta belum diverifikasi di lapangan. Cuaca tidak boleh ditafsirkan sebagai pengukuran kemacetan.')}
<section class="card" style="margin-bottom:18px"><div class="card-title"><div><h2>01 / Temukan lokasi studi</h2><p>Pencarian dilakukan hanya ketika tombol ditekan; bukan autocomplete.</p></div>${tag('API NYATA','')}</div>
<form id="geo-search-form" class="geo-search"><div class="field"><label for="geo-query">Nama stasiun atau kawasan</label><input required maxlength="120" minlength="3" id="geo-query" class="control" placeholder="Contoh: Stasiun MRT Fatmawati, Jakarta" value="${safe(d.query||'Stasiun MRT Fatmawati, Jakarta')}" /></div><button type="submit" class="btn primary">${icon('search',16)} Cari lokasi</button></form>
${d.results?.length?`<div class="geo-results">${d.results.map((x,i)=>`<button type="button" data-action="select-geo" data-index="${i}" class="geo-result">${icon('map-pin',18)}<span><strong>${safe(x.name)}</strong><small>${Number(x.lat).toFixed(5)}, ${Number(x.lon).toFixed(5)} - OpenStreetMap</small></span>${icon('chevron-right',16)}</button>`).join('')}</div>`:`<p class="helper">Hasil pencarian akan muncul di sini. Layanan Nominatim publik membatasi penggunaan dan memerlukan atribusi.</p>`}</section>
<div class="two-cols" style="margin-bottom:18px"><section class="card">${cardHeading('02 / Peta kawasan','Pratinjau koordinat; muat peta OpenStreetMap bila diperlukan.',tag(location?'LOKASI TERPILIH':'BELUM DIPILIH',location?'':'slate'))}${liveMap(location,d.mapVisible)}<div class="geo-position">${location?`<strong>${safe(location.name)}</strong><span>WGS84 ${Number(location.lat).toFixed(5)}, ${Number(location.lon).toFixed(5)}</span>`:'<span>Jalankan pencarian dan pilih salah satu hasil.</span>'}</div></section>
<section class="card">${cardHeading('03 / Ambil data eksternal','Permintaan tidak otomatis; klik layanan yang diperlukan.')}
<div class="api-service-card"><div class="api-service-icon">${icon('cloud-sun',22)}</div><div><strong>Cuaca sekitar lokasi</strong><p>Data kontekstual waktu API, bukan sensor SIMPUL.</p></div>${button('Ambil cuaca','fetch-weather','primary')}</div>
${weather?`<div class="weather-show"><div><small>Suhu udara</small><strong>${displayNumber(weather.temperature)}°C</strong></div><div><small>Presipitasi</small><strong>${displayNumber(weather.rain)} mm</strong></div><div><small>Kelembapan</small><strong>${displayNumber(weather.humidity)}%</strong></div></div><p class="helper">Open-Meteo - ${safe(weather.time||'waktu tidak tersedia')} WIB. Data prakiraan/kondisi model, bukan pengamatan survei.</p>`:''}
<div class="api-service-card"><div class="api-service-icon">${icon('train-front',22)}</div><div><strong>Fasilitas sekitar</strong><p>Halte bus, akses subway, parkir (radius 450 m).</p></div>${button('Ambil OSM','fetch-nearby','primary')}</div>
${poi?`<p class="helper">${poi.count} entitas OSM ditemukan - cakupan tidak dijamin lengkap.</p>`:''}
<div class="api-service-card"><div class="api-service-icon">${icon('gauge',22)}</div><div><strong>Traffic Flow Live</strong><p>Kecepatan segmen jalan terdekat dari TomTom. API key diperlukan.</p></div>${button('Cek lalu lintas','fetch-traffic','primary')}</div>
${traffic?`<div class="weather-show"><div><small>Kecepatan saat ini</small><strong>${displayNumber(traffic.currentSpeedKmph)} km/j</strong></div><div><small>Free flow</small><strong>${displayNumber(traffic.freeFlowSpeedKmph)} km/j</strong></div><div><small>Rasio kecepatan</small><strong>${displayNumber(traffic.speedRatio*100)}%</strong></div></div><p class="helper">TomTom Traffic Flow - Snapshot segmen terdekat. Bukan jumlah kendaraan atau bukti hasil intervensi.</p>`:''}
</section></div>
<section class="card">${cardHeading('04 / Inventaris fasilitas dari Overpass','Objek OSM yang berhasil ditarik; bukan hasil survei fisik.',poi?tag('SUMBER EKSTERNAL',''):tag('BELUM DIMUAT','slate'))}
${poi?.items?.length?`<div class="table-wrap"><table class="data-table"><thead><tr><th>Fasilitas</th><th>Kategori</th><th>Koordinat</th><th>Asal data</th></tr></thead><tbody>${poi.items.map(v=>`<tr><td><strong>${safe(v.name)}</strong></td><td>${safe(v.category)}</td><td>${v.lat!=null&&v.lon!=null?`${Number(v.lat).toFixed(5)}, ${Number(v.lon).toFixed(5)}`:'—'}</td><td>OSM ${safe(String(v.osmId))}</td></tr>`).join('')}</tbody></table></div>`:poi?emptyState('Tidak ada objek yang dikembalikan','OpenStreetMap dapat memiliki data yang belum lengkap.'):emptyState('Data fasilitas belum dimuat','Pilih lokasi dan tekan Ambil OSM untuk mencari objek terdekat.')}
</section><p class="footnote">Kebijakan Nominatim publik melarang pencarian otomatis terus-menerus serta membatasi laju permintaan. Untuk penggunaan komersial berskala besar, gunakan geocoder terkelola atau host sendiri. Open-Meteo juga menetapkan syarat berbeda untuk penggunaan komersial.</p>`;
}


// SOURCE MODULE: js/views/contextplus.js




const fmt=(n,d=1)=>Number.isFinite(Number(n)) && n!==null && n!==undefined?Number(n).toLocaleString('id-ID',{maximumFractionDigits:d}):'—';
const hour=(s)=>safe(String(s||'').slice(11,16)||'—');
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
function renderContextPlus(){const s=getState(),c=s.contextPlus||{},geo=s.project.geo;
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


// SOURCE MODULE: js/views/simulation.js

function renderSimulation(){const s=getState(),p=s.scenario,results=s.lastAnalysis||heuristicSimulation(p),comparison=compareScenarios(results),ranking=rankScenarios(results),best=ranking[0],maxDelay=Math.max(...comparison.map(x=>x.delay),1);const names={A0:'Kondisi eksisting',A1:'Area penjemputan',A2:'Aturan berhenti'};return `${pageHead('ENGINEERING / DIGITAL TWIN','Simulasi Skenario','Bandingkan intervensi dengan asumsi konsisten. Gunakan estimasi interaktif untuk eksplorasi awal, atau SUMO jika backend tersedia.',`${button(`${icon('refresh-cw')} Reset parameter`,'reset-scenario')} ${button(`${icon('play')} Jalankan analisis`,'run-simulation','primary')}`)}
${note(`<strong>${results.engine==='sumo'?'Keluaran SUMO demonstrasi':'Estimasi ilustratif, bukan SUMO'}:</strong> ${results.engine==='sumo'?'Engine SUMO benar-benar dieksekusi pada jaringan sintetis, tidak mewakili jaringan Fatmawati yang terkalibrasi.':'Model demonstrasi memakai pendekatan matematis sederhana, belum divalidasi dengan 12 sesi survei yang direncanakan. Angka bukan pengukuran dampak lalu lintas.'}`,results.engine==='sumo'?'':'warning')}
<div class="analysis-grid"><section class="card">${cardHeading('Parameter eksperimen','Berlaku pada A0, A1, dan A2 sesuai peran masing-masing parameter.',tag('EDITABLE','blue'))}<div style="display:grid;gap:21px">${rangeField('traffic','Arus kendaraan (kendaraan/jam)',200,1500,p.traffic,50,'')}${rangeField('pickupShare','Proporsi kendaraan jemput (%)',0,45,p.pickupShare,1,'%')}${rangeField('dwell','Dwell time awal (detik)',10,180,p.dwell,5,'s')}${rangeField('diversion','A1: pengalihan ke area jemput (%)',0,100,p.diversion,5,'%')}${rangeField('ruleDwell','A2: batas waktu berhenti (detik)',5,120,p.ruleDwell,5,'s')}${rangeField('pedestrianDetour','Jarak akses pejalan kaki awal (m)',0,500,p.pedestrianDetour,10,'m')}</div><div class="form-actions">${button(`${icon('play')} Hitung estimasi`,'run-simulation','primary wide')} ${button(`${icon('cloud')} Jalankan SUMO nyata`,'run-sumo','wide')}</div><p class="helper" style="margin-top:13px">Tombol SUMO nyata memerlukan layanan backend dengan executable <code>sumo</code> dan <code>netconvert</code>. Jika tidak tersedia, sistem akan menampilkan pesan kegagalan, tidak memalsukan hasil.</p></section>
<section class="card">${cardHeading('Perbandingan kinerja','Indikator utama: tundaan kendaraan, antrean, dan jarak akses.',tag(results.engine==='sumo'?'SUMO DEMO':'ESTIMASI ILUSTRATIF',results.engine==='sumo'?'blue':'gold'))}
<div class="metrics-compare">${comparison.map(x=>`<div class="scenario-card ${best.id===x.id?'recommended':''}"><div class="head"><b>${x.id}</b>${best.id===x.id?tag('SKOR TERENDAH') :tag('ALTERNATIF','slate')}</div><div class="helper" style="margin-top:4px">${names[x.id]}</div><div class="big">${num(x.delay)}<span style="font-size:11px;color:#788799;font-weight:700;margin-left:4px">dtk</span></div><div class="unit">Rata-rata tundaan model</div><div class="compare-foot"><span>vs A0</span><strong>${x.id==='A0'?'Baseline':`${x.delayChange>0?'+':''}${pct(x.delayChange)}`}</strong></div></div>`).join('')}</div>
<div class="result-section">${cardHeading('Tundaan relatif','Lebih pendek menunjukkan tundaan estimasi yang lebih rendah.')}<div class="bars" style="margin-top:23px">${comparison.map(x=>`<div class="bar-row"><label>${x.id} — ${names[x.id]}</label><div class="bar-track" style="height:13px"><div class="bar-fill ${x.id==='A0'?'navy':x.id==='A2'?'blue':''}" style="width:${x.delay/maxDelay*100}%"></div></div><strong>${num(x.delay)}s</strong></div>`).join('')}</div></div><div class="form-divider"></div><div class="cards three" style="gap:8px">${comparison.map(x=>`<div style="background:#f7fafb;border-radius:9px;padding:12px"><div class="mini-kicker">${x.id}</div><div style="font-size:18px;font-weight:850;margin:7px 0;color:#294061">${num(x.queue)} <span style="font-size:9px;color:#8996a5">kend.</span></div><div class="helper">Panjang antrean model</div><div class="helper">Akses ${num(x.access)} m</div></div>`).join('')}</div><p class="footnote">Waktu tundaan dan panjang antrean berasal dari ${results.engine==='sumo'?'simulasi SUMO pada jaringan uji sintetis':'persamaan demonstrasi heuristik'}. Jarak akses merupakan parameter geometri asumsi, bukan simulasi pejalan kaki.</p></section></div>
<div class="section-h"><h2>Interpretasi dan keputusan</h2></div><div class="grid-halves"><section class="card"><div class="mini-kicker">HASIL PEMERINGKATAN ILUSTRATIF</div><h2 style="font-size:21px;margin:8px 0;color:#19385c">${best.id} — ${names[best.id]}</h2><p class="helper">Mendapat skor berbobot terkecil berdasarkan tundaan (60%), antrean (25%), dan jarak akses (15%) dalam model demo. Bukan rekomendasi operasional yang disetujui.</p><div class="callout warning"><strong>Keputusan tetap memerlukan verifikasi</strong>Periksa geometri, permintaan kendaraan, variasi seed, keselamatan pedestrian, dan keakuratan data sebelum menyarankan perubahan nyata.</div></section><section class="card">${cardHeading('Keterlacakan model')}<div class="result-pill"><span>Jenis keluaran</span><strong>${results.engine==='sumo'?'SUMO synthetic network':'Heuristik ilustratif'}</strong></div><div class="result-pill"><span>Kalibrasi Fatmawati</span><strong>Belum dilakukan</strong></div><div class="result-pill"><span>Sumber data pengamatan</span><strong>Sintetis + manual</strong></div><div class="result-pill"><span>Status validasi</span><strong>Belum tervalidasi</strong></div>${button(`${icon('arrow-right')} Buka temuan & keputusan`,'goto-insights','')}</section></div>`}


// SOURCE MODULE: js/views/insights.js

function renderInsights(){const s=getState(),o=observationStats(s.observations),r=s.lastAnalysis||heuristicSimulation(s.scenario),best=rankScenarios(r)[0];const demoOnly=o.real===0;return `${pageHead('INSIGHT / DECISION SUPPORT','Temuan & Keputusan','Audit sumber bukti dan alur dari observasi sampai rekomendasi sebelum tindakan fisik.',`${button(`${icon('download')} Ekspor laporan`,'export-report','primary')}`)}
${note('<strong>Validasi diperlukan:</strong> temuan di bawah merupakan agregasi dari rekaman browser, bukan hasil Gemini yang tervalidasi. Keputusan pengaturan lalu lintas harus dikaji dan disetujui pihak berwenang.')}
<div class="cards three" style="margin-bottom:17px"><div class="card"><div class="stat-label">REKAMAN YANG DITINJAU</div><div class="stat-value">${o.count}</div><div class="stat-foot">${o.real} manual; ${o.synthetic} sintetis</div></div><div class="card"><div class="stat-label">DURASI BERHENTI RATA-RATA</div><div class="stat-value">${num(o.avgDwell)} <span style="font-size:11px">detik</span></div><div class="stat-foot">Agregasi aritmetis dari catatan tersedia</div></div><div class="card"><div class="stat-label">STATUS EVIDENCE</div><div class="stat-value" style="font-size:19px;margin-top:14px">Belum tervalidasi</div><div class="stat-foot">Observasi terpisah dan kalibrasi diperlukan</div></div></div>
<div class="two-cols"><section class="card">${cardHeading('Ringkasan temuan','Temuan deterministik dari data yang tersimpan',tag(demoOnly?'HANYA DEMO':'CAMPURAN','gold'))}<ul class="list-clean"><li><div class="li-ico">${icon('car',16)}</div><div><strong>${o.pickup} kejadian penjemputan</strong><p>Jumlah berasal dari kategori Jemput yang tercatat. Belum dapat digeneralisasi ke volume lalu lintas total.</p></div></li><li><div class="li-ico">${icon('clock',16)}</div><div><strong>${o.waiting} kejadian menunggu</strong><p>Definisi menunggu mengikuti pilihan petugas saat input, bukan klasifikasi video otomatis.</p></div></li><li><div class="li-ico">${icon('map-pin',16)}</div><div><strong>${o.zoneCount} zona memiliki catatan</strong><p>Distribusi zona perlu dibandingkan dengan durasi sesi yang setara.</p></div></li></ul><div class="callout warning" style="margin-top:13px"><strong>AI Gemini melalui backend</strong>Analisis hanya menggunakan agregat kejadian manual (tanpa catatan bebas, foto, atau identitas). Perlu kunci GEMINI_API_KEY di server. Hasil AI adalah interpretasi yang belum diverifikasi.<div class="form-actions">${button(`${icon('sparkles')} Analisis dengan Gemini`,'ai-insights','primary')}</div></div>${s.aiInsights?`<div class="api-ai-result"><h3>Gemini · Hasil belum tervalidasi</h3><p>${safe(s.aiInsights.result.summary)}</p>${[['Temuan',s.aiInsights.result.findings],['Keterbatasan',s.aiInsights.result.limitations],['Langkah lanjut',s.aiInsights.result.nextSteps]].map(([name,items])=>`<strong>${name}</strong><ul>${items.map(x=>`<li>${safe(x)}</li>`).join('')}</ul>`).join('')}<small>${safe(s.aiInsights.model)} - ${s.aiInsights.sourceEvents} kejadian manual - memerlukan review manusia</small></div>`:''}</section>
<section class="card">${cardHeading('Rantai keterlacakan','Klik modul terkait untuk meninjau setiap tahapan.')}${[['Data observasi',`${o.count} catatan; ${o.real} manual`, 'goto-observation','database'],['Asumsi model',`${Object.keys(s.scenario).length} parameter tersimpan`,'goto-simulation','sliders-horizontal'],['Keluaran skenario',`${r.engine==='sumo'?'SUMO demo':'Estimasi heuristik'}; 3 alternatif`,'goto-simulation','git-compare-arrows'],['Interpretasi awal',`${best.id} skor terendah, tidak mengikat`,'goto-simulation','target'],['Laporan','Unduh bukti dan keterbatasan','goto-reports','files']].map((x,i)=>`<button data-action="${x[2]}" class="btn" style="width:100%;border:0;border-bottom:1px solid #edf1f4;border-radius:0;padding:15px 4px;display:flex;justify-content:space-between;text-align:left"><span style="display:flex;align-items:center;gap:11px"><span style="color:#0a877a">${icon(x[3],19)}</span><span><strong style="display:block;color:#324962">${i+1}. ${x[0]}</strong><small style="font-size:9px;color:#8796a4;font-weight:500">${x[1]}</small></span></span>${icon('chevron-right',15)}</button>`).join('')}</section></div>
<div class="section-h"><h2>Kriteria penerimaan proposal</h2></div><section class="card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Objektif</th><th>Target</th><th>Metode pengujian</th><th>Status</th></tr></thead><tbody>${[['Deteksi kejadian','F1-score ≥ 0,80','Bandingkan dengan anotasi manusia'],['Estimasi volume','Galat ≤ 20%','Validasi pada sesi terpisah'],['Evaluasi alternatif','A0, A1, A2','Pengulangan SUMO dan sensitivitas'],['Akses pejalan kaki','Jarak dan trade-off','Audit aksesibilitas'],['Audit keputusan','Asumsi dan sumber tercatat','Pengujian data dan log']].map(x=>`<tr><td><strong>${x[0]}</strong></td><td>${x[1]}</td><td>${x[2]}</td><td>${tag('BELUM DIUJI','gold')}</td></tr>`).join('')}</tbody></table></div><p class="footnote">Objektif diambil dari proposal SIMPUL halaman 3. Status tidak akan berubah menjadi "lulus" hanya karena demo berjalan.</p></section>`}


// SOURCE MODULE: js/views/business.js

function moneyField(id,label,val,help=''){return `<div class="field"><label for="${id}">${label}</label><div class="input-suffix"><input class="control finance-input" id="${id}" type="number" min="0" step="${val>=1000000?100000:1}" value="${val}"><span>${val>=1000000?'Rp':'unit'}</span></div>${help?`<small>${help}</small>`:''}</div>`}
function renderBusiness(){const s=getState(),f=s.finance,v=forecast(f),breakdown=directCostShare(f,v.yearEndSites),max=Math.max(...v.rows.map(r=>r.revenue),1);return `${pageHead('MONETIZATION / FINANCIAL MODEL','Business & Revenue Studio','Rancang model komersial B2B/B2G dengan asumsi yang dapat diubah. Bedakan penjualan hipotetis dari transaksi aktual.',`${button(`${icon('refresh-cw')} Reset ke asumsi awal`,'reset-finance')} ${button(`${icon('download')} Unduh proyeksi`,'export-forecast','primary')}`)}
${note('<strong>Semua angka pada halaman ini adalah skenario hipotetis.</strong> Tidak ada pelanggan, kesepakatan, harga pasar, atau pendapatan SIMPUL yang telah diverifikasi. Model ini merupakan alat perencanaan, bukan laporan keuangan.')}
<section class="revenue-hero"><div><small>PROYEKSI TOTAL PENDAPATAN - 12 BULAN</small><strong>${rupiah(v.revenue)}</strong><p>Asumsi lokasi aktif, implementasi, pilot, dan akuisisi dalam model 12 bulan.</p></div><div style="display:flex;flex-direction:column;align-items:flex-start;gap:8px">${tag('HYPOTHETICAL MODEL','white')}<span style="font-size:10px;color:#d0e7ed">Bukan pendapatan aktual</span></div></section>
<div class="cards four" style="margin-bottom:18px">${[['MRR akhir tahun',rupiah(v.mrr),'Langganan bulan ke-12','teal'],['ARR run-rate',rupiah(v.arr),'MRR Desember × 12','navy'],['Laba kotor model',rupiah(v.grossProfit),`Margin ${pct(v.grossMargin)}`,'blue'],['Hasil operasi 12 bulan',rupiah(v.net),v.net>=0?'Positif pada model':'Negatif pada model','gold']].map((x,i)=>`<div class="card"><div class="stat-top"><div class="stat-icon ${i===1?'navy':i===2?'blue':i===3?'gold':''}">${icon(i===0?'chart-no-axes-combined':i===1?'activity':i===2?'calculator':'target',19)}</div></div><div class="stat-label">${x[0]}</div><div class="stat-value" style="font-size:20px">${x[1]}</div><div class="stat-foot">${x[2]}</div></div>`).join('')}</div>
<div class="finance-panel"><section class="card">${cardHeading('Asumsi harga & penjualan','Ubah parameter, seluruh grafik dan biaya dihitung ulang.',tag('EDITABLE','blue'))}<div class="form-grid">${moneyField('sites','Lokasi aktif awal',f.sites)}${moneyField('newSitesPerMonth','Tambahan lokasi / bulan',f.newSitesPerMonth)}${moneyField('monthly','Langganan / lokasi / bulan',f.monthly)}${moneyField('setup','Biaya implementasi / lokasi',f.setup)}${moneyField('pilots','Jumlah paid pilot bulan pertama',f.pilots)}${moneyField('pilotFee','Harga tiap paid pilot',f.pilotFee)}${moneyField('churn','Churn per bulan (%)',f.churn)}</div><div class="form-divider"></div><div class="mini-kicker">Biaya operasional</div><div class="form-grid" style="margin-top:12px">${moneyField('cloudMonthly','Cloud + komputasi / bulan',f.cloudMonthly)}${moneyField('supportPerSite','Dukungan / lokasi / bulan',f.supportPerSite)}${moneyField('implementationCostPerSite','Biaya implementasi / lokasi',f.implementationCostPerSite)}${moneyField('pilotCost','Biaya layanan / pilot',f.pilotCost)}${moneyField('fixedMonthly','Biaya tetap / bulan',f.fixedMonthly)}${moneyField('salesMonthly','Penjualan & pemasaran / bulan',f.salesMonthly)}</div><p class="helper" style="margin-top:16px">Lokasi awal diasumsikan aktif sejak bulan 1. Penambahan lokasi dimulai bulan 2. Pilot dibukukan sebagai pendapatan satu kali bulan 1, tidak otomatis berubah menjadi lokasi berlangganan. Churn diterapkan pada basis lokasi bulanan.</p></section>
<section class="card">${cardHeading('Proyeksi 12 bulan','Hijau: recurring revenue. Biru: implementasi dan pilot.',tag('12 BULAN','slate'))}<div class="legend"><span><i class="teal"></i> Langganan</span><span><i class="navy"></i> Nonrecurring</span></div><div class="chart-wrap"><div class="chart-bars">${v.rows.map(r=>`<div class="chart-col"><div class="chart-stack" title="Bulan ${r.month}: ${rupiah(r.revenue)}"><div class="fill-b" style="height:${(r.setupRevenue+r.pilotRevenue)/max*160}px"></div><div class="fill-a" style="height:${r.recurring/max*160}px"></div></div><span>${r.month}</span></div>`).join('')}</div></div><div class="form-divider" style="margin-top:34px"></div><div class="forecast-summary"><div class="forecast-item"><small>Pendapatan berulang (12 bln)</small><strong>${rupiah(v.recurringTotal)}</strong><p>Jumlah tagihan hipotetis</p></div><div class="forecast-item"><small>Implementasi + pilot</small><strong>${rupiah(v.setupTotal+v.pilotTotal)}</strong><p>Revenue non-berulang</p></div><div class="forecast-item"><small>Biaya langsung (12 bln)</small><strong>${rupiah(v.direct)}</strong><p>Cloud, dukungan, implementasi, pilot</p></div><div class="forecast-item"><small>Biaya total (12 bln)</small><strong>${rupiah(v.costs)}</strong><p>Termasuk operasional tetap dan sales</p></div></div><div class="result-section"><div class="mini-kicker">Komposisi biaya operasional bulan ke-12</div><div class="cost-breakdown">${breakdown.map(x=>`<span class="${x.css}" style="width:${x.value}%"></span>`).join('')}</div><div class="legend">${breakdown.map(x=>`<span><i style="background:${x.css==='a'?'#0b8a7c':x.css==='b'?'#3351a3':x.css==='c'?'#e1af59':'#9bafbc'}"></i>${x.label} ${pct(x.value)}</span>`).join('')}</div></div></section></div>
<div class="section-h"><h2>Metode monetisasi & rasional komersial</h2></div><div class="cards three"><article class="card"><div class="mini-kicker">1 / VALIDASI PRODUK</div><h2 style="font-size:14px">Paid pilot</h2><p class="helper">Survei awal, pemodelan ruang jalan, dan laporan perbandingan skenario. Mengurangi risiko pembeli sebelum kontrak jangka panjang.</p>${tag(rupiah(f.pilotFee)+' / pilot','blue')}</article><article class="card"><div class="mini-kicker">2 / ONBOARDING</div><h2 style="font-size:14px">Implementasi lokasi</h2><p class="helper">Digitasi geometri, pengaturan zona, data awal, kalibrasi dan pelatihan. Biaya satu kali per lokasi.</p>${tag(rupiah(f.setup)+' / lokasi','blue')}</article><article class="card"><div class="mini-kicker">3 / RETENSI</div><h2 style="font-size:14px">Langganan analitik</h2><p class="helper">Dashboard, arsip simulasi, pelaporan berkala, dukungan dan pembaruan model. Nilai berulang harus diuji bersama pelanggan.</p>${tag(rupiah(f.monthly)+' / bulan','blue')}</article></div>
<div class="section-h"><h2>Perbandingan model bisnis</h2><small>Hipotesis strategi, bukan hasil riset pelanggan</small></div><div class="cards four" style="margin-bottom:18px"><div class="card"><div class="mini-kicker">MODEL A</div><h2 style="font-size:13px">Consulting per proyek</h2><p class="helper">Paling mudah diuji melalui satu pekerjaan survei dan simulasi. Pendapatan bergantung pada setiap proyek baru, sehingga skalabilitas dibatasi kapasitas tim.</p>${tag('Uji lewat pilot','slate')}</div><div class="card"><div class="mini-kicker">MODEL B</div><h2 style="font-size:13px">Pure SaaS</h2><p class="helper">Berpotensi recurring, tetapi memerlukan pelanggan yang sudah memiliki data, kesiapan teknis, dan kebutuhan analitik berulang.</p>${tag('Sesudah validasi','slate')}</div><div class="card" style="border-color:#81cbbb;background:linear-gradient(180deg,#f2fbf8,#fff)"><div class="mini-kicker">MODEL C - PRIORITAS AWAL</div><h2 style="font-size:13px">Hybrid implementasi + SaaS</h2><p class="helper">Paid pilot untuk menguji nilai, biaya setup untuk kalibrasi, dan langganan saat manfaat rutin telah terbukti. Perlu pengendalian ongkos onboarding.</p>${tag('Hipotesis terbaik untuk diuji')}</div><div class="card"><div class="mini-kicker">MODEL D</div><h2 style="font-size:13px">Enterprise/API license</h2><p class="helper">Sesuai setelah stabilitas API dan kebutuhan integrasi jelas. Potensi kontrak besar berhadapan dengan siklus pengadaan dan dukungan kompleks.</p>${tag('Tahap ekspansi','slate')}</div></div><div class="callout" style="margin-bottom:17px"><strong>Mengapa Model C menjadi prioritas eksperimen?</strong>Pelanggan awal kemungkinan memerlukan pengumpulan data, konfigurasi koridor, dan kalibrasi sebelum analitik bernilai. Gabungan layanan implementasi dan perangkat lunak menghubungkan pekerjaan awal dengan kebutuhan berulang. Hipotesis ini harus diuji melalui wawancara pembeli, konversi pilot, dan gross margin aktual.</div>
<div class="section-h"><h2>Audit perhitungan bulanan</h2><small>Rupiah, dibulatkan untuk tampilan</small></div><section class="card flush"><div class="table-wrap" style="border:0;border-radius:0"><table class="data-table"><thead><tr><th>Bulan</th><th>Lokasi aktif</th><th>Recurring</th><th>Implementasi</th><th>Pilot</th><th>Biaya total</th><th>Hasil operasi</th></tr></thead><tbody>${v.rows.map(r=>`<tr><td>Bulan ${r.month}</td><td>${num(r.active)}</td><td>${rupiah(r.recurring)}</td><td>${rupiah(r.setupRevenue)}</td><td>${rupiah(r.pilotRevenue)}</td><td>${rupiah(r.costs)}</td><td><strong class="${r.net>=0?'metric-good':'metric-bad'}">${rupiah(r.net)}</strong></td></tr>`).join('')}</tbody></table></div></section><p class="footnote">Rumus, asumsi, dan status ilustratif tersedia di <code>js/finance.js</code>. Model belum mencakup pajak, piutang, modal kerja, depresiasi, diskonto, atau jadwal pembayaran. Tidak boleh digunakan sebagai laporan laba rugi aktual.</p>`}


// SOURCE MODULE: js/views/equipment.js




const DEPLOYMENT_MODES = {
  phone:{name:'HP saja',short:'Observasi manual, laporan, dan demo offline',desc:'Mode operasional minimum di lapangan. Pengamatan dan visualisasi demonstrasi dapat dilakukan pada HP; simulasi SUMO sesungguhnya memerlukan komputer/server.',items:[['phone','Smartphone milik pengguna','Wajib'],['tripod','Tripod HP','Opsional'],['powerbank','Powerbank','Opsional']]},
  cloud:{name:'HP + Cloud',short:'Rekomendasi untuk pilot',desc:'HP untuk observasi dan dashboard; FastAPI dan SUMO berjalan di server. Pengguna tidak harus membawa laptop ke lokasi. Server harus memiliki kontrol akses sebelum deployment publik.',items:[['phone','Smartphone milik pengguna','Wajib'],['cloud','Hosting cloud / bulan','Wajib'],['tripod','Tripod HP','Opsional'],['powerbank','Powerbank','Opsional']]},
  edge:{name:'HP + Akuisisi Opsional',short:'Raspberry Pi sesuai opsi proposal',desc:'Perangkat akuisisi lokal dapat dipakai untuk pilot jika ada izin dan kebutuhan yang jelas. Pencatatan manual tetap tersedia. Pengolahan kamera otomatis belum diimplementasikan.',items:[['phone','Smartphone milik pengguna','Wajib'],['pi','Raspberry Pi / mini PC','Opsional pilot'],['camera','Kamera berizin','Opsional pilot'],['router','Router jaringan','Opsional pilot'],['storage','Media penyimpanan','Opsional pilot'],['cloud','Hosting cloud / bulan','Wajib untuk SUMO cloud']]}
};
const features = [
 ['Pencatatan observasi manual dari HP',['phone','cloud','edge']],
 ['Ekspor CSV dan backup lokal',['phone','cloud','edge']],
 ['Analisis deskriptif dari rekaman',['phone','cloud','edge']],
 ['API konteks dan layanan Gemini (jika terkonfigurasi)',['cloud','edge']],
 ['Eksekusi SUMO pada jaringan contoh (jika terpasang)',['cloud','edge']],
 ['Opsi kamera berizin dan akuisisi lokal',['edge']]
];
function renderEquipment(){
 const s=getState(),mode=DEPLOYMENT_MODES[s.equipmentMode]?s.equipmentMode:'phone',p=s.equipmentPrices,chosen=DEPLOYMENT_MODES[mode];
 const oneTime=chosen.items.reduce((t,x)=>t+(x[0]==='cloud'?0:Number(p[x[0]])||0),0);
 const monthly=chosen.items.some(x=>x[0]==='cloud')?p.cloud:0;
 return `${pageHead('DEPLOYMENT / EQUIPMENT PLANNER','Perangkat & Biaya','Tiga konfigurasi realistis yang mengikuti ruang lingkup proposal SIMPUL.',button(`${icon('download')} Unduh daftar perangkat`,'export-equipment','primary'))}
 ${note('<strong>HP dapat digunakan sebagai perangkat antarmuka dan observasi.</strong> Tanpa backend, analisis skenario hanya ilustratif. Eksekusi SUMO dan integrasi Gemini memerlukan layanan backend dan konfigurasi terkait.')}
 <div class="two-cols"><section class="card">${cardHeading('Pilih konfigurasi','Fokus pada perangkat yang benar-benar dibutuhkan.')}
 ${Object.entries(DEPLOYMENT_MODES).map(([k,v])=>`<div class="equipment-choice ${mode===k?'selected':''}" data-action="select-equipment" data-value="${k}" role="button" tabindex="0"><div class="choice-icon">${icon(k==='phone'?'smartphone':k==='cloud'?'cloud':'database',20)}</div><div style="flex:1"><strong>${v.name}</strong><p>${v.short}</p></div><span class="radio-outer"></span></div>`).join('')}
 <div class="callout"><strong>${chosen.name}</strong>${chosen.desc}</div><div class="section-h"><h2>Alur pengolahan</h2></div><div class="flow-diagram"><div class="flow-node"><span style="color:#0b867a">${icon('smartphone',20)}</span><strong>Browser HP</strong><small>Observasi & hasil</small></div><div class="flow-arrow">${icon('arrow-right')}</div><div class="flow-node"><span style="color:#0b867a">${icon(mode==='phone'?'database':'cloud',20)}</span><strong>${mode==='phone'?'Penyimpanan lokal':'API + Basis data'}</strong><small>${mode==='phone'?'Demo offline':'Data & analisis'}</small></div>${mode!=='phone'?`<div class="flow-arrow">${icon('arrow-right')}</div><div class="flow-node"><span style="color:#0b867a">${icon('git-compare-arrows',20)}</span><strong>SUMO Worker</strong><small>Simulasi di server</small></div>`:''}</div></section>
 <section class="card">${cardHeading('Bill of Materials','Harga awal hanya untuk kalkulasi, bukan penawaran vendor.',tag('ESTIMASI','gold'))}<div class="table-wrap"><table class="data-table" style="min-width:430px"><thead><tr><th>Perangkat / layanan</th><th>Status</th><th>Biaya asumsi</th></tr></thead><tbody>${chosen.items.map(([key,name,required])=>`<tr><td><strong>${name}</strong>${key==='cloud'?'<div style="font-size:9px;color:#93a0ad">Biaya per bulan</div>':''}</td><td>${tag(required,required==='Wajib'?'':'slate')}</td><td><input data-equip="${key}" class="control equipment-input" type="number" min="0" step="50000" value="${p[key]}" aria-label="Biaya ${name}" style="max-width:145px"></td></tr>`).join('')}</tbody></table></div><div class="form-divider"></div><div class="forecast-summary"><div class="forecast-item"><small>CAPEX asumsi</small><strong>${rupiah(oneTime)}</strong><p>Memasukkan item opsional yang tercantum</p></div><div class="forecast-item"><small>OPEX cloud / bulan</small><strong>${rupiah(monthly)}</strong><p>Belum mencakup semua biaya operasi</p></div></div><p class="helper" style="margin-top:12px">Smartphone diasumsikan telah dimiliki (Rp0 biaya pembelian baru). Jika kamera dipakai, pastikan izin pengamatan dan privasi.</p></section></div>
 <div class="section-h"><h2>Kemampuan tiap konfigurasi</h2></div><section class="card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Kemampuan</th><th>HP saja</th><th>HP + Cloud</th><th>HP + Akuisisi</th></tr></thead><tbody>${features.map(([label,supported])=>`<tr><td><strong>${label}</strong></td>${['phone','cloud','edge'].map(key=>`<td style="text-align:center"><span style="font-weight:800;color:${supported.includes(key)?'#087d72':'#a8b2bf'}">${supported.includes(key)?'✓':'—'}</span></td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="helper">Tanda dukungan menjelaskan kemampuan konfigurasi, bukan bukti bahwa seluruh integrasi produksi sudah tersedia.</p></section>`;
}


// SOURCE MODULE: js/views/standards.js




const indicator=(isGood,label,text)=>`<div class="std-check ${isGood?'std-ok':'std-pending'}"><div class="std-check-symbol">${icon(isGood?'check':'alert-circle',17)}</div><div><b>${label}</b><p>${text}</p></div></div>`;
function renderStandards(){
 const s=getState(),q=assessQuality(s);
 const errors=q.issues.filter(x=>x.severity==='block'),review=q.issues.filter(x=>x.severity==='review');
 return `${pageHead('INTERNATIONAL PRACTICES / QUALITY ASSURANCE','Standar & Evidence Quality','Kesiapan bukti pengamatan untuk dibagikan, ditinjau, dan dibandingkan. Referensi internasional digunakan secara proporsional.','')}
 <section class="std-hero"><div class="std-hero-info"><div class="std-eyebrow"><span class="std-live-dot"></span> RESEARCH QUALITY CONTROL · SIMPUL v0.9</div><h2>From field observations<br><em>to defensible decisions.</em></h2><p>Data dapat dipakai untuk keputusan bila asalnya jelas, definisi metrik konsisten, risiko akses ditinjau, dan hasil simulasi diperiksa terhadap pengamatan. Halaman ini mengecek prasyarat teknis; tidak menerbitkan sertifikasi.</p><div class="std-hero-actions">${button(`${icon('download',15)} Export evidence bundle`,'export-evidence-package','primary')}${button(`${icon('map',15)} Export GeoJSON`,'export-study-geojson')}</div></div><div class="std-hero-score"><span>EVIDENCE STATUS</span><strong>${errors.length?'NOT READY':'EXPLORATORY'}</strong><p>${errors.length?'Perlu melengkapi atau memperbaiki data':'Layak untuk eksplorasi; validasi lapangan belum lengkap'}</p><div class="std-hero-stats"><div><b>${q.manualEvents}</b><small>Events</small></div><div><b>${q.manualIntervals}</b><small>Intervals</small></div><div><b>${q.completedManualSessions}</b><small>Sessions</small></div></div></div></section>
 <div class="std-kpi-row"><article class="std-kpi"><span>DATA MANUAL</span><strong>${q.manualEvents+q.manualIntervals}</strong><small>Observasi + interval yang benar-benar dimasukkan</small></article><article class="std-kpi"><span>DATA DEMO DILUAR EVALUASI</span><strong>${q.syntheticEvents}</strong><small>Catatan sintetis dikecualikan</small></article><article class="std-kpi"><span>MATCHED FOLLOW-UP</span><strong>${q.matchedFollowups}</strong><small>Pasangan zona/periode untuk studi deskriptif</small></article><article class="std-kpi"><span>QUALITY FINDINGS</span><strong>${errors.length} / ${review.length}</strong><small>Blokir / perlu ditinjau</small></article></div>
 <div class="std-grid"><section class="std-panel"><div class="std-panel-title"><div><span>01 / DATA ASSURANCE</span><h3>Evidence quality gates</h3><p>Evaluasi deterministik pada data manual di browser.</p></div><span class="std-chip">LIVE CHECK</span></div>
 ${indicator(q.manualEvents+q.manualIntervals>0,'Data tersedia','Dataset manual diperlukan sebelum hasil dipakai untuk analisis eksploratif.')}
 ${indicator(q.manualEvents+q.manualIntervals>0&&q.invalidTime===0,'Timestamp & timezone','Waktu menggunakan format ISO 8601 dengan offset atau UTC eksplisit.')}
 ${indicator(q.manualEvents+q.manualIntervals>0&&q.duplicateIds===0,'Unique record identifiers','Deteksi ID berulang pada event dan interval pengamatan.')}
 ${indicator(errors.length===0&&q.manualIntervals>0,'Numerical integrity','Nilai interval, kapasitas ruang jemput, dan fase harus konsisten.')}
 ${indicator(q.completedManualSessions>=12,'Sampling plan','Target proposal: 12 sesi observasi, bukan kewajiban standar internasional.')}
 ${indicator(q.matchedFollowups>0,'Comparable before–after','Tindak lanjut dibandingkan pada zona dan periode yang sepadan.')}
 ${indicator(false,'Independent field validation','Kalibrasi SUMO, data validasi terpisah, dan persetujuan intervensi belum diverifikasi.')}
 </section>
 <section class="std-panel"><div class="std-panel-title"><div><span>02 / ACTION REGISTER</span><h3>Audit & next actions</h3><p>Temuan ditautkan dengan kekurangan data dan langkah verifikasi.</p></div><span class="std-chip std-chip-warning">${q.issues.length} ITEMS</span></div>
 <div class="std-findings">${q.issues.map(x=>`<div class="std-finding"><span class="std-severity ${x.severity}">${x.severity==='block'?'BLOCKER':'REVIEW'}</span><div><b>${safe(x.code.replaceAll('_',' '))}</b><p>${safe(x.message)}</p></div></div>`).join('')||'<div class="std-empty">Tidak ditemukan masalah data yang dapat diverifikasi otomatis.</div>'}</div>
 <div class="std-warn"><b>Decision safeguard</b><p>Tidak ada skor otomatis yang membuktikan keselamatan, aksesibilitas, efektivitas intervensi, atau kesiapan sertifikasi. Keputusan operasional tetap memerlukan evaluasi serta persetujuan pihak berwenang.</p></div></section></div>
 <div class="std-panel std-reference-panel"><div class="std-panel-title"><div><span>03 / METHODS & INTEROPERABILITY</span><h3>Referensi standar internasional</h3><p>Acuan desain yang dapat diperiksa secara publik. Penerapan tidak sama dengan sertifikasi.</p></div><span class="std-chip">8 REFERENCES</span></div><div class="std-standards">${STANDARD_REFERENCES.map(x=>`<article class="std-reference"><div class="std-ref-top"><strong>${safe(x.code)}</strong><a href="${safe(x.url)}" target="_blank" rel="noopener noreferrer" aria-label="Lihat referensi ${safe(x.code)}">${icon('external-link',14)}<span>Dokumen</span></a></div><h4>${safe(x.name)}</h4><p>${safe(x.application)}</p><small>${safe(x.status)}</small></article>`).join('')}</div></div>
 <section class="std-export-strip"><div><div class="std-eyebrow">EXPORT / MACHINE-READABLE DATA</div><h3>Dataset yang bisa dipertukarkan</h3><p>Evidence bundle memuat asal data, UTC, satuan, pemeriksaan kualitas, dan provenance. GeoJSON hanya mengekspor titik referensi proyek apabila koordinat tersedia; tidak mengarang koordinat per kejadian.</p></div><div class="std-export-actions">${button('Unduh Evidence JSON','export-evidence-package','primary')}${button('Unduh GeoJSON','export-study-geojson')}${button('English executive brief','export-executive-brief')}</div></section>
 ${note('<strong>Metodologi:</strong> ISO 37120/37122 dipakai sebagai acuan konseptual indikator kota, bukan klaim bahwa indikator internal SIMPUL merupakan indikator ISO. WCAG 2.2 AA adalah target desain yang memerlukan audit terpisah.','warning')}`;
}


// SOURCE MODULE: js/views/integrations.js

const items=[
 ['openosint','newspaper','OpenOSINT / GDELT GKG','Konteks berita publik berkoordinat; bukan alat pembuktian pelanggaran.','Konteks Publik / OSINT'],
 ['geo','map-pin','Nominatim / OpenStreetMap','Cari lokasi nyata; input manual dan kebijakan rate limit.','Peta & Konteks'],
 ['nearby','train-front','Overpass API','Temukan halte, akses subway, dan parkir berdasarkan OSM.','Peta & Konteks'],
 ['weather','cloud-sun','Open-Meteo','Cuaca dan presipitasi sebagai faktor konteks.','Peta & Konteks'],
 ['traffic','gauge','TomTom Traffic Flow','Kecepatan lalu lintas segmen terdekat (opsional API key).','Peta & Konteks'],
 ['gemini','brain-circuit','Google Gemini','Interpretasi AI atas agregat observasi tanpa identitas.','Temuan & Keputusan'],
 ['storage','database','SQLite Local API','Simpan dan tarik data observasi manual secara eksplisit.','Observasi Lapangan'],
 ['influxdb','database','InfluxDB OSS 2.x','Data observasi manual sebagai time-series dengan antrean tahan-gagal.','Monitoring & Data Log'],
 ['grafana','activity','Grafana Dashboard','Visualisasi durasi berhenti, zona, jenis kendaraan, dan kesegaran data.','Monitoring & Data Log'],
 ['simulation','workflow','SUMO Worker','Simulasi nyata di jaringan contoh sintetis.','Simulasi Skenario'],
 ['reverse','map-pin','OSM Reverse Geocoder','Alamat berbasis koordinat dari Nominatim; dipanggil manual.','Context Intelligence Lab'],
 ['crossings','accessibility','OSM Pedestrian Metadata','Temukan crossing, kerb, tactile paving dari Overpass.','Context Intelligence Lab'],
 ['forecast','cloud-rain','Open-Meteo Rain Forecast','Prakiraan probabilitas dan presipitasi 12 jam.','Context Intelligence Lab'],
 ['history','calendar-clock','Open-Meteo Historical ERA5','Cuaca historis untuk periode pengamatan.','Context Intelligence Lab'],
 ['airquality','wind','Open-Meteo CAMS AQ','PM2.5, PM10, US AQI berbasis model.','Context Intelligence Lab'],
 ['elevation','mountain','Copernicus DEM GLO-90','Elevasi medan resolusi 90 m, bukan kemiringan trotoar.','Context Intelligence Lab'],
 ['holidays','calendar-days','Nager.Holidays v4','Kalender hari libur Indonesia, verifikasi resmi diperlukan.','Context Intelligence Lab'],
 ['routing','route','OpenRouteService Directions','Rute berjalan kaki, kursi roda dan berkendara.','Context Intelligence Lab'],
 ['isochrone','radar','OpenRouteService Isochrones','Poligon jangkauan pedestrian 5/10/15 menit.','Context Intelligence Lab']
];
function renderIntegrations(){const s=getState(),d=s.integrationStatus,online=!!d?.backend;
return `${pageHead('SYSTEM / CONNECTORS','API & Integrasi','Panel kontrol untuk melihat kesiapan endpoint, integrasi cloud, dan asal setiap respons.',button(`${icon('refresh-cw')} Periksa koneksi`,'check-apis','primary'))}
${note('<strong>Mode penggunaan:</strong> file HTML mandiri tetap berfungsi offline tanpa koneksi API. Agar API aktif, jalankan FastAPI dan akses aplikasi dari http://localhost:8888. Pengujian status tidak berarti layanan eksternal telah dipanggil.')}
<section class="api-hero"><div><span class="api-eyebrow">SIMPUL / INTEGRATION LAYER</span><h2>Connected Mobility Workspace</h2><p>REST API modular - ${items.length} integrasi - Kredensial hanya di backend</p><div class="api-hero-links">${button(`${icon('map')} Jelajahi data kota`,'goto-context')} ${button(`${icon('scan-line')} Sinkronisasi observasi`,'goto-observation')}</div></div><div class="api-hero-pulse"><div class="api-circle">${icon('plug-zap',43)}</div><span>${online?'BACKEND TERHUBUNG':'KONEKSI BELUM DIUJI'}</span></div></section>
<div class="cards three" style="margin-bottom:19px"><article class="card api-number"><small>BACKEND</small><strong>${!d?'Belum dicek':online?'Tersambung':'Tidak tersedia'}</strong><span>${online?'FastAPI merespons /api/status':'Jalankan server lalu periksa koneksi'}</span></article><article class="card api-number"><small>SUMO ENGINE</small><strong>${online?(d.status?.engineAvailable?'Siap':'Belum tersedia'):'—'}</strong><span>Simulasi hanya berjalan jika binary terdeteksi</span></article><article class="card api-number"><small>GEMINI KEY</small><strong>${online?(d.services?.gemini?.enabled?'Terpasang':'Belum diatur'):'—'}</strong><span>Kunci tidak pernah dikirim ke browser</span></article></div>
<div class="api-grid">${items.map(([id,ico,title,desc,target])=>{const v=d?.services?.[id],enabled=id==='simulation'?(d?.status?.engineAvailable===true):(v?.enabled===true);const label=!online?'BELUM DIPERIKSA':enabled?'TERKONFIGURASI':'PERLU SETUP';return `<article class="card api-integration"><div class="api-integr-head"><div class="api-tile">${icon(ico,23)}</div>${tag(label,!online||!enabled?'gold':'')}</div><h3>${title}</h3><p>${desc}</p><div class="api-integr-footer"><small>${safe(v?.note||'Integrasi dengan validasi status dan pembatasan.')}</small><button class="api-open" data-action="goto-${id==='geo'||id==='nearby'||id==='weather'||id==='traffic'?'context':id==='storage'?'observation':id==='gemini'?'insights':id==='simulation'?'simulation':id==='openosint'?'publicintel':['grafana','influxdb'].includes(id)?'monitor':'contextplus'}">${safe(target)} ${icon('arrow-up-right',14)}</button></div></article>`}).join('')}</div>
<div class="section-h"><h2>Alur request API</h2></div><section class="card"><div class="flow-diagram api-flow"><div class="flow-node"><strong>Browser / HP</strong><small>HTTPS / localhost</small></div>${icon('arrow-right',16)}<div class="flow-node"><strong>FastAPI</strong><small>Validasi & pembatasan</small></div>${icon('arrow-right',16)}<div class="flow-node"><strong>Provider / DB</strong><small>OSM, ORS, cuaca, Gemini, SQLite</small></div>${icon('arrow-right',16)}<div class="flow-node"><strong>Dashboard</strong><small>Sumber & status data</small></div></div><p class="helper" style="margin-top:15px">Tidak ada API key di frontend. Panggilan ke penyedia eksternal hanya dilakukan setelah tindakan pengguna. Respons gagal akan ditampilkan sebagai error, bukan diganti angka rekaan.</p></section>
<div class="section-h"><h2>Cara mengaktifkan</h2></div><div class="two-cols"><section class="card"><h3 class="mini-heading">Langkah 1 · Jalankan backend</h3><pre class="api-code">python -m pip install -r server/requirements.txt\npython server/app.py</pre><p class="helper">Buka <strong>http://localhost:8888</strong> dari komputer host dan klik Periksa koneksi. Browser di HP harus dapat menjangkau server secara aman.</p></section><section class="card"><h3 class="mini-heading">Langkah 2 · Kunci API opsional</h3><pre class="api-code">GEMINI_API_KEY=isi_di_environment_server\nORS_API_KEY=isi_di_environment_server\nTOMTOM_API_KEY=isi_di_environment_server</pre><p class="helper">Kunci AI disetel di server (bukan di formulir browser). Untuk publik/komersial, tambahkan autentikasi, kuota, keamanan, dan persetujuan penggunaan data.</p></section></div>`;
}


// SOURCE MODULE: js/api.js
let tokenFallback = '';
function getSessionApiToken(){ try { return sessionStorage.getItem('simpul_api_token') || tokenFallback; } catch { return tokenFallback; } }
function setSessionApiToken(token){ tokenFallback=token; try { if(token) sessionStorage.setItem('simpul_api_token',token); else sessionStorage.removeItem('simpul_api_token'); } catch { /* opaque-origin demo; memory-only token */ } }
/** Same-origin REST adapter: deliberately refuses remote calls from a file:// bundle. */
async function apiRequest(path,{method='GET',body,timeout=25000}={}){
  if(location.protocol==='file:')throw new Error('API memerlukan server. Jalankan python server/app.py lalu buka http://localhost:8888 (bukan file HTML).');
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeout);
  // Optional local/shared-workspace protection. Never put API credentials in project backups.
  const token=getSessionApiToken();
  try{
    const res=await fetch(path,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{'Authorization':'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined,signal:controller.signal});
    const response=await res.json().catch(()=>({}));
    if(!res.ok)throw new Error(typeof response.detail==='string'?response.detail:`API mengembalikan HTTP ${res.status}.`);
    return response;
  }catch(e){if(e.name==='AbortError')throw new Error('Permintaan API melewati batas waktu.');if(e instanceof TypeError)throw new Error('Backend belum tersambung atau jaringan terputus.');throw e;}
  finally{clearTimeout(timer)}
}


// SOURCE MODULE: js/views/settings.js

function renderSettings(){const s=getState();return `${pageHead('SYSTEM / WORKSPACE','Pengaturan & Data','Kelola nama proyek, ekspor cadangan, dan batas kemampuan implementasi saat ini.')}
<div class="grid-halves"><section class="card">${cardHeading('Identitas proyek','Pengaturan disimpan di browser lokal.',tag('LOCAL','slate'))}<form id="project-form"><div class="field" style="margin-bottom:13px"><label for="project-name">Nama studi</label><input class="control" id="project-name" maxlength="90" value="${safe(s.project.name)}" required></div><div class="field" style="margin-bottom:13px"><label for="project-district">Lokasi administratif</label><input class="control" id="project-district" maxlength="120" value="${safe(s.project.district)}"></div><div class="field"><label for="project-desc">Catatan studi</label><textarea class="control" id="project-desc" maxlength="500">${safe(s.project.description)}</textarea></div><div class="form-actions"><button class="btn primary" type="submit">${icon('check')} Simpan proyek</button></div></form></section>
<section class="card">${cardHeading('Manajemen data','Cadangkan atau pulihkan data demo dan hasil pekerjaan.')}
<div class="result-pill"><span>Penyimpanan</span><strong>LocalStorage browser</strong></div><div class="result-pill"><span>Versi schema</span><strong>v${s.version}</strong></div><div class="result-pill"><span>Data fieldwork</span><strong>${s.observations.length} kejadian</strong></div><p class="helper">Hapus cache browser dapat menghilangkan data. Unduh backup sebelum menghapus data atau berpindah perangkat.</p><div class="form-actions">${button(`${icon('download')} Unduh backup`,'export-backup')}<label class="btn" for="import-backup">${icon('database')} Impor backup</label><input id="import-backup" type="file" accept="application/json,.json" hidden></div><div class="form-divider"></div>${button(`${icon('refresh-cw')} Reset ke data demo`,'reset-data','danger')}</section></div>
<section class="card" style="margin-bottom:20px"><div class="section-h"><h2>Keamanan API lokal</h2></div>
<p class="helper">SIMPUL tidak memiliki login organisasi. Jika backend memakai <code>SIMPUL_API_TOKEN</code>, masukkan token untuk sesi browser ini. Jangan menyalin token ke backup, dokumen atau tangkapan layar.</p>
<div class="field"><label for="simpul-api-token">Token API (opsional)</label><input id="simpul-api-token" class="control" type="password" autocomplete="off" placeholder="Disimpan hanya di sessionStorage" /></div>
<div class="form-actions">${button('Simpan token sesi','save-api-token','primary')} ${button('Hapus token sesi','clear-api-token')}</div>
<p class="helper">Status token pada tab: ${getSessionApiToken()?'Terpasang (belum diverifikasi)':'Tidak disimpan'}. Penggunaan jaringan publik tetap membutuhkan identitas pengguna, TLS dan isolasi data proyek.</p></section>
<div class="section-h"><h2>Status integrasi saat ini</h2></div><section class="card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Subsystem</th><th>Kemampuan</th><th>Status</th></tr></thead><tbody>${[['Aplikasi mobile-first','Responsive web & local persistence','Berfungsi'],['Observasi lapangan','Input manual, sesi, CSV, sinkronisasi REST ke SQLite lokal','Berfungsi'],['Analitik cepat','Agregasi dan estimasi heuristik','Demo ilustratif'],['Simulasi SUMO','Worker FastAPI + executable eksternal','Memerlukan SUMO'],['Gemini','Integrasi backend tersedia; perlu GEMINI_API_KEY','Memerlukan key'],['Business Studio','Perhitungan 12 bulan dan sensitivitas','Berfungsi'],['Customer pipeline','Input, tahap, ekspor backup','Berfungsi'],['OpenStreetMap','Pencarian lokasi, map dan objek sekitar via backend','Berfungsi'],['Open-Meteo','Konteks cuaca via backend','Berfungsi'],['Login multi-tenant','Belum tersedia; sinkronisasi SQLite hanya untuk server lokal','Belum dibuat']].map(x=>`<tr><td><strong>${x[0]}</strong></td><td>${x[1]}</td><td>${tag(x[2],x[2]==='Berfungsi'?'':x[2].includes('Demo')?'gold':'slate')}</td></tr>`).join('')}</tbody></table></div></section>
${note('MVP ini memprioritaskan pengalaman demonstrasi end-to-end dengan transparansi bukti. Autentikasi organisasi, sinkronisasi multi-perangkat, integrasi kamera, izin pengamatan, dan kalibrasi model jalan harus diselesaikan sebelum pilot operasional.')}`}


// SOURCE MODULE: js/document-search.js
/** Filter only observations explicitly extracted from user-uploaded PDFs. */
function filterDocumentRecords(records, filters={}) {
  const norm=v=>String(v??'').trim().toLocaleLowerCase('id-ID');
  const out=(Array.isArray(records)?records:[]).filter(row=>{
    if(row?.source!=='uploaded_pdf')return false;
    if(filters.vehicle && ![row.vehicle,row.subcategory].some(v=>norm(v).includes(norm(filters.vehicle))))return false;
    if(filters.color && !norm(row.color).includes(norm(filters.color)))return false;
    if(filters.zone && !norm(row.zone).includes(norm(filters.zone)))return false;
    if(filters.date && !String(row.at||'').startsWith(filters.date))return false;
    const time=String(row.at||'').slice(11,16);
    if(filters.after && time<filters.after)return false;
    if(filters.before && time>filters.before)return false;
    return true;
  });
  return out.sort((a,b)=>String(b.at).localeCompare(String(a.at)));
}
function mapPointsFromDocuments(records){
  return (Array.isArray(records)?records:[]).filter(row=>row.source==='uploaded_pdf' && Number.isFinite(row.lat) && Number.isFinite(row.lon) && Math.abs(row.lat)<=90 && Math.abs(row.lon)<=180).map(row=>({lat:row.lat,lon:row.lon,kind:'pdf',id:row.id,zone:row.zone,at:row.at,vehicle:row.vehicle,color:row.color}));
}


// SOURCE MODULE: js/views/mapview.js





function renderMapview(){
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


// SOURCE MODULE: js/views/documents.js





function renderDocuments(){
 const state=getState(),index=state.pdfEvidence||{items:[],filters:{},lastImport:null},f=index.filters||{};
 const rows=filterDocumentRecords(index.items||[],f);
 const result=index.lastImport;
 return `${pageHead('DATA / DOCUMENT EVIDENCE','PDF Observation Finder','Impor laporan observasi yang berizin dan telusuri kategori kendaraan, zona, tanggal, serta jam dari isi dokumen.','<button class="btn primary" data-route="mapview">'+icon('map-pinned',16)+' Lihat pada peta</button>')}
 ${note('<strong>Batas penggunaan:</strong> hasil ekstraksi PDF berupa kandidat catatan yang perlu tinjauan manusia. Tidak ada pencarian pelat nomor, pengenalan wajah, identifikasi pemilik kendaraan, ataupun lokasi kendaraan secara langsung.')}
 <div class="doc-summary"><div><span class="mini">DOKUMEN TERAKHIR</span><strong>${result?safe(result.fileName):'Belum ada PDF'}</strong><small>${result?`${result.pages} halaman / ${result.recordsFound} catatan kandidat`: 'Unggah laporan observasi yang mengandung waktu, zona, dan jenis kendaraan'}</small></div><div class="doc-mode">${tag(result?result.extractionMode:'BELUM DIIMPOR',result?.ocrRequired?'gold':'slate')}</div></div>
 <div class="two-cols" style="margin-bottom:20px"><section class="card doc-upload">${cardHeading('01 / Unggah laporan PDF','Maksimum 10 MB dan 30 halaman. Sistem membaca text layer; OpenOCR opsional untuk PDF hasil scan.')}
 <form id="document-upload-form"><label class="doc-drop" for="doc-pdf-file">${icon('file-text',29)}<strong>Pilih PDF laporan survei</strong><span>Jangan unggah laporan yang memuat identitas pribadi atau nomor pelat.</span><input type="file" id="doc-pdf-file" accept="application/pdf,.pdf" required /></label><button type="submit" class="btn primary">${icon('upload-cloud',16)} Impor & indeks dokumen</button></form>
 <div class="doc-help"><strong>Format yang bisa ditemukan</strong><code>2026-11-15 07:35 | Zona A | Mobil | Hitam | Menunggu | -6.29247, 106.79245</code><small>SIMPUL tidak mengisi nilai yang tidak tercantum di dokumen. Informasi tanpa koordinat tetap bisa dicari, tetapi tidak diberi pin kendaraan pada peta.</small></div>
 </section><section class="card">${cardHeading('02 / Status ekstraksi','Dapat digunakan secara lokal pada FastAPI; tidak mengirim PDF ke penyedia cloud.')}
 <div class="doc-processing"><div class="doc-proc-step"><span>1</span><div><strong>PDF text layer</strong><small>Pemrosesan dasar memakai PyMuPDF.</small></div></div><div class="doc-proc-step"><span>2</span><div><strong>OpenOCR (opsional)</strong><small>Untuk halaman scan ketika CLI telah dipasang dan operator mengaktifkannya.</small></div></div><div class="doc-proc-step"><span>3</span><div><strong>Indeks catatan</strong><small>Hanya tanggal, jam, zona, jenis, warna, dan GPS yang tercatat. Bukti diberi halaman dan nomor baris.</small></div></div></div>
 <p class="helper">Jika server tidak berjalan, unggahan tidak diproses. File PDF tidak disimpan setelah ekstraksi; indeks terstruktur disimpan di SQLite backend lokal.</p>
 <button type="button" class="btn" data-action="doc-status">${icon('refresh-cw',15)} Periksa status API/OCR</button>${index.status?`<p class="doc-status">Text layer: ${index.status.pdfTextExtraction?'siap':'tidak tersedia'}; OpenOCR: ${index.status.openocrInstalled&&index.status.openocrEnabled?'aktif':'belum aktif'}</p>`:''}</section></div>
 <section class="card"><div class="card-title"><div><h2>03 / Cari catatan kendaraan</h2><p>Pencarian pada dokumen yang Anda unggah, bukan sistem pelacakan langsung.</p></div>${tag(`${rows.length} cocok`,'')}</div>
 <form id="document-filter-form" class="doc-filters"><div class="field"><label for="doc-zone">Zona</label><input id="doc-zone" class="control" value="${safe(f.zone||'')}" placeholder="Zona A" maxlength="80"/></div><div class="field"><label for="doc-vehicle">Kategori / tipe</label><input id="doc-vehicle" class="control" value="${safe(f.vehicle||'')}" placeholder="Mobil / sedan" maxlength="30"/></div><div class="field"><label for="doc-color">Warna</label><input id="doc-color" class="control" value="${safe(f.color||'')}" placeholder="Hitam" maxlength="40"/></div><div class="field"><label for="doc-date">Tanggal</label><input id="doc-date" class="control" value="${safe(f.date||'')}" type="date"/></div><div class="field"><label for="doc-after">Mulai jam (WIB)</label><input id="doc-after" class="control" type="time" value="${safe(f.after||'')}"/></div><div class="field"><label for="doc-before">Sampai jam (WIB)</label><input id="doc-before" class="control" type="time" value="${safe(f.before||'')}"/></div><div class="doc-filter-buttons"><button type="submit" class="btn primary">${icon('search',16)} Cari</button><button type="button" data-action="doc-reset" class="btn">Atur ulang</button></div></form>
 ${rows.length?`<div class="table-wrap"><table class="data-table"><thead><tr><th>Waktu (WIB)</th><th>Zona</th><th>Kendaraan</th><th>Warna</th><th>Aktivitas</th><th>Asal dokumen</th><th>Geolokasi</th></tr></thead><tbody>${rows.slice(0,100).map(r=>`<tr><td>${shortDate(r.at)}<small>${clock(r.at)} WIB</small></td><td>${safe(r.zone)}</td><td>${safe(r.subcategory||r.vehicle)}</td><td>${safe(r.color||'Tidak dicatat')}</td><td>${safe(r.activity||'Tidak dicatat')}</td><td><strong>${safe(r.fileName)}</strong><small>Hal. ${r.page}, baris ${r.line}</small></td><td>${r.lat!=null?tag('GPS dari PDF',''):'Tidak ada koordinat'}</td></tr>`).join('')}</tbody></table></div>`:emptyState('Belum ada hasil yang cocok','Impor PDF observasi dengan struktur yang didukung, atau ubah filter. Hasil kosong tidak membuktikan kendaraan tidak berada di lokasi.')}
 <div class="doc-footer"><span>Seluruh catatan merupakan hasil ekstraksi otomatis berstatus BELUM DIVERIFIKASI.</span><button data-action="doc-export" class="btn">${icon('download',15)} Ekspor hasil JSON</button></div></section>`;
}


// SOURCE MODULE: js/views/creators.js
/** Credits are grounded in the submitted SIMPUL proposal. Only the supplied LinkedIn profile is linked. */


const SIMPUL_TEAM=Object.freeze([
 {name:'William Anthony',role:'Ketua Tim',area:'Arsitektur sistem dan integrasi',link:'https://www.linkedin.com/in/wlmoi/'},
 {name:'Gregorius Yoga Robianto',role:'Full-Stack Engineer',area:'Aplikasi dan pipeline data'},
 {name:'Bennaya Jonathan R. P. Siagian',role:'User Research',area:'Riset pengguna dan pitching'},
 {name:'Brian Albar Hadian',role:'Verification',area:'Verifikasi dan kualitas sistem'},
 {name:'Karol Yangqian Poetracahya',role:'Traffic Simulation',area:'Sistem informasi dan simulasi lalu lintas'}
]);
function renderCreators(){return `${pageHead('ISEEDESIGNITB / THE TEAM','About the Creators','Tim mahasiswa Institut Teknologi Bandung yang mengembangkan konsep dan prototipe SIMPUL berdasarkan proposal SI Bridges Indonesia 2026.')}
<section class="creators-intro"><div><span class="creators-kicker">BEHIND SIMPUL</span><h2>Designed for better decisions around urban transit.</h2><p>Fokus tim adalah evaluasi penjemputan MRT Fatmawati melalui observasi, analisis, simulasi, dan keputusan yang transparan. Keterangan peran diambil dari proposal tim, bukan klaim riwayat profesional pribadi.</p></div><div class="creators-monogram" aria-hidden="true">iSee<span>Design</span><strong>ITB</strong></div></section>
<div class="section-h"><h2>Tim pengembang</h2><small>5 mahasiswa ITB</small></div>
<section class="creators-grid">${SIMPUL_TEAM.map((person,index)=>`<article class="creator-card"><span class="creator-index">${String(index+1).padStart(2,'0')}</span><div class="creator-initials" aria-hidden="true">${safe(person.name.split(' ').slice(0,2).map(x=>x[0]).join(''))}</div><h3>${safe(person.name)}</h3><span class="creator-role">${safe(person.role)}</span><p>${safe(person.area)}</p>${person.link?`<a class="creator-social" href="${person.link}" target="_blank" rel="noopener noreferrer" aria-label="Buka LinkedIn William Anthony">${icon('linkedin',16)} LinkedIn ${icon('arrow-up-right',14)}</a>`:'<span class="creator-no-link">Profil publik tidak dicantumkan</span>'}</article>`).join('')}</section>
<section class="creators-outro"><div><span class="creators-kicker">PROJECT ORIGIN</span><h3>SI Bridges Indonesia 2026</h3><p>Inisiatif riset transportasi, satu masalah pada satu lokasi. Profil tim dan tanggung jawab mengacu pada proposal SIMPUL. Hasil simulasi yang belum dikalibrasi tidak ditampilkan sebagai bukti dampak nyata.</p></div><button class="btn primary" data-route="overview" type="button">${icon('arrow-left',16)} Kembali ke solusi</button></section>`}


// SOURCE MODULE: js/page-registry.js
/**
 * SIMPUL view registry.
 *
 * UI pages register here; route labels and grouping are defined in data.js.
 * Keep render functions synchronous and side-effect-free at render time.
 * When adding a page, update this registry and views in data.js, then run:
 *   node tests/test_module_boundaries.mjs
 *   python tools/build_standalone.py
 */


























const pageRenderers = Object.freeze({
  overview: renderOverview,
  vehicles: renderVehicles,
  project: renderProject,
  observation: renderObservation,
  survey: renderSurvey,
  operations: renderOperations,
  monitor: renderMonitor,
  classification: renderClassification,
  publicintel: renderPublicIntel,
  diagnosis: renderDiagnosis,
  context: renderContext,
  contextplus: renderContextPlus,
  simulation: renderSimulation,
  evaluation: renderEvaluation,
  insights: renderInsights,
  business: renderBusiness,
  pipeline: renderPipeline,
  equipment: renderEquipment,
  standards: renderStandards,
  reports: renderReports,
  integrations: renderIntegrations,
  settings: renderSettings,
  mapview: renderMapview,
  documents: renderDocuments,
  creators: renderCreators,
});


// SOURCE MODULE: js/map-controller.js
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
async function activateMapView(state,onZonePick){
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


// SOURCE MODULE: js/navigation.js
/**
 * SIMPUL navigation information architecture.
 *
 * Navigation only: routes and feature implementations remain in js/data.js
 * and js/page-registry.js. This module never mutates observations, AI, or SUMO.
 * To add a page, register it in data.js + page-registry.js, assign exactly one
 * section below, and run `node tests/test_navigation.mjs`.
 */



const PRIMARY_ROUTES = Object.freeze([
  'overview', 'vehicles', 'observation', 'diagnosis', 'mapview', 'simulation', 'evaluation'
]);

const NAV_SECTIONS = Object.freeze([
  { id:'field', label:'Survei & operasional', icon:'clipboard-list', routes:['survey','monitor','classification','operations'] },
  { id:'context', label:'Data & konteks', icon:'map-pinned', routes:['documents','context','contextplus','insights','publicintel'] },
  { id:'business', label:'Model bisnis', icon:'chart-no-axes-combined', routes:['business','pipeline','equipment'] },
  { id:'evidence', label:'Dokumentasi & bukti', icon:'files', routes:['project','standards','reports'] },
  { id:'system', label:'Integrasi & sistem', icon:'settings-2', routes:['integrations','settings'] },
  { id:'about', label:'Tentang pembuat', icon:'users', routes:['creators'] }
]);

const pages = new Map(views.map(page=>[page.id,page]));
function sectionForRoute(route){return NAV_SECTIONS.find(section=>section.routes.includes(route))?.id || null;}
function sectionTitleForRoute(route){return NAV_SECTIONS.find(section=>section.routes.includes(route))?.label || (PRIMARY_ROUTES.includes(route)?'Alur utama':'Workspace');}
function assertNavigationCoverage(){
  const ids=[...PRIMARY_ROUTES,...NAV_SECTIONS.flatMap(s=>s.routes)];
  if(ids.length!==new Set(ids).size)throw new Error('A navigation route is assigned more than once');
  const missing=views.filter(page=>!ids.includes(page.id)).map(p=>p.id);
  const invalid=ids.filter(id=>!pages.has(id));
  if(missing.length||invalid.length)throw new Error(`Navigation mismatch: missing=${missing.join(',')} unknown=${invalid.join(',')}`);
  return ids.length;
}

function link(route,active,number=null){
  const page=pages.get(route);
  if(!page)throw new Error('Missing navigation page: '+route);
  const selected=active===route;
  return `<div class="nav-item-wrap" data-nav-page="${page.id}" data-nav-label="${safe(page.label.toLowerCase())}"><button type="button" class="nav-link ${selected?'active':''}" data-route="${page.id}" ${selected?'aria-current="page"':''}>${icon(page.icon,17)}<span>${safe(page.label)}</span>${number?`<span class="nav-step">${number}</span>`:''}</button></div>`;
}

/** Return sidebar navigation content only; the outer shell is owned by app.js. */
function renderNavigation(active,expanded=''){
  const core=PRIMARY_ROUTES.map((route,i)=>link(route,active,String(i+1).padStart(2,'0'))).join('');
  const sections=NAV_SECTIONS.map(section=>{
    const selected=section.routes.includes(active);
    const open=expanded===section.id;
    return `<div class="nav-fold ${selected?'has-active':''}" data-nav-section="${section.id}">
      <button type="button" class="nav-fold-trigger" data-action="toggle-nav-group" data-group="${section.id}" aria-expanded="${open}" aria-controls="nav-panel-${section.id}">
        ${icon(section.icon,17)}<span>${safe(section.label)}</span><span class="nav-fold-count">${section.routes.length}</span>${icon('chevron-down',15)}
      </button>
      <div class="nav-fold-content" id="nav-panel-${section.id}" ${open?'':'hidden'}>${section.routes.map(route=>link(route,active)).join('')}</div>
    </div>`;
  }).join('');
  return `<div class="nav-search">${icon('search',16)}<input id="simpul-nav-search" type="search" autocomplete="off" placeholder="Cari halaman... (/)" aria-label="Cari halaman SIMPUL"/></div>
    <div class="nav-items"><div class="nav-label" data-nav-core-heading>ALUR UTAMA</div><div class="nav-core">${core}</div>
    <div class="nav-label nav-label-secondary">FITUR PENDUKUNG</div><div class="nav-sections">${sections}</div>
    <p class="nav-empty" hidden>Tidak ada halaman yang cocok.</p></div>`;
}

/** Search only changes navigation visibility; feature state is never affected. */
function filterNavigation(root, query){
  if(!root)return 0;
  const q=String(query||'').trim().toLocaleLowerCase('id-ID');
  root.classList.toggle('is-searching',Boolean(q));
  let count=0;
  root.querySelectorAll('[data-nav-page]').forEach(el=>{
    const match=!q || (el.dataset.navLabel||'').toLocaleLowerCase('id-ID').includes(q);
    el.hidden=!match;
    if(match)count++;
  });
  root.querySelectorAll('[data-nav-section]').forEach(el=>{
    el.hidden=Boolean(q)&&![...el.querySelectorAll('[data-nav-page]')].some(item=>!item.hidden);
  });
  const core= root.querySelector('.nav-core');
  const coreVisible=[...(core?.querySelectorAll('[data-nav-page]')||[])].some(item=>!item.hidden);
  if(core)core.hidden=Boolean(q)&&!coreVisible;
  const label=root.querySelector('[data-nav-core-heading]');if(label)label.hidden=Boolean(q)&&!coreVisible;
  const empty=root.querySelector('.nav-empty');if(empty)empty.hidden=count!==0;
  return count;
}


// SOURCE MODULE: js/motion.js
/**
 * SIMPUL motion layer (presentation only).
 *
 * Uses GSAP 3 when an optional self-hosted runtime is present,
 * otherwise uses the standard Web Animations API. Neither is required for
 * navigation or data operations to work. Motion cannot change application data.
 *
 * Accessibility: `prefers-reduced-motion: reduce` disables movement. Tests may
 * inject a mock GSAP object without importing UI modules or network libraries.
 */
const MOTION_TIMING = Object.freeze({ page: 510, cards: 440, menu: 290, modal: 250, toast: 260 });
let activeAnimations = new Set();
let routeContext = null;

function canMove() {
  return typeof window !== 'undefined' &&
    !(typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}
function engine() {
  return typeof window !== 'undefined' && window.gsap && typeof window.gsap.fromTo === 'function' ? window.gsap : null;
}
function watch(animation) {
  if (!animation) return;
  activeAnimations.add(animation);
  const tidy = () => activeAnimations.delete(animation);
  if (animation.finished && typeof animation.finished.then === 'function') animation.finished.then(tidy, tidy);
  else animation.onfinish = tidy;
}
function animate(el, frames, opts = {}) {
  if (!el || !canMove() || typeof el.animate !== 'function') return null;
  const anim = el.animate(frames, { duration: opts.duration || 350, delay: opts.delay || 0,
    easing: opts.easing || 'cubic-bezier(.18,.72,.2,1)', fill: opts.fill || 'backwards' });
  watch(anim);
  return anim;
}
function stopMotion() {
  if (routeContext?.revert) routeContext.revert();
  routeContext = null;
  for (const anim of activeAnimations) { try { anim.cancel(); } catch {} }
  activeAnimations = new Set();
}

/** Animate only after a navigation transition, not after each data update. */
function enterPage(main, { initial = false } = {}) {
  if (!main || !canMove()) return;
  stopMotion();
  const heading = main.querySelector('.main-head, .hero, .dia-hero, .eval-hero, .pilot-hero, .monitor-hero, .intel-hero, .scope-hero, .ctx-hero, .revenue-hero');
  const cards = [...main.querySelectorAll('.cards > .card, .dia-stat, .pilot-stats > div, .monitor-kpi, .scope-stage, .card, .pilot-case, .intel-item')]
    .filter((node, i, arr) => arr.indexOf(node) === i && !node.closest('[hidden]')).slice(0, 15);
  const gsap = engine();
  if (gsap) {
    // GSAP context scopes cleanup to the current routed page.
    routeContext = gsap.context(() => {
      if (heading) gsap.fromTo(heading, { opacity: 0, y: initial ? 12 : 16 },
        { opacity: 1, y: 0, duration: .46, ease: 'power3.out', clearProps: 'opacity,transform' });
      if (cards.length) gsap.fromTo(cards, { opacity: 0, y: 13 },
        { opacity: 1, y: 0, duration: .45, delay: .085, stagger: .038,
          ease: 'power2.out', clearProps: 'opacity,transform' });
    }, main);
    return;
  }
  if (heading) animate(heading, [{opacity: 0, transform: 'translate3d(0,14px,0)'},
    {opacity: 1, transform: 'translate3d(0,0,0)'}], {duration: MOTION_TIMING.page});
  cards.forEach((item, i) => animate(item,
    [{opacity: 0, transform: 'translate3d(0,11px,0)'}, {opacity: 1, transform: 'translate3d(0,0,0)'}],
    { duration: MOTION_TIMING.cards, delay: 65 + Math.min(i, 10) * 34 }));
}

/** Drawers are animated after DOM replacement; the data model is unaffected. */
function openMobileDrawer(sidebar, curtain) {
  if (!sidebar || !canMove()) return;
  const gsap = engine();
  if (gsap) {
    gsap.fromTo(sidebar, {xPercent:-100}, {xPercent:0, duration:.31, ease:'power3.out', clearProps:'transform'});
    if(curtain) gsap.fromTo(curtain,{opacity:0},{opacity:1,duration:.25,clearProps:'opacity'});
  } else {
    animate(sidebar,[{transform:'translateX(-100%)'},{transform:'translateX(0)'}],{duration:320});
    animate(curtain,[{opacity:0},{opacity:1}],{duration:260});
  }
}
function closeMobileDrawer(sidebar, curtain, done) {
  if (!sidebar || !canMove()) { done(); return; }
  const gsap = engine();
  if (gsap) {
    gsap.to(sidebar,{xPercent:-100,duration:.21,ease:'power2.in',onComplete:done});
    if(curtain)gsap.to(curtain,{opacity:0,duration:.2});
  } else {
    const a=animate(sidebar,[{transform:'translateX(0)'},{transform:'translateX(-100%)'}],{duration:220});
    animate(curtain,[{opacity:1},{opacity:0}],{duration:200});
    if(a?.finished)a.finished.then(done,done); else done();
  }
}

/** Toggle a navigation panel with measured height. Hidden is set only on close completion. */
function toggleAccordion(panel, expand) {
  if (!panel) return;
  if (panel._simpulMotion?.kill) panel._simpulMotion.kill();
  if (panel._simpulMotion?.cancel) panel._simpulMotion.cancel();
  panel._simpulMotion = null;
  if (!canMove()) { panel.hidden = !expand; panel.style.removeProperty('height'); panel.style.removeProperty('overflow'); return; }
  if (expand) panel.hidden = false;
  const height = Math.max(panel.scrollHeight, 1);
  panel.style.overflow = 'hidden';
  const complete=()=>{panel.style.removeProperty('height');panel.style.removeProperty('overflow');panel.style.removeProperty('opacity'); if(!expand)panel.hidden=true; panel._simpulMotion=null;};
  const gsap = engine();
  if (gsap) {
    panel._simpulMotion=gsap.fromTo(panel,{height:expand?0:height,opacity:expand?0:1},
      {height:expand?height:0,opacity:expand?1:0,duration:.28,ease:'power2.inOut',onComplete:complete});
  } else {
    const a=animate(panel,[{height:`${expand?0:height}px`,opacity:expand?0:1},
      {height:`${expand?height:0}px`,opacity:expand?1:0}],{duration:MOTION_TIMING.menu});
    panel._simpulMotion=a;
    if (a?.finished) a.finished.then(complete, complete); else complete();
  }
}
function showModal(overlay) {
  if (!overlay || !canMove()) return;
  const box=overlay.querySelector('.modal');
  const gsap=engine();
  if(gsap){gsap.fromTo(overlay,{opacity:0},{opacity:1,duration:.2});
    if(box)gsap.fromTo(box,{opacity:0,y:22,scale:.985},{opacity:1,y:0,scale:1,duration:.32,ease:'power3.out',clearProps:'transform,opacity'});}
  else {animate(overlay,[{opacity:0},{opacity:1}],{duration:190});
    animate(box,[{opacity:0,transform:'translateY(20px) scale(.985)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:320});}
}
function hideModal(overlay, done) {
  if (!overlay || !canMove()) {done();return;}
  const gsap=engine();
  if(gsap)gsap.to(overlay,{opacity:0,duration:.16,onComplete:done});
  else {const a=animate(overlay,[{opacity:1},{opacity:0}],{duration:160});
    if(a?.finished)a.finished.then(done,done);else done();}
}
function showToast(node) {
  if (!node || !canMove()) return;
  const gsap=engine();
  if(gsap)gsap.fromTo(node,{opacity:0,y:12},{opacity:1,y:0,duration:.28,ease:'power2.out',clearProps:'opacity,transform'});
  else animate(node,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:MOTION_TIMING.toast});
}
function accentActiveNav(root) {
  if (!root || !canMove())return;
  const active=root.querySelector('.nav-link.active');
  if (!active)return;
  const gsap=engine();
  if(gsap)gsap.fromTo(active,{scale:.985},{scale:1,duration:.24,ease:'power2.out',clearProps:'transform'});
  else animate(active,[{transform:'scale(.985)'},{transform:'scale(1)'}],{duration:250});
}


// SOURCE MODULE: js/services/csv.js
/** RFC-4180 CSV output with spreadsheet-formula injection protection.
 * Strings beginning with = + - @, including leading whitespace/control
 * characters, are forced to text. Numeric values retain their numeric type.
 */
function encodeCsvCell(value) {
  let cell = String(value ?? '');
  if (typeof value === 'string' && /^[\u0000-\u0020]*[=+\-@]/.test(cell)) cell = "'" + cell;
  return '"' + cell.replaceAll('"', '""') + '"';
}

function encodeCsvRows(rows) {
  if (!Array.isArray(rows)) throw new TypeError('CSV rows must be an array');
  return '\ufeff' + rows.map(row => row.map(encodeCsvCell).join(',')).join('\r\n') + '\r\n';
}


// SOURCE MODULE: js/services/export-data.js
/**
 * Pure export data transformations.
 * No DOM, localStorage, fetching, or downloads: pass state in and receive CSV text.
 * The traffic-review export deliberately excludes synthetic observations.
 */




function observationCsv(state) {
  return encodeCsvRows([
    ['id','timestamp_utc','type','vehicle','duration_seconds','zone','source','notes'],
    ...state.observations.map(x=>[x.id,x.at,x.type,x.vehicle,x.duration,x.zone,x.source,x.note]),
  ]);
}

function policeCsv(state) {
  const records = makePoliceReviewBundle(state).records;
  const columns = ['id','at','zone','activity','vehicleCategory','durationSec','fieldContext','laneBlocked','pedestrianBlocked','queueObserved','operationalPriority','ruleReviewFlag','evidenceStatus','reviewStatus','reviewedAt','legalConclusion'];
  return encodeCsvRows([columns, ...records.map(r=>[
    r.id,r.at,r.zone,r.activity,r.vehicleCategory,r.durationSec,r.fieldContext,
    r.observedImpact.lane,r.observedImpact.pedestrian,r.observedImpact.queue,
    r.operationalPriority,r.ruleReviewFlag,r.evidenceStatus,r.reviewStatus,
    r.reviewedAt||'',r.legalConclusion,
  ])]);
}

function fieldReadingCsv(state) {
  const columns = ['id','observed_at_utc','recorded_at_utc','phase','scenario','period','zone','interval_minutes','vehicles_passing','vehicles_stopping','max_queue_vehicles','access_meters','pedestrians','access_blocked','available_bays','occupied_bays','source','notes'];
  return encodeCsvRows([columns, ...state.fieldReadings.map(r=>[
    r.id,r.at,r.recordedAt||'',r.phase,r.scenario,r.period,r.zone,r.minutes,
    r.passingVehicles,r.stoppedVehicles,r.maxQueue,r.accessMeters,r.pedestrians,
    r.blockedAccess,r.availableBays,r.occupiedBays,r.source,r.note,
  ])]);
}

function forecastCsv(state) {
  const rows = forecast(state.finance).rows;
  const columns = ['month','active_sites','recurring_idr','setup_idr','pilot_idr','total_revenue_idr','direct_cost_idr','fixed_cost_idr','total_cost_idr','operating_result_idr'];
  return encodeCsvRows([columns,...rows.map(x=>[
    x.month,x.active,x.recurring,x.setupRevenue,x.pilotRevenue,x.revenue,
    x.direct,x.fixed,x.costs,x.net,
  ])]);
}

const EQUIPMENT_SETS = Object.freeze({
  phone: ['phone','tripod','powerbank'],
  cloud: ['phone','cloud','tripod','powerbank'],
  edge: ['phone','pi','camera','router','storage','cloud'],
});
const EQUIPMENT_NAMES = Object.freeze({
  phone:'Smartphone milik pengguna', cloud:'Hosting cloud per bulan',
  tripod:'Tripod',powerbank:'Powerbank',pi:'Raspberry Pi / mini PC',
  camera:'Kamera berizin',router:'Router',storage:'Penyimpanan',
});

function equipmentCsv(state) {
  const list = EQUIPMENT_SETS[state.equipmentMode];
  if (!list) throw new TypeError(`Unknown equipment mode: ${state.equipmentMode}`);
  return encodeCsvRows([
    ['mode','equipment','estimated_price_idr','frequency'],
    ...list.map(k=>[state.equipmentMode,EQUIPMENT_NAMES[k],state.equipmentPrices[k],k==='cloud'?'monthly':'one-time']),
  ]);
}

function monitoringCsv(state) {
  return encodeCsvRows([
    ['timestamp_utc','record_type','activity','source','zone','duration_seconds','session_id','description'],
    ...state.observations.map(e=>[e.at,'observation',e.type,e.source,e.zone,e.duration,e.sessionId||'',e.note||'']),
    ...(state.activityLog||[]).map(e=>[e.at,'audit',e.kind,'local','','','',e.message]),
  ]);
}


// SOURCE MODULE: js/app.js

























// The renderer registry is maintained separately from action orchestration.
const components = pageRenderers;
const names=Object.fromEntries(views.map(v=>[v.id,v.label]));
let mobileOpen=false,toastTimer=null,serverStatus=null,monitorTimer=null,monitorBusy=false,lastMonitorSync=0,expandedNavGroup=null,lastRenderedRoute=null;
const currentPage=()=>{let p=decodeURIComponent(location.hash.replace('#',''))||'overview';return components[p]?p:'overview';};
function sidebar(){
  const active=currentPage();
  const open=expandedNavGroup===null?sectionForRoute(active):expandedNavGroup;
  return `<aside class="sidebar ${mobileOpen?'open':''}" id="sidebar" aria-label="Panel navigasi"><div class="brand"><div class="brand-icon">S</div><div><div class="wordmark">SIMPUL</div><small>MOBILITY INTELLIGENCE</small></div></div><nav class="nav-area" aria-label="Navigasi utama">${renderNavigation(active,open)}</nav><div class="sidebar-foot"><div class="mini">WORKSPACE AKTIF</div><strong>${safe(getState().project.name)}</strong><div class="presence"><span class="dot"></span> Mode demo - tersimpan lokal</div><button type="button" data-route="settings">${icon('settings-2',13)} &nbsp; Pengaturan proyek</button></div></aside>`;
}
function layout(){const route=currentPage();const dateStr=new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Jakarta'}).format(new Date());return `<div class="shell">${sidebar()}<div class="mobile-curtain ${mobileOpen?'show':''}" data-action="close-mobile"></div><div class="workspace"><header class="topbar"><div class="crumb"><button class="hamburger" data-action="toggle-mobile" aria-label="Buka navigasi">${icon('menu',22)}</button><span class="crumb-section">${sectionTitleForRoute(route)}</span>${icon('chevron-right',13)}<strong>${names[route]}</strong></div><div class="top-actions"><div class="header-date">${dateStr} - WIB</div><div class="header-divider"></div><span class="tag gold">DEMO / BUKAN DATA LAPANGAN</span><div class="avatar" title="iSeeDesignITB">ITB</div></div></header><main class="main" id="main-content">${components[route]()}<footer class="app-footer"><span>© 2026 SIMPUL · iSeeDesignITB · SI Bridges Indonesia 2026</span><span><a href="#creators">About the Creators</a> · <a href="https://www.linkedin.com/in/wlmoi/" target="_blank" rel="noopener noreferrer">LinkedIn William Anthony</a></span></footer></main></div></div><nav class="mobile-bottom-nav" aria-label="Navigasi cepat">${[['overview','layout-dashboard','Beranda'],['vehicles','car-front','Kendaraan'],['mapview','map-pinned','Peta'],['simulation','git-compare-arrows','Simulasi'],['evaluation','clipboard-check','Evaluasi']].map(v=>`<button type="button" data-route="${v[0]}" class="${route===v[0]?'active':''}" aria-label="${v[2]}">${icon(v[1],19)}<span>${v[2]}</span></button>`).join('')}</nav><div class="toasts" id="toasts" aria-live="polite"></div>`;}
function render(){
  const route=currentPage();
  const changed=route!==lastRenderedRoute;
  const first=lastRenderedRoute===null;
  document.getElementById('app').innerHTML=layout();
  lastRenderedRoute=route;
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
function modal(inner){const e=document.createElement('div');e.className='overlay';e.id='app-modal';e.innerHTML=`<div class="modal" role="dialog" aria-modal="true">${inner}</div>`;document.body.append(e);showModal(e);e.addEventListener('click',ev=>{if(ev.target===e)closeModal({animate:true})});setTimeout(()=>e.querySelector('input:not([type=hidden]),select')?.focus(),20)}
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
async function runSumo(){const button=document.querySelector('[data-action="run-sumo"]');if(button){button.disabled=true;button.textContent='Memeriksa backend…'}
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
      toast(key==='weather'?'Mengambil data cuaca…':key==='nearby'?'Mencari fasilitas sekitar…':'Mengambil snapshot lalu lintas…');
      const result=await apiRequest(url,{timeout:30000});
      updateState(s=>({...s,context:{...s.context,[key]:result}}));
      toast(key==='weather'?'Cuaca Open-Meteo berhasil dimuat':key==='nearby'?'Fasilitas dari Overpass berhasil dimuat':'Data TomTom berhasil dimuat');return;
    }
    if(action==='sync-observations'){
      const items=getState().observations.filter(x=>x.source==='manual').map(x=>({id:x.id,at:x.at,type:x.type,vehicle:x.vehicle,duration:x.duration,zone:x.zone,source:'manual',note:x.note||'',sessionId:x.sessionId||null,zoneContext:x.zoneContext||'unknown',laneBlocked:x.laneBlocked||'unknown',pedestrianBlocked:x.pedestrianBlocked||'unknown',queueObserved:x.queueObserved||'unknown',signageVerified:x.signageVerified===true,evidenceReference:x.evidenceReference||''}));
      if(!items.length)throw new Error('Belum ada rekaman manual. Buat sesi dan masukkan kejadian dahulu.');
      if(!confirm(`Kirim ${items.length} rekaman manual ke SQLite pada server lokal? Data demo tidak akan dikirim.`))return;
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
      if(!events.length)throw new Error('Analisis AI memerlukan minimal satu observasi manual. Data demo tidak dikirim.');
      const byType={},byZone={};let sum=0;
      for(const e of events){byType[e.type]=(byType[e.type]||0)+1;byZone[e.zone]=(byZone[e.zone]||0)+1;sum+=Number(e.duration)||0;}
      const result=await apiRequest('/api/ai/insights',{method:'POST',body:{count:events.length,meanDwellSec:sum/events.length,byType,byZone},timeout:45000});
      updateState(s=>({...s,aiInsights:{...result,createdAt:nowIso(),sourceEvents:events.length}}));
      toast('Analisis Gemini diterima; tetap membutuhkan peninjauan manusia');return;
    }
  }catch(e){toast(e.message||'API gagal diproses');console.error('SIMPUL API',e)}
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

function handleAction(action,el){switch(action){
case 'doc-status':apiRequest('/api/v1/documents/status').then(data=>{updateState(s=>({...s,pdfEvidence:{...s.pdfEvidence,status:data}}));toast('Status OCR diperbarui')}).catch(e=>toast(e.message));break;
case 'doc-reset':updateState(s=>({...s,pdfEvidence:{...s.pdfEvidence,filters:{}}}));break;
case 'doc-export':{const data=getState().pdfEvidence||{items:[],filters:{}};download('SIMPUL_pdf_observations_filtered.json',JSON.stringify({source:'uploaded_pdf',status:'unverified',records:filterDocumentRecords(data.items,data.filters)},null,2));toast('Hasil PDF yang sedang difilter disiapkan');break;}
case 'map-reset-zones':if(confirm('Hapus semua titik referensi zona yang dibuat manual?'))updateState(s=>({...s,zonePins:{}}));break;
case 'osint-status':case 'osint-search':case 'osint-clear':osintAction(action);break;
case 'toggle-mobile':{if(mobileOpen)closeMobileDrawer(document.getElementById('sidebar'),document.querySelector('.mobile-curtain'),()=>{mobileOpen=false;render()});else {mobileOpen=true;render();}break;}
case 'toggle-nav-group':{
  const target=el.dataset.group;
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
case 'export-police-json':{download('SIMPUL_traffic_review_manual_only.json',JSON.stringify(makePoliceReviewBundle(getState()),null,2));toast('Berkas review JSON disiapkan, tanpa contoh sintetis');break;}
case 'review-traffic':{const e=getState().observations.find(x=>x.id===el.dataset.id);if(!e)return toast('Rekaman tidak ditemukan');if(e.source!=='manual'){toast('Review resmi tidak dapat diisi pada data demo. Catat observasi manual.');return;}modal(trafficReviewModal(e,getState().eventReviews?.[e.id]));break;}

case 'add-field-reading':modal(fieldReadingModal());break;
case 'add-decision':modal(decisionModal());break;
case 'export-field-readings':downloadFieldReadings();break;
case 'sync-field-readings':syncFieldReadings();break;
case 'delete-field-reading':if(confirm('Hapus interval ini dari penyimpanan lokal? Data yang sudah tersinkronisasi ke server tidak otomatis terhapus.')){updateState(s=>({...s,fieldReadings:s.fieldReadings.filter(r=>r.id!==el.dataset.id)}));recordLocalActivity('field.delete','Interval manual dihapus lokal','warning');toast('Interval dihapus dari browser');}break;
case 'capture-type':modal(eventModal(el.dataset.value));break;
case 'close-modal':closeModal();break;
case 'start-session':startSession();break;
case 'end-session':endSession();break;
case 'clear-demo':{const count=getState().observations.filter(e=>e.source==='demo').length;if(!count)return toast('Tidak ada contoh demo');if(confirm(`Hapus ${count} kejadian sintetis? Rekaman manual tetap tersimpan.`)){updateState(s=>({...s,observations:s.observations.filter(e=>e.source!=='demo')}));recordLocalActivity('data.cleanup','Data demo sintetis dihapus');toast('Data contoh dihapus')}}break;
case 'delete-event':if(getState().responseCases?.some(c=>c.eventId===el.dataset.id)){toast('Rekaman sudah memiliki tindak lanjut. Ekspor/arsipkan catatan dulu sebelum menghapus sumber.');break;}if(confirm('Hapus satu kejadian ini?')){updateState(s=>({...s,observations:s.observations.filter(e=>e.id!==el.dataset.id)}));recordLocalActivity('observation.delete','Satu kejadian dihapus','warning');toast('Kejadian dihapus')}break;
case 'run-simulation':updateState(s=>({...s,lastAnalysis:heuristicSimulation(s.scenario),history:[...s.history,{id:uid('run'),engine:'heuristic',createdAt:nowIso()}]}));recordLocalActivity('simulation.demo','Estimasi heuristik ilustratif dijalankan');toast('Estimasi heuristik ilustratif diperbarui');break;
case 'run-sumo':runSumo();break;
case 'ctx-reverse':case 'ctx-crossings':case 'ctx-airquality':case 'ctx-forecast':case 'ctx-elevation':case 'ctx-history':case 'ctx-holidays':case 'ctx-isochrone':case 'ctx-select-poi':contextPlusAction(action,el);break;
case 'check-apis':case 'select-geo':case 'load-map':case 'fetch-weather':case 'fetch-traffic':case 'fetch-nearby':case 'sync-observations':case 'pull-observations':case 'ai-insights':connectedAction(action,el);break;
case 'refresh-monitor':refreshMonitor();break;
case 'export-monitor':monitorCsv();break;
case 'flush-telemetry':flushTelemetry(false);break;
case 'probe-telemetry':flushTelemetry(true);break;
case 'reset-monitor-filters':updateState(s=>({...s,monitorFilter:{source:'all',zone:'all',range:'all'}}));break;
case 'reset-scenario':resetScenario();break;
case 'reset-finance':resetFinance();break;
case 'add-lead':modal(leadModal());break;
case 'advance-lead':{const l=getState().pipeline.find(x=>x.id===el.dataset.id);if(!l)return;const next=STAGES[Math.min(STAGES.indexOf(l.stage)+1,STAGES.length-1)];updateState(s=>({...s,pipeline:s.pipeline.map(x=>x.id===l.id?{...x,stage:next}:x)}));toast('Tahap prospek diperbarui');break;}
case 'delete-lead':if(confirm('Hapus prospek ini?')){updateState(s=>({...s,pipeline:s.pipeline.filter(x=>x.id!==el.dataset.id)}));toast('Prospek dihapus')}break;
case 'select-equipment':updateState(s=>({...s,equipmentMode:el.dataset.value}));break;
case 'export-executive-brief':{download('SIMPUL_Executive_Brief_EN.html',buildExecutiveBriefHTML(getState()),'text/html;charset=utf-8');toast('Executive brief berbahasa Inggris siap dibuka atau dicetak');break;}
case 'export-evidence-package':{const bundle=buildStandardsBundle(getState());download('SIMPUL_evidence_bundle_v1.json',JSON.stringify(bundle,null,2));recordLocalActivity('export.evidence','Evidence bundle manual diekspor');toast('Evidence bundle dengan kualitas dan provenance diekspor');break;}
case 'export-study-geojson':{try{download('SIMPUL_study_reference.geojson',JSON.stringify(buildProjectGeoJSON(getState()),null,2),'application/geo+json');toast('GeoJSON lokasi referensi proyek berhasil diekspor')}catch(error){toast(error.message)}break;}
case 'export-observations':downloadObservations();break;
case 'export-forecast':downloadForecast();break;
case 'export-equipment':downloadEquipment();break;
case 'export-report':download('SIMPUL_laporan_demo.json',JSON.stringify(makeReport(),null,2));toast('Laporan dengan asumsi dan keterbatasan diekspor');break;
case 'export-backup':download('SIMPUL_backup.json',exportState());toast('Backup workspace diunduh');break;
case 'save-api-token':{
  const value=document.getElementById('simpul-api-token')?.value?.trim()||'';
  if(!value)return toast('Masukkan token API dari environment backend.');
  setSessionApiToken(value);
  document.getElementById('simpul-api-token').value='';
  toast('Token API disimpan hanya untuk sesi tab ini.');render();break;
}
case 'clear-api-token':setSessionApiToken('');toast('Token sesi dihapus.');render();break;
case 'reset-data':if(confirm('Reset seluruh pekerjaan menjadi data demo awal? Backup terlebih dahulu jika diperlukan.')){resetState();toast('Workspace direset ke data awal')}break;
default:if(action.startsWith('goto-'))go(action.slice(5));}
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
 if(id==='event-form'){const duration=Number(get('event-duration'));if(!Number.isFinite(duration)||duration<0||duration>3600)return toast('Durasi harus antara 0–3600 detik');const active=getState().activeSession;if(!active){toast('Mulai sesi dari halaman Observasi sebelum mencatat kejadian');closeModal();go('observation');return;}
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
 if(id==='lead-form'){const name=get('lead-name').trim();if(!name)return toast('Nama organisasi wajib diisi');const lead={id:uid('lead'),name:name.slice(0,120),segment:get('lead-segment'),stage:get('lead-stage'),amount:Number(get('lead-amount'))||0,contact:get('lead-contact').slice(0,150),next:get('lead-next').slice(0,250),demo:false};closeModal();updateState(s=>({...s,pipeline:[...s.pipeline,lead]}));toast('Prospek ditambahkan');}
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
// PWA service worker, best-effort. HTTPS or localhost required.
if('serviceWorker' in navigator && location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
