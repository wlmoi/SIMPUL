"""Guided story: controls, completion, evidence isolation and mobile layout."""
from pathlib import Path
import pytest
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parent.parent


@pytest.mark.parametrize('width,reduced', [(1440, False), (390, True)])
def test_guided_demo_controls_and_evidence(width, reduced):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=['--no-sandbox'])
        page = browser.new_page(viewport={'width': width, 'height': 1000 if width > 600 else 844}, reduced_motion='reduce' if reduced else 'no-preference', has_touch=width < 600, is_mobile=width < 600)
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.clock.install()
        html = (ROOT / 'SIMPUL_Standalone.html').read_text(encoding='utf-8')
        html = html.replace('<script type="module">', '<script type="module">\nwindow.__demoEvidenceSnapshot = () => JSON.stringify(getState());', 1)
        page.set_content(html)
        page.clock.run_for(100)
        before = page.evaluate('window.__demoEvidenceSnapshot()')
        expect(page.locator('[data-demo-curtain]')).to_be_visible()
        page.locator('.mc-hero-copy [data-action="home-demo-play"]').click()
        expect(page.locator('.demo-expanded')).to_have_count(1)
        expect(page.locator('[data-demo-curtain]')).to_be_hidden()
        expect(page.locator('.demo-toolbar [data-demo-play-label]')).to_have_text('Pause demo')
        page.clock.run_for(1000)
        page.locator('.demo-toolbar [data-action="home-demo-play"]').click()
        progress = page.locator('[data-demo-progress]').get_attribute('aria-valuenow')
        page.clock.run_for(2000)
        assert page.locator('[data-demo-progress]').get_attribute('aria-valuenow') == progress
        for index, scenario in [(2, 'A0'), (3, 'A1'), (4, 'A2')]:
            page.locator(f'.demo-timeline [data-index="{index}"]').click()
            expect(page.locator('[data-demo-count]')).to_contain_text(scenario)
            expect(page.locator(f'.mc-switch [data-home-scenario="{scenario}"]')).to_have_attribute('aria-pressed', 'true')
        page.locator('.demo-timeline [data-index="5"]').click()
        expect(page.locator('[data-demo-summary]')).to_be_visible()
        for result in page.locator('[data-result-speed]').all():
            assert float(result.inner_text()) >= 0
        assert not page.evaluate('document.documentElement.scrollWidth > window.innerWidth')
        page.locator('[data-action="home-demo-replay"]').click()
        expect(page.locator('[data-demo-count]')).to_contain_text('01 / 06')
        # Full autoplay under reduced motion uses static chapter snapshots.
        if reduced:
            canvas = page.locator('[data-home-canvas]')
            page.clock.run_for(100)
            image = canvas.evaluate('(el) => el.toDataURL()')
            page.clock.run_for(1000)
            assert canvas.evaluate('(el) => el.toDataURL()') == image
            page.clock.run_for(49000)
            expect(page.locator('[data-demo-status]')).to_contain_text('Demo complete')
            expect(page.locator('[data-demo-progress]')).to_have_attribute('aria-valuenow', '100')
        page.locator('.demo-timeline [data-index="3"]').click()
        stage=page.locator('[data-home-camera]')
        stage.scroll_into_view_if_needed()
        page.clock.run_for(100)
        original=page.locator('[data-home-canvas]').evaluate('(el) => el.toDataURL()')
        box=stage.bounding_box()
        x,y=box['x']+box['width']*0.5,box['y']+box['height']*0.6
        page.mouse.move(x,y);page.mouse.down();page.mouse.move(x+45,y+20,steps=4);page.mouse.up()
        page.clock.run_for(100)
        assert page.locator('[data-home-canvas]').evaluate('(el) => el.toDataURL()') != original
        expect(page.locator('[data-demo-status]')).to_contain_text('Free camera')
        expect(page.locator('.demo-toolbar [data-action="home-demo-play"]')).to_have_attribute('aria-pressed','false')
        page.mouse.wheel(0,-120);page.clock.run_for(100)
        page.locator('[data-action="home-demo-camera-reset"]').click();page.clock.run_for(100)
        assert page.locator('[data-home-canvas]').evaluate('(el) => el.toDataURL()') == original
        if reduced:
            stage.scroll_into_view_if_needed();box=stage.bounding_box()
            x,y=box['x']+box['width']*0.5,box['y']+box['height']*0.6
            cdp=page.context.new_cdp_session(page)
            cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x-30,'y':y,'id':0},{'x':x+30,'y':y,'id':1}]})
            cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x-55,'y':y,'id':0},{'x':x+55,'y':y,'id':1}]})
            cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
            page.clock.run_for(100)
            assert page.locator('[data-home-canvas]').evaluate('(el) => el.toDataURL()') != original
        full=page.locator('[data-viewer="home"]')
        full.locator('[data-action="viewer-fullscreen"]').click();page.clock.run_for(100)
        expect(full.locator('[data-action="viewer-fullscreen"]')).to_have_attribute('aria-pressed','true')
        assert full.evaluate('(el) => document.fullscreenElement === el || el.classList.contains("viewer-fullscreen-fallback")')
        full.locator('[data-action="viewer-fullscreen"]').click();page.clock.run_for(100)
        expect(full.locator('[data-action="viewer-fullscreen"]')).to_have_attribute('aria-pressed','false')
        assert full.evaluate('(el) => document.fullscreenElement !== el && !el.classList.contains("viewer-fullscreen-fallback")')
        # Simulate a browser that rejects the native Fullscreen API.
        full.evaluate('(el) => { el.requestFullscreen = () => Promise.reject(new Error("unsupported")); }')
        full.locator('[data-action="viewer-fullscreen"]').click();page.clock.run_for(100)
        expect(full).to_have_class('mc-preview viewer-fullscreen-fallback')
        page.keyboard.press('Escape')
        assert full.evaluate('(el) => !el.classList.contains("viewer-fullscreen-fallback")')
        assert page.evaluate('window.__demoEvidenceSnapshot()') == before
        full.locator('[data-action="viewer-fullscreen"]').click();page.clock.run_for(100)
        page.locator('[data-action="home-demo-close"]').click()
        expect(page.locator('.demo-expanded')).to_have_count(0)
        assert full.evaluate('(el) => !el.classList.contains("viewer-fullscreen-fallback")')
        page.locator('[data-language="id"]').click()
        expect(page.locator('.mc-hero-copy [data-demo-play-label]')).to_have_text('Putar demo lengkap')
        expect(page.locator('.demo-timeline [data-index="0"]')).to_contain_text('Kebutuhan jemput')
        page.evaluate("location.hash='#cctv'")
        cctv=page.locator('[data-viewer="cctv"]')
        cctv.locator('[data-action="viewer-fullscreen"]').click();page.clock.run_for(100)
        expect(cctv.locator('[data-action="viewer-fullscreen"]')).to_have_attribute('aria-pressed','true')
        assert cctv.evaluate('(el) => document.fullscreenElement === el || el.classList.contains("viewer-fullscreen-fallback")')
        cctv.locator('[data-action="viewer-fullscreen"]').click();page.clock.run_for(100)
        expect(cctv.locator('[data-action="viewer-fullscreen"]')).to_have_attribute('aria-pressed','false')
        assert cctv.evaluate('(el) => document.fullscreenElement !== el && !el.classList.contains("viewer-fullscreen-fallback")')
        assert not errors, errors
        browser.close()
