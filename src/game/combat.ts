import { getMapDefinition } from "../data/maps";
import { PETS_BY_LEVEL, getPetSpecies } from "../data/pets";
import { getSkill } from "../data/skills";
import {
  clampHp,
  clampPetLevel,
  describeElementMultiplier,
  elementMultiplier,
  expToNext,
  getBattleUnitStats,
  getMaxHp,
  getModifiedStats,
  getStatus,
  isAlive,
  makeStatus,
  MAX_PET_LEVEL,
  calculateElementalAttackDamage,
  upsertStatus
} from "./balance";
import { createPetInstance, markSpecies, syncUnlocks } from "./state";
import type { BattleResult, BattleState, BattleUnit, EncounterEntry, GameState, GrowthLevel, MapDefinition, PetInstance, Skill } from "./types";

export const BOSS_COMPLETE_STAT_MULTIPLIER = 1.25;
export const CAPTURE_STONE_DROP_RATE = 0.6;

const weightedPick = <T extends { weight: number }>(entries: T[]): T => {
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * total;
  for (const entry of entries) {
    roll -= entry.weight;
    if (roll <= 0) return entry;
  }
  return entries[entries.length - 1];
};

const randomPick = <T>(entries: T[]): T => entries[Math.floor(Math.random() * entries.length)];

const maxCampDistance = (map: MapDefinition): number => {
  const corners = [
    { x: 0, y: 0 },
    { x: map.width - 1, y: 0 },
    { x: 0, y: map.height - 1 },
    { x: map.width - 1, y: map.height - 1 }
  ];
  return Math.max(...corners.map((corner) => Math.abs(corner.x - map.camp.x) + Math.abs(corner.y - map.camp.y)));
};

const campProgressForPosition = (state: Pick<GameState, "position">, map: MapDefinition): number => {
  const distanceFromCamp = Math.abs(state.position.x - map.camp.x) + Math.abs(state.position.y - map.camp.y);
  return Math.max(0, Math.min(1, distanceFromCamp / Math.max(1, maxCampDistance(map))));
};

interface WildEncounterBand {
  maxProgress: number;
  minLevel: number;
  maxLevel: number;
  growthWeights: Partial<Record<GrowthLevel, number>>;
  enemyCountWeights: Array<{ count: number; weight: number }>;
}

const WILD_ENCOUNTER_BANDS: WildEncounterBand[] = [
  {
    maxProgress: 0.28,
    minLevel: 1,
    maxLevel: 2,
    growthWeights: { 1: 1 },
    enemyCountWeights: [{ count: 1, weight: 1 }]
  },
  {
    maxProgress: 0.5,
    minLevel: 2,
    maxLevel: 4,
    growthWeights: { 1: 1 },
    enemyCountWeights: [
      { count: 1, weight: 0.82 },
      { count: 2, weight: 0.18 }
    ]
  },
  {
    maxProgress: 0.72,
    minLevel: 4,
    maxLevel: 6,
    growthWeights: { 1: 1, 2: 0.32 },
    enemyCountWeights: [
      { count: 1, weight: 0.48 },
      { count: 2, weight: 0.42 },
      { count: 3, weight: 0.1 }
    ]
  },
  {
    maxProgress: 0.88,
    minLevel: 6,
    maxLevel: 8,
    growthWeights: { 1: 0.55, 2: 1 },
    enemyCountWeights: [
      { count: 1, weight: 0.26 },
      { count: 2, weight: 0.5 },
      { count: 3, weight: 0.24 }
    ]
  },
  {
    maxProgress: 1,
    minLevel: 8,
    maxLevel: 10,
    growthWeights: { 1: 0.18, 2: 1 },
    enemyCountWeights: [
      { count: 1, weight: 0.18 },
      { count: 2, weight: 0.46 },
      { count: 3, weight: 0.36 }
    ]
  }
];

export interface WildEncounterProfile {
  progress: number;
  minLevel: number;
  maxLevel: number;
  enemyLevel: number;
  growthWeights: Partial<Record<GrowthLevel, number>>;
  enemyCountWeights: Array<{ count: number; weight: number }>;
}

