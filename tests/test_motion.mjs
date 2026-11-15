import assert from 'node:assert/strict';
import {
  MOTION_TIMING, enterPage, toggleAccordion, showToast, showModal,
  closeMobileDrawer, stopMotion
} from '../js/motion.js';

assert.ok(MOTION_TIMING.page > 250 && MOTION_TIMING.page < 1000);
const calls=[];
const done=Promise.resolve();
const fakeEl=(height=75)=>({
  hidden:false, scrollHeight:height, isConnected:true,
  style:{values:{}, removeProperty(k){delete this.values[k]}},
  animate(frames,opts){calls.push({frames,opts});return {finished:done,cancel(){}};},
  querySelector(){return null},querySelectorAll(){return[]},closest(){return null}
});
const mql={matches:false};
globalThis.window={matchMedia:()=>mql};
// Native Web Animations is the no-network fallback if no gsap is present.
const main=fakeEl();const heading=fakeEl();const card=fakeEl();
main.querySelector=()=>heading; main.querySelectorAll=()=>[card];
enterPage(main);
assert.equal(calls.length,2);
assert.ok(calls.every(v=>v.opts.easing && v.opts.duration >= 200));
stopMotion();
// Accordion closes only after its animation; no hidden menu while animating.
const p=fakeEl(90);
toggleAccordion(p,false);
assert.equal(p.hidden,false);
await done;await done;
assert.equal(p.hidden,true);
toggleAccordion(p,true);
await done;await done;
assert.equal(p.hidden,false);
showToast(fakeEl());showModal(fakeEl());
const beforeReduced=calls.length;
// Reduced motion must bypass every imperative animation.
mql.matches=true;
enterPage(main);
showToast(fakeEl());
toggleAccordion(p,false);
assert.equal(p.hidden,true);
assert.equal(calls.length,beforeReduced);
let closeDone=false;closeMobileDrawer(fakeEl(),null,()=>{closeDone=true});
assert.ok(closeDone,'Closing mobile drawer must not get stuck in reduced motion');
stopMotion();
// Optional GSAP integration uses a scoped context when supplied by host.
mql.matches=false;
let fromToCalls=0;let reverted=0;
window.gsap={
  context(cb){cb();return{revert(){reverted++}}},
  fromTo(){fromToCalls++;return {kill(){}}},
  to(){return {kill(){}}}
};
enterPage(main);
assert.ok(fromToCalls>=2);
stopMotion();assert.equal(reverted,1);
console.log('PASS motion: offline WAAPI, accordion, reduced motion, cancellation, optional GSAP scoped animation');
