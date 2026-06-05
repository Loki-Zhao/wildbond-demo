import type { CSSProperties } from "react";
import { getEarthPetPixelArt } from "../data/earthPetPixelArt";
import { getFirePetPixelArt } from "../data/firePetPixelArt";
import { getForestPetPixelArt } from "../data/forestPetPixelArt";
import { PET_ARTWORK } from "../data/petArtwork";
import { PET_SPRITE_DESIGNS, type PetSpriteDesign, type SpriteBase, type SpriteFeature } from "../data/petSpriteDesigns";
import { getWaterPetPixelArt } from "../data/waterPetPixelArt";
import { getWindPetPixelArt } from "../data/windPetPixelArt";
import { ELEMENT_COLORS } from "../game/balance";
import type { ElementType, GrowthLevel } from "../game/types";

const DESIGN_COORD_SIZE = 24;
const SPRITE_SIZE = 64;

type PixelKey = "empty" | "outline" | "body" | "light" | "accent" | "dark" | "eye" | "beak" | "white" | "shadow";
type PixelGrid = PixelKey[][];

const elementAccent: Record<ElementType, string> = {
  fire: "#ffd166",
  water: "#9be7ff",
  forest: "#b8f28b",
  earth: "#e4c38a",
  wind: "#d7fbff"
};

const elementLight: Record<ElementType, string> = {
  fire: "#ff9f5a",
  water: "#58c7ee",
  forest: "#7fca66",
  earth: "#b78657",
  wind: "#89d1d7"
};

const elementDark: Record<ElementType, string> = {
  fire: "#7e2f2c",
  water: "#1b4d75",
  forest: "#24552d",
  earth: "#4f3828",
  wind: "#2e6268"
};

const fallbackDesign: PetSpriteDesign = {
  base: "fox",
  pattern: "spots",
  features: [],
  bulk: "normal"
};

const makeGrid = (width = SPRITE_SIZE, height = SPRITE_SIZE): PixelGrid =>
  Array.from({ length: height }, () => Array.from({ length: width }, () => "empty" as PixelKey));

const hashString = (value: string): number =>
  value.split("").reduce((total, char, index) => total + char.charCodeAt(0) * (index + 5), 23);

const nativeCoord = (value: number): number => Math.round((value / DESIGN_COORD_SIZE) * SPRITE_SIZE);
const nativeSpan = (value: number): number => Math.max(1, Math.round((value / DESIGN_COORD_SIZE) * SPRITE_SIZE));

const setNativePixel = (grid: PixelGrid, x: number, y: number, key: PixelKey) => {
  if (x >= 0 && y >= 0 && y < grid.length && x < grid[y].length) {
    grid[y][x] = key;
  }
};

const drawNativeRect = (grid: PixelGrid, x: number, y: number, width: number, height: number, key: PixelKey) => {
  for (let yy = y; yy < y + height; yy += 1) {
    for (let xx = x; xx < x + width; xx += 1) {
      setNativePixel(grid, xx, yy, key);
    }
  }
};

const drawNativeLine = (grid: PixelGrid, x0: number, y0: number, x1: number, y1: number, key: PixelKey, thickness = 1) => {
  let currentX = x0;
  let currentY = y0;
  const dx = Math.abs(x1 - x0);
  const sx = x0 < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - y0);
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;

  while (true) {
    drawNativeRect(grid, currentX - Math.floor(thickness / 2), currentY - Math.floor(thickness / 2), thickness, thickness, key);
    if (currentX === x1 && currentY === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      currentX += sx;
    }
    if (e2 <= dx) {
      err += dx;
      currentY += sy;
    }
  }
};

const drawNativeEllipse = (grid: PixelGrid, cx: number, cy: number, rx: number, ry: number, fill: PixelKey = "body") => {
  for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y += 1) {
    for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x += 1) {
      const value = ((x - cx) * (x - cx)) / (rx * rx) + ((y - cy) * (y - cy)) / (ry * ry);
      if (value <= 1) {
        setNativePixel(grid, x, y, value > 0.68 ? "outline" : fill);
      }
    }
  }
  setNativePixel(grid, Math.round(cx - rx / 2), Math.round(cy - ry / 2), "light");
  setNativePixel(grid, Math.round(cx + rx / 2), Math.round(cy + ry / 2), "dark");
};

const setPixel = (grid: PixelGrid, x: number, y: number, key: PixelKey) => {
  setNativePixel(grid, nativeCoord(x), nativeCoord(y), key);
};

const paintBody = (grid: PixelGrid, x: number, y: number, key: PixelKey) => {
  const nativeX = nativeCoord(x);
  const nativeY = nativeCoord(y);
  if (grid[nativeY]?.[nativeX] === "body" || grid[nativeY]?.[nativeX] === "light" || grid[nativeY]?.[nativeX] === "dark") {
    setNativePixel(grid, nativeX, nativeY, key);
  }
};

const drawRect = (grid: PixelGrid, x: number, y: number, width: number, height: number, key: PixelKey) => {
  drawNativeRect(grid, nativeCoord(x), nativeCoord(y), nativeSpan(width), nativeSpan(height), key);
};

const drawLine = (grid: PixelGrid, x0: number, y0: number, x1: number, y1: number, key: PixelKey, thickness = 1) => {
  let currentX = nativeCoord(x0);
  let currentY = nativeCoord(y0);
  const targetX = nativeCoord(x1);
  const targetY = nativeCoord(y1);
  const nativeThickness = nativeSpan(thickness);
  const dx = Math.abs(targetX - currentX);
  const sx = currentX < targetX ? 1 : -1;
  const dy = -Math.abs(targetY - currentY);
  const sy = currentY < targetY ? 1 : -1;
  let err = dx + dy;

  while (true) {
    drawNativeRect(grid, currentX - Math.floor(nativeThickness / 2), currentY - Math.floor(nativeThickness / 2), nativeThickness, nativeThickness, key);
    if (currentX === targetX && currentY === targetY) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      currentX += sx;
    }
    if (e2 <= dx) {
      err += dx;
      currentY += sy;
    }
  }
};