export const wildEncounterProfileForPosition = (state: Pick<GameState, "position">, map: MapDefinition): WildEncounterProfile => {
  const progress = campProgressForPosition(state, map);
  const bandIndex = WILD_ENCOUNTER_BANDS.findIndex((band) => progress <= band.maxProgress);
  const band = WILD_ENCOUNTER_BANDS[bandIndex === -1 ? WILD_ENCOUNTER_BANDS.length - 1 : bandIndex];
  const previousMaxProgress = bandIndex > 0 ? WILD_ENCOUNTER_BANDS[bandIndex - 1].maxProgress : 0;
  const bandProgress = Math.max(0, Math.min(1, (progress - previousMaxProgress) / Math.max(0.001, band.maxProgress - previousMaxProgress)));
  const levelRange = band.maxLevel - band.minLevel;
  const enemyLevel = clampPetLevel(band.minLevel + Math.floor(bandProgress * (levelRange + 1)));

  return {
    progress,
    minLevel: band.minLevel,
    maxLevel: band.maxLevel,
    enemyLevel: Math.min(band.maxLevel, enemyLevel),
    growthWeights: band.growthWeights,
    enemyCountWeights: band.enemyCountWeights
  };
};

export const wildEncounterCandidatesForPosition = (state: Pick<GameState, "position">, map: MapDefinition): EncounterEntry[] => {
  const profile = wildEncounterProfileForPosition(state, map);
  const candidates = map.encounters
    .map((entry) => {
      const species = getPetSpecies(entry.speciesId);
      const growthWeight = profile.growthWeights[species.growthLevel] ?? 0;
      return {
        ...entry,
        weight: entry.weight * growthWeight
      };
    })
    .filter((entry) => entry.weight > 0);

  return candidates.length ? candidates : map.encounters.filter((entry) => getPetSpecies(entry.speciesId).growthLevel === 1);
};

const appendRewardUnits = (battle: BattleState, units: BattleUnit[]): BattleState => {
  if (!units.length) return battle;
  const existingIds = new Set((battle.rewardUnits ?? []).map((unit) => unit.id));
  const nextUnits = units.filter((unit) => !existingIds.has(unit.id));
  if (!nextUnits.length) return battle;
  return {
    ...battle,
    rewardUnits: [...(battle.rewardUnits ?? []), ...nextUnits]
  };
};

const createUnitFromPet = (pet: PetInstance): BattleUnit => ({
  id: `ally-${pet.uid}`,
  side: "ally",
  instanceUid: pet.uid,
  speciesId: pet.speciesId,
  expLevel: pet.expLevel,
  enhanceLevel: pet.enhanceLevel,
  currentHp: Math.max(1, Math.min(pet.currentHp, getMaxHp(pet))),
  ap: 1,
  statuses: [],
  acted: false,
  captureAttempts: 0
});

