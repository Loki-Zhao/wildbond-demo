import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("/Users/loki_cho/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const url = process.argv[2] ?? "http://127.0.0.1:5173/";

const makePet = (speciesId, index) => ({
  uid: `target-first-${index}`,
  speciesId,
  expLevel: 10,
  exp: 0,
  currentHp: 999,
  rarity: "rare",
  enhanceLevel: 0
});

const save = {
  party: ["wind-chime-sparrow", "wind-chime-sparrow", "wind-chime-sparrow"].map(makePet),
  storage: [],
  activeMapId: "meadow",
  position: { x: 71, y: 52 },
  stepsSinceEncounter: 0,
  unlockedMaps: ["meadow"],
  defeatedBosses: [],
  bossChallengeWins: {},
  discoveredSpecies: ["wind-chime-sparrow"],
  ownedSpecies: ["wind-chime-sparrow"],
  inventory: {
    captureStones: 8,
    healingFruits: 2,
    crystals: 0,
    baits: { fire: 0, water: 0, forest: 0, earth: 0, wind: 0 }
  },
  fusionCount: 0,
  firstLv1FusionDone: true,
  firstLv2FusionDone: true,
  log: ["战斗目标优先 QA。"]
};

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true
});

const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.addInitScript((state) => {
  window.localStorage.setItem("wildbond-demo-save-v1", JSON.stringify(state));
  window.localStorage.setItem("wildbond-demo-language", "zh");
  Math.random = () => 0.99;
}, save);

const page = await context.newPage();
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForSelector(".app-shell");
await page.keyboard.press("ArrowRight");
await page.waitForSelector(".battle-panel", { timeout: 10000 });

for (let i = 0; i < 12; i += 1) {
  const enabledSkillCount = await page.locator('.skill-row .skill-button[aria-disabled="false"]').count();
  if (enabledSkillCount > 0) break;
  await page.waitForTimeout(500);
}

const supportSkill = page.locator(".skill-row .skill-button", { hasText: "云绒护" }).first();
await supportSkill.click();
await page.waitForSelector(".support-target-prompt");
const promptVisible = await page.locator(".support-target-prompt").isVisible();
await page.keyboard.press("Escape");
await page.waitForTimeout(120);
const promptCancelled = (await page.locator(".support-target-prompt").count()) === 0;

const enemySlots = page.locator(".enemy-side .combatant-slot");
const enemyCount = await enemySlots.count();
const targetIndex = enemyCount > 1 ? 1 : 0;
const targetSlot = enemySlots.nth(targetIndex);
await targetSlot.click();
const beforeHp = await targetSlot.locator(".combatant-statline").textContent();
await page.locator(".skill-row .skill-button", { hasText: "微风击" }).first().click();
await page.waitForTimeout(900);
const legacyTargetPanelGone = (await page.locator(".target-subbutton").count()) === 0;
const afterHp = await targetSlot.locator(".combatant-statline").textContent().catch(() => "");
const targetTookDamage = Boolean(afterHp) && beforeHp !== afterHp;

await page.screenshot({ path: "/tmp/battle-target-first-desktop.png" });
await browser.close();

const result = {
  ok: promptVisible && promptCancelled && legacyTargetPanelGone && targetTookDamage,
  checks: {
    legacyTargetPanelGone,
    promptCancelled,
    promptVisible,
    targetTookDamage
  }
};

console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exitCode = 1;
