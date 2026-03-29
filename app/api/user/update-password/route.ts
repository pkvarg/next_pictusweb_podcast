import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { hashPassword } from '@/lib/isValidPassword'
import { checkIPBan } from '@/lib/checkIPBan'

export async function POST(request: NextRequest) {
  try {
    // Check if IP is banned
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

    const { email, newPassword } = await request.json()

    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Email and new password are required' }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: {
        email: email,
        deletedAt: null,
        active: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, message: 'Password updated successfully' }, { status: 200 })
  } catch (error) {
    console.error('Password update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
