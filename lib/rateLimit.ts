import { NextResponse } from 'next/server'

interface RateLimitOptions {
  key: string
  maxAttempts: number
  windowMs: number
  /** When true, only check the current count without recording a new attempt */
  checkOnly?: boolean
}

interface RateLimitResult {
  success: boolean
  remaining: number
  retryAfterMs: number
}

// In-memory sliding window store: key → array of timestamps
const store = new Map<string, number[]>()

// Auto-cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, timestamps] of store) {
      const filtered = timestamps.filter((t) => t > now - 60 * 60 * 1000) // keep up to 1h
      if (filtered.length === 0) {
        store.delete(key)
      } else {
        store.set(key, filtered)
      }
    }
  }, 5 * 60 * 1000)
}

/**
 * Sliding-window rate limiter.
 *
 * By default, records a new attempt AND checks the limit.
 * With `checkOnly: true`, only checks without recording (useful for verify endpoints
 * where you want to check first, then record only on failure).
 */
export function rateLimit({ key, maxAttempts, windowMs, checkOnly = false }: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const windowStart = now - windowMs

  // Get or create the timestamps array
  let timestamps = store.get(key) || []

  // Remove expired entries outside the window
  timestamps = timestamps.filter((t) => t > windowStart)

  if (!checkOnly) {
    timestamps.push(now)
  }

  store.set(key, timestamps)

  const count = timestamps.length
  const success = count <= maxAttempts
  const remaining = Math.max(0, maxAttempts - count)

  // Calculate retry-after based on oldest entry in the window
  let retryAfterMs = 0
  if (!success && timestamps.length > 0) {
    const oldestInWindow = timestamps[0]
    retryAfterMs = oldestInWindow + windowMs - now
  }

  return { success, remaining, retryAfterMs }
}

/**
 * Returns a 429 NextResponse with Retry-After header and JSON body.
 */
export function rateLimitResponse(retryAfterMs: number): NextResponse {
  const retryAfterSeconds = Math.ceil(retryAfterMs / 1000)
  return NextResponse.json(
    { error: 'rate_limit_exceeded', retryAfter: retryAfterSeconds },
    {
      status: 429,
      headers: { 'Retry-After': String(retryAfterSeconds) },
    },
  )
}

/**
 * Extract client IP from request headers.
 */
export function getClientIP(headersList: Headers): string {
  return (
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    'unknown'
  )
}
