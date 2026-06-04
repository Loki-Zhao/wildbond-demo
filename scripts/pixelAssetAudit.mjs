import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");

const files = {
  pixelSprite: read("src/components/PixelSprite.tsx"),
  pixelIcon: read("src/components/PixelIcon.tsx"),
  styles: read("src/styles.css"),
  app: read("src/App.tsx"),
  map: read("src/components/MapView.tsx"),
  battle: read("src/components/BattleView.tsx"),
  guide: read("src/components/GameGuide.tsx")
};

const sourceText = Object.values(files).join("\n");
const stylesWithoutAllowedViewportScale = files.styles.replace(/scale\(var\(--map-scale,\s*1\)\)/g, "");
const checks = [
  ["pet/player sprite raster target is 64", /const SPRITE_SIZE = 64;/.test(files.pixelSprite)],
  ["pet/player sprite no 24px source buffer", !/BASE_SPRITE_SIZE|upscalePetGrid|upscaleSymbolGrid/.test(files.pixelSprite)],
  ["pixel icon canvas source is 64", /const ICON_SIZE = 64;/.test(files.pixelIcon)],
  ["canvas smoothing disabled", /imageSmoothingEnabled = false/.test(files.pixelIcon) && /webkitImageSmoothingEnabled/.test(files.pixelIcon) && /mozImageSmoothingEnabled/.test(files.pixelIcon)],
  ["css canvas nearest-neighbor rendering", /canvas,\n\.pixel-icon[\s\S]*image-rendering: pixelated;[\s\S]*image-rendering: crisp-edges;/.test(files.styles)],
  ["map tiles are fixed 64px", /grid-template-columns: repeat\(15, 64px\);/.test(files.styles) && /grid-auto-rows: 64px;/.test(files.styles) && /width: 64px;/.test(files.styles) && /height: 64px;/.test(files.styles)],
  ["sprite display units are integer only", !/--p:\s*\d+\.\d+px/.test(files.styles)],
  ["only viewport-fit map scale transforms", /--map-scale/.test(files.map) && !/\bscale\((?!X)/.test(stylesWithoutAllowedViewportScale)],
  ["no lucide svg icons remain", !/lucide-react/.test(sourceText)]
];

const failures = checks.filter(([, ok]) => !ok).map(([name]) => name);
console.log(
  JSON.stringify(
    {
      ok: failures.length === 0,
      checked: checks.map(([name]) => name),
      failures
    },
    null,
    2
  )
);

if (failures.length) process.exitCode = 1;
