"""Frontend API workflow under mocked fetch. Backend endpoints verified separately.

Browser runtime in this environment blocks localhost navigation. set_content plus
mocked fetch verifies the UI wiring without claiming external service availability.
"""
import asyncio,shutil
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parent.parent
SHOT_DIR=ROOT/'tmp'/'screenshots'
SHOT_DIR.mkdir(parents=True,exist_ok=True)
HTML=(ROOT/'SIMPUL_Standalone.html').read_text()
MOCK='''(() => {
const realFetch=window.fetch.bind(window);
let remote=[];
const payload={
 '/api/status':{service:'SIMPUL API',engineAvailable:false},
 '/api/integrations':{geo:{enabled:true},weather:{enabled:true},nearby:{enabled:true},storage:{enabled:true},simulation:{enabled:false},gemini:{enabled:false},traffic:{enabled:false}},
 '/api/geo/search':{provider:'Nominatim',results:[{name:'Stasiun MRT Fatmawati, Jakarta Selatan, Indonesia',lat:-6.291,lon:106.793,osmId:'example'}]},
 '/api/context/weather':{provider:'Open-Meteo',contextOnly:true,time:'2026-11-14T13:00',temperature:29.4,rain:0,humidity:72},
 '/api/traffic/live':{provider:'TomTom Traffic Flow',liveSnapshot:true,currentSpeedKmph:22,freeFlowSpeedKmph:40,speedRatio:.55},
 '/api/geo/nearby':{provider:'OSM',items:[{osmId:42,name:'Halte contoh (data mock)',category:'bus_stop',lat:-6.291,lon:106.793}],count:1},
 '/api/observations':()=>({items:remote,count:remote.length})
};
window.fetch=async (url,options={})=>{
 const path=String(url).split('?')[0];
 if(path==='/api/observations/sync'){
   const input=JSON.parse(options.body);let inserted=0;
   input.items.forEach(it=>{if(!remote.some(x=>x.id===it.id)){remote.push(it);inserted++}});
   return new Response(JSON.stringify({inserted,alreadyPresent:input.items.length-inserted}),{status:200,headers:{'Content-Type':'application/json'}});
 }
 if(path==='/api/ai/insights')return new Response(JSON.stringify({detail:'GEMINI_API_KEY belum dikonfigurasi di backend.'}),{status:503,headers:{'Content-Type':'application/json'}});
 const result=typeof payload[path]==='function'?payload[path]():payload[path];
 if(result)return new Response(JSON.stringify(result),{status:200,headers:{'Content-Type':'application/json'}});
 return realFetch(url,options);
};})();'''
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox'])
  page=await browser.new_page(viewport={'width':1440,'height':960},device_scale_factor=1)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.add_init_script(MOCK)
  await page.set_content(HTML,wait_until='domcontentloaded')
  # set_content about:blank may not run add_init_script; evaluate explicitly.
  await page.evaluate(MOCK)
  await page.evaluate('location.hash="integrations"')
  await page.locator('[data-action="check-apis"]').click()
  await page.get_by_text('BACKEND TERHUBUNG',exact=True).wait_for(timeout=4500)
  await page.screenshot(path=str(SHOT_DIR/'api_hub_desktop.png'),full_page=True)
  await page.evaluate('location.hash="context"')
  await page.locator('#geo-query').fill('Stasiun MRT Fatmawati')
  await page.locator('#geo-search-form button[type="submit"]').click()
  await page.locator('[data-action="select-geo"]').wait_for()
  await page.locator('[data-action="select-geo"]').first.click()
  assert await page.locator('.geo-vector-preview').count()==1
  await page.locator('[data-action="fetch-weather"]').click()
  await page.locator('.weather-show').wait_for()
  await page.locator('[data-action="fetch-nearby"]').click()
  await page.locator('text=Halte contoh (data mock)').wait_for()
  await page.locator('[data-action="fetch-traffic"]').click()
  await page.locator('text=22 km/j').wait_for()
  await page.screenshot(path=str(SHOT_DIR/'context_desktop.png'),full_page=True)
  await page.evaluate('location.hash="observation"')
  await page.locator('[data-action="start-session"]').click()
  await page.locator('[data-action="capture-type"][data-value="Jemput"]').click()
  await page.locator('#event-duration').fill('27')
  await page.locator('#event-form button[type="submit"]').click()
  page.once('dialog',lambda dlg:asyncio.create_task(dlg.accept()))
  await page.locator('[data-action="sync-observations"]').click()
  await page.wait_for_timeout(350)
  await page.locator('[data-action="pull-observations"]').click()
  await page.wait_for_timeout(350)
  if errors:raise AssertionError(errors)
  phone=await browser.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,device_scale_factor=1)
  await phone.set_content(HTML,wait_until='domcontentloaded')
  await phone.evaluate('location.hash="integrations"')
  assert await phone.evaluate('document.documentElement.scrollWidth')==390
  await phone.screenshot(path=str(SHOT_DIR/'api_hub_mobile.png'),full_page=True)
  print('PASS: API Hub status UI, mock geocode/weather/nearby, mock sync/pull, responsive layout')
  await browser.close()
if __name__=='__main__':asyncio.run(main())
