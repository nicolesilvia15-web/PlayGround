export const TILE_W = 116;
export const TILE_H = 58;
export const COLS = 8;
export const ROWS = 6;

export const HEARTH_LEVELS = [
  { level: 1, name: "Sprout", min: 0, next: 26, unlock: null },
  { level: 2, name: "Sapling", min: 26, next: 72, unlock: "bramble" },
  { level: 3, name: "Grove", min: 72, next: 146, unlock: "nimbus" },
  { level: 4, name: "Haven", min: 146, next: 248, unlock: "yuzu" },
  { level: 5, name: "Beacon", min: 248, next: 380, unlock: null },
  { level: 6, name: "Heartwood", min: 380, next: null, unlock: null }
];

export const PAL_SPECIES = {
  mallow: {
    id: "mallow",
    name: "Mallow",
    kind: "Moss bun",
    body: "#f1dec0",
    accent: "#e8b0a6",
    flavor: "A soft-hearted forager with a leaf that perks up when she is happy.",
    lines: {
      happy: "“The sun found our patch again today.”",
      content: "“Is it okay if I sit here a while?”",
      hungry: "“My tummy is making a very small thunder.”",
      sleepy: "“Just resting my eyes. Definitely not napping.”",
      lowjoy: "“Do you think the quiet will last forever?”",
      pet: "“Oh! That is the good spot behind my ears.”",
      feed: "“Mmf. Yes. Perfectly squishy.”",
      play: "“Catch me! No — I'll catch you!”"
    }
  },
  taro: {
    id: "taro",
    name: "Taro",
    kind: "Cloud pup",
    body: "#c9dfd2",
    accent: "#a6c9c2",
    flavor: "A drifting daydream in the shape of a pup. Has never once hurried.",
    lines: {
      happy: "“I dreamed the clouds were made of warm rice.”",
      content: "“The wind smells like rain and old books.”",
      hungry: "“A snack would fit right in this little cloud.”",
      sleepy: "“Mmm... five more minutes of floating...”",
      lowjoy: "“The sky feels a bit far away today.”",
      pet: "“Mmm. I am becoming a puddle.”",
      feed: "“Oh! It is a cloud inside my cloud.”",
      play: "“I will chase it! Slowly. Very slowly.”"
    }
  },
  juniper: {
    id: "juniper",
    name: "Juniper",
    kind: "Petal hog",
    body: "#eec297",
    accent: "#d8917c",
    flavor: "Collects flower petals and brave opinions. Fiercely small.",
    lines: {
      happy: "“I found a beetle wearing a tiny hat!”",
      content: "“This is my favorite patch. I have decided.”",
      hungry: "“Important business requires at least two berries.”",
      sleepy: "“I am not tired, I am simply blinking slowly.”",
      lowjoy: "“Everyone is being too quiet. I don't like it.”",
      pet: "“You may continue. I am being brave about it.”",
      feed: "“A very sensible snack. Ten out of ten.”",
      play: "“Race you! I will win by being rounder!”"
    }
  },
  bramble: {
    id: "bramble",
    name: "Bramble",
    kind: "Mushroom cat",
    body: "#cbb7d6",
    accent: "#a97e9d",
    flavor: "A shy mushroom cat who followed the smell of soup and decided to stay.",
    lines: {
      happy: "“The ferns are singing. I think. It might be my tummy.”",
      content: "“I hid here yesterday. I think I'll keep hiding here.”",
      hungry: "“A small soup? Only if it isn't any trouble.”",
      sleepy: "“Cats can sleep in mushrooms. It's a rule.”",
      lowjoy: "“Please don't go. The quiet is too big.”",
      pet: "“Oh. The top of my cap. That's the spot.”",
      feed: "“This tastes like being brave.”",
      play: "“I'll catch it... eventually... maybe.”"
    }
  },
  nimbus: {
    id: "nimbus",
    name: "Nimbus",
    kind: "Mist drake",
    body: "#bfd9da",
    accent: "#8cb9be",
    flavor: "A tiny storm dragon with very big sneezes and a heart of warm fog.",
    lines: {
      happy: "“I made a rainbow in the kettle steam!”",
      content: "“I am guarding this rock. It is a very good rock.”",
      hungry: "“Even a small dragon gets a rumbly tummy.”",
      sleepy: "“My wings have gone all sleepy.”",
      lowjoy: "“I can be loud if you need me to be.”",
      pet: "“Ah— careful, I might sneeze sparkles.”",
      feed: "“Roasted berry. Delicious. Slightly smoky.”",
      play: "“I will do a fearsome pounce! Rawr.”"
    }
  },
  yuzu: {
    id: "yuzu",
    name: "Yuzu",
    kind: "Dew snail",
    body: "#ebcd8a",
    accent: "#bc8d68",
    flavor: "A patient old soul carrying a tiny garden on her back.",
    lines: {
      happy: "“The moss is doing extremely well today.”",
      content: "“I have been looking at this leaf for an hour.”",
      hungry: "“A berry, slowly eaten, is a berry twice enjoyed.”",
      sleepy: "“Snails dream in spirals, you know.”",
      lowjoy: "“I feel a little... shrunk today.”",
      pet: "“Ah. The shell. You found the warm spot.”",
      feed: "“A picnic. How civilized.”",
      play: "“I shall race you by eleven inches.”"
    }
  }
};

