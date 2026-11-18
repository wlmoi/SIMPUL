"""Check backend service boundaries without making external provider requests."""
from fastapi.testclient import TestClient
from server.app import app
from server.api_registry import API_ROUTERS


def test_api_router_registry_unique():
    names = [name for name, _ in API_ROUTERS]
    assert len(names) == len(set(names)) == 10
    assert all(router.routes for _, router in API_ROUTERS)


def test_required_api_surfaces_present():
    # OpenAPI is the public contract; newer FastAPI keeps included routers lazy.
    paths = set(app.openapi()['paths'])
    for required in (
        '/api/status', '/api/simulation', '/api/observations/sync',
        '/api/v1/public-intelligence/status', '/api/v1/public-intelligence/news',
        '/api/v1/cv-reviewed', '/api/v1/ai/decision-brief',
    ):
        assert required in paths, f'Missing API path: {required}'
    client = TestClient(app)
    resp = client.get('/api/status')
    assert resp.status_code == 200
    assert resp.json()['calibrated'] is False
