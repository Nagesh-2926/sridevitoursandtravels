import { readFileSync } from "node:fs";
import { join } from "node:path";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { Logo } from "@/components/brand/Logo";
import { logoUrl, site } from "@/config/site";
import { colors } from "@/design/tokens";
import { IntroController } from "@/features/intro/IntroController";
import { en } from "@/i18n/dictionaries/en";
import { te } from "@/i18n/dictionaries/te";
import { getTheme, setTheme, THEME_KEY, themeScript } from "./theme";
import { ThemeToggle } from "./ThemeToggle";

const root = process.cwd();
const css = readFileSync(join(root, "src/app/globals.css"), "utf8");

afterEach(() => {
  delete document.documentElement.dataset.theme;
  document.documentElement.style.colorScheme = "";
  localStorage.clear();
});

/** Body of the first CSS rule whose selector is exactly `selector`. */
function ruleBody(selector: string) {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`missing ${selector}`);
  return css.slice(start, css.indexOf("\n}", start));
}
const declared = (body: string, name: string) =>
  body.match(new RegExp(`--color-${name}:\\s*(#[0-9a-f]{6})`, "i"))?.[1].toLowerCase();

describe("theme defaults and switching", () => {
  it("is light by default for a first visit (no saved choice)", () => {
    render(<ThemeToggle labels={en.nav.theme} />);
    expect(getTheme()).toBe("light");
    expect(document.documentElement.dataset.theme).toBeUndefined();
    expect(screen.getByRole("button", { name: en.nav.theme.toDark })).toHaveAttribute(
      "data-theme-toggle",
      "light",
    );
  });

  it("activates dark mode, persists it, and can switch back", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle labels={en.nav.theme} />);
    await user.click(screen.getByRole("button", { name: en.nav.theme.toDark }));
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(localStorage.getItem(THEME_KEY)).toBe("dark");
    await user.click(screen.getByRole("button", { name: en.nav.theme.toLight }));
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem(THEME_KEY)).toBe("light");
  });

  it("is operable from the keyboard (Enter and Space)", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle labels={en.nav.theme} />);
    await user.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(getTheme()).toBe("dark");
    await user.keyboard(" ");
    expect(getTheme()).toBe("light");
  });

  it("labels the action in Telugu", () => {
    render(<ThemeToggle labels={te.nav.theme} />);
    expect(
      screen.getByRole("button", { name: "డార్క్ థీమ్‌కు మార్చండి" }),
    ).toBeInTheDocument();
    act(() => setTheme("dark"));
    expect(
      screen.getByRole("button", { name: "లైట్ థీమ్‌కు మార్చండి" }),
    ).toBeInTheDocument();
  });

  it("updates the browser theme-color", () => {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.append(meta);
    setTheme("light");
    expect(meta.content).toBe("#FFFFFF");
    setTheme("dark");
    expect(meta.content).toBe(colors.midnight);
    meta.remove();
  });
});

