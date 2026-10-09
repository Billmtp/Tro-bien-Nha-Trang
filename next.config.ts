import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.phongtro123.com" },
      { protocol: "https", hostname: "*.static123.com" },
      { protocol: "https", hostname: "*.mogi.vn" },
      { protocol: "https", hostname: "static.chotot.com" },
      { protocol: "https", hostname: "*.chotot.com" },
      { protocol: "https", hostname: "*.nhatot.com" },
      { protocol: "https", hostname: "*.batdongsan.vn" },
      { protocol: "https", hostname: "img.chotot.com" },
    ],
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/api/rooms",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=30, stale-while-revalidate=60" },
        ],
      },
    ];
  },
};

export default nextConfig;
