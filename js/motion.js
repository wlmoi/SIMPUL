/**
 * SIMPUL motion layer (presentation only).
 *
 * Uses GSAP 3 when an optional self-hosted runtime is present,
 * otherwise uses the standard Web Animations API. Neither is required for
 * navigation or data operations to work. Motion cannot change application data.
 *
 * Accessibility: `prefers-reduced-motion: reduce` disables movement. Tests may
 * inject a mock GSAP object without importing UI modules or network libraries.
 */
export const MOTION_TIMING = Object.freeze({ page: 510, cards: 440, menu: 290, modal: 250, toast: 260 });
let activeAnimations = new Set();
let routeContext = null;

function canMove() {
  return typeof window !== 'undefined' &&
    !(typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}
function engine() {
  return typeof window !== 'undefined' && window.gsap && typeof window.gsap.fromTo === 'function' ? window.gsap : null;
}
function watch(animation) {
  if (!animation) return;
  activeAnimations.add(animation);
  const tidy = () => activeAnimations.delete(animation);
  if (animation.finished && typeof animation.finished.then === 'function') animation.finished.then(tidy, tidy);
  else animation.onfinish = tidy;
}
function animate(el, frames, opts = {}) {
  if (!el || !canMove() || typeof el.animate !== 'function') return null;
  const anim = el.animate(frames, { duration: opts.duration || 350, delay: opts.delay || 0,
    easing: opts.easing || 'cubic-bezier(.18,.72,.2,1)', fill: opts.fill || 'backwards' });
  watch(anim);
  return anim;
}
export function stopMotion() {
  if (routeContext?.revert) routeContext.revert();
  routeContext = null;
  for (const anim of activeAnimations) { try { anim.cancel(); } catch {} }
  activeAnimations = new Set();
}

/** Animate only after a navigation transition, not after each data update. */
export function enterPage(main, { initial = false } = {}) {
  if (!main || !canMove()) return;
  stopMotion();
  const heading = main.querySelector('.main-head, .hero, .dia-hero, .eval-hero, .pilot-hero, .monitor-hero, .intel-hero, .scope-hero, .ctx-hero, .revenue-hero');
  const cards = [...main.querySelectorAll('.cards > .card, .dia-stat, .pilot-stats > div, .monitor-kpi, .scope-stage, .card, .pilot-case, .intel-item')]
    .filter((node, i, arr) => arr.indexOf(node) === i && !node.closest('[hidden]')).slice(0, 15);
  const gsap = engine();
  if (gsap) {
    // GSAP context scopes cleanup to the current routed page.
    routeContext = gsap.context(() => {
      if (heading) gsap.fromTo(heading, { opacity: 0, y: initial ? 12 : 16 },
        { opacity: 1, y: 0, duration: .46, ease: 'power3.out', clearProps: 'opacity,transform' });
      if (cards.length) gsap.fromTo(cards, { opacity: 0, y: 13 },
        { opacity: 1, y: 0, duration: .45, delay: .085, stagger: .038,
          ease: 'power2.out', clearProps: 'opacity,transform' });
    }, main);
    return;
  }
  if (heading) animate(heading, [{opacity: 0, transform: 'translate3d(0,14px,0)'},
    {opacity: 1, transform: 'translate3d(0,0,0)'}], {duration: MOTION_TIMING.page});
  cards.forEach((item, i) => animate(item,
    [{opacity: 0, transform: 'translate3d(0,11px,0)'}, {opacity: 1, transform: 'translate3d(0,0,0)'}],
    { duration: MOTION_TIMING.cards, delay: 65 + Math.min(i, 10) * 34 }));
}

/** Drawers are animated after DOM replacement; the data model is unaffected. */
export function openMobileDrawer(sidebar, curtain) {
  if (!sidebar || !canMove()) return;
  const gsap = engine();
  if (gsap) {
    gsap.fromTo(sidebar, {xPercent:-100}, {xPercent:0, duration:.31, ease:'power3.out', clearProps:'transform'});
    if(curtain) gsap.fromTo(curtain,{opacity:0},{opacity:1,duration:.25,clearProps:'opacity'});
  } else {
    animate(sidebar,[{transform:'translateX(-100%)'},{transform:'translateX(0)'}],{duration:320});
    animate(curtain,[{opacity:0},{opacity:1}],{duration:260});
  }
}
export function closeMobileDrawer(sidebar, curtain, done) {
  if (!sidebar || !canMove()) { done(); return; }
  const gsap = engine();
  if (gsap) {
    gsap.to(sidebar,{xPercent:-100,duration:.21,ease:'power2.in',onComplete:done});
    if(curtain)gsap.to(curtain,{opacity:0,duration:.2});
  } else {
    const a=animate(sidebar,[{transform:'translateX(0)'},{transform:'translateX(-100%)'}],{duration:220});
    animate(curtain,[{opacity:1},{opacity:0}],{duration:200});
    if(a?.finished)a.finished.then(done,done); else done();
  }
}

/** Toggle a navigation panel with measured height. Hidden is set only on close completion. */
export function toggleAccordion(panel, expand) {
  if (!panel) return;
  if (panel._simpulMotion?.kill) panel._simpulMotion.kill();
  if (panel._simpulMotion?.cancel) panel._simpulMotion.cancel();
  panel._simpulMotion = null;
  if (!canMove()) { panel.hidden = !expand; panel.style.removeProperty('height'); panel.style.removeProperty('overflow'); return; }
  if (expand) panel.hidden = false;
  const height = Math.max(panel.scrollHeight, 1);
  panel.style.overflow = 'hidden';
  const complete=()=>{panel.style.removeProperty('height');panel.style.removeProperty('overflow');panel.style.removeProperty('opacity'); if(!expand)panel.hidden=true; panel._simpulMotion=null;};
  const gsap = engine();
  if (gsap) {
    panel._simpulMotion=gsap.fromTo(panel,{height:expand?0:height,opacity:expand?0:1},
      {height:expand?height:0,opacity:expand?1:0,duration:.28,ease:'power2.inOut',onComplete:complete});
  } else {
    const a=animate(panel,[{height:`${expand?0:height}px`,opacity:expand?0:1},
      {height:`${expand?height:0}px`,opacity:expand?1:0}],{duration:MOTION_TIMING.menu});
    panel._simpulMotion=a;
    if (a?.finished) a.finished.then(complete, complete); else complete();
  }
}
export function showModal(overlay) {
  if (!overlay || !canMove()) return;
  const box=overlay.querySelector('.modal');
  const gsap=engine();
  if(gsap){gsap.fromTo(overlay,{opacity:0},{opacity:1,duration:.2});
    if(box)gsap.fromTo(box,{opacity:0,y:22,scale:.985},{opacity:1,y:0,scale:1,duration:.32,ease:'power3.out',clearProps:'transform,opacity'});}
  else {animate(overlay,[{opacity:0},{opacity:1}],{duration:190});
    animate(box,[{opacity:0,transform:'translateY(20px) scale(.985)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:320});}
}
export function hideModal(overlay, done) {
  if (!overlay || !canMove()) {done();return;}
  const gsap=engine();
  if(gsap)gsap.to(overlay,{opacity:0,duration:.16,onComplete:done});
  else {const a=animate(overlay,[{opacity:1},{opacity:0}],{duration:160});
    if(a?.finished)a.finished.then(done,done);else done();}
}
export function showToast(node) {
  if (!node || !canMove()) return;
  const gsap=engine();
  if(gsap)gsap.fromTo(node,{opacity:0,y:12},{opacity:1,y:0,duration:.28,ease:'power2.out',clearProps:'opacity,transform'});
  else animate(node,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:MOTION_TIMING.toast});
}
export function accentActiveNav(root) {
  if (!root || !canMove())return;
  const active=root.querySelector('.nav-link.active');
  if (!active)return;
  const gsap=engine();
  if(gsap)gsap.fromTo(active,{scale:.985},{scale:1,duration:.24,ease:'power2.out',clearProps:'transform'});
  else animate(active,[{transform:'scale(.985)'},{transform:'scale(1)'}],{duration:250});
}
