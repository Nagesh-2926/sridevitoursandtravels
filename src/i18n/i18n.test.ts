import { describe, expect, it } from "vitest";
import { negotiateLocale, switchLocalePath } from "./config";
import { en } from "./dictionaries/en";
import { te } from "./dictionaries/te";
import { format } from "./format";

/** Flattens nested keys to dotted paths, with array lengths included. */
function shape(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) {
    return [
      `${prefix}[${value.length}]`,
      ...value.flatMap((v, i) => shape(v, `${prefix}.${i}`)),
    ];
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) =>
      shape(v, prefix ? `${prefix}.${k}` : k),
    );
  }
  return [prefix];
}

describe("dictionaries", () => {
  it("Telugu has exactly the same keys and list lengths as English", () => {
    expect(shape(te).sort()).toEqual(shape(en).sort());
  });

  it("Telugu strings are translated (no English copies left behind)", () => {
    const enLeaves = new Map<string, string>();
    const walk = (value: unknown, path: string, into: Map<string, string>) => {
      if (typeof value === "string") into.set(path, value);
      else if (value && typeof value === "object")
        for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`, into);
    };
    const teLeaves = new Map<string, string>();
    walk(en, "", enLeaves);
    walk(te, "", teLeaves);
    const untranslated = [...enLeaves].filter(
      ([path, text]) => /[a-z]{4}/i.test(text) && teLeaves.get(path) === text,
    );
    expect(untranslated).toEqual([]);
  });

  it("keeps placeholders in both languages", () => {
    for (const key of ["slideStatus", "goToSlide"] as const) {
      const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
      expect(placeholders(te.hero[key])).toEqual(placeholders(en.hero[key]));
    }
  });
});

describe("negotiateLocale", () => {
  it.each([
    [null, "en"],
    ["te-IN,te;q=0.9,en;q=0.8", "te"],
    ["en-US,en;q=0.9", "en"],
    ["hi-IN,te;q=0.7,en;q=0.5", "te"],
    ["fr-FR", "en"],
  ])("%s → %s", (header, expected) => {
    expect(negotiateLocale(header)).toBe(expected);
  });
});

describe("switchLocalePath", () => {
  it.each([
    ["/en", "te", "/te"],
    ["/en/services", "te", "/te/services"],
    ["/te/contact", "en", "/en/contact"],
    ["/", "te", "/te"],
  ] as const)("%s → %s", (path, target, expected) => {
    expect(switchLocalePath(path, target)).toBe(expected);
  });
});

describe("format", () => {
  it("fills placeholders and leaves unknown ones intact", () => {
    expect(format("Slide {current} of {total} {x}", { current: 1, total: 3 })).toBe(
      "Slide 1 of 3 {x}",
    );
  });
});
