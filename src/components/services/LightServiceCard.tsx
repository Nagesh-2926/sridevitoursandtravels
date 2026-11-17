import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ServicePictogram, type PictogramName } from "@/components/art/LightArt";
import type { ServiceId } from "@/config/services";
import { ServiceModalTrigger } from "@/features/service-enquiry/ServiceModalTrigger";
import { cn } from "@/lib/cn";

/** Pictogram for each service card in the light theme. */
export const pictogramFor: Partial<Record<ServiceId, PictogramName>> = {
  flights: "plane",
  trains: "train",
  buses: "bus",
  darshanam: "temple",
};

/**
 * Light-theme service card from the owner-approved reference: white
 * surface, centred two-tone pictogram in a fixed visual region, navy title,
 * centred description and an orange action. The whole card is one link;
 * with a `serviceId` it opens the service's enquiry modal.
 */
export function LightServiceCard({
  title,
  summary,
  href,
  cta,
  pictogram,
  serviceId,
  badge,
  className,
}: {
  title: string;
  summary: string;
  href: string;
  cta: string;
  pictogram: PictogramName;
  serviceId?: ServiceId;
  badge?: string;
  className?: string;
}) {
  const linkClass = cn(
    "mt-auto inline-flex min-h-11 items-center justify-center gap-2 pt-5 text-label font-semibold text-gold",
    "after:absolute after:inset-0 after:z-[3] after:rounded-panel focus-visible:outline-none",
  );
  const content = (
    <>
      {cta}
      <span className="sr-only">: {title}</span>
      <ArrowRight
        aria-hidden="true"
        className="size-4 transition-transform duration-(--duration-base) group-hover:translate-x-1"
        strokeWidth={2}
      />
    </>
  );
  return (
    <article
      data-light-card=""
      className={cn(
        "reference-service-card group relative flex h-full flex-col items-center rounded-panel border border-grey bg-charcoal px-6 pt-8 pb-6 text-center shadow-soft",
        "transition-[transform,box-shadow,border-color] duration-(--duration-base) ease-(--ease-cinematic)",
        "hover:-translate-y-1.5 hover:border-flame/45 hover:shadow-lift motion-reduce:hover:translate-y-0",
        "has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-gold",
        className,
      )}
    >
      {/* Fixed visual region so titles align across the row. */}
      <div className="flex h-24 w-full items-center justify-center">
        <ServicePictogram
          name={pictogram}
          className="h-20 w-auto transition-transform duration-[600ms] ease-(--ease-cinematic) group-hover:-translate-y-1 group-hover:scale-[1.04] motion-reduce:group-hover:transform-none"
        />
      </div>
      {badge && (
        <span className="mt-3 inline-flex rounded-full border border-flame/40 bg-flame/8 px-2.5 py-0.5 text-[0.6875rem] font-semibold tracking-wide text-gold-soft uppercase">
          {badge}
        </span>
      )}
      <h3 className="mt-4 font-sans text-xl font-bold text-white">{title}</h3>
      <p className="mt-2.5 text-body text-mist">{summary}</p>
      {serviceId ? (
        <ServiceModalTrigger serviceId={serviceId} href={href} className={linkClass}>
          {content}
        </ServiceModalTrigger>
      ) : (
        <Link href={href} className={linkClass}>
          {content}
        </Link>
      )}
    </article>
  );
}
