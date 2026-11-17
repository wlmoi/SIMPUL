/**
 * Live 3D preview on Beranda: the same Fatmawati scene and traffic simulation
 * as the CCTV AI page, with a guided problem-to-evaluation story.
 * The guided camera flies close to each process and follows the vehicle it explains.
 * Presentation only; never touches the store. Pauses when the panel is off-screen.
 */
import {getFatmawatiScene,buildDynamicScene} from './sim3d-scene.js';
import {createSim,stepSim,resetStats,simMetrics,runScenario} from './traffic-sim.js';
import {createCamera,renderFrame} from './sim3d-engine.js';
import {DEMO_STAGES,DEMO_SECONDS,DEMO_INPUTS,initialDemo,selectDemo,playDemo,advanceDemo} from './demo-story.js';
import {getLanguage} from './i18n.js';
import {bindViewerFullscreen,bindFreeCamera,exitViewerFullscreen,zoomCamera} from './viewer-controls.js';

const hs={raf:0,root:null,sim:null,cam:null,scenario:'A0',visible:true,observer:null,lastKpi:0,story:initialDemo(),dirty:true,comparison:null,
  focusId:null,zoom:1,frozen:false,clock:0};
const words=pair=>pair[getLanguage()==='en'?1:0];
const homeText=(selector,value)=>{const el=hs.root?.querySelector(selector);if(el)el.textContent=value;};
const homeClamp=(v,a,b)=>Math.min(b,Math.max(a,v));

/** Which vehicles a chapter explains: kerb stops, the slow queue behind them, or the A1 bay. */
function focusCandidates(mode){
  const list=hs.sim?.vehicles||[];
  if(mode==='stopped')return list.filter(v=>v.road==='S'&&v.state==='stopped');
  if(mode==='queued')return list.filter(v=>v.road==='S'&&v.v<2.5&&v.state!=='stopped');
  if(mode==='bay')return list.filter(v=>v.state==='bayStop'||v.state==='bay');
  return [];
}
function pickFocus(stage){
  if(!stage.follow){hs.focusId=null;return null;}
  const pool=focusCandidates(stage.follow);
  const kept=pool.find(v=>v.id===hs.focusId);
  if(kept)return kept;
  // Hysteresis for the queue: keep following a vehicle while it is still crawling.
  if(stage.follow==='queued'){const crawl=hs.sim.vehicles.find(v=>v.id===hs.focusId&&v.v<5);if(crawl)return crawl;}
  if(!pool.length){hs.focusId=null;return null;}
  const ref=hs.cam.target[0];
  pool.sort((a,b)=>Math.abs(a.x-ref)-Math.abs(b.x-ref));
  hs.focusId=pool[0].id;return pool[0];
}
function desiredCamera(stage,focus){
  const sway=hs.story.playing?Math.sin(hs.clock*0.18)*0.16:0;
  const target=focus?[focus.x+4,2,focus.z]:[...stage.target];
  return {target,yaw:stage.yaw+sway,pitch:stage.pitch,dist:homeClamp(stage.dist*hs.zoom,25,320)};
}
function snapCamera(stage){Object.assign(hs.cam,desiredCamera(stage,null));}
function flyCamera(stage,focus,dt){
  const want=desiredCamera(stage,focus),k=1-Math.exp(-dt*2.2);
  for(let i=0;i<3;i++)hs.cam.target[i]+=(want.target[i]-hs.cam.target[i])*k;
  hs.cam.yaw+=(want.yaw-hs.cam.yaw)*k;hs.cam.pitch+=(want.pitch-hs.cam.pitch)*k;hs.cam.dist+=(want.dist-hs.cam.dist)*k;
}

