"""Context enrichments for SIMPUL: bounded, user-triggered external data APIs.

These feeds are contextual, NOT ground-truth lane counts or verified causality.
Do not enable public SaaS without reviewing the respective provider licenses.
"""
from __future__ import annotations
import math
import os
import threading
import time
from datetime import date, timedelta
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from fastapi import HTTPException
from . import providers

AQ_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'
FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive'
ELEVATION_URL = 'https://api.open-meteo.com/v1/elevation'
HOLIDAY_URL = 'https://nagerholidays.com/api/v4/Holidays/ID/'
_rate_lock = threading.Lock()
_last_nominatim = 0.0
_reverse_cache = {}

def _safe_current(data:dict):
    current=data.get('current',{})
    if not isinstance(current,dict) or not current:
        raise HTTPException(502,'Penyedia belum mengembalikan data kondisi saat ini.')
    return current

def reverse_geocode(lat:float,lon:float):
    """One user-triggered reverse lookup; shares Nominatim throttle with search."""
    key=(round(lat,5),round(lon,5))
    cached=_reverse_cache.get(key)
    if cached and cached[0]>time.monotonic():return cached[1]
    global _last_nominatim
    with providers._geo_lock:
        # Follow OSMF-wide 1 request/second rule across forward and reverse lookup.
        if time.monotonic()-providers._last_geocode<1.1:
            raise HTTPException(429,'Nominatim membatasi permintaan. Tunggu sedikit sebelum mengulang.')
        providers._last_geocode=time.monotonic()
    url='https://nominatim.openstreetmap.org/reverse?'+urlencode({'lat':round(lat,6),'lon':round(lon,6),'zoom':17,'format':'jsonv2','addressdetails':1})
    data=providers.get_json(url,timeout=15)
    if not isinstance(data,dict) or 'display_name' not in data:
        raise HTTPException(502,'Nominatim tidak menemukan alamat untuk koordinat tersebut.')
    r={'provider':'OpenStreetMap Nominatim','address':str(data.get('display_name',''))[:260],
       'osmId':str(data.get('osm_id','')),'latitude':lat,'longitude':lon,
       'attribution':'© OpenStreetMap contributors','sourceKind':'geocoded community mapping, unverified'}
    _reverse_cache[key]=(time.monotonic()+3600,r)
    return r

def air_quality(lat:float,lon:float):
    url=AQ_URL+'?'+urlencode({'latitude':lat,'longitude':lon,'current':'us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone','timezone':'Asia/Jakarta'})
    c=_safe_current(providers.get_json(url))
    return {'provider':'Open-Meteo / CAMS','sourceKind':'modeled air quality; not roadside sensor',
            'time':c.get('time'),'aqiUS':c.get('us_aqi'),'pm25UgM3':c.get('pm2_5'),
            'pm10UgM3':c.get('pm10'),'no2UgM3':c.get('nitrogen_dioxide'),
            'ozoneUgM3':c.get('ozone'),'contextOnly':True}

def rain_forecast(lat:float,lon:float):
    url=FORECAST_URL+'?'+urlencode({'latitude':lat,'longitude':lon,
          'hourly':'precipitation_probability,precipitation','forecast_hours':12,'timezone':'Asia/Jakarta'})
    data=providers.get_json(url)
    hourly=data.get('hourly') or {}
    dates=hourly.get('time') or []
    probs=hourly.get('precipitation_probability') or []
    precips=hourly.get('precipitation') or []
    if not isinstance(dates,list) or not dates: raise HTTPException(502,'Prakiraan per jam tidak tersedia.')
    slots=[{'time':t,'rainProbabilityPct':probs[i] if i<len(probs) else None,
            'precipitationMm':precips[i] if i<len(precips) else None} for i,t in enumerate(dates[:12])]
    return {'provider':'Open-Meteo Forecast','sourceKind':'modeled forecast, not on-site observation',
            'hours':slots,'contextOnly':True,'timezone':'Asia/Jakarta'}

