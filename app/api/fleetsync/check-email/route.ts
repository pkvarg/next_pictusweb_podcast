import { NextRequest, NextResponse } from 'next/server'
import db from '@/db/db'
import { rateLimit, rateLimitResponse, getClientIP } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 requests per IP per 5 min
    const ip = getClientIP(request.headers)
    const ipLimit = rateLimit({ key: `check_email:${ip}`, maxAttempts: 10, windowMs: 5 * 60 * 1000 })
    if (!ipLimit.success) return rateLimitResponse(ipLimit.retryAfterMs)

    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ available: false, error: 'Invalid email' }, { status: 400 })
    }

    const existingUser = await db.user.findUnique({
      where: { email },
      select: { id: true },
    })

    return NextResponse.json({ available: !existingUser })
  } catch (error) {
    console.error('Email check error:', error)
    return NextResponse.json({ available: false, error: 'Server error' }, { status: 500 })
  }
}
