import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { checkIPBan } from '@/lib/checkIPBan'

export async function POST(request: NextRequest) {
  try {
    // Check if IP is banned (prevents email enumeration attacks)
    const ipCheck = await checkIPBan(request)
    if (ipCheck.isBanned && ipCheck.banInfo) {
      return NextResponse.json(
        {
          error: 'Access Denied',
          message: ipCheck.banInfo.message,
        },
        { status: 403 },
      )
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: {
        email: email,
        deletedAt: null,
        active: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    })

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({ exists: false }, { status: 200 })
    }

    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || email

    return NextResponse.json({ exists: true, name }, { status: 200 })
  } catch (error) {
    console.error('Email check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
