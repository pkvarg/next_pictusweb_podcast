import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { createHash, createHmac, randomUUID } from 'crypto'

const OTP_SALT = process.env.OTP_SALT!
const SESSION_SECRET = process.env.VERIFICATION_SESSION_SECRET!
const MAX_ATTEMPTS = 5
const TRUST_DAYS = 10

function hashCode(code: string, identifier: string): string {
  return createHash('sha256')
    .update(`${code}:${identifier}:${OTP_SALT}`)
    .digest('hex')
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function verifyToken(token: string): { identifier: string; purpose: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString()
    const lastColon = decoded.lastIndexOf(':')
    const sig = decoded.slice(lastColon + 1)
    const payload = decoded.slice(0, lastColon)
    const expectedSig = createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')
    if (sig !== expectedSig) return null
    const parts = payload.split(':')
    const expiresAt = Number(parts[parts.length - 1])
    if (Date.now() > expiresAt) return null
    const purpose = parts[parts.length - 2]
    const identifier = parts.slice(0, -2).join(':')
    return { identifier, purpose }
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { verificationToken, code, trustDevice, userAgent, ipAddress } = await request.json()

    if (!verificationToken || !code) {
      return NextResponse.json({ error: 'verificationToken and code are required' }, { status: 400 })
    }

    const tokenData = verifyToken(verificationToken)
    if (!tokenData || tokenData.purpose !== '2fa_login') {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const userId = tokenData.identifier
    const tokenHash = hashToken(verificationToken)

    const record = await prisma.verificationCode.findUnique({ where: { tokenHash } })
    if (!record || record.usedAt || record.expiresAt < new Date() || record.purpose !== '2fa_login') {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 })
    }

    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    })

    if (record.attempts + 1 > MAX_ATTEMPTS) {
      return NextResponse.json({ error: 'Too many attempts. Please request a new code.' }, { status: 429 })
    }

    if (record.codeHash !== hashCode(code, userId)) {
      const remaining = MAX_ATTEMPTS - (record.attempts + 1)
      return NextResponse.json(
        { error: 'Incorrect code', attemptsRemaining: remaining },
        { status: 401 },
      )
    }

    // Mark code as used
    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    })

    let deviceToken: string | undefined

    if (trustDevice) {
      deviceToken = randomUUID()
      const expiresAt = new Date(Date.now() + TRUST_DAYS * 24 * 60 * 60 * 1000)

      await prisma.trustedDevice.create({
        data: {
          userId,
          deviceHash: hashToken(deviceToken),
          userAgent: userAgent ? String(userAgent).slice(0, 500) : null,
          ipAddress: ipAddress ? String(ipAddress).slice(0, 45) : null,
          expiresAt,
        },
      })
    }

    return NextResponse.json({ success: true, deviceToken })
  } catch (error: any) {
    console.error('Verify 2FA error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
