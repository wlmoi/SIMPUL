import assert from 'node:assert/strict';
import {summarizeReadings,comparePeriods,evidenceGate,diagnose,screenScenario} from '../js/diagnostics.js';
const r=(id,phase,zone,period,minutes,passingVehicles,stoppedVehicles,maxQueue,accessMeters,blockedAccess)=>({id,phase,scenario:phase==='baseline'?'A0':'A1',zone,period,at:'2026-11-15T08:00:00+07:00',minutes,passingVehicles,stoppedVehicles,maxQueue,accessMeters,pedestrians:22,blockedAccess,availableBays:4,occupiedBays:2,source:'manual'});
const rows=[r('a','baseline','Zona A','Jam sibuk',30,200,20,12,120,true),r('b','baseline','Zona A','Jam sibuk',60,400,30,14,160,false),r('c','followup','Zona A','Jam sibuk',60,450,25,7,130,false),r('d','baseline','Zona B','Luar jam sibuk',60,90,9,3,95,false),r('e','followup','Zona C','Jam sibuk',30,300,1,2,90,false)];
const b=summarizeReadings(rows,{phase:'baseline'});
assert.equal(b.samples,3);assert.equal(b.minutes,150);assert.equal(b.stopPerHour,23.6);assert.equal(b.peakQueue,14);
const c=comparePeriods(rows);
assert.deepEqual(c.comparable,['Zona A|Jam sibuk']);assert.equal(c.before.samples,2);assert.equal(c.after.samples,1);
assert.equal(c.changes.stopPerHour,-8.3);assert.equal(c.changes.avgQueue,-6);
assert.ok(c.limitations[0].includes('tidak membuktikan'));
const synthetic=[{...rows[0],id:'demoX',source:'demo'}];assert.equal(summarizeReadings(synthetic).samples,0);
const onlyBefore=comparePeriods([rows[0]]);assert.equal(onlyBefore.comparableSamples,false);assert.equal(onlyBefore.changes.stopPerHour,null);
const gate=evidenceGate(rows,[{source:'demo',status:'Selesai'},{source:'manual',status:'Selesai'}],[{source:'demo'},{source:'manual'}]);
assert.equal(gate.completed,1);assert.equal(gate.manualEvents,1);assert.equal(gate.checks.at(-1).met,false);
const d=diagnose(rows,[{source:'manual',type:'Menunggu',duration:95}],{dwellThresholdSec:60});assert.equal(d.waiting,1);assert.equal(d.long,1);
const a=screenScenario({engine:'heuristic',scenarios:[{id:'A1',delay:19,queue:20,access:70},{id:'A2',delay:23,queue:8,access:140}]},{maxQueue:15,maxDetour:150});assert.equal(a[0].id,'A2');assert.equal(a[1].eligible,false);
// Simulated CCTV AI intervals fill the analysis only while no real interval exists, always labelled.
{
  const {analysisReadings,comparePeriods:cmp,diagnose:diag}=await import('../js/diagnostics.js');
  const {getSimReadings,simulateInterval}=await import('../js/sim-readings.js');
  const {TIME_PRESETS}=await import('../js/traffic-sim.js');
  const sim=getSimReadings();
  assert.equal(sim.length,18,'3 zones x 2 periods x A0/A1/A2');
  assert.ok(sim.every(r=>r.source==='simulation'),'Simulated intervals are always labelled');
  const pick=analysisReadings([],sim);assert.equal(pick.simulated,true);assert.equal(pick.readings,sim);
  const real=[{...rows[0],source:'ai'}];assert.equal(analysisReadings(real,sim).simulated,false,'Real AI data wins over simulation');
  assert.equal(analysisReadings([{source:'demo'}],sim).simulated,true,'Demo events never count as real intervals');
  assert.equal(cmp(sim,'A1').comparable.length,6,'Every zone + period has a matched before/after pair');
  assert.ok(diag(sim,[],{}).base.samples===6);
  // The shipped data equals a fresh run of the simulation (deterministic).
  const again=simulateInterval('A0','baseline',{period:'Jam sibuk',preset:TIME_PRESETS.sore,hour:17});
  assert.deepEqual(again.map(r=>({...r})),sim.slice(0,3).map(r=>({...r})),'Regenerate js/sim-readings-data.js with node tools/gen_sim_readings.mjs');
}
console.log('PASS: field normalization, matched before/after, source exclusion, quality gates, risk thresholds and scenario guardrails');
