import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Logo } from "@/components/brand/Logo";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { logoUrl, site } from "@/config/site";
import { en } from "@/i18n/dictionaries/en";

/**
 * Theme-specific logo mapping (mandatory):
 *   LIGHT THEME = white-background logo, DARK THEME = black-background logo.
 */
const root = process.cwd();
const css = readFileSync(join(root, "src/app/globals.css"), "utf8");
const LIGHT_FILE = "/brand/sridevi-logo-light.png";
const DARK_FILE = "/brand/sridevi-logo-dark-integrated.png";
const DARK_SOURCE_FILE = "/brand/sridevi-logo-dark.png";
const LIGHT = logoUrl(site.logos.light);
const DARK = logoUrl(site.logos.dark);
const SOURCES = {
  light: join(root, "Sridevi Tours & Travels Logo.png"),
  dark: join(root, "Vibrant Sridevi Travel Logo with Globe and Icons.png"),
};
const RETIRED = [
  "sridevi-dashboard-official.png",
  "sridevi-logo-dashboard.png",
  "sridevi-logo.png",
];

const sha256 = (file: string) =>
  createHash("sha256").update(readFileSync(file)).digest("hex").toUpperCase();

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(tsx?|css|mjs)$/.test(name) && !/\.test\./.test(name) ? [path] : [];
  });
}

describe("theme-specific logo assets", () => {
  it("the light logo is a byte-identical copy of the owner's source file", () => {
    expect(sha256(SOURCES.light)).toBe(site.logos.light.sha256);
    expect(sha256(join(root, "public", site.logos.light.src))).toBe(
      site.logos.light.sha256,
    );
  });

  it("preserves the owner's exact dark source beside the derived RGBA display asset", () => {
    expect(site.logos.dark.sourceSrc).toBe(DARK_SOURCE_FILE);
    expect(sha256(SOURCES.dark)).toBe(site.logos.dark.sourceSha256);
    expect(sha256(join(root, "public", DARK_SOURCE_FILE))).toBe(
      site.logos.dark.sourceSha256,
    );
    expect(sha256(join(root, "public", DARK_FILE))).toBe(site.logos.dark.sha256);
  });

  it("maps the white-background file to light and the black-background file to dark", async () => {
    const { default: sharp } = await import("sharp");
    const corner = async (file: string) => {
      const { data } = await sharp(file)
        .extract({ left: 0, top: 0, width: 1, height: 1 })
        .raw()
        .toBuffer({ resolveWithObject: true });
      return data[0] + data[1] + data[2];
    };
    expect(site.logos.light.src).toBe(LIGHT_FILE);
    expect(site.logos.dark.src).toBe(DARK_FILE);
    expect(await corner(join(root, "public", LIGHT_FILE))).toBeGreaterThan(700); // white
    expect(await corner(join(root, "public", DARK_FILE))).toBeLessThan(40); // near-black
  });

  it("no source file references a retired logo, and none is served from public/", () => {
    const offenders = sourceFiles(join(root, "src")).filter((file) => {
      const text = readFileSync(file, "utf8");
      return RETIRED.some((name) => text.includes(name));
    });
    expect(offenders).toEqual([]);
    for (const name of RETIRED)
      expect(existsSync(join(root, "public/brand", name))).toBe(false);
  });
});

describe("stale-cache protection", () => {
  it.each(["light", "dark"] as const)(
    "the %s logo URL is versioned by the file's own checksum",
    (theme) => {
      const logo = site.logos[theme];
      expect(logoUrl(logo)).toBe(
        `${logo.src}?v=${sha256(join(root, "public", logo.src))
          .slice(0, 12)
          .toLowerCase()}`,
      );
    },
  );

  it("next.config.ts allow-lists exactly the versioned logo URLs", () => {
    const config = readFileSync(join(root, "next.config.ts"), "utf8");
    expect(config).toMatch(/localPatterns/);
    expect(config).toMatch(/search: `\?v=\$\{logoVersion\(logo\)\}`/);
  });
});

