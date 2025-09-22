import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: import.meta.dirname,
  experimental: {
    reactCompiler: true,
  },
};

export default nextConfig;
