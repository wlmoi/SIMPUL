/**
 * CCTV AI Live runtime: interactive 3D traffic simulation of the MRT Fatmawati
 * frontage, a virtual AI camera that turns simulated vehicles into detection
 * boxes, and a browser-side intake for a real model
 * (window.SIMPUL_CCTV.push / 'simpul:detections').
 *
 * Presentation only. Nothing here writes to the store, observations or exports.
 * Simulated detections are synthetic and labelled as such everywhere they appear.
 */
import {reportAiStatus} from './ai-status.js';
import {CCTV_ZONES,CCTV_CLASSES,CAMERA_PRESETS} from './views/cctv.js';
import {LAYOUT} from './fatmawati-layout.js';
import {createSim,stepSim,simMetrics,runScenario,placeStoppedVehicle,resetStats,SCENARIOS,TIME_PRESETS} from './traffic-sim.js';
import {getFatmawatiScene,buildDynamicScene} from './sim3d-scene.js';
import {createCamera,renderFrame,boxCorners,projectPoint,screenToGround} from './sim3d-engine.js';
import {bindViewerFullscreen} from './viewer-controls.js';

const STOP_LOG_SEC=8;
const PANEL_INTERVAL=250;
const STALE_MS=1500;
const ZONE_IDS=new Set(CCTV_ZONES.map(z=>z.id));
const CLOCK_START={pagi:7*3600,siang:12*3600,sore:17*3600};
const KIND_LABEL={ojol:'Ojol',pribadi:'Kendaraan pribadi',transjakarta:'Bus Transjakarta',umum:'Kendaraan umum'};

const rt={
  mode:'idle', model:'', tracks:new Map(), seen:new Map(), logged:new Map(),
  feed:[], dwells:[], frames:[], showZones:true, showLabels:true, stationOpacity:1,
  videoUrl:null, videoTime:0, raf:0, lastPanel:0, root:null, threshold:60, resume:false,
  sim:null, scene:null, cam:null, camAnim:null, preset:'drone', speed:1,
  opts:{scenario:'A0', volume:2100, pickupShare:18, time:'sore', seed:7},
  frame:null, selected:null, follow:false, placing:false, compare:null, comparing:false,
  drag:null, lastBoxes:[], started:false
};

