import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  eslint: {
    // Allow production builds to complete even with ESLint warnings
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Already verified with type-check, allow build to proceed
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
