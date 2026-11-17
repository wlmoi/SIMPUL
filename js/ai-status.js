/**
 * Presentation-only status of the external CCTV AI model. js/cctv-controller.js reports
 * each batch of real detections (source 'ai'); Beranda reads it to show whether the AI is
 * connected. Nothing here is stored or treated as a field observation.
 */
const AI_STALE_MS=15000;
const aiState={model:'',lastAt:0,counts:{car:0,motorcycle:0,bus:0},stopped:0,over:0};

/** Record the latest AI detection summary. */
export function reportAiStatus({model='',counts={},stopped=0,over=0}={},now=Date.now()){
  aiState.model=String(model||'').slice(0,40);
  aiState.lastAt=now;
  aiState.counts={car:Number(counts.car)||0,motorcycle:Number(counts.motorcycle)||0,bus:Number(counts.bus)||0};
  aiState.stopped=Number(stopped)||0;aiState.over=Number(over)||0;
}
/** Current status; `connected` is true only while detections keep arriving. */
export function getAiStatus(now=Date.now()){
  return {...aiState,counts:{...aiState.counts},connected:aiState.lastAt>0&&now>=aiState.lastAt&&now-aiState.lastAt<AI_STALE_MS};
}