function newHomeSim(warmup=100){
  hs.sim=createSim({...DEMO_INPUTS,scenario:hs.scenario});
  for(let t=0;t<warmup;t+=0.5)stepSim(hs.sim,0.5);
  resetStats(hs.sim);hs.focusId=null;
}
function applyStory(){
 hs.root.dataset.cameraFree='false';
 const stage=DEMO_STAGES[hs.story.index];hs.scenario=stage.scenario;
 newHomeSim(stage.warmup);
 hs.dirty=true;syncHome();drawKpis();
}
function drawProgress(){
 const progress=hs.root?.querySelector('[data-demo-progress]');
 if(!progress)return;
 const percent=(hs.story.index+hs.story.elapsed/DEMO_SECONDS)/DEMO_STAGES.length*100;
 progress.style.setProperty('--demo-progress',`${percent}%`);progress.setAttribute('aria-valuenow',String(Math.round(percent)));
}
function syncHome(){
  drawProgress();
  const story=hs.story,stage=DEMO_STAGES[story.index];
  hs.root?.querySelectorAll('[data-home-scenario]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.homeScenario===hs.scenario)));
  const cap=hs.root?.querySelector('[data-home-caption]');
  if(cap)cap.textContent=stage.scenario+' · '+words(stage.label);
  hs.root?.querySelectorAll('[data-demo-play-label]').forEach(el=>{el.textContent=story.complete?words(['Ulangi demo lengkap','Replay full demo']):story.playing?words(['Jeda demo','Pause demo']):story.started?words(['Lanjutkan demo','Resume demo']):words(['Putar demo lengkap','Play full demo']);});
  hs.root?.querySelectorAll('[data-action="home-demo-play"]').forEach(el=>el.setAttribute('aria-pressed',String(story.playing)));
  hs.root?.querySelectorAll('[data-action="home-demo-step"]').forEach(el=>{el.setAttribute('aria-pressed',String(Number(el.dataset.index)===story.index));});
  homeText('[data-demo-count]',`${String(story.index+1).padStart(2,'0')} / 06 · ${stage.scenario}`);
  homeText('[data-demo-title]',words(stage.title));homeText('[data-demo-text]',words(stage.text));
  homeText('[data-demo-focus]',words(stage.focus));homeText('[data-demo-question]',words(stage.question));
  homeText('[data-demo-status]',story.complete?words(['Demo selesai · tinjauan manusia tetap diperlukan','Demo complete · human review still required']):story.playing?words(['Sedang diputar · kamera mengikuti prosesnya','Playing · the camera follows each process']):words(['Lalu lintas tetap berjalan · seret untuk memutar, +/− untuk zoom','Traffic keeps running · drag to orbit, +/− to zoom']));
  const curtain=hs.root?.querySelector('[data-demo-curtain]');if(curtain)curtain.hidden=story.started;
  const previous=hs.root?.querySelector('[data-action="home-demo-prev"]');if(previous)previous.disabled=story.index===0;
  const next=hs.root?.querySelector('[data-action="home-demo-next"]');if(next)next.disabled=story.index===DEMO_STAGES.length-1;
  const summary=hs.root?.querySelector('[data-demo-summary]');
  if(summary){
   summary.hidden=story.index!==DEMO_STAGES.length-1;
   if(!summary.hidden){
    if(!hs.comparison)hs.comparison=['A0','A1','A2'].map(scenario=>runScenario({...DEMO_INPUTS,scenario},300,90));
    summary.querySelectorAll('[data-demo-result]').forEach(el=>{
     const result=hs.comparison[['A0','A1','A2'].indexOf(el.dataset.demoResult)];
     el.querySelector('[data-result-speed]').textContent=result.avgSpeedKmh.toFixed(1);
     el.querySelector('[data-result-queue]').textContent=result.avgQueueM.toFixed(1);
    });
   }
  }
}

/** Called only by app.js DOM actions; all state here is temporary presentation. */
export function controlHomeDemo(action,value){
 if(!hs.root||!hs.cam)return;
 const before=hs.story;
 if(action==='expand'){hs.root.classList.add('demo-expanded');hs.dirty=true;return;}
 if(action==='zoom-in'||action==='zoom-out'){
  const f=action==='zoom-in'?0.75:1.33;
  if(hs.root.dataset.cameraFree==='true')zoomCamera(hs.cam,f);else hs.zoom=homeClamp(hs.zoom*f,0.55,3);
  hs.dirty=true;return;
 }
 if(action==='camera-reset'){
  hs.zoom=1;hs.frozen=false;hs.root.dataset.cameraFree='false';hs.dirty=true;syncHome();return;
 }
 if(action==='play')hs.story=playDemo(before);
 else if(action==='replay')hs.story=playDemo(initialDemo());
 else if(action==='step')hs.story=selectDemo(before,Number(value));
 else if(action==='next'||action==='prev')hs.story=selectDemo(before,before.index+(action==='next'?1:-1));
 else if(action==='close'){hs.story={...before,playing:false};exitViewerFullscreen(hs.root.querySelector('[data-viewer]'));hs.root.classList.remove('demo-expanded');syncHome();hs.dirty=true;return;}
 else return;
 // An explicit pause freezes traffic; choosing a chapter keeps it moving so it can be explored.
 hs.frozen=action==='play'&&before.started&&!before.complete&&!hs.story.playing;
 hs.root.classList.add('demo-expanded');
 hs.root.dataset.demoComplete='false';
 if(!before.started||before.index!==hs.story.index||before.complete||action==='replay')applyStory();else syncHome();
 hs.dirty=true;
 if(action==='play'&&!before.started){
  const panel=hs.root.querySelector('.mc-preview');panel?.scrollIntoView({behavior:'instant',block:'start'});panel?.focus({preventScroll:true});
 }
}
function drawKpis(){
  const m=simMetrics(hs.sim).live;
  const set=(k,v,level)=>{const el=hs.root?.querySelector(`[data-home-kpi="${k}"]`);if(!el)return;el.querySelector('b').textContent=v;el.dataset.level=level;};
  set('speed',`${Math.round(m.speed)} km/jam`,m.speed<12?'bad':m.speed<22?'mid':'good');
  set('queue',`${Math.round(m.queue)} m`,m.queue>80?'bad':m.queue>30?'mid':'good');
  set('blocked',`${m.blocked}`,m.blocked>=3?'bad':m.blocked>=1?'mid':'good');
}
function focusLabel(stage,focus){
  const base=words(stage.label);
  if(!focus)return base;
  if(focus.state==='stopped'||focus.state==='bayStop')return `${base} · ${words(['berhenti','stopped'])} ${Math.round(focus.dwellAcc)} ${words(['dtk','s'])}`;
  return `${base} · ${Math.round(focus.v*3.6)} km/${words(['jam','h'])}`;
}

export function activateHomeSim(root){
  const canvas=root?.querySelector('[data-home-canvas]');
  if(!canvas)return;
  hs.root=root;
  if(!hs.sim)newHomeSim();
  if(!hs.cam)hs.cam=createCamera();
  hs.story=initialDemo();hs.root.dataset.demoComplete='false';hs.scenario='A0';hs.zoom=1;hs.frozen=false;
  snapCamera(DEMO_STAGES[0]);applyStory();
  const panel=root.querySelector('[data-viewer]');bindViewerFullscreen(panel);
  panel.addEventListener('viewer-resize',()=>{hs.dirty=true;});
  bindFreeCamera(root.querySelector('[data-home-camera]'),hs.cam,()=>{
   hs.story={...hs.story,started:true,playing:false};root.dataset.cameraFree='true';syncHome();
   homeText('[data-demo-status]',words(['Kamera bebas · narasi dijeda. Seret untuk memutar, cubit/gulir untuk zoom. Reset kamera untuk kembali mengikuti.','Free camera · story paused. Drag to orbit, pinch/scroll to zoom. Reset camera to follow again.']));
  },()=>{hs.dirty=true;});
  syncHome();
  hs.observer?.disconnect();
  if('IntersectionObserver' in window){
    hs.observer=new IntersectionObserver(entries=>{hs.visible=entries.some(e=>e.isIntersecting);hs.dirty=true;},{threshold:0.01});
    hs.observer.observe(root.querySelector('.mc-preview'));
  }
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  cancelAnimationFrame(hs.raf);
  let last=performance.now();
  const tick=t=>{
    if(!canvas.isConnected){hs.raf=0;hs.observer?.disconnect();return;}
    const dt=Math.min(0.1,(t-last)/1000);last=t;
    if(hs.visible&&!document.hidden){
      const previous=hs.story.index;
      hs.story=advanceDemo(hs.story,dt);
      if(previous!==hs.story.index)applyStory();
      else if(hs.story.complete&&hs.story.playing===false&&hs.root.dataset.demoComplete!=='true'){hs.root.dataset.demoComplete='true';syncHome();}
      const live=!reduced&&hs.story.started&&!hs.frozen;
      if(live){stepSim(hs.sim,dt);hs.clock+=dt;}
      const stage=DEMO_STAGES[hs.story.index];
      const free=hs.root.dataset.cameraFree==='true';
      const focus=pickFocus(stage);
      if(!free){flyCamera(stage,focus,reduced?1:dt);}
      if(hs.dirty||live||(!free&&hs.story.started)){
       const dynamic=buildDynamicScene(hs.sim);
       const queuedView=stage.follow==='queued';
       const byId=new Map(hs.sim.vehicles.map(x=>[x.id,x]));
       for(const box of dynamic.boxes){
        const v=box.ref&&byId.get(box.ref);
        if(!v||v.road!=='S')continue;
        if(v.state==='stopped')box.color='#f86809';else if(queuedView&&v.v<2.5)box.color='#e44553';
        if(focus&&v.id===focus.id)box.color='#ffd23f';
       }
       const point=focus?[focus.x,3.2,focus.z]:stage.target;
       dynamic.labels=[{p:[...point],text:focusLabel(stage,focus),bg:'rgba(4,37,115,.95)'}];
       if(focus){
        const pulse=0.3+0.25*Math.abs(Math.sin(hs.clock*3));
        dynamic.ground.push({pts:[[focus.x-4.5,focus.z-1.9],[focus.x+4.5,focus.z-1.9],[focus.x+4.5,focus.z+1.9],[focus.x-4.5,focus.z+1.9]],y:0.09,color:'#f86809',alpha:pulse,noFog:true});
       }
       const scene={...getFatmawatiScene(),labels:[]};
       renderFrame(canvas,hs.cam,scene,dynamic,{zones:true,scenario:hs.scenario,labels:true,stationAlpha:0.18});hs.dirty=false;
      }
      if(t-hs.lastKpi>250){
       hs.lastKpi=t;drawKpis();
       drawProgress();
      }
    }
    hs.raf=requestAnimationFrame(tick);
  };
  hs.raf=requestAnimationFrame(tick);
}
export function deactivateHomeSim(){
  cancelAnimationFrame(hs.raf);hs.raf=0;hs.observer?.disconnect();hs.root=null;
}
