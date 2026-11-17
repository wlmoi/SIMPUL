/** Temporary viewer controls. Never read or write observation/application state. */
import {getLanguage} from './i18n.js';
const viewerClamp=(value,min,max)=>Math.min(max,Math.max(min,value));
export function orbitCamera(camera,dx,dy){camera.yaw-=dx*0.006;camera.pitch=viewerClamp(camera.pitch+dy*0.004,0.1,1.42);}
export function zoomCamera(camera,factor){if(Number.isFinite(factor)&&factor>0)camera.dist=viewerClamp(camera.dist*factor,25,520);}
export function panCamera(camera,dx,dy){
 const k=camera.dist*0.0016,c=Math.cos(camera.yaw),s=Math.sin(camera.yaw);
 camera.target[0]=viewerClamp(camera.target[0]-(dx*c-dy*s)*k,-350,350);
 camera.target[2]=viewerClamp(camera.target[2]-(-dx*s-dy*c)*k,-140,140);
}
function syncFullscreen(panel){
 const active=document.fullscreenElement===panel||panel.classList.contains('viewer-fullscreen-fallback');
 panel.querySelectorAll('[data-action="viewer-fullscreen"]').forEach(button=>{
  button.setAttribute('aria-pressed',String(active));
  const label=button.querySelector('[data-fullscreen-label]');
  if(label)label.textContent=getLanguage()==='en'?(active?'Exit full screen':'Full screen'):(active?'Keluar layar penuh':'Layar penuh');
 });
 panel.dispatchEvent(new Event('viewer-resize'));
}
function fallbackFullscreen(panel,on){
 panel.classList.toggle('viewer-fullscreen-fallback',on);syncFullscreen(panel);
 if(on)panel.focus({preventScroll:true});
}
export function bindViewerFullscreen(panel){
 if(!panel||panel.dataset.fullscreenBound)return;
 panel.dataset.fullscreenBound='true';
 panel.addEventListener('fullscreenchange',()=>syncFullscreen(panel));
 panel.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel.classList.contains('viewer-fullscreen-fallback')){event.preventDefault();fallbackFullscreen(panel,false);}});
}
export function toggleViewerFullscreen(panel){
 if(!panel)return;
 if(document.fullscreenElement===panel||panel.classList.contains('viewer-fullscreen-fallback')){exitViewerFullscreen(panel);return;}
 if(document.fullscreenEnabled&&panel.requestFullscreen){panel.requestFullscreen().catch(()=>fallbackFullscreen(panel,true));}
 else fallbackFullscreen(panel,true);
}
export function exitViewerFullscreen(panel){
 if(!panel)return;
 if(document.fullscreenElement===panel)document.exitFullscreen().catch(()=>{});
 if(panel.classList.contains('viewer-fullscreen-fallback'))fallbackFullscreen(panel,false);
}

export function bindFreeCamera(stage,camera,onManual,onDraw){
 const pointers=new Map();
 const start=()=>{onManual();stage.focus({preventScroll:true});};
 stage.addEventListener('pointerdown',event=>{
  if(event.target.closest('button,a,input'))return;
  pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});stage.setPointerCapture?.(event.pointerId);start();
 });
 stage.addEventListener('pointermove',event=>{
  const old=pointers.get(event.pointerId);if(!old)return;
  const next={x:event.clientX,y:event.clientY},other=[...pointers.entries()].find(([id])=>id!==event.pointerId)?.[1];
  if(other){
   const before=Math.hypot(old.x-other.x,old.y-other.y),after=Math.hypot(next.x-other.x,next.y-other.y);
   if(after>2)zoomCamera(camera,before/after);
   panCamera(camera,(next.x-old.x)/2,(next.y-old.y)/2);
  }else if(event.shiftKey||(event.buttons&2))panCamera(camera,next.x-old.x,next.y-old.y);
  else orbitCamera(camera,next.x-old.x,next.y-old.y);
  pointers.set(event.pointerId,next);onDraw();
 });
 const end=event=>pointers.delete(event.pointerId);
 stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);stage.addEventListener('lostpointercapture',end);
 stage.addEventListener('contextmenu',event=>event.preventDefault());
 stage.addEventListener('wheel',event=>{event.preventDefault();start();zoomCamera(camera,Math.exp(event.deltaY*0.0012));onDraw();},{passive:false});
 stage.addEventListener('keydown',event=>{
  if(event.target.closest('button,a,input'))return;
  const keys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'];if(!keys.includes(event.key))return;
  event.preventDefault();start();
  if(event.key==='+'||event.key==='=')zoomCamera(camera,0.9);
  else if(event.key==='-')zoomCamera(camera,1.1);
  else {const dx=event.key==='ArrowLeft'?-16:event.key==='ArrowRight'?16:0,dy=event.key==='ArrowUp'?-12:event.key==='ArrowDown'?12:0;if(event.shiftKey)panCamera(camera,dx,dy);else orbitCamera(camera,dx,dy);}
  onDraw();
 });
}
