import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const runtimeRequire = createRequire("/Users/loki_cho/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json");
const { chromium } = runtimeRequire("playwright");

const SOURCE_SIZE = 256;
const OUTPUT_SIZE = 64;
const root = fileURLToPath(new URL("..", import.meta.url));

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

const paletteFrom = ({ outline, body, secondary, foliage, accent, eye = "#f7e9ae", dark = "#402d43", catchlight = "#fffbea" }) => {
  const outlineRgb = parseColor(outline);
  const bodyRgb = body.map(parseColor);
  const secondaryRgb = secondary.map(parseColor);
  const foliageRgb = foliage.map(parseColor);
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
    h: [rgbToCss(bodyRgb[3]), "body ramp", "yellow-green highlight"],
    u: [rgbToCss(mix(bodyRgb[1], bodyRgb[2], 0.45)), "body ramp", "soft body transition"],
    b: [rgbToCss(secondaryRgb[0]), "secondary material ramp", "cool shadow"],
    c: [rgbToCss(secondaryRgb[1]), "secondary material ramp", "base"],
    q: [rgbToCss(secondaryRgb[2]), "secondary material ramp", "warm light"],
    t: [rgbToCss(mix(secondaryRgb[0], secondaryRgb[1], 0.55)), "secondary material ramp", "boundary transition"],
    d: [rgbToCss(foliageRgb[0]), "foliage ramp", "cool shadow"],
    a: [rgbToCss(foliageRgb[1]), "foliage ramp", "base"],
    f: [rgbToCss(foliageRgb[2]), "foliage ramp", "warm light"],
    g: [rgbToCss(foliageRgb[3]), "foliage ramp", "yellow-green highlight"],
    r: [rgbToCss(accentRgb[0]), "accent ramp", "shadow"],
    p: [rgbToCss(accentRgb[1]), "accent ramp", "base"],
    k: [rgbToCss(accentRgb[2]), "accent ramp", "highlight"],
    e: [eye, "face detail", "warm eye color"],
    w: [dark, "face detail", "deep pupil and mouth"],
    z: [catchlight, "face detail", "left-top catchlight"]
  };
};

const color = (palette, key) => palette[key][0];
const path = (palette, d, fill, stroke = "o", width = 0.85, extra = "") =>
  `<path d="${d}" fill="${fill === "none" || fill.startsWith("url") ? fill : color(palette, fill)}" stroke="${color(palette, stroke)}" stroke-width="${width}" ${extra}/>`;
const strokePath = (palette, d, stroke, width, extra = "") =>
  `<path d="${d}" fill="none" stroke="${color(palette, stroke)}" stroke-width="${width}" ${extra}/>`;
const ellipse = (palette, cx, cy, rx, ry, fill, stroke = "o", width = 0.75, extra = "") =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill.startsWith("url") ? fill : color(palette, fill)}" stroke="${color(palette, stroke)}" stroke-width="${width}" ${extra}/>`;
const circle = (palette, cx, cy, radius, fill, stroke = "o", width = 0.65) =>
  `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${color(palette, fill)}" stroke="${color(palette, stroke)}" stroke-width="${width}"/>`;

