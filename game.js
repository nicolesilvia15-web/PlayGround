import {
  PAL_SPECIES, BUILDING_TYPES, BUILDABLE, QUESTS, HEARTH_LEVELS,
  PAL_LEVELS, SAVE_KEY, COLS, ROWS
} from "./data.js";
import { iso, tileDiamond, viewCorners, TAU, seeded, drawHeart, drawStar, drawDew, drawBerry } from "./art-core.js";
import { renderBackground, drawBirds } from "./art-bg.js";
import { renderIsland } from "./art-world.js";
import { drawBuilding } from "./art-buildings.js";
import { drawPal, drawCollectible, drawPalPortrait } from "./art-pals.js";
import { Soundscape } from "./audio.js";

const $ = (id) => document.getElementById(id);
const canvas = $("world");
const ctx = canvas.getContext("2d");
const audio = new Soundscape();

const TAU2 = Math.PI * 2;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const rand = (a = 1, b = 0) => b + Math.random() * (a - b);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const fmt = (n) => Math.round(n).toLocaleString("en-US");

const view = { w: 0, h: 0, dpr: 1, scale: 1, cx: 0, cy: 0 };
let bgCache = null;
let islandCache = null;
let gameTime = 0;
let lastFrame = performance.now();
let lastUi = 0;
let lastPortrait = 0;
let saveTimer = 0;
let ambientTimer = 8;
let nextId = 100;
let selectedId = null;
let placing = null;
let hoverTile = null;
let hoverPalId = null;
let hoverCollectibleId = null;
let hintDismissed = false;
let activeSheet = null;
let modalName = null;
let levelQueue = [];
let levelShowing = false;
let collectibles = [];
let particles = [];
let motes = [];
let leaves = [];
let toastCount = 0;
let builtAtLeastOne = false;
let resetting = false;

/* ------------------------------------------------------------------ */
/* state                                                               */
/* ------------------------------------------------------------------ */
function makePal(species, c, r, overrides = {}) {
  const spec = PAL_SPECIES[species];
  return {
    id: species,
    species,
    name: spec?.name || "Pip",
    hunger: 76 + rand(10),
    joy: 68 + rand(13),
    energy: 71 + rand(14),
    xp: 0,
    level: 1,
    x: c,
    y: r,
    tx: c,
    ty: r,
    idle: rand(8.5, 4),
    moving: false,
    sleeping: false,
    hop: 0,
    petting: 0,
    seed: Math.random(),
    lastPet: 0,
    say: null,
    sayUntil: 0,
    screen: { x: 0, y: 0 },
    ...overrides
  };
}

function makeBuilding(type, c, r, ready = null) {
  const data = BUILDING_TYPES[type];
  return {
    id: "b" + nextId++,
    type,
    c,
    r,
    readyIn: ready ?? (data.produce ? data.produce.interval * (0.35 + Math.random() * 0.65) : null),
    builtAt: gameTime
  };
}

function freshState() {
  nextId = 100;
  return {
    v: 1,
    resources: { dew: 52, berries: 6, sparks: 4 },
    warmth: 12,
    questIndex: 0,
    questProgress: 0,
    pals: [
      makePal("mallow", 4.4, 4.7),
      makePal("taro", 6.8, 3.1),
      makePal("juniper", 1.0, 4.4)
    ],
    buildings: [
      makeBuilding("campfire", 4, 2, 10),
      makeBuilding("nest", 2, 2, null),
      makeBuilding("garden", 5, 3, 7),
      makeBuilding("storystump", 2, 4, 13)
    ],
    counters: { pets: 0, feeds: 0, plays: 0, collects: 0 },
    hintDismissed: false,
    audio: true,
    savedAt: Date.now()
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.v !== 1 || !data.pals?.length || !data.buildings?.length) return null;
    // normalize old / partial saves
    data.resources = { dew: 0, berries: 0, sparks: 0, ...(data.resources || {}) };
    data.counters = { pets: 0, feeds: 0, plays: 0, collects: 0, ...(data.counters || {}) };
    data.warmth = Number.isFinite(data.warmth) ? data.warmth : 12;
    data.questIndex = Number.isFinite(data.questIndex) ? data.questIndex : 0;
    data.questProgress = Number.isFinite(data.questProgress) ? data.questProgress : 0;
    data.hintDismissed = Boolean(data.hintDismissed);
    data.audio = data.audio !== false;
    data.pals.forEach((p) => {
      const spec = PAL_SPECIES[p.species];
      if (!spec) return;
      p.name = spec.name;
      p.hunger = clamp(Number(p.hunger) || 70, 0, 100);
      p.joy = clamp(Number(p.joy) || 70, 0, 100);
      p.energy = clamp(Number(p.energy) || 70, 0, 100);
      p.xp = Number(p.xp) || 0;
      p.level = clamp(Number(p.level) || 1, 1, PAL_LEVELS.length);
      p.x = Number.isFinite(p.x) ? p.x : 4;
      p.y = Number.isFinite(p.y) ? p.y : 4;
      p.tx = p.x;
      p.ty = p.y;
      p.seed = Number.isFinite(p.seed) ? p.seed : Math.random();
      p.moving = false;
      p.hop = 0;
      p.petting = 0;
      p.say = null;
      p.sayUntil = 0;
    });
    data.buildings.forEach((b) => {
      if (!BUILDING_TYPES[b.type]) return;
      const dataT = BUILDING_TYPES[b.type];
      if (b.readyIn === undefined || b.readyIn === null) {
        b.readyIn = dataT.produce ? dataT.produce.interval * 0.5 : null;
      }
    });
    return data;
  } catch {
    return null;
  }
}

const state = loadState() || freshState();
hintDismissed = state.hintDismissed;
nextId = Math.max(100, ...state.buildings.map((b) => Number(String(b.id).replace(/\D/g, "")) || 100)) + 1;

function save() {
  if (resetting) return;
  try {
    state.savedAt = Date.now();
    state.hintDismissed = hintDismissed;
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // localStorage can be unavailable in private windows; the game keeps playing.
  }
}

/* ------------------------------------------------------------------ */
/* derived helpers                                                     */
/* ------------------------------------------------------------------ */
function hearthLevel() {
  let lvl = 1;
  for (const l of HEARTH_LEVELS) if (state.warmth >= l.min) lvl = l.level;
  return lvl;
}
function hearthData() {
  return HEARTH_LEVELS[clamp(hearthLevel() - 1, 0, HEARTH_LEVELS.length - 1)];
}
function nextHearthData() {
  return HEARTH_LEVELS[clamp(hearthLevel(), 0, HEARTH_LEVELS.length - 1)];
}
function palById(id) {
  return state.pals.find((p) => p.id === id) || null;
}
function moodOf(p) {
  if (!p) return "content";
  if (p.energy < 22) return "sleepy";
  if (p.hunger < 30) return "peckish";
  if (p.joy < 30) return "lonely";
  if (p.hunger > 72 && p.joy > 72 && p.energy > 55) return "radiant";
  return "content";
}
function moodLine(p) {
  if (p.say && p.sayUntil > gameTime) return p.say;
  const spec = PAL_SPECIES[p.species];
  const mood = moodOf(p);
  if (mood === "peckish") return spec.lines.hungry;
  if (mood === "sleepy") return spec.lines.sleepy;
  if (mood === "lonely") return spec.lines.lowjoy;
  if (mood === "radiant") return spec.lines.happy;
  return spec.lines.content;
}
function visibleQuest() {
  return QUESTS[state.questIndex] || null;
}
function questProgressValue() {
  const q = visibleQuest();
  if (!q) return 0;
  if (q.kind === "pals") return state.pals.length;
  if (q.kind === "hearthLevel") return hearthLevel();
  if (q.kind === "palLevel") return state.pals.filter((p) => p.level >= 2).length;
  return state.questProgress;
}
function occupied(c, r) {
  return state.buildings.some((b) => Math.abs(b.c - c) < 0.5 && Math.abs(b.r - r) < 0.5);
}
function nextOpenTileNear(c, r, maxRadius = 2) {
  for (let radius = 1; radius <= maxRadius; radius++) {
    const candidates = [];
    for (let dc = -radius; dc <= radius; dc++) {
      for (let dr = -radius; dr <= radius; dr++) {
        if (Math.abs(dc) !== radius && Math.abs(dr) !== radius) continue;
        const cc = Math.round(c + dc);
        const rr = Math.round(r + dr);
        if (cc < 0 || rr < 0 || cc >= COLS || rr >= ROWS) continue;
        if (!occupied(cc, rr)) candidates.push([cc, rr]);
      }
    }
    if (candidates.length) return pick(candidates);
  }
  return [clamp(Math.round(c), 0, COLS - 1), clamp(Math.round(r), 0, ROWS - 1)];
}

