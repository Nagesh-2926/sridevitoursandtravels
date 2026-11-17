"use client";

import { gsap } from "gsap";
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import {
  INTRO_COMPLETE_EVENT,
  INTRO_DURATION_MS,
  INTRO_PRELOAD_TIMEOUT_MS,
  INTRO_SAFETY_MARGIN_MS,
  INTRO_SEEN_KEY,
  type IntroCompleteDetail,
} from "./constants";
import { resolveIntroMode } from "./gate";
import { IntroCinematicScene } from "./IntroCinematicScene";
import {
  getIntroState,
  getServerIntroState,
  setIntroState,
  subscribeIntro,
} from "./store";
import { buildIntroTimeline, queryIntroElements } from "./timeline";

type Props = {
  copy: { regionLabel: string; skip: string };
  logoAlt: string;
  /** Element id of the page shell made inert while the intro plays. */
  shellId: string;
  /** Element id that receives focus when the intro ends. */
  mainId: string;
};

function waitForImage(img: HTMLImageElement | null, timeoutMs: number) {
  if (!img) return Promise.resolve();
  const ready =
    img.complete && img.naturalWidth > 0
      ? Promise.resolve()
      : new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        });
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, timeoutMs));
  return Promise.race([ready, timeout]);
}

function markSeen() {
  try {
    sessionStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    // Storage blocked: the intro may replay next visit, which is acceptable.
  }
}

export function IntroController({ copy, logoAlt, shellId, mainId }: Props) {
  const state = useSyncExternalStore(subscribeIntro, getIntroState, getServerIntroState);
  const active = state === "pending" || state === "playing";

  const rootRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const finishRef = useRef<(reason: IntroCompleteDetail["reason"]) => void>(() => {});

  useEffect(() => {
    if (!active) return;

    const shell = document.getElementById(shellId);
    shell?.setAttribute("inert", "");

    const mode = resolveIntroMode({
      narrowViewport: window.matchMedia("(max-width: 767px)").matches,
      hardwareConcurrency: navigator.hardwareConcurrency,
      saveData: (navigator as Navigator & { connection?: { saveData?: boolean } })
        .connection?.saveData,
    });

    let disposed = false;
    let startedAt: number | null = null;
    let timeline: gsap.core.Timeline | null = null;
    let safety = 0;

    const finish = (reason: IntroCompleteDetail["reason"]) => {
      if (disposed) return;
      disposed = true;
      timeline?.kill();
      window.clearTimeout(safety);
      shell?.removeAttribute("inert");
      markSeen();
      const hadFocus = rootRef.current?.contains(document.activeElement) ?? false;
      setIntroState("done");
      if (hadFocus) document.getElementById(mainId)?.focus({ preventScroll: true });
      const detail: IntroCompleteDetail = {
        reason,
        elapsedMs: startedAt === null ? null : performance.now() - startedAt,
        mode,
      };
      window.dispatchEvent(new CustomEvent(INTRO_COMPLETE_EVENT, { detail }));
    };
    finishRef.current = finish;

    // Never trap visitors: dismiss if anything stalls (hidden tab, slow asset, bug).
    safety = window.setTimeout(
      () => finish("timeout"),
      INTRO_PRELOAD_TIMEOUT_MS + INTRO_DURATION_MS + INTRO_SAFETY_MARGIN_MS,
    );

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish("skipped");
    };
    window.addEventListener("keydown", onKey);

    // Loading is kept outside the 5 s visual budget.
    void waitForImage(
      rootRef.current?.querySelector<HTMLImageElement>('[data-intro-part="logo"] img') ??
        null,
      INTRO_PRELOAD_TIMEOUT_MS,
    ).then(() => {
      if (disposed) return;
      const els = rootRef.current && queryIntroElements(rootRef.current);
      if (!els) return finish("error");
      try {
        timeline = buildIntroTimeline(gsap, els, {
          lite: mode === "lite",
          onComplete: () => finish("complete"),
        });
      } catch {
        return finish("error");
      }
      const tl = timeline;
      // GSAP anchors a timeline to the previous ticker frame, so measure its
      // real origin on the first rendered frame: now − time already elapsed.
      tl.eventCallback("onStart", () => {
        startedAt = performance.now() - tl.time() * 1000;
      });
      setIntroState("playing");
      skipRef.current?.focus({ preventScroll: true });
      startedAt = performance.now();
      tl.play(0);
    });

    return () => {
      window.removeEventListener("keydown", onKey);
      if (!disposed) {
        // Unmounted mid-intro (e.g. dev Strict Mode): release everything.
        disposed = true;
        timeline?.kill();
        window.clearTimeout(safety);
        shell?.removeAttribute("inert");
      }
    };
  }, [active, shellId, mainId]);

  const skip = useCallback(() => finishRef.current("skipped"), []);

  if (state === "done") return null;

  return (
    <div
      ref={rootRef}
      role="dialog"
      data-theme="dark"
      aria-modal="true"
      aria-label={copy.regionLabel}
      className="intro-root grain fixed inset-0 z-[100] overflow-hidden bg-charcoal"
      data-testid="intro"
    >
      <IntroCinematicScene logoAlt={logoAlt} />
      <button
        ref={skipRef}
        type="button"
        onClick={skip}
        className="absolute right-5 bottom-5 z-10 rounded-full border border-gold/40 px-5 py-2.5 text-sm tracking-wide text-white/85 backdrop-blur-sm transition-colors duration-(--duration-base) hover:border-gold hover:text-white sm:right-8 sm:bottom-8"
      >
        {copy.skip}
      </button>
    </div>
  );
}
