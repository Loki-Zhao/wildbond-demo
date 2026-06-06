import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { ELEMENT_COLORS } from "../game/balance";
import { distance, getTerrainAt } from "../game/mapLogic";
import type { MapDefinition } from "../game/types";
import { elementLabel, mapName, t, type Language } from "../i18n";
import { PixelIcon } from "./PixelIcon";
import { PixelPlayerSprite } from "./PixelSprite";
import { ShortcutHint } from "./ShortcutHint";

interface MapViewProps {
  map: MapDefinition;
  position: { x: number; y: number };
  defeated: boolean;
  bossChallengeLevel: number;
  maxBossChallengeLevel: number;
  language: Language;
  onHeal: () => void;
  onReturnHome: () => void;
  onGuide: () => void;
  onBoss: () => void;
  onTileMove?: (x: number, y: number) => void;
}

const viewWidth = 21;
const viewHeight = 13;
const tileSize = 64;
const tileGap = 2;
const tilePadding = 12;
const logicalMapWidth = viewWidth * tileSize + (viewWidth - 1) * tileGap + tilePadding * 2;
const logicalMapHeight = viewHeight * tileSize + (viewHeight - 1) * tileGap + tilePadding * 2;

const getContainScale = (node: HTMLElement | null): number => {
  if (!node) return 1;
  const rect = node.getBoundingClientRect();
  const fitScale = Math.min(rect.width / logicalMapWidth, rect.height / logicalMapHeight);
  if (!Number.isFinite(fitScale) || fitScale <= 0) return 1;
  if (fitScale >= 1) return 1;
  return Math.max(0.12, fitScale);
};

const useMapContainScale = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => setScale(getContainScale(ref.current));
    updateScale();

    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateScale) : null;
    if (ref.current && observer) observer.observe(ref.current);
    window.addEventListener("resize", updateScale);
    window.addEventListener("orientationchange", updateScale);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateScale);
      window.removeEventListener("orientationchange", updateScale);
    };
  }, []);

  return { ref, scale };
};

const detailVariant = (x: number, y: number, mapId: string): number => {
  const seed = mapId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return Math.abs((x * 37 + y * 61 + seed) % 5);
};

