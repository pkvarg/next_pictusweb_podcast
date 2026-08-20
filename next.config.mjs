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
  async headers() {
    // Permissive-but-present CSP: keeps Next.js, the hono API, Firebase/Google
    // auth, analytics, fonts and the stardust video working while satisfying the
    // audit. Tighten to a nonce-based policy later if desired.
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "form-action 'self'",
      "img-src 'self' data: blob: https:",
      "media-src 'self' data: blob: https:",
      "font-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline' https:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
      "connect-src 'self' https: wss:",
    ].join('; ')

    const securityHeaders = [
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Content-Security-Policy', value: csp },
    ]

    return [
      { source: '/:path*', headers: securityHeaders },
      {
        source: '/fonts/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/pictus/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/projects/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/icons/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=604800' },
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
