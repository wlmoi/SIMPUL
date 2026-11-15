"""Regression: no FPGA endpoints/assets; SIMPUL follows the PDF's four-stage loop."""
import sys
from pathlib import Path
from fastapi.testclient import TestClient
ROOT=Path(__file__).resolve().parent.parent
sys.path.insert(0,str(ROOT))
from server.app import app

assert not (ROOT/'hardware'/'fpga').exists()
assert not (ROOT/'server'/'edge_routes.py').exists()
assert not (ROOT/'js'/'views'/'fpga.js').exists()
client=TestClient(app)
assert client.get('/api/edge/status').status_code==404
assert client.get('/api/edge/devices').status_code==404
assert client.post('/api/edge/telemetry',json={}).status_code==404
appjs=(ROOT/'js'/'app.js').read_text()
assert 'fpga-refresh' not in appjs
assert '/api/edge' not in appjs
nav=(ROOT/'js'/'data.js').read_text()
assert "id:'project'" in nav
assert "id:'fpga'" not in nav
project=(ROOT/'js'/'views'/'project.js').read_text()
for term in ('Observasi','Analisis SI','Simulasi','Evaluasi','A0','A1','A2','F1-score','≤ 20%'):
    assert term in project,term
assert 'FPGA' not in project
print('PASS: PDF flow, A0/A1/A2, targets, and removed hardware routes/modules')
