import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true, phoneVerified: true, phoneNumber: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      emailVerified: user.emailVerified?.toISOString() ?? null,
      phoneVerified: user.phoneVerified?.toISOString() ?? null,
      phoneNumber: user.phoneNumber ?? null,
    })
  } catch (error) {
    console.error('Contact status error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
