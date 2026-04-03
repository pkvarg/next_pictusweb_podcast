import { NextRequest, NextResponse } from 'next/server'
import { checkIPBan } from '@/lib/checkIPBan'
import axios from 'axios'
import { rateLimit, rateLimitResponse, getClientIP } from '@/lib/rateLimit'

/**
 * Forgot password proxy with IP ban protection
 * Prevents automated password reset spam attacks
 */
export async function POST(request: NextRequest) {
  try {
    // Check if IP is banned first
    const ipCheck = await checkIPBan(request)
    if (ipCheck.isBanned && ipCheck.banInfo) {
      return NextResponse.json(
        {
          error: 'Access Denied',
          message: ipCheck.banInfo.message,
          code: 'IP_BANNED',
        },
        { status: 403 },
      )
    }

    // Rate limit: 10 per IP per hour
    const ip = getClientIP(request.headers)
    const ipLimit = rateLimit({ key: `forgot_password:${ip}`, maxAttempts: 10, windowMs: 60 * 60 * 1000 })
    if (!ipLimit.success) return rateLimitResponse(ipLimit.retryAfterMs)

    // Get request body
    const body = await request.json()
    const { name, email, resetUrl, origin, locale } = body

    if (!email || !resetUrl) {
      return NextResponse.json(
        {
          error: 'Email and reset URL are required',
        },
        { status: 400 },
      )
    }

    // Rate limit: 5 per email per hour
    const emailLimit = rateLimit({ key: `forgot_password_email:${email.toLowerCase()}`, maxAttempts: 5, windowMs: 60 * 60 * 1000 })
    if (!emailLimit.success) return rateLimitResponse(emailLimit.retryAfterMs)

    // Forward to Hono API
    const honoApiUrl = `${process.env.NEXT_PUBLIC_HONO_API_URL}/api/pictusweb/client/email-forgot-password`

    const response = await axios.post(
      honoApiUrl,
      {
        name: name || 'Vážený zákazník',
        email,
        resetUrl,
        origin: origin || 'PICTUSWEB.SK',
        locale: locale || 'sk',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    // Return Hono API response
    return NextResponse.json(response.data, { status: response.status })
  } catch (error) {
    console.error('Forgot password proxy error:', error)

    // Handle axios errors
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(
        {
          error: error.response.data?.error || 'Failed to send reset email',
          message: error.response.data?.message || 'An error occurred',
        },
        { status: error.response.status },
      )
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to process password reset request',
      },
      { status: 500 },
    )
  }
}
