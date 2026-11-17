/**
 * Microscopic traffic simulation of the MRT Fatmawati frontage (illustrative).
 *
 * Pure and deterministic for a given seed: no DOM, no store, no network.
 * Car-following uses the Intelligent Driver Model; lane changes use a simple
 * gap-acceptance rule. Numbers are NOT calibrated to field counts and must be
 * labelled as illustrative wherever they are shown.
 */
import {LAYOUT} from './fatmawati-layout.js';

export const SCENARIOS = Object.freeze({
  A0: Object.freeze({id: 'A0', label: 'A0 · Kondisi eksisting', short: 'Ojol dan kendaraan pribadi menaikkan/menurunkan penumpang di lajur kiri sekitar stasiun.'}),
  A1: Object.freeze({id: 'A1', label: 'A1 · Area jemput khusus', short: 'Naik-turun penumpang dipindah ke jalur khusus di bawah stasiun (kiss & ride).'}),
  A2: Object.freeze({id: 'A2', label: 'A2 · Aturan lokasi & durasi', short: 'Berhenti hanya di Zona B/C dengan batas durasi singkat; Zona A dilarang.'})
});

/** Time-of-day presets (vehicles/hour in the analysed direction). Scaled from the reported
 *  ~3,775 pcu/h peak on RA Kartini (Dishub DKI, Aug 2025); illustrative, not a field count. */
export const TIME_PRESETS = Object.freeze({
  pagi: Object.freeze({id: 'pagi', label: 'Pagi sibuk', volume: 1900, pickupShare: 12}),
  siang: Object.freeze({id: 'siang', label: 'Siang', volume: 1300, pickupShare: 8}),
  sore: Object.freeze({id: 'sore', label: 'Sore pulang kerja', volume: 2100, pickupShare: 18})
});

const SPEC = Object.freeze({
  car: {len: 4.4, wid: 1.8, h: 1.5, v0: 11.5, s0: 2, T: 1.2, a: 1.6, b: 2.4},
  motorcycle: {len: 2, wid: 0.8, h: 1.4, v0: 12.5, s0: 1, T: 0.8, a: 2.2, b: 3},
  bus: {len: 12, wid: 2.5, h: 3.2, v0: 9.5, s0: 2.5, T: 1.5, a: 1.0, b: 2},
  truck: {len: 8, wid: 2.4, h: 3, v0: 9, s0: 2.5, T: 1.5, a: 0.9, b: 2}
});
const LEN = LAYOUT.xMax - LAYOUT.xMin;
export const LANE_DROP_X = 118;          // median lane of the analysed road ends (narrowing near the toll access)
const CAR_COLORS = ['#f4f5f7', '#c9ced6', '#2b2f36', '#8c939e', '#b8322f', '#2f5fa8', '#e9e2d0', '#4a4f57'];
const OJOL_COLORS = ['#1fae4b', '#00a650'];

