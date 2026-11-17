import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import assert from "node:assert/strict";
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
fs.mkdirSync("artifacts", { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1672, height: 941 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${BASE_URL}/en`);
  await page.waitForTimeout(1500);
  assert.equal(await page.locator("html").getAttribute("data-theme"), null);
  assert(
    await page.locator('.site-header [data-logo-variant="light"]').first().isVisible(),
  );
  const results = [];
  for (const theme of ["light", "dark"]) {
    if (theme === "dark")
      await page.getByRole("button", { name: "Switch to dark theme" }).click();
    await page.waitForTimeout(700);
    for (const width of [320, 375, 430, 768, 1024, 1280, 1440, 1672, 1920]) {
      await page.setViewportSize({ width, height: 941 });
      await page.waitForTimeout(120);
      const geometry = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        cards: document.querySelectorAll("[data-light-card]").length,
        hero: document.querySelector(".reference-hero").getBoundingClientRect().height,
        nav: Array.from(document.querySelectorAll(".site-header > div > nav a")).map(
          (e) => ({
            text: e.textContent,
            x: e.getBoundingClientRect().x,
            right: e.getBoundingClientRect().right,
          }),
        ),
        headlineColor: getComputedStyle(document.querySelector(".reference-copy h1"))
          .color,
        logo: (() => {
          const light = document.querySelector(
            '.site-header [data-logo-variant="light"]',
          );
          const dark = document.querySelector('.site-header [data-logo-variant="dark"]');
          const active = getComputedStyle(light).display !== "none" ? light : dark;
          const rect = active.getBoundingClientRect();
          return {
            variant: active.dataset.logoVariant,
            objectFit: getComputedStyle(active).objectFit,
            width: rect.width,
            height: rect.height,
            naturalWidth: active.naturalWidth,
            naturalHeight: active.naturalHeight,
            treatment: active.parentElement.dataset.darkLogoTreatment,
          };
        })(),
      }));
      assert(!geometry.overflow, `${theme} ${width} overflow`);
      assert.equal(geometry.cards, 5);
      assert.equal(geometry.logo.variant, theme);
      assert.equal(geometry.logo.objectFit, "contain");
      assert.equal(geometry.logo.treatment, "rgba-extraction");
      assert(geometry.logo.width > 0 && geometry.logo.height > 0);
      assert(geometry.logo.naturalWidth > 0 && geometry.logo.naturalHeight > 0);
      assert.equal(
        await page
          .getByRole("button", { name: /Pause slideshow|Play slideshow/ })
          .count(),
        0,
      );
      await page.screenshot({
        path: `artifacts/${theme}-${width}.png`,
        fullPage: width <= 430,
      });
      if (width === 375) {
        await page.screenshot({
          path: `artifacts/${theme}-logo-mobile.png`,
          clip: { x: 0, y: 0, width: 375, height: 64 },
        });
      }
      results.push({ theme, width, ...geometry });
    }
    await page.setViewportSize({ width: 1672, height: 941 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `artifacts/${theme}-desktop.png` });
    await page.screenshot({
      path: `artifacts/${theme}-logo-desktop.png`,
      clip: { x: 0, y: 0, width: 1672, height: 64 },
    });
    const showcaseEnd = await page
      .locator(".reference-services")
      .evaluate((e) => e.getBoundingClientRect().bottom);
    await page.screenshot({
      path: `artifacts/${theme}-showcase.png`,
      clip: { x: 0, y: 0, width: 1672, height: Math.ceil(showcaseEnd) },
    });
    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    fs.writeFileSync(
      `artifacts/axe-${theme}.json`,
      JSON.stringify(axe.violations, null, 2),
    );
    assert.deepEqual(axe.violations, [], `${theme}: accessibility violations`);
    console.log(
      theme,
      "axe violations",
      axe.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    );
  }
  await page.reload();
  await page.waitForTimeout(500);
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  assert(
    await page.locator('.site-header [data-logo-variant="dark"]').first().isVisible(),
  );
  await page.locator(".reference-service-card").nth(1).getByRole("link").click();
  await page.getByRole("dialog").waitFor();
  await page.keyboard.press("Escape");
  await page.goto(`${BASE_URL}/te`);
  await page.waitForTimeout(1000);
  await page.setViewportSize({ width: 375, height: 941 });
  await page.screenshot({ path: "artifacts/telugu-mobile.png", fullPage: true });
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    false,
  );
  fs.writeFileSync(
    "artifacts/browser-results.json",
    JSON.stringify(
      { results, errors, persistence: true, logos: true, modal: true, telugu: true },
      null,
      2,
    ),
  );
  assert.deepEqual(errors, []);
  await browser.close();
})();
