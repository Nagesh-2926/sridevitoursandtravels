import { describe, expect, it } from "vitest";
import { setMedia } from "@/test/setup";
import { INTRO_SEEN_KEY } from "./constants";
import { introGateScript, resolveIntroMode, shouldPlayIntro } from "./gate";

describe("shouldPlayIntro", () => {
  const base = { pathname: "/en", seen: false, reducedMotion: false };

  it.each(["/en", "/te", "/en/", "/te/"])("plays on home path %s", (pathname) => {
    expect(shouldPlayIntro({ ...base, pathname })).toBe(true);
  });

  it.each(["/en/services", "/te/contact", "/", "/fr"])("skips on %s", (pathname) => {
    expect(shouldPlayIntro({ ...base, pathname })).toBe(false);
  });

  it("skips when already seen this session", () => {
    expect(shouldPlayIntro({ ...base, seen: true })).toBe(false);
  });

  it("skips entirely for reduced-motion users", () => {
    expect(shouldPlayIntro({ ...base, reducedMotion: true })).toBe(false);
  });
});

describe("resolveIntroMode", () => {
  it("uses the full scene on capable desktops", () => {
    expect(resolveIntroMode({ narrowViewport: false, hardwareConcurrency: 8 })).toBe(
      "full",
    );
  });
  it.each([
    { narrowViewport: true, hardwareConcurrency: 8 },
    { narrowViewport: false, hardwareConcurrency: 4 },
    { narrowViewport: false, hardwareConcurrency: 8, saveData: true },
  ])("falls back to lite for %o", (device) => {
    expect(resolveIntroMode(device)).toBe("lite");
  });
});

describe("introGateScript (pre-paint)", () => {
  const run = (path: string) => {
    window.history.replaceState(null, "", path);
    new Function(introGateScript)();
    return document.documentElement.dataset.intro;
  };

  it("marks the document pending on a first home visit", () => {
    expect(run("/te")).toBe("pending");
  });

  it("does nothing on inner pages", () => {
    expect(run("/en/services")).toBeUndefined();
  });

  it("does nothing once the intro was seen", () => {
    sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    expect(run("/en")).toBeUndefined();
  });

  it("does nothing under reduced motion", () => {
    setMedia({ reducedMotion: true });
    expect(run("/en")).toBeUndefined();
  });
});
