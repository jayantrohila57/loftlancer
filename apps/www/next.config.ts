import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  typedRoutes: true,
  transpilePackages: ["@loftlancer/ui"],
  experimental: {
    agentUpgrade: "security" as const,
  },
};

export default nextConfig;
