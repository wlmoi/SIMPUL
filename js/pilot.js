/**
 * Pilot survey coverage and evidence-quality rules.
 * Proposal basis: 12 sessions of 30–60 min. Zone/period allocation below is
 * a configurable planning ASSUMPTION, not a requirement dictated by the PDF.
 * All counts come from explicitly reviewed, non-synthetic manual sessions.
 */
export const DEFAULT_PROTOCOL = Object.freeze({
  zones:['Zona A','Zona B','Zona C'],
  periods:['Jam sibuk','Luar jam sibuk'],
  replicates:2,
  minMinutes:30,
  maxMinutes:60
});

export function normalizeProtocol(input={}) {
  const zones=Array.isArray(input.zones)?input.zones.filter(x=>DEFAULT_PROTOCOL.zones.includes(x)):DEFAULT_PROTOCOL.zones;
  const periods=Array.isArray(input.periods)?input.periods.filter(x=>DEFAULT_PROTOCOL.periods.includes(x)):DEFAULT_PROTOCOL.periods;
  const replicates=Number(input.replicates??2);
  const minMinutes=Number(input.minMinutes??30),maxMinutes=Number(input.maxMinutes??60);
  if(!zones.length || !periods.length || !Number.isInteger(replicates)||replicates<1||replicates>5||
     !Number.isInteger(minMinutes)||!Number.isInteger(maxMinutes)||minMinutes<5||maxMinutes>240||maxMinutes<minMinutes) {
    throw new Error('Protokol survei tidak valid. Periksa zona, periode, replikasi, dan batas menit.');
  }
  return {zones:[...new Set(zones)],periods:[...new Set(periods)],replicates,minMinutes,maxMinutes};
}
export function sessionQuality(session,review,events=[],protocol=DEFAULT_PROTOCOL) {
  const reasons=[];
  if(session?.source!=='manual')reasons.push('Bukan sesi manual');
  if(!protocol.zones.includes(session?.zone))reasons.push('Zona tidak tercakup protokol');
  if(!protocol.periods.includes(session?.period))reasons.push('Periode belum diberi label');
  const start=Date.parse(session?.startedAt??''),end=Date.parse(session?.endedAt??'');
  const duration=Number.isFinite(start)&&Number.isFinite(end)?(end-start)/60000:null;
  if(duration===null||duration<=0)reasons.push('Sesi belum selesai atau timestamp tidak sah');
  else if(duration<protocol.minMinutes||duration>protocol.maxMinutes)reasons.push('Durasi di luar batas protokol');
  const sessionEvents=events.filter(x=>x.source==='manual'&&x.sessionId===session?.id);
  const inconsistent=sessionEvents.filter(x=>x.zone!==session?.zone || !Number.isFinite(Date.parse(x.at??'')) || Date.parse(x.at)<start || Date.parse(x.at)>end);
  if(inconsistent.length)reasons.push(`${inconsistent.length} kejadian terhubung memiliki zona atau waktu di luar sesi`);
  if(!sessionEvents.length && review?.zeroConfirmed!==true)reasons.push('Tidak ada kejadian; konfirmasi observasi nol secara eksplisit melalui review.');
  if(review?.status!=='approved')reasons.push('Belum disetujui melalui peninjauan internal');
  if(review?.status==='approved'&&!String(review?.reviewer||'').trim())reasons.push('Label peninjau tidak ada');
  return {accepted:!reasons.length,minutes:duration,events:sessionEvents.length,reasons};
}
export function surveyCoverage(state) {
  const protocol=normalizeProtocol(state.surveyProtocol||DEFAULT_PROTOCOL);
  const reviews=state.sessionReviews||{};
  const observations=state.observations||[];
  const rows=(state.sessions||[]).filter(s=>s.source==='manual').map(session=>({
    session,...sessionQuality(session,reviews[session.id],observations,protocol)
  }));
  const slots=[];
  for(const zone of protocol.zones)for(const period of protocol.periods){
    const eligible=rows.filter(r=>r.accepted&&r.session.zone===zone&&r.session.period===period);
    slots.push({zone,period,target:protocol.replicates,completed:Math.min(eligible.length,protocol.replicates),available:eligible.length});
  }
  const target=slots.reduce((s,r)=>s+r.target,0);
  const completed=slots.reduce((s,r)=>s+r.completed,0);
  const pending=rows.filter(r=>!r.accepted).length;
  const issues=[];
  if(!completed)issues.push('Belum ada sesi manual yang memenuhi protokol dan ditinjau internal.');
  if(completed<target)issues.push(`${target-completed} slot observasi masih belum terpenuhi.`);
  if(pending)issues.push(`${pending} sesi manual belum memenuhi seluruh kriteria.`);
  const baseline=(state.fieldReadings||[]).filter(r=>r.source==='manual'&&r.phase==='baseline').length;
  if(!baseline)issues.push('Belum ada interval baseline manual untuk kalibrasi lalu lintas.');
  return {protocol,slots,rows,target,completed,pending,baseline,coveragePct:target?Math.round(completed/target*100):0,issues,
    // A complete survey schedule is *not* sufficient to validate a digital twin.
    surveyReady:completed===target&&baseline>0,
    calibrationVerified:false};
}
export function exportSurveyCoverage(state){
  const c=surveyCoverage(state);
  return {schema:'simpul.survey_coverage.v1',generatedAt:new Date().toISOString(),projectId:state.project?.id||null,
    scope:'Local planning and review only; not evidence of third-party approval or SUMO validation.',
    protocol:c.protocol,slots:c.slots,summary:{target:c.target,completed:c.completed,coveragePct:c.coveragePct,baselineIntervals:c.baseline,calibrationVerified:false},
    sessionAssessments:c.rows.map(r=>({id:r.session.id,zone:r.session.zone,period:r.session.period,
      startedAt:r.session.startedAt,endedAt:r.session.endedAt,minutes:r.minutes,eventCount:r.events,
      accepted:r.accepted,reviewStatus:state.sessionReviews?.[r.session.id]?.status||'pending',reasons:r.reasons}))};
}
