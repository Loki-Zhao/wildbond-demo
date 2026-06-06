import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { BattleView } from "./components/BattleView";
import { GameGuide } from "./components/GameGuide";
import { MapView } from "./components/MapView";
import { PixelIcon } from "./components/PixelIcon";
import { PixelPetSprite } from "./components/PixelSprite";
import { ShortcutHint } from "./components/ShortcutHint";
import { useSkillInfo } from "./components/SkillInfo";
import { MAPS, getMapDefinition } from "./data/maps";
import { PETS, STARTER_SPECIES_IDS, getPetSpecies } from "./data/pets";
import { STARTER_ARTWORK } from "./data/starterArtwork";
import { getSkill } from "./data/skills";
import {
  ELEMENT_COLORS,
  MAX_ENHANCE_LEVEL,
  MAX_PET_LEVEL,
  decomposeCrystalValue,
  enhancementCostForNext,
  enhancementSuccessRateForNext,
  expToNext,
  getMaxHp,
  getPetStats,
  getStatsForSpecies
} from "./game/balance";
import {
  advanceBattleTurn,
  applyDefeat,
  createBossBattle,
  createWildBattle,
  discoverEnemies,
  defendUnit,
  enemyAct,
  finishBattle,
  MAX_BOSS_CHALLENGE_LEVEL,
  tryCapture,
  useSkill
} from "./game/combat";
import { canFuse, fusePets } from "./game/fusion";
import { canMoveTo, distance, getEncounterRateForTerrain, getStepAdjustedEncounterRate, getTerrainAt } from "./game/mapLogic";
import { clearSave, loadGame, saveGame } from "./game/save";
import { addLog, addPetToCollection, chooseStarter, healParty, setActiveMap, syncUnlocks } from "./game/state";
import type { BattleState, GameState, PetInstance } from "./game/types";
import {
  elementLabel,
  fusionReason,
  growthLabel,
  mapName,
  petName,
  rarityLabel,
  readStoredLanguage,
  roleText,
  skillTooltip,
  skillName,
  statFocusText,
  t,
  translateLog,
  type Language,
  writeStoredLanguage
} from "./i18n";

type PanelId = "party" | "storage" | "fusion" | "dex" | "maps";
type OperationToast = {
  id: string;
  message: string;
  tone: "success" | "failure";
};

const isDesktopShortcutEnvironment = (): boolean =>
  typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
};

const unlockText = (language: Language, mapId: string): string => {
  if (mapId === "meadow") return t(language, "unlockedMeadow");
  if (mapId === "coast") return t(language, "unlockedCoast");
  if (mapId === "volcano") return t(language, "unlockedVolcano");
  if (mapId === "canyon") return t(language, "unlockedCanyon");
  return t(language, "unlockedHighland");
};

const allPets = (game: GameState): PetInstance[] => [...game.party, ...game.storage];

function PetCard({
  pet,
  compact,
  language,
  actions
}: {
  pet: PetInstance;
  compact?: boolean;
  language: Language;
  actions?: ReactNode;
}) {
  const { bindSkillInfo, skillInfoPopup } = useSkillInfo();
  const species = getPetSpecies(pet.speciesId);
  const stats = getPetStats(pet);
  const hpMax = getMaxHp(pet);
  const expNeed = expToNext(pet.expLevel);
  const maxLevel = pet.expLevel >= MAX_PET_LEVEL;
  const enhanceSuffix = pet.enhanceLevel ? ` +${pet.enhanceLevel}` : "";

  return (
    <article className={`pet-card ${compact ? "compact" : ""}`}>
      <div className="pet-card-head">
        <PixelPetSprite speciesId={species.id} element={species.element} growthLevel={species.growthLevel} size={compact ? "small" : "medium"} />
        <div>
          <strong>{petName(language, species.id, species.name)}{enhanceSuffix}</strong>
          <span>
            {growthLabel(language, species.growthLevel)} · {rarityLabel(language, pet.rarity)} · Lv{pet.expLevel}
          </span>
        </div>
      </div>
      <div className="hpbar small">
        <span style={{ width: `${Math.max(0, Math.min(100, (pet.currentHp / hpMax) * 100))}%` }} />
      </div>
      <div className="pet-stats">
        <span>HP {pet.currentHp}/{hpMax}</span>
        <span>{t(language, "attack")} {stats.attack}</span>
        <span>{t(language, "defenseStat")} {stats.defense}</span>
        <span>{t(language, "speed")} {stats.speed}</span>
        <span>{t(language, "crit")} {stats.crit}%</span>
      </div>
      {!compact ? (
        <>
          <div className="skill-list">
            {species.skillIds.map((skillId) => {
              const skill = getSkill(skillId);
              return (
                <span className="skill-info-trigger" key={skill.id} {...bindSkillInfo(skillTooltip(language, skill))}>
                  {skillName(language, skill.id, skill.name)}
                  <small>{skill.apCost}AP</small>
                </span>
              );
            })}
          </div>
          <div className="exp-line">
            {maxLevel ? t(language, "maxLevelFusion") : `${t(language, "exp")} ${pet.exp}/${expNeed}`}
          </div>
        </>
      ) : null}
      {actions ? <div className="card-actions">{actions}</div> : null}
      {skillInfoPopup}
    </article>
  );
}

