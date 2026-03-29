import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { createHash, randomUUID } from 'crypto'
import { createHmac } from 'crypto'

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
    const { email, phoneNumber, firstName, locale } = await request.json()

    if (!email || !phoneNumber) {
      return NextResponse.json({ error: 'Email and phone number are required' }, { status: 400 })
    }

    const expiresAt = Date.now() + EXPIRES_MINUTES * 60 * 1000
    const expiresAtDate = new Date(expiresAt)

    // Rate limit: max 3 send attempts in the last hour per email
    const recentCount = await prisma.verificationCode.count({
      where: {
        userId: email, // use email as identifier during onboarding (no userId yet)
        purpose: { in: ['onboard_email', 'onboard_phone'] },
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    })
    if (recentCount >= 6) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please wait before requesting new codes.' },
        { status: 429 },
      )
    }

    // Delete previous unused codes for this identifier
    await prisma.verificationCode.deleteMany({
      where: {
        userId: email,
        purpose: { in: ['onboard_email', 'onboard_phone'] },
        usedAt: null,
      },
    })

    // Generate codes
    const emailCode = generateOTP()
    const phoneCode = generateOTP()

    const emailToken = createToken(email, 'onboard_email', expiresAt)
    const phoneToken = createToken(phoneNumber, 'onboard_phone', expiresAt)

    // Store hashed codes in DB
    await prisma.verificationCode.createMany({
      data: [
        {
          userId: email,
          purpose: 'onboard_email',
          codeHash: hashCode(emailCode, email),
          tokenHash: hashToken(emailToken),
          expiresAt: expiresAtDate,
        },
        {
          userId: phoneNumber,
          purpose: 'onboard_phone',
          codeHash: hashCode(phoneCode, phoneNumber),
          tokenHash: hashToken(phoneToken),
          expiresAt: expiresAtDate,
        },
      ],
    })

    // Send email OTP via hono_bun
    await fetch(`${HONO_API}/api/pictusweb/client/send-otp-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        firstName: firstName || 'Zákazník',
        code: emailCode,
        purpose: 'email',
        locale: locale || 'sk',
      }),
    })

    // Send SMS OTP via hono_bun
    await fetch(`${HONO_API}/api/pictusweb/client/send-otp-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phoneNumber, code: phoneCode, purpose: 'verify' }),
    })

    return NextResponse.json({
      success: true,
      message: 'Verification codes sent',
      emailToken,
      phoneToken,
      expiresIn: EXPIRES_MINUTES * 60,
    })
  } catch (error: any) {
    console.error('Send verification error:', error)
    return NextResponse.json({ error: 'Failed to send verification codes' }, { status: 500 })
  }
}
