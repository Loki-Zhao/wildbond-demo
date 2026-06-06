import { createInitialState, syncUnlocks } from "./state";
import { clampEnhanceLevel, clampPetLevel, clampRarity, getMaxHp, MAX_PET_LEVEL } from "./balance";
import type { GameState, PetInstance } from "./types";

const SAVE_KEY = "wildbond-demo-save-v1";

const normalizePet = (pet: PetInstance): PetInstance | null => {
  try {
    const level = clampPetLevel(pet.expLevel ?? 1);
    const rarity = clampRarity(pet.rarity);
    const enhanceLevel = clampEnhanceLevel(pet.enhanceLevel);
    const maxHp = getMaxHp({ ...pet, expLevel: level, rarity, enhanceLevel });
    return {
      ...pet,
      expLevel: level,
      rarity,
      enhanceLevel,
      exp: level >= MAX_PET_LEVEL ? 0 : Math.max(0, Math.round(pet.exp ?? 0)),
      currentHp: Math.max(0, Math.min(maxHp, Math.round(pet.currentHp ?? maxHp)))
    };
  } catch {
    return null;
  }
};

const normalizePets = (pets: PetInstance[] | undefined): PetInstance[] =>
  Array.isArray(pets) ? pets.map(normalizePet).filter((pet): pet is PetInstance => Boolean(pet)) : [];

export const loadGame = (): GameState => {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as GameState;
    const initial = createInitialState();
    return syncUnlocks({
      ...initial,
      ...parsed,
      inventory: {
        ...initial.inventory,
        ...parsed.inventory,
        baits: {
          ...initial.inventory.baits,
          ...(parsed.inventory?.baits ?? {})
        },
        crystals: Math.max(0, Math.round(parsed.inventory?.crystals ?? 0))
      },
      party: normalizePets(parsed.party),
      storage: normalizePets(parsed.storage),
      bossChallengeWins:
        parsed.bossChallengeWins && typeof parsed.bossChallengeWins === "object"
          ? Object.fromEntries(
              Object.entries(parsed.bossChallengeWins).map(([mapId, value]) => [mapId, Math.max(0, Math.min(3, Math.round(Number(value) || 0)))])
            )
          : initial.bossChallengeWins,
      stepsSinceEncounter: Math.max(0, Math.round(parsed.stepsSinceEncounter ?? initial.stepsSinceEncounter)),
      log: parsed.log?.length ? parsed.log : ["读取了本地进度。"]
    });
  } catch {
    return createInitialState();
  }
};

export const saveGame = (state: GameState): void => {
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
};

export const clearSave = (): void => {
  window.localStorage.removeItem(SAVE_KEY);
};
