"""UI smoke test for standalone bundle without an external web server.

Run `python tools/build_standalone.py` first, then
`python -m pytest -q tests/test_decision_ui.py` with Chromium installed.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parent.parent
HTML=(ROOT/'SIMPUL_Standalone.html').read_text()


def _fill(page,phase,scenario,passing,stopped,queue,access):
    page.locator('[data-action="add-field-reading"]').first.click()
    page.locator('#fld-phase').select_option(phase)
    page.locator('#fld-scenario').select_option(scenario)
    for field,value in [('fld-passing',passing),('fld-stopped',stopped),('fld-queue',queue),('fld-access',access),('fld-pedestrians',60),('fld-bays',5),('fld-occupied',3)]:
        page.locator('#'+field).fill(str(value))
    page.locator('#field-reading-form button[type=submit]').click()
    expect(page.locator('#field-reading-form')).to_have_count(0)


def test_mobile_and_decision_flow():
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
        page=browser.new_page(viewport={'width':1440,'height':900})
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.set_content(HTML)
        for route in ('overview','project','observation','monitor','diagnosis','context','contextplus','simulation','evaluation','insights','business','pipeline','equipment','reports','integrations','settings'):
            page.evaluate(f"location.hash='#{route}'")
            assert page.locator('h1').count()==1,route
        page.evaluate("location.hash='#diagnosis'")
        _fill(page,'baseline','A0',300,30,12,120)
        _fill(page,'followup','A1',350,15,8,100)
        assert page.locator('.dia-table tbody tr').count()==2
        page.evaluate("location.hash='#evaluation'")
        assert '1 kombinasi zona' in page.locator('.eval-compare-status').inner_text()
        assert page.locator('.eval-comparison').count()==4
        page.locator('#compare-scenario').select_option('A2')
        assert 'Belum ada pasangan' in page.locator('.eval-compare-status').inner_text()
        page.locator('#compare-scenario').select_option('A1')
        page.locator('[data-action="add-decision"]').first.click()
        page.locator('#dec-owner').fill('Tim penilai')
        page.locator('#dec-reason').fill('Pilihan masih memerlukan inspeksi keamanan akses dan kalibrasi SUMO.')
        page.locator('#decision-form button[type=submit]').click()
        assert page.locator('.eval-decision').count()==1
        assert errors==[],errors
        page.close()
        mobile=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
        mobile.set_content(HTML)
        for route in ('diagnosis','evaluation','monitor'):
            mobile.evaluate(f"location.hash='#{route}'")
            assert mobile.evaluate('document.documentElement.scrollWidth <= window.innerWidth'),route
        browser.close()
