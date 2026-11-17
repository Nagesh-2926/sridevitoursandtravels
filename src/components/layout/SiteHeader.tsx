"use client";

import { Menu, Phone, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { site } from "@/config/site";
import { localizedHref, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "@/features/theme/ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { navItems } from "./nav";

type Props = { locale: Locale; nav: Dictionary["nav"]; logoAlt: string };

export function SiteHeader({ locale, nav, logoAlt }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Native <dialog> gives focus containment, Escape and an inert background.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (menuOpen && !dialog.open) dialog.showModal();
    if (!menuOpen && dialog.open) dialog.close();
  }, [menuOpen]);

  // Close the menu after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  const links = navItems.map((item) => {
    const href = localizedHref(locale, item.path);
    return { ...item, href, label: nav[item.key], current: pathname === href };
  });

  return (
    <header
      className={cn(
        "site-header fixed inset-x-0 top-0 z-50 text-white transition-[background-color,box-shadow,backdrop-filter] duration-(--duration-slow) ease-(--ease-cinematic)",
        scrolled
          ? "bg-charcoal/85 shadow-[0_1px_0_rgb(139_107_70/0.4)] backdrop-blur-md"
          : "bg-gradient-to-b from-charcoal/80 via-charcoal/30 to-transparent",
      )}
    >
      <div className="mx-auto grid h-(--header-height) w-full max-w-[90rem] grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 sm:px-8 lg:gap-6 lg:px-10">
        <Link
          href={localizedHref(locale)}
          className="shrink-0 justify-self-start rounded-[6px]"
          aria-label={`${site.name} — ${nav.home}`}
        >
          <Logo
            alt={logoAlt}
            preload
            sizes="(min-width: 1280px) 12.25rem, (min-width: 1024px) 10rem, (min-width: 640px) 8.625rem, 8rem"
            className="w-[8rem] sm:w-[8.625rem] lg:w-[10rem] xl:w-[12.25rem]"
          />
        </Link>

        <nav
          aria-label={nav.primaryLabel}
          className="col-start-2 hidden justify-self-center lg:block"
        >
          <ul className="flex items-center gap-1 xl:gap-3 light:xl:gap-3">
            {links.map((link) => (
              <li key={link.key}>
                <Link
                  href={link.href}
                  aria-current={link.current ? "page" : undefined}
                  className={cn(
                    "relative inline-flex min-h-11 items-center px-3 text-label tracking-wide whitespace-nowrap text-white/75 transition-colors hover:text-white lg:max-xl:px-2.5 light:text-[0.9375rem] light:font-medium light:tracking-normal light:text-white/90 light:aria-[current=page]:font-semibold light:xl:text-[1.0625rem]",
                    "after:absolute after:inset-x-3 after:bottom-2 after:h-px after:origin-center after:scale-x-0 after:bg-gold after:transition-transform after:duration-(--duration-base) after:ease-(--ease-cinematic) light:after:-bottom-0.5 light:after:h-0.5 light:after:rounded-full light:after:bg-flame",
                    "hover:after:scale-x-100 aria-[current=page]:text-white aria-[current=page]:after:scale-x-100",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-start-3 flex items-center gap-2 justify-self-end sm:gap-3">
          <ThemeToggle labels={nav.theme} />
          <LanguageSwitcher
            locale={locale}
            label={nav.languageLabel}
            className="hidden sm:flex"
          />
          <a
            href={`tel:${site.phones.primary.e164}`}
            className="hidden min-h-11 items-center gap-2 rounded-full bg-gold px-5 text-label font-medium whitespace-nowrap text-charcoal shadow-soft transition-colors hover:bg-gold-soft md:inline-flex lg:max-[90rem]:px-3.5 light:font-semibold"
          >
            <Phone aria-hidden="true" className="size-4" strokeWidth={1.5} />
            <span>{nav.callUs}</span>
          </a>
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full border border-bronze/70 transition-colors hover:border-gold lg:hidden"
            aria-label={nav.openMenu}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu aria-hidden="true" className="size-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <dialog
        id="mobile-menu"
        ref={dialogRef}
        aria-label={nav.primaryLabel}
        onClose={() => {
          setMenuOpen(false);
          // Return focus to the control that opened the menu.
          toggleRef.current?.focus({ preventScroll: true });
        }}
        className="surface-atmos vignette grain fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none p-0 text-white backdrop:bg-charcoal/70 lg:hidden"
      >
        <div className="relative z-[2] flex h-full flex-col overflow-y-auto px-5 pb-10 sm:px-8">
          <div className="flex h-(--header-height) shrink-0 items-center justify-between">
            <Logo
              alt={logoAlt}
              sizes="(min-width: 640px) 8.625rem, 8rem"
              className="w-[8rem] sm:w-[8.625rem]"
            />
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-full border border-bronze/70 hover:border-gold"
              aria-label={nav.closeMenu}
              onClick={() => setMenuOpen(false)}
            >
              <X aria-hidden="true" className="size-5" strokeWidth={1.5} />
            </button>
          </div>
          <nav aria-label={nav.primaryLabel} className="mt-8">
            <ul className="flex flex-col">
              {links.map((link, i) => (
                <li key={link.key} className="border-b border-white/10">
                  <Link
                    href={link.href}
                    aria-current={link.current ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-baseline gap-4 py-4 font-display text-3xl font-light aria-[current=page]:text-gold"
                  >
                    <span className="font-sans text-xs text-mist tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto flex flex-col gap-5 pt-10">
            <LanguageSwitcher locale={locale} label={nav.languageLabel} size="lg" />
            <a
              href={`tel:${site.phones.primary.e164}`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gold text-sm font-medium text-charcoal"
            >
              <Phone aria-hidden="true" className="size-4" strokeWidth={1.5} />
              {nav.callUs} · {site.phones.primary.display}
            </a>
          </div>
        </div>
      </dialog>
    </header>
  );
}
