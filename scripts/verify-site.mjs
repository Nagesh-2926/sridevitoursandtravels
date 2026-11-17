import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
import assert from "node:assert/strict";

const base = process.env.BASE_URL || "http://localhost:3007";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext({ reducedMotion: "reduce" });
const page = await context.newPage();
const findings = [];
const results = [];
page.on("pageerror", (error) => findings.push({ type: "runtime", error: error.message }));
page.on("response", (response) => {
  if (response.url().startsWith(base) && response.status() >= 400) {
    findings.push({ type: "http", url: response.url(), status: response.status() });
  }
});
try {
  for (const theme of ["light", "dark"]) {
    await page.goto(`${base}/en`);
    if (theme === "dark")
      await page.getByRole("button", { name: "Switch to dark theme" }).click();
    for (const locale of ["en", "te"]) {
      for (const route of ["", "/services", "/about", "/location", "/contact"]) {
        await page.goto(`${base}/${locale}${route}`);
        await page.evaluate(() => document.fonts.ready);
        for (const width of [320, 375, 390, 768, 1024, 1440, 1920]) {
          await page.setViewportSize({ width, height: 941 });
          await page.evaluate(async () => {
            await document.fonts.ready;
            await new Promise((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(resolve)),
            );
          });
          await page.screenshot();
          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          );
          if (overflow) findings.push({ type: "overflow", theme, locale, route, width });
        }
        await page.setViewportSize({ width: 1440, height: 941 });
        const axe = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        for (const violation of axe.violations)
          findings.push({
            type: "accessibility",
            theme,
            locale,
            route,
            id: violation.id,
            nodes: violation.nodes.map((n) => ({
              target: n.target,
              summary: n.failureSummary,
            })),
          });
        results.push({
          theme,
          locale,
          route,
          widths: 7,
          accessibilityViolations: axe.violations.length,
        });
      }
    }
    await page.goto(`${base}/en`);
    for (let i = 0; i < 4; i++) {
      const trigger = page.locator(".reference-service-card a").nth(i);
      await trigger.click();
      const dialog = page.locator("dialog.modal[open]");
      await dialog.waitFor();
      await dialog.locator('button[type="submit"]').click();
      assert(
        await dialog.getByRole("alert").isVisible(),
        "Empty modal form must show errors",
      );
      assert((await dialog.locator('[aria-invalid="true"]').count()) > 0);
      const axe = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      for (const violation of axe.violations)
        findings.push({
          type: "modal-accessibility",
          theme,
          service: i,
          id: violation.id,
          nodes: violation.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        });
      await page.keyboard.press("Escape");
      assert(
        await trigger.evaluate((e) => e === document.activeElement),
        "Modal must restore focus",
      );
    }
    await page.setViewportSize({ width: 375, height: 941 });
    const menu = page.getByRole("button", { name: "Open menu" });
    await menu.click();
    assert(await page.locator("#mobile-menu").isVisible());
    await page.keyboard.press("Escape");
    assert(await menu.evaluate((e) => e === document.activeElement));
    await page.reload();
    assert.equal(
      (await page.locator("html").getAttribute("data-theme")) || "light",
      theme,
    );
  }
  // Verify a valid handoff without opening WhatsApp or sending a message.
  await page.goto(`${base}/en/contact`);
  await page.evaluate(() => {
    window.__qaOpenedUrls = [];
    window.open = (url) => {
      window.__qaOpenedUrls.push(String(url));
      return null;
    };
  });
  const form = page.locator("form");
  await form.locator('button[type="submit"]').click();
  assert(await form.getByRole("alert").isVisible());
  await form.locator('[name="name"]').fill("Local QA Test");
  await form.locator('[name="phone"]').fill("9000000000");
  await form.locator('[name="serviceId"]').selectOption("trains");
  await form
    .locator('[name="message"]')
    .fill("Local verification only; no message sent.");
  await form.locator('button[type="submit"]').click();
  const opened = await page.evaluate(() => window.__qaOpenedUrls);
  assert.equal(opened.length, 1);
  assert.match(opened[0], /^https:\/\/wa\.me\/919666270662\?text=/);
  assert(await form.getByRole("status").getByRole("link").isVisible());

  const animated = await browser.newContext({
    viewport: { width: 1440, height: 941 },
    reducedMotion: "no-preference",
  });
  await animated.addInitScript(() => {
    window.addEventListener("sridevi:intro-complete", (event) => {
      window.__qaIntroComplete = event.detail;
    });
  });
  const introPage = await animated.newPage();
  await introPage.goto(`${base}/en`);
  await introPage.waitForFunction(() => window.__qaIntroComplete, null, {
    timeout: 12000,
  });
  const intro = await introPage.evaluate(() => window.__qaIntroComplete);
  assert.equal(intro.reason, "complete");
  assert(
    Math.abs(intro.elapsedMs - 5000) < 500,
    `Unexpected intro duration ${intro.elapsedMs}`,
  );
  assert.equal(await introPage.locator('[data-testid="intro"]').count(), 0);
  results.push({
    interaction: "WhatsApp handoff intercepted, validation and fallback passed",
    intro,
  });
  await animated.close();
} finally {
  await fs.mkdir("artifacts", { recursive: true });
  await fs.writeFile(
    "artifacts/site-audit.json",
    JSON.stringify({ results, findings }, null, 2) + "\n",
  );
  await browser.close();
}
const routeResults = results.filter((result) => "route" in result);
console.log(
  JSON.stringify(
    { routes: routeResults.length, responsiveCases: routeResults.length * 7, findings },
    null,
    2,
  ),
);
assert.equal(
  findings.length,
  0,
  "Site audit found issues; see artifacts/site-audit.json",
);
