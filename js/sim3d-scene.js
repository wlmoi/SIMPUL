/**
 * Static 3D scene of the MRT Fatmawati frontage, modelled schematically from
 * public photos and reported dimensions (~175 x 22 m, platform ~25.6 m, roof ~34 m):
 * an elevated station that straddles the arterial road, a service lane beneath,
 * beside it, Transjakarta stop at the entrance, toll JORR in the middle (context
 * only), MRT viaduct curving north, Park & Ride, surrounding blocks and trees.
 * Not surveyed geometry.
 */
import {LAYOUT} from './fatmawati-layout.js';
import {LANE_DROP_X} from './traffic-sim.js';

const ASPHALT = '#3e4554', ASPHALT_TOLL = '#4c5260', CURB = '#a7aeb8', WALK = '#c8c1b4', GRASS = '#a9c19a';

function sceneRng(seed){
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const rect = (x0, z0, x1, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];

/** Split long boxes so the painter's sort stays correct around vehicles. */
function pushBox(list, b, maxLen = 12){
  const [hx, , hz] = b.h;
  if (!b.yaw && (hx * 2 > maxLen || hz * 2 > maxLen)){
    const nx = Math.max(1, Math.ceil(hx * 2 / maxLen)), nz = Math.max(1, Math.ceil(hz * 2 / maxLen));
    for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++){
      const cx = b.c[0] - hx + hx * 2 * (i + 0.5) / nx, cz = b.c[2] - hz + hz * 2 * (k + 0.5) / nz;
      list.push({...b, c: [cx, b.c[1], cz], h: [hx / nx, b.h[1], hz / nz]});
    }
  } else list.push(b);
}
const sBox = (x0, y0, z0, x1, y1, z1, color, extra = {}) => ({c: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], h: [(x1 - x0) / 2, (y1 - y0) / 2, (z1 - z0) / 2], color, ...extra});

function laneDashes(ground, z, x0, x1, opts = {}){
  for (let x = x0; x < x1; x += 9){
    if (opts.skip && opts.skip(x)) continue;
    ground.push({pts: rect(x, z - 0.08, Math.min(x + 3.2, x1), z + 0.08), y: 0.03, color: '#e9edf2'});
  }
}

function tree(boxes, x, z, r, s = 1){
  pushBox(boxes, sBox(x - 0.18, 0, z - 0.18, x + 0.18, 2.4 * s, z + 0.18, '#6b4f36'));
  const g = r() < 0.5 ? '#4f8a4b' : '#5b9651';
  boxes.push({c: [x, 3.6 * s, z], h: [1.7 * s, 1.3 * s, 1.7 * s], yaw: 0.78, color: g});
  boxes.push({c: [x, 4.9 * s, z], h: [1.1 * s, 0.7 * s, 1.1 * s], yaw: 0.2, color: '#67a35c'});
}

