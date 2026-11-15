/** Action board: operational response, not traffic law adjudication. */
import {classifyTrafficEvent} from './classification.js';
export const CASE_STATUSES=Object.freeze({
  open:'Perlu ditugaskan',assigned:'Ditugaskan',checking:'Pemeriksaan lapangan',resolved:'Selesai ditindaklanjuti',dismissed:'Ditutup tanpa tindakan'
});
export function actionableEvents(state){
  return (state.observations||[]).filter(e=>e.source==='manual')
    .map(event=>({event,assessment:classifyTrafficEvent(event,state.eventReviews?.[event.id])}))
    .filter(x=>['P1','P2'].includes(x.assessment.priority));
}
export function operationalBoard(state,at=new Date()){
  const candidates=actionableEvents(state),events=new Map((state.observations||[]).filter(x=>x.source==='manual').map(x=>[x.id,x]));
  const cases=(state.responseCases||[]).map(record=>{
    const event=events.get(record.eventId)||null;
    const assessment=event?classifyTrafficEvent(event,state.eventReviews?.[event.id]):null;
    const overdue=Boolean(record.dueAt&&Number.isFinite(Date.parse(record.dueAt))&&Date.parse(record.dueAt)<at.getTime()&&!['resolved','dismissed'].includes(record.status));
    return {...record,event,assessment,overdue,sourceMissing:!event};
  });
  return {candidates,cases,open:cases.filter(x=>!['resolved','dismissed'].includes(x.status)).length,
    overdue:cases.filter(x=>x.overdue).length,
    unassigned:candidates.filter(c=>!cases.some(x=>x.eventId===c.event.id)).length,
    closed:cases.filter(x=>['resolved','dismissed'].includes(x.status)).length};
}
export function validateCaseDraft({eventId,owner,action,dueAt},state){
  const candidate=actionableEvents(state).find(x=>x.event.id===eventId);
  if(!candidate)throw new Error('Hanya kejadian manual prioritas P1/P2 yang dapat menjadi tindak lanjut.');
  if((state.responseCases||[]).some(c=>c.eventId===eventId))throw new Error('Kejadian ini sudah memiliki catatan tindak lanjut.');
  if(String(owner||'').trim().length<2||String(action||'').trim().length<10)throw new Error('Isi penanggung jawab dan rencana tindakan minimal 10 karakter.');
  if(dueAt && (!Number.isFinite(Date.parse(dueAt))||Date.parse(dueAt)<Date.now()-60000))throw new Error('Batas tindak lanjut harus tanggal/waktu yang sah dan tidak di masa lalu.');
  return {eventId,owner:String(owner).trim().slice(0,80),action:String(action).trim().slice(0,350),dueAt:dueAt?new Date(dueAt).toISOString():null};
}
export function validateCaseUpdate(record,status,reason){
  if(!record)throw new Error('Kasus operasional tidak ditemukan.');
  if(!Object.hasOwn(CASE_STATUSES,status))throw new Error('Status tindak lanjut tidak dikenal.');
  if(['resolved','dismissed'].includes(status)&&String(reason||'').trim().length<10)throw new Error('Penutupan memerlukan alasan minimal 10 karakter.');
  return {status,reason:String(reason||'').trim().slice(0,500)};
}
export function exportOperations(state){
  const board=operationalBoard(state);
  return {schema:'simpul.operational_response.v1',generatedAt:new Date().toISOString(),
    notice:'Internal operational follow-up only; does not establish an offense or official police action.',
    cases:board.cases.filter(c=>!c.sourceMissing).map(c=>({id:c.id,eventId:c.eventId,eventAt:c.event.at,zone:c.event.zone,
      observedActivity:c.event.type,priority:c.assessment.priority,status:c.status,createdAt:c.createdAt,dueAt:c.dueAt,updatedAt:c.updatedAt||null,
      evidenceStatus:c.assessment.evidenceStatus,legalConclusion:'NOT_DETERMINED'})),
    statusHistory:(state.responseAudit||[]).filter(x=>board.cases.some(c=>!c.sourceMissing&&c.id===x.caseId)).map(x=>({caseId:x.caseId,eventId:x.eventId,at:x.at,status:x.status,action:x.action}))};
}
