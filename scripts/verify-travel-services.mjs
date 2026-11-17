import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "playwright";

const base = process.env.BASE_URL || "http://localhost:3016";
const out = "artifacts/travel-services";
const widths = [320, 375, 768, 1024, 1440, 1920];
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const results = [];
const findings = [];
try {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  page.on("pageerror", (error) =>
    findings.push({ type: "pageerror", message: error.message }),
  );
  for (const locale of ["en", "te"]) {
    const geometry = {};
    for (const theme of ["light", "dark"]) {
      await page.goto(`${base}/${locale}/services`);
      await page.evaluate((value) => localStorage.setItem("sridevi:theme", value), theme);
      await page.reload();
      geometry[theme] = {};
      for (const width of widths) {
        await page.setViewportSize({ width, height: 1000 });
        await page.evaluate(async () => {
          await document.fonts.ready;
          await new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          );
        });
        const info = await page.evaluate(() => {
          const section = document.querySelector(".travel-ticket-section");
          const cards = [...document.querySelectorAll("[data-travel-ticket-card]")];
          const rect = (element) => {
            const box = element.getBoundingClientRect();
            return { x: box.x, y: box.y, width: box.width, height: box.height };
          };
          return {
            section: rect(section),
            cards: cards.map(rect),
            columns: new Set(
              cards.map((card) => Math.round(card.getBoundingClientRect().y)),
            ).size,
            overflow: document.documentElement.scrollWidth > innerWidth,
            headings: cards.map((card) => card.querySelector("h3")?.textContent?.trim()),
            hrefs: cards.map((card) => card.querySelector("a")?.getAttribute("href")),
          };
        });
        geometry[theme][width] = info;
        assert.equal(info.cards.length, 4);
        assert.equal(info.overflow, false);
        assert.equal(info.columns, width >= 1024 ? 1 : width >= 640 ? 2 : 4);
        assert.equal(new Set(info.cards.map((card) => Math.round(card.height))).size, 1);
        assert.deepEqual(
          info.hrefs,
          ["flights", "trains", "buses", "darshanam"].map(
            (id) => `/${locale}/contact?service=${id}`,
          ),
        );
        await page.locator(".travel-ticket-section").screenshot({
          path: `${out}/${locale}-${theme}-${width}.png`,
          animations: "disabled",
        });
      }
      await page.setViewportSize({ width: 1440, height: 1000 });
      const axe = await new AxeBuilder({ page })
        .include(".travel-ticket-section")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      findings.push(
        ...axe.violations.map((violation) => ({
          type: "a11y",
          locale,
          theme,
          id: violation.id,
        })),
      );
      const first = page.locator("[data-travel-ticket-card] a").first();
      await first.click();
      assert(await page.locator("dialog.modal[open]").isVisible());
      await page.keyboard.press("Escape");
      assert(await first.evaluate((element) => element === document.activeElement));
      results.push({
        locale,
        theme,
        widths: widths.length,
        accessibilityViolations: axe.violations.length,
      });
    }
    for (const width of widths) {
      assert.deepEqual(
        geometry.light[width].cards,
        geometry.dark[width].cards,
        `Theme geometry differs at ${locale}/${width}`,
      );
      assert.deepEqual(
        geometry.light[width].section,
        geometry.dark[width].section,
        `Section geometry differs at ${locale}/${width}`,
      );
    }
  }
} finally {
  await browser.close();
}
await fs.writeFile(
  `${out}/results.json`,
  JSON.stringify({ results, findings }, null, 2) + "\n",
);
assert.deepEqual(findings, []);
console.log(JSON.stringify({ results, findings }, null, 2));
