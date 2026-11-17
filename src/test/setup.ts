import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { createElement, type ImgHTMLAttributes } from "react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  delete document.documentElement.dataset.intro;
});

// jsdom has no matchMedia.
const mediaState = { reducedMotion: false, narrow: false };
export const setMedia = (next: Partial<typeof mediaState>) =>
  Object.assign(mediaState, next);
afterEach(() => setMedia({ reducedMotion: false, narrow: false }));

window.matchMedia = (query: string) =>
  ({
    matches:
      (query.includes("prefers-reduced-motion") && mediaState.reducedMotion) ||
      (query.includes("max-width") && mediaState.narrow),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList;

// jsdom lacks the modal dialog API; model only the open state.
HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
  this.removeAttribute("open");
  this.dispatchEvent(new Event("close"));
};

// next/image needs the Next runtime; a plain <img> is enough for unit tests.
vi.mock("next/image", () => ({
  default: (
    props: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean; fill?: boolean },
  ) => {
    const imgProps = { ...props };
    delete imgProps.priority;
    delete imgProps.fill;
    return createElement("img", imgProps);
  },
}));

export const navigation = { pathname: "/en", search: "" };
vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useSearchParams: () => new URLSearchParams(navigation.search),
  useParams: () => ({ lang: navigation.pathname.split("/")[1] }),
}));