const drawEllipse = (grid: PixelGrid, cx: number, cy: number, rx: number, ry: number, fill: PixelKey = "body") => {
  const nativeCx = nativeCoord(cx);
  const nativeCy = nativeCoord(cy);
  const nativeRx = nativeSpan(rx);
  const nativeRy = nativeSpan(ry);
  for (let y = Math.floor(nativeCy - nativeRy - 1); y <= Math.ceil(nativeCy + nativeRy + 1); y += 1) {
    for (let x = Math.floor(nativeCx - nativeRx - 1); x <= Math.ceil(nativeCx + nativeRx + 1); x += 1) {
      const value = ((x - nativeCx) * (x - nativeCx)) / (nativeRx * nativeRx) + ((y - nativeCy) * (y - nativeCy)) / (nativeRy * nativeRy);
      if (value <= 1) {
        setNativePixel(grid, x, y, value > 0.68 ? "outline" : fill);
      }
    }
  }
  setNativePixel(grid, Math.round(nativeCx - nativeRx / 2), Math.round(nativeCy - nativeRy / 2), "light");
  setNativePixel(grid, Math.round(nativeCx + nativeRx / 2), Math.round(nativeCy + nativeRy / 2), "dark");
};

const drawPointedEar = (grid: PixelGrid, x: number, y: number, flip = false) => {
  const dir = flip ? -1 : 1;
  setPixel(grid, x, y, "outline");
  drawRect(grid, x - (flip ? 2 : 0), y + 1, 3, 2, "outline");
  setPixel(grid, x + dir, y + 1, "accent");
  setPixel(grid, x, y + 2, "body");
};

const drawHorn = (grid: PixelGrid, x: number, y: number, tall = false) => {
  setPixel(grid, x, y, "accent");
  setPixel(grid, x, y + 1, "accent");
  setPixel(grid, x, y + 2, "outline");
  if (tall) {
    setPixel(grid, x - 1, y - 1, "accent");
    setPixel(grid, x + 1, y - 1, "accent");
  }
};

const drawAntlers = (grid: PixelGrid, leftX: number, y: number, large = false) => {
  [leftX, leftX + 5].forEach((x, index) => {
    const side = index === 0 ? -1 : 1;
    drawLine(grid, x, y + 4, x + side, y, "outline");
    drawLine(grid, x + side, y + 1, x + side * 3, y, "accent");
    drawLine(grid, x + side, y + 2, x + side * 3, y + 3, "accent");
    if (large) drawLine(grid, x + side, y, x + side * 3, y - 2, "accent");
  });
};

const drawLegs = (grid: PixelGrid, xs: number[], y: number, height: number, heavy = false) => {
  xs.forEach((x) => {
    drawRect(grid, x, y, heavy ? 3 : 2, height, "outline");
    drawRect(grid, x + 1, y, 1, Math.max(1, height - 1), "body");
    drawRect(grid, x, y + height, heavy ? 3 : 2, 1, "dark");
  });
};

const drawWing = (grid: PixelGrid, x: number, y: number, width: number, height: number, side: "left" | "right" = "left") => {
  const dir = side === "left" ? -1 : 1;
  for (let row = 0; row < height; row += 1) {
    const rowWidth = Math.max(1, width - Math.floor(row * 0.75));
    for (let col = 0; col < rowWidth; col += 1) {
      const xx = x + dir * col;
      const yy = y + row;
      setPixel(grid, xx, yy, col === rowWidth - 1 || row === 0 ? "outline" : row % 2 === 0 ? "accent" : "light");
    }
  }
};

const drawTailFluke = (grid: PixelGrid, x: number, y: number) => {
  drawLine(grid, x, y, x - 4, y - 3, "outline", 2);
  drawLine(grid, x, y, x - 4, y + 3, "outline", 2);
  drawLine(grid, x - 1, y, x - 4, y - 2, "accent");
  drawLine(grid, x - 1, y, x - 4, y + 2, "accent");
};

const drawTail = (grid: PixelGrid, x: number, y: number, kind: "thin" | "bushy" | "curled" | "blade" | "cloud" = "thin") => {
  if (kind === "bushy") {
    drawEllipse(grid, x, y, 4, 3, "accent");
    drawEllipse(grid, x - 3, y - 1, 3, 3, "body");
    return;
  }
  if (kind === "curled") {
    drawLine(grid, x + 1, y + 2, x - 3, y - 2, "outline", 2);
    drawEllipse(grid, x - 4, y - 2, 2, 2, "accent");
    return;
  }
  if (kind === "blade") {
    drawLine(grid, x + 1, y + 1, x - 4, y - 1, "outline", 2);
    drawLine(grid, x - 3, y - 1, x - 6, y - 4, "accent", 2);
    return;
  }
  if (kind === "cloud") {
    drawEllipse(grid, x, y, 3, 2, "white");
    drawEllipse(grid, x - 3, y + 1, 3, 2, "white");
    return;
  }
  drawLine(grid, x, y, x - 5, y - 1, "outline", 2);
  drawLine(grid, x - 1, y, x - 5, y - 1, "accent");
};

const bulkScale = (design: PetSpriteDesign): number => {
  if (design.bulk === "small") return -1;
  if (design.bulk === "large") return 1;
  if (design.bulk === "giant") return 2;
  return 0;
};