export function MapView({
  map,
  position,
  defeated,
  bossChallengeLevel,
  maxBossChallengeLevel,
  language,
  onHeal,
  onReturnHome,
  onGuide,
  onBoss,
  onTileMove
}: MapViewProps) {
  const { ref: tileStageRef, scale: tileScale } = useMapContainScale();
  const touchStartRef = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const startX = position.x - Math.floor(viewWidth / 2);
  const startY = position.y - Math.floor(viewHeight / 2);
  const tiles = [];

  const handleTilePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    touchStartRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY
    };
  };

  const handleTilePointerUp = (event: PointerEvent<HTMLDivElement>, worldX: number, worldY: number, outside: boolean) => {
    if (!onTileMove || outside || event.button !== 0) return;
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || start.pointerId !== event.pointerId) return;
    const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y);
    if (moved > 10) return;
    event.preventDefault();
    onTileMove(worldX, worldY);
  };

  for (let y = 0; y < viewHeight; y += 1) {
    for (let x = 0; x < viewWidth; x += 1) {
      const worldX = startX + x;
      const worldY = startY + y;
      const outside = worldX < 0 || worldY < 0 || worldX >= map.width || worldY >= map.height;
      const terrain = outside ? "void" : getTerrainAt(map, worldX, worldY);
      const isPlayer = worldX === position.x && worldY === position.y;
      const isBoss = !outside && distance({ x: worldX, y: worldY }, map.boss) <= 2;
      const variant = outside ? 0 : detailVariant(worldX, worldY, map.id);
      const detailClass =
        terrain === "grass" && variant <= 2
          ? "tile-detail tree-detail"
          : terrain === "water"
            ? "tile-detail ripple-detail"
            : terrain === "path"
              ? "tile-detail pebble-detail"
              : terrain === "hazard"
                ? "tile-detail ember-detail"
                : "tile-detail";

      tiles.push(
        <div
          className={`tile tile-${terrain} tile-detail-${variant} ${isBoss && defeated ? "tile-cleared" : ""}`}
          data-mobile-target={!outside ? "true" : undefined}
          key={`${worldX}-${worldY}`}
          onPointerCancel={() => {
            touchStartRef.current = null;
          }}
          onPointerDown={handleTilePointerDown}
          onPointerUp={(event) => handleTilePointerUp(event, worldX, worldY, outside)}
          style={
            {
              "--ground": map.palette.ground,
              "--path": map.palette.path,
              "--hazard": map.palette.hazard,
              "--water": map.palette.water,
              "--deco": map.palette.deco
            } as CSSProperties
          }
        >
          {isPlayer ? (
            <span className="player-token">
              <PixelPlayerSprite size="small" />
            </span>
          ) : terrain === "camp" ? (
            <span className="tile-object camp-object" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          ) : terrain === "boss" ? (
            <span className="tile-object altar-object" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          ) : (
            <span className={detailClass} aria-hidden="true" />
          )}
        </div>
      );
    }
  }

  const nearCamp = distance(position, map.camp) <= 3;
  const nearBoss = distance(position, map.boss) <= 2;
  const nextBossChallengeLevel = Math.min(maxBossChallengeLevel, bossChallengeLevel + 1);
  const bossChallengeComplete = bossChallengeLevel >= maxBossChallengeLevel;
  const bossChallengeDisabled = !nearBoss || !defeated || bossChallengeComplete;
  const bossChallengeTitle = !defeated
    ? t(language, "bossChallengeLocked")
    : bossChallengeComplete
      ? t(language, "bossChallengeComplete")
      : t(language, "bossChallengeTitle", { level: nextBossChallengeLevel, max: maxBossChallengeLevel });

  return (
    <section className="map-shell" style={{ borderColor: ELEMENT_COLORS[map.element] }}>
      <div className="map-header">
        <div>
          <h2>{mapName(language, map.id, map.name)}</h2>
          <span className="map-subtitle">
            {t(language, "elementDomain", { element: elementLabel(language, map.element) })} · {map.width}x{map.height}
          </span>
        </div>
        <div className="coord-pill">
          <PixelIcon name="mapPin" size={16} />
          {position.x},{position.y}
        </div>
      </div>

      <div
        className="tile-stage"
        ref={tileStageRef}
        style={
          {
            "--map-logical-width": `${logicalMapWidth}px`,
            "--map-logical-height": `${logicalMapHeight}px`,
            "--map-view-width": viewWidth,
            "--map-scale": tileScale
          } as CSSProperties
        }
      >
        <div className="tile-grid">{tiles}</div>
      </div>

      <div className="map-actions">
        <button className="icon-button" onClick={onReturnHome} title={t(language, "returnHome")}>
          <ShortcutHint value="Q" />
          <PixelIcon name="home" size={18} />
          {t(language, "returnHome")}
        </button>
        <button className="icon-button" disabled={!nearCamp} onClick={onHeal} title={t(language, "campHeal")}>
          <ShortcutHint value="W" />
          <PixelIcon name="shieldPlus" size={18} />
          {t(language, "campHeal")}
        </button>
        <button className="icon-button guide-action" onClick={onGuide} title={t(language, "gameGuide")}>
          <PixelIcon name="info" size={18} />
          {t(language, "gameGuide")}
        </button>
        <button className="icon-button danger" disabled={bossChallengeDisabled} onClick={onBoss} title={bossChallengeTitle}>
          <PixelIcon name="swords" size={18} />
          {bossChallengeComplete ? t(language, "bossChallengeComplete") : `${t(language, "challengeBoss")} +${nextBossChallengeLevel}/${maxBossChallengeLevel}`}
        </button>
      </div>
    </section>
  );
}
