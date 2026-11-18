"""Contract and safety tests for /api/v1/cv-reviewed and /api/v1/ai/decision-brief."""
from __future__ import annotations

from datetime import datetime, timezone
import json
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

from fastapi.testclient import TestClient

from server import monitoring, providers, storage
from server.app import app

client = TestClient(app)


def _sample_cv_window(**overrides) -> dict:
    base = {
        'windowId': 'cv-ZonaB-peak-20261117T010000Z-20261117T011500Z',
        'signedOffAt': '2026-11-17T08:15:00+07:00',
        'windowStart': '2026-11-17T08:00:00+07:00',
        'windowEnd': '2026-11-17T08:15:00+07:00',
        'reviewerLabel': 'Koordinator Budi',
        'zone': 'Zona B',
        'period': 'Jam sibuk',
        'mode': 'ai',
        'vehicleCountsByClass': {'car': 12, 'motorcycle': 8, 'bus': 1},
        'meanDwellSec': 74.5,
        'overThresholdCount': 5,
    }
    base.update(overrides)
    return base


def _sample_brief_request(**overrides) -> dict:
    now_utc = datetime.now(timezone.utc).isoformat(timespec='seconds')
    base = {
        'manualSummary': {
            'syntheticExcluded': True,
            'totalEvents': 6,
            'byType': {'Jemput': 3, 'Turun': 1, 'Menunggu': 2},
            'byZone': {'Zona A': 4, 'Zona B': 2, 'Zona C': 0},
            'meanDwellSec': 68.0,
            'overThresholdCount': 2,
            'impacts': {'laneYes': 0, 'laneUnknown': 4, 'pedYes': 1, 'pedUnknown': 3, 'queueYes': 2},
        },
        'surveyCoverage': {
            'completedSlots': 2,
            'targetSlots': 12,
            'baselineIntervals': 1,
            'followupIntervals': 0,
            'missingSlots': [
                {'zone': 'Zona C', 'period': 'Jam sibuk', 'completed': 0, 'target': 2},
                {'zone': 'Zona B', 'period': 'Jam sibuk', 'completed': 1, 'target': 2},
            ],
        },
        'preflightBrief': {
            'contradictionsAndGaps': [
                {
                    'code': 'COVERAGE_GAP',
                    'zone': 'Zona C',
                    'period': 'Jam sibuk',
                    'reason': 'Slot survei Zona C Jam sibuk masih 0/2 sesi.',
                    'evidenceLabel': 'requires_field_verification',
                    'sourceTiersUsed': ['tier_1_manual'],
                    'tier3ContextRefs': [],
                }
            ],
            'scenarioHypotheses': [
                {
                    'scenario': 'A0',
                    'title': 'Pertahankan baseline A0 untuk kalibrasi awal',
                    'rationale': 'Lengkapi sesi Zona C sebelum menyimpulkan dampak.',
                    'params': {'traffic': 850, 'pickupShare': 18, 'dwell': 68},
                    'label': 'synthetic_hypothesis_uncalibrated',
                }
            ],
            'inspectionChecklist': [
                {
                    'zone': 'Zona C',
                    'period': 'Jam sibuk',
                    'question': 'Apakah antrean jemput menghalangi lajur saat jam sibuk?',
                    'evidenceLabel': 'requires_field_verification',
                }
            ],
            'diagnosticWarningsCount': 2,
            'qualityStatus': 'not_ready',
        },
        'cvReviewedIds': [],
        'cvReviewedWindows': [],
        'cachedContext': {
            'projectGeo': {'lat': -6.2925, 'lon': 106.7925},
            'weather': {'checkedAt': now_utc, 'rain': 0.0, 'weatherCode': 1},
            'traffic': {'checkedAt': now_utc, 'speedRatio': 0.52},
            'nearby': {'checkedAt': now_utc, 'count': 6},
        },
        'simulationSnapshot': {'engine': 'heuristic', 'scenario': {'traffic': 850, 'dwell': 55}, 'scenarioClamped': False},
        'includeLocalPdf': True,
    }
    base.update(overrides)
    return base


