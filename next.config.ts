import type { NextConfig } from "next";
const isProd = process.env.NODE_ENV === "production";
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rxfhqcwirdrtwprerjjs.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/items/images/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: isProd
          ? ""
          : "http://localhost:8080/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
