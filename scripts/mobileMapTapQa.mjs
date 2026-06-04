import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("/Users/loki_cho/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const url = process.argv[2] ?? "http://127.0.0.1:5173/";
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true
});

const context = await browser.newContext({
  deviceScaleFactor: 2,
  hasTouch: true,
  isMobile: true,
  viewport: {
    height: 844,
    width: 390
  }
});

const page = await context.newPage();
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
if (!before) {
  throw new Error("Could not read map coordinate before tap.");
}

const moved = await page.evaluate(async () => {
  const player = document.querySelector(".player-token");
  if (!player) return false;
  const playerRect = player.getBoundingClientRect();
  const tileGrid = document.querySelector(".tile-grid");
  const matrix = tileGrid ? new DOMMatrixReadOnly(getComputedStyle(tileGrid).transform) : null;
  const step = Math.max(12, 66 * Math.abs(matrix?.a || 1));
  const candidates = [
    { x: playerRect.left + playerRect.width / 2 + step, y: playerRect.top + playerRect.height / 2 },
    { x: playerRect.left + playerRect.width / 2, y: playerRect.top + playerRect.height / 2 + step },
    { x: playerRect.left + playerRect.width / 2 - step, y: playerRect.top + playerRect.height / 2 },
    { x: playerRect.left + playerRect.width / 2, y: playerRect.top + playerRect.height / 2 - step }
  ];
  window.__mobileTapCandidates = candidates;
  return true;
});

if (!moved) {
  throw new Error("Could not find player token.");
}

const candidates = await page.evaluate(() => window.__mobileTapCandidates ?? []);
let after = before;
for (const candidate of candidates) {
  await page.touchscreen.tap(candidate.x, candidate.y);
  await page.waitForTimeout(180);
  after = await readCoord();
  if (after && (after.x !== before.x || after.y !== before.y)) break;
}

await browser.close();

const ok = Boolean(after && (after.x !== before.x || after.y !== before.y));
console.log(
  JSON.stringify(
    {
      after,
      before,
      ok
    },
    null,
    2
  )
);

if (!ok) {
  process.exitCode = 1;
}
