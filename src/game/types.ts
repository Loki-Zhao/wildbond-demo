export type ElementType = "fire" | "water" | "forest" | "earth" | "wind";
export type GrowthLevel = 1 | 2 | 3;
export type StatKey = "hp" | "attack" | "defense" | "speed" | "crit";

export type StatusId =
  | "burn"
  | "slick"
  | "bind"
  | "stoneArmor"
  | "armorBreak"
  | "haste"
  | "regen"
  | "guard"
  | "defending";

export type SkillCategory = "attack" | "defense" | "heal" | "support";
export type SkillTarget = "enemy" | "ally" | "self" | "allEnemies" | "allAllies";

export interface Stats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  crit: number;
}

export interface StatusEffect {
  id: StatusId;
  name: string;
  turns: number;
  value?: number;
}

export interface Skill {
  id: string;
  name: string;
  element: ElementType;
  category: SkillCategory;
  apCost: number;
  target: SkillTarget;
  power?: number;
  multiplier?: number;
  heal?: number;
  shield?: number;
  status?: {
    id: StatusId;
    chance: number;
    turns: number;
    value?: number;
  };
  buff?: {
    id: StatusId;
    turns: number;
    value?: number;
  };
  description: string;
}

export interface PetSpecies {
  id: string;
  name: string;
  element: ElementType;
  growthLevel: GrowthLevel;
  role: string;
  statFocus: string;
  baseStats: Stats;
  skillIds: string[];
}

export interface PetInstance {
  uid: string;
  speciesId: string;
  expLevel: number;
  exp: number;
  currentHp: number;
  enhanceLevel?: number;
  nickname?: string;
}

export interface EncounterEntry {
  speciesId: string;
  weight: number;
}

export interface MapDefinition {
  id: string;
  name: string;
  element: ElementType;
  width: number;
  height: number;
  encounterRate: number;
  rareRate: number;
  bossSpeciesId: string;
  bossName: string;
  camp: { x: number; y: number };
  boss: { x: number; y: number };
  encounters: EncounterEntry[];
  palette: {
    ground: string;
    path: string;
    hazard: string;
    water: string;
    deco: string;
  };
}

export interface Inventory {
  captureStones: number;
  healingFruits: number;
  crystals: number;
  baits: Partial<Record<ElementType, number>>;
}

export interface GameState {
  party: PetInstance[];
  storage: PetInstance[];
  activeMapId: string;
  position: { x: number; y: number };
  unlockedMaps: string[];
  defeatedBosses: string[];
  discoveredSpecies: string[];
  ownedSpecies: string[];
  inventory: Inventory;
  fusionCount: number;
  firstLv1FusionDone: boolean;
  firstLv2FusionDone: boolean;
  log: string[];
}

export interface BattleUnit {
  id: string;
  side: "ally" | "enemy";
  instanceUid?: string;
  speciesId: string;
  expLevel: number;
  currentHp: number;
  ap: number;
  statuses: StatusEffect[];
  acted: boolean;
  enhanceLevel?: number;
  isBoss?: boolean;
  statMultiplier?: number;
  captureAttempts: number;
}

export interface BattleState {
  id: string;
  mapId: string;
  isBoss: boolean;
  round: number;
  allies: BattleUnit[];
  enemies: BattleUnit[];
  rewardUnits: BattleUnit[];
  selectedAllyId?: string;
  turnOrder: string[];
  activeUnitId?: string;
  actedUnitIds: string[];
  log: string[];
}

export interface BattleResult {
  state: BattleState;
  messages: string[];
  captured?: BattleUnit;
  victory?: boolean;
  defeat?: boolean;
}