const gradientDefs = (palette) => `
  <linearGradient id="body" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${color(palette, "h")}"/>
    <stop offset=".28" stop-color="${color(palette, "l")}"/>
    <stop offset=".62" stop-color="${color(palette, "m")}"/>
    <stop offset="1" stop-color="${color(palette, "s")}"/>
  </linearGradient>
  <linearGradient id="secondary" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${color(palette, "q")}"/>
    <stop offset=".5" stop-color="${color(palette, "c")}"/>
    <stop offset="1" stop-color="${color(palette, "b")}"/>
  </linearGradient>
  <linearGradient id="foliage" x1="0" y1="0" x2="1" y2="1">
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
const set = (grid, x, y, key) => {
  if (x >= 0 && y >= 0 && x < OUTPUT_SIZE && y < OUTPUT_SIZE) grid[y][x] = key;
};
const eye = (grid, x, y, facing = 1) => {
  set(grid, x, y, "z");
  set(grid, x + facing, y, "e");
  set(grid, x, y + 1, "w");
  set(grid, x + facing, y + 1, "w");
};
const mouth = (grid, x, y, length = 2, facing = 1) => {
  for (let step = 0; step < length; step += 1) set(grid, x + facing * step, y, "w");
};

const paletteDistance = (rgba, target) => {
  const alphaWeight = 1.2;
  const alpha = rgba[3] / 255;
  const targetAlpha = target[3] / 255;
  const dr = rgba[0] * alpha - target[0] * targetAlpha;
  const dg = rgba[1] * alpha - target[1] * targetAlpha;
  const db = rgba[2] * alpha - target[2] * targetAlpha;
  const da = rgba[3] - target[3];
  return dr * dr * 0.85 + dg * dg * 1.1 + db * db * 0.72 + da * da * alphaWeight;
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
        continue;
      }
      if (current === "." && opaque.length >= 7) {
        const counts = new Map();
        opaque.forEach((key) => counts.set(key, (counts.get(key) ?? 0) + 1));
        result[y][x] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
        continue;
      }
      if (current !== "." && !around.includes(current)) {
        const counts = new Map();
        opaque.forEach((key) => counts.set(key, (counts.get(key) ?? 0) + 1));
        const majority = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
        if (majority?.[1] >= 5) result[y][x] = majority[0];
      }
    }
  }
  return result;
};

const definitions = {
  "grass-mouse": {
    name: "草团鼠",
    form: "低伏圆润的叶耳林鼠，身体呈柔软水滴形，卷藤尾末端分出三片叶。",
    color: "清亮苔绿毛发搭配暖麦腹部，嫩叶绿耳片和尾叶用偏黄高光提亮。",
    difference: "本批体型最小、重心最低，卷藤尾与巨大叶耳形成独有剪影。",
    palette: paletteFrom({
      outline: "#23372f",
      body: ["#355246", "#56815a", "#83ac68", "#bdd887"],
      secondary: ["#73563c", "#ad8250", "#dfb96e"],
      foliage: ["#28613f", "#43a052", "#7dcc62", "#b8e47a"],
      accent: ["#8a5c48", "#d08b63", "#f2c686"],
      eye: "#f2dfa0",
      dark: "#4c3045"
    }),
    draw(p) {
      return [
        strokePath(p, "M20 45 C12 48 7 46 6 40 C5 35 9 31 14 33 C18 35 18 40 14 42", "v", 2),
        strokePath(p, "M20 44 C13 47 8 45 8 40 C8 36 11 34 15 35 C18 36 18 39 15 41", "a", 1.05),
        path(p, "M17 31 C20 25 28 22 37 24 C46 25 52 31 52 39 C52 47 45 52 34 52 C23 52 15 47 14 39 C13 36 14 33 17 31 Z", "url(#body)", "o", 0.9),
        path(p, "M22 39 C27 36 35 37 41 42 C39 49 31 51 24 48 C21 46 20 42 22 39 Z", "url(#secondary)", "t", 0.55),
        path(p, "M18 31 C22 27 28 25 34 25", "none", "h", 0.55),
        strokePath(p, "M31 51 C39 52 47 48 50 43", "v", 1.35),
        path(p, "M38 27 C42 21 50 20 56 24 C60 28 59 35 55 39 C50 43 43 40 40 36 C38 33 37 30 38 27 Z", "url(#body)", "o", 0.85),
        path(p, "M41 28 C44 24 49 23 53 25", "none", "h", 0.5),
        strokePath(p, "M50 40 C55 39 58 36 59 32", "v", 1.2),
        path(p, "M40 26 C35 22 34 14 38 8 C44 12 47 19 44 26 Z", "url(#foliage)", "o", 0.75),
        path(p, "M49 24 C49 17 53 11 58 9 C60 16 59 23 55 27 Z", "url(#foliage)", "o", 0.75),
        strokePath(p, "M39 24 C39 18 39 14 38 10", "g", 0.45),
        strokePath(p, "M53 24 C55 19 57 14 58 11", "g", 0.45),
        path(p, "M8 31 C4 28 2 24 4 20 C8 21 11 24 11 28 C10 30 9 31 8 31 Z", "url(#foliage)", "o", 0.65),
        path(p, "M10 30 C9 25 12 21 16 20 C18 24 16 28 13 31 Z", "url(#foliage)", "o", 0.65),
        path(p, "M7 29 C4 26 4 23 5 22", "none", "g", 0.4),
        path(p, "M10 47 C16 49 20 49 24 48", "none", "u", 0.55),
        path(p, "M46 35 C49 33 52 34 54 36", "none", "u", 0.45),
        ellipse(p, 49, 33, 1.35, 1.05, "e", "w", 0.35),
        path(p, "M56 37 C58 37 59 38 59 39 C58 40 56 40 55 39 Z", "w", "w", 0.3)
      ].join("");
    },
    details(grid) {
      eye(grid, 49, 33);
      set(grid, 57, 38, "w");
      set(grid, 58, 38, "w");
      mouth(grid, 55, 40, 2, 1);
    }
  },
  "moss-turtle": {
    name: "苔背龟",
    form: "圆拱龟壳如覆苔小丘，头部微微前探，壳顶长有蕨叶和两簇菌菇。",
    color: "橄榄绿皮肤、老木褐龟壳与鲜苔绿形成三材质层次，菌菇以珊瑚橙点色。",
    difference: "本批最宽扁，整片苔丘背壳与菌菇顶部轮廓独一无二。",
    palette: paletteFrom({
      outline: "#29392f",
      body: ["#425847", "#687b53", "#9baa69", "#d0d98a"],
      secondary: ["#4b4135", "#75603f", "#ad8b50"],
      foliage: ["#27523b", "#3f8448", "#72b859", "#a9dc72"],
      accent: ["#9b554d", "#d77d60", "#f0b67e"],
      eye: "#f0dfa7",
      dark: "#483044"
    }),
    draw(p) {
      return [
        path(p, "M8 43 C8 29 18 19 33 19 C47 19 55 28 56 41 C54 48 45 52 32 52 C19 52 10 49 8 43 Z", "url(#secondary)", "o", 1),
        strokePath(p, "M14 46 C24 52 43 53 54 45", "v", 1.5),
        path(p, "M12 35 C17 25 26 21 36 22 C45 23 51 29 53 38 C42 34 26 33 12 35 Z", "url(#foliage)", "d", 0.65),
        path(p, "M14 34 C22 28 31 26 39 27 C44 28 48 30 51 34", "none", "g", 0.6),
        path(p, "M16 39 C20 34 27 32 33 34 C37 37 36 44 32 48 C24 48 18 45 16 39 Z", "url(#secondary)", "t", 0.55),
        path(p, "M34 34 C41 31 49 34 53 40 C50 46 44 49 36 48 C39 43 39 38 34 34 Z", "url(#secondary)", "t", 0.55),
        strokePath(p, "M33 23 C32 31 32 39 32 48", "b", 0.75),
        strokePath(p, "M14 36 C24 37 42 37 52 39", "q", 0.5),
        path(p, "M51 36 C55 31 61 32 63 37 C65 42 61 47 56 47 C52 47 49 44 49 41 C49 39 50 37 51 36 Z", "url(#body)", "o", 0.85),
        path(p, "M52 37 C54 34 57 34 59 35 C57 37 55 38 52 39 Z", "h", "h", 0),
        path(p, "M57 43 C60 43 62 41 63 39 C64 42 62 45 59 46 Z", "s", "s", 0),
        path(p, "M52 36 C55 34 58 34 60 36", "none", "h", 0.5),
        strokePath(p, "M57 47 C61 46 63 43 63 40", "v", 1.2),
        path(p, "M11 47 C7 47 4 50 5 54 C8 56 13 55 16 52 C15 49 13 48 11 47 Z", "url(#body)", "o", 0.75),
        path(p, "M36 49 C40 47 46 49 48 53 C45 56 39 57 34 54 C34 52 35 50 36 49 Z", "url(#body)", "o", 0.75),
        path(p, "M20 22 C17 17 18 11 23 9 C27 13 26 18 24 22 Z", "url(#accent)", "o", 0.6),
        path(p, "M16 10 C19 7 25 7 28 10 C27 13 18 13 16 10 Z", "url(#accent)", "r", 0.55),
        ellipse(p, 22, 9, 2.1, 0.9, "k", "p", 0.25),
        path(p, "M39 23 C37 18 38 13 42 11 C46 14 46 19 44 23 Z", "url(#accent)", "o", 0.6),
        path(p, "M36 12 C39 9 45 9 48 12 C47 15 38 15 36 12 Z", "url(#accent)", "r", 0.55),
        strokePath(p, "M28 26 C27 22 29 18 33 16", "a", 0.7),
        strokePath(p, "M31 27 C34 23 37 21 40 20", "f", 0.65),
        path(p, "M29 20 C25 20 23 17 24 14 C28 14 31 16 31 19 Z", "url(#foliage)", "d", 0.45),
        path(p, "M34 19 C36 15 40 14 43 16 C41 20 38 21 34 19 Z", "url(#foliage)", "d", 0.45),
        ellipse(p, 58, 39, 1.2, 1, "e", "w", 0.3)
      ].join("");
    },
    details(grid) {
      eye(grid, 58, 39);
      mouth(grid, 60, 43, 2, 1);
    }
  },
  "flower-deer": {
    name: "花耳鹿",
    form: "轻盈幼鹿以细长四肢支撑柔和弧形躯干，耳朵和幼枝角开出花朵。",
    color: "柔和鼠尾草绿皮毛搭配暖木色腿部，花朵使用莓粉、蜜桃和奶油黄。",
    difference: "本批最纤细，长腿、斜颈和花枝耳形成清楚的高挑剪影。",
    palette: paletteFrom({
      outline: "#26382f",
      body: ["#3b5947", "#608159", "#8cac6c", "#c6d98a"],
      secondary: ["#71503c", "#a3754b", "#d5a65e"],
      foliage: ["#2c6641", "#4ba354", "#83cd68", "#bce785"],
      accent: ["#a95772", "#df8294", "#f3b6b0"],
      eye: "#f7dda4",
      dark: "#513147"
    }),
    draw(p) {
      return [
        path(p, "M16 38 C19 31 28 28 38 29 C46 29 51 33 52 39 C49 44 41 47 31 47 C22 47 16 44 16 38 Z", "url(#body)", "o", 0.85),
        path(p, "M20 35 C26 31 35 31 41 32", "none", "h", 0.55),
        strokePath(p, "M31 47 C40 48 48 44 51 39", "v", 1.25),
        `<g transform="translate(-1 3)">`,
        path(p, "M44 34 C45 26 47 20 51 16 C54 16 56 18 57 21 C54 27 52 32 52 38 Z", "url(#body)", "o", 0.75),
        path(p, "M51 16 C52 11 57 8 61 10 C64 13 63 18 60 21 C57 24 52 23 50 20 C49 18 50 17 51 16 Z", "url(#body)", "o", 0.75),
        path(p, "M51 16 C54 12 57 11 60 12", "none", "h", 0.45),
        path(p, "M52 13 C48 10 47 6 49 3 C53 4 56 8 55 12 Z", "url(#foliage)", "o", 0.55),
        path(p, "M59 12 C60 7 63 5 66 5 C67 9 64 13 61 15 Z", "url(#foliage)", "o", 0.55),
        strokePath(p, "M52 10 C49 6 46 4 43 3", "c", 0.75),
        strokePath(p, "M58 10 C60 5 63 2 66 1", "c", 0.75),
        strokePath(p, "M50 8 C52 4 53 1 52 -1", "q", 0.55),
        circle(p, 43, 3, 2.4, "p", "r", 0.4),
        circle(p, 41.5, 2, 1.4, "k", "p", 0.25),
        circle(p, 65, 2, 2.3, "p", "r", 0.4),
        circle(p, 63.5, 1, 1.3, "k", "p", 0.25),
        `</g>`,
        path(p, "M21 44 C22 49 21 55 20 61", "none", "o", 3.2),
        path(p, "M31 45 C31 51 32 56 31 62", "none", "o", 3.2),
        path(p, "M43 44 C45 49 47 55 48 61", "none", "o", 3.2),
        strokePath(p, "M20 45 C21 50 20 56 20 60", "l", 1.55),
        strokePath(p, "M31 46 C31 51 32 56 31 61", "m", 1.55),
        strokePath(p, "M43 44 C45 50 47 55 48 60", "s", 1.55),
        strokePath(p, "M18 61 L23 61", "w", 1.6),
        strokePath(p, "M29 62 L34 62", "w", 1.6),
        strokePath(p, "M46 61 L51 61", "w", 1.6),
        path(p, "M14 37 C10 35 8 33 7 30", "none", "o", 1.2),
        path(p, "M14 37 C11 35 9 33 8 31", "none", "f", 0.5),
        circle(p, 56.5, 19.5, 1.05, "e", "w", 0.3),
        path(p, "M60 23 C62 23 63 24 63 25", "none", "w", 0.65)
      ].join("");
    },
    details(grid) {
      eye(grid, 57, 20);
      set(grid, 61, 23, "w");
      mouth(grid, 60, 25, 2, 1);
    }
  },
  "leaf-monkey": {
    name: "叶尾猴",
    form: "敏捷林猴侧身蹲跃，长臂和弯腿围住躯干，巨大藤尾在背后绕成开放圆环。",
    color: "森林绿短毛配暖赭面部和掌心，叶冠与藤尾使用更明亮的嫩绿层次。",
    difference: "本批唯一灵长类，开放尾环、长臂与蹲跃姿态构成鲜明轮廓。",
    palette: paletteFrom({
      outline: "#24362f",
      body: ["#385747", "#587d56", "#82a866", "#bad27f"],
      secondary: ["#6e503a", "#a1764a", "#d6aa64"],
      foliage: ["#245f3c", "#3d954a", "#72c75b", "#aae176"],
      accent: ["#76514c", "#b47a67", "#e1ad83"],
      eye: "#f1dfa5",
      dark: "#493046"
    }),
    draw(p) {
      return [
        strokePath(p, "M28 47 C18 52 8 50 6 41 C4 32 9 23 18 21 C25 19 30 24 29 30 C28 35 23 38 18 36", "v", 2),
        strokePath(p, "M28 46 C19 50 10 48 9 41 C7 34 11 26 18 24 C23 22 27 25 26 30 C25 34 21 35 18 34", "a", 1.05),
        path(p, "M26 30 C31 25 39 26 44 31 C48 36 47 45 42 50 C37 55 28 54 24 48 C20 42 21 35 26 30 Z", "url(#body)", "o", 0.9),
        path(p, "M27 31 C31 28 36 28 40 30", "none", "h", 0.55),
        strokePath(p, "M31 53 C37 55 44 51 46 45", "v", 1.3),
        path(p, "M28 31 C23 29 18 31 15 36 C12 40 9 43 5 44", "none", "o", 4.1),
        strokePath(p, "M27 31 C22 30 19 32 16 36 C13 40 10 43 6 44", "l", 2),
        path(p, "M41 31 C46 28 52 29 56 33 C59 36 61 38 64 39", "none", "o", 4.1),
        strokePath(p, "M42 31 C47 29 51 30 55 33 C58 36 60 38 63 39", "m", 2),
        ellipse(p, 5, 44, 3.3, 2.6, "url(#secondary)", "o", 0.7),
        ellipse(p, 63, 39, 3.3, 2.6, "url(#secondary)", "o", 0.7),
        path(p, "M28 49 C24 53 22 58 20 62", "none", "o", 4.2),
        strokePath(p, "M28 49 C25 53 23 58 21 61", "m", 2),
        path(p, "M40 49 C44 53 48 57 51 61", "none", "o", 4.2),
        strokePath(p, "M40 49 C44 53 47 57 50 60", "s", 2),
        strokePath(p, "M18 62 L24 62", "w", 1.5),
        strokePath(p, "M48 61 L54 61", "w", 1.5),
        path(p, "M26 25 C25 18 29 12 36 12 C43 12 48 17 47 24 C46 30 41 34 35 33 C29 33 26 30 26 25 Z", "url(#body)", "o", 0.8),
        ellipse(p, 35.5, 24, 7.2, 5.7, "url(#secondary)", "t", 0.45),
        path(p, "M29 16 C25 16 22 19 23 23 C25 26 28 26 30 24", "url(#secondary)", "o", 0.6),
        path(p, "M44 17 C48 17 50 20 49 23 C47 26 44 26 42 24", "url(#secondary)", "o", 0.6),
        path(p, "M35 13 C31 10 31 6 34 2 C37 5 39 9 37 13 Z", "url(#foliage)", "o", 0.55),
        path(p, "M31 14 C27 12 25 9 26 6 C30 6 33 9 34 12 Z", "url(#foliage)", "o", 0.55),
        path(p, "M39 14 C42 10 45 9 48 11 C46 15 43 16 39 16 Z", "url(#foliage)", "o", 0.55),
        circle(p, 32, 23, 1.05, "e", "w", 0.3),
        circle(p, 39, 23, 1.05, "e", "w", 0.3),
        strokePath(p, "M33 29 C35 30 38 30 40 28", "w", 0.55)
      ].join("");
    },
    details(grid) {
      eye(grid, 32, 23);
      eye(grid, 39, 23, -1);
      mouth(grid, 34, 29, 4, 1);
    }
  },
  "vine-bear": {
    name: "藤甲熊",
    form: "四足侧身熊型守卫，隆起肩峰覆盖流线藤甲，前掌宽阔如盾。",
    color: "沉稳蕨绿毛发与暖木藤甲交错，藤蔓边缘用嫩绿高光软化材质交界。",
    difference: "本批唯一四足重装轮廓，拱背甲片和盾形前掌强调防御定位。",
    palette: paletteFrom({
      outline: "#27382f",
      body: ["#385346", "#567551", "#7e9a61", "#b3c979"],
      secondary: ["#594638", "#806143", "#b18a51"],
      foliage: ["#205d3a", "#388b44", "#69c153", "#9dde6d"],
      accent: ["#7a5744", "#ad7b55", "#dfaf6b"],
      eye: "#ead79f",
      dark: "#493044"
    }),
    draw(p) {
      return [
        strokePath(p, "M17 42 C12 44 8 42 7 37 C6 33 9 29 14 28", "v", 1.7),
        strokePath(p, "M16 41 C12 42 9 40 9 37 C8 34 10 31 14 30", "a", 0.9),
        path(p, "M14 34 C17 25 27 21 39 23 C49 24 56 31 56 41 C54 49 44 53 31 52 C20 52 12 46 14 34 Z", "url(#body)", "o", 1),
        path(p, "M17 33 C21 27 29 25 37 25", "none", "h", 0.6),
        strokePath(p, "M31 52 C43 54 53 50 56 42", "v", 1.55),
        path(p, "M17 34 C19 25 27 18 37 18 C46 19 52 25 54 33 C45 31 35 33 27 37 C22 38 18 37 17 34 Z", "url(#secondary)", "t", 0.75),
        path(p, "M21 31 C25 23 34 21 42 23 C46 24 49 27 51 30", "none", "q", 0.7),
        strokePath(p, "M24 34 C31 29 41 28 50 31", "b", 0.7),
        path(p, "M22 31 C23 27 26 24 30 22 C31 26 29 30 26 33 Z", "url(#foliage)", "d", 0.45),
        path(p, "M31 27 C34 23 38 22 42 24 C40 29 36 30 31 29 Z", "url(#foliage)", "d", 0.45),
        path(p, "M41 28 C45 25 49 26 52 29 C49 33 45 34 41 32 Z", "url(#foliage)", "d", 0.45),
        path(p, "M47 30 C52 26 59 28 62 33 C65 39 62 45 57 48 C52 49 47 46 46 42 C45 38 45 34 47 30 Z", "url(#body)", "o", 0.85),
        path(p, "M50 31 C53 29 57 30 59 32", "none", "h", 0.5),
        path(p, "M17 46 C15 50 14 55 14 60", "none", "o", 5.2),
        strokePath(p, "M17 46 C16 50 15 55 15 59", "m", 2.6),
        path(p, "M32 48 C31 53 31 57 31 61", "none", "o", 5.2),
        strokePath(p, "M32 48 C32 53 32 57 32 60", "s", 2.6),
        path(p, "M49 45 C52 49 54 54 55 59 C52 62 47 61 44 58 C45 53 46 48 49 45 Z", "url(#secondary)", "o", 0.9),
        strokePath(p, "M48 48 C49 52 49 56 48 59", "q", 0.65),
        strokePath(p, "M11 60 L20 60", "w", 2),
        strokePath(p, "M28 61 L36 61", "w", 2),
        strokePath(p, "M46 60 L58 60", "e", 1.25),
        circle(p, 57, 36, 1.05, "e", "w", 0.3),
        path(p, "M61 41 C63 41 64 42 64 43", "none", "w", 0.65)
      ].join("");
    },
    details(grid) {
      eye(grid, 57, 36);
      set(grid, 62, 41, "w");
      mouth(grid, 61, 43, 2, 1);
    }
  },
  "honeybud-fox": {
    name: "蜜芽狐",
    form: "细身林狐沿斜线上跃，耳朵后掠，蓬松尾巴收束为一枚巨型花苞。",
    color: "清亮叶绿毛发、蜂蜜金胸腹和莓粉花苞组成甜暖配色，仍保持森系嫩绿主调。",
    difference: "本批唯一强烈斜向动势，巨型花苞尾占据左下轮廓。",
    palette: paletteFrom({
      outline: "#25372f",
      body: ["#345849", "#4e8155", "#77ad64", "#b6d77c"],
      secondary: ["#895d38", "#c78b44", "#edbd5c"],
      foliage: ["#2c6840", "#50a44c", "#8acf61", "#bde980"],
      accent: ["#a85570", "#dd7e91", "#f3b0a9"],
      eye: "#f8e2a4",
      dark: "#523047"
    }),
    draw(p) {
      return [
        path(p, "M20 45 C25 35 34 28 45 26 C53 27 57 34 54 41 C49 48 38 51 28 51 C23 50 20 48 20 45 Z", "url(#body)", "o", 0.9),
        path(p, "M25 42 C30 34 37 30 45 29", "none", "h", 0.55),
        strokePath(p, "M28 51 C39 53 51 48 54 41", "v", 1.35),
        path(p, "M38 43 C43 39 49 36 54 35 C53 41 49 45 43 48 Z", "url(#secondary)", "t", 0.5),
        path(p, "M44 28 C45 22 50 17 56 17 C62 18 65 23 63 29 C61 34 55 36 50 34 C46 33 44 31 44 28 Z", "url(#body)", "o", 0.8),
        path(p, "M47 26 C50 21 54 19 58 20", "none", "h", 0.5),
        path(p, "M48 21 C44 17 43 11 46 6 C51 9 54 15 53 20 Z", "url(#foliage)", "o", 0.6),
        path(p, "M56 18 C57 12 61 8 65 7 C67 13 65 18 61 22 Z", "url(#foliage)", "o", 0.6),
        path(p, "M25 48 C20 53 17 57 15 62", "none", "o", 3.8),
        strokePath(p, "M25 48 C21 53 18 57 16 61", "l", 1.8),
        path(p, "M45 47 C49 51 53 55 57 58", "none", "o", 3.8),
        strokePath(p, "M45 47 C49 51 53 55 56 57", "s", 1.8),
        strokePath(p, "M13 62 L20 62", "w", 1.6),
        strokePath(p, "M54 58 L61 58", "w", 1.6),
        path(p, "M22 45 C16 49 8 49 3 44 C1 38 4 32 10 29 C17 28 24 33 27 39 Z", "url(#foliage)", "o", 0.9),
        path(p, "M20 43 C15 46 9 45 6 42 C4 38 6 34 10 32 C15 31 21 34 24 39 Z", "url(#accent)", "r", 0.55),
        path(p, "M17 42 C13 43 9 41 8 38 C9 35 12 33 16 34 C19 35 21 37 22 39 Z", "url(#accent)", "p", 0.35),
        path(p, "M12 31 C8 29 6 25 8 21 C12 22 15 25 15 29 Z", "url(#foliage)", "o", 0.55),
        path(p, "M18 30 C18 25 21 22 25 22 C26 26 24 30 21 32 Z", "url(#foliage)", "o", 0.55),
        path(p, "M10 37 C13 35 17 36 19 39", "none", "k", 0.65),
        circle(p, 58, 26, 1.05, "e", "w", 0.3),
        path(p, "M62 31 C64 31 65 32 65 33", "none", "w", 0.65)
      ].join("");
    },
    details(grid) {
      eye(grid, 58, 26);
      set(grid, 63, 31, "w");
      mouth(grid, 61, 33, 2, 1);
    }
  },
  "thorn-panther": {
    name: "荆棘豹",
    form: "长身猎豹贴地潜行，肩背升起不规则木刺，鞭尾末端形成弯钩荆棘。",
    color: "深蕨绿被毛配亮藤纹和干木棕刺，背光侧加入偏蓝冷影强化速度感。",
    difference: "本批最长、最低，连续背刺和钩状长尾使黑色剪影也容易辨认。",
    palette: paletteFrom({
      outline: "#20332c",
      body: ["#294a3d", "#3c704a", "#5f9b58", "#99c86d"],
      secondary: ["#504238", "#755d3e", "#aa854d"],
      foliage: ["#1e603b", "#358c45", "#68c355", "#9ddd70"],
      accent: ["#6d4e45", "#a37458", "#d8a66b"],
      eye: "#eadb83",
      dark: "#542e45"
    }),
    draw(p) {
      return [
        strokePath(p, "M18 44 C10 45 4 41 4 35 C4 30 8 27 13 28 C17 29 18 33 16 36 C14 38 11 37 10 35", "v", 1.8),
        strokePath(p, "M18 43 C11 44 6 40 6 35 C6 31 9 29 13 30 C16 31 16 34 14 35 C13 36 11 35 11 34", "a", 0.85),
        path(p, "M15 37 C20 30 31 27 44 29 C54 30 59 35 58 41 C55 48 45 51 31 50 C21 50 15 46 15 37 Z", "url(#body)", "o", 0.9),
        path(p, "M20 36 C26 31 36 30 44 31", "none", "h", 0.55),
        strokePath(p, "M31 50 C43 52 54 48 58 41", "v", 1.4),
        path(p, "M48 31 C51 25 58 23 63 26 C68 29 69 35 66 40 C63 44 57 45 53 42 C49 40 47 35 48 31 Z", "url(#body)", "o", 0.8),
        path(p, "M52 29 C55 26 59 26 62 27", "none", "h", 0.45),
        path(p, "M52 27 C50 23 51 19 54 17 C57 20 58 24 57 27 Z", "url(#foliage)", "o", 0.55),
        path(p, "M61 26 C62 21 65 19 68 19 C69 23 67 27 64 29 Z", "url(#foliage)", "o", 0.55),
        path(p, "M23 31 C22 25 24 20 28 16 C31 20 30 26 28 31 Z", "url(#secondary)", "o", 0.6),
        path(p, "M32 29 C33 23 37 18 41 15 C43 21 40 27 38 30 Z", "url(#secondary)", "o", 0.6),
        path(p, "M42 30 C45 24 50 21 54 21 C54 27 50 31 46 33 Z", "url(#secondary)", "o", 0.6),
        strokePath(p, "M25 36 C30 39 34 40 39 41", "d", 1.35),
        strokePath(p, "M35 33 C40 36 44 37 49 37", "f", 1.05),
        path(p, "M21 46 C19 50 17 55 16 60", "none", "o", 3.8),
        strokePath(p, "M21 46 C20 50 18 55 17 59", "m", 1.8),
        path(p, "M43 48 C47 52 51 55 55 58", "none", "o", 3.8),
        strokePath(p, "M43 48 C47 52 51 55 54 57", "s", 1.8),
        strokePath(p, "M13 60 L21 60", "w", 1.6),
        strokePath(p, "M52 58 L60 58", "w", 1.6),
        circle(p, 61, 34, 1.05, "e", "w", 0.3),
        path(p, "M65 39 C67 39 68 40 68 41", "none", "w", 0.65)
      ].join("");
    },
    details(grid) {
      eye(grid, 61, 34);
      set(grid, 63, 39, "w");
      mouth(grid, 62, 41, 2, 1);
    }
  },
  "ancient-stag": {
    name: "古木鹿王",
    form: "高耸鹿王以树根长腿支撑厚重躯体，巨型分枝角在顶部铺成古树冠。",
    color: "古苔绿皮毛、老木褐枝角与披背苔层组合，金色符文在胸肩处发光。",
    difference: "本批最高，树冠式巨角和根系长腿在剪影中极为突出。",
    palette: paletteFrom({
      outline: "#25372f",
      body: ["#334f43", "#4d7352", "#72985f", "#aabd78"],
      secondary: ["#4e4035", "#735c3f", "#a2824d"],
      foliage: ["#205c3b", "#388b49", "#67bd55", "#9bdc70"],
      accent: ["#8c6f3c", "#c19d4f", "#e8cc72"],
      eye: "#f0dfa1",
      dark: "#493044"
    }),
    draw(p) {
      return [
        path(p, "M13 38 C17 29 28 25 40 27 C49 28 55 34 54 41 C50 48 40 51 29 50 C20 50 14 46 13 38 Z", "url(#body)", "o", 0.9),
        path(p, "M18 35 C24 29 33 28 41 29", "none", "h", 0.6),
        strokePath(p, "M29 50 C40 52 51 48 54 41", "v", 1.45),
        path(p, "M15 34 C20 27 30 24 40 26 C45 26 49 29 52 33 C43 32 35 34 28 37 C23 38 18 37 15 34 Z", "url(#foliage)", "d", 0.65),
        path(p, "M20 32 C26 28 34 27 41 28", "none", "g", 0.55),
        `<g transform="translate(2 7) scale(.9)">`,
        path(p, "M45 33 C46 25 48 17 52 13 C56 13 59 16 59 20 C55 26 53 33 53 39 Z", "url(#body)", "o", 0.8),
        path(p, "M52 13 C53 8 58 5 63 7 C67 10 67 16 64 19 C61 23 55 22 52 19 C50 17 51 15 52 13 Z", "url(#body)", "o", 0.75),
        path(p, "M54 12 C57 8 60 8 63 9", "none", "h", 0.45),
        path(p, "M53 9 C49 6 48 2 50 -1 C54 0 57 4 56 8 Z", "url(#foliage)", "o", 0.5),
        path(p, "M61 8 C63 3 66 1 69 2 C70 6 67 9 64 11 Z", "url(#foliage)", "o", 0.5),
        strokePath(p, "M52 9 C48 5 44 2 39 2 C35 2 32 0 30 -3", "c", 1.2),
        strokePath(p, "M49 6 C45 7 41 6 38 4", "q", 0.65),
        strokePath(p, "M55 8 C54 3 55 -1 58 -4", "c", 1.2),
        strokePath(p, "M56 4 C60 2 63 -1 64 -4", "q", 0.65),
        strokePath(p, "M59 9 C64 6 68 3 72 3", "c", 1.2),
        `</g>`,
        path(p, "M20 46 C19 51 18 56 17 62", "none", "o", 4.2),
        strokePath(p, "M20 46 C20 51 19 56 18 61", "c", 2),
        path(p, "M33 48 C33 53 34 57 34 63", "none", "o", 4.2),
        strokePath(p, "M33 48 C33 53 34 57 34 62", "m", 2),
        path(p, "M46 46 C49 51 51 56 53 61", "none", "o", 4.2),
        strokePath(p, "M46 46 C49 51 51 56 52 60", "b", 2),
        strokePath(p, "M17 61 L13 64 M18 61 L22 64", "w", 1.55),
        strokePath(p, "M34 62 L30 65 M34 62 L39 65", "w", 1.55),
        strokePath(p, "M52 60 L48 64 M52 60 L57 63", "w", 1.55),
        strokePath(p, "M28 33 C32 36 36 38 40 40", "p", 1.2),
        strokePath(p, "M33 31 C34 35 34 39 34 43", "k", 0.65),
        circle(p, 58, 20, 1.05, "e", "w", 0.3)
      ].join("");
    },
    details(grid) {
      eye(grid, 58, 20);
      set(grid, 61, 23, "w");
      mouth(grid, 60, 25, 2, 1);
    }
  },
  "jade-eagle": {
    name: "翠冠鹰",
    form: "翠鹰正面俯冲展翼，左右飞羽呈不同弧度，侧转头部戴着三片玉叶冠。",
    color: "青翠主羽和偏青次羽形成通透层次，喙爪使用金赭色，冠羽以浅玉色收光。",
    difference: "本批唯一完整展翼飞行剪影，宽度来自流线飞羽而不是身体。",
    palette: paletteFrom({
      outline: "#20362f",
      body: ["#285345", "#397a51", "#58a465", "#95d080"],
      secondary: ["#315d50", "#4d8b68", "#82b97a"],
      foliage: ["#23623e", "#39934a", "#6ac65a", "#a2e077"],
      accent: ["#745f37", "#af8c45", "#e1ba5e"],
      eye: "#f2e5a7",
      dark: "#4b3045"
    }),
    draw(p) {
      return [
        path(p, "M30 31 C24 25 17 19 9 13 C5 11 2 12 1 15 C4 24 10 33 21 41 C25 44 29 43 32 40 Z", "url(#body)", "o", 0.9),
        path(p, "M28 32 C22 27 16 21 9 16 C7 15 5 15 4 16 C8 24 14 32 23 38 Z", "url(#secondary)", "t", 0.45),
        path(p, "M25 30 C19 25 14 20 9 17", "none", "h", 0.55),
        strokePath(p, "M21 42 C14 38 7 31 3 23", "v", 1.35),
        path(p, "M34 31 C40 23 49 16 59 11 C63 10 66 12 66 16 C62 27 54 36 43 42 C39 44 35 42 32 40 Z", "url(#body)", "o", 0.9),
        path(p, "M36 32 C42 25 49 19 58 14 C61 13 63 14 63 16 C59 25 52 33 42 39 Z", "url(#secondary)", "t", 0.45),
        path(p, "M39 30 C45 24 51 19 58 16", "none", "h", 0.55),
        strokePath(p, "M43 42 C52 38 60 30 64 21", "v", 1.35),
        strokePath(p, "M11 22 C8 29 6 35 5 41", "b", 1.6),
        strokePath(p, "M17 29 C14 36 13 42 13 48", "c", 1.6),
        strokePath(p, "M23 35 C21 41 21 47 22 52", "q", 1.6),
        strokePath(p, "M54 21 C58 28 60 34 60 41", "b", 1.6),
        strokePath(p, "M48 29 C52 36 53 42 53 48", "c", 1.6),
        strokePath(p, "M42 35 C45 41 45 47 44 52", "q", 1.6),
        path(p, "M26 28 C28 23 35 20 40 23 C45 27 45 35 41 41 C38 47 29 47 25 41 C22 36 23 31 26 28 Z", "url(#body)", "o", 0.8),
        path(p, "M28 28 C31 24 35 23 39 25", "none", "h", 0.5),
        path(p, "M28 42 C28 48 26 54 23 59 C27 58 31 55 33 51 C34 56 37 59 41 61 C40 54 39 48 38 43 Z", "url(#secondary)", "o", 0.7),
        strokePath(p, "M33 44 C33 50 33 55 33 58", "q", 0.55),
        path(p, "M35 22 C36 17 41 13 46 14 C51 16 53 21 51 26 C48 31 42 32 38 29 C35 27 34 24 35 22 Z", "url(#secondary)", "o", 0.75),
        path(p, "M39 16 C38 11 40 7 44 4 C47 8 47 12 45 16 Z", "url(#foliage)", "o", 0.55),
        path(p, "M44 15 C45 10 49 6 53 6 C54 11 51 15 48 18 Z", "url(#foliage)", "o", 0.55),
        path(p, "M36 17 C33 14 32 10 34 7 C38 9 40 12 40 15 Z", "url(#foliage)", "o", 0.55),
        path(p, "M48 22 C54 22 58 24 60 26 C57 29 52 29 48 27 Z", "url(#accent)", "o", 0.55),
        path(p, "M48 23 C54 23 57 24 59 25 C56 26 53 26 49 25 Z", "k", "p", 0.25),
        strokePath(p, "M40 20 C43 18 47 18 49 20", "v", 0.75),
        path(p, "M28 45 C27 51 25 56 23 61", "none", "o", 2.5),
        path(p, "M35 46 C36 52 38 56 41 60", "none", "o", 2.5),
        strokePath(p, "M23 61 L19 64 M23 61 L25 65", "p", 1.2),
        strokePath(p, "M41 60 L39 64 M41 60 L45 63", "p", 1.2),
        circle(p, 45, 22, 1, "e", "w", 0.3)
      ].join("");
    },
    details(grid) {
      eye(grid, 45, 22);
      set(grid, 53, 25, "w");
    }
  },
  "forest-giant-bear": {
    name: "森灵巨熊",
    form: "树熊融合的正面巨兽，肩部生长不对称树冠，树干巨臂垂落并分化成根系脚掌。",
    color: "古蕨绿毛发、树皮褐巨臂和浓绿树冠构成厚重层次，胸口金色符文提供焦点。",
    difference: "本批体量最大且正面构图，树冠双肩、树干手臂与根足形成压倒性轮廓。",
    palette: paletteFrom({
      outline: "#22352e",
      body: ["#304c41", "#496d4f", "#6c925b", "#a1b970"],
      secondary: ["#4c3e35", "#6d573e", "#9a7848"],
      foliage: ["#1d5838", "#338249", "#60b553", "#94d970"],
      accent: ["#81673a", "#bd9a4d", "#e5c86e"],
      eye: "#ead998",
      dark: "#473044"
    }),
    draw(p) {
      return [
        path(p, "M15 31 C17 20 25 14 34 15 C44 15 51 23 51 34 C51 45 44 53 33 54 C21 54 13 45 15 31 Z", "url(#body)", "o", 1),
        path(p, "M19 28 C22 20 28 17 35 17", "none", "h", 0.6),
        strokePath(p, "M33 54 C43 54 50 47 51 36", "v", 1.55),
        path(p, "M22 17 C22 9 28 4 35 5 C42 5 47 10 47 18 C46 26 40 30 34 29 C26 29 22 24 22 17 Z", "url(#body)", "o", 0.85),
        path(p, "M26 14 C29 9 34 8 39 9", "none", "h", 0.5),
        ellipse(p, 33.5, 21.5, 8.2, 5.8, "url(#secondary)", "t", 0.5),
        path(p, "M8 30 C2 27 0 21 3 16 C7 10 15 9 21 13 C25 17 24 25 20 29 C17 32 12 32 8 30 Z", "url(#foliage)", "o", 0.85),
        path(p, "M6 21 C7 15 13 12 18 14", "none", "g", 0.55),
        path(p, "M48 29 C44 24 45 17 50 13 C56 9 64 11 67 17 C70 23 66 29 61 32 C56 34 51 33 48 29 Z", "url(#foliage)", "o", 0.85),
        path(p, "M51 18 C55 13 61 13 65 17", "none", "g", 0.55),
        path(p, "M15 29 C10 33 8 41 8 51 C8 58 12 62 18 60 C22 54 23 45 22 37 C21 32 18 29 15 29 Z", "url(#secondary)", "o", 1),
        path(p, "M16 32 C13 38 13 47 14 55", "none", "q", 0.75),
        strokePath(p, "M9 51 C9 58 13 62 18 60", "v", 1.4),
        path(p, "M50 29 C55 32 58 40 58 51 C58 58 54 62 48 60 C44 54 43 45 44 37 C45 32 47 29 50 29 Z", "url(#secondary)", "o", 1),
        path(p, "M49 32 C52 38 52 47 51 55", "none", "q", 0.75),
        strokePath(p, "M48 60 C54 62 58 57 58 51", "v", 1.4),
        path(p, "M22 49 C21 54 19 59 16 63", "none", "o", 5.4),
        path(p, "M41 50 C44 55 47 59 51 62", "none", "o", 5.4),
        strokePath(p, "M18 62 L12 65 M18 62 L19 66 M18 62 L24 65", "c", 2),
        strokePath(p, "M49 62 L43 65 M49 62 L50 66 M49 62 L56 64", "b", 2),
        strokePath(p, "M25 31 C30 35 36 39 41 44", "a", 1.3),
        strokePath(p, "M41 31 C36 36 31 41 26 45", "d", 1.3),
        path(p, "M31 31 C30 35 30 40 33 44 C36 41 37 36 35 31 Z", "url(#accent)", "r", 0.45),
        strokePath(p, "M33 33 L33 43 M29 38 L37 38", "k", 0.7),
        circle(p, 29, 19, 1.1, "e", "w", 0.3),
        circle(p, 39, 19, 1.1, "e", "w", 0.3),
        path(p, "M31 24 C33 26 36 26 38 24", "none", "w", 0.7)
      ].join("");
    },
    details(grid) {
      eye(grid, 29, 19);
      eye(grid, 39, 19, -1);
      set(grid, 33, 23, "w");
      set(grid, 34, 23, "w");
      mouth(grid, 32, 26, 4, 1);
    }
  }
};

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true
});
const page = await browser.newPage();

const bakeSprite = async (id, definition) => {
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
  let pixels = snapToPalette(data, definition.palette);
  pixels = cleanup(pixels);
  definition.details(pixels);
  return {
    id,
    name: definition.name,
    form: definition.form,
    color: definition.color,
    difference: definition.difference,
    palette: definition.palette,
    pixels
  };
};

const sprites = [];
for (const [id, definition] of Object.entries(definitions)) sprites.push(await bakeSprite(id, definition));
await browser.close();

const quote = (value) => JSON.stringify(value);
const generated = `// Generated by scripts/authorForestPetSprites.mjs.
// Each sprite is designed with independent smooth vector paths at 256x256, baked once with high-quality smooth downsampling to a static 64x64 indexed sprite, then receives native-pixel face detail cleanup.

export const FOREST_PET_PIXEL_SIZE = 64 as const;
export const FOREST_PET_BAKE_SOURCE_SIZE = 256 as const;

export interface ForestPaletteEntry {
  color: string;
  ramp: string;
  shade: string;
}

export interface ForestPetPixelArt {
  id: string;
  name: string;
  form: string;
  color: string;
  difference: string;
  palette: Readonly<Record<string, ForestPaletteEntry>>;
  pixels: readonly (readonly string[])[];
}

export const FOREST_PET_PIXEL_ART: Readonly<Record<string, ForestPetPixelArt>> = {
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

export const getForestPetPixelArt = (speciesId: string): ForestPetPixelArt | undefined => FOREST_PET_PIXEL_ART[speciesId];
`;

writeFileSync(join(root, "src/data/forestPetPixelArt.ts"), generated);
console.log(
  JSON.stringify(
    {
      output: "src/data/forestPetPixelArt.ts",
      sprites: sprites.length,
      sourceSize: `${SOURCE_SIZE}x${SOURCE_SIZE}`,
      outputSize: `${OUTPUT_SIZE}x${OUTPUT_SIZE}`,
      downsample: "Canvas high-quality smoothing",
      displayPipelineChanged: false
    },
    null,
    2
  )
);
