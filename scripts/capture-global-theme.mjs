import { chromium } from "playwright";
import fs from "node:fs/promises";
const base = process.env.BASE_URL || "http://localhost:3010";
const phase = process.env.CAPTURE_PHASE || "before";
const dir = `artifacts/global-theme-${phase}`;
await fs.mkdir(dir, { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
try {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  for (const theme of ["light", "dark"]) {
    await page.goto(`${base}/en`);
    await page.evaluate((t) => localStorage.setItem("sridevi:theme", t), theme);
    for (const locale of ["en", "te"]) {
      for (const route of ["", "/services", "/about", "/location", "/contact"]) {
        for (const width of [375, 1440]) {
          await page.setViewportSize({ width, height: 941 });
          await page.goto(`${base}/${locale}${route}`);
          await page.evaluate(() => document.fonts.ready);
          await page.locator("footer").scrollIntoViewIfNeeded();
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.screenshot({
            path: `${dir}/${theme}-${locale}-${route.slice(1) || "home"}-${width}.png`,
            fullPage: true,
            animations: "disabled",
          });
          if (!route) {
            await page.locator(".reference-service-card a").first().click();
            await page.locator("dialog[open]").waitFor();
            await page.screenshot({
              path: `${dir}/${theme}-${locale}-modal-${width}.png`,
              animations: "disabled",
            });
            await page.keyboard.press("Escape");
          }
        }
      }
    }
  }
} finally {
  await browser.close();
}
console.log(`Captured all major pages and enquiry dialogs in ${dir}`);
