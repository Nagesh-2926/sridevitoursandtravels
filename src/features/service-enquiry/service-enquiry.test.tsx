import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Logo } from "@/components/brand/Logo";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { serviceIds } from "@/config/services";
import { logoUrl, site } from "@/config/site";
import { en } from "@/i18n/dictionaries/en";
import { te } from "@/i18n/dictionaries/te";
import { setMedia } from "@/test/setup";
import {
  buildEnquiryMessage,
  formFields,
  kindForService,
  validateEnquiry,
  whatsappUrl,
} from "./schema";
import { ServiceModalProvider, type ServiceModalCopy } from "./ServiceModal";
import { ServiceModalTrigger } from "./ServiceModalTrigger";

const TODAY = "2026-11-04";
const copyFor = (dict: typeof en): ServiceModalCopy => ({
  enquiry: dict.enquiry,
  services: dict.services,
  a11y: dict.a11y,
  ready: dict.contact.form.ready,
});

beforeEach(() => window.localStorage.clear());
afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("enquiry kinds", () => {
  it("maps the four travel services to their own forms and the rest to digital", () => {
    expect(serviceIds.map(kindForService)).toEqual([
      "flight",
      "train",
      "bus",
      "darshanam",
      ...Array(10).fill("digital"),
    ]);
  });

  it("collects exactly the requested fields and no identity-document numbers", () => {
    const names = (k: keyof typeof formFields) => formFields[k].map((f) => f.name);
    expect(names("flight")).toEqual([
      "name",
      "email",
      "phone",
      "from",
      "to",
      "tripType",
      "departDate",
      "returnDate",
      "passengers",
      "notes",
    ]);
    expect(names("train")).toEqual([
      "name",
      "email",
      "phone",
      "fromStation",
      "toStation",
      "journeyDate",
      "travelClass",
      "passengers",
      "notes",
    ]);
    expect(names("bus")).toEqual([
      "name",
      "email",
      "phone",
      "busCategory",
      "boarding",
      "destination",
      "journeyDate",
      "passengers",
      "notes",
    ]);
    expect(names("darshanam")).toEqual([
      "name",
      "email",
      "phone",
      "temple",
      "preferredDate",
      "devotees",
      "assistance",
      "notes",
    ]);
    expect(names("digital")).toEqual([
      "name",
      "email",
      "phone",
      "digitalService",
      "requirement",
      "notes",
    ]);
    const all = Object.values(formFields)
      .flat()
      .map((f) => f.name.toLowerCase());
    expect(all.some((n) => /aadhaar|passportno|pannumber|upload|document/.test(n))).toBe(
      false,
    );
  });
});

describe("validateEnquiry", () => {
  const flight = {
    name: "Ravi",
    email: "ravi@example.com",
    phone: "+91 96662 70662",
    from: "Rajahmundry",
    to: "Dubai",
    tripType: "roundTrip",
    departDate: "2026-12-10",
    returnDate: "2026-12-20",
    passengers: "2",
    notes: "",
  };

  it("accepts a complete round trip and normalises the mobile number", () => {
    const result = validateEnquiry("flight", flight, TODAY);
    expect(result.ok && result.data.phone).toBe("9666270662");
  });

  it.each([
    [{ departDate: "2026-11-03" }, "departDate", "date"],
    [{ returnDate: "2026-12-01" }, "returnDate", "returnDate"],
    [{ returnDate: "" }, "returnDate", "required"],
    [{ passengers: "0" }, "passengers", "count"],
    [{ passengers: "21" }, "passengers", "count"],
    [{ phone: "12345" }, "phone", "phone"],
    [{ phone: "" }, "phone", "required"],
    [{ email: "invalid" }, "email", "email"],
    [{ to: "   " }, "to", "required"],
  ])("rejects %o with %s → %s", (patch, field, code) => {
    const result = validateEnquiry("flight", { ...flight, ...patch }, TODAY);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[field as keyof typeof result.errors]).toBe(code);
  });

  it("does not require a return date for one-way trips", () => {
    const { returnDate: _omit, ...oneWay } = flight;
    void _omit;
    expect(validateEnquiry("flight", { ...oneWay, tripType: "oneWay" }, TODAY).ok).toBe(
      true,
    );
  });

  it("allows a one-character name and an empty optional email", () => {
    const result = validateEnquiry(
      "digital",
      {
        name: "A",
        email: "",
        phone: "9347626862",
        digitalService: "passport",
        requirement: "X",
        notes: "",
      },
      TODAY,
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.email).toBe("");
  });

  it("only accepts digital services in the digital form", () => {
    const base = {
      name: "Sita",
      email: "sita@example.com",
      phone: "9347626862",
      requirement: "New PAN card for my father",
      notes: "",
    };
    expect(validateEnquiry("digital", { ...base, digitalService: "pan" }, TODAY).ok).toBe(
      true,
    );
    expect(
      validateEnquiry("digital", { ...base, digitalService: "flights" }, TODAY).ok,
    ).toBe(false);
  });
});

