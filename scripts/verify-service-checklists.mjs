import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const base = (process.env.BASE_URL || "http://localhost:3000").trim();
const browser = await chromium.launch({ channel: "msedge", headless: true });
const results = [];
const browserErrors = [];

for (const theme of ["light", "dark"]) {
  for (const width of [320, 375, 768, 1024, 1440, 1920]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    page.on("pageerror", (error) =>
      browserErrors.push(`${theme}/${width}: ${error.message}`),
    );
    page.on("console", (message) => {
      if (message.type() === "error") {
        browserErrors.push(`${theme}/${width}: ${message.text()}`);
      }
    });
    await page.addInitScript(
      (value) => localStorage.setItem("sridevi:theme", value),
      theme,
    );
    await page.goto(`${base}/en/services`, { waitUntil: "networkidle" });
    const cards = page.locator("article[data-service-id]");
    const count = await cards.count();
    const hasStandaloneChecklist = await page
      .getByRole("heading", { name: /Preliminary document checklists/i })
      .count();
    const cardHeightsBefore = await cards.evaluateAll((nodes) =>
      nodes.map((node) => node.getBoundingClientRect().height),
    );
    const first = cards.nth(0);
    await first.getByRole("button", { name: "View service details" }).click();
    const modal = page.locator("dialog[data-service-details-modal]");
    const firstOpen = await modal.isVisible();
    const selectedService = await modal.getAttribute("data-service-id");
    const documentsVisible = (await modal.locator("li").count()) > 0;
    const scrollLockedWhileOpen = await page.evaluate(
      () => getComputedStyle(document.documentElement).overflow === "hidden",
    );
    await page.waitForTimeout(450);
    const hasInlineRequirements =
      (await first.locator("ul").count()) > 0 ||
      (await first.locator("details").count()) > 0;
    const cardHeightsWhileOpen = await cards.evaluateAll((nodes) =>
      nodes.map((node) => node.getBoundingClientRect().height),
    );
    const modalRect = await modal.evaluate((node) => {
      const {
        x,
        y,
        width: modalWidth,
        height: modalHeight,
      } = node.getBoundingClientRect();
      return {
        x,
        y,
        width: modalWidth,
        height: modalHeight,
        centerX: x + modalWidth / 2,
        centerY: y + modalHeight / 2,
      };
    });
    await page.keyboard.press("Escape");
    await modal.waitFor({ state: "hidden" });
    const firstClosed = !(await modal.isVisible());
    const cardHeightsAfterClose = await cards.evaluateAll((nodes) =>
      nodes.map((node) => node.getBoundingClientRect().height),
    );
    const focusRestored = await page.evaluate(
      () => document.activeElement?.tagName === "BUTTON",
    );
    const scrollRestored = await page.evaluate(
      () => getComputedStyle(document.documentElement).overflow !== "hidden",
    );
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    const actualTheme =
      (await page.locator("html").getAttribute("data-theme")) || "light";
    results.push({
      theme,
      actualTheme,
      width,
      overflow,
      count,
      hasStandaloneChecklist,
      firstOpen,
      firstClosed,
      documentsVisible,
      selectedService,
      scrollLockedWhileOpen,
      focusRestored,
      scrollRestored,
      hasInlineRequirements,
      cardHeightsBefore,
      cardHeightsWhileOpen,
      cardHeightsAfterClose,
      modalRect,
    });
    await page.close();
  }
}

const teluguContext = await browser.newContext({
  viewport: { width: 375, height: 900 },
});
const telugu = await teluguContext.newPage();
await telugu.goto(`${base}/te/services`, { waitUntil: "networkidle" });
const teluguCard = telugu.locator("article[data-service-id]").nth(0);
await teluguCard.getByRole("button", { name: "సేవ వివరాలు చూడండి" }).click();
const teluguModal = telugu.locator("dialog[data-service-details-modal]");
const teluguText = await teluguModal.innerText();
const axe = await new AxeBuilder({ page: telugu }).analyze();
await telugu.keyboard.press("Escape");
await telugu.close();
await teluguContext.close();

const interactionPage = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
});
await interactionPage.goto(`${base}/en/services`, { waitUntil: "networkidle" });
const enquiryCards = interactionPage.locator("article[data-service-id]");
for (let index = 0; index < (await enquiryCards.count()); index += 1) {
  const card = enquiryCards.nth(index);
  const serviceId = await card.getAttribute("data-service-id");
  await card.getByRole("button", { name: "View service details" }).click();
  const detailsDialog = interactionPage.locator("dialog[data-service-details-modal]");
  if (
    !(await detailsDialog.isVisible()) ||
    (await detailsDialog.getAttribute("data-service-id")) !== serviceId
  ) {
    browserErrors.push(`Service details modal did not open for ${serviceId}`);
  }
  if (serviceId === "pan") {
    await interactionPage.mouse.click(2, 2);
    await detailsDialog.waitFor({ state: "hidden" });
    await card.getByRole("button", { name: "View service details" }).click();
  }
  const activeDetailsDialog = interactionPage.locator(
    "dialog[data-service-details-modal][open]",
  );
  await activeDetailsDialog
    .getByRole("link", { name: "Enquire on WhatsApp" })
    .click();
  const enquiryDialog = interactionPage.locator(
    'dialog[aria-labelledby="service-modal-title"]',
  );
  const opened = await enquiryDialog.isVisible();
  const modalTitle = await enquiryDialog.locator("[data-modal-title]").innerText();
  if (!opened || !modalTitle.includes(await card.locator("h3").innerText())) {
    browserErrors.push(`Enquiry modal did not open for ${serviceId}`);
  }
  await interactionPage.keyboard.press("Escape");
  await enquiryDialog.waitFor({ state: "hidden" });
}
await interactionPage.close();

await browser.close();

const failures = results.filter(
  (result) =>
    result.actualTheme !== result.theme ||
    result.overflow ||
    result.count !== 10 ||
    result.hasStandaloneChecklist !== 0 ||
    !result.firstOpen ||
    !result.firstClosed ||
    !result.documentsVisible ||
    result.selectedService !== "passport" ||
    !result.scrollLockedWhileOpen ||
    !result.focusRestored ||
    !result.scrollRestored ||
    result.hasInlineRequirements ||
    result.cardHeightsBefore.some(
      (height, index) =>
        Math.abs(height - result.cardHeightsWhileOpen[index]) > 1 ||
        Math.abs(height - result.cardHeightsAfterClose[index]) > 1,
    ) ||
    Math.abs(result.modalRect.centerX - result.width / 2) > 2 ||
    Math.abs(result.modalRect.centerY - 500) > 2 ||
    result.modalRect.width > Math.min(result.width - 24, 736) ||
    result.modalRect.height > 850,
);
console.log(
  JSON.stringify(
    { failures, browserErrors, axe: axe.violations, telugu: teluguText },
    null,
    2,
  ),
);
if (
  failures.length ||
  browserErrors.length ||
  axe.violations.length ||
  !teluguText.includes("10వ తరగతి")
) {
  process.exitCode = 1;
}
