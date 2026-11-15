"""Contract tests for optional, passive news lookup. No real external calls."""
from pathlib import Path
import sys
import json
sys.path.insert(0,str(Path(__file__).resolve().parent.parent))
from fastapi.testclient import TestClient
from server.app import app
from server import public_intelligence as pi
client=TestClient(app)

def input_data(**v):
    return {'lat':-6.29,'lon':106.80,'topic':'fatmawati','radius_km':3,'minutes':60,**v}

def test_status_defaults_disabled(monkeypatch):
    monkeypatch.delenv('SIMPUL_PUBLIC_OSINT_ENABLED',raising=False)
    response=client.get('/api/v1/public-intelligence/status')
    assert response.status_code==200
    j=response.json();assert j['available'] is False
    assert j['adapter']=='search_gdelt_geo'
    assert j['legalConclusion']=='NOT_DETERMINED'
    assert client.post('/api/v1/public-intelligence/news',json=input_data()).status_code==503

def test_only_allowlisted_topics_and_valid_coordinates():
    assert client.post('/api/v1/public-intelligence/news',json=input_data(topic='search_email')).status_code==422
    assert client.post('/api/v1/public-intelligence/news',json=input_data(lat=99)).status_code==422
    assert client.post('/api/v1/public-intelligence/news',json=input_data(radius_km=200)).status_code==422
    assert client.post('/api/v1/public-intelligence/news',json=input_data(username='victim')).status_code==422

def test_parse_provenance_and_exclude_nonpublic_links():
    fc={'type':'FeatureCollection','coverage':{'minutes':45,'requested':60,'loading':False},'features':[
    {'type':'Feature','properties':{'name':'Jakarta','count':4,'title':'Transport updates','url':'https://example.org/story','domain':'example.org'},'geometry':{'type':'Point','coordinates':[106.8,-6.29]}},
    {'type':'Feature','properties':{'name':'Jakarta','count':1,'title':'unsafe','url':'http://127.0.0.1/test','domain':'local'},'geometry':{'type':'Point','coordinates':[106.8,-6.29]}}]}
    data=pi._extract_news('Summary\n```geojson\n'+json.dumps(fc)+'\n```')
    assert len(data['items'])==1
    assert data['items'][0]['sourceType']=='secondary_public_news'
    assert data['items'][0]['legalConclusion']=='NOT_DETERMINED'
    assert data['coverage']['minutes']==45

def test_live_provider_is_mocked_and_no_identity_tool(monkeypatch):
    monkeypatch.setenv('SIMPUL_PUBLIC_OSINT_ENABLED','1')
    monkeypatch.setattr(pi,'osint_status',lambda:{'enabled':True,'installed':True})
    calls=[]
    async def fake_news(topic,bbox,minutes):
        calls.append((topic,bbox,minutes))
        return ('GDELT...\n```geojson\n'+json.dumps({'type':'FeatureCollection','features':[], 'coverage':{'minutes':15,'requested':60}})+'\n```')
    monkeypatch.setattr(pi,'_openosint_news',fake_news)
    r=client.post('/api/v1/public-intelligence/news',json=input_data())
    assert r.status_code==200,r.text
    j=r.json();assert j['items']==[] and j['surveyData'] is False
    assert j['enforcementEnabled'] is False and j['legalConclusion']=='NOT_DETERMINED'
    assert calls[0][0]=='fatmawati' and len(calls[0][1])==4

def test_error_output_does_not_pretend_success():
    from fastapi import HTTPException
    try:pi._extract_news('Scan error: unavailable\n[service_unavailable] search_gdelt_geo')
    except HTTPException as e: assert e.status_code==503
    else:assert False,'must fail closed'
