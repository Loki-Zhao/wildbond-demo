import { MAPS, getMapDefinition } from "../data/maps";
import { PETS, STARTER_SPECIES_IDS, getPetSpecies } from "../data/pets";
import { clampPetLevel, clampRarity, getMaxHp } from "./balance";
import type { GameState, Inventory, PetInstance, PetRarity } from "./types";

export const STARTER_EXP_LEVEL = 3;

const defaultInventory = (): Inventory => ({
  captureStones: 12,
  healingFruits: 6,
  crystals: 0,
  baits: {
    fire: 1,
    water: 1,
    forest: 1,
    earth: 1,
    wind: 1
  }
});

export const createUid = (prefix: string): string => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const createPetInstance = (speciesId: string, expLevel?: number, rarity: PetRarity = "normal"): PetInstance => {
  getPetSpecies(speciesId);
  const level = clampPetLevel(expLevel ?? 1);
  const normalizedRarity = clampRarity(rarity);
  return {
    uid: createUid(speciesId),
    speciesId,
    expLevel: level,
    exp: 0,
    rarity: normalizedRarity,
    currentHp: getMaxHp({ uid: "preview", speciesId, expLevel: level, exp: 0, currentHp: 1, rarity: normalizedRarity }),
    enhanceLevel: 0
  };
};

export const createInitialState = (): GameState => ({
  party: [],
  storage: [],
  activeMapId: "meadow",
  position: { ...getMapDefinition("meadow").camp },
  stepsSinceEncounter: 0,
  unlockedMaps: ["meadow"],
  defeatedBosses: [],
  bossChallengeWins: {},
  discoveredSpecies: STARTER_SPECIES_IDS,
  ownedSpecies: [],
  inventory: defaultInventory(),
  fusionCount: 0,
  firstLv1FusionDone: false,
  firstLv2FusionDone: false,
  log: ["原野的风从营地吹过。"]
});

export const addLog = (state: GameState, message: string): GameState => ({
  ...state,
  log: [message, ...state.log].slice(0, 80)
});

export const markSpecies = (state: GameState, speciesId: string, owned = false): GameState => {
  const discoveredSpecies = state.discoveredSpecies.includes(speciesId)
    ? state.discoveredSpecies
    : [...state.discoveredSpecies, speciesId];
  const ownedSpecies = owned && !state.ownedSpecies.includes(speciesId) ? [...state.ownedSpecies, speciesId] : state.ownedSpecies;
  return {
    ...state,
    discoveredSpecies,
    ownedSpecies
  };
};

export const healParty = (state: GameState): GameState => ({
  ...state,
  party: state.party.map((pet) => ({
    ...pet,
    currentHp: getMaxHp(pet)
  })),
  log: ["队伍状态已恢复。", ...state.log].slice(0, 80)
});

export const syncUnlocks = (state: GameState): GameState => {
  const unlocked = new Set(state.unlockedMaps);
  const defeated = new Set(state.defeatedBosses);

  if (defeated.has("meadow")) unlocked.add("coast");
  if (state.firstLv1FusionDone) unlocked.add("volcano");
  if (defeated.has("coast") && defeated.has("volcano")) unlocked.add("canyon");
  if (state.firstLv2FusionDone && defeated.has("canyon")) unlocked.add("highland");

  return {
    ...state,
    unlockedMaps: MAPS.filter((map) => unlocked.has(map.id)).map((map) => map.id)
  };
};

export const setActiveMap = (state: GameState, mapId: string): GameState => {
  const map = getMapDefinition(mapId);
  return {
    ...state,
    activeMapId: mapId,
    position: { ...map.camp },
    stepsSinceEncounter: 0,
    log: [`抵达${map.name}。`, ...state.log].slice(0, 80)
  };
};

export const addPetToCollection = (state: GameState, pet: PetInstance): GameState => {
  const species = getPetSpecies(pet.speciesId);
  const nextState =
    state.party.length < 3
      ? {
          ...state,
          party: [...state.party, pet],
          log: [`${species.name}加入出战队伍。`, ...state.log].slice(0, 80)
        }
      : {
          ...state,
          storage: [...state.storage, pet],
          log: [`${species.name}进入仓库。`, ...state.log].slice(0, 80)
        };
  return markSpecies(nextState, pet.speciesId, true);
};

export const chooseStarter = (state: GameState, speciesId: string): GameState => {
  const starter = createPetInstance(speciesId, STARTER_EXP_LEVEL, "rare");
  const species = getPetSpecies(speciesId);
  return syncUnlocks(
    markSpecies(
      {
        ...state,
        party: [starter],
        ownedSpecies: [speciesId],
        log: [`${species.name}与你结下第一份契约。`, ...state.log].slice(0, 80)
      },
      speciesId,
      true
    )
  );
};

export const getCollectionCount = (state: GameState): number => new Set([...state.party, ...state.storage].map((pet) => pet.speciesId)).size;

export const allKnownSpecies = (): string[] => PETS.map((pet) => pet.id);
