import { NextRequest, NextResponse } from 'next/server'
import db from '@/db/db'
import { recordViolation } from '@/lib/ipReputation'
import { checkIPBan } from '@/lib/checkIPBan'

export async function POST(request: NextRequest) {
  try {
    // Check if IP is banned first
    const ipCheck = await checkIPBan(request)
    if (ipCheck.isBanned && ipCheck.banInfo) {
      return NextResponse.json(
        {
          error: 'Access Denied',
          message: ipCheck.banInfo.message,
          code: 'IP_BANNED',
        },
        { status: 403 },
      )
    }

    const body = await request.json()

    const {
      name,
      email,
      phone,
      message,
      honeypot,
      detectionType,
      detectionDetails,
      locale,
      origin,
      timeSpent,
    } = body

    // Get user agent and IP address from request headers
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'Unknown'

    // Create bot log entry in database
    const botLog = await db.botLog.create({
      data: {
        name: name || null,
        email: email || null,
        phone: phone || null,
        message: message || null,
        honeypot: honeypot || null,
        userAgent,
        ipAddress,
        timeSpent: timeSpent || null,
        detectionType,
        detectionDetails: detectionDetails || null,
        locale: locale || null,
        origin: origin || null,
      },
    })

    // Log to console
    console.log('🤖 BOT ATTEMPT DETECTED:', {
      id: botLog.id,
      timestamp: new Date().toISOString(),
      detectionType,
      detectionDetails,
      ipAddress,
      userAgent,
      origin,
    })

    // Record IP violation and get ban status (skip in localhost)
    const isLocalhost = (process.env.NEXT_PUBLIC_HONO_API_URL || '').includes('localhost')

    if (isLocalhost) {
      console.log('🔓 DEV MODE: Skipping violation recording for', ipAddress)
      return NextResponse.json(
        {
          success: true,
          message: 'Bot attempt logged successfully (dev mode - no ban)',
          logId: botLog.id,
          isDevelopmentMode: true,
        },
        { status: 201 },
      )
    }

    const violationResult = await recordViolation(ipAddress, detectionType, detectionDetails)

    return NextResponse.json(
      {
        success: true,
        message: 'Bot attempt logged successfully',
        logId: botLog.id,
        ipReputation: {
          violations: violationResult.violations,
          isBanned: violationResult.isBanned,
          banMessage: violationResult.banMessage,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error logging bot attempt:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to log bot attempt',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
