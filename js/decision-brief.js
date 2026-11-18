/**
 * Pure deterministic Coordinator Decision Brief composer and Context Envelope builder.
 * Zero DOM or network side effects; compatible with tools/build_standalone.py static bundling.
 */
import {surveyCoverage} from './pilot.js';
import {vehicleProblemSummary} from './vehicle-problem.js';
import {diagnose, evidenceGate} from './diagnostics.js';
import {assessQuality} from './standards.js';

const DB_ZONES = Object.freeze(['Zona A', 'Zona B', 'Zona C']);
const DB_TYPES = Object.freeze(['Jemput', 'Turun', 'Menunggu']);
const DB_TTL_MS = 15 * 60 * 1000;
const DB_SCENARIO_BOUNDS = Object.freeze({
  traffic: [200, 1500, true],
  pickupShare: [0, 45, false],
  dwell: [5, 180, false],
  diversion: [0, 100, false],
  ruleDwell: [5, 120, false],
  pedestrianDetour: [0, 500, false]
});

const dbClamp = (val, lo, hi, isInt = false) => {
  const n = Number(val);
  if (!Number.isFinite(n)) return isInt ? Math.round(lo) : lo;
  const clamped = Math.max(lo, Math.min(hi, n));
  return isInt ? Math.round(clamped) : Number(clamped.toFixed(2));
};

const dbContextFreshness = (checkedAt, {hasGeo = true, geoBound = false} = {}) => {
  if (geoBound && !hasGeo) return 'project_geo_unset';
  if (!checkedAt || typeof checkedAt !== 'string') return 'unavailable';
  const ms = Date.parse(checkedAt);
  if (!Number.isFinite(ms)) return 'stale';
  return (Date.now() - ms) <= DB_TTL_MS ? 'fresh' : 'stale';
};

const dbClampScenario = (scenario = {}) => {
  const out = {};
  let clamped = false;
  for (const [k, [lo, hi, isInt]] of Object.entries(DB_SCENARIO_BOUNDS)) {
    const raw = Number(scenario?.[k]);
    if (!Number.isFinite(raw)) continue;
    const val = dbClamp(raw, lo, hi, isInt);
    if (val !== raw) clamped = true;
    out[k] = val;
  }
  return {scenario: out, scenarioClamped: clamped};
};

const dbStripCvWindow = w => ({
  windowId: String(w.windowId),
  signedOffAt: String(w.signedOffAt || w.signedAt || new Date().toISOString()),
  windowStart: String(w.windowStart),
  windowEnd: String(w.windowEnd),
  reviewerLabel: String(w.reviewerLabel || 'Koordinator').trim().slice(0, 60),
  zone: w.zone,
  period: w.period,
  mode: 'ai',
  vehicleCountsByClass: {
    car: Math.max(0, Math.min(10000, Number(w.vehicleCountsByClass?.car) || 0)),
    motorcycle: Math.max(0, Math.min(10000, Number(w.vehicleCountsByClass?.motorcycle) || 0)),
    bus: Math.max(0, Math.min(10000, Number(w.vehicleCountsByClass?.bus) || 0))
  },
  meanDwellSec: Math.max(0, Math.min(3600, Number(w.meanDwellSec) || 0)),
  overThresholdCount: Math.max(0, Math.min(10000, Number(w.overThresholdCount) || 0))
});

const dbComputeBayUtilization = windows => {
  const bay = windows.filter(w => w.zone === 'Area A1');
  const totalVehicles = bay.reduce((s, w) => s + (w.vehicleCountsByClass.car + w.vehicleCountsByClass.motorcycle + w.vehicleCountsByClass.bus), 0);
  const overThresholdCount = bay.reduce((s, w) => s + w.overThresholdCount, 0);
  const weightedSum = bay.reduce((s, w) => {
    const v = w.vehicleCountsByClass.car + w.vehicleCountsByClass.motorcycle + w.vehicleCountsByClass.bus;
    return s + (w.meanDwellSec * v);
  }, 0);
  return {
    windows: bay.length,
    totalVehicles,
    meanDwellSec: totalVehicles > 0 ? Number((weightedSum / totalVehicles).toFixed(2)) : null,
    overThresholdCount
  };
};

