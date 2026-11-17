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
import { EnquiryForm } from "@/components/contact/EnquiryForm";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Field, Input } from "@/components/ui/Form";
import { en } from "@/i18n/dictionaries/en";
import { navigation } from "@/test/setup";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  navigation.pathname = "/en";
  navigation.search = "";
  vi.restoreAllMocks();
});
beforeEach(() => window.localStorage.clear());

describe("SiteHeader", () => {
  it("renders every primary link and marks the current page", () => {
    navigation.pathname = "/en/services";
    render(<SiteHeader locale="en" nav={en.nav} logoAlt="Sridevi Tours & Travels" />);
    const desktop = screen.getAllByRole("navigation", { name: en.nav.primaryLabel })[0];
    const links = within(desktop).getAllByRole("link");
    expect(links.map((l) => l.textContent)).toEqual([
      "Home",
      "Services",
      "About",
      "Location",
      "Contact",
    ]);
    expect(within(desktop).getByRole("link", { name: "Services" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("opens and closes the mobile menu from the keyboard", async () => {
    const user = userEvent.setup();
    render(<SiteHeader locale="en" nav={en.nav} logoAlt="Sridevi Tours & Travels" />);
    const toggle = screen.getByRole("button", { name: en.nav.openMenu });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    toggle.focus();
    await user.keyboard("{Enter}");
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    const dialog = document.getElementById("mobile-menu") as HTMLDialogElement;
    expect(dialog.open).toBe(true);

    await user.click(within(dialog).getByRole("button", { name: en.nav.closeMenu }));
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(dialog.open).toBe(false);
  });

  it("offers a click-to-call link with the primary number", () => {
    render(<SiteHeader locale="en" nav={en.nav} logoAlt="Sridevi Tours & Travels" />);
    const call = screen.getAllByRole("link", { name: /call us/i })[0];
    expect(call).toHaveAttribute("href", "tel:+919347626862");
  });

  it("omits the extra email action while keeping the mobile call link", async () => {
    const user = userEvent.setup();
    render(<SiteHeader locale="en" nav={en.nav} logoAlt="Sridevi Tours & Travels" />);
    expect(document.querySelector("header a[href^='mailto:']")).toBeNull();

    await user.click(screen.getByRole("button", { name: en.nav.openMenu }));
    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).queryByRole("link", { name: "sridevitravels1011@gmail.com" }),
    ).toBeNull();
    expect(within(dialog).getByRole("link", { name: /call us/i })).toHaveAttribute(
      "href",
      "tel:+919347626862",
    );
  });
});

describe("LanguageSwitcher", () => {
  it("links to the same page in the other language and marks the current one", () => {
    navigation.pathname = "/en/contact";
    render(<LanguageSwitcher locale="en" label="Language" />);
    expect(screen.getByRole("link", { name: "తెలుగు" })).toHaveAttribute(
      "href",
      "/te/contact",
    );
    expect(screen.getByRole("link", { name: "English" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });
});

describe("Field", () => {
  it("wires label, hint and error to the control", () => {
    render(
      <Field label="Mobile number" hint="10 digits" error="Invalid">
        {(control) => <Input {...control} />}
      </Field>,
    );
    const input = screen.getByLabelText("Mobile number");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("10 digits Invalid");
  });
});

describe("EnquiryForm", () => {
  const renderForm = () =>
    render(
      <EnquiryForm
        copy={en.contact.form}
        draftCopy={en.enquiry.draft}
        serviceCopy={en.services}
      />,
    );

  it("preselects the service from the URL", () => {
    navigation.search = "service=darshanam";
    renderForm();
    expect(screen.getByLabelText(/Service/)).toHaveValue("darshanam");
  });

  it("shows accessible errors instead of submitting invalid data", async () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    renderForm();
    await waitFor(() => expect(screen.getByLabelText(/Your name/)).toBeEnabled());
    await userEvent.click(screen.getByRole("button", { name: en.contact.form.submit }));

    expect(screen.getByRole("alert")).toHaveTextContent(en.contact.form.summary);
    expect(screen.getByLabelText(/Your name/)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText(en.contact.form.errors.phone)).toBeInTheDocument();
    expect(open).not.toHaveBeenCalled();
  });

  it("hands a valid enquiry to WhatsApp and retains it when the hand-off is blocked", async () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    renderForm();
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
    fireEvent.change(screen.getByLabelText(/Service/), { target: { value: "passport" } });
    await waitFor(() => expect(screen.getByLabelText(/Your name/)).toBeEnabled());
    fireEvent.change(screen.getByLabelText(/Your requirement/), {
      target: { value: "New passport for my son" },
    });
    fireEvent.click(screen.getByRole("button", { name: en.contact.form.submit }));

    expect(open).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(
        window.localStorage.getItem("sridevi:service-enquiry-draft:v1:passport"),
      ).not.toBeNull(),
    );
    const [url] = open.mock.calls[0] as [string];
    expect(url).toMatch(/^https:\/\/wa\.me\/919666270662\?text=/);
    expect(decodeURIComponent(url)).toContain("Passport applications");
    expect(decodeURIComponent(url)).toContain("Email: lakshmi@example.com");
    const mailto = screen.getByRole("link", {
      name: en.contact.form.ready.emailFallback,
    });
    expect(mailto).toHaveAttribute(
      "href",
      expect.stringContaining("mailto:sridevitravels1011@gmail.com"),
    );
    expect(decodeURIComponent(mailto.getAttribute("href")!)).toContain("Name: Lakshmi");
    const gmail = screen.getByRole("link", {
      name: en.contact.form.ready.gmailCompose,
    });
    expect(gmail).toHaveAttribute(
      "href",
      expect.stringContaining("https://mail.google.com/mail/"),
    );
    expect(decodeURIComponent(gmail.getAttribute("href")!)).toContain(
      "New passport for my son",
    );
    expect(screen.getByRole("status")).toHaveTextContent("Nothing has been sent yet");
  });

  it("accepts short required values and optional email, then clears only the submitted draft", async () => {
    const open = vi.spyOn(window, "open").mockReturnValue({} as Window);
    navigation.search = "service=passport";
    window.localStorage.setItem(
      "sridevi:service-enquiry-draft:v1:pan",
      JSON.stringify({
        values: { name: "Sita" },
        lastActivityAt: Date.now(),
      }),
    );
    renderForm();
    await waitFor(() => expect(screen.getByLabelText(/Your name/)).toBeEnabled());

    fireEvent.change(screen.getByLabelText(/Your name/), { target: { value: "A" } });
    fireEvent.change(screen.getByLabelText(/Mobile number/), {
      target: { value: "9347626862" },
    });
    fireEvent.change(screen.getByLabelText(/Your requirement/), {
      target: { value: "X" },
    });
    fireEvent.click(screen.getByRole("button", { name: en.contact.form.submit }));

    expect(open).toHaveBeenCalledOnce();
    expect(window.localStorage.getItem("sridevi:service-enquiry-draft:v1:passport")).toBe(
      null,
    );
    expect(window.localStorage.getItem("sridevi:service-enquiry-draft:v1:pan")).not.toBe(
      null,
    );
  });

  it("restores and explicitly clears only the selected contact-page service draft", async () => {
    navigation.search = "service=passport";
    window.localStorage.setItem(
      "sridevi:service-enquiry-draft:v1:pan",
      JSON.stringify({
        values: { name: "Sita" },
        lastActivityAt: Date.now(),
      }),
    );
    const firstRender = renderForm();
    await waitFor(() => expect(screen.getByLabelText(/Your name/)).toBeEnabled());
    fireEvent.change(screen.getByLabelText(/Your name/), { target: { value: "Ravi" } });
    fireEvent.change(screen.getByLabelText(/Mobile number/), {
      target: { value: "9347626862" },
    });
    fireEvent.change(screen.getByLabelText(/Your requirement/), {
      target: { value: "Passport renewal" },
    });
    await waitFor(() => expect(screen.getByText(en.enquiry.draft.saved)).toBeVisible());
    firstRender.unmount();

    renderForm();
    await waitFor(() => expect(screen.getByLabelText(/Your name/)).toHaveValue("Ravi"));
    expect(screen.getByLabelText(/Your requirement/)).toHaveValue("Passport renewal");
    fireEvent.click(screen.getByRole("button", { name: en.enquiry.draft.clearForm }));
    fireEvent.click(
      within(screen.getByRole("dialog", { name: en.enquiry.draft.clearTitle })).getByRole(
        "button",
        { name: en.enquiry.draft.confirmClear },
      ),
    );

    expect(screen.getByLabelText(/Your name/)).toHaveValue("");
    expect(screen.getByLabelText(/Service/)).toHaveValue("passport");
    expect(
      window.localStorage.getItem("sridevi:service-enquiry-draft:v1:passport"),
    ).toBeNull();
    expect(window.localStorage.getItem("sridevi:service-enquiry-draft:v1:pan")).not.toBe(
      null,
    );
  });

  it("rejects a malformed email address before opening WhatsApp", async () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    renderForm();
    await waitFor(() => expect(screen.getByLabelText(/Your name/)).toBeEnabled());
    fireEvent.change(screen.getByLabelText(/Your name/), {
      target: { value: "Lakshmi" },
    });
    fireEvent.change(screen.getByLabelText(/Email address/), {
      target: { value: "bad-address" },
    });
    fireEvent.change(screen.getByLabelText(/Mobile number/), {
      target: { value: "9347626862" },
    });
    fireEvent.change(screen.getByLabelText(/Service/), { target: { value: "passport" } });
    await waitFor(() => expect(screen.getByLabelText(/Your name/)).toBeEnabled());
    fireEvent.change(screen.getByLabelText(/Your requirement/), {
      target: { value: "New passport for my son" },
    });
    fireEvent.click(screen.getByRole("button", { name: en.contact.form.submit }));

    expect(screen.getByText(en.contact.form.errors.email)).toBeInTheDocument();
    expect(open).not.toHaveBeenCalled();
  });
});
