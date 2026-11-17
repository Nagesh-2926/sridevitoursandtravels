import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { MediaPlate } from "@/components/ui/MediaPlate";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import type { MediaSlot } from "@/config/media";
import type { ServiceId, ServiceIcon as ServiceIconName } from "@/config/services";
import { ServiceModalTrigger } from "@/features/service-enquiry/ServiceModalTrigger";
import { ServiceDetailsTrigger } from "@/features/service-details/ServiceDetailsModal";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";

/**
 * One card anatomy, two dark surfaces:
 * - ServiceFeatureCard: photography slot, for travel services and categories.
 * - ServiceCard: textured panel, for the full catalogue.
 * The whole card is one link target (stretched link). With a `serviceId`
 * that link opens the service's enquiry modal; without JS it still
 * navigates to the contact page.
 */
type CardProps = {
  title: string;
  summary: string;
  href: string;
  cta: string;
  icon: ServiceIconName;
  serviceId?: ServiceId;
  index?: number;
  badge?: string;
};

function CardLink({
  href,
  cta,
  title,
  serviceId,
}: Pick<CardProps, "href" | "cta" | "title" | "serviceId">) {
  const className = cn(
    "mt-6 inline-flex min-h-11 items-center gap-1.5 self-start text-label font-medium text-gold",
    // Stretch the link over the card; the card shows the focus ring.
    "after:absolute after:inset-0 after:z-[3] after:rounded-card focus-visible:outline-none",
  );
  const content = (
    <>
      {cta}
      <span className="sr-only">: {title}</span>
      <ArrowUpRight
        aria-hidden="true"
        className="size-4 transition-transform duration-(--duration-base) group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        strokeWidth={1.5}
      />
    </>
  );
  return serviceId ? (
    <ServiceModalTrigger serviceId={serviceId} href={href} className={className}>
      {content}
    </ServiceModalTrigger>
  ) : (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

const cardFrame =
  "group sheen relative isolate flex h-full flex-col overflow-hidden rounded-card transition-[box-shadow,transform,border-color] duration-(--duration-base) ease-(--ease-cinematic) hover:-translate-y-1 hover:shadow-lift has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-gold motion-reduce:hover:translate-y-0";

const Index = ({ value }: { value: number }) => (
  <span className="text-caption text-mist tabular-nums">
    {String(value).padStart(2, "0")}
  </span>
);

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex self-start rounded-full border border-gold/40 px-2.5 py-0.5 text-[0.6875rem] font-medium tracking-wide text-gold uppercase">
      {children}
    </span>
  );
}

export function ServiceFeatureCard({
  title,
  summary,
  href,
  cta,
  icon,
  serviceId,
  index,
  badge,
  media,
  locale,
  className,
}: CardProps & { media: MediaSlot; locale: Locale; className?: string }) {
  return (
    <article
      className={cn(
        cardFrame,
        "min-h-[22rem] border border-white/10 text-white shadow-soft hover:border-bronze/80 sm:min-h-[25rem]",
        className,
      )}
    >
      <MediaPlate
        fill
        slot={media}
        sceneId={`card-${serviceId ?? index ?? "x"}`}
        sceneFrame="absolute inset-x-0 top-0 h-[64%]"
        locale={locale}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="-z-10 transition-transform duration-[1200ms] ease-(--ease-cinematic) group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
      />
      <div className="relative z-[2] flex items-start justify-between gap-4 p-6 sm:p-7">
        <span className="inline-flex size-12 items-center justify-center rounded-full border border-bronze/60 bg-charcoal/40 backdrop-blur-sm transition-colors group-hover:border-gold">
          <ServiceIcon name={icon} className="size-6 text-gold" />
        </span>
        {index !== undefined && <Index value={index} />}
      </div>
      <div className="relative z-[2] mt-auto flex flex-col p-6 pt-0 sm:p-7 sm:pt-0">
        {badge && (
          <span className="mb-3">
            <Badge>{badge}</Badge>
          </span>
        )}
        <h3 className="font-display text-card text-white">{title}</h3>
        <p className="mt-2 text-body text-fog/85">{summary}</p>
        <CardLink href={href} cta={cta} title={title} serviceId={serviceId} />
      </div>
    </article>
  );
}

export function ServiceCard({
  title,
  summary,
  icon,
  serviceId,
  index,
  badge,
  detailsLabel,
}: Omit<CardProps, "serviceId" | "cta" | "href"> & {
  serviceId: ServiceId;
  detailsLabel: string;
}) {
  return (
    <article
      data-service-id={serviceId}
      className={cn(
        cardFrame,
        "liquid-glass-item min-h-[18rem] border border-white/10 p-6 shadow-soft hover:border-bronze/80 sm:p-7",
      )}
    >
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex size-12 items-center justify-center rounded-full border border-bronze/60 bg-charcoal/50 transition-colors group-hover:border-gold">
            <ServiceIcon name={icon} className="size-6 text-gold" />
          </span>
          <div className="flex items-center gap-3">
            {badge && <Badge>{badge}</Badge>}
            {index !== undefined && <Index value={index} />}
          </div>
        </div>
        <h3 className="mt-6 font-display text-card text-white">{title}</h3>
        <p className="mt-2 flex-1 text-body text-mist">{summary}</p>
        <ServiceDetailsTrigger serviceId={serviceId} label={detailsLabel} />
      </div>
    </article>
  );
}
