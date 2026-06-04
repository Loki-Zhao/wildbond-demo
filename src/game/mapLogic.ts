import type { MapDefinition } from "./types";

export type TerrainType = "camp" | "boss" | "path" | "water" | "hazard" | "rare" | "grass";

const noise = (x: number, y: number, seed: number): number => {
  const value = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
  return value - Math.floor(value);
};

const mapSeed = (id: string): number => id.split("").reduce((total, char) => total + char.charCodeAt(0), 0);

export const distance = (a: { x: number; y: number }, b: { x: number; y: number }): number =>
  Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export const isInsideMap = (map: MapDefinition, x: number, y: number): boolean => x >= 0 && y >= 0 && x < map.width && y < map.height;

export const getTerrainAt = (map: MapDefinition, x: number, y: number): TerrainType => {
  if (distance({ x, y }, map.camp) <= 3) return "camp";
  if (distance({ x, y }, map.boss) <= 2) return "boss";

  const progressX = map.boss.x - map.camp.x;
  const progressY = map.boss.y - map.camp.y;
  const t = Math.max(0, Math.min(1, ((x - map.camp.x) * progressX + (y - map.camp.y) * progressY) / (progressX ** 2 + progressY ** 2)));
  const closest = {
    x: map.camp.x + progressX * t,
    y: map.camp.y + progressY * t
  };
  const pathDistance = Math.abs(x - closest.x) + Math.abs(y - closest.y);
  if (pathDistance < 2.2) return "path";

  const seed = mapSeed(map.id);
  const n = noise(x, y, seed);

  if (map.id === "coast" && (x < 12 || y > map.height - 10 || n > 0.9)) return "water";
  if (map.id === "meadow" && (Math.abs(y - map.height * 0.42) < 2 || n > 0.93)) return "water";
  if (map.id === "volcano" && n > 0.82) return "hazard";
  if (map.id === "canyon" && n > 0.84) return "hazard";
  if (map.id === "highland" && n > 0.86) return "hazard";

  if (x > map.width * 0.58 && y > map.height * 0.5 && n > 0.62) return "rare";
  return "grass";
};

export const isEncounterTerrain = (terrain: TerrainType): boolean => terrain === "grass" || terrain === "rare" || terrain === "hazard";

export const getEncounterRateForTerrain = (map: MapDefinition, terrain: TerrainType): number => {
  if (terrain === "rare" || terrain === "hazard") return map.rareRate;
  if (terrain === "grass") return map.encounterRate;
  return 0;
};

export const getStepAdjustedEncounterRate = (baseRate: number, stepsSinceEncounter: number): number => {
  if (baseRate <= 0) return 0;
  const steps = Math.max(1, Math.round(stepsSinceEncounter));
  if (steps >= 15) return 1;
  const steadyPressure = Math.max(0, steps - 3) * 0.045;
  const latePressure = Math.max(0, steps - 9) * 0.07;
  return Math.max(baseRate, Math.min(0.9, baseRate + steadyPressure + latePressure));
};

export const canMoveTo = (map: MapDefinition, x: number, y: number): boolean => {
  if (!isInsideMap(map, x, y)) return false;
  return true;
};
