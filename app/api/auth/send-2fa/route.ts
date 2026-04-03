import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { createHash, createHmac } from 'crypto'
import { rateLimit, rateLimitResponse, getClientIP } from '@/lib/rateLimit'

const OTP_SALT = process.env.OTP_SALT!
const SESSION_SECRET = process.env.VERIFICATION_SESSION_SECRET!
const HONO_API = process.env.NEXT_PUBLIC_HONO_API_URL!
const EXPIRES_MINUTES = 10

function generateOTP(): string {
  const arr = new Uint32Array(1)
  crypto.getRandomValues(arr)
  return String(100000 + (arr[0] % 900000))
}

function hashCode(code: string, identifier: string): string {
  return createHash('sha256')
    .update(`${code}:${identifier}:${OTP_SALT}`)
    .digest('hex')
}

function createToken(identifier: string, purpose: string, expiresAt: number): string {
  const payload = `${identifier}:${purpose}:${expiresAt}`
  const sig = createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')
  return Buffer.from(`${payload}:${sig}`).toString('base64url')
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const { email, locale, ipAddress, userAgent } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Rate limit: 10 sends per IP per 15 min
    const ip = getClientIP(request.headers)
    const ipLimit = rateLimit({ key: `send_2fa:${ip}`, maxAttempts: 10, windowMs: 15 * 60 * 1000 })
    if (!ipLimit.success) return rateLimitResponse(ipLimit.retryAfterMs)

    // Look up user
    const user = await prisma.user.findUnique({
      where: { email, deletedAt: null, active: true },
      select: { id: true, firstName: true, email: true },
    })

    if (!user) {
      // Return success to avoid email enumeration
      return NextResponse.json({ success: true })
    }

    // Rate limit: max 3 sends per 15 minutes per user
    const recentCount = await prisma.verificationCode.count({
      where: {
        userId: user.id,
        purpose: '2fa_login',
        createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
      },
    })
    if (recentCount >= 3) {
      return NextResponse.json(
        { error: 'Too many 2FA requests. Please wait a few minutes.' },
        { status: 429 },
      )
    }

    // Delete previous unused 2FA codes
    await prisma.verificationCode.deleteMany({
      where: { userId: user.id, purpose: '2fa_login', usedAt: null },
    })

    const expiresAt = Date.now() + EXPIRES_MINUTES * 60 * 1000
    const code = generateOTP()
    const token = createToken(user.id, '2fa_login', expiresAt)

    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        purpose: '2fa_login',
        codeHash: hashCode(code, user.id),
        tokenHash: hashToken(token),
        expiresAt: new Date(expiresAt),
      },
    })

    // Send via hono_bun
    await fetch(`${HONO_API}/api/pictusweb/client/send-otp-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        firstName: user.firstName || 'Zákazník',
        code,
        purpose: '2fa',
        locale: locale || 'sk',
        ipAddress: ipAddress || 'neznáma',
        userAgent: userAgent || 'neznámy',
      }),
    })

    return NextResponse.json({ success: true, verificationToken: token, expiresIn: EXPIRES_MINUTES * 60 })
  } catch (error: any) {
    console.error('Send 2FA error:', error)
    return NextResponse.json({ error: 'Failed to send 2FA code' }, { status: 500 })
  }
}
