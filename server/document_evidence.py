"""Local-only PDF observation index for the SIMPUL mobility research prototype.

Reads only PDFs the operator explicitly uploads. Does not identify owners,
license plates, people, or infer a vehicle's live location. Extracted structured
observations retain original page and row provenance. OCR is opt-in.
"""
from __future__ import annotations

from datetime import datetime
from hashlib import sha256
from pathlib import Path
from tempfile import TemporaryDirectory
from typing import Literal
import io
import json
import os
import re
import sqlite3
import subprocess
import threading

from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from pydantic import BaseModel
from .storage import DB

router = APIRouter(prefix='/api/v1/documents', tags=['Document evidence (local)'])
LOCK = threading.RLock()
MAX_PDF_BYTES = 10 * 1024 * 1024
MAX_PAGES = 30
MAX_RECORDS = 2500
OCR_TIMEOUT_SEC = 90
DATE_RE = re.compile(r'(?<!\d)(20\d\d[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]20\d\d)\s*[T ]\s*([0-2]?\d:[0-5]\d(?::[0-5]\d)?)')
ZONE_RE = re.compile(r'\b(zona\s*[A-Za-z0-9_-]+|zone\s*[A-Za-z0-9_-]+|halte\s*[A-Za-z0-9_-]+)\b', re.I)
VEHICLE_RE = re.compile(r'\b(mobil|motor|bus|truk|sedan|suv|mpv|van|taksi|taxi)\b', re.I)
COLOR_RE = re.compile(r'\b(hitam|putih|merah|biru|silver|abu-abu|abu|kuning|hijau|black|white|red|blue|gray|grey)\b', re.I)
ACTIVITY_RE = re.compile(r'\b(jemput|penjemputan|turun|drop.?off|pick.?up|menunggu|parkir|berhenti)\b', re.I)
COORD_RE = re.compile(r'(?<!\d)(-?\d{1,2}\.\d{3,8})\s*[,;]\s*(-?\d{1,3}\.\d{3,8})(?!\d)')


def _db():
    DB.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB, timeout=8)
    conn.execute('''CREATE TABLE IF NOT EXISTS pdf_documents
        (id TEXT PRIMARY KEY, file_name TEXT NOT NULL, sha256 TEXT NOT NULL,
         pages INTEGER NOT NULL, status TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP)''')
    conn.execute('''CREATE TABLE IF NOT EXISTS pdf_observation_records
        (id TEXT PRIMARY KEY, document_id TEXT NOT NULL, payload TEXT NOT NULL,
         FOREIGN KEY(document_id) REFERENCES pdf_documents(id))''')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_pdf_records_document ON pdf_observation_records(document_id)')
    conn.commit()
    return conn


def _normal_date(date: str, hour: str) -> str | None:
    raw = date.replace('/', '-')
    try:
        if re.match(r'^\d\d?[-]', raw):
            day, month, year = raw.split('-')
            dt = datetime(int(year), int(month), int(day))
        else:
            dt = datetime.fromisoformat(raw)
        hms = hour.split(':')
        dt = dt.replace(hour=int(hms[0]), minute=int(hms[1]), second=int(hms[2]) if len(hms)>2 else 0)
        return dt.isoformat(timespec='seconds') + '+07:00'
    except (ValueError, IndexError):
        return None


