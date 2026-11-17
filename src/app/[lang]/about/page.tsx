import type { Metadata } from "next";
import { Logo } from "@/components/brand/Logo";
import { PageIntro } from "@/components/layout/PageIntro";
import { Container, Section } from "@/components/ui/Section";
import { site } from "@/config/site";
import { buildEmailComposeLinks } from "@/features/enquiries/email";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return { title: dict.nav.about };
}

export default async function AboutPage() {
  const { dict } = await getDictionary();
  const { about } = dict;

  return (
    <>
      <PageIntro eyebrow={about.eyebrow} title={about.title} />
      <Section tone="stone">
        <Container className="grid gap-14 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <figure className="flex flex-col gap-6">
            <Logo
              alt={site.name}
              sizes="(min-width: 1024px) 32rem, 90vw"
              className="w-full max-w-lg"
            />
            <figcaption>
              <p className="text-eyebrow text-gold uppercase">{about.proprietorLabel}</p>
              <p className="mt-2 font-display text-title">{site.proprietor}</p>
            </figcaption>
          </figure>
          <div className="flex max-w-prose flex-col gap-6 text-lg leading-relaxed">
            {about.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <a
              href={buildEmailComposeLinks("").mailto}
              className="inline-flex min-h-11 items-center self-start text-base font-medium text-gold underline underline-offset-4"
            >
              {site.email}
            </a>
          </div>
        </Container>
      </Section>
    </>
  );
}
