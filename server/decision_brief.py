"""Single-pass neuro-symbolic decision brief API and coordinator-signed CV window storage."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from hashlib import sha256
import json
import logging
import re
import time
from typing import Literal
import uuid

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict, Field, field_validator

from . import monitoring, providers, storage

router = APIRouter(prefix='/api/v1', tags=['Decision brief'])

PROMPT_VERSION = 'decision-brief-v1'
CONTEXT_TTL_MINUTES = 15
_ID_PATTERN = r'^[a-zA-Z0-9_-]+$'

_SCENARIO_BOUNDS: dict[str, dict[str, tuple[float, float, bool]]] = {
    'A0': {'traffic': (200, 1500, True), 'pickupShare': (0, 45, False), 'dwell': (5, 180, False)},
    'A1': {
        'traffic': (200, 1500, True),
        'pickupShare': (0, 45, False),
        'dwell': (5, 180, False),
        'diversion': (0, 100, False),
    },
    'A2': {
        'traffic': (200, 1500, True),
        'pickupShare': (0, 45, False),
        'dwell': (5, 180, False),
        'ruleDwell': (5, 120, False),
        'pedestrianDetour': (0, 500, False),
    },
}

_PLATE_CASE_SENSITIVE_RE = re.compile(r'\b[A-Z]{1,2}\s?\d{1,4}\s?[A-Z]{1,3}\b')
_BLOCKLIST_CASE_INSENSITIVE_RE = re.compile(
    r'\b(plat nomor|nomor polisi|nopol|tilang|denda|sita|penindakan|tindak pidana|melanggar hukum|terbukti bersalah|pelanggaran pidana|hukuman)\b',
    re.I,
)
_ZONE_NORM_PATTERNS: tuple[tuple[re.Pattern[str], str], ...] = (
    (re.compile(r'\bzon[ae]\s*a\b', re.I), 'Zona A'),
    (re.compile(r'\bzon[ae]\s*b\b', re.I), 'Zona B'),
    (re.compile(r'\bzon[ae]\s*c\b', re.I), 'Zona C'),
)


def _parse_tz_iso(value: str) -> datetime:
    try:
        parsed = datetime.fromisoformat(value.replace('Z', '+00:00'))
    except ValueError as exc:
        raise ValueError('Timestamp harus format ISO 8601 yang sah.') from exc
    if parsed.tzinfo is None or not (2000 <= parsed.year <= 2100):
        raise ValueError('Timestamp wajib menyertakan zona waktu.')
    return parsed


class CvReviewedWindowInput(BaseModel):
    model_config = ConfigDict(extra='forbid')

    windowId: str = Field(min_length=3, max_length=80, pattern=_ID_PATTERN)
    signedOffAt: str = Field(min_length=8, max_length=45)
    windowStart: str = Field(min_length=8, max_length=45)
    windowEnd: str = Field(min_length=8, max_length=45)
    reviewerLabel: str = Field(min_length=2, max_length=60)
    zone: Literal['Zona A', 'Zona B', 'Zona C', 'Area A1']
    period: Literal['Jam sibuk', 'Luar jam sibuk']
    mode: Literal['ai']
    vehicleCountsByClass: dict[Literal['car', 'motorcycle', 'bus'], int]
    meanDwellSec: float = Field(ge=0, le=3600)
    overThresholdCount: int = Field(ge=0, le=10000)

    @field_validator('signedOffAt', 'windowStart', 'windowEnd')
    @classmethod
    def check_iso_tz(cls, value: str) -> str:
        _parse_tz_iso(value)
        return value

    @field_validator('reviewerLabel')
    @classmethod
    def check_reviewer(cls, value: str) -> str:
        trimmed = value.strip()
        if len(trimmed) < 2 or len(trimmed) > 60:
            raise ValueError('reviewerLabel harus berisi 2–60 karakter.')
        return trimmed

    @field_validator('vehicleCountsByClass')
    @classmethod
    def check_counts(cls, value: dict[str, int]) -> dict[str, int]:
        for k, count in value.items():
            if count < 0 or count > 10000:
                raise ValueError(f'Jumlah kendaraan untuk {k} harus antara 0 dan 10000.')
        return value


class BriefFlagItem(BaseModel):
    model_config = ConfigDict(extra='forbid')

    code: Literal[
        'COVERAGE_GAP',
        'BAY_CURB_BLIND_SPOT',
        'CONTEXT_CURB_MISMATCH',
        'PDF_UNVERIFIED_OVERLAP',
        'DIAGNOSTIC_WARNING',
    ]
    zone: Literal['Zona A', 'Zona B', 'Zona C', 'Area A1', 'Corridor']
    period: Literal['Jam sibuk', 'Luar jam sibuk', 'All']
    reason: str = Field(min_length=1, max_length=300)
    evidenceLabel: Literal['requires_field_verification', 'contextual_signal_only']
    sourceTiersUsed: list[Literal['tier_1_manual', 'tier_2_cv_reviewed', 'tier_3_contextual_unverified']] = Field(
        default_factory=list, max_length=3
    )
    tier3ContextRefs: list[str] = Field(default_factory=list, max_length=10)


class ScenarioHypothesis(BaseModel):
    model_config = ConfigDict(extra='forbid')

    scenario: Literal['A0', 'A1', 'A2']
    title: str = Field(min_length=1, max_length=120)
    rationale: str = Field(min_length=1, max_length=300)
    params: dict[Literal['traffic', 'pickupShare', 'dwell', 'diversion', 'ruleDwell', 'pedestrianDetour'], float | int]
    label: Literal['synthetic_hypothesis_uncalibrated'] = 'synthetic_hypothesis_uncalibrated'


class ChecklistItem(BaseModel):
    model_config = ConfigDict(extra='forbid')

    zone: Literal['Zona A', 'Zona B', 'Zona C', 'Area A1']
    period: Literal['Jam sibuk', 'Luar jam sibuk']
    question: str = Field(min_length=1, max_length=240)
    evidenceLabel: Literal['requires_field_verification', 'contextual_signal_only']


class ManualImpacts(BaseModel):
    model_config = ConfigDict(extra='forbid')

    laneYes: int = Field(ge=0, le=100000)
    laneUnknown: int = Field(ge=0, le=100000)
    pedYes: int = Field(ge=0, le=100000)
    pedUnknown: int = Field(ge=0, le=100000)
    queueYes: int = Field(ge=0, le=100000)


class ManualSummary(BaseModel):
    model_config = ConfigDict(extra='forbid')

    syntheticExcluded: Literal[True]
    totalEvents: int = Field(ge=0, le=100000)
    byType: dict[Literal['Jemput', 'Turun', 'Menunggu'], int]
    byZone: dict[Literal['Zona A', 'Zona B', 'Zona C'], int]
    meanDwellSec: float | None = Field(default=None, ge=0, le=3600)
    overThresholdCount: int = Field(ge=0, le=100000)
    impacts: ManualImpacts


class MissingSlot(BaseModel):
    model_config = ConfigDict(extra='forbid')

    zone: Literal['Zona A', 'Zona B', 'Zona C']
    period: Literal['Jam sibuk', 'Luar jam sibuk']
    completed: int = Field(ge=0, le=5)
    target: int = Field(ge=1, le=5)


class SurveyCoverageSummary(BaseModel):
    model_config = ConfigDict(extra='forbid')

    completedSlots: int = Field(ge=0, le=30)
    targetSlots: int = Field(default=12, ge=1, le=30)
    baselineIntervals: int = Field(ge=0, le=3000)
    followupIntervals: int = Field(ge=0, le=3000)
    missingSlots: list[MissingSlot] = Field(default_factory=list, max_length=30)


class PreflightBrief(BaseModel):
    model_config = ConfigDict(extra='forbid')

    contradictionsAndGaps: list[BriefFlagItem] = Field(default_factory=list, max_length=40)
    scenarioHypotheses: list[ScenarioHypothesis] = Field(default_factory=list, max_length=6)
    inspectionChecklist: list[ChecklistItem] = Field(default_factory=list, max_length=30)
    diagnosticWarningsCount: int = Field(ge=0, le=100)
    qualityStatus: Literal['not_ready', 'exploratory_only']


class GeoPoint(BaseModel):
    model_config = ConfigDict(extra='forbid')

    lat: float = Field(ge=-90, le=90)
    lon: float = Field(ge=-180, le=180)


class CachedWeather(BaseModel):
    model_config = ConfigDict(extra='forbid')

    checkedAt: str | None = None
    rain: float | None = None
    weatherCode: int | None = None


class CachedTraffic(BaseModel):
    model_config = ConfigDict(extra='forbid')

    checkedAt: str | None = None
    speedRatio: float | None = Field(default=None, ge=0, le=5)


class CachedNearby(BaseModel):
    model_config = ConfigDict(extra='forbid')

    checkedAt: str | None = None
    count: int | None = Field(default=None, ge=0, le=1000)


class CachedContext(BaseModel):
    model_config = ConfigDict(extra='forbid')

    projectGeo: GeoPoint | None = None
    weather: CachedWeather | None = None
    traffic: CachedTraffic | None = None
    nearby: CachedNearby | None = None


class SimulationSnapshot(BaseModel):
    model_config = ConfigDict(extra='forbid')

    engine: Literal['heuristic', 'sumo'] | None = None
    scenario: dict[
        Literal['traffic', 'pickupShare', 'dwell', 'diversion', 'ruleDwell', 'pedestrianDetour'],
        float | int,
    ] | None = None
    scenarioClamped: bool = False


class DecisionBriefRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')

    manualSummary: ManualSummary
    surveyCoverage: SurveyCoverageSummary
    preflightBrief: PreflightBrief
    cvReviewedIds: list[str] = Field(default_factory=list, max_length=50)
    cvReviewedWindows: list[CvReviewedWindowInput] = Field(default_factory=list, max_length=50)
    cachedContext: CachedContext = Field(default_factory=CachedContext)
    simulationSnapshot: SimulationSnapshot | None = None
    includeLocalPdf: bool = True

    @field_validator('cvReviewedIds')
    @classmethod
    def check_cv_ids(cls, value: list[str]) -> list[str]:
        pat = re.compile(_ID_PATTERN)
        for item in value:
            if not (3 <= len(item) <= 80 and pat.match(item)):
                raise ValueError(f'cvReviewedId tidak valid: {item}')
        return value


def init_cv_reviewed_table(conn) -> None:
    """Create the cv_reviewed_windows table using storage.connect()."""
    conn.execute(
        '''CREATE TABLE IF NOT EXISTS cv_reviewed_windows (
            window_id TEXT PRIMARY KEY,
            signed_off_at TEXT NOT NULL,
            reviewer_label TEXT NOT NULL,
            zone TEXT NOT NULL,
            period TEXT NOT NULL,
            is_bay_zone INTEGER NOT NULL,
            window_start TEXT NOT NULL,
            window_end TEXT NOT NULL,
            mode TEXT NOT NULL,
            vehicle_counts_json TEXT NOT NULL,
            mean_dwell_sec REAL NOT NULL,
            over_threshold_count INTEGER NOT NULL,
            payload_hash TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )'''
    )


def _window_payload_hash(item: CvReviewedWindowInput) -> str:
    canonical = {
        'zone': item.zone,
        'period': item.period,
        'windowStart': item.windowStart,
        'windowEnd': item.windowEnd,
        'vehicleCountsByClass': {k: item.vehicleCountsByClass.get(k, 0) for k in ('car', 'motorcycle', 'bus')},
        'meanDwellSec': round(float(item.meanDwellSec), 3),
        'overThresholdCount': int(item.overThresholdCount),
    }
    return sha256(json.dumps(canonical, sort_keys=True).encode('utf-8')).hexdigest()


def _upsert_cv_reviewed(item: CvReviewedWindowInput) -> dict:
    payload_hash = _window_payload_hash(item)
    counts_json = json.dumps(
        {k: int(item.vehicleCountsByClass.get(k, 0)) for k in ('car', 'motorcycle', 'bus')},
        sort_keys=True,
    )
    with storage._lock:
        with storage.connect() as conn:
            init_cv_reviewed_table(conn)
            existing = conn.execute(
                'SELECT payload_hash FROM cv_reviewed_windows WHERE window_id = ?',
                (item.windowId,),
            ).fetchone()
            if existing is not None:
                if existing[0] == payload_hash:
                    return {'status': 'already_present', 'windowId': item.windowId}
                raise HTTPException(
                    409,
                    'windowId sudah terdaftar dengan ringkasan berbeda (windowId already registered with a different summary).',
                )
            conn.execute(
                '''INSERT INTO cv_reviewed_windows (
                    window_id, signed_off_at, reviewer_label, zone, period,
                    is_bay_zone, window_start, window_end, mode,
                    vehicle_counts_json, mean_dwell_sec, over_threshold_count, payload_hash
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                (
                    item.windowId,
                    item.signedOffAt,
                    item.reviewerLabel,
                    item.zone,
                    item.period,
                    1 if item.zone == 'Area A1' else 0,
                    item.windowStart,
                    item.windowEnd,
                    item.mode,
                    counts_json,
                    float(item.meanDwellSec),
                    int(item.overThresholdCount),
                    payload_hash,
                ),
            )
    return {'status': 'inserted', 'windowId': item.windowId}


def _normalize_pdf_zone(raw_zone: str) -> str:
    for pattern, canonical in _ZONE_NORM_PATTERNS:
        if pattern.search(raw_zone or ''):
            return canonical
    return 'other_unmapped'


def _pdf_period_wib(raw_at: str) -> str:
    wib_tz = timezone(timedelta(hours=7))
    try:
        dt = _parse_tz_iso(raw_at).astimezone(wib_tz)
    except ValueError:
        return 'Luar jam sibuk'
    if 6 <= dt.hour <= 9 or 16 <= dt.hour <= 20:
        return 'Jam sibuk'
    return 'Luar jam sibuk'


def _read_pdf_summary(include_pdf: bool, missing_slots: list[MissingSlot]) -> tuple[dict, str, list[BriefFlagItem]]:
    if not include_pdf:
        return {'available': False, 'totalRecords': 0, 'byZonePeriod': {}}, 'unavailable', []
    with storage._lock:
        with storage.connect() as conn:
            has_table = conn.execute(
                "SELECT 1 FROM sqlite_master WHERE type='table' AND name='pdf_observation_records'"
            ).fetchone()
            if not has_table:
                return {'available': False, 'totalRecords': 0, 'byZonePeriod': {}}, 'unavailable', []
            rows = conn.execute('SELECT payload FROM pdf_observation_records').fetchall()

    by_zone_period: dict[str, int] = {}
    for (raw_payload,) in rows:
        try:
            rec = json.loads(raw_payload)
        except ValueError:
            continue
        zone = _normalize_pdf_zone(str(rec.get('zone') or ''))
        period = _pdf_period_wib(str(rec.get('at') or ''))
        key = f'{zone}|{period}'
        by_zone_period[key] = by_zone_period.get(key, 0) + 1

    overlap_flags: list[BriefFlagItem] = []
    for slot in missing_slots:
        key = f'{slot.zone}|{slot.period}'
        count = by_zone_period.get(key, 0)
        if count > 0 and slot.completed < slot.target:
            overlap_flags.append(
                BriefFlagItem(
                    code='PDF_UNVERIFIED_OVERLAP',
                    zone=slot.zone,
                    period=slot.period,
                    reason=(
                        f'Catatan PDF belum terverifikasi ({count} entri) ada pada {slot.zone} ({slot.period}), '
                        f'sementara cakupan manual baru {slot.completed}/{slot.target} sesi.'
                    )[:300],
                    evidenceLabel='contextual_signal_only',
                    sourceTiersUsed=['tier_3_contextual_unverified'],
                    tier3ContextRefs=[f'pdf:{key}'],
                )
            )
    return {'available': True, 'totalRecords': len(rows), 'byZonePeriod': by_zone_period}, 'available', overlap_flags


def _load_merged_cv_windows(ids: list[str], inline_windows: list[CvReviewedWindowInput]) -> list[dict]:
    merged: dict[str, dict] = {}
    if ids:
        placeholders = ','.join('?' for _ in ids)
        with storage._lock:
            with storage.connect() as conn:
                init_cv_reviewed_table(conn)
                rows = conn.execute(
                    f'''SELECT window_id, zone, period, is_bay_zone, window_start, window_end,
                               vehicle_counts_json, mean_dwell_sec, over_threshold_count
                        FROM cv_reviewed_windows
                        WHERE window_id IN ({placeholders})''',
                    tuple(ids),
                ).fetchall()
        for r in rows:
            counts = json.loads(r[6])
            merged[r[0]] = {
                'windowId': r[0],
                'zone': r[1],
                'period': r[2],
                'isBayZone': bool(r[3]),
                'windowStart': r[4],
                'windowEnd': r[5],
                'vehicleCountsByClass': counts,
                'totalVehicles': sum(int(v) for v in counts.values()),
                'meanDwellSec': float(r[7]),
                'overThresholdCount': int(r[8]),
            }
    for win in inline_windows:
        if win.windowId not in merged:
            counts = {k: int(win.vehicleCountsByClass.get(k, 0)) for k in ('car', 'motorcycle', 'bus')}
            merged[win.windowId] = {
                'windowId': win.windowId,
                'zone': win.zone,
                'period': win.period,
                'isBayZone': win.zone == 'Area A1',
                'windowStart': win.windowStart,
                'windowEnd': win.windowEnd,
                'vehicleCountsByClass': counts,
                'totalVehicles': sum(counts.values()),
                'meanDwellSec': float(win.meanDwellSec),
                'overThresholdCount': int(win.overThresholdCount),
            }
    return list(merged.values())


def _compute_bay_utilization(windows: list[dict]) -> dict:
    bay_windows = [w for w in windows if w['zone'] == 'Area A1']
    total_vehicles = sum(w['totalVehicles'] for w in bay_windows)
    over_threshold = sum(w['overThresholdCount'] for w in bay_windows)
    if total_vehicles > 0:
        weighted_sum = sum(w['meanDwellSec'] * w['totalVehicles'] for w in bay_windows)
        mean_dwell = round(weighted_sum / total_vehicles, 2)
    else:
        mean_dwell = None
    return {
        'windows': len(bay_windows),
        'totalVehicles': total_vehicles,
        'meanDwellSec': mean_dwell,
        'overThresholdCount': over_threshold,
    }


def _context_freshness(checked_at: str | None, *, has_geo: bool = True, geo_bound: bool = False) -> str:
    if geo_bound and not has_geo:
        return 'project_geo_unset'
    if not checked_at:
        return 'unavailable'
    try:
        dt = _parse_tz_iso(checked_at).astimezone(timezone.utc)
    except ValueError:
        return 'stale'
    age = datetime.now(timezone.utc) - dt
    return 'fresh' if age <= timedelta(minutes=CONTEXT_TTL_MINUTES) else 'stale'


def _gemini_response_schema() -> dict:
    return {
        'type': 'OBJECT',
        'properties': {
            'contradictionsAndGaps': {
                'type': 'ARRAY',
                'items': {
                    'type': 'OBJECT',
                    'properties': {
                        'code': {
                            'type': 'STRING',
                            'enum': [
                                'COVERAGE_GAP',
                                'BAY_CURB_BLIND_SPOT',
                                'CONTEXT_CURB_MISMATCH',
                                'PDF_UNVERIFIED_OVERLAP',
                                'DIAGNOSTIC_WARNING',
                            ],
                        },
                        'zone': {'type': 'STRING', 'enum': ['Zona A', 'Zona B', 'Zona C', 'Area A1', 'Corridor']},
                        'period': {'type': 'STRING', 'enum': ['Jam sibuk', 'Luar jam sibuk', 'All']},
                        'reason': {'type': 'STRING'},
                        'evidenceLabel': {
                            'type': 'STRING',
                            'enum': ['requires_field_verification', 'contextual_signal_only'],
                        },
                        'sourceTiersUsed': {
                            'type': 'ARRAY',
                            'items': {
                                'type': 'STRING',
                                'enum': ['tier_1_manual', 'tier_2_cv_reviewed', 'tier_3_contextual_unverified'],
                            },
                        },
                        'tier3ContextRefs': {'type': 'ARRAY', 'items': {'type': 'STRING'}},
                    },
                    'required': ['code', 'zone', 'period', 'reason', 'evidenceLabel', 'sourceTiersUsed', 'tier3ContextRefs'],
                },
            },
            'scenarioHypotheses': {
                'type': 'ARRAY',
                'items': {
                    'type': 'OBJECT',
                    'properties': {
                        'scenario': {'type': 'STRING', 'enum': ['A0', 'A1', 'A2']},
                        'title': {'type': 'STRING'},
                        'rationale': {'type': 'STRING'},
                        'params': {
                            'type': 'OBJECT',
                            'properties': {
                                'traffic': {'type': 'INTEGER'},
                                'pickupShare': {'type': 'INTEGER'},
                                'dwell': {'type': 'INTEGER'},
                                'diversion': {'type': 'INTEGER'},
                                'ruleDwell': {'type': 'INTEGER'},
                                'pedestrianDetour': {'type': 'INTEGER'},
                            },
                        },
                    },
                    'required': ['scenario', 'title', 'rationale', 'params'],
                },
            },
            'inspectionChecklist': {
                'type': 'ARRAY',
                'items': {
                    'type': 'OBJECT',
                    'properties': {
                        'zone': {'type': 'STRING', 'enum': ['Zona A', 'Zona B', 'Zona C', 'Area A1']},
                        'period': {'type': 'STRING', 'enum': ['Jam sibuk', 'Luar jam sibuk']},
                        'question': {'type': 'STRING'},
                        'evidenceLabel': {
                            'type': 'STRING',
                            'enum': ['requires_field_verification', 'contextual_signal_only'],
                        },
                    },
                    'required': ['zone', 'period', 'question', 'evidenceLabel'],
                },
            },
        },
        'required': ['contradictionsAndGaps', 'scenarioHypotheses', 'inspectionChecklist'],
    }


def _contains_blocked_text(text: str) -> bool:
    return bool(_PLATE_CASE_SENSITIVE_RE.search(text) or _BLOCKLIST_CASE_INSENSITIVE_RE.search(text))


def _validate_and_clamp_llm(raw: dict) -> tuple[dict, list[str]] | None:
    if not isinstance(raw, dict):
        return None
    clamped_fields: list[str] = []
    try:
        flags = [BriefFlagItem.model_validate(item).model_dump() for item in raw.get('contradictionsAndGaps', [])]
        checklist = [ChecklistItem.model_validate(item).model_dump() for item in raw.get('inspectionChecklist', [])]
        hypotheses: list[dict] = []
        for raw_hyp in raw.get('scenarioHypotheses', []):
            if not isinstance(raw_hyp, dict):
                return None
            scenario = raw_hyp.get('scenario')
            if scenario not in _SCENARIO_BOUNDS:
                return None
            allowed = _SCENARIO_BOUNDS[scenario]
            raw_params = raw_hyp.get('params')
            if not isinstance(raw_params, dict):
                return None
            clean_params: dict[str, float | int] = {}
            for key, val in raw_params.items():
                if key not in allowed or isinstance(val, bool) or not isinstance(val, (int, float)):
                    continue
                lo, hi, is_int = allowed[key]
                clamped = max(lo, min(hi, float(val)))
                if clamped != float(val):
                    clamped_fields.append(f'{scenario}.{key}')
                clean_params[key] = int(round(clamped)) if is_int else round(clamped, 2)
            hyp = ScenarioHypothesis.model_validate(
                {
                    'scenario': scenario,
                    'title': str(raw_hyp.get('title', '')),
                    'rationale': str(raw_hyp.get('rationale', '')),
                    'params': clean_params,
                    'label': 'synthetic_hypothesis_uncalibrated',
                }
            ).model_dump()
            hypotheses.append(hyp)
    except Exception:
        return None

    texts = (
        [f['reason'] for f in flags]
        + [h['title'] for h in hypotheses]
        + [h['rationale'] for h in hypotheses]
        + [c['question'] for c in checklist]
    )
    if any(_contains_blocked_text(t) for t in texts):
        return None
    return {
        'contradictionsAndGaps': flags,
        'scenarioHypotheses': hypotheses,
        'inspectionChecklist': checklist,
    }, clamped_fields


def _build_allowlisted_prompt(req: DecisionBriefRequest, cv_windows: list[dict], pdf_summary: dict, overlap_flags: list[BriefFlagItem], provider_statuses: dict) -> str:
    cv_counts_by_zone_period: dict[str, dict] = {}
    for w in cv_windows:
        key = f"{w['zone']}|{w['period']}"
        bucket = cv_counts_by_zone_period.setdefault(
            key, {'windows': 0, 'totalVehicles': 0, 'overThresholdCount': 0}
        )
        bucket['windows'] += 1
        bucket['totalVehicles'] += w['totalVehicles']
        bucket['overThresholdCount'] += w['overThresholdCount']

    allowlisted_bundle = {
        'promptVersion': PROMPT_VERSION,
        'tier_1_manual': {
            'manualSummary': req.manualSummary.model_dump(),
            'surveyCoverage': req.surveyCoverage.model_dump(),
            'diagnosticWarningsCount': req.preflightBrief.diagnosticWarningsCount,
            'qualityStatus': req.preflightBrief.qualityStatus,
        },
        'tier_2_cv_reviewed': {'byZonePeriod': cv_counts_by_zone_period},
        'tier_3_contextual_unverified': {
            'providerStatuses': provider_statuses,
            'weather': (
                {'rain': req.cachedContext.weather.rain, 'weatherCode': req.cachedContext.weather.weatherCode}
                if req.cachedContext.weather and provider_statuses['weather'] == 'fresh'
                else None
            ),
            'traffic': (
                {'speedRatio': req.cachedContext.traffic.speedRatio}
                if req.cachedContext.traffic and provider_statuses['traffic'] == 'fresh'
                else None
            ),
            'nearbyCount': (
                req.cachedContext.nearby.count
                if req.cachedContext.nearby and provider_statuses['nearby'] == 'fresh'
                else None
            ),
            'pdfByZonePeriod': pdf_summary['byZonePeriod'],
            'simulationSnapshot': req.simulationSnapshot.model_dump() if req.simulationSnapshot else None,
        },
        'preflightFlags': [f.model_dump() for f in req.preflightBrief.contradictionsAndGaps]
        + [f.model_dump() for f in overlap_flags],
        'baselineChecklists': [c.model_dump() for c in req.preflightBrief.inspectionChecklist],
        'baselineHypotheses': [h.model_dump() for h in req.preflightBrief.scenarioHypotheses],
    }
    return (
        'Anda adalah asisten koordinator survei mobilitas di koridor MRT Fatmawati. '
        'Hanya gunakan angka, flag preflight, dan token enum tertutup dari payload JSON berikut. '
        'Jangan menyimpulkan pelanggaran hukum, jangan menyebut plat nomor/identitas, dan jangan mempromosikan tier_3 sebagai bukti lapangan.\n'
        + json.dumps(allowlisted_bundle, ensure_ascii=False)
    )


@router.post('/cv-reviewed')
def submit_cv_reviewed(window: CvReviewedWindowInput) -> dict:
    result = _upsert_cv_reviewed(window)
    monitoring.record_event('decision_brief', 'cv_reviewed_saved', ref_id=window.windowId, detail=f'zone={window.zone};status={result["status"]}')
    return result


@router.post('/ai/decision-brief')
def create_decision_brief(req: DecisionBriefRequest) -> dict:
    started = time.monotonic()
    run_id = f'db-{uuid.uuid4().hex[:12]}'
    cv_windows = _load_merged_cv_windows(req.cvReviewedIds, req.cvReviewedWindows)
    bay_utilization = _compute_bay_utilization(cv_windows)

    pdf_summary, pdf_status, overlap_flags = _read_pdf_summary(req.includeLocalPdf, req.surveyCoverage.missingSlots)
    has_geo = req.cachedContext.projectGeo is not None
    provider_statuses = {
        'gemini': 'unavailable',
        'weather': _context_freshness(req.cachedContext.weather.checkedAt if req.cachedContext.weather else None, has_geo=has_geo, geo_bound=True),
        'traffic': _context_freshness(req.cachedContext.traffic.checkedAt if req.cachedContext.traffic else None, has_geo=has_geo, geo_bound=True),
        'nearby': _context_freshness(req.cachedContext.nearby.checkedAt if req.cachedContext.nearby else None, has_geo=True, geo_bound=False),
        'pdf': pdf_status,
    }

    fallback_flags = [f.model_dump() for f in req.preflightBrief.contradictionsAndGaps] + [f.model_dump() for f in overlap_flags]
    fallback_brief = {
        'contradictionsAndGaps': fallback_flags,
        'scenarioHypotheses': [h.model_dump() for h in req.preflightBrief.scenarioHypotheses],
        'inspectionChecklist': [c.model_dump() for c in req.preflightBrief.inspectionChecklist],
        'legalConclusion': 'NOT_DETERMINED',
        'bayUtilization': bay_utilization,
    }

    prompt = _build_allowlisted_prompt(req, cv_windows, pdf_summary, overlap_flags, provider_statuses)
    llm_status = 'unavailable'
    llm_model: str | None = None
    validator_passed = False
    clamped_fields: list[str] = []
    final_brief = fallback_brief

    try:
        llm_model, raw_llm = providers.gemini_generate_json(
            prompt,
            _gemini_response_schema(),
            timeout=25,
            temperature=0.2,
            max_output_tokens=2048,
        )
        validated = _validate_and_clamp_llm(raw_llm)
        if validated is None:
            logging.getLogger('uvicorn.error').warning('decision_brief validation failed for model=%s', llm_model)
            llm_status = 'validation_failed'
        else:
            brief_core, clamped_fields = validated
            final_brief = {
                **brief_core,
                'legalConclusion': 'NOT_DETERMINED',
                'bayUtilization': bay_utilization,
            }
            llm_status = 'ok'
            validator_passed = True
    except providers.ProviderError as exc:
        logging.getLogger('uvicorn.error').warning('decision_brief provider status=%s detail=%s', exc.status_code, exc.detail)
        llm_status = 'unavailable' if exc.status_code == 503 else 'error'

    provider_statuses['gemini'] = llm_status
    preflight_flag_codes = list(dict.fromkeys(item['code'] for item in final_brief['contradictionsAndGaps']))
    duration_ms = round((time.monotonic() - started) * 1000)

    execution_trace = {
        'runId': run_id,
        'promptVersion': PROMPT_VERSION,
        'tierCounts': {
            'manualEvents': req.manualSummary.totalEvents,
            'cvReviewedWindows': len(cv_windows),
            'pdfRecords': pdf_summary['totalRecords'],
        },
        'providerStatuses': provider_statuses,
        'preflightFlags': preflight_flag_codes,
        'clampedFields': clamped_fields,
        'llmStatus': llm_status,
        'validatorPassed': validator_passed,
        'durationMs': duration_ms,
    }

    monitoring.record_event(
        'decision_brief',
        'brief_generated',
        ref_id=run_id,
        detail=f'llm={llm_status};manual={req.manualSummary.totalEvents};cv={len(cv_windows)}',
    )

    return {
        'brief': final_brief,
        'llmStatus': llm_status,
        'llmModel': llm_model,
        'pdfSummary': pdf_summary,
        'executionTrace': execution_trace,
    }