const drawPetBase = (grid: PixelGrid, base: SpriteBase, design: PetSpriteDesign) => {
  const bulk = bulkScale(design);

  switch (base) {
    case "lizard":
      drawEllipse(grid, 10, 15, 6 + bulk, 3, "body");
      drawEllipse(grid, 17, 12, 4, 3, "body");
      drawTail(grid, 5, 15, "thin");
      drawLegs(grid, [8, 13], 17, 3, false);
      drawLine(grid, 13, 11, 9, 9, "outline");
      setPixel(grid, 19, 11, "eye");
      break;
    case "pig":
      drawEllipse(grid, 10, 15, 7 + bulk, 5, "body");
      drawEllipse(grid, 17, 13, 4, 3, "body");
      drawRect(grid, 19, 13, 3, 2, "accent");
      drawPointedEar(grid, 15, 9, true);
      drawTail(grid, 3, 14, "curled");
      drawLegs(grid, [7, 13], 18, 3, true);
      setPixel(grid, 18, 12, "eye");
      break;
    case "fox":
      drawEllipse(grid, 10, 15, 6 + bulk, 3, "body");
      drawEllipse(grid, 17, 11, 4, 3, "body");
      drawPointedEar(grid, 15, 7, true);
      drawPointedEar(grid, 18, 7);
      drawTail(grid, 4, 13, "bushy");
      drawLegs(grid, [8, 14], 17, 3, false);
      setPixel(grid, 19, 11, "eye");
      break;
    case "cat":
      drawEllipse(grid, 10, 15, 6 + bulk, 3, "body");
      drawEllipse(grid, 17, 11, 4, 3, "body");
      drawPointedEar(grid, 15, 7, true);
      drawPointedEar(grid, 19, 7);
      drawTail(grid, 4, 13, "curled");
      drawLegs(grid, [8, 14], 17, 3, false);
      setPixel(grid, 19, 11, "eye");
      break;
    case "panther":
      drawEllipse(grid, 10, 15, 7 + bulk, 3, "body");
      drawEllipse(grid, 18, 11, 4, 3, "body");
      drawPointedEar(grid, 16, 8, true);
      drawPointedEar(grid, 20, 8);
      drawTail(grid, 4, 13, "thin");
      drawLegs(grid, [8, 14], 17, 4, false);
      drawLine(grid, 13, 10, 16, 9, "outline");
      setPixel(grid, 20, 11, "eye");
      break;
    case "wolf":
      drawEllipse(grid, 10, 15, 7 + bulk, 3, "body");
      drawEllipse(grid, 18, 11, 4, 3, "body");
      drawPointedEar(grid, 15, 7, true);
      drawPointedEar(grid, 19, 7);
      drawTail(grid, 4, 13, "bushy");
      drawLegs(grid, [8, 14], 17, 4, false);
      drawRect(grid, 19, 13, 3, 1, "outline");
      setPixel(grid, 20, 11, "eye");
      break;
    case "weasel":
      drawEllipse(grid, 10, 15, 7, 2, "body");
      drawEllipse(grid, 17, 12, 3, 2, "body");
      drawPointedEar(grid, 16, 9, true);
      drawTail(grid, 4, 14, "thin");
      drawLegs(grid, [8, 14], 17, 2, false);
      setPixel(grid, 19, 12, "eye");
      break;
    case "lion":
      drawEllipse(grid, 10, 15, 7 + bulk, 4, "body");
      drawEllipse(grid, 17, 11, 5, 4, "accent");
      drawEllipse(grid, 18, 11, 3, 2, "body");
      drawTail(grid, 4, 13, "thin");
      drawLegs(grid, [8, 14], 18, 3, true);
      setPixel(grid, 19, 10, "eye");
      break;
    case "bear":
      drawEllipse(grid, 10, 15, 8 + bulk, 5, "body");
      drawEllipse(grid, 17, 11, 5, 4, "body");
      drawEllipse(grid, 14, 8, 2, 2, "outline");
      drawEllipse(grid, 19, 8, 2, 2, "outline");
      drawLegs(grid, [7, 14], 18, 3, true);
      setPixel(grid, 19, 11, "eye");
      break;
    case "deer":
    case "kirin":
      drawEllipse(grid, 10, 15, 6 + bulk, 3, "body");
      drawEllipse(grid, 17, 11, 4, 3, "body");
      drawPointedEar(grid, 15, 8, true);
      drawPointedEar(grid, 19, 8);
      drawTail(grid, 4, 14, "thin");
      drawLegs(grid, [8, 14], 17, 4, false);
      drawAntlers(grid, 15, base === "kirin" ? 3 : 4, base === "kirin");
      setPixel(grid, 19, 11, "eye");
      break;
    case "bull":
      drawEllipse(grid, 10, 15, 8 + bulk, 4, "body");
      drawEllipse(grid, 18, 12, 5, 3, "body");
      drawHorn(grid, 15, 7);
      drawHorn(grid, 20, 7);
      drawTail(grid, 3, 14, "thin");
      drawLegs(grid, [7, 14], 18, 3, true);
      setPixel(grid, 19, 11, "eye");
      break;
    case "rhino":
      drawEllipse(grid, 10, 15, 8 + bulk, 5, "body");
      drawEllipse(grid, 18, 12, 5, 3, "body");
      drawLine(grid, 21, 11, 23, 9, "accent", 2);
      drawLegs(grid, [7, 14], 18, 3, true);
      setPixel(grid, 19, 11, "eye");
      break;
    case "sheep":
      drawEllipse(grid, 10, 15, 7 + bulk, 5, "white");
      drawEllipse(grid, 17, 12, 4, 3, "body");
      drawHorn(grid, 15, 9);
      drawHorn(grid, 19, 9);
      drawLegs(grid, [8, 14], 18, 3, false);
      setPixel(grid, 18, 12, "eye");
      break;
    case "rabbit":
      drawEllipse(grid, 10, 16, 6 + bulk, 4, "body");
      drawEllipse(grid, 17, 12, 4, 3, "body");
      drawLine(grid, 15, 9, 14, 4, "outline", 2);
      drawLine(grid, 19, 9, 20, 4, "outline", 2);
      drawLine(grid, 15, 8, 14, 5, "accent");
      drawLine(grid, 19, 8, 20, 5, "accent");
      drawEllipse(grid, 4, 15, 2, 2, "white");
      drawLegs(grid, [9, 14], 19, 2, false);
      setPixel(grid, 19, 12, "eye");
      break;
    case "mouse":
    case "rat":
      drawEllipse(grid, 10, 16, 5 + bulk, 3, "body");
      drawEllipse(grid, 16, 13, 4, 3, "body");
      drawEllipse(grid, 14, 10, 2, 2, "accent");
      drawEllipse(grid, 18, 10, 2, 2, "accent");
      drawTail(grid, 5, 15, base === "rat" ? "thin" : "curled");
      drawLegs(grid, [9, 14], 18, 2, false);
      setPixel(grid, 18, 13, "eye");
      break;
    case "monkey":
      drawEllipse(grid, 11, 15, 5, 5, "body");
      drawEllipse(grid, 16, 10, 4, 3, "body");
      drawEllipse(grid, 14, 10, 2, 2, "accent");
      drawEllipse(grid, 19, 10, 2, 2, "accent");
      drawLine(grid, 8, 14, 5, 17, "outline", 2);
      drawLine(grid, 14, 15, 18, 17, "outline", 2);
      drawTail(grid, 7, 14, "curled");
      drawLegs(grid, [10, 14], 19, 3, false);
      setPixel(grid, 17, 10, "eye");
      break;
    case "ape":
      drawEllipse(grid, 11, 15, 6 + bulk, 5, "body");
      drawEllipse(grid, 16, 10, 5, 4, "body");
      drawLine(grid, 7, 14, 4, 18, "outline", 3);
      drawLine(grid, 15, 15, 20, 18, "outline", 3);
      drawLegs(grid, [9, 14], 19, 3, true);
      setPixel(grid, 18, 10, "eye");
      break;
    case "golem":
      drawRect(grid, 8, 10, 8 + bulk, 8, "outline");
      drawRect(grid, 9, 11, 6 + bulk, 6, "body");
      drawRect(grid, 10, 5, 6, 5, "outline");
      drawRect(grid, 11, 6, 4, 3, "body");
      drawRect(grid, 4, 12, 4, 6, "outline");
      drawRect(grid, 16 + bulk, 12, 4, 6, "outline");
      drawLegs(grid, [9, 14], 18, 4, true);
      setPixel(grid, 14, 7, "eye");
      break;
    case "turtle":
      drawEllipse(grid, 11, 15, 8 + bulk, 5, "accent");
      drawEllipse(grid, 11, 16, 6 + bulk, 3, "body");
      drawEllipse(grid, 19, 13, 4, 3, "body");
      drawEllipse(grid, 5, 17, 2, 2, "body");
      drawLegs(grid, [8, 14], 18, 2, false);
      setPixel(grid, 20, 13, "eye");
      break;
    case "crab":
      drawEllipse(grid, 12, 15, 7 + bulk, 4, "body");
      drawEllipse(grid, 18, 13, 2, 2, "eye");
      drawEllipse(grid, 8, 13, 2, 2, "eye");
      drawLine(grid, 6, 15, 2, 12, "outline", 2);
      drawEllipse(grid, 2, 11, 2, 2, "accent");
      drawLine(grid, 18, 15, 22, 12, "outline", 2);
      drawEllipse(grid, 22, 11, 2, 2, "accent");
      [7, 10, 14, 17].forEach((x) => drawLine(grid, x, 18, x - 2, 21, "outline"));
      break;
    case "bug":
      drawEllipse(grid, 9, 15, 4, 4, "body");
      drawEllipse(grid, 14, 15, 4, 4, "accent");
      drawEllipse(grid, 18, 13, 3, 3, "body");
      drawLine(grid, 18, 10, 16, 7, "outline");
      drawLine(grid, 19, 10, 22, 7, "outline");
      [7, 10, 14, 17].forEach((x) => {
        drawLine(grid, x, 18, x - 2, 21, "outline");
        drawLine(grid, x, 18, x + 2, 21, "outline");
      });
      setPixel(grid, 19, 13, "eye");
      break;
    case "dragonfly":
      drawEllipse(grid, 12, 14, 3, 6, "body");
      drawEllipse(grid, 16, 10, 3, 3, "body");
      drawWing(grid, 10, 7, 7, 5, "left");
      drawWing(grid, 13, 7, 7, 5, "right");
      drawWing(grid, 10, 13, 6, 4, "left");
      drawWing(grid, 13, 13, 6, 4, "right");
      drawLine(grid, 12, 18, 12, 22, "outline");
      setPixel(grid, 17, 10, "eye");
      break;
    case "dolphin":
      drawEllipse(grid, 11, 14, 8 + bulk, 4, "body");
      drawEllipse(grid, 18, 12, 4, 3, "body");
      drawTailFluke(grid, 4, 14);
      drawLine(grid, 11, 10, 10, 7, "accent", 2);
      drawLine(grid, 13, 17, 16, 20, "accent", 2);
      setPixel(grid, 19, 12, "eye");
      break;
    case "whale":
      drawEllipse(grid, 11, 15, 9 + bulk, 5, "body");
      drawEllipse(grid, 18, 13, 5, 4, "body");
      drawTailFluke(grid, 3, 15);
      drawLine(grid, 11, 10, 10, 7, "accent", 2);
      setPixel(grid, 20, 13, "eye");
      break;
    case "otter":
      drawEllipse(grid, 10, 15, 7, 4, "body");
      drawEllipse(grid, 17, 11, 4, 3, "body");
      drawEllipse(grid, 14, 9, 2, 2, "outline");
      drawEllipse(grid, 19, 9, 2, 2, "outline");
      drawTail(grid, 4, 15, "blade");
      drawLegs(grid, [9, 14], 18, 2, false);
      setPixel(grid, 19, 11, "eye");
      break;
    case "frog":
      drawEllipse(grid, 11, 16, 7, 4, "body");
      drawEllipse(grid, 8, 11, 3, 3, "body");
      drawEllipse(grid, 15, 11, 3, 3, "body");
      setPixel(grid, 8, 10, "eye");
      setPixel(grid, 15, 10, "eye");
      drawLine(grid, 7, 18, 4, 21, "outline", 2);
      drawLine(grid, 15, 18, 20, 21, "outline", 2);
      break;
    case "serpent":
      drawEllipse(grid, 7, 17, 4, 3, "body");
      drawEllipse(grid, 12, 15, 4, 3, "body");
      drawEllipse(grid, 16, 12, 4, 3, "body");
      drawEllipse(grid, 19, 9, 4, 3, "body");
      drawLine(grid, 4, 18, 1, 20, "outline", 2);
      setPixel(grid, 21, 9, "eye");
      break;
    case "mer":
      drawTailFluke(grid, 6, 17);
      drawEllipse(grid, 11, 16, 6, 3, "body");
      drawEllipse(grid, 15, 11, 4, 5, "body");
      drawEllipse(grid, 16, 6, 3, 3, "body");
      drawLine(grid, 12, 11, 8, 13, "outline", 2);
      drawLine(grid, 18, 11, 21, 13, "outline", 2);
      setPixel(grid, 17, 6, "eye");
      break;
    case "bird":
    case "sparrow":
    case "rooster":
    case "eagle":
    case "phoenix":
    case "vulture":
      drawEllipse(grid, 11, 15, 5 + bulk, 5, "body");
      drawEllipse(grid, 17, 10, base === "vulture" ? 4 : 3, 3, "body");
      drawWing(grid, 10, 11, base === "sparrow" ? 5 : 7 + bulk, base === "sparrow" ? 5 : 7, "left");
      drawLine(grid, 7, 17, 4, 20, "outline", 2);
      drawLine(grid, 9, 18, 5, 22, "accent", 2);
      drawRect(grid, 19, 10, 3, 2, "beak");
      drawLegs(grid, [10, 13], 19, 2, false);
      setPixel(grid, 18, 9, "eye");
      break;
    case "drake":
      drawEllipse(grid, 10, 15, 7 + bulk, 4, "body");
      drawEllipse(grid, 18, 10, 4, 4, "body");
      drawLine(grid, 14, 11, 17, 8, "outline", 2);
      drawWing(grid, 10, 9, 7, 6, "left");
      drawTail(grid, 4, 14, "thin");
      drawLegs(grid, [8, 14], 18, 3, true);
      setPixel(grid, 20, 10, "eye");
      break;
    case "griffin":
      drawEllipse(grid, 10, 15, 7 + bulk, 4, "body");
      drawEllipse(grid, 17, 10, 4, 3, "white");
      drawWing(grid, 10, 8, 8, 8, "left");
      drawRect(grid, 19, 10, 3, 2, "beak");
      drawTail(grid, 4, 14, "bushy");
      drawLegs(grid, [8, 14], 18, 3, true);
      setPixel(grid, 18, 9, "eye");
      break;
    default:
      drawEllipse(grid, 10, 15, 6, 3, "body");
      drawEllipse(grid, 17, 11, 4, 3, "body");
      setPixel(grid, 19, 11, "eye");
      break;
  }
};

