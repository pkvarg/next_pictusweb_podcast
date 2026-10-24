import { NextRequest } from 'next/server'

// CSRF defense for cookie-authenticated, state-changing requests. Browsers always send an Origin
// header on POST/PUT/DELETE, so a cross-site (CSRF) attempt arrives with a foreign Origin. A missing
// Origin (non-browser client, or same-origin GET) is allowed; the session cookie's SameSite=Lax is the
// backstop in that case.
export function sameOriginOk(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true
  const host = request.headers.get('host')
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}