export function buildFatmawatiScene(){
  const L = LAYOUT, ground = [], boxes = [], labels = [];
  const r = sceneRng(2026);
  const X0 = -420, X1 = 420;

  // ---------------- ground
  ground.push({pts: rect(-700, -700, 700, 700), y: -0.05, color: '#d3d8cc'});
  ground.push({pts: rect(X0, L.sidewalkN.z0 - 4, X1, L.sidewalkS.z1 + 2.5), y: -0.02, color: GRASS});
  ground.push({pts: rect(X0, L.southRoad.z0, X1, L.southRoad.z1), y: 0, color: ASPHALT});
  ground.push({pts: rect(X0, L.northRoad.z0, X1, L.northRoad.z1), y: 0, color: ASPHALT});
  ground.push({pts: rect(X0, L.toll.z0, X1, L.toll.z1), y: 0, color: ASPHALT_TOLL});
  ground.push({pts: rect(X0, L.toll.z1, X1, L.southRoad.z0), y: 0.01, color: CURB});
  ground.push({pts: rect(X0, L.northRoad.z1, X1, L.toll.z0), y: 0.01, color: CURB});
  ground.push({pts: rect(X0, -10.05, X1, -9.35), y: 0.02, color: '#c9cdd3'});
  // lane drop: median lane of the analysed road ends near the toll access
  ground.push({pts: [[LANE_DROP_X - 26, 0], [LANE_DROP_X, 0], [LANE_DROP_X, 3.5], [LANE_DROP_X - 26, 0.15]], y: 0.02, color: '#f2c94c', alpha: 0.85});
  ground.push({pts: rect(LANE_DROP_X, 0, X1, 3.5), y: 0.015, color: '#8e959f'});
  // sidewalks (with driveways for the A1 service lane)
  const sw = L.sidewalkS;
  ground.push({pts: rect(X0, sw.z0, L.bay.entryX - 6, sw.z1), y: 0.12, color: WALK});
  ground.push({pts: rect(L.bay.entryX + 2, sw.z0, L.bay.exitX - 2, sw.z1), y: 0.12, color: WALK});
  ground.push({pts: rect(L.bay.exitX + 6, sw.z0, X1, sw.z1), y: 0.12, color: WALK});
  ground.push({pts: rect(X0, L.sidewalkN.z0, X1, L.sidewalkN.z1), y: 0.12, color: WALK});
  // service lane under the station + ramps
  ground.push({pts: rect(L.bay.x0, L.bay.z0, L.bay.x1, L.bay.z1), y: 0.02, color: '#4a5163'});
  ground.push({pts: [[L.bay.entryX - 6, sw.z0], [L.bay.entryX + 2, sw.z0], [L.bay.entryX + 4, L.bay.z0], [L.bay.entryX - 4, L.bay.z0]], y: 0.03, color: '#4a5163'});
  ground.push({pts: [[L.bay.exitX - 2, sw.z0], [L.bay.exitX + 6, sw.z0], [L.bay.exitX + 4, L.bay.z0], [L.bay.exitX - 4, L.bay.z0]], y: 0.03, color: '#4a5163'});
  for (const x of L.bay.slots) ground.push({pts: rect(x - 3.4, L.bay.slotZ - 1.3, x + 3.4, L.bay.slotZ + 1.3), y: 0.04, stroke: 'rgba(255,255,255,.55)', lineWidth: 1});
  // lane markings
  const sl = L.southRoad.lanes, nl = L.northRoad.lanes;
  laneDashes(ground, (sl[0] + sl[1]) / 2, X0, X1);
  laneDashes(ground, (sl[1] + sl[2]) / 2, X0, LANE_DROP_X - 26);
  laneDashes(ground, (nl[0] + nl[1]) / 2, X0, X1);
  laneDashes(ground, (nl[1] + nl[2]) / 2, X0, X1);
  for (const z of [-6.1, -13.4]) laneDashes(ground, z, X0, X1);
  // zebra crossing west of the station
  for (let k = 0; k < 7; k++) ground.push({pts: rect(-106, 0.4 + k * 1.45, -98, 1.1 + k * 1.45), y: 0.03, color: '#eef1f4'});
  // zones (toggleable, scenario aware)
  for (const z of L.zones){
    const banned = o => o.scenario === 'A2' && z.id === 'Zona A';
    ground.push({pts: rect(z.x0, sl[0] - 1.75, z.x1, L.southRoad.z1), y: 0.05, color: '#f86809', alpha: 0.26, when: o => o.zones && !banned(o)});
    ground.push({pts: rect(z.x0, sl[0] - 1.75, z.x1, L.southRoad.z1), y: 0.05, color: '#e5484d', alpha: 0.3, when: o => o.zones && banned(o)});
    ground.push({pts: rect(z.x0, sl[0] - 1.75, z.x1, L.southRoad.z1), y: 0.06, stroke: 'rgba(255,190,140,.95)', dash: [6, 5], lineWidth: 1.6, when: o => o.zones});
    labels.push({p: [(z.x0 + z.x1) / 2, 0.4, sl[0]], text: z.id, bg: 'rgba(248,104,9,.92)', fg: '#1b2b4e', when: o => o.zones && !banned(o)});
    labels.push({p: [(z.x0 + z.x1) / 2, 0.4, sl[0]], text: `${z.id} · dilarang berhenti`, bg: 'rgba(229,72,77,.92)', when: o => o.zones && banned(o)});
  }
  ground.push({pts: rect(L.bay.x0 + 14, L.bay.z0 + 0.4, L.bay.x1 - 14, L.bay.z1 - 0.4), y: 0.05, color: '#0961ad', alpha: 0.3, when: o => o.zones && o.scenario === 'A1'});
  ground.push({pts: rect(L.halte.x0, sl[0] - 1.75, L.halte.x1, L.southRoad.z1), y: 0.05, color: '#c0392b', alpha: 0.22, when: o => o.zones});
  // Park & Ride lot
  ground.push({pts: rect(64, 40, 128, 78), y: 0.02, color: '#555c69'});
  for (let x = 68; x < 124; x += 4) for (const z of [44, 54, 64, 74]){
    ground.push({pts: rect(x, z - 2.4, x + 0.12, z + 2.4), y: 0.04, color: '#d6dbe2'});
    if (r() < 0.72) pushBox(boxes, sBox(x + 0.4, 0, z - 2.1, x + 3.6, 1.45, z + 2.1, ['#f4f5f7', '#c9ced6', '#2b2f36', '#8c939e', '#b8322f'][Math.floor(r() * 5)], {top: '#8a93a3'}));
  }

  // ---------------- toll barriers + lighting poles
  pushBox(boxes, sBox(X0, 0, L.toll.z1 - 0.3, X1, 1.1, L.toll.z1, '#b9bfc8', {edge: false}), 40);
  pushBox(boxes, sBox(X0, 0, L.toll.z0, X1, 1.1, L.toll.z0 + 0.3, '#b9bfc8', {edge: false}), 40);
  for (let x = -400; x <= 400; x += 40) pushBox(boxes, sBox(x - 0.15, 0, -9.85, x + 0.15, 9, -9.55, '#8e96a3'));

  // ---------------- station: elevated box straddling the arterial road (photos + reported dimensions)
  const stationStart = boxes.length;
  const st = L.station;
  const roadZ = z => (z > L.southRoad.z0 + 0.2 && z < L.southRoad.z1 - 0.2) || (z > L.toll.z0 && z < L.toll.z1) || (z > L.northRoad.z0 && z < L.northRoad.z1);
  for (let x = st.x0 + 4; x <= st.x1 - 4; x += 14) for (const z of st.pillarRows) pushBox(boxes, sBox(x - 0.9, 0, z - 0.9, x + 0.9, st.mezz, z + 0.9, '#bfc4cb'));
  // intermediate level slab and its beige enclosure
  pushBox(boxes, sBox(st.x0, st.mezz, st.z0, st.x1, st.mezz + 1.1, st.z1, '#c3c8cf'));
  pushBox(boxes, sBox(st.x0 + 6, st.mezz + 1.1, st.z0 + 1.2, st.x1 - 6, st.concourse, st.z1 - 1.2, '#d9d1c1', {top: '#c9c2b4'}));
  for (const z of [st.z0 + 1.1, st.z1 - 1.1]) pushBox(boxes, sBox(st.x0 + 10, st.mezz + 2.6, z - 0.12, st.x1 - 10, st.mezz + 4.2, z + 0.12, '#33465f'));
  // concourse: grey ribbed body with blue bands and blue end faces
  pushBox(boxes, sBox(st.x0, st.concourse, st.z0, st.x1, st.platform - 3, st.z1, '#cfd5dc', {top: '#e6eaef'}));
  for (const [y0, y1] of [[st.concourse, st.concourse + 1.4], [st.platform - 4.4, st.platform - 3]]) pushBox(boxes, sBox(st.x0 - 0.15, y0, st.z0 - 0.15, st.x1 + 0.15, y1, st.z1 + 0.15, '#1d4fa0'));
  for (const x of [st.x0, st.x1]) pushBox(boxes, sBox(x - 0.4, st.concourse, st.z0 - 0.2, x + 0.4, st.platform + 1.5, st.z1 + 0.2, '#1d4fa0'));
  pushBox(boxes, sBox(st.x0 - 0.7, st.concourse + 3, 3, st.x0 - 0.45, st.concourse + 6, 14, '#0b2c66'));
  for (const z of [st.z0 - 0.12, st.z1 + 0.12]) for (let x = st.x0 + 4; x < st.x1 - 4; x += 3) pushBox(boxes, sBox(x, st.concourse + 1.6, z - 0.06, x + 0.25, st.platform - 4.6, z + 0.06, '#b7bec8', {edge: false}), 40);
  // platform level with tracks, railings and a train at the platform
  pushBox(boxes, sBox(st.x0, st.platform - 3, st.z0 + 0.5, st.x1, st.platform - 0.6, st.z1 - 0.5, '#d3d8de', {top: '#c2b6a3'}));
  for (const z of [st.z0 + 0.6, st.z1 - 0.6]) pushBox(boxes, sBox(st.x0, st.platform - 0.6, z - 0.08, st.x1, st.platform + 0.6, z + 0.08, '#e9edf1', {edge: false}), 40);
  const vz = (st.z0 + st.z1) / 2, trackY = st.platform - 0.6;
  pushBox(boxes, sBox(st.x0 + 22, trackY, vz - 5.2, st.x0 + 142, trackY + 3.4, vz - 2.2, '#cfd7e1', {top: '#e9eef4'}), 20);
  pushBox(boxes, sBox(st.x0 + 22, trackY + 1.2, vz - 5.25, st.x0 + 142, trackY + 1.7, vz - 2.15, '#1d4fa0', {edge: false}), 20);
  // white scalloped roof, apex at the reported ~34 m
  const span = st.z1 - st.z0 + 3, slats = 11;
  for (let i = 0; i < slats; i++){
    const t = (i + 0.5) / slats, z0 = st.z0 - 1.5 + span * i / slats, z1 = z0 + span / slats + 0.05;
    const y = st.top - 4 + Math.sin(Math.PI * t) * 4;
    pushBox(boxes, sBox(st.x0 - 2, y, z0, st.x1 - 22, y + 0.45, z1, '#f7f9fb', {top: '#ffffff', edge: false}));
  }
  for (let x = st.x0; x <= st.x1 - 22; x += 12) for (const z of [st.z0 - 1, st.z1 + 1]) pushBox(boxes, sBox(x - 0.25, st.platform, z - 0.25, x + 0.25, st.top - 4, z + 0.25, '#dfe4ea'));
  // entrances: lattice stair/lift towers and ground kiosks with an orange band
  for (const e of L.entrances){
    pushBox(boxes, sBox(e.x - 2.6, 0.12, e.z - 0.2, e.x + 2.6, st.concourse, e.z + 1.6, '#c9ced6', {top: '#9ba5b3'}));
    pushBox(boxes, sBox(e.x - 3.2, 0.12, e.z - 1.6, e.x + 3.2, 3.1, e.z - 0.2, '#e6dccb', {top: '#b8ad9c'}));
    pushBox(boxes, sBox(e.x - 3.25, 2.3, e.z - 1.65, e.x + 3.25, 2.8, e.z - 0.15, '#f86809', {edge: false}));
  }
  // small-vehicle lane sign at the service lane entry (photo: "Lajur khusus kendaraan kecil")
  pushBox(boxes, sBox(L.bay.entryX - 1.5, 2.3, L.sidewalkS.z1 + 0.3, L.bay.entryX + 1.5, 4.1, L.sidewalkS.z1 + 0.45, '#1f5fbf'));
  labels.push({p: [0, st.top + 4, vz], text: 'Stasiun MRT Fatmawati · layang ±25 m', bg: 'rgba(4,37,115,.9)', size: 12});
  labels.push({p: [st.x0 - 1, st.concourse + 4.5, 8.5], text: 'FATMAWATI INDOMARET', bg: 'rgba(11,44,102,.92)'});
  labels.push({p: [L.bay.entryX, 5.2, L.sidewalkS.z1 + 0.4], text: 'Lajur khusus kendaraan kecil', bg: 'rgba(31,95,191,.92)'});

  // ---------------- MRT viaduct at platform height: west to Lebak Bulus, east curving north over the toll
  const deckY = trackY - 1.6;
  pushBox(boxes, sBox(-420, deckY, vz - 4.6, st.x0, deckY + 1.6, vz + 4.6, '#d5d9df', {top: '#b9a68e'}));
  for (let x = st.x0 - 22; x > -420; x -= 26){
    pushBox(boxes, sBox(x - 1.2, 0, -2.2, x + 1.2, deckY - 1.4, -0.2, '#bfc4cb'));
    pushBox(boxes, sBox(x - 1.4, deckY - 1.6, -2.4, x + 1.4, deckY, vz + 4.6, '#c9ced6'));
  }
  const curve = [];
  for (let x = st.x1; x < 112; x += 6) curve.push([x, vz]);
  for (let a = 0; a <= Math.PI / 2 + 1e-6; a += Math.PI / 24) curve.push([112 + 68 * Math.sin(a), vz - 68 * (1 - Math.cos(a))]);
  for (let z = vz - 74; z > -420; z -= 6) curve.push([180, z]);
  for (let i = 0; i < curve.length - 1; i++){
    const [x0, z0] = curve[i], [x1, z1] = curve[i + 1];
    const len = Math.hypot(x1 - x0, z1 - z0), yaw = Math.atan2(z1 - z0, x1 - x0);
    boxes.push({c: [(x0 + x1) / 2, deckY + 0.8, (z0 + z1) / 2], h: [len / 2 + 0.15, 0.8, 4.6], yaw, color: '#d5d9df', top: '#b9a68e', edge: false});
    if (i % 4 === 0 && !roadZ(z0)) pushBox(boxes, sBox(x0 - 1.2, 0, z0 - 1.5, x0 + 1.2, deckY, z0 + 1.5, '#bfc4cb'));
  }

  // Tag station + viaduct so the renderer can ghost them and keep the traffic in focus.
  for (let i = stationStart; i < boxes.length; i++) boxes[i].group = 'station';

  // ---------------- Transjakarta stop at the station entrance
  const h = L.halte;
  pushBox(boxes, sBox(h.x0, 0.12, sw.z0 + 1, h.x1, 0.4, sw.z1 - 0.5, '#9aa3ad'));
  pushBox(boxes, sBox(h.x0, 2.6, sw.z0 + 0.8, h.x1, 2.9, sw.z1 - 0.3, '#2a64c5', {top: '#2a64c5'}));
  for (const x of [h.x0 + 1, h.x1 - 1]) pushBox(boxes, sBox(x - 0.15, 0.4, sw.z1 - 0.9, x + 0.15, 2.6, sw.z1 - 0.6, '#c9ced6'));
  labels.push({p: [(h.x0 + h.x1) / 2, 4.2, sw.z0 + 2], text: 'Halte Transjakarta', bg: 'rgba(42,100,197,.92)'});

  // ---------------- buildings
  const palette = ['#ebe6de', '#dcd6cc', '#f3f0ea', '#cfd6de', '#e7d6c4', '#d9dee5', '#efe8dc'];
  const block = (x0, x1, z0, z1, hMin, hMax, skip) => {
    for (let x = x0; x < x1;){
      const w = 12 + r() * 14, d = 12 + r() * (z1 - z0 - 12) * 0.8, gap = 3 + r() * 5;
      if (!skip || !skip(x, x + w)){
        const ht = hMin + r() * (hMax - hMin), z = z0 + r() * Math.max(1, z1 - z0 - d);
        const col = palette[Math.floor(r() * palette.length)];
        pushBox(boxes, sBox(x, 0, z, x + w, ht, z + d, col, {top: r() < 0.4 ? '#a8b0bb' : '#c6b9a6'}), 16);
        if (ht > 14 && r() < 0.5) pushBox(boxes, sBox(x + 1, ht * 0.2, z - 0.05, x + w - 1, ht * 0.85, z + 0.05, '#7ea6cf', {alpha: 0.85}), 16);
      }
      x += w + gap;
    }
  };
  block(-400, 60, 38, 92, 6, 22, (a, b) => b > -76 && a < -36);
  block(132, 400, 30, 90, 6, 20);
  block(-400, 400, -100, -40, 6, 26, (a, b) => (b > 160 && a < 200) || (b > 26 && a < 58));
  // landmark buildings from the photos
  pushBox(boxes, sBox(30, 0, -78, 54, 30, -50, '#f1f2f0', {top: '#2f8f6e'}), 16);
  pushBox(boxes, sBox(32, 30, -76, 52, 33, -52, '#2f8f6e'));
  pushBox(boxes, sBox(-70, 0, 40, -40, 18, 64, '#e9e4dc', {top: '#9aa3ad'}), 16);
  for (const [x, z, ht] of [[-260, -260, 82], [-200, -300, 96], [-120, -280, 70], [60, -320, 88], [140, -300, 62], [240, -280, 78]]) pushBox(boxes, sBox(x, 0, z, x + 24, ht, z + 22, '#c7d3e0', {top: '#9fb0c4'}), 30);

  // ---------------- trees
  for (let x = -400; x < 400; x += 14 + r() * 6){
    if ((x > L.station.x0 - 3 && x < L.station.x1 + 3) || Math.abs(x - L.bay.entryX) < 9 || Math.abs(x - L.bay.exitX) < 9 || (x > L.halte.x0 - 3 && x < L.halte.x1 + 3) || L.entrances.some(e => Math.abs(e.x - x) < 5)) continue;
    tree(boxes, x, sw.z1 + 1.2, r, 0.9 + r() * 0.3);
  }
  for (let x = -400; x < 400; x += 16 + r() * 8) tree(boxes, x, L.sidewalkN.z0 - 1.5, r, 0.9 + r() * 0.3);

  // ---------------- labels
  labels.push({p: [-128, 0.5, 5.2], text: 'Jalan arteri sisi stasiun · dianalisis', bg: 'rgba(9,97,173,.9)'});
  labels.push({p: [-128, 0.5, -9.7], text: 'Tol JORR · tidak dianalisis', bg: 'rgba(90,100,115,.78)'});
  labels.push({p: [-128, 0.5, -24.7], text: 'Arah Lebak Bulus ←', bg: 'rgba(90,100,115,.78)'});
  labels.push({p: [LANE_DROP_X - 10, 0.5, 1.8], text: 'Penyempitan · akses tol', bg: 'rgba(242,201,76,.95)', fg: '#1b2b4e'});
  labels.push({p: [0, 0.6, L.bay.moveZ + 1.5], text: 'Jalur khusus jemput (A1)', bg: 'rgba(9,97,173,.92)', when: o => o.scenario === 'A1'});
  labels.push({p: [96, 0.5, 60], text: 'Park & Ride', bg: 'rgba(90,100,115,.85)'});
  labels.push({p: [180, deckY + 6, -60], text: 'Jalur MRT → Cipete Raya', bg: 'rgba(90,100,115,.85)'});
  return {ground, boxes, labels};
}

