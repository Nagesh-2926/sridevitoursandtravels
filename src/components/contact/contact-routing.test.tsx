import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ContactChannels } from "./ContactChannels";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { en } from "@/i18n/dictionaries/en";
import { te } from "@/i18n/dictionaries/te";
import { site } from "@/config/site";

describe.each([
  { locale: "en" as const, dict: en },
  { locale: "te" as const, dict: te },
])("$locale contact routing", ({ locale, dict }) => {
  it("lists the primary call before the dedicated WhatsApp channel", () => {
    render(<ContactChannels dict={dict} />);
    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "tel:+919347626862");
    expect(links[0]).toHaveTextContent("9347626862");
    expect(links[1]).toHaveAttribute("href", "https://wa.me/919666270662");
    expect(links[1]).toHaveTextContent("9666270662");
    expect(screen.getByRole("heading", { name: dict.contact.callLabel })).toBeVisible();
  });

  it("makes both the email icon and address open the official email compose action", () => {
    render(<ContactChannels dict={dict} />);
    const mailto = `mailto:${site.email}`;
    expect(screen.getByRole("link", { name: site.email })).toHaveAttribute(
      "href",
      mailto,
    );
    expect(
      screen.getByRole("link", { name: `${dict.contact.emailLabel}: ${site.email}` }),
    ).toHaveAttribute("href", mailto);
    const gmail = screen.getByRole("link", {
      name: new RegExp(dict.contact.gmailCompose),
    });
    expect(gmail).toHaveAttribute("href", expect.stringContaining(`to=${site.email}`));
    expect(gmail).toHaveAttribute("target", "_blank");
    expect(gmail).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("uses a consistent icon and content grid for every contact row", () => {
    const { container } = render(<ContactChannels dict={dict} />);
    const rows = [...container.querySelectorAll("[data-contact-row]")];
    expect(rows).toHaveLength(5);
    for (const row of rows) {
      expect(row.className).toContain("grid-cols-[2rem_minmax(0,1fr)]");
      expect(row.firstElementChild).toHaveClass("size-8");
      expect(row.lastElementChild).toHaveClass("min-w-0");
    }
  });
  it("labels both footer channels in the required order", () => {
    render(<SiteFooter locale={locale} dict={dict} />);
    const footer = screen.getByRole("contentinfo");
    const rows = [...footer.querySelectorAll("[data-contact-row]")];
    expect(rows).toHaveLength(5);
    for (const row of rows) {
      expect(row.className).toContain("grid-cols-[2rem_minmax(0,1fr)]");
      expect(row.firstElementChild).toHaveClass("size-8");
      expect(row.lastElementChild).toHaveClass("min-w-0");
    }
    const call = within(footer).getByRole("link", { name: "9347626862" });
    const whatsapp = screen.getByRole("link", {
      name: new RegExp(`${dict.contact.whatsappLabel} 9666270662`),
    });
    expect(call).toHaveAttribute("href", "tel:+919347626862");
    expect(whatsapp).toHaveAttribute("href", "https://wa.me/919666270662");
    expect(footer).toHaveTextContent(dict.contact.callLabel);
    expect(footer).toHaveTextContent(dict.contact.addressLabel);
    expect(footer).toHaveTextContent(dict.contact.hoursLabel);
    expect(footer).toHaveTextContent(
      "Main Road, Near Bus Stand, Chagallu – 534342",
    );
    expect(
      screen.getByRole("link", { name: `${dict.contact.emailLabel}: ${site.email}` }),
    ).toHaveAttribute("href", `mailto:${site.email}`);
    expect(
      within(footer).getByRole("link", { name: site.email }),
    ).toHaveAttribute("href", `mailto:${site.email}`);
    const gmail = within(footer).getByRole("link", {
      name: new RegExp(dict.contact.gmailCompose),
    });
    expect(gmail).toHaveAttribute(
      "href",
      expect.stringContaining(`to=${site.email}`),
    );
    expect(gmail).toHaveAttribute("target", "_blank");
    expect(gmail).toHaveAttribute("rel", "noopener noreferrer");
    expect(
      call.compareDocumentPosition(whatsapp) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
  it("routes desktop and mobile header calls to the primary number", async () => {
    const user = userEvent.setup();
    render(<SiteHeader locale={locale} nav={dict.nav} logoAlt={site.name} />);
    expect(screen.getAllByRole("link", { name: dict.nav.callUs })[0]).toHaveAttribute(
      "href",
      "tel:+919347626862",
    );
    await user.click(screen.getByRole("button", { name: dict.nav.openMenu }));
    const menu = screen.getByRole("dialog");
    expect(
      within(menu).getByRole("link", { name: new RegExp(dict.nav.callUs) }),
    ).toHaveAttribute("href", "tel:+919347626862");
    expect(menu.querySelector('a[href^="mailto:"]')).toBeNull();
  });
});
