/**
 * Tiny dependency-free 3D renderer for the SIMPUL Fatmawati scene (Canvas 2D).
 * Perspective camera, near-plane clipping, flat shading, painter's sort per box,
 * and depth haze. Presentation only: it never reads or writes application state.
 */
import {translatePhrase} from './i18n-dom.js';
const NEAR = 0.6;
const LIGHT = v3norm([-0.38, 0.86, 0.34]);
const colorCache = new Map();

function v3norm(v){ const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
function rgb(hex){
  let c = colorCache.get(hex);
  if (!c){
    const h = hex.replace('#', '');
    c = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    colorCache.set(hex, c);
  }
  return c;
}
const FOG = [214, 226, 240];
function tone(hex, light, fog, alpha = 1){
  const c = rgb(hex);
  const r = Math.round((c[0] * light) * (1 - fog) + FOG[0] * fog);
  const g = Math.round((c[1] * light) * (1 - fog) + FOG[1] * fog);
  const b = Math.round((c[2] * light) * (1 - fog) + FOG[2] * fog);
  return alpha < 1 ? `rgba(${r},${g},${b},${alpha})` : `rgb(${r},${g},${b})`;
}

export function createCamera(){ return {target: [0, 0, 0], yaw: -0.9, pitch: 0.55, dist: 230, fov: 50 * Math.PI / 180}; }

/** Camera basis + screen parameters for the current canvas size. */
export function cameraFrame(cam, w, h){
  const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch), cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
  const t = cam.target;
  const pos = [t[0] + cam.dist * cp * sy, t[1] + cam.dist * sp, t[2] + cam.dist * cp * cy];
  const f = [-cp * sy, -sp, -cp * cy];
  const r = v3norm([cy, 0, -sy]);
  const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  return {pos, f, r, u, w, h, cx: w / 2, cy: h / 2, fpx: (h / 2) / Math.tan(cam.fov / 2)};
}

function toCam(B, p){
  const dx = p[0] - B.pos[0], dy = p[1] - B.pos[1], dz = p[2] - B.pos[2];
  return [dx * B.r[0] + dy * B.r[1] + dz * B.r[2], dx * B.u[0] + dy * B.u[1] + dz * B.u[2], dx * B.f[0] + dy * B.f[1] + dz * B.f[2]];
}

/** Project a world point to screen pixels, or null when behind the camera. */
export function projectPoint(B, p){
  const c = toCam(B, p);
  if (c[2] < NEAR) return null;
  return [B.cx + B.fpx * c[0] / c[2], B.cy - B.fpx * c[1] / c[2], c[2]];
}

/** World ray through a screen pixel intersected with the ground plane y = 0. */
export function screenToGround(B, sx, sy, y = 0){
  const dx = (sx - B.cx) / B.fpx, dy = -(sy - B.cy) / B.fpx;
  const dir = [B.r[0] * dx + B.u[0] * dy + B.f[0], B.r[1] * dx + B.u[1] * dy + B.f[1], B.r[2] * dx + B.u[2] * dy + B.f[2]];
  if (Math.abs(dir[1]) < 1e-6) return null;
  const t = (y - B.pos[1]) / dir[1];
  if (t <= 0) return null;
  return [B.pos[0] + dir[0] * t, y, B.pos[2] + dir[2] * t];
}

function clipNear(pts){
  const out = [];
  for (let i = 0; i < pts.length; i++){
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const ain = a[2] >= NEAR, bin = b[2] >= NEAR;
    if (ain) out.push(a);
    if (ain !== bin){
      const t = (NEAR - a[2]) / (b[2] - a[2]);
      out.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1]), NEAR]);
    }
  }
  return out;
}

function pathPoly(ctx, B, camPts){
  const pts = clipNear(camPts);
  if (pts.length < 3) return false;
  ctx.beginPath();
  for (let i = 0; i < pts.length; i++){
    const p = pts[i];
    const sx = B.cx + B.fpx * p[0] / p[2], sy = B.cy - B.fpx * p[1] / p[2];
    if (i) ctx.lineTo(sx, sy); else ctx.moveTo(sx, sy);
  }
  ctx.closePath();
  return true;
}

const fogAt = depth => Math.min(0.62, Math.max(0, (depth - 140) / 700));

/** Box corners in world space. Box: {c:[x,y,z], h:[hx,hy,hz], yaw}. */
export function boxCorners(b){
  const c = Math.cos(b.yaw || 0), s = Math.sin(b.yaw || 0);
  const out = [];
  for (let i = 0; i < 8; i++){
    const lx = (i & 1 ? 1 : -1) * b.h[0], ly = (i & 2 ? 1 : -1) * b.h[1], lz = (i & 4 ? 1 : -1) * b.h[2];
    out.push([b.c[0] + lx * c - lz * s, b.c[1] + ly, b.c[2] + lx * s + lz * c]);
  }
  return out;
}
const FACES = [
  {idx: [1, 3, 7, 5], n: (c, s) => [c, 0, s]},
  {idx: [0, 4, 6, 2], n: (c, s) => [-c, 0, -s]},
  {idx: [2, 6, 7, 3], n: () => [0, 1, 0]},
  {idx: [0, 1, 5, 4], n: () => [0, -1, 0]},
  {idx: [4, 5, 7, 6], n: (c, s) => [-s, 0, c]},
  {idx: [0, 2, 3, 1], n: (c, s) => [s, 0, -c]}
];

