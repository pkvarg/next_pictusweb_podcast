import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, rateLimitResponse, getClientIP } from '@/lib/rateLimit'

const TRUST_DAYS = 10

// Sets the device trust token as an HttpOnly cookie so JS cannot read it.
// Called by the frontend after a successful verify-2fa with trustDevice=true.
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 per IP per hour (no user identity available here)
    const ip = getClientIP(request.headers)
    const ipLimit = rateLimit({ key: `trust_device:${ip}`, maxAttempts: 10, windowMs: 60 * 60 * 1000 })
    if (!ipLimit.success) return rateLimitResponse(ipLimit.retryAfterMs)

    const { deviceToken } = await request.json()

    if (!deviceToken) {
      return NextResponse.json({ error: 'deviceToken is required' }, { status: 400 })
    }

    const response = NextResponse.json({ success: true })

    response.cookies.set('__device_trust', deviceToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: TRUST_DAYS * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('Trust device error:', error)
    return NextResponse.json({ error: 'Failed to set device trust' }, { status: 500 })
  }
}
