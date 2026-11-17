# Homepage reference implementation and verification

Implemented 2026-11-04. The running frontend was inspected in light and dark themes. This is a closer implementation, **not a pixel-perfect reproduction**. No backend, database, payment, booking, business phone configuration, or intro timeline changes were made.

## Implementation

- Both themes now share the compact hero, three selectable information panels, and five service cards. Previously the dark homepage had a different services layout.
- The reference's supplied day/night vehicle artwork is presented through CSS background windows. Airplane, train, bus, car, and gopuram remain visible in both themes. This is real raster artwork from the supplied reference, not the former SVG vehicle panorama.
- The hero opens on rail and road. Manual panels and mobile indicators remain; autoplay and playback controls were removed. Screen-reader slide announcements remain. Intro animation and reduced-motion handling are independent and unchanged.
- Light remains the default; persisted manual selection and CSS-based logo switching remain intact. Existing locale dictionaries, enquiry modals, validation, WhatsApp handoff, navigation routes, and phone links are retained.
- Small orange buttons use dark labels to maintain contrast. Cards use accessible darker orange text in light mode and gold in dark mode.

## Modified and created files

Modified:

- `src/app/[lang]/page.tsx`: shared services showcase; removed duplicate dark services section.
- `src/app/globals.css`: reference geometry, theme surfaces, artwork windows, responsive layout, header alignment, and icon treatment.
- `src/components/home/Hero.tsx`: shared hero container.
- `src/components/home/HeroCarousel.tsx`: manual selection, artwork, accessible announcements, no playback UI.
- `src/components/home/LightServicesShowcase.tsx`: now shared across both themes.
- `src/components/services/LightServiceCard.tsx`: shared styling hook.
- `src/components/layout/SiteHeader.tsx`: keep Call Us text visible.
- `package.json`, `package-lock.json`: Playwright and axe development dependencies; `test:browser` script.

Created:

- `public/art/travel-reference.png`: byte-for-byte copy of user-supplied reference.
- `src/components/home/reference.test.tsx`: regression for initial rail/road content, removal of playback UI, artwork presence, and accessible manual selection.
- `scripts/verify-homepage.mjs`: real browser checks, responsive screenshots, theme persistence, logos, modal, Telugu, runtime errors, and axe checks.
- `scripts/compare-homepage.mjs`: separate reference crops, normalized actual screenshots, comparison sheets and amplified difference images.
- `artifacts/`: actual screenshots and machine-readable verification results.

## Assets

| Asset                                           | Source and usage                                                                                                                                                 |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/brand/sridevi-logo-light.png`           | Existing approved 1672�941 artwork; untouched; light theme only.                                                                                                 |
| `public/brand/sridevi-logo-dark.png`            | Preserved byte-identical 2042×770 owner source; opaque RGB.                                                                                                      |
| `public/brand/sridevi-logo-dark-integrated.png` | Deterministic RGBA display derivative; transparent background, unchanged design and dimensions.                                                                  |
| `public/art/travel-reference.png`               | User-supplied 1672�941 reference. CSS shows the central daytime/nighttime compositions and text-free sky edge. No external stock image or generated replacement. |
| Service pictograms                              | Existing local SVG components, with theme-aware colors. All five cards include icons.                                                                            |

Standalone, high-resolution day/night hero masters are still unavailable. CSS windows avoid baking reference text or controls into the functional UI, but image quality cannot exceed the supplied raster. Asset redistribution rights were not independently established beyond its provision for this implementation.

## Verification

- TypeScript: passed.
- ESLint: passed.
- Vitest: **192 tests passed across 14 files**. Existing tests were neither weakened nor removed. jsdom reports its existing external navigation warning during enquiry testing.
- Production build: passed, including all existing locale routes.
- Browser: headless Microsoft Edge via Playwright, against a production Next.js server. English light/dark screenshots at 320, 375, 430, 768, 1024, 1280, 1440, 1672, and 1920px; no document horizontal overflow. Five cards remain present at every size. Telugu checked at 375px.
- Theme: first visit light, switch to dark, reload and navigation persistence, and visible theme-specific logos verified.
- Interaction: service enquiry modal opens; Escape closes it. Existing unit tests cover validation, WhatsApp handoff, localization, keyboard behavior, and intro/reduced-motion behavior.
- Accessibility: zero axe WCAG 2 A/AA and 2.1 AA violations on either desktop homepage. This is automated coverage, not a full manual screen-reader audit.
- Production dependency audit: zero vulnerabilities.
- Full dependency audit: **16 moderate development-tooling findings** in the ESLint/minimatch dependency tree, zero high/critical. npm proposes breaking tooling downgrades; these were not applied as part of a frontend visual change.

Run `npm run test:browser` with the app on port 3000, or set `BASE_URL`. Microsoft Edge must be installed. Run `node scripts/compare-homepage.mjs` after browser capture.

## Visual evidence and remaining differences

`light-showcase.png` and `dark-showcase.png` are actual running-application captures. `comparison-light.png` and `comparison-dark.png` place the corresponding reference region above the normalized application capture. The reference is split at y=485: light 1672�485, dark 1672�456. The actual showcase region is resized to the corresponding dimensions for comparison; this normalization changes its aspect ratio slightly and is not evidence of matching geometry. Difference maps amplify RGB differences threefold. Numeric measurements are in `comparison-results.json` and are diagnostic, not similarity percentages.

Visually confirmed: matching subject composition, selected rail panel, two-line headline, same layout across themes, five aligned cards, theme-specific surfaces, and clearly visible vehicle/temple artwork. Responsive layouts reflow cards and hide desktop panels in favor of touch-sized indicators on small phones.

Remaining differences: approved logo artwork differs from the logo embedded in the reference and has different internal padding; it was preserved. Sky/cloud blending and waves are simplified; type rasterization and some spacing differ; existing service pictograms are less detailed; card heights and text wrapping differ; dark artwork's reflection area is shorter to exclude the reference's baked-in services label. The original digital catalogue CTA wording is retained. High-resolution standalone artwork and further visual tuning are needed to satisfy a strict pixel-accuracy acceptance criterion.
