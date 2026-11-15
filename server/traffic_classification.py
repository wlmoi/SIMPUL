"""Deterministic, non-enforcement event triage with versioned API contracts.

No facial, plate or driver identification. No legal offence determination.
No real-time transmission to law enforcement. Local-only without authentication.
"""
from collections import Counter
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Any
from .storage import Event
router=APIRouter(prefix='/api/v1/traffic',tags=['traffic classification'])

CONTEXTS={
 'unknown':'Rambu / fungsi area belum diperiksa',
 'designated_pickup':'Area naik-turun (perlu verifikasi)',
 'general_road':'Tepi jalan umum',
 'signed_no_stopping':'Rambu larangan berhenti teramati',
 'signed_no_parking':'Rambu larangan parkir teramati'
}
REVIEW_STATUSES={'pending':'Belum ditinjau','needs_evidence':'Bukti tambahan diperlukan',
 'context_reviewed':'Konteks telah ditinjau','field_check':'Perlu pemeriksaan lapangan',
 'closed':'Ditutup (catatan internal)'}

def classify_record(record:dict)->dict:
    pedestrian=record.get('pedestrianBlocked','unknown')
    lane=record.get('laneBlocked','unknown')
    queue=record.get('queueObserved','unknown')
    dwell=float(record.get('duration',0))
    priority='P1' if pedestrian=='yes' else ('P2' if lane=='yes' or queue=='yes' else ('P3' if record.get('type')=='Menunggu' and dwell>=120 else 'P4'))
    context=record.get('zoneContext','unknown')
    sign=bool(record.get('signageVerified',False) and record.get('evidenceReference',''))
    flag=('review_rule' if context=='signed_no_stopping' and sign else
          'interpretation_needed' if context=='signed_no_parking' and sign else
          'area_documented' if context=='designated_pickup' and sign else 'unknown')
    return {'eventId':record.get('id'), 'activity':record.get('type'), 'zone':record.get('zone'),
            'source':record.get('source'), 'priority':priority,
            'impact':{'lane':lane,'pedestrian':pedestrian,'queue':queue},
            'ruleContext':context,'ruleFlag':flag,
            'evidenceStatus':'CONTEXT_RECORDED' if sign else 'FIELD_UNVERIFIED',
            'legalConclusion':'NOT_DETERMINED'}

class ClassificationBatch(BaseModel):
    items:list[Event]=Field(min_length=1,max_length=500)

@router.get('/taxonomy')
def taxonomy():
    return {'schema':'simpul.traffic_taxonomy.v1',
            'activityTypes':['Jemput','Turun','Menunggu'],
            'contexts':CONTEXTS, 'impacts':['unknown','yes','no'],
            'priorityDefinitions':{'P1':'Reported pedestrian access obstruction',
                                  'P2':'Reported lane blockage or queue',
                                  'P3':'Waiting >=120 seconds (screening threshold, not a legal limit)',
                                  'P4':'Routine monitoring'},
            'reviewStatuses':REVIEW_STATUSES,
            'legalConclusion':'NOT_DETERMINED', 'policeIntegration':False,
            'note':'Operational triage only; legal determination requires independently verified context and authorized review.'}

@router.post('/classify')
def classify(batch:ClassificationBatch):
    classified=[classify_record(x.model_dump()) for x in batch.items]
    count=Counter(x['priority'] for x in classified)
    return {'schema':'simpul.traffic_assessment.v1','source':'manual only',
            'results':classified,'summary':{p:count[p] for p in ('P1','P2','P3','P4')},
            'legalConclusion':'NOT_DETERMINED','persisted':False,
            'warning':'Stateless API; no authentication or law enforcement integration. Not suitable for production police case handling.'}
