import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint during production builds
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '',
      },
    ],
  },
}

export default withNextIntl(nextConfig)
