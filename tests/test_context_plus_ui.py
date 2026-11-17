"""Mimicked browser network responses verify v0.3 Context Intelligence Lab wiring.
Images are UI test captures with mocked data; they are not live API evidence.
"""
import asyncio,shutil
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parent.parent
SHOT_DIR=ROOT/'tmp'/'screenshots'
SHOT_DIR.mkdir(parents=True,exist_ok=True)
HTML=(ROOT/'SIMPUL_Standalone.html').read_text()
MOCK='''(() => {
window.fetch=async (url,options={})=>{
 let uri=String(url), path=uri.split('?')[0];
 const replies={
  '/api/geo/search':{results:[{name:'MRT Fatmawati, Jakarta, Indonesia (mock)',lat:-6.291,lon:106.793,osmId:'test'}]},
  '/api/integrations':{geo:{enabled:true},nearby:{enabled:true},reverse:{enabled:true},crossings:{enabled:true},forecast:{enabled:true},history:{enabled:true},airquality:{enabled:true},elevation:{enabled:true},holidays:{enabled:true},routing:{enabled:true},isochrone:{enabled:true}},
  '/api/status':{service:'SIMPUL API v0.3',engineAvailable:false},
  '/api/geo/reverse':{provider:'Nominatim',address:'Fatmawati, Jakarta Selatan, Indonesia (mock)'},
  '/api/geo/crossings':{provider:'OSM Overpass',count:4,items:[{lat:-6.291,lon:106.793}]},
  '/api/context/air-quality':{provider:'Open-Meteo CAMS',aqiUS:44,pm25UgM3:8.4,pm10UgM3:16.2},
  '/api/context/forecast':{provider:'Open-Meteo Forecast',hours:[{time:'2026-11-14T13:00',rainProbabilityPct:40,precipitationMm:0.2},{time:'2026-11-14T14:00',rainProbabilityPct:65,precipitationMm:0.8}]},
  '/api/context/elevation':{provider:'Copernicus DEM',elevationM:33,resolutionM:90},
  '/api/context/history':{provider:'Open-Meteo Historical',date:'2026-10-20',meanTemperatureC:29.5,dayRainMm:3.9},
  '/api/context/holidays':{provider:'Nager.Holidays API v4',count:1,year:2026,items:[{name:'Independence Day',date:'2026-08-17',national:true}]},
  '/api/accessibility/route':{provider:'openrouteservice',profile:'foot-walking',distanceM:920,durationSec:660,geometry:[[106.793,-6.291],[106.794,-6.292],[106.796,-6.295]],warning:'Mock data only'},
  '/api/accessibility/isochrone':{provider:'openrouteservice',minutes:10,boundary:[[106.79,-6.29],[106.8,-6.29],[106.8,-6.30],[106.79,-6.29]],warning:'Mock data only'},
  '/api/geo/nearby':{provider:'OSM',items:[{osmId:1,name:'Halte contoh',lat:-6.294,lon:106.796,category:'bus_stop'}],count:1}
 };
 let data=replies[path];
 return new Response(JSON.stringify(data??{detail:'Unexpected mock request '+path}),{status:data?200:404,headers:{'Content-Type':'application/json'}});
};})();'''

async def main():
 async with async_playwright() as p:
  exe=shutil.which('chromium') or shutil.which('google-chrome')
  opts={'headless':True,'args':['--no-sandbox']}
  if exe:opts['executable_path']=exe
  browser=await p.chromium.launch(**opts)
  page=await browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.set_content(HTML,wait_until='domcontentloaded')
  await page.evaluate(MOCK)
  await page.evaluate('location.hash="context"')
  await page.locator('#geo-query').fill('Fatmawati, Jakarta')
  await page.locator('#geo-search-form button[type="submit"]').click()
  await page.locator('[data-action="select-geo"]').first.click()
  await page.locator('[data-action="fetch-nearby"]').click()
  await page.get_by_text('Halte contoh').wait_for()
  await page.evaluate('location.hash="contextplus"')
  assert await page.locator('.ctx-module').count()==7
  for action in ['ctx-reverse','ctx-crossings','ctx-airquality','ctx-forecast','ctx-elevation','ctx-history','ctx-holidays']:
   await page.locator(f'[data-action="{action}"]').first.click()
   # Ensure render cycle produced response, not just click.
   await page.wait_for_timeout(80)
  assert '44' in await page.locator('.ctx-module').nth(2).inner_text()
  assert 'Independence Day' in await page.locator('.ctx-module').nth(6).inner_text()
  await page.locator('[data-action="ctx-select-poi"]').first.click()
  assert await page.locator('#ctx-dest-lat').input_value()=='-6.294'
  await page.locator('#ctx-route-form button[type="submit"]').click()
  await page.locator('.ctx-route-figure').first.wait_for()
  await page.locator('[data-action="ctx-isochrone"][data-minutes="10"]').click()
  await page.wait_for_timeout(400)
  print('route_figures=',await page.locator('.ctx-route-figure').count(), 'toast=', await page.locator('.toasts').inner_text())
  print('iso snippet=', (await page.locator('.ctx-route-layout').inner_text())[-600:])
  assert await page.locator('.ctx-route-figure').count()==2
  await page.screenshot(path=str(SHOT_DIR/'context_plus_desktop.png'),full_page=True)
  await page.set_viewport_size({'width':390,'height':844})
  await page.wait_for_timeout(120)
  assert await page.evaluate('document.documentElement.scrollWidth <= window.innerWidth+2'), 'Mobile horizontal scroll overflow'
  await page.screenshot(path=str(SHOT_DIR/'context_plus_mobile.png'),full_page=True)
  assert not errors,errors
  await browser.close()
  print('PASS: Context+ 7 context providers, OSM facility destination, ORS routes & isochrones, 390px layout, 0 page errors')
if __name__=='__main__': asyncio.run(main())
