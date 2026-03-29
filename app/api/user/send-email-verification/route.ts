import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { createHash, createHmac } from 'crypto'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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
  return createHash('sha256').update(`${code}:${identifier}:${OTP_SALT}`).digest('hex')
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
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const email = session.user.email

    // Rate limit: max 3 sends per 15 minutes
    const recentCount = await prisma.verificationCode.count({
      where: {
        userId,
        purpose: 'user_email_verify',
        createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
      },
    })
    if (recentCount >= 3) {
      return NextResponse.json(
        { error: 'Príliš veľa pokusov. Počkajte prosím niekoľko minút.' },
        { status: 429 },
      )
    }

    // Remove previous unused codes
    await prisma.verificationCode.deleteMany({
      where: { userId, purpose: 'user_email_verify', usedAt: null },
    })

    const expiresAt = Date.now() + EXPIRES_MINUTES * 60 * 1000
    const code = generateOTP()
    const token = createToken(userId, 'user_email_verify', expiresAt)

    await prisma.verificationCode.create({
      data: {
        userId,
        purpose: 'user_email_verify',
        codeHash: hashCode(code, userId),
        tokenHash: hashToken(token),
        expiresAt: new Date(expiresAt),
      },
    })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true },
    })

    await fetch(`${HONO_API}/api/pictusweb/client/send-otp-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        firstName: user?.firstName || 'Zákazník',
        code,
        purpose: 'email',
      }),
    })

    return NextResponse.json({ success: true, verificationToken: token, expiresIn: EXPIRES_MINUTES * 60 })
  } catch (error: any) {
    console.error('Send email verification error:', error)
    return NextResponse.json({ error: 'Nepodarilo sa odoslať overovací email' }, { status: 500 })
  }
}
