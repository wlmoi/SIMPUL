"""Guided story: controls, completion, evidence isolation and mobile layout."""
from pathlib import Path
import pytest
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parent.parent


@pytest.mark.parametrize('width,reduced', [(1440, False), (390, True)])
def test_guided_demo_controls_and_evidence(width, reduced):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=['--no-sandbox'])
        page = browser.new_page(viewport={'width': width, 'height': 1000 if width > 600 else 844}, reduced_motion='reduce' if reduced else 'no-preference')
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
        assert page.evaluate('window.__demoEvidenceSnapshot()') == before
        page.locator('[data-action="home-demo-close"]').click()
        expect(page.locator('.demo-expanded')).to_have_count(0)
        page.locator('[data-language="id"]').click()
        expect(page.locator('.mc-hero-copy [data-demo-play-label]')).to_have_text('Putar demo lengkap')
        expect(page.locator('.demo-timeline [data-index="0"]')).to_contain_text('Kebutuhan jemput')
        assert not errors, errors
        browser.close()
