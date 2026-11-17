/**
 * JS-side design tokens. CSS tokens in src/app/globals.css are the source
 * of truth for styling; this file mirrors the values that scripts need
 * (animation timelines, SVG drawing, meta theme colour) and is checked
 * against the CSS by src/design/tokens.test.ts.
 */
export const colors = {
  charcoal: "#0B0F14",
  midnight: "#111827",
  navy: "#1E293B",
  bronze: "#8B6B46",
  gold: "#D4A762",
  grey: "#374151",
  white: "#FFFFFF",
  // Tonal extensions
  goldSoft: "#E2C08A",
  fog: "#D5D9E0",
  mist: "#A9B0BB",
} as const;

export const motion = {
  ease: {
    cinematic: "expo.out",
    gentle: "power2.inOut",
    settle: "power3.out",
  },
  duration: {
    fast: 0.16,
    base: 0.28,
    slow: 0.64,
  },
} as const;

/** Viewport widths in px; keep in sync with Tailwind defaults + `xs`. */
export const breakpoints = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;
