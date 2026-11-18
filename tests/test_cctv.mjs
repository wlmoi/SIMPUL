import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderCctv,CCTV_ZONES,CAMERA_PRESETS} from '../js/views/cctv.js';
import {ingestDetections,getAiWindowSummary,resetAiWindow} from '../js/cctv-controller.js';
import {getState} from '../js/store.js';
import {PRIMARY_ROUTES} from '../js/navigation.js';
import {buildFatmawatiScene} from '../js/sim3d-scene.js';
import {cameraFrame,projectPoint,screenToGround} from '../js/sim3d-engine.js';

assert.equal(PRIMARY_ROUTES[1],'cctv','CCTV AI is the first step after Beranda');
const html=renderCctv();
for(const z of CCTV_ZONES)assert.ok(html.includes(`data-zone-row="${z.id}"`),z.id);
for(const s of ['A0','A1','A2'])assert.ok(html.includes(`data-value="${s}"`),s);
assert.match(html,/tanpa plat nomor dan wajah/);
assert.match(html,/belum dikalibrasi/,'Simulation must be labelled as uncalibrated');
assert.match(html,/AI belum terhubung/,'Default state must be unavailable, never a fake success');
assert.match(html,/window\.SIMPUL_CCTV\.push/,'AI integration contract is documented on the page');
assert.ok(!/JORR S · KM|Hutama Karya/.test(html),'Toll cameras are no longer used');
assert.ok(CAMERA_PRESETS.length>=3);

// Demo detections never accumulate an AI window, and display-only detections never change stored observations.
ingestDetections({source:'demo',detections:[{id:'demo-1',cls:'car',conf:0.9,box:[0.4,0.65,0.08,0.1],zone:'Zona B',dwellSec:45}]});
assert.equal(getAiWindowSummary('Zona B'),null,'Demo mode must not produce a CV window summary');
const before=JSON.stringify(getState().observations);
ingestDetections({source:'ai',model:'test',detections:[{id:'t1',cls:'car',conf:0.9,box:[0.4,0.65,0.08,0.1],zone:'Zona B',dwellSec:70}]});
ingestDetections({source:'ai',detections:[{id:'bad',cls:'car',box:['x',1,2]}]});
ingestDetections(null);
assert.equal(JSON.stringify(getState().observations),before);
const aiWin=getAiWindowSummary('Zona B');
assert.equal(aiWin?.totalVehicles,1);
assert.equal(aiWin?.overThresholdCount,1);
assert.equal(aiWin?.meanDwellSec,70);
assert.equal(aiWin?.vehicleCountsByClass?.car,1);
assert.equal('id' in aiWin,false,'Window summary must not export track IDs');
resetAiWindow('Zona B');
assert.equal(getAiWindowSummary('Zona B')?.totalVehicles,0,'Reset clears zone window immediately');
ingestDetections({source:'ai',detections:[{id:'t1',cls:'car',conf:0.9,box:[0.4,0.65,0.08,0.1],zone:'Zona B',dwellSec:75},{id:'t2',cls:'motorcycle',conf:0.88,box:[0.45,0.66,0.06,0.08],zone:'Zona B',dwellSec:30}]});
const winAfter=getAiWindowSummary('Zona B');
assert.equal(winAfter?.totalVehicles,1,'Still-stopped t1 from prior window is not double-counted');
assert.equal(winAfter?.vehicleCountsByClass?.motorcycle,1);
assert.equal(getAiWindowSummary('Area A1')?.totalVehicles,0);

// Static scene and camera math.
const scene=buildFatmawatiScene();
assert.ok(scene.boxes.length>200&&scene.ground.length>50);
for(const b of scene.boxes)assert.ok(b.c.every(Number.isFinite)&&b.h.every(x=>Number.isFinite(x)&&x>0));
const B=cameraFrame({target:[0,0,0],yaw:-0.9,pitch:0.6,dist:200,fov:0.9},800,450);
const p=projectPoint(B,[0,0,0]);assert.ok(Math.abs(p[0]-400)<0.01&&Math.abs(p[1]-225)<0.01,'target projects to centre');
const g=screenToGround(B,400,225);assert.ok(Math.hypot(g[0],g[2])<0.01,'centre ray hits target on ground');

for(const f of ['../js/cctv-controller.js','../js/sim3d-engine.js','../js/sim3d-scene.js','../js/traffic-sim.js']){
  const src=readFileSync(new URL(f,import.meta.url),'utf8');
  assert.ok(!/updateState|localStorage|fetch\(/.test(src),`${f} stays presentation-only`);
}
console.log('PASS cctv: 3D page, scenarios, uncalibrated labelling, display-only detections, scene + camera math');
