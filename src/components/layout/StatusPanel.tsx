import type { ReactNode } from "react";
import { Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { Container } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Typography";
import { site } from "@/config/site";

/** Shared layout for error and not-found states. */
export function StatusPanel({
  code,
  title,
  body,
  children,
}: {
  code: string;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <section className="surface-atmos vignette grain flex min-h-[80svh] items-center text-white">
      <Container className="relative z-[2] py-40">
        <p className="font-display text-7xl font-light text-gold/70 tabular-nums">
          {code}
        </p>
        <Heading as="h1" size="headline" className="mt-6 max-w-2xl">
          {title}
        </Heading>
        <p className="mt-5 max-w-prose text-lg text-white/80">{body}</p>
        <div className="mt-10 flex flex-wrap items-center gap-3">{children}</div>
        <div className="mt-10 flex flex-wrap gap-4 text-sm text-mist">
          <a
            href={`tel:${site.phones.primary.e164}`}
            className="inline-flex min-h-11 items-center gap-2 hover:text-gold"
          >
            <Phone aria-hidden="true" className="size-4" />
            {site.phones.primary.display}
          </a>
          <a
            href={`https://wa.me/${site.whatsappE164}`}
            className="inline-flex min-h-11 items-center gap-2 hover:text-gold"
          >
            <WhatsAppIcon className="size-4" />
            {site.phones.secondary.display}
          </a>
        </div>
      </Container>
    </section>
  );
}