describe("Logo component", () => {
  it("renders the light logo for the light theme and the dark logo for the dark theme", () => {
    const { container } = render(<Logo alt={site.name} sizes="9rem" />);
    const light = container.querySelector('[data-logo-variant="light"]')!;
    const dark = container.querySelector('[data-logo-variant="dark"]')!;
    expect(light).toHaveAttribute("src", LIGHT);
    expect(dark).toHaveAttribute("src", DARK);
    // The light logo hides only in dark; the dark logo shows only in dark.
    expect(light.className).toMatch(/(^|\s)dark-theme:hidden(\s|$)/);
    expect(light.className).not.toMatch(/(^|\s)hidden(\s|$)/);
    expect(dark.className).toMatch(/(^|\s)hidden(\s|$)/);
    expect(dark.className).toMatch(/(^|\s)dark-theme:block(\s|$)/);
  });

  it("the dark-theme variant matches only the explicit dark theme (light is the default)", () => {
    expect(css).toContain(
      '@custom-variant dark-theme (&:where([data-theme="dark"], [data-theme="dark"] *));',
    );
  });

  it("keeps both artworks whole, undistorted and unfiltered in a fixed box", () => {
    const { container } = render(<Logo alt={site.name} sizes="9rem" />);
    const box = container.firstElementChild!;
    expect(box.className).toMatch(/aspect-\[2042\/770\]/);
    for (const img of container.querySelectorAll("img")) {
      expect(img.className).toMatch(/object-contain/);
      expect(img.className).not.toMatch(
        /filter|invert|grayscale|hue|sepia|object-cover|blend/,
      );
    }
  });

  it("uses genuine RGBA transparency derived from the preserved opaque source", async () => {
    const { default: sharp } = await import("sharp");
    const sourceMetadata = await sharp(join(root, "public", DARK_SOURCE_FILE)).metadata();
    const displayMetadata = await sharp(join(root, "public", DARK_FILE)).metadata();
    expect(sourceMetadata.hasAlpha).toBe(false);
    expect(sourceMetadata.channels).toBe(3);
    expect(displayMetadata.hasAlpha).toBe(true);
    expect(displayMetadata.channels).toBe(4);
    expect(displayMetadata.width).toBe(sourceMetadata.width);
    expect(displayMetadata.height).toBe(sourceMetadata.height);

    const { container } = render(<Logo alt={site.name} sizes="9rem" />);
    expect(container.firstElementChild).toHaveAttribute(
      "data-dark-logo-treatment",
      "rgba-extraction",
    );
    expect(css).not.toMatch(
      /\[data-theme="dark"\] \[data-logo-variant="dark"\][^{]*\{[^}]*(filter|mix-blend-mode)/,
    );
  });
});

describe("logo placements", () => {
  it("the header shows the theme logos at the far left", () => {
    const { container } = render(
      <SiteHeader locale="en" nav={en.nav} logoAlt={site.name} />,
    );
    const brand = container.querySelector("header > div")!
      .firstElementChild as HTMLElement;
    expect(brand.className).toMatch(/justify-self-start/);
    const srcs = [...brand.querySelectorAll("img")].map((i) => i.getAttribute("src"));
    expect(srcs).toEqual([LIGHT, DARK]);
    expect(within(brand).getAllByRole("img", { name: site.name })).toHaveLength(2);
  });

  it("header, mobile menu and footer all use only the two theme logos", () => {
    const { container } = render(
      <>
        <SiteHeader locale="en" nav={en.nav} logoAlt={site.name} />
        <SiteFooter locale="en" dict={en} />
      </>,
    );
    const srcs = [...container.querySelectorAll("img")].map((img) =>
      img.getAttribute("src"),
    );
    expect(srcs.length).toBe(6); // header, mobile menu, footer × (light + dark)
    expect(new Set(srcs)).toEqual(new Set([LIGHT, DARK]));
  });

  it("sizes the header logo so high-density screens get a sharp file", () => {
    const { container } = render(
      <SiteHeader locale="en" nav={en.nav} logoAlt={site.name} />,
    );
    for (const img of container.querySelectorAll("header > div a img")) {
      expect(img.getAttribute("sizes")).toBe(
        "(min-width: 1280px) 12.25rem, (min-width: 1024px) 10rem, (min-width: 640px) 8.625rem, 8rem",
      );
    }
  });
});
