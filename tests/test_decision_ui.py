"""UI smoke test for standalone bundle without an external web server.

Run `python tools/build_standalone.py` first, then
`python -m pytest -q tests/test_decision_ui.py` with Chromium installed.
"""
from pathlib import Path
from datetime import datetime, timezone
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parent.parent
HTML=(ROOT/'SIMPUL_Standalone.html').read_text()


def _fill(page,phase,scenario,passing,stopped,queue,access):
    page.locator('[data-action="add-field-reading"]').first.click()
    page.locator('#fld-observed-at').fill('2026-11-15T07:00' if phase=='baseline' else '2026-11-16T07:00')
    page.locator('#fld-phase').select_option(phase)
    page.locator('#fld-scenario').select_option(scenario)
    for field,value in [('fld-passing',passing),('fld-stopped',stopped),('fld-queue',queue),('fld-access',access),('fld-pedestrians',60),('fld-bays',5),('fld-occupied',3)]:
        page.locator('#'+field).fill(str(value))
    page.locator('#field-reading-form button[type=submit]').click()
    try:
        expect(page.locator('#field-reading-form')).to_have_count(0)
    except AssertionError as error:
        details=page.locator('#field-reading-form').evaluate('(form) => [...form.elements].filter(el => el.id).map(el => ({id:el.id,value:el.value,valid:el.checkValidity(),message:el.validationMessage}))')
        raise AssertionError({'fields':details,'messages':page.locator('#toasts').inner_text()}) from error


def test_modal_autofocus_preserves_active_input():
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=['--no-sandbox'])
        page=browser.new_page(reduced_motion='reduce')
        page.clock.install()
        page.set_content(HTML)
        page.clock.run_for(100)
        page.evaluate("location.hash='#diagnosis'")
        page.clock.run_for(100)
        page.clock.pause_at(page.evaluate('Date.now()')+100)
        page.locator('[data-action="add-field-reading"]').first.click()
        field=page.locator('#fld-passing')
        field.fill('350')
        expect(field).to_be_focused()
        page.clock.run_for(50)
        expect(field).to_be_focused()
        expect(field).to_have_value('350')
        browser.close()


def test_mobile_and_decision_flow():
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
        page=browser.new_page(viewport={'width':1440,'height':900},timezone_id='Asia/Jakarta')
        page.clock.set_fixed_time(datetime(2026,11,17,12,tzinfo=timezone.utc))
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
