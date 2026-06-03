import { MAPS } from "../src/data/maps";
import { PETS, getPetSpecies } from "../src/data/pets";
import {
  MAX_ENHANCE_LEVEL,
  MAX_CRIT_RATE,
  MIN_CRIT_RATE,
  decomposeCrystalValue,
  enhancementCostForNext,
  enhancementSpent,
  getBattleUnitStats,
  getStatsForSpecies,
  isAlive,
  MAX_PET_LEVEL
} from "../src/game/balance";
import {
  advanceBattleTurn,
  createBossBattle,
  createWildBattle,
  defendUnit,
  enemyAct,
  getActiveUnit,
  wildEncounterCandidatesForPosition,
  wildEncounterProfileForPosition
} from "../src/game/combat";
import { createInitialState, createPetInstance } from "../src/game/state";
import type { BattleUnit, ElementType } from "../src/game/types";

const assert = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const average = (values: number[]): number => values.reduce((sum, value) => sum + value, 0) / values.length;

const assertCritRange = (): void => {
  for (const species of PETS) {
    for (const level of [1, MAX_PET_LEVEL]) {
      for (const enhanceLevel of [0, 1, 2, MAX_ENHANCE_LEVEL]) {
        const stats = getStatsForSpecies(species.id, level, enhanceLevel);
        assert(stats.crit >= MIN_CRIT_RATE && stats.crit <= MAX_CRIT_RATE, `${species.id}: crit out of range at Lv${level}+${enhanceLevel}`);
      }
    }
  }
};

const assertElementProfiles = (): void => {
  const byElement = (element: ElementType) => PETS.filter((pet) => pet.element === element).map((pet) => getStatsForSpecies(pet.id, MAX_PET_LEVEL));
  const forest = byElement("forest");
  const fire = byElement("fire");
  const wind = byElement("wind");
  const earth = byElement("earth");
  const water = byElement("water");

  assert(average(forest.map((stats) => stats.defense)) > average(forest.map((stats) => stats.attack)), "forest should lean defense over attack");
  assert(average(forest.map((stats) => stats.speed)) > average(earth.map((stats) => stats.speed)), "forest should be faster than earth on average");
  assert(average(fire.map((stats) => stats.attack)) > average(fire.map((stats) => stats.defense)), "fire should lean attack over defense");
  assert(average(wind.map((stats) => stats.speed)) > average(water.map((stats) => stats.speed)), "wind should lean speed");
  assert(average(earth.map((stats) => stats.hp + stats.defense)) > average(wind.map((stats) => stats.hp + stats.defense)), "earth should lean bulk");
};

const assertEnhancementEconomy = (): void => {
  const pet = createPetInstance("storm-griffin", MAX_PET_LEVEL);
  assert(enhancementCostForNext(0) === 3, "enhance +1 should cost 3 crystals");
  assert(enhancementCostForNext(1) === 6, "enhance +2 should cost 6 crystals");
  assert(enhancementCostForNext(2) === 10, "enhance +3 should cost 10 crystals");
  assert(enhancementCostForNext(3) === undefined, "enhance +3 should be max");
  assert(enhancementSpent(3) === 19, "cumulative +3 spend should be 19 crystals");
  assert(decomposeCrystalValue({ ...pet, enhanceLevel: 3 }) === 22, "enhanced complete pet should refund base 3 plus spent crystals");
};

const expectedTurnOrder = (units: BattleUnit[]): string[] =>
  units
    .filter(isAlive)
    .map((unit, index) => ({ unit, index }))
    .sort((a, b) => {
      const speedDiff = getBattleUnitStats(b.unit).speed - getBattleUnitStats(a.unit).speed;
      if (speedDiff !== 0) return speedDiff;
      if (a.unit.side !== b.unit.side) return a.unit.side === "ally" ? -1 : 1;
      return a.index - b.index;
    })
    .map(({ unit }) => unit.id);

const assertSpeedTurnOrder = (): void => {
  const party = ["storm-griffin", "ancient-golem", "crystal-whale"].map((speciesId) => createPetInstance(speciesId, MAX_PET_LEVEL));
  const battle = createBossBattle({
    ...createInitialState(),
    activeMapId: MAPS[0].id,
    party
  });
  const expected = expectedTurnOrder([...battle.allies, ...battle.enemies]);
  assert(battle.turnOrder.join("|") === expected.join("|"), "initial turn order should be sorted by speed with ally tie priority");

  const active = getActiveUnit(battle);
  assert(active, "battle should have an active unit");
  const result =
    active.side === "enemy"
      ? enemyAct(battle)
      : advanceBattleTurn(defendUnit(battle, active.id).state);
  const nextActive = getActiveUnit(result.state);
  assert(result.victory || result.defeat || nextActive?.id !== active.id || result.state.round > battle.round, "battle should advance after an action");
};

const assertWildEncounterDistanceBands = (): void => {
  for (const map of MAPS) {
    const party = [createPetInstance("fire-lizard", MAX_PET_LEVEL)];
    const nearState = {
      ...createInitialState(),
      activeMapId: map.id,
      party,
      position: { x: Math.min(map.width - 1, map.camp.x + 2), y: map.camp.y }
    };
    const nearProfile = wildEncounterProfileForPosition(nearState, map);
    const nearCandidates = wildEncounterCandidatesForPosition(nearState, map);
    assert(nearProfile.maxLevel <= 2, `${map.id}: near camp max wild level should stay low`);
    assert(nearCandidates.every((entry) => getPetSpecies(entry.speciesId).growthLevel === 1), `${map.id}: near camp should only include initial forms`);

    for (let trial = 0; trial < 20; trial += 1) {
      const battle = createWildBattle(nearState);
      assert(battle.enemies.every((enemy) => getPetSpecies(enemy.speciesId).growthLevel === 1), `${map.id}: near camp battle rolled evolved wild pet`);
      assert(battle.enemies.every((enemy) => enemy.expLevel <= 2), `${map.id}: near camp battle rolled too high level`);
      assert(battle.enemies.length === 1, `${map.id}: near camp should only roll one enemy`);
    }

    const farState = {
      ...nearState,
      position: { ...map.boss }
    };
    const farProfile = wildEncounterProfileForPosition(farState, map);
    const farCandidates = wildEncounterCandidatesForPosition(farState, map);
    assert(farProfile.minLevel >= 6, `${map.id}: far wild level floor should be meaningfully higher`);
    assert(farCandidates.some((entry) => getPetSpecies(entry.speciesId).growthLevel === 2), `${map.id}: far area should include evolved wild pets`);
  }
};

assertCritRange();
assertElementProfiles();
assertEnhancementEconomy();
assertSpeedTurnOrder();
assertWildEncounterDistanceBands();

console.log(JSON.stringify({ ok: true, checked: ["crit", "elementProfiles", "enhancementEconomy", "speedTurnOrder", "wildEncounterDistanceBands"] }, null, 2));
