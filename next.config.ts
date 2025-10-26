import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'localhost',
      'images.unsplash.com', // For demo images
      '*.supabase.co', // Allow all Supabase domains
      'my-store-hazel-seven.vercel.app', // Your deployment domain
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'my-store-hazel-seven.vercel.app',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'my-store-hazel-seven.vercel.app', // Your deployment domain
      ],
    },
  },
  // Enable static generation where possible
  output: 'standalone',
};

export default nextConfig;
