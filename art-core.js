import { TILE_W, TILE_H, COLS, ROWS } from "./data.js";

export const TAU = Math.PI * 2;
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export const lerp = (a, b, t) => a + (b - a) * t;

export function seeded(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function roundRect(ctx, x, y, w, h, r) {
  const rr = typeof r === "number" ? [r, r, r, r] : r;
  ctx.beginPath();
  ctx.moveTo(x + rr[0], y);
  ctx.lineTo(x + w - rr[1], y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr[1]);
  ctx.lineTo(x + w, y + h - rr[2]);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr[2], y + h);
  ctx.lineTo(x + rr[3], y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr[3]);
  ctx.lineTo(x, y + rr[0]);
  ctx.quadraticCurveTo(x, y, x + rr[0], y);
  ctx.closePath();
}

export function heartPath(ctx, x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.72);
  ctx.bezierCurveTo(x - s * 1.1, y - s * 0.05, x - s * 0.65, y - s * 0.9, x, y - s * 0.34);
  ctx.bezierCurveTo(x + s * 0.65, y - s * 0.9, x + s * 1.1, y - s * 0.05, x, y + s * 0.72);
  ctx.closePath();
}

export function starPath(ctx, x, y, r, points = 5, inner = 0.43, rotation = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const a = rotation + (i * Math.PI) / points;
    const rr = i % 2 ? r * inner : r;
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (!i) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export function leafPath(ctx, x, y, w, h, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.bezierCurveTo(w * 0.8, -h * 0.3, w * 0.7, h * 0.35, 0, h / 2);
  ctx.bezierCurveTo(-w * 0.7, h * 0.35, -w * 0.8, -h * 0.3, 0, -h / 2);
  ctx.closePath();
  ctx.restore();
}

export function ellipse(ctx, x, y, rx, ry, fill, rot = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, TAU);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
}

export function softShadow(ctx, x, y, rx, ry, alpha = 0.16) {
  ctx.save();
  const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
  g.addColorStop(0, `rgba(52, 68, 44, ${alpha})`);
  g.addColorStop(0.55, `rgba(52, 68, 44, ${alpha * 0.55})`);
  g.addColorStop(1, "rgba(52, 68, 44, 0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function iso(view, c, r) {
  const ox = (COLS - 1) / 2;
  const oy = (ROWS - 1) / 2;
  return {
    x: view.cx + (c - r - ox + oy) * (TILE_W / 2) * view.scale,
    y: view.cy + (c + r - ox - oy) * (TILE_H / 2) * view.scale
  };
}

export function tileDiamond(view, c, r, inset = 0) {
  const p = iso(view, c, r);
  const hw = ((TILE_W / 2) * view.scale) - inset;
  const hh = ((TILE_H / 2) * view.scale) - inset * 0.5;
  return {
    top: { x: p.x, y: p.y - hh },
    right: { x: p.x + hw, y: p.y },
    bottom: { x: p.x, y: p.y + hh },
    left: { x: p.x - hw, y: p.y },
    center: p
  };
}

export function viewCorners(view) {
  const top = iso(view, 0, 0);
  const right = iso(view, COLS - 1, 0);
  const bottom = iso(view, COLS - 1, ROWS - 1);
  const left = iso(view, 0, ROWS - 1);
  const hw = (TILE_W / 2) * view.scale;
  const hh = (TILE_H / 2) * view.scale;
  return {
    T: { x: top.x, y: top.y - hh },
    R: { x: right.x + hw, y: right.y },
    B: { x: bottom.x, y: bottom.y + hh },
    L: { x: left.x - hw, y: left.y }
  };
}

export function bezierPath(ctx, pts, close = true) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i += 3) {
    if (pts[i + 2]) ctx.bezierCurveTo(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], pts[i + 2][0], pts[i + 2][1]);
  }
  if (close) ctx.closePath();
}

export function drawSparkle(ctx, x, y, r, color = "#f5d783", alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x + r * 0.16, y - r * 0.16, x + r, y);
  ctx.quadraticCurveTo(x + r * 0.16, y + r * 0.16, x, y + r);
  ctx.quadraticCurveTo(x - r * 0.16, y + r * 0.16, x - r, y);
  ctx.quadraticCurveTo(x - r * 0.16, y - r * 0.16, x, y - r);
  ctx.fill();
  ctx.restore();
}

export function drawHeart(ctx, x, y, s, color = "#dd8179", alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  heartPath(ctx, x, y, s);
  ctx.fill();
  ctx.restore();
}

export function drawStar(ctx, x, y, r, color = "#f1c568", alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  starPath(ctx, x, y, r);
  ctx.fill();
  ctx.restore();
}

export function drawDew(ctx, x, y, s, color = "#67aaa4", alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.bezierCurveTo(x - s * 0.75, y - s * 0.2, x - s * 0.62, y + s * 0.7, x, y + s * 0.72);
  ctx.bezierCurveTo(x + s * 0.62, y + s * 0.7, x + s * 0.75, y - s * 0.2, x, y - s);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.6)";
  ctx.beginPath();
  ctx.ellipse(x - s * 0.2, y + s * 0.08, s * 0.15, s * 0.27, -0.25, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function drawBerry(ctx, x, y, s, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#d86966";
  ctx.beginPath();
  ctx.arc(x - s * 0.27, y + s * 0.1, s * 0.5, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + s * 0.3, y + s * 0.2, s * 0.46, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + s * 0.02, y - s * 0.22, s * 0.47, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.32)";
  ctx.beginPath();
  ctx.arc(x - s * 0.4, y - s * 0.05, s * 0.1, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#5e7c53";
  leafPath(ctx, x + s * 0.12, y - s * 0.72, s * 0.4, s * 0.45, 0.65);
  ctx.fill();
  ctx.restore();
}
