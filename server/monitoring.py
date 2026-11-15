"""Local-only monitoring projection and restricted app log.

Not a production audit ledger: no identity/authentication, no tamper-evident storage.
The service should NOT be bound publicly without auth/TLS.
"""
from __future__ import annotations
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Query
from fastapi.responses import PlainTextResponse, Response
from pathlib import Path
import csv, io, sqlite3, threading, time
from . import storage, timeseries

router=APIRouter(prefix='/api/monitor',tags=['Local monitoring'])
_monitor_lock=threading.RLock()
_request_stats={'total':0,'errors':0,'duration_sum':0.0,'duration_count':0}

def record_request(duration, status_code):
    with _monitor_lock:
        _request_stats['total']+=1
        _request_stats['duration_sum']+=max(0.0,duration)
        _request_stats['duration_count']+=1
        if status_code>=500:_request_stats['errors']+=1

def init_log(c):
    c.execute('''CREATE TABLE IF NOT EXISTS operational_logs (
        seq INTEGER PRIMARY KEY AUTOINCREMENT,
        at TEXT NOT NULL, category TEXT NOT NULL, action TEXT NOT NULL,
        level TEXT NOT NULL, source TEXT NOT NULL, ref_id TEXT NOT NULL DEFAULT '',
        detail TEXT NOT NULL DEFAULT '')''')
    c.execute('CREATE INDEX IF NOT EXISTS ix_operational_logs_at ON operational_logs(at)')

def record_event(category,action,source='backend',level='info',ref_id='',detail=''):
    """Safe, bounded application-origin event metadata only; no free-form secrets."""
    stamp=datetime.now(timezone.utc).isoformat(timespec='seconds')
    with _monitor_lock:
        with storage.connect() as c:
            init_log(c)
            c.execute('INSERT INTO operational_logs(at,category,action,level,source,ref_id,detail) VALUES (?,?,?,?,?,?,?)',
                     (stamp,category[:32],action[:48],level[:12],source[:20],ref_id[:80],detail[:160]))
            cutoff=(datetime.now(timezone.utc)-timedelta(days=90)).isoformat()
            c.execute('DELETE FROM operational_logs WHERE at < ?',(cutoff,))

def records(limit=80):
    with storage.connect() as c:
        init_log(c)
        rows=c.execute('SELECT seq,at,category,action,level,source,ref_id,detail FROM operational_logs ORDER BY seq DESC LIMIT ?', (limit,)).fetchall()
    fields=['seq','at','category','action','level','source','refId','detail']
    return [dict(zip(fields,row)) for row in rows]

def project_summary():
    with storage.connect() as c:
        init_log(c)
        count,mean,last=c.execute('SELECT COUNT(*),AVG(CAST(json_extract(content,"$.duration") AS REAL)),MAX(created_at) FROM observations').fetchone()
        total_logs=c.execute('SELECT COUNT(*) FROM operational_logs').fetchone()[0]
        day_counts=c.execute('''SELECT substr(json_extract(content,'$.at'),1,10) day,COUNT(*)
                                FROM observations GROUP BY day ORDER BY day DESC LIMIT 30''').fetchall()
    return {'count':count,'meanDwellSec':round(mean,2) if mean is not None else None,
            'lastStoredAt':last,'logCount':total_logs,'source':'manual observation SQLite only',
            'calibrated':False,'byDay':[{'date':d,'count':n} for d,n in reversed(day_counts)]}

@router.get('/stream/status')
def stream_status(probe:bool=False):
    return timeseries.status(probe=probe)

@router.post('/stream/flush')
def stream_flush():
    result=timeseries.deliver_pending(batch_limit=100)
    result['fieldIntervals']=timeseries.deliver_field_pending(batch_limit=100)
    return result

@router.get('/health')
def health():
    try:
        with storage.connect() as c:
            c.execute('SELECT 1').fetchone()
        database='ready'
    except sqlite3.Error: database='unavailable'
    return {'service':'SIMPUL local monitoring','database':database,'storage':'SQLite',
            'mode':'local development; no authentication','serverTime':datetime.now(timezone.utc).isoformat()}

@router.get('/summary')
def summary():return project_summary()

@router.get('/logs')
def logs(limit:int=Query(default=80,ge=1,le=500)):
    items=records(limit)
    return {'items':items,'count':len(items),'retentionDays':90,'dataClass':'operational metadata, not traffic measurement'}

@router.get('/logs.csv')
def export_logs():
    data=records(500)
    output=io.StringIO();writer=csv.writer(output)
    keys=['seq','at','category','action','level','source','refId','detail']
    writer.writerow(keys)
    for item in reversed(data):
        # Excel-style formula injection protection even if a future logger
        # accidentally includes untrusted text in its metadata.
        def safe_csv(value):
            if isinstance(value,str) and value.lstrip(' \t\r\n').startswith(('=','+','-','@')):
                return "'" + value
            return value
        writer.writerow([safe_csv(item[key]) for key in keys])
    return Response('\ufeff'+output.getvalue(),media_type='text/csv; charset=utf-8',headers={'Content-Disposition':'attachment; filename="SIMPUL_backend_logs.csv"'})

@router.get('/metrics',response_class=PlainTextResponse,include_in_schema=True)
def metrics():
    """Prometheus text 0.0.4, bounded labels, no personal data or dynamic paths."""
    summary=project_summary()
    with _monitor_lock:stats=dict(_request_stats)
    values=[
        ('simpul_observations_manual_total','gauge','Manual observation records in local SQLite',summary['count']),
        ('simpul_operational_log_entries','gauge','Current retained operational entries',summary['logCount']),
        ('simpul_api_requests_total','counter','API HTTP requests handled by this process',stats['total']),
        ('simpul_api_server_errors_total','counter','HTTP responses with status >= 500',stats['errors']),
        ('simpul_api_request_duration_seconds_sum','counter','Total API handling duration in seconds',round(stats['duration_sum'],6)),
        ('simpul_api_request_duration_seconds_count','counter','API handling duration observations',stats['duration_count'])
    ]
    parts=[]
    for name,kind,description,value in values:
        parts.extend([f'# HELP {name} {description}',f'# TYPE {name} {kind}',f'{name} {value}'])
    return PlainTextResponse('\n'.join(parts)+'\n',media_type='text/plain; version=0.0.4; charset=utf-8')