def parse_observation_lines(pages: list[str], fingerprint: str, file_name: str) -> list[dict]:
    """Conservative record extraction: require date+time, zone, vehicle type.

    A potential match does not prove vehicle identity or a traffic violation.
    Coordinates are only assigned if explicitly recorded in a line.
    """
    rows = []
    for page_index, page in enumerate(pages, 1):
        for line_index, line in enumerate(page.splitlines(), 1):
            line = ' '.join(line.split())[:800]
            if len(line) < 16:
                continue
            match_date = DATE_RE.search(line)
            match_zone = ZONE_RE.search(line)
            match_vehicle = VEHICLE_RE.search(line)
            if not (match_date and match_zone and match_vehicle):
                continue
            at = _normal_date(*match_date.groups())
            if not at:
                continue
            zone = match_zone.group(1).title()
            kind = match_vehicle.group(1).lower()
            vehicle = {'taksi':'Mobil','taxi':'Mobil','sedan':'Mobil','suv':'Mobil','mpv':'Mobil','van':'Mobil'}.get(kind,kind.capitalize())
            color = COLOR_RE.search(line)
            activity = ACTIVITY_RE.search(line)
            coord = COORD_RE.search(line)
            lat = lon = None
            if coord:
                a,b = float(coord.group(1)),float(coord.group(2))
                # Only accept geographic coordinates; never invent zone coordinates.
                if -90 <= a <= 90 and -180 <= b <= 180:
                    lat,lon = a,b
            row_id = sha256(f'{fingerprint}:{page_index}:{line_index}:{line}'.encode()).hexdigest()[:24]
            rows.append({
                'id':row_id,'documentId':fingerprint[:20], 'fileName':file_name,
                'page':page_index,'line':line_index,'at':at,'zone':zone,
                'vehicle':vehicle,'subcategory':kind if kind!=vehicle.lower() else None,
                'color':color.group(1).title() if color else None,
                'activity':activity.group(1).lower() if activity else None,
                'lat':lat,'lon':lon,'source':'uploaded_pdf',
                'extraction':'rule_based_candidate','reviewStatus':'unverified',
            })
            if len(rows)>=MAX_RECORDS:
                return rows
    return rows


def _extract_text_pdf(contents: bytes) -> tuple[list[str], int]:
    try:
        import pymupdf
    except ImportError as exc:
        raise HTTPException(status_code=503, detail='PyMuPDF belum terpasang pada backend.') from exc
    try:
        with pymupdf.open(stream=contents, filetype='pdf') as doc:
            if doc.needs_pass:
                raise HTTPException(status_code=422,detail='PDF terenkripsi tidak diproses. Unggah salinan berizin yang tidak terenkripsi.')
            if len(doc)>MAX_PAGES:
                raise HTTPException(status_code=413,detail=f'Maksimum {MAX_PAGES} halaman per PDF.')
            pages=[page.get_text('text',sort=True) for page in doc]
            return pages,len(doc)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=422, detail='PDF rusak atau bukan dokumen PDF yang valid.') from exc


def _optional_openocr(contents: bytes) -> list[str]:
    """Opt-in OpenOCR subprocess using its documented CLI.

    This intentionally requires local operator approval and an isolated worker
    for real deployments. Parses markdown files only; raw PDF is not retained.
    """
    if os.getenv('SIMPUL_OPENOCR_ENABLED','0')!='1':
        return []
    import shutil
    executable = shutil.which('openocr')
    if not executable:
        raise HTTPException(status_code=503,detail='OpenOCR diaktifkan tetapi CLI openocr tidak ditemukan. Instal openocr-python di lingkungan terpisah.')
    with TemporaryDirectory(prefix='simpul_ocr_') as folder:
        path=Path(folder)/'upload.pdf'
        path.write_bytes(contents)
        command=[executable,'--task','doc','--input_path',str(path),'--use_layout_detection','--save_markdown','--save_json']
        try:
            completed=subprocess.run(command,cwd=folder,capture_output=True,text=True,timeout=OCR_TIMEOUT_SEC,check=False)
        except subprocess.TimeoutExpired as exc:
            raise HTTPException(status_code=504,detail='Batas waktu OpenOCR terlampaui.') from exc
        if completed.returncode:
            raise HTTPException(status_code=502,detail='OpenOCR gagal memproses PDF. Periksa dependensi dan model lokal.')
        md_files=sorted(Path(folder).rglob('*.md'))
        if not md_files:
            return []
        return [p.read_text(encoding='utf-8', errors='replace')[:200000] for p in md_files[:MAX_PAGES]]


