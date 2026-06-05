import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const element = process.argv[2] ?? "fire";
const output = process.argv[3] ?? `/tmp/${element}-pet-preview.png`;
const root = fileURLToPath(new URL("..", import.meta.url));
const source = readFileSync(join(root, `src/data/${element}PetPixelArt.ts`), "utf8");
const spritePattern = /  "([^"]+)": \{([\s\S]*?)\n    pixels: \[\n([\s\S]*?)\n    \]\n  \}/g;
const sprites = [...source.matchAll(spritePattern)].map((match) => ({
  id: match[1],
  palette: Object.fromEntries([...match[2].matchAll(/"([a-z])": \{ color: "([^"]+)"/g)].map((entry) => [entry[1], entry[2]])),
  rows: match[3].trim().split("\n").map((line) => [...line.matchAll(/"([.a-z])"/g)].map((entry) => entry[1]).join(""))
}));

const backgrounds = {
  fire: ["#f2d8bc", "#b96a54"],
  water: ["#d7edf0", "#79b7c8"],
  forest: ["#dce8c8", "#a9c27d"],
  earth: ["#e8debd", "#b49a68"],
  wind: ["#e6eef0", "#a9c8cc"]
};
const scale = 4;
const columns = 5;
const width = 64 * scale * columns;
const height = 64 * scale * Math.ceil(sprites.length / columns);
const rgba = new Uint8Array(width * height * 4);
const parseCss = (value) => {
  if (value.startsWith("#")) {
    const hex = value.slice(1);
    return [Number.parseInt(hex.slice(0, 2), 16), Number.parseInt(hex.slice(2, 4), 16), Number.parseInt(hex.slice(4, 6), 16), 255];
  }
  const match = value.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  return [Number(match[1]), Number(match[2]), Number(match[3]), Math.round(Number(match[4]) * 255)];
};
const setPixel = (x, y, color, blend = false) => {
  const index = (y * width + x) * 4;
  const alpha = blend ? color[3] / 255 : 1;
  rgba[index] = Math.round(color[0] * alpha + rgba[index] * (1 - alpha));
  rgba[index + 1] = Math.round(color[1] * alpha + rgba[index + 1] * (1 - alpha));
  rgba[index + 2] = Math.round(color[2] * alpha + rgba[index + 2] * (1 - alpha));
  rgba[index + 3] = 255;
};

sprites.forEach((sprite, index) => {
  const cellX = (index % columns) * 64 * scale;
  const cellY = Math.floor(index / columns) * 64 * scale;
  for (let y = 0; y < 64 * scale; y += 1) {
    const background = parseCss((backgrounds[element] ?? backgrounds.fire)[y < 45 * scale ? 0 : 1]);
    for (let x = 0; x < 64 * scale; x += 1) setPixel(cellX + x, cellY + y, background);
  }
  sprite.rows.forEach((row, y) => [...row].forEach((key, x) => {
    if (key === ".") return;
    const color = parseCss(sprite.palette[key]);
    for (let yy = 0; yy < scale; yy += 1) for (let xx = 0; xx < scale; xx += 1) setPixel(cellX + x * scale + xx, cellY + y * scale + yy, color, true);
  }));
});

const crcTable = Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let bit = 0; bit < 8; bit += 1) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  return crc >>> 0;
});
const crc32 = (buffer) => {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, crc]);
};
const raw = Buffer.alloc((width * 4 + 1) * height);
for (let y = 0; y < height; y += 1) {
  const rowOffset = y * (width * 4 + 1);
  raw[rowOffset] = 0;
  Buffer.from(rgba.buffer, y * width * 4, width * 4).copy(raw, rowOffset + 1);
}
const header = Buffer.alloc(13);
header.writeUInt32BE(width, 0);
header.writeUInt32BE(height, 4);
header[8] = 8;
header[9] = 6;
writeFileSync(output, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", header), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]));
console.log(JSON.stringify({ element, output, sprites: sprites.map((sprite) => sprite.id), width, height, scale }, null, 2));
