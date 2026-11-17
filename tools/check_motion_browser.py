"""Headless smoke test for v1.6 navigation, drawer, accordion and reduced motion."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parent.parent
SHOT_DIR=ROOT/'tmp'/'screenshots'
SHOT_DIR.mkdir(parents=True,exist_ok=True)
HTML=(ROOT/'SIMPUL_Standalone.html').read_text(encoding='utf-8')
with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  for label,width,height in [('desktop',1440,900),('mobile',390,844)]:
    pg=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
    errs=[]
    pg.on('pageerror',lambda error:errs.append(str(error)))
    pg.set_content(HTML,wait_until='domcontentloaded')
    pg.wait_for_timeout(650)
    assert pg.locator('.nav-core .nav-link').count()==5, label
    pg.keyboard.press('/')
    pg.wait_for_timeout(40)
    assert pg.evaluate('document.activeElement?.id')=='simpul-nav-search', f'{label}: slash keyboard shortcut'
    pg.keyboard.press('Escape')
    if label=='mobile': pg.wait_for_timeout(330)
    if label=='mobile':
      pg.locator('.hamburger').click()
      pg.wait_for_timeout(380)
      assert 'open' in pg.locator('.sidebar').get_attribute('class')
      pg.locator('#simpul-nav-search').fill('monitor')
      assert pg.locator('[data-route="monitor"]').count()==1
      pg.locator('.nav-fold-trigger').filter(has_text='Survei').first.count() # search state only
      pg.locator('.mobile-curtain').click(position={'x':350,'y':390})
      pg.wait_for_timeout(300)
      assert 'open' not in pg.locator('.sidebar').get_attribute('class')
      pg.locator('.mobile-bottom-nav [data-route="diagnosis"]').click()
    else:
      pg.locator('.nav-fold-trigger[data-group="field"]').click()
      pg.wait_for_timeout(360)
      assert pg.locator('#nav-panel-field').is_visible()
      pg.locator('.nav-fold-trigger[data-group="field"]').click()
      pg.wait_for_timeout(370)
      assert pg.locator('#nav-panel-field').is_hidden()
      pg.locator('.nav-core [data-route="diagnosis"]').click()
    pg.wait_for_timeout(650)
    assert pg.locator('h1').count()==1, label
    assert not errs, f'{label} errors: {errs}'
    overflow=pg.evaluate('document.documentElement.scrollWidth>window.innerWidth')
    assert not overflow, f'{label}: horizontal overflow'
    pg.evaluate("location.hash='#overview'")
    pg.wait_for_timeout(570)
    pg.screenshot(path=str(SHOT_DIR/f'motion_{label}_v1.6.png'),full_page=(label=='desktop'))
    print(f'PASS browser {label}: navigation, motion, zero console pageerrors, no horizontal overflow')
    pg.close()
  pg=browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
  pg.set_content(HTML)
  pg.locator('.mobile-bottom-nav [data-route="simulation"]').click()
  pg.wait_for_timeout(120)
  assert pg.locator('h1').count()==1
  assert pg.evaluate('window.matchMedia("(prefers-reduced-motion: reduce)").matches')
  print('PASS browser reduced-motion: navigation remains interactive')
  browser.close()
