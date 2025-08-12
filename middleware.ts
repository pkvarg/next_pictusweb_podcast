import { NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { auth } from './lib/auth'

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
const publicRoutes = ['/auth/error', '/en/auth/error', '/sk/auth/error', '/hu/auth/error']

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const userEmail = req.auth?.user?.email

  const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => req.nextUrl.pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // Extract locale from the path or default to 'sk'
  const locale = req.nextUrl.pathname.match(/^\/(en|sk|hu)/)?.[1] || 'sk'

  // Skip auth processing for public routes (like error pages)
  if (isPublicRoute) {
    return intlMiddleware(req)
  }

  // Redirect to login if not authenticated
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL(`/${locale}/auth/login`, req.url))
  }

  // Check admin access - only allow if user email matches ADMIN_USERNAME
  if (isAdminRoute && isLoggedIn && userEmail !== process.env.ADMIN_USERNAME) {
    return NextResponse.redirect(new URL(`/${locale}`, req.url))
  }

  // Redirect admin user from client to admin area
  if (
    req.nextUrl.pathname.match(/^\/(en|sk|hu)?\/client/) &&
    isLoggedIn &&
    userEmail === process.env.ADMIN_USERNAME
  ) {
    return NextResponse.redirect(new URL(`/${locale}/admin`, req.url))
  }

  // Apply internationalization middleware
  return intlMiddleware(req)
})

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
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$|.*\\.webp$|.*\\.css$|.*\\.js$|.*\\.json$).*)',
  ],
}
