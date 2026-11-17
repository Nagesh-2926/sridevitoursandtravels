import { Reveal } from "@/components/ui/Reveal";
import type { Service } from "@/config/services";
import { localizedHref, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { cn } from "@/lib/cn";
import { pictogramFor } from "./LightServiceCard";
import { ServiceCard } from "./ServiceCard";
import { TravelTicketCard } from "./TravelTicketCard";

export const enquiryHref = (locale: Locale, serviceId: string) =>
  `${localizedHref(locale, "/contact")}?service=${serviceId}`;

export function ServiceGrid({
  locale,
  services,
  dict,
  variant = "standard",
  className,
}: {
  locale: Locale;
  services: readonly Service[];
  dict: Dictionary["services"];
  variant?: "standard" | "feature";
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
        variant === "standard" && "auto-rows-fr",
        className,
      )}
    >
      {services.map((service, i) => {
        const shared = {
          ...dict.items[service.id],
          href: enquiryHref(locale, service.id),
          cta: dict.enquire,
          icon: service.icon,
          serviceId: service.id,
          index: i + 1,
          badge: service.assistanceOnly ? dict.assistanceBadge : undefined,
        };
        return (
          <Reveal as="li" key={service.id} delay={(i % 4) * 70}>
            {variant === "feature" ? (
              <TravelTicketCard
                title={shared.title}
                summary={shared.summary}
                href={shared.href}
                cta={shared.cta}
                serviceId={service.id}
                badge={shared.badge}
                pictogram={pictogramFor[service.id] ?? "plane"}
              />
            ) : (
              <ServiceCard
                title={shared.title}
                summary={shared.summary}
                icon={shared.icon}
                serviceId={service.id}
                index={shared.index}
                badge={shared.badge}
                detailsLabel={dict.detailsLabel}
              />
            )}
          </Reveal>
        );
      })}
    </ul>
  );
}
