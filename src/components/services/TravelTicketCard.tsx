import { ArrowRight } from "lucide-react";
import { ServicePictogram, type PictogramName } from "@/components/art/LightArt";
import type { ServiceId } from "@/config/services";
import { ServiceModalTrigger } from "@/features/service-enquiry/ServiceModalTrigger";

/** Shared travel-card anatomy. Theme tokens alter only its visual treatment. */
export function TravelTicketCard({
  title,
  summary,
  href,
  cta,
  pictogram,
  serviceId,
  badge,
}: {
  title: string;
  summary: string;
  href: string;
  cta: string;
  pictogram: PictogramName;
  serviceId: ServiceId;
  badge?: string;
}) {
  return (
    <article className="travel-ticket-card group" data-travel-ticket-card="">
      <div className="travel-ticket-icon" aria-hidden="true">
        <ServicePictogram name={pictogram} />
      </div>
      <div className="travel-ticket-copy">
        {badge && <span className="travel-ticket-badge">{badge}</span>}
        <h3>{title}</h3>
        <p>{summary}</p>
        <ServiceModalTrigger
          serviceId={serviceId}
          href={href}
          className="travel-ticket-link"
        >
          {cta}
          <span className="sr-only">: {title}</span>
          <ArrowRight aria-hidden="true" className="size-5" strokeWidth={2} />
        </ServiceModalTrigger>
      </div>
    </article>
  );
}
