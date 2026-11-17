import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { en } from "@/i18n/dictionaries/en";

describe("reference homepage hero", () => {
  it("opens on rail and road, has no playback control, and announces manual selection", () => {
    const { container } = render(
      <HeroCarousel
        locale="en"
        hero={en.hero}
        enquireHref="/en/contact"
        servicesHref="/en/services"
      />,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Every station, every highway.",
    );
    expect(screen.queryByRole("button", { name: /pause|play/i })).not.toBeInTheDocument();
    expect(
      container.querySelector('[data-hero-art="reference-day-night"]'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Show slide 3" })[0]);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Darshan, arranged with devotion.",
    );
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(
      "Slide 3 of 3",
    );
  });
});
