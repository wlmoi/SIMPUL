"""Bounded, opt-in external data adapters. All outgoing URLs are trusted constants.

The public endpoints are intended for low-volume academic evaluation, not a
commercial geocoding/traffic feed. They do not provide live congestion data.
"""
from __future__ import annotations
import json
import os
import threading
import time
from datetime import datetime, timezone
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from fastapi import HTTPException

USER_AGENT = os.getenv('SIMPUL_CONTACT_USER_AGENT', 'SIMPUL-AcademicPrototype/0.2 (prototype; user contact in application settings)')
GEOCODE = 'https://nominatim.openstreetmap.org/search'
OVERPASS = os.getenv('SIMPUL_OVERPASS_URL', 'https://overpass.kumi.systems/api/interpreter')
WEATHER = 'https://api.open-meteo.com/v1/forecast'
GEMINI_ROOT = 'https://generativelanguage.googleapis.com/v1beta/models/'
_geo_lock = threading.Lock()
_last_geocode = 0.0
_cache = {}

def get_json(url: str, *, method='GET', payload=None, timeout=13):
    data = None if payload is None else json.dumps(payload).encode('utf-8')
    headers = {'User-Agent':USER_AGENT,'Accept':'application/json'}
    if data is not None: headers['Content-Type'] = 'application/json'
    req = Request(url, data=data, headers=headers, method=method)
    try:
        with urlopen(req,timeout=timeout) as resp:
            if int(resp.headers.get('Content-Length','0') or '0') > 2_000_000:
                raise HTTPException(502,'Respons penyedia data terlalu besar.')
            raw = resp.read(2_000_001)
        if len(raw)>2_000_000:raise HTTPException(502,'Respons penyedia data terlalu besar.')
        return json.loads(raw)
    except HTTPError as exc:
        if exc.code == 429: raise HTTPException(429,'Layanan eksternal sedang membatasi permintaan. Coba lagi nanti.') from exc
        raise HTTPException(502,f'Layanan eksternal mengembalikan HTTP {exc.code}.') from exc
    except (URLError,TimeoutError,ValueError) as exc:
        raise HTTPException(502,'Layanan eksternal tidak dapat dijangkau atau responsnya tidak valid.') from exc

def geocode(q: str):
    """Only explicit search-button requests; no client autocomplete. 1 request/s global."""
    global _last_geocode
    text=' '.join(q.strip().split())
    if len(text)<3 or len(text)>120: raise HTTPException(422,'Pencarian harus berisi 3–120 karakter.')
    key=('geo',text.lower())
    with _geo_lock:
        cached=_cache.get(key)
        if cached and cached[0]>time.monotonic():return cached[1]
        elapsed=time.monotonic()-_last_geocode
        if elapsed<1.05:raise HTTPException(429,'Batasi pencarian lokasi menjadi maksimal satu kali per detik.')
        _last_geocode=time.monotonic()
    url=GEOCODE+'?'+urlencode({'q':text,'format':'jsonv2','limit':5,'addressdetails':0})
    data=get_json(url)
    result=[{'name':str(i.get('display_name',''))[:220],'lat':float(i['lat']),'lon':float(i['lon']),'osmId':str(i.get('osm_id',''))} for i in data[:5]]
    with _geo_lock:_cache[key]=(time.monotonic()+3600,result)
    return result

def weather(lat:float,lon:float):
    """Weather is external contextual data, NOT measured traffic congestion."""
    url=WEATHER+'?'+urlencode({'latitude':lat,'longitude':lon,'current':'temperature_2m,relative_humidity_2m,precipitation,weather_code','timezone':'Asia/Jakarta'})
    data=get_json(url)
    return {'provider':'Open-Meteo','contextOnly':True,'time':data.get('current',{}).get('time'),
      'temperature':data.get('current',{}).get('temperature_2m'),
      'rain':data.get('current',{}).get('precipitation'),
      'humidity':data.get('current',{}).get('relative_humidity_2m'),
      'weatherCode':data.get('current',{}).get('weather_code')}

def nearby(lat:float,lon:float):
    """Nearby mapped transit/parking objects, not a complete inventory or road survey."""
    # Deliberately small radius and limited category filters; explicit user action.
    lat_s=f'{lat:.5f}';lon_s=f'{lon:.5f}'
    query=(' [out:json][timeout:15];(' 
           f'node(around:450,{lat_s},{lon_s})["highway"="bus_stop"];'
           f'node(around:450,{lat_s},{lon_s})["railway"="subway_entrance"];'
           f'node(around:450,{lat_s},{lon_s})["amenity"="parking"];'
           f'way(around:450,{lat_s},{lon_s})["amenity"="parking"];'
           ');out center 35;')
    # POST form avoids URL-length issues and does not permit arbitrary query injection.
    req=Request(OVERPASS,data=urlencode({'data':query}).encode(),headers={'User-Agent':USER_AGENT,'Content-Type':'application/x-www-form-urlencoded','Accept':'application/json'},method='POST')
    try:
        with urlopen(req,timeout=24) as resp: data=json.loads(resp.read(1_000_000))
    except (URLError,TimeoutError,ValueError) as exc:raise HTTPException(502,'Overpass tidak dapat diakses. Coba lagi nanti.') from exc
    items=[]
    for e in data.get('elements',[])[:35]:
        t=e.get('tags',{});point=e.get('center',e)
        items.append({'type':e.get('type'),'osmId':e.get('id'),'name':str(t.get('name') or t.get('highway') or t.get('railway') or t.get('amenity') or 'Objek OSM')[:100],
            'category':str(t.get('highway') or t.get('railway') or t.get('amenity') or 'unknown')[:60],
            'lat':point.get('lat'),'lon':point.get('lon')})
    return {'provider':'OpenStreetMap / Overpass','items':items,'count':len(items),'coverage':'Data komunitas; belum diverifikasi di lapangan.'}

