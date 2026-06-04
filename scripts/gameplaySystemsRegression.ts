import { MAPS } from "../src/data/maps";
import { PETS, getPetSpecies } from "../src/data/pets";
import { getSkill } from "../src/data/skills";
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
  bossStatMultiplierForChallenge,
  CAPTURE_STONE_DROP_RATE,
  advanceBattleTurn,
  createBossBattle,
  createWildBattle,
  defendUnit,
  enemyAct,
  finishBattle,
  getActiveUnit,
  MAX_BOSS_CHALLENGE_LEVEL,
  useSkill,
  wildEncounterCandidatesForPosition,
  wildEncounterProfileForPosition
} from "../src/game/combat";
import { getStepAdjustedEncounterRate } from "../src/game/mapLogic";
import { STARTER_EXP_LEVEL, chooseStarter, createInitialState, createPetInstance } from "../src/game/state";
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

const assertEncounterPityCurve = (): void => {
  for (const map of MAPS) {
    const firstStepRate = getStepAdjustedEncounterRate(map.encounterRate, 1);
    const tenthStepRate = getStepAdjustedEncounterRate(map.encounterRate, 10);
    const fourteenthStepRate = getStepAdjustedEncounterRate(map.encounterRate, 14);
    const fifteenthStepRate = getStepAdjustedEncounterRate(map.encounterRate, 15);

    assert(map.encounterRate >= 0.1, `${map.id}: base encounter rate should support frequent wild battles`);
    assert(firstStepRate === map.encounterRate, `${map.id}: first eligible step should use base encounter rate`);
    assert(tenthStepRate > firstStepRate, `${map.id}: tenth eligible step should have higher encounter pressure`);
    assert(fourteenthStepRate >= 0.9, `${map.id}: fourteenth eligible step should be near guaranteed`);
    assert(fifteenthStepRate === 1, `${map.id}: fifteenth eligible step should guarantee encounter`);
  }
};

const assertStarterAndRewardTuning = (): void => {
  const starterState = chooseStarter(createInitialState(), "fire-lizard");
  assert(starterState.party[0]?.expLevel === STARTER_EXP_LEVEL, "starter should begin at configured Lv3");
  assert(starterState.party[0]?.currentHp > 0, "starter should begin with current HP");
  assert(CAPTURE_STONE_DROP_RATE === 0.6, "capture stone drop rate should be 60%");
};

const basicSkillByElement: Record<ElementType, string> = {
  fire: "fire-basic",
  water: "water-basic",
  forest: "forest-basic",
  earth: "earth-basic",
  wind: "wind-basic"
};

const assertElementSkillKits = (): void => {
  for (const pet of PETS) {
    const firstSkill = getSkill(pet.skillIds[0]);
    assert(pet.skillIds.length <= 3, `${pet.id}: should fit the three battle shortcut slots`);
    assert(firstSkill.id === basicSkillByElement[pet.element], `${pet.id}: first skill should be the element basic attack`);
    assert(firstSkill.apCost === 0 && firstSkill.category === "attack" && firstSkill.target === "enemy", `${pet.id}: basic skill should be a 0AP enemy attack`);
  }

  assert(PETS.some((pet) => pet.element === "fire" && pet.skillIds.some((skillId) => getSkill(skillId).target === "allEnemies" && getSkill(skillId).category === "attack")), "fire kits should include group damage");
  assert(PETS.some((pet) => pet.element === "water" && pet.skillIds.some((skillId) => getSkill(skillId).category === "heal" && getSkill(skillId).target === "ally")), "water kits should include single target healing");
  assert(PETS.some((pet) => pet.element === "water" && pet.skillIds.some((skillId) => getSkill(skillId).category === "heal" && getSkill(skillId).target === "allAllies")), "water kits should include group healing");
  assert(PETS.some((pet) => pet.element === "forest" && pet.skillIds.some((skillId) => getSkill(skillId).category === "heal" && getSkill(skillId).target === "allAllies")), "forest kits should include group healing");
  assert(PETS.some((pet) => pet.element === "earth" && pet.skillIds.some((skillId) => getSkill(skillId).category === "defense" && getSkill(skillId).target === "allAllies")), "earth kits should include team defense");

  const battle = createWildBattle({
    ...createInitialState(),
    party: [createPetInstance("fire-lizard", 3)],
    position: { ...MAPS[0].camp }
  });
  const ally = battle.allies[0];
  const enemy = battle.enemies[0];
  const result = useSkill(battle, ally.id, "fire-basic", enemy.id);
  const nextAlly = result.state.allies.find((unit) => unit.id === ally.id);
  assert(nextAlly?.ap === ally.ap, "0AP basic attack should not spend AP");
};

const assertBossChallengeProgression = (): void => {
  const normal = bossStatMultiplierForChallenge(0);
  const first = bossStatMultiplierForChallenge(1);
  const second = bossStatMultiplierForChallenge(2);
  const third = bossStatMultiplierForChallenge(3);

  assert(MAX_BOSS_CHALLENGE_LEVEL === 3, "boss challenge should cap at three clears");
  assert(normal < first && first < second && second < third, "boss challenge multipliers should increase by level");
  assert(bossStatMultiplierForChallenge(99) === third, "boss challenge should clamp above max level");

  const state = {
    ...createInitialState(),
    activeMapId: MAPS[0].id,
    party: ["flame-crown-drake", "scorch-phoenix", "volcano-rhino"].map((speciesId) => createPetInstance(speciesId, MAX_PET_LEVEL))
  };
  const battle = createBossBattle(state, 2);
  assert(battle.bossChallengeLevel === 2, "enhanced boss battle should record challenge level");
  assert(battle.enemies.every((enemy) => enemy.statMultiplier === second), "enhanced boss units should use challenge multiplier");

  const finished = finishBattle(state, battle, { bossDefeated: true });
  assert(finished.defeatedBosses.includes(MAPS[0].id), "enhanced boss victory should still count as boss defeated");
  assert(finished.bossChallengeWins[MAPS[0].id] === 2, "enhanced boss victory should save map challenge progress");

  const clampedBattle = createBossBattle(state, 99);
  assert(clampedBattle.bossChallengeLevel === MAX_BOSS_CHALLENGE_LEVEL, "boss challenge battle should clamp requested level");
};

assertCritRange();
assertElementProfiles();
assertEnhancementEconomy();
assertSpeedTurnOrder();
assertWildEncounterDistanceBands();
assertEncounterPityCurve();
assertStarterAndRewardTuning();
assertElementSkillKits();
assertBossChallengeProgression();

console.log(
  JSON.stringify(
    {
      ok: true,
      checked: [
        "crit",
        "elementProfiles",
        "enhancementEconomy",
        "speedTurnOrder",
        "wildEncounterDistanceBands",
        "encounterPityCurve",
        "starterAndRewardTuning",
        "elementSkillKits",
        "bossChallengeProgression"
      ]
    },
    null,
    2
  )
);
