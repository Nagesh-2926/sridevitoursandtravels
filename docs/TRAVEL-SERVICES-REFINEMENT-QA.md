# Travel services UI refinement — 6 November 2026

The Travel & ticketing section on the Services page now follows the supplied Telugu light/dark reference. It uses one shared four-card component in both themes; theme switching changes only color, gradient, border, shadow, wave and icon tokens.

## Implementation

- Replaced the previous separate light card and oversized dark image card in the travel grid with `TravelTicketCard`.
- Preserved the four existing services, Telugu/English titles and descriptions, assistance badge and service-specific enquiry modal routing.
- Desktop uses four equal cards in one row, tablet uses two columns, and mobile uses one column. All cards remain equal height at every checked width.
- Added the white/icy-blue light background, restrained blue waves, navy text, white cards and orange actions shown in the reference.
- Added the deep `#071426`/`#101D31` dark treatment, muted-gold waves and borders, gold icons/actions, white titles and soft-white body copy.
- Hover movement is limited to 3px over 260ms and is disabled under reduced-motion preference.
- Disabled the Next.js development route indicator through the supported `devIndicators: false` configuration. Compile/runtime error reporting remains enabled.
- Preserved logos, header, navigation, language/theme switching, digital-services cards, contact details, footer and other routes.

The reference image's “Light Theme (Reference)” and “Dark Theme (Same Layout)” pills are annotations describing its two halves, so they were not added to the website.

## Verification

- TypeScript: passed.
- ESLint: passed with no errors or warnings.
- Prettier: passed.
- Vitest: 199 tests passed in 15 files.
- Production build: passed; 23 static pages generated.
- Full site browser audit: 140 route/viewport cases passed with no findings.
- Dedicated Services audit: English and Telugu, light and dark, at 320, 375, 768, 1024, 1440 and 1920px. All 24 combinations passed.
- Light and dark card/section geometry is programmatically identical at each locale and viewport.
- No horizontal overflow; expected responsive grids are 4/2/1 cards on desktop/tablet/mobile.
- All four cards have equal rendered heights at each tested size.
- Automated axe WCAG A/AA scan: zero violations in the refined section in either theme/language.
- Enquiry links route to the correct service; modal opening, Escape dismissal and trigger-focus restoration passed.
- Contact-routing audit remains clean: calls use 9347626862 and WhatsApp uses 9666270662.
- Development-mode browser verification found no rendered Next.js route indicator. A zero-size shadow portal remains for runtime-error reporting, as intended.

## Screenshot evidence

- [Paired Telugu light/dark comparison](../artifacts/travel-services/te-light-dark-comparison.png)
- [Telugu light desktop](../artifacts/travel-services/te-light-1440.png)
- [Telugu dark desktop](../artifacts/travel-services/te-dark-1440.png)
- [Telugu light mobile](../artifacts/travel-services/te-light-375.png)
- [Telugu dark mobile](../artifacts/travel-services/te-dark-375.png)
- [English light desktop](../artifacts/travel-services/en-light-1440.png)
- [English dark desktop](../artifacts/travel-services/en-dark-1440.png)
- [Development indicator disabled](../artifacts/travel-services/dev-indicator-disabled.png)
- [Machine-readable Services audit](../artifacts/travel-services/results.json)

## Files changed

- `src/components/services/TravelTicketCard.tsx` — shared travel-card component.
- `src/components/services/ServiceGrid.tsx` — uses one travel-card tree in both themes.
- `src/app/[lang]/services/page.tsx` — section-specific heading and grid hooks.
- `src/app/globals.css` — reference-matched theme tokens, waves, card layout and responsive rules.
- `next.config.ts` — supported development-indicator disablement.
- `src/components/phase2.test.tsx` — regression coverage for one shared four-card grid.
- `scripts/verify-travel-services.mjs` — geometry, responsive, accessibility and interaction audit.
- `scripts/verify-dev-indicator.mjs` — development indicator verification.
- `scripts/report-travel-services.mjs` — paired screenshot evidence generator.

No assets, translations, dependency versions, contact configuration or backend code were changed.

## Remaining limits

The implementation uses the project's approved SVG pictograms rather than copying raster pixels from the reference. Browser antialiasing and installed Telugu font rendering can cause small pixel differences. Automated accessibility checks do not replace testing with a real screen reader. Visual verification used Microsoft Edge through Playwright; Safari, Firefox and physical devices were not part of this pass.
