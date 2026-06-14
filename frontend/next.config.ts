import path from "node:path";
import type { NextConfig } from "next";

const frontendDir = path.resolve(__dirname);
const repoRoot = path.resolve(frontendDir, "..");

const nextConfig: NextConfig = {
  // Trace monorepo deps from repo root on Vercel; align with turbopack.root there.
  outputFileTracingRoot: repoRoot,
  turbopack: {
    root: process.env.VERCEL === "1" ? repoRoot : frontendDir,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "frontier-biomed-public-assets.s3.eu-north-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.s3.eu-north-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
