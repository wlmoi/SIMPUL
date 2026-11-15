"""Optional OpenOSINT/GDELT public-news context for SIMPUL.

This is NOT a traffic-violation detector or a police-enforcement interface.
Only the passive search_gdelt_geo tool is allowed, with a fixed topic menu.
Never requests personal profiles, email, phone, username, or license plates.
"""
from __future__ import annotations
import asyncio
import importlib.metadata
import importlib.util
import ipaddress
import json
import math
import os
import re
from datetime import datetime, timezone
from typing import Literal
from urllib.parse import urlparse

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict, Field

router = APIRouter(prefix='/api/v1/public-intelligence', tags=['Public Intelligence / OpenOSINT'])
TOPICS = {
    'transit': 'MRT OR transit OR stasiun',
    'mobility': 'traffic OR transport OR congestion',
    'fatmawati': 'Fatmawati',
    'all': '*',
}
NOTICE = ('GDELT mencatat lokasi yang disebut dalam berita, bukan lokasi yang terbukti sebagai tempat kejadian. '
          'Ini hanya konteks sekunder; tidak boleh menjadi bukti tunggal pelanggaran, identifikasi orang, atau dasar tilang.')
MAX_FEATURES = 15

class NewsSearch(BaseModel):
    model_config = ConfigDict(extra='forbid')
    topic: Literal['transit','mobility','fatmawati','all'] = 'fatmawati'
    lat: float = Field(ge=-90,le=90)
    lon: float = Field(ge=-180,le=180)
    radius_km: float = Field(default=3,ge=0.5,le=10)
    minutes: int = Field(default=60,ge=15,le=360)

def osint_status():
    enabled = os.environ.get('SIMPUL_PUBLIC_OSINT_ENABLED', '').lower() in ('1','yes','true','on')
    installed = importlib.util.find_spec('openosint') is not None
    try:
        version = importlib.metadata.version('openosint') if installed else None
    except importlib.metadata.PackageNotFoundError:
        version = None
    return {'provider':'OpenOSINT / GDELT GKG','adapter':'search_gdelt_geo',
        'enabled':enabled,'installed':installed,'version':version,
        'available':enabled and installed,'policy':'passive_public_news_only',
        'legalConclusion':'NOT_DETERMINED','notice':NOTICE,
        'documentation':'https://github.com/OpenOSINT/OpenOSINT'}

def bounding_box(lat:float,lon:float,radius_km:float)->tuple[float,float,float,float]:
    # Sufficient for a contextual search, not a survey-grade geofence.
    delta_lat = radius_km/111.32
    delta_lon = radius_km/(111.32*max(abs(math.cos(math.radians(lat))),0.05))
    return (round(max(-180,lon-delta_lon),6),round(max(-90,lat-delta_lat),6),
            round(min(180,lon+delta_lon),6),round(min(90,lat+delta_lat),6))

async def _openosint_news(topic:str,bbox,minutes:int)->str:
    from openosint.tools.search_gdelt_geo import run_gdelt_geo_osint
    return await run_gdelt_geo_osint(TOPICS[topic],timeout_seconds=15,
                                    timespan=minutes,maxpoints=MAX_FEATURES,bbox=bbox)

def _safe_web_url(url):
    if not isinstance(url,str) or len(url)>1800: return None
    try:
        p=urlparse(url)
        if p.scheme not in ('http','https') or not p.hostname or p.username or p.password: return None
        if p.hostname.lower() in ('localhost','localhost.localdomain'):return None
        try:
            if not ipaddress.ip_address(p.hostname).is_global:return None
        except ValueError: pass
        return url
    except ValueError:return None

def _extract_news(result:str):
    marker='```geojson\n'
    if '[service_unavailable]' in result or result.startswith('Scan error:'):
        raise HTTPException(503,'OpenOSINT/GDELT tidak tersedia. Periksa jaringan dan coba lagi.')
    if marker not in result:
        if result.startswith('No geolocated coverage'):
            return {'items':[],'coverage':None}
        raise HTTPException(502,'OpenOSINT tidak mengembalikan GeoJSON yang dapat diperiksa.')
    block=result.split(marker,1)[1].split('```',1)[0]
    try: raw=json.loads(block)
    except (ValueError,TypeError):raise HTTPException(502,'OpenOSINT GeoJSON tidak valid.')
    if not isinstance(raw,dict) or raw.get('type')!='FeatureCollection':
        raise HTTPException(502,'Format geospasial OpenOSINT tidak didukung.')
    items=[]
    for f in raw.get('features',[])[:MAX_FEATURES]:
        try:
            c=f['geometry']['coordinates']; props=f['properties']
            lon=float(c[0]);lat=float(c[1]);count=int(props.get('count',0))
            if not(-180<=lon<=180 and -90<=lat<=90 and 0<=count<=100000):continue
            url=_safe_web_url(props.get('url'))
            if not url:continue
            items.append({'title':str(props.get('title',''))[:240],
                 'url':url,'domain':str(props.get('domain',''))[:140],
                 'place':str(props.get('name',''))[:140],
                 'lat':lat,'lon':lon,'mentionCount':count,
                 'sourceType':'secondary_public_news','verification':'UNVERIFIED_CONTEXT',
                 'legalConclusion':'NOT_DETERMINED'})
        except (KeyError,TypeError,ValueError,IndexError,AttributeError):continue
    cov=raw.get('coverage')
    return {'items':items,'coverage':cov if isinstance(cov,dict) else None}

@router.get('/status')
def status():return osint_status()

@router.post('/news')
async def search_news(params:NewsSearch):
    state=osint_status()
    if not state['enabled']:
        raise HTTPException(503,'OpenOSINT dinonaktifkan. Atur SIMPUL_PUBLIC_OSINT_ENABLED=1 pada backend, setelah memasang dependensi opsional.')
    if not state['installed']:
        raise HTTPException(503,'OpenOSINT belum terpasang. Jalankan pip install -r server/requirements-openosint.txt di lingkungan backend.')
    bbox=bounding_box(params.lat,params.lon,params.radius_km)
    try:
        raw=await asyncio.wait_for(_openosint_news(params.topic,bbox,params.minutes),timeout=23)
    except asyncio.TimeoutError:
        raise HTTPException(504,'Batas waktu pengambilan berita publik habis.')
    except Exception:
        raise HTTPException(502,'Provider OpenOSINT gagal. Periksa log server tanpa membocorkan token.')
    parsed=_extract_news(raw)
    return {'provider':'OpenOSINT / GDELT GKG','tool':'search_gdelt_geo',
      'queriedAt':datetime.now(timezone.utc).isoformat(),
      'topic':params.topic,'query':TOPICS[params.topic],'requestedMinutes':params.minutes,
      'bbox':list(bbox),'locationType':'geolocated_mention_not_event_location',
      'dataset':'public_news_context','surveyData':False,'enforcementEnabled':False,
      'legalConclusion':'NOT_DETERMINED', 'notice':NOTICE,**parsed}
