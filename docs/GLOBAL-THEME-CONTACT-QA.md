# Global light theme and contact routing — 5 November 2026

## Delivered changes

- Centralized contact configuration now identifies **9347626862** as the primary call-only number and **9666270662** as the WhatsApp enquiry number.
- Header, mobile-menu, homepage, footer, contact-page and error-page call actions use `tel:+919347626862`. WhatsApp links and form handoffs use `https://wa.me/919666270662`, retaining encoded enquiry details.
- Contact page and footer display the primary call first and WhatsApp second, with distinct labels and phone/chat-phone icons. English and Telugu labels are provided.
- Shared light-theme tokens provide white-to-sky-blue atmosphere, soft flowing highlights, elevated white/blue cards, form surfaces, modal backgrounds and footer treatment. All five major pages use the shared system; the homepage artwork was not copied behind other sections.
- Dark palette, approved logo assets, transport imagery, fonts, page structure, services, business address, proprietor and hours remain unchanged. No backend or Phase 04 work was performed.
- Fixed an observed language-switch bug that cleared the active theme. Locale links now perform document navigation so the pre-paint theme initialization runs for the new root language layout.
- Fixed keyboard focus leaving the enquiry dialog at its tab boundaries. Tab and Shift+Tab now explicitly loop between its visible controls, including the handoff fallback link when present.

## Verification results

The baseline passed type checking, ESLint, all 193 existing tests, formatting and production build before edits. Final results:

| Check                                   | Result                                                                                                   |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| TypeScript                              | Passed                                                                                                   |
| ESLint                                  | Passed                                                                                                   |
| Vitest unit/component integration tests | 199 passed, 15 files                                                                                     |
| Production build                        | Passed; 23 static pages generated                                                                        |
| Prettier                                | Passed                                                                                                   |
| Responsive production browser checks    | 140 cases; no overflow detected                                                                          |
| Automated axe WCAG A/AA scans           | No violations on 20 route/theme/language combinations and tested travel enquiry dialogs                  |
| Browser page/internal HTTP errors       | None in the final site audit                                                                             |
| Contact routing                         | Passed across all 20 route/theme/language combinations                                                   |
| Fresh theme                             | Light, even with dark OS preference                                                                      |
| Saved dark and light preferences        | Retained after reload and actual English/Telugu link navigation                                          |
| Initial theme frames                    | Correct theme in the first 12 sampled animation frames on fresh load, saved reloads and language changes |
| Enquiry interaction                     | Empty-form validation, Escape, focus restoration and modal tab containment passed                        |
| Contact and flight WhatsApp handoffs    | Correct number in both themes/languages; intercepted locally, no message sent                            |
| Cinematic intro                         | Normal-motion completion around five seconds; reduced-motion bypass verified                             |
| Production dependency audit             | 0 vulnerabilities                                                                                        |
| Full dependency audit                   | 8 moderate development-tool advisories; 0 high/critical                                                  |

Responsive widths: **320, 375, 390, 768, 1024, 1440 and 1920px**. Routes: home, services, about, location and contact; English and Telugu; light and dark. Screenshots use Microsoft Edge through Playwright against the production build.

The full audit's moderate advisories concern `minimatch` and its ESLint/TypeScript lint-tool dependency chain. npm suggests a major downgrade of `eslint-config-next` to 15.5.29. That downgrade was not applied to this Next 16 application. Both audit reports are retained below. The jsdom test runner emits an unsupported document-navigation notice; all assertions pass.

## Screenshot evidence

[Open the complete before/after screenshot gallery](../artifacts/global-theme-gallery.html).

There are 48 baseline and 48 final captures: all five major pages plus the enquiry dialog, two languages, two themes, desktop 1440px and mobile 375px. Full-page captures include header and footer. Long mobile dialogs are scrollable; their screenshots show the visible viewport.