const drawPattern = (grid: PixelGrid, pattern: PetSpriteDesign["pattern"]) => {
  if (pattern === "spots") {
    [
      [8, 14],
      [11, 16],
      [14, 13],
      [16, 15]
    ].forEach(([x, y]) => paintBody(grid, x, y, "accent"));
  }
  if (pattern === "stripes") {
    [8, 11, 14].forEach((x) => {
      paintBody(grid, x, 13, "dark");
      paintBody(grid, x + 1, 14, "dark");
      paintBody(grid, x + 1, 15, "dark");
    });
  }
  if (pattern === "bands") {
    [7, 11, 15].forEach((x, index) => {
      paintBody(grid, x, 13 + index, "dark");
      paintBody(grid, x + 1, 14 + index, "accent");
    });
  }
  if (pattern === "waves") {
    [
      [8, 13],
      [9, 14],
      [12, 16],
      [15, 15],
      [16, 14]
    ].forEach(([x, y], index) => paintBody(grid, x, y, index % 2 === 0 ? "accent" : "light"));
  }
  if (pattern === "leaf") {
    [
      [9, 13],
      [10, 12],
      [13, 15],
      [15, 14]
    ].forEach(([x, y]) => {
      paintBody(grid, x, y, "accent");
      paintBody(grid, x + 1, y, "light");
    });
  }
  if (pattern === "plates") {
    [
      [8, 13],
      [11, 12],
      [14, 13],
      [16, 15]
    ].forEach(([x, y]) => {
      paintBody(grid, x, y, "dark");
      paintBody(grid, x + 1, y, "accent");
    });
  }
  if (pattern === "runes") {
    [
      [9, 13],
      [12, 15],
      [15, 12],
      [17, 16]
    ].forEach(([x, y]) => {
      paintBody(grid, x, y, "accent");
      paintBody(grid, x, y + 1, "accent");
    });
  }
  if (pattern === "clouds") {
    [
      [8, 13],
      [10, 14],
      [13, 12],
      [15, 15]
    ].forEach(([x, y]) => paintBody(grid, x, y, "white"));
  }
  if (pattern === "crystal") {
    [
      [9, 12],
      [12, 13],
      [15, 12]
    ].forEach(([x, y]) => {
      paintBody(grid, x, y, "accent");
      paintBody(grid, x, y - 1, "light");
    });
  }
  if (pattern === "flames") {
    [
      [8, 13],
      [9, 12],
      [12, 14],
      [15, 13],
      [16, 12]
    ].forEach(([x, y]) => paintBody(grid, x, y, "accent"));
  }
  if (pattern === "thorns") {
    [
      [7, 12],
      [11, 11],
      [15, 12]
    ].forEach(([x, y]) => {
      setPixel(grid, x, y, "outline");
      setPixel(grid, x, y - 1, "accent");
    });
  }
  if (pattern === "wool") {
    [
      [6, 13],
      [8, 11],
      [11, 10],
      [14, 11],
      [16, 13]
    ].forEach(([x, y]) => drawEllipse(grid, x, y, 2, 2, "white"));
  }
};

