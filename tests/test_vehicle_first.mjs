import assert from 'node:assert/strict';
import {vehicleProblemSummary} from '../js/vehicle-problem.js';
import {initialData,views} from '../js/data.js';
import {renderVehicles} from '../js/views/vehicles.js';
import {pageRenderers} from '../js/page-registry.js';
import {PRIMARY_ROUTES,assertNavigationCoverage} from '../js/navigation.js';
import {readFileSync} from 'node:fs';
const rows=[
{id:'a',source:'manual',type:'Menunggu',zone:'Zona A',duration:180,pedestrianBlocked:'yes',laneBlocked:'unknown',queueObserved:'yes'},
{id:'b',source:'manual',type:'Jemput',zone:'Zona B',duration:20,pedestrianBlocked:'no',laneBlocked:'no',queueObserved:'unknown'},
{id:'c',source:'demo',type:'Turun',zone:'Zona C',duration:40},
];
let r=vehicleProblemSummary(rows,{source:'manual',type:'all',zone:'all'},60);
assert.equal(r.filtered.length,2);assert.equal(r.overThreshold,1);assert.equal(r.avgDwell,100);
assert.deepEqual(r.impacts.pedestrian,{yes:1,no:1,unknown:0});
assert.deepEqual(r.impacts.lane,{yes:0,no:1,unknown:1});
assert.equal(r.counts.Menunggu,1);assert.equal(r.counts.Turun,0);
assert.equal(r.hypotheses[0].code,'SAFETY');assert.ok(r.hypotheses.some(h=>h.code==='A2'));
r=vehicleProblemSummary(rows,{source:'manual',type:'Jemput',zone:'Zona B'},60);assert.equal(r.filtered.length,1);assert.equal(r.overThreshold,0);
r=vehicleProblemSummary(rows,{source:'demo'},60);assert.equal(r.filtered.length,1);assert.equal(r.impacts.queue.unknown,1);
r=vehicleProblemSummary([],{source:'manual'},60);assert.equal(r.avgDwell,null);assert.equal(r.hypotheses[0].code,'A0');
assert.equal(initialData().vehicleView.source,'demo');
assert.equal(assertNavigationCoverage(),views.length);assert.equal(views.length,16);
assert.ok(PRIMARY_ROUTES.indexOf('vehicles') < PRIMARY_ROUTES.indexOf('diagnosis'));
assert.equal(typeof pageRenderers.vehicles,'function');
let html=readFileSync(new URL('../js/views/vehicles.js',import.meta.url),'utf8');
assert.match(html,/DETEKSI CCTV AI/);assert.match(html,/SIMULASI FATMAWATI/);assert.match(html,/Uji A0 \/ A1 \/ A2/);
assert.match(html,/tidak boleh dihitung sebagai bukti/);
console.log('PASS vehicle problem: event filtering, impact unknowns, synthetic separation, safe hypotheses, route registration');
