/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['image.tmdb.org', 'i.ytimg.com'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  // Move serverComponentsExternalPackages to root level as per warning
  serverExternalPackages: ['@prisma/client'],
  webpack: (config) => {
    config.externals = [...config.externals, 'prisma', 'postinstall'];
    return config;
  },
  // Disable static optimization
  staticPageGenerationTimeout: 1000,
  output: 'standalone',
};

export default nextConfig;
