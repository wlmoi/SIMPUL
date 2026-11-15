/** Operational event classification for transit curbside monitoring.
 * This is deterministic triage, never an automated legal violation finding.
 * Unknown fields remain unknown; no personal identifiers are used.
 */
export const ZONE_CONTEXT = Object.freeze({
  unknown:'Rambu / fungsi area belum diperiksa',
  designated_pickup:'Area naik-turun yang ditetapkan (perlu verifikasi)',
  general_road:'Tepi jalan umum',
  signed_no_stopping:'Rambu larangan berhenti teramati',
  signed_no_parking:'Rambu larangan parkir teramati'
});
export const IMPACT_STATUS = Object.freeze({unknown:'Belum diperiksa',yes:'Teramati',no:'Tidak teramati'});
export const REVIEW_STATUS = Object.freeze({
  pending:'Belum ditinjau',
  needs_evidence:'Bukti tambahan diperlukan',
  context_reviewed:'Konteks telah ditinjau',
  field_check:'Perlu pemeriksaan lapangan',
  closed:'Ditutup (catatan internal)'
});
export const EVENT_TYPES = Object.freeze({Jemput:'Penjemputan',Turun:'Penurunan',Menunggu:'Menunggu penumpang'});
export const PRIORITY = Object.freeze({P1:'P1 · Periksa keselamatan',P2:'P2 · Tinjau hambatan',P3:'P3 · Observasi berulang',P4:'P4 · Pemantauan rutin'});
const TERNARY=new Set(['yes','no','unknown']);
export const normalizeSignal=value=>TERNARY.has(value)?value:'unknown';
export function classifyTrafficEvent(event,review=null){
  const context=Object.hasOwn(ZONE_CONTEXT,event?.zoneContext)?event.zoneContext:'unknown';
  const lane=normalizeSignal(event?.laneBlocked),pedestrian=normalizeSignal(event?.pedestrianBlocked),queue=normalizeSignal(event?.queueObserved);
  const duration=Number(event?.duration)||0;
  const signVerified=event?.signageVerified===true && Boolean(String(event?.evidenceReference||'').trim());
  let priority='P4',cause='Belum ada dampak terkonfirmasi; pemantauan rutin.';
  if(pedestrian==='yes') {priority='P1';cause='Akses pejalan kaki dilaporkan terhalang. Perlu pemeriksaan keselamatan.';}
  else if(lane==='yes'||queue==='yes'){priority='P2';cause='Hambatan lajur atau antrean dilaporkan teramati.';}
  else if(event?.type==='Menunggu'&&duration>=120){priority='P3';cause='Durasi menunggu panjang; evaluasi pola dan kapasitas penjemputan.';}
  let ruleFlag='unknown',ruleDescription='Belum cukup bukti mengenai aturan yang berlaku pada titik dan waktu pengamatan.';
  if(context==='signed_no_stopping'&&signVerified){ruleFlag='review_rule';ruleDescription='Ada catatan rambu larangan berhenti terverifikasi oleh pengamat; pemeriksaan konteks dan kewenangan tetap diperlukan.';}
  else if(context==='signed_no_parking'&&signVerified){ruleFlag='interpretation_needed';ruleDescription='Rambu larangan parkir tercatat; aktivitas berhenti/menunggu tidak boleh otomatis disamakan dengan parkir.';}
  else if(context==='designated_pickup'&&signVerified){ruleFlag='area_documented';ruleDescription='Area penjemputan tercatat, namun kesesuaian perilaku tetap membutuhkan pemeriksaan aturan setempat.';}
  else if(context!=='unknown' && !signVerified){ruleDescription='Konteks lokasi dicatat tetapi belum didukung referensi rambu/fasilitas yang diperiksa.';}
  return {
    eventId:String(event?.id||''),activity:EVENT_TYPES[event?.type]||'Aktivitas lain',
    zone:String(event?.zone||'Tidak diketahui'),source:event?.source==='manual'?'manual':'demo',
    priority,priorityLabel:PRIORITY[priority],priorityReason:cause,
    context,contextLabel:ZONE_CONTEXT[context],ruleFlag,ruleDescription,
    impact:{lane,pedestrian,queue},
    evidenceStatus:event?.source!=='manual'?'SYNTHETIC':signVerified?'CONTEXT_RECORDED':'FIELD_UNVERIFIED',
    reviewStatus:REVIEW_STATUS[review?.status]?review.status:'pending',
    reviewLabel:REVIEW_STATUS[review?.status]||REVIEW_STATUS.pending,
    legalConclusion:'NOT_DETERMINED'
  };
}
export function classifyTrafficDataset(observations=[],reviews={}){
  return observations.map(event=>({event,classification:classifyTrafficEvent(event,reviews?.[event.id]),review:reviews?.[event.id]||null}));
}
export function trafficClassSummary(observations=[],reviews={}){
  const classified=classifyTrafficDataset(observations,reviews);
  const manual=classified.filter(x=>x.event.source==='manual');
  return {
    total:classified.length,manual:manual.length,synthetic:classified.length-manual.length,
    priorities:Object.fromEntries(['P1','P2','P3','P4'].map(p=>[p,manual.filter(x=>x.classification.priority===p).length])),
    ruleReview:manual.filter(x=>['review_rule','interpretation_needed'].includes(x.classification.ruleFlag)).length,
    pending:manual.filter(x=>x.classification.reviewStatus==='pending').length,
    reviewed:manual.filter(x=>x.classification.reviewStatus!=='pending').length
  };
}
export function makePoliceReviewBundle(state){
  const records=classifyTrafficDataset(state.observations,state.eventReviews).filter(x=>x.event.source==='manual');
  return {
    schema:'simpul.operational_traffic_review.v1',generatedAt:new Date().toISOString(),
    project:{id:state.project?.id||'unknown',name:state.project?.name||'unknown'},
    purpose:'Operational traffic and pedestrian-access review only; not enforcement evidence or automated offence determination.',
    legalConclusion:'NOT_DETERMINED',
    sourcePolicy:'Manual observation records only; synthetic samples excluded. Free-text notes and personal identifiers omitted.',
    records:records.map(x=>({id:x.event.id,at:x.event.at,zone:x.event.zone,activity:x.event.type,vehicleCategory:x.event.vehicle,durationSec:x.event.duration,
      fieldContext:x.classification.context,observedImpact:x.classification.impact,
      contextReference:x.event.evidenceReference||null,signageVerifiedByObserver:x.event.signageVerified===true,
      operationalPriority:x.classification.priority,priorityReason:x.classification.priorityReason,
      ruleReviewFlag:x.classification.ruleFlag,ruleReviewExplanation:x.classification.ruleDescription,
      evidenceStatus:x.classification.evidenceStatus,reviewStatus:x.classification.reviewStatus,
      reviewedAt:x.review?.at||null,reviewerLabel:x.review?.reviewer||null,
      legalConclusion:'NOT_DETERMINED'})),
    reviewAudit:(state.classificationAudit||[]).filter(x=>records.some(r=>r.event.id===x.eventId)).map(x=>({eventId:x.eventId,at:x.at,action:x.action,status:x.status,reviewer:x.reviewer})),
    disclaimer:'Not an official police record. Review by an authorized official and verify the applicable road signs, context and jurisdiction before any enforcement action.'
  };
}
