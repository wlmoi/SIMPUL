"""International interoperability endpoints: typed, non-persistent, no certification claims.

Public deployment is unsafe without auth/rate limiting; intended for local pilot demos.
"""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Literal
from fastapi import APIRouter
from pydantic import BaseModel, Field, field_validator, model_validator
from server.field_readings import FieldReading

router = APIRouter(prefix='/api/v1', tags=['International practices and data quality'])

STANDARDS = [
 {'reference':'ISO 37120:2018', 'purpose':'City indicator context', 'status':'methodological reference', 'url':'https://www.iso.org/standard/68498.html'},
 {'reference':'ISO 37122:2019', 'purpose':'Smart city indicator context', 'status':'methodological reference', 'url':'https://www.iso.org/standard/69050.html'},
 {'reference':'ISO 39001:2012', 'purpose':'Road traffic safety management context', 'status':'safety governance reference', 'url':'https://www.iso.org/standard/44958.html'},
 {'reference':'ISO 19157-1:2023', 'purpose':'Geographic data quality concepts', 'status':'quality-control inspiration', 'url':'https://www.iso.org/standard/78900.html'},
 {'reference':'ISO 8601-1:2019', 'purpose':'Offset-aware time exchange', 'status':'export convention', 'url':'https://www.iso.org/standard/70907.html'},
 {'reference':'RFC 7946', 'purpose':'GeoJSON WGS84 geographic exchange', 'status':'export convention', 'url':'https://www.rfc-editor.org/rfc/rfc7946'},
 {'reference':'W3C PROV-O', 'purpose':'Evidence provenance metadata', 'status':'provenance mapping', 'url':'https://www.w3.org/TR/prov-o/'},
 {'reference':'WCAG 2.2 AA', 'purpose':'Accessible app interface', 'status':'design target; audit pending', 'url':'https://www.w3.org/TR/WCAG22/'}
]

class ManualObservation(BaseModel):
    id: str = Field(min_length=3, max_length=80, pattern=r'^[A-Za-z0-9_-]+$')
    at: datetime
    source: Literal['manual']
    type: Literal['Jemput', 'Turun', 'Menunggu']
    zone: str = Field(min_length=1, max_length=100)
    duration: float = Field(ge=0, le=3600)
    vehicle: str = Field(min_length=1, max_length=80)
    sessionId: str | None = None

    @field_validator('at')
    @classmethod
    def aware(cls, value: datetime):
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError('Timestamp must contain UTC offset')
        return value

class EvidenceRequest(BaseModel):
    project_id: str = Field(default='local-study',min_length=1,max_length=100)
    project_name: str = Field(default='SIMPUL Study',min_length=1,max_length=200)
    observations: list[ManualObservation] = Field(default_factory=list,max_length=2000)
    intervals: list[FieldReading] = Field(default_factory=list,max_length=2000)
    completed_manual_sessions: int = Field(default=0,ge=0,le=100000)

    @model_validator(mode='after')
    def ids_unique(self):
        # Duplicate data is a quality finding, not an API validation error.
        return self

class StudyPoint(BaseModel):
    project_id: str = Field(min_length=1,max_length=100)
    name: str = Field(min_length=1,max_length=200)
    latitude: float = Field(ge=-90,le=90)
    longitude: float = Field(ge=-180,le=180)

def to_utc(value: datetime) -> str:
    return value.astimezone(timezone.utc).isoformat(timespec='seconds').replace('+00:00','Z')

