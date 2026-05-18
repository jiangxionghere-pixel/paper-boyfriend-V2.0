import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ark-acg-cn-beijing.tos-cn-beijing.volces.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.volces.com",
        pathname: "/**",
      },
      // Cloudflare R2 存储
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
        pathname: "/**",
      },
      // Cloudflare R2.dev 开发环境域名
      {
        protocol: "https",
        hostname: "*.r2.dev",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
