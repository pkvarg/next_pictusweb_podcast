import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import prisma from '@/db/db'
import { isValidPassword, hashPassword } from '@/lib/isValidPassword'
import { checkIPBan } from '@/lib/checkIPBan'
import { rateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { prodLogger } from '@/lib/prodLogger'

const HONO_API = process.env.NEXT_PUBLIC_HONO_API_URL

/**
 * Change password for the currently logged-in user. Identity comes from the
 * NextAuth session (not a client-supplied email), and the current password is
 * verified server-side — so it cannot be used to change another account.
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

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    })
    if (!token?.id && !token?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { currentPassword, newPassword, locale } = await request.json()
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 })
    }
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const rl = rateLimit({
      key: `change_password:${token.id || token.email}`,
      maxAttempts: 10,
      windowMs: 60 * 60 * 1000,
    })
    if (!rl.success) return rateLimitResponse(rl.retryAfterMs)

    const user = await prisma.user.findFirst({
      where: {
        ...(token.id ? { id: token.id as string } : { email: token.email as string }),
        deletedAt: null,
        active: true,
      },
      select: { id: true, email: true, firstName: true, password: true },
    })

    if (!user || !user.password) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const valid = await isValidPassword(currentPassword, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
    }

    const hashed = await hashPassword(newPassword)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, updatedAt: new Date() },
    })

    prodLogger.warn('[AUTH] password changed by logged-in user', { userId: user.id })

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

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    prodLogger.error('[AUTH] change-password error', {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
