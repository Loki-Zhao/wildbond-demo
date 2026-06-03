import { STATUS_LABELS } from "../data/skills";
import { getPetSpecies } from "../data/pets";
import type { BattleUnit, ElementType, GrowthLevel, PetInstance, Stats, StatusEffect } from "./types";

export const ELEMENT_LABELS: Record<ElementType, string> = {
  fire: "火",
  water: "水",
  forest: "森",
  earth: "土",
  wind: "风"
};

export const ELEMENT_COLORS: Record<ElementType, string> = {
  fire: "#d6533f",
  water: "#2c80bd",
  forest: "#3f8f4b",
  earth: "#8a6745",
  wind: "#4d8990"
};

export const GROWTH_LABELS: Record<GrowthLevel, string> = {
  1: "初始体",
  2: "进化体",
  3: "完全体"
};

export const MIN_PET_LEVEL = 1;
export const MAX_PET_LEVEL = 10;
export const MIN_CRIT_RATE = 10;
export const MAX_CRIT_RATE = 50;
export const MAX_ENHANCE_LEVEL = 3;
export const ENHANCE_COSTS = [3, 6, 10] as const;
export const ENHANCE_STAT_STEP = 0.08;
export const ENHANCE_CRIT_STEP = 3;

export const clampPetLevel = (level: number): number => {
  if (!Number.isFinite(level)) return MIN_PET_LEVEL;
  return Math.max(MIN_PET_LEVEL, Math.min(MAX_PET_LEVEL, Math.round(level)));
};

export type ElementRelation = "advantage" | "disadvantage" | "neutral";

export const ELEMENT_ADVANTAGE_MULTIPLIER = 1.2;
export const ELEMENT_DISADVANTAGE_MULTIPLIER = 0.8;
export const ELEMENT_NEUTRAL_MULTIPLIER = 1;

export const strongAgainst: Record<ElementType, ElementType[]> = {
  fire: ["forest"],
  water: ["fire"],
  forest: ["water"],
  earth: ["wind"],
  wind: ["earth"]
};

export const weakAgainst: Record<ElementType, ElementType[]> = {
  fire: ["water"],
  water: ["forest"],
  forest: ["fire"],
  earth: ["forest"],
  wind: ["fire"]
};

export const elementRelation = (attacker: ElementType, defender: ElementType): ElementRelation => {
  if (strongAgainst[attacker].includes(defender)) return "advantage";
  if (weakAgainst[attacker].includes(defender)) return "disadvantage";
  return "neutral";
};

export const elementMultiplier = (attacker: ElementType, defender: ElementType): number => {
  const relation = elementRelation(attacker, defender);
  if (relation === "advantage") return ELEMENT_ADVANTAGE_MULTIPLIER;
  if (relation === "disadvantage") return ELEMENT_DISADVANTAGE_MULTIPLIER;
  return ELEMENT_NEUTRAL_MULTIPLIER;
};

export const calculateElementalAttackDamage = ({
  skillPower,
  skillMultiplier = 1,
  attackerAttack,
  defenderDefense,
  attackerElement,
  defenderElement
}: {
  skillPower: number;
  skillMultiplier?: number;
  attackerAttack: number;
  defenderDefense: number;
  attackerElement: ElementType;
  defenderElement: ElementType;
}): number => {
  const statWeightedBase = skillPower + attackerAttack * skillMultiplier - defenderDefense * 0.6;
  return statWeightedBase * elementMultiplier(attackerElement, defenderElement);
};

export const expToNext = (expLevel: number): number => {
  const level = clampPetLevel(expLevel);
  return level >= MAX_PET_LEVEL ? 0 : level * 10;
};

export const clampEnhanceLevel = (level?: number): number => {
  if (!Number.isFinite(level ?? 0)) return 0;
  return Math.max(0, Math.min(MAX_ENHANCE_LEVEL, Math.round(level ?? 0)));
};

export const enhancementCostForNext = (enhanceLevel = 0): number | undefined => {
  const level = clampEnhanceLevel(enhanceLevel);
  return level >= MAX_ENHANCE_LEVEL ? undefined : ENHANCE_COSTS[level];
};

export const enhancementSpent = (enhanceLevel = 0): number =>
  ENHANCE_COSTS.slice(0, clampEnhanceLevel(enhanceLevel)).reduce((sum, cost) => sum + cost, 0);

export const decomposeCrystalValue = (pet: PetInstance): number => {
  const species = getPetSpecies(pet.speciesId);
  return species.growthLevel + (species.growthLevel === 3 ? enhancementSpent(pet.enhanceLevel) : 0);
};

const clampCrit = (value: number): number => Math.max(MIN_CRIT_RATE, Math.min(MAX_CRIT_RATE, Math.round(value)));

const elementStatProfile: Record<
  ElementType,
  {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    critBonus: number;
  }
