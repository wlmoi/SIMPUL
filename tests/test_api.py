"""API contract and safety tests with mocked upstream providers. No real credentials/network required."""
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parent.parent))
from tempfile import TemporaryDirectory
from unittest.mock import patch
from fastapi.testclient import TestClient
from server.app import app
from server import storage,providers

client=TestClient(app)

def main():
    status=client.get('/api/status'); assert status.status_code==200
    catalog=client.get('/api/integrations');assert catalog.status_code==200
    assert {'geo','weather','nearby','gemini','storage','simulation','traffic'}<=set(catalog.json())
    with TemporaryDirectory() as d:
        original=storage.DB;storage.DB=Path(d)/'test.sqlite3'
        try:
            item={'id':'evt-mock-123','at':'2026-11-14T10:00:00+07:00','type':'Jemput','vehicle':'Mobil','duration':32,'zone':'Zona A','source':'manual','note':''}
            result=client.post('/api/observations/sync',json={'items':[item]})
            assert result.status_code==200,result.text
            assert result.json()['inserted']==1
            again=client.post('/api/observations/sync',json={'items':[item]})
            assert again.json()['alreadyPresent']==1
            invalid=client.post('/api/observations/sync',json={'items':[{**item,'id':'evt-danger','source':'demo'}]})
            assert invalid.status_code==422
            assert client.get('/api/observations').json()['count']==1
            assert client.get('/api/observations/summary').json()['meanDwellSec']==32
        finally:storage.DB=original
    with patch.object(providers,'get_json',return_value=[{'display_name':'Test Station, Jakarta','lat':'-6.29','lon':'106.8','osm_id':145}]):
        providers._last_geocode=0
        res=client.get('/api/geo/search',params={'q':'Test Station, Jakarta'})
        assert res.status_code==200,res.text
        assert res.json()['results'][0]['lat']==-6.29
        again=client.get('/api/geo/search',params={'q':'Test Station, Jakarta'})
        assert again.status_code==200,'A cached geocoder search should not require new upstream request'
    assert client.get('/api/geo/search',params={'q':'aa'}).status_code==422
    assert client.get('/api/context/weather',params={'lat':98,'lon':106}).status_code==422
    with patch.object(providers,'get_json',return_value={'current':{'time':'2026-11-14T10:00','temperature_2m':29,'precipitation':0,'relative_humidity_2m':71,'weather_code':0}}):
        w=client.get('/api/context/weather',params={'lat':-6.29,'lon':106.8})
        assert w.status_code==200 and w.json()['contextOnly'] is True
    with patch.dict('os.environ',{'GEMINI_API_KEY':''}):
        r=client.post('/api/ai/insights',json={'count':4,'meanDwellSec':42,'byType':{'Jemput':3},'byZone':{'A':4}})
        assert r.status_code==503 and 'GEMINI_API_KEY' in r.text
    with patch.dict('os.environ',{'TOMTOM_API_KEY':''}):
        assert client.get('/api/traffic/live',params={'lat':-6.29,'lon':106.8}).status_code==503
    with patch.dict('os.environ',{'TOMTOM_API_KEY':'test_key'}), patch.object(providers,'get_json',return_value={'flowSegmentData':{'currentSpeed':22,'freeFlowSpeed':40,'confidence':0.8,'currentTravelTime':125}}):
        t=client.get('/api/traffic/live',params={'lat':-6.29,'lon':106.8})
        assert t.status_code==200 and t.json()['speedRatio']==0.55
    assert client.get('/api/observations').status_code==200
    assert client.get('/').status_code==200
    print('PASS: status, integrations, deduplicated SQLite sync, schema constraints, geocode cache, weather, Gemini missing-key status, SPA')

if __name__=='__main__':main()
