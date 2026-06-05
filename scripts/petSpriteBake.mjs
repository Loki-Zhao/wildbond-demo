import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const runtimeRequire = createRequire("/Users/loki_cho/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json");
const { chromium } = runtimeRequire("playwright");

export const SOURCE_SIZE = 256;
export const OUTPUT_SIZE = 64;

const parseColor = (value) => {
  if (value.startsWith("#")) {
    const hex = value.slice(1);
    return [
      Number.parseInt(hex.slice(0, 2), 16),
      Number.parseInt(hex.slice(2, 4), 16),
      Number.parseInt(hex.slice(4, 6), 16),
      255
    ];
  }
  const match = value.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  if (!match) throw new Error(`Unsupported color: ${value}`);
  return [Number(match[1]), Number(match[2]), Number(match[3]), Math.round(Number(match[4]) * 255)];
};

const rgbToCss = ([r, g, b]) => `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
const alphaCss = ([r, g, b], alpha) => `rgba(${r}, ${g}, ${b}, ${alpha})`;

export const paletteFrom = ({ outline, body, belly, motif, accent, eye = "#fff0a4", dark = "#3d263c", catchlight = "#fffbea" }) => {
  const outlineRgb = parseColor(outline);
  const bodyRgb = body.map(parseColor);
  const bellyRgb = belly.map(parseColor);
  const motifRgb = motif.map(parseColor);
  const accentRgb = accent.map(parseColor);
  const mix = (first, second, ratio = 0.5) =>
    first.slice(0, 3).map((value, index) => Math.round(value * (1 - ratio) + second[index] * ratio));
  const darken = (color, ratio) => color.slice(0, 3).map((value) => Math.round(value * ratio));

  return {
    x: [alphaCss(outlineRgb, 0.24), "outer edge anti-alias", "faint outline transition"],
    y: [alphaCss(outlineRgb, 0.58), "outer edge anti-alias", "medium outline transition"],
    o: [outline, "variable outline", "cool deep outline"],
    v: [rgbToCss(darken(outlineRgb, 0.72)), "variable outline", "deep backlit outline"],
    s: [rgbToCss(bodyRgb[0]), "body ramp", "cool shadow"],
    m: [rgbToCss(bodyRgb[1]), "body ramp", "base"],
    l: [rgbToCss(bodyRgb[2]), "body ramp", "warm light"],
    h: [rgbToCss(bodyRgb[3]), "body ramp", "warm highlight"],
    u: [rgbToCss(mix(bodyRgb[1], bodyRgb[2], 0.45)), "body ramp", "soft body transition"],
    b: [rgbToCss(bellyRgb[0]), "secondary material ramp", "cool shadow"],
    c: [rgbToCss(bellyRgb[1]), "secondary material ramp", "base"],
    q: [rgbToCss(bellyRgb[2]), "secondary material ramp", "warm light"],
    t: [rgbToCss(mix(bellyRgb[0], bellyRgb[1], 0.55)), "secondary material ramp", "boundary transition"],
    d: [rgbToCss(motifRgb[0]), "motif material ramp", "cool shadow"],
    a: [rgbToCss(motifRgb[1]), "motif material ramp", "base"],
    f: [rgbToCss(motifRgb[2]), "motif material ramp", "warm light"],
    g: [rgbToCss(motifRgb[3]), "motif material ramp", "bright highlight"],
    r: [rgbToCss(accentRgb[0]), "accent ramp", "shadow"],
    p: [rgbToCss(accentRgb[1]), "accent ramp", "base"],
    k: [rgbToCss(accentRgb[2]), "accent ramp", "highlight"],
    e: [eye, "face detail", "warm eye color"],
    w: [dark, "face detail", "deep pupil and mouth"],
    z: [catchlight, "face detail", "left-top catchlight"]
  };
};

export const color = (palette, key) => palette[key][0];
export const path = (palette, d, fill, stroke = "o", width = 0.85, extra = "") =>
  `<path d="${d}" fill="${fill === "none" || fill.startsWith("url") ? fill : color(palette, fill)}" stroke="${color(palette, stroke)}" stroke-width="${width}" ${extra}/>`;
export const strokePath = (palette, d, stroke, width, extra = "") =>
  `<path d="${d}" fill="none" stroke="${color(palette, stroke)}" stroke-width="${width}" ${extra}/>`;
export const ellipse = (palette, cx, cy, rx, ry, fill, stroke = "o", width = 0.75, extra = "") =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill === "none" || fill.startsWith("url") ? fill : color(palette, fill)}" stroke="${color(palette, stroke)}" stroke-width="${width}" ${extra}/>`;
export const circle = (palette, cx, cy, radius, fill, stroke = "o", width = 0.65) =>
  `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${color(palette, fill)}" stroke="${color(palette, stroke)}" stroke-width="${width}"/>`;

