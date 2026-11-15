import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Embedded Postgres used for local development only (see src/lib/db.ts).
  serverExternalPackages: ["@electric-sql/pglite"],
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Placeholder photography is served from Unsplash. Replace the sources in
    // src/config/images.ts with owned assets (ideally local files in /public)
    // before launch and remove this pattern.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
