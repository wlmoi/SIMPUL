/**
 * Pure export data transformations.
 * No DOM, localStorage, fetching, or downloads: pass state in and receive CSV text.
 * The traffic-review export deliberately excludes synthetic observations.
 */
import { encodeCsvRows } from './csv.js';
import { makePoliceReviewBundle } from '../classification.js';
import { forecast } from '../finance.js';

export function observationCsv(state) {
  return encodeCsvRows([
    ['id','timestamp_utc','type','vehicle','duration_seconds','zone','source','notes'],
    ...state.observations.map(x=>[x.id,x.at,x.type,x.vehicle,x.duration,x.zone,x.source,x.note]),
  ]);
}

export function policeCsv(state) {
  const records = makePoliceReviewBundle(state).records;
  const columns = ['id','at','zone','activity','vehicleCategory','durationSec','fieldContext','laneBlocked','pedestrianBlocked','queueObserved','operationalPriority','ruleReviewFlag','evidenceStatus','reviewStatus','reviewedAt','legalConclusion'];
  return encodeCsvRows([columns, ...records.map(r=>[
    r.id,r.at,r.zone,r.activity,r.vehicleCategory,r.durationSec,r.fieldContext,
    r.observedImpact.lane,r.observedImpact.pedestrian,r.observedImpact.queue,
    r.operationalPriority,r.ruleReviewFlag,r.evidenceStatus,r.reviewStatus,
    r.reviewedAt||'',r.legalConclusion,
  ])]);
}

export function fieldReadingCsv(state) {
  const columns = ['id','observed_at_utc','recorded_at_utc','phase','scenario','period','zone','interval_minutes','vehicles_passing','vehicles_stopping','max_queue_vehicles','access_meters','pedestrians','access_blocked','available_bays','occupied_bays','source','notes'];
  return encodeCsvRows([columns, ...state.fieldReadings.map(r=>[
    r.id,r.at,r.recordedAt||'',r.phase,r.scenario,r.period,r.zone,r.minutes,
    r.passingVehicles,r.stoppedVehicles,r.maxQueue,r.accessMeters,r.pedestrians,
    r.blockedAccess,r.availableBays,r.occupiedBays,r.source,r.note,
  ])]);
}

export function forecastCsv(state) {
  const rows = forecast(state.finance).rows;
  const columns = ['month','active_sites','recurring_idr','setup_idr','pilot_idr','total_revenue_idr','direct_cost_idr','fixed_cost_idr','total_cost_idr','operating_result_idr'];
  return encodeCsvRows([columns,...rows.map(x=>[
    x.month,x.active,x.recurring,x.setupRevenue,x.pilotRevenue,x.revenue,
    x.direct,x.fixed,x.costs,x.net,
  ])]);
}

const EQUIPMENT_SETS = Object.freeze({
  phone: ['phone','tripod','powerbank'],
  cloud: ['phone','cloud','tripod','powerbank'],
  edge: ['phone','pi','camera','router','storage','cloud'],
});
const EQUIPMENT_NAMES = Object.freeze({
  phone:'Smartphone milik pengguna', cloud:'Hosting cloud per bulan',
  tripod:'Tripod',powerbank:'Powerbank',pi:'Raspberry Pi / mini PC',
  camera:'Kamera berizin',router:'Router',storage:'Penyimpanan',
});

export function equipmentCsv(state) {
  const list = EQUIPMENT_SETS[state.equipmentMode];
  if (!list) throw new TypeError(`Unknown equipment mode: ${state.equipmentMode}`);
  return encodeCsvRows([
    ['mode','equipment','estimated_price_idr','frequency'],
    ...list.map(k=>[state.equipmentMode,EQUIPMENT_NAMES[k],state.equipmentPrices[k],k==='cloud'?'monthly':'one-time']),
  ]);
}

export function monitoringCsv(state) {
  return encodeCsvRows([
    ['timestamp_utc','record_type','activity','source','zone','duration_seconds','session_id','description'],
    ...state.observations.map(e=>[e.at,'observation',e.type,e.source,e.zone,e.duration,e.sessionId||'',e.note||'']),
    ...(state.activityLog||[]).map(e=>[e.at,'audit',e.kind,'local','','','',e.message]),
  ]);
}