def ingest_pdf(contents:bytes, name:str)->dict:
    if not (contents.startswith(b'%PDF-') and len(contents)<=MAX_PDF_BYTES):
        raise HTTPException(status_code=415 if not contents.startswith(b'%PDF-') else 413, detail='Harus PDF valid dengan ukuran maksimum 10 MB.')
    fingerprint=sha256(contents).hexdigest()
    file_name=re.sub(r'[^A-Za-z0-9_.-]','_',Path(name).name)[:120] or 'upload.pdf'
    pages,page_count=_extract_text_pdf(contents)
    text_present=any(len(t.strip())>30 for t in pages)
    method='embedded_text'
    if not text_present:
        method='no_text_layer'
        if os.getenv('SIMPUL_OPENOCR_ENABLED')=='1':
            pages=_optional_openocr(contents)
            method='openocr_unverified'
    rows=parse_observation_lines(pages,fingerprint,file_name)
    result={'documentId':fingerprint[:20], 'fileName':file_name,'pages':page_count,
            'recordsFound':len(rows),'extractionMode':method,
            'requiresHumanReview':True,'source':'uploaded_pdf',
            'notice':'Kandidat hasil ekstraksi dokumen. Bukan pelacakan langsung, identifikasi kendaraan unik, atau bukti pelanggaran.',
            'ocrRequired':not text_present and method=='no_text_layer'}
    with LOCK:
        with _db() as conn:
            conn.execute('INSERT OR IGNORE INTO pdf_documents(id,file_name,sha256,pages,status) VALUES(?,?,?,?,?)',
                         (fingerprint[:20],file_name,fingerprint,page_count,method))
            for row in rows:
                conn.execute('INSERT OR IGNORE INTO pdf_observation_records(id,document_id,payload) VALUES(?,?,?)',
                             (row['id'],fingerprint[:20],json.dumps(row,ensure_ascii=False)))
    return result


@router.get('/status')
def status():
    import importlib.util, shutil
    return {'pdfTextExtraction':importlib.util.find_spec('pymupdf') is not None,
            'openocrEnabled':os.getenv('SIMPUL_OPENOCR_ENABLED','0')=='1',
            'openocrInstalled':shutil.which('openocr') is not None,
            'maxBytes':MAX_PDF_BYTES,'maxPages':MAX_PAGES,
            'scope':'uploaded observation reports only; no plate/face recognition'}


@router.post('/import')
async def import_document(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise HTTPException(415,'Hanya berkas PDF diizinkan.')
    data=await file.read(MAX_PDF_BYTES+1)
    await file.close()
    return ingest_pdf(data,file.filename)


@router.get('/records')
def records(zone:str|None=Query(default=None,max_length=80), vehicle:str|None=Query(default=None,max_length=30),
            color:str|None=Query(default=None,max_length=40), date:str|None=Query(default=None,pattern=r'^\d{4}-\d{2}-\d{2}$'),
            after:str|None=None, before:str|None=None, document_id:str|None=Query(default=None,max_length=24)):
    with LOCK:
        with _db() as conn:
            rows=[json.loads(x[0]) for x in conn.execute('SELECT payload FROM pdf_observation_records ORDER BY rowid DESC LIMIT 2500')]
    def keep(r):
        if document_id and r['documentId']!=document_id:return False
        if zone and zone.casefold() not in r['zone'].casefold():return False
        if vehicle and vehicle.casefold() not in (r.get('vehicle') or '').casefold() and vehicle.casefold() not in (r.get('subcategory') or '').casefold():return False
        if color and color.casefold() not in (r.get('color') or '').casefold():return False
        if date and not r['at'].startswith(date):return False
        if after and r['at'][11:16]<after:return False
        if before and r['at'][11:16]>before:return False
        return True
    items=[r for r in rows if keep(r)]
    return {'items':items[:200],'count':len(items),'totalIndexed':len(rows),'source':'user_uploaded_pdf',
            'notice':'Cocok dengan catatan PDF, bukan lokasi kendaraan saat ini atau identitas unik.'}


@router.get('/map')
def map_features(document_id:str|None=None):
    data=records(zone=None,vehicle=None,color=None,date=None,after=None,before=None,document_id=document_id)
    features=[]
    for r in data['items']:
        if r['lat'] is None or r['lon'] is None:continue
        features.append({'type':'Feature','geometry':{'type':'Point','coordinates':[r['lon'],r['lat']]},
                         'properties':{'id':r['id'],'zone':r['zone'],'at':r['at'],'vehicle':r['vehicle'],
                                       'color':r['color'],'documentId':r['documentId'],'page':r['page'],
                                       'reviewStatus':'unverified'}})
    return {'type':'FeatureCollection','features':features,'notice':'Hanya titik GPS yang secara eksplisit tercatat di PDF.'}
