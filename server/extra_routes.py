"""Independent FastAPI router for external adapters and local observation persistence."""
from __future__ import annotations
import os
from fastapi import APIRouter,Query,HTTPException
from pydantic import BaseModel, Field
from . import providers,storage

router=APIRouter(prefix='/api',tags=['External integrations'])

class AIInput(BaseModel):
    count:int=Field(ge=1,le=100000)
    meanDwellSec:float=Field(ge=0,le=3600)
    byType:dict[str,int]=Field(default_factory=dict,max_length=12)
    byZone:dict[str,int]=Field(default_factory=dict,max_length=20)

@router.get('/integrations')
def integrations():
    return {'geo':{'enabled':True,'provider':'Nominatim / OSM','note':'Manual search; ≤1 request/s; prototyping only'},
       'nearby':{'enabled':True,'provider':'Overpass / OSM','note':'On-demand OSM objects; no live vehicle count'},
       'weather':{'enabled':True,'provider':'Open-Meteo','note':'Context data, not congestion; check commercial terms'},
       'gemini':{'enabled':bool(os.getenv('GEMINI_API_KEY')),'provider':'Google Gemini','note':'Requires server-side GEMINI_API_KEY'},
       'traffic':{'enabled':bool(os.getenv('TOMTOM_API_KEY')),'provider':'TomTom Traffic Flow','note':'Optional API key; nearest-road speed, not stopping event counts'},
       'storage':{'enabled':True,'provider':'SQLite','note':'Development-only, no authentication'},
       'simulation':{'enabled':False,'provider':'SUMO','note':'Inspect /api/status for engine readiness'},
       'reverse':{'enabled':True,'provider':'Nominatim / OSM','note':'Manual reverse geocoding, throttled with forward geocoding'},
       'crossings':{'enabled':True,'provider':'Overpass OSM','note':'Crossing/kerb metadata; not an accessibility audit'},
       'forecast':{'enabled':True,'provider':'Open-Meteo Forecast','note':'Next 12h precipitation forecast; contextual only'},
       'history':{'enabled':True,'provider':'Open-Meteo ERA5','note':'Historic reanalysis, >= 7 days old'},
       'airquality':{'enabled':True,'provider':'Open-Meteo CAMS','note':'Gridded air quality estimates, not local sensor'},
       'elevation':{'enabled':True,'provider':'Copernicus DEM GLO-90','note':'90m terrain height, not curb slope'},
       'holidays':{'enabled':True,'provider':'Nager.Holidays v4','note':'Check against official Indonesian calendar'},
       'routing':{'enabled':bool(os.getenv('ORS_API_KEY')),'provider':'openrouteservice','note':'Needs ORS_API_KEY on server; route foot/wheelchair/drive'},
       'isochrone':{'enabled':bool(os.getenv('ORS_API_KEY')),'provider':'openrouteservice','note':'Needs ORS_API_KEY; walking time-reach envelope'}}

@router.get('/geo/search')
def search(q:str=Query(min_length=3,max_length=120)):
    return {'provider':'OpenStreetMap Nominatim','results':providers.geocode(q),'attribution':'© OpenStreetMap contributors'}

@router.get('/geo/nearby')
def nearby(lat:float=Query(ge=-90,le=90),lon:float=Query(ge=-180,le=180)):
    return providers.nearby(lat,lon)

@router.get('/context/weather')
def weather(lat:float=Query(ge=-90,le=90),lon:float=Query(ge=-180,le=180)):
    return providers.weather(lat,lon)

@router.get('/traffic/live')
def live_traffic(lat:float=Query(ge=-90,le=90),lon:float=Query(ge=-180,le=180)):
    return providers.tomtom_flow(lat,lon)

@router.post('/ai/insights')
def ai_insights(aggregate:AIInput):
    return providers.gemini_insights(aggregate.model_dump())

@router.post('/observations/sync')
def observations_sync(batch:storage.EventBatch):
    return storage.sync(batch.items)

@router.get('/observations')
def observations():return storage.list_events()

@router.get('/observations/summary')
def observations_summary():return storage.summary()
