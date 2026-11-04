import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { NextConfig } from "next";

const appVersion = (
  JSON.parse(
    readFileSync(join(process.cwd(), "../../package.json"), "utf8"),
  ) as {
    version: string;
  }
).version;

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_APP_VERSION: appVersion },
  reactStrictMode: true,
  reactCompiler: true,
  typedRoutes: true,
  transpilePackages: ["@loftlancer/ui"],
  experimental: {
    agentUpgrade: "security" as const,
  },
};

export default nextConfig;
