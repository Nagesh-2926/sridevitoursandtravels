import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import type { ReactNode } from "react";
import { site } from "@/config/site";
import { buildEmailComposeLinks } from "@/features/enquiries/email";
import type { Dictionary } from "@/i18n/dictionaries/en";

function Channel({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <section
      data-contact-row
      className="panel grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-3 rounded-card p-5 sm:p-6"
    >
      <div className="flex size-8 items-center justify-center text-gold">{icon}</div>
      <div className="min-w-0">
        <h2 className="text-eyebrow text-gold uppercase">{label}</h2>
        <div className="mt-2 min-w-0">{children}</div>
      </div>
    </section>
  );
}

const iconClass = "size-5 shrink-0";
const linkRow =
  "inline-flex min-h-11 items-center gap-2 font-display text-title tabular-nums transition-colors hover:text-gold";

/** Phone, WhatsApp and visit details shown beside the enquiry form. */
export function ContactChannels({ dict }: { dict: Dictionary }) {
  const { contact, location, a11y } = dict;

  return (
    <div className="flex flex-col gap-5">
      <Channel
        icon={<Phone aria-hidden="true" className={iconClass} strokeWidth={1.75} />}
        label={contact.callLabel}
      >
        <a href={`tel:${site.phones.primary.e164}`} className={linkRow}>
          {site.phones.primary.display}
        </a>
      </Channel>

      <Channel
        icon={<WhatsAppIcon className={iconClass} strokeWidth={1.75} />}
        label={contact.whatsappLabel}
      >
        <a
          href={`https://wa.me/${site.whatsappE164}`}
          target="_blank"
          rel="noopener noreferrer"
          className={linkRow}
        >
          {site.phones.secondary.display}
          <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={1.5} />
          <span className="sr-only">
            {contact.whatsapp} {a11y.opensInNewTab}
          </span>
        </a>
        <p className="mt-1 text-caption text-mist">{contact.whatsappNote}</p>
      </Channel>

      <Channel
        icon={
          <a
            href={`mailto:${site.email}`}
            aria-label={`${contact.emailLabel}: ${site.email}`}
            className="inline-flex size-8 items-center justify-center rounded-full transition-colors hover:bg-white/10 hover:text-gold"
          >
            <Mail aria-hidden="true" className={iconClass} strokeWidth={1.75} />
          </a>
        }
        label={contact.emailLabel}
      >
        <a
          href={`mailto:${site.email}`}
          className="inline-flex min-h-11 max-w-full items-center text-body font-medium break-all transition-colors hover:text-gold"
        >
          {site.email}
        </a>
        <p className="mt-1 text-caption text-mist">{contact.emailNote}</p>
        <a
          href={buildEmailComposeLinks("").gmail}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex min-h-11 items-center text-caption font-medium text-gold underline underline-offset-4 transition-colors hover:text-gold-soft"
        >
          {contact.gmailCompose}
          <span className="sr-only"> {a11y.opensInNewTab}</span>
        </a>
      </Channel>

      <Channel
        icon={<MapPin aria-hidden="true" className={iconClass} strokeWidth={1.75} />}
        label={contact.addressLabel}
      >
        <address className="text-body not-italic break-words">
          {site.address.line1}, {site.address.locality} – {site.address.postalCode}
        </address>
        <a
          href={site.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-label font-medium text-gold underline-offset-4 hover:underline"
        >
          {location.openInMaps}
          <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={1.5} />
          <span className="sr-only">{a11y.opensInNewTab}</span>
        </a>
      </Channel>

      <Channel
        icon={<Clock aria-hidden="true" className={iconClass} strokeWidth={1.75} />}
        label={contact.hoursLabel}
      >
        <p className="text-body text-mist">{location.hoursValue}</p>
      </Channel>
    </div>
  );
}
