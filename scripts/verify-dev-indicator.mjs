import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "playwright";

const base = process.env.BASE_URL || "http://localhost:3019";
const browser = await chromium.launch({ channel: "msedge", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${base}/te/services`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);
  // Next keeps a zero-size shadow portal for runtime error reporting. The
  // supported devIndicators:false option removes every rendered child from it.
  const visibleDevtools = await page.locator("nextjs-portal").evaluateAll(
    (portals) =>
      portals.flatMap((portal) =>
        [...(portal.shadowRoot?.querySelectorAll("*") ?? [])].filter((element) => {
          const box = element.getBoundingClientRect();
          return box.width > 0 && box.height > 0;
        }),
      ).length,
  );
  assert.equal(visibleDevtools, 0, "Next.js development indicator is visible");
  await fs.mkdir("artifacts/travel-services", { recursive: true });
  await page.screenshot({ path: "artifacts/travel-services/dev-indicator-disabled.png" });
  console.log("Next.js development indicator is disabled.");
} finally {
  await browser.close();
}