const drawFeature = (grid: PixelGrid, feature: SpriteFeature) => {
  switch (feature) {
    case "flameTail":
      drawLine(grid, 3, 12, 1, 8, "accent", 2);
      setPixel(grid, 2, 7, "light");
      setPixel(grid, 1, 9, "body");
      break;
    case "backSpines":
      [8, 11, 14].forEach((x, index) => {
        setPixel(grid, x, 9 + index, "outline");
        setPixel(grid, x, 8 + index, "accent");
      });
      break;
    case "coalSnout":
      drawRect(grid, 20, 13, 3, 2, "dark");
      setPixel(grid, 21, 13, "shadow");
      break;
    case "lampTail":
      drawEllipse(grid, 2, 11, 2, 3, "accent");
      setPixel(grid, 2, 9, "light");
      break;
    case "roosterComb":
      drawRect(grid, 15, 5, 1, 3, "accent");
      drawRect(grid, 17, 4, 1, 4, "accent");
      drawRect(grid, 19, 5, 1, 3, "accent");
      break;
    case "magmaShell":
      drawLine(grid, 8, 11, 14, 17, "accent");
      drawLine(grid, 12, 10, 17, 15, "light");
      break;
    case "blazeFangs":
      setPixel(grid, 20, 13, "white");
      setPixel(grid, 21, 13, "white");
      break;
    case "tinderAntlers":
      drawAntlers(grid, 15, 3, true);
      setPixel(grid, 13, 1, "accent");
      setPixel(grid, 21, 1, "accent");
      break;
    case "flameCrown":
      [17, 19, 21].forEach((x, index) => {
        setPixel(grid, x, 5 - (index % 2), "accent");
        setPixel(grid, x, 6, "light");
      });
      break;
    case "volcanoBack":
      drawRect(grid, 8, 7, 3, 4, "outline");
      drawRect(grid, 9, 8, 1, 3, "accent");
      drawRect(grid, 13, 8, 3, 3, "outline");
      setPixel(grid, 14, 9, "light");
      break;
    case "phoenixCrest":
      drawLine(grid, 17, 6, 15, 2, "accent", 2);
      drawLine(grid, 18, 6, 19, 1, "light", 2);
      drawLine(grid, 19, 6, 22, 3, "accent", 2);
      break;
    case "stormWings":
      drawWing(grid, 11, 7, 10, 9, "left");
      drawWing(grid, 12, 7, 8, 8, "right");
      break;
    case "bubbleTrail":
      [
        [3, 8],
        [5, 6],
        [20, 18],
        [22, 16]
      ].forEach(([x, y]) => drawEllipse(grid, x, y, 1, 1, "white"));
      break;
    case "tideClaws":
      drawEllipse(grid, 2, 10, 3, 2, "accent");
      drawEllipse(grid, 22, 10, 3, 2, "accent");
      break;
    case "blueFins":
      drawLine(grid, 15, 9, 13, 5, "accent", 2);
      drawLine(grid, 18, 16, 21, 18, "accent", 2);
      break;
    case "mistEyes":
      drawEllipse(grid, 8, 9, 2, 2, "white");
      drawEllipse(grid, 15, 9, 2, 2, "white");
      setPixel(grid, 8, 9, "eye");
      setPixel(grid, 15, 9, "eye");
      break;
    case "coralCrown":
      [17, 19, 21].forEach((x) => {
        drawLine(grid, x, 10, x, 6, "accent");
        setPixel(grid, x - 1, 7, "light");
        setPixel(grid, x + 1, 8, "light");
      });
      break;
    case "brookWhiskers":
      drawLine(grid, 19, 12, 23, 11, "white");
      drawLine(grid, 19, 13, 23, 14, "white");
      break;
    case "waveBladeTail":
      drawTail(grid, 4, 15, "blade");
      drawLine(grid, 3, 11, 1, 8, "accent", 2);
      break;
    case "crystalCrown":
      drawLine(grid, 17, 8, 17, 4, "accent", 2);
      drawLine(grid, 20, 9, 21, 5, "light", 2);
      setPixel(grid, 18, 3, "white");
      break;
    case "jiaoHorns":
      drawHorn(grid, 17, 5, true);
      drawHorn(grid, 21, 5, true);
      drawLine(grid, 20, 8, 23, 7, "white");
      break;
    case "moonPearl":
      drawEllipse(grid, 15, 4, 2, 2, "white");
      setPixel(grid, 15, 3, "accent");
      break;
    case "leafTail":
      drawLine(grid, 5, 14, 1, 11, "outline", 2);
      drawEllipse(grid, 1, 10, 3, 2, "accent");
      break;
    case "mossBack":
      drawRect(grid, 7, 9, 7, 2, "accent");
      setPixel(grid, 9, 8, "light");
      setPixel(grid, 13, 8, "light");
      break;
    case "flowerEars":
      drawEllipse(grid, 14, 7, 2, 2, "accent");
      drawEllipse(grid, 20, 7, 2, 2, "accent");
      setPixel(grid, 14, 7, "white");
      setPixel(grid, 20, 7, "white");
      break;
    case "vineArmor":
      drawLine(grid, 6, 12, 16, 18, "accent", 2);
      drawLine(grid, 7, 17, 17, 12, "accent", 2);
      break;
    case "honeyBud":
      drawEllipse(grid, 3, 10, 2, 3, "accent");
      drawRect(grid, 2, 9, 3, 1, "light");
      break;
    case "thornSpikes":
      [7, 10, 13, 16].forEach((x) => {
        setPixel(grid, x, 10, "outline");
        setPixel(grid, x, 9, "accent");
      });
      break;
    case "ancientAntlers":
      drawAntlers(grid, 14, 1, true);
      drawLine(grid, 11, 3, 9, 1, "accent");
      drawLine(grid, 22, 3, 23, 1, "accent");
      break;
    case "giantMoss":
      drawRect(grid, 7, 8, 9, 2, "accent");
      setPixel(grid, 9, 7, "light");
      setPixel(grid, 12, 7, "light");
      setPixel(grid, 15, 7, "light");
      break;
    case "jadeCrest":
      drawLine(grid, 17, 7, 16, 3, "accent", 2);
      drawLine(grid, 19, 7, 21, 4, "light", 2);
      break;
    case "galeWing":
      drawWing(grid, 9, 8, 8, 7, "left");
      break;
    case "stoneFangs":
      setPixel(grid, 20, 13, "white");
      setPixel(grid, 21, 13, "white");
      setPixel(grid, 19, 14, "accent");
      break;
    case "sandFrill":
      [14, 16, 18].forEach((x) => {
        setPixel(grid, x, 8, "outline");
        setPixel(grid, x, 7, "accent");
      });
      break;
    case "roundWool":
      [
        [6, 12],
        [8, 10],
        [11, 9],
        [14, 10],
        [16, 12]
      ].forEach(([x, y]) => drawEllipse(grid, x, y, 2, 2, "white"));
      break;
    case "copperShell":
      drawRect(grid, 8, 11, 8, 2, "accent");
      drawRect(grid, 9, 13, 6, 1, "dark");
      break;
    case "rockHorn":
      drawHorn(grid, 20, 7, true);
      drawLine(grid, 19, 8, 23, 5, "accent", 2);
      break;
    case "sandMask":
      drawRect(grid, 16, 10, 5, 2, "dark");
      setPixel(grid, 19, 11, "eye");
      break;
    case "shieldArm":
      drawRect(grid, 18, 13, 4, 6, "outline");
      drawRect(grid, 19, 14, 2, 4, "accent");
      break;
    case "ridgeBack":
      [7, 10, 13, 16].forEach((x) => {
        drawRect(grid, x, 8, 2, 4, "outline");
        setPixel(grid, x, 8, "accent");
      });
      break;
    case "meteorMane":
      drawEllipse(grid, 16, 10, 6, 5, "accent");
      drawEllipse(grid, 18, 10, 3, 2, "body");
      setPixel(grid, 20, 9, "eye");
      break;
    case "golemRunes":
      drawRect(grid, 11, 12, 1, 4, "accent");
      drawRect(grid, 13, 14, 3, 1, "accent");
      drawRect(grid, 12, 7, 2, 1, "light");
      break;
    case "chimeTail":
      drawLine(grid, 6, 17, 3, 21, "outline");
      drawRect(grid, 2, 20, 3, 3, "accent");
      setPixel(grid, 3, 22, "light");
      break;
    case "cloudTail":
      drawTail(grid, 4, 14, "cloud");
      break;
    case "rotorWings":
      drawLine(grid, 12, 10, 5, 5, "white", 2);
      drawLine(grid, 12, 10, 19, 5, "white", 2);
      drawLine(grid, 12, 14, 5, 18, "white", 2);
      drawLine(grid, 12, 14, 19, 18, "white", 2);
      break;
    case "featherTufts":
      drawLine(grid, 15, 8, 13, 5, "white", 2);
      drawLine(grid, 18, 8, 20, 5, "white", 2);
      drawLine(grid, 5, 13, 2, 10, "white", 2);
      break;
    case "whitePlumes":
      drawLine(grid, 15, 8, 14, 4, "white", 2);
      drawLine(grid, 19, 8, 21, 5, "white", 2);
      drawLine(grid, 4, 14, 1, 12, "white", 2);
      break;
    case "swiftStripe":
      drawLine(grid, 8, 13, 17, 14, "white", 2);
      break;
    case "thunderCrest":
      drawLine(grid, 17, 7, 20, 3, "accent", 2);
      drawLine(grid, 20, 3, 18, 3, "light");
      break;
    case "kirinHorn":
      drawLine(grid, 18, 7, 18, 2, "accent", 2);
      setPixel(grid, 18, 1, "light");
      break;
    default:
      break;
  }
};

