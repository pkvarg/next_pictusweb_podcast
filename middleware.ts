import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { isValidPassword } from './lib/isValidPassword'

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'sk'],
  defaultLocale: 'sk',
})

export async function middleware(req: NextRequest) {
  // Check if the request is for the admin route
  if (req.nextUrl.pathname.match(/^\/(en|sk)?\/admin/)) {
    if (!(await isAuthenticated(req))) {
      return new NextResponse('Unauthorized', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic' },
      })
    }
  }

  // Apply internationalization middleware
  return intlMiddleware(req)
}

async function isAuthenticated(req: NextRequest) {
  const authHeader =
    req.headers.get('authorization') || req.headers.get('Authorization')

  if (authHeader == null) return false

  const [username, password] = Buffer.from(authHeader.split(' ')[1], 'base64')
    .toString()
    .split(':')

  return (
    username === process.env.ADMIN_USERNAME &&
    (await isValidPassword(
      password,
      process.env.HASHED_ADMIN_PASSWORD as string
    ))
  )
}

export const config = {
  matcher: ['/', '/(sk|en)/:path*', '/admin/:path*', '/(sk|en)/admin/:path*'],
}
