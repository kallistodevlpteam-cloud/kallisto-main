import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
  },
  experimental: {
    // Turbopack is already the default in dev; keep tree-shaking tight
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
    ],
  },
  async headers() {
    return [
      {
        // Cache static assets aggressively in production
        source: "/assets/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Cache API responses briefly to reduce repeated backend load
        source: "/api/projects",
        headers: [
          { key: "Cache-Control", value: "private, max-age=10, stale-while-revalidate=30" },
        ],
      },
      {
        // Cache images from public
        source: "/:path*.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, immutable" },
        ],
      },
      {
        source: "/:path*.jpg",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