/* ------------------------------------------------------------------ */
/* UI refs                                                             */
/* ------------------------------------------------------------------ */
const ui = {
  dewVal: $("dewVal"),
  berryVal: $("berryVal"),
  sparkVal: $("sparkVal"),
  dewPill: $("dewPill"),
  berryPill: $("berryPill"),
  sparkPill: $("sparkPill"),
  hearthLevel: $("hearthLevel"),
  hearthName: $("hearthName"),
  hearthFill: $("hearthFill"),
  hearthXp: $("hearthXp"),
  hearthNext: $("hearthNext"),
  palsCount: $("palsCount"),
  hearthInfo: $("hearthInfo"),
  mobileHearth: $("mobileHearth"),
  mobileQuest: $("mobileQuest"),
  miniLevel: $("miniLevel"),
  miniHearthNote: $("miniHearthNote"),
  miniQuest: $("miniQuest"),
  questCard: $("questCard"),
  questStep: $("questStep"),
  questTitle: $("questTitle"),
  questDesc: $("questDesc"),
  questFill: $("questFill"),
  questCount: $("questCount"),
  questReward: $("questReward"),
  palPanel: $("palPanel"),
  palPortrait: $("palPortrait"),
  palMood: $("palMood"),
  palSpecies: $("palSpecies"),
  palName: $("palName"),
  palLevel: $("palLevel"),
  palBond: $("palBond"),
  palLine: $("palLine"),
  hungerFill: $("hungerFill"),
  joyFill: $("joyFill"),
  energyFill: $("energyFill"),
  palXpFill: $("palXpFill"),
  palXpText: $("palXpText"),
  feedBtn: $("feedBtn"),
  playBtn: $("playBtn"),
  petBtn: $("petBtn"),
  scrim: $("scrim"),
  buildSheet: $("buildSheet"),
  buildList: $("buildList"),
  buildBtn: $("buildBtn"),
  buildClose: $("buildClose"),
  cancelBuild: $("cancelBuild"),
  placementBar: $("placementBar"),
  placementThumb: $("placementThumb"),
  placementName: $("placementName"),
  placementCancel: $("placementCancel"),
  palsSheet: $("palsSheet"),
  palsGrid: $("palsGrid"),
  palsSub: $("palsSub"),
  palsClose: $("palsClose"),
  palsCare: $("palsCare"),
  journalSheet: $("journalSheet"),
  journalClose: $("journalClose"),
  journalBtn: $("journalBtn"),
  statXp: $("statXp"),
  statBuildings: $("statBuildings"),
  statPals: $("statPals"),
  statPets: $("statPets"),
  statFeeds: $("statFeeds"),
  journalArt: $("journalArt"),
  welcomeCard: $("welcomeCard"),
  welcomeArt: $("welcomeArt"),
  welcomeBtn: $("welcomeBtn"),
  welcomeLater: $("welcomeLater"),
  helpBtn: $("helpBtn"),
  soundBtn: $("soundBtn"),
  levelUp: $("levelUp"),
  levelUpTitle: $("levelUpTitle"),
  levelUpDesc: $("levelUpDesc"),
  levelUpBtn: $("levelUpBtn"),
  newPalArt: $("newPalArt"),
  newPalRow: $("newPalRow"),
  confirmCard: $("confirmCard"),
  resetBtn: $("resetBtn"),
  cancelReset: $("cancelReset"),
  confirmReset: $("confirmReset"),
  careBtn: $("careBtn"),
  careDot: $("careDot"),
  palsBtn: $("palsBtn"),
  sceneHint: $("sceneHint"),
  hintClose: $("hintClose"),
  toastStack: $("toastStack"),
  burstLayer: $("burstLayer"),
  palClose: $("palClose"),
  palSheet: $("palPanel")
};

/* ------------------------------------------------------------------ */
/* UI rendering                                                        */
/* ------------------------------------------------------------------ */
function bumpPill(key) {
  const el = key === "dew" ? ui.dewPill : key === "berries" ? ui.berryPill : ui.sparkPill;
  el.classList.remove("bump");
  void el.offsetWidth;
  el.classList.add("bump");
  setTimeout(() => el.classList.remove("bump"), 520);
}

function updateResourceUI() {
  ui.dewVal.textContent = fmt(state.resources.dew);
  ui.berryVal.textContent = fmt(state.resources.berries);
  ui.sparkVal.textContent = fmt(state.resources.sparks);
}

function updateHUD(animate = []) {
  updateResourceUI();
  if (animate.length) animate.forEach(bumpPill);
  const level = hearthLevel();
  const hd = hearthData();
  const next = nextHearthData();
  const prevMin = hd.min;
  const nextMin = next.min ?? hd.next;
  const span = Math.max(1, nextMin - prevMin);
  const pct = hd.next === null ? 100 : clamp(((state.warmth - prevMin) / span) * 100, 0, 100);
  ui.hearthLevel.textContent = level;
  if (ui.miniLevel) ui.miniLevel.textContent = level;
  ui.hearthName.textContent = hd.name;
  ui.hearthFill.style.width = pct + "%";
  ui.hearthXp.textContent = Math.round(state.warmth);
  ui.hearthNext.textContent = hd.next ?? "∞";
  ui.palsCount.textContent = state.pals.length;
  if (ui.miniHearthNote) ui.miniHearthNote.textContent = `${hd.name} · ${Math.round(state.warmth)} warmth`;
  ui.statXp.textContent = Math.round(state.warmth);
  ui.statBuildings.textContent = state.buildings.length;
  ui.statPals.textContent = state.pals.length;
  ui.statPets.textContent = state.counters.pets;
  ui.statFeeds.textContent = state.counters.feeds;

  updateQuestUI();
  updateCareDot();
  ui.feedBtn.disabled = state.resources.berries < 1;
  ui.playBtn.disabled = state.resources.sparks < 1;
}

function updateQuestUI() {
  const q = visibleQuest();
  if (!q) {
    ui.questTitle.textContent = "A humming hollow";
    ui.questDesc.textContent = "Every small kindness is still here. Keep wandering, keep warm.";
    ui.questStep.textContent = "all done";
    ui.questFill.style.width = "100%";
    ui.questCount.textContent = "complete";
    ui.questReward.innerHTML = `<span>Status</span><span class="reward-chip"><svg><use href="#i-check"></use></svg>At peace</span>`;
    ui.miniQuest.innerHTML = `A humming hollow <b>✓</b>`;
    return;
  }
  const value = Math.min(questProgressValue(), q.target);
  ui.questStep.textContent = `${state.questIndex + 1} / ${QUESTS.length}`;
  ui.questTitle.textContent = q.title;
  ui.questDesc.textContent = q.desc;
  ui.questFill.style.width = `${clamp((value / q.target) * 100, 0, 100)}%`;
  ui.questCount.textContent = `${value} / ${q.target}`;
  ui.miniQuest.innerHTML = `${q.title} <b>${value}/${q.target}</b>`;
  const rewardParts = [];
  if (q.reward.dew) rewardParts.push(`<span class="reward-chip"><svg><use href="#i-dew"></use></svg>+${q.reward.dew}</span>`);
  if (q.reward.berries) rewardParts.push(`<span class="reward-chip"><svg><use href="#i-berry"></use></svg>+${q.reward.berries}</span>`);
  if (q.reward.sparks) rewardParts.push(`<span class="reward-chip"><svg><use href="#i-spark"></use></svg>+${q.reward.sparks}</span>`);
  ui.questReward.innerHTML = `<span>Reward</span>${rewardParts.join("")}`;
}

function updateCareDot() {
  const low = state.pals.some((p) => p.hunger < 30 || p.joy < 26 || p.energy < 18);
  ui.careDot.classList.toggle("show", low);
}

function refreshPalPanel() {
  const p = palById(selectedId);
  if (!p || ui.palPanel.hidden) return;
  ui.palSpecies.textContent = PAL_SPECIES[p.species].kind;
  ui.palName.firstChild.textContent = p.name + " ";
  ui.palLevel.textContent = `Lv. ${p.level}`;
  ui.palMood.textContent = moodOf(p);
  ui.palLine.textContent = moodLine(p);
  ui.hungerFill.style.width = p.hunger + "%";
  ui.joyFill.style.width = p.joy + "%";
  ui.energyFill.style.width = p.energy + "%";
  const next = PAL_LEVELS[p.level] ?? null;
  const prev = PAL_LEVELS[p.level - 1] ?? 0;
  const span = next === null ? 1 : next - prev;
  const xp = clamp(p.xp - prev, 0, span);
  ui.palXpFill.style.width = next === null ? "100%" : `${(xp / span) * 100}%`;
  ui.palXpText.textContent = next === null ? "kindred" : `${Math.round(p.xp)} / ${next}`;
  const bond = Math.min(5, Math.ceil(p.level * 0.95));
  [...ui.palBond.children].forEach((el, i) => el.classList.toggle("on", i < bond));
  ui.feedBtn.disabled = state.resources.berries < 1;
  ui.playBtn.disabled = state.resources.sparks < 1;
  drawPalPortrait(ui.palPortrait.getContext("2d"), p.species, p, gameTime + 1.2, ui.palPortrait.width);
}

/* ------------------------------------------------------------------ */
/* toasts, bursts and words                                            */
/* ------------------------------------------------------------------ */
function showToast(text, icon = "i-sparkles", tone = "") {
  if (toastCount > 3) return;
  toastCount++;
  const el = document.createElement("div");
  el.className = "toast " + tone;
  el.innerHTML = `<span class="t-ico"><svg><use href="#${icon}"></use></svg></span><span>${text}</span>`;
  ui.toastStack.appendChild(el);
  setTimeout(() => {
    el.classList.add("leaving");
    setTimeout(() => {
      el.remove();
      toastCount = Math.max(0, toastCount - 1);
    }, 320);
  }, 2600);
}

function addFloatWord(x, y, text, color = "#43614a") {
  const el = document.createElement("div");
  el.className = "float-word";
  el.style.left = x + "px";
  el.style.top = y + "px";
  el.style.color = color;
  el.textContent = text;
  ui.burstLayer.appendChild(el);
  setTimeout(() => el.remove(), 1050);
}

