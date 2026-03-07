import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'

const prisma = new PrismaClient()

const TRUST_DAYS = 10

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const { userId, deviceToken } = await request.json()

    if (!userId || !deviceToken) {
      return NextResponse.json({ trusted: false })
    }

    const deviceHash = hashToken(deviceToken)

    const record = await prisma.trustedDevice.findFirst({
      where: {
        userId,
        deviceHash,
        expiresAt: { gt: new Date() },
      },
    })

    if (!record) {
      return NextResponse.json({ trusted: false })
    }

    // Rolling expiry: extend by TRUST_DAYS on each successful check
    await prisma.trustedDevice.update({
      where: { id: record.id },
      data: { expiresAt: new Date(Date.now() + TRUST_DAYS * 24 * 60 * 60 * 1000) },
    })

    return NextResponse.json({ trusted: true })
  } catch (error: any) {
    console.error('Check device trust error:', error)
    return NextResponse.json({ trusted: false })
  }
}
