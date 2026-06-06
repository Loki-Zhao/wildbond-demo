import { PETS_BY_LEVEL, getPetSpecies } from "../data/pets";
import { GROWTH_LABELS, MAX_PET_LEVEL, randomFusionRarity } from "./balance";
import { createPetInstance, markSpecies, syncUnlocks } from "./state";
import type { GameState, GrowthLevel, PetInstance } from "./types";

type FusionSourceLevel = 1 | 2 | 3;
type RandomSource = () => number;

export const FUSION_SUCCESS_RATES: Record<FusionSourceLevel, number> = {
  1: 0.8,
  2: 0.5,
  3: 0.3
};

export const fusionSuccessRateForGrowth = (growthLevel: GrowthLevel): number | undefined =>
  growthLevel === 1 || growthLevel === 2 || growthLevel === 3 ? FUSION_SUCCESS_RATES[growthLevel] : undefined;

export const canFuse = (a: PetInstance, b: PetInstance): { ok: boolean; reason?: string } => {
  if (a.uid === b.uid) return { ok: false, reason: "不能选择同一只宠物" };
  const speciesA = getPetSpecies(a.speciesId);
  const speciesB = getPetSpecies(b.speciesId);
  if (speciesA.growthLevel !== speciesB.growthLevel) return { ok: false, reason: "需要同一阶段" };
  if (a.expLevel < MAX_PET_LEVEL || b.expLevel < MAX_PET_LEVEL) return { ok: false, reason: "两只宠物都需要达到 Lv10" };
  if (speciesA.growthLevel === 4) return { ok: false, reason: "神兽不可继续合成" };
  if (speciesA.growthLevel === 3) {
    if (speciesA.element !== speciesB.element) return { ok: false, reason: "高级合成神兽需要同属性" };
    if (speciesA.id === speciesB.id) return { ok: false, reason: "合成神兽需要两只不同高级宠物" };
  }
  return { ok: true };
};

const pickRandom = <T,>(items: T[], random: RandomSource): T => items[Math.floor(random() * items.length)];

const randomSpeciesFromPool = (targetLevel: GrowthLevel, random: RandomSource, element?: ReturnType<typeof getPetSpecies>["element"]): string => {
  const pool = element ? PETS_BY_LEVEL[targetLevel].filter((species) => species.element === element) : PETS_BY_LEVEL[targetLevel];
  const candidates = pool.length > 0 ? pool : PETS_BY_LEVEL[targetLevel];
  return pickRandom(candidates, random).id;
};

export const fusePets = (
  state: GameState,
  firstUid: string,
  secondUid: string,
  random: RandomSource = Math.random
): { state: GameState; message: string; outcome: "success" | "failure" | "invalid" } => {
  const collection = [...state.party, ...state.storage];
  const first = collection.find((pet) => pet.uid === firstUid);
  const second = collection.find((pet) => pet.uid === secondUid);
  if (!first || !second) return { state, message: "合成对象不存在。", outcome: "invalid" };

  const check = canFuse(first, second);
  if (!check.ok) return { state, message: check.reason ?? "无法合成。", outcome: "invalid" };

  const firstSpecies = getPetSpecies(first.speciesId);
  const secondSpecies = getPetSpecies(second.speciesId);
  const sourceLevel = firstSpecies.growthLevel;
  const targetLevel = (sourceLevel + 1) as GrowthLevel;
  const successRate = fusionSuccessRateForGrowth(sourceLevel) ?? 0;
  const success = random() < successRate;
  const lockedElement = sourceLevel === 3 || firstSpecies.element === secondSpecies.element ? firstSpecies.element : undefined;
  const resultSpeciesId = success ? randomSpeciesFromPool(targetLevel, random, lockedElement) : pickRandom([first, second], random).speciesId;
  const resultPet = createPetInstance(resultSpeciesId, 1, randomFusionRarity(random));
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
        fusionCount: success ? state.fusionCount + 1 : state.fusionCount,
        firstLv1FusionDone: state.firstLv1FusionDone || (success && sourceLevel === 1),
        firstLv2FusionDone: state.firstLv2FusionDone || (success && sourceLevel === 2),
        log: [
          success
            ? `合成成功，获得${GROWTH_LABELS[resultSpecies.growthLevel]}${resultSpecies.name} Lv1（${resultPet.rarity === "rare" ? "稀有" : resultPet.rarity === "weak" ? "弱小" : "普通"}）。`
            : `合成失败，两只材料消失，留下${resultSpecies.name} Lv1（${resultPet.rarity === "rare" ? "稀有" : resultPet.rarity === "weak" ? "弱小" : "普通"}）。`,
          ...state.log
        ].slice(0, 80)
      },
      resultSpeciesId,
      true
    )
  );

  return {
    state: nextState,
    message: success ? `合成成功：${resultSpecies.name} Lv1` : `合成失败：留下${resultSpecies.name} Lv1`,
    outcome: success ? "success" : "failure"
  };
};
