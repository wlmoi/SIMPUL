/**
 * Live 3D preview on Beranda: the same Fatmawati scene and traffic simulation
 * as the CCTV AI page, with a guided problem-to-evaluation story.
 * Presentation only; never touches the store. Pauses when the panel is off-screen.
 */
import {getFatmawatiScene,buildDynamicScene} from './sim3d-scene.js';
import {createSim,stepSim,resetStats,simMetrics,runScenario} from './traffic-sim.js';
import {createCamera,renderFrame} from './sim3d-engine.js';
import {DEMO_STAGES,DEMO_SECONDS,DEMO_INPUTS,initialDemo,selectDemo,playDemo,advanceDemo} from './demo-story.js';
import {getLanguage} from './i18n.js';
import {bindViewerFullscreen,bindFreeCamera,exitViewerFullscreen} from './viewer-controls.js';

const hs={raf:0,root:null,sim:null,cam:null,scenario:'A0',visible:true,observer:null,lastKpi:0,story:initialDemo(),dirty:true,comparison:null};
const words=pair=>pair[getLanguage()==='en'?1:0];
const homeText=(selector,value)=>{const el=hs.root?.querySelector(selector);if(el)el.textContent=value;};

function newHomeSim(warmup=100){
  hs.sim=createSim({...DEMO_INPUTS,scenario:hs.scenario});
  for(let t=0;t<warmup;t+=0.5)stepSim(hs.sim,0.5);
  resetStats(hs.sim);
}
function applyStory(){
 hs.root.dataset.cameraFree='false';
 const stage=DEMO_STAGES[hs.story.index];hs.scenario=stage.scenario;
 newHomeSim(stage.warmup);
 Object.assign(hs.cam,{target:[...stage.target],yaw:-0.85,pitch:0.48,dist:stage.dist});
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
  homeText('[data-demo-status]',story.complete?words(['Demo selesai · tinjauan manusia tetap diperlukan','Demo complete · human review still required']):story.playing?words(['Sedang diputar · otomatis berpindah bab','Playing · chapters advance automatically']):words(['Pilih Play atau klik bab untuk mengeksplorasi','Press Play or select a chapter to explore']));
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
 if(action==='camera-reset'){
  const stage=DEMO_STAGES[before.index];Object.assign(hs.cam,{target:[...stage.target],yaw:-0.85,pitch:0.48,dist:stage.dist});
  hs.root.dataset.cameraFree='false';hs.dirty=true;syncHome();return;
 }
 if(action==='play')hs.story=playDemo(before);
 else if(action==='replay')hs.story=playDemo(initialDemo());
 else if(action==='step')hs.story=selectDemo(before,Number(value));
 else if(action==='next'||action==='prev')hs.story=selectDemo(before,before.index+(action==='next'?1:-1));
 else if(action==='close'){hs.story={...before,playing:false};exitViewerFullscreen(hs.root.querySelector('[data-viewer]'));hs.root.classList.remove('demo-expanded');syncHome();hs.dirty=true;return;}
 else return;
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

export function activateHomeSim(root){
  const canvas=root?.querySelector('[data-home-canvas]');
  if(!canvas)return;
  hs.root=root;
  if(!hs.sim)newHomeSim();
  if(!hs.cam){hs.cam=createCamera();Object.assign(hs.cam,{target:[0,10,4],yaw:-0.85,pitch:0.36,dist:195});}
  hs.story=initialDemo();hs.root.dataset.demoComplete='false';hs.scenario='A0';applyStory();
  const panel=root.querySelector('[data-viewer]');bindViewerFullscreen(panel);
  panel.addEventListener('viewer-resize',()=>{hs.dirty=true;});
  bindFreeCamera(root.querySelector('[data-home-camera]'),hs.cam,()=>{
   hs.story={...hs.story,started:true,playing:false};root.dataset.cameraFree='true';syncHome();
   homeText('[data-demo-status]',words(['Kamera bebas · narasi dijeda. Seret untuk memutar, cubit/gulir untuk zoom.','Free camera · story paused. Drag to orbit, pinch/scroll to zoom.']));
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
      if(!reduced&&hs.story.playing)stepSim(hs.sim,dt);
      if(hs.dirty||(!reduced&&hs.story.playing)){
       const dynamic=buildDynamicScene(hs.sim);
       const stopped=new Set(hs.sim.vehicles.filter(v=>v.road==='S'&&v.state==='stopped').map(v=>v.id));
       const queued=new Set(hs.sim.vehicles.filter(v=>v.road==='S'&&v.v<2&&v.state!=='stopped').map(v=>v.id));
       for(const box of dynamic.boxes){if(stopped.has(box.ref))box.color='#f86809';else if(hs.story.index===2&&queued.has(box.ref))box.color='#e44553';}
       const candidates=hs.sim.vehicles.filter(v=>hs.story.index===2?queued.has(v.id):stopped.has(v.id));
       candidates.sort((a,b)=>Math.abs(a.x-hs.cam.target[0])-Math.abs(b.x-hs.cam.target[0]));
       const focus=hs.story.index<3?candidates[0]:null;
       const point=focus?[focus.x,3,focus.z]:DEMO_STAGES[hs.story.index].target;
       dynamic.labels=[{p:[...point],text:words(DEMO_STAGES[hs.story.index].label),bg:'rgba(4,37,115,.95)'}];
       if(focus)dynamic.ground.push({pts:[[focus.x-6,focus.z-2],[focus.x+6,focus.z-2],[focus.x+6,focus.z+2],[focus.x-6,focus.z+2]],y:0.09,color:'#f86809',alpha:0.45,noFog:true});
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
