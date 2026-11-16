"""Exercise every shipped motion export with native browser animations and offline reload."""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT/'dist')))
Thread(target=server.serve_forever,daemon=True).start()
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(channel='msedge',headless=True)
        context=browser.new_context(viewport={'width':1440,'height':900})
        page=context.new_page()
        page.goto(f'http://127.0.0.1:{server.server_port}/',wait_until='domcontentloaded')
        page.locator('.solution-hero').wait_for()
        result=page.evaluate('''async () => {
          const m=await import('/js/motion.js');
          const before=JSON.stringify({...localStorage});
          const box=document.createElement('div');
          box.style.cssText='position:fixed;top:0;left:0;width:300px;background:white;z-index:9999';
          box.innerHTML='<div class="main-head">Heading</div><div class="solution-hero">Hero</div><div class="creator-card">Card</div><div class="modal">Modal</div><div class="nav-link active">Active</div>';
          document.body.append(box);
          const checks=[];
          function running(label, action) {
            action();
            const animations=box.getAnimations({subtree:true});
            if(!animations.length) throw new Error('Missing animation: '+label);
            checks.push(label);
            return animations;
          }
          async function finish(list){ await Promise.all(list.map(a=>a.finished.catch(()=>{}))); }
          await finish(running('page and cards',()=>m.enterPage(box)));
          await finish(running('drawer open',()=>m.openMobileDrawer(box,null)));
          let closed=false;
          await finish(running('drawer close',()=>m.closeMobileDrawer(box,null,()=>closed=true)));
          if(!closed)throw new Error('Drawer callback missing');
          await finish(running('accordion close',()=>m.toggleAccordion(box,false)));
          if(!box.hidden)throw new Error('Accordion not hidden');
          await finish(running('accordion open',()=>m.toggleAccordion(box,true)));
          if(box.hidden)throw new Error('Accordion not shown');
          await finish(running('modal open',()=>m.showModal(box)));
          let hidden=false;
          await finish(running('modal close',()=>m.hideModal(box,()=>hidden=true)));
          if(!hidden)throw new Error('Modal callback missing');
          await finish(running('toast',()=>m.showToast(box)));
          await finish(running('active navigation',()=>m.accentActiveNav(box)));
          running('cancellation',()=>m.enterPage(box));m.stopMotion();
          if(box.getAnimations({subtree:true}).length)throw new Error('Motion cleanup failed');
          box.remove();
          if(before!==JSON.stringify({...localStorage}))throw new Error('Motion modified stored data');
          return checks;
        }''')
        print('PASS native motion:', ', '.join(result), flush=True)
        page.evaluate("location.hash='project'")
        page.wait_for_timeout(900)
        assert page.locator('.scope-hero').evaluate("el=>getComputedStyle(el,'::after').animationName")=='simpul-halo'
        print('PASS CSS halo animation present',flush=True)
        page.evaluate("location.hash='overview'")
        page.wait_for_function("navigator.serviceWorker.controller !== null")
        cache=page.evaluate('''async()=>{const keys=await caches.keys();const cache=await caches.open(keys.find(k=>k.startsWith('simpul-web-')));return (await cache.keys()).map(r=>new URL(r.url).pathname);}''')
        assert '/js/motion.js' in cache and '/styles.css' in cache
        context.set_offline(True)
        page.reload(wait_until='domcontentloaded')
        page.locator('.solution-hero').wait_for()
        page.locator('.nav-core [data-route="vehicles"]').click()
        page.locator('.vehicle-story').wait_for()
        print(f'PASS offline: {len(cache)} cached resources, reload and route navigation',flush=True)
        browser.close()
finally:
    server.shutdown();server.server_close()
