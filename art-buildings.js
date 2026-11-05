import {
  TAU, roundRect, softShadow, leafPath, drawSparkle, drawHeart, seeded
} from "./art-core.js";

const rnd = seeded(122507);

function shadow(ctx, rx = 38, ry = 10) {
  softShadow(ctx, 0, 2, rx, ry, 0.19);
  ctx.save();
  ctx.fillStyle = "rgba(62,79,49,.12)";
  ctx.beginPath();
  ctx.ellipse(0, 2, rx * 0.85, ry * 0.72, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function steam(ctx, t, x, y, count = 3, spread = 8, size = 3) {
  ctx.save();
  for (let i = 0; i < count; i++) {
    const p = (t * 0.18 + i / count) % 1;
    const xx = x + Math.sin(t * 0.7 + i * 2.1) * spread * p;
    const yy = y - p * 32;
    ctx.globalAlpha = (1 - p) * 0.28;
    ctx.fillStyle = "#f7f0d9";
    ctx.beginPath();
    ctx.arc(xx, yy, size * (0.7 + p * 1.4), 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function fire(ctx, t, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const wobble = Math.sin(t * 8.2) * 0.08;
  // outer glow
  const g = ctx.createRadialGradient(0, -8, 0, 0, -8, 36);
  g.addColorStop(0, "rgba(255,198,101,.42)");
  g.addColorStop(0.5, "rgba(244,153,79,.15)");
  g.addColorStop(1, "rgba(244,153,79,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, -8, 36, 0, TAU);
  ctx.fill();
  // flame body
  const flame = (color, sx, sy, alpha) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-8 * sx, -4 * sy, -7 * sx, -15 * sy, -1.5 * sx, -20 * sy);
    ctx.bezierCurveTo(0.5 * sx, -25 * sy + wobble * 10, 4 * sx, -18 * sy, 5 * sx, -13 * sy);
    ctx.bezierCurveTo(9 * sx, -6 * sy, 6 * sx, -2 * sy, 0, 0);
    ctx.fill();
  };
  flame("#e96e4b", 1.05, 1.05, 0.95);
  flame("#f2a053", 0.8, 0.88, 0.9);
  flame("#f8d47d", 0.5, 0.65, 0.9);
  ctx.globalAlpha = 1;
  // floating sparks
  for (let i = 0; i < 3; i++) {
    const p = (t * 0.38 + i / 3) % 1;
    ctx.fillStyle = "#f4c167";
    ctx.globalAlpha = (1 - p) * 0.8;
    ctx.beginPath();
    ctx.arc(Math.sin(t * 2 + i * 4) * 7 * p, -12 - p * 32, 1.1 * (1 - p) + 0.4, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

export function drawCampfire(ctx, t) {
  shadow(ctx, 45, 12);
  // back tripod leg
  ctx.save();
  ctx.strokeStyle = "#61503c";
  ctx.lineWidth = 3.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-6, -30);
  ctx.lineTo(2, -71);
  ctx.stroke();

  fire(ctx, t, 0, -3, 1.18);

  // stones
  const stoneCols = ["#949482", "#a5a18e", "#85897a", "#b0a58e", "#959783", "#8b8e7d"];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU;
    const sx = Math.cos(a) * 33;
    const sy = Math.sin(a) * 12 + 0.5;
    ctx.fillStyle = stoneCols[i % stoneCols.length];
    ctx.beginPath();
    ctx.ellipse(sx, sy, 6.2 + (i % 3), 4 + (i % 2), a * 0.3, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(238,231,203,.22)";
    ctx.beginPath();
    ctx.ellipse(sx - 1.5, sy - 1.2, 3.3, 1.8, a * 0.3, 0, TAU);
    ctx.fill();
  }

  // logs
  ctx.save();
  ctx.translate(-4, -4);
  ctx.rotate(-0.28);
  ctx.fillStyle = "#71533a";
  roundRect(ctx, -21, -3, 44, 7, 3.5);
  ctx.fill();
  ctx.strokeStyle = "rgba(223,191,141,.22)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-16, -1);
  ctx.lineTo(16, -1);
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.translate(5, -2);
  ctx.rotate(0.45);
  ctx.fillStyle = "#5e4734";
  roundRect(ctx, -17, -3, 36, 6, 3);
  ctx.fill();
  ctx.restore();

  // kettle tripod
  ctx.strokeStyle = "#5a4d39";
  ctx.lineWidth = 3.1;
  ctx.beginPath();
  ctx.moveTo(-31, 0);
  ctx.lineTo(2, -70);
  ctx.lineTo(32, 0);
  ctx.moveTo(0, -63);
  ctx.lineTo(0, -45);
  ctx.stroke();

  // kettle
  ctx.save();
  ctx.translate(0, -39);
  ctx.fillStyle = "#7d8c7e";
  ctx.beginPath();
  ctx.ellipse(0, 0, 15, 12, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#617467";
  ctx.beginPath();
  ctx.ellipse(0, -5, 13, 6.5, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#56675a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, -8, 9, Math.PI * 1.08, Math.PI * 1.92);
  ctx.stroke();
  ctx.fillStyle = "#617467";
  ctx.beginPath();
  ctx.moveTo(11, -4);
  ctx.quadraticCurveTo(23, -6, 22, 2);
  ctx.quadraticCurveTo(17, 4, 12, 3);
  ctx.fill();
  ctx.fillStyle = "rgba(233,236,215,.4)";
  ctx.beginPath();
  ctx.ellipse(-4, -2, 4, 2.2, -0.5, 0, TAU);
  ctx.fill();
  ctx.restore();
  steam(ctx, t, -1, -54, 3, 9, 2.5);
  ctx.restore();
}

export function drawNest(ctx, t) {
  shadow(ctx, 48, 13);
  // back rim
  ctx.save();
  ctx.fillStyle = "#8e6b48";
  ctx.beginPath();
  ctx.ellipse(0, -9, 43, 19, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#aa8458";
  ctx.beginPath();
  ctx.ellipse(0, -12, 37, 15, 0, 0, TAU);
  ctx.fill();
  // cushion
  const cushion = ctx.createLinearGradient(0, -28, 0, -4);
  cushion.addColorStop(0, "#e7d5b6");
  cushion.addColorStop(1, "#d5bf9a");
  ctx.fillStyle = cushion;
  ctx.beginPath();
  ctx.ellipse(0, -13, 30, 12, 0, 0, TAU);
  ctx.fill();
  // patchwork blanket
  ctx.fillStyle = "#c38e83";
  ctx.beginPath();
  ctx.moveTo(-31, -11);
  ctx.quadraticCurveTo(-13, -31, 8, -22);
  ctx.quadraticCurveTo(20, -14, 32, -11);
  ctx.quadraticCurveTo(18, 4, 0, 1);
  ctx.quadraticCurveTo(-17, 3, -31, -11);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,246,222,.45)";
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(-23, -12);
  ctx.quadraticCurveTo(0, -18, 25, -11);
  ctx.stroke();
  ctx.setLineDash([]);
  // stitches
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = "#f2e4c6";
    ctx.beginPath();
    ctx.arc(-16 + i * 10, -9 + Math.sin(i) * 2, 1, 0, TAU);
    ctx.fill();
  }
  // pillow
  ctx.fillStyle = "#eee1c8";
  ctx.beginPath();
  ctx.ellipse(-21, -22, 12, 7, -0.18, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "rgba(147,123,91,.22)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(-21, -22, 9, 4.8, -0.18, 0, TAU);
  ctx.stroke();
  // plush mushroom
  ctx.fillStyle = "#d7a383";
  ctx.beginPath();
  ctx.ellipse(18, -20, 8, 5, 0.1, Math.PI, TAU);
  ctx.fill();
  ctx.fillStyle = "#f1e6cc";
  roundRect(ctx, 15.7, -20, 4.8, 9, 2.2);
  ctx.fill();
  ctx.fillStyle = "#fff7e5";
  ctx.beginPath();
  ctx.arc(15.5, -22, 1.1, 0, TAU);
  ctx.arc(21, -21.5, 0.9, 0, TAU);
  ctx.fill();
  // woven front
  ctx.strokeStyle = "#866242";
  ctx.lineWidth = 2.3;
  ctx.lineCap = "round";
  for (let i = 0; i < 8; i++) {
    const x = -34 + i * 9.7;
    ctx.beginPath();
    ctx.moveTo(x, -17);
    ctx.quadraticCurveTo(x + 3, -7, x + 1, 1);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(209,175,124,.5)";
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-34, -13 + i * 4);
    ctx.quadraticCurveTo(0, -18 + i * 5, 34, -12 + i * 4);
    ctx.stroke();
  }
  // tiny hanging star above the nest
  ctx.strokeStyle = "rgba(93,79,55,.55)";
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(36, -38);
  ctx.quadraticCurveTo(33, -48, 35, -57);
  ctx.stroke();
  drawSparkle(ctx, 35, -59, 4.5, "#e9c778", 0.85);
  ctx.restore();
}

export function drawGarden(ctx, t) {
  shadow(ctx, 47, 13);
  ctx.save();
  // soil bed
  const wood = ctx.createLinearGradient(0, -29, 0, 2);
  wood.addColorStop(0, "#96724d");
  wood.addColorStop(1, "#74573e");
  ctx.fillStyle = wood;
  ctx.beginPath();
  ctx.moveTo(-39, -21);
  ctx.lineTo(39, -21);
  ctx.lineTo(34, 1);
  ctx.lineTo(-34, 1);
  ctx.closePath();
  ctx.fill();
  // top rim
  ctx.fillStyle = "#a17c54";
  ctx.beginPath();
  ctx.ellipse(0, -21, 40, 12, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#5d4a36";
  ctx.beginPath();
  ctx.ellipse(0, -21, 33, 8.5, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#6e6248";
  ctx.beginPath();
  ctx.ellipse(0, -21, 29, 7, 0, 0, TAU);
  ctx.fill();
  // planks
  ctx.strokeStyle = "rgba(70,49,34,.28)";
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(-35 + i * 18, -20);
    ctx.lineTo(-31 + i * 18, 1);
    ctx.stroke();
  }
  // little nails
  ctx.fillStyle = "rgba(219,196,155,.55)";
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(-28 + i * 18.5, -16, 0.9, 0, TAU);
    ctx.fill();
  }
  // veggies
  const veg = [
    [-22, -25, 1.02, 0.2],
    [-6, -26, 0.86, 2.2],
    [11, -24, 1.06, 4.0],
    [25, -23, 0.8, 1.2]
  ];
  for (const [x, y, s, phase] of veg) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.rotate(Math.sin(t * 1.1 + phase) * 0.02);
    ctx.strokeStyle = "#5d7e4c";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-2, -7, 0, -14);
    ctx.stroke();
    ctx.fillStyle = "#73945a";
    leafPath(ctx, -4, -10, 7, 11, -0.8);
    ctx.fill();
    ctx.fillStyle = "#86a468";
    leafPath(ctx, 4, -11, 7, 11, 0.75);
    ctx.fill();
    ctx.fillStyle = "#678a55";
    leafPath(ctx, 0, -14, 6, 10, 0.1);
    ctx.fill();
    // carrot/beet peeking
    if (phase < 2) {
      ctx.fillStyle = "#d48a63";
      ctx.beginPath();
      ctx.ellipse(1, -4, 2.5, 4, 0.2, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
  // tomato stake
  ctx.strokeStyle = "#8a704e";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(18, -24);
  ctx.lineTo(17, -58);
  ctx.stroke();
  ctx.fillStyle = "#d16f63";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(17 + (i - 1) * 5, -39 - i * 4, 2.3, 0, TAU);
    ctx.fill();
  }
  // butterfly
  const bx = 28 + Math.sin(t * 0.8) * 10;
  const by = -62 + Math.cos(t * 1.1) * 6;
  ctx.fillStyle = "rgba(239,186,112,.9)";
  ctx.beginPath();
  ctx.ellipse(bx - 2.5, by, 3.5, 2, -0.5 + Math.sin(t * 9) * 0.4, 0, TAU);
  ctx.ellipse(bx + 2.5, by, 3.5, 2, 0.5 + Math.sin(t * 9) * 0.4, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "rgba(77,68,48,.5)";
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx, by + 3);
  ctx.stroke();
  // tiny sign
  ctx.fillStyle = "#9b8157";
  ctx.fillRect(31, -23, 2, 18);
  roundRect(ctx, 24, -28, 16, 8, 1.5);
  ctx.fillStyle = "#e8d6af";
  ctx.fill();
  ctx.fillStyle = "#7d8e68";
  ctx.font = "600 4px Fredoka, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SOUP", 32, -23);
  ctx.restore();
}

export function drawGlowbush(ctx, t) {
  shadow(ctx, 42, 12);
  ctx.save();
  // stems
  ctx.strokeStyle = "#6a7f4e";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(-2, -1);
    ctx.quadraticCurveTo(-10 + i * 7, -22, -16 + i * 10, -43);
    ctx.stroke();
  }
  // bush body
  const greens = ["#748e5b", "#809a64", "#688654", "#8ba36e"];
  const puffs = [
    [-21, -28, 18], [2, -39, 22], [24, -28, 17],
    [-8, -25, 20], [14, -19, 19], [0, -50, 15]
  ];
  for (let i = 0; i < puffs.length; i++) {
    ctx.fillStyle = greens[i % greens.length];
    ctx.beginPath();
    ctx.arc(puffs[i][0], puffs[i][1], puffs[i][2], 0, TAU);
    ctx.fill();
  }
  // leaf highlights
  ctx.fillStyle = "rgba(178,197,133,.28)";
  for (let i = 0; i < 6; i++) {
    const p = puffs[i];
    ctx.beginPath();
    ctx.ellipse(p[0] - 4, p[1] - 6, p[2] * 0.5, p[2] * 0.3, -0.5, 0, TAU);
    ctx.fill();
  }
  // glowing berries
  const berries = [
    [-25, -37], [-10, -48], [8, -54], [21, -40], [30, -26], [-2, -32], [12, -25], [-18, -19]
  ];
  for (let i = 0; i < berries.length; i++) {
    const [x, y] = berries[i];
    const pulse = 0.86 + Math.sin(t * 2 + i * 1.7) * 0.14;
    const g = ctx.createRadialGradient(x, y, 0, x, y, 10);
    g.addColorStop(0, "rgba(255,214,118,.4)");
    g.addColorStop(1, "rgba(255,214,118,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, 10 * pulse, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#efb65b";
    ctx.beginPath();
    ctx.arc(x, y, 3.2 * pulse, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(255,245,196,.9)";
    ctx.beginPath();
    ctx.arc(x - 1, y - 1, 1, 0, TAU);
    ctx.fill();
  }
  // tiny sparkles
  drawSparkle(ctx, 33, -49, 2.4, "#f6d886", 0.55 + 0.3 * Math.sin(t * 2.3));
  drawSparkle(ctx, -32, -20, 1.8, "#f6d886", 0.45);
  ctx.restore();
}

export function drawRainbarrel(ctx, t) {
  shadow(ctx, 39, 11);
  ctx.save();
  // bamboo stand
  ctx.strokeStyle = "#7c754f";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-25, -4);
  ctx.lineTo(-19, -31);
  ctx.moveTo(26, -4);
  ctx.lineTo(20, -31);
  ctx.stroke();
  // barrel
  const wood = ctx.createLinearGradient(-34, 0, 34, 0);
  wood.addColorStop(0, "#765a3e");
  wood.addColorStop(0.28, "#9a7752");
  wood.addColorStop(0.7, "#8b6848");
  wood.addColorStop(1, "#695039");
  ctx.fillStyle = wood;
  ctx.beginPath();
  ctx.moveTo(-29, -45);
  ctx.quadraticCurveTo(-37, -24, -29, -3);
  ctx.quadraticCurveTo(0, 8, 29, -3);
  ctx.quadraticCurveTo(37, -25, 29, -45);
  ctx.quadraticCurveTo(0, -54, -29, -45);
  ctx.fill();
  // staves
  ctx.strokeStyle = "rgba(62,45,31,.25)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(-22 + i * 9, -47);
    ctx.quadraticCurveTo(-26 + i * 10.2, -24, -20 + i * 8.3, -1);
    ctx.stroke();
  }
  // metal bands
  ctx.strokeStyle = "#606b60";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-32, -36);
  ctx.quadraticCurveTo(0, -29, 32, -36);
  ctx.moveTo(-32, -13);
  ctx.quadraticCurveTo(0, -6, 32, -13);
  ctx.stroke();
  // water
  ctx.fillStyle = "#679b95";
  ctx.beginPath();
  ctx.ellipse(0, -45, 27, 9, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(165,212,196,.38)";
  ctx.beginPath();
  ctx.ellipse(-4, -46, 18, 5.5, 0, 0, TAU);
  ctx.fill();
  // ripples
  ctx.strokeStyle = "rgba(229,239,211,.45)";
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 2; i++) {
    const rr = 4 + ((t * 4 + i * 9) % 13);
    ctx.globalAlpha = 0.4 * (1 - rr / 18);
    ctx.beginPath();
    ctx.ellipse(-4, -46, rr, rr * 0.32, 0, 0, TAU);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // lily pad
  ctx.fillStyle = "#6e965c";
  ctx.beginPath();
  ctx.ellipse(11, -47, 7, 3, -0.1, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#e8b7ac";
  ctx.beginPath();
  ctx.ellipse(11, -50, 2.2, 1.2, 0, 0, TAU);
  ctx.fill();
  // bamboo spout
  ctx.strokeStyle = "#7f8c56";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(30, -61);
  ctx.lineTo(30, -49);
  ctx.lineTo(19, -46);
  ctx.stroke();
  ctx.strokeStyle = "rgba(226,209,157,.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(29, -60);
  ctx.lineTo(29, -51);
  ctx.stroke();
  // dripping water
  const drop = (t * 0.7) % 1;
  ctx.fillStyle = "rgba(131,197,192,.8)";
  ctx.beginPath();
  ctx.arc(19, -42 + drop * 10, 1.3, 0, TAU);
  ctx.fill();
  if (drop > 0.88) {
    ctx.strokeStyle = "rgba(216,238,213,.35)";
    ctx.beginPath();
    ctx.ellipse(19, -46, 5, 1.6, 0, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}

function bottle(ctx, x, y, len, color, phase, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(t * 0.9 + phase) * 0.08);
  ctx.strokeStyle = "rgba(99,86,59,.7)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, len * 0.42);
  ctx.stroke();
  const by = len * 0.42;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-4, by + 8);
  ctx.quadraticCurveTo(-7, by + 17, -4.5, by + 24);
  ctx.lineTo(4.5, by + 24);
  ctx.quadraticCurveTo(7, by + 17, 4, by + 8);
  ctx.lineTo(2, by + 4);
  ctx.lineTo(-2, by + 4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255,250,220,.35)";
  ctx.beginPath();
  ctx.ellipse(-2, by + 15, 1.4, 4, 0.1, 0, TAU);
  ctx.fill();
  // little bead
  ctx.fillStyle = "#d7ab64";
  ctx.beginPath();
  ctx.arc(0, by - 1, 1.3, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function drawWindchime(ctx, t) {
  shadow(ctx, 31, 9);
  ctx.save();
  // post
  const wood = ctx.createLinearGradient(-22, 0, 2, 0);
  wood.addColorStop(0, "#634c36");
  wood.addColorStop(0.5, "#8c6c49");
  wood.addColorStop(1, "#5d4834");
  ctx.fillStyle = wood;
  roundRect(ctx, -24, -59, 6, 60, 2);
  ctx.fill();
  // branch arms
  ctx.strokeStyle = "#765b3e";
  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-21, -54);
  ctx.quadraticCurveTo(4, -58, 25, -52);
  ctx.moveTo(-15, -45);
  ctx.quadraticCurveTo(3, -49, 17, -44);
  ctx.stroke();
  // twisted twine
  ctx.strokeStyle = "rgba(92,77,50,.55)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-23, -59);
  ctx.quadraticCurveTo(-29, -47, -24, -26);
  ctx.stroke();
  // bottles
  bottle(ctx, 23, -51, 20, "rgba(231,178,99,.82)", 0.2, t);
  bottle(ctx, 12, -44, 27, "rgba(118,169,160,.78)", 1.4, t);
  bottle(ctx, 0, -45, 18, "rgba(170,151,189,.8)", 2.7, t);
  // ribbons
  ctx.strokeStyle = "#d7967f";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(18, -43);
  ctx.quadraticCurveTo(21 + Math.sin(t) * 2, -31, 18, -22);
  ctx.stroke();
  ctx.strokeStyle = "#e2c578";
  ctx.beginPath();
  ctx.moveTo(-12, -43);
  ctx.quadraticCurveTo(-9 + Math.cos(t * 0.8) * 2, -32, -12, -25);
  ctx.stroke();
  // leaf vine
  ctx.strokeStyle = "#6e8958";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(-24, -8);
  ctx.bezierCurveTo(-31, -24, -18, -43, -17, -55);
  ctx.stroke();
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = "#799562";
    leafPath(ctx, -22 + i * 0.7, -15 - i * 8, 4.5, 6.5, i % 2 ? 0.8 : -0.5);
    ctx.fill();
  }
  // tiny heart charm
  drawHeart(ctx, 2, -60, 3, "#d68a7b", 0.85);
  ctx.restore();
}

export function drawStorystump(ctx, t) {
  shadow(ctx, 44, 12);
  ctx.save();
  // stump
  const bark = ctx.createLinearGradient(-30, 0, 34, 0);
  bark.addColorStop(0, "#72543c");
  bark.addColorStop(0.35, "#97734f");
  bark.addColorStop(0.8, "#826141");
  bark.addColorStop(1, "#654a35");
  ctx.fillStyle = bark;
  ctx.beginPath();
  ctx.moveTo(-31, -34);
  ctx.quadraticCurveTo(-34, -14, -28, 0);
  ctx.quadraticCurveTo(0, 6, 28, 0);
  ctx.quadraticCurveTo(35, -14, 30, -35);
  ctx.closePath();
  ctx.fill();
  // bark lines
  ctx.strokeStyle = "rgba(69,48,33,.3)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(-23 + i * 11, -33);
    ctx.quadraticCurveTo(-25 + i * 12, -14, -21 + i * 10, 2);
    ctx.stroke();
  }
  // top
  ctx.fillStyle = "#b08b60";
  ctx.beginPath();
  ctx.ellipse(0, -34, 31, 12, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "rgba(107,77,50,.45)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(0, -34, 22 - i * 7, 8 - i * 2.5, 0, 0, TAU);
    ctx.stroke();
  }
  // moss on stump
  ctx.fillStyle = "#77935d";
  ctx.beginPath();
  ctx.ellipse(-21, -39, 12, 5, -0.1, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-29, -26, 7, 10, -0.4, 0, TAU);
  ctx.fill();
  // book stack
  const bookCols = ["#bd786b", "#7c9482", "#d4ac67", "#a3829f"];
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.translate(-33 + (i % 2) * 1.5, -2 - i * 4.4);
    ctx.rotate(i % 2 ? 0.06 : -0.03);
    ctx.fillStyle = bookCols[i];
    roundRect(ctx, -12, -4, 24, 4.3, 1);
    ctx.fill();
    ctx.fillStyle = "rgba(244,234,205,.45)";
    ctx.fillRect(-8, -3.1, 14, 1);
    ctx.restore();
  }
  // lantern on right
  ctx.strokeStyle = "#676c58";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(22, -36);
  ctx.lineTo(22, -45);
  ctx.stroke();
  ctx.fillStyle = "#6f806d";
  roundRect(ctx, 16, -54, 12, 10, 2);
  ctx.fill();
  ctx.fillStyle = "rgba(247,213,131,.85)";
  roundRect(ctx, 18, -52, 8, 6, 1);
  ctx.fill();
  const g = ctx.createRadialGradient(22, -49, 0, 22, -49, 25);
  g.addColorStop(0, "rgba(247,204,111,.3)");
  g.addColorStop(1, "rgba(247,204,111,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(22, -49, 25, 0, TAU);
  ctx.fill();
  // cup on stump
  ctx.fillStyle = "#e6d6b8";
  ctx.beginPath();
  ctx.ellipse(-3, -40, 5.5, 2.4, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#99745b";
  ctx.beginPath();
  ctx.ellipse(-3, -41, 4.2, 1.7, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#e6d6b8";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(3, -41, 3, -0.6, 1.5);
  ctx.stroke();
  // tiny mushroom by books
  ctx.fillStyle = "#e8dcc0";
  ctx.fillRect(-41, -10, 2.4, 8);
  ctx.fillStyle = "#d1907f";
  ctx.beginPath();
  ctx.ellipse(-39.8, -10, 5, 3, 0, Math.PI, TAU);
  ctx.fill();
  steam(ctx, t, -3, -44, 2, 4, 1.7);
  // open book floating? small sparkle
  drawSparkle(ctx, 28, -64, 2.4, "#f2d180", 0.6 + Math.sin(t * 1.8) * 0.2);
  ctx.restore();
}

export function drawSpa(ctx, t) {
  shadow(ctx, 49, 14);
  ctx.save();
  // stone ring
  const stones = ["#8f9382", "#9fa18d", "#7e8779", "#afaa92", "#939c8e", "#858c78"];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    const sx = Math.cos(a) * 38;
    const sy = Math.sin(a) * 14;
    ctx.fillStyle = stones[i % stones.length];
    ctx.beginPath();
    ctx.ellipse(sx, sy - 3, 8.6, 6, a * 0.2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(229,224,196,.16)";
    ctx.beginPath();
    ctx.ellipse(sx - 2, sy - 5, 4, 2.2, a * 0.2, 0, TAU);
    ctx.fill();
  }
  // pool water
  const water = ctx.createRadialGradient(-7, -12, 2, 0, -8, 35);
  water.addColorStop(0, "#a9d3c5");
  water.addColorStop(0.55, "#7fbcb3");
  water.addColorStop(1, "#63a49f");
  ctx.fillStyle = water;
  ctx.beginPath();
  ctx.ellipse(0, -8, 32, 12.5, 0, 0, TAU);
  ctx.fill();
  // ripples
  ctx.strokeStyle = "rgba(232,245,220,.42)";
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 3; i++) {
    const rr = 5 + ((t * 5 + i * 11) % 24);
    ctx.globalAlpha = (1 - rr / 30) * 0.5;
    ctx.beginPath();
    ctx.ellipse(-3, -10, rr, rr * 0.34, 0, 0, TAU);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // foam
  ctx.fillStyle = "rgba(237,244,219,.35)";
  ctx.beginPath();
  ctx.ellipse(15, -6, 5, 1.3, 0.2, 0, TAU);
  ctx.fill();
  // bamboo
  ctx.strokeStyle = "#7a8c56";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(34, -38);
  ctx.quadraticCurveTo(34, -22, 40, -3);
  ctx.moveTo(34, -30);
  ctx.lineTo(29, -36);
  ctx.stroke();
  ctx.fillStyle = "#79975c";
  for (let i = 0; i < 3; i++) {
    leafPath(ctx, 37 + i * 2, -35 + i * 5, 6, 9, 0.8 + i * 0.2);
    ctx.fill();
  }
  // towel rock
  ctx.fillStyle = "#969685";
  ctx.beginPath();
  ctx.ellipse(-38, -5, 9, 7, -0.2, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#d6b8a0";
  roundRect(ctx, -44, -15, 14, 8, 3);
  ctx.fill();
  ctx.fillStyle = "rgba(255,246,222,.45)";
  ctx.fillRect(-43, -12, 10, 1.2);
  // steam
  steam(ctx, t, -10, -22, 4, 15, 3.8);
  steam(ctx, t + 2, 17, -18, 2, 7, 2.5);
  // little floating flowers
  ctx.fillStyle = "#efb8a8";
  for (let i = 0; i < 3; i++) {
    const a = i * 2.1 + t * 0.09;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 17, -10 + Math.sin(a) * 4, 1.7, 0, TAU);
    ctx.fill();
  }
  // lantern on right stone
  ctx.strokeStyle = "#6e715d";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(39, -25);
  ctx.lineTo(40, -32);
  ctx.stroke();
  ctx.fillStyle = "rgba(246,211,126,.85)";
  ctx.beginPath();
  ctx.arc(40, -33, 2.6, 0, TAU);
  ctx.fill();
  const g = ctx.createRadialGradient(40, -33, 0, 40, -33, 16);
  g.addColorStop(0, "rgba(246,211,126,.3)");
  g.addColorStop(1, "rgba(246,211,126,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(40, -33, 16, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function drawLantern(ctx, t) {
  shadow(ctx, 24, 8);
  ctx.save();
  // post
  ctx.strokeStyle = "#6f5c43";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-7, 0);
  ctx.quadraticCurveTo(-9, -33, -2, -55);
  ctx.quadraticCurveTo(2, -68, 14, -65);
  ctx.stroke();
  // hanging chain
  ctx.strokeStyle = "rgba(73,65,45,.75)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(14, -65);
  ctx.lineTo(15, -54);
  ctx.stroke();
  // glass lantern
  const g = ctx.createRadialGradient(16, -38, 0, 16, -38, 34);
  g.addColorStop(0, "rgba(248,208,120,.38)");
  g.addColorStop(1, "rgba(248,208,120,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(16, -38, 34, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#695f4c";
  ctx.beginPath();
  ctx.moveTo(9, -52);
  ctx.lineTo(22, -52);
  ctx.lineTo(24, -33);
  ctx.lineTo(7, -33);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(250,213,133,.9)";
  ctx.beginPath();
  ctx.moveTo(11, -49);
  ctx.lineTo(20, -49);
  ctx.lineTo(21.5, -35);
  ctx.lineTo(9.5, -35);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff4c8";
  ctx.beginPath();
  ctx.ellipse(15, -42, 2.5, 4, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#665a47";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(6, -52);
  ctx.lineTo(25, -52);
  ctx.stroke();
  // vines on the post
  ctx.strokeStyle = "#718c5c";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-8, -4);
  ctx.bezierCurveTo(-15, -17, -3, -28, -8, -42);
  ctx.stroke();
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = "#7c9964";
    leafPath(ctx, -9 + Math.sin(i) * 3, -12 - i * 8, 4.5, 6.5, i % 2 ? 0.6 : -0.6);
    ctx.fill();
  }
  // small moth
  const mx = 31 + Math.sin(t * 0.9) * 8;
  const my = -27 + Math.cos(t * 1.3) * 5;
  ctx.fillStyle = "rgba(237,213,153,.8)";
  ctx.beginPath();
  ctx.ellipse(mx - 2, my, 2.7, 1.5, -0.4 + Math.sin(t * 10) * 0.3, 0, TAU);
  ctx.ellipse(mx + 2, my, 2.7, 1.5, 0.4 + Math.sin(t * 10) * 0.3, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function drawBuilding(ctx, type, t) {
  switch (type) {
    case "campfire": return drawCampfire(ctx, t);
    case "nest": return drawNest(ctx, t);
    case "garden": return drawGarden(ctx, t);
    case "glowbush": return drawGlowbush(ctx, t);
    case "rainbarrel": return drawRainbarrel(ctx, t);
    case "windchime": return drawWindchime(ctx, t);
    case "storystump": return drawStorystump(ctx, t);
    case "spa": return drawSpa(ctx, t);
    case "lantern": return drawLantern(ctx, t);
    default: return drawLantern(ctx, t);
  }
}
