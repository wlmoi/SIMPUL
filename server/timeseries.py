"""Optional InfluxDB OSS v2 telemetry exporter for manual SIMPUL observations.

SQLite remains the canonical dataset. A transactionally-created SQLite outbox
keeps measurements pending if the time-series service cannot be reached.
Never export notes, image data, person identifiers, demo observations or API keys.
"""
from __future__ import annotations

import hashlib
import os
import threading
from datetime import datetime, timezone
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlsplit
from urllib.request import Request, urlopen

_delivery_lock = threading.Lock()
_runtime = {'lastSuccessfulWrite': None, 'lastFailureCategory': None, 'lastAttemptAt': None}


def configured() -> bool:
    return bool(os.getenv('INFLUXDB_URL') and os.getenv('INFLUXDB_TOKEN') and
                os.getenv('INFLUXDB_ORG') and os.getenv('INFLUXDB_BUCKET'))


def _config() -> tuple[str, str, str, str]:
    base = os.getenv('INFLUXDB_URL', '').rstrip('/')
    parts = urlsplit(base)
    if parts.scheme not in ('http', 'https') or not parts.hostname or parts.username or parts.password or parts.query or parts.fragment:
        raise ValueError('INFLUXDB_URL harus merupakan alamat HTTP(S) yang valid.')
    return base, os.environ['INFLUXDB_TOKEN'], os.environ['INFLUXDB_ORG'], os.environ['INFLUXDB_BUCKET']


def _tag(text: str) -> str:
    return str(text).replace('\\', '\\\\').replace(' ', '\\ ').replace(',', '\\,').replace('=', '\\=')


def observation_line(event: dict) -> str:
    """Line protocol: low-cardinality tags + deterministic ns timestamp.

    A sub-microsecond stable offset accommodates simultaneous events without
    introducing high-cardinality event ID tags. Event ID retained as a field.
    """
    if event.get('source') != 'manual':
        raise ValueError('Only manual records are eligible for InfluxDB export.')
    dt = datetime.fromisoformat(str(event['at']).replace('Z', '+00:00'))
    if dt.tzinfo is None or not 2000 <= dt.year <= 2100:
        raise ValueError('Observation timestamp requires a timezone and valid year.')
    utc = dt.astimezone(timezone.utc)
    ns = int(utc.timestamp()) * 1_000_000_000 + utc.microsecond * 1000
    ns += int.from_bytes(hashlib.blake2b(str(event['id']).encode(), digest_size=2).digest(), 'big') % 1000
    duration = float(event['duration'])
    if not 0 <= duration <= 3600:
        raise ValueError('Duration out of range.')
    from .traffic_classification import classify_record
    triage=classify_record(event)
    # Notes and free-form sensor data intentionally excluded from telemetry.
    tags = ','.join(f'{key}={_tag(event[key2])}' for key, key2 in (
        ('zone', 'zone'), ('event_type', 'type'), ('vehicle', 'vehicle'))) + ',priority=' + _tag(triage['priority'])
    event_id = str(event['id']).replace('\\', '\\\\').replace('"', '\\"')
    return f'simpul_traffic_event,{tags},source=manual count=1i,dwell_seconds={duration:.3f},event_id="{event_id}" {ns}'


def pending_summary() -> dict:
    from . import storage
    with storage.connect() as c:
        c.execute('''CREATE TABLE IF NOT EXISTS telemetry_outbox (
            event_id TEXT PRIMARY KEY, content TEXT NOT NULL,
            queued_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            delivered_at TEXT,
            last_error TEXT NOT NULL DEFAULT ''
        )''')
        queued = c.execute('SELECT COUNT(*) FROM telemetry_outbox WHERE delivered_at IS NULL').fetchone()[0]
        delivered = c.execute('SELECT COUNT(*) FROM telemetry_outbox WHERE delivered_at IS NOT NULL').fetchone()[0]
    return {'pending': queued, 'delivered': delivered}


