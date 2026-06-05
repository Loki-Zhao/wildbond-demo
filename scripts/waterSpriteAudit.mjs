import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const source = readFileSync(join(root, "src/data/waterPetPixelArt.ts"), "utf8");
const generatorSource = readFileSync(join(root, "scripts/authorWaterPetSprites.mjs"), "utf8");
const spritePattern = /  "([^"]+)": \{([\s\S]*?)\n    pixels: \[\n([\s\S]*?)\n    \]\n  \}/g;
const sprites = [...source.matchAll(spritePattern)].map((match) => {
  const [, id, header, pixelBlock] = match;
  const rows = pixelBlock
    .trim()
    .split("\n")
    .map((line) => [...line.matchAll(/"([.a-z])"/g)].map((rowMatch) => rowMatch[1]).join(""));
  const palette = [...header.matchAll(/"([a-z])": \{ color: "([^"]+)", ramp: "([^"]+)", shade: "([^"]+)" \}/g)].map(
    (entry) => ({ key: entry[1], color: entry[2], ramp: entry[3], shade: entry[4] })
  );
  return { id, palette, rows };
});

const failures = [];
const details = [];
const maskHashes = new Map();

for (const sprite of sprites) {
  const rowLengths = new Set(sprite.rows.map((row) => row.length));
  const usedKeys = new Set(sprite.rows.join(""));
  usedKeys.delete(".");
  const paletteKeys = new Set(sprite.palette.map((entry) => entry.key));
  const missingKeys = [...usedKeys].filter((key) => !paletteKeys.has(key));
  const unusedPaletteKeys = [...paletteKeys].filter((key) => !usedKeys.has(key));
  const mask = sprite.rows.map((row) => [...row].map((key) => (key === "." ? "." : "#")).join("")).join("\n");
  const antiAliasPixels = sprite.rows.join("").split("").filter((key) => key === "x" || key === "y").length;
  const transitionPixels = sprite.rows.join("").split("").filter((key) => key === "t" || key === "u").length;

  if (sprite.rows.length !== 64) failures.push(`${sprite.id}: expected 64 rows, received ${sprite.rows.length}`);
  if (rowLengths.size !== 1 || !rowLengths.has(64)) failures.push(`${sprite.id}: every row must contain exactly 64 native pixels`);
  if (sprite.palette.length < 16 || sprite.palette.length > 24) failures.push(`${sprite.id}: palette must contain 16-24 colors`);
  if (usedKeys.size < 16 || usedKeys.size > 24) failures.push(`${sprite.id}: sprite must visibly use 16-24 colors`);
  if (missingKeys.length) failures.push(`${sprite.id}: missing palette keys ${missingKeys.join(", ")}`);
  if (!usedKeys.has("x") || !usedKeys.has("y")) failures.push(`${sprite.id}: missing baked outer-edge anti-alias colors`);
  if (!usedKeys.has("o") || !usedKeys.has("v")) failures.push(`${sprite.id}: missing variable outline light/backlit roles`);
  if (!usedKeys.has("t") && !usedKeys.has("u")) failures.push(`${sprite.id}: missing material-boundary transition color`);
  if (!usedKeys.has("z")) failures.push(`${sprite.id}: missing native-layer eye catchlight`);
  if (antiAliasPixels < 55) failures.push(`${sprite.id}: insufficient baked anti-alias edge coverage`);
  if (transitionPixels < 20) failures.push(`${sprite.id}: insufficient material-boundary transition coverage`);
  if (maskHashes.has(mask)) failures.push(`${sprite.id}: duplicate opaque fill mask with ${maskHashes.get(mask)}`);
  maskHashes.set(mask, sprite.id);

  details.push({
    id: sprite.id,
    nativeSize: `${sprite.rows[0]?.length ?? 0}x${sprite.rows.length}`,
    paletteColors: sprite.palette.length,
    usedColors: usedKeys.size,
    antiAliasPixels,
    transitionPixels,
    unusedPaletteKeys,
    opaquePixels: mask.replace(/[.\n]/g, "").length
  });
}

const maskSets = sprites.map((sprite) => {
  const points = new Set();
  sprite.rows.forEach((row, y) => [...row].forEach((key, x) => key !== "." && points.add(`${x},${y}`)));
  return { id: sprite.id, points };
});

let highestMaskIou = { pair: [], value: 0 };
for (let first = 0; first < maskSets.length; first += 1) {
  for (let second = first + 1; second < maskSets.length; second += 1) {
    const a = maskSets[first];
    const b = maskSets[second];
    const intersection = [...a.points].filter((point) => b.points.has(point)).length;
    const union = new Set([...a.points, ...b.points]).size;
    const iou = intersection / union;
    if (iou > highestMaskIou.value) highestMaskIou = { pair: [a.id, b.id], value: iou };
  }
}

if (sprites.length !== 10) failures.push(`expected 10 water sprites, received ${sprites.length}`);
if (highestMaskIou.value >= 0.72) failures.push(`highest silhouette IoU is too similar: ${highestMaskIou.pair.join(" / ")}`);
if (!/<linearGradient id="body" x1="0" y1="0" x2="1" y2="1">[\s\S]*"h"[\s\S]*"l"[\s\S]*"m"[\s\S]*"s"/.test(generatorSource)) {
  failures.push("body gradient does not encode the shared left-top to right-bottom light direction");
}

console.log(
  JSON.stringify(
    {
      ok: failures.length === 0,
      sprites: sprites.length,
      highestMaskIou,
      details,
      failures
    },
    null,
    2
  )
);

if (failures.length) process.exitCode = 1;
