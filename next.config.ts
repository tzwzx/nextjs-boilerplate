import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  outputFileTracingRoot: import.meta.dirname,
  poweredByHeader: false,
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: false,
  },

  // Next.js 16: Image optimization settings
  // Uncomment this configuration when using next/image component
  // - formats: Automatically serve images in AVIF (45-55% smaller) and WebP (25-35% smaller) formats
  // - minimumCacheTTL: Cache optimized images for 60 seconds to reduce server load
  // images: {
  //   formats: ["image/avif", "image/webp"],
  //   minimumCacheTTL: 60,
  // },
};

export default nextConfig;
