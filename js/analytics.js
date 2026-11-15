import {clamp} from './util.js';
export function observationStats(obs){
  const n=obs.length, total=obs.reduce((s,e)=>s+(Number(e.duration)||0),0);
  return {count:n,avgDwell:n?total/n:0,pickup:obs.filter(e=>e.type==='Jemput').length,dropoff:obs.filter(e=>e.type==='Turun').length,waiting:obs.filter(e=>e.type==='Menunggu').length,real:obs.filter(e=>e.source==='manual').length,synthetic:obs.filter(e=>e.source==='demo').length,zoneCount:new Set(obs.map(e=>e.zone)).size};
}
/** Transparent illustrative capacity/queue heuristic. NOT a SUMO simulation or validated traffic model. */
export function heuristicSimulation(p){
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
export function compareScenarios(results){if(!results?.scenarios?.length)return null;const s=results.scenarios;const a=s.find(x=>x.id==='A0')||s[0];return s.map(x=>({...x,delayChange:a.delay?100*(x.delay-a.delay)/a.delay:0,queueChange:a.queue?100*(x.queue-a.queue)/a.queue:0}));}
export function rankScenarios(results){const list=compareScenarios(results)||[];return [...list].sort((a,b)=>((a.delay/70)*.6+(a.queue/70)*.25+(a.access/400)*.15)-((b.delay/70)*.6+(b.queue/70)*.25+(b.access/400)*.15));}
export function eventByType(obs){const s=observationStats(obs);return[{name:'Jemput',count:s.pickup,color:'teal'},{name:'Turun',count:s.dropoff,color:'blue'},{name:'Menunggu',count:s.waiting,color:'navy'}]}
