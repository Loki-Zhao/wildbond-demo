import { MAPS } from "../src/data/maps";
import { PETS, getPetSpecies } from "../src/data/pets";
import { getSkill } from "../src/data/skills";
import { elementMultiplier, getBattleUnitStats, getMaxHp, isAlive, MAX_PET_LEVEL } from "../src/game/balance";
import { advanceBattleTurn, createBossBattle, defendUnit, enemyAct, getActiveUnit, useSkill } from "../src/game/combat";
import { createInitialState, createPetInstance } from "../src/game/state";
import type { BattleState, BattleUnit, ElementType, GameState, PetInstance, Skill } from "../src/game/types";

interface SimulationSummary {
  map: string;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  averageRounds: number;
  averageSurvivors: number;
  party: string[];
  bossTeam: string[];
}

const trials = Number.parseInt(process.argv[2] ?? "300", 10);
const mode = process.argv[3] ?? "recommended";
const maxRounds = 26;

const completePets = PETS.filter((pet) => pet.growthLevel === 3);

const advantageFor: Record<ElementType, ElementType[]> = {
  fire: ["water"],
  water: ["forest"],
  forest: ["fire"],
  earth: ["wind"],
  wind: ["earth"]
};

const preferredByElement: Record<ElementType, string[]> = {
  fire: ["deep-tide-jiao", "crystal-whale", "moon-bay-mer"],
  water: ["jade-eagle", "ancient-stag", "forest-giant-bear"],
  forest: ["flame-crown-drake", "scorch-phoenix", "volcano-rhino"],
  earth: ["storm-griffin", "sky-thunder-vulture", "cloud-kirin"],
  wind: ["meteor-lion", "ridge-giant-turtle", "ancient-golem"]
};

const makeParty = (mapElement: ElementType, partyIds?: string[]): PetInstance[] => {
  const speciesList = partyIds
    ? partyIds.map((speciesId) => completePets.find((pet) => pet.id === speciesId)).filter(Boolean)
    : preferredByElement[mapElement]
    .map((speciesId) => completePets.find((pet) => pet.id === speciesId))
    .filter(Boolean)
        .slice(0, 3);
  const fallback = completePets.filter((pet) => advantageFor[mapElement].includes(pet.element)).slice(0, 3);
  return (speciesList.length >= 3 ? speciesList : fallback).map((species) => {
    const pet = createPetInstance(species!.id, MAX_PET_LEVEL);
    return { ...pet, currentHp: getMaxHp(pet) };
  });
};

const makeGameForBoss = (mapId: string, party: PetInstance[]): GameState => ({
  ...createInitialState(),
  activeMapId: mapId,
  party
});

const hpRatio = (unit: BattleUnit): number => unit.currentHp / getBattleUnitStats(unit).hp;

const enemyScore = (skill: Skill, enemy: BattleUnit): number => {
  const species = getPetSpecies(enemy.speciesId);
  const lowHpBonus = 1 - hpRatio(enemy);
  const advantageBonus = skill.element === species.element ? -0.1 : advantageFor[species.element].includes(skill.element) ? 0.35 : 0;
  return lowHpBonus + advantageBonus + (enemy.isBoss ? 0.05 : 0);
};

const estimateAttackScore = (skill: Skill, caster: BattleUnit, enemy: BattleUnit): number => {
  const casterStats = getBattleUnitStats(caster);
  const enemyStats = getBattleUnitStats(enemy);
  const species = getPetSpecies(enemy.speciesId);
  const multiplier = elementMultiplier(skill.element, species.element);
  return ((skill.power ?? 0) + casterStats.attack * (skill.multiplier ?? 1) - enemyStats.defense * 0.6) * multiplier;
};

const pickLowestHpAlly = (battle: BattleState): BattleUnit =>
  battle.allies.filter(isAlive).sort((a, b) => hpRatio(a) - hpRatio(b))[0];

const pickTargetEnemy = (battle: BattleState, skill: Skill, caster: BattleUnit): BattleUnit => {
  const aliveEnemies = battle.enemies.filter(isAlive);
  return aliveEnemies
    .map((enemy) => ({
      enemy,
      score: enemyScore(skill, enemy) + Math.max(0, estimateAttackScore(skill, caster, enemy)) / 100
    }))
    .sort((a, b) => b.score - a.score)[0].enemy;
};