def test_cv_reviewed_validation_and_idempotent_upsert():
    with TemporaryDirectory() as d:
        original = storage.DB
        storage.DB = Path(d) / 'test.sqlite3'
        try:
            demo_bad = client.post('/api/v1/cv-reviewed', json=_sample_cv_window(mode='demo'))
            assert demo_bad.status_code == 422

            missing_period = _sample_cv_window()
            del missing_period['period']
            assert client.post('/api/v1/cv-reviewed', json=missing_period).status_code == 422

            first = client.post('/api/v1/cv-reviewed', json=_sample_cv_window())
            assert first.status_code == 200, first.text
            assert first.json()['status'] == 'inserted'

            dup = client.post('/api/v1/cv-reviewed', json=_sample_cv_window())
            assert dup.status_code == 200
            assert dup.json()['status'] == 'already_present'

            conflict = client.post('/api/v1/cv-reviewed', json=_sample_cv_window(overThresholdCount=99))
            assert conflict.status_code == 409
        finally:
            storage.DB = original


def test_decision_brief_missing_key_and_pdf_overlap_on_fresh_and_populated_db():
    with TemporaryDirectory() as d:
        original = storage.DB
        storage.DB = Path(d) / 'test.sqlite3'
        try:
            with patch.dict('os.environ', {'GEMINI_API_KEY': ''}):
                res = client.post('/api/v1/ai/decision-brief', json=_sample_brief_request())
            assert res.status_code == 200, res.text
            body = res.json()
            assert body['llmStatus'] == 'unavailable'
            assert body['pdfSummary'] == {'available': False, 'totalRecords': 0, 'byZonePeriod': {}}
            assert body['brief']['legalConclusion'] == 'NOT_DETERMINED'
            assert body['executionTrace']['providerStatuses']['pdf'] == 'unavailable'

            with storage.connect() as conn:
                conn.execute(
                    'CREATE TABLE IF NOT EXISTS pdf_observation_records (id TEXT PRIMARY KEY, document_id TEXT NOT NULL, payload TEXT NOT NULL)'
                )
                conn.execute(
                    'INSERT INTO pdf_observation_records (id, document_id, payload) VALUES (?, ?, ?)',
                    ('pdf-1', 'doc-1', json.dumps({'zone': 'Zone C', 'at': '2026-11-17T08:10:00+07:00', 'fileName': 'secret_operator.pdf'})),
                )
            with patch.dict('os.environ', {'GEMINI_API_KEY': ''}):
                res2 = client.post('/api/v1/ai/decision-brief', json=_sample_brief_request())
            assert res2.status_code == 200
            body2 = res2.json()
            assert body2['pdfSummary']['available'] is True
            assert body2['pdfSummary']['byZonePeriod'].get('Zona C|Jam sibuk') == 1
            codes = [item['code'] for item in body2['brief']['contradictionsAndGaps']]
            assert 'PDF_UNVERIFIED_OVERLAP' in codes
            assert 'PDF_UNVERIFIED_OVERLAP' in body2['executionTrace']['preflightFlags']
        finally:
            storage.DB = original


