/** Evidence-first diagnostics on interval data from the CCTV AI (source 'ai'), field entries ('manual')
 * or the labelled 3D simulation ('simulation', see js/sim-readings.js). Views never mix simulation with real data.
 * Never merge synthetic observation events with field readings or attribute causality to before/after changes.
 */
const finite = v => typeof v === 'number' && Number.isFinite(v);
const avg = xs => xs.length ? xs.reduce((a,b)=>a+b,0)/xs.length : null;
const round = (v,d=1) => v===null ? null : Number(v.toFixed(d));
export const PERIODS=['Jam sibuk','Luar jam sibuk'];
export const PHASES=['baseline','followup'];
export const ANALYSABLE_SOURCES=Object.freeze(['manual','ai','simulation']);
/** Real interval data wins; the labelled simulation is only used when no real interval exists. */
export function analysisReadings(stored=[],simulated=[]){
  const real=stored.filter(r=>r.source==='manual'||r.source==='ai');
  return real.length?{readings:stored,simulated:false}:{readings:simulated,simulated:true};
}
export function summarizeReadings(records=[], filter={}) {
  const rows=records.filter(r=>ANALYSABLE_SOURCES.includes(r.source)&&PHASES.includes(r.phase)&&finite(r.minutes)&&r.minutes>0&&(!filter.phase||r.phase===filter.phase)&&(!filter.zone||r.zone===filter.zone)&&(!filter.period||r.period===filter.period)&&(!filter.scenario||r.scenario===filter.scenario));
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
export function comparePeriods(records=[],scenario='A1') {
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
export function diagnose(records=[],events=[],settings={}) {
 const base=summarizeReadings(records,{phase:'baseline'}),full=summarizeReadings(records),manual=events.filter(e=>e.source==='manual');
 const total=manual.length,wait=manual.filter(e=>e.type==='Menunggu'),threshold=Number(settings.dwellThresholdSec)||60;
 const long=manual.filter(e=>Number(e.duration)>threshold);
 const groups=[...new Set(base.rows.map(r=>r.zone))].map(zone=>({zone,...summarizeReadings(base.rows,{zone})})).sort((a,b)=>(b.stopPerHour??-1)-(a.stopPerHour??-1));
 const warnings=[];
 if(!base.samples)warnings.push({kind:'missing',title:'Belum ada pengukuran interval baseline',detail:'Data interval (volume, antrean, akses) akan terisi otomatis dari deteksi CCTV AI.'});
 if(wait.length)warnings.push({kind:'observed',title:`${wait.length} peristiwa menunggu tercatat`,detail:'Dari data kejadian yang tersimpan. Periksa posisi dan waktu terhadap arus utama.'});
 if(long.length)warnings.push({kind:'observed',title:`${long.length} peristiwa melewati ${threshold} detik`,detail:'Batas adalah ambang analisis yang dapat diubah, bukan ketentuan hukum lalu lintas.'});
 if(base.rows.some(r=>r.blockedAccess))warnings.push({kind:'observed',title:'Ada interval dengan hambatan akses pejalan kaki',detail:'Catat posisi dan lakukan inspeksi keselamatan sebelum merekomendasikan lokasi jemput.'});
 if(base.rows.some(r=>r.availableBays>0&&r.occupiedBays>=r.availableBays))warnings.push({kind:'observed',title:'Fasilitas jemput terisi penuh pada sedikitnya satu interval',detail:'Periksa ketersediaan ruang, perputaran kendaraan dan perpindahan penumpang.'});
 const hypotheses=[];
 if(base.samples===0)hypotheses.push({id:'H0',title:'Lengkapi baseline terlebih dahulu',basis:'Belum ada interval pengukuran volume, antrean dan akses.',next:'Hubungkan CCTV AI untuk mengisi data jam sibuk dan non-sibuk.',scenario:'A0'});
 if(wait.length||long.length)hypotheses.push({id:'H1',title:'Uji batas waktu tunggu/berhenti',basis:`${wait.length} kejadian Menunggu; ${long.length} kejadian melewati ambang ${threshold} detik`,next:'Bandingkan A2 dengan A0 menggunakan volume dan waktu kedatangan sebanding.',scenario:'A2'});
 if(base.rows.some(r=>r.availableBays>0&&r.occupiedBays>=r.availableBays)||base.stopPerHour!==null&&base.stopPerHour>0)hypotheses.push({id:'H2',title:'Periksa penataan ruang jemput yang sudah tersedia',basis:`${base.samples} interval baseline, ${base.stopped} kendaraan berhenti teramati`,next:'Verifikasi kapasitas area jemput dan detour pejalan sebelum menguji A1.',scenario:'A1'});
 if(base.rows.some(r=>r.blockedAccess))hypotheses.push({id:'H3',title:'Prioritaskan lintasan pejalan kaki',basis:`${base.blockedSamples} interval baseline tercatat akses terhalang`,next:'Cek jalur penyeberangan, akses disabilitas dan titik konflik langsung di lapangan.',scenario:'A1/A2'});
 return {base,full,groups,total,waiting:wait.length,long:long.length,threshold,warnings,hypotheses,completedSessions:0};
}
export function evidenceGate(readings=[],sessions=[],events=[]) {
 const baseline=summarizeReadings(readings,{phase:'baseline'}),followup=summarizeReadings(readings,{phase:'followup'}),pairedGroups=['A0','A1','A2'].reduce((a,code)=>a+comparePeriods(readings,code).comparable.length,0);
 const completed=sessions.filter(s=>s.source==='manual'&&s.status==='Selesai').length;
 return {completed,baselineCount:baseline.samples,followupCount:followup.samples,pairedGroups,manualEvents:events.filter(e=>e.source==='manual').length,
  targetSessions:12, // proposed survey plan, not verified performance target
  checks:[{label:'Interval baseline berisi antrean dan akses',value:`${baseline.samples} interval`,met:baseline.samples>=2},
   {label:'Data pembanding sesudah intervensi',value:`${followup.samples} interval`,met:followup.samples>=2},
   {label:'Zona dan periode berpasangan',value:`${pairedGroups} pasangan skenario–zona–periode`,met:pairedGroups>0},
   {label:'Kalibrasi SUMO terhadap lapangan',value:'Belum terverifikasi',met:false}]
 };
}
export function screenScenario(results,criteria={}) {
 const candidates=results?.scenarios||[],maxQueue=Number(criteria.maxQueue??15),maxDetour=Number(criteria.maxDetour??150);
 const ranked=candidates.map(s=>({ ...s, passesQueue:s.queue<=maxQueue,passesAccess:s.access<=maxDetour,eligible:s.queue<=maxQueue&&s.access<=maxDetour,
   caveat:results?.engine==='heuristic'?'Hanya screening model ilustratif': 'Keluaran simulator memerlukan validasi koridor' }));
 return ranked.sort((a,b)=>Number(b.eligible)-Number(a.eligible)||a.delay-b.delay);
}