let sceneCache=null;
/** Shared, lazily built static scene (both the home preview and the CCTV page use it). */
export function getFatmawatiScene(){ if(!sceneCache) sceneCache=buildFatmawatiScene(); return sceneCache; }

function vehicleFootprint(v,len,wid){
  const c=Math.cos(v.yaw),s=Math.sin(v.yaw),pts=[];
  for(const [lx,lz] of [[-1,-1],[1,-1],[1,1],[-1,1]]){const x=lx*(len/2+0.3),z=lz*(wid/2+0.3);pts.push([v.x+x*c-z*s+0.5,v.z+x*s+z*c+0.4]);}
  return pts;
}
/** Vehicles, shadows and pedestrians of a running simulation as renderable boxes. */
export function buildDynamicScene(sim){
  const boxes=[],ground=[],labels=[];
  for(const v of sim.vehicles){
    const {len,wid,h}=v.spec,alpha=v.road==='T'?0.5:1,yaw=v.yaw,ref=v.id;
    if(v.road!=='T')ground.push({pts:vehicleFootprint(v,len,wid),y:0.06,color:'#0b1220',alpha:0.22,noFog:true});
    const c=Math.cos(yaw),s=Math.sin(yaw);
    const off=(dx,y)=>[v.x+dx*c,y,v.z+dx*s];
    if(v.cls==='motorcycle'){
      boxes.push({c:off(0,0.45),h:[len/2,0.3,0.22],yaw,color:'#30353e',alpha,ref});
      boxes.push({c:off(-0.15,1.15),h:[0.28,0.42,0.26],yaw,color:v.color,alpha,ref});
      boxes.push({c:off(-0.05,1.72),h:[0.17,0.15,0.17],yaw,color:v.kind==='ojol'?'#1fae4b':'#e9edf2',alpha,ref});
    }else if(v.cls==='bus'){
      boxes.push({c:off(0,h*0.45),h:[len/2,h*0.45,wid/2],yaw,color:v.color,top:'#e9eef5',alpha,ref});
      boxes.push({c:off(0,h*0.62),h:[len/2+0.02,h*0.14,wid/2+0.02],yaw,color:'#1b2b4e',top:'#e9eef5',alpha,ref,bias:-0.05});
    }else if(v.cls==='truck'){
      boxes.push({c:off(len*0.36,h*0.4),h:[len*0.14,h*0.4,wid/2],yaw,color:'#d9dde3',alpha,ref});
      boxes.push({c:off(-len*0.12,h*0.5),h:[len*0.36,h*0.5,wid/2],yaw,color:v.color==='#2b2f36'?'#e0a33a':'#cfd5dd',alpha,ref});
    }else{
      boxes.push({c:off(0,0.45),h:[len/2,0.35,wid/2],yaw,color:v.color,alpha,ref});
      boxes.push({c:off(-0.2,1.08),h:[len*0.27,0.3,wid*0.44],yaw,color:'#26324a',top:v.color,alpha,ref,bias:-0.05});
    }
  }
  for(const p of sim.peds){
    boxes.push({c:[p.x,0.95,p.z],h:[0.24,0.8,0.24],color:p.passenger?'#f86809':'#5a6476',edge:false});
    boxes.push({c:[p.x,1.9,p.z],h:[0.16,0.16,0.16],color:'#e3c8a8',edge:false});
  }
  return {boxes,ground,labels};
}