function StarterOverlay({ language, onChoose }: { language: Language; onChoose: (speciesId: string) => void }) {
  return (
    <div className="battle-backdrop">
      <section className="starter-panel">
        <h1>{t(language, "appTitle")}</h1>
        <p>{t(language, "starterPrompt")}</p>
        <div className="starter-grid">
          {STARTER_SPECIES_IDS.map((speciesId) => {
            const species = getPetSpecies(speciesId);
            return (
              <button className="starter-card" key={species.id} onClick={() => onChoose(species.id)}>
                <span className="starter-art-frame" aria-hidden="true">
                  <img className="starter-art" src={STARTER_ARTWORK[species.id]} alt="" draggable={false} />
                </span>
                <strong>{petName(language, species.id, species.name)}</strong>
                <small>
              {elementLabel(language, species.element)} · Lv3 · {rarityLabel(language, "rare")} · {roleText(language, species.role)}
                </small>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function DexDetailModal({ speciesId, language, onClose }: { speciesId: string; language: Language; onClose: () => void }) {
  const { bindSkillInfo, skillInfoPopup } = useSkillInfo();
  const species = getPetSpecies(speciesId);
  const statsLv1 = getStatsForSpecies(species.id, 1);
  const statsLv10 = getStatsForSpecies(species.id, MAX_PET_LEVEL);
  return (
    <div className="modal-backdrop">
      <section className="dex-detail-panel">
        <button className="modal-close square-button" type="button" onClick={onClose} title={t(language, "close")}>
          <PixelIcon name="x" size={18} />
        </button>
        <div className="dex-detail-hero">
          <PixelPetSprite speciesId={species.id} element={species.element} growthLevel={species.growthLevel} size="large" active />
          <div>
            <span className="element-chip" style={{ background: ELEMENT_COLORS[species.element] }}>
              {elementLabel(language, species.element)}
            </span>
            <h2>{petName(language, species.id, species.name)}</h2>
            <p>
              {growthLabel(language, species.growthLevel)} · {roleText(language, species.role)} · {statFocusText(language, species.statFocus)}
            </p>
          </div>
        </div>
        <div className="dex-detail-stats">
          <div>
            <strong>{t(language, "baseLv1")}</strong>
            <span>HP {statsLv1.hp}</span>
            <span>{t(language, "attack")} {statsLv1.attack}</span>
            <span>{t(language, "defenseStat")} {statsLv1.defense}</span>
            <span>{t(language, "speed")} {statsLv1.speed}</span>
            <span>{t(language, "crit")} {statsLv1.crit}%</span>
          </div>
          <div>
            <strong>{t(language, "baseLv10")}</strong>
            <span>HP {statsLv10.hp}</span>
            <span>{t(language, "attack")} {statsLv10.attack}</span>
            <span>{t(language, "defenseStat")} {statsLv10.defense}</span>
            <span>{t(language, "speed")} {statsLv10.speed}</span>
            <span>{t(language, "crit")} {statsLv10.crit}%</span>
          </div>
        </div>
        <div className="dex-detail-skills">
          {species.skillIds.map((skillId) => {
            const skill = getSkill(skillId);
            return (
              <span className="skill-info-trigger" key={skill.id} {...bindSkillInfo(skillTooltip(language, skill))}>
                {skillName(language, skill.id, skill.name)}
                <small>{skill.apCost} AP</small>
              </span>
            );
          })}
        </div>
        {skillInfoPopup}
      </section>
    </div>
  );
}

export function App() {
  const [game, setGame] = useState<GameState>(() => loadGame());
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [battleOutcome, setBattleOutcome] = useState<"defeat" | null>(null);
  const [panel, setPanel] = useState<PanelId>("party");
  const [fusionPick, setFusionPick] = useState<string[]>([]);
  const [dexDetailSpeciesId, setDexDetailSpeciesId] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [operationToast, setOperationToast] = useState<OperationToast | null>(null);
  const [language, setLanguage] = useState<Language>(() => readStoredLanguage());

  const activeMap = getMapDefinition(game.activeMapId);
  const defeatedCurrentBoss = game.defeatedBosses.includes(game.activeMapId);
  const currentBossChallengeLevel = Math.max(0, Math.min(MAX_BOSS_CHALLENGE_LEVEL, Math.round(game.bossChallengeWins?.[game.activeMapId] ?? 0)));

  const showOperationToast = (message: string, tone: OperationToast["tone"]) => {
    setOperationToast({
      id: `${Date.now()}-${Math.random()}`,
      message,
      tone
    });
  };

  useEffect(() => {
    saveGame(game);
  }, [game]);

  useEffect(() => {
    if (!operationToast) return;
    const timer = window.setTimeout(() => setOperationToast(null), 1000);
    return () => window.clearTimeout(timer);
  }, [operationToast]);

  useEffect(() => {
    writeStoredLanguage(language);
    document.documentElement.lang = language === "ja" ? "ja" : "zh-CN";
    document.title = `${t(language, "appTitle")} Demo`;
  }, [language]);

  const startBattle = (nextBattle: BattleState) => {
    setGame((current) => discoverEnemies(current, nextBattle));
    setBattleOutcome(null);
    setBattle(nextBattle);
  };

  const move = (dx: number, dy: number) => {
    if (battle || battleOutcome || game.party.length === 0) return;
    if (game.party.every((pet) => pet.currentHp <= 0)) {
      setGame((current) => addLog(current, "队伍需要恢复后才能继续探索。"));
      return;
    }

    const nextX = game.position.x + dx;
    const nextY = game.position.y + dy;
    if (!canMoveTo(activeMap, nextX, nextY)) return;

    const terrain = getTerrainAt(activeMap, nextX, nextY);
    const baseRate = getEncounterRateForTerrain(activeMap, terrain);
    const stepsSinceEncounter = baseRate > 0 ? game.stepsSinceEncounter + 1 : game.stepsSinceEncounter;
    const moved = {
      ...game,
      position: { x: nextX, y: nextY },
      stepsSinceEncounter
    };

    if (distance({ x: nextX, y: nextY }, activeMap.boss) <= 1 && !defeatedCurrentBoss) {
      const battleState = { ...moved, stepsSinceEncounter: 0 };
      setGame(battleState);
      startBattle(createBossBattle(battleState));
      return;
    }

    const rate = getStepAdjustedEncounterRate(baseRate, stepsSinceEncounter);
    if (rate > 0 && Math.random() < rate) {
      const battleState = { ...moved, stepsSinceEncounter: 0 };
      setGame(battleState);
      startBattle(createWildBattle(battleState));
      return;
    }

    setGame(moved);
  };

  const moveTowardTile = (targetX: number, targetY: number) => {
    if (targetX === game.position.x && targetY === game.position.y) return;
    const deltaX = targetX - game.position.x;
    const deltaY = targetY - game.position.y;
    if (Math.abs(deltaX) >= Math.abs(deltaY)) {
      move(Math.sign(deltaX), 0);
      return;
    }
    move(0, Math.sign(deltaY));
  };

  const handleBattleResult = (resultBattle: BattleState, victory?: boolean, defeat?: boolean) => {
    if (victory) {
      setGame((current) => finishBattle(current, resultBattle, { bossDefeated: resultBattle.isBoss }));
      setBattle(null);
      setBattleOutcome(null);
      return;
    }
    if (defeat) {
      setBattle(resultBattle);
      setBattleOutcome("defeat");
      return;
    }
    setBattle(resultBattle);
  };

  const handleUseSkill = (casterId: string, skillId: string, targetId?: string) => {
    if (!battle) return;
    const result = useSkill(battle, casterId, skillId, targetId);
    const advanced = result.victory || result.defeat ? result : advanceBattleTurn(result.state);
    handleBattleResult(advanced.state, advanced.victory, advanced.defeat);
  };

  const handleEnemyAct = () => {
    if (!battle) return;
    const result = enemyAct(battle);
    handleBattleResult(result.state, result.victory, result.defeat);
  };

  const handleDefend = (allyId: string) => {
    if (!battle) return;
    const result = defendUnit(battle, allyId);
    const advanced = result.victory || result.defeat ? result : advanceBattleTurn(result.state);
    handleBattleResult(advanced.state, advanced.victory, advanced.defeat);
  };

  const handleCapture = (enemyId: string) => {
    if (!battle) return;
    if (game.inventory.captureStones <= 0) {
      setBattle({ ...battle, log: ["捕获石不足。", ...battle.log].slice(0, 80) });
      return;
    }

    const result = tryCapture(battle, enemyId);
    const inventory = {
      ...game.inventory,
      captureStones: Math.max(0, game.inventory.captureStones - 1)
    };
    let nextGame: GameState = { ...game, inventory };
    if (result.success && result.pet) {
      nextGame = addPetToCollection(nextGame, result.pet);
    }
    setGame(nextGame);
    if (result.battle.enemies.length === 0) {
      handleBattleResult(result.battle, true, false);
      return;
    }
    setBattle(result.battle);
  };

  const returnHome = () => {
    if (battle || battleOutcome || game.party.length === 0) return;
    setGame((current) => {
      const map = getMapDefinition(current.activeMapId);
      return healParty(
        addLog(
          {
            ...current,
            position: { ...map.camp }
          },
          `返回${map.name}营地。`
        )
      );
    });
  };

  const recoverAtCamp = () => {
    if (battle || battleOutcome || game.party.length === 0) return;
    if (distance(game.position, activeMap.camp) > 3) return;
    setGame((current) => healParty(current));
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (battle || battleOutcome || game.party.length === 0 || isEditableTarget(event.target)) return;
      const key = event.key.toLowerCase();
      const desktopShortcut = isDesktopShortcutEnvironment();
      if (desktopShortcut && dexDetailSpeciesId) return;

      const panelByKey: Record<string, PanelId> = {
        "1": "party",
        "2": "storage",
        "3": "fusion",
        "4": "dex",
        "5": "maps"
      };

      if (desktopShortcut && key in panelByKey) {
        event.preventDefault();
        setPanel(panelByKey[key]);
        return;
      }

      if (desktopShortcut && key === "q") {
        event.preventDefault();
        returnHome();
        return;
      }

      if (desktopShortcut && key === "w") {
        event.preventDefault();
        recoverAtCamp();
        return;
      }

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "a", "s", "d", "A", "S", "D"].includes(event.key)) {
        event.preventDefault();
      }
      if (event.key === "ArrowUp") move(0, -1);
      if (event.key === "ArrowDown" || key === "s") move(0, 1);
      if (event.key === "ArrowLeft" || key === "a") move(-1, 0);
      if (event.key === "ArrowRight" || key === "d") move(1, 0);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [battle, battleOutcome, game, activeMap, defeatedCurrentBoss, dexDetailSpeciesId]);

  const switchMap = (mapId: string) => {
    if (!game.unlockedMaps.includes(mapId)) return;
    setGame((current) => setActiveMap(current, mapId));
    setPanel("maps");
  };

  const moveToStorage = (uid: string) => {
    setGame((current) => {
      if (current.party.length <= 1) return addLog(current, "至少保留一只出战宠物。");
      const pet = current.party.find((item) => item.uid === uid);
      if (!pet) return current;
      return addLog(
        {
          ...current,
          party: current.party.filter((item) => item.uid !== uid),
          storage: [...current.storage, pet]
        },
        `${getPetSpecies(pet.speciesId).name}进入仓库。`
      );
    });
  };

  const moveToParty = (uid: string) => {
    setGame((current) => {
      if (current.party.length >= 3) return addLog(current, "出战队伍已满。");
      const pet = current.storage.find((item) => item.uid === uid);
      if (!pet) return current;
      return addLog(
        {
          ...current,
          party: [...current.party, pet],
          storage: current.storage.filter((item) => item.uid !== uid)
        },
        `${getPetSpecies(pet.speciesId).name}加入队伍。`
      );
    });
  };

  const useFruit = (uid: string) => {
    setGame((current) => {
      if (current.inventory.healingFruits <= 0) return addLog(current, "治疗果不足。");
      const party = current.party.map((pet) => {
        if (pet.uid !== uid) return pet;
        return {
          ...pet,
          currentHp: Math.min(getMaxHp(pet), pet.currentHp + Math.round(getMaxHp(pet) * 0.45))
        };
      });
      return addLog(
        {
          ...current,
          party,
          inventory: {
            ...current.inventory,
            healingFruits: current.inventory.healingFruits - 1
          }
        },
        "使用了治疗果。"
      );
    });
  };

  const decomposePet = (uid: string) => {
    setGame((current) => {
      const pet = current.storage.find((item) => item.uid === uid);
    if (!pet) return addLog(current, "出战中的宠物不可分解。");
      const species = getPetSpecies(pet.speciesId);
      if (species.growthLevel === 4) return addLog(current, "神兽暂时不可分解。");
      const crystals = decomposeCrystalValue(pet);
      return addLog(
        {
          ...current,
          storage: current.storage.filter((item) => item.uid !== uid),
          inventory: {
            ...current.inventory,
            crystals: current.inventory.crystals + crystals
          }
        },
        `${species.name}分解为分解水晶 x${crystals}。`
      );
    });
  };

  const enhancePet = (uid: string) => {
    const targetPet = [...game.party, ...game.storage].find((item) => item.uid === uid);
    if (!targetPet) return;
    const species = getPetSpecies(targetPet.speciesId);
    if (species.growthLevel !== 3) {
      setGame(addLog(game, "只有高级宠物可以强化。"));
      return;
    }
    const currentEnhance = targetPet.enhanceLevel ?? 0;
    const cost = enhancementCostForNext(currentEnhance);
    const successRate = enhancementSuccessRateForNext(currentEnhance);
    if (!cost || successRate === undefined) {
      setGame(addLog(game, "强化已经达到上限。"));
      return;
    }
    if (game.inventory.crystals < cost) {
      setGame(addLog(game, "分解水晶不足。"));
      return;
    }

    const success = Math.random() < successRate;
    const upgrade = (pet: PetInstance): PetInstance => {
      if (pet.uid !== uid || !success) return pet;
      const oldMaxHp = getMaxHp(pet);
      const nextPet = { ...pet, enhanceLevel: currentEnhance + 1 };
      const newMaxHp = getMaxHp(nextPet);
      return {
        ...nextPet,
        currentHp: Math.min(newMaxHp, pet.currentHp + Math.max(0, newMaxHp - oldMaxHp))
      };
    };

    const message = success
      ? `${species.name}强化到 +${currentEnhance + 1}。`
      : `${species.name}强化失败，消耗分解水晶 x${cost}，当前仍为 +${currentEnhance}。`;
    setGame(
      addLog(
        {
          ...game,
          party: game.party.map(upgrade),
          storage: game.storage.map(upgrade),
          inventory: {
            ...game.inventory,
            crystals: game.inventory.crystals - cost
          }
        },
        message
      )
    );
    showOperationToast(message, success ? "success" : "failure");
  };

  const handleFuse = () => {
    if (fusionPick.length !== 2) return;
    const result = fusePets(game, fusionPick[0], fusionPick[1]);
    setGame(result.state === game ? addLog(result.state, result.message) : result.state);
    showOperationToast(result.message, result.outcome === "success" ? "success" : "failure");
    setFusionPick([]);
  };

  const resetGame = () => {
    const ok = window.confirm(language === "ja" ? "最初から始めると現在のローカル進行状況が削除されます。" : "重新开始会清除当前本地进度。");
    if (!ok) return;
    clearSave();
    setBattle(null);
    setBattleOutcome(null);
    setFusionPick([]);
    setGuideOpen(false);
    setOperationToast(null);
    setGame(loadGame());
  };

  const fusionCandidates = allPets(game);
  const selectedFusionPets = fusionPick.map((uid) => fusionCandidates.find((pet) => pet.uid === uid)).filter(Boolean) as PetInstance[];
  const fusionCheck = selectedFusionPets.length === 2 ? canFuse(selectedFusionPets[0], selectedFusionPets[1]) : undefined;

  const discoveredCount = game.discoveredSpecies.length;
  const ownedCount = game.ownedSpecies.length;
  const syncedGame = useMemo(() => syncUnlocks(game), [game]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">契</span>
          <div>
            <h1>{t(language, "appTitle")}</h1>
            <span>{t(language, "demoVersion")}</span>
          </div>
        </div>
        <div className="top-actions">
          <button
            className="language-button"
            onClick={() => setLanguage((current) => (current === "zh" ? "ja" : "zh"))}
            title={t(language, "language")}
          >
            <PixelIcon name="languages" size={18} />
            <span>{language === "zh" ? t(language, "japanese") : t(language, "chinese")}</span>
          </button>
          <button className="square-button" onClick={() => saveGame(game)} title={t(language, "save")}>
            <PixelIcon name="save" size={18} />
            <span className="mobile-text-label">{t(language, "save")}</span>
          </button>
          <button className="square-button" onClick={resetGame} title={t(language, "reset")}>
            <PixelIcon name="rotate" size={18} />
            <span className="mobile-text-label">{t(language, "reset")}</span>
          </button>
        </div>
      </header>

      <section className="dashboard">
        <div className="left-column">
          <MapView
            map={activeMap}
            position={game.position}
            defeated={defeatedCurrentBoss}
            bossChallengeLevel={currentBossChallengeLevel}
            maxBossChallengeLevel={MAX_BOSS_CHALLENGE_LEVEL}
            language={language}
            onHeal={() => setGame((current) => healParty(current))}
            onReturnHome={returnHome}
            onGuide={() => setGuideOpen(true)}
            onTileMove={moveTowardTile}
            onBoss={() => {
              if (!defeatedCurrentBoss || currentBossChallengeLevel >= MAX_BOSS_CHALLENGE_LEVEL) return;
              startBattle(createBossBattle(game, currentBossChallengeLevel + 1));
            }}
          />

          <div className="dpad">
            <button onClick={() => move(0, -1)}>↑</button>
            <button onClick={() => move(-1, 0)}>←</button>
            <button onClick={() => move(0, 1)}>↓</button>
            <button onClick={() => move(1, 0)}>→</button>
          </div>
        </div>

        <aside className="right-column">
          <section className="resource-panel">
            <div>
              <span>{t(language, "captureStone")}</span>
              <strong>{game.inventory.captureStones}</strong>
            </div>
            <div>
              <span>{t(language, "healingFruit")}</span>
              <strong>{game.inventory.healingFruits}</strong>
            </div>
            <div>
              <span>{t(language, "crystal")}</span>
              <strong>{game.inventory.crystals}</strong>
            </div>
            <div>
              <span>{t(language, "dex")}</span>
              <strong>{ownedCount}/{PETS.length}</strong>
            </div>
            <div>
              <span>{t(language, "fusion")}</span>
              <strong>{game.fusionCount}</strong>
            </div>
          </section>

          <nav className="panel-tabs">
            <button className={panel === "party" ? "active" : ""} onClick={() => setPanel("party")}>
              <ShortcutHint value="1" />
              <PixelIcon name="paw" size={17} /> {t(language, "party")}
            </button>
            <button className={panel === "storage" ? "active" : ""} onClick={() => setPanel("storage")}>
              <ShortcutHint value="2" />
              <PixelIcon name="archive" size={17} /> {t(language, "storage")}
            </button>
            <button className={panel === "fusion" ? "active" : ""} onClick={() => setPanel("fusion")}>
              <ShortcutHint value="3" />
              <PixelIcon name="shuffle" size={17} /> {t(language, "fusion")}
            </button>
            <button className={panel === "dex" ? "active" : ""} onClick={() => setPanel("dex")}>
              <ShortcutHint value="4" />
              <PixelIcon name="book" size={17} /> {t(language, "dex")}
            </button>
            <button className={panel === "maps" ? "active" : ""} onClick={() => setPanel("maps")}>
              <ShortcutHint value="5" />
              <PixelIcon name="map" size={17} /> {t(language, "maps")}
            </button>
          </nav>

          <section className="panel-body">
            {panel === "party" ? (
              <div className="panel-stack">
                {game.party.map((pet) => {
                  const species = getPetSpecies(pet.speciesId);
                  const enhanceCost = enhancementCostForNext(pet.enhanceLevel ?? 0);
                  const canEnhance = species.growthLevel === 3 && Boolean(enhanceCost) && game.inventory.crystals >= (enhanceCost ?? 0);
                  return (
                    <PetCard
                      key={pet.uid}
                      pet={pet}
                      language={language}
                      actions={
                        <>
                          <button onClick={() => useFruit(pet.uid)}>
                            <PixelIcon name="heartPulse" size={16} /> {t(language, "heal")}
                          </button>
                          <button onClick={() => moveToStorage(pet.uid)}>{t(language, "store")}</button>
                          <button
                            onClick={() => enhancePet(pet.uid)}
                            disabled={species.growthLevel !== 3 || !enhanceCost || !canEnhance}
                            title={enhanceCost ? `${t(language, "enhance")} ${enhanceCost} ${t(language, "crystal")}` : t(language, "maxEnhance")}
                          >
                            <PixelIcon name="chevronUp" size={16} /> {t(language, "enhance")}
                          </button>
                          <button disabled title={t(language, "partyCannotDecompose")}>
                            <PixelIcon name="trash" size={16} /> {t(language, "decompose")}
                          </button>
                        </>
                      }
                    />
                  );
                })}
              </div>
            ) : null}

            {panel === "storage" ? (
              <div className="panel-stack">
                {game.storage.length ? (
                  game.storage.map((pet) => {
                    const species = getPetSpecies(pet.speciesId);
                    const enhanceCost = enhancementCostForNext(pet.enhanceLevel ?? 0);
                    const canEnhance = species.growthLevel === 3 && Boolean(enhanceCost) && game.inventory.crystals >= (enhanceCost ?? 0);
                    const canDecompose = species.growthLevel !== 4;
                    return (
                      <PetCard
                        key={pet.uid}
                        pet={pet}
                        language={language}
                        compact
                        actions={
                          <>
                            <button onClick={() => moveToParty(pet.uid)}>{t(language, "deploy")}</button>
                            <button
                              onClick={() => enhancePet(pet.uid)}
                            disabled={species.growthLevel !== 3 || !enhanceCost || !canEnhance}
                              title={enhanceCost ? `${t(language, "enhance")} ${enhanceCost} ${t(language, "crystal")}` : t(language, "maxEnhance")}
                            >
                              <PixelIcon name="chevronUp" size={16} /> {t(language, "enhance")}
                            </button>
                            <button
                              onClick={() => decomposePet(pet.uid)}
                              disabled={!canDecompose}
                              title={!canDecompose ? (language === "ja" ? "神獣は現在分解できません" : "神兽暂时不可分解") : undefined}
                            >
                              <PixelIcon name="trash" size={16} /> {t(language, "decompose")}
                            </button>
                          </>
                        }
                      />
                    );
                  })
                ) : (
                  <p className="empty-text">{t(language, "emptyStorage")}</p>
                )}
              </div>
            ) : null}

            {panel === "fusion" ? (
              <div className="fusion-panel">
                <div className="fusion-status">
                  <PixelIcon name="sparkles" size={18} />
                  {fusionPick.length < 2 ? t(language, "fusionHint") : fusionCheck?.ok ? t(language, "canFuse") : fusionReason(language, fusionCheck?.reason)}
                </div>
                <div className="fusion-grid">
                  {fusionCandidates.map((pet) => {
                    const picked = fusionPick.includes(pet.uid);
                    return (
                      <button
                        className={`fusion-card ${picked ? "picked" : ""}`}
                        key={pet.uid}
                        onClick={() =>
                          setFusionPick((current) => {
                            if (current.includes(pet.uid)) return current.filter((uid) => uid !== pet.uid);
                            if (current.length >= 2) return [current[1], pet.uid];
                            return [...current, pet.uid];
                          })
                        }
                      >
                        <PetCard pet={pet} language={language} compact />
                      </button>
                    );
                  })}
                </div>
                <button className="primary wide" disabled={!fusionCheck?.ok} onClick={handleFuse}>
                  <PixelIcon name="shuffle" size={17} /> {t(language, "confirmFusion")}
                </button>
              </div>
            ) : null}

            {panel === "dex" ? (
              <div className="dex-grid">
                {PETS.map((species) => {
                  const owned = game.ownedSpecies.includes(species.id);
                  const seen = game.discoveredSpecies.includes(species.id);
                  return (
                    <button
                      className={`dex-card ${owned ? "owned" : seen ? "seen" : "unknown"}`}
                      key={species.id}
                      type="button"
                      disabled={!seen}
                      onClick={() => setDexDetailSpeciesId(species.id)}
                      title={seen ? t(language, "dexDetail") : t(language, "unknownEcology")}
                    >
                      {seen ? (
                        <PixelPetSprite speciesId={species.id} element={species.element} growthLevel={species.growthLevel} size="small" />
                      ) : (
                        <span className="unknown-sprite">?</span>
                      )}
                      <strong>{seen ? petName(language, species.id, species.name) : t(language, "unknown")}</strong>
                      <small>{seen ? `${growthLabel(language, species.growthLevel)} · ${roleText(language, species.role)}` : t(language, "unknownEcology")}</small>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {panel === "maps" ? (
              <div className="map-list">
                {MAPS.map((mapItem) => {
                  const unlocked = syncedGame.unlockedMaps.includes(mapItem.id);
                  const defeated = game.defeatedBosses.includes(mapItem.id);
                  return (
                    <button
                      className={`map-list-item ${game.activeMapId === mapItem.id ? "active" : ""}`}
                      key={mapItem.id}
                      disabled={!unlocked}
                      onClick={() => switchMap(mapItem.id)}
                    >
                      <span className="pet-token" style={{ background: ELEMENT_COLORS[mapItem.element] }}>
                        {elementLabel(language, mapItem.element)}
                      </span>
                      <div>
                        <strong>{mapName(language, mapItem.id, mapItem.name)}</strong>
                        <small>{unlocked ? (defeated ? t(language, "bossDefeated") : t(language, "explorable")) : unlockText(language, mapItem.id)}</small>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </section>
        </aside>
      </section>

      <section className="quest-strip">
        <div>
          <PixelIcon name="footprints" size={17} />
          {t(language, "ownedProgress")} {discoveredCount}/{PETS.length}
        </div>
        <div>
          <PixelIcon name="shuffle" size={17} />
          {t(language, "initialFusion")} {game.firstLv1FusionDone ? t(language, "done") : t(language, "notDone")}
        </div>
        <div>
          <PixelIcon name="sparkles" size={17} />
          {t(language, "evolvedFusion")} {game.firstLv2FusionDone ? t(language, "done") : t(language, "notDone")}
        </div>
      </section>

      <section className="log-panel">
        {game.log.slice(0, 8).map((line, index) => (
          <p key={`${line}-${index}`}>{translateLog(language, line)}</p>
        ))}
      </section>

      {game.party.length === 0 ? <StarterOverlay language={language} onChoose={(speciesId) => setGame((current) => chooseStarter(current, speciesId))} /> : null}

      {battle ? (
        <BattleView
          key={battle.id}
          battle={battle}
          language={language}
          captureStones={game.inventory.captureStones}
          onUseSkill={handleUseSkill}
          onDefend={handleDefend}
          onEnemyAct={handleEnemyAct}
          onCapture={handleCapture}
          outcome={battleOutcome}
          onConfirmDefeat={() => {
            setGame((current) => applyDefeat(current));
            setBattle(null);
            setBattleOutcome(null);
          }}
          onRun={() => {
            if (!battle.isBoss) {
              setGame((current) => addLog(current, "脱离了战斗。"));
              setBattle(null);
              setBattleOutcome(null);
            }
          }}
        />
      ) : null}

      {operationToast ? (
        <div className={`operation-toast ${operationToast.tone}`} role="status" aria-live="polite">
          {translateLog(language, operationToast.message)}
        </div>
      ) : null}

      {guideOpen ? <GameGuide language={language} onClose={() => setGuideOpen(false)} /> : null}
      {dexDetailSpeciesId ? <DexDetailModal speciesId={dexDetailSpeciesId} language={language} onClose={() => setDexDetailSpeciesId(null)} /> : null}
    </main>
  );
}