const gradientDefs = (palette) => `
  <linearGradient id="body" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${color(palette, "h")}"/>
    <stop offset=".28" stop-color="${color(palette, "l")}"/>
    <stop offset=".62" stop-color="${color(palette, "m")}"/>
    <stop offset="1" stop-color="${color(palette, "s")}"/>
  </linearGradient>
  <linearGradient id="belly" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${color(palette, "q")}"/>
    <stop offset=".5" stop-color="${color(palette, "c")}"/>
    <stop offset="1" stop-color="${color(palette, "b")}"/>
  </linearGradient>
  <linearGradient id="motif" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${color(palette, "g")}"/>
    <stop offset=".32" stop-color="${color(palette, "f")}"/>
    <stop offset=".68" stop-color="${color(palette, "a")}"/>
    <stop offset="1" stop-color="${color(palette, "d")}"/>
  </linearGradient>
  <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${color(palette, "k")}"/>
    <stop offset=".52" stop-color="${color(palette, "p")}"/>
    <stop offset="1" stop-color="${color(palette, "r")}"/>
  </linearGradient>`;

const svgFor = (definition) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${SOURCE_SIZE}" height="${SOURCE_SIZE}" viewBox="0 0 64 64">
  <defs>${gradientDefs(definition.palette)}</defs>
  <g stroke-linecap="round" stroke-linejoin="round" shape-rendering="geometricPrecision">
    ${definition.draw(definition.palette)}
  </g>
</svg>`;

const emptyGrid = () => Array.from({ length: OUTPUT_SIZE }, () => Array.from({ length: OUTPUT_SIZE }, () => "."));
export const set = (grid, x, y, key) => {
  if (x >= 0 && y >= 0 && x < OUTPUT_SIZE && y < OUTPUT_SIZE) grid[y][x] = key;
};
export const eye = (grid, x, y, facing = 1) => {
  set(grid, x, y, "z");
  set(grid, x + facing, y, "e");
  set(grid, x, y + 1, "w");
  set(grid, x + facing, y + 1, "w");
};
export const mouth = (grid, x, y, length = 2, facing = 1) => {
  for (let step = 0; step < length; step += 1) set(grid, x + facing * step, y, "w");
};

const paletteDistance = (rgba, target) => {
  const alpha = rgba[3] / 255;
  const targetAlpha = target[3] / 255;
  const dr = rgba[0] * alpha - target[0] * targetAlpha;
  const dg = rgba[1] * alpha - target[1] * targetAlpha;
  const db = rgba[2] * alpha - target[2] * targetAlpha;
  const da = rgba[3] - target[3];
  return dr * dr * 0.85 + dg * dg * 1.1 + db * db * 0.72 + da * da * 1.2;
};

const snapToPalette = (data, palette) => {
  const entries = Object.entries(palette).map(([key, entry]) => [key, parseColor(entry[0])]);
  const grid = emptyGrid();
  for (let y = 0; y < OUTPUT_SIZE; y += 1) {
    for (let x = 0; x < OUTPUT_SIZE; x += 1) {
      const index = (y * OUTPUT_SIZE + x) * 4;
      const rgba = [data[index], data[index + 1], data[index + 2], data[index + 3]];
      if (rgba[3] < 20) continue;
      const snapped = entries.reduce(
        (best, entry) => {
          const distance = paletteDistance(rgba, entry[1]);
          return distance < best.distance ? { key: entry[0], distance } : best;
        },
        { key: ".", distance: Number.POSITIVE_INFINITY }
      );
      grid[y][x] = snapped.key;
    }
  }
  return grid;
};

const cleanup = (grid) => {
  const result = grid.map((row) => [...row]);
  const neighbors = (x, y) => {
    const values = [];
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (dx || dy) {
          const value = grid[y + dy]?.[x + dx];
          if (value !== undefined) values.push(value);
        }
      }
    }
    return values;
  };
  for (let y = 1; y < OUTPUT_SIZE - 1; y += 1) {
    for (let x = 1; x < OUTPUT_SIZE - 1; x += 1) {
      const current = grid[y][x];
      const around = neighbors(x, y);
      const opaque = around.filter((key) => key !== ".");
      if (current !== "." && opaque.length === 0) {
        result[y][x] = ".";
      } else if (current === "." && opaque.length >= 7) {
        const counts = new Map();
        opaque.forEach((key) => counts.set(key, (counts.get(key) ?? 0) + 1));
        result[y][x] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
      } else if (current !== "." && !around.includes(current)) {
        const counts = new Map();
        opaque.forEach((key) => counts.set(key, (counts.get(key) ?? 0) + 1));
        const majority = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
        if (majority?.[1] >= 5) result[y][x] = majority[0];
      }
    }
  }
  return result;
};

export const bakePetSprites = async ({ definitions, elementUpper, elementTitle, generatorName, outputFile, root }) => {
  const browser = await chromium.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true
  });
  const page = await browser.newPage();
  const sprites = [];

  for (const [id, definition] of Object.entries(definitions)) {
    const data = await page.evaluate(
      async ({ svg, sourceSize, outputSize }) => {
        const image = new Image();
        const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
          image.src = url;
        });
        const source = document.createElement("canvas");
        source.width = sourceSize;
        source.height = sourceSize;
        const sourceContext = source.getContext("2d");
        sourceContext.imageSmoothingEnabled = true;
        sourceContext.imageSmoothingQuality = "high";
        sourceContext.drawImage(image, 0, 0, sourceSize, sourceSize);
        const output = document.createElement("canvas");
        output.width = outputSize;
        output.height = outputSize;
        const outputContext = output.getContext("2d");
        outputContext.imageSmoothingEnabled = true;
        outputContext.imageSmoothingQuality = "high";
        outputContext.drawImage(source, 0, 0, outputSize, outputSize);
        URL.revokeObjectURL(url);
        return [...outputContext.getImageData(0, 0, outputSize, outputSize).data];
      },
      { svg: svgFor(definition), sourceSize: SOURCE_SIZE, outputSize: OUTPUT_SIZE }
    );
    let pixels = cleanup(snapToPalette(data, definition.palette));
    definition.details(pixels);
    sprites.push({ id, name: definition.name, form: definition.form, color: definition.color, difference: definition.difference, palette: definition.palette, pixels });
  }
  await browser.close();

  const quote = (value) => JSON.stringify(value);
  const generated = `// Generated by ${generatorName}.
