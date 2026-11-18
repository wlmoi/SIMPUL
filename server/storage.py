"""Single-host SQLite demonstration storage. NO AUTH, NOT MULTI-TENANT OR PRODUCTION."""
from __future__ import annotations
import json
import os
import sqlite3
import threading
from pathlib import Path
from fastapi import HTTPException
from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import datetime
from typing import Literal

DB=Path(os.getenv('SIMPUL_DB_PATH',str(Path(__file__).parent/'data'/'simpul.sqlite3')))
_lock=threading.Lock()

class Event(BaseModel):
    id:str=Field(min_length=3,max_length=80,pattern=r'^[a-zA-Z0-9_-]+$')
    at:str=Field(min_length=8,max_length=45)
    type:Literal['Jemput','Turun','Menunggu']
    vehicle:Literal['Mobil','Motor','Bus','Angkutan pengumpan','Lainnya']
    duration:float=Field(ge=0,le=3600)
    zone:str=Field(min_length=1,max_length=80)
    source:Literal['manual']
    note:str=Field(default='',max_length=500)
    sessionId:str|None=Field(default=None,max_length=80)
    zoneContext:Literal['unknown','designated_pickup','general_road','signed_no_stopping','signed_no_parking']='unknown'
    laneBlocked:Literal['unknown','yes','no']='unknown'
    pedestrianBlocked:Literal['unknown','yes','no']='unknown'
    queueObserved:Literal['unknown','yes','no']='unknown'
    signageVerified:bool=False
    evidenceReference:str=Field(default='',max_length=80,pattern=r'^[a-zA-Z0-9:_-]*$')

    @model_validator(mode='after')
    def check_signage(self):
        if self.signageVerified and not self.evidenceReference:
            raise ValueError('Verified signage requires an observation reference ID.')
        return self

    @field_validator('at')
    @classmethod
    def check_observation_time(cls, value: str) -> str:
        try:
            stamp=datetime.fromisoformat(value.replace('Z','+00:00'))
        except ValueError as exc:
            raise ValueError('Tanggal harus ISO 8601.') from exc
        if stamp.tzinfo is None or not 2000 <= stamp.year <= 2100:
            raise ValueError('Waktu observasi harus memiliki zona waktu.')
        return value

class EventBatch(BaseModel):
    items:list[Event]=Field(min_length=1,max_length=500)

class _ManagedConnection(sqlite3.Connection):
    """Commit/rollback on context exit, then release the database handle."""
    def __exit__(self, *args):
        try:
            return super().__exit__(*args)
        finally:
            self.close()


def connect():
    DB.parent.mkdir(parents=True,exist_ok=True)
    c=sqlite3.connect(DB,timeout=8,factory=_ManagedConnection)
    c.execute('PRAGMA journal_mode=WAL')
    c.execute('PRAGMA busy_timeout=8000')
    c.execute('CREATE TABLE IF NOT EXISTS observations (id TEXT PRIMARY KEY, content TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP)')
    c.execute('''CREATE TABLE IF NOT EXISTS telemetry_outbox (
        event_id TEXT PRIMARY KEY, content TEXT NOT NULL,
        queued_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        delivered_at TEXT,
        last_error TEXT NOT NULL DEFAULT ''
    )''')
    c.execute('CREATE TABLE IF NOT EXISTS schema_migration (name TEXT PRIMARY KEY)')
    if not c.execute("SELECT 1 FROM schema_migration WHERE name='outbox-v1'").fetchone():
        # Backfill previously-synced manual observations on the first upgrade.
        c.execute("""INSERT OR IGNORE INTO telemetry_outbox(event_id,content)
                     SELECT id,content FROM observations
                     WHERE json_valid(content) AND json_extract(content,'$.source')='manual' """)
        c.execute("INSERT OR IGNORE INTO schema_migration(name) VALUES ('outbox-v1')")
        c.commit()
    return c

def sync(items:list[Event]):
    with _lock:
        with connect() as c:
            inserted_count=0
            # Preflight all supplied IDs before writing anything in this batch.
            seen = {}
            for item in items:
                record = item.model_dump(mode='json')
                if item.id in seen and seen[item.id] != record:
                    raise HTTPException(409, 'ID observasi berulang dengan isi berbeda pada batch yang sama.')
                seen[item.id] = record
                existing = c.execute('SELECT content FROM observations WHERE id=?', (item.id,)).fetchone()
                if existing and json.loads(existing[0]) != record:
                    raise HTTPException(409, 'ID observasi sudah tersimpan dengan isi berbeda; tidak ditimpa.')
            for item in items:
                encoded=item.model_dump_json()
                inserted=c.execute('INSERT OR IGNORE INTO observations(id,content) VALUES (?,?)', (item.id,encoded))
                if inserted.rowcount:
                    inserted_count+=1
                    c.execute('INSERT OR IGNORE INTO telemetry_outbox(event_id,content) VALUES (?,?)', (item.id,encoded))
            inserted=inserted_count
    # Log successful syncs and inserted records without leaking free-text notes.
    if inserted:
        from .monitoring import record_event
        record_event('observations','batch_synced',source='mobile',detail=f'{inserted} new records')
    from .timeseries import deliver_pending
    telemetry=deliver_pending(batch_limit=100)
    return {'received':len(items),'inserted':inserted,'alreadyPresent':len(items)-inserted,
            'storage':'sqlite_local_demo', 'telemetry':telemetry,
            'warning':'Tanpa login: jangan gunakan untuk data sensitif atau server publik.'}

def list_events():
    with connect() as c: rows=c.execute('SELECT content FROM observations ORDER BY created_at ASC,id ASC LIMIT 3000').fetchall()
    return {'items':[json.loads(x[0]) for x in rows],'count':len(rows),'storage':'sqlite_local_demo'}

def summary():
    records=list_events()['items']
    by_type={};by_zone={};durations=[]
    for r in records:
        by_type[r['type']]=by_type.get(r['type'],0)+1
        by_zone[r['zone']]=by_zone.get(r['zone'],0)+1
        durations.append(r['duration'])
    return {'count':len(records),'meanDwellSec':round(sum(durations)/len(durations),1) if durations else None,
      'byType':by_type,'byZone':by_zone,'dataset':'manual local server; no independent verification'}