export const BUILDING_TYPES = {
  campfire: {
    id: "campfire",
    name: "Kettle Fire",
    desc: "Keeps spirits toasty and kettles whispering.",
    effect: "Joy drifts down more slowly nearby.",
    cost: 0,
    unique: true,
    aura: "joy"
  },
  nest: {
    id: "nest",
    name: "Cloud Nest",
    desc: "A woven bed with the softest blanket.",
    effect: "Tired pals recover their rest faster.",
    cost: 0,
    unique: true,
    aura: "rest"
  },
  garden: {
    id: "garden",
    name: "Snack Patch",
    desc: "Stubborn vegetables in a crooked planter.",
    effect: "Grows a snack every 18 seconds.",
    cost: 0,
    unique: true,
    produce: { res: "berries", amount: 2, interval: 18 }
  },
  glowbush: {
    id: "glowbush",
    name: "Glowberry Bush",
    desc: "The berries hum when nobody is looking.",
    effect: "Grows 2 snacks every 14 seconds.",
    cost: 18,
    produce: { res: "berries", amount: 2, interval: 14 }
  },
  rainbarrel: {
    id: "rainbarrel",
    name: "Rain Catcher",
    desc: "An old tub that collects the kind of rain that stays.",
    effect: "Gathers 2 dew every 16 seconds.",
    cost: 24,
    produce: { res: "dew", amount: 2, interval: 16 }
  },
  storystump: {
    id: "storystump",
    name: "Story Stump",
    desc: "A ringed old stump, a lantern, and one good book.",
    effect: "Collects 1 spark every 20 seconds.",
    cost: 28,
    produce: { res: "sparks", amount: 1, interval: 20 }
  },
  windchime: {
    id: "windchime",
    name: "Bottle Chimes",
    desc: "Old glass singing to the new wind.",
    effect: "Collects 1 spark every 22 seconds.",
    cost: 20,
    produce: { res: "sparks", amount: 1, interval: 22 }
  },
  spa: {
    id: "spa",
    name: "Mossy Spa",
    desc: "A warm spring with room for three small toes.",
    effect: "Pals nearby feel calmer and sleep better.",
    cost: 38,
    aura: "rest"
  },
  lantern: {
    id: "lantern",
    name: "Hush Lantern",
    desc: "A little light for the long, soft evenings.",
    effect: "Makes the whole Hollow a touch more joyful.",
    cost: 14,
    aura: "joy"
  }
};

export const BUILDABLE = ["glowbush", "rainbarrel", "windchime", "storystump", "lantern", "spa"];

export const QUESTS = [
  {
    kind: "pet",
    target: 2,
    title: "A gentle hello",
    desc: "Give a pal two soft pats. Everyone is a little shy after the Hush.",
    reward: { dew: 8 }
  },
  {
    kind: "feed",
    target: 2,
    title: "Little bellies",
    desc: "Share two snacks. Food is a love letter with crumbs on it.",
    reward: { dew: 10, berries: 2 }
  },
  {
    kind: "build",
    target: 1,
    title: "Make it home",
    desc: "Place one new cozy spot in the Hollow. Crooked is perfectly fine.",
    reward: { dew: 16, sparks: 1 }
  },
  {
    kind: "play",
    target: 2,
    title: "A little nonsense",
    desc: "Play twice. Chasing nothing in particular is important work.",
    reward: { berries: 3, dew: 12 }
  },
  {
    kind: "palLevel",
    target: 1,
    title: "Grow a friendship",
    desc: "Help any pal reach level 2. Small hearts take time to unfurl.",
    reward: { sparks: 2, dew: 18 }
  },
  {
    kind: "pals",
    target: 4,
    title: "A full chorus",
    desc: "Welcome a fourth pal to the Hollow. There is always room by the fire.",
    reward: { dew: 24, berries: 4 }
  },
  {
    kind: "collect",
    target: 8,
    title: "Glimmer gathering",
    desc: "Tap eight floating treasures. The Hollow leaves little gifts in the grass.",
    reward: { dew: 28, sparks: 2 }
  },
  {
    kind: "hearthLevel",
    target: 3,
    title: "A warmer hearth",
    desc: "Grow the Hollow to Hearth level 3. Warmth gathers where kindness does.",
    reward: { dew: 40, berries: 5, sparks: 3 }
  }
];

export const RESOURCE_META = {
  dew: { label: "Dewdrops", icon: "i-dew", color: "#62a8a4" },
  berries: { label: "Snacks", icon: "i-berry", color: "#d86966" },
  sparks: { label: "Sparks", icon: "i-spark", color: "#e8b257" }
};

export const MOOD_LINES = {
  radiant: "radiant",
  content: "content",
  peckish: "peckish",
  sleepy: "sleepy",
  lonely: "lonely"
};

export const PAL_LEVELS = [0, 24, 64, 120, 190, 280];

export const SAVE_KEY = "mosslight-hollow-v1";
