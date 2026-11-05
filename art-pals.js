import { TAU, softShadow, leafPath, drawSparkle, drawHeart } from "./art-core.js";
import { PAL_SPECIES } from "./data.js";

function shadow(ctx, rx, ry) {
  softShadow(ctx, 0, 2, rx, ry, 0.19);
}

function expressionFor(p) {
  if (!p) return "happy";
  if (p.sleeping || p.energy < 16) return "sleepy";
  if (p.hunger < 30) return "hungry";
  if (p.joy < 30) return "sad";
  if (p.petting > 0) return "bliss";
  if (p.joy > 73) return "happy";
  return "neutral";
}

function isBlinking(p, t) {
  if (!p) return false;
  const cycle = 4.1 + (p.seed || 0) * 0.7;
  const bt = (t + (p.seed || 0) * 2.6) % cycle;
  return bt < 0.135 || (bt > 0.31 && bt < 0.39);
}

function eye(ctx, x, y, rx, ry, p, t, opts = {}) {
  const exp = opts.exp || expressionFor(p);
  const blink = isBlinking(p, t);
  ctx.save();
  ctx.strokeStyle = "#45503f";
  ctx.fillStyle = "#45503f";
  ctx.lineCap = "round";
  if (blink || opts.closed) {
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(x, y - 1, rx * 0.95, 0.18, Math.PI - 0.18);
    ctx.stroke();
  } else if (exp === "bliss") {
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y + 1, rx * 1.05, Math.PI + 0.32, TAU - 0.32);
    ctx.stroke();
  } else if (exp === "sleepy") {
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.arc(x, y, rx * 1.1, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y + 1.8, rx * 0.92, 0.08, Math.PI - 0.08);
    ctx.stroke();
  } else {
    const squash = exp === "sad" ? 0.84 : 1;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry * squash, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(255,252,235,.96)";
    ctx.beginPath();
    ctx.arc(x - rx * 0.3, y - ry * 0.34, rx * 0.31, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.6)";
    ctx.beginPath();
    ctx.arc(x + rx * 0.29, y + ry * 0.27, rx * 0.14, 0, TAU);
    ctx.fill();
    if (exp === "sad") {
      ctx.strokeStyle = "rgba(69,80,63,.55)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(x - rx * 1.15, y - ry * 1.34);
      ctx.quadraticCurveTo(x, y - ry * 1.65, x + rx * 1.15, y - ry * 1.28);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function blush(ctx, x, y, rx, alpha = 0.5, color = "#e89a91") {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, rx * 0.55, 0.1, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function mouth(ctx, x, y, type, scale = 1) {
  ctx.save();
  ctx.strokeStyle = "#4b5544";
  ctx.fillStyle = "#5a4f47";
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  if (type === "sleepy") {
    ctx.beginPath();
    ctx.arc(x, y, 3 * scale, 0.15, Math.PI - 0.2);
    ctx.stroke();
  } else if (type === "hungry") {
    ctx.beginPath();
    ctx.ellipse(x, y + 1, 2.1 * scale, 2.7 * scale, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#d88d86";
    ctx.beginPath();
    ctx.ellipse(x, y + 2, 1.2 * scale, 1.3 * scale, 0, 0, TAU);
    ctx.fill();
  } else if (type === "sad") {
    ctx.beginPath();
    ctx.arc(x, y + 3.2, 3 * scale, Math.PI + 0.35, TAU - 0.35);
    ctx.stroke();
  } else if (type === "happy" || type === "bliss") {
    ctx.beginPath();
    ctx.arc(x, y - 0.5, 3.5 * scale, 0.18, Math.PI - 0.18);
    ctx.stroke();
    if (type === "bliss") {
      ctx.fillStyle = "#e49a91";
      ctx.beginPath();
      ctx.ellipse(x, y + 2.3, 1.6 * scale, 1.1 * scale, 0, 0, TAU);
      ctx.fill();
    }
  } else {
    ctx.beginPath();
    ctx.arc(x, y, 2.5 * scale, 0.28, Math.PI - 0.28);
    ctx.stroke();
  }
  ctx.restore();
}

function feet(ctx, y = -3, spread = 14, color = "rgba(95,79,62,.25)") {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(-spread, y, 8, 3.4, -0.08, 0, TAU);
  ctx.ellipse(spread, y, 8, 3.4, 0.08, 0, TAU);
  ctx.fill();
}

/* ------------------------------------------------------------------ */
/* Mallow — moss bun                                                   */
/* ------------------------------------------------------------------ */
function drawMallow(ctx, t, p, opts) {
  const seed = p?.seed || 0.5;
  const exp = opts.exp || expressionFor(p);
  const bob = Math.sin(t * 1.75 + seed * 6) * 1.9 + (p?.hop || 0);
  const tilt = Math.sin(t * 0.7 + seed * 5) * 0.025;
  shadow(ctx, 38, 10.5);
  ctx.save();
  ctx.translate(0, bob);
  ctx.rotate(tilt);

  // tail
  ctx.fillStyle = "#ead5b6";
  ctx.beginPath();
  ctx.arc(31, -15, 8.5, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(255,248,229,.5)";
  ctx.beginPath();
  ctx.arc(33, -17.5, 4, 0, TAU);
  ctx.fill();

  // ears
  const earGrad = ctx.createLinearGradient(-35, -110, 0, -60);
  earGrad.addColorStop(0, "#e9d2b2");
  earGrad.addColorStop(1, "#f4e3c7");
  ctx.fillStyle = earGrad;
  ctx.beginPath();
  ctx.moveTo(-19, -58);
  ctx.bezierCurveTo(-38, -73, -43, -107, -28, -113);
  ctx.bezierCurveTo(-15, -118, -8, -89, -13, -61);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(19, -58);
  ctx.bezierCurveTo(40, -76, 44, -106, 29, -110);
  ctx.bezierCurveTo(16, -113, 8, -87, 13, -61);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(225,163,157,.55)";
  ctx.beginPath();
  ctx.moveTo(-19, -66);
  ctx.bezierCurveTo(-30, -79, -32, -101, -25, -104);
  ctx.bezierCurveTo(-18, -107, -14, -84, -15, -67);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(19, -66);
  ctx.bezierCurveTo(31, -80, 33, -100, 26, -103);
  ctx.bezierCurveTo(19, -105, 13, -83, 14, -67);
  ctx.closePath();
  ctx.fill();

  feet(ctx, -3.5, 14, "rgba(112,91,71,.27)");

  // body
  const body = ctx.createLinearGradient(-30, -76, 28, -2);
  body.addColorStop(0, "#f6e6cb");
  body.addColorStop(0.55, "#efdcbe");
  body.addColorStop(1, "#e3cbaa");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(-30, -35);
  ctx.bezierCurveTo(-36, -63, -22, -77, 0, -77);
  ctx.bezierCurveTo(22, -77, 36, -63, 32, -34);
  ctx.bezierCurveTo(30, -11, 17, -3, 0, -3);
  ctx.bezierCurveTo(-17, -3, -32, -12, -30, -35);
  ctx.fill();
  ctx.strokeStyle = "rgba(112,91,68,.13)";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // belly
  ctx.fillStyle = "rgba(255,249,231,.64)";
  ctx.beginPath();
  ctx.ellipse(0, -26, 19, 22, 0, 0, TAU);
  ctx.fill();

  // arms
  ctx.fillStyle = "#ead5b6";
  ctx.beginPath();
  ctx.ellipse(-29, -30, 6.8, 11, 0.55, 0, TAU);
  ctx.ellipse(29, -30, 6.8, 11, -0.55, 0, TAU);
  ctx.fill();

  // face
  eye(ctx, -12.5, -49, 4.7, 6.6, p, t, { exp });
  eye(ctx, 12.5, -49, 4.7, 6.6, p, t, { exp });
  blush(ctx, -22.5, -37, 5.1, 0.55);
  blush(ctx, 22.5, -37, 5.1, 0.55);
  mouth(ctx, 0, -34, exp, 1);

  // sprout
  ctx.strokeStyle = "#698a51";
  ctx.lineWidth = 1.8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, -76);
  ctx.quadraticCurveTo(-2, -86, 1, -91);
  ctx.stroke();
  ctx.fillStyle = "#71955a";
  leafPath(ctx, -4, -89, 8, 12, -0.7);
  ctx.fill();
  ctx.fillStyle = "#87a96b";
  leafPath(ctx, 5, -92, 7.5, 11, 0.8);
  ctx.fill();

  // flower at higher friendship
  if ((p?.level || 1) >= 3) {
    ctx.save();
    ctx.translate(24, -75);
    ctx.fillStyle = "#f6e7c4";
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * 4, Math.sin(a) * 3.4, 3.2, 2.1, a, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = "#e6b65b";
    ctx.beginPath();
    ctx.arc(0, 0, 2.1, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* Taro — cloud pup                                                    */
/* ------------------------------------------------------------------ */
function drawTaro(ctx, t, p, opts) {
  const seed = p?.seed || 0.5;
  const exp = opts.exp || expressionFor(p);
  const bob = Math.sin(t * 1.25 + seed * 5) * 2.6 + (p?.hop || 0);
  shadow(ctx, 40, 10);
  ctx.save();
  ctx.translate(0, bob);

  // wispy little wings
  ctx.fillStyle = "rgba(205,230,219,.75)";
  ctx.beginPath();
  ctx.ellipse(-32, -38, 14, 7, -0.4, 0, TAU);
  ctx.ellipse(32, -38, 14, 7, 0.4, 0, TAU);
  ctx.fill();

  // horns
  ctx.fillStyle = "#afcbbd";
  ctx.beginPath();
  ctx.moveTo(-21, -64);
  ctx.quadraticCurveTo(-27, -77, -18, -78);
  ctx.quadraticCurveTo(-13, -73, -12, -63);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(21, -64);
  ctx.quadraticCurveTo(27, -77, 18, -78);
  ctx.quadraticCurveTo(13, -73, 12, -63);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#e7d8bb";
  ctx.beginPath();
  ctx.arc(-18, -76, 2.4, 0, TAU);
  ctx.arc(18, -76, 2.4, 0, TAU);
  ctx.fill();

  // cloud body (overlapping soft puffs)
  const bodyGrad = ctx.createLinearGradient(0, -72, 0, -2);
  bodyGrad.addColorStop(0, "#dbeade");
  bodyGrad.addColorStop(0.62, "#c5dccf");
  bodyGrad.addColorStop(1, "#aecbbd");
  ctx.fillStyle = bodyGrad;
  const puffs = [
    [-25, -37, 20], [25, -37, 20], [-19, -55, 19], [20, -54, 18],
    [0, -60, 25], [0, -32, 28], [-8, -21, 18], [16, -22, 17]
  ];
  for (const [x, y, r] of puffs) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }
  // soft highlight
  ctx.fillStyle = "rgba(255,255,244,.28)";
  ctx.beginPath();
  ctx.ellipse(-13, -57, 19, 12, -0.4, 0, TAU);
  ctx.fill();

  // little feet
  ctx.fillStyle = "#abc8ba";
  ctx.beginPath();
  ctx.ellipse(-15, -4, 8, 3.5, -0.1, 0, TAU);
  ctx.ellipse(15, -4, 8, 3.5, 0.1, 0, TAU);
  ctx.fill();

  // belly
  ctx.fillStyle = "rgba(238,242,221,.55)";
  ctx.beginPath();
  ctx.ellipse(0, -26, 14, 17, 0, 0, TAU);
  ctx.fill();
  // belly star
  ctx.save();
  ctx.translate(0, -26);
  ctx.globalAlpha = 0.85;
  drawSparkle(ctx, 0, 0, 4.1, "#e7c26c", 1);
  ctx.restore();

  // face
  eye(ctx, -13.5, -45, 4.6, 6.3, p, t, { exp });
  eye(ctx, 13.5, -45, 4.6, 6.3, p, t, { exp });
  blush(ctx, -23, -34, 4.6, 0.4, "#e8a89b");
  blush(ctx, 23, -34, 4.6, 0.4, "#e8a89b");
  mouth(ctx, 0, -32, exp, 0.95);

  // forehead curl
  ctx.strokeStyle = "#92b5a7";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(1, -64);
  ctx.bezierCurveTo(7, -70, 10, -64, 6, -61);
  ctx.stroke();

  // little drifting motes
  for (let i = 0; i < 2; i++) {
    const a = t * 0.8 + i * 3.2 + seed;
    ctx.globalAlpha = 0.25 + 0.15 * Math.sin(a);
    ctx.fillStyle = "#f8efd4";
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 35, -50 + Math.sin(a * 1.3) * 18, 1.5, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* Juniper — petal hog                                                */
/* ------------------------------------------------------------------ */
function drawJuniper(ctx, t, p, opts) {
  const seed = p?.seed || 0.5;
  const exp = opts.exp || expressionFor(p);
  const bob = Math.sin(t * 1.95 + seed * 4) * 1.8 + (p?.hop || 0);
  const tilt = Math.sin(t * 0.9 + seed * 2) * 0.018;
  shadow(ctx, 41, 11);
  ctx.save();
  ctx.translate(0, bob);
  ctx.rotate(tilt);

  // petal spines
  const petalCols = ["#d68d77", "#e3a087", "#c97f70", "#e8ae93"];
  for (let i = 0; i < 11; i++) {
    const a = -Math.PI * 0.93 + (i / 10) * Math.PI * 0.86;
    const len = i === 5 ? 44 : 34 + (i % 3) * 4;
    const x = Math.cos(a) * 22;
    const y = -33 + Math.sin(a) * 24;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a + Math.PI / 2);
    ctx.fillStyle = petalCols[i % petalCols.length];
    ctx.beginPath();
    ctx.ellipse(0, -len * 0.44, 7.5, len * 0.48, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(248,220,188,.28)";
    ctx.beginPath();
    ctx.ellipse(-2, -len * 0.48, 2.8, len * 0.23, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  feet(ctx, -3, 16, "rgba(125,84,61,.3)");

  // body
  const bodyGrad = ctx.createLinearGradient(0, -65, 0, -2);
  bodyGrad.addColorStop(0, "#f2cba3");
  bodyGrad.addColorStop(0.6, "#ecc096");
  bodyGrad.addColorStop(1, "#dca77f");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, -31, 31, 30, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "rgba(120,83,60,.12)";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // tiny satchel
  ctx.strokeStyle = "#97704f";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-23, -49);
  ctx.quadraticCurveTo(-6, -31, 19, -38);
  ctx.stroke();
  ctx.fillStyle = "#a97d58";
  ctx.beginPath();
  ctx.ellipse(23, -31, 7.5, 8.2, -0.2, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#866044";
  ctx.fillRect(20, -33, 6, 1.6);
  ctx.fillStyle = "#e3c477";
  ctx.beginPath();
  ctx.arc(23, -31, 1.4, 0, TAU);
  ctx.fill();

  // arms
  ctx.fillStyle = "#e7b98f";
  ctx.beginPath();
  ctx.ellipse(-29, -24, 6.5, 10, 0.55, 0, TAU);
  ctx.ellipse(28, -23, 6.5, 10, -0.55, 0, TAU);
  ctx.fill();

  // face
  eye(ctx, -13, -47, 4.8, 6.4, p, t, { exp });
  eye(ctx, 13, -47, 4.8, 6.4, p, t, { exp });
  blush(ctx, -23, -35, 5, 0.55, "#dc8e7f");
  blush(ctx, 23, -35, 5, 0.55, "#dc8e7f");
  // muzzle
  ctx.fillStyle = "rgba(250,231,197,.7)";
  ctx.beginPath();
  ctx.ellipse(0, -32, 13, 9, 0, 0, TAU);
  ctx.fill();
  // nose
  ctx.fillStyle = "#8f6453";
  ctx.beginPath();
  ctx.ellipse(0, -36, 2.2, 1.5, 0, 0, TAU);
  ctx.fill();
  mouth(ctx, 0, -34, exp, 0.9);

  // daisy
  ctx.save();
  ctx.translate(-18, -61);
  ctx.fillStyle = "#f7eacb";
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU + 0.3;
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * 5, Math.sin(a) * 4.2, 3.5, 2.1, a, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = "#e1b34f";
  ctx.beginPath();
  ctx.arc(0, 0, 2.1, 0, TAU);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* Bramble — mushroom cat                                             */
/* ------------------------------------------------------------------ */
function drawBramble(ctx, t, p, opts) {
  const seed = p?.seed || 0.5;
  const exp = opts.exp || expressionFor(p);
  const bob = Math.sin(t * 1.6 + seed * 4) * 1.7 + (p?.hop || 0);
  shadow(ctx, 37, 10);
  ctx.save();
  ctx.translate(0, bob);

  // tail
  ctx.strokeStyle = "#b49ec3";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(24, -18);
  ctx.bezierCurveTo(48, -18, 44, -45, 55, -39);
  ctx.stroke();
  ctx.strokeStyle = "rgba(239,217,211,.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(31, -20);
  ctx.quadraticCurveTo(43, -31, 50, -37);
  ctx.stroke();

  // cat ears
  ctx.fillStyle = "#bda5cc";
  ctx.beginPath();
  ctx.moveTo(-25, -56);
  ctx.lineTo(-31, -76);
  ctx.lineTo(-12, -64);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(25, -56);
  ctx.lineTo(31, -76);
  ctx.lineTo(12, -64);
  ctx.closePath();
  ctx.fill();

  // body
  const body = ctx.createLinearGradient(0, -65, 0, -2);
  body.addColorStop(0, "#d7c5df");
  body.addColorStop(1, "#bca6ce");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, -31, 29, 32, 0, 0, TAU);
  ctx.fill();
  feet(ctx, -4, 13, "rgba(91,72,101,.26)");

  // belly
  ctx.fillStyle = "rgba(243,235,226,.5)";
  ctx.beginPath();
  ctx.ellipse(0, -20, 15, 15, 0, 0, TAU);
  ctx.fill();

  // mushroom cap
  const cap = ctx.createLinearGradient(0, -92, 0, -58);
  cap.addColorStop(0, "#b9819e");
  cap.addColorStop(0.65, "#a97190");
  cap.addColorStop(1, "#8f5f7c");
  ctx.fillStyle = cap;
  ctx.beginPath();
  ctx.moveTo(-37, -59);
  ctx.bezierCurveTo(-40, -86, -20, -96, 1, -96);
  ctx.bezierCurveTo(24, -96, 41, -85, 37, -59);
  ctx.quadraticCurveTo(0, -51, -37, -59);
  ctx.fill();
  ctx.fillStyle = "rgba(255,246,226,.85)";
  const spots = [[-21, -80, 4.2], [-5, -87, 3.2], [16, -83, 5], [28, -70, 2.5], [-32, -66, 2.4], [7, -74, 2.1]];
  for (const [x, y, r] of spots) {
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.7, 0.2, 0, TAU);
    ctx.fill();
  }
  // cap underside
  ctx.fillStyle = "#e3cfc2";
  ctx.beginPath();
  ctx.ellipse(0, -59, 34, 6, 0, 0, Math.PI);
  ctx.fill();
  ctx.strokeStyle = "rgba(105,78,91,.2)";
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.moveTo(-27 + i * 9, -58);
    ctx.lineTo(-25 + i * 8.5, -53);
    ctx.stroke();
  }

  // face
  eye(ctx, -12, -40, 4.7, 6.4, p, t, { exp });
  eye(ctx, 12, -40, 4.7, 6.4, p, t, { exp });
  blush(ctx, -21, -29, 4.7, 0.45, "#d8959c");
  blush(ctx, 21, -29, 4.7, 0.45, "#d8959c");
  // little fangs
  ctx.fillStyle = "#fbf2df";
  ctx.beginPath();
  ctx.moveTo(-4, -20);
  ctx.lineTo(-2.2, -17);
  ctx.lineTo(-0.8, -20);
  ctx.closePath();
  ctx.fill();
  mouth(ctx, 0, -26, exp, 0.9);

  // paws hugging a leaf
  ctx.fillStyle = "#cbb7d5";
  ctx.beginPath();
  ctx.ellipse(-16, -5, 7, 4.5, 0.2, 0, TAU);
  ctx.ellipse(16, -5, 7, 4.5, -0.2, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#7d9a64";
  leafPath(ctx, 0, -9, 8, 12, 0.2);
  ctx.fill();
  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* Nimbus — mist drake                                                */
/* ------------------------------------------------------------------ */
function drawNimbus(ctx, t, p, opts) {
  const seed = p?.seed || 0.5;
  const exp = opts.exp || expressionFor(p);
  const bob = Math.sin(t * 1.45 + seed * 4) * 2.3 + (p?.hop || 0);
  shadow(ctx, 39, 10);
  ctx.save();
  ctx.translate(0, bob);

  // wings
  ctx.fillStyle = "rgba(174,211,215,.68)";
  ctx.beginPath();
  ctx.moveTo(-24, -45);
  ctx.bezierCurveTo(-55, -72, -63, -43, -43, -25);
  ctx.bezierCurveTo(-50, -44, -36, -49, -24, -45);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(24, -45);
  ctx.bezierCurveTo(55, -72, 63, -43, 43, -25);
  ctx.bezierCurveTo(50, -44, 36, -49, 24, -45);
  ctx.fill();
  ctx.strokeStyle = "rgba(115,162,168,.35)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-28, -44);
  ctx.lineTo(-50, -43);
  ctx.moveTo(28, -44);
  ctx.lineTo(50, -43);
  ctx.stroke();

  // tail
  ctx.strokeStyle = "#a9cdd0";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(22, -18);
  ctx.bezierCurveTo(42, -12, 47, -28, 38, -35);
  ctx.stroke();
  drawSparkle(ctx, 38, -37, 4, "#e8c569", 0.9);

  // horns
  ctx.fillStyle = "#e7dcbf";
  ctx.beginPath();
  ctx.moveTo(-19, -68);
  ctx.quadraticCurveTo(-31, -79, -16, -82);
  ctx.quadraticCurveTo(-11, -76, -10, -65);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(19, -68);
  ctx.quadraticCurveTo(31, -79, 16, -82);
  ctx.quadraticCurveTo(11, -76, 10, -65);
  ctx.closePath();
  ctx.fill();

  // cloud body
  const body = ctx.createLinearGradient(0, -74, 0, -2);
  body.addColorStop(0, "#d7e9e9");
  body.addColorStop(1, "#a8c9cd");
  ctx.fillStyle = body;
  const puffs = [
    [-22, -42, 20], [22, -42, 20], [0, -60, 27], [0, -29, 29],
    [-12, -67, 15], [13, -65, 16], [-17, -20, 18], [15, -20, 18]
  ];
  for (const [x, y, r] of puffs) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(255,255,246,.25)";
  ctx.beginPath();
  ctx.ellipse(-10, -59, 17, 11, -0.4, 0, TAU);
  ctx.fill();

  // belly
  ctx.fillStyle = "rgba(238,244,228,.55)";
  ctx.beginPath();
  ctx.ellipse(0, -25, 15, 18, 0, 0, TAU);
  ctx.fill();
  drawSparkle(ctx, 0, -26, 4.5, "#e8c365", 0.9);

  // feet
  ctx.fillStyle = "#9fc4c8";
  ctx.beginPath();
  ctx.ellipse(-14, -3, 8, 3.3, -0.1, 0, TAU);
  ctx.ellipse(14, -3, 8, 3.3, 0.1, 0, TAU);
  ctx.fill();

  // face
  eye(ctx, -13, -46, 4.7, 6.5, p, t, { exp });
  eye(ctx, 13, -46, 4.7, 6.5, p, t, { exp });
  blush(ctx, -22, -34, 4.8, 0.42, "#df9c9d");
  blush(ctx, 22, -34, 4.8, 0.42, "#df9c9d");
  mouth(ctx, 0, -32, exp, 0.95);

  // cheek sparkle scales
  ctx.fillStyle = "rgba(246,233,194,.6)";
  ctx.beginPath();
  ctx.arc(-25, -46, 1.2, 0, TAU);
  ctx.arc(25, -46, 1.2, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* Yuzu — dew snail                                                   */
/* ------------------------------------------------------------------ */
function drawYuzu(ctx, t, p, opts) {
  const seed = p?.seed || 0.5;
  const exp = opts.exp || expressionFor(p);
  const bob = Math.sin(t * 1.15 + seed * 4) * 1.4 + (p?.hop || 0);
  shadow(ctx, 47, 11);
  ctx.save();
  ctx.translate(0, bob);

  // foot
  const foot = ctx.createLinearGradient(0, -16, 0, 1);
  foot.addColorStop(0, "#efd594");
  foot.addColorStop(1, "#d6b16f");
  ctx.fillStyle = foot;
  ctx.beginPath();
  ctx.moveTo(-48, -4);
  ctx.quadraticCurveTo(-45, -14, -30, -13);
  ctx.lineTo(30, -13);
  ctx.quadraticCurveTo(44, -12, 45, -5);
  ctx.quadraticCurveTo(42, 2, 28, 2);
  ctx.lineTo(-32, 2);
  ctx.quadraticCurveTo(-48, 3, -48, -4);
  ctx.fill();
  // foot ruffle
  ctx.fillStyle = "#e7c584";
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.ellipse(-37 + i * 10.5, 0.5, 5.5, 2.1, 0, 0, TAU);
    ctx.fill();
  }

  // shell
  const shell = ctx.createRadialGradient(-6, -45, 4, 3, -33, 36);
  shell.addColorStop(0, "#e5bf8c");
  shell.addColorStop(1, "#bc8d65");
  ctx.fillStyle = shell;
  ctx.beginPath();
  ctx.ellipse(7, -38, 32, 34, 0.05, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#a97c5c";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(7, -38, 29, 31, 0.05, 0, TAU);
  ctx.stroke();
  // spiral
  ctx.strokeStyle = "rgba(121,84,60,.62)";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  for (let a = 0; a < TAU * 2.4; a += 0.18) {
    const rr = 2 + a * 2.6;
    const x = 5 + Math.cos(a + 1.2) * rr;
    const y = -40 + Math.sin(a + 1.2) * rr * 0.9;
    if (a === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.strokeStyle = "rgba(251,234,194,.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(1, -47, 13, 10, -0.5, 0.2, 3);
  ctx.stroke();
  // tiny garden on shell
  ctx.strokeStyle = "#6f8c53";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(12, -67);
  ctx.quadraticCurveTo(15, -75, 12, -79);
  ctx.moveTo(3, -63);
  ctx.quadraticCurveTo(1, -71, 5, -74);
  ctx.stroke();
  ctx.fillStyle = "#7e9b5f";
  leafPath(ctx, 11, -76, 5, 7, 0.2);
  ctx.fill();
  leafPath(ctx, 4, -72, 4.5, 6, -0.6);
  ctx.fill();
  ctx.fillStyle = "#e4a282";
  ctx.beginPath();
  ctx.arc(12, -80, 2.2, 0, TAU);
  ctx.fill();

  // neck / head
  const neck = ctx.createLinearGradient(-40, -40, -25, -4);
  neck.addColorStop(0, "#f2d999");
  neck.addColorStop(1, "#e0bb79");
  ctx.fillStyle = neck;
  ctx.beginPath();
  ctx.moveTo(-31, -9);
  ctx.bezierCurveTo(-43, -20, -45, -35, -38, -45);
  ctx.bezierCurveTo(-31, -54, -18, -49, -17, -37);
  ctx.lineTo(-18, -10);
  ctx.closePath();
  ctx.fill();

  // eyestalks
  ctx.strokeStyle = "#e7c585";
  ctx.lineWidth = 2.7;
  ctx.lineCap = "round";
  const sway = Math.sin(t * 1.1 + seed) * 2.5;
  ctx.beginPath();
  ctx.moveTo(-35, -45);
  ctx.quadraticCurveTo(-41 + sway, -56, -43 + sway, -60);
  ctx.moveTo(-27, -46);
  ctx.quadraticCurveTo(-25 - sway, -57, -26 - sway, -62);
  ctx.stroke();
  // eyes at stalk tips
  ctx.fillStyle = "#f5dfaa";
  ctx.beginPath();
  ctx.arc(-43 + sway, -61, 4.8, 0, TAU);
  ctx.arc(-26 - sway, -63, 4.8, 0, TAU);
  ctx.fill();
  // pupils
  eye(ctx, -43 + sway, -61, 2.3, 3.3, p, t, { exp: exp === "sleepy" ? "sleepy" : "neutral" });
  eye(ctx, -26 - sway, -63, 2.3, 3.3, p, t, { exp: exp === "sleepy" ? "sleepy" : "neutral" });

  // face on head
  blush(ctx, -37, -34, 3.8, 0.45, "#dd9c84");
  mouth(ctx, -34, -29, exp === "sleepy" ? "sleepy" : exp, 0.8);

  // dew bead
  ctx.fillStyle = "rgba(148,207,196,.8)";
  ctx.beginPath();
  ctx.ellipse(-45, -19, 1.8, 3, 0.2, 0, TAU);
  ctx.fill();
  ctx.restore();
}

const DRAWERS = {
  mallow: drawMallow,
  taro: drawTaro,
  juniper: drawJuniper,
  bramble: drawBramble,
  nimbus: drawNimbus,
  yuzu: drawYuzu
};

export function drawPal(ctx, species, t, pal, opts = {}) {
  const fn = DRAWERS[species] || drawMallow;
  fn(ctx, t, pal, opts);
}

export function drawCollectible(ctx, res, t, scale = 1) {
  ctx.save();
  ctx.scale(scale, scale);
  const bob = Math.sin(t * 3.1 + (res === "berries" ? 1 : res === "sparks" ? 2 : 0)) * 2.4;
  // glow
  const color = res === "dew" ? "rgba(111,189,183,.35)" : res === "berries" ? "rgba(217,111,105,.3)" : "rgba(244,196,95,.4)";
  const g = ctx.createRadialGradient(0, bob, 0, 0, bob, 18);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, bob, 18, 0, TAU);
  ctx.fill();
  // little shadow
  ctx.fillStyle = "rgba(63,82,48,.15)";
  ctx.beginPath();
  ctx.ellipse(0, 7, 7, 2.4, 0, 0, TAU);
  ctx.fill();
  ctx.translate(0, bob);
  if (res === "dew") {
    ctx.fillStyle = "#69aaa4";
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.bezierCurveTo(-7, -2, -5.8, 5, 0, 6);
    ctx.bezierCurveTo(5.8, 5, 7, -2, 0, -10);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.65)";
    ctx.beginPath();
    ctx.ellipse(-1.8, 0, 1.4, 2.4, -0.3, 0, TAU);
    ctx.fill();
  } else if (res === "berries") {
    ctx.fillStyle = "#d96f69";
    ctx.beginPath();
    ctx.arc(-3.5, 1, 4.2, 0, TAU);
    ctx.arc(3.3, 2.2, 3.8, 0, TAU);
    ctx.arc(0, -3.8, 4, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.45)";
    ctx.beginPath();
    ctx.arc(-4.6, -0.2, 1.1, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#658254";
    leafPath(ctx, 1, -8, 4, 4.5, 0.6);
    ctx.fill();
  } else {
    ctx.fillStyle = "#efc25f";
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(2.5, -3);
    ctx.lineTo(10, 0);
    ctx.lineTo(2.5, 3);
    ctx.lineTo(0, 10);
    ctx.lineTo(-2.5, 3);
    ctx.lineTo(-10, 0);
    ctx.lineTo(-2.5, -3);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255,247,208,.7)";
    ctx.beginPath();
    ctx.arc(-1.5, -2, 1.7, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

export function drawPalPortrait(ctx, species, pal, t, size = 200) {
  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(size * 0.5, size * 0.84);
  ctx.scale(size / 175, size / 175);
  // little hill
  const hill = ctx.createRadialGradient(0, 0, 4, 0, 0, 55);
  hill.addColorStop(0, "rgba(151,177,119,.34)");
  hill.addColorStop(1, "rgba(151,177,119,0)");
  ctx.fillStyle = hill;
  ctx.beginPath();
  ctx.ellipse(0, 0, 54, 16, 0, 0, TAU);
  ctx.fill();
  drawPal(ctx, species, t, pal, { exp: expressionFor(pal) });
  ctx.restore();
}