function domBurst(x, y, colors, n = 8) {
  for (let i = 0; i < n; i++) {
    const el = document.createElement("span");
    el.className = "burst";
    const a = Math.random() * TAU2;
    const d = 18 + Math.random() * 42;
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.background = pick(colors);
    el.style.setProperty("--dx", `${Math.cos(a) * d}px`);
    el.style.setProperty("--dy", `${Math.sin(a) * d - 12}px`);
    el.style.animationDelay = `${Math.random() * 0.08}s`;
    el.style.width = `${4 + Math.random() * 5}px`;
    el.style.height = el.style.width;
    ui.burstLayer.appendChild(el);
    setTimeout(() => el.remove(), 950);
  }
}

function palScreen(p) {
  return p.screen || { x: view.cx, y: view.cy };
}

function emitCanvasParticles(x, y, kind, count = 10, color = "#dc8179") {
  for (let i = 0; i < count; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.8;
    const speed = 30 + Math.random() * 75;
    particles.push({
      x,
      y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      gravity: kind === "heart" ? -8 : 42,
      life: 0,
      max: 0.65 + Math.random() * 0.7,
      size: 3 + Math.random() * 5,
      kind,
      color,
      rot: Math.random() * TAU2,
      spin: (Math.random() - 0.5) * 4
    });
  }
}

function burstAroundPal(p, kind = "heart", count = 9) {
  const s = palScreen(p);
  const scale = view.scale * 1.12;
  emitCanvasParticles(s.x, s.y - 52 * scale, kind, count, kind === "star" ? "#edc267" : "#db7d7a");
  domBurst(s.x, s.y - 58 * scale, ["#e6a0a0", "#f0cb78", "#f6ecd2", "#a9c49b"], Math.min(10, count));
}

function burstAtScreen(x, y, kind = "star", count = 8) {
  emitCanvasParticles(x, y, kind, count, kind === "star" ? "#efc66b" : "#df8177");
}

/* ------------------------------------------------------------------ */
/* audio & hint                                                        */
/* ------------------------------------------------------------------ */
function dismissHint() {
  if (hintDismissed) return;
  hintDismissed = true;
  state.hintDismissed = true;
  ui.sceneHint.style.opacity = "0";
  ui.sceneHint.style.transform = "translateY(6px)";
  ui.sceneHint.style.transition = "opacity .25s ease, transform .25s ease";
  setTimeout(() => (ui.sceneHint.hidden = true), 260);
  save();
}

function toggleSound() {
  state.audio = !state.audio;
  audio.setEnabled(state.audio);
  ui.soundBtn.classList.toggle("muted", !state.audio);
  ui.soundBtn.querySelector("use").setAttribute("href", state.audio ? "#i-sound" : "#i-mute");
  ui.soundBtn.setAttribute("aria-label", state.audio ? "Mute sound" : "Enable sound");
  if (state.audio) {
    audio.resume();
    audio.click();
  }
  save();
}

/* ------------------------------------------------------------------ */
/* viewport and cached scenery                                         */
/* ------------------------------------------------------------------ */
function resize() {
  const w = Math.max(320, window.innerWidth);
  const h = Math.max(320, window.innerHeight);
  view.w = w;
  view.h = h;
  view.dpr = Math.min(window.devicePixelRatio || 1, 2);
  const compact = w < 880;
  const landscape = h < 560 && w > h;
  const tiny = w <= 520;
  const uiTop = compact ? (landscape ? 58 : tiny ? 130 : 116) : 98;
  const uiBottom = compact ? (landscape ? 62 : 84) : 78;
  const availH = Math.max(220, h - uiTop - uiBottom);
  const islandWidth = 812;
  const widthAllow = w * (compact ? (tiny ? 0.98 : 0.94) : 0.9);
  let scale = Math.min(widthAllow / islandWidth, availH / (landscape ? 470 : 540), 1.22);
  scale = Math.max(0.32, scale);
  view.scale = scale;
  view.cx = w / 2;
  view.cy = uiTop + availH * (compact ? 0.51 : 0.47);

  canvas.width = Math.round(w * view.dpr);
  canvas.height = Math.round(h * view.dpr);
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);

  // static scenery is cached; animations are layered on top
  bgCache = document.createElement("canvas");
  bgCache.width = canvas.width;
  bgCache.height = canvas.height;
  const bg = bgCache.getContext("2d");
  bg.scale(view.dpr, view.dpr);
  renderBackground(bg, w, h);

  islandCache = document.createElement("canvas");
  islandCache.width = canvas.width;
  islandCache.height = canvas.height;
  const island = islandCache.getContext("2d");
  island.scale(view.dpr, view.dpr);
  renderIsland(island, view);

  makeAtmosphere();
  state.pals.forEach((p) => {
    p.screen = iso(view, p.x, p.y);
  });
}

function makeAtmosphere() {
  const n = view.w < 600 ? 18 : 30;
  motes = [];
  for (let i = 0; i < n; i++) {
    motes.push({
      x: Math.random(),
      y: Math.random(),
      size: 0.8 + Math.random() * 2.1,
      speed: 0.008 + Math.random() * 0.022,
      phase: Math.random() * TAU2,
      drift: 0.004 + Math.random() * 0.015,
      warmth: Math.random()
    });
  }
  leaves = [];
  for (let i = 0; i < 4; i++) {
    leaves.push({ x: Math.random(), y: Math.random(), speed: 0.012 + Math.random() * 0.02, phase: Math.random() * TAU2, size: 3 + Math.random() * 3 });
  }
}

