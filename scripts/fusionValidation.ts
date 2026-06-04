import { PETS } from "../src/data/pets";
import { canFuse, fusePets } from "../src/game/fusion";
import { createInitialState, createPetInstance } from "../src/game/state";
import { MAX_PET_LEVEL } from "../src/game/balance";
import type { PetInstance } from "../src/game/types";

declare const process: { exitCode?: number };

const makePet = (speciesId: string, currentHp: number): PetInstance => ({
  ...createPetInstance(speciesId, MAX_PET_LEVEL),
  currentHp
});

const validationPets = PETS.filter((species) => species.growthLevel < 3);
const failures: string[] = [];

for (let firstIndex = 0; firstIndex < validationPets.length; firstIndex += 1) {
  for (let secondIndex = firstIndex + 1; secondIndex < validationPets.length; secondIndex += 1) {
    const firstSpecies = validationPets[firstIndex];
    const secondSpecies = validationPets[secondIndex];
    if (firstSpecies.growthLevel !== secondSpecies.growthLevel) continue;

    const first = makePet(firstSpecies.id, 1);
    const second = makePet(secondSpecies.id, 0);
    const check = canFuse(first, second);
    if (!check.ok) {
      failures.push(`${firstSpecies.id} + ${secondSpecies.id}: ${check.reason ?? "canFuse false"}`);
      continue;
    }

    const state = {
      ...createInitialState(),
      party: [makePet(firstSpecies.id, 1)],
      storage: [first, second]
    };
    const result = fusePets(state, first.uid, second.uid, () => 0);
    if (result.state.fusionCount !== state.fusionCount + 1) {
      failures.push(`${firstSpecies.id} + ${secondSpecies.id}: fusePets did not increment fusionCount`);
    }
  }
}

const summary = {
  checkedPairs: validationPets.reduce((total, species, index) => {
    return total + validationPets.slice(index + 1).filter((other) => other.growthLevel === species.growthLevel).length;
  }, 0),
  failures
};

console.log(JSON.stringify(summary, null, 2));
if (failures.length) {
  process.exitCode = 1;
}
