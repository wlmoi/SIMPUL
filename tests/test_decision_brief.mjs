import assert from 'node:assert/strict';
import {buildBriefEnvelope, buildDeterministicBrief, normalizeDecisionBrief} from '../js/decision-brief.js';
import {surveyCoverage} from '../js/pilot.js';

const freshIso = new Date().toISOString();
const staleIso = new Date(Date.now() - 30 * 60 * 1000).toISOString();

const baseState = {
  project: {id: 'p1', geo: {lat: -6.2925, lon: 106.7925, name: 'Secret Label', osmId: '999'}},
  observations: [
    {id: 'm1', at: '2026-11-17T08:05:00+07:00', type: 'Menunggu', vehicle: 'Mobil', duration: 95, zone: 'Zona B', source: 'manual', note: 'PLAT B 1234 XYZ Rahasia', laneBlocked: 'unknown', pedestrianBlocked: 'unknown', queueObserved: 'yes'},
    {id: 'm2', at: '2026-11-17T08:10:00+07:00', type: 'Jemput', vehicle: 'Mobil', duration: 80, zone: 'Zona B', source: 'manual', note: 'Catatan pribadi', laneBlocked: 'unknown'},
    {id: 'm3', at: '2026-11-17T08:15:00+07:00', type: 'Jemput', vehicle: 'Motor', duration: 70, zone: 'Zona B', source: 'manual', note: '', laneBlocked: 'unknown'},
    {id: 'm4', at: '2026-11-17T08:20:00+07:00', type: 'Turun', vehicle: 'Mobil', duration: 25, zone: 'Halte Custom', source: 'manual', note: '', laneBlocked: 'unknown'},
    {id: 'd1', at: '2026-11-17T08:25:00+07:00', type: 'Menunggu', vehicle: 'Mobil', duration: 200, zone: 'Zona A', source: 'demo', note: 'Sintetis'}
  ],
  sessions: [],
  fieldReadings: [{id: 'fr1', source: 'manual', phase: 'baseline', scenario: 'A0', zone: 'Zona B', period: 'Jam sibuk', at: '2026-11-17T08:00:00+07:00', minutes: 30, passingVehicles: 400, stoppedVehicles: 40, maxQueue: 5, accessMeters: 30, pedestrians: 20, availableBays: 5, occupiedBays: 2, blockedAccess: false, note: 'Catatan field reading'}],
  sessionReviews: {ses1: {status: 'approved', reviewer: 'Nama Rahasia', note: 'Catatan review'}},
  fieldSettings: {dwellThresholdSec: 60},
  surveyProtocol: {zones: ['Zona A', 'Zona B', 'Zona C'], periods: ['Jam sibuk', 'Luar jam sibuk'], replicates: 2, minMinutes: 30, maxMinutes: 60},
  scenario: {traffic: 9999, pickupShare: 18, dwell: 55, diversion: 75, ruleDwell: 20, pedestrianDetour: 100, seeds: 2},
  lastAnalysis: {engine: 'heuristic'},
  context: {
    weather: {checkedAt: staleIso, rain: 4.5, weatherCode: 61},
    traffic: {retrievedAtUtc: freshIso, speedRatio: 0.45},
    nearby: {checkedAt: freshIso, count: 5}
  },
  cvReviewedSummaries: Array.from({length: 55}, (_, i) => ({
    windowId: `cv-AreaA1-peak-20261117T01${String(i).padStart(2, '0')}00Z-20261117T01${String(i).padStart(2, '0')}30Z`,
    signedOffAt: freshIso,
    windowStart: freshIso,
    windowEnd: freshIso,
    reviewerLabel: 'Koordinator A',
    zone: 'Area A1',
    period: 'Jam sibuk',
    mode: 'ai',
    vehicleCountsByClass: {car: 0, motorcycle: 0, bus: 0},
    meanDwellSec: 0,
    overThresholdCount: 0,
    synced: i % 2 === 0
  }))
};

const env = buildBriefEnvelope(baseState);
const serialized = JSON.stringify(env);

// 1. PII / free-text stripping & demo exclusion
assert.equal(env.manualSummary.syntheticExcluded, true);
assert.equal(env.manualSummary.totalEvents, 4, 'Demo observation d1 must be excluded');
assert.deepEqual(Object.keys(env.manualSummary.byZone).sort(), ['Zona A', 'Zona B', 'Zona C']);
assert.equal(env.manualSummary.byZone['Zona B'], 3);
assert.ok(!serialized.includes('PLAT B 1234 XYZ'));
assert.ok(!serialized.includes('Catatan pribadi'));
assert.ok(!serialized.includes('Catatan field reading'));
assert.ok(!serialized.includes('Nama Rahasia'));
assert.ok(!serialized.includes('Secret Label'));
assert.ok(!('osmId' in env.cachedContext.projectGeo));

// 2. 50-window slice & synced stripping
assert.equal(env.cvReviewedIds.length, 50);
assert.ok(env.cvReviewedWindows.every(w => !('synced' in w)));

// 3. Area A1 excluded from pilot.js 12-slot totals
const cov = surveyCoverage(baseState);
assert.equal(cov.target, 12);
assert.equal(env.surveyCoverage.targetSlots, 12);

// 4. Scenario clamping & seeds exclusion
assert.equal(env.simulationSnapshot.scenarioClamped, true);
assert.equal(env.simulationSnapshot.scenario.traffic, 1500);
assert.ok(!('seeds' in env.simulationSnapshot.scenario));

// 5. Deterministic brief checks (TTL, mismatch, Area A1 blind spot, heuristic params)
const brief = buildDeterministicBrief(baseState);
assert.equal(brief.llmStatus, 'unavailable');
assert.equal(brief.brief.legalConclusion, 'NOT_DETERMINED');
assert.equal(brief.executionTrace.providerStatuses.weather, 'stale');
assert.equal(brief.executionTrace.providerStatuses.traffic, 'fresh');
const codes = brief.brief.contradictionsAndGaps.map(f => f.code);
assert.ok(codes.includes('COVERAGE_GAP'));
assert.ok(codes.includes('BAY_CURB_BLIND_SPOT'));
assert.ok(codes.includes('CONTEXT_CURB_MISMATCH'));
const a2 = brief.brief.scenarioHypotheses.find(h => h.scenario === 'A2');
assert.ok(a2 && a2.params.ruleDwell === 30);

// 6. Normalization fallback
const norm = normalizeDecisionBrief({llmStatus: 'ok', llmModel: 'gemini-2.5-flash', brief: {contradictionsAndGaps: [], scenarioHypotheses: [], inspectionChecklist: []}}, baseState);
assert.equal(norm.brief.legalConclusion, 'NOT_DETERMINED');
assert.equal(norm.llmStatus, 'ok');

console.log('PASS decision-brief: PII exclusion, 50-window cap, Area A1 bay isolation, TTL, mismatch flags, ScenarioParams clamp');
