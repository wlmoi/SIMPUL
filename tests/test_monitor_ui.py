"""Dedicated UX verification: desktop and mobile screenshot and real actions on monitoring page."""
import asyncio, shutil
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parent.parent
HTML=(ROOT/'SIMPUL_Standalone.html').read_text()
async def main():
    async with async_playwright() as p:
        exe=shutil.which('chromium') or shutil.which('google-chrome')
        opts={'headless':True,'args':['--no-sandbox']}
        if exe: opts['executable_path']=exe
        browser=await p.chromium.launch(**opts)
        for size,name in [({'width':1440,'height':900},'monitor_desktop.png'),({'width':390,'height':844},'monitor_mobile.png')]:
            page=await browser.new_page(viewport=size,accept_downloads=True)
            errs=[]; page.on('pageerror',lambda e:errs.append(str(e)))
            await page.set_content(HTML,wait_until='domcontentloaded')
            await page.evaluate('location.hash="monitor"')
            await page.wait_for_timeout(450)
            assert await page.locator('h1').inner_text()=='Monitoring & Data Log'
            assert await page.locator('.monitor-stream-card').count()==3
            assert await page.locator('#monitor-auto-sync').count()==1
            assert await page.locator('#monitor-auto-sync').is_checked() is False
            await page.locator('#monitor-source').select_option('demo')
            assert await page.locator('.monitor-source.demo').count()>0
            await page.locator('#monitor-source').select_option('manual')
            assert await page.locator('.monitor-no-results').count()==1
            await page.locator('[data-action="reset-monitor-filters"]').click()
            assert await page.locator('#monitor-source').input_value()=='all'
            await page.screenshot(path=str(ROOT/'docs'/name),full_page=True)
            async with page.expect_download() as result:
                await page.locator('[data-action="export-monitor"]').click()
            assert (await result.value).suggested_filename=='SIMPUL_monitoring_log.csv'
            assert await page.evaluate('document.documentElement.scrollWidth')==size['width']
            assert not errs,errs
            await page.close()
        print('PASS monitoring UI: filters, export, opt-in default, 3 Grafana/Influx cards, desktop/mobile screenshots, no overflow or JS errors')
        await browser.close()
if __name__=='__main__':asyncio.run(main())