describe("buildEnquiryMessage", () => {
  it("writes a readable message in the visitor's language, never claiming a booking", () => {
    const result = validateEnquiry(
      "train",
      {
        name: "Lakshmi",
        email: "lakshmi@example.com",
        phone: "9347626862",
        fromStation: "Nidadavolu",
        toStation: "Chennai Central",
        journeyDate: "2026-12-01",
        travelClass: "ac3",
        passengers: "3",
        notes: "",
      },
      TODAY,
    );
    if (!result.ok) throw new Error("expected valid");
    const enText = buildEnquiryMessage("train", "trains", result.data, en);
    expect(enText.split("\n")).toEqual([
      "New enquiry: Train tickets",
      "",
      "Your name: Lakshmi",
      "Email address: lakshmi@example.com",
      "Mobile number: 9347626862",
      "From station: Nidadavolu",
      "To station: Chennai Central",
      "Journey date: 2026-12-01",
      "Class preference: AC 3 tier (3A)",
      "Passengers: 3",
      "",
      en.enquiry.message.disclaimer,
    ]);
    const teText = buildEnquiryMessage("train", "trains", result.data, te);
    expect(teText).toContain("కొత్త విచారణ: రైలు టికెట్లు");
    expect(teText).toContain("క్లాస్ ఎంపిక: AC 3 టైర్ (3A)");
    expect(enText + teText).not.toMatch(/confirmed|booked successfully|₹|price/i);
  });

  it("targets the confirmed WhatsApp number with an encoded message", () => {
    const url = whatsappUrl(site.whatsappE164, "Line 1\nLine & 2");
    expect(url).toBe("https://wa.me/919666270662?text=Line%201%0ALine%20%26%202");
  });
});

function renderWithModal(
  dict = en,
  serviceId: "flights" | "darshanam" | "passport" = "flights",
) {
  return render(
    <ServiceModalProvider copy={copyFor(dict)}>
      <ServiceModalTrigger
        serviceId={serviceId}
        href={`/en/contact?service=${serviceId}`}
      >
        Enquire about {serviceId}
      </ServiceModalTrigger>
      <main>page</main>
    </ServiceModalProvider>,
  );
}
function renderDraftModal() {
  return render(
    <ServiceModalProvider copy={copyFor(en)}>
      <ServiceModalTrigger serviceId="passport" href="/en/contact?service=passport">
        Open passport
      </ServiceModalTrigger>
      <ServiceModalTrigger serviceId="pan" href="/en/contact?service=pan">
        Open PAN
      </ServiceModalTrigger>
    </ServiceModalProvider>,
  );
}
const dialog = () => document.querySelector("dialog") as HTMLDialogElement;

