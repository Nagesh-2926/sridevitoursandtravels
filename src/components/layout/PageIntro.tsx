import type { ReactNode } from "react";
import { Container } from "@/components/ui/Section";
import { Eyebrow, Heading, Lead } from "@/components/ui/Typography";

/** Dark editorial band that opens inner pages (keeps the header on a dark ground). */
export function PageIntro({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <section className="surface-atmos vignette grain text-white">
      <Container className="relative z-[2] pt-40 pb-16 sm:pt-48 sm:pb-24">
        <Eyebrow className="text-gold">{eyebrow}</Eyebrow>
        <Heading as="h1" size="display" className="mt-6 max-w-4xl">
          {title}
        </Heading>
        {lead && <Lead className="mt-8 text-white/80">{lead}</Lead>}
        {children}
      </Container>
    </section>
  );
}
