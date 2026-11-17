import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactChannels } from "@/components/contact/ContactChannels";
import { EnquiryForm } from "@/components/contact/EnquiryForm";
import { PageIntro } from "@/components/layout/PageIntro";
import { Container, Section } from "@/components/ui/Section";
import { Spinner } from "@/components/ui/Spinner";
import { Heading } from "@/components/ui/Typography";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return { title: dict.nav.contact, description: dict.contact.intro };
}

export default async function ContactPage() {
  const { dict } = await getDictionary();
  const { contact } = dict;

  return (
    <>
      <PageIntro eyebrow={contact.eyebrow} title={contact.title} lead={contact.intro} />
      <Section tone="stone">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] lg:gap-14">
          <div>
            <ContactChannels dict={dict} />
          </div>

          <div className="glass sheen rounded-panel p-6 sm:p-10">
            <Heading as="h2" size="title" className="mb-8">
              {contact.form.title}
            </Heading>
            <Suspense
              fallback={<Spinner label={dict.status.loading} className="py-16" />}
            >
              <EnquiryForm
                copy={contact.form}
                draftCopy={dict.enquiry.draft}
                serviceCopy={dict.services}
              />
            </Suspense>
          </div>
        </Container>
      </Section>
    </>
  );
}
