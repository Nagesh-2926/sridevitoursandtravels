import type { Metadata } from "next";
import { ArrowUpRight, Clock, MapPin } from "lucide-react";
import { PageIntro } from "@/components/layout/PageIntro";
import { MapEmbed } from "@/components/location/MapEmbed";
import { ButtonLink } from "@/components/ui/Button";
import { Container, Section } from "@/components/ui/Section";
import { site } from "@/config/site";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return { title: dict.nav.location };
}

export default async function LocationPage() {
  const { dict } = await getDictionary();
  const { location } = dict;

  return (
    <>
      <PageIntro eyebrow={location.eyebrow} title={location.title} />
      <Section tone="stone">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <div className="flex flex-col gap-10">
            <dl className="flex flex-col gap-10">
              <div>
                <dt className="flex items-center gap-2 text-eyebrow text-gold uppercase">
                  <MapPin aria-hidden="true" className="size-4" /> {location.addressLabel}
                </dt>
                <dd className="mt-3 font-display text-title">
                  <address className="not-italic">
                    {site.name}
                    <br />
                    {site.address.line1},
                    <br />
                    {site.address.locality} – {site.address.postalCode}
                  </address>
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-eyebrow text-gold uppercase">
                  <Clock aria-hidden="true" className="size-4" /> {location.hoursLabel}
                </dt>
                <dd className="mt-3 font-display text-title">{location.hoursValue}</dd>
              </div>
            </dl>
            <div>
              <ButtonLink
                href={site.mapsUrl}
                external
                variant="primary"
                icon={
                  <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={1.5} />
                }
              >
                {location.openInMaps}
                <span className="sr-only">{dict.a11y.opensInNewTab}</span>
              </ButtonLink>
            </div>
          </div>
          <MapEmbed labels={location} />
        </Container>
      </Section>
    </>
  );
}
