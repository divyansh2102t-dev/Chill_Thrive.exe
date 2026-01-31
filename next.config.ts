import type { NextConfig } from "next";


const nextConfig: NextConfig = {
    images: {
        // This bypasses some of the stricter internal IP checks during local dev
        unoptimized: process.env.NODE_ENV === 'development', 
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'bvfefybdynwjpkhjhhrk.supabase.co',
            pathname: '/storage/v1/object/public/**',
          },
        ],
      },
};

export default nextConfig;
