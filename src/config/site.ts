/**
 * Verified business facts supplied by the proprietor.
 * Change only with the owner's confirmation.
 */
export const site = {
  name: "Sridevi Tours & Travels",
  proprietor: "V. Srinivasarao",
  phones: {
    primary: { display: "9347626862", e164: "+919347626862", purpose: "calls" },
    secondary: { display: "9666270662", e164: "+919666270662", purpose: "whatsapp" },
  },
  /** Dedicated WhatsApp enquiries; never use the primary call-only number. */
  whatsappE164: "919666270662",
  email: "sridevitravels1011@gmail.com",
  address: {
    line1: "Main Road, Near Bus Stand",
    locality: "Chagallu",
    postalCode: "534342",
    region: "Andhra Pradesh",
    country: "IN",
  },
  hours: { opens: "09:00", closes: "21:00" },
  mapsUrl: "https://maps.app.goo.gl/mtwZKkBao6XZ8KQ66",
  /**
   * Official logos, one per theme:
   * - light: white-background logo, shown ONLY in the light theme
   *   (source: "Sridevi Tours & Travels Logo.png", project root);
   * - dark: RGBA integration derived deterministically from the approved,
   *   byte-identical RGB source at /brand/sridevi-logo-dark.png. Only the
   *   background alpha/edge decontamination differs; the design is unchanged.
   * Checksums are asserted by src/components/brand/logo.test.tsx.
   */
  logos: {
    light: {
      src: "/brand/sridevi-logo-light.png",
      width: 1672,
      height: 941,
      sha256: "1028FFEF9E28D3819CED43AB6F5573E462D43BD86E70040B53735FFCB0713286",
    },
    dark: {
      src: "/brand/sridevi-logo-dark-integrated.png",
      width: 2042,
      height: 770,
      sha256: "F9FE8CEA8B12A644F9D120AB826E4BE95FDAD66F7FE74F9F481BB779A0CB92C4",
      sourceSrc: "/brand/sridevi-logo-dark.png",
      sourceSha256: "3E6F48E4D44305A0B4C9253EA10A2EA485CBEB0D4B10EEF6ECCB48C48836C31A",
    },
  },
} as const;

export type Site = typeof site;

type LogoAsset = (typeof site.logos)[keyof typeof site.logos];

/**
 * Content-versioned logo URL. The image optimiser and browsers cache by URL
 * (4 h by default), so replacing a logo file in place could keep serving the
 * old artwork. Tying the URL to the file's checksum makes every content
 * change a new URL. next.config.ts allow-lists exactly these versions.
 */
export const logoVersion = (logo: LogoAsset) => logo.sha256.slice(0, 12).toLowerCase();
export const logoUrl = (logo: LogoAsset) => `${logo.src}?v=${logoVersion(logo)}`;
