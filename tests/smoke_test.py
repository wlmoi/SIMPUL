"""End-to-end UI smoke tests for SIMPUL standalone.
Run: python tests/smoke_test.py. Needs playwright and Chromium.
"""
import asyncio, shutil
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parent.parent
HTML=(ROOT/'SIMPUL_Standalone.html').read_text()

async def main():
    exe=shutil.which('chromium') or shutil.which('google-chrome') or shutil.which('chrome')
    async with async_playwright() as p:
        opts={'headless':True,'args':['--no-sandbox']}
        if exe:opts['executable_path']=exe
        browser=await p.chromium.launch(**opts)
        page=await browser.new_page(viewport={'width':1440,'height':900},accept_downloads=True)
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        await page.set_content(HTML,wait_until='domcontentloaded')
        assert await page.locator('h1').first.inner_text()=='Pusat Kendali Mobilitas'
        for route in ['overview','project','observation','monitor','classification','publicintel','diagnosis','context','contextplus','simulation','evaluation','insights','business','pipeline','equipment','standards','reports','integrations','settings']:
            await page.evaluate('(hash) => location.hash=hash',route)
            await page.wait_for_timeout(80)
            assert await page.locator('h1').count()==1, f'No title for {route}'
        await page.evaluate('location.hash="integrations"')
        assert await page.locator('.api-integration').count()==19, 'Integration tiles must match the current catalog'
        await page.evaluate('location.hash="monitor"')
        assert await page.locator('.monitor-stream-card').count()==3
        assert await page.locator('#monitor-auto-sync').count()==1
        await page.evaluate('location.hash="context"')
        assert await page.locator('#geo-query').count()==1
        assert await page.locator('.geo-placeholder').count()==1
        await page.evaluate('location.hash="business"')
        old=await page.locator('.revenue-hero strong').inner_text()
        await page.locator('#sites').fill('8')
        await page.locator('#sites').press('Tab')
        assert await page.locator('.revenue-hero strong').inner_text()!=old
        await page.evaluate('location.hash="observation"')
        await page.locator('[data-action="start-session"]').click()
        await page.locator('[data-action="capture-type"][data-value="Jemput"]').click()
        await page.locator('#event-duration').fill('34')
        await page.locator('#event-form button[type="submit"]').click()
        assert await page.locator('tbody .tag:has-text("MANUAL")').count()==1
        await page.evaluate('location.hash="pipeline"')
        await page.locator('[data-action="add-lead"]').click()
        await page.locator('#lead-name').fill('Prospek Pengujian')
        await page.locator('#lead-form button[type="submit"]').click()
        assert await page.locator('text=Prospek Pengujian').count()>0
        await page.evaluate('location.hash="project"')
        assert await page.locator('.scope-stage').count()==4
        assert await page.locator('.scope-option').count()==3
        assert await page.get_by_text('F1-score pengenalan kejadian').count()==1
        await page.evaluate('location.hash="equipment"')
        assert await page.locator('.equipment-choice').count()==3
        assert await page.get_by_text('HP + Akuisisi Opsional').count()==1
        await page.evaluate('location.hash="reports"')
        async with page.expect_download() as downloaded:
            await page.locator('[data-action="export-report"]').first.click()
        assert (await downloaded.value).suggested_filename.endswith('.json')
        mobile=await browser.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
        await mobile.set_content(HTML,wait_until='domcontentloaded')
        assert await mobile.evaluate('document.documentElement.scrollWidth')==390, 'Unintended mobile horizontal scrolling'
        await mobile.evaluate('location.hash="observation"')
        await mobile.wait_for_timeout(100)
        assert await mobile.evaluate('document.documentElement.scrollWidth')==390
        await mobile.evaluate('location.hash="integrations"')
        await mobile.wait_for_timeout(80)
        assert await mobile.evaluate('document.documentElement.scrollWidth')==390
        await mobile.evaluate('location.hash="monitor"')
        await mobile.wait_for_timeout(80)
        assert await mobile.evaluate('document.documentElement.scrollWidth')==390
        await mobile.evaluate('location.hash="project"')
        await mobile.wait_for_timeout(80)
        assert await mobile.evaluate('document.documentElement.scrollWidth')==390
        await mobile.evaluate('location.hash="context"')
        await mobile.wait_for_timeout(80)
        assert await mobile.evaluate('document.documentElement.scrollWidth')==390
        assert not errors,errors
        print('PASS: 19 routes, proposal guide, financial edits, field event, pipeline, exports, mobile width, no uncaught JS errors')
        await browser.close()

if __name__=='__main__':asyncio.run(main())
