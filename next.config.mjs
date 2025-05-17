/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['image.tmdb.org', 'i.ytimg.com'],
  },
  // Production optimizations
  swcMinify: true,
  poweredByHeader: false,
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Enable app directory features
  experimental: {
    appDir: true,
  },
  // Output configuration
  output: 'standalone',
};

export default nextConfig;
