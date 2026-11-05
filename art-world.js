import {
  TILE_W, TILE_H, COLS, ROWS
} from "./data.js";
import {
  TAU, seeded, iso, tileDiamond, viewCorners, softShadow, leafPath, roundRect, drawSparkle
} from "./art-core.js";

function grassTuft(ctx, x, y, s, rnd, color = "#78955e") {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(0.8, 1.2 * s);
  ctx.lineCap = "round";
  for (let i = 0; i < 3 + Math.floor(rnd() * 3); i++) {
    const lean = (rnd() - 0.5) * 10 * s;
    ctx.beginPath();
    ctx.moveTo(x + (i - 1) * 2 * s, y);
    ctx.quadraticCurveTo(x + lean, y - 6 * s, x + lean * 1.3, y - (6 + rnd() * 7) * s);
    ctx.stroke();
  }
  ctx.restore();
}

function flower(ctx, x, y, s, rnd, color) {
  ctx.save();
  ctx.strokeStyle = "#72915d";
  ctx.lineWidth = Math.max(0.7, 0.9 * s);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + 1.5 * s, y - 5 * s, x + (rnd() - 0.5) * 3 * s, y - 9 * s);
  ctx.stroke();
  const fy = y - 9.5 * s;
  const petal = 1.8 * s;
  ctx.fillStyle = color;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU + 0.3;
    ctx.beginPath();
    ctx.ellipse(x + Math.cos(a) * petal, fy + Math.sin(a) * petal * 0.75, petal * 0.85, petal * 0.55, a, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = "#e6ba57";
  ctx.beginPath();
  ctx.arc(x, fy, petal * 0.5, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function mushroom(ctx, x, y, s, rnd) {
  ctx.save();
  const cap = (rnd() > 0.45 ? "#d7907e" : "#dfb47b");
  ctx.fillStyle = "#f0e6c9";
  ctx.beginPath();
  ctx.roundRect(x - 1.2 * s, y - 5 * s, 2.4 * s, 5 * s, 1.2 * s);
  ctx.fill();
  ctx.fillStyle = cap;
  ctx.beginPath();
  ctx.ellipse(x, y - 5 * s, 4.5 * s, 2.6 * s, 0, Math.PI, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(255,248,231,.7)";
  ctx.beginPath();
  ctx.arc(x - 1.3 * s, y - 6.1 * s, 0.7 * s, 0, TAU);
  ctx.arc(x + 1.4 * s, y - 5.7 * s, 0.55 * s, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function fern(ctx, x, y, s, rnd, color = "#6f8e5b") {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(0.8, 1.15 * s);
  ctx.lineCap = "round";
  const stems = 3 + Math.floor(rnd() * 3);
  for (let i = 0; i < stems; i++) {
    const a = -Math.PI / 2 + (i - (stems - 1) / 2) * 0.34;
    const len = (9 + rnd() * 7) * s;
    const ex = x + Math.cos(a) * len;
    const ey = y + Math.sin(a) * len;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + Math.cos(a) * len * 0.5 - 3 * s, y + Math.sin(a) * len * 0.5, ex, ey);
    ctx.stroke();
    for (let k = 1; k < 3; k++) {
      const t = k / 3;
      const lx = x + (ex - x) * t;
      const ly = y + (ey - y) * t;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx + 3 * s, ly - 2 * s);
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx - 3 * s, ly - 1.5 * s);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function pebble(ctx, x, y, s, rnd) {
  ctx.save();
  const r = (1.4 + rnd() * 2.2) * s;
  ctx.fillStyle = rnd() > 0.5 ? "rgba(133,126,101,.55)" : "rgba(177,170,143,.5)";
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.58, rnd() * 2, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawCrackedSlab(ctx, view, c, r, rnd) {
  const p = iso(view, c, r);
  const s = view.scale;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.fillStyle = "rgba(151,148,123,.58)";
  ctx.beginPath();
  ctx.moveTo(-28 * s, -7 * s);
  ctx.lineTo(27 * s, -3 * s);
  ctx.lineTo(30 * s, 11 * s);
  ctx.lineTo(-9 * s, 14 * s);
  ctx.lineTo(-27 * s, 8 * s);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(99,102,82,.35)";
  ctx.lineWidth = 1 * s;
  ctx.beginPath();
  ctx.moveTo(-22 * s, -4 * s);
  ctx.lineTo(-9 * s, 0);
  ctx.lineTo(-12 * s, 8 * s);
  ctx.moveTo(4 * s, -4 * s);
  ctx.lineTo(12 * s, 2 * s);
  ctx.lineTo(21 * s, 0);
  ctx.stroke();
  ctx.fillStyle = "rgba(192,175,106,.48)";
  ctx.fillRect(-15 * s, 5 * s, 20 * s, 3 * s);
  grassTuft(ctx, -24 * s, 3 * s, s * 0.72, rnd, "#78955e");
  ctx.restore();
}

function drawSign(ctx, view, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(74,84,59,.16)";
  ctx.beginPath();
  ctx.ellipse(0, 1, 23 * s, 7 * s, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#796e50";
  ctx.lineWidth = 3 * s;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-2 * s, -34 * s);
  ctx.stroke();
  ctx.save();
  ctx.translate(-2 * s, -34 * s);
  ctx.rotate(-0.08);
  ctx.fillStyle = "#7d704f";
  roundRect(ctx, -23 * s, -11 * s, 44 * s, 17 * s, 3 * s);
  ctx.fill();
  ctx.strokeStyle = "rgba(236,223,183,.55)";
  ctx.lineWidth = 0.8 * s;
  ctx.stroke();
  ctx.fillStyle = "rgba(241,228,191,.84)";
  ctx.font = `600 ${5.2 * s}px Fredoka, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("HOLLOW", 0, -2.2 * s);
  ctx.restore();
  ctx.fillStyle = "#6e8c5a";
  for (let i = 0; i < 3; i++) {
    leafPath(ctx, -4 * s + i * 4 * s, -17 * s, 4 * s, 6 * s, i * 0.4);
    ctx.fill();
  }
  ctx.restore();
}

export function renderIsland(ctx, view) {
  const scale = view.scale;
  const corners = viewCorners(view);
  const w = view.w;
  const h = view.h;
  const depth = Math.max(28, 74 * scale);
  const rnd = seeded(812367);
  const { T, R, B, L } = corners;

  // misty shadow beneath the floating sanctuary
  const shadowY = B.y + depth + 39 * scale;
  ctx.save();
  ctx.globalAlpha = 0.55;
  const bellyShadow = ctx.createRadialGradient(view.cx, shadowY, 5, view.cx, shadowY, (R.x - L.x) * 0.48);
  bellyShadow.addColorStop(0, "rgba(70,83,62,.25)");
  bellyShadow.addColorStop(0.52, "rgba(70,83,62,.12)");
  bellyShadow.addColorStop(1, "rgba(70,83,62,0)");
  ctx.fillStyle = bellyShadow;
  ctx.beginPath();
  ctx.ellipse(view.cx, shadowY, (R.x - L.x) * 0.47, 26 * scale, 0, 0, TAU);
  ctx.fill();
  ctx.restore();

  // underside rock mass
  ctx.save();
  const sideGrad = ctx.createLinearGradient(0, B.y - 20 * scale, 0, B.y + depth + 36 * scale);
  sideGrad.addColorStop(0, "#847053");
  sideGrad.addColorStop(0.42, "#776348");
  sideGrad.addColorStop(1, "#5b4c3a");
  ctx.fillStyle = sideGrad;
  ctx.beginPath();
  ctx.moveTo(L.x, L.y);
  ctx.lineTo(B.x, B.y);
  ctx.lineTo(R.x, R.y);
  ctx.lineTo(R.x - 4 * scale, R.y + depth);
  ctx.quadraticCurveTo(B.x + (R.x - B.x) * 0.48, B.y + depth + 27 * scale, B.x, B.y + depth + 36 * scale);
  ctx.quadraticCurveTo(B.x - (B.x - L.x) * 0.52, B.y + depth + 20 * scale, L.x + 3 * scale, L.y + depth);
  ctx.closePath();
  ctx.fill();

  // earthen strata
  ctx.save();
  ctx.clip();
  for (let i = 0; i < 9; i++) {
    ctx.globalAlpha = 0.08 + rnd() * 0.08;
    ctx.strokeStyle = i % 2 ? "#c3ab7c" : "#483d30";
    ctx.lineWidth = (0.7 + rnd() * 1.8) * scale;
    const yy = B.y - 2 + i * depth * 0.12;
    ctx.beginPath();
    ctx.moveTo(L.x + 12 * scale, yy + rnd() * 20 * scale);
    ctx.bezierCurveTo(view.cx - w * 0.16, yy + 7 * scale, view.cx + w * 0.15, yy - 8 * scale, R.x - 10 * scale, yy + rnd() * 16 * scale);
    ctx.stroke();
  }
  // embedded stones
  for (let i = 0; i < 16; i++) {
    const px = L.x + rnd() * (R.x - L.x);
    const py = B.y + 4 * scale + rnd() * depth * 1.05;
    ctx.globalAlpha = 0.18 + rnd() * 0.25;
    ctx.fillStyle = rnd() > 0.5 ? "#b7a788" : "#4d4438";
    ctx.beginPath();
    ctx.ellipse(px, py, (2 + rnd() * 5) * scale, (1.5 + rnd() * 3) * scale, rnd(), 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // a tiny burrow tucked into the cliff face
  const caveX = B.x - 10 * scale;
  const caveY = B.y + depth * 0.68;
  ctx.save();
  const caveGlow = ctx.createRadialGradient(caveX, caveY + 3 * scale, 1, caveX, caveY + 3 * scale, 26 * scale);
  caveGlow.addColorStop(0, "rgba(238,187,105,.28)");
  caveGlow.addColorStop(1, "rgba(238,187,105,0)");
  ctx.fillStyle = caveGlow;
  ctx.beginPath();
  ctx.arc(caveX, caveY + 3 * scale, 26 * scale, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#4a3d2f";
  ctx.beginPath();
  ctx.moveTo(caveX - 20 * scale, caveY + 13 * scale);
  ctx.quadraticCurveTo(caveX - 20 * scale, caveY - 9 * scale, caveX, caveY - 11 * scale);
  ctx.quadraticCurveTo(caveX + 20 * scale, caveY - 9 * scale, caveX + 20 * scale, caveY + 13 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(243,205,124,.35)";
  ctx.beginPath();
  ctx.ellipse(caveX, caveY + 9 * scale, 12 * scale, 4 * scale, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "rgba(229,194,120,.55)";
  ctx.lineWidth = Math.max(0.7, 1.2 * scale);
  ctx.beginPath();
  ctx.moveTo(caveX - 5 * scale, caveY + 9 * scale);
  ctx.quadraticCurveTo(caveX - 8 * scale, caveY + 1 * scale, caveX - 5 * scale, caveY - 4 * scale);
  ctx.moveTo(caveX + 5 * scale, caveY + 9 * scale);
  ctx.quadraticCurveTo(caveX + 8 * scale, caveY + 2 * scale, caveX + 5 * scale, caveY - 3 * scale);
  ctx.stroke();
  ctx.fillStyle = "#d9a77d";
  ctx.beginPath();
  ctx.ellipse(caveX - 4 * scale, caveY + 10 * scale, 3.4 * scale, 1.8 * scale, 0, Math.PI, TAU);
  ctx.ellipse(caveX + 5 * scale, caveY + 10 * scale, 2.6 * scale, 1.4 * scale, 0, Math.PI, TAU);
  ctx.fill();
  ctx.restore();

  // roots spilling over the rim
  ctx.strokeStyle = "rgba(73,65,48,.7)";
  for (let i = 0; i < 9; i++) {
    const t = 0.1 + rnd() * 0.8;
    const sx = L.x + (R.x - L.x) * t;
    const sy = L.y + (R.x - L.x) * 0.5;
    const edgeY = B.y + (Math.abs(t - 0.5) * 2) * (depth * 0.55);
    ctx.lineWidth = (0.8 + rnd() * 1.5) * scale;
    ctx.beginPath();
    ctx.moveTo(sx, edgeY - 10 * scale);
    ctx.bezierCurveTo(sx + 2 * scale, edgeY + 12 * scale, sx - 7 * scale, edgeY + 20 * scale, sx + (rnd() - 0.5) * 8 * scale, edgeY + (24 + rnd() * 28) * scale);
    ctx.stroke();
  }
  // hanging vines
  for (let i = 0; i < 7; i++) {
    const t = 0.12 + rnd() * 0.76;
    const sx = L.x + (R.x - L.x) * t;
    const sy = B.y + (Math.abs(t - 0.5) * 2) * depth * 0.55;
    ctx.strokeStyle = "rgba(100,125,79,.55)";
    ctx.lineWidth = Math.max(0.7, 1.1 * scale);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(sx + 5 * scale, sy + 16 * scale, sx - 8 * scale, sy + 24 * scale, sx + 1 * scale, sy + (35 + rnd() * 30) * scale);
    ctx.stroke();
    for (let k = 0; k < 3; k++) {
      ctx.fillStyle = "rgba(112,143,84,.55)";
      leafPath(ctx, sx + (k % 2 ? 5 : -4) * scale, sy + (13 + k * 9) * scale, 4 * scale, 6 * scale, k % 2 ? 0.7 : -0.5);
      ctx.fill();
    }
  }
  ctx.restore();

  // top face
  const topPath = new Path2D();
  topPath.moveTo(T.x, T.y);
  topPath.lineTo(R.x, R.y);
  topPath.lineTo(B.x, B.y);
  topPath.lineTo(L.x, L.y);
  topPath.closePath();

  ctx.save();
  ctx.clip(topPath);
  const base = ctx.createLinearGradient(T.x, T.y, B.x, B.y);
  base.addColorStop(0, "#97b07a");
  base.addColorStop(0.5, "#8aa66d");
  base.addColorStop(1, "#829e68");
  ctx.fillStyle = base;
  ctx.fillRect(L.x, T.y - 2, R.x - L.x, B.y - T.y + 4);

  // patchwork of meadow colours
  const meadow = ["#93ad75", "#8aa66d", "#91aa71", "#87a26a", "#97af79"];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const d = tileDiamond(view, c, r, 0);
      ctx.fillStyle = meadow[(c * 3 + r * 5 + Math.floor(rnd() * 2)) % meadow.length];
      ctx.globalAlpha = 0.22 + rnd() * 0.16;
      ctx.beginPath();
      ctx.moveTo(d.top.x, d.top.y);
      ctx.lineTo(d.right.x, d.right.y);
      ctx.lineTo(d.bottom.x, d.bottom.y);
      ctx.lineTo(d.left.x, d.left.y);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  // broad sunlit and mossy areas
  const sunPatch = ctx.createRadialGradient(view.cx - 120 * scale, view.cy - 40 * scale, 10, view.cx - 70 * scale, view.cy - 10 * scale, 330 * scale);
  sunPatch.addColorStop(0, "rgba(209,216,155,.28)");
  sunPatch.addColorStop(1, "rgba(209,216,155,0)");
  ctx.fillStyle = sunPatch;
  ctx.fillRect(L.x, T.y, R.x - L.x, B.y - T.y);

  // organic dark moss pools
  for (let i = 0; i < 8; i++) {
    const p = iso(view, rnd() * (COLS - 1), rnd() * (ROWS - 1));
    const rx = (28 + rnd() * 62) * scale;
    const ry = rx * 0.42;
    ctx.globalAlpha = 0.08 + rnd() * 0.08;
    ctx.fillStyle = i % 3 === 0 ? "#536f4f" : "#6f8d5b";
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, rx, ry, rnd(), 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // faint builder grid
  ctx.strokeStyle = "rgba(60,81,51,.055)";
  ctx.lineWidth = 1;
  for (let r = 0; r <= ROWS; r++) {
    const a = iso(view, -0.5, r - 0.5);
    const b = iso(view, COLS - 0.5, r - 0.5);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  for (let c = 0; c <= COLS; c++) {
    const a = iso(view, c - 0.5, -0.5);
    const b = iso(view, c - 0.5, ROWS - 0.5);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  // old cracked slab find
  drawCrackedSlab(ctx, view, 1.15, 1.2, rnd);
  drawCrackedSlab(ctx, view, 5.85, 4.65, rnd);

  // stepping stones to the fire
  const pathTiles = [[4.15, 5.25], [3.8, 4.8], [3.4, 4.35], [4.1, 4.05], [4.55, 3.55]];
  for (let i = 0; i < pathTiles.length; i++) {
    const p = iso(view, pathTiles[i][0], pathTiles[i][1]);
    ctx.fillStyle = i % 2 ? "rgba(177,166,137,.6)" : "rgba(162,154,126,.62)";
    ctx.beginPath();
    ctx.ellipse(p.x + (rnd() - 0.5) * 8 * scale, p.y + (rnd() - 0.5) * 4 * scale, (12 + rnd() * 6) * scale, (5 + rnd() * 3) * scale, rnd() * 0.6, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(102,100,78,.16)";
    ctx.lineWidth = 0.7 * scale;
    ctx.stroke();
  }

  // little clover, flowers and mushrooms scattered through the meadow
  const flowerColors = ["#f4e6c8", "#efb4a3", "#e9d18a", "#cbb7d8"];
  for (let i = 0; i < 26; i++) {
    const c = rnd() * (COLS - 0.2) - 0.4;
    const r = rnd() * (ROWS - 0.2) - 0.4;
    const p = iso(view, c, r);
    const kind = rnd();
    if (kind < 0.42) grassTuft(ctx, p.x, p.y, scale, rnd);
    else if (kind < 0.72) flower(ctx, p.x, p.y, scale, rnd, flowerColors[Math.floor(rnd() * flowerColors.length)]);
    else if (kind < 0.86) pebble(ctx, p.x, p.y, scale, rnd);
    else mushroom(ctx, p.x, p.y, scale * 0.9, rnd);
  }

  // lush edge fringe
  ctx.strokeStyle = "rgba(105,135,80,.52)";
  ctx.lineWidth = Math.max(1, 1.4 * scale);
  const edges = [
    [L, B], [B, R], [R, T], [T, L]
  ];
  for (let i = 0; i < 4; i++) {
    const [a, b] = edges[i];
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    const count = i < 2 ? 18 : 10;
    for (let k = 0; k < count; k++) {
      const t = (k + rnd() * 0.8) / count;
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      grassTuft(ctx, x, y + (i < 2 ? 1 : 0), scale * 0.8, rnd, i === 0 ? "#66864f" : "#7e9a62");
    }
  }

  // stones around the edge
  for (let i = 0; i < 20; i++) {
    const t = rnd();
    const edge = i % 4;
    let x;
    let y;
    if (edge === 0) { x = L.x + (B.x - L.x) * t; y = L.y + (B.y - L.y) * t; }
    else if (edge === 1) { x = B.x + (R.x - B.x) * t; y = B.y + (R.y - B.y) * t; }
    else if (edge === 2) { x = L.x + (T.x - L.x) * t; y = L.y + (T.y - L.y) * t; }
    else { x = T.x + (R.x - T.x) * t; y = T.y + (R.y - T.y) * t; }
    ctx.fillStyle = rnd() > 0.5 ? "rgba(130,128,103,.52)" : "rgba(108,119,86,.48)";
    ctx.beginPath();
    ctx.ellipse(x + (rnd() - 0.5) * 8 * scale, y + (rnd() - 0.5) * 4 * scale, (3.5 + rnd() * 5) * scale, (2 + rnd() * 3) * scale, rnd(), 0, TAU);
    ctx.fill();
  }

  // back edge lichen
  ctx.strokeStyle = "rgba(108,88,61,.7)";
  ctx.lineWidth = Math.max(1.5, 3.2 * scale);
  ctx.beginPath();
  ctx.moveTo(L.x, L.y + 1 * scale);
  ctx.lineTo(B.x, B.y + 1 * scale);
  ctx.lineTo(R.x, R.y + 1 * scale);
  ctx.stroke();

  ctx.restore();

  // rim highlight
  ctx.save();
  ctx.strokeStyle = "rgba(201,211,160,.45)";
  ctx.lineWidth = Math.max(1, 1.1 * scale);
  ctx.beginPath();
  ctx.moveTo(L.x, L.y);
  ctx.lineTo(T.x, T.y);
  ctx.lineTo(R.x, R.y);
  ctx.stroke();
  ctx.restore();

  // a crooked welcome sign at the left edge
  const signP = iso(view, -0.25, 3.9);
  drawSign(ctx, view, signP.x, signP.y, Math.max(0.65, scale));

  // two foreground clumps of fern soften the bottom corners
  ctx.save();
  const f1 = iso(view, 7.15, 5.7);
  fern(ctx, f1.x, f1.y, scale * 1.5, seeded(33), "#678455");
  const f2 = iso(view, 0.15, 5.4);
  fern(ctx, f2.x, f2.y, scale * 1.3, seeded(34), "#718e5e");
  ctx.restore();

  // fireflies waiting in the grass
  ctx.save();
  for (let i = 0; i < 7; i++) {
    const p = iso(view, 0.2 + rnd() * (COLS - 0.5), 0.2 + rnd() * (ROWS - 0.5));
    drawSparkle(ctx, p.x, p.y - 4 * scale, (1.5 + rnd() * 1.8) * scale, "#f7df99", 0.35 + rnd() * 0.3);
  }
  ctx.restore();
}
