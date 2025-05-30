/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      // appDir: true,
      // typedRoutes: true,
      forceSwcTransforms: false,
    },
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: '**', // Allow all image URLs for development
          }
        ],
    },
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    },
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
  };
  
  module.exports = nextConfig;