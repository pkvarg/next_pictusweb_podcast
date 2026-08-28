import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { hashPassword } from '@/lib/isValidPassword'
import { checkIPBan } from '@/lib/checkIPBan'
import { rateLimit, rateLimitResponse, getClientIP } from '@/lib/rateLimit'
import { verifyResetToken, hashToken, RESET_PURPOSE } from '@/lib/resetToken'
import { prodLogger } from '@/lib/prodLogger'

const HONO_API = process.env.NEXT_PUBLIC_HONO_API_URL

/**
 * Sets a new password. Requires a valid, unused, unexpired reset token that is
 * verified SERVER-SIDE. The user is derived from the token — never from a
 * client-supplied email — so nobody can change another account's password by
 * knowing its email address.
 */
export async function POST(request: NextRequest) {
  try {
    const ipCheck = await checkIPBan(request)
    if (ipCheck.isBanned && ipCheck.banInfo) {
      return NextResponse.json(
        { error: 'Access Denied', message: ipCheck.banInfo.message },
        { status: 403 },
      )
    }

    const ip = getClientIP(request.headers)
    const ipLimit = rateLimit({
      key: `update_password:${ip}`,
      maxAttempts: 15,
      windowMs: 60 * 60 * 1000,
    })
    if (!ipLimit.success) return rateLimitResponse(ipLimit.retryAfterMs)

    const { token, newPassword, locale } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 })
    }
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // 1) HMAC-verify the token, 2) confirm it is stored, unused and unexpired.
    const tokenData = verifyResetToken(token)
    if (!tokenData) {
      return NextResponse.json(
        { error: 'invalid_or_expired', code: 'INVALID_TOKEN' },
        { status: 400 },
      )
    }

    const record = await prisma.verificationCode.findUnique({
      where: { tokenHash: hashToken(token) },
    })
    if (
      !record ||
      record.purpose !== RESET_PURPOSE ||
      record.usedAt ||
      record.expiresAt < new Date()
    ) {
      return NextResponse.json(
        { error: 'invalid_or_expired', code: 'INVALID_TOKEN' },
        { status: 400 },
      )
    }

    const user = await prisma.user.findFirst({
      where: { id: record.userId, deletedAt: null, active: true },
      select: { id: true, email: true, firstName: true },
    })
    if (!user) {
      return NextResponse.json(
        { error: 'invalid_or_expired', code: 'INVALID_TOKEN' },
        { status: 400 },
      )
    }

    const hashedPassword = await hashPassword(newPassword)

    // Update the password and burn the token (single use) atomically.
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword, updatedAt: new Date() },
      }),
      prisma.verificationCode.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      prisma.verificationCode.deleteMany({
        where: { userId: user.id, purpose: RESET_PURPOSE, usedAt: null },
      }),
    ])

    prodLogger.warn('[AUTH] password reset completed', { userId: user.id })

    // Confirmation email, server-side (fire-and-forget).
    const appUrl = process.env.NEXTAUTH_URL || 'https://www.pictusweb.sk'
    const loc = locale || 'sk'
    fetch(`${HONO_API}/api/pictusweb/client/email-reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: user.firstName || 'Vážený zákazník',
        email: user.email,
        loginUrl: `${appUrl}/${loc}/auth/login`,
        origin: 'PICTUSWEB.SK',
        locale: loc,
      }),
    }).catch((err) =>
      prodLogger.error('[AUTH] password-changed email failed', {
        userId: user.id,
        error: err instanceof Error ? err.message : String(err),
      }),
    )

    return NextResponse.json(
      { success: true, message: 'Password updated successfully' },
      { status: 200 },
    )
  } catch (error) {
    prodLogger.error('[AUTH] update-password error', {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