def field_pending_summary() -> dict:
    from . import storage
    with storage.connect() as c:
        c.execute('''CREATE TABLE IF NOT EXISTS field_outbox(id TEXT PRIMARY KEY,content TEXT NOT NULL,queued_at TEXT DEFAULT CURRENT_TIMESTAMP,delivered_at TEXT,last_error TEXT DEFAULT '')''')
        pending=c.execute('SELECT COUNT(*) FROM field_outbox WHERE delivered_at IS NULL').fetchone()[0]
        delivered=c.execute('SELECT COUNT(*) FROM field_outbox WHERE delivered_at IS NOT NULL').fetchone()[0]
    return {'pending':pending,'delivered':delivered}


def status(*, probe: bool = False) -> dict:
    result = {'configured': configured(), 'provider': 'InfluxDB OSS 2.x',
              'backendOnly': True, 'transport': 'HTTP line protocol',
              'enabled': configured(), **pending_summary(), 'fieldIntervals':field_pending_summary(), **_runtime}
    if probe and configured():
        try:
            base, _, _, _ = _config()
            with urlopen(Request(base + '/health', headers={'Accept': 'application/json'}), timeout=2.5) as response:
                result['reachable'] = 200 <= response.status < 300
        except (HTTPError, URLError, TimeoutError, ValueError):
            result['reachable'] = False
    else:
        result['reachable'] = None
    return result


def deliver_pending(*, batch_limit: int = 100) -> dict:
    """Best-effort delivery. On failure observations remain in SQLite for retry.

    Repeating a successful write is stable because each event has the same tags,
    timestamp, and fields; an Influx point with the same series/timestamp replaces
    field values rather than incrementing a counter in storage.
    """
    if not configured():
        return {'status': 'disabled', **pending_summary()}
    if not _delivery_lock.acquire(blocking=False):
        return {'status': 'busy', **pending_summary()}
    try:
        from . import storage
        with storage.connect() as c:
            rows = c.execute('SELECT event_id,content FROM telemetry_outbox WHERE delivered_at IS NULL ORDER BY queued_at,event_id LIMIT ?', (max(1, min(int(batch_limit), 500)),)).fetchall()
        if not rows:
            return {'status': 'up_to_date', 'written': 0, **pending_summary()}
        import json
        lines = [observation_line(json.loads(item[1])) for item in rows]
        base, token, org, bucket = _config()
        query = urlencode({'org': org, 'bucket': bucket, 'precision': 'ns'})
        request = Request(base + '/api/v2/write?' + query, data='\n'.join(lines).encode('utf-8'), method='POST',
                          headers={'Authorization': 'Token ' + token, 'Content-Type': 'text/plain; charset=utf-8'})
        _runtime['lastAttemptAt'] = datetime.now(timezone.utc).isoformat(timespec='seconds')
        try:
            with urlopen(request, timeout=3.0) as response:
                if response.status not in (200, 201, 204):
                    raise RuntimeError('unexpected_status')
        except (HTTPError, URLError, TimeoutError, RuntimeError, OSError) as exc:
            # Preserve safe failure classes only: never surface response bodies or tokens.
            error = 'http_error' if isinstance(exc, HTTPError) else ('network_error' if isinstance(exc, (URLError, TimeoutError, OSError)) else 'unexpected_status')
            _runtime['lastFailureCategory'] = error
            return {'status': 'retry_pending', 'reason': error, 'written': 0, **pending_summary()}
        ids = [item[0] for item in rows]
        with storage.connect() as c:
            c.executemany("UPDATE telemetry_outbox SET delivered_at = CURRENT_TIMESTAMP,last_error = '' WHERE event_id = ?", [(x,) for x in ids])
        _runtime['lastSuccessfulWrite'] = datetime.now(timezone.utc).isoformat(timespec='seconds')
        _runtime['lastFailureCategory'] = None
        return {'status': 'delivered', 'written': len(ids), **pending_summary()}
    except (ValueError, KeyError) as exc:
        _runtime['lastFailureCategory'] = 'invalid_configuration_or_record'
        return {'status': 'retry_pending', 'reason': 'invalid_configuration_or_record', 'written': 0, **pending_summary()}
    finally:
        _delivery_lock.release()

