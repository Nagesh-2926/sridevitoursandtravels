import Image from "next/image";
import type { ReactNode } from "react";
import { HeroScene } from "@/components/home/HeroScenes";
import type { MediaSlot } from "@/config/media";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";

/**
 * A photography slot: licensed image when available, otherwise the
 * art-directed plate. A bottom scrim keeps overlaid text readable.
 */
export function MediaPlate({
  slot,
  locale,
  sizes,
  priority,
  scrim = true,
  fill = false,
  sceneId = "plate",
  sceneFrame = "absolute inset-0",
  className,
  children,
}: {
  slot: MediaSlot;
  locale: Locale;
  sizes: string;
  priority?: boolean;
  scrim?: boolean;
  /** Cover the nearest positioned ancestor instead of sizing in flow. */
  fill?: boolean;
  /** Unique id prefix for the vector scene's gradients. */
  sceneId?: string;
  /** Where the vector scene sits; cards keep it clear of their text. */
  sceneFrame?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        fill ? "absolute inset-0" : "relative",
        "overflow-hidden",
        `plate-${slot.plate}`,
        className,
      )}
    >
      {!slot.image && slot.scene && (
        <div className={sceneFrame}>
          <HeroScene name={slot.scene} instance={sceneId} />
        </div>
      )}
      {slot.image && (
        <Image
          src={slot.image.src}
          alt={slot.image.alt[locale]}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      )}
      {scrim && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-charcoal from-30% via-charcoal/70 via-55% to-transparent"
        />
      )}
      {children}
    </div>
  );
}
