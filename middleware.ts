import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { getToken } from 'next-auth/jwt'

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'sk', 'hu'],
  defaultLocale: 'sk',
  // Harden the NEXT_LOCALE cookie (was set without Secure) — the audit flagged it.
  localeCookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
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
  '/picdocs/app',
  '/en/picdocs/app',
  '/sk/picdocs/app',
  '/hu/picdocs/app',
]
// Routes that require admin role
const adminRoutes = ['/admin', '/en/admin', '/sk/admin', '/hu/admin']
// Routes that should not be processed by auth middleware
const publicRoutes = ['/auth', '/en/auth', '/sk/auth', '/hu/auth']

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isLoggedIn = !!token
  const userRole = token?.role // Get role from JWT token
  const userProduct = (token?.product as string) || 'FLEETSYNC' // Product dimension (missing = FleetSync)

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

  // Product guard for logged-in non-admins — keep each product's users in their own workspace.
  // Admins are exempt: they manage both products.
  if (isLoggedIn && userRole !== 'ADMIN' && userRole !== 'admin') {
    const path = req.nextUrl.pathname.replace(/^\/(en|sk|hu)/, '')
    // FleetSync workspace, but a PicDocs user → send to PicDocs workspace
    if (path.startsWith('/client') && userProduct === 'PICDOCS') {
      return NextResponse.redirect(new URL(`/${locale}/picdocs/app`, req.url))
    }
    // PicDocs workspace, but a FleetSync user → send to FleetSync workspace
    if (path.startsWith('/picdocs/app') && userProduct !== 'PICDOCS') {
      return NextResponse.redirect(new URL(`/${locale}/client`, req.url))
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
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$|.*\\.webp$|.*\\.css$|.*\\.js$|.*\\.json$|.*\\.webmanifest$|.*\\.mp3$|.*\\.mp4$|.*\\.webm$|.*\\.mov$).*)',
  ],
}
