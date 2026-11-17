import type { NextConfig } from "next";
import { logoVersion, site } from "./src/config/site";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  // Supported Next.js 16 option: keep the route inspector out of visual QA.
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
    // Local images without a query string, plus the content-versioned logo
    // URLs only (exact versions, per the next/image security guidance).
    localPatterns: [
      { pathname: "/**", search: "" },
      ...Object.values(site.logos).map((logo) => ({
        pathname: logo.src,
        search: `?v=${logoVersion(logo)}`,
      })),
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
