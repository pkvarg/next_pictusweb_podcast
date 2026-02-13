// Server-side IP ban checker
// This runs in Node.js runtime (not edge), so it can access Prisma/PostgreSQL

import { NextRequest } from 'next/server'
import { isIPBanned, getBanInfo } from './ipReputation'

/**
 * Check if we're in development mode (localhost)
 */
function isLocalhost(): boolean {
  const honoApiUrl = process.env.NEXT_PUBLIC_HONO_API_URL || ''
  return honoApiUrl.includes('localhost')
}

/**
 * Check if request IP is banned
 * Use this in API routes and server components
 * Skips bot protection when HONO_API_URL contains "localhost"
 */
export async function checkIPBan(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'

  // Skip bot protection in localhost development
  if (isLocalhost()) {
    console.log(`🔓 DEV MODE: Skipping IP ban check for ${ip}`)
    return {
      isBanned: false,
      ip,
      isDevelopmentMode: true,
    }
  }

  const banned = await isIPBanned(ip)

  if (banned) {
    const banInfo = await getBanInfo(ip)
    console.log(`🚫 BLOCKED REQUEST from banned IP: ${ip}`, banInfo)
    return {
      isBanned: true,
      ip,
      banInfo,
    }
  }

  return {
    isBanned: false,
    ip,
  }
}
