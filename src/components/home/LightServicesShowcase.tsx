import { LightServiceCard, pictogramFor } from "@/components/services/LightServiceCard";
import { enquiryHref } from "@/components/services/ServiceGrid";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Section";
import { servicesByCategory } from "@/config/services";
import { localizedHref, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

/**
 * Light-theme "Our Services" row from the owner-approved reference:
 * centred eyebrow and heading, five cards (four travel + digital).
 * Shared by both themes, with independently designed surfaces.
 */
export function LightServicesShowcase({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const { services, home } = dict;
  const travel = servicesByCategory("travel");
  return (
    <section aria-labelledby="light-services" className="reference-services">
      <Container>
        <Reveal as="header" className="flex flex-col items-center text-center">
          <p className="flex items-center gap-4 text-eyebrow font-semibold text-gold uppercase before:h-px before:w-12 before:bg-flame/70 after:h-px after:w-12 after:bg-flame/70 sm:text-[0.8125rem]">
            {home.showcaseEyebrow}
          </p>
          <h2
            id="light-services"
            className="mt-4 font-display text-[clamp(1.9rem,1.3rem+1.7vw,2.75rem)] leading-tight font-semibold text-balance text-white"
          >
            {home.showcaseTitle}
          </h2>
        </Reveal>
        <ul className="reference-service-grid">
          {travel.map((service, i) => (
            <Reveal as="li" key={service.id} delay={i * 70}>
              <LightServiceCard
                {...services.items[service.id]}
                href={enquiryHref(locale, service.id)}
                cta={services.enquire}
                pictogram={pictogramFor[service.id] ?? "plane"}
                serviceId={service.id}
              />
            </Reveal>
          ))}
          <Reveal
            as="li"
            delay={travel.length * 70}
            className="sm:col-span-2 md:col-span-1"
          >
            <LightServiceCard
              title={services.digitalCategory.shortTitle}
              summary={services.digitalCategory.shortSummary}
              href={`${localizedHref(locale, "/services")}#digital-services`}
              cta={services.digitalCategory.cta}
              pictogram="digital"
            />
          </Reveal>
        </ul>
      </Container>
    </section>
  );
}