# Second telemetry series: interval-based traffic and pedestrian-access evidence.
def field_reading_line(r: dict) -> str:
    if r.get('source')!='manual':
        raise ValueError('Field telemetry accepts manual records only.')
    dt=datetime.fromisoformat(str(r['at']).replace('Z','+00:00'))
    if dt.tzinfo is None:
        raise ValueError('Timestamp needs timezone.')
    utc=dt.astimezone(timezone.utc)
    ns=int(utc.timestamp())*1_000_000_000+utc.microsecond*1000
    ns+=int.from_bytes(hashlib.blake2b(str(r['id']).encode(),digest_size=2).digest(),'big')%1000
    fields={'minutes':int(r['minutes']),'passing':int(r['passingVehicles']),
        'stopped':int(r['stoppedVehicles']),'max_queue':int(r['maxQueue']),
        'access_meters':int(r['accessMeters']),'pedestrians':int(r['pedestrians']),
        'blocked':int(bool(r['blockedAccess'])),'bay_capacity':int(r['availableBays']),
        'bay_occupied':int(r['occupiedBays'])}
    if not 5<=fields['minutes']<=240 or fields['stopped']>fields['passing']:
        raise ValueError('Field reading out of range or inconsistent.')
    tags=','.join(f'{k}={_tag(r[k2])}' for k,k2 in (('zone','zone'),('phase','phase'),('scenario','scenario'),('period','period')))
    # IDs, free-text notes and human-identifiable information excluded.
    values=','.join(f'{key}={value}i' for key,value in fields.items())
    return f'simpul_field_interval,{tags},source=manual {values} {ns}'


def deliver_field_pending(*,batch_limit:int=100)->dict:
    """Retry-safe export. Timestamp remains stable on retries for each record."""
    if not configured(): return {'status':'disabled'}
    if not _delivery_lock.acquire(blocking=False): return {'status':'busy'}
    try:
        from . import storage
        with storage.connect() as c:
            c.execute('''CREATE TABLE IF NOT EXISTS field_outbox(id TEXT PRIMARY KEY,content TEXT NOT NULL,queued_at TEXT DEFAULT CURRENT_TIMESTAMP,delivered_at TEXT,last_error TEXT DEFAULT '')''')
            rows=c.execute('SELECT id,content FROM field_outbox WHERE delivered_at IS NULL ORDER BY queued_at,id LIMIT ?', (max(1,min(int(batch_limit),500)),)).fetchall()
        if not rows:return {'status':'up_to_date','written':0}
        import json
        lines=[field_reading_line(json.loads(row[1])) for row in rows]
        base,token,org,bucket=_config()
        query=urlencode({'org':org,'bucket':bucket,'precision':'ns'})
        req=Request(base+'/api/v2/write?'+query, data='\n'.join(lines).encode(),method='POST',
                    headers={'Authorization':'Token '+token,'Content-Type':'text/plain; charset=utf-8'})
        try:
            with urlopen(req,timeout=3) as resp:
                if resp.status not in (200,201,204):raise RuntimeError('Unexpected Influx status')
        except (HTTPError,URLError,TimeoutError,OSError,RuntimeError):
            return {'status':'retry_pending','reason':'time_series_unreachable','written':0}
        with storage.connect() as c:
            c.executemany("UPDATE field_outbox SET delivered_at=CURRENT_TIMESTAMP,last_error='' WHERE id=?",[(r[0],) for r in rows])
        return {'status':'delivered','written':len(rows)}
    except (ValueError,KeyError):
        return {'status':'retry_pending','reason':'invalid_record_or_configuration','written':0}
    finally:
        _delivery_lock.release()