def test_decision_brief_nominal_gemini_clamping_isolation_and_privacy():
    with TemporaryDirectory() as d:
        original = storage.DB
        storage.DB = Path(d) / 'test.sqlite3'
        try:
            bay_win = _sample_cv_window(
                windowId='cv-AreaA1-peak-20261117T010000Z-20261117T011500Z',
                zone='Area A1',
                reviewerLabel='Rahasia Operator Name',
                vehicleCountsByClass={'car': 4, 'motorcycle': 2, 'bus': 0},
                meanDwellSec=40.0,
                overThresholdCount=1,
            )
            assert client.post('/api/v1/cv-reviewed', json=bay_win).status_code == 200

            captured_prompts: list[str] = []

            def fake_gemini(prompt, schema, *, timeout=25, temperature=0.2, max_output_tokens=1400):
                captured_prompts.append(prompt)
                return 'gemini-2.5-flash', {
                    'contradictionsAndGaps': [
                        {
                            'code': 'COVERAGE_GAP',
                            'zone': 'Zona C',
                            'period': 'Jam sibuk',
                            'reason': 'Sesi manual Zona C Jam sibuk masih kurang.',
                            'evidenceLabel': 'requires_field_verification',
                            'sourceTiersUsed': ['tier_1_manual'],
                            'tier3ContextRefs': [],
                        }
                    ],
                    'scenarioHypotheses': [
                        {
                            'scenario': 'A1',
                            'title': 'Uji pengalihan ke Area A1',
                            'rationale': 'Bandingkan pengalihan ke teluk jemput dengan A0.',
                            'params': {'traffic': 9999, 'pickupShare': 20, 'dwell': 45, 'diversion': 150},
                        }
                    ],
                    'inspectionChecklist': [
                        {
                            'zone': 'Zona C',
                            'period': 'Jam sibuk',
                            'question': 'Periksa antrean jemput pada jam sibuk.',
                            'evidenceLabel': 'requires_field_verification',
                        }
                    ],
                }

            req_payload = _sample_brief_request(cvReviewedIds=[bay_win['windowId']])
            with patch.object(providers, 'gemini_generate_json', side_effect=fake_gemini):
                res = client.post('/api/v1/ai/decision-brief', json=req_payload)
            assert res.status_code == 200, res.text
            body = res.json()
            assert body['llmStatus'] == 'ok'
            assert body['executionTrace']['validatorPassed'] is True
            assert body['brief']['legalConclusion'] == 'NOT_DETERMINED'
            assert body['brief']['bayUtilization'] == {
                'windows': 1,
                'totalVehicles': 6,
                'meanDwellSec': 40.0,
                'overThresholdCount': 1,
            }
            assert set(body['executionTrace']['clampedFields']) == {'A1.traffic', 'A1.diversion'}
            params = body['brief']['scenarioHypotheses'][0]['params']
            assert params['traffic'] == 1500
            assert params['diversion'] == 100
            assert 'Rahasia Operator Name' not in captured_prompts[0]
            logs = monitoring.records(limit=10)
            assert any(log['category'] == 'decision_brief' and log['action'] == 'brief_generated' for log in logs)
        finally:
            storage.DB = original


def test_decision_brief_blocklist_and_provider_error_fallbacks():
    with TemporaryDirectory() as d:
        original = storage.DB
        storage.DB = Path(d) / 'test.sqlite3'
        try:
            bad_llm = {
                'contradictionsAndGaps': [
                    {
                        'code': 'COVERAGE_GAP',
                        'zone': 'Zona A',
                        'period': 'Jam sibuk',
                        'reason': 'Kendaraan B 1234 XYZ melanggar hukum dan harus ditilang.',
                        'evidenceLabel': 'requires_field_verification',
                        'sourceTiersUsed': ['tier_1_manual'],
                        'tier3ContextRefs': [],
                    }
                ],
                'scenarioHypotheses': [],
                'inspectionChecklist': [],
            }
            with patch.object(providers, 'gemini_generate_json', return_value=('gemini-2.5-flash', bad_llm)):
                res = client.post('/api/v1/ai/decision-brief', json=_sample_brief_request())
            assert res.status_code == 200
            body = res.json()
            assert body['llmStatus'] == 'validation_failed'
            assert body['executionTrace']['validatorPassed'] is False
            assert body['brief']['contradictionsAndGaps'][0]['code'] == 'COVERAGE_GAP'

            with patch.object(providers, 'gemini_generate_json', side_effect=providers.ProviderError(429, 'rate limited')):
                err_res = client.post('/api/v1/ai/decision-brief', json=_sample_brief_request())
            assert err_res.status_code == 200
            assert err_res.json()['llmStatus'] == 'error'
            assert err_res.json()['executionTrace']['providerStatuses']['gemini'] == 'error'
        finally:
            storage.DB = original
