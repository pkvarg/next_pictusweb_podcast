import { NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { auth } from './lib/auth'

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'sk', 'hu'],
  defaultLocale: 'sk',
})

// List of routes that require authentication  
const protectedRoutes = ['/admin', '/en/admin', '/sk/admin', '/hu/admin']

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  if (isProtectedRoute && !isLoggedIn) {
    // Extract locale from the path or default to 'sk'
    const locale = req.nextUrl.pathname.match(/^\/(en|sk|hu)/)?.[1] || 'sk'
    return NextResponse.redirect(new URL(`/${locale}/auth/login`, req.url))
  }

  // Apply internationalization middleware
  return intlMiddleware(req)
})

export const config = {
  matcher: ['/', '/(sk|en|hu)/:path*', '/admin/:path*', '/(sk|en|hu)/admin/:path*'],
}
