/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'https://wrenynqvwkktvcqshyrm.supabase.co', // Replace with your actual Supabase URL
      'images.unsplash.com', // For demo images
      'my-store-hazel-seven.vercel.app', // Your deployment domain
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
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
};

export default nextConfig;