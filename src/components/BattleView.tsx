import { useEffect, useMemo, useState } from "react";
import { getPetSpecies } from "../data/pets";
import { getSkill } from "../data/skills";
import { ELEMENT_COLORS, getBattleUnitStats } from "../game/balance";
import { captureChance, getActiveUnit } from "../game/combat";
import type { BattleState, BattleUnit, ElementType, Skill, SkillCategory } from "../game/types";
import { elementLabel, petName, rarityLabel, skillName, skillTooltip, statusLabel, t, translateLog, type Language } from "../i18n";
import { PixelIcon } from "./PixelIcon";
import { PixelPetSprite } from "./PixelSprite";
import { ShortcutHint } from "./ShortcutHint";
import { SkillEffect } from "./SkillEffect";
import { useSkillInfo } from "./SkillInfo";

interface BattleViewProps {
  battle: BattleState;
  captureStones: number;
  language: Language;
  onUseSkill: (casterId: string, skillId: string, targetId?: string) => void;
  onDefend: (allyId: string) => void;
  onEnemyAct: () => void;
  onCapture: (enemyId: string) => void;
  outcome?: "defeat" | null;
  onConfirmDefeat: () => void;
  onRun: () => void;
}

const unitName = (unit: BattleUnit, language: Language): string => {
  const species = getPetSpecies(unit.speciesId);
  return petName(language, species.id, species.name);
};

const hpPercent = (unit: BattleUnit): number => {
  const maxHp = getBattleUnitStats(unit).hp;
  return Math.max(0, Math.min(100, (unit.currentHp / maxHp) * 100));
};

const isDesktopShortcutEnvironment = (): boolean =>
  typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
};

interface BattleAnimation {
  id: number;
  sourceSide: "ally" | "enemy";
  actorId?: string;
  targetIds: string[];
  element: ElementType | "capture";
  category: SkillCategory | "capture";
}

interface PendingSkillTarget {
  skill: Skill;
  actorId: string;
  targets: BattleUnit[];
}

function CombatantSlot({
  unit,
  active,
  selected,
  acting,
  targeted,
  hasActed,
  side,
  language,
  onClick
}: {
  unit: BattleUnit;
  active?: boolean;
  selected?: boolean;
  acting?: boolean;
  targeted?: boolean;
  hasActed?: boolean;
  side: "ally" | "enemy";
  language: Language;
  onClick?: () => void;
}) {
  const species = getPetSpecies(unit.speciesId);
  const maxHp = getBattleUnitStats(unit).hp;
  return (
    <button
      className={`combatant-slot ${side} ${active ? "active" : ""} ${selected ? "selected" : ""} ${hasActed ? "has-acted" : ""} ${acting ? "is-acting" : ""} ${targeted ? "is-targeted" : ""} ${unit.currentHp <= 0 ? "is-fainted" : ""}`}
      onClick={onClick}
      type="button"
    >
      <span className="combatant-platform" />
      <span className="combatant-sprite">
        <PixelPetSprite
          speciesId={species.id}
          element={species.element}
          growthLevel={species.growthLevel}
          size={unit.isBoss ? "large" : "medium"}
          fainted={unit.currentHp <= 0}
          active={active || acting}
        />
      </span>
      <span className="combatant-nameplate">
        <span className="combatant-title">
          <span className="element-chip" style={{ background: ELEMENT_COLORS[species.element] }}>
            {elementLabel(language, species.element)}
          </span>
          <strong>{petName(language, species.id, species.name)}</strong>
          <span className={`rarity-tag rarity-${unit.rarity ?? "normal"}`}>{rarityLabel(language, unit.rarity)}</span>
          {unit.isBoss ? <span className="boss-tag">{t(language, "boss")}</span> : null}
          {hasActed ? <span className="acted-tag">{t(language, "acted")}</span> : null}
        </span>
        <span className="hpbar" aria-label={`${petName(language, species.id, species.name)} HP`}>
          <span style={{ width: `${hpPercent(unit)}%` }} />
        </span>
        <span className="combatant-statline">
          HP {unit.currentHp}/{maxHp} · AP {unit.ap}/3 · Lv{unit.expLevel}
        </span>
        <span className="status-row">
          {unit.statuses.length ? unit.statuses.map((status) => <span key={status.id}>{statusLabel(language, status.id, status.name)}</span>) : <span>{t(language, "stable")}</span>}
        </span>
      </span>
    </button>
  );
}

