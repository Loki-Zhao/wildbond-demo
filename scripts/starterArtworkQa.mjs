import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("/Users/loki_cho/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const url = process.argv[2] ?? "http://127.0.0.1:5173/";
const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true
});

const viewports = [
  { name: "desktop", width: 1280, height: 720, isMobile: false },
  { name: "mobile-portrait", width: 390, height: 844, isMobile: true },
  { name: "mobile-landscape", width: 844, height: 390, isMobile: true }
];
const results = [];

for (const viewport of viewports) {
  const context = await browser.newContext({
    deviceScaleFactor: viewport.isMobile ? 2 : 1,
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

  const beforeChoice = await page.evaluate(() => {
    const panel = document.querySelector(".starter-panel");
    const panelRect = panel?.getBoundingClientRect();
    const images = Array.from(document.querySelectorAll(".starter-art"));
    return {
      hasFiveCards: document.querySelectorAll(".starter-card").length === 5,
      hasFiveImages: images.length === 5,
      imagesLoaded: images.every((image) => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0),
      noBodyOverflowX: document.body.scrollWidth <= document.documentElement.clientWidth + 1,
      panelInsideWidth: Boolean(panelRect && panelRect.left >= -0.5 && panelRect.right <= window.innerWidth + 0.5),
      panelScrollableWhenNeeded: Boolean(panel && panel.scrollHeight <= panel.clientHeight + 1) || getComputedStyle(panel).overflowY !== "visible"
    };
  });

  await page.screenshot({ path: `/tmp/wildbond-starter-selection-${viewport.name}.png` });
  await page.locator(".starter-card").first().click();
  await page.waitForTimeout(200);

  const afterChoice = await page.evaluate(() => ({
    originalPetSpriteVisible: document.querySelectorAll(".pixel-pet").length > 0,
    starterArtworkRemoved: document.querySelectorAll(".starter-art").length === 0,
    starterPanelClosed: document.querySelectorAll(".starter-panel").length === 0
  }));

  results.push({ ...viewport, afterChoice, beforeChoice });
  await context.close();
}

await browser.close();

const failed = results.flatMap((result) =>
  [...Object.entries(result.beforeChoice), ...Object.entries(result.afterChoice)]
    .filter(([, value]) => value !== true && typeof value === "boolean")
    .map(([check]) => `${result.name}:${check}`)
);

console.log(JSON.stringify({ failed, ok: failed.length === 0, results }, null, 2));
if (failed.length > 0) process.exitCode = 1;
