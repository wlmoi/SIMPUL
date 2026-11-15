/** Vehicle-first operational diagnostics, using only logged events.
 * This module never identifies drivers or assigns offences. The observer's
 * yes/no/unknown impact fields are retained exactly (unknown != no).
 */
export const ACTIVITIES=Object.freeze(['Jemput','Turun','Menunggu']);
export const ACTIVITY_NAMES=Object.freeze({Jemput:'Menjemput penumpang',Turun:'Menurunkan penumpang',Menunggu:'Menunggu penumpang'});
const impactFields=Object.freeze({lane:'laneBlocked',pedestrian:'pedestrianBlocked',queue:'queueObserved'});
const numeric=value=>(value===null||value===undefined||value==='')?null:(Number.isFinite(Number(value))&&Number(value)>=0?Number(value):null);
export function vehicleProblemSummary(events=[],filter={},thresholdSec=60){
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
