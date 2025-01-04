import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true, // Enables the App Router (Next.js 13+)
  },
  // Add any other options here if needed
};

export default nextConfig;