const dbProjectGeo = geo => {
  const lat = Number(geo?.lat), lon = Number(geo?.lon);
  if (!geo || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return {lat, lon};
};

const dbProjectContext = state => {
  const projectGeo = dbProjectGeo(state?.project?.geo);
  const ctx = state?.context || {};
  const weather = ctx.weather ? {
    checkedAt: typeof ctx.weather.checkedAt === 'string' ? ctx.weather.checkedAt : null,
    rain: Number.isFinite(Number(ctx.weather.rain)) ? Number(ctx.weather.rain) : null,
    weatherCode: Number.isFinite(Number(ctx.weather.weatherCode)) ? Math.round(Number(ctx.weather.weatherCode)) : null
  } : null;
  const trafficTs = ctx.traffic?.checkedAt || ctx.traffic?.retrievedAtUtc || null;
  const traffic = ctx.traffic ? {
    checkedAt: typeof trafficTs === 'string' ? trafficTs : null,
    speedRatio: Number.isFinite(Number(ctx.traffic.speedRatio)) ? Number(ctx.traffic.speedRatio) : null
  } : null;
  const nearby = ctx.nearby ? {
    checkedAt: typeof ctx.nearby.checkedAt === 'string' ? ctx.nearby.checkedAt : null,
    count: Number.isFinite(Number(ctx.nearby.count)) ? Math.max(0, Math.round(Number(ctx.nearby.count))) : null
  } : null;
  return {projectGeo, weather, traffic, nearby};
};

function dbBuildDeterministicCore(state) {
  const threshold = Math.max(5, Math.min(600, Number(state?.fieldSettings?.dwellThresholdSec) || 60));
  const vSummary = vehicleProblemSummary(state?.observations || [], {source: 'manual'}, threshold);
  const cov = surveyCoverage(state || {});
  const diag = diagnose(state?.fieldReadings || [], state?.observations || [], state?.fieldSettings || {});
  const gate = evidenceGate(state?.fieldReadings || [], state?.sessions || [], state?.observations || []);
  const quality = assessQuality(state || {});
  const cachedContext = dbProjectContext(state);

  const byType = Object.fromEntries(DB_TYPES.map(t => [t, vSummary.counts[t] || 0]));
  const byZone = Object.fromEntries(DB_ZONES.map(z => [z, vSummary.filtered.filter(e => e.zone === z).length]));
  const manualSummary = {
    syntheticExcluded: true,
    totalEvents: vSummary.filtered.length,
    byType,
    byZone,
    meanDwellSec: vSummary.avgDwell,
    overThresholdCount: vSummary.overThreshold,
    impacts: {
      laneYes: vSummary.impacts.lane.yes,
      laneUnknown: vSummary.impacts.lane.unknown,
      pedYes: vSummary.impacts.pedestrian.yes,
      pedUnknown: vSummary.impacts.pedestrian.unknown,
      queueYes: vSummary.impacts.queue.yes
    }
  };

  const missingSlots = cov.slots
    .filter(s => s.completed < s.target)
    .map(s => ({zone: s.zone, period: s.period, completed: s.completed, target: s.target}));
  const surveySummary = {
    completedSlots: cov.completed,
    targetSlots: cov.target,
    baselineIntervals: gate.baselineCount,
    followupIntervals: gate.followupCount,
    missingSlots
  };

  const recentCvRaw = (state?.cvReviewedSummaries || [])
    .filter(w => w && w.mode === 'ai' && typeof w.windowId === 'string')
    .slice(-50);
  const cvClean = recentCvRaw.map(dbStripCvWindow);
  const bayUtilization = dbComputeBayUtilization(cvClean);

  const weatherStatus = dbContextFreshness(cachedContext.weather?.checkedAt, {hasGeo: Boolean(cachedContext.projectGeo), geoBound: true});
  const trafficStatus = dbContextFreshness(cachedContext.traffic?.checkedAt, {hasGeo: Boolean(cachedContext.projectGeo), geoBound: true});
  const nearbyStatus = dbContextFreshness(cachedContext.nearby?.checkedAt, {hasGeo: true, geoBound: false});

  const flags = [];
  const checklist = [];

  for (const slot of missingSlots.slice(0, 6)) {
    flags.push({
      code: 'COVERAGE_GAP',
      zone: slot.zone,
      period: slot.period,
      reason: `Slot survei ${slot.zone} (${slot.period}) baru ${slot.completed}/${slot.target} sesi terverifikasi internal.`,
      evidenceLabel: 'requires_field_verification',
      sourceTiersUsed: ['tier_1_manual'],
      tier3ContextRefs: []
    });
    checklist.push({
      zone: slot.zone,
      period: slot.period,
      question: `Lakukan observasi manual 30–60 menit di ${slot.zone} (${slot.period}) dan catat durasi berhenti serta hambatan lajur.`,
      evidenceLabel: 'requires_field_verification'
    });
  }

  if (gate.baselineCount === 0) {
    flags.push({
      code: 'COVERAGE_GAP',
      zone: 'Corridor',
      period: 'All',
      reason: 'Belum ada interval pengukuran baseline (fieldReadings) untuk kalibrasi volume dan antrean.',
      evidenceLabel: 'requires_field_verification',
      sourceTiersUsed: ['tier_1_manual'],
      tier3ContextRefs: []
    });
  }

  const zonaBOver = vSummary.filtered.filter(e => e.zone === 'Zona B' && Number(e.duration) > threshold).length
    + cvClean.filter(w => w.zone === 'Zona B').reduce((s, w) => s + w.overThresholdCount, 0);
  if (bayUtilization.totalVehicles === 0 && zonaBOver >= 3) {
    flags.push({
      code: 'BAY_CURB_BLIND_SPOT',
      zone: 'Area A1',
      period: 'All',
      reason: `Area A1 tercatat 0 kendaraan sementara Zona B mencatat ${zonaBOver} kejadian melebihi ${threshold} detik.`,
      evidenceLabel: 'requires_field_verification',
      sourceTiersUsed: cvClean.length ? ['tier_1_manual', 'tier_2_cv_reviewed'] : ['tier_1_manual'],
      tier3ContextRefs: []
    });
    checklist.push({
      zone: 'Area A1',
      period: 'Jam sibuk',
      question: 'Periksa apakah akses masuk ke Area A1 terbuka dan terlihat jelas bagi pengemudi di Zona B.',
      evidenceLabel: 'requires_field_verification'
    });
  }

  for (const w of cvClean) {
    if (DB_ZONES.includes(w.zone) && w.overThresholdCount >= 3) {
      const slotRow = cov.rows.filter(r => r.accepted && r.session.zone === w.zone && r.session.period === w.period);
      if (slotRow.length === 0) {
        flags.push({
          code: 'BAY_CURB_BLIND_SPOT',
          zone: w.zone,
          period: w.period,
          reason: `Ringkasan CV terverifikasi mencatat ${w.overThresholdCount} henti > ${threshold} detik di ${w.zone} (${w.period}) saat 0 sesi manual disetujui.`,
          evidenceLabel: 'requires_field_verification',
          sourceTiersUsed: ['tier_2_cv_reviewed'],
          tier3ContextRefs: []
        });
      }
    }
  }

  const unknownRatio = manualSummary.totalEvents > 0 ? manualSummary.impacts.laneUnknown / manualSummary.totalEvents : 0;
  const freshSlowTraffic = trafficStatus === 'fresh' && cachedContext.traffic?.speedRatio !== null && cachedContext.traffic.speedRatio < 0.6;
  const freshRain = weatherStatus === 'fresh' && ((cachedContext.weather?.rain ?? 0) > 0 || (cachedContext.weather?.weatherCode ?? 0) >= 51);
  if ((freshSlowTraffic || freshRain) && manualSummary.totalEvents > 0 && manualSummary.impacts.laneYes === 0 && unknownRatio > 0.5) {
    const refs = [];
    if (freshSlowTraffic) refs.push(`tomtom:speedRatio=${cachedContext.traffic.speedRatio}`);
    if (freshRain) refs.push(`open-meteo:rain=${cachedContext.weather.rain ?? 0}`);
    flags.push({
      code: 'CONTEXT_CURB_MISMATCH',
      zone: 'Corridor',
      period: 'All',
      reason: `Konteks eksternal menunjukkan perlambatan/hujan namun catatan hambatan lajur manual didominasi status 'unknown' (${Math.round(unknownRatio * 100)}%).`,
      evidenceLabel: 'contextual_signal_only',
      sourceTiersUsed: ['tier_1_manual', 'tier_3_contextual_unverified'],
      tier3ContextRefs: refs
    });
  }

  for (const w of diag.warnings.slice(0, 3)) {
    if (w.kind === 'observed') {
      flags.push({
        code: 'DIAGNOSTIC_WARNING',
        zone: 'Corridor',
        period: 'All',
        reason: String(w.title).slice(0, 300),
        evidenceLabel: 'requires_field_verification',
        sourceTiersUsed: ['tier_1_manual'],
        tier3ContextRefs: []
      });
    }
  }

  const baseS = state?.scenario || {};
  const clampedSnap = dbClampScenario(baseS);
  const a0Params = {
    traffic: dbClamp(baseS.traffic ?? 850, 200, 1500, true),
    pickupShare: dbClamp(baseS.pickupShare ?? 18, 0, 45, false),
    dwell: dbClamp(manualSummary.meanDwellSec ?? baseS.dwell ?? 55, 5, 180, false)
  };
  const hypotheses = [{
    scenario: 'A0',
    title: 'Baseline kondisi lapangan saat ini (A0)',
    rationale: `Menggunakan rerata durasi henti manual ${a0Params.dwell} detik sebagai pembanding awal sebelum penataan.`,
    params: a0Params,
    label: 'synthetic_hypothesis_uncalibrated'
  }];

  if (bayUtilization.totalVehicles === 0 || zonaBOver >= 3 || manualSummary.byType.Menunggu >= 1) {
    hypotheses.push({
      scenario: 'A1',
      title: 'Uji pengalihan jemput ke teluk Area A1 (A1)',
      rationale: 'Menguji sensitivitas pengalihan arus jemput dari tepi jalan Zona B ke Area A1.',
      params: {
        ...a0Params,
        diversion: dbClamp(Math.max(60, Number(baseS.diversion ?? 75)), 0, 100, false)
      },
      label: 'synthetic_hypothesis_uncalibrated'
    });
  }
  if (manualSummary.byType.Menunggu > 0 || manualSummary.overThresholdCount > 0) {
    hypotheses.push({
      scenario: 'A2',
      title: 'Uji batas durasi henti dan detour pejalan (A2)',
      rationale: `Menguji aturan batas henti lebih singkat saat tercatat ${manualSummary.byType.Menunggu} kejadian Menunggu.`,
      params: {
        ...a0Params,
        ruleDwell: dbClamp(Math.round(threshold / 2), 5, 120, false),
        pedestrianDetour: dbClamp(baseS.pedestrianDetour ?? 100, 0, 500, false)
      },
      label: 'synthetic_hypothesis_uncalibrated'
    });
  }

  if (!checklist.length) {
    checklist.push({
      zone: 'Zona B',
      period: 'Jam sibuk',
      question: 'Verifikasi kesesuaian durasi henti aktual dan posisi kendaraan terhadap akses masuk stasiun.',
      evidenceLabel: 'requires_field_verification'
    });
  }

  const preflightBrief = {
    contradictionsAndGaps: flags.slice(0, 40),
    scenarioHypotheses: hypotheses.slice(0, 6),
    inspectionChecklist: checklist.slice(0, 30),
    diagnosticWarningsCount: diag.warnings.length,
    qualityStatus: quality.status === 'not_ready' ? 'not_ready' : 'exploratory_only'
  };

  return {
    manualSummary,
    surveyCoverage: surveySummary,
    preflightBrief,
    recentCvRaw,
    cvClean,
    bayUtilization,
    cachedContext,
    clampedSnap,
    weatherStatus,
    trafficStatus,
    nearbyStatus
  };
}

export function buildBriefEnvelope(state) {
  const core = dbBuildDeterministicCore(state);
  const cvReviewedIds = core.recentCvRaw.map(w => w.windowId);
  const cvReviewedWindows = core.recentCvRaw
    .filter(w => !w.synced)
    .map(dbStripCvWindow);
  return {
    manualSummary: core.manualSummary,
    surveyCoverage: core.surveyCoverage,
    preflightBrief: core.preflightBrief,
    cvReviewedIds,
    cvReviewedWindows,
    cachedContext: core.cachedContext,
    simulationSnapshot: {
      engine: state?.lastAnalysis?.engine === 'sumo' || state?.lastAnalysis?.engine === 'heuristic' ? state.lastAnalysis.engine : null,
      scenario: core.clampedSnap.scenario,
      scenarioClamped: core.clampedSnap.scenarioClamped
    },
    includeLocalPdf: true
  };
}

export function buildDeterministicBrief(state) {
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const core = dbBuildDeterministicCore(state);
  const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const preflightFlags = [...new Set(core.preflightBrief.contradictionsAndGaps.map(f => f.code))];
  return {
    brief: {
      contradictionsAndGaps: core.preflightBrief.contradictionsAndGaps,
      scenarioHypotheses: core.preflightBrief.scenarioHypotheses,
      inspectionChecklist: core.preflightBrief.inspectionChecklist,
      legalConclusion: 'NOT_DETERMINED',
      bayUtilization: core.bayUtilization
    },
    llmStatus: 'unavailable',
    llmModel: null,
    pdfSummary: {available: false, totalRecords: 0, byZonePeriod: {}},
    executionTrace: {
      runId: 'local-deterministic',
      promptVersion: 'decision-brief-v1',
      tierCounts: {
        manualEvents: core.manualSummary.totalEvents,
        cvReviewedWindows: core.cvClean.length,
        pdfRecords: 0
      },
      providerStatuses: {
        gemini: 'unavailable',
        weather: core.weatherStatus,
        traffic: core.trafficStatus,
        nearby: core.nearbyStatus,
        pdf: 'unavailable'
      },
      preflightFlags,
      clampedFields: [],
      llmStatus: 'unavailable',
      validatorPassed: true,
      durationMs: Math.max(0, Math.round(t1 - t0))
    }
  };
}

export function normalizeDecisionBrief(apiResponse, state) {
  const fallback = buildDeterministicBrief(state);
  if (!apiResponse || typeof apiResponse !== 'object') return fallback;
  const brief = apiResponse.brief && typeof apiResponse.brief === 'object' ? apiResponse.brief : {};
  return {
    brief: {
      contradictionsAndGaps: Array.isArray(brief.contradictionsAndGaps) ? brief.contradictionsAndGaps : fallback.brief.contradictionsAndGaps,
      scenarioHypotheses: Array.isArray(brief.scenarioHypotheses) ? brief.scenarioHypotheses : fallback.brief.scenarioHypotheses,
      inspectionChecklist: Array.isArray(brief.inspectionChecklist) ? brief.inspectionChecklist : fallback.brief.inspectionChecklist,
      legalConclusion: 'NOT_DETERMINED',
      bayUtilization: brief.bayUtilization && typeof brief.bayUtilization === 'object' ? brief.bayUtilization : fallback.brief.bayUtilization
    },
    llmStatus: apiResponse.llmStatus || 'unavailable',
    llmModel: apiResponse.llmModel ?? null,
    pdfSummary: apiResponse.pdfSummary || fallback.pdfSummary,
    executionTrace: apiResponse.executionTrace || fallback.executionTrace
  };
}
