import assert from 'node:assert/strict';
import {createSim,stepSim,simMetrics,runScenario,placeStoppedVehicle,SCENARIOS,TIME_PRESETS} from '../js/traffic-sim.js';

assert.deepEqual(Object.keys(SCENARIOS),['A0','A1','A2']);
assert.ok(TIME_PRESETS.sore.volume>TIME_PRESETS.siang.volume);
const run=s=>runScenario({scenario:s,volume:2100,pickupShare:18,seed:7},300,90);
const a0=run('A0'),a0b=run('A0'),a1=run('A1'),a2=run('A2');
assert.deepEqual(a0,a0b,'Deterministic for a fixed seed');
for(const m of [a0,a1,a2])for(const [k,v] of Object.entries(m))if(typeof v==='number')assert.ok(Number.isFinite(v)&&v>=0,`${k}=${v}`);
assert.ok(a0.avgBlocked>0,'A0 has vehicles stopping in the lane');
assert.ok(a1.avgBlocked<a0.avgBlocked,'A1 moves pick-ups out of the travel lane');
assert.ok(a1.conflictsPerHour<=a0.conflictsPerHour,'A1 reduces passengers alighting mid-road');
assert.ok(a1.avgSpeedKmh>a0.avgSpeedKmh,'A1 improves speed in this illustrative setting');

const sim=createSim({scenario:'A0',seed:3});
for(let i=0;i<120;i++)stepSim(sim,0.5);
assert.ok(sim.vehicles.length>20&&sim.vehicles.every(v=>Number.isFinite(v.x)&&Number.isFinite(v.z)&&v.v>=0));
const id=placeStoppedVehicle(sim,-120,'motorcycle');
assert.ok(id===null||sim.vehicles.some(v=>v.id===id&&v.state==='stopped'));
assert.ok(simMetrics(sim).live.speed>=0);
console.log('PASS traffic sim: deterministic, finite metrics, A0 lane blocking, A1 relief, interactive placement');
