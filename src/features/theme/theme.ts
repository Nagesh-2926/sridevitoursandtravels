import { colors } from "@/design/tokens";

/**
 * Two themes. Light is the default for new visitors (Phase 03.2); dark is
 * used after an explicit choice, which is remembered in localStorage and
 * respected on every return visit. The OS colour-scheme preference is
 * intentionally not consulted.
 */
export type Theme = "dark" | "light";
export const THEME_KEY = "sridevi:theme";
export const DEFAULT_THEME: Theme = "light";

export const isTheme = (value: unknown): value is Theme =>
  value === "dark" || value === "light";

/** Browser chrome colour per theme (<meta name="theme-color">). */
export const themeColors: Record<Theme, string> = {
  dark: colors.midnight,
  light: "#FFFFFF",
};

/**
 * Inline <head> script: applies a saved theme before first paint so there
 * is no flash of the wrong theme. Without a saved choice it does nothing
 * and the CSS default (light) applies. Blocked storage fails safe to light.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_KEY,
)});if(t==="light"||t==="dark"){var d=document.documentElement;d.dataset.theme=t;d.style.colorScheme=t;document.addEventListener("DOMContentLoaded",function(){var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",t==="dark"?${JSON.stringify(
  themeColors.dark,
)}:${JSON.stringify(themeColors.light)})})}}catch(e){}})();`;

const listeners = new Set<() => void>();

export function getTheme(): Theme {
  const value = document.documentElement.dataset.theme;
  return isTheme(value) ? value : DEFAULT_THEME;
}

export const getServerTheme = (): Theme => DEFAULT_THEME;

export function setTheme(theme: Theme) {
  const html = document.documentElement;
  html.dataset.theme = theme;
  html.style.colorScheme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", themeColors[theme]);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage blocked: the choice lasts for this page view only.
  }
  listeners.forEach((listener) => listener());
}

export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
