import type { gsap as GSAP } from "gsap";
import { INTRO_DURATION_S, INTRO_HANDOFF_AT, INTRO_PHASES } from "./constants";

/** Scene parts the timeline animates; each is marked data-intro-part="<name>". */
export const INTRO_PARTS = [
  "light",
  "globe",
  "plane",
  "trail",
  "track",
  "train",
  "road",
  "bus",
  "car",
  "logo",
  "rule",
] as const;

export type IntroElements = Record<(typeof INTRO_PARTS)[number] | "root", Element>;

/** Collects the scene parts inside `root`; returns null if any is missing. */
export function queryIntroElements(root: Element): IntroElements | null {
  const els: Partial<IntroElements> = { root };
  for (const part of INTRO_PARTS) {
    const el = root.querySelector(`[data-intro-part="${part}"]`);
    if (!el) return null;
    els[part] = el;
  }
  return els as IntroElements;
}

export type IntroTimelineOptions = {
  /** Phones, low-core devices, data saver: same timing, fewer effects. */
  lite?: boolean;
  onComplete?: () => void;
};

/**
 * The single master timeline for the intro. Every tween is placed at an
 * absolute position inside its storyboard phase, so the total duration is
 * deterministic: exactly INTRO_DURATION_S seconds regardless of device.
 * Vehicles travel left → right throughout, one consistent camera direction.
 * The timeline is returned paused; the controller decides when to play.
 */
export function buildIntroTimeline(
  gsap: typeof GSAP,
  els: IntroElements,
  { lite = false, onComplete }: IntroTimelineOptions = {},
) {
  const { globe, airplane, train, road, logo } = INTRO_PHASES;
  const tl = gsap.timeline({ paused: true, onComplete });
  for (const [name, [start]] of Object.entries(INTRO_PHASES)) tl.addLabel(name, start);

  // Start state: everything hidden except the dark stage. Vehicle fromTo
  // tweens use immediateRender: false so they only appear in their phase.
  tl.set(
    [els.globe, els.plane, els.track, els.train, els.road, els.bus, els.car, els.logo],
    // Render now, before the first tick, so no subject flashes in frame one.
    { autoAlpha: 0, immediateRender: true },
    0,
  );
  if (lite) tl.set(els.trail, { autoAlpha: 0 }, 0);

  // 0.0–1.0 · Globe: light rises, the globe resolves, golden routes draw.
  tl.fromTo(
    els.light,
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: 0.8, ease: "sine.out" },
    globe[0],
  );
  tl.fromTo(
    els.globe,
    { autoAlpha: 0, scale: 0.86, transformOrigin: "50% 50%" },
    { autoAlpha: 1, scale: 1, duration: 0.85, ease: "expo.out" },
    globe[0],
  );
  const routes = els.globe.querySelectorAll("path[pathLength]");
  if (routes.length) {
    tl.fromTo(
      routes,
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 0.65, stagger: 0.08, ease: "power2.inOut" },
      globe[0] + 0.2,
    );
  }
  // Camera pushes through the globe into the flight.
  tl.to(
    els.globe,
    { scale: 1.45, autoAlpha: 0, duration: 0.45, ease: "power2.in" },
    airplane[0] - 0.05,
  );

  // 1.0–2.0 · Airplane glides in, holds the frame, then climbs away.
  tl.fromTo(
    els.plane,
    { autoAlpha: 0, x: -1500, y: 60, rotation: 0 },
    {
      autoAlpha: 1,
      x: -40,
      y: 0,
      duration: 0.6,
      ease: "power3.out",
      immediateRender: false,
    },
    airplane[0],
  );
  tl.to(els.plane, { x: 140, y: -18, duration: 0.4, ease: "none" }, airplane[0] + 0.6);
  tl.to(
    els.plane,
    { x: 1600, y: -160, rotation: -6, autoAlpha: 0, duration: 0.3, ease: "power2.in" },
    train[0],
  );

  // 2.0–3.0 · Train runs in on its track and decelerates into frame.
  tl.fromTo(els.track, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, train[0]);
  tl.fromTo(
    els.train,
    { autoAlpha: 1, x: -2400 },
    { x: -560, duration: 0.85, ease: "power3.out", immediateRender: false },
    train[0],
  );
  tl.to(els.train, { x: -420, duration: 0.15, ease: "none" }, train[0] + 0.85);
  tl.to(
    [els.train, els.track],
    { autoAlpha: 0, duration: 0.25, ease: "power1.in" },
    road[0],
  );
  tl.to(els.train, { x: 900, duration: 0.25, ease: "power2.in" }, road[0]);

  // 3.0–4.0 · Coach and car together; the car in the near lane moves faster.
  tl.fromTo(els.road, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, road[0]);
  tl.fromTo(
    els.bus,
    { autoAlpha: 1, x: -1200 },
    { x: 80, duration: 0.9, ease: "power3.out", immediateRender: false },
    road[0] + 0.05,
  );
  tl.fromTo(
    els.car,
    { autoAlpha: 1, x: -900 },
    { x: 380, duration: 0.85, ease: "power3.out", immediateRender: false },
    road[0] + 0.15,
  );
  tl.to(
    [els.bus, els.car, els.road],
    { autoAlpha: 0, duration: 0.3, ease: "power1.in" },
    logo[0],
  );

  // 4.0–5.0 · Official logo comes into focus, then hands off to the homepage.
  tl.fromTo(
    els.logo,
    { autoAlpha: 0, scale: 0.94, y: 14, filter: lite ? "none" : "blur(6px)" },
    {
      autoAlpha: 1,
      scale: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 0.55,
      ease: "expo.out",
    },
    logo[0] + 0.05,
  );
  tl.fromTo(
    els.rule,
    { scaleX: 0 },
    { scaleX: 1, duration: INTRO_HANDOFF_AT - (logo[0] + 0.2), ease: "power3.out" },
    logo[0] + 0.2,
  );
  // This tween defines the end of the intro.
  tl.to(
    els.root,
    { autoAlpha: 0, duration: logo[1] - INTRO_HANDOFF_AT, ease: "power2.inOut" },
    INTRO_HANDOFF_AT,
  );

  if (Math.abs(tl.duration() - INTRO_DURATION_S) > 1e-6) {
    throw new Error(
      `Intro timeline is ${tl.duration()}s; expected ${INTRO_DURATION_S}s.`,
    );
  }
  return tl;
}
