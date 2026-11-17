import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import {
  Hanken_Grotesk,
  Newsreader,
  Noto_Sans_Telugu,
  Noto_Serif_Telugu,
} from "next/font/google";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { site } from "@/config/site";
import { introGateScript } from "@/features/intro/gate";
import { IntroController } from "@/features/intro/IntroController";
import { themeScript } from "@/features/theme/theme";
import { ServiceModalProvider } from "@/features/service-enquiry/ServiceModal";
import { ServiceDetailsModalProvider } from "@/features/service-details/ServiceDetailsModal";
import { localeLabels, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { env } from "@/server/env";
import "../globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-newsreader",
  display: "swap",
});
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});
// Telugu faces load only when Telugu glyphs render (unicode-range), so no preload.
const notoSansTelugu = Noto_Sans_Telugu({
  subsets: ["telugu"],
  variable: "--font-noto-sans-telugu",
  display: "swap",
  preload: false,
});
const notoSerifTelugu = Noto_Serif_Telugu({
  subsets: ["telugu"],
  variable: "--font-noto-serif-telugu",
  display: "swap",
  preload: false,
});

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getDictionary();
  return {
    metadataBase: new URL(env().NEXT_PUBLIC_SITE_URL),
    title: { default: dict.meta.title, template: `%s · ${site.name}` },
    description: dict.meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(
        locales.map((l) => [localeLabels[l].htmlLang, `/${l}`]),
      ),
    },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      siteName: site.name,
      locale: localeLabels[locale].htmlLang.replace("-", "_"),
      type: "website",
    },
  };
}

export const viewport: Viewport = {
  // Light is the default theme; a saved dark choice updates this pre-paint.
  themeColor: "#FFFFFF",
  colorScheme: "light",
};

const SHELL_ID = "site-shell";
const MAIN_ID = "main";

export default async function LocaleLayout({ children }: LayoutProps<"/[lang]">) {
  const { locale, dict } = await getDictionary();
  const fontVars = [newsreader, hanken, notoSansTelugu, notoSerifTelugu]
    .map((font) => font.variable)
    .join(" ");

  return (
    <html
      lang={localeLabels[locale].htmlLang}
      className={`${fontVars} antialiased`}
      // The intro gate script may set data-intro before hydration.
      suppressHydrationWarning
    >
      <head>
        {/* data-js lets CSS hide reveal-on-scroll content only when JS runs. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.dataset.js="";${themeScript}${introGateScript}`,
          }}
        />
      </head>
      <body className="min-h-dvh">
        <a
          href={`#${MAIN_ID}`}
          className="fixed top-3 left-3 z-[200] -translate-y-24 rounded-full bg-gold px-5 py-3 text-sm font-medium text-charcoal transition-transform focus:translate-y-0"
        >
          {dict.a11y.skipToContent}
        </a>
        <IntroController
          copy={dict.intro}
          logoAlt={site.name}
          shellId={SHELL_ID}
          mainId={MAIN_ID}
        />
        <ServiceModalProvider
          copy={{
            enquiry: dict.enquiry,
            services: dict.services,
            a11y: dict.a11y,
            ready: dict.contact.form.ready,
          }}
        >
          <ServiceDetailsModalProvider
            locale={locale}
            copy={dict.services}
            closeLabel={dict.enquiry.close}
          >
            <div id={SHELL_ID} className="flex min-h-dvh flex-col">
              {/* Header reads the URL; Suspense lets unknown (404) paths stream it. */}
              <Suspense fallback={null}>
                <SiteHeader locale={locale} nav={dict.nav} logoAlt={site.name} />
              </Suspense>
              <main id={MAIN_ID} tabIndex={-1} className="flex-1 outline-none">
                {children}
              </main>
              <SiteFooter locale={locale} dict={dict} />
            </div>
          </ServiceDetailsModalProvider>
        </ServiceModalProvider>
      </body>
    </html>
  );
}
