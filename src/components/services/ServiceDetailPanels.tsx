import { Landmark } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { ServiceModalTrigger } from "@/features/service-enquiry/ServiceModalTrigger";

export function ServiceDetailPanels({
  locale,
  temples,
}: {
  locale: Locale;
  temples: Dictionary["enquiry"]["temples"];
}) {
  const telugu = locale === "te";
  const contact = `/${locale}/contact`;
  return (
    <section aria-labelledby="temple-options" className="mt-12">
      <h3 id="temple-options" className="text-2xl font-semibold text-white">
        {telugu ? "దర్శన సహాయం చేసే ఆలయాలు" : "Temple darshan assistance"}
      </h3>
      <p className="mt-2 max-w-4xl text-mist">
        {telugu
          ? "ప్రయాణం మరియు దర్శన ప్రణాళిక సహాయం మాత్రమే. లభ్యత, ధరలు, అనుమతులు సంబంధిత ఆలయం లేదా అధికారిక పోర్టల్‌పై ఆధారపడతాయి."
          : "Travel and darshan planning assistance only. Availability, prices and permissions depend on the temple or current official portal."}
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(temples).map(([id, name]) => (
          <article
            key={id}
            className="flex items-start gap-4 rounded-panel border border-bronze/30 bg-navy/55 p-5"
          >
            <Landmark className="mt-1 size-6 shrink-0 text-gold" />
            <div>
              <h4 className="font-semibold text-white">{name}</h4>
              <ServiceModalTrigger
                serviceId="darshanam"
                href={contact}
                className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-gold"
              >
                {telugu ? "దర్శన సహాయం అడగండి" : "Enquire for assistance"}
              </ServiceModalTrigger>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
