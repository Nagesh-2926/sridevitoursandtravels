# Dashboard sizing verification — 5 November 2026

This pass changes sizing and spacing only. The existing navigation, logos, artwork, fonts, colors, routes and business configuration are retained. No backend or Phase 04 work was performed.

## Changes

- Desktop hero height increased by 16.8% at 1024px, 18% at 1440px and 17.8% at 1920px (including the existing header offset).
- Desktop artwork widened from 40.7% to 43%, preserving aspect ratio and centering it vertically. This also fixes artwork extending below the hero at 1920px.
- Added space between heading, description and actions; adjusted mobile and tablet spacing without widening artwork beyond its container.
- Increased service-card padding and height, aligned description rows and anchored actions toward the card bottom.
- Adjusted the dark background crop to remove a stray strip of the reference header at wide desktop sizes.

Implementation: `src/app/globals.css`. New repeatable browser checks: `scripts/verify-sizing.mjs` and `scripts/verify-site.mjs`. No assets were created or replaced.

## Screenshots and comparison

Actual production-application screenshots, captured with reduced motion enabled:

| Theme | Before (1440px)                                     | After (1440px)                                    |
| ----- | --------------------------------------------------- | ------------------------------------------------- |
| Light | [Before](../artifacts/sizing-before/light-1440.png) | [After](../artifacts/sizing-after/light-1440.png) |
| Dark  | [Before](../artifacts/sizing-before/dark-1440.png)  | [After](../artifacts/sizing-after/dark-1440.png)  |

The original combined reference was inspected as separate [light](../artifacts/reference-light.png) and [dark](../artifacts/reference-dark.png) regions. The existing composition and palette remain intact; the requested larger spacing deliberately differs from the reference dimensions. This is not a claim of pixel-perfect reproduction. Existing artwork crop boundaries and differences between the site's icons and the original reference remain outside this sizing-only pass.

Screenshots at all six requested widths are in `artifacts/sizing-after`. Desktop before/after captures use matching widths. Earlier mobile baseline captures stop at the viewport bottom, while final captures include all five service cards; do not treat those differently sized images as normalized pixel differences.

## Verification

- Production build: passed, all 23 static pages generated.
- TypeScript and ESLint: passed.
- Prettier formatting check: passed.
- Vitest: 193 tests passed across 14 files. jsdom reports its expected unsupported document-navigation notice; no test fails.
- Responsive production audit: 320, 375, 768, 1024, 1440 and 1920px, both themes and English/Telugu, across home, services, about, location and contact: 120 route/viewport cases.
- No horizontal overflow, browser page errors or internal HTTP errors found in those checks.
- Header and logo geometry matches the captured baseline at every requested width. Desktop artwork fits inside the hero without distortion.
- Automated axe WCAG A/AA checks found no violations on the 20 route/theme/language combinations or tested enquiry dialogs.
- Travel enquiry validation, Escape dismissal and focus restoration, mobile-menu keyboard dismissal, theme persistence, and contact validation were checked.
- WhatsApp handoff URL and fallback link were verified with `window.open` intercepted; no message was sent. External delivery is not verified.
- Reduced-motion captures omit the cinematic intro. A separate normal-motion check confirms intro completion at approximately five seconds.

Machine-readable evidence: [sizing measurements](../artifacts/sizing-after/results.json) and [site audit](../artifacts/site-audit.json). Automated accessibility checks do not replace a full assistive-technology audit.

To repeat against a running production server, set `BASE_URL` to its URL. Run `node scripts/verify-site.mjs`; set `CAPTURE_PHASE=after` before running `node scripts/verify-sizing.mjs` to compare against the saved baseline.
