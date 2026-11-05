import { seeded, TAU, leafPath, roundRect } from "./art-core.js";

function cloud(ctx, x, y, s, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const g = ctx.createRadialGradient(x, y, 2, x, y, 80 * s);
  g.addColorStop(0, "rgba(255,250,232,.9)");
  g.addColorStop(0.45, "rgba(250,244,222,.55)");
  g.addColorStop(1, "rgba(250,244,222,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y, 100 * s, 29 * s, 0, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = alpha * 0.65;
  ctx.fillStyle = "rgba(255,252,238,.7)";
  ctx.beginPath();
  ctx.ellipse(x - 30 * s, y - 9 * s, 36 * s, 19 * s, -0.08, 0, TAU);
  ctx.ellipse(x + 14 * s, y - 15 * s, 44 * s, 24 * s, 0.06, 0, TAU);
  ctx.ellipse(x + 56 * s, y - 4 * s, 28 * s, 15 * s, 0.12, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function ruin(ctx, x, ground, w, h, color, rnd, alpha = 0.58) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  const notch = h * (0.18 + rnd() * 0.3);
  ctx.moveTo(x, ground);
  ctx.lineTo(x, ground - h + notch * 0.2);
  ctx.lineTo(x + w * 0.12, ground - h + notch * 0.05);
  ctx.lineTo(x + w * 0.26, ground - h + notch * (0.3 + rnd() * 0.5));
  ctx.lineTo(x + w * 0.42, ground - h + notch * 0.12);
  ctx.lineTo(x + w * 0.58, ground - h + notch * (0.5 + rnd() * 0.45));
  ctx.lineTo(x + w * 0.72, ground - h + notch * (0.15 + rnd() * 0.3));
  ctx.lineTo(x + w, ground - h + notch * 0.4);
  ctx.lineTo(x + w, ground);
  ctx.closePath();
  ctx.fill();

  // dark hollow windows
  ctx.globalAlpha = alpha * 0.35;
  ctx.fillStyle = "#4f6959";
  const cols = Math.max(1, Math.floor(w / 20));
  const rows = Math.max(1, Math.floor(h / 26));
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      if (rnd() < 0.25) continue;
      ctx.fillRect(x + 8 + c * (w - 14) / cols, ground - h + 18 + r * (h - 25) / rows, Math.max(3, w / cols * 0.32), Math.max(5, h / rows * 0.23));
    }
  }

  // vines draped over the top
  ctx.globalAlpha = alpha * 0.72;
  ctx.strokeStyle = "#6f8d70";
  ctx.lineWidth = Math.max(1, w * 0.018);
  for (let i = 0; i < 3; i++) {
    const vx = x + w * (0.2 + rnd() * 0.7);
    const vy = ground - h + 10 + rnd() * 30;
    ctx.beginPath();
    ctx.moveTo(vx, vy);
    ctx.bezierCurveTo(vx + 5, vy + h * 0.2, vx - 9, vy + h * 0.35, vx + 2, vy + h * (0.4 + rnd() * 0.3));
    ctx.stroke();
    for (let k = 0; k < 3; k++) {
      const ly = vy + h * (0.14 + k * 0.13);
      ctx.fillStyle = "#7f9b76";
      leafPath(ctx, vx + (k % 2 ? 6 : -5), ly, 8, 11, k % 2 ? -0.5 : 0.5);
      ctx.fill();
    }
  }

  // mossy crown
  ctx.fillStyle = "#7f9b75";
  ctx.globalAlpha = alpha * 0.8;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(x + w * (0.15 + rnd() * 0.72), ground - h + 3 + rnd() * 7, 8 + rnd() * 12, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function tinyFloatingIsle(ctx, x, y, s, rnd) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.globalAlpha = 0.75;
  // shadow / mist
  const mist = ctx.createRadialGradient(0, 26, 2, 0, 26, 83);
  mist.addColorStop(0, "rgba(244,239,215,.55)");
  mist.addColorStop(1, "rgba(244,239,215,0)");
  ctx.fillStyle = mist;
  ctx.beginPath();
  ctx.ellipse(0, 28, 90, 28, 0, 0, TAU);
  ctx.fill();
  // side
  ctx.fillStyle = "#7b6b50";
  ctx.beginPath();
  ctx.moveTo(-44, 5);
  ctx.quadraticCurveTo(-23, 47, 0, 58);
  ctx.quadraticCurveTo(23, 46, 44, 5);
  ctx.closePath();
  ctx.fill();
  // top
  ctx.fillStyle = "#8da872";
  ctx.beginPath();
  ctx.ellipse(0, 2, 48, 18, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#a8bd87";
  ctx.beginPath();
  ctx.ellipse(-7, -2, 35, 12, -0.04, 0, TAU);
  ctx.fill();
  // tiny dead tree
  ctx.strokeStyle = "#6c7a57";
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  ctx.moveTo(11, 1);
  ctx.quadraticCurveTo(8, -26, 19, -39);
  ctx.moveTo(12, -18);
  ctx.lineTo(2, -29);
  ctx.moveTo(14, -25);
  ctx.lineTo(25, -32);
  ctx.stroke();
  ctx.fillStyle = "#91a97a";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(14 + (rnd() - 0.5) * 30, -33 + (rnd() - 0.5) * 17, 4 + rnd() * 7, 0, TAU);
    ctx.fill();
  }
  // dangling roots
  ctx.strokeStyle = "rgba(97,101,71,.5)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const rx = -17 + i * 15;
    ctx.beginPath();
    ctx.moveTo(rx, 22);
    ctx.quadraticCurveTo(rx + 4, 37, rx - 3, 51 + rnd() * 10);
    ctx.stroke();
  }
  ctx.restore();
}

