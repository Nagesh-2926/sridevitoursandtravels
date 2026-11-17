/**
 * The intro's visual timeline is exactly 5,000 ms. Asset loading happens
 * *before* the timeline starts and is not counted against this budget.
 */
export const INTRO_DURATION_MS = 5000;
export const INTRO_DURATION_S = INTRO_DURATION_MS / 1000;

/** Storyboard windows in seconds: [start, end). Must tile 0 → 5 with no gaps. */
export const INTRO_PHASES = {
  globe: [0, 1.0],
  airplane: [1.0, 2.0],
  train: [2.0, 3.0],
  road: [3.0, 4.0],
  logo: [4.0, 5.0],
} as const satisfies Record<string, readonly [number, number]>;

/** Within the logo phase, the overlay hands off to the homepage from here. */
export const INTRO_HANDOFF_AT = 4.6;

export type IntroPhase = keyof typeof INTRO_PHASES;

/** Max time to wait for critical assets before playing anyway. */
export const INTRO_PRELOAD_TIMEOUT_MS = 2500;
/** Grace period after the expected end before the safety net dismisses the intro. */
export const INTRO_SAFETY_MARGIN_MS = 1500;

/** Once per browser session; internal navigation never replays it. */
export const INTRO_SEEN_KEY = "sridevi:intro-seen";
export const INTRO_COMPLETE_EVENT = "sridevi:intro-complete";

export type IntroCompleteDetail = {
  reason: "complete" | "skipped" | "timeout" | "error";
  /** Wall-clock time from timeline start to completion, when it played. */
  elapsedMs: number | null;
  mode: "full" | "lite";
};
