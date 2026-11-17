/**
 * Live 3D preview on Beranda: the same Fatmawati scene and traffic simulation
 * as the CCTV AI page, with a slowly orbiting aerial camera and a small A0/A1/A2
 * switch. Presentation only; never touches the store. Pauses off-screen.
 */
import {getFatmawatiScene,buildDynamicScene} from './sim3d-scene.js';
import {createSim,stepSim,resetStats,simMetrics,SCENARIOS} from './traffic-sim.js';
import {createCamera,renderFrame} from './sim3d-engine.js';

const hs={raf:0,root:null,sim:null,cam:null,scenario:'A0',visible:true,observer:null,lastKpi:0};

function newHomeSim(){
  hs.sim=createSim({scenario:hs.scenario,volume:2100,pickupShare:18,seed:11});
  for(let i=0;i<200;i++)stepSim(hs.sim,0.5);
  resetStats(hs.sim);
}
function syncHome(){
  hs.root?.querySelectorAll('[data-home-scenario]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.homeScenario===hs.scenario)));
  const cap=hs.root?.querySelector('[data-home-caption]');
  if(cap)cap.textContent=SCENARIOS[hs.scenario].short;
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
  root.querySelectorAll('[data-home-scenario]').forEach(b=>b.addEventListener('click',e=>{
    e.stopPropagation();
    const id=b.dataset.homeScenario;
    if(!SCENARIOS[id]||id===hs.scenario)return;
    hs.scenario=id;newHomeSim();syncHome();drawKpis();
  }));
  syncHome();
  hs.observer?.disconnect();
  if('IntersectionObserver' in window){
    hs.observer=new IntersectionObserver(entries=>{hs.visible=entries.some(e=>e.isIntersecting);},{threshold:0.05});
    hs.observer.observe(canvas);
  }
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  cancelAnimationFrame(hs.raf);
  let last=performance.now();
  const tick=t=>{
    if(!canvas.isConnected){hs.raf=0;hs.observer?.disconnect();return;}
    const dt=Math.min(0.1,(t-last)/1000);last=t;
    if(hs.visible&&!document.hidden){
      if(!reduced){stepSim(hs.sim,dt);hs.cam.yaw+=dt*0.035;}
      renderFrame(canvas,hs.cam,getFatmawatiScene(),buildDynamicScene(hs.sim),{zones:true,scenario:hs.scenario,labels:false,stationAlpha:0.4});
      if(t-hs.lastKpi>500){hs.lastKpi=t;drawKpis();}
    }
    hs.raf=reduced?0:requestAnimationFrame(tick);
  };
  hs.raf=requestAnimationFrame(tick);
}
export function deactivateHomeSim(){
  cancelAnimationFrame(hs.raf);hs.raf=0;hs.observer?.disconnect();hs.root=null;
}
