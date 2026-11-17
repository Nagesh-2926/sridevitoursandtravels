import type { Metadata } from "next";
import { ArrowDown, Info } from "lucide-react";
import { PageIntro } from "@/components/layout/PageIntro";
import { ServiceGrid } from "@/components/services/ServiceGrid";
import { ServiceDetailPanels } from "@/components/services/ServiceDetailPanels";
import { Container, Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Typography";
import { servicesByCategory } from "@/config/services";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return { title: dict.nav.services, description: dict.services.intro };
}

export default async function ServicesPage() {
  const { locale, dict } = await getDictionary();
  const { services } = dict;

  return (
    <>
      <PageIntro eyebrow={services.eyebrow} title={services.title} lead={services.intro}>
        <nav aria-label={services.jumpLabel} className="mt-10">
          <ul className="flex flex-wrap gap-3">
            {[
              { href: "#travel-services", label: services.travelTitle },
              { href: "#digital-services", label: services.digitalTitle },
            ].map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gold/35 px-5 text-label text-white/90 transition-colors hover:border-gold hover:text-white"
                >
                  {link.label}
                  <ArrowDown aria-hidden="true" className="size-4" strokeWidth={1.5} />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageIntro>

      <Section
        tone="stone"
        aria-labelledby="travel-services"
        className="travel-ticket-section"
      >
        <Container>
          <Heading id="travel-services" size="headline" className="travel-ticket-heading">
            {services.travelTitle}
          </Heading>
          <ServiceGrid
            locale={locale}
            services={servicesByCategory("travel")}
            dict={services}
            variant="feature"
            className="travel-ticket-grid lg:grid-cols-4"
          />
          <ServiceDetailPanels locale={locale} temples={dict.enquiry.temples} />
        </Container>
      </Section>

      <Section tone="midnight" aria-labelledby="digital-services">
        <Container>
          <Heading id="digital-services" size="headline">
            {services.digitalTitle}
          </Heading>
          <p className="mt-6 mb-12 flex max-w-3xl gap-3 rounded-plaque border border-bronze/30 bg-navy/60 p-4 text-sm leading-relaxed text-mist">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-gold" />
            {services.assistanceNote}
          </p>
          <ServiceGrid
            locale={locale}
            services={servicesByCategory("digital")}
            dict={services}
          />
        </Container>
      </Section>
    </>
  );
}