export function renderBackground(ctx, w, h) {
  const rnd = seeded(92941);
  const horizon = h * 0.435;
  const sunX = w * 0.77;
  const sunY = h * 0.15;

  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#a9c5b4");
  sky.addColorStop(0.28, "#c1d3bc");
  sky.addColorStop(0.56, "#e0dfbc");
  sky.addColorStop(0.78, "#f1dfb6");
  sky.addColorStop(1, "#ead5ad");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // sun glow
  const sun = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, Math.max(w, h) * 0.35);
  sun.addColorStop(0, "rgba(255,247,206,.98)");
  sun.addColorStop(0.09, "rgba(255,243,192,.9)");
  sun.addColorStop(0.28, "rgba(255,238,185,.34)");
  sun.addColorStop(0.62, "rgba(255,237,188,.08)");
  sun.addColorStop(1, "rgba(255,237,188,0)");
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = "#fff4c9";
  ctx.beginPath();
  ctx.arc(sunX, sunY, Math.min(w, h) * 0.047, 0, TAU);
  ctx.fill();
  ctx.restore();

  // warm beams
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.16;
  const beam = ctx.createLinearGradient(sunX, sunY, sunX - w * 0.4, h * 0.75);
  beam.addColorStop(0, "rgba(255,241,186,.85)");
  beam.addColorStop(1, "rgba(255,241,186,0)");
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(sunX - w * 0.03, sunY);
  ctx.lineTo(sunX + w * 0.06, sunY + 24);
  ctx.lineTo(sunX - w * 0.3, h * 0.84);
  ctx.lineTo(sunX - w * 0.52, h * 0.84);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(sunX + w * 0.02, sunY + 10);
  ctx.lineTo(sunX + w * 0.09, sunY + 30);
  ctx.lineTo(sunX - w * 0.05, h * 0.8);
  ctx.lineTo(sunX - w * 0.19, h * 0.8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // clouds
  cloud(ctx, w * 0.16, h * 0.13, Math.min(1.2, w / 1100), 0.4);
  cloud(ctx, w * 0.6, h * 0.08, Math.min(0.85, w / 1500), 0.32);
  cloud(ctx, w * 0.92, h * 0.23, Math.min(0.72, w / 1700), 0.27);
  cloud(ctx, w * 0.38, h * 0.24, Math.min(0.6, w / 1900), 0.2);

  // far hills
  ctx.fillStyle = "#bccbb4";
  ctx.beginPath();
  ctx.moveTo(0, horizon - 10);
  ctx.bezierCurveTo(w * 0.13, horizon - 55, w * 0.24, horizon + 4, w * 0.4, horizon - 22);
  ctx.bezierCurveTo(w * 0.57, horizon - 56, w * 0.73, horizon + 9, w * 0.87, horizon - 16);
  ctx.bezierCurveTo(w * 0.94, horizon - 26, w * 0.98, horizon - 12, w, horizon - 18);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // ruins skyline
  ctx.save();
  const cityBase = horizon + 24;
  ruin(ctx, w * 0.035, cityBase, w * 0.075, h * 0.18, "#8fa78f", rnd, 0.37);
  ruin(ctx, w * 0.135, cityBase + 4, w * 0.055, h * 0.11, "#91a78e", rnd, 0.35);
  ruin(ctx, w * 0.24, cityBase, w * 0.08, h * 0.25, "#8fa68b", rnd, 0.42);
  ruin(ctx, w * 0.39, cityBase + 6, w * 0.06, h * 0.13, "#91a78d", rnd, 0.36);
  ruin(ctx, w * 0.57, cityBase + 2, w * 0.11, h * 0.2, "#8da58a", rnd, 0.37);
  ruin(ctx, w * 0.73, cityBase - 5, w * 0.07, h * 0.31, "#8ba289", rnd, 0.41);
  ruin(ctx, w * 0.88, cityBase + 6, w * 0.08, h * 0.17, "#90a78e", rnd, 0.34);
  ctx.restore();

  // old billboard, reclaimed by moss
  ctx.save();
  ctx.translate(w * 0.205, horizon - h * 0.08);
  ctx.rotate(-0.035);
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = "#788d75";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-21, 6);
  ctx.lineTo(-15, h * 0.09);
  ctx.moveTo(22, 6);
  ctx.lineTo(24, h * 0.09);
  ctx.stroke();
  ctx.fillStyle = "#8ba188";
  roundRect(ctx, -48, -30, 96, 40, 4);
  ctx.fill();
  ctx.fillStyle = "rgba(241,238,211,.55)";
  ctx.font = "italic 13px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("breathe", 0, -6);
  ctx.fillStyle = "#7e9a79";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(-37 + i * 18, -29 + rnd() * 5, 5 + rnd() * 7, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // distant overgrown trees
  ctx.save();
  ctx.globalAlpha = 0.55;
  const treeSpots = [0.08, 0.31, 0.5, 0.67, 0.84, 0.96];
  for (const spot of treeSpots) {
    const tx = w * spot + (rnd() - 0.5) * 20;
    const ty = horizon + 4 + rnd() * 14;
    ctx.strokeStyle = "#789070";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(tx - 3, ty - 23, tx + 5, ty - 45 - rnd() * 18);
    ctx.stroke();
    ctx.fillStyle = "#8ba481";
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(tx + (rnd() - 0.5) * 36, ty - 38 - rnd() * 27, 10 + rnd() * 15, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();

  // near hills
  const hillGrad = ctx.createLinearGradient(0, horizon + 50, 0, h);
  hillGrad.addColorStop(0, "#a8b98f");
  hillGrad.addColorStop(1, "#d3d2a8");
  ctx.fillStyle = hillGrad;
  ctx.beginPath();
  ctx.moveTo(0, horizon + 56);
  ctx.bezierCurveTo(w * 0.17, horizon + 13, w * 0.32, horizon + 94, w * 0.48, horizon + 45);
  ctx.bezierCurveTo(w * 0.65, horizon - 7, w * 0.82, horizon + 91, w, horizon + 45);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // mist band
  const mist = ctx.createLinearGradient(0, h * 0.52, 0, h * 0.8);
  mist.addColorStop(0, "rgba(247,239,212,0)");
  mist.addColorStop(0.45, "rgba(247,239,212,.3)");
  mist.addColorStop(1, "rgba(247,239,212,0)");
  ctx.fillStyle = mist;
  ctx.fillRect(0, h * 0.5, w, h * 0.32);

  // tiny floating isles
  tinyFloatingIsle(ctx, w * 0.085, h * 0.61, Math.min(0.78, w / 1400), rnd);
  tinyFloatingIsle(ctx, w * 0.935, h * 0.66, Math.min(0.56, w / 1800), rnd);

  // enormous soft framing foliage, upper corners
  ctx.save();
  ctx.filter = "blur(8px)";
  ctx.globalAlpha = 0.25;
  const leafy = ["#6f8b67", "#76926e", "#5f7c5d"];
  for (let i = 0; i < 17; i++) {
    ctx.fillStyle = leafy[i % 3];
    ctx.beginPath();
    ctx.arc(-30 + rnd() * 200, -40 + rnd() * 190, 22 + rnd() * 58, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w + 30 - rnd() * 190, -50 + rnd() * 180, 25 + rnd() * 55, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // fine framing branches at the very top
  ctx.save();
  ctx.globalAlpha = 0.38;
  ctx.strokeStyle = "#687e5d";
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(-10, 12);
  ctx.bezierCurveTo(w * 0.11, 28, w * 0.15, 60, w * 0.23, 84);
  ctx.stroke();
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(w * 0.085, 23);
  ctx.quadraticCurveTo(w * 0.1, 57, w * 0.13, 79);
  ctx.stroke();
  ctx.restore();

  // dew-warm vignette
  const vign = ctx.createRadialGradient(w * 0.5, h * 0.52, Math.min(w, h) * 0.2, w * 0.5, h * 0.52, Math.max(w, h) * 0.78);
  vign.addColorStop(0, "rgba(52,68,41,0)");
  vign.addColorStop(1, "rgba(52,68,41,.11)");
  ctx.fillStyle = vign;
  ctx.fillRect(0, 0, w, h);
}

export function drawBirds(ctx, w, h, t) {
  ctx.save();
  ctx.strokeStyle = "rgba(83,101,79,.42)";
  ctx.lineWidth = 1.3;
  ctx.lineCap = "round";
  const birds = [
    { x: 0.23, y: 0.22, s: 1.1, sp: 3.2, ph: 0.4 },
    { x: 0.55, y: 0.15, s: 0.7, sp: 2.4, ph: 2.0 },
    { x: 0.84, y: 0.29, s: 0.85, sp: 3.8, ph: 4.1 }
  ];
  for (let i = 0; i < birds.length; i++) {
    const b = birds[i];
    const drift = ((t * b.sp + i * 60) % (w + 220)) - 110;
    const x = (b.x * w + drift * 0.16) % (w + 80) - 20;
    const flap = Math.sin(t * 5 + b.ph) * 2.2;
    ctx.globalAlpha = 0.34 + 0.16 * Math.sin(t * 0.5 + i);
    ctx.beginPath();
    ctx.moveTo(x - 6 * b.s, b.y * h + flap);
    ctx.quadraticCurveTo(x - 3 * b.s, b.y * h - 2 * b.s, x, b.y * h);
    ctx.quadraticCurveTo(x + 3 * b.s, b.y * h - 2 * b.s, x + 6 * b.s, b.y * h + flap);
    ctx.stroke();
  }
  ctx.restore();
}
