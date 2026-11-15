"""Contract tests using locally generated PDF observations; no external calls."""
from __future__ import annotations
import io
from fastapi.testclient import TestClient
from reportlab.pdfgen import canvas
from server import document_evidence as de
from server.app import app


def make_pdf(lines):
    out=io.BytesIO(); c=canvas.Canvas(out,pagesize=(595,842))
    for i,line in enumerate(lines):c.drawString(40,790-i*22,line)
    c.save();return out.getvalue()


def test_pdf_search_filters_and_geographic_provenance(tmp_path,monkeypatch):
    monkeypatch.setattr(de,'DB',tmp_path/'pdf_search.sqlite3')
    pdf=make_pdf([
        '2026-11-15 07:35 | Zona A | Mobil | Hitam | Menunggu | -6.29247, 106.79245',
        '2026-11-15 08:20 | Zona B | SUV | Putih | Turun',
        '2026-11-15 08:20 | Unstructured personal note without structured record',
    ])
    client=TestClient(app)
    res=client.post('/api/v1/documents/import',files={'file':('manual.pdf',pdf,'application/pdf')})
    assert res.status_code==200,res.text
    assert res.json()['recordsFound']==2
    assert res.json()['extractionMode']=='embedded_text'
    res2=client.post('/api/v1/documents/import',files={'file':('manual.pdf',pdf,'application/pdf')})
    assert res2.status_code==200
    matching=client.get('/api/v1/documents/records',params={'vehicle':'mobil','color':'hitam','zone':'Zona A','date':'2026-11-15','after':'07:00','before':'07:50'}).json()
    assert matching['count']==1
    assert matching['items'][0]['reviewStatus']=='unverified'
    assert matching['items'][0]['fileName']=='manual.pdf'
    no_match=client.get('/api/v1/documents/records',params={'date':'2026-11-14'}).json()
    assert no_match['count']==0
    geo=client.get('/api/v1/documents/map').json()
    assert len(geo['features'])==1
    assert geo['features'][0]['geometry']['coordinates']==[106.79245,-6.29247]
    assert 'page' in geo['features'][0]['properties']


def test_scanned_pdf_requires_optional_ocr(tmp_path,monkeypatch):
    monkeypatch.setattr(de,'DB',tmp_path/'pdf_scan.sqlite3')
    monkeypatch.delenv('SIMPUL_OPENOCR_ENABLED',raising=False)
    client=TestClient(app)
    blank=make_pdf([])
    r=client.post('/api/v1/documents/import',files={'file':('scan.pdf',blank,'application/pdf')})
    assert r.status_code==200
    assert r.json()['ocrRequired'] is True
    assert r.json()['recordsFound']==0


def test_pdf_rejects_non_pdf_and_limits(tmp_path,monkeypatch):
    monkeypatch.setattr(de,'DB',tmp_path/'pdf_reject.sqlite3')
    client=TestClient(app)
    assert client.post('/api/v1/documents/import',files={'file':('bad.txt',b'hello','text/plain')}).status_code==415
    assert client.post('/api/v1/documents/import',files={'file':('bad.pdf',b'not pdf','application/pdf')}).status_code==415


def test_no_implicit_vehicle_identity():
    pages=['2026-11-15 08:32 | Zona C | Mobil | Hitam | Jemput']
    rows=de.parse_observation_lines(pages,'abcdef'*11,'example.pdf')
    assert len(rows)==1
    assert rows[0]['lat'] is None and rows[0]['lon'] is None
    assert 'plate' not in rows[0] and 'owner' not in rows[0]
    assert rows[0]['extraction']=='rule_based_candidate'
