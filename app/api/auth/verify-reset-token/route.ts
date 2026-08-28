import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { checkIPBan } from '@/lib/checkIPBan'
import { rateLimit, rateLimitResponse, getClientIP } from '@/lib/rateLimit'
import { verifyResetToken, hashToken, RESET_PURPOSE, maskEmail } from '@/lib/resetToken'

/**
 * Validates a password-reset token server-side so the reset page can decide
 * whether to show the form or an "invalid/expired link" state. Returns a masked
 * email only (never the full address, never whether an arbitrary email exists).
 */
export async function POST(request: NextRequest) {
  try {
    const ipCheck = await checkIPBan(request)
    if (ipCheck.isBanned && ipCheck.banInfo) {
      return NextResponse.json({ valid: false, reason: 'invalid' }, { status: 403 })
    }

    const ip = getClientIP(request.headers)
    const ipLimit = rateLimit({
      key: `verify_reset:${ip}`,
      maxAttempts: 30,
      windowMs: 15 * 60 * 1000,
    })
    if (!ipLimit.success) return rateLimitResponse(ipLimit.retryAfterMs)

    const { token } = await request.json()
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ valid: false, reason: 'invalid' })
    }

    const tokenData = verifyResetToken(token)
    if (!tokenData) {
      return NextResponse.json({ valid: false, reason: 'invalid' })
    }

    const record = await prisma.verificationCode.findUnique({
      where: { tokenHash: hashToken(token) },
    })
    if (!record || record.purpose !== RESET_PURPOSE || record.usedAt) {
      return NextResponse.json({ valid: false, reason: 'invalid' })
    }
    if (record.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, reason: 'expired' })
    }

    const user = await prisma.user.findFirst({
      where: { id: record.userId, deletedAt: null, active: true },
      select: { email: true },
    })
    if (!user) {
      return NextResponse.json({ valid: false, reason: 'invalid' })
    }

    return NextResponse.json({ valid: true, emailMasked: maskEmail(user.email) })
  } catch {
    return NextResponse.json({ valid: false, reason: 'invalid' }, { status: 500 })
  }
}