def gemini_insights(aggregate:dict):
    key=os.getenv('GEMINI_API_KEY','').strip()
    if not key:raise HTTPException(503,'GEMINI_API_KEY belum dikonfigurasi di backend.')
    model=os.getenv('GEMINI_MODEL','gemini-2.5-flash').strip()
    if not all(c.isalnum() or c in '.-_' for c in model):raise HTTPException(500,'GEMINI_MODEL tidak valid.')
    schema={'type':'OBJECT','properties':{'summary':{'type':'STRING'},'findings':{'type':'ARRAY','items':{'type':'STRING'}},
      'limitations':{'type':'ARRAY','items':{'type':'STRING'}},'nextSteps':{'type':'ARRAY','items':{'type':'STRING'}}},
      'required':['summary','findings','limitations','nextSteps']}
    prompt=('Anda adalah analis observasi mobilitas di Indonesia. Hanya gunakan agregat data berikut. '
      'Jangan menyimpulkan sebab-akibat, lokasi nyata, atau perubahan kemacetan tanpa data pendukung. '
      'Ini adalah data manual, bukan hasil verifikasi. Berikan temuan ringkas dalam Bahasa Indonesia, '
      'cantumkan keterbatasan sampel dan usulan validasi. Tidak ada data identitas yang disediakan.\n'
      +json.dumps(aggregate,ensure_ascii=False))
    body={'contents':[{'parts':[{'text':prompt}]}],
      'generationConfig':{'responseMimeType':'application/json','responseSchema':schema,'temperature':0.2}}
    # Never send credential to browser. REST legacy endpoint remains supported.
    url=GEMINI_ROOT+model+':generateContent'
    data=json.dumps(body).encode()
    req=Request(url,data=data,method='POST',headers={'x-goog-api-key':key,'Content-Type':'application/json','User-Agent':USER_AGENT})
    try:
        with urlopen(req,timeout=35) as resp: answer=json.loads(resp.read(600_000))
    except HTTPError as exc:raise HTTPException(502,f'Gemini gagal: HTTP {exc.code}. Periksa kredensial, kuota, dan nama model.') from exc
    except (URLError,TimeoutError,ValueError) as exc:raise HTTPException(502,'Gemini tidak dapat dihubungi atau respons tidak valid.') from exc
    try:
        result=json.loads(answer['candidates'][0]['content']['parts'][0]['text'])
        if not all(isinstance(result.get(k),str if k=='summary' else list) for k in ('summary','findings','limitations','nextSteps')):
            raise ValueError('schema mismatch')
    except (IndexError,KeyError,ValueError,TypeError) as exc:raise HTTPException(502,'Output Gemini tidak sesuai skema yang diharapkan.') from exc
    return {'provider':'Google Gemini','model':model,'verified':False,'dataType':'manual observation aggregates','result':result}

def tomtom_flow(lat:float,lon:float):
    """Optional real-time nearest-road traffic snapshot, not curbside event counts."""
    key=os.getenv('TOMTOM_API_KEY','').strip()
    if not key:raise HTTPException(503,'TOMTOM_API_KEY belum dikonfigurasi di server.')
    url='https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/16/json?'+urlencode({
        'key':key,'point':f'{lat:.6f},{lon:.6f}','unit':'kmph'})
    raw=get_json(url,timeout=16)
    seg=raw.get('flowSegmentData')
    if not isinstance(seg,dict):raise HTTPException(502,'TomTom mengembalikan data traffic flow yang tidak sesuai format.')
    try:
        speed=float(seg['currentSpeed']);free=float(seg['freeFlowSpeed'])
    except (TypeError,ValueError,KeyError) as exc:raise HTTPException(502,'Tidak ada data kecepatan lalu lintas dari titik yang dipilih.') from exc
    if speed<0 or free<=0:raise HTTPException(502,'Nilai kecepatan tidak masuk akal.')
    return {'provider':'TomTom Traffic Flow','source':'licensed external traffic','liveSnapshot':True,'retrievedAtUtc':datetime.now(timezone.utc).isoformat(),
       'currentSpeedKmph':speed,'freeFlowSpeedKmph':free,
       'speedRatio':round(speed/free,3),
       'currentTravelTimeSec':seg.get('currentTravelTime'),
       'freeFlowTravelTimeSec':seg.get('freeFlowTravelTime'),
       'confidence':seg.get('confidence'),
       'roadClosure':seg.get('roadClosure'),
       'note':'Segmen jalan terdekat dari titik koordinat, bukan hitungan kendaraan jemput atau hasil simulasi SUMO.'}