const drawElementMotif = (grid: PixelGrid, element: ElementType, growthLevel: GrowthLevel) => {
  if (element === "fire") {
    setPixel(grid, 6, 5, "accent");
    setPixel(grid, 7, 4, "light");
    if (growthLevel >= 2) setPixel(grid, 8, 5, "accent");
  }
  if (element === "water") {
    drawEllipse(grid, 4, 6, 1, 1, "white");
    if (growthLevel >= 2) drawEllipse(grid, 21, 18, 1, 1, "accent");
  }
  if (element === "forest") {
    drawRect(grid, 4, 6, 2, 1, "accent");
    setPixel(grid, 5, 5, "light");
    if (growthLevel >= 2) setPixel(grid, 20, 7, "accent");
  }
  if (element === "earth") {
    drawRect(grid, 3, 20, 2, 2, "dark");
    if (growthLevel >= 2) drawRect(grid, 19, 20, 2, 2, "accent");
  }
  if (element === "wind") {
    drawLine(grid, 3, 7, 6, 6, "white");
    if (growthLevel >= 2) drawLine(grid, 18, 5, 22, 6, "accent");
  }
};

const nativeFrom48 = (value: number): number => Math.round((value / 48) * SPRITE_SIZE);
const spanFrom48 = (value: number): number => Math.max(1, Math.round((value / 48) * SPRITE_SIZE));

