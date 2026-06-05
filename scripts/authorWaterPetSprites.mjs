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

const paletteFrom = ({ outline, body, belly, fins, accent, eye = "#f8e7a8", dark = "#342e57", catchlight = "#ffffff" }) => {
  const outlineRgb = parseColor(outline);
  const bodyRgb = body.map(parseColor);
  const bellyRgb = belly.map(parseColor);
  const finsRgb = fins.map(parseColor);
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
    h: [rgbToCss(bodyRgb[3]), "body ramp", "pearl highlight"],
    u: [rgbToCss(mix(bodyRgb[1], bodyRgb[2], 0.45)), "body ramp", "soft body transition"],
    b: [rgbToCss(bellyRgb[0]), "belly ramp", "cool shadow"],
    c: [rgbToCss(bellyRgb[1]), "belly ramp", "base"],
    q: [rgbToCss(bellyRgb[2]), "belly ramp", "warm light"],
    t: [rgbToCss(mix(bellyRgb[0], bellyRgb[1], 0.55)), "belly ramp", "boundary transition"],
    d: [rgbToCss(finsRgb[0]), "fin and water ramp", "cool shadow"],
    a: [rgbToCss(finsRgb[1]), "fin and water ramp", "base"],
    f: [rgbToCss(finsRgb[2]), "fin and water ramp", "warm light"],
    g: [rgbToCss(finsRgb[3]), "fin and water ramp", "foam highlight"],
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
  <linearGradient id="belly" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${color(palette, "q")}"/>
    <stop offset=".5" stop-color="${color(palette, "c")}"/>
    <stop offset="1" stop-color="${color(palette, "b")}"/>
  </linearGradient>
  <linearGradient id="fins" x1="0" y1="0" x2="1" y2="1">
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

const definitions = {
  "bubble-dolphin": {
    name: "泡泡豚",
    form: "幼年海豚沿上扬弧线跃出水面，短吻、圆额和环绕尾鳍的泡泡串构成轻快剪影。",
    color: "明亮天青皮肤配珍珠白腹部，鳍端以浅青泡沫色提亮，泡泡加入淡紫蓝透明层次。",
    difference: "本批唯一纯流线跃动体型，背鳍、短吻和尾部泡泡弧让剪影非常轻巧。",
    palette: paletteFrom({
      outline: "#173d5c",
      body: ["#24577d", "#2f82ad", "#61b8d2", "#a4e4e5"],
      belly: ["#7395aa", "#afcbd3", "#e6f3ed"],
      fins: ["#1d6c96", "#319bc2", "#6ed3dc", "#b9f2ed"],
      accent: ["#685f9b", "#9594c9", "#cfd2ef"],
      eye: "#f4d98d",
      dark: "#282d51"
    }),
    draw(p) {
      return [
        path(p, "M10 42 C16 29 30 20 45 20 C55 21 61 27 60 34 C58 42 48 47 36 48 C24 50 14 47 10 42 Z", "url(#body)", "o", 0.9),
        path(p, "M15 39 C22 28 34 23 45 23", "none", "h", 0.6),
        strokePath(p, "M35 48 C48 49 58 43 60 34", "v", 1.4),
        path(p, "M27 42 C35 39 44 39 51 41 C47 47 38 50 29 48 Z", "url(#belly)", "t", 0.5),
        path(p, "M50 23 C56 20 63 22 67 26 C64 31 59 33 54 32 C51 30 49 27 50 23 Z", "url(#body)", "o", 0.75),
        path(p, "M48 23 C48 17 51 12 56 10 C58 16 57 21 54 25 Z", "url(#fins)", "o", 0.65),
        path(p, "M36 22 C34 16 36 11 40 8 C44 13 43 19 41 22 Z", "url(#fins)", "o", 0.65),
        path(p, "M32 45 C30 51 25 55 20 57 C18 52 21 47 26 44 Z", "url(#fins)", "o", 0.65),
        path(p, "M11 41 C6 38 2 34 1 30 C6 29 11 31 14 35 Z", "url(#fins)", "o", 0.7),
        path(p, "M11 42 C7 45 4 50 4 55 C10 54 14 50 16 45 Z", "url(#fins)", "o", 0.7),
        circle(p, 8, 25, 3.1, "p", "r", 0.45),
        circle(p, 13, 18, 2.2, "k", "r", 0.4),
        circle(p, 19, 13, 1.4, "g", "d", 0.35),
        circle(p, 5, 34, 1.5, "f", "d", 0.35),
        strokePath(p, "M8 25 C10 22 12 20 13 18", "a", 0.6),
        circle(p, 54, 28, 1.1, "e", "w", 0.3),
        path(p, "M59 33 C61 33 63 32 64 31", "none", "w", 0.55)
      ].join("");
    },
    details(grid) {
      eye(grid, 54, 28);
      mouth(grid, 59, 33, 3, 1);
    }
  },
  "tide-crab": {
    name: "潮壳蟹",
    form: "宽扁潮蟹正面横行，一只巨钳高举、一只短钳贴地，六足向两侧错落展开。",
    color: "深海蓝硬壳配青白腹甲，关节和钳尖以冷紫蓝分区，水线高光沿壳顶流动。",
    difference: "本批最宽且最贴地，不对称巨钳与横向多足形成唯一的甲壳类剪影。",
    palette: paletteFrom({
      outline: "#193750",
      body: ["#29465f", "#356e8a", "#5ca1af", "#a3d5d1"],
      belly: ["#557b8b", "#8fb5ba", "#d5e7df"],
      fins: ["#155d85", "#248eb1", "#59c9d5", "#a8ece7"],
      accent: ["#554b83", "#8175b0", "#bcb4dc"],
      eye: "#f0cf78",
      dark: "#2e294d"
    }),
    draw(p) {
      return [
        path(p, "M14 31 C18 23 27 20 38 21 C48 22 55 28 55 37 C53 46 44 50 33 50 C21 50 13 44 14 31 Z", "url(#body)", "o", 1),
        path(p, "M18 29 C25 23 35 23 43 25", "none", "h", 0.65),
        strokePath(p, "M31 50 C43 52 52 47 55 38", "v", 1.5),
        path(p, "M21 37 C28 33 40 33 49 37 C46 45 38 48 29 47 C24 46 21 42 21 37 Z", "url(#belly)", "t", 0.55),
        path(p, "M17 29 C11 21 5 20 2 25 C2 31 7 36 14 36 Z", "url(#body)", "o", 0.85),
        path(p, "M4 24 C1 18 3 12 8 10 C13 11 16 16 14 21 C12 26 7 28 4 24 Z", "url(#accent)", "o", 0.8),
        path(p, "M4 16 C7 12 12 12 14 16 C11 19 7 20 4 19 Z", "k", "p", 0.35),
        path(p, "M52 31 C57 26 63 27 66 32 C65 37 61 40 55 40 Z", "url(#body)", "o", 0.8),
        path(p, "M61 28 C65 25 69 28 69 32 C67 35 63 36 60 34 Z", "url(#accent)", "o", 0.65),
        strokePath(p, "M19 43 C13 46 8 50 5 55", "o", 2.8),
        strokePath(p, "M21 46 C16 51 13 55 12 60", "o", 2.8),
        strokePath(p, "M26 48 C23 53 22 57 22 61", "o", 2.8),
        strokePath(p, "M45 45 C51 48 57 52 61 56", "v", 2.8),
        strokePath(p, "M40 48 C45 53 47 57 48 61", "v", 2.8),
        strokePath(p, "M34 49 C36 54 37 58 37 62", "v", 2.8),
        strokePath(p, "M6 55 L2 59 M12 60 L9 64 M22 61 L20 64", "a", 1.1),
        strokePath(p, "M61 56 L65 60 M48 61 L51 64 M37 62 L39 65", "d", 1.1),
        path(p, "M22 23 C21 17 23 13 26 11", "none", "o", 1.3),
        path(p, "M43 24 C44 18 47 14 50 13", "none", "o", 1.3),
        circle(p, 26, 11, 1.4, "e", "w", 0.3),
        circle(p, 50, 13, 1.4, "e", "w", 0.3)
      ].join("");
    },
    details(grid) {
      eye(grid, 26, 11);
      eye(grid, 50, 13, -1);
      mouth(grid, 31, 34, 6, 1);
    }
  },
  "bluefin-rabbit": {
    name: "蓝鳍兔",
    form: "水兔以后足半立，双耳展开成细长鱼鳍，短圆尾像一枚旋转水涡。",
    color: "湖蓝短毛配珍珠白胸腹，鳍耳与蹼足使用高明度青蓝，耳根加入淡紫过渡。",
    difference: "本批唯一直立小兽，成对长鳍耳、蹼足和涡旋圆尾使轮廓一眼可辨。",
    palette: paletteFrom({
      outline: "#183d61",
      body: ["#285777", "#357fa2", "#62aec0", "#a4d9d6"],
      belly: ["#7896a8", "#b2cbd0", "#e8f1ed"],
      fins: ["#176b96", "#269bc0", "#5cd1db", "#b1f0ed"],
      accent: ["#665b95", "#9285bd", "#c8c1e3"],
      eye: "#f5dc93",
      dark: "#302b55"
    }),
    draw(p) {
      return [
        path(p, "M22 34 C24 25 32 21 41 24 C49 27 53 36 50 45 C47 53 37 56 29 52 C22 48 19 41 22 34 Z", "url(#body)", "o", 0.9),
        path(p, "M26 33 C30 27 36 26 42 27", "none", "h", 0.55),
        strokePath(p, "M29 52 C38 57 48 52 50 44", "v", 1.4),
        ellipse(p, 36, 43, 7, 8, "url(#belly)", "t", 0.5),
        path(p, "M26 26 C21 20 19 11 23 5 C29 10 32 18 30 26 Z", "url(#fins)", "o", 0.7),
        path(p, "M38 24 C37 15 42 7 49 4 C51 12 48 21 43 27 Z", "url(#fins)", "o", 0.7),
        path(p, "M24 23 C23 16 24 11 26 8", "none", "g", 0.45),
        path(p, "M42 22 C44 14 46 10 48 7", "none", "g", 0.45),
        path(p, "M26 49 C22 54 19 58 17 62", "none", "o", 5),
        path(p, "M43 51 C47 55 51 58 55 60", "none", "o", 5),
        path(p, "M16 59 C11 58 7 60 6 63 C10 66 16 66 20 63 Z", "url(#fins)", "o", 0.7),
        path(p, "M52 57 C57 55 62 57 64 61 C61 65 55 65 51 62 Z", "url(#fins)", "o", 0.7),
        path(p, "M22 38 C16 35 10 37 8 42 C8 47 13 51 18 50 C22 48 24 43 22 38 Z", "url(#accent)", "o", 0.75),
        strokePath(p, "M11 42 C13 39 17 39 19 41 C20 44 18 47 15 47 C12 47 11 45 12 43", "k", 0.8),
        circle(p, 43, 32, 1.1, "e", "w", 0.3),
        path(p, "M48 36 C50 36 51 37 51 38", "none", "w", 0.6)
      ].join("");
    },
    details(grid) {
      eye(grid, 43, 32);
      set(grid, 48, 36, "w");
      mouth(grid, 47, 38, 2, 1);
    }
  },
  "mist-frog": {
    name: "雾眼蛙",
    form: "雾蛙正面蹲伏，巨大圆眼突出头顶，宽阔蹼掌托着环绕身体的两道雾带。",
    color: "青蓝湿润皮肤配乳白腹部，雾带使用淡青与淡紫层次，眼周以深蓝强化神情。",
    difference: "本批最圆最正面，凸眼、扁嘴、宽蹼与左右漂浮雾带组成独特剪影。",
    palette: paletteFrom({
      outline: "#173c59",
      body: ["#27546f", "#347c96", "#61a9b0", "#a7d5cc"],
      belly: ["#7896a1", "#b3c9c8", "#e5efea"],
      fins: ["#1f6f94", "#36a1bd", "#75d4d9", "#c5f1ec"],
      accent: ["#655d91", "#9188bc", "#cbc5e4"],
      eye: "#f3d98b",
      dark: "#2d2b50"
    }),
    draw(p) {
      return [
        path(p, "M12 38 C13 28 22 22 33 22 C45 22 53 29 53 39 C52 49 44 55 32 55 C20 55 12 49 12 38 Z", "url(#body)", "o", 1),
        path(p, "M17 35 C21 28 28 26 36 26", "none", "h", 0.6),
        strokePath(p, "M31 55 C43 57 52 50 53 40", "v", 1.5),
        ellipse(p, 32, 44, 9, 8, "url(#belly)", "t", 0.55),
        ellipse(p, 22, 22, 7, 8, "url(#body)", "o", 0.75),
        ellipse(p, 44, 22, 7, 8, "url(#body)", "o", 0.75),
        circle(p, 23, 22, 3, "e", "w", 0.55),
        circle(p, 45, 22, 3, "e", "w", 0.55),
        path(p, "M14 42 C8 41 3 44 1 49 C6 54 13 54 18 50 Z", "url(#fins)", "o", 0.75),
        path(p, "M50 42 C57 40 63 43 66 48 C62 53 55 54 49 50 Z", "url(#fins)", "o", 0.75),
        strokePath(p, "M3 49 L0 53 M7 51 L5 56 M13 51 L12 57", "g", 0.8),
        strokePath(p, "M62 49 L66 53 M58 51 L60 56 M53 51 L54 57", "d", 0.8),
        path(p, "M4 34 C10 28 17 27 24 30 C29 32 34 32 39 29 C46 25 54 27 60 32", "none", "k", 2.1),
        path(p, "M5 37 C12 32 18 32 25 34 C31 36 36 35 42 32 C49 29 56 31 61 35", "none", "p", 1.1),
        path(p, "M20 37 C27 39 39 39 46 36", "none", "w", 0.75)
      ].join("");
    },
    details(grid) {
      eye(grid, 22, 21);
      eye(grid, 45, 21, -1);
      mouth(grid, 27, 38, 12, 1);
    }
  },
  "coral-turtle": {
    name: "珊瑚龟",
    form: "珊瑚海龟侧身前游，圆拱龟壳上长出不对称分枝珊瑚，四片鳍肢像水翼展开。",
    color: "蓝绿皮肤配深青贝壳，珊瑚使用柔和粉紫与珠白尖端，壳纹以青色水线分区。",
    difference: "本批唯一带大型背部建筑感的游龟，拱壳、珊瑚枝和四鳍形成复杂层叠剪影。",
    palette: paletteFrom({
      outline: "#173b55",
      body: ["#28566f", "#347f98", "#60aeb7", "#a4d9d1"],
      belly: ["#37637a", "#568da0", "#8fc5c8"],
      fins: ["#176b91", "#2497b5", "#58cbd3", "#aff0e8"],
      accent: ["#785477", "#b27699", "#e5abc0"],
      eye: "#f2d78e",
      dark: "#322a4f"
    }),
    draw(p) {
      return [
        path(p, "M8 40 C9 25 20 16 35 17 C49 18 57 28 57 41 C54 50 44 54 31 53 C18 53 9 48 8 40 Z", "url(#belly)", "o", 1),
        strokePath(p, "M16 48 C27 55 46 55 55 46", "v", 1.5),
        path(p, "M13 37 C17 23 28 19 40 21 C48 23 53 29 54 38 C43 34 25 33 13 37 Z", "url(#body)", "o", 0.75),
        path(p, "M17 34 C24 26 34 24 43 26", "none", "h", 0.65),
        path(p, "M17 38 C22 33 29 32 35 35 C37 40 34 46 29 49 C22 48 18 44 17 38 Z", "url(#body)", "t", 0.5),
        path(p, "M36 35 C42 32 50 35 54 40 C51 46 44 49 36 48 C39 43 39 39 36 35 Z", "url(#body)", "t", 0.5),
        strokePath(p, "M34 22 C34 30 34 39 34 48", "a", 0.8),
        strokePath(p, "M15 37 C25 38 43 38 54 40", "f", 0.6),
        path(p, "M53 36 C57 31 63 31 66 35 C69 40 66 46 61 48 C56 49 52 45 51 41 C51 39 52 37 53 36 Z", "url(#fins)", "o", 0.8),
        path(p, "M12 45 C6 45 2 48 1 53 C6 57 13 55 17 51 Z", "url(#fins)", "o", 0.75),
        path(p, "M30 50 C34 48 40 50 43 55 C39 59 33 59 28 55 Z", "url(#fins)", "o", 0.75),
        strokePath(p, "M25 22 C22 16 23 11 27 7 M27 13 L21 10 M27 10 L32 6", "p", 2),
        strokePath(p, "M38 22 C37 15 40 9 45 5 M41 13 L35 9 M42 10 L48 8 M44 7 L44 3", "r", 2.2),
        strokePath(p, "M48 27 C49 21 52 17 57 14 M53 18 L58 18 M53 18 L51 13", "k", 1.8),
        circle(p, 61, 39, 1.1, "e", "w", 0.3)
      ].join("");
    },
    details(grid) {
      eye(grid, 61, 39);
      mouth(grid, 63, 43, 2, 1);
    }
  },
  "brook-cat": {
    name: "溪影猫",
    form: "溪猫沿低空疾跃，细长身躯如一道水影，尾巴散开为弯曲溪流丝带。",
    color: "深溪蓝皮毛配银青腹部，水纹丝带使用亮青至珠白色阶，耳内以淡紫冷色收边。",
    difference: "本批最细长且横向速度感最强，尖耳、四足飞跃和多股溪流尾组成独特剪影。",
    palette: paletteFrom({
      outline: "#153852",
      body: ["#244b68", "#2e7392", "#54a2b0", "#93d0cc"],
      belly: ["#657f91", "#9eb5bd", "#dae8e5"],
      fins: ["#11668e", "#1d94b8", "#50c9d3", "#acf0eb"],
      accent: ["#5d5488", "#877bb2", "#bbb5dd"],
      eye: "#f2d184",
      dark: "#292747"
    }),
    draw(p) {
      return [
        path(p, "M14 39 C20 30 31 27 44 29 C53 30 59 35 58 41 C54 48 43 51 29 49 C20 49 15 45 14 39 Z", "url(#body)", "o", 0.9),
        path(p, "M19 37 C26 31 36 30 44 31", "none", "h", 0.55),
        strokePath(p, "M29 49 C42 52 54 48 58 41", "v", 1.4),
        path(p, "M28 44 C35 41 44 42 50 45 C44 49 36 50 29 48 Z", "url(#belly)", "t", 0.45),
        path(p, "M48 31 C51 24 58 21 64 24 C69 27 70 34 66 39 C62 43 56 44 52 41 C48 38 47 34 48 31 Z", "url(#body)", "o", 0.8),
        path(p, "M52 26 C51 20 54 15 58 12 C61 16 61 21 59 25 Z", "url(#accent)", "o", 0.55),
        path(p, "M61 24 C63 18 67 15 70 16 C70 22 67 26 64 28 Z", "url(#accent)", "o", 0.55),
        path(p, "M21 46 C16 50 12 55 10 61", "none", "o", 3.6),
        path(p, "M35 48 C38 53 42 57 47 60", "none", "o", 3.6),
        path(p, "M45 46 C51 49 57 53 62 57", "none", "o", 3.6),
        strokePath(p, "M8 61 L15 61 M44 60 L51 60 M59 57 L66 57", "g", 1.3),
        strokePath(p, "M16 42 C8 44 3 40 4 34 C5 29 11 27 16 30 C20 33 19 38 16 40", "v", 1.8),
        strokePath(p, "M16 41 C10 42 6 39 7 35 C7 32 11 30 14 32 C17 34 17 37 15 39", "a", 0.85),
        strokePath(p, "M15 42 C9 47 5 51 2 56", "f", 1.4),
        strokePath(p, "M16 43 C12 49 10 54 10 59", "g", 1),
        strokePath(p, "M58 34 C62 33 66 33 69 35 M58 36 C62 37 66 38 69 40", "f", 0.65),
        circle(p, 61, 31, 1.05, "e", "w", 0.3)
      ].join("");
    },
    details(grid) {
      eye(grid, 61, 31);
      set(grid, 65, 36, "w");
      mouth(grid, 64, 39, 2, 1);
    }
  },
  "wave-otter": {
    name: "浪牙獭",
    form: "健壮水獭踏浪半立，双臂抱着贝刃，粗长尾巴末端化为上扬浪锋。",
    color: "海军蓝湿毛配浅青胸腹，贝刃使用银白与淡紫，尾部浪锋以高亮泡沫青收光。",
    difference: "本批唯一半直立战士，抱持贝刃、厚躯干和巨大浪刃尾形成强烈战斗剪影。",
    palette: paletteFrom({
      outline: "#17354f",
      body: ["#263f5b", "#315f7b", "#4e8799", "#8fc1bf"],
      belly: ["#688594", "#a0b9be", "#dce9e5"],
      fins: ["#145f89", "#218db2", "#52c5d2", "#a9ece8"],
      accent: ["#554e80", "#8178aa", "#bdb9da"],
      eye: "#f0d184",
      dark: "#282647"
    }),
    draw(p) {
      return [
        path(p, "M21 31 C25 22 35 19 44 24 C53 29 56 41 51 50 C46 58 34 59 26 53 C19 48 17 39 21 31 Z", "url(#body)", "o", 1),
        path(p, "M26 29 C31 23 38 23 44 26", "none", "h", 0.6),
        strokePath(p, "M31 56 C41 60 51 54 53 45", "v", 1.5),
        ellipse(p, 37, 43, 8, 10, "url(#belly)", "t", 0.55),
        path(p, "M26 25 C25 18 30 13 36 13 C43 13 48 18 47 25 C46 31 41 34 35 33 C29 33 26 30 26 25 Z", "url(#body)", "o", 0.8),
        ellipse(p, 36, 26, 7, 5, "url(#belly)", "t", 0.45),
        path(p, "M24 21 C20 20 18 23 19 27 C21 30 25 29 27 27", "url(#body)", "o", 0.55),
        path(p, "M45 21 C49 20 51 23 50 26 C48 29 45 29 43 27", "url(#body)", "o", 0.55),
        path(p, "M24 36 C18 39 15 44 16 49 C20 52 25 50 28 46 Z", "url(#body)", "o", 0.75),
        path(p, "M47 35 C53 37 57 42 57 47 C54 51 49 50 46 46 Z", "url(#body)", "o", 0.75),
        path(p, "M27 39 C32 34 40 33 46 37 C44 43 37 47 31 45 Z", "url(#accent)", "o", 0.65),
        strokePath(p, "M30 41 C35 38 40 37 44 38", "k", 0.7),
        strokePath(p, "M24 53 C20 57 18 61 18 65", "o", 4.2),
        strokePath(p, "M46 54 C50 58 55 60 60 61", "o", 4.2),
        path(p, "M21 51 C15 51 8 47 5 41 C2 35 4 29 9 27 C16 30 20 36 20 43 Z", "url(#fins)", "o", 0.85),
        path(p, "M8 28 C8 35 12 41 19 45", "none", "g", 0.75),
        path(p, "M10 31 C5 28 2 23 3 18 C8 18 12 22 13 27 Z", "url(#fins)", "o", 0.6),
        circle(p, 33, 24, 1.05, "e", "w", 0.3),
        circle(p, 40, 24, 1.05, "e", "w", 0.3),
        path(p, "M33 29 C35 31 38 31 40 29", "none", "w", 0.55)
      ].join("");
    },
    details(grid) {
      eye(grid, 33, 24);
      eye(grid, 40, 24, -1);
      mouth(grid, 34, 29, 5, 1);
    }
  },
  "crystal-whale": {
    name: "海晶鲸",
    form: "巨型晶鲸斜向漂游，宽厚身体托着冰晶背冠，尾鳍下方悬着成串发光气泡。",
    color: "深海蓝鲸皮配冰青腹部，背冠使用银白、青蓝和淡紫晶体，气泡以珠光色点亮。",
    difference: "本批体量最大、身体最厚，巨鲸轮廓、背部晶冠和垂落泡链极具完全体压迫感。",
    palette: paletteFrom({
      outline: "#152f49",
      body: ["#203c59", "#2b5977", "#477f94", "#82b8b8"],
      belly: ["#657c8c", "#9eb2bb", "#dce7e5"],
      fins: ["#155b82", "#2788aa", "#59bfd0", "#abe9e7"],
      accent: ["#514b7b", "#7c76a8", "#bab7d8"],
      eye: "#efd083",
      dark: "#282442"
    }),
    draw(p) {
      return [
        path(p, "M7 40 C10 24 24 15 42 17 C55 19 63 27 62 38 C60 50 47 56 31 55 C17 54 8 49 7 40 Z", "url(#body)", "o", 1.1),
        path(p, "M13 35 C21 23 34 20 45 22", "none", "h", 0.7),
        strokePath(p, "M30 55 C47 58 60 51 62 39", "v", 1.7),
        path(p, "M15 43 C26 38 42 39 54 44 C48 52 36 55 24 52 C19 51 16 48 15 43 Z", "url(#belly)", "t", 0.6),
        path(p, "M9 39 C4 34 0 29 -1 23 C6 22 12 25 16 31 Z", "url(#fins)", "o", 0.85),
        path(p, "M9 41 C4 44 1 50 1 56 C8 56 14 52 17 46 Z", "url(#fins)", "o", 0.85),
        path(p, "M34 51 C32 58 27 62 21 64 C20 58 24 53 29 50 Z", "url(#fins)", "o", 0.7),
        path(p, "M24 20 L29 8 L34 20 Z", "url(#accent)", "o", 0.65),
        path(p, "M32 18 L39 3 L43 20 Z", "url(#accent)", "o", 0.7),
        path(p, "M41 20 L49 9 L52 23 Z", "url(#accent)", "o", 0.65),
        strokePath(p, "M29 17 L32 10 M38 16 L40 7 M47 20 L49 13", "k", 0.65),
        path(p, "M54 22 C54 16 58 12 63 11 C64 17 61 22 57 25 Z", "url(#fins)", "o", 0.65),
        circle(p, 24, 59, 2.5, "p", "r", 0.4),
        circle(p, 17, 61, 1.7, "k", "r", 0.35),
        circle(p, 9, 58, 1.2, "g", "d", 0.3),
        circle(p, 55, 31, 1.2, "e", "w", 0.3),
        path(p, "M60 36 C62 36 64 35 65 34", "none", "w", 0.6)
      ].join("");
    },
    details(grid) {
      eye(grid, 55, 31);
      mouth(grid, 59, 36, 4, 1);
    }
  },
  "deep-tide-jiao": {
    name: "深潮蛟",
    form: "深潮蛟以S形盘旋，长颈抬起、双角后掠，背鳍沿身体连续起伏并围出中空水环。",
    color: "深靛蓝鳞片配青白腹鳞，背鳍以高亮水蓝渐变，角与须加入冷紫晶色。",
    difference: "本批唯一蛇形盘绕体，S形长颈、中空环状躯体和连续背鳍构成最复杂剪影。",
    palette: paletteFrom({
      outline: "#122f4a",
      body: ["#1d3d5f", "#285d80", "#4387a0", "#81bec0"],
      belly: ["#5d7a8c", "#96b1bb", "#d7e7e6"],
      fins: ["#105f8a", "#168fb6", "#4cc7d4", "#a6eeeb"],
      accent: ["#4c4778", "#756da5", "#afa9d4"],
      eye: "#f2ce7d",
      dark: "#26233f"
    }),
    draw(p) {
      return [
        strokePath(p, "M43 19 C30 13 17 19 15 31 C13 42 23 51 35 50 C47 49 54 41 52 32 C50 25 43 22 36 25 C30 28 29 35 33 39 C37 43 43 41 44 37", "o", 8.5),
        `<path d="M42 18 C30 14 19 20 18 31 C17 40 25 47 35 46 C44 45 50 39 48 33 C47 28 42 26 37 28 C33 30 33 35 36 37 C39 39 42 38 43 36" fill="none" stroke="url(#body)" stroke-width="6.2" stroke-linecap="round" stroke-linejoin="round"/>`,
        strokePath(p, "M40 17 C29 15 21 21 20 30", "h", 0.9),
        strokePath(p, "M34 48 C44 47 51 42 52 34", "v", 1.5),
        strokePath(p, "M21 38 C27 44 36 45 43 41", "q", 1.4),
        path(p, "M40 20 C41 12 45 6 52 5 C59 5 64 10 64 17 C62 24 56 28 50 27 C44 27 40 24 40 20 Z", "url(#body)", "o", 0.9),
        path(p, "M44 17 C47 10 53 8 58 10", "none", "h", 0.55),
        path(p, "M45 10 C42 6 43 2 46 -1 C49 2 50 6 49 10 Z", "url(#accent)", "o", 0.55),
        path(p, "M55 8 C56 3 60 0 63 1 C64 5 61 9 58 11 Z", "url(#accent)", "o", 0.55),
        path(p, "M42 23 C36 22 31 18 29 13 C35 12 40 15 44 19 Z", "url(#fins)", "o", 0.65),
        path(p, "M28 19 C22 18 17 14 15 9 C21 8 27 11 30 15 Z", "url(#fins)", "o", 0.65),
        path(p, "M18 28 C12 27 7 23 5 18 C11 17 17 20 20 24 Z", "url(#fins)", "o", 0.65),
        path(p, "M18 43 C12 45 8 49 6 55 C13 56 19 52 22 47 Z", "url(#fins)", "o", 0.65),
        path(p, "M36 50 C33 56 28 60 22 62 C22 56 27 51 32 49 Z", "url(#fins)", "o", 0.65),
        strokePath(p, "M55 20 C61 20 66 22 69 25 M54 22 C60 24 64 27 67 31", "f", 0.7),
        circle(p, 56, 15, 1.1, "e", "w", 0.3)
      ].join("");
    },
    details(grid) {
      eye(grid, 56, 15);
      set(grid, 61, 20, "w");
      mouth(grid, 60, 22, 3, 1);
    }
  },
  "moon-bay-mer": {
    name: "月湾鲛",
    form: "月湾鲛以三分之四侧身悬浮，长发向左舒展，一手托起月珠，下身卷成不对称新月鳍尾。",
    color: "月夜蓝皮肤配银白胸腹，长发与尾鳍使用青蓝珠光色阶，月珠以淡紫和奶白聚焦。",
    difference: "本批唯一人形海灵，侧身托珠动作、披散长发和巨大新月尾鳍形成庄严辅助核心剪影。",
    palette: paletteFrom({
      outline: "#172f4c",
      body: ["#253f60", "#315f80", "#548aa1", "#91c0c1"],
      belly: ["#6c8292", "#a4b8c0", "#dfe9e7"],
      fins: ["#145e88", "#218caf", "#54c2cf", "#aae9e6"],
      accent: ["#51497a", "#7d73a7", "#c1badd"],
      eye: "#efd285",
      dark: "#292440"
    }),
    draw(p) {
      return [
        path(p, "M29 29 C30 19 37 12 45 13 C53 15 57 23 54 32 C52 40 45 44 38 42 C31 40 27 35 29 29 Z", "url(#body)", "o", 0.9),
        path(p, "M33 27 C35 20 40 17 46 17", "none", "h", 0.55),
        strokePath(p, "M38 42 C46 45 53 40 55 32", "v", 1.4),
        path(p, "M34 18 C27 19 21 25 19 34 C18 43 22 49 28 50 C31 43 32 34 36 26 Z", "url(#fins)", "o", 0.85),
        path(p, "M29 20 C22 17 16 18 11 22 C16 26 23 28 30 26 Z", "url(#fins)", "o", 0.75),
        path(p, "M24 29 C17 27 10 29 6 34 C12 38 19 38 26 35 Z", "url(#fins)", "o", 0.75),
        strokePath(p, "M31 20 C25 23 22 31 22 40", "g", 0.65),
        strokePath(p, "M27 23 C21 22 16 23 12 25", "f", 0.55),
        path(p, "M35 39 C29 46 27 54 31 60 C38 64 48 61 52 54 C56 48 52 42 46 39 Z", "url(#belly)", "o", 0.85),
        path(p, "M31 56 C24 54 17 56 12 62 C20 66 30 64 36 60 Z", "url(#fins)", "o", 0.8),
        path(p, "M50 53 C57 50 64 52 69 58 C62 63 53 63 46 59 Z", "url(#fins)", "o", 0.8),
        strokePath(p, "M15 61 C22 58 28 59 34 59", "g", 0.6),
        strokePath(p, "M49 58 C56 58 62 57 67 59", "d", 0.6),
        path(p, "M32 32 C26 33 21 37 18 42 C22 47 28 45 34 40 Z", "url(#body)", "o", 0.7),
        path(p, "M49 34 C55 35 60 39 62 44 C57 47 51 44 46 40 Z", "url(#body)", "o", 0.7),
        circle(p, 17, 42, 5.2, "p", "r", 0.65),
        circle(p, 15.5, 40.5, 2.2, "k", "p", 0.25),
        path(p, "M37 15 C35 10 37 6 41 3 C45 6 46 11 44 15 Z", "url(#accent)", "o", 0.55),
        path(p, "M47 15 C50 10 54 9 58 11 C57 16 53 18 49 18 Z", "url(#accent)", "o", 0.55),
        circle(p, 46, 25, 1.05, "e", "w", 0.3),
        path(p, "M50 31 C52 32 54 32 55 31", "none", "w", 0.55)
      ].join("");
    },
    details(grid) {
      eye(grid, 46, 25);
      set(grid, 51, 30, "w");
      mouth(grid, 50, 32, 3, 1);
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
const generated = `// Generated by scripts/authorWaterPetSprites.mjs.
// Each sprite is designed with independent smooth vector paths at 256x256, baked once with high-quality smooth downsampling to a static 64x64 indexed sprite, then receives native-pixel face detail cleanup.

export const WATER_PET_PIXEL_SIZE = 64 as const;
export const WATER_PET_BAKE_SOURCE_SIZE = 256 as const;

export interface WaterPaletteEntry {
  color: string;
  ramp: string;
  shade: string;
}

export interface WaterPetPixelArt {
  id: string;
  name: string;
  form: string;
  color: string;
  difference: string;
  palette: Readonly<Record<string, WaterPaletteEntry>>;
  pixels: readonly (readonly string[])[];
}

export const WATER_PET_PIXEL_ART: Readonly<Record<string, WaterPetPixelArt>> = {
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

export const getWaterPetPixelArt = (speciesId: string): WaterPetPixelArt | undefined => WATER_PET_PIXEL_ART[speciesId];
`;

writeFileSync(join(root, "src/data/waterPetPixelArt.ts"), generated);
console.log(
  JSON.stringify(
    {
      output: "src/data/waterPetPixelArt.ts",
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