def quality_check(payload: EvidenceRequest) -> dict:
    ids = [r.id for r in payload.observations] + [r.id for r in payload.intervals]
    repeated=len(ids)-len(set(ids))
    matched_base={(r.zone, r.period) for r in payload.intervals if r.phase=='baseline' and r.scenario=='A0'}
    matched=sum(1 for r in payload.intervals if r.phase=='followup' and (r.zone, r.period) in matched_base)
    findings=[]
    if not ids: findings.append({'severity':'block','code':'NO_FIELD_DATA','message':'No manual observations or intervals provided.'})
    if repeated: findings.append({'severity':'block','code':'DUPLICATE_ID','message':f'{repeated} duplicate record IDs.'})
    if payload.completed_manual_sessions<12: findings.append({'severity':'review','code':'SAMPLING_PLAN','message':'Project proposal targets 12 distinct sessions; this is not an ISO threshold.'})
    if not matched: findings.append({'severity':'review','code':'NO_MATCHED_FOLLOWUP','message':'No matched baseline-to-followup interval by zone and period.'})
    findings.append({'severity':'review','code':'VALIDATION_UNVERIFIED','message':'Independent SUMO calibration, ground truth and safety approval are not established by these records.'})
    return {'readiness':'NOT_READY' if any(f['severity']=='block' for f in findings) else 'EXPLORATORY_ONLY','manual_events':len(payload.observations),'manual_intervals':len(payload.intervals),'duplicates':repeated,'matched_followup_intervals':matched,'completed_manual_sessions':payload.completed_manual_sessions,'findings':findings,'certified':False}

@router.get('/standards')
def standard_catalog():
    return {'service':'SIMPUL','catalog_version':'1.0.0','certification_claim':False,'standards':STANDARDS}

@router.post('/quality/check')
def check(payload: EvidenceRequest):
    return quality_check(payload)

@router.post('/evidence/bundle')
def evidence_bundle(payload: EvidenceRequest):
    checked=quality_check(payload)
    generated_at=to_utc(datetime.now(timezone.utc))
    observations=[{'id':r.id,'observed_at_utc':to_utc(r.at),'zone':r.zone,'category':r.type,'vehicle_category':r.vehicle,'dwell_seconds':r.duration,'source':'manual','session_id':r.sessionId} for r in payload.observations]
    intervals=[{'id':r.id,'observed_at_utc':to_utc(datetime.fromisoformat(r.at.replace('Z','+00:00'))),'zone':r.zone,'period':r.period,'phase':r.phase,'scenario':r.scenario,'observation_minutes':r.minutes,'passing_vehicles':r.passingVehicles,'stopped_vehicles':r.stoppedVehicles,'stopping_events_per_hour':round(60*r.stoppedVehicles/r.minutes,3),'max_queue_vehicles':r.maxQueue,'pedestrian_access_distance_m':r.accessMeters,'pedestrians_observed':r.pedestrians,'access_blocked':r.blockedAccess,'available_pickup_bays':r.availableBays,'occupied_pickup_bays':r.occupiedBays,'source':'manual','session_id':r.sessionId} for r in payload.intervals]
    provenance={'@context':{'prov':'http://www.w3.org/ns/prov#'},'@graph':[{'@id':'urn:simpul:record:'+r['id'],'@type':'prov:Entity','prov:generatedAtTime':r['observed_at_utc']} for r in observations+intervals]}
    return {'schema_version':'1.0.0','generated_at_utc':generated_at,'project':{'id':payload.project_id,'name':payload.project_name},'classification':'NOT_FIELD_VALIDATED','units':{'stopping_events_per_hour':'events/h','pedestrian_access_distance_m':'m','observation_minutes':'min','dwell_seconds':'s'},'quality':checked,'observations':observations,'intervals':intervals,'provenance':provenance,'limitations':['Not certified to any international standard','Synthetic data not accepted','No causal or calibrated SUMO outcome claimed']}

@router.post('/geojson/project')
def project_geojson(point:StudyPoint):
    return {'type':'FeatureCollection','features':[{'type':'Feature','id':point.project_id,'geometry':{'type':'Point','coordinates':[point.longitude,point.latitude]},'properties':{'name':point.name,'location_type':'project_reference_point','accuracy':'not_verified','not_individual_event_coordinate':True}}]}
