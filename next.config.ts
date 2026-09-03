import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js が AGENTS.md を生成しないようにし、ルールを Cursor に集約する
  agentRules: false,
  poweredByHeader: false,
  reactCompiler: true,
};

export default nextConfig;
