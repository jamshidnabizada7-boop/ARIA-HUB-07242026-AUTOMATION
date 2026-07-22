import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.wazifaha.org" },
      { protocol: "https", hostname: "wazifaha.org" },
      { protocol: "https", hostname: "scholarships.af" },
      { protocol: "https", hostname: "www.scholarships.af" },
    ],
  },
};

export default nextConfig;
