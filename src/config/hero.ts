import type { MediaSlot } from "./media";

/**
 * Hero slide visuals. Copy comes from dict.hero.slides (same order).
 * Add `image` to a slot once licensed destination photography is supplied.
 */
export const heroSlides: readonly MediaSlot[] = [
  { plate: "dusk", scene: "flights" },
  { plate: "dawn", scene: "railRoad" },
  { plate: "gold", scene: "darshanam" },
];

export const HERO_AUTOPLAY_MS = 7000;
