import Image from "next/image";
import { logoUrl, site } from "@/config/site";
import { cn } from "@/lib/cn";

/**
 * The official logo for the active theme: the white-background logo in the
 * light theme, the owner-approved dark-background logo in the dark theme. Both images are
 * in the markup and CSS on html[data-theme] (set before first paint) shows
 * exactly one, so the right logo appears from the first frame with no
 * hydration mismatch. The box uses the dark logo's ratio (the wider of the
 * two), so both artworks appear at a similar size, the box is identical in
 * both themes (no layout shift when switching) and `object-contain` keeps
 * each artwork whole. The displayed dark file is a deterministic RGBA
 * extraction of the preserved, byte-identical owner source. No filters,
 * recolouring, blend modes or generated replacement artwork are used.
 */
export function Logo({
  alt,
  className,
  preload,
  sizes,
}: {
  alt: string;
  className?: string;
  /** Preload the default (light) logo; use for the header only. */
  preload?: boolean;
  /** Rendered CSS width(s), so high-density screens get a sharp file. */
  sizes: string;
}) {
  const { light, dark } = site.logos;
  const image = "absolute inset-0 h-full w-full object-contain";
  return (
    <span
      data-logo="theme-aware"
      data-dark-logo-treatment="rgba-extraction"
      className={cn("relative block aspect-[2042/770]", className)}
    >
      <Image
        data-logo-variant="light"
        src={logoUrl(light)}
        width={light.width}
        height={light.height}
        alt={alt}
        preload={preload}
        loading="eager"
        sizes={sizes}
        quality={90}
        className={cn(image, "dark-theme:hidden")}
      />
      <Image
        data-logo-variant="dark"
        src={logoUrl(dark)}
        width={dark.width}
        height={dark.height}
        alt={alt}
        loading="eager"
        sizes={sizes}
        quality={90}
        className={cn(image, "hidden dark-theme:block")}
      />
    </span>
  );
}
