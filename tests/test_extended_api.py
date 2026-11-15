"""Contract tests for SIMPUL v0.3 extensions, all external requests mocked.

No traffic measurement, paid provider, or live credentials are claimed.
"""
from datetime import date,timedelta
from pathlib import Path
from unittest.mock import patch
import sys
sys.path.insert(0,str(Path(__file__).resolve().parent.parent))
from fastapi.testclient import TestClient
from server.app import app
from server import context_plus as ctx, routing, providers

client=TestClient(app)

def main():
    services=client.get('/api/integrations').json()
    keys={'reverse','crossings','airquality','forecast','history','elevation','holidays','routing','isochrone'}
    assert keys<=services.keys()
    assert client.get('/api/geo/reverse',params={'lat':91,'lon':100}).status_code==422
    assert client.get('/api/context/air-quality',params={'lat':-6.3,'lon':181}).status_code==422
    assert client.get('/api/accessibility/route',params={'lat':-6.3,'lon':106.8,'destLat':-6.301,'destLon':106.801,'mode':'flying'}).status_code==422
    assert client.get('/api/accessibility/isochrone',params={'lat':-6.3,'lon':106.8,'minutes':100}).status_code==422
    with patch.object(providers,'get_json',return_value={'display_name':'Fatmawati, Jakarta','osm_id':321}), patch.object(providers,'_last_geocode',0.0):
        ctx._reverse_cache.clear()
        r=client.get('/api/geo/reverse',params={'lat':-6.29,'lon':106.8})
        assert r.status_code==200,r.text
        assert r.json()['address']=='Fatmawati, Jakarta'
        cache=client.get('/api/geo/reverse',params={'lat':-6.29,'lon':106.8})
        assert cache.status_code==200
    with patch.object(providers,'get_json',return_value={'current':{'time':'2026-11-14T13:00','us_aqi':51,'pm2_5':12.8,'pm10':28.9}}):
        a=client.get('/api/context/air-quality',params={'lat':-6.29,'lon':106.8})
        assert a.status_code==200 and a.json()['pm25UgM3']==12.8
    forecast={'hourly':{'time':['2026-11-14T15:00','2026-11-14T16:00'],'precipitation_probability':[45,77],'precipitation':[0.2,0.9]}}
    with patch.object(providers,'get_json',return_value=forecast):
        f=client.get('/api/context/forecast',params={'lat':-6.29,'lon':106.8})
        assert f.status_code==200 and len(f.json()['hours'])==2 and f.json()['hours'][1]['rainProbabilityPct']==77
    old=(date.today()-timedelta(days=25)).isoformat()
    with patch.object(providers,'get_json',return_value={'hourly':{'time':[old+'T07:00',old+'T08:00'],'temperature_2m':[29,31],'precipitation':[0,2.6]}}):
        h=client.get('/api/context/history',params={'lat':-6.29,'lon':106.8,'day':old})
        assert h.status_code==200 and h.json()['dayRainMm']==2.6 and h.json()['meanTemperatureC']==30
    too_recent=(date.today()-timedelta(days=1)).isoformat()
    assert client.get('/api/context/history',params={'lat':-6.29,'lon':106.8,'day':too_recent}).status_code==422
    with patch.object(providers,'get_json',return_value={'elevation':[47.8]}):
        e=client.get('/api/context/elevation',params={'lat':-6.29,'lon':106.8})
        assert e.status_code==200 and e.json()['resolutionM']==90
    with patch.object(providers,'get_json',return_value=[{'date':'2026-08-17','name':'Independence Day','nationalHoliday':True,'holidayTypes':['Public']}]) as mock:
        hol=client.get('/api/context/holidays',params={'year':2026})
        assert hol.status_code==200 and hol.json()['items'][0]['national']
        assert '/api/v4/Holidays/ID/2026' in mock.call_args[0][0]
    with patch.dict('os.environ',{'ORS_API_KEY':''}):
        r=client.get('/api/accessibility/route',params={'lat':-6.29,'lon':106.8,'destLat':-6.30,'destLon':106.81})
        assert r.status_code==503 and 'ORS_API_KEY' in r.text
    geometry={'features':[{'properties':{'summary':{'distance':430.2,'duration':367.1}},'geometry':{'coordinates':[[106.80,-6.29],[106.805,-6.295],[106.81,-6.30]]}}]}
    with patch.dict('os.environ',{'ORS_API_KEY':'dummy'}),patch.object(routing,'_fetch',return_value=geometry) as req:
        r=client.get('/api/accessibility/route',params={'lat':-6.29,'lon':106.8,'destLat':-6.3,'destLon':106.81,'mode':'wheelchair'})
        assert r.status_code==200 and r.json()['distanceM']==430.2
        assert 'wheelchair' in req.call_args[0][0]
        assert r.json()['geometry'][0][0]==106.8
    with patch.dict('os.environ',{'ORS_API_KEY':'dummy'}),patch.object(routing,'_fetch',return_value={'features':[{'geometry':{'type':'Polygon','coordinates':[[[106.7,-6.2],[106.8,-6.2],[106.75,-6.3],[106.7,-6.2]]]}}]}) as mock:
        i=client.get('/api/accessibility/isochrone',params={'lat':-6.29,'lon':106.8,'minutes':10})
        assert i.status_code==200 and len(i.json()['boundary'])==4
        assert mock.call_args.kwargs['body']['range']==[600]
    # Safety: credentials must never appear in public catalog.
    with patch.dict('os.environ',{'ORS_API_KEY':'secret_key_123'}):
        catalog=client.get('/api/integrations')
        assert catalog.json()['routing']['enabled'] is True
        assert 'secret_key_123' not in catalog.text
    print('PASS: 9 extension endpoints, validation, providers, caching, routing, no-key behavior, no credential leakage')

if __name__=='__main__':main()
