import { Home, MapPin, ShieldPlus, Swords } from "lucide-react";
import type { CSSProperties } from "react";
import { ELEMENT_COLORS } from "../game/balance";
import { distance, getTerrainAt } from "../game/mapLogic";
import type { MapDefinition } from "../game/types";
import { elementLabel, mapName, t, type Language } from "../i18n";
import { PixelPlayerSprite } from "./PixelSprite";
import { ShortcutHint } from "./ShortcutHint";

interface MapViewProps {
  map: MapDefinition;
  position: { x: number; y: number };
  defeated: boolean;
  language: Language;
  onHeal: () => void;
  onReturnHome: () => void;
  onBoss: () => void;
}

const viewWidth = 15;
const viewHeight = 11;

const detailVariant = (x: number, y: number, mapId: string): number => {
  const seed = mapId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return Math.abs((x * 37 + y * 61 + seed) % 5);
};

export function MapView({ map, position, defeated, language, onHeal, onReturnHome, onBoss }: MapViewProps) {
  const startX = position.x - Math.floor(viewWidth / 2);
  const startY = position.y - Math.floor(viewHeight / 2);
  const tiles = [];

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
          key={`${worldX}-${worldY}`}
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
          <MapPin size={16} />
          {position.x},{position.y}
        </div>
      </div>

      <div className="tile-grid">{tiles}</div>

      <div className="map-actions">
        <button className="icon-button" onClick={onReturnHome} title={t(language, "returnHome")}>
          <ShortcutHint value="Q" />
          <Home size={18} />
          {t(language, "returnHome")}
        </button>
        <button className="icon-button" disabled={!nearCamp} onClick={onHeal} title={t(language, "campHeal")}>
          <ShortcutHint value="W" />
          <ShieldPlus size={18} />
          {t(language, "campHeal")}
        </button>
        <button className="icon-button danger" disabled={!nearBoss || defeated} onClick={onBoss} title={t(language, "challengeBoss")}>
          <Swords size={18} />
          {t(language, "challengeBoss")}
        </button>
      </div>
    </section>
  );
}
