"""Browser QA against the exact Vercel dist output; uses installed Edge on Windows."""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
import re
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
routes = re.findall(r'^  (\w+): render', (ROOT/'js/page-registry.js').read_text(), re.M)
class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args): pass
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT/'dist')))
Thread(target=server.serve_forever, daemon=True).start()
url = f'http://127.0.0.1:{server.server_port}/'
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True)
        for label, width, height in [('desktop',1440,900),('mobile',390,844)]:
            pg = browser.new_page(viewport={'width':width,'height':height})
            errors=[]
            pg.on('pageerror', lambda error: errors.append(str(error)))
            pg.goto(url)
            pg.locator('h1').wait_for()
            for route in routes:
                pg.evaluate('(route)=>location.hash=route', route)
                pg.wait_for_timeout(850)
                assert pg.locator('h1').count()==1, (label, route, 'heading')
                assert not pg.evaluate('document.documentElement.scrollWidth > innerWidth'), (label,route,'overflow')
                assert pg.locator('#main-content').is_visible(), (label,route,'layout')
                if route in ['overview','vehicles','creators']:
                    pg.screenshot(animations='disabled', timeout=10000, path=str(ROOT/'docs'/f'web_{label}_{route}.png'),full_page=True)
            assert not errors, errors
            if label=='mobile':
                pg.locator('.hamburger').click()
                pg.wait_for_timeout(400)
                assert pg.locator('.sidebar').evaluate('(el)=>el.getBoundingClientRect().left>=-1')
                pg.locator('.mobile-curtain').click(position={'x':350,'y':390})
                pg.wait_for_timeout(300)
                assert 'open' not in pg.locator('.sidebar').get_attribute('class')
            else:
                pg.evaluate("location.hash='overview'")
                pg.wait_for_timeout(850)
                pg.locator('[data-group="field"]').click()
                pg.wait_for_timeout(350)
                assert pg.locator('#nav-panel-field').is_visible()
            pg.evaluate("location.hash='vehicles'")
            pg.wait_for_timeout(850)
            # Check animations immediately after a route transition in the real DOM.
            pg.evaluate("location.hash='overview'")
            pg.wait_for_function("document.querySelector('.solution-hero') && document.getAnimations().some(a=>a.effect?.target?.classList.contains('solution-hero'))")
            pg.wait_for_timeout(900)
            assert pg.locator('.solution-hero').evaluate('(el)=>getComputedStyle(el).opacity')=='1'
            print(f'PASS {label}: {len(routes)} routes, no overflow/pageerrors, hero motion, navigation')
            pg.close()
        pg=browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
        pg.goto(url)
        pg.locator('h1').wait_for()
        pg.locator('.mobile-bottom-nav [data-route="vehicles"]').click()
        pg.locator('.vehicle-story').wait_for()
        assert not pg.evaluate('document.getAnimations().some(a=>a.playState==="running" && a.effect?.getTiming().duration>1)')
        print('PASS reduced motion: layout and navigation usable without movement')
        browser.close()
finally:
    server.shutdown()
    server.server_close()
