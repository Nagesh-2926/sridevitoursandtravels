import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LightHeroPanorama } from "@/components/art/LightArt";
import { LightServicesShowcase } from "@/components/home/LightServicesShowcase";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { logoUrl, site } from "@/config/site";
import { ServiceModalProvider } from "@/features/service-enquiry/ServiceModal";
import { en } from "@/i18n/dictionaries/en";
import { te } from "@/i18n/dictionaries/te";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

/** WCAG contrast of `fg` (optionally alpha-blended over `bg`) against `bg`. */
function contrast(fg: string, bg: string, alpha = 1) {
  const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [f, b] = [rgb(fg), rgb(bg)];
  const mixed = f.map((c, i) => Math.round(c * alpha + b[i] * (1 - alpha)));
  const lum = (c: number[]) => {
    const [r, g, bl] = c
      .map((v) => v / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(mixed), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe("header (Phase 03.2)", () => {
  it("centres the navigation on the whole header with a balanced 1fr | auto | 1fr grid", () => {
    const { container } = render(
      <SiteHeader locale="en" nav={en.nav} logoAlt={site.name} />,
    );
    const bar = container.querySelector("header > div")!;
    expect(bar.className).toContain("grid-cols-[1fr_auto_1fr]");
    const nav = within(bar as HTMLElement).getAllByRole("navigation", {
      name: en.nav.primaryLabel,
    })[0];
    expect(nav.className).toMatch(/col-start-2/);
    expect(nav.className).toMatch(/justify-self-center/);
  });

  it("loads the official theme logos at the far left", () => {
    const { container } = render(
      <SiteHeader locale="en" nav={en.nav} logoAlt={site.name} />,
    );
    const bar = container.querySelector("header > div")!;
    const first = bar.firstElementChild!;
    expect(first.className).toMatch(/justify-self-start/);
    const imgs = within(first as HTMLElement).getAllByRole("img", { name: site.name });
    expect(imgs.map((img) => img.getAttribute("src"))).toEqual([
      logoUrl(site.logos.light),
      logoUrl(site.logos.dark),
    ]);
  });

  it("orders the right group as theme toggle, language switcher and call us", () => {
    const { container } = render(
      <SiteHeader locale="te" nav={te.nav} logoAlt={site.name} />,
    );
    const right = container.querySelector("header > div > div")!;
    const labels = [...right.children].map(
      (el) => el.getAttribute("aria-label") ?? el.textContent?.trim(),
    );
    expect(labels.slice(0, 3)).toEqual([
      te.nav.theme.toDark,
      te.nav.languageLabel,
      te.nav.callUs,
    ]);
  });
});

describe("light hero panorama", () => {
  it("contains all five subjects in one scene: airplane, train, bus, car, temple", () => {
    const { container } = render(<LightHeroPanorama />);
    const svg = container.querySelector("[data-hero-panorama]")!;
    // Nested art <svg> elements carry their own viewBox per subject.
    const viewBoxes = [...svg.querySelectorAll("svg")].map((s) =>
      s.getAttribute("viewBox"),
    );
    expect(viewBoxes).toEqual(
      expect.arrayContaining([
        "0 0 640 200", // airliner
        "0 0 1200 170", // train
        "0 0 520 180", // coach
        "0 0 360 130", // car
        "0 0 300 440", // temple
      ]),
    );
    expect(svg.getAttribute("preserveAspectRatio")).toBe("xMidYMid meet"); // never cropped
  });

  it("outlines every vehicle in charcoal so none disappears on the light sky", () => {
    const { container } = render(<LightHeroPanorama />);
    const outlined = container.querySelectorAll('[stroke="#1F2937"]');
    // airliner body + wing, train coach + power car, coach body, car body
    expect(outlined.length).toBeGreaterThanOrEqual(6);
    // Charcoal outline against the palest sky tone and the white ground.
    expect(contrast("#1F2937", "#E6EFF9")).toBeGreaterThanOrEqual(7);
    expect(contrast("#1F2937", "#FFFFFF")).toBeGreaterThanOrEqual(7);
  });
});

describe("light services showcase", () => {
  const renderShowcase = (dict = en) =>
    render(
      <ServiceModalProvider
        copy={{
          enquiry: dict.enquiry,
          services: dict.services,
          a11y: dict.a11y,
          ready: dict.contact.form.ready,
        }}
      >
        <LightServicesShowcase locale={dict === en ? "en" : "te"} dict={dict} />
      </ServiceModalProvider>,
    );

  it("renders the reference heading and five cards, each with its own illustration", () => {
    const { container } = renderShowcase();
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Travel & Digital Services",
    );
    expect(screen.getByText("Our services")).toBeInTheDocument();
    const cards = container.querySelectorAll("[data-light-card]");
    expect(cards).toHaveLength(5);
    const pictograms = [...cards].map((c) =>
      c.querySelector("[data-pictogram]")?.getAttribute("data-pictogram"),
    );
    expect(pictograms).toEqual(["plane", "train", "bus", "temple", "digital"]);
  });

  it("gives Digital Services a real illustration and a link to the full catalogue", () => {
    const { container } = renderShowcase();
    const digital = [...container.querySelectorAll("[data-light-card]")].at(-1)!;
    expect(digital.querySelector('[data-pictogram="digital"] rect')).not.toBeNull();
    expect(within(digital as HTMLElement).getByRole("link")).toHaveAttribute(
      "href",
      "/en/services#digital-services",
    );
  });

  it("opens the service's enquiry modal from a light card", async () => {
    renderShowcase(te);
    await userEvent.click(screen.getByRole("link", { name: /రైలు టికెట్లు/ }));
    const dialog = document.querySelector("dialog") as HTMLDialogElement;
    expect(dialog.open).toBe(true);
    expect(dialog).toHaveAccessibleName("రైలు టికెట్లు విచారణ");
  });
});

describe("modal input contrast (WCAG 1.4.11, ≥3:1)", () => {
  const rule = (selector: string) => {
    const i = css.indexOf(`${selector} {`);
    return css.slice(i, css.indexOf("\n}", i));
  };

  it("dark: input borders stand out against the navy glass", () => {
    const dark = rule('[data-theme="dark"]');
    expect(dark).toContain("--input-border: rgb(169 176 187 / 0.55)");
    // 55% #A9B0BB over the glass surface (navy #1E293B at its lightest)
    expect(contrast("#A9B0BB", "#1E293B", 0.55)).toBeGreaterThanOrEqual(3);
  });

  it("light: input borders stand out against white", () => {
    expect(rule(':root:not([data-theme="dark"])')).toContain("--input-border: #8494a8");
    expect(contrast("#8494A8", "#FFFFFF")).toBeGreaterThanOrEqual(3);
  });

  it("light: orange used for text and buttons meets AA (4.5:1)", () => {
    expect(contrast("#BF4E05", "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#FFFFFF", "#BF4E05")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#BF4E05", "#F4F7FB")).toBeGreaterThanOrEqual(4.5);
  });
});
