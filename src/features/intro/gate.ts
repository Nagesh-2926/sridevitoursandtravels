import { locales } from "@/i18n/config";
import { INTRO_SEEN_KEY } from "./constants";

export const HOME_PATH_PATTERN = new RegExp(`^/(${locales.join("|")})/?$`);

export type IntroGateInput = {
  pathname: string;
  seen: boolean;
  reducedMotion: boolean;
};

/** Whether the intro should play at all. Mirrors `introGateScript`. */
export function shouldPlayIntro({
  pathname,
  seen,
  reducedMotion,
}: IntroGateInput): boolean {
  return HOME_PATH_PATTERN.test(pathname) && !seen && !reducedMotion;
}

export type IntroDevice = {
  narrowViewport: boolean;
  hardwareConcurrency?: number;
  saveData?: boolean;
};

/** Lighter scene for phones, low-core devices and data-saver users. */
export function resolveIntroMode({
  narrowViewport,
  hardwareConcurrency,
  saveData,
}: IntroDevice): "full" | "lite" {
  if (saveData) return "lite";
  if (narrowViewport) return "lite";
  if (hardwareConcurrency !== undefined && hardwareConcurrency <= 4) return "lite";
  return "full";
}

/**
 * Inline <head> script. Runs before first paint so the overlay is shown from
 * frame one when (and only when) the intro will play. Any failure — e.g.
 * blocked storage — leaves the homepage fully accessible.
 */
export const introGateScript = `(function(){try{var d=document.documentElement;if(!${HOME_PATH_PATTERN}.test(location.pathname))return;if(sessionStorage.getItem(${JSON.stringify(
  INTRO_SEEN_KEY,
)}))return;if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;d.dataset.intro="pending"}catch(e){}})();`;
