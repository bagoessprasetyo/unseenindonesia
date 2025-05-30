/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      // appDir: true,
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
    webpack: (config) => {
      // Handle mapbox-gl workers
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
      
      return config;
    },
  };
  
  module.exports = nextConfig;