def historical_weather(lat:float,lon:float,day:date):
    # Reanalysis often arrives days late; prevent future and same-week lookups.
    if day>date.today()-timedelta(days=7):
        raise HTTPException(422,'Arsip reanalisis hanya tersedia untuk tanggal setidaknya 7 hari yang lalu.')
    if day<date.today()-timedelta(days=365*7):
        raise HTTPException(422,'Batasi analisis tanggal dalam tujuh tahun terakhir.')
    url=ARCHIVE_URL+'?'+urlencode({'latitude':lat,'longitude':lon,'start_date':day.isoformat(),
       'end_date':day.isoformat(),'hourly':'temperature_2m,precipitation','timezone':'Asia/Jakarta'})
    data=providers.get_json(url,timeout=20)
    hourly=data.get('hourly') or {}
    ts=hourly.get('time') or []
    t=hourly.get('temperature_2m') or []
    p=hourly.get('precipitation') or []
    if not ts:raise HTTPException(502,'Data cuaca historis belum tersedia untuk tanggal itu.')
    slots=[{'time':stamp,'temperatureC':t[i] if i<len(t) else None,'rainMm':p[i] if i<len(p) else None} for i,stamp in enumerate(ts[:24])]
    temperature=[float(s['temperatureC']) for s in slots if isinstance(s['temperatureC'],(int,float))]
    rainfall=[max(0,float(s['rainMm'])) for s in slots if isinstance(s['rainMm'],(int,float))]
    return {'provider':'Open-Meteo Historical ERA5 / reanalysis','date':day.isoformat(),
            'sourceKind':'gridded reanalysis, not an on-site weather sensor', 'slots':slots,
            'meanTemperatureC':round(sum(temperature)/len(temperature),1) if temperature else None,
            'dayRainMm':round(sum(rainfall),1) if rainfall else None,'contextOnly':True}

def elevation(lat:float,lon:float):
    url=ELEVATION_URL+'?'+urlencode({'latitude':lat,'longitude':lon})
    data=providers.get_json(url)
    values=data.get('elevation') or []
    if not isinstance(values,list) or not values or not isinstance(values[0],(int,float)):
        raise HTTPException(502,'Elevasi untuk titik ini tidak tersedia.')
    return {'provider':'Open-Meteo / Copernicus DEM GLO-90', 'elevationM':values[0],
            'resolutionM':90,'sourceKind':'terrain model, insufficient for sidewalk slope/accessibility audit',
            'contextOnly':True}

def holidays(year:int):
    data=providers.get_json(HOLIDAY_URL+str(year),timeout=18)
    if not isinstance(data,list):raise HTTPException(502,'Format data kalender hari libur tidak sesuai.')
    items=[{'date':str(x.get('date',''))[:10],'name':str(x.get('name',''))[:110],
            'national':bool(x.get('nationalHoliday')), 'types':x.get('holidayTypes',[])[:4]}
           for x in data[:85] if isinstance(x,dict)]
    return {'provider':'Nager.Holidays API v4','year':year,'country':'ID','items':items,'count':len(items),
       'sourceKind':'third-party holiday calendar; verify against Indonesian official decree', 'contextOnly':True}

def crossing_inventory(lat:float,lon:float):
    """Bounded OSM crossing/kerb/tactile inventory; absence is not evidence of absence."""
    query=('[out:json][timeout:15];('
       f'node(around:350,{lat:.5f},{lon:.5f})["highway"="crossing"];'
       f'node(around:350,{lat:.5f},{lon:.5f})["kerb"];'
       f'node(around:350,{lat:.5f},{lon:.5f})["tactile_paving"];'
       ');out 45;')
    data_bytes=urlencode({'data':query}).encode('utf-8')
    req=Request(providers.OVERPASS,data=data_bytes,
       headers={'User-Agent':providers.USER_AGENT,'Content-Type':'application/x-www-form-urlencoded','Accept':'application/json'},method='POST')
    try:
        with urlopen(req,timeout=24) as response:
            raw=response.read(1_200_001)
        if len(raw)>1_200_000:raise HTTPException(502,'Respons Overpass terlalu besar.')
        import json
        data=json.loads(raw)
    except HTTPError as exc:raise HTTPException(502,f'Overpass HTTP {exc.code}.') from exc
    except (URLError,TimeoutError,ValueError) as exc:raise HTTPException(502,'Inventaris aksesibilitas OSM tidak tersedia.') from exc
    items=[]
    for x in data.get('elements',[])[:45]:
        tags=x.get('tags',{})
        items.append({'lat':x.get('lat'),'lon':x.get('lon'),'osmId':x.get('id'),
             'crossing':tags.get('crossing'),'kerb':tags.get('kerb'),
             'tactile':tags.get('tactile_paving'), 'wheelchair':tags.get('wheelchair')})
    return {'provider':'OpenStreetMap Overpass','count':len(items),'items':items,
      'sourceKind':'community metadata, not an on-site accessibility audit',
      'coverage':'Data OSM dapat belum lengkap; ketiadaan tag bukan bukti tidak ada fasilitas.'}
