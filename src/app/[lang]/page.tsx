import { MessageCircle, Phone } from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { LightServicesShowcase } from "@/components/home/LightServicesShowcase";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Container, Section } from "@/components/ui/Section";
import { Eyebrow, Heading, Lead } from "@/components/ui/Typography";
import { site } from "@/config/site";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function HomePage() {
  const { locale, dict } = await getDictionary();
  const { home } = dict;

  return (
    <>
      <Hero locale={locale} dict={dict} />

      <LightServicesShowcase locale={locale} dict={dict} />

      <Section tone="midnight" aria-labelledby="home-process">
        <Container>
          <Eyebrow className="text-gold">{home.processEyebrow}</Eyebrow>
          <Heading id="home-process" className="mt-6 max-w-3xl">
            {home.processTitle}
          </Heading>
          <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {home.steps.map((step, i) => (
              <Reveal
                as="li"
                key={step.title}
                delay={i * 90}
                className="border-t border-grey pt-6"
              >
                <span className="font-display text-5xl font-light text-bronze tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-title">{step.title}</h3>
                <p className="mt-3 text-body text-mist">{step.body}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Section>

      <Section tone="atmos" aria-labelledby="home-visit">
        <Container className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <Eyebrow className="text-gold">{home.contactEyebrow}</Eyebrow>
            <Heading id="home-visit" className="mt-6">
              {home.contactTitle}
            </Heading>
            <Lead className="mt-6 text-white/80">{home.contactBody}</Lead>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <ButtonLink
              href={`tel:${site.phones.primary.e164}`}
              size="lg"
              variant="accent"
            >
              <Phone aria-hidden="true" className="size-4" strokeWidth={1.5} />
              {site.phones.primary.display}
            </ButtonLink>
            <ButtonLink
              href={`https://wa.me/${site.whatsappE164}`}
              external
              variant="outlineLight"
              size="lg"
            >
              <MessageCircle aria-hidden="true" className="size-4" strokeWidth={1.5} />
              {dict.contact.whatsapp}
              <span className="sr-only">{dict.a11y.opensInNewTab}</span>
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
