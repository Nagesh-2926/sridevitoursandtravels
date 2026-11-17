import { localizedHref, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { HeroCarousel } from "./HeroCarousel";

export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section className="reference-hero">
      <HeroCarousel
        locale={locale}
        hero={dict.hero}
        enquireHref={localizedHref(locale, "/contact")}
        servicesHref={localizedHref(locale, "/services")}
      />
    </section>
  );
}
