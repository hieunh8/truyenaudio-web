import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Required for Cloudflare Pages deployment
  // @cloudflare/next-on-pages uses the edge runtime
  experimental: {},
};

export default nextConfig;