export function BattleView({
  battle,
  captureStones,
  language,
  onUseSkill,
  onDefend,
  onEnemyAct,
  onCapture,
  outcome,
  onConfirmDefeat,
  onRun
}: BattleViewProps) {
  const activeUnit = useMemo(() => getActiveUnit(battle) ?? [...battle.allies, ...battle.enemies].find((unit) => unit.currentHp > 0), [battle]);
  const activeAlly = activeUnit?.side === "ally" ? activeUnit : undefined;
  const [selectedEnemyId, setSelectedEnemyId] = useState<string | undefined>(battle.enemies.find((unit) => unit.currentHp > 0)?.id);
  const [selectedFriendId, setSelectedFriendId] = useState<string | undefined>(activeAlly?.id ?? battle.allies.find((unit) => unit.currentHp > 0)?.id);
  const [effect, setEffect] = useState<BattleAnimation | null>(null);
  const [busy, setBusy] = useState(false);
  const [pendingSupportSkill, setPendingSupportSkill] = useState<PendingSkillTarget | null>(null);
  const [showEncounterNotice, setShowEncounterNotice] = useState(true);
  const { bindSkillInfo, skillInfoPopup } = useSkillInfo();
  const resolved = outcome === "defeat";
  const skills = activeAlly ? getPetSpecies(activeAlly.speciesId).skillIds.map(getSkill) : [];
  const canPlayerAct = Boolean(activeAlly && activeAlly.currentHp > 0 && !activeAlly.acted && !busy && !resolved);
  const selectedEnemy = battle.enemies.find((unit) => unit.id === selectedEnemyId && unit.currentHp > 0) ?? battle.enemies.find((unit) => unit.currentHp > 0);
  const selectedFriend = battle.allies.find((unit) => unit.id === selectedFriendId && unit.currentHp > 0) ?? activeAlly ?? battle.allies.find((unit) => unit.currentHp > 0);
  const encounterNoticeText = battle.bossChallengeLevel
    ? t(language, "enhancedBossAppeared")
    : battle.isBoss
      ? t(language, "mapBossAppeared")
      : t(language, "wildPetsAppeared");

  const queueEffect = (nextEffect: BattleAnimation) => {
    setEffect(nextEffect);
    window.setTimeout(() => {
      setEffect((current) => (current?.id === nextEffect.id ? null : current));
    }, 760);
  };

  useEffect(() => {
    setPendingSupportSkill(null);
    if (activeAlly) {
      setSelectedFriendId(activeAlly.id);
    } else if (!battle.allies.some((unit) => unit.id === selectedFriendId && unit.currentHp > 0)) {
      setSelectedFriendId(battle.allies.find((unit) => unit.currentHp > 0)?.id);
    }
    if (!battle.enemies.some((unit) => unit.id === selectedEnemyId && unit.currentHp > 0)) {
      setSelectedEnemyId(battle.enemies.find((unit) => unit.currentHp > 0)?.id);
    }
  }, [activeAlly?.id, battle.allies, battle.enemies, selectedEnemyId, selectedFriendId]);

  useEffect(() => {
    setShowEncounterNotice(true);
    const timer = window.setTimeout(() => setShowEncounterNotice(false), 2000);
    return () => window.clearTimeout(timer);
  }, [battle.id]);

  useEffect(() => {
    if (resolved || !activeUnit || activeUnit.side !== "enemy" || activeUnit.currentHp <= 0) return;
    const targetIds = battle.allies.filter((unit) => unit.currentHp > 0).map((unit) => unit.id);
    queueEffect({
      id: Date.now(),
      sourceSide: "enemy",
      actorId: activeUnit.id,
      targetIds,
      element: getPetSpecies(activeUnit.speciesId).element,
      category: "attack"
    });
    setBusy(true);
    const timer = window.setTimeout(() => {
      onEnemyAct();
      setBusy(false);
    }, 520);
    return () => window.clearTimeout(timer);
  }, [activeUnit?.id, activeUnit?.side, battle.id, battle.round, resolved]);

  const resolveTargetIdsForAction = (skill: Skill, targetId?: string): string[] => {
    if (skill.target === "allEnemies") return battle.enemies.filter((unit) => unit.currentHp > 0).map((unit) => unit.id);
    if (skill.target === "allAllies") return battle.allies.filter((unit) => unit.currentHp > 0).map((unit) => unit.id);
    if (skill.target === "enemy") {
      const target = battle.enemies.find((unit) => unit.id === targetId && unit.currentHp > 0) ?? battle.enemies.find((unit) => unit.currentHp > 0);
      return target ? [target.id] : [];
    }
    if (skill.target === "ally") {
      const target = battle.allies.find((unit) => unit.id === targetId && unit.currentHp > 0) ?? activeAlly;
      return target ? [target.id] : [];
    }
    return activeAlly ? [activeAlly.id] : [];
  };

  const selectableTargets = (skill: Skill): BattleUnit[] => {
    if (skill.target === "enemy") return battle.enemies.filter((unit) => unit.currentHp > 0);
    if (skill.target === "ally") return battle.allies.filter((unit) => unit.currentHp > 0);
    return [];
  };

  const executeSkillAction = (actorId: string, skill: Skill, targetId?: string) => {
    if (!canPlayerAct || !activeAlly || actorId !== activeAlly.id || activeAlly.ap < skill.apCost) return;
    const resolvedTargetId =
      skill.target === "enemy"
        ? battle.enemies.find((unit) => unit.id === targetId && unit.currentHp > 0)?.id ?? selectedEnemy?.id
        : skill.target === "ally"
          ? battle.allies.find((unit) => unit.id === targetId && unit.currentHp > 0)?.id
          : skill.target === "self"
            ? activeAlly.id
            : undefined;
    if ((skill.target === "enemy" || skill.target === "ally") && !resolvedTargetId) return;
    const targetIds = resolveTargetIdsForAction(skill, resolvedTargetId);
    setBusy(true);
    setPendingSupportSkill(null);
    queueEffect({ id: Date.now(), sourceSide: "ally", actorId: activeAlly.id, targetIds, element: skill.element, category: skill.category });
    onUseSkill(activeAlly.id, skill.id, resolvedTargetId);
    window.setTimeout(() => setBusy(false), 260);
  };

  const prepareSkillAction = (skill: Skill) => {
    if (!canPlayerAct || !activeAlly) return;
    if (skill.target === "enemy") {
      executeSkillAction(activeAlly.id, skill, selectedEnemy?.id);
      return;
    }
    if (skill.target === "ally") {
      const targets = selectableTargets(skill);
      if (targets.length === 0) return;
      if (targets.length === 1) {
        executeSkillAction(activeAlly.id, skill, targets[0].id);
        return;
      }
      setPendingSupportSkill({
        skill,
        actorId: activeAlly.id,
        targets
      });
      return;
    }
    executeSkillAction(activeAlly.id, skill, activeAlly.id);
  };

  const defendActiveAlly = () => {
    if (!canPlayerAct || !activeAlly) return;
    setBusy(true);
    setPendingSupportSkill(null);
    queueEffect({ id: Date.now(), sourceSide: "ally", actorId: activeAlly.id, targetIds: [activeAlly.id], element: getPetSpecies(activeAlly.speciesId).element, category: "defense" });
    onDefend(activeAlly.id);
    window.setTimeout(() => setBusy(false), 220);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target) || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key === "Escape" && pendingSupportSkill) {
        event.preventDefault();
        setPendingSupportSkill(null);
        return;
      }
      if (!isDesktopShortcutEnvironment() || !["1", "2", "3", "4"].includes(event.key)) return;

      if (pendingSupportSkill) {
        if (!["1", "2", "3"].includes(event.key)) return;
        const target = pendingSupportSkill.targets.filter((unit) => unit.currentHp > 0)[Number(event.key) - 1];
        if (!target) return;
        event.preventDefault();
        setSelectedFriendId(target.id);
        executeSkillAction(pendingSupportSkill.actorId, pendingSupportSkill.skill, target.id);
        return;
      }

      if (event.key === "4") {
        if (!canPlayerAct) return;
        event.preventDefault();
        defendActiveAlly();
        return;
      }

      const skill = skills[Number(event.key) - 1];
      if (!skill || !canPlayerAct || !activeAlly || activeAlly.ap < skill.apCost) return;
      event.preventDefault();
      prepareSkillAction(skill);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeAlly, battle.allies, battle.enemies, canPlayerAct, pendingSupportSkill, selectedEnemy?.id, skills]);

  const selectEnemy = (unit: BattleUnit) => {
    setPendingSupportSkill(null);
    setSelectedEnemyId(unit.id);
  };

  const selectFriend = (unit: BattleUnit) => {
    if (pendingSupportSkill) {
      setSelectedFriendId(unit.id);
      executeSkillAction(pendingSupportSkill.actorId, pendingSupportSkill.skill, unit.id);
      return;
    }
    setSelectedFriendId(unit.id);
  };

  return (
    <div className="battle-backdrop">
      <section className="battle-panel">
        <div className="battle-header">
          <div>
            <h2>
              {battle.isBoss
                ? `${t(language, "bossBattle")}${battle.bossChallengeLevel ? ` +${battle.bossChallengeLevel}` : ""}`
                : t(language, "wildBattle")}
            </h2>
            <span>{t(language, "round", { round: battle.round })}</span>
          </div>
          <div className="turn-indicator">
            <strong>{t(language, "currentTurn")}</strong>
            <span>{activeUnit ? unitName(activeUnit, language) : "-"}</span>
            <small>{activeUnit?.side === "enemy" ? t(language, "enemyActing") : t(language, "chooseAction")}</small>
          </div>
          <button className="square-button" onClick={onRun} disabled={battle.isBoss} title={t(language, "runTitle")}>
            <PixelIcon name="x" size={18} />
          </button>
        </div>

        <div
          className={`battle-field dedicated-battlefield ${pendingSupportSkill ? "support-targeting" : ""}`}
          onPointerDown={(event) => {
            if (pendingSupportSkill && event.target === event.currentTarget) setPendingSupportSkill(null);
          }}
        >
          {showEncounterNotice ? <div className="encounter-notice">{encounterNoticeText}</div> : null}
          {pendingSupportSkill ? (
            <div className="support-target-prompt">
              <strong>{skillName(language, pendingSupportSkill.skill.id, pendingSupportSkill.skill.name)}</strong>
              <span>{t(language, "chooseSupportTargetPrompt")}</span>
              <small>{t(language, "escCancel")}</small>
            </div>
          ) : null}
          {effect ? <SkillEffect id={effect.id} element={effect.element} category={effect.category} sourceSide={effect.sourceSide} /> : null}
          <div className="battle-side ally-side">
            <h3>{t(language, "allyLine")}</h3>
            <div className="combatant-line">
              {battle.allies.map((unit) => (
                <CombatantSlot
                  key={unit.id}
                  unit={unit}
                  active={unit.id === activeUnit?.id}
                  selected={unit.id === selectedFriendId}
                  hasActed={unit.acted}
                  acting={effect?.actorId === unit.id}
                  targeted={effect?.targetIds.includes(unit.id)}
                  side="ally"
                  language={language}
                  onClick={() => selectFriend(unit)}
                />
              ))}
            </div>
          </div>

          <div className="battle-side enemy-side">
            <h3>{t(language, "enemyLine")}</h3>
            <div className="combatant-line">
              {battle.enemies.map((unit) => (
                <CombatantSlot
                  key={unit.id}
                  unit={unit}
                  active={unit.id === activeUnit?.id}
                  selected={unit.id === selectedEnemyId}
                  hasActed={unit.acted}
                  acting={effect?.actorId === unit.id}
                  targeted={effect?.targetIds.includes(unit.id)}
                  side="enemy"
                  language={language}
                  onClick={() => selectEnemy(unit)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="battle-command">
          <div className="battle-target-strip">
            <button className="target-chip enemy-target" type="button" disabled={!selectedEnemy} onClick={() => selectedEnemy && selectEnemy(selectedEnemy)}>
              <PixelIcon name="swords" size={15} />
              <span>{t(language, "attackTarget")}</span>
              <strong>{selectedEnemy ? unitName(selectedEnemy, language) : t(language, "noTarget")}</strong>
            </button>
            <button
              className="target-chip ally-target"
              type="button"
              disabled={!selectedFriend}
              onClick={() => {
                setPendingSupportSkill(null);
                if (selectedFriend) setSelectedFriendId(selectedFriend.id);
              }}
            >
              <PixelIcon name="heart" size={15} />
              <span>{t(language, "supportTarget")}</span>
              <strong>{selectedFriend ? unitName(selectedFriend, language) : t(language, "noTarget")}</strong>
            </button>
          </div>

          <div className="skill-row">
            {skills.map((skill, index) => {
              const shortcut = String(index + 1);
              const disabled = !canPlayerAct || activeAlly!.ap < skill.apCost;
              const tooltip = skillTooltip(language, skill);
              return (
                <button
                  className={`skill-button ${disabled ? "is-disabled" : ""}`}
                  key={skill.id}
                  aria-disabled={disabled}
                  onClick={(event) => {
                    if (disabled) {
                      event.preventDefault();
                      setPendingSupportSkill(null);
                      return;
                    }
                    prepareSkillAction(skill);
                  }}
                  {...bindSkillInfo(tooltip)}
                >
                  <ShortcutHint value={shortcut} />
                  {skill.category === "attack" ? (
                    <PixelIcon name="swords" size={17} />
                  ) : skill.category === "heal" ? (
                    <PixelIcon name="heart" size={17} />
                  ) : skill.category === "defense" ? (
                    <PixelIcon name="shield" size={17} />
                  ) : (
                    <PixelIcon name="sparkles" size={17} />
                  )}
                  <span>{skillName(language, skill.id, skill.name)}</span>
                  <small>{skill.apCost} AP</small>
                </button>
              );
            })}
            <button className="skill-button defense-action" disabled={!canPlayerAct} onClick={defendActiveAlly} title={t(language, "defenseTitle")}>
              <ShortcutHint value="4" />
              <PixelIcon name="shield" size={17} />
              <span>{t(language, "defense")}</span>
              <small>{t(language, "damageOneThird")}</small>
            </button>
          </div>

          {resolved ? (
            <div className="battle-result-panel danger">
              <strong>{t(language, "defeatTitle")}</strong>
              <span>{t(language, "defeatDetail")}</span>
              <button className="icon-button danger" type="button" onClick={onConfirmDefeat}>
                <PixelIcon name="x" size={17} />
                {t(language, "returnCamp")}
              </button>
            </div>
          ) : null}

          <div className="capture-row">
            <button
              className="icon-button capture-button"
              disabled={resolved || busy || !activeAlly || !selectedEnemy || selectedEnemy.isBoss || captureStones <= 0}
              onClick={() => {
                if (!selectedEnemy) return;
                setPendingSupportSkill(null);
                queueEffect({ id: Date.now(), sourceSide: "ally", actorId: activeAlly?.id, targetIds: [selectedEnemy.id], element: "capture", category: "capture" });
                onCapture(selectedEnemy.id);
              }}
            >
              <PixelIcon name="circle" size={17} />
              {t(language, "captureSelected", { target: selectedEnemy ? unitName(selectedEnemy, language) : t(language, "noTarget") })}
              {selectedEnemy ? <small>{Math.round(captureChance(selectedEnemy) * 100)}%</small> : null}
            </button>
            <button className="icon-button escape-button" onClick={onRun} disabled={resolved || busy || battle.isBoss}>
              <PixelIcon name="x" size={17} />
              {t(language, "run")}
            </button>
          </div>
        </div>

        <div className="battle-log">
          {battle.log.slice(0, 8).map((line, index) => (
            <p key={`${line}-${index}`}>{translateLog(language, line)}</p>
          ))}
        </div>
        {skillInfoPopup}
      </section>
    </div>
  );
}
