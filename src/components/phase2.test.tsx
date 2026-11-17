import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContactChannels } from "@/components/contact/ContactChannels";
import { EnquiryForm } from "@/components/contact/EnquiryForm";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ServiceCard, ServiceFeatureCard } from "@/components/services/ServiceCard";
import { ServiceGrid } from "@/components/services/ServiceGrid";
import { Reveal } from "@/components/ui/Reveal";
import { servicesByCategory } from "@/config/services";
import { site } from "@/config/site";
import { buildEmailComposeLinks } from "@/features/enquiries/email";
import { ServiceDetailsModalProvider } from "@/features/service-details/ServiceDetailsModal";
import { en } from "@/i18n/dictionaries/en";
import { te } from "@/i18n/dictionaries/te";

beforeEach(() => window.localStorage.clear());
afterEach(() => vi.restoreAllMocks());

const cardProps = {
  title: "Flight tickets",
  summary: "Domestic and international flight booking assistance.",
  href: "/en/contact?service=flights",
  cta: "Enquire",
  icon: "plane" as const,
  serviceId: "passport" as const,
  index: 1,
};

describe("service cards", () => {
  it("opens service information in a modal without expanding the card", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ServiceDetailsModalProvider
        locale="en"
        copy={en.services}
        closeLabel={en.enquiry.close}
      >
        <ServiceCard
          title={en.services.items.passport.title}
          summary={en.services.items.passport.summary}
          icon="passport"
          serviceId="passport"
          detailsLabel={en.services.detailsLabel}
        />
      </ServiceDetailsModalProvider>,
    );
    const card = container.querySelector("article")!;
    const originalHeight = card.getBoundingClientRect().height;
    await user.click(screen.getByRole("button", { name: "View service details" }));
    expect(screen.getByRole("dialog")).toHaveAttribute("data-service-id", "passport");
    expect(
      screen.getByRole("heading", { level: 2, name: "Passport applications" }),
    ).toBeInTheDocument();
    expect(card.querySelector("ul")).toBeNull();
    expect(card.querySelector("details")).toBeNull();
    expect(card.getBoundingClientRect().height).toBe(originalHeight);
  });

  it("feature card remains a single link to the enquiry", () => {
    render(<ServiceFeatureCard {...cardProps} media={{ plate: "dusk" }} locale="en" />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", cardProps.href);
    expect(links[0]).toHaveAccessibleName(/Enquire.*Flight tickets/);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Flight tickets");
  });

  it("feature card plate fills the card (no conflicting position classes)", () => {
    const { container } = render(
      <ServiceFeatureCard {...cardProps} media={{ plate: "gold" }} locale="en" />,
    );
    const plate = container.querySelector(".plate-gold")!;
    expect(plate.classList).toContain("absolute");
    expect(plate.classList).toContain("inset-0");
    expect(plate.classList).not.toContain("relative");
  });

  it("feature card renders its photography slot when an image is supplied", () => {
    render(
      <ServiceFeatureCard
        {...cardProps}
        locale="te"
        media={{
          plate: "dusk",
          image: { src: "/x.jpg", alt: { en: "Plane", te: "విమానం" } },
        }}
      />,
    );
    expect(screen.getByRole("img", { name: "విమానం" })).toHaveAttribute("src", "/x.jpg");
  });

  it("marks assistance-only services and never shows prices", () => {
    const { container } = render(
      <ServiceGrid
        locale="en"
        services={servicesByCategory("digital")}
        dict={en.services}
      />,
    );
    expect(screen.getAllByText(en.services.assistanceBadge).length).toBeGreaterThan(0);
    expect(container.textContent).not.toMatch(/₹|rs\.?\s?\d|price/i);
    expect(screen.getAllByRole("button", { name: /View service details/ })).toHaveLength(
      10,
    );
  });

  it("travel grid uses one shared card layout and links every enquiry", () => {
    const { container } = render(
      <ServiceGrid
        locale="te"
        services={servicesByCategory("travel")}
        dict={te.services}
        variant="feature"
      />,
    );
    const expected = [
      "/te/contact?service=flights",
      "/te/contact?service=trains",
      "/te/contact?service=buses",
      "/te/contact?service=darshanam",
    ];
    const cards = container.querySelectorAll("[data-travel-ticket-card]");
    expect(cards).toHaveLength(4);
    expect(
      [...cards].map((card) => card.querySelector("a")?.getAttribute("href")),
    ).toEqual(expected);
    expect(container.querySelectorAll('[class~="light:hidden"]')).toHaveLength(0);
  });
});

describe("Reveal", () => {
  it("marks content revealed once it intersects", () => {
    let trigger: (entries: Array<{ isIntersecting: boolean }>) => void = () => {};
    const observe = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: typeof trigger) {
          trigger = cb;
        }
        observe = observe;
        disconnect = vi.fn();
      },
    );
    render(<Reveal>Content</Reveal>);
    const el = screen.getByText("Content");
    expect(el).toHaveAttribute("data-reveal");
    expect(el).not.toHaveAttribute("data-revealed");
    act(() => trigger([{ isIntersecting: true }]));
    expect(el).toHaveAttribute("data-revealed");
    vi.unstubAllGlobals();
  });

  it("shows content immediately without IntersectionObserver", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    // `in` check: remove the key entirely.
    delete (window as { IntersectionObserver?: unknown }).IntersectionObserver;
    render(<Reveal>Content</Reveal>);
    expect(screen.getByText("Content")).toHaveAttribute("data-revealed");
    vi.unstubAllGlobals();
  });
});

