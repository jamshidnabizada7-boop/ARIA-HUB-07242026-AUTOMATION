import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  compress: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  experimental: {
    optimizeCss: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "www.wazifaha.org" },
      { protocol: "https", hostname: "wazifaha.org" },
      { protocol: "https", hostname: "scholarships.af" },
      { protocol: "https", hostname: "www.scholarships.af" },
    ],
  },
};

export default nextConfig;