const decorateNativePetGrid = (grid: PixelGrid, speciesId: string, element: ElementType, growthLevel: GrowthLevel): PixelGrid => {
  const hash = hashString(speciesId);

  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === "body") {
        if ((x * 5 + y * 3 + hash) % 47 === 0) setNativePixel(grid, x, y, "light");
        if ((x * 7 + y * 2 + hash) % 67 === 0) setNativePixel(grid, x, y, "dark");
      }
      if (cell === "accent" && (x + y + hash) % 41 === 0) {
        setNativePixel(grid, x, y, "light");
      }
      if (cell === "white" && (x * 3 + y + hash) % 53 === 0) {
        setNativePixel(grid, x, y, "accent");
      }
    });
  });

  if (element === "fire") {
    drawNativeRect(grid, nativeFrom48(8), nativeFrom48(5), spanFrom48(2), spanFrom48(2), "light");
    if (growthLevel === 3) drawNativeLine(grid, nativeFrom48(11), nativeFrom48(4), nativeFrom48(14), nativeFrom48(1), "accent", spanFrom48(2));
  }
  if (element === "water") {
    drawNativeEllipse(grid, nativeFrom48(6), nativeFrom48(8), spanFrom48(2), spanFrom48(2), "white");
    if (growthLevel >= 2) drawNativeEllipse(grid, nativeFrom48(42), nativeFrom48(35), spanFrom48(2), spanFrom48(2), "accent");
  }
  if (element === "forest") {
    drawNativeLine(grid, nativeFrom48(7), nativeFrom48(8), nativeFrom48(11), nativeFrom48(6), "light", spanFrom48(2));
    if (growthLevel === 3) drawNativeRect(grid, nativeFrom48(39), nativeFrom48(12), spanFrom48(3), spanFrom48(2), "accent");
  }
  if (element === "earth") {
    drawNativeRect(grid, nativeFrom48(5), nativeFrom48(41), spanFrom48(4), spanFrom48(3), "dark");
    if (growthLevel >= 2) drawNativeRect(grid, nativeFrom48(38), nativeFrom48(40), spanFrom48(4), spanFrom48(3), "accent");
  }
  if (element === "wind") {
    drawNativeLine(grid, nativeFrom48(4), nativeFrom48(11), nativeFrom48(12), nativeFrom48(9), "white");
    if (growthLevel === 3) drawNativeLine(grid, nativeFrom48(35), nativeFrom48(8), nativeFrom48(45), nativeFrom48(10), "accent");
  }

  return grid;
};

const drawPetPixels = (speciesId: string, element: ElementType, growthLevel: GrowthLevel): PixelGrid => {
  const design = PET_SPRITE_DESIGNS[speciesId] ?? fallbackDesign;
  const grid = makeGrid();

  drawPetBase(grid, design.base, design);
  drawPattern(grid, design.pattern);
  design.features.forEach((feature) => drawFeature(grid, feature));
  drawElementMotif(grid, element, growthLevel);

  if (growthLevel === 3) {
    setPixel(grid, 6, 22, "shadow");
    drawRect(grid, 7, 22, 10, 1, "shadow");
  }

  return decorateNativePetGrid(grid, speciesId, element, growthLevel);
};