// Each sprite is designed with independent smooth vector paths at 256x256, baked once with high-quality smooth downsampling to a static 64x64 indexed sprite, then receives native-pixel face detail cleanup.

export const ${elementUpper}_PET_PIXEL_SIZE = 64 as const;
export const ${elementUpper}_PET_BAKE_SOURCE_SIZE = 256 as const;

export interface ${elementTitle}PaletteEntry {
  color: string;
  ramp: string;
  shade: string;
}

export interface ${elementTitle}PetPixelArt {
  id: string;
  name: string;
  form: string;
  color: string;
  difference: string;
  palette: Readonly<Record<string, ${elementTitle}PaletteEntry>>;
  pixels: readonly (readonly string[])[];
}

export const ${elementUpper}_PET_PIXEL_ART: Readonly<Record<string, ${elementTitle}PetPixelArt>> = {
${sprites
  .map(
    (sprite) => `  ${quote(sprite.id)}: {
    id: ${quote(sprite.id)},
    name: ${quote(sprite.name)},
    form: ${quote(sprite.form)},
    color: ${quote(sprite.color)},
    difference: ${quote(sprite.difference)},
    palette: {
${Object.entries(sprite.palette)
  .map(([key, [entryColor, ramp, shade]]) => `      ${quote(key)}: { color: ${quote(entryColor)}, ramp: ${quote(ramp)}, shade: ${quote(shade)} }`)
  .join(",\n")}
    },
    pixels: [
${sprite.pixels.map((row) => `      [${row.map((key) => quote(key)).join(", ")}]`).join(",\n")}
    ]
  }`
  )
  .join(",\n")}
};

export const get${elementTitle}PetPixelArt = (speciesId: string): ${elementTitle}PetPixelArt | undefined => ${elementUpper}_PET_PIXEL_ART[speciesId];
`;

  writeFileSync(join(root, outputFile), generated);
  console.log(JSON.stringify({ output: outputFile, sprites: sprites.length, sourceSize: `${SOURCE_SIZE}x${SOURCE_SIZE}`, outputSize: `${OUTPUT_SIZE}x${OUTPUT_SIZE}`, downsample: "Canvas high-quality smoothing", displayPipelineChanged: false }, null, 2));
};
