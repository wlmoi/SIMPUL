"""Local contract tests; fake InfluxDB transport, no Docker or external network."""
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch
from datetime import datetime, timezone
import json, sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from fastapi.testclient import TestClient
from server.app import app
from server import storage, timeseries

client = TestClient(app)

class Reply:
    status = 204
    def __enter__(self): return self
    def __exit__(self, *args): return False


def run():
    stamp = datetime.now(timezone.utc).isoformat()
    item = {'id':'manual-monitor-001','at':stamp,'type':'Jemput','vehicle':'Mobil',
            'duration':37.0,'zone':'Zona A', 'source':'manual','note':'sensitive narrative should never enter InfluxDB',
            'sessionId':'ses-001'}
    with TemporaryDirectory() as d:
        original = storage.DB
        storage.DB = Path(d)/'scratch.sqlite3'
        try:
            no_key = client.get('/api/monitor/stream/status')
            assert no_key.status_code == 200
            assert no_key.json()['configured'] is False
            assert client.post('/api/monitor/stream/flush').json()['status']=='disabled'
            first = client.post('/api/observations/sync',json={'items':[item]})
            assert first.status_code==200,first.text
            assert first.json()['inserted']==1,first.text
            assert first.json()['telemetry']['pending']==1
            duplicate = client.post('/api/observations/sync',json={'items':[item]})
            assert duplicate.status_code==200 and duplicate.json()['inserted']==0
            assert client.get('/api/monitor/stream/status').json()['pending']==1
            assert client.get('/api/monitor/summary').json()['count']==1
            invalid=client.post('/api/observations/sync',json={'items':[{**item,'id':'second','source':'demo'}]})
            assert invalid.status_code==422
            invalid=client.post('/api/observations/sync',json={'items':[{**item,'id':'third','at':'2026-11-15T13:00:00'}]})
            assert invalid.status_code==422
            payloads=[]
            def fake_request(request, timeout):
                assert 'api/v2/write' in request.full_url
                assert request.headers['Authorization'].startswith('Token ')
                payloads.append(request.data.decode())
                return Reply()
            env={'INFLUXDB_URL':'http://influxdb:8086','INFLUXDB_TOKEN':'test-token','INFLUXDB_ORG':'simpul', 'INFLUXDB_BUCKET':'observations'}
            with patch.dict('os.environ',env),patch.object(timeseries,'urlopen',side_effect=fake_request):
                r=client.post('/api/monitor/stream/flush')
                assert r.status_code==200,r.text
                assert r.json()['status']=='delivered' and r.json()['written']==1
                assert r.json()['pending']==0 and r.json()['delivered']==1
                assert 'sensitive narrative' not in payloads[0]
                assert 'source=manual' in payloads[0] and 'count=1i' in payloads[0]
                assert 'dwell_seconds=37.000' in payloads[0]
                assert len(payloads)==1
                # Stable points permit retry without increasing counts in InfluxDB.
                assert timeseries.observation_line(item)==timeseries.observation_line(item)
                repeat=client.post('/api/monitor/stream/flush').json()
                assert repeat['status']=='up_to_date' and repeat['written']==0
            from urllib.error import URLError
            other={**item,'id':'manual-monitor-002'}
            with patch.dict('os.environ',env),patch.object(timeseries,'urlopen',side_effect=URLError('down')):
                retry=client.post('/api/observations/sync',json={'items':[other]})
                assert retry.status_code==200 and retry.json()['inserted']==1
                assert retry.json()['telemetry']['status']=='retry_pending'
                assert retry.json()['telemetry']['pending']==1
                # SQLite remains authoritative through Influx outage.
                assert client.get('/api/observations/summary').json()['count']==2
            with patch.dict('os.environ',env),patch.object(timeseries,'urlopen',side_effect=fake_request):
                again=client.post('/api/monitor/stream/flush').json()
                assert again['written']==1 and again['pending']==0
            assert client.get('/api/monitor/logs?limit=5').status_code==200
        finally:
            storage.DB=original
    # Upgrade from v0.5 SQLite: existing manual records are backfilled once.
    with TemporaryDirectory() as d:
        legacy=Path(d)/'legacy.sqlite3'
        import sqlite3
        with sqlite3.connect(legacy) as c:
            c.execute('CREATE TABLE observations (id TEXT PRIMARY KEY, content TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP)')
            c.execute('INSERT INTO observations(id,content) VALUES (?,?)',('legacy-evt',json.dumps({**item,'id':'legacy-evt'})))
        c.close()  # sqlite context commits the fixture; Windows also needs handle closure.
        original=storage.DB;storage.DB=legacy
        try:
            s=client.get('/api/monitor/stream/status').json()
            assert s['pending']==1 and s['delivered']==0,s
            again=client.get('/api/monitor/stream/status').json()
            assert again['pending']==1
        finally:
            storage.DB=original
    print('PASS timeseries: SQLite outbox, legacy backfill, source filtering, ISO timestamps, mocked HTTP write, no notes leakage, outage retries, idempotence')

if __name__=='__main__':run()
