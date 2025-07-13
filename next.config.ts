import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rxfhqcwirdrtwprerjjs.supabase.co', // Hostname dari error
        port: '',
        pathname: '/storage/v1/object/public/items/images/**', // Path opsional untuk lebih spesifik
      },
    ],
  },
};

export default nextConfig;
