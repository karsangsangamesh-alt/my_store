/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // 👇 This tells Next.js to look inside "src"
  srcDir: 'src',
};

export default nextConfig;
