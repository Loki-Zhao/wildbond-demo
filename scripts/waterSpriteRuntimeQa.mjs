import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("/Users/loki_cho/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const url = process.argv[2] ?? "http://127.0.0.1:5173/";
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({ executablePath: chromePath, headless: true });
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
  const waterCard = page.locator(".starter-card", { hasText: "泡泡豚" });
  const sprite = waterCard.locator(".pixel-sprite");
  const metrics = await sprite.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const pixelColors = Array.from(element.querySelectorAll(".pixel"), (pixel) => getComputedStyle(pixel).backgroundColor);
    const visibleColors = new Set(pixelColors.filter((value) => value !== "rgba(0, 0, 0, 0)"));
    return {
      height: rect.height,
      pixelCells: pixelColors.length,
      uniqueVisibleColors: visibleColors.size,
      width: rect.width
    };
  });
  const screenshot = `/tmp/water-starter-${viewport.name}.png`;
  await waterCard.screenshot({ path: screenshot });
  results.push({ ...viewport, ...metrics, screenshot });
  await context.close();
}

await browser.close();

const failures = results.flatMap((result) => {
  const expectedDisplaySize = result.isMobile ? 64 : 128;
  const checks = {
    displayHeight: result.height === expectedDisplaySize,
    displayWidth: result.width === expectedDisplaySize,
    nativeCellCount: result.pixelCells === 64 * 64,
    richPalette: result.uniqueVisibleColors >= 16
  };
  return Object.entries(checks)
    .filter(([, ok]) => !ok)
    .map(([check]) => `${result.name}:${check}`);
});

console.log(JSON.stringify({ failed: failures, ok: failures.length === 0, results }, null, 2));
if (failures.length) process.exitCode = 1;
