"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ServicePictogram, type PictogramName } from "@/components/art/LightArt";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { format } from "@/i18n/format";

const icons: PictogramName[] = ["plane", "train", "temple"];
type Props = {
  locale: Locale;
  hero: Dictionary["hero"];
  enquireHref: string;
  servicesHref: string;
};

// Manual selection keeps the reference composition stable and removes the need
// for a playback control. The independent intro and reduced-motion gate remain intact.
export function HeroCarousel({ locale, hero, enquireHref, servicesHref }: Props) {
  const [index, setIndex] = useState(1);
  return (
    <div
      className="reference-stage"
      role="region"
      aria-roledescription="carousel"
      aria-label={hero.carouselLabel}
      lang={locale}
    >
      <div
        className="reference-art"
        aria-hidden="true"
        data-hero-art="reference-day-night"
      />
      <div className="reference-copy">
        <div className="reference-slides">
          {hero.slides.map((slide, i) => (
            <div
              key={slide.kicker}
              role="group"
              aria-roledescription="slide"
              aria-label={format(hero.slideStatus, {
                current: i + 1,
                total: hero.slides.length,
              })}
              aria-hidden={i !== index}
              inert={i !== index}
              className="reference-slide"
            >
              <p className="reference-eyebrow">{slide.kicker}</p>
              <h1>{slide.title}</h1>
              <p className="reference-description">{slide.body}</p>
            </div>
          ))}
        </div>
        <div className="reference-actions">
          <Link href={enquireHref} className="reference-primary">
            {hero.enquire}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link href={servicesHref} className="reference-secondary">
            {hero.exploreServices}
          </Link>
        </div>
      </div>
      <ol className="reference-panels">
        {hero.slides.map((slide, i) => (
          <li key={slide.kicker}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={format(hero.goToSlide, { n: i + 1 })}
              aria-current={index === i ? "true" : undefined}
            >
              <ServicePictogram name={icons[i]} />
              <span>
                <span className="reference-number">{String(i + 1).padStart(2, "0")}</span>
                {slide.kicker}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <ol className="reference-dots">
        {hero.slides.map((slide, i) => (
          <li key={slide.kicker}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={format(hero.goToSlide, { n: i + 1 })}
              aria-current={index === i ? "true" : undefined}
            >
              <span />
            </button>
          </li>
        ))}
      </ol>
      <span className="sr-only" aria-live="polite">
        {format(hero.slideStatus, { current: index + 1, total: hero.slides.length })}
      </span>
      <svg
        className="reference-wave"
        viewBox="0 0 1672 80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 6 Q210 130 520 50 T1050 48 T1672 4" />
        <path d="M0 15 Q210 130 520 56 T1050 54 T1672 10" />
        <path d="M0 23 Q210 130 520 62 T1050 60 T1672 18" />
      </svg>
    </div>
  );
}
