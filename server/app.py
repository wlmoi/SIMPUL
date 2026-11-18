"""SIMPUL local FastAPI entrypoint.

API routers are registered in server/api_registry.py. SUMO computation is
isolated in server/simulation_engine.py and runs on a SYNTHETIC network only.
This local demo API has no user authentication; do not expose it publicly.
"""
from __future__ import annotations
import os
import sys
import time
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from server.api_registry import register_api_routers
from server.monitoring import record_request
from server.security import reject_request, secure_response

ROOT = Path(__file__).resolve().parent.parent
app = FastAPI(
    title='SIMPUL Mobility Intelligence API',
    version='1.7.0',
    description='Research prototype. SUMO test network is synthetic, not a calibrated MRT Fatmawati twin.',
)
register_api_routers(app)


@app.middleware('http')
async def request_metrics(request: Request, call_next):
    started = time.monotonic()
    try:
        rejected = reject_request(request)
        response = rejected if rejected is not None else await call_next(request)
        return secure_response(request, response)
    except Exception:
        record_request(time.monotonic() - started, 500)
        raise
    finally:
        if 'response' in locals() and request.url.path != '/api/monitor/metrics':
            record_request(time.monotonic() - started, response.status_code)


# Static assets are mounted only after all APIs are registered.
app.mount('/assets',StaticFiles(directory=ROOT/'assets'),name='assets')
app.mount('/js',StaticFiles(directory=ROOT/'js'),name='js')

@app.get('/')
@app.get('/index.html')
def index():
    return FileResponse(ROOT/'index.html')

@app.get('/styles.css')
def css():
    return FileResponse(ROOT/'styles.css',media_type='text/css')

@app.get('/manifest.webmanifest')
def manifest():
    return FileResponse(ROOT/'manifest.webmanifest',media_type='application/manifest+json')

@app.get('/sw.js')
def service_worker():
    return FileResponse(ROOT/'sw.js',media_type='text/javascript',headers={'Service-Worker-Allowed':'/'})


if __name__ == '__main__':
    import uvicorn
    port=int(os.environ.get('PORT','8888'))
    uvicorn.run(app,host=os.environ.get('SIMPUL_HOST','127.0.0.1'),port=port)
