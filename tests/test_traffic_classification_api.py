"""Stateless traffic triage contract; no user data or police services are contacted."""
import sys
from pathlib import Path
from fastapi.testclient import TestClient
ROOT=Path(__file__).resolve().parent.parent
sys.path.insert(0,str(ROOT))
from server.app import app
from server.traffic_classification import classify_record
client=TestClient(app)

def evt(**changes):
    d={'id':'evt-manual-123','at':'2026-11-15T10:00:00+07:00','type':'Jemput','vehicle':'Mobil','duration':45,'zone':'Zona A','source':'manual','laneBlocked':'unknown','pedestrianBlocked':'unknown','queueObserved':'unknown','zoneContext':'unknown'}
    d.update(changes)
    return d

def test_taxonomy_and_rule_separation():
    d=client.get('/api/v1/traffic/taxonomy')
    assert d.status_code==200
    assert d.json()['policeIntegration'] is False
    assert d.json()['legalConclusion']=='NOT_DETERMINED'
    assert classify_record(evt(zoneContext='signed_no_parking'))['ruleFlag']=='unknown'
    assert classify_record(evt(zoneContext='signed_no_stopping',signageVerified=True,evidenceReference='ZONE-A-S1'))['ruleFlag']=='review_rule'

def test_api_priority_and_no_automatic_offence():
    r=client.post('/api/v1/traffic/classify',json={'items':[evt(pedestrianBlocked='yes'),evt(id='evt-456',laneBlocked='yes',pedestrianBlocked='no')]})
    assert r.status_code==200,r.text
    j=r.json()
    assert j['summary']=={'P1':1,'P2':1,'P3':0,'P4':0}
    assert all(item['legalConclusion']=='NOT_DETERMINED' for item in j['results'])
    assert j['persisted'] is False

def test_rejects_demo_and_invalid_signage_and_unknown_fields():
    assert client.post('/api/v1/traffic/classify',json={'items':[evt(source='demo')]}).status_code==422
    assert client.post('/api/v1/traffic/classify',json={'items':[evt(signageVerified=True,zoneContext='signed_no_stopping')]}).status_code==422
    assert client.post('/api/v1/traffic/classify',json={'items':[evt(pedestrianBlocked='unsafe')]}).status_code==422
    assert client.post('/api/v1/traffic/classify',json={'items':[evt(evidenceReference='PLATE 1234')]}).status_code==422

def test_sync_preserves_classification_in_sqlite(tmp_path,monkeypatch):
    from server import storage
    from server.timeseries import observation_line
    monkeypatch.setattr(storage,'DB',tmp_path/'traffic.sqlite3')
    sample=evt(id='evt-persist-123',type='Menunggu',duration=150,pedestrianBlocked='yes',
               zoneContext='signed_no_stopping',signageVerified=True,evidenceReference='ZONE-A-S1')
    data=client.post('/api/observations/sync',json={'items':[sample]})
    assert data.status_code==200, data.text
    assert data.json()['inserted']==1
    stored=client.get('/api/observations').json()['items']
    assert len(stored)==1
    assert stored[0]['pedestrianBlocked']=='yes'
    assert stored[0]['signageVerified'] is True
    assert 'priority=P1' in observation_line(stored[0])
    data=client.post('/api/observations/sync',json={'items':[sample]})
    assert data.json()['inserted']==0 and data.json()['alreadyPresent']==1
