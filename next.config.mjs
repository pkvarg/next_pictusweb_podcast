import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: false, // Ignore ESLint during production builds
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'pictusweb.sk',
      },
      {
        protocol: 'https',
        hostname: 'hono-api.pictusweb.com',
        pathname: '/api/upload/pictusweb/**',
      },
      {
        protocol: 'https',
        hostname: 'hono-api.pictusweb.com',
        pathname: '/api/upload/fleetsync/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3013',
        pathname: '/api/upload/pictusweb/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3013',
        pathname: '/api/upload/fleetsync/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/:locale/fonts/:path*',
        destination: '/fonts/:path*',
      },
      {
        source: '/storage/:path*',
        destination: '/public/storage/:path*', // Serve from the mapped directory
      },
    ]
  },
}

export default withNextIntl(nextConfig)
