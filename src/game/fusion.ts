import { PETS_BY_LEVEL, getPetSpecies } from "../data/pets";
import { GROWTH_LABELS, MAX_PET_LEVEL } from "./balance";
import { createPetInstance, markSpecies, syncUnlocks } from "./state";
import type { GameState, GrowthLevel, PetInstance } from "./types";

export const canFuse = (a: PetInstance, b: PetInstance): { ok: boolean; reason?: string } => {
  if (a.uid === b.uid) return { ok: false, reason: "不能选择同一只宠物" };
  const speciesA = getPetSpecies(a.speciesId);
  const speciesB = getPetSpecies(b.speciesId);
  if (speciesA.growthLevel !== speciesB.growthLevel) return { ok: false, reason: "需要同一进化阶段" };
  if (speciesA.growthLevel === 3) return { ok: false, reason: "完全体不可继续合成" };
  if (a.expLevel < MAX_PET_LEVEL || b.expLevel < MAX_PET_LEVEL) return { ok: false, reason: "两只宠物都需要达到 Lv10" };
  return { ok: true };
};

const randomSpeciesFromPool = (targetLevel: GrowthLevel, element?: ReturnType<typeof getPetSpecies>["element"]): string => {
  const pool = element ? PETS_BY_LEVEL[targetLevel].filter((species) => species.element === element) : PETS_BY_LEVEL[targetLevel];
  const candidates = pool.length > 0 ? pool : PETS_BY_LEVEL[targetLevel];
  return candidates[Math.floor(Math.random() * candidates.length)].id;
};

export const fusePets = (state: GameState, firstUid: string, secondUid: string): { state: GameState; message: string } => {
  const collection = [...state.party, ...state.storage];
  const first = collection.find((pet) => pet.uid === firstUid);
  const second = collection.find((pet) => pet.uid === secondUid);
  if (!first || !second) return { state, message: "合成对象不存在。" };

  const check = canFuse(first, second);
  if (!check.ok) return { state, message: check.reason ?? "无法合成。" };

  const firstSpecies = getPetSpecies(first.speciesId);
  const secondSpecies = getPetSpecies(second.speciesId);
  const sourceLevel = firstSpecies.growthLevel;
  const targetLevel = (sourceLevel + 1) as GrowthLevel;
  const lockedElement = firstSpecies.element === secondSpecies.element ? firstSpecies.element : undefined;
  const resultSpeciesId = randomSpeciesFromPool(targetLevel, lockedElement);
  const resultPet = createPetInstance(resultSpeciesId);
  const resultSpecies = getPetSpecies(resultSpeciesId);

  let nextParty = state.party.filter((pet) => pet.uid !== firstUid && pet.uid !== secondUid);
  let nextStorage = state.storage.filter((pet) => pet.uid !== firstUid && pet.uid !== secondUid);

  if (nextParty.length < 3) {
    nextParty = [...nextParty, resultPet];
  } else {
    nextStorage = [...nextStorage, resultPet];
  }

  const nextState = syncUnlocks(
    markSpecies(
      {
        ...state,
        party: nextParty,
        storage: nextStorage,
        fusionCount: state.fusionCount + 1,
        firstLv1FusionDone: state.firstLv1FusionDone || sourceLevel === 1,
        firstLv2FusionDone: state.firstLv2FusionDone || sourceLevel === 2,
        log: [`合成成功，获得${GROWTH_LABELS[resultSpecies.growthLevel]}${resultSpecies.name} Lv1。`, ...state.log].slice(0, 80)
      },
      resultSpeciesId,
      true
    )
  );

  return {
    state: nextState,
    message: `合成成功：${resultSpecies.name} Lv1`
  };
};
