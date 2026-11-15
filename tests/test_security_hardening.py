"""Deterministic local security regression checks (NOT a Strix pentest)."""
import os
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch
from fastapi.testclient import TestClient

from server.app import app
from server import storage, security


client = TestClient(app)
EVENT = {
    'id':'evt-security-123', 'at':'2026-11-15T11:30:00+07:00',
    'type':'Menunggu','vehicle':'Mobil','duration':150,
    'zone':'Zona A','source':'manual','note':''
}


def test_host_allowlist_denies_host_header_poisoning():
    r=client.get('/api/status',headers={'host':'attacker.invalid'})
    assert r.status_code == 400
    assert 'nosniff' == r.headers['x-content-type-options']


def test_mutating_api_denies_cross_origin_requests():
    res=client.post('/api/v1/traffic/classify',json={'items':[EVENT]},headers={'origin':'https://attacker.example'})
    assert res.status_code == 403
    assert client.post('/api/v1/traffic/classify',json={'items':[EVENT]},headers={'sec-fetch-site':'cross-site'}).status_code == 403
    assert client.post('/api/v1/traffic/classify',json={'items':[EVENT]},headers={'origin':'http://testserver'}).status_code == 200


def test_api_bearer_token_protects_reads_and_writes():
    with patch.dict(os.environ,{'SIMPUL_API_TOKEN':'hardening-test-secret'}):
        assert client.get('/api/observations').status_code == 401
        assert client.post('/api/v1/traffic/classify',json={'items':[EVENT]}).status_code == 401
        assert client.get('/api/observations',headers={'Authorization':'Bearer wrong'}).status_code == 401
        token={'Authorization':'Bearer hardening-test-secret'}
        assert client.get('/api/status',headers=token).status_code == 200
        assert client.post('/api/v1/traffic/classify',json={'items':[EVENT]},headers=token).status_code == 200
        assert 'no-store' in client.get('/api/status',headers=token).headers['cache-control']
    assert client.get('/api/status').status_code == 200


def test_remote_hostname_requires_token_and_https():
    with patch.dict(os.environ,{'SIMPUL_ALLOWED_HOSTS':'simpul.example'},clear=False):
        assert client.get('/api/status',headers={'host':'simpul.example'}).status_code == 403
        with patch.dict(os.environ,{'SIMPUL_API_TOKEN':'remote-secret'},clear=False):
            assert client.get('/api/status',headers={'host':'simpul.example','Authorization':'Bearer remote-secret'}).status_code == 403
            with TestClient(app,base_url='https://simpul.example') as remote:
                assert remote.get('/api/status',headers={'Authorization':'Bearer remote-secret'}).status_code == 200


def test_security_headers_constrain_script_and_frame_loading():
    r=client.get('/')
    assert r.status_code==200
    csp=r.headers['content-security-policy']
    assert "script-src 'self'" in csp
    assert "object-src 'none'" in csp
    assert "frame-ancestors 'none'" in csp
    assert "unsafe-eval" not in csp
    assert r.headers['x-frame-options']=='DENY'
    assert r.headers['referrer-policy']=='strict-origin-when-cross-origin'


def test_rapid_repeated_post_requests_are_rate_limited():
    with patch.object(security,'_MAX_MUTATIONS',2):
        with security._rate_lock:security._recent.clear()
        try:
            first=client.post('/api/v1/traffic/classify',json={'items':[EVENT]})
            second=client.post('/api/v1/traffic/classify',json={'items':[EVENT]})
            third=client.post('/api/v1/traffic/classify',json={'items':[EVENT]})
            assert [first.status_code,second.status_code,third.status_code]==[200,200,429]
            assert third.headers['retry-after']=='60'
        finally:
            with security._rate_lock:security._recent.clear()


def test_observation_id_collision_is_rejected_and_batch_is_atomic():
    with TemporaryDirectory() as d:
        old=storage.DB;storage.DB=Path(d)/'security.sqlite3'
        try:
            assert client.post('/api/observations/sync',json={'items':[EVENT]}).json()['inserted']==1
            collision={**EVENT,'duration':999}
            result=client.post('/api/observations/sync',json={'items':[collision]})
            assert result.status_code==409
            assert client.get('/api/observations').json()['items'][0]['duration']==150
            other={**EVENT,'id':'evt-security-456'}
            # A collision in the same batch must not silently append a valid event.
            r=client.post('/api/observations/sync',json={'items':[other,collision]})
            assert r.status_code==409
            assert client.get('/api/observations').json()['count']==1
        finally:
            storage.DB=old
