import { gsap } from "gsap";
import { describe, expect, it, vi } from "vitest";
import { INTRO_DURATION_MS, INTRO_DURATION_S, INTRO_PHASES } from "./constants";
import { buildIntroTimeline, INTRO_PARTS, queryIntroElements } from "./timeline";

function makeScene() {
  const root = document.createElement("div");
  for (const part of INTRO_PARTS) {
    const el = document.createElement("div");
    el.dataset.introPart = part;
    root.append(el);
  }
  document.body.append(root);
  const els = queryIntroElements(root);
  if (!els) throw new Error("scene incomplete");
  return els;
}

describe("intro storyboard", () => {
  it("phases tile 0 → 5 s contiguously", () => {
    const windows = Object.values(INTRO_PHASES);
    expect(windows[0][0]).toBe(0);
    for (let i = 1; i < windows.length; i++)
      expect(windows[i][0]).toBe(windows[i - 1][1]);
    expect(windows.at(-1)?.[1]).toBe(INTRO_DURATION_S);
    expect(INTRO_DURATION_MS).toBe(5000);
  });
});

describe("buildIntroTimeline", () => {
  it.each([false, true])("is exactly 5.000 s long (lite=%s)", (lite) => {
    const tl = buildIntroTimeline(gsap, makeScene(), { lite });
    expect(tl.duration()).toBeCloseTo(INTRO_DURATION_S, 9);
    expect(tl.paused()).toBe(true);
    tl.kill();
  });

  it("places a label at the start of each storyboard phase", () => {
    const tl = buildIntroTimeline(gsap, makeScene());
    for (const [name, [start]] of Object.entries(INTRO_PHASES)) {
      expect(tl.labels[name]).toBeCloseTo(start, 9);
    }
    tl.kill();
  });

  it("starts no tween before 0 s and ends no tween after 5 s", () => {
    const tl = buildIntroTimeline(gsap, makeScene());
    for (const child of tl.getChildren(true, true, true)) {
      expect(child.startTime()).toBeGreaterThanOrEqual(0);
      expect(child.endTime()).toBeLessThanOrEqual(INTRO_DURATION_S + 1e-9);
    }
    tl.kill();
  });

  it("fires onComplete when the playhead reaches the end", () => {
    const onComplete = vi.fn();
    const tl = buildIntroTimeline(gsap, makeScene(), { onComplete });
    tl.progress(1);
    expect(onComplete).toHaveBeenCalledOnce();
    tl.kill();
  });

  it("hides the overlay root at the end of the handoff", () => {
    const els = makeScene();
    const tl = buildIntroTimeline(gsap, els);
    tl.progress(1);
    expect((els.root as HTMLElement).style.visibility).toBe("hidden");
    tl.kill();
  });

  it("reports missing scene parts instead of animating a partial scene", () => {
    const root = document.createElement("div");
    expect(queryIntroElements(root)).toBeNull();
  });
});

describe("five-second storyboard content", () => {
  const visible = (el: Element) =>
    getComputedStyle(el).visibility !== "hidden" &&
    Number((el as HTMLElement).style.opacity || "1") > 0.5;

  it.each([
    ["globe", 0.6, ["globe"]],
    ["airplane", 1.5, ["plane"]],
    ["train", 2.6, ["train", "track"]],
    ["bus and car", 3.6, ["bus", "car", "road"]],
    ["official logo", 4.55, ["logo"]],
  ] as const)("shows the %s at %ss", (_, at, parts) => {
    const els = makeScene();
    const tl = buildIntroTimeline(gsap, els);
    tl.seek(at);
    for (const part of parts) expect(visible(els[part]), `${part} at ${at}s`).toBe(true);
    tl.kill();
  });

  it("introduces all six subjects within 5 s, each inside its own phase", () => {
    const els = makeScene();
    const tl = buildIntroTimeline(gsap, els);
    const firstVisible: Record<string, number> = {};
    for (let t = 0; t <= INTRO_DURATION_S; t += 0.05) {
      tl.seek(t);
      for (const part of ["globe", "plane", "train", "bus", "car", "logo"] as const) {
        if (firstVisible[part] === undefined && visible(els[part]))
          firstVisible[part] = t;
      }
    }
    expect(firstVisible.globe).toBeLessThan(INTRO_PHASES.globe[1]);
    expect(firstVisible.plane).toBeGreaterThanOrEqual(INTRO_PHASES.airplane[0] - 1e-9);
    expect(firstVisible.plane).toBeLessThan(INTRO_PHASES.airplane[1]);
    expect(firstVisible.train).toBeGreaterThanOrEqual(INTRO_PHASES.train[0] - 1e-9);
    expect(firstVisible.train).toBeLessThan(INTRO_PHASES.train[1]);
    for (const part of ["bus", "car"] as const) {
      expect(firstVisible[part]).toBeGreaterThanOrEqual(INTRO_PHASES.road[0] - 1e-9);
      expect(firstVisible[part]).toBeLessThan(INTRO_PHASES.road[1]);
    }
    expect(firstVisible.logo).toBeGreaterThanOrEqual(INTRO_PHASES.logo[0] - 1e-9);
    expect(firstVisible.logo).toBeLessThan(INTRO_PHASES.logo[1]);
    tl.kill();
  });

  it("lite mode keeps the identical 5.000 s duration and hides the light trail", () => {
    const els = makeScene();
    const tl = buildIntroTimeline(gsap, els, { lite: true });
    expect(tl.duration()).toBe(INTRO_DURATION_S);
    tl.seek(1.5);
    expect(visible(els.trail)).toBe(false);
    tl.kill();
  });
});
