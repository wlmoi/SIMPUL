import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderCctv,CCTV_ZONES,CAMERA_PRESETS} from '../js/views/cctv.js';
import {ingestDetections} from '../js/cctv-controller.js';
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

// Detections are display-only: they must never change stored observations.
const before=JSON.stringify(getState().observations);
ingestDetections({source:'ai',model:'test',detections:[{id:'t1',cls:'car',conf:0.9,box:[0.4,0.65,0.08,0.1],zone:'Zona B',dwellSec:70}]});
ingestDetections({source:'ai',detections:[{id:'bad',cls:'car',box:['x',1,2]}]});
ingestDetections(null);
assert.equal(JSON.stringify(getState().observations),before);

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
// Beranda AI status: connected only while real detections keep arriving.
{
  const {reportAiStatus,getAiStatus}=await import('../js/ai-status.js');
  assert.equal(getAiStatus(0).connected,false,'No AI before any detection');
  reportAiStatus({model:'YOLOv8n',counts:{car:3,motorcycle:5,bus:1},stopped:2,over:1},1000);
  const live=getAiStatus(2000);
  assert.equal(live.connected,true);assert.equal(live.model,'YOLOv8n');assert.deepEqual(live.counts,{car:3,motorcycle:5,bus:1});assert.equal(live.stopped,2);
  assert.equal(getAiStatus(1000+16000).connected,false,'AI status goes stale after 15 s without detections');
}
console.log('PASS cctv: 3D page, scenarios, uncalibrated labelling, display-only detections, scene + camera math');