const clsKey=c=>c==='truck'?'bus':(CCTV_CLASSES[c]?c:'car');
const clsLabel=c=>CCTV_CLASSES[clsKey(c)].label;
const zoneOf=([x,y,w,h])=>{const cx=x+w/2,cy=y+h/2;return CCTV_ZONES.find(z=>z.box&&cx>=z.box[0]&&cx<=z.box[0]+z.box[2]&&cy>=z.box[1]&&cy<=z.box[1]+z.box[3])?.id||null;};
const fmtSec=s=>`${Math.round(s)} dtk`;
const nowClock=()=>new Intl.DateTimeFormat('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false,timeZone:'Asia/Jakarta'}).format(new Date());
const simClock=()=>{const t=Math.floor((CLOCK_START[rt.opts.time]||CLOCK_START.sore)+(rt.sim?.t||0));return `${String(Math.floor(t/3600)%24).padStart(2,'0')}:${String(Math.floor(t/60)%60).padStart(2,'0')}`;};
const $=sel=>rt.root?.querySelector(sel);
const $$=sel=>[...(rt.root?.querySelectorAll(sel)||[])];

/* ======================================================= detection intake */
function pushFeed(kind,text){
  rt.feed.unshift({kind,text,at:nowClock(),demo:rt.mode!=='ai'});
  rt.feed.length=Math.min(rt.feed.length,30);
}
function closeTrack(id,t){
  const log=rt.logged.get(id)||{};
  if(t?.zone&&log.stop){rt.dwells.push(t.dwellSec||0);pushFeed('leave',`${clsLabel(t.cls)} meninggalkan ${t.zone} setelah ${fmtSec(t.dwellSec||0)}`);}
  rt.logged.delete(id);rt.tracks.delete(id);
}
export function ingestDetections(detail){
  if(!detail||!Array.isArray(detail.detections))return;
  const source=detail.source==='ai'?'ai':'demo';
  if(source==='ai'&&rt.mode!=='ai'){rt.mode='ai';rt.tracks.clear();rt.logged.clear();pushFeed('info','Model AI terhubung'+(detail.model?` (${String(detail.model).slice(0,40)})`:''));}
  if(source==='demo'&&rt.mode==='ai')return;
  if(detail.model)rt.model=String(detail.model).slice(0,40);
  const now=performance.now();
  rt.frames.push(now);
  const present=new Set();
  for(const raw of detail.detections.slice(0,200)){
    const box=(Array.isArray(raw.box)?raw.box:[]).slice(0,4).map(Number);
    if(box.length!==4||box.some(v=>!Number.isFinite(v)))continue;
    const id=String(raw.id??`${raw.cls}-${box.join(',')}`).slice(0,40);
    const cls=clsKey(String(raw.cls||'car'));
    const zone='zone' in raw?(raw.zone?String(raw.zone).slice(0,20):null):zoneOf(box);
    const dwellSec=Math.max(0,Number(raw.dwellSec)||0);
    const conf=Math.min(1,Math.max(0,Number(raw.conf)||0));
    const prev=rt.tracks.get(id);
    if(prev?.zone&&prev.zone!==zone)closeTrack(id,prev);
    rt.tracks.set(id,{id,cls,conf,box,zone,dwellSec,t:now});
    present.add(id);
    if(!rt.seen.has(id))rt.seen.set(id,cls);
    const log=rt.logged.get(id)||{};
    if(zone&&dwellSec>=STOP_LOG_SEC&&!log.stop){log.stop=true;pushFeed('stop',`${clsLabel(cls)} berhenti di ${zone}`);}
    if(zone&&dwellSec>=rt.threshold&&!log.over){log.over=true;pushFeed('over',`${clsLabel(cls)} di ${zone} melewati ${rt.threshold} dtk`);}
    rt.logged.set(id,log);
  }
  for(const [id,t] of rt.tracks){
    if(source==='demo'?!present.has(id):now-t.t>STALE_MS)closeTrack(id,t);
  }  if(source==='ai'){
    const counts={car:0,motorcycle:0,bus:0};for(const c of rt.seen.values())counts[c]=(counts[c]||0)+1;
    const stoppedNow=[...rt.tracks.values()].filter(t=>t.zone&&t.dwellSec>=STOP_LOG_SEC);
    reportAiStatus({model:rt.model,counts,stopped:stoppedNow.length,over:stoppedNow.filter(t=>t.dwellSec>=rt.threshold).length});
  }
}

/* ======================================================= simulation */
function newSim(){
  rt.sim=createSim({...rt.opts});
  // Warm up so the road already carries traffic when the judges look at it.
  for(let i=0;i<180;i++)stepSim(rt.sim,0.5);
  resetStats(rt.sim);
  rt.selected=null;rt.follow=false;
  resetDetections();
}
function resetDetections(){
  rt.tracks.clear();rt.seen.clear();rt.logged.clear();rt.feed=[];rt.dwells=[];rt.frames=[];
  const layer=$('[data-cctv-overlay]');if(layer)layer.innerHTML='';
}
function ensureWorld(){
  if(!rt.scene)rt.scene=getFatmawatiScene();
  if(!rt.cam){
    rt.cam=createCamera();
    const q=new URLSearchParams(location.search);
    if(SCENARIOS[q.get('scenario')])rt.opts.scenario=q.get('scenario');
    applyPreset(CAMERA_PRESETS.some(c=>c.id===q.get('cam'))?q.get('cam'):'drone',false);
  }
  if(!rt.sim)newSim();
}
function applyPreset(id,animate=true){
  const p=CAMERA_PRESETS.find(c=>c.id===id);if(!p)return;
  rt.preset=id;rt.follow=false;
  const to={target:[...p.target],yaw:p.yaw,pitch:p.pitch,dist:p.dist};
  if(!animate){Object.assign(rt.cam,to);rt.camAnim=null;}
  else{
    let dy=to.yaw-rt.cam.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));
    rt.camAnim={from:{target:[...rt.cam.target],yaw:rt.cam.yaw,pitch:rt.cam.pitch,dist:rt.cam.dist},to:{...to,yaw:rt.cam.yaw+dy},t:0};
  }
  syncControls();
}
function stepCamera(dt){
  const a=rt.camAnim;
  if(a){
    a.t=Math.min(1,a.t+dt/0.9);const k=a.t<0.5?2*a.t*a.t:1-Math.pow(-2*a.t+2,2)/2;
    for(let i=0;i<3;i++)rt.cam.target[i]=a.from.target[i]+(a.to.target[i]-a.from.target[i])*k;
    rt.cam.yaw=a.from.yaw+(a.to.yaw-a.from.yaw)*k;rt.cam.pitch=a.from.pitch+(a.to.pitch-a.from.pitch)*k;rt.cam.dist=a.from.dist+(a.to.dist-a.from.dist)*k;
    if(a.t>=1)rt.camAnim=null;
  }
  if(rt.follow&&rt.selected){
    const v=rt.sim.vehicles.find(x=>x.id===rt.selected);
    if(!v){rt.follow=false;return;}
    const k=Math.min(1,dt*3);
    rt.cam.target[0]+=(v.x-rt.cam.target[0])*k;rt.cam.target[2]+=(v.z-rt.cam.target[2])*k;
  }
}