function simRng(seed){
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const simClamp = (x, a, b) => Math.min(b, Math.max(a, x));
const smooth = t => t * t * (3 - 2 * t);
const xToS = (x, dir) => dir > 0 ? x - LAYOUT.xMin : LAYOUT.xMax - x;
const sToX = (s, dir) => dir > 0 ? LAYOUT.xMin + s : LAYOUT.xMax - s;

/** Lane descriptors: road S (analysed, eastbound), N (westbound), T (toll, context), B (A1 bay). */
function buildLanes(){
  const lanes = [];
  LAYOUT.southRoad.lanes.forEach((z, i) => lanes.push({key: `S${i}`, road: 'S', idx: i, z, dir: 1}));
  LAYOUT.northRoad.lanes.forEach((z, i) => lanes.push({key: `N${i}`, road: 'N', idx: i, z, dir: -1}));
  LAYOUT.toll.lanes.forEach((l, i) => lanes.push({key: `T${i}`, road: 'T', idx: i, z: l.z, dir: l.dir}));
  return lanes;
}
const LANES = buildLanes();
const LANE_BY_KEY = Object.fromEntries(LANES.map(l => [l.key, l]));

export function createSim(opts = {}){
  const o = {scenario: 'A0', volume: 2100, pickupShare: 18, dwell: 55, ruleDwell: 20, seed: 7, ...opts};
  if (!SCENARIOS[o.scenario]) o.scenario = 'A0';
  o.volume = simClamp(o.volume, 600, 3600);
  o.pickupShare = simClamp(o.pickupShare, 0, 60);
  o.dwell = simClamp(o.dwell, 10, 240);
  o.ruleDwell = simClamp(o.ruleDwell, 5, 120);
  const rand = simRng(o.seed);
  const sim = {
    o, rand, t: 0, nextId: 1, vehicles: [], peds: [],
    nextSpawn: Object.fromEntries(LANES.map(l => [l.key, rand() * 2])),
    nextBus: 8, nextPed: 0,
    bay: LAYOUT.bay.slots.map(() => null),
    live: {speed: 0, queue: 0, blocked: 0},
    stats: null
  };
  resetStats(sim);
  return sim;
}

export function resetStats(sim){
  sim.stats = {from: sim.t, exited: 0, delaySum: 0, delayN: 0, speedSum: 0, speedN: 0,
    queueSum: 0, queueMax: 0, blockSum: 0, conflicts: 0, alight: 0, spill: 0, backlog: 0};
}

/* ------------------------------------------------------------------ spawning */
function pickClass(r){ return r < 0.56 ? 'car' : r < 0.94 ? 'motorcycle' : 'truck'; }

function stopPlan(sim, cls){
  const {o, rand} = sim;
  const zones = LAYOUT.zones;
  const dwell = () => simClamp(o.dwell * Math.exp((rand() - 0.5) * 1.1), 8, 240);
  let scenario = o.scenario;
  if (scenario === 'A1' && rand() < 0.1) scenario = 'A0';   // non-compliance
  if (scenario === 'A2' && rand() < 0.15) scenario = 'A0';
  if (scenario === 'A1') return {mode: 'bay', dwell: dwell()};
  if (scenario === 'A2'){
    const z = zones[1 + Math.floor(rand() * 2)];
    return {mode: 'curb', zone: z.id, stopX: z.x0 + 3 + rand() * (z.x1 - z.x0 - 6), dwell: Math.min(dwell(), o.ruleDwell + rand() * 10)};
  }
  const r = rand();
  const z = r < 0.42 ? zones[0] : r < 0.82 ? zones[1] : zones[2];
  const plan = {mode: 'curb', zone: z.id, stopX: z.x0 + 3 + rand() * (z.x1 - z.x0 - 6), dwell: dwell()};
  if (cls === 'motorcycle') plan.dwell *= 0.7;
  return plan;
}

function makeVehicle(sim, lane, cls, extra = {}){
  const spec = SPEC[cls];
  const r = sim.rand;
  return {
    id: `v${sim.nextId++}`, cls, spec, road: lane.road, lane: lane.idx, fromLane: lane.idx, prog: 1,
    dir: lane.dir, s: 0, v: spec.v0 * (0.75 + r() * 0.2), z: lane.z, yaw: lane.dir > 0 ? 0 : Math.PI,
    color: CAR_COLORS[Math.floor(r() * CAR_COLORS.length)], conf: 0.82 + r() * 0.16,
    state: 'drive', plan: null, dwellLeft: 0, dwellAcc: 0, spawnT: sim.t, cooldown: 0, kind: 'umum',
    v0: spec.v0 * (0.9 + r() * 0.2), ...extra
  };
}

function canSpawn(sim, lane, len){
  const arr = sim._idx?.get(lane.key);
  if (!arr || !arr.length) return true;
  return arr[0].s - arr[0].spec.len / 2 > len + 3;
}

function spawn(sim){
  const {o, rand} = sim;
  for (const lane of LANES){
    if (sim.t < sim.nextSpawn[lane.key]) continue;
    let rate;
    if (lane.road === 'S') rate = o.volume / 3600 * [0.3, 0.37, 0.33][lane.idx];
    else if (lane.road === 'N') rate = o.volume * 0.75 / 3600 / 3;
    else rate = 1700 / 3600;
    const cls = lane.road === 'T' ? (rand() < 0.85 ? 'car' : 'truck') : pickClass(rand());
    if (!canSpawn(sim, lane, SPEC[cls].len)){
      if (lane.road === 'S') sim.stats.backlog += 1;
      sim.nextSpawn[lane.key] = sim.t + 0.6;
      continue;
    }
    const extra = {};
    if (lane.road === 'S' && cls !== 'truck' && rand() * 100 < o.pickupShare){
      extra.plan = stopPlan(sim, cls);
      extra.state = 'seek';
      extra.kind = rand() < 0.7 ? 'ojol' : 'pribadi';
      if (extra.kind === 'ojol') extra.color = OJOL_COLORS[Math.floor(rand() * 2)];
    }
    if (lane.road === 'T') extra.v0 = 20 + rand() * 4;
    sim.vehicles.push(makeVehicle(sim, lane, cls, extra));
    sim.nextSpawn[lane.key] = sim.t - Math.log(1 - rand()) / Math.max(rate, 1e-4);
  }
  if (sim.t >= sim.nextBus){
    const lane = LANE_BY_KEY.S0;
    if (canSpawn(sim, lane, SPEC.bus.len)){
      sim.vehicles.push(makeVehicle(sim, lane, 'bus', {kind: 'transjakarta', color: '#1f5fbf', state: 'seek',
        plan: {mode: 'curb', zone: 'Halte TJ', stopX: LAYOUT.halte.stopX, dwell: 18 + rand() * 16, bus: true}}));
      sim.nextBus = sim.t + 80 + rand() * 60;
    } else sim.nextBus = sim.t + 2;
  }
}

/** Spawn an ojol that immediately stops at x on the curb lane (interactive "place" tool). */
export function placeStoppedVehicle(sim, x, cls = 'motorcycle'){
  const lane = LANE_BY_KEY.S0;
  const spec = SPEC[cls];
  const s = xToS(simClamp(x, LAYOUT.xMin + 20, LAYOUT.xMax - 20), 1);
  for (const v of sim.vehicles){
    if (v.road === 'S' && (v.lane === 0 || (v.prog < 1 && v.fromLane === 0)) && Math.abs(v.s - s) < (v.spec.len + spec.len) / 2 + 1) return null;
  }
  const zone = LAYOUT.zones.find(z => x >= z.x0 && x <= z.x1)?.id || 'Di luar zona';
  const veh = makeVehicle(sim, lane, cls, {kind: 'ojol', color: OJOL_COLORS[0], s, v: 0, state: 'stopped',
    plan: {mode: 'curb', zone, stopX: x, dwell: 75}, dwellLeft: 75, placed: true});
  sim.vehicles.push(veh);
  addPassenger(sim, veh);
  return veh.id;
}

/* ------------------------------------------------------------------ helpers */
function occupies(v, road, idx){ return v.road === road && (v.lane === idx || (v.prog < 0.65 && v.fromLane === idx)); }

function buildIndex(sim){
  const idx = new Map();
  const push = (key, v) => { let a = idx.get(key); if (!a){ a = []; idx.set(key, a); } a.push(v); };
  for (const v of sim.vehicles){
    if (v.road === 'B'){ if (v.state !== 'bayStop') push('Bmove', v); continue; }
    push(v.road + v.lane, v);
    if (v.prog < 0.65 && v.fromLane !== v.lane) push(v.road + v.fromLane, v);
  }
  for (const a of idx.values()) a.sort((p, q) => p.s - q.s);
  sim._idx = idx;
}
function neighboursIn(arr, me){
  let lo = 0, hi = arr.length;
  while (lo < hi){ const m = (lo + hi) >> 1; if (arr[m].s < me.s) lo = m + 1; else hi = m; }
  let lead = null, follow = null;
  for (let i = lo; i < arr.length; i++) if (arr[i] !== me){ lead = arr[i]; break; }
  for (let i = lo - 1; i >= 0; i--) if (arr[i] !== me){ follow = arr[i]; break; }
  return {lead, follow};
}
function laneNeighbours(sim, me, road, idx){
  return neighboursIn(sim._idx.get(road + idx) || [], me);
}
const gapTo = (me, other) => other.s - other.spec.len / 2 - (me.s + me.spec.len / 2);

function idm(v, spec, v0, gap, dv){
  const sStar = spec.s0 + Math.max(0, v * spec.T + v * dv / (2 * Math.sqrt(spec.a * spec.b)));
  const free = 1 - Math.pow(Math.max(0, v) / v0, 4);
  const inter = gap > 0.05 ? (sStar / gap) ** 2 : 60;
  return simClamp(spec.a * (free - inter), -9, spec.a);
}

function laneIsOpen(road, idx, s){
  return !(road === 'S' && idx === 2 && sToX(s, 1) > LANE_DROP_X - 4);
}

function tryLaneChange(sim, v, target){
  if (target < 0 || target > 2 || v.prog < 1 || v.cooldown > 0) return false;
  if (!laneIsOpen(v.road, target, v.s)) return false;
  const {lead, follow} = laneNeighbours(sim, v, v.road, target);
  const moto = v.cls === 'motorcycle';
  const frontNeed = (moto ? 1.5 : 3) + v.v * (moto ? 0.3 : 0.6);
  if (lead && gapTo(v, lead) < frontNeed) return false;
  if (follow){
    const backGap = gapTo(follow, v);
    if (backGap < (moto ? 1.5 : 3) + follow.v * (moto ? 0.4 : 0.9)) return false;
  }
  v.fromLane = v.lane; v.lane = target; v.prog = 0; v.cooldown = moto ? 1.5 : 3;
  return true;
}

function addPassenger(sim, v){
  const x = sToX(v.s, v.dir);
  const fromZ = v.road === 'B' ? LAYOUT.bay.slotZ : v.z;
  const ent = LAYOUT.entrances.reduce((a, b) => Math.abs(b.x - x) < Math.abs(a.x - x) ? b : a);
  sim.peds.push({id: `p${sim.nextId++}`, x, z: fromZ, path: v.road === 'B'
    ? [[x, LAYOUT.station.z0 + 6]]
    : [[x, LAYOUT.sidewalkS.z0 + 1.5], [ent.x, ent.z]], speed: 1.1 + sim.rand() * 0.4, passenger: true});
  sim.stats.alight += 1;
  if (v.road === 'S' && v.lane >= 1) sim.stats.conflicts += 1;
}

function spawnBackgroundPed(sim){
  const r = sim.rand;
  const ent = LAYOUT.entrances[r() < 0.5 ? 0 : 1];
  const x = ent.x + (r() - 0.5) * 160;
  const z = LAYOUT.sidewalkS.z0 + 1 + r() * 2.5;
  const toStation = r() < 0.6;
  sim.peds.push(toStation
    ? {id: `p${sim.nextId++}`, x, z, path: [[ent.x, ent.z]], speed: 1.1 + r() * 0.5}
    : {id: `p${sim.nextId++}`, x: ent.x, z: ent.z, path: [[x, z]], speed: 1.1 + r() * 0.5});
}

/* ------------------------------------------------------------------ main step */
function bayFreeSlot(sim){
  for (let i = sim.bay.length - 1; i >= 0; i--) if (!sim.bay[i]) return i;
  return -1;
}

function tick(sim, dt){
  sim.t += dt;
  buildIndex(sim);
  spawn(sim);
  buildIndex(sim);
  if (sim.t >= sim.nextPed){ spawnBackgroundPed(sim); sim.nextPed = sim.t + 1.4 + sim.rand() * 1.6; }
  const L = LAYOUT, bayEntryS = xToS(L.bay.entryX, 1), bayExitS = xToS(L.bay.exitX, 1);

  for (const v of sim.vehicles){
    v.cooldown = Math.max(0, v.cooldown - dt);
    const x = sToX(v.s, v.dir);
    // ---- intent: lane choice
    if (v.road === 'S' && v.prog >= 1){
      if (v.state === 'seek' && v.plan){
        const targetS = v.plan.mode === 'bay' ? bayEntryS : xToS(v.plan.stopX, 1);
        if (v.plan.mode === 'bay' && v.s > bayEntryS - 160 && bayFreeSlot(sim) < 0 && !v.spilled){
          v.spilled = true; sim.stats.spill += 1;
          const z = L.zones[2];
          v.plan = {...v.plan, mode: 'curb', zone: z.id, stopX: z.x0 + 3 + sim.rand() * (z.x1 - z.x0 - 6)};
        }
        if (v.lane > 0 && v.s > targetS - 170) tryLaneChange(sim, v, v.lane - 1);
        if (v.s > targetS - 14){
          if (v.plan.mode === 'bay' && v.lane === 0) v.state = 'toBay';
          else if (v.plan.mode === 'curb' && v.lane <= 1) v.state = 'approach';
          else { v.state = 'drive'; v.plan = null; }
        }
      } else if (v.state === 'drive'){
        if (v.lane === 2 && x > LANE_DROP_X - 70) tryLaneChange(sim, v, 1);
        else {
          const {lead} = laneNeighbours(sim, v, 'S', v.lane);
          if (lead && lead.v < 1.5 && gapTo(v, lead) < 30){
            if (!tryLaneChange(sim, v, v.lane + 1) && v.lane > 0 && lead.state === 'stopped') tryLaneChange(sim, v, v.lane - 1);
          }
        }
      }
    }
    if (v.prog < 1){
      v.prog = Math.min(1, v.prog + dt / (v.cls === 'motorcycle' ? 1.2 : 2.4));
    }
    // ---- longitudinal
    if (v.state === 'stopped' || v.state === 'bayStop'){
      v.v = 0; v.dwellLeft -= dt; v.dwellAcc += dt;
      if (v.dwellLeft <= 0){
        if (v.state === 'bayStop'){ sim.bay[v.slot] = null; v.state = 'bayOut'; v.slot = -1; }
        else { v.state = 'drive'; v.plan = null; v.leftStop = true; }
      }
    } else {
      let v0 = v.v0, lead = null, gap = Infinity, dv = 0;
      if (v.road === 'B'){
        v0 = 5;
        lead = neighboursIn(sim._idx.get('Bmove') || [], v).lead;
      } else {
        lead = laneNeighbours(sim, v, v.road, v.lane).lead;
        if (v.prog < 0.65){
          const other = laneNeighbours(sim, v, v.road, v.fromLane).lead;
          if (other && (!lead || other.s < lead.s)) lead = other;
        }
      }
      if (lead){ gap = gapTo(v, lead); dv = v.v - lead.v; }
      // Virtual obstacles: stop point, bay entry, lane drop, bay exit merge.
      const obstacle = s => { const g = s - (v.s + v.spec.len / 2); if (g < gap){ gap = g; dv = v.v; } };
      if (v.state === 'approach') obstacle(xToS(v.plan.stopX, 1) + v.spec.len / 2);
      if (v.road === 'S' && v.lane === 2 && v.prog >= 1) obstacle(xToS(LANE_DROP_X, 1));
      if (v.state === 'toBay'){ v0 = Math.min(v0, 5); }
      if (v.road === 'B' && v.state === 'bay') obstacle(xToS(L.bay.slots[v.slot], 1) + v.spec.len / 2);
      if (v.road === 'B' && v.state === 'bayOut') obstacle(bayExitS + 2);
      const acc = idm(v.v, v.spec, v0, gap, dv);
      v.v = Math.max(0, v.v + acc * dt);
      v.s += v.v * dt;
    }
    // ---- state transitions
    if (v.state === 'approach' && v.v < 0.4 && Math.abs(xToS(v.plan.stopX, 1) - v.s) < 3){
      v.state = 'stopped'; v.dwellLeft = v.plan.dwell; v.dwellAcc = 0; v.v = 0;
      if (!v.plan.bus) addPassenger(sim, v);
    }
    if (v.state === 'toBay' && v.s >= bayEntryS){
      const slot = bayFreeSlot(sim);
      if (slot >= 0){ v.road = 'B'; v.state = 'bay'; v.slot = slot; sim.bay[slot] = v.id; v.rampT = 0; }
      else { v.state = 'drive'; v.plan = null; }
    }
    if (v.road === 'B' && v.state === 'bay' && v.v < 0.4 && Math.abs(xToS(L.bay.slots[v.slot], 1) - v.s) < 3){
      v.state = 'bayStop'; v.dwellLeft = v.plan.dwell; v.dwellAcc = 0; addPassenger(sim, v);
    }
    if (v.road === 'B' && v.state === 'bayOut' && v.s >= bayExitS - 7){
      const lane = LANE_BY_KEY.S0;
      const {lead, follow} = laneNeighbours(sim, v, 'S', 0);
      const okFront = !lead || gapTo(v, lead) > 4;
      const okBack = !follow || gapTo(follow, v) > 5 + follow.v * 1.1;
      if (okFront && okBack){ v.road = 'S'; v.lane = 0; v.fromLane = 0; v.prog = 1; v.state = 'drive'; v.plan = null; v.z = lane.z; v.rampT = 0; v.leftStop = true; }
    }
    // ---- lateral position + heading
    if (v.road === 'B'){
      v.rampT = Math.min(1, (v.rampT || 0) + dt / 3);
      const targetZ = v.state === 'bayStop' ? L.bay.slotZ : L.bay.moveZ;
      v.z += (targetZ - v.z) * Math.min(1, dt * 1.6);
    } else if (v.road !== 'B'){
      const lz = LANE_BY_KEY[`${v.road}${v.lane}`].z, fz = LANE_BY_KEY[`${v.road}${v.fromLane}`].z;
      const nz = fz + (lz - fz) * smooth(v.prog);
      const stopOffset = v.state === 'stopped' && v.road === 'S' && v.lane === 0 ? 0.6 : 0;
      v.z = nz + stopOffset;
    }
    const dz = v.prevZ === undefined ? 0 : v.z - v.prevZ;
    const dx = Math.max(0.01, v.v * dt);
    v.yaw = (v.dir > 0 ? 0 : Math.PI) + (v.dir > 0 ? 1 : -1) * Math.atan2(dz, dx) * 0.8;
    v.prevZ = v.z;
    v.x = sToX(v.s, v.dir);
  }

  // ---- exits + stats
  const keep = [];
  for (const v of sim.vehicles){
    if (v.s > LEN + 10){
      if (v.road === 'S' && sim.t > sim.stats.from){
        sim.stats.exited += 1;
        if (!v.plan && !v.leftStop && v.cls !== 'bus'){ sim.stats.delaySum += Math.max(0, (sim.t - v.spawnT) - LEN / v.v0); sim.stats.delayN += 1; }
      }
      continue;
    }
    keep.push(v);
  }
  sim.vehicles = keep;
  for (const p of sim.peds){
    const target = p.path[0];
    if (!target){ p.done = true; continue; }
    const dx = target[0] - p.x, dz = target[1] - p.z, d = Math.hypot(dx, dz);
    if (d < 0.4) p.path.shift();
    else { p.x += dx / d * p.speed * dt; p.z += dz / d * p.speed * dt; p.heading = Math.atan2(dz, dx); }
  }
  sim.peds = sim.peds.filter(p => !p.done && p.path.length);
  sample(sim, dt);
}

function sample(sim, dt){
  const st = sim.stats;
  let speedSum = 0, speedN = 0, blocked = 0, queue = 0;
  const perLane = [[], [], []];
  for (const v of sim.vehicles){
    if (v.road !== 'S') continue;
    if (v.state === 'stopped') blocked += 1;
    if (v.x > -130 && v.x < 130 && v.state !== 'stopped'){ speedSum += v.v; speedN += 1; }
    perLane[v.lane].push(v);
  }
  for (const lane of perLane){
    lane.sort((a, b) => a.s - b.s);
    let start = null, prev = null;
    for (const v of lane){
      const slow = v.v < 2 || v.state === 'stopped';
      if (slow && prev && start && v.s - v.spec.len / 2 - (prev.s + prev.spec.len / 2) < 12){ queue = Math.max(queue, v.s + v.spec.len / 2 - (start.s - start.spec.len / 2)); }
      else if (slow){ start = v; }
      else start = null;
      prev = slow ? v : null;
    }
  }
  const k = Math.min(1, dt * 0.5);
  sim.live.speed += ((speedN ? speedSum / speedN * 3.6 : 40) - sim.live.speed) * k;
  sim.live.queue = queue;
  sim.live.blocked = blocked;
  if (sim.t <= st.from) return;
  st.speedSum += speedSum * dt; st.speedN += speedN * dt;
  st.queueSum += queue * dt; st.queueMax = Math.max(st.queueMax, queue);
  st.blockSum += blocked * dt;
}

export function stepSim(sim, dt){
  let rem = Math.min(dt, 2);
  while (rem > 1e-6){ const d = Math.min(0.1, rem); tick(sim, d); rem -= d; }
}

export function simMetrics(sim){
  const st = sim.stats, span = Math.max(1, sim.t - st.from);
  return {
    seconds: span,
    avgSpeedKmh: st.speedN ? st.speedSum / st.speedN * 3.6 : 0,
    avgQueueM: st.queueSum / span,
    maxQueueM: st.queueMax,
    avgBlocked: st.blockSum / span,
    throughputVph: st.exited * 3600 / span,
    delaySec: st.delayN ? st.delaySum / st.delayN : 0,
    conflictsPerHour: st.conflicts * 3600 / span,
    alightPerHour: st.alight * 3600 / span,
    spill: st.spill,
    live: {...sim.live}
  };
}

/** Run one scenario headless (fast-forward) and return its metrics after warm-up. */
export function runScenario(opts, seconds = 600, warmup = 120){
  const sim = createSim(opts);
  for (let t = 0; t < warmup; t += 0.5) stepSim(sim, 0.5);
  resetStats(sim);
  for (let t = 0; t < seconds; t += 0.5) stepSim(sim, 0.5);
  return simMetrics(sim);
}

