import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const targetElement = process.argv[2] ?? "earth";
const referenceElements = (process.argv[3] ?? "forest,water,fire").split(",").filter(Boolean);
const threshold = Number(process.argv[4] ?? 0.7);
const root = fileURLToPath(new URL("..", import.meta.url));
const spritePattern = /  "([^"]+)": \{([\s\S]*?)\n    pixels: \[\n([\s\S]*?)\n    \]\n  \}/g;

const readMasks = (element) => {
  const file = join(root, `src/data/${element}PetPixelArt.ts`);
  if (!existsSync(file)) return [];
  const source = readFileSync(file, "utf8");
  return [...source.matchAll(spritePattern)].map((match) => {
    const rows = match[3]
      .trim()
      .split("\n")
      .map((line) => [...line.matchAll(/"([.a-z])"/g)].map((entry) => entry[1]).join(""));
    const points = new Set();
    rows.forEach((row, y) => [...row].forEach((key, x) => key !== "." && points.add(`${x},${y}`)));
    return { element, id: match[1], points };
  });
};

const targets = readMasks(targetElement);
const references = referenceElements.flatMap(readMasks);
const comparisons = [];

for (const target of targets) {
  for (const reference of references) {
    const intersection = [...target.points].filter((point) => reference.points.has(point)).length;
    const union = new Set([...target.points, ...reference.points]).size;
    comparisons.push({
      target: target.id,
      reference: `${reference.element}:${reference.id}`,
      value: intersection / union
    });
  }
}

comparisons.sort((a, b) => b.value - a.value);
const failures = comparisons.filter((entry) => entry.value >= threshold);
console.log(
  JSON.stringify(
    {
      targetElement,
      targetSprites: targets.length,
      referenceElements,
      referenceSprites: references.length,
      threshold,
      ok: failures.length === 0,
      highest: comparisons.slice(0, 12),
      failures
    },
    null,
    2
  )
);
if (failures.length) process.exitCode = 1;
