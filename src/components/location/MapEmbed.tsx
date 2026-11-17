"use client";

import { MapPin } from "lucide-react";
import { useState } from "react";
import { site } from "@/config/site";

const embedSrc = `https://www.google.com/maps?q=${encodeURIComponent(
  `${site.address.line1}, ${site.address.locality} ${site.address.postalCode}`,
)}&output=embed`;

/** Click-to-load map: no third-party requests until the visitor asks for it. */
export function MapEmbed({
  labels,
}: {
  labels: { showMap: string; mapConsent: string; mapTitle: string };
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="panel relative aspect-[4/3] overflow-hidden rounded-card sm:aspect-[16/10]">
      {loaded ? (
        <iframe
          src={embedSrc}
          title={labels.mapTitle}
          className="absolute inset-0 h-full w-full grayscale-[0.35] sepia-[0.15]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <MapPin aria-hidden="true" className="size-8 text-gold" strokeWidth={1.25} />
          <button
            type="button"
            onClick={() => setLoaded(true)}
            className="min-h-11 rounded-full bg-gold px-5 text-sm font-medium text-charcoal hover:bg-gold-soft"
          >
            {labels.showMap}
          </button>
          <p className="max-w-xs text-sm text-mist">{labels.mapConsent}</p>
        </div>
      )}
    </div>
  );
}