const createEnemyUnit = (speciesId: string, index: number, options?: { isBoss?: boolean; level?: number; statMultiplier?: number }): BattleUnit => {
  const isBoss = options?.isBoss ?? false;
  const expLevel = clampPetLevel(options?.level ?? 1);
  const statMultiplier = options?.statMultiplier;
  return {
    id: `enemy-${speciesId}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    side: "enemy",
    speciesId,
    expLevel,
    currentHp: getBattleUnitStats({ speciesId, expLevel, statMultiplier }).hp,
    ap: isBoss ? 2 : 1,
    statuses: [],
    acted: false,
    isBoss,
    statMultiplier,
    captureAttempts: 0
  };
};

const allBattleUnits = (battle: BattleState): BattleUnit[] => [...battle.allies, ...battle.enemies];

const findBattleUnit = (battle: BattleState, unitId?: string): BattleUnit | undefined =>
  unitId ? allBattleUnits(battle).find((unit) => unit.id === unitId) : undefined;

const isLiveBattleUnit = (unit: BattleUnit | undefined): unit is BattleUnit => Boolean(unit && isAlive(unit));

const buildTurnOrder = (battle: Pick<BattleState, "allies" | "enemies">): string[] => {
  const indexed = [...battle.allies, ...battle.enemies].map((unit, index) => ({ unit, index }));
  return indexed
    .filter(({ unit }) => isAlive(unit))
    .sort((a, b) => {
      const speedDiff = getModifiedStats(b.unit).speed - getModifiedStats(a.unit).speed;
      if (speedDiff !== 0) return speedDiff;
      if (a.unit.side !== b.unit.side) return a.unit.side === "ally" ? -1 : 1;
      return a.index - b.index;
    })
    .map(({ unit }) => unit.id);
};

const withActiveTurn = (battle: BattleState): BattleState => {
  const turnOrder = buildTurnOrder(battle);
  const activeUnit = turnOrder.map((id) => findBattleUnit(battle, id)).find(isLiveBattleUnit);
  return {
    ...battle,
    turnOrder,
    activeUnitId: activeUnit?.id,
    selectedAllyId: activeUnit?.side === "ally" ? activeUnit.id : battle.allies.find(isAlive)?.id,
    actedUnitIds: battle.actedUnitIds ?? []
  };
};

export const getActiveUnit = (battle: BattleState): BattleUnit | undefined => findBattleUnit(battle, battle.activeUnitId);

const markActed = (battle: BattleState, unitId: string): BattleState => {
  const actedUnitIds = battle.actedUnitIds.includes(unitId) ? battle.actedUnitIds : [...battle.actedUnitIds, unitId];
  return {
    ...battle,
    actedUnitIds,
    allies: battle.allies.map((unit) => (unit.id === unitId ? { ...unit, acted: true } : unit)),
    enemies: battle.enemies.map((unit) => (unit.id === unitId ? { ...unit, acted: true } : unit))
  };
};

export const createWildBattle = (state: GameState): BattleState => {
  const map = getMapDefinition(state.activeMapId);
  const profile = wildEncounterProfileForPosition(state, map);
  const enemyLevel = profile.enemyLevel;
  const enemyCount = weightedPick(profile.enemyCountWeights).count;
  const encounterCandidates = wildEncounterCandidatesForPosition(state, map);
  const enemies = Array.from({ length: enemyCount }, (_, index) => {
    const entry = weightedPick(encounterCandidates);
    return createEnemyUnit(entry.speciesId, index, { level: enemyLevel });
  });

  return withActiveTurn({
    id: `battle-${Date.now().toString(36)}`,
    mapId: map.id,
    isBoss: false,
    round: 1,
    allies: state.party.map(createUnitFromPet),
    enemies,
    rewardUnits: [],
    selectedAllyId: undefined,
    turnOrder: [],
    activeUnitId: undefined,
    actedUnitIds: [],
    log: [`野生宠物出现了：${enemies.map((enemy) => `${getPetSpecies(enemy.speciesId).name} Lv${enemy.expLevel}`).join("、")}。`]
  });
};

export const createBossBattle = (state: GameState): BattleState => {
  const map = getMapDefinition(state.activeMapId);
  const completePool = PETS_BY_LEVEL[3].filter((species) => species.element === map.element);
  const bossSpecies = getPetSpecies(map.bossSpeciesId);
  const bossTeam =
    bossSpecies.growthLevel === 3
      ? [bossSpecies, ...completePool.filter((species) => species.id !== bossSpecies.id)].slice(0, 3)
      : completePool.slice(0, 3);
  const enemies = bossTeam.map((species, index) =>
    createEnemyUnit(species.id, index, { isBoss: true, level: MAX_PET_LEVEL, statMultiplier: BOSS_COMPLETE_STAT_MULTIPLIER })
  );

  return withActiveTurn({
    id: `boss-${Date.now().toString(36)}`,
    mapId: map.id,
    isBoss: true,
    round: 1,
    allies: state.party.map(createUnitFromPet),
    enemies,
    rewardUnits: [],
    selectedAllyId: undefined,
    turnOrder: [],
    activeUnitId: undefined,
    actedUnitIds: [],
    log: [`${map.bossName}挡在祭坛前。`]
  });
};

const updateUnit = (units: BattleUnit[], nextUnit: BattleUnit): BattleUnit[] =>
  units.map((unit) => (unit.id === nextUnit.id ? nextUnit : unit));

const applyDamage = (target: BattleUnit, rawDamage: number): { target: BattleUnit; dealt: number; shielded: number } => {
  let damage = Math.max(1, Math.round(rawDamage));
  let statuses = target.statuses;
  let shielded = 0;
  if (getStatus(statuses, "defending")) {
    damage = Math.max(1, Math.ceil(damage / 3));
  }
  const guard = getStatus(statuses, "guard");
  if (guard && (guard.value ?? 0) > 0) {
    shielded = Math.min(damage, guard.value ?? 0);
    damage -= shielded;
    statuses = statuses
      .map((status) => (status.id === "guard" ? { ...status, value: Math.max(0, (status.value ?? 0) - shielded) } : status))
      .filter((status) => status.id !== "guard" || (status.value ?? 0) > 0);
  }
  return {
    target: {
      ...target,
      statuses,
      currentHp: clampHp(target.currentHp - damage, target)
    },
    dealt: damage,
    shielded
  };
};

export const defendUnit = (battle: BattleState, unitId: string): BattleResult => {
  const unit = findBattleUnit(battle, unitId);
  if (!unit || !isAlive(unit)) return { state: battle, messages: ["行动单位不可用。"] };
  if (unit.acted) return { state: battle, messages: ["这只宠物本回合已经行动。"] };
  const species = getPetSpecies(unit.speciesId);
  const nextUnit: BattleUnit = {
    ...unit,
    acted: true,
    statuses: upsertStatus(unit.statuses, makeStatus("defending", 1, 0.67))
  };
  const messages = [`${species.name}进入防御姿态，本回合受到伤害降低到 1/3。`];
  const updatedBattle =
    unit.side === "ally"
      ? { ...battle, allies: updateUnit(battle.allies, nextUnit) }
      : { ...battle, enemies: updateUnit(battle.enemies, nextUnit) };
  const nextBattle = markActed(
    {
      ...updatedBattle,
      log: [...messages, ...battle.log].slice(0, 80)
    },
    unitId
  );
  return {
    state: nextBattle,
    messages
  };
};

const applyHeal = (target: BattleUnit, amount: number): { target: BattleUnit; healed: number } => {
  const before = target.currentHp;
  const nextHp = clampHp(target.currentHp + amount, target);
  return {
    target: {
      ...target,
      currentHp: nextHp
    },
    healed: nextHp - before
  };
};

const applySkillToTarget = (caster: BattleUnit, target: BattleUnit, skill: Skill): { caster: BattleUnit; target: BattleUnit; messages: string[] } => {
  const casterSpecies = getPetSpecies(caster.speciesId);
  const targetSpecies = getPetSpecies(target.speciesId);
  const casterStats = getModifiedStats(caster);
  const targetStats = getModifiedStats(target);
  const messages: string[] = [];
  let nextTarget = target;
  let nextCaster = caster;

  if (skill.category === "attack" && skill.power) {
    const multiplier = elementMultiplier(skill.element, targetSpecies.element);
    const armor = getStatus(target.statuses, "stoneArmor")?.value ?? 0;
    const critical = Math.random() < casterStats.crit / 100;
    let damage = calculateElementalAttackDamage({
      skillPower: skill.power,
      skillMultiplier: skill.multiplier,
      attackerAttack: casterStats.attack,
      defenderDefense: targetStats.defense,
      attackerElement: skill.element,
      defenderElement: targetSpecies.element
    });
    damage *= 1 - armor;
    if (skill.id === "ember-claw" && getStatus(target.statuses, "burn")) damage *= 1.25;
    if (skill.id === "flame-chase" && target.currentHp / getBattleUnitStats(target).hp <= 0.4) damage *= 1.3;
    if (skill.id === "wind-blade" && casterStats.speed > targetStats.speed) damage *= 1.2;
    if (critical) damage *= 1.5;
    const result = applyDamage(target, damage);
    nextTarget = result.target;
    messages.push(
      `${casterSpecies.name}使用${skill.name}，${describeElementMultiplier(multiplier)}${critical ? "，暴击" : ""}，对${targetSpecies.name}造成${result.dealt}点伤害。`
    );
    if (result.shielded > 0) messages.push(`${targetSpecies.name}的守护抵消了${result.shielded}点伤害。`);
  }

  if (skill.category === "heal" && skill.heal) {
    const targetMaxHp = getBattleUnitStats(target).hp;
    const healRatio = skill.target === "allAllies" ? 0.12 : 0.18;
    const amount = Math.round(skill.heal + targetMaxHp * healRatio);
    const result = applyHeal(target, amount);
    nextTarget = result.target;
    messages.push(`${casterSpecies.name}使用${skill.name}，${targetSpecies.name}恢复${result.healed}点 HP。`);
  }

  if (skill.shield || skill.buff) {
    const buff = skill.buff;
    if (buff) {
      nextTarget = {
        ...nextTarget,
        statuses: upsertStatus(nextTarget.statuses, makeStatus(buff.id, buff.turns, buff.value ?? skill.shield))
      };
      messages.push(`${targetSpecies.name}获得${makeStatus(buff.id, buff.turns, buff.value).name}。`);
    }
  }

  if (skill.status && Math.random() <= skill.status.chance && nextTarget.currentHp > 0) {
    nextTarget = {
      ...nextTarget,
      statuses: upsertStatus(nextTarget.statuses, makeStatus(skill.status.id, skill.status.turns, skill.status.value))
    };
    messages.push(`${targetSpecies.name}陷入${makeStatus(skill.status.id, skill.status.turns, skill.status.value).name}。`);
  }

  if (skill.buff && skill.target === "allEnemies" && skill.buff.id === "haste") {
    nextCaster = {
      ...nextCaster,
      statuses: upsertStatus(nextCaster.statuses, makeStatus(skill.buff.id, skill.buff.turns, skill.buff.value))
    };
  }

  if (nextTarget.currentHp <= 0 && target.currentHp > 0) {
    messages.push(`${targetSpecies.name}倒下了。`);
  }

  return { caster: nextCaster, target: nextTarget, messages };
};

const targetsForSkill = (battle: BattleState, caster: BattleUnit, skill: Skill, targetId?: string): BattleUnit[] => {
  const allies = caster.side === "ally" ? battle.allies : battle.enemies;
  const enemies = caster.side === "ally" ? battle.enemies : battle.allies;
  if (skill.target === "self") return [caster];
  if (skill.target === "allAllies") return allies.filter(isAlive);
  if (skill.target === "allEnemies") return enemies.filter(isAlive);
  if (skill.target === "ally") {
    const aliveAllies = allies.filter(isAlive);
    return aliveAllies.filter((unit) => unit.id === targetId).length ? aliveAllies.filter((unit) => unit.id === targetId) : aliveAllies.slice(0, 1);
  }
  const aliveEnemies = enemies.filter(isAlive);
  return aliveEnemies.filter((unit) => unit.id === targetId).length ? aliveEnemies.filter((unit) => unit.id === targetId) : aliveEnemies.slice(0, 1);
};

export const useSkill = (battle: BattleState, casterId: string, skillId: string, targetId?: string): BattleResult => {
  const caster = [...battle.allies, ...battle.enemies].find((unit) => unit.id === casterId);
  if (!caster || !isAlive(caster)) return { state: battle, messages: ["行动单位不可用。"] };
  const skill = getSkill(skillId);
  if (caster.acted) return { state: battle, messages: ["这只宠物本回合已经行动。"] };
  if (caster.ap < skill.apCost) return { state: battle, messages: ["AP 不足。"] };

  const targets = targetsForSkill(battle, caster, skill, targetId);
  if (targets.length === 0) return { state: battle, messages: ["没有可用目标。"] };

  let nextBattle: BattleState = {
    ...battle,
    allies: battle.allies.map((unit) => (unit.id === caster.id ? { ...unit, ap: unit.ap - skill.apCost } : unit)),
    enemies: battle.enemies.map((unit) => (unit.id === caster.id ? { ...unit, ap: unit.ap - skill.apCost } : unit))
  };
  nextBattle = markActed(nextBattle, caster.id);

  let nextCaster = [...nextBattle.allies, ...nextBattle.enemies].find((unit) => unit.id === caster.id)!;
  const messages: string[] = [];

  for (const target of targets) {
    const liveCaster = [...nextBattle.allies, ...nextBattle.enemies].find((unit) => unit.id === nextCaster.id) ?? nextCaster;
    const liveTarget = [...nextBattle.allies, ...nextBattle.enemies].find((unit) => unit.id === target.id) ?? target;
    const result = applySkillToTarget(liveCaster, liveTarget, skill);
    nextCaster = result.caster;
    messages.push(...result.messages);

    if (result.target.side === "ally") {
      nextBattle = { ...nextBattle, allies: updateUnit(nextBattle.allies, result.target) };
    } else {
      nextBattle = { ...nextBattle, enemies: updateUnit(nextBattle.enemies, result.target) };
    }
    if (nextCaster.side === "ally") {
      nextBattle = { ...nextBattle, allies: updateUnit(nextBattle.allies, nextCaster) };
    } else {
      nextBattle = { ...nextBattle, enemies: updateUnit(nextBattle.enemies, nextCaster) };
    }
  }

  const defeatedEnemies = nextBattle.enemies.filter((unit) => unit.currentHp <= 0);
  nextBattle = appendRewardUnits(
    {
      ...nextBattle,
      enemies: nextBattle.enemies.filter((unit) => unit.currentHp > 0),
      log: [...messages, ...nextBattle.log].slice(0, 80)
    },
    defeatedEnemies
  );

  return {
    state: nextBattle,
    messages,
    victory: nextBattle.enemies.length === 0,
    defeat: nextBattle.allies.every((unit) => unit.currentHp <= 0)
  };
};

const tickStatuses = (unit: BattleUnit): { unit: BattleUnit; messages: string[] } => {
  const species = getPetSpecies(unit.speciesId);
  let next = { ...unit };
  const messages: string[] = [];
  const maxHp = getBattleUnitStats(unit).hp;

  if (getStatus(next.statuses, "burn") && next.currentHp > 0) {
    const burnDamage = Math.max(1, Math.round(maxHp * 0.06));
    next = { ...next, currentHp: clampHp(next.currentHp - burnDamage, next) };
    messages.push(`${species.name}受到灼烧伤害 ${burnDamage}。`);
  }

  if (getStatus(next.statuses, "regen") && next.currentHp > 0) {
    const regen = Math.max(1, Math.round(maxHp * 0.08));
    const healed = applyHeal(next, regen);
    next = healed.target;
    messages.push(`${species.name}再生恢复 ${healed.healed}。`);
  }

  next = {
    ...next,
    statuses: next.statuses
      .map((status) => ({ ...status, turns: status.turns - 1 }))
      .filter((status) => status.turns > 0 && (status.id !== "guard" || (status.value ?? 0) > 0))
  };

  if (next.currentHp <= 0 && unit.currentHp > 0) messages.push(`${species.name}倒下了。`);
  return { unit: next, messages };
};

export const advanceBattleTurn = (battle: BattleState): BattleResult => {
  if (battle.enemies.length === 0) return { state: battle, messages: [], victory: true };
  if (battle.allies.every((unit) => unit.currentHp <= 0)) return { state: battle, messages: [], defeat: true };

  const currentOrder = (battle.turnOrder.length ? battle.turnOrder : buildTurnOrder(battle)).filter((id) => {
    const unit = findBattleUnit(battle, id);
    return Boolean(unit && isAlive(unit));
  });
  const nextActive = currentOrder.map((id) => findBattleUnit(battle, id)).filter(isLiveBattleUnit).find((unit) => !unit.acted);
  if (nextActive) {
    return {
      state: {
        ...battle,
        turnOrder: currentOrder,
        activeUnitId: nextActive.id,
        selectedAllyId: nextActive.side === "ally" ? nextActive.id : battle.allies.find(isAlive)?.id
      },
      messages: []
    };
  }

  const afterTicks = [...battle.allies, ...battle.enemies].map(tickStatuses);
  const tickMessages = afterTicks.flatMap((result) => result.messages);
  const tickedAllies = afterTicks.map((result) => result.unit).filter((unit) => unit.side === "ally");
  const tickedEnemyUnits = afterTicks.map((result) => result.unit).filter((unit) => unit.side === "enemy");
  const defeatedTickEnemies = tickedEnemyUnits.filter((unit) => unit.currentHp <= 0);
  const tickedEnemies = tickedEnemyUnits.filter((unit) => unit.currentHp > 0);

  let nextBattle = appendRewardUnits(
    {
      ...battle,
      round: battle.round + 1,
      allies: tickedAllies.map((unit) => ({
        ...unit,
        ap: Math.min(3, unit.ap + 1),
        acted: false
      })),
      enemies: tickedEnemies.map((unit) => ({
        ...unit,
        ap: Math.min(3, unit.ap + 1),
        acted: false
      })),
      actedUnitIds: [],
      turnOrder: [],
      activeUnitId: undefined,
      log: [...tickMessages, `第 ${battle.round + 1} 回合。`, ...battle.log].slice(0, 80)
    },
    defeatedTickEnemies
  );

  if (nextBattle.enemies.length === 0) return { state: nextBattle, messages: tickMessages, victory: true };
  if (nextBattle.allies.every((unit) => unit.currentHp <= 0)) return { state: nextBattle, messages: tickMessages, defeat: true };

  nextBattle = withActiveTurn(nextBattle);
  return {
    state: nextBattle,
    messages: tickMessages,
    victory: nextBattle.enemies.length === 0,
    defeat: nextBattle.allies.every((unit) => unit.currentHp <= 0)
  };
};

export const enemyAct = (battle: BattleState): BattleResult => {
  const enemy = battle.enemies.find((unit) => unit.id === battle.activeUnitId && isAlive(unit)) ?? battle.enemies.find((unit) => isAlive(unit) && !unit.acted);
  if (!enemy) return advanceBattleTurn(battle);

  const species = getPetSpecies(enemy.speciesId);
  const availableSkills = species.skillIds.map(getSkill).filter((skill) => skill.apCost <= enemy.ap);
  if (!availableSkills.length) {
    const defended = defendUnit(battle, enemy.id);
    const advanced = advanceBattleTurn(defended.state);
    return {
      ...advanced,
      messages: [...defended.messages, ...advanced.messages]
    };
  }

  const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
  const aliveAllies = battle.allies.filter(isAlive);
  const aliveEnemies = battle.enemies.filter(isAlive);
  if (!aliveAllies.length) return { state: battle, messages: [], defeat: true };

  const target =
    skill.target === "self"
      ? enemy
      : skill.target === "ally"
        ? aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]
        : skill.target === "allEnemies" || skill.target === "allAllies"
          ? undefined
          : aliveAllies[Math.floor(Math.random() * aliveAllies.length)];
  const used = useSkill(battle, enemy.id, skill.id, target?.id);
  if (used.victory || used.defeat) return used;
  const advanced = advanceBattleTurn(used.state);
  return {
    ...advanced,
    messages: [...used.messages, ...advanced.messages],
    victory: used.victory || advanced.victory,
    defeat: used.defeat || advanced.defeat
  };
};

export const captureChance = (enemy: BattleUnit): number => {
  const species = getPetSpecies(enemy.speciesId);
  const maxHp = getBattleUnitStats(enemy).hp;
  const hpRatio = Math.max(0, Math.min(1, enemy.currentHp / maxHp));
  const missing = 1 - hpRatio;
  const stageBase: Record<number, number> = { 1: 0.1, 2: 0.05, 3: 0.02 };
  const stageCap: Record<number, number> = { 1: 0.8, 2: 0.55, 3: 0.35 };
  const base = stageBase[species.growthLevel];
  const cap = stageCap[species.growthLevel];
  const hpAdjusted = base + Math.pow(missing, 1.35) * (cap - base);
  const levelMultiplier = 1 - (clampPetLevel(enemy.expLevel) - 1) * 0.045;
  const statusBonus = enemy.statuses.some((status) => ["slick", "bind", "burn", "armorBreak"].includes(status.id)) ? 0.08 : 0;
  const attemptBonus = Math.min(0.12, enemy.captureAttempts * 0.04);
  return Math.max(0.02, Math.min(cap, hpAdjusted * levelMultiplier + statusBonus + attemptBonus));
};

export const tryCapture = (battle: BattleState, enemyId: string): { battle: BattleState; success: boolean; message: string; pet?: PetInstance } => {
  const enemy = battle.enemies.find((unit) => unit.id === enemyId);
  if (!enemy || enemy.isBoss) return { battle, success: false, message: "该目标不可捕获。" };

  const chance = captureChance(enemy);
  const species = getPetSpecies(enemy.speciesId);
  const success = Math.random() < chance;

  if (!success) {
    const nextEnemy = { ...enemy, captureAttempts: enemy.captureAttempts + 1 };
    return {
      battle: {
        ...battle,
        enemies: updateUnit(battle.enemies, nextEnemy),
        log: [`捕获${species.name}失败。`, ...battle.log].slice(0, 80)
      },
      success: false,
      message: `捕获${species.name}失败。`
    };
  }

  const pet = createPetInstance(enemy.speciesId, enemy.expLevel);
  const remainingEnemies = battle.enemies.filter((unit) => unit.id !== enemy.id);
  return {
    battle: appendRewardUnits(
      {
        ...battle,
        enemies: remainingEnemies,
        turnOrder: battle.turnOrder.filter((unitId) => unitId !== enemy.id),
        activeUnitId: battle.activeUnitId === enemy.id ? undefined : battle.activeUnitId,
        actedUnitIds: battle.actedUnitIds.filter((unitId) => unitId !== enemy.id),
        log: [
          remainingEnemies.length > 0 ? `捕获成功：${species.name}，仍可继续捕获剩余野生宠物。` : `捕获成功：${species.name}。`,
          ...battle.log
        ].slice(0, 80)
      },
      [enemy]
    ),
    success: true,
    message: `捕获成功：${species.name}`,
    pet
  };
};

const expFromEnemyForPet = (pet: PetInstance, enemy: BattleUnit): number => {
  const petSpecies = getPetSpecies(pet.speciesId);
  const enemySpecies = getPetSpecies(enemy.speciesId);
  const stageMultiplier = Math.max(0.2, 1 + (enemySpecies.growthLevel - petSpecies.growthLevel) * 0.35);
  const levelMultiplier = Math.max(0.25, 1 + (clampPetLevel(enemy.expLevel) - clampPetLevel(pet.expLevel)) * 0.08);
  return Math.max(1, Math.round(clampPetLevel(enemy.expLevel) * 10 * stageMultiplier * levelMultiplier));
};

export const finishBattle = (game: GameState, battle: BattleState, options?: { bossDefeated?: boolean; capturedPet?: PetInstance }): GameState => {
  const participatingUids = new Set(battle.allies.map((ally) => ally.instanceUid).filter(Boolean));
  const rewardUnits = battle.rewardUnits ?? [];
  let nextParty = game.party.map((pet) => {
    const unit = battle.allies.find((ally) => ally.instanceUid === pet.uid);
    if (!unit) return pet;
    return {
      ...pet,
      currentHp: Math.max(0, unit.currentHp)
    };
  });

  const inventory = { ...game.inventory };
  const dropMessages: string[] = [];
  if (Math.random() < 0.3) {
    inventory.healingFruits += 1;
    dropMessages.push("获得治疗果 x1。");
  }
  if (Math.random() < CAPTURE_STONE_DROP_RATE) {
    inventory.captureStones += 1;
    dropMessages.push("获得捕获石 x1。");
  }
  const levelMessages: string[] = [];
  const expMessages: string[] = [];
  nextParty = nextParty.map((pet) => {
    if (!participatingUids.has(pet.uid) || pet.currentHp <= 0) return pet;
    if (pet.expLevel >= MAX_PET_LEVEL) return { ...pet, exp: 0 };
    const gainedExp = rewardUnits.reduce((sum, enemy) => sum + expFromEnemyForPet(pet, enemy), 0);
    if (gainedExp <= 0) return pet;
    expMessages.push(`${getPetSpecies(pet.speciesId).name}获得 ${gainedExp} 经验。`);
    let exp = pet.exp + gainedExp;
    let expLevel = clampPetLevel(pet.expLevel);
    let currentHp = pet.currentHp;
    while (expLevel < MAX_PET_LEVEL && exp >= expToNext(expLevel)) {
      exp -= expToNext(expLevel);
      expLevel += 1;
      currentHp = getMaxHp({ ...pet, expLevel });
      levelMessages.push(`${getPetSpecies(pet.speciesId).name}升级到 Lv${expLevel}。`);
    }
    if (expLevel >= MAX_PET_LEVEL) exp = 0;
    return { ...pet, exp, expLevel, currentHp };
  });

  let nextGame: GameState = {
    ...game,
    inventory,
    party: nextParty,
    log: [`战斗胜利。`, ...dropMessages, ...expMessages, ...levelMessages, ...game.log].slice(0, 80)
  };

  if (options?.bossDefeated) {
    nextGame = {
      ...nextGame,
      defeatedBosses: nextGame.defeatedBosses.includes(battle.mapId) ? nextGame.defeatedBosses : [...nextGame.defeatedBosses, battle.mapId],
      log: [`${getMapDefinition(battle.mapId).bossName}被击败。`, ...nextGame.log].slice(0, 80)
    };
  }

  if (options?.capturedPet) {
    nextGame = {
      ...nextGame,
      party: nextGame.party.length < 3 ? [...nextGame.party, options.capturedPet] : nextGame.party,
      storage: nextGame.party.length < 3 ? nextGame.storage : [...nextGame.storage, options.capturedPet],
      log: [
        `${getPetSpecies(options.capturedPet.speciesId).name}${nextGame.party.length < 3 ? "加入队伍" : "进入仓库"}。`,
        ...nextGame.log
      ].slice(0, 80)
    };
    nextGame = markSpecies(nextGame, options.capturedPet.speciesId, true);
  }

  return syncUnlocks(nextGame);
};

export const applyDefeat = (game: GameState): GameState => {
  const map = getMapDefinition(game.activeMapId);
  return {
    ...game,
    position: { ...map.camp },
    party: game.party.map((pet) => ({ ...pet, currentHp: Math.max(1, Math.round(getMaxHp(pet) * 0.45)) })),
    log: ["队伍撤回营地，宠物恢复到少量 HP。", ...game.log].slice(0, 80)
  };
};

export const discoverEnemies = (game: GameState, battle: BattleState): GameState =>
  battle.enemies.reduce((state, enemy) => markSpecies(state, enemy.speciesId, false), game);
