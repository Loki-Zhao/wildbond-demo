import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("/Users/loki_cho/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const url = process.argv[2] ?? "http://127.0.0.1:5173/";
const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true
});

const artworkSpecies = ["fire-lizard", "coal-pig", "lamp-fox", "red-rooster", "tinder-deer"];
const makePet = (speciesId, index, level = 3) => ({
  uid: `qa-${speciesId}-${index}`,
  speciesId,
  expLevel: level,
  exp: 0,
  currentHp: 999,
  enhanceLevel: 0
});
const save = {
  party: artworkSpecies.slice(0, 3).map((speciesId, index) => makePet(speciesId, index)),
  storage: artworkSpecies.slice(3).map((speciesId, index) => makePet(speciesId, index + 3)),
  activeMapId: "volcano",
  position: { x: 21, y: 15 },
  stepsSinceEncounter: 14,
  unlockedMaps: ["meadow", "volcano"],
  defeatedBosses: [],
  bossChallengeWins: {},
  discoveredSpecies: artworkSpecies,
  ownedSpecies: artworkSpecies,
  inventory: {
    captureStones: 12,
    healingFruits: 6,
    crystals: 0,
    baits: { fire: 1, water: 1, forest: 1, earth: 1, wind: 1 }
  },
  fusionCount: 0,
  firstLv1FusionDone: true,
  firstLv2FusionDone: false,
  log: ["宠物美术运行检查。"]
};

const results = [];
for (const viewport of [
  { name: "desktop", width: 1366, height: 768, isMobile: false },
  { name: "mobile", width: 390, height: 844, isMobile: true }
]) {
  const context = await browser.newContext({
    deviceScaleFactor: viewport.isMobile ? 2 : 1,
    hasTouch: viewport.isMobile,
    isMobile: viewport.isMobile,
    viewport: { width: viewport.width, height: viewport.height }
  });
  await context.addInitScript((state) => {
    window.localStorage.setItem("wildbond-demo-save-v1", JSON.stringify(state));
    window.localStorage.setItem("wildbond-language", "zh");
    Math.random = () => 0.99;
  }, save);
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForSelector(".pet-art-image");

  const party = await page.evaluate(() => ({
    count: document.querySelectorAll(".panel-body .pet-art-image").length,
    images: Array.from(document.querySelectorAll(".panel-body .pet-art-image")).map((image) => {
      const rect = image.getBoundingClientRect();
      const style = getComputedStyle(image);
      return {
        complete: image.complete,
        displayHeight: Math.round(rect.height),
        displayWidth: Math.round(rect.width),
        imageRendering: style.imageRendering,
        naturalHeight: image.naturalHeight,
        naturalWidth: image.naturalWidth,
        objectFit: style.objectFit
      };
    })
  }));

  await page.locator(".panel-tabs button", { hasText: "仓库" }).click();
  await page.waitForTimeout(120);
  const storageCount = await page.locator(".panel-body .pet-art-image").count();

  await page.locator(".panel-tabs button", { hasText: "图鉴" }).click();
  await page.waitForTimeout(120);
  const dexCount = await page.locator(".dex-grid .pet-art-image").count();
  await page.locator(".dex-card", { hasText: "火绒鹿" }).click();
  await page.waitForSelector(".dex-detail-panel .pet-art-image");
  const detail = await page.locator(".dex-detail-panel .pet-art-image").evaluate((image) => {
    const rect = image.getBoundingClientRect();
    return {
      height: Math.round(rect.height),
      naturalHeight: image.naturalHeight,
      naturalWidth: image.naturalWidth,
      width: Math.round(rect.width)
    };
  });
  await page.screenshot({ path: `/tmp/fire-v2-${viewport.name}-dex.png` });
  await page.locator(".modal-close").click();

  let battle;
  if (!viewport.isMobile) {
    await page.evaluate(() => {
      Math.random = () => 0.001;
    });
    await page.keyboard.press("ArrowRight");
    await page.waitForSelector(".battle-panel");
    await page.waitForSelector(".capture-button:not([disabled])", { timeout: 10000 });
    await page.evaluate(() => {
      Math.random = () => 0.99;
    });
    const allyArtworkCount = await page.locator(".ally-side .pet-art-image").count();
    const enemyArtworkCount = await page.locator(".enemy-side .pet-art-image").count();
    const beforeEnemyHp = await page.locator(".enemy-side .combatant-statline").first().textContent();
    const skill = page.locator('.skill-row .skill-button[aria-disabled="false"]').first();
    await skill.click();
    if ((await page.locator(".target-subbutton").count()) > 0) {
      await page.locator(".target-subbutton").first().click();
    }
    await page.waitForTimeout(1200);
    const afterEnemyHp = await page.locator(".enemy-side .combatant-statline").first().textContent().catch(() => "");
    await page.waitForSelector(".capture-button:not([disabled])", { timeout: 10000 });
    const stonesBefore = Number(await page.locator(".resource-panel strong").first().textContent());
    await page.locator(".capture-button:not([disabled])").first().click();
    await page.waitForTimeout(350);
    const stonesAfter = Number(await page.locator(".resource-panel strong").first().textContent());
    battle = {
      allyArtworkCount: allyArtworkCount === 3,
      attackChangedEnemyHp: beforeEnemyHp !== afterEnemyHp,
      captureConsumedStone: stonesAfter === stonesBefore - 1,
      enemyArtworkVisible: enemyArtworkCount > 0,
      battleStillInteractive: (await page.locator(".battle-panel").count()) > 0 || (await page.locator(".map-shell").count()) > 0
    };
    await page.screenshot({ path: "/tmp/fire-v2-desktop-battle.png" });
  }

  results.push({
    ...viewport,
    battle,
    checks: {
      dexHasAllFive: dexCount === 5,
      detailUsesLargeArtwork: detail.width === (viewport.isMobile ? 64 : 128) && detail.height === (viewport.isMobile ? 64 : 128),
      imagesLoadAt512: party.images.every((image) => image.complete && image.naturalWidth === 512 && image.naturalHeight === 512),
      imagesUseContain: party.images.every((image) => image.objectFit === "contain" && image.imageRendering === "auto"),
      partyHasThree: party.count === 3,
      storageHasTwo: storageCount === 2
    },
    detail,
    party
  });
  await context.close();
}

await browser.close();

const failures = results.flatMap((result) => [
  ...Object.entries(result.checks)
    .filter(([, ok]) => !ok)
    .map(([check]) => `${result.name}:${check}`),
  ...Object.entries(result.battle ?? {})
    .filter(([, ok]) => !ok)
    .map(([check]) => `${result.name}:${check}`)
]);

console.log(JSON.stringify({ failed: failures, ok: failures.length === 0, results }, null, 2));
if (failures.length > 0) process.exitCode = 1;