interface PixelPetSpriteProps {
  speciesId: string;
  element: ElementType;
  growthLevel: GrowthLevel;
  size?: "tiny" | "small" | "medium" | "large";
  fainted?: boolean;
  active?: boolean;
}

export function PixelPetSprite({ speciesId, element, growthLevel, size = "medium", fainted, active }: PixelPetSpriteProps) {
  const artwork = PET_ARTWORK[speciesId];
  const spriteClassName = `pixel-sprite pixel-pet pixel-${size} ${fainted ? "fainted" : ""} ${active ? "sprite-active" : ""}`;

  if (artwork) {
    return (
      <span className={`${spriteClassName} pet-art-sprite`} aria-hidden="true">
        <img className="pet-art-image" src={artwork} alt="" draggable={false} />
      </span>
    );
  }

  const authoredArt =
    getWindPetPixelArt(speciesId) ??
    getEarthPetPixelArt(speciesId) ??
    getFirePetPixelArt(speciesId) ??
    getForestPetPixelArt(speciesId) ??
    getWaterPetPixelArt(speciesId);
  const fallbackColors: Record<PixelKey, string> = {
    empty: "transparent",
    outline: "#17211f",
    body: ELEMENT_COLORS[element],
    light: elementLight[element],
    accent: elementAccent[element],
    dark: elementDark[element],
    eye: "#fffaf0",
    beak: "#ffd166",
    white: "#fff8dc",
    shadow: "rgba(23, 33, 31, 0.38)"
  };
  const colors: Record<string, string> = authoredArt
    ? {
        ".": "transparent",
        ...Object.fromEntries(Object.entries(authoredArt.palette).map(([key, entry]) => [key, entry.color]))
      }
    : fallbackColors;
  const pixelRows = authoredArt ? authoredArt.pixels : drawPetPixels(speciesId, element, growthLevel);
  const bodyColor = authoredArt?.palette.m?.color ?? ELEMENT_COLORS[element];
  const accentColor = authoredArt?.palette.f?.color ?? elementAccent[element];

  return (
    <span
      className={spriteClassName}
      aria-hidden="true"
      style={
        {
          "--sprite-columns": SPRITE_SIZE,
          "--sprite-rows": SPRITE_SIZE,
          "--sprite-body": bodyColor,
          "--sprite-accent": accentColor
        } as CSSProperties
      }
    >
      {pixelRows.flatMap((row, y) =>
        row.map((cell, x) => <span className="pixel" key={`${x}-${y}`} style={{ backgroundColor: colors[cell] }} />)
      )}
    </span>
  );
}

type SymbolGrid = string[][];

const makeSymbolGrid = (): SymbolGrid => Array.from({ length: SPRITE_SIZE }, () => Array.from({ length: SPRITE_SIZE }, () => "."));

const setSymbolPixel = (grid: SymbolGrid, x: number, y: number, key: string) => {
  if (x >= 0 && y >= 0 && y < grid.length && x < grid[y].length) {
    grid[y][x] = key;
  }
};

const drawSymbolRect = (grid: SymbolGrid, x: number, y: number, width: number, height: number, key: string) => {
  for (let yy = y; yy < y + height; yy += 1) {
    for (let xx = x; xx < x + width; xx += 1) {
      setSymbolPixel(grid, xx, yy, key);
    }
  }
};

const drawPlayerPixels = (): SymbolGrid => {
  const grid = makeSymbolGrid();

  drawSymbolRect(grid, 20, 55, 24, 4, "s");
  drawSymbolRect(grid, 23, 58, 18, 2, "s");

  drawSymbolRect(grid, 23, 5, 18, 7, "h");
  drawSymbolRect(grid, 19, 11, 26, 7, "h");
  drawSymbolRect(grid, 17, 18, 30, 5, "h");
  drawSymbolRect(grid, 20, 17, 24, 13, "f");
  drawSymbolRect(grid, 18, 23, 4, 9, "f");
  drawSymbolRect(grid, 42, 23, 4, 9, "f");
  drawSymbolRect(grid, 25, 28, 14, 4, "f");
  drawSymbolRect(grid, 23, 20, 3, 3, "h");
  drawSymbolRect(grid, 38, 20, 3, 3, "h");
  drawSymbolRect(grid, 25, 21, 3, 3, "d");
  drawSymbolRect(grid, 38, 21, 3, 3, "d");
  drawSymbolRect(grid, 31, 27, 5, 2, "h");

  drawSymbolRect(grid, 20, 33, 24, 6, "b");
  drawSymbolRect(grid, 17, 39, 30, 7, "b");
  drawSymbolRect(grid, 21, 38, 22, 15, "g");
  drawSymbolRect(grid, 28, 39, 8, 13, "y");
  drawSymbolRect(grid, 42, 34, 5, 7, "r");
  drawSymbolRect(grid, 14, 40, 7, 11, "b");
  drawSymbolRect(grid, 43, 40, 7, 11, "b");
  drawSymbolRect(grid, 24, 52, 7, 8, "b");
  drawSymbolRect(grid, 34, 52, 7, 8, "b");
  drawSymbolRect(grid, 22, 59, 10, 3, "d");
  drawSymbolRect(grid, 33, 59, 10, 3, "d");

  return grid;
};

export function PixelPlayerSprite({ size = "medium" }: { size?: "small" | "medium" | "large" }) {
  const grid = drawPlayerPixels();
  const colors: Record<string, string> = {
    ".": "transparent",
    h: "#392a22",
    f: "#f0c28a",
    b: "#2d7c9f",
    g: "#f0c84b",
    y: "#fff2a6",
    r: "#d6533f",
    d: "#20302d",
    s: "rgba(23, 33, 31, 0.32)"
  };

  return (
    <span
      className={`pixel-sprite pixel-player pixel-${size}`}
      aria-hidden="true"
      style={{ "--sprite-columns": SPRITE_SIZE, "--sprite-rows": SPRITE_SIZE } as CSSProperties}
    >
      {grid.flatMap((row, y) =>
        row.map((cell, x) => <span className="pixel" key={`${x}-${y}`} style={{ backgroundColor: colors[cell] }} />)
      )}
    </span>
  );
}
