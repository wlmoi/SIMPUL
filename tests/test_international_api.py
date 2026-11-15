"""Contract tests for international-practice APIs. No external network used."""
import sys
from pathlib import Path
from fastapi.testclient import TestClient
ROOT=Path(__file__).resolve().parent.parent
sys.path.insert(0,str(ROOT))
from server.app import app
client=TestClient(app)

def test_standards_catalog():
    r=client.get('/api/v1/standards')
    assert r.status_code==200
    assert r.json()['certification_claim'] is False
    assert len(r.json()['standards'])==8

def test_requires_manual_data_and_timezone():
    r=client.post('/api/v1/quality/check',json={})
    assert r.status_code==200 and r.json()['readiness']=='NOT_READY'
    r=client.post('/api/v1/quality/check',json={'observations':[{'id':'evt-123','at':'2026-11-14T07:00:00','source':'manual','type':'Jemput','zone':'Zona A','duration':10,'vehicle':'Mobil'}]})
    assert r.status_code==422
    r=client.post('/api/v1/quality/check',json={'observations':[{'id':'evt-123','at':'2026-11-14T07:00:00Z','source':'demo','type':'Jemput','zone':'Zona A','duration':10,'vehicle':'Mobil'}]})
    assert r.status_code==422

def test_evidence_bundle_timezone_and_metrics():
    sample={'project_id':'fatmawati','project_name':'Fatmawati','observations':[{'id':'evt-one','at':'2026-11-14T07:02:00+07:00','source':'manual','type':'Jemput','zone':'Zona A','duration':35,'vehicle':'Mobil'}],
      'intervals':[{'id':'reading-a0','at':'2026-11-14T07:00:00+07:00','phase':'baseline','scenario':'A0','period':'Jam sibuk','zone':'Zona A','minutes':30,'passingVehicles':120,'stoppedVehicles':24,'maxQueue':7,'accessMeters':80,'pedestrians':30,'blockedAccess':False,'availableBays':3,'occupiedBays':2,'source':'manual'}]}
    r=client.post('/api/v1/evidence/bundle',json=sample)
    assert r.status_code==200, r.text
    bundle=r.json()
    assert bundle['intervals'][0]['stopping_events_per_hour']==48
    assert bundle['observations'][0]['observed_at_utc']=='2026-11-14T00:02:00Z'
    assert bundle['classification']=='NOT_FIELD_VALIDATED'
    assert bundle['provenance']['@graph'][0]['@id']=='urn:simpul:record:evt-one'
    sample['intervals'][0]['occupiedBays']=5
    r=client.post('/api/v1/evidence/bundle',json=sample)
    assert r.status_code==422

def test_project_geojson_wgs84():
    r=client.post('/api/v1/geojson/project',json={'project_id':'fa','name':'Fatmawati','latitude':-6.29,'longitude':106.8})
    assert r.status_code==200
    assert r.json()['features'][0]['geometry']['coordinates']==[106.8,-6.29]
    assert r.json()['features'][0]['properties']['not_individual_event_coordinate'] is True
    bad=client.post('/api/v1/geojson/project',json={'project_id':'fa','name':'Fatmawati','latitude':-91,'longitude':106.8})
    assert bad.status_code==422
