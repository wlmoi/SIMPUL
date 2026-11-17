/**
 * Interval data from the 3D traffic simulation, in the same shape the CCTV AI will send.
 * Used by Obstacle Diagnosis and Plan & Impact only while no real AI/field intervals
 * exist, and always labelled `source:'simulation'`. Nothing here is written to the store.
 *
 * Each run simulates one period (peak = evening commute, off-peak = midday) for one
 * scenario (A0 baseline, A1/A2 follow-up) with the same seed, so before/after pairs are
 * matched on zone + period. Deterministic: the same inputs always give the same numbers.
 */
import {createSim,stepSim,TIME_PRESETS} from './traffic-sim.js';
import {LAYOUT} from './fatmawati-layout.js';
import {SIM_READINGS} from './sim-readings-data.js';

export const SIM_INTERVAL_MINUTES=10;
const SIM_PERIOD_RUNS=Object.freeze([
  Object.freeze({period:'Jam sibuk',preset:TIME_PRESETS.sore,hour:17}),
  Object.freeze({period:'Luar jam sibuk',preset:TIME_PRESETS.siang,hour:13})
]);
const SIM_PHASE_RUNS=Object.freeze([['A0','baseline'],['A1','followup'],['A2','followup']]);
const SIM_SEED=11,SIM_WARMUP_SEC=90,SIM_STEP=0.5,SIM_QUEUE_UPSTREAM_M=60;
// Fixed reference day so the ledger reads like one observation day (not a claim about a real date).
const SIM_DAY='2026-11-16';

function simAccessMeters(zone,scenario){
  if(scenario==='A1')return 20; // dedicated bay under the station, next to the stairs
  const centre=(zone.x0+zone.x1)/2;
  const nearest=Math.min(...LAYOUT.entrances.map(e=>Math.abs(e.x-centre)));
  return Math.round(nearest+15);
}

/** One simulated interval per zone for a scenario + period. */
export function simulateInterval(scenario,phase,run,minutes=SIM_INTERVAL_MINUTES){
  const sim=createSim({scenario,volume:run.preset.volume,pickupShare:run.preset.pickupShare,seed:SIM_SEED});
  for(let t=0;t<SIM_WARMUP_SEC;t+=SIM_STEP)stepSim(sim,SIM_STEP);
  const alightStart=sim.stats.alight;
  const zones=LAYOUT.zones.map(z=>({z,passing:new Set(),stops:new Set(),midRoad:new Set(),maxQueue:0}));
  let bayPeak=0,sampleClock=0;
  for(let t=0;t<minutes*60;t+=SIM_STEP){
    stepSim(sim,SIM_STEP);
    sampleClock+=SIM_STEP;
    const sample=sampleClock>=2;if(sample)sampleClock=0;
    let inBay=0;
    for(const v of sim.vehicles){
      if(v.state==='bayStop')inBay++;
      if(v.road!=='S'||!Number.isFinite(v.x))continue;
      for(const zs of zones){
        if(v.x>=zs.z.x0&&v.x<=zs.z.x1)zs.passing.add(v.id);
        if(v.state==='stopped'&&v.plan?.zone===zs.z.id){zs.stops.add(v.id);if(v.lane>=1)zs.midRoad.add(v.id);}
      }
    }
    bayPeak=Math.max(bayPeak,inBay);
    if(sample)for(const zs of zones){
      const queue=sim.vehicles.filter(v=>v.road==='S'&&v.state!=='stopped'&&v.v<2&&v.x>=zs.z.x0-SIM_QUEUE_UPSTREAM_M&&v.x<=zs.z.x1).length;
      zs.maxQueue=Math.max(zs.maxQueue,queue);
    }
  }
  const pedestrians=sim.stats.alight-alightStart;
  const at=new Date(`${SIM_DAY}T${String(run.hour).padStart(2,'0')}:00:00+07:00`).toISOString();
  const bays=scenario==='A1'?LAYOUT.bay.slots?.length||14:0;
  return zones.map(zs=>Object.freeze({
    id:`sim-${scenario}-${run.period==='Jam sibuk'?'peak':'offpeak'}-${zs.z.id.slice(-1)}`,
    at,recordedAt:at,phase,scenario,period:run.period,zone:zs.z.id,minutes,
    passingVehicles:zs.passing.size,stoppedVehicles:zs.stops.size,maxQueue:zs.maxQueue,
    accessMeters:simAccessMeters(zs.z,scenario),pedestrians:Math.round(pedestrians/zones.length),
    blockedAccess:zs.midRoad.size>0,availableBays:bays,occupiedBays:bays?Math.min(bays,bayPeak):0,
    source:'simulation',sessionId:null,note:'Simulasi CCTV AI'
  }));
}

function simJobs(){return SIM_PERIOD_RUNS.flatMap(run=>SIM_PHASE_RUNS.map(([scenario,phase])=>({scenario,phase,run})));}

/** All simulated intervals at once (used by tests and non-browser callers). */
export function computeSimReadings(minutes=SIM_INTERVAL_MINUTES){
  return simJobs().flatMap(j=>simulateInterval(j.scenario,j.phase,j.run,minutes));
}
/** Precomputed intervals shipped with the app (regenerate: node tools/gen_sim_readings.mjs). */
export function getSimReadings(){return SIM_READINGS;}