function drawAtmosphere(front) {
  const t = gameTime;
  ctx.save();
  for (const m of motes) {
    if ((m.warmth > 0.45) !== front) continue;
    const x = m.x * view.w + Math.sin(t * 0.24 + m.phase) * 16;
    const y = ((m.y * view.h + t * m.speed * view.h) % (view.h + 60)) - 30;
    ctx.globalAlpha = 0.22 + 0.28 * (0.5 + 0.5 * Math.sin(t * 0.7 + m.phase));
    ctx.fillStyle = m.warmth > 0.45 ? "#fff3cd" : "#f1ead0";
    ctx.beginPath();
    ctx.arc(x, y, m.size, 0, TAU2);
    ctx.fill();
  }
  if (front) {
    for (const l of leaves) {
      const x = ((l.x * view.w + t * l.speed * view.w * 0.65) % (view.w + 80)) - 40;
      const y = ((l.y * view.h + t * l.speed * view.h * 0.8) % (view.h + 80)) - 40;
      const rot = t * 0.7 + l.phase;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = "#c6a65c";
      ctx.beginPath();
      ctx.ellipse(0, 0, l.size * 1.8, l.size * 0.65, 0, 0, TAU2);
      ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* drawing                                                             */
/* ------------------------------------------------------------------ */
function pointInDiamond(px, py, tile) {
  const hw = Math.abs(tile.right.x - tile.center.x);
  const hh = Math.abs(tile.bottom.y - tile.center.y);
  return Math.abs(px - tile.center.x) / hw + Math.abs(py - tile.center.y) / hh <= 1;
}

function tileAtScreen(px, py) {
  for (let r = ROWS - 1; r >= 0; r--) {
    for (let c = COLS - 1; c >= 0; c--) {
      const tile = tileDiamond(view, c, r, 0);
      if (pointInDiamond(px, py, tile)) return { c, r };
    }
  }
  return null;
}

function refreshScreenPositions() {
  for (const p of state.pals) p.screen = iso(view, p.x, p.y);
}

function drawGroundRings() {
  for (const p of state.pals) {
    const s = p.screen;
    const sc = view.scale;
    const selected = p.id === selectedId;
    const hovered = p.id === hoverPalId;
    if (!selected && !hovered) continue;
    ctx.save();
    ctx.translate(s.x, s.y + 2 * sc);
    ctx.scale(sc, sc);
    if (selected) {
      ctx.strokeStyle = "rgba(227,183,94,.8)";
      ctx.lineWidth = 1.6;
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = -gameTime * 8;
      ctx.beginPath();
      ctx.ellipse(0, 0, 35, 12, 0, 0, TAU2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(255,247,216,.6)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(0, 0, 40, 14, 0, 0, TAU2);
      ctx.stroke();
      // slowly orbiting fireflies
      for (let i = 0; i < 3; i++) {
        const a = gameTime * 0.8 + (i / 3) * TAU2;
        const x = Math.cos(a) * 38;
        const y = Math.sin(a) * 13 + Math.sin(a * 2.1) * 3;
        drawStar(ctx, x, y, 1.7, "#f3d17b", 0.72);
      }
    } else {
      ctx.strokeStyle = "rgba(249,238,206,.42)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 34, 11, 0, 0, TAU2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawPalEntity(p) {
  const sc = view.scale * 1.12;
  const s = p.screen;
  ctx.save();
  ctx.translate(s.x, s.y + 3 * view.scale);
  ctx.scale(sc, sc);
  drawPal(ctx, p.species, gameTime, p, { exp: undefined });
  ctx.restore();

  // name ribbon, laid on the ground in front
  const fs = Math.max(9, 9.4 * view.scale);
  ctx.save();
  ctx.font = `600 ${fs}px Fredoka, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const label = p.name;
  const width = ctx.measureText(label).width + fs * 1.6;
  const ly = s.y + 12 * view.scale;
  ctx.globalAlpha = p.id === selectedId ? 0.94 : 0.68;
  ctx.fillStyle = "rgba(252,247,231,.82)";
  ctx.beginPath();
  ctx.roundRect(s.x - width / 2, ly - fs * 0.72, width, fs * 1.42, fs);
  ctx.fill();
  ctx.fillStyle = "#5d7254";
  ctx.fillText(label, s.x, ly + 0.4);
  ctx.restore();

  // emote bubble
  const mood = moodOf(p);
  const showEmote = mood === "peckish" || mood === "sleepy" || p.id === selectedId;
  if (showEmote) {
    const ex = s.x + 27 * sc;
    const ey = s.y - 95 * sc + Math.sin(gameTime * 1.4 + p.seed * 4) * 2;
    ctx.save();
    ctx.globalAlpha = 0.92;
    if (mood === "sleepy") {
      ctx.fillStyle = "rgba(252,247,232,.85)";
      ctx.beginPath();
      ctx.arc(ex, ey, 10 * Math.max(0.7, view.scale), 0, TAU2);
      ctx.fill();
      ctx.fillStyle = "#718570";
      ctx.font = `600 ${Math.max(8, 10 * view.scale)}px Fredoka, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("z", ex - 2, ey + 3);
      ctx.fillText("z", ex + 4, ey - 5);
    } else if (mood === "peckish") {
      ctx.fillStyle = "rgba(252,247,232,.9)";
      ctx.beginPath();
      ctx.arc(ex, ey, 11 * Math.max(0.7, view.scale), 0, TAU2);
      ctx.fill();
      drawBerry(ctx, ex, ey, 5.2 * Math.max(0.7, view.scale), 0.9);
    } else {
      drawHeart(ctx, ex, ey, 3.3 * Math.max(0.7, view.scale), "#d9857e", 0.65 + Math.sin(gameTime * 2.1) * 0.18);
    }
    ctx.restore();
  }
}

function drawBuildingEntity(b) {
  const s = iso(view, b.c, b.r);
  const sc = view.scale * 1.16;
  const hovered = hoverTile && hoverTile.c === b.c && hoverTile.r === b.r;
  if (hovered && !placing) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.scale(view.scale, view.scale);
    ctx.strokeStyle = "rgba(250,239,206,.6)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, 3, 45, 15, 0, 0, TAU2);
    ctx.stroke();
    ctx.restore();
  }
  ctx.save();
  ctx.translate(s.x, s.y + 2 * view.scale);
  ctx.scale(sc, sc);
  drawBuilding(ctx, b.type, gameTime);
  ctx.restore();
}

function drawBuildOverlay() {
  if (!placing) return;
  const item = BUILDING_TYPES[placing];
  const tiles = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const tile = tileDiamond(view, c, r, 2);
      const used = occupied(c, r);
      const hovered = hoverTile && hoverTile.c === c && hoverTile.r === r;
      if (used && !hovered) continue;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(tile.top.x, tile.top.y);
      ctx.lineTo(tile.right.x, tile.right.y);
      ctx.lineTo(tile.bottom.x, tile.bottom.y);
      ctx.lineTo(tile.left.x, tile.left.y);
      ctx.closePath();
      if (hovered) {
        const valid = !used;
        ctx.fillStyle = valid ? "rgba(205,221,157,.32)" : "rgba(215,124,111,.26)";
        ctx.strokeStyle = valid ? "rgba(245,238,196,.95)" : "rgba(249,211,196,.9)";
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillStyle = "rgba(250,242,210,.06)";
        ctx.strokeStyle = "rgba(250,242,210,.24)";
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
  }
  if (hoverTile) {
    const s = iso(view, hoverTile.c, hoverTile.r);
    const valid = !occupied(hoverTile.c, hoverTile.r);
    if (valid) {
      ctx.save();
      ctx.globalAlpha = 0.62;
      ctx.translate(s.x, s.y + 2 * view.scale);
      ctx.scale(view.scale * 1.16, view.scale * 1.16);
      drawBuilding(ctx, placing, gameTime);
      ctx.restore();
      // floating + warmth hint
      ctx.save();
      ctx.font = `600 ${Math.max(9, 10 * view.scale)}px Fredoka, sans-serif`;
      ctx.fillStyle = "rgba(255,248,222,.9)";
      ctx.textAlign = "center";
      ctx.fillText(`+${item ? item.name : "cozy spot"}`, s.x, s.y - 105 * view.scale);
      ctx.restore();
    } else {
      ctx.save();
      ctx.fillStyle = "rgba(249,231,205,.92)";
      ctx.font = `600 ${Math.max(9, 10 * view.scale)}px Fredoka, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("a little crowded here", s.x, s.y - 30 * view.scale);
      ctx.restore();
    }
  }
}

function drawCollectibleEntity(c) {
  const base = iso(view, c.c, c.r);
  const x = base.x + c.jx * view.scale;
  const y = base.y + c.jy * view.scale - 6 * view.scale;
  const hover = hoverCollectibleId === c.id;
  const sc = Math.max(0.7, view.scale * (hover ? 1.25 : 1.05));
  const age = gameTime - c.born;
  const alpha = clamp(Math.min(age / 0.35, (c.ttl - age) / 1.2), 0, 1);
  ctx.save();
  ctx.globalAlpha = alpha;
  if (hover) {
    ctx.strokeStyle = "rgba(255,247,214,.75)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x, y + 8 * view.scale, 16 * view.scale, 5 * view.scale, 0, 0, TAU2);
    ctx.stroke();
  }
  ctx.translate(x, y);
  drawCollectible(ctx, c.res, gameTime + c.phase, sc);
  // glint
  drawStar(ctx, 8 * sc, -13 * sc, 1.7 * sc, "#fff3c4", 0.45 + 0.35 * Math.sin(gameTime * 2.4 + c.phase));
  ctx.restore();
}

function drawParticles() {
  for (const p of particles) {
    const life = p.life / p.max;
    const alpha = 1 - life;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    if (p.kind === "heart") {
      drawHeart(ctx, 0, 0, p.size * 1.3, p.color, alpha);
    } else if (p.kind === "star") {
      drawStar(ctx, 0, 0, p.size, p.color, alpha);
    } else if (p.kind === "leaf") {
      ctx.globalAlpha = alpha * 0.8;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 1.8, p.size * 0.65, p.rot, 0, TAU2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, TAU2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function render() {
  const t = gameTime;
  ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
  ctx.clearRect(0, 0, view.w, view.h);
  if (bgCache) ctx.drawImage(bgCache, 0, 0, view.w, view.h);
  drawBirds(ctx, view.w, view.h, t);
  drawAtmosphere(false);
  if (islandCache) ctx.drawImage(islandCache, 0, 0, view.w, view.h);
  drawBuildOverlay();
  drawGroundRings();

  const drawables = [];
  for (const b of state.buildings) {
    const s = iso(view, b.c, b.r);
    drawables.push({ y: s.y + 4, kind: "building", b });
  }
  for (const p of state.pals) {
    drawables.push({ y: p.screen.y + 8, kind: "pal", p });
  }
  drawables.sort((a, b) => a.y - b.y);
  for (const item of drawables) {
    if (item.kind === "building") drawBuildingEntity(item.b);
    else drawPalEntity(item.p);
  }

  for (const c of collectibles) drawCollectibleEntity(c);
  drawParticles();
  drawAtmosphere(true);

  // soft warm glow near the fire
  const fire = state.buildings.find((b) => b.type === "campfire");
  if (fire) {
    const s = iso(view, fire.c, fire.r);
    const glow = ctx.createRadialGradient(s.x, s.y - 15, 3, s.x, s.y - 15, 85 * view.scale);
    glow.addColorStop(0, `rgba(255,198,109,${0.09 + Math.sin(t * 5) * 0.012})`);
    glow.addColorStop(1, "rgba(255,198,109,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(s.x, s.y - 15, 85 * view.scale, 0, TAU2);
    ctx.fill();
  }
}

/* ------------------------------------------------------------------ */
/* hit testing                                                         */
/* ------------------------------------------------------------------ */
function findPalAt(px, py) {
  const sorted = [...state.pals].sort((a, b) => b.screen.y - a.screen.y);
  for (const p of sorted) {
    const sc = view.scale * 1.12;
    const cx = p.screen.x;
    const cy = p.screen.y - 52 * sc;
    const r = 54 * sc + 11;
    if ((px - cx) ** 2 + (py - cy) ** 2 <= r * r) return p;
  }
  return null;
}

function findBuildingAt(px, py) {
  const sorted = [...state.buildings].sort((a, b) => iso(view, b.c, b.r).y - iso(view, a.c, a.r).y);
  for (const b of sorted) {
    const s = iso(view, b.c, b.r);
    const sc = view.scale;
    if (px > s.x - 55 * sc && px < s.x + 55 * sc && py > s.y - 112 * sc && py < s.y + 15 * sc) return b;
  }
  return null;
}

function findCollectibleAt(px, py) {
  for (let i = collectibles.length - 1; i >= 0; i--) {
    const c = collectibles[i];
    const base = iso(view, c.c, c.r);
    const x = base.x + c.jx * view.scale;
    const y = base.y + c.jy * view.scale - 6 * view.scale;
    const r = Math.max(24, 18 * view.scale);
    if ((px - x) ** 2 + (py - y) ** 2 < r * r) return c;
  }
  return null;
}

function updateHover(px, py) {
  const wasHovering = hoverPalId || hoverCollectibleId;
  hoverPalId = null;
  hoverCollectibleId = null;
  if (!placing) hoverTile = null;
  const c = findCollectibleAt(px, py);
  if (c) {
    hoverCollectibleId = c.id;
    canvas.style.cursor = "pointer";
    return;
  }
  const p = findPalAt(px, py);
  if (p) {
    hoverPalId = p.id;
    canvas.style.cursor = "pointer";
    return;
  }
  if (!placing) {
    const b = findBuildingAt(px, py);
    if (b) {
      hoverTile = { c: b.c, r: b.r };
      canvas.style.cursor = "pointer";
      return;
    }
  }
  hoverTile = placing ? tileAtScreen(px, py) : null;
  canvas.style.cursor = placing ? (hoverTile ? "crosshair" : "default") : "default";
  if (wasHovering) canvas.style.cursor = "default";
}

/* ------------------------------------------------------------------ */
/* resources, quests and growth                                        */
/* ------------------------------------------------------------------ */
function addResource(res, amount, animate = true) {
  if (!state.resources[res] && state.resources[res] !== 0) return;
  state.resources[res] = Math.max(0, state.resources[res] + amount);
  updateResourceUI();
  if (animate && amount > 0) {
    const key = res === "berries" ? "berries" : res;
    bumpPill(key);
    const pill = res === "dew" ? ui.dewPill : res === "berries" ? ui.berryPill : ui.sparkPill;
    const r = pill.getBoundingClientRect();
    addFloatWord(r.left + r.width / 2, r.bottom + 5, `+${amount}`, res === "dew" ? "#4f8d89" : res === "berries" ? "#b55755" : "#a57b2d");
  }
}

function spendResource(res, amount) {
  if (state.resources[res] < amount) return false;
  state.resources[res] -= amount;
  updateResourceUI();
  return true;
}

function addWarmth(amount) {
  const before = hearthLevel();
  state.warmth = Math.max(0, state.warmth + amount);
  const after = hearthLevel();
  if (after > before) queueHearthGrowth(before, after);
  updateHUD();
}

function queueHearthGrowth(before, after) {
  for (let level = before + 1; level <= after; level++) {
    const hd = HEARTH_LEVELS[level - 1];
    if (!hd) continue;
    let newSpecies = null;
    if (hd.unlock && !palById(hd.unlock)) {
      const spawnSpots = { bramble: [2.7, 4.9], nimbus: [6.3, 4.8], yuzu: [0.9, 2.2] };
      const [c, r] = spawnSpots[hd.unlock] || nextOpenTileNear(4, 2, 3);
      const p = makePal(hd.unlock, c, r, {
        hunger: 82,
        joy: 90,
        energy: 84,
        xp: 0,
        level: 1
      });
      p.screen = iso(view, c, r);
      state.pals.push(p);
      newSpecies = hd.unlock;
      addFloatWord(view.cx, view.cy - 90, "a new friend!", "#55754e");
      burstAroundPal(p, "heart", 12);
    }
    levelQueue.push({ level, species: newSpecies });
  }
  updateHUD();
  save();
  if (!levelShowing) setTimeout(showNextLevel, 500);
}

function showNextLevel() {
  if (levelShowing) return;
  const next = levelQueue.shift();
  if (!next) return;
  if (!next.species) {
    showToast(`Hearth level ${next.level} · the fire burns a little brighter`, "i-home");
    if (levelQueue.length) setTimeout(showNextLevel, 450);
    return;
  }
  const spec = PAL_SPECIES[next.species];
  levelShowing = true;
  modalName = "levelup";
  closeSheets(true);
  ui.scrim.hidden = true;
  ui.levelUp.hidden = false;
  ui.levelUpTitle.textContent = `Hearth Level ${next.level}`;
  const article = spec.kind.startsWith("Moss") || spec.kind.startsWith("Cloud") || spec.kind.startsWith("Petal") || spec.kind.startsWith("Mist") ? "A" : "A";
  ui.levelUpDesc.textContent = `${spec.name}, ${article === "A" ? "a" : "a"} ${spec.kind.toLowerCase()}, has wandered in from the ferns. The Hollow made room.`;
  const c = ui.newPalArt.getContext("2d");
  const p = palById(next.species);
  drawPalPortrait(c, next.species, p, gameTime, ui.newPalArt.width);
  audio.level();
  burstAtScreen(view.w / 2, view.h * 0.42, "star", 18);
  updateHUD();
}

function closeLevelUp() {
  ui.levelUp.hidden = true;
  modalName = null;
  levelShowing = false;
  updateHUD();
  refreshPalPanel();
  save();
  if (levelQueue.length) setTimeout(showNextLevel, 380);
}

function progressQuest(kind, amount = 1) {
  const q = visibleQuest();
  if (!q) return;
  if (q.kind !== kind) {
    updateQuestUI();
    return;
  }
  if (kind === "pals" || kind === "hearthLevel" || kind === "palLevel") {
    state.questProgress = questProgressValue();
  } else {
    state.questProgress = Math.min(q.target, state.questProgress + amount);
  }
  if (state.questProgress >= q.target) {
    completeQuest();
  } else {
    updateQuestUI();
    save();
  }
}

let completing = false;
function completeQuest() {
  if (completing) return;
  const q = visibleQuest();
  if (!q) return;
  completing = true;
  const reward = q.reward || {};
  if (reward.dew) addResource("dew", reward.dew, false);
  if (reward.berries) addResource("berries", reward.berries, false);
  if (reward.sparks) addResource("sparks", reward.sparks, false);
  state.questIndex++;
  state.questProgress = 0;
  addWarmth(8);
  audio.quest();
  const label = reward.dew ? `+${reward.dew} dew` : reward.sparks ? `+${reward.sparks} sparks` : `+${reward.berries} snacks`;
  showToast(`Kindness complete · ${label}`, "i-check");
  burstAtScreen(view.cx, view.cy - 150, "star", 14);
  updateHUD();
  save();
  setTimeout(() => {
    completing = false;
    syncPassiveQuest();
  }, 520);
}

function syncPassiveQuest() {
  const q = visibleQuest();
  if (!q) return;
  if (q.kind !== "pals" && q.kind !== "hearthLevel" && q.kind !== "palLevel") return;
  const value = questProgressValue();
  if (value >= q.target) {
    state.questProgress = value;
    completeQuest();
  }
}

/* ------------------------------------------------------------------ */
/* pal care                                                           */
/* ------------------------------------------------------------------ */
function selectPal(id, silent = false) {
  const p = palById(id);
  if (!p) return;
  selectedId = id;
  dismissHint();
  ui.palPanel.hidden = false;
  p.hop = -3.5;
  refreshPalPanel();
  saveTimer = Math.min(saveTimer, 1.4);
  if (!silent) audio.click();
  if (activeSheet) closeSheets();
  setTimeout(() => refreshPalPanel(), 50);
}

function deselectPal() {
  selectedId = null;
  ui.palPanel.hidden = true;
}

function say(p, line, seconds = 4) {
  p.say = line;
  p.sayUntil = gameTime + seconds;
}

function grantPalXp(p, amount) {
  p.xp += amount;
  let leveled = false;
  while (p.level < PAL_LEVELS.length && p.xp >= PAL_LEVELS[p.level]) {
    p.level++;
    leveled = true;
    addResource("dew", 6, false);
    addWarmth(8);
    progressQuest("palLevel", 1);
    const s = palScreen(p);
    addFloatWord(s.x, s.y - 118 * view.scale, `Lv. ${p.level}`, "#8a6e9f");
    burstAroundPal(p, "star", 10);
    showToast(`${p.name} reached level ${p.level} · +6 dew`, "i-sparkles");
  }
  if (leveled) {
    audio.level();
    p.hop = -6;
  }
}

function doPet(p, shouldSound = true) {
  if (!p) return;
  if (gameTime - p.lastPet < 0.3) return;
  p.lastPet = gameTime;
  p.petting = 1.5;
  p.joy = clamp(p.joy + 6, 0, 100);
  p.hop = -3;
  addWarmth(1.2);
  state.counters.pets++;
  grantPalXp(p, 2.5);
  say(p, PAL_SPECIES[p.species].lines.pet, 4.5);
  progressQuest("pet", 1);
  burstAroundPal(p, "heart", 8);
  const s = palScreen(p);
  addFloatWord(s.x, s.y - 95 * view.scale, "a little pat", "#a55f63");
  if (shouldSound) audio.pet();
  updateHUD();
  refreshPalPanel();
  saveTimer = 1;
}

function doFeed(p, shouldSound = true) {
  if (!p) return;
  if (!spendResource("berries", 1)) {
    showToast("No snacks left. The berry bushes are working on it.", "i-berry");
    audio.error();
    return;
  }
  p.hunger = clamp(p.hunger + 28, 0, 100);
  p.joy = clamp(p.joy + 5, 0, 100);
  p.energy = clamp(p.energy + 2, 0, 100);
  p.hop = -3.4;
  p.petting = 0.5;
  addWarmth(3);
  state.counters.feeds++;
  say(p, PAL_SPECIES[p.species].lines.feed, 4.5);
  grantPalXp(p, 7);
  progressQuest("feed", 1);
  burstAroundPal(p, "leaf", 8);
  const s = palScreen(p);
  addFloatWord(s.x, s.y - 89 * view.scale, "+ tummy", "#b1654e");
  if (shouldSound) audio.feed();
  updateHUD();
  refreshPalPanel();
  saveTimer = 0.7;
}

function doPlay(p, shouldSound = true) {
  if (!p) return;
  if (!spendResource("sparks", 1)) {
    showToast("No sparks to chase. The wind chimes are making more.", "i-spark");
    audio.error();
    return;
  }
  p.joy = clamp(p.joy + 31, 0, 100);
  p.energy = clamp(p.energy - 5, 0, 100);
  p.hunger = clamp(p.hunger - 3, 0, 100);
  p.hop = -7.5;
  p.petting = 0.8;
  addWarmth(3);
  state.counters.plays++;
  say(p, PAL_SPECIES[p.species].lines.play, 4.5);
  grantPalXp(p, 7);
  progressQuest("play", 1);
  burstAroundPal(p, "star", 12);
  const s = palScreen(p);
  addFloatWord(s.x, s.y - 100 * view.scale, "wheee", "#b68530");
  if (shouldSound) audio.play();
  updateHUD();
  refreshPalPanel();
  saveTimer = 0.7;
}

function careForNeediest() {
  if (selectedId) {
    ui.palPanel.hidden = false;
    refreshPalPanel();
    return;
  }
  const sorted = [...state.pals].sort((a, b) => (a.hunger + a.joy + a.energy) - (b.hunger + b.joy + b.energy));
  if (sorted[0]) selectPal(sorted[0].id);
}

/* ------------------------------------------------------------------ */
/* collectibles and building output                                    */
/* ------------------------------------------------------------------ */
function spawnCollectible(res, c, r, amount = 1) {
  if (collectibles.length >= 8) return null;
  const item = {
    id: "c" + nextId++,
    res,
    c: clamp(c, 0.3, COLS - 0.3),
    r: clamp(r, 0.3, ROWS - 0.3),
    jx: rand(14, -14),
    jy: rand(8, -8),
    amount,
    phase: Math.random() * TAU2,
    born: gameTime,
    ttl: 85 + Math.random() * 30
  };
  collectibles.push(item);
  return item;
}

function buildingCollectible(b) {
  const data = BUILDING_TYPES[b.type];
  if (!data.produce || collectibles.length >= 8) return;
  const candidates = [
    [b.c + 0.8, b.r + 0.2], [b.c - 0.7, b.r + 0.45],
    [b.c + 0.3, b.r - 0.8], [b.c + 0.25, b.r + 0.95],
    [b.c - 0.3, b.r - 0.6], [b.c + 0.95, b.r - 0.2]
  ].filter(([c, r]) => c > 0.1 && r > 0.1 && c < COLS - 0.1 && r < ROWS - 0.1);
  const [c, r] = candidates.length ? pick(candidates) : [b.c, b.r];
  spawnCollectible(data.produce.res, c, r, data.produce.amount);
}

function collectItem(item) {
  if (!item) return;
  const idx = collectibles.findIndex((c) => c.id === item.id);
  if (idx < 0) return;
  collectibles.splice(idx, 1);
  addResource(item.res, item.amount, true);
  state.counters.collects++;
  addWarmth(0.6);
  progressQuest("collect", 1);
  const base = iso(view, item.c, item.r);
  const x = base.x + item.jx * view.scale;
  const y = base.y + item.jy * view.scale - 6 * view.scale;
  burstAtScreen(x, y, "star", 8);
  const label = item.res === "dew" ? "dew" : item.res === "berries" ? "snack" : "spark";
  const color = item.res === "dew" ? "#4f8d89" : item.res === "berries" ? "#b55755" : "#a57b2d";
  addFloatWord(x, y - 8, `+${item.amount} ${label}`, color);
  audio.collect();
  updateHUD();
  saveTimer = 1.2;
}

function placeBuildingAt(c, r) {
  if (!placing) return;
  const data = BUILDING_TYPES[placing];
  if (!data) return;
  if (occupied(c, r)) {
    showToast("That patch is already spoken for.", "i-leaf");
    audio.error();
    return;
  }
  if (state.resources.dew < data.cost) {
    showToast("Not quite enough dew. Tap the treasures in the grass.", "i-dew");
    audio.error();
    return;
  }
  spendResource("dew", data.cost);
  const b = makeBuilding(placing, c, r, data.produce ? data.produce.interval * 0.5 : null);
  state.buildings.push(b);
  placing = null;
  builtAtLeastOne = true;
  hidePlacementBar();
  ui.buildBtn.classList.remove("active");
  const s = iso(view, c, r);
  burstAtScreen(s.x, s.y - 28 * view.scale, "leaf", 14);
  addFloatWord(s.x, s.y - 62 * view.scale, "+ a cozy spot", "#5f7b4d");
  addWarmth(14);
  progressQuest("build", 1);
  audio.build();
  showToast(`${data.name} settled into the Hollow.`, "i-home");
  updateHUD();
  refreshPalPanel();
  save();
  if (state.questIndex < QUESTS.length && visibleQuest()?.kind === "build") {
    // quest may already be completed; keep the flow quick
  }
}

/* ------------------------------------------------------------------ */
/* build · pals · journal sheets                                       */
/* ------------------------------------------------------------------ */
function drawBuildingThumb(canvasEl, type) {
  const c = canvasEl.getContext("2d");
  const w = canvasEl.width;
  const h = canvasEl.height;
  c.clearRect(0, 0, w, h);
  c.save();
  c.translate(w / 2, h - 5);
  const s = Math.min(w / 155, h / 105) * 0.92;
  c.scale(s, s);
  drawBuilding(c, type, gameTime + 1.7);
  c.restore();
}

function drawPalThumb(canvasEl, species, pal) {
  const c = canvasEl.getContext("2d");
  const w = canvasEl.width;
  const h = canvasEl.height;
  c.clearRect(0, 0, w, h);
  const grad = c.createRadialGradient(w * 0.5, h * 0.8, 2, w * 0.5, h * 0.8, w * 0.6);
  grad.addColorStop(0, "rgba(224,234,201,.8)");
  grad.addColorStop(1, "rgba(224,234,201,0)");
  c.fillStyle = grad;
  c.fillRect(0, 0, w, h);
  c.save();
  c.translate(w / 2, h * 0.85);
  const s = Math.min(w / 180, h / 135);
  c.scale(s, s);
  drawPal(c, species, gameTime + 1.4, pal, { exp: pal ? undefined : "happy" });
  c.restore();
}

function openSheet(name) {
  closeSheets(true);
  activeSheet = name;
  ui.scrim.hidden = false;
  if (selectedId) ui.palPanel.hidden = true;
  if (name === "build") {
    renderBuildList();
    ui.buildSheet.hidden = false;
    ui.buildBtn.classList.add("active");
  } else if (name === "pals") {
    renderPalsGrid();
    ui.palsSheet.hidden = false;
  } else if (name === "journal") {
    renderJournal();
    ui.journalSheet.hidden = false;
  }
  audio.resume();
  audio.click();
}

function closeSheets(keepPenalty = false) {
  if (!activeSheet) {
    if (!keepPenalty) ui.scrim.hidden = true;
    return;
  }
  activeSheet = null;
  ui.buildSheet.hidden = true;
  ui.palsSheet.hidden = true;
  ui.journalSheet.hidden = true;
  ui.buildBtn.classList.remove("active");
  ui.scrim.hidden = true;
  if (selectedId && !modalName) ui.palPanel.hidden = false;
}

function renderBuildList() {
  ui.buildList.innerHTML = "";
  for (const id of BUILDABLE) {
    const data = BUILDING_TYPES[id];
    const owned = state.buildings.filter((b) => b.type === id).length;
    const canAfford = state.resources.dew >= data.cost;
    const btn = document.createElement("button");
    btn.className = `build-card${canAfford ? "" : " unaffordable"}${placing === id ? " selected" : ""}`;
    btn.dataset.build = id;
    btn.setAttribute("aria-label", `${data.name}, ${data.cost} dew. ${data.effect}`);
    btn.innerHTML = `
      <canvas class="build-thumb" width="180" height="112"></canvas>
      ${owned ? `<span class="owned-tag">${owned} in hollow</span>` : ""}
      <h4>${data.name}</h4>
      <p>${data.effect}</p>
      <span class="build-cost ${canAfford ? "" : "short"}"><svg><use href="#i-dew"></use></svg>${data.cost}</span>`;
    ui.buildList.appendChild(btn);
    drawBuildingThumb(btn.querySelector("canvas"), id);
    btn.addEventListener("click", () => chooseBuild(id));
  }
}

function chooseBuild(id) {
  const data = BUILDING_TYPES[id];
  if (state.resources.dew < data.cost) {
    showToast("Not enough dew yet. Press the floating treasures to gather more.", "i-dew");
    audio.error();
    return;
  }
  placing = id;
  builtAtLeastOne = false;
  closeSheets();
  ui.palPanel.hidden = true;
  ui.placementName.textContent = data.name;
  ui.placementBar.hidden = false;
  drawBuildingThumb(ui.placementThumb, id);
  ui.buildBtn.classList.add("active");
  ui.buildSheet.classList.add("placing");
  hoverTile = null;
  dismissHint();
  audio.click();
  if (view.w < 880) {
    showToast(`Tap any glowing patch to place ${data.name.toLowerCase()}.`, "i-home");
  }
}

function hidePlacementBar() {
  ui.placementBar.hidden = true;
  ui.buildSheet.classList.remove("placing");
}

function cancelPlacing() {
  if (!placing) return;
  placing = null;
  hoverTile = null;
  hidePlacementBar();
  ui.buildBtn.classList.remove("active");
  if (selectedId) ui.palPanel.hidden = false;
  audio.click();
}

function renderPalsGrid() {
  const order = ["mallow", "taro", "juniper", "bramble", "nimbus", "yuzu"];
  ui.palsGrid.innerHTML = "";
  for (const species of order) {
    const spec = PAL_SPECIES[species];
    const pal = palById(species);
    const card = document.createElement("button");
    const locked = !pal;
    const unlockLevel = species === "bramble" ? 2 : species === "nimbus" ? 3 : species === "yuzu" ? 4 : 1;
    card.className = `pal-card${locked ? " locked" : ""}${selectedId === species ? " active" : ""}`;
    card.dataset.species = species;
    card.disabled = locked;
    if (locked) {
      card.innerHTML = `
        <div class="lock-wrap"><svg><use href="#i-lock"></use></svg><span>Hearth lv. ${unlockLevel}</span></div>`;
    } else {
      const mood = moodOf(pal);
      const moodClass = mood === "peckish" || mood === "sleepy" ? "warn" : mood === "lonely" ? "bad" : "";
      card.innerHTML = `
        <span class="pc-level">Lv. ${pal.level}</span>
        <span class="pc-mood ${moodClass}"></span>
        <canvas class="pal-card-canvas" width="180" height="130"></canvas>
        <h4>${pal.name}</h4>
        <p class="pc-sub">${spec.kind} · ${mood}</p>
        <div class="pc-needs"><i><span style="width:${pal.hunger}%"></span></i><i><span style="width:${pal.joy}%"></span></i><i><span style="width:${pal.energy}%"></span></i></div>`;
      drawPalThumb(card.querySelector("canvas"), species, pal);
    }
    card.addEventListener("click", () => {
      if (locked) return;
      closeSheets();
      selectPal(species);
    });
    ui.palsGrid.appendChild(card);
  }
  ui.palsSub.textContent = `${state.pals.length} friends found. ${6 - state.pals.length ? "There is still room by the fire." : "The whole little family is here."}`;
}

function renderJournal() {
  ui.statXp.textContent = Math.round(state.warmth);
  ui.statBuildings.textContent = state.buildings.length;
  ui.statPals.textContent = state.pals.length;
  ui.statPets.textContent = state.counters.pets;
  ui.statFeeds.textContent = state.counters.feeds;

  const c = ui.journalArt.getContext("2d");
  const w = ui.journalArt.width;
  const h = ui.journalArt.height;
  c.clearRect(0, 0, w, h);
  const sky = c.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#c4d7bf");
  sky.addColorStop(0.65, "#eee0b9");
  sky.addColorStop(1, "#ddcda6");
  c.fillStyle = sky;
  c.fillRect(0, 0, w, h);
  c.fillStyle = "rgba(255,242,192,.7)";
  c.beginPath();
  c.arc(w * 0.78, h * 0.27, 22, 0, TAU2);
  c.fill();
  c.fillStyle = "#a8ba8f";
  c.beginPath();
  c.ellipse(w * 0.24, h * 0.75, 150, 45, 0, 0, TAU2);
  c.ellipse(w * 0.68, h * 0.83, 200, 56, 0, 0, TAU2);
  c.fill();
  c.fillStyle = "#8da66f";
  c.beginPath();
  c.ellipse(w * 0.55, h * 1.02, 330, 110, 0, 0, TAU2);
  c.fill();
  c.save();
  c.translate(w * 0.39, h * 0.92);
  c.scale(0.92, 0.92);
  drawBuilding(c, "campfire", gameTime);
  c.restore();
  const pals = state.pals.slice(0, 3);
  pals.forEach((p, i) => {
    c.save();
    c.translate(w * (0.57 + i * 0.13), h * (0.94 + (i % 2) * 0.02));
    c.scale(0.66, 0.66);
    drawPal(c, p.species, gameTime + i, p);
    c.restore();
  });
  c.fillStyle = "rgba(38,57,38,.35)";
  for (let i = 0; i < 5; i++) {
    c.beginPath();
    c.arc(30 + i * 44, 20 + (i % 2) * 8, 2.5, 0, TAU2);
    c.fill();
  }
  drawWelcomeArt();
}

function drawWelcomeArt() {
  const c = ui.welcomeArt.getContext("2d");
  const w = ui.welcomeArt.width;
  const h = ui.welcomeArt.height;
  c.clearRect(0, 0, w, h);
  const sky = c.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#c5d9c0");
  sky.addColorStop(1, "#f3e2ba");
  c.fillStyle = sky;
  c.fillRect(0, 0, w, h);
  c.fillStyle = "rgba(255,244,204,.8)";
  c.beginPath();
  c.arc(w * 0.78, h * 0.22, 20, 0, TAU2);
  c.fill();
  c.fillStyle = "#abbb93";
  c.beginPath();
  c.ellipse(w * 0.48, h * 0.88, 230, 60, 0, 0, TAU2);
  c.fill();
  c.fillStyle = "#91ac76";
  c.beginPath();
  c.ellipse(w * 0.48, h * 1.06, 320, 100, 0, 0, TAU2);
  c.fill();
  c.save();
  c.translate(w * 0.29, h * 0.88);
  c.scale(0.72, 0.72);
  drawBuilding(c, "campfire", gameTime);
  c.restore();
  state.pals.slice(0, 3).forEach((p, i) => {
    c.save();
    c.translate(w * (0.48 + i * 0.16), h * (0.9 + (i % 2) * 0.03));
    c.scale(0.62, 0.62);
    drawPal(c, p.species, gameTime + i * 0.4, p);
    c.restore();
  });
  c.fillStyle = "rgba(255,255,255,.35)";
  for (let i = 0; i < 6; i++) {
    c.beginPath();
    c.arc(20 + i * 83, 18 + (i % 3) * 6, 1.6, 0, TAU2);
    c.fill();
  }
}

function openWelcome() {
  closeSheets(true);
  modalName = "welcome";
  ui.scrim.hidden = false;
  ui.welcomeCard.hidden = false;
  drawWelcomeArt();
  audio.click();
}

function closeWelcome() {
  ui.welcomeCard.hidden = true;
  modalName = null;
  ui.scrim.hidden = true;
  if (selectedId) ui.palPanel.hidden = false;
}

function openConfirmReset() {
  closeSheets(true);
  modalName = "confirm";
  ui.scrim.hidden = false;
  ui.confirmCard.hidden = false;
  audio.click();
}

function closeConfirmReset() {
  ui.confirmCard.hidden = true;
  modalName = null;
  ui.scrim.hidden = true;
  if (selectedId) ui.palPanel.hidden = false;
}

function resetGame() {
  resetting = true;
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {}
  window.location.reload();
}

/* ------------------------------------------------------------------ */
/* main update                                                         */
/* ------------------------------------------------------------------ */
function updateParticles(dt) {
  for (const p of particles) {
    p.life += dt;
    p.vy += p.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rot += p.spin * dt;
    p.vx *= 0.985;
  }
  particles = particles.filter((p) => p.life < p.max);
}

function updatePal(p, dt) {
  p.petting = Math.max(0, p.petting - dt);
  p.hop += (0 - p.hop) * Math.min(1, dt * 7);
  p.screen = iso(view, p.x, p.y);

  const joyAura = state.buildings.filter((b) => BUILDING_TYPES[b.type].aura === "joy").length;
  const restAura = state.buildings.filter((b) => BUILDING_TYPES[b.type].aura === "rest").length;
  const snackAura = state.buildings.filter((b) => b.type === "garden").length;

  if (p.sleeping) {
    p.energy = clamp(p.energy + dt * 4.2, 0, 100);
    p.joy = clamp(p.joy - dt * 0.015, 0, 100);
    if (p.energy > 68) {
      p.sleeping = false;
      p.idle = 0.5;
    }
    return;
  }

  p.hunger = clamp(p.hunger - dt * (0.066 - snackAura * 0.008), 0, 100);
  p.joy = clamp(p.joy - dt * (0.052 - joyAura * 0.006), 0, 100);
  p.energy = clamp(p.energy - dt * (0.045 - restAura * 0.006), 0, 100);
  if (p.hunger < 22) p.joy = clamp(p.joy - dt * 0.024, 0, 100);
  if (p.energy < 9) {
    p.sleeping = true;
    p.moving = false;
    p.hop = 0;
  }

  if (p.moving) {
    const dx = p.tx - p.x;
    const dy = p.ty - p.y;
    const dist = Math.hypot(dx, dy);
    const speed = 0.58;
    if (dist < 0.035) {
      p.x = p.tx;
      p.y = p.ty;
      p.moving = false;
      p.idle = rand(5.5, 2.1);
    } else {
      p.x += (dx / dist) * speed * dt;
      p.y += (dy / dist) * speed * dt;
    }
  } else {
    p.idle -= dt;
    if (p.idle <= 0) {
      const angle = Math.random() * TAU2;
      const dist = rand(1.6, 0.6);
      let c = p.x + Math.cos(angle) * dist;
      let r = p.y + Math.sin(angle) * dist;
      c = clamp(c, 0.45, COLS - 0.45);
      r = clamp(r, 0.45, ROWS - 0.45);
      if (occupied(Math.round(c), Math.round(r))) {
        [c, r] = nextOpenTileNear(c, r, 2);
        c += rand(0.25, -0.25);
        r += rand(0.2, -0.2);
      }
      p.tx = clamp(c, 0.4, COLS - 0.4);
      p.ty = clamp(r, 0.4, ROWS - 0.4);
      p.moving = true;
      p.idle = rand(5, 2.4);
    }
  }
}

function updateGame(dt) {
  gameTime += dt;
  refreshScreenPositions();
  for (const p of state.pals) updatePal(p, dt);

  // building production
  for (const b of state.buildings) {
    const data = BUILDING_TYPES[b.type];
    if (data.produce && b.readyIn !== null) {
      b.readyIn -= dt;
      if (b.readyIn <= 0) {
        b.readyIn += data.produce.interval;
        buildingCollectible(b);
      }
    }
  }

  // ambient generosity keeps the hollow moving
  ambientTimer -= dt;
  if (ambientTimer <= 0) {
    ambientTimer = 13 + Math.random() * 9;
    if (collectibles.length < 3) {
      const open = [];
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (!occupied(c, r)) open.push([c, r]);
        }
      }
      if (open.length) {
        const [c, r] = pick(open);
        spawnCollectible(pick(["dew", "berries", "sparks"]), c, r, 1);
      }
    }
  }

  // expire uncollected treasure gently
  collectibles = collectibles.filter((c) => gameTime - c.born < c.ttl);

  updateParticles(dt);

  if (gameTime - lastUi > 0.55) {
    lastUi = gameTime;
    updateHUD();
    if (selectedId) refreshPalPanel();
    syncPassiveQuest();
  }

  // portrait blink at a lazy clip
  if (selectedId && gameTime - lastPortrait > 0.35) {
    lastPortrait = gameTime;
    const p = palById(selectedId);
    if (p) drawPalPortrait(ui.palPortrait.getContext("2d"), p.species, p, gameTime, ui.palPortrait.width);
  }

  saveTimer -= dt;
  if (saveTimer <= 0) {
    saveTimer = 16;
    save();
  }
}

function loop(now) {
  const dt = Math.min(0.05, (now - lastFrame) / 1000 || 0.016);
  lastFrame = now;
  updateGame(dt);
  render();
  requestAnimationFrame(loop);
}

/* ------------------------------------------------------------------ */
/* pointer + keyboard interactions                                     */
/* ------------------------------------------------------------------ */
function pointerPos(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function handlePlacementAt(x, y) {
  const tile = tileAtScreen(x, y);
  if (!tile) {
    showToast("Choose a patch of green inside the Hollow.", "i-leaf");
    return;
  }
  placeBuildingAt(tile.c, tile.r);
}

function onPointerDown(e) {
  if (e.button !== undefined && e.button !== 0) return;
  audio.resume();
  if (modalName) return;
  if (activeSheet) return;
  const { x, y } = pointerPos(e);
  audio.click();

  if (placing) {
    hoverTile = tileAtScreen(x, y);
    handlePlacementAt(x, y);
    return;
  }

  const treasure = findCollectibleAt(x, y);
  if (treasure) {
    collectItem(treasure);
    return;
  }
  const pal = findPalAt(x, y);
  if (pal) {
    selectPal(pal.id, true);
    return;
  }
  const building = findBuildingAt(x, y);
  if (building) {
    const data = BUILDING_TYPES[building.type];
    showToast(`${data.name} · ${data.effect}`, "i-home");
    const s = iso(view, building.c, building.r);
    burstAtScreen(s.x, s.y - 40 * view.scale, "leaf", 3);
    return;
  }
  const tile = tileAtScreen(x, y);
  if (tile) {
    dismissHint();
    emitCanvasParticles(x, y, "star", 2, "#f5e7b8");
  }
}

function onPointerMove(e) {
  if (e.pointerType === "touch") return;
  const { x, y } = pointerPos(e);
  updateHover(x, y);
}

function onPointerLeave() {
  hoverPalId = null;
  hoverCollectibleId = null;
  if (!placing) hoverTile = null;
  canvas.style.cursor = "default";
}

function onKeyDown(e) {
  if (e.key === "Escape") {
    if (modalName === "levelup") closeLevelUp();
    else if (modalName === "welcome") closeWelcome();
    else if (modalName === "confirm") closeConfirmReset();
    else if (activeSheet) closeSheets();
    else if (placing) cancelPlacing();
    else if (selectedId) deselectPal();
    return;
  }
  if (e.target && (e.target.tagName === "BUTTON" || e.target.tagName === "INPUT")) return;
  if (e.key === "b" || e.key === "B") openSheet("build");
  if (e.key === "p" || e.key === "P") openSheet("pals");
  if (e.key === "j" || e.key === "J") openSheet("journal");
  if (e.key === "c" || e.key === "C") careForNeediest();
  if (e.key === "1") doFeed(palById(selectedId));
  if (e.key === "2") doPlay(palById(selectedId));
  if (e.key === "3") doPet(palById(selectedId));
}

/* ------------------------------------------------------------------ */
/* wiring                                                              */
/* ------------------------------------------------------------------ */
ui.scrim.addEventListener("click", () => {
  if (modalName === "welcome") closeWelcome();
  else if (modalName === "confirm") closeConfirmReset();
  else closeSheets();
});

ui.buildBtn.addEventListener("click", () => {
  if (activeSheet === "build") closeSheets();
  else openSheet("build");
});
ui.careBtn.addEventListener("click", careForNeediest);
ui.palsBtn.addEventListener("click", () => {
  if (activeSheet === "pals") closeSheets();
  else openSheet("pals");
});
ui.journalBtn.addEventListener("click", () => {
  if (activeSheet === "journal") closeSheets();
  else openSheet("journal");
});
ui.buildClose.addEventListener("click", () => closeSheets());
ui.palsClose.addEventListener("click", () => closeSheets());
ui.journalClose.addEventListener("click", () => closeSheets());
ui.palsCare.addEventListener("click", () => {
  closeSheets();
  careForNeediest();
});
ui.palClose.addEventListener("click", deselectPal);
ui.placementCancel.addEventListener("click", cancelPlacing);
ui.cancelBuild.addEventListener("click", cancelPlacing);
ui.feedBtn.addEventListener("click", () => doFeed(palById(selectedId)));
ui.playBtn.addEventListener("click", () => doPlay(palById(selectedId)));
ui.petBtn.addEventListener("click", () => {
  const p = palById(selectedId);
  if (!p) return;
  doPet(p);
  const btn = ui.petBtn;
  btn.animate([{ transform: "scale(1)" }, { transform: "scale(1.07)" }, { transform: "scale(1)" }], { duration: 300, easing: "ease-out" });
});
ui.soundBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleSound();
});
ui.helpBtn.addEventListener("click", openWelcome);
ui.welcomeBtn.addEventListener("click", closeWelcome);
ui.welcomeLater.addEventListener("click", closeWelcome);
ui.mobileHearth.addEventListener("click", () => openSheet("journal"));
ui.mobileQuest.addEventListener("click", () => openSheet("journal"));
ui.hearthInfo.addEventListener("click", () => openSheet("journal"));
ui.questCard.addEventListener("click", () => openSheet("journal"));
ui.levelUpBtn.addEventListener("click", closeLevelUp);
ui.resetBtn.addEventListener("click", openConfirmReset);
ui.cancelReset.addEventListener("click", closeConfirmReset);
ui.confirmReset.addEventListener("click", resetGame);
ui.dewPill.addEventListener("click", () => showToast("Dewdrops build cozy things. Tap floating drops to gather more.", "i-dew"));
ui.berryPill.addEventListener("click", () => showToast("Snacks fill little tummies. Tap bushes and berry bubbles.", "i-berry"));
ui.sparkPill.addEventListener("click", () => showToast("Sparks are for play. Story stumps and chimes make more.", "i-spark"));
ui.hintClose.addEventListener("click", (e) => {
  e.stopPropagation();
  dismissHint();
});

canvas.addEventListener("pointerdown", onPointerDown);
canvas.addEventListener("pointermove", onPointerMove);
canvas.addEventListener("pointerleave", onPointerLeave);
canvas.addEventListener("contextmenu", (e) => e.preventDefault());
window.addEventListener("keydown", onKeyDown);
window.addEventListener("resize", resize);
window.visualViewport?.addEventListener("resize", resize);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) save();
});
window.addEventListener("pagehide", save);

/* ------------------------------------------------------------------ */
/* boot                                                                */
/* ------------------------------------------------------------------ */
function boot() {
  if (state.audio === false) {
    audio.setEnabled(false);
    ui.soundBtn.classList.add("muted");
    ui.soundBtn.querySelector("use").setAttribute("href", "#i-mute");
    ui.soundBtn.setAttribute("aria-label", "Enable sound");
  } else {
    audio.setEnabled(true);
  }
  if (hintDismissed) ui.sceneHint.hidden = true;
  resize();
  refreshScreenPositions();
  updateHUD();
  updateResourceUI();
  if (!hintDismissed) {
    ui.sceneHint.hidden = false;
  }

  // a few welcome gifts already glowing in the grass
  spawnCollectible("dew", 6.45, 2.1, 2);
  spawnCollectible("berries", 3.3, 5.15, 2);
  spawnCollectible("sparks", 0.9, 2.7, 1);

  if (state.pals.length) {
    const first = state.pals[0];
    first.screen = iso(view, first.x, first.y);
  }
  document.fonts?.ready.then(() => {
    resize();
  });
  lastFrame = performance.now();
  requestAnimationFrame(loop);
  window.__mosslight = { state, view, iso, tileAtScreen, get collectibles() { return collectibles; }, spawnCollectible, selectPal, save, doPet, doFeed, doPlay, get gameTime() { return gameTime; } };
}

boot();

