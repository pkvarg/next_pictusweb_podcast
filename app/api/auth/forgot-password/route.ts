import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { checkIPBan } from '@/lib/checkIPBan'
import { rateLimit, rateLimitResponse, getClientIP } from '@/lib/rateLimit'
import { createResetToken, hashToken, RESET_PURPOSE, RESET_EXPIRES_MINUTES } from '@/lib/resetToken'
import { prodLogger } from '@/lib/prodLogger'

const HONO_API = process.env.NEXT_PUBLIC_HONO_API_URL

/**
 * Password-reset request. Non-revealing: always returns the same generic
 * response so it cannot be used to enumerate accounts. The reset token is
 * generated and stored (hashed) SERVER-SIDE — the browser never mints it.
 */
export async function POST(request: NextRequest) {
  try {
    const ipCheck = await checkIPBan(request)
    if (ipCheck.isBanned && ipCheck.banInfo) {
      return NextResponse.json(
        { error: 'Access Denied', message: ipCheck.banInfo.message, code: 'IP_BANNED' },
        { status: 403 },
      )
    }

    const ip = getClientIP(request.headers)
    const ipLimit = rateLimit({
      key: `forgot_password:${ip}`,
      maxAttempts: 10,
      windowMs: 60 * 60 * 1000,
    })
    if (!ipLimit.success) return rateLimitResponse(ipLimit.retryAfterMs)

    const { email, locale } = await request.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const emailLimit = rateLimit({
      key: `forgot_password_email:${email.toLowerCase()}`,
      maxAttempts: 5,
      windowMs: 60 * 60 * 1000,
    })
    if (!emailLimit.success) return rateLimitResponse(emailLimit.retryAfterMs)

    // Case-insensitive lookup so a casing difference doesn't silently drop the reset.
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' }, deletedAt: null, active: true },
      select: { id: true, email: true, firstName: true },
    })

    if (user) {
      // Invalidate any prior unused reset tokens for this user.
      await prisma.verificationCode.deleteMany({
        where: { userId: user.id, purpose: RESET_PURPOSE, usedAt: null },
      })

      const expiresAt = Date.now() + RESET_EXPIRES_MINUTES * 60 * 1000
      const token = createResetToken(user.id, expiresAt)
      const tokenHash = hashToken(token)

      await prisma.verificationCode.create({
        data: {
          userId: user.id,
          purpose: RESET_PURPOSE,
          codeHash: tokenHash, // unused for reset; column is non-nullable
          tokenHash,
          expiresAt: new Date(expiresAt),
        },
      })

      const appUrl = process.env.NEXTAUTH_URL || 'https://www.pictusweb.sk'
      const loc = locale || 'sk'
      const resetUrl = `${appUrl}/${loc}/auth/reset-password?token=${token}`

      try {
        await fetch(`${HONO_API}/api/pictusweb/client/email-forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: user.firstName || 'Vážený zákazník',
            email: user.email,
            resetUrl,
            origin: 'PICTUSWEB.SK',
            locale: loc,
          }),
        })
      } catch (err) {
        prodLogger.error('[AUTH] forgot-password email send failed', {
          email: user.email,
          error: err instanceof Error ? err.message : String(err),
        })
      }
    } else {
      // No account. If this email actually paid, surface it (paid-but-no-account).
      const pending = await prisma.pendingOnboarding.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } },
        select: { id: true, stripeSessionId: true },
      })
      if (pending?.stripeSessionId) {
        prodLogger.error(
          '[ONBOARDING_ALERT] password-reset requested for a PAID email that has no active account',
          { email, pendingId: pending.id, source: 'forgot-password' },
        )
      }
    }

    // Identical response whether or not the account exists.
    return NextResponse.json({ success: true })
  } catch (error) {
    prodLogger.error('[AUTH] forgot-password handler error', {
      error: error instanceof Error ? error.message : String(error),
    })
    // Stay non-revealing even on internal error.
    return NextResponse.json({ success: true })
  }
}