describe("ServiceModal", () => {
  it("opens a labelled dialog for the clicked service instead of navigating", async () => {
    renderWithModal();
    const trigger = screen.getByRole("link", { name: /Enquire about flights/ });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await userEvent.click(trigger);
    expect(dialog().open).toBe(true);
    expect(dialog()).toHaveAccessibleName("Flight tickets enquiry");
    expect(within(dialog()).getByLabelText(/Departure city/)).toBeInTheDocument();
  });

  it("closes with the close button and restores focus to the trigger", async () => {
    const user = userEvent.setup();
    renderWithModal();
    const trigger = screen.getByRole("link", { name: /Enquire about flights/ });
    await user.click(trigger);
    await user.click(within(dialog()).getByRole("button", { name: en.enquiry.close }));
    expect(dialog().open).toBe(false);
    expect(trigger).toHaveFocus();
  });

  it("closes on Escape", async () => {
    renderWithModal();
    await userEvent.click(screen.getByRole("link", { name: /Enquire about flights/ }));
    fireEvent.keyDown(dialog(), { key: "Escape" });
    expect(dialog().open).toBe(false);
  });

  it("closes on a backdrop click but not on clicks inside the panel", async () => {
    renderWithModal();
    await userEvent.click(screen.getByRole("link", { name: /Enquire about flights/ }));
    fireEvent.click(within(dialog()).getByLabelText(/Departure city/));
    expect(dialog().open).toBe(true);
    fireEvent.click(dialog());
    expect(dialog().open).toBe(false);
  });

  it("keeps modified clicks as normal links (open in new tab)", async () => {
    renderWithModal();
    fireEvent.click(screen.getByRole("link", { name: /Enquire about flights/ }), {
      ctrlKey: true,
    });
    expect(dialog().open).toBe(false);
  });

  it("shows the return date only for round trips", async () => {
    const user = userEvent.setup();
    renderWithModal();
    await user.click(screen.getByRole("link", { name: /Enquire about flights/ }));
    expect(within(dialog()).queryByLabelText(/Return date/)).toBeNull();
    await user.click(within(dialog()).getByLabelText("Round trip"));
    expect(within(dialog()).getByLabelText(/Return date/)).toBeInTheDocument();
  });

  it("shows accessible validation errors and does not open WhatsApp", async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    renderWithModal(en, "darshanam");
    await user.click(screen.getByRole("link", { name: /Enquire about darshanam/ }));
    await user.click(within(dialog()).getByRole("button", { name: en.enquiry.submit }));
    expect(within(dialog()).getByRole("alert")).toHaveTextContent(en.enquiry.summary);
    expect(within(dialog()).getByLabelText(/Assistance needed/)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(open).not.toHaveBeenCalled();
  });

  it("sends a valid digital enquiry to WhatsApp, preselecting the clicked service, in Telugu", async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    renderWithModal(te, "passport");
    await user.click(screen.getByRole("link", { name: /Enquire about passport/ }));
    const panel = within(dialog());
    await waitFor(() => expect(panel.getByLabelText(/మీ పేరు/)).toBeEnabled());
    expect(dialog()).toHaveAccessibleName("పాస్‌పోర్ట్ దరఖాస్తులు విచారణ");
    expect(panel.getByLabelText(/కావలసిన సేవ/)).toHaveValue("passport");
    fireEvent.change(panel.getByLabelText(/మీ పేరు/), { target: { value: "సీత" } });
    fireEvent.change(panel.getByLabelText(/ఇమెయిల్ చిరునామా/), {
      target: { value: "sita@example.com" },
    });
    fireEvent.change(panel.getByLabelText(/మొబైల్ నంబర్/), {
      target: { value: "9347626862" },
    });
    fireEvent.change(panel.getByLabelText(/మీ అవసరం/), {
      target: { value: "కొత్త పాస్‌పోర్ట్ దరఖాస్తు" },
    });
    await user.click(panel.getByRole("button", { name: te.enquiry.submit }));

    expect(open).toHaveBeenCalledOnce();
    const url = decodeURIComponent((open.mock.calls[0] as [string])[0]);
    expect(url).toMatch(/^https:\/\/wa\.me\/919666270662\?text=/);
    expect(url).toContain("కావలసిన సేవ: పాస్‌పోర్ట్ దరఖాస్తులు");
    expect(panel.getByRole("status")).toHaveTextContent(te.contact.form.ready.title);
    expect(panel.getByRole("status")).not.toHaveTextContent(/confirmed|stored/i);
    expect(
      panel.getByRole("link", { name: te.contact.form.ready.emailFallback }),
    ).toHaveAttribute(
      "href",
      expect.stringContaining("mailto:sridevitravels1011@gmail.com"),
    );
    expect(
      panel.getByRole("link", {
        name: /జీమెయిల్/,
      }),
    ).toHaveAttribute("href", expect.stringContaining("https://mail.google.com/mail/"));
  });

  it("restores isolated service drafts after closing, switching services, and remounting", async () => {
    const user = userEvent.setup();
    const firstRender = renderDraftModal();

    await user.click(screen.getByRole("link", { name: "Open passport" }));
    let panel = within(dialog());
    await waitFor(() => expect(panel.getByLabelText(/Your name/)).toBeEnabled());
    fireEvent.change(panel.getByLabelText(/Your name/), { target: { value: "Ravi" } });
    fireEvent.change(panel.getByLabelText(/Mobile number/), {
      target: { value: "9347626862" },
    });
    fireEvent.change(panel.getByLabelText(/Your requirement/), {
      target: { value: "Passport renewal" },
    });
    await user.click(panel.getByRole("button", { name: en.enquiry.close }));

    await user.click(screen.getByRole("link", { name: "Open PAN" }));
    panel = within(dialog());
    await waitFor(() => expect(panel.getByLabelText(/Your name/)).toBeEnabled());
    fireEvent.change(panel.getByLabelText(/Your name/), { target: { value: "Sita" } });
    fireEvent.change(panel.getByLabelText(/Your requirement/), {
      target: { value: "New PAN card" },
    });
    await user.click(panel.getByRole("button", { name: en.enquiry.close }));

    await user.click(screen.getByRole("link", { name: "Open passport" }));
    panel = within(dialog());
    await waitFor(() => expect(panel.getByLabelText(/Your name/)).toHaveValue("Ravi"));
    expect(panel.getByLabelText(/Your requirement/)).toHaveValue("Passport renewal");
    expect(panel.getByLabelText(/Mobile number/)).toHaveValue("9347626862");
    await user.click(panel.getByRole("button", { name: en.enquiry.close }));

    firstRender.unmount();
    renderDraftModal();
    await user.click(screen.getByRole("link", { name: "Open PAN" }));
    panel = within(dialog());
    await waitFor(() => expect(panel.getByLabelText(/Your name/)).toHaveValue("Sita"));
    expect(panel.getByLabelText(/Your requirement/)).toHaveValue("New PAN card");
    expect(
      window.localStorage.getItem("sridevi:service-enquiry-draft:v1:passport"),
    ).not.toBeNull();
    expect(
      window.localStorage.getItem("sridevi:service-enquiry-draft:v1:pan"),
    ).not.toBeNull();
  });

  it("asks before clearing only the active service draft and resets that form", async () => {
    const user = userEvent.setup();
    renderDraftModal();
    window.localStorage.setItem(
      "sridevi:service-enquiry-draft:v1:pan",
      JSON.stringify({
        values: { name: "Sita" },
        lastActivityAt: Date.now(),
      }),
    );
    await user.click(screen.getByRole("link", { name: "Open passport" }));
    const panel = within(dialog());
    await waitFor(() => expect(panel.getByLabelText(/Your name/)).toBeEnabled());
    fireEvent.change(panel.getByLabelText(/Your name/), { target: { value: "Ravi" } });
    await user.click(panel.getByRole("button", { name: en.enquiry.draft.clearForm }));

    const confirmDialog = screen.getByRole("dialog", {
      name: en.enquiry.draft.clearTitle,
    });
    expect(confirmDialog).toHaveTextContent(en.enquiry.draft.clearBody);
    await user.click(
      within(confirmDialog).getByRole("button", {
        name: en.enquiry.draft.cancelClear,
      }),
    );
    expect(panel.getByLabelText(/Your name/)).toHaveValue("Ravi");

    await user.click(panel.getByRole("button", { name: en.enquiry.draft.clearForm }));
    await user.click(
      within(screen.getByRole("dialog", { name: en.enquiry.draft.clearTitle })).getByRole(
        "button",
        { name: en.enquiry.draft.confirmClear },
      ),
    );
    expect(panel.getByLabelText(/Your name/)).toHaveValue("");
    expect(panel.getByLabelText(/Service needed/)).toHaveValue("passport");
    expect(panel.getByText(en.enquiry.draft.cleared)).toBeInTheDocument();
    expect(
      window.localStorage.getItem("sridevi:service-enquiry-draft:v1:passport"),
    ).toBeNull();
    expect(
      window.localStorage.getItem("sridevi:service-enquiry-draft:v1:pan"),
    ).not.toBeNull();
  });

  it("clears the submitted service draft only after WhatsApp opens", async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(window, "open").mockReturnValue({} as Window);
    renderWithModal(en, "passport");
    await user.click(screen.getByRole("link", { name: /Enquire about passport/ }));
    const panel = within(dialog());
    await waitFor(() => expect(panel.getByLabelText(/Your name/)).toBeEnabled());
    fireEvent.change(panel.getByLabelText(/Your name/), { target: { value: "A" } });
    fireEvent.change(panel.getByLabelText(/Mobile number/), {
      target: { value: "9347626862" },
    });
    fireEvent.change(panel.getByLabelText(/Your requirement/), {
      target: { value: "X" },
    });
    await user.click(panel.getByRole("button", { name: en.enquiry.submit }));

    expect(open).toHaveBeenCalledOnce();
    expect(
      window.localStorage.getItem("sridevi:service-enquiry-draft:v1:passport"),
    ).toBeNull();
    expect(panel.getByRole("status")).toHaveTextContent(
      en.enquiry.draft.submissionCleared,
    );
  });

  it("retains a valid draft when the WhatsApp handoff is blocked", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "open").mockReturnValue(null);
    renderWithModal(en, "passport");
    await user.click(screen.getByRole("link", { name: /Enquire about passport/ }));
    const panel = within(dialog());
    await waitFor(() => expect(panel.getByLabelText(/Your name/)).toBeEnabled());
    fireEvent.change(panel.getByLabelText(/Your name/), { target: { value: "Ravi" } });
    fireEvent.change(panel.getByLabelText(/Mobile number/), {
      target: { value: "9347626862" },
    });
    fireEvent.change(panel.getByLabelText(/Your requirement/), {
      target: { value: "Passport help" },
    });
    await user.click(panel.getByRole("button", { name: en.enquiry.submit }));

    await waitFor(() =>
      expect(
        window.localStorage.getItem("sridevi:service-enquiry-draft:v1:passport"),
      ).not.toBeNull(),
    );
    expect(panel.getByRole("status")).toHaveTextContent(en.contact.form.ready.title);
    expect(panel.getByLabelText(/Your name/)).toHaveValue("Ravi");
  });
});

