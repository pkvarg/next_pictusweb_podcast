import { createHmac, timingSafeEqual } from 'crypto'

// Short-lived token that lets an admin start (or leave) an impersonated session without a password.
// It is minted server-side only after an admin check, handed to the browser, and immediately spent
// against the 'impersonate' NextAuth provider, so a 60s lifetime is plenty.
const TTL_MS = 60_000

function secret(): string {
  const s = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
  if (!s) throw new Error('NEXTAUTH_SECRET / AUTH_SECRET is not set')
  return s
}

export interface ImpersonationClaims {
  sub: string
  by?: string
}

export function signImpersonationToken(claims: ImpersonationClaims): string {
  const payload = { ...claims, exp: Date.now() + TTL_MS }
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = createHmac('sha256', secret()).update(body).digest('base64url')
  return `${body}.${sig}`
}

export function verifyImpersonationToken(token: string): ImpersonationClaims | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [body, sig] = parts
  const expected = createHmac('sha256', secret()).update(body).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    if (typeof payload.sub !== 'string') return null
    if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return null
    return { sub: payload.sub, by: typeof payload.by === 'string' ? payload.by : undefined }
  } catch {
    return null
  }
}
