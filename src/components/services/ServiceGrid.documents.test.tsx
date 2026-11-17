import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { requirementsFor } from "@/config/service-details";
import { servicesByCategory } from "@/config/services";
import { ServiceDetailsModalProvider } from "@/features/service-details/ServiceDetailsModal";
import {
  ServiceModalProvider,
  type ServiceModalCopy,
} from "@/features/service-enquiry/ServiceModal";
import { en } from "@/i18n/dictionaries/en";
import { te } from "@/i18n/dictionaries/te";
import { ServiceGrid } from "./ServiceGrid";

function renderGrid(locale: "en" | "te" = "en") {
  const dict = locale === "en" ? en : te;
  const copy: ServiceModalCopy = {
    enquiry: dict.enquiry,
    services: dict.services,
    a11y: dict.a11y,
    ready: dict.contact.form.ready,
  };
  return render(
    <ServiceModalProvider copy={copy}>
      <ServiceDetailsModalProvider
        locale={locale}
        copy={dict.services}
        closeLabel={dict.enquiry.close}
      >
        <ServiceGrid
          locale={locale}
          services={servicesByCategory("digital")}
          dict={dict.services}
        />
      </ServiceDetailsModalProvider>
    </ServiceModalProvider>,
  );
}

describe("digital service details modal", () => {
  it("keeps all cards compact and opens each service's complete localized details", async () => {
    const user = userEvent.setup();
    const { container } = renderGrid();
    const cards = container.querySelectorAll("article");
    expect(cards).toHaveLength(10);
    expect(container.querySelectorAll("details")).toHaveLength(0);

    for (const service of servicesByCategory("digital")) {
      const card = cards[servicesByCategory("digital").indexOf(service)];
      const button = within(card).getByRole("button", {
        name: /View service details/,
      });
      await user.click(button);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("data-service-id", service.id);
      expect(
        within(dialog).getByRole("heading", {
          level: 2,
          name: en.services.items[service.id].title,
        }),
      ).toBeInTheDocument();
      expect(
        within(dialog).getByText(en.services.items[service.id].summary),
      ).toBeInTheDocument();
      expect(
        Array.from(dialog.querySelectorAll("li")).map((item) => item.textContent),
      ).toEqual(requirementsFor(service.id, "en"));
      expect(card.querySelector("ul")).toBeNull();

      await user.click(within(dialog).getByRole("button", { name: en.enquiry.close }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    }
  });

  it("shows the correct PAN details and closes from Escape or a backdrop click", async () => {
    const user = userEvent.setup();
    const { container } = renderGrid();
    const pan = container.querySelector<HTMLElement>('[data-service-id="pan"]')!;
    await user.click(within(pan).getByRole("button", { name: /View service details/ }));
    let dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("data-service-id", "pan");
    expect(
      within(dialog).getByText("Voter ID or Ration Card", { exact: false }),
    ).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    const passport = container.querySelector<HTMLElement>(
      '[data-service-id="passport"]',
    )!;
    await user.click(
      within(passport).getByRole("button", { name: /View service details/ }),
    );
    dialog = screen.getByRole("dialog");
    fireEvent.click(dialog);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps the existing WhatsApp enquiry flow available from the details modal", async () => {
    const user = userEvent.setup();
    const { container } = renderGrid();
    const card = container.querySelector<HTMLElement>(
      '[data-service-id="gccMedicalPcc"]',
    )!;
    await user.click(within(card).getByRole("button", { name: /View service details/ }));
    await user.click(screen.getByRole("link", { name: /Enquire on WhatsApp/ }));

    expect(screen.getByRole("dialog")).toHaveAttribute(
      "aria-labelledby",
      "service-modal-title",
    );
    expect(
      within(screen.getByRole("dialog")).getByRole("heading", {
        name: /GCC medical \/ PCC/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders all requirements in Telugu inside the selected service modal", async () => {
    const user = userEvent.setup();
    const { container } = renderGrid("te");
    const eamcet = container.querySelector<HTMLElement>('[data-service-id="eamcet"]')!;
    await user.click(within(eamcet).getByRole("button", { name: /సేవ వివరాలు చూడండి/ }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("data-service-id", "eamcet");
    expect(
      Array.from(dialog.querySelectorAll("li")).map((item) => item.textContent),
    ).toEqual(requirementsFor("eamcet", "te"));
  });
});
