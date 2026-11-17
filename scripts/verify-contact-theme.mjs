import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const base = process.env.BASE_URL || "http://localhost:3011";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const results = [];
try {
  // Dark OS preference must not override the site's first-visit light default.
  const context = await browser.newContext({
    colorScheme: "dark",
    reducedMotion: "reduce",
    viewport: { width: 1440, height: 941 },
  });
  await context.addInitScript(() => {
    window.__paintThemes = [];
    const sample = () => {
      if (document.body)
        window.__paintThemes.push(document.documentElement.dataset.theme || "light");
      if (window.__paintThemes.length < 12) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
    document.addEventListener("DOMContentLoaded", () => {
      window.__firstTheme = document.documentElement.dataset.theme || "light";
    });
  });
  const page = await context.newPage();
  const verifyPaints = async (theme) => {
    await page.waitForFunction(() => window.__paintThemes.length === 12);
    assert(
      (await page.evaluate(() => window.__paintThemes)).every((value) => value === theme),
      "Unexpected theme in an initial animation frame",
    );
  };
  await page.goto(`${base}/en`);
  await verifyPaints("light");
  assert.equal(await page.evaluate(() => window.__firstTheme), "light");
  for (const theme of ["dark", "light"]) {
    await page.locator("header [data-theme-toggle]").click();
    await page.reload();
    await verifyPaints(theme);
    assert.equal(await page.evaluate(() => window.__firstTheme), theme);
    for (const locale of ["te", "en"]) {
      // Use the visible language control, preserving theme across real navigation.
      await page.locator(`header a[hreflang="${locale}-IN"]`).first().click();
      await page.waitForURL(`**/${locale}**`);
      await page.waitForLoadState("load");
      await verifyPaints(theme);
      assert.equal(await page.locator("html").getAttribute("data-theme"), theme);
      for (const route of ["", "/services", "/about", "/location", "/contact"]) {
        await page.goto(`${base}/${locale}${route}`);
        const calls = page.locator('a[href^="tel:"]');
        assert((await calls.count()) > 0);
        for (const call of await calls.all())
          assert.equal(await call.getAttribute("href"), "tel:+919347626862");
        for (const wa of await page.locator('a[href*="wa.me/"]').all())
          assert.match(
            await wa.getAttribute("href"),
            /^https:\/\/wa\.me\/919666270662(?:\?|$)/,
          );
        const footer = page.locator("footer");
        const contacts = footer.locator('a[href^="tel:"], a[href*="wa.me/"]');
        assert.equal(await contacts.nth(0).getAttribute("href"), "tel:+919347626862");
        assert.equal(
          await contacts.nth(1).getAttribute("href"),
          "https://wa.me/919666270662",
        );
        const surface = await page
          .locator(".surface-atmos")
          .first()
          .evaluate((el) => getComputedStyle(el).backgroundImage);
        assert(surface.includes(theme === "light" ? "207, 229, 252" : "11, 15, 20"));
        results.push({
          theme,
          locale,
          route: route || "/",
          calls: "9347626862",
          whatsapp: "9666270662",
          atmosphere: "passed",
        });
      }
      // Verify form handoffs locally; do not open or send messages externally.
      await page.evaluate(() => {
        window.__urls = [];
        window.open = (url) => {
          window.__urls.push(String(url));
          return null;
        };
      });
      const form = page.locator("form");
      await form.locator('[name="name"]').fill("Local QA");
      await form.locator('[name="phone"]').fill("9000000000");
      await form.locator('[name="serviceId"]').selectOption("trains");
      await form.locator('[name="message"]').fill("Local verification only");
      await form.locator('button[type="submit"]').click();
      assert.match(
        await page.evaluate(() => window.__urls[0]),
        /^https:\/\/wa\.me\/919666270662\?text=/,
      );
      await page.goto(`${base}/${locale}`);
      await page.locator(".reference-service-card a").first().click();
      const dialog = page.locator("dialog.modal[open]");
      // Native dialog must retain keyboard focus in both directions.
      const focusables = dialog.locator("button, a[href], input, select, textarea");
      await focusables.last().focus();
      await page.keyboard.press("Tab");
      assert(await dialog.evaluate((el) => el.contains(document.activeElement)));
      await focusables.first().focus();
      await page.keyboard.press("Shift+Tab");
      assert(await dialog.evaluate((el) => el.contains(document.activeElement)));
      await page.evaluate(() => {
        window.__urls = [];
        window.open = (url) => {
          window.__urls.push(String(url));
          return null;
        };
      });
      for (const [name, value] of Object.entries({
        name: "Local QA",
        phone: "9000000000",
        from: "Hyderabad",
        to: "Delhi",
        departDate: "2099-01-01",
        passengers: "1",
      }))
        await dialog.locator(`[name="${name}"]`).fill(value);
      await dialog.locator('button[type="submit"]').click();
      assert.match(
        await page.evaluate(() => window.__urls[0]),
        /^https:\/\/wa\.me\/919666270662\?text=/,
      );
      await page.keyboard.press("Escape");
    }
  }
  await fs.writeFile(
    "artifacts/contact-theme-verification.json",
    JSON.stringify(
      {
        results,
        defaultLightWithDarkOS: true,
        savedPreferencesAtDOMContentLoaded: true,
        initialTwelveFramesCorrect: true,
        languageSwitching: true,
        contactAndFlightFormHandoffs: true,
        modalFocusTrap: true,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `Contact routing and theme checks passed across ${results.length} page/theme/language combinations.`,
  );
} finally {
  await browser.close();
}
