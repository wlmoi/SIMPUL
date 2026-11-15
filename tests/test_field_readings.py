"""Run: python -m pytest -q tests/test_field_readings.py"""
import os, json, tempfile, importlib
from pathlib import Path
from fastapi.testclient import TestClient
from unittest.mock import patch

def payload(id='read-001'):
    return {'id':id,'at':'2026-11-15T09:00:00+07:00','phase':'baseline','scenario':'A0','period':'Jam sibuk',
     'zone':'Zona A','minutes':30,'passingVehicles':100,'stoppedVehicles':12,'maxQueue':8,
     'accessMeters':130,'pedestrians':50,'blockedAccess':False,'availableBays':4,
     'occupiedBays':2,'source':'manual','note':'pengukuran lapangan manual'}

def test_field_storage_and_integrity(monkeypatch,tmp_path):
    monkeypatch.setenv('SIMPUL_DB_PATH',str(tmp_path/'test.sqlite3'))
    monkeypatch.delenv('INFLUXDB_URL',raising=False)
    from server import storage,field_readings,timeseries,app
    storage.DB=tmp_path/'test.sqlite3'
    client=TestClient(app.app)
    r=client.post('/api/field-readings/sync',json={'items':[payload()]});assert r.status_code==200,r.text
    assert r.json()['inserted']==1 and r.json()['telemetry']['status']=='disabled'
    r=client.post('/api/field-readings/sync',json={'items':[payload()]});assert r.json()['inserted']==0 and r.json()['alreadyPresent']==1
    q=client.get('/api/field-readings/summary');assert q.status_code==200 and q.json()['phases']['baseline']['stopsPerHour']==24.0
    assert len(client.get('/api/field-readings').json()['items'])==1
    with storage.connect() as c: assert c.execute('SELECT COUNT(*) FROM field_outbox').fetchone()[0]==1
    changed={**payload(),'stoppedVehicles':13}
    r=client.post('/api/field-readings/sync',json={'items':[changed]});assert r.status_code==409
    assert client.post('/api/field-readings/sync',json={'items':[{**payload(),'source':'demo'}]}).status_code==422
    assert client.post('/api/field-readings/sync',json={'items':[{**payload(),'at':'2026-11-15T00:00:00'}]}).status_code==422
    assert client.post('/api/field-readings/sync',json={'items':[{**payload(),'stoppedVehicles':200}]}).status_code==422
    line=timeseries.field_reading_line(payload())
    assert line.startswith('simpul_field_interval,') and 'stopped=12i' in line
    assert 'pengukuran' not in line and 'read-001' not in line


def test_field_outbox_mocked_influx(monkeypatch,tmp_path):
    monkeypatch.setenv('SIMPUL_DB_PATH',str(tmp_path/'influx-test.sqlite3'))
    monkeypatch.setenv('INFLUXDB_URL','http://influxdb:8086')
    monkeypatch.setenv('INFLUXDB_TOKEN','test-only-not-real-token')
    monkeypatch.setenv('INFLUXDB_ORG','simpul')
    monkeypatch.setenv('INFLUXDB_BUCKET','simpul_observations')
    from server import storage,field_readings,timeseries,app
    storage.DB=tmp_path/'influx-test.sqlite3'
    requests=[]
    class FakeResponse:
        status=204
        def __enter__(self):return self
        def __exit__(self,*args):pass
    def fake_urlopen(request,timeout=3):
        requests.append(request)
        return FakeResponse()
    monkeypatch.setattr(timeseries,'urlopen',fake_urlopen)
    client=TestClient(app.app)
    item={**payload('mock-201'),'recordedAt':'2026-11-15T09:40:00+07:00'}
    response=client.post('/api/field-readings/sync',json={'items':[item]})
    assert response.status_code==200,response.text
    assert response.json()['telemetry']=={'status':'delivered','written':1}
    assert len(requests)==1
    line=requests[0].data.decode()
    assert 'simpul_field_interval' in line and 'scenario=A0' in line and 'max_queue=8i' in line
    assert 'pengukuran lapangan' not in line and 'test-only-not-real-token' not in line
    status=client.get('/api/monitor/stream/status').json()
    assert status['fieldIntervals']=={'pending':0,'delivered':1}
    assert client.post('/api/monitor/stream/flush').status_code==200
    assert len(requests)==1
