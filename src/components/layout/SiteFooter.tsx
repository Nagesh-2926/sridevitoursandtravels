import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Section";
import { site } from "@/config/site";
import { localizedHref, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { navItems } from "./nav";
import { buildEmailComposeLinks } from "@/features/enquiries/email";

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { footer, nav, location } = dict;
  return (
    <footer className="grain bg-charcoal text-white">
      <Container className="relative z-[2] py-16 sm:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr]">
          <div className="flex flex-col gap-5">
            <Logo alt={site.name} sizes="16rem" className="w-64" />
            <p className="text-eyebrow text-gold uppercase">{footer.tagline}</p>
          </div>

          <nav aria-label={footer.explore}>
            <h2 className="text-eyebrow text-mist uppercase">{footer.explore}</h2>
            <ul className="mt-3 flex flex-col">
              {navItems.map((item) => (
                <li key={item.key}>
                  <Link
                    href={localizedHref(locale, item.path)}
                    className="inline-flex min-h-11 items-center text-white/85 underline-offset-4 hover:text-white hover:underline"
                  >
                    {nav[item.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-2 lg:col-span-1">
            <h2 className="text-eyebrow text-mist uppercase">{footer.reach}</h2>
            <ul className="mt-5 grid gap-4 text-white/85">
              <li
                data-contact-row
                className="grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-3"
              >
                <span className="flex size-8 items-center justify-center text-gold">
                  <Phone aria-hidden="true" className="size-5" strokeWidth={1.75} />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-caption text-mist">
                    {dict.contact.callLabel}
                  </span>
                  <a
                    href={`tel:${site.phones.primary.e164}`}
                    className="inline-flex min-h-11 items-center break-words hover:text-white"
                  >
                    {site.phones.primary.display}
                  </a>
                </span>
              </li>
              <li
                data-contact-row
                className="grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-3"
              >
                <span className="flex size-8 items-center justify-center text-gold">
                  <WhatsAppIcon className="size-5" strokeWidth={1.75} />
                </span>
                <a
                  href={`https://wa.me/${site.whatsappE164}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 min-w-0 flex-col justify-center hover:text-white"
                >
                  <span className="text-caption text-mist">
                    {dict.contact.whatsappLabel}
                  </span>{" "}
                  <span>{site.phones.secondary.display}</span>
                  <span className="sr-only">{dict.a11y.opensInNewTab}</span>
                </a>
              </li>
              <li
                data-contact-row
                className="grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-3"
              >
                <a
                  href={`mailto:${site.email}`}
                  aria-label={`${dict.contact.emailLabel}: ${site.email}`}
                  className="flex size-8 items-center justify-center rounded-full text-gold transition-colors hover:bg-white/10 hover:text-gold-soft"
                >
                  <Mail aria-hidden="true" className="size-5" strokeWidth={1.75} />
                </a>
                <div className="flex min-w-0 flex-col">
                  <span className="text-caption text-mist">
                    {dict.contact.emailLabel}
                  </span>
                  <a
                    href={`mailto:${site.email}`}
                    className="inline-flex min-h-11 max-w-full items-center break-all hover:text-white"
                  >
                    {site.email}
                  </a>
                  <a
                    href={buildEmailComposeLinks("").gmail}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center self-start text-caption font-medium text-gold underline underline-offset-4 transition-colors hover:text-gold-soft"
                  >
                    {dict.contact.gmailCompose}
                    <span className="sr-only"> {dict.a11y.opensInNewTab}</span>
                  </a>
                </div>
              </li>
              <li
                data-contact-row
                className="grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-3"
              >
                <span className="flex size-8 items-center justify-center text-gold">
                  <MapPin aria-hidden="true" className="size-5" strokeWidth={1.75} />
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="text-caption text-mist">
                    {dict.contact.addressLabel}
                  </span>
                  <address className="min-h-11 py-2 not-italic break-words">
                    {site.address.line1}, {site.address.locality} –{" "}
                    {site.address.postalCode}
                  </address>
                  <a
                    href={site.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center self-start text-caption font-medium text-gold underline underline-offset-4 transition-colors hover:text-gold-soft"
                  >
                    {location.openInMaps}
                    <span className="sr-only"> {dict.a11y.opensInNewTab}</span>
                  </a>
                </div>
              </li>
              <li
                data-contact-row
                className="grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-3"
              >
                <span className="flex size-8 items-center justify-center text-gold">
                  <Clock aria-hidden="true" className="size-5" strokeWidth={1.75} />
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="text-caption text-mist">
                    {dict.contact.hoursLabel}
                  </span>
                  <span className="inline-flex min-h-11 items-center text-white/85">
                    {location.hoursValue}
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="rule-bronze mt-14 opacity-60" />
        <div className="mt-8 flex flex-col gap-4 text-sm text-mist md:flex-row md:justify-between">
          <p className="max-w-2xl">{footer.disclaimer}</p>
          <p className="shrink-0">
            © {site.name}. {footer.rights}
          </p>
        </div>
      </Container>
    </footer>
  );
}
