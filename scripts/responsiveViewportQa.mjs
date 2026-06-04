import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("/Users/loki_cho/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const url = process.argv[2] ?? "http://127.0.0.1:5173/";
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const viewports = [
  { name: "desktop-1920x1080", width: 1920, height: 1080, isMobile: false },
  { name: "desktop-1366x768", width: 1366, height: 768, isMobile: false },
  { name: "mobile-portrait-390x844", width: 390, height: 844, isMobile: true },
  { name: "mobile-landscape-844x390", width: 844, height: 390, isMobile: true }
];

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true
});

const results = [];

for (const viewport of viewports) {
  const context = await browser.newContext({
    deviceScaleFactor: viewport.isMobile ? 2 : 1,
    hasTouch: viewport.isMobile,
    isMobile: viewport.isMobile,
    viewport: {
      height: viewport.height,
      width: viewport.width
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

  const metrics = await page.evaluate((isMobileViewport) => {
    const getRect = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return {
        bottom: Math.round(rect.bottom * 10) / 10,
        height: Math.round(rect.height * 10) / 10,
        left: Math.round(rect.left * 10) / 10,
        right: Math.round(rect.right * 10) / 10,
        top: Math.round(rect.top * 10) / 10,
        width: Math.round(rect.width * 10) / 10
      };
    };
    const viewportSize = {
      height: window.innerHeight,
      width: window.innerWidth
    };
    const inside = (rect) =>
      Boolean(rect) &&
      rect.left >= -0.5 &&
      rect.top >= -0.5 &&
      rect.right <= viewportSize.width + 0.5 &&
      rect.bottom <= viewportSize.height + 0.5;
    const withinViewportWidth = (rect) =>
      Boolean(rect) &&
      rect.left >= -0.5 &&
      rect.right <= viewportSize.width + 0.5;
    const body = document.body;
    const documentElement = document.documentElement;
    const dpad = document.querySelector(".dpad");
    const dpadVisible = Boolean(dpad && getComputedStyle(dpad).display !== "none");
    const tileGrid = document.querySelector(".tile-grid");
    const tileGridStyle = tileGrid ? getComputedStyle(tileGrid) : null;
    const tileStage = getRect(".tile-stage");
    const tileGridRect = getRect(".tile-grid");
    const hasReadableButtonText = (selector) =>
      Array.from(document.querySelectorAll(selector)).every((element) => {
        const text = element.textContent?.trim() ?? "";
        const fontSize = Number.parseFloat(getComputedStyle(element).fontSize);
        return text.length > 0 && fontSize >= 9;
      });

    return {
      bodyScroll: {
        clientHeight: documentElement.clientHeight,
        clientWidth: documentElement.clientWidth,
        scrollHeight: body.scrollHeight,
        scrollWidth: body.scrollWidth
      },
      checks: {
        appInside: isMobileViewport ? withinViewportWidth(getRect(".app-shell")) : inside(getRect(".app-shell")),
        dashboardInside: isMobileViewport ? withinViewportWidth(getRect(".dashboard")) : inside(getRect(".dashboard")),
        dpadMobileHidden: !isMobileViewport || !dpadVisible,
        dpadInside: !dpadVisible || inside(getRect(".dpad")),
        mapInside: inside(getRect(".map-shell")),
        noBodyOverflowX: body.scrollWidth <= documentElement.clientWidth + 1,
        bodyYFitsDesktopOrScrollsMobile: isMobileViewport
          ? body.scrollHeight > documentElement.clientHeight + 1
          : body.scrollHeight <= documentElement.clientHeight + 1,
        mobileButtonsUseReadableText:
          !isMobileViewport || hasReadableButtonText(".top-actions button, .map-actions button, .panel-tabs button"),
        rightInside: isMobileViewport ? withinViewportWidth(getRect(".right-column")) : inside(getRect(".right-column")),
        starterPanelInside: !document.querySelector(".starter-panel") || inside(getRect(".starter-panel")),
        tileGridInsideStage:
          Boolean(tileStage && tileGridRect) &&
          tileGridRect.left >= tileStage.left - 0.5 &&
          tileGridRect.top >= tileStage.top - 0.5 &&
          tileGridRect.right <= tileStage.right + 0.5 &&
          tileGridRect.bottom <= tileStage.bottom + 0.5,
        tileStageInside: inside(tileStage)
      },
      rects: {
        app: getRect(".app-shell"),
        dashboard: getRect(".dashboard"),
        dpad: getRect(".dpad"),
        logPanel: getRect(".log-panel"),
        mapShell: getRect(".map-shell"),
        rightColumn: getRect(".right-column"),
        starterPanel: getRect(".starter-panel"),
        tileGrid: tileGridRect,
        tileStage,
        topbar: getRect(".topbar")
      },
      tileRendering: tileGridStyle?.imageRendering ?? "",
      tileTransform: tileGridStyle?.transform ?? "",
      viewport: viewportSize
    };
  }, viewport.isMobile);

  results.push({
    ...viewport,
    ...metrics
  });

  await context.close();
}

await browser.close();

const failed = results.flatMap((result) =>
  Object.entries(result.checks)
    .filter(([, ok]) => !ok)
    .map(([check]) => `${result.name}:${check}`)
);

console.log(JSON.stringify({ failed, ok: failed.length === 0, results }, null, 2));

if (failed.length > 0) {
  process.exitCode = 1;
}
