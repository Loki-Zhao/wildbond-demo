import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("/Users/loki_cho/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const url = process.argv[2] ?? "http://127.0.0.1:5173/";

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForSelector(".app-shell");

const starterCards = page.locator(".starter-card");
if ((await starterCards.count()) > 0) {
  await starterCards.first().click();
  await page.waitForTimeout(150);
}

const readCoord = async () =>
  page.evaluate(() => {
    const text = document.querySelector(".coord-pill")?.textContent ?? "";
    const match = text.match(/(\d+),(\d+)/);
    return match ? { x: Number(match[1]), y: Number(match[2]) } : null;
  });

const before = await readCoord();
if (!before) throw new Error("Could not read coordinate before click.");

const candidates = await page.evaluate(() => {
  const player = document.querySelector(".player-token");
  const tileGrid = document.querySelector(".tile-grid");
  if (!player || !tileGrid) return [];
  const playerRect = player.getBoundingClientRect();
  const matrix = new DOMMatrixReadOnly(getComputedStyle(tileGrid).transform);
  const step = Math.max(12, 66 * Math.abs(matrix.a || 1));
  return [
    { x: playerRect.left + playerRect.width / 2 + step, y: playerRect.top + playerRect.height / 2 },
    { x: playerRect.left + playerRect.width / 2, y: playerRect.top + playerRect.height / 2 + step },
    { x: playerRect.left + playerRect.width / 2 - step, y: playerRect.top + playerRect.height / 2 },
    { x: playerRect.left + playerRect.width / 2, y: playerRect.top + playerRect.height / 2 - step }
  ];
});

let after = before;
for (const candidate of candidates) {
  await page.mouse.click(candidate.x, candidate.y);
  await page.waitForTimeout(180);
  after = await readCoord();
  if (after && (after.x !== before.x || after.y !== before.y)) break;
}

await browser.close();

const ok = Boolean(after && (after.x !== before.x || after.y !== before.y));
console.log(JSON.stringify({ after, before, ok }, null, 2));
if (!ok) process.exitCode = 1;