/* ======================================================= 3D content */
function dynScene(){
  const dyn=buildDynamicScene(rt.sim);
  if(rt.selected){
    const v=rt.sim.vehicles.find(x=>x.id===rt.selected);
    if(v)dyn.labels.push({p:[v.x,v.spec.h+2.4,v.z],text:`${KIND_LABEL[v.kind]||'Kendaraan'} · ${Math.round(v.v*3.6)} km/jam`,bg:'rgba(248,104,9,.95)',fg:'#1b2b4e'});
  }
  return dyn;
}

function detectionsFromView(B){
  const out=[],boxes=[];
  for(const v of rt.sim.vehicles){
    if(v.road==='T')continue;
    const corners=boxCorners({c:[v.x,v.spec.h/2,v.z],h:[v.spec.len/2,v.spec.h/2,v.spec.wid/2],yaw:v.yaw});
    let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity,ok=true;
    for(const c of corners){const p=projectPoint(B,c);if(!p){ok=false;break;}x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1]);}
    if(!ok||x1<0||y1<0||x0>B.w||y0>B.h)continue;
    x0=Math.max(0,x0);y0=Math.max(0,y0);x1=Math.min(B.w,x1);y1=Math.min(B.h,y1);
    const w=(x1-x0)/B.w,h=(y1-y0)/B.h;
    if(w<0.006||h<0.006||w>0.7)continue;
    const stopped=v.state==='stopped'||v.state==='bayStop';
    let zone=null;
    if(stopped)zone=v.road==='B'?LAYOUT.bayZoneId:(ZONE_IDS.has(v.plan?.zone)?v.plan.zone:null);
    out.push({id:v.id,cls:v.cls,conf:v.conf,box:[x0/B.w,y0/B.h,w,h],zone,dwellSec:stopped?v.dwellAcc:0});
    boxes.push({id:v.id,x0,y0,x1,y1});
    if(out.length>=90)break;
  }
  rt.lastBoxes=boxes;
  return out;
}

