import { NextRequest, NextResponse } from 'next/server'
import db from '@/db/db'
import { recordViolation } from '@/lib/ipReputation'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const contactLog = await db.contactLog.findUnique({
      where: { id },
    })

    if (!contactLog) {
      return NextResponse.json(
        { error: 'Contact log not found' },
        { status: 404 },
      )
    }

    if (!contactLog.ipAddress || contactLog.ipAddress === 'Unknown') {
      return NextResponse.json(
        { error: 'No valid IP address to ban' },
        { status: 400 },
      )
    }

    // Log to BotLog so it shows up in bot detection history
    await db.botLog.create({
      data: {
        name: contactLog.name,
        email: contactLog.email,
        phone: contactLog.phone,
        message: contactLog.message,
        userAgent: contactLog.userAgent,
        ipAddress: contactLog.ipAddress,
        timeSpent: contactLog.timeSpent,
        detectionType: 'manual-review',
        detectionDetails: `Manually marked as spam from ContactLog #${contactLog.id}`,
        locale: contactLog.locale,
        origin: contactLog.origin,
      },
    })

    // Record violation in IP reputation (triggers ban)
    const violationResult = await recordViolation(
      contactLog.ipAddress,
      'manual-review',
      `Admin manually marked contact submission as spam (ContactLog #${contactLog.id})`,
    )

    return NextResponse.json({
      success: true,
      message: `IP ${contactLog.ipAddress} has been banned`,
      ipReputation: {
        violations: violationResult.violations,
        isBanned: violationResult.isBanned,
        banMessage: violationResult.banMessage,
      },
    })
  } catch (error) {
    console.error('Error marking as spam:', error)
    return NextResponse.json(
      { error: 'Failed to mark as spam' },
      { status: 500 },
    )
  }
}
