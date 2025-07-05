import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Ignore ESLint errors in production builds
  },
  // Add other config options here if needed
};

export default nextConfig;
