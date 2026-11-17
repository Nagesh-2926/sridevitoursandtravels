export const locales = ["en", "te"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const localeCookie = "NEXT_LOCALE";

export const localeLabels: Record<Locale, { native: string; htmlLang: string }> = {
  en: { native: "English", htmlLang: "en-IN" },
  te: { native: "తెలుగు", htmlLang: "te-IN" },
};

export const isLocale = (value: string | undefined | null): value is Locale =>
  !!value && (locales as readonly string[]).includes(value);

/** Picks the best supported locale from an Accept-Language header value. */
export function negotiateLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return defaultLocale;
  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return {
        base: tag.toLowerCase().split("-")[0],
        q: q ? Number(q.split("=")[1]) : 1,
      };
    })
    .filter((entry) => entry.base && !Number.isNaN(entry.q))
    .sort((a, b) => b.q - a.q);
  return (
    (ranked.find((entry) => isLocale(entry.base))?.base as Locale | undefined) ??
    defaultLocale
  );
}

/** Replaces the locale segment of a pathname, e.g. /en/services → /te/services. */
export function switchLocalePath(pathname: string, target: Locale): string {
  const segments = pathname.split("/");
  if (isLocale(segments[1])) {
    segments[1] = target;
    return segments.join("/") || `/${target}`;
  }
  return `/${target}${pathname === "/" ? "" : pathname}`;
}

export const localizedHref = (locale: Locale, path = "") =>
  `/${locale}${path && path !== "/" ? path : ""}`;
