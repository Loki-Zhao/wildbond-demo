import { MAPS } from "../src/data/maps";
import { PETS } from "../src/data/pets";
import { getMaxHp, isAlive, MAX_PET_LEVEL } from "../src/game/balance";
import { advanceBattleTurn, createBossBattle, defendUnit, enemyAct, getActiveUnit } from "../src/game/combat";
import { createInitialState, createPetInstance } from "../src/game/state";
import type { ElementType, PetInstance } from "../src/game/types";

const completePets = PETS.filter((pet) => pet.growthLevel === 3);

const preferredByElement: Record<ElementType, string[]> = {
  fire: ["deep-tide-jiao", "crystal-whale", "moon-bay-mer"],
  water: ["jade-eagle", "ancient-stag", "forest-giant-bear"],
  forest: ["flame-crown-drake", "scorch-phoenix", "volcano-rhino"],
  earth: ["storm-griffin", "sky-thunder-vulture", "cloud-kirin"],
  wind: ["meteor-lion", "ridge-giant-turtle", "ancient-golem"]
};

const makeParty = (element: ElementType): PetInstance[] =>
  preferredByElement[element]
    .map((speciesId) => completePets.find((pet) => pet.id === speciesId))
    .filter(Boolean)
    .slice(0, 3)
    .map((species) => {
      const pet = createPetInstance(species!.id, MAX_PET_LEVEL);
      return { ...pet, currentHp: getMaxHp(pet) };
    });

const summaries = MAPS.map((map) => {
  let battle = createBossBattle({
    ...createInitialState(),
    activeMapId: map.id,
    party: makeParty(map.element)
  });

  for (let step = 1; step <= 96; step += 1) {
    const active = getActiveUnit(battle);
    const result =
      active?.side === "enemy"
        ? enemyAct(battle)
        : active?.side === "ally"
          ? advanceBattleTurn(defendUnit(battle, active.id).state)
          : advanceBattleTurn(battle);
    battle = result.state;
    const survivors = battle.allies.filter(isAlive).length;
    const enemies = battle.enemies.filter(isAlive).length;

    if (result.victory && enemies > 0) {
      throw new Error(`${map.id}: victory was reported while ${enemies} boss units were still alive`);
    }
    if (result.defeat && survivors > 0) {
      throw new Error(`${map.id}: defeat was reported while ${survivors} allies were still alive`);
    }
    if (result.victory || result.defeat) {
      return {
        map: map.id,
        ended: result.victory ? "victory" : "defeat",
        round: battle.round,
        survivors,
        enemies
      };
    }
    if (battle.round > 8) break;
  }

  return {
    map: map.id,
    ended: "ongoing",
    round: battle.round,
    survivors: battle.allies.filter(isAlive).length,
    enemies: battle.enemies.filter(isAlive).length
  };
});

console.log(JSON.stringify({ ok: true, summaries }, null, 2));
