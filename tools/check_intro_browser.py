"""Exercise every shipped motion export with native browser animations and offline reload."""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
SHOT_DIR=ROOT/'tmp'/'screenshots'
SHOT_DIR.mkdir(parents=True,exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT/'dist')))
Thread(target=server.serve_forever,daemon=True).start()
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(channel='msedge',headless=True)
        for label,width,height in [('desktop',1440,900),('mobile',390,844)]:
            pg=browser.new_page(viewport={'width':width,'height':height})
            pg.goto(f'http://127.0.0.1:{server.server_port}/',wait_until='domcontentloaded')
            pg.locator('.simpul-intro').wait_for()
            before=pg.evaluate('JSON.stringify({...localStorage})')
            assert pg.locator('[data-action="intro-stage"]').count()==4
            for i in range(4):
                pg.locator(f'[data-action="intro-stage"][data-index="{i}"]').click()
                assert pg.locator('.simpul-intro').get_attribute('data-intro-stage')==str(i)
                assert pg.locator(f'[data-action="intro-stage"][data-index="{i}"]').get_attribute('aria-pressed')=='true'
            pg.locator('[data-action="intro-replay"]').click()
            assert pg.locator('[data-action="intro-play"]').inner_text()=='Jeda'
            assert pg.locator('.intro-vehicle').first.evaluate('(el)=>getComputedStyle(el).animationName')=='intro-drive'
            pg.wait_for_function("document.querySelector('.simpul-intro').dataset.introStage==='1'",timeout=8000)
            pg.locator('[data-action="intro-play"]').click()
            assert pg.locator('.intro-vehicle').first.evaluate('(el)=>getComputedStyle(el).animationName')=='none'
            pg.locator('[data-action="intro-prev"]').click()
            assert pg.locator('.simpul-intro').get_attribute('data-intro-stage')=='0'
            pg.locator('[data-action="intro-next"]').click()
            assert pg.locator('.simpul-intro').get_attribute('data-intro-stage')=='1'
            pg.locator('[data-action="intro-skip"]').click()
            assert pg.evaluate('document.activeElement.id')=='intro-end'
            assert pg.evaluate('location.hash')==''
            assert before==pg.evaluate('JSON.stringify({...localStorage})')
            pg.locator('[data-action="intro-stage"][data-index="2"]').click()
            pg.locator('#intro-destination').click()
            pg.wait_for_function("location.hash==='#simulation'")
            assert pg.locator('.simpul-intro').count()==0
            pg.evaluate("location.hash='overview'")
            pg.locator('.simpul-intro').wait_for()
            assert not pg.evaluate('document.documentElement.scrollWidth>innerWidth')
            pg.locator('.simpul-intro').screenshot(path=str(SHOT_DIR/f'intro_{label}.png'),animations='disabled')
            print(f'PASS intro {label}: 4 chapters, automatic advance, pause/replay/prev/next/skip, destination, cleanup, unchanged data, no overflow',flush=True)
            pg.close()
        pg=browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
        pg.goto(f'http://127.0.0.1:{server.server_port}/',wait_until='domcontentloaded')
        pg.locator('[data-action="intro-play"]').click()
        assert pg.locator('.intro-vehicle').first.evaluate('(el)=>getComputedStyle(el).animationName')=='none'
        pg.locator('[data-action="intro-stage"][data-index="3"]').click()
        assert pg.locator('.simpul-intro').get_attribute('data-intro-stage')=='3'
        print('PASS intro reduced motion: static illustration and manual chapter controls',flush=True)
        browser.close()
finally:
    server.shutdown();server.server_close()
