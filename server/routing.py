"""Bounded OpenRouteService adapter for route and pedestrian access analysis.

The ORS_KEY is server-side. Geometry is from external data, not a calibrated
pedestrian microsimulation. No claim of step-free route verification is made.
"""
from __future__ import annotations
import json
import os
from datetime import datetime, timezone
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from fastapi import HTTPException
from .providers import USER_AGENT

ORS_BASE='https://api.openrouteservice.org/v2'
PROFILES={'foot-walking','wheelchair','driving-car'}

def _key():
    key=os.getenv('ORS_API_KEY','').strip()
    if not key:raise HTTPException(503,'ORS_API_KEY belum disetel pada server.')
    return key

def _fetch(path:str,*,body=None,timeout=25):
    key=_key()
    method='POST' if body is not None else 'GET'
    data=json.dumps(body).encode() if body is not None else None
    req=Request(ORS_BASE+path,data=data,method=method,
        headers={'User-Agent':USER_AGENT,'Accept':'application/json',
                 'Authorization':key,**({'Content-Type':'application/json'} if body is not None else {})})
    try:
        with urlopen(req,timeout=timeout) as response:raw=response.read(2_000_001)
        if len(raw)>2_000_000:raise HTTPException(502,'Geometri rute terlalu besar.')
        return json.loads(raw)
    except HTTPError as exc:
        if exc.code==429:raise HTTPException(429,'Kuota openrouteservice sedang habis; coba nanti.') from exc
        raise HTTPException(502,f'OpenRouteService HTTP {exc.code}. Periksa key dan titik rute.') from exc
    except (URLError,TimeoutError,ValueError) as exc:
        raise HTTPException(502,'Rute openrouteservice tidak dapat diproses.') from exc

def directions(lat:float,lon:float,dest_lat:float,dest_lon:float,mode:str):
    if mode not in PROFILES:raise HTTPException(422,'Mode rute tidak didukung.')
    if abs(dest_lat-lat)+abs(dest_lon-lon)<0.000025:
        raise HTTPException(422,'Titik asal dan tujuan terlalu berdekatan.')
    params=urlencode({'start':f'{lon:.6f},{lat:.6f}','end':f'{dest_lon:.6f},{dest_lat:.6f}'})
    raw=_fetch(f'/directions/{mode}?{params}')
    feats=raw.get('features') or []
    if not feats:raise HTTPException(502,'Provider tidak menemukan rute antara kedua titik.')
    feature=feats[0]
    summary=(feature.get('properties') or {}).get('summary') or {}
    coords=(feature.get('geometry') or {}).get('coordinates') or []
    if not coords:raise HTTPException(502,'Rute tidak mengandung geometri.')
    # Bounded frontend geometry payload; keep endpoints in output.
    if len(coords)>1100:
        step=max(1,len(coords)//1000)
        coords=coords[::step]
        if coords[-1] != feature['geometry']['coordinates'][-1]:coords.append(feature['geometry']['coordinates'][-1])
    return {'provider':'openrouteservice','profile':mode,'distanceM':round(float(summary.get('distance',0)),1),
       'durationSec':round(float(summary.get('duration',0)),1),'geometry':coords,
       'start':{'lat':lat,'lon':lon},'end':{'lat':dest_lat,'lon':dest_lon},
       'retrievedAtUTC':datetime.now(timezone.utc).isoformat(),
       'sourceKind':'map-based estimated route, not measured travel time',
       'warning':'Wheelchair profile is map-derived, not a guarantee of step-free physical access.' if mode=='wheelchair'
          else 'Route depends on community road-path data, not field verification.'}

def isochrone(lat:float,lon:float,minutes:int):
    if minutes<3 or minutes>20:raise HTTPException(422,'Radius waktu hanya 3 sampai 20 menit.')
    raw=_fetch('/isochrones/foot-walking',body={'locations':[[lon,lat]],'range':[minutes*60], 'range_type':'time'},timeout=30)
    feats=raw.get('features') or []
    if not feats:raise HTTPException(502,'Area jangkauan tidak tersedia untuk titik ini.')
    feature=feats[0];geometry=feature.get('geometry') or {}
    rings=geometry.get('coordinates') or []
    # Typical geojson polygon -> first ring. We deliberately do not claim area precision.
    if not rings:raise HTTPException(502,'Isochrone tidak mengandung poligon.')
    outer=rings[0] if geometry.get('type')=='Polygon' else (rings[0][0] if rings and rings[0] else [])
    if len(outer)>900:
        step=max(1,len(outer)//850);outer=outer[::step]
    return {'provider':'openrouteservice','mode':'foot-walking','minutes':minutes,'boundary':outer,
       'sourceKind':'modeled walking reachability; not validated site access',
       'warning':'Estimasi jangkauan tidak menguji keamanan penyeberangan, aksesibilitas aktual, atau gangguan lapangan.'}
