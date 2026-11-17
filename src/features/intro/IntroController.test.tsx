import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  INTRO_COMPLETE_EVENT,
  INTRO_SEEN_KEY,
  type IntroCompleteDetail,
} from "./constants";
import { IntroController } from "./IntroController";

function renderIntro() {
  return render(
    <>
      <IntroController
        copy={{ regionLabel: "Welcome", skip: "Skip intro" }}
        logoAlt="Sridevi Tours & Travels"
        shellId="shell"
        mainId="main"
      />
      <div id="shell">
        <main id="main" tabIndex={-1}>
          Home
        </main>
      </div>
    </>,
  );
}

function captureCompletion() {
  const events: IntroCompleteDetail[] = [];
  const listener = (e: Event) =>
    events.push((e as CustomEvent<IntroCompleteDetail>).detail);
  window.addEventListener(INTRO_COMPLETE_EVENT, listener);
  return {
    events,
    stop: () => window.removeEventListener(INTRO_COMPLETE_EVENT, listener),
  };
}

beforeEach(() => {
  // jsdom never loads images; treat the logo as already decoded.
  vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
  vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(1672);
});
afterEach(() => vi.restoreAllMocks());

describe("IntroController", () => {
  it("renders nothing when the gate did not mark the intro pending", async () => {
    renderIntro();
    await act(async () => {});
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.getElementById("shell")).not.toHaveAttribute("inert");
  });

  it("plays, makes the page inert and focuses Skip", async () => {
    document.documentElement.dataset.intro = "pending";
    renderIntro();
    expect(screen.getByRole("dialog", { name: "Welcome" })).toBeInTheDocument();
    expect(document.getElementById("shell")).toHaveAttribute("inert");
    await vi.waitFor(() =>
      expect(document.documentElement.dataset.intro).toBe("playing"),
    );
    expect(screen.getByRole("button", { name: "Skip intro" })).toHaveFocus();
  });

  it("Skip ends immediately, restores the page and remembers the session", async () => {
    const { events, stop } = captureCompletion();
    document.documentElement.dataset.intro = "pending";
    renderIntro();
    await vi.waitFor(() =>
      expect(document.documentElement.dataset.intro).toBe("playing"),
    );

    await userEvent.click(screen.getByRole("button", { name: "Skip intro" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.documentElement.dataset.intro).toBeUndefined();
    expect(document.getElementById("shell")).not.toHaveAttribute("inert");
    expect(document.getElementById("main")).toHaveFocus();
    expect(sessionStorage.getItem(INTRO_SEEN_KEY)).toBe("1");
    expect(events).toEqual([expect.objectContaining({ reason: "skipped" })]);
    stop();
  });

  it("Escape also skips", async () => {
    document.documentElement.dataset.intro = "pending";
    renderIntro();
    await vi.waitFor(() =>
      expect(document.documentElement.dataset.intro).toBe("playing"),
    );
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("releases the page if unmounted mid-intro", async () => {
    document.documentElement.dataset.intro = "pending";
    const { unmount } = renderIntro();
    await vi.waitFor(() =>
      expect(document.documentElement.dataset.intro).toBe("playing"),
    );
    const shell = document.getElementById("shell")!;
    unmount();
    expect(shell).not.toHaveAttribute("inert");
  });

  it("completes on its own after the 5 s timeline (wall clock)", async () => {
    const { events, stop } = captureCompletion();
    document.documentElement.dataset.intro = "pending";
    renderIntro();

    await vi.waitFor(() => expect(events).toHaveLength(1), {
      timeout: 8000,
      interval: 50,
    });

    const [detail] = events;
    expect(detail.reason).toBe("complete");
    // The timeline itself is exactly 5000 ms (asserted in timeline.test.ts).
    // elapsedMs is measured from the timeline's true origin, so wall clock
    // can only exceed 5000 ms by frame granularity at the end.
    expect(detail.elapsedMs).toBeGreaterThanOrEqual(4950);
    expect(detail.elapsedMs).toBeLessThan(5300);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    console.info(`[intro] jsdom wall-clock: ${detail.elapsedMs?.toFixed(1)} ms`);
    stop();
  }, 10_000);
});

describe("IntroController asset failures", () => {
  it("still plays when the logo image fails to load (no hang behind loading)", async () => {
    vi.restoreAllMocks();
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(false);
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(0);
    document.documentElement.dataset.intro = "pending";
    renderIntro();
    const logo = document.querySelector('[data-intro-part="logo"] img')!;
    act(() => {
      logo.dispatchEvent(new Event("error"));
    });
    await vi.waitFor(() =>
      expect(document.documentElement.dataset.intro).toBe("playing"),
    );
  });

  it("releases the homepage immediately if the scene is broken", async () => {
    const { events, stop } = captureCompletion();
    document.documentElement.dataset.intro = "pending";
    renderIntro();
    // Simulate a failed/partial scene before the timeline is built.
    document.querySelector('[data-intro-part="train"]')!.remove();
    await vi.waitFor(() => expect(events).toHaveLength(1));
    expect(events[0].reason).toBe("error");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.getElementById("shell")).not.toHaveAttribute("inert");
    stop();
  });
});