| Page          | Light desktop                                                       | Dark desktop                                                      |
| ------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Home          | [Light](../artifacts/global-theme-after/light-en-home-1440.png)     | [Dark](../artifacts/global-theme-after/dark-en-home-1440.png)     |
| Services      | [Light](../artifacts/global-theme-after/light-en-services-1440.png) | [Dark](../artifacts/global-theme-after/dark-en-services-1440.png) |
| About         | [Light](../artifacts/global-theme-after/light-en-about-1440.png)    | [Dark](../artifacts/global-theme-after/dark-en-about-1440.png)    |
| Location      | [Light](../artifacts/global-theme-after/light-en-location-1440.png) | [Dark](../artifacts/global-theme-after/dark-en-location-1440.png) |
| Contact       | [Light](../artifacts/global-theme-after/light-en-contact-1440.png)  | [Dark](../artifacts/global-theme-after/dark-en-contact-1440.png)  |
| Enquiry modal | [Light](../artifacts/global-theme-after/light-en-modal-1440.png)    | [Dark](../artifacts/global-theme-after/dark-en-modal-1440.png)    |

[Light page overview](../artifacts/global-theme-light-overview.png) · [Dark page overview](../artifacts/global-theme-dark-overview.png) · [Telugu mobile modal](../artifacts/global-theme-after/light-te-modal-375.png).

Visual review confirmed consistent blue atmosphere across the light pages and retained dark navy/gold styling. The original reference's daylight direction informs the new shared gradients; this is not a claim of pixel-identical reproduction. Approved opaque light-logo artwork is retained, including its white background.

The normalized dark comparison examines the top 500px at the same viewport width before/after, excluding intentionally changed contact details and footer. 18 of 20 regions are byte-identical. Two desktop captures show small vertical/raster differences on visual inspection; raw changed-pixel counts are reported without claiming whole-page identity. Footer/contact text intentionally changes in both themes.

## Files changed

- `src/config/site.ts`: typed contact roles and primary mapping.
- `src/app/globals.css`: semantic light-theme tokens and shared surface treatments.
- `src/components/contact/ContactChannels.tsx`: distinct call/WhatsApp channels and display numbers.
- `src/components/layout/SiteFooter.tsx`: ordered, labelled accessible contact links.
- `src/components/layout/StatusPanel.tsx`: correctly routed call/WhatsApp links in error states.
- `src/components/layout/LanguageSwitcher.tsx`: document navigation to preserve pre-paint theme initialization.
- `src/components/ui/WhatsAppIcon.tsx`: new theme-aware chat/phone icon.
- `src/features/service-enquiry/ServiceModal.tsx`: keyboard boundary focus loop.
- `src/i18n/dictionaries/en.ts`, `te.ts`: call and WhatsApp channel labels.
- `src/components/contact/contact-routing.test.tsx`: six new bilingual regression tests.
- `src/components/components.test.tsx`, `phase2.test.tsx`: updated expected contact mapping; existing flows retained.
- `src/features/theme/theme.test.tsx`: asserts the requested light palette and white header token; retains dark-palette and contrast checks.
- `scripts/verify-site.mjs`: adds 390px coverage.
- `scripts/verify-contact-theme.mjs`: new production contact/theme/keyboard/handoff regression checks.
- `scripts/capture-global-theme.mjs`, `report-global-theme.mjs`: screenshots, gallery, overviews and region comparisons.

No bitmap/logo/transport assets or dependency versions were changed.

## Machine-readable evidence and limitations

- [Site audit](../artifacts/site-audit.json)
- [Contact and theme verification](../artifacts/contact-theme-verification.json)
- [Dark visual comparison](../artifacts/global-theme-comparison.json)
- [Full dependency audit](../artifacts/contact-theme-audit.json)
- [Production dependency audit](../artifacts/contact-theme-production-audit.json)

Automated accessibility checks do not constitute a complete screen-reader audit. New Telugu labels should receive native-speaker review. Testing used Edge; Safari, Firefox, real mobile hardware, actual telephone calls and WhatsApp delivery were not tested. No enquiry is represented as a confirmed booking or successful external submission.

To repeat: build and start the production application, set `BASE_URL`, then run `node scripts/verify-site.mjs` and `node scripts/verify-contact-theme.mjs`. Set `CAPTURE_PHASE=after` to refresh final captures with `node scripts/capture-global-theme.mjs`; run `node scripts/report-global-theme.mjs` to regenerate the gallery and comparison evidence. Do not rebuild `.next` while production browser checks are running.