function drawBox(ctx, B, b, highlight, alphaOverride){
  const alpha = alphaOverride ?? b.alpha ?? 1;
  const corners = boxCorners(b);
  const cam = corners.map(p => toCam(B, p));
  if (cam.every(p => p[2] < NEAR)) return;
  const cc = toCam(B, b.c);
  const fog = fogAt(cc[2]);
  const c = Math.cos(b.yaw || 0), s = Math.sin(b.yaw || 0);
  for (const face of FACES){
    const n = face.n(c, s);
    const p0 = corners[face.idx[0]], p2 = corners[face.idx[2]];
    const mid = [(p0[0] + p2[0]) / 2, (p0[1] + p2[1]) / 2, (p0[2] + p2[2]) / 2];
    const view = [B.pos[0] - mid[0], B.pos[1] - mid[1], B.pos[2] - mid[2]];
    if (n[0] * view[0] + n[1] * view[1] + n[2] * view[2] <= 0) continue;
    const diffuse = Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);
    const light = 0.58 + 0.46 * diffuse;
    const color = (n[1] > 0.5 && b.top) ? b.top : b.color;
    if (!pathPoly(ctx, B, face.idx.map(i => cam[i]))) continue;
    ctx.fillStyle = tone(color, light, fog, alpha);
    ctx.fill();
    if (b.edge !== false && alpha >= 1){ ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 0.6; ctx.stroke(); }
  }
  if (highlight){
    ctx.strokeStyle = '#f86809'; ctx.lineWidth = 2.2;
    for (const face of [FACES[2]]){ if (pathPoly(ctx, B, face.idx.map(i => cam[i]))) ctx.stroke(); }
  }
}

function drawGround(ctx, B, g){
  const cam = g.pts.map(p => toCam(B, [p[0], g.y || 0, p[1]]));
  if (cam.every(p => p[2] < NEAR)) return;
  if (!pathPoly(ctx, B, cam)) return;
  const depth = cam.reduce((a, p) => a + p[2], 0) / cam.length;
  if (g.color){ ctx.fillStyle = tone(g.color, 1, g.noFog ? 0 : fogAt(depth) * 0.8, g.alpha ?? 1); ctx.fill(); }
  if (g.stroke){ ctx.strokeStyle = g.stroke; ctx.lineWidth = g.lineWidth || 1.5; if (g.dash) ctx.setLineDash(g.dash); ctx.stroke(); ctx.setLineDash([]); }
}

function drawLabel(ctx, B, l){
  const p = projectPoint(B, l.p);
  if (!p || p[0] < -80 || p[0] > B.w + 80 || p[1] < -20 || p[1] > B.h + 20) return;
  const size = l.size || 11;
  ctx.font = `700 ${size}px "Plus Jakarta Sans", Arial, sans-serif`;
  const text = translatePhrase(l.text);
  const tw = ctx.measureText(text).width;
  const padX = 7, hgt = size + 9, x = p[0] - tw / 2 - padX, y = p[1] - hgt / 2;
  ctx.fillStyle = l.bg || 'rgba(6,16,42,.72)';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, tw + padX * 2, hgt, 6); else ctx.rect(x, y, tw + padX * 2, hgt);
  ctx.fill();
  ctx.fillStyle = l.fg || '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + padX, p[1] + 0.5);
}

/**
 * Render a frame. scene: {ground:[], boxes:[], labels:[]}; dyn: {ground:[], boxes:[], labels:[]}.
 * Returns the camera frame used, so callers can projectPoint overlays and pick objects.
 */
export function renderFrame(canvas, cam, scene, dyn, opts = {}){
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = canvas.clientWidth || 800, h = canvas.clientHeight || 450;
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)){
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const B = cameraFrame(cam, w, h);
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#8fb5df'); sky.addColorStop(0.55, '#d6e2f0'); sky.addColorStop(1, '#e8eef5');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  for (const g of scene.ground) if (!g.when || g.when(opts)) drawGround(ctx, B, g);
  for (const g of dyn.ground) drawGround(ctx, B, g);
  const boxes = [];
  const visible = b => {
    const c = toCam(B, b.c), rad = Math.hypot(b.h[0], b.h[1], b.h[2]);
    if (c[2] < -rad) return null;
    if (c[2] > NEAR + rad){
      const sx = B.cx + B.fpx * c[0] / c[2], sy = B.cy - B.fpx * c[1] / c[2], pr = B.fpx * rad / c[2];
      if (sx + pr < 0 || sx - pr > w || sy + pr < 0 || sy - pr > h || pr < 0.35) return null;
    }
    return c;
  };
  for (const b of scene.boxes){ const c = visible(b); if (c) boxes.push([c[2] + (b.bias || 0), b]); }
  for (const b of dyn.boxes){ const c = visible(b); if (c) boxes.push([c[2] + (b.bias || 0), b]); }
  boxes.sort((a, b) => b[0] - a[0]);
  const ghost = opts.stationAlpha ?? 1;
  for (const [, b] of boxes) drawBox(ctx, B, b, opts.highlight && b.ref === opts.highlight, b.group === 'station' && ghost < 1 ? Math.min(b.alpha ?? 1, ghost) : undefined);
  if (opts.labels !== false){
    for (const l of scene.labels) if (!l.when || l.when(opts)) drawLabel(ctx, B, l);
    for (const l of dyn.labels) drawLabel(ctx, B, l);
  }
  return B;
}
