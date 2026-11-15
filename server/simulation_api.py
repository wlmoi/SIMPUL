"""HTTP endpoints and in-memory job queue for the optional synthetic SUMO demo.

This worker is deliberately limited to two concurrent tasks and stores jobs in
memory. A deployment that serves real users needs a durable, authenticated job
queue, worker isolation and explicit operational controls.
"""
from __future__ import annotations

import threading
import uuid
from concurrent.futures import ThreadPoolExecutor

from fastapi import APIRouter, HTTPException

from .monitoring import record_event
from .simulation_engine import ScenarioParams, compute, engine_status

router = APIRouter(tags=['Synthetic SUMO demo'])
executor = ThreadPoolExecutor(max_workers=2)
MAX_RETAINED_JOBS = 200
jobs: dict[str, dict] = {}
lock = threading.Lock()


def run_simulation_job(job_id: str, params: ScenarioParams) -> None:
    """Execute a validated scenario in a worker thread and record final status."""
    with lock:
        jobs[job_id]['status'] = 'running'
    record_event('simulation', 'job_started', ref_id=job_id)

    try:
        result = compute(params)
        with lock:
            jobs[job_id] = {'status': 'complete', 'result': result}
        record_event('simulation', 'job_completed', ref_id=job_id,
                     detail='synthetic SUMO network')
    except Exception as exc:
        with lock:
            jobs[job_id] = {'status': 'failed', 'error': str(exc)[:500]}
        record_event('simulation', 'job_failed', level='warning', ref_id=job_id)


@router.get('/api/status')
def status() -> dict:
    return {'service': 'SIMPUL API', **engine_status()}


@router.post('/api/simulation')
def submit(params: ScenarioParams) -> dict:
    if not engine_status()['engineAvailable']:
        raise HTTPException(
            status_code=503,
            detail='SUMO/netconvert tidak terpasang pada server ini. '
                   'Instal SUMO dan jalankan kembali; estimasi ilustratif '
                   'tidak dipalsukan sebagai hasil SUMO.',
        )

    with lock:
        # Completed/failed jobs are demo artifacts, not durable audit records.
        # Keep memory bounded across repeated local test runs.
        if len(jobs) >= MAX_RETAINED_JOBS:
            obsolete = [ident for ident,item in jobs.items() if item['status'] in ('complete','failed')]
            for ident in obsolete[:max(0,len(jobs) - MAX_RETAINED_JOBS + 1)]:
                jobs.pop(ident,None)
        active = sum(1 for job in jobs.values()
                     if job['status'] in ('pending', 'running'))
        if active >= 2:
            raise HTTPException(
                status_code=429,
                detail='Worker simulasi sedang penuh. Coba lagi setelah pekerjaan sebelumnya selesai.',
            )
        job_id = uuid.uuid4().hex[:14]
        jobs[job_id] = {'status': 'pending'}

    record_event('simulation', 'job_submitted', ref_id=job_id)
    executor.submit(run_simulation_job, job_id, params)
    return {'jobId': job_id, 'status': 'pending'}


@router.get('/api/simulation/{job_id}')
def retrieve(job_id: str) -> dict:
    with lock:
        job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail='Job simulasi tidak ditemukan.')
    return job