describe("HeroCarousel", () => {
  const renderHero = () =>
    render(
      <HeroCarousel
        locale="en"
        hero={en.hero}
        enquireHref="/en/contact"
        servicesHref="/en/services"
      />,
    );

  it("preview cards and indicators switch the visible slide", async () => {
    const { container } = renderHero();
    const slides = [...container.querySelectorAll('[aria-roledescription="slide"]')];
    expect(slides).toHaveLength(3);
    // Opens on slide 02 ("Across India by rail and road"), per the reference.
    expect(slides[1]).toHaveAttribute("aria-hidden", "false");
    for (const button of screen.getAllByRole("button", { name: "Show slide 2" })) {
      expect(button).toHaveAttribute("aria-current", "true");
    }

    const toFirst = screen.getAllByRole("button", { name: "Show slide 1" });
    expect(toFirst).toHaveLength(2); // desktop preview card + mobile indicator
    await userEvent.click(toFirst[0]);

    expect(slides[0]).toHaveAttribute("aria-hidden", "false");
    expect(slides[1]).toHaveAttribute("aria-hidden", "true");
    for (const button of screen.getAllByRole("button", { name: "Show slide 1" })) {
      expect(button).toHaveAttribute("aria-current", "true");
    }
  });

  it("hides slide text that is not current from assistive tech and keyboard", () => {
    const { container } = renderHero();
    const slides = [...container.querySelectorAll('[aria-roledescription="slide"]')];
    expect(slides[1]).not.toHaveAttribute("inert");
    for (const slide of [slides[0], slides[2]]) expect(slide).toHaveAttribute("inert");
  });

  it("keeps the primary enquiry action", () => {
    renderHero();
    expect(screen.getByRole("link", { name: en.hero.enquire })).toHaveAttribute(
      "href",
      "/en/contact",
    );
  });
});

describe("ContactChannels", () => {
  it("lists both numbers, WhatsApp and the official map link", () => {
    render(<ContactChannels dict={en} />);
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    const emailLinks = buildEmailComposeLinks("");
    expect(hrefs).toEqual([
      "tel:+919347626862",
      "https://wa.me/919666270662",
      `mailto:${site.email}`,
      `mailto:${site.email}`,
      emailLinks.gmail,
      site.mapsUrl,
    ]);
    expect(screen.getByText(/Main Road, Near Bus Stand/)).toBeInTheDocument();
    expect(screen.getByText(en.location.hoursValue)).toBeInTheDocument();
  });

  it("opens external links safely in a new tab", () => {
    render(<ContactChannels dict={en} />);
    for (const link of screen
      .getAllByRole("link")
      .filter((a) => a.getAttribute("target"))) {
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });
});

describe("EnquiryForm ready state", () => {
  it("confirms the WhatsApp hand-off honestly and offers a fallback link", async () => {
    vi.spyOn(window, "open").mockReturnValue(null);
    render(
      <EnquiryForm
        copy={en.contact.form}
        draftCopy={en.enquiry.draft}
        serviceCopy={en.services}
      />,
    );

    await waitFor(() => expect(screen.getByLabelText(/Your name/)).toBeEnabled());
    fireEvent.change(screen.getByLabelText(/Your name/), {
      target: { value: "Lakshmi" },
    });
    fireEvent.change(screen.getByLabelText(/Email address/), {
      target: { value: "lakshmi@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Mobile number/), {
      target: { value: "9347626862" },
    });
    fireEvent.change(screen.getByLabelText(/Service/), { target: { value: "flights" } });
    await waitFor(() => expect(screen.getByLabelText(/Your name/)).toBeEnabled());
    fireEvent.change(screen.getByLabelText(/Your requirement/), {
      target: { value: "Hyderabad to Dubai in May" },
    });
    fireEvent.click(screen.getByRole("button", { name: en.contact.form.submit }));

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(en.contact.form.ready.title);
    expect(status).toHaveTextContent(/not a booking/);
    expect(status).not.toHaveTextContent(/confirmed|saved|stored/i);
    expect(
      within(status).getByRole("link", {
        name: en.contact.form.ready.fallback,
      }),
    ).toHaveAttribute(
      "href",
      expect.stringMatching(/^https:\/\/wa\.me\/919666270662\?text=/),
    );
  });
});

describe("SiteHeader focus management", () => {
  it("returns focus to the menu button when the menu closes", async () => {
    const user = userEvent.setup();
    render(<SiteHeader locale="en" nav={en.nav} logoAlt="Sridevi Tours & Travels" />);
    const toggle = screen.getByRole("button", { name: en.nav.openMenu });
    await user.click(toggle);
    const dialog = document.getElementById("mobile-menu") as HTMLDialogElement;
    await user.click(within(dialog).getByRole("button", { name: en.nav.closeMenu }));
    expect(toggle).toHaveFocus();
  });
});
