import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { colors } from "./tokens";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
const theme = css.slice(
  css.indexOf("@theme"),
  css.indexOf("\n}\n", css.indexOf("@theme")),
);

const approved = {
  charcoal: "#0B0F14",
  midnight: "#111827",
  navy: "#1E293B",
  bronze: "#8B6B46",
  gold: "#D4A762",
  grey: "#374151",
  white: "#FFFFFF",
};

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(tsx?|css)$/.test(name) && !/\.test\./.test(name) ? [path] : [];
  });
}

describe("Luxury Dark design tokens", () => {
  it.each(Object.entries(approved))("defines %s as %s in CSS and JS", (name, hex) => {
    expect(theme.toLowerCase()).toContain(`--color-${name}: ${hex.toLowerCase()}`);
    expect(colors[name as keyof typeof colors].toUpperCase()).toBe(hex);
  });

  it("uses Deep Charcoal as the page background", () => {
    expect(css).toMatch(/body\s*\{[^}]*background-color:\s*var\(--color-charcoal\)/);
  });

  it("no longer contains the Phase 01/02 beige or cream palette anywhere in src", () => {
    const retired = [
      "#f5f2ec",
      "#ece6dc",
      "#e4dfd7",
      "#d4cec5",
      "#665244",
      "#967552",
      "#c5a987",
    ];
    const offenders = sourceFiles(join(process.cwd(), "src")).filter((file) => {
      const text = readFileSync(file, "utf8").toLowerCase();
      return retired.some((hex) => text.includes(hex));
    });
    expect(offenders).toEqual([]);
  });

  it("no longer exposes light-surface utilities (ivory, stone, walnut, ink)", () => {
    const retired =
      /\b(?:bg|text|border)-(?:ivory|walnut|champagne|ink|stone)\b|surface-light/;
    const offenders = sourceFiles(join(process.cwd(), "src")).filter((file) =>
      retired.test(readFileSync(file, "utf8")),
    );
    expect(offenders).toEqual([]);
  });
});
