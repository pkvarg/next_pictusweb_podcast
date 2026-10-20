import { createHmac } from 'crypto'

const TOKEN_TTL_SECONDS = 10 * 60

// Signs a short-lived pass for the hono upload API with PICTUSWEB_UPLOAD_SECRET (server only, never
// NEXT_PUBLIC_). 'pictusweb' covers podcast media, 'fleetsync' vehicle photos bound to one organization.
export function signUploadToken(client: 'pictusweb' | 'fleetsync', org?: string) {
  const secret = process.env.PICTUSWEB_UPLOAD_SECRET
  if (!secret) return null

  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
  const payload = Buffer.from(JSON.stringify({ client, exp, ...(org && { org }) })).toString('base64url')
  const signature = createHmac('sha256', secret).update(payload).digest('base64url')
  return { token: `${payload}.${signature}`, expiresAt: exp * 1000 }
}

// Same rule hono uses for the fleetsync folder name.
export const fleetsyncOrgFolder = (organization: string) => organization.replace(/[^a-zA-Z0-9-_]/g, '_')

export function uploadAuthHeader(): Record<string, string> {
  const signed = signUploadToken('pictusweb')
  return signed ? { Authorization: `Bearer ${signed.token}` } : {}
}