/* ======================================================= drawing */
function drawOverlay(){
  const layer=$('[data-cctv-overlay]');if(!layer)return;
  const live=new Set();
  for(const t of rt.tracks.values()){
    live.add(t.id);
    let el=layer.querySelector(`[data-track="${CSS.escape(t.id)}"]`);
    if(!el){el=document.createElement('div');el.className='cctv-box';el.dataset.track=t.id;el.innerHTML='<span></span>';layer.append(el);}
    const over=t.zone&&t.dwellSec>=rt.threshold,stopped=t.zone&&t.dwellSec>=STOP_LOG_SEC;
    el.style.left=`${t.box[0]*100}%`;el.style.top=`${t.box[1]*100}%`;el.style.width=`${t.box[2]*100}%`;el.style.height=`${t.box[3]*100}%`;
    el.dataset.state=over?'over':stopped?'stop':'move';
    el.classList.toggle('selected',t.id===rt.selected);
    el.classList.toggle('tiny',!stopped&&t.id!==rt.selected&&t.box[2]<0.04);
    el.firstChild.textContent=`${clsLabel(t.cls)} ${Math.round(t.conf*100)}%${stopped?` · ${fmtSec(t.dwellSec)}`:''}`;
  }
  layer.querySelectorAll('[data-track]').forEach(el=>{if(!live.has(el.dataset.track))el.remove();});
}
function setText(sel,v){const el=$(sel);if(el&&el.textContent!==String(v))el.textContent=v;}
function describe(v){
  const where=v.road==='B'?'jalur jemput A1':v.road==='S'?['lajur kiri','lajur tengah','lajur kanan'][v.lane]:'jalan seberang';
  return ({drive:`Melaju ${Math.round(v.v*3.6)} km/jam di ${where}`,seek:`Mencari titik ${v.plan?.mode==='bay'?'jemput A1':'berhenti '+(v.plan?.zone||'')}`,approach:`Melambat untuk berhenti di ${v.plan?.zone||''}`,
    stopped:`Berhenti ${fmtSec(v.dwellAcc)} di ${v.plan?.zone||'pinggir jalan'} (${where})${v.road==='S'&&v.lane>=1?' · parkir ganda':''}`,
    toBay:'Masuk jalur jemput A1',bay:'Menuju slot jemput A1',bayStop:`Menunggu penumpang ${fmtSec(v.dwellAcc)} di jalur A1`,bayOut:'Keluar dari jalur A1, menunggu celah'})[v.state]||'Melaju';
}
function drawInspect(){
  const box=$('[data-sim-inspect]');if(!box)return;
  const v=rt.selected&&rt.sim?.vehicles.find(x=>x.id===rt.selected);
  if(!v){box.hidden=true;if(rt.selected){rt.selected=null;rt.follow=false;}return;}
  box.hidden=false;
  if(box.dataset.id!==v.id||box.dataset.follow!==String(rt.follow)){
    box.innerHTML=`<div class="sim-inspect-head"><b></b><button type="button" data-sim="unselect" aria-label="Tutup">×</button></div><p></p><button type="button" class="sim-follow" data-sim="follow" aria-pressed="${rt.follow}">${rt.follow?'Berhenti mengikuti':'Ikuti kendaraan'}</button>`;
    box.dataset.id=v.id;box.dataset.follow=String(rt.follow);
  }
  box.querySelector('b').textContent=`${KIND_LABEL[v.kind]||'Kendaraan'} · ${clsLabel(v.cls)}`;
  box.querySelector('p').textContent=describe(v);
}
function drawPanels(){
  const root=rt.root;if(!root)return;
  const now=performance.now();
  rt.frames=rt.frames.filter(t=>now-t<1000);
  const counts={car:0,motorcycle:0,bus:0};
  for(const c of rt.seen.values())counts[c]++;
  for(const [k,v] of Object.entries(counts))setText(`[data-count="${k}"] strong`,v);
  const tracks=[...rt.tracks.values()];
  const stopped=tracks.filter(t=>t.zone&&t.dwellSec>=STOP_LOG_SEC);
  const allDwell=[...rt.dwells,...stopped.map(t=>t.dwellSec)];
  setText('[data-kpi="stopped"]',stopped.length);
  setText('[data-kpi="dwell"]',allDwell.length?fmtSec(allDwell.reduce((a,b)=>a+b,0)/allDwell.length):'0 dtk');
  setText('[data-kpi="over"]',stopped.filter(t=>t.dwellSec>=rt.threshold).length);
  for(const z of CCTV_ZONES){
    const row=root.querySelector(`[data-zone-row="${z.id}"]`);if(!row)continue;
    const inZone=tracks.filter(t=>t.zone===z.id);
    const longest=inZone.reduce((m,t)=>Math.max(m,t.dwellSec),0);
    row.querySelector('[data-zone-count]').textContent=inZone.length;
    row.querySelector('[data-zone-dwell]').textContent=inZone.length?`terlama ${fmtSec(longest)}`:'kosong';
    row.querySelector('.cctv-zone-bar i').style.width=`${Math.min(100,inZone.length/4*100)}%`;
    row.dataset.level=longest>=rt.threshold?'over':inZone.length?'busy':'free';
  }
  const feed=root.querySelector('[data-cctv-feed]');
  if(feed){
    feed.innerHTML=rt.feed.length?rt.feed.slice(0,8).map(f=>`<li data-kind="${f.kind}"><time>${f.at}</time><span></span>${f.demo?'<em>SIM</em>':''}</li>`).join(''):'<li class="cctv-feed-empty">Belum ada kejadian.</li>';
    feed.querySelectorAll('li[data-kind] span').forEach((el,i)=>{el.textContent=rt.feed[i].text;});
  }
  setText('[data-feed-count]',`${rt.feed.filter(f=>f.kind!=='info').length} kejadian`);
  setText('[data-cctv-clock]',`${nowClock()} WIB`);
  setText('[data-sim-clock]',`Sim ${simClock()}`);
  setText('[data-cctv-fps]',`${rt.frames.length} frame/dtk`);
  const states={
    idle:['AI belum terhubung','Simulasi 3D Fatmawati siap diputar'],
    demo:['Simulasi 3D berjalan','AI virtual · simulasi lalu lintas Fatmawati'],
    paused:['Simulasi dijeda','Putar lagi untuk melanjutkan'],
    ai:['AI terhubung',rt.model?`Model: ${rt.model}`:'Menerima deteksi langsung']
  };
  const status=root.querySelector('[data-cctv-status]');
  if(status){status.dataset.state=rt.mode;setText('[data-cctv-status-label]',states[rt.mode][0]);setText('[data-cctv-status-sub]',states[rt.mode][1]);}
  setText('[data-cctv-source]',rt.mode==='ai'?'SUMBER: MODEL AI':rt.videoUrl?'VIDEO LOKAL · MENUNGGU AI':`SIMULASI 3D · ${rt.opts.scenario} · ${rt.speed}×`);
  const play=root.querySelector('[data-sim="play"]');
  if(play){const on=rt.mode==='demo';play.setAttribute('aria-pressed',String(on));play.querySelector('span').textContent=on?'Jeda':'Putar';play.disabled=rt.mode==='ai'||!!rt.videoUrl;}
  if(rt.sim){
    const m=simMetrics(rt.sim);
    const k=(key,val,level)=>{const el=root.querySelector(`[data-sim-kpi="${key}"]`);if(!el)return;const s=el.querySelector('strong');if(s.textContent!==String(val))s.textContent=val;if(level)el.dataset.level=level;};
    k('speed',Math.round(m.live.speed),m.live.speed<12?'bad':m.live.speed<22?'mid':'good');
    k('queue',Math.round(m.live.queue),m.live.queue>80?'bad':m.live.queue>30?'mid':'good');
    k('blocked',m.live.blocked,m.live.blocked>=3?'bad':m.live.blocked>=1?'mid':'good');
    k('conflict',rt.sim.t>30?Math.round(m.conflictsPerHour):'–');
  }
  const cam=CAMERA_PRESETS.find(c=>c.id===rt.preset);
  const camLabel=$('[data-cctv-camlabel]');
  if(camLabel){
    const text=rt.follow?['MENGIKUTI','kendaraan terpilih']:cam?[cam.label.toUpperCase(),cam.sub]:['BEBAS','kamera diputar'];
    if(camLabel.dataset.text!==text.join()){camLabel.dataset.text=text.join();camLabel.textContent='';const b=document.createElement('b');b.textContent=text[0];camLabel.append(b,` · ${text[1]}`);}
  }
  drawInspect();
}
function syncControls(){
  if(!rt.root)return;
  $$('[data-sim="scenario"]').forEach(b=>b.setAttribute('aria-checked',String(b.dataset.value===rt.opts.scenario)));
  $$('[data-sim="cam"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.value===rt.preset)));
  $$('[data-sim="speed"]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.value)===rt.speed)));
  $$('[data-sim="time"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.value===rt.opts.time)));
  $('[data-sim="place"]')?.setAttribute('aria-pressed',String(rt.placing));
  const vol=$('[data-sim="volume"]'),pick=$('[data-sim="pickup"]');
  if(vol){vol.value=rt.opts.volume;setText('[data-sim-out="volume"]',rt.opts.volume);}
  if(pick){pick.value=rt.opts.pickupShare;setText('[data-sim-out="pickup"]',rt.opts.pickupShare);}
  const badge=$('[data-sim-badge] .tag');if(badge)badge.textContent=`${rt.opts.scenario} · LIVE`;
  const stage=$('[data-cctv-stage]');
  if(stage){stage.dataset.labels=rt.showLabels?'on':'off';stage.classList.toggle('placing',rt.placing);stage.classList.toggle('has-video',!!rt.videoUrl);}
  $('[data-cctv="zones"]')?.setAttribute('aria-pressed',String(rt.showZones));
  $('[data-cctv="labels"]')?.setAttribute('aria-pressed',String(rt.showLabels));
  const op=$('[data-sim="opacity"]');if(op){op.value=Math.round(rt.stationOpacity*100);setText('[data-sim-out="opacity"]',Math.round(rt.stationOpacity*100));}
  renderCompare();
}

/* ======================================================= compare A0/A1/A2 */
function renderCompare(){
  const box=$('[data-sim-compare]');if(!box)return;
  if(rt.comparing){box.hidden=false;box.innerHTML='<p class="sim-compare-wait">Menghitung 10 menit simulasi untuk tiap skenario…</p>';return;}
  if(!rt.compare){box.hidden=true;return;}
  const {results,opts}=rt.compare;
  const rows=[
    ['avgSpeedKmh','Kecepatan rata-rata','km/jam',true],
    ['avgQueueM','Antrean rata-rata','m',false],
    ['delaySec','Tundaan per kendaraan','dtk',false],
    ['avgBlocked','Kendaraan berhenti di lajur','rata-rata',false],
    ['conflictsPerHour','Penumpang turun di tengah jalan','/jam',false]
  ];
  box.hidden=false;
  box.innerHTML=`<div class="sim-compare-head"><span></span>${['A0','A1','A2'].map(s=>`<b>${s}</b>`).join('')}</div>${rows.map(([key,name,unit,higher])=>{
    const vals=['A0','A1','A2'].map(s=>results[s][key]);
    const max=Math.max(...vals,1e-6),best=higher?Math.max(...vals):Math.min(...vals);
    return `<div class="sim-compare-row"><span>${name}<small>${unit}</small></span>${vals.map(v=>`<div class="${v===best?'best':''}"><i style="width:${Math.max(4,v/max*100)}%"></i><em>${v<10?v.toFixed(1):Math.round(v)}</em></div>`).join('')}</div>`;
  }).join('')}<p class="sim-compare-note">Simulasi 10 menit per skenario · ${opts.volume} kend/jam · ${opts.pickupShare}% naik-turun penumpang. Ilustratif, belum dikalibrasi dengan data lapangan Fatmawati.</p>`;
}
function runCompare(){
  if(rt.comparing)return;
  rt.comparing=true;renderCompare();
  const opts={...rt.opts},results={},order=['A0','A1','A2'];
  const next=i=>{
    if(i>=order.length){rt.comparing=false;rt.compare={results,opts};renderCompare();pushFeed('info','Perbandingan A0/A1/A2 selesai');return;}
    setTimeout(()=>{results[order[i]]=runScenario({...opts,scenario:order[i]},600,120);next(i+1);},30);
  };
  next(0);
}

/* ======================================================= main loop */
function loop(){
  cancelAnimationFrame(rt.raf);
  let last=performance.now();
  const tick=t=>{
    if(!rt.root?.isConnected){rt.raf=0;return;}
    const dt=Math.min(0.1,(t-last)/1000);last=t;
    if(rt.mode==='demo'&&rt.sim)stepSim(rt.sim,dt*rt.speed);
    stepCamera(dt);
    const canvas=$('[data-sim-canvas]');
    if(canvas&&!rt.videoUrl){
      rt.frame=renderFrame(canvas,rt.cam,rt.scene,dynScene(),{zones:rt.showZones,scenario:rt.opts.scenario,highlight:rt.selected,stationAlpha:rt.stationOpacity});
      if(rt.mode!=='ai')ingestDetections({source:'demo',detections:detectionsFromView(rt.frame)});
    }
    drawOverlay();
    if(t-rt.lastPanel>PANEL_INTERVAL){rt.lastPanel=t;drawPanels();}
    rt.raf=requestAnimationFrame(tick);
  };
  rt.raf=requestAnimationFrame(tick);
}

/* ======================================================= interaction */
function pickAt(sx,sy){
  let best=null,area=Infinity;
  for(const b of rt.lastBoxes){
    if(sx>=b.x0-4&&sx<=b.x1+4&&sy>=b.y0-4&&sy<=b.y1+4){const a=(b.x1-b.x0)*(b.y1-b.y0);if(a<area){area=a;best=b.id;}}
  }
  return best;
}
function handleClick(sx,sy){
  if(rt.placing&&rt.frame){
    const g=screenToGround(rt.frame,sx,sy);
    if(g&&g[2]>LAYOUT.southRoad.z0-1&&g[2]<LAYOUT.sidewalkS.z1){
      const id=placeStoppedVehicle(rt.sim,g[0],Math.random()<0.6?'motorcycle':'car');
      pushFeed(id?'stop':'info',id?`Ojol ditaruh berhenti di lajur kiri (x ${Math.round(g[0])} m)`:'Tidak ada ruang kosong di titik itu');
      if(id&&rt.mode!=='demo')startSim();
    }else pushFeed('info','Klik di jalan arteri sisi stasiun untuk menaruh ojol');
    drawPanels();return;
  }
  const id=pickAt(sx,sy);
  rt.selected=id;if(!id)rt.follow=false;
  drawPanels();
}
function bindStage(stage){
  const local=e=>{const r=stage.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];};
  stage.addEventListener('pointerdown',e=>{
    if(e.target.closest('button,a,input,.sim-inspect'))return;
    const [x,y]=local(e);
    rt.drag={x,y,yaw:rt.cam.yaw,pitch:rt.cam.pitch,target:[...rt.cam.target],pan:e.button===2||e.shiftKey,moved:false,id:e.pointerId};
    stage.setPointerCapture?.(e.pointerId);
  });
  stage.addEventListener('pointermove',e=>{
    const d=rt.drag;if(!d||d.id!==e.pointerId)return;
    const [x,y]=local(e),dx=x-d.x,dy=y-d.y;
    if(!d.moved&&Math.hypot(dx,dy)<5)return;
    if(!d.moved){d.moved=true;rt.camAnim=null;rt.follow=false;rt.preset='custom';syncControls();$('[data-sim-hint]')?.classList.add('gone');}
    if(d.pan){
      const k=rt.cam.dist*0.0016,c=Math.cos(rt.cam.yaw),s=Math.sin(rt.cam.yaw);
      rt.cam.target[0]=d.target[0]-(dx*c-dy*s)*k;rt.cam.target[2]=d.target[2]-(-dx*s-dy*c)*k;
    }else{
      rt.cam.yaw=d.yaw-dx*0.006;rt.cam.pitch=Math.min(1.42,Math.max(0.1,d.pitch+dy*0.004));
    }
  });
  const end=e=>{
    const d=rt.drag;if(!d||d.id!==e.pointerId)return;
    rt.drag=null;
    if(!d.moved){const [x,y]=local(e);handleClick(x,y);}
  };
  stage.addEventListener('pointerup',end);
  stage.addEventListener('pointercancel',()=>{rt.drag=null;});
  stage.addEventListener('contextmenu',e=>e.preventDefault());
  stage.addEventListener('wheel',e=>{
    e.preventDefault();rt.camAnim=null;
    rt.cam.dist=Math.min(520,Math.max(18,rt.cam.dist*Math.exp(e.deltaY*0.0012)));
    if(rt.preset!=='custom'){rt.preset='custom';syncControls();}
  },{passive:false});
  stage.addEventListener('dblclick',e=>{if(!e.target.closest('button'))applyPreset(rt.preset==='custom'?'drone':rt.preset);});
  stage.addEventListener('keydown',e=>{
    const k=e.key;let used=true;
    if(k==='ArrowLeft')rt.cam.yaw+=0.08;else if(k==='ArrowRight')rt.cam.yaw-=0.08;
    else if(k==='ArrowUp')rt.cam.pitch=Math.min(1.42,rt.cam.pitch+0.05);else if(k==='ArrowDown')rt.cam.pitch=Math.max(0.1,rt.cam.pitch-0.05);
    else if(k==='+'||k==='=')rt.cam.dist=Math.max(18,rt.cam.dist*0.9);else if(k==='-')rt.cam.dist=Math.min(520,rt.cam.dist*1.1);
    else used=false;
    if(used){e.preventDefault();rt.camAnim=null;}
  });
}
function startSim(){
  if(rt.mode==='ai'||rt.videoUrl)return;
  rt.mode='demo';rt.started=true;
  if(!rt.feed.length)pushFeed('info',`Simulasi ${rt.opts.scenario} dimulai · ${TIME_PRESETS[rt.opts.time]?.label||''}`);
}
function rebuild(msg){
  newSim();
  if(msg)pushFeed('info',msg);
}
function onAction(el){
  const a=el.dataset.sim||el.dataset.cctv,v=el.dataset.value;
  if(a==='play'){if(rt.mode==='demo')rt.mode='paused';else startSim();}
  else if(a==='scenario'&&SCENARIOS[v]){rt.opts.scenario=v;rebuild(`Skenario diganti ke ${SCENARIOS[v].label}`);startSim();}
  else if(a==='cam')applyPreset(v);
  else if(a==='speed')rt.speed=Number(v)||1;
  else if(a==='time'&&TIME_PRESETS[v]){const p=TIME_PRESETS[v];rt.opts={...rt.opts,time:v,volume:p.volume,pickupShare:p.pickupShare};rebuild(`Waktu: ${p.label} · ${p.volume} kend/jam`);startSim();}
  else if(a==='place'){rt.placing=!rt.placing;if(rt.placing)pushFeed('info','Mode taruh ojol: klik di lajur kiri jalan arteri');}
  else if(a==='compare')runCompare();
  else if(a==='follow'){rt.follow=!rt.follow;if(rt.follow)rt.camAnim=null;}
  else if(a==='unselect'){rt.selected=null;rt.follow=false;}
  else if(a==='zones')rt.showZones=!rt.showZones;
  else if(a==='labels')rt.showLabels=!rt.showLabels;
  else if(a==='reset'){
    if(rt.videoUrl){URL.revokeObjectURL(rt.videoUrl);rt.videoUrl=null;attachVideo();}
    if(rt.mode==='ai')rt.mode='paused';
    rebuild('Simulasi diulang dari awal');startSim();
  }
  syncControls();drawPanels();
}

/* ======================================================= lifecycle */
function attachVideo(){
  const video=$('[data-cctv-video]');if(!video)return;
  if(!rt.videoUrl){video.hidden=true;video.removeAttribute('src');return;}
  video.src=rt.videoUrl;video.hidden=false;
  video.addEventListener('loadedmetadata',()=>{try{video.currentTime=rt.videoTime||0;}catch{}video.play().catch(()=>{});},{once:true});
  video.addEventListener('timeupdate',()=>{rt.videoTime=video.currentTime;});
}

/** Called by app.js after the CCTV page renders (re-renders keep the running simulation). */
export function activateCctv(root,{threshold=60}={}){
  if(!root)return;
  rt.root=root;rt.threshold=threshold;
  ensureWorld();
  root.addEventListener('click',e=>{
    const el=e.target.closest('[data-sim],[data-cctv]');
    if(!el||el.tagName==='INPUT')return;
    onAction(el);
  });
  root.addEventListener('input',e=>{
    const el=e.target;
    if(el.dataset.sim==='volume')setText('[data-sim-out="volume"]',el.value);
    if(el.dataset.sim==='pickup')setText('[data-sim-out="pickup"]',el.value);
    if(el.dataset.sim==='opacity'){rt.stationOpacity=Math.min(1,Math.max(0.1,Number(el.value)/100));setText('[data-sim-out="opacity"]',el.value);}
  });
  root.addEventListener('change',e=>{
    const el=e.target;
    if(el.dataset.sim==='volume'){rt.opts.volume=Number(el.value);rebuild(`Volume diubah ke ${el.value} kend/jam`);startSim();}
    else if(el.dataset.sim==='pickup'){rt.opts.pickupShare=Number(el.value);rebuild(`Naik-turun penumpang diubah ke ${el.value}%`);startSim();}
    else if(el.dataset.cctv==='file'){
      const file=el.files?.[0];if(!file||!file.type.startsWith('video/'))return;
      if(rt.videoUrl)URL.revokeObjectURL(rt.videoUrl);
      rt.videoUrl=URL.createObjectURL(file);rt.videoTime=0;
      if(rt.mode==='demo')rt.mode='paused';
      resetDetections();pushFeed('info',`Video lokal dimuat: ${file.name.slice(0,48)}. Tekan Ulang untuk kembali ke 3D.`);
      attachVideo();
    }
    syncControls();drawPanels();
  });
  bindViewerFullscreen(root.querySelector('[data-viewer]'));
  const stage=root.querySelector('[data-cctv-stage]');if(stage)bindStage(stage);
  setTimeout(()=>root.querySelector('[data-sim-hint]')?.classList.add('gone'),9000);
  attachVideo();
  if(rt.resume&&rt.mode==='paused')rt.mode='demo';
  rt.resume=false;
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if(rt.mode==='idle'&&!rt.started&&(!reduced||new URLSearchParams(location.search).get('demo')==='1'))startSim();
  syncControls();drawPanels();
  loop();
}
export function deactivateCctv(){
  rt.resume=rt.mode==='demo';
  if(rt.mode==='demo')rt.mode='paused';
  cancelAnimationFrame(rt.raf);rt.raf=0;rt.root=null;rt.drag=null;
}

if(typeof window!=='undefined'){
  window.SIMPUL_CCTV=Object.freeze({push:ingestDetections,reset:()=>{resetDetections();}});
  window.addEventListener('simpul:detections',e=>ingestDetections(e.detail));
}