> = {
  fire: { hp: 0.95, attack: 1.18, defense: 0.85, speed: 1, critBonus: 8 },
  water: { hp: 1.16, attack: 0.95, defense: 1, speed: 0.9, critBonus: 7 },
  forest: { hp: 1.02, attack: 0.9, defense: 1.28, speed: 1.18, critBonus: 2 },
  earth: { hp: 1.2, attack: 0.95, defense: 1.2, speed: 0.78, critBonus: 0 },
  wind: { hp: 0.9, attack: 1.14, defense: 0.86, speed: 1.22, critBonus: 5 }
};

export const getStatsForSpecies = (speciesId: string, expLevel: number, enhanceLevel = 0): Stats => {
  const species = getPetSpecies(speciesId);
  const level = clampPetLevel(expLevel);
  const growth = 1 + (level - 1) * 0.055;
  const profile = elementStatProfile[species.element];
  const enhance = clampEnhanceLevel(enhanceLevel);
  const enhanceMultiplier = species.growthLevel === 3 ? 1 + enhance * ENHANCE_STAT_STEP : 1;
  return {
    hp: Math.max(1, Math.round((species.baseStats.hp * growth + level * 2) * profile.hp * enhanceMultiplier)),
    attack: Math.max(1, Math.round((species.baseStats.attack * growth + level * 0.7) * profile.attack * enhanceMultiplier)),
    defense: Math.max(1, Math.round((species.baseStats.defense * growth + level * 0.55) * profile.defense * enhanceMultiplier)),
    speed: Math.max(1, Math.round((species.baseStats.speed * growth + level * 0.45) * profile.speed * enhanceMultiplier)),
    crit: clampCrit(species.baseStats.crit + level * 0.8 + profile.critBonus + enhance * ENHANCE_CRIT_STEP)
  };
};

export const getPetStats = (pet: PetInstance): Stats => getStatsForSpecies(pet.speciesId, pet.expLevel, pet.enhanceLevel);

export const multiplyStats = (stats: Stats, multiplier = 1): Stats => {
  if (multiplier === 1) return stats;
  return {
    hp: Math.max(1, Math.round(stats.hp * multiplier)),
    attack: Math.max(1, Math.round(stats.attack * multiplier)),
    defense: Math.max(1, Math.round(stats.defense * multiplier)),
    speed: Math.max(1, Math.round(stats.speed * multiplier)),
    crit: clampCrit(stats.crit)
  };
};

export const getBattleUnitStats = (unit: Pick<BattleUnit, "speciesId" | "expLevel" | "statMultiplier" | "enhanceLevel">): Stats =>
  multiplyStats(getStatsForSpecies(unit.speciesId, unit.expLevel, unit.enhanceLevel), unit.statMultiplier ?? 1);

export const getMaxHp = (petOrSpeciesId: PetInstance | string, expLevel = 1): number => {
  if (typeof petOrSpeciesId === "string") {
    return getStatsForSpecies(petOrSpeciesId, expLevel).hp;
  }
  return getPetStats(petOrSpeciesId).hp;
};

export const getStatus = (statuses: StatusEffect[], id: StatusEffect["id"]): StatusEffect | undefined =>
  statuses.find((status) => status.id === id);

export const upsertStatus = (statuses: StatusEffect[], effect: StatusEffect): StatusEffect[] => {
  const existing = statuses.find((status) => status.id === effect.id);
  if (!existing) {
    return [...statuses, effect];
  }
  return statuses.map((status) =>
    status.id === effect.id
      ? {
          ...status,
          turns: Math.max(status.turns, effect.turns),
          value: Math.max(status.value ?? 0, effect.value ?? 0)
        }
      : status
  );
};

export const makeStatus = (id: StatusEffect["id"], turns: number, value?: number): StatusEffect => ({
  id,
  name: STATUS_LABELS[id],
  turns,
  value
});

export const getModifiedStats = (unit: BattleUnit): Stats => {
  const stats = getBattleUnitStats(unit);
  const armorBreak = getStatus(unit.statuses, "armorBreak")?.value ?? 0;
  const slick = getStatus(unit.statuses, "slick")?.value ?? 0;
  const bind = getStatus(unit.statuses, "bind")?.value ?? 0;
  const haste = getStatus(unit.statuses, "haste")?.value ?? 0;

  return {
    ...stats,
    defense: Math.max(1, Math.round(stats.defense * (1 - armorBreak))),
    speed: Math.max(1, Math.round(stats.speed * (1 - slick - bind + haste)))
  };
};

export const clampHp = (value: number, unit: Pick<BattleUnit, "speciesId" | "expLevel" | "statMultiplier" | "enhanceLevel">): number => {
  const maxHp = getBattleUnitStats(unit).hp;
  return Math.max(0, Math.min(maxHp, Math.round(value)));
};

export const isAlive = (unit: BattleUnit): boolean => unit.currentHp > 0;

export const describeElementMultiplier = (value: number): string => {
  if (value > 1) return "效果拔群";
  if (value < 1) return "效果较弱";
  return "正常命中";
};
