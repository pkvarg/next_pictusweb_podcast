import { createHash, createHmac } from 'crypto'

const SESSION_SECRET = process.env.VERIFICATION_SESSION_SECRET!

export const RESET_PURPOSE = 'password_reset'
export const RESET_EXPIRES_MINUTES = 60

/**
 * Builds an opaque, HMAC-signed, URL-safe reset token. The raw token goes in the
 * emailed link; only its hash is stored (verification_codes.tokenHash). Same
 * mechanism used by the 2FA flow.
 */
export function createResetToken(userId: string, expiresAtMs: number): string {
  const payload = `${userId}:${RESET_PURPOSE}:${expiresAtMs}`
  const sig = createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')
  return Buffer.from(`${payload}:${sig}`).toString('base64url')
}

/** Verifies the HMAC signature, purpose and expiry. Returns the userId or null. */
export function verifyResetToken(token: string): { userId: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString()
    const lastColon = decoded.lastIndexOf(':')
    if (lastColon < 0) return null
    const sig = decoded.slice(lastColon + 1)
    const payload = decoded.slice(0, lastColon)
    const expectedSig = createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')
    if (sig !== expectedSig) return null

    const parts = payload.split(':')
    const expiresAt = Number(parts[parts.length - 1])
    const purpose = parts[parts.length - 2]
    if (purpose !== RESET_PURPOSE) return null
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return null

    const userId = parts.slice(0, -2).join(':')
    if (!userId) return null
    return { userId }
  } catch {
    return null
  }
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/** t***@gmail.com — enough for the user to recognise their address, no full leak. */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain) return '***'
  const head = local.slice(0, 1)
  return `${head}${'*'.repeat(Math.max(1, local.length - 1))}@${domain}`
}
