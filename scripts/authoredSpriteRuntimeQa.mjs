import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("/Users/loki_cho/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const url = process.argv[2] ?? "http://127.0.0.1:5173/";
const speciesName = process.argv[3] ?? "火花蜥";
const prefix = process.argv[4] ?? "fire";
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const results = [];

for (const viewport of [
  { name: "desktop", width: 1366, height: 768, deviceScaleFactor: 1, isMobile: false },
  { name: "mobile", width: 390, height: 844, deviceScaleFactor: 2, isMobile: true }
]) {
  const context = await browser.newContext({
    deviceScaleFactor: viewport.deviceScaleFactor,
    hasTouch: viewport.isMobile,
    isMobile: viewport.isMobile,
    viewport: { width: viewport.width, height: viewport.height }
  });
  await context.addInitScript(() => {
    window.localStorage.removeItem("wildbond-demo-save-v1");
    window.localStorage.setItem("wildbond-language", "zh");
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForSelector(".starter-panel");
  const card = page.locator(".starter-card", { hasText: speciesName });
  const sprite = card.locator(".pixel-sprite");
  const metrics = await sprite.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const pixelColors = Array.from(element.querySelectorAll(".pixel"), (pixel) => getComputedStyle(pixel).backgroundColor);
    return {
      height: rect.height,
      pixelCells: pixelColors.length,
      uniqueVisibleColors: new Set(pixelColors.filter((value) => value !== "rgba(0, 0, 0, 0)")).size,
      width: rect.width
    };
  });
  const screenshot = `/tmp/${prefix}-starter-${viewport.name}.png`;
  await card.screenshot({ path: screenshot });
  results.push({ ...viewport, ...metrics, screenshot });
  await context.close();
}
await browser.close();

const failures = results.flatMap((result) => {
  const expected = result.isMobile ? 64 : 128;
  return Object.entries({
    displayHeight: result.height === expected,
    displayWidth: result.width === expected,
    nativeCellCount: result.pixelCells === 64 * 64,
    richPalette: result.uniqueVisibleColors >= 16
  }).filter(([, ok]) => !ok).map(([check]) => `${result.name}:${check}`);
});
console.log(JSON.stringify({ failed: failures, ok: failures.length === 0, results }, null, 2));
if (failures.length) process.exitCode = 1;
