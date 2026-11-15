"""Independent, versioned extension API for contextual mobility data."""
from __future__ import annotations
from datetime import date
from fastapi import APIRouter, Query
from . import context_plus as ctx
from . import routing

router=APIRouter(prefix='/api',tags=['Mobility context+', 'Accessibility routing'])
Latitude=Query(ge=-90,le=90)
Longitude=Query(ge=-180,le=180)

@router.get('/geo/reverse')
def reverse(lat:float=Latitude,lon:float=Longitude):return ctx.reverse_geocode(lat,lon)

@router.get('/geo/crossings')
def crossings(lat:float=Latitude,lon:float=Longitude):return ctx.crossing_inventory(lat,lon)

@router.get('/context/air-quality')
def quality(lat:float=Latitude,lon:float=Longitude):return ctx.air_quality(lat,lon)

@router.get('/context/forecast')
def forecast(lat:float=Latitude,lon:float=Longitude):return ctx.rain_forecast(lat,lon)

@router.get('/context/history')
def history(lat:float=Latitude,lon:float=Longitude,day:date=Query(...)):return ctx.historical_weather(lat,lon,day)

@router.get('/context/elevation')
def elevation(lat:float=Latitude,lon:float=Longitude):return ctx.elevation(lat,lon)

@router.get('/context/holidays')
def holidays(year:int=Query(default=2026,ge=2020,le=2035)):return ctx.holidays(year)

@router.get('/accessibility/route')
def route(lat:float=Latitude,lon:float=Longitude,
          destLat:float=Query(ge=-90,le=90),destLon:float=Query(ge=-180,le=180),
          mode:str=Query(default='foot-walking',pattern='^(foot-walking|wheelchair|driving-car)$')):
    return routing.directions(lat,lon,destLat,destLon,mode)

@router.get('/accessibility/isochrone')
def isochrone(lat:float=Latitude,lon:float=Longitude,minutes:int=Query(default=10,ge=3,le=20)):
    return routing.isochrone(lat,lon,minutes)
