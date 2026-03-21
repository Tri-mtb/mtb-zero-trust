import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fix: Silence lockfile detection warning
  outputFileTracingRoot: path.join(__dirname, "../"),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
