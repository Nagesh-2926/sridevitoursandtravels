# Brand & media assets

## Naming

| Kind                  | Location               | Pattern                                                           |
| --------------------- | ---------------------- | ----------------------------------------------------------------- |
| Approved brand files  | `public/brand/`        | `sridevi-<name>.<ext>` (e.g. `sridevi-logo.png`)                  |
| Provisional stand-ins | `public/brand/`        | `provisional-<name>.<ext>`                                        |
| App icons (generated) | `src/app/`             | `favicon.ico`, `icon.svg`, `apple-icon.png` (Next.js conventions) |
| Photography           | `public/media/<slot>/` | `<slot>-<n>.jpg`, e.g. `public/media/hero/hero-1.jpg`             |

## Status

| Asset                                           | Status          | Notes                                                                                                                             |
| ----------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Theme logos                                     | **Approved**    | Exact light asset; preserved exact dark source plus deterministic RGBA display derivative.                                        |
| Favicon / app icons                             | **PROVISIONAL** | Generated from `public/brand/provisional-mark.svg` (neutral flight-arc symbol, not a monogram). Not the approved brand icon.      |
| Hero photography (3 slides)                     | **Missing**     | Vector scenes stand in. Slots: `heroSlides` in `src/config/hero.ts`.                                                              |
| Travel card photography (4)                     | **Missing**     | Slots: `serviceMedia` in `src/config/media.ts` (flights, trains, buses, darshanam).                                               |
| Digital services card photography               | **Missing**     | Slot: `digitalCategoryMedia`.                                                                                                     |
| Visiting card `visitingcard.png` (project root) | Reference only  | Confirms the phone, WhatsApp, address, hours and service list. Not used on the site: its wordmark differs from the approved logo. |

## Logos: one per theme (mandatory mapping)

| Theme               | Public asset                                    | Source / derivation                                                            | Size       | SHA-256             |
| ------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------ | ---------- | ------------------- |
| **Light** (default) | `public/brand/sridevi-logo-light.png`           | `Sridevi Tours & Travels Logo.png`, exact owner file                           | 1672 × 941 | `1028FFEF…0713286`  |
| **Dark source**     | `public/brand/sridevi-logo-dark.png`            | `Vibrant Sridevi Travel Logo with Globe and Icons.png`, exact owner file       | 2042 × 770 | `3E6F48E4…8836C31A` |
| **Dark display**    | `public/brand/sridevi-logo-dark-integrated.png` | Deterministic RGBA extraction from the preserved dark source; design unchanged | 2042 × 770 | `F9FE8CEA…0CB92C4`  |

- **Light source:** `Sridevi Tours & Travels Logo(4).png` was not on disk. The owner's attached white logo is byte-identical to `Sridevi Tours & Travels Logo.png`, which is already in the root, so that file is the source.
- **Dark source:** the owner replaced the dark logo with `Vibrant Sridevi Travel Logo with Globe and Icons.png` (project root, no "(1)" in the name). It is byte-identical to the logo attached with the request.
- **RGBA extraction:** `scripts/create-dark-logo-rgba.mjs` verifies the approved source checksum before processing it, removes the sampled near-black background, decontaminates partially transparent glow pixels, and writes a genuine four-channel PNG. It does not use a generated replacement, recolouring, filtering, or blend modes.
- **Rendering:** `src/components/brand/Logo.tsx` renders the light asset and dark RGBA display derivative in a fixed box with the dark logo's 2042:770 ratio. CSS on `html[data-theme]`, set before first paint, displays exactly one: `dark-theme:hidden` on the light logo, `hidden dark-theme:block` on the dark logo. The right logo shows from the first frame, with no hydration mismatch and no layout shift when switching.
- **Placements:** the header, mobile menu, footer and About page follow the theme. The intro is always dark, so it shows the dark logo.
- **Tests:** `src/components/brand/logo.test.tsx` asserts the checksums and the mapping.
- **Transparency:** the supplied dark source is opaque 24-bit RGB. The displayed derivative has verified alpha (`channels: 4`, `hasAlpha: true`), so no rectangular background remains on dark surfaces.
- **Retired:** `sridevi-dashboard-official.png` was removed from `public/`. Its source `Sridevi Tours & Travels dashboard.png` has since been deleted from the project root, outside this work.

## Cinematic assets (Phase 03)

The intro and hero use **asset-independent vector artwork**: `src/components/art/TravelArt.tsx` and `src/components/home/HeroScenes.tsx`. It is art-directed, but it is **not** licensed photography, footage or 3D renders. A production cut would replace it with:

| Use              | Asset needed                                                                     |
| ---------------- | -------------------------------------------------------------------------------- |
| Intro 0–1 s      | Rendered Earth turntable (≥ 1080p, transparent or dark) or a licensed globe clip |
| Intro 1–2 s      | Licensed airliner fly-by footage or a 3D airliner render                         |
| Intro 2–3 s      | Licensed Indian passenger train footage or a 3D render                           |
| Intro 3–4 s      | Licensed coach + passenger car footage or renders (same lighting direction)      |
| Hero slides (3)  | Licensed photography: flights, rail/road, temple darshanam (`heroSlides`)        |
| Travel cards (4) | Licensed photography per service (`serviceMedia`)                                |

Slots accept `image` today. The intro scene keeps the same `data-intro-part` contract, so footage can replace any layer without changing the timing.

## Light theme visuals (Phase 03.2)

The owner's reference shows photographic 3D renders of an airliner, a train, a coach, a car and a temple. The site uses art-directed vectors that follow the same composition, lighting and colours:

- `LightHeroPanorama` for the hero scene;
- `ServicePictogram` for the five service cards.

These are not photo-real. To match the reference exactly, supply licensed renders or photography. Both components can be swapped for an `<Image>` without layout changes.

## Replacing the provisional icon

1. Put the owner-approved square icon at `public/brand/sridevi-icon.svg` (or a PNG of at least 512 × 512).
2. Point `source` in `scripts/generate-provisional-icons.mjs` at it, and rename the script.
3. Run `npm run icons`.

## Adding photography

Add `image: { src, alt: { en, te } }` to the slot. Requirements:

- Licensed for commercial web use, with the licence kept on file.
- At least 2400 px on the long edge.
- Subject lit to read well under a dark bottom scrim.
- No identifiable people without a release.
- No places the business does not actually serve.