const chooseAction = (battle: BattleState, actor: BattleUnit): { type: "skill"; skill: Skill; targetId?: string } | { type: "defend" } => {
  const species = getPetSpecies(actor.speciesId);
  const skills = species.skillIds.map(getSkill).filter((skill) => skill.apCost <= actor.ap);
  const lowestAlly = pickLowestHpAlly(battle);
  const actorRatio = hpRatio(actor);

  if (actorRatio < 0.24 && battle.enemies.length > 1) return { type: "defend" };

  const emergencyHeal = skills
    .filter((skill) => skill.category === "heal" && hpRatio(lowestAlly) < 0.58)
    .sort((a, b) => b.apCost - a.apCost)[0];
  if (emergencyHeal) {
    return {
      type: "skill",
      skill: emergencyHeal,
      targetId: emergencyHeal.target === "self" ? actor.id : lowestAlly.id
    };
  }

  const defensiveSetup = skills
    .filter((skill) => ["defense", "support"].includes(skill.category) && battle.round <= 2)
    .sort((a, b) => b.apCost - a.apCost)[0];
  if (defensiveSetup) {
    const targetId = defensiveSetup.target === "ally" ? lowestAlly.id : defensiveSetup.target === "self" ? actor.id : undefined;
    return { type: "skill", skill: defensiveSetup, targetId };
  }

  const attackSkill = skills
    .filter((skill) => skill.category === "attack")
    .sort((a, b) => {
      const targetA = pickTargetEnemy(battle, a, actor);
      const targetB = pickTargetEnemy(battle, b, actor);
      return estimateAttackScore(b, actor, targetB) - estimateAttackScore(a, actor, targetA);
    })[0];

  if (attackSkill) {
    return { type: "skill", skill: attackSkill, targetId: pickTargetEnemy(battle, attackSkill, actor).id };
  }

  return { type: "defend" };
};

const runOneBattle = (mapId: string, partyIds?: string[]): { victory: boolean; rounds: number; survivors: number; bossTeam: string[]; party: string[] } => {
  const party = makeParty(MAPS.find((map) => map.id === mapId)!.element, partyIds);
  let battle = createBossBattle(makeGameForBoss(mapId, party));
  const bossTeam = battle.enemies.map((enemy) => enemy.speciesId);

  for (let step = 1; step <= maxRounds * 16; step += 1) {
    const active = getActiveUnit(battle);
    const result =
      active?.side === "enemy"
        ? enemyAct(battle)
        : active?.side === "ally"
          ? (() => {
              const action = chooseAction(battle, active);
              const actionResult = action.type === "defend" ? defendUnit(battle, active.id) : useSkill(battle, active.id, action.skill.id, action.targetId);
              return actionResult.victory || actionResult.defeat ? actionResult : advanceBattleTurn(actionResult.state);
            })()
          : advanceBattleTurn(battle);
    battle = result.state;

    if (result.victory) {
      return {
        victory: true,
        rounds: battle.round,
        survivors: battle.allies.filter(isAlive).length,
        bossTeam,
        party: party.map((pet) => pet.speciesId)
      };
    }
    if (result.defeat) {
      return {
        victory: false,
        rounds: battle.round,
        survivors: 0,
        bossTeam,
        party: party.map((pet) => pet.speciesId)
      };
    }
    if (battle.round > maxRounds) break;
  }

  return {
    victory: false,
    rounds: maxRounds,
    survivors: battle.allies.filter(isAlive).length,
    bossTeam,
    party: party.map((pet) => pet.speciesId)
  };
};

const summarizeResults = (mapId: string, results: ReturnType<typeof runOneBattle>[]): SimulationSummary => {
  const wins = results.filter((result) => result.victory).length;
  const losses = results.filter((result) => !result.victory && result.survivors === 0).length;
  const draws = results.length - wins - losses;
  return {
    map: mapId,
    wins,
    losses,
    draws,
    winRate: Number((wins / trials).toFixed(3)),
    averageRounds: Number((results.reduce((sum, result) => sum + result.rounds, 0) / trials).toFixed(1)),
    averageSurvivors: Number((results.reduce((sum, result) => sum + result.survivors, 0) / trials).toFixed(2)),
    party: results[0].party,
    bossTeam: results[0].bossTeam
  };
};

const combinations = (ids: string[]): string[][] => {
  const results: string[][] = [];
  for (let first = 0; first < ids.length - 2; first += 1) {
    for (let second = first + 1; second < ids.length - 1; second += 1) {
      for (let third = second + 1; third < ids.length; third += 1) {
        results.push([ids[first], ids[second], ids[third]]);
      }
    }
  }
  return results;
};

const summaries: SimulationSummary[] =
  mode === "search"
    ? MAPS.flatMap((map) => {
        const ids = completePets.map((pet) => pet.id);
        return combinations(ids)
          .map((partyIds) => summarizeResults(map.id, Array.from({ length: trials }, () => runOneBattle(map.id, partyIds))))
          .sort((a, b) => b.winRate - a.winRate || b.averageSurvivors - a.averageSurvivors)
          .slice(0, 5);
      })
    : MAPS.map((map) => summarizeResults(map.id, Array.from({ length: trials }, () => runOneBattle(map.id))));

console.log(JSON.stringify({ trials, mode, maxRounds, summaries }, null, 2));
