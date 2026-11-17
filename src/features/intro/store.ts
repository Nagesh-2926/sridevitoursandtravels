/**
 * Intro state lives on <html data-intro> so the pre-paint gate script, CSS
 * and React all read the same value. React subscribes via
 * useSyncExternalStore; the server snapshot is "ssr".
 */
export type IntroState = "ssr" | "pending" | "playing" | "done";

const listeners = new Set<() => void>();

export function getIntroState(): IntroState {
  const value = document.documentElement.dataset.intro;
  return value === "pending" || value === "playing" ? value : "done";
}

export const getServerIntroState = (): IntroState => "ssr";

export function setIntroState(state: Exclude<IntroState, "ssr">) {
  const html = document.documentElement;
  if (state === "done") delete html.dataset.intro;
  else html.dataset.intro = state;
  listeners.forEach((listener) => listener());
}

export function subscribeIntro(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