describe("header logo", () => {
  it("renders both official theme logos unmodified with their alt text", () => {
    render(<Logo alt="Sridevi Tours & Travels" sizes="9rem" />);
    const [light, dark] = screen.getAllByRole("img", { name: "Sridevi Tours & Travels" });
    for (const [img, logo] of [
      [light, site.logos.light],
      [dark, site.logos.dark],
    ] as const) {
      expect(img).toHaveAttribute("src", logoUrl(logo));
      expect(img).toHaveAttribute("width", String(logo.width));
      expect(img).toHaveAttribute("height", String(logo.height));
      expect(img.className).toMatch(/object-contain/);
      expect(img.className).not.toMatch(
        /filter|blend|invert|grayscale|hue|sepia|object-cover/,
      );
    }
  });

  it("has no decorative plaque, frame or background around the artwork", () => {
    const { container } = render(<Logo alt="logo" sizes="9rem" />);
    const wrapper = container.firstElementChild!;
    expect(wrapper).toHaveAttribute("data-logo", "theme-aware");
    expect(wrapper.className).not.toMatch(/bg-|ring-|shadow-|p-\d|border/);
  });
});

describe("reduced motion", () => {
  it("hero does not autoplay or offer a pause control when motion is reduced", () => {
    setMedia({ reducedMotion: true });
    render(
      <HeroCarousel
        locale="en"
        hero={en.hero}
        enquireHref="/en/contact"
        servicesHref="/en/services"
      />,
    );
    expect(screen.queryByRole("button", { name: en.hero.pause })).toBeNull();
    expect(screen.getByText(/Slide 2 of 3/, { selector: "[aria-live]" })).toHaveAttribute(
      "aria-live",
      "polite",
    );
  });
});
