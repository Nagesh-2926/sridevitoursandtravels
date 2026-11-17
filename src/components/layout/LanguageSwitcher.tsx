"use client";

import { usePathname } from "next/navigation";
import {
  localeCookie,
  localeLabels,
  locales,
  switchLocalePath,
  type Locale,
} from "@/i18n/config";
import { cn } from "@/lib/cn";

function rememberLocale(locale: Locale) {
  document.cookie = `${localeCookie}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

export function LanguageSwitcher({
  locale,
  label,
  className,
  size = "md",
}: {
  locale: Locale;
  label: string;
  className?: string;
  size?: "md" | "lg";
}) {
  const pathname = usePathname() ?? `/${locale}`;
  return (
    <nav aria-label={label} className={cn("flex items-center", className)}>
      <ul className="flex items-center gap-1 rounded-full border border-current/20 p-1">
        {locales.map((target) => {
          const current = target === locale;
          return (
            <li key={target}>
              {/* Locale changes replace the root html layout. A document navigation
                  reruns the pre-paint theme script before the new locale appears. */}
              <a
                href={switchLocalePath(pathname, target)}
                hrefLang={localeLabels[target].htmlLang}
                lang={localeLabels[target].htmlLang}
                aria-current={current ? "true" : undefined}
                onClick={() => rememberLocale(target)}
                className={cn(
                  "flex items-center rounded-full font-medium transition-colors duration-(--duration-fast)",
                  size === "lg"
                    ? "min-h-11 px-5 text-sm"
                    : "min-h-8 px-3 text-xs light:xl:min-h-9 light:xl:px-3.5 light:xl:text-sm",
                  current ? "bg-gold text-charcoal" : "opacity-80 hover:opacity-100",
                )}
              >
                {localeLabels[target].native}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
