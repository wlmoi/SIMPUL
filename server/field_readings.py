"""Structured manual field snapshots for the SIMPUL diagnosis and before/after workflow.

This is a single-host, unauthenticated demo API. SQLite is authoritative; InfluxDB
receives low-cardinality numeric time series through a retryable outbox. Public
exposure requires auth, organization isolation, and HTTPS.
"""
from __future__ import annotations
from datetime import datetime
import json
import sqlite3
import threading
from typing import Literal
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator, model_validator
from . import storage, timeseries

router=APIRouter(prefix='/api/field-readings',tags=['Manual field intervals'])
_lock=threading.RLock()

class FieldReading(BaseModel):
    id:str=Field(min_length=3,max_length=80,pattern=r'^[A-Za-z0-9_-]+$')
    at:str=Field(min_length=15,max_length=45)
    recordedAt:str|None=Field(default=None,min_length=15,max_length=45)
    phase:Literal['baseline','followup']
    scenario:Literal['A0','A1','A2']
    period:Literal['Jam sibuk','Luar jam sibuk']
    zone:Literal['Zona A','Zona B','Zona C']
    minutes:int=Field(ge=5,le=240)
    passingVehicles:int=Field(ge=0,le=50000)
    stoppedVehicles:int=Field(ge=0,le=50000)
    maxQueue:int=Field(ge=0,le=2000)
    accessMeters:int=Field(ge=0,le=10000)
    pedestrians:int=Field(ge=0,le=50000)
    blockedAccess:bool
    availableBays:int=Field(ge=0,le=1000)
    occupiedBays:int=Field(ge=0,le=1000)
    source:Literal['manual']
    sessionId:str|None=Field(default=None,max_length=80)
    note:str=Field(default='',max_length=400)

    @field_validator('at','recordedAt')
    @classmethod
    def timestamp(cls,value):
        if value is None:return value
        try: dt=datetime.fromisoformat(value.replace('Z','+00:00'))
        except (TypeError,ValueError) as exc: raise ValueError('Timestamp harus ISO8601') from exc
        if dt.tzinfo is None or dt.year<2000 or dt.year>2100: raise ValueError('Timestamp harus berzona waktu')
        return value

    @model_validator(mode='after')
    def internal_consistency(self):
        if self.phase=='baseline' and self.scenario!='A0':
            raise ValueError('Baseline harus skenario A0')
        if self.stoppedVehicles>self.passingVehicles:
            raise ValueError('Kendaraan berhenti melebihi kendaraan lewat')
        if self.availableBays==0 and self.occupiedBays>0:
            raise ValueError('Kapasitas tidak diketahui, jumlah terisi harus 0')
        if self.availableBays>0 and self.occupiedBays>self.availableBays:
            raise ValueError('Kapasitas ruang jemput terlampaui')
        return self

class FieldBatch(BaseModel):
    items:list[FieldReading]=Field(min_length=1,max_length=500)

def init(c):
    c.execute('''CREATE TABLE IF NOT EXISTS field_readings(
          id TEXT PRIMARY KEY,content TEXT NOT NULL,created_at TEXT DEFAULT CURRENT_TIMESTAMP)''')
    c.execute('''CREATE TABLE IF NOT EXISTS field_outbox(
          id TEXT PRIMARY KEY,content TEXT NOT NULL,queued_at TEXT DEFAULT CURRENT_TIMESTAMP,
          delivered_at TEXT,last_error TEXT DEFAULT '')''')

def read_all(limit=3000):
    with storage.connect() as c:
        init(c)
        rows=c.execute('SELECT content FROM field_readings ORDER BY created_at,id LIMIT ?', (limit,)).fetchall()
    return [json.loads(r[0]) for r in rows]

@router.post('/sync')
def sync(batch:FieldBatch):
    with _lock:
        with storage.connect() as c:
            init(c)
            inserted=0
            for item in batch.items:
                content=item.model_dump_json()
                existing=c.execute('SELECT content FROM field_readings WHERE id=?',(item.id,)).fetchone()
                if existing:
                    if json.loads(existing[0])!=item.model_dump(mode='json'):
                        raise HTTPException(409,detail='ID interval sudah ada dengan data berbeda; tidak ditimpa')
                    continue
                c.execute('INSERT INTO field_readings(id,content) VALUES(?,?)',(item.id,content))
                c.execute('INSERT OR IGNORE INTO field_outbox(id,content) VALUES(?,?)',(item.id,content))
                inserted+=1
    if inserted:
        from .monitoring import record_event
        record_event('field_intervals','batch_synced',source='mobile',detail=f'{inserted} manual intervals')
    telemetry=timeseries.deliver_field_pending(batch_limit=100)
    return {'received':len(batch.items),'inserted':inserted,'alreadyPresent':len(batch.items)-inserted,
      'telemetry':telemetry,'storage':'sqlite_local_demo','warning':'Backend belum memiliki autentikasi; jangan diekspos ke internet.'}

@router.get('')
def list_readings():
    rows=read_all()
    return {'items':rows,'count':len(rows),'source':'manual','verified':False}

@router.get('/summary')
def summary():
    rows=read_all()
    phases={}
    for phase in ('baseline','followup'):
        events=[r for r in rows if r['phase']==phase]
        minutes=sum(r['minutes'] for r in events)
        phases[phase]={'samples':len(events),'minutes':minutes,'vehiclesPerHour':round(sum(r['passingVehicles'] for r in events)*60/minutes,1) if minutes else None,
          'stopsPerHour':round(sum(r['stoppedVehicles'] for r in events)*60/minutes,1) if minutes else None,
          'blockedIntervals':sum(bool(r['blockedAccess']) for r in events)}
    return {'count':len(rows),'phases':phases,'verified':False,
      'note':'Nilai merupakan agregat input manual; perbandingan fase belum mengendalikan faktor perancu.'}
