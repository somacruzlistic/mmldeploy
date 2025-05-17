/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['image.tmdb.org', 'i.ytimg.com'],
  },
  experimental: {
    // This will make the build process more lenient with client components
    appDir: true,
    serverActions: true,
  },
};

export default nextConfig;
