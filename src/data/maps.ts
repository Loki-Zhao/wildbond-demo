import type { MapDefinition } from "../game/types";

export const MAPS: MapDefinition[] = [
  {
    id: "meadow",
    name: "青芽草原",
    element: "forest",
    width: 80,
    height: 60,
    encounterRate: 0.05,
    rareRate: 0.09,
    bossSpeciesId: "ancient-stag",
    bossName: "古木鹿王投影",
    camp: { x: 8, y: 8 },
    boss: { x: 72, y: 52 },
    palette: {
      ground: "#7bbf68",
      path: "#d2b978",
      hazard: "#5a9f55",
      water: "#5ab4c8",
      deco: "#356b38"
    },
    encounters: [
      { speciesId: "grass-mouse", weight: 18 },
      { speciesId: "moss-turtle", weight: 15 },
      { speciesId: "flower-deer", weight: 12 },
      { speciesId: "leaf-monkey", weight: 10 },
      { speciesId: "bubble-dolphin", weight: 10 },
      { speciesId: "bluefin-rabbit", weight: 8 },
      { speciesId: "wind-chime-sparrow", weight: 10 },
      { speciesId: "cloud-rabbit", weight: 8 },
      { speciesId: "honeybud-fox", weight: 4 },
      { speciesId: "vine-bear", weight: 3 },
      { speciesId: "thorn-panther", weight: 2 }
    ]
  },
  {
    id: "coast",
    name: "潮汐海岸",
    element: "water",
    width: 90,
    height: 64,
    encounterRate: 0.055,
    rareRate: 0.1,
    bossSpeciesId: "deep-tide-jiao",
    bossName: "深潮蛟投影",
    camp: { x: 8, y: 9 },
    boss: { x: 82, y: 56 },
    palette: {
      ground: "#d8c189",
      path: "#e7d7a7",
      hazard: "#9cc3aa",
      water: "#3f92c9",
      deco: "#d06457"
    },
    encounters: [
      { speciesId: "bubble-dolphin", weight: 16 },
      { speciesId: "tide-crab", weight: 15 },
      { speciesId: "bluefin-rabbit", weight: 12 },
      { speciesId: "mist-frog", weight: 12 },
      { speciesId: "grass-mouse", weight: 8 },
      { speciesId: "flower-deer", weight: 8 },
      { speciesId: "spin-dragonfly", weight: 8 },
      { speciesId: "wind-chime-sparrow", weight: 8 },
      { speciesId: "coral-turtle", weight: 5 },
      { speciesId: "brook-cat", weight: 4 },
      { speciesId: "wave-otter", weight: 4 }
    ]
  },
  {
    id: "volcano",
    name: "赤砂火山",
    element: "fire",
    width: 84,
    height: 70,
    encounterRate: 0.06,
    rareRate: 0.12,
    bossSpeciesId: "volcano-rhino",
    bossName: "火山巨犀投影",
    camp: { x: 9, y: 8 },
    boss: { x: 76, y: 62 },
    palette: {
      ground: "#c06c4b",
      path: "#e0a15f",
      hazard: "#7a3229",
      water: "#6ba6b8",
      deco: "#3b2e2f"
    },
    encounters: [
      { speciesId: "fire-lizard", weight: 16 },
      { speciesId: "coal-pig", weight: 15 },
      { speciesId: "lamp-fox", weight: 12 },
      { speciesId: "red-rooster", weight: 12 },
      { speciesId: "tide-crab", weight: 7 },
      { speciesId: "mist-frog", weight: 7 },
      { speciesId: "stone-rat", weight: 8 },
      { speciesId: "sand-lizard", weight: 8 },
      { speciesId: "magma-turtle", weight: 5 },
      { speciesId: "blaze-panther", weight: 5 },
      { speciesId: "tinder-deer", weight: 5 }
    ]
  },
  {
    id: "canyon",
    name: "岩牙峡谷",
    element: "earth",
    width: 96,
    height: 72,
    encounterRate: 0.06,
    rareRate: 0.12,
    bossSpeciesId: "ancient-golem",
    bossName: "古岩魔像投影",
    camp: { x: 9, y: 9 },
    boss: { x: 88, y: 64 },
    palette: {
      ground: "#a88767",
      path: "#c6aa79",
      hazard: "#6f5b47",
      water: "#6b8aa0",
      deco: "#4f463b"
    },
    encounters: [
      { speciesId: "stone-rat", weight: 15 },
      { speciesId: "sand-lizard", weight: 14 },
      { speciesId: "round-rock-sheep", weight: 13 },
      { speciesId: "copper-bug", weight: 12 },
      { speciesId: "cloud-rabbit", weight: 8 },
      { speciesId: "light-feather-cat", weight: 8 },
      { speciesId: "grass-mouse", weight: 7 },
      { speciesId: "moss-turtle", weight: 7 },
      { speciesId: "rock-horn-bull", weight: 6 },
      { speciesId: "sand-pattern-cat", weight: 5 },
      { speciesId: "stone-shield-ape", weight: 5 }
    ]
  },
  {
    id: "highland",
    name: "风鸣高地",
    element: "wind",
    width: 100,
    height: 76,
    encounterRate: 0.065,
    rareRate: 0.12,
    bossSpeciesId: "storm-griffin",
    bossName: "风暴狮鹫投影",
    camp: { x: 9, y: 9 },
    boss: { x: 92, y: 68 },
    palette: {
      ground: "#91b8b5",
      path: "#d8d0a4",
      hazard: "#718598",
      water: "#6b9cc6",
      deco: "#eef1dc"
    },
    encounters: [
      { speciesId: "wind-chime-sparrow", weight: 15 },
      { speciesId: "cloud-rabbit", weight: 14 },
      { speciesId: "spin-dragonfly", weight: 13 },
      { speciesId: "light-feather-cat", weight: 12 },
      { speciesId: "fire-lizard", weight: 7 },
      { speciesId: "red-rooster", weight: 7 },
      { speciesId: "stone-rat", weight: 8 },
      { speciesId: "round-rock-sheep", weight: 8 },
      { speciesId: "gale-wolf", weight: 6 },
      { speciesId: "white-feather-deer", weight: 5 },
      { speciesId: "swift-weasel", weight: 5 }
    ]
  }
];

export const getMapDefinition = (id: string): MapDefinition => {
  const map = MAPS.find((item) => item.id === id);
  if (!map) {
    throw new Error(`Unknown map: ${id}`);
  }
  return map;
};
