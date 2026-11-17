import { chromium } from "playwright";
import fs from "node:fs/promises";
import sharp from "sharp";
import assert from "node:assert/strict";

const base = process.env.BASE_URL || "http://localhost:3006";
const phase = process.env.CAPTURE_PHASE || "before";
const dir = `artifacts/sizing-${phase}`;
await fs.mkdir(dir, { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext({ reducedMotion: "reduce" });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const results = [];
try {
  await page.goto(`${base}/en`);
  await page.evaluate(() => document.fonts.ready);
  for (const theme of ["light", "dark"]) {
    if (theme === "dark") {
      await page.getByRole("button", { name: "Switch to dark theme" }).click();
    }
    for (const width of [320, 375, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 941 });
      await page.evaluate(async () => {
        await document.fonts.ready;
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        );
      });
      const screenshot = await page.screenshot({ fullPage: true });
      const geometry = await page.evaluate(() => {
        const box = (selector) => {
          const rect = document.querySelector(selector).getBoundingClientRect();
          return {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            right: rect.right,
            bottom: rect.bottom,
          };
        };
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          hero: box(".reference-hero"),
          stage: box(".reference-stage"),
          art: box(".reference-art"),
          copy: box(".reference-copy"),
          header: box(".site-header"),
          logo: box(".site-header [data-logo]"),
          services: box(".reference-services"),
          cards: [...document.querySelectorAll(".reference-service-card")].map(
            (e) => e.getBoundingClientRect().height,
          ),
          reducedMotionIntroHidden: !document.querySelector('[data-testid="intro"]'),
        };
      });
      await sharp(screenshot)
        .extract({ left: 0, top: 0, width, height: Math.ceil(geometry.services.bottom) })
        .toFile(`${dir}/${theme}-${width}.png`);
      results.push({ theme, width, ...geometry });
    }
  }
} finally {
  await browser.close();
}
await fs.writeFile(
  `${dir}/results.json`,
  JSON.stringify({ results, errors }, null, 2) + "\n",
);
assert.deepEqual(errors, []);
if (phase === "after") {
  const before = JSON.parse(
    await fs.readFile("artifacts/sizing-before/results.json", "utf8"),
  );
  for (const current of results) {
    const previous = before.results.find(
      (r) => r.theme === current.theme && r.width === current.width,
    );
    assert(!current.overflow);
    assert(current.reducedMotionIntroHidden);
    assert.deepEqual(
      current.header,
      previous.header,
      "Header geometry must remain unchanged",
    );
    assert.deepEqual(current.logo, previous.logo, "Logo geometry must remain unchanged");
    assert(current.cards.every((height, index) => height >= previous.cards[index]));
    if (current.width >= 1024) {
      const increase = current.hero.height / previous.hero.height;
      assert(
        increase >= 1.15 && increase <= 1.2,
        `Hero increase outside 15-20%: ${increase}`,
      );
      assert(current.art.y >= current.stage.y - 1);
      assert(
        current.art.bottom <= current.stage.bottom + 1,
        "Artwork must fit within the hero",
      );
      assert(
        Math.abs(
          current.art.width / current.art.height -
            previous.art.width / previous.art.height,
        ) < 0.01,
      );
    }
  }
}
console.log(
  JSON.stringify(
    {
      phase,
      errors,
      results: results.map((r) => ({
        theme: r.theme,
        width: r.width,
        hero: r.hero.height,
        stage: r.stage.height,
        art: r.art.height,
        card: r.cards[0],
        overflow: r.overflow,
      })),
    },
    null,
    2,
  ),
);