describe("no theme flash on load", () => {
  const run = () => new Function(themeScript)();

  it("applies a returning visitor's saved dark theme synchronously, before rendering", () => {
    localStorage.setItem(THEME_KEY, "dark");
    run();
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(getTheme()).toBe("dark");
  });

  it("applies a saved light theme synchronously too", () => {
    localStorage.setItem(THEME_KEY, "light");
    run();
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("ignores unknown values and leaves the light default", () => {
    localStorage.setItem(THEME_KEY, "sepia");
    run();
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  it("is injected in <head> ahead of the page body", () => {
    const layout = readFileSync(join(root, "src/app/[lang]/layout.tsx"), "utf8");
    const head = layout.slice(layout.indexOf("<head>"), layout.indexOf("</head>"));
    expect(head).toContain("${themeScript}");
  });
});

describe("palette roles per theme", () => {
  const theme = css.slice(
    css.indexOf("@theme"),
    css.indexOf("\n}\n", css.indexOf("@theme")),
  );
  const light = ruleBody(':root:not([data-theme="dark"])');
  const darkScope = ruleBody('[data-theme="dark"]');

  it.each([
    ["charcoal", "#ffffff"],
    ["midnight", "#f4f7fb"],
    ["navy", "#e8eef5"],
    ["grey", "#d6dfe9"],
    ["white", "#14263d"],
    ["mist", "#42556b"],
    ["gold", "#bf4e05"],
    ["gold-soft", "#a14104"],
    ["flame", "#f36b08"],
  ])("light mode maps %s → %s", (role, hex) => {
    expect(declared(light, role)).toBe(hex);
  });

  it.each([
    "charcoal",
    "midnight",
    "navy",
    "bronze",
    "gold",
    "grey",
    "white",
    "gold-soft",
    "fog",
    "mist",
  ])("the dark scope mirrors the approved @theme value for %s", (role) => {
    expect(declared(darkScope, role)).toBe(declared(theme, role));
  });

  it("keeps the cinematic intro dark in either theme", async () => {
    document.documentElement.dataset.theme = "light";
    document.documentElement.dataset.intro = "pending";
    render(
      <IntroController
        copy={{ regionLabel: "Welcome", skip: "Skip" }}
        logoAlt="logo"
        shellId="s"
        mainId="m"
      />,
    );
    expect(screen.getByRole("dialog", { name: "Welcome" })).toHaveAttribute(
      "data-theme",
      "dark",
    );
    delete document.documentElement.dataset.intro;
  });
});

/** WCAG relative-luminance contrast ratio. */
function contrast(a: string, b: string) {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl);
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe("modal and page readability (WCAG AA)", () => {
  const light = ruleBody(':root:not([data-theme="dark"])');
  const L = (role: string) => declared(light, role)!;
  const D = (role: keyof typeof colors) => colors[role].toLowerCase();

  it.each([
    ["light: primary text on white", () => contrast(L("white"), "#ffffff"), 7],
    ["light: primary text on glass (#f4f7fb)", () => contrast(L("white"), "#f4f7fb"), 7],
    ["light: secondary text on glass", () => contrast(L("mist"), "#f4f7fb"), 4.5],
    ["light: brand-blue link text on white", () => contrast(L("gold"), "#ffffff"), 4.5],
    ["light: white CTA label on brand blue", () => contrast("#ffffff", L("gold")), 4.5],
    ["light: errors on white", () => contrast(L("danger") ?? "#b42318", "#ffffff"), 4.5],
    ["dark: primary text on glass (navy)", () => contrast(D("white"), D("navy")), 7],
    ["dark: secondary text on midnight", () => contrast(D("mist"), D("midnight")), 4.5],
    ["dark: CTA label on gold", () => contrast(D("charcoal"), D("gold")), 4.5],
  ])("%s", (_, ratio, min) => {
    expect(ratio()).toBeGreaterThanOrEqual(min);
  });
});

describe("logo assets", () => {
  it("renders one image per theme, with no plaque around either", () => {
    const { container } = render(<Logo alt="Sridevi Tours & Travels" sizes="9rem" />);
    const imgs = screen.getAllByRole("img", { name: "Sridevi Tours & Travels" });
    expect(imgs.map((img) => img.getAttribute("src"))).toEqual([
      logoUrl(site.logos.light),
      logoUrl(site.logos.dark),
    ]);
    expect(container.innerHTML).not.toMatch(/logo-plaque|bg-\[#fff\]|ring-/);
    expect(css).not.toMatch(/\.logo-plaque/);
    const lightRules = css.slice(
      css.indexOf("/* Light versions of the textured surfaces. */"),
    );
    expect(lightRules).toMatch(
      /\.site-header\s*\{\s*background:\s*var\(--navigation-background\)/,
    );
    expect(ruleBody(':root:not([data-theme="dark"])')).toMatch(
      /--navigation-background:\s*#ffffff/,
    );
  });
});
