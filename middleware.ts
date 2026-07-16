import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { getToken } from 'next-auth/jwt'

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'sk', 'hu'],
  defaultLocale: 'sk',
})

// Routes that require authentication
const protectedRoutes = [
  '/admin',
  '/en/admin',
  '/sk/admin',
  '/hu/admin',
  '/client',
  '/en/client',
  '/sk/client',
  '/hu/client',
]
// Routes that require admin role
const adminRoutes = ['/admin', '/en/admin', '/sk/admin', '/hu/admin']
// Routes that should not be processed by auth middleware
const publicRoutes = ['/auth', '/en/auth', '/sk/auth', '/hu/auth']

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isLoggedIn = !!token
  const userRole = token?.role // Get role from JWT token

  const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => req.nextUrl.pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // Extract locale from the path or default to 'sk'
  const locale = req.nextUrl.pathname.match(/^\/(en|sk|hu)/)?.[1] || 'sk'

  // Skip auth processing for public routes (auth pages, error pages)
  if (isPublicRoute) {
    return intlMiddleware(req)
  }

  // Redirect to login if not authenticated
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL(`/${locale}/auth/login`, req.url))
  }

  // Check admin access - user must have ADMIN role in JWT token
  if (isAdminRoute && isLoggedIn) {
    // Only allow access if user has ADMIN role (check both cases for compatibility)
    if (userRole !== 'ADMIN' && userRole !== 'admin') {
      return NextResponse.redirect(new URL(`/${locale}`, req.url))
    }
  }

  // Apply internationalization middleware
  return intlMiddleware(req)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sitemap.xml, robots.txt, etc. (SEO files)
     * - files with extensions (static assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$|.*\\.webp$|.*\\.css$|.*\\.js$|.*\\.json$|.*\\.mp3$|.*\\.mp4$|.*\\.webm$|.*\\.mov$).*)',
  ],
}
