/** Pure monitoring projections. Never turn demo records into field evidence. */
export const SOURCES = ['manual','demo'];
const validDate=x=>{const t=Date.parse(x);return Number.isFinite(t)?t:null;};
export function filterEvents(records=[], filter={}){
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
export function timeSeries(records=[], filter={}){
  const filtered=filterEvents(records,filter);const days=new Set(filtered.map(x=>jakartaDay(x.at)));
  const granularity=(filter.range==='day'||(filter.range==='all'&&days.size<=1))?'hour':'day';
  const keyOf=x=>granularity==='hour'?jakartaHour(x.at):jakartaDay(x.at);
  const bins=new Map();for(const e of filtered){const key=keyOf(e);if(!bins.has(key))bins.set(key,{key,manual:0,demo:0});bins.get(key)[e.source]++;}
  return {granularity,bins:[...bins.values()].sort((a,b)=>a.key.localeCompare(b.key)).slice(-24),filtered};
}
export function monitorStats(records=[],sessions=[],filter={}){
  const items=filterEvents(records,filter),manual=items.filter(x=>x.source==='manual'),demo=items.length-manual.length;
  const dwell=items.reduce((s,e)=>s+(Number(e.duration)||0),0);
  const completed=sessions.filter(s=>s.status==='Selesai'&&((filter.source||'all')==='all'||s.source===filter.source)).length;
  const counts={};for(const e of items)counts[e.type]=(counts[e.type]||0)+1;
  return {total:items.length,manual:manual.length,demo,completed,meanDwell:items.length?dwell/items.length:null,counts,last:items.at(-1)||null};
}
export function monitorAlerts(records=[],sessions=[],now=Date.now()){
  const alerts=[];const manual=records.filter(e=>e.source==='manual');
  if(!manual.length)alerts.push({type:'info',title:'Belum ada observasi lapangan',detail:'Data sintetis tersedia untuk menguji antarmuka. Mulai sesi nyata untuk membuat data yang dapat dievaluasi.'});
  if(sessions.some(s=>s.status==='Berjalan'&&Date.parse(s.startedAt)<now-2*60*60*1000))alerts.push({type:'warning',title:'Sesi berlangsung lebih dari 2 jam',detail:'Periksa apakah sesi masih aktif dan pastikan pencatatan sesuai periode survei.'});
  if(manual.length&&Math.max(...manual.map(e=>Date.parse(e.at)||0))<now-24*60*60*1000)alerts.push({type:'info',title:'Tidak ada rekaman manual 24 jam terakhir',detail:'Ini merupakan indikator kesegaran data, bukan bukti gangguan lalu lintas.'});
  return alerts;
}